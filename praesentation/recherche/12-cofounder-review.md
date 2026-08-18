# Mitgruender-Durchgang

Sechs unabhaengige Lesarten, zusammengefuehrt und jede Stelle in `index.html` nachgelesen.
Was sich nicht bestaetigt hat, steht unten unter «Verworfene Befunde».

## Kurzurteil

Ja, Colin geht damit ins Meeting — aber nicht in dieser Fassung der Datei. Die Unterlage ist
inhaltlich weiter als alles, was ein Erstanbieter normalerweise mitbringt: sie legt ihre eigenen
Schwaechen offen, sie datiert ihre Quellen, und sie enthaelt mit der Verleih-Abgrenzung und dem
Hinweis auf die Code-Rechte zwei Auskuenfte, fuer die andere Geld verlangen. Kaputt machen kann
sie genau dreierlei: eine Zahl, die im Deck anders steht als in der Studie, ein Deck, das in vier
von vierzig Folien ueberhaupt keinen Preis nennt, und eine ausgelieferte Datei, in der die
Klarnamen zweier frueherer Arbeitgeber und eine schriftliche Anleitung zum Erzaehlen der
Kuendigung mitreisen. Das sind drei Stunden Arbeit, nicht drei Tage. Danach ist es eine Unterlage,
mit der ich mich neben ihn setze.

---

## Sofort aendern (kritisch)

**[Auslieferung · `tools/inline-recherche.mjs`, Zeilen 3423 und 3716]** Die Recherchedokumente 10
und 11 sind in die Datei eingebettet. Dokument 11 nennt **beide frueheren Arbeitgeber im Titel**,
Dokument 10 enthaelt die schriftliche Anleitung, wie die Kuendigung zu erzaehlen
ist. Der Schalter «Standard ist anonym» schuetzt danach nichts mehr, und die Datei soll
veroeffentlicht werden.
> Alt: alle elf Dokumente werden eingebettet.
> Neu: nur `00`–`09` einbetten. `10-pitch-narrativ.md` und `11-firmen-kontext.md` bleiben lokale
> Arbeitsdokumente; in der README-Tabelle die beiden Zeilen mit «nicht in der ausgelieferten
> Datei» kennzeichnen.

**[Deck 4 · Folie 04 und Folie 10, Katalog 20]** Die Folie widerlegt fremde Zahlen und stellt
danach selbst eine ungenaue hin. Die Studie misst −41 s im besseren Arm **gegen −18 s in der
Kontrollgruppe**; zurechenbar sind rund 20 Sekunden. Ausgerechnet auf dieser Folie ist das toedlich.
> Alt: "Die einzige randomisierte Studie (NEJM AI, 238 ambulante Ärzte, 14 Fachrichtungen) findet
> <b>rund 10 %</b> weniger Dokumentationszeit — etwa 41 Sekunden pro Notiz. Das zweite geprüfte
> System zeigte gar keinen signifikanten Effekt."
> Neu: "Die einzige randomisierte Studie (NEJM AI, 238 ambulante Ärzte, 14 Fachrichtungen) findet
> <b>rund 10 %</b> weniger Dokumentationszeit. In Sekunden: −41 s pro Notiz im besseren System —
> die Kontrollgruppe verbesserte sich im selben Zeitraum um 18 s. Zurechenbar sind rund
> <b>20 Sekunden</b>. Das zweite geprüfte System zeigte keinen signifikanten Effekt."

**[Deck 1 · Folie 10b, dritter Vertragspunkt]** Die Folie verspricht einen kostenlosen Ausstieg.
Art. 377 OR gibt das Ruecktrittsrecht **gegen volle Entschaedigung**. Wenn der Treuhaender das
liest, ist es keine Vertrauensfolie mehr, sondern eine geschoente Rechtsauskunft — auf der Folie,
die Vertrauen aufbauen soll.
> Alt: "<b>Der Ausstieg.</b> Beim Werkvertrag könnt ihr ohnehin jederzeit zurücktreten — ich
> schreibe die Klausel trotzdem hin."
> Neu: "<b>Der Ausstieg.</b> Das Gesetz lässt euch beim Werkvertrag jederzeit zurücktreten — aber
> gegen volle Entschädigung (Art. 377 OR). Meine Klausel geht weiter: nach jeder Stufe Schluss,
> bezahlt wird nur die abgeschlossene Stufe."

Und zwei Ticks hoeher, gleiche Logik:
> Alt: "<b>Monatliche Betreuung erst danach</b> — und jederzeit kündbar, das gibt euch das Gesetz
> ohnehin."
> Neu: "<b>Monatliche Betreuung erst danach</b> — jederzeit auf Monatsende kündbar. So steht es im
> Vertrag, nicht bloss im Gesetz."

