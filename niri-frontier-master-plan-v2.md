# 🚀 Niri Levy — Space Portfolio: Master Execution Plan v2

## The Vision

An alien pilot in a small spaceship explores a futuristic neon-lit landscape — discovering interactive zones that showcase Niri Levy's work, skills, and passion for gaming. Built with Three.js + Rapier physics, inspired by Bruno Simon's folio-2025 (MIT licensed), but with a completely different identity.

**The message to gaming companies:**
"I built a playable 3D world from scratch. I manage complex projects. I think in systems. And I have the passion to prove it."

---

## Theme: "Niri's Frontier"

### Visual Identity
- **Setting:** A floating futuristic landscape in space — think low-poly planets, neon-lit platforms, glowing pathways, holographic signage
- **Vehicle:** A small, cute spaceship with an adorable alien character popping out from the top (think Grogu-meets-Kerbal energy)
- **Palette:**

| Role | Color | Hex |
|---|---|---|
| Deep space background | Near-black blue | `#0A0E1A` |
| Platform/ground | Dark slate with glow | `#1A1F3A` |
| Primary neon | Electric cyan | `#00F0FF` |
| Secondary neon | Hot magenta/pink | `#FF2D78` |
| Accent warm | Neon amber/gold | `#FFB800` |
| Text/UI light | Soft white | `#E8ECF1` |
| Success/go | Neon green | `#39FF14` |

- **Atmosphere:** Stars in the background, subtle nebula fog, floating particles, lens flare from neon lights
- **Typography:** Orbitron (display/headings) + Space Grotesk or Exo 2 (body) — sci-fi but readable
- **UI Style:** Glassmorphism panels with neon borders, HUD-like elements, holographic feel

### Audio Concept
- Ambient space synth hum (low, atmospheric)
- Spaceship engine whir (pitch-shifted by speed)
- Neon buzz when entering zones
- Satisfying UI click sounds
- Optional: lo-fi space beats

---

## Tech Stack

| Layer | Tool | Notes |
|---|---|---|
| 3D Rendering | Three.js (WebGL, WebGPU later) | Core renderer |
| Physics | Rapier 3D (WASM) | Vehicle + object physics |
| 3D Models | Meshy AI + Blender + Kenney Space Kit | AI-generated + free assets + manual polish |
| Bundler | Vite | With WASM plugins |
| Animation | GSAP | UI panels, intro sequence |
| Audio | Howler.js | Spatial audio, ambient |
| Camera | camera-controls | Follow-cam on spaceship |
| IDE | Google Antigravity | Agent-first coding |
| Deploy | Vercel | Auto-deploy from GitHub |
| Version Control | Git + GitHub | Connected to Antigravity |

---

## 3D Asset Pipeline

### Strategy: AI-First, Blender-Polish

For each asset, follow this pipeline:

```
Concept (text/image prompt)
    ↓
Meshy AI (text-to-3D, low-poly mode)  ← Free: 100 credits/month
    ↓
Download GLB
    ↓
Blender cleanup (optimize topology, fix UVs, adjust scale)
    ↓
Export compressed GLB → /static/models/
```

### AI 3D Tools Ranked for This Project

1. **Meshy AI (meshy.ai)** — BEST CHOICE
   - Free tier: 100 credits/month
   - Has "Low Poly Mode" specifically for game assets
   - Exports GLB directly
   - Text-to-3D and Image-to-3D
   - Blender plugin available
   - Prompts like: "low-poly cute spaceship, stylized, game-ready, neon blue accents"

2. **Tripo (tripo3d.ai)** — BACKUP
   - Free tier available
   - Good for characters (your alien!)
   - GLB export
   - Better for organic shapes

3. **Kenney Space Kit (kenney.nl/assets/space-kit)** — FREE STARTER ASSETS
   - 150 space-themed assets, CC0 licensed (no attribution needed)
   - Includes: rockets, satellites, planets, space stations, terrain
   - Perfect for populating the world quickly
   - Download immediately, no credits needed

