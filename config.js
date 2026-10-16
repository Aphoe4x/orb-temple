var CONFIG = {
    character: { bodyColor: 0x00c8ff, accentColor: 0xff00c8, visorColor: 0xffffff, emissiveIntensity: 0.6, scale: 1, hasJetpack: false, hasTrail: true, trailColor: 0x00c8ff },
    world: { groundColor: 0x0d0d1a, groundAccentColor: 0x1a1a3e, fogColor: 0x050510, fogDensity: 0.008, skyColor: 0x050510 },
    gameplay: { baseSpeed: 14, maxSpeed: 38, speedIncrement: 0.002, laneWidth: 2.5, jumpForce: 14, gravity: -35, slideDuration: 0.6 },
    obstacles: { spawnRate: 1.1, types: ['box','tall','wide','moving','spinning'], colors: [0xff2244, 0xff8800, 0xff00c8, 0xaa00ff] },
    collectibles: { coinColor: 0xffd700, coinValue: 10, spawnChance: 0.6 },
    powerups: { spawnChance: 0.12, duration: 5, types: ['shield','magnet','doubleScore','slowMo'], colors: { shield: 0x00ff88, magnet: 0xff4488, doubleScore: 0xffd700, slowMo: 0x4488ff } },
    combo: { window: 2.0, maxMultiplier: 5 },
    nearMiss: { distance: 1.5, bonus: 25 },
    speedZones: { color: 0x00ff88, boostMultiplier: 1.5, duration: 2, spawnChance: 0.1 },
    boss: { spawnDistance: 500, health: 5, color: 0xff0044 },
    camera: { fov: 75, fovMax: 95, position: { x: 0, y: 5, z: 8 }, lookAt: { x: 0, y: 1, z: -10 } },
    audio: { masterVolume: 0.3, musicVolume: 0.15, sfxVolume: 0.5 },
};
