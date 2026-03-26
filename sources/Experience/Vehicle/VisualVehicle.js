import * as THREE from 'three';
import Experience from '../Experience.js';

export default class VisualVehicle {
    constructor(physicalVehicle) {
        console.log('✅ VisualVehicle initialized');
        this.experience = Experience.getInstance();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.physicalVehicle = physicalVehicle;
        this.time = this.experience.time;

        this.createVisuals();

        this.targetTilt = new THREE.Quaternion();
        this.baseQuaternion = new THREE.Quaternion();
        this.frameCount = 0;

        // Particle system setup
        this.createParticles();
    }
    
    createVisuals() {
        this.container = new THREE.Group();

        // Load spaceship model
        const spaceshipModel = this.resources.items.spaceship;
        if (spaceshipModel) {
            this.spaceship = spaceshipModel.scene.clone();

            // Scale 10% bigger
            this.spaceship.scale.set(1.1, 1.1, 1.1);

            // Rotate 90 degrees counterclockwise (around Y axis)
            this.spaceship.rotation.y = Math.PI / 2;

            // Enable shadows on all meshes
            this.spaceship.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;

                    // Enhance materials with metalness for sci-fi look
                    if (child.material) {
                        child.material.metalness = 0.7;
                        child.material.roughness = 0.3;
                    }
                }
            });

            this.container.add(this.spaceship);
            console.log('✅ Spaceship model loaded');
        } else {
            console.warn('Spaceship model not found, using placeholder');
            // Fallback placeholder
            const bodyGeo = new THREE.BoxGeometry(3, 1, 4);
            const bodyMat = new THREE.MeshStandardMaterial({
                color: 0x2A2A3A,
                metalness: 0.7,
                roughness: 0.3
            });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.castShadow = true;
            body.receiveShadow = true;
            this.container.add(body);
        }

        // Load alien pilot model
        const alienModel = this.resources.items.alienPilot;
        if (alienModel) {
            this.alien = alienModel.scene.clone();

            // Scale 40% smaller (60% of original size)
            this.alien.scale.set(0.48, 0.48, 0.48);

            // Rotate 180 degrees
            this.alien.rotation.y = Math.PI/2;

            // Position on the side of spaceship
            this.alien.position.set(0.5, 0.8, 0); // Right side of the ship

            // Enable shadows
            this.alien.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            this.container.add(this.alien);
            console.log('✅ Alien pilot model loaded');
        } else {
            console.warn('Alien pilot model not found');
        }

        // === ENGINE LIGHTS (3 engines: center + left + right) ===
        // Each engine = emissive glowing plane + point light
        this.engineLights = [];

        // Shared engine plane geometry — square, 30% smaller (0.3 → 0.21)
        // Change the 0.42 values below to resize (width, height)
        const enginePlaneGeo = new THREE.PlaneGeometry(0.20, 0.30);

        // Engine materials - red/orange gradient feel
        // Center engine: hot orange core
        const centerEngineMat = new THREE.MeshStandardMaterial({
            color: 0xFF6600,
            emissive: 0xFF4400,
            emissiveIntensity: 2.0,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });

        // Side engines: deeper red
        const sideEngineMat = new THREE.MeshStandardMaterial({
            color: 0xFF2200,
            emissive: 0xFF3300,
            emissiveIntensity: 2.0,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });

        // --- CENTER ENGINE (line ~106) ---
        const centerPlane = new THREE.Mesh(enginePlaneGeo.clone(), centerEngineMat.clone());
        centerPlane.position.set(0, 0.15, 1);       // Back center of ship
        centerPlane.rotation.y = Math.PI;            // Face backward
        this.container.add(centerPlane);

        const centerLight = new THREE.PointLight(0xFF6600, 0, 10);
        centerLight.position.set(0, 0.15, 1.2);        // Slightly behind the plane
        this.container.add(centerLight);

        this.engineLights.push({ plane: centerPlane, light: centerLight });

        // --- LEFT ENGINE (line ~116) ---
        const leftPlane = new THREE.Mesh(enginePlaneGeo.clone(), sideEngineMat.clone());
        leftPlane.scale.set(0.2, 0.7, 0.7);         // Side engines slightly smaller
        leftPlane.position.set(-0.7, 0.14, 0.6);    // Back-left of ship
        leftPlane.rotation.y = Math.PI;
        this.container.add(leftPlane);

        const leftLight = new THREE.PointLight(0xFF3300, 0, 8);
        leftLight.position.set(-0.7, 0.14, 0.8);
        this.container.add(leftLight);

        this.engineLights.push({ plane: leftPlane, light: leftLight });

        // --- RIGHT ENGINE (line ~127) ---
        const rightPlane = new THREE.Mesh(enginePlaneGeo.clone(), sideEngineMat.clone());
        rightPlane.scale.set(0.2, 0.7, 0.7);
        rightPlane.position.set(0.7, 0.14, 0.6);    // Back-right of ship
        rightPlane.rotation.y = Math.PI;
        this.container.add(rightPlane);

        const rightLight = new THREE.PointLight(0xFF3300, 0, 8);
        rightLight.position.set(0.7, 0.14, 0.8);
        this.container.add(rightLight);

        this.engineLights.push({ plane: rightPlane, light: rightLight });

        // Keep references for particle emission (center + sides)
        this.leftGlow = leftLight;
        this.rightGlow = rightLight;
        this.centerGlow = centerLight;

        this.scene.add(this.container);
    }

    createParticles() {
        // Engine trail particles
        this.particleCount = 100;
        this.particles = [];

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);
        const sizes = new Float32Array(this.particleCount);

        for (let i = 0; i < this.particleCount; i++) {
            // Start particles far off-screen so they're invisible until emitted
            positions[i * 3] = 0;
            positions[i * 3 + 1] = -9999;
            positions[i * 3 + 2] = 0;

            colors[i * 3] = 1.0;     // R
            colors[i * 3 + 1] = 0.3 + Math.random() * 0.3; // G (orange variation)
            colors[i * 3 + 2] = 0.0;  // B

            sizes[i] = 0;

            this.particles.push({
                position: new THREE.Vector3(0, -9999, 0),
                velocity: new THREE.Vector3(0, 0, 0),
                life: 0,
                maxLife: 1.0
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 0.25,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        this.particleSystem = new THREE.Points(geometry, material);
        this.particleSystem.frustumCulled = false;
        this.scene.add(this.particleSystem);

        this.particleIndex = 0;
    }

    emitParticle(position, velocity) {
        const particle = this.particles[this.particleIndex];

        particle.position.copy(position);
        particle.velocity.copy(velocity);
        particle.life = particle.maxLife;

        this.particleIndex = (this.particleIndex + 1) % this.particleCount;
    }

    updateParticles(delta) {
        const positions = this.particleSystem.geometry.attributes.position.array;

        for (let i = 0; i < this.particleCount; i++) {
            const particle = this.particles[i];

            if (particle.life > 0) {
                // Update particle
                particle.position.add(particle.velocity.clone().multiplyScalar(delta / 1000));
                particle.life -= delta / 1000;

                // Set position
                positions[i * 3] = particle.position.x;
                positions[i * 3 + 1] = particle.position.y;
                positions[i * 3 + 2] = particle.position.z;
            } else {
                // Hide dead particles off-screen
                positions[i * 3] = 0;
                positions[i * 3 + 1] = -9999;
                positions[i * 3 + 2] = 0;
            }
        }

        this.particleSystem.geometry.attributes.position.needsUpdate = true;
        this.particleSystem.geometry.attributes.size.needsUpdate = true;
    }

    update(controls) {
        if (!this.physicalVehicle||!this.physicalVehicle.rigidBody) return;
        
        const pos = this.physicalVehicle.getPosition();
        const quat = this.physicalVehicle.getQuaternion();
        
        this.container.position.set(pos.x, pos.y, pos.z);
        this.baseQuaternion.set(quat.x, quat.y, quat.z, quat.w);
        
        // Tilt visual logic
        let pitch = 0;
        let roll = 0;
        
        if (controls.keys.forward) pitch = -0.25; // pitch down roughly 15 degree on forward movement
        if (controls.keys.backward) pitch = 0.15;
        if (controls.keys.left) roll = 0.25; // roll left
        if (controls.keys.right) roll = -0.25;
        
        const tiltQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, 0, roll, 'YXZ'));
        this.targetTilt.slerp(tiltQuat, 0.1); // smooth transition
        
        const finalQuat = this.baseQuaternion.clone().multiply(this.targetTilt);
        this.container.quaternion.copy(finalQuat);
        
        // Modulate all 3 engine lights and emissive planes
        const isMoving = controls.keys.forward || controls.keys.backward || controls.keys.left || controls.keys.right;
        const targetIntensity = isMoving ? (controls.keys.boost ? 6 : 3) : 0.5;
        const targetEmissive = isMoving ? (controls.keys.boost ? 3.0 : 2.0) : 0.3;

        for (const engine of this.engineLights) {
            engine.light.intensity += (targetIntensity - engine.light.intensity) * 0.1;
            engine.plane.material.emissiveIntensity += (targetEmissive - engine.plane.material.emissiveIntensity) * 0.1;
        }

        // Emit engine particles when moving
        if (isMoving && this.frameCount % 2 === 0) {
            const leftEnginePos = new THREE.Vector3();
            const rightEnginePos = new THREE.Vector3();
            const centerEnginePos = new THREE.Vector3();
            this.leftGlow.getWorldPosition(leftEnginePos);
            this.rightGlow.getWorldPosition(rightEnginePos);
            this.centerGlow.getWorldPosition(centerEnginePos);

            // Backward velocity relative to ship
            const backward = new THREE.Vector3(0, 0, 1);
            backward.applyQuaternion(finalQuat);
            backward.multiplyScalar(controls.keys.boost ? -8 : -5);
            backward.y -= 1;

            this.emitParticle(leftEnginePos, backward.clone());
            this.emitParticle(rightEnginePos, backward.clone());
            this.emitParticle(centerEnginePos, backward.clone());
        }

        // Update particle system
        this.updateParticles(this.time.delta);

        // Console log position every 60 frames
        this.frameCount++;
        if (this.frameCount % 60 === 0) {
            const linvel = this.physicalVehicle.rigidBody.linvel();
            const speed = Math.sqrt(linvel.x * linvel.x + linvel.y * linvel.y + linvel.z * linvel.z);
            console.log(`Ship Position: x=${pos.x.toFixed(1)}, y=${pos.y.toFixed(1)}, z=${pos.z.toFixed(1)} | Speed: ${speed.toFixed(1)}`);
        }
    }
}
