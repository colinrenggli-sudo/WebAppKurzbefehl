# STUNDENWERK – Recherche und Fachgrundlagen

Zusammengetragen am 1. September 2026 für den Bau des Stundenplan-Generators.
Direktabrufe vieler Schweizer Schul- und Behördenseiten waren aus der Entwicklungsumgebung
gesperrt; die Fakten stammen aus Suchergebnissen der Originalseiten und sind mit
Vertrauensgrad markiert. Alles, was «Annahme» heisst, ist in der App konfigurierbar.

## 1. KV Luzern Berufsfachschule

| Fakt | Vertrauen |
|---|---|
| Standorte Schulzentrum Dreilinden (Dreilindenstrasse 20, kaufmännische Berufe) und Schulhaus Landenberg (Detailhandel), Luzern | hoch |
| Über 100 Lehrpersonen, über 1000 Lernende in der kaufmännischen Grundbildung, rund 600 im Detailhandel, rund 180 in der Erwachsenenbildung; Trägerschaft Kaufmännischer Verband Luzern | hoch |
| Bildungsgänge: Kaufleute EFZ (Bildungsverordnung 2023), Kaufleute EFZ mit BM1 (Typ Wirtschaft / Dienstleistungen), Kaufleute EBA, Detailhandelsfachleute EFZ (Reform 2022, mit oder ohne BM), Detailhandelsassistent/in EBA, KV und Detailhandel für Erwachsene, BM2; B- und E-Profil laufen aus | hoch |
| Stundenplan-Publikation heute über WebUntis / Untis Mobile und die Schulverwaltung schulNetz | hoch |
| Schultage: Kaufleute EFZ 2-2-1 (zwei Schultage im 1. und 2. Lehrjahr, einer im 3.), maximal 9 Lektionen pro Schultag; BM1 zwei Schultage in allen drei Jahren; EBA 2 / 1 Tage; Detailhandel EFZ 1.5 / 2 / 1 Tage; Detailhandel EBA 1 Tag | hoch |
| Rund 95 Klassen (Annahme aus rund 1800 bis 2000 Lernenden und etwa 20 pro Klasse) | tief |

## 2. Lektionentafeln (Wochenlektionen je Lehrjahr)

Jahrestotale nach den Bildungsverordnungen (Kaufleute EFZ 1800 Lektionen, EBA 960); die
Wochenverteilung ist eine Annäherung, die die Totale exakt trifft. Alle Tafeln sind in der App
unter «Lehrgänge» editierbar.

| Lehrgang | 1. LJ | 2. LJ | 3. LJ | Bemerkung |
|---|---|---|---|---|
| Kaufleute EFZ 2023 | 18 | 18 | 9 | HKB A–E, Wahlpflichtbereich (Französisch oder Projektarbeit) in LJ 1–2, Option in LJ 3, Sport 2/2/1 |
| Kaufleute EFZ mit BM1 Wirtschaft | 18 | 18 | 18 | Deutsch, Französisch, Englisch, Mathematik, Finanz- und Rechnungswesen, Wirtschaft und Recht, Geschichte und Politik, Technik und Umwelt, Berufskenntnisse |
| E-Profil (auslaufend) | 18 | 18 | 9 | W&G 520 Jahreslektionen, zwei Fremdsprachen, IKA, V&V, ÜfK |
| B-Profil (auslaufend) | 18 | 18 | 9 | eine Fremdsprache, mehr IKA |
| Kaufleute EBA | 16 | 8 | – | HKB A–E, Sport |
| Detailhandelsfachleute EFZ | 13 | 18 | 9 | Berufskenntnisse HKB A–D, Vertiefung E/F im 3. LJ, Fremdsprache, Allgemeinbildung, Sport |
| Detailhandelsassistent/in EBA | 9 | 9 | – | Berufskenntnisse, Allgemeinbildung, Sport |

Sport: bei einem Schultag 1 Lektion, bei mehreren 2 Lektionen pro Woche (Sportförderungsverordnung).
Lektionen dauern in praktisch allen Kantonen 45 Minuten.

## 3. Stundenraster

Luzerner Berufsfachschulen unterrichten etwa 07:30 bis 11:45 und 13:00 bis 16:15. Daraus
abgeleitetes Standardraster der App (9 Lektionen, Pause nach der 2., Mittag nach der 5.):

07:30–08:15 · 08:20–09:05 · 09:20–10:05 · 10:10–10:55 · 11:00–11:45 · Mittag · 13:00–13:45 ·
13:50–14:35 · 14:40–15:25 · 15:30–16:15

Die effektiven Unterrichtszeiten der KV Luzern ab Schuljahr 2023/24 konnten nicht gelesen werden;
das Raster ist in den Einstellungen frei änderbar (Anzahl Lektionen, Zeiten, Mittag).

## 4. Randbedingungen der Stundenplanung

