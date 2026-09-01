# Recherche: Was ein Auftragssystem für einen Sanitär-Showroom können muss

Stand: September 2026 · Grundlage für BADWERK (`bad/index.html`) und [`KONZEPT.md`](KONZEPT.md)

Acht Fachgebiete waren geplant. Vier wurden mit Websuche bearbeitet
(Markt, Software, Zahlung, Lieferantenlogistik); vier weitere (Produkte
und Stücklisten, Partner-Ökosystem, Tablet-Bedienung, Automatisierung und
Datenschutz) stammen aus Fachwissen, weil das Kontingent für parallele
Rechercheagenten während der Arbeit erschöpft war.

> **Zur Belastbarkeit:** Die Websuche funktionierte; das vollständige
> Öffnen der Seiten wurde vom Netzwerk-Proxy blockiert. Die Befunde
> beruhen auf Suchauszügen der genannten Quellen plus Fachwissen und
> tragen eine Sicherheitsangabe (hoch/mittel/tief). **Alles, was rechtlich
> oder finanziell zählt – Stripe-Gebühren und TWINT-Limite, OR-Fristen,
> MWST, QR-Rechnungs-Version, Rügefristen, Provisionsmodelle – gehört vor
> dem produktiven Einsatz gegen die Originaltexte geprüft.** Konkrete
> Lieferfristen je Hersteller sind Erfahrungswerte und in der App als
> editierbare Standardwerte hinterlegt.

---

## 1 Markt: Wie Schweizer Sanitär-Showrooms Geld verdienen

Die Schweizer Bad-Ausstellungen der Grossisten (Sanitas Troesch, Richner, Sabag, Gétaz Miauton) arbeiten im dreistufigen Vertrieb: Sie beraten Endkunden kostenlos, offerieren mit unverbindlichen Bruttopreisen und wickeln Verkauf, Lieferung und Montage über den Sanitärinstallateur ab, der dem Kunden die definitive Netto-Offerte inkl. Arbeit stellt; rund 81 % des Sanitärmaterials läuft über den Grosshandel, und die Installateure verdienen über Rabattkategorien von ca. 12–30 % plus eigene Marge. Herstellerausstellungen (Geberit, Laufen, KWC) verkaufen gar nicht, sondern verweisen an Grossisten und Installateure; ein markenunabhängiger Kleinshowroom wie das Dusch-WC Center Zürich verkauft direkt und montiert selbst. Carlos' Modell (Direktverkauf an Endkunden, Montage durch externe Sanitärbetriebe) liegt dazwischen und entspricht dem deutschen ELEMENTS-Konzept in umgekehrter Rollenverteilung: Dort plant die Ausstellung und der Handwerker fakturiert; bei Carlos fakturiert der Showroom das Material und der Handwerker nur die Montage. Daraus folgen die Kernanforderungen: saubere Trennung von Material, automatisch angehängtem Installationsmaterial, Zusatzleistungen und Partner-Montage; zwei Preisebenen; explizite Garantiezuordnung; Anzahlung statt Vollzahlung; Bestellstatus mit bestätigtem Liefertermin als Anker der Mahnautomation; Phasenlogik für Rohinstallation vs. Fertigmontage. Explizite Provisions- oder Abo-Modelle Showroom↔Installateur sind in der Schweiz nicht öffentlich dokumentiert (Sicherheit tief); üblich sind Rabattkategorien und Jahresboni, Tippgeberprovisionen liegen im Handwerk um 5–10 %. Ein Partner-Portal mit Terminbuchung, Gratis-/Abo-/Objektpartner-Stufen und beidseitiger Vermittlungsprovision ist plausibel und differenzierend, muss aber kartellrechtlich ohne Preisabsprachen gestaltet werden. Typische Schmerzen des kleinen Showrooms sind Beratungsklau, Abhängigkeit vom Installateur bei Termin und Endpreis, unverbindliche Lieferfristen und Teillieferungen, Garantie-Pingpong und fehlende Statusübersicht; genau dort setzt das System an (Beratungspauschale mit Anrechnung, Lieferanten-Bestätigung per Klick, Auftrags-Tracking bis Archivierung). Hinweis zur Methode: Die Websuche funktionierte, das vollständige Öffnen der Seiten wurde vom Netzwerk-Proxy blockiert; die Befunde beruhen auf Such-Snippets der genannten Quellen und Fachwissen, die Sicherheitsangaben sind entsprechend gesetzt.

**Befunde**