**[Deck 1 · Folie 10b und Deck 4 · Folie 13 — kein Preis, nirgends]** Vier Decks, 38
Katalogpunkte, kein einziger Frankenbetrag. Gleichzeitig stehen in den Rechner-Voreinstellungen
Setup 12'000–25'000 und Betrieb 250–500 auf dem Beamer. Der Preis ist also im Raum, nur besitzt
ihn niemand. Ein Patron, der nach 75 Minuten keine Hausnummer gehoert hat, entscheidet nichts.
> Neu (vierter Tick auf 10b): "<b>Grössenordnung, damit ihr rechnen könnt:</b> der halbe Tag
> Analyse CHF 800, voll anrechenbar. Ein Pilot liegt bei CHF 12'000 bis 25'000 zum Fixpreis, der
> Betrieb bei CHF 250 bis 500 im Monat. Verbindlich wird die Zahl nach Stufe 1 — vorher rate ich,
> und Raten ist genau das, was ich euch nicht verkaufen will."

Bewusst dieselben Zahlen wie in `PRESETS`. Jede andere Bandbreite widerspricht dem Rechner, der
im selben Termin laeuft. Die Sprechernotiz «Keine Marktzahlen nennen» bleibt gueltig — sie
verbietet fremde Tagessaetze, nicht den eigenen Preis. Notiz entsprechend praezisieren.

**[Deck 4 gesamt · Katalog 15–22 — die Praxissoftware kommt nicht vor]** Alle fuenf Vorhaben
haengen an vitomed, Aeskulap, Axenita, tomedo und dem Weg ueber MediData. Keine Folie erwaehnt
das. Fuer eine COO ist das die Stelle, an der sie abschaltet, weil sie zeigt: hier hat noch nie
jemand in einer Praxis etwas angeschlossen.
> Neu (Notiz unter der Tabelle auf Folie 05): "Alle fünf hängen an eurer Praxissoftware. Ich habe
> vitomed, Aeskulap, Axenita, tomedo und den Weg über MediData angeschaut — angeschlossen habe
> ich noch an keines davon etwas. Erste Frage in Woche 1: Welche Systeme laufen bei euch, und was
> gibt jedes davon exportiert heraus? Wo eine Schnittstelle Geld kostet, sage ich das, bevor wir
> bauen."

**[Deck 4 · Folie 07 — der Wettbewerb kommt nicht vor]** Regelpruefung vor Versand verkaufen
Aerztekasse, MediData und Medical Invoice seit Jahren; unsere eigene Recherche 02 listet sie. Wenn
das Deck tut, als waere die Idee neu, entwertet es Folie 04, wo die Ehrlichkeit gerade das Produkt
war.
> Neu (Absatz rechts, unter «Was wir vorher messen»): "<b>Das gibt es schon</b> — bei Ärztekasse,
> MediData und Medical Invoice, als Teil ihrer Abrechnungsdienstleistung. Der Unterschied: dort
> seht ihr das Ergebnis, nicht die Ursachen, und die Regeln gehören euch nicht. Ob sich das gegen
> einen bestehenden Vertrag lohnt, rechnen wir in Woche 2 — nicht heute."

**[Cockpit · Prüfliste und `DEFAULTS`, Zeile 3900/3910]** `zahlenNennen: true` und
`p2Volumen: "16 Mio. CHF"` stellen eine interne Projektzahl eines frueheren Arbeitgebers
serienmaessig an. Der Cockpit-Punkt zeigt sie zusaetzlich auf der Startseite — also auch bei
ausgeschaltetem Schalter.
> Alt: `zahlenNennen: true`, `p2Volumen: "16 Mio. CHF"`, Prüfpunkt "Worauf sich die 16 Millionen
> beziehen"
> Neu: `zahlenNennen: false`, `p2Volumen: ""`, Prüfpunkt "Grössenordnung des zweiten Projekts —
> nennen oder nicht?" mit dem Text: "Eine interne Projektzahl eines früheren Arbeitgebers ist
> unbelegbar und kann unter die Geheimhaltung fallen. Standard: die Art der Aufgabe beschreiben,
> keine Zahl."

**[Rechner · `paintResult`, Zeile 4902]** Die groesste Zahl auf dem Schirm ist `brutto`, vor jedem
Abzug — genau die Optik, die Deck 4/04 anderen vorwirft. Dazu: gesparte MPA-Stunden sind kein
Franken, solange niemand geht.
> Alt: `result__big` zeigt `x.brutto`, darunter kleiner "Netto im ersten Jahr, nach Einführung und
> Betrieb".
> Neu: `result__big` zeigt `x.netto1`; `brutto` bleibt als erste Balkenzeile. Label darunter:
> "Rechnerischer Wert der frei werdenden Zeit, nach Einführung und Betrieb — ein Franken wird
> daraus erst, wenn ihr die Stunden anders einsetzt oder eine offene Stelle nicht mehr besetzt."

