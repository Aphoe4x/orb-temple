// ============================================
// NEON RUNNER — Main Game Logic (no modules)
// ============================================
(function() {
var STATE = { MENU:'menu', PLAYING:'playing', PAUSED:'paused', GAME_OVER:'gameOver' };
var gameState = STATE.MENU;
var score=0, coins=0, distance=0;
var highScore = parseInt(localStorage.getItem('neonRunnerHighScore'))||0;
var gameSpeed=CONFIG.gameplay.baseSpeed, targetSpeed=CONFIG.gameplay.baseSpeed;
var spawnTimer=0, coinSpawnTimer=0, powerupTimer=0, speedZoneTimer=0;
var weatherTimer=0, currentWeather='clear';
var nextBossDistance=CONFIG.boss.spawnDistance, bossActive=false, boss=null, shakeAmount=0;
var activePowerup=null, powerupTimerRemaining=0, shieldActive=false, magnetActive=false, doubleScoreActive=false, slowMoActive=false;
var comboCount=0, comboTimer=0, comboMultiplier=1;
var currentLane=0, isJumping=false, isSliding=false, jumpVelocity=0, slideTimer=0, playerY=0, playerZ=0;
var startNgPlayer=null;

// THREE SETUP
var container=document.getElementById('game-container');
var scene=new THREE.Scene();
scene.background=new THREE.Color(CONFIG.world.skyColor);
scene.fog=new THREE.FogExp2(CONFIG.world.fogColor,CONFIG.world.fogDensity);
var camera=new THREE.PerspectiveCamera(CONFIG.camera.fov,window.innerWidth/window.innerHeight,0.1,200);
camera.position.set(CONFIG.camera.position.x,CONFIG.camera.position.y,CONFIG.camera.position.z);
var renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
container.appendChild(renderer.domElement);

// LIGHTS
scene.add(new THREE.AmbientLight(0x404060,0.5));
var dirLight=new THREE.DirectionalLight(0xffffff,1);
dirLight.position.set(5,10,5);dirLight.castShadow=true;
dirLight.shadow.mapSize.width=1024;dirLight.shadow.mapSize.height=1024;
dirLight.shadow.camera.left=-10;dirLight.shadow.camera.right=10;dirLight.shadow.camera.top=10;dirLight.shadow.camera.bottom=-10;
scene.add(dirLight);
var playerLight=new THREE.PointLight(CONFIG.character.bodyColor,2,10);
playerLight.position.set(0,3,2);scene.add(playerLight);
var backLight=new THREE.PointLight(CONFIG.character.accentColor,1.5,35);
backLight.position.set(0,5,-15);scene.add(backLight);

// AUDIO
var audio=createAudio(CONFIG);

// OBJECTS
var character=createCharacter(CONFIG);scene.add(character.group);
var trail=createTrail(CONFIG);scene.add(trail.points);
var ground=createGround(CONFIG);scene.add(ground);
var skybox=createSkybox(CONFIG);scene.add(skybox.stars);
var weather=createWeather(scene,CONFIG);
var dayNight=createDayNightCycle(scene,CONFIG);
var obstacles=[],collectibles=[],powerups=[],speedZones=[],explosions=[];

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
    }else if(gameState===STATE.PAUSED&&e.code==='Escape')resumeGame();
});

function moveLeft(){if(currentLane>-1){currentLane--;character.group.rotation.z=0.15;}}
function moveRight(){if(currentLane<1){currentLane++;character.group.rotation.z=-0.15;}}
function jump(){if(!isJumping&&!isSliding){isJumping=true;jumpVelocity=CONFIG.gameplay.jumpForce;character.setJumping(true);audio.playJump();}}
function slide(){if(!isSliding&&!isJumping){isSliding=true;slideTimer=CONFIG.gameplay.slideDuration;character.setSliding(true);audio.playSlide();}}

