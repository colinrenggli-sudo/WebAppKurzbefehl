# KI- und Software-Anwendungsfaelle fuer Arztpraxen und Praxisverwalter (Schweiz)

Recherchestand: 17. August 2026. Zielgruppe: Jana Rohrer, COO einer Praxisverwaltungsfirma.
Schweizer Rechtschreibung, durchgaengig "ss".

**Lesehinweis zur Kennzeichnung**
`[B]` = belegt mit Quelle. `[V]` = Herstellerangabe/Vendor-Claim, nicht unabhaengig geprueft.
`[S]` = eigene Schaetzung/Annahme von Colin Renggli, keine Quelle. `[A]` = Angabe veraltet.

---

## 1. Warum jetzt: vier belegte Ausloeser

**1. Tarifumstellung als Zwangsereignis.** Seit dem 1. Januar 2026 rechnen ambulante Arztleistungen
in der Schweiz ueber TARDOC und Ambulante Pauschalen ab; TARMED ist abgeloest. Eine gemischte
Abrechnung ist unzulaessig, 315 neue Pauschalen kommen hinzu. Leistungen bis 31.12.2025 laufen
weiter ueber TARMED, auch wenn erst 2026 fakturiert wird. `[B, Q1, Q2]`
Entscheidend fuer den Vertrieb: TARDOC rechnet **Zeitleistungen in 1-Minuten-Schritten** ab
(Ausnahme: Kapitel AA, CA und JR mit 5-Minuten-Basis, ab der 6. Minute minutengenau), und
**die verrechnete Leistung muss aus der Patientendokumentation nachvollziehbar sein**. `[B, Q3, Q4]`
Das macht Dokumentationsqualitaet zum Abrechnungsrisiko - nicht zur Kuer.

**2. Arztpraxen sind digitales Schlusslicht.** Im Digital Health Report 2025/2026 (Interpharma/ZHAW,
Oktober 2025) erreichen Arztpraxen **3,4 von 10 Punkten** digitale Reife - hinter Spitaelern (4,6),
Krankenversicherern (6,0) und Pharmaunternehmen (6,8). Untersucht wurden sechs Akteursgruppen. `[B, Q5, Q6]`