**[Rechner · Reset, Zeile 5099 — echter Datenfehler]** `S = {...DEFAULTS}` kopiert die *Referenz*
auf `DEFAULTS.picked`; jedes Markieren im Katalog (`S.picked.push`, Zeile 4745) mutiert seither
die Vorgabe. «Alles zuruecksetzen» meldet «Zurueckgesetzt», die Auswahl bleibt — auch nach
Neuladen. Praktisch heisst das: du raeumst vor dem Termin auf und stehst mit Janas markierten
Punkten vor deinem Onkel.
> Alt: `S = {...DEFAULTS}; save();`
> Neu: `S = JSON.parse(JSON.stringify(DEFAULTS)); save();`
> Ebenso im Loader, Zeilen 3921/3923.

**[Deck 1 · Folie 11 und die ganze Unterlage — «ich» oder «wir»]** «Wenn ich ausfalle, steht es
still» ist falsch, wenn wir zu zweit gruenden — und wenn es stimmt, kauft kein Patron einen
Prozess mit Bus-Faktor eins. Eines von beiden muss weg. `DEFAULTS.agentur` ist leer.
> Alt: "<b>Keine Agentur mit dreissig Leuten.</b> Wenn ich ausfalle, steht es still."
> Neu: "<b>Keine Agentur mit dreissig Leuten.</b> Wir sind zu zweit — und genau deshalb gehören
> euch Code, Zugänge und Dokumentation ab dem ersten Tag, statt dass ihr auf unsere Verfügbarkeit
> angewiesen seid."

---

## Vor dem Meeting aendern (wichtig)

**[Deck 1 · Folie 08, `h2`]** Die Sprechernotiz zu `absage2` (Zeile 5151) sagt woertlich «Streich
ersatzlos: „Zweimal ist mir dasselbe passiert.“» — und zwei Folien spaeter steht genau dieser Satz
als Ueberschrift auf der Leinwand. Die Folie erledigt, wovor die Notiz warnt.
> Alt: "Zweimal dasselbe Muster. Daraus habe ich drei Dinge gelernt."
> Neu: "Beides ist fertig geworden und nie angekommen. Drei Dinge, die ich daraus gelernt habe."
> Und in Karte 01: "Ich habe zweimal fertig gebaut und zweimal nicht übergeben." → "Ich habe
> fertig gebaut und die Übergabe nicht organisiert."

**[Deck 1 · `absage1.sub` und `absage2`, Zeilen 5143/5149/5150]** Zweimal «ihr gutes Recht»,
einmal «durfte ich nicht zeigen». Wer betont, der andere habe das Recht gehabt, sagt dem Raum,
dass er es fuer falsch haelt. In einer Familie sitzt das doppelt.
> Alt: "Das war ihre Entscheidung und ihr gutes Recht."
> Neu: "Es kam intern nicht zur Entscheidung."
> Alt: "Entlassung in der Probezeit. Die Arbeit wurde nicht angeschaut, die Ergebnisse durfte ich
> nicht zeigen."
> Neu: "Die Probezeit wurde beendet, bevor ich das Ergebnis zeigen konnte."
> Alt (sub): "Auch das war ihr Recht — in der Probezeit braucht es keine Begründung."
> Neu (sub): "Kurze Frist, keine Begründungspflicht — dafür ist die Probezeit da. Präsentiert habe
> ich es dort nie. Heute schon."

**[Deck 3 · Folie 01, `h1`]** Die Vorbereitungsliste verbietet Aussagen ueber den Betrieb des
Onkels («fragen wirkt beratend, sagen wirkt belehrend»); die Eroeffnungsfolie bricht die eigene
Regel mit einer Verbandszahl von 2022.
> Alt: "Ihr arbeitet in einer<br>Drei-Prozent-Branche."
> Neu: "Wie nah seid ihr<br>an den drei Prozent?"
> Lead dazu: "Ich rede nicht über Digitalisierung, sondern über Marge — eure, nicht die des
> Verbands."

**[Deck 3 · Folie 03]** Die Rechnung im Untertitel nimmt 200'000 von 20 Mio. — das ist ein Prozent
des **Umsatzes**, nicht der Kosten. Der Onkel rechnet mit.
> Alt: "Bei drei Prozent Marge macht ein Prozent gesparte Kosten ein Drittel mehr Gewinn."
> Neu: "Bei drei Prozent Marge macht ein Prozent des Umsatzes an eingesparten Kosten ein Drittel
> mehr Gewinn."

