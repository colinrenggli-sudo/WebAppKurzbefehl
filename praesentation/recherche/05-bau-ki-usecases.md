# 30 KI- und Software-Anwendungsfälle für ein Schweizer Bauunternehmen (KMU)

**Stand: 17. August 2026** · Für den Pitch an die Stirnimann Bau AG (Bauhauptgewerbe, Zentralschweiz)

**Legende:** **[B]** belegt mit Quelle · **[A]** Annahme/eigene Schätzung · **[?]** nicht belegbar · **[V]** Aktualität eingeschränkt
**Aufwand:** S = 2–6 Wochen bis Produktivbetrieb · M = 2–4 Monate · L = 6+ Monate
**Risiko:** tief / mittel / hoch (Ausfall-, Rechts- und Akzeptanzrisiko zusammen)

> **Methodenhinweis, bitte lesen:** Diese Recherche traf auf zwei harte Grenzen. Erstens blockiert die Netzwerk-Policy dieser Session direkte Zugriffe auf praktisch alle `.ch`-Domains (HTTP 403 beim CONNECT: crb.ch, suva.ch, bfs.admin.ch, fedlex.admin.ch, baumeister.swiss, sorba.ch, scait.ch, planradar.com, tbp-law.ch, 123erfasst.de). Zweitens war das Suchbudget der Session nach zehn erfolgreichen Abfragen erschöpft. Belegt ist deshalb, was aus indexierten Suchresultaten mit Quellenangabe stammt (Quellen [1]–[10]) plus die bereits verifizierten Zahlen der Schwesterrecherche `04-bau-schweiz-markt.md` (Quellen [11]–[16]). **Anbieternennungen ohne Beleg-Markierung sind Marktkenntnis, nicht Recherche – sie müssen vor dem Meeting nachgeprüft werden.** Es wurden keine Zahlen, Studien, Fallstudien oder Zitate erfunden.

---

## 1. Die Ausgangslage in vier belegten Zahlen

| Fakt | Wert | Quelle |
|---|---|---|
| Anteil Portugiesen am Baustellenpersonal Bauhauptgewerbe (2024) | **31,0 %** (Schweizer: 34,7 %); rund **100 Nationalitäten** vertreten | [4] **[B]** |
| Beschäftigte Bauhauptgewerbe / dem LMV unterstellt | **90'000** / rund **80'000** | [4], [5] **[B]** |
| Berufsunfälle Schweiz 2023 und deren Kosten | **286'000 Fälle / 6,9 Mrd. CHF**; Suva-Nettoprämie Bauhauptgewerbe 2,5 %, Gerüstbau 5,74 % (2025) | [8] **[B]** |
| Gewinnmarge Bauhauptgewerbe (2022) | **2–3 %** | [11] **[B] [V – vier Jahre alt]** |

**Verkaufslogik [A]:** Bei 2–3 % Marge ist jede eingesparte Bürostunde direkt Gewinn. Und wenn ein Drittel der Belegschaft Portugiesisch spricht, ist der deutschsprachige Papierrapport kein Formular, sondern eine Fehlerquelle. Übersetzung ist bereits die häufigste KI-Anwendung in Schweizer KMU (**52 %**) [15] **[B]** – das Verkaufsargument existiert bereits im Kopf des Kunden.

---

## 2. Anbieterlandschaft: Was heute wirklich existiert

| Anbieter | Belegte Funktionen | Status |
|---|---|---|
| **Abacus «Tagesrapport» (AbaBau / AXbau)** | iPad-App: Mitarbeiterstunden, Materialverbrauch, Maschinenstunden, Lieferscheine, Regie- und Fremdleistungen. **Texte, Fotos, Sprachnotizen und Videos** im Rapport | [1] **[B]** |
| **SORBA myRapport** | Rapportierung Personal / Geräte / Material analog Papierform; **Fotos, Notizen und Sprachnachrichten** anhängbar | [1] **[B]** |
| **Baurapport.ch** | Schweizer Baustellen-App: Rapporte, Zeiterfassung, Material, Team-Chat, Pläne | [1] **[B]** |
| **123erfasst** | **KI-Chat-Assistent mit Sprach- oder Texteingabe**, erfasst Arbeitsschritte und Ergebnisse; Bautagesbericht wird automatisch aus Leistungen, Zeiten, Kommentaren und Fotos zusammengestellt; App-Sprache folgt Systemsprache; **Stammdaten mehrsprachig hinterlegbar** (Beispiel: Deutsch + Polnisch) | [2] **[B]** |
| **CENDAS Sprachassistent** | Freihändige Sprachbedienung statt Tippen **plus automatische Übersetzung** («Bauen ohne Sprachbarrieren») | [2] **[B]** |
| **PlanRadar** | **Integriertes KI-Diktiergerät** für Mängel- und Aufgabeneinträge; **SiteView**: 360°-Bilder werden beim Begehen automatisch auf dem 2D-Plan verortet; über **170'000 Nutzer in über 75 Ländern** | [3] **[B]** |
| **Buildots** | Helmmontierte 360°-Kamera + Computer Vision, Abgleich mit BIM-Modell und Terminplan, automatische Abweichungserkennung; MBN GmbH (Berlin Lichtenberg) als erstes deutsches Bauunternehmen im Einsatz | [7] **[B]** |
| **SCAIT (CH)** | KI-Software für Schweizer Bausubmissionen: zweistufiger Filter, Eignungskriterien und **automatische KI-Vorprüfung**, um Submissionen auf simap zu selektieren, «ohne 5'000 Seiten zu lesen»; kennt Schweizer Baustandards | [6] **[B]** |
| **CRB NPK** | Rund **200 Kapitel** (Hochbau, Tiefbau, Untertagbau, Gebäudetechnik, Gebäudeautomation); Austauschformat **CRBX**; NPK-Viewer und NPK-Editor; digitale Nutzung erfordert CRB-zertifizierte Anwendung **plus Datennutzungslizenz** | [9] **[B]** |
| Capmo, Sablono, Fieldwire, Procore, Nevaris, Bauhub, Bexio, Baubit, Messerli, OpenSpace, HoloBuilder, Doxel | OpenSpace und HoloBuilder sind als fotogrammetrische Anbieter belegt [7]; alle übrigen: **im Markt bekannt, in dieser Recherche NICHT verifiziert** | **[?]** |

