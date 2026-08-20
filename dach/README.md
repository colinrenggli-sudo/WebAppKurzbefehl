# DACHWERK – Demo

Auftragsverwaltung für Dachdecker und Spengler. Zwei Oberflächen aus einer
Datei: das Büro arbeitet am PC, der Monteur am Handy. Der vierstellige
Anmeldecode entscheidet, welche der beiden startet.

## Sofort ausprobieren

`dach/index.html` im Browser öffnen – mehr braucht es nicht. Keine
Installation, kein Build, kein Konto.

Lokal mit Server (empfohlen, dann funktionieren Kamera, Scanner und die
Installation als App):

```bash
cd dach && python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

### Anmeldecodes

| Code | Person | Rolle | Oberfläche |
|---|---|---|---|
| **1234** | Marco Bühler | Inhaber | Büro-Konsole am PC |
| **2345** | Sandra Odermatt | Disposition | Büro-Konsole am PC |
| **3456** | Reto Amrein | Vorarbeiter | Monteur-App am Handy |
| **4567** | Dario Sousa | Spengler | Monteur-App am Handy |
| **5678** | Nico Fries | Lernender | Monteur-App, eingeschränkte Rechte |

Auf dem Anmeldeschirm genügt ein Tippen auf die Person. Die Monteur-Ansicht
läuft auch am grossen Bildschirm – dann in einem Telefonrahmen, damit sie
sich am Kundentermin auf dem Laptop zeigen lässt.

## Die Vorführung in fünf Minuten

1. **1234** eingeben → Büro-Konsole. Oben stehen die Dinge, die heute
   Geld oder Ärger bedeuten: offener Nachtrag, fällige Wartungen,
   überfällige Rechnung, Material unter Mindestbestand.
2. **Neuer Auftrag** → Kunde, Objekt, Checkliste, Fotopflicht, Termin,
   Monteur. Beim Wählen der Checkliste zeigt der Dialog, was der Monteur
   danach zwingend erledigen muss.
3. **Disposition** → den neuen Auftrag aus der Spalte „Nicht verplant" auf
   einen Mitarbeitenden und Tag ziehen. Über den Tagen steht das Wetter;
   ab 45 km/h Wind sperrt die App die Dacharbeit.
4. Abmelden, **3456** eingeben → Monteur-App. Der Tag steht als Liste da.
   Auftrag öffnen → **Arbeit starten** (ein Tipp, die Zeit läuft, der Kunde
   bekommt automatisch „wir sind unterwegs") → **Alles geprüft – bestätigen**
   für die Sicherheit → Checkliste abhaken (die Liste bleibt stehen, „Alle
   abhaken" erledigt den Rest) → **Foto** → Material vom Fahrzeug buchen →
   **Fertig** mit Unterschrift des Kunden.
5. Zurück mit **1234**: Der Auftrag steht auf „Erledigt", Zeiten und
   Material sind da, der Nachtrag wartet auf Freigabe. **Verrechnen** →
   fertige Rechnung mit Schweizer QR-Zahlteil. **Drucken / PDF** ergibt
   eine einseitige A4-Rechnung, deren QR-Code sich mit jeder Banking-App
   scannen lässt.

Zwischendurch lohnen sich: **Wartungsverträge** („5 fällige → Aufträge
erzeugen"), **Checklisten** (Formularbaukasten mit Folgefragen und
Mangelregeln) und **Einstellungen** (Farbe und Firmenname umstellen – die
ganze App zieht mit).

## Was drin ist

**Büro-Konsole**

| Bereich | Inhalt |
|---|---|
| Übersicht | Kennzahlen, laufende Einsätze live, Wetterampel, Aktivitätsstrom |
| Disposition | Wochenbrett mit Ziehen und Ablegen, Auslastung, Wetter je Tag |
| Aufträge | Filter, Sortierung, Detailakte mit sieben Reitern |
| Karte | Alle Aufträge auf OpenStreetMap, Tagesroute, Sprung zum Auftrag |
| Kunden & Objekte | Objektakte mit Dachdaten, Zugang, Historie und Bildarchiv |
| Wartungsverträge | Fälligkeiten, Auftragserzeugung auf Knopfdruck |
| Lager & Material | Zentrallager und drei Fahrzeuglager, Bestellvorschlag, Bewegungsjournal |
| Zeit & Personal | Wochenübersicht, Freigabe, Qualifikationen mit Ablaufdatum, Absenzen |
| Offerten & Rechnungen | Offertenkette, Rechnungen mit QR-Zahlteil, Mahnwesen, Deckungsbeitrag |
| Checklisten | Baukasten mit zwölf Feldtypen, Folgefragen, Mangelregeln, Pflichtangaben |
| Zeitfreigabe | Eingereichte Wochen der Monteure, Freigabe einzeln oder gesammelt |
| Team & Codes | Personen, Anmeldecodes, Ansätze, Fahrzeuge |
| Einstellungen | Firma, Farbe, Ansätze, Wettergrenzen, Sync, Demo zurücksetzen |

**Monteur-App**

Gebaut nach einem Grundsatz: **die App hält niemanden auf.** Nichts muss
erledigt sein, bevor die Arbeit beginnen kann.

- **Arbeit starten** mit einem Tipp – Zeit läuft, Kunde ist informiert
- **Sicherheit** mit einem Knopf für alle fünf Punkte, festgehalten mit
  Name und Uhrzeit. Wer sie einzeln durchgehen will, kann
- **Checkliste** mit grossen Feldern; die Liste bleibt stehen, wo sie war.
  „Alle abhaken" erledigt die restlichen Haken auf einmal
- **Foto** öffnet direkt die Kamera, ohne Zwischenfrage. Daneben liegt ein
  Feld für ein erzeugtes Beispielbild – für die Vorführung am Laptop
- **Material** ab Fahrzeuglager, mit Barcode-Scan
- **Nachtrag**, **Mangel** mit Foto, **Rückfrage ans Büro**
- **Fertig** ist nie gesperrt. Was fehlt, steht im Abschluss mit einem
  Knopf zum Erledigen daneben – oder man schliesst trotzdem ab, dann geht
  ein Vermerk ans Büro statt den Monteur aufzuhalten
- **Zeit** als eigener Bereich: Stempeluhr mit Start, Pause und Beenden,
  wahlweise auf einen Auftrag oder frei. Vergessene Zeiten lassen sich
  nachtragen, bestehende ändern oder löschen, die Woche geht auf Knopfdruck
  ans Büro
- Spesen, Absenzen, PSA-Kontrolle, Unfallmeldung, Notfallnummern

Die Monteur-Ansicht läuft auch am grossen Bildschirm – dann in einem
Telefonrahmen mit Erklärspalte daneben.

## Die Checklisten

Der Demo-Betrieb lebt vom wiederkehrenden Service am Flachdach. Die
Vorlagen bilden genau das ab – kurz, zum Abhaken, ohne Fragen nach Dingen,
die man von oben gar nicht sieht:

| Vorlage | Inhalt |
|---|---|
| **Flachdach Service** | Abläufe reinigen (mit Anzahl), Notüberläufe, Laub, Bewuchs, Kies, Attika, Durchdringungen, Gesamtzustand als Ampel |
| **Solaranlage Service** | Verschmutzung vorher, Module reinigen (Anzahl), Bewuchs unter den Modulen, Unterkonstruktion, Kabel, Abläufe im Modulbereich |
| **Dachbegrünung Pflege** | Fremdbewuchs, vegetationsfreie Zonen, Abläufe, Substrathöhe, Zustand, Grünschnitt abgeführt |
| **Wassereintritt und Sturmschaden** | Bereich sichern, Ursache, Sofortmassnahme, dicht ja/nein, Angaben für die Versicherung |
| **Rinnen und Ablaufrohre** | Rinnen gereinigt (lfm), Rohre gespült, Laubschutz, Dichtprobe |
| **Sicherheit vor Arbeitsbeginn** | Fünf Punkte, ein Knopf |

Was ein erfahrener Monteur ohnehin als Mangel oder Nachtrag meldet, steht
bewusst nicht als Frage in der Liste. Das Büro baut die Vorlagen selbst um –
unter **Checklisten**, mit sofortiger Wirkung auf allen Geräten.

## Schweizer Besonderheiten

- **QR-Rechnung** nach Zahlteil-Version 0200, vollständig im Browser
  erzeugt: QR-Encoder von Hand gebaut, Fehlerkorrektur M, Schweizerkreuz
  7 mm, QR-Referenz mit Modulo-10-rekursiver Prüfziffer, IBAN-Prüfung
  Modulo 97. Der Zahlteil misst 210 × 105 mm, der Adressblock beginnt
  45 mm von oben und passt damit ins C5/C6-Fensterkuvert.
- **MWST 8.1 %** und Rappenrundung auf 5 Rappen.
- **Wettergrenzen** für die Dachfreigabe, voreingestellt 45 km/h Wind,
  8 mm Regen, −3 °C.
- Beträge im Format `1'234.55`, Daten als `TT.MM.JJJJ`, Sprache de-CH.

