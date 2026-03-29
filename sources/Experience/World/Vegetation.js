import * as THREE from 'three';
import Experience from '../Experience.js';

export default class Vegetation {
    constructor() {
        this.experience = Experience.getInstance();
        this.scene = this.experience.scene;
        this.time = this.experience.time;

        this.trees = [];
        this.grassMesh = null;

        this.createTrees();
        this.createGrass();

        console.log('✅ Vegetation initialized');
    }

    // =============================================
    // ALIEN TREES — procedural twisted trunks + glowing canopies
    // =============================================
    createTrees() {
        // Mars palette: ember/lava canopies, dark burnt trunks
        const C = {
            ember:   0xFF6600, lava:    0xFF4400, deepRed: 0xCC3300,
            amber:   0xFF8833, magenta: 0xFF2D78, cyan:    0x00F0FF,
            gold:    0xFFB800, rust:    0xFF5500,
            trunk:   0x2A1200, trunkD:  0x1A0A00, trunkP:  0x1F0F00,
        };

        const treePositions = [
            // Near ABOUT zone
            { x: -20, z: -62, height: 6, canopyColor: C.ember,   trunkColor: C.trunk  },
            { x: 20,  z: -72, height: 5, canopyColor: C.lava,    trunkColor: C.trunkD },
            { x: -25, z: -55, height: 4, canopyColor: C.amber,   trunkColor: C.trunk  },
            { x: -30, z: -68, height: 7, canopyColor: C.deepRed, trunkColor: C.trunkP },
            { x: 25,  z: -60, height: 5, canopyColor: C.rust,    trunkColor: C.trunkD },

            // Near DEV zone
            { x: 72, z: -18, height: 5, canopyColor: C.amber,   trunkColor: C.trunk  },
            { x: 48, z: -38, height: 7, canopyColor: C.ember,   trunkColor: C.trunkD },
            { x: 75, z: -35, height: 4, canopyColor: C.lava,    trunkColor: C.trunkP },
            { x: 78, z: -22, height: 6, canopyColor: C.gold,    trunkColor: C.trunk  },
            { x: 52, z: -15, height: 5, canopyColor: C.rust,    trunkColor: C.trunkD },

            // Near GEN AI zone
            { x: 42, z: 52, height: 6, canopyColor: C.ember,   trunkColor: C.trunk  },
            { x: 68, z: 38, height: 5, canopyColor: C.deepRed, trunkColor: C.trunkP },
            { x: 72, z: 50, height: 7, canopyColor: C.amber,   trunkColor: C.trunkD },
            { x: 45, z: 62, height: 4, canopyColor: C.lava,    trunkColor: C.trunk  },

            // Near CREATIVE zone
            { x: -12, z: 82, height: 7, canopyColor: C.magenta, trunkColor: C.trunk  },
            { x: 12,  z: 85, height: 5, canopyColor: C.ember,   trunkColor: C.trunkD },
            { x: -15, z: 72, height: 4, canopyColor: C.amber,   trunkColor: C.trunkP },
            { x: 18,  z: 78, height: 6, canopyColor: C.lava,    trunkColor: C.trunk  },

            // Near CONTACT zone
            { x: -60, z: 55, height: 6, canopyColor: C.cyan,    trunkColor: C.trunk  },
            { x: -42, z: 58, height: 5, canopyColor: C.ember,   trunkColor: C.trunkD },
            { x: -65, z: 42, height: 7, canopyColor: C.deepRed, trunkColor: C.trunkP },

            // Near RESUME zone
            { x: -68, z: -48, height: 5, canopyColor: C.gold,    trunkColor: C.trunk  },
            { x: -42, z: -48, height: 4, canopyColor: C.amber,   trunkColor: C.trunkD },
            { x: -72, z: -38, height: 6, canopyColor: C.rust,    trunkColor: C.trunkP },
            { x: -50, z: -55, height: 5, canopyColor: C.lava,    trunkColor: C.trunk  },

            // Along roads (scattered)
            { x: -8,  z: -30, height: 5, canopyColor: C.ember,   trunkColor: C.trunk  },
            { x: 20,  z: 8,   height: 6, canopyColor: C.amber,   trunkColor: C.trunkD },
            { x: -18, z: 22,  height: 4, canopyColor: C.deepRed, trunkColor: C.trunkP },
            { x: 5,   z: 35,  height: 5, canopyColor: C.lava,    trunkColor: C.trunk  },
            { x: -28, z: -8,  height: 6, canopyColor: C.gold,    trunkColor: C.trunkD },
            { x: 35,  z: -5,  height: 4, canopyColor: C.rust,    trunkColor: C.trunk  },
            { x: -10, z: 55,  height: 5, canopyColor: C.ember,   trunkColor: C.trunkP },
            { x: 30,  z: 45,  height: 6, canopyColor: C.amber,   trunkColor: C.trunkD },

            // Mid-map fills (open empty areas)
            { x: 25,  z: -50, height: 5, canopyColor: C.deepRed, trunkColor: C.trunk  },
            { x: -35, z: 10,  height: 6, canopyColor: C.lava,    trunkColor: C.trunkD },
            { x: 15,  z: 60,  height: 4, canopyColor: C.amber,   trunkColor: C.trunkP },
            { x: -25, z: 40,  height: 7, canopyColor: C.ember,   trunkColor: C.trunk  },
            { x: 50,  z: 15,  height: 5, canopyColor: C.gold,    trunkColor: C.trunkD },
            { x: -45, z: -15, height: 6, canopyColor: C.rust,    trunkColor: C.trunk  },

            // World edges
            { x: 85,  z: 20,  height: 8, canopyColor: C.ember,   trunkColor: C.trunk  },
            { x: -85, z: -20, height: 7, canopyColor: C.lava,    trunkColor: C.trunkP },
            { x: 40,  z: -70, height: 6, canopyColor: C.amber,   trunkColor: C.trunkD },
            { x: -30, z: 70,  height: 5, canopyColor: C.deepRed, trunkColor: C.trunk  },
            { x: -80, z: 30,  height: 7, canopyColor: C.rust,    trunkColor: C.trunkD },
            { x: 82,  z: -50, height: 6, canopyColor: C.gold,    trunkColor: C.trunk  },
        ];

        for (const t of treePositions) {
            this.createTree(t.x, t.z, t.height, t.canopyColor, t.trunkColor);
        }
    }

