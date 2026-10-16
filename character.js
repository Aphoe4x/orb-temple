function createCharacter(config) {
    var group = new THREE.Group(), char = config.character;
    var skinMat = new THREE.MeshStandardMaterial({ color: 0xffcc99, roughness: .7, metalness: .1 });
    var bodyMat = new THREE.MeshStandardMaterial({ color: char.bodyColor, metalness: .5, roughness: .2, emissive: char.bodyColor, emissiveIntensity: .4 });
    var accentMat = new THREE.MeshStandardMaterial({ color: char.accentColor, metalness: .6, roughness: .15, emissive: char.accentColor, emissiveIntensity: .8 });
    var hairMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: .85 });
    var shoeMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: .7, roughness: .2, emissive: char.accentColor, emissiveIntensity: .4 });

    var headGroup = new THREE.Group(); headGroup.position.y = 1.9;
    var skull = new THREE.Mesh(new THREE.SphereGeometry(.22,20,20), skinMat); skull.scale.set(1,1.15,1.05); skull.castShadow = true; headGroup.add(skull);
    var hairTop = new THREE.Mesh(new THREE.SphereGeometry(.24,20,20,0,Math.PI*2,0,Math.PI*.55), hairMat); hairTop.position.y=.03; hairTop.name='hairTop'; headGroup.add(hairTop);
    var hairBack = new THREE.Mesh(new THREE.SphereGeometry(.23,16,16,0,Math.PI*2,Math.PI*.3,Math.PI*.5), hairMat); hairBack.position.set(0,.02,-.03); hairBack.name='hairBack'; headGroup.add(hairBack);
    var eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: .1 });
    var le = new THREE.Mesh(new THREE.SphereGeometry(.04),eyeMat); le.position.set(-.09,.03,.2); headGroup.add(le);
    var re = new THREE.Mesh(new THREE.SphereGeometry(.04),eyeMat); re.position.set(.09,.03,.2); headGroup.add(re);
    var mouth = new THREE.Mesh(new THREE.BoxGeometry(.07,.015,.015), new THREE.MeshStandardMaterial({color:0xcc6644})); mouth.position.set(0,-.1,.21); headGroup.add(mouth);
    var visor = new THREE.Mesh(new THREE.TorusGeometry(.22,.018,10,28,Math.PI), new THREE.MeshStandardMaterial({color:char.visorColor,emissive:char.visorColor,emissiveIntensity:.6,metalness:.8,roughness:.1})); visor.position.set(0,.07,.02); visor.rotation.x=-.3; headGroup.add(visor);
    group.add(headGroup);
    var neck = new THREE.Mesh(new THREE.CylinderGeometry(.06,.075,.12),skinMat); neck.position.y=1.65; group.add(neck);

    var torsoGroup = new THREE.Group(); torsoGroup.position.y=1.2;
    var chest = new THREE.Mesh(new THREE.CylinderGeometry(.19,.16,.55,14),bodyMat); chest.position.y=.2; chest.castShadow=true; torsoGroup.add(chest);
    var core = new THREE.Mesh(new THREE.SphereGeometry(.16),accentMat); core.position.set(0,.4,.28); torsoGroup.add(core);
    var stripe = new THREE.Mesh(new THREE.BoxGeometry(.85,.14,.55),accentMat); stripe.position.y=.6; torsoGroup.add(stripe);
    var shGeo = new THREE.SphereGeometry(.1), ls = new THREE.Mesh(shGeo,bodyMat); ls.position.set(-.21,.42,0); torsoGroup.add(ls);
    var rs = new THREE.Mesh(shGeo,bodyMat); rs.position.set(.21,.42,0); torsoGroup.add(rs);
    var emblem = new THREE.Mesh(new THREE.CircleGeometry(.07), new THREE.MeshStandardMaterial({color:char.accentColor,emissive:char.accentColor,emissiveIntensity:1,side:THREE.DoubleSide})); emblem.position.set(0,.28,.18); torsoGroup.add(emblem);
    var belt = new THREE.Mesh(new THREE.CylinderGeometry(.17,.17,.07,14),accentMat); belt.position.y=-.05; torsoGroup.add(belt);
    group.add(torsoGroup);

    function createArm(side) {
        var arm = new THREE.Group(); arm.position.set(side*.26,.38,0);
        var ua = new THREE.Mesh(new THREE.CylinderGeometry(.055,.05,.32,10),bodyMat); ua.position.y=-.16; ua.castShadow=true; arm.add(ua);
        var elbow = new THREE.Mesh(new THREE.SphereGeometry(.055),skinMat); elbow.position.y=-.32; arm.add(elbow);
        var fa = new THREE.Mesh(new THREE.CylinderGeometry(.045,.04,.28,10),skinMat); fa.position.y=-.45; fa.castShadow=true; arm.add(fa);
        var wb = new THREE.Mesh(new THREE.CylinderGeometry(.048,.048,.05,10),accentMat); wb.position.y=-.55; arm.add(wb);
        var hand = new THREE.Mesh(new THREE.SphereGeometry(.05),skinMat); hand.scale.set(.85,1.25,.85); hand.position.y=-.63; arm.add(hand);
        return arm;
    }
    var leftArm = createArm(-1); torsoGroup.add(leftArm);
    var rightArm = createArm(1); torsoGroup.add(rightArm);

    function createLeg(side) {
        var leg = new THREE.Group(); leg.position.set(side*.11,-.06,0);
        var ul = new THREE.Mesh(new THREE.CylinderGeometry(.075,.065,.38,10),bodyMat); ul.position.y=-.19; ul.castShadow=true; leg.add(ul);
        var knee = new THREE.Mesh(new THREE.SphereGeometry(.065),skinMat); knee.position.y=-.38; leg.add(knee);
        var ll = new THREE.Mesh(new THREE.CylinderGeometry(.06,.055,.32,10),bodyMat); ll.position.y=-.55; ll.castShadow=true; leg.add(ll);
        var ab = new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.04,10),accentMat); ab.position.y=-.7; leg.add(ab);
        var shoe = new THREE.Mesh(new THREE.BoxGeometry(.11,.08,.22),shoeMat); shoe.position.set(0,-.76,.05); shoe.castShadow=true; leg.add(shoe);
        var sole = new THREE.Mesh(new THREE.BoxGeometry(.11,.025,.22),new THREE.MeshStandardMaterial({color:char.accentColor,emissive:char.accentColor,emissiveIntensity:.8})); sole.position.set(0,-.79,.05); leg.add(sole);
        return leg;
    }
    var leftLeg = createLeg(-1); torsoGroup.add(leftLeg);
    var rightLeg = createLeg(1); torsoGroup.add(rightLeg);

    var shieldMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, transparent: true, opacity: .25, emissive: 0x00ff88, emissiveIntensity: .6, side: THREE.DoubleSide });
    var shield = new THREE.Mesh(new THREE.SphereGeometry(1.1,24,24), shieldMat); shield.position.y=1; shield.visible=false; group.add(shield);
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
            animTime+=dt*(speed*.55);
            if(!isJumping&&!isSliding){
                var sw=Math.sin(animTime*5)*.7;
                leftArm.rotation.x=sw; rightArm.rotation.x=-sw;
                torsoGroup.rotation.y=Math.sin(animTime*5)*.1;
                torsoGroup.rotation.x=Math.sin(animTime*5)*.04;
                leftLeg.rotation.x=-sw*.9; rightLeg.rotation.x=sw*.9;
                torsoGroup.position.y=1.2+Math.abs(Math.sin(animTime*5))*.06;
                headGroup.rotation.x=Math.sin(animTime*5)*.05;
                headGroup.rotation.y=Math.sin(animTime*3)*.03;
            }
            core.scale.setScalar(1+Math.sin(animTime*5)*.25);
            if(shieldActive){shieldMat.opacity=.2+Math.sin(animTime*10)*.1; shield.rotation.y+=dt*2;}
        },
        setSliding:function(v){
            isSliding=v;
            if(v){torsoGroup.position.y=.75;group.scale.y=char.scale*.6;group.position.y=-.2*char.scale;leftArm.rotation.x=-1.6;rightArm.rotation.x=-1.6;leftLeg.rotation.x=1.3;rightLeg.rotation.x=1.3;headGroup.rotation.x=.5;}
            else{torsoGroup.position.y=1.2;group.scale.y=char.scale;group.position.y=0;leftArm.rotation.x=0;rightArm.rotation.x=0;leftLeg.rotation.x=0;rightLeg.rotation.x=0;headGroup.rotation.x=0;}
        },
        setJumping:function(v){isJumping=v;},
        setShield:function(v){shieldActive=v;shield.visible=v;},
        reset:function(){group.position.set(0,0,0);group.scale.set(char.scale,char.scale,char.scale);group.rotation.set(0,0,0);torsoGroup.position.y=1.2;torsoGroup.rotation.set(0,0,0);leftArm.rotation.x=0;rightArm.rotation.x=0;leftLeg.rotation.x=0;rightLeg.rotation.x=0;headGroup.rotation.x=0;isSliding=false;isJumping=false;shieldActive=false;shield.visible=false;animTime=0;}
    };
}
