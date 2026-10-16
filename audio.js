function createAudio(config) {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    var masterGain = ctx.createGain(); masterGain.gain.value = config.audio.masterVolume; masterGain.connect(ctx.destination);
    var musicGain = ctx.createGain(); musicGain.gain.value = config.audio.musicVolume; musicGain.connect(masterGain);
    var sfxGain = ctx.createGain(); sfxGain.gain.value = config.audio.sfxVolume; sfxGain.connect(masterGain);
    var isMusicPlaying = false; var musicTimers = [];
    function resume() { if (ctx.state === 'suspended') ctx.resume(); }
    function playTone(freq, dur, type, vol) {
        resume(); var osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = type || 'square'; osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol || .3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + dur);
        osc.connect(gain); gain.connect(sfxGain); osc.start(ctx.currentTime); osc.stop(ctx.currentTime + dur);
    }
    function playNoise(dur, vol) {
        resume(); var buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate); var d = buf.getChannelData(0);
        for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        var src = ctx.createBufferSource(); src.buffer = buf;
        var g = ctx.createGain(); g.gain.setValueAtTime(vol || .2, ctx.currentTime); g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + dur);
        var f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1000;
        src.connect(f); f.connect(g); g.connect(sfxGain); src.start(ctx.currentTime);
    }
    return {
        resume: resume,
        playShoot: function() { playTone(600,.1,'square',.2); setTimeout(function(){playTone(800,.08,'square',.15);},30); },
        playMatch: function(combo) { var f=400+(combo||0)*100; playTone(f,.15,'sine',.3); setTimeout(function(){playTone(f*1.5,.2,'sine',.25);},80); setTimeout(function(){playTone(f*2,.25,'sine',.2);},160); },
        playExplosion: function() { playNoise(.3,.3); playTone(200,.3,'sawtooth',.2); },
        playLevelUp: function() { [523,659,784,1047,1319].forEach(function(f,i){setTimeout(function(){playTone(f,.3,'sine',.25);},i*100);}); },
        playGameOver: function() { playTone(400,.5,'sawtooth',.3); setTimeout(function(){playTone(300,.5,'sawtooth',.3);},300); setTimeout(function(){playTone(200,.8,'sawtooth',.3);},600); },
        startMusic: function() {
            if (isMusicPlaying) return; isMusicPlaying = true;
            var bass = [55,55,65.4,55,73.4,55,65.4,49]; var ni = 0;
            function bn() { if(!isMusicPlaying)return; var f=bass[ni%bass.length]; var o=ctx.createOscillator(),g=ctx.createGain(); o.type='sawtooth';o.frequency.value=f;g.gain.setValueAtTime(.12,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.3); var fl=ctx.createBiquadFilter();fl.type='lowpass';fl.frequency.value=250;o.connect(fl);fl.connect(g);g.connect(musicGain);o.start(ctx.currentTime);o.stop(ctx.currentTime+.3);ni++;musicTimers.push(setTimeout(bn,400)); }
            bn();
        },
        stopMusic: function() { isMusicPlaying=false; musicTimers.forEach(clearTimeout); musicTimers=[]; },
    };
}
