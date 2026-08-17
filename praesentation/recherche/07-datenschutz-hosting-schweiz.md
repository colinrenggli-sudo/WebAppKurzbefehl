# Datenschutz und Schweizer Hosting für KI-Lösungen

**Fokus:** Gesundheitsdaten (Arztpraxen, Jana Rohrer) und Personaldaten (Bau, Stirnimann Bau AG)
**Stand:** 17.08.2026

---

## 0. Methodik- und Verlässlichkeitshinweis — bitte zuerst lesen

Diese Recherche konnte **nicht** wie vorgesehen mit Live-Webrecherche erstellt werden. Zwei harte
Einschränkungen der Ausführungsumgebung:

1. **Suchbudget erschöpft.** Die Session hatte ihr Kontingent (200 von 200 Websuchen) bereits durch
   die Parallelrecherchen 01–06 verbraucht. Es war **keine einzige eigene Websuche** möglich.
2. **Egress-Sperre.** Direktabrufe wurden vom Netzwerk-Proxy blockiert für: `fedlex.admin.ch`,
   `edoeb.admin.ch`, `admin.ch`, `bag.admin.ch`, `bfs.admin.ch`, `infomaniak.com`, `exoscale.com`,
   `swisscom.ch`, `green.ch`, `nine.ch`, `hostpoint.ch`, `learn.microsoft.com`, `aws.amazon.com`,
   `huggingface.co`, `arxiv.org`, `digital-strategy.ec.europa.eu`, `wikipedia.org`, `datenrecht.ch`,
   `steigerlegal.ch`. Erreichbar war einzig `cloud.google.com`.

Konsequenz für die Kennzeichnung. Jede Aussage trägt eines dieser Labels:

| Label | Bedeutung |
|---|---|
| **[B]** | Belegt — Quelle in dieser Session abgerufen |
| **[P]** | Belegt über die Parallelrecherche desselben Projekts (Dateien 01–06, Abruf 17.08.2026) |
| **[G]** | Gesetzestext aus Modellwissen, kanonische Fundstelle genannt, **in dieser Session nicht verifizierbar** — vor Kundenverwendung im Volltext gegenlesen |
| **[S]** | Schätzung / fachliche Einordnung des Autors, keine Quelle |
| **[NB]** | Nicht belegbar |

**Verbindliche Regel für das Deck:** Alle **[G]**-Artikelnummern und alle Preis-/Produktangaben in
Abschnitt 5 sind vor dem Meeting an der Primärquelle zu prüfen. Sie sind fachlich plausibel, aber in
dieser Session nicht nachgewiesen. Keine dieser Zahlen gehört ungeprüft auf eine Folie.

---

## 1. revDSG — die Pflichten, die jedes KI-Angebot auslöst

Das revidierte Datenschutzgesetz (**DSG, SR 235.1**) ist seit **01.09.2023** in Kraft. Der EDÖB hat
klargestellt: Das DSG ist **direkt auf KI-gestützte Datenbearbeitungen anwendbar** — es braucht dafür
kein separates KI-Gesetz. **[P, Q1]**

Für beide Pitch-Adressaten relevant, in der Reihenfolge der Verkaufswirkung:

| Pflicht | Fundstelle | Was das konkret heisst | Label |
|---|---|---|---|
| **Besonders schützenswerte Personendaten** | Art. 5 lit. c DSG | Gesundheitsdaten fallen darunter, ebenso biometrische und genetische Daten sowie Daten über administrative/strafrechtliche Verfolgungen. Für die Praxis-Kundin: praktisch der gesamte Datenbestand. | **[G]** |
| **Auftragsbearbeitung** | Art. 9 DSG | Übertragung an einen Dienstleister nur zulässig, wenn (a) der Dienstleister die Daten so bearbeitet, wie der Verantwortliche selbst es dürfte, und (b) **keine gesetzliche oder vertragliche Geheimhaltungspflicht entgegensteht**. Der Verantwortliche muss sich vergewissern, dass der Auftragsbearbeiter die Datensicherheit gewährleisten kann. **Subunternehmer nur mit vorgängiger Genehmigung.** | **[G]** |
| **Datensicherheit** | Art. 8 DSG, Konkretisierung in der DSV | Angemessene technische und organisatorische Massnahmen; die Verordnung nennt Mindestanforderungen (Vertraulichkeit, Verfügbarkeit, Integrität, Nachvollziehbarkeit). | **[G]** |
| **Bearbeitungsverzeichnis** | Art. 12 DSG | Die KMU-Ausnahme (< 250 Mitarbeitende) **greift nicht** bei umfangreicher Bearbeitung besonders schützenswerter Personendaten oder Profiling mit hohem Risiko. Eine Praxisverwaltungsfirma hat das Verzeichnis also zwingend. | **[G]/[P, Q6]** |
| **Datenschutz-Folgenabschätzung (DSFA)** | Art. 22 DSG | Nötig bei hohem Risiko; ein hohes Risiko besteht **namentlich bei umfangreicher Bearbeitung besonders schützenswerter Personendaten**. Bei Ambient-Scribe, Dossier-Chat oder zentralem Praxis-Dashboard also regelmässig zu bejahen. Verbleibt trotz Massnahmen ein hohes Restrisiko: Konsultation des EDÖB (Art. 23). | **[G]/[P, Q6]** |
| **Meldung von Verletzungen** | Art. 24 DSG | Meldung an den EDÖB **«so rasch als möglich»** — nicht die 72-Stunden-Frist der DSGVO. Der Auftragsbearbeiter meldet dem Verantwortlichen. | **[G]** |
| **Automatisierte Einzelentscheidung** | Art. 21 DSG | Informationspflicht, wenn eine Entscheidung ausschliesslich automatisiert ergeht und Rechtswirkung entfaltet. Relevant für No-Show-Scoring und automatisierte Personalbewertung. | **[P, Q1]** |
| **Bearbeitungsreglement / Protokollierung** | DSV (SR 235.11) | Für Private, die besonders schützenswerte Daten in grossem Umfang automatisiert bearbeiten: Bearbeitungsreglement und Protokollierung. **Artikelnummern vor Verwendung prüfen.** | **[G] — Nummern unsicher** |

**Sanktionslogik als Verkaufsargument [G]:** Das DSG sanktioniert mit **Busse bis CHF 250'000** und
richtet sich — anders als die DSGVO — gegen **natürliche Personen**, nicht gegen den
Unternehmensumsatz. Strafbar ist unter anderem, wer vorsätzlich die Bearbeitung einem
Auftragsbearbeiter überträgt, ohne die Voraussetzungen von Art. 9 zu erfüllen, oder wer Daten unter
Verletzung der Auslandregeln bekanntgibt (Art. 60–62 DSG). Für Widerhandlungen in Geschäftsbetrieben
kann bei Bussen bis CHF 50'000 das Unternehmen belangt werden (Art. 64 DSG i.V.m. VStrR).
*Pitch-Übersetzung:* Es haftet der Geschäftsführer persönlich, nicht die AG. Das trifft Onkel und
Cousine gleichermassen — und ist das wirksamste Argument für saubere Verträge.

---

## 2. Bekanntgabe ins Ausland (Art. 16/17 DSG)

**[G] Grundregel Art. 16 Abs. 1:** Bekanntgabe ins Ausland nur, wenn der **Bundesrat** festgestellt
hat, dass der Zielstaat einen angemessenen Datenschutz gewährleistet. Diese Länderliste steht in
**Anhang 1 der Datenschutzverordnung (DSV, SR 235.11)**.

**[G] Ohne Angemessenheitsbeschluss** (Art. 16 Abs. 2) braucht es Garantien: Standarddatenschutz-
klauseln, die der EDÖB genehmigt/anerkannt hat (in der Praxis: die EU-SCC mit Schweizer Anpassungen),
verbindliche unternehmensinterne Datenschutzvorschriften (BCR), einen Staatsvertrag oder
vorgängig dem EDÖB mitgeteilte Vertragsklauseln.

