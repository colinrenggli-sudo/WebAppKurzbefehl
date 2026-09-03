// Mobile-Check: Routen bei 390px Breite, mit Plan und Pro-Demo. Meldet horizontales Scrollen der Seite.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path'); const OUT = process.env.OUT || '/tmp/claude-0/-home-user-WebAppKurzbefehl/1ab56163-47c9-592e-bb87-e5dd7043ba1e/scratchpad/';
(async () => {
  const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const errors = []; page.on('pageerror', (e) => errors.push('pageerror: ' + e.message)); page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto('file://' + path.resolve(__dirname, '..', 'index.html')); await page.waitForTimeout(300);
  await page.locator('text=Demo-Daten laden').first().click(); await page.waitForTimeout(300);
  await page.evaluate(async () => { const p = await SW.solver.generate(SW.store.state, { seed: 5, timeMs: 1000 }); SW.store.setTimetable(p); SW.store.setSetting('proUnlocked', true); });
  const routes = (process.argv[2] || '#/dashboard,#/generator,#/stundenplan,#/portal,#/kalender,#/stellvertretung,#/einstellungen').split(',');
  for (const r of routes) { await page.evaluate((r) => (location.hash = r), r); await page.waitForTimeout(500); const w = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]); console.log(r, 'scrollWidth', w[0], w[0] > w[1] ? '⚠️ horizontal scroll' : 'ok'); await page.screenshot({ path: OUT + 'm-' + r.replace(/[^\w]/g, '') + '.png', fullPage: true }); }
  console.log(errors.length ? errors.join('\n') : 'keine Fehler');
  await browser.close();
})();