**[Deck 3 · Folie 08, Karte «So nicht»]** Der Kartentitel ist ein woertliches Zitat in
Anfuehrungszeichen — ein Satz, den der Onkel nie gesagt hat, der ihm aber sichtbar in den Mund
gelegt wird. Dazu «So wie sie meistens gedacht wird» = eure Idee ist die naive Variante. Das ist
der wertvollste Punkt des Decks; er darf nicht wie eine Zurechtweisung klingen.
> Alt (h2): "Die Idee ist richtig. So wie sie meistens gedacht wird, ist sie bewilligungspflichtig."
> Neu (h2): "Die Idee trägt. Ob sie bewilligungspflichtig wird, entscheidet ein Detail."
> Alt (Kartentitel): "So nicht" / "„Wir stellen unsere Leute stundenweise auf eine Plattform“"
> Neu: "Der teure Weg" / "Leute stundenweise überlassen"
> Alt (Kartentitel 2): "So ja" → Neu: "Der schnelle Weg"

**[Deck 3 · Folie 08, Karte «So ja», Schlusssatz]** Die Qualifikation steht kategorisch auf der
Folie, der Vorbehalt nur in der Sprechernotiz. Genau umgekehrt gehoert es.
> Alt: "Das ist ein Werkvertrag beziehungsweise Regie, bewilligungsfrei, und in Wochen aufgebaut."
> Neu: "Das ist der Zuschnitt, der als Werkvertrag oder Regie trägt statt als Verleih — in Wochen
> aufgebaut. Ob er im Einzelfall hält, entscheidet die tatsächliche Weisungsmacht, nicht der
> Vertragstitel. Vor dem Aufschalten einmal juristisch prüfen lassen."

**[Deck 3 · Folie 10, Zeile «Entsendung»]** Recherche 04 warnt ausdruecklich: Entsendung betrifft
auslaendische Arbeitgeber, nicht Direktanstellung. Sechs Folien nach der Sprachenfolie liest der
Onkel das auf seine eigenen Leute.
> Alt: "Im Bau Meldung ab dem ersten Tag, acht Tage vor Arbeitsbeginn — seit dem 17.3.2025 nur
> noch über EasyGov."
> Neu: "Betrifft nur Personal, das ein ausländischer Arbeitgeber in die Schweiz entsendet — nicht
> eure Direktangestellten. Dann aber: Meldung ab dem ersten Tag, acht Tage vor Arbeitsbeginn, seit
> dem 17.3.2025 nur noch über EasyGov."

**[Deck 3 · Folie 11, Quellzeile]** Eine Zahl, die man selbst als ungeprueft ausweist, gehoert
nicht auf eine Kundenfolie. Das Cockpit sagt «entweder belegen oder weglassen» — also weglassen.
> Alt: "Die öffentliche Hand beschafft nach Angaben eines Branchenportals über 41 Mrd. CHF pro
> Jahr — diese Zahl stammt nicht aus einer amtlichen Quelle und ist vor Verwendung
> gegenzuprüfen."
> Neu: "Das revidierte Beschaffungsrecht verschiebt den Wettbewerb vom Preis zur Qualität — damit
> wird der technische Bericht zum Zuschlagsfaktor."
> Prüfpunkt im Cockpit ersatzlos streichen.

**[Deck 3 · Folie 12, zweite Kennzahl]** «722 Lehrbeginne 2024 — 2010 waren es rund 1'200», ohne
Quelle, zeigt einen fallenden Trend. Die Daten zeigen eine Erholung (2019 gut 700 → 2024 722,
+10 %), und die eigene Notiz warnt zwei Zeilen weiter vor dem Notstands-Argument.
> Alt: `{n:"722", l:"Lehrbeginne Maurer/in EFZ 2024 — 2010 waren es rund 1'200", s:""}`
> Neu: `{n:"722", l:"Lehrbeginne Maurer/in EFZ 2024, +10 % gegenüber dem Tiefpunkt 2019 — 2010
> waren es rund 1'200", s:"Schweizerischer Baumeisterverband"}`
> Satz dazu: "Die Talsohle ist durchschritten. Sie reicht trotzdem nicht, um den Altersabgang zu
> decken."

