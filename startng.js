var START_NG = 'https://start.ng';
var _snFrame = null;
function connectFrame() {
    if (_snFrame) return _snFrame;
    _snFrame = new Promise(function(res, rej) {
        var el = document.createElement('iframe'); el.src = START_NG + '/connect'; el.hidden = true;
        el.onload = function() { res(el); }; el.onerror = rej; document.body.appendChild(el);
    });
    return _snFrame;
}
function askStartNg(msg, type, timeout) {
    timeout = timeout || 5000;
    return connectFrame().then(function(el) {
        return new Promise(function(resolve) {
            var rid = Math.random().toString(36).slice(2);
            var done = function(r) { clearTimeout(t); removeEventListener('message', h); resolve(r); };
            var t = setTimeout(function() { done(null); }, timeout);
            function h(e) { if (e.origin !== START_NG || e.source !== el.contentWindow) return; if (e.data && e.data.type === type && e.data.requestId === rid) done(e.data); }
            addEventListener('message', h);
            el.contentWindow.postMessage(Object.assign({}, msg, { requestId: rid }), START_NG);
        });
    });
}
function initStartNg() { return askStartNg({ type: 'startng:whoami' }, 'startng:user').then(function(r) { return (r && r.user) || (r && r.guest) || null; }).catch(function() { return null; }); }
function saveStartNgScore(stats) { return askStartNg({ type: 'startng:score', stats: stats }, 'startng:scoreSaved').catch(function() { return { ok: false }; }); }
function signInStartNg() { location.href = START_NG + '/?return_to=' + encodeURIComponent(location.origin + location.pathname); }