4. **Quaternius (quaternius.com)** — FREE ASSET PACKS
   - CC0 licensed low-poly packs
   - Sci-fi and space themed options available

### Asset List for MVP

| Asset | Source | Priority |
|---|---|---|
| Spaceship (player vehicle) | Meshy AI → Blender polish | P0 |
| Alien character (popping from ship) | Meshy AI or Tripo → Blender | P0 |
| Ground/platform terrain | Blender (manual, simple geometry) | P0 |
| Neon road/pathway strips | Blender (emissive planes) | P0 |
| Zone markers (holographic pillars) | Blender (simple + shader glow) | P1 |
| Floating rocks/asteroids | Kenney Space Kit + Meshy | P1 |
| Tech gadgets (decorative) | Meshy AI "sci-fi prop" prompts | P2 |
| Space station pieces | Kenney Space Kit | P2 |
| Skybox / star field | Shader-generated (no model needed) | P0 |
| Neon signs (zone labels) | Blender text → emissive material | P1 |
| Crates/barrels (pushable) | Kenney Space Kit or Meshy | P2 |
| Trees/crystals (alien flora) | Meshy AI "alien crystal formation" | P2 |

---

## Project Phases (Detailed)

### PHASE 0: Foundation — "First Flight" (Week 1)
**Goal:** Spaceship flying on a flat neon platform in space.

#### Task 0.1: Project Scaffold
```
Antigravity prompt:
"Create a new Vite project with vanilla JS. Install: three, @dimforge/rapier3d, 
gsap, howler, camera-controls, vite-plugin-wasm, vite-plugin-top-level-await.

Configure vite.config.js with wasm and top-level-await plugins.

Create folder structure:
/sources
  /Experience
    Experience.js       ← Singleton, game loop manager
    Renderer.js         ← Three.js WebGL renderer
    Camera.js           ← Follow-cam
    Physics.js          ← Rapier world
    Controls.js         ← Keyboard/touch input
    Time.js             ← Delta time, elapsed time
    Sizes.js            ← Window resize handler
  /Vehicle
    PhysicalVehicle.js  ← Rapier rigid body + wheels
    VisualVehicle.js    ← Three.js mesh synced to physics
  /World
    World.js            ← Scene manager
    Environment.js      ← Lights, fog, skybox
    Ground.js           ← Platform collider + visual
    Zone.js             ← Interactive trigger area
  /UI
    UI.js               ← DOM overlay manager
    Panel.js            ← Content panel component
  /Utils
    EventEmitter.js     ← Pub/sub events
    Resources.js        ← Asset loader (GLTF, textures, audio)
/static
  /models/
  /textures/
  /sounds/
  /ui/
index.html
style.css (or style.styl)

Reference Bruno Simon's folio-2025 repo (MIT license) at 
github.com/brunosimon/folio-2025 for architectural patterns. 
Write clean original code adapted for a space theme."
```

#### Task 0.2: Rapier Physics Init
```
"Initialize Rapier 3D physics in Physics.js:
- Load the WASM binary with async init
- Create a physics world with gravity (reduced — we're in space, 
  so maybe gravity = { x: 0, y: -5.0, z: 0 } instead of -9.81)
- Create a flat ground collider (large rectangle, position y=0)
- Implement a step() method called each frame with fixed timestep
- Export the world and methods for adding rigid bodies

Reference the folio-2025 Physics setup but adapt for space gravity."
```

#### Task 0.3: Vehicle Physics
```
"Create a spaceship vehicle with Rapier physics in PhysicalVehicle.js:
- Rigid body (dynamic) with mass ~50
- Use Rapier's vehicle controller or 4-point hover system
  (since it's a spaceship, hover pads instead of wheels work better)
- Acceleration on W/Up, deceleration on S/Down
- Steering on A/D or Left/Right
- Optional: slight hover bob animation
- Boost on Shift

For VisualVehicle.js:
- Create a placeholder box mesh (2x1x3 units, cyan wireframe)
- Sync position and rotation to the physics body each frame
- Add a point light under the ship (neon glow effect)

Reference folio-2025's Vehicle code for the physics approach, 
but adapt from wheels to hover mechanics."
```

