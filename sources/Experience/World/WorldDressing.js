import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d';
import Experience from '../Experience.js';

// Exact box half-extents computed from OBJ vertex data at scale=1.
// place() multiplies by the actual scale used.
const COLLIDER_SIZES = {
    // Hangars
    hangarLargeA:       { hx: 1.00, hy: 0.50, hz: 1.50 },
    hangarSmallA:       { hx: 1.00, hy: 0.50, hz: 1.00 },
    hangarRoundA:       { hx: 1.64, hy: 0.75, hz: 1.42 },

    // Corridors
    corridor:           { hx: 0.50, hy: 0.50, hz: 0.50 },
    corridorEnd:        { hx: 0.50, hy: 0.50, hz: 0.25 },

    // Structures
    structureDetailed:  { hx: 0.50, hy: 0.50, hz: 0.50 },
    structureClosed:    { hx: 0.50, hy: 0.50, hz: 0.50 },

    // Machines
    machineGenerator:   { hx: 0.35, hy: 0.20, hz: 0.26 },
    machineWireless:    { hx: 0.38, hy: 0.30, hz: 0.25 },
    machineBarrelLarge: { hx: 0.38, hy: 0.30, hz: 0.38 },

    // Satellites
    satelliteDish:      { hx: 0.34, hy: 0.31, hz: 0.28 },
    satelliteDishLarge: { hx: 0.42, hy: 0.41, hz: 0.37 },

    // Supports & Pipes
    supportsHigh:       { hx: 0.41, hy: 0.50, hz: 0.41 },
    pipeStraight:       { hx: 0.35, hy: 0.30, hz: 0.50 },
    pipeCorner:         { hx: 0.42, hy: 0.30, hz: 0.42 },
    pipeSupportHigh:    { hx: 0.20, hy: 0.50, hz: 0.20 },

    // Turret
    turret:             { hx: 0.30, hy: 0.45, hz: 0.35 },

    // Monorail
    monorailTrack:      { hx: 0.10, hy: 0.07, hz: 0.50 },
    monorailSupport:    { hx: 0.10, hy: 0.25, hz: 0.10 },

    // Vehicles & Rockets
    craftCargo:         { hx: 0.80, hy: 0.40, hz: 1.23 },
    rover:              { hx: 0.15, hy: 0.19, hz: 0.18 },
    rocketBase:         { hx: 0.90, hy: 0.80, hz: 0.90 },

    // platformLarge / platformCorner / gateSimple intentionally omitted:
    // they sit at ground level and their colliders would trap the hovering ship.
    // rocketSides / rocketFins / rocketTop share same position as rocketBase — skip to avoid stacked colliders.
};

export default class WorldDressing {
    constructor() {
        this.experience = Experience.getInstance();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.physics = this.experience.physics;

        this.props = [];
        this.currentZone = 'misc';
        this.placeAll();

        // Debug editor — only active when URL has ?debug=1
        if (new URLSearchParams(window.location.search).get('debug') === '1') {
            this._initDebugEditor();
        }

        console.log('✅ WorldDressing initialized');
    }

