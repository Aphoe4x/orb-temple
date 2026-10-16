import * as THREE from 'three';
import { CONFIG } from './config.js';
import { createCharacter } from './character.js';
import { createObstacle, createCoin, createPowerup, createSpeedZone, createBoss } from './obstacles.js';
import { createTrail, createGround, createSkybox, createWeather, createDayNightCycle, createExplosion } from './effects.js';
import { createAudio } from './audio.js';
import { initStartNg, saveStartNgScore, getStartNgLeaderboard, signInStartNg } from './startng.js';

// ============================================
// GAME STATE
// ============================================
const STATE = { MENU: 'menu', PLAYING: 'playing', PAUSED: 'paused', GAME_OVER: 'gameOver' };
let gameState = STATE.MENU;
let score = 0, coins = 0, distance = 0;
let highScore = parseInt(localStorage.getItem('neonRunnerHighScore')) || 0;
let gameSpeed = CONFIG.gameplay.baseSpeed;
let targetSpeed = CONFIG.gameplay.baseSpeed;
let spawnTimer = 0, coinSpawnTimer = 0, powerupTimer = 0, speedZoneTimer = 0;
let weatherTimer = 0, currentWeather = 'clear';
let nextBossDistance = CONFIG.boss.spawnDistance;
let bossActive = false, boss = null;
let shakeAmount = 0;

// Power-up states
let activePowerup = null;
let powerupTimerRemaining = 0;
let shieldActive = false;
let magnetActive = false;
let doubleScoreActive = false;
let slowMoActive = false;

// Combo
let comboCount = 0;
let comboTimer = 0;
let comboMultiplier = 1;

// Player
let currentLane = 0;
let isJumping = false, isSliding = false;
let jumpVelocity = 0, slideTimer = 0, playerY = 0;
let playerZ = 0;

// start.ng player
let startNgPlayer = null;

// ============================================
// THREE SETUP
// ============================================
const container = document.getElementById('game-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(CONFIG.world.skyColor);
scene.fog = new THREE.FogExp2(CONFIG.world.fogColor, CONFIG.world.fogDensity);

const camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(CONFIG.camera.position.x, CONFIG.camera.position.y, CONFIG.camera.position.z);
camera.lookAt(CONFIG.camera.lookAt.x, CONFIG.camera.lookAt.y, CONFIG.camera.lookAt.z);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
container.appendChild(renderer.domElement);

// ============================================
// LIGHTING
// ============================================
const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 50;
dirLight.shadow.camera.left = -10;
dirLight.shadow.camera.right = 10;
dirLight.shadow.camera.top = 10;
dirLight.shadow.camera.bottom = -10;
scene.add(dirLight);

const playerLight = new THREE.PointLight(CONFIG.character.bodyColor, 2, 10);
playerLight.position.set(0, 3, 2);
scene.add(playerLight);

const backLight = new THREE.PointLight(CONFIG.character.accentColor, 1.5, 35);
backLight.position.set(0, 5, -15);
scene.add(backLight);

// ============================================
// AUDIO
// ============================================
const audio = createAudio(CONFIG);

// ============================================
// GAME OBJECTS
// ============================================
const character = createCharacter(CONFIG);
scene.add(character.group);

const trail = createTrail(CONFIG);
scene.add(trail.points);

const ground = createGround(CONFIG);
scene.add(ground);

const skybox = createSkybox(CONFIG);
scene.add(skybox.stars);

const weather = createWeather(scene, CONFIG);
const dayNight = createDayNightCycle(scene, CONFIG);

let obstacles = [], collectibles = [], powerups = [], speedZones = [], explosions = [];

// ============================================
// UI HANDLERS
// ============================================
document.getElementById('btn-start').addEventListener('click', () => { audio.resume(); startGame(); });
document.getElementById('btn-restart').addEventListener('click', () => { audio.resume(); startGame(); });
document.getElementById('btn-resume').addEventListener('click', resumeGame);

// ============================================
// INPUT
// ============================================
document.addEventListener('keydown', (e) => {
    if (gameState === STATE.MENU && e.code === 'Enter') { audio.resume(); startGame(); }
    else if (gameState === STATE.GAME_OVER && e.code === 'Enter') { audio.resume(); startGame(); }
    else if (gameState === STATE.PLAYING) {
        if (e.code === 'KeyA' || e.code === 'ArrowLeft') moveLeft();
        if (e.code === 'KeyD' || e.code === 'ArrowRight') moveRight();
        if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') jump();
        if (e.code === 'KeyS' || e.code === 'ArrowDown') slide();
        if (e.code === 'Escape') pauseGame();
    } else if (gameState === STATE.PAUSED && e.code === 'Escape') resumeGame();
});

let touchStartX = 0, touchStartY = 0;
document.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; });
document.addEventListener('touchend', (e) => {
    if (gameState !== STATE.PLAYING) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) { dx > 0 ? moveRight() : moveLeft(); }
    else if (Math.abs(dy) > 30) { dy < 0 ? jump() : slide(); }
});

