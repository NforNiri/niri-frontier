import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d';
import gsap from 'gsap';
import Experience from '../Experience.js';

export default class InteractiveObjects {
    constructor() {
        this.experience = Experience.getInstance();
        this.scene = this.experience.scene;
        this.physics = this.experience.physics;
        this.resources = this.experience.resources;
        this.time = this.experience.time;

        this.pushables = [];
        this.collectibles = [];
        this.collected = 0;
        this.totalCollectibles = 8;

        this.createPushables();
        this.createCollectibles();
        this.createToast();

        // Update loop — sync physics visuals + check collectible proximity
        this.experience.addUpdate(6, () => this.update());

        console.log('✅ InteractiveObjects initialized');
    }

    cloneModel(name, scale = 1) {
        const model = this.resources.items[name];
        if (!model) return null;
        const clone = model.clone();
        clone.scale.set(scale, scale, scale);
        // Clone materials for isolation but preserve original Kenney textures/shading
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

    createPushables() {
        // Kenney models are ~0.2 units tall, scale 8-15x for good proportions
        const items = [
            // Near spawn (pushed out to avoid camera clipping)
            { model: 'barrel', pos: [15, 0, -12], scale: 10, collider: 1.0 },
            { model: 'barrel', pos: [8, 0, -18], scale: 10, collider: 1.0 },
            { model: 'barrels', pos: [-12, 0, 8], scale: 8, collider: 1.2 },
            // Path to ABOUT
            { model: 'rock', pos: [3, 0, -35], scale: 12, collider: 1.2 },
            { model: 'barrel', pos: [5, 0, -50], scale: 10, collider: 1.0 },
            // Path to DEV
            { model: 'meteor', pos: [30, 0, -20], scale: 10, collider: 1.0 },
            { model: 'barrel', pos: [45, 0, -25], scale: 10, collider: 1.0 },
            // Path to GEN AI
            { model: 'rock', pos: [40, 0, 15], scale: 12, collider: 1.2 },
            { model: 'barrels', pos: [50, 0, 25], scale: 8, collider: 1.2 },
            // Path to CREATIVE
            { model: 'barrel', pos: [10, 0, 45], scale: 10, collider: 1.0 },
            { model: 'rockLarge', pos: [-5, 0, 60], scale: 8, collider: 1.5 },
            // Path to CONTACT
            { model: 'meteor', pos: [-25, 0, 30], scale: 10, collider: 1.0 },
            { model: 'barrel', pos: [-40, 0, 38], scale: 10, collider: 1.0 },
            // Path to RESUME
            { model: 'rock', pos: [-30, 0, -15], scale: 12, collider: 1.2 },
            { model: 'barrels', pos: [-45, 0, -28], scale: 8, collider: 1.2 },
        ];

        for (const item of items) {
            const mesh = this.cloneModel(item.model, item.scale);
            if (!mesh) continue;

            mesh.position.set(item.pos[0], item.pos[1], item.pos[2]);
            this.scene.add(mesh);

            // Rapier dynamic body — center at y=collider so bottom touches ground
            const hs = item.collider;
            const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
                .setTranslation(item.pos[0], item.pos[1] + hs, item.pos[2])
                .setAdditionalMass(0.5)
                .setLinearDamping(3.0)
                .setAngularDamping(2.0);
            const rigidBody = this.physics.world.createRigidBody(bodyDesc);

            // Collider sized to match scaled model
            const colliderDesc = RAPIER.ColliderDesc.cuboid(hs, hs, hs)
                .setRestitution(0.3);
            this.physics.world.createCollider(colliderDesc, rigidBody);

            this.pushables.push({ mesh, rigidBody, colliderHalfHeight: hs });
        }
    }

    createCollectibles() {
        const positions = [
            [25, 2.5, -55],
            [70, 2.5, 5],
            [-10, 2.5, 40],
            [-60, 2.5, 5],
            [35, 2.5, -50],
            [-35, 2.5, 60],
            [10, 2.5, 5],   // was (0,0) — spawn hub, all 7 roads start here
            [-45, 2.5, -55],
        ];

        const geometry = new THREE.SphereGeometry(0.4, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0x39FF14,
            emissive: 0x39FF14,
            emissiveIntensity: 2.0,
            transparent: true,
            opacity: 0.9,
        });

        for (const pos of positions) {
            const group = new THREE.Group();
            group.position.set(pos[0], pos[1], pos[2]);

            const sphere = new THREE.Mesh(geometry.clone(), material.clone());
            group.add(sphere);

            // PointLight only on high quality — emissive sphere already glows on mobile
            let light = null;
            if (this.experience.renderer.quality === 'high') {
                light = new THREE.PointLight(0x39FF14, 2, 8);
                group.add(light);
            }

            this.scene.add(group);

            this.collectibles.push({
                group,
                sphere,
                light,
                baseY: pos[1],
                collected: false,
            });
        }
    }

    createToast() {
        this.toast = document.createElement('div');
        this.toast.className = 'collect-toast';
        this.toast.style.opacity = '0';
        document.body.appendChild(this.toast);
    }

    showToast() {
        this.toast.textContent = `${this.collected}/${this.totalCollectibles} SIGNAL FRAGMENTS FOUND`;
        gsap.killTweensOf(this.toast);
        gsap.fromTo(this.toast,
            { opacity: 0, y: -10 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
        );
        gsap.to(this.toast, {
            opacity: 0,
            delay: 2,
            duration: 0.5,
            ease: 'power2.in'
        });
    }

    collectOrb(collectible) {
        collectible.collected = true;
        this.collected++;

        // Remove from scene
        this.scene.remove(collectible.group);
        collectible.sphere.geometry.dispose();
        collectible.sphere.material.dispose();

        // Play sound
        if (this.experience.audio) {
            this.experience.audio.playZoneEnter();
        }

        // Show toast
        this.showToast();

        if (this.collected === this.totalCollectibles) {
            this.toast.textContent = 'ALL SIGNAL FRAGMENTS COLLECTED!';
        }
    }

    update() {
        const elapsed = this.time.elapsed;

        // Sync pushable meshes to physics bodies
        for (const obj of this.pushables) {
            const pos = obj.rigidBody.translation();
            const rot = obj.rigidBody.rotation();
            // Offset Y down by collider half-height so model base sits on ground
            obj.mesh.position.set(pos.x, pos.y - obj.colliderHalfHeight, pos.z);
            obj.mesh.quaternion.set(rot.x, rot.y, rot.z, rot.w);
        }

        // Animate and check collectibles
        if (!this.experience.world || !this.experience.world.physicalVehicle) return;
        const shipPos = this.experience.world.physicalVehicle.getPosition();

        for (const orb of this.collectibles) {
            if (orb.collected) continue;

            // Bob animation
            orb.group.position.y = orb.baseY + Math.sin(elapsed * 0.002) * 0.3;
            orb.sphere.rotation.y += 0.01;

            // Distance check for collection
            const dx = shipPos.x - orb.group.position.x;
            const dz = shipPos.z - orb.group.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist < 2.5) {
                this.collectOrb(orb);
            }
        }
    }
}
