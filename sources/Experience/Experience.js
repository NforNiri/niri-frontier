import * as THREE from 'three';
import Sizes from './Utils/Sizes.js';
import Time from './Utils/Time.js';
import Resources from './Utils/Resources.js';
import EventEmitter from './Utils/EventEmitter.js';
import Camera from './Camera.js';
import Renderer from './Renderer.js';
import Physics from './Physics.js';
import Controls from './Controls.js';
import World from './World/World.js';
import StatsGL from 'stats-gl';
import sources from './sources.js';

console.log('Experience module loaded');

let instance = null;

export default class Experience {
    constructor() {
        console.log('✅ Experience initialized');

        if (instance) {
            return instance;
        }
        instance = this;

        // Add EventEmitter capabilities
        const emitter = new EventEmitter();
        this.on = emitter.on.bind(emitter);
        this.off = emitter.off.bind(emitter);
        this.emit = emitter.emit.bind(emitter);

        // Container
        this.canvas = document.createElement('canvas');
        document.body.appendChild(this.canvas);

        // Update system array for tracking updates based on priorities
        this.updateCallbacks = [];

        // Utilities
        this.sizes = new Sizes();
        this.time = new Time();
        this.resources = new Resources(sources);

        // Core Components
        this.scene = new THREE.Scene();
        this.camera = new Camera();
        this.renderer = new Renderer();
        this.physics = new Physics();
        this.controls = new Controls();

        // World waits for resources and physics to be ready
        this.resources.on('ready', () => {
            this.world = new World();
        });

        // Dev Stats
        this.stats = new StatsGL({
            container: document.body
        });
        
        // Start Loop
        this.update = this.update.bind(this);
        window.requestAnimationFrame(this.update);
    }

    static getInstance() {
        return instance;
    }

    /**
     * Priority-based update system
     * @param {number} priority Lower number = runs first
     * @param {Function} callback 
     */
    addUpdate(priority, callback) {
        this.updateCallbacks.push({ priority, callback });
        this.updateCallbacks.sort((a, b) => a.priority - b.priority);
    }

    update() {
        // Dev Stats Start
        if (this.stats) {
            this.stats.begin();
        }

        // Time
        this.time.update();

        // Run all registered callbacks
        for (const item of this.updateCallbacks) {
            item.callback();
        }

        // Render pass
        if (this.renderer) {
            this.renderer.render();
        }

        // Dev Stats End
        if (this.stats) {
            this.stats.update(); // Update is typically used depending on Stats API style
            this.stats.end();
        }

        // Loop
        window.requestAnimationFrame(this.update);
    }
}

// Automatically start when the module is imported
const experience = new Experience();