**[G] USA — der Sonderfall.** Die USA stehen auf der Liste **nur für Unternehmen, die unter dem
Swiss-U.S. Data Privacy Framework zertifiziert sind**. Der Bundesrat anerkannte das Framework 2024
(Inkraftsetzung nach meinem Kenntnisstand 15.09.2024 — **Datum zwingend verifizieren**). Praktische
Folge: Ein US-Anbieter ist nicht automatisch zulässig, sondern nur bei **aktiver DPF-Zertifizierung**,
die auf der Liste des US-Handelsministeriums nachprüfbar ist. Und: Das DPF deckt die
**Geheimhaltungspflicht nach Art. 321 StGB nicht ab** — das ist eine separate, strengere Hürde.

**[G] Ausnahmen (Art. 17):** ausdrückliche Einwilligung, Vertragserfüllung mit der betroffenen Person,
Rechtsansprüche, Schutz von Leben und Unversehrtheit. Für den Dauerbetrieb einer KI-Lösung sind sie
untauglich — sie tragen Einzelfälle, keinen Regelbetrieb.

---

## 3. Ärztliches Berufsgeheimnis (Art. 321 StGB) — der eigentliche Engpass

Das ist der Punkt, an dem Jana Rohrers Geschäft steht oder fällt, und er wird in Verkaufsgesprächen
regelmässig unterschätzt: **Datenschutzkonformität genügt nicht.**

**[P, Q2]** Ärztinnen, Ärzte und **ihre Hilfspersonen** unterstehen dem Berufsgeheimnis nach
**Art. 321 StGB**; die Strafdrohung beträgt bis zu **drei Jahre Freiheitsstrafe**, und sie gilt auch
nach Aufgabe der Berufsausübung. Die Liste der erfassten Berufe wurde per Revision auf weitere
Gesundheitsberufe (u. a. Pflegefachpersonen, Psychologen, Physiotherapeuten) ausgedehnt **[G]**.

**[P, Q3]** Cloud- und KI-Verarbeitung ist zulässig, wenn der Anbieter **vertraglich als
weisungsgebundene Hilfsperson in einem Subordinationsverhältnis** eingebunden wird und
technisch-organisatorische Massnahmen das Geheimnis wahren — **insbesondere Verschlüsselung mit
Schlüsselkontrolle beim Leistungserbringer**. Die tragende Fachpublikation dazu ist David Rosenthal,
«Mit Berufsgeheimnissen in die Cloud» **[P, Q4]**; der rechtliche Leitfaden von FMH/SAMW ist die
verbandsseitige Referenz **[P, Q3]**.

**[S] Einordnung, ehrlich gesagt:** Das ist herrschende Lehre und gelebte Praxis, aber **keine
höchstrichterlich abschliessend geklärte Frage**. Die Kernidee: Wer den Daten technisch nicht
zugänglich ist (starke Verschlüsselung, Schlüssel bleibt beim Arzt), «offenbart» nichts im Sinne von
Art. 321. Sobald ein Modell Klartext sieht — und das tut jedes LLM bei der Inferenz — greift diese
Argumentation nicht mehr, und es braucht die Hilfspersonen-Konstruktion plus Datenlokalisierung.

**Drei Konsequenzen für das Angebot [S]:**
1. Der Auftragsbearbeitungsvertrag braucht eine **explizite Berufsgeheimnis-Klausel** (Hilfspersonen-
   stellung, Weisungsbindung, Schweigepflicht der Mitarbeitenden, Strafandrohung), nicht nur die
   DSG-Standardklauseln.
2. **Sub-Auftragsbearbeiter sind das Leck.** Art. 9 Abs. 3 DSG verlangt vorgängige Genehmigung; bei
   US-Hyperscalern als Unterlieferanten ist die Hilfspersonen-Kette faktisch nicht mehr kontrollierbar.
