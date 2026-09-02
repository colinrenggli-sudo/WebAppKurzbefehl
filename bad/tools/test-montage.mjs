// Prüfskript für BADWERK. Ausführen aus bad/tools:  npm install && npx playwright install chromium && node test-montage.mjs
// Öffnet bad/index.html ab Datei, meldet jeden Konsolenfehler, legt Screenshots unter bad/tools/shots ab.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'shots') + path.sep; fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.join(HERE, '..', 'index.html');
const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 900, height: 1000 }, locale: 'de-CH' }); const p = await c.newPage(); const errs = [];
p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push('PAGEERROR ' + e.message + ' ' + (e.stack || '').split('\n')[1]));
// 1 Kunde Rossi waehlt Termin
await p.goto(URL + '?k=K0139'); await p.waitForTimeout(400);
await p.click('.po-slot >> nth=2'); await p.waitForTimeout(500); await p.screenshot({ path: OUT + '1-kunde-termin.png' });
console.log('rossi:', await p.evaluate(() => { const a = DB.auftraege.find(x => x.nr === 'A-2026-0139'); const t = DB.termine.find(x => x.id === a.terminId); return a.status + ' ' + (t && t.datum + ' ' + t.status) + ' mails:' + DB.post.slice(0, 2).map(m => m.art).join(','); }));
// 2 Monteur Aquatec (Gerber A-0140): bestaetigen
await p.goto(URL + '?m=M0140'); await p.waitForTimeout(400); await p.screenshot({ path: OUT + '2-monteur.png' });
await p.click('[data-act="portal.terminOk"]'); await p.waitForTimeout(400); await p.screenshot({ path: OUT + '3-monteur-bestaetigt.png' });
// 3 Fertigmeldung mit Unterschrift
const cv = await p.$('#sigCanvas'); await cv.scrollIntoViewIfNeeded(); await p.waitForTimeout(200); const bb = await cv.boundingBox();
await p.mouse.move(bb.x + 30, bb.y + 80); await p.mouse.down(); await p.mouse.move(bb.x + 150, bb.y + 50, { steps: 6 }); await p.mouse.move(bb.x + 260, bb.y + 100, { steps: 6 }); await p.mouse.up();
await p.fill('#moNotiz', 'Alles dicht, Kunde zufrieden'); await p.click('[data-act="portal.fertig"]'); await p.waitForTimeout(500); await p.screenshot({ path: OUT + '4-monteur-fertig.png' });
const st = await p.evaluate(() => { const a = DB.auftraege.find(x => x.nr === 'A-2026-0140'); const r = DB.rechnungen.find(x => x.id === a.rechnungId); return { status: a.status, abnahme: !!a.abnahme, rechnung: r && r.nr + ' ' + r.betrag + ' faellig ' + r.faellig, mail: DB.post[0].art + ': ' + DB.post[0].betreff }; });
console.log('gerber:', JSON.stringify(st));
// 4 Kunde sieht Rechnung mit Zahlteil, simuliert Zahlung
await p.goto(URL + '?k=K0140'); await p.waitForTimeout(500); await p.screenshot({ path: OUT + '5-kunde-rechnung.png', fullPage: true });
await p.click('[data-act="portal.bezahltDemo"]'); await p.waitForTimeout(500); await p.screenshot({ path: OUT + '6-kunde-archiv.png' });
await p.click('[data-act="portal.bewertung"][data-n="5"]'); await p.waitForTimeout(300);
console.log('nach zahlung:', await p.evaluate(() => { const a = DB.auftraege.find(x => x.nr === 'A-2026-0140'); return a.status + ' bewertung ' + a.bewertung + ' dok ' + (a.dokumente || []).length; }));
// 5 Konsole: Termine-Seite und Pipeline
await p.setViewportSize({ width: 1440, height: 900 }); await p.goto(URL); await p.waitForTimeout(300); for (const k of '1234') await p.click(`#keypad [data-k="${k}"]`); await p.waitForTimeout(400);
await p.evaluate(() => { location.hash = '#/termine'; }); await p.waitForTimeout(300); await p.screenshot({ path: OUT + '7-termine.png' });
await p.evaluate(() => { location.hash = '#/uebersicht'; }); await p.waitForTimeout(300); await p.screenshot({ path: OUT + '8-uebersicht.png' });
// 6 Termin per Telefon eintragen (Konsole) fuer Brunner-Auftrag? -> Huber ist teilgeliefert; Test mit Rossi bereits terminiert. Stornieren-Dialog pruefen
await p.evaluate(() => { location.hash = '#/auftrag/' + DB.auftraege.find(a => a.nr === 'A-2026-0143').id + '/termin'; }); await p.waitForTimeout(300); await p.screenshot({ path: OUT + '9-termin-vormerken.png' });
console.log(errs.length ? 'FEHLER:\n' + errs.join('\n') : 'keine Konsolenfehler');
await b.close();
