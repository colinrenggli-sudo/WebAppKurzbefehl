// Browser-Smoke-Test: lädt index.html (file://), sammelt Konsolenfehler, macht Screenshots.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1360, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const url = 'file://' + path.resolve(__dirname, '..', 'index.html') + (process.argv[2] || '');
  await page.goto(url);
  await page.waitForTimeout(500);
  const out = process.argv[3] || '/tmp/claude-0/-home-user-WebAppKurzbefehl/1ab56163-47c9-592e-bb87-e5dd7043ba1e/scratchpad/smoke.png';
  // Demo laden, falls Willkommensdialog
  const demo = page.locator('text=Demo-Daten laden');
  if (await demo.count()) { await demo.first().click(); await page.waitForTimeout(400); }
  for (const route of (process.argv[4] || '#/dashboard').split(',')) {
    await page.evaluate((r) => (location.hash = r), route); await page.waitForTimeout(400);
    await page.screenshot({ path: out.replace('.png', '-' + route.replace(/[^\w]/g, '') + '.png'), fullPage: true });
  }
  console.log(errors.length ? errors.join('\n') : 'keine Fehler');
  await browser.close();
})();
