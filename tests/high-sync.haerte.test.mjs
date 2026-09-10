// Prüft, dass der Dienst nichts still verliert und nicht umfällt:
//   · ohne Bedingung wird kein vorhandener Zustand überschrieben
//   · eine unlesbare Datei gilt nie als «leer», sondern als Fehler
//   · unsinnige Adressen und Schreibfehler beenden den Dienst nicht
//   · ohne Schlüssel kommt niemand an die Daten
//
//   node tests/high-sync.haerte.test.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const WURZEL = fs.mkdtempSync(path.join(os.tmpdir(), 'high-haerte-'));
const DATA = path.join(WURZEL, 'daten');
const DIENST = new URL('../deploy/high-sync/server.js', import.meta.url).pathname;
const TOK = 'test-token-abcdefghijklmnop';
const PORT = parseInt(process.env.PORT || '8094', 10);
const BASE = `http://127.0.0.1:${PORT}`;
fs.mkdirSync(DATA, { recursive: true });

const srv = spawn('node', [DIENST], {
  env: { ...process.env, TZ: 'Europe/Zurich', PORT: String(PORT), DATA_DIR: DATA, SYNC_TOKEN: TOK },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverlog = '';
srv.stdout.on('data', d => { serverlog += d; });
srv.stderr.on('data', d => { serverlog += d; });
const warte = ms => new Promise(r => setTimeout(r, ms));
for (let i = 0; i < 40; i++) { try { if ((await fetch(BASE + '/health')).ok) break; } catch (e) {} await warte(150); }

let bad = 0, n = 0;
const pruefe = (name, ist, soll) => {
  n++;
  if (JSON.stringify(ist) !== JSON.stringify(soll)) { bad++; console.log('FEHLT:', name, '\n   ist :', JSON.stringify(ist), '\n   soll:', JSON.stringify(soll)); }
  else console.log('ok:', name);
};
const req = (p, o = {}) => fetch(BASE + p, { ...o, headers: { 'Content-Type': 'application/json', ...(o.noauth ? {} : { Authorization: 'Bearer ' + TOK }), ...(o.headers || {}) } });

let r = await req('/state', { method: 'PUT', body: JSON.stringify({ state: { a: 1 } }) });
pruefe('erstes Ablegen ohne Bedingung geht', [r.status, (await r.json()).rev], [200, 1]);

r = await req('/state', { method: 'PUT', body: JSON.stringify({ state: { a: 2 } }) });
pruefe('zweites Ablegen OHNE Bedingung wird abgelehnt', r.status, 409);
pruefe('und liefert die aktuelle Fassung mit', (await r.json()).current.state.a, 1);

r = await req('/state', { method: 'PUT', headers: { 'If-Match': '"1"' }, body: JSON.stringify({ state: { a: 3 } }) });
pruefe('mit passender Bedingung geht es', [r.status, (await r.json()).rev], [200, 2]);

r = await req('/state', { method: 'PUT', headers: { 'If-Match': '"1"' }, body: JSON.stringify({ state: { a: 4 } }) });
pruefe('mit veralteter Bedingung nicht', r.status, 409);

pruefe('ohne Schlüssel kommt niemand an die Daten', (await req('/state', { noauth: true })).status, 401);
pruefe('mit falschem Schlüssel auch nicht', (await req('/state', { noauth: true, headers: { Authorization: 'Bearer falsch' } })).status, 401);

// Die Tageskopie darf nicht überschrieben werden
const kopien = fs.readdirSync(path.join(DATA, 'backup'));
pruefe('es gibt genau eine Tageskopie', kopien.length, 1);
pruefe('sie enthält die ERSTE Fassung des Tages, nicht die letzte',
  JSON.parse(fs.readFileSync(path.join(DATA, 'backup', kopien[0]), 'utf8')).state.a, 1);

// Unsinnige Adressen
for (const pfad of ['//', '/\\', '/state/%ZZ', '/'.repeat(40)]) {
  const s = (await fetch(BASE + pfad, { headers: { Authorization: 'Bearer ' + TOK } })).status;
  if (s >= 500) { bad++; n++; console.log('FEHLT: unsinnige Adresse', JSON.stringify(pfad), '→', s); }
}
n++; console.log('ok: unsinnige Adressen werfen den Dienst nicht um');
pruefe('Dienst lebt danach noch', (await (await req('/health', { noauth: true })).json()).ok, true);

// Unlesbarer Zustand: nie als «leer» behandeln
fs.writeFileSync(path.join(DATA, 'state.json'), '{kaputt');
pruefe('unlesbarer Zustand meldet einen Fehler statt 404', (await req('/state')).status, 500);
r = await req('/state', { method: 'PUT', headers: { 'If-Match': '*' }, body: JSON.stringify({ state: { a: 9 } }) });
pruefe('und lässt sich auch nicht einfach überschreiben', r.status, 500);
pruefe('die kaputte Datei liegt noch da', fs.existsSync(path.join(DATA, 'state.json')), true);
pruefe('Dienst lebt immer noch', (await (await req('/health', { noauth: true })).json()).ok, true);

// Zu grosse und unsinnige Nutzlast
pruefe('kein gültiges JSON → 400', (await req('/state', { method: 'PUT', body: '{nicht' })).status, 400);
pruefe('state fehlt → 400', (await req('/state', { method: 'PUT', body: '{"push":{}}' })).status, 400);

srv.kill();
fs.rmSync(WURZEL, { recursive: true, force: true });
if (bad) console.log('\n--- Serverlog ---\n' + serverlog);
console.log(bad ? `\n${bad} von ${n} Prüfungen fehlgeschlagen` : `\nalle ${n} Prüfungen bestanden`);
process.exit(bad ? 1 : 0);