**Die Marktlücke, sauber formuliert [A]:** Sprachnotizen (Abacus, SORBA), Sprach-*erfassung* (123erfasst) und Sprach-*übersetzung* (CENDAS) sind je einzeln belegt. Was ich **nicht** belegen konnte, ist ein Schweizer Produkt, das beides verbindet: Diktat in der Muttersprache → strukturierter, deutschsprachiger Tagesrapport im Schweizer Format mit Stunden, Material, Maschinen, Wetter und NPK-Bezug. **Das ist Colins Einstiegsprodukt – aber im Meeting als «konnte ich nicht finden» sagen, nicht als «gibt es nicht».**

---

## 3. Die 30 Anwendungsfälle

### Block A – Baustelle und Feld

**A1 · Mehrsprachiger Sprach-Rapport.** Polier oder Vorarbeiter diktiert 60 Sekunden auf Portugiesisch, Italienisch, Albanisch, Kroatisch, Türkisch, Polnisch, Spanisch oder Englisch; das System füllt daraus den strukturierten Schweizer Tagesrapport auf Deutsch: Stunden pro Person, Material, Maschinen, Wetter, Fotos, Bemerkungen. *Markt:* Bausteine bei 123erfasst (KI-Spracherfassung [2]), CENDAS (Übersetzung [2]), Abacus/SORBA (Sprachnotiz als Anhang [1]). *Nutzen:* Zielgruppe belegt – 31 % Portugiesen, ~100 Nationalitäten [4]. *Aufwand:* M. *Risiko:* mittel – Transkription in Baustellenlärm und Dialekt, Halluzinationsrisiko bei Zahlen. **Zwingend: Rückübersetzung zur Bestätigung in der Muttersprache vor dem Absenden.**

**A2 · Regierapport mit Belegkette.** Regieleistungen werden erfasst, sofort als PDF an die Bauleitung zur digitalen Gegenzeichnung geschickt und mit Foto- und Zeitbeleg archiviert. *Markt:* Abacus erfasst Regie- und Fremdleistungen [1]. *Nutzen:* SIA 118 verlangt «kein Abrechnungsposten ohne Beleg»; fehlt der gegengezeichnete Regierapport, ist die Leistung erbracht, aber nicht durchsetzbar [14] **[B]**. *Aufwand:* S. *Risiko:* tief. **Höchste ROI-Dichte im ganzen Katalog.**

**A3 · Fotodokumentation mit automatischer Verschlagwortung.** Jedes Baustellenfoto erhält automatisch Objekt, Bauteil, Geschoss, Gewerk, Datum und GPS als durchsuchbare Schlagworte. *Markt:* Ordnerstrukturen sind Standard, KI-Verschlagwortung im DACH-Markt in dieser Recherche **nicht verifiziert [?]**. *Nutzen:* Beweislage bei Nachträgen und Mängelstreit. *Aufwand:* S. *Risiko:* tief.

**A4 · Baufortschritt aus Bildern.** 360°-Rundgang oder Helmkamera, automatischer Abgleich gegen Terminplan oder BIM-Modell, Abweichungsreport. *Markt:* **Buildots** (BIM-Abgleich, Abweichungserkennung), **OpenSpace**, **HoloBuilder** [7]; **PlanRadar SiteView** verortet 360°-Bilder automatisch auf dem 2D-Plan [3]. *Nutzen:* Ein Sekundärbericht nennt bis zu 30 % weniger Verzögerungen [7] – **Anbieter-/Sekundärquelle, im Deck als solche kennzeichnen, nicht als Studie**. *Aufwand:* L. *Risiko:* mittel – lohnt erst ab BIM-Projekten, für ein Tiefbau-KMU meist überdimensioniert.