3. **EPD-Kontext [P, Q5]:** Der Anschluss an das elektronische Patientendossier ist heute nur für seit
   2022 neu zugelassene Praxen verpflichtend; eine Anschlusspflicht für den ganzen ambulanten Sektor
   wird mit der EPDG-Revision erwartet (Zeitachse 2027–2029 ist eine **Prognose**, keine Rechtslage).
   Ob das EPDG zwingend Hosting in der Schweiz vorschreibt: **[NB]** in dieser Session — die
   Zertifizierungsanforderungen an Stammgemeinschaften sind vor einer Zusage zu prüfen.

---

## 4. Personaldaten am Bau — die unterschätzte Parallele

**[S/P, Q7]** Rapportdaten sind Personendaten. Kritisch werden sie in drei Ausprägungen:

- **Standortdaten** aus Tagesrapport-Apps und Maschinentelematik → Bewegungsprofile von Mitarbeitenden.
- **Leistungsbewertung** durch Auswertung von Rapportdaten → Profiling; bei hohem Risiko DSFA-pflichtig.
- **Gesundheitsdaten** über Unfallmeldungen und Absenzen → besonders schützenswert, gleiche Kategorie
  wie beim Arzt.

**[S]** Zusätzlich, arbeitsrechtlich und nicht datenschutzrechtlich: **Art. 26 ArGV 3** verbietet
Überwachungssysteme, die das Verhalten der Arbeitnehmenden am Arbeitsplatz überwachen. Zulässig ist
Erfassung zu Leistungs- oder Sicherheitszwecken, nicht zur Verhaltenskontrolle. **Artikel und
Wortlaut vor Verwendung prüfen** — in dieser Session nicht verifizierbar. Das ist der Satz, mit dem
man beim Onkel Vertrauen gewinnt: Nicht «wir tracken alles», sondern «wir erfassen den Rapport, nicht
den Menschen».

---

## 5. Schweizer Hosting- und KI-Optionen

**Wichtig: Der gesamte folgende Abschnitt ist [V]/[S].** Alle Anbieterangaben stammen aus Modellwissen
(Stand Mai 2026) bzw. aus der Parallelrecherche; **keine Preisangabe konnte in dieser Session
verifiziert werden**. Modellverfügbarkeiten je Region ändern monatlich.

| Anbieter | Standort CH | LLM-Betrieb möglich? | Einordnung |
|---|---|---|---|
| **Infomaniak** | RZ Genf / Winterthur | **Ja** — eigene «AI Tools»-API mit Open-Weight-Modellen, OpenAI-kompatibel | Schweizer Eigentümer, **nicht dem US CLOUD Act unterstellt**, ISO 27001, Aussage «kein Training auf Kundendaten». Für KMU der pragmatischste Einstieg. **[P, Q8] + [S]** |
| **Swisscom** | CH | **Ja** — GenAI-/AI-Plattform mit Llama-Modellen und Whisper, seit Frühjahr 2025 | Schweizer Anbieter mit Gesundheits-Track-Record (Swisscom Health/Curabill). Höchste Akzeptanz bei konservativen Entscheidern. **[P, Q8] + [S]** |
| **Exoscale** | Zonen Genf + Zürich | **Ja**, als IaaS mit GPU-Instanzen (Eigenbetrieb) | Schweizer Cloud, gehört zur A1-Digital-Gruppe (AT). Für selbst betriebene Modelle. Preise **[NB]** |
| **Green** | Lupfig / Zürich | Colocation + GPU-Angebote | Für eigene Hardware oder GPU-Miete. **[S]** |
| **Nine** | Zürich | Managed Kubernetes / PaaS | Betriebspartner, kein LLM-Anbieter im engeren Sinn. **[S]** |
| **Hostpoint** | Rapperswil | **Nein** für LLM-Betrieb | Klassisches Web-/Mail-Hosting. **[S]** |
| **Safe Swiss Cloud** | CH | «Private AI»-Angebot | **[P, Q8]** |
| **Microsoft Azure** | Switzerland North (ZH), Switzerland West (GE) | Azure OpenAI in Switzerland North je nach Modell | **US-Konzern → CLOUD Act bleibt das Thema**, trotz Schweizer Region. Für Art. 321 StGB heikel. **[S]** |
| **Google Cloud** | **europe-west6 (Zürich), 3 Zonen — bestätigt [B, Q9]** | Vertex AI / Gemini in europe-west6: **[NB]**, Doku-Abruf blockiert | Gleiche CLOUD-Act-Problematik. **[B]** nur für Existenz der Region. |
| **AWS** | Europe (Zurich), `eu-central-2` | Bedrock-Verfügbarkeit in Zürich **[NB]** | **[S]**, Region und Bedrock-Support vor Zusage prüfen. |

