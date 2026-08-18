# Recherche: Was eine Auftrags-App für Dachdecker wirklich können muss

Stand: August 2026 · Grundlage für DACHWERK (`dach/index.html`)

Acht Fachgebiete wurden parallel untersucht: Kernprozess der
Auftragsabwicklung, Dachdecker- und Spengler-Spezifika, Arbeitssicherheit
in der Schweiz, Material- und Lagerwirtschaft, Abrechnung und Finanzen,
Zeiterfassung und Personal, mobile Bedienung auf dem Dach, Büro-Dispo am
PC. Zwei weitere Gebiete (Marktvergleich, Web-Machbarkeit) blieben offen.

> **Zur Belastbarkeit:** Das Netz war während der Recherche nur
> eingeschränkt erreichbar. Die Angaben zu Prozessen, Datenmodellen und
> Bedienmustern stammen aus Fachwissen und sind praxisnah, aber nicht
> durchgehend mit Quellen belegt. **Alles, was rechtlich zählt – Fristen
> nach OR und SIA 118, SUVA- und EKAS-Vorgaben, GAV Gebäudehülle,
> MWST-Sätze – gehört vor dem produktiven Einsatz gegen die Originaltexte
> geprüft.** Die Spezifikation der QR-Rechnung wurde dagegen gegen das
> offizielle Musterbeispiel getestet (siehe Abschnitt 5).

---

## 1 Kernprozess: vom Anruf bis zum Zahlungseingang

**Die wichtigste Erkenntnis ist ein Datenmodell, kein Feature.** Ein
Dachauftrag ist nicht ein Termin. Eine Flachdachsanierung läuft über acht
Tage, mit wechselnden Teams, zwei Regenunterbrüchen, einem Nachtrag und
einer Abnahme vier Wochen später. Wer `Auftrag = Termin = Rapport` in
einen Datensatz legt, zwingt das Büro dazu, pro Tag einen neuen „Auftrag"
anzulegen – und verliert Auftragssumme, Nachkalkulation und Historie.

Richtig ist: **Auftrag 1:n Einsatz 1:n Rapportzeile.**

Ebenso zentral: ein **explizites Statusmodell mit erlaubten Übergängen**
und lückenloser Historie (wer, wann, von wo nach wo). Jeder Übergang ist
später der Beweis, wann welche Leistung erbracht wurde.

Weitere Pflichtstücke aus der Recherche:

- **Sechs Auftragsarten** mit je eigenen Pflichtfeldern und Sperren:
  Reparatur, Notfall, Neubau/Umbau, Wartung, Garantie, Versicherung. Ein
  Garantieauftrag darf nie automatisch in eine Rechnung laufen; ein
  Versicherungsauftrag nicht ohne Kostengutsprache starten.
- **Nachträge vor der Ausführung freigeben lassen**, nicht nachher
  diskutieren. Mündliche Freigaben brauchen ein rotes Merkmal und eine
  tägliche Erinnerung, bis sie schriftlich bestätigt sind.
- **Abnahme mit Vollendungsanzeige** und Fristenwächter (Rügefrist,
  Verjährung, Bauhandwerkerpfandrecht).

**In DACHWERK umgesetzt:** Statusmodell mit zehn Zuständen und
protokolliertem Übergang, Auftragsarten mit eigenen Vorlagen und Farben,
Nachtragsfreigabe durch das Büro mit Rückmeldung an den Monteur,
Mängelverwaltung mit Folgeauftrag, vollständiger Verlauf je Auftrag.

**Bewusst weggelassen:** die Trennung Auftrag/Einsatz (ein Auftrag hat
hier einen Termin), Abnahmeprotokoll mit Fristenwächter,
Behinderungsanzeige, Versicherungsfall als eigene Auftragsart. Für eine
Vorführung tragen sie nichts bei, für den Betrieb sind sie der nächste
Schritt.

## 2 Dachdecker-Spezifika: das Gebäude ist die Hauptsache

Der häufigste Konstruktionsfehler in Handwerkersoftware: **der Kunde ist
die Hauptentität, das Gebäude nur ein Adressfeld.** Damit zerfällt die
Geschichte eines Daches, sobald der Eigentümer wechselt – und genau die
ist bei einer Lebensdauer von 40 Jahren das Wertvollste, was ein Betrieb
über seine Objekte weiss.

