function createTrail(config) {
    var particleCount = 80;
    var geometry = new THREE.BufferGeometry();
    var positions = new Float32Array(particleCount * 3);
    var lifetimes = new Float32Array(particleCount);
    for (var i = 0; i < particleCount; i++) { positions[i*3] = 0; positions[i*3+1] = -100; positions[i*3+2] = 0; lifetimes[i] = 0; }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var material = new THREE.PointsMaterial({ color: config.character.trailColor, size: 0.18, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
    var points = new THREE.Points(geometry, material);
    var currentIdx = 0;
    return {
        points: points,
        emit: function(x, y, z) { var i = currentIdx % particleCount; positions[i*3]=x; positions[i*3+1]=y; positions[i*3+2]=z; lifetimes[i]=1.0; currentIdx++; },
        update: function(dt) {
            for (var i = 0; i < particleCount; i++) {
                if (lifetimes[i] > 0) { lifetimes[i] -= dt*2; positions[i*3+1] -= dt*3; if (lifetimes[i] <= 0) positions[i*3+1] = -100; }
            }
            geometry.attributes.position.needsUpdate = true;
        },
        dispose: function() { points.removeFromParent(); geometry.dispose(); material.dispose(); }
    };
}

function createExplosion(scene, color) {
    var particleCount = 40;
    var geometry = new THREE.BufferGeometry();
    var positions = new Float32Array(particleCount * 3);
    var velocities = [];
    for (var i = 0; i < particleCount; i++) {
        positions[i*3]=0; positions[i*3+1]=1; positions[i*3+2]=0;
        velocities.push(new THREE.Vector3((Math.random()-0.5)*10, Math.random()*8, (Math.random()-0.5)*10));
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var material = new THREE.PointsMaterial({ color: color, size: 0.25, transparent: true, opacity: 1, blending: THREE.AdditiveBlending });
    var points = new THREE.Points(geometry, material);
    scene.add(points);
    var life = 1.0;
    return {
        points: points,
        update: function(dt) {
            life -= dt * 1.5;
            if (life <= 0) { scene.remove(points); geometry.dispose(); material.dispose(); return false; }
            for (var i = 0; i < particleCount; i++) {
                positions[i*3] += velocities[i].x * dt; positions[i*3+1] += velocities[i].y * dt; positions[i*3+2] += velocities[i].z * dt;
                velocities[i].y -= 15 * dt;
            }
            material.opacity = life;
            geometry.attributes.position.needsUpdate = true;
            return true;
        }
    };
}

function createGround(config) {
    var group = new THREE.Group();
    var groundGeo = new THREE.PlaneGeometry(30, 200);
    var groundMat = new THREE.MeshStandardMaterial({ color: config.world.groundColor, metalness: 0.3, roughness: 0.7 });
    var ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI/2; ground.position.set(0, 0, -50); ground.receiveShadow = true;
    group.add(ground);
    var gridHelper = new THREE.GridHelper(200, 100, config.character.accentColor, config.world.groundAccentColor);
    gridHelper.position.set(0, 0.01, -50); gridHelper.material.opacity = 0.25; gridHelper.material.transparent = true;
    group.add(gridHelper);
    var railMat = new THREE.MeshStandardMaterial({ color: config.character.accentColor, emissive: config.character.accentColor, emissiveIntensity: 0.6, transparent: true, opacity: 0.7 });
    var railGeo = new THREE.BoxGeometry(0.1, 0.1, 200);
    var leftRail = new THREE.Mesh(railGeo, railMat); leftRail.position.set(-config.gameplay.laneWidth-1.5, 0.05, -50); group.add(leftRail);
    var rightRail = new THREE.Mesh(railGeo, railMat); rightRail.position.set(config.gameplay.laneWidth+1.5, 0.05, -50); group.add(rightRail);
    var dividerMat = new THREE.MeshStandardMaterial({ color: config.character.bodyColor, emissive: config.character.bodyColor, emissiveIntensity: 0.4, transparent: true, opacity: 0.25 });
    for (var i = -1; i <= 1; i += 2) { var d = new THREE.Mesh(new THREE.BoxGeometry(0.05,0.05,200), dividerMat); d.position.set(i*config.gameplay.laneWidth, 0.03, -50); group.add(d); }
    return group;
}

function createSkybox(config) {
    var starCount = 300;
    var geometry = new THREE.BufferGeometry();
    var positions = new Float32Array(starCount * 3);
    var colors = new Float32Array(starCount * 3);
    for (var i = 0; i < starCount; i++) {
        positions[i*3]=(Math.random()-0.5)*100; positions[i*3+1]=Math.random()*50+5; positions[i*3+2]=-Math.random()*120+10;
        var c = new THREE.Color().setHSL(Math.random(), 0.8, 0.8);
        colors[i*3]=c.r; colors[i*3+1]=c.g; colors[i*3+2]=c.b;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    var material = new THREE.PointsMaterial({ size: 0.25, transparent: true, opacity: 0.7, vertexColors: true, blending: THREE.AdditiveBlending });
    var stars = new THREE.Points(geometry, material);
    return {
        stars: stars,
        update: function(dt) {
            var pos = stars.geometry.attributes.position.array;
            for (var i = 0; i < starCount; i++) { pos[i*3+1] += dt*0.3; if (pos[i*3+1] > 55) pos[i*3+1] = 5; }
            stars.geometry.attributes.position.needsUpdate = true;
        }
    };
}

function createWeather(scene, config) {
    var rainCount = config.weather.rainParticleCount;
    var rainGeo = new THREE.BufferGeometry();
    var rainPos = new Float32Array(rainCount * 3);
    for (var i = 0; i < rainCount; i++) { rainPos[i*3]=(Math.random()-0.5)*40; rainPos[i*3+1]=Math.random()*30; rainPos[i*3+2]=(Math.random()-0.5)*60-10; }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    var rainMat = new THREE.PointsMaterial({ color: 0x8888ff, size: 0.08, transparent: true, opacity: 0.5 });
    var rain = new THREE.Points(rainGeo, rainMat); rain.visible = false; scene.add(rain);
    var lightningTimer = 0, lightningActive = false;
    return {
        rain: rain,
        setWeather: function(type) {
            rain.visible = (type === 'rain' || type === 'storm');
            if (type === 'fog') scene.fog.density = 0.04; else if (type === 'storm') scene.fog.density = 0.02; else scene.fog.density = config.world.fogDensity;
        },
        update: function(dt, isStorm) {
            if (rain.visible) { var pos = rain.geometry.attributes.position.array; for (var i = 0; i < rainCount; i++) { pos[i*3+1] -= dt*25; if (pos[i*3+1] < 0) { pos[i*3+1] = 30; pos[i*3] = (Math.random()-0.5)*40; } } rain.geometry.attributes.position.needsUpdate = true; }
            if (isStorm) { lightningTimer -= dt; if (lightningTimer <= 0) { lightningTimer = 3+Math.random()*5; lightningActive = true; setTimeout(function(){lightningActive=false;},150); } }
        },
        isLightning: function() { return lightningActive; }
    };
}

function createDayNightCycle(scene, config) {
    var cycle = config.dayNight; var time = 0;
    var sunLight = new THREE.DirectionalLight(0xffffff, 1); sunLight.position.set(5,10,5); sunLight.castShadow = true; scene.add(sunLight);
    var ambient = new THREE.AmbientLight(0x404060, 0.5); scene.add(ambient);
    return {
        sunLight: sunLight, ambient: ambient,
        update: function(dt) {
            time += dt; var angle = (time/cycle.cycleDuration)*Math.PI*2; var sunHeight = Math.sin(angle);
            sunLight.position.x = Math.cos(angle)*10; sunLight.position.y = Math.max(2, sunHeight*15);
            var dayIntensity = Math.max(0.2, sunHeight); sunLight.intensity = dayIntensity;
            sunLight.color.setHSL(0.1, 0.3, 0.5+dayIntensity*0.5); ambient.intensity = 0.3+dayIntensity*0.3;
            var skyLerp = (sunHeight+1)/2;
            var nightColor = new THREE.Color(0x050510); var dayColor = new THREE.Color(0x1a1a3e);
            scene.background = nightColor.clone().lerp(dayColor, skyLerp); scene.fog.color.copy(scene.background);
        }
    };
}