    createTree(x, z, height, canopyColor, trunkColor) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        // Trunk — tapered cylinder with slight random lean
        const trunkGeo = new THREE.CylinderGeometry(0.15, 0.35, height, 6);
        const trunkMat = new THREE.MeshStandardMaterial({
            color: trunkColor,
            roughness: 0.9,
        });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = height / 2;
        trunk.rotation.x = (Math.random() - 0.5) * 0.15;
        trunk.rotation.z = (Math.random() - 0.5) * 0.15;
        trunk.castShadow = true;
        group.add(trunk);

        // Canopy — cluster of glowing spheres
        const canopyCount = 2 + Math.floor(Math.random() * 3);
        const canopies = [];
        for (let i = 0; i < canopyCount; i++) {
            const radius = 0.8 + Math.random() * 1.2;
            const canopyGeo = new THREE.IcosahedronGeometry(radius, 1);
            const canopyMat = new THREE.MeshStandardMaterial({
                color: canopyColor,
                emissive: canopyColor,
                emissiveIntensity: 0.4,
                transparent: true,
                opacity: 0.85,
                roughness: 0.6,
            });
            const canopy = new THREE.Mesh(canopyGeo, canopyMat);
            canopy.position.set(
                (Math.random() - 0.5) * 1.5,
                height + (Math.random() - 0.3) * 1.5,
                (Math.random() - 0.5) * 1.5
            );
            canopy.castShadow = true;
            group.add(canopy);
            canopies.push(canopy);
        }