- Die Schweizer Sanitärbranche funktioniert im dreistufigen Vertrieb: Hersteller → Grosshändler mit Ausstellung (Sanitas Troesch, Richner, Sabag, Gétaz Miauton) → Sanitärinstallateur → Endkunde. Rund 81 % der Sanitärprodukte laufen über den Grosshandel. Der Showroom des Grossisten verkauft in der Regel NICHT direkt an den Endkunden, sondern über den Installateur. *(hoch; [Quelle 1])*
- In den Ausstellungen werden nur Bruttopreise (Listenpreise) gezeigt. Den Nettopreis erfährt der Endkunde erst vom Installateur. Installateure haben ein Interesse an hohen Bruttopreisen, weil sie dem Kunden dann hohe Rabatte zeigen können; im Service- und Ersatzgeschäft verrechnen sie oft den vollen Bruttopreis. Hohe Bruttopreise = hohe Endkundenpreise und hohe Installateur-Margen. *(hoch; [Quelle 2])*
- Installateur-Konditionen: Sanitärinstallateure erhalten beim Grosshandel typischerweise 12–25 % (Forumsangabe: rund 30 %) Rabatt auf die Listenpreise, bei Billigprodukten weniger. Wie viel davon an den Endkunden weitergegeben wird, entscheidet der Installateur; der Endkunde kann beim Grossisten nicht direkt zu Handwerkerpreisen kaufen. *(mittel; [Quelle 3])*
- Ablauf bei Sanitas Troesch (Marktführer, 23 Standorte, über 5'000 Partner-Installateure): Beratung in der Ausstellung ist kostenlos; der Fachberater erstellt eine detaillierte Offerte mit unverbindlichen Richtpreisen (Bruttopreisen); diese wird mit Architekt oder Installateur besprochen, der die definitive Netto-Gesamtofferte inkl. aller Arbeiten und Bauleitung erstellt; der Installateur führt den Auftrag zusammen mit Sanitas Troesch aus. *(hoch; [Quelle 4])*
- Im Online-Shop von Sanitas Troesch tragen Badewannen, Badmöbel und WCs ein 'Installateur-Symbol' und sind ausschliesslich über einen Fachbetrieb erhältlich; Privatkunden können sie nur als Merkliste für ihre Fachperson speichern. Nur Zubehör (WC-Deckel, Halter) ist direkt kaufbar. Shop-Preise können von den Preisen des Fachbetriebs abweichen. *(hoch; [Quelle 5])*
- SABAG: 'Nach der persönlichen Beratung erstellt SABAG eine Offerte und koordiniert Lieferung und Kaufabwicklung direkt mit Ihrem Sanitär.' SABAG begründet den dreistufigen Vertrieb explizit mit Normenkonformität, Garantie, After-Sales-Service und Nachhaltigkeit. *(hoch; [Quelle 6])*
- Richner ('Badplanung neu gedacht'): Privatkunden UND Zwischenhändler (Installateure) erhalten Offerten direkt. In der Ausstellung informieren sich Kunden per QR-Code und Smartphone selbständig, erstellen mit dem Berater eine Wunschliste, aus der direkt eine Offerte generiert wird. Lieferung und Montage erfolgen durch den Sanitärpartner des Kunden. Das ist die nächste Referenz für ein Tablet-/QR-gestütztes Offertentool. *(hoch; [Quelle 7])*
- Gétaz Miauton (Romandie, CRH-Gruppe wie Richner) montiert nicht selbst, hilft dem Kunden aber, passende Partnerbetriebe zu finden, und verspricht: 'Von der Bestellung bis zur Installation kennt der Kunde jederzeit den Status seines Projekts.' Auftrags-Tracking ist somit ein erklärtes Leistungsversprechen der Grossen. *(mittel; [Quelle 8])*
- Hersteller (Geberit, Laufen, KWC) betreiben Händlersuchen 'Badausstellung oder Installateur finden' und eigene Ausstellungen mit Terminvereinbarung, verkaufen aber nicht direkt an Endkunden; sie verweisen an Grossisten-Ausstellungen und Installateure mit Ausstellung. Herstellerausstellungen sind Marketing-, keine Verkaufsstellen. *(hoch; [Quelle 9])*
- Die WEKO büsste 2013 acht Sanitärgrosshändler (Sanitas Troesch, Richner, Gétaz-Miauton, Reco Regusci u. a.) mit insgesamt rund CHF 80 Mio., weil sie sich 1997–2011 über Margen, Bruttopreise, Euro-Umrechnungskurse, Transportkosten, Rabatte und Rabattkategorien abgesprochen hatten. Das Brutto-/Rabattkategorien-System ist also die zentrale Branchenlogik und gleichzeitig kartellrechtlich heikel. *(hoch; [Quelle 10])*
- Referenzmodell ELEMENTS (GC-Gruppe, DE/AT, ca. 220 Ausstellungen, ca. 8'000 Handwerker): Die Ausstellung berät und plant, 'die Rechnung stellt Ihr Handwerker'; Direktbestellung ist nicht möglich. ELEMENTS übernimmt auf Wunsch die gesamte Administration von Terminvereinbarung bis zur fertigen Offerte und vermittelt Kunden ohne Handwerker an Partnerbetriebe. Der Handwerker legt in einem individuellen Mandatsvertrag bevorzugte Produkte und seine Kalkulationsrichtlinien fest, die Ausstellung offeriert danach in seinem Namen. Seit 2020 gibt es Video-Beratung. *(hoch; [Quelle 11])*
- Gegenmodell Dusch-WC Center Zürich (markenunabhängiger Spezial-Showroom): 'Unabhängige Beratung, Showroom, Verkauf und fachgerechte Montage an einem Ort', liefert und montiert schweizweit selbst. Zeigt: Ein kleiner unabhängiger Showroom, der direkt an Endkunden verkauft, positioniert sich über Spezialisierung, Probierräume und 'alles aus einer Hand'. Carlos' Modell (Verkauf ja, Montage nein) liegt dazwischen und braucht deshalb einen verbindlichen Partnerprozess. *(hoch; [Quelle 12])*
- Beratungsklau ist die zentrale Schmerzstelle: Rund ein Drittel der Konsumenten lässt sich stationär beraten und kauft danach online; Badbetriebe investieren bis zu 20 Stunden in Erstplanung und 3D-Simulation. Kostenpflichtige Beratung/Planung ist zulässig, braucht aber eine ausdrückliche, vorgängige Vereinbarung. *(mittel; [Quelle 13])*
- Kostenrahmen Schweiz: Badumbau CHF 15'000 (Gäste-WC) bis CHF 80'000 (Masterbad); Familienbad 6–8 m² CHF 25'000–45'000 inkl. Material, Sanitär, Platten; professionelle Badplanung ca. CHF 2'200; Montage Badewanne CHF 540–1'540; Armaturen CHF 200–3'000, Schweizer Armaturen (KWC, Similor) CHF 300–1'500; Stundensatz Sanitär CHF 100–150. Wannenwechsel 2–3 Arbeitstage, Komplettbad 5–10 Arbeitstage. *(mittel; [Quelle 14])*
- Konkrete Marktpreise (Endkunde, CH): Kaldewei Cayono 170×75 Stahl-Email CHF 638–689 (exkl. MWST); KWC Ava 2.0 Waschtischmischer CHF 271–371 (Sanitas Troesch Shop CHF 370.80), Bademischer ab CHF 410; Geberit AquaClean Mera Comfort ab CHF 3'690. *(hoch; [Quelle 15])*
- Lieferfristen: Lagerware der Hersteller (z. B. Kaldewei) ca. 1 Woche, Auftragsfertigung ca. 4 Wochen; Duravit Möbelsets 1–2 Wochen. Grossisten liefern 'sortiert nach Bauphase' auf die Baustelle. Lieferfristen sind gemäss AGB der Grossisten (Sanitas Troesch) UNVERBINDLICH; Nichteinhaltung gibt kein Rücktrittsrecht. Die Bestellbestätigung kommt per E-Mail direkt nach Bestellung, ihre Preise sind massgebend; Schlussrechnung 20 Tage netto, Verzugszins mind. 5 %. *(mittel; [Quelle 16])*
- Zahlungsusanz Schweiz: Nach OR 372 ist Zahlung nach Vollendung die gesetzliche Regel, Akontozahlungen sind bei schriftlicher Vereinbarung zulässig. Empfohlene Staffel: 30 % bei Auftrag, 30 % nach Vorinstallation, 30 % bei Fertigstellung, 10 % nach Abnahme. Eine OR-konforme Offerte braucht: Anbieter, Leistungsbeschrieb, Preise exkl./inkl. MWST, Gültigkeitsdatum, Zahlungsbedingungen. *(mittel; [Quelle 17])*
- Tablet-Unterschrift: Kauf- und Werkverträge sind in der Schweiz formfrei; eine Unterschrift mit Stift auf dem Tablet ist gültig. Eine qualifizierte elektronische Signatur (QES) ist nur bei gesetzlichem Schriftformerfordernis nötig, was auf Bad-Offerten nicht zutrifft. *(hoch; [Quelle 18])*
- Gewährleistung bei vom Kunden gekauftem Material: Der Installateur bleibt Werkunternehmer und kann seine Gewährleistung auf die Arbeitsleistung beschränken; Produktmängel muss der Kunde beim Händler/Hersteller geltend machen. In der Schweiz haftet gegenüber dem Bauherrn oft der Installateur, deshalb sind Sanitärbetriebe beim Einbau 'fremder' Ware zurückhaltend oder verlangen einen schriftlichen Haftungsausschluss. Für Carlos heisst das: Garantiezuständigkeiten müssen in Offerte und Auftrag explizit stehen. *(mittel; [Quelle 19])*
- Marktstruktur Installateure: suissetec (Gebäudetechnikverband) hat rund 3'600 Mitgliedsbetriebe in 24 Sektionen, überwiegend KMU. Unabhängige Sanitärbetriebe wie Bad Atelier Hollenstein (Wallisellen) bieten an, den Kunden 'in beliebigen Ausstellungen' zu beraten, Apparatewahl, Bestellkoordination mit Lieferanten und Bauleitung zu übernehmen. Der Installateur sieht sich also als Projektleiter, der Showroom als Lieferant. *(hoch; [Quelle 20])*
- Provisionsmodelle Showroom↔Installateur sind in der Schweiz nicht öffentlich standardisiert; die Vergütung läuft üblicherweise über Rabattkategorien und Jahresbonus (Umsatzrückvergütung) des Grossisten an den Installateur, nicht über eine explizite Provision. Für Empfehlungs-/Tippgebermodelle im Handwerk/Immobilien haben sich ca. 10 % (Tippgeber) bzw. 0.5 % der Auftragssumme (Bauunternehmen) etabliert. Ein Abo-Modell 'Showroom als Service für Installateure' ist am Markt nicht dokumentiert, das Elements-Modell (gratis für Partner, finanziert über den Materialeinkauf beim Grossisten) ist die nächste Analogie. *(tief; [Quelle 21])*
- Installationsmaterial Badewanne (immer benötigt): Ab- und Überlaufgarnitur, Wannenfüsse inkl. Wannenanker ODER Wannenträger (Hartschaum), Schallschutzset/Dämmband, Wannenrandprofil/Dichtband, Montageschaum. Einbauhöhe unter der Wanne ca. 120–130 mm für die Ablaufgarnitur. WC: Vorwandelement (z. B. Geberit Duofix), Betätigungsplatte, Schallschutzset, WC-Sitz. Lavabo: Siphon, Eckventile, Befestigungsset, Silikon. *(hoch; [Quelle 22])*
- Typische Schmerzen eines kleinen Showrooms ohne eigene Montage (aus Fachwissen, konsistent mit den Quellen): (1) Beratungsklau/Online-Preisvergleich; (2) Abhängigkeit vom Installateur, der Termin, Endpreis und Kundenbeziehung kontrolliert; (3) Doppel-Offerten Showroom/Installateur mit Preisdifferenzen; (4) unverbindliche Lieferfristen und Teillieferungen, die Montagetermine platzen lassen; (5) Zahlungsrisiko bei Vorbestellung teurer Massware (Duschwände, Möbel); (6) Garantiefälle, bei denen Showroom, Hersteller und Installateur sich gegenseitig zuweisen; (7) Kapazitätsengpass bei Installateuren (Fachkräftemangel) → Wartezeiten von Wochen; (8) fehlende Statusübersicht pro Auftrag, viel Telefon/E-Mail-Nachfragen; (9) Ausstellungsfläche und Musterware binden Kapital. *(mittel; Fachwissen)*

**Folgen für das Produkt**

- Zwei Preisebenen im Datenmodell: Bruttopreis (Listen-/Ausstellungspreis) und Partnerpreis (Rabattkategorie je Sanitärbetrieb, z. B. Kat. A 25 %, Kat. B 18 %). Carlos verkauft direkt an Endkunden, also zeigt die Tablet-Offerte Endkundenpreise; für Partnerbetriebe, die Kunden bringen, muss dieselbe Offerte im Partner-Portal mit Partnerpreis bzw. Provision sichtbar sein.
- Offerte strikt in Blöcke trennen: (a) Produkte, (b) automatisch angehängtes Installationsmaterial (Stückliste je Artikel, editierbar), (c) Zusatzleistungen/Komfort-Extras mit hoher Marge, (d) Montage durch Partnerbetrieb (Richtpreis oder Pauschale, Vertragspartner = Sanitärbetrieb, klar deklariert). Der Kunde bezahlt bei Carlos nur (a)–(c) und allenfalls die vermittelte Montagepauschale.
- Nicht Vollzahlung, sondern Anzahlung bei Unterschrift: Empfehlung 40 % per TWINT/Stripe direkt am Tablet, Rest per Swiss QR-Rechnung 20 Tage netto nach Montage/Abnahme. Vollzahlung vor Lieferung ist in der Branche unüblich und bei unverbindlichen Lieferfristen ein Reputationsrisiko. Offerte muss OR-Pflichtangaben tragen (Anbieter, Leistungsbeschrieb, Preise exkl./inkl. MWST 8.1 %, Gültigkeit 30 Tage, Zahlungsbedingungen); die Tablet-Unterschrift ist rechtlich ausreichend, PDF mit Zeitstempel archivieren.
- Objektkontext auf montage- und logistikrelevante Felder verdichten: Gebäudetyp (EFH / MFH-Mietwohnung / Stockwerkeigentum), Stockwerk + Lift ja/nein, Neubau/Sanierung, Baujahr bzw. 'Vorwandsystem vorhanden?', Zugang/Parkplatz, bei Mietwohnung: Freigabe der Verwaltung nötig, gewünschtes Montagefenster. Diese Felder steuern Regeln: Sanierung ohne Vorwand → Duofix-Element automatisch dazu; kein Lift + Stockwerk > EG → Zusatzleistung 'Etagenlieferung' vorschlagen; Sanierung → 'Entsorgung Altapparate' vorschlagen; Mietwohnung → Status 'Freigabe Verwaltung ausstehend'.
- Bestellstatus-Modell je Lieferantenbestellung: bestellt → bestätigt (mit BESTÄTIGTEM Liefertermin, der von der Standardfrist abweichen darf) → avisiert/versendet → eingetroffen (QR-Scan im Lager) → Differenz/Teillieferung. Die Mahnautomation muss am bestätigten Termin hängen (T-5: 'Versandstatus?', T+1: Verzug + Kunden-Mail-Entwurf, T+5: Eskalation an Carlos), nicht nur an der Standardfrist. Kundenkommunikation immer mit 'voraussichtlich', weil Lieferfristen branchenweit unverbindlich sind.
- Montagetermin-Freigabe erst, wenn alle montagerelevanten Positionen gescannt sind (PO-Regel), aber mit Phasen-Flag: Phase 1 Rohinstallation (Duofix, Ablauf, Wannenträger) und Phase 2 Fertigmontage (Keramik, Armaturen, Möbel, Duschwand). So kann der Partnerbetrieb die Vorinstallation vor dem Plattenleger starten, ohne dass Massware (Duschwand, Möbel) schon da sein muss.
- Partnerbetriebe als eigene Rolle mit Login-Code und Partner-Portal: Showroom-Termin buchen (Kunde mitbringen), eigene Kunden-Offerten einsehen, Montagepreis ergänzen, Montagetermin bestätigen, Monteur zuweisen. Vergütungsmodell als Datenfeld pro Partner: 'Gratis-Partner' (Provision 5 % auf Materialumsatz zugeführter Kunden an den Partner, Termin-Slots normal), 'Abo Gold' (CHF 190/Monat, exklusive Abend-/Samstagsslots, Kaffee & Gipfeli, keine Provision), 'Objektpartner' (Rabattkategorie A). Umgekehrt: Wenn Carlos einen Kunden an den Partner vermittelt, erhält Carlos 5 % Vermittlungsprovision auf die Montagesumme. Wichtig: keine Preisabsprachen zwischen Partnern abbilden (WEKO), Provisionen transparent ausweisen.
- Garantiezuständigkeit explizit im Datenmodell: je Artikel 'Produktgarantie' (Hersteller, z. B. 2 Jahre Standard, 30 Jahre Kaldewei-Emaille, 10 Jahre Geberit Ersatzteile) und je Auftrag 'Montagegewährleistung: Partnerbetrieb X, 2 Jahre nach SIA 118'. Das steht auf Offerte, Auftragsbestätigung und Rechnung und verhindert das gegenseitige Zuschieben im Garantiefall.
- Beratungsklau adressieren: '3D-Badplanung / Beratungspauschale' als buchbare Position (z. B. CHF 490, bei Kauf vollständig angerechnet) plus Wunschliste per QR-Code am Ausstellungsstück (Richner-Modell), damit Beratungsaufwand erfasst und Kunden im System 'gehalten' werden; Wunschliste → Offerte in einem Klick.
- Auftrags-Statuskette als Rückgrat des Dashboards: Offerte → unterschrieben/Anzahlung → bestellt → teilweise bestätigt → alle bestätigt → Ware eingetroffen (Scan) → Terminvorschlag an Kunde → Termin bestätigt → Monteur informiert → montiert/abgenommen → Schlussrechnung (QR) → bezahlt → archiviert. Dashboard-Kacheln: 'Wartet auf Bestätigung', 'Lieferung überfällig', 'Bereit für Termin', 'Rechnung offen'.
- Rollen-Vorschlag über 1234 (Carlos) und 98765 (Lager) hinaus: 2468 Verkauf/Beratung (Tablet-Modus), 5555 Partner-Sanitärbetrieb (Portal), 7777 Monteur (Mobil-Ansicht mit Tagesplan, Objektinfos, Stückliste, Abnahme-Unterschrift), Kunde via Magic-Link ohne Code (Status, Terminwahl, Rechnung). Lieferanten-Portal ebenfalls via Link: Bestellung mit einem Klick 'bestätigen + Liefertermin eintragen' statt E-Mail-Parsing; das ist zugleich das verkaufbare 'KI-Lieferantenprodukt' des PO.
- Verpasstes Potenzial, das das System sinnvoll ergänzt: After-Sales-Modul (Dusch-WC-Entkalker, Filter, Ersatzteile, Service-Abo 'Bad-Check' CHF 149/Jahr); Objektgeschäft für Verwaltungen/Architekten (Mehrfachbestellung gleicher Bäder); Video-Beratung mit Terminbuchung; Empfehlungslink für Partner mit Tracking; Lagerbestand von Musterware/Ausstellungsstücken (Abverkauf mit Rabatt); Kennzahlen: Marge je Auftrag, Lieferantentreue (Anteil pünktlicher Lieferungen), Conversion Beratung→Offerte→Auftrag.

**In BADWERK umgesetzt:** siehe KONZEPT.md, Abschnitte 2, 5 und 8.

---

## 2 Software: Was es gibt – und was fehlt

Das Netz war teilweise verfügbar: WebSearch lieferte für rund 30 Anfragen inhaltliche Auszüge, WebFetch war für alle ca. 27 versuchten Domains (inkl. Hersteller-, Vergleichs- und Wikipedia-Seiten) durch den Egress-Proxy blockiert; die Befunde stützen sich deshalb auf Suchauszüge plus Fachwissen und sind entsprechend mit Sicherheitsgraden versehen. Der Markt teilt sich in drei Gruppen: Schweizer KMU-Software (bexio, KLARA, Abacus, SORBA, Baunex) mit guter Offerte/Rechnung/QR-Rechnung, aber ohne Handwerks- und Beschaffungsprozesse; deutsche SHK-Branchen-ERPs (pds, Label, TAIFUN, STREIT) mit vollständigem Bestellwesen, Grosshandelsschnittstellen (DATANORM, IDS-Connect, UGL), Wareneingang per QR und teilweise Online-Terminvereinbarung, aber schwergewichtig, installateurzentriert und nicht CH-/Showroom-tauglich; und Cloud-Handwerkertools (HERO, ToolTime, Plancraft, Meisterwerk, Craftboxx) mit Tablet-Angebot, digitaler Unterschrift, Online-Annahme per Link und rechnungsbezogener Online-Zahlung für EUR 10–250 pro Monat. Hersteller- und Händler-Konfiguratoren (Geberit, Sanitas Troesch, Hansgrohe, Richner) enden bei 'Entwurf an Fachhändler senden' und haben weder Offerte noch Zahlung noch Bestellung. Nirgends gefunden wurde die Kombination, die der PO beschreibt: Produkt mit automatischem Installations-Kit, geführtes Upselling mit Marge, Unterschrift und Anzahlung (TWINT/Karte) direkt auf die Offerte, Bestellung an mehrere Lieferanten mit Bestätigungsverfolgung, automatische Lieferfrist-Mahnung, Wareneingang per Auftrags-QR, Kundenterminwahl erst bei Vollständigkeit und Steuerung externer Montagebetriebe. Das dreistufige Schweizer Modell (Hersteller–Grosshandel/Ausstellung–Installateur) erklärt die Lücke: Ausstellungen erstellen nur Richtofferten, der Installateur verkauft und montiert; ein Showroom, der direkt an Endkunden verkauft, braucht eigene Software. Wirtschaftlich sprechen Stripe-Gebühren (2.9 % Karte, 1.9 % TWINT) und die übliche 30-%-Anzahlung für ein Anzahlungsmodell statt Vollzahlung; rechtlich genügt die einfache elektronische Signatur mit Audit-Trail. Der grösste unbesetzte Hebel ist das Partnermodell, bei dem Sanitärbetriebe Showroom-Termine für ihre Kunden buchen und über Provision oder Abo eingebunden werden. Empfehlung: ein schlankes 'Showroom-Auftragssystem' mit CRM-Kern und Zeitleiste pro Auftrag bauen, Buchhaltung, Aufmass und 3D-Planung bewusst weglassen und Lieferfrist-Überwachung, Partnerportal und Auftrags-QR als Differenzierung in den Vordergrund stellen.

**Befunde**

- Die bekannten Schweizer KMU-Tools (bexio, KLARA, Abacus, SelectLine) decken Offerte, Rechnung mit QR-Rechnung, MWST und Buchhaltung ab, sind aber keine Handwerks- oder Showroom-Systeme: Aufmass, Stücklisten pro Produkt, Einsatzplanung, Lieferfristüberwachung und Fremdmonteur-Steuerung fehlen. bexio bietet Online-Zahlung (TWINT, Visa, Mastercard über Worldline) auf Rechnungen; KLARA Business startet bei ca. CHF 26/Monat mit Auftragsverwaltung von der Offerte bis zum Mahnwesen und myKLARA-App. *(hoch; [Quelle 23])*
- Schweizer Bau-/Handwerkslösungen: SORBA ist im Bauhauptgewerbe stark (Offerte & Abrechnung, Regie, myRapport-App mit Unterschrift von Kunde und Firma auf dem Regierapport, WebOffer als Offerten-Generator); Baunex (Starter ab CHF 24/Nutzer/Monat, Pro ab CHF 34) bietet Sanitär-Offerten, Rapporte mit Tablet-Unterschrift und eine bidirektionale bexio-Schnittstelle; AAA EDV ist auf HLKS-Berechnungen (SIA) spezialisiert. Vertec zielt auf Dienstleister (Projekte/Zeiten), nicht auf SHK-Materialprozesse. *(mittel; [Quelle 24])*
- Deutsche SHK-Branchen-ERPs (pds, Label/Labelwin mit >2'900 Betrieben, TAIFUN, STREIT V.1) sind funktional am vollständigsten: Kalkulation mit Leistungspaketen, Lager, Bestellwesen mit automatischen Bestellvorschlägen, Grosshandelsanbindung. Label hat als Zusatzmodul eine Online-Terminvereinbarung, bei der der Kunde den Termin selbst wählt. Diese Systeme sind jedoch installateurzentriert, schwergewichtig (Desktop, Module, Schulung) und nicht auf CH-Zahlungsmittel oder einen Showroom-Verkaufsprozess am Tablet ausgelegt. *(hoch; [Quelle 25])*
- Grosshandels-Schnittstellen im DACH-SHK-Markt: DATANORM (Artikelstamm/Preise), IDS-Connect (Warenkorb, Verfügbarkeit, Bestellung aus der Software in den Grosshändler-Shop), UGL (Preisanfrage, Bestellung, Einlesen von Auftragsbestätigungen), Open Masterdata und SHK-Connect. pds ordnet den Lieferschein des Grosshändlers automatisch der Bestellung zu und erzeugt den Wareneingang; die pds Material-App bucht Wareneingänge per QR-/Barcode. Die Auftragsbestätigung des Lieferanten als Datenobjekt am Auftrag ist also Branchenstandard – aber nur bei den grossen Systemen. *(hoch; [Quelle 26])*
- Cloud-Handwerkersoftware (HERO, ToolTime, Plancraft, Meisterwerk, Craftboxx, openHandwerk) kostet ca. EUR 10–250 pro Monat: Craftboxx ab EUR 9.99, Meisterwerk/ToolTime Einstieg EUR 15–29, ToolTime Vollumfang EUR 59/Nutzer, Plancraft Business EUR 59.90 (Pro 139.90, Premium 249.90). HERO erstellt Angebote/Rechnungen am Tablet vor Ort mit rechtsgültiger digitaler Unterschrift, auch offline, und hat mit HERO Wallet Online-Zahlung und Rechnungsabgleich. ToolTime lässt den Kunden ein Angebot online per Button annehmen. Craftboxx/Meisterwerk fokussieren Einsatzplanung, Zeiterfassung, Unterschrift auf dem Handy. *(hoch; [Quelle 27])*
- Bei den Cloud-Tools sind Offert-Konfiguratoren nur Positionsvorlagen/Leistungspakete: Es gibt keinen echten Produkt-zu-Stückliste-Automatismus (Badewanne → Installationsmaterial), kein geführtes Upselling mit Margenlogik, keine Kunden-Online-Zahlung auf die Offerte (Zahlung ist rechnungsbezogen), keine Lieferfristüberwachung mit automatischer Lieferantenmahnung und keine Steuerung externer Monteure. Das ist die eigentliche Lücke. *(mittel; Fachwissen, gestützt auf die oben genannten Produktseiten (HERO, ToolTime, Plancraft, Craftboxx, Meisterwerk))*
- Hersteller- und Händler-Konfiguratoren (Geberit 3D-Badplaner, Sanitas Troesch Badplaner/Plan-App, Hansgrohe Showroom-App mit Waschtisch-/Armatur-Konfigurator, Kamera-Funktion und Händlersuche, Bodenschatz-Konfigurator, Richner mit QR-Codes an Ausstellungsstücken, die zu Materiallisten und Preisen führen) dienen der Inspiration und Planung. Sie enden mit 'Entwurf an Beratung/Fachhändler senden'. Es gibt keine verbindliche Offerte, keine Unterschrift, keine Zahlung, keine Bestellung, keine Montagesteuerung. *(hoch; [Quelle 28])*
- Das Schweizer Bad-Geschäft ist dreistufig: Hersteller → Grosshandel/Ausstellung (Sanitas Troesch mit 24 Ausstellungen, >5'000 Installateur-Partnern und 72'000 Artikeln im Profishop; Richner; SGVSB-Grosshändler) → Sanitärbetrieb → Endkunde. Die Ausstellung erstellt eine 'Richtofferte mit unverbindlichen Richtpreisen', die verbindliche Offerte und Montage laufen über den Installateur. Ein Showroom, der direkt an Endkunden verkauft und Fremdmonteure koordiniert, ist damit ein Sonderfall, den keine Standardsoftware abbildet. *(hoch; [Quelle 29])*
- Spezialisierte Bad-/Küchen-Showroom-Software existiert: Palette CAD (3D-Badplanung und Verkauf in einem Tool, Palette Rooms), Compusoft/Cyncly InnoPlus (>40 Hersteller, Arge-Daten, InnoPlus Web für Endkunden, 'für Betriebe ohne eigene Ausstellung'), Winner Flex als visuelles CPQ, im angelsächsischen Raum KitchenDEV Retailer Suite (Quoting, Sales-Pipeline), Cyncly Payments, Houzz Pro (Estimate mit E-Signatur), Quote Countertops (Online-Bezahlung). Diese sind planungs- bzw. küchenlastig, teuer, ohne TWINT/QR-Rechnung und ohne Fremdmonteur-Terminlogik. *(mittel; [Quelle 30])*
- Zahlung in der Schweiz über Stripe: Karten aus der Schweiz 2.9 % + CHF 0.30, TWINT 1.9 % + CHF 0.30 pro Transaktion; TWINT ist bei Stripe über Checkout/Payment Element per QR-Code bzw. App-Redirect verfügbar. Der Handelsverband kritisiert im August 2026 die Höhe der TWINT-Gebühren. Für eine Offerte von CHF 15'000 bedeuten Karten rund CHF 435 Gebühren, TWINT rund CHF 285 – Anzahlung statt Vollzahlung ist deshalb wirtschaftlich sinnvoll. *(mittel; [Quelle 31])*
- Rechtslage Unterschrift: Der Schriftzug auf dem Tablet ist eine einfache elektronische Signatur (EES) nach ZertES (SR 943.03) und für formfreie Verträge (Kauf-/Werkvertrag über Badprodukte) rechtsgültig; sie hat aber geringe Beweiskraft. Empfohlen ist ein Audit-Trail (Zeitstempel, Geräte-/IP-Info, Dokument-Hash, Offerten-PDF sofort per E-Mail an den Kunden). Skribble-QES ist für diesen Anwendungsfall unnötig. *(hoch; [Quelle 32])*
- Automatische Liefermahnungen (Toleranzfenster, Eskalationsstufen, E-Mail an Lieferant, Auswertung der Termintreue als Lieferantenkennzahl) sind in grossen ERPs (Dynamics 365 Business Central via Add-on, SOG ERP 'Einkaufsmahnungen', 3S ERP) etabliert, in Handwerks-Cloud-Tools praktisch nicht vorhanden. Die vom PO gewünschte Vorwarn-Mail 'Habt ihr das schon versendet?' ist damit fachlich Standard, aber im Zielsegment ein Differenzierungsmerkmal. *(mittel; [Quelle 33])*
- Realistische Lieferfristen Bad CH: Massmöbel talsee (Manufaktur Hochdorf LU) ca. 4–8 Arbeitswochen; Badmöbel je nach Oberfläche 3–5 Wochen; Standardkeramik, Armaturen und Installationsmaterial ab Grosshandelslager 1–5 Arbeitstage; Stahl-Email-Wannen in Sonderfarben/Sondermassen 2–4 Wochen. Der lange Pol (Möbel) bestimmt den Montagetermin, deshalb ist die Regel 'alle Positionen eingetroffen → Terminfreigabe' fachlich richtig. *(mittel; [Quelle 34])*
- Preisniveau CH 2026: WC CHF 180–900, Lavabo CHF 98–1'100, Duschwanne CHF 360–2'200, Badewanne CHF 540–1'490, Armaturen CHF 200–3'000; Sanitärstunde CHF 80–150; mittleres Familienbad CHF 25'000–45'000 inkl. Bauleistungen. Beim Vertragsabschluss ist eine Anzahlung von rund 30 % üblich; SIA 118 sieht Zahlungsfrist 30 Tage vor. Für einen reinen Produkt-Showroom liegt der typische Auftragswert bei CHF 5'000–20'000. *(mittel; [Quelle 35])*
- Partnerprogramme gibt es herstellerseitig (Hansgrohe Partner-Plattform/Showroom-Konzept, Kaldewei Ausstellungs- und Installateursuche, Viessmann/NIBE-Punkte- und Bonusmodelle), aber kein Produkt, mit dem Sanitärbetriebe Showroom-Beratungstermine für ihre Endkunden buchen, Leads zugeordnet werden und Provisionen abgerechnet werden. Die PO-Idee 'Sanitärbetriebe buchen Showroom-Slots, gratis oder als Abo' hat am Markt keinen direkten Wettbewerber. *(mittel; [Quelle 36])*
- Kundenportale mit Selbst-Terminbuchung existieren vereinzelt (Label Terminplaner, mfr Kundenportal, Bosch OfficeOn, generische Tools wie eTermin/Calendly), aber nirgends gekoppelt an die Bedingung 'Ware vollständig eingetroffen' und an die Verfügbarkeit eines externen Montagebetriebs. Für die Demo genügt ein eigener Slot-Kalender je Partnerbetrieb plus ICS-Export/Calendly-Link. *(mittel; [Quelle 37])*
- Installationsmaterial Badewanne (Grundlage für die automatische Stückliste): Wannenträger (Hartschaum) oder Wannenfüsse, Ab- und Überlaufgarnitur, Wannenanker/-schienen, Dichtband und Dichtecken, Schallschutzband, Sanitärsilikon, Revisionsöffnung. Beim Wand-WC: Vorwandelement/UP-Spülkasten, Betätigungsplatte, Anschlussgarnitur, Schallschutzset, Befestigungsset. Diese Kits sind pro Produkttyp konstant und lassen sich als 'immer dabei'-Positionen hinterlegen. *(hoch; [Quelle 38])*

**Folgen für das Produkt**

- Positionierung: kein ERP-Nachbau und kein 3D-Planer, sondern ein 'Showroom-Auftragssystem' (Order-to-Install-Tracker) mit CRM-Kern. Buchhaltung, Lohn, Aufmass und Badplanung bewusst weglassen; stattdessen Rechnung als PDF mit QR-Rechnungs-Platzhalter und einen bexio-/KLARA-Export vorsehen, Badplaner der Hersteller nur verlinken.
- Tablet-Offerte in vier Schritten verdichten: (1) Kunde + Objektkontext mit genau vier Feldern (Gebäudetyp EFH/Wohnung MFH, Stockwerk + Lift ja/nein, Neubau/Sanierung, Baujahr vor/nach 1990 als Hinweis auf Anschlussmasse), (2) Produkte mit automatisch angehängtem Installations-Kit (nicht abwählbar, als 'immer benötigt' markiert), (3) Optionen und Komfort-Extras mit sichtbarer Marge für Carlos, (4) Zusammenfassung, Unterschrift, Zahlung. Objektkontext erzeugt automatisch Zuschlagspositionen (Stockwerklieferung ohne Lift, Entsorgung Altmaterial bei Sanierung, Rohbau-Set bei Neubau).
- Unterschrift als einfache elektronische Signatur mit Audit-Trail (Zeitstempel, Geräte-Info, Dokument-Hash) und sofortigem Offerten-PDF per E-Mail; keine QES. Zahlung als Anzahlung (Demo: 40 %) über Stripe Checkout mit Karte oder TWINT im Testmodus, Restbetrag per QR-Rechnung 30 Tage nach Montage. Gebühren (2.9 % bzw. 1.9 % + CHF 0.30) im Dashboard ausweisen, damit die Wirtschaftlichkeit sichtbar bleibt.
- Bestellwesen als E-Mail mit strukturiertem Bestell-PDF je Lieferant plus Bestätigungslink (Lieferantenportal): Der Lieferant bestätigt mit einem Klick Liefertermin und Menge, was der Auftragsbestätigung nach UGL/IDS entspricht und direkt am Auftrag erscheint. Soll-Liefertermin = Bestelldatum + Lieferfrist des Lieferanten (Arbeitstage).
- Lieferfrist-Überwachung als Kernmodul und Alleinstellungsmerkmal: Vorwarnung T-5 ('Habt ihr das schon versendet?'), Mahnstufe bei T+1, Kundenmail als Entwurf bei T+2, Termintreue-Score pro Lieferant im Dashboard. Diese Regeln gehören in einen sichtbaren 'Automationen'-Bereich mit Zeitraffer-Schalter für die Live-Demo.
- Lager-Scan: QR-Codes pro Auftragsposition (z. B. A-2026-0142-P3) statt Artikel-EAN, damit die Zubuchung eindeutig einem Auftrag gilt; Teil-Lieferungen erlauben; Ereignis 'alle Positionen eingetroffen' löst automatisch die Kundenbenachrichtigung mit Terminwahl aus.
- Terminbuchung und Monteure: eigener Slot-Kalender je Partnerbetrieb (Verfügbarkeiten pflegt der Betrieb im Partnerportal), Kunde wählt Slot online, Mitarbeiter kann telefonisch erfasste Termine im Dashboard eintragen; ICS-Datei und Calendly-Link für die Demo. Statt eigener Monteur-App eine mobile Web-Ansicht (PWA) mit Auftragsdetails, Adresse, Stückliste, Foto-Upload und Abnahme-Unterschrift, die die Schlussrechnung und Archivierung auslöst.
- Partnermodell als zweiter Geschäftszweig: Sanitärbetriebe buchen Showroom-Beratungstermine für ihre Kunden, Lead wird dem Betrieb zugeordnet, Provision (Demo: 6 % auf Produktumsatz) oder Abo (Demo: CHF 149/Monat 'Partner Plus' mit Prime-Slots, Kaffee & Gipfeli). Das respektiert das dreistufige CH-Modell (Showroom liefert Material, Betrieb montiert) und ist am Markt ohne direkten Wettbewerber.
- Rollen per Code: 1234 Carlos (Inhaber, Dashboard), 98765 Lager, zusätzlich 2468 Showroom-Verkauf (nur Offerte/Kunde, keine Margen), 5555 Partnerbetrieb/Monteur (Portal), 7777 Lieferant (Bestätigungsportal). Kundenzugang ohne Code über Magic-Link im E-Mail.
- Im Dashboard je Auftrag eine Zeitleiste als einzige Wahrheit: Offerte unterschrieben → bezahlt → Bestellungen versendet (je Lieferant Datum) → Bestätigung eingegangen (Datum, Liefertermin) → Wareneingang gescannt (Positionen) → Kunde benachrichtigt → Termin bestätigt → Montage abgeschlossen → Rechnung versendet → archiviert. Alle Automationsmails im 'Postausgang' sichtbar machen, damit die Demo ohne echten Mailversand funktioniert.

**In BADWERK umgesetzt:** siehe KONZEPT.md, Abschnitte 1, 5 und 10.

---

## 3 Zahlung, Unterschrift, Rechnung, Mahnung

WebSearch war erreichbar und lieferte belastbare Ergebnisse aus Stripe-Dokumentation, SIX, Branchen-AGB und Schweizer Rechtsquellen; WebFetch war für fast alle Domains durch den Egress-Proxy blockiert, direkt gelesen wurden nur drei GitHub-Quellen (SwissQRBill-Bibliotheken, Open-Food-Network-PR zu TWINT via Stripe) – die übrigen Befunde stützen sich auf Suchresultat-Auszüge der genannten Quellen plus Fachwissen. TWINT ist seit Mai 2024 auf Stripe verfügbar, funktioniert in Payment Links und Checkout ohne eigenes Backend, kostet 1.9 % + CHF 0.30 und ist auf CHF 5'000 pro Zahlung begrenzt; Karten kosten 2.9 % + CHF 0.30, Apple Pay/Google Pay laufen ohne Aufpreis mit, ein Chargeback kostet CHF 20. Weil Bäder typischerweise CHF 15'000–35'000 kosten und Karten-/TWINT-Limiten bei etwa CHF 5'000 liegen, sollte die Tablet-Zahlung eine Anzahlung (30–40 %) sein, der Rest nach Montage per QR-Rechnung mit 30 Tagen netto – das entspricht dem Branchenbrauch (SIA-Muster 30/30/30, suissetec-AGB 30 Tage netto, 5 % Verzugszins, CHF 20 Mahngebühr). Die Fingerunterschrift auf dem Tablet ist für Kauf- und Werkverträge rechtsgültig, weil diese formfrei sind (OR 11); eine qualifizierte Signatur nach ZertES/OR 14 Abs. 2bis braucht es nur bei gesetzlicher Schriftform, entscheidend ist ein sauberer Audit-Trail (Hash, Zeitstempel, PDF-Kopie an den Kunden). Ein gesetzliches Widerrufsrecht gibt es beim Showroom-Kauf nicht (OR 40a gilt nur für Haustürgeschäfte), eine freiwillige Kulanzfrist bis zur Lieferantenbestellung wäre aber ein gutes Verkaufsargument. Die QR-Rechnung muss nach IG 2.3 (seit 22.11.2025 verbindlich, strukturierte Adressen) mit QR-IBAN und 27-stelliger QR-Referenz erzeugt werden; IG 2.4 ab 14.11.2026 ändert für CHF nichts, Stripe liefert die QR-Rechnung nicht nativ, Open-Source-Bibliotheken schon. MWST-Normalsatz ist 8.1 % (unverändert bis mindestens 2028), Rechnungen brauchen die UID mit Zusatz MWST und die Pflichtangaben nach Art. 26 MWSTG, Belege sind 10 Jahre unveränderbar zu archivieren (OR 958f/GeBüV). Das Mahnwesen ist gesetzlich nicht vorgeschrieben, üblich sind Zahlungserinnerung nach 7 Tagen, 1. Mahnung mit CHF 20 und 2. Mahnung mit CHF 40 je 10 Tage Frist, danach Betreibung; Forderungen aus Handwerksarbeit und Warenverkauf verjähren nach 5 Jahren. Für das Produkt heisst das: zweiteilige Offerte (Produkte = Kaufvertrag Showroom, Montage = Werkvertrag Partnerbetrieb), Anzahlung via Stripe-Payment-Link mit QR-Code, eigener QR-Rechnungs-Generator, automatisierte Mahnstufen mit Manager-Freigabe und ein revisionssicheres Auftragsarchiv.

**Befunde**

- TWINT ist seit der am 29. Mai 2024 angekündigten Partnerschaft Stripe–TWINT als Zahlungsmethode auf Stripe verfügbar. Voraussetzung: Stripe-Konto in der Schweiz (oder in einem der unterstützten EU-Länder), Präsentationswährung CHF, Kundenstandort Schweiz. Aktivierung erfolgt im Stripe-Dashboard unter Zahlungsmethoden, ohne separaten TWINT-Vertrag. *(hoch; [Quelle 39])*
- Technische Grenzen von TWINT über Stripe: Maximalbetrag CHF 5'000.– pro Transaktion, nur CHF, Einmalzahlung (keine Abos/wiederkehrenden Zahlungen), Rückerstattungen und Teil-Rückerstattungen möglich, Disputes möglich. Ablauf: auf dem Handy Redirect in die TWINT-App, am Desktop/Tablet QR-Code mit der TWINT-App scannen. Payment-Method-Type in der API heisst 'twint' und braucht eine return_url. *(hoch; [Quelle 40])*
- TWINT wird von Stripe in Checkout, Payment Links, Payment Element (nicht im Express Checkout Element) und Connect unterstützt. Payment Links sind damit der einfachste Weg ohne eigenes Backend: Link im Dashboard erstellen, TWINT + Karten + Apple Pay/Google Pay werden per 'dynamic payment methods' automatisch angezeigt. *(hoch; [Quelle 41])*
- Stripe Payment Links funktionieren ohne Server: Erstellung im Dashboard (+ New), Zahlungseingang im Dashboard und per Webhook 'checkout.session.completed'. Per URL-Parameter lassen sich client_reference_id (z. B. Auftragsnummer) und prefilled_email mitgeben; nach der Zahlung kann auf eine eigene Success-URL mit {CHECKOUT_SESSION_ID} weitergeleitet werden. Bis zu 3 Custom Fields, Adress- und Telefonerfassung sind konfigurierbar. Der Dashboard bietet zudem einen QR-Code zum Link (Share → QR code), ideal fürs Tablet. *(hoch; [Quelle 42])*
- Apple Pay und Google Pay kosten bei Stripe nichts extra; sie werden zum normalen Kartentarif abgerechnet und auf Stripe-gehosteten Seiten (Checkout/Payment Links) automatisch angeboten, wenn das Gerät/der Browser sie unterstützt (Apple Pay nur Safari/iOS). *(hoch; [Quelle 43])*
- Stripe-Standardgebühren Schweiz: Schweizer Karten 2.9 % + CHF 0.30, TWINT 1.9 % + CHF 0.30, internationale Karten +1.5 %, Währungsumrechnung +2 %, Dispute-Gebühr CHF 20.– pro Chargeback (auch bei gewonnenem Dispute). Auszahlung in CHF auf ein Schweizer Konto ohne Umrechnungsgebühr, solange in CHF verkauft wird. *(hoch; [Quelle 44])*
- Zum Vergleich TWINT direkt/andere Acquirer: TWINT-Standardtarif für kleine Händler 1.3 % (grosse 0.59 %), Worldline 1.7 % (min. 10 Rp.), Stripe 1.9 % + 30 Rp. Debitkarten sind deutlich günstiger (Mastercard Debit 0.49 % + 10 Rp., Visa Debit 0.95 % + 10 Rp.). Der Handelsverband kritisiert die TWINT-Gebühren als überhöht. *(mittel; [Quelle 45])*
- Stripe deckt PostFinance Pay nicht ab und erzeugt keine Schweizer QR-Rechnung nativ. Schweizer PSPs wie Payrexx, Wallee oder Datatrans bieten TWINT + PostFinance Pay + QR-Rechnung als Zahlungsart aus einer Hand; Stripe bleibt aber für Karten/TWINT/Apple Pay und Payment Links die einfachste Demo-Lösung. *(mittel; [Quelle 46])*
- Tap to Pay (iPhone XS+/Android als Kartenterminal) ist seit 17. März 2025 in der Schweiz verfügbar; Stripe Terminal unterstützt es (eher entwicklerorientiert, zusätzlich ca. CHF 0.10 je Autorisierung). Für eine Bezahlung direkt am Showroom-Tablet ist das eine Phase-2-Option; für die Demo genügt der Payment Link mit QR-Code. *(mittel; [Quelle 47])*
- Im Stripe-Testmodus lassen sich Karten (Testkarte 4242 4242 4242 4242) und TWINT ohne echtes Geld simulieren; Redirect-Zahlungsmethoden zeigen im Testmodus eine Stripe-Testseite mit 'Authorize test payment' / 'Fail test payment'. Ein Open-Source-Projekt (Open Food Network) hat TWINT via Stripe genau so mit payment_method_types ['twint'] und Redirect/return_url umgesetzt und im Testmodus verifiziert. *(hoch; [Quelle 48])*
- Vertragsrecht: Kaufvertrag (OR 184 ff.) und Werkvertrag (OR 363 ff.) sind formfrei (OR 11). Eine Offerte kann mündlich, per Klick oder mit Fingerunterschrift auf dem Tablet angenommen werden; die Tablet-Unterschrift ist eine einfache elektronische Signatur (SES) und für solche Verträge rechtsgültig. Der Showroom-Auftrag ist rechtlich primär ein Kaufvertrag über Waren; die Montage ist ein separater Werkvertrag zwischen Kunde und Sanitärbetrieb. *(hoch; [Quelle 49])*
- OR Art. 14 Abs. 2bis: Nur die qualifizierte elektronische Signatur (QES) mit qualifiziertem Zeitstempel nach ZertES (Revision 2016, in Kraft seit 1.1.2017) ist der eigenhändigen Unterschrift gleichgestellt. Sie ist nur nötig, wo das Gesetz Schriftform verlangt (z. B. Konkurrenzverbot, Konsumkreditvertrag, Bürgschaft, Grundstückkauf). Für Offerten, Kauf- und Werkverträge im Sanitärhandel ist QES nicht erforderlich. *(hoch; [Quelle 50])*
- Beweiswert der Tablet-Unterschrift: rechtsgültig, aber im Streitfall muss die Zuordnung zur Person plausibel sein. Praxisempfehlung: Unterschriftsbild + Zeitstempel + Dokument-Hash + Gerät/IP + Kopie des signierten PDFs per E-Mail an den Kunden protokollieren (Audit-Trail). Anbieter wie Skribble/DeepSign bieten FES/QES, sind für Showroom-Offerten aber überdimensioniert. *(mittel; [Quelle 51])*
- Kein gesetzliches Widerrufsrecht beim Kauf im Ladengeschäft oder in einer Ausstellung: OR 40a ff. (14 Tage, ab CHF 100) gilt nur für Haustür-/Überraschungssituationen, nicht wenn der Kunde selbst in den Showroom kommt. Ein Widerruf besteht nur, wenn ihn die AGB freiwillig gewähren. *(hoch; [Quelle 52])*
- Fälligkeit ohne Vereinbarung: Werklohn bei Ablieferung des Werks (OR 372), Kaufpreis Zug um Zug bei Übergabe (OR 184 Abs. 2). Anzahlungen/Akontozahlungen müssen darum ausdrücklich in Offerte/AGB vereinbart sein. Ein Eigentumsvorbehalt in den AGB wirkt nur mit Eintrag im Eigentumsvorbehaltsregister (OR 715) – praktisch schützt den Showroom nur die Anzahlung. *(hoch; [Quelle 53])*
- Übliche Zahlungsstaffelung im Innenausbau/Bau: nach SIA-Mustern 30 % bei Bestellung, 30 % bei Lieferung/Lieferbereitschaft, 30 % nach Montage (Rest nach Abnahme); Küchen-/Badstudios arbeiten häufig mit 30 % bei Bestellung, 50 % bei Lieferung, Rest nach Montage. Gesetzlicher Default wäre 'Zahlung nach Vollendung', Anzahlungen sind aber wegen Vorfinanzierung Standard. *(mittel; [Quelle 54])*
- Branchen-AGB Sanitär (suissetec): Zahlungsfrist 30 Tage netto, Verzugszins 5 % p.a., ab der 2. Mahnung Mahngebühr CHF 20.–. '30 Tage netto' ist Handelsbrauch, keine gesetzliche Vorgabe. *(hoch; [Quelle 55])*
- Verzug und Mahnwesen: Ohne bestimmten Verfalltag tritt Verzug erst mit Mahnung ein (OR 102); steht 'zahlbar bis <Datum>' auf der Rechnung, tritt Verzug automatisch ein. Verzugszins 5 % p.a. (OR 104) ohne Vereinbarung; Mahngebühren nur mit AGB-Grundlage, branchenüblich CHF 10–40 je Stufe. Betreibungsbegehren kostet je nach Betrag ca. CHF 50–150 (GebV SchKG). *(hoch; [Quelle 56])*
- Typischer Mahnlauf Schweiz: Zahlungserinnerung 5–10 Tage nach Fälligkeit (freundlich, ohne Gebühr, gern per E-Mail), 1. Mahnung ca. 10–14 Tage später mit neuer Frist von 10 Tagen und Gebühr, 2./letzte Mahnung mit 10 Tagen Frist, Gebühr und Betreibungsandrohung, danach Betreibung. Es gibt keine gesetzliche Pflicht zu drei Mahnstufen. *(hoch; [Quelle 57])*
- Verjährung: Forderungen aus Handwerksarbeit und aus Kleinverkauf von Waren verjähren nach 5 Jahren (OR 128 Ziff. 3), übrige Forderungen nach 10 Jahren (OR 127), jeweils ab Fälligkeit. Gewährleistung: Kaufvertrag 2 Jahre (OR 210), Werkvertrag 2 Jahre bzw. 5 Jahre bei unbeweglichen Werken (OR 371); SIA 118 kennt eine 2-jährige Rügefrist. *(hoch; [Quelle 58])*
- QR-Rechnung: eingeführt 30.6.2020, Einzahlungsscheine seit 30.9.2022 abgelöst. Implementation Guidelines (IG) Version 2.3 ist seit 22.11.2025 verbindlich (nur noch strukturierte Adressen, erweiterter Zeichensatz mit Umlauten). IG 2.4 wurde am 24.2.2026 publiziert, gilt ab 14.11.2026 und bringt für CHF-Rechnungen keine technischen Änderungen (Einschränkungen nur für EUR-Kombinationen); 2.3 bleibt bis November 2027 gültig. Unstrukturierte Adressen führen ab 30.9.2026 vermehrt zu Zahlungsabweisungen. *(hoch; [Quelle 59])*
- Referenzierung: QR-IBAN (IID 30000–31999, von der Bank zusätzlich zur IBAN vergeben) zusammen mit QR-Referenz (27 Stellen: 26 Ziffern + Prüfziffer nach Modulo 10 rekursiv, entspricht der alten ESR-Referenz) ermöglicht automatischen Zahlungsabgleich. Alternativ normale IBAN + Creditor Reference (SCOR, 'RF' + 5–25 alphanumerische Zeichen) oder IBAN ohne Referenz. Die Kombination QR-IBAN ohne QR-Referenz ist unzulässig. *(hoch; [Quelle 60])*
- Layout und Tooling: Zahlteil (148×105 mm) + Empfangsschein (62×105 mm) = 210×105 mm unten auf A4, Swiss QR Code 46×46 mm mit Schweizer Kreuz, Perforation bei Papierversand. Open-Source-Bibliotheken wie manuelbl/SwissQRBill (Java, IG 2.2/2.3, PDF/SVG/PNG) und schoero/swissqrbill (JavaScript, PDF via PDFKit oder SVG) erzeugen normkonforme Zahlteile mit strukturierten Adressen; SIX stellt einen QR-Bill-Validator bereit. *(hoch; [Quelle 61])*
- MWST-Sätze seit 1.1.2024 und unverändert 2026: Normalsatz 8.1 %, reduzierter Satz 2.6 %, Sondersatz Beherbergung 3.8 %; nächste Erhöhung frühestens 2028. Sanitärprodukte, Installationsmaterial und Montage unterliegen dem Normalsatz 8.1 %. MWST-Pflicht ab CHF 100'000 Jahresumsatz. *(hoch; [Quelle 62])*
- Pflichtangaben einer MWST-konformen Rechnung (Art. 26 MWSTG): Name/Adresse des Leistungserbringers mit UID und Zusatz 'MWST' (Format CHE-123.456.789 MWST), Name/Adresse des Empfängers, Datum bzw. Zeitraum der Leistung, Art/Gegenstand/Umfang, Entgelt, anwendbarer Steuersatz und Steuerbetrag (oder Hinweis 'inkl. 8.1 % MWST'). Unter CHF 400 genügt ein Kassenbeleg ohne Empfängerangaben. *(hoch; [Quelle 63])*
- Aufbewahrung: Geschäftsbücher und Belege (Offerten mit Unterschrift, Rechnungen, Bestellbestätigungen) sind 10 Jahre ab Ende des Geschäftsjahres aufzubewahren (OR 958f); elektronische Archivierung ist nach GeBüV zulässig, wenn Integrität (Unveränderbarkeit), jederzeitige Lesbarkeit und systematische Ablage gewährleistet sind. *(hoch; [Quelle 64])*
- Praktische Kartenlimiten: Schweizer Konsumenten-Kreditkarten haben typischerweise Monatslimiten von CHF 5'000–10'000, Debitkarten Tageslimiten von ca. CHF 5'000. Zusammen mit dem TWINT-Limit von CHF 5'000 bedeutet das: Komplettbäder (CHF 15'000–35'000) lassen sich am Tablet nicht vollständig bezahlen, sondern nur die Anzahlung. *(mittel; Fachwissen)*

**Folgen für das Produkt**

- Zahlungsmodell umstellen: Am Tablet wird nicht der Gesamtbetrag, sondern eine vereinbarte Anzahlung (Standard 40 %, bei Komplettbädern 30 %) sofort per TWINT/Karte/Apple Pay bezahlt; die Schlussrechnung (Rest nach Montage, 30 Tage netto) geht als QR-Rechnung ohne Stripe-Gebühr. Die App muss den Anzahlungsbetrag automatisch auf das TWINT-Limit von CHF 5'000 prüfen und bei Überschreitung Karte oder Split (TWINT + Karte) vorschlagen.
- Zahlung in der Demo über einen Stripe Payment Link im Testmodus abwickeln: Link mit client_reference_id=Auftragsnummer und prefilled_email erzeugen, als QR-Code auf dem Tablet anzeigen (Kunde scannt mit eigenem Handy → TWINT-App), success_url zurück in die App mit {CHECKOUT_SESSION_ID}. Ohne Backend gilt: Zahlungsstatus über Rückkehr-URL bzw. manuellen 'Zahlung eingegangen'-Abgleich; zusätzlich einen 'Zahlung simulieren'-Button für den Fall, dass im Showroom kein Netz ist.
- Unterschrift als Canvas-Signatur umsetzen (SES reicht, keine QES nötig), aber Beweiskette bauen: signiertes Offerten-PDF mit SHA-256-Hash, Zeitstempel, Geräte-ID, Name des Unterzeichners, Checkbox 'AGB und Zahlungsbedingungen gelesen', automatische E-Mail-Kopie an den Kunden. Auf der Offerte klar ausweisen, dass kein gesetzliches Widerrufsrecht besteht – optional eine freiwillige 7-Tage-Kulanzfrist als Verkaufsargument (Bestellung an Lieferanten erst danach auslösen).
- Offerte zweiteilig strukturieren: Block A 'Produkte und Installationsmaterial' (Kaufvertrag mit dem Showroom, 8.1 % MWST, Anzahlung fällig) und Block B 'Montage durch Partnerbetrieb' (Richtofferte/Vermittlung, Werkvertrag zwischen Kunde und Sanitärbetrieb, separate Rechnung des Betriebs oder als Weiterverrechnung mit Provision). Das trennt Haftung und Gewährleistung (Produkte 2 Jahre Showroom, Montage Betrieb) sauber und passt zum Stakeholder-Modell des PO.
- Eigenen QR-Rechnungs-Generator einbauen (IG 2.3-konform: strukturierte Adressen, QR-IBAN + 27-stellige QR-Referenz mit Modulo-10-Prüfziffer aus Auftrags-/Rechnungsnummer, Swiss QR Code 46×46 mm, Zahlteil/Empfangsschein 210×105 mm). Zwei Rechnungstypen: Anzahlungsrechnung (Beleg für die Stripe-Zahlung) und Schlussrechnung mit Verrechnung der Anzahlung; Pflichtangaben nach Art. 26 MWSTG (UID CHE-… MWST, Leistungsdatum, Steuersatz/-betrag) als Template-Felder erzwingen.
- Mahnwesen automatisieren, aber mit Freigabe: Fälligkeit als fixes Datum auf die Rechnung drucken (Verzug tritt ohne Mahnung ein), Stufen: Zahlungserinnerung +7 Tage (CHF 0, E-Mail), 1. Mahnung +14 Tage (CHF 20, Frist 10 Tage), 2. Mahnung +24 Tage (CHF 40, Frist 10 Tage, Betreibungsandrohung), Verzugszins 5 % ausweisen. Entwürfe landen im Postausgang des Managers (analog zu den Lieferanten-Nachfass-Mails), die Mahngebühren müssen in den AGB der Offerte stehen.
- Archiv als unveränderliches Dokumentenarchiv umsetzen: signierte Offerte, Bestellbestätigungen, Lieferscheine/Scan-Protokolle, Rechnungen und Mahnungen als PDF mit Hash und Zeitstempel je Auftrag, 10 Jahre aufbewahrt, Export für Treuhänder. Dieselben Dokumente dienen als Beweismittel bei Kreditkarten-Chargebacks (Stripe-Dispute-Gebühr CHF 20).
- Gebührenbewusstsein für Carlos ins Dashboard: je Zahlung die effektive Gebühr anzeigen (TWINT 1.9 % + 0.30, Karte 2.9 % + 0.30, QR-Rechnung 0) und im Zahlungsmix steuern: Anzahlung digital (Kaufabschluss sofort), Rest per QR-Rechnung; optional 2 % Skonto bei Zahlung innert 10 Tagen als Anreiz. Hinweis für die Produktionsphase: PostFinance Pay fehlt bei Stripe – wer das braucht, wechselt auf Payrexx/Wallee.
- Stripe-Setup für den Live-Betrieb dokumentieren: Schweizer Stripe-Konto in CHF, TWINT im Dashboard aktivieren, Apple/Google Pay automatisch, Payment Links pro Auftrag per API (später) oder manuell; Tap to Pay am Tablet als Phase 2. Zahlungsbedingungen, Offertgültigkeit (30 Tage), Garantie (2 Jahre Produkte), Verzugszins und Mahngebühren gehören als AGB-Kurztext auf jede Offerte und Rechnung.
- Rollen ergänzen: 'Buchhaltung/Treuhand' (z. B. Code 5555, nur Rechnungen, Zahlungen, Mahnungen, Export) und Zahlungsstatus als eigenes Feld im Auftrag (Anzahlung offen/bezahlt, Schlussrechnung offen/fällig/gemahnt/bezahlt), damit der Auftrag wirklich bis zum Ende getrackt wird.

**In BADWERK umgesetzt:** siehe KONZEPT.md, Abschnitte 5, 7 und 11.

---

## 4 Lieferanten, Lieferfristen, Wareneingang

Der Schweizer Sanitärmarkt ist dreistufig: Hersteller liefern über den Grosshandel (Sanitas Troesch, Richner, SABAG) an Installateure; ein Showroom wie der von Carlos bestellt darum fast alles beim Grosshändler und nur Manufaktur- und Sonderware (talsee-Möbel, Massglas, Sonderfarben) direkt beim Hersteller. Grosshandels-Lagerware ist Overnight (Bestellschluss 17:00, Lieferung oder Abholung am nächsten Werktag), Beschaffungsartikel brauchen 1–3 Wochen, Sonderfarben, Whirlsysteme, Massglas und Möbelmanufaktur 4–8 Wochen; die Lieferfrist gehört deshalb an die Lieferart des Artikels, nicht nur an den Lieferanten. Rechtlich entsteht der Vertrag erst mit der Auftragsbestätigung (AB), deren bestätigter Termin die Referenz für jede Überwachung ist; die üblichen Einkaufsbedingungen verlangen die AB innert 48 Stunden bzw. 2 Werktagen. Der Standardablauf lautet Bestellung → AB mit Termin → Lieferavis (Sendungsnummer, voraussichtliches Datum, Packstücke) → Lieferschein mit der Ware → Wareneingang mit Identitäts-, Mengen- und Sichtprüfung → Buchung auf einen Kommissions-Lagerplatz. Rügefristen sind kurz und unterschiedlich (Sanitas Troesch 1 Tag für Transportschäden, Laufen 8 Kalendertage schriftlich, OR 452: verdeckte Transportschäden spätestens 8 Tage), weshalb die Scan-App einen «Beschädigt – unter Vorbehalt»-Pfad mit Fotopflicht und automatischer Meldung braucht. Für das Mahnwesen bewährt sich das ERP-Muster aus Bestätigungsmahnung, Vorab-Erinnerung (negative Mahntage, z. B. 5 Werktage vor Termin, nur ohne Avis), Liefermahnung mit Nachfrist am Tag +1 und Eskalation an die Verkaufsleitung nach rund einer Woche; der Ton ist in der Schweiz konsequent höflich, in Sie-Form und mit vollständigen Referenzen (Bestell-Nr., Kommission, AB-Termin). Kommission (Auftrags-Nr. + Kundenname) muss auf jeder Bestellung, jedem Lieferschein und jedem Lagerplatz stehen, Teillieferungen werden über offene Mengen je Position abgebildet, und «montagebereit» sollte idealerweise zwei Etappen (Rohinstallation, Fertigmontage) kennen. Lieferanten-KPIs wie OTIF (Toleranz ±2 Werktage, Ziel 95–98 %) machen die Idee eines an Lieferanten verkauften Avis-/Mahn-Portals plausibel. Hinweis: WebSearch funktionierte, WebFetch war blockiert, alle Befunde beruhen auf Such-Snippets der genannten Quellen plus Fachwissen; konkrete Wochenangaben je Hersteller sind Erfahrungswerte und in der Demo als editierbare Standardfristen auszuweisen.

**Befunde**

- Der Schweizer Sanitärmarkt ist dreistufig organisiert: Hersteller (Geberit, Laufen, KWC/Similor, Duravit, Hansgrohe, Kaldewei, Bette, Schmidlin, Duscholux) liefern über den Grosshandel (Sanitas Troesch, Baubedarf-Richner-Miauton, SABAG) an Installateure. Geberit nennt dies ausdrücklich das «dreistufige Vertriebsmodell». Ein Showroom bestellt deshalb in der Praxis fast alles beim Grosshändler (eine Bestellung, eine AB, ein Lieferschein) und nur Manufaktur-/Sonderware (z. B. talsee-Möbel, Massglas) direkt beim Hersteller. *(hoch; [Quelle 65])*
- Sanitas Troesch (grösster CH-Grosshändler): Der Vertrag kommt erst mit der Auftragsbestätigung (AB) zustande; Lieferfristen sind ausdrücklich unverbindlich, Verspätung gibt kein Rücktritts-/Schadenersatzrecht; Lieferung auf Abruf muss innert max. 6 Monaten abgerufen werden; die vereinbarte Frist läuft erst ab Eingang aller nötigen Angaben des Kunden. *(hoch; [Quelle 66])*
- Lagerware beim Grosshandel ist praktisch Overnight: Sanitas Troesch liefert Lagerartikel, die werktags bis 17:00 Uhr bestellt werden, am nächsten Werktag; im Sanitär-Shop steht die Ware am Tag nach der Bestellung zur Abholung bereit. Richner wirbt mit «heute bestellt – morgen geliefert» bei über 325 000 Artikeln. Der Profishop von Sanitas Troesch (>72 000 Artikel) zeigt Verfügbarkeit, Nettopreis und Lieferzeitpunkt tagesaktuell; Terminaufträge mit selbst gewähltem Lieferort und -zeit sind möglich. *(hoch; [Quelle 67])*
- Rügefristen sind kurz und je Lieferant verschieden: Sanitas Troesch verlangt Meldung von Transportschäden und sofort erkennbaren Mängeln innert 1 Tag nach Lieferung; Rückgabe nur innert 14 Tagen, unbenutzt, in Originalverpackung, nicht montiert. Laufen verlangt schriftliche Mängelrüge innert 8 Kalendertagen (Eingang bei Laufen massgebend, per Einschreiben), sonst gilt die Lieferung als genehmigt; verdeckte Mängel innert 8 Tagen nach Entdeckung, längstens 2 Jahre ab Rechnungsdatum. Similor/KWC: 2 Jahre Garantie ab Rechnungsdatum; Katalogangaben unverbindlich. *(hoch; [Quelle 68])*
- Schweizer Frachtrecht (OR Art. 452): Mit vorbehaltloser Annahme der Ware und Bezahlung der Fracht sind alle Ansprüche gegen den Frachtführer verwirkt (ausser Absicht/grobe Fahrlässigkeit). Äusserlich nicht erkennbare Schäden müssen sofort nach Entdeckung, spätestens 8 Tage nach Ablieferung, angezeigt werden. Praxis: Beschädigte Sendungen nur «unter Vorbehalt» annehmen, Vermerk auf Lieferschein/Frachtbrief, Fotos, Verpackung aufbewahren, Spediteur den Schaden feststellen lassen. *(hoch; [Quelle 69])*
- Realistische Lieferfristen je Produktgruppe (Händlerangaben + Fachwissen): Grosshandels-Lagerware (Geberit Duofix/Sigma, Standardkeramik, Standardarmaturen, Installationsmaterial) 1–3 Werktage; Beschaffungsartikel ab Herstellerlager 1–2 Wochen (Hansgrohe ca. 1 Woche, Duravit-Möbelsets 1–2 Wochen, Geberit AquaClean Mera bei CH-Händler 7 Tage, Zubehör 10–30 Tage); Kaldewei-Wannen je nach Modell ca. 1 Woche / 2–3 Wochen / 5–8 Wochen (Sonderfarbe, Whirl, Sondermass); Duschabtrennungen nach Mass (Koralle Auftragsfertigung) 4 Wochen; CH-Möbelmanufaktur talsee (alles auftragsbezogen in Hochdorf gefertigt) nach Fachwissen 4–8 Wochen; Duscholux: Lieferfrist läuft erst ab AB und erst nach technischer Klärung, Angaben unverbindlich. *(mittel; [Quelle 70])*
- Ablauf Bestellung → AB: In Einkaufsbedingungen ist üblich, dass der Lieferant die Bestellung innert 48 Stunden bzw. 2 Werktagen schriftlich bestätigt (Bestellbestätigungspflicht). Die AB enthält den verbindlichen (bestätigten) Liefertermin, der den vom Besteller gewünschten Termin ersetzt; eine abweichende AB gilt rechtlich als neues Angebot. Standard-ERP (SAP ME92F) überwacht fehlende ABs separat von der Lieferüberwachung (ME91F). *(hoch; [Quelle 71])*
- Mahnwesen im Einkauf kennt drei Typen: Bestätigungsmahnung (AB fehlt), Liefererinnerung im Voraus (vor dem Termin) und Liefermahnung bei Verzug; Mahnungen werden mit einer angemessenen Nachfrist verbunden. SAP arbeitet mit bis zu 3 Mahnstufen (z. B. 10-20-30 Tage nach Termin); negative Mahntage bedeuten Erinnerung VOR dem Termin (z. B. -5 = 5 Tage vorher). Bezugsdatum ist der in der AB oder im Lieferavis bestätigte Termin, sonst der Bestelltermin. Bei kalendermässig fixem Termin tritt Verzug automatisch am Folgetag ein (DE §286 BGB; CH analog OR 102 Verfalltag). *(hoch; [Quelle 72])*
- Expediting-Best-Practice: Nachfassen nach Risiko und Auswirkung priorisieren (nicht jede Bestellung gleich behandeln); dringende Fälle telefonisch klären, aber immer schriftlich bestätigen; neue Termine, Teillieferungen und Kostenfolgen dokumentieren; wiederholte Verspätungen desselben Lieferanten als Lieferantenproblem eskalieren. Kennzahl OTIF (On-Time-In-Full) mit Zeitfenster ±1–3 Tage und 0 % Mengentoleranz; Zielwerte 95–98 %. *(hoch; [Quelle 73])*
- Lieferavis (Versand-/Terminavis): Vorabinformation des Lieferanten oder Spediteurs mit Artikeln, Mengen, Anzahl Packstücke, Sendungsnummer, voraussichtlichem Liefertermin/Zeitfenster; heute per E-Mail, SMS oder EDI (DESADV). Der Lieferschein kommt mit der Ware und ist der Inhaltsnachweis. Grosshandel liefert auf Wunsch zu fixem Datum werktags 7:30–16:00 direkt auf die Baustelle, nach Etagen/Bauabschnitten sortiert, unverpackt oder auf Rollwagen; Kran-/Helikopterlieferung möglich. *(hoch; [Quelle 74])*
- Barcode-Standard im Wareneingang: GTIN/EAN-13 (seit 2009 heisst EAN offiziell GTIN) identifiziert den Artikel; der SSCC/NVE (18-stellig, Application Identifier 00) auf dem GS1-128-Transportetikett identifiziert die Versandeinheit (Palette) und ist das Bindeglied zum elektronischen Lieferavis. Praxis für KMU: Bestellnummer als Barcode auf dem Lieferschein → Bestellung per Scan aufrufen, danach GTIN je Artikel scannen und gelieferte Mengen gegen die Bestellung abgleichen. SSCC-basierter Wareneingang spart bis zu einem Drittel Zeit. *(hoch; [Quelle 75])*
- Wareneingangskontrolle-Standardablauf: 1) Identität (Lieferschein passt zur Bestellung, richtige Ware), 2) Mengen (Packstücke und Stück gegen Lieferschein), 3) Sichtprüfung der Transportverpackung, 4) Zustand/Qualität, 5) Dokumentation und Buchung, danach Freigabe zur Einlagerung. Typische Fehler: nur grober Abgleich, sichtbare Schäden nicht sofort dokumentiert, kein Vermerk auf dem Lieferschein, Freigabe trotz offener Fragen. *(hoch; [Quelle 76])*
- Kommissionsware im SHK-Handwerk: Auftragsbezogene Ware wird bei Annahme sofort mit der Kommission (Kunden-/Auftragsname) gekennzeichnet; Lieferanten sollen die Kommissionsnummer auf den Lieferschein drucken; ein fester, vom Standardlager getrennter Lagerplatz je Kommission ist Pflicht. Grosshandels-Shops bieten dafür die Felder «Kommission», «Bestellzeichen» und «Lieferhinweis», die auf Lieferschein und Rechnung erscheinen. *(hoch; [Quelle 77])*
- Teillieferungen in ERP-Systemen: Je Bestellposition wird die offene Menge (Bestellmenge minus gelieferte Menge) geführt und bei jedem Wareneingang reduziert; Restlieferungen addieren sich; ein Endlieferungskennzeichen schliesst die Position auch bei Unterlieferung; Unter-/Überlieferungstoleranzen sind konfigurierbar; beim Erfassen wird je Position ein Lagerplatz vorgeschlagen, der änderbar ist. *(hoch; [Quelle 78])*
- Carlos' Geschäftsmodell (Direktverkauf an Endkunden, Montage durch externe Sanitärbetriebe) ist im CH-Markt die Ausnahme: Grosshandels-Showrooms beraten den Endkunden, aber Bestellung, Preis und Montage laufen über den Installateur. Damit ist der Showroom bei Carlos gleichzeitig Besteller, Warenempfänger (Kommissionslager) und Übergabestelle an den Monteur – das Lager wird zum Kommissionslager je Auftrag, nicht zum Sortimentslager. *(mittel; [Quelle 79])*
- Hinweis zur Recherchequalität: WebSearch funktionierte, WebFetch wurde für alle Domains vom Egress-Proxy blockiert. Die Befunde stammen aus Suchmaschinen-Snippets der genannten Quellen (AGB-Fristen, Bestellschluss, Mahnstufen) plus Fachwissen; keine Quelle konnte vollständig gelesen werden. Konkrete Wochenangaben je Hersteller (v. a. Sonderfarben, talsee) sind Erfahrungswerte und sollten in der Demo als «Standard-Lieferfrist, editierbar» ausgewiesen werden. *(mittel; Fachwissen)*

