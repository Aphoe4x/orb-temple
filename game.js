(function() {
var STATE={MENU:'menu',PLAYING:'playing',PAUSED:'paused',GAME_OVER:'gameOver'};
var gameState=STATE.MENU, score=0, coins=0, distance=0;
var highScore=parseInt(localStorage.getItem('neonRunnerHighScore'))||0;
var gameSpeed=CONFIG.gameplay.baseSpeed, targetSpeed=CONFIG.gameplay.baseSpeed;
var spawnTimer=0, coinTimer=0, powerupTimer=0;
var nextBoss=CONFIG.boss.spawnDistance, bossActive=false, boss=null, shakeAmt=0;
var activePU=null, puTimer=0, shieldOn=false, magnetOn=false, dblScoreOn=false, slowMoOn=false;
var combo=0, comboT=0, comboMult=1;
var lane=0, jumping=false, sliding=false, jumpVel=0, slideT=0, pY=0, pZ=0, scrollZ=0;
var startNgPlayer=null;

// THREE SETUP
var container=document.getElementById('game-container');
var scene=new THREE.Scene();
scene.background=new THREE.Color(CONFIG.world.skyColor);
scene.fog=new THREE.FogExp2(CONFIG.world.fogColor,CONFIG.world.fogDensity);
var camera=new THREE.PerspectiveCamera(CONFIG.camera.fov,window.innerWidth/window.innerHeight,.1,200);
camera.position.set(CONFIG.camera.position.x,CONFIG.camera.position.y,CONFIG.camera.position.z);
var renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.2;
container.appendChild(renderer.domElement);

// LIGHTS
scene.add(new THREE.AmbientLight(0x404060,.5));
var dirLight=new THREE.DirectionalLight(0xffffff,1);
dirLight.position.set(5,10,5); dirLight.castShadow=true;
dirLight.shadow.mapSize.width=1024; dirLight.shadow.mapSize.height=1024;
dirLight.shadow.camera.left=-10; dirLight.shadow.camera.right=10; dirLight.shadow.camera.top=10; dirLight.shadow.camera.bottom=-10;
scene.add(dirLight);
var pLight=new THREE.PointLight(CONFIG.character.bodyColor,2,10); pLight.position.set(0,3,2); scene.add(pLight);
var bLight=new THREE.PointLight(CONFIG.character.accentColor,1.5,35); bLight.position.set(0,5,-15); scene.add(bLight);

var audio=createAudio(CONFIG);
var character=createCharacter(CONFIG); scene.add(character.group);
var trail=createTrail(CONFIG); scene.add(trail.points);
var ground=createGround(CONFIG); scene.add(ground);
var skybox=createSkybox(CONFIG); scene.add(skybox.stars);
var dayNight=createDayNightCycle(scene,CONFIG);
var obstacles=[],collectibles=[],powerups=[],explosions=[];

// UI
document.getElementById('btn-start').addEventListener('click',function(){audio.resume();startGame();});
document.getElementById('btn-restart').addEventListener('click',function(){audio.resume();startGame();});
document.getElementById('btn-resume').addEventListener('click',resumeGame);

// INPUT
document.addEventListener('keydown',function(e){
    if(gameState===STATE.MENU&&e.code==='Enter'){audio.resume();startGame();}
    else if(gameState===STATE.GAME_OVER&&e.code==='Enter'){audio.resume();startGame();}
    else if(gameState===STATE.PLAYING){
        if(e.code==='KeyA'||e.code==='ArrowLeft')moveLeft();
        if(e.code==='KeyD'||e.code==='ArrowRight')moveRight();
        if(e.code==='KeyW'||e.code==='ArrowUp'||e.code==='Space')jump();
        if(e.code==='KeyS'||e.code==='ArrowDown')slide();
        if(e.code==='Escape')pauseGame();
    } else if(gameState===STATE.PAUSED&&e.code==='Escape')resumeGame();
});
function moveLeft(){if(lane>-1){lane--;character.group.rotation.z=.15;}}
function moveRight(){if(lane<1){lane++;character.group.rotation.z=-.15;}}
function jump(){if(!jumping&&!sliding){jumping=true;jumpVel=CONFIG.gameplay.jumpForce;character.setJumping(true);audio.playJump();}}
function slide(){if(!sliding&&!jumping){sliding=true;slideT=CONFIG.gameplay.slideDuration;character.setSliding(true);audio.playSlide();}}

// Mobile joystick
var isMobile=/Android|iPhone|iPad/i.test(navigator.userAgent);
if(isMobile)document.getElementById('mobile-controls').classList.remove('hidden');
var joystickZone=document.getElementById('joystick-zone');
if(joystickZone){
    var knob=document.getElementById('joystick-knob'), base=document.getElementById('joystick-base');
    var joyActive=false, joyStartX=0;
    joystickZone.addEventListener('touchstart',function(e){joyActive=true;joyStartX=e.touches[0].clientX;knob.style.transform='translateX(-10px)';},{passive:true});
    joystickZone.addEventListener('touchmove',function(e){if(!joyActive)return;var dx=e.touches[0].clientX-joyStartX;if(dx>30)moveRight();if(dx<-30)moveLeft();knob.style.transform='translateX('+(dx>20?20:dx<-20?-20:dx)+'px)';},{passive:true});
    joystickZone.addEventListener('touchend',function(){joyActive=false;knob.style.transform='';},{passive:true});
}
var btnJump=document.getElementById('btn-jump');
if(btnJump)btnJump.addEventListener('touchstart',function(e){e.preventDefault();jump();},{passive:false});
var btnSlide=document.getElementById('btn-slide');
if(btnSlide)btnSlide.addEventListener('touchstart',function(e){e.preventDefault();slide();},{passive:false});

// START.NG
function initPlayer(){initStartNg().then(function(p){startNgPlayer=p;if(p){character.applyStartNgStyle(p.style);var pc=document.getElementById('player-card');if(pc)pc.hidden=false;var pn=document.getElementById('player-name');if(pn)pn.textContent=p.name||'Player';var pa=document.getElementById('player-account');if(pa)pa.textContent=p.account?'@'+p.account:'Guest';}});}
document.addEventListener('visibilitychange',function(){if(!document.hidden)initPlayer();});

// GAME FUNCTIONS
function startGame(){
    score=0;coins=0;distance=0;gameSpeed=CONFIG.gameplay.baseSpeed;targetSpeed=CONFIG.gameplay.baseSpeed;
    spawnTimer=0;coinTimer=0;powerupTimer=0;nextBoss=CONFIG.boss.spawnDistance;
    bossActive=false;boss=null;shakeAmt=0;activePU=null;puTimer=0;
    shieldOn=false;magnetOn=false;dblScoreOn=false;slowMoOn=false;combo=0;comboT=0;comboMult=1;
    lane=0;jumping=false;sliding=false;jumpVel=0;pY=0;pZ=0;
    obstacles.forEach(function(o){o.dispose(o.mesh);});collectibles.forEach(function(c){c.dispose(c.mesh);});
    powerups.forEach(function(p){p.dispose(p.mesh);});
    if(boss){boss.dispose();boss=null;}
    obstacles=[];collectibles=[];powerups=[];explosions=[];
    character.reset();character.setShield(false);
    if(startNgPlayer)character.applyStartNgStyle(startNgPlayer.style);
    document.getElementById('score').textContent='0';document.getElementById('coins').textContent='0';
    document.getElementById('high-score').textContent=highScore;
    document.getElementById('speed-fill').style.width='0%';
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('gameover-screen').classList.add('hidden');
    document.getElementById('pause-screen').classList.add('hidden');
    gameState=STATE.PLAYING;audio.startMusic();
}
function pauseGame(){gameState=STATE.PAUSED;document.getElementById('pause-screen').classList.remove('hidden');}
function resumeGame(){gameState=STATE.PLAYING;document.getElementById('pause-screen').classList.add('hidden');}
function gameOver(){
    gameState=STATE.GAME_OVER;audio.playCrash();audio.stopMusic();
    explosions.push(createExplosion(scene,CONFIG.character.bodyColor));shakeAmt=.5;
    var nh=score>highScore;if(nh){highScore=score;localStorage.setItem('neonRunnerHighScore',highScore);}
    document.getElementById('final-score').textContent=score;
    document.getElementById('final-coins').textContent=coins;
    document.getElementById('final-distance').textContent=Math.floor(distance)+'m';
    document.getElementById('new-highscore').classList.toggle('hidden',!nh);
    document.getElementById('gameover-screen').classList.remove('hidden');
    if(startNgPlayer)saveStartNgScore({score:score,distance:Math.floor(distance),coins:coins});
}

// SPAWN PATTERNS — guaranteed passable
var patternZ = -80;
function spawnPattern() {
    var types = CONFIG.obstacles.types;
    var safeLane = Math.floor(Math.random()*3)-1;
    var z = pZ - 70;
    var numObs = 1+Math.floor(Math.random()*2);
    for (var i=0;i<numObs;i++) {
        var type = types[Math.floor(Math.random()*types.length)];
        var obs = createObstacle(type, CONFIG);
        var obsLane = Math.floor(Math.random()*3)-1;
        if (obsLane === safeLane) obsLane = (obsLane+1)%3-1;
        obs.mesh.position.x = obsLane*CONFIG.gameplay.laneWidth;
        obs.mesh.position.z = z - i*8;
        scene.add(obs.mesh); obstacles.push(obs);
    }
    // Coin trail in safe lane
    for (var j=0;j<5;j++) {
        var coin = createCoin(CONFIG);
        coin.mesh.position.x = safeLane*CONFIG.gameplay.laneWidth;
        coin.mesh.position.z = z - j*2;
        scene.add(coin.mesh); collectibles.push(coin);
    }
}

function activatePU(type){
    activePU=type;puTimer=CONFIG.powerups.duration;
    if(type==='shield'){shieldOn=true;character.setShield(true);}
    if(type==='magnet')magnetOn=true; if(type==='doubleScore')dblScoreOn=true; if(type==='slowMo')slowMoOn=true;
    document.getElementById('powerup-display').textContent=type.toUpperCase()+' ACTIVE';
    document.getElementById('powerup-container').classList.remove('hidden');audio.playPowerup();
}
function deactivatePU(){
    if(activePU==='shield'){shieldOn=false;character.setShield(false);}
    magnetOn=false;dblScoreOn=false;slowMoOn=false;activePU=null;
    document.getElementById('powerup-container').classList.add('hidden');
}

// COLLISION
function hit(px,py,pz,pH,obs){
    var m=obs.mesh,oHW=obs.width/2+.3,oHH=obs.height/2,pHW=.35,pHH=(sliding?.35:pH/2);
    return Math.abs(px-m.position.x)<(pHW+oHW)&&Math.abs(py+(sliding?.35:pH/2)-m.position.y)<(pHH+oHH)&&Math.abs(pz-m.position.z)<1.2;
}
function hitCoin(px,py,pz,coin){
    var c=coin.mesh.position,dx=Math.abs(px-c.x),dy=Math.abs((py+1)-c.y),dz=Math.abs(pz-c.z);
    if(magnetOn)return dx<5&&dy<5&&dz<5;return dx<1&&dy<1.5&&dz<1.2;
}

// MAIN LOOP
var clock=new THREE.Clock();
function animate(){
    requestAnimationFrame(animate);
    var dt=Math.min(clock.getDelta(),.05);
    if(slowMoOn)dt*=.4;

    if(gameState===STATE.PLAYING){
        // Speed
        gameSpeed+=(targetSpeed-gameSpeed)*.02;
        targetSpeed=Math.min(CONFIG.gameplay.maxSpeed,targetSpeed+CONFIG.gameplay.speedIncrement);
        if(activePU==='slowMo')targetSpeed*=.6;

        // Move forward
        pZ-=gameSpeed*dt; distance+=gameSpeed*dt;
        scrollZ+=gameSpeed*dt;
        // Scroll ground
        ground.position.z=scrollZ%2;
        character.group.position.z=pZ;

        // FOV speed effect
        var fovT=(gameSpeed-CONFIG.gameplay.baseSpeed)/(CONFIG.gameplay.maxSpeed-CONFIG.gameplay.baseSpeed);
        camera.fov=CONFIG.camera.fov+fovT*(CONFIG.camera.fovMax-CONFIG.camera.fov);
        camera.updateProjectionMatrix();

        // Lane movement
        var tx=lane*CONFIG.gameplay.laneWidth;
        character.group.position.x+=(tx-character.group.position.x)*10*dt;
        character.group.rotation.z+=(0-character.group.rotation.z)*8*dt;

        // Jump
        if(jumping){jumpVel+=CONFIG.gameplay.gravity*dt;pY+=jumpVel*dt;if(pY<=0){pY=0;jumping=false;jumpVel=0;character.setJumping(false);}}
        character.group.position.y=pY;

        // Slide
        if(sliding){slideT-=dt;if(slideT<=0){sliding=false;character.setSliding(false);}}

        character.update(dt,gameSpeed);
        pLight.position.set(character.group.position.x,3,pZ+2);
        if(CONFIG.character.hasTrail&&!sliding)trail.emit(character.group.position.x,pY+.5,pZ-.5);
        trail.update(dt);

        // Spawn patterns
        spawnTimer+=dt;
        if(spawnTimer>=CONFIG.obstacles.spawnRate){spawnTimer=0;spawnPattern();}
        coinTimer+=dt;
        if(coinTimer>=3){coinTimer=0;if(Math.random()<CONFIG.powerups.spawnChance)spawnPowerup();}

        // Day/night
        dayNight.update(dt);

        // Boss
        if(distance>=nextBoss&&!bossActive){bossActive=true;boss=createBoss(CONFIG);boss.group.position.z=pZ-40;scene.add(boss.group);document.getElementById('boss-health-container').classList.remove('hidden');document.getElementById('boss-health-fill').style.width='100%';audio.playBossAlert();}

        var pH=2*CONFIG.character.scale;
        // Obstacles
        for(var i=obstacles.length-1;i>=0;i--){
            var obs=obstacles[i];obs.update(dt,gameSpeed);
            if(!sliding||obs.type!=='tall'){if(hit(character.group.position.x,pY,pZ,pH,obs)){if(shieldOn){shieldOn=false;character.setShield(false);obs.dispose(obs.mesh);obstacles.splice(i,1);shakeAmt=.2;audio.playCrash();continue;}gameOver();return;}}
            if(obs.mesh.position.z>pZ+15){scene.remove(obs.mesh);obstacles.splice(i,1);}
        }
        if(bossActive&&boss){document.getElementById('boss-health-fill').style.width=(boss.health/boss.maxHealth*100)+'%';boss.update(dt);}

        // Coins
        for(var i=collectibles.length-1;i>=0;i--){
            var c=collectibles[i];
            if(hitCoin(character.group.position.x,pY,pZ,c)){combo++;comboT=CONFIG.combo.window;comboMult=Math.min(CONFIG.combo.maxMultiplier,1+Math.floor(combo/3));coins++;score+=CONFIG.collectibles.coinValue*(dblScoreOn?2:1)*comboMult;document.getElementById('coins').textContent=coins;if(combo>=3){document.getElementById('combo-display').textContent='COMBO x'+comboMult;document.getElementById('combo-display').classList.remove('hidden');}audio.playCoin(combo);scene.remove(c.mesh);collectibles.splice(i,1);continue;}
            if(c.mesh.position.z>pZ+15){scene.remove(c.mesh);collectibles.splice(i,1);}
        }
        // Powerups
        for(var i=powerups.length-1;i>=0;i--){var pu=powerups[i];var dx=Math.abs(character.group.position.x-pu.mesh.position.x),dy=Math.abs((pY+1)-pu.mesh.position.y),dz=Math.abs(pZ-pu.mesh.position.z);if(dx<1&&dy<1.5&&dz<1.5){activatePU(pu.type);scene.remove(pu.mesh);powerups.splice(i,1);continue;}if(pu.mesh.position.z>pZ+15){scene.remove(pu.mesh);powerups.splice(i,1);}}

        // PU timer
        if(activePU){puTimer-=dt;document.getElementById('powerup-timer').style.width=(puTimer/CONFIG.powerups.duration*100)+'%';if(puTimer<=0)deactivatePU();}
        // Combo timer
        if(comboT>0){comboT-=dt;if(comboT<=0){combo=0;comboMult=1;document.getElementById('combo-display').classList.add('hidden');}}

        score=Math.floor(distance)+coins*CONFIG.collectibles.coinValue*comboMult;
        document.getElementById('score').textContent=score;
        var sp=((gameSpeed-CONFIG.gameplay.baseSpeed)/(CONFIG.gameplay.maxSpeed-CONFIG.gameplay.baseSpeed))*100;
        document.getElementById('speed-fill').style.width=sp+'%';
        if(shakeAmt>0){shakeAmt-=dt*2;camera.position.x+=(Math.random()-.5)*shakeAmt;camera.position.y+=(Math.random()-.5)*shakeAmt;}
    }
    skybox.update(dt);
    for(var i=explosions.length-1;i>=0;i--){if(!explosions[i].update(dt))explosions.splice(i,1);}
    if(shakeAmt<=0){camera.position.x=character.group.position.x*.5+Math.sin(Date.now()*.0003)*.2;camera.position.y=CONFIG.camera.position.y+Math.sin(Date.now()*.0005)*.1;}
    camera.lookAt(character.group.position.x*.3,CONFIG.camera.lookAt.y,pZ-10);
    renderer.render(scene,camera);
}
window.addEventListener('resize',function(){camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);});
document.getElementById('high-score').textContent=highScore;
initPlayer();animate();
})();
