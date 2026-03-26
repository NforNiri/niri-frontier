import * as THREE from 'three';
import Experience from '../Experience.js';
import Environment from './Environment.js';
import Zone from './Zone.js';
import InteractiveObjects from './InteractiveObjects.js';
import WorldDressing from './WorldDressing.js';
import NeonRoad from './NeonRoad.js';
import NeonLights from './NeonLights.js';
import Vegetation from './Vegetation.js';
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

        // Environment (lights, stars, fog)
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

            // Audio update
            if (this.experience.audio) {
                this.experience.addUpdate(5, () => {
                    const vel = this.physicalVehicle.rigidBody ? this.physicalVehicle.rigidBody.linvel() : { x: 0, z: 0 };
                    const speed = Math.sqrt(vel.x ** 2 + vel.z ** 2);
                    this.experience.audio.update(speed, this.experience.controls.keys.boost);
                });
            }

            // Interactive objects + world dressing
            this.interactiveObjects = new InteractiveObjects();
            this.worldDressing = new WorldDressing();

            // Neon road network
            this.neonRoad = new NeonRoad();

            // Neon accent lights
            this.neonLights = new NeonLights();

            // Alien vegetation
            this.vegetation = new Vegetation();

            // Animated systems update
            this.experience.addUpdate(7, () => {
                if (this.neonRoad) this.neonRoad.update();
                if (this.neonLights) this.neonLights.update();
                if (this.vegetation) this.vegetation.update();
            });

            // UI system
            this.ui = new UI();
        };

        if (this.experience.physics.world) {
            spawnVehicle();
        } else {
            this.experience.physics.on('ready', spawnVehicle);
        }
    }

    setGround() {
        const geometry = new THREE.PlaneGeometry(200, 200);
        geometry.rotateX(-Math.PI / 2);

        const material = new THREE.MeshStandardMaterial({
            color: 0x151A2E,
            roughness: 0.9,
        });

        this.ground = new THREE.Mesh(geometry, material);
        this.ground.receiveShadow = true;
        this.ground.position.y = 0;
        this.container.add(this.ground);

        // Grid overlay — subtle
        const gridHelper = new THREE.GridHelper(200, 40, 0x00F0FF, 0x0A1A2A);
        gridHelper.position.y = 0.01;
        gridHelper.material.opacity = 0.15;
        gridHelper.material.transparent = true;
        this.container.add(gridHelper);
    }
}
