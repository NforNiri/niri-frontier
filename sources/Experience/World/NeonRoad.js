import * as THREE from 'three';
import Experience from '../Experience.js';

export default class NeonRoad {
    constructor() {
        this.experience = Experience.getInstance();
        this.scene = this.experience.scene;
        this.time = this.experience.time;

        this.roadMeshes = [];
        this.edgeMeshes = [];

        this.buildRoads();
        this.buildJunctions();

        console.log('✅ NeonRoad initialized');
    }

    /**
     * Define road routes as spline waypoints.
     * Each route: spawn → intermediate curves → zone
     */
    getRoutes() {
        return [
            // Spawn → ABOUT
            {
                color: 0x00F0FF,
                points: [
                    [0, 0.05, 0],
                    [-3, 0.05, -18],
                    [2, 0.05, -40],
                    [-1, 0.05, -55],
                    [0, 0.05, -68],
                ]
            },
            // Spawn → DEV
            {
                color: 0x39FF14,
                points: [
                    [0, 0.05, 0],
                    [12, 0.05, -5],
                    [28, 0.05, -12],
                    [42, 0.05, -20],
                    [58, 0.05, -28],
                ]
            },
            // Spawn → GEN AI
            {
                color: 0xFFB800,
                points: [
                    [0, 0.05, 0],
                    [10, 0.05, 10],
                    [25, 0.05, 22],
                    [40, 0.05, 32],
                    [53, 0.05, 40],
                ]
            },
            // Spawn → CREATIVE
            {
                color: 0xFF2D78,
                points: [
                    [0, 0.05, 0],
                    [3, 0.05, 18],
                    [-2, 0.05, 38],
                    [1, 0.05, 55],
                    [0, 0.05, 73],
                ]
            },
            // Spawn → CONTACT
            {
                color: 0x00F0FF,
                points: [
                    [0, 0.05, 0],
                    [-10, 0.05, 12],
                    [-25, 0.05, 25],
                    [-38, 0.05, 35],
                    [-48, 0.05, 44],
                ]
            },
            // Spawn → RESUME
            {
                color: 0xFFB800,
                points: [
                    [0, 0.05, 0],
                    [-12, 0.05, -8],
                    [-28, 0.05, -15],
                    [-42, 0.05, -25],
                    [-53, 0.05, -34],
                ]
            },
            // Spawn → BEHIND THE SCENES
            {
                color: 0xBB44FF,
                points: [
                    [0, 0.05, 0],
                    [8, 0.05, -15],
                    [18, 0.05, -32],
                    [28, 0.05, -48],
                    [34, 0.05, -58],
                ]
            },
        ];
    }

    buildRoads() {
        const routes = this.getRoutes();

        for (const route of routes) {
            const splinePoints = route.points.map(p => new THREE.Vector3(p[0], p[1], p[2]));
            const curve = new THREE.CatmullRomCurve3(splinePoints, false, 'catmullrom', 0.5);

            // Road surface — flat ribbon along spline
            const roadWidth = 3.0;
            const segments = 60;
            const curvePoints = curve.getPoints(segments);

            const roadGeo = this.createRibbonGeometry(curvePoints, roadWidth);
            const roadMat = new THREE.MeshStandardMaterial({
                color: route.color,
                emissive: route.color,
                emissiveIntensity: 0.15,
                transparent: true,
                opacity: 0.25,
                side: THREE.DoubleSide,
                depthWrite: false,
            });
            const roadMesh = new THREE.Mesh(roadGeo, roadMat);
            this.scene.add(roadMesh);
            this.roadMeshes.push({ mesh: roadMesh, color: route.color });

            // Edge strips — two thin neon lines along each side
            this.createEdgeStrip(curvePoints, roadWidth, route.color, 1);   // right edge
            this.createEdgeStrip(curvePoints, roadWidth, route.color, -1);  // left edge
        }
    }