function moveLeft() { if (currentLane > -1) { currentLane--; character.group.rotation.z = 0.15; } }
function moveRight() { if (currentLane < 1) { currentLane++; character.group.rotation.z = -0.15; } }
function jump() { if (!isJumping && !isSliding) { isJumping = true; jumpVelocity = CONFIG.gameplay.jumpForce; character.setJumping(true); audio.playJump(); } }
function slide() { if (!isSliding && !isJumping) { isSliding = true; slideTimer = CONFIG.gameplay.slideDuration; character.setSliding(true); audio.playSlide(); } }

// ============================================
// START.NG INTEGRATION
// ============================================
async function initPlayer() {
    startNgPlayer = await initStartNg();
    if (startNgPlayer) {
        // Apply player's start.ng style to character
        character.applyStartNgStyle(startNgPlayer.style);

        // Update UI
        const playerCard = document.getElementById('player-card');
        const playerFace = document.getElementById('player-face');
        const playerName = document.getElementById('player-name');
        const playerAccount = document.getElementById('player-account');
        const signInBtn = document.getElementById('player-sign-in');

        if (playerFace && startNgPlayer.face) playerFace.src = startNgPlayer.face;
        if (playerName) playerName.textContent = startNgPlayer.name || 'Player';
        if (playerAccount) {
            playerAccount.textContent = startNgPlayer.account ? `@${startNgPlayer.account}` : 'Not signed in';
        }
        if (signInBtn) {
            signInBtn.hidden = !!startNgPlayer.account;
            signInBtn.onclick = () => signInStartNg();
        }
        if (playerCard) playerCard.hidden = false;
    }
}

// Re-check when tab regains focus
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) initPlayer();
});

// ============================================
// GAME FUNCTIONS
// ============================================
function startGame() {
    score = 0; coins = 0; distance = 0;
    gameSpeed = CONFIG.gameplay.baseSpeed;
    targetSpeed = CONFIG.gameplay.baseSpeed;
    spawnTimer = 0; coinSpawnTimer = 0; powerupTimer = 0; speedZoneTimer = 0;
    weatherTimer = 0; currentWeather = 'clear';
    nextBossDistance = CONFIG.boss.spawnDistance;
    bossActive = false; boss = null;
    shakeAmount = 0;
    activePowerup = null; powerupTimerRemaining = 0;
    shieldActive = false; magnetActive = false;
    doubleScoreActive = false; slowMoActive = false;
    comboCount = 0; comboTimer = 0; comboMultiplier = 1;
    currentLane = 0; isJumping = false; isSliding = false;
    jumpVelocity = 0; playerY = 0; playerZ = 0;

    clearAll();
    character.reset();
    character.setShield(false);

    // Re-apply start.ng style after reset
    if (startNgPlayer) character.applyStartNgStyle(startNgPlayer.style);

    document.getElementById('score').textContent = '0';
    document.getElementById('coins').textContent = '0';
    document.getElementById('high-score').textContent = highScore;
    document.getElementById('speed-fill').style.width = '0%';
    document.getElementById('combo-display').classList.add('hidden');
    document.getElementById('powerup-container').classList.add('hidden');
    document.getElementById('boss-health-container').classList.add('hidden');
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('gameover-screen').classList.add('hidden');
    document.getElementById('pause-screen').classList.add('hidden');
    document.getElementById('unlock-notification').classList.add('hidden');

    gameState = STATE.PLAYING;
    audio.startMusic();
}

