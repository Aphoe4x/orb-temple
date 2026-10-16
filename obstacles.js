var _obstacleGeometries = {
    box: new THREE.BoxGeometry(1.5,1.5,1.5), tall: new THREE.BoxGeometry(1.2,3,1.2),
    wide: new THREE.BoxGeometry(4,1,1.5), moving: new THREE.BoxGeometry(1,1,1), spinning: new THREE.BoxGeometry(1.5,1.5,0.3),
};

function createObstacle(type, config) {
    var colors = config.obstacles.colors; var color = colors[Math.floor(Math.random()*colors.length)];
    var mat = new THREE.MeshStandardMaterial({ color: color, metalness:0.6, roughness:0.2, emissive:color, emissiveIntensity:0.4 });
    var geo = _obstacleGeometries[type] || _obstacleGeometries.box;
    var mesh = new THREE.Mesh(geo, mat);
    var lanes = [-config.gameplay.laneWidth, 0, config.gameplay.laneWidth];
    var lane = lanes[Math.floor(Math.random()*lanes.length)];
    mesh.position.set(lane, geo.parameters.height/2, -60); mesh.castShadow = true;
    var edgeMat = new THREE.MeshStandardMaterial({ color:0xffffff, emissive:color, emissiveIntensity:0.8, transparent:true, opacity:0.3 });
    var edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat); mesh.add(edges);
    var moveDir = 1, moveSpeed = 2+Math.random()*2, spinSpeed = (Math.random()-0.5)*4;
    return { mesh: mesh, type: type, width: geo.parameters.width, height: geo.parameters.height,
        update: function(dt, gs) { mesh.position.z += gs*dt; if(type==='moving'){mesh.position.x+=moveDir*moveSpeed*dt;if(Math.abs(mesh.position.x)>config.gameplay.laneWidth)moveDir*=-1;} if(type==='spinning'){mesh.rotation.z+=spinSpeed*dt;} },
        isOffScreen: function() { return mesh.position.z > 15; },
        dispose: function(m) { if(m) m.removeFromParent(); }
    };
}

function createCoin(config) {
    var g = new THREE.Group();
    var coinMat = new THREE.MeshStandardMaterial({ color:config.collectibles.coinColor, metalness:0.95, roughness:0.05, emissive:config.collectibles.coinColor, emissiveIntensity:0.6 });
    var coin = new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,0.08,16), coinMat); coin.rotation.x=Math.PI/2; g.add(coin);
    var ringMat = new THREE.MeshStandardMaterial({ color:config.collectibles.coinColor, transparent:true, opacity:0.5, emissive:config.collectibles.coinColor, emissiveIntensity:1 });
    var ring = new THREE.Mesh(new THREE.TorusGeometry(0.5,0.04,8,24), ringMat); g.add(ring);
    var lanes = [-config.gameplay.laneWidth,0,config.gameplay.laneWidth]; g.position.set(lanes[Math.floor(Math.random()*3)], 1.2, -60);
    return { mesh: g, update: function(dt,gs){g.position.z+=gs*dt;g.rotation.y+=3*dt;g.position.y=1.2+Math.sin(Date.now()*0.003)*0.15;}, isOffScreen:function(){return g.position.z>15;}, dispose:function(m){if(m)m.removeFromParent();} };
}

function createPowerup(type, config) {
    var color = config.powerups.colors[type]; var g = new THREE.Group();
    var shellMat = new THREE.MeshStandardMaterial({ color:color, transparent:true, opacity:0.4, emissive:color, emissiveIntensity:0.8 });
    var shell = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5,1), shellMat); g.add(shell);
    var coreMat = new THREE.MeshStandardMaterial({ color:0xffffff, emissive:color, emissiveIntensity:1 });
    var core = new THREE.Mesh(new THREE.SphereGeometry(0.2), coreMat); g.add(core);
    var lanes = [-config.gameplay.laneWidth,0,config.gameplay.laneWidth]; g.position.set(lanes[Math.floor(Math.random()*3)], 1.5, -60);
    return { mesh: g, type: type, update: function(dt,gs){g.position.z+=gs*dt;g.rotation.y+=2*dt;g.position.y=1.5+Math.sin(Date.now()*0.004)*0.2;}, isOffScreen:function(){return g.position.z>15;}, dispose:function(m){if(m)m.removeFromParent();} };
}

function createSpeedZone(config) {
    var g = new THREE.Group();
    var mat = new THREE.MeshStandardMaterial({ color:config.speedZones.color, transparent:true, opacity:0.4, emissive:config.speedZones.color, emissiveIntensity:0.6, side:THREE.DoubleSide });
    var pad = new THREE.Mesh(new THREE.PlaneGeometry(config.gameplay.laneWidth*0.8,4), mat); pad.rotation.x=-Math.PI/2; pad.position.y=0.02; g.add(pad);
    var lanes = [-config.gameplay.laneWidth,0,config.gameplay.laneWidth]; g.position.set(lanes[Math.floor(Math.random()*3)], 0, -60);
    return { mesh: g, update: function(dt,gs){g.position.z+=gs*dt;mat.opacity=0.3+Math.sin(Date.now()*0.005)*0.15;}, isOffScreen:function(){return g.position.z>15;}, dispose:function(m){if(m)m.removeFromParent();} };
}

function createBoss(config) {
    var g = new THREE.Group(); var color = config.boss.color;
    var bodyMat = new THREE.MeshStandardMaterial({ color:color, metalness:0.7, roughness:0.2, emissive:color, emissiveIntensity:0.5 });
    var body = new THREE.Mesh(new THREE.BoxGeometry(3,4,2), bodyMat); body.position.y=3; g.add(body);
    var eyeMat = new THREE.MeshStandardMaterial({ color:0xffff00, emissive:0xffff00, emissiveIntensity:1 });
    var le = new THREE.Mesh(new THREE.SphereGeometry(0.3),eyeMat); le.position.set(-0.7,3.5,1.1); g.add(le);
    var re = new THREE.Mesh(new THREE.SphereGeometry(0.3),eyeMat); re.position.set(0.7,3.5,1.1); g.add(re);
    var armGeo = new THREE.BoxGeometry(0.8,3,0.8);
    var la = new THREE.Mesh(armGeo,bodyMat); la.position.set(-2,2.5,0); g.add(la);
    var ra = new THREE.Mesh(armGeo,bodyMat); ra.position.set(2,2.5,0); g.add(ra);
    g.position.set(0,0,-50);
    var health = config.boss.health;
    return { group:g, health:health, maxHealth:config.boss.health,
        update:function(dt){g.position.y=Math.sin(Date.now()*0.002)*0.5;eyeMat.emissiveIntensity=0.8+Math.sin(Date.now()*0.01)*0.4;},
        takeDamage:function(){health--;bodyMat.emissive.setHex(0xffffff);setTimeout(function(){bodyMat.emissive.setHex(color);},100);return health<=0;},
        isDefeated:function(){return health<=0;},dispose:function(){g.removeFromParent();} };
}
