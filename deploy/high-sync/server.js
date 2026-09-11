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
// Wie lange Apple eine Meldung für ein ausgeschaltetes Handy zurückhält.
// Eine Stunde ist zu knapp – ein Flug, ein Funkloch, und die Erinnerung ist
// weg. Sechs Stunden reichen über den halben Tag, ohne dass eine
// Morgen-Erinnerung nachts noch aufpoppt.
const PUSH_TTL = parseInt(process.env.PUSH_TTL || '21600', 10);
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

// Der Tag der App endet nicht um Mitternacht, sondern um «dayEnd» (Vorgabe
// 03:00): was um 01:00 abgehakt wird, zählt noch zum Vortag. Ohne dieselbe
// Rechnung hier hielte der Dienst zwischen 00:00 und 03:00 jeden Stand für
// veraltet und würde vorsichtshalber erinnern, obwohl alles erledigt ist.
function dayEndOf(plan) {
  const h = plan && Number(plan.dayEnd);
  return Number.isFinite(h) ? Math.min(5, Math.max(0, Math.round(h))) : 0;
}
function appDayKey(now, dayEnd) {
  const d = new Date(now.getTime());
  d.setHours(d.getHours() - dayEnd);
  return localDayKey(d);
}
// Minuten seit Beginn des App-Tages. Damit liegt 00:30 nach 20:00 und nicht
// davor – sonst gälte ein Wecker um 00:30 schon am Nachmittag als überfällig.
function appMinutes(hm, dayEnd) {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(hm || ''));
  if (!m) return null;
  return ((parseInt(m[1], 10) * 60 + parseInt(m[2], 10)) - dayEnd * 60 + 1440) % 1440;
}
function planDayKey(plan, now = new Date()) { return appDayKey(now, dayEndOf(plan)); }

// Zeitgleicher Vergleich, damit sich das Token nicht Zeichen für Zeichen erraten lässt
function safeEqual(a, b) {
  const A = Buffer.from(String(a));
  const B = Buffer.from(String(b));
  if (A.length !== B.length) { crypto.timingSafeEqual(A, A); return false; }
  return crypto.timingSafeEqual(A, B);
}

async function readJson(file, fallback) {
  try { return JSON.parse(await fsp.readFile(file, 'utf8')); }
  catch (e) {
    if (e.code === 'ENOENT') return fallback;
    // Unlesbar heisst nicht leer. Die Datei zur Seite legen und den Fehler nach
    // oben geben – sonst hielte der Dienst einen Datenverlust für einen Neuanfang.
    log('UNLESBAR:', file, e.message);
    const err = new Error('Datei unlesbar: ' + path.basename(file));
    err.code = 'CORRUPT';
    throw err;
  }
}
// Für Nebendateien, deren Verlust verschmerzbar ist (Abos, Versandliste)
async function readJsonSoft(file, fallback) {
  try { return await readJson(file, fallback); }
  catch (e) {
    try { await fsp.rename(file, file + '.kaputt.' + Date.now()); log('beiseitegelegt:', file); } catch (x) {}
    return fallback;
  }
}

