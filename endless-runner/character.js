import * as THREE from 'three';

/**
 * Creates a stylable 3D HUMAN character.
 * Supports start.ng player style (colors, hair, hat, accessory).
 */
export function createCharacter(config) {
    const group = new THREE.Group();
    const char = config.character;

    // Default materials (will be overridden by start.ng style if available)
    const skinMat = new THREE.MeshStandardMaterial({
        color: 0xffcc99, metalness: 0.0, roughness: 0.8,
    });

    const bodyMat = new THREE.MeshStandardMaterial({
        color: char.bodyColor, metalness: 0.3, roughness: 0.4,
        emissive: char.bodyColor, emissiveIntensity: char.emissiveIntensity * 0.3,
    });

    const accentMat = new THREE.MeshStandardMaterial({
        color: char.accentColor, metalness: 0.5, roughness: 0.2,
        emissive: char.accentColor, emissiveIntensity: char.emissiveIntensity,
    });

    const hairMat = new THREE.MeshStandardMaterial({
        color: 0x2a1a0a, metalness: 0.0, roughness: 0.9,
    });

    const visorMat = new THREE.MeshStandardMaterial({
        color: char.visorColor, metalness: 0.7, roughness: 0.1,
        emissive: char.visorColor, emissiveIntensity: 0.5,
    });

    const shoeMat = new THREE.MeshStandardMaterial({
        color: 0x333333, metalness: 0.6, roughness: 0.3,
        emissive: char.accentColor, emissiveIntensity: 0.3,
    });

    // === HEAD ===
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.85;

    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), skinMat);
    skull.scale.set(1, 1.15, 1.05);
    skull.castShadow = true;
    headGroup.add(skull);

    // Hair (varies by style)
    const hairTop = new THREE.Mesh(
        new THREE.SphereGeometry(0.235, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55),
        hairMat
    );
    hairTop.position.y = 0.03;
    hairTop.name = 'hairTop';
    headGroup.add(hairTop);

    const hairBack = new THREE.Mesh(
        new THREE.SphereGeometry(0.225, 12, 12, 0, Math.PI * 2, Math.PI * 0.3, Math.PI * 0.5),
        hairMat
    );
    hairBack.position.set(0, 0.02, -0.03);
    hairBack.name = 'hairBack';
    headGroup.add(hairBack);

    // Eyes
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.3, roughness: 0.2 });
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.035), eyeMat);
    leftEye.position.set(-0.08, 0.02, 0.19);
    headGroup.add(leftEye);
    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.035), eyeMat);
    rightEye.position.set(0.08, 0.02, 0.19);
    headGroup.add(rightEye);

    // Eye glow
    const eyeGlowMat = new THREE.MeshStandardMaterial({
        color: char.accentColor, emissive: char.accentColor, emissiveIntensity: 0.4, transparent: true, opacity: 0.3,
    });
    const leftEyeGlow = new THREE.Mesh(new THREE.SphereGeometry(0.045), eyeGlowMat);
    leftEyeGlow.position.set(-0.08, 0.02, 0.185);
    headGroup.add(leftEyeGlow);
    const rightEyeGlow = new THREE.Mesh(new THREE.SphereGeometry(0.045), eyeGlowMat);
    rightEyeGlow.position.set(0.08, 0.02, 0.185);
    headGroup.add(rightEyeGlow);

    // Mouth
    const mouth = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.01, 0.01),
        new THREE.MeshStandardMaterial({ color: 0xcc6644 })
    );
    mouth.position.set(0, -0.1, 0.2);
    headGroup.add(mouth);

    // Hat (varies by style)
    let hatMesh = null;

    function createHat(style) {
        if (hatMesh) {
            headGroup.remove(hatMesh);
            hatMesh = null;
        }
        const hatType = style?.hat || 'none';
        const hatColor = style?.primaryColor ? new THREE.Color(style.primaryColor) : new THREE.Color(0x333333);
        const hMat = new THREE.MeshStandardMaterial({ color: hatColor, metalness: 0.4, roughness: 0.3 });

        if (hatType === 'cap') {
            hatMesh = new THREE.Group();
            const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.04, 16), hMat);
            brim.position.y = 0.14;
            hatMesh.add(brim);
            const top = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), hMat);
            top.position.y = 0.16;
            hatMesh.add(top);
        } else if (hatType === 'beanie') {
            hatMesh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6), hMat);
            hatMesh.position.y = 0.08;
        } else if (hatType === 'tophat') {
            hatMesh = new THREE.Group();
            const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.02, 16), hMat);
            brim.position.y = 0.14;
            hatMesh.add(brim);
            const top = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.3, 16), hMat);
            top.position.y = 0.3;
            hatMesh.add(top);
        } else if (hatType === 'crown') {
            hatMesh = new THREE.Group();
            const band = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.08, 8), new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.1 }));
            band.position.y = 0.16;
            hatMesh.add(band);
            for (let i = 0; i < 5; i++) {
                const spike = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.1), new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.1 }));
                const angle = (i / 5) * Math.PI * 2;
                spike.position.set(Math.cos(angle) * 0.18, 0.24, Math.sin(angle) * 0.18);
                hatMesh.add(spike);
            }
        }

        if (hatMesh) {
            headGroup.add(hatMesh);
        }
    }

    // Accessory (varies by style)
    let accessoryMesh = null;

    function createAccessory(style) {
        if (accessoryMesh) {
            group.remove(accessoryMesh);
            accessoryMesh = null;
        }
        const accType = style?.accessory || 'none';
        const accColor = style?.secondaryColor ? new THREE.Color(style.secondaryColor) : new THREE.Color(0x888888);
        const aMat = new THREE.MeshStandardMaterial({ color: accColor, metalness: 0.5, roughness: 0.2 });

        if (accType === 'glasses') {
            accessoryMesh = new THREE.Group();
            const lensGeo = new THREE.TorusGeometry(0.06, 0.01, 8, 16);
            const leftLens = new THREE.Mesh(lensGeo, aMat);
            leftLens.position.set(-0.08, 0.02, 0.21);
            accessoryMesh.add(leftLens);
            const rightLens = new THREE.Mesh(lensGeo, aMat);
            rightLens.position.set(0.08, 0.02, 0.21);
            accessoryMesh.add(rightLens);
            const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.01, 0.01), aMat);
            bridge.position.set(0, 0.02, 0.21);
            accessoryMesh.add(bridge);
            headGroup.add(accessoryMesh);
        } else if (accType === 'earrings') {
            accessoryMesh = new THREE.Group();
            const earGeo = new THREE.SphereGeometry(0.03);
            const eMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.1 });
            const leftEar = new THREE.Mesh(earGeo, eMat);
            leftEar.position.set(-0.22, -0.02, 0);
            accessoryMesh.add(leftEar);
            const rightEar = new THREE.Mesh(earGeo, eMat);
            rightEar.position.set(0.22, -0.02, 0);
            accessoryMesh.add(rightEar);
            headGroup.add(accessoryMesh);
        } else if (accType === 'beard') {
            accessoryMesh = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8, 0, Math.PI * 2, Math.PI * 0.4, Math.PI * 0.5), hairMat);
            accessoryMesh.position.set(0, -0.08, 0.12);
            accessoryMesh.scale.set(1, 0.8, 0.6);
            headGroup.add(accessoryMesh);
        } else if (accType === 'scarf') {
            accessoryMesh = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.04, 8, 16), aMat);
            accessoryMesh.position.y = 1.6;
            accessoryMesh.rotation.x = Math.PI / 2;
            group.add(accessoryMesh);
        } else if (accType === 'backpack') {
            accessoryMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 0.15), aMat);
            accessoryMesh.position.set(0, 1.2, -0.25);
            group.add(accessoryMesh);
        }

        if (accessoryMesh && accessoryMesh.parent !== headGroup && accType !== 'scarf' && accType !== 'backpack') {
            // Already added to headGroup
        }
    }

    // Visor/headset
    const visor = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.015, 8, 24, Math.PI), visorMat);
    visor.position.set(0, 0.06, 0.02);
    visor.rotation.x = -0.3;
    headGroup.add(visor);

    group.add(headGroup);

    // === NECK ===
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.1), skinMat);
    neck.position.y = 1.6;
    group.add(neck);

    // === TORSO ===
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 1.15;

    const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.5, 12), bodyMat);
    chest.position.y = 0.2;
    chest.castShadow = true;
    torsoGroup.add(chest);

    const core = new THREE.Mesh(new THREE.SphereGeometry(0.15), accentMat);
    core.position.set(0, 0.35, 0.26);
    core.name = 'core';
    torsoGroup.add(core);

    const chestStripe = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.12, 0.52), accentMat);
    chestStripe.position.y = 0.55;
    torsoGroup.add(chestStripe);

    const shoulderGeo = new THREE.SphereGeometry(0.09);
    const leftShoulder = new THREE.Mesh(shoulderGeo, bodyMat);
    leftShoulder.position.set(-0.2, 0.4, 0);
    torsoGroup.add(leftShoulder);
    const rightShoulder = new THREE.Mesh(shoulderGeo, bodyMat);
    rightShoulder.position.set(0.2, 0.4, 0);
    torsoGroup.add(rightShoulder);

    const emblem = new THREE.Mesh(
        new THREE.CircleGeometry(0.06),
        new THREE.MeshStandardMaterial({ color: char.accentColor, emissive: char.accentColor, emissiveIntensity: 0.8, side: THREE.DoubleSide })
    );
    emblem.position.set(0, 0.25, 0.16);
    torsoGroup.add(emblem);

    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.06, 12), accentMat);
    belt.position.y = -0.05;
    torsoGroup.add(belt);

    group.add(torsoGroup);

    // === ARMS ===
    function createArm(side) {
        const arm = new THREE.Group();
        arm.position.set(side * 0.25, 0.35, 0);

        const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.3, 8), bodyMat);
        upperArm.position.y = -0.15;
        upperArm.castShadow = true;
        arm.add(upperArm);

        const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.05), skinMat);
        elbow.position.y = -0.3;
        arm.add(elbow);

        const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.25, 8), skinMat);
        forearm.position.y = -0.42;
        forearm.castShadow = true;
        arm.add(forearm);

        const wristband = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.04, 8), accentMat);
        wristband.position.y = -0.52;
        arm.add(wristband);

        const hand = new THREE.Mesh(new THREE.SphereGeometry(0.045), skinMat);
        hand.scale.set(0.8, 1.2, 0.8);
        hand.position.y = -0.6;
        arm.add(hand);

        return arm;
    }

    const leftArm = createArm(-1);
    torsoGroup.add(leftArm);
    const rightArm = createArm(1);
    torsoGroup.add(rightArm);

    // === LEGS ===
    function createLeg(side) {
        const leg = new THREE.Group();
        leg.position.set(side * 0.1, -0.05, 0);

        const upperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.35, 8), bodyMat);
        upperLeg.position.y = -0.18;
        upperLeg.castShadow = true;
        leg.add(upperLeg);

        const knee = new THREE.Mesh(new THREE.SphereGeometry(0.06), skinMat);
        knee.position.y = -0.36;
        leg.add(knee);

        const lowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.3, 8), bodyMat);
        lowerLeg.position.y = -0.52;
        lowerLeg.castShadow = true;
        leg.add(lowerLeg);

        const ankleBand = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 8), accentMat);
        ankleBand.position.y = -0.66;
        leg.add(ankleBand);

        const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.07, 0.2), shoeMat);
        shoe.position.set(0, -0.72, 0.04);
        shoe.castShadow = true;
        leg.add(shoe);

        const sole = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.02, 0.2),
            new THREE.MeshStandardMaterial({ color: char.accentColor, emissive: char.accentColor, emissiveIntensity: 0.6 })
        );
        sole.position.set(0, -0.75, 0.04);
        leg.add(sole);

        return leg;
    }

    const leftLeg = createLeg(-1);
    torsoGroup.add(leftLeg);
    const rightLeg = createLeg(1);
    torsoGroup.add(rightLeg);

    // === JETPACK ===
    let jetpack = null;
    if (char.hasJetpack) {
        jetpack = new THREE.Group();
        const tankGeo = new THREE.CapsuleGeometry(0.06, 0.15, 4, 8);
        const tankMat = new THREE.MeshStandardMaterial({ color: 0x888899, metalness: 0.8, roughness: 0.15 });
        const leftTank = new THREE.Mesh(tankGeo, tankMat);
        leftTank.position.set(-0.08, 0, -0.15);
        jetpack.add(leftTank);
        const rightTank = new THREE.Mesh(tankGeo, tankMat);
        rightTank.position.set(0.08, 0, -0.15);
        jetpack.add(rightTank);
        const flameMat = new THREE.MeshStandardMaterial({ color: 0xff4400, emissive: 0xff4400, emissiveIntensity: 1, transparent: true, opacity: 0.8 });
        const leftFlame = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.15), flameMat);
        leftFlame.position.set(-0.08, -0.15, -0.15);
        leftFlame.rotation.x = Math.PI;
        jetpack.add(leftFlame);
        const rightFlame = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.15), flameMat);
        rightFlame.position.set(0.08, -0.15, -0.15);
        rightFlame.rotation.x = Math.PI;
        jetpack.add(rightFlame);
        jetpack.position.set(0, 0.2, 0);
        torsoGroup.add(jetpack);
    }

    // === SHIELD BUBBLE ===
    const shieldMat = new THREE.MeshStandardMaterial({
        color: 0x00ff88, transparent: true, opacity: 0.2,
        emissive: 0x00ff88, emissiveIntensity: 0.5, side: THREE.DoubleSide,
    });
    const shield = new THREE.Mesh(new THREE.SphereGeometry(1.0, 20, 20), shieldMat);
    shield.position.y = 1.0;
    shield.visible = false;
    group.add(shield);

    group.scale.setScalar(char.scale);

    let animTime = 0;
    let isSliding = false;
    let isJumping = false;
    let shieldActive = false;

    // Hair styles
    function updateHair(style) {
        const hairType = style?.hair || 'short';
        const hairColor = style?.hairColor ? new THREE.Color(style.hairColor) : new THREE.Color(0x2a1a0a);
        hairMat.color = hairColor;

        const top = headGroup.getObjectByName('hairTop');
        const back = headGroup.getObjectByName('hairBack');

        if (!top || !back) return;

        // Reset visibility
        top.visible = true;
        back.visible = true;

        if (hairType === 'bald') {
            top.visible = false;
            back.visible = false;
        } else if (hairType === 'short') {
            top.scale.set(1, 0.8, 1);
            back.scale.set(0.8, 0.6, 0.8);
            back.position.set(0, 0.0, -0.05);
        } else if (hairType === 'afro') {
            top.scale.set(1.5, 1.5, 1.5);
            top.position.y = 0.1;
            back.visible = false;
        } else if (hairType === 'braids') {
            top.scale.set(1.1, 0.9, 1.1);
            back.scale.set(1.2, 1.5, 0.8);
            back.position.set(0, -0.1, -0.08);
        } else if (hairType === 'bun') {
            top.scale.set(0.9, 0.7, 0.9);
            back.scale.set(0.8, 0.8, 0.8);
            back.position.set(0, 0.05, -0.12);
        } else if (hairType === 'ponytail') {
            top.scale.set(1, 0.8, 1);
            back.scale.set(0.6, 1.8, 0.6);
            back.position.set(0, 0.0, -0.15);
        } else if (hairType === 'dreads') {
            top.scale.set(1.2, 1.2, 1.2);
            back.scale.set(1.1, 1.3, 0.7);
            back.position.set(0, -0.05, -0.06);
        }
    }

    // Apply start.ng style to character
    function applyStartNgStyle(style) {
        if (!style) return;

        // Colors
        if (style.primaryColor) {
            const c = new THREE.Color(style.primaryColor);
            bodyMat.color = c;
            bodyMat.emissive = c;
            eyeGlowMat.color = c;
            eyeGlowMat.emissive = c;
        }
        if (style.secondaryColor) {
            const c = new THREE.Color(style.secondaryColor);
            accentMat.color = c;
            accentMat.emissive = c;
            shoeMat.emissive = c;
        }
        if (style.skinColor) {
            skinMat.color = new THREE.Color(style.skinColor);
        }

        // Hair
        updateHair(style);

        // Hat
        createHat(style);

        // Accessory
        createAccessory(style);
    }

    return {
        group, leftArm, rightArm, leftLeg, rightLeg, headGroup, visor, jetpack, shield, core,
        applyStartNgStyle,

        update(dt, speed) {
            animTime += dt * (speed * 0.4);

            if (!isJumping && !isSliding) {
                const swing = Math.sin(animTime * 5) * 0.6;
                leftArm.rotation.x = swing;
                rightArm.rotation.x = -swing;
                torsoGroup.rotation.y = Math.sin(animTime * 5) * 0.05;
                leftLeg.rotation.x = -swing * 0.8;
                rightLeg.rotation.x = swing * 0.8;
                torsoGroup.position.y = 1.15 + Math.abs(Math.sin(animTime * 5)) * 0.04;
                headGroup.rotation.x = Math.sin(animTime * 5) * 0.03;
            }

            if (core) core.scale.setScalar(1 + Math.sin(animTime * 5) * 0.2);
            eyeGlowMat.emissiveIntensity = 0.3 + Math.sin(animTime * 4) * 0.15;

            if (shieldActive) {
                shieldMat.opacity = 0.15 + Math.sin(animTime * 8) * 0.08;
                shield.rotation.y += dt * 1.5;
            }

            if (jetpack) {
                jetpack.children.forEach(c => {
                    if (c.geometry && c.geometry.type === 'ConeGeometry') c.scale.y = 0.7 + Math.random() * 0.5;
                });
            }
        },

        setSliding(val) {
            isSliding = val;
            if (val) {
                torsoGroup.position.y = 0.7;
                group.scale.y = char.scale * 0.65;
                group.position.y = -0.25 * char.scale;
                leftArm.rotation.x = -1.5;
                rightArm.rotation.x = -1.5;
                leftLeg.rotation.x = 1.2;
                rightLeg.rotation.x = 1.2;
                headGroup.rotation.x = 0.4;
            } else {
                torsoGroup.position.y = 1.15;
                group.scale.y = char.scale;
                group.position.y = 0;
                leftArm.rotation.x = 0;
                rightArm.rotation.x = 0;
                leftLeg.rotation.x = 0;
                rightLeg.rotation.x = 0;
                headGroup.rotation.x = 0;
            }
        },

        setJumping(val) { isJumping = val; },
        setShield(val) { shieldActive = val; shield.visible = val; },

        setSkin(skinConfig) {
            bodyMat.color.setHex(skinConfig.bodyColor);
            bodyMat.emissive.setHex(skinConfig.bodyColor);
            accentMat.color.setHex(skinConfig.accentColor);
            accentMat.emissive.setHex(skinConfig.accentColor);
            shoeMat.emissive.setHex(skinConfig.accentColor);
        },

        reset() {
            group.position.set(0, 0, 0);
            group.scale.set(char.scale, char.scale, char.scale);
            group.rotation.set(0, 0, 0);
            torsoGroup.position.y = 1.15;
            torsoGroup.rotation.set(0, 0, 0);
            leftArm.rotation.x = 0;
            rightArm.rotation.x = 0;
            leftLeg.rotation.x = 0;
            rightLeg.rotation.x = 0;
            headGroup.rotation.x = 0;
            isSliding = false;
            isJumping = false;
            shieldActive = false;
            shield.visible = false;
            animTime = 0;
        }
    };
}
