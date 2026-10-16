/**
 * ============================================
 * NEON RUNNER - Central Configuration
 * ============================================
 * This file controls ALL visual styling.
 * When start.ng user data is integrated,
 * these values will be overridden by the user's
 * start.ng profile styling preferences.
 */

export const CONFIG = {
    // --- Character Appearance ---
    character: {
        bodyColor: 0x00c8ff,
        accentColor: 0xff00c8,
        visorColor: 0xffffff,
        emissiveIntensity: 0.6,
        scale: 1.0,
        hasJetpack: false,
        hasTrail: true,
        trailColor: 0x00c8ff,
        // Unlockable skins (earned at score milestones)
        skins: [
            { name: 'Default', bodyColor: 0x00c8ff, accentColor: 0xff00c8, unlockScore: 0 },
            { name: 'Inferno', bodyColor: 0xff4400, accentColor: 0xffaa00, unlockScore: 500 },
            { name: 'Toxic', bodyColor: 0x44ff00, accentColor: 0x00ff88, unlockScore: 1500 },
            { name: 'Royal', bodyColor: 0x8800ff, accentColor: 0xff00aa, unlockScore: 3000 },
            { name: 'Golden', bodyColor: 0xffd700, accentColor: 0xffaa00, unlockScore: 5000 },
        ],
    },

    // --- World / Environment ---
    world: {
        groundColor: 0x0d0d1a,
        groundAccentColor: 0x1a1a3e,
        fogColor: 0x050510,
        fogDensity: 0.012,
        skyColor: 0x050510,
    },

    // --- Gameplay ---
    gameplay: {
        baseSpeed: 12,
        maxSpeed: 35,
        speedIncrement: 0.001,
        laneWidth: 2.5,
        jumpForce: 14,
        gravity: -35,
        slideDuration: 0.6,
    },

    // --- Obstacles ---
    obstacles: {
        spawnRate: 1.0,
        types: ['box', 'tall', 'wide', 'moving', 'spinning'],
        colors: [0xff2244, 0xff8800, 0xff00c8, 0xaa00ff],
    },

    // --- Collectibles ---
    collectibles: {
        coinColor: 0xffd700,
        coinValue: 10,
        spawnChance: 0.5,
    },

    // --- Power-ups ---
    powerups: {
        spawnChance: 0.15,
        duration: 5, // seconds
        types: ['shield', 'magnet', 'doubleScore', 'slowMo'],
        colors: {
            shield: 0x00ff88,
            magnet: 0xff4488,
            doubleScore: 0xffd700,
            slowMo: 0x4488ff,
        },
    },

    // --- Combo System ---
    combo: {
        window: 2.0, // seconds to chain
        maxMultiplier: 5,
        bonusPerCombo: 5,
    },

    // --- Near Miss ---
    nearMiss: {
        distance: 1.5,
        bonus: 25,
    },

    // --- Speed Zones ---
    speedZones: {
        color: 0x00ff88,
        boostMultiplier: 1.5,
        duration: 2.0,
        spawnChance: 0.1,
    },

    // --- Boss ---
    boss: {
        spawnDistance: 500, // every 500m
        health: 5,
        color: 0xff0044,
        attackRate: 2.0,
    },

    // --- Weather ---
    weather: {
        types: ['clear', 'rain', 'fog', 'storm'],
        changeInterval: 15, // seconds
        rainParticleCount: 500,
    },

    // --- Day/Night Cycle ---
    dayNight: {
        cycleDuration: 60, // seconds for full cycle
        sunColor: 0xffffff,
        moonColor: 0x4444ff,
    },

    // --- Camera ---
    camera: {
        fov: 75,
        position: { x: 0, y: 5, z: 8 },
        lookAt: { x: 0, y: 1, z: -10 },
    },

    // --- Audio ---
    audio: {
        masterVolume: 0.3,
        musicVolume: 0.15,
        sfxVolume: 0.5,
    },
};
