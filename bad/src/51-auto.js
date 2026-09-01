/* ==================================================================
   51 · Automationen
   Regeln mit klarem Ausloeser, alle an Werktagen und am bestaetigten
   Termin (AB) orientiert. Was routiniert ist, geht automatisch raus
   (und liegt im Postausgang); was Beziehungsrisiko hat, wird Entwurf.
   Auto.regeln(db) ist rein und laeuft auch in den Demodaten; Auto.laufen()
   ist der Rahmen fuer die Oberflaeche (Start, Minutentakt, Zeitsprung).
   ================================================================== */
const Auto = {
  laufen(grund) {
    if (!DB) return 0;
    const n = Auto.regeln(DB);
    if (n) {
      DB.rev = (DB.rev || 0) + 1;
      Store.speichern(); Sync.senden();
      Store.horcher.forEach(f => { try { f('auto'); } catch (e) { console.error(e); } });
      if (grund === 'uhr') UI.toast(n + (n === 1 ? ' Automation ausgelöst' : ' Automationen ausgelöst') + ' – siehe Postausgang', 'ok', { undo: false });
    }
    return n;
  },

  regeln(db) {
    let n = 0;
    n += Auto.lieferfristen(db);
    n += Auto.montagebereit(db);
    n += Auto.rechnungen(db);
    n += Auto.offerten(db);
    n += Auto.termine(db);
    return n;
  },

  /* ---- Lieferfrist-Ueberwachung: Stufen 0..3 ---- */
  lieferfristen(db) {
    const heute = D.heute(); let n = 0;
    db.bestellungen.forEach(b => {
      if (['geliefert', 'storniert'].includes(b.status)) return;
      const a = db.auftraege.find(x => x.id === b.auftragId); if (!a || ['storniert', 'archiviert'].includes(a.status)) return;
      const l = db.lieferanten.find(x => x.id === b.lieferantId) || {};
      const k = db.kunden.find(x => x.id === a.kundeId);
      const termin = Dom.terminVon(b);
      const gesendet = (b.gesendet || '').slice(0, 10);
      if (b.pausiertBis && heute < b.pausiertBis) return;
      b.verzugTage = heute > termin ? D.werktageBis(termin, heute) : 0;
      const offenePos = b.positionen.filter(p => p.offen > 0);
      const posText = offenePos.map(p => '  ' + p.offen + ' Stk  ' + p.name).join('\n');
      const ref = 'Bestellung ' + b.nr + ' · Kommission ' + a.nr + (k ? ' ' + k.name : '');

      // Stufe 0: Auftragsbestaetigung fehlt
      if (b.status === 'gesendet' && !b.abErinnertAm && D.werktageBis(gesendet, heute) > (l.abFristTage || 2)) {
        b.abErinnertAm = heute;
        const m = Mail.anlegen(db, {
          an: l.email, anName: l.name, art: 'ab-erinnerung', auftragId: a.id, bestellungId: b.id, automatisch: true,
          betreff: 'Auftragsbestätigung ausstehend · ' + ref,
          text: Mail.brief('Guten Tag ' + (l.kontakt || ''), [
            'am ' + Fmt.datum(gesendet) + ' haben wir Ihnen die ' + ref + ' zugestellt. Bisher fehlt uns Ihre Auftragsbestätigung mit Liefertermin.',
            'Bitte bestätigen Sie mit einem Klick, damit wir unseren Kunden verlässlich informieren können:\n' + Mail.link('l', b.token),
            'Gewünschter Liefertermin: ' + Fmt.datum(b.planTermin) + '.'
          ])
        });
        b.mahnungen.push({ stufe: 0, zeit: D.jetztIso(), mailId: m.id });
        Store.log('mahnung', 'AB-Erinnerung an ' + l.name + ' (' + b.nr + ') gesendet – keine Auftragsbestätigung nach ' + D.werktageBis(gesendet, heute) + ' Werktagen', a.id, '⏳');
        n++;
      }
      // Stufe 1: Statusanfrage 5 Werktage vor bestaetigtem Termin, wenn kein Avis
      if (b.abTermin && !b.avis && b.mahnstufe < 1 && heute <= termin && D.werktageBis(heute, termin) <= 5 && heute > gesendet) {
        b.mahnstufe = 1;
        const m = Mail.anlegen(db, {
          an: l.email, anName: l.name, art: 'mahnung', auftragId: a.id, bestellungId: b.id, automatisch: true,
          betreff: 'Statusanfrage ' + ref + ' – Liefertermin ' + Fmt.datum(termin),
          text: Mail.brief('Guten Tag ' + (l.kontakt || ''), [
            'gemäss Ihrer Auftragsbestätigung vom ' + Fmt.datum((b.abEingang || '').slice(0, 10)) + ' erwarten wir am ' + Fmt.datum(termin) + ' folgende Lieferung:\n' + posText,
            'Könnten Sie uns kurz bestätigen, ob die Sendung planmässig unterwegs ist, und uns die Sendungsnummer mitteilen? Am einfachsten hier:\n' + Mail.link('l', b.token),
            'Unser Montagetermin beim Kunden hängt von dieser Lieferung ab. Besten Dank!'
          ])
        });
        b.mahnungen.push({ stufe: 1, zeit: D.jetztIso(), mailId: m.id });
        Store.log('mahnung', 'Statusanfrage an ' + l.name + ' (' + b.nr + ') – 5 Werktage vor Liefertermin, kein Lieferavis', a.id, '📨');
        n++;
      }
      // Stufe 2: Liefermahnung am Werktag +1, Kundenmail als Entwurf
      if (b.mahnstufe < 2 && heute >= D.plusWerktage(termin, 1)) {
        b.mahnstufe = 2;
        const nachfrist = D.plusWerktage(heute, 5);
        const m = Mail.anlegen(db, {
          an: l.email, anName: l.name, art: 'mahnung', auftragId: a.id, bestellungId: b.id, automatisch: true,
          betreff: 'Liefermahnung ' + ref + ' – Termin ' + Fmt.datum(termin) + ' verstrichen',
          text: Mail.brief('Guten Tag ' + (l.kontakt || ''), [
            'der ' + (b.abTermin ? 'von Ihnen bestätigte' : 'vereinbarte') + ' Liefertermin ' + Fmt.datum(termin) + ' ist verstrichen; die folgende Lieferung ist bei uns nicht eingetroffen:\n' + posText,
            'Bitte nennen Sie uns bis ' + Fmt.datum(nachfrist) + ' einen neuen, verbindlichen Liefertermin – direkt hier:\n' + Mail.link('l', b.token),
            'Unser Montagetermin beim Kunden hängt von dieser Lieferung ab; Folgekosten für verschobene Montagen müssten wir Ihnen weiterbelasten.'
          ])
        });
        b.mahnungen.push({ stufe: 2, zeit: D.jetztIso(), mailId: m.id });
        const e = Mail.anlegen(db, {
          an: k && k.email, anName: Dom.kundeName(k), art: 'kunde-verzug', auftragId: a.id, bestellungId: b.id, status: 'entwurf', automatisch: true, ki: true,
          betreff: 'Ihr Auftrag ' + a.nr + ': Lieferung von ' + (offenePos[0] ? offenePos[0].name : 'einer Position') + ' verzögert sich',
          text: Mail.brief(anrede(k), [
            'wir möchten Sie offen informieren: Der Lieferant ' + l.name + ' hat den bestätigten Liefertermin für ' + (offenePos.map(p => p.name).join(', ')) + ' nicht eingehalten. Wir haben heute eine neue verbindliche Zusage eingefordert.',
            'Alle übrigen Positionen Ihres Auftrags sind ' + (db.lagerpositionen.filter(x => x.auftragId === a.id && x.status === 'eingetroffen').length ? 'bereits bei uns eingetroffen' : 'in Auslieferung') + '. Sobald wir den neuen Termin kennen, melden wir uns umgehend – voraussichtlich innert 5 Werktagen. Ihr Montagetermin wird erst festgelegt, wenn alles vollständig bei uns ist.',
            'Falls Sie eine Alternative wünschen (gleichwertiges Produkt ab Lager), beraten wir Sie gerne. Entschuldigen Sie die Umstände.'
          ])
        });
        Store.log('mahnung', 'Liefermahnung an ' + l.name + ' (' + b.nr + ') – Termin ' + Fmt.datum(termin) + ' verstrichen; Kunden-Info als Entwurf vorbereitet', a.id, '🚨');
        n++;
      }
      // Stufe 3: Eskalation am Werktag +6
      if (b.mahnstufe < 3 && heute >= D.plusWerktage(termin, 6)) {
        b.mahnstufe = 3;
        const m = Mail.anlegen(db, {
          an: l.eskalationEmail || l.email, anName: (l.name || '') + ' – Verkaufsleitung', art: 'eskalation', auftragId: a.id, bestellungId: b.id, automatisch: true,
          betreff: 'Eskalation: ' + ref + ' – ' + b.verzugTage + ' Werktage Verzug',
          text: Mail.brief('Sehr geehrte Damen und Herren', [
            'trotz Liefermahnung vom ' + Fmt.datum((b.mahnungen.find(x => x.stufe === 2) || { zeit: heute }).zeit.slice(0, 10)) + ' ist die Lieferung zur ' + ref + ' (bestätigter Termin ' + Fmt.datum(termin) + ') nicht eingetroffen:\n' + posText,
            'Wir bitten die Verkaufsleitung um eine verbindliche Lösung bis ' + Fmt.datum(D.plusWerktage(heute, 2)) + ': Liefertermin, Ersatzprodukt ab Lager oder Storno. Den verschobenen Montagetermin unseres Kunden und die daraus entstehenden Kosten behalten wir uns vor weiterzubelasten.',
            'Rückmeldung bitte an ' + db.betrieb.telefon + ' oder ' + Mail.link('l', b.token)
          ])
        });
        b.mahnungen.push({ stufe: 3, zeit: D.jetztIso(), mailId: m.id });
        Store.log('eskalation', 'Eskalation an ' + l.name + ' – ' + b.verzugTage + ' Werktage Verzug bei ' + b.nr + '. Aufgabe: Ersatzprodukt oder Termin verschieben', a.id, '🔥');
        n++;
      }
    });
    return n;
  },

  montagebereit(db) {
    let n = 0;
    db.auftraege.filter(a => ['bestellt', 'teilgeliefert'].includes(a.status)).forEach(a => { if (Dom.montagebereitPruefen(db, a)) n++; });
    return n;
  },

  /* ---- Rechnungen: Erinnerung +7, 1. Mahnung +21, 2. Mahnung +35 Tage nach Faelligkeit, als Entwuerfe ---- */
  rechnungen(db) {
    const heute = D.heute(); let n = 0;
    db.rechnungen.filter(r => r.art === 'schluss' && r.status !== 'bezahlt').forEach(r => {
      const a = db.auftraege.find(x => x.id === r.auftragId); const k = db.kunden.find(x => x.id === r.kundeId);
      const tage = D.diffTage(r.faellig, heute);
      const stufe = tage >= 35 ? 'mahnung2' : tage >= 21 ? 'mahnung1' : tage >= 7 ? 'erinnert' : null;
      const rang = { gestellt: 0, erinnert: 1, mahnung1: 2, mahnung2: 3 };
      if (!stufe || rang[stufe] <= rang[r.status]) return;
      r.status = stufe;
      const geb = stufe === 'mahnung1' ? (db.betrieb.mahngebuehr1 || 20) : stufe === 'mahnung2' ? (db.betrieb.mahngebuehr2 || 40) : 0;
      r.mahngebuehr = (r.mahngebuehr || 0) + geb;
      const frist = D.plus(heute, 10);
      const titel = stufe === 'erinnert' ? 'Zahlungserinnerung' : stufe === 'mahnung1' ? '1. Mahnung' : '2. Mahnung';
      const m = Mail.anlegen(db, {
        an: k && k.email, anName: Dom.kundeName(k), art: 'rechnung-mahnung', auftragId: r.auftragId, status: 'entwurf', automatisch: true, ki: stufe === 'erinnert',
        betreff: titel + ' – Rechnung ' + r.nr + (a ? ' (Auftrag ' + a.nr + ')' : ''),
        text: Mail.brief(anrede(k), stufe === 'erinnert' ? [
          'vielleicht ist es im Alltag untergegangen: Unsere Rechnung ' + r.nr + ' über ' + Fmt.chf(r.betrag) + ' war am ' + Fmt.datum(r.faellig) + ' fällig. Wir haben bisher keinen Zahlungseingang festgestellt.',
          'Falls die Zahlung bereits unterwegs ist, betrachten Sie dieses Schreiben bitte als gegenstandslos. Andernfalls bitten wir Sie, den Betrag bis ' + Fmt.datum(frist) + ' zu überweisen – am einfachsten per QR-Zahlteil: ' + Mail.link('k', a ? a.token : '')
        ] : stufe === 'mahnung1' ? [
          'trotz unserer Zahlungserinnerung ist die Rechnung ' + r.nr + ' über ' + Fmt.chf(r.betrag) + ' (fällig am ' + Fmt.datum(r.faellig) + ') noch offen.',
          'Wir bitten Sie, den Betrag zuzüglich Mahngebühr von ' + Fmt.chf(geb) + ', total ' + Fmt.chf(r.betrag + r.mahngebuehr) + ', bis ' + Fmt.datum(frist) + ' zu begleichen. Ab Fälligkeit schulden Sie einen Verzugszins von ' + Fmt.prozent(db.betrieb.verzugszins || 5) + '.'
        ] : [
          'die Rechnung ' + r.nr + ' über ' + Fmt.chf(r.betrag) + ' ist trotz Zahlungserinnerung und 1. Mahnung weiterhin offen.',
          'Wir setzen Ihnen eine letzte Frist bis ' + Fmt.datum(frist) + ' zur Zahlung von ' + Fmt.chf(r.betrag + r.mahngebuehr) + ' (inkl. Mahngebühren ' + Fmt.chf(r.mahngebuehr) + '). Bleibt die Zahlung aus, leiten wir ohne weitere Ankündigung die Betreibung ein.'
        ])
      });
      r.mahnungen.push({ stufe, zeit: D.jetztIso(), mailId: m.id, gebuehr: geb });
      Store.log('mahnung', titel + ' für ' + r.nr + ' als Entwurf vorbereitet (' + tage + ' Tage über Fälligkeit)', r.auftragId, '💸');
      n++;
    });
    return n;
  },

  /* ---- Offerten: Nachfassen nach 7 Tagen, Ablauf nach Gueltigkeit ---- */
  offerten(db) {
    const heute = D.heute(); let n = 0;
    db.offerten.forEach(o => {
      if (!['offen', 'unterschrieben'].includes(o.status)) return;
      const k = db.kunden.find(x => x.id === o.kundeId);
      if (heute > o.gueltigBis) {
        o.status = 'abgelaufen';
        Mail.anlegen(db, { an: k && k.email, anName: Dom.kundeName(k), art: 'kunde-offerte', offerteId: o.id, status: 'entwurf', automatisch: true, ki: true, betreff: 'Ihre Offerte ' + o.nr + ' – dürfen wir sie verlängern?', text: Mail.brief(anrede(k), ['unsere Offerte ' + o.nr + ' vom ' + Fmt.datum(o.datum) + ' ist abgelaufen. Gerne verlängern wir sie um 30 Tage zu denselben Konditionen – oder besprechen, was sich geändert hat.', 'Einfach kurz antworten oder anrufen. Wir freuen uns.']) });
        Store.log('offerte', 'Offerte ' + o.nr + ' abgelaufen – Verlängerungsangebot als Entwurf', null, '⌛');
        n++;
      } else if (o.status === 'offen' && !o.nachgefasstAm && D.diffTage(o.datum, heute) >= 7) {
        o.nachgefasstAm = heute;
        Mail.anlegen(db, { an: k && k.email, anName: Dom.kundeName(k), art: 'kunde-offerte', offerteId: o.id, status: 'entwurf', automatisch: true, ki: true, betreff: 'Haben Sie noch Fragen zu Ihrer Offerte ' + o.nr + '?', text: Mail.brief(anrede(k), ['vor einer Woche durften wir Ihnen die Offerte ' + o.nr + ' zustellen. Gibt es offene Fragen zu Produkten, Terminen oder zur Montage? Wir beantworten sie gerne – auch bei einem zweiten Besuch im Showroom.', 'Die Offerte ist bis ' + Fmt.datum(o.gueltigBis) + ' gültig: ' + Mail.link('k', o.token)]) });
        Store.log('offerte', 'Nachfass-Mail für Offerte ' + o.nr + ' als Entwurf', null, '💬');
        n++;
      }
    });
    return n;
  },

  /* ---- Termine: Erinnerung an den Kunden 2 Tage vorher ---- */
  termine(db) {
    const heute = D.heute(); let n = 0;
    db.termine.filter(t => ['vorgeschlagen', 'bestaetigt'].includes(t.status) && !t.erinnertAm && D.diffTage(heute, t.datum) <= 2 && t.datum >= heute).forEach(t => {
      const a = db.auftraege.find(x => x.id === t.auftragId); if (!a) return;
      const k = db.kunden.find(x => x.id === a.kundeId); const p = db.partner.find(x => x.id === t.partnerId);
      t.erinnertAm = heute;
      Mail.anlegen(db, { an: k && k.email, anName: Dom.kundeName(k), art: 'kunde-status', auftragId: a.id, automatisch: true, betreff: 'Erinnerung: Montage ' + Fmt.wochentag(t.datum, true) + ', ' + Fmt.datum(t.datum), text: Mail.brief(anrede(k), ['kurz zur Erinnerung: ' + (p ? p.name : 'unser Partnerbetrieb') + ' kommt am ' + Fmt.wochentag(t.datum, true) + ', ' + Fmt.datum(t.datum) + ' ab ' + t.von + ' Uhr' + (t.monteur ? ' (Monteur ' + t.monteur + ')' : '') + '.', 'Bitte räumen Sie das Bad frei und stellen Sie sicher, dass der Zugang möglich ist. Bei Fragen: ' + db.betrieb.telefon]) });
      Store.log('termin', 'Terminerinnerung an Kunde für ' + Fmt.datum(t.datum), a.id, '🔔');
      n++;
    });
    return n;
  }
};