**Folgen für das Produkt**

- Bestellungen pro Auftrag automatisch je Lieferant bündeln (Lieferant = meist Grosshändler, nur Manufaktur/Sonderware direkt). Jede Bestellung führt eine Statuskette: Bestellt → AB erhalten (mit bestätigtem Termin) → Lieferavis (Sendungsnr., voraussichtl. Datum) → Wareneingang (teil/voll, via QR-Scan) → Abgeschlossen. Der bestätigte Termin aus der AB überschreibt den Plan-Termin (Bestelldatum + Standard-Lieferfrist); ohne AB gilt der Plan-Termin.
- Lieferfrist nicht nur je Lieferant, sondern je Artikel-Lieferart hinterlegen: «Lager» (1–3 Werktage), «Beschaffung» (1–3 Wochen), «Manufaktur/Sondermass/Sonderfarbe» (4–8 Wochen). Der Auftrag zeigt den kritischen Pfad (längste Frist) und eine Prognose «frühester Montagetermin». Sonderanfertigungen werden in der Offerte als «nicht stornierbar, keine Rücknahme» markiert (Rückgabefenster beim Grosshandel nur 14 Tage, unbenutzt/originalverpackt).
- Automatisches Mahnwesen in 4 Stufen mit Schweizer Tonalität (Sie-Form, «Freundliche Grüsse», immer Bestell-Nr., Kommission, Artikel, AB-Termin): Stufe 0 «AB-Erinnerung» 2 Werktage nach Bestellung ohne AB; Stufe 1 «Statusanfrage» 5 Werktage vor bestätigtem Termin, nur wenn kein Lieferavis vorliegt («Ist die Sendung unterwegs? Bitte Sendungsnummer»); Stufe 2 «Liefermahnung» am Werktag +1 nach Termin mit Nachfrist 5 Werktage und Bitte um neuen verbindlichen Termin; Stufe 3 «Eskalation» +6 Werktage an Verkaufsleitung/Key-Account des Lieferanten mit Hinweis auf Folgekosten (verschobener Montagetermin), gleichzeitig Kunden-Mail als Entwurf erzeugen. Manager sieht jede Stufe im Auftrags-Log und kann Stufen pausieren (z. B. nach Telefonat mit neuem Termin → neuer Termin eintragen, Zähler startet neu).
- Lager-App (Code 98765): QR-Code je Bestellposition enthält Auftrags-Nr., Bestell-Nr., Positions-Nr. und (falls vorhanden) GTIN; ein Scan bucht die Position, Teilmengen sind erlaubt (offene Menge wird geführt, Restlieferung erwartet). Pflicht-Buttons «OK» / «Beschädigt – unter Vorbehalt» (Foto zwingend, erzeugt automatisch Schadensmeldung an Lieferant und Spediteur mit Fristhinweis: 1 Tag bei Sanitas Troesch, 8 Tage nach OR 452/Laufen). Jeder Scan schlägt einen Lagerplatz vor (Kommissionsfach «K-0142 Meier», Regal A-03) und erscheint sofort im Manager-Dashboard unter dem Auftrag.
- Kommission überall mitführen: Auf jeder Bestell-E-Mail steht «Kommission: A-2026-0142 Meier» im Betreff und im Feld Bestellzeichen, mit der Bitte, die Kommission auf Lieferschein und Etikett zu drucken – sonst sind Grosshandels-Lieferungen im Lager nicht zuordenbar. Lieferschein-Nr. wird beim Wareneingang erfasst (Rügen müssen Lieferschein-/Rechnungs-Nr. nennen).
- «Montagebereit» sauber definieren: Auftrag ist montagebereit, wenn alle Positionen aller Bestellungen offene Menge 0 haben UND keine Schadensmeldung offen ist. Empfehlung als Co-Founder: Zwei Phasen unterstützen (Phase 1 Rohinstallation: Unterputz-Elemente Geberit Duofix, Unterputzkörper Armaturen, Wanne; Phase 2 Fertigmontage: Keramik, Möbel, Armaturen-Fertigsets, Glas). So kann der Monteur schon beginnen, wenn nur die Sanitär-Rohware da ist – in der Demo als Schalter «Montage in 2 Etappen» bei Sanierungen.
- Lieferort je Bestellung wählbar: «Showroom-Lager» (Standard, Wareneingang per Scan) oder «direkt Baustelle zu Fixtermin» (Grosshandel liefert werktags 7:30–16:00; dann bestätigt der Monteur den Empfang in seiner App, Foto des Lieferscheins). Das reduziert Handling für Grossteile (Wannen, Duschwannen).
- Lieferanten-Karte im Dashboard mit KPI: OTIF (Toleranz ±2 Werktage), Ø Verspätung in Tagen, Anzahl Mahnungen, AB-Reaktionszeit. Diese Zahlen sind das Verkaufsargument für die PO-Idee, den Mahn-/Avis-Service als «Lieferanten-Portal» anzubieten: Der Lieferant kann dort AB-Termin bestätigen, Lieferavis mit Sendungsnummer hochladen und Verzögerungen selbst melden – jede Meldung stoppt die nächste Mahnstufe automatisch.
- Ereignis-Log je Auftrag (Timeline): Bestellung gesendet (an wen, wann), AB eingegangen (Termin), Erinnerung/Mahnung gesendet (Stufe), Avis erhalten, Wareneingang gescannt (wer, Lagerplatz), Schaden gemeldet, Kunde informiert. Dieses Log ist gleichzeitig die Beweisdokumentation für Rügefristen und die Grundlage der Archivierung nach Abschluss.
- Demo-Zeitraffer einbauen: Ein «Heute ist …»-Schalter im Manager-Dashboard verschiebt das Systemdatum, damit der PO in der Live-Demo Erinnerung, Mahnung und Kunden-Entwurf ohne Wartezeit auslösen kann.

