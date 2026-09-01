# BADWERK – Demo

Showroom-System für den Sanitärhandel: Offerte am Tablet mit
automatischem Installationsmaterial, Unterschrift und Anzahlung per
TWINT oder Karte, Bestellungen an alle Lieferanten, Lieferfrist-
Überwachung mit automatischen Nachfragen, Wareneingang per QR-Code am
Handy, Terminwahl durch den Kunden, Montage durch Partnerbetriebe,
Schlussrechnung mit Schweizer QR-Zahlteil, Archiv. Eine Datei.

Konzept und Vision: [`KONZEPT.md`](KONZEPT.md) · Recherche mit Quellen:
[`RECHERCHE.md`](RECHERCHE.md)

## Sofort ausprobieren

`bad/index.html` im Browser öffnen – mehr braucht es nicht. Keine
Installation, kein Build, kein Konto.

Lokal mit Server (empfohlen, dann funktionieren die Portal-Links, der
Kamera-Scanner und die Installation als App):

```bash
cd bad && python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

Live: https://colinrenggli-sudo.github.io/WebAppKurzbefehl/bad/

### Anmeldecodes

| Code | Person | Rolle | Oberfläche |
|---|---|---|---|
| **1234** | Carlos Ferreira | Inhaber | Konsole am PC – alles |
| **2468** | Nadine Keller | Beratung und Verkauf | Konsole, Start bei den Showroom-Terminen; Offerte am Tablet |
| **98765** | Marco Bianchi | Lager | Lager-App am Handy: scannen, buchen |

Kunden, Lieferanten, Monteure und Partnerbetriebe brauchen keinen Code.
Sie kommen über Links mit Token herein, die in den Mails stehen
(Postausgang) und in der Konsole verlinkt sind:

| Link | Wer | Was |
|---|---|---|
| `?k=…` | Kunde | Offerte ansehen, unterschreiben, Anzahlung, Status, Terminwahl, Rechnung mit Zahlteil |
| `?l=…` | Lieferant | Bestellung bestätigen mit Termin, Lieferavis, Verzug melden |
| `?m=…` | Monteur (Partnerbetrieb) | Auftragsblatt, Termin bestätigen, Fertigmeldung mit Abnahme-Unterschrift |
| `?p=…` | Partnerbetrieb | Showroom-Termin buchen, eigene Kunden, Montageaufträge, Abrechnung |
| `?scan=…` | Lager | Aus dem QR-Code: Position buchen (verlangt den Lager-Code) |

Demo-Links auf den Demodaten (gleich auf jedem Gerät):
`?k=K0139` (Kunde Rossi, montagebereit – Termin wählen),
`?k=K0138` (Kunde Lüthi, Schlussrechnung), `?l=L014201` (Kaldewei,
Bestellung bestätigen), `?p=PKELLER` (Keller Haustechnik, Partner Plus),
`?p=PBRUNNER` (Sanitär Brunner, Partner Basis).

## Die Vorführung in zehn Minuten

Drei Geräte: PC (Konsole), Tablet oder zweites Fenster (Offerte), Handy
(Lager). Für den Live-Abgleich zwischen den Geräten in den
**Einstellungen** die **Live-Verbindung** einschalten (siehe unten).

1. **1234** → Übersicht: «Was heute zählt» (überfällige Lieferung, AB
   fehlt, Entwurf freigeben, Showroom-Anfrage), Pipeline aller Aufträge,
   Kennzahlen. Oben rechts die **Demo-Uhr**.
2. **Neue Offerte am Tablet** → Showroom-Termin «Andrea Brunner»
   antippen → Objekt: Wohnung im MFH, 3. OG ohne Lift, Sanierung, vor
   1990 → **Weiter** → **Badewanne Kaldewei Cayono** antippen: sechs Zeilen
   Installationsmaterial hängen sich an → Armaturen: Wannenmischer.
3. **Extras**: Whirl-System, Wannengriff; die Vorschläge aus dem
   Objektkontext (Etagenlieferung, Entsorgung, Adapter-Set); Komfort-Paket.
   Als Inhaber sieht man die Marge je Zeile.
4. **Offerte** → **Unterschreiben** (Haken, Unterschrift) → **Anzahlung**
   per TWINT: QR-Code, «Zahlung bestätigen (Demo)». Der Auftrag entsteht,
   drei Bestellungen gehen raus, die QR-Codes fürs Lager sind erzeugt.
5. **Auftrag öffnen**: Zeitleiste, Reiter Lieferanten (Soll- und
   AB-Termin, Mahnstufen), Lager und QR, Dokumente.
6. **Postausgang** → Bestellung an Kaldewei → **Lieferantenportal** →
   Bestellung bestätigen mit Termin → am Auftrag steht der AB-Termin.
7. **Demo-Uhr +1, +1**: die Statusanfrage an Kaldewei geht automatisch
   raus. **+7, +1**: Liefermahnung, dazu der **Kunden-Entwurf** (KI-Entwurf)
   im Postausgang zur Freigabe; Zehnder eskaliert wegen fehlender AB.
   **Zurück auf heute** mit dem ×.
8. **Lager und QR-Codes** → Kommission K-0142 → **QR-Bogen drucken** oder
   den QR-Code einer Position gross anzeigen. Am **Handy**: Kamera auf
   den Code → die App öffnet sich → Code **98765** → **In Ordnung –
   eingetroffen**. Am PC steht die Position auf «eingetroffen» mit
   Lagerplatz. Beim letzten Scan eines Auftrags: «montagebereit», der
   Kunde erhält den Terminlink.
9. **Kundenportal** `?k=K0139` (Rossi, montagebereit): einen Halbtag
   wählen → Termin bestätigt, Montageauftrag an Keller Haustechnik,
   Kalenderdatei. **Termine und Montage** zeigt den Termin; über den
   **Monteurportal**-Link bestätigt der Partner und meldet fertig mit
   Abnahme-Unterschrift → **Schlussrechnung mit QR-Zahlteil** im
   Postausgang und unter Dokumente.
10. **Rechnungen**: R-2026-0264 überfällig, Zahlungserinnerung als
    Entwurf; «Zahlung eingegangen» → Archiv.
11. **Partnerbetriebe** → **Partnerportal** von Sanitär Brunner:
    Showroom-Termin für einen Kunden buchen (Samstag-Vormittag mit
    Kaffee und Gipfeli ist Partner Plus vorbehalten), Abrechnung mit
    Tippgeber- und Vermittlungsprovision, Upgrade.

## Was drin ist

**Konsole (PC und Tablet)**

| Bereich | Inhalt |
|---|---|
| Übersicht | Aufgaben des Tages, Kennzahlen, Showroom heute, Pipeline, Aktivität, Demo-Uhr |
| Aufträge | Liste mit Lieferstand und nächstem Schritt; Akte mit Positionen, Lieferanten (AB, Avis, Verzug, Mahnstufen pausieren), Lager und QR, Termin, Dokumente, Mails, Verlauf |
| Offerten | Trichter, Abschlussquote, Upsell-Anteil, Marge |
| Neue Offerte (Tablet) | Sechs Schritte: Kunde und Objekt, Produkte mit Stückliste, Optionen, Vorschläge, Pakete, Zusatzleistungen, Montage-Richtpreis, Zusammenfassung, Unterschrift, Anzahlung (TWINT-QR, Karte, Apple Pay, Link) |
| Showroom-Termine | Beratungstermine, Partner-Anfragen, Kaffee und Gipfeli |
| Kunden und Objekte | Kundenakte mit Objektkontext, Offerten, Aufträgen |
| Lieferanten und Bestellungen | Termintreue je Lieferant, offene Bestellungen, Regeln der Überwachung |
| Lager und QR-Codes | Kommissionen, Positionen mit Lagerplatz, QR-Bogen, QR zum Öffnen der App am Handy |
| Postausgang | Jede Mail der App; Entwürfe freigeben, im Mailprogramm öffnen, Portale öffnen |
| Termine und Montage | Kommende Montagen, Partnerbestätigung, ICS und Google-Kalender, Fertigmeldung |
| Partnerbetriebe | Modell Basis/Plus, Provisionen, Portal-Link |
| Rechnungen, Archiv | Offene Forderungen, Mahnstufen, Zahlungsgebühren, Archiv mit Dokumenten |
| Artikel und Stücklisten | Produkte mit Installationsmaterial, Optionen, Marge; Zusatzleistungen, Pakete, Montage-Richtpreise |
| Einstellungen | Betrieb, Zahlung und Fristen, Stripe-Link, Calendly, Live-Verbindung, App-QR, Codes, Demodaten zurücksetzen |

**Lager-App (Handy):** Scannen (Kamera oder Code), Position buchen (in
Ordnung oder beschädigt mit Foto – die Schadensmeldung geht automatisch
an den Lieferanten), erwartete Positionen, Kommissionen je Auftrag.

**Automationen** (alle sichtbar im Postausgang und in der Zeitleiste):
Bestellungen und Auftragsbestätigung bei Anzahlung · AB-Erinnerung
nach 2 Werktagen · Statusanfrage 5 Werktage vor bestätigtem Termin ·
Liefermahnung am Werktag +1 mit Kunden-Entwurf · Eskalation am Werktag
+6 · Terminlink an den Kunden, wenn alles da ist · Montageauftrag an den
Partner und Bestätigung an den Kunden · Terminerinnerung 2 Tage vorher ·
Schlussrechnung bei Abnahme · Zahlungserinnerung +7, Mahnungen +21 und
+35 Tage als Entwürfe · Nachfassen und Ablauf von Offerten ·
Bewertungsanfrage nach Zahlung.

## Schweizer Besonderheiten

- **QR-Rechnung** (Zahlteil 0200) vollständig im Browser erzeugt: eigener
  QR-Encoder, QR-Referenz mit Modulo-10-Prüfziffer, Schweizerkreuz.
- **MWST 8.1 %**, Rappenrundung, Beträge `1'234.55`, Daten `TT.MM.JJJJ`.
- **Anzahlung statt Vollzahlung**, TWINT-Limite CHF 5'000 mit Hinweis
  auf Karte oder Aufteilung, Stripe-Gebühren ausgewiesen.