**[S] Verkaufsregel daraus:** Für Arztpraxen sind **Infomaniak und Swisscom** die verteidigbaren
Antworten; für den Bau sind auch Azure/GCP Schweiz vertretbar, solange keine Gesundheitsdaten
fliessen. Die Schweizer Region eines US-Konzerns löst das Datenschutzproblem, aber nicht das
CLOUD-Act- und nicht das Berufsgeheimnis-Problem.

---

## 6. Open-Weight-Modelle für den Eigenbetrieb

Alle Angaben **[S]** aus Modellwissen (Stand Mai 2026), Lizenzen vor kommerzieller Nutzung prüfen.

| Modell | Herkunft | Lizenz | Reife / Eignung |
|---|---|---|---|
| **Apertus** (8B / 70B) | **Swiss AI Initiative — ETH Zürich, EPFL, CSCS**; trainiert auf «Alps» | Apache 2.0, vollständig offen (Gewichte, Daten, Rezept) | Der **politisch stärkste Aufhänger für einen Schweizer Pitch**: ein Schweizer Modell aus öffentlicher Forschung. Qualität unter den US-Spitzenmodellen. Release 2025 — **Datum und Grössen verifizieren**. |
| **Llama** (Meta) | USA | Llama Community License — **nicht OSI-offen**, Nutzungsbeschränkungen und Namensnennungspflicht | Reifster Open-Weight-Stack, breiteste Tool-Unterstützung. |
| **Mistral** | Frankreich (EU) | Kleinere Modelle Apache 2.0, grosse unter eigener Lizenz | Gute Deutsch-/Französisch-Leistung, EU-Anbieter — für Datenschutzargumentation angenehm. |
| **Qwen** | China (Alibaba) | überwiegend Apache 2.0 | Technisch stark, aber **Herkunftsfrage** bei konservativen Schweizer Kunden. |
| **gpt-oss** (OpenAI) | USA | Apache 2.0 | Offene Gewichte, lokal betreibbar. |

**[S] Hardwarebedarf, Faustregeln (keine Messwerte):**
- 7–8B-Modell, 4-Bit-Quantisierung: ca. 6–8 GB VRAM → läuft auf einer einzelnen Consumer-GPU.
- 70B-Modell, 4-Bit: ca. 40–48 GB VRAM → 1× H100 80 GB oder 2× 48-GB-Karten.
- **Ehrliche Einordnung:** Eigenbetrieb lohnt sich für Colins Kunden **nicht** bei kleinen Volumina.
  Der Schweizer API-Anbieter ist fast immer die richtige Antwort; Eigenbetrieb ist ein Argument für
  Souveränität, kein Kostenargument.

---

## 7. EU AI Act und Schweizer KI-Regulierung

**EU AI Act [P, Q10]:** Die Schweiz ist nicht direkt gebunden, **Anbieter mit EU-Bezug schon** — die
Verordnung erfasst auch Drittstaaten-Anbieter, deren Systeme oder deren Output in der EU verwendet
werden. Der **Digital Omnibus** (Kommissionsvorschlag November 2025, in Kraft 27.07.2026) verschiebt
die Hochrisiko-Pflichten: **Annex-III-Systeme auf den 02.12.2027**, produktintegrierte KI nach Annex I
auf den **02.08.2028**; Einigung Rat/Parlament am 07.05.2026.

**Schweiz [P, Q11]:** Bundesratsentscheid **12.02.2025** — Ratifikation der KI-Konvention des
Europarats, **sektorieller Ansatz** statt eines eigenen KI-Gesetzes. Das EJPD erstellt **bis Ende 2026**
eine Vernehmlassungsvorlage zu Transparenz, Datenschutz, Nichtdiskriminierung und Aufsicht.

