/* ==================================================================
   50 · Fachlogik
   Reine Funktionen auf dem Datenstand (db als Parameter), damit
   Oberflaeche, Automationen und Demodaten dieselbe Logik benutzen.
   Aufrufer wickeln sie in Store.aendern() ein.

   Lebenszyklus:
     Offerte   entwurf -> offen -> unterschrieben -> angezahlt (Auftrag)
                       -> abgelaufen / abgelehnt
     Auftrag   bestellt -> teilgeliefert -> bereit -> terminiert
               -> abgeschlossen -> verrechnet -> archiviert | storniert
     Bestellung gesendet -> bestaetigt -> avisiert -> geliefert
               (+ mahnstufe 0..3, teilgeliefert als Zwischenstand)
     Lagerposition erwartet -> eingetroffen | beschaedigt -> ausgeliefert
     Termin    vorgeschlagen -> bestaetigt -> erledigt | abgesagt
     Rechnung  anzahlung: bezahlt · schluss: gestellt -> erinnert
               -> mahnung1 -> mahnung2 -> bezahlt
   ================================================================== */
const Dom = {
  MWST: 8.1,
  /** Token fuer Portal-Links; die Demodaten haengen einen Haken ein, damit Links geraeteuebergreifend gleich sind. */
  tokenHook: null,
  tok(art, o) { return (Dom.tokenHook && Dom.tokenHook(art, o)) || token(); },

  /* ---------------------------------------------------------- Texte */
  STATUS: {
    entwurf: 'Entwurf', offen: 'Offen', unterschrieben: 'Unterschrieben', angezahlt: 'Angezahlt', abgelaufen: 'Abgelaufen', abgelehnt: 'Abgelehnt',
    bestellt: 'Bestellt', teilgeliefert: 'Teilweise geliefert', bereit: 'Montagebereit', terminiert: 'Termin bestätigt',
    abgeschlossen: 'Montiert', verrechnet: 'Verrechnet', archiviert: 'Archiviert', storniert: 'Storniert',
    gesendet: 'Gesendet', bestaetigt: 'Bestätigt', avisiert: 'Avisiert', geliefert: 'Geliefert',
    erwartet: 'Erwartet', eingetroffen: 'Eingetroffen', beschaedigt: 'Beschädigt', ausgeliefert: 'Ausgeliefert',
    vorgeschlagen: 'Vorgeschlagen', erledigt: 'Erledigt', abgesagt: 'Abgesagt',
    gestellt: 'Offen', erinnert: 'Erinnert', mahnung1: '1. Mahnung', mahnung2: '2. Mahnung', bezahlt: 'Bezahlt',
    angefragt: 'Angefragt'
  },
  statusText(s) { return Dom.STATUS[s] || s; },
  KATEGORIEN: [
    { k: 'badewanne', t: 'Badewannen', i: 'i-badewanne' }, { k: 'dusche', t: 'Duschen', i: 'i-dusche' }, { k: 'wc', t: 'WC und Dusch-WC', i: 'i-wc' },
    { k: 'lavabo', t: 'Lavabo und Möbel', i: 'i-lavabo' }, { k: 'armatur', t: 'Armaturen', i: 'i-armatur' }, { k: 'spiegel', t: 'Spiegel und Licht', i: 'i-spiegel' },
    { k: 'heizung', t: 'Heizung', i: 'i-radiator' }, { k: 'accessoire', t: 'Accessoires', i: 'i-stern' }
  ],
  kategorieText(k) { const c = Dom.KATEGORIEN.find(x => x.k === k); return c ? c.t : ({ material: 'Installationsmaterial', leistung: 'Zusatzleistung', paket: 'Paket', montage: 'Montage' })[k] || k; },
  LIEFERART: { lager: 'Lagerware', beschaffung: 'Beschaffung', manufaktur: 'Manufaktur / Sondermass' },
  GEBAEUDE: { efh: 'Einfamilienhaus', mfh: 'Wohnung im Mehrfamilienhaus', stwe: 'Stockwerkeigentum', gewerbe: 'Gewerbe' },
  AUFTRAG_FLUSS: ['bestellt', 'teilgeliefert', 'bereit', 'terminiert', 'abgeschlossen', 'verrechnet', 'archiviert'],

  /* --------------------------------------------------------- Zahlen */
  netto(brutto) { return Math.round(brutto / (1 + Dom.MWST / 100) * 100) / 100; },
  mwstAnteil(brutto) { return Math.round((brutto - Dom.netto(brutto)) * 100) / 100; },
  nrNeu(db, art) {
    db.zaehler = db.zaehler || {};
    const jahr = D.heute().slice(0, 4);
    db.zaehler[art] = (db.zaehler[art] || 0) + 1;
    const n = String(db.zaehler[art]).padStart(4, '0');
    return ({ offerte: 'O-', auftrag: 'A-', rechnung: 'R-', kunde: 'K-' })[art] + jahr + '-' + n;
  },

  /* ---------------------------------------------- Lieferfrist je Zeile */
  lieferfrist(db, pos) {
    if (pos.lieferfristTage != null) return pos.lieferfristTage;
    const l = db.lieferanten.find(x => x.id === pos.lieferantId);
    if (!l) return 0;
    return (l.fristen && l.fristen[pos.lieferart || 'beschaffung']) || 5;
  },
  /** Laengste Frist im Auftrag – bestimmt den fruehesten Montagetermin. */
  kritischerPfad(db, positionen) {
    let best = null;
    positionen.filter(p => p.lieferantId).forEach(p => {
      const t = Dom.lieferfrist(db, p);
      if (!best || t > best.tage) best = { tage: t, posId: p.id, name: p.name, lieferantId: p.lieferantId };
    });
    return best;
  },

  /* ------------------------------------------------------ Positionen */
  posAusArtikel(a, menge, extra) {
    return Object.assign({
      id: uid('p'), art: a.kategorie === 'material' ? 'material' : a.kategorie === 'leistung' ? 'leistung' : a.kategorie === 'paket' ? 'paket' : 'produkt',
      artikelId: a.id, name: a.name, menge: menge || 1, einheit: a.einheit || 'Stk',
      vk: a.vk, ek: a.ek || 0, lieferantId: a.lieferantId || null, lieferart: a.lieferart || null,
      lieferfristTage: a.lieferfristTage != null ? a.lieferfristTage : null,
      stornierbar: a.stornierbar !== false, phase: a.phase || 'fertig', elternId: null, auto: false, vorschlag: false, grund: ''
    }, extra || {});
  },

  /** Produkt samt Installationsmaterial (Stueckliste) in die Offerte. */
  produktHinzufuegen(db, o, artikelId, menge) {
    const a = db.artikel.find(x => x.id === artikelId); if (!a) return null;
    const p = Dom.posAusArtikel(a, menge || 1);
    o.positionen.push(p);
    (a.stueckliste || []).forEach(s => {
      const m = db.artikel.find(x => x.id === s.artikelId); if (!m) return;
      o.positionen.push(Dom.posAusArtikel(m, (s.menge || 1) * p.menge, { art: 'material', elternId: p.id, auto: true, grund: 'immer benötigt' }));
    });
    // Montage-Richtpreis merken (Block B)
    if (a.montageId && !o.montage.some(m => m.artikelId === a.montageId)) {
      const mo = db.artikel.find(x => x.id === a.montageId);
      if (mo) o.montage.push({ artikelId: mo.id, name: mo.name, vk: mo.vk, tage: mo.tage || 1 });
    }
    return p;
  },

  produktEntfernen(o, posId) {
    const p = o.positionen.find(x => x.id === posId); if (!p) return;
    o.positionen = o.positionen.filter(x => x.id !== posId && x.elternId !== posId);
  },

  mengeSetzen(o, posId, menge) {
    const p = o.positionen.find(x => x.id === posId); if (!p) return;
    const f = p.menge ? menge / p.menge : 1;
    p.menge = menge;
    if (p.art === 'produkt') o.positionen.filter(x => x.elternId === posId && x.art === 'material' && x.auto).forEach(x => { x.menge = Math.max(1, Math.round(x.menge * f)); });
  },

  /** Option an einem Produkt setzen oder entfernen. */
  optionSetzen(db, o, produktPosId, optionId, an) {
    const p = o.positionen.find(x => x.id === produktPosId); if (!p) return;
    const a = db.artikel.find(x => x.id === p.artikelId);
    const opt = ((a && a.optionen) || []).find(x => x.id === optionId); if (!opt) return;
    const vorhanden = o.positionen.find(x => x.elternId === produktPosId && x.optionId === optionId);
    if (an && !vorhanden) {
      o.positionen.push({
        id: uid('p'), art: 'option', artikelId: a.id, optionId: opt.id, elternId: p.id, name: opt.name, menge: p.menge, einheit: 'Stk',
        vk: opt.aufpreis, ek: opt.ek || Math.round(opt.aufpreis * 0.55), lieferantId: opt.lieferantId || a.lieferantId || null,
        lieferart: opt.lieferart || a.lieferart, lieferfristTage: opt.lieferfristTage != null ? opt.lieferfristTage : null,
        stornierbar: opt.stornierbar !== false, phase: a.phase || 'fertig', auto: false, vorschlag: false, grund: opt.text || ''
      });
    } else if (!an && vorhanden) o.positionen = o.positionen.filter(x => x !== vorhanden);
  },

  /** Zusatzleistung oder Paket setzen/entfernen (menge fuer 'pro Stockwerk'). */
  leistungSetzen(db, o, artikelId, an, menge, grund) {
    const a = db.artikel.find(x => x.id === artikelId); if (!a) return;
    const vorhanden = o.positionen.find(x => x.artikelId === artikelId && (x.art === 'leistung' || x.art === 'paket'));
    if (an && !vorhanden) o.positionen.push(Dom.posAusArtikel(a, menge || 1, { vorschlag: !!grund, grund: grund || '' }));
    else if (an && vorhanden) { vorhanden.menge = menge || vorhanden.menge; }
    else if (!an && vorhanden) o.positionen = o.positionen.filter(x => x !== vorhanden);
  },

  /** Vorschlaege aus dem Objektkontext – nie stillschweigend buchen. */
  vorschlaege(db, o) {
    const ob = db.objekte.find(x => x.id === o.objektId); if (!ob) return [];
    const v = [];
    const hatProdukt = k => o.positionen.some(p => p.art === 'produkt' && (db.artikel.find(a => a.id === p.artikelId) || {}).kategorie === k);
    if (!ob.lift && (ob.stockwerk || 0) >= 1) v.push({ artikelId: 'Z-01', menge: ob.stockwerk, grund: (ob.stockwerk) + '. OG ohne Lift' });
    if (ob.art === 'sanierung') v.push({ artikelId: 'Z-02', menge: 1, grund: 'Sanierung: Altmaterial fällt an' });
    if (ob.baujahrVor1990) v.push({ artikelId: 'M-901', menge: 1, grund: 'Baujahr vor 1990: Anschlussmasse prüfen' });
    if (hatProdukt('dusche')) v.push({ artikelId: 'Z-06', menge: 1, grund: 'Duschglas bleibt länger klar' });
    if (o.positionen.some(p => p.artikelId === 'A-3002')) v.push({ artikelId: 'Z-07', menge: 1, grund: 'Dusch-WC: jährlicher Service' });
    if (o.positionen.some(p => p.art === 'produkt')) v.push({ artikelId: 'Z-05', menge: 1, grund: 'Beliebt bei Sanierungen' });
    if (ob.art === 'neubau') v.push({ artikelId: 'Z-08', menge: 1, grund: 'Neubau: Planung wird bei Auftrag angerechnet' });
    return v.filter(x => db.artikel.some(a => a.id === x.artikelId));
  },
  vorschlagAnwenden(db, o, v) { Dom.leistungSetzen(db, o, v.artikelId, true, v.menge, v.grund); },

  /* ------------------------------------------------------- Summen */
  summe(o) {
    const pos = o.positionen || [];
    const zeile = p => Math.round(p.menge * p.vk * 100) / 100;
    const bloecke = { produkte: 0, material: 0, optionen: 0, leistungen: 0 };
    pos.forEach(p => {
      const z = zeile(p);
      if (p.art === 'produkt') bloecke.produkte += z; else if (p.art === 'material') bloecke.material += z;
      else if (p.art === 'option') bloecke.optionen += z; else bloecke.leistungen += z;
    });
    const brutto = Math.round(sum(Object.values(bloecke)) * 100) / 100;
    const rabatt = o.rabattProzent ? Math.round(brutto * o.rabattProzent) / 100 : 0;
    const total = Fmt.rappen(brutto - rabatt);
    const netto = Dom.netto(total), mwst = Math.round((total - netto) * 100) / 100;
    const ekTotal = sum(pos, p => p.menge * (p.ek || 0));
    const marge = Math.round((netto - ekTotal) * 100) / 100;
    const pct = o.anzahlungProzent != null ? o.anzahlungProzent : 40;
    const anzahlung = Fmt.rappen(total * pct / 100);
    const montage = sum(o.montage || [], m => m.vk);
    return { bloecke, brutto, rabatt, total, netto, mwst, marge, margeProzent: netto ? Math.round(marge / netto * 1000) / 10 : 0, anzahlung, anzahlungProzent: pct, rest: Fmt.rappen(total - anzahlung), montage, upsell: bloecke.optionen + bloecke.leistungen };
  },

  /* ------------------------------------------------- Offerte anlegen */
  offerteNeu(db, o) {
    const b = db.betrieb;
    const of = {
      id: uid('o'), nr: Dom.nrNeu(db, 'offerte'), kundeId: o.kundeId || null, objektId: o.objektId || null,
      beraterId: o.beraterId || null, partnerId: o.partnerId || null, herkunft: o.herkunft || 'showroom',
      status: 'entwurf', datum: D.heute(), gueltigBis: D.plus(D.heute(), b.offerteGueltigTage || 30), token: null,
      schritt: 1, positionen: [], montage: [], anzahlungProzent: b.anzahlungProzent || 40, rabattProzent: 0,
      unterschrift: null, zahlung: null, notiz: '', auftragId: null, erstellt: D.jetztIso()
    };
    of.token = Dom.tok('offerte', of);
    db.offerten.unshift(of);
    return of;
  },

  offerteSenden(db, o) {
    o.status = 'offen';
    const k = db.kunden.find(x => x.id === o.kundeId);
    const s = Dom.summe(o);
    Mail.anlegen(db, {
      an: k && k.email, anName: Dom.kundeName(k), art: 'kunde-offerte', auftragId: null, offerteId: o.id,
      betreff: 'Ihre Offerte ' + o.nr + ' von ' + db.betrieb.name,
      text: Mail.brief(anrede(k), [
        'vielen Dank für Ihren Besuch in unserem Showroom. Anbei erhalten Sie Ihre Offerte ' + o.nr + ' über ' + Fmt.chf(s.total) + ' (inkl. ' + Fmt.prozent(Dom.MWST) + ' MWST).',
        'Sie können die Offerte online ansehen, unterschreiben und die Anzahlung von ' + Fmt.chf(s.anzahlung) + ' bequem per TWINT oder Karte begleichen:\n' + Mail.link('k', o.token),
        'Die Offerte ist bis am ' + Fmt.datum(o.gueltigBis) + ' gültig. Bei Fragen sind wir gerne für Sie da.'
      ])
    });
    Store.log('offerte', 'Offerte ' + o.nr + ' an ' + Dom.kundeName(k) + ' gesendet', null, '📄');
  },

  unterschreiben(db, o, u) {
    o.status = 'unterschrieben';
    o.unterschrift = { name: u.name, dataUrl: u.dataUrl || '', zeit: D.jetztIso(), geraet: u.geraet || 'Tablet Showroom', hash: Dom.hash(JSON.stringify(o.positionen) + o.nr + Dom.summe(o).total) };
    Store.log('offerte', 'Offerte ' + o.nr + ' unterschrieben von ' + u.name, null, '✍️');
  },

  /** Einfacher Dokument-Hash (kein SHA-256, aber reproduzierbar) fuer den Audit-Trail. */
  hash(s) { let h1 = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h1 ^= s.charCodeAt(i); h1 = Math.imul(h1, 0x01000193) >>> 0; } return ('0000000' + h1.toString(16)).slice(-8) + '-' + ('0000000' + (Math.imul(h1, 2654435761) >>> 0).toString(16)).slice(-8); },

  gebuehr(methode, betrag) {
    if (methode === 'twint') return Math.round((betrag * 0.019 + 0.3) * 100) / 100;
    if (methode === 'karte' || methode === 'applepay') return Math.round((betrag * 0.029 + 0.3) * 100) / 100;
    return 0;
  },

  /** Anzahlung eingegangen: daraus entsteht der Auftrag mit allem, was dazugehoert. */
  anzahlungBezahlt(db, o, z) {
    const s = Dom.summe(o);
    const betrag = z.betrag != null ? z.betrag : s.anzahlung;
    o.status = 'angezahlt';
    o.zahlung = { methode: z.methode || 'twint', betrag, zeit: D.jetztIso(), referenz: z.referenz || ('pi_demo_' + token().toLowerCase()), gebuehr: Dom.gebuehr(z.methode, betrag) };
    const a = Dom.auftragAusOfferte(db, o);
    // Anzahlungsbeleg
    const r = {
      id: uid('r'), nr: Dom.nrNeu(db, 'rechnung'), auftragId: a.id, kundeId: o.kundeId, art: 'anzahlung', datum: D.heute(), faellig: D.heute(),
      betrag, status: 'bezahlt', bezahltAm: D.jetztIso(), methode: o.zahlung.methode, referenz: o.zahlung.referenz, gebuehr: o.zahlung.gebuehr, mahnungen: [], leistungsdatum: D.heute()
    };
    db.rechnungen.unshift(r);
    a.anzahlung = { betrag, methode: o.zahlung.methode, zeit: o.zahlung.zeit, rechnungId: r.id };
    Store.log('zahlung', 'Anzahlung ' + Fmt.chf(betrag) + ' per ' + Dom.methodeText(o.zahlung.methode) + ' eingegangen', a.id, '💳');
    return a;
  },
  methodeText(m) { return ({ twint: 'TWINT', karte: 'Kreditkarte', applepay: 'Apple Pay', ueberweisung: 'Überweisung', bar: 'Bar' })[m] || m; },

  /* ------------------------------------------------- Auftrag anlegen */
  auftragAusOfferte(db, o) {
    const k = db.kunden.find(x => x.id === o.kundeId);
    const ob = db.objekte.find(x => x.id === o.objektId);
    const s = Dom.summe(o);
    const kp = Dom.kritischerPfad(db, o.positionen);
    const a = {
      id: uid('a'), nr: Dom.nrNeu(db, 'auftrag'), offerteId: o.id, kundeId: o.kundeId, objektId: o.objektId, partnerId: o.partnerId || null,
      beraterId: o.beraterId || null, status: 'bestellt', erstellt: D.jetztIso(), total: s.total, anzahlung: null,
      positionen: o.positionen.map(p => Object.assign({}, p)), montage: (o.montage || []).map(m => Object.assign({}, m)),
      montageTage: Math.max(1, Math.round(sum(o.montage || [], m => m.tage) || 1)),
      freigabeVerwaltung: ob && ob.eigentum === 'miete' ? 'ausstehend' : null,
      kritischerPfad: kp ? { tage: kp.tage, name: kp.name, lieferantId: kp.lieferantId } : null,
      fruehesterMontage: kp ? D.plusWerktage(D.heute(), kp.tage + 3) : D.plusWerktage(D.heute(), 3),
      verlauf: [], terminId: null, rechnungId: null, abnahme: null, archiviertAm: null, montagebereitAm: null, token: o.token, notizen: ''
    };
    o.auftragId = a.id;
    db.auftraege.unshift(a);
    Store.log('auftrag', 'Auftrag ' + a.nr + ' aus Offerte ' + o.nr + ' angelegt (' + Fmt.chf(s.total) + ')', a.id, '🧾');
    Dom.bestellungenErzeugen(db, a);
    // Auftragsbestaetigung an den Kunden
    Mail.anlegen(db, {
      an: k && k.email, anName: Dom.kundeName(k), art: 'kunde-bestaetigung', auftragId: a.id, automatisch: true,
      betreff: 'Auftragsbestätigung ' + a.nr + ' – vielen Dank',
      text: Mail.brief(anrede(k), [
        'herzlichen Dank für Ihren Auftrag. Ihre Anzahlung von ' + Fmt.chf(s.anzahlung) + ' ist eingegangen; den Beleg finden Sie im Anhang.',
        'Wir haben Ihre Produkte bei ' + db.bestellungen.filter(b => b.auftragId === a.id).length + ' Lieferanten bestellt. Sobald alles bei uns eingetroffen ist, erhalten Sie einen Link, um Ihren Montagetermin zu wählen. Voraussichtlich ist das ab dem ' + Fmt.datum(a.fruehesterMontage) + ' möglich.',
        'Den aktuellen Stand sehen Sie jederzeit hier: ' + Mail.link('k', o.token),
        'Die Montage führt unser Partnerbetrieb' + (a.partnerId ? ' ' + (db.partner.find(p => p.id === a.partnerId) || {}).name : '') + ' aus (Werkvertrag mit dem Betrieb, separate Rechnung). Produkte: 2 Jahre Garantie ab Lieferung.'
      ]),
      anhaenge: ['Offerte ' + o.nr + ' (unterschrieben).pdf', 'Anzahlungsbeleg.pdf']
    });
    if (a.freigabeVerwaltung) Store.log('hinweis', 'Mietwohnung: Freigabe der Verwaltung ' + ((ob && ob.verwaltung) || '') + ' ausstehend', a.id, '🏢');
    return a;
  },

  /** Bestellungen je Lieferant, Lagerposition je Bestellzeile, Bestellmail mit Portal-Link. */
  bestellungenErzeugen(db, a) {
    const gruppen = grp(a.positionen.filter(p => p.lieferantId), p => p.lieferantId);
    let i = 0;
    Object.keys(gruppen).forEach(lid => {
      i++;
      const l = db.lieferanten.find(x => x.id === lid);
      const zeilen = gruppen[lid];
      const frist = Math.max(...zeilen.map(p => Dom.lieferfrist(db, p)));
      const b = {
        id: uid('b'), nr: 'B-' + a.nr.slice(-4) + '-' + String(i).padStart(2, '0'), auftragId: a.id, lieferantId: lid, token: null,
        status: 'gesendet', gesendet: D.jetztIso(), planTermin: D.plusWerktage(D.heute(), frist), abTermin: null, abEingang: null, avis: null,
        positionen: [], mahnstufe: 0, mahnungen: [], abErinnertAm: null, geliefertAm: null, verzugTage: 0, pausiertBis: null, bemerkung: ''
      };
      b.token = Dom.tok('bestellung', b);
      zeilen.forEach((p, j) => {
        const lp = {
          id: uid('lp'), code: a.nr.replace('A-', 'A') + '-' + String(i).padStart(2, '0') + '-' + String(j + 1).padStart(2, '0'),
          auftragId: a.id, bestellungId: b.id, posId: p.id, artikelId: p.artikelId, name: p.name, menge: p.menge, status: 'erwartet',
          lagerplatz: null, gescanntAm: null, gescanntVon: null, foto: null, notiz: ''
        };
        db.lagerpositionen.push(lp);
        b.positionen.push({ posId: p.id, artikelId: p.artikelId, name: p.name, menge: p.menge, offen: p.menge, lagerpositionId: lp.id, stornierbar: p.stornierbar });
        p.bestellungId = b.id; p.lagerpositionId = lp.id;
      });
      db.bestellungen.unshift(b);
      const k = db.kunden.find(x => x.id === a.kundeId);
      Mail.anlegen(db, {
        an: l && l.email, anName: l && l.name, art: 'bestellung', auftragId: a.id, bestellungId: b.id, automatisch: true,
        betreff: 'Bestellung ' + b.nr + ' · Kommission ' + a.nr + ' ' + (k ? k.name : ''),
        text: Mail.brief('Guten Tag ' + ((l && l.kontakt) || ''), [
          'wir bestellen hiermit für die Kommission ' + a.nr + ' ' + (k ? k.name : '') + ':\n' + zeilen.map(p => '  ' + p.menge + ' ' + p.einheit + '  ' + p.name + (p.stornierbar === false ? '  (Sonderanfertigung, nicht stornierbar)' : '')).join('\n'),
          'Gewünschter Liefertermin: ' + Fmt.datum(b.planTermin) + ' (gemäss Ihrer Standardfrist von ' + frist + ' Werktagen). Lieferort: Showroom-Lager, ' + db.betrieb.strasse + ', ' + db.betrieb.plz + ' ' + db.betrieb.ort + ', werktags 07:30–16:30.',
          'Bitte bestätigen Sie die Bestellung mit Liefertermin innert ' + ((l && l.abFristTage) || 2) + ' Werktagen – am einfachsten mit einem Klick:\n' + Mail.link('l', b.token),
          'Bitte vermerken Sie die Kommission ' + a.nr + ' auf Lieferschein und Etikett.'
        ])
      });
      Store.log('bestellung', 'Bestellung ' + b.nr + ' an ' + (l ? l.name : lid) + ' gesendet (' + zeilen.length + ' Pos., Soll ' + Fmt.datum(b.planTermin) + ')', a.id, '📦');
    });
    a.qrErzeugtAm = D.jetztIso();
  },

  terminVon(b) { return b.abTermin || b.planTermin; },

  abBestaetigen(db, b, o) {
    b.status = b.status === 'gesendet' ? 'bestaetigt' : b.status;
    b.abTermin = o.termin || b.planTermin; b.abEingang = D.jetztIso(); b.bemerkung = o.bemerkung || b.bemerkung;
    b.mahnstufe = 0; b.pausiertBis = null;
    const l = db.lieferanten.find(x => x.id === b.lieferantId);
    const abw = D.diffTage(b.planTermin, b.abTermin);
    Store.log('ab', 'Auftragsbestätigung ' + (l ? l.name : '') + ' für ' + b.nr + ' eingegangen – Liefertermin ' + Fmt.datum(b.abTermin) + (abw > 0 ? ' (' + abw + ' Tage später als Soll)' : abw < 0 ? ' (' + (-abw) + ' Tage früher als Soll)' : ' (wie Soll)'), b.auftragId, '✅');
    Dom.auftragTermineNachfuehren(db, db.auftraege.find(a => a.id === b.auftragId));
  },

  avisMelden(db, b, o) {
    b.avis = { sendung: o.sendung || '', datum: o.datum || Dom.terminVon(b), zeit: D.jetztIso() };
    if (b.status === 'gesendet' || b.status === 'bestaetigt') b.status = 'avisiert';
    if (o.datum) b.abTermin = o.datum;
    b.mahnstufe = Math.min(b.mahnstufe, 1);
    const l = db.lieferanten.find(x => x.id === b.lieferantId);
    Store.log('avis', 'Lieferavis ' + (l ? l.name : '') + ' für ' + b.nr + ': Sendung ' + (o.sendung || '–') + ', Ankunft ' + Fmt.datum(b.avis.datum), b.auftragId, '🚚');
    Dom.auftragTermineNachfuehren(db, db.auftraege.find(a => a.id === b.auftragId));
  },

  verzugMelden(db, b, o) {
    const alt = Dom.terminVon(b);
    b.abTermin = o.neuerTermin; b.abEingang = b.abEingang || D.jetztIso(); b.mahnstufe = 0; b.pausiertBis = null; b.bemerkung = o.grund || '';
    if (b.status === 'gesendet') b.status = 'bestaetigt';
    const l = db.lieferanten.find(x => x.id === b.lieferantId);
    Store.log('verzug', (l ? l.name : '') + ' meldet neuen Liefertermin für ' + b.nr + ': ' + Fmt.datum(o.neuerTermin) + ' statt ' + Fmt.datum(alt) + (o.grund ? ' – ' + o.grund : ''), b.auftragId, '⚠️');
    Dom.auftragTermineNachfuehren(db, db.auftraege.find(a => a.id === b.auftragId));
  },

  /** Fruehester Montagetermin und kritischer Pfad aus den offenen Bestellungen. */
  auftragTermineNachfuehren(db, a) {
    if (!a) return;
    const offen = db.bestellungen.filter(b => b.auftragId === a.id && b.status !== 'geliefert');
    if (!offen.length) return;
    let spaet = null;
    offen.forEach(b => { const t = Dom.terminVon(b); if (!spaet || t > spaet.t) spaet = { t, b }; });
    const l = db.lieferanten.find(x => x.id === spaet.b.lieferantId);
    a.kritischerPfad = { tage: D.werktageBis(D.heute(), spaet.t), name: (l ? l.name : '') + ' (' + spaet.b.nr + ')', lieferantId: spaet.b.lieferantId, datum: spaet.t };
    a.fruehesterMontage = D.plusWerktage(spaet.t, 3);
  },

  /* --------------------------------------------------- Wareneingang */
  lagerplatzVorschlag(db, lp) {
    const a = db.artikel.find(x => x.id === lp.artikelId) || {};
    const au = db.auftraege.find(x => x.id === lp.auftragId);
    const fach = 'K-' + (au ? au.nr.slice(-4) : '0000');
    const regal = ['badewanne', 'dusche'].includes(a.kategorie) ? 'A' : ['wc', 'lavabo', 'moebel', 'spiegel', 'heizung'].includes(a.kategorie) ? 'B' : 'C';
    const n = db.lagerpositionen.filter(x => x.lagerplatz && x.lagerplatz.startsWith(regal + '-')).length + 1;
    return regal + '-' + String(((n - 1) % 12) + 1).padStart(2, '0') + ' · ' + fach;
  },

  wareneingang(db, lp, o) {
    if (lp.status === 'eingetroffen') return { schon: true };
    const menge = o.menge != null ? o.menge : lp.menge;
    lp.status = o.zustand === 'beschaedigt' ? 'beschaedigt' : 'eingetroffen';
    lp.gescanntAm = D.jetztIso(); lp.gescanntVon = o.benutzerId || null; lp.lagerplatz = o.lagerplatz || Dom.lagerplatzVorschlag(db, lp);
    lp.foto = o.foto || null; lp.notiz = o.notiz || ''; lp.mengeErhalten = menge;
    const b = db.bestellungen.find(x => x.id === lp.bestellungId);
    const a = db.auftraege.find(x => x.id === lp.auftragId);
    const who = o.benutzerId ? (db.benutzer.find(x => x.id === o.benutzerId) || {}).name : 'Lager';
    if (b) {
      const bp = b.positionen.find(x => x.lagerpositionId === lp.id);
      if (bp) bp.offen = lp.status === 'beschaedigt' ? bp.menge : Math.max(0, bp.menge - menge);   // Schaden: Ersatz bleibt offen
      const rest = sum(b.positionen, x => x.offen);
      if (rest === 0) { b.status = 'geliefert'; b.geliefertAm = D.jetztIso(); }
      else {
        b.status = 'teilgeliefert';
        if (lp.status === 'beschaedigt') { b.abTermin = D.plusWerktage(D.heute(), 5); b.mahnstufe = 0; b.avis = null; b.bemerkung = 'Ersatzlieferung für beschädigte Position angefordert'; }
      }
      b.verzugTage = 0;
    }
    if (lp.status === 'beschaedigt') {
      const l = db.lieferanten.find(x => x.id === (b || {}).lieferantId);
      Mail.anlegen(db, {
        an: l && l.email, anName: l && l.name, art: 'schaden', auftragId: lp.auftragId, bestellungId: b && b.id, automatisch: true,
        betreff: 'Schadensmeldung unter Vorbehalt · ' + (b ? b.nr : '') + ' · Kommission ' + (a ? a.nr : ''),
        text: Mail.brief('Guten Tag ' + ((l && l.kontakt) || ''), [
          'beim Wareneingang vom ' + Fmt.datum(D.heute()) + ' haben wir folgende Position beschädigt vorgefunden und unter Vorbehalt angenommen:\n  ' + lp.menge + ' Stk  ' + lp.name + (o.notiz ? '\n  Befund: ' + o.notiz : ''),
          'Fotos liegen bei. Wir bitten um Ersatzlieferung und um Ihre Rückmeldung innert 2 Werktagen. Die Rüge erfolgt fristgerecht (Transportschaden innert 1 Tag, OR 452: 8 Tage).'
        ]),
        anhaenge: lp.foto ? ['Foto Wareneingang.jpg'] : []
      });
      Store.log('schaden', who + ': ' + lp.name + ' beschädigt angenommen (unter Vorbehalt) – Meldung an Lieferant', lp.auftragId, '🛑');
    } else {
      Store.log('wareneingang', who + ' hat ' + menge + '× ' + lp.name + ' gescannt → Lagerplatz ' + lp.lagerplatz, lp.auftragId, '📥');
    }
    if (a) Dom.montagebereitPruefen(db, a);
    return { ok: true, lp, a };
  },

  montagebereitPruefen(db, a) {
    if (!a || !['bestellt', 'teilgeliefert'].includes(a.status)) return false;
    const lps = db.lagerpositionen.filter(x => x.auftragId === a.id);
    const alle = lps.length && lps.every(x => x.status === 'eingetroffen' || x.status === 'ausgeliefert');
    if (!alle) { if (lps.some(x => x.status !== 'erwartet')) a.status = 'teilgeliefert'; return false; }
    a.status = 'bereit'; a.montagebereitAm = D.jetztIso();
    const k = db.kunden.find(x => x.id === a.kundeId);
    const p = db.partner.find(x => x.id === a.partnerId);
    Mail.anlegen(db, {
      an: k && k.email, anName: Dom.kundeName(k), art: 'kunde-termin', auftragId: a.id, automatisch: true,
      betreff: 'Alles eingetroffen – wählen Sie Ihren Montagetermin (' + a.nr + ')',
      text: Mail.brief(anrede(k), [
        'gute Nachrichten: Alle Produkte für Ihren Auftrag ' + a.nr + ' sind bei uns im Lager eingetroffen und geprüft.',
        'Wählen Sie jetzt online Ihren Wunschtermin für die Montage' + (p ? ' durch ' + p.name : '') + ' (Dauer ca. ' + a.montageTage + ' ' + (a.montageTage === 1 ? 'Tag' : 'Tage') + '):\n' + Mail.link('k', a.token),
        'Lieber telefonisch? Rufen Sie uns an, wir tragen den Termin für Sie ein.'
      ])
    });
    Store.log('bereit', 'Alle Positionen eingetroffen – Kunde zur Terminwahl eingeladen', a.id, '🎉');
    return true;
  },

  /* --------------------------------------------------------- Termin */
  terminSetzen(db, a, o) {
    const p = db.partner.find(x => x.id === (o.partnerId || a.partnerId));
    const t = {
      id: uid('t'), auftragId: a.id, partnerId: p ? p.id : null, art: 'montage', datum: o.datum, von: o.von || '07:30', bis: o.bis || '17:00',
      dauerTage: a.montageTage || 1, status: 'vorgeschlagen', token: null, quelle: o.quelle || 'telefon', monteur: o.monteur || (p && p.monteure ? p.monteure[0] : ''),
      erstellt: D.jetztIso(), bestaetigtVonPartner: null, erinnertAm: null, notiz: o.notiz || ''
    };
    t.token = Dom.tok('termin', Object.assign({ auftragNr: a.nr }, t));
    db.termine.unshift(t);
    a.terminId = t.id; a.partnerId = t.partnerId || a.partnerId; a.status = 'terminiert';
    if (p) { p.belegt = p.belegt || []; p.belegt.push(t.datum + ' ' + t.von); }
    db.lagerpositionen.filter(x => x.auftragId === a.id && x.status === 'eingetroffen').forEach(x => { x.bereitAm = D.jetztIso(); });
    const k = db.kunden.find(x => x.id === a.kundeId);
    const ob = db.objekte.find(x => x.id === a.objektId);
    Store.log('termin', 'Montagetermin ' + Fmt.datum(t.datum) + ' ' + t.von + ' ' + (o.quelle === 'kunde-online' ? 'online durch den Kunden gewählt' : 'eingetragen') + (p ? ' – ' + p.name : ''), a.id, '📅');
    if (p) Mail.anlegen(db, {
      an: p.email, anName: p.name, art: 'monteur', auftragId: a.id, automatisch: true,
      betreff: 'Montageauftrag ' + a.nr + ' · ' + Fmt.datum(t.datum) + ' · ' + (k ? k.name : '') + ', ' + ((ob && ob.ort) || ''),
      text: Mail.brief('Guten Tag ' + (p.kontakt || ''), [
        'wir haben für Sie einen Montageauftrag: ' + Fmt.wochentag(t.datum, true) + ', ' + Fmt.datum(t.datum) + ' ab ' + t.von + ' Uhr, Dauer ca. ' + t.dauerTage + ' ' + (t.dauerTage === 1 ? 'Tag' : 'Tage') + '.',
        'Kunde: ' + Dom.kundeName(k) + ', ' + ((ob && ob.strasse) || '') + ', ' + ((ob && ob.plz) || '') + ' ' + ((ob && ob.ort) || '') + (k && k.telefon ? ', ' + k.telefon : '') + '\nObjekt: ' + Dom.objektText(ob) + '\nZugang: ' + ((ob && ob.zugang) || 'gemäss Absprache'),
        'Material: alles im Showroom-Lager bereit (Kommission K-' + a.nr.slice(-4) + '). Auftragsblatt, Stückliste, Terminbestätigung und Fertigmeldung mit Abnahme finden Sie hier:\n' + Mail.link('m', t.token),
        'Bitte bestätigen Sie den Termin bis morgen. Vielen Dank!'
      ]),
      anhaenge: ['Auftragsblatt ' + a.nr + '.pdf']
    });
    Mail.anlegen(db, {
      an: k && k.email, anName: Dom.kundeName(k), art: 'kunde-status', auftragId: a.id, automatisch: true,
      betreff: 'Ihr Montagetermin: ' + Fmt.wochentag(t.datum, true) + ', ' + Fmt.datum(t.datum),
      text: Mail.brief(anrede(k), [
        'Ihr Montagetermin ist eingetragen: ' + Fmt.wochentag(t.datum, true) + ', ' + Fmt.datum(t.datum) + ' ab ' + t.von + ' Uhr' + (p ? ', ausgeführt durch ' + p.name : '') + '. Dauer ca. ' + t.dauerTage + ' ' + (t.dauerTage === 1 ? 'Tag' : 'Tage') + '.',
        'Bitte sorgen Sie dafür, dass das Bad zugänglich ist und Wasser abgestellt werden kann. Eine Kalenderdatei liegt bei; Änderungen jederzeit unter ' + Mail.link('k', a.token)
      ]),
      anhaenge: ['Termin.ics']
    });
    return t;
  },

  terminBestaetigenPartner(db, t, monteur) {
    t.status = 'bestaetigt'; t.bestaetigtVonPartner = D.jetztIso(); if (monteur) t.monteur = monteur;
    const p = db.partner.find(x => x.id === t.partnerId);
    Store.log('termin', (p ? p.name : 'Partnerbetrieb') + ' hat den Montagetermin ' + Fmt.datum(t.datum) + ' bestätigt' + (t.monteur ? ' – Monteur ' + t.monteur : ''), t.auftragId, '👍');
  },

  /* ------------------------------------------------ Fertig, Rechnung */
  fertigmelden(db, a, o) {
    const t = db.termine.find(x => x.id === a.terminId);
    if (t) t.status = 'erledigt';
    a.abnahme = { zeit: D.jetztIso(), name: o.name || '', dataUrl: o.dataUrl || '', fotos: o.fotos || [], notiz: o.notiz || '', monteur: o.monteur || (t && t.monteur) || '' };
    a.status = 'abgeschlossen';
    db.lagerpositionen.filter(x => x.auftragId === a.id).forEach(x => { if (x.status === 'eingetroffen') x.status = 'ausgeliefert'; });
    Store.log('abnahme', 'Montage abgeschlossen, Abnahme unterschrieben von ' + (o.name || 'Kunde') + (a.abnahme.monteur ? ' (Monteur ' + a.abnahme.monteur + ')' : ''), a.id, '🔧');
    const r = Dom.schlussrechnungErzeugen(db, a);
    return r;
  },

  schlussrechnungErzeugen(db, a) {
    const k = db.kunden.find(x => x.id === a.kundeId);
    const o = db.offerten.find(x => x.id === a.offerteId);
    const s = Dom.summe(o || { positionen: a.positionen, montage: a.montage, anzahlungProzent: 40 });
    const anz = a.anzahlung ? a.anzahlung.betrag : 0;
    const nr = Dom.nrNeu(db, 'rechnung');
    const r = {
      id: uid('r'), nr, auftragId: a.id, kundeId: a.kundeId, art: 'schluss', datum: D.heute(), leistungsdatum: D.heute(),
      faellig: D.plus(D.heute(), db.betrieb.zahlungsfristTage || 30), total: s.total, netto: s.netto, mwst: s.mwst, anzahlungVerrechnet: anz,
      betrag: Fmt.rappen(s.total - anz), status: 'gestellt', mahngebuehr: 0, mahnungen: [], bezahltAm: null,
      referenz: BWQR.qrReference(String((k && k.nr) || '1').replace(/\D/g, '').padStart(6, '0').slice(-6), nr.replace(/\D/g, '').slice(-8))
    };
    db.rechnungen.unshift(r);
    a.rechnungId = r.id; a.status = 'verrechnet';
    Mail.anlegen(db, {
      an: k && k.email, anName: Dom.kundeName(k), art: 'rechnung', auftragId: a.id, automatisch: true,
      betreff: 'Schlussrechnung ' + r.nr + ' – Auftrag ' + a.nr,
      text: Mail.brief(anrede(k), [
        'vielen Dank für Ihr Vertrauen – wir hoffen, Sie geniessen Ihr neues Bad. Anbei erhalten Sie die Schlussrechnung ' + r.nr + ' über ' + Fmt.chf(r.betrag) + ' (Gesamtbetrag ' + Fmt.chf(s.total) + ' abzüglich Anzahlung ' + Fmt.chf(anz) + ').',
        'Zahlbar bis ' + Fmt.datum(r.faellig) + '. Am einfachsten scannen Sie den QR-Zahlteil mit Ihrer Banking-App. Rechnung und Zahlteil: ' + Mail.link('k', a.token),
        'Für Garantiefragen zu den Produkten sind wir Ihr Ansprechpartner; für die Montage der ausführende Partnerbetrieb.'
      ]),
      anhaenge: ['Rechnung ' + r.nr + ' mit QR-Zahlteil.pdf']
    });
    Store.log('rechnung', 'Schlussrechnung ' + r.nr + ' über ' + Fmt.chf(r.betrag) + ' versendet, fällig ' + Fmt.datum(r.faellig), a.id, '🧾');
    return r;
  },

  rechnungBezahlt(db, r, o) {
    r.status = 'bezahlt'; r.bezahltAm = D.jetztIso(); r.methode = (o && o.methode) || 'ueberweisung';
    const a = db.auftraege.find(x => x.id === r.auftragId);
    Store.log('zahlung', 'Zahlung ' + Fmt.chf(r.betrag + (r.mahngebuehr || 0)) + ' für ' + r.nr + ' eingegangen', r.auftragId, '💰');
    if (a && r.art === 'schluss') Dom.archivieren(db, a);
  },

  archivieren(db, a) {
    a.status = 'archiviert'; a.archiviertAm = D.jetztIso();
    const k = db.kunden.find(x => x.id === a.kundeId);
    a.dokumente = ['Offerte (unterschrieben)', 'Anzahlungsbeleg', 'Auftragsbestätigung', 'Bestellungen und Auftragsbestätigungen', 'Wareneingangs-Protokoll', 'Auftragsblatt Montage', 'Abnahmeprotokoll', 'Schlussrechnung'];
    Mail.anlegen(db, {
      an: k && k.email, anName: Dom.kundeName(k), art: 'bewertung', auftragId: a.id, automatisch: true,
      betreff: 'Wie gefällt Ihnen Ihr neues Bad?',
      text: Mail.brief(anrede(k), ['Ihr Auftrag ' + a.nr + ' ist abgeschlossen und bezahlt – herzlichen Dank! Wenn Sie zufrieden sind, freuen wir uns über eine kurze Bewertung. Und wenn etwas nicht passt, sagen Sie es bitte zuerst uns.', 'Alle Unterlagen (Offerte, Rechnung, Garantie) bleiben unter ' + Mail.link('k', a.token) + ' für Sie abrufbar.'])
    });
    Store.log('archiv', 'Auftrag abgeschlossen und archiviert (' + a.dokumente.length + ' Dokumente)', a.id, '🗄️');
  },

  stornieren(db, a, grund) {
    a.status = 'storniert'; a.storniertAm = D.jetztIso(); a.stornoGrund = grund || '';
    db.bestellungen.filter(b => b.auftragId === a.id && b.status !== 'geliefert').forEach(b => { b.status = 'storniert'; });
    Store.log('storno', 'Auftrag storniert' + (grund ? ': ' + grund : ''), a.id, '✖️');
  },

  /* ---------------------------------------------------- Showroom */
  showroomTerminAnfragen(db, o) {
    const t = { id: uid('st'), datum: o.datum, von: o.von, bis: o.bis || D.hhmm(D.minuten(o.von) + 60), kundeName: o.kundeName || '', kundeId: o.kundeId || null, partnerId: o.partnerId || null, art: o.partnerId ? 'partner' : 'beratung', status: o.status || 'angefragt', notiz: o.notiz || '', hospitality: !!o.hospitality, beraterId: o.beraterId || null, thema: o.thema || '', erstellt: D.jetztIso() };
    db.showroomTermine.unshift(t);
    const p = db.partner.find(x => x.id === t.partnerId);
    Store.log('showroom', 'Showroom-Termin ' + Fmt.datum(t.datum) + ' ' + t.von + (p ? ' angefragt von ' + p.name : ' erfasst') + (t.kundeName ? ' für ' + t.kundeName : ''), null, '🛋️');
    return t;
  },
  showroomTerminBestaetigen(db, t) {
    t.status = 'bestaetigt';
    const p = db.partner.find(x => x.id === t.partnerId);
    if (p) Mail.anlegen(db, { an: p.email, anName: p.name, art: 'showroom', automatisch: true, betreff: 'Showroom-Termin bestätigt: ' + Fmt.datum(t.datum) + ' ' + t.von, text: Mail.brief('Guten Tag ' + (p.kontakt || ''), ['Ihr Beratungstermin' + (t.kundeName ? ' für ' + t.kundeName : '') + ' am ' + Fmt.wochentag(t.datum, true) + ', ' + Fmt.datum(t.datum) + ' um ' + t.von + ' Uhr ist bestätigt.' + (t.hospitality ? ' Kaffee und Gipfeli stehen bereit.' : ''), 'Bringen Sie gerne Grundriss und Fotos mit. Wir freuen uns.']) });
    Store.log('showroom', 'Showroom-Termin ' + Fmt.datum(t.datum) + ' ' + t.von + ' bestätigt', null, '☕');
  },

  /* ------------------------------------------------------ Anzeigen */
  kundeName(k) { return k ? (k.firma ? k.firma + (k.name ? ' (' + [k.vorname, k.name].filter(Boolean).join(' ') + ')' : '') : [k.vorname, k.name].filter(Boolean).join(' ')) : '–'; },
  objektText(ob) {
    if (!ob) return '–';
    const t = [Dom.GEBAEUDE[ob.gebaeudetyp] || ob.gebaeudetyp];
    if (ob.gebaeudetyp !== 'efh') t.push((ob.stockwerk ? ob.stockwerk + '. OG' : 'EG') + (ob.lift ? ' mit Lift' : ' ohne Lift'));
    t.push(ob.art === 'neubau' ? 'Neubau' : 'Sanierung');
    if (ob.baujahrVor1990) t.push('Baujahr vor 1990');
    if (ob.eigentum === 'miete') t.push('Miete' + (ob.verwaltung ? ' (' + ob.verwaltung + ')' : ''));
    return t.join(' · ');
  },
  auftragFluss(a) {
    const f = Dom.AUFTRAG_FLUSS; const i = f.indexOf(a.status);
    return f.map((s, j) => ({ status: s, text: Dom.statusText(s), done: j < i, now: j === i }));
  },
  /** Aufgaben fuer die Uebersicht: was heute Geld oder Aerger bedeutet. */
  aufgaben(db) {
    const heute = D.heute(); const t = [];
    db.bestellungen.forEach(b => {
      const a = db.auftraege.find(x => x.id === b.auftragId); if (!a || ['storniert', 'archiviert'].includes(a.status) || b.status === 'geliefert' || b.status === 'storniert') return;
      const l = db.lieferanten.find(x => x.id === b.lieferantId) || {};
      const term = Dom.terminVon(b);
      if (heute > term) t.push({ art: 'err', ic: 'i-lkw', titel: 'Lieferung überfällig: ' + l.name + ' (' + b.nr + ')', text: 'Soll ' + Fmt.datum(term) + ' · ' + D.werktageBis(term, heute) + ' Werktage Verzug · Mahnstufe ' + b.mahnstufe + ' · Auftrag ' + a.nr, r: 'auftrag/' + a.id + '/lieferung' });
      else if (b.status === 'gesendet' && D.werktageBis(b.gesendet.slice(0, 10), heute) >= (l.abFristTage || 2)) t.push({ art: 'warn', ic: 'i-sanduhr', titel: 'Auftragsbestätigung fehlt: ' + l.name + ' (' + b.nr + ')', text: 'Bestellt ' + Fmt.relativ(b.gesendet.slice(0, 10)) + ' · Auftrag ' + a.nr, r: 'auftrag/' + a.id + '/lieferung' });
    });
    db.post.filter(m => m.status === 'entwurf').forEach(m => t.push({ art: 'warn', ic: 'i-mail', titel: 'Entwurf freigeben: ' + m.betreff, text: Mail.artText(m.art) + (m.ki ? ' · KI-Entwurf' : ''), r: 'post/' + m.id }));
    db.auftraege.filter(a => a.status === 'bereit').forEach(a => t.push({ art: 'info', ic: 'i-kalender', titel: 'Montagebereit, Termin offen: ' + a.nr, text: 'Kunde ' + Dom.kundeName(db.kunden.find(k => k.id === a.kundeId)) + ' wurde ' + Fmt.relativ((a.montagebereitAm || '').slice(0, 10)) + ' eingeladen', r: 'auftrag/' + a.id + '/termin' }));
    db.termine.filter(x => x.status === 'vorgeschlagen').forEach(x => { const a = db.auftraege.find(y => y.id === x.auftragId); const p = db.partner.find(y => y.id === x.partnerId); if (a) t.push({ art: 'warn', ic: 'i-werkzeug', titel: 'Termin ' + Fmt.datum(x.datum) + ' vom Partner nicht bestätigt', text: (p ? p.name : '') + ' · Auftrag ' + a.nr, r: 'auftrag/' + a.id + '/termin' }); });
    db.lagerpositionen.filter(x => x.status === 'beschaedigt').forEach(x => { const a = db.auftraege.find(y => y.id === x.auftragId); if (a && a.status !== 'archiviert') t.push({ art: 'err', ic: 'i-warn', titel: 'Schaden offen: ' + x.name, text: 'Ersatz beim Lieferanten angefordert · Auftrag ' + a.nr, r: 'auftrag/' + a.id + '/lager' }); });
    db.rechnungen.filter(r => r.art === 'schluss' && r.status !== 'bezahlt' && r.faellig < heute).forEach(r => { const a = db.auftraege.find(y => y.id === r.auftragId); t.push({ art: 'err', ic: 'i-franken', titel: 'Rechnung ' + r.nr + ' überfällig (' + Fmt.chf(r.betrag) + ')', text: 'Fällig ' + Fmt.datum(r.faellig) + ' · ' + Dom.statusText(r.status) + (a ? ' · ' + a.nr : ''), r: 'rechnungen' }); });
    db.showroomTermine.filter(x => x.status === 'angefragt').forEach(x => { const p = db.partner.find(y => y.id === x.partnerId); t.push({ art: 'info', ic: 'i-showroom', titel: 'Showroom-Anfrage: ' + Fmt.datum(x.datum) + ' ' + x.von, text: (p ? p.name + ' bringt ' : '') + (x.kundeName || 'Kunde') + (x.hospitality ? ' · Kaffee und Gipfeli' : ''), r: 'showroom' }); });
    db.auftraege.filter(a => a.freigabeVerwaltung === 'ausstehend' && !['archiviert', 'storniert'].includes(a.status)).forEach(a => t.push({ art: 'info', ic: 'i-wohnung', titel: 'Freigabe der Verwaltung ausstehend: ' + a.nr, text: ((db.objekte.find(o => o.id === a.objektId) || {}).verwaltung || 'Verwaltung') + ' muss der Sanierung zustimmen', r: 'auftrag/' + a.id }));
    db.offerten.filter(o => o.status === 'offen' && o.gueltigBis <= D.plus(heute, 5)).forEach(o => t.push({ art: 'info', ic: 'i-doc', titel: 'Offerte ' + o.nr + ' läuft ' + Fmt.relativ(o.gueltigBis) + ' ab', text: Dom.kundeName(db.kunden.find(k => k.id === o.kundeId)) + ' · ' + Fmt.chf(Dom.summe(o).total), r: 'offerten' }));
    const rang = { err: 0, warn: 1, info: 2, ok: 3 };
    return t.sort((x, y) => rang[x.art] - rang[y.art]);
  },

  kpis(db) {
    const heute = D.heute(); const monat = heute.slice(0, 7);
    const offen = db.offerten.filter(o => ['offen', 'unterschrieben', 'entwurf'].includes(o.status));
    const aktiv = db.auftraege.filter(a => !['archiviert', 'storniert'].includes(a.status));
    const seit = D.plus(heute, -30);
    const monatAuftraege = db.auftraege.filter(a => (a.erstellt || '').slice(0, 10) >= seit && a.status !== 'storniert');
    const umsatz = sum(monatAuftraege, a => a.total);
    const alleOff = db.offerten.filter(o => ['angezahlt', 'abgelaufen', 'abgelehnt', 'offen', 'unterschrieben'].includes(o.status));
    const conv = alleOff.length ? Math.round(db.offerten.filter(o => o.status === 'angezahlt').length / alleOff.length * 100) : 0;
    const ups = db.auftraege.filter(a => a.status !== 'storniert').map(a => { const o = db.offerten.find(x => x.id === a.offerteId); return o ? Dom.summe(o) : null; }).filter(Boolean);
    const upsell = ups.length ? Math.round(sum(ups, s => s.upsell) / Math.max(1, sum(ups, s => s.total)) * 100) : 0;
    const marge = ups.length ? Math.round(sum(ups, s => s.margeProzent) / ups.length * 10) / 10 : 0;
    const ueberf = db.bestellungen.filter(b => !['geliefert', 'storniert'].includes(b.status) && Dom.terminVon(b) < heute && db.auftraege.some(a => a.id === b.auftragId && !['archiviert', 'storniert'].includes(a.status)));
    const forder = db.rechnungen.filter(r => r.art === 'schluss' && r.status !== 'bezahlt');
    return {
      offeneOfferten: offen.length, offeneOfferteWert: sum(offen, o => Dom.summe(o).total), conversion: conv,
      aktiveAuftraege: aktiv.length, umsatzMonat: umsatz, avgAuftrag: monatAuftraege.length ? umsatz / monatAuftraege.length : 0,
      upsell, marge, ueberfaellig: ueberf.length, forderungen: sum(forder, r => r.betrag), forderungenAnzahl: forder.length,
      bereit: db.auftraege.filter(a => a.status === 'bereit').length, entwuerfe: db.post.filter(m => m.status === 'entwurf').length
    };
  },

  lieferantKpi(db, lid) {
    const bs = db.bestellungen.filter(b => b.lieferantId === lid);
    const gel = bs.filter(b => b.status === 'geliefert');
    const puenkt = gel.filter(b => b.geliefertAm && D.diffTage(Dom.terminVon(b), b.geliefertAm.slice(0, 10)) <= 2);
    const l = db.lieferanten.find(x => x.id === lid) || {};
    const prior = l.otif != null ? l.otif : 95;
    return { bestellungen: bs.length, geliefert: gel.length, otif: Math.round((prior * 10 + puenkt.length * 100) / (10 + gel.length)), mahnungen: sum(bs, b => (b.mahnungen || []).length), offen: bs.filter(b => !['geliefert', 'storniert'].includes(b.status)).length, verspaetung: gel.length ? Math.round(sum(gel, b => Math.max(0, D.diffTage(Dom.terminVon(b), b.geliefertAm.slice(0, 10)))) / gel.length * 10) / 10 : 0 };
  }
};
