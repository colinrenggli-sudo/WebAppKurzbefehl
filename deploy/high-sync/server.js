// =====================================================================
// HIGH – Abgleich und Erinnerungen auf dem eigenen Server
//
// Zwei Aufgaben, mehr nicht:
//   1. Den Zustand der App halten (eine JSON-Datei) und ihn Geräten
//      geben und abnehmen. Zusammengeführt wird im Gerät, nicht hier.
//   2. Zur richtigen Zeit eine Push-Nachricht ans iPhone schicken.
//
// Absichtlich dumm: der Server rechnet nichts über Routinen. Die App
// legt bei jedem Abgleich einen kleinen Erinnerungsplan in den Zustand,
// der Server liest nur ab, was wann fällig ist und ob noch etwas offen
// ist. Damit gibt es die Regeln nur an einer Stelle.
//
// Läuft ohne offene Ports nach aussen: Push geht ausgehend an Apple.
// Erreichbar sein muss der Dienst nur für das eigene Handy, dafür
// sorgt der Cloudflare Tunnel vor nginx.
// =====================================================================
'use strict';

const http = require('http');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

let webpush = null;
try { webpush = require('web-push'); } catch (e) { console.warn('[high-sync] web-push fehlt – Erinnerungen sind aus.'); }

const PORT = parseInt(process.env.PORT || '8090', 10);
const DATA_DIR = process.env.DATA_DIR || '/data';
const TOKEN = process.env.SYNC_TOKEN || '';
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || '';
const MAX_BODY = 8 * 1024 * 1024; // 8 MB – der Zustand ist ein Bruchteil davon
const BACKUP_KEEP = parseInt(process.env.BACKUP_KEEP || '60', 10);
// Normalerweise leer: hinter nginx liegen App und Dienst auf derselben Herkunft,
// dann braucht es kein CORS. Nur für Tests oder eine App auf fremder Adresse setzen.
const ALLOW_ORIGIN = (process.env.ALLOW_ORIGIN || '').split(',').map(x => x.trim()).filter(Boolean);

const STATE_FILE = path.join(DATA_DIR, 'state.json');
const SUBS_FILE = path.join(DATA_DIR, 'subscriptions.json');
const SENT_FILE = path.join(DATA_DIR, 'sent.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backup');

// ---------- kleine Helfer ----------
const log = (...a) => console.log(new Date().toISOString(), '[high-sync]', ...a);

function pad2(n) { return String(n).padStart(2, '0'); }
function localDayKey(d = new Date()) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function localHM(d = new Date()) { return pad2(d.getHours()) + ':' + pad2(d.getMinutes()); }

// Zeitgleicher Vergleich, damit sich das Token nicht Zeichen für Zeichen erraten lässt
function safeEqual(a, b) {
  const A = Buffer.from(String(a));
  const B = Buffer.from(String(b));
  if (A.length !== B.length) { crypto.timingSafeEqual(A, A); return false; }
  return crypto.timingSafeEqual(A, B);
}

async function readJson(file, fallback) {
  try { return JSON.parse(await fsp.readFile(file, 'utf8')); }
  catch (e) { if (e.code !== 'ENOENT') log('Lesen fehlgeschlagen:', file, e.message); return fallback; }
}

// Erst in eine Nebendatei schreiben, dann umbenennen: ein Stromausfall
// mitten im Schreiben kann die vorhandene Datei nicht zerstören.
async function writeJsonAtomic(file, value) {
  const tmp = file + '.' + process.pid + '.tmp';
  await fsp.writeFile(tmp, JSON.stringify(value), 'utf8');
  await fsp.rename(tmp, file);
}

// Schreibzugriffe hintereinander abarbeiten, damit sich zwei Anfragen nicht überholen
let queue = Promise.resolve();
function serialize(fn) {
  const next = queue.then(fn, fn);
  queue = next.catch(() => {});
  return next;
}