#### Task 0.4: Camera + Controls
```
"Implement Camera.js:
- Third-person follow camera using camera-controls library
- Position: behind and above the spaceship
- Smooth lerp following (damping)
- Mouse/touch orbit when dragging
- Zoom limits (min: 5, max: 30)

Implement Controls.js:
- Keyboard input: WASD/Arrows for movement, Shift for boost, Space for action
- Track key states (pressed/released)
- Normalize input into a direction vector
- Mobile: simple touch zones (left side = steer, right side = accelerate)
- Emit input events that PhysicalVehicle listens to"
```

#### Task 0.5: Space Environment
```
"Create the space environment in Environment.js:
- Background color: #0A0E1A (deep space blue-black)
- Or better: a simple star field using Three.js Points 
  (1000 random stars, white dots, slight twinkle animation)
- One directional light (slight blue tint, intensity 1.0, 
  casting from upper-right)
- One ambient light (very dim, #1A1F3A, intensity 0.3)
- Subtle fog (color matching background, near: 50, far: 200)
  to fade distant objects
- The ground platform should have an emissive grid pattern
  (think Tron-style neon grid lines on dark surface)"
```

#### Task 0.6: Deploy Pipeline
```
"Set up deployment:
- Initialize git repo
- Create .gitignore (node_modules, dist, .env)
- Add build script in package.json: vite build
- Push to GitHub
- Connect to Vercel (you do this manually in Vercel dashboard)
- Verify: npm run dev works locally, npm run build produces dist/"
```

**Phase 0 Deliverable:** A cyan wireframe box hovers and flies around a neon grid platform in space with stars behind it. Deployed to Vercel. THIS IS YOUR FIRST WIN.

---

### PHASE 1: World & Ship — "Building the Frontier" (Weeks 2-3)
**Goal:** Real spaceship model, terrain, roads, zone areas.

#### 1.1 Generate 3D Assets
Do this yourself in Meshy AI + Blender:

**Spaceship (Meshy AI prompt):**
```
"Cute low-poly cartoon spaceship, small rounded cockpit, 
two small engines on the sides, neon blue glow accents, 
game-ready asset, clean topology, stylized"
```

**Alien character (Meshy AI prompt):**
```
"Adorable small alien character, big eyes, friendly expression, 
sitting pose with arms raised, low-poly stylized, 
green skin with subtle glow, game-ready"
```

**Terrain pieces (Blender):**
- Floating platform islands connected by neon bridges
- Main central island (large, flat-ish with subtle terrain)
- 5-6 smaller platforms for each zone
- Neon-lit pathway strips connecting them

**Decorative props (Kenney Space Kit + Meshy):**
- Download Kenney Space Kit (free, 150 assets)
- Generate extra props with Meshy: "sci-fi holographic terminal", 
  "neon street lamp futuristic", "alien crystal formation glowing"

#### 1.2 Load Models & Build World
```
"Create a Resources.js asset loader that:
- Uses GLTFLoader + DRACOLoader for compressed GLB files
- Loads all models listed in a manifest array
- Emits 'ready' event when all assets loaded
- Shows loading progress (0-100%)

Create World.js that:
- On 'ready', places all models in the scene
- Parses loaded GLTFs — separate visual meshes from collision geometry
  (convention: objects named 'collision_*' become Rapier trimesh colliders,
   everything else is visual only)
- Applies emissive materials to neon elements
- Sets up zone trigger volumes (invisible bounding boxes)"
```

#### 1.3 Visual Vehicle with Real Model
```
"Update VisualVehicle.js:
- Load the spaceship GLB model
- Replace placeholder box with actual model
- Position the alien character on top (child of ship mesh)
- Add idle animation: alien bobs slightly up and down
- Add engine glow: two PointLights at engine positions, 
  cyan color, intensity varies with speed
- Add particle trail: small glowing particles emitted behind 
  engines when moving (use Three.js Points or sprite particles)"
```

