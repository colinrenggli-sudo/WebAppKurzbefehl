// Prüft die Kontenverwaltung des Dienstes:
//   · registrieren, anmelden, abmelden, Passwort ändern
//   · ohne Einladungscode kommt niemand hinein
//   · zwei Personen sehen einander nicht
//   · das erste Konto erbt, was vorher ohne Konto auf dem Server lag
//   · ein Gerät mit dem alten Schlüssel landet beim selben Datensatz
//
//   node tests/high-sync.konten.test.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const WURZEL = fs.mkdtempSync(path.join(os.tmpdir(), 'high-konten-'));
const DATA = path.join(WURZEL, 'daten');
const DIENST = new URL('../deploy/high-sync/server.js', import.meta.url).pathname;
const TOK = 'test-token-abcdefghijklmnop';
const PORT = parseInt(process.env.PORT || '8098', 10);
const BASE = `http://127.0.0.1:${PORT}`;
fs.mkdirSync(DATA, { recursive: true });

// Ein Bestand, der schon da war, bevor es Konten gab. Er muss beim ersten
// Konto mitziehen – sonst stünde der Besitzer nach dem Anmelden vor einer
// leeren App, während seine Daten unerreichbar daneben lägen.
fs.writeFileSync(path.join(DATA, 'state.json'), JSON.stringify({
  rev: 7, updatedAt: Date.now(), device: 'altes-iphone',
  push: { version: 2, morning: { at: '09:00', enabled: true } },
  state: { tasks: [{ id: 'alt1', label: 'Meditieren' }] },
}));

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

// Ein winziger Browser: merkt sich den Keks, wie es ein Handy täte.
function browser() {
  let keks = null;
  return {
    get keks() { return keks; },
    async req(p, o = {}) {
      const kopf = { 'Content-Type': 'application/json', ...(o.headers || {}) };
      if (keks) kopf.Cookie = keks;
      const r = await fetch(BASE + p, { ...o, headers: kopf });
      const setz = r.headers.get('set-cookie');
      if (setz) {
        const paar = setz.split(';')[0];
        keks = /=\s*$/.test(paar) || /Max-Age=0/.test(setz) ? null : paar;
      }
      return r;
    },
  };
}
const json = async r => { try { return await r.json(); } catch (e) { return null; } };

// ---------------------------------------------------------------- 1
const a = browser();
let r = await a.req('/konto');
pruefe('vor dem Anmelden: nicht angemeldet', [r.status, (await json(r)).angemeldet], [200, false]);

r = await a.req('/state');
pruefe('und kein Zugriff auf die Daten', r.status, 401);

// ---------------------------------------------------------------- 2  Registrieren
r = await a.req('/konto/registrieren', { method: 'POST', body: JSON.stringify({ email: 'keine-mail', passwort: 'geheim12345' }) });
pruefe('unsinnige E-Mail wird abgelehnt', r.status, 400);

r = await a.req('/konto/registrieren', { method: 'POST', body: JSON.stringify({ email: 'ich@example.ch', passwort: 'kurz' }) });
pruefe('zu kurzes Passwort wird abgelehnt', r.status, 400);
pruefe('und sagt warum', /8 Zeichen/.test((await json(await a.req('/konto/registrieren', { method: 'POST', body: JSON.stringify({ email: 'ich@example.ch', passwort: 'kurz' }) }))).error), true);

r = await a.req('/konto/registrieren', { method: 'POST', body: JSON.stringify({ email: 'Ich@Example.ch', passwort: 'geheim12345', tz: 'Europe/Zurich' }) });
const reg = await json(r);
pruefe('mit Code wird das Konto angelegt', [r.status, reg.ok, reg.erster], [200, true, true]);
pruefe('und man ist danach sofort angemeldet', !!a.keks, true);

r = await a.req('/konto');
pruefe('das Konto meldet sich mit der E-Mail', [(await json(r)).angemeldet, (await json(await a.req('/konto'))).email], [true, 'Ich@Example.ch']);

// ---------------------------------------------------------------- 3  Umzug
r = await a.req('/state');
const geerbt = await json(r);
pruefe('der alte Bestand ist im Konto gelandet', [r.status, geerbt.rev, geerbt.state.tasks[0].label], [200, 7, 'Meditieren']);
pruefe('und liegt nicht mehr offen im Datenordner', fs.existsSync(path.join(DATA, 'state.json')), false);

// ---------------------------------------------------------------- 4  Alter Schlüssel
// Vor dem ersten Konto war er der Zugang; ab dem ersten Konto wäre er ein
// Generalschlüssel – jede eingeladene Person kennt ihn. Also muss er zu sein.
const alt = await fetch(BASE + '/state', { headers: { Authorization: 'Bearer ' + TOK } });
pruefe('der alte Schlüssel öffnet nicht mehr, sobald es ein Konto gibt', alt.status, 401);

