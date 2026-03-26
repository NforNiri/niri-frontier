import * as THREE from 'three';
import Experience from '../Experience.js';
import * as RAPIER from '@dimforge/rapier3d';

export default class PhysicalVehicle {
    constructor() {
        console.log('✅ PhysicalVehicle initialized');
        this.experience = Experience.getInstance();
        this.physics = this.experience.physics;
        this.world = this.physics.world;
        
        this.createVehicle();
    }
    
    createVehicle() {
        // dynamic type
        let rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(0, 2, 0)
            .setAdditionalMass(30)
            .setLinearDamping(8.0)
            .setAngularDamping(8.0);
        
        this.rigidBody = this.world.createRigidBody(rigidBodyDesc);
        
        // Cuboid collider
        // Rapier uses half-extents (0.75, 0.25, 1.0) for a 1.5 x 0.5 x 2.0 box
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
    
    update(controls, delta) {
        if (!this.rigidBody) return;

        this.frameCount = (this.frameCount || 0) + 1;

        const position = this.rigidBody.translation();
        const rotation = this.rigidBody.rotation(); // quaternion
        const velocity = this.rigidBody.linvel();
        const angvel = this.rigidBody.angvel();
        
        // Calculate local forward direction from ship's rotation
        // In Three.js, forward is typically (0, 0, -1)
        const forward = new THREE.Vector3(0, 0, -1);
        const quat = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
        forward.applyQuaternion(quat);
        
        // Horizontal speed (used for brake + clamp)
        const speed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2);
        const maxSpeed = controls.keys.boost ? 16 : 8;

        // Force tapers off as speed approaches max (car-like resistance)
        const speedRatio = Math.min(speed / maxSpeed, 1);
        const forceTaper = 1 - speedRatio * 0.85; // at max speed, only 15% force remains
        const baseForceMagnitude = controls.keys.forward ? 30 : controls.keys.backward ? -18 : 0;
        const boostMultiplier = controls.keys.boost && controls.keys.forward ? 1.6 : 1.0;
        const finalForce = baseForceMagnitude * boostMultiplier * forceTaper;

        // Apply movement force in local forward direction (horizontal only)
        this.rigidBody.addForce({
            x: forward.x * finalForce,
            y: 0,
            z: forward.z * finalForce
        }, true);

        // Brake (Space) — strong counter-force opposing current velocity
        if (controls.keys.brake && speed > 0.3) {
            const brakeForce = 100;
            this.rigidBody.addForce({
                x: -velocity.x / speed * brakeForce,
                y: 0,
                z: -velocity.z / speed * brakeForce
            }, true);
        }

        // Steering — reduces at high speed for stability
        const steerStrength = 2.5 - speedRatio * 0.8; // 2.5 at rest, 1.7 at max speed
        let targetYAngVel = 0;
        const isTurning = controls.keys.left || controls.keys.right;
        if (controls.keys.left) targetYAngVel = steerStrength;
        if (controls.keys.right) targetYAngVel = -steerStrength;

        // Turn friction — slows ship when steering for tighter control
        if (isTurning && speed > 0.5) {
            const turnBrake = 30 * speedRatio; // stronger at higher speed
            this.rigidBody.addForce({
                x: -velocity.x / speed * turnBrake,
                y: 0,
                z: -velocity.z / speed * turnBrake
            }, true);
        }

        // Smoothly adjust angular velocity
        const currentYAngVel = angvel.y;
        const newYAngVel = currentYAngVel + (targetYAngVel - currentYAngVel) * 0.15;
        this.rigidBody.setAngvel({ x: 0, y: newYAngVel, z: 0 }, true);

        // Hover spring with damping
        const targetHeight = 2.0;
        if (position.y < targetHeight + 1.0) {
            const heightError = targetHeight - position.y;
            const springForce = heightError * 70;
            const dampForce = -velocity.y * 50;
            const hoverForce = springForce + dampForce;

            this.rigidBody.addForce({ x: 0, y: hoverForce, z: 0 }, true);
        }
        if (speed > maxSpeed) {
            const scale = maxSpeed / speed;
            this.rigidBody.setLinvel({
                x: velocity.x * scale,
                y: velocity.y,
                z: velocity.z * scale
            }, true);
        }

        if (this.frameCount % 60 === 0) {
            console.log(`Ship Physics: Height=${position.y.toFixed(2)} | Speed=${speed.toFixed(1)}`);
        }
    }
}