- **Rügefristen** bei Transportschäden (1 Tag Grosshandel, 8 Tage OR 452)
  in der Schadensmeldung.

## Live-Verbindung zwischen den Geräten

Ohne Einrichtung bleibt alles im Browser des jeweiligen Geräts – die
Demo läuft vollständig, auch der QR-Scan am Handy (mit den Demodaten
sind die Codes auf jedem Gerät gleich). Mit Verbindung sehen PC, Tablet
und Handy denselben Stand: Ein Scan am Handy erscheint am PC.

Voreingestellt ist das Firebase-Projekt `dachapp2` aus DACHWERK mit der
Sammlung `dachwerk` (dort gilt die Regel bereits) und dem Raum
`badwerk-demo`. In den **Einstellungen** den Schalter **Verbindung
aktiv** setzen – auf jedem Gerät denselben Raum. Für eine eigene
Sammlung `badwerk` im Firebase-Projekt die Regel ergänzen:

```
match /badwerk/{raum} { allow read, write: if request.auth != null; }
```

## Weiterentwickeln

Die App wird aus `src/` gebaut:

```bash
cd bad && python3 build.py --check
```

`src/LEITFADEN.md` beschreibt Aufbau, Bausteine und Regeln. Änderungen
gehören nach `src/`; `index.html` wird überschrieben.