// Erst in eine Nebendatei schreiben, dann umbenennen: ein Stromausfall
// mitten im Schreiben kann die vorhandene Datei nicht zerstören.
async function writeJsonAtomic(file, value) {
  const tmp = file + '.' + process.pid + '.tmp';
  const fh = await fsp.open(tmp, 'w');
  try {
    await fh.writeFile(JSON.stringify(value), 'utf8');
    await fh.sync(); // erst wenn die Daten wirklich auf der Platte sind, darf umbenannt werden
  } finally { await fh.close(); }
  await fsp.rename(tmp, file);
  // Auch das Verzeichnis muss den neuen Namen kennen, sonst ist er nach einem
  // Stromausfall wieder weg.
  try { const dir = await fsp.open(path.dirname(file), 'r'); try { await dir.sync(); } finally { await dir.close(); } } catch (e) {}
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
  if (!envelope) return;
  const day = localDayKey();
  const file = path.join(BACKUP_DIR, day + '.json');
  try {
    await fsp.mkdir(BACKUP_DIR, { recursive: true });
    // 'wx' schlägt fehl, wenn es die Kopie schon gibt – eine einmal gesicherte
    // Fassung des Tages darf später nichts mehr überschreiben.
    await fsp.writeFile(file, JSON.stringify(envelope), { encoding: 'utf8', flag: 'wx' });
    const files = (await fsp.readdir(BACKUP_DIR)).filter(f => f.endsWith('.json')).sort();
    for (const old of files.slice(0, Math.max(0, files.length - BACKUP_KEEP))) {
      await fsp.unlink(path.join(BACKUP_DIR, old)).catch(() => {});
    }
  } catch (e) { if (e.code !== 'EEXIST') log('Sicherung fehlgeschlagen:', e.message); }
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
  let url;
  try { url = new URL(req.url, 'http://localhost'); }
  catch (e) { return send(res, 400, { error: 'Unsinnige Adresse' }); }
  const route = url.pathname.replace(/\/+$/, '') || '/';
  const cors = corsHeaders(req);
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); }

  const antwort = (code, body, extra) => send(res, code, body, Object.assign({}, cors, extra || {}));

  if (route === '/health') {
    return antwort(200, Object.assign(
      { ok: true, push: pushBereit, subject: !!VAPID_SUBJECT },
      pushBereit ? {} : { pushFehler: pushFehler || 'unbekannt' },
    ));
  }

  // Der öffentliche Schlüssel ist keine Geheimsache: das Handy braucht ihn zum Anmelden.
  if (route === '/push/key' && req.method === 'GET') return antwort(200, { key: VAPID_PUBLIC || null });

  if (!authorized(req)) {
    log('abgewiesen:', req.method, route, 'von', req.headers['x-forwarded-for'] || req.socket.remoteAddress || '?');
    return antwort(401, { error: 'Nicht angemeldet' });
  }

  try {
    // --- Zustand holen ---
    if (route === '/state' && req.method === 'GET') {
      const env = await readJson(STATE_FILE, null);
      if (!env) return antwort(404, { error: 'Noch nichts abgelegt' });
      // Fragt ein Gerät mit ?device=… , bekommt es dazu die Liste der
      // Erinnerungen, die es heute schon vom Server erhalten hat. Damit zeigt
      // die App sie nicht ein zweites Mal selbst an.
      const wer = url.searchParams.get('device');
      let sent = null;
      if (wer) {
        const v = await readJsonSoft(SENT_FILE, {});
        const tag = planDayKey(env.push || (env.state && env.state.push), new Date());
        const keys = (v.day === tag && v.an && typeof v.an === 'object')
          ? Object.keys(v.an).filter(k => Array.isArray(v.an[k]) && v.an[k].includes(wer))
          : [];
        sent = { day: tag, keys };
      }
      const antw = sent ? Object.assign({}, env, { sent }) : env;
      return antwort(200, antw, { ETag: '"' + env.rev + '"' });
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
      return await serialize(async () => {
        const cur = await readJson(STATE_FILE, null);
        // Ohne Bedingung wird nichts überschrieben: wer nicht sagt, auf welcher
        // Fassung er aufbaut, bekommt die aktuelle und führt im Gerät zusammen.
        if (cur && !wanted) {
          return antwort(409, { error: 'Bedingung fehlt', current: cur }, { ETag: '"' + cur.rev + '"' });
        }
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
        // Erst die bisherige Fassung sichern, dann überschreiben. Die Kopie des
        // Tages entsteht einmal und bleibt danach unangetastet.
        if (cur) await snapshot(cur);
        await writeJsonAtomic(STATE_FILE, env);
        return antwort(200, { rev: env.rev, updatedAt: env.updatedAt }, { ETag: '"' + env.rev + '"' });
      });
    }

    // --- Push-Abo anmelden ---
    if (route === '/push/subscribe' && req.method === 'POST') {
      const body = await readBody(req);
      const sub = body && body.subscription;
      if (!sub || !sub.endpoint) return antwort(400, { error: 'subscription fehlt' });
      const id = String((body && body.deviceId) || crypto.createHash('sha256').update(sub.endpoint).digest('hex').slice(0, 16));
      return await serialize(async () => {
        const subs = await readJsonSoft(SUBS_FILE, {});
        // Dasselbe Gerät darf nur einmal in der Liste stehen. Sonst bekäme es
        // jede Erinnerung doppelt – etwa wenn ein Abo ohne Geräte-Nummer neu
        // angelegt und später mit einer wieder gemeldet wird.
        for (const k of Object.keys(subs)) {
          if (k !== id && subs[k] && subs[k].subscription && subs[k].subscription.endpoint === sub.endpoint) delete subs[k];
        }
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
      return await serialize(async () => {
        const subs = await readJsonSoft(SUBS_FILE, {});
        if (id) delete subs[id];
        else if (body && body.endpoint) for (const k of Object.keys(subs)) if (subs[k].subscription.endpoint === body.endpoint) delete subs[k];
        await writeJsonAtomic(SUBS_FILE, subs);
        return antwort(200, { ok: true, count: Object.keys(subs).length });
      });
    }

    // --- Probe-Erinnerung ---
    if (route === '/push/test' && req.method === 'POST') {
      const r = await sendToAll({ title: 'HIGH', body: 'Probe-Erinnerung vom eigenen Server.', tag: 'high-test' });
      return antwort(200, { sent: r.delivered.length, offen: r.offen });
    }

    return antwort(404, { error: 'Unbekannter Pfad' });
  } catch (e) {
    if (e.code === 'TOO_LARGE') return antwort(413, { error: 'Zu viele Daten' });
    if (e.code === 'BAD_JSON') return antwort(400, { error: 'Kein gültiges JSON' });
    if (e.code === 'CORRUPT') return antwort(500, { error: 'Gespeicherter Zustand ist unlesbar – bitte aus backup/ zurückspielen' });
    log('Fehler:', e.stack || e.message);
    return antwort(500, { error: 'Serverfehler' });
  }
});

