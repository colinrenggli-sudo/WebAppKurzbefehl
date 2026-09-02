// Prüfskript für BADWERK. Ausführen aus bad/tools:  npm install && npx playwright install chromium && node test-routen.mjs
// Öffnet bad/index.html ab Datei, meldet jeden Konsolenfehler, legt Screenshots unter bad/tools/shots ab.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'shots') + path.sep; fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + path.join(HERE, '..', 'index.html');
const b = await chromium.launch();
const fehler = {};
async function ctx(vp) { const c = await b.newContext({ viewport: vp, locale: 'de-CH' }); const p = await c.newPage(); let cur = 'start'; p.on('console', m => { if (m.type() === 'error') (fehler[cur] = fehler[cur] || []).push(m.text().slice(0, 300)); }); p.on('pageerror', e => (fehler[cur] = fehler[cur] || []).push('PAGEERROR ' + e.message + ' @ ' + (e.stack || '').split('\n')[1])); return { c, p, set: r => { cur = r; } }; }
// Konsole
{
  const { c, p, set } = await ctx({ width: 1440, height: 950 });
  await p.goto(URL); await p.waitForTimeout(300);
  for (const k of '1234') await p.click(`#keypad [data-k="${k}"]`); await p.waitForTimeout(400);
  const ids = await p.evaluate(() => ({ a: DB.auftraege.map(a => a.id), k: DB.kunden[0].id, l: DB.lieferanten[1].id, m: DB.post[0].id, o: DB.offerten.find(o => o.status === 'entwurf').id }));
  const routen = ['uebersicht', 'auftraege', ...ids.a.flatMap(a => ['auftrag/' + a, 'auftrag/' + a + '/lieferung', 'auftrag/' + a + '/lager', 'auftrag/' + a + '/termin', 'auftrag/' + a + '/dokumente', 'auftrag/' + a + '/post', 'auftrag/' + a + '/verlauf']), 'offerten', 'offerte', 'offerte/' + ids.o, 'showroom', 'kunden', 'kunden/' + ids.k, 'bestellungen', 'bestellungen/' + ids.l, 'lager', 'post', 'post/' + ids.m, 'termine', 'partner', 'rechnungen', 'archiv', 'artikel', 'einstellungen'];
  for (const r of routen) { set(r); await p.evaluate(r => { location.hash = '#/' + r; }, r); await p.waitForTimeout(250); const leer = await p.evaluate(() => !document.querySelector('#deskview').innerHTML.trim()); if (leer) (fehler[r] = fehler[r] || []).push('LEERE SEITE'); if (!r.includes('/') || r.startsWith('auftrag/' + ids.a[3])) await p.screenshot({ path: OUT + r.replace(/[\/]/g, '_') + '.png' }); }
  // Dokumente oeffnen (neues Fenster)
  set('doc');
  const [w1] = await Promise.all([c.waitForEvent('page'), p.evaluate(() => Act.doc.qrbogen({ dataset: { id: DB.auftraege[0].id } }))]); await w1.waitForTimeout(400); await w1.screenshot({ path: OUT + 'doc-qrbogen.png', fullPage: true });
  const [w2] = await Promise.all([c.waitForEvent('page'), p.evaluate(() => Act.doc.rechnung({ dataset: { id: DB.rechnungen.find(r => r.art === 'schluss').id } }))]); await w2.waitForTimeout(400); await w2.screenshot({ path: OUT + 'doc-rechnung.png', fullPage: true });
  const [w3] = await Promise.all([c.waitForEvent('page'), p.evaluate(() => Act.doc.offerte({ dataset: { id: DB.offerten.find(o => o.status === 'angezahlt').id } }))]); await w3.waitForTimeout(400); await w3.screenshot({ path: OUT + 'doc-offerte.png', fullPage: true });
  const [w4] = await Promise.all([c.waitForEvent('page'), p.evaluate(() => Act.doc.auftragsblatt({ dataset: { id: DB.auftraege.find(a => a.terminId).id } }))]); await w4.waitForTimeout(400); await w4.screenshot({ path: OUT + 'doc-auftragsblatt.png', fullPage: true });
  // Demo-Uhr +2 / +10
  set('uhr'); await p.evaluate(() => { location.hash = '#/uebersicht'; }); await p.waitForTimeout(200);
  await p.click('[data-act="uhr.springen"][data-n="1"]'); await p.waitForTimeout(300); await p.click('[data-act="uhr.springen"][data-n="1"]'); await p.waitForTimeout(400);
  console.log('nach +2:', JSON.stringify(await p.evaluate(() => DB.post.slice(0, 4).map(m => m.art + ': ' + m.betreff))));
  await p.click('[data-act="uhr.springen"][data-n="7"]'); await p.waitForTimeout(300); await p.click('[data-act="uhr.springen"][data-n="1"]'); await p.waitForTimeout(400);
  console.log('nach +10:', JSON.stringify(await p.evaluate(() => ({ mails: DB.post.slice(0, 5).map(m => (m.status === 'entwurf' ? '[ENTWURF] ' : '') + m.art + ': ' + m.betreff), stufen: DB.bestellungen.filter(b => b.mahnstufe).map(b => b.nr + ' S' + b.mahnstufe) }))));
  await p.screenshot({ path: OUT + 'uhr-plus10.png' });
  await p.evaluate(() => { location.hash = '#/post'; }); await p.waitForTimeout(300); await p.screenshot({ path: OUT + 'post-plus10.png' });
  await p.click('[data-act="uhr.springen"][data-n="0"]'); await p.waitForTimeout(300);
  // Tokens fuer Portale
  const tok = await p.evaluate(() => ({ k: DB.auftraege.find(a => a.status === 'bereit').token, k2: DB.auftraege.find(a => a.status === 'verrechnet').token, k3: DB.offerten.find(o => o.status === 'offen').token, l: DB.bestellungen.find(b => b.status === 'gesendet').token, l2: DB.bestellungen.find(b => b.status === 'bestaetigt').token, m: DB.termine.find(t => t.status === 'bestaetigt' && DB.auftraege.find(a => a.id === t.auftragId).status === 'terminiert') ? DB.termine.find(t => t.status === 'bestaetigt').token : DB.termine[0].token, p: DB.partner[0].token, scan: DB.lagerpositionen.find(l => l.status === 'erwartet').code }));
  await c.close();
  // Portale
  const { c: c2, p: p2, set: set2 } = await ctx({ width: 820, height: 1100 });
  for (const [n, q] of [['portal-kunde-bereit', '?k=' + tok.k], ['portal-kunde-rechnung', '?k=' + tok.k2], ['portal-kunde-offerte', '?k=' + tok.k3], ['portal-lieferant', '?l=' + tok.l], ['portal-lieferant-ab', '?l=' + tok.l2], ['portal-monteur', '?m=' + tok.m], ['portal-partner', '?p=' + tok.p]]) { set2(n); await p2.goto(URL + q); await p2.waitForTimeout(400); await p2.screenshot({ path: OUT + n + '.png', fullPage: n.includes('rechnung') }); }
  // Partner-Tabs
  set2('portal-partner-tabs'); for (const t of ['kunden', 'montage', 'abrechnung']) { await p2.click(`[data-act="portal.tab"][data-v="${t}"]`); await p2.waitForTimeout(250); await p2.screenshot({ path: OUT + 'portal-partner-' + t + '.png' }); }
  await c2.close();
  // Lager-App am Handy inkl. Scan-Link
  const { c: c3, p: p3, set: set3 } = await ctx({ width: 390, height: 844 });
  set3('scan-link'); await p3.goto(URL + '?scan=' + tok.scan); await p3.waitForTimeout(300); await p3.screenshot({ path: OUT + 'lager-login-scan.png' });
  for (const k of '98765') await p3.click(`#keypad [data-k="${k}"]`); await p3.waitForTimeout(500); await p3.screenshot({ path: OUT + 'lager-buchung.png' });
  console.log('scan hash:', await p3.evaluate(() => location.hash));
  set3('scan-ok'); await p3.click('[data-act="lager.ok"]'); await p3.waitForTimeout(400); await p3.screenshot({ path: OUT + 'lager-gebucht.png' });
  for (const r of ['l/scan', 'l/erwartet', 'l/auftraege', 'l/mehr']) { set3(r); await p3.evaluate(r => { location.hash = '#/' + r; }, r); await p3.waitForTimeout(250); await p3.screenshot({ path: OUT + r.replace('/', '_') + '.png' }); }
  set3('scan-schaden'); await p3.evaluate(() => { location.hash = '#/l/scan/' + DB.lagerpositionen.find(l => l.status === 'erwartet').code; }); await p3.waitForTimeout(300); await p3.click('[data-act="lager.schadenAuf"]'); await p3.waitForTimeout(200); await p3.fill('#schadenNotiz', 'Karton eingedrückt'); await p3.click('[data-act="lager.schaden"]'); await p3.waitForTimeout(400); await p3.screenshot({ path: OUT + 'lager-schaden.png' });
  // Lager-App im Telefonrahmen am grossen Bildschirm
  const p4 = await c3.newPage(); await p4.setViewportSize({ width: 1300, height: 900 }); set3('lager-desktop'); await p4.goto(URL); await p4.waitForTimeout(300); await p4.evaluate(() => { location.hash = '#/l/scan'; }); await p4.waitForTimeout(400); await p4.screenshot({ path: OUT + 'lager-desktop.png' });
  await c3.close();
}
await b.close();
const n = Object.values(fehler).reduce((s, a) => s + a.length, 0);
console.log(n ? 'FEHLER (' + n + '):\n' + Object.entries(fehler).map(([r, a]) => r + '\n  ' + [...new Set(a)].join('\n  ')).join('\n') : 'keine Konsolenfehler auf allen Routen');
