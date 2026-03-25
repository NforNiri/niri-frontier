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
            .setLinearDamping(3.0)
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
        
        // Forces (reduced for slower movement)
        const forceMagnitude = controls.keys.forward ? 80 : controls.keys.backward ? -50 : 0;
        const boostMultiplier = controls.keys.boost && controls.keys.forward ? 2.0 : 1.0;
        const finalForce = forceMagnitude * boostMultiplier;
        
        // Apply movement force in local forward direction (horizontal only)
        this.rigidBody.addForce({
            x: forward.x * finalForce,
            y: 0,
            z: forward.z * finalForce
        }, true);
        
        // Steering via angular velocity
        let targetYAngVel = 0;
        if (controls.keys.left) targetYAngVel = 3.0;
        if (controls.keys.right) targetYAngVel = -3.0;
        
        // Smoothly adjust angular velocity
        const currentYAngVel = angvel.y;
        const newYAngVel = currentYAngVel + (targetYAngVel - currentYAngVel) * 0.2;
        this.rigidBody.setAngvel({ x: 0, y: newYAngVel, z: 0 }, true);
        
        // Hover spring with damping (stronger hover)
        const targetHeight = 2.0;
        if (position.y < targetHeight + 1.0) {
            const heightError = targetHeight - position.y;
            const springForce = heightError * 70;
            const dampForce = -velocity.y * 50;
            const hoverForce = springForce + dampForce;

            this.rigidBody.addForce({ x: 0, y: hoverForce, z: 0 }, true);
        }
        
        // Clamp linear velocity (horizontal only) - reduced for slower movement
        const speed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2);
        const maxSpeed = controls.keys.boost ? 25 : 15;
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
