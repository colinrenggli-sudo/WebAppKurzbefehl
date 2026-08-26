# FLUSSWERK – Recherche

Grundlage für die Auswahl der Strecken, die Abfluss-Richtwerte und die
Sicherheitsinhalte. Die Frage war: Welche Flussschwimmstrecken sind in der
Schweiz tatsächlich etabliert, welche Daten gibt es öffentlich dazu, und wo
verläuft die Grenze zwischen «Information» und «Empfehlung», die eine solche
Seite nicht überschreiten darf?

## 1 · Warum diese sechs Strecken

Aufgenommen wurde nur, was als Flussschwimmstrecke etabliert und öffentlich
dokumentiert ist – mit bekannten Ein- und Ausstiegen, Infrastruktur oder
langer Tradition. Bewusst keine Geheimtipps: Eine Übersichtsseite soll
niemanden an Stellen schicken, die nicht ohnehin beschwommen werden.

| Strecke | Warum sie dabei ist |
|---|---|
| Aare, Eichholz–Marzili (Bern) | Die bekannteste Stadtstrecke des Landes; Freibad Marzili mit markierten Ausstiegen als Endpunkt |
| Rhein, St. Alban–Dreirosen (Basel) | Grosse Basler Sommertradition; für diese Strecke wurde der «Wickelfisch»-Schwimmsack erfunden |
| Limmat, Flussbad Oberer Letten (Zürich) | Beaufsichtigter 400-m-Kanal – die sanfteste Form des Flussschwimmens, ideal für den Einstieg |
| Rhein, Tössegg–Eglisau | Klassische lange Treibstrecke mit Rhybadi Eglisau als Ziel; steht stellvertretend für das Streckenschwimmen mit Boje |
| Reuss, Bremgarten | Etablierter Badefluss mit Flussbad; zeigt exemplarisch die Wehr-Problematik (Kraftwerk unterhalb) |
| Rhone, Pointe de la Jonction (Genf) | Das Genfer Pendant zur Aare; führt Oberflächenwasser des Genfersees und ist damit oft der wärmste Fluss der Schweiz |

Nicht aufgenommen: Wildbäche und alpine Flüsse (Verzasca, Maggia usw.) – dort
ist Baden ein Pool-Thema, nicht Streckenschwimmen, und die Schwallgefahr
durch Kraftwerke ist ein eigenes Kapitel. Ebenfalls draussen: Strecken, deren
Begehung umstritten oder örtlich untersagt ist.

## 2 · Datenlage

### Wasserdaten