#### 1.4 Neon Aesthetic Pass
```
"Add neon visual effects:
- Bloom post-processing (UnrealBloomPass) — makes emissive 
  materials glow and bleed light
- Emissive materials for all neon elements (roads, signs, accents)
- Grid shader on ground platform (animated scrolling grid lines)
- Subtle chromatic aberration at screen edges (optional)
- Tone mapping: ACESFilmicToneMapping for cinematic feel"
```

**Phase 1 Deliverable:** A real spaceship with alien pilot flies around a neon-lit floating platform world with glowing roads and zone areas. The space background has stars and subtle fog.

---

### PHASE 2: Content & Panels — "Mission Briefing" (Weeks 3-4)
**Goal:** All 6 portfolio sections with real content.

#### 2.1 Zone System
```
"Implement Zone.js:
- Each zone is a trigger volume (AABB or sphere)
- When spaceship enters zone → show corresponding UI panel
- When spaceship exits → hide panel (with delay)
- Zones emit enter/exit events
- Add a visual indicator: holographic pillar/beacon at each zone
  that pulses when nearby
- Optional: floating text label above each zone ('ABOUT', 'DEV', etc.)
  using CSS2DRenderer or sprite text"
```

#### 2.2 UI Panel System
```
"Create the panel system in UI.js and Panel.js:
- HTML/CSS overlay on top of the canvas
- Panels slide in from the right (GSAP animation)
- Glassmorphism style: 
  background: rgba(10, 14, 26, 0.85)
  backdrop-filter: blur(20px)
  border: 1px solid rgba(0, 240, 255, 0.3)
  border-radius: 12px
- Neon accent line at top of panel (gradient: cyan → magenta)
- Close button (X) in top-right
- Scrollable content area
- HUD-style header with zone icon + title
- Font: Orbitron for headings, Exo 2 for body text
- Responsive: full-screen on mobile, side panel on desktop"
```

#### 2.3 Content for Each Zone

**ABOUT zone content:**
- Headline: "Niri Levy — Creative Tech Leader"
- Subtitle: "Lead PM & Creative Director at Code and Core"  
- Key strengths as icon cards (strategic thinker, fast executor, no-BS approach)
- Industries: Tech, Gaming, SaaS, Legal, eCommerce, Media, Real Estate
- Fun stats from current portfolio
- Photo or stylized avatar

**DEVELOPMENT zone content:**
- Project showcase grid
- Each project: thumbnail, name, tech stack tags, brief description, links
- Pull projects from your current portfolio
- Filterable by category if many projects

**GEN AI zone content:**
- Tools you work with: Claude, Cursor, Midjourney, etc.
- AI workflow examples
- Automation case studies
- "This portfolio was built using AI tools" meta-showcase

**CREATIVE zone content:**
- Visual gallery (video work, design, art)
- Lightbox-style image viewer
- Reel embeds if available

**CONTACT zone content:**
- Styled as a "transmission console"
- Email, LinkedIn, GitHub links as neon buttons
- Optional: simple contact form
- "Send Transmission" instead of "Send Message"

**RESUME zone content:**
- Interactive timeline (horizontal scroll or vertical)
- Key career milestones
- Skills radar chart or tag cloud
- Download PDF button ("Download Mission File")

#### 2.4 Implement Each Panel
Feed each zone's content to Antigravity one at a time. Example:
```
"Create the About panel in /sources/UI/panels/AboutPanel.js:
- HTML structure with the content I'll provide
- Styled with our glassmorphism space theme
- GSAP entrance animation (slide from right, fade in, stagger children)
- Close button triggers GSAP exit animation
- Responsive layout
[paste actual content here]"
```

**Phase 2 Deliverable:** Complete portfolio with all 6 sections. Flying into a zone opens a beautifully styled panel with real content. This is a PRESENTABLE portfolio.