**A5 · Mängel- und Abnahmemanagement.** Mangel per Sprache aufnehmen, auf dem Plan verorten, Gewerk zuweisen, Frist setzen, Nachverfolgung bis zur Abnahme. *Markt:* **PlanRadar belegt** – KI-Diktiergerät, Verortung auf Plan oder BIM, Ticket bündelt Fotos, Sprachnotizen, Fristen [3]. *Nutzen:* Rework kostet international 4–10 % der Projektkosten; 56 % der Firmen mit konsistenten QA/QC-Prozessen halten Rework unter 5 % [16] **[B, international, nicht schweizspezifisch]**. *Aufwand:* S (Standardprodukt einführen). *Risiko:* tief. **Hier baut Colin nichts – hier führt er ein und schult.**

**A6 · Ausmass aus Foto oder LiDAR.** Flächen, Längen und Kubaturen aus Handy-Scan statt Messrad, direkt in NPK-Positionen übersetzt. *Markt:* **nicht verifiziert [?]**. *Nutzen:* **nicht belegbar [?]** – Genauigkeitsangaben zu LiDAR-Ausmass am Bau konnte ich nicht sourcen. *Aufwand:* L. *Risiko:* **hoch** – Ausmass ist abrechnungsrelevant, ein Messfehler ist ein Rechtsstreit. **Nicht als erstes Projekt verkaufen.**

**A7 · Lieferscheine per Foto.** Lieferschein abfotografieren, Menge, Lieferant, Material und Baustelle werden ausgelesen und der Kostenstelle zugeordnet. *Markt:* Abacus erfasst Lieferscheine in der Tagesrapport-App [1]; OCR-Extraktion ist Commodity. *Nutzen:* schliesst die Lücke zwischen Baustelle und Kreditorenbuchhaltung. *Aufwand:* S. *Risiko:* tief.

**A8 · Baustellen-Chatbot auf eigenen Dokumenten (RAG).** Frage in beliebiger Sprache: «Wie tief muss die Fundationsschicht hier?» – Antwort aus Werkvertrag, Plänen, SIA-Normen, NPK-Positionen, mit Quellenverweis. *Markt:* **nicht verifiziert [?]**. *Nutzen:* **nicht quantifizierbar [?]**. *Aufwand:* M. *Risiko:* **hoch bei Normen** – SIA- und NPK-Inhalte sind lizenzpflichtig; die digitale NPK-Nutzung erfordert ausdrücklich eine Datennutzungslizenz [9]. **Lizenzfrage vor der ersten Zeile Code klären.**

### Block B – Aufträge gewinnen

**B9 · SIMAP-Monitoring mit Relevanzfilter.** Tägliche Prüfung aller simap.ch-Publikationen gegen das eigene Profil, Ausgabe: drei relevante Ausschreibungen statt 300. *Markt:* **SCAIT** [6], suisseoffer (simap-api), IntelliProcure, Bidfix, Vergabemonitor von bauenschweiz [6]. *Nutzen:* Die öffentliche Hand beschafft über **41 Mrd. CHF pro Jahr** [14] **[B, Anbieterquelle – gegenprüfen]**. *Aufwand:* S. *Risiko:* tief.

**B10 · Automatische Vorprüfung der Ausschreibungsunterlagen.** Eignungs- und Zuschlagskriterien, Fristen, Referenzanforderungen, Bürgschaften und Risikoklauseln werden extrahiert und als Ampel dargestellt. *Markt:* **SCAIT belegt** – zweistufiger Filter plus automatische KI-Vorprüfung, «ohne 5'000 Seiten zu lesen» [6]. *Nutzen:* Nicht-Bieten ist auch eine Entscheidung – sie muss nur schnell und begründet fallen. *Aufwand:* M. *Risiko:* mittel – ein übersehenes Ausschlusskriterium kostet die Submission.

**B11 · Kalkulationsvorbereitung aus dem Devis.** CRBX-Datei einlesen, Positionen gegen die eigene Preisdatenbank und vergangene Projekte matchen, Vorkalkulation mit Abweichungsmarkern erzeugen. *Markt:* CRB liefert NPK-Editor und CRBX als standardisiertes Austauschformat [9]; KI-gestütztes Matching **nicht verifiziert [?]**. *Nutzen:* strukturell hoch, **Zeitersparnis nicht belegbar [?]**. *Aufwand:* M. *Risiko:* mittel – **Datennutzungslizenz und CRB-Zertifizierung sind Pflicht** [9].

