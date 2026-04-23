import * as THREE from 'three';
import Experience from '../Experience.js';
import * as RAPIER from '@dimforge/rapier3d';

export default class PhysicalVehicle {
    constructor() {
        console.log('✅ PhysicalVehicle initialized');
        this.experience = Experience.getInstance();
        this.physics = this.experience.physics;
        this.world = this.physics.world;

        this.params = {
            forwardForce:    90,   // confirmed good
            backwardForce:   90,   // confirmed good
            linearDamping:   12,   // Rapier passive damping — higher = stops faster
            angularDamping:  8.0,
            maxSpeed:        8,
            boostSpeed:      16,
            boostMultiplier: 1.6,
        };

        // Pre-allocated scratch objects to avoid per-frame GC allocations
        this._scratchForward = new THREE.Vector3();
        this._scratchQuat = new THREE.Quaternion();

        this.createVehicle();

        if (new URLSearchParams(window.location.search).get('debug') === '1') {
            this._initDebugGUI();
        }
    }

    createVehicle() {
        let rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(0, 2, 0)
            .setAdditionalMass(200)
            .setLinearDamping(this.params.linearDamping)
            .setAngularDamping(this.params.angularDamping)
            .setDominanceGroup(127);

        this.rigidBody = this.world.createRigidBody(rigidBodyDesc);

        // Cuboid collider — half-extents (0.75, 0.25, 1.0) = 1.5 x 0.5 x 2.0 box
        let colliderDesc = RAPIER.ColliderDesc.cuboid(0.75, 0.25, 1.0);
        this.collider = this.world.createCollider(colliderDesc, this.rigidBody);
    }

    getPosition() {
        if (!this.rigidBody) return { x: 0, y: 0, z: 0 };
        return this.rigidBody.translation();
    }

    getQuaternion() {
        if (!this.rigidBody) return { x: 0, y: 0, z: 0, w: 1 };
        return this.rigidBody.rotation();
    }

    update(controls) {
        if (!this.rigidBody) return;

        const position = this.rigidBody.translation();
        const rotation = this.rigidBody.rotation();
        const velocity = this.rigidBody.linvel();
        const angvel   = this.rigidBody.angvel();

        // Local forward direction (reuse scratch objects)
        const forward = this._scratchForward.set(0, 0, -1);
        const quat = this._scratchQuat.set(rotation.x, rotation.y, rotation.z, rotation.w);
        forward.applyQuaternion(quat);

        const maxSpeed = controls.keys.boost ? this.params.boostSpeed : this.params.maxSpeed;
        const speed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2);

        // Sync Rapier damping from GUI (takes effect next world.step())
        this.rigidBody.setLinearDamping(this.params.linearDamping);
        this.rigidBody.setAngularDamping(this.params.angularDamping);

        // Force tapers off as speed approaches max
        const speedRatio = Math.min(speed / maxSpeed, 1);
        const forceTaper = 1 - speedRatio * 0.85;
        const baseForceMagnitude = controls.keys.forward
            ? this.params.forwardForce
            : controls.keys.backward ? -this.params.backwardForce : 0;
        const boostMultiplier = controls.keys.boost && controls.keys.forward ? this.params.boostMultiplier : 1.0;
        const finalForce = baseForceMagnitude * boostMultiplier * forceTaper;

        this.rigidBody.addForce({ x: forward.x * finalForce, y: 0, z: forward.z * finalForce }, true);

        // Brake (Space)
        if (controls.keys.brake && speed > 0.3) {
            const brakeForce = 660;
            this.rigidBody.addForce({
                x: -velocity.x / speed * brakeForce,
                y: 0,
                z: -velocity.z / speed * brakeForce
            }, true);
        }

        // Steering
        const steerStrength = 2.5 - speedRatio * 0.8;
        let targetYAngVel = 0;
        const isTurning = controls.keys.left || controls.keys.right;
        if (controls.keys.left)  targetYAngVel =  steerStrength;
        if (controls.keys.right) targetYAngVel = -steerStrength;

        if (isTurning && speed > 0.5) {
            const turnBrake = 200 * speedRatio;
            this.rigidBody.addForce({
                x: -velocity.x / speed * turnBrake,
                y: 0,
                z: -velocity.z / speed * turnBrake
            }, true);
        }

        const newYAngVel = angvel.y + (targetYAngVel - angvel.y) * 0.15;
        this.rigidBody.setAngvel({ x: 0, y: newYAngVel, z: 0 }, true);

        // Hover spring
        const targetHeight = 2.0;
        if (position.y < targetHeight + 1.0) {
            const heightError = targetHeight - position.y;
            const hoverForce = heightError * 460 + (-velocity.y * 330);
            this.rigidBody.addForce({ x: 0, y: hoverForce, z: 0 }, true);
        }

        // Speed clamp
        if (speed > maxSpeed) {
            const scale = maxSpeed / speed;
            this.rigidBody.setLinvel({ x: velocity.x * scale, y: velocity.y, z: velocity.z * scale }, true);
        }

    }

    _initDebugGUI() {
        import('https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm').then(({ default: GUI }) => {
            const gui = new GUI({ title: 'Ship Physics  (?debug=1)' });
            // Position on the LEFT so it doesn't overlap the WorldDressing scene editor (right side)
            gui.domElement.style.position = 'fixed';
            gui.domElement.style.top = '15px';
            gui.domElement.style.left = '15px';
            gui.domElement.style.right = 'auto';

            gui.add(this.params, 'forwardForce',    10, 300,  5).name('Forward Force');
            gui.add(this.params, 'backwardForce',   10, 300,  5).name('Backward Force');
            gui.add(this.params, 'linearDamping',    1,  30,  0.5).name('Linear Damping (traction)');
            gui.add(this.params, 'angularDamping',   1,  20,  0.5).name('Angular Damping (spin)');
            gui.add(this.params, 'maxSpeed',         2,  20,  0.5).name('Max Speed');
            gui.add(this.params, 'boostSpeed',       4,  40,  0.5).name('Boost Speed');
            gui.add(this.params, 'boostMultiplier',  1,   4,  0.1).name('Boost Force ×');

            gui.add({ reset: () => {
                Object.assign(this.params, {
                    forwardForce: 70, backwardForce: 90, linearDamping: 12,
                    angularDamping: 8.0, maxSpeed: 8, boostSpeed: 16, boostMultiplier: 1.6,
                });
                gui.controllersRecursive().forEach(c => c.updateDisplay());
            }}, 'reset').name('↺ Reset to defaults');
        });
    }
}
