# BADWERK – Konzept und Vision

Stand: 1. September 2026 · Tag 8 von 30 · Grundlage für `bad/index.html`
Recherche mit Quellen: [`RECHERCHE.md`](RECHERCHE.md)

---

## 1 Die These in drei Sätzen

**BADWERK ist das Auftragssystem für einen Sanitär-Showroom, der direkt an
Endkunden verkauft, aber nicht selbst montiert.** Es führt jeden Auftrag
von der Beratung am Tablet über Unterschrift, Anzahlung, Bestellung bei
mehreren Lieferanten, Lieferfrist-Überwachung, Wareneingang per QR-Code,
Terminwahl des Kunden und Montage durch einen Partnerbetrieb bis zur
bezahlten Schlussrechnung – und zwar so, dass der Inhaber jederzeit sieht,
wo jeder Auftrag steht und was heute zu tun ist. Genau diese Kombination
gibt es am Markt nicht: Schweizer KMU-Software (bexio, KLARA, Abacus) kann
Offerte und Rechnung, aber keine Beschaffung; deutsche SHK-ERPs (pds,
TAIFUN, STREIT) können Beschaffung, sind aber schwer, installateurzentriert
und nicht auf einen Showroom zugeschnitten; die Bad-Konfiguratoren der
Hersteller enden bei «Entwurf an Fachhändler senden».

Es wird bewusst **kein ERP und kein CRM im klassischen Sinn**, sondern ein
«Showroom-Auftragssystem» mit CRM-Kern: eine Zeitleiste je Auftrag als
einzige Wahrheit, darum herum genau die Funktionen, die Umsatz, Marge und
Ruhe im Betrieb bringen. Buchhaltung, Lohn, Aufmass und 3D-Badplanung
bleiben draussen.

---

## 2 Was wir am Briefing hinterfragt und angepasst haben

Wir haben das Briefing als Mitgründer gelesen, nicht als Auftragnehmer.
Sieben Punkte haben wir verändert oder geschärft:

