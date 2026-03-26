import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import Experience from './Experience.js';

console.log('Renderer module loaded');

export default class Renderer {
    constructor() {
        console.log('✅ Renderer initialized');
        this.experience = Experience.getInstance();
        this.canvas = this.experience.canvas;
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.camera = this.experience.camera;

        // Quality detection
        this.quality = this.detectQuality();
        console.log(`🎮 Quality: ${this.quality}`);

        this.setInstance();
        this.createQualityToggle();

        // Listen to resize
        this.sizes.on('resize', () => {
            this.resize();
        });
    }

    /**
     * Auto-detect quality based on device capabilities
     */
    detectQuality() {
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768;
        const pixelRatio = window.devicePixelRatio;
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        let gpuTier = 'mid';

        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
                // Detect low-end GPUs
                if (renderer.includes('intel') || renderer.includes('mesa') || renderer.includes('swiftshader')) {
                    gpuTier = 'low';
                }
                // Detect high-end GPUs
                if (renderer.includes('nvidia') || renderer.includes('radeon') || renderer.includes('geforce')) {
                    gpuTier = 'high';
                }
            }
        }

        if (isMobile || gpuTier === 'low') return 'low';
        if (gpuTier === 'high' && pixelRatio <= 2) return 'high';
        return 'high'; // default to high for desktop
    }

    setInstance() {
        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: this.quality === 'high',
            powerPreference: this.quality === 'low' ? 'low-power' : 'high-performance',
        });

        this.instance.outputColorSpace = THREE.SRGBColorSpace;
        this.instance.toneMapping = THREE.ACESFilmicToneMapping;
        this.instance.toneMappingExposure = 1.0;

        // Shadows — conditional on quality
        if (this.quality === 'high') {
            this.instance.shadowMap.enabled = true;
            this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
        } else {
            this.instance.shadowMap.enabled = false;
        }

        this.instance.setClearColor(0x0A0E1A, 1);

        // Post-processing — only on high quality
        if (this.quality === 'high') {
            this.setPostProcessing();
        }

        this.setCSS2DRenderer();
        this.resize();
    }

    setPostProcessing() {
        this.composer = new EffectComposer(this.instance);

        this.renderPass = new RenderPass(this.scene, this.camera.instance);
        this.composer.addPass(this.renderPass);

        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(this.sizes.width, this.sizes.height),
            1.5,    // strength
            0.4,    // radius
            0.85    // threshold
        );
        this.composer.addPass(this.bloomPass);

        console.log('✅ Bloom post-processing enabled');
    }

    setCSS2DRenderer() {
        this.css2dRenderer = new CSS2DRenderer();
        this.css2dRenderer.setSize(this.sizes.width, this.sizes.height);
        this.css2dRenderer.domElement.style.position = 'absolute';
        this.css2dRenderer.domElement.style.top = '0';
        this.css2dRenderer.domElement.style.left = '0';
        this.css2dRenderer.domElement.style.pointerEvents = 'none';
        document.body.appendChild(this.css2dRenderer.domElement);
    }

    /**
     * Quality toggle UI button
     */
    createQualityToggle() {
        this.toggleBtn = document.createElement('button');
        this.toggleBtn.id = 'quality-toggle';
        this.toggleBtn.textContent = this.quality === 'high' ? '✨ HIGH' : '⚡ LOW';
        this.toggleBtn.title = 'Toggle quality (H key)';
        document.body.appendChild(this.toggleBtn);

        // Style
        const style = document.createElement('style');
        style.textContent = `
            #quality-toggle {
                position: fixed;
                top: 12px;
                right: 12px;
                z-index: 200;
                background: rgba(10, 14, 26, 0.7);
                border: 1px solid rgba(0, 240, 255, 0.4);
                color: #00F0FF;
                font-family: 'Orbitron', sans-serif;
                font-size: 11px;
                padding: 6px 14px;
                border-radius: 20px;
                cursor: pointer;
                backdrop-filter: blur(4px);
                transition: all 0.2s ease;
                letter-spacing: 1px;
            }
            #quality-toggle:hover {
                background: rgba(0, 240, 255, 0.15);
                border-color: rgba(0, 240, 255, 0.8);
                box-shadow: 0 0 12px rgba(0, 240, 255, 0.3);
            }
        `;
        document.head.appendChild(style);

        // Click handler
        this.toggleBtn.addEventListener('click', () => this.toggleQuality());

        // H key toggle
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyH') this.toggleQuality();
        });
    }

    toggleQuality() {
        this.quality = this.quality === 'high' ? 'low' : 'high';
        this.toggleBtn.textContent = this.quality === 'high' ? '✨ HIGH' : '⚡ LOW';
        console.log(`🎮 Quality switched to: ${this.quality}`);

        // Toggle shadows
        this.instance.shadowMap.enabled = this.quality === 'high';

        // Toggle bloom
        if (this.quality === 'high' && !this.composer) {
            this.setPostProcessing();
        }

        // Toggle pixel ratio for performance
        if (this.quality === 'low') {
            this.instance.setPixelRatio(1);
            if (this.composer) this.composer.setPixelRatio(1);
        } else {
            const pr = Math.min(window.devicePixelRatio, 2);
            this.instance.setPixelRatio(pr);
            if (this.composer) this.composer.setPixelRatio(pr);
        }

        // Force shadow map update
        this.instance.shadowMap.needsUpdate = true;
    }

    resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height);

        const pr = this.quality === 'low' ? 1 : this.sizes.pixelRatio;
        this.instance.setPixelRatio(pr);

        if (this.composer) {
            this.composer.setSize(this.sizes.width, this.sizes.height);
            this.composer.setPixelRatio(pr);
        }

        if (this.css2dRenderer) {
            this.css2dRenderer.setSize(this.sizes.width, this.sizes.height);
        }
    }

    render() {
        // Use composer for bloom on high quality, direct render on low
        if (this.quality === 'high' && this.composer) {
            this.composer.render();
        } else {
            this.instance.render(this.scene, this.camera.instance);
        }

        if (this.css2dRenderer) {
            this.css2dRenderer.render(this.scene, this.camera.instance);
        }
    }
}
