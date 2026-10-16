(function() {
var STATE={MENU:'menu',PLAYING:'playing',GAME_OVER:'gameOver',LEVEL_UP:'levelUp'};
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
scene.fog=new THREE.FogExp2(0x0a0a15,0.01);
var camera=new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,.1,100);
camera.position.set(0,12,10);
camera.lookAt(0,0,0);
var renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.2;
container.appendChild(renderer.domElement);

// LIGHTS
scene.add(new THREE.AmbientLight(0x404060,.6));
var dirLight=new THREE.DirectionalLight(0xffffff,1);
dirLight.position.set(5,15,10); dirLight.castShadow=true;
dirLight.shadow.mapSize.width=1024; dirLight.shadow.mapSize.height=1024;
scene.add(dirLight);
var pLight=new THREE.PointLight(0xffd700,.5,20); pLight.position.set(0,5,5); scene.add(pLight);

var audio=createAudio(CONFIG);
var temple=createTemple(scene);
var frog=createFrog(scene,CONFIG);

// SPIRAL PATH
var pathPoints=[];
var spiralTurns=3, spiralRadius=8, spiralHeight=0;
for(var i=0;i<=200;i++){
    var t=i/200;
    var angle=t*spiralTurns*Math.PI*2;
    var r=spiralRadius*(1-t*0.7);
    pathPoints.push(new THREE.Vector3(Math.cos(angle)*r,0,Math.sin(angle)*r));
}
var pathCurve=new THREE.CatmullRomCurve3(pathPoints);

// Draw path
var pathGeo=new THREE.TubeGeometry(pathCurve,200,.15,8,false);
var pathMat=new THREE.MeshStandardMaterial({color:0x334455,metalness:.5,roughness:.3,emissive:0x112233,emissiveIntensity:.2});
var pathMesh=new THREE.Mesh(pathGeo,pathMat);
pathMesh.position.y=-.3;
scene.add(pathMesh);

// End hole
var endHole=new THREE.Mesh(new THREE.CircleGeometry(.5,16),new THREE.MeshStandardMaterial({color:0x000000,emissive:0xff0000,emissiveIntensity:.5}));
endHole.rotation.x=-Math.PI/2;
var endPoint=pathCurve.getPoint(1);
endHole.position.set(endPoint.x,-.2,endPoint.z);
scene.add(endHole);

// UI
document.getElementById('btn-start').addEventListener('click',function(){audio.resume();startGame();});
document.getElementById('btn-restart').addEventListener('click',function(){audio.resume();startGame();});

// INPUT
var mouseX=0,mouseY=0;
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
    frog.ballMat.color.setHex(CONFIG.orbColors[currentColor]);
    frog.ballMat.emissive.setHex(CONFIG.orbColors[currentColor]);
    frog.nextBallMat.color.setHex(CONFIG.orbColors[nextColor]);
    frog.nextBallMat.emissive.setHex(CONFIG.orbColors[nextColor]);
}

function shoot(){
    var color=CONFIG.orbColors[currentColor];
    var ballMat=new THREE.MeshStandardMaterial({color:color,metalness:.5,roughness:.2,emissive:color,emissiveIntensity:.3});
    var ball=new THREE.Mesh(new THREE.SphereGeometry(CONFIG.orbRadius,16,16),ballMat);
    var dir=new THREE.Vector3(Math.sin(aimAngle),0,Math.cos(aimAngle));
    ball.position.set(dir.x*.8,.5,dir.z*.8);
    ball.userData={dir:dir,speed:CONFIG.shootSpeed,color:currentColor};
    scene.add(ball);
    shootingBalls.push(ball);
    audio.playShoot();
    // Cycle colors
    currentColor=nextColor;
    nextColor=Math.floor(Math.random()*CONFIG.orbColors.length);
    frog.ballMat.color.setHex(CONFIG.orbColors[currentColor]);
    frog.ballMat.emissive.setHex(CONFIG.orbColors[currentColor]);
    frog.nextBallMat.color.setHex(CONFIG.orbColors[nextColor]);
    frog.nextBallMat.emissive.setHex(CONFIG.orbColors[nextColor]);
}

function spawnBall(){
    if(ballsOnTrack.length>=CONFIG.maxBalls)return;
    var colorIdx=Math.floor(Math.random()*CONFIG.orbColors.length);
    var color=CONFIG.orbColors[colorIdx];
    var mat=new THREE.MeshStandardMaterial({color:color,metalness:.5,roughness:.2,emissive:color,emissiveIntensity:.3});
    var ball=new THREE.Mesh(new THREE.SphereGeometry(CONFIG.orbRadius,16,16),mat);
    var pos=pathCurve.getPoint(0);
    ball.position.set(pos.x,0,pos.z);
    ball.userData={color:colorIdx,t:0,speed:CONFIG.ballSpeed*(1+level*.1)};
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
    frog.ballMat.color.setHex(CONFIG.orbColors[currentColor]);
    frog.ballMat.emissive.setHex(CONFIG.orbColors[currentColor]);
    frog.nextBallMat.color.setHex(CONFIG.orbColors[nextColor]);
    frog.nextBallMat.emissive.setHex(CONFIG.orbColors[nextColor]);
    document.getElementById('score').textContent='0';
    document.getElementById('level').textContent='1';
    document.getElementById('high-score').textContent=highScore;
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('gameover-screen').classList.add('hidden');
    gameState=STATE.PLAYING;audio.startMusic();
    // Spawn initial balls
    for(var i=0;i<5;i++){
        setTimeout(function(){spawnBall();},i*500);
    }
}