**In BADWERK umgesetzt:** siehe KONZEPT.md, Abschnitte 6 und 7.

---

## 5 Produkte, Stücklisten, Objektkontext, Zusatzleistungen (Fachwissen)

**Kernaussagen**

- Jede Produktgruppe hat ein Installationsmaterial, das immer dazugehört
  und im Verkaufsgespräch regelmässig vergessen wird – der Grund für
  Nachbestellungen, verschobene Montagen und Ärger mit dem Installateur.
  Badewanne: Wannenfüsse mit Anker, Ab- und Überlaufgarnitur,
  Schallschutz-Set, Wannenrandprofil und Dichtband, Silikon,
  Revisionsöffnung. Wand-WC: Installationselement (Geberit Duofix o. ä.),
  Betätigungsplatte, Anschlussgarnitur, Schallschutz, Befestigung.
  Lavabo: Siphon, Eckventile, Anschlussschläuche, Befestigung. Dusche:
  Ablaufgarnitur, Füsse, Dichtset; bei Duschrinne das Abdichtungsset.
  Armaturen: S-Anschlüsse und Rosetten. Handtuchradiator:
  Anschlussgarnitur. (mittel)
- Der Objektkontext ist nur so gut wie die Regeln dahinter. Sechs Felder
  lösen in der Praxis etwas aus: Gebäudetyp, Stockwerk mit Lift,
  Neubau/Sanierung, Baujahr vor/nach 1990 (Anschlussmasse, alte
  Aufputz-Spülkästen), Eigentum/Miete (Freigabe der Verwaltung), Zugang
  (Parkplatz, Halteverbot, Schlüssel). Alles andere gehört in ein
  Notizfeld. (hoch)
