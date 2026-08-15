# RAUMWERK – Demo

Grundriss hochladen, Stil wählen, fertige Einrichtung für die ganze
Wohnung erhalten: pro Raum eine Ansicht, ein möblierter Plan, ein
Moodboard und die Möbelliste mit Budget.

## Sofort ausprobieren

Live: **<https://colinrenggli-sudo.github.io/WebAppKurzbefehl/raumdesign/>**

Oder `raumdesign/index.html` im Browser öffnen – mehr braucht es nicht.
Keine Installation, kein Build, kein Server, kein Konto. Ohne
hinterlegten Schlüssel stellt die Seite keinen einzigen externen Request.

Lokal mit Server (empfohlen):

```bash
cd raumdesign && python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

## In einer Minute durchgespielt

1. **Beispielgrundriss verwenden** antippen – eine 4½-Zimmer-Wohnung mit
   112 m² wird erzeugt und ausgewertet
2. Schritt 2 zeigt die neun erkannten Räume farbig im Plan. Einen Raum
   antippen, um ihn auszuwählen, den Typ in der Liste ändern
3. Schritt 3: Stil wählen, zum Beispiel **Japandi** mit Farbwelt
   **Dunkel & ruhig**, Budgetstufe **Gehoben**
4. **Einrichtung berechnen** – fertig

Mit einem eigenen Plan geht es genauso: Datei ziehen oder auswählen.

Ohne Plan geht es auch: **Ohne Plan starten** legt eine Standardwohnung
an, deren Räume und Flächen sich von Hand pflegen lassen.

## Wie die Raumgrössen zustande kommen

Die Raumformen erkennt RAUMWERK selbst aus dem Bild. Für die echten
Masse braucht es einen Bezug – dafür gibt es drei Wege, vom besten zum
einfachsten:

1. **Plan lesen** (mit Gemini-Schlüssel). Das Modell liest den Plan wie
   ein Architekt: erst gedruckte Flächenangaben, dann die Bemassung an
   den Wänden, dann die Massstabsleiste. Zu jedem Raum kommt zurück,
   woher die Zahl stammt. Die Formen aus der Bilderkennung und die
   Zahlen aus dem Plan werden über die Lage zusammengeführt.
   Anschliessend prüft RAUMWERK, ob alle Räume denselben Massstab
   ergeben; Ausreisser werden markiert, nicht stillschweigend
   übernommen.
2. **Massstab abgreifen** (ohne Schlüssel). Eine Strecke im Plan
   abfahren, deren Länge du kennst – Zimmerbreite, Türöffnung (meist
   0.80 m) oder die Massstabsleiste – und die Länge eintragen.
3. **Eine Fläche korrigieren.** Trägst du bei einem Raum die richtige
   Quadratmeterzahl ein, zieht RAUMWERK den ganzen Plan mit. Eine
   Korrektur genügt.

Die Wohnfläche ist danach ein **Ergebnis**, keine Eingabe. Änderst du
sie trotzdem, wird der ganze Plan entsprechend gestreckt.

## Was du einstellen kannst

| Bereich | Auswahl |
|---|---|
| Einrichtungsstil | 14, von Skandinavisch über Japandi und Industrial bis Maximalismus und Art Déco |
| Farbwelt | Hell & luftig · Warm & erdig · Kühl & klar · Dunkel & ruhig · Farbenfroh · Ton in Ton |
| Akzentfarbe | 10, von Terrakotta bis Bordeaux |
| Holz & Material | Eiche, Nussbaum, Esche weiss, Schwarz matt, Rattan, Stein |
| Budgetstufe | Sparsam · Mittel · Gehoben · Premium, dazu ein Wunschbudget |
| Haushalt | Alleine · Zu zweit · Familie · WG · 60 plus |
| Schalter | Haustiere · Second Hand · Barrierearm · Mietwohnung |
| Prioritäten | Homeoffice, Gäste, Stauraum, Media, Kochen, Lesen, Pflanzen, Kunst, Sport, Musik, Kinder, Nachhaltigkeit |
| Bau | Boden, Wandbehandlung, Lichtkonzept, Himmelsrichtung, Raumhöhe |

Die Auswahl wirkt sich wirklich aus: Der Haushalt bestimmt Sofagrösse und
Anzahl Sitzplätze, „Miete" streicht alle baulichen Posten, „Second Hand"
senkt die Preise um rund ein Drittel, und die Himmelsrichtung verschiebt
die Farbtemperatur.

## Was am Ende herauskommt

- **Gesamtübersicht** – Budget, Preis pro m², Verteilung auf
  Kostengruppen, Budget je Raum
- **Raumansicht** – berechnete Zentralperspektive in den Farben und
  Materialien des gewählten Stils
- **Möblierter Grundriss** – massstäblich gestellte Möbel innerhalb der
  erkannten Raumform, mit Bemassung
- **Moodboard** – Wand, Boden, Holz, Polster, Akzent, Metall, Textil,
  Teppich mit konkreter Materialangabe
- **Möbelliste** – jedes Stück mit Material, Mass, Stückzahl,
  Einzel- und Gesamtpreis, getrennt nach Basis und Extra
- **Einrichtungshinweis** je Raum – die Sache, die ein Einrichter zuerst
  sagen würde

Export: **Als PDF sichern** (Druckansicht), **Einkaufsliste kopieren**
(Klartext) und **Projekt exportieren** (JSON).

## Wunschbudget

Trägt man unter Budgetstufe ein Wunschbudget ein und wird es
überschritten, rechnet RAUMWERK aus, welche Ergänzungen sich streichen
lassen und wie viel das bringt.

## Gemini-Schlüssel (optional)

Ein eigener Schlüssel aus dem [Google AI Studio](https://aistudio.google.com/apikey)
schaltet zwei Dinge frei: **Plan lesen** und **fotorealistische Bilder**.
Nötig ist er nicht – ohne Schlüssel läuft alles andere unverändert.

Eintragen unter **Einstellungen**, dann auf **Schlüssel prüfen**. RAUMWERK
fragt die für deinen Schlüssel verfügbaren Modelle ab und wählt selbst
das beste für Bild und Analyse aus. Modellnamen ändern sich bei Google
laufend; deshalb wird gefragt statt geraten.

Im Ergebnis gibt es den Reiter **Bilder**: **Alle Räume rendern** erzeugt
für jeden Raum ein Bild, einzelne Räume lassen sich jederzeit neu
rendern, und jedes Bild kann einzeln gesichert werden. Mitgeschickt
werden der Raumausschnitt aus deinem Plan, die echten Raummasse, die
Farbpalette und die Möbelliste – damit das Bild wirklich diesen Raum
zeigt. Die berechnete Raumansicht bleibt jederzeit abrufbar.

Der Schlüssel bleibt im Browser (`localStorage`) und geht nur an Google.
Die Aufrufe laufen über dein eigenes Konto und kosten dort entsprechend.

**Wichtig:** In einer eingebetteten Vorschau (etwa einer geteilten
Artifact-Seite) sind externe Aufrufe gesperrt – dort funktioniert der
Schlüssel nicht, egal ob er stimmt. Nutze die eigene Adresse oder die
Datei lokal.

## Datenschutz

Ohne hinterlegten Schlüssel läuft alles lokal im Browser und der
Grundriss verlässt das Gerät nicht.

Mit Schlüssel gehen genau zwei Dinge an Google, beide nur auf deinen
ausdrücklichen Knopfdruck: bei **Plan lesen** das Planbild, beim Rendern
der Ausschnitt des jeweiligen Raums samt Stilvorgaben. Sonst nichts.

Der Zwischenstand liegt im lokalen Speicher und überlebt das Neuladen;
unter **Neu starten** wird alles gelöscht, Schlüssel inklusive.

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Die komplette App – Markup, Design-Tokens, Raumerkennung, Möbelkatalog, Darstellung |
| `RECHERCHE.md` | Recherche zu Stilen, Preisen, Erkennungsverfahren und Vergleichs-Apps |

## Grenzen der Demo

- Die Preise sind Richtwerte, keine Angebote, und enthalten weder
  Lieferung noch Montage
- Die Möbelliste nennt Kategorien, keine bestellbaren Artikel
- Wie gut **Plan lesen** funktioniert, hängt vom Plan ab: ein sauberer
  Architektenplan mit Bemassung wird zuverlässig gelesen, ein schiefes
  Foto einer Skizze deutlich schlechter. Deshalb die Ausreisser-Markierung
  und die Möglichkeit, jede Zahl von Hand zu korrigieren
- Türen und Fenster werden nicht aus dem Plan gelesen, sondern
  angenommen – die Möbelstellung im Grundriss ist damit ein Vorschlag
- Runde Wände, Treppenhäuser und stark vermasste Pläne können die
  Erkennung stören. Dann helfen **Neu erkennen** und **Raum
  einzeichnen**

Details und Quellen stehen in [`RECHERCHE.md`](RECHERCHE.md).
