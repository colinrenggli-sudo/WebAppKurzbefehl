# Vollstaendigkeits- und Belegpruefung der Recherchesammlung

**Prueferrolle:** Vollstaendigkeits-Kritiker · **Stand: 17.08.2026** · Geprueft: `01` bis `11` in diesem Verzeichnis

---

## 0. Methodenwarnung zu DIESER Pruefung — bitte zuerst lesen

**Die verlangte stichprobenartige Verifikation per WebSearch konnte nicht durchgefuehrt werden.**
Das Suchkontingent der Session war beim Start dieser Pruefung bereits erschoepft (200 von 200
WebSearch-Aufrufen, verbraucht durch die Recherchen 01–11). Anschliessend wurde **jeder**
Direktabruf vom Egress-Proxy mit `EGRESS_BLOCKED` abgewiesen — getestet und abgelehnt:
`pubmed.ncbi.nlm.nih.gov`, `arxiv.org`, `www.nber.org`, `www.fedlex.admin.ch`, `www.zefix.ch`.

**Konsequenz, streng eingehalten:** Es wurde keine externe Quelle neu geprueft. Was folgt, stuetzt
sich auf drei Methoden, die ohne Netz funktionieren:

| Methode | Was sie leistet |
|---|---|
| **Querlesen** | Widersprueche zwischen den elf Dateien, die den Autorinnen einzeln nicht auffallen konnten |
| **Rechnen** | Arithmetische Plausibilitaet innerhalb einer Tabelle oder Zeile |
| **Quelle-gegen-Behauptung** | Passt die zitierte Quelle ueberhaupt zur Aussage, die sie tragen soll? |
| **Normwissen** | Bekannte Rechtslage gegen die im Dokument behauptete Rechtslage (Stand Modellwissen Mai 2026) |

**Was das heisst:** Abschnitt 1 findet Fehler, die *ohne* Netz belegbar sind. Er kann **nicht**
ausschliessen, dass zusaetzlich Zahlen falsch aus dem Suchindex uebernommen wurden. Die in
`01`–`11` jeweils selbst formulierten Verifikationsauftraege bleiben alle bestehen.

**Lobende Vorbemerkung, weil sie fuer die Risikobewertung zaehlt:** Die Sammlung ist ungewoehnlich
diszipliniert. Fast jede Datei markiert eigene Schwaechen ([B]/[S]/[NB]) und listet aktiv, was
*nicht* verwendet werden darf. Die gefaehrlichsten Stellen sind deshalb **nicht** die offen
deklarierten Schaetzungen — sondern die wenigen Stellen, an denen eine Schaetzung im Verlauf der
Weiterverwendung zwischen den Dateien zu einer belegten Zahl mutiert ist. Genau die stehen unten.

---

## 1. Nicht sauber belegte oder erfunden wirkende Zahlen und Behauptungen

Sortiert nach Schadenspotenzial im Meeting, nicht nach Datei.

### 1.1 KRITISCH — Rechtslage, die mit hoher Wahrscheinlichkeit falsch datiert ist

**Datei `05-bau-ki-usecases.md`, C17:**
> «*Rechtslage geaendert per 1. Januar 2026* – die Eintragungsfrist wurde von drei auf **vier Monate**
> verlaengert (Art. 839 ZGB); zudem muss eine Ersatzsicherheit neu auch Verzugszinsen fuer **zehn
> Jahre** decken.»

**Befund:** Beide Neuerungen sind nach meinem Normwissen **nicht von 2026**. Die Verlaengerung der
Eintragungsfrist beim Bauhandwerkerpfandrecht von drei auf vier Monate stammt aus der
ZGB-Revision, die **am 1. Januar 2012** in Kraft trat. Die Anforderung, dass eine hinreichende
Ersatzsicherheit auch Verzugszinsen fuer rund zehn Jahre abdecken muss, ist **Rechtsprechung**
(bundesgerichtliche Praxis, ca. 2016), nicht eine Gesetzesaenderung 2026.

**Gegenbeleg aus der eigenen Sammlung:** `04-bau-schweiz-markt.md` nennt in Abschnitt 6 dieselben
vier Monate als **geltendes Recht ohne jeden Hinweis auf eine Neuerung** und stuetzt sich dabei auf
Behoerdenquellen (Gerichte ZH, Notariate ZH) — waehrend `05` sich fuer die «Aenderung 2026» auf
**eine einzelne Anwaltskanzlei-Seite** stuetzt ([10], tbp-law.ch), deren Inhalt nicht im Volltext
geprueft wurde. Die wahrscheinlichste Erklaerung ist eine Fehlinterpretation eines Kanzlei-Beitrags.

**Warum das kritisch ist:** C17 ist in `05` als «**staerkster Einzelfall im Katalog**» ausgewiesen
und traegt dort den Pitch. Wird im Meeting «neu seit 1.1.2026» gesagt und der Onkel oder sein
Bauanwalt weiss, dass die Frist seit 2012 vier Monate betraegt, ist die Glaubwuerdigkeit des
gesamten Rechtsteils weg. **Vor dem Meeting am ZGB-Volltext klaeren. Bis dahin: Frist von vier
Monaten nennen, den Zusatz «neu seit 2026» ersatzlos streichen.** Der Verkaufswert bleibt
identisch — die Frist ist auch ohne Neuigkeitswert unerbittlich und nicht erstreckbar.

### 1.2 KRITISCH — logisch unmoegliche Zahl

**Datei `03-arztpraxen-ki-usecases.md`, Abschnitt 1, Punkt 3:**
> «Parallel fehlen MPA: **150-200 offene Stellen schweizweit, ueber 250 allein im Kanton Zuerich.**
> `[B (verbandsnah), Q8]`»

**Befund:** Die beiden Zahlen schliessen einander aus — ein Kanton kann nicht mehr offene Stellen
haben als die ganze Schweiz. Mindestens eine der beiden ist falsch abgeschrieben, oder sie messen
Verschiedenes (z. B. ausgeschriebene Stellen auf einem Portal vs. geschaetzte Luecke) ohne dass das
dabeisteht. Die Angabe traegt das Label `[B]`, obwohl die Quelle ein verbandsnaher Blog ist
(`mpaportal.ch`). **Aus dem Deck streichen.** Ersatz vorhanden und belastbarer:
`02-arztpraxen-schweiz-markt.md` nennt die INFRAS-Analyse im Auftrag des Kantons Zuerich mit
**rund 12 fehlenden MPA pro 100 Aerztinnen und Aerzten** — Forschungsbuero, Kantonsauftrag, klare
Bezugsgroesse.

### 1.3 KRITISCH — Zahl, die zwischen zwei Dateien die Bedeutung wechselt

**`02-arztpraxen-schweiz-markt.md`, 3.4:**
> «Krankenversicherer weisen rund **10 % der eingereichten Rechnungen zurueck**»

