import { Howl, Howler } from 'howler';
import Experience from './Experience.js';

export default class Audio {
    constructor() {
        this.experience = Experience.getInstance();
        this.resources = this.experience.resources;

        this.musicMuted = true;   // music off by default
        this.sfxMuted = true;     // sound effects off by default
        this.started = false;
        this.sounds = {};
        this.musicSounds = ['ambient']; // keys treated as music

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

        // Music starts muted (user must enable)
        if (this.sounds.ambient) {
            this.sounds.ambient.mute(this.musicMuted);
            this.sounds.ambient.play();
        }

        // SFX loops start unmuted
        if (this.sounds.engineIdle) {
            this.sounds.engineIdle.mute(this.sfxMuted);
            this.sounds.engineIdle.play();
        }
        if (this.sounds.engineThrust) {
            this.sounds.engineThrust.mute(this.sfxMuted);
            this.sounds.engineThrust.play();
        }

        console.log('🔊 Audio started (music:', this.musicMuted ? 'off' : 'on', '| sfx:', this.sfxMuted ? 'off' : 'on', ')');
    }

    updateEngine(speed, isBoosting) {
        if (!this.started || this.sfxMuted) return;

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

    playSFX(key) {
        if (!this.started || this.sfxMuted) return;
        if (this.sounds[key]) this.sounds[key].play();
    }

    playBoost()     { this.playSFX('boost'); }
    playBrake()     { this.playSFX('brake'); }
    playZoneEnter() { this.playSFX('zoneEnter'); }
    playZoneExit()  { this.playSFX('zoneExit'); }
    playUIClick()   { this.playSFX('uiClick'); }
    playPanelOpen() { this.playSFX('panelOpen'); }

    toggleMusic() {
        this.musicMuted = !this.musicMuted;
        if (this.sounds.ambient) this.sounds.ambient.mute(this.musicMuted);
        console.log(this.musicMuted ? '🔇 Music off' : '🎵 Music on');
    }

    toggleSFX() {
        this.sfxMuted = !this.sfxMuted;
        // Apply to running SFX loops
        if (this.sounds.engineIdle)   this.sounds.engineIdle.mute(this.sfxMuted);
        if (this.sounds.engineThrust) this.sounds.engineThrust.mute(this.sfxMuted);
        console.log(this.sfxMuted ? '🔇 SFX off' : '🔊 SFX on');
    }

    // Legacy — kept so any old callers don't break; toggles both
    toggleMute() {
        const newState = !(this.musicMuted && this.sfxMuted);
        this.musicMuted = newState;
        this.sfxMuted = newState;
        if (this.sounds.ambient) this.sounds.ambient.mute(this.musicMuted);
        if (this.sounds.engineIdle)   this.sounds.engineIdle.mute(this.sfxMuted);
        if (this.sounds.engineThrust) this.sounds.engineThrust.mute(this.sfxMuted);
    }

    update(speed, isBoosting) {
        this.updateEngine(speed, isBoosting);
    }
}