## Grenzen dieser Demo

- **Die Daten sind erfunden.** Betrieb, Kunden, Lieferanten, Preise,
  Lieferfristen und Termintreue sind Demodaten; Lieferfristen sind
  editierbare Erfahrungswerte.
- **Kein Mailversand, keine echte Zahlung.** Mails landen im Postausgang
  (mailto übergibt sie ans Mailprogramm), Zahlungen sind simuliert; ein
  Stripe Payment Link lässt sich hinterlegen (Testmodus).
- **KI-Entwürfe sind Vorlagen.** Der Anschluss an ein Sprachmodell ist
  Roadmap; die Entwürfe sind als solche gekennzeichnet.
- **Ein Datenstand, kein Mehrbenutzerbetrieb.** Der Sync schreibt den
  ganzen Bestand; gleichzeitige Änderungen können sich überschreiben.
- **Kein Rechtesystem im engeren Sinn.** Die Rollen steuern die
  Oberfläche, nichts wird serverseitig geprüft. Token in Links sind kurz
  und nicht kryptografisch.
- **Offline nur im Browserspeicher.** Fotos werden verkleinert, bei
  Speichergrenze entfernt.

Was ein Betrieb darüber hinaus bräuchte, steht in
[`KONZEPT.md`](KONZEPT.md) (Roadmap) und [`RECHERCHE.md`](RECHERCHE.md).

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Die komplette App, gebaut aus `src/` |
| `src/` | Quelltext in Teilen, `src/LEITFADEN.md` |
| `build.py` | Baut `index.html` |
| `manifest.json`, `sw.js`, `icon.svg` | Installation als App, Offline-Betrieb, Symbol |
| `KONZEPT.md` | Vision, Stakeholder, Prozesse, Regeln, Demo-Storyboard, Roadmap |
| `RECHERCHE.md` | Recherche mit Quellen |
