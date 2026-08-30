# SCHLAFWERK

Ein Wecker, der den eigenen Rhythmus kennt – und der still bleibt, wenn es
nichts zu sagen gibt.

**[Live ansehen](https://colinrenggli-sudo.github.io/WebAppKurzbefehl/schlaf/)**
· oder `schlaf/index.html` im Browser öffnen. Eine einzige Datei, kein Build,
kein Server, keine externen Requests.

---

## Was die App kann

### Wecken

* **Fester Wecker** mit Wochentagen, Beschriftung und Schlummerfunktion.
* **Timer-Wecker**: «weck mich in viereinhalb Stunden». Die angebotenen
  Dauern sind Vielfache der *eigenen* Zykluslänge, nicht der 90 Minuten aus
  dem Lehrbuch – bei genug Daten misst die App den Wert aus den REM-Phasen.
* **Sanftes Fenster**: bis zu 30 Minuten vor der Weckzeit sucht die App den
  Zeitpunkt, an dem laut Zyklusrechnung ein Zyklus endet, und klingelt dort.
  Das ist eine Schätzung aus Einschlafzeitpunkt und Zykluslänge – die Uhr
  misst nicht live mit, und die App behauptet das auch nirgends.
* **Rückwärts rechnen**: Aufstehzeit eingeben, passende Zubettgeh-Zeiten
  bekommen, inklusive der eigenen typischen Einschlafdauer.
* Klingelton wird im Browser erzeugt (sanft / klar / Wellen), wahlweise
  langsam lauter werdend, mit Vibration und Bildschirmsperre-Verhinderung.

### Daten

* **Fitbit verbinden** – OAuth 2.0 mit PKCE, direkt im Browser, ohne Server
  und ohne Client-Secret. Einmalig eine eigene App auf `dev.fitbit.com`
  registrieren (Typ **Client**, Redirect-URL wird in der App angezeigt), dann
  die Client-ID einsetzen. Geholt werden Schlafprotokolle inklusive
  Schlafphasen der letzten 90 Tage (auf Wunsch ein Jahr).
* **Selbst erfassen** – Nacht oder Nickerchen von Hand. Zählt in der Analyse
  gleich viel; bei der Einschlafdauer ist die eigene Angabe sogar
  zuverlässiger als die Uhr.
* **Importieren** – JSON aus einem Fitbit-Datenexport oder ein früherer
  eigener Export.
* **Demo-Daten** – 63 erfundene Nächte eines Spättyps, um die Analyse ohne
  eigene Daten anzuschauen.
* **Vom eigenen Server** – läuft die App auf dem eigenen Server und dort
  der Abgleich aus [`deploy/fitbit-sync`](../deploy/fitbit-sync/), liest
  sie beim Öffnen einfach `daten/schlaf.json` mit. Dann muss sich kein
  einzelnes Gerät mehr mit Fitbit verbinden, und die Daten bleiben auch
  dann erhalten, wenn Fitbit die Schnittstelle abstellt.

### Muster

Aus den Nächten rechnet die App ein Profil, jeweils mit ehrlicher Angabe,
wie belastbar der Wert ist:

| Wert | Wie er entsteht |
| --- | --- |
| **Chronotyp** | Mitte des Schlafs an freien Tagen, korrigiert um nachgeholten Schlaf (MSFsc nach Roenneberg) |
| **Schlafbedarf** | Mitte der freien Nächte – dort schläft man so lang, wie man mag |
| **Zykluslänge** | Median der Abstände zwischen den REM-Beginnzeitpunkten |
| **Regelmässigkeit** | Sleep Regularity Index: Wahrscheinlichkeit, zur selben Minute im selben Zustand zu sein wie am Vortag (0–100) |
| **Sozialer Jetlag** | Abstand der Schlafmitte zwischen Arbeits- und freien Tagen |
| **Schlafschuld** | Bedarf minus tatsächlicher Schlaf über 14 Tage |
| **Einschlafdauer, Effizienz, Wachzeit** | Mediane über alle Nächte |

Dazu ein Wochenprofil (typische Zeiten je Wochentag), ein Zeitstrahl der
letzten Nächte und Befunde in Klartext – zum Beispiel, wie viel Schlaf ein
später Abend an Arbeitstagen tatsächlich kostet.

### Themen statt Zahlenfriedhof

Man wählt aus, was einen stört – «ich liege lange wach», «ich wache nachts
auf», «ich komme morgens nicht hoch», «mein Rhythmus ist unregelmässig»,
«ich schlafe zu wenig», «nachmittags falle ich um», «ich verschlafe»,
«wechselnde Zeiten». Die App sucht danach gezielt in den Daten und antwortet
mit Zahlen aus den eigenen Nächten statt mit Allgemeinplätzen. Alles andere
bleibt ausgeblendet.

### Pläne

Vier Schlafpläne, jeweils mit den eigenen Werten durchgerechnet und als
24-Stunden-Ring dargestellt – dahinter blass die tatsächlich gemessenen
Zeiten:

* **Eine Nacht** – der Normalfall.
* **Zweiphasig (Siesta)** – kürzere Nacht plus ein voller Zyklus im
  Nachmittagstief.
* **Nacht + Powernap** – volle Nacht, dazu 20 Minuten.
* **Zweimal pennen** – Schlaf bewusst auf zwei Blöcke verteilt, beide
  Vielfache der eigenen Zykluslänge.

Jeder Plan bekommt eine Einschätzung: *passt zu dir*, *geht mit Abstrichen*
oder *schwierig* – samt Begründung, etwa wenn die nötige Zubettgehzeit weit
vor dem liegt, was der eigene Rhythmus hergibt. Ein übernommener Plan legt
die passenden Wecker gleich an.

### Ruhe

Das Kernversprechen: **höchstens ein Hinweis pro Tag** (einstellbar auf 0, 1
oder 3). Die App wählt aus allen möglichen Hinweisen den aus, der gerade am
meisten bringt, zeigt ihn einmal und wiederholt ihn frühestens nach vier
Tagen. In der Ruhezeit kommt höchstens die Erinnerung ans Zubettgehen. Jeder
Hinweis lässt sich dauerhaft abstellen.

---

## Bedienung

| | |
| --- | --- |
| **Heute** | Uhr, ein Hinweis, Zyklus-Vorschläge, Plan des Tages, letzte Nacht |
| **Wecker** | Timer, feste Wecker, Rückwärtsrechner, Zuverlässigkeit |
| **Schlaf** | Fitbit, Zeitstrahl, alle Nächte, selbst erfassen |
| **Muster** | Themen, Profil, Wochenprofil, Befunde |
| **Plan** | Plan wählen, rechnen lassen, übernehmen |

Zahnrad oben rechts: Hinweis-Budget, Ruhezeit, Klingelton, sanftes Fenster,
Profilwerte von Hand setzen, freie Tage festlegen, Export/Import, alles
löschen.

## Grenzen – ehrlich benannt

* **Ein Browser-Wecker ist kein Handy-Wecker.** Sicher klingelt er, solange
  die Seite offen und der Bildschirm an ist; dafür hält die App den
  Bildschirm wach, wenn ein Wecker läuft. Als installierte App
  («Zum Home-Bildschirm») ist es deutlich zuverlässiger. Für einen Termin,
  auf den es wirklich ankommt: zusätzlich den Systemwecker stellen.
* **Das sanfte Fenster rechnet, es misst nicht.** Die Fitbit-API liefert
  Schlafphasen erst nach dem Aufwachen und der Synchronisation, nicht live.
* **Werte einer Uhr am Handgelenk sind Schätzungen** aus Bewegung und Puls.
  Für Trends taugen sie gut, für die einzelne Nacht nur bedingt.
* **Keine Medizin.** Wer über Wochen schlecht schläft, tagsüber einschläft,
  mit Atemaussetzern schnarcht oder trotz genug Schlaf erschöpft ist, gehört
  in fachliche Abklärung. Das misst keine App zuverlässig.

## Datenschutz

Alles bleibt im `localStorage` des Browsers: Nächte, Wecker, Einstellungen
und auch das Fitbit-Token. Es gibt keinen Server, kein Konto, keine
Analytics. Der Export erzeugt eine JSON-Datei, die man selbst behält.

Die einzige ausgehende Verbindung ist die zu `api.fitbit.com`, und nur, wenn
man Fitbit ausdrücklich verbindet.

## Technik

Vanilla JavaScript, kein Framework, kein Build-Schritt. Eine HTML-Datei mit
eingebettetem CSS und JS, dazu `manifest.json`, `sw.js` (nur für
Benachrichtigungen, kein Caching) und zwei SVG-Icons. Diagramme sind
handgeschriebenes SVG, die Klingeltöne werden per Web Audio erzeugt – damit
bleibt die App eigenständig und offline lauffähig.

Recherche, Rechenwege und Quellen: [RECHERCHE.md](RECHERCHE.md)
