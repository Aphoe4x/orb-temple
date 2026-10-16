function createExplosion(scene, color, x, y, z) {
    var count = 20, geo = new THREE.BufferGeometry(), pos = new Float32Array(count * 3), vel = [];
    for (var i = 0; i < count; i++) {
        pos[i*3]=x; pos[i*3+1]=y; pos[i*3+2]=z;
        vel.push(new THREE.Vector3((Math.random()-.5)*8, (Math.random()-.5)*8, (Math.random()-.5)*8));
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var mat = new THREE.PointsMaterial({ color: color, size: .2, transparent: true, opacity: 1, blending: THREE.AdditiveBlending });
    var points = new THREE.Points(geo, mat); scene.add(points); var life = 1;
    return { points: points, update: function(dt) { life -= dt*1.5; if(life<=0){scene.remove(points);geo.dispose();mat.dispose();return false;} for(var i=0;i<count;i++){pos[i*3]+=vel[i].x*dt;pos[i*3+1]+=vel[i].y*dt;pos[i*3+2]+=vel[i].z*dt;} mat.opacity=life; geo.attributes.position.needsUpdate=true; return true; } };
}
function createTemple(scene) {
    var group = new THREE.Group();
    // Floor
    var floorGeo = new THREE.CircleGeometry(15, 32);
    var floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, metalness: .3, roughness: .7 });
    var floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI/2; floor.position.y = -0.5; floor.receiveShadow = true;
    group.add(floor);
    // Decorative rings
    for (var i = 0; i < 3; i++) {
        var ring = new THREE.Mesh(new THREE.TorusGeometry(3+i*3, .1, 8, 32), new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: .5 }));
        ring.rotation.x = Math.PI/2; ring.position.y = -.4;
        group.add(ring);
    }
    // Pillars
    for (var i = 0; i < 8; i++) {
        var angle = (i/8)*Math.PI*2;
        var pillar = new THREE.Mesh(new THREE.CylinderGeometry(.3,.4,4), new THREE.MeshStandardMaterial({ color: 0x334455, metalness:.6, roughness:.3 }));
        pillar.position.set(Math.cos(angle)*13, 1.5, Math.sin(angle)*13);
        pillar.castShadow = true;
        group.add(pillar);
    }
    scene.add(group);
    return group;
}
function createFrog(scene, config) {
    var group = new THREE.Group();
    var bodyMat = new THREE.MeshStandardMaterial({ color: 0x44aa44, metalness: .3, roughness: .5 });
    var body = new THREE.Mesh(new THREE.SphereGeometry(.5, 16, 16), bodyMat);
    body.scale.set(1, .8, 1.2); body.position.y = .3; group.add(body);
    var head = new THREE.Mesh(new THREE.SphereGeometry(.35, 16, 16), bodyMat);
    head.position.set(0, .7, .2); group.add(head);
    var eyeMat = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: .5 });
    var le = new THREE.Mesh(new THREE.SphereGeometry(.1), eyeMat); le.position.set(-.15, .85, .45); group.add(le);
    var re = new THREE.Mesh(new THREE.SphereGeometry(.1), eyeMat); re.position.set(.15, .85, .45); group.add(re);
    var pupilMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    var lp = new THREE.Mesh(new THREE.SphereGeometry(.05), pupilMat); lp.position.set(-.15, .85, .52); group.add(lp);
    var rp = new THREE.Mesh(new THREE.SphereGeometry(.05), pupilMat); rp.position.set(.15, .85, .52); group.add(rp);
    // Current ball (loaded)
    var ballMat = new THREE.MeshStandardMaterial({ color: config.orbColors[0], metalness: .5, roughness: .2, emissive: config.orbColors[0], emissiveIntensity: .3 });
    var ball = new THREE.Mesh(new THREE.SphereGeometry(config.orbRadius, 16, 16), ballMat);
    ball.position.set(0, .5, .6); ball.name = 'currentBall'; group.add(ball);
    // Next ball preview
    var nextBall = new THREE.Mesh(new THREE.SphereGeometry(config.orbRadius*.7, 16, 16), new THREE.MeshStandardMaterial({ color: config.orbColors[1], metalness: .5, roughness: .2, emissive: config.orbColors[1], emissiveIntensity: .3 }));
    nextBall.position.set(.4, .2, .4); nextBall.name = 'nextBall'; group.add(nextBall);
    scene.add(group);
    return { group: group, ballMat: ballMat, nextBallMat: nextBall.material };
}