---

### PHASE 3: Polish — "Final Frontier" (Weeks 4-5)
**Goal:** Professional-grade finish.

#### 3.1 Loading Screen
```
"Create a loading screen:
- Full-screen overlay with space background
- 'NIRI'S FRONTIER' title in Orbitron font
- Neon loading bar showing asset load progress
- Subtle star animation in background
- When loaded: bar fills, text changes to 'LAUNCH' button
- On click: GSAP animation fades loading screen, 
  camera does a cinematic flyover of the world,
  then smoothly transitions to follow the spaceship"
```

#### 3.2 Sound Design
```
"Implement audio using Howler.js:
- Ambient space hum (loop, low volume, plays always)
- Spaceship engine: loop, volume/rate scales with speed
- Boost sound: short whoosh on Shift press
- Zone enter: sci-fi 'scan' chime
- UI sounds: panel open/close, button hover/click
- All sounds loaded via Resources.js
- Mute toggle (M key or UI button)
- Start muted (browser autoplay policy), 
  unmute on first user interaction"
```

Source free sounds from:
- freesound.org (CC0 space/sci-fi sounds)
- kenney.nl (UI sound packs, CC0)
- Generate with ElevenLabs sound effects or similar AI tools

#### 3.3 Interactive Objects
```
"Add physics-enabled objects:
- Floating crates that the spaceship can push (Rapier dynamic bodies)
- Space debris that scatters on collision
- Maybe a small asteroid field area with destructible rocks
- Easter eggs: hidden collectibles (small glowing orbs?)
- When collectible is touched, particle burst + sound effect"
```

#### 3.4 Performance & Mobile
```
"Optimize performance:
- Quality toggle: High (bloom + particles + shadows) 
  vs Low (no bloom, fewer particles, no shadows)
- Auto-detect: if mobile or low FPS, switch to Low
- Texture compression: convert PNG/JPG to WebP for UI, 
  KTX2 for 3D textures
- Frustum culling (Three.js does this by default)
- LOD for distant objects if needed
- Dispose unused geometries/materials
- Mobile touch controls: 
  Left thumb = virtual joystick for steering
  Right thumb area = tap to boost
  Pinch = zoom camera"
```

#### 3.5 Behind the Scenes Zone (BONUS — highly recommended)
```
"Add a 'Behind the Scenes' zone:
- Documents how you built this portfolio
- Tech stack used (Three.js, Rapier, Meshy AI, Antigravity, Claude)
- Process screenshots/GIFs
- What you learned
- Links to the devlog if you make one
This is GOLD for gaming company interviews."
```

**Phase 3 Deliverable:** Polished, shippable, impressive 3D portfolio.

---

### PHASE 4: Roadmap (Post-MVP)
Future enhancements to keep building:
- [ ] Custom alien character animations (wave, dance, point)
- [ ] Day/night cycle (neon glows brighter at "night")
- [ ] Weather system (meteor showers, nebula clouds)
- [ ] Achievement system ("Visited all zones", "Found all easter eggs")
- [ ] Minimap
- [ ] Race track / time trial easter egg
- [ ] Visitor whispers / guestbook
- [ ] WebGPU renderer upgrade
- [ ] Multiplayer (see other visitors as ships)
- [ ] VR mode
- [ ] Custom soundtrack (commission or AI-generate)
- [ ] Analytics (which zones get visited, avg time on site)
- [ ] Blog zone
- [ ] Localization (Hebrew + English)

---

## Workflow: How to Execute

### Your Setup Checklist
- [ ] Install Google Antigravity (antigravity.google/download)
- [ ] Connect GitHub account in Antigravity
- [ ] Create new GitHub repo: `niri-frontier` (or name of your choice)
- [ ] Clone repo in Antigravity
- [ ] Sign up for Meshy AI free tier (meshy.ai)
- [ ] Download Kenney Space Kit (kenney.nl/assets/space-kit)
- [ ] Have Blender installed (blender.org)
- [ ] Set up Vercel project connected to your GitHub repo