| Briefing | Unsere Anpassung | Warum |
|---|---|---|
| Kunde bezahlt die Offerte am Tablet per Stripe oder TWINT | **Anzahlung** (Standard 40 %) am Tablet, Rest als **Schlussrechnung mit QR-Zahlteil** nach der Montage, 30 Tage netto | Bäder kosten CHF 5'000–35'000. TWINT ist über Stripe auf CHF 5'000 pro Zahlung begrenzt, Karten kosten 2.9 %. Vollzahlung vor Lieferung ist in der Branche unüblich und bei unverbindlichen Lieferfristen ein Reputationsrisiko. Die App prüft die TWINT-Limite und schlägt Karte oder Aufteilung vor. |
| «Wenn der Lieferant normalerweise in drei Tagen liefert und wir es fünf Tage vorher nicht haben, geht ein Mail raus» | Ein **vierstufiges Regelwerk**, das an der **bestätigten Lieferfrist aus der Auftragsbestätigung** hängt, nicht nur an der Standardfrist | Erst die Auftragsbestätigung (AB) des Lieferanten macht den Termin verbindlich. Ohne AB gilt die Standardfrist. Stufe 0: AB-Erinnerung nach 2 Werktagen. Stufe 1: Statusanfrage 5 Werktage vor Termin («Ist die Sendung unterwegs?»). Stufe 2: Liefermahnung am Werktag +1 mit Kunden-Mail als Entwurf. Stufe 3: Eskalation am Werktag +6. |
| Die Monteure «erhalten idealerweise eine App von uns» | **Kein App-Store, sondern ein Portal-Link**: Der Partnerbetrieb bekommt mit dem Montageauftrag einen Link (Auftragsblatt, Stückliste, Zugang, Termin bestätigen, Fertigmeldung mit Abnahme-Unterschrift) | Externe Betriebe installieren keine fremde App für zwei Aufträge im Monat. Ein Link im Mail funktioniert auf jedem Handy sofort. Die Fertigmeldung löst die Schlussrechnung aus – das ist der Punkt, an dem der Betrieb mitspielen muss. |
| «Die KI-Automatisierung könnten wir den Lieferanten verkaufen» | Der verkaufbare Teil ist ein **Lieferantenportal**: AB mit einem Klick bestätigen, Lieferavis mit Sendungsnummer melden, Verzug selbst melden – jede Meldung stoppt die nächste Mahnstufe. **KI** bleibt Entwurfshilfe (Mailentwürfe, Verzugsrisiko), nicht Entscheider | Was den Lieferanten Zeit spart, ist nicht die Mahnung, sondern dass sie nicht mehr angerufen werden. Termintreue (OTIF, ±2 Werktage) je Lieferant im Dashboard ist das Verkaufsargument. In der Demo sind KI-Entwürfe als solche gekennzeichnet; ein echter Sprachmodell-Anschluss ist Roadmap. |
| «Wenn alle Produkte da sind, wird der Kunde benachrichtigt» | Bleibt die Regel – ergänzt um die Definition **montagebereit = alle Positionen aller Bestellungen eingetroffen und keine Schadensmeldung offen**. Zwei Etappen (Rohinstallation, Fertigmontage) sind vorbereitet, aber in der Demo aus | Ohne die Schadensregel steht der Monteur vor einer zerkratzten Wanne. Die Etappenlogik ist bei Sanierungen der nächste Schritt. |
| Objektkontext «Einfamilienhaus, Wohnung, …» | **Sechs Felder**, die wirklich etwas auslösen: Gebäudetyp, Stockwerk + Lift, Neubau/Sanierung, Baujahr vor/nach 1990, Eigentum/Miete, Zugang | Jedes Feld hat eine Regel: ohne Lift ab 1. OG → Etagenlieferung; Sanierung → Demontage/Entsorgung vorschlagen; Baujahr vor 1990 → Adapter-Set und Hinweis Anschlussmasse; Miete → Freigabe der Verwaltung als Status; Neubau → Rohbau-Variante des Installationsmaterials. Felder ohne Regel gibt es nicht. |
| Showroom-Buchung für Sanitärbetriebe «gratis, Provision oder Abo mit Kaffee und Gipfeli» | **Zwei Stufen, beide transparent**: «Partner Basis» gratis mit 6 % Vermittlungsprovision auf vermittelte Montagen und Standard-Slots; «Partner Plus» CHF 149/Monat ohne Provision, mit Prime-Slots (Samstagvormittag, Kaffee und Gipfeli), Vorrang bei Montageaufträgen und Co-Branding auf der Offerte | Provisions- und Abo-Modelle zwischen Showroom und Installateur sind in der Schweiz nicht öffentlich dokumentiert; üblich sind Rabattkategorien und Tippgeberprovisionen von 5–10 %. Wichtig: keine Preisabsprachen abbilden (Kartellrecht), Provisionen ausweisen. |

Zwei Dinge haben wir **bewusst nicht** angepasst: Der Auftrag entsteht
erst mit der Anzahlung (nicht mit der Unterschrift) – das ist der klare
Moment, ab dem bestellt wird. Und der Lagermitarbeiter braucht keine
weitere Oberfläche als «Scannen»: was er scannt, sieht der Manager.

---

## 3 Stakeholder und ihre Zugänge

| Wer | Bedürfnis | Zugang | Gerät |
|---|---|---|---|
| **Carlos, Inhaber** | Sehen, wo jeder Auftrag steht; was heute Geld oder Ärger bedeutet; Marge; Lieferanten, die bremsen | Code **1234** → Konsole, alles | PC |
| **Nadine Keller, Beratung/Verkauf** | Offerte in fünf Minuten am Tablet, Unterschrift und Anzahlung ohne Medienbruch, Kunden und Showroom-Termine | Code **2468** → Konsole ohne Einkauf und Margen | Tablet |
| **Marco Bianchi, Lager** | Ware dem richtigen Auftrag zubuchen, Schäden sofort melden, wissen, was heute kommt | Code **98765** → Lager-App | Handy |
| **Endkunde** (Privat, Stockwerkeigentum, Verwaltung) | Verstehen, was er kauft; unterschreiben; bezahlen; wissen, wann es weitergeht; Termin selbst wählen; Rechnung mit Zahlteil | **Link** aus dem Mail (Kundenportal), kein Code | Tablet im Showroom, eigenes Handy |
| **Lieferanten** (Grosshandel, Hersteller) | Klare Bestellungen mit Kommission; nicht angerufen werden | **Link** aus der Bestellmail (Lieferantenportal): AB bestätigen, Avis melden, Verzug melden | PC |
| **Partnerbetriebe** (externe Sanitärbetriebe, Monteure) | Gute Kunden aus dem Showroom; vollständige Auftragsblätter; keine Fahrt zur unvollständigen Baustelle | **Link** (Partnerportal): Showroom-Termin buchen, Montageauftrag annehmen, Termin bestätigen, Fertigmeldung mit Abnahme | Handy, PC |
| **Verwaltung / Architekt** (Objektgeschäft) | Mehrere gleiche Bäder, Rechnungsadresse abweichend, 30 Tage netto ohne Anzahlung | Wie Endkunde, Kundentyp «Geschäft» | PC |
| **Buchhaltung / Treuhand** | Rechnungen, Zahlungen, Mahnungen, Export | Roadmap: eigener Code, nur Abrechnung | PC |

