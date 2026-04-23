import * as THREE from 'three';
import Experience from '../Experience.js';

console.log('Environment module loaded');

export default class Environment {
    constructor() {
        console.log('✅ Environment initialized');
        this.experience = Experience.getInstance();
        this.scene = this.experience.scene;
        this.time = this.experience.time;

        this.scene.background = new THREE.Color(0x080E1E);
        this.scene.fog = new THREE.Fog(0x080E1E, 60, 200);

        this.setSunlight();
        this.setAmbientLight();
        this.setStars();

        // Day/night cycle — priority 8 (after all world systems)
        this.experience.addUpdate(8, () => this.update());
    }

    setSunlight() {
        // Primary directional — bright desert sun
        this.sunLight = new THREE.DirectionalLight(0xFFD09A, 2.8);
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

        // Secondary fill light — warm sand bounce from opposite side
        this.fillLight = new THREE.DirectionalLight(0xFFAA55, 0.3);
        this.fillLight.position.set(-15, 10, -15);
        this.scene.add(this.fillLight);

        // Moonlight — cool blue-white, fixed position, fades in at night
        this.moonLight = new THREE.DirectionalLight(0x8899DD, 0.0);
        this.moonLight.position.set(-25, 35, 15);
        this.scene.add(this.moonLight);
    }

    setAmbientLight() {
        // Overall ambient — warm sandy tint
        this.ambientLight = new THREE.AmbientLight(0x887755, 0.75);
        this.scene.add(this.ambientLight);

        // Hemisphere — hazy tan sky from above, warm sand ground from below
        this.hemisphereLight = new THREE.HemisphereLight(0xFFCC88, 0xC49A45, 0.45);
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

    update() {
        if (!this.time) return;

        // Full day/night cycle over 5 minutes.
        // Start offset +90 000 ms puts t≈0.30 at launch — post-sunrise golden morning.
        const cycleDuration = 300000;
        const t = (this.time.elapsed % cycleDuration) / cycleDuration;

        // sunElevation: -1 at midnight, 0 at sunrise/sunset, +1 at noon
        const sunElevation = Math.sin((t - 0.25) * Math.PI * 2);
        const sunAbove    = Math.max(0, sunElevation); // clamped 0-1

        // twilight: 0 = full night, 1 = fully above horizon (smooth band)
        const twilight  = THREE.MathUtils.smoothstep(sunElevation, -0.12, 0.20);
        // dayFactor: 0 at horizon, 1 at high noon (drives warm→pale shift)
        const dayFactor = THREE.MathUtils.smoothstep(sunElevation,  0.00, 0.85);

        // ── Directional sun ──────────────────────────────────────────────
        // Sweeps east (+x) → west (-x) with a slight north-south arc
        const lateralAngle = (t - 0.25) * Math.PI;
        this.sunLight.position.set(
            Math.cos(lateralAngle) * 40,
            Math.max(2, sunAbove * 50),
            Math.sin(lateralAngle) * -15
        );
        this.sunLight.intensity = sunAbove * sunAbove * 2.6;
        // Warm amber at horizon → soft warm gold at noon
        this.sunLight.color.setRGB(
            1.0,
            THREE.MathUtils.lerp(0.55, 0.78, dayFactor),
            THREE.MathUtils.lerp(0.20, 0.48, dayFactor)
        );

        // ── Moonlight (inverse of sun — fades in as sun sets) ────────────
        this.moonLight.intensity = THREE.MathUtils.lerp(0.55, 0.0, twilight);

        // ── Fill light ───────────────────────────────────────────────────
        this.fillLight.intensity = twilight * 0.6;

        // ── Ambient ──────────────────────────────────────────────────────
        // Night floor raised to 0.38 with a blue-silver tint (moonlit feel)
        this.ambientLight.intensity = THREE.MathUtils.lerp(0.38, 0.75, twilight);
        this.ambientLight.color.setRGB(
            THREE.MathUtils.lerp(0.10, 0.53, twilight),  // night: muted blue-grey → warm sandy day
            THREE.MathUtils.lerp(0.12, 0.47, twilight),
            THREE.MathUtils.lerp(0.22, 0.33, twilight)
        );

        // ── Hemisphere ───────────────────────────────────────────────────
        this.hemisphereLight.intensity = THREE.MathUtils.lerp(0.35, 0.45, twilight);
        // Night sky: steel blue  →  Dawn: warm tan  →  Noon: bright hazy sand
        this.hemisphereLight.color.setRGB(
            THREE.MathUtils.lerp(0.10, THREE.MathUtils.lerp(0.95, 1.00, dayFactor), twilight),
            THREE.MathUtils.lerp(0.14, THREE.MathUtils.lerp(0.60, 0.80, dayFactor), twilight),
            THREE.MathUtils.lerp(0.28, THREE.MathUtils.lerp(0.25, 0.45, dayFactor), twilight)
        );
        // Ground bounce: cool dark blue at night → warm sandy tan day
        this.hemisphereLight.groundColor.setRGB(
            THREE.MathUtils.lerp(0.04, 0.72, twilight),
            THREE.MathUtils.lerp(0.05, 0.50, twilight),
            THREE.MathUtils.lerp(0.10, 0.18, twilight)
        );

        // ── Sky background + fog ─────────────────────────────────────────
        // Night: #080E1E (deep blue)  Dawn: #D4915A (sand-amber)  Noon: #E8C080 (bright sand haze)
        const bgR = THREE.MathUtils.lerp(0.032, THREE.MathUtils.lerp(0.83, 0.91, dayFactor), twilight);
        const bgG = THREE.MathUtils.lerp(0.055, THREE.MathUtils.lerp(0.57, 0.75, dayFactor), twilight);
        const bgB = THREE.MathUtils.lerp(0.120, THREE.MathUtils.lerp(0.35, 0.50, dayFactor), twilight);
        this.scene.background.setRGB(bgR, bgG, bgB);
        this.scene.fog.color.setRGB(bgR, bgG, bgB);

        // ── Stars ────────────────────────────────────────────────────────
        // Fade out as twilight rises; fully gone well before noon
        const starOpacity = Math.max(0, 1.0 - twilight * 2.5);
        if (this.stars)       this.stars.material.opacity       = starOpacity;
        if (this.brightStars) this.brightStars.material.opacity = Math.min(1.0, starOpacity * 1.3);
    }
}