**`03-arztpraxen-ki-usecases.md`, Use Case 17:**
> «santesuisse gibt an, rund **10% der Leistungen seien nicht korrekt**»

**`03`, Abschnitt 5 («Was ausdruecklich nicht belegbar ist»):**
> «**Rueckweisungsquoten von Schweizer Krankenversicherern in Prozent**» — nicht belegbar

**Befund:** Dreifaches Problem. (a) «10 % der Rechnungen werden zurueckgewiesen» und «10 % der
Leistungen sind nicht korrekt» sind **inhaltlich verschiedene Aussagen** — die erste ist eine
Prozessquote, die zweite eine Fehlerquote. (b) Dieselbe Sammlung erklaert die Zahl an einer Stelle
fuer belegt und an anderer Stelle ausdruecklich fuer nicht belegbar. (c) `02` fuehrt die
Rueckweisungsquote im **Fazit unter den «drei staerksten, sauber belegten Angriffspunkten»** —
und `11-firmen-kontext.md` uebernimmt sie erneut als «10 % Rechnungsrueckweisungen [9]».

**Zusaetzlich:** Auf dieser Zahl baut `02` in 3.4 eine Modellrechnung auf (500 Rechnungen/Monat,
15 Minuten pro Retoure, 12,5 Stunden/Monat). Der 15-Minuten-Wert ist ausdruecklich `[S]` — die
Rechnung ist also eine Schaetzung auf einer strittigen Basis. **Empfehlung: Die 10 % nur mit dem
santesuisse-Wortlaut und dem Label «Verbandsangabe der Versicherer» verwenden, nie als
Prozesskennzahl der Praxis, und die Modellrechnung nur mit Zahlen von Jana Rohrer selbst rechnen.**

### 1.4 HOCH — die 26 bzw. 30 Aufwandsangaben in CHF

**`03`, alle Use-Case-Tabellen** (z. B. «8-20k CHF Setup + 300-900 CHF/Monat», «30-80k CHF»),
**`05`** (S/M/L-Aufwaende), **`06`, Abschnitt 7** («CHF 8'000 – 20'000 einmalig»).

**Befund:** Alle diese Zahlen sind in der Legende korrekt als `[S]` = «eigene Schaetzung von Colin
Renggli, keine Quelle» deklariert. **Das Problem entsteht erst im Deck.** In einer Tabelle neben
belegten Spalten («Anbieter heute», «Nutzen mit Quelle») gelesen, wirken sie wie Marktdaten. Der
Leistungskatalog mit 25+ Angeboten wird sie fast zwangslaeufig als Preisliste uebernehmen.

**Konkreter Widerspruch zur Preisrecherche:** `09-agentur-angebot-preise.md` haelt in 1.1
ausdruecklich fest, dass marktuebliche Saetze fuer Schweizer Software- und KI-Arbeit **`[NB]`,
nicht belegbar** sind — und begruendet das genau richtig: «*ein Patron, der seit Jahrzehnten
Regieansaetze kalkuliert, erkennt eine gegriffene Zahl sofort*». Die Aufwandsspalten in `03` und
`05` sind aber genau solche gegriffenen Zahlen. **Entweder beide Dateien richten sich nach `09`
(keine Zahl ohne offengelegte Rechnung), oder `09`s Warnung ist wirkungslos.**

**Empfehlung:** Im Leistungskatalog keine CHF-Betraege pro Angebot zeigen, sondern **Aufwandsklassen**
(S / M / L mit Wochenangabe, wie `05` es macht) plus **einen** offengelegten Stundenansatz nach der
Kalkulationslogik aus `09`. Das ist verkaufsstark und nicht angreifbar.

### 1.5 HOCH — Kennzahl grösser als die Grundgesamtheit

**`01-kmu-ki-schweiz.md`, Abschnitt 1:**
- «Ueber **612'000 KMU**, rund 99,7 % aller Unternehmen» [6]
- Abschnitt 4, KMU Digital Pulse 2025: «Datenbasis **948'816 KMU**, Stichprobe 47'079» [17]

**Befund:** Dieselbe Datei nennt zwei KMU-Grundgesamtheiten, die um mehr als **50 %** auseinander
liegen. Wahrscheinlich zaehlt localsearch alle Eintraege seines Verzeichnisses (inkl. Kleinstfirmen,
Vereinen, Doubletten) und das BFS die marktwirtschaftlichen Unternehmen. Es steht nirgends dabei.
**Fuer das Deck: nur eine der beiden Zahlen verwenden, und wenn die localsearch-Studie zitiert wird,
die Datenbasis weglassen** — sie ist der Punkt, an dem eine kritische Zuhoererin einhakt.

### 1.6 HOCH — Quelle traegt die Behauptung nicht

**`02`, Abschnitt 7:**
> «Anzahl Konsultationen pro Arzt: jaehrlich knapp 1'000 – dritttiefster Wert unter den untersuchten
> OECD-Staaten. [62] `[S]`»

**Quelle [62]:** Obsan-Indikator «**Konsultationen in Hausarzt- oder Allgemeinarztpraxen**»,
Datenbasis **Schweizerische Gesundheitsbefragung**.

**Befund:** Die Schweizerische Gesundheitsbefragung befragt **Personen**, nicht Praxen. Sie liefert
Konsultationen **pro Einwohnerin** (Groessenordnung: wenige pro Jahr), nicht Konsultationen **pro
Arzt**. Die Behauptung ist mit dieser Quelle nicht belegbar — die Zahl mag aus einer OECD-Statistik
stammen, aber dann ist die Quellenangabe falsch. Die Datei hat den Wert immerhin selbst als `[S]`
markiert und «Bezugsjahr unklar» notiert. **Ohne korrekte Primaerquelle nicht verwenden.**

### 1.7 MITTEL — arithmetisch nicht schluessige Marktzahlen

**`04-bau-schweiz-markt.md`, Abschnitt 1, Tabelle:**

| Behauptung | Rechnerischer Befund |
|---|---|
| «Umsatz > **65 Mrd. CHF**/Jahr, **12 % des BIP**» [2] | Bei einem Schweizer BIP von rund 800 Mrd. CHF sind 65 Mrd. **rund 8 %**, nicht 12 %. Die 12 % duerften eine weiter gefasste Wertschoepfungskette meinen (inkl. Immobilien). **Beide Zahlen nebeneinander sind angreifbar — eine waehlen.** |
| «Bauausgaben **67 Mrd.** (2023); Wohnbau **52 %** der Bauinvestitionen = **30,6 Mrd.**» [2] | 52 % von 67 Mrd. sind **34,8 Mrd.**, nicht 30,6 Mrd. 30,6 Mrd. entsprechen 52 % von 58,8 Mrd. Es werden zwei verschiedene Bezugsgroessen («Bauausgaben» vs. «Bauinvestitionen») in einer Zeile vermischt. |