function pauseGame() { gameState = STATE.PAUSED; document.getElementById('pause-screen').classList.remove('hidden'); }
function resumeGame() { gameState = STATE.PLAYING; document.getElementById('pause-screen').classList.add('hidden'); }

async function gameOver() {
    gameState = STATE.GAME_OVER;
    audio.playCrash();
    audio.stopMusic();

    explosions.push(createExplosion(scene, CONFIG.character.bodyColor));
    shakeAmount = 0.5;

    const isNewHighScore = score > highScore;
    if (isNewHighScore) { highScore = score; localStorage.setItem('neonRunnerHighScore', highScore); }

    document.getElementById('final-score').textContent = score;
    document.getElementById('final-coins').textContent = coins;
    document.getElementById('final-distance').textContent = Math.floor(distance) + 'm';
    document.getElementById('new-highscore').classList.toggle('hidden', !isNewHighScore);
    document.getElementById('gameover-screen').classList.remove('hidden');

    checkUnlocks();

    // Save score to start.ng
    if (startNgPlayer) {
        await saveStartNgScore({
            score: score,
            distance: Math.floor(distance),
            coins: coins
        });
    }
}

function checkUnlocks() {
    const skins = CONFIG.character.skins;
    for (const skin of skins) {
        if (score >= skin.unlockScore && !localStorage.getItem('skin_' + skin.name)) {
            localStorage.setItem('skin_' + skin.name, 'unlocked');
            showUnlockNotification(skin);
        }
    }
}

function showUnlockNotification(skin) {
    const el = document.getElementById('unlock-notification');
    el.textContent = 'NEW SKIN UNLOCKED: ' + skin.name + '!';
    el.classList.remove('hidden');
    audio.playUnlock();
    setTimeout(() => el.classList.add('hidden'), 3000);
}

function clearAll() {
    obstacles.forEach(o => o.dispose(o.mesh));
    collectibles.forEach(c => c.dispose(c.mesh));
    powerups.forEach(p => p.dispose(p.mesh));
    speedZones.forEach(s => s.dispose(s.mesh));
    if (boss) { boss.dispose(); boss = null; }
    obstacles = []; collectibles = []; powerups = []; speedZones = []; explosions = [];
}

function spawnObstacle() {
    const types = CONFIG.obstacles.types;
    const type = types[Math.floor(Math.random() * types.length)];
    const obs = createObstacle(type, CONFIG);
    obs.mesh.position.z = playerZ - 60;
    scene.add(obs.mesh);
    obstacles.push(obs);
}

function spawnCoin() {
    const coin = createCoin(CONFIG);
    coin.mesh.position.z = playerZ - 60;
    scene.add(coin.mesh);
    collectibles.push(coin);
}

function spawnPowerup() {
    const types = CONFIG.powerups.types;
    const type = types[Math.floor(Math.random() * types.length)];
    const pu = createPowerup(type, CONFIG);
    pu.mesh.position.z = playerZ - 60;
    scene.add(pu.mesh);
    powerups.push(pu);
}

function spawnSpeedZone() {
    const sz = createSpeedZone(CONFIG);
    sz.mesh.position.z = playerZ - 60;
    scene.add(sz.mesh);
    speedZones.push(sz);
}

