// Prüft am laufenden Dienst, dass keine Erinnerung verlorengeht:
//   · scheitert der Versand an ein Gerät, gilt sie nicht als erledigt
//   · beim nächsten Lauf wird genau dieses Gerät wiederholt, kein anderes doppelt
//   · ein abgelaufenes Abo (410) wird entfernt
//   · dieselbe Adresse steht nie zweimal in der Liste
//
// Läuft ohne Netz: web-push wird durch eine Attrappe ersetzt, die nichts
// verschickt, sondern mitschreibt. Dauert rund eine Minute – der Dienst
// schaut alle 30 s nach, und genau dieses Warten ist Teil der Prüfung.
//
//   node tests/high-sync.versand.test.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const WURZEL = fs.mkdtempSync(path.join(os.tmpdir(), 'high-versand-'));
const DATA = path.join(WURZEL, 'daten');
const STUB = path.join(WURZEL, 'node_modules', 'web-push');
const CFG = path.join(WURZEL, 'verhalten.json');
const LOG = path.join(WURZEL, 'versand.log');
const DIENST = new URL('../deploy/high-sync/server.js', import.meta.url).pathname;
const TOK = 'test-token-abcdefghijklmnop';
const PORT = parseInt(process.env.PORT || '8095', 10);

fs.mkdirSync(DATA, { recursive: true });
fs.mkdirSync(STUB, { recursive: true });
fs.writeFileSync(path.join(STUB, 'package.json'), JSON.stringify({ name: 'web-push', version: '0.0.0-attrappe', main: 'index.js' }));
fs.writeFileSync(path.join(STUB, 'index.js'), `
// Attrappe für web-push: verschickt nichts, schreibt nur mit. Welche Adresse
// mit welchem Fehler antwortet, steht in STUB_CFG.
const fs = require('fs');
module.exports = {
  setVapidDetails() {},
  generateVAPIDKeys() { return { publicKey: 'pub', privateKey: 'priv' }; },
  async sendNotification(sub, payload) {
    let cfg = {};
    try { cfg = JSON.parse(fs.readFileSync(process.env.STUB_CFG, 'utf8')); } catch (e) {}
    fs.appendFileSync(process.env.STUB_LOG, JSON.stringify({ endpoint: sub.endpoint, payload: JSON.parse(payload) }) + '\\n');
    const code = cfg[sub.endpoint];
    if (code) { const e = new Error('Attrappe ' + code); e.statusCode = code; throw e; }
    return { statusCode: 201 };
  },
};
`);
fs.writeFileSync(CFG, '{}'); fs.writeFileSync(LOG, '');

