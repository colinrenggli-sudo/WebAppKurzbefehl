# RAUMWERK – Demo

Grundriss hochladen, Stil wählen, fertige Einrichtung für die ganze
Wohnung erhalten: pro Raum eine Ansicht, ein möblierter Plan, ein
Moodboard und die Möbelliste mit Budget.

## Sofort ausprobieren

`raumdesign/index.html` im Browser öffnen – mehr braucht es nicht. Keine
Installation, kein Build, kein Server, kein Konto. Die Seite kommt ohne
einen einzigen externen Request aus.

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

Mit einem eigenen Plan geht es genauso: Datei ziehen oder auswählen, dann
die Wohnfläche in m² eintragen. Daraus wird der Massstab berechnet,
deshalb stimmen anschliessend Möbelgrössen und Laufwege.

Ohne Plan geht es auch: **Ohne Plan starten** legt eine Standardwohnung
an, deren Räume und Flächen sich von Hand pflegen lassen.

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

## Fotorealistischer Render (optional)

Die eingebaute Raumansicht ist berechnet, kein KI-Bild – sie läuft
offline und kostet nichts. Wer zusätzlich ein Foto möchte, hinterlegt
unter **Einstellungen** einen eigenen API-Schlüssel:

- **Google Gemini** – Schlüssel aus dem Google AI Studio
- **OpenAI** – `gpt-image-1`

Der Schlüssel bleibt im Browser (`localStorage`) und wird nur an den
gewählten Anbieter gesendet. Es fallen die Kosten des eigenen Kontos an.
Im Ergebnis erscheint dann pro Raum die Schaltfläche **Fotorealistisch
rendern**; die berechnete Zeichnung bleibt jederzeit abrufbar.

## Datenschutz

Alles läuft lokal im Browser. Der Grundriss wird nirgendwohin
hochgeladen, solange der KI-Render nicht bewusst aktiviert wird. Der
Zwischenstand liegt im lokalen Speicher und überlebt das Neuladen; unter
**Neu starten** wird alles gelöscht.

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Die komplette App – Markup, Design-Tokens, Raumerkennung, Möbelkatalog, Darstellung |
| `RECHERCHE.md` | Recherche zu Stilen, Preisen, Erkennungsverfahren und Vergleichs-Apps |

## Grenzen der Demo

- Die Preise sind Richtwerte, keine Angebote, und enthalten weder
  Lieferung noch Montage
- Die Möbelliste nennt Kategorien, keine bestellbaren Artikel
- Türen und Fenster werden nicht aus dem Plan gelesen, sondern
  angenommen – die Möbelstellung im Grundriss ist damit ein Vorschlag
- Runde Wände, Treppenhäuser und stark vermasste Pläne können die
  Erkennung stören. Dann helfen **Neu erkennen** und **Raum
  einzeichnen**

Details und Quellen stehen in [`RECHERCHE.md`](RECHERCHE.md).
