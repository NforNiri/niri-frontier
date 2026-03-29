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
        // Start at max zoom out — same angle as before (0,15,30) scaled to distance 100
        this.controls.setLookAt(0, 45, 89, 0, 0, 0);

        this.cinematicMode = false;
    }

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height;
        this.instance.updateProjectionMatrix();
    }

    cinematicFlyover() {
        this.cinematicMode = true;

        // Increase smooth time for cinematic feel
        this.controls.smoothTime = 1.0;

        // Start from high bird's eye view
        this.controls.setLookAt(0, 60, 80, 0, 0, 0, false);

        // After a beat, sweep down toward the ship spawn point
        setTimeout(() => {
            this.controls.setLookAt(0, 12, 20, 0, 2, 0, true);
        }, 500);

        // After flyover completes, pull back to max-zoom-out and hand off to follow mode
        setTimeout(() => {
            this.controls.smoothTime = 0.6;
            this.controls.setLookAt(0, 45, 89, 0, 0, 0, true); // smooth pull-back to default zoom
            setTimeout(() => {
                this.controls.smoothTime = 0.2;
                this.cinematicMode = false;
            }, 1000);
        }, 3500);
    }

    update() {
        // Skip vehicle tracking during cinematic
        if (this.cinematicMode) {
            this.controls.update(this.time.delta / 1000);
            return;
        }

        // Vehicle tracking — pivot follows ship, zoom distance stays at whatever player set (default max)
        if (this.experience.world && this.experience.world.physicalVehicle) {
            const shipPos = this.experience.world.physicalVehicle.getPosition();
            this.controls.moveTo(shipPos.x, shipPos.y, shipPos.z, true);
        }

        // Delta time is in milliseconds from Time class, camera-controls needs seconds
        this.controls.update(this.time.delta / 1000);
    }
}