function activatePowerup(type) {
    activePowerup = type;
    powerupTimerRemaining = CONFIG.powerups.duration;
    if (type === 'shield') { shieldActive = true; character.setShield(true); }
    if (type === 'magnet') { magnetActive = true; }
    if (type === 'doubleScore') { doubleScoreActive = true; }
    if (type === 'slowMo') { slowMoActive = true; }
    document.getElementById('powerup-display').textContent = type.toUpperCase() + ' ACTIVE';
    document.getElementById('powerup-container').classList.remove('hidden');
    audio.playPowerup();
}

function deactivatePowerup() {
    if (activePowerup === 'shield') { shieldActive = false; character.setShield(false); }
    if (activePowerup === 'magnet') { magnetActive = false; }
    if (activePowerup === 'doubleScore') { doubleScoreActive = false; }
    if (activePowerup === 'slowMo') { slowMoActive = false; }
    activePowerup = null;
    document.getElementById('powerup-container').classList.add('hidden');
}

function updateCombo(dt) {
    if (comboTimer > 0) {
        comboTimer -= dt;
        if (comboTimer <= 0) {
            comboCount = 0; comboMultiplier = 1;
            document.getElementById('combo-display').classList.add('hidden');
        }
    }
}

function incrementCombo() {
    comboCount++;
    comboTimer = CONFIG.combo.window;
    comboMultiplier = Math.min(CONFIG.combo.maxMultiplier, 1 + Math.floor(comboCount / 3));
    if (comboCount >= 3) {
        document.getElementById('combo-display').textContent = 'COMBO x' + comboMultiplier;
        document.getElementById('combo-display').classList.remove('hidden');
    }
}

function changeWeather() {
    const types = CONFIG.weather.types;
    currentWeather = types[Math.floor(Math.random() * types.length)];
    weather.setWeather(currentWeather);
}

// ============================================
// COLLISION DETECTION
// ============================================
function checkCollision(px, py, pz, pH, obs) {
    const m = obs.mesh;
    const oHalfW = obs.width / 2 + 0.3;
    const oHalfH = obs.height / 2;
    const pHalfW = 0.35;
    const pHalfH = (isSliding ? 0.35 : pH / 2);
    const pCY = py + (isSliding ? 0.35 : pH / 2);
    return Math.abs(px - m.position.x) < (pHalfW + oHalfW) &&
           Math.abs(pCY - m.position.y) < (pHalfH + oHalfH) &&
           Math.abs(pz - m.position.z) < 1.2;
}

function checkNearMiss(px, pz, obs) {
    const m = obs.mesh;
    const dist = Math.sqrt((px - m.position.x) ** 2 + (pz - m.position.z) ** 2);
    return dist < CONFIG.nearMiss.distance + obs.width / 2 && dist > 0.5;
}

function checkCoinCollection(px, py, pz, coin) {
    const c = coin.mesh.position;
    const dx = Math.abs(px - c.x), dy = Math.abs((py + 1) - c.y), dz = Math.abs(pz - c.z);
    if (magnetActive) return dx < 5 && dy < 5 && dz < 5;
    return dx < 1.0 && dy < 1.5 && dz < 1.2;
}