**B12 · Offert- und Begleittexterstellung.** Technischer Bericht, Referenzblätter, Qualitätskonzept und Begleitschreiben aus Bausteinen plus Projektkontext. *Markt:* Generische LLM-Tools, kein bauspezifisches CH-Produkt verifiziert **[?]**. *Nutzen:* Das revidierte Beschaffungsrecht verschiebt von Preis- zu Qualitätswettbewerb [14] **[B]** – Textqualität wird zum Zuschlagsfaktor. *Aufwand:* S. *Risiko:* tief, sofern jede Zahl vom Menschen geprüft wird.

**B13 · Nachkalkulation je Position.** Soll-Ist-Vergleich Kalkulation gegen Rapportstunden, wöchentlich, positionsscharf. *Markt:* Funktion klassischer CH-Bausoftware **[?]**. *Nutzen:* die einzige Rückkopplung, die Kalkulationsfehler überhaupt sichtbar macht. *Aufwand:* M. *Risiko:* tief. **Setzt A1/A2 zwingend voraus.**

### Block C – Geld sichern

**C14 · Nachtragserkennung.** Rapporte, Chats, Fotos und Mails werden laufend auf Formulierungen wie «hat der Bauherr noch gewünscht», «Boden anders als im Baugrundgutachten», «zusätzlich» gescannt und als Nachtragskandidat gemeldet. *Markt:* **nicht verifiziert [?]**. *Nutzen:* SIA 118 definiert den Begriff «Nachtrag» gar nicht; die KBOB publiziert einen eigenen Leitfaden zum Nachtragsmanagement (V2.0) [14] **[B]**. Der Verlust entsteht nicht am Bau, sondern beim Nichtdokumentieren. *Aufwand:* M. *Risiko:* mittel – false positives nerven, false negatives kosten Geld.

**C15 · Automatisches Nachtragsdossier.** Aus erkanntem Nachtrag entsteht ein vollständiges Dossier: Sachverhalt, Anordnung, betroffene NPK-Positionen, Stunden, Material, Fotobelege, Preisbasis. *Markt:* **nicht verifiziert [?]**. *Nutzen:* Nach SIA 118 Art. 87 Abs. 4 darf die Bauleitung Bestellungsänderungen in Regie ausführen lassen, wenn keine Preiseinigung zustande kommt [14] **[B]** – wer schneller und belegter dokumentiert, verhandelt besser. *Aufwand:* M. *Risiko:* mittel.

**C16 · Kreditorenworkflow.** Rechnung per Foto oder Mail, Auslesen, Abgleich gegen Lieferschein und Bestellung, Freigaberouting, Übergabe an die Buchhaltung. *Markt:* Commodity; CH-Anbindung an Abacus, Bexio, Sage **nicht verifiziert [?]**. *Nutzen:* MWST-Normalsatz 8,1 % seit 1.1.2024, 2026 unverändert [14] **[B]** – Vorsteuerabzug scheitert an fehlenden Belegen. *Aufwand:* S. *Risiko:* tief.

**C17 · Fristenwächter Bauhandwerkerpfandrecht.** Das System kennt für jede Baustelle den «letzten Hammerschlag», rechnet die Frist und eskaliert automatisch. *Markt:* **nicht verifiziert [?]**. *Nutzen:* **Rechtslage geändert per 1. Januar 2026** – die Eintragungsfrist wurde von drei auf **vier Monate** verlängert (Art. 839 ZGB); zudem muss eine Ersatzsicherheit neu auch Verzugszinsen für **zehn Jahre** decken. Die Frist ist nicht erstreckbar, und die Eintragung muss **vollzogen** sein: das Gesuch am letzten Tag einzureichen genügt nicht [10], [14] **[B]**. *Aufwand:* S. *Risiko:* tief. **Stärkster Einzelfall im Katalog: geringer Aufwand, sechsstelliges Verlustpotenzial pro Fall.**

**C18 · Preis- und Teuerungsmonitoring.** Marktpreise für Stahl, Beton, Bitumen und Asphalt beobachten, gegen Teuerungsklauseln und Indexstände laufender Verträge halten, Nachforderungen auslösen. *Markt:* **nicht verifiziert [?]**. *Nutzen:* Materialpreissteigerungen konnten nur teilweise weitergegeben werden – ein belegter Treiber der 2–3-%-Marge [11] **[B] [V]**. *Aufwand:* M. *Risiko:* mittel – Datenverfügbarkeit für Schweizer Baustoffindizes **[?]**.

### Block D – Personal