// ---------- Sicherung ----------
// Eine Kopie pro Tag, damit ein kaputter Abgleich nicht die einzige Fassung ist.
async function snapshot(envelope) {
  const day = localDayKey();
  const file = path.join(BACKUP_DIR, day + '.json');
  try {
    await fsp.mkdir(BACKUP_DIR, { recursive: true });
    await fsp.writeFile(file, JSON.stringify(envelope), 'utf8');
    const files = (await fsp.readdir(BACKUP_DIR)).filter(f => f.endsWith('.json')).sort();
    for (const old of files.slice(0, Math.max(0, files.length - BACKUP_KEEP))) {
      await fsp.unlink(path.join(BACKUP_DIR, old)).catch(() => {});
    }
  } catch (e) { log('Sicherung fehlgeschlagen:', e.message); }
}

// ---------- HTTP ----------
function send(res, code, body, extra) {
  const data = body === undefined ? '' : JSON.stringify(body);
  res.writeHead(code, Object.assign({
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(data),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  }, extra || {}));
  res.end(data);
}

function authorized(req) {
  if (!TOKEN) return false;
  const h = req.headers.authorization || '';
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  return !!m && safeEqual(m[1].trim(), TOKEN);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (size > MAX_BODY) { reject(Object.assign(new Error('zu gross'), { code: 'TOO_LARGE' })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve(null);
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch (e) { reject(Object.assign(new Error('kein gültiges JSON'), { code: 'BAD_JSON' })); }
    });
    req.on('error', reject);
  });
}

function corsHeaders(req) {
  const origin = req.headers.origin;
  if (!origin || !ALLOW_ORIGIN.includes(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, If-Match',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
    'Access-Control-Expose-Headers': 'ETag',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const route = url.pathname.replace(/\/+$/, '') || '/';
  const cors = corsHeaders(req);
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); }

  const antwort = (code, body, extra) => send(res, code, body, Object.assign({}, cors, extra || {}));

  if (route === '/health') return antwort(200, { ok: true, push: !!(webpush && VAPID_PUBLIC && VAPID_PRIVATE) });

  // Der öffentliche Schlüssel ist keine Geheimsache: das Handy braucht ihn zum Anmelden.
  if (route === '/push/key' && req.method === 'GET') return antwort(200, { key: VAPID_PUBLIC || null });

  if (!authorized(req)) return antwort(401, { error: 'Nicht angemeldet' });

  try {
    // --- Zustand holen ---
    if (route === '/state' && req.method === 'GET') {
      const env = await readJson(STATE_FILE, null);
      if (!env) return antwort(404, { error: 'Noch nichts abgelegt' });
      return antwort(200, env, { ETag: '"' + env.rev + '"' });
    }

    // --- Zustand ablegen ---
    // If-Match schützt vor dem Überholen: wer eine veraltete Fassung schickt,
    // bekommt die aktuelle zurück und führt im Gerät zusammen.
    if (route === '/state' && (req.method === 'PUT' || req.method === 'POST')) {
      const body = await readBody(req);
      if (!body || typeof body !== 'object' || typeof body.state !== 'object' || !body.state) {
        return antwort(400, { error: 'state fehlt' });
      }
      const wanted = String(req.headers['if-match'] || '').replace(/"/g, '').trim();
      return serialize(async () => {
        const cur = await readJson(STATE_FILE, null);
        if (cur && wanted && wanted !== '*' && wanted !== String(cur.rev)) {
          return antwort(409, { error: 'Zwischendurch geändert', current: cur }, { ETag: '"' + cur.rev + '"' });
        }
        const env = {
          rev: (cur ? cur.rev : 0) + 1,
          updatedAt: Date.now(),
          device: typeof body.device === 'string' ? body.device.slice(0, 60) : null,
          // Der Erinnerungsplan liegt neben dem Zustand, nicht darin: so muss das
          // Zusammenführen im Gerät nichts davon wissen.
          push: (body.push && typeof body.push === 'object') ? body.push : (cur ? cur.push : null),
          state: body.state,
        };
        await writeJsonAtomic(STATE_FILE, env);
        const prevDay = cur ? localDayKey(new Date(cur.updatedAt)) : null;
        if (prevDay !== localDayKey()) await snapshot(env);
        return antwort(200, { rev: env.rev, updatedAt: env.updatedAt }, { ETag: '"' + env.rev + '"' });
      });
    }

    // --- Push-Abo anmelden ---
    if (route === '/push/subscribe' && req.method === 'POST') {
      const body = await readBody(req);
      const sub = body && body.subscription;
      if (!sub || !sub.endpoint) return antwort(400, { error: 'subscription fehlt' });
      const id = String((body && body.deviceId) || crypto.createHash('sha256').update(sub.endpoint).digest('hex').slice(0, 16));
      return serialize(async () => {
        const subs = await readJson(SUBS_FILE, {});
        subs[id] = { subscription: sub, label: String((body && body.label) || '').slice(0, 60), updatedAt: Date.now() };
        await writeJsonAtomic(SUBS_FILE, subs);
        log('Abo gespeichert:', id, subs[id].label);
        return antwort(200, { ok: true, deviceId: id, count: Object.keys(subs).length });
      });
    }

    // --- Push-Abo abmelden ---
    if (route === '/push/subscribe' && req.method === 'DELETE') {
      const body = await readBody(req).catch(() => null);
      const id = body && body.deviceId;
      return serialize(async () => {
        const subs = await readJson(SUBS_FILE, {});
        if (id) delete subs[id];
        else if (body && body.endpoint) for (const k of Object.keys(subs)) if (subs[k].subscription.endpoint === body.endpoint) delete subs[k];
        await writeJsonAtomic(SUBS_FILE, subs);
        return antwort(200, { ok: true, count: Object.keys(subs).length });
      });
    }

    // --- Probe-Erinnerung ---
    if (route === '/push/test' && req.method === 'POST') {
      const n = await sendToAll({ title: 'HIGH', body: 'Probe-Erinnerung vom eigenen Server.', tag: 'high-test' });
      return antwort(200, { sent: n });
    }

    return antwort(404, { error: 'Unbekannter Pfad' });
  } catch (e) {
    if (e.code === 'TOO_LARGE') return antwort(413, { error: 'Zu viele Daten' });
    if (e.code === 'BAD_JSON') return antwort(400, { error: 'Kein gültiges JSON' });
    log('Fehler:', e.stack || e.message);
    return antwort(500, { error: 'Serverfehler' });
  }
});