// ---------- Erinnerungen ----------
// «Bereit» heisst: web-push hat Schlüssel UND Absenderadresse angenommen.
// Nur zu prüfen, ob die Zeichenketten nicht leer sind, wäre eine Lüge – und
// zwar die eine, auf die beim Einrichten geschaut wird.
let pushBereit = false;
let pushFehler = '';
if (webpush && VAPID_PUBLIC && VAPID_PRIVATE) {
  try {
    webpush.setVapidDetails(VAPID_SUBJECT || 'mailto:hallo@example.com', VAPID_PUBLIC, VAPID_PRIVATE);
    pushBereit = true;
  } catch (e) {
    pushFehler = e.message || String(e);
    log('VAPID-Schlüssel unbrauchbar:', pushFehler);
  }
} else if (webpush) {
  pushFehler = 'VAPID_PUBLIC_KEY oder VAPID_PRIVATE_KEY fehlt';
} else {
  pushFehler = 'web-push ist nicht installiert';
}
if (!VAPID_SUBJECT) log('Hinweis: VAPID_SUBJECT fehlt – Apple lehnt Platzhalter ab. In .env eine echte Adresse eintragen.');

// Schickt an alle angemeldeten Geräte ausser denen in «schon». Zurück kommt,
// welche Geräte die Meldung wirklich angenommen haben – nicht bloss eine Zahl.
// Der Unterschied zählt: bei zwei Geräten darf ein Erfolg nicht dafür sorgen,
// dass das zweite die Erinnerung nie bekommt.
async function sendToAll(payload, schon) {
  if (!pushBereit) { log('Push nicht eingerichtet (' + pushFehler + ') – nichts gesendet.'); return { delivered: [], offen: 0 }; }
  const subs = await readJsonSoft(SUBS_FILE, {});
  const uebersprungen = Array.isArray(schon) ? schon : [];
  const ids = Object.keys(subs).filter(id => !uebersprungen.includes(id));
  if (!ids.length) return { delivered: [], offen: 0 };
  const delivered = [];
  const tot = [];
  let offen = 0;
  for (const id of ids) {
    try {
      await webpush.sendNotification(subs[id].subscription, JSON.stringify(payload), { TTL: PUSH_TTL, urgency: 'high' });
      delivered.push(id);
    } catch (e) {
      const code = e && e.statusCode;
      log('Push fehlgeschlagen für', id, code || e.message);
      // 404/410: das Abo gibt es nicht mehr (App gelöscht, Erlaubnis entzogen).
      // Alles andere ist vorübergehend – beim nächsten Lauf wird es erneut versucht.
      if (code === 404 || code === 410) tot.push(id); else offen++;
    }
  }
  if (tot.length) {
    await serialize(async () => {
      const cur = await readJsonSoft(SUBS_FILE, {});
      tot.forEach(id => delete cur[id]);
      await writeJsonAtomic(SUBS_FILE, cur);
      log('Abgelaufene Abos entfernt:', tot.join(', '));
    });
  }
  return { delivered, offen };
}

