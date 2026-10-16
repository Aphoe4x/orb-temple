import * as THREE from 'three';

const obstacleGeometries = {
    box: new THREE.BoxGeometry(1.5, 1.5, 1.5),
    tall: new THREE.BoxGeometry(1.2, 3, 1.2),
    wide: new THREE.BoxGeometry(4, 1, 1.5),
    moving: new THREE.BoxGeometry(1, 1, 1),
    spinning: new THREE.BoxGeometry(1.5, 1.5, 0.3),
};

export function createObstacle(type, config) {
    const colors = config.obstacles.colors;
    const color = colors[Math.floor(Math.random() * colors.length)];

    const mat = new THREE.MeshStandardMaterial({
        color, metalness: 0.6, roughness: 0.2,
        emissive: color, emissiveIntensity: 0.4,
    });

    const geo = obstacleGeometries[type] || obstacleGeometries.box;
    const mesh = new THREE.Mesh(geo, mat);

    const lanes = [-config.gameplay.laneWidth, 0, config.gameplay.laneWidth];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];

    mesh.position.set(lane, geo.parameters.height / 2, -60);
    mesh.castShadow = true;

    // Edge glow
    const edgeMat = new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: color, emissiveIntensity: 0.8,
        transparent: true, opacity: 0.3,
    });
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
    mesh.add(edges);

    let moveDir = 1;
    let moveSpeed = 2 + Math.random() * 2;
    let spinSpeed = (Math.random() - 0.5) * 4;

    return {
        mesh, type,
        width: geo.parameters.width,
        height: geo.parameters.height,
        update(dt, gameSpeed) {
            mesh.position.z += gameSpeed * dt;
            if (type === 'moving') {
                mesh.position.x += moveDir * moveSpeed * dt;
                if (Math.abs(mesh.position.x) > config.gameplay.laneWidth) moveDir *= -1;
            }
            if (type === 'spinning') {
                mesh.rotation.z += spinSpeed * dt;
            }
        },
        isOffScreen() { return mesh.position.z > 15; },
        dispose(m) { if (m) m.removeFromParent(); }
    };
}

export function createCoin(config) {
    const coinGroup = new THREE.Group();
    const coinMat = new THREE.MeshStandardMaterial({
        color: config.collectibles.coinColor,
        metalness: 0.95, roughness: 0.05,
        emissive: config.collectibles.coinColor, emissiveIntensity: 0.6,
    });
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.08, 16), coinMat);
    coin.rotation.x = Math.PI / 2;
    coinGroup.add(coin);

    const ringMat = new THREE.MeshStandardMaterial({
        color: config.collectibles.coinColor, transparent: true, opacity: 0.5,
        emissive: config.collectibles.coinColor, emissiveIntensity: 1,
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.04, 8, 24), ringMat);
    coinGroup.add(ring);

    const lanes = [-config.gameplay.laneWidth, 0, config.gameplay.laneWidth];
    coinGroup.position.set(lanes[Math.floor(Math.random() * 3)], 1.2, -60);

    return {
        mesh: coinGroup,
        update(dt, gameSpeed) {
            coinGroup.position.z += gameSpeed * dt;
            coinGroup.rotation.y += 3 * dt;
            coinGroup.position.y = 1.2 + Math.sin(Date.now() * 0.003) * 0.15;
        },
        isOffScreen() { return coinGroup.position.z > 15; },
        dispose(m) { if (m) m.removeFromParent(); }
    };
}

export function createPowerup(type, config) {
    const color = config.powerups.colors[type];
    const group = new THREE.Group();

    // Outer shell
    const shellMat = new THREE.MeshStandardMaterial({
        color, transparent: true, opacity: 0.4,
        emissive: color, emissiveIntensity: 0.8,
    });
    const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 1), shellMat);
    group.add(shell);

    // Inner core
    const coreMat = new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: color, emissiveIntensity: 1,
    });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.2), coreMat);
    group.add(core);

    // Icon shape based on type
    let icon;
    if (type === 'shield') {
        icon = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.3), coreMat);
    } else if (type === 'magnet') {
        icon = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.05, 8, 12, Math.PI), coreMat);
    } else if (type === 'doubleScore') {
        icon = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), coreMat);
    } else {
        icon = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.25), coreMat);
    }
    group.add(icon);

    const lanes = [-config.gameplay.laneWidth, 0, config.gameplay.laneWidth];
    group.position.set(lanes[Math.floor(Math.random() * 3)], 1.5, -60);

    return {
        mesh: group, type,
        update(dt, gameSpeed) {
            group.position.z += gameSpeed * dt;
            group.rotation.y += 2 * dt;
            group.position.y = 1.5 + Math.sin(Date.now() * 0.004) * 0.2;
        },
        isOffScreen() { return group.position.z > 15; },
        dispose(m) { if (m) m.removeFromParent(); }
    };
}