- Marge liegt nicht im Kernprodukt, sondern in Optionen (Whirl-System,
  Thermostat, Absenkautomatik, Dusch-WC-Upgrade, Sonderoberflächen) und
  in Dienstleistungen (Etagenlieferung, Entsorgung, Express-Beschaffung,
  Garantieverlängerung, Anti-Kalk-Beschichtung, Wartungsabo). Typische
  Bruttomargen: Kernprodukt 30–40 %, Optionen 35–60 %, Dienstleistungen
  50–80 %. (mittel)
- Pakete («Komfort», «Premium») verkaufen besser als Einzeloptionen, weil
  der Berater nicht rechnen und der Kunde nicht zehnmal entscheiden muss.
  Der Standard ist vorausgewählt, das Paket zeigt die Ersparnis. (mittel)
- Sonderanfertigungen (Massglas, Sonderfarben, Möbelmanufaktur) sind
  nicht stornierbar und nicht rücknehmbar; das muss auf der Offerte
  stehen, sonst trägt der Showroom das Risiko. (hoch)

**Folgen für das Produkt**

- Stückliste je Artikel im Datenmodell, editierbar, aber nie stillschweigend weglassbar.
- Regeln aus dem Objektkontext als Vorschläge, nie als versteckte Buchung.
- Marge je Zeile für den Inhaber; Pakete als eigene Kategorie.
- Kennzeichnung «nicht stornierbar» auf Offerte und Auftragsbestätigung.

