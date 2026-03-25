import * as THREE from 'three';
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
        this.instance.shadowMap.enabled = true;
        this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
        this.instance.setClearColor(0x0A0E1A, 1);
        
        this.resize();
    }

    resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(this.sizes.pixelRatio);
    }

    render() {
        this.instance.render(this.scene, this.camera.instance);
    }
}