**3. Der Engpass ist Zeit und Personal, nicht Nachfrage.** In der gfs.bern-Befragung im Auftrag der FMH
(publiziert 12.11.2025, n = 1'532, davon 330 praxisambulant) geben Aerztinnen und Aerzte
**114 Minuten pro Tag fuer Arbeiten am Patientendossier** an; praxisambulant kommen
**54 Minuten pro Tag** allein fuer Anforderungen von Behoerden und Versicherungen dazu. `[B, Q7]`
Parallel fehlen MPA: 150-200 offene Stellen schweizweit, ueber 250 allein im Kanton Zuerich. `[B (verbandsnah), Q8]`

**4. Regulatorischer Rueckenwind.** E-Rezept Schweiz (FMH/pharmaSuisse) hat im Maerz 2026 erstmals
100'000 E-Rezepte pro Monat erreicht; der Nationalrat hat sich im Maerz 2026 fuer ein Obligatorium
ausgesprochen, eine Pflicht ist ab 2029 im Gespraech. `[B, Q9, Q10]`
Beim elektronischen Patientendossier hat der Bundesrat am 5.11.2025 die Botschaft zum
elektronischen Gesundheitsdossier (E-GD) ans Parlament ueberwiesen: Opt-out fuer die Bevoelkerung,
**Anschlusspflicht auch fuer den ambulanten Bereich**, Abloesung des EPD fruehestens 2030. `[B, Q11, Q12]`

---

## 2. Marktumfeld: worauf man aufsetzt

| Baustein | Stand | Quelle |
|---|---|---|
| Arztpraxen/ambulante Zentren CH | rund 14'200 Standorte (BFS-Erhebung MAS, seit 2015 jaehrlich); 2015: 14'217 Standorte, ca. 17'600 Aerzte | `[B, A]` Q13 |
| Praxissoftware (PIS) | vitomed ca. 5'000 Aerzte; WinMed >2'000; Axenita >1'400 Cloud-Praxen; tomedo wachsend | `[V]` Q14, Q15 |
| Terminplattform | OneDoc (gegr. 2017): >20 Mio. gebuchte Termine, 2,6 Mio. registrierte Patienten, >10'500 Fachpersonen; hat Medicosearch uebernommen | `[V]` Q16 |
| Sichere Kommunikation | HIN (1996 von FMH mitgegruendet): ca. 14'500 Abonnenten, >350 angeschlossene Institutionen | `[V]` Q17 |
| Praxisgruppen | Sanacare: >20 Gruppenpraxen in 14 Staedten, ca. 500 Fachpersonen; Santemed (Medbase-Mehrheit): 23 Praxen | `[B]` Q18, Q19 |
| Schweizer KI-Hosting | Infomaniak (RZ Genf/Zuerich, ISO 27001, nicht US-CLOUD-Act-unterstellt), Swisscom GenAI Studio (seit Fruehjahr 2025: Llama 8B/70B, Whisper), Safe Swiss Cloud Private AI | `[V]` Q20 |

**Bemerkenswert regional:** Das Luzerner Kantonsspital betreibt einen digitalen Symptomchecker auf
Basis von Ada Health. `[B, Q21]` Fuer einen Pitch in der Zentralschweiz ein naheliegender Referenzpunkt.

---

## 3. Anwendungsfaelle

Legende Regulatorik: **MP?** = Medizinprodukt-Frage MepV/MDR pruefen. **BG** = Berufsgeheimnis
Art. 321 StGB / Auftragsbearbeitung Art. 9 DSG relevant. **DSFA** = Datenschutz-Folgenabschaetzung
wahrscheinlich noetig. Aufwandsangaben sind durchgaengig `[S]`, sofern nicht anders vermerkt.

### Cluster A - Telefon und Erreichbarkeit

| # | Use Case | Was es tut | Anbieter heute | Nutzen | Aufwand `[S]` | Reg. |
|---|---|---|---|---|---|---|
| 1 | KI-Telefonassistent / Voice Agent | Nimmt Anrufe an, bucht/verschiebt Termine, nimmt Rezept- und Ueberweisungsanliegen auf | Doctolib/Aaron.ai (DE, Uebernahme Mai 2024), CGM one TelefonAssistent, VITAS; CH-Anbieter mit Dialektfokus: Suisse Voice, fonea | DE-Praxen: 950-1'000 Anrufe/Monat ≈ 45 Arbeitsstunden; Anbieter nennt 60% weniger Unterbrechungen am Empfang `[V, Q22, Q23]` | 8-20k CHF Setup + 300-900 CHF/Monat | BG, DSFA |
| 2 | Rueckruf- und Anliegen-Ticketing | Anrufgrund wird strukturiert erfasst, priorisiert, an die richtige Rolle geroutet statt Zettel | Modul der Voice-Agent-Anbieter; generisch via Workflow-Tools | Kein belastbarer CH-Nutzenbeleg gefunden - **nicht belegbar** | 5-12k CHF | BG |
| 3 | Digitale Triage / Symptomcheck vorgelagert | Strukturierte Ersteinschaetzung vor Terminvergabe | Ada Health (im Einsatz beim LUKS), Infermedica (5 Triage-Stufen), Medgate/Medi24/sante24 als arztbasierte Callcenter | Einsatz belegt `[B, Q21, Q24]`, quantifizierter Praxisnutzen **nicht belegbar** | 10-30k CHF Integration | **MP?** hoch, BG, DSFA |

### Cluster B - Termine und No-Shows

| # | Use Case | Was es tut | Anbieter heute | Nutzen | Aufwand `[S]` | Reg. |
|---|---|---|---|---|---|---|
| 4 | Online-Terminbuchung mit PIS-Sync | Bidirektionale Synchronisation mit der Praxisagenda | OneDoc (Konnektoren u.a. zu vitomed), Medicosearch, PIS-eigene Portale | Terminsync in Sekunden inkl. Absagen `[V, Q16, Q25]` | 2-6k CHF Setup + Plattformgebuehr | BG |
| 5 | Automatisierte Terminerinnerung | SMS/E-Mail 24-48 h vorher | Standardfunktion in OneDoc/PIS | **Bester Beleg:** Cochrane-Review (Gurol-Urganci et al. 2013): SMS-Erinnerung erhoeht Terminwahrnehmung, RR 1,10 (95% CI 1,03-1,17), 4 RCTs, n = 3'547; SMS gleich wirksam wie Telefonanruf, aber nur 55-65% der Kosten `[B, A, Q26]` | 1-3k CHF | BG (Inhalt knapp halten) |
| 6 | Warteliste mit Nachrueck-Automatik | Frei werdender Slot wird automatisch angeboten | Funktion in Terminplattformen | **nicht belegbar** in CH-Zahlen | 3-8k CHF | BG |
| 7 | No-Show-Risikoscore / Ueberbuchung | Modell schaetzt Ausfallwahrscheinlichkeit, steuert Doppelbelegung | Kein etablierter CH-Anbieter gefunden | DE-Referenzwerte: KBV Q1/2023 22% nicht wahrgenommene fachaerztliche Online-Termine (Psychotherapie 27%); Reviewauswertung ca. 23% Durchschnitt `[V/DE-Kontext, Q27]` | 15-40k CHF (Datenprojekt) | DSFA, Fairness-Risiko |

### Cluster C - Dokumentation

| # | Use Case | Was es tut | Anbieter heute | Nutzen | Aufwand `[S]` | Reg. |
|---|---|---|---|---|---|---|
| 8 | **Ambient Documentation** | Hoert der Konsultation zu, erzeugt strukturierten Verlaufseintrag zur aerztlichen Freigabe | Microsoft Dragon Copilot (seit 2025 in CH), Nabla, Abridge, DeepScribe; CH-Integration: Medicusdata in Axenita; Uebersicht: mdai.ch (96+ geprueft) | **RCT, NEJM AI:** 238 ambulante Aerzte, 14 Fachrichtungen, Nov 2024-Jan 2025, DAX Copilot vs. Nabla vs. Usual Care. Ein System senkte die Dokumentationszeit um **ca. 10%**, das andere ohne signifikanten Effekt; Time-in-Note Nabla −41 Sek., DAX −23 Sek. gegen −18 Sek. in der Kontrolle. Burnout und Zufriedenheit verbesserten sich in beiden Armen. `[B, Q28, Q29]` **Beobachtungsdaten Kaiser Permanente:** 7'260 Aerzte, ca. 2,5 Mio. Konsultationen, Okt 2023-Dez 2024: geschaetzt 15'791 eingesparte Stunden ueber 63 Wochen (≈1'794 Achtstundentage), Nachdokumentation −1,03 Min./Termin; 84% berichten bessere Patientenbindung, 82% hoehere Arbeitszufriedenheit `[B, Q30, Q31]` | Lizenz int. ca. USD 39-119/Monat Self-Serve, Nabla ab ca. USD 100, Abridge ca. USD 208, Dragon Copilot ca. USD 400-600 pro Behandelnde/Monat `[V, Q32]`; Einfuehrung 10-25k CHF | **MP?** (bei Vorschlaegen mit klinischer Aussage), BG, DSFA |
| 9 | Diktat / medizinische Spracherkennung | Diktat direkt ins PIS | Nuance Dragon Medical One (in CH gehostet), Medicusdata | Reseller-Angabe: CHF 1'500/Jahr inkl. Hosting und Updates, >300'000 Fachbegriffe, >99% Erkennungsrate `[V, Q33]` | 1,5-4k CHF/Jahr/Arbeitsplatz | BG |
| 10 | Zuweiser-/Arztbericht als Entwurf | LLM erstellt Berichtsentwurf aus Dossier und Diktat | Funktion in Ambient-/Diktatprodukten, tomedo.Intelligence | Kein unabhaengiger CH-Beleg - **nicht belegbar** | 10-20k CHF | **MP?**, BG |
| 11 | Posteingang klassifizieren und zuordnen | Scannen, OCR, Dokumentart erkennen, Patient zuordnen, in den richtigen Postkorb | cent systems (CH), adeon (CH), DMS-Anbieter mit LLM-Klassifikation | Funktionsweise belegt `[B, Q34, Q35]`, Zeitersparnis in Zahlen **nicht belegbar** | 12-30k CHF | BG |
| 12 | Dossier-Chat / Karteichat | Fragen an das Patientendossier in natuerlicher Sprache | tomedo.Intelligence (Karteichat), cent systems Smart Archive Chatbot | **nicht belegbar** | 15-35k CHF | **MP?**, BG, DSFA |

### Cluster D - Rezepte, Labor, Patientenkommunikation

| # | Use Case | Was es tut | Anbieter heute | Nutzen | Aufwand `[S]` | Reg. |
|---|---|---|---|---|---|---|
| 13 | Wiederholungsrezept-Workflow / E-Rezept | Anfrage digital erfassen, Arzt bestaetigt in Sammelfreigabe, E-Rezept mit QR-Code | E-Rezept Schweiz (FMH/pharmaSuisse), Zur Rose Rezept-Erneuerungsanfrage, PIS-Module | E-Rezept: 100'000/Monat im Maerz 2026, ueber 470'000 im Vorjahr `[B, Q9, Q10]`; DE-Schaetzung 20-35% der Anrufe entfallen auf Rezeptanfragen `[V/DE, Q36]` | 5-15k CHF | BG |
| 14 | Laborbefund-Kommunikation | Befund automatisch ins Laborblatt, Freigabe und Mitteilung via Portal statt Telefon | vitomed (Auto-Uebernahme externer Labors), MediData, Befundportale | Funktion belegt `[V, Q15, Q37]`, Zeitersparnis **nicht belegbar** | 4-10k CHF | BG, DSFA |
| 15 | Digitale Anamnese und Onboarding | Patient fuellt Formulare vorab aus, Daten fliessen ins PIS | Idana, AnaBoard, Nelly (DE); CH: PIS-eigene Formularmodule | Spannweite der Angaben: "bis zu 20 Min./Patient" `[V]` gegen "rund 4 Min. pro Aufnahme" aus einer Praxiserhebung `[V, Q38]` - die Differenz zeigt, wie unsicher die Datenlage ist | 8-20k CHF | BG, DSFA |
| 16 | Patientenportal / sichere Nachrichten | Verschluesselter Austausch Praxis-Patient | HIN Mail, HIN/SeppMail, MediData-Patientenportal | HIN-Reichweite s. oben `[V, Q17]` | 3-8k CHF | BG |

### Cluster E - Abrechnung und Finanzen (nach TARDOC der heisseste Bereich)

| # | Use Case | Was es tut | Anbieter heute | Nutzen | Aufwand `[S]` | Reg. |
|---|---|---|---|---|---|---|
| 17 | TARDOC-/Pauschalen-Plausibilisierung vor Versand | Regelwerk prueft Positionen, Zeitleistungen und Pauschalen-Abgrenzung vor Fakturierung | Regelpruefungen in PIS/Abrechnungsdienstleistern (Aerztekasse, MediData, Medical Invoice), PraxisExperts als Beratung | Kontext: santesuisse gibt an, rund 10% der Leistungen seien nicht korrekt, jaehrlich ca. 3 Mrd. CHF wuerden korrigiert; eine von SRF berichtete Studie nennt ca. 1 Mrd. CHF zu viel verrechnet `[B (Verbandsangabe bzw. Medienbericht), Q39, Q40]` | 20-50k CHF | keine MP-Frage, BG |
| 18 | Rueckweisungs-Management | Rueckweisungen zentral sammeln, Ursache clustern, Korrekturvorschlag erzeugen | Aerztekasse bearbeitet Rueckweisungen als Dienstleistung | Prozess belegt `[B, Q41]`, konkrete Rueckweisungsquote **nicht belegbar** - offene Recherchefrage fuer den Pitch | 15-35k CHF | BG |
| 19 | Mahnwesen und Debitoren | Automatisierte Mahnlaeufe, Zahlungsabgleich, Eskalationslogik | Aerztekasse (Leistungserfassung, Abrechnung, Inkasso), vitomed Debitoren | Auslagerungsmodell etabliert `[B, Q41, Q42]`; Kostensatz in % vom Umsatz **nicht belegbar** | 8-20k CHF | - |
| 20 | Leistungserfassungs-Assistent | Erfasst Zeitleistungen aus Kalender/Diktat und schreibt sie nachvollziehbar ins Dossier | Kein spezialisierter CH-Anbieter gefunden - **Marktluecke** | Anforderung belegt: Minutengenauigkeit und Nachvollziehbarkeit aus der Dokumentation `[B, Q3, Q4]` | 25-60k CHF | BG, Revisionsrisiko |

### Cluster F - Betrieb, Personal, Steuerung

| # | Use Case | Was es tut | Anbieter heute | Nutzen | Aufwand `[S]` | Reg. |
|---|---|---|---|---|---|---|
| 21 | QM und Auditvorbereitung | Nachweise sammeln, Hygiene-/Notfallplaene versionieren, Audit-Dossier generieren | EQUAM (CH), medmonitor.swiss, sanaCERT | Qualitaetsentwicklung ist seit 1.4.2022 Leistungsvoraussetzung nach Art. 58a KVG; Qualitaetsvertrag prio.swiss/FMH fuer Arztpraxen eingereicht `[B, Q43, Q44]`. EQUAM-Aufwand: ca. 24 h Projektverantwortliche + ca. 18 h Team; CHF 6'850 fuer eine Praxis mit zwei Aerztinnen (180%); Zertifikat 3 Jahre; neue Grundversorger-Zertifizierung im 2. Halbjahr 2026 `[B, Q45, Q46]` | 10-25k CHF | - |
| 22 | RAG-Wissens-Chatbot auf Praxis-SOPs | Antworten auf interne Fragen (Hygiene, Abrechnung, Vertretung) aus eigenen Dokumenten mit Quellenangabe | Generische RAG-Stacks; CH-Hosting via Infomaniak/Swisscom | Mechanik gut dokumentiert `[B, Q47]`, Zeitersparnis in Zahlen **nicht belegbar** | 12-30k CHF | BG (nur wenn Patientendaten drin), sonst unkritisch |
| 23 | MPA-Recruiting und Onboarding | Stelleninserate, Screening, automatisierte Onboarding-Checklisten | Jobplattformen (praxisstellen.ch, mpa-jobs.ch), HR-Tools | Knappheit belegt `[B, Q8]`; Median-MPA-Lohn ca. CHF 65'000/Jahr (Spanne 52'000-78'000) als Basis fuer ROI-Rechnungen `[B (Jobportal), Q48]`; Lohnempfehlungen AGZ/FMH ZH 2026 als Primaerquelle `[B, Q49]` | 6-15k CHF | - |
| 24 | Dienstplanung und Zeiterfassung | Schichten, Abwesenheiten, Arbeitszeit | ShiftJuggler, Aplano, Planerio, Papershift, biduum (alle primaer DE) | Anbieterversprechen "bis zu 90% Zeitersparnis in der Planung" `[V, Q50]` - CH-Arbeitsrecht separat pruefen | 4-12k CHF | - |
| 25 | Website, SEO, Bewertungsmanagement | Auffindbarkeit, Bewertungsprozess, Antwortvorlagen | Agenturen; FMH-Empfehlung zum Umgang mit Onlinebewertungen | Vorsicht: Laut FMH eHealth-Barometer 2019 hatten nur 2% der Befragten ihren Arzt online bewertet, rund drei Viertel hielten Onlinebewertungen fuer unwichtig `[B, A - 2019, Q51]`. SRF-Recherche: ueber 20 Schweizer Praxen mit hoher Wahrscheinlichkeit manipulierter Google-Bewertungen `[B, Q52]` | 5-15k CHF | Lauterkeitsrecht bei Fake-Bewertungen |
| 26 | Kennzahlen-Dashboard ueber alle Praxen | Konsolidierte KPIs pro Standort: Auslastung, Rueckweisungen, Debitorenfrist, No-Shows, Personalkostenquote | Kein spezialisierter CH-Anbieter fuer Praxisverwalter gefunden - **Marktluecke, staerkster Ansatz fuer eine Verwaltungsfirma** | Richtwerte aus DE-Beratungsliteratur: Personalkostenquote 22-28% bzw. 25-29% vom Umsatz, kritisch ab 35% `[V/DE-Kontext, Q53]` - fuer CH nicht validiert | 30-80k CHF | BG (nur aggregierte Daten verwenden), DSFA |

---

## 4. Regulatorik kompakt

**Berufsgeheimnis (Art. 321 StGB).** Offenbaren eines anvertrauten Geheimnisses ist mit Freiheitsstrafe
bis zu drei Jahren oder Geldstrafe bedroht. Cloud- und KI-Nutzung ist zulaessig, wenn der Anbieter
vertraglich als **Hilfsperson** in einem Subordinationsverhaeltnis steht und technisch-organisatorische
Massnahmen greifen - insbesondere Verschluesselung mit Schluesselkontrolle beim Auftraggeber.
Art. 9 DSG regelt die Auftragsbearbeitung. `[B, Q54, Q55]`

**revDSG.** Gesundheitsdaten sind besonders schuetzenswerte Personendaten. Ein Bearbeitungsverzeichnis
ist bei umfangreicher Bearbeitung solcher Daten Pflicht - die 250-Mitarbeitenden-Ausnahme greift dann
nicht. Eine DSFA ist bei hohem Risiko noetig, wovon bei umfangreicher Bearbeitung von Gesundheitsdaten
regelmaessig auszugehen ist. `[B, Q56, Q57]`

**Medizinprodukt (MepV SR 812.213, in Kraft seit 26.5.2021).** Software kann Medizinprodukt sein.
Faustregel fuer den Pitch: Sobald ein Tool eine **diagnostische oder therapeutische Aussage** macht
oder priorisiert (Triage, Befundvorschlag, Dossier-Chat mit klinischer Empfehlung), ist die
Qualifikationsfrage zu klaeren. Reine Administration - Telefon, Termine, Posteingang, Abrechnung,
Dienstplan - faellt in aller Regel nicht darunter. Swissmedic-Merkblatt BW630_30_007d und
FMH-FAQ "Software as a Medical Device" sind die Einstiegsdokumente. `[B, Q58, Q59]`

**EU AI Act.** Die Schweiz ist nicht direkt gebunden, Anbieter mit EU-Bezug schon. Der Digital Omnibus
(Kommissionsvorschlag November 2025, in Kraft 27.7.2026) verschiebt die Hochrisiko-Pflichten:
Annex-III-Systeme auf den 2.12.2027, produktintegrierte KI nach Annex I auf den 2.8.2028;
Einigung Rat/Parlament am 7.5.2026. `[B, Q60, Q61]`

**Schweizer KI-Regulierung.** Bundesratsentscheid vom 12.2.2025: Ratifikation der Europarats-KI-Konvention,
sektorieller Ansatz. Das EJPD erstellt bis Ende 2026 eine Vernehmlassungsvorlage zu Transparenz,
Datenschutz, Nichtdiskriminierung und Aufsicht. `[B, Q62]`

**Technisches Risiko, das man offen ansprechen sollte.** Koenecke et al., "Careless Whisper:
Speech-to-Text Hallucination Harms", ACM FAccT 2024: rund **1% der Transkriptionen** enthielten
komplett halluzinierte Phrasen, die im Audio nicht vorkamen; **38%** dieser Halluzinationen umfassten
explizite Schaeden. `[B, Q63, Q64]` Konsequenz fuer jedes Ambient-Angebot: aerztliche Freigabe vor
Uebernahme ins Dossier ist nicht verhandelbar.

**Akzeptanzrisiko.** Sekundaerberichte ueber Studien 2025/2026 nennen: Zustimmung zu Ambient Scribes
faellt von 74,8% auf 55,3%, sobald Patienten ueber KI-Funktionen und Datenspeicherung informiert werden;
weniger als jeder dritte Patient weiss vom Einsatz. `[V - Sekundaerbericht, Primaerquelle nicht geprueft, Q65]`

---

## 5. Was ausdruecklich nicht belegbar ist

Diese im Markt kursierenden Zahlen liessen sich **nicht** auf eine unabhaengige Quelle zurueckfuehren
und gehoeren nicht in ein Verkaufs-Deck:

- "2-3 Stunden Dokumentationszeit pro Arzt und Tag gespart" (Anbieterseiten) - der einzige RCT zeigt ca. 10%.
- "80% weniger Telefonzeit" (Anbieterseite) - Herstellerclaim ohne Studie.
- Rueckweisungsquoten von Schweizer Krankenversicherern in Prozent.
- Schweizer No-Show-Raten fuer Arztpraxen (verfuegbare Zahlen sind deutsch).
- Kostensatz von Abrechnungsdienstleistern in Prozent vom Umsatz.

---

## 6. Empfehlung fuer den Pitch

**Reihenfolge nach Verhaeltnis Nutzen zu Risiko (`[S]`, Colins Einschaetzung):**
1. Terminerinnerung und Online-Buchung (Use Cases 4-5) - einziger Bereich mit RCT-Evidenz, kaum Regulatorik, Wochen statt Monate.
2. Abrechnungs-Plausibilisierung und Rueckweisungsanalyse (17-18, 20) - TARDOC macht es dringlich, keine Medizinprodukt-Frage.
3. Posteingang und Dokumentenzuordnung (11) - hoher manueller Anteil, kein klinisches Risiko.
4. Kennzahlen-Dashboard ueber alle Praxen (26) - das eigentliche Produkt fuer eine Verwaltungsfirma, weil es nur dort Sinn ergibt, wo mehrere Praxen zusammenlaufen.
5. Ambient Documentation (8) - hoechste Nachfrage, aber ehrlich kommuniziert: ca. 10% Zeit, deutlich mehr Zufriedenheit, aerztliche Freigabe zwingend.

**Wovon abzuraten ist als Einstiegsprojekt:** Triage (3), Dossier-Chat mit klinischer Aussage (12),
No-Show-Scoring (7) - Medizinprodukt- bzw. Fairness-Fragen ueberwiegen den frueh erzielbaren Nutzen.

---

## Quellen

Alle URLs abgerufen am 17.08.2026. Einordnung der Verlaesslichkeit in Klammern.

1. BAG - Ambulanter Arzttarif - https://www.bag.admin.ch/de/ambulanter-arzttarif - amtlich, hoch
2. BAG - TARDOC und Ambulante Pauschalen - https://www.bag.admin.ch/de/tardoc-und-ambulante-pauschalen - amtlich, hoch
3. OAAT/OTMA - FAQ ambulante Arzttarife - https://oaat-otma.ch/gesamt-tarifsystem/faq - Tariforganisation, hoch
4. Orchid AG - Haeufige TARDOC-Fehler und Aenderungen gegenueber TARMED - https://www.orchid-ag.ch/post/tardoc-fehler-veraenderungen-tarmed - Beratungsanbieter, mittel
5. Interpharma - Digital Health Report 2025/2026 (PDF, Okt. 2025) - https://www.interpharma.ch/wp-content/uploads/2025/10/40ad68329c59c44b82631ce7c78931cdb89f1245.pdf - Verbandsstudie mit ZHAW, mittel-hoch
6. ZHAW Digital Collection - Digital Health Report 2025/2026 - https://digitalcollection.zhaw.ch/items/29cb611f-0955-4837-9df7-d94dec6e955a - Hochschule, hoch
7. SIWF/FMH/gfs.bern - Medienmitteilung Begleitforschung, 12.11.2025 (PDF) - https://www.siwf.ch/files/pdf32/2025-11-12_mm_begleitforschung_gfs_fmh.pdf - Verband + Institut, hoch
8. mpaportal.ch - MPA-Mangel: Woran liegt's? - https://www.mpaportal.ch/blog/mpa-mangel-woran-liegts - verbandsnah, mittel
9. FMH - E-Rezept Schweiz - https://www.fmh.ch/themen/ehealth/e-rezept-schweiz.cfm - Verband, hoch
10. heise online - E-Rezept in der Schweiz wird vorangetrieben, Pflicht rueckt naeher - https://www.heise.de/news/E-Rezept-in-der-Schweiz-wird-vorangetrieben-Pflicht-rueckt-naeher-11276761.html - Fachmedium, mittel-hoch
11. BAG - E-GD: von der Totalrevision zum neuen Gesetz - https://www.bag.admin.ch/de/epd-weiterentwickeln-totalrevision - amtlich, hoch
12. eHealth Suisse - Aktueller Stand des EPD - https://www.e-health-suisse.ch/koordination/elektronisches-patientendossier/aktueller-stand - Bund/Kantone, hoch
13. BFS - Strukturdaten Arztpraxen und ambulante Zentren (MAS) - https://www.bfs.admin.ch/bfs/de/home/statistiken/gesundheit/erhebungen/sdapaz.html - amtlich, hoch (zitierte Detailzahlen aus 2015 - veraltet)
14. avenios.ch - Praxissoftware-Vergleich Schweiz 2026 - https://avenios.ch/ratgeber/praxissoftware-vergleich - Anbieter-/SEO-Seite, niedrig-mittel
15. Vitodata - vitomed Praxissoftware - https://www.vitodata.ch/de/vitomed-praxissoftware - Hersteller, niedrig (Eigenangaben)
16. startupticker.ch - OneDoc uebernimmt Mitbewerber - https://www.startupticker.ch/en/news/arzttermin-buchungsplattform-onedoc-uebernimmt-mitbewerber - Fachmedium, mittel
17. HIN - Blog HIN/SeppMail - https://www.hin.ch/blog/hin-seppmail-secure-mail-global/ - Anbieter, mittel
18. Sanacare - Gruppenpraxen - https://www.sanacare.ch/gruppenpraxen/ - Unternehmen, mittel
19. Aargauer Zeitung - Immer mehr Hausaerzte eroeffnen eine Gruppenpraxis - https://www.aargauerzeitung.ch/wirtschaft/immer-mehr-hausaerzte-eroeffnen-eine-gruppenpraxis-die-zeche-zahlen-wir-130059324 - Tagesmedium, mittel
20. MyData AG - Schweizer KI-Anbieter im Vergleich - https://mydata.ch/schweizer-ki-anbieter - Anbietervergleich, niedrig-mittel
21. medinside - LUKS lanciert digitalen Symptomchecker (25.02.2026) - https://www.medinside.ch/de/luks-lanciert-digitalen-symptomchecker-20260225 - Fachmedium, mittel-hoch
22. Doctolib Pro - KI-basierter Telefonassistent - https://info.doctolib.de/blog/ki-basierter-telefonassistent/ - Hersteller, niedrig
23. aaron.ai - Der KI-basierte Telefonassistent von Doctolib - https://www.aaron.ai/ - Hersteller, niedrig
24. Infermedica - Symptom Checker und virtuelle Triage - https://infermedica.com/de/product/symptom-checker - Hersteller, niedrig
25. Vitodata/MPA Community - OneDoc mit Schnittstelle zur vitomed-Praxisagenda - https://mpa-community.ch/onedoc-mit-schnittstelle-zur-vitomed-praxisagenda/ - Herstellerumfeld, niedrig-mittel
26. Cochrane Library - Gurol-Urganci et al., Mobile phone messaging reminders for attendance at healthcare appointments (CD007458.pub3, 2013) - https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD007458.pub3/full - systematischer Review, sehr hoch (aber 2013, veraltet)
27. eTermio - Ueber 20% No-Shows bei Arztterminen - https://www.etermio.com/no-shows-bei-aerzten-verringern-massnahmen/ - Anbieterblog mit KBV-Verweis, niedrig; DE-Kontext
28. NEJM AI - Ambient AI Scribes in Clinical Practice: A Randomized Trial - https://ai.nejm.org/doi/abs/10.1056/AIoa2501000 - peer-reviewed RCT, sehr hoch
29. PubMed 41497288 - Ambient AI Scribes in Clinical Practice: A Randomized Trial - https://pubmed.ncbi.nlm.nih.gov/41497288/ - Indexeintrag, hoch
30. Becker's Hospital Review - 16K hours saved: Ambient AI scribes at Kaiser Permanente - https://www.beckershospitalreview.com/healthcare-information-technology/ai/16k-hours-saved-ambient-ai-scribes-at-kaiser-permanente/ - Fachmedium, mittel-hoch
31. AMA - AI scribes save 15,000 hours and restore the human side of medicine - https://www.ama-assn.org/practice-management/digital-health/ai-scribes-save-15000-hours-and-restore-human-side-medicine - Aerzteverband, hoch (Stundenzahl je nach Quelle 15'000 bzw. 15'791/16'000 - Bandbreite angeben)
32. Commure - AI Medical Scribe Pricing 2026 - https://www.commure.com/blog-scribe/scribe-pricing - Anbietervergleich, niedrig-mittel
33. in2comp - Dragon Medical One Schweiz - https://in2comp.ch/spracherkennung/dragon-medical-one - Reseller, niedrig-mittel
34. cent systems - Digitale Patientenakten fuer die Arztpraxis - https://www.cent-systems.ch/digitale-patientenakten-fuer-einen-optimierten-workflow-in-der-arztpraxis/ - Anbieter, niedrig
35. adeon - Digitale Posteingangsverarbeitung mit DMS und KI - https://adeon.ch/de/posteingangsverarbeitung - Anbieter, niedrig
36. Zur Rose - Wie das E-Rezept das Schweizer Gesundheitswesen praegt - https://www.zurrose.ch/de/aerzte/blog/interview-wie-das-erezept-das-schweizer-gesundheitswesen-praegt - Unternehmen, niedrig-mittel
37. MediData - Digitale Abrechnung und Patientenkommunikation fuer Arztpraxen - https://www.medidata.ch/md/web/de/leistungserbringer/arztpraxen - Anbieter, niedrig-mittel
38. Idana - Digitale Anamnese - https://idana.com/function/digitale-anamnese/ - Hersteller, niedrig
39. SRF News - Studie zu Gesundheitskosten: 1 Milliarde Franken wird zu viel verrechnet - https://www.srf.ch/news/schweiz/studie-zu-gesundheitskosten-in-spital-und-praxis-1-milliarde-franken-wird-zu-viel-verrechnet - oeffentlich-rechtliches Medium, mittel-hoch (Primaerstudie nicht eingesehen)
40. Beobachter - Millionenverluste wegen falscher Arztrechnungen - https://www.beobachter.ch/gesundheit/falsche-arztrechnungen-kosten-uns-hunderte-millionen-franken-783659 - Publikumsmedium, mittel
41. Aerztekasse - Abrechnen: Erstellung der entsprechenden Rechnungen - https://www.aerztekasse.ch/angebotsuebersicht/dienstleistungen/abrechnen/ - Genossenschaft/Anbieter, mittel
42. Aerztekasse - Ueberblick Abrechnungsvarianten - https://www.aerztekasse.ch/abrechnen/varianten-der-abrechnung/ - Anbieter, mittel
43. BAG - Erlaeuterungen zu Artikel 58a Absatz 2 KVG (PDF) - https://www.bag.admin.ch/dam/de/sd-web/pcbv8GX5wIU9/erlaeuterungen-artikel-58-absatz-2kvg.pdf - amtlich, hoch
44. prio.swiss - Zwei Qualitaetsvertraege fuer Arztpraxen und Ernaehrungsberatung eingereicht - https://prio.swiss/zwei-qualitaetsvertraege-fuer-die-bereiche-arztpraxen-und-ernaehrungsberatung-werden-dem-bundesrat-zur-genehmigung-eingereicht/ - Versichererverband, mittel-hoch
45. EQUAM Stiftung - Aktuelles - https://www.equam.ch/aktuelles/ - Zertifizierungsstelle, hoch
46. medmonitor.swiss - Effizienter zur EQUAM-Zertifizierung - https://medmonitor.swiss/blog/mit-medmonitor-swiss-effizienter-zur-equam-zertifizierung/ - Anbieter, niedrig-mittel (Aufwands- und Preisangaben)
47. Fraunhofer Publica - Unternehmensdokumente erschliessen mit RAG - https://publica.fraunhofer.de/entities/publication/173bfeb5-cad6-4da5-ab7b-25b1d180cb6f - Forschungsinstitut, hoch
48. FunkyJobs - Med. Praxisassistentin Lohn Schweiz 2026 - https://www.funkyjobs.ch/ratgeber/lohn/mpa - Jobportal, niedrig-mittel
49. FMH/AGZ - Lohnempfehlungen 2026 fuer MPA EFZ, Kanton Zuerich (PDF) - https://mpa-schweiz.fmh.ch/files/pdf33/zh_lohnempfehlungen_mpa_2026.pdf - Verband, hoch
50. Planerio - Dienstplan-Software fuer die Arztpraxis - https://planerio.de/anwendungsbereiche/arztpraxis/ - Hersteller, niedrig
51. FMH - Umgang mit Onlinebewertungen, Empfehlung (PDF) - https://www.fmh.ch/files/pdf2/umgang_onlinebewertungen_empfehlungen_fmh.pdf - Verband, hoch (zitierte Barometerdaten von 2019 - veraltet)
52. SRF - Schweizer Aerzte kaufen Fake-Bewertungen auf Google - https://www.srf.ch/falsche-bewertungen-auf-google-schweizer-aerzte-kaufen-fake-bewertungen-auf-google - oeffentlich-rechtliches Medium, hoch
53. Rebmann Research - Personalkostenquote in der Arztpraxis - https://www.rebmann-research.de/personalkostenquote-was-arztpraxen-ueber-diese-kennziffer-wissen-sollten - Beratungsanbieter DE, niedrig-mittel; nicht CH-validiert
54. FMH/SAMW - Rechtlicher Leitfaden, 7.1 Berufsgeheimnis - https://leitfaden.samw.fmh.ch/rechtlicher-leitfaden/7-berufsgeheimnis-datenschutz/71-berufsgeheimnis-arzt.cfm - Verband/Akademie, sehr hoch
55. David Rosenthal - Mit Berufsgeheimnissen in die Cloud (PDF) - https://www.rosenthal.ch/downloads/Rosenthal-CloudLawfulAccess.pdf - Fachjuristische Publikation, hoch
56. HIN - Neues Datenschutzgesetz: Was Akteure des Gesundheitswesens wissen muessen (Teil 1) - https://www.hin.ch/de/blog/2023/ndsg-gesundheitswesen-teil-1.cfm - Anbieter mit Fachbezug, mittel-hoch
57. FMH/SAMW - Rechtlicher Leitfaden, 7.2 Datenschutz in der Arztpraxis (PDF) - https://leitfaden.fmh.ch/rechtlicher-leitfaden/7-berufsgeheimnis-datenschutz/72-datenschutz-arzt.pdf - Verband/Akademie, sehr hoch
58. Swissmedic - Merkblatt Medizinprodukte-Software BW630_30_007d (PDF) - https://www.swissmedic.ch/dam/swissmedic/de/dokumente/medizinprodukte/mep_urr/bw630_30_007d_mbmedizinprodukte-software.pdf.download.pdf/BW630_30_007d%20MB%20Medizinprodukte-Software.pdf - Behoerde, sehr hoch
59. FMH - FAQ Software as a Medical Device (PDF) - https://www.fmh.ch/files/pdf27/faq-software-as-a-medical-device-dt.pdf - Verband, hoch
60. Gibson Dunn - EU AI Act Omnibus Agreement: Postponed High-Risk Deadlines - https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/ - Anwaltskanzlei, hoch
61. TUEV Consulting - Digital Omnibus on AI: Neue Fristen fuer die KI-Verordnung - https://consulting.tuv.com/aktuelles/ki-im-fokus/digital-omnibus-ki-verordnung-fristen - Pruefdienstleister, mittel-hoch
62. Der Bundesrat - KI-Regulierung: Bundesrat will Konvention des Europarats ratifizieren (12.02.2025) - https://www.admin.ch/gov/de/start/dokumentation/medienmitteilungen/bundesrat.msg-id-104110.html - amtlich, sehr hoch
63. Koenecke et al. - Careless Whisper: Speech-to-Text Hallucination Harms, ACM FAccT 2024 (PDF) - https://facctconference.org/static/papers24/facct24-111.pdf - peer-reviewed Konferenzpaper, sehr hoch
64. arXiv:2402.08021 - Careless Whisper: Speech-to-Text Hallucination Harms - https://arxiv.org/abs/2402.08021 - Preprint derselben Arbeit, hoch
65. medinside - Mehr Zeit, weniger Ehrlichkeit? Der Preis der KI-Dokumentation (10.04.2026) - https://www.medinside.ch/de/ambient-scribes-medizin-vorteile-nachteile-patienten-reaktionen-mdai-20260410 - Fachmedium, Sekundaerbericht ueber Studien; Primaerquellen nicht geprueft, mittel
66. mdai.ch - Geprüfte KI-Tools fuer Schweizer Aerzte - https://mdai.ch/tools/ - unabhaengiges CH-Verzeichnis, mittel-hoch
67. gfs.bern - Befragung zum aerztlichen Arbeitsumfeld im Auftrag der FMH 2025 - https://cockpit.gfsbern.ch/de/cockpit/befragung-zum-aerztlichen-arbeitsumfeld-im-auftrag-der-fmh-2025 - Forschungsinstitut, hoch
68. FMH - eHealth-Barometer 2025 in der Schweizerischen Aerztezeitung - https://www.fmh.ch/politik-medien/schweizerische-aerztezeitung/ausgabe-17-18/fmh-ehealth-barometer-2025.cfm - Verband/Fachzeitschrift, hoch

**Nicht abrufbare Primaerquellen:** Der Netzwerk-Egress dieser Rechercheumgebung blockierte direkte
Abrufe von pubmed.ncbi.nlm.nih.gov, ai.nejm.org, bag.admin.ch, bfs.admin.ch, fmh.ch, interpharma.ch,
srf.ch und medinside.ch. Die Angaben aus diesen Quellen stammen aus Suchmaschinen-Zusammenfassungen
der jeweiligen Seiten. **Vor Verwendung im Kundendeck sind mindestens Q5, Q7, Q26, Q28, Q30 und Q63
im Volltext gegenzulesen.**