// ---------- Erinnerungen ----------
if (webpush && VAPID_PUBLIC && VAPID_PRIVATE) {
  try {
    webpush.setVapidDetails(VAPID_SUBJECT || 'mailto:hallo@example.com', VAPID_PUBLIC, VAPID_PRIVATE);
  } catch (e) { log('VAPID-Schlüssel unbrauchbar:', e.message); }
}

async function sendToAll(payload) {
  if (!webpush || !VAPID_PUBLIC || !VAPID_PRIVATE) { log('Push nicht eingerichtet – nichts gesendet.'); return 0; }
  const subs = await readJson(SUBS_FILE, {});
  const ids = Object.keys(subs);
  if (!ids.length) return 0;
  let ok = 0;
  const tot = [];
  for (const id of ids) {
    try {
      await webpush.sendNotification(subs[id].subscription, JSON.stringify(payload), { TTL: 3600, urgency: 'high' });
      ok++;
    } catch (e) {
      const code = e && e.statusCode;
      log('Push fehlgeschlagen für', id, code || e.message);
      // 404/410: das Abo gibt es nicht mehr (App gelöscht, Erlaubnis entzogen)
      if (code === 404 || code === 410) tot.push(id);
    }
  }
  if (tot.length) {
    await serialize(async () => {
      const cur = await readJson(SUBS_FILE, {});
      tot.forEach(id => delete cur[id]);
      await writeJsonAtomic(SUBS_FILE, cur);
      log('Abgelaufene Abos entfernt:', tot.join(', '));
    });
  }
  return ok;
}

