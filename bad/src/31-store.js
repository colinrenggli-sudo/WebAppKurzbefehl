/* ==================================================================
   31 · Datenhaltung
   Ein einziges Objekt im localStorage. Jede Aenderung laeuft ueber
   Store.aendern(), damit Speichern, Rueckgaengig, Verlauf und Sync
   zusammenpassen. Die Demo-Uhr (Zeitsprung) lebt ebenfalls hier.
   ================================================================== */
const KEY = 'badwerk.v1';
const KEY_S = 'badwerk.sitzung.v1';
let DB = null;

const Store = {
  _t: null,
  _verlauf: [],
  horcher: [],

  laden() {
    let roh = null;
    try { roh = localStorage.getItem(KEY); } catch (e) { /* Privater Modus */ }
    if (roh) {
      try {
        const d = JSON.parse(roh);
        if (d && d.version === BWSeed.VERSION && d.auftraege) { DB = d; return false; }
        console.warn('Gespeicherte Daten stammen aus einer älteren Version – Demodaten werden neu erzeugt.');
      } catch (e) { console.warn('Gespeicherte Daten unlesbar, starte neu.', e); }
    }
    DB = Store.frisch();
    Store.speichern();
    return true;
  },

  frisch() {
    const d = BWSeed.build();
    d.version = BWSeed.VERSION;
    d.rev = 1;
    d.geraet = uid('g');
    return d;
  },

  speichern() {
    clearTimeout(Store._t);
    Store._t = setTimeout(() => {
      try { localStorage.setItem(KEY, JSON.stringify(DB)); }
      catch (e) {
        console.warn('Speichern fehlgeschlagen', e);
        UI.toast('Speicher voll – älteste Bilder werden entfernt', 'warn');
        Store.bilderKuerzen();
        try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e2) { /* aufgeben */ }
      }
    }, 240);
  },

  /** Notbremse bei vollem Speicher: Bilddaten weichen, Eintraege bleiben. */
  bilderKuerzen() {
    const alle = [];
    (DB.auftraege || []).forEach(a => (a.fotos || []).forEach(f => { if (f.dataUrl) alle.push(f); }));
    alle.sort((x, y) => String(x.zeit).localeCompare(String(y.zeit)));
    alle.slice(0, Math.max(1, Math.ceil(alle.length / 3))).forEach(f => { f.dataUrl = ''; f.ausgelagert = true; });
  },

  /**
   * Jede Aenderung an den Daten. fn bekommt DB und veraendert es direkt.
   * titel erscheint im Rueckgaengig-Hinweis; opt === false unterdrueckt ihn.
   */
  aendern(titel, fn, opt) {
    const vorher = JSON.stringify(DB);
    let r;
    try { r = fn(DB); }
    catch (e) { console.error('Änderung fehlgeschlagen:', titel, e); UI.toast('Das hat nicht geklappt: ' + e.message, 'err'); return null; }
    DB.rev = (DB.rev || 0) + 1;
    Store._verlauf.push({ titel, daten: vorher });
    if (Store._verlauf.length > 30) Store._verlauf.shift();
    Store.speichern();
    Sync.senden();
    Store.horcher.forEach(f => { try { f(titel); } catch (e) { console.error(e); } });
    if (opt !== false && titel) UI.toast(titel, 'ok', { undo: true });
    return r;
  },

  zurueck() {
    const v = Store._verlauf.pop();
    if (!v) return UI.toast('Nichts zum Rückgängigmachen', 'warn');
    DB = JSON.parse(v.daten);
    Store.speichern(); Sync.senden();
    Store.horcher.forEach(f => f('undo'));
    UI.toast('„' + v.titel + '" rückgängig gemacht', 'ok');
    Nav.zeichnen();
  },

  ersetzen(neu) {
    DB = neu;
    Store.speichern();
    Store.horcher.forEach(f => f('ersetzt'));
    Nav.zeichnen();
  },

  zuruecksetzen() {
    const sync = DB && DB.betrieb && DB.betrieb.sync;
    DB = Store.frisch();
    if (sync) DB.betrieb.sync = sync;      // Verbindung ueberlebt das Zuruecksetzen
    Store.speichern(); Sync.senden();
    Nav.zeichnen();
  },

  /** Ereignis in den Aktivitaetsstrom (und optional in den Verlauf eines Auftrags). */
  log(typ, text, auftragId, icon) {
    const e = { id: uid('e'), zeit: D.jetztIso(), benutzerId: (typeof S !== 'undefined' && S.benutzerId) || null, typ, text, auftragId: auftragId || null, icon: icon || '•' };
    DB.ereignisse.unshift(e);
    if (DB.ereignisse.length > 400) DB.ereignisse.length = 400;
    if (auftragId) {
      const a = (DB.auftraege || []).find(x => x.id === auftragId);
      if (a) { (a.verlauf = a.verlauf || []).unshift({ zeit: e.zeit, typ, text, icon: e.icon, benutzerId: e.benutzerId }); }
    }
    return e;
  }
};

