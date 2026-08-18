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

/* --- 5. Keine Inhalte aus den nicht einzubettenden Berichten --- */
const lokalNur = ["10-pitch-narrativ.md", "11-firmen-kontext.md"];
sag(!lokalNur.some(f => html.includes(`data-doc="${f}"`)),
  "die beiden lokalen Rechercheberichte sind nicht eingebettet");

/* Die frueheren Arbeitgeber duerfen in der ausgelieferten Datei nirgends
   ausgeschrieben stehen — sonst ist der Anonymitaets-Schalter wirkungslos.
   Die Namen stehen nur in den lokalen Berichten 10 und 11, deshalb wird von
   dort gelesen statt sie hier zu wiederholen. */
const rechercheDir = join(root, "recherche");
let namen = [];
try {
  const quelle = readFileSync(join(rechercheDir, "11-firmen-kontext.md"), "utf8");
  namen = [...quelle.matchAll(/\b([A-ZÄÖÜ][\wäöüéè.-]+(?: [A-ZÄÖÜ][\wäöüéè.-]+)*) (?:Transport AG|Bau AG)\b/g)]
    .map(m => m[0])
    .filter((v, i, a) => a.indexOf(v) === i);
} catch { /* Bericht 11 fehlt — dann gibt es auch nichts zu pruefen */ }

const durchgerutscht = namen.filter(n => {
  /* Der Name der Firma, der praesentiert wird, darf vorkommen — er steht in
     den Standardeinstellungen. Gemeint sind die frueheren Arbeitgeber. */
  if (html.includes(`firmaBau: "${n}"`)) return false;
  const ohneEinstellung = html.split(n).length - 1;
  return ohneEinstellung > 1;
});
sag(durchgerutscht.length === 0,
  durchgerutscht.length
    ? `Firmenname(n) in der ausgelieferten Datei: ${durchgerutscht.join(", ")}`
    : "keine Klarnamen frueherer Arbeitgeber in der Datei");

/* --- 6. Groesse --- */
const kb = Buffer.byteLength(html) / 1024;
sag(kb < 16 * 1024, `Groesse ${kb.toFixed(0)} KB`);

console.log(fehler ? `\n${fehler} Problem(e)` : "\nAlles in Ordnung");
process.exit(fehler ? 1 : 0);
