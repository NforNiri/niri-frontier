# Niri's Frontier — Claude Project Context

## What this is
A 3D interactive space portfolio website. The player flies a spaceship around a neon-lit alien world and discovers portfolio zones. Built with Three.js + Rapier physics + Vite.

## Current Phase
**Phases 0–3 are complete.** The project is a working, shippable 3D portfolio.
Next up: Phase 4 (post-MVP) — real content in panels, custom ship model, polish passes.

## Tech Stack
- **Renderer:** Three.js (WebGL, bloom post-processing)
- **Physics:** @dimforge/rapier3d (WASM, hover vehicle + pushable objects)
- **Bundler:** Vite — `publicDir: 'static'` (assets live in `/static`, not `/public`)
- **Animation:** GSAP
- **Audio:** Howler.js
- **Camera:** camera-controls
- **3D Assets:** Kenney Space Kit (OBJ+MTL format) in `static/models/spacekit/obj/`

## Key Architecture
```
sources/Experience/
  Experience.js       ← Singleton, priority-based update loop
  Renderer.js         ← Quality toggle (HIGH/LOW)
  Camera.js           ← CameraControls, cinematicFlyover(), vehicle tracking
  Physics.js          ← Rapier world, gravity -5
  Controls.js         ← WASD + mobile virtual joystick
  Audio.js            ← Howler.js, 9 sound types, graceful fallback
  LoadingScreen.js    ← Progress bar, LAUNCH button, cinematic intro
  Utils/
    Resources.js      ← OBJ+MTL loader: MTLLoader.setPath(basePath) pattern
    EventEmitter.js
  Vehicle/
    PhysicalVehicle.js  ← Rapier body, mass 200, hover spring, targetHeight 2.0
    VisualVehicle.js    ← Three.js mesh synced to physics body
  World/
    World.js            ← Orchestrator, spawnVehicle() on physics ready
    WorldDressing.js    ← 95+ Kenney model instances across 7 zone clusters
    Environment.js      ← Directional 2.5, fill, ambient 1.2, hemisphere 0.6
    Zone.js             ← 7 zones: About, Dev, GenAI, Creative, Contact, Resume, BTS
    NeonRoad.js         ← 7 CatmullRom spline routes + edge glow
    NeonLights.js       ← 33 point lights + 16 emissive strips
    Vegetation.js       ← 24 alien trees + 500 instanced grass (GPU wind shader)
    InteractiveObjects.js ← 15 pushable crates + 8 collectible orbs
  UI/
    GameMenu.js         ← ESC menu: teleport, settings, controls guide
    panels/             ← One panel per zone (AboutPanel, DevPanel, etc.)
```

## Update Priority Order
0. Camera | 1. Physics | 2. Vehicle physics | 3. Visual vehicle | 4. Zones | 5. Audio | 6. Interactive objects | 7. Animated systems

## Critical Notes
- OBJ loading: always use `MTLLoader.setPath(basePath)` then `.load(filename)` — never full path in load()
- Multi-material meshes: always check `Array.isArray(child.material)` before cloning
- Vite config MUST have `publicDir: 'static'` or models won't load in production
- Physics forces scaled for 400:1 mass ratio (ship 200, pushables 0.5)

## Zone Locations (approx x, z)
- ABOUT (Command Center): (-20, -20)
- DEV (Engineering Bay): (20, -20)
- GEN AI (Research Lab): (0, -40)
- CREATIVE (Launch Pad): (-25, 20)
- CONTACT (Comms Array): (25, 20)
- RESUME (Mining Outpost): (0, 30)
- BTS (Behind Scenes Lab): (35, -60)

## What's NOT done yet (Phase 4)
- Real portfolio content in panels (placeholder text currently)
- Custom spaceship + alien character model (using placeholder geometry)
- Vercel deployment verification
- Performance profiling on mobile
