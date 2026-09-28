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

// ---------- Konten ----------
// Wer ein Konto hat, bekommt einen eigenen Datensatz unter k/<uid>/.
// Solange niemand eines angelegt hat, liegt alles wie bisher direkt im
// Datenordner – ein Server ohne Konten verhält sich also unverändert.
const KONTEN_FILE = path.join(DATA_DIR, 'konten.json');
const SITZUNGEN_FILE = path.join(DATA_DIR, 'sitzungen.json');
const EINLADUNGEN_FILE = path.join(DATA_DIR, 'einladungen.json');
const KONTEN_DIR = path.join(DATA_DIR, 'k');
// Ein Jahr. Eine Anmeldung, die nach Tagen abläuft, wäre auf dem Handy die
// häufigste Ursache für einen still stehenden Abgleich.
const SITZUNG_TAGE = parseInt(process.env.SITZUNG_TAGE || '365', 10);
const COOKIE_NAME = 'high_sitzung';
// Registrieren geht nur mit Code. Ohne diesen Riegel könnte sich jeder, der
// die Adresse kennt, auf einem fremden Heimserver ein Konto anlegen.
// Vorgabe ist der SYNC_TOKEN: den hat der Besitzer bereits, es muss also
// kein zweites Geheimnis verteilt werden.
const EINLADUNGSCODE = process.env.EINLADUNGSCODE || '';

function kontenPfade(uid) {
  if (!uid) return { state: STATE_FILE, subs: SUBS_FILE, sent: SENT_FILE, backup: BACKUP_DIR };
  const b = path.join(KONTEN_DIR, uid);
  return {
    state: path.join(b, 'state.json'),
    subs: path.join(b, 'subscriptions.json'),
    sent: path.join(b, 'sent.json'),
    backup: path.join(b, 'backup'),
  };
}

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
async function snapshot(envelope, dir) {
  if (!envelope) return;
  const ziel = dir || BACKUP_DIR;
  const day = localDayKey();
  const file = path.join(ziel, day + '.json');
  try {
    await fsp.mkdir(ziel, { recursive: true });
    // 'wx' schlägt fehl, wenn es die Kopie schon gibt – eine einmal gesicherte
    // Fassung des Tages darf später nichts mehr überschreiben.
    await fsp.writeFile(file, JSON.stringify(envelope), { encoding: 'utf8', flag: 'wx' });
    const files = (await fsp.readdir(ziel)).filter(f => f.endsWith('.json')).sort();
    for (const old of files.slice(0, Math.max(0, files.length - BACKUP_KEEP))) {
      await fsp.unlink(path.join(ziel, old)).catch(() => {});
    }
  } catch (e) { if (e.code !== 'EEXIST') log('Sicherung fehlgeschlagen:', e.message); }
}

// =====================================================================
// Konten: registrieren, anmelden, abmelden
//
// Bewusst ohne fremde Bibliothek – scrypt und randomBytes stecken in Node
// selbst. Jede zusätzliche Abhängigkeit müsste als neues Abbild gebaut
// werden, und dafür bräuchte es wieder ein Terminal.
// =====================================================================

async function ladeKonten() {
  const k = await readJson(KONTEN_FILE, null);
  if (!k || typeof k !== 'object' || !k.benutzer) return { version: 1, benutzer: {} };
  return k;
}
async function speichereKonten(k) { await writeJsonAtomic(KONTEN_FILE, k); }

function normEmail(s) { return String(s || '').trim().toLowerCase(); }
function emailOk(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || '').trim()); }

function hashe(passwort, salz) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(String(passwort), salz, 64, { N: 16384, r: 8, p: 1 }, (err, key) => {
      if (err) reject(err); else resolve(key.toString('hex'));
    });
  });
}

async function findeBenutzer(email) {
  const konten = await ladeKonten();
  const suche = normEmail(email);
  for (const uid of Object.keys(konten.benutzer)) {
    if (konten.benutzer[uid].emailKlein === suche) return konten.benutzer[uid];
  }
  return null;
}