**D19 · Arbeitszeitkontrolle nach LMV 2026.** Rapportstunden fliessen direkt in den betrieblichen Arbeitszeitkalender, Überstunden-, Minus- und Feriensalden laufen mit, Meldung an die PBK wird vorbereitet. *Markt:* CH-Lohn- und Bausoftware **[?]**. *Nutzen:* **Der LMV 2026–2031 gilt ab 1.1.2026 für sechs Jahre bis Ende 2031 und betrifft rund 80'000 Mitarbeitende.** Zu gewährleisten sind **2'112 Jahresstunden**; der betriebliche Arbeitszeitkalender ist der paritätischen Berufskommission **bis Mitte November** zuzustellen (Art. 27 Abs. 1 LMV); Überstunden werden ab 2026 automatisch ins neue Jahr übertragen [5] **[B]**. *Aufwand:* M. *Risiko:* mittel – die PBK führt systematische Lohnkontrollen mit Konventionalstrafen durch [14] **[B]**. **WIDERSPRUCH ZU PRÜFEN:** Die Bandbreiten differieren zwischen den Quellen – `04-bau-schweiz-markt.md` nennt −20 Minusstunden / +120 Überstunden [14], die SORBA-Zusammenfassung nennt einen Aufbau bis 200 bzw. bei finanzieller Absicherung bis 700 Stunden [5]. **Vor dem Meeting am LMV-Volltext verifizieren, im Deck keine dieser Zahlen ungeprüft nennen.**

**D20 · Disposition mit Wetter.** Personal- und Maschinenplanung für 5 bis 10 Tage, gekoppelt an Wetterprognose, mit Umplanungsvorschlag bei Regen oder Frost. *Markt:* **nicht verifiziert [?]**. *Nutzen:* **nicht quantifizierbar [?]**. *Aufwand:* M. *Risiko:* mittel – Akzeptanz beim Polier ist der Engpass, nicht die Technik.

**D21 · Mehrsprachige Sicherheitsunterweisung.** Toolbox-Talks und Instruktionen automatisch in acht Sprachen, als Audio und Kurzvideo, mit dokumentierter Kenntnisnahme. *Markt:* CENDAS zeigt automatische Übersetzung am Bau [2]. *Nutzen:* 286'000 Berufsunfälle 2023 zu 6,9 Mrd. CHF; Suva-Nettoprämie Bauhauptgewerbe 2,5 % [8] **[B]**; über 80 % Ausländeranteil in den tiefen Lohnklassen [15] **[B]**. *Aufwand:* S. *Risiko:* tief. **Prämienrelevanz ist das Argument, das den Onkel überzeugt – aber eine belegte Prämiensenkung durch Schulung konnte ich nicht sourcen [?].**

**D22 · Gefährdungsermittlung und BauAV-Konzept.** Sicherheits- und Gesundheitsschutzkonzept inklusive Notfallorganisation aus Projektdaten vorgenerieren. *Markt:* **nicht verifiziert [?]**. *Nutzen:* BauAV 2022 Art. 4 verlangt **vor Baubeginn ein schriftliches Konzept**; die Verordnung betrifft über 70'000 Betriebe [14] **[B]**. *Aufwand:* S. *Risiko:* mittel – **das Konzept bleibt Verantwortung des Betriebs, KI liefert nur den Entwurf.**

**D23 · Beinaheunfall-Meldung per Sprache.** 20 Sekunden in der Muttersprache aufs Handy, das System kategorisiert, anonymisiert optional und leitet weiter. *Markt:* **nicht verifiziert [?]**. *Nutzen:* Meldeschwelle sinkt drastisch, wenn nicht getippt und nicht Deutsch geschrieben werden muss [A]. *Aufwand:* S. *Risiko:* tief.

**D24 · Rekrutierung über neue Kanäle.** Stelleninserate in acht Sprachen, Kurzvideos statt PDF, Bewerbung per WhatsApp oder Sprachnachricht, automatische Vorqualifikation. *Markt:* **nicht verifiziert [?]**. *Nutzen:* Bis 2040 fehlen dem Bauhauptgewerbe **5'600 Fachkräfte**; bei Maurern werden 31 %, bei Bauvorarbeitern 33 % mehr Personal gebraucht als verfügbar sein wird [12] **[B]**. Durchschnittliche Rekrutierungskosten Schweiz: **13'570 CHF pro Einstellung** [13] **[B, Beratungsquelle]**. *Aufwand:* S. *Risiko:* tief.

**D25 · Onboarding und Schulung mit KI-Übersetzung.** Betriebsregeln, Maschineneinweisung und Qualitätsstandards als übersetzte Kurzmodule mit Verständniskontrolle. *Markt:* 123erfasst hinterlegt Stammdaten mehrsprachig, etwa Deutsch und Polnisch [2]. *Nutzen:* siehe D24. *Aufwand:* S. *Risiko:* tief.

### Block E – Anlagen, Pläne, Kunden

**E26 · Telematik, Wartung, Diebstahlschutz.** Betriebsstunden, Standort, Geofence-Alarm, vorausschauende Wartung für Bagger, Walzen und Kompressoren. *Markt:* Hersteller- und Nachrüstlösungen, **nicht verifiziert [?]**. *Nutzen:* **nicht belegbar [?]** – Schweizer Zahlen zu Baumaschinen-Leerlauf und Diebstahl liessen sich nicht sourcen [14]. *Aufwand:* M. *Risiko:* tief. **Ohne Zahl nicht als Sparargument verkaufen, sondern als Versicherungs- und Verfügbarkeitsthema.**

