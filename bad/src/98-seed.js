/* ==================================================================
   98 · BWSeed — Demodaten
   Stammdaten (Betrieb, Personen, Lieferanten, Artikel mit Stuecklisten,
   Partner, Kunden) und eine Geschichte: fuenf Auftraege in verschiedenen
   Zustaenden, erzeugt mit derselben Fachlogik wie im Betrieb, rueckdatiert
   ueber die Demo-Uhr. So stimmen Zeitleisten, Mails und Bestellungen
   zusammen, und der Zeitsprung in der Vorfuehrung loest die naechsten
   Stufen aus.
   ================================================================== */
const BWSeed = {
  VERSION: 3,

  build() {
    const db = {
      betrieb: {
        name: 'Badwelt Carlos GmbH', kuerzel: 'BC', strasse: 'Industriestrasse 14', plz: '8600', ort: 'Dübendorf',
        telefon: '044 820 14 14', email: 'info@badwelt-carlos.ch', web: 'badwelt-carlos.ch', uid: 'CHE-123.456.789 MWST',
        iban: 'CH4431999123000889012', bank: 'Zürcher Kantonalbank',
        mwst: 8.1, anzahlungProzent: 40, offerteGueltigTage: 30, zahlungsfristTage: 30, mahngebuehr1: 20, mahngebuehr2: 40, verzugszins: 5,
        farbe: '#0F7C8C', calendlyUrl: '', basisUrl: 'https://colinrenggli-sudo.github.io/WebAppKurzbefehl/bad/',
        oeffnungszeiten: 'Di–Fr 09:00–18:00, Sa 09:00–16:00',
        agb: 'Zahlung: 40 % Anzahlung bei Auftragserteilung (TWINT, Karte oder Apple Pay), 60 % Schlussrechnung nach Montage, zahlbar innert 30 Tagen netto per QR-Rechnung. Offerte 30 Tage gültig. Preise inkl. 8.1 % MWST. Garantie 2 Jahre auf Produkte ab Lieferung (OR 210); Montagegewährleistung gemäss ausführendem Partnerbetrieb (SIA 118). Sonderanfertigungen sind nicht stornierbar. Kein gesetzliches Widerrufsrecht bei Bestellung im Showroom. Bei Zahlungsverzug Verzugszins 5 % p. a., Mahngebühren CHF 20.– / CHF 40.–. Eigentumsvorbehalt bis zur vollständigen Bezahlung.',
        sync: { aktiv: false, projectId: 'dachapp2', apiKey: 'AIzaSyBZLXuq8ZyVBDFWLyH7l6IVx_BMR5ASwhM', raum: 'badwerk-demo', sammlung: 'dachwerk' }
      },
      uhr: { offsetTage: 0 },
      zaehler: { offerte: 411, auftrag: 134, rechnung: 260, kunde: 1040 },
      benutzer: [
        { id: 'b-carlos', code: '1234', name: 'Carlos Ferreira', kuerzel: 'CF', funktion: 'Inhaber', rolle: 'inhaber', farbe: '#0F7C8C', aktiv: true, email: 'carlos@badwelt-carlos.ch', start: 'uebersicht' },
        { id: 'b-nadine', code: '2468', name: 'Nadine Keller', kuerzel: 'NK', funktion: 'Beratung und Verkauf', rolle: 'verkauf', farbe: '#B45309', aktiv: true, email: 'nadine@badwelt-carlos.ch', start: 'showroom', rechte: ['offerte', 'kunden', 'showroom', 'termine'] },
        { id: 'b-marco', code: '98765', name: 'Marco Bianchi', kuerzel: 'MB', funktion: 'Lager', rolle: 'lager', farbe: '#6D28D9', aktiv: true }
      ],
      lieferanten: [
        { id: 'L-ST', kuerzel: 'ST', name: 'Sanitas Troesch AG', typ: 'grosshandel', ort: 'Zürich', kontakt: 'Reto Bühler', email: 'bestellungen@sanitastroesch.example', telefon: '044 446 17 17', fristen: { lager: 1, beschaffung: 7, manufaktur: 30 }, abFristTage: 1, otif: 97, ruegefristTage: 1, text: 'Grosshandel, Lagerware über Nacht (Bestellschluss 17:00)' },
        { id: 'L-KAL', kuerzel: 'KAL', name: 'Kaldewei Schweiz GmbH', typ: 'hersteller', ort: 'Aarau', kontakt: 'Sandra Vogt', email: 'order@kaldewei.example', telefon: '062 205 21 00', fristen: { lager: 3, beschaffung: 10, manufaktur: 30 }, abFristTage: 2, otif: 88, ruegefristTage: 8, text: 'Stahl-Email-Wannen; Sonderfarben 6 Wochen' },
        { id: 'L-TAL', kuerzel: 'TAL', name: 'talsee AG', typ: 'hersteller', ort: 'Hochdorf LU', kontakt: 'Martin Steiger', email: 'auftrag@talsee.example', telefon: '041 914 59 59', fristen: { lager: 5, beschaffung: 15, manufaktur: 20 }, abFristTage: 3, otif: 92, ruegefristTage: 8, text: 'Badmöbel-Manufaktur, keine Rücknahme' },
        { id: 'L-LAU', kuerzel: 'LAU', name: 'Laufen Bathrooms AG', typ: 'hersteller', ort: 'Laufen BL', kontakt: 'Claudia Meier', email: 'orders@laufen.example', telefon: '061 765 71 11', fristen: { lager: 2, beschaffung: 5, manufaktur: 35 }, abFristTage: 1, otif: 96, ruegefristTage: 8, text: 'Keramik' },
        { id: 'L-KWC', kuerzel: 'KWC', name: 'KWC Group AG', typ: 'hersteller', ort: 'Unterkulm', kontakt: 'Daniel Hug', email: 'bestellung@kwc.example', telefon: '062 768 68 68', fristen: { lager: 2, beschaffung: 4, manufaktur: 25 }, abFristTage: 1, otif: 95, ruegefristTage: 8, text: 'Armaturen, PVD-Oberflächen 4–6 Wochen' },
        { id: 'L-GEB', kuerzel: 'GEB', name: 'Geberit Vertriebs AG', typ: 'hersteller', ort: 'Rapperswil-Jona', kontakt: 'Simone Frei', email: 'auftrag@geberit.example', telefon: '055 221 61 11', fristen: { lager: 2, beschaffung: 7, manufaktur: 30 }, abFristTage: 1, otif: 98, ruegefristTage: 8, text: 'Installationssysteme, Dusch-WC' },
        { id: 'L-DUS', kuerzel: 'DUS', name: 'Duscholux AG', typ: 'hersteller', ort: 'Thun', kontakt: 'Peter Amstutz', email: 'order@duscholux.example', telefon: '033 334 41 11', fristen: { lager: 5, beschaffung: 10, manufaktur: 20 }, abFristTage: 3, otif: 90, ruegefristTage: 8, text: 'Duschabtrennungen nach Mass ab Aufmass' },
        { id: 'L-SCH', kuerzel: 'SCH', name: 'Wilhelm Schmidlin AG', typ: 'hersteller', ort: 'Oberarth SZ', kontakt: 'Andrea Schmidlin', email: 'verkauf@schmidlin.example', telefon: '041 859 00 60', fristen: { lager: 3, beschaffung: 8, manufaktur: 25 }, abFristTage: 2, otif: 94, ruegefristTage: 8, text: 'Stahl-Email-Wannen und Duschwannen, Schweizer Produktion' },
        { id: 'L-ZEH', kuerzel: 'ZEH', name: 'Zehnder Group Schweiz AG', typ: 'hersteller', ort: 'Gränichen', kontakt: 'Lukas Widmer', email: 'order@zehnder.example', telefon: '062 855 15 00', fristen: { lager: 3, beschaffung: 8, manufaktur: 20 }, abFristTage: 2, otif: 95, ruegefristTage: 8, text: 'Handtuchradiatoren' },
        { id: 'L-HAN', kuerzel: 'HAN', name: 'Hansgrohe AG', typ: 'hersteller', ort: 'Crissier', kontakt: 'Nicole Roth', email: 'orders@hansgrohe.example', telefon: '021 637 22 00', fristen: { lager: 2, beschaffung: 5, manufaktur: 25 }, abFristTage: 1, otif: 96, ruegefristTage: 8, text: 'Armaturen und Brausen' }
      ],
      artikel: [],
      partner: [
        { id: 'P-01', name: 'Sanitär Brunner AG', strasse: 'Ringstrasse 22', plz: '8600', ort: 'Dübendorf', kontakt: 'Reto Brunner', email: 'info@sanitaer-brunner.example', telefon: '044 821 55 10', modell: 'basis', aboChf: 0, provisionVermittlung: 6, provisionTipp: 5, token: 'PBRUNNER', monteure: ['Reto Brunner', 'Fabio Conti'], slots: { tage: [1, 2, 3, 4, 5], vormittag: '07:30', nachmittag: '13:00' }, belegt: [], aktiv: true, seit: '2025-03-01', text: 'Vier Monteure, Schwerpunkt Sanierungen' },
        { id: 'P-02', name: 'Keller Haustechnik GmbH', strasse: 'Zürichstrasse 101', plz: '8610', ort: 'Uster', kontakt: 'Jana Keller', email: 'kontakt@keller-haustechnik.example', telefon: '044 940 33 22', modell: 'plus', aboChf: 149, provisionVermittlung: 0, provisionTipp: 5, token: 'PKELLER', monteure: ['Jana Keller', 'Sven Bachmann'], slots: { tage: [1, 2, 3, 4, 5], vormittag: '07:30', nachmittag: '13:00' }, belegt: [], aktiv: true, seit: '2025-09-01', text: 'Partner Plus seit einem Jahr, bringt regelmässig Kunden in den Showroom' },
        { id: 'P-03', name: 'Aquatec Sanitär GmbH', strasse: 'Badenerstrasse 620', plz: '8048', ort: 'Zürich-Altstetten', kontakt: 'Luca Furrer', email: 'office@aquatec-sanitaer.example', telefon: '044 431 88 00', modell: 'basis', aboChf: 0, provisionVermittlung: 6, provisionTipp: 5, token: 'PAQUATEC', monteure: ['Luca Furrer', 'Milan Petrović'], slots: { tage: [1, 2, 3, 4, 5], vormittag: '07:30', nachmittag: '13:00' }, belegt: [], aktiv: true, seit: '2026-02-01', text: 'Neu im Netzwerk, Stadt Zürich' }
      ],
      kunden: [], objekte: [], offerten: [], auftraege: [], bestellungen: [], lagerpositionen: [], termine: [], rechnungen: [], post: [], showroomTermine: [], ereignisse: []
    };
    BWSeed.artikel(db);
    BWSeed.kunden(db);
    DB = db;                                   // Fachlogik und Postausgang arbeiten auf dem globalen Stand
    try { BWSeed.geschichte(db); } catch (e) { console.error('Demodaten-Geschichte fehlgeschlagen', e); }
    Uhr._seed = null; S.benutzerId = null;
    db.ereignisse.sort((a, b) => String(b.zeit).localeCompare(String(a.zeit)));
    db.post.sort((a, b) => String(b.zeit).localeCompare(String(a.zeit)));
    db.auftraege.forEach(a => (a.verlauf || []).sort((x, y) => String(y.zeit).localeCompare(String(x.zeit))));
    return db;
  },

  /* ------------------------------------------------------- Artikel */
  artikel(db) {
    const A = (o) => { db.artikel.push(Object.assign({ einheit: 'Stk', stornierbar: true, phase: 'fertig', garantie: '2 Jahre' }, o)); };
    // Installationsmaterial (Lagerware beim Grosshandel)
    const M = (id, name, vk, ek, extra) => A(Object.assign({ id, nr: id, name, kategorie: 'material', lieferantId: 'L-ST', lieferart: 'lager', vk, ek, icon: 'i-werkzeug' }, extra || {}));
    M('M-101', 'Wannenfüsse-Set inkl. Wannenanker', 65, 38, { phase: 'roh' });
    M('M-102', 'Ab- und Überlaufgarnitur Geberit mit Drehgriff', 145, 89, { phase: 'roh' });
    M('M-103', 'Schallschutz-Set Wanne', 48, 26, { phase: 'roh' });
    M('M-104', 'Wannenrandprofil und Dichtband', 38, 20);
    M('M-105', 'Sanitärsilikon, 2 Kartuschen', 24, 12);
    M('M-106', 'Revisionsöffnung 30×30 cm', 40, 22);
    M('M-201', 'Ablaufgarnitur Duschwanne 90 mm', 98, 55, { phase: 'roh' });
    M('M-202', 'Wannenfüsse Duschwanne', 55, 30, { phase: 'roh' });
    M('M-203', 'Dichtset Dusche', 42, 22);
    M('M-204', 'Abdichtungsset Duschrinne', 85, 48, { phase: 'roh' });
    M('M-301', 'Geberit Duofix Element Sigma 112 cm', 420, 250, { phase: 'roh', lieferantId: 'L-GEB', lieferart: 'lager' });
    M('M-302', 'Betätigungsplatte Sigma20 weiss/chrom', 95, 52, { lieferantId: 'L-GEB', lieferart: 'lager' });
    M('M-303', 'WC-Anschlussgarnitur', 38, 20);
    M('M-304', 'Schallschutz-Set WC', 22, 11);
    M('M-305', 'Befestigungsset WC', 18, 9);
    M('M-401', 'Siphon Design chrom', 65, 35);
    M('M-402', 'Eckventile, 2 Stück', 46, 24, { phase: 'roh' });
    M('M-403', 'Anschlussschläuche flexibel', 24, 12);
    M('M-404', 'Befestigungsset Waschtisch', 15, 8);
    M('M-501', 'Anschluss-Set Armatur (S-Anschlüsse, Rosetten)', 32, 16);
    M('M-601', 'Befestigungs- und Elektroanschluss-Set Spiegel', 28, 14);
    M('M-701', 'Radiator-Anschlussgarnitur Eck, chrom', 95, 52, { phase: 'roh' });
    M('M-901', 'Adapter-Set Anschlussmasse Altbau', 45, 20, { text: 'Für Anschlüsse vor 1990' });
    // Montage-Richtpreise (Block B, Werkvertrag mit Partnerbetrieb)
    const MO = (id, name, vk, tage, text) => A({ id, nr: id, name, kategorie: 'montage', vk, ek: 0, tage, text, lieferantId: null });
    MO('MO-01', 'Montage Badewanne (Demontage, Wannenträger, Anschluss, Abdichtung)', 1450, 2, 'Richtpreis Partnerbetrieb, 2 Tage');
    MO('MO-02', 'Montage Wand-WC mit Installationselement', 620, 0.5, 'Richtpreis Partnerbetrieb, ½ Tag');
    MO('MO-03', 'Montage Lavabo und Möbel', 480, 0.5, 'Richtpreis Partnerbetrieb, ½ Tag');
    MO('MO-04', 'Montage Dusche (Wanne, Ablauf, Abdichtung, Glaswand)', 1650, 2, 'Richtpreis Partnerbetrieb, 2 Tage');
    MO('MO-05', 'Montage Armatur', 180, 0.25, 'Richtpreis Partnerbetrieb');
    MO('MO-06', 'Montage Spiegelschrank inkl. Elektroanschluss', 220, 0.25, 'Richtpreis Partnerbetrieb');
    MO('MO-07', 'Montage Handtuchradiator', 380, 0.5, 'Richtpreis Partnerbetrieb');
    // Produkte
    const P = (o) => A(Object.assign({ lieferart: 'beschaffung' }, o));
    P({ id: 'A-1001', nr: 'KAL-2750', name: 'Kaldewei Cayono Badewanne 170×75 cm, Stahl-Email alpinweiss', kategorie: 'badewanne', lieferantId: 'L-KAL', lieferart: 'beschaffung', vk: 890, ek: 520, garantie: '30 Jahre auf Emaille', icon: 'i-badewanne', top: true, montageId: 'MO-01', text: 'Der Klassiker: pflegeleicht, kratzfest, 30 Jahre Garantie auf die Emaillierung.',
      stueckliste: [{ artikelId: 'M-101' }, { artikelId: 'M-102' }, { artikelId: 'M-103' }, { artikelId: 'M-104' }, { artikelId: 'M-105' }, { artikelId: 'M-106' }],
      optionen: [
        { id: 'sonderfarbe', name: 'Sonderfarbe Lavaschwarz matt', aufpreis: 480, ek: 290, lieferart: 'manufaktur', stornierbar: false, text: '6 Wochen, nicht stornierbar' },
        { id: 'whirl', name: 'Whirl-System Komfort (Luft und Wasser)', aufpreis: 3450, ek: 2100, lieferart: 'manufaktur', lieferfristTage: 40, stornierbar: false, text: 'Massage-Düsen, 8 Wochen, Elektroanschluss nötig', top: true },
        { id: 'antirutsch', name: 'Antirutsch-Beschichtung', aufpreis: 240, ek: 120, text: 'Sicherer Stand, werkseitig eingebrannt' },
        { id: 'griff', name: 'Wannengriff chrom', aufpreis: 120, ek: 55, text: 'Bequem und sicher ein- und aussteigen' },
        { id: 'einstieg', name: 'Wannen-Einstiegshilfe', aufpreis: 140, ek: 70, text: 'Für Kinder und ältere Menschen' }
      ] });
    P({ id: 'A-1002', nr: 'SCH-1880', name: 'Schmidlin Rondo Badewanne 180×80 cm, Stahl-Email', kategorie: 'badewanne', lieferantId: 'L-SCH', lieferart: 'beschaffung', vk: 1450, ek: 860, garantie: '30 Jahre auf Emaille', icon: 'i-badewanne', montageId: 'MO-01', text: 'Schweizer Produktion, tief und breit – zum Liegen gemacht.',
      stueckliste: [{ artikelId: 'M-101' }, { artikelId: 'M-102' }, { artikelId: 'M-103' }, { artikelId: 'M-104' }, { artikelId: 'M-105' }, { artikelId: 'M-106' }],
      optionen: [{ id: 'auflage', name: 'Wannenauflage Eiche massiv', aufpreis: 320, ek: 160, lieferart: 'manufaktur', text: 'Ablage für Buch und Glas' }, { id: 'antirutsch', name: 'Antirutsch-Beschichtung', aufpreis: 240, ek: 120 }, { id: 'griff', name: 'Wannengriff chrom', aufpreis: 120, ek: 55 }] });
    P({ id: 'A-1003', nr: 'KAL-2910', name: 'Kaldewei Classic Duo 180×80 cm, Stahl-Email', kategorie: 'badewanne', lieferantId: 'L-KAL', lieferart: 'beschaffung', vk: 1290, ek: 760, garantie: '30 Jahre auf Emaille', icon: 'i-badewanne', montageId: 'MO-01', text: 'Zwei Rückenschrägen – für zwei.',
      stueckliste: [{ artikelId: 'M-101' }, { artikelId: 'M-102' }, { artikelId: 'M-103' }, { artikelId: 'M-104' }, { artikelId: 'M-105' }, { artikelId: 'M-106' }],
      optionen: [{ id: 'whirl', name: 'Whirl-System Komfort', aufpreis: 3450, ek: 2100, lieferart: 'manufaktur', lieferfristTage: 40, stornierbar: false }, { id: 'griff', name: 'Wannengriff chrom', aufpreis: 120, ek: 55 }] });
    P({ id: 'A-2001', nr: 'KAL-3900', name: 'Kaldewei Superplan Duschwanne 90×90 cm, bodeneben', kategorie: 'dusche', lieferantId: 'L-KAL', lieferart: 'beschaffung', vk: 780, ek: 460, garantie: '30 Jahre auf Emaille', icon: 'i-dusche', montageId: 'MO-04', text: 'Bodeneben, rutschhemmend, pflegeleicht.',
      stueckliste: [{ artikelId: 'M-201' }, { artikelId: 'M-202' }, { artikelId: 'M-203' }, { artikelId: 'M-105' }],
      optionen: [{ id: 'antirutsch', name: 'Antirutsch-Oberfläche Secure Plus', aufpreis: 190, ek: 95 }] });
    P({ id: 'A-2002', nr: 'SCH-4120', name: 'Schmidlin Duschwanne Flat 120×90 cm, Stahl-Email', kategorie: 'dusche', lieferantId: 'L-SCH', lieferart: 'beschaffung', vk: 1150, ek: 690, garantie: '30 Jahre auf Emaille', icon: 'i-dusche', montageId: 'MO-04', text: 'Extraflach, Schweizer Qualität.',
      stueckliste: [{ artikelId: 'M-201' }, { artikelId: 'M-202' }, { artikelId: 'M-203' }, { artikelId: 'M-105' }],
      optionen: [{ id: 'sondermass', name: 'Sondermass nach Aufmass', aufpreis: 390, ek: 220, lieferart: 'manufaktur', stornierbar: false, text: '4–6 Wochen' }] });
    P({ id: 'A-2003', nr: 'DUS-8120', name: 'Duscholux Duschwand nach Mass, Klarglas 8 mm, 120×200 cm', kategorie: 'dusche', lieferantId: 'L-DUS', lieferart: 'manufaktur', vk: 2380, ek: 1420, stornierbar: false, icon: 'i-dusche', text: 'Nach Aufmass gefertigt, nicht stornierbar.',
      stueckliste: [{ artikelId: 'M-105' }],
      optionen: [{ id: 'antikalk', name: 'Anti-Kalk-Beschichtung Glas', aufpreis: 190, ek: 75, text: 'Weniger putzen, Glas bleibt klar', top: true }, { id: 'schwarz', name: 'Profile schwarz matt', aufpreis: 260, ek: 130 }] });
    P({ id: 'A-2004', nr: 'DUS-6120', name: 'Walk-in Duschwand 120 cm, Klarglas 8 mm', kategorie: 'dusche', lieferantId: 'L-DUS', lieferart: 'beschaffung', vk: 1380, ek: 820, icon: 'i-dusche', text: 'Standardmass, offen und grosszügig.',
      stueckliste: [{ artikelId: 'M-105' }],
      optionen: [{ id: 'antikalk', name: 'Anti-Kalk-Beschichtung Glas', aufpreis: 190, ek: 75, top: true }] });
    P({ id: 'A-2005', nr: 'GEB-1540', name: 'Geberit CleanLine Duschrinne 90 cm, Edelstahl', kategorie: 'dusche', lieferantId: 'L-GEB', lieferart: 'lager', vk: 640, ek: 380, icon: 'i-dusche', phase: 'roh', montageId: 'MO-04', text: 'Für bodenebene Duschen mit Plattenboden.',
      stueckliste: [{ artikelId: 'M-204' }] });
    P({ id: 'A-3001', nr: 'LAU-8209', name: 'Laufen Pro Wand-WC rimless inkl. Slim-Sitz Softclose', kategorie: 'wc', lieferantId: 'L-LAU', lieferart: 'beschaffung', vk: 690, ek: 390, icon: 'i-wc', top: true, montageId: 'MO-02', text: 'Spülrandlos, leise, leicht zu reinigen.',
      stueckliste: [{ artikelId: 'M-301' }, { artikelId: 'M-302' }, { artikelId: 'M-303' }, { artikelId: 'M-304' }, { artikelId: 'M-305' }],
      optionen: [{ id: 'sigma30', name: 'Betätigungsplatte Sigma30 statt Sigma20', aufpreis: 85, ek: 45 }, { id: 'lcc', name: 'Beschichtung Laufen Clean Coat', aufpreis: 90, ek: 40, text: 'Schmutz und Kalk haften weniger' }] });
    P({ id: 'A-3002', nr: 'GEB-AQ-MERA', name: 'Geberit AquaClean Mera Comfort Dusch-WC', kategorie: 'wc', lieferantId: 'L-GEB', lieferart: 'beschaffung', vk: 4590, ek: 3100, garantie: '2 Jahre, 10 Jahre Ersatzteile', icon: 'i-wc', top: true, montageId: 'MO-02', text: 'Warmwasser-Dusche, Warmluftföhn, Sitzheizung, Geruchsabsaugung. Der Bestseller.',
      stueckliste: [{ artikelId: 'M-301' }, { artikelId: 'M-302' }, { artikelId: 'M-303' }, { artikelId: 'M-304' }, { artikelId: 'M-305' }],
      optionen: [{ id: 'fernbed', name: 'Fernbedienung Wandhalterung', aufpreis: 120, ek: 60 }, { id: 'schwarz', name: 'Ausführung schwarz matt', aufpreis: 590, ek: 330, lieferart: 'manufaktur', stornierbar: false }] });
    P({ id: 'A-3003', nr: 'GEB-ICON', name: 'Geberit iCon Wand-WC rimfree inkl. Sitz', kategorie: 'wc', lieferantId: 'L-GEB', lieferart: 'beschaffung', vk: 620, ek: 360, icon: 'i-wc', montageId: 'MO-02', text: 'Kompakt, spülrandlos.',
      stueckliste: [{ artikelId: 'M-301' }, { artikelId: 'M-302' }, { artikelId: 'M-303' }, { artikelId: 'M-304' }, { artikelId: 'M-305' }],
      optionen: [{ id: 'absenk', name: 'Sitz mit Absenkautomatik', aufpreis: 120, ek: 55 }] });
    P({ id: 'A-4001', nr: 'LAU-PROS60', name: 'Laufen Pro S Waschtisch 60 cm', kategorie: 'lavabo', lieferantId: 'L-LAU', lieferart: 'beschaffung', vk: 420, ek: 240, icon: 'i-lavabo', montageId: 'MO-03', text: 'Schlicht, robust, für Wandmontage.',
      stueckliste: [{ artikelId: 'M-401' }, { artikelId: 'M-402' }, { artikelId: 'M-403' }, { artikelId: 'M-404' }, { artikelId: 'M-105' }],
      optionen: [{ id: 'lcc', name: 'Beschichtung Laufen Clean Coat', aufpreis: 60, ek: 25 }] });
    P({ id: 'A-4002', nr: 'TAL-LEVEL120', name: 'talsee Badmöbel Level 45, 120 cm, Eiche natur, mit Mineralguss-Waschtisch', kategorie: 'lavabo', lieferantId: 'L-TAL', lieferart: 'manufaktur', vk: 4250, ek: 2600, stornierbar: false, icon: 'i-moebel', top: true, montageId: 'MO-03', text: 'Schweizer Manufaktur, nach Mass, 4 Wochen. Nicht stornierbar.',
      stueckliste: [{ artikelId: 'M-401' }, { artikelId: 'M-402' }, { artikelId: 'M-403' }, { artikelId: 'M-404' }, { artikelId: 'M-105' }],
      optionen: [{ id: 'led', name: 'LED-Spiegelschrank-Upgrade', aufpreis: 480, ek: 260, top: true }, { id: 'griffe', name: 'Griffe schwarz matt', aufpreis: 90, ek: 40 }] });
    P({ id: 'A-4003', nr: 'TAL-LEVEL90', name: 'talsee Badmöbel Level 45, 90 cm, Eiche natur', kategorie: 'lavabo', lieferantId: 'L-TAL', lieferart: 'manufaktur', vk: 2480, ek: 1490, stornierbar: false, icon: 'i-moebel', montageId: 'MO-03', text: 'Nach Mass, 4 Wochen. Nicht stornierbar.',
      stueckliste: [{ artikelId: 'M-401' }, { artikelId: 'M-402' }, { artikelId: 'M-403' }, { artikelId: 'M-404' }, { artikelId: 'M-105' }],
      optionen: [{ id: 'led', name: 'LED-Spiegelschrank-Upgrade', aufpreis: 480, ek: 260 }] });
    P({ id: 'A-4004', nr: 'ST-DUR80', name: 'Duravit Waschtisch 80 cm mit Unterschrank weiss', kategorie: 'lavabo', lieferantId: 'L-ST', lieferart: 'beschaffung', vk: 1690, ek: 980, icon: 'i-moebel', montageId: 'MO-03', text: 'Ab Grosshandel, 1–2 Wochen.',
      stueckliste: [{ artikelId: 'M-401' }, { artikelId: 'M-402' }, { artikelId: 'M-403' }, { artikelId: 'M-404' }, { artikelId: 'M-105' }] });
    P({ id: 'A-5001', nr: 'KWC-AVA2-WT', name: 'KWC Ava 2.0 Waschtischmischer chrom', kategorie: 'armatur', lieferantId: 'L-KWC', lieferart: 'beschaffung', vk: 465, ek: 270, icon: 'i-armatur', top: true, montageId: 'MO-05', text: 'Schweizer Armatur, wassersparend.',
      stueckliste: [{ artikelId: 'M-501' }],
      optionen: [{ id: 'pvd', name: 'Oberfläche PVD Brushed Bronze', aufpreis: 380, ek: 200, lieferart: 'manufaktur', stornierbar: false, text: '4–6 Wochen' }] });
    P({ id: 'A-5002', nr: 'KWC-AVA2-DU', name: 'KWC Ava 2.0 Thermostat-Duschsystem mit Kopfbrause', kategorie: 'armatur', lieferantId: 'L-KWC', lieferart: 'beschaffung', vk: 1290, ek: 760, icon: 'i-armatur', montageId: 'MO-05', text: 'Konstante Temperatur, Verbrühschutz.',
      stueckliste: [{ artikelId: 'M-501' }],
      optionen: [{ id: 'regen', name: 'Regenbrause 300 mm', aufpreis: 480, ek: 260, top: true }] });
    P({ id: 'A-5003', nr: 'HAN-TALIS-E', name: 'Hansgrohe Talis E Waschtischmischer', kategorie: 'armatur', lieferantId: 'L-HAN', lieferart: 'beschaffung', vk: 390, ek: 230, icon: 'i-armatur', montageId: 'MO-05', text: 'Klar und schlank.',
      stueckliste: [{ artikelId: 'M-501' }] });
    P({ id: 'A-5004', nr: 'HAN-RAIN-S', name: 'Hansgrohe Raindance Select S Showerpipe', kategorie: 'armatur', lieferantId: 'L-HAN', lieferart: 'beschaffung', vk: 1190, ek: 700, icon: 'i-armatur', montageId: 'MO-05', text: 'Kopf- und Handbrause mit Thermostat.',
      stueckliste: [{ artikelId: 'M-501' }],
      optionen: [{ id: 'regen', name: 'Regenbrause 300 mm', aufpreis: 480, ek: 260 }] });
    P({ id: 'A-5005', nr: 'KWC-AVA-WA', name: 'KWC Ava Wannenmischer Aufputz mit Brauseset', kategorie: 'armatur', lieferantId: 'L-KWC', lieferart: 'beschaffung', vk: 520, ek: 300, icon: 'i-armatur', montageId: 'MO-05', text: 'Passend zur Badewanne.',
      stueckliste: [{ artikelId: 'M-501' }],
      optionen: [{ id: 'thermo', name: 'Thermostat statt Einhebelmischer', aufpreis: 260, ek: 140, text: 'Verbrühschutz für Kinder', top: true }] });
    P({ id: 'A-6001', nr: 'ST-LUMINA90', name: 'Spiegelschrank Keller Lumina 90 cm mit LED', kategorie: 'spiegel', lieferantId: 'L-ST', lieferart: 'beschaffung', vk: 1180, ek: 690, icon: 'i-spiegel', montageId: 'MO-06', text: 'Drei Türen, LED-Licht dimmbar.',
      stueckliste: [{ artikelId: 'M-601' }],
      optionen: [{ id: 'heiz', name: 'Steckdose und Heizfolie (beschlagfrei)', aufpreis: 240, ek: 120, top: true }] });
    P({ id: 'A-6002', nr: 'ST-LEDSP100', name: 'LED-Spiegel 100×70 cm mit Beschlagfrei-Heizung', kategorie: 'spiegel', lieferantId: 'L-ST', lieferart: 'beschaffung', vk: 690, ek: 380, icon: 'i-spiegel', montageId: 'MO-06', text: 'Indirektes Licht, Sensor-Schalter.',
      stueckliste: [{ artikelId: 'M-601' }] });
    P({ id: 'A-7001', nr: 'ZEH-ZENO-180', name: 'Zehnder Zeno Handtuchradiator 180×50 cm, weiss', kategorie: 'heizung', lieferantId: 'L-ZEH', lieferart: 'beschaffung', vk: 620, ek: 360, icon: 'i-radiator', montageId: 'MO-07', text: 'Warme Handtücher, warmes Bad.',
      stueckliste: [{ artikelId: 'M-701' }],
      optionen: [{ id: 'heizstab', name: 'Elektro-Heizstab für Sommerbetrieb', aufpreis: 190, ek: 95, top: true }, { id: 'farbe', name: 'Farbe anthrazit', aufpreis: 140, ek: 70, lieferart: 'manufaktur' }] });
    P({ id: 'A-8001', nr: 'ST-CHIC22', name: 'Bodenschatz Chic 22 Accessoire-Set (Handtuchhalter, Papierhalter, Haken)', kategorie: 'accessoire', lieferantId: 'L-ST', lieferart: 'lager', vk: 210, ek: 120, icon: 'i-stern', text: 'Passt zu jeder Armatur.' });
    P({ id: 'A-8002', nr: 'ST-DUSCHREG', name: 'Duschregal Edelstahl, 2 Ablagen', kategorie: 'accessoire', lieferantId: 'L-ST', lieferart: 'lager', vk: 140, ek: 75, icon: 'i-stern' });
    // Zusatzleistungen des Showrooms (hohe Marge)
    const Z = (id, name, vk, ek, extra) => A(Object.assign({ id, nr: id, name, kategorie: 'leistung', lieferantId: null, lieferart: null, vk, ek, icon: 'i-funken' }, extra || {}));
    Z('Z-01', 'Etagenlieferung ohne Lift (pro Stockwerk)', 90, 40, { einheit: 'Stockwerk', text: 'Zwei Mann tragen die Wanne hoch', proStockwerk: true });
    Z('Z-02', 'Demontage und Entsorgung Altmaterial', 180, 90, { text: 'Alte Wanne, WC oder Lavabo fachgerecht entsorgt' });
    Z('Z-04', 'Express-Beschaffung (Lieferfrist −30 %)', 250, 120, { text: 'Priorisierte Bestellung, Kurier ab Herstellerlager' });
    Z('Z-05', 'Garantieverlängerung auf 5 Jahre', 190, 40, { text: 'Auf alle Produkte dieses Auftrags', top: true });
    Z('Z-06', 'Anti-Kalk-Beschichtung Duschglas nachträglich', 190, 75, { text: 'Weniger putzen, Glas bleibt klar' });
    Z('Z-07', 'Wartungsabo Dusch-WC (jährlich)', 149, 60, { einheit: 'Jahr', text: 'Entkalkung, Filter, Funktionscheck – jedes Jahr', jaehrlich: true });
    Z('Z-08', '3D-Badplanung (bei Auftrag vollständig angerechnet)', 490, 200, { text: 'Fotorealistische Planung des ganzen Bades' });
    Z('Z-09', 'Fugen-Nachversiegelung nach 12 Monaten', 120, 60, { text: 'Silikonfugen prüfen und erneuern' });
    Z('Z-10', 'Lagerung im Showroom über 30 Tage', 45, 15, { einheit: 'Woche', text: 'Wenn die Baustelle noch nicht bereit ist' });
    // Pakete
    A({ id: 'PK-01', nr: 'PK-01', name: 'Komfort-Paket', kategorie: 'paket', vk: 420, ek: 175, lieferantId: null, lieferart: null, icon: 'i-stern', text: 'Garantieverlängerung 5 Jahre, Fugen-Nachversiegelung, Anti-Kalk-Beschichtung', enthaelt: ['Z-05', 'Z-06', 'Z-09'], einzelpreis: 500, top: true });
    A({ id: 'PK-02', nr: 'PK-02', name: 'Sorglos-Paket', kategorie: 'paket', vk: 450, ek: 250, lieferantId: null, lieferart: null, icon: 'i-stern', text: 'Demontage und Entsorgung, Express-Beschaffung, Lagerung bis 4 Wochen', enthaelt: ['Z-02', 'Z-04', 'Z-10'], einzelpreis: 520 });
  },

  /* ---------------------------------------------- Kunden und Objekte */
  kunden(db) {
    const K = (o, ob) => {
      const k = Object.assign({ id: uid('k'), nr: Dom.nrNeu(db, 'kunde'), anrede: '', vorname: '', name: '', firma: '', typ: 'privat', strasse: '', plz: '', ort: '', email: '', telefon: '', herkunft: 'showroom', partnerId: null, notiz: '', erstellt: D.jetztIso() }, o);
      db.kunden.push(k);
      const objekt = Object.assign({ id: uid('ob'), kundeId: k.id, bezeichnung: 'Bad', strasse: k.strasse, plz: k.plz, ort: k.ort, gebaeudetyp: 'efh', stockwerk: 0, lift: false, art: 'sanierung', baujahrVor1990: false, eigentum: 'eigentum', zugang: 'Parkplatz vor dem Haus', verwaltung: '', notiz: '' }, ob || {});
      db.objekte.push(objekt);
      k.objektId = objekt.id;
      return k;
    };
    Uhr._seed = -45;
    K({ id: 'K-LUETHI', anrede: 'Familie', vorname: 'Simon und Rahel', name: 'Lüthi', strasse: 'Im Wygarte 9', plz: '8604', ort: 'Volketswil', email: 'luethi@example.ch', telefon: '079 412 33 21', partnerId: 'P-01', herkunft: 'partner' }, { bezeichnung: 'Bad EG, Neubau', gebaeudetyp: 'efh', art: 'neubau', zugang: 'Baustelle, Parkplatz vorhanden, Schlüssel bei Bauleitung' });
    Uhr._seed = -40;
    K({ id: 'K-STEINER', anrede: 'Herr und Frau', vorname: 'Marc und Lena', name: 'Steiner', strasse: 'Bergstrasse 4', plz: '8307', ort: 'Effretikon', email: 'steiner.ml@example.ch', telefon: '076 233 90 11', partnerId: 'P-02', herkunft: 'partner' }, { bezeichnung: 'Gäste-WC', gebaeudetyp: 'efh', art: 'sanierung', baujahrVor1990: true, zugang: 'Reiheneinfamilienhaus, Parkplatz vor dem Haus' });
    Uhr._seed = -30;
    K({ id: 'K-ROSSI', anrede: 'Herr', vorname: 'Luca', name: 'Rossi', typ: 'stwe', strasse: 'Seefeldstrasse 3', plz: '8610', ort: 'Uster', email: 'luca.rossi@example.ch', telefon: '078 655 12 09', partnerId: 'P-02', herkunft: 'partner' }, { bezeichnung: 'Hauptbad 2. OG, Neubau', gebaeudetyp: 'stwe', stockwerk: 2, lift: true, art: 'neubau', zugang: 'Lift, Besucherparkplatz Nr. 7' });
    Uhr._seed = -9;
    K({ id: 'K-HUBER', anrede: 'Frau', vorname: 'Sandra', name: 'Huber', strasse: 'Badenerstrasse 512', plz: '8048', ort: 'Zürich', email: 'sandra.huber@example.ch', telefon: '079 771 45 02', herkunft: 'web' }, { bezeichnung: 'Bad 3. OG', gebaeudetyp: 'mfh', stockwerk: 3, lift: true, art: 'sanierung', baujahrVor1990: false, eigentum: 'miete', verwaltung: 'Immo Horizont AG', zugang: 'Lift, Halteverbot beantragen (blaue Zone)' });
    Uhr._seed = -8;
    K({ id: 'K-MEIER', anrede: 'Familie', vorname: 'Thomas und Petra', name: 'Meier', strasse: 'Rütistrasse 8', plz: '8304', ort: 'Wallisellen', email: 'meier.wallisellen@example.ch', telefon: '044 830 22 19', partnerId: 'P-01', herkunft: 'partner' }, { bezeichnung: 'Bad 1. OG', gebaeudetyp: 'efh', stockwerk: 1, lift: false, art: 'sanierung', baujahrVor1990: true, zugang: 'Parkplatz in der Einfahrt, Hund im Haus' });
    Uhr._seed = -3;
    K({ id: 'K-IMMO', anrede: '', vorname: 'Beat', name: 'Wettstein', firma: 'Immo-Treuhand AG', typ: 'geschaeft', strasse: 'Hardturmstrasse 120', plz: '8005', ort: 'Zürich', email: 'b.wettstein@immo-treuhand.example', telefon: '044 271 60 60', herkunft: 'empfehlung', notiz: 'Verwaltung, Rechnung an Firma, 30 Tage netto' }, { bezeichnung: 'Liegenschaft Grubenstrasse 14, drei Wohnungen', strasse: 'Grubenstrasse 14', plz: '8045', ort: 'Zürich', gebaeudetyp: 'mfh', stockwerk: 2, lift: true, art: 'sanierung', baujahrVor1990: true, eigentum: 'miete', verwaltung: 'Immo-Treuhand AG', zugang: 'Schlüssel bei Hauswart' });
    Uhr._seed = -20;
    K({ id: 'K-GERBER', anrede: 'Herr und Frau', vorname: 'Reto und Nina', name: 'Gerber', strasse: 'Zürcherstrasse 45', plz: '8953', ort: 'Dietikon', email: 'gerber.dietikon@example.ch', telefon: '076 402 18 55', partnerId: 'P-03', herkunft: 'partner' }, { bezeichnung: 'Gäste-WC EG', gebaeudetyp: 'efh', art: 'sanierung', baujahrVor1990: false, zugang: 'Parkplatz vor dem Haus, Klingel Gerber' });
    Uhr._seed = -1;
    K({ id: 'K-BOSSHARD', anrede: 'Herr', vorname: 'Daniel', name: 'Bosshard', strasse: 'Rütistrasse 7', plz: '5400', ort: 'Baden', email: 'd.bosshard@example.ch', telefon: '079 300 41 77', partnerId: 'P-01', herkunft: 'partner' }, { bezeichnung: 'Komplettbad, Neubau EFH', gebaeudetyp: 'efh', art: 'neubau', zugang: 'Baustelle, Einzug 15.11.2026' });
    Uhr._seed = -2;
    K({ id: 'K-BRUNNER', anrede: 'Frau', vorname: 'Andrea', name: 'Brunner', typ: 'stwe', strasse: 'Musterstrasse 8', plz: '8400', ort: 'Winterthur', email: 'andrea.brunner@example.ch', telefon: '079 511 20 84', partnerId: 'P-02', herkunft: 'partner', notiz: 'Beratungstermin heute 10:00 – kommt mit Jana Keller (Keller Haustechnik)' }, { bezeichnung: 'Bad 3. OG', gebaeudetyp: 'mfh', stockwerk: 3, lift: false, art: 'sanierung', baujahrVor1990: true, eigentum: 'eigentum', zugang: 'Kein Lift, Parkplatz blaue Zone' });
    Uhr._seed = null;
  },

  /* ------------------------------------------------------ Geschichte */
  geschichte(db) {
    const heute0 = D.iso(new Date());
    const tag = n => { Uhr._seed = n; };
    const wt = (n) => { // n Werktage relativ zu heute0 -> Kalender-Offset
      let d = heute0, i = 0, s = n < 0 ? -1 : 1;
      while (i < Math.abs(n)) { d = D.plus(d, s); if (!D.istWochenende(d)) i++; }
      return D.diffTage(heute0, d);
    };
    const offerte = (kId, beraterId, partnerId, produkte, leistungen, opt) => {
      const k = db.kunden.find(x => x.id === kId);
      const o = Dom.offerteNeu(db, { kundeId: k.id, objektId: k.objektId, beraterId, partnerId, herkunft: k.herkunft });
      produkte.forEach(p => { const pos = Dom.produktHinzufuegen(db, o, p.id, p.menge || 1); (p.optionen || []).forEach(oid => Dom.optionSetzen(db, o, pos.id, oid, true)); });
      (leistungen || []).forEach(l => Dom.leistungSetzen(db, o, l.id, true, l.menge || 1, l.grund || ''));
      if (opt && opt.anzahlungProzent != null) o.anzahlungProzent = opt.anzahlungProzent;
      o.schritt = 4;
      return o;
    };
    const bezahlt = (o, methode) => { S.benutzerId = o.beraterId; Dom.offerteSenden(db, o); Dom.unterschreiben(db, o, { name: Dom.kundeName(db.kunden.find(k => k.id === o.kundeId)), geraet: 'Tablet Showroom (iPad)' }); const a = Dom.anzahlungBezahlt(db, o, { methode }); a.token = 'K' + a.nr.slice(-4); S.benutzerId = null; return a; };
    const best = (a, lid) => db.bestellungen.find(b => b.auftragId === a.id && b.lieferantId === lid);
    const ab = (a, lid, tageAbPlan, bemerkung) => { const b = best(a, lid); if (b) Dom.abBestaetigen(db, b, { termin: tageAbPlan ? D.plus(b.planTermin, tageAbPlan) : b.planTermin, bemerkung }); };
    const avis = (a, lid, sendung) => { const b = best(a, lid); if (b) Dom.avisMelden(db, b, { sendung, datum: Dom.terminVon(b) }); };
    const scan = (a, lid, zustand, notiz) => { S.benutzerId = 'b-marco'; db.lagerpositionen.filter(l => l.auftragId === a.id && (!lid || l.bestellungId === (best(a, lid) || {}).id) && l.status === 'erwartet').forEach((lp, i) => { Dom.wareneingang(db, lp, { benutzerId: 'b-marco', zustand: (zustand && i === 0) ? zustand : 'ok', notiz: (zustand && i === 0) ? notiz : '' }); }); S.benutzerId = null; };
    const auto = () => Auto.regeln(db);
    // Feste Token, damit Portal-Links auf jedem Geraet mit denselben Demodaten funktionieren
    Dom.tokenHook = (art, o) => art === 'offerte' ? 'K' + o.nr.slice(-4) : art === 'bestellung' ? 'L' + o.nr.replace(/\D/g, '') : art === 'termin' ? 'M' + (o.auftragNr || '').slice(-4) : null;

    /* --- A-2026-0135 Steiner: Gaeste-WC, komplett durchgelaufen und archiviert --- */
    tag(-40); db.zaehler.auftrag = 134;
    let o = offerte('K-STEINER', 'b-nadine', 'P-02', [{ id: 'A-3003', optionen: ['absenk'] }, { id: 'A-4001' }, { id: 'A-5003' }], [{ id: 'Z-02', grund: 'Sanierung: Altmaterial fällt an' }, { id: 'M-901', grund: 'Baujahr vor 1990' }]);
    let a135 = bezahlt(o, 'twint');
    tag(-39); ab(a135, 'L-GEB'); ab(a135, 'L-ST'); ab(a135, 'L-LAU'); ab(a135, 'L-HAN');
    tag(-38); scan(a135, 'L-ST'); scan(a135, 'L-GEB');
    tag(-34); scan(a135, 'L-LAU'); scan(a135, 'L-HAN');
    tag(-33); Dom.terminSetzen(db, a135, { datum: D.plus(heute0, wt(-25) + 0), von: '07:30', bis: '12:00', partnerId: 'P-02', quelle: 'kunde-online' });
    tag(-32); Dom.terminBestaetigenPartner(db, db.termine.find(t => t.auftragId === a135.id), 'Sven Bachmann');
    tag(wt(-25)); Dom.fertigmelden(db, a135, { name: 'Lena Steiner', monteur: 'Sven Bachmann', notiz: 'Alles dicht, Kunde zufrieden' });
    tag(-19); Dom.rechnungBezahlt(db, db.rechnungen.find(r => r.auftragId === a135.id && r.art === 'schluss'), { methode: 'ueberweisung' });

    /* --- A-2026-0138 Luethi: Neubau, montiert, Rechnung ueberfaellig --- */
    tag(-45); db.zaehler.auftrag = 137;
    o = offerte('K-LUETHI', 'b-carlos', 'P-01', [{ id: 'A-2002' }, { id: 'A-2004', optionen: ['antikalk'] }, { id: 'A-5004', optionen: ['regen'] }, { id: 'A-4004' }, { id: 'A-5001' }, { id: 'A-6002' }], [{ id: 'Z-08', grund: 'Neubau' }, { id: 'PK-01' }]);
    let a138 = bezahlt(o, 'karte');
    tag(-44); ab(a138, 'L-ST'); ab(a138, 'L-SCH', 2, 'Produktion in KW 33'); ab(a138, 'L-DUS'); ab(a138, 'L-HAN'); ab(a138, 'L-KWC');
    tag(-43); scan(a138, 'L-ST');
    tag(-41); scan(a138, 'L-HAN'); scan(a138, 'L-KWC');
    tag(-36); avis(a138, 'L-SCH', 'DPD 0142 8837 2210'); scan(a138, 'L-DUS');
    tag(-34); scan(a138, 'L-SCH');
    tag(-33); Dom.terminSetzen(db, a138, { datum: D.plus(heute0, wt(-27)), von: '07:30', bis: '17:00', partnerId: 'P-01', quelle: 'telefon', notiz: 'Kunde hat angerufen, Bauleitung koordiniert' });
    tag(-32); Dom.terminBestaetigenPartner(db, db.termine.find(t => t.auftragId === a138.id), 'Fabio Conti');
    tag(wt(-24)); Dom.fertigmelden(db, a138, { name: 'Simon Lüthi', monteur: 'Fabio Conti', notiz: 'Duschwand nach Aufmass eingepasst' });
    db.rechnungen.filter(r => r.auftragId === a138.id && r.art === 'schluss').forEach(r => { r.faellig = D.plus(r.datum, 20); }); // Neubau: 20 Tage netto vereinbart

    /* --- A-2026-0139 Rossi: Komplettbad Neubau, alles eingetroffen, wartet auf Terminwahl --- */
    tag(-30); db.zaehler.auftrag = 138;
    o = offerte('K-ROSSI', 'b-nadine', 'P-02', [{ id: 'A-1003', optionen: ['griff'] }, { id: 'A-2001' }, { id: 'A-2003', optionen: ['antikalk'] }, { id: 'A-3002', optionen: ['fernbed'] }, { id: 'A-4002', optionen: ['led'] }, { id: 'A-5002', optionen: ['regen'] }, { id: 'A-5001' }, { id: 'A-5005', optionen: ['thermo'] }, { id: 'A-7001', optionen: ['heizstab'] }, { id: 'A-8001' }], [{ id: 'Z-08', grund: 'Neubau' }, { id: 'Z-07', grund: 'Dusch-WC' }, { id: 'PK-01' }], { anzahlungProzent: 30 });
    let a139 = bezahlt(o, 'karte');
    tag(-29); ab(a139, 'L-ST'); ab(a139, 'L-KAL'); ab(a139, 'L-GEB'); ab(a139, 'L-KWC'); ab(a139, 'L-ZEH');
    tag(-28); scan(a139, 'L-ST'); ab(a139, 'L-DUS', 0); ab(a139, 'L-TAL', -2, 'Standardkollektion ab Lager');
    tag(-25); scan(a139, 'L-KWC'); scan(a139, 'L-GEB');
    tag(-19); avis(a139, 'L-KAL', 'Planzer 77 120 336'); scan(a139, 'L-ZEH');
    tag(-16); scan(a139, 'L-KAL');
    tag(-6); avis(a139, 'L-TAL', 'Camion talsee Tour 3');
    tag(-4); scan(a139, 'L-DUS');
    tag(-3); scan(a139, 'L-TAL');

    /* --- A-2026-0140 Gerber: Gaeste-WC, alles eingetroffen, Termin gesetzt, Partner bestaetigt noch nicht --- */
    tag(-20); db.zaehler.auftrag = 139;
    o = offerte('K-GERBER', 'b-nadine', 'P-03', [{ id: 'A-3001', optionen: ['lcc'] }, { id: 'A-4001' }, { id: 'A-5001' }, { id: 'A-6002' }], [{ id: 'Z-02', grund: 'Sanierung: Altmaterial fällt an' }, { id: 'Z-05', grund: 'Beliebt bei Sanierungen' }]);
    let a140 = bezahlt(o, 'twint');
    tag(-19); ab(a140, 'L-ST'); ab(a140, 'L-GEB'); ab(a140, 'L-LAU'); ab(a140, 'L-KWC');
    tag(-18); scan(a140, 'L-ST'); scan(a140, 'L-GEB');
    tag(-13); scan(a140, 'L-LAU'); scan(a140, 'L-KWC');
    tag(-2); Dom.terminSetzen(db, a140, { datum: D.plus(heute0, wt(3)), von: '07:30', bis: '12:00', partnerId: 'P-03', quelle: 'kunde-online' });

    /* --- A-2026-0142 Meier: Sanierung, laeuft; Kaldewei als Problemlieferant, Zehnder ohne AB --- */
    tag(wt(-6)); db.zaehler.auftrag = 141;
    o = offerte('K-MEIER', 'b-nadine', 'P-01', [{ id: 'A-1001', optionen: ['antirutsch', 'griff'] }, { id: 'A-5005', optionen: ['thermo'] }, { id: 'A-4003', optionen: ['led'] }, { id: 'A-7001' }], [{ id: 'Z-01', menge: 1, grund: '1. OG ohne Lift' }, { id: 'Z-02', grund: 'Sanierung: Altmaterial fällt an' }, { id: 'M-901', grund: 'Baujahr vor 1990: Anschlussmasse prüfen' }, { id: 'Z-05', grund: 'Beliebt bei Sanierungen' }]);
    let a142 = bezahlt(o, 'twint');
    tag(wt(-5)); ab(a142, 'L-ST'); ab(a142, 'L-KWC'); ab(a142, 'L-KAL', 2, 'Cayono alpinweiss: Produktion KW 37, Lieferung 2 Werktage später als gewünscht');
    tag(wt(-4)); scan(a142, 'L-ST');
    tag(wt(-3)); ab(a142, 'L-TAL', 2, 'Individualmass Front, Fertigung nach Aufmass'); avis(a142, 'L-KWC', 'Post 98.34.212345.10001');
    tag(wt(-2)); scan(a142, 'L-KWC');

    /* --- A-2026-0143 Huber: Mietwohnung, Dusch-WC; Teillieferung mit Schaden --- */
    tag(-9); db.zaehler.auftrag = 142;
    o = offerte('K-HUBER', 'b-carlos', 'P-03', [{ id: 'A-3002', optionen: ['fernbed'] }, { id: 'A-5001' }], [{ id: 'Z-02', grund: 'Sanierung: Altmaterial fällt an' }, { id: 'Z-07', grund: 'Dusch-WC: jährlicher Service' }]);
    let a143 = bezahlt(o, 'twint');
    tag(-8); ab(a143, 'L-GEB'); ab(a143, 'L-ST'); ab(a143, 'L-KWC');
    tag(-7); scan(a143, 'L-ST');
    tag(-2); avis(a143, 'L-GEB', 'Planzer 77 120 981'); scan(a143, 'L-KWC');
    tag(-1);
    { S.benutzerId = 'b-marco'; const b = best(a143, 'L-GEB'); const lps = db.lagerpositionen.filter(l => l.bestellungId === b.id); lps.forEach(lp => { if (lp.artikelId === 'M-302') Dom.wareneingang(db, lp, { benutzerId: 'b-marco', zustand: 'beschaedigt', notiz: 'Betätigungsplatte: Glas gesprungen, Karton eingedrückt' }); else Dom.wareneingang(db, lp, { benutzerId: 'b-marco' }); }); S.benutzerId = null; }

    /* --- Offerten ohne Auftrag --- */
    tag(-3);
    o = offerte('K-IMMO', 'b-carlos', null, [{ id: 'A-4001', menge: 3 }, { id: 'A-5003', menge: 3 }], [{ id: 'Z-02', menge: 3, grund: 'Sanierung' }, { id: 'M-901', menge: 3, grund: 'Baujahr vor 1990' }], { anzahlungProzent: 0 });
    o.notiz = 'Drei Wohnungen, Rechnung an Immo-Treuhand AG, 30 Tage netto ohne Anzahlung (B2B).';
    S.benutzerId = 'b-carlos'; Dom.offerteSenden(db, o); S.benutzerId = null;
    tag(-1);
    o = offerte('K-BOSSHARD', 'b-nadine', 'P-01', [{ id: 'A-1002', optionen: ['auflage'] }, { id: 'A-2005' }, { id: 'A-2003' }, { id: 'A-3001' }, { id: 'A-4002' }, { id: 'A-5002' }, { id: 'A-5001' }, { id: 'A-6001', optionen: ['heiz'] }], [{ id: 'Z-08', grund: 'Neubau' }]);
    o.schritt = 3; o.notiz = 'Zweiter Termin am Samstag mit Frau Bosshard, Möbelfarbe noch offen.';

    /* --- Showroom-Termine --- */
    tag(-2);
    const sa = (() => { let d = heute0; while (D.parse(d).getDay() !== 6) d = D.plus(d, 1); return d; })();
    const di = (() => { let d = D.plus(heute0, 1); while (D.parse(d).getDay() !== 2) d = D.plus(d, 1); return d; })();
    const t1 = Dom.showroomTerminAnfragen(db, { datum: heute0, von: '10:00', kundeName: 'Andrea Brunner', kundeId: 'K-BRUNNER', partnerId: 'P-02', thema: 'Badewanne ersetzen, evtl. Möbel', beraterId: 'b-nadine' }); Dom.showroomTerminBestaetigen(db, t1);
    tag(-1);
    Dom.showroomTerminAnfragen(db, { datum: sa, von: '09:00', kundeName: 'Familie Odermatt', partnerId: 'P-01', hospitality: true, thema: 'Komplettbad Sanierung, Budget ca. CHF 25\'000' });
    const t3 = Dom.showroomTerminAnfragen(db, { datum: di, von: '14:00', kundeName: 'Herr Wyss', thema: 'Dusch-WC', beraterId: 'b-carlos' }); Dom.showroomTerminBestaetigen(db, t3);
    const t4 = Dom.showroomTerminAnfragen(db, { datum: sa, von: '11:00', kundeName: 'Daniel und Sonja Bosshard', kundeId: 'K-BOSSHARD', partnerId: 'P-01', hospitality: true, thema: 'Möbelfarbe, Offerte O-2026-0413 abschliessen', beraterId: 'b-nadine' }); Dom.showroomTerminBestaetigen(db, t4);

    /* --- Automationen Tag fuer Tag nachziehen (Mahnungen, Erinnerungen) --- */
    for (let d = -30; d <= 0; d++) { tag(d); auto(); }
    tag(null); Dom.tokenHook = null;
  }
};
