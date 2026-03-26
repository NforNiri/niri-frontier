import * as THREE from 'three';
import Experience from '../Experience.js';

console.log('Environment module loaded');

export default class Environment {
    constructor() {
        console.log('✅ Environment initialized');
        this.experience = Experience.getInstance();
        this.scene = this.experience.scene;

        this.scene.background = new THREE.Color(0x0A0E1A);
        this.scene.fog = new THREE.Fog(0x0A0E1A, 80, 200);

        this.setSunlight();
        this.setAmbientLight();
        this.setStars();
    }

    setSunlight() {
        // Primary directional — cool white from above-right
        this.sunLight = new THREE.DirectionalLight(0xCCDDFF, 2.5);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 1;
        this.sunLight.shadow.camera.far = 100;
        this.sunLight.shadow.camera.left = -60;
        this.sunLight.shadow.camera.right = 60;
        this.sunLight.shadow.camera.top = 60;
        this.sunLight.shadow.camera.bottom = -60;
        this.sunLight.position.set(20, 40, 20);
        this.scene.add(this.sunLight);

        // Secondary fill light — warm kick from opposite side
        this.fillLight = new THREE.DirectionalLight(0xFFAA66, 0.8);
        this.fillLight.position.set(-15, 10, -15);
        this.scene.add(this.fillLight);
    }

    setAmbientLight() {
        // Overall ambient — neutral white so Kenney colors come through
        this.ambientLight = new THREE.AmbientLight(0x666688, 1.2);
        this.scene.add(this.ambientLight);

        // Hemisphere — sky blue from above, dark ground from below
        this.hemisphereLight = new THREE.HemisphereLight(0x88AAFF, 0x224488, 0.6);
        this.scene.add(this.hemisphereLight);
    }

    setStars() {
        // Base stars
        const particlesCount = 3000;
        const positions = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount; i++) {
            const r = 300 + Math.random() * 200; // radius from 300 to 500
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 1.0,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8,
            fog: false // Not affected by fog
        });

        this.stars = new THREE.Points(geometry, material);
        this.scene.add(this.stars);

        // Bright stars
        const brightCount = 200;
        const brightPositions = new Float32Array(brightCount * 3);

        for (let i = 0; i < brightCount; i++) {
            const r = 150 + Math.random() * 250; // radius from 150 to 400
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);

            brightPositions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
            brightPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            brightPositions[i * 3 + 2] = r * Math.cos(phi);
        }

        const brightGeometry = new THREE.BufferGeometry();
        brightGeometry.setAttribute('position', new THREE.BufferAttribute(brightPositions, 3));

        const brightMaterial = new THREE.PointsMaterial({
            color: 0xFFFFCC,
            size: 2.0,
            sizeAttenuation: true,
            transparent: true,
            opacity: 1.0,
            fog: false
        });

        this.brightStars = new THREE.Points(brightGeometry, brightMaterial);
        this.scene.add(this.brightStars);
    }
}
