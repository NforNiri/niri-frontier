import gsap from 'gsap';
import Experience from '../Experience.js';

export default class GameMenu {
    constructor() {
        this.experience = Experience.getInstance();
        this.isOpen = false;

        this.createElement();
        this.bindEvents();

        console.log('✅ GameMenu initialized');
    }

    createElement() {
        // Hamburger button (always visible)
        this.menuBtn = document.createElement('button');
        this.menuBtn.id = 'menu-btn';
        this.menuBtn.innerHTML = `
            <span class="menu-bar"></span>
            <span class="menu-bar"></span>
            <span class="menu-bar"></span>
        `;
        this.menuBtn.title = 'Menu (ESC)';
        document.body.appendChild(this.menuBtn);

        // Full menu overlay
        this.overlay = document.createElement('div');
        this.overlay.id = 'game-menu';
        this.overlay.innerHTML = `
            <div class="menu-backdrop"></div>
            <div class="menu-container">
                <div class="menu-accent"></div>
                <button class="menu-close">&times;</button>

                <div class="menu-header">
                    <h2 class="menu-title">NIRI'S FRONTIER</h2>
                    <p class="menu-subtitle">NAVIGATION &bull; SETTINGS &bull; CONTROLS</p>
                </div>

                <div class="menu-body">
                    <!-- Navigation Section -->
                    <div class="menu-section">
                        <h3 class="menu-section-title">⚡ TELEPORT TO ZONE</h3>
                        <div class="nav-grid" id="nav-grid">
                            <button class="nav-btn" data-zone="about" data-color="#00F0FF">
                                <span class="nav-icon">🛸</span>
                                <span class="nav-label">ABOUT</span>
                            </button>
                            <button class="nav-btn" data-zone="development" data-color="#39FF14">
                                <span class="nav-icon">💻</span>
                                <span class="nav-label">DEV</span>
                            </button>
                            <button class="nav-btn" data-zone="genai" data-color="#FFB800">
                                <span class="nav-icon">🤖</span>
                                <span class="nav-label">GEN AI</span>
                            </button>
                            <button class="nav-btn" data-zone="creative" data-color="#FF2D78">
                                <span class="nav-icon">🎨</span>
                                <span class="nav-label">CREATIVE</span>
                            </button>
                            <button class="nav-btn" data-zone="contact" data-color="#00F0FF">
                                <span class="nav-icon">📡</span>
                                <span class="nav-label">CONTACT</span>
                            </button>
                            <button class="nav-btn" data-zone="resume" data-color="#FFB800">
                                <span class="nav-icon">📋</span>
                                <span class="nav-label">RESUME</span>
                            </button>
                            <button class="nav-btn" data-zone="behindthescenes" data-color="#BB44FF">
                                <span class="nav-icon">🔧</span>
                                <span class="nav-label">BTS</span>
                            </button>
                            <button class="nav-btn nav-btn-spawn" data-zone="spawn" data-color="#00F0FF">
                                <span class="nav-icon">🏠</span>
                                <span class="nav-label">SPAWN</span>
                            </button>
                        </div>
                    </div>

                    <!-- Settings Section -->
                    <div class="menu-section">
                        <h3 class="menu-section-title">⚙️ SETTINGS</h3>
                        <div class="settings-row">
                            <span class="settings-label">Quality</span>
                            <button class="settings-btn" id="menu-quality-btn">✨ HIGH</button>
                        </div>
                        <div class="settings-row">
                            <span class="settings-label">Music</span>
                            <button class="settings-btn" id="menu-music-btn">🔇 OFF</button>
                        </div>
                        <div class="settings-row">
                            <span class="settings-label">SFX</span>
                            <button class="settings-btn" id="menu-sfx-btn">🔇 OFF</button>
                        </div>
                    </div>

                    <!-- Controls Section -->
                    <div class="menu-section">
                        <h3 class="menu-section-title">🎮 CONTROLS</h3>
                        <div class="controls-guide">
                            <div class="key-group">
                                <h4 class="key-group-title">Movement</h4>
                                <div class="key-row"><kbd>W</kbd><kbd>↑</kbd><span>Forward</span></div>
                                <div class="key-row"><kbd>S</kbd><kbd>↓</kbd><span>Reverse</span></div>
                                <div class="key-row"><kbd>A</kbd><kbd>←</kbd><span>Steer Left</span></div>
                                <div class="key-row"><kbd>D</kbd><kbd>→</kbd><span>Steer Right</span></div>
                            </div>
                            <div class="key-group">
                                <h4 class="key-group-title">Actions</h4>
                                <div class="key-row"><kbd>Shift</kbd><span>Boost</span></div>
                                <div class="key-row"><kbd>Space</kbd><span>Brake</span></div>
                                <div class="key-row"><kbd>M</kbd><span>Mute / Unmute</span></div>
                                <div class="key-row"><kbd>H</kbd><span>Toggle Quality</span></div>
                                <div class="key-row"><kbd>ESC</kbd><span>Open Menu</span></div>
                            </div>
                        </div>
                        <p class="mobile-note">📱 On mobile: use the joystick (left) and action buttons (right)</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(this.overlay);

        // Initial state
        gsap.set(this.overlay, { opacity: 0, visibility: 'hidden' });
        gsap.set(this.overlay.querySelector('.menu-container'), { y: 30, scale: 0.95 });
    }

    bindEvents() {
        // Hamburger button
        this.menuBtn.addEventListener('click', () => this.toggle());

        // Close button
        this.overlay.querySelector('.menu-close').addEventListener('click', () => this.close());

        // Backdrop click
        this.overlay.querySelector('.menu-backdrop').addEventListener('click', () => this.close());

        // ESC key
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                this.toggle();
            }
        });

        // Navigation teleport buttons
        const navBtns = this.overlay.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const zoneId = btn.dataset.zone;
                this.teleportToZone(zoneId);
            });
        });

        // Quality toggle
        const qualityBtn = this.overlay.querySelector('#menu-quality-btn');
        qualityBtn.addEventListener('click', () => {
            if (this.experience.renderer) {
                this.experience.renderer.toggleQuality();
                this.updateSettingsDisplay();
            }
        });

        // Music toggle
        const musicBtn = this.overlay.querySelector('#menu-music-btn');
        musicBtn.addEventListener('click', () => {
            if (this.experience.audio) {
                this.experience.audio.toggleMusic();
                this.updateSettingsDisplay();
            }
        });

        // SFX toggle
        const sfxBtn = this.overlay.querySelector('#menu-sfx-btn');
        sfxBtn.addEventListener('click', () => {
            if (this.experience.audio) {
                this.experience.audio.toggleSFX();
                this.updateSettingsDisplay();
            }
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        if (this.isOpen) return;
        this.isOpen = true;

        this.updateSettingsDisplay();
        this.menuBtn.classList.add('active');

        gsap.killTweensOf([this.overlay, this.overlay.querySelector('.menu-container')]);
        gsap.to(this.overlay, { opacity: 1, visibility: 'visible', duration: 0.3, ease: 'power2.out' });
        gsap.to(this.overlay.querySelector('.menu-container'), {
            y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.5)'
        });

        // Stagger nav buttons
        const btns = this.overlay.querySelectorAll('.nav-btn');
        gsap.fromTo(btns, { y: 15, opacity: 0 }, {
            y: 0, opacity: 1, duration: 0.3, stagger: 0.04, delay: 0.15, ease: 'power2.out'
        });

        if (this.experience.audio) this.experience.audio.playUIClick();
    }

    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        this.menuBtn.classList.remove('active');

        gsap.killTweensOf([this.overlay, this.overlay.querySelector('.menu-container')]);
        gsap.to(this.overlay.querySelector('.menu-container'), {
            y: 20, scale: 0.95, duration: 0.25, ease: 'power2.in'
        });
        gsap.to(this.overlay, {
            opacity: 0, duration: 0.3, ease: 'power2.in',
            onComplete: () => {
                gsap.set(this.overlay, { visibility: 'hidden' });
            }
        });
    }

    updateSettingsDisplay() {
        const qualityBtn = this.overlay.querySelector('#menu-quality-btn');
        const musicBtn   = this.overlay.querySelector('#menu-music-btn');
        const sfxBtn     = this.overlay.querySelector('#menu-sfx-btn');

        if (this.experience.renderer) {
            qualityBtn.textContent = this.experience.renderer.quality === 'high' ? '✨ HIGH' : '⚡ LOW';
        }
        if (this.experience.audio) {
            musicBtn.textContent = this.experience.audio.musicMuted ? '🔇 OFF' : '🎵 ON';
            sfxBtn.textContent   = this.experience.audio.sfxMuted   ? '🔇 OFF' : '🔊 ON';
        }
    }

    /**
     * Teleport the ship to a zone's position
     */
    teleportToZone(zoneId) {
        const world = this.experience.world;
        if (!world || !world.physicalVehicle || !world.zones) return;

        let targetPos;

        if (zoneId === 'spawn') {
            targetPos = { x: 0, y: 2, z: 0 };
        } else {
            const zoneData = world.zones.zoneData;
            const zone = zoneData.find(z => z.id === zoneId);
            if (!zone) return;
            // Land just outside the zone radius on the approach path from spawn (0,0).
            // This keeps the ship on open road, away from structures built around zone centers.
            const dx = 0 - zone.position.x;
            const dz = 0 - zone.position.z;
            const len = Math.sqrt(dx * dx + dz * dz);
            const ux = dx / len;
            const uz = dz / len;
            const dist = zone.radius - 4;
            targetPos = {
                x: zone.position.x + ux * dist,
                y: 2,
                z: zone.position.z + uz * dist,
            };
        }

        const rb = world.physicalVehicle.rigidBody;
        if (!rb) return;

        // Fully stop the ship — clear all motion, forces, and reset state
        rb.resetForces(true);
        rb.resetTorques(true);
        rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
        rb.setAngvel({ x: 0, y: 0, z: 0 }, true);
        rb.setTranslation(targetPos, true);
        rb.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);

        // Sleep and immediately wake to clear any accumulated physics state
        rb.sleep();
        rb.wakeUp();

        this.close();

        if (this.experience.audio) this.experience.audio.playZoneEnter();
    }
}