// Der erste angelegte Benutzer ist der Besitzer. Ein Gerät, das noch mit dem
// alten Schlüssel kommt, landet bei ihm – sonst entstünden zwei getrennte
// Datenbestände, und einer davon fiele erst Wochen später auf.
async function besitzer() {
  const konten = await ladeKonten();
  const alle = Object.values(konten.benutzer).sort((a, b) => (a.erstellt || 0) - (b.erstellt || 0));
  return alle.length ? alle[0] : null;
}

// ---------- Sitzungen ----------
async function ladeSitzungen() {
  const s = await readJsonSoft(SITZUNGEN_FILE, {});
  return (s && typeof s === 'object') ? s : {};
}
function sitzungsKennung(token) { return crypto.createHash('sha256').update(String(token)).digest('hex'); }

async function neueSitzung(uid) {
  const token = crypto.randomBytes(32).toString('hex');
  await serialize(async () => {
    const s = await ladeSitzungen();
    const jetzt = Date.now();
    const frist = SITZUNG_TAGE * 86400000;
    // Abgelaufenes bei der Gelegenheit wegräumen, damit die Datei nicht wächst.
    for (const k of Object.keys(s)) if (!s[k] || (jetzt - (s[k].erstellt || 0)) > frist) delete s[k];
    s[sitzungsKennung(token)] = { uid, erstellt: jetzt };
    await writeJsonAtomic(SITZUNGEN_FILE, s);
  });
  return token;
}

// Alle Sitzungen eines Kontos beenden. Nötig beim Passwortwechsel: sonst
// bliebe ein gestohlener Keks ein Jahr lang gültig, und der Betroffene hätte
// kein Mittel dagegen – ausser den Server von Hand aufzumachen.
async function sitzungenLoeschenFuer(uid) {
  if (!uid) return 0;
  let weg = 0;
  await serialize(async () => {
    const s = await ladeSitzungen();
    for (const k of Object.keys(s)) if (s[k] && s[k].uid === uid) { delete s[k]; weg++; }
    await writeJsonAtomic(SITZUNGEN_FILE, s);
  });
  return weg;
}

async function sitzungLoeschen(token) {
  if (!token) return;
  await serialize(async () => {
    const s = await ladeSitzungen();
    delete s[sitzungsKennung(token)];
    await writeJsonAtomic(SITZUNGEN_FILE, s);
  });
}

async function sitzungPruefen(token) {
  if (!token) return null;
  const s = await ladeSitzungen();
  const e = s[sitzungsKennung(token)];
  if (!e) return null;
  if ((Date.now() - (e.erstellt || 0)) > SITZUNG_TAGE * 86400000) return null;
  const konten = await ladeKonten();
  return konten.benutzer[e.uid] ? { uid: e.uid } : null;
}

function keksLesen(req, name) {
  const roh = req.headers.cookie || '';
  for (const teil of roh.split(';')) {
    const i = teil.indexOf('=');
    if (i < 0) continue;
    if (teil.slice(0, i).trim() === name) return decodeURIComponent(teil.slice(i + 1).trim());
  }
  return null;
}

