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
        playJump: function() { playTone(300,.15,'square',.2); setTimeout(function(){playTone(500,.1,'square',.15);},50); },
        playSlide: function() { playNoise(.2,.15); },
        playCoin: function(c) { var f=800+(c||0)*100; playTone(f,.1,'sine',.3); setTimeout(function(){playTone(f*1.5,.15,'sine',.25);},60); },
        playPowerup: function() { playTone(400,.1,'sine',.3); setTimeout(function(){playTone(600,.1,'sine',.3);},80); setTimeout(function(){playTone(800,.2,'sine',.3);},160); },
        playCrash: function() { playNoise(.5,.4); playTone(100,.4,'sawtooth',.3); },
        playNearMiss: function() { playTone(1200,.08,'sine',.15); },
        playSpeedZone: function() { playTone(200,.3,'sawtooth',.2); setTimeout(function(){playTone(400,.3,'sawtooth',.2);},100); setTimeout(function(){playTone(800,.4,'sawtooth',.2);},200); },
        playBossAlert: function() { for(var i=0;i<3;i++)(function(idx){setTimeout(function(){playTone(200,.3,'sawtooth',.3);setTimeout(function(){playTone(150,.3,'sawtooth',.3);},150);},idx*300);})(i); },
        playUnlock: function() { [523,659,784,1047].forEach(function(f,i){setTimeout(function(){playTone(f,.3,'sine',.25);},i*120);}); },
        startMusic: function() {
            if (isMusicPlaying) return; isMusicPlaying = true;
            var bass = [55,55,65.4,55,73.4,55,65.4,49]; var ni = 0;
            function bn() { if(!isMusicPlaying)return; var f=bass[ni%bass.length]; var o=ctx.createOscillator(),g=ctx.createGain(); o.type='sawtooth';o.frequency.value=f;g.gain.setValueAtTime(.15,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.3); var fl=ctx.createBiquadFilter();fl.type='lowpass';fl.frequency.value=300;o.connect(fl);fl.connect(g);g.connect(musicGain);o.start(ctx.currentTime);o.stop(ctx.currentTime+.3);ni++;musicTimers.push(setTimeout(bn,350)); }
            bn();
            function hh() { if(!isMusicPlaying)return; var b=ctx.createBuffer(1,ctx.sampleRate*.05,ctx.sampleRate); var d=b.getChannelData(0); for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1; var s=ctx.createBufferSource();s.buffer=b; var g=ctx.createGain();g.gain.setValueAtTime(.05,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.05); var f=ctx.createBiquadFilter();f.type='highpass';f.frequency.value=5000; s.connect(f);f.connect(g);g.connect(musicGain);s.start(ctx.currentTime); musicTimers.push(setTimeout(hh,175)); }
            hh();
        },
        stopMusic: function() { isMusicPlaying=false; musicTimers.forEach(clearTimeout); musicTimers=[]; },
    };
}
