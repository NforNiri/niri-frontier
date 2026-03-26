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

        this.setKeyboard();
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
                event.preventDefault(); // prevent page scroll
                this.keys.brake = isPressed;
                break;
        }
    }
}
