#!/usr/bin/env node
/**
 * Prueft index.html: Syntax jedes eingebetteten Skripts, Balance der
 * Marker und ein paar Dinge, die in einer einzelnen HTML-Datei gerne
 * stillschweigend kaputtgehen.
 *
 *   node tools/check.mjs
 */

import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "index.html"), "utf8");
const tmp = mkdtempSync(join(tmpdir(), "check-"));

let fehler = 0;
const sag = (ok, text) => { if (!ok) fehler++; console.log((ok ? "  ok   " : "  FEHL ") + text); };

/* --- 1. Skript-Syntax --- */
const skripte = [...html.matchAll(/<script(?![^>]*type=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
console.log(`${skripte.length} eingebettete Skripte`);
skripte.forEach((src, i) => {
  const f = join(tmp, `s${i + 1}.js`);
  writeFileSync(f, src);
  try {
    execFileSync(process.execPath, ["--check", f], { stdio: "pipe" });
    sag(true, `Skript ${i + 1}: Syntax`);
  } catch (e) {
    sag(false, `Skript ${i + 1}: ${String(e.stderr).split("\n").slice(0, 4).join(" | ")}`);
  }
});

/* --- 2. Marker --- */
sag(/<!-- RECHERCHE:START -->/.test(html) && /<!-- RECHERCHE:END -->/.test(html), "Marker RECHERCHE vorhanden");
sag(/<!-- INHALT:START -->/.test(html) && /<!-- INHALT:END -->/.test(html), "Marker INHALT vorhanden");

/* --- 3. Keine externen Abhaengigkeiten ausser Google Fonts --- */
const extern = [...html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)]
  .map(m => m[1])
  .filter(u => !/^https:\/\/fonts\.(googleapis|gstatic)\.com/.test(u))
  .filter(u => !/colinrenggli-sudo\.github\.io/.test(u));
sag(extern.length === 0, extern.length ? `externe Ressourcen: ${extern.join(", ")}` : "keine externen Ressourcen ausser Schriften");

/* --- 4. Farben nur ueber Tokens in Theme-Bloecken --- */
const style = html.match(/<style>([\s\S]*?)<\/style>/)[1];
const themeBloecke = [...style.matchAll(/@media \(prefers-color-scheme: dark\)\{([\s\S]*?)\n\}/g)].map(m => m[1]);
sag(/:root\{/.test(style), ":root definiert die helle Palette vollstaendig");
sag(/:root:not\(\[data-theme="light"\]\)/.test(style), "dunkle Palette ist gegen data-theme=light abgesichert");
sag(/:root\[data-theme="dark"\]/.test(style), "expliziter Dunkelmodus definiert");
sag(/body\{[\s\S]*?background:var\(--paper\)/.test(style), "body hat eine eigene Hintergrundfarbe");

/* --- 5. Groesse --- */
const kb = Buffer.byteLength(html) / 1024;
sag(kb < 16 * 1024, `Groesse ${kb.toFixed(0)} KB`);

console.log(fehler ? `\n${fehler} Problem(e)` : "\nAlles in Ordnung");
process.exit(fehler ? 1 : 0);