// Der Plan kommt aus der App. Aufbau (alles optional):
// state.push = {
//   version: 2,
//   dayEnd: 3,                                      // Uhrzeit, zu der der Tag der App wechselt
//   pause: { from: '2026-09-20', until: '2026-09-27' } | null,
//   morning: { at: '09:00', enabled: true },
//   evening: { at: '20:00', enabled: true },
//   tasks: [ { id, label, emoji, at: '18:30' } ],   // Erinnerungen einzelner Routinen für heute
//   today: { day: '2026-09-11', openRoutines: 2, openLabels: ['Meditieren'], openTodos: 1, doneTaskIds: ['t1'] },
// }
function duePayloads(plan, now) {
  const out = [];
  if (!plan || typeof plan !== 'object') return out;
  const dayEnd = dayEndOf(plan);
  const day = appDayKey(now, dayEnd);
  const jetzt = appMinutes(localHM(now), dayEnd);

  // Ferien: in dieser Zeit ruht in der App alles. Dann hier auch.
  const p = plan.pause;
  if (p && typeof p.from === 'string' && typeof p.until === 'string' && day >= p.from && day <= p.until) return out;

  const today = plan.today && plan.today.day === day ? plan.today : null;
  // Kein Abgleich seit gestern? Dann weiss der Dienst nicht, was erledigt ist –
  // erinnern ist richtig. Lieber einmal zu viel als eine verpasste Routine.
  const stale = !today;
  const openRoutines = today ? (today.openRoutines | 0) : null;
  const openTodos = today ? (today.openTodos | 0) : null;
  const doneIds = today && Array.isArray(today.doneTaskIds) ? today.doneTaskIds : [];

  const passed = (at) => { const m = appMinutes(at, dayEnd); return m !== null && jetzt >= m; };

  if (plan.morning && plan.morning.enabled !== false && passed(plan.morning.at)) {
    if (stale || openRoutines > 0 || openTodos > 0) {
      const teile = [];
      if (!stale && today.openLabels && today.openLabels.length) teile.push(today.openLabels.slice(0, 4).join(' · '));
      if (!stale && openTodos > 0) teile.push(openTodos === 1 ? '1 To-Do fällig' : openTodos + ' To-Dos fällig');
      out.push({
        key: 'morning', day,
        title: stale ? 'Zeit für deine Routinen'
          : openRoutines > 0 ? (openRoutines === 1 ? 'Eine Routine wartet' : openRoutines + ' Routinen warten')
          : 'To-Dos für heute',
        body: teile.length ? teile.join(' · ') : 'Eine reicht, um die Serie zu halten.',
        tag: 'high-morning',
      });
    }
  }

  if (plan.evening && plan.evening.enabled !== false && passed(plan.evening.at)) {
    const offen = [];
    if (stale) offen.push('Heute noch nichts abgehakt');
    else {
      if (openRoutines > 0) offen.push(openRoutines === 1 ? '1 Routine offen' : openRoutines + ' Routinen offen');
      if (openTodos > 0) offen.push(openTodos === 1 ? '1 To-Do offen' : openTodos + ' To-Dos offen');
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
        body: 'Seit ' + t.at + ' offen – jetzt ist ein guter Moment.',
        tag: 'high-task-' + t.id,
      });
    }
  }
  return out;
}

