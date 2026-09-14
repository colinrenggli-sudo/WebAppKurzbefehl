# FLUSSWERK Lead-Radar

Treuhandfirmen in der Schweiz, die **gerade jetzt** eine Stelle als
Sachbearbeiter/in ausgeschrieben haben – gefiltert, nach Muster bewertet,
mit fertiger Ansprache und einer Besuchsliste für die Zentralschweiz.

Die These dahinter ist einfach: Wer inseriert, hat mehr Arbeit als Leute
und findet niemanden. Das ist der Moment, in dem sich jemand für
Automatisierung interessiert – und nicht drei Monate später, wenn die
Stelle notdürftig besetzt ist.

## Sofort ausprobieren

`treuhand/index.html` im Browser öffnen – mehr braucht es nicht. Keine
Installation, kein Build, kein Konto, keine Anmeldung. Status, Notizen und
die Score-Gewichte bleiben im Browser (localStorage).

## Die fünf Ansichten

| Ansicht | Wofür |
|---|---|
| **Radar** | Alle Firmen als Tabelle. Filtern nach Region, Kanton, Status, Score. Sortieren per Klick auf den Spaltenkopf. «Details» klappt die Score-Herleitung und ein Notizfeld auf. |
| **Besuchen** | Nur Zentralschweiz, nach Ort gruppiert. Über **Drucken** wird daraus eine Tourenliste fürs Auto – Karte, Website und Score stehen drauf. |
| **Ansprache** | Mailtext je Firma in vier Tonalitäten. Nennt immer das konkrete Inserat, sagt woher die Angaben stammen, endet mit einer Abmeldezeile. Direkt ins Mailprogramm oder in die Zwischenablage. |
| **Quellen** | Jede Plattform mit fertiger Such-URL. Einmal pro Woche durchklicken hält die Liste aktuell. Grün markiert heisst: hat eine API oder einen Feed, lässt sich also automatisieren. |
| **Muster** | Die Score-Gewichte als Regler. Verstellen wirkt sofort auf Radar und Besuchsliste. |

## Was drin ist

**130 Firmen**, davon **89 mit einer aktuell ausgeschriebenen Stelle**, und
**159 Quellen** mit fertiger Such-URL. Schwerpunkt Zentralschweiz: 73 Firmen im
Kanton Luzern, 32 in Zug, dazu Schwyz, Nidwalden und Obwalden.

Die eigentliche Arbeitsliste sind **36 Firmen**, die alles drei erfüllen: eine
offene Stelle, kein Personalvermittler dazwischen, Score 70 oder höher. Die
stehen im Radar zuoberst. Für die Besuchsliste bleiben **45 Treuhandbüros** in
der Zentralschweiz mit offener Stelle.

> **Kein Eintrag ist verifiziert.** Die Recherche lief über die
> Suchindexierung, weil der Netzwerk-Proxy die Jobportale blockiert hat.
> Firmenname und Stelle stehen im Suchtreffer, die Inseratsseite hat niemand
> geöffnet. **Vor der ersten Mail das Inserat aufrufen und prüfen, ob es noch
> läuft** – ein besetztes Inserat macht aus einer guten Mail eine peinliche.
> Warum das so ist und was sonst noch fehlt: [RECHERCHE.md](RECHERCHE.md).

## Der Score

Sieben Kriterien ergeben einen **Fit-Score von 0 bis 100**. Der **Regionsbonus**
kommt obendrauf und ist bei 100 gedeckelt.

| Kriterium | Standard | Warum |
|---|---:|---|
| Offene Stelle ausgeschrieben | 30 | Das Kaufsignal. Zwei gleichzeitig offene Fachstellen unter 35 Köpfen sind strukturelle Unterbesetzung, nicht eine Kündigung – das gibt den vollen Wert. |
| Grösse im Zielfenster | 22 | 8 bis 35 Vollzeitstellen, Kern 10 bis 25. Darunter fehlt die Wiederholung, darüber entscheidet ein Gremium statt der Inhaber. |
| Stelle trifft den Kern | 15 | Sachbearbeitung, Buchhaltung, Lohn, Mandatsleitung. Lehrstelle und Praktikum zählen null – das ist Nachwuchsplanung, kein Kapazitätsschmerz. |
| Arbeitgeber inseriert selbst | 12 | Ein Personalvermittler dazwischen heisst: wir reden nicht mit dem Entscheider. |
| Bekannter Software-Stack | 11 | Abacus mit AbaWeb und bexio sind grün: offene Schnittstellen, digitale Belegflüsse. Sage 50 im Keller oder Excel-Buchhaltung ist rot. |
| Ansprechperson bekannt | 6 | Ohne Namen wird aus dem Lead ein Briefkasten. |
| Angaben verifiziert | 4 | Inserat selbst gesehen statt nur ein Suchtreffer. |
| *Regionsbonus* | *+8* | *Luzern und Agglo 8 · übrige Zentralschweiz 5 · Nachbarkantone 2 · Rest 0* |

Die Region steckt bewusst **nicht** im Fit-Score. Ein Büro in Zürich mit 90
Fit-Punkten ist ein hervorragender Kunde – es braucht nur eine andere
Verkaufsbewegung. Der Bonus steuert die Reihenfolge der Bearbeitung, nicht die
Qualität des Leads.

**Ausgeschlossen** werden Firmen unter 4 oder über 50 Mitarbeitenden (nur bei
belegter Zahl, nie bei einer geschätzten) sowie Teile nationaler Gruppen und
Prüfnetzwerke. Sie erscheinen mit «–» statt einem Score.

**Die Gewichte sind eine Hypothese, keine Naturkonstante.** Nach den ersten
zwanzig Gesprächen gehören sie angepasst – genau dafür sind die Regler da.

## Absender eintragen

Ganz oben im `<script>` von `index.html` steht der Block `ABSENDER`. Dort
Name, Rolle, **vollständige Postadresse**, Mailadresse und Telefon eintragen –
alle vier Mailvorlagen ziehen mit.

Die Adresse ist Pflicht, nicht Kosmetik: Das UWG verlangt in Werbemails eine
korrekte und vollständige Absenderangabe. Solange sie fehlt, schreibt die
Signatur sichtbar `[ADRESSE EINTRAGEN]` ins Mail, statt sie stillschweigend
wegzulassen.

## Datenstand

Die Firmenliste steht im Abschnitt **DATEN** am Ende von `index.html`
(`ROHDATEN` und `QUELLEN`) und zusätzlich als **`leads.csv`** – dieselben Daten
samt Score, direkt in Excel zu öffnen. Sie ist eine Momentaufnahme. Stelleninserate
laufen aus, neue kommen dazu – wer die Liste zwei Wochen liegen lässt,
schreibt Firmen an, die schon besetzt haben. Der Reiter **Quellen** ist
darum wichtiger als die Tabelle: dort steht, wie man in zehn Minuten neu
erntet.

Woher die Daten stammen, wie verlässlich sie sind und was bei Kaltakquise
in der Schweiz rechtlich gilt: **[RECHERCHE.md](RECHERCHE.md)**.