function gameOver(){
    gameState=STATE.GAME_OVER;audio.playGameOver();audio.stopMusic();
    var nh=score>highScore;if(nh){highScore=score;localStorage.setItem('orbTempleHighScore',highScore);}
    document.getElementById('final-score').textContent=score;
    document.getElementById('final-level').textContent=level;
    document.getElementById('gameover-screen').classList.remove('hidden');
    if(startNgPlayer)saveStartNgScore({score:score,distance:level,coins:0});
}

function levelComplete(){
    gameState=STATE.LEVEL_UP;audio.playLevelUp();
    document.getElementById('level-screen').classList.remove('hidden');
    setTimeout(function(){
        document.getElementById('level-screen').classList.add('hidden');
        level++;
        document.getElementById('level').textContent=level;
        ballsOnTrack.forEach(function(b){scene.remove(b);});
        ballsOnTrack=[];
        for(var i=0;i<5+level;i++){
            setTimeout(function(){spawnBall();},i*400);
        }
        gameState=STATE.PLAYING;
    },2000);
}

var spawnTimer=0;
var clock=new THREE.Clock();
function animate(){
    requestAnimationFrame(animate);
    var dt=Math.min(clock.getDelta(),.05);

    if(gameState===STATE.PLAYING){
        // Spawn balls
        spawnTimer+=dt;
        if(spawnTimer>=1.5){spawnTimer=0;spawnBall();}

        // Move balls along path
        for(var i=ballsOnTrack.length-1;i>=0;i--){
            var ball=ballsOnTrack[i];
            ball.userData.t+=ball.userData.speed*dt*0.01;
            if(ball.userData.t>=1){
                scene.remove(ball);
                ballsOnTrack.splice(i,1);
                gameOver();
                return;
            }
            var pos=pathCurve.getPoint(ball.userData.t);
            ball.position.set(pos.x,0,pos.z);
        }

        // Move shooting balls
        for(var i=shootingBalls.length-1;i>=0;i--){
            var sb=shootingBalls[i];
            sb.position.add(sb.userData.dir.clone().multiplyScalar(sb.userData.speed*dt));
            // Check collision with track balls
            for(var j=ballsOnTrack.length-1;j>=0;j--){
                var tb=ballsOnTrack[j];
                if(sb.position.distanceTo(tb.position)<CONFIG.orbRadius*2){
                    // Insert ball into track
                    var newBall=new THREE.Mesh(new THREE.SphereGeometry(CONFIG.orbRadius,16,16),new THREE.MeshStandardMaterial({color:CONFIG.orbColors[sb.userData.color],metalness:.5,roughness:.2,emissive:CONFIG.orbColors[sb.userData.color],emissiveIntensity:.3}));
                    newBall.position.copy(sb.position);
                    newBall.userData={color:sb.userData.color,t:tb.userData.t,speed:tb.userData.speed};
                    scene.add(newBall);
                    ballsOnTrack.push(newBall);
                    scene.remove(sb);
                    shootingBalls.splice(i,1);
                    // Check for matches
                    checkMatches(newBall);
                    break;
                }
            }
            // Remove if too far
            if(sb.position.length()>20){
                scene.remove(sb);
                shootingBalls.splice(i,1);
            }
        }

        // Combo timer
        if(combo>0){combo-=dt;if(combo<=0)combo=0;}

        // Score
        document.getElementById('score').textContent=score;

        // Level up check
        if(score>=level*CONFIG.levelUpScore){
            levelComplete();
        }
    }

    // Explosions
    for(var i=explosions.length-1;i>=0;i--){
        if(!explosions[i].update(dt))explosions.splice(i,1);
    }

    // Frog rotation
    frog.group.rotation.y=aimAngle;

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
        // Destroy matches
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
        document.getElementById('combo-display').textContent='COMBO x'+combo+'! +'+points;
        document.getElementById('combo-display').classList.remove('hidden');
        setTimeout(function(){document.getElementById('combo-display').classList.add('hidden');},1500);
        audio.playExplosion();
    }
}

window.addEventListener('resize',function(){camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);});
document.getElementById('high-score').textContent=highScore;
initPlayer();
animate();
})();