**[Deck 3 · Folie 09, Modellrechnung]** «1 Vorarbeiter + 2 Bauarbeiter, bisher unausgelastet»
widerspricht Folie 02 («+5,6 % Umsatz, Arbeitsvorrat ueber Vorjahr»). Er wird fragen, wo er diese
drei Leute haben soll.
> Alt: "1 Vorarbeiter + 2 Bauarbeiter, bisher unausgelastet"
> Neu: "Lücken in der Einsatzplanung (Wetter, verschobene Baustellen, Ausfälle)"

**[Deck 4 · Folie 09, `h2` und `src`]** Zwei Probleme auf einer Folie. Der Titel ist ein Satz, zu
dem man in sechs Monaten nicht mehr steht (die eigene Notiz sagt: «ein Hinweis, kein Beweis»), und
Argomed und medkey stehen in unserer eigenen Recherche. Dazu der falsche Datenschutz-Schluss:
aggregiert wird am *Ende* der Kette, der Weg dorthin fuehrt durch die Praxissysteme.
> Alt (h2): "Das Einzige, was nur ihr bauen könnt."
> Neu (h2): "Kennzahlen über alle Praxen — was fehlt euch heute am Monatsblatt?"
> Alt (note): "Ich habe keinen Schweizer Anbieter gefunden, der das für Praxisverwalter macht."
> Neu: "Argomed und medkey machen Ähnliches für ihre Netze. Für eine Verwaltungsfirma eurer Art
> habe ich nichts gefunden — das ist ein Hinweis, kein Beweis. Zwei Telefonate klären es."
> Alt (src): "Für Datenschutz gilt: aggregierte Betriebskennzahlen, keine Patientendaten. Das hält
> die Sache ausserhalb des Berufsgeheimnisses."
> Neu: "Ziel ist die aggregierte Kennzahl. Der Weg dorthin führt durch die Praxissysteme —
> Auftragsbearbeitungsvertrag und Berufsgeheimnis-Klausel gelten deshalb auch hier. Wo möglich
> aggregieren wir in der Praxis und übernehmen nur die Summe."

**[Deck 4 · Folie 12, erster Tick und Quellzeile]** Die Hilfspersonen-Konstruktion ist herrschende
Lehre, nicht geklaerte Rechtslage; Recherche 07 sagt das ausdruecklich und verbietet ungeprüfte
Artikelnummern auf Folien. Eine COO stuetzt darauf ihre Compliance-Entscheidung.
> Alt (src): "Grundlagen: Art. 321 StGB · revDSG seit 1.9.2023, Art. 9 …"
> Neu (src): "Orientierung, keine Rechtsberatung. Grundlage ist der Leitfaden von SAMW und FMH;
> die Artikelverweise sind in Recherche 07 als ungeprüft markiert und vor jeder Zusage am
> Gesetzestext gegenzulesen."
> Ergaenzung im ersten Tick: "… vertraglich als weisungsgebundene Hilfsperson eingebunden sein.
> Dieser Weg ist in der Lehre anerkannt, aber nicht höchstrichterlich geklärt — für euren Fall
> lassen wir ihn bestätigen, bevor Daten fliessen."

**[Deck 4 · Folie 06, dritter Tick]** Die Warteliste «gibt den Termin an die Person, die als
naechste passt» — das ist Priorisierung, die Folie 11 selbst als regulatorisch heikel ausschliesst.
> Alt: "wird ein Termin frei, geht er automatisch an die Person, die als nächste passt."
> Neu: "wird ein Termin frei, geht er in der Reihenfolge der Anmeldung hinaus, ohne jede
> inhaltliche Gewichtung — sobald sortiert wird, ist es das Projekt von Folie 11."

**[Deck 4 · Folie 06, vierter Tick und Quellzeile]** Eine KMU-Werbezahl direkt neben einem
Cochrane-Wert; Auftraggeber der Studie ist ein Anbieter digitaler Praesenz. Sie zieht die gute
Zahl herunter.
> Alt: "<b>77 %</b> der Bevölkerung wollen Dienstleistungen online suchen und direkt buchen. Nur
> 3 % der Betriebe können das vollständig."
> Neu: Tick ersatzlos streichen, Quellzeile "Letzte Zahl: KMU Digital Pulse 2025 …" ebenfalls.
> Wo die Zahl anderswo stehen bleibt (Katalog 3 und 4), Quellzeile ergaenzen: "… localsearch mit
> HSLU — Auftraggeber ist ein Anbieter digitaler Präsenz, die Zahl liegt in seinem Eigeninteresse."

