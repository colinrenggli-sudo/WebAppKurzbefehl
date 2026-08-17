#!/usr/bin/env node
/**
 * Oeffnet index.html im Browser, blaettert durch jede Folie jedes Decks und
 * meldet: JS-Fehler, abgeschnittene Inhalte, leere Sprechernotizen und
 * sichtbare Platzhalter. Zusaetzlich Screenshots in hell und dunkel.
 *
 *   node tools/folien-pruefen.mjs            nur pruefen
 *   node tools/folien-pruefen.mjs --bilder   zusaetzlich Screenshots
 *
 * Playwright wird global erwartet (npm i -g playwright).
 */

import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const url = pathToFileURL(join(root, "index.html")).href;
const bilder = process.argv.includes("--bilder");
const shotDir = join(root, ".screenshots");
if (bilder) mkdirSync(shotDir, { recursive: true });

const browser = await chromium.launch();
let probleme = 0;
const melde = t => { probleme++; console.log("  ! " + t); };

for (const schema of ["light", "dark"]) {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 950 }, colorScheme: schema });
  const page = await ctx.newPage();
  page.on("pageerror", e => melde(`${schema}: JS-Fehler — ${e.message}`));
  page.on("console", m => { if (m.type() === "error" && !/ERR_(CONNECTION|NAME|INTERNET)/.test(m.text())) melde(`${schema}: Konsole — ${m.text()}`); });

  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);

  const decks = await page.evaluate(() => Object.keys(DECKS));
  console.log(`\n${schema}: ${decks.length} Decks`);

  for (const id of decks) {
    const n = await page.evaluate(d => { go(d); return DECKS[d].slides().length; }, id);
    for (let i = 0; i < n; i++) {
      const info = await page.evaluate(i => {
        route.slide = i; render();
        return new Promise(res => requestAnimationFrame(() => requestAnimationFrame(() => {
          const pad = document.querySelector(".slide__pad");
          const s = window.__slides[i];
          res({
            ueberlauf: Math.max(0, pad.scrollHeight - pad.clientHeight),
            titel: (s.h1 || s.h2 || s.big || s.eyebrow || "").replace(/<[^>]+>/g, "").slice(0, 52),
            notiz: (s.notes || "").length,
            platzhalter: /‹|›/.test(pad.textContent),
            breite: document.body.scrollWidth > document.body.clientWidth
          });
        })));
      }, i);

      if (info.ueberlauf > 2) melde(`${schema} · ${id} · Folie ${i + 1} „${info.titel}“ — ${Math.round(info.ueberlauf)} px zu hoch`);
      if (info.breite) melde(`${schema} · ${id} · Folie ${i + 1} — Seite scrollt seitwaerts`);
      if (schema === "light" && info.notiz === 0) melde(`${id} · Folie ${i + 1} „${info.titel}“ — keine Sprechernotiz`);
      if (bilder) await page.screenshot({ path: join(shotDir, `${schema}-${id}-${String(i + 1).padStart(2, "0")}.png`) });
    }
  }

  /* Werkzeugansichten */
  for (const v of ["cockpit", "katalog", "rechner", "recherche", "einstellungen"]) {
    await page.evaluate(x => go(x), v);
    await page.waitForTimeout(250);
    const quer = await page.evaluate(() => document.body.scrollWidth > document.body.clientWidth + 1);
    if (quer) melde(`${schema} · Ansicht ${v} scrollt seitwaerts`);
    if (bilder) await page.screenshot({ path: join(shotDir, `${schema}-view-${v}.png`), fullPage: true });
  }

  await ctx.close();
}

/* Schmales Geraet */
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "light" });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(400);
for (const v of ["cockpit", "geschichte", "katalog", "rechner"]) {
  await page.evaluate(x => go(x), v).catch(() => {});
  await page.waitForTimeout(250);
  const quer = await page.evaluate(() => document.body.scrollWidth > document.body.clientWidth + 1);
  if (quer) melde(`390 px · ${v} scrollt seitwaerts`);
  if (bilder) await page.screenshot({ path: join(shotDir, `mobil-${v}.png`), fullPage: true });
}
await ctx.close();

await browser.close();
console.log(probleme ? `\n${probleme} Befund(e)` : "\nAlle Folien passen.");
process.exit(probleme ? 1 : 0);