    cloneModel(name, scale = 1) {
        const model = this.resources.items[name];
        if (!model) {
            // Silently skip missing models
            return null;
        }
        const clone = model.clone();
        clone.scale.set(scale, scale, scale);
        clone.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (Array.isArray(child.material)) {
                    child.material = child.material.map(m => m.clone());
                } else if (child.material) {
                    child.material = child.material.clone();
                }
            }
        });
        return clone;
    }

    zone(name) {
        this.currentZone = name;
    }

    place(name, x, y, z, scale = 1, rotY = 0) {
        const mesh = this.cloneModel(name, scale);
        if (!mesh) return;
        mesh.position.set(x, y, z);
        mesh.rotation.y = rotY;
        this.scene.add(mesh);
        this.props.push({ mesh, name, x, y, z, scale, rotY, zone: this.currentZone });

        // Add static Rapier box collider if this model has a size definition
        const size = COLLIDER_SIZES[name];
        if (size && this.physics && this.physics.world) {
            const hx = size.hx * scale;
            const hy = size.hy * scale;
            const hz = size.hz * scale;
            const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(x, y + hy, z);
            const body = this.physics.addRigidBody(bodyDesc);
            this.physics.addCollider(RAPIER.ColliderDesc.cuboid(hx, hy, hz), body);
        }
    }

    _initDebugEditor() {
        import('https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm').then(({ default: GUI }) => {
            const gui = new GUI({ title: 'Scene Editor  (?debug=1)' });
            gui.domElement.style.maxHeight = '80vh';
            gui.domElement.style.overflowY = 'auto';

            // Group props by zone
            const byZone = {};
            this.props.forEach((prop, i) => {
                prop.visible = true;
                prop._index = i;
                if (!byZone[prop.zone]) byZone[prop.zone] = [];
                byZone[prop.zone].push(prop);
            });

            const zoneColors = {
                'ABOUT': '#00F0FF', 'DEV': '#FF2D78', 'GEN AI': '#FFB800',
                'CREATIVE': '#39FF14', 'CONTACT': '#FF6600', 'RESUME': '#CC44FF',
                'BTS': '#FFFFFF', 'SPAWN': '#AAAAAA', 'PATHS': '#888888', 'EDGES': '#555555',
            };

            Object.entries(byZone).forEach(([zoneName, zoneProps]) => {
                const zoneFolder = gui.addFolder(`📍 ${zoneName}  (${zoneProps.length})`);
                const col = zoneColors[zoneName];
                if (col) zoneFolder.domElement.querySelector('.title').style.color = col;

                zoneProps.forEach((prop) => {
                    const f = zoneFolder.addFolder(`[${prop._index}] ${prop.name}`);
                    f.add(prop, 'visible').name('👁 Visible').onChange(v => {
                        prop.mesh.visible = v;
                        f.domElement.style.opacity = v ? '1' : '0.4';
                    });
                    f.add(prop, 'x', -120, 120, 0.5).name('X').onChange(v => prop.mesh.position.x = v);
                    f.add(prop, 'y', -10, 30, 0.1).name('Y').onChange(v => prop.mesh.position.y = v);
                    f.add(prop, 'z', -120, 120, 0.5).name('Z').onChange(v => prop.mesh.position.z = v);
                    f.add(prop, 'rotY', -Math.PI, Math.PI, 0.05).name('RotY').onChange(v => prop.mesh.rotation.y = v);
                    f.add(prop, 'scale', 0.5, 30, 0.5).name('Scale').onChange(v => prop.mesh.scale.set(v, v, v));
                    f.close();
                });

                zoneFolder.close();
            });

            gui.add({ log: () => {
                const visible = this.props.filter(p => p.visible);
                const hidden  = this.props.filter(p => !p.visible);
                const lines = visible.map(p =>
                    `this.place('${p.name}', ${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)}, ${p.scale}, ${p.rotY.toFixed(3)});`
                );
                console.log('=== VISIBLE PROPS (keep these) ===\n' + lines.join('\n'));
                if (hidden.length) {
                    console.log(`=== HIDDEN PROPS (delete these ${hidden.length} lines from placeAll) ===`);
                    hidden.forEach(p => console.log(`  this.place('${p.name}', ${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)}, ${p.scale}, ${p.rotY.toFixed(3)});`));
                }
            }}, 'log').name('📋 Log visible / hidden to console');
        });
    }

    placeAll() {
        // =============================================
        // ABOUT zone — Command Center
        // =============================================
        this.zone('ABOUT');
        this.place('hangarLargeA', -1.5, 0.0, -82.5, 15, 1.600);
        this.place('hangarSmallA', -27.5, 0.0, -79.5, 15, 0.050);
        this.place('hangarRoundA', -27.5, 14.7, -79.5, 12, 1.050);
        this.place('satelliteDish', 15.0, 15.0, -86.0, 12, -1.047);
        this.place('satelliteDishLarge', 8.5, 15.0, -76.0, 10, 0.524);
        this.place('pipeStraight', -21.0, 0.0, -55.0, 2, 0.000);
        this.place('pipeCorner', -30.5, 0.0, -47.0, 2, 0.785);
        this.place('rocksSmallA', 11.5, 0.0, -60.0, 12, 0.000);
        this.place('rocksSmallB', -17.5, 0.0, -40.5, 10, 0.000);

        // =============================================
        // DEV zone — Engineering Bay
        // =============================================
        this.zone('DEV');
        this.place('machineGenerator', 41.0, 0.0, -1.5, 15, 0.000);
        this.place('machineGenerator', 39.0, 0.0, -34.0, 12, 2.850);
        this.place('machineWireless', 41.0, 0.0, -8.0, 15, 1.571);
        this.place('machineBarrelLarge', 44.0, 0.0, -33.0, 12, -0.400);
        this.place('pipeStraight', 70.0, 15.0, -30.5, 4.5, 0.500);
        this.place('pipeStraight', 62.0, 15.0, -28.0, 4.5, 1.571);
        this.place('pipeCorner', 63.5, 15.7, -34.0, 4.5, -1.050);
        this.place('pipeSupportHigh', 57.0, 0.0, -8.0, 15, -0.450);
        this.place('supportsHigh', 57.0, 0.0, -8.0, 15, 1.047);
        this.place('supportsHigh', 57.0, 13.6, -8.0, 12, -0.524);
        this.place('rocksSmallA', 47.5, 0.0, 5.0, 8, 0.000);
        this.place('rocksSmallB', 31.0, 0.0, -32.0, 10, 0.000);
        this.place('corridor', 63.5, 0.0, -30.5, 15, 2.000);

        // =============================================
        // GEN AI zone — Research Lab
        // =============================================
        this.zone('GEN AI');
        this.place('corridor', 57.0, 0.0, 44.0, 15, 1.000);
        this.place('corridor', 67.0, 0.0, 50.5, 15, 1.000);
        this.place('corridorEnd', 63.5, 0.0, 32.0, 12, -2.150);
        this.place('corridorEnd', 73.5, 0.0, 38.5, 12, 1.000);
        this.place('rockCrystals', 57.0, 0.0, 63.5, 12, 0.000);
        this.place('rockCrystalsB', 44.0, 0.0, 70.0, 10, 1.047);
        this.place('rockCrystals', 50.5, 0.0, 57.0, 8, -0.785);
        this.place('machineWireless', 70.0, 0.0, 50.5, 12, -0.550);
        this.place('machineGenerator', 71.0, 0.0, 26.0, 12, 1.000);
        this.place('structureDetailed', 60.5, 0.0, 8.5, 12, 1.000);
        this.place('rocksSmallA', 42.0, 0.0, 45.0, 10, 0.000);
        this.place('rocksSmallB', 24.5, 0.0, 31.0, 8, 0.000);

        // =============================================
        // CREATIVE zone — Launch Pad
        // =============================================
        this.zone('CREATIVE');
        this.place('rocketBase', 0.0, 0.0, 78.0, 18, 0.000);
        this.place('rocketSides', 0.0, 17.9, 78.0, 18, 0.000);
        this.place('rocketFins', -40.5, 0.6, 78.0, 18, 0.000);
        this.place('rocketTop', -40.5, 13.0, 78.0, 18, 0.000);
        this.place('platformLarge', 2.0, -0.5, 76.5, 22, 0.000);
        this.place('platformLarge', -40.5, -0.5, 75.0, 15, 3.142);
        this.place('gateSimple', 47.5, 0.0, 83.0, 15, 0.400);

        // =============================================
        // CONTACT zone — Comms Array
        // =============================================
        this.zone('CONTACT');
        this.place('satelliteDish', -63.0, 11.9, 50.5, 22, 0.650);
        this.place('satelliteDish', -66.5, 0.0, 24.5, 14.5, 0.800);
        this.place('satelliteDishLarge', -78.0, 0.0, 37.5, 12, 2.200);
        this.place('machineWireless', -66.5, 0.0, 37.5, 15, 0.650);
        this.place('machineWireless', -56.5, 0.0, 57.0, 12, 0.650);
        this.place('monorailTrack', -73.0, 0.0, 31.0, 15, 2.250);
        this.place('monorailSupport', -73.0, 0.0, 31.0, 15, 2.250);
        this.place('monorailTrack', -73.0, 0.0, 44.0, 15, 0.650);
        this.place('monorailSupport', -73.0, 0.0, 44.0, 15, 0.650);
        this.place('structureClosed', -63.0, 0.0, 50.5, 12, 0.650);

        // =============================================
        // RESUME zone — Mining Outpost
        // =============================================
        this.zone('RESUME');
        this.place('crater', -73.0, 0.0, -30.0, 15, 0.000);
        this.place('craterLarge', -79.5, 0.0, -14.5, 30, 1.047);
        this.place('rover', -63.0, 0.0, -30.5, 15, 1.500);
        this.place('craftCargo', -66.5, 0.0, -47.0, 12, 0.800);
        this.place('machineBarrelLarge', -43.5, 0.0, -45.0, 12, 0.000);
        this.place('machineGenerator', -36.0, 0.0, -47.0, 12, 1.571);
        this.place('turret', -27.5, 0.0, -35.0, 12, -0.200);
        this.place('turret', -53.5, 0.0, -8.0, 10, -2.950);
        this.place('rock', -73.0, 0.0, -1.5, 12, 0.000);
        this.place('rockLarge', -82.5, 0.0, -24.0, 10, 0.524);
        this.place('rocksSmallA', -52.0, 0.0, -50.0, 10, 0.000);
        this.place('rocksSmallB', -42.0, 0.0, -35.0, 8, 0.000);

        // =============================================
        // BTS zone — Behind the Scenes Lab
        // =============================================
        this.zone('BTS');
        this.place('corridor', 50.5, 0.0, -66.5, 15, 3.100);
        this.place('corridorEnd', 50.5, 0.0, -55.0, 12, 0.000);
        this.place('structureDetailed', 37.5, 0.0, -69.5, 12, 0.000);
        this.place('structureClosed', 37.5, 0.0, -69.5, 10, 0.000);
        this.place('rockCrystals', 67.0, 0.0, -62.0, 10, 0.000);
        this.place('rockCrystalsB', 70.0, 0.0, -55.0, 8, 1.571);
        this.place('machineWireless', 24.5, 0.0, -63.0, 12, 0.000);
        this.place('machineGenerator', 21.5, 0.0, -53.5, 10, 0.785);
        this.place('pipeStraight', 18.0, -1.6, -32.0, 12, 2.600);
        this.place('rocksSmallA', 45.0, 0.0, -55.0, 8, 0.000);
        this.place('rocksSmallB', 57.0, 0.0, -47.0, 8, 0.000);

        // =============================================
        // Spawn area — Central Hub
        // =============================================
        this.zone('SPAWN');
        this.place('platformLarge', -4.0, 0.0, -4.0, 15, 0.000);
        this.place('platformLarge', 4.0, 0.0, -4.0, 15, 0.000);
        this.place('gateSimple', 0.0, 0.0, -10.0, 12, 0.000);
        this.place('structureDetailed', 12.0, 0.0, 5.0, 10, 1.571);
        this.place('structureClosed', -12.0, 0.0, 5.0, 10, -1.571);
        this.place('barrel', 15.0, 0.0, -5.0, 8, 0.000);
        this.place('barrels', -15.0, 0.0, -5.0, 8, 0.000);

        // =============================================
        // Between zones — scattered fill
        // =============================================
        this.zone('PATHS');
        this.place('rocksSmallA', 5.0, 0.0, -25.0, 8, 0.000);
        this.place('pipeStraight', -11.0, 0.0, -35.0, 5.5, -0.700);
        this.place('rocksSmallB', -8.0, 0.0, -45.0, 10, 0.000);
        this.place('crater', -17.5, 0.0, -50.0, 10, 0.785);
        this.place('rocksSmallA', 14.0, 0.0, 18.0, 8, 0.000);   // was (3,20) — on CREATIVE road
        this.place('rocksSmallB', -14.0, 0.0, 42.0, 10, 0.000); // was (-3,40) — on CREATIVE road
        this.place('crater', 5.0, 0.0, 55.0, 10, 1.571);
        this.place('rocksSmallB', -20.0, 0.0, 8.0, 8, 0.000);   // was (-15,15) — on CONTACT road edge
        this.place('pipeRing', -16.0, 0.0, 30.0, 10, 0.785);    // was (-25,25) — exact CONTACT road waypoint
        this.place('rocksSmallA', -28.0, 0.0, 42.0, 10, 0.000); // was (-35,35) — near CONTACT road
        this.place('rocksSmallA', -8.0, 0.0, -22.0, 8, 0.000);  // was (-18,-12) — on RESUME road
        this.place('rocksSmallB', -30.0, 0.0, -20.0, 10, 0.000);
        this.place('crater', -38.0, 0.0, -25.0, 8, -0.524);

        // =============================================
        // World edges — scattered
        // =============================================
        this.zone('EDGES');
        this.place('rockLarge', 80.0, 0.0, -55.0, 12, 0.000);
        this.place('rockLarge', -75.0, 0.0, -65.0, 10, 3.142);
        this.place('rock', 75.0, 0.0, 55.0, 12, 1.047);
        this.place('craterLarge', -70.0, 0.0, 65.0, 10, -0.524);
        this.place('rocksSmallA', 85.0, 0.0, 0.0, 10, 0.000);
        this.place('rocksSmallB', -80.0, 0.0, 0.0, 10, 0.000);
        this.place('meteor', 60.0, 0.0, -65.0, 10, 0.785);
        this.place('meteor', -65.0, 0.0, 60.0, 10, -1.047);
    }
}