**E27 · BIM-Anbindung und Plan-Versionierung.** Verbindliche aktuelle Planversion auf jedem Gerät, Änderungsmarkierung, Verknüpfung mit Mängeln und Rapporten. *Markt:* PlanRadar verortet auf Plänen und BIM-Modellen [3]; Buildots gleicht gegen das BIM-Modell ab [7]. *Nutzen:* Bund und bundesnahe Betriebe wenden BIM seit 2021 für Immobilien und **ab 2025 für Infrastrukturanlagen verpflichtend** an [14] **[B]** – bei öffentlichen Aufträgen wird BIM-Fähigkeit zur Eintrittskarte. *Aufwand:* L. *Risiko:* mittel.

**E28 · Kundenportal für Bauherren.** Live-Baufortschritt mit Fotos, Terminstand, freigegebene Nachträge, Ansprechpartner. *Markt:* **nicht verifiziert [?]**. *Nutzen:* **nicht quantifizierbar [?]**; qualitativ: verschiebt Nachtragsgespräche von der Konfrontation zur laufenden Information [A]. *Aufwand:* M. *Risiko:* mittel – **was der Bauherr sieht, muss vorher intern sauber sein.**

**E29 · Wissenssicherung vor der Pensionierung.** Erfahrungswissen langjähriger Poliere strukturiert per Interview aufnehmen, in durchsuchbare Handlungsanleitungen überführen. *Markt:* **nicht verifiziert [?]**. *Nutzen:* Haupttreiber des Fachkräftemangels ist laut SBV-Studie der **Altersüberhang bei Maurern, Bauvorarbeitern und Polieren** [12] **[B]**. *Aufwand:* M. *Risiko:* tief.

**E30 · Dokumententriage im Baubüro.** Eingehende Mails, Pläne und Protokolle klassifizieren, dem Projekt zuordnen, Fristen und Aufgaben extrahieren. *Markt:* Commodity **[?]**. *Nutzen:* Übersetzungen (52 %) und Korrespondenz (47 %) sind die häufigsten KI-Anwendungen in Schweizer KMU [15] **[B]**. *Aufwand:* S. *Risiko:* mittel – Datenschutz, siehe unten.

---

## 4. Priorisierung für den Pitch

**Sofort (Aufwand S, Risiko tief, belegter Nutzen):** C17 Pfandrecht-Fristenwächter · A2 Regierapport mit Belegkette · A5 Mängelmanagement (PlanRadar einführen, nicht bauen) · D21 mehrsprachige Sicherheitsunterweisung · C16 Kreditoren.

**Das Leuchtturmprojekt:** A1 mehrsprachiger Sprach-Rapport. Sichtbar für jeden auf der Baustelle, adressiert die belegte 31-%-Sprachrealität [4], und ein direktes Schweizer Konkurrenzprodukt liess sich nicht finden.

**Bewusst nicht zuerst:** A6 Ausmass (Rechtsrisiko), A4 Baufortschritt aus Bildern (BIM-Voraussetzung), E27 BIM (zu gross für den Einstieg).

## 5. Querschnittsrisiken, die in jedes Angebot gehören

1. **Datenschutz.** Das revDSG gilt seit 1.9.2023 und ist laut EDÖB direkt auf KI-Anwendungen anwendbar: Transparenzpflicht, Bearbeitungsverzeichnis, Datenschutz-Folgenabschätzung bei hohem Risiko [15] **[B]**. Rapportdaten sind Personendaten – Standortdaten und Leistungsbewertung besonders.
2. **Lizenzrecht.** Digitale NPK-Nutzung erfordert eine CRB-zertifizierte Anwendung **und** eine Datennutzungslizenz [9] **[B]**. Das betrifft B11, B13 und A8 direkt.
3. **Regulierung ist unterwegs.** Der Bundesrat beschloss am 12.2.2025 die Ratifikation der KI-Konvention des Europarats; eine Vernehmlassungsvorlage ist bis Ende 2026 angekündigt [15] **[B]**.
4. **Haftung.** Bei D22 (Sicherheitskonzept), A6 (Ausmass) und C15 (Nachtrag) bleibt die Verantwortung beim Betrieb. Jedes Angebot braucht die Formulierung «KI erstellt den Entwurf, der Mensch gibt frei».

## 6. Was ausdrücklich nicht belegbar ist

