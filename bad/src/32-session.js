/* ==================================================================
   32 · Sitzung und Anmeldung
   Der Code entscheidet ueber die Person und damit ueber die Oberflaeche:
     Inhaber, Verkauf, Buchhaltung -> Konsole am PC (desk)
     Lager                         -> Lager-App am Handy (lager)
   Portale (Kunde, Lieferant, Monteur, Partner) brauchen keinen Code,
   sie oeffnen sich ueber Links mit Token (siehe Boot).
   Codes duerfen 4 bis 6 Stellen haben; angemeldet wird, sobald der
   getippte Code genau einer Person gehoert und kein anderer Code so
   beginnt – 1234 und 98765 funktionieren also nebeneinander.
   ================================================================== */
const S = {
  benutzerId: null,
  shell: 'none',        // none · desk · lager · portal
  route: '',
  ui: {},               // fluechtige Ansichtszustaende (Filter, Tabs, Entwuerfe)
  code: '',
  portal: null,         // { art: 'kunde'|'lieferant'|'monteur'|'partner', token }

  laden() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY_S) || 'null');
      if (s && s.benutzerId) { S.benutzerId = s.benutzerId; S.shell = s.shell; }
    } catch (e) { /* egal */ }
  },
  sichern() {
    try { localStorage.setItem(KEY_S, JSON.stringify({ benutzerId: S.benutzerId, shell: S.shell })); } catch (e) { }
  },
  shellFuer(b) { return b.rolle === 'lager' ? 'lager' : 'desk'; },
  anmelden(b, ziel) {
    S.benutzerId = b.id;
    S.shell = S.shellFuer(b);
    S.ui = {};
    S.sichern();
    document.body.dataset.shell = S.shell;
    $('#login').classList.add('hide');
    Store.log('anmeldung', b.name + ' hat sich angemeldet', null, '🔑');
    Store.speichern();
    const start = ziel || (S.shell === 'desk' ? (b.start || 'uebersicht') : 'l/scan');
    if (location.hash === '#/' + start) Nav.zeichnen(); else Nav.gehe(start);
  },
  abmelden() {
    S.benutzerId = null; S.shell = 'none'; S.code = ''; S.ui = {};
    S.sichern();
    document.body.dataset.shell = 'none';
    $('#login').classList.remove('hide');
    Login.zeichnen();
    history.replaceState(null, '', location.pathname + location.search);
  },
  darf(recht) {
    const b = Q.ich();
    if (!b) return false;
    if (b.rolle === 'inhaber') return true;
    return (b.rechte || []).includes(recht);
  }
};

const Login = {
  zeichnen() {
    const box = $('#lgUsers');
    const nutzer = (DB.benutzer || []).filter(b => b.aktiv !== false);
    const ober = { desk: 'Konsole am PC', lager: 'Lager-App am Handy' };
    box.innerHTML = '<span class="lbl">Demo – zum Anmelden antippen</span>' + nutzer.map(b => `
      <button class="lg-user" data-code="${h(b.code)}">
        <span class="ava" style="background:${h(b.farbe)}">${h(b.kuerzel)}</span>
        <span class="nm"><b>${h(b.name)}</b><small>${h(b.funktion)} · ${ober[S.shellFuer(b)]}</small></span>
        <span class="cd">${h(b.code)}</span>
      </button>`).join('');
    $('#lgTitel').textContent = 'BADWERK';
    $('#lgUnter').textContent = (DB.betrieb && DB.betrieb.name) ? DB.betrieb.name + ' · Showroom-System' : 'Vom Showroom bis zur Rechnung';
    Login.punkte();
  },
  punkte() {
    const n = Math.max(4, S.code.length);
    const dots = $('#lgDots');
    if (dots.children.length !== n) dots.innerHTML = Array.from({ length: n }, () => '<span></span>').join('');
    $$('#lgDots span').forEach((s, i) => s.classList.toggle('on', i < S.code.length));
  },
  tippen(k) {
    if (k === 'clear') { S.code = ''; $('#lgMsg').textContent = 'Code eingeben'; $('#lgMsg').className = 'lg-msg'; }
    else if (k === 'back') S.code = S.code.slice(0, -1);
    else if (S.code.length < 6) S.code += k;
    Login.punkte();
    const codes = (DB.benutzer || []).filter(b => b.aktiv !== false).map(b => b.code);
    const treffer = codes.includes(S.code);
    const praefix = codes.some(c => c !== S.code && c.indexOf(S.code) === 0);
    if (treffer && !praefix) setTimeout(Login.pruefen, 130);
    else if (S.code.length >= 6 || (S.code.length >= 4 && !praefix && !treffer)) setTimeout(Login.pruefen, 130);
  },
  pruefen() {
    const b = (DB.benutzer || []).find(x => x.code === S.code && x.aktiv !== false);
    if (b) { S.code = ''; Login.punkte(); S.anmelden(b, Login.ziel); Login.ziel = null; return; }
    const c = $('.lg-card'); c.classList.add('shake');
    setTimeout(() => c.classList.remove('shake'), 460);
    const m = $('#lgMsg'); m.textContent = 'Code unbekannt – bitte nochmals'; m.className = 'lg-msg err';
    S.code = ''; Login.punkte();
    if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
  },
  /** Hinweis, wenn ein Link (z. B. QR-Scan) erst nach der Anmeldung weitergeht. */
  hinweis(text) { const m = $('#lgMsg'); m.textContent = text; m.className = 'lg-msg'; }
};
