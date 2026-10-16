/**
 * Web Audio API sound effects and background music.
 * All sounds are procedurally generated — no external files needed.
 */
export function createAudio(config) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const masterGain = ctx.createGain();
    masterGain.gain.value = config.audio.masterVolume;
    masterGain.connect(ctx.destination);

    const musicGain = ctx.createGain();
    musicGain.gain.value = config.audio.musicVolume;
    musicGain.connect(masterGain);

    const sfxGain = ctx.createGain();
    sfxGain.gain.value = config.audio.sfxVolume;
    sfxGain.connect(masterGain);

    let musicOsc = null;
    let musicLfo = null;
    let isMusicPlaying = false;

    function resume() {
        if (ctx.state === 'suspended') ctx.resume();
    }

    function playTone(freq, duration, type = 'square', volume = 0.3, dest = null) {
        resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(dest || sfxGain);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
    }

    function playNoise(duration, volume = 0.2) {
        resume();
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(sfxGain);
        source.start(ctx.currentTime);
    }

    return {
        resume,

        playJump() {
            playTone(300, 0.15, 'square', 0.2);
            setTimeout(() => playTone(500, 0.1, 'square', 0.15), 50);
        },

        playSlide() {
            playNoise(0.2, 0.15);
        },

        playCoin(combo = 0) {
            const baseFreq = 800 + combo * 100;
            playTone(baseFreq, 0.1, 'sine', 0.3);
            setTimeout(() => playTone(baseFreq * 1.5, 0.15, 'sine', 0.25), 60);
        },

        playPowerup() {
            playTone(400, 0.1, 'sine', 0.3);
            setTimeout(() => playTone(600, 0.1, 'sine', 0.3), 80);
            setTimeout(() => playTone(800, 0.2, 'sine', 0.3), 160);
        },

        playCrash() {
            playNoise(0.5, 0.4);
            playTone(100, 0.4, 'sawtooth', 0.3);
            playTone(80, 0.5, 'square', 0.2);
        },

        playNearMiss() {
            playTone(1200, 0.08, 'sine', 0.15);
        },

        playSpeedZone() {
            playTone(200, 0.3, 'sawtooth', 0.2);
            setTimeout(() => playTone(400, 0.3, 'sawtooth', 0.2), 100);
            setTimeout(() => playTone(800, 0.4, 'sawtooth', 0.2), 200);
        },

        playBossAlert() {
            for (let i = 0; i < 3; i++) {
                setTimeout(() => playTone(200, 0.3, 'sawtooth', 0.3), i * 300);
                setTimeout(() => playTone(150, 0.3, 'sawtooth', 0.3), i * 300 + 150);
            }
        },

        playBossHit() {
            playTone(150, 0.2, 'square', 0.3);
            playNoise(0.15, 0.2);
        },

        playUnlock() {
            const notes = [523, 659, 784, 1047];
            notes.forEach((freq, i) => {
                setTimeout(() => playTone(freq, 0.3, 'sine', 0.25), i * 120);
            });
        },

        startMusic() {
            if (isMusicPlaying) return;
            isMusicPlaying = true;

            // Simple synthwave bass line
            const bassNotes = [55, 55, 65.4, 55, 73.4, 55, 65.4, 49];
            let noteIdx = 0;

            function playBassNote() {
                if (!isMusicPlaying) return;
                const freq = bassNotes[noteIdx % bassNotes.length];
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 300;
                osc.connect(filter);
                filter.connect(gain);
                gain.connect(musicGain);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.3);
                noteIdx++;
                setTimeout(playBassNote, 350);
            }

            playBassNote();

            // Hi-hat pattern
            function playHiHat() {
                if (!isMusicPlaying) return;
                const bufferSize = ctx.sampleRate * 0.05;
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0.05, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
                const filter = ctx.createBiquadFilter();
                filter.type = 'highpass';
                filter.frequency.value = 5000;
                source.connect(filter);
                filter.connect(gain);
                gain.connect(musicGain);
                source.start(ctx.currentTime);
                setTimeout(playHiHat, 175);
            }

            playHiHat();
        },

        stopMusic() {
            isMusicPlaying = false;
        },

        setMusicVolume(v) {
            musicGain.gain.value = v;
        },

        setSfxVolume(v) {
            sfxGain.gain.value = v;
        },
    };
}