const srv = spawn('node', [DIENST], {
  env: { ...process.env, TZ: 'Europe/Zurich', PORT: String(PORT), DATA_DIR: DATA, SYNC_TOKEN: TOK,
         VAPID_PUBLIC_KEY: 'pub', VAPID_PRIVATE_KEY: 'priv', VAPID_SUBJECT: 'mailto:test@example.ch',
         NODE_PATH: path.join(WURZEL, 'node_modules'), STUB_CFG: CFG, STUB_LOG: LOG },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverlog = '';
srv.stdout.on('data', d => { serverlog += d; });
srv.stderr.on('data', d => { serverlog += d; });
const warte = ms => new Promise(r => setTimeout(r, ms));
// Der Dienst schaut alle 30 s nach. Statt blind zu warten: warten, bis das
// Erwartete da ist – höchstens 45 s.
async function warteBis(pruef, was, ms = 45000) {
  const ende = Date.now() + ms;
  while (Date.now() < ende) { if (pruef()) return true; await warte(500); }
  console.log('   Zeitüberschreitung beim Warten auf:', was);
  return false;
}
await warte(1200);

const api = async (pfad, opts = {}) => {
  const res = await fetch(`http://127.0.0.1:${PORT}${pfad}`, {
    ...opts, headers: { Authorization: 'Bearer ' + TOK, 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  return { status: res.status, body: await res.json().catch(() => null) };
};
const versendet = () => fs.readFileSync(LOG, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
const sentDatei = () => { try { return JSON.parse(fs.readFileSync(path.join(DATA, 'sent.json'), 'utf8')); } catch (e) { return null; } };

let n = 0, bad = 0;
const t = (name, fn) => { n++; try { fn(); } catch (e) { bad++; console.log('FEHLT:', name, '\n   ', e.message); } };
const gleich = (a, b, msg) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${msg}: ${JSON.stringify(a)} statt ${JSON.stringify(b)}`); };

// Zwei Geräte anmelden
const a = await api('/push/subscribe', { method: 'POST', body: JSON.stringify({ subscription: { endpoint: 'https://apple/a', keys: {} }, label: 'iPhone' }) });
const b = await api('/push/subscribe', { method: 'POST', body: JSON.stringify({ subscription: { endpoint: 'https://apple/b', keys: {} }, label: 'Mac' }) });
const idA = a.body.deviceId, idB = b.body.deviceId;

// Gerät B nimmt nichts an (vorübergehender Fehler)
fs.writeFileSync(CFG, JSON.stringify({ 'https://apple/b': 500 }));

// Ein Plan, bei dem der Abend-Check fällig ist
const p2 = (x) => String(x).padStart(2, '0');
const jetzt = new Date();
const appTag = new Date(jetzt.getTime()); appTag.setHours(appTag.getHours() - 3);
const tag = appTag.getFullYear() + '-' + p2(appTag.getMonth() + 1) + '-' + p2(appTag.getDate());
// Eine Zeit, die sicher schon vorbei ist: der Beginn des App-Tages.
const plan = { version: 2, dayEnd: 3, pause: null, morning: { at: '03:00', enabled: false },
  evening: { at: '03:00', enabled: true }, tasks: [],
  today: { day: tag, openRoutines: 1, openLabels: ['🧘 Meditieren'], openTodos: 0, doneTaskIds: [] } };
await api('/state', { method: 'PUT', body: JSON.stringify({ state: { schema: 3, tasks: [], todos: [] }, push: plan, device: 'Test' }) });
await warteBis(() => versendet().length >= 2, 'den ersten Versand');

t('Erster Lauf: A bekommt es, B scheitert', () => {
  const v = versendet();
  gleich(v.map(x => x.endpoint).sort(), ['https://apple/a', 'https://apple/b'], 'beide wurden versucht');
  gleich(sentDatei().an, { evening: [idA] }, 'nur A gilt als versorgt');
});

// B geht wieder
fs.writeFileSync(CFG, '{}'); fs.writeFileSync(LOG, '');
await warteBis(() => (sentDatei()?.an?.evening || []).length >= 2, 'die Wiederholung an B');

t('Zweiter Lauf: nur B wird wiederholt, A nicht noch einmal', () => {
  const v = versendet();
  gleich(v.map(x => x.endpoint), ['https://apple/b'], 'nur B');
  gleich(sentDatei().an.evening.slice().sort(), [idA, idB].sort(), 'jetzt sind beide versorgt');
});

fs.writeFileSync(LOG, '');
await warte(35000);   // hier muss wirklich ein voller Lauf vergehen
t('Dritter Lauf: nichts mehr, niemand bekommt es doppelt', () => {
  gleich(versendet().length, 0, 'kein weiterer Versand');
});

const gA = await api('/state?device=' + encodeURIComponent(idA));
const gB = await api('/state?device=' + encodeURIComponent(idB));
t('Abfrage pro Gerät', () => {
  gleich(gA.body.sent.keys, ['evening'], 'A hat den Abend-Check bekommen');
  gleich(gB.body.sent.keys, ['evening'], 'B inzwischen auch');
});

// Abgelaufenes Abo wird entfernt
fs.writeFileSync(CFG, JSON.stringify({ 'https://apple/b': 410 }));
await api('/push/test', { method: 'POST' });
await warte(300);
t('410 räumt das Abo weg', () => {
  const subs = JSON.parse(fs.readFileSync(path.join(DATA, 'subscriptions.json'), 'utf8'));
  gleich(Object.keys(subs), [idA], 'nur noch A ist angemeldet');
});

// Doppelte Anmeldung derselben Adresse unter neuer Nummer
await api('/push/subscribe', { method: 'POST', body: JSON.stringify({ deviceId: 'handgemacht', subscription: { endpoint: 'https://apple/a', keys: {} }, label: 'iPhone neu' }) });
t('Dieselbe Adresse steht nur einmal drin', () => {
  const subs = JSON.parse(fs.readFileSync(path.join(DATA, 'subscriptions.json'), 'utf8'));
  gleich(Object.keys(subs), ['handgemacht'], 'der alte Eintrag ist weg');
});

// Der Zustand wird unlesbar: die Erinnerungen müssen trotzdem weiterlaufen,
// sonst stünde nach einem Plattenfehler alles still, ohne dass es auffällt.
fs.writeFileSync(CFG, '{}'); fs.writeFileSync(LOG, '');
const heil = JSON.parse(fs.readFileSync(path.join(DATA, 'state.json'), 'utf8'));
heil.push.tasks = [{ id: 'notfall', label: 'Sport', emoji: '🏃', at: '03:00' }];
heil.push.today.openRoutines = 1;
fs.mkdirSync(path.join(DATA, 'backup'), { recursive: true });
fs.writeFileSync(path.join(DATA, 'backup', tag + '.json'), JSON.stringify(heil));
fs.writeFileSync(path.join(DATA, 'state.json'), '{kaputt');
await warteBis(() => versendet().some(v => v.payload.tag === 'high-task-notfall'), 'die Erinnerung aus der Sicherung');
t('Unlesbarer Zustand: Erinnerungen laufen aus der Tageskopie weiter', () => {
  gleich(versendet().some(v => v.payload.tag === 'high-task-notfall'), true, 'nichts kam an');
  if (!/state\.json unlesbar/.test(serverlog)) throw new Error('der Notfall steht nicht im Log');
});

srv.kill();
fs.rmSync(WURZEL, { recursive: true, force: true });
if (bad) console.log('\n--- Serverlog ---\n' + serverlog);
console.log(bad ? `${bad} von ${n} Prüfungen fehlgeschlagen` : `alle ${n} Prüfungen bestanden`);
process.exit(bad ? 1 : 0);
