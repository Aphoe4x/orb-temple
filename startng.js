var START_NG = 'https://start.ng';
var _startNgFrame = null;

function connectFrame() {
    if (_startNgFrame) return _startNgFrame;
    _startNgFrame = new Promise(function(resolve, reject) {
        var el = document.createElement('iframe');
        el.src = START_NG + '/connect';
        el.hidden = true;
        el.onload = function() { resolve(el); };
        el.onerror = reject;
        document.body.appendChild(el);
    });
    return _startNgFrame;
}

function askStartNg(message, replyType, timeoutMs) {
    timeoutMs = timeoutMs || 5000;
    return connectFrame().then(function(el) {
        return new Promise(function(resolve) {
            var requestId = Math.random().toString(36).slice(2);
            var done = function(reply) { clearTimeout(timer); removeEventListener('message', onMessage); resolve(reply); };
            var timer = setTimeout(function() { done(null); }, timeoutMs);
            function onMessage(e) {
                if (e.origin !== START_NG || e.source !== el.contentWindow) return;
                if (e.data && e.data.type === replyType && e.data.requestId === requestId) done(e.data);
            }
            addEventListener('message', onMessage);
            el.contentWindow.postMessage(Object.assign({}, message, { requestId: requestId }), START_NG);
        });
    });
}

function initStartNg() {
    return askStartNg({ type: 'startng:whoami' }, 'startng:user').then(function(reply) {
        return (reply && reply.user) || (reply && reply.guest) || null;
    }).catch(function() { return null; });
}

function saveStartNgScore(stats) {
    return askStartNg({ type: 'startng:score', stats: stats }, 'startng:scoreSaved').catch(function() { return { ok: false }; });
}

function signInStartNg() {
    location.href = START_NG + '/?return_to=' + encodeURIComponent(location.origin + location.pathname);
}
