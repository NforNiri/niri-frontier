import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import Experience from '../Experience.js';

export default class Zone {
    constructor(physicalVehicle) {
        this.experience = Experience.getInstance();
        this.scene = this.experience.scene;
        this.time = this.experience.time;
        this.physicalVehicle = physicalVehicle;

        this.activeZone = null;
        this.zones = [];
        this.beacons = [];

        this.defineZones();
        this.createBeacons();

        console.log('✅ Zone system initialized');
    }

    defineZones() {
        this.zoneData = [
            { id: 'about', label: 'ABOUT', position: new THREE.Vector3(0, 0, -70), color: 0x00F0FF, radius: 18 },
            { id: 'development', label: 'DEV', position: new THREE.Vector3(60, 0, -30), color: 0x39FF14, radius: 18 },
            { id: 'genai', label: 'GEN AI', position: new THREE.Vector3(55, 0, 40), color: 0xFFB800, radius: 18 },
            { id: 'creative', label: 'CREATIVE', position: new THREE.Vector3(0, 0, 75), color: 0xFF2D78, radius: 18 },
            { id: 'contact', label: 'CONTACT', position: new THREE.Vector3(-50, 0, 45), color: 0x00F0FF, radius: 18 },
            { id: 'resume', label: 'RESUME', position: new THREE.Vector3(-55, 0, -35), color: 0xFFB800, radius: 18 },
            { id: 'behindthescenes', label: 'BTS', position: new THREE.Vector3(35, 0, -60), color: 0xBB44FF, radius: 18 },
        ];
    }

    createBeacons() {
        for (const zone of this.zoneData) {
            const group = new THREE.Group();
            group.position.copy(zone.position);

            // Glowing pillar
            const pillarGeo = new THREE.CylinderGeometry(0.3, 0.5, 5, 8);
            const pillarMat = new THREE.MeshStandardMaterial({
                color: zone.color,
                emissive: zone.color,
                emissiveIntensity: 0.8,
                transparent: true,
                opacity: 0.6,
            });
            const pillar = new THREE.Mesh(pillarGeo, pillarMat);
            pillar.position.y = 2.5;
            group.add(pillar);

            // Ring at base
            const ringGeo = new THREE.RingGeometry(1.5, 2.0, 32);
            const ringMat = new THREE.MeshStandardMaterial({
                color: zone.color,
                emissive: zone.color,
                emissiveIntensity: 1.5,
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide,
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = -Math.PI / 2;
            ring.position.y = 0.05;
            group.add(ring);

            // Point light
            const light = new THREE.PointLight(zone.color, 2, 20);
            light.position.y = 5;
            group.add(light);

            // CSS2D label
            const labelDiv = document.createElement('div');
            labelDiv.className = 'zone-label';
            labelDiv.textContent = zone.label;
            labelDiv.style.color = '#' + zone.color.toString(16).padStart(6, '0');
            const label = new CSS2DObject(labelDiv);
            label.position.y = 6.5;
            group.add(label);

            this.scene.add(group);

            this.beacons.push({
                group,
                pillar,
                ring,
                light,
                zone,
                baseEmissive: 0.8,
            });
        }
    }

    update() {
        if (!this.physicalVehicle || !this.physicalVehicle.rigidBody) return;

        const shipPos = this.physicalVehicle.getPosition();
        const shipVec = new THREE.Vector3(shipPos.x, 0, shipPos.z);

        let closestZone = null;
        let closestDist = Infinity;

        for (const beacon of this.beacons) {
            const zoneVec = new THREE.Vector3(beacon.zone.position.x, 0, beacon.zone.position.z);
            const dist = shipVec.distanceTo(zoneVec);

            // Pulse when nearby (within 2x radius)
            const nearFactor = Math.max(0, 1 - dist / (beacon.zone.radius * 2));
            const pulse = 1 + Math.sin(this.time.elapsed * 0.003) * 0.15 * nearFactor;
            beacon.pillar.scale.set(pulse, 1, pulse);
            beacon.ring.scale.set(pulse, pulse, 1);
            beacon.light.intensity = 2 + nearFactor * 4;
            beacon.pillar.material.emissiveIntensity = beacon.baseEmissive + nearFactor * 1.5;

            if (dist < beacon.zone.radius && dist < closestDist) {
                closestDist = dist;
                closestZone = beacon.zone;
            }
        }

        // Zone enter/exit logic
        if (closestZone && closestZone.id !== this.activeZone) {
            if (this.activeZone) {
                this.experience.emit('zone:exit', this.activeZone);
            }
            this.activeZone = closestZone.id;
            this.experience.emit('zone:enter', closestZone.id);
            if (this.experience.audio) this.experience.audio.playZoneEnter();
        } else if (!closestZone && this.activeZone) {
            this.experience.emit('zone:exit', this.activeZone);
            if (this.experience.audio) this.experience.audio.playZoneExit();
            this.activeZone = null;
        }
    }
}
