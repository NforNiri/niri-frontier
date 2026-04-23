import Experience from './Experience.js';
import * as RAPIER from '@dimforge/rapier3d';
import EventEmitter from './Utils/EventEmitter.js';

console.log('Physics module loaded');

export default class Physics extends EventEmitter {
    constructor() {
        super();
        console.log('✅ Physics initialized');
        this.experience = Experience.getInstance();
        this.time = this.experience.time;

        this.world = null;
        
        // Setup async initialization
        this.init();
    }

    async init() {
        // Gravity: lower than earth for space feel
        const gravity = { x: 0.0, y: -5.0, z: 0.0 };
        this.world = new RAPIER.World(gravity);

        // Fixed-step accumulator — ensures physics runs at 60Hz regardless of display refresh rate
        // Fixes 120Hz devices (ProMotion iPhones) running physics at 2× speed
        this._accumulator = 0;
        this._fixedStep = 1000 / 60; // 16.67ms

        // Ground collider
        this.createGround();

        // Register to update (priority 1)
        this.experience.addUpdate(1, () => this.step());

        console.log('Physics world ready');
        this.emit('ready');
    }

    createGround() {
        const floorBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0, 0, 0);
        this.floorBody = this.addRigidBody(floorBodyDesc);

        // 200x200 ground -> half extents 100x0.1x100
        const floorColliderDesc = RAPIER.ColliderDesc.cuboid(100.0, 0.1, 100.0);
        this.addCollider(floorColliderDesc, this.floorBody);
    }

    addRigidBody(desc) {
        if (!this.world) return null;
        return this.world.createRigidBody(desc);
    }

    addCollider(desc, body) {
        if (!this.world) return null;
        return this.world.createCollider(desc, body);
    }

    step() {
        if (!this.world) return;

        // Fixed timestep stepping — accumulate real time, step at fixed 60Hz
        // Cap at 2 steps per frame to prevent spiral of death on slow frames
        // Cap delta to 100ms to prevent cold-start lurch (first RAF can be 200-500ms)
        const delta = Math.min(this.experience.time.delta, 100);
        this._accumulator += delta;
        let steps = 0;
        while (this._accumulator >= this._fixedStep && steps < 2) {
            this.world.step();
            this._accumulator -= this._fixedStep;
            steps++;
        }
    }
}