        this.scene.add(group);
        this.trees.push({ group, trunk, canopies, height, phase: Math.random() * Math.PI * 2 });
    }

    // =============================================
    // ALIEN GRASS — instanced blades with wind shader
    // =============================================
    createGrass() {
        const bladeCount = 3500;

        // Blade geometry — tall thin triangle
        const bladeGeo = new THREE.BufferGeometry();
        const bladeVerts = new Float32Array([
            -0.05, 0, 0,   // bottom left
             0.05, 0, 0,   // bottom right
             0.0,  1.0, 0, // top
        ]);
        const bladeUVs = new Float32Array([
            0, 0,
            1, 0,
            0.5, 1,
        ]);
        bladeGeo.setAttribute('position', new THREE.BufferAttribute(bladeVerts, 3));
        bladeGeo.setAttribute('uv', new THREE.BufferAttribute(bladeUVs, 2));
        bladeGeo.computeVertexNormals();

        // Shader material with wind
        const grassMat = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uWindStrength: { value: 0.3 },
                uColor: { value: new THREE.Color(0xAA3300) },
                uTipColor: { value: new THREE.Color(0xFF6622) },
            },
            vertexShader: `
                uniform float uTime;
                uniform float uWindStrength;

                varying vec2 vUv;
                varying float vHeight;

                void main() {
                    vUv = uv;
                    vHeight = position.y;

                    vec4 worldPos = modelMatrix * instanceMatrix * vec4(position, 1.0);

                    // Wind displacement — stronger at blade tips
                    float windPhase = worldPos.x * 0.3 + worldPos.z * 0.2 + uTime * 2.0;
                    float windDisp = sin(windPhase) * uWindStrength * position.y;
                    float windDispZ = cos(windPhase * 0.7) * uWindStrength * 0.5 * position.y;

                    worldPos.x += windDisp;
                    worldPos.z += windDispZ;

                    gl_Position = projectionMatrix * viewMatrix * worldPos;
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                uniform vec3 uTipColor;
                varying float vHeight;

                void main() {
                    // Gradient from base color to tip glow
                    vec3 color = mix(uColor, uTipColor, vHeight);
                    float alpha = 0.7 + vHeight * 0.3;
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
        });

        this.grassMesh = new THREE.InstancedMesh(bladeGeo, grassMat, bladeCount);

        const dummy = new THREE.Object3D();
        const grassAreas = this.getGrassAreas();

        let placed = 0;
        for (let i = 0; i < bladeCount && placed < bladeCount; i++) {
            // Pick a random grass area
            const area = grassAreas[Math.floor(Math.random() * grassAreas.length)];
            const x = area.x + (Math.random() - 0.5) * area.radius * 2;
            const z = area.z + (Math.random() - 0.5) * area.radius * 2;

            // Check within circular area
            const dx = x - area.x;
            const dz = z - area.z;
            if (dx * dx + dz * dz > area.radius * area.radius) continue;

            const bladeHeight = 0.6 + Math.random() * 1.0;
            dummy.position.set(x, 0, z);
            dummy.scale.set(1, bladeHeight, 1);
            dummy.rotation.y = Math.random() * Math.PI * 2;
            dummy.updateMatrix();

            this.grassMesh.setMatrixAt(placed, dummy.matrix);
            placed++;
        }

        this.grassMesh.count = placed;
        this.grassMesh.instanceMatrix.needsUpdate = true;
        this.scene.add(this.grassMesh);
    }

    getGrassAreas() {
        return [
            // Near trees — dense patches
            { x: -20, z: -62, radius: 10 },
            { x: 20,  z: -72, radius: 8  },
            { x: -30, z: -68, radius: 7  },
            { x: 72,  z: -18, radius: 8  },
            { x: 48,  z: -38, radius: 7  },
            { x: 78,  z: -22, radius: 6  },
            { x: 42,  z: 52,  radius: 9  },
            { x: 72,  z: 50,  radius: 7  },
            { x: -12, z: 82,  radius: 10 },
            { x: 18,  z: 78,  radius: 7  },
            { x: -60, z: 55,  radius: 8  },
            { x: -65, z: 42,  radius: 7  },
            { x: -68, z: -48, radius: 8  },
            { x: -50, z: -55, radius: 6  },

            // Along roads
            { x: -5,  z: -25, radius: 6 },
            { x: 15,  z: 10,  radius: 6 },
            { x: -22, z: 18,  radius: 5 }, // was (-15,18) — centered on CONTACT road
            { x: 5,   z: 40,  radius: 6 },
            { x: -25, z: -5,  radius: 6 },
            { x: 35,  z: -5,  radius: 5 },
            { x: -10, z: 55,  radius: 6 },
            { x: 30,  z: 45,  radius: 5 },

            // Mid-map fills
            { x: 25,  z: -50, radius: 8 },
            { x: -35, z: 10,  radius: 8 },
            { x: 15,  z: 60,  radius: 7 },
            { x: -25, z: 40,  radius: 8 },
            { x: 50,  z: 15,  radius: 7 },
            { x: -45, z: -15, radius: 8 },
            { x: 10,  z: -45, radius: 6 }, // was (0,-45) — centered on ABOUT road
            { x: -20, z: 0,   radius: 6 },
            { x: 40,  z: -10, radius: 6 },

            // World edges — wide sparse sweeps
            { x: 85,  z: 20,  radius: 14 },
            { x: -85, z: -20, radius: 14 },
            { x: 40,  z: -70, radius: 12 },
            { x: -30, z: 70,  radius: 12 },
            { x: -80, z: 30,  radius: 12 },
            { x: 82,  z: -50, radius: 10 },
            { x: 0,   z: 90,  radius: 12 },
            { x: 0,   z: -90, radius: 10 },

            // Spawn area
            { x: 16,  z: 6,   radius: 5 }, // was (8,8) — on GEN AI road start
            { x: -18, z: 5,   radius: 5 }, // was (-8,8) — on CONTACT road
            { x: -8,  z: -22, radius: 5 }, // was (0,-15) — on ABOUT road
        ];
    }

    update() {
        if (!this.time) return;
        const t = this.time.elapsed * 0.001;

        // Update grass wind shader
        if (this.grassMesh) {
            this.grassMesh.material.uniforms.uTime.value = t;
        }

        // Sway tree canopies
        for (const tree of this.trees) {
            const sway = Math.sin(t * 1.2 + tree.phase) * 0.08;
            const swayZ = Math.cos(t * 0.9 + tree.phase * 1.3) * 0.05;
            for (const canopy of tree.canopies) {
                canopy.position.x += sway * 0.02;
                canopy.position.z += swayZ * 0.02;
                // Slowly return to center to prevent drift
                canopy.position.x *= 0.998;
                canopy.position.z *= 0.998;
            }
        }
    }
}
