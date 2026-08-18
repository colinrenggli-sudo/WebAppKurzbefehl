#!/usr/bin/env node
/**
 * Bettet die Rechercheberichte aus recherche/*.md in index.html ein und
 * erzeugt daraus artifact.html (dieselbe Anwendung, aber ohne
 * <html>/<head>/<body>-Rahmen, wie es die Artifact-Veroeffentlichung erwartet).
 *
 *   node tools/inline-recherche.mjs
 *
 * Beide Ausgabedateien bleiben vollstaendig eigenstaendig: eine Datei,
 * keine Abhaengigkeiten ausser den Google-Schriften.
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const indexPath = join(root, "index.html");
const artifactPath = join(root, "artifact.html");
const rechercheDir = join(root, "recherche");

/* ---------- 1. Markdown einsammeln ---------- */

/**
 * NICHT einbetten: Diese Berichte bleiben lokale Arbeitsdokumente.
 * `10` enthaelt die ausformulierte Anleitung, wie die Kuendigung zu erzaehlen
 * ist; `11` nennt beide frueheren Arbeitgeber im Titel. Beides in einer Datei,
 * die geteilt und weitergeleitet werden kann, macht den Anonymitaets-Schalter
 * der Anwendung wirkungslos.
 */
const NICHT_EINBETTEN = ["10-pitch-narrativ.md", "11-firmen-kontext.md"];

const alle = readdirSync(rechercheDir)
  .filter(f => f.endsWith(".md"))
  .sort((a, b) => a.localeCompare(b, "de-CH"));

const files = alle.filter(f => !NICHT_EINBETTEN.includes(f));
const ausgelassen = alle.filter(f => NICHT_EINBETTEN.includes(f));

if (!files.length) {
  console.error("Keine Markdown-Dateien in " + rechercheDir);
  process.exit(1);
}

const blocks = files.map(f => {
  const raw = readFileSync(join(rechercheDir, f), "utf8");
  const h1 = raw.match(/^#\s+(.+)$/m);
  const title = (h1 ? h1[1] : f.replace(/\.md$/, "")).trim();

  // Ein </script> im Text wuerde den Block schliessen — deshalb neutralisieren.
  const safe = raw.replace(/<\/script/gi, "<\\/script");

  return `<script type="text/markdown" data-doc="${f}" data-title="${title
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")}">\n${safe}\n</script>`;
});

const payload = "<!-- RECHERCHE:START -->\n" + blocks.join("\n") + "\n<!-- RECHERCHE:END -->";

/* ---------- 2. In index.html einsetzen ---------- */

let html = readFileSync(indexPath, "utf8");
const marker = /<!-- RECHERCHE:START -->[\s\S]*?<!-- RECHERCHE:END -->/;

if (!marker.test(html)) {
  console.error("Marker RECHERCHE:START/END fehlt in index.html");
  process.exit(1);
}

html = html.replace(marker, () => payload);
writeFileSync(indexPath, html, "utf8");

/* ---------- 3. artifact.html erzeugen ---------- */

const fontLink = html.match(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis[^>]*>/);
const styleTag = html.match(/<style>[\s\S]*?<\/style>/);
const bodyInner = html.match(/<body>([\s\S]*)<\/body>/);

if (!fontLink || !styleTag || !bodyInner) {
  console.error("index.html hat nicht die erwartete Struktur (Schriften / <style> / <body>).");
  process.exit(1);
}

const titleTag = "<title>Bau &amp; Praxis</title>";
const artifact = [titleTag, fontLink[0], styleTag[0], bodyInner[1].trim()].join("\n");
writeFileSync(artifactPath, artifact, "utf8");

/* ---------- 4. Bericht ---------- */

const kb = n => (n / 1024).toFixed(0) + " KB";
console.log(`${files.length} Rechercheberichte eingebettet:`);
for (const f of files) console.log("  · " + f);
if (ausgelassen.length) {
  console.log("bewusst NICHT eingebettet (bleiben lokal):");
  for (const f of ausgelassen) console.log("  · " + f);
}
console.log(`index.html    ${kb(Buffer.byteLength(html))}`);
console.log(`artifact.html ${kb(Buffer.byteLength(artifact))}`);