    /**
     * Create a ribbon (flat road surface) from a series of points
     */
    createRibbonGeometry(points, width) {
        const vertices = [];
        const indices = [];
        const uvs = [];
        const halfW = width / 2;

        for (let i = 0; i < points.length; i++) {
            // Calculate perpendicular direction
            let tangent;
            if (i < points.length - 1) {
                tangent = new THREE.Vector3().subVectors(points[i + 1], points[i]).normalize();
            } else {
                tangent = new THREE.Vector3().subVectors(points[i], points[i - 1]).normalize();
            }
            const up = new THREE.Vector3(0, 1, 0);
            const perp = new THREE.Vector3().crossVectors(up, tangent).normalize();

            // Left and right vertices
            const left = new THREE.Vector3().addVectors(points[i], perp.clone().multiplyScalar(halfW));
            const right = new THREE.Vector3().addVectors(points[i], perp.clone().multiplyScalar(-halfW));

            vertices.push(left.x, left.y, left.z);
            vertices.push(right.x, right.y, right.z);

            const t = i / (points.length - 1);
            uvs.push(0, t);
            uvs.push(1, t);

            if (i < points.length - 1) {
                const idx = i * 2;
                indices.push(idx, idx + 1, idx + 2);
                indices.push(idx + 1, idx + 3, idx + 2);
            }
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geo.setIndex(indices);
        geo.computeVertexNormals();
        return geo;
    }

    /**
     * Edge glow strip along one side of the road
     */
    createEdgeStrip(points, roadWidth, color, side) {
        const halfW = roadWidth / 2;
        const stripWidth = 0.15;
        const edgePoints = [];

        for (let i = 0; i < points.length; i++) {
            let tangent;
            if (i < points.length - 1) {
                tangent = new THREE.Vector3().subVectors(points[i + 1], points[i]).normalize();
            } else {
                tangent = new THREE.Vector3().subVectors(points[i], points[i - 1]).normalize();
            }
            const up = new THREE.Vector3(0, 1, 0);
            const perp = new THREE.Vector3().crossVectors(up, tangent).normalize();

            const offset = perp.clone().multiplyScalar(side * halfW);
            edgePoints.push(new THREE.Vector3().addVectors(points[i], offset));
        }

        const edgeGeo = this.createRibbonGeometry(edgePoints, stripWidth);
        const edgeMat = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 1.5,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
            depthWrite: false,
        });
        const edgeMesh = new THREE.Mesh(edgeGeo, edgeMat);
        edgeMesh.position.y = 0.02; // Slightly above road surface
        this.scene.add(edgeMesh);
        this.edgeMeshes.push({ mesh: edgeMesh, mat: edgeMat, baseIntensity: 1.5 });
    }

    /**
     * Glowing junction pads where roads meet at spawn and at zone entrances
     */
    buildJunctions() {
        // Spawn hub — central glow pad
        this.createJunctionPad(0, 0.06, 0, 4, 0x00F0FF);

        // Zone arrival pads
        const zones = [
            { pos: [0, -68], color: 0x00F0FF },
            { pos: [58, -28], color: 0x39FF14 },
            { pos: [53, 40], color: 0xFFB800 },
            { pos: [0, 73], color: 0xFF2D78 },
            { pos: [-48, 44], color: 0x00F0FF },
            { pos: [-53, -34], color: 0xFFB800 },
            { pos: [34, -58], color: 0xBB44FF },
        ];

        for (const z of zones) {
            this.createJunctionPad(z.pos[0], 0.06, z.pos[1], 3, z.color);
        }
    }

    createJunctionPad(x, y, z, radius, color) {
        const geo = new THREE.CircleGeometry(radius, 32);
        geo.rotateX(-Math.PI / 2);
        const mat = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.6,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide,
            depthWrite: false,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        this.scene.add(mesh);
    }

    update() {
        if (!this.time) return;
        const t = this.time.elapsed * 0.001;

        // Pulse edge strip glow
        for (const edge of this.edgeMeshes) {
            edge.mat.emissiveIntensity = edge.baseIntensity + Math.sin(t * 2) * 0.3;
        }
    }
}