Die Praxis (Untis, FET, XHSTT-Standard) trennt harte Regeln (Plan sonst ungültig) von weichen
Kriterien (gewichtete Strafpunkte). So ist es auch im Generator umgesetzt.

**Hart (nie verletzt):** Lehrperson, Klasse und Raum je höchstens einmal pro Lektion ·
Lektionentafel vollständig · Verfügbarkeit der Lehrperson (Tage und Zeitfenster) · Schultage der
Klasse und Raster · Raumtyp und Kapazität · wöchentliche Raumsperren (z. B. Aula am Freitagnachmittag) ·
Doppellektionen zusammenhängend und nicht über den Mittag · fixierte Lektionen bleiben.

**Weich (Gewichte in der App einstellbar):** Freistunden der Klasse (sehr hoch) · Freistunden der
Lehrperson (mittel) · Fach nicht mehrmals am selben Tag · Schultage gleichmässig füllen · letzte
Lektion meiden · Stammzimmer und wenig Raumwechsel · Wunschtage der Lehrpersonen · keine
einzelne Lektion pro Tag für eine Lehrperson · Sport nicht direkt nach dem Mittag.

Marktlücke laut Nutzerkritik an bestehender Software: erklären, **warum** eine Lektion nicht
platziert werden konnte (Machbarkeitsanalyse vor dem Lauf, Gründe pro unplatzierter Lektion),
klare Trennung hart/weich mit Live-Bewertung, Fixieren einzelner Lektionen, Varianten vergleichen,
einfache Oberfläche mit Dark Mode.

## 5. Software-Markt Schweiz

Untis/WebUntis (rund 650 bis 700 Schulen) ist Marktführer; daneben aSc Timetables/EduPage, FET
(Open Source), EduTab, Scolaris, Escola, schulNetz (Schulverwaltung, rund 140 Schulen). Kritik an
Untis: komplexe Bedienung, Lizenzkosten ohne Listenpreise, Schulungsbedarf, Automatik liefert
Verletzungen und unverplante Stunden, kein Dunkelmodus. Preisanker für ein Pro-Paket:
CHF 500 pro Monat und Schule liegt unter typischen Untis-Gesamtkosten grosser Schulen und enthält
alle Lehrpersonen.

## 6. Arbeitszeit und Pensen

Jahresarbeitszeit der Lehrpersonen in den meisten Kantonen 1880 bis 1950 Stunden (Luzern
Volksschule 1908 Stunden, davon 87.5 % Unterrichtsbereich). Unterrichtsverpflichtung Sekundarstufe II
22 bis 26 Lektionen pro Woche bei 100 %; das Luzerner Pflichtpensum an Berufsfachschulen konnte nicht
verifiziert werden (App-Standard 25, einstellbar). Der Berufsauftrag umfasst Unterricht inklusive
Vor-/Nachbereitung (etwa 85 bis 88 %), Schule/Mitarbeit, Lernende/Beratung und Weiterbildung.
Faustregel: rund 1.8 Stunden Arbeitszeit pro gehaltene Lektion. Die App rechnet pro Lektion 45 Minuten
Unterricht plus 45 Minuten pauschale Vor-/Nachbereitung und ergänzt manuell erfasste Zeiten
(Sitzungen, Beratung, Weiterbildung). LCH-Arbeitszeiterhebung 2019: 9 bis 16 % unbezahlte Überzeit.

## 7. Datenschutz

- Revidiertes DSG des Bundes seit 1.9.2023; öffentliche Schulen unterstehen kantonalem Recht, in
  Luzern dem KDSG (SRL 38, seit 1.9.2021). Die privat getragene KV Luzern Berufsfachschule erfüllt
  eine öffentliche Aufgabe; die App ist so gebaut, dass beide Regime eingehalten werden können.
- **Emoji statt Name ist Pseudonymisierung, keine Anonymisierung.** Solange die Schulleitung die
  Zuordnung kennt, bleiben es Personendaten (relativer Ansatz, BGE 136 II 508). Trotzdem ist es eine
  wirksame Datenminimierung (Privacy by Design, Art. 7 DSG): Die App speichert nie Namen, keine
  Zuordnungstabelle und keine Kontaktdaten.
- Weitere Massnahmen in der App: keine Server, keine Tracker, keine Drittanbieter-Skripte; Daten
  liegen im localStorage des Geräts (Hinweis auf Gerätesicherheit und geteilte PCs); Exporte sind
  Kopien von Personendaten und liegen in der Verantwortung der Schule; persönliche Stundenpläne von
  Lehrpersonen werden nicht öffentlich publiziert.
