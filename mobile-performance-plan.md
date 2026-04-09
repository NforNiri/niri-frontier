# Mobile Performance Plan — Niri's Frontier

## Problem
The game is unplayable on mobile devices due to high GPU fragment load, excessive draw calls, per-frame GC allocations, and physics running at 2× speed on 120 Hz phones.

---

## Quick Wins
*Minutes each, massive return. No visual impact.*

### QW-1 — Fix iPad / wide-phone quality detection
**File:** `sources/Experience/Renderer.js` — `detectQuality()` ~line 36

iPads in landscape (1024px wide) and wide phones pass the current `width < 768` check as desktop, landing on `quality='high'` with bloom and pixel ratio 2.

```js
// BEFORE
const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768;

// AFTER
const isMobile = navigator.maxTouchPoints > 1 ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    window.innerWidth < 1024;
```
**Gain:** All phones + tablets land on `quality='low'` — no bloom, no shadows, PR=1. 4–6× fragment reduction on Retina phones that were running high quality.

---

### QW-2 — Cap pixel ratio at 1.5
**File:** `sources/Experience/Sizes.js` ~line 13

PR=2 means 4× the fragments of PR=1. Users can't tell the difference at arm's length.

```js
// BEFORE
this.pixelRatio = Math.min(window.devicePixelRatio, 2);

// AFTER
this.pixelRatio = Math.min(window.devicePixelRatio, 1.5);
```
**Gain:** ~45% fewer fragments on 2× and 3× screens.

---

### QW-3 — Hide StatsGL in production
**File:** `sources/Experience/Experience.js` ~line 65

StatsGL runs overhead every frame and adds a DOM overlay unconditionally.

```js
// BEFORE
this.stats = new StatsGL({ container: document.body });

// AFTER
if (import.meta.env?.DEV) {
    this.stats = new StatsGL({ container: document.body });
}
```
**Gain:** Free — removes stats computation and DOM overhead in production.

---

### QW-4 — Reduce NeonLights to 7 on mobile
**File:** `sources/Experience/World/NeonLights.js` — `createZoneLights()`

31 always-active point lights. Mobile GPU caps at ~8 lights per draw call and silently drops the rest — they still cost sort time.

```js
// At top of createZoneLights(), filter to primary zone anchors only on mobile
const quality = this.experience.renderer.quality;
// keep only lights with intensity >= 2 on low quality (~7 anchor lights)
```
**Gain:** 31 → 7 lights. ~30% CPU scene sort time reduction on mobile.

---

### QW-5 — Remove 8 collectible PointLights on mobile
**File:** `sources/Experience/World/InteractiveObjects.js` — `createCollectibles()` ~line 129

Each orb has a `PointLight`. They already glow via `emissiveIntensity: 2.0` — the lights are redundant on mobile.

```js
if (this.experience.renderer.quality === 'high') {
    const light = new THREE.PointLight(0x39FF14, 2, 8);
    group.add(light);
}
```
**Gain:** 8 fewer dynamic lights.

---

## Medium Effort
*30 min – 2 hrs each. Highest impact items.*

### ME-1 — Stop material cloning in WorldDressing
**File:** `sources/Experience/World/WorldDressing.js` — `cloneModel()` ~line 82

104 `place()` calls each clone all child materials → ~300 unique material objects. Three.js cannot batch draw calls across different material instances, even if they're functionally identical.

```js
cloneModel(name, scale = 1) {
    const model = this.resources.items[name];
    if (!model) return null;
    const clone = model.clone();
    clone.scale.set(scale, scale, scale);
    clone.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            // DO NOT clone materials — share originals for static props
        }
    });
    return clone;
}
```
**Gain:** ~300 → ~42 unique materials. ~50% draw call reduction for WorldDressing geometry (200–350 → 100–150 draw calls).

---

### ME-2 — Eliminate per-frame heap allocations
**Files:** `sources/Experience/Vehicle/PhysicalVehicle.js` ~line 63, `sources/Experience/Vehicle/VisualVehicle.js` ~line 322

~10–110 `new THREE.Vector3` / `new THREE.Quaternion` / `.clone()` calls every frame in the hot physics/visual update path. On mobile V8 with limited headroom, these trigger GC pauses — the primary cause of dropped frames.

**Fix:** Promote scratch objects to class-level in constructor:

```js
// PhysicalVehicle constructor
this._scratchForward = new THREE.Vector3();
this._scratchQuat = new THREE.Quaternion();

// VisualVehicle constructor
this._scratchTiltEuler = new THREE.Euler();
this._scratchTiltQuat = new THREE.Quaternion();
this._scratchFinalQuat = new THREE.Quaternion();
this._scratchHeadForward = new THREE.Vector3();
this._scratchBackward = new THREE.Vector3();
this._scratchLeftPos = new THREE.Vector3();
this._scratchRightPos = new THREE.Vector3();
this._scratchCenterPos = new THREE.Vector3();
this._scratchVelocity = new THREE.Vector3();
```

