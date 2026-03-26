import * as THREE from 'three';
import Experience from '../Experience.js';

export default class NeonLights {
    constructor() {
        this.experience = Experience.getInstance();
        this.scene = this.experience.scene;
        this.time = this.experience.time;

        this.lights = [];
        this.strips = [];

        this.createZoneLights();
        this.createAccentStrips();

        console.log('✅ NeonLights initialized');
    }

    /**
     * Colored point lights near each zone cluster
     */
    createZoneLights() {
        const zoneLights = [
            // ABOUT — Command Center (cyan)
            { pos: [-10, 3, -68], color: 0x00F0FF, intensity: 2, range: 12 },
            { pos: [10, 3, -65], color: 0x00F0FF, intensity: 1.5, range: 10 },
            { pos: [0, 2, -58], color: 0x00F0FF, intensity: 1, range: 8 },

            // DEV — Engineering Bay (green)
            { pos: [55, 3, -25], color: 0x39FF14, intensity: 2, range: 12 },
            { pos: [65, 3, -35], color: 0x39FF14, intensity: 1.5, range: 10 },
            { pos: [60, 2, -18], color: 0x39FF14, intensity: 1, range: 8 },

            // GEN AI — Research Lab (orange)
            { pos: [50, 3, 38], color: 0xFFB800, intensity: 2, range: 12 },
            { pos: [62, 3, 42], color: 0xFFB800, intensity: 1.5, range: 10 },
            { pos: [55, 2, 52], color: 0xFFB800, intensity: 1, range: 8 },

            // CREATIVE — Launch Pad (pink)
            { pos: [0, 5, 78], color: 0xFF2D78, intensity: 2.5, range: 15 },
            { pos: [-6, 3, 75], color: 0xFF2D78, intensity: 1.5, range: 10 },
            { pos: [6, 3, 75], color: 0xFF2D78, intensity: 1.5, range: 10 },

            // CONTACT — Comms Array (cyan)
            { pos: [-52, 3, 50], color: 0x00F0FF, intensity: 2, range: 12 },
            { pos: [-45, 3, 42], color: 0x00F0FF, intensity: 1.5, range: 10 },
            { pos: [-55, 2, 55], color: 0x00F0FF, intensity: 1, range: 8 },

            // RESUME — Mining Outpost (orange)
            { pos: [-55, 3, -35], color: 0xFFB800, intensity: 2, range: 12 },
            { pos: [-48, 3, -38], color: 0xFFB800, intensity: 1.5, range: 10 },
            { pos: [-62, 2, -28], color: 0xFFB800, intensity: 1, range: 8 },

            // Spawn area (white/cyan)
            { pos: [0, 3, 0], color: 0x00F0FF, intensity: 2, range: 10 },
            { pos: [12, 2, 5], color: 0x00F0FF, intensity: 1, range: 6 },
            { pos: [-12, 2, 5], color: 0x00F0FF, intensity: 1, range: 6 },

            // Road edges — dim pathway markers
            { pos: [0, 1.5, -20], color: 0x00F0FF, intensity: 0.8, range: 5 },
            { pos: [15, 1.5, -8], color: 0x39FF14, intensity: 0.8, range: 5 },
            { pos: [15, 1.5, 15], color: 0xFFB800, intensity: 0.8, range: 5 },
            { pos: [0, 1.5, 20], color: 0xFF2D78, intensity: 0.8, range: 5 },
            { pos: [-15, 1.5, 15], color: 0x00F0FF, intensity: 0.8, range: 5 },
            { pos: [-15, 1.5, -10], color: 0xFFB800, intensity: 0.8, range: 5 },
            { pos: [12, 1.5, -25], color: 0xBB44FF, intensity: 0.8, range: 5 },

            // BTS — Behind the Scenes Lab (purple)
            { pos: [35, 3, -58], color: 0xBB44FF, intensity: 2, range: 12 },
            { pos: [30, 3, -65], color: 0xBB44FF, intensity: 1.5, range: 10 },
            { pos: [42, 2, -55], color: 0xBB44FF, intensity: 1, range: 8 },
        ];

        for (const l of zoneLights) {
            const light = new THREE.PointLight(l.color, l.intensity, l.range);
            light.position.set(l.pos[0], l.pos[1], l.pos[2]);
            this.scene.add(light);
            this.lights.push(light);
        }
    }

    /**
     * Small emissive strips placed on/near structures — like LED accent bars
     */
    createAccentStrips() {
        const strips = [
            // ABOUT hangars
            { pos: [-10, 2.5, -66], rot: 0, len: 4, color: 0x00F0FF },
            { pos: [10, 2.5, -63], rot: Math.PI, len: 3, color: 0x00F0FF },
            // DEV machines
            { pos: [55, 1.5, -23], rot: 0, len: 3, color: 0x39FF14 },
            { pos: [65, 1.5, -20], rot: Math.PI / 2, len: 4, color: 0x39FF14 },
            // GEN AI corridors
            { pos: [50, 1.5, 36], rot: Math.PI / 2, len: 5, color: 0xFFB800 },
            { pos: [58, 1.5, 36], rot: Math.PI / 2, len: 5, color: 0xFFB800 },
            // CREATIVE launch pad
            { pos: [-6, 0.3, 73], rot: 0, len: 6, color: 0xFF2D78 },
            { pos: [6, 0.3, 73], rot: 0, len: 6, color: 0xFF2D78 },
            // CONTACT dishes
            { pos: [-52, 2, 48], rot: Math.PI / 4, len: 3, color: 0x00F0FF },
            { pos: [-45, 2, 40], rot: -Math.PI / 3, len: 3, color: 0x00F0FF },
            // RESUME mining
            { pos: [-55, 1.5, -33], rot: Math.PI / 6, len: 4, color: 0xFFB800 },
            { pos: [-48, 1.5, -40], rot: -Math.PI / 4, len: 3, color: 0xFFB800 },
            // Spawn hub
            { pos: [-4, 0.3, -6], rot: Math.PI / 2, len: 4, color: 0x00F0FF },
            { pos: [4, 0.3, -6], rot: Math.PI / 2, len: 4, color: 0x00F0FF },
            // BTS lab
            { pos: [30, 1.5, -56], rot: Math.PI / 4, len: 3, color: 0xBB44FF },
            { pos: [38, 1.5, -66], rot: -Math.PI / 3, len: 3, color: 0xBB44FF },
        ];

        for (const s of strips) {
            const geo = new THREE.PlaneGeometry(s.len, 0.15);
            const mat = new THREE.MeshStandardMaterial({
                color: s.color,
                emissive: s.color,
                emissiveIntensity: 2.0,
                transparent: true,
                opacity: 0.9,
                side: THREE.DoubleSide,
                depthWrite: false,
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(s.pos[0], s.pos[1], s.pos[2]);
            mesh.rotation.y = s.rot;
            this.scene.add(mesh);
            this.strips.push({ mesh, mat, baseIntensity: 2.0 });
        }
    }

    update() {
        if (!this.time) return;
        const t = this.time.elapsed * 0.001;

        // Subtle pulse on accent strips
        for (const strip of this.strips) {
            strip.mat.emissiveIntensity = strip.baseIntensity + Math.sin(t * 1.5 + strip.mesh.position.x * 0.1) * 0.4;
        }
    }
}
