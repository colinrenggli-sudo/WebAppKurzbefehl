/* ==================================================================
   43 · Postausgang
   Kein Server, also verschickt die App nichts selbst. Jede Mail, ob
   von Hand oder von einer Automation, landet als Eintrag in DB.post:
   sichtbar, pruefbar, im Mailprogramm zu oeffnen (mailto) und mit
   einem Klick als „gesendet" markierbar. Automationen erzeugen
   entweder fertige Mails (status 'gesendet', automatisch: true) oder
   Entwuerfe, die ein Mensch freigibt (status 'entwurf').
   Empfaenger-Links (Portale) stecken im Text – so laesst sich jede
   Gegenseite in der Vorfuehrung oeffnen.
   ================================================================== */
const Mail = {
  /** Link auf die eigene App mit Parameter, z. B. Mail.link('k', token). */
  link(param, wert) {
    const basis = (DB.betrieb && DB.betrieb.basisUrl) || (location.origin + location.pathname);
    return basis.replace(/[?#].*$/, '') + '?' + param + '=' + encodeURIComponent(wert);
  },

  /**
   * Mail anlegen. o: { an, anName, betreff, text, art, auftragId, bestellungId, status, automatisch, ki, anhaenge }
   * art: bestellung · mahnung · kunde-status · kunde-verzug · kunde-termin · monteur · rechnung · rechnung-mahnung · partner · offerte · sonstiges
   * Gibt die Mail zurueck. Muss innerhalb von Store.aendern() aufgerufen werden.
   */
  anlegen(db, o) {
    const m = {
      id: uid('m'), zeit: D.jetztIso(), von: db.betrieb.email || 'info@showroom.ch',
      an: o.an || '', anName: o.anName || '', betreff: o.betreff || '', text: o.text || '',
      art: o.art || 'sonstiges', auftragId: o.auftragId || null, bestellungId: o.bestellungId || null,
      status: o.status || 'gesendet',              // entwurf · gesendet
      automatisch: !!o.automatisch, ki: !!o.ki, anhaenge: o.anhaenge || [],
      gesendetAm: (o.status || 'gesendet') === 'gesendet' ? D.jetztIso() : null,
      gelesen: false
    };
    db.post.unshift(m);
    return m;
  },

  senden(id) {
    Store.aendern('E-Mail gesendet', db => {
      const m = db.post.find(x => x.id === id); if (!m) return;
      m.status = 'gesendet'; m.gesendetAm = D.jetztIso();
      Store.log('mail', 'E-Mail an ' + (m.anName || m.an) + ': ' + m.betreff, m.auftragId, '✉️');
    });
  },

  mailto(m) {
    return 'mailto:' + encodeURIComponent(m.an) + '?subject=' + encodeURIComponent(m.betreff) + '&body=' + encodeURIComponent(m.text);
  },

  artText(art) {
    return ({
      bestellung: 'Bestellung an Lieferant', mahnung: 'Lieferfrist-Nachfrage', eskalation: 'Eskalation Lieferant',
      'kunde-status': 'Statusinfo an Kunde', 'kunde-verzug': 'Verzugsinfo an Kunde', 'kunde-termin': 'Terminwahl an Kunde',
      'kunde-offerte': 'Offerte an Kunde', 'kunde-bestaetigung': 'Auftragsbestätigung an Kunde',
      monteur: 'Montageauftrag an Partnerbetrieb', rechnung: 'Rechnung an Kunde', 'rechnung-mahnung': 'Zahlungserinnerung',
      partner: 'Partnerbetrieb', showroom: 'Showroom-Termin', bewertung: 'Bewertungsanfrage', sonstiges: 'E-Mail'
    })[art] || 'E-Mail';
  },

  /** Text-Grundgeruest mit Anrede, Absatz, Gruss und Signatur. */
  brief(anredeText, absaetze, gruss) {
    const b = DB.betrieb;
    return [anredeText, '', ...absaetze.flatMap(a => [a, '']), gruss || 'Freundliche Grüsse', b.name, (b.strasse || '') + ', ' + (b.plz || '') + ' ' + (b.ort || ''), b.telefon || '', b.email || ''].join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }
};