// ============================================
// MAIN GAME LOOP
// ============================================
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    let dt = Math.min(clock.getDelta(), 0.05);
    if (slowMoActive) dt *= 0.4;

    if (gameState === STATE.PLAYING) {
        gameSpeed += (targetSpeed - gameSpeed) * 0.02;
        targetSpeed = Math.min(CONFIG.gameplay.maxSpeed, targetSpeed + CONFIG.gameplay.speedIncrement);
        if (activePowerup === 'slowMo') targetSpeed *= 0.6;

        playerZ -= gameSpeed * dt;
        character.group.position.z = playerZ;
        distance += gameSpeed * dt;

        const targetX = currentLane * CONFIG.gameplay.laneWidth;
        character.group.position.x += (targetX - character.group.position.x) * 10 * dt;
        character.group.rotation.z += (0 - character.group.rotation.z) * 8 * dt;

        if (isJumping) {
            jumpVelocity += CONFIG.gameplay.gravity * dt;
            playerY += jumpVelocity * dt;
            if (playerY <= 0) { playerY = 0; isJumping = false; jumpVelocity = 0; character.setJumping(false); }
        }
        character.group.position.y = playerY;

        if (isSliding) { slideTimer -= dt; if (slideTimer <= 0) { isSliding = false; character.setSliding(false); } }

        character.update(dt, gameSpeed);
        playerLight.position.set(character.group.position.x, 3, playerZ + 2);

        if (CONFIG.character.hasTrail && !isSliding) {
            trail.emit(character.group.position.x, playerY + 0.5, playerZ - 0.5);
        }
        trail.update(dt);

        spawnTimer += dt;
        if (spawnTimer >= CONFIG.obstacles.spawnRate / (gameSpeed / CONFIG.gameplay.baseSpeed)) { spawnTimer = 0; spawnObstacle(); }
        coinSpawnTimer += dt;
        if (coinSpawnTimer >= 0.8) { coinSpawnTimer = 0; if (Math.random() < CONFIG.collectibles.spawnChance) spawnCoin(); }
        powerupTimer += dt;
        if (powerupTimer >= 5) { powerupTimer = 0; if (Math.random() < CONFIG.powerups.spawnChance) spawnPowerup(); }
        speedZoneTimer += dt;
        if (speedZoneTimer >= 8) { speedZoneTimer = 0; if (Math.random() < CONFIG.speedZones.spawnChance) spawnSpeedZone(); }

        weatherTimer += dt;
        if (weatherTimer >= CONFIG.weather.changeInterval) { weatherTimer = 0; changeWeather(); }
        weather.update(dt, currentWeather === 'storm');

        dayNight.update(dt);

        if (distance >= nextBossDistance && !bossActive) {
            bossActive = true;
            boss = createBoss(CONFIG);
            boss.group.position.z = playerZ - 40;
            scene.add(boss.group);
            document.getElementById('boss-health-container').classList.remove('hidden');
            document.getElementById('boss-health-fill').style.width = '100%';
            audio.playBossAlert();
        }

        const pH = 2.0 * CONFIG.character.scale;

        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obs = obstacles[i];

            if (!isSliding && !isJumping && Math.abs(obs.mesh.position.z - playerZ) < 2 && Math.abs(obs.mesh.position.z - playerZ) > 0.5) {
                if (checkNearMiss(character.group.position.x, playerZ, obs)) {
                    score += CONFIG.nearMiss.bonus;
                    audio.playNearMiss();
                }
            }

            if (!isSliding || obs.type !== 'tall') {
                if (checkCollision(character.group.position.x, playerY, playerZ, pH, obs)) {
                    if (shieldActive) {
                        shieldActive = false;
                        character.setShield(false);
                        obs.dispose(obs.mesh);
                        obstacles.splice(i, 1);
                        shakeAmount = 0.2;
                        audio.playCrash();
                        continue;
                    }
                    gameOver();
                    return;
                }
            }

            if (bossActive && boss && Math.abs(obs.mesh.position.z - playerZ) < 3) {
                if (boss.takeDamage()) {
                    explosions.push(createExplosion(scene, CONFIG.boss.color));
                    boss.dispose();
                    boss = null;
                    bossActive = false;
                    nextBossDistance = distance + CONFIG.boss.spawnDistance;
                    score += 500;
                    document.getElementById('boss-health-container').classList.add('hidden');
                    shakeAmount = 0.3;
                }
            }

            if (obs.mesh.position.z > playerZ + 15) {
                scene.remove(obs.mesh);
                obs.mesh.geometry.dispose();
                obs.mesh.material.dispose();
                obstacles.splice(i, 1);
            }
        }

        if (bossActive && boss) {
            document.getElementById('boss-health-fill').style.width = (boss.health / boss.maxHealth * 100) + '%';
            boss.update(dt, gameSpeed);
        }

        for (let i = collectibles.length - 1; i >= 0; i--) {
            const coin = collectibles[i];
            if (checkCoinCollection(character.group.position.x, playerY, playerZ, coin)) {
                incrementCombo();
                const coinVal = CONFIG.collectibles.coinValue * (doubleScoreActive ? 2 : 1) * comboMultiplier;
                coins++; score += coinVal;
                document.getElementById('coins').textContent = coins;
                scene.remove(coin.mesh);
                collectibles.splice(i, 1);
                continue;
            }
            if (coin.mesh.position.z > playerZ + 15) { scene.remove(coin.mesh); collectibles.splice(i, 1); }
        }

        for (let i = powerups.length - 1; i >= 0; i--) {
            const pu = powerups[i];
            const dx = Math.abs(character.group.position.x - pu.mesh.position.x);
            const dy = Math.abs((playerY + 1) - pu.mesh.position.y);
            const dz = Math.abs(playerZ - pu.mesh.position.z);
            if (dx < 1 && dy < 1.5 && dz < 1.5) {
                activatePowerup(pu.type);
                scene.remove(pu.mesh);
                powerups.splice(i, 1);
                continue;
            }
            if (pu.mesh.position.z > playerZ + 15) { scene.remove(pu.mesh); powerups.splice(i, 1); }
        }

        for (let i = speedZones.length - 1; i >= 0; i--) {
            const sz = speedZones[i];
            if (Math.abs(character.group.position.x - sz.mesh.position.x) < 1.5 && Math.abs(playerZ - sz.mesh.position.z) < 2) {
                targetSpeed = CONFIG.gameplay.maxSpeed * CONFIG.speedZones.boostMultiplier;
                setTimeout(() => { targetSpeed = CONFIG.gameplay.maxSpeed; }, CONFIG.speedZones.duration * 1000);
                audio.playSpeedZone();
                scene.remove(sz.mesh);
                speedZones.splice(i, 1);
                continue;
            }
            if (sz.mesh.position.z > playerZ + 15) { scene.remove(sz.mesh); speedZones.splice(i, 1); }
        }

        if (activePowerup) {
            powerupTimerRemaining -= dt;
            document.getElementById('powerup-timer').style.width = (powerupTimerRemaining / CONFIG.powerups.duration * 100) + '%';
            if (powerupTimerRemaining <= 0) deactivatePowerup();
        }

        updateCombo(dt);

        score = Math.floor(distance) + coins * CONFIG.collectibles.coinValue * comboMultiplier;
        document.getElementById('score').textContent = score;

        const sp = ((gameSpeed - CONFIG.gameplay.baseSpeed) / (CONFIG.gameplay.maxSpeed - CONFIG.gameplay.baseSpeed)) * 100;
        document.getElementById('speed-fill').style.width = sp + '%';

        if (shakeAmount > 0) {
            shakeAmount -= dt * 2;
            camera.position.x += (Math.random() - 0.5) * shakeAmount;
            camera.position.y += (Math.random() - 0.5) * shakeAmount;
        }

        if (weather.isLightning()) {
            scene.background.setHex(0xffffff);
            setTimeout(() => scene.background.setHex(CONFIG.world.skyColor), 50);
        }
    }

    skybox.update(dt);

    for (let i = explosions.length - 1; i >= 0; i--) {
        if (!explosions[i].update(dt)) explosions.splice(i, 1);
    }

    if (shakeAmount <= 0) {
        camera.position.x = character.group.position.x * 0.5 + Math.sin(Date.now() * 0.0003) * 0.2;
        camera.position.y = CONFIG.camera.position.y + Math.sin(Date.now() * 0.0005) * 0.1;
    }
    camera.lookAt(character.group.position.x * 0.3, CONFIG.camera.lookAt.y, playerZ - 10);

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

document.getElementById('high-score').textContent = highScore;

// Initialize start.ng player then start game loop
initPlayer();
animate();
