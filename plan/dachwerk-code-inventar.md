# Code-Inventar dach/index.html (10'356 Zeilen) — selbst gemessen

| Block | Zeilen | LOC | Schicht | Schicksal in der Plattform |
|---|---|---|---|---|
| Design-System (CSS) | 163–988 | 825 | Darstellung | bleibt fast ganz (Tokens, Sonnenmodus, Touchmasse) |
| Helfer ($, h, ic) | 988–1010 | 22 | Basis | bleibt |
| Fmt, D (Formate/Datum de-CH) | 1010–1110 | 100 | Basis | bleibt (CHF 1'234.55, TT.MM.JJJJ) |
| Store (localStorage + Undo) | 1110–1225 | 115 | Persistenz | ERSETZEN (API-Client + IndexedDB) |
| Q (Queries) | 1225–1265 | 40 | Datenzugriff | ersetzen (Server-Queries) |
| S (Session) + Login (4-stelliger Code) | 1265–1351 | 86 | Identitaet | ERSETZEN (echte AuthN/AuthZ) |
| Sync (Firebase REST, Ganz-Dokument) | 1351–1470 | 119 | Sync | ERSETZEN (Sendeschlange, feldweise) |
| UI (Dialoge, Toast, Undo) | 1470–1588 | 118 | Darstellung | bleibt |
| L (Geschaeftslogik) | 1588–1971 | 383 | FACHKERN | wandert 1:1 auf den Server |
| Nav (Routen-Registry) + Desk + W | 1971–2149 | 178 | Rahmen | wird zum Modul-Registry |
| Buero-Ansichten (17 Stueck) | 2149–3967 | 1818 | Module (UI) | bleibt, wird je Modul geschnitten |
| Fld + Monteur-Ansichten (6) | 3967–4668 | 701 | Module (UI) | bleibt |
| AKT (Aktionen/Dialoge) | 4668–5829 | 1161 | Module (UI+Logik) | teilen: Logik -> Server, Dialog bleibt |
| ROUTEN (Aktions-Dispatch) + Rest | 5829–6639 | 810 | Rahmen | bleibt |
| DWCam (Kamera, Verkleinern, EXIF) | 6645–6956 | 311 | Baustein | bleibt |
| DWDruck (A4-Druck/PDF) | 6962–7392 | 430 | Baustein | bleibt |
| DWQR (QR-Encoder + Swiss Zahlteil) | 7399–8171 | 772 | KRONJUWEL | bleibt unveraendert |
| DWMap (OSM-Karte, ohne Fremdbibliothek) | 8177–9242 | 1065 | Baustein | Kachelquelle wechseln |
| DWSeed (Demodaten) | 9254–10303 | 1049 | Demo | bleibt als Demo-/Testdaten-Generator |
| Start | 10306–10356 | 50 | Rahmen | bleibt |

## Faktische Schichtung, die der Code HEUTE schon hat
Fmt / D / Store / Q / S / Login / Sync / UI / L / Nav / Desk / W / Fld / AKT / ROUTEN / FELDTYPEN

## Die Registries, die schon existieren
- `Nav.ZIELE_DESK` — 13 Bueroziele mit Gruppe, Symbol, Zaehler-Funktion, Heiss-Flag
- `Nav.ZIELE_FIELD` — 5 Monteurziele
- `Desk.ansichten.<name>` / `Fld.ansichten.<name>` — Ansichts-Registry (23 Ansichten)
- `ROUTEN['modul.aktion']` — Aktions-Dispatch ueber data-act
- `FELDTYPEN` — 12 Feldtypen des Checklisten-Baukastens
=> Das ist bereits ein Plugin-Muster. Es fehlt nur: Durchsetzung, Serverseite, Mandant.

## Datenmodell (eine Wurzel, Zeile 1132)
version, betrieb, benutzer, auftraege, kunden, objekte, vorlagen, material, lager,
fahrzeuge, bewegungen, bestellungen, zeiten, absenzen, spesen, offerten, rechnungen,
vertraege, nachrichten, ereignisse

## Fachlogik in L, nach Domaene gruppiert (der faktische Modulschnitt)
- Auftrag: STATUS (10 Zustaende), statusChip, typ, fortschritt, beantwortet,
  punktSichtbar, offenePflicht, setzeStatus, nummer
- Zeit: zeitenVon, dauer, minuten, laufendEintrag, laufend, laufenderAuftrag,
  uhrStart, uhrStopp, tagMinuten, wochenMinuten
- Lager: materialBuchen, umbuchen, unterBestand
- Abrechnung: positionenAusAuftrag, summe, kosten, rechnungAusAuftrag, qrRef
- Vertraege: faelligeVertraege, auftragAusVertrag
- Kommunikation: nachrichtSenden
- Wetter: wetterTag, wetterAmpel, wetterEmoji

## Der Baukasten existiert schon — in klein
Vorlage = {
  id, name, serviceArt, fotoVorherPflicht, fotoNachherPflicht,
  punkte: [{
    id, label,
    typ,            // einer von 12 FELDTYPEN
    gruppe,         // Vorbereitung | Arbeit | Abschluss
    pflicht,        // bool
    fotoPflicht,    // bool
    optionen, einheit,
    bedingung: { punktId, gleich },   // Folgefrage: zeige nur wenn Antwort X
    mangelWenn                        // Regel: Antwort X erzeugt einen Mangel
  }]
}
=> Feldtypen + Sichtbarkeitsregel + Auslöseregel + Gruppierung + Pflichtlogik.
=> Genau die vier Bausteine, die ein Entitaeten-/Prozess-Baukasten braucht.
=> Die Verallgemeinerung dieses Musters IST das Produkt, nicht ein neues Konzept.
