import Experience from './Experience.js';

console.log('Controls module loaded');

export default class Controls {
    constructor() {
        console.log('✅ Controls initialized');
        this.experience = Experience.getInstance();

        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            boost: false,
            brake: false
        };

        this.isMobile = this.detectMobile();

        this.setKeyboard();

        if (this.isMobile) {
            this.setupTouchControls();
        }
    }

    detectMobile() {
        return (
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            window.innerWidth < 768
        );
    }

    setKeyboard() {
        window.addEventListener('keydown', (event) => {
            this.handleKey(event, true);
        });

        window.addEventListener('keyup', (event) => {
            this.handleKey(event, false);
        });
    }

    handleKey(event, isPressed) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.keys.forward = isPressed;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.keys.backward = isPressed;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.keys.left = isPressed;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.keys.right = isPressed;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.keys.boost = isPressed;
                break;
            case 'Space':
                event.preventDefault();
                this.keys.brake = isPressed;
                break;
            case 'KeyM':
                if (isPressed && this.experience.audio) {
                    this.experience.audio.toggleMute();
                }
                break;
        }
    }

    // =============================================
    // MOBILE TOUCH CONTROLS
    // =============================================
    setupTouchControls() {
        // Create container
        this.touchContainer = document.createElement('div');
        this.touchContainer.id = 'touch-controls';
        this.touchContainer.innerHTML = `
            <div class="joystick-zone" id="joystick-zone">
                <div class="joystick-base" id="joystick-base">
                    <div class="joystick-knob" id="joystick-knob"></div>
                </div>
            </div>
            <div class="action-zone" id="action-zone">
                <button class="touch-btn boost-btn" id="boost-btn">⚡</button>
                <button class="touch-btn brake-btn" id="brake-btn">🛑</button>
            </div>
        `;
        document.body.appendChild(this.touchContainer);

        this.injectTouchCSS();
        this.initJoystick();
        this.initActionButtons();
    }

    injectTouchCSS() {
        const style = document.createElement('style');
        style.textContent = `
            #touch-controls {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                height: 40vh;
                z-index: 100;
                pointer-events: none;
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                padding: 20px 30px;
            }

            .joystick-zone {
                width: 140px;
                height: 140px;
                position: relative;
                pointer-events: auto;
                touch-action: none;
            }

            .joystick-base {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                background: rgba(0, 240, 255, 0.1);
                border: 2px solid rgba(0, 240, 255, 0.4);
                position: absolute;
                bottom: 10px;
                left: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .joystick-knob {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: radial-gradient(ellipse, rgba(0, 240, 255, 0.7), rgba(0, 240, 255, 0.2));
                border: 2px solid rgba(0, 240, 255, 0.8);
                position: absolute;
                transition: none;
                box-shadow: 0 0 15px rgba(0, 240, 255, 0.5);
            }

            .action-zone {
                display: flex;
                flex-direction: column;
                gap: 12px;
                pointer-events: auto;
                padding-bottom: 10px;
            }

            .touch-btn {
                width: 70px;
                height: 70px;
                border-radius: 50%;
                border: 2px solid rgba(0, 240, 255, 0.5);
                background: rgba(0, 240, 255, 0.1);
                color: #fff;
                font-size: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                touch-action: none;
                -webkit-user-select: none;
                user-select: none;
                cursor: pointer;
                backdrop-filter: blur(4px);
            }

            .touch-btn:active, .touch-btn.active {
                background: rgba(0, 240, 255, 0.35);
                border-color: rgba(0, 240, 255, 0.9);
                box-shadow: 0 0 20px rgba(0, 240, 255, 0.5);
            }

            .boost-btn {
                border-color: rgba(57, 255, 20, 0.5);
                background: rgba(57, 255, 20, 0.1);
            }
            .boost-btn:active, .boost-btn.active {
                background: rgba(57, 255, 20, 0.35);
                border-color: rgba(57, 255, 20, 0.9);
                box-shadow: 0 0 20px rgba(57, 255, 20, 0.5);
            }

            .brake-btn {
                border-color: rgba(255, 45, 120, 0.5);
                background: rgba(255, 45, 120, 0.1);
            }
            .brake-btn:active, .brake-btn.active {
                background: rgba(255, 45, 120, 0.35);
                border-color: rgba(255, 45, 120, 0.9);
                box-shadow: 0 0 20px rgba(255, 45, 120, 0.5);
            }

            /* Hide on desktop */
            @media (min-width: 769px) and (hover: hover) {
                #touch-controls {
                    display: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    initJoystick() {
        const zone = document.getElementById('joystick-zone');
        const base = document.getElementById('joystick-base');
        const knob = document.getElementById('joystick-knob');

        let active = false;
        let startX = 0, startY = 0;
        const maxDist = 40; // max pixel distance from center
        const deadZone = 8;  // dead zone in pixels

        const getCenter = () => {
            const rect = base.getBoundingClientRect();
            return {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
        };

        const handleMove = (clientX, clientY) => {
            const center = getCenter();
            let dx = clientX - center.x;
            let dy = clientY - center.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Clamp to max distance
            if (dist > maxDist) {
                dx = dx / dist * maxDist;
                dy = dy / dist * maxDist;
            }

            // Move knob
            knob.style.transform = `translate(${dx}px, ${dy}px)`;

            // Apply dead zone
            if (dist < deadZone) {
                this.keys.forward = false;
                this.keys.backward = false;
                this.keys.left = false;
                this.keys.right = false;
                return;
            }

            // Normalize to -1..1
            const nx = dx / maxDist;
            const ny = dy / maxDist;

            // Up/down = forward/backward (inverted Y because screen coords)
            this.keys.forward = ny < -0.3;
            this.keys.backward = ny > 0.3;
            this.keys.left = nx < -0.3;
            this.keys.right = nx > 0.3;
        };

        const handleEnd = () => {
            active = false;
            knob.style.transform = 'translate(0, 0)';
            this.keys.forward = false;
            this.keys.backward = false;
            this.keys.left = false;
            this.keys.right = false;
        };

        zone.addEventListener('touchstart', (e) => {
            e.preventDefault();
            active = true;
            const touch = e.touches[0];
            handleMove(touch.clientX, touch.clientY);
        }, { passive: false });

        zone.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!active) return;
            const touch = e.touches[0];
            handleMove(touch.clientX, touch.clientY);
        }, { passive: false });

        zone.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleEnd();
        }, { passive: false });

        zone.addEventListener('touchcancel', handleEnd);
    }

    initActionButtons() {
        const boostBtn = document.getElementById('boost-btn');
        const brakeBtn = document.getElementById('brake-btn');

        // Boost
        boostBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.boost = true;
            boostBtn.classList.add('active');
        }, { passive: false });
        boostBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys.boost = false;
            boostBtn.classList.remove('active');
        }, { passive: false });

        // Brake
        brakeBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.brake = true;
            brakeBtn.classList.add('active');
        }, { passive: false });
        brakeBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys.brake = false;
            brakeBtn.classList.remove('active');
        }, { passive: false });
    }
}