**[S] Pitch-Übersetzung:** «Eine Regulierung ist unterwegs, aber noch nicht in Kraft. Wer heute
Governance mitbaut, hat in zwei Jahren keinen Umbau.» Das ist ein Verkaufsargument, keine
Panikmache — und es ist ehrlich.

---

## 8. Praktische Faustregeln für den Alltag

**[S] Was darf in ein US-LLM — die Ampel für Colins Kunden:**

| Grün — unproblematisch | Gelb — nur pseudonymisiert / mit ABV | Rot — nie |
|---|---|---|
| Öffentliche Ausschreibungstexte, Normtexte | Interne Prozessdokumente ohne Namen | Patientendaten in jeder Form |
| Marketingtexte, Website-Inhalte | Anonymisierte Fallbeschreibungen | Diagnosen, Befunde, Medikation |
| Generischer Code, Vorlagen | Aggregierte Kennzahlen ohne Personenbezug | Namen + Gesundheitsdaten kombiniert |
| Allgemeine Fachfragen | Lieferanten-/Firmendaten | Personaldossiers, AHV-Nummern, Lohndaten |
| | | Bewerbungsunterlagen |

**[S] Pseudonymisierung — die ehrliche Warnung:** Namen ersetzen genügt bei **Freitext nicht**. Ein
Arztbericht bleibt über Kontext (Alter, Diagnose, Ort, Zeitpunkt) re-identifizierbar. Pseudonymisierte
Daten sind für denjenigen, der re-identifizieren kann, weiterhin Personendaten. Pseudonymisierung
senkt das Risiko, sie beendet die Rechtspflichten nicht.

**[S] Checkliste Auftragsbearbeitungsvertrag (ABV) — was drinstehen muss:**
1. Weisungsbindung und Zweckbindung (Art. 9 Abs. 1 DSG)
2. Liste der Sub-Auftragsbearbeiter + **vorgängige Genehmigungspflicht** (Art. 9 Abs. 3 DSG)
3. Technische und organisatorische Massnahmen, benannt und prüfbar (Art. 8 DSG)
4. **Bearbeitungsort** explizit: «ausschliesslich Schweiz»
5. **Ausschluss der Trainingsnutzung** — ausdrücklich, nicht «nach Wahl des Anbieters»
6. Meldepflicht an den Verantwortlichen bei Sicherheitsverletzungen (Art. 24 Abs. 3 DSG)
7. Löschung und Rückgabe bei Vertragsende, mit Frist
8. Auditrecht bzw. Vorlage von Zertifikaten (ISO 27001)
9. **Bei Arztpraxen zusätzlich:** Berufsgeheimnis-/Hilfspersonenklausel nach Art. 321 StGB

**[S/V] «Keine Trainingsnutzung» — Anbieterlage:** Die grossen API-Anbieter (OpenAI-API, Azure OpenAI,
Anthropic-API, Google Vertex AI) sagen für ihre **Geschäfts-APIs** zu, Kundendaten nicht zum Training
zu verwenden; teils sind Zero-Retention-Vereinbarungen erhältlich. **Für Consumer-Abos gilt das
nicht** — die kostenlosen Chat-Oberflächen sind der eigentliche Compliance-Unfall im KMU-Alltag.
Diese Zusagen konnten in dieser Session **nicht verifiziert werden [NB]** und sind vor jeder
Kundenaussage am aktuellen Vertragstext zu prüfen.

---

## 9. Was ausdrücklich nicht belegbar ist

Diese Punkte gehören **nicht** ins Deck, solange sie nicht nachrecherchiert sind:

