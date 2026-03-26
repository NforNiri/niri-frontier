import * as THREE from 'three';
import Experience from '../Experience.js';
import Environment from './Environment.js';
import Zone from './Zone.js';
import PhysicalVehicle from '../Vehicle/PhysicalVehicle.js';
import VisualVehicle from '../Vehicle/VisualVehicle.js';
import UI from '../UI/UI.js';

console.log('World module loaded');

export default class World {
    constructor() {
        console.log('✅ World initialized');
        this.experience = Experience.getInstance();
        this.scene = this.experience.scene;

        // Container
        this.container = new THREE.Group();
        this.container.name = 'world';
        this.scene.add(this.container);

        // Ground visual
        this.setGround();

        // Test Object
        this.setTestObject();

        // Environment
        this.environment = new Environment();

        // Load vehicle logic
        const spawnVehicle = () => {
            console.log('Spawning vehicle...');
            this.physicalVehicle = new PhysicalVehicle();
            this.visualVehicle = new VisualVehicle(this.physicalVehicle);

            // Register game loop updates for vehicles
            this.experience.addUpdate(2, () => {
                this.physicalVehicle.update(this.experience.controls, this.experience.time.delta);
            });
            this.experience.addUpdate(3, () => {
                this.visualVehicle.update(this.experience.controls);
            });

            // Zone system
            this.zones = new Zone(this.physicalVehicle);
            this.experience.addUpdate(4, () => {
                this.zones.update();
            });

            // UI system
            this.ui = new UI();

            // Remove test cube
            if (this.testCube) {
                this.container.remove(this.testCube);
                this.testCube.geometry.dispose();
                this.testCube.material.dispose();
                this.testCube = null;
            }
        };

        if (this.experience.physics.world) {
            spawnVehicle();
        } else {
            this.experience.physics.on('ready', spawnVehicle);
        }
    }

    setGround() {
        const geometry = new THREE.PlaneGeometry(200, 200);
        geometry.rotateX(-Math.PI / 2); // Rotate to be flat

        const material = new THREE.MeshStandardMaterial({ 
            color: 0x1A1F3A
        });

        this.ground = new THREE.Mesh(geometry, material);
        this.ground.receiveShadow = true;
        this.ground.position.y = 0;
        this.container.add(this.ground);

        // Grid overlay
        const gridHelper = new THREE.GridHelper(200, 40, 0x00F0FF, 0x0A2A4A);
        gridHelper.position.y = 0;
        this.container.add(gridHelper);
    }

    setTestObject() {
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00F0FF,
            emissive: 0x00F0FF,
            emissiveIntensity: 0.3
        });

        this.testCube = new THREE.Mesh(geometry, material);
        this.testCube.position.set(0, 1, 0);
        this.testCube.castShadow = true;
        this.testCube.receiveShadow = true;
        this.container.add(this.testCube);
    }
}
