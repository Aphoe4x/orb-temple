function createCharacter(config) {
    var group = new THREE.Group();
    var char = config.character;
    var skinMat = new THREE.MeshStandardMaterial({ color: 0xffcc99, metalness: 0, roughness: 0.8 });
    var bodyMat = new THREE.MeshStandardMaterial({ color: char.bodyColor, metalness: 0.3, roughness: 0.4, emissive: char.bodyColor, emissiveIntensity: char.emissiveIntensity * 0.3 });
    var accentMat = new THREE.MeshStandardMaterial({ color: char.accentColor, metalness: 0.5, roughness: 0.2, emissive: char.accentColor, emissiveIntensity: char.emissiveIntensity });
    var hairMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, metalness: 0, roughness: 0.9 });
    var visorMat = new THREE.MeshStandardMaterial({ color: char.visorColor, metalness: 0.7, roughness: 0.1, emissive: char.visorColor, emissiveIntensity: 0.5 });
    var shoeMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.6, roughness: 0.3, emissive: char.accentColor, emissiveIntensity: 0.3 });

    var headGroup = new THREE.Group(); headGroup.position.y = 1.85;
    var skull = new THREE.Mesh(new THREE.SphereGeometry(0.22,16,16), skinMat); skull.scale.set(1,1.15,1.05); skull.castShadow = true; headGroup.add(skull);
    var hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.235,16,16,0,Math.PI*2,0,Math.PI*0.55), hairMat); hairTop.position.y=0.03; hairTop.name='hairTop'; headGroup.add(hairTop);
    var hairBack = new THREE.Mesh(new THREE.SphereGeometry(0.225,12,12,0,Math.PI*2,Math.PI*0.3,Math.PI*0.5), hairMat); hairBack.position.set(0,0.02,-0.03); hairBack.name='hairBack'; headGroup.add(hairBack);
    var eyeMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.3, roughness: 0.2 });
    var le = new THREE.Mesh(new THREE.SphereGeometry(0.035),eyeMat); le.position.set(-0.08,0.02,0.19); headGroup.add(le);
    var re = new THREE.Mesh(new THREE.SphereGeometry(0.035),eyeMat); re.position.set(0.08,0.02,0.19); headGroup.add(re);
    var mouth = new THREE.Mesh(new THREE.BoxGeometry(0.06,0.01,0.01), new THREE.MeshStandardMaterial({color:0xcc6644})); mouth.position.set(0,-0.1,0.2); headGroup.add(mouth);
    var visor = new THREE.Mesh(new THREE.TorusGeometry(0.21,0.015,8,24,Math.PI), visorMat); visor.position.set(0,0.06,0.02); visor.rotation.x=-0.3; headGroup.add(visor);
    group.add(headGroup);

    var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.07,0.1),skinMat); neck.position.y=1.6; group.add(neck);

    var torsoGroup = new THREE.Group(); torsoGroup.position.y=1.15;
    var chest = new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.15,0.5,12),bodyMat); chest.position.y=0.2; chest.castShadow=true; torsoGroup.add(chest);
    var core = new THREE.Mesh(new THREE.SphereGeometry(0.15),accentMat); core.position.set(0,0.35,0.26); torsoGroup.add(core);
    var stripe = new THREE.Mesh(new THREE.BoxGeometry(0.82,0.12,0.52),accentMat); stripe.position.y=0.55; torsoGroup.add(stripe);
    var shGeo = new THREE.SphereGeometry(0.09);
    var ls = new THREE.Mesh(shGeo,bodyMat); ls.position.set(-0.2,0.4,0); torsoGroup.add(ls);
    var rs = new THREE.Mesh(shGeo,bodyMat); rs.position.set(0.2,0.4,0); torsoGroup.add(rs);
    var emblem = new THREE.Mesh(new THREE.CircleGeometry(0.06), new THREE.MeshStandardMaterial({color:char.accentColor,emissive:char.accentColor,emissiveIntensity:0.8,side:THREE.DoubleSide})); emblem.position.set(0,0.25,0.16); torsoGroup.add(emblem);
    var belt = new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,0.06,12),accentMat); belt.position.y=-0.05; torsoGroup.add(belt);
    group.add(torsoGroup);

    function createArm(side) {
        var arm = new THREE.Group(); arm.position.set(side*0.25,0.35,0);
        var ua = new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.045,0.3,8),bodyMat); ua.position.y=-0.15; ua.castShadow=true; arm.add(ua);
        var elbow = new THREE.Mesh(new THREE.SphereGeometry(0.05),skinMat); elbow.position.y=-0.3; arm.add(elbow);
        var fa = new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.035,0.25,8),skinMat); fa.position.y=-0.42; fa.castShadow=true; arm.add(fa);
        var wb = new THREE.Mesh(new THREE.CylinderGeometry(0.042,0.042,0.04,8),accentMat); wb.position.y=-0.52; arm.add(wb);
        var hand = new THREE.Mesh(new THREE.SphereGeometry(0.045),skinMat); hand.scale.set(0.8,1.2,0.8); hand.position.y=-0.6; arm.add(hand);
        return arm;
    }
    var leftArm = createArm(-1); torsoGroup.add(leftArm);
    var rightArm = createArm(1); torsoGroup.add(rightArm);

    function createLeg(side) {
        var leg = new THREE.Group(); leg.position.set(side*0.1,-0.05,0);
        var ul = new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.06,0.35,8),bodyMat); ul.position.y=-0.18; ul.castShadow=true; leg.add(ul);
        var knee = new THREE.Mesh(new THREE.SphereGeometry(0.06),skinMat); knee.position.y=-0.36; leg.add(knee);
        var ll = new THREE.Mesh(new THREE.CylinderGeometry(0.055,0.05,0.3,8),bodyMat); ll.position.y=-0.52; ll.castShadow=true; leg.add(ll);
        var ab = new THREE.Mesh(new THREE.CylinderGeometry(0.055,0.055,0.03,8),accentMat); ab.position.y=-0.66; leg.add(ab);
        var shoe = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.07,0.2),shoeMat); shoe.position.set(0,-0.72,0.04); shoe.castShadow=true; leg.add(shoe);
        var sole = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.02,0.2),new THREE.MeshStandardMaterial({color:char.accentColor,emissive:char.accentColor,emissiveIntensity:0.6})); sole.position.set(0,-0.75,0.04); leg.add(sole);
        return leg;
    }
    var leftLeg = createLeg(-1); torsoGroup.add(leftLeg);
    var rightLeg = createLeg(1); torsoGroup.add(rightLeg);

    var shieldMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, transparent: true, opacity: 0.2, emissive: 0x00ff88, emissiveIntensity: 0.5, side: THREE.DoubleSide });
    var shield = new THREE.Mesh(new THREE.SphereGeometry(1,20,20), shieldMat); shield.position.y=1; shield.visible=false; group.add(shield);

    group.scale.setScalar(char.scale);
    var animTime=0, isSliding=false, isJumping=false, shieldActive=false;

    function applyStartNgStyle(style) {
        if (!style) return;
        if (style.primaryColor) { var c=new THREE.Color(style.primaryColor); bodyMat.color=c; bodyMat.emissive=c; }
        if (style.secondaryColor) { var c2=new THREE.Color(style.secondaryColor); accentMat.color=c2; accentMat.emissive=c2; shoeMat.emissive=c2; }
        if (style.skinColor) { skinMat.color=new THREE.Color(style.skinColor); }
        if (style.hairColor) { hairMat.color=new THREE.Color(style.hairColor); }
        var top=headGroup.getObjectByName('hairTop'); var back=headGroup.getObjectByName('hairBack');
        if (top&&back) {
            var ht=style.hair||'short';
            if (ht==='bald'){top.visible=false;back.visible=false;} else {top.visible=true;back.visible=true;}
        }
    }

    return {
        group:group, leftArm:leftArm, rightArm:rightArm, leftLeg:leftLeg, rightLeg:rightLeg, headGroup:headGroup, shield:shield, applyStartNgStyle:applyStartNgStyle,
        update:function(dt,speed){animTime+=dt*(speed*0.4);if(!isJumping&&!isSliding){var sw=Math.sin(animTime*5)*0.6;leftArm.rotation.x=sw;rightArm.rotation.x=-sw;torsoGroup.rotation.y=Math.sin(animTime*5)*0.05;leftLeg.rotation.x=-sw*0.8;rightLeg.rotation.x=sw*0.8;torsoGroup.position.y=1.15+Math.abs(Math.sin(animTime*5))*0.04;}if(core)core.scale.setScalar(1+Math.sin(animTime*5)*0.2);if(shieldActive){shieldMat.opacity=0.15+Math.sin(animTime*8)*0.08;shield.rotation.y+=dt*1.5;}},
        setSliding:function(v){isSliding=v;if(v){torsoGroup.position.y=0.7;group.scale.y=char.scale*0.65;group.position.y=-0.25*char.scale;leftArm.rotation.x=-1.5;rightArm.rotation.x=-1.5;leftLeg.rotation.x=1.2;rightLeg.rotation.x=1.2;}else{torsoGroup.position.y=1.15;group.scale.y=char.scale;group.position.y=0;leftArm.rotation.x=0;rightArm.rotation.x=0;leftLeg.rotation.x=0;rightLeg.rotation.x=0;}},
        setJumping:function(v){isJumping=v;},
        setShield:function(v){shieldActive=v;shield.visible=v;},
        reset:function(){group.position.set(0,0,0);group.scale.set(char.scale,char.scale,char.scale);group.rotation.set(0,0,0);torsoGroup.position.y=1.15;torsoGroup.rotation.set(0,0,0);leftArm.rotation.x=0;rightArm.rotation.x=0;leftLeg.rotation.x=0;rightLeg.rotation.x=0;isSliding=false;isJumping=false;shieldActive=false;shield.visible=false;animTime=0;}
    };
}