- **Sämtliche Preise** für Infomaniak AI Tools, Swisscom AI-Plattform, Exoscale GPU-Instanzen. **[NB]**
- Verfügbarkeit von Vertex AI / Gemini und AWS Bedrock in den Schweizer Regionen. **[NB]**
- Das genaue Inkraftsetzungsdatum des Swiss-U.S. Data Privacy Framework. **[G, zu prüfen]**
- Release-Datum, Modellgrössen und Lizenz von Apertus im Detail. **[S, zu prüfen]**
- Ob das EPDG Hosting in der Schweiz zwingend vorschreibt. **[NB]**
- Alle DSV-Artikelnummern (Bearbeitungsreglement, Protokollierung) und Art. 26 ArGV 3. **[G, zu prüfen]**
- Marktanteile oder Kundenzahlen Schweizer KI-Hoster. **[NB]**

**Empfehlung an den Auftraggeber:** Diese Recherche vor dem Pitch mit erhöhtem Suchbudget und
freigeschaltetem Zugriff auf `fedlex.admin.ch` und `edoeb.admin.ch` wiederholen. Die juristische
Struktur in den Abschnitten 1–4 ist belastbar; die Artikelnummern und alle Anbieterzahlen sind es
in dieser Fassung nicht.

---

## Quellen

**A. In dieser Session abgerufen**

1. **Google Cloud — Cloud locations** — https://cloud.google.com/about/locations — Abruf 17.08.2026 —
   *Herstellerdokumentation. Bestätigt: Region `europe-west6` (Zürich, Schweiz) mit 3 Zonen.
   Verlässlichkeit: hoch für die Existenz der Region; enthält keine Angaben zu Vertex AI/Gemini.*

**B. Über die Parallelrecherche desselben Projekts belegt (Abruf 17.08.2026, Dateien 01–06)**

2. **Q1 — EDÖB, «Geltendes Datenschutzgesetz ist auf KI direkt anwendbar»** —
   https://www.edoeb.admin.ch/de/update-geltendes-datenschutzgesetz-ist-auf-ki-direkt-anwendbar
   sowie https://www.edoeb.admin.ch/de/ki-und-datenschutz — *Amtliche Aufsichtsbehörde.
   Verlässlichkeit: hoch.* (via `01-kmu-ki-schweiz.md` [21], `05-bau-ki-usecases.md` [15])
3. **Q2/Q3 — FMH/SAMW, Rechtlicher Leitfaden, Kap. 7.1 Berufsgeheimnis und 7.2 Datenschutz** —
   https://leitfaden.samw.fmh.ch/rechtlicher-leitfaden/7-berufsgeheimnis-datenschutz/71-berufsgeheimnis-arzt.cfm
   und https://leitfaden.fmh.ch/rechtlicher-leitfaden/7-berufsgeheimnis-datenschutz/72-datenschutz-arzt.pdf
   — *Verband/Akademie. Verlässlichkeit: sehr hoch.* (via `02` [56][57], `03` Q54/Q57)
4. **Q4 — David Rosenthal, «Mit Berufsgeheimnissen in die Cloud» (PDF)** —
   https://www.rosenthal.ch/downloads/Rosenthal-CloudLawfulAccess.pdf — *Fachjuristische Publikation.
   Verlässlichkeit: hoch.* (via `03` Q55)
5. **Q5 — BAG / eHealth Suisse zum EPD und zur EPDG-Revision** —
   https://www.bag.admin.ch/de/epd-weiterentwickeln-totalrevision und
   https://www.e-health-suisse.ch/koordination/elektronisches-patientendossier/aktueller-stand —
   *Amtlich, Bund/Kantone. Verlässlichkeit: hoch; die Zeitachse 2027–2029 ist eine Prognose.*
   (via `02` [44][45], `03` Q11/Q12)
6. **Q6 — HIN, «Neues Datenschutzgesetz: Was Akteure des Gesundheitswesens wissen müssen»** —
   https://www.hin.ch/de/blog/2023/ndsg-gesundheitswesen-teil-1.cfm — *Anbieter mit Fachbezug.
   Verlässlichkeit: mittel-hoch.* (via `02` [58], `03` Q56)
7. **Q7 — revDSG-Einordnung für Bau-/Rapportdaten** — abgeleitet aus `05-bau-ki-usecases.md`,
   Abschnitt 5, gestützt auf Q1. *Verlässlichkeit: mittel (Einordnung, kein Primärbeleg).*
