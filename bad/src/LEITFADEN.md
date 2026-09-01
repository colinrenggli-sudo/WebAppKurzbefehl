# BADWERK – Leitfaden für die Entwicklung

Die App ist eine Datei (`bad/index.html`), gebaut aus `bad/src/` mit
`python3 build.py --check`. Vanilla JS, kein Framework, kein Bundler.
Alles läuft ab Datei (`file://`), ab `python3 -m http.server` und ab
GitHub Pages. Sprache: Schweizer Hochdeutsch («ss», keine «ß»),
Formate de-CH (CHF 1'234.55, TT.MM.JJJJ).

## Dateien und Reihenfolge

| Datei | Inhalt |
|---|---|
| `head.html` | `<head>` ohne Styles (Meta, Titel, Icon, Manifest) |
| `10-tokens.css` … `27-badwerk.css` | Styles, in Nummernreihenfolge |
| `body.html` | Symbolvorrat (`<symbol id="i-…">`), Anmeldung, Konsole `#desk`, Lager-App `#field`, Portale `#portal`, `#ovlHost`, `#toasts` |
| `30-core.js` | `$`, `$$`, `h` (HTML-Escape), `ic('i-name')`, `uid`, `sum`, `by`, `grp`, `Fmt`, `D`, `token()`, `kuerz`, `anrede` |
| `31-store.js` | `DB`, `Store`, `Uhr` (Demo-Uhr), `Q` (Zugriffshelfer) |
| `32-session.js` | `S` (Sitzung), `Login` |
| `33-sync.js` | `Sync` (Firestore, ohne Bibliothek) |
| `34-ui.js` | `UI.toast`, `UI.dialog`, `UI.bestaetigen`, `UI.formular` |
| `35-nav.js` | `Nav` (Routen), `Act` (Aktionsregister) |
| `36-desk.js` | `Desk` (Konsole: Seitenregister, Werkzeuge) |
| `37-lager.js` | `Fld` (Lager-App: Seiten, Kopf, Erklärspalte) |
| `38-portal.js` | `Portal` (Kunde/Lieferant/Monteur/Partner über Token) |
| `40-qr.js` | `BWQR.svg(text, {size, ecc, swissCross})`, `BWQR.billPayload`, `BWQR.validateBill`, `BWQR.qrReference` |
| `41-cap.js` | `BWCap.signature(canvas)`, `BWCap.scan({onCode})`, `BWCap.photo()` |
| `43-mail.js` | `Mail.anlegen(db, {...})`, `Mail.senden(id)`, `Mail.mailto(m)`, `Mail.link('k', token)`, `Mail.brief(...)` |
| `44-kalender.js` | `Kal.ics`, `Kal.icsHerunterladen`, `Kal.google`, `Kal.calendly`, `Kal.freieSlots` |
| `50-domain.js` | Fachlogik: Preise, Stückliste, Zustandsautomat, Übergänge |
| `51-auto.js` | `Auto.laufen(grund)`: alle Automationen (Lieferfrist, Eskalation, Rechnung, Mahnung) |
| `60-…` | Konsolen-Seiten (`Desk.seiten.xyz = rest => html`) |
| `70-…` | Tablet-Offerte |
| `80-…` | Lager-App-Seiten (`Fld.seiten.scan = (rest, ich) => html`) |
| `85-…` | Portale (`Portal.seiten.kunde = token => ({kopf, html, fuss})`) |
| `90-doc.js` | A4-Dokumente (Offerte, Auftragsbestätigung, Auftragsblatt, Rechnung mit Zahlteil) |
| `98-seed.js` | `BWSeed.build()` – Demodaten, `BWSeed.VERSION` |
| `99-boot.js` | Start |

Jede Datei ist ein eigener `<script>`-Block: oben deklarierte `const`
sind global sichtbar. Keine `import`/`export`, kein `</script>` im Code
(als `<\/script>` schreiben).

## Grundregeln

1. **Jede Datenänderung über `Store.aendern(titel, db => {...})`.** Das
   speichert, erlaubt Rückgängig, versioniert (`rev`) und stösst den
   Sync an. `titel` erscheint als Toast mit «Rückgängig»; `false` als
   drittes Argument unterdrückt den Toast.
2. **Jeder Wert aus den Daten läuft durch `h()`**, wenn er ins HTML
   kommt. Ausnahme: HTML, das die App selbst erzeugt hat.
3. **Klicks über `data-act="ns.fn"`**, nie `onclick`. Das Modul hängt
   seinen Namensraum ans Register: `Act.offerte = { start(el, ev) {...} }`.
   Für `change`/`input` gibt es `data-change` und `data-input`.
   Parameter kommen aus `el.dataset` (`data-id`, `data-v` …).
4. **Zeit immer über `D.heute()` und `D.jetztIso()`**, nie `new Date()`
   direkt – sonst ignoriert der Code die Demo-Uhr.
5. **Ereignisse protokollieren:** `Store.log(typ, text, auftragId, icon)`
   schreibt in den Aktivitätsstrom und in `auftrag.verlauf`.
6. **Neu zeichnen** nach einer Änderung: `Nav.zeichnen()` (aktuelle Seite).
7. Seiten liefern HTML als String; alles, was nach dem Einsetzen
   passieren muss (Canvas, Fokus, Scanner), gehört in
   `Desk.nachZeichnen[route]` bzw. `Fld.nachZeichnen[route]`.

## Konsole (PC und Tablet)

```js
Desk.seiten.auftraege = rest => `<div class="pg"> … </div>`;
Desk.titel.auftraege = 'Aufträge';
Desk.nachZeichnen.auftraege = rest => { /* optional */ };
Desk.tools('<button class="btn primary" data-act="auftrag.neu">Neu</button>');
```

`rest` sind die weiteren Pfadteile: `#/auftrag/a-1001/lieferung` →
`Desk.seiten.auftrag(['a-1001','lieferung'])`.

Layout-Bausteine (siehe `23-desk.css`, `21-bausteine.css`):
`.pg` (Seite), `.kpis > .kpi` (Kennzahlen: `.lbl`, `.val`, `.dt`),
`.card` / `.card.pad` / `.card-h h3` / `.card-b`, `.sec-h h3`,
`.split` (zwei Spalten), `.stack`, `.grid.g2/.g3/.g4`, `.tbl-wrap >
table.tbl` (Zellen `.r` rechts, `.c` mittig; `tr.click`), `.tabs button
[aria-selected]`, `.dl dt/dd`, `.chip` (`.tint .ok .warn .err .info
.lila .cyan`, `.dot`), `.chip.st.st-<status>` (Statusfarbe), `.banner
(.warn .err .ok)`, `.empty` (leerer Zustand), `.btn` (`.primary .ghost
.soft .danger .ok .sm .lg .icon .wide`), `.field > label + .inp`,
`.seg button[aria-selected]`, `.sw` (Schalter), `.ava`, `.bar > i`.

BADWERK-Bausteine (`27-badwerk.css`): `.steps > .step(.done .now) > .n`,
`.pgrid > .pcard[aria-pressed]` (`.ic`, `.ttl`, `.sub`, `.prc`, `.chk`,
`.tag`), `.ogrid > .ocard`, `.opt-row[aria-pressed]` (`.bx`, `.bd`,
`.amt`, `.marge`), `.pakete > .paket`, `.tl > .tl-i` (Verlauf),
`.flow > .f(.done .now .warn)`, `.mail-split / .mail-i / .mail-v`,
`.qr-grid > .qr-card`, `.pay-tabs`, `.twint-box`, `.sig-box canvas`,
`.pipe > .pipe-col > .pipe-card`, `.todo > .todo-i`, `.uhr`, `.a4`,
`.zahlteil`.

## Lager-App (Handy)

```js
Fld.seiten.scan = (rest, ich) => { Fld.kopf('Scannen', 'Lager Luzern'); return `<div class="fld-inner">…</div>`; };
Fld.erklaerung.scan = { titel: '…', text: '…', schritte: [['Titel', 'Text'], …] };
```

Bausteine aus `24-field.css`: `.fld-inner`, `.fcard(.pad)`, `.fcard-h h3`,
`.ftask` (Listeneintrag mit `.top .tm .bd .adr .foot`), `.bigcheck`,
`.opts > .opt[aria-pressed]`, `.stepnum`, `.fld-act > .btn` (Leiste
unten), `.stepper > .st(.done .now)`, `.sig-pad`, `.photos > .photo`.

## Portale

```js
Portal.seiten.kunde = token => { const o = Q.offerteMitToken(token); if (!o) return null;
  return { kopf: '', html: `<div class="po-hero">…</div>`, fuss: '' }; };
Portal.nachZeichnen.kunde = token => { /* Unterschrift-Canvas */ };
```

Bausteine `26-portal.css`: `.po-hero` (`.eyebrow`, `h1`, `p`),
`.po-steps > .st(.done .now)`, `.po-cta`, `.po-lines > .po-line(.total)`,
`.po-sig canvas`, `.po-slots > .po-slot[aria-pressed]`, `.po-ok`.

Links erzeugen: `Mail.link('k', offerte.token)`, `Mail.link('l',
bestellung.token)`, `Mail.link('m', termin.token)`, `Mail.link('p',
partner.token)`, `Mail.link('scan', lagerposition.code)`.

## Dialoge

```js
UI.dialog({ titel, unter, weite: 'slim'|'wide', inhalt: html, aktionen: [{ text, art: 'primary', fn: w => {...}, schliesst: false }], beimOeffnen: w => {}, beimSchliessen });
await UI.bestaetigen('Titel', 'Text', 'Ja, löschen', 'danger');
const werte = await UI.formular('Titel', [{ k: 'name', label: 'Name', pflicht: true }, { k: 'typ', label: 'Typ', typ: 'select', optionen: [{ v: 'a', t: 'A' }] }], 'Speichern');
UI.toast('Gespeichert', 'ok');
```

## Datenmodell (Kurzfassung, Details in 98-seed.js)

`DB.betrieb`, `DB.benutzer`, `DB.kunden`, `DB.objekte`, `DB.artikel`,
`DB.lieferanten`, `DB.offerten`, `DB.auftraege`, `DB.bestellungen`,
`DB.lagerpositionen`, `DB.termine`, `DB.rechnungen`, `DB.post`,
`DB.partner`, `DB.showroomTermine`, `DB.ereignisse`, `DB.uhr`.
Zugriff über `Q.kunde(id)`, `Q.auftrag(id)`, `Q.bestellungenVon(aid)` usw.
