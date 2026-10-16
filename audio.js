function createAudio(config) {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    var masterGain = ctx.createGain();
    masterGain.gain.value = config.audio.masterVolume;
    masterGain.connect(ctx.destination);
    var musicGain = ctx.createGain();
    musicGain.gain.value = config.audio.musicVolume;
    musicGain.connect(masterGain);
    var sfxGain = ctx.createGain();
    sfxGain.gain.value = config.audio.sfxVolume;
    sfxGain.connect(masterGain);
    var isMusicPlaying = false;
    var musicTimers = [];

    function resume() { if (ctx.state === 'suspended') ctx.resume(); }

    function playTone(freq, duration, type, volume, dest) {
        resume();
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = type || 'square';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(volume || 0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain); gain.connect(dest || sfxGain);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + duration);
    }

    function playNoise(duration, volume) {
        resume();
        var bufferSize = ctx.sampleRate * duration;
        var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        var source = ctx.createBufferSource();
        source.buffer = buffer;
        var gain = ctx.createGain();
        gain.gain.setValueAtTime(volume || 0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        var filter = ctx.createBiquadFilter();
        filter.type = 'highpass'; filter.frequency.value = 1000;
        source.connect(filter); filter.connect(gain); gain.connect(sfxGain);
        source.start(ctx.currentTime);
    }

    return {
        resume: resume,
        playJump: function() { playTone(300, 0.15, 'square', 0.2); setTimeout(function() { playTone(500, 0.1, 'square', 0.15); }, 50); },
        playSlide: function() { playNoise(0.2, 0.15); },
        playCoin: function(combo) { var f = 800 + (combo || 0) * 100; playTone(f, 0.1, 'sine', 0.3); setTimeout(function() { playTone(f * 1.5, 0.15, 'sine', 0.25); }, 60); },
        playPowerup: function() { playTone(400, 0.1, 'sine', 0.3); setTimeout(function() { playTone(600, 0.1, 'sine', 0.3); }, 80); setTimeout(function() { playTone(800, 0.2, 'sine', 0.3); }, 160); },
        playCrash: function() { playNoise(0.5, 0.4); playTone(100, 0.4, 'sawtooth', 0.3); },
        playNearMiss: function() { playTone(1200, 0.08, 'sine', 0.15); },
        playSpeedZone: function() { playTone(200, 0.3, 'sawtooth', 0.2); setTimeout(function() { playTone(400, 0.3, 'sawtooth', 0.2); }, 100); setTimeout(function() { playTone(800, 0.4, 'sawtooth', 0.2); }, 200); },
        playBossAlert: function() { for (var i = 0; i < 3; i++) { (function(idx) { setTimeout(function() { playTone(200, 0.3, 'sawtooth', 0.3); setTimeout(function() { playTone(150, 0.3, 'sawtooth', 0.3); }, 150); }, idx * 300); })(i); } },
        playUnlock: function() { var n = [523, 659, 784, 1047]; n.forEach(function(f, i) { setTimeout(function() { playTone(f, 0.3, 'sine', 0.25); }, i * 120); }); },
        startMusic: function() {
            if (isMusicPlaying) return;
            isMusicPlaying = true;
            var bassNotes = [55, 55, 65.4, 55, 73.4, 55, 65.4, 49];
            var noteIdx = 0;
            function playBassNote() {
                if (!isMusicPlaying) return;
                var freq = bassNotes[noteIdx % bassNotes.length];
                var osc = ctx.createOscillator(); var gain = ctx.createGain();
                osc.type = 'sawtooth'; osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                var filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 300;
                osc.connect(filter); filter.connect(gain); gain.connect(musicGain);
                osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
                noteIdx++;
                musicTimers.push(setTimeout(playBassNote, 350));
            }
            playBassNote();
            function playHiHat() {
                if (!isMusicPlaying) return;
                var buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
                var d = buf.getChannelData(0);
                for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
                var src = ctx.createBufferSource(); src.buffer = buf;
                var g = ctx.createGain(); g.gain.setValueAtTime(0.05, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
                var f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 5000;
                src.connect(f); f.connect(g); g.connect(musicGain);
                src.start(ctx.currentTime);
                musicTimers.push(setTimeout(playHiHat, 175));
            }
            playHiHat();
        },
        stopMusic: function() { isMusicPlaying = false; musicTimers.forEach(clearTimeout); musicTimers = []; },
    };
}
