/* ==================================================================
   33 · Sync ueber Firestore, ohne Bibliothek
   Anonyme Anmeldung holt ein Token, danach wird der ganze Datenstand
   als ein Dokument geschrieben und im Takt gelesen. Damit sieht der
   PC den Scan des Handys. Voreingestellt ist das bestehende Projekt
   aus DACHWERK; die Sammlung ist waehlbar, damit die dort schon
   gesetzte Firestore-Regel ohne Aenderung weiterhilft.
   ================================================================== */
const Sync = {
  status: 'aus',      // aus · verbinde · an · fehler
  meldung: '',
  token: null,
  tokenZeit: 0,
  _t: null,
  _poll: null,
  letzteRev: 0,
  TAKT: 3000,

  cfg() { return (DB.betrieb && DB.betrieb.sync) || {}; },
  aktiv() { const c = Sync.cfg(); return !!(c.aktiv && c.projectId && c.apiKey && c.raum); },

  async start() {
    clearInterval(Sync._poll);
    if (!Sync.aktiv()) { Sync.setz('aus', 'Nur auf diesem Gerät'); return; }
    Sync.setz('verbinde', 'Verbinde …');
    try {
      await Sync.anmelden();
      await Sync.holen(true);
      Sync.setz('an', 'Verbunden');
      Sync._poll = setInterval(() => Sync.holen(false), Sync.TAKT);
    } catch (e) {
      Sync.setz('fehler', e.message || 'Verbindung fehlgeschlagen');
    }
  },

  stopp() { clearInterval(Sync._poll); Sync.setz('aus', 'Nur auf diesem Gerät'); },

  setz(st, msg) {
    Sync.status = st; Sync.meldung = msg || '';
    $$('.sync-slot').forEach(el => { el.innerHTML = Sync.anzeige(); });
  },

  anzeige() {
    const k = Sync.status === 'an' ? 'on' : Sync.status === 'fehler' ? 'off' : '';
    const t = Sync.status === 'an' ? 'Live verbunden' : Sync.status === 'verbinde' ? 'Verbinde …'
      : Sync.status === 'fehler' ? 'Sync-Fehler' : 'Nur dieses Gerät';
    return `<button class="sync ${k}" data-act="sync.info" title="${h(Sync.meldung)}"><span class="d"></span>${h(t)}</button>`;
  },

  async anmelden() {
    const c = Sync.cfg();
    if (Sync.token && Date.now() - Sync.tokenZeit < 45 * 60000) return Sync.token;
    const r = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + encodeURIComponent(c.apiKey), {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true })
    });
    const j = await r.json();
    if (!r.ok) {
      const m = (j.error && j.error.message) || 'Fehler';
      if (m === 'ADMIN_ONLY_OPERATION') throw new Error('Anonyme Anmeldung ist im Firebase-Projekt nicht aktiviert');
      throw new Error('Anmeldung am Sync fehlgeschlagen: ' + m);
    }
    Sync.token = j.idToken; Sync.tokenZeit = Date.now();
    return Sync.token;
  },

  url() {
    const c = Sync.cfg();
    return 'https://firestore.googleapis.com/v1/projects/' + encodeURIComponent(c.projectId) +
      '/databases/(default)/documents/' + encodeURIComponent(c.sammlung || 'dachwerk') + '/' + encodeURIComponent(c.raum);
  },

  /** Nur senden, wenn ein Sync eingerichtet ist. Gebuendelt, nicht bei jedem Tastendruck. */
  senden() {
    if (!Sync.aktiv() || Sync.status === 'fehler') return;
    clearTimeout(Sync._t);
    Sync._t = setTimeout(async () => {
      try {
        const tok = await Sync.anmelden();
        let daten = JSON.stringify(DB);
        if (daten.length > 900000) {          // Firestore erlaubt rund 1 MiB je Dokument
          const schlank = JSON.parse(daten);
          (schlank.auftraege || []).forEach(a => (a.fotos || []).forEach(f => { if (f.dataUrl && f.dataUrl.length > 20000) f.dataUrl = ''; }));
          daten = JSON.stringify(schlank);
        }
        const r = await fetch(Sync.url(), {
          method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tok },
          body: JSON.stringify({
            fields: {
              rev: { integerValue: String(DB.rev || 1) },
              geraet: { stringValue: DB.geraet || '' },
              zeit: { stringValue: new Date().toISOString() },
              daten: { stringValue: daten }
            }
          })
        });
        if (!r.ok) throw new Error('Schreiben fehlgeschlagen (' + r.status + (r.status === 403 ? ' – Firestore-Regel prüfen' : '') + ')');
        Sync.letzteRev = DB.rev || 1;
        if (Sync.status !== 'an') Sync.setz('an', 'Verbunden');
      } catch (e) { Sync.setz('fehler', e.message); }
    }, 700);
  },

  async holen(erst) {
    if (!Sync.aktiv()) return;
    try {
      const tok = await Sync.anmelden();
      const r = await fetch(Sync.url(), { headers: { Authorization: 'Bearer ' + tok } });
      if (r.status === 404) { if (erst) Sync.senden(); return; }
      if (!r.ok) throw new Error('Lesen fehlgeschlagen (' + r.status + ')');
      const j = await r.json();
      const f = j.fields || {};
      const rev = +(f.rev && f.rev.integerValue || 0);
      const geraet = f.geraet && f.geraet.stringValue;
      if (geraet === DB.geraet) return;                 // eigener Schreibvorgang
      if (rev <= (DB.rev || 0)) return;                 // nichts Neues
      const neu = JSON.parse(f.daten.stringValue);
      neu.geraet = DB.geraet;                            // eigene Geraete-Kennung behalten
      Store.ersetzen(neu);
      if (!erst) UI.toast('Stand von einem anderen Gerät übernommen', 'ok', { undo: false });
      if (Sync.status !== 'an') Sync.setz('an', 'Verbunden');
    } catch (e) { Sync.setz('fehler', e.message); }
  }
};