// ---------------------------------------------------------------- 5  Abmelden
r = await a.req('/konto/abmelden', { method: 'POST' });
pruefe('abmelden geht', r.status, 200);
pruefe('der Keks ist danach weg', a.keks, null);
pruefe('und die Daten sind wieder zu', (await a.req('/state')).status, 401);

// ---------------------------------------------------------------- 6  Anmelden
r = await a.req('/konto/anmelden', { method: 'POST', body: JSON.stringify({ email: 'ich@example.ch', passwort: 'falsches' }) });
pruefe('mit falschem Passwort kommt niemand rein', r.status, 401);

r = await a.req('/konto/anmelden', { method: 'POST', body: JSON.stringify({ email: 'ICH@EXAMPLE.CH', passwort: 'geheim12345' }) });
pruefe('Gross- und Kleinschreibung der E-Mail ist egal', [r.status, (await json(r)).ok], [200, true]);
pruefe('und die Daten sind wieder da', (await json(await a.req('/state'))).rev, 7);

// ---------------------------------------------------------------- 7  Zweite Person
const b = browser();
r = await b.req('/konto/registrieren', { method: 'POST', body: JSON.stringify({ email: 'ich@example.ch', passwort: 'anderes123' }) });
pruefe('dieselbe E-Mail zweimal geht nicht', r.status, 409);

r = await b.req('/konto/registrieren', { method: 'POST', body: JSON.stringify({ email: 'zweite@example.ch', passwort: 'anderes123' }) });
pruefe('eine zweite Person legt sich einfach ein Konto an', [r.status, (await json(await b.req('/konto'))).email], [200, 'zweite@example.ch']);

r = await b.req('/state');
pruefe('sie sieht NICHT die Daten der ersten', r.status, 404);

r = await b.req('/state', { method: 'PUT', body: JSON.stringify({ state: { tasks: [{ id: 'b1', label: 'Joggen' }] } }) });
pruefe('sie darf eigene ablegen', r.status, 200);
pruefe('die erste sieht davon nichts', (await json(await a.req('/state'))).state.tasks[0].label, 'Meditieren');
pruefe('und die zweite sieht ihre eigenen', (await json(await b.req('/state'))).state.tasks[0].label, 'Joggen');
pruefe('jede hat einen eigenen Ordner', fs.readdirSync(path.join(DATA, 'k')).length, 2);

// ---------------------------------------------------------------- 8  Passwort ändern
r = await a.req('/konto/passwort', { method: 'POST', body: JSON.stringify({ alt: 'falsch', neu: 'ganzneues123' }) });
pruefe('ohne das bisherige Passwort geht nichts', r.status, 403);

r = await a.req('/konto/passwort', { method: 'POST', body: JSON.stringify({ alt: 'geheim12345', neu: 'kurz' }) });
pruefe('ein zu kurzes neues Passwort wird abgelehnt', r.status, 400);

// Ein zweites angemeldetes Gerät derselben Person – es muss beim
// Passwortwechsel hinausfliegen, sonst nützt der Wechsel gegen einen
// gestohlenen Keks gar nichts.
const altGeraet = browser();
await altGeraet.req('/konto/anmelden', { method: 'POST', body: JSON.stringify({ email: 'ich@example.ch', passwort: 'geheim12345' }) });
pruefe('das zweite Gerät ist angemeldet', (await altGeraet.req('/state')).status, 200);

r = await a.req('/konto/passwort', { method: 'POST', body: JSON.stringify({ alt: 'geheim12345', neu: 'ganzneues123' }) });
pruefe('mit dem bisherigen geht es', r.status, 200);
pruefe('das andere Gerät ist danach draussen', (await altGeraet.req('/state')).status, 401);
pruefe('das Gerät, das geändert hat, bleibt drin', (await a.req('/state')).status, 200);

const c = browser();
pruefe('das alte Passwort zieht nicht mehr',
  (await c.req('/konto/anmelden', { method: 'POST', body: JSON.stringify({ email: 'ich@example.ch', passwort: 'geheim12345' }) })).status, 401);
pruefe('das neue schon',
  (await c.req('/konto/anmelden', { method: 'POST', body: JSON.stringify({ email: 'ich@example.ch', passwort: 'ganzneues123' }) })).status, 200);
pruefe('und die Daten stimmen weiter', (await json(await c.req('/state'))).rev, 7);

// ---------------------------------------------------------------- 9  Bremse
const d = browser();
let letzte = 0;
for (let i = 0; i < 12; i++) {
  letzte = (await d.req('/konto/anmelden', { method: 'POST', body: JSON.stringify({ email: 'ich@example.ch', passwort: 'nein' + i }) })).status;
}
pruefe('nach vielen Fehlversuchen wird gebremst', letzte, 429);