---

## 6 Partner-Ökosystem: externe Sanitärbetriebe (Fachwissen)

**Kernaussagen**

- Ein Showroom ohne eigene Montage ist auf Installateure angewiesen und
  gleichzeitig deren Verkaufsraum. Beides zusammen ist ein Netzwerk, das
  weder Grossisten (die den Installateur als Kunden haben) noch
  Softwarehäuser abbilden. (mittel)
- Tippgeber- und Vermittlungsprovisionen sind im Handwerk üblich (5–10 %),
  aber selten schriftlich. Ein System, das sie transparent macht, ist
  ein Vorteil – solange keine Preise abgesprochen werden (Kartellgesetz).
  (mittel)
- Abo-Modelle funktionieren, wenn sie etwas Knappes verteilen:
  Samstags-Slots, Vorrang bei Montageaufträgen, Co-Branding. «Kaffee und
  Gipfeli» steht sinnbildlich für den Samstagvormittag, an dem Paare
  entscheiden. (tief)
- Ein Montageauftrag braucht minimal: Kunde, Adresse, Zugang, Objektkontext,
  Stückliste, Lagerplatz, Termin, Kontakt – und einen Weg, fertig zu
  melden. Ohne Fertigmeldung gibt es keine automatische Rechnung. (hoch)
