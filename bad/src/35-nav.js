/* ==================================================================
   35 · Wegfuehrung und Aktionen
   Eine Route, drei Oberflaechen. Die Adresse in der Zeile macht jede
   Ansicht verlinkbar. Klicks auf [data-act="ns.fn"] landen zentral im
   Aktionsregister Act – jedes Modul haengt dort seinen Namensraum an.
   ================================================================== */
const Nav = {
  // Konsole: Gruppen und Ziele. zahl() liefert die Kennzahl am Eintrag, heiss faerbt sie rot.
  ZIELE_DESK: [
    { g: 'Heute' },
    { r: 'uebersicht', t: 'Übersicht', i: 'i-raster' },
    { r: 'auftraege', t: 'Aufträge', i: 'i-liste', zahl: () => DB.auftraege.filter(a => !['archiviert', 'storniert'].includes(a.status)).length },
    { r: 'offerten', t: 'Offerten', i: 'i-doc', zahl: () => DB.offerten.filter(o => ['entwurf', 'offen'].includes(o.status)).length },
    { g: 'Showroom' },
    { r: 'offerte', t: 'Neue Offerte (Tablet)', i: 'i-tablet' },
    { r: 'showroom', t: 'Showroom-Termine', i: 'i-showroom', zahl: () => DB.showroomTermine.filter(t => t.status === 'angefragt').length, heiss: true },
    { r: 'kunden', t: 'Kunden & Objekte', i: 'i-haus' },
    { g: 'Beschaffung' },
    { r: 'bestellungen', t: 'Lieferanten & Bestellungen', i: 'i-lkw', zahl: () => DB.bestellungen.filter(b => ['gesendet', 'gemahnt', 'eskaliert'].includes(b.status)).length },
    { r: 'lager', t: 'Lager & QR-Codes', i: 'i-qr', zahl: () => DB.lagerpositionen.filter(l => l.status === 'eingetroffen').length },
    { r: 'post', t: 'Postausgang', i: 'i-mail', zahl: () => DB.post.filter(m => m.status === 'entwurf').length, heiss: true },
    { g: 'Ausführung' },
    { r: 'termine', t: 'Termine & Montage', i: 'i-kalender' },
    { r: 'partner', t: 'Partnerbetriebe', i: 'i-partner' },
    { g: 'Abrechnung' },
    { r: 'rechnungen', t: 'Rechnungen', i: 'i-franken', zahl: () => DB.rechnungen.filter(r => ['gestellt', 'mahnung1', 'mahnung2'].includes(r.status) && r.faellig < D.heute()).length, heiss: true },
    { r: 'archiv', t: 'Archiv', i: 'i-archiv' },
    { g: 'Einrichtung' },
    { r: 'artikel', t: 'Artikel & Stücklisten', i: 'i-badewanne' },
    { r: 'einstellungen', t: 'Einstellungen', i: 'i-zahnrad' }
  ],
  ZIELE_LAGER: [
    { r: 'l/scan', t: 'Scannen', i: 'i-qr' },
    { r: 'l/erwartet', t: 'Erwartet', i: 'i-lkw' },
    { r: 'l/auftraege', t: 'Aufträge', i: 'i-paket' },
    { r: 'l/mehr', t: 'Mehr', i: 'i-mehr' }
  ],

  gehe(r) { location.hash = '#/' + String(r).replace(/^#?\/?/, ''); },
  zurueck() { if (history.length > 1) history.back(); else Nav.gehe(S.shell === 'desk' ? 'uebersicht' : 'l/scan'); },

  teile() {
    const p = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
    if (p.length) return p;
    return S.shell === 'lager' ? ['l', 'scan'] : ['uebersicht'];
  },

  zeichnen() {
    if (S.shell === 'portal') { Portal.zeichnen(); return; }
    if (!S.benutzerId) return;
    const t = Nav.teile();
    if (S.shell === 'lager') {
      if (t[0] !== 'l') { Nav.gehe('l/scan'); return; }
      Fld.zeichnen(t.slice(1));
    } else {
      if (t[0] === 'l') { Nav.gehe('uebersicht'); return; }
      Desk.zeichnen(t);
    }
  }
};
window.addEventListener('hashchange', Nav.zeichnen);

/* — Aktionsregister. Module haengen Namensraeume an: Act.offerte = { ... } — */
const Act = {
  run(name, el, ev) {
    const i = name.indexOf('.');
    const ns = i < 0 ? name : name.slice(0, i), fn = i < 0 ? 'run' : name.slice(i + 1);
    const o = Act[ns];
    if (!o || typeof o[fn] !== 'function') { console.warn('Unbekannte Aktion', name); return; }
    try { const r = o[fn](el, ev); if (r && r.catch) r.catch(e => { console.error(e); UI.toast('Das hat nicht geklappt: ' + e.message, 'err'); }); }
    catch (e) { console.error('Aktion', name, e); UI.toast('Das hat nicht geklappt: ' + e.message, 'err'); }
  },
  store: { undo() { Store.zurueck(); } },
  nav: { gehe(el) { Nav.gehe(el.dataset.r); }, zurueck() { Nav.zurueck(); } },
  sync: {
    info() {
      const c = Sync.cfg();
      UI.dialog({
        titel: 'Live-Verbindung', weite: 'slim',
        inhalt: `<p style="font-size:14px;line-height:1.55;color:var(--txt-2)">${Sync.status === 'an'
          ? 'Dieses Gerät ist mit dem Raum <b>' + h(c.raum) + '</b> verbunden. Was hier passiert, sehen die anderen Geräte in wenigen Sekunden – zum Beispiel ein Scan am Handy im Auftrag am PC.'
          : Sync.status === 'fehler' ? 'Die Verbindung ist gestört: ' + h(Sync.meldung) + '. In den Einstellungen prüfen.'
            : 'Die Daten bleiben nur auf diesem Gerät. In den Einstellungen lässt sich die Live-Verbindung einschalten, damit PC, Tablet und Handy denselben Stand sehen.'}</p>`,
        aktionen: [{ text: 'Schliessen' }, { text: 'Einstellungen', art: 'primary', fn: () => Nav.gehe('einstellungen') }]
      });
    }
  }
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  if (el.tagName === 'A' && el.getAttribute('href') && !el.dataset.act) return;
  e.preventDefault();
  Act.run(el.dataset.act, el, e);
});
document.addEventListener('change', e => {
  const el = e.target.closest('[data-change]');
  if (el) Act.run(el.dataset.change, el, e);
});
document.addEventListener('input', e => {
  const el = e.target.closest('[data-input]');
  if (el) Act.run(el.dataset.input, el, e);
});