// START.NG
function initPlayer(){initStartNg().then(function(p){startNgPlayer=p;if(p){character.applyStartNgStyle(p.style);var pc=document.getElementById('player-card');if(pc)pc.hidden=false;var pn=document.getElementById('player-name');if(pn)pn.textContent=p.name||'Player';var pa=document.getElementById('player-account');if(pa)pa.textContent=p.account?'@'+p.account:'Not signed in';var si=document.getElementById('player-sign-in');if(si){si.hidden=!!p.account;if(!p.account)si.onclick=function(){signInStartNg();};}}});}
document.addEventListener('visibilitychange',function(){if(!document.hidden)initPlayer();});

// GAME FUNCTIONS
function startGame(){
    score=0;coins=0;distance=0;gameSpeed=CONFIG.gameplay.baseSpeed;targetSpeed=CONFIG.gameplay.baseSpeed;
    spawnTimer=0;coinSpawnTimer=0;powerupTimer=0;speedZoneTimer=0;weatherTimer=0;currentWeather='clear';
    nextBossDistance=CONFIG.boss.spawnDistance;bossActive=false;boss=null;shakeAmount=0;
    activePowerup=null;powerupTimerRemaining=0;shieldActive=false;magnetActive=false;doubleScoreActive=false;slowMoActive=false;
    comboCount=0;comboTimer=0;comboMultiplier=1;currentLane=0;isJumping=false;isSliding=false;jumpVelocity=0;playerY=0;playerZ=0;
    obstacles.forEach(function(o){o.dispose(o.mesh);});collectibles.forEach(function(c){c.dispose(c.mesh);});
    powerups.forEach(function(p){p.dispose(p.mesh);});speedZones.forEach(function(s){s.dispose(s.mesh);});
    if(boss){boss.dispose();boss=null;}
    obstacles=[];collectibles=[];powerups=[];speedZones=[];explosions=[];
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
    explosions.push(createExplosion(scene,CONFIG.character.bodyColor));shakeAmount=0.5;
    var nh=score>highScore;if(nh){highScore=score;localStorage.setItem('neonRunnerHighScore',highScore);}
    document.getElementById('final-score').textContent=score;
    document.getElementById('final-coins').textContent=coins;
    document.getElementById('final-distance').textContent=Math.floor(distance)+'m';
    var ne=document.getElementById('new-highscore');ne.classList.toggle('hidden',!nh);
    document.getElementById('gameover-screen').classList.remove('hidden');
    if(startNgPlayer)saveStartNgScore({score:score,distance:Math.floor(distance),coins:coins});
}

function spawnObstacle(){var types=CONFIG.obstacles.types;var type=types[Math.floor(Math.random()*types.length)];var obs=createObstacle(type,CONFIG);obs.mesh.position.z=playerZ-60;scene.add(obs.mesh);obstacles.push(obs);}
function spawnCoin(){var coin=createCoin(CONFIG);coin.mesh.position.z=playerZ-60;scene.add(coin.mesh);collectibles.push(coin);}
function spawnPowerup(){var types=CONFIG.powerups.types;var type=types[Math.floor(Math.random()*types.length)];var pu=createPowerup(type,CONFIG);pu.mesh.position.z=playerZ-60;scene.add(pu.mesh);powerups.push(pu);}
function activatePowerup(type){activePowerup=type;powerupTimerRemaining=CONFIG.powerups.duration;if(type==='shield'){shieldActive=true;character.setShield(true);}if(type==='magnet'){magnetActive=true;}if(type==='doubleScore'){doubleScoreActive=true;}if(type==='slowMo'){slowMoActive=true;}document.getElementById('powerup-display').textContent=type.toUpperCase()+' ACTIVE';document.getElementById('powerup-container').classList.remove('hidden');audio.playPowerup();}
function deactivatePowerup(){if(activePowerup==='shield'){shieldActive=false;character.setShield(false);}if(activePowerup==='magnet'){magnetActive=false;}if(activePowerup==='doubleScore'){doubleScoreActive=false;}if(activePowerup==='slowMo'){slowMoActive=false;}activePowerup=null;document.getElementById('powerup-container').classList.add('hidden');}
function incrementCombo(){comboCount++;comboTimer=CONFIG.combo.window;comboMultiplier=Math.min(CONFIG.combo.maxMultiplier,1+Math.floor(comboCount/3));if(comboCount>=3){document.getElementById('combo-display').textContent='COMBO x'+comboMultiplier;document.getElementById('combo-display').classList.remove('hidden');}}