- Externe Betriebe installieren keine fremde App. Ein Link im Mail, der
  auf dem Handy sofort funktioniert, wird benutzt. (hoch)

**Folgen für das Produkt**

- Partner als eigene Entität mit Modell (Basis/Plus), Provisionssätzen, Slots, Monteuren.
- Partnerportal über Link: Showroom-Termin buchen, Montageauftrag, Termin bestätigen, Fertigmeldung, Abnahme, Abrechnung.
- Leads dem Partner zuordnen; Offerte mit Partner-Block.

---

## 7 Bedienung am Tablet im Showroom (Fachwissen)

**Kernaussagen**

- Ein Konfigurator im Verkaufsgespräch hat vier Schritte oder er wird
  nicht benutzt: Kunde und Objekt, Produkte, Extras, Abschluss. Jeder
  Schritt passt auf einen Bildschirm, der Preis ist immer sichtbar, der
  Rückweg immer möglich. (hoch)
- Grosse Karten statt Listen, Bilder oder klare Symbole, wenige
  Pflichtfelder. Was der Berater nicht weiss (Baujahr), darf offen bleiben
  und wird als Frage auf das Auftragsblatt geschrieben. (hoch)
- Upsells überzeugen, wenn sie den Nutzen nennen («leiser», «weniger
  putzen», «länger Garantie») und als Vergleich stehen, nicht als
  Aufpreis-Liste. Der Standard ist vorausgewählt. (mittel)
- Unterschrift und Zahlung gehören in denselben Fluss; jeder Medienbruch
  («wir schicken die Offerte») kostet Abschlüsse. (mittel)
- Für eine Live-Demo zählt: die Kette in unter drei Minuten zeigen, an
  jeder Stelle ein sichtbares Ergebnis (Mail im Postausgang, Eintrag in
  der Zeitleiste, Scan am PC). (hoch)

**Folgen für das Produkt**

- Tablet-Offerte in vier Schritten mit Warenkorb rechts und Live-Total.
- Vorschläge aus dem Objektkontext als abwählbare Zeilen.
- Unterschrift, Anzahlung und Auftragsanlage ohne Unterbruch.

---

## 8 Automatisierung, KI, Datenschutz (Fachwissen)

**Kernaussagen**

- Automationen bringen dann Nutzen, wenn sie an einem verlässlichen
  Datum hängen (bestätigter Liefertermin, Fälligkeit) und eine sichtbare
  Spur hinterlassen. Automatisch senden darf, was routiniert und
  risikoarm ist (Bestellung, Statusanfrage, Auftragsbestätigung,
  Terminlink); alles mit Beziehungsrisiko (Kundenverzug, Mahnung,
  Eskalation) geht als Entwurf zur Freigabe. (hoch)
- Ein Sprachmodell hilft beim Formulieren (Mailentwürfe in gutem Ton,
  Zusammenfassung eines Auftrags) und beim Einschätzen (Verzugsrisiko
  aus Lieferantenhistorie, Ersatzproduktvorschlag). Es entscheidet
  nichts und bucht nichts. In einer statischen Demo sind KI-Entwürfe
  Vorlagen und als solche gekennzeichnet. (hoch)
- Die Idee, «die Automatisierung den Lieferanten zu verkaufen», trägt als
  Portal: AB bestätigen, Avis melden, Verzug melden. Der Nutzen für den
  Lieferanten ist, nicht angerufen zu werden; der Nutzen für den Showroom
  ist ein verlässlicher Termin. (mittel)
- Datenschutz (revDSG, seit 2023): Kundendaten nur zweckgebunden,
  Information über Bearbeitung, Löschkonzept; Unterschriften und
  Zahlungsdaten sind besonders zu schützen. Kartendaten erreichen die
  App nie (Stripe-Checkout). Ein Browser-Speicher ist für die Demo in
  Ordnung, für den Betrieb nicht. (hoch)
- Kennzahlen, die ein Showroom braucht: Abschlussquote Beratung → Offerte
  → Auftrag, Ø Auftragswert, Upsell-Anteil, Termintreue je Lieferant,
  Durchlaufzeit Anzahlung → Montage, offene Forderungen. (mittel)

**Folgen für das Produkt**

