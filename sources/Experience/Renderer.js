import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
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

        this.setInstance();

        // Listen to resize
        this.sizes.on('resize', () => {
            this.resize();
        });
    }

    setInstance() {
        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });

        this.instance.outputColorSpace = THREE.SRGBColorSpace;
        this.instance.toneMapping = THREE.ACESFilmicToneMapping;
        this.instance.toneMappingExposure = 1.0;
        this.instance.shadowMap.enabled = true;
        this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
        this.instance.setClearColor(0x0A0E1A, 1);

        this.setPostProcessing();

        this.resize();
    }

    setPostProcessing() {
        // Effect Composer
        this.composer = new EffectComposer(this.instance);

        // Render Pass (main scene render)
        this.renderPass = new RenderPass(this.scene, this.camera.instance);
        this.composer.addPass(this.renderPass);

        // Bloom Pass (neon glow effect)
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(this.sizes.width, this.sizes.height),
            1.5,    // strength
            0.4,    // radius
            0.85    // threshold
        );
        this.composer.addPass(this.bloomPass);

        console.log('✅ Bloom post-processing enabled');
    }

    resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(this.sizes.pixelRatio);

        // Update composer
        if (this.composer) {
            this.composer.setSize(this.sizes.width, this.sizes.height);
            this.composer.setPixelRatio(this.sizes.pixelRatio);
        }
    }

    render() {
        // Use composer for post-processing effects
        if (this.composer) {
            this.composer.render();
        } else {
            this.instance.render(this.scene, this.camera.instance);
        }
    }
}