## Live-Verbindung zwischen zwei Geräten

Ohne Einrichtung bleibt alles im Browser des jeweiligen Geräts – die Demo
läuft vollständig. Mit Verbindung sehen Büro-Laptop und Monteur-Handy
denselben Stand.

Eingerichtet ist das Firebase-Projekt `dachapp2`. In den **Einstellungen**
den Schalter **Verbindung aktiv** setzen und auf beiden Geräten denselben
Betriebs-Code eintragen (voreingestellt `buehler-demo`).

Im Firebase-Projekt sind zwei Dinge nötig:

1. **Authentication → Sign-in method → Anonym** aktivieren.
2. Firestore-Regel setzen:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /dachwerk/{raum} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Die App spricht die REST-Schnittstellen direkt an – kein Firebase-SDK,
kein zusätzlicher Request beim Laden. Der ganze Datenstand liegt als ein
Dokument unter `dachwerk/<Betriebs-Code>`; gelesen wird im
Vier-Sekunden-Takt, geschrieben gebündelt.

## Auf dem eigenen Server

Es sind vier Dateien, alle statisch:

```
dach/index.html      die komplette App
dach/manifest.json   macht sie auf dem Handy installierbar
dach/sw.js           Service Worker für den Offline-Betrieb
dach/icon.svg        Symbol
```