Das BAFU betreibt das nationale hydrologische Messnetz und publiziert
Abfluss, Pegel und Wassertemperatur auf
[hydrodaten.admin.ch](https://www.hydrodaten.admin.ch). Eine offizielle,
CORS-offene JSON-Schnittstelle für Browser gibt es nicht; der Verein
existenz.ch bereitet die BAFU-Daten als öffentliche API auf
([api.existenz.ch](https://api.existenz.ch), gleiche Quelle, die auch hinter
bekannten Aare-Apps steht). FLUSSWERK ruft `apiv1/hydro/latest` mit den
Parametern `temperature` und `flow` ab.

Verwendete Stationsnummern und ihre Nähe zur Strecke:

| Strecke | Station | Lage |
|---|---|---|
| Aare Bern | 2135 Bern, Schönau | direkt an der Strecke |
| Rhein Basel | 2289 Basel, Rheinhalle | direkt an der Strecke |
| Limmat Zürich | 2243 Zürich, KW Letten | direkt an der Strecke |
| Rhein Tössegg–Eglisau | 2143 Rekingen | flussabwärts, Näherung |
| Reuss Bremgarten | 2018 Mellingen | flussabwärts, Näherung |
| Rhone Genf | 2606 Genf, Halle de l’Ile | oberhalb der Jonction, Näherung |

Die Seite ist gegen falsche oder stumme Stationen gebaut: Liefert eine
Station nichts, zeigt die Karte den gekennzeichneten Richtwert («RICHTWERT»
statt «LIVE»); Näherungen sind im Streckendetail vermerkt.

### Wetter

Lufttemperatur und Wettercode je Standort von
[Open-Meteo](https://open-meteo.com) – dieselbe Quelle, die auch DACHWERK im
Repository nutzt: frei, ohne Schlüssel, CORS-offen.

## 3 · Die Abfluss-Richtwerte

Es gibt **keine amtlichen Schwimm-Grenzwerte** für Schweizer Flüsse. Die
Behörden arbeiten mit Hochwasser-Gefahrenstufen je Messstation
(hydrodaten.admin.ch, naturgefahren.ch), und Städte wie Bern raten ab einer
gewissen Wasserführung öffentlich vom Aareschwimmen ab. Bekannte Apps wie
Aare Guru übersetzen den Abfluss ebenfalls in eine eigene, nicht amtliche
Einschätzung.

FLUSSWERK macht es transparent gleich: Zwei Richtwerte je Strecke –
**Vorsicht** (nur sehr Geübte) und **Stopp** (nicht schwimmen) – gesetzt aus
dem Verhältnis zum langjährigen Sommerabfluss der jeweiligen Station
(«Vorsicht» bei rund dem Anderthalbfachen, «Stopp» bei rund dem Doppelten,
gerundet und je Fluss plausibilisiert):

| Strecke | typischer Sommerabfluss | Vorsicht | Stopp |
|---|---|---|---|
| Aare Bern | ~170 m³/s | 250 | 360 |
| Rhein Basel | ~1050 m³/s | 1800 | 2500 |
| Limmat Zürich | ~100 m³/s | 180 | 250 |
| Rhein Tössegg | ~450 m³/s | 600 | 800 |
| Reuss Bremgarten | ~140 m³/s | 250 | 350 |
| Rhone Genf | ~310 m³/s | 400 | 550 |

Das ist bewusst konservativ und ersetzt keine Warnung: Die Seite sagt es an
drei Stellen (Datenleiste, Streckendetail, Fusszeile) und verlinkt die
amtlichen Quellen. Beim Flussbad Letten kommt hinzu, dass der Betrieb selbst
über die Öffnung entscheidet – die Ampel kann offen zeigen, was das Bad
geschlossen hat.

## 4 · Sicherheitsinhalte

- Die sechs Regelkarten folgen den **Bade- und Flussregeln der SLRG**
  ([slrg.ch/de/baderegeln](https://www.slrg.ch/de/baderegeln)): nur Geübte,
  Erkunden vor dem Schwimmen, nie bei Trübung oder Hochwasser, Hindernisse
  und Wehre meiden, nie allein/überhitzt/alkoholisiert, sichtbare
  Schwimmhilfe. Formulierungen sind eigene, sinngemässe Fassungen.
- Die **Kaltwasser-Tabelle** fasst die gängige Lehre zur Kaltwassergefahr
  zusammen (Kälteschock beim Eintauchen, rasch schwindende Muskelkraft,
  Grenze für Ungeschützte um die 12–15 °C). Die Stufen sind bewusst grob und
  auf der vorsichtigen Seite.
- **Wehre und Kraftwerke** sind die tödlichste Einzelgefahr beim
  Flussschwimmen (Walzen unterhalb von Querbauwerken). Deshalb nennt jede
  Strecke ihr «hartes Ende» (Schwellenmätteli, Hafen Basel, KW Letten,
  KW Bremgarten) prominent in den Gefahrenpunkten.

## 5 · Was bewusst weggelassen wurde

- **Wasserqualität/Bakteriologie** – die kantonalen Badewasserdaten sind
  uneinheitlich publiziert; eine halbgare Anzeige wäre gefährlicher als
  keine.
- **Prognosen** («morgen 21 °C») – Wassertemperatur-Vorhersagen sind ohne
  eigenes Modell unseriös; die Seite zeigt nur Messwerte.
- **Community-Funktionen** (Spots melden, Bewertungen) – eine statische
  Seite ohne Backend soll nicht so tun, als moderiere sie Inhalte.
- **Weitere Strecken** (Aare Thun–Bern, Solothurn, Rhein Schaffhausen,
  Ticino) – gute Kandidaten für einen Ausbau, aber jede Strecke braucht
  sauber recherchierte Ein-/Ausstiege; lieber sechs richtig als zwölf halb.

## 6 · Quellen

- [BAFU – hydrologische Daten (hydrodaten.admin.ch)](https://www.hydrodaten.admin.ch)
- [existenz.ch API-Dokumentation](https://api.existenz.ch)
- [Naturgefahrenportal des Bundes](https://www.naturgefahren.ch)
- [SLRG – Bade- und Flussregeln](https://www.slrg.ch/de/baderegeln)
- [Stadt Bern – Aareschwimmen und Marzili](https://www.bern.ch)
- [Basel Tourismus – Rheinschwimmen](https://www.basel.com/de/rheinschwimmen)
- [Stadt Zürich – Flussbad Oberer Letten](https://www.stadt-zuerich.ch)
- [Open-Meteo](https://open-meteo.com)