**[Deck 4 · Folie 13, Schritt 1]** «Anrufe pro Tag und Anlass … alles aus euren eigenen Systemen»
stimmt nicht: Anrufgruende stehen in keinem System, die strichlisten die MPA. Und ob die zwei
Wochen etwas kosten, steht nirgends.
> Alt: "Anrufe pro Tag und Anlass. Rückweisungen und ihre Gründe. Posteingang nach Art.
> Ausgefallene Termine. Alles aus euren eigenen Systemen — nicht geschätzt."
> Neu: "Rückweisungen und Gründe, Posteingang nach Art, ausgefallene Termine: aus euren Systemen.
> Anrufe nach Anlass: rund 10 Minuten pro Tag und Standort als Strichliste am Empfang, fünf Tage
> lang. <b>Aufwand bei mir: zwei Tage, CHF 1'600 — voll anrechenbar, wenn ein Vorhaben folgt.</b>"

**[Cockpit · `VORBEREITUNG`, neuer erster Punkt]** `p1Problem`, `p1Loesung`, `p1Ergebnis`,
`p1Dauer`, `p2Projekt`, `p2Rolle`, `p2Dauer` sind leer. Deck 1, Folie 04 und 06 — die beiden
Folien, die belegen, dass er im *Betrieb* geliefert hat — zeigen im Moment «unter Einstellungen
eintragen». Die Vorbereitungsliste erwaehnt sie nicht.
> Neu (erster Punkt): "<b>Die sieben Projektfelder ausfüllen.</b> Ohne sie sind Deck 1, Folie 4
> und 6 leer — das sind die beiden Folien, die belegen, dass ich nicht nur privat baue. Je ein
> Satz genügt, aber es muss dort etwas stehen."

**[Cockpit · `PRUEFEN`, elfter Punkt, Gewicht hoch]** Recherche 09 markiert Art. 373, 377, 404 OR
und Art. 17 URG als nicht abrufbar und aus Standardwissen. Die Prueffliste fuehrt die
DSG-Artikel, aber nicht diese — dabei stehen sie auf der Vertrauensfolie.
> Neu: `{w:"hoch", t:"OR- und URG-Artikel auf der Vertragsfolie", d:"Art. 373 und 377 OR
> (Werkvertrag, Rücktritt gegen Entschädigung), Art. 404 OR (jederzeitige Kündbarkeit des
> Auftrags) und Art. 17 URG (keine automatische Rechteübertragung ausserhalb des
> Arbeitsverhältnisses) stammen aus Standardwissen; der Gesetzestext war während der Recherche
> nicht abrufbar. Einmal gegenlesen, bevor die Folie gezeigt wird.", wo:"Deck 1, Folie 10b"}`

**[Darstellung · Zeilen 26, 67, 93, 31]** Grautext und Signalorange liegen unter der
Lesbarkeitsschwelle: `--ink-3` hell 3,08:1, dunkel 4,02:1, `--signal` 3,5:1 (noetig 4,5). Betroffen
ist alles Kleingedruckte, das im Meeting zaehlt — die Quellenzeilen, die Massangaben im Rechner,
die Folienzaehler. Auf einem Beamer in einem hellen Sitzungszimmer ist das weg, und ausgerechnet
die Quellenangaben sind das, was die Unterlage seriös macht.
> Alt: `--ink-3:#8695A1;` (hell) · `--ink-3:#6C7B86;` (dunkel) · `--signal:#EA5B0C;`
> Neu: `--ink-3:#5C6B77;` (5,5:1) · `--ink-3:#8A99A4;` (6,0:1) · `--signal:#C2470A;` (5,0:1)

**[Deck 3 · Folie 09 bei 1024×768]** Der Ueberlaufwaechter warnt korrekt, aber der letzte Absatz
faellt weg — und 1024×768 ist der Beamer, den man in einem Bau-Sitzungszimmer antrifft.
> Alt: zwei Ticks — "<b>Referenzen mit Substanz</b> und eine strukturierte Anfrage statt eines
> Telefonats." + "<b>Jede Buchung erzeugt eine Regie- oder Werkvertragsbestätigung</b>, nie einen
> Verleihvertrag."
> Neu: ein Tick — "<b>Strukturierte Anfrage statt Telefonat</b> — und jede Buchung erzeugt eine
> Regie- oder Werkvertragsbestätigung, nie einen Verleihvertrag."
> Deck 4, Folie 10 laeuft dort um 5 px ueber: gleiche Behandlung, eine Zeile kuerzer.

---

## Wenn Zeit bleibt (kosmetisch)

**[`PRESETS`-Kommentar vs. `bau-buero`]** Der Kommentar sagt «Bau und Gesundheitswesen je rund
CHF 51», das Preset setzt 54.
> Alt: `v:{personen:3, stunden:8, satz:54, …}` → Neu: `satz:51`

**[Katalog 24]** Der EQUAM-Aufwand ist «nach Angaben der Stelle» zugeschrieben, belegt ist er ueber
medmonitor.swiss, einen Anbieter.
> Alt: "nach Angaben der Stelle" → Neu: "nach Angaben eines Anbieters"