export function createSpeedZone(config) {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
        color: config.speedZones.color, transparent: true, opacity: 0.4,
        emissive: config.speedZones.color, emissiveIntensity: 0.6,
        side: THREE.DoubleSide,
    });
    const pad = new THREE.Mesh(new THREE.PlaneGeometry(config.gameplay.laneWidth * 0.8, 4), mat);
    pad.rotation.x = -Math.PI / 2;
    pad.position.y = 0.02;
    group.add(pad);

    // Arrow indicators
    const arrowMat = new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: config.speedZones.color, emissiveIntensity: 1,
    });
    for (let i = 0; i < 3; i++) {
        const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.4, 3), arrowMat);
        arrow.rotation.x = -Math.PI / 2;
        arrow.position.set(0, 0.05, -1.5 + i * 1.5);
        group.add(arrow);
    }

    const lanes = [-config.gameplay.laneWidth, 0, config.gameplay.laneWidth];
    group.position.set(lanes[Math.floor(Math.random() * 3)], 0, -60);

    return {
        mesh: group,
        update(dt, gameSpeed) {
            group.position.z += gameSpeed * dt;
            mat.opacity = 0.3 + Math.sin(Date.now() * 0.005) * 0.15;
        },
        isOffScreen() { return group.position.z > 15; },
        dispose(m) { if (m) m.removeFromParent(); }
    };
}

export function createBoss(config) {
    const group = new THREE.Group();
    const color = config.boss.color;

    const bodyMat = new THREE.MeshStandardMaterial({
        color, metalness: 0.7, roughness: 0.2,
        emissive: color, emissiveIntensity: 0.5,
    });

    // Main body
    const body = new THREE.Mesh(new THREE.BoxGeometry(3, 4, 2), bodyMat);
    body.position.y = 3;
    group.add(body);

    // Eyes
    const eyeMat = new THREE.MeshStandardMaterial({
        color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 1,
    });
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.3), eyeMat);
    leftEye.position.set(-0.7, 3.5, 1.1);
    group.add(leftEye);
    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.3), eyeMat);
    rightEye.position.set(0.7, 3.5, 1.1);
    group.add(rightEye);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.8, 3, 0.8);
    const leftArm = new THREE.Mesh(armGeo, bodyMat);
    leftArm.position.set(-2, 2.5, 0);
    group.add(leftArm);
    const rightArm = new THREE.Mesh(armGeo, bodyMat);
    rightArm.position.set(2, 2.5, 0);
    group.add(rightArm);

    // Spikes
    const spikeMat = new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: color, emissiveIntensity: 0.8,
    });
    for (let i = 0; i < 5; i++) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.8), spikeMat);
        spike.position.set(-1.2 + i * 0.6, 5.2, 0);
        group.add(spike);
    }

    group.position.set(0, 0, -50);

    let attackTimer = 0;
    let health = config.boss.health;

    return {
        group, health, maxHealth: config.boss.health,
        update(dt, gameSpeed) {
            // Hover animation
            group.position.y = Math.sin(Date.now() * 0.002) * 0.5;
            // Eye glow pulse
            eyeMat.emissiveIntensity = 0.8 + Math.sin(Date.now() * 0.01) * 0.4;
        },
        takeDamage() {
            health--;
            // Flash red on hit
            bodyMat.emissive.setHex(0xffffff);
            setTimeout(() => bodyMat.emissive.setHex(color), 100);
            return health <= 0;
        },
        isDefeated() { return health <= 0; },
        dispose() { group.removeFromParent(); }
    };
}