// Ein Name im Heimnetz oder eine private Adresse – dort läuft die App auch
// über http, und ein «Secure»-Keks käme nie an.
function lokalerHost(host) {
  const h = String(host || '').split(':')[0].toLowerCase();
  if (!h) return true;
  if (h === 'localhost' || h.endsWith('.local') || h.endsWith('.lan') || h.endsWith('.internal')) return true;
  if (/^127\./.test(h) || h === '::1' || /^10\./.test(h) || /^192\.168\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  if (/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(h)) return true;   // Tailscale
  return false;
}

function keksSetzen(req, token, tage) {
  // «Secure» nicht davon abhängig machen, was der Proxy in X-Forwarded-Proto
  // schreibt: nginx setzt dort $scheme, und das ist hinter dem Tunnel immer
  // «http». Der Keks bekäme dann auf der öffentlichen https-Adresse nie ein
  // «Secure» – und ein einziger http-Aufruf reichte, um ihn abzugreifen.
  // Also umgekehrt: sicher, ausser die Adresse ist erkennbar eine im Heimnetz.
  const proto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim().toLowerCase();
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const sicher = proto === 'https' || !lokalerHost(host);
  const teile = [
    COOKIE_NAME + '=' + encodeURIComponent(token || ''),
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=' + (token ? Math.round((tage || SITZUNG_TAGE) * 86400) : 0),
  ];
  if (sicher) teile.push('Secure');
  return teile.join('; ');
}

// ---------- Einladungen ----------
// Damit der Besitzer jemanden dazunehmen kann, ohne seinen eigenen Schlüssel
// weiterzugeben – der wäre ein Generalschlüssel zu seinen Daten. Eine
// Einladung gilt genau einmal.
async function einladungAnlegen(vonUid) {
  const code = crypto.randomBytes(9).toString('base64url');
  await serialize(async () => {
    const e = await readJsonSoft(EINLADUNGEN_FILE, {});
    const jetzt = Date.now();
    // Nach 30 Tagen unbenutzte Einladungen wegräumen.
    for (const k of Object.keys(e)) if (!e[k] || (jetzt - (e[k].erstellt || 0)) > 30 * 86400000) delete e[k];
    e[sitzungsKennung(code)] = { von: vonUid, erstellt: jetzt };
    await writeJsonAtomic(EINLADUNGEN_FILE, e);
  });
  return code;
}

// Prüfen und Verbrauchen sind bewusst getrennt: sonst wäre die Einladung
// schon weg, wenn die Registrierung danach an der E-Mail scheitert – und die
// eingeladene Person stünde ohne Code da, nur weil sie sich vertippt hat.
async function einladungGueltig(code) {
  if (!code) return false;
  const e = await readJsonSoft(EINLADUNGEN_FILE, {});
  const k = sitzungsKennung(code);
  return !!(e[k] && (Date.now() - (e[k].erstellt || 0)) <= 30 * 86400000);
}

async function einladungVerbrauchen(code) {
  if (!code) return;
  await serialize(async () => {
    const e = await readJsonSoft(EINLADUNGEN_FILE, {});
    delete e[sitzungsKennung(code)];
    await writeJsonAtomic(EINLADUNGEN_FILE, e);
  });
}

// ---------- Bremse gegen das Durchprobieren von Passwörtern ----------
const versuche = new Map();
function versuchErlaubt(schluessel) {
  const jetzt = Date.now();
  const e = versuche.get(schluessel);
  if (!e || (jetzt - e.seit) > 15 * 60000) { versuche.set(schluessel, { seit: jetzt, n: 0 }); return true; }
  return e.n < 10;
}
function versuchGezaehlt(schluessel) {
  const e = versuche.get(schluessel);
  if (e) e.n++;
}
function versuchZurueck(schluessel) { versuche.delete(schluessel); }

// ---------- Umzug beim ersten Konto ----------
// Legt der Besitzer sein Konto an, ziehen die bisherigen Daten mit. Ohne das
// stünde er nach dem Anmelden vor einer leeren App, während sein ganzer
// Bestand unerreichbar daneben läge.
async function umzugInsKonto(uid) {
  const ziel = kontenPfade(uid);
  await fsp.mkdir(path.dirname(ziel.state), { recursive: true });
  const paare = [[STATE_FILE, ziel.state], [SUBS_FILE, ziel.subs], [SENT_FILE, ziel.sent]];
  for (const [von, nach] of paare) {
    try { await fsp.rename(von, nach); log('umgezogen:', path.basename(von), '→', nach); }
    catch (e) { if (e.code !== 'ENOENT') log('Umzug fehlgeschlagen:', von, e.message); }
  }
  try { await fsp.rename(BACKUP_DIR, ziel.backup); } catch (e) { if (e.code !== 'ENOENT') log('Umzug der Sicherungen fehlgeschlagen:', e.message); }
}

// Alle Datensätze, um die sich der Erinnerungslauf kümmern muss.
async function alleMandanten() {
  const konten = await ladeKonten();
  const uids = Object.keys(konten.benutzer);
  if (uids.length) return uids.map(u => ({ uid: u, tz: konten.benutzer[u].tz || null }));
  // Noch kein Konto: der Server läuft im bisherigen Betrieb weiter.
  return [{ uid: null, tz: null }];
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

function schluesselOk(req) {
  if (!TOKEN) return false;
  const h = req.headers.authorization || '';
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  return !!m && safeEqual(m[1].trim(), TOKEN);
}

// Wer fragt hier an? Zwei Wege führen hinein:
//   · das Sitzungs-Cookie einer Anmeldung mit E-Mail und Passwort,
//   · der alte SYNC_TOKEN, damit schon verbundene Geräte weiterlaufen.
// Beide landen beim selben Datensatz, sonst gäbe es zwei Wahrheiten.
async function werIstDas(req) {
  const token = keksLesen(req, COOKIE_NAME);
  if (token) {
    const s = await sitzungPruefen(token);
    if (s) return { uid: s.uid, art: 'sitzung' };
  }
  // Der alte SYNC_TOKEN öffnet nur, solange es noch kein Konto gibt – für den
  // Betrieb von früher und zum Anlegen des ersten Kontos. Sobald jemand ein
  // Konto hat, wäre er ein Generalschlüssel: jede eingeladene Person kennt
  // ihn, und sie käme damit an die Daten des Besitzers. Also ab dann zu.
  if (schluesselOk(req)) {
    const b = await besitzer();
    if (!b) return { uid: null, art: 'schluessel' };
  }
  return null;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const typ = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
    if (typ && typ !== 'application/json') {
      return reject(Object.assign(new Error('falscher Inhaltstyp'), { code: 'BAD_TYPE' }));
    }
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

// Von wo kommt die Anfrage? Ein Formular auf einer fremden Seite darf hier
// nichts auslösen. «SameSite=Lax» allein genügt nicht: es verhindert zwar,
// dass ein fremdes Formular den Keks mitschickt, aber nicht, dass es dem
// Browser eine fremde Anmeldung unterschiebt – danach liefe der Abgleich in
// ein fremdes Konto, ohne dass jemand etwas merkt.
function quelleOk(req) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return true;
  const o = req.headers.origin;
  // Ohne Herkunft ist es kein Browser-Formular (curl, ein Skript, ein Dienst).
  // Der Browser schickt sie bei POST immer mit, auch bei gleicher Herkunft.
  if (!o) return true;
  if (ALLOW_ORIGIN.includes(o)) return true;
  const eigen = String(req.headers['x-forwarded-host'] || req.headers.host || '').toLowerCase();
  let fremd = '';
  try { fremd = new URL(o).host.toLowerCase(); } catch (e) { return false; }
  return !!eigen && fremd === eigen;
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

  if (!quelleOk(req)) {
    log('fremde Herkunft abgewiesen:', req.headers.origin, '→', req.method, route);
    return antwort(403, { error: 'Diese Anfrage kommt von einer fremden Seite.' });
  }

  if (route === '/health') {
    return antwort(200, Object.assign(
      { ok: true, push: pushBereit, subject: !!VAPID_SUBJECT },
      pushBereit ? {} : { pushFehler: pushFehler || 'unbekannt' },
    ));
  }

  // Der öffentliche Schlüssel ist keine Geheimsache: das Handy braucht ihn zum Anmelden.
  if (route === '/push/key' && req.method === 'GET') return antwort(200, { key: VAPID_PUBLIC || null });

  // =================================================================
  // Konto: registrieren, anmelden, abmelden, Passwort ändern
  // Diese Pfade liegen vor der Schranke – sonst käme niemand hinein.
  // =================================================================
  try {
    const herkunft = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '?').split(',')[0].trim();

    if (route === '/konto' && req.method === 'GET') {
      const ich = await werIstDas(req);
      if (!ich) return antwort(200, { angemeldet: false, kontenVorhanden: Object.keys((await ladeKonten()).benutzer).length > 0 });
      const konten = await ladeKonten();
      const b = ich.uid ? konten.benutzer[ich.uid] : null;
      return antwort(200, { angemeldet: true, email: b ? b.email : null, art: ich.art });
    }

    if (route === '/konto/registrieren' && req.method === 'POST') {
      const body = await readBody(req) || {};
      const email = String(body.email || '').trim();
      const passwort = String(body.passwort || '');
      const code = String(body.code || '');
      if (!emailOk(email)) return antwort(400, { error: 'Diese E-Mail-Adresse sieht nicht richtig aus.' });
      if (passwort.length < 8) return antwort(400, { error: 'Das Passwort braucht mindestens 8 Zeichen.' });
      // Ohne Riegel könnte sich jeder, der die Adresse kennt, hier ein Konto
      // anlegen. Zwei Fälle, bewusst getrennt:
      //
      //   · Noch kein Konto da: der Besitzer legt seines an. Dafür taugt der
      //     SYNC_TOKEN, den er schon hat – kein zweites Geheimnis nötig.
      //   · Es gibt schon Konten: jetzt braucht es eine Einladung, die ein
      //     angemeldetes Konto ausgestellt hat. Der SYNC_TOKEN darf es NICHT
      //     mehr sein, sonst kennte jede eingeladene Person den Schlüssel zu
      //     den Daten des Besitzers.
      const nochLeer = Object.keys((await ladeKonten()).benutzer).length === 0;
      let codeGut = false;
      if (!code) codeGut = false;
      else if (nochLeer && TOKEN && safeEqual(code, TOKEN)) codeGut = true;
      else if (EINLADUNGSCODE && safeEqual(code, EINLADUNGSCODE)) codeGut = true;
      else codeGut = await einladungGueltig(code);
      if (!codeGut) {
        log('Registrierung abgelehnt (Code falsch) von', herkunft);
        return antwort(403, { error: nochLeer
          ? 'Der Einladungscode stimmt nicht.'
          : 'Dieser Einladungscode stimmt nicht oder wurde schon benutzt.' });
      }
      if (await findeBenutzer(email)) return antwort(409, { error: 'Für diese E-Mail-Adresse gibt es schon ein Konto.' });

      // Jetzt steht fest, dass das Konto entsteht – erst hier ist die
      // Einladung aufgebraucht.
      await einladungVerbrauchen(code);

      const salz = crypto.randomBytes(16).toString('hex');
      const hash = await hashe(passwort, salz);
      const uid = crypto.randomBytes(8).toString('hex');
      let erster = false;
      await serialize(async () => {
        const konten = await ladeKonten();
        erster = Object.keys(konten.benutzer).length === 0;
        konten.benutzer[uid] = {
          uid, email, emailKlein: normEmail(email),
          algo: 'scrypt', salz, hash,
          tz: typeof body.tz === 'string' ? body.tz.slice(0, 60) : null,
          erstellt: Date.now(),
        };
        await speichereKonten(konten);
      });
      // Das erste Konto erbt, was bisher ohne Konto auf dem Server lag.
      if (erster) await umzugInsKonto(uid);
      else await fsp.mkdir(path.dirname(kontenPfade(uid).state), { recursive: true });
      const token = await neueSitzung(uid);
      log('Konto angelegt:', email, erster ? '(erstes – Daten umgezogen)' : '');
      return antwort(200, { ok: true, email, erster }, { 'Set-Cookie': keksSetzen(req, token) });
    }

    if (route === '/konto/anmelden' && req.method === 'POST') {
      const body = await readBody(req) || {};
      const email = String(body.email || '').trim();
      const passwort = String(body.passwort || '');
      const bremse = normEmail(email) + '|' + herkunft;
      if (!versuchErlaubt(bremse)) {
        log('zu viele Anmeldeversuche für', normEmail(email), 'von', herkunft);
        return antwort(429, { error: 'Zu viele Versuche. Bitte in 15 Minuten noch einmal.' });
      }
      const b = await findeBenutzer(email);
      // Immer rechnen, auch wenn es das Konto nicht gibt: sonst verriete die
      // Antwortzeit, welche Adressen auf diesem Server ein Konto haben.
      const salz = b ? b.salz : 'kein-konto';
      const hash = await hashe(passwort, salz);
      if (!b || !safeEqual(hash, b.hash)) {
        versuchGezaehlt(bremse);
        return antwort(401, { error: 'E-Mail-Adresse oder Passwort stimmt nicht.' });
      }
      versuchZurueck(bremse);
      const token = await neueSitzung(b.uid);
      log('angemeldet:', b.email);
      return antwort(200, { ok: true, email: b.email }, { 'Set-Cookie': keksSetzen(req, token) });
    }

    if (route === '/konto/abmelden' && req.method === 'POST') {
      await sitzungLoeschen(keksLesen(req, COOKIE_NAME));
      return antwort(200, { ok: true }, { 'Set-Cookie': keksSetzen(req, '', 0) });
    }

    if (route === '/konto/einladung' && req.method === 'POST') {
      const ich = await werIstDas(req);
      if (!ich || !ich.uid) return antwort(401, { error: 'Nicht angemeldet' });
      const code = await einladungAnlegen(ich.uid);
      log('Einladung ausgestellt von', ich.uid.slice(0, 8));
      return antwort(200, { ok: true, code });
    }

    if (route === '/konto/abmelden-ueberall' && req.method === 'POST') {
      const ich = await werIstDas(req);
      if (!ich || !ich.uid) return antwort(401, { error: 'Nicht angemeldet' });
      const weg = await sitzungenLoeschenFuer(ich.uid);
      const frisch = await neueSitzung(ich.uid);
      log('überall abgemeldet:', ich.uid.slice(0, 8), '·', weg, 'Sitzung(en)');
      return antwort(200, { ok: true, beendeteSitzungen: weg }, { 'Set-Cookie': keksSetzen(req, frisch) });
    }

    if (route === '/konto/passwort' && req.method === 'POST') {
      const ich = await werIstDas(req);
      if (!ich || !ich.uid) return antwort(401, { error: 'Nicht angemeldet' });
      const body = await readBody(req) || {};
      const neu = String(body.neu || '');
      if (neu.length < 8) return antwort(400, { error: 'Das neue Passwort braucht mindestens 8 Zeichen.' });
      const konten = await ladeKonten();
      const b = konten.benutzer[ich.uid];
      if (!b) return antwort(401, { error: 'Nicht angemeldet' });
      const alt = await hashe(String(body.alt || ''), b.salz);
      if (!safeEqual(alt, b.hash)) return antwort(403, { error: 'Das bisherige Passwort stimmt nicht.' });
      const salz = crypto.randomBytes(16).toString('hex');
      const hash = await hashe(neu, salz);
      await serialize(async () => {
        const k = await ladeKonten();
        if (!k.benutzer[ich.uid]) return;
        k.benutzer[ich.uid].salz = salz;
        k.benutzer[ich.uid].hash = hash;
        await speichereKonten(k);
      });
      // Wer sein Passwort ändert, will meist genau eines: dass ein anderer
      // nicht mehr hineinkommt. Also alle Sitzungen beenden – und für das
      // Gerät, das gerade fragt, sofort eine neue ausstellen, damit es nicht
      // ausgerechnet den rauswirft, der aufgeräumt hat.
      const weg = await sitzungenLoeschenFuer(ich.uid);
      const frisch = await neueSitzung(ich.uid);
      log('Passwort geändert:', b.email, '·', weg, 'Sitzung(en) beendet');
      return antwort(200, { ok: true, beendeteSitzungen: weg }, { 'Set-Cookie': keksSetzen(req, frisch) });
    }
  } catch (e) {
    if (e.code === 'BAD_JSON') return antwort(400, { error: 'Kein gültiges JSON' });
    if (e.code === 'BAD_TYPE') return antwort(415, { error: 'Nur application/json' });
    if (e.code === 'TOO_LARGE') return antwort(413, { error: 'Zu viele Daten' });
    log('Kontofehler:', e.stack || e.message);
    return antwort(500, { error: 'Serverfehler' });
  }

  const ich = await werIstDas(req);
  if (!ich) {
    log('abgewiesen:', req.method, route, 'von', req.headers['x-forwarded-for'] || req.socket.remoteAddress || '?');
    return antwort(401, { error: 'Nicht angemeldet' });
  }
  const P = kontenPfade(ich.uid);

  try {
    // --- Zustand holen ---
    if (route === '/state' && req.method === 'GET') {
      const env = await readJson(P.state, null);
      if (!env) return antwort(404, { error: 'Noch nichts abgelegt' });
      // Fragt ein Gerät mit ?device=… , bekommt es dazu die Liste der
      // Erinnerungen, die es heute schon vom Server erhalten hat. Damit zeigt
      // die App sie nicht ein zweites Mal selbst an.
      const wer = url.searchParams.get('device');
      let sent = null;
      if (wer) {
        const v = await readJsonSoft(P.sent, {});
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
        const cur = await readJson(P.state, null);
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
        if (cur) await snapshot(cur, P.backup);
        await fsp.mkdir(path.dirname(P.state), { recursive: true });
        await writeJsonAtomic(P.state, env);
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
        const subs = await readJsonSoft(P.subs, {});
        // Dasselbe Gerät darf nur einmal in der Liste stehen. Sonst bekäme es
        // jede Erinnerung doppelt – etwa wenn ein Abo ohne Geräte-Nummer neu
        // angelegt und später mit einer wieder gemeldet wird.
        for (const k of Object.keys(subs)) {
          if (k !== id && subs[k] && subs[k].subscription && subs[k].subscription.endpoint === sub.endpoint) delete subs[k];
        }
        subs[id] = { subscription: sub, label: String((body && body.label) || '').slice(0, 60), updatedAt: Date.now() };
        await fsp.mkdir(path.dirname(P.subs), { recursive: true });
        await writeJsonAtomic(P.subs, subs);
        log('Abo gespeichert:', id, subs[id].label);
        return antwort(200, { ok: true, deviceId: id, count: Object.keys(subs).length });
      });
    }

    // --- Push-Abo abmelden ---
    if (route === '/push/subscribe' && req.method === 'DELETE') {
      const body = await readBody(req).catch(() => null);
      const id = body && body.deviceId;
      return await serialize(async () => {
        const subs = await readJsonSoft(P.subs, {});
        if (id) delete subs[id];
        else if (body && body.endpoint) for (const k of Object.keys(subs)) if (subs[k].subscription.endpoint === body.endpoint) delete subs[k];
        await writeJsonAtomic(P.subs, subs);
        return antwort(200, { ok: true, count: Object.keys(subs).length });
      });
    }

    // --- Probe-Erinnerung ---
    if (route === '/push/test' && req.method === 'POST') {
      const r = await sendToAll({ title: 'HIGH', body: 'Probe-Erinnerung vom eigenen Server.', tag: 'high-test' }, null, P.subs);
      return antwort(200, { sent: r.delivered.length, offen: r.offen });
    }

    return antwort(404, { error: 'Unbekannter Pfad' });
  } catch (e) {
    if (e.code === 'TOO_LARGE') return antwort(413, { error: 'Zu viele Daten' });
    if (e.code === 'BAD_JSON') return antwort(400, { error: 'Kein gültiges JSON' });
    if (e.code === 'BAD_TYPE') return antwort(415, { error: 'Nur application/json' });
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
async function sendToAll(payload, schon, subsDatei) {
  if (!pushBereit) { log('Push nicht eingerichtet (' + pushFehler + ') – nichts gesendet.'); return { delivered: [], offen: 0 }; }
  const datei = subsDatei || SUBS_FILE;
  const subs = await readJsonSoft(datei, {});
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
      const cur = await readJsonSoft(datei, {});
      tot.forEach(id => delete cur[id]);
      await writeJsonAtomic(datei, cur);
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
  // Die Zahl am App-Symbol soll auch dann stimmen, wenn die App zu ist. Kennt
  // der Dienst den heutigen Stand, schickt er ihn mit; kennt er ihn nicht,
  // lässt er die Zahl lieber unangetastet, statt sie zu erfinden.
  const badge = today ? Math.max(0, openTodos | 0) : null;

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
        tag: 'high-morning', badge,
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
        tag: 'high-evening', badge,
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
        tag: 'high-task-' + t.id, badge,
      });
    }
  }
  return out;
}

