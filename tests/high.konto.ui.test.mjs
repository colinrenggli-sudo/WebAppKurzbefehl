// Prüft die Anmeldung so, wie sie am iPhone wirklich abläuft: App und Dienst
// auf DERSELBEN Herkunft, echter Keks, echter Abgleich.
//
//   node tests/high.konto.ui.test.mjs
//
// Ohne gleiche Herkunft wäre der Test wertlos – der Anmelde-Keks käme gar
// nicht erst mit, und genau daran scheitert so etwas im Betrieb.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { chromium, devices } from 'playwright';

process.env.TZ = 'Europe/Zurich';
const REPO = new URL('..', import.meta.url).pathname;
const WURZEL = fs.mkdtempSync(path.join(os.tmpdir(), 'high-ui-'));
const DATA = path.join(WURZEL, 'daten');
fs.mkdirSync(DATA, { recursive: true });

const TOK = 'test-token-abcdefghijklmnop';
// Zufällig gewählt: bleibt nach einem Absturz ein Server stehen, spräche der
// nächste Lauf sonst mit dem alten – und prüfte damit gar nichts.
const BASIS_PORT = 8300 + Math.floor(Math.random() * 400) * 2;
const DIENST_PORT = BASIS_PORT;
const APP_PORT = BASIS_PORT + 1;
const BASE = `http://127.0.0.1:${APP_PORT}/`;

let bad = 0, n = 0;
let srv = null, web = null, browser = null;
async function aufraeumen() {
  try { if (browser) await browser.close(); } catch (e) {}
  try { if (web) web.close(); } catch (e) {}
  try { if (srv) srv.kill('SIGKILL'); } catch (e) {}
  try { fs.rmSync(WURZEL, { recursive: true, force: true }); } catch (e) {}
}
process.on('exit', () => { try { if (srv) srv.kill('SIGKILL'); } catch (e) {} });
process.on('uncaughtException', async (e) => {
  console.log('\nAbbruch:', e && e.message);
  await aufraeumen();
  process.exit(1);
});
process.on('unhandledRejection', async (e) => {
  console.log('\nAbbruch:', (e && e.message) || e);
  await aufraeumen();
  process.exit(1);
});
const pruefe = (name, ist, soll) => {
  n++;
  if (JSON.stringify(ist) !== JSON.stringify(soll)) { bad++; console.log('FEHLT:', name, '\n   ist :', JSON.stringify(ist), '\n   soll:', JSON.stringify(soll)); }
  else console.log('ok:', name);
};
const ok = (name) => { n++; console.log('ok:', name); };
const warte = ms => new Promise(r => setTimeout(r, ms));