Die Datei warnt an derselben Stelle bereits vorbildlich vor der widerspruechlichen SBV-Firmenzahl
(50'000 Betriebe bei 90'000 Beschaeftigten = 1,8 pro Betrieb). **Diese zwei zusaetzlichen
Inkonsistenzen sind bisher nicht markiert.**

### 1.8 MITTEL — Konkurszahlen, die einander widersprechen

**`04`, Abschnitt 7:** «Ueber elf Monate 2025: 11'057 Eroeffnungen, **+36,4 %**» — waehrend der
Titel der eigenen Quelle [30] lautet: «Firmenkonkurse Schweiz **19,5 Prozent** mehr im Jahr 2025».
Dazu «Q1 2026: 3'902 Firmen, **+79,6 %**» und im selben Absatz «Im 1. Halbjahr 2026 sank die Zahl im
Baugewerbe wieder um **12,5 %**». Die Datei nennt den Confounder (Gesetzesaenderung zur
Konkursbetreibung fuer oeffentlich-rechtliche Forderungen) korrekt — **aber vier Wachstumsraten mit
drei Vorzeichen in einem Absatz sind auf einer Folie nicht erklaerbar. Fuer das Deck genuegt eine
Aussage: «Baugewerbe stellt die meisten Konkurse (1'192 in 9 Monaten 2025) — der Anstieg ist
teilweise gesetzlich bedingt.»**

### 1.9 MITTEL — «belegte operative Folge», die eine Schlussfolgerung ist

**`04`, Abschnitt 4:** Zuerst korrekt: «**Nicht belegbar:** Exakte prozentuale Aufteilung nach
Albanisch, Serbisch/Kroatisch … Die SBV-Erhebung publiziert **Nationalitaeten, keine Sprachanteile**.»
Zwei Absaetze spaeter: «**BELEGTE OPERATIVE FOLGE:** Wenn **ein Drittel des Personals Portugiesisch
spricht** …»

**Befund:** Der Schluss von Nationalitaet auf Sprache ist plausibel, aber er ist genau das, was die
Datei drei Zeilen vorher fuer nicht belegbar erklaert. `05` uebernimmt ihn («*wenn ein Drittel der
Belegschaft Portugiesisch spricht*») und raeumt erst in Abschnitt 6 ein, dass Sprachanteile nicht
belegbar sind. **Sauber formuliert und genauso verkaufsstark: «31 % des Baustellenpersonals hat
einen portugiesischen Pass, ueber 80 % der tiefen Lohnklassen sind auslaendisch — ein
deutschsprachiger Papierrapport erreicht diese Belegschaft strukturell nicht.»** Das ist belegt.

### 1.10 MITTEL — Praezision, die die Quelle nicht hergibt

| Datei | Stelle | Problem |
|---|---|---|
| `03` | «Zustimmung zu Ambient Scribes faellt von **74,8%** auf **55,3%**» | Zwei Nachkommastellen aus einem Sekundaerbericht, dessen Primaerquelle laut eigener Angabe **nicht geprueft** wurde `[V, Q65]`. Entweder Primaerstudie nachziehen oder ohne Zahlen als Mechanik erzaehlen. |
| `03` | «EQUAM: **CHF 6'850** fuer eine Praxis mit zwei Aerztinnen (180%)» | Punktgenauer Preis aus einem Anbieter-Blog (medmonitor). Als «Groessenordnung rund 7'000 CHF» fuehren. |
| `03` | Dragon Medical One: «**>99 % Erkennungsrate**» | Reseller-Angabe. Eine Erkennungsrate ohne Messprotokoll ist Marketing. |
| `04` | «Zahlungsverzug Schweiz 2025: rund **32 Tage**» | Quelle ist ein Blog (`pfeffersack.ch`). Die Datei warnt korrekt vor der «40 Tage»-Angabe der NZZ, uebernimmt aber die 32 Tage ungeprueft. |
| `04` | Suva: «**348 schwere Unfaelle pro 100'000** Vollbeschaeftigten, Negativrekord (+17 % ggue. 2015)» | Ueber ein Gewerkschaftsmedium (`workzeitung.ch`) referiert. Die uebrigen Suva-Zahlen derselben Zeile stammen aus der UVG-Sammelstatistik (Primaerquelle) — diese eine nicht. |
| `01` | «digitalswitzerland: nur **47 %** der KMU haben eine Digitalisierungsstrategie» | Sekundaerquelle ist **`ai-automation-hub.ch`** — die Website eines direkten Wettbewerbers von Colin. Eine Statistik ueber die SEO-Seite eines Konkurrenten zu zitieren ist die schwaechste Belegkette der ganzen Sammlung. Die Datei stuft sie selbst als «niedrig-mittel» ein. **Streichen oder Primaerstudie beschaffen.** |

### 1.11 MITTEL — Datumsangaben jenseits jeder Pruefbarkeit

**`03`, Abschnitt 4, und `07`, Abschnitt 7 (identisch):**
> «Digital Omnibus (Kommissionsvorschlag November 2025, **in Kraft 27.7.2026**) verschiebt die
> Hochrisiko-Pflichten: Annex-III-Systeme auf den **2.12.2027**, Annex I auf den **2.8.2028**;
> Einigung Rat/Parlament am **7.5.2026**.»

**Befund:** Fuenf taggenaue Daten zu einem EU-Rechtsakt, der zum Zeitpunkt meines Normwissens
(Mai 2026) noch im Gesetzgebungsverfahren stand. Die Angaben sind **nicht per se falsch**, aber sie
sind der Typ Detail, den ein Suchindex-Extrakt leicht verzerrt, und sie stammen aus einer
Anwaltskanzlei- und einer Pruefdienstleisterseite, nicht aus dem Amtsblatt. **Fuer den Pitch
irrelevant und riskant: Die Schweiz ist nicht gebunden. Ein Satz genuegt: «Die EU-Fristen fuer
Hochrisiko-KI wurden 2026 nach hinten verschoben; fuer euch ist relevant, dass die Schweiz bis Ende
2026 eine Vernehmlassungsvorlage vorlegt.»** Der zweite Halbsatz ist amtlich belegt (Bundesrat,
12.02.2025).

### 1.12 NIEDRIG, aber im Deck sichtbar — Anbieterzahlen ohne unabhaengige Pruefung

Durchgehend korrekt als `[V]` markiert, hier nur zur Vollstaendigkeit, weil sie im Leistungskatalog
gerne zu «Marktfakten» werden: vitomed ca. 5'000 Aerzte · HIN ca. 14'500 Abonnenten · PlanRadar
>170'000 Nutzer in >75 Laendern · OneDoc (siehe 2.2) · Aerztekasse «Marktfuehrerin»
(Selbstzuschreibung) · Swiss Medical Network (Zahlen je Unterseite abweichend) · «bis zu 30 %
weniger Verzoegerungen» bei Buildots · «bis zu 90 % Zeitersparnis» bei Dienstplanung. **Regel fuers
Deck: Anbieterzahlen nur mit sichtbarem Zusatz «Anbieterangabe».**

### 1.13 Was ich ausdruecklich NICHT als erfunden einstufe

Damit die Kritik nicht ueberzogen wirkt, drei Faelle, die auf den ersten Blick verdaechtig aussehen
und bei Pruefung sauber sind:

- **Vollkosten CHF 51–54/Stunde** (`01`, Abschnitt 2): Nachgerechnet. 7'024 × 12 × 1,18 = 99'460;
  99'460 ÷ 1'850 = **53,8**. Baugewerbe: 6'616 × 12 × 1,18 = 93'682; ÷ 1'850 = **50,6**. Die
  Rechnung stimmt, die Annahmen sind offengelegt, die Eingangswerte sind amtlich. **Bester Beleg
  der Sammlung.**
- **Margenhebel** (`04`, Abschnitt 2): 1 % von 20 Mio. = 200'000; 3 % Marge = 600'000; 600'000 +
  200'000 = 800'000 = **+33 %**. Korrekt gerechnet und als Schaetzung deklariert.
- **CHF 452'000 Umsatz pro Rekrutierung** (`08`, Abschnitt 3): 13'570 ÷ 0,03 = **452'333**. Korrekt.
  Einschraenkung: Es ist eine rhetorische Umrechnung, keine Betriebswirtschaft — sagen als «*das
  entspricht dem Umsatz, den ihr fuer diesen einen Betrag erwirtschaften muesst*», nicht als
  «*kostet euch 452'000*».

---

## 2. Widersprueche zwischen den Dokumenten

### 2.1 Die 114 Minuten — Spitalzahl, die in den Praxisteil gewandert ist

| Datei | Aussage |
|---|---|
| `02`, 3.1 | «Zum **Vergleich Spital**: **Akutsomatik 114 Min./Tag Dokumentation**, Assistenzaerzt:innen 183 Min./Tag, Psychiatrie 121 Min./Tag» |
| `03`, Abschnitt 1 | «In der gfs.bern-Befragung … geben **Aerztinnen und Aerzte 114 Minuten pro Tag fuer Arbeiten am Patientendossier** an; **praxisambulant** kommen 54 Minuten pro Tag … dazu» |

**Befund:** In `02` sind die 114 Minuten ausdruecklich der **Spital-Vergleichswert** (Akutsomatik).
In `03` erscheinen sie als allgemeine Aerztezahl, zu der die praxisambulanten 54 Minuten noch
**hinzukommen** — was rechnerisch fast 3 Stunden Administration pro Praxisarzt und Tag ergibt.
**Das ist die gefaehrlichste Verwechslung im Arztpraxen-Deck**, weil sie den Kernnutzen um Faktor
drei aufblaeht und Jana Rohrer als Praxis-COO sofort auffaellt. `02` ordnet sauber ein, `03` nicht.
**Massgeblich ist `02`. Fuer das Deck gilt: rund eine Stunde sonstige Administration pro
praxisambulantem Arzt und Tag — mehr nicht.**

### 2.2 OneDoc — zwei Zahlensets in derselben Woche

| Datei | Registrierte Patient:innen | Fachpersonen / Partner | Termine |
|---|---|---|---|
| `02`, Abschnitt 4 | **ueber 3 Mio.** | ueber **13'000** Partner | 1,8 Mio. (2020/21, historisch) |
| `03`, Abschnitt 2 | **2,6 Mio.** | **>10'500** Fachpersonen | >20 Mio. gebucht |

**Befund:** Beides Anbieterangaben, beide am 17.08.2026 abgerufen, aus verschiedenen Unterseiten.
**Keine der beiden Zahlen ins Deck.** Wenn OneDoc erwaehnt wird: «die groesste Schweizer
Terminplattform, Millionen registrierter Patientinnen» — ohne Punktwert.

### 2.3 DRE-i: 4,0 oder 4,3?

| Datei | Aussage |
|---|---|
| `04`, Abschnitt 5 | Gesamtindex **DRE-i 4,3** (2025: 4,0); **Bauwirtschaft separat 4,0** — Schlusslicht |
| `08`, Abschnitt 5 | «Die Bau- und Immobilienwirtschaft ist beim Digitalisierungsindex **DRE-i mit 4,0 von 10 Punkten das Schlusslicht**» |
| `11`, 4.1 | Nennt 4,3 (2026) vs. 4,0 (2025) und markiert den Widerspruch selbst |

**Aufloesung ohne Netz moeglich:** `04` ist die einzige der drei Dateien, die die Studie im Detail
referiert, und ihre Darstellung ist **in sich schluessig** — Gesamtindex 4,3, Teilbranche Bau 4,0,
Vorjahresgesamtwert 4,0. `08` hat den Teilbranchenwert mit dem Gesamtindex verwechselt.
**Massgeblich ist `04`.** Fuer das Deck: «Gesamtindex 4,3 von 10 — die Bauwirtschaft allein 4,0 und
damit Schlusslicht.» Damit ist der Widerspruch aus `11`, Punkt 5.3, erledigt.

### 2.4 Baubewilligungsdauer: 140 Tage oder 200 Tage?

| Datei | Aussage |
|---|---|
| `01`, Abschnitt 3 | sgv-KMU-Monitor 11/2025: Baubewilligung fuer ein Wohnhaus dauert im Schnitt rund **200 Tage** |
| `04`, Abschnitt 6 | ZKB-Studie 2023: Bearbeitungsdauer stieg in zehn Jahren von **84 auf 140 Tage** |

**Befund:** Nirgends markiert. Wahrscheinlich unterschiedliche Definitionen (Gesamtverfahren inkl.
Vorabklaerung vs. behoerdliche Bearbeitungszeit) und unterschiedliche Erhebungsjahre — aber
nebeneinander auf einer Folie ist das ein Eigentor. **Eine Zahl waehlen, Definition dazuschreiben.**

### 2.5 Fachkraeftemangel: Notstand oder Entspannung?

| Datei | Aussage |
|---|---|
| `01`, Abschnitt 5 | «Fachkraeftemangel in **32 von 55 Berufsgruppen**» (Adecco/UZH); Gesundheitsberufe **+17 %** ausgeschriebene Stellen |
| `04`/`08` | Fachkraeftemangel-Index 2025 rund **22 % unter Vorjahr**; offene Stellen **–8 %**, RAV-Stellensuchende **+17 %** |

**Befund:** Beide stuetzen sich auf dieselbe Datenquelle (Adecco/Stellenmarkt-Monitor UZH) und
zeigen in entgegengesetzte Richtungen — verschiedene Indikatoren, verschiedene Zeitschnitte.
`08` behandelt das vorbildlich («*Wer 2026 mit akutem Notstand argumentiert, wird von einem
informierten Bauunternehmer widerlegt*»), `01` nicht. **Die Formulierung aus `08` ist die
richtige und gehoert in beide Decks: der kurzfristige Druck hat nachgelassen, der demografische
bleibt.**

### 2.6 Rueckweisungsquote — belegt oder nicht belegbar?

Siehe 1.3. `02` fuehrt sie im Fazit als belegten Kernpunkt, `03` listet sie explizit unter «nicht
belegbar», `11` uebernimmt sie als belegt. Drei Dateien, drei Bewertungen derselben Zahl.

### 2.7 LMV-Arbeitszeitbandbreiten

| Datei | Aussage |
|---|---|
| `04`, Abschnitt 6 | Neue Bandbreite **–20 Minusstunden / +120 Ueberstunden** |
| `05`, D19 | SORBA-Zusammenfassung: Aufbau **bis 200** bzw. bei finanzieller Absicherung **bis 700** Stunden |

`05` markiert den Widerspruch selbst und verlangt Verifikation am LMV-Volltext. **Bleibt offen —
und die Zahlen duerfen bis dahin in keinem Deck stehen.** Bestaetigt.

### 2.8 Lohn- und Stundenbasen, die nicht zusammenpassen

| Groesse | Datei / Wert | Konflikt |
|---|---|---|
| Jahresstunden | `01`: **1'850 produktive** Stunden · `06`/`09`: Divisor **2'112** (LMV-Jahresarbeitszeit) | Verschiedene Konzepte (produktiv vs. vertraglich). Wer beide Rechnungen im selben Deck zeigt, muss den Unterschied erklaeren — sonst wirkt eine der beiden manipuliert. |
| Monatsloehne pro Jahr | `01`: **12** Monatsloehne · `04`/`08`: 6'282 × 13 ≈ 82'000 (also **13**) | Die Vollkostenrechnung in `01` faellt um rund 8 % zu tief aus, wenn im Bau tatsaechlich 13 Loehne gelten. **Vor dem Deck entscheiden und einheitlich rechnen.** |
| Lohnklasse C | `06`: LMV-**Mindestlohn** 4'747–4'885 · `04`/`08`: **4'959** (SBV-Erhebung) | Mindestlohn vs. Effektivlohn. Kein Fehler, aber ohne Beschriftung ein Widerspruch auf der Folie. |
| Vollkosten/Stunde Bau | `01`: **≈ CHF 51** (BFS-Rechnung) · `06`, Abschnitt 7: **CHF 60** (Annahme) | `06` deklariert die 60 korrekt als zu ersetzende Annahme. Trotzdem: **die eigene belegte Zahl (51) nicht durch eine gegriffene (60) ersetzen.** |

### 2.9 Praxisstandorte: aktuelle Zahl oder Zahl von 2015?

`02`, 1.2 haelt fest: 14'217 Standorte sind **Referenzjahr 2015**, aktuellere gesamtschweizerische
Zahlen waren nicht abrufbar `[NB]`. `03`, Abschnitt 2 fuehrt in der Marktumfeld-Tabelle «**rund
14'200 Standorte** (BFS-Erhebung MAS, seit 2015 jaehrlich)» — die Klammer suggeriert Aktualitaet,
die Zahl ist elf Jahre alt. **Im Deck immer mit Jahreszahl: «14'200 Standorte, Stand 2015 — neuere
Gesamtschweizer Zahl liegt nicht vor».** Das ist sogar ein gutes Argument: selbst der Bund weiss
nicht genau, wie viele Praxen es gibt.

### 2.10 Sanacare

`02`: «**23** hausaerztliche Gruppenpraxen in 14 Staedten». `03`: «**>20** Gruppenpraxen in 14
Staedten, ca. 500 Fachpersonen; Santemed (Medbase-Mehrheit): 23 Praxen». Vermutlich eine
Verwechslung der 23 zwischen Sanacare und Santemed. Geringes Risiko, aber im Deck nur
Groessenordnung nennen.

---

## 3. Fehlende Themen — nach Deck sortiert

### 3.1 Deck A «Colins Geschichte und Referenzen» — die groesste Luecke der ganzen Sammlung

**Befund:** Es existiert **kein einziger recherchierter Fakt ueber Colin selbst.** `10` ist reines
Kommunikationshandwerk (und als solches gut), `11` stellt fest, dass beide dort untersuchten Firmen
**vollstaendig unverifiziert** sind. Ein Deck ueber Geschichte und Referenzen hat damit
derzeit **keine Substanz** — nur eine Anleitung, wie man ueber fehlende Substanz spricht.

Konkret fehlt:

| Fehlendes Thema | Warum es fuer Deck A zwingend ist |
|---|---|
| **Was die Demo tatsaechlich kann** | `10` erklaert korrekt, dass die Demo das staerkste Beweismittel ist und die Kuendigungsgeschichte irrelevant macht. Nirgends steht, **was sie macht**: Funktionsumfang, Stack, Datenmodell, Screenshots, wo sie laeuft. Ohne das kann Deck A den eigenen Kernrat nicht umsetzen. |
| **Rechtsform und Gruendung** | Einzelfirma vs. GmbH, Haftung, Kosten, Aussenwirkung beim Patron. Nirgends behandelt. |
| **Anerkennung der Selbstaendigkeit durch die Ausgleichskasse** | **Der praktisch gefaehrlichste blinde Fleck.** Wer als Einzelner mit wenigen Kunden startet — und die ersten beiden sind Onkel und Cousine — riskiert, von der Ausgleichskasse als **unselbstaendig** eingestuft zu werden. Folge: Nachforderung von Sozialversicherungsbeitraegen **beim Kunden**. Das trifft genau die zwei Personen im Raum. Muss vor dem ersten Auftrag geklaert sein. |
| **MWST-Pflicht** | Registrierungspflicht ab Jahresumsatz CHF 100'000. Beeinflusst jede Offerte (Preise mit/ohne MWST) und ist beim ersten Angebot relevant. |
| **Berufshaftpflicht** | In `09` in einem Halbsatz als `[A]` erwaehnt («vor dem ersten Auftrag abschliessen»), sonst nirgends. Deckungssummen, Kosten, ob KI-Fehler ueberhaupt gedeckt sind — nicht recherchiert. |
| **Pruefung der eigenen Arbeitsvertraege** | `10` setzt es auf die Checkliste (Konkurrenzverbot, Geheimhaltung), aber niemand hat es getan. Das ist kein Rechercheauftrag, sondern eine Aufgabe fuer Colin — sie gehoert vor das Meeting, nicht auf eine Folie. |
| **Referenz-Ersatz ohne Referenzen** | `10` stuft Referenzen korrekt als schwaechstes Beweismittel ein, aber es fehlt das Handwerk: Arbeitsproben, oeffentliches Repository, ein durchgerechneter Fall mit fiktiven Daten, ein Testat. |
| **Zentralschweizer Oekosystem** | HSLU (Innosuisse-Forschungspartner, in `01` bereits als Hebel identifiziert), Switzerland Innovation Park Central, IHZ. Fuer einen Regionalpitch ein billiger Glaubwuerdigkeitsgewinn — nirgends recherchiert. |

### 3.2 Deck B «Leistungskatalog 25+» — es gibt einen Katalog, aber kein Preisgeruest

**Was da ist:** 26 Use Cases fuer Arztpraxen (`03`), 30 fuer den Bau (`05`) — quantitativ mehr als
genug. **Was fehlt:**

| Fehlendes Thema | Konsequenz |
|---|---|
| **Marktpreise fuer CH-Software/KI-Arbeit** | `09` erklaert sie ausdruecklich fuer `[NB]` und benennt die Zielquellen (freelancermap.ch, GULP, swissICT-Salaerstudie, BFS-LSE Branche «Information und Kommunikation»). **Ohne diese Nachrecherche hat der Leistungskatalog kein Fundament.** Hoechste Prioritaet aller offenen Punkte. |
| **Wettbewerbslandschaft** | Wer bietet in der Zentralschweiz dasselbe an, zu welchen Konditionen, mit welcher Positionierung? Nirgends recherchiert. Ironie: Die einzige Wettbewerberseite in der Sammlung (`ai-automation-hub.ch`) wird als **Quelle** zitiert (siehe 1.10), nicht als Wettbewerber analysiert. |
| **Laufende Betriebskosten von KI** | Token-/API-Kosten, GPU-Stunden, Hosting pro Monat. `07` erklaert **alle** Anbieterpreise fuer `[NB]`. Ohne diese Zahlen ist kein Retainer und kein SaaS-Preis kalkulierbar — und Modell 5 und 6 aus `09`s Tabelle sind nicht anbietbar. |
| **Lieferkapazitaet eines Einzelanbieters** | Wie viele Projekte parallel? Was passiert bei Krankheit? `09` benennt das «Klumpenrisiko» korrekt und liefert das Gegenmittel (Exit/Uebergabe), aber die Kapazitaetsfrage — die der Onkel stellen wird — ist unbeantwortet. |
| **Schulung und Adoption** | Ueber alle Dateien hinweg wird Technik verkauft; **wer die Poliere und MPA dazu bringt, das Werkzeug zu benutzen**, ist nirgends ausgearbeitet. `05` nennt bei D20 die Akzeptanz beim Polier als eigentlichen Engpass — und zieht keine Konsequenz. Adoption ist ein eigenstaendiges, verkaufbares Angebot. |
| **KI-Kompetenz als Pflicht** | Der EU AI Act verlangt seit Februar 2025 von Anbietern und Betreibern ausreichende KI-Kompetenz der Mitarbeitenden. Fuer Schweizer Firmen mit EU-Bezug relevant, fuer alle anderen ein starkes Verkaufsargument fuer Schulungen. **In keiner der elf Dateien erwaehnt.** |
| **Nicht-KI-Angebote** | Website, SEO, Auffindbarkeit in KI-Suche, Barrierefreiheit (BehiG/WCAG), Datenmigration, BI-/Reporting-Dashboards, klassische Prozessautomatisierung ohne LLM. Teilweise verstreut (`03` UC25, `11` 4.2), nie als Katalogblock. Ein 25+-Katalog braucht diese Breite. |
| **E-Rechnung / QR-Rechnung / eBill** | Beruehrt direkt die Angebote Kreditoren- und Debitorenworkflow (`05` C16, `03` UC19), kommt aber in keiner Datei vor. |
| **Gewaehrleistung und Wartung als Produkt** | `09` behandelt SLA rechtlich (Reaktions- statt Behebungszeit), aber nicht als Preisposition. |

### 3.3 Deck C «Bau» — Recht und Kunde fehlen

| Fehlendes Thema | Warum wichtig |
|---|---|
| **Stirnimann Bau AG** | Null verifizierte Fakten (`11`). Der Rat aus `11` — im Deck **nichts** ueber die Firma behaupten, alles im Gespraech erfragen — ist richtig und sollte fuer das Deck verbindlich gelten. |
| **Arbeitszeiterfassungsrecht** | ArG und ArGV 1 regeln, welche Daten wie erfasst werden **muessen** (und wo vereinfachte Erfassung oder Verzicht moeglich ist). Das ist die rechtliche Grundlage der Angebote A1, A2 und D19 — und kommt in keiner Datei vor. `07` behandelt nur die Ueberwachungsgrenze (ArGV 3). **Erfassungspflicht und Ueberwachungsverbot sind zwei verschiedene Themen; das Angebot braucht beide.** |
| **Suva-Praemienmechanik** | `05` (D21) raeumt korrekt ein, dass eine belegte Praemiensenkung durch Schulung nicht sourcebar war — recherchiert aber nicht das **Praemienmodell** (Risikoklassen, Bonus-Malus, Sicherheits-Charta). Das ist der ehrliche Ersatz fuer das nicht belegbare Versprechen. |
| **Preise der Wettbewerbsprodukte** | Was kosten Sorba, Abacus AbaBau, Baurapport.ch, PlanRadar in der Schweiz? Ohne das kann Colin sein Angebot nicht positionieren — und `05` empfiehlt bei A5 ausdruecklich, PlanRadar **einzufuehren statt zu bauen**. Dazu muss man den Preis kennen. |
| **Anteil Regie- und Nachtragsumsatz** | Der gesamte C-Block («Geld sichern») haengt daran, wie viel Umsatz ueberhaupt ueber Regie und Nachtraege laeuft. Keine Zahl, kein Benchmark — muss beim Onkel erhoben werden. |

### 3.4 Deck D «Arztpraxen» — die Kundin selbst fehlt

| Fehlendes Thema | Warum wichtig |
|---|---|
| **Jana Rohrers Firma** | Name, Groesse, Anzahl betreuter Praxen, Erloesmodell — nicht recherchiert (`11`, Punkt 5.4). `11` liefert immerhin die entscheidende Analyse: Bei umsatzabhaengigem Modell zaehlt Durchsatz und Rueckweisungsquote, bei Pauschalen die Kosten pro Praxis. **Ohne diese eine Information ist das halbe Deck geraten.** |
| **TARDOC-Realdaten aus 2026** | Der ganze Pitch haengt am ersten TARDOC-Jahr — aber niemand hat Fehler-, Rueckweisungs- oder Kodierdaten aus dem laufenden Jahr. Das ist auch der beste Gespraechseinstieg: «Was seht ihr seit Januar?» |
| **Der MPA-Arbeitstag** | Die Administration landet laut `08` «groesstenteils bei der MPA» — es gibt aber keine Aufschluesselung, womit eine MPA ihren Tag verbringt. Fuer ein Angebot an eine Verwaltungsfirma ist das die relevantere Zeitverwendung als die aerztliche. |
| **Kosten und Dauer einer Medizinprodukt-Qualifikation** | `03` markiert bei sechs Use Cases «MP?» — aber was eine Konformitaetsbewertung kostet und dauert, steht nirgends. Fuer die Entscheidung «machen wir das ueberhaupt» ist das die einzige relevante Zahl. |
| **Patienteninformation und Einwilligung** | Der einzige Datenpunkt zur Akzeptanz ist ein ungeprueftes Sekundaerzitat (siehe 1.10). Ein Musterkonzept zur Patienteninformation bei KI-Einsatz waere ein verkaufbares Produkt — und fehlt. |

### 3.5 Querschnittsthemen, die in allen drei Decks fehlen

- **Was ein Ausfall kostet.** Backup, Wiederanlauf, Notfallbetrieb ohne das Tool. Ein Patron fragt
  «und wenn das Ding nicht laeuft?» — die Sammlung hat keine Antwort.
- **Cyber-Vorfall und Meldepflicht.** `07` nennt die DSG-Meldepflicht korrekt, aber nicht den
  operativen Ablauf (wer meldet, in welcher Frist, an wen) — Teil jedes seriösen Angebots.
- **Wie es nach dem Piloten weitergeht.** `09` beschreibt den Piloten hervorragend. Was danach
  kommt — Skalierung, Betriebskosten, zweite Praxis, zweite Baustelle — fehlt.
- **Vergleichbare Schweizer KMU-Faelle.** Kein einziger dokumentierter Fall eines Schweizer
  Klein-Betriebs, der so etwas eingefuehrt hat. Die staerkste Evidenz der Sammlung stammt aus
  US-Grossbetrieben (NBER, Kaiser Permanente, UCLA). Das ist ehrlich markiert — aber es bleibt eine
  Luecke, die der Kunde spueren wird.

---

## 4. Die zehn staerksten Fakten fuer das Verkaufsgespraech

Auswahlkriterium: belegt mit einer Primaer- oder amtsnahen Quelle, im Meeting nicht widerlegbar,
und mit direkter Konsequenz fuer eine Kaufentscheidung. Reihenfolge = Ueberzeugungskraft.

**1. Eine Arbeitsstunde kostet den Betrieb rund CHF 51–54 Vollkosten.**
Basis: BFS-Lohnstrukturerhebung 2024 (Medianlohn 7'024 / Bau 6'616 / Gesundheitswesen 6'609) plus
Arbeitgeberbeitraege 2026 (AHV/IV/EO 10,6 %, ALV 2,2 %) und 15–22 % Lohnnebenkosten gesamt.
→ `01-kmu-ki-schweiz.md`, Abschnitt 2, Quellen [7][8][9][10]. Nachgerechnet und korrekt.
**Warum stark:** Amtliche Eingangswerte, offengelegte Rechnung, jede Ersparnisdiskussion haengt
daran. Eine gesparte Stunde pro Tag ≈ CHF 11'700–12'400 pro Person und Jahr.

**2. 67 % der Gesundheitsfachpersonen erhalten unnoetige Aufgaben auf Papier, 56 % als nicht
editierbares PDF.**
SGAIM-Umfrage «Papiertiger», n = 1'856, Deutschschweiz/Romandie/Tessin.
→ `02`, 3.2, Quellen [23][24][25].
**Warum stark:** Fachgesellschaft als Primaerquelle, grosse Stichprobe, und es beschreibt einen
Prozess, der **ohne medizinisches Risiko** automatisierbar ist. Der beste Einstiegs-Use-Case ueberhaupt.

**3. Rund 54 Minuten pro Tag gehen praxisambulant fuer sonstige Administration weg — 87 % nennen
die Versicherer als Hauptverursacher.**
gfs.bern im Auftrag der FMH, Erhebung 2025, n = 1'532, davon 330 praxisambulant.
→ `02`, 3.1, Quellen [20][21][22].
**Warum stark:** Repraesentative Befragung durch ein etabliertes Institut im Auftrag des
Aerzteverbands — die Zielgruppe kann die eigene Zahl nicht bestreiten.
**Zwingend:** «rund eine Stunde, Tendenz steigend» sagen, **nicht** die Reihe 36,6 → 54 als
Zeitreihe verkaufen (`02` warnt zu Recht), und die 114 Minuten **nicht** addieren (siehe 2.1).

**4. TARDOC und ambulante Pauschalen loesen TARMED per 1.1.2026 ab — Genehmigung befristet bis
31.12.2028.**
Bundesratsbeschluss 30.04.2025, Anpassungen 05.11.2025.
→ `02`, Abschnitt 5, Quellen [48][49][50].
**Warum stark:** Amtlich, taggenau, und ein **Zwangsereignis** — niemand kann sich dagegen
entscheiden. 2026 ist das erste volle Jahr: neue Kodierlogik, jaehrliche Tarifpflege als neuer
Dauerprozess, erhoehtes Fehlerrisiko in der Uebergangsphase. Das ist das Zeitfenster.

**5. Der einzige RCT zu KI-Dokumentation zeigt rund 10 % Zeitersparnis — nicht 2–3 Stunden.**
NEJM AI, 238 ambulante Aerztinnen und Aerzte, 14 Fachrichtungen, drei Arme (DAX / Nabla / Usual
Care), Nov. 2024 – Jan. 2025. Nabla −9,5 % time-in-note (p = 0,02, ≈ 41 Sek./Notiz), DAX ohne
signifikanten Effekt (p = 0,66); Burnout- und Stressmasse verbesserten sich in beiden Armen;
vereinzelt klinisch relevante Ungenauigkeiten.
→ `02`, Abschnitt 6, Quellen [53][54][55].
**Warum stark:** Peer-reviewt, randomisiert, hoechste Evidenzstufe der ganzen Sammlung — **und es
ist der einzige Fakt, der zugleich ein Charakterbeweis ist.** Wer einer COO die kleine ehrliche
Zahl statt der grossen Anbieterzahl nennt, gewinnt den Rest des Gespraechs.

**6. SMS-Terminerinnerungen erhoehen die Terminwahrnehmung belegbar: RR 1,10 (95 % CI 1,03–1,17).**
Cochrane-Review Gurol-Urganci et al. 2013 (CD007458.pub3), 4 RCTs, n = 3'547; SMS gleich wirksam wie
Telefonanruf bei 55–65 % der Kosten.
→ `03`, Use Case 5, Quelle Q26.
**Warum stark:** Systematischer Review — die einzige Stelle im Terminbereich mit echter Evidenz,
und der Use Case ist in Wochen umsetzbar, ohne Regulatorik. **Einschraenkung mitliefern:** 2013,
und der Effekt ist real, aber moderat.

**7. KI-Nutzung in Schweizer KMU: bewusst in Prozesse integriert 22 % → 34 %, Verweigerer 45 % →
29 %; haeufigste Anwendung ist Uebersetzung mit 52 %.**
AXA/Sotomo KMU-Arbeitsmarktstudie 2025, n = 300, Medienmitteilung 08.10.2025. Dazu: 57 % berichten
Zeitersparnis, aber nur 2 % reduzieren deshalb Personal und 10 % schaffen Stellen.
→ `01`, Abschnitte 1 und 4, Quelle [2]; `04`, Abschnitt 5, Quelle [20].
**Warum stark:** Jaehrliche Reihe mit Vorjahresvergleich, also **Bewegung statt Momentaufnahme** —
das Argument «der Zug faehrt gerade ab» ist damit belegbar. Und der Zusatz «2 % reduzieren Personal»
nimmt dem Onkel und der Belegschaft die Angst, die sonst jedes Projekt bremst.

**8. Auf Schweizer Baustellen stellen zwei Nationen zwei Drittel des Personals: 34,7 % Schweizer,
31,0 % Portugiesen, rund 100 Nationalitaeten — in den tiefen Lohnklassen ueber 80 % Auslaenderanteil.**
SBV-Lohnerhebung 2024 (via Statista).
→ `04`, Abschnitt 4, Quelle [19]; `05`, Abschnitt 1, Quelle [4].
**Warum stark:** Der Onkel sieht das jeden Morgen auf seiner Baustelle — es ist der einzige Fakt der
Sammlung, den er sofort mit eigenen Augen bestaetigt. **Sauber formulieren:** ueber Paesse reden,
nicht ueber Sprachen (siehe 1.9).

**9. Die Bauproduktivitaet ist gesunken, waehrend die Gesamtwirtschaft zulegte — und bis 2040 fehlen
5'600 Fachkraefte.**
Avenir Suisse auf BFS-Basis: Gesamtwirtschaft 1997–2023 **+21 %**, Baubranche **–2 %**.
SBV-Studie (Demografik): 5'600 fehlende Fachkraefte bis 2040, bei Maurern **+31 %** und
Bauvorarbeitern **+33 %** Mehrbedarf gegenueber verfuegbarem Personal, Haupttreiber Altersueberhang.
→ `04`, Abschnitte 2 und 3, Quellen [7][8].
**Warum stark:** Die Kombination ist das Argument. Auftraege sind da (Q1 2026 +5,6 % Umsatz), Leute
nicht, Produktivitaet gesunken. **Wachstum ist nur ueber Produktivitaet moeglich** — daraus folgt der
Auftrag, nicht aus «KI ist toll». Bei 2–3 % Marge ist jede eingesparte Buerostunde direkt Gewinn.

**10. Der Regierapport ist keine Buerokratie, sondern die Marge — und das Datenschutzrecht haftet
persoenlich.**
SIA-Norm 118: «kein Abrechnungsposten ohne Beleg»; die KBOB fuehrt dazu einen eigenen Leitfaden zum
Nachtragsmanagement (V2.0). Fehlt der gegengezeichnete Regierapport, ist die Leistung erbracht, aber
nicht durchsetzbar. → `04`, Abschnitte 6 und 7, Quelle [14].
Parallel dazu: revDSG seit 01.09.2023, laut EDÖB **direkt auf KI-Anwendungen anwendbar**; Bussen bis
**CHF 250'000**, gerichtet gegen **natuerliche Personen**, nicht gegen den Unternehmensumsatz. Fuer
Arztpraxen zusaetzlich Art. 321 StGB, Freiheitsstrafe bis drei Jahre, ausdruecklich auch fuer
**Hilfspersonen**. → `01`, Abschnitt 6, Quellen [21][22]; `02`, Abschnitt 6, Quellen [56][57]; `07`.
**Warum stark:** Beide Haelften machen aus einem Kann ein Muss — die eine fuer den Bau-Patron
(fehlender Beleg = verlorenes Geld), die andere fuer beide Entscheider (es haftet der
Geschaeftsfuehrer persoenlich, nicht die AG). Und die zweite Haelfte begruendet zugleich, warum
Schweizer Hosting und ein Auftragsbearbeitungsvertrag mit Hilfspersonenklausel keine Zusatzoption
sind, sondern Eintrittsbedingung.

**Knapp nicht in den Top 10, aber gut:** Digital Health Report 2025/2026 (Interpharma/ZHAW) —
Arztpraxen mit 3,4 von 10 Punkten digitale Reife, hinter Spitaelern (4,6), Versicherern (6,0) und
Pharma (6,8) · Innosuisse-Innovationsscheck bis CHF 15'000 zu 100 % finanziert (aber: Geld geht an
den Forschungspartner) · Personalverleih ist bewilligungspflichtig mit CHF 50'000 Kaution — das
Argument, das die Plattform-Idee des Onkels in einem Satz umlenkt.

---

## 5. Die sieben Punkte, die vor dem Meeting erledigt sein muessen

Priorisiert nach Schaden-mal-Wahrscheinlichkeit:

1. **Bauhandwerkerpfandrecht:** Ist die Vier-Monats-Frist neu seit 2026 oder seit 2012? (Abschnitt 1.1)
2. **Marktpreise fuer CH-Software-/KI-Arbeit nachrecherchieren** — ohne sie hat der Leistungskatalog
   kein Fundament. Zielquellen stehen in `09`, Abschnitt 8.
3. **Die 114 Minuten aus dem Arztpraxen-Deck entfernen** bzw. korrekt als Spitalwert kennzeichnen.
   (Abschnitt 2.1)
4. **MPA-Stellenzahlen aus `03` streichen**, INFRAS-Zahl verwenden. (Abschnitt 1.2)
5. **Rueckweisungsquote entscheiden:** belegt oder nicht? Eine Bewertung fuer alle Dateien.
   (Abschnitt 1.3)
6. **Zefix-Abfrage «Stirnimann Bau»** — zehn Minuten, und ohne sie keine Firmenangabe im Deck.
7. **Ausgleichskasse: Selbstaendigkeit klaeren**, bevor der erste Auftrag von einem Verwandten
   kommt. (Abschnitt 3.1)

**Und die eine Regel, die alles andere ersetzt, wenn die Zeit knapp wird:** Jede Zahl auf jeder
Folie braucht sichtbar ihre Quelle und ihr Jahr. Wo das nicht geht, gehoert die Zahl nicht auf die
Folie — sondern wird im Gespraech beim Kunden erhoben. Das ist in beiden Terminen ohnehin die
staerkere Bewegung.
