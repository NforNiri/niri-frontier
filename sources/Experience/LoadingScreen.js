import gsap from 'gsap';
import Experience from './Experience.js';

export default class LoadingScreen {
    constructor() {
        this.experience = Experience.getInstance();
        this.resources = this.experience.resources;
        this.camera = this.experience.camera;

        // DOM elements
        this.overlay = document.getElementById('loading-screen');
        this.barFill = this.overlay.querySelector('.loading-bar-fill');
        this.subtitle = this.overlay.querySelector('.loading-subtitle');
        this.launchBtn = this.overlay.querySelector('.loading-launch');

        // Listen to resource loading
        this.resources.on('progress', (data) => this.updateProgress());
        this.resources.on('ready', () => this.onReady());

        // Launch button
        this.launchBtn.addEventListener('click', () => this.launch());
    }

    updateProgress() {
        const percent = (this.resources.loaded / this.resources.toLoad) * 100;
        this.barFill.style.width = `${percent}%`;
        this.subtitle.textContent = `Loading assets... ${Math.round(percent)}%`;
    }

    onReady() {
        this.barFill.style.width = '100%';
        this.subtitle.textContent = 'Systems online';

        // Show launch button with fade-in
        gsap.set(this.launchBtn, { display: 'inline-block', opacity: 0, y: 10 });
        gsap.to(this.launchBtn, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: 0.4,
            ease: 'power2.out'
        });
    }

    launch() {
        // Disable button to prevent double-click
        this.launchBtn.style.pointerEvents = 'none';

        // Fade out overlay
        gsap.to(this.overlay, {
            opacity: 0,
            duration: 1,
            ease: 'power2.inOut',
            onComplete: () => {
                this.overlay.remove();
            }
        });

        // Start audio (first user interaction unlocks audio context)
        if (this.experience.audio) {
            this.experience.audio.start();
        }

        // Start cinematic flyover
        this.camera.cinematicFlyover();
    }
}
