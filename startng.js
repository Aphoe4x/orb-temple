/**
 * start.ng integration module.
 * Talks to start.ng's hidden connect page via postMessage.
 */

const START_NG = 'https://start.ng';
let frame;

function connectFrame() {
    frame ??= new Promise((resolve, reject) => {
        const el = document.createElement('iframe');
        el.src = `${START_NG}/connect`;
        el.hidden = true;
        el.onload = () => resolve(el);
        el.onerror = reject;
        document.body.append(el);
    });
    return frame;
}

async function askStartNg(message, replyType, timeoutMs = 5000) {
    const el = await connectFrame();
    return new Promise((resolve) => {
        const requestId = Math.random().toString(36).slice(2);
        const done = (reply) => { clearTimeout(timer); removeEventListener('message', onMessage); resolve(reply); };
        const timer = setTimeout(() => done(null), timeoutMs);
        function onMessage(e) {
            if (e.origin !== START_NG || e.source !== el.contentWindow) return;
            if (e.data?.type === replyType && e.data.requestId === requestId) done(e.data);
        }
        addEventListener('message', onMessage);
        el.contentWindow.postMessage({ ...message, requestId }, START_NG);
    });
}

export async function initStartNg() {
    try {
        const reply = await askStartNg({ type: 'startng:whoami' }, 'startng:user');
        return reply?.user ?? reply?.guest ?? null;
    } catch {
        return null;
    }
}

export async function saveStartNgScore(stats) {
    try {
        const reply = await askStartNg({ type: 'startng:score', stats }, 'startng:scoreSaved');
        return reply;
    } catch {
        return { ok: false, error: 'Network error' };
    }
}

export async function getStartNgLeaderboard(limit = 10) {
    try {
        const reply = await askStartNg({ type: 'startng:leaderboard', limit }, 'startng:leaderboardData');
        return reply;
    } catch {
        return { ok: false, entries: [] };
    }
}

export function signInStartNg() {
    location.href = `https://start.ng/?return_to=${encodeURIComponent(location.origin + location.pathname)}`;
}