8. **Q8 — Schweizer KI-Hosting-Übersicht (Infomaniak, Swisscom GenAI Studio, Safe Swiss Cloud)** —
   https://mydata.ch/schweizer-ki-anbieter — *Anbietervergleich. Verlässlichkeit: niedrig-mittel —
   Eigen- und Fremdangaben, nicht unabhängig geprüft.* (via `03` Q20)
9. **Q10 — EU AI Act / Digital Omnibus** — https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/
   und https://consulting.tuv.com/aktuelles/ki-im-fokus/digital-omnibus-ki-verordnung-fristen —
   *Anwaltskanzlei (hoch) und Prüfdienstleister (mittel-hoch).* (via `03` Q60/Q61)
10. **Q11 — Bundesrat, Medienmitteilung 12.02.2025, «KI-Regulierung: Bundesrat will Konvention des
    Europarats ratifizieren»** — https://www.admin.ch/gov/de/start/dokumentation/medienmitteilungen/bundesrat.msg-id-104110.html
    — *Amtlich. Verlässlichkeit: sehr hoch.* (via `01` [22], `03` Q62)

**C. Kanonische Fundstellen — in dieser Session blockiert, Inhalt aus Modellwissen [G]**

11. **Bundesgesetz über den Datenschutz (DSG), SR 235.1**, in Kraft seit 01.09.2023 —
    https://www.fedlex.admin.ch/eli/cc/2022/491/de — **Abruf am 17.08.2026 vom Egress-Proxy
    blockiert.** *Amtliche Rechtssammlung, Verlässlichkeit der Quelle: sehr hoch — die hier
    wiedergegebenen Artikelinhalte stammen jedoch aus Modellwissen und sind zu verifizieren.*
12. **Verordnung über den Datenschutz (DSV), SR 235.11**, inkl. **Anhang 1** (Staaten mit
    angemessenem Datenschutz) — https://www.fedlex.admin.ch/eli/cc/2022/568/de — **blockiert.**
    *Gleiche Einordnung wie Nr. 11. Insbesondere die Artikelnummern zu Bearbeitungsreglement und
    Protokollierung sind unsicher.*
13. **Schweizerisches Strafgesetzbuch, Art. 321 (Verletzung des Berufsgeheimnisses), SR 311.0** —
    https://www.fedlex.admin.ch/eli/cc/54/757_781_799/de — **blockiert.** *Inhaltlich abgestützt
    durch Q2/Q3/Q4 (Abruf via Parallelrecherche), Wortlaut nicht verifiziert.*
14. **Bundesgesetz über das elektronische Patientendossier (EPDG), SR 816.1** —
    https://www.fedlex.admin.ch/eli/cc/2017/203/de — **blockiert.** *Kontext über Q5 abgestützt.*
15. **Verordnung 3 zum Arbeitsgesetz (ArGV 3), SR 822.113**, Überwachung am Arbeitsplatz —
    https://www.fedlex.admin.ch/eli/cc/1993/2553_2553_2553/de — **blockiert.** *Artikelnummer 26
    aus Modellwissen, unsicher.*
16. **EDÖB — Künstliche Intelligenz** — https://www.edoeb.admin.ch/de/ki-und-datenschutz —
    **direkter Abruf blockiert**, Inhalt über Q1 (Suchindex der Parallelrecherche) abgestützt.

**Blockierte Hosts (Egress-Proxy, 17.08.2026):** fedlex.admin.ch · edoeb.admin.ch · admin.ch ·
bag.admin.ch · bfs.admin.ch · infomaniak.com · exoscale.com · swisscom.ch · green.ch · nine.ch ·
hostpoint.ch · learn.microsoft.com · docs.cloud.google.com · aws.amazon.com · huggingface.co ·
arxiv.org · digital-strategy.ec.europa.eu · de.wikipedia.org · datenrecht.ch · steigerlegal.ch ·
inside-it.ch · netzwoche.ch. **Websuche:** Kontingent der Session (200/200) vor Beginn dieser
Teilrecherche erschöpft.