In `updateParticles`, replace:
```js
// BEFORE
particle.position.add(particle.velocity.clone().multiplyScalar(delta / 1000));

// AFTER
this._scratchVelocity.copy(particle.velocity).multiplyScalar(delta / 1000);
particle.position.add(this._scratchVelocity);
```
**Gain:** Stops GC-triggering allocations. Eliminates the most common source of frame drops on mobile.

---

### ME-3 — Fix physics accumulator (120 Hz devices)
**File:** `sources/Experience/Physics.js` — `step()`

`world.step()` is called every `requestAnimationFrame`. On 120 Hz iPhones physics runs at 2× speed — ships fly, springs overshoot. Also runs Rapier WASM 120× per second.

```js
// Physics constructor
this._accumulator = 0;
this._fixedStep = 1000 / 60; // 16.67ms

// step()
step() {
    if (!this.world) return;
    const delta = this.experience.time.delta;
    this._accumulator += delta;
    let steps = 0;
    while (this._accumulator >= this._fixedStep && steps < 2) {
        this.world.step();
        this._accumulator -= this._fixedStep;
        steps++;
    }
}
```
**Gain:** Fixes physics correctness on 120 Hz. Halves WASM physics load on ProMotion devices.

---

### ME-4 — Disable SpotLights on mobile
**File:** `sources/Experience/Vehicle/VisualVehicle.js` — `createHeadlights()`

SpotLights are the most expensive light type. The emissive lens discs already give the headlight glow visually.

```js
if (this.experience.renderer.quality === 'high') {
    this.leftSpot = new THREE.SpotLight(...);
    // ... setup ...
} else {
    this.leftSpot = null;
    this.rightSpot = null;
}
// Guard target update in update(): if (this.leftSpot) { ... }
```
**Gain:** Removes 2 SpotLights on mobile. 5–10% fragment shader reduction in lit areas near ship.

---

### ME-5 — Remove canopy shadow casting + fix sway
**File:** `sources/Experience/World/Vegetation.js` — `createTree()` ~line 138, `update()` ~line 316

**Problem A:** 45 trees × ~3 canopies = 135 small shadow-casting spheres in the depth pass.
**Problem B:** `canopy.position.x` mutated every frame → scene graph dirty → bounding sphere recomputed 135× per frame.

```js
// createTree() — remove castShadow from canopies (line 138)
// canopy.castShadow = true;  ← delete this line

// update() — replace position mutation with rotation
for (const tree of this.trees) {
    const sway = Math.sin(t * 1.2 + tree.phase) * 0.04;
    tree.group.rotation.z = sway;  // 1 dirty flag instead of 3 per canopy
}
```
**Gain:** 135 fewer shadow depth pass objects. Scene graph dirty reduced from ~135/frame to 45/frame.

---

### ME-6 — Reduce grass to 1,500 blades on mobile
**File:** `sources/Experience/World/Vegetation.js` — `createGrass()` ~line 151

One line change. 3,500 instanced blades is a single draw call but vertex shader still runs per blade.

```js
const bladeCount = this.experience.renderer.quality === 'low' ? 1500 : 3500;
```
**Gain:** 57% fewer vertex shader invocations for grass. Invisible at viewing distance.

---

## Bigger Work
*Future sessions — architecture changes.*

### BW-1 — Proper 3-tier quality system (high / medium / low)
Currently binary: high (desktop) or low (mobile). Mid-range phones (2021–2023) get either over-taxed high or stripped low.
- **Medium profile:** PR=1, shadows off, bloom off, 15 lights, 2,000 grass, no canopy shadows, SpotLights replaced with PointLights
- Pass `quality` into each subsystem constructor
- Cycle quality toggle through 3 states

---

### BW-2 — InstancedMesh for repeated static models
`rocksSmallA` ×10, `rocksSmallB` ×10, `machineGenerator` ×5, `machineWireless` ×5, `corridor` ×4 — 34 placements = 34 draw calls. With `InstancedMesh` these become 1 draw call per model type.
**Gain:** WorldDressing draw calls 200+ → 50. Largest possible single win.

---

### BW-3 — Distance-based light culling
Only lights within 60 units of the ship are active. At any play moment, only 2–3 zones are in range.
**Gain:** 31 always-on lights → 9–12 active. ~20% fragment shader reduction.

---

### BW-4 — Merge NeonRoad geometry
7 road surfaces + 14 edge strips + 8 junction pads = 29 Mesh objects, all static. Merge with `THREE.BufferGeometryUtils.mergeGeometries()`.
**Gain:** 29 draw calls → 2–3.

---

## Priority Order

1. **QW-1** — Quality detection fix (gets iPad/wide phones onto mobile mode)
2. **QW-2** — Pixel ratio cap
3. **QW-3** — StatsGL production guard
4. **QW-4** — NeonLights reduction on mobile
5. **QW-5** — Collectible PointLights on mobile
6. **ME-1** — Stop WorldDressing material cloning
7. **ME-2** — Per-frame allocation cleanup
8. **ME-3** — Physics accumulator (120 Hz fix)
9. **ME-4** — SpotLights off on mobile
10. **ME-5** — Canopy shadows + sway fix
11. **ME-6** — Grass blade count on mobile