// ---------------------------------------------------------------- 10  Passwörter im Klartext?
const kontenRoh = fs.readFileSync(path.join(DATA, 'konten.json'), 'utf8');
pruefe('kein Passwort steht im Klartext in konten.json', /ganzneues123|anderes123|geheim12345/.test(kontenRoh), false);
pruefe('dafür ein Hash mit Salz', /"salz":"[0-9a-f]{32}","hash":"[0-9a-f]{128}"/.test(kontenRoh), true);
pruefe('kein Sitzungs-Token im Klartext in sitzungen.json',
  fs.readFileSync(path.join(DATA, 'sitzungen.json'), 'utf8').includes((a.keks || '').split('=')[1] || 'xxxxx'), false);

// ---------------------------------------------------------------- 11  Keks-Eigenschaften
const anmeldung = (kopf = {}) => fetch(BASE + '/konto/anmelden', {
  method: 'POST', headers: { 'Content-Type': 'application/json', ...kopf },
  body: JSON.stringify({ email: 'zweite@example.ch', passwort: 'anderes123' }),
});
const setz = (await anmeldung()).headers.get('set-cookie') || '';
pruefe('der Keks ist für Skripte unsichtbar', /HttpOnly/i.test(setz), true);
pruefe('und wird nicht quer über fremde Seiten mitgeschickt', /SameSite=Lax/i.test(setz), true);
pruefe('im Heimnetz ohne «Secure», sonst käme er dort nie an', /Secure/i.test(setz), false);

// Der Kern des Befunds: nginx schreibt hinter dem Tunnel immer «http» in
// X-Forwarded-Proto. Hinge «Secure» daran, bekäme die öffentliche Adresse
// nie eines – und ein einziger http-Aufruf reichte, um den Keks abzugreifen.
const oeffentlich = await anmeldung({ 'X-Forwarded-Host': 'routine.example.ch', 'X-Forwarded-Proto': 'http' });
pruefe('auf der öffentlichen Adresse mit «Secure», auch wenn der Proxy «http» meldet',
  /Secure/i.test(oeffentlich.headers.get('set-cookie') || ''), true);
pruefe('und über https erst recht',
  /Secure/i.test((await anmeldung({ 'X-Forwarded-Proto': 'https' })).headers.get('set-cookie') || ''), true);

// ---------------------------------------------------------------- 12  Fremde Seiten
const fremd = (pfad, kopf) => fetch(BASE + pfad, {
  method: 'POST', headers: { 'Content-Type': 'application/json', ...kopf },
  body: JSON.stringify({ email: 'zweite@example.ch', passwort: 'anderes123' }),
});
pruefe('ein Formular auf einer fremden Seite wird abgewiesen',
  (await fremd('/konto/anmelden', { Origin: 'https://boese.example' })).status, 403);
pruefe('die eigene Herkunft geht durch',
  (await fremd('/konto/anmelden', { Origin: BASE })).status, 200);
pruefe('ohne Herkunft (curl, Skript) geht es weiter',
  (await fremd('/konto/anmelden', {})).status, 200);

// «text/plain» ist der Trick, mit dem ein fremdes Formular JSON schmuggelt.
const schmuggel = await fetch(BASE + '/konto/anmelden', {
  method: 'POST', headers: { 'Content-Type': 'text/plain' },
  body: JSON.stringify({ email: 'zweite@example.ch', passwort: 'anderes123' }),
});
pruefe('als text/plain getarntes JSON wird abgelehnt', schmuggel.status, 415);

// ---------------------------------------------------------------- 13  Überall abmelden
const g1 = browser(); const g2 = browser();
await g1.req('/konto/anmelden', { method: 'POST', body: JSON.stringify({ email: 'zweite@example.ch', passwort: 'anderes123' }) });
await g2.req('/konto/anmelden', { method: 'POST', body: JSON.stringify({ email: 'zweite@example.ch', passwort: 'anderes123' }) });
pruefe('beide Geräte sind drin', [(await g1.req('/state')).status, (await g2.req('/state')).status], [200, 200]);
r = await g1.req('/konto/abmelden-ueberall', { method: 'POST' });
pruefe('überall abmelden geht', r.status, 200);
pruefe('das andere Gerät ist draussen', (await g2.req('/state')).status, 401);
pruefe('das eigene bleibt drin', (await g1.req('/state')).status, 200);

srv.kill('SIGTERM');
await warte(200);
fs.rmSync(WURZEL, { recursive: true, force: true });
console.log(bad ? `\n${bad} von ${n} Prüfungen fehlgeschlagen` : `\nalle ${n} Prüfungen bestanden`);
if (bad) console.log('\n--- Log des Dienstes ---\n' + serverlog);
process.exit(bad ? 1 : 0);