// ---- Dienst ----
srv = spawn('node', [path.join(REPO, 'deploy/high-sync/server.js')], {
  env: { ...process.env, TZ: 'Europe/Zurich', PORT: String(DIENST_PORT), DATA_DIR: DATA, SYNC_TOKEN: TOK },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let dienstLog = '';
srv.stdout.on('data', d => { dienstLog += d; });
srv.stderr.on('data', d => { dienstLog += d; });
for (let i = 0; i < 40; i++) { try { if ((await fetch(`http://127.0.0.1:${DIENST_PORT}/health`)).ok) break; } catch (e) {} await warte(150); }

// ---- App und Dienst unter einer Herkunft, so wie nginx es tut ----
const TYPEN = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml' };
web = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname.startsWith('/api/')) {
    const ziel = `http://127.0.0.1:${DIENST_PORT}${u.pathname.slice(4)}${u.search}`;
    const kopf = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (['host', 'connection', 'content-length'].includes(k)) continue;
      kopf[k] = v;
    }
    // Wie nginx: der Dienst muss erfahren, unter welcher Adresse der Browser
    // ihn anspricht – sonst hält er jede eigene Anfrage für eine fremde.
    kopf['x-forwarded-host'] = req.headers.host;
    const stuecke = [];
    for await (const c of req) stuecke.push(c);
    let antwort;
    try {
      antwort = await fetch(ziel, { method: req.method, headers: kopf, body: stuecke.length ? Buffer.concat(stuecke) : undefined, redirect: 'manual' });
    } catch (e) { res.writeHead(502); return res.end('proxy: ' + e.message); }
    const aus = {};
    antwort.headers.forEach((v, k) => { if (k === 'set-cookie') return; aus[k] = v; });
    const kekse = antwort.headers.getSetCookie ? antwort.headers.getSetCookie() : [];
    res.writeHead(antwort.status, kekse.length ? { ...aus, 'Set-Cookie': kekse } : aus);
    return res.end(Buffer.from(await antwort.arrayBuffer()));
  }
  const rel = u.pathname === '/' ? '/index.html' : u.pathname;
  const datei = path.join(REPO, rel.replace(/^\/+/, ''));
  if (!datei.startsWith(REPO) || !fs.existsSync(datei) || fs.statSync(datei).isDirectory()) { res.writeHead(404); return res.end('nicht da'); }
  res.writeHead(200, { 'Content-Type': TYPEN[path.extname(datei)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  res.end(fs.readFileSync(datei));
});
await new Promise(r => web.listen(APP_PORT, '127.0.0.1', r));

// ---- Browser ----
browser = await chromium.launch();
const iphone = devices['iPhone 14'];
const fehler = [];
async function neuerKontext() {
  const ctx = await browser.newContext({ ...iphone, colorScheme: 'dark', locale: 'de-CH', timezoneId: 'Europe/Zurich' });
  const page = await ctx.newPage();
  page.on('pageerror', e => fehler.push('pageerror: ' + e.message));
  page.on('console', m => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (/favicon|net::ERR/i.test(t)) return;
    // «Failed to load resource» ist Chromiums Netzwerkprotokoll, kein Fehler
    // der App: 404 (noch kein Zustand), 403 (falscher Code) und 401
    // (abgemeldet) sind hier genau die geprüften Antworten.
    if (/Failed to load resource/i.test(t)) return;
    fehler.push('console.error: ' + t);
  });
  return { ctx, page };
}
const einstellungen = async (page) => {
  // Steht das Blatt schon offen, wäre ein zweiter Klick auf das Zahnrad
  // nicht nur unnötig – er kommt gar nicht durch, das Blatt liegt davor.
  const offen = await page.evaluate(() => !!document.querySelector('#settingsSheet.show'));
  if (!offen) await page.click('#navSettings');
  await page.waitForSelector('#syncTitle', { timeout: 5000 });
};
const zuText = async (page, sel) => (await page.textContent(sel) || '').trim();
// Das Einstellungsblatt ist länger als ein iPhone-Bildschirm. Playwright
// scrollt zwar, kommt in einem Blatt mit Transform aber nicht überall hin –
// darum direkt anklicken.
async function klick(page, sel) {
  await page.waitForSelector(sel, { timeout: 10000 });
  await page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) throw new Error('nicht gefunden: ' + s);
    el.scrollIntoView({ block: 'center' });
    el.click();
  }, sel);
}

// ================================================================= 1
// Erststart: die Anmeldung ist das Erste, was man sieht – nicht etwas,
// das man in den Einstellungen suchen muss.
let { ctx, page } = await neuerKontext();
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForSelector('#kontoScreen.show', { timeout: 15000 });
ok('beim ersten Start steht die Anmeldung von selbst da');
pruefe('sie liegt nicht über den Einstellungen', await page.isVisible('#settingsSheet.show'), false);
pruefe('der Umschalter sieht aus wie einer', await page.evaluate(() => {
  const an = document.querySelector('#kontoSeg .seg.on');
  return !!an && an.dataset.modus === 'anmelden';
}), true);
pruefe('und es gibt kein Feld für irgendeinen Code', await page.locator('#kontoCode').count(), 0);

