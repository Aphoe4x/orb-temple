var _geos = {
    box: new THREE.BoxGeometry(1.5,1.5,1.5), tall: new THREE.BoxGeometry(1.2,3,1.2),
    wide: new THREE.BoxGeometry(4,1,1.5), moving: new THREE.BoxGeometry(1,1,1), spinning: new THREE.BoxGeometry(1.5,1.5,0.3),
};
function createObstacle(type, config) {
    var colors = config.obstacles.colors, color = colors[Math.floor(Math.random()*colors.length)];
    var mat = new THREE.MeshStandardMaterial({ color: color, metalness: .7, roughness: .15, emissive: color, emissiveIntensity: .4 });
    var geo = _geos[type] || _geos.box, mesh = new THREE.Mesh(geo, mat);
    var lanes = [-config.gameplay.laneWidth, 0, config.gameplay.laneWidth], lane = lanes[Math.floor(Math.random()*lanes.length)];
    mesh.position.set(lane, geo.parameters.height/2, -60); mesh.castShadow = true;
    var edgeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: color, emissiveIntensity: .8, transparent: true, opacity: .4 });
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat));
    var md=1, ms=2+Math.random()*2, ss=(Math.random()-.5)*4;
    return { mesh: mesh, type: type, width: geo.parameters.width, height: geo.parameters.height,
        update: function(dt, gs) { mesh.position.z += gs*dt; if(type==='moving'){mesh.position.x+=md*ms*dt;if(Math.abs(mesh.position.x)>config.gameplay.laneWidth)md*=-1;} if(type==='spinning'){mesh.rotation.z+=ss*dt;} },
        isOffScreen: function() { return mesh.position.z > 15; }, dispose: function(m) { if(m) m.removeFromParent(); }
    };
}
function createCoin(config) {
    var g = new THREE.Group();
    var mat = new THREE.MeshStandardMaterial({ color: config.collectibles.coinColor, metalness: 1, roughness: 0, emissive: config.collectibles.coinColor, emissiveIntensity: .8 });
    var coin = new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,.1,16), mat); coin.rotation.x = Math.PI/2; g.add(coin);
    var ring = new THREE.Mesh(new THREE.TorusGeometry(.55,.05,8,24), new THREE.MeshStandardMaterial({ color: config.collectibles.coinColor, transparent: true, opacity: .6, emissive: config.collectibles.coinColor, emissiveIntensity: 1.2 })); g.add(ring);
    var glow = new THREE.PointLight(config.collectibles.coinColor, .3, 3); g.add(glow);
    var lanes = [-config.gameplay.laneWidth,0,config.gameplay.laneWidth]; g.position.set(lanes[Math.floor(Math.random()*3)], 1.2, -60);
    return { mesh: g, update: function(dt,gs){g.position.z+=gs*dt;g.rotation.y+=4*dt;g.position.y=1.2+Math.sin(Date.now()*.004)*.2;}, isOffScreen:function(){return g.position.z>15;}, dispose:function(m){if(m)m.removeFromParent();} };
}
function createPowerup(type, config) {
    var color = config.powerups.colors[type], g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.6,1), new THREE.MeshStandardMaterial({ color: color, transparent: true, opacity: .5, emissive: color, emissiveIntensity: 1 })));
    g.add(new THREE.Mesh(new THREE.SphereGeometry(.25), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: color, emissiveIntensity: 1.5 })));
    var glow = new THREE.PointLight(color, .5, 5); g.add(glow);
    var lanes = [-config.gameplay.laneWidth,0,config.gameplay.laneWidth]; g.position.set(lanes[Math.floor(Math.random()*3)], 1.5, -60);
    return { mesh: g, type: type, update: function(dt,gs){g.position.z+=gs*dt;g.rotation.y+=3*dt;g.position.y=1.5+Math.sin(Date.now()*.005)*.25;}, isOffScreen:function(){return g.position.z>15;}, dispose:function(m){if(m)m.removeFromParent();} };
}
function createBoss(config) {
    var g = new THREE.Group(), color = config.boss.color;
    var bm = new THREE.MeshStandardMaterial({ color: color, metalness: .8, roughness: .1, emissive: color, emissiveIntensity: .6 });
    var body = new THREE.Mesh(new THREE.BoxGeometry(3.5,4.5,2.5), bm); body.position.y = 3.2; body.castShadow = true; g.add(body);
    var em = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 1.5 });
    var le = new THREE.Mesh(new THREE.SphereGeometry(.35), em); le.position.set(-.8, 3.8, 1.3); g.add(le);
    var re = new THREE.Mesh(new THREE.SphereGeometry(.35), em); re.position.set(.8, 3.8, 1.3); g.add(re);
    var ag = new THREE.BoxGeometry(1,3.5,.8), la = new THREE.Mesh(ag,bm); la.position.set(-2.2,2.8,0); g.add(la);
    var ra = new THREE.Mesh(ag,bm); ra.position.set(2.2,2.8,0); g.add(ra);
    for(var i=0;i<5;i++){ var spike=new THREE.Mesh(new THREE.ConeGeometry(.25,1),em); spike.position.set(-1.4+i*.7,5.8,0); g.add(spike); }
    var glow = new THREE.PointLight(color, 1, 10); glow.position.set(0,3,3); g.add(glow);
    g.position.set(0,0,-50); var health = config.boss.health;
    return { group: g, health: health, maxHealth: config.boss.health,
        update: function(dt) { g.position.y = Math.sin(Date.now()*.003)*.6; em.emissiveIntensity = 1+Math.sin(Date.now()*.015)*.5; glow.intensity = .8+Math.sin(Date.now()*.01)*.4; },
        takeDamage: function() { health--; bm.emissive.setHex(0xffffff); setTimeout(function(){bm.emissive.setHex(color);},150); return health<=0; },
        dispose: function() { g.removeFromParent(); } };
}
