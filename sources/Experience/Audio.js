import { Howl, Howler } from 'howler';
import Experience from './Experience.js';

export default class Audio {
    constructor() {
        this.experience = Experience.getInstance();
        this.resources = this.experience.resources;

        this.muted = true;
        this.started = false;
        this.sounds = {};

        this.createSounds();
        console.log('✅ Audio initialized');
    }

    createSounds() {
        // Ambient loop
        this.sounds.ambient = this.createHowl('/sounds/ambient.mp3', {
            loop: true,
            volume: 0.15
        });

        // Engine loops
        this.sounds.engineIdle = this.createHowl('/sounds/engine-idle.mp3', {
            loop: true,
            volume: 0
        });

        this.sounds.engineThrust = this.createHowl('/sounds/engine-thrust.mp3', {
            loop: true,
            volume: 0
        });

        // One-shots
        this.sounds.boost = this.createHowl('/sounds/boost.mp3', { volume: 0.4 });
        this.sounds.brake = this.createHowl('/sounds/brake.mp3', { volume: 0.3 });
        this.sounds.zoneEnter = this.createHowl('/sounds/zone-enter.mp3', { volume: 0.5 });
        this.sounds.zoneExit = this.createHowl('/sounds/zone-exit.mp3', { volume: 0.3 });
        this.sounds.uiClick = this.createHowl('/sounds/ui-click.mp3', { volume: 0.3 });
        this.sounds.panelOpen = this.createHowl('/sounds/panel-open.mp3', { volume: 0.3 });
    }

    createHowl(src, options = {}) {
        try {
            return new Howl({
                src: [src],
                ...options,
                onloaderror: (id, err) => {
                    console.warn(`Audio not found: ${src} — skipping`);
                }
            });
        } catch (e) {
            console.warn(`Failed to create audio: ${src}`);
            return null;
        }
    }

    start() {
        if (this.started) return;
        this.started = true;
        this.muted = false;

        Howler.mute(false);

        // Start loops
        if (this.sounds.ambient) this.sounds.ambient.play();
        if (this.sounds.engineIdle) this.sounds.engineIdle.play();
        if (this.sounds.engineThrust) this.sounds.engineThrust.play();

        console.log('🔊 Audio started');
    }

    updateEngine(speed, isBoosting) {
        if (!this.started) return;

        const maxSpeed = isBoosting ? 16 : 8;
        const speedRatio = Math.min(speed / maxSpeed, 1);

        // Crossfade idle ↔ thrust
        const idleVol = Math.max(0, 0.15 * (1 - speedRatio * 1.5));
        const thrustVol = Math.min(0.35, speedRatio * 0.4);

        if (this.sounds.engineIdle) this.sounds.engineIdle.volume(idleVol);
        if (this.sounds.engineThrust) {
            this.sounds.engineThrust.volume(thrustVol);
            this.sounds.engineThrust.rate(0.8 + speedRatio * 0.6);
        }

        // Boost bump
        if (isBoosting && this.sounds.engineThrust) {
            this.sounds.engineThrust.volume(Math.min(0.5, thrustVol + 0.15));
            this.sounds.engineThrust.rate(1.0 + speedRatio * 0.5);
        }
    }

    playBoost() {
        if (this.sounds.boost && this.started) this.sounds.boost.play();
    }

    playBrake() {
        if (this.sounds.brake && this.started) this.sounds.brake.play();
    }

    playZoneEnter() {
        if (this.sounds.zoneEnter && this.started) this.sounds.zoneEnter.play();
    }

    playZoneExit() {
        if (this.sounds.zoneExit && this.started) this.sounds.zoneExit.play();
    }

    playUIClick() {
        if (this.sounds.uiClick && this.started) this.sounds.uiClick.play();
    }

    playPanelOpen() {
        if (this.sounds.panelOpen && this.started) this.sounds.panelOpen.play();
    }

    toggleMute() {
        this.muted = !this.muted;
        Howler.mute(this.muted);
        console.log(this.muted ? '🔇 Audio muted' : '🔊 Audio unmuted');
    }

    update(speed, isBoosting) {
        this.updateEngine(speed, isBoosting);
    }
}
