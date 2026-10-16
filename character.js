function createCharacter(config) {
    var group = new THREE.Group(), char = config.character;
    var skinMat = new THREE.MeshStandardMaterial({ color: 0xffcc99, roughness: .8 });
    var bodyMat = new THREE.MeshStandardMaterial({ color: char.bodyColor, metalness: .4, roughness: .3, emissive: char.bodyColor, emissiveIntensity: .3 });
    var accentMat = new THREE.MeshStandardMaterial({ color: char.accentColor, metalness: .5, roughness: .2, emissive: char.accentColor, emissiveIntensity: .6 });
    var hairMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: .9 });
    var shoeMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: .6, roughness: .3, emissive: char.accentColor, emissiveIntensity: .3 });

    var headGroup = new THREE.Group(); headGroup.position.y = 1.85;
    var skull = new THREE.Mesh(new THREE.SphereGeometry(.22,16,16), skinMat); skull.scale.set(1,1.15,1.05); skull.castShadow = true; headGroup.add(skull);
    var hairTop = new THREE.Mesh(new THREE.SphereGeometry(.235,16,16,0,Math.PI*2,0,Math.PI*.55), hairMat); hairTop.position.y=.03; hairTop.name='hairTop'; headGroup.add(hairTop);
    var hairBack = new THREE.Mesh(new THREE.SphereGeometry(.225,12,12,0,Math.PI*2,Math.PI*.3,Math.PI*.5), hairMat); hairBack.position.set(0,.02,-.03); hairBack.name='hairBack'; headGroup.add(hairBack);
    var eyeMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    var le = new THREE.Mesh(new THREE.SphereGeometry(.035),eyeMat); le.position.set(-.08,.02,.19); headGroup.add(le);
    var re = new THREE.Mesh(new THREE.SphereGeometry(.035),eyeMat); re.position.set(.08,.02,.19); headGroup.add(re);
    var mouth = new THREE.Mesh(new THREE.BoxGeometry(.06,.01,.01), new THREE.MeshStandardMaterial({color:0xcc6644})); mouth.position.set(0,-.1,.2); headGroup.add(mouth);
    var visor = new THREE.Mesh(new THREE.TorusGeometry(.21,.015,8,24,Math.PI), new THREE.MeshStandardMaterial({color:char.visorColor,emissive:char.visorColor,emissiveIntensity:.5})); visor.position.set(0,.06,.02); visor.rotation.x=-.3; headGroup.add(visor);
    group.add(headGroup);
    var neck = new THREE.Mesh(new THREE.CylinderGeometry(.06,.07,.1),skinMat); neck.position.y=1.6; group.add(neck);

    var torsoGroup = new THREE.Group(); torsoGroup.position.y=1.15;
    var chest = new THREE.Mesh(new THREE.CylinderGeometry(.18,.15,.5,12),bodyMat); chest.position.y=.2; chest.castShadow=true; torsoGroup.add(chest);
    var core = new THREE.Mesh(new THREE.SphereGeometry(.15),accentMat); core.position.set(0,.35,.26); torsoGroup.add(core);
    var stripe = new THREE.Mesh(new THREE.BoxGeometry(.82,.12,.52),accentMat); stripe.position.y=.55; torsoGroup.add(stripe);
    var shGeo = new THREE.SphereGeometry(.09), ls = new THREE.Mesh(shGeo,bodyMat); ls.position.set(-.2,.4,0); torsoGroup.add(ls);
    var rs = new THREE.Mesh(shGeo,bodyMat); rs.position.set(.2,.4,0); torsoGroup.add(rs);
    var emblem = new THREE.Mesh(new THREE.CircleGeometry(.06), new THREE.MeshStandardMaterial({color:char.accentColor,emissive:char.accentColor,emissiveIntensity:.8,side:THREE.DoubleSide})); emblem.position.set(0,.25,.16); torsoGroup.add(emblem);
    var belt = new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.06,12),accentMat); belt.position.y=-.05; torsoGroup.add(belt);
    group.add(torsoGroup);

    function createArm(side) {
        var arm = new THREE.Group(); arm.position.set(side*.25,.35,0);
        var ua = new THREE.Mesh(new THREE.CylinderGeometry(.05,.045,.3,8),bodyMat); ua.position.y=-.15; ua.castShadow=true; arm.add(ua);
        var elbow = new THREE.Mesh(new THREE.SphereGeometry(.05),skinMat); elbow.position.y=-.3; arm.add(elbow);
        var fa = new THREE.Mesh(new THREE.CylinderGeometry(.04,.035,.25,8),skinMat); fa.position.y=-.42; fa.castShadow=true; arm.add(fa);
        var wb = new THREE.Mesh(new THREE.CylinderGeometry(.042,.042,.04,8),accentMat); wb.position.y=-.52; arm.add(wb);
        var hand = new THREE.Mesh(new THREE.SphereGeometry(.045),skinMat); hand.scale.set(.8,1.2,.8); hand.position.y=-.6; arm.add(hand);
        return arm;
    }
    var leftArm = createArm(-1); torsoGroup.add(leftArm);
    var rightArm = createArm(1); torsoGroup.add(rightArm);

    function createLeg(side) {
        var leg = new THREE.Group(); leg.position.set(side*.1,-.05,0);
        var ul = new THREE.Mesh(new THREE.CylinderGeometry(.07,.06,.35,8),bodyMat); ul.position.y=-.18; ul.castShadow=true; leg.add(ul);
        var knee = new THREE.Mesh(new THREE.SphereGeometry(.06),skinMat); knee.position.y=-.36; leg.add(knee);
        var ll = new THREE.Mesh(new THREE.CylinderGeometry(.055,.05,.3,8),bodyMat); ll.position.y=-.52; ll.castShadow=true; leg.add(ll);
        var ab = new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,.03,8),accentMat); ab.position.y=-.66; leg.add(ab);
        var shoe = new THREE.Mesh(new THREE.BoxGeometry(.1,.07,.2),shoeMat); shoe.position.set(0,-.72,.04); shoe.castShadow=true; leg.add(shoe);
        var sole = new THREE.Mesh(new THREE.BoxGeometry(.1,.02,.2),new THREE.MeshStandardMaterial({color:char.accentColor,emissive:char.accentColor,emissiveIntensity:.6})); sole.position.set(0,-.75,.04); leg.add(sole);
        return leg;
    }
    var leftLeg = createLeg(-1); torsoGroup.add(leftLeg);
    var rightLeg = createLeg(1); torsoGroup.add(rightLeg);

    var shieldMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, transparent: true, opacity: .2, emissive: 0x00ff88, emissiveIntensity: .5, side: THREE.DoubleSide });
    var shield = new THREE.Mesh(new THREE.SphereGeometry(1,20,20), shieldMat); shield.position.y=1; shield.visible=false; group.add(shield);
    group.scale.setScalar(char.scale);
    var animTime=0, isSliding=false, isJumping=false, shieldActive=false;

    function applyStartNgStyle(style) {
        if (!style) return;
        if (style.primaryColor) { var c=new THREE.Color(style.primaryColor); bodyMat.color=c; bodyMat.emissive=c; }
        if (style.secondaryColor) { var c2=new THREE.Color(style.secondaryColor); accentMat.color=c2; accentMat.emissive=c2; shoeMat.emissive=c2; }
        if (style.skinColor) skinMat.color = new THREE.Color(style.skinColor);
        if (style.hairColor) hairMat.color = new THREE.Color(style.hairColor);
        var top=headGroup.getObjectByName('hairTop'), back=headGroup.getObjectByName('hairBack');
        if (top&&back) { var ht=style.hair||'short'; if(ht==='bald'){top.visible=false;back.visible=false;}else{top.visible=true;back.visible=true;} }
    }

    return {
        group:group, leftArm:leftArm, rightArm:rightArm, leftLeg:leftLeg, rightLeg:rightLeg, headGroup:headGroup, shield:shield, applyStartNgStyle:applyStartNgStyle,
        update:function(dt,speed){
            animTime+=dt*(speed*.5);
            if(!isJumping&&!isSliding){
                var sw=Math.sin(animTime*5)*.6;
                leftArm.rotation.x=sw; rightArm.rotation.x=-sw;
                torsoGroup.rotation.y=Math.sin(animTime*5)*.08;
                torsoGroup.rotation.x=Math.sin(animTime*5)*.03;
                leftLeg.rotation.x=-sw*.8; rightLeg.rotation.x=sw*.8;
                torsoGroup.position.y=1.15+Math.abs(Math.sin(animTime*5))*.05;
                headGroup.rotation.x=Math.sin(animTime*5)*.04;
                headGroup.rotation.y=Math.sin(animTime*3)*.02;
            }
            if(core) core.scale.setScalar(1+Math.sin(animTime*5)*.2);
            if(shieldActive){shieldMat.opacity=.15+Math.sin(animTime*8)*.08; shield.rotation.y+=dt*1.5;}
        },
        setSliding:function(v){
            isSliding=v;
            if(v){torsoGroup.position.y=.7;group.scale.y=char.scale*.65;group.position.y=-.25*char.scale;leftArm.rotation.x=-1.5;rightArm.rotation.x=-1.5;leftLeg.rotation.x=1.2;rightLeg.rotation.x=1.2;headGroup.rotation.x=.4;}
            else{torsoGroup.position.y=1.15;group.scale.y=char.scale;group.position.y=0;leftArm.rotation.x=0;rightArm.rotation.x=0;leftLeg.rotation.x=0;rightLeg.rotation.x=0;headGroup.rotation.x=0;}
        },
        setJumping:function(v){isJumping=v;},
        setShield:function(v){shieldActive=v;shield.visible=v;},
        reset:function(){group.position.set(0,0,0);group.scale.set(char.scale,char.scale,char.scale);group.rotation.set(0,0,0);torsoGroup.position.y=1.15;torsoGroup.rotation.set(0,0,0);leftArm.rotation.x=0;rightArm.rotation.x=0;leftLeg.rotation.x=0;rightLeg.rotation.x=0;headGroup.rotation.x=0;isSliding=false;isJumping=false;shieldActive=false;shield.visible=false;animTime=0;}
    };
}
