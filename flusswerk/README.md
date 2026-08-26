# FLUSSWERK

Flussschwimmen in der Schweiz auf einen Blick: Wassertemperatur, Abfluss und
eine ehrliche Ampel für sechs klassische Strecken – Aare in Bern, Rhein in
Basel und im Zürcher Unterland, Limmat in Zürich, Reuss in Bremgarten und
Rhone in Genf. Dazu die Flussregeln der SLRG, eine Kaltwasser-Tabelle und
das kleine Einmaleins des Flussschwimmens.

## Sofort ausprobieren

`flusswerk/index.html` im Browser öffnen – mehr braucht es nicht. Keine
Installation, kein Build, kein Konto.

Mit Internetverbindung holt die Seite Live-Werte; ohne Verbindung zeigt sie
gekennzeichnete Richtwerte eines typischen Augusttags («RICHTWERT» statt
«LIVE» auf den Karten).

## Was drin ist

| Bereich | Inhalt |
|---|---|
| Strecken | Sechs Karten mit Wassertemperatur, Abfluss, Pegelbalken und Ampel |
| Streckendetail | Einstieg, Ausstieg, Gefahren, Anreise, Karte, amtliche Messstation |
| Sicherheit | Die Flussregeln nach SLRG, Notfallnummern |
| Kaltes Wasser | Was welche Wassertemperatur bedeutet |
| Wissen | Treiben statt kämpfen, Ausrüstung, Saison, Gewitterregel |

## Die Ampel

Jede Strecke hat zwei Abfluss-Richtwerte in m³/s: **Vorsicht** (nur sehr
Geübte) und **Stopp** (nicht schwimmen). Der Zeiger auf dem Pegelbalken
zeigt, wo der aktuelle Abfluss dazwischen liegt. Die Richtwerte sind eine
Setzung dieser Seite – Herleitung und Quellen stehen in
[`RECHERCHE.md`](RECHERCHE.md). Massgebend bleiben immer die amtlichen
Warnungen und der eigene Blick vor Ort.

## Datenquellen

- **Wasser:** BAFU-Messstationen (Temperatur und Abfluss), bezogen über die
  öffentliche [existenz.ch-API](https://api.existenz.ch), die die Daten von
  [hydrodaten.admin.ch](https://www.hydrodaten.admin.ch) aufbereitet.
- **Wetter:** [Open-Meteo](https://open-meteo.com), Lufttemperatur und
  Wettercode je Streckenstandort.
- Nachgeladen wird beim Öffnen, per Knopf und alle zehn Minuten. Fällt eine
  Quelle aus, erscheinen die Richtwerte – klar markiert.

## Grenzen dieser Seite

- **Keine Warn-App.** Die Ampel beruht auf Richtwerten dieser Seite, nicht
  auf behördlichen Gefahrenstufen. Hochwasserwarnungen des Bundes stehen auf
  [naturgefahren.ch](https://www.naturgefahren.ch).
- **Messstellen liegen nicht immer an der Strecke.** Wo die nächste
  BAFU-Station flussauf- oder flussabwärts liegt, ist das im Streckendetail
  vermerkt; die Werte sind dann eine Näherung.
- **Streckenbeschreibungen ersetzen die Erkundung nicht.** Einstiege,
  Ausstiege und Absperrungen ändern sich – vor dem ersten Schwumm alles vom
  Ufer aus anschauen.

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Die komplette Seite: Design, Streckendaten, Live-Abfrage |
| `RECHERCHE.md` | Recherche zu Strecken, Richtwerten und Quellenlage |
