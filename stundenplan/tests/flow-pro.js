// Prüft Portal, Einstellungen und die Pro-Ansichten (Kalender, Stellvertretung) mit Plan und freigeschalteter Demo.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path'); const OUT = process.env.OUT || '/tmp/claude-0/-home-user-WebAppKurzbefehl/1ab56163-47c9-592e-bb87-e5dd7043ba1e/scratchpad/';
(async () => {
  const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1360, height: 900 } });
  const errors = []; page.on('pageerror', (e) => errors.push('pageerror: ' + e.message)); page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto('file://' + path.resolve(__dirname, '..', 'index.html')); await page.waitForTimeout(300);
  await page.locator('text=Demo-Daten laden').first().click(); await page.waitForTimeout(300);
  await page.evaluate(async () => { const p = await SW.solver.generate(SW.store.state, { seed: 5, timeMs: 1500 }); SW.store.setTimetable(p); SW.store.setSetting('proUnlocked', true); });
  const routes = (process.argv[2] || '#/portal,#/kalender,#/stellvertretung,#/einstellungen').split(',');
  for (const r of routes) { await page.evaluate((r) => (location.hash = r), r); await page.waitForTimeout(500); await page.screenshot({ path: OUT + 'pro-' + r.replace(/[^\w]/g, '') + '.png', fullPage: true }); }
  // Stellvertretung: Absenz öffnen und automatisch lösen
  await page.evaluate(() => (location.hash = '#/stellvertretung')); await page.waitForTimeout(400);
  const cards = page.locator('.card-h'); if (await cards.count()) { await cards.first().click(); await page.waitForTimeout(400); const auto = page.locator('button:has-text("Alle automatisch lösen")'); if (await auto.count()) { await auto.first().click(); await page.waitForTimeout(400); } await page.screenshot({ path: OUT + 'pro-subs-detail.png', fullPage: true }); }
  console.log('substitutes', await page.evaluate(() => JSON.stringify(SW.store.state.absences.map((a) => Object.keys(a.substitutes || {}).length))));
  // Kalender: Eintrag erfassen
  await page.evaluate(() => (location.hash = '#/kalender')); await page.waitForTimeout(400);
  await page.click('button:has-text("Eintrag erfassen")'); await page.waitForTimeout(200); await page.click('.modal-f button.primary'); await page.waitForTimeout(300);
  console.log('timeEntries', await page.evaluate(() => SW.store.state.timeEntries.length));
  // Rolle Lehrperson
  await page.evaluate(() => { SW.store.setSetting('role', 'teacher'); location.hash = '#/portal'; }); await page.waitForTimeout(500); await page.screenshot({ path: OUT + 'pro-portal-teacher.png', fullPage: true });
  await page.emulateMedia({ colorScheme: 'dark' }); await page.evaluate(() => (location.hash = '#/kalender')); await page.waitForTimeout(400); await page.screenshot({ path: OUT + 'pro-kalender-dark.png', fullPage: true });
  console.log(errors.length ? errors.join('\n') : 'keine Fehler');
  await browser.close();
})();