Die Rollen steuern die Oberfläche und einzelne Knöpfe. Eine serverseitige
Rechteprüfung gibt es in der Demo nicht.

---

## 4 Der Kernprozess: von der Beratung bis zum Archiv

Die Kette ist das Rückgrat des Systems. Was in Klammern steht, tut die
App ohne Zutun.

1. **Showroom-Termin.** Kunde bucht selbst, ein Partnerbetrieb bucht für
   seinen Kunden, oder die Beratung trägt ihn ein. *(Bestätigung per Mail,
   Lead dem Partner zugeordnet.)*
2. **Offerte am Tablet** in vier Schritten: Kunde und Objekt → Produkte
   (Installationsmaterial hängt automatisch an) → Optionen, Pakete und
   Zusatzleistungen → Zusammenfassung. *(Zuschläge aus dem Objektkontext,
   Live-Preis, Marge nur für den Inhaber sichtbar, kritischer Pfad der
   Lieferfristen als «frühester Montagetermin».)*
3. **Unterschrift** auf dem Tablet mit Audit-Trail (Zeit, Gerät, Name,
   Dokument-Hash) und Bestätigung der Zahlungsbedingungen. *(Offerten-PDF
   an den Kunden, Kundenportal-Link.)*
4. **Anzahlung** per TWINT (QR-Code, Kunde scannt mit eigenem Handy), Karte
   oder Apple Pay – oder «Zahlung eingegangen» bei Überweisung. *(Mit der
   Anzahlung entsteht der Auftrag: Auftragsbestätigung an den Kunden,
   Bestellungen je Lieferant mit Kommission und Portal-Link, QR-Codes je
   Bestellposition für das Lager, Auftrag erscheint im Dashboard.)*
5. **Auftragsbestätigungen der Lieferanten** kommen per Portal-Klick oder
   werden von Hand eingetragen; der bestätigte Termin überschreibt den
   Plan-Termin. *(AB-Erinnerung nach 2 Werktagen ohne AB.)*
6. **Lieferfrist-Überwachung.** *(Statusanfrage 5 Werktage vor Termin,
   Liefermahnung am Werktag +1 samt Kunden-Mail als Entwurf, Eskalation
   am Werktag +6 samt Aufgabe für den Inhaber. Jede Meldung des
   Lieferanten stoppt die nächste Stufe.)*
7. **Wareneingang per QR-Scan** im Lager: OK oder «Beschädigt – unter
   Vorbehalt» mit Foto. Teillieferungen erlaubt. *(Position eingetroffen,
   Lagerplatz vorgeschlagen, sofort im Auftrag des Managers sichtbar;
   Schadensmeldung an den Lieferanten mit Rügefrist.)*
8. **Montagebereit.** *(Sobald alle Positionen da sind: Mail an den Kunden
   mit Terminlink; Slots kommen aus dem Kalender des zugewiesenen
   Partnerbetriebs, alternativ Calendly.)*
9. **Termin bestätigt** – online durch den Kunden oder im Dashboard nach
   Anruf. *(Mail an den Partnerbetrieb mit Auftragsblatt und Portal-Link,
   Bestätigung an den Kunden mit Kalenderdatei, Kommission im Lager auf
   «bereit zur Auslieferung».)*
10. **Montage und Abnahme.** Der Monteur meldet im Portal fertig, der Kunde
    unterschreibt die Abnahme. *(Schlussrechnung mit QR-Zahlteil, Anzahlung
    verrechnet, 30 Tage netto; Mail an den Kunden.)*
11. **Zahlung und Archiv.** *(Zahlungserinnerung 7 Tage nach Fälligkeit, 1. Mahnung
    nach 21, 2. Mahnung nach 35 Tagen – als Entwürfe zur Freigabe. Zahlung eingegangen →
    Auftrag archiviert mit allen Dokumenten, Bewertungsanfrage an den
    Kunden.)*