Auf einen beliebigen Webserver kopieren, fertig. Für die Installation als
App auf dem Handy und für Kamera und Scanner braucht es HTTPS.

## Grenzen dieser Demo

- **Die Daten sind erfunden.** Betrieb, Kunden, Objekte, Preise und Fotos
  sind erzeugt. Die Fotos sind gezeichnete SVG-Bilder, keine Aufnahmen.
- **Ein Datenstand, kein Mehrbenutzerbetrieb.** Der Sync schreibt den
  ganzen Bestand; zwei gleichzeitige Änderungen am selben Auftrag können
  sich überschreiben. Für zwei Geräte in einer Vorführung reicht das, für
  den Betrieb braucht es feldweises Zusammenführen.
- **Offline nur im Browserspeicher.** Bei sehr vielen Fotos stösst
  `localStorage` an die Grenze; die App entfernt dann die ältesten Bilder
  und vermerkt das im Eintrag. Für den Betrieb gehört das nach IndexedDB.
- **Kein Rechtesystem im engeren Sinn.** Die Rollen steuern die Oberfläche
  und einzelne Knöpfe, aber nichts wird serverseitig geprüft.
- **Wetter** kommt von Open-Meteo, wenn Internet da ist; sonst aus einer
  Schätzung. Heute ist in der Schätzung bewusst arbeitsfähig, der
  übernächste Tag stürmisch, damit sich die Dachfreigabe zeigen lässt.
- **Kartenkacheln** stammen von OpenStreetMap. Für den produktiven Einsatz
  braucht es eine eigene Kachelquelle; die Nutzungsbedingungen von
  openstreetmap.org sind auf gelegentlichen Gebrauch ausgelegt.
- **Keine Buchhaltung.** Die Rechnung ist erzeugt und druckbar, aber es
  gibt keine Schnittstelle zu bexio, Abacus oder Banana.

Was ein Betrieb darüber hinaus bräuchte, steht in
[`RECHERCHE.md`](RECHERCHE.md) – mit dem, was bewusst weggelassen wurde.

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Die komplette App: Design, Logik, QR-Encoder, Karte, Demodaten |
| `manifest.json` | Angaben für die Installation als App |
| `sw.js` | Service Worker, macht die App offline lauffähig |
| `icon.svg` | Symbol für Startbildschirm und Browser |
| `RECHERCHE.md` | Recherche zum Funktionsumfang, Quellenlage, Auslassungen |
