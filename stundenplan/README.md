# STUNDENWERK – Stundenplan-Generator für Berufsfachschulen

Räume, Fächer, Lehrgänge, Lehrpersonen und Klassen erfassen – den Rest übernimmt der
Generator: ein konfliktfreier Wochenplan ohne Freistunden, in Sekunden, mit Begründung für
alles, was nicht aufgeht. Gebaut nach dem Muster der KV Luzern Berufsfachschule, aber für jede
Berufsfachschule konfigurierbar.

**Öffnen:** `stundenplan/index.html` im Browser (Doppelklick genügt) oder
[live ansehen](https://colinrenggli-sudo.github.io/WebAppKurzbefehl/stundenplan/).
Beim ersten Start «Demo-Daten laden» wählen – dann steht eine Schule mit 19 Klassen,
36 Lehrpersonen und 32 Räumen bereit.

## Datenschutz zuerst

Lehrpersonen gibt es in der App nur als **Emoji mit optionalem Kürzel** (🦁 Löwe, 🐸 Frosch,
☀️ Sonne …). Keine Namen, keine Kontaktdaten, keine Zuordnungstabelle. Alle Daten bleiben im
Browser (localStorage); es gibt keinen Server, keine Tracker, keine Drittanbieter-Skripte.
Sicherungen lassen sich als JSON herunterladen und wieder laden. Hintergrund und rechtliche
Einordnung (revidiertes DSG, KDSG Luzern, Pseudonymisierung): [RECHERCHE.md](RECHERCHE.md).

## Was die App kann (kostenlos)

| Bereich | Inhalt |
|---|---|
| **Dashboard** | Kennzahlen, Plan-Status, Machbarkeit auf einen Blick, Startklar-Checkliste, «Heute», Auslastung |
| **Räume** | Schulzimmer, Informatikzimmer, Raum mit Display, Grossraum, Aula, Turnhalle, Labor, Aussenanlage, Sitzungszimmer, Mediothek, Mensa … mit Kapazität, Ausstattung, Gebäude, wöchentlichen Sperrzeiten und Belegung |
| **Fächer** | Kurzname, Farbe, Raumbedarf (z. B. Sport nur Turnhalle, IKA nur Informatik), Einzel- oder Doppellektion |
| **Lehrgänge** | Lektionentafeln pro Lehrjahr: Kaufleute EFZ 2023 (HKB A–E), BM1, E-/B-Profil, EBA, Detailhandel EFZ/EBA – frei editierbar |
| **Lehrpersonen** | Emoji, Fächer, Pensum, Wunschtage und ein Verfügbarkeitsraster (Tage × Lektionen, per Klick oder Ziehen) |
| **Klassen** | Name, Lernende, Lehrgang und Lehrjahr, Schultage, Stammzimmer, Klassenlehrperson, Stellvertretung, ABU-Lehrperson, weitere Lehrpersonen, Fach-Zuteilung (oder automatisch) |
| **Generator** | Machbarkeitsanalyse mit «Beheben»-Links, Qualitätsstufe, Seed, Gewichtung der Kriterien, Fortschritt mit Abbrechen, Ergebnis mit Score, Aufschlüsselung, Gründen für Unplatziertes, Varianten-Archiv |
| **Stundenplan** | Ansichten Klasse / Lehrperson / Raum / Tagesübersicht aller Klassen, Drag & Drop mit Konfliktprüfung, Lektion fixieren, Raum oder Lehrperson wechseln, Lektion hinzufügen, Rückgängig, Entwurf/Veröffentlicht, Druck, Export CSV / ICS / JSON |
| **Mein Bereich** (Rolle Lehrperson) | Heute, Wochenplan, eigene Klassen, eigene Verfügbarkeit bearbeiten, Benachrichtigungen |
| **Einstellungen** | Schule, Stundenraster (Lektionen, Zeiten, Mittag), Unterrichtstage, Pensum, Darstellung, Sicherung, Demo-Daten in drei Grössen |

## Pro-Funktionen (in der Demo simuliert, CHF 500 pro Monat und Schule)

Die Paywall ist eine Simulation: «Demo ansehen» schaltet alles frei, es wird nichts verrechnet.
Alle Pro-Funktionen sind echt umgesetzt und rechnen mit den Daten des Generators.

- **Kalender & Arbeitszeit** – Wochenkalender mit Unterricht, eigenen Zeiteinträgen und Absenzen;
  Soll/Ist nach Berufsauftrag (Jahresarbeitszeit × Pensum), Saldo pro Woche und seit
  Semesterbeginn, Export als CSV und ICS.
- **Stellvertretungen** – Absenz erfassen, betroffene Lektionen aus dem Plan, pro Lektion qualifizierte,
  verfügbare und freie Lehrpersonen (Klassenteam und «im Haus» zuerst), automatisch lösen,
  Stellvertretungsplan drucken.
- **Hauswart & Events** – Raumbuchungen (Aula, Grossraum, Mensa …) mit Konfliktprüfung gegen
  Unterricht, abgeleitete Aufgaben (Aufbau, Technik-Check, Reinigung, Abbau), Reinigungsplan aus
  der Tagesbelegung, Belegungsübersicht.
- **Team-Chat** – Kanäle für Schule, Fachschaften und Klassenteams, Direktnachrichten, ohne Personendaten.
- **Auswertungen** – Raumauslastung, Pensen, Freistunden, Kriterien, Vergleich der Planvarianten.

## Der Generator

Harte Regeln werden nie verletzt: Lehrperson, Klasse und Raum je höchstens einmal pro Lektion;
Lehrperson nur wenn verfügbar; Klasse nur an ihren Schultagen; Raumtyp, Kapazität und Sperrzeiten;
Doppellektionen zusammenhängend und nicht über den Mittag; fixierte Lektionen bleiben. Weiche
Kriterien (Freistunden, Fachverteilung, Stammzimmer, Wunschtage …) werden gewichtet minimiert –
die Gewichte sind einstellbar. Ablauf: automatische Lehrpersonen-Zuweisung → Konstruktion
«schwierigste Einheit zuerst» mit Verdrängung → Simulated Annealing mit gezielten Zügen gegen
Freistunden → Raum-Nachoptimierung. Gleicher Seed, gleiche Daten: gleicher Plan.
Details: [RECHERCHE.md](RECHERCHE.md), Abschnitt 8.

## Tests

```
node tests/solver.test.js     # Generator: Vollständigkeit, harte Regeln, Determinismus, Fixierung, Stresstest
node tests/smoke.js '' '' '#/dashboard,#/klassen'   # Browser: Konsolenfehler und Screenshots je Route
node tests/flow-pro.js        # Browser: Portal, Kalender, Stellvertretungen, Einstellungen
```

## Aufbau

Statische Dateien ohne Build: `index.html`, `css/app.css`, `js/*.js` (Kern), `js/views/*.js`
(eine Datei pro Bildschirm). Konventionen und Datenmodell: [ARCHITEKTUR.md](ARCHITEKTUR.md).
Selbst hosten wie die anderen Apps dieses Repositories, siehe [`deploy/`](../deploy/).