/* ------------------------------------------------------------------
   Demo-Uhr. Die App rechnet ueberall mit D.heute()/D.jetztIso(); beide
   laufen ueber Uhr.jetzt(), das den gespeicherten Zeitsprung addiert.
   So loesen Lieferfrist-Mahnungen, Eskalationen und Zahlungsfristen
   in der Vorfuehrung sichtbar aus, ohne auf den Kalender zu warten.
   ------------------------------------------------------------------ */
const Uhr = {
  _seed: null,        // waehrend BWSeed.build(): fester Zeitversatz in Tagen, um Historie zu erzeugen
  offsetTage() { if (Uhr._seed != null) return Uhr._seed; return (DB && DB.uhr && DB.uhr.offsetTage) || 0; },
  jetzt() { return new Date(Date.now() + Uhr.offsetTage() * 864e5); },
  /** Zeitsprung um n Tage (auch negativ). Loest danach die Automationen aus. */
  springen(n) {
    Store.aendern(n > 0 ? 'Demo-Uhr: ' + n + (n === 1 ? ' Tag' : ' Tage') + ' vorgespult' : 'Demo-Uhr zurückgestellt', db => {
      db.uhr = db.uhr || { offsetTage: 0 };
      db.uhr.offsetTage = n === 0 ? 0 : (db.uhr.offsetTage || 0) + n;
      Store.log('uhr', n === 0 ? 'Demo-Uhr auf heute zurückgestellt' : 'Demo-Uhr: ' + (n > 0 ? '+' : '') + n + ' Tage → ' + Fmt.datum(D.heute()), null, '⏱');
    }, false);
    if (typeof Auto !== 'undefined') Auto.laufen('uhr');
    Nav.zeichnen();
  }
};

/* — Zugriffshelfer. Kurz, weil sie ueberall gebraucht werden. — */
const Q = {
  benutzer: id => DB.benutzer.find(x => x.id === id),
  kunde: id => DB.kunden.find(x => x.id === id),
  objekt: id => DB.objekte.find(x => x.id === id),
  artikel: id => DB.artikel.find(x => x.id === id),
  lieferant: id => DB.lieferanten.find(x => x.id === id),
  offerte: id => DB.offerten.find(x => x.id === id),
  auftrag: id => DB.auftraege.find(x => x.id === id),
  bestellung: id => DB.bestellungen.find(x => x.id === id),
  lagerposition: id => DB.lagerpositionen.find(x => x.id === id),
  termin: id => DB.termine.find(x => x.id === id),
  rechnung: id => DB.rechnungen.find(x => x.id === id),
  mail: id => DB.post.find(x => x.id === id),
  partner: id => DB.partner.find(x => x.id === id),
  showroomTermin: id => DB.showroomTermine.find(x => x.id === id),
  ich: () => DB.benutzer.find(x => x.id === S.benutzerId) || null,
  /** Objekte per Token (Portale): Offerte ueber Kunden-Token, Bestellung ueber Lieferanten-Token, Termin ueber Monteur-Token, Partner ueber Partner-Token. */
  offerteMitToken: t => DB.offerten.find(o => o.token === t) || (a => a ? DB.offerten.find(o => o.id === a.offerteId) : null)(DB.auftraege.find(a => a.token === t)),
  auftragMitToken: t => DB.auftraege.find(a => a.token === t),
  bestellungMitToken: t => DB.bestellungen.find(b => b.token === t),
  terminMitToken: t => DB.termine.find(x => x.token === t),
  partnerMitToken: t => DB.partner.find(p => p.token === t),
  lagerpositionMitCode: c => DB.lagerpositionen.find(l => l.code === c),
  /** Alle Bestellungen, Lagerpositionen, Termine, Rechnungen, Mails eines Auftrags. */
  bestellungenVon: aid => DB.bestellungen.filter(b => b.auftragId === aid),
  lagerpositionenVon: aid => DB.lagerpositionen.filter(l => l.auftragId === aid),
  termineVon: aid => DB.termine.filter(t => t.auftragId === aid),
  rechnungenVon: aid => DB.rechnungen.filter(r => r.auftragId === aid),
  postVon: aid => DB.post.filter(m => m.auftragId === aid),
  offerteVon: aid => { const a = Q.auftrag(aid); return a ? Q.offerte(a.offerteId) : null; }
};