// Der Plan kommt aus der App. Aufbau (alles optional):
// state.push = {
//   version: 1,
//   morning: { at: '07:30', enabled: true },
//   evening: { at: '20:00', enabled: true },
//   tasks: [ { id, label, emoji, at: '18:30' } ],   // Erinnerungen einzelner Routinen für heute
//   today: { day: '2026-09-11', openRoutines: 2, openLabels: ['Meditieren'], openTodos: 1, doneTaskIds: ['t1'] },
// }
function duePayloads(plan, now) {
  const out = [];
  if (!plan || typeof plan !== 'object') return out;
  const hm = localHM(now), day = localDayKey(now);
  const today = plan.today && plan.today.day === day ? plan.today : null;
  // Kein Abgleich seit gestern? Dann kann heute nichts erledigt sein – erinnern ist richtig.
  const stale = !today;
  const openRoutines = today ? (today.openRoutines | 0) : null;
  const openTodos = today ? (today.openTodos | 0) : null;
  const doneIds = today && Array.isArray(today.doneTaskIds) ? today.doneTaskIds : [];

  const passed = (at) => typeof at === 'string' && /^\d{2}:\d{2}$/.test(at) && hm >= at;

  if (plan.morning && plan.morning.enabled !== false && passed(plan.morning.at)) {
    if (stale || openRoutines > 0) {
      out.push({
        key: 'morning', day,
        title: stale ? 'Zeit für deine Routinen' : (openRoutines === 1 ? 'Eine Routine wartet' : `${openRoutines} Routinen warten`),
        body: !stale && today.openLabels && today.openLabels.length ? today.openLabels.slice(0, 4).join(' · ') : 'Eine reicht, um die Serie zu halten.',
        tag: 'high-morning',
      });
    }
  }

  if (plan.evening && plan.evening.enabled !== false && passed(plan.evening.at)) {
    const offen = [];
    if (stale) offen.push('Heute noch nichts abgehakt');
    else {
      if (openRoutines > 0) offen.push(openRoutines === 1 ? '1 Routine offen' : `${openRoutines} Routinen offen`);
      if (openTodos > 0) offen.push(openTodos === 1 ? '1 To-Do offen' : `${openTodos} To-Dos offen`);
    }
    if (offen.length) {
      out.push({
        key: 'evening', day,
        title: 'Abend-Check',
        body: offen.join(' · ') + (stale ? '' : ' – die Mini-Version zählt auch.'),
        tag: 'high-evening',
      });
    }
  }

  // Einzelne Routinen nur erinnern, solange überhaupt noch etwas offen ist.
  if (Array.isArray(plan.tasks) && (stale || openRoutines > 0)) {
    for (const t of plan.tasks) {
      if (!t || !t.id || !passed(t.at)) continue;
      if (!stale && doneIds.includes(t.id)) continue;
      out.push({
        key: 'task:' + t.id, day,
        title: (t.emoji ? t.emoji + ' ' : '') + (t.label || 'Routine'),
        body: `Seit ${t.at} offen – jetzt ist ein guter Moment.`,
        tag: 'high-task-' + t.id,
      });
    }
  }
  return out;
}

let ticking = false;
async function tick() {
  if (ticking) return;
  ticking = true;
  try {
    const env = await readJson(STATE_FILE, null);
    if (!env) return;
    const due = duePayloads(env.push || (env.state && env.state.push), new Date());
    if (!due.length) return;
    const sent = await readJson(SENT_FILE, {});
    const day = localDayKey();
    if (sent.day !== day) { sent.day = day; sent.keys = []; }
    const fresh = due.filter(d => !sent.keys.includes(d.key));
    if (!fresh.length) return;
    for (const p of fresh) {
      const n = await sendToAll({ title: p.title, body: p.body, tag: p.tag, url: process.env.APP_URL || '/' });
      log('gesendet:', p.key, '→', n, 'Gerät(e)');
      if (n > 0) sent.keys.push(p.key);
    }
    await serialize(() => writeJsonAtomic(SENT_FILE, sent));
  } catch (e) {
    log('Erinnerungslauf fehlgeschlagen:', e.stack || e.message);
  } finally { ticking = false; }
}

// ---------- Start ----------
(async () => {
  await fsp.mkdir(DATA_DIR, { recursive: true }).catch(() => {});
  if (!TOKEN) {
    console.error('[high-sync] SYNC_TOKEN fehlt. Ohne Token startet der Dienst nicht.');
    process.exit(1);
  }
  if (!(webpush && VAPID_PUBLIC && VAPID_PRIVATE)) log('Hinweis: ohne VAPID-Schlüssel läuft der Abgleich, aber es kommen keine Erinnerungen.');
  server.listen(PORT, () => log('bereit auf Port', PORT, '· Daten in', DATA_DIR, '· Zeitzone', Intl.DateTimeFormat().resolvedOptions().timeZone));
  setInterval(tick, 30 * 1000);
  setTimeout(tick, 3000);
})();

// Für den Test importierbar
module.exports = { duePayloads, localDayKey, localHM };