**[Cockpit · Pruefpunkt «Demo-Links» / «16 Millionen», Feld `wo`]** Der Folienverweis ist hart
geschrieben und stimmt in der Erzaehlweise «muendlich» nicht (dort Folie 5 statt 6).
> Alt: `wo:"Deck 1, Folie 6"` → Neu: `wo:"Deck 1 · Folie „Grössenordnung des Projekts“"`

**[Theme-Knopf nach dem Zuruecksetzen]** Die Darstellung springt auf Auto, der Knopf sagt weiter
«Hell».
> Neu: im Reset-Handler nach `applyTheme();` ergaenzen: `$("#themeBtn").textContent = "Dunkel / Hell";`

**[Katalogfilter «Gross»]** Von 38 Angeboten ist genau eines «gross»; «Bau» + «Gross» ergibt «0 von
38 sichtbar». Das klickt der Onkel in der ersten Minute.
> Neu: die Vorhaben mit 2–4 Monaten Laufzeit (25, 28, 30, 31, 38) ehrlich auf `gross` heben — oder
> die Zahl in die Pille schreiben: `"Gross (1)"`.

**[Deck 2 · Folie 03]** Benchmark-Folie wie bei jedem Anbieter; die Substanz steckt in der Notiz
darunter. Ich streiche sie nicht ganz — Folie 04 baut darauf auf —, aber sie darf nicht drei
Kennzahlen gross zeigen.
> Neu: nur die 34-%-Kennzahl stehen lassen, die anderen beiden in die Notiz, und mit dem Satz
> schliessen: "49 % der Beschäftigten nutzen KI täglich, die Betriebe haben es nicht im Ablauf.
> Genau dazwischen liegt die Arbeit."

**[Druck]** Ctrl+P druckt eine Folie, weil im DOM nur die aktuelle steht. Der Handout-Weg ueber
`is-printing` existiert — er ist nur nicht die Taste, die jeder drueckt.
> Neu: `keydown` auf Ctrl/Cmd+P abfangen und auf die Handout-Funktion umleiten.

---

## Ergaenzungen, die fehlen

**Die Familie.** Onkel und Cousine, Geld, ein Neffe, der zweimal nicht angekommen ist — und kein
Satz dazu in 90 Minuten. Das ist der lauteste ungesagte Gedanke im Raum. Neue Zeile auf Folie 09:
«Wenn es nicht funktioniert, will ich, dass ihr das sagen könnt, ohne an Weihnachten zu denken.
Deshalb: schriftlicher Vertrag, Fixpreis, Ausstieg nach jeder Stufe — genau wie mit einem
Fremden.»

**Dass es noch keinen zahlenden Kunden gibt.** Beide Betriebsprojekte kamen nie zum Einsatz, die
drei Anwendungen sind Eigenbau, und der vierstufige Ablauf auf Folie 10 ist noch nie durchlaufen
worden. Der Onkel rechnet das in drei Minuten aus. Ausgesprochen ist es ein Vertrauensgewinn,
ertappt ist es das Ende des Termins: «Ich habe diesen Ablauf noch mit niemandem zu Ende gemacht.
Ihr wärt die Ersten — deshalb der bezahlte halbe Tag, der Fixpreis und der Ausstieg nach jeder
Stufe. Und deshalb rechne ich den ersten Piloten zum halben Satz, wenn ich dafür mit Namen und
Zahl darüber sprechen darf.»

**Wer haftet, wenn das System irrt.** Im Praxis-Deck geregelt (aerztliche Freigabe), im Bau nicht —
und dort steht der Fristenwaechter, der den sechsstelligen Schaden verhindern soll. Satz auf Deck
3/06: «Der Wächter erinnert, er entscheidet nicht. Die Frist bleibt in der Verantwortung des
Betriebs — das steht auch so im Vertrag.» Dazu auf 10b eine Zeile zu Haftungsbegrenzung und
Berufshaftpflicht.

**Janas datenschutzrechtliche Rolle.** Deck 4 behandelt sie durchgehend als Verantwortliche. Eine
Praxisverwaltung ist gegenueber den Praxen aber meist selbst Auftragsbearbeiterin — dann sind wir
Sub-Auftragsbearbeiter und brauchen die vorgaengige Genehmigung der Praxen. Jana kann uns dann gar
nicht allein beauftragen. Das ist die Frage, an der ein Pilot scheitert, *nachdem* er verkauft ist.

