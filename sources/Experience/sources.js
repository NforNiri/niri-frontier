const spacekitBase = '/models/spacekit/obj';

export default [
    // === GLTF Models ===
    {
        name: 'spaceship',
        type: 'gltfModel',
        path: '/models/spaceship.glb'
    },
    {
        name: 'alienPilot',
        type: 'gltfModel',
        path: '/models/alien-pilot.glb'
    },

    // === Kenney Space Kit — Interactive (pushable) ===
    {
        name: 'barrel',
        type: 'objModel',
        path: `${spacekitBase}/barrel.obj`,
        mtlPath: `${spacekitBase}/barrel.mtl`
    },
    {
        name: 'barrels',
        type: 'objModel',
        path: `${spacekitBase}/barrels.obj`,
        mtlPath: `${spacekitBase}/barrels.mtl`
    },
    {
        name: 'rock',
        type: 'objModel',
        path: `${spacekitBase}/rock.obj`,
        mtlPath: `${spacekitBase}/rock.mtl`
    },
    {
        name: 'rockLarge',
        type: 'objModel',
        path: `${spacekitBase}/rock_largeA.obj`,
        mtlPath: `${spacekitBase}/rock_largeA.mtl`
    },
    {
        name: 'meteor',
        type: 'objModel',
        path: `${spacekitBase}/meteor.obj`,
        mtlPath: `${spacekitBase}/meteor.mtl`
    },

    // === Kenney Space Kit — Buildings & Hangars ===
    {
        name: 'hangarLargeA',
        type: 'objModel',
        path: `${spacekitBase}/hangar_largeA.obj`,
        mtlPath: `${spacekitBase}/hangar_largeA.mtl`
    },
    {
        name: 'hangarSmallA',
        type: 'objModel',
        path: `${spacekitBase}/hangar_smallA.obj`,
        mtlPath: `${spacekitBase}/hangar_smallA.mtl`
    },
    {
        name: 'hangarRoundA',
        type: 'objModel',
        path: `${spacekitBase}/hangar_roundA.obj`,
        mtlPath: `${spacekitBase}/hangar_roundA.mtl`
    },
    {
        name: 'corridor',
        type: 'objModel',
        path: `${spacekitBase}/corridor.obj`,
        mtlPath: `${spacekitBase}/corridor.mtl`
    },
    {
        name: 'corridorEnd',
        type: 'objModel',
        path: `${spacekitBase}/corridor_end.obj`,
        mtlPath: `${spacekitBase}/corridor_end.mtl`
    },

    // === Kenney Space Kit — Structures ===
    {
        name: 'structureDetailed',
        type: 'objModel',
        path: `${spacekitBase}/structure_detailed.obj`,
        mtlPath: `${spacekitBase}/structure_detailed.mtl`
    },
    {
        name: 'structureClosed',
        type: 'objModel',
        path: `${spacekitBase}/structure_closed.obj`,
        mtlPath: `${spacekitBase}/structure_closed.mtl`
    },
    {
        name: 'gateSimple',
        type: 'objModel',
        path: `${spacekitBase}/gate_simple.obj`,
        mtlPath: `${spacekitBase}/gate_simple.mtl`
    },

    // === Kenney Space Kit — Terrain ===
    {
        name: 'crater',
        type: 'objModel',
        path: `${spacekitBase}/crater.obj`,
        mtlPath: `${spacekitBase}/crater.mtl`
    },
    {
        name: 'craterLarge',
        type: 'objModel',
        path: `${spacekitBase}/craterLarge.obj`,
        mtlPath: `${spacekitBase}/craterLarge.mtl`
    },

    // === Kenney Space Kit — Platforms ===
    {
        name: 'platformLarge',
        type: 'objModel',
        path: `${spacekitBase}/platform_large.obj`,
        mtlPath: `${spacekitBase}/platform_large.mtl`
    },
    {
        name: 'platformCorner',
        type: 'objModel',
        path: `${spacekitBase}/platform_corner.obj`,
        mtlPath: `${spacekitBase}/platform_corner.mtl`
    },

    // === Kenney Space Kit — Pipes & Infrastructure ===
    {
        name: 'pipeStraight',
        type: 'objModel',
        path: `${spacekitBase}/pipe_straight.obj`,
        mtlPath: `${spacekitBase}/pipe_straight.mtl`
    },
    {
        name: 'pipeCorner',
        type: 'objModel',
        path: `${spacekitBase}/pipe_corner.obj`,
        mtlPath: `${spacekitBase}/pipe_corner.mtl`
    },
    {
        name: 'pipeRing',
        type: 'objModel',
        path: `${spacekitBase}/pipe_ring.obj`,
        mtlPath: `${spacekitBase}/pipe_ring.mtl`
    },
    {
        name: 'pipeSupportHigh',
        type: 'objModel',
        path: `${spacekitBase}/pipe_supportHigh.obj`,
        mtlPath: `${spacekitBase}/pipe_supportHigh.mtl`
    },
    {
        name: 'supportsHigh',
        type: 'objModel',
        path: `${spacekitBase}/supports_high.obj`,
        mtlPath: `${spacekitBase}/supports_high.mtl`
    },

    // === Kenney Space Kit — Machines ===
    {
        name: 'machineGenerator',
        type: 'objModel',
        path: `${spacekitBase}/machine_generator.obj`,
        mtlPath: `${spacekitBase}/machine_generator.mtl`
    },
    {
        name: 'machineWireless',
        type: 'objModel',
        path: `${spacekitBase}/machine_wireless.obj`,
        mtlPath: `${spacekitBase}/machine_wireless.mtl`
    },
    {
        name: 'machineBarrelLarge',
        type: 'objModel',
        path: `${spacekitBase}/machine_barrelLarge.obj`,
        mtlPath: `${spacekitBase}/machine_barrelLarge.mtl`
    },

    // === Kenney Space Kit — Satellite & Comms ===
    {
        name: 'satelliteDish',
        type: 'objModel',
        path: `${spacekitBase}/satelliteDish_detailed.obj`,
        mtlPath: `${spacekitBase}/satelliteDish_detailed.mtl`
    },
    {
        name: 'satelliteDishLarge',
        type: 'objModel',
        path: `${spacekitBase}/satelliteDish_large.obj`,
        mtlPath: `${spacekitBase}/satelliteDish_large.mtl`
    },

    // === Kenney Space Kit — Turrets ===
    {
        name: 'turret',
        type: 'objModel',
        path: `${spacekitBase}/turret_single.obj`,
        mtlPath: `${spacekitBase}/turret_single.mtl`
    },

    // === Kenney Space Kit — Rockets ===
    {
        name: 'rocketBase',
        type: 'objModel',
        path: `${spacekitBase}/rocket_baseA.obj`,
        mtlPath: `${spacekitBase}/rocket_baseA.mtl`
    },
    {
        name: 'rocketTop',
        type: 'objModel',
        path: `${spacekitBase}/rocket_topA.obj`,
        mtlPath: `${spacekitBase}/rocket_topA.mtl`
    },
    {
        name: 'rocketFins',
        type: 'objModel',
        path: `${spacekitBase}/rocket_finsA.obj`,
        mtlPath: `${spacekitBase}/rocket_finsA.mtl`
    },
    {
        name: 'rocketSides',
        type: 'objModel',
        path: `${spacekitBase}/rocket_sidesA.obj`,
        mtlPath: `${spacekitBase}/rocket_sidesA.mtl`
    },

    // === Kenney Space Kit — Vehicles ===
    {
        name: 'rover',
        type: 'objModel',
        path: `${spacekitBase}/rover.obj`,
        mtlPath: `${spacekitBase}/rover.mtl`
    },
    {
        name: 'craftCargo',
        type: 'objModel',
        path: `${spacekitBase}/craft_cargoA.obj`,
        mtlPath: `${spacekitBase}/craft_cargoA.mtl`
    },

    // === Kenney Space Kit — Crystals ===
    {
        name: 'rockCrystals',
        type: 'objModel',
        path: `${spacekitBase}/rock_crystalsLargeA.obj`,
        mtlPath: `${spacekitBase}/rock_crystalsLargeA.mtl`
    },
    {
        name: 'rockCrystalsB',
        type: 'objModel',
        path: `${spacekitBase}/rock_crystalsLargeB.obj`,
        mtlPath: `${spacekitBase}/rock_crystalsLargeB.mtl`
    },

    // === Kenney Space Kit — Detail Rocks ===
    {
        name: 'rocksSmallA',
        type: 'objModel',
        path: `${spacekitBase}/rocks_smallA.obj`,
        mtlPath: `${spacekitBase}/rocks_smallA.mtl`
    },
    {
        name: 'rocksSmallB',
        type: 'objModel',
        path: `${spacekitBase}/rocks_smallB.obj`,
        mtlPath: `${spacekitBase}/rocks_smallB.mtl`
    },

    // === Kenney Space Kit — Monorail ===
    {
        name: 'monorailTrack',
        type: 'objModel',
        path: `${spacekitBase}/monorail_trackStraight.obj`,
        mtlPath: `${spacekitBase}/monorail_trackStraight.mtl`
    },
    {
        name: 'monorailSupport',
        type: 'objModel',
        path: `${spacekitBase}/monorail_trackSupport.obj`,
        mtlPath: `${spacekitBase}/monorail_trackSupport.mtl`
    },
];
