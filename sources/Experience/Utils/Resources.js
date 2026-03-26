import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import EventEmitter from './EventEmitter.js';

console.log('Resources module loaded');

export default class Resources extends EventEmitter {
    constructor(sources) {
        super();
        console.log('✅ Resources initialized');

        this.sources = sources;
        this.items = {};
        this.toLoad = this.sources.length;
        this.loaded = 0;

        this.setLoaders();
        this.startLoading();
    }

    setLoaders() {
        this.loaders = {};

        // GLTF Loader with Draco compression
        this.loaders.dracoLoader = new DRACOLoader();
        this.loaders.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

        this.loaders.gltfLoader = new GLTFLoader();
        this.loaders.gltfLoader.setDRACOLoader(this.loaders.dracoLoader);

        // Texture Loader
        this.loaders.textureLoader = new THREE.TextureLoader();

        // Audio Loader
        this.loaders.audioLoader = new THREE.AudioLoader();
    }

    startLoading() {
        if (this.sources.length === 0) {
            console.log('No assets to load');
            this.emit('ready');
            return;
        }

        for (const source of this.sources) {
            if (source.type === 'gltfModel') {
                this.loaders.gltfLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file);
                    },
                    (progress) => {
                        // Optional: emit progress events
                        const percentComplete = (progress.loaded / progress.total) * 100;
                        this.emit('progress', {
                            name: source.name,
                            percent: percentComplete
                        });
                    },
                    (error) => {
                        console.error(`Error loading ${source.name}:`, error);
                        // Still count as loaded to avoid blocking
                        this.sourceLoaded(source, null);
                    }
                );
            } else if (source.type === 'texture') {
                this.loaders.textureLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file);
                    },
                    undefined,
                    (error) => {
                        console.error(`Error loading texture ${source.name}:`, error);
                        this.sourceLoaded(source, null);
                    }
                );
            } else if (source.type === 'audio') {
                this.loaders.audioLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file);
                    },
                    undefined,
                    (error) => {
                        console.error(`Error loading audio ${source.name}:`, error);
                        this.sourceLoaded(source, null);
                    }
                );
            }
        }
    }

    sourceLoaded(source, file) {
        this.items[source.name] = file;
        this.loaded++;

        const progress = (this.loaded / this.toLoad) * 100;
        console.log(`Asset loaded: ${source.name} (${this.loaded}/${this.toLoad}) - ${progress.toFixed(0)}%`);

        if (this.loaded === this.toLoad) {
            console.log('✅ All assets loaded!');
            this.emit('ready');
        }
    }
}
