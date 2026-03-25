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

        // Fixed timestep stepping
        this.world.step();
    }
}