---

## 5 Die Tablet-Offerte im Detail

**Schritt 1 – Kunde und Objekt.** Name, Adresse, Kontakt, Kundentyp
(Privat, Stockwerkeigentum, Verwaltung/Geschäft), Herkunft (Showroom
direkt, Partnerbetrieb X, Empfehlung, Web). Dann die sechs Objektfelder:

| Feld | Werte | Regel |
|---|---|---|
| Gebäudetyp | Einfamilienhaus · Wohnung im Mehrfamilienhaus · Stockwerkeigentum · Gewerbe | steuert Anrede, Formulare, Verwaltungsfreigabe |
| Stockwerk und Lift | EG … 6. OG, Lift ja/nein | ohne Lift ab 1. OG → «Etagenlieferung» CHF 90/Stockwerk vorgeschlagen |
| Neubau oder Sanierung | Neubau · Sanierung | Sanierung → «Demontage und Entsorgung» vorgeschlagen; Neubau → Rohbau-Variante des Installationsmaterials |
| Baujahr | vor 1990 · ab 1990 | vor 1990 → Adapter-Set CHF 45 empfohlen, Hinweis «Anschlussmasse prüfen» |
| Eigentum oder Miete | Eigentum · Miete | Miete → Status «Freigabe Verwaltung ausstehend» am Auftrag |
| Zugang | Parkplatz vor dem Haus · Halteverbot nötig · Schlüssel bei Nachbar/Verwaltung | steht auf dem Auftragsblatt des Monteurs |

**Schritt 2 – Produkte.** Kategorien als grosse Karten: Badewanne,
Dusche, WC, Lavabo und Möbel, Armaturen, Spiegel und Licht, Heizung,
Accessoires. Jeder Artikel hat Endkundenpreis, Einstandspreis (nur für
den Inhaber sichtbar), Lieferant, **Lieferart** (Lager 1–3 Werktage,
Beschaffung 1–3 Wochen, Manufaktur 4–8 Wochen), Garantie und eine
**Stückliste**: das Installationsmaterial, das immer dazugehört. Beispiel
Badewanne: Wannenfüsse mit Anker, Ab- und Überlaufgarnitur,
Schallschutz-Set, Wannenrandprofil und Dichtband, Silikon,
Revisionsöffnung. Beim WC: Duofix-Element, Betätigungsplatte,
Anschlussgarnitur, Schallschutz, Befestigung. Beim Lavabo: Siphon,
Eckventile, Anschlussschläuche, Befestigung. Die Stückliste erscheint
eingerückt unter dem Produkt, mit dem Vermerk «immer benötigt»; der
Berater kann Mengen anpassen, aber nichts stillschweigend weglassen.
Sonderanfertigungen sind als «nicht stornierbar» gekennzeichnet.

**Schritt 3 – Optionen, Pakete, Zusatzleistungen.** Drei Arten, die
alle mehr Marge bringen als das Kernprodukt:

- **Optionen am Produkt**: Whirl-System (+CHF 3'450), Sonderfarbe,
  Thermostat statt Einhebelmischer (+CHF 260), WC-Sitz mit
  Absenkautomatik (+CHF 120), Dusch-WC statt Standard-WC (+CHF 3'200).
- **Pakete**: «Komfort» und «Premium» als vorgeschnürte Kombinationen mit
  Ersparnis gegenüber Einzelpreisen – der schnellste Weg zum grösseren
  Auftrag, ohne dass der Berater rechnen muss.
- **Zusatzleistungen des Showrooms**: Etagenlieferung, Demontage und
  Entsorgung, Express-Beschaffung, Garantieverlängerung auf 5 Jahre,
  Anti-Kalk-Beschichtung, Wartungsabo Dusch-WC (wiederkehrender Erlös),
  3D-Badplanung (bei Auftrag angerechnet – gegen Beratungsklau).

Der Objektkontext schlägt passende Leistungen vor; nichts wird
stillschweigend eingebucht. Der Inhaber sieht je Zeile die Marge.

**Montage durch Partnerbetrieb** steht als eigener Block mit Richtpreis
und dem Vermerk «Werkvertrag mit Partnerbetrieb, separate Rechnung» auf
der Offerte. So bleiben Haftung und Gewährleistung sauber getrennt:
Produkte 2 Jahre über den Showroom, Montage 2 Jahre über den Betrieb
(SIA 118). Wer den Kunden an den Partner vermittelt, steht auf der
Offerte – transparent.

**Schritt 4 – Zusammenfassung, Unterschrift, Anzahlung.** Positionen
in vier Blöcken, MWST 8.1 %, Anzahlung 40 % (bei Komplettbädern über CHF
15'000 wahlweise 30/30/40), Gültigkeit 30 Tage, Zahlungsbedingungen,
Garantiehinweis, kein gesetzliches Widerrufsrecht (Showroom-Kauf), die
Checkbox «Zahlungsbedingungen gelesen», dann Unterschrift und Zahlung.
TWINT über CHF 5'000 → Hinweis, Karte oder Aufteilung. Der Anzahlungsbeleg
geht mit dem signierten Offerten-PDF an den Kunden.

---

## 6 Bestellung, Lieferanten, Lieferfristen, Wareneingang

**Bestellungen** entstehen automatisch je Lieferant aus dem Auftrag,
mit Kommission im Betreff («Kommission A-2026-0142 Brunner»),
Bestellnummer (B-0142-01), Positionen, gewünschtem Liefertermin und dem
Portal-Link. Der Grosshandel (Sanitas Troesch, Richner) liefert Lagerware
über Nacht; Manufaktur- und Sonderware (talsee, Duscholux, Kaldewei
Sonderfarbe) kommt direkt vom Hersteller. Deshalb hängt die Lieferfrist
an der **Lieferart des Artikels**, nicht nur am Lieferanten.

**Statuskette je Bestellung:** gesendet → AB erhalten (mit bestätigtem
Termin) → avisiert (Sendungsnummer) → geliefert (Scan) – mit Mahnstufe
0–3 und Verzugstagen. Der Auftrag zeigt den **kritischen Pfad** (längste
Frist) und daraus den frühesten Montagetermin.

**Regeln der Lieferfrist-Überwachung** (Werktage, Schweizer Tonalität,
Sie-Form, vollständige Referenzen):

| Stufe | Wann | Was | Empfänger |
|---|---|---|---|
| 0 AB-Erinnerung | 2 Werktage nach Bestellung ohne AB | «Bitte bestätigen Sie Bestellung … mit Liefertermin» | Lieferant |
| 1 Statusanfrage | 5 Werktage vor Termin, kein Avis | «Ist die Sendung planmässig unterwegs? Sendungsnummer?» | Lieferant |
| 2 Liefermahnung | Werktag +1 nach Termin, nicht geliefert | Nachfrist 5 Werktage, Bitte um neuen verbindlichen Termin; **Kunden-Mail als Entwurf** («voraussichtlich», nie versprechen) | Lieferant, Entwurf an Kunde |
| 3 Eskalation | Werktag +6 | An Verkaufsleitung des Lieferanten, Hinweis auf Folgekosten; Aufgabe «Ersatzprodukt oder Termin verschieben» | Lieferant, Inhaber |

Jede Meldung aus dem Lieferantenportal (AB, Avis, neuer Termin) setzt
den Zähler neu. Der Inhaber kann Stufen pausieren.

**Wareneingang.** QR-Code je Bestellposition (Inhalt: Auftrag,
Bestellung, Position), am PC als Bogen druckbar. Der Scan bucht die
Position auf «eingetroffen», schlägt den Lagerplatz vor (Kommissionsfach
«K-0142», Regal A für Grossteile, B Keramik, C Kleinteile) und erscheint
sofort im Auftrag. Zwei Pflichtwege: **OK** oder **Beschädigt – unter
Vorbehalt** mit Foto; letzteres erzeugt die Schadensmeldung an den
Lieferanten mit Fristhinweis (Transportschaden 1 Tag beim Grosshandel, 8
Tage nach OR 452). Teillieferungen führen offene Mengen.

**Lieferanten-Kennzahlen:** Termintreue (OTIF ±2 Werktage), mittlere
Verspätung, Anzahl Mahnungen, AB-Reaktionszeit – die Grundlage für das
Verkaufsargument des Lieferantenportals und für die Wahl des
Grosshändlers.

---

## 7 Termin, Montage, Abnahme, Rechnung, Mahnung, Archiv

**Terminwahl.** Sobald der Auftrag montagebereit ist, erhält der Kunde
den Terminlink. Er sieht freie Halbtage des zugewiesenen Partnerbetriebs
(Mo–Fr 07:30–12:00 und 13:00–17:00, Mindestvorlauf 3 Werktage,
Standarddauer je Auftragsart: Wannenwechsel 2 Tage, WC-Ersatz ½ Tag,
Komplettbad 8–10 Tage). Ist ein Calendly-Link hinterlegt, wird dieser
eingebettet. Wer anruft, wird im Dashboard eingetragen – gleicher Effekt.

**Montageauftrag.** Der Partnerbetrieb bekommt per Mail das Auftragsblatt
(Kunde, Adresse, Zugang, Objektkontext, Stückliste, Lagerplatz, Termin)
und den Portal-Link. Dort bestätigt er den Termin, meldet fertig, lädt
Fotos hoch und lässt den Kunden die **Abnahme** unterschreiben. Die
Abnahme ist der Auslöser der Schlussrechnung – kein Warten auf Papier.

**Schlussrechnung.** Automatisch mit Leistungsdatum, MWST-Ausweis,
verrechneter Anzahlung, Fälligkeit 30 Tage netto und Schweizer
QR-Zahlteil (QR-IBAN, 27-stellige QR-Referenz mit Modulo-10-Prüfziffer,
vollständig in der App erzeugt). Der Kunde scannt den Zahlteil mit seiner
Banking-App.

**Mahnwesen** ohne Automatik-Risiko: Zahlungserinnerung 7 Tage nach
Fälligkeit (CHF 0), 1. Mahnung nach 21 Tagen (CHF 20), 2. Mahnung nach
35 Tagen (CHF 40, Betreibungsandrohung), Verzugszins 5 %. Alles landet als Entwurf im Postausgang; der Inhaber
gibt frei.

**Archiv.** Mit dem Zahlungseingang wird der Auftrag archiviert:
signierte Offerte, Auftragsbestätigung, Bestellungen und ABs,
Scan-Protokoll, Auftragsblatt, Abnahme, Rechnung, Mahnungen – als Bündel,
10 Jahre aufbewahrt. Danach eine Bewertungsanfrage und, wo ein Wartungsabo
verkauft wurde, der Service-Termin in 12 Monaten.

---

## 8 Partner-Ökosystem: der Burggraben

Die externen Sanitärbetriebe sind nicht nur Erfüllungsgehilfen, sondern
**die zweite Kundengruppe**. Sie bringen Kunden in den Showroom (weil sie
selbst keine Ausstellung haben) und montieren, was der Showroom verkauft.
Wer beides in einem System zusammenführt, hat etwas, das weder ein
Grossist noch ein Softwarehaus anbietet.

**Showroom-Termine für Partner.** Im Partnerportal bucht ein Betrieb einen
Beratungstermin für seinen Kunden (60 Minuten, Di–Sa). Der Lead ist dem
Betrieb zugeordnet; die spätere Offerte trägt sein Logo und seinen
Montageblock. Kaffee und Gipfeli gibt es am Samstagvormittag – das ist
kein Gag, sondern der Slot, an dem Ehepaare gemeinsam entscheiden.

**Zwei Stufen, transparent:**

| | Partner Basis | Partner Plus |
|---|---|---|
| Preis | gratis | CHF 149 pro Monat |
| Showroom-Slots | Standard | Prime-Slots (Sa-Vormittag, Di/Do-Abend), Kaffee und Gipfeli |
| Vermittlungsprovision an den Showroom | 6 % auf vermittelte Montagen | keine |
| Montageaufträge aus dem Showroom | nach Verfügbarkeit | Vorrang |
| Co-Branding auf der Offerte | – | ja |
| Lieferstatus der eigenen Kunden im Portal | ja | ja |

Umgekehrt zahlt der Showroom eine **Tippgeberprovision** (5 % auf den
Materialumsatz) an Betriebe, die Kunden bringen – oder rechnet über den
Partnerpreis ab. Beide Flüsse stehen im Partnerportal als Abrechnung.
Keine Preisabsprachen, keine Exklusivität: der Kunde bleibt frei.

**Lieferantenportal.** Dieselbe Idee auf der Beschaffungsseite: AB
bestätigen, Avis melden, Verzug melden – mit einem Klick statt Anruf.
Für den Lieferanten heisst das weniger Rückfragen; für uns ein
verlässlicher Termin. Das ist das Produkt, das sich später an Lieferanten
verkaufen lässt – als Portal, nicht als «KI».

---

## 9 Dashboard und Kennzahlen des Inhabers

Die Übersicht beantwortet drei Fragen: **Was zählt heute?** (Aufgaben:
Lieferung überfällig, AB fehlt, Entwürfe freigeben, Termin ohne
Bestätigung, Rechnung fällig, Showroom-Anfrage eines Partners), **Wo steht
jeder Auftrag?** (Pipeline: bestellt → teilgeliefert → montagebereit →
terminiert → abgeschlossen → verrechnet) und **Wie läuft das Geschäft?**

| Kennzahl | Warum |
|---|---|
| Offene Offerten (Anzahl, Wert) und Abschlussquote | der Verkaufstrichter |
| Umsatz Monat, Ø Auftragswert, Marge | die Wirtschaftlichkeit |
| Upsell-Anteil (Optionen und Zusatzleistungen am Auftragswert) | der Effekt des Tablets |
| Termintreue je Lieferant, überfällige Lieferungen | wer bremst |
| Durchlaufzeit Anzahlung → Montage | das Kundenerlebnis |
| Offene Forderungen, Mahnstufen | die Liquidität |
| Zahlungsgebühren (TWINT 1.9 %, Karte 2.9 %, QR-Rechnung 0) | der Zahlungsmix |
| Partner: Leads, Montagen, Provisionen, Abos | der zweite Geschäftszweig |

Je Auftrag gibt es eine **Zeitleiste** mit jedem Ereignis (wer, wann,
was), die Bestellungen mit AB und Mahnstufen, die Lagerpositionen mit
Scan-Zeit und -Person, Termine, Dokumente und alle Mails. Sie ist die
Beweisdokumentation für Rügefristen und die Grundlage des Archivs.

---

## 10 Was wir bewusst weglassen

- **Buchhaltung, Lohn, MWST-Abrechnung** – das können bexio, KLARA,
  Abacus besser; Export ist Roadmap.
- **3D-Badplanung und Aufmass** – Hersteller-Planer werden verlinkt.
- **EDI/IDS-Connect zum Grosshandel** – für einen Showroom mit wenigen
  Bestellungen pro Woche reichen Mail und Portal.
- **Lagerbestand von Ausstellungs- und Musterware** – Roadmap
  (Abverkauf mit Rabatt).
- **Eigene Monteur-App im App Store** – der Portal-Link reicht.
- **Mehrere Standorte, Mehrsprachigkeit, Rechtesystem mit Server** –
  nicht für Tag eins.
- **Echter Mailversand, echte Zahlung, echter Kalender-Sync** in der
  Demo – alles sichtbar simuliert (Postausgang, Stripe-Testmodus als
  Simulation, Kalenderdatei und Google-Link); die Anbindung ist
  vorbereitet.

---

## 11 Offene Annahmen, die der Kunde bestätigen muss

1. **Anzahlung 40 %** (30 % bei Komplettbädern über CHF 15'000). Oder
   will Carlos Vollzahlung bei Kleinaufträgen unter CHF 3'000?
2. **Montage als Werkvertrag zwischen Kunde und Partnerbetrieb** mit
   separater Rechnung – oder verrechnet der Showroom die Montage weiter?
3. **Bestellung sofort nach Anzahlung** – oder eine freiwillige
   Kulanzfrist von 7 Tagen als Verkaufsargument (kostet Lieferzeit)?
4. **Grosshandel als Hauptlieferant** (Sanitas Troesch oder Richner) mit
   Direktbezug nur für Manufakturware – stimmt das mit Carlos' Konditionen?
5. **Provisionssätze** 6 % Vermittlung, 5 % Tippgeber, Abo CHF 149 –
   Platzhalter, die die Partner mittragen müssen.
6. **Mahngebühren** CHF 20 / CHF 40 und Verzugszins 5 % müssen in Carlos'
   AGB stehen.
7. **Lagerplatz-Schema** und ob Grossteile direkt auf die Baustelle
   geliefert werden sollen (spart Handling, braucht Monteur-Bestätigung).

---

## 12 Die Demo morgen früh: Storyboard

Drei Geräte: PC (Konsole), Tablet oder zweites Browserfenster (Offerte),
Handy (Lager). Live-Verbindung in den Einstellungen einschalten, damit
das Handy den PC aktualisiert. Zeit: rund zehn Minuten.

| # | Szene | Gerät, Code | Klickfolge | Wow-Moment |
|---|---|---|---|---|
| 1 | **Was heute zählt** | PC, 1234 | Übersicht öffnen | Aufgabenliste mit überfälliger Lieferung, Entwurf zur Freigabe, Partner-Anfrage; Pipeline aller Aufträge |
| 2 | **Offerte in fünf Minuten** | Tablet, 2468 | Neue Offerte → Kundin Andrea Brunner (Wohnung 3. OG, MFH 1978, Sanierung, ohne Lift) → Badewanne Kaldewei | Installationsmaterial hängt sich automatisch an; Etagenlieferung, Entsorgung und Adapter-Set werden vorgeschlagen |
| 3 | **Mehr verdienen** | Tablet | Whirl-System, Wannengriff, Paket «Komfort», Garantieverlängerung | Marge je Zeile für den Inhaber, Live-Total |
| 4 | **Unterschrift und TWINT** | Tablet | Zusammenfassung → Unterschrift → Anzahlung TWINT | QR-Code, Zahlung simuliert, Auftrag entsteht |
| 5 | **Alles ausgelöst** | PC | Auftrag öffnen | Bestellungen an drei Lieferanten im Postausgang, QR-Codes fürs Lager, Zeitleiste |
| 6 | **Lieferant bestätigt** | PC (Link aus der Bestellmail) | Lieferantenportal → AB bestätigen mit Termin | Termin erscheint am Auftrag, kritischer Pfad aktualisiert |
| 7 | **Zeitsprung** | PC | Demo-Uhr +5 Tage, +7 Tage | Statusanfrage geht automatisch raus, dann Liefermahnung samt Kunden-Entwurf «KI-Entwurf» im Postausgang |
| 8 | **Scan am Handy, Ergebnis am PC** | PC + Handy, 98765 | QR-Bogen am PC → Handy scannt → OK | Position steht am PC auf «eingetroffen», Lagerplatz K-0142; beim letzten Scan: «montagebereit», Mail an Kundin mit Terminlink |
| 9 | **Kundin wählt Termin** | Handy oder PC (Link) | Kundenportal → freien Halbtag wählen | Termin bestätigt, Mail an Partnerbetrieb mit Auftragsblatt, Kalenderdatei |
| 10 | **Fertig – Rechnung – Archiv** | PC (Monteur-Link) | Monteurportal → Fertigmeldung, Abnahme-Unterschrift | Schlussrechnung mit QR-Zahlteil im Postausgang; +40 Tage → Zahlungserinnerung als Entwurf; «Zahlung eingegangen» → Archiv |
| 11 | **Partner bucht Showroom** | PC (Partner-Link) | Partnerportal → Samstagvormittag «Kaffee und Gipfeli» | Anfrage im Dashboard, Abrechnung Provision und Abo |

Für jede Szene gibt es Demodaten, die den Moment tragen: einen
«Problemlieferanten» (Kaldewei Sonderfarbe, 88 % Termintreue), einen
Auftrag mit Teillieferung und Schadensmeldung, einen Auftrag, der auf den
Kundentermin wartet, eine fällige Rechnung.

---

## 13 Roadmap nach der Demo

**Stufe 1 – Betrieb (4–6 Wochen):** Server mit Datenbank statt
Browserspeicher und Firestore-Dokument; echter Mailversand mit
Antworterkennung (AB per Mail-Antwort erfassen); Stripe Checkout live mit
Webhook; Calendly oder Google-Kalender per OAuth; Benutzerkonten mit
Rechten; PDF-Erzeugung serverseitig; Export nach bexio/KLARA.

**Stufe 2 – Wachstum (Quartal):** Lieferantenportal als eigenes Produkt
(Termintreue, Avis, Verzugsmeldung); Sprachmodell für Mailentwürfe,
Verzugsrisiko und Ersatzproduktvorschlag; Montage in zwei Etappen;
Direktlieferung Baustelle; Ausstellungs- und Musterware; Wartungsabo mit
Serviceplanung.

**Stufe 3 – Plattform (Jahr):** mehrere Showrooms, Objektgeschäft für
Verwaltungen (Mehrfachbestellung gleicher Bäder), Partnernetzwerk mit
Bewertung und Lead-Verteilung, Grosshandels-Schnittstelle (IDS-Connect,
DATANORM), Kundenkonto mit Servicehistorie.