Zeitersparnis pro Tagesrapport in Schweizer Betrieben · Genauigkeit von LiDAR-Ausmass am Bau · Schweizer Zahlen zu Maschinen-Leerlauf und Baumaschinendiebstahl · Aufwand pro Submissionsangebot · Prämienwirkung von Sicherheitsschulungen bei der Suva · Sprachanteile auf Schweizer Baustellen (die SBV-Erhebung publiziert Nationalitäten, nicht Sprachen) [15]. **Für diese sechs Punkte im Deck keine Prozentwerte nennen.**

---

## Quellen

1. **Tagesrapport-Apps Schweiz: Abacus/AXbau, SORBA myRapport, Baurapport.ch** – https://baumeister.swiss/die-tagesrapport-app-fuer-bauunternehmen-von-abacus/ · https://www.axept.ch/onlinemagazin/tagesrapport-app-f%C3%BCr-bauunternehmen-abacus · https://www.sorba.ch/software/app/tagesrapport · https://www.baurapport.ch/de – abgerufen 17.08.2026 via Suchindex (Direktzugriff proxy-blockiert) – *Anbieter- und Verbandsseiten. Funktionsbeschreibungen zuverlässig, Nutzenangaben interessengeleitet.*
2. **123erfasst KI-Features und Mehrsprachigkeit; CENDAS Sprachassistent** – https://123erfasst.de/bau-blog/ki-in-der-123erfasst-app/ · https://123erfasst.de/123erfasst-nun-mehrsprachig/ · https://123erfasst.de/bautagebuch/ · https://www.cendas.net/produkt/sprachassistent/ – abgerufen 17.08.2026 via Suchindex – *Anbieterquellen (DE-Markt). Feature-Existenz belegt, Qualität nicht unabhängig geprüft.*
3. **PlanRadar: KI-Diktiergerät, SiteView, Nutzerzahlen** – https://www.planradar.com/ch/app-fuer-bauleiter-welche-bauleiter-app/ · https://www.this-magazin.de/artikel/planradar-revolutioniert-bauprojekte-mit-ki-gestuetztem-siteview-4088240.html – abgerufen 17.08.2026 via Suchindex – *Anbieter plus Fachmedium THIS. Nutzerzahlen sind Anbieterangaben.*
4. **Nationalitätenstruktur Baustellenpersonal Bauhauptgewerbe 2024 (SBV-Lohnerhebung via Statista)** – https://de.statista.com/statistik/daten/studie/486550/umfrage/nationalitaetenstruktur-des-baustellenpersonals-im-bauhauptgewerbe-in-der-schweiz/ · https://baumeister.swiss/baumeister-5-0/konjunktur-statistiken/zahlen-und-fakten/ – abgerufen 17.08.2026 via Suchindex – *Datengrundlage SBV, hohe Verlässlichkeit. Detailtabelle hinter Paywall.*
5. **LMV 2026–2031 Bauhauptgewerbe** – https://svk-bau.ch/wp-content/uploads/2026_01_20-LMV-2026-2031-DE.pdf · https://www.ffe-fbv.ch/de/marche-du-travail/aktivitaeten/convention-nationale/neuer-landesmantelvertrag-lmv-2026-2031 · https://blog.sorba.ch/lmv-2026 · https://www.gav-service.ch/gav/100001/version/16/vertrag/12039 – abgerufen 17.08.2026 via Suchindex – *Der GAV-Volltext ist die massgebliche Quelle; die SORBA-Zusammenfassung ist Anbieterinterpretation. Bandbreiten-Zahlen widersprüchlich – siehe D19.*
6. **SIMAP-Monitoring und KI-Vorprüfung: SCAIT, suisseoffer, Bidfix, Vergabemonitor** – https://www.scait.ch/ · https://suisseoffer.ch/news/newsletter-12-2024-ki-in-der-%C3%B6ffentlichen-beschaffung-zwischenstand-simap-api · https://bidfix.ai/portale/simap · https://www.bauenschweiz.ch/de/vergabemonitor/ · https://www.simap.ch/ – abgerufen 17.08.2026 via Suchindex – *Anbieterseiten mit Verkaufsinteresse; simap.ch und bauenschweiz als neutrale Gegenprüfung.*
7. **Buildots, OpenSpace, HoloBuilder: Baufortschritt aus Bildern** – https://www.planungsmethode-bim.com/buildots-revolutioniert-baumanagement-mit-ki/3943/ · https://www.planradar.com/de/360-fotodokumentation-software/ · https://www.dabonline.de/bueropraxis/ki-kuenstliche-intelligenz-architektur-baustelle-planung-bim-programme-software – abgerufen 17.08.2026 via Suchindex – *Die 30-%-Angabe stammt aus einem Fachportal-Artikel ohne Primärstudie. Nur als Anbieteraussage zitieren.*
8. **UVG-/Suva-Unfallstatistik** – https://www.unfallstatistik.ch/d/publik/unfstat/pdf/Ts25.pdf · https://www.unfallstatistik.ch/ · https://www.srf.ch/news/dialog/suva-statistik-das-sind-die-zehn-gefaehrlichsten-branchen-der-schweiz · https://www.20min.ch/story/suva-daten-die-gefaehrlichsten-jobs-der-schweiz-sind-auf-dem-bau-103233122 – abgerufen 17.08.2026 via Suchindex – *UVG-Sammelstatistik ist Primärquelle, höchste Verlässlichkeit; Prämiensätze über Medienberichte sekundär.*
9. **CRB Normpositionen-Katalog NPK, CRBX, Lizenzen** – https://www.crb.ch/de/normen-standards/normpositionen/normpositionen-katalog-npk · https://www.crb.ch/de/normen-standards/normpositionen/lizenzen-normpositionen-katalog-npk · https://www.crb.ch/de/normen-standards/normpositionen/web-applikation-npk-viewer – abgerufen 17.08.2026 via Suchindex – *CRB ist der offizielle Standardgeber für das Schweizer Bauwesen. Höchste Verlässlichkeit.*
10. **Bauhandwerkerpfandrecht, Änderungen ab 1.1.2026** – https://www.tbp-law.ch/de/aktuelles/das-bauhandwerkerpfandrecht-wichtige-neuerungen-ab-1-januar-2026 · https://www.gerichte-zh.ch/themen/bau-werk/bauhandwerkerpfandrecht.html · https://www.hev-schweiz.ch/eigentum/baubereich/gu-tu-vertrag/bauhandwerkerpfandrecht – abgerufen 17.08.2026 via Suchindex – *Gerichte ZH als Behördenquelle (hoch); Anwaltskanzlei für die 2026-Änderung. Der ZGB-Volltext (fedlex) war proxy-blockiert – vor dem Meeting am Gesetzestext gegenprüfen.*