let ticking = false;
let tzGewarnt = '';
async function tick() {
  if (ticking) return;
  ticking = true;
  try {
    let env = null;
    try {
      env = await readJson(STATE_FILE, null);
    } catch (e) {
      if (e.code !== 'CORRUPT') throw e;
      // Der Zustand ist unlesbar. Ohne Rückfallebene kämen ab jetzt gar keine
      // Erinnerungen mehr, und zwar still. Also die neueste Tageskopie nehmen:
      // die Zeiten darin stimmen fast immer noch.
      env = await letzteSicherung();
      log(env ? 'ACHTUNG: state.json unlesbar – Erinnerungen laufen aus der letzten Sicherung.'
              : 'ACHTUNG: state.json unlesbar und keine Sicherung da – es kommen keine Erinnerungen.');
      if (!env) return;
    }
    if (!env) return;
    const plan = env.push || (env.state && env.state.push);
    if (!plan) return;

    // Rechnet der Dienst in einer anderen Zeitzone als das Handy, liegen alle
    // Zeiten daneben. Das einmal sichtbar machen statt still falsch erinnern.
    const hier = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (plan.tz && hier && plan.tz !== hier && tzGewarnt !== plan.tz) {
      tzGewarnt = plan.tz;
      log('ACHTUNG: Zeitzone der App (' + plan.tz + ') weicht von der des Dienstes (' + hier + ') ab – TZ im Container setzen.');
    }

    const now = new Date();
    const due = duePayloads(plan, now);
    const day = planDayKey(plan, now);
    const sent = await readJsonSoft(SENT_FILE, {});
    if (sent.day !== day || !sent.an || typeof sent.an !== 'object') { sent.day = day; sent.an = {}; }
    if (!due.length) return;

    let geaendert = false;
    for (const p of due) {
      const schon = Array.isArray(sent.an[p.key]) ? sent.an[p.key] : [];
      const res = await sendToAll({ title: p.title, body: p.body, tag: p.tag }, schon);
      if (res.delivered.length) {
        sent.an[p.key] = schon.concat(res.delivered);
        geaendert = true;
        log('gesendet:', p.key, '→', res.delivered.length, 'Gerät(e)');
      }
      // Geräte, bei denen es gerade nicht klappte, bleiben ungemerkt: der
      // nächste Lauf in 30 Sekunden versucht es bei genau diesen erneut.
      if (res.offen) log('offen geblieben:', p.key, '·', res.offen, 'Gerät(e) – wird wiederholt');
    }
    if (geaendert) await serialize(() => writeJsonAtomic(SENT_FILE, sent));
  } catch (e) {
    log('Erinnerungslauf fehlgeschlagen:', e.stack || e.message);
  } finally { ticking = false; }
}

// Neueste Tageskopie aus backup/ – nur als Notnagel, wenn state.json hin ist.
async function letzteSicherung() {
  try {
    const files = (await fsp.readdir(BACKUP_DIR)).filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
    for (let i = files.length - 1; i >= 0; i--) {
      try { return JSON.parse(await fsp.readFile(path.join(BACKUP_DIR, files[i]), 'utf8')); } catch (e) {}
    }
  } catch (e) {}
  return null;
}

// ---------- Absturzschutz ----------
// Ein einzelner Fehler darf den Dienst nicht beenden: sonst kommen bis zum
// nächsten Neustart weder Abgleich noch Erinnerungen.
server.on('clientError', (err, socket) => { try { socket.destroy(); } catch (e) {} });
process.on('unhandledRejection', (e) => log('unbehandelt:', (e && e.stack) || e));
process.on('uncaughtException', (e) => log('Ausnahme:', (e && e.stack) || e));

// ---------- Start ----------
// Nur starten, wenn die Datei wirklich der Dienst ist. Wird sie aus einem Test
// heraus geladen, soll sie kein Port belegen und keine Erinnerungen verschicken.
const alsDienst = require.main === module;
(async () => {
  if (!alsDienst) return;
  await fsp.mkdir(DATA_DIR, { recursive: true }).catch(() => {});
  if (!TOKEN) {
    console.error('[high-sync] SYNC_TOKEN fehlt. Ohne Token startet der Dienst nicht.');
    process.exit(1);
  }
  // Gehört der Datenordner root, darf der Container (läuft als «node») nicht
  // hineinschreiben. Ohne diese Probe liefe der Dienst scheinbar sauber, und
  // erst der erste Abgleich am Handy fiele auf die Nase. Lieber gleich laut.
  try {
    const probe = path.join(DATA_DIR, '.schreibprobe');
    await fsp.writeFile(probe, 'ok', 'utf8');
    await fsp.unlink(probe);
  } catch (e) {
    console.error('[high-sync] In', DATA_DIR, 'lässt sich nicht schreiben (' + e.code + ').');
    console.error('[high-sync] Auf dem Server einmal: mkdir -p <Datenordner> && chown -R 1000:1000 <Datenordner>');
    process.exit(1);
  }
  if (!pushBereit) log('Hinweis: es kommen keine Erinnerungen an (' + pushFehler + ') – der Abgleich läuft trotzdem.');
  server.listen(PORT, () => log('bereit auf Port', PORT, '· Daten in', DATA_DIR, '· Zeitzone', Intl.DateTimeFormat().resolvedOptions().timeZone));
  setInterval(tick, 30 * 1000);
  setTimeout(tick, 3000);
})();

// Für den Test importierbar
module.exports = { duePayloads, localDayKey, localHM, appDayKey, appMinutes, planDayKey, dayEndOf };