let ticking = false;
const tzGewarnt = new Set();

// Ein Durchgang pro Datensatz. Ein Konto, dessen Daten hinüber sind, darf die
// Erinnerungen aller anderen nicht aufhalten – darum jedes für sich, mit
// eigenem Fehlernetz.
async function tickEiner(mandant) {
  const P = kontenPfade(mandant.uid);
  const wer = mandant.uid ? mandant.uid.slice(0, 8) : 'ohne Konto';
  let env = null;
  try {
    env = await readJson(P.state, null);
  } catch (e) {
    if (e.code !== 'CORRUPT') throw e;
    // Der Zustand ist unlesbar. Ohne Rückfallebene kämen ab jetzt gar keine
    // Erinnerungen mehr, und zwar still. Also die neueste Tageskopie nehmen:
    // die Zeiten darin stimmen fast immer noch.
    env = await letzteSicherung(P.backup);
    log(env ? 'ACHTUNG [' + wer + ']: state.json unlesbar – Erinnerungen laufen aus der letzten Sicherung.'
            : 'ACHTUNG [' + wer + ']: state.json unlesbar und keine Sicherung da – es kommen keine Erinnerungen.');
    if (!env) return;
  }
  if (!env) return;
  const plan = env.push || (env.state && env.state.push);
  if (!plan) return;

  // Rechnet der Dienst in einer anderen Zeitzone als das Handy, liegen alle
  // Zeiten daneben. Das einmal sichtbar machen statt still falsch erinnern.
  const hier = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (plan.tz && hier && plan.tz !== hier && !tzGewarnt.has(wer + plan.tz)) {
    tzGewarnt.add(wer + plan.tz);
    log('ACHTUNG [' + wer + ']: Zeitzone der App (' + plan.tz + ') weicht von der des Dienstes (' + hier + ') ab – TZ im Container setzen.');
  }

  const now = new Date();
  const due = duePayloads(plan, now);
  const day = planDayKey(plan, now);
  const sent = await readJsonSoft(P.sent, {});
  if (sent.day !== day || !sent.an || typeof sent.an !== 'object') { sent.day = day; sent.an = {}; }
  if (!due.length) return;

  let geaendert = false;
  for (const p of due) {
    const schon = Array.isArray(sent.an[p.key]) ? sent.an[p.key] : [];
    const res = await sendToAll({ title: p.title, body: p.body, tag: p.tag, badge: p.badge }, schon, P.subs);
    if (res.delivered.length) {
      sent.an[p.key] = schon.concat(res.delivered);
      geaendert = true;
      log('gesendet [' + wer + ']:', p.key, '→', res.delivered.length, 'Gerät(e)');
    }
    // Geräte, bei denen es gerade nicht klappte, bleiben ungemerkt: der
    // nächste Lauf in 30 Sekunden versucht es bei genau diesen erneut.
    if (res.offen) log('offen geblieben [' + wer + ']:', p.key, '·', res.offen, 'Gerät(e) – wird wiederholt');
  }
  if (geaendert) await serialize(() => writeJsonAtomic(P.sent, sent));
}

async function tick() {
  if (ticking) return;
  ticking = true;
  try {
    for (const m of await alleMandanten()) {
      try { await tickEiner(m); }
      catch (e) { log('Erinnerungslauf fehlgeschlagen für', m.uid || 'ohne Konto', ':', e.stack || e.message); }
    }
  } catch (e) {
    log('Erinnerungslauf fehlgeschlagen:', e.stack || e.message);
  } finally { ticking = false; }
}

// Neueste Tageskopie aus backup/ – nur als Notnagel, wenn state.json hin ist.
async function letzteSicherung(dir) {
  const ordner = dir || BACKUP_DIR;
  try {
    const files = (await fsp.readdir(ordner)).filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
    for (let i = files.length - 1; i >= 0; i--) {
      try { return JSON.parse(await fsp.readFile(path.join(ordner, files[i]), 'utf8')); } catch (e) {}
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
module.exports = { duePayloads, localDayKey, localHM, appDayKey, appMinutes, planDayKey, dayEndOf, server, kontenPfade, emailOk, normEmail };
