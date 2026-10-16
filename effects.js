function createTrail(config) {
    var count = 80, geo = new THREE.BufferGeometry(), pos = new Float32Array(count * 3), life = new Float32Array(count);
    for (var i = 0; i < count; i++) { pos[i*3+1] = -100; life[i] = 0; }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var mat = new THREE.PointsMaterial({ color: config.character.trailColor, size: .3, transparent: true, opacity: .9, blending: THREE.AdditiveBlending });
    var points = new THREE.Points(geo, mat), idx = 0;
    return { points: points,
        emit: function(x,y,z) { var i=idx%count; pos[i*3]=x; pos[i*3+1]=y; pos[i*3+2]=z; life[i]=1; idx++; },
        update: function(dt) { for(var i=0;i<count;i++){if(life[i]>0){life[i]-=dt*1.5;pos[i*3+1]-=dt*4;if(life[i]<=0)pos[i*3+1]=-100;}} geo.attributes.position.needsUpdate=true; },
        dispose: function() { points.removeFromParent(); geo.dispose(); mat.dispose(); }
    };
}
function createExplosion(scene, color) {
    var count = 60, geo = new THREE.BufferGeometry(), pos = new Float32Array(count * 3), vel = [];
    for (var i = 0; i < count; i++) { pos[i*3+1]=1; vel.push(new THREE.Vector3((Math.random()-.5)*15, Math.random()*12, (Math.random()-.5)*15)); }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var mat = new THREE.PointsMaterial({ color: color, size: .4, transparent: true, opacity: 1, blending: THREE.AdditiveBlending });
    var points = new THREE.Points(geo, mat); scene.add(points); var life = 1;
    return { points: points, update: function(dt) { life -= dt; if(life<=0){scene.remove(points);geo.dispose();mat.dispose();return false;} for(var i=0;i<count;i++){pos[i*3]+=vel[i].x*dt;pos[i*3+1]+=vel[i].y*dt;pos[i*3+2]+=vel[i].z*dt;vel[i].y-=20*dt;} mat.opacity=life; geo.attributes.position.needsUpdate=true; return true; } };
}
function createGround(config) {
    var group = new THREE.Group();
    var groundGeo = new THREE.PlaneGeometry(30, 400);
    var groundMat = new THREE.MeshStandardMaterial({ color: 0x0a0a18, metalness: 0.3, roughness: 0.7 });
    var ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI/2; ground.position.set(0, 0, -100); ground.receiveShadow = true;
    group.add(ground);
    var grid = new THREE.GridHelper(400, 100, 0x00c8ff, 0x111128);
    grid.position.set(0, .01, -100); grid.material.opacity = .25; grid.material.transparent = true;
    group.add(grid);
    var railMat = new THREE.MeshStandardMaterial({ color: 0xff00c8, emissive: 0xff00c8, emissiveIntensity: 1.2, transparent: true, opacity: .9 });
    var railGeo = new THREE.BoxGeometry(.15, .15, 400);
    [-1,1].forEach(function(s){ var r=new THREE.Mesh(railGeo,railMat); r.position.set(s*4, .08, -100); group.add(r); });
    var divMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x00c8ff, emissiveIntensity: .6, transparent: true, opacity: .3 });
    for(var i=-1;i<=1;i+=2){ var d=new THREE.Mesh(new THREE.BoxGeometry(.06,.06,400),divMat); d.position.set(i*2.5,.04,-100); group.add(d); }
    return group;
}
function createSkybox(config) {
    var count=500, geo=new THREE.BufferGeometry(), pos=new Float32Array(count*3), col=new Float32Array(count*3);
    for(var i=0;i<count;i++){ pos[i*3]=(Math.random()-.5)*150; pos[i*3+1]=Math.random()*70+5; pos[i*3+2]=-Math.random()*200+10; var c=new THREE.Color().setHSL(Math.random(),.8,.8); col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b; }
    geo.setAttribute('position', new THREE.BufferAttribute(pos,3)); geo.setAttribute('color', new THREE.BufferAttribute(col,3));
    var mat=new THREE.PointsMaterial({size:.35,transparent:true,opacity:.7,vertexColors:true,blending:THREE.AdditiveBlending});
    var stars=new THREE.Points(geo,mat);
    return { stars:stars, update:function(dt){ var p=stars.geometry.attributes.position.array; for(var i=0;i<count;i++){p[i*3+1]+=dt*.3;if(p[i*3+1]>75)p[i*3+1]=5;} stars.geometry.attributes.position.needsUpdate=true; } };
}
function createDayNightCycle(scene, config) {
    var time=0;
    var sun=new THREE.DirectionalLight(0xffffff,1.2); sun.position.set(5,10,5); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left=-15; sun.shadow.camera.right=15; sun.shadow.camera.top=15; sun.shadow.camera.bottom=-15; scene.add(sun);
    var amb=new THREE.AmbientLight(0x404060,.6); scene.add(amb);
    var hemi=new THREE.HemisphereLight(0x00c8ff, 0x0a0a15, .3); scene.add(hemi);
    return { sunLight:sun, ambient:amb, hemi:hemi, update:function(dt){
        time+=dt; var a=(time/60)*Math.PI*2; var sh=Math.sin(a);
        sun.position.x=Math.cos(a)*10; sun.position.y=Math.max(2,sh*15);
        var di=Math.max(.3,sh); sun.intensity=di*1.2;
        var sl=(sh+1)/2; scene.background=new THREE.Color(0x050510).lerp(new THREE.Color(0x1a1a3e),sl);
        scene.fog.color.copy(scene.background);
        hemi.intensity=.2+sl*.3;
    }};
}
function createCity(scene) {
    var group = new THREE.Group();
    var buildingCount = 30;
    for (var i = 0; i < buildingCount; i++) {
        var side = i % 2 === 0 ? -1 : 1;
        var w = 4 + Math.random() * 5;
        var h = 8 + Math.random() * 25;
        var d = 4 + Math.random() * 5;
        var geo = new THREE.BoxGeometry(w, h, d);
        var mat = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(.6 + Math.random()*.2, .3, .08 + Math.random()*.12), metalness:.6, roughness:.4 });
        var building = new THREE.Mesh(geo, mat);
        building.position.set(side * (7 + Math.random() * 4), h/2, -i * 12 - 15);
        building.castShadow = true; building.receiveShadow = true;
        group.add(building);
        var winMat = new THREE.MeshStandardMaterial({ color: 0x00c8ff, emissive: 0x00c8ff, emissiveIntensity: Math.random() > .4 ? 1 : .15, transparent: true, opacity: .9 });
        for (var wy = 0; wy < h - 1; wy += 1.2) {
            for (var wx = 0; wx < w - .5; wx += .8) {
                if (Math.random() > .25) {
                    var win = new THREE.Mesh(new THREE.PlaneGeometry(.5, .7), winMat);
                    win.position.set(wx - w/2 + .5, wy - h/2 + .5, d/2 + .01);
                    building.add(win);
                }
            }
        }
    }
    for (var i = 0; i < 15; i++) {
        var side = i % 2 === 0 ? -1 : 1;
        var poleGeo = new THREE.CylinderGeometry(.06, .06, 5);
        var poleMat = new THREE.MeshStandardMaterial({ color: 0x444455, metalness: .9, roughness: .1 });
        var pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(side * 5.5, 2.5, -i * 20 - 8);
        group.add(pole);
        var lightGeo = new THREE.SphereGeometry(.2);
        var lightMat = new THREE.MeshStandardMaterial({ color: 0x00c8ff, emissive: 0x00c8ff, emissiveIntensity: 2 });
        var light = new THREE.Mesh(lightGeo, lightMat);
        light.position.set(side * 5.5, 5.1, -i * 20 - 8);
        group.add(light);
        var glow = new THREE.PointLight(0x00c8ff, .8, 10);
        glow.position.copy(light.position);
        group.add(glow);
    }
    scene.add(group);
    return { group: group, update: function(dt, gameSpeed, pZ) {
        group.children.forEach(function(child) {
            if (child.position.z > pZ + 40) {
                child.position.z -= 360;
                if (child.position.x > 6 || child.position.x < -6) {
                    child.position.x = (child.position.x > 0 ? 1 : -1) * (7 + Math.random() * 4);
                    child.position.y = child.geometry.parameters.height / 2;
                }
            }
        });
    }};
}
function createWeather(scene, config) {
    var count = 400, geo = new THREE.BufferGeometry(), pos = new Float32Array(count*3);
    for(var i=0;i<count;i++){ pos[i*3]=(Math.random()-.5)*50; pos[i*3+1]=Math.random()*35; pos[i*3+2]=(Math.random()-.5)*80-10; }
    geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
    var mat = new THREE.PointsMaterial({ color: 0x8888ff, size: .1, transparent: true, opacity: .5 });
    var rain = new THREE.Points(geo, mat); rain.visible = false; scene.add(rain);
    var la=false, lt=0;
    return { rain:rain, setWeather:function(t){ rain.visible=(t==='rain'||t==='storm'); },
        update:function(dt,storm){ if(rain.visible){var p=rain.geometry.attributes.position.array;for(var i=0;i<count;i++){p[i*3+1]-=dt*30;if(p[i*3+1]<0){p[i*3+1]=35;p[i*3]=(Math.random()-.5)*50;}}rain.geometry.attributes.position.needsUpdate=true;} if(storm){lt-=dt;if(lt<=0){lt=3+Math.random()*5;la=true;setTimeout(function(){la=false;},150);}} },
        isLightning:function(){ return la; } };
}
