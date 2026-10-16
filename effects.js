import * as THREE from 'three';

export function createTrail(config) {
    const particleCount = 80;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const lifetimes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = 0;
        positions[i * 3 + 1] = -100;
        positions[i * 3 + 2] = 0;
        lifetimes[i] = 0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: config.character.trailColor,
        size: 0.18,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    let currentIdx = 0;

    return {
        points,
        emit(x, y, z) {
            const i = currentIdx % particleCount;
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
            lifetimes[i] = 1.0;
            currentIdx++;
        },
        update(dt) {
            for (let i = 0; i < particleCount; i++) {
                if (lifetimes[i] > 0) {
                    lifetimes[i] -= dt * 2;
                    positions[i * 3 + 1] -= dt * 3;
                    if (lifetimes[i] <= 0) positions[i * 3 + 1] = -100;
                }
            }
            geometry.attributes.position.needsUpdate = true;
        },
        dispose() { points.removeFromParent(); geometry.dispose(); material.dispose(); }
    };
}

export function createExplosion(scene, color = 0xff4444) {
    const particleCount = 40;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = 0;
        positions[i * 3 + 1] = 1;
        positions[i * 3 + 2] = 0;
        velocities.push(new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            Math.random() * 8,
            (Math.random() - 0.5) * 10
        ));
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color, size: 0.25, transparent: true, opacity: 1,
        blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let life = 1.0;

    return {
        points,
        update(dt) {
            life -= dt * 1.5;
            if (life <= 0) {
                scene.remove(points);
                geometry.dispose();
                material.dispose();
                return false;
            }
            for (let i = 0; i < particleCount; i++) {
                positions[i * 3] += velocities[i].x * dt;
                positions[i * 3 + 1] += velocities[i].y * dt;
                positions[i * 3 + 2] += velocities[i].z * dt;
                velocities[i].y -= 15 * dt;
            }
            material.opacity = life;
            geometry.attributes.position.needsUpdate = true;
            return true;
        }
    };
}

export function createGround(config) {
    const group = new THREE.Group();

    const groundGeo = new THREE.PlaneGeometry(30, 200);
    const groundMat = new THREE.MeshStandardMaterial({
        color: config.world.groundColor,
        metalness: 0.3,
        roughness: 0.7,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, -50);
    ground.receiveShadow = true;
    group.add(ground);

    const gridHelper = new THREE.GridHelper(200, 100, config.character.accentColor, config.world.groundAccentColor);
    gridHelper.position.set(0, 0.01, -50);
    gridHelper.material.opacity = 0.25;
    gridHelper.material.transparent = true;
    group.add(gridHelper);

    // Side rails
    const railMat = new THREE.MeshStandardMaterial({
        color: config.character.accentColor,
        emissive: config.character.accentColor,
        emissiveIntensity: 0.6,
        transparent: true, opacity: 0.7,
    });
    const railGeo = new THREE.BoxGeometry(0.1, 0.1, 200);
    const leftRail = new THREE.Mesh(railGeo, railMat);
    leftRail.position.set(-config.gameplay.laneWidth - 1.5, 0.05, -50);
    group.add(leftRail);
    const rightRail = new THREE.Mesh(railGeo, railMat);
    rightRail.position.set(config.gameplay.laneWidth + 1.5, 0.05, -50);
    group.add(rightRail);

    // Lane dividers
    const dividerMat = new THREE.MeshStandardMaterial({
        color: config.character.bodyColor,
        emissive: config.character.bodyColor,
        emissiveIntensity: 0.4,
        transparent: true, opacity: 0.25,
    });
    for (let i = -1; i <= 1; i += 2) {
        const divider = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 200), dividerMat);
        divider.position.set(i * config.gameplay.laneWidth, 0.03, -50);
        group.add(divider);
    }

    return group;
}

export function createSkybox(config) {
    const starCount = 300;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = Math.random() * 50 + 5;
        positions[i * 3 + 2] = -Math.random() * 120 + 10;

        const c = new THREE.Color().setHSL(Math.random(), 0.8, 0.8);
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.25, transparent: true, opacity: 0.7,
        vertexColors: true, blending: THREE.AdditiveBlending,
    });

    const stars = new THREE.Points(geometry, material);

    return {
        stars,
        update(dt) {
            const pos = stars.geometry.attributes.position.array;
            for (let i = 0; i < starCount; i++) {
                pos[i * 3 + 1] += dt * 0.3;
                if (pos[i * 3 + 1] > 55) pos[i * 3 + 1] = 5;
            }
            stars.geometry.attributes.position.needsUpdate = true;
        }
    };
}

export function createWeather(scene, config) {
    // Rain particles
    const rainCount = config.weather.rainParticleCount;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
        rainPos[i * 3] = (Math.random() - 0.5) * 40;
        rainPos[i * 3 + 1] = Math.random() * 30;
        rainPos[i * 3 + 2] = (Math.random() - 0.5) * 60 - 10;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));

    const rainMat = new THREE.PointsMaterial({
        color: 0x8888ff, size: 0.08, transparent: true, opacity: 0.5,
    });
    const rain = new THREE.Points(rainGeo, rainMat);
    rain.visible = false;
    scene.add(rain);

    // Lightning flash
    let lightningTimer = 0;
    let lightningActive = false;

    return {
        rain,
        setWeather(type) {
            rain.visible = (type === 'rain' || type === 'storm');
            if (type === 'fog') {
                scene.fog.density = 0.04;
            } else if (type === 'storm') {
                scene.fog.density = 0.02;
            } else {
                scene.fog.density = config.world.fogDensity;
            }
        },
        update(dt, isStorm) {
            if (rain.visible) {
                const pos = rain.geometry.attributes.position.array;
                for (let i = 0; i < rainCount; i++) {
                    pos[i * 3 + 1] -= dt * 25;
                    if (pos[i * 3 + 1] < 0) {
                        pos[i * 3 + 1] = 30;
                        pos[i * 3] = (Math.random() - 0.5) * 40;
                    }
                }
                rain.geometry.attributes.position.needsUpdate = true;
            }
            // Lightning
            if (isStorm) {
                lightningTimer -= dt;
                if (lightningTimer <= 0) {
                    lightningTimer = 3 + Math.random() * 5;
                    lightningActive = true;
                    setTimeout(() => { lightningActive = false; }, 150);
                }
            }
        },
        isLightning() { return lightningActive; }
    };
}

export function createDayNightCycle(scene, config) {
    const cycle = config.dayNight;
    let time = 0;

    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(5, 10, 5);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const ambient = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(ambient);

    return {
        sunLight, ambient,
        update(dt) {
            time += dt;
            const angle = (time / cycle.cycleDuration) * Math.PI * 2;
            const sunHeight = Math.sin(angle);

            // Sun position
            sunLight.position.x = Math.cos(angle) * 10;
            sunLight.position.y = Math.max(2, sunHeight * 15);

            // Color shift
            const dayIntensity = Math.max(0.2, sunHeight);
            sunLight.intensity = dayIntensity;
            sunLight.color.setHSL(0.1, 0.3, 0.5 + dayIntensity * 0.5);

            ambient.intensity = 0.3 + dayIntensity * 0.3;

            // Sky color
            const skyLerp = (sunHeight + 1) / 2;
            const nightColor = new THREE.Color(0x050510);
            const dayColor = new THREE.Color(0x1a1a3e);
            scene.background = nightColor.clone().lerp(dayColor, skyLerp);
            scene.fog.color.copy(scene.background);
        }
    };
}
