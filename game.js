(function() {
var STATE={MENU:'menu',PLAYING:'playing',GAME_OVER:'gameOver'};
var gameState=STATE.MENU;
var score=0, level=1, combo=0;
var highScore=parseInt(localStorage.getItem('orbTempleHighScore'))||0;
var ballsOnTrack=[];
var shootingBalls=[];
var explosions=[];
var currentColor=0, nextColor=1;
var aimAngle=0;
var startNgPlayer=null;

// THREE SETUP
var container=document.getElementById('game-container');
var scene=new THREE.Scene();
scene.background=new THREE.Color(0x0a0a15);
scene.fog=new THREE.FogExp2(0x0a0a15,0.008);
var camera=new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,.1,100);
camera.position.set(0,14,12);
camera.lookAt(0,0,0);
var renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.2;
container.appendChild(renderer.domElement);

// LIGHTS
scene.add(new THREE.AmbientLight(0x606080,0.7));
var dirLight=new THREE.DirectionalLight(0xffffff,1.2);
dirLight.position.set(5,15,10);
dirLight.castShadow=true;
dirLight.shadow.mapSize.width=1024;
dirLight.shadow.mapSize.height=1024;
scene.add(dirLight);

var audio=createAudio(CONFIG);

// TEMPLE FLOOR
var floorGeo=new THREE.CircleGeometry(18,32);
var floorMat=new THREE.MeshStandardMaterial({color:0x1a1a2e,metalness:0.4,roughness:0.6});
var floor=new THREE.Mesh(floorGeo,floorMat);
floor.rotation.x=-Math.PI/2;
floor.position.y=-0.5;
floor.receiveShadow=true;
scene.add(floor);

// Decorative rings
for(var i=0;i<3;i++){
    var ring=new THREE.Mesh(new THREE.TorusGeometry(4+i*4,0.15,8,32),new THREE.MeshStandardMaterial({color:0xffd700,emissive:0xffd700,emissiveIntensity:0.5}));
    ring.rotation.x=Math.PI/2;
    ring.position.y=-0.3;
    scene.add(ring);
}

// SPIRAL PATH - simple approach
var pathPoints=[];
var totalPoints=100;
for(var i=0;i<totalPoints;i++){
    var t=i/totalPoints;
    var angle=t*Math.PI*4; // 2 full rotations
    var radius=10*(1-t*0.6);
    pathPoints.push(new THREE.Vector3(Math.cos(angle)*radius,0,Math.sin(angle)*radius));
}

// Draw path as small spheres
var pathMat=new THREE.MeshStandardMaterial({color:0x334455,emissive:0x112233,emissiveIntensity:0.3});
for(var i=0;i<pathPoints.length;i+=2){
    var dot=new THREE.Mesh(new THREE.SphereGeometry(0.15,8,8),pathMat);
    dot.position.copy(pathPoints[i]);
    scene.add(dot);
}

// End hole
var endPoint=pathPoints[pathPoints.length-1];
var endHole=new THREE.Mesh(new THREE.CircleGeometry(0.6,16),new THREE.MeshStandardMaterial({color:0x000000,emissive:0xff0000,emissiveIntensity:0.8}));
endHole.rotation.x=-Math.PI/2;
endHole.position.set(endPoint.x,-0.2,endPoint.z);
scene.add(endHole);

// FROG SHOOTER
var frogGroup=new THREE.Group();
var frogBodyMat=new THREE.MeshStandardMaterial({color:0x44aa44,metalness:0.3,roughness:0.5});
var frogBody=new THREE.Mesh(new THREE.SphereGeometry(0.5,16,16),frogBodyMat);
frogBody.scale.set(1,0.8,1.2);
frogBody.position.y=0.3;
frogGroup.add(frogBody);
var frogHead=new THREE.Mesh(new THREE.SphereGeometry(0.35,16,16),frogBodyMat);
frogHead.position.set(0,0.7,0.2);
frogGroup.add(frogHead);
var eyeMat=new THREE.MeshStandardMaterial({color:0xffff00,emissive:0xffff00,emissiveIntensity:0.6});
var le=new THREE.Mesh(new THREE.SphereGeometry(0.1),eyeMat); le.position.set(-0.15,0.85,0.45); frogGroup.add(le);
var re=new THREE.Mesh(new THREE.SphereGeometry(0.1),eyeMat); re.position.set(0.15,0.85,0.45); frogGroup.add(re);
// Current ball
var ballMat=new THREE.MeshStandardMaterial({color:CONFIG.orbColors[0],metalness:0.5,roughness:0.2,emissive:CONFIG.orbColors[0],emissiveIntensity:0.4});
var currentBall=new THREE.Mesh(new THREE.SphereGeometry(CONFIG.orbRadius,16,16),ballMat);
currentBall.position.set(0,0.5,0.7);
frogGroup.add(currentBall);
scene.add(frogGroup);

// UI
document.getElementById('btn-start').addEventListener('click',function(){audio.resume();startGame();});
document.getElementById('btn-restart').addEventListener('click',function(){audio.resume();startGame();});

// INPUT
document.addEventListener('mousemove',function(e){
    mouseX=(e.clientX/window.innerWidth)*2-1;
    mouseY=-(e.clientY/window.innerHeight)*2+1;
    aimAngle=Math.atan2(mouseX,mouseY);
});
document.addEventListener('click',function(e){
    if(gameState!==STATE.PLAYING)return;
    shoot();
});
document.addEventListener('keydown',function(e){
    if(e.code==='Space'&&gameState===STATE.PLAYING){e.preventDefault();swapBalls();}
    if(e.code==='Enter'&&gameState===STATE.MENU){audio.resume();startGame();}
    if(e.code==='Enter'&&gameState===STATE.GAME_OVER){audio.resume();startGame();}
});

function swapBalls(){
    var temp=currentColor;
    currentColor=nextColor;
    nextColor=temp;
    ballMat.color.setHex(CONFIG.orbColors[currentColor]);
    ballMat.emissive.setHex(CONFIG.orbColors[currentColor]);
}

function shoot(){
    var color=CONFIG.orbColors[currentColor];
    var mat=new THREE.MeshStandardMaterial({color:color,metalness:0.5,roughness:0.2,emissive:color,emissiveIntensity:0.4});
    var ball=new THREE.Mesh(new THREE.SphereGeometry(CONFIG.orbRadius,16,16),mat);
    var dir=new THREE.Vector3(Math.sin(aimAngle),0,Math.cos(aimAngle));
    ball.position.set(dir.x*0.8,0.5,dir.z*0.8);
    ball.userData={dir:dir,speed:CONFIG.shootSpeed,color:currentColor};
    scene.add(ball);
    shootingBalls.push(ball);
    audio.playShoot();
    currentColor=nextColor;
    nextColor=Math.floor(Math.random()*CONFIG.orbColors.length);
    ballMat.color.setHex(CONFIG.orbColors[currentColor]);
    ballMat.emissive.setHex(CONFIG.orbColors[currentColor]);
}

function spawnBall(){
    if(ballsOnTrack.length>=CONFIG.maxBalls)return;
    var colorIdx=Math.floor(Math.random()*CONFIG.orbColors.length);
    var color=CONFIG.orbColors[colorIdx];
    var mat=new THREE.MeshStandardMaterial({color:color,metalness:0.5,roughness:0.2,emissive:color,emissiveIntensity:0.4});
    var ball=new THREE.Mesh(new THREE.SphereGeometry(CONFIG.orbRadius,16,16),mat);
    var pos=pathPoints[0];
    ball.position.set(pos.x,0,pos.z);
    ball.userData={color:colorIdx,pathIndex:0,speed:CONFIG.ballSpeed*(1+level*0.1)};
    scene.add(ball);
    ballsOnTrack.push(ball);
}

function startGame(){
    score=0;level=1;combo=0;
    ballsOnTrack.forEach(function(b){scene.remove(b);});
    shootingBalls.forEach(function(b){scene.remove(b);});
    ballsOnTrack=[];shootingBalls=[];explosions=[];
    currentColor=Math.floor(Math.random()*CONFIG.orbColors.length);
    nextColor=Math.floor(Math.random()*CONFIG.orbColors.length);
    ballMat.color.setHex(CONFIG.orbColors[currentColor]);
    ballMat.emissive.setHex(CONFIG.orbColors[currentColor]);
    document.getElementById('score').textContent='0';
    document.getElementById('level').textContent='1';
    document.getElementById('high-score').textContent=highScore;
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('gameover-screen').classList.add('hidden');
    gameState=STATE.PLAYING;
    audio.startMusic();
    for(var i=0;i<5;i++){
        setTimeout(function(){spawnBall();},i*600);
    }
}

function gameOver(){
    gameState=STATE.GAME_OVER;
    audio.playGameOver();
    audio.stopMusic();
    var nh=score>highScore;
    if(nh){highScore=score;localStorage.setItem('orbTempleHighScore',highScore);}
    document.getElementById('final-score').textContent=score;
    document.getElementById('final-level').textContent=level;
    document.getElementById('gameover-screen').classList.remove('hidden');
    if(startNgPlayer)saveStartNgScore({score:score,distance:level,coins:0});
}

var spawnTimer=0;
var clock=new THREE.Clock();
function animate(){
    requestAnimationFrame(animate);
    var dt=Math.min(clock.getDelta(),0.05);

    if(gameState===STATE.PLAYING){
        spawnTimer+=dt;
        if(spawnTimer>=1.5){spawnTimer=0;spawnBall();}

        // Move balls along path
        for(var i=ballsOnTrack.length-1;i>=0;i--){
            var ball=ballsOnTrack[i];
            ball.userData.pathIndex+=ball.userData.speed*dt;
            if(ball.userData.pathIndex>=pathPoints.length-1){
                scene.remove(ball);
                ballsOnTrack.splice(i,1);
                gameOver();
                return;
            }
            var idx=Math.floor(ball.userData.pathIndex);
            var nextIdx=Math.min(idx+1,pathPoints.length-1);
            var t=ball.userData.pathIndex-idx;
            var pos=pathPoints[idx].clone().lerp(pathPoints[nextIdx],t);
            ball.position.set(pos.x,0,pos.z);
        }

        // Move shooting balls
        for(var i=shootingBalls.length-1;i>=0;i--){
            var sb=shootingBalls[i];
            sb.position.add(sb.userData.dir.clone().multiplyScalar(sb.userData.speed*dt));
            // Check collision with track balls
            for(var j=ballsOnTrack.length-1;j>=0;j--){
                var tb=ballsOnTrack[j];
                if(sb.position.distanceTo(tb.position)<CONFIG.orbRadius*2.2){
                    // Insert into track
                    var newBall=new THREE.Mesh(new THREE.SphereGeometry(CONFIG.orbRadius,16,16),new THREE.MeshStandardMaterial({color:CONFIG.orbColors[sb.userData.color],metalness:.5,roughness:.2,emissive:CONFIG.orbColors[sb.userData.color],emissiveIntensity:.4}));
                    newBall.position.copy(sb.position);
                    newBall.userData={color:sb.userData.color,pathIndex:tb.userData.pathIndex,speed:tb.userData.speed};
                    scene.add(newBall);
                    ballsOnTrack.push(newBall);
                    scene.remove(sb);
                    shootingBalls.splice(i,1);
                    checkMatches(newBall);
                    break;
                }
            }
            if(sb.position.length()>25){
                scene.remove(sb);
                shootingBalls.splice(i,1);
            }
        }

        if(combo>0){combo-=dt;if(combo<=0)combo=0;}
        document.getElementById('score').textContent=score;
        if(score>=level*CONFIG.levelUpScore){levelComplete();}
    }

    // Explosions
    for(var i=explosions.length-1;i>=0;i--){
        if(!explosions[i].update(dt))explosions.splice(i,1);
    }

    // Frog rotation
    frogGroup.rotation.y=aimAngle;

    renderer.render(scene,camera);
}

function checkMatches(insertedBall){
    var color=insertedBall.userData.color;
    var matches=[insertedBall];
    var idx=ballsOnTrack.indexOf(insertedBall);
    // Check backwards
    for(var i=idx-1;i>=0;i--){
        if(ballsOnTrack[i].userData.color===color)matches.push(ballsOnTrack[i]);
        else break;
    }
    // Check forwards
    for(var i=idx+1;i<ballsOnTrack.length;i++){
        if(ballsOnTrack[i].userData.color===color)matches.push(ballsOnTrack[i]);
        else break;
    }
    if(matches.length>=CONFIG.matchCount){
        matches.forEach(function(b){
            var idx2=ballsOnTrack.indexOf(b);
            if(idx2>=0)ballsOnTrack.splice(idx2,1);
            explosions.push(createExplosion(scene,CONFIG.orbColors[color],b.position.x,b.position.y,b.position.z));
            scene.remove(b);
        });
        combo++;
        var points=CONFIG.scorePerOrb*matches.length*combo;
        score+=points;
        audio.playMatch(combo);
        audio.playExplosion();
    }
}

function levelComplete(){
    audio.playLevelUp();
    level++;
    document.getElementById('level').textContent=level;
    ballsOnTrack.forEach(function(b){scene.remove(b);});
    ballsOnTrack=[];
    for(var i=0;i<5+level;i++){
        setTimeout(function(){spawnBall();},i*500);
    }
}

var mouseX=0,mouseY=0;
window.addEventListener('resize',function(){camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);});
document.getElementById('high-score').textContent=highScore;
animate();
})();
