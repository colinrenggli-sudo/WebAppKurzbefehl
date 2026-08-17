# Bau & Praxis — Besprechungsunterlage

Vier Präsentationen, ein Leistungskatalog, ein Nutzenrechner und die
vollständige Recherche dahinter — alles in einer einzigen HTML-Datei.
Gebaut für ein Meeting mit zwei Entscheidern gleichzeitig: dem Chef eines
Bauunternehmens und der COO einer Praxisverwaltung.

Kein PowerPoint. Läuft im Browser, funktioniert offline, lässt sich am
Beamer präsentieren und unterwegs auf dem Handy lesen.

## Sofort ausprobieren

`praesentation/index.html` im Browser öffnen — mehr braucht es nicht.
Keine Installation, kein Build, kein Server, kein Konto.

Lokal mit Server (empfohlen, damit alles gleich funktioniert wie live):

```bash
cd praesentation && python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

## In fünf Minuten durchgespielt

1. **Cockpit** öffnet sich als Startseite: Ablauf des Termins, die vier
   Decks, die Vorbereitungsliste und — wichtig — die Liste dessen, was
   vor dem Meeting noch zu prüfen ist.
2. **Einstellungen** ausfüllen (siehe unten). Ohne das zeigen zwei
   Folien in Deck 1 sichtbare Lücken. Das ist Absicht.
3. **Deck 1** öffnen, mit <kbd>F</kbd> in den Präsentationsmodus,
   mit <kbd>→</kbd> durchblättern, <kbd>N</kbd> zeigt die Sprechernotiz,
   <kbd>G</kbd> alle Folien auf einen Blick, <kbd>Esc</kbd> zurück.
4. **Leistungskatalog** öffnen, nach `Bau` filtern, ein paar Punkte mit
   `+` markieren, unten **Als Liste kopieren**.
5. **Nutzenrechner**: eine Ausgangslage wählen, Regler verschieben,
   zuschauen, wie sich Amortisation und Dreijahreswert ändern.
6. **Recherche**: alle elf Rechercheberichte, jeder mit Quellenliste.

## Die vier Decks

| # | Deck | Für wen | Worum es geht |
|---|---|---|---|
| 1 | **Was ich gebaut habe** | beide | Drei laufende Anwendungen zum Anfassen, zwei Projekte aus dem Betrieb, die Lehre daraus — und wie eine Zusammenarbeit ablaufen würde, samt Preis- und Vertragslogik |
| 2 | **Was möglich ist** | beide | Wo in jedem Betrieb Geld liegt, was eine Stunde wirklich kostet, und der Einstieg in den Katalog |
| 3 | **Bau** | Bauunternehmen | Margenhebel, Sprachproblem auf der Baustelle, Regierapport, Pfandrechtsfrist, Submissionen, Personal — und die Plattform-Idee, rechtlich sauber zugeschnitten |
| 4 | **Arztpraxen** | Praxisverwaltung | Fünf Vorhaben nach Nutzen und Risiko sortiert, drei, von denen abzuraten ist, und die Datenschutz-Eintrittsbedingungen |

Dazu **38 Einträge im Leistungskatalog** — 14 für jeden Betrieb, 10 für
Arztpraxen, 14 für den Bau. Jeder Eintrag mit Aufwand, Dauer und der
belegten Wirkung samt Quelle.

## Was du vor dem Meeting ausfüllen musst

Unter **Einstellungen**. Alles bleibt im Browser dieses Geräts
(`localStorage`) und geht nirgendwohin.

**Pflicht** — sonst zeigen die Folien sichtbare Lücken:

- Das Problem, die Lösung, die Wirkung und die Dauer des ersten Projekts
- Worum es beim zweiten Projekt ging, deine Rolle, die Grössenordnung
  und der Zeitraum

Die Lücken sind mit Absicht sichtbar statt mit Platzhaltertext gefüllt:
Ein erfundener Satz fliegt bei der ersten Rückfrage auf, eine leere Zeile
fällt dir vorher auf.

**Zwei Entscheidungen, die du bewusst treffen solltest:**

- **Firmennamen der früheren Arbeitgeber.** Standard ist anonym.
  Begründung steht in den Einstellungen und in
  [`recherche/10-pitch-narrativ.md`](recherche/10-pitch-narrativ.md).
- **Wie ausführlich die Absagen vorkommen.** Drei Fassungen zur Wahl —
  siehe nächster Abschnitt.

## Ein Punkt, an dem ich von deiner Vorgabe abweiche

Du hast zwei eigene Folien verlangt: eine dazu, dass die Lösung nicht
gekauft und die Folgetermine abgesagt wurden, und eine dazu, dass die
Entlassung in der Probezeit ohne Prüfung der Arbeit erfolgte.
**Beide sind gebaut und voreingestellt.**

Die Recherche zur Gesprächsführung rät davon ab, aus zwei Gründen:

1. Wer eine Ablehnung ausführlich erzählt, lädt genau die Frage ein, die
   er fürchtet — *zwei Arbeitgeber, beide gleich falsch, oder ist da ein
   Muster?* Die Länge einer Erklärung ist für Zuhörer ein Indikator für
   ihre Heikelkeit: zwei Sätze wirken abgeschlossen, zwei Minuten wirken
   wie eine Verteidigung.
2. Eine Kündigungsgeschichte auf einer Folie ist ein Dokument, das
   weitergeleitet werden kann. Gesprochen im Familienkreis ist das ein
   anderer Kontext.

Deshalb gibt es unter **Einstellungen → Wie ausführlich die Absagen
vorkommen** drei Fassungen:

| Fassung | Was passiert |
|---|---|
| **Ausführlich** (voreingestellt) | Zwei eigene Aussagefolien, wie von dir verlangt |
| **Knapp** | Eine Folie, drei sachliche Zeilen, Übergang „Präsentiert habe ich es dort nie. Heute schon.“ |
| **Gar nicht auf der Folie** | Keine Folie dazu; die zwei Sätze stehen nur in der Sprechernotiz |

In allen drei Fassungen stehen die neutraleren Formulierungen in den
Sprechernotizen. Die Entscheidung liegt bei dir — die Folien sind da.

## Die Recherche

Elf Berichte, entstanden aus elf parallel laufenden Recherchen. Jeder
Bericht trennt konsequent zwischen **belegt** (mit Quelle und Abrufdatum),
**Annahme** (offengelegte eigene Rechnung) und **nicht belegbar**.

| Datei | Thema |
|---|---|
| [`00-luecken-und-pruefung.md`](recherche/00-luecken-und-pruefung.md) | **Die Prüfinstanz.** Eine zwölfte Instanz hat die elf Berichte gegeneinander gelesen und nach Widersprüchen, unbelegten Zahlen und Rechenfehlern gesucht |
| [`01-kmu-ki-schweiz.md`](recherche/01-kmu-ki-schweiz.md) | KI in Schweizer KMU, Vollkosten pro Stunde, Fördergelder |
| [`02-arztpraxen-schweiz-markt.md`](recherche/02-arztpraxen-schweiz-markt.md) | Marktstruktur, Abläufe und Schmerzpunkte in Arztpraxen |
| [`03-arztpraxen-ki-usecases.md`](recherche/03-arztpraxen-ki-usecases.md) | 26 Anwendungsfälle mit Anbietern, Nutzen und Regulatorik |
| [`04-bau-schweiz-markt.md`](recherche/04-bau-schweiz-markt.md) | Bauwirtschaft: Margen, Produktivität, Sprachen, Vorschriften |
| [`05-bau-ki-usecases.md`](recherche/05-bau-ki-usecases.md) | 30 Anwendungsfälle für ein Bauunternehmen |
| [`06-plattform-dienstleistung-vermietung.md`](recherche/06-plattform-dienstleistung-vermietung.md) | Die Plattform-Idee und warum sie so nicht funktioniert |
| [`07-datenschutz-hosting-schweiz.md`](recherche/07-datenschutz-hosting-schweiz.md) | Datenschutzgesetz, Berufsgeheimnis, Schweizer Hosting |
| [`08-recruiting-methoden.md`](recherche/08-recruiting-methoden.md) | Personalgewinnung für Bau und Praxen |
| [`09-agentur-angebot-preise.md`](recherche/09-agentur-angebot-preise.md) | Angebotsmodelle, Pilotstruktur, Vertragsrecht |
| [`10-pitch-narrativ.md`](recherche/10-pitch-narrativ.md) | Deck-Aufbau und wie man die eigene Geschichte erzählt |
| [`11-firmen-kontext.md`](recherche/11-firmen-kontext.md) | Firmenkontext und Praxisdienstleister-Landschaft |

### Was die Prüfinstanz gefunden hat

Die zwölfte Instanz hat die elf Berichte gegeneinander gelesen. Drei
Befunde haben es direkt in die Folien geändert:

- **Die Pfandrechtsfrist ist nicht neu.** Eine Teilrecherche behauptete
  eine Verlängerung von drei auf vier Monate per 1.1.2026, gestützt auf
  eine einzelne Kanzlei-Seite. Die vier Monate stammen aus der
  ZGB-Revision von 2012. Die Folie sagt jetzt nur noch, wie lang die
  Frist ist — der Verkaufswert bleibt derselbe, das Risiko ist weg.
- **Der Schluss von der Nationalität auf die Sprache** ist nicht belegt.
  Die Erhebung des Baumeisterverbands zählt Pässe, keine Sprachen. Die
  Folie sagt jetzt „31 % haben einen portugiesischen Pass“ und zieht den
  Schluss im nächsten Satz sichtbar selbst.
- **Die 54 Minuten** sind die praxisambulante Administration *ohne* die
  Arbeit am Patientendossier. Eine Teilrecherche hatte einen Spitalwert
  (114 Minuten) danebengestellt, was den Nutzen um Faktor drei aufgebläht
  hätte. Die Folie nennt nur die belegte Zahl mit ihrer Abgrenzung.

Bewusst nicht übernommen wurden ausserdem: CHF-Beträge pro Katalogeintrag
(es gibt keine belastbaren Schweizer Marktsätze — der Katalog zeigt
Aufwandsklassen und Dauer), Anbieter-Nutzerzahlen und die MPA-Zahlen aus
einem Verbandsblog, die einander widersprachen.

### Was die Recherche selbst als ungeprüft markiert

Das Suchkontingent der Recherchesitzung war nach den ersten Berichten
aufgebraucht, und der Netzwerkzugang blockierte den Direktabruf vieler
Schweizer Behördenseiten. Die späteren Berichte sagen das offen und
stützen sich auf die Belege der früheren.

Die Konsequenz steht im **Cockpit unter „Was noch zu prüfen ist"** —
zehn Punkte, nach Dringlichkeit sortiert. Die wichtigsten:

- **Worauf sich die 16 Millionen beziehen.** Umsatz, Investitionsvolumen,
  bewegte Warenwerte, Einsparung? Das ist die erste Rückfrage im Raum.
- **Die Demos auf erfundene Beispieldaten prüfen.** Keine echten
  Kundennamen, keine Original-Exports eines früheren Arbeitgebers.
- **Die vier Monate beim Bauhandwerkerpfandrecht** am Gesetzestext
  gegenlesen (Art. 839 ZGB, Änderung per 1.1.2026).
- **Über die Firma des Onkels nichts behaupten** — er kennt jede Zahl
  besser. Fragen statt sagen.

Bewusst **nicht** auf den Folien verwendet, weil nicht belastbar:
Schweizer Telefonaufkommen und No-Show-Quoten in Praxen, Rückweisungs-
quoten in Prozent, Maschinen-Leerlaufzeiten, Aufwand pro Submission,
Prämienwirkung von Sicherheitsschulungen, die Bandbreiten des
LMV-Arbeitszeitkalenders (die Quellen widersprechen sich), und sämtliche
Anbieterversprechen zu Zeitersparnis durch KI-Dokumentation.

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Die komplette Anwendung — Design, Slide-Engine, alle vier Decks, Katalog, Rechner, eingebettete Recherche |
| `artifact.html` | Dieselbe Anwendung ohne HTML-Rahmen, für die Veröffentlichung als Artifact |
| `recherche/*.md` | Die elf Rechercheberichte im Original |
| `tools/inline-recherche.mjs` | Bettet die Berichte in `index.html` ein und erzeugt `artifact.html` |
| `tools/check.mjs` | Prüft Syntax, Marker, externe Abhängigkeiten und Theme-Aufbau |
| `tools/folien-pruefen.mjs` | Blättert jede Folie jedes Decks durch und meldet abgeschnittene Inhalte, fehlende Sprechernotizen und seitwärts scrollende Ansichten |

Nach einer Änderung an den Rechercheberichten:

```bash
cd praesentation
node tools/check.mjs && node tools/inline-recherche.mjs && node tools/folien-pruefen.mjs
```

`tools/folien-pruefen.mjs --bilder` legt zusätzlich Screenshots jeder
Folie in hell und dunkel unter `.screenshots/` ab.

## Technisches

- **Eine Datei, keine Abhängigkeiten** ausser den Google-Schriften. Ohne
  Netz fällt die Typografie auf Systemschriften zurück, alles andere
  funktioniert unverändert.
- **Hell und dunkel**, folgt der Systemeinstellung, umschaltbar unten
  links.
- **Folien skalieren mit dem Fenster** (Container-Queries), sind also auf
  jedem Beamer gleich gesetzt. Auf schmalen Geräten wird aus der Folie
  eine lesbare Karte.
- **Drucken** ergibt eine Folie pro Seite — für ein Handout.
- **Nichts verlässt das Gerät.** Kein Analytics, kein Tracking, keine
  externen Aufrufe. Die Eingaben liegen im lokalen Speicher des Browsers.

## Grenzen

- Die Zahlen auf den Folien sind so gut wie ihre Quellen. Wo eine Quelle
  schwach ist — Verbandsangabe, Anbieterangabe, veraltetes Bezugsjahr —
  steht das auf der Folie oder in der Sprechernotiz.
- Der Nutzenrechner ist ein Gedankenmodell, kein Angebot. Er rechnet mit
  45 Arbeitswochen und Vollkosten. Gewonnene Zeit ist nur dann Geld, wenn
  sie tatsächlich anders eingesetzt wird.
- Aufwands- und Dauerangaben im Katalog sind Erfahrungswerte und
  Schätzungen, keine Offerten.
- Die rechtlichen Hinweise sind Orientierung, keine Rechtsberatung. Vor
  dem Aufbau einer Kapazitätsplattform und vor dem ersten Vertrag gehört
  ein Blick von Treuhand oder Anwalt darauf.