// ================================================================= 2
// Konto anlegen – ohne Code, wie bei jeder App.
await klick(page, '#kontoSeg button[data-modus="neu"]');
pruefe('der Umschalter springt um', await page.evaluate(() => {
  const an = document.querySelector('#kontoSeg .seg.on');
  return !!an && an.dataset.modus === 'neu';
}), true);
await page.fill('#kontoEmail', 'colin@example.ch');
await page.fill('#kontoPass', 'meinpasswort1');
await klick(page, '#kontoSendBtn');
await page.waitForFunction(() => !!(typeof S !== 'undefined' && S.device && S.device.angemeldetAls), null, { timeout: 15000 });
pruefe('nach dem Anlegen ist das Gerät angemeldet', await page.evaluate(() => S.device.angemeldetAls), 'colin@example.ch');
pruefe('und die Anmeldeseite ist weg', await page.isVisible('#kontoScreen.show'), false);

// ================================================================= 3
// Ein zu kurzes Passwort wird verständlich abgelehnt.
{
  const { ctx: c2, page: p2 } = await neuerKontext();
  await p2.goto(BASE, { waitUntil: 'networkidle' });
  await p2.waitForSelector('#kontoScreen.show', { timeout: 15000 });
  await klick(p2, '#kontoSeg button[data-modus="neu"]');
  await p2.fill('#kontoEmail', 'zuvorschnell@example.ch');
  await p2.fill('#kontoPass', 'kurz');
  await klick(p2, '#kontoSendBtn');
  await p2.waitForFunction(() => {
    const f = document.getElementById('kontoFehler');
    return !!(f && f.textContent.trim());
  }, null, { timeout: 15000 }).catch(() => {});
  pruefe('zu kurzes Passwort wird erklärt', /8 Zeichen/.test(await zuText(p2, '#kontoFehler')), true);
  pruefe('die Meldung ist auch sichtbar', await p2.isVisible('#kontoFehler'), true);
  pruefe('und niemand ist dadurch angemeldet', await p2.evaluate(() => S.device.angemeldetAls), null);
  await c2.close();
}

// ================================================================= 4
// Daten anlegen und prüfen, dass sie wirklich auf dem Server landen.
await page.evaluate(async () => {
  S.tasks.push({ id: 'ui1', label: 'Meditieren', emoji: '🧘', order: 0, days: [0,1,2,3,4,5,6], steps: [], updatedAt: Date.now(), completed: false });
  saveAll();
  await syncNow({ loud: true });
});
await page.waitForFunction(() => typeof lastSyncAt !== 'undefined' && lastSyncAt > 0, null, { timeout: 15000 });
const aufServer = await (await fetch(`http://127.0.0.1:${DIENST_PORT}/state`, { headers: { Cookie: '' } })).status;
pruefe('ohne Anmeldung gibt der Dienst nichts heraus', aufServer, 401);
const ordner = fs.readdirSync(path.join(DATA, 'k'));
pruefe('das Konto hat einen eigenen Ordner', ordner.length, 1);
const abgelegt = JSON.parse(fs.readFileSync(path.join(DATA, 'k', ordner[0], 'state.json'), 'utf8'));
pruefe('die Routine liegt im Konto auf dem Server',
  (abgelegt.state.tasks || []).some(t => t.label === 'Meditieren'), true);

// ================================================================= 5
// Neu laden: die Anmeldung muss halten, ohne dass etwas einzugeben ist.
await page.reload({ waitUntil: 'networkidle' });
await page.waitForFunction(() => !!(typeof S !== 'undefined' && S.device && S.device.angemeldetAls), null, { timeout: 15000 });
pruefe('nach dem Neuladen immer noch angemeldet', await page.evaluate(() => S.device.angemeldetAls), 'colin@example.ch');
await einstellungen(page);
{
  const titel = await zuText(page, '#syncTitle');
  const unter = await zuText(page, '#syncSub');
  pruefe('die Einstellungen zeigen das Konto', /Angemeldet/.test(titel) ? true : titel, true);
  pruefe('und die E-Mail steht darunter', /colin@example\.ch/.test(unter) ? true : unter, true);
}
pruefe('Abmelden wird angeboten', await page.isVisible('[data-act="kontoAbmelden"]'), true);
pruefe('Passwort ändern auch', await page.isVisible('[data-act="kontoPasswort"]'), true);