Nötig ist eine **Objektakte („Dachpass")** als eigene Entität mit:

- Dachform, Fläche, Neigung, Eindeckung, Baujahr, letzte Sanierung
- Zugangs- und Rüstprofil: Absturzsicherung, Gerüst, Hubsteiger, Kran,
  Parkplatz, Schlüssel, Höhe, Etagen
- Aufbauten: Dachfenster, Kamine, Lukarnen, Solaranlage, Schneefang
- Historie über Jahre, mit Bildarchiv

Zwei Fallen aus der Praxis: die **Dachfläche wird als Grundfläche
gerechnet** – bei 40 Grad Neigung fehlen 30 Prozent Material. Und
**Fotos landen in einer flachen Galerie** ohne Rolle (vorher/nachher) und
ohne Verortung.

**In DACHWERK umgesetzt:** vollständige Objektakte mit Dach-, Zugangs- und
Sicherheitsdaten, Zustandsnote, Auftragshistorie, Bildarchiv, Karte;
Fotos tragen Phase, Zeit, Person und Auftragsbezug.

**Bewusst weggelassen:** Dachskizze als Positionsträger (jeder Mangel an
einem Punkt der Skizze), Aufmass mit Materialableitung aus der Geometrie,
Chargenführung. Die Dachskizze ist die stärkste der ausgelassenen Ideen –
sie wäre der nächste grosse Schritt.

## 3 Arbeitssicherheit: die Checkliste muss etwas auslösen

Auf dem Dach ist Absturz die tödlichste Gefahr im Baugewerbe. Die
Recherche nennt drei Dinge, die eine App richtig machen muss:

1. **Eine blockierende Startfreigabe.** Ohne quittierte Prüfung von
   Absturzsicherung, PSA, Zugang, Wetter und Absperrung startet der
   Auftrag nicht. Quittiert wird mit Name und Zeit, nachträglich nicht
   editierbar, und niemals stellvertretend durch das Büro.
2. **Kurz halten.** Über etwa acht Fragen kippt die Akzeptanz, und die
   Equipe tippt blind durch. Lieber wenige Fragen, die wirklich etwas
   auslösen.
3. **Konsequenz.** Wenn ein „Nein" nichts bewirkt, ist die Checkliste in
   zwei Wochen wertlos.

**In DACHWERK umgesetzt:** Sicherheitscheck mit acht Punkten, blockierend
vor Arbeitsbeginn, mit Zeitstempel und Person; Warnung, wenn das Objekt
keine feste Absturzsicherung hat; Wettersperre; PSA-Kontrolle und
Unfallmeldung in der Monteur-App; Qualifikationen mit Ablaufdatum und
Warnung im Büro.

**Bewusst weggelassen:** SiKo je Auftrag, Gerüst-Freigabeprotokoll mit
Sperrfunktion, PSAgA-Geräteregister mit Prüffristen und Sturz-Sperre,
Sicherheits-Kurzgespräch mit Teilnehmerliste. Für einen Betrieb mit
Branchenlösung Gebäudehülle wären das die nächsten Bausteine.

## 4 Material und Lager: das Journal ist die Wahrheit

Die klarste Aussage der Recherche: **jede Mengenänderung ist eine Bewegung
mit Typ, nie ein direktes Überschreiben eines Bestands.** Der Bestand ist
das Ergebnis des Journals, nicht umgekehrt. Nur so lässt sich später
erklären, wohin das Material gegangen ist.

Weiter:

- **Mehrere Lagerorte als eigene Entität**: Zentrallager, ein Fahrzeuglager
  je Monteur, Baustellenlager. Ein einziger Gesamtbestand macht das
  Fahrzeug zur Blackbox.
- **Entnahme in unter zehn Sekunden**, sonst wird sie nicht gemacht.
- **Rückbuchung von Restmaterial** – ohne sie laufen die Bestände
  systematisch weg.
- **Kein Vollerfassungszwang.** Wer jede Schraube einzeln buchen lässt,
  bekommt gar keine Buchungen. Kleinmaterial läuft über einen Zuschlag.

**In DACHWERK umgesetzt:** Bewegungsjournal als einzige Quelle (die
Demobestände werden daraus zurückgerechnet), vier Lagerorte, Buchung mit
grossen Plus/Minus-Feldern, Barcode-Scan mit Rückfall auf manuelle
Eingabe, Umbuchung, Wareneingang, Mindestbestand mit Bestellvorschlag,
Kleinmaterialzuschlag in der Rechnung.

**Bewusst weggelassen:** Einheitenumrechnung (kg/m²/Rolle/Palette),
Reservation mit Rüstliste, Rückbuchung von Restmaterial, Werkzeug- und
Geräteverwaltung mit Ausleihe.

## 5 Abrechnung: hier entscheidet sich der Verkauf

Der Weg vom Rapport zur Rechnung ist das, was den Chef überzeugt: Der
Monteur tippt 4.5 Stunden und 12 m² Unterdachbahn, der Kunde
unterschreibt, und im Büro steht die Rechnung fertig da.

Die Recherche warnt vor drei Fehlern, die alle den QR-Code betreffen:

- **Falsche Kombination von IBAN und Referenztyp.** Eine QR-IBAN verlangt
  eine QR-Referenz (QRR), eine normale IBAN verlangt SCOR oder keine.
- **Prüfziffer nicht oder falsch implementiert.** Die QR-Referenz hat
  27 Stellen mit Modulo-10-rekursiver Prüfziffer.
- **Rechnungen bleiben lösch- und editierbar**, Nummern bekommen Lücken.

**In DACHWERK umgesetzt:** Der QR-Encoder ist von Hand gebaut
(ISO/IEC 18004, Byte-Modus, Versionen 1–25, Reed-Solomon, alle acht Masken
mit Strafbewertung). Geprüft wurde er mit einem eigens geschriebenen
Leser, der die erzeugte Matrix zurück in Text dekodiert: 295 Prüfungen,
63 von 63 Rundläufen verlustfrei, zusätzlich Modul für Modul verglichen
mit der Bibliothek `node-qrcode` (66 von 72 Fällen bit-identisch, keine
inhaltliche Abweichung) und gegen das **offizielle Musterbeispiel der
Swiss Implementation Guidelines** (Robert Schneider AG, CHF 3949.75) –
Zeichen für Zeichen identisch.

Ebenfalls umgesetzt: Ansätze nach Qualifikation, Regie und Pauschale,
Notfall- und Kleinmaterialzuschlag, Kundenrabatt, MWST 8.1 % mit
Rappenrundung, Teilzahlungen, Mahnstufen, Nachkalkulation mit
Deckungsbeitrag je Auftrag, Offertenkette bis zum Auftrag.

**Bewusst weggelassen:** Regie mit Kostendach, Positionsvarianten und
Optionen in der Offerte, Zahlungspläne und Akontorechnungen,
Fremdleistungen mit Aufschlag, Schnittstelle zur Buchhaltung, revisions-
sichere Nummernkreise ohne Lücken.

## 6 Zeiterfassung: der Tag, nicht der Auftrag

Die Recherche widerspricht dem naheliegenden Entwurf: **Eine reine
Auftrags-Stoppuhr genügt nicht.** Der Monteur vergisst den Stopp, die Uhr
läuft über Nacht, und am Monatsende stimmt nichts. Die Leitansicht muss
der **Tagesrapport** sein – mit Zeitartenkatalog (Arbeit, Fahrt,
Werkstatt, Schlechtwetter, Absenz), Pausen als eigener Eintrag ab
30 Minuten, getrennter Fahrzeit und einem Stundenkonto mit Saldo.

Und: **nachträgliche Korrekturen erlauben.** Wer sie verbietet, weil es
sauberer wirkt, erzieht die Monteure dazu, gar nichts mehr zu erfassen.

**In DACHWERK umgesetzt:** Zeitarten Arbeit/Fahrt/Pause/Werkstatt,
Wochenansicht für den Monteur, Wochenübersicht mit Soll/Ist und Saldo im
Büro, Freigabe durch den Vorgesetzten, Absenzen, Spesen mit Beleg.

**Bewusst weggelassen:** Arbeitszeitkalender nach GAV Gebäudehülle mit
Winterausfall, Ferienguthaben, Halbtage, Lohnarten. Der GAV Gebäudehülle
hat eigene Regeln zu Arbeitszeitkalender und Schlechtwetter – die gehören
vor einem produktiven Einsatz nachgelesen und abgebildet.

## 7 Bedienung auf dem Dach

Handschuhe, Nässe, Sonne, eine Hand am Seil. Daraus folgen konkrete Masse:
**Touchziele ab 56 Pixel, Aktionen ab 64 Pixel**, hoher Kontrast (ein
Sonnen-Modus hilft mehr als ein Dunkelmodus), immer genau ein nächster
Schritt, keine Tabellen.

Der schärfste Einwand der Recherche betrifft die Offline-Fähigkeit: **Sie
ist der Normalfall, nicht der Zusatz.** Ein Dachboden, ein Innenhof, ein
Untergeschoss – und das Netz ist weg. Nötig wären IndexedDB statt
`localStorage`, eine sichtbare Sendeschlange und feldweises Zusammenführen
statt Überschreiben des ganzen Bestands.

**In DACHWERK umgesetzt:** grosse Ziele, ein fester Aktionsknopf unten,
Schritt-für-Schritt-Führung, Fotos mit Verkleinerung und Zeitstempel,
Unterschrift auf dem Glas, Service Worker für den Offline-Betrieb,
Wetterampel, Navigation per Deep-Link zu Google oder Apple Karten.

**Nicht umgesetzt und ehrlich benannt:** Der Sync schreibt den ganzen
Bestand und kann bei gleichzeitiger Bearbeitung überschreiben. Es gibt
keine sichtbare Sendeschlange. Und bei vollem Browserspeicher weicht das
Bild – der Eintrag bleibt mit Vermerk erhalten, aber das Bild ist weg.
Für den Betrieb gehört das nach IndexedDB.

## 8 Büro-Dispo am PC

Drei Punkte, die ein Wochenbrett brauchbar machen:

- **Mehrtagesbaustellen als Balken**, nicht als Tageskarten. Dachdeckerei
  ist Kolonnenarbeit über mehrere Tage.
- **Konflikte beim Ablegen erkennen** – blockierend gegen warnend. Ein
  Board, das eine Person stillschweigend zweimal verplant, wird nicht
  benutzt.
- **Absenzen und Qualifikationen sind planungswirksam.** Wer nicht da ist
  oder den Nachweis nicht hat, darf nicht eingeteilt werden.

Und für den Baukasten: **nicht alle Punkte zu Pflichtfeldern machen.** Auf
dem Dach mit Handschuhen und Regen ist das der sicherste Weg, die App
loszuwerden.

**In DACHWERK umgesetzt:** Wochenbrett mit Ziehen und Ablegen,
Auslastungsbalken je Tag, Wetter je Tag mit Sperrhinweis, Pool der nicht
verplanten Aufträge, Zuweisung mit Anzeige der bereits verplanten Stunden,
Checklisten-Baukasten mit zwölf Feldtypen, Folgefragen, Fotopflicht je
Punkt und Mangelregeln, Kartenansicht mit Tagesroute.

**Bewusst weggelassen:** Mehrtagesbalken, Team- und Ressourcenzeilen,
Gerüst als eigener Zeitstrahl, blockierende Konflikterkennung,
Routenoptimierung, Absenzen im Board.

---

## 9 Die stärksten Momente für ein Verkaufsgespräch

Aus der Recherche, hier alle vorführbar:

1. **Der Nachtrag in 40 Sekunden.** Dach offen, Schalung verfault, Foto,
   drei Zeilen, ab ans Büro – Freigabe kommt zurück, bevor die Equipe
   weiterarbeitet.
2. **Die Kette in 90 Sekunden.** Rapport auf dem Handy, Unterschrift,
   und im Büro steht die Rechnung mit QR-Zahlteil.
3. **Den gedruckten Zahlteil mit dem eigenen Handy scannen.** Die
   Banking-App des Interessenten füllt Konto, Betrag und Referenz aus.
4. **Die Wartungswelle.** Fünf fällige Verträge, ein Klick, daraus werden
   Aufträge.
5. **Der Sturm-Moment.** Im Wochenbrett steht ein Tag mit rotem
   Windsymbol, und der Monteur bekommt auf dem Dach dieselbe Sperre.
6. **Die Objektakte aufziehen.** „Dieses Dach, 2019 umgedeckt, hier die
   Fotos von damals."

## 10 Was zuerst käme

Wäre der nächste Schritt zu bauen, in dieser Reihenfolge:

1. **Auftrag 1:n Einsatz** – ohne das lässt sich keine mehrtägige
   Baustelle abbilden.
2. **IndexedDB und Sendeschlange** – echte Offline-Fähigkeit statt
   Browserspeicher.
3. **Feldweiser Sync** statt Überschreiben des ganzen Bestands.
4. **Dachskizze als Positionsträger** – die Idee mit dem grössten
   Unterschied zum Wettbewerb.
5. **Rechtliche Prüfung** von Fristen, GAV und Sicherheitsvorgaben durch
   jemanden, der die Originaltexte kennt.
