import * as THREE from 'three';
import Experience from './Experience.js';
import CameraControls from 'camera-controls';

console.log('Camera module loaded');

CameraControls.install({ THREE: THREE });

export default class Camera {
    constructor() {
        console.log('✅ Camera initialized');
        this.experience = Experience.getInstance();
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;
        this.time = this.experience.time;

        this.setInstance();
        this.setControls();

        // Register update (Priority 0 - camera runs early)
        this.experience.addUpdate(0, () => this.update());
        
        this.sizes.on('resize', () => {
            this.resize();
        });
    }

    setInstance() {
        this.instance = new THREE.PerspectiveCamera(45, this.sizes.width / this.sizes.height, 0.1, 500);
        this.instance.position.set(0, 15, 30);
        this.scene.add(this.instance);
    }

    setControls() {
        this.controls = new CameraControls(this.instance, this.canvas);
        this.controls.smoothTime = 0.2; // Smooth damping
        this.controls.draggingDampingFactor = 0.1;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 100;
        this.controls.setLookAt(0, 15, 30, 0, 0, 0); // initial position and look at origin
    }

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height;
        this.instance.updateProjectionMatrix();
    }

    update() {
        // Vehicle tracking logic
        if (this.experience.world && this.experience.world.physicalVehicle) {
            const shipPos = this.experience.world.physicalVehicle.getPosition();
            const shipQuat = this.experience.world.physicalVehicle.getQuaternion();
            
            // Player can orbit, but orbit center moves with ship
            this.controls.moveTo(shipPos.x, shipPos.y, shipPos.z, true);
            
            // If moving forward, smoothly adjust position behind vehicle
            if (this.experience.controls.keys.forward) {
                const q = new THREE.Quaternion(shipQuat.x, shipQuat.y, shipQuat.z, shipQuat.w);
                const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(q);
                
                const idealPos = new THREE.Vector3(shipPos.x, shipPos.y, shipPos.z);
                idealPos.add(forward.clone().multiplyScalar(-15));
                idealPos.y += 8;
                
                // Set transition target position behind ship
                this.controls.setPosition(idealPos.x, idealPos.y, idealPos.z, true);
            }
        }

        // Delta time is in milliseconds from Time class, camera-controls needs seconds
        this.controls.update(this.time.delta / 1000);
    }
}
