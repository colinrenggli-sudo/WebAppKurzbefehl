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

## Der Score

Acht Kriterien, jedes mit einem Maximalwert, Summe normiert auf 0–100:

| Kriterium | Standard | Warum |
|---|---:|---|
| Offene Stelle ausgeschrieben | 30 | Das eigentliche Kaufsignal. Mehrere gleichzeitig offene Stellen geben den vollen Wert. |
| Nähe zu Luzern | 18 | Stadt und Agglo voll, übrige Zentralschweiz gut, weiter weg nur noch per Mail. |
| Firmengrösse im Zielband | 15 | Etwa 4–30 Mitarbeitende: genug Volumen, keine eigene IT, ein Entscheider am Tisch. |
| Stelle trifft unseren Kern | 12 | Sachbearbeitung, Buchhaltung, Lohn, Mandat – die Arbeit, die sich automatisieren lässt. |
| Arbeitgeber inseriert selbst | 10 | Ein Personalvermittler dazwischen heisst: wir reden nicht mit dem Entscheider. |
| Bekannter Software-Stack | 8 | Abacus, bexio, Klara, Sage, Topal – je bekannter, desto konkreter der erste Vorschlag. |
| Ansprechperson bekannt | 7 | Ohne Namen wird aus dem Lead ein Briefkasten. |
| Angaben verifiziert | 5 | Inserat selbst gesehen, nicht nur ein Suchtreffer. Schützt vor peinlichen Mails. |

Grosse Prüfungs- und Beratungsgruppen (BDO, PwC, KPMG, EY, Deloitte und
ähnliche) werden ausgeschlossen und mit «–» angezeigt: eigene IT, eigene
Prozesse, monatelange Beschaffung. Nicht der erste Kunde.

**Die Gewichte sind eine Hypothese, keine Naturkonstante.** Sobald die
ersten zwanzig Gespräche gelaufen sind, gehören sie angepasst – genau
dafür sind die Regler da.

## Absender eintragen

Ganz oben im `<script>` von `index.html` steht der Block `ABSENDER`. Dort
Name, Rolle, Mailadresse und Telefon eintragen – alle vier Mailvorlagen
ziehen mit.

## Datenstand

Die Firmenliste steht im Abschnitt **DATEN** am Ende von `index.html`
(`ROHDATEN` und `QUELLEN`). Sie ist eine Momentaufnahme. Stelleninserate
laufen aus, neue kommen dazu – wer die Liste zwei Wochen liegen lässt,
schreibt Firmen an, die schon besetzt haben. Der Reiter **Quellen** ist
darum wichtiger als die Tabelle: dort steht, wie man in zehn Minuten neu
erntet.

Woher die Daten stammen, wie verlässlich sie sind und was bei Kaltakquise
in der Schweiz rechtlich gilt: **[RECHERCHE.md](RECHERCHE.md)**.