**Quellen [11]–[16] übernommen aus der Schwesterrecherche** `/home/user/WebAppKurzbefehl/praesentation/recherche/04-bau-schweiz-markt.md` **bzw.** `01-kmu-ki-schweiz.md`**, dort mit vollständiger URL und Verlässlichkeitseinordnung dokumentiert:**

11. **Margen Bauhauptgewerbe 2–3 % (2022)** – SBV-Quartalserhebung, https://baumeister.swiss/stabil-hohe-bautaetigkeit-im-2022-zusaetzlicher-druck-auf-die-tiefen-margen/ – *[V] Bezugsjahr 2022, als vier Jahre alt kennzeichnen.*
12. **Fachkräftemangel bis 2040: 5'600 fehlende Fachkräfte** – SBV-Studie/Demografik, https://baumeister.swiss/sbv-veroeffentlicht-studie-zum-fachkraeftemangel-im-bauhauptgewerbe/ – *Verbandsauftragsstudie.*
13. **Rekrutierungskosten 13'570 CHF pro Einstellung** – ifp Basel, https://www.ifp-basel.ch/fachkraefte-rekrutierung-im-wandel-analyse-der-kostenstrukturen-in-einem-dynamischen-arbeitsmarkt/ – *Personalberatung, Eigeninteresse. Mittlere Verlässlichkeit.*
14. **SIA 118, KBOB-Nachtragsleitfaden V2.0, BauAV 2022, PBK-Kontrollen, BIM-Pflicht, MWST 8,1 %, simap-Volumen** – Quellen [13], [14], [21], [25], [26] in `04-bau-schweiz-markt.md`, u. a. https://www.kbob.admin.ch/ · https://www.suva.ch/de-ch/praevention/nach-branchen/baustellen-sicher-machen/aktuelle-bauarbeitenverordnung-bauav-2022 · https://www.estv.admin.ch/de/mwst-saldosteuersaetze-pauschalsteuersaetze – *Behördenquellen, hohe Verlässlichkeit; die 41-Mrd.-Beschaffungszahl stammt aus einem Anbieter-Blog und ist gegenzuprüfen.*
15. **KI-Nutzung Schweizer KMU (Übersetzung 52 %, Korrespondenz 47 %), Ausländeranteil >80 % in tiefen Lohnklassen, revDSG/EDÖB, KI-Konvention Europarat** – AXA/Sotomo KMU-Arbeitsmarktstudie 2025 (https://www.axa.ch/de/ueber-axa/medien/medienmitteilungen/aktuelle-medienmitteilungen/2025/20251008-kmu-arbeitsmarktstudie-2025-ki.html), Statista/SBV, EDÖB (https://www.edoeb.admin.ch/de/ki-und-datenschutz) – *EDÖB amtlich (hoch), AXA-Studie n = 300 KMU.*
16. **Rework 4–10 % der Projektkosten, 56 % mit QA/QC unter 5 %** – PlanRadar auf Basis Bond University (Love et al.), https://www.planradar.com/us/cost-of-rework-construction/ – *Softwareanbieter als Aggregator peer-reviewter Forschung. Internationale, NICHT schweizspezifische Daten.*
