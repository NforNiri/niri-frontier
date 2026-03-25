import * as THREE from 'three';
import Experience from '../Experience.js';

export default class VisualVehicle {
    constructor(physicalVehicle) {
        console.log('✅ VisualVehicle initialized');
        this.experience = Experience.getInstance();
        this.scene = this.experience.scene;
        this.physicalVehicle = physicalVehicle;
        this.time = this.experience.time;
        
        this.createVisuals();
        
        this.targetTilt = new THREE.Quaternion();
        this.baseQuaternion = new THREE.Quaternion();
        this.frameCount = 0;
    }
    
    createVisuals() {
        this.container = new THREE.Group();
        
        // Main body
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
        
        // Cockpit dome
        const cockpitGeo = new THREE.SphereGeometry(0.8, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const cockpitMat = new THREE.MeshStandardMaterial({
            color: 0x00F0FF,
            transparent: true,
            opacity: 0.6
        });
        const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
        cockpit.position.y = 0.5;
        this.container.add(cockpit);
        
        // Engine pods
        const engineGeo = new THREE.CylinderGeometry(0.3, 0.4, 1.5);
        engineGeo.rotateX(Math.PI / 2); 
        const engineMat = new THREE.MeshStandardMaterial({ color: 0x1A1A2A });
        
        const leftEngine = new THREE.Mesh(engineGeo, engineMat);
        leftEngine.position.set(-1.8, 0, 1);
        this.container.add(leftEngine);
        
        const rightEngine = new THREE.Mesh(engineGeo, engineMat);
        rightEngine.position.set(1.8, 0, 1);
        this.container.add(rightEngine);
        
        // Engine glows
        this.leftGlow = new THREE.PointLight(0x00F0FF, 0, 8);
        this.leftGlow.position.set(-1.8, 0, 1.8);
        this.container.add(this.leftGlow);
        
        this.rightGlow = new THREE.PointLight(0x00F0FF, 0, 8);
        this.rightGlow.position.set(1.8, 0, 1.8);
        this.container.add(this.rightGlow);
        
        this.scene.add(this.container);
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
        
        // Modulate engine glows
        const isMoving = controls.keys.forward || controls.keys.backward || controls.keys.left || controls.keys.right;
        const targetIntensity = isMoving ? (controls.keys.boost ? 4 : 2) : 0;
        
        this.leftGlow.intensity += (targetIntensity - this.leftGlow.intensity) * 0.1;
        this.rightGlow.intensity += (targetIntensity - this.rightGlow.intensity) * 0.1;
        
        // Console log position every 60 frames
        this.frameCount++;
        if (this.frameCount % 60 === 0) {
            const linvel = this.physicalVehicle.rigidBody.linvel();
            const speed = Math.sqrt(linvel.x * linvel.x + linvel.y * linvel.y + linvel.z * linvel.z);
            console.log(`Ship Position: x=${pos.x.toFixed(1)}, y=${pos.y.toFixed(1)}, z=${pos.z.toFixed(1)} | Speed: ${speed.toFixed(1)}`);
        }
    }
}
