function createTrail(config) {
    var count = 60, geo = new THREE.BufferGeometry(), pos = new Float32Array(count * 3), life = new Float32Array(count);
    for (var i = 0; i < count; i++) { pos[i*3+1] = -100; life[i] = 0; }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var mat = new THREE.PointsMaterial({ color: config.character.trailColor, size: .2, transparent: true, opacity: .8, blending: THREE.AdditiveBlending });
    var points = new THREE.Points(geo, mat), idx = 0;
    return { points: points,
        emit: function(x,y,z) { var i=idx%count; pos[i*3]=x; pos[i*3+1]=y; pos[i*3+2]=z; life[i]=1; idx++; },
        update: function(dt) { for(var i=0;i<count;i++){if(life[i]>0){life[i]-=dt*2;pos[i*3+1]-=dt*3;if(life[i]<=0)pos[i*3+1]=-100;}} geo.attributes.position.needsUpdate=true; },
        dispose: function() { points.removeFromParent(); geo.dispose(); mat.dispose(); }
    };
}
function createExplosion(scene, color) {
    var count = 50, geo = new THREE.BufferGeometry(), pos = new Float32Array(count * 3), vel = [];
    for (var i = 0; i < count; i++) { pos[i*3+1]=1; vel.push(new THREE.Vector3((Math.random()-.5)*12, Math.random()*10, (Math.random()-.5)*12)); }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var mat = new THREE.PointsMaterial({ color: color, size: .3, transparent: true, opacity: 1, blending: THREE.AdditiveBlending });
    var points = new THREE.Points(geo, mat); scene.add(points); var life = 1;
    return { points: points, update: function(dt) { life -= dt*1.2; if(life<=0){scene.remove(points);geo.dispose();mat.dispose();return false;} for(var i=0;i<count;i++){pos[i*3]+=vel[i].x*dt;pos[i*3+1]+=vel[i].y*dt;pos[i*3+2]+=vel[i].z*dt;vel[i].y-=18*dt;} mat.opacity=life; geo.attributes.position.needsUpdate=true; return true; } };
}
function createGround(config) {
    var group = new THREE.Group();
    var groundGeo = new THREE.PlaneGeometry(40, 300);
    var groundMat = new THREE.MeshStandardMaterial({ color: config.world.groundColor, metalness: 0.4, roughness: 0.6 });
    var ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI/2; ground.position.set(0, 0, -80); ground.receiveShadow = true;
    group.add(ground);
    var gridHelper = new THREE.GridHelper(300, 120, config.character.accentColor, config.world.groundAccentColor);
    gridHelper.position.set(0, 0.01, -80); gridHelper.material.opacity = 0.3; gridHelper.material.transparent = true;
    group.add(gridHelper);
    var railMat = new THREE.MeshStandardMaterial({ color: config.character.accentColor, emissive: config.character.accentColor, emissiveIntensity: 0.8, transparent: true, opacity: 0.8 });
    var railGeo = new THREE.BoxGeometry(0.15, 0.15, 300);
    [-1, 1].forEach(function(s) { var r = new THREE.Mesh(railGeo, railMat); r.position.set(s*(config.gameplay.laneWidth+1.5), 0.08, -80); group.add(r); });
    var divMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: config.character.bodyColor, emissiveIntensity: 0.4, transparent: true, opacity: 0.2 });
    for (var i = -1; i <= 1; i += 2) { var d = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 300), divMat); d.position.set(i*config.gameplay.laneWidth, 0.04, -80); group.add(d); }
    return group;
}
function createSkybox(config) {
    var count = 400, geo = new THREE.BufferGeometry(), pos = new Float32Array(count*3), col = new Float32Array(count*3);
    for (var i = 0; i < count; i++) { pos[i*3]=(Math.random()-.5)*120; pos[i*3+1]=Math.random()*60+5; pos[i*3+2]=-Math.random()*150+10; var c=new THREE.Color().setHSL(Math.random(),.7,.7); col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b; }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    var mat = new THREE.PointsMaterial({ size: .3, transparent: true, opacity: .6, vertexColors: true, blending: THREE.AdditiveBlending });
    var stars = new THREE.Points(geo, mat);
    return { stars: stars, update: function(dt) { var p=stars.geometry.attributes.position.array; for(var i=0;i<count;i++){p[i*3+1]+=dt*.5;if(p[i*3+1]>65)p[i*3+1]=5;} stars.geometry.attributes.position.needsUpdate=true; } };
}
function createDayNightCycle(scene, config) {
    var time = 0;
    var sun = new THREE.DirectionalLight(0xffffff, 1); sun.position.set(5,10,5); sun.castShadow = true; sun.shadow.mapSize.set(1024,1024); sun.shadow.camera.left=-10; sun.shadow.camera.right=10; sun.shadow.camera.top=10; sun.shadow.camera.bottom=-10; scene.add(sun);
    var amb = new THREE.AmbientLight(0x404060, 0.5); scene.add(amb);
    return { sunLight: sun, ambient: amb, update: function(dt) {
        time += dt; var a = (time/60)*Math.PI*2; var sh = Math.sin(a);
        sun.position.x = Math.cos(a)*10; sun.position.y = Math.max(2, sh*15);
        var di = Math.max(.2, sh); sun.intensity = di;
        var sl = (sh+1)/2; scene.background = new THREE.Color(0x050510).lerp(new THREE.Color(0x1a1a3e), sl);
        scene.fog.color.copy(scene.background);
    } };
}