// ================================================================= 6
// Ein zweites Gerät: anmelden genügt, die Daten kommen von selbst.
{
  const { ctx: c3, page: p3 } = await neuerKontext();
  await p3.goto(BASE, { waitUntil: 'networkidle' });
  await p3.waitForSelector('#kontoScreen.show', { timeout: 15000 });
  await p3.fill('#kontoEmail', 'colin@example.ch');
  await p3.fill('#kontoPass', 'meinpasswort1');
  await klick(p3, '#kontoSendBtn');
  await p3.waitForFunction(() => !!(typeof S !== 'undefined' && S.device && S.device.angemeldetAls), null, { timeout: 15000 });
  ok('das zweite Gerät meldet sich mit E-Mail und Passwort an');
  try {
    await p3.waitForFunction(() => S.tasks.some(t => t.label === 'Meditieren'), null, { timeout: 20000 });
    ok('und hat die Routine ohne weiteres Zutun');
  } catch (e) {
    n++; bad++;
    console.log('FEHLT: und hat die Routine ohne weiteres Zutun');
    console.log('   Status :', await p3.evaluate(() => (typeof syncStatusText !== 'undefined' ? syncStatusText : '?')));
    console.log('   Routinen:', await p3.evaluate(() => S.tasks.map(t => t.label)));
    console.log('   lastSync:', await p3.evaluate(() => (typeof lastSyncAt !== 'undefined' ? lastSyncAt : '?')));
  }
  pruefe('ein falsches Passwort kommt nicht durch', await p3.evaluate(async () => {
    const r = await kontoRuf('/konto/anmelden', { email: 'colin@example.ch', passwort: 'falsch123' });
    return r.status;
  }), 401);
  await c3.close();
}

// ================================================================= 7
// Abmelden: der Abgleich hört auf, die Daten bleiben auf dem Gerät.
await klick(page, '[data-act="kontoAbmelden"]');
// Der Bestätigungsdialog: den Knopf im gerade geöffneten Blatt nehmen, nicht
// irgendeinen mit demselben Namen weiter oben in den Einstellungen.
await page.waitForTimeout(400);
await page.evaluate(() => {
  const blatt = [...document.querySelectorAll('.sheet.open, .sheet[style*="display"]')].pop();
  const knopf = [...document.querySelectorAll('.sheet button')].filter(b => /^Abmelden$/.test(b.textContent.trim())).pop();
  if (knopf) knopf.click();
});
await page.waitForFunction(() => !(typeof S !== 'undefined' && S.device && S.device.angemeldetAls), null, { timeout: 10000 });
pruefe('nach dem Abmelden ist das Konto weg', await page.evaluate(() => S.device.angemeldetAls), null);
pruefe('die Routine bleibt aber auf dem Gerät', await page.evaluate(() => S.tasks.some(t => t.label === 'Meditieren')), true);

// ================================================================= 8
// Wieder anmelden – und alles ist zurück.
await einstellungen(page);
await klick(page, '[data-act="kontoOeffnen"]');
await page.waitForSelector('#kontoScreen.show', { timeout: 10000 });
await page.fill('#kontoEmail', 'colin@example.ch');
await page.fill('#kontoPass', 'meinpasswort1');
await klick(page, '#kontoSendBtn');
await page.waitForFunction(() => !!(typeof S !== 'undefined' && S.device && S.device.angemeldetAls), null, { timeout: 15000 });
pruefe('erneutes Anmelden geht', await page.evaluate(() => S.device.angemeldetAls), 'colin@example.ch');

pruefe('keine Fehler in der Konsole', fehler, []);

await ctx.close();
await aufraeumen();
await warte(200);
console.log(bad ? `\n${bad} von ${n} Prüfungen fehlgeschlagen` : `\nalle ${n} Prüfungen bestanden`);
if (bad) console.log('\n--- Log des Dienstes ---\n' + dienstLog);
process.exit(bad ? 1 : 0);