### Daily Workflow
```
1. Come to Claude.ai → Discuss what phase/task you're on
2. Get the prompt for Antigravity → Copy it
3. Open Antigravity → Paste prompt as agent task
4. Review the agent's work → Approve or give feedback
5. Test locally (npm run dev) → Check in browser
6. Git commit + push → Auto-deploys to Vercel
7. Come back to Claude.ai → Report progress, get next task
```

### Antigravity Settings Recommendation
- Mode: **Review-driven development** (agent proposes, you approve)
- Model: **Claude Sonnet 4.6** (supported in Antigravity, great for code)
- Always tell the agent to reference folio-2025 architecture
- One task at a time — don't overload the agent with multiple tasks

### When to Come Back Here (Claude.ai)
- Architecture decisions ("should I use X or Y approach?")
- Debugging complex issues (physics not working, shaders broken)
- Design direction ("does this look right?")
- Content writing (panel text, section copy)
- Next task planning
- Blender guidance
- Prompt crafting for Meshy AI

---

## Key Prompts for Meshy AI

Save these — use them when generating your 3D assets:

### Spaceship
```
"Cute cartoon low-poly spaceship, rounded cockpit dome on top, 
two small jet engines on sides, compact body, neon cyan accent 
lines on edges, dark grey base color, game-ready, stylized, 
clean topology, under 5000 polygons"
```

### Alien Character  
```
"Adorable small alien character, oversized round head, 
big friendly glowing eyes, small body, sitting pose with 
one arm waving, light green skin, subtle bioluminescent spots, 
low-poly stylized, game-ready character"
```

### Holographic Terminal (zone marker)
```
"Futuristic holographic display terminal, floating screen 
with sci-fi UI elements, thin pedestal base, neon blue glow, 
low-poly game asset, clean geometry, transparent screen effect"
```

### Alien Crystal
```
"Alien crystal formation, cluster of geometric crystals 
growing from small rock base, glowing purple and cyan colors, 
bioluminescent, low-poly stylized, game environment prop"
```

### Neon Street Lamp
```
"Futuristic neon street lamp, sleek metallic pole, 
glowing cyan ring light at top, minimalist sci-fi design, 
low-poly game asset, dark metal with neon accents"
```

---

## First Session Plan

When you're ready to start, here's exactly what to do:

### Session 1 (2-3 hours):
1. Create GitHub repo `niri-frontier`
2. Open in Antigravity
3. Run Phase 0, Task 0.1 (project scaffold)
4. Run Phase 0, Task 0.2 (Rapier physics init)
5. Verify: page loads, no errors, physics world exists
6. Commit + push → check Vercel deploys

### Session 2 (2-3 hours):
1. Run Phase 0, Task 0.3 (vehicle physics)
2. Run Phase 0, Task 0.4 (camera + controls)
3. Verify: you can fly a box around!
4. Commit + push

### Session 3 (2-3 hours):
1. Run Phase 0, Task 0.5 (space environment)
2. Add stars, lighting, neon grid
3. Verify: it LOOKS like space now
4. Commit + push → Phase 0 DONE! 🎉

### Session 4 (parallel):
1. Sign up for Meshy AI
2. Generate spaceship + alien models
3. Download Kenney Space Kit
4. Import into Blender, clean up, export GLBs
5. This runs parallel to Phase 1 coding

---

## Success Metrics

How you'll know each phase is done:

| Phase | "Done" means... |
|---|---|
| Phase 0 | A box flies around a neon platform in space. Deployed to Vercel. |
| Phase 1 | Real spaceship + alien on a beautiful neon world with zones marked. |
| Phase 2 | All 6 content panels work with real portfolio content. |
| Phase 3 | Loading screen, sounds, interactive objects, mobile support. |
| Ship it! | You're comfortable sending the link to a gaming company. |

---

Let's build your frontier, Niri. 🛸
