import * as THREE from 'three';
import Experience from '../Experience.js';

export default class WorldDressing {
    constructor() {
        this.experience = Experience.getInstance();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;

        this.props = [];
        this.placeAll();

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

    place(name, x, y, z, scale = 1, rotY = 0) {
        const mesh = this.cloneModel(name, scale);
        if (!mesh) return;
        mesh.position.set(x, y, z);
        mesh.rotation.y = rotY;
        this.scene.add(mesh);
        this.props.push(mesh);
    }

    placeAll() {
        // =============================================
        // ABOUT zone (0, 0, -70) — Command Center
        // =============================================
        // Main hangar
        this.place('hangarLargeA', -10, 0, -68, 15, 0);
        this.place('hangarSmallA', 10, 0, -65, 15, Math.PI);
        this.place('hangarRoundA', -5, 0, -78, 12, Math.PI / 4);
        // Satellite array
        this.place('satelliteDish', 15, 0, -75, 12, -Math.PI / 3);
        this.place('satelliteDishLarge', -18, 0, -60, 10, Math.PI / 6);
        // Structures
        this.place('structureDetailed', 5, 0, -58, 12, 0);
        this.place('structureClosed', -15, 0, -58, 12, Math.PI / 2);
        // Corridor connecting buildings
        this.place('corridor', 0, 0, -63, 15, Math.PI / 2);
        this.place('corridorEnd', 12, 0, -73, 12, 0);
        // Pipes
        this.place('pipeStraight', -8, 0, -55, 15, 0);
        this.place('pipeCorner', 8, 0, -80, 12, Math.PI / 4);
        // Detail rocks
        this.place('rocksSmallA', 18, 0, -60, 12);
        this.place('rocksSmallB', -20, 0, -72, 10);

        // =============================================
        // DEV zone (60, 0, -30) — Engineering Bay
        // =============================================
        // Machines
        this.place('machineGenerator', 55, 0, -25, 15, 0);
        this.place('machineGenerator', 65, 0, -22, 12, Math.PI);
        this.place('machineWireless', 58, 0, -35, 15, Math.PI / 2);
        this.place('machineBarrelLarge', 68, 0, -33, 12, 0);
        // Pipe network
        this.place('pipeStraight', 52, 0, -28, 15, Math.PI / 2);
        this.place('pipeStraight', 62, 0, -28, 15, Math.PI / 2);
        this.place('pipeCorner', 72, 0, -28, 12, -Math.PI / 4);
        this.place('pipeSupportHigh', 57, 0, -20, 15, 0);
        this.place('pipeSupportHigh', 63, 0, -20, 15, 0);
        // Support structures
        this.place('supportsHigh', 50, 0, -35, 15, Math.PI / 3);
        this.place('supportsHigh', 70, 0, -38, 12, -Math.PI / 6);
        // Details
        this.place('rocksSmallA', 73, 0, -22, 8);
        this.place('rocksSmallB', 48, 0, -32, 10);
        // Corridor
        this.place('corridor', 60, 0, -18, 15, 0);

        // =============================================
        // GEN AI zone (55, 0, 40) — Research Lab
        // =============================================
        // Corridors forming lab complex
        this.place('corridor', 50, 0, 38, 15, Math.PI / 2);
        this.place('corridor', 58, 0, 38, 15, Math.PI / 2);
        this.place('corridorEnd', 48, 0, 42, 12, Math.PI);
        this.place('corridorEnd', 62, 0, 42, 12, 0);
        // Crystals
        this.place('rockCrystals', 48, 0, 48, 12, 0);
        this.place('rockCrystalsB', 62, 0, 48, 10, Math.PI / 3);
        this.place('rockCrystals', 55, 0, 52, 8, -Math.PI / 4);
        // Machines
        this.place('machineWireless', 45, 0, 35, 12, Math.PI / 4);
        this.place('machineGenerator', 65, 0, 35, 12, -Math.PI / 4);
        // Structure
        this.place('structureDetailed', 55, 0, 32, 12, Math.PI);
        // Details
        this.place('rocksSmallA', 42, 0, 45, 10);
        this.place('rocksSmallB', 68, 0, 42, 8);

        // =============================================
        // CREATIVE zone (0, 0, 75) — Launch Pad
        // =============================================
        // Full rocket assembly
        this.place('rocketBase', 0, 0, 78, 18, 0);
        this.place('rocketSides', 0, 0, 78, 18, 0);
        this.place('rocketFins', 0, 0, 78, 18, 0);
        this.place('rocketTop', 0, 0, 78, 18, 0);
        // Platform around rocket
        this.place('platformLarge', -6, 0, 75, 15, 0);
        this.place('platformLarge', 6, 0, 75, 15, Math.PI);
        this.place('platformCorner', -6, 0, 82, 15, Math.PI / 2);
        this.place('platformCorner', 6, 0, 82, 15, 0);
        // Gate entrance
        this.place('gateSimple', 0, 0, 65, 15, 0);
        // Support towers
        this.place('supportsHigh', -10, 0, 80, 15, 0);
        this.place('supportsHigh', 10, 0, 80, 15, 0);
        // Details
        this.place('rocksSmallA', -12, 0, 70, 10);
        this.place('barrel', 8, 0, 68, 10);
        this.place('barrels', -8, 0, 68, 8);

        // =============================================
        // CONTACT zone (-50, 0, 45) — Comms Array
        // =============================================
        // Satellite dishes
        this.place('satelliteDish', -52, 0, 50, 15, Math.PI / 4);
        this.place('satelliteDish', -45, 0, 42, 12, -Math.PI / 3);
        this.place('satelliteDishLarge', -55, 0, 40, 12, Math.PI / 6);
        // Wireless towers
        this.place('machineWireless', -48, 0, 52, 15, 0);
        this.place('machineWireless', -58, 0, 48, 12, Math.PI / 2);
        // Monorail section
        this.place('monorailTrack', -42, 0, 48, 15, Math.PI / 4);
        this.place('monorailSupport', -42, 0, 48, 15, Math.PI / 4);
        this.place('monorailTrack', -38, 0, 44, 15, Math.PI / 4);
        this.place('monorailSupport', -38, 0, 44, 15, Math.PI / 4);
        // Structure
        this.place('structureClosed', -55, 0, 55, 12, -Math.PI / 4);
        // Details
        this.place('rocksSmallA', -60, 0, 42, 8);
        this.place('rocksSmallB', -43, 0, 55, 10);

        // =============================================
        // RESUME zone (-55, 0, -35) — Mining Outpost
        // =============================================
        // Craters
        this.place('crater', -50, 0, -30, 15, 0);
        this.place('craterLarge', -60, 0, -40, 12, Math.PI / 3);
        // Rover & cargo
        this.place('rover', -48, 0, -38, 15, Math.PI / 6);
        this.place('craftCargo', -62, 0, -28, 12, -Math.PI / 4);
        // Mining machines
        this.place('machineBarrelLarge', -55, 0, -45, 12, 0);
        this.place('machineGenerator', -45, 0, -42, 12, Math.PI / 2);
        // Turrets guarding
        this.place('turret', -65, 0, -35, 12, Math.PI / 4);
        this.place('turret', -48, 0, -28, 10, -Math.PI / 3);
        // Rock piles
        this.place('rock', -58, 0, -48, 12, 0);
        this.place('rockLarge', -68, 0, -42, 10, Math.PI / 6);
        // Details
        this.place('rocksSmallA', -52, 0, -50, 10);
        this.place('rocksSmallB', -42, 0, -35, 8);
        this.place('barrel', -65, 0, -30, 10, Math.PI);

        // =============================================
        // BTS zone (35, 0, -60) — Behind the Scenes Lab
        // =============================================
        // Corridors forming the dev lab
        this.place('corridor', 30, 0, -58, 15, Math.PI / 4);
        this.place('corridorEnd', 40, 0, -55, 12, -Math.PI / 4);
        // Structures
        this.place('structureDetailed', 32, 0, -65, 12, Math.PI / 6);
        this.place('structureClosed', 38, 0, -68, 10, -Math.PI / 3);
        // Crystals (representing data/code)
        this.place('rockCrystals', 42, 0, -62, 10, 0);
        this.place('rockCrystalsB', 28, 0, -55, 8, Math.PI / 2);
        // Machines
        this.place('machineWireless', 35, 0, -52, 12, Math.PI);
        this.place('machineGenerator', 25, 0, -62, 10, Math.PI / 4);
        // Pipes
        this.place('pipeStraight', 38, 0, -50, 12, Math.PI / 4);
        // Details
        this.place('rocksSmallA', 45, 0, -55, 8);
        this.place('rocksSmallB', 22, 0, -58, 8);

        // =============================================
        // Spawn area (0, 0, 0) — Central Hub
        // =============================================
        this.place('platformLarge', -4, 0, -4, 15, 0);
        this.place('platformLarge', 4, 0, -4, 15, 0);
        this.place('gateSimple', 0, 0, -10, 12, 0);
        this.place('structureDetailed', 12, 0, 5, 10, Math.PI / 2);
        this.place('structureClosed', -12, 0, 5, 10, -Math.PI / 2);
        this.place('barrel', 15, 0, -5, 8);
        this.place('barrels', -15, 0, -5, 8);

        // =============================================
        // Between zones — scattered fill
        // =============================================
        // Spawn → ABOUT path
        this.place('rocksSmallA', 5, 0, -25, 8);
        this.place('pipeStraight', -3, 0, -35, 12, 0);
        this.place('rocksSmallB', -8, 0, -45, 10);
        this.place('crater', 10, 0, -50, 10, Math.PI / 4);

        // Spawn → DEV path
        this.place('rocksSmallA', 25, 0, -12, 8);
        this.place('supportsHigh', 35, 0, -18, 10, Math.PI / 6);
        this.place('rocksSmallB', 45, 0, -22, 8);

        // Spawn → GEN AI path
        this.place('rocksSmallB', 20, 0, 15, 8);
        this.place('pipeSupportHigh', 30, 0, 22, 10, Math.PI / 3);
        this.place('rocksSmallA', 40, 0, 30, 10);

        // Spawn → CREATIVE path
        this.place('rocksSmallA', 3, 0, 20, 8);
        this.place('rocksSmallB', -3, 0, 40, 10);
        this.place('crater', 5, 0, 55, 10, Math.PI / 2);

        // Spawn → CONTACT path
        this.place('rocksSmallB', -15, 0, 15, 8);
        this.place('pipeRing', -25, 0, 25, 10, Math.PI / 4);
        this.place('rocksSmallA', -35, 0, 35, 10);

        // Spawn → RESUME path
        this.place('rocksSmallA', -18, 0, -12, 8);
        this.place('rocksSmallB', -30, 0, -20, 10);
        this.place('crater', -38, 0, -25, 8, -Math.PI / 6);

        // World edge scattered
        this.place('rockLarge', 80, 0, -55, 12, 0);
        this.place('rockLarge', -75, 0, -65, 10, Math.PI);
        this.place('rock', 75, 0, 55, 12, Math.PI / 3);
        this.place('craterLarge', -70, 0, 65, 10, -Math.PI / 6);
        this.place('rocksSmallA', 85, 0, 0, 10);
        this.place('rocksSmallB', -80, 0, 0, 10);
        this.place('meteor', 60, 0, -65, 10, Math.PI / 4);
        this.place('meteor', -65, 0, 60, 10, -Math.PI / 3);
    }
}