- Automationen mit klarem Auslöser, sichtbar im Postausgang und in der Zeitleiste; Demo-Uhr zum Vorführen.
- KI-Kennzeichnung an Entwürfen; Anschluss an ein Sprachmodell als Roadmap.
- Datenschutzhinweis auf Offerte und Kundenportal; Löschfunktion je Kunde als Roadmap.

---

## 9 Die stärksten Momente für ein Verkaufsgespräch

1. **Die Wanne zieht ihr Material nach.** Ein Tipp auf «Badewanne», und
   sechs Zeilen Installationsmaterial stehen da – das Argument gegen die
   vergessene Ab- und Überlaufgarnitur.
2. **Die Wohnung ohne Lift schlägt die Etagenlieferung vor.** Der
   Objektkontext arbeitet sichtbar.
3. **Unterschrift, TWINT-QR, Auftrag.** In einer Minute von der Offerte zum
   Auftrag mit drei Bestellungen im Postausgang.
4. **Der Zeitsprung.** Fünf Tage vorspulen, und die Statusanfrage an den
   Lieferanten ist raus; zehn Tage, und der Kunden-Entwurf wartet auf
   Freigabe.
5. **Der Scan am Handy erscheint am PC.** Und beim letzten Scan bekommt
   die Kundin ihren Terminlink.
6. **Die Rechnung, die man mit der Banking-App scannt.** Zahlteil aus der
   App, ohne Bank-Software.

## 10 Was zuerst käme

1. Server und Datenbank statt Browserspeicher, echter Mailversand.
2. Stripe Checkout live mit Webhook, TWINT im Testmodus prüfen.
3. Lieferantenportal als eigenes Produkt mit Termintreue-Auswertung.
4. Rechtliche Prüfung: AGB (Anzahlung, Mahngebühren, Verzugszins,
   Stornierbarkeit), Werkvertrag Montage, Datenschutzerklärung.
5. Export nach bexio/KLARA.

## Quellen


1. https://www.tagblatt.ch/wirtschaft/warum-bruttopreise-so-wichtig-sind-ld.186571
2. https://www.tagblatt.ch/wirtschaft/warum-bruttopreise-so-wichtig-sind-ld.186571
3. https://www.haus-forum.ch/threads/rabatt-auf-sanitaerapparate.8323/
4. https://www.sanitastroesch.ch/de/bad/planung
5. https://shop.sanitastroesch.ch/ratgeber/online-shop-kurz-erklaert
6. https://www.sabag.ch/de/bauprodukte/sanitaer
7. https://www.baubedarf-richner-miauton.ch/de/dienstleistungen/badplanung-neu-gedacht/
8. https://www.getaz-miauton.ch/bain/
9. https://www.geberit.ch/haendlersuche/ausstellungen/
10. https://www.nzz.ch/wirtschaft/weko-buesst-sanitaer-grosshaendler-mit-80-millionen-franken-ld.934061
11. https://www.gc-gruppe.de/elements
12. https://www.duschwc-center.ch/
13. https://www.handwerksblatt.de/betriebsfuehrung/so-schuetzen-sich-handwerker-vor-beratungsklau
14. https://hugentoblerheizungen.ch/wordpress/blog-badumbau-kosten-schweiz-2026/
15. https://edlesbad.ch/produkte/badewanne-metall-kaldewei-cayono-1707542/
16. https://www.sanitastroesch.ch/de/agb
17. https://baunex.ch/blog/akonto-teilrechnung-schlussrechnung-handwerk-schweiz/
18. https://www.skribble.com/de-ch/blog/digitale-unterschrift-rechtsgueltig/
19. https://www.ikz.de/sanitaertechnik/news/detail/einbau-von-kundenmaterial/
20. https://suissetec.ch/de/portraet.html
21. https://www.gruender.de/gruendung/provisionsmodelle-vermittlungsprovision/
22. https://wiki.bubiza.de/doku.php?id=sanitaer%3Amontage_von_badewannen
23. https://baunex.ch/blog/handwerker-app-schweiz-tools-vergleich/ ; https://help.bexio.com/s/article/000001929?language=de ; https://www.klara.ch/en/order-management
24. https://www.sorba.ch/produkte/auftragsabwicklung/offerte_abrechnung ; https://support.sorba.ch/hc/de/articles/360017678239-APP-SORBA-myRapport-App-iOS-Android ; https://baunex.ch/branchen/sanitaer/
25. https://www.label-software.de/shk-handwerkersoftware ; https://taifun-software.de/produkte/taifunplus/ ; https://pds.de/gewerke/shk ; https://www.streit-software.de/handwerkersoftware
26. https://pds.de/software/handwerk/einkauf ; https://pds.de/software/mobilitaet/material-app ; https://hero-software.de/features/schnittstellen
27. https://trusted.de/tooltime-kosten ; https://www.tooltime.app/angebotssoftware ; https://hero-software.de/features/app ; https://hero-software.de/finance/wallet ; https://www.rechnung-handwerk.de/plancraft/
28. https://www.geberit.ch/badezimmerprodukte/digitale-tools/3d-badplaner/ ; https://badplaner.sanitastroesch.ch/ ; https://apps.apple.com/de/app/hansgrohe-showroom/id547171031 ; https://www.baubedarf-richner-miauton.ch/de/dienstleistungen/badplanung-neu-gedacht/
29. https://www.sanitastroesch.ch/de/business/bad ; https://www.sanitastroesch.ch/de/bad/planung ; https://www.dasbad.ch/
30. https://www.palettecad.com/sanitaer-fliese ; https://www.sanitaerjournal.de/ein-update-zum-thema-badplanungssoftware_14398 ; https://www.compusoftgroup.com/kbb-software-professional-kitchen-and-bathroom-software-from-compusoft/ ; https://kitchendev.com/products/kitchen-bath-retailer-suite/
31. https://wise.com/ch/blog/stripe-gebuehren-schweiz ; https://stripe.com/de/payment-method/twint ; https://www.netzwoche.ch/news/2026-08-24/handelsverband-verlangt-tiefere-twint-gebuehren
32. https://www.skribble.com/de-ch/blog/einfache-elektronische-signatur/ ; https://www.weka.ch/themen/recht/allgemeines-privatrecht/vertragsabschluss/article/digitale-signatur-sind-digital-signierte-vertraege-rechtsgueltig/
33. https://www.comsol.ag/blog/lieferanmahnung ; https://sog.de/wp-content/uploads/SOG-Einkaufsmahnungen.pdf ; https://www.tacto.ai/de/einkaufer-lexikon/liefermahnung
34. https://abverkauf-shop.talsee.ch/ ; https://www.bad-direkt.com/faq-items/bezahlung-lieferung-lieferzeit/ ; Fachwissen
35. https://www.handwerker-kosten.ch/bad-renovation/ ; https://www.handwerker-kosten.ch/sanitaer/ ; https://www.ofri.ch/ratgeber/an-und-vorauszahlungen ; https://baunex.ch/blog/akonto-teilrechnung-schlussrechnung-handwerk-schweiz/
36. https://pro.hansgrohe.com/service/partner-program/showroom-concept ; https://www.kaldewei.de/badplanung/ausstellungssuche/ ; https://www.viessmann.de/de/fachkunden/fachhandwerker/installateure.html
37. https://www.label-software.de/shk-handwerkersoftware ; https://www.mfr-deutschland.de/branchen/shk-software ; Fachwissen
38. https://www.hornbach.de/projekte/badewanne-einbauen-mit-wannentraeger/ ; https://www.megabad.com/magazin/ratgeber/badezimmer/badewannentraeger-einbauen/ ; Fachwissen
39. https://www.cash.ch/news/top-news/twint-zahlungen-kunftig-bei-kunden-von-stripe-akzeptiert-716342
40. https://docs.stripe.com/payments/twint
41. https://docs.stripe.com/payments/twint
42. https://docs.stripe.com/payment-links/post-payment
43. https://support.stripe.com/questions/pricing-for-apple-pay-with-stripe
44. https://stripe.com/en-ch/pricing
45. https://www.watson.ch/schweiz/wirtschaft/252877914-twint-arbeitet-mit-onlineshops-diese-muessen-hohe-gebuehren-zahlen
46. https://www.openstream.ch/zahlungsanbieter-schweizer-onlineshops-2026/
47. https://payrexx.com/guides/tap-to-pay-smartphone-terminal-switzerland-comparison
48. https://github.com/openfoodfoundation/openfoodnetwork/pull/13424
49. https://www.weka.ch/themen/recht/allgemeines-privatrecht/vertragsabschluss/article/digitale-signatur-sind-digital-signierte-vertraege-rechtsgueltig/
50. https://www.bakom.admin.ch/de/23-welche-rechtskraft-haben-elektronische-signaturen
51. https://www.skribble.com/de-ch/blog/digitale-unterschrift-rechtsgueltig/
52. https://law.ch/lawinfo/kaufvertrag/widerruf/
53. https://gesetzestexte.help.ch/or/artikel.cfm?key=572&art=Der_Werkvertrag
54. https://www.ofri.ch/ratgeber/an-und-vorauszahlungen
55. https://suissetec.ch/de/agb.html
56. https://pfeffersack.ch/blog/mahnwesen-schweiz-zahlungserinnerung-anleitung
57. https://www.infinity.swiss/blog/mahnung-schreiben-schweiz
58. https://law.ch/lawinfo/werkvertrag/besteller-pflichten/werklohn-zahlung/werklohn-verjaehrung/
59. https://www.six-group.com/en/products-services/banking-services/payment-standardization/standards/qr-bill.html
60. https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.3-de.pdf
61. https://raw.githubusercontent.com/manuelbl/SwissQRBill/master/README.md
62. https://kvfit.ch/ratgeber/mwst-saetze-2026
63. https://balio.ch/de/ratgeber/rechnung-pflichtangaben-schweiz
64. https://www.bdo.ch/de-ch/publikationen/aufbewahrungspflichten-und-aufbewahrungsfristen-von-geschaeftsunterlagen-in-der-schweiz
65. https://www.swissbau.ch/de/p/geberit-vertriebs-ag.132820 ; https://www.sabag.ch/de/innenausbau/badezimmer
66. https://www.sanitastroesch.ch/sites/sanitastroesch.ch/files/2023-01/20230101_DE_AGB%20Sanitas%20Troesch_download_0.pdf
67. https://shop.sanitastroesch.ch/footer/versand-und-lieferung/ ; https://www.sanitastroesch.ch/de/profishop ; https://www.baubedarf-richner-miauton.ch/de/geschaeftskunden/
68. https://www.sanitastroesch.ch/agb-bad ; https://www.laufen.ch/agb ; https://www.similor.ch/de/agb
69. https://gesetzestexte.help.ch/or/artikel.cfm?key=682&art=Der_Frachtvertrag ; https://www.weka.ch/themen/recht/transport-und-verkehr/sachtransport-fracht/article/transportschaden-haftung-und-gewaehrleistung-beim-transport/
70. https://www.reuter.de/marken/kaldewei.html ; https://www.duschmeister.ch/Koralle-Duschkabinen.html ; https://www.duscholux.com/ch-de/duscho/agb.html ; https://www.baddirekt.ch/c/wc-dusch-wc/dusch-wc/geberit ; talsee.ch/badmoebel ; Fachwissen
71. https://www.tacto.ai/einkaufer-lexikon/bestellbestaetigungspflicht ; https://codezentrale.de/sap-auftragsbestaetigungen-ueberwachen-anzeigen/
72. https://sog.de/wp-content/uploads/SOG-Einkaufsmahnungen.pdf ; https://www.erpyourself.net/de/sap-transaktionen/ME91F.html ; https://www.weka.de/einkauf-logistik/lieferverzug-was-tun/
73. https://blog.learnhowtosource.com/the-power-of-expediting-in-procurement/ ; https://www.tacto.ai/us/procurement-glossary/on-time-in-full
74. https://www.tup.com/logistikknowhow/avisieren-avisierung-avis-definition-und-ueberblick/ ; https://kep-ag.de/lieferavis/ ; https://www.sanitastroesch.ch/de/business/bad/logistik ; https://www.sanitastroesch.ch/de/business/partner/objektgeschaeft
75. https://www.gs1-germany.de/standards/barcodes-rfid/ean-barcode/ ; https://de.grit.eu/presseartikel-und-news/sscc-beschleunigt-den-wareneingang-in-grossen-unternehmen-bis-zu-einem-drittel ; https://mhv.systems/lexikon/nve---nummer-der-versandeinheit
76. https://www.logistik-journal.de/wareneingangskontrolle/ ; https://www.lineup.de/beitrag/wareneingangspruefung/
77. https://www.paulus-lager.de/kommissionsmaterial-verwaltung/ ; https://support.sonepar.de/hc/de/articles/6342058631825-Wo-liegt-der-Unterschied-zwischen-Kommission-Bestellzeichen-und-Lieferhinweis ; https://www.shk-profi.de/artikel/shk_Die_zehn_teuersten_Fehler_im_Lager-2350990.html
78. https://onlinehilfe.sage.de/onlinehilfe/hwp/60/hwhelp/idh_wareneingangdlg_doku_eingangsmenge.htm ; https://learning.sap.com/courses/inventory-management-and-physical-inventory-in-sap-s-4hana-de/toleranzen-und-endlieferungskennzeichen-anwenden
79. https://www.sabag.ch/de/innenausbau/badezimmer ; https://www.geberit.ch/haendlersuche/ausstellungen/ ; Fachwissen