**Der Abschluss.** Die Agenda hat «75–90 Naechster Schritt», aber keine Folie dazu; der Termin
endet mit Deck 4, also mit einer Folie, die den Onkel nicht meint. Eine Schlussfolie mit vier
Zeilen zum Ausfuellen im Raum, zweimal: «Vorhaben ___ · verantwortlich bei euch ___ · Messstart
___ · naechster Termin ___». Dazu die Katalogauswahl beiden noch am Tisch per Mail schicken — der
Export existiert. Und einen Knopf «Rechnung kopieren» im Rechner: nach 15 Minuten gemeinsamem
Reglerschieben ist die einzige Zahl, auf die man sich geeinigt hat, sonst beim Schliessen des Tabs
weg.

**Verfuegbarkeit.** Nirgends steht, ob er Vollzeit verfuegbar ist, ab wann, und wie viele Piloten
er parallel tragen kann. Zwei Betriebe fragen sich das gleichzeitig. Gehoert auf Folie 10, Stufe 1.

**Colins eigene Vertraege.** Konkurrenzverbot und Geheimhaltung aus den zwei Arbeitsverhaeltnissen
kommen in der Vorbereitungsliste nicht vor. Er baut eine Agentur in derselben Region auf. Zehn
Minuten ins eigene Dossier, vor dem Termin.

---

## Verworfene Befunde

- **«Deck 3/06 behauptet, die Pfandrechtsfrist sei seit 1.1.2026 von drei auf vier Monate
  verlaengert.»** (zweimal gemeldet) — Nachgelesen: die Folie sagt schlicht «4 Monate … gerechnet
  ab Vollendung der Arbeit», die Sprechernotiz warnt ausdruecklich davor, sie als neu zu
  verkaufen, und im Cockpit steht der Pruefpunkt mit der Gegenpruefung. Bereits korrigiert. Der
  Rest des Befunds (Quellzeile «Art. 839 ZGB» liest sich wie ein Volltext-Beleg) bleibt gueltig,
  ist aber kosmetisch: Zusatz «Orientierung, keine Rechtsauskunft» genuegt.
- **«Deck 3/04 traegt den Titel: Ein Drittel *eurer* Baustelle spricht Portugiesisch. *Eure*
  Rapporte sprechen Deutsch.»** — Falsch zitiert. Der Titel lautet «Der Rapport ist auf Deutsch.
  Die Baustelle nicht.», die Kennzahlen sind Branchenzahlen mit Quelle, und die Quellzeile weist
  selbst darauf hin, dass Nationalitaeten erhoben wurden und nicht Sprachen. Die Folie behauptet
  nichts ueber Stirnimann. Nichts zu tun.
- **«Katalog 27 muss angepasst werden (Frist als Neuerung).»** — Der Eintrag nennt keine Neuerung.
  Nichts zu tun.
- **«Deck 2/03 ersatzlos streichen.»** — Folie 04 baut auf ihr auf, und die 2-%/10-%-Zahl war
  ausgerechnet der Punkt, den dieselbe Leserin als staerkstes Argument bezeichnet. Auf Kuerzen
  reduziert.
- **«Beide Spezialdecks auf 10 Minuten kuerzen und die Preisverhandlung in getrennte Termine
  verlegen.»** — Der Befund stimmt (jeder sitzt 15 Minuten daneben, und niemand sagt vor dem
  anderen als Erster zu), die Massnahme ist aber ein Umbau der Dramaturgie zwei Tage vor dem
  Termin. Uebernommen wird nur der billige Teil: der Uebergangssatz mit Auftrag statt «hoert zu» —
  «Jana, du hörst jetzt zwölf Minuten Bau. Deine Aufgabe: sag mir am Schluss, welcher der Abläufe
  bei euch genauso aussieht.» — und am Ende der Vorschlag zweier Einzeltermine als *naechster
  Schritt*, nicht als Umbau von heute.

---

## Die drei Saetze, die im Meeting wirklich zaehlen

1. «Diese Zahlen kursieren im Markt. Keine davon ist belegt — hier ist die einzige, die es ist,
   und sie ist kleiner, als euch andere erzählen.»
2. «Wer Arbeitskräfte überlässt und dabei die Weisungsbefugnis abtritt, betreibt Personalverleih —
   Bewilligung, Kaution ab 50'000, zwei Gesamtarbeitsverträge gleichzeitig. Die Idee trägt
   trotzdem, sie muss nur anders zugeschnitten werden.»
3. «Ich habe diesen Ablauf noch mit niemandem zu Ende gemacht. Ihr wärt die Ersten — deshalb
   Fixpreis, deshalb Ausstieg nach jeder Stufe, deshalb gehören euch Code und Dokumentation ab dem
   ersten Tag.»