- Chat, Arbeitszeiterfassung und Kalender erhöhen das Risiko (Persönlichkeitsprofil,
  Verhaltensüberwachung, Art. 26 ArGV 3): Zweckbindung, Rollen, Aufbewahrungsfristen. Bei einem
  späteren Hosting: Standort Schweiz, TLS, Auftragsbearbeitungsvertrag, privatim-Merkblatt Cloud
  im Schulbereich, Bearbeitungsverzeichnis und Datenschutz-Folgenabschätzung.

## 8. Algorithmus des Generators

Drei Ansätze wurden gegeneinander abgewogen (konstruktiv-heuristisch mit Verdrängung und lokaler
Suche; exakte Constraint-Programmierung mit Backtracking; evolutionär/memetisch). Umgesetzt ist
der erste, weil er in reinem JavaScript in Sekunden läuft, mit realen Daten robust ist und jede
nicht platzierbare Lektion begründen kann:

1. **Vorbereitung:** Lehrpersonen ohne explizite Zuweisung werden automatisch zugeteilt
   (qualifiziert, an den Schultagen verfügbar, geringste Last). Jede Klasse-Fach-Kombination wird
   in Einheiten (Einzel- oder Doppellektion) zerlegt; für jede Einheit werden alle zulässigen
   Positionen (Tag, Startlektion) vorberechnet.
2. **Konstruktion:** Einheiten mit den wenigsten Positionen zuerst; jede wird an die Position mit dem
   kleinsten Kostenzuwachs gesetzt. Passt nichts, verdrängt sie die Einheit mit den wenigsten
   Konflikten (Ejection Chain mit Tabu-Liste), die neu eingereiht wird.
3. **Lokale Suche:** Simulated Annealing mit vier Zügen – zufälliges Verschieben, Tausch innerhalb
   der Klasse, gezieltes Füllen einer Klassen-Freistunde, gezieltes Füllen einer
   Lehrpersonen-Freistunde. Beste Lösung wird gemerkt, Zeitbudget nach gewählter Qualität.
4. **Raum-Nachoptimierung:** Stammzimmer und Raumkontinuität pro Tag.
5. **Ergebnis:** Lektionen, unplatzierte Einheiten mit Grund, Score und Aufschlüsselung, Statistik.

Die Machbarkeitsanalyse prüft vor dem Lauf nicht nur Summen, sondern Kapazitäten pro Tag: für jede
Teilmenge der Unterrichtstage müssen die Lektionen der Klassen, die nur innerhalb dieser Tage Schule
haben, in die Verfügbarkeit der Lehrperson bzw. die Plätze des Raumtyps passen (Hall-Bedingung);
Doppellektionen zählen nur zusammenhängende, nicht über den Mittag reichende Paare. Automatische
Zuweisungen werden dabei wie im Generator berücksichtigt.

Der Generator wurde in einer Gegentest-Runde mit fünf unabhängigen Blickwinkeln (harte Regeln,
fixierte Lektionen, Zuweisung und Machbarkeit, Qualität und Determinismus, kaputte Daten) angegriffen;
alle bestätigten Befunde – etwa ungeprüft übernommene fixierte Lektionen, ignorierte Raumsperren bei
der Verdrängung oder zu lasche Kapazitätsprüfungen – sind behoben und durch Tests abgedeckt.

Determinismus: gleicher Seed und gleiche Iterationszahl ergeben denselben Plan. Belegungen liegen in
typisierten Arrays; ein Lauf mit 19 Klassen dauert im Test rund 0.2 Sekunden für 60 000 Iterationen,
38 Klassen ebenso schnell. Ein unabhängiger Prüfer (`SW.solver.validate`) kontrolliert jeden Plan
gegen alle harten Regeln; `tests/solver.test.js` deckt Vollständigkeit, Regeln, Determinismus,
fixierte Lektionen, unmögliche Verfügbarkeit, leeren Zustand und einen Stresstest ab.

## Quellen (Auswahl)

kvlu.ch (Berufsfachschule, Bildungsangebot, News «Schultage 3. Lehrjahr», Jahresbericht 2023/24) ·
Nationaler Lehrplan Kaufleute EFZ 2023 (KV Zürich, BZZ) · HKV Aarau Merkblatt KV EFZ · IGKG Kaufleute EBA ·
Bildungsplan Kauffrau/Kaufmann EFZ 2012 · Zentrum Bildung Broschüre Detailhandel 2022 · BASPO
Arbeitspapier Sport in der Schule · EDK Kantonsumfrage (Unterrichtsdauer, Sportunterricht,
Unterrichtsverpflichtung) · SBFI Rahmenlehrplan Berufsmaturität · untis.at, help.untis.at,
forum.untis.at · FET-Handbuch · XHSTT/ITC 2011 · centerboard.ch · LCH Arbeitszeiterhebung 2019 ·
lustat.ch Bildungsbericht 2024 · datenschutz.lu.ch (KDSG) · edoeb.admin.ch (DSG) · privatim.ch ·
educa.ch Dossier Datenschutzkonforme Schule · BGE 136 II 508.