// COLLISION
function checkCollision(px,py,pz,pH,obs){var m=obs.mesh;var oHW=obs.width/2+0.3;var oHH=obs.height/2;var pHW=0.35;var pHH=(isSliding?0.35:pH/2);var pCY=py+(isSliding?0.35:pH/2);return Math.abs(px-m.position.x)<(pHW+oHW)&&Math.abs(pCY-m.position.y)<(pHH+oHH)&&Math.abs(pz-m.position.z)<1.2;}
function checkCoin(px,py,pz,coin){var c=coin.mesh.position;var dx=Math.abs(px-c.x),dy=Math.abs((py+1)-c.y),dz=Math.abs(pz-c.z);if(magnetActive)return dx<5&&dy<5&&dz<5;return dx<1&&dy<1.5&&dz<1.2;}

// MAIN LOOP
var clock=new THREE.Clock();
function animate(){
    requestAnimationFrame(animate);
    var dt=Math.min(clock.getDelta(),0.05);
    if(slowMoActive)dt*=0.4;
    if(gameState===STATE.PLAYING){
        gameSpeed+=(targetSpeed-gameSpeed)*0.02;
        targetSpeed=Math.min(CONFIG.gameplay.maxSpeed,targetSpeed+CONFIG.gameplay.speedIncrement);
        if(activePowerup==='slowMo')targetSpeed*=0.6;
        playerZ-=gameSpeed*dt;character.group.position.z=playerZ;distance+=gameSpeed*dt;
        var tx=currentLane*CONFIG.gameplay.laneWidth;
        character.group.position.x+=(tx-character.group.position.x)*10*dt;
        character.group.rotation.z+=(0-character.group.rotation.z)*8*dt;
        if(isJumping){jumpVelocity+=CONFIG.gameplay.gravity*dt;playerY+=jumpVelocity*dt;if(playerY<=0){playerY=0;isJumping=false;jumpVelocity=0;character.setJumping(false);}}
        character.group.position.y=playerY;
        if(isSliding){slideTimer-=dt;if(slideTimer<=0){isSliding=false;character.setSliding(false);}}
        character.update(dt,gameSpeed);
        playerLight.position.set(character.group.position.x,3,playerZ+2);
        if(CONFIG.character.hasTrail&&!isSliding)trail.emit(character.group.position.x,playerY+0.5,playerZ-0.5);
        trail.update(dt);
        spawnTimer+=dt;if(spawnTimer>=CONFIG.obstacles.spawnRate/(gameSpeed/CONFIG.gameplay.baseSpeed)){spawnTimer=0;spawnObstacle();}
        coinSpawnTimer+=dt;if(coinSpawnTimer>=0.8){coinSpawnTimer=0;if(Math.random()<CONFIG.collectibles.spawnChance)spawnCoin();}
        powerupTimer+=dt;if(powerupTimer>=5){powerupTimer=0;if(Math.random()<CONFIG.powerups.spawnChance)spawnPowerup();}
        weatherTimer+=dt;if(weatherTimer>=CONFIG.weather.changeInterval){weatherTimer=0;var types=CONFIG.weather.types;currentWeather=types[Math.floor(Math.random()*types.length)];weather.setWeather(currentWeather);}
        weather.update(dt,currentWeather==='storm');
        dayNight.update(dt);
        if(distance>=nextBossDistance&&!bossActive){bossActive=true;boss=createBoss(CONFIG);boss.group.position.z=playerZ-40;scene.add(boss.group);document.getElementById('boss-health-container').classList.remove('hidden');document.getElementById('boss-health-fill').style.width='100%';audio.playBossAlert();}
        var pH=2.0*CONFIG.character.scale;
        for(var i=obstacles.length-1;i>=0;i--){var obs=obstacles[i];
            if(!isSliding||obs.type!=='tall'){if(checkCollision(character.group.position.x,playerY,playerZ,pH,obs)){if(shieldActive){shieldActive=false;character.setShield(false);obs.dispose(obstacles[i].mesh);obstacles.splice(i,1);shakeAmount=0.2;continue;}gameOver();return;}}
            if(obs.mesh.position.z>playerZ+15){scene.remove(obs.mesh);obstacles.splice(i,1);}
        }
        if(bossActive&&boss){document.getElementById('boss-health-fill').style.width=(boss.health/boss.maxHealth*100)+'%';boss.update(dt,gameSpeed);}
        for(var i=collectibles.length-1;i>=0;i--){var coin=collectibles[i];if(checkCoin(character.group.position.x,playerY,playerZ,coin)){incrementCombo();coins++;score+=CONFIG.collectibles.coinValue*(doubleScoreActive?2:1)*comboMultiplier;document.getElementById('coins').textContent=coins;scene.remove(coin.mesh);collectibles.splice(i,1);continue;}if(coin.mesh.position.z>playerZ+15){scene.remove(coin.mesh);collectibles.splice(i,1);}}
        for(var i=powerups.length-1;i>=0;i--){var pu=powerups[i];var dx=Math.abs(character.group.position.x-pu.mesh.position.x),dy=Math.abs((playerY+1)-pu.mesh.position.y),dz=Math.abs(playerZ-pu.mesh.position.z);if(dx<1&&dy<1.5&&dz<1.5){activatePowerup(pu.type);scene.remove(pu.mesh);powerups.splice(i,1);continue;}if(pu.mesh.position.z>playerZ+15){scene.remove(pu.mesh);powerups.splice(i,1);}}
        if(activePowerup){powerupTimerRemaining-=dt;document.getElementById('powerup-timer').style.width=(powerupTimerRemaining/CONFIG.powerups.duration*100)+'%';if(powerupTimerRemaining<=0)deactivatePowerup();}
        if(comboTimer>0){comboTimer-=dt;if(comboTimer<=0){comboCount=0;comboMultiplier=1;document.getElementById('combo-display').classList.add('hidden');}}
        score=Math.floor(distance)+coins*CONFIG.collectibles.coinValue*comboMultiplier;
        document.getElementById('score').textContent=score;
        var sp=((gameSpeed-CONFIG.gameplay.baseSpeed)/(CONFIG.gameplay.maxSpeed-CONFIG.gameplay.baseSpeed))*100;
        document.getElementById('speed-fill').style.width=sp+'%';
        if(shakeAmount>0){shakeAmount-=dt*2;camera.position.x+=(Math.random()-0.5)*shakeAmount;camera.position.y+=(Math.random()-0.5)*shakeAmount;}
    }
    skybox.update(dt);
    for(var i=explosions.length-1;i>=0;i--){if(!explosions[i].update(dt))explosions.splice(i,1);}
    if(shakeAmount<=0){camera.position.x=character.group.position.x*0.5+Math.sin(Date.now()*0.0003)*0.2;camera.position.y=CONFIG.camera.position.y+Math.sin(Date.now()*0.0005)*0.1;}
    camera.lookAt(character.group.position.x*0.3,CONFIG.camera.lookAt.y,playerZ-10);
    renderer.render(scene,camera);
}
window.addEventListener('resize',function(){camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);});
document.getElementById('high-score').textContent=highScore;
initPlayer();
animate();
})();
