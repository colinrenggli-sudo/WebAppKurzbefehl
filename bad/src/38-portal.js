/* ==================================================================
   38 · Portale — Rahmen
   Kunde, Lieferant, Monteur und Partnerbetrieb kommen ueber Links
   mit Token herein (?k= ?l= ?m= ?p=). Kein Code, keine Navigation.
   Der QR-Scan (?scan=) gehoert in die Lager-App und verlangt den
   Lager-Code; der Link wird nach der Anmeldung weitergereicht.
   ================================================================== */
const Portal = {
  seiten: {},          // art -> (token) => { kopf, html, fuss } | null
  nachZeichnen: {},

  ausUrl(p) {
    const arten = { k: 'kunde', l: 'lieferant', m: 'monteur', p: 'partner' };
    for (const k in arten) {
      if (p.get(k)) { S.portal = { art: arten[k], token: p.get(k) }; S.shell = 'portal'; document.body.dataset.shell = 'portal'; Portal.zeichnen(); Sync.start(); return true; }
    }
    if (p.get('scan')) {
      S.scan = p.get('scan');
      history.replaceState(null, '', location.pathname);
      const b = S.benutzerId && Q.benutzer(S.benutzerId);
      if (b && b.rolle === 'lager') { S.anmelden(b, 'l/scan/' + encodeURIComponent(S.scan)); Sync.start(); return true; }
      S.benutzerId = null; S.shell = 'none'; document.body.dataset.shell = 'none';
      Login.ziel = 'l/scan/' + encodeURIComponent(S.scan);
      Login.hinweis('QR-Code erkannt – mit dem Lager-Code anmelden');
      Sync.start();
      return true;
    }
    return false;
  },

  zeichnen() {
    const s = S.portal; if (!s) return;
    const fn = Portal.seiten[s.art];
    const r = fn ? fn(s.token) : null;
    const b = DB.betrieb;
    $('#poHead').innerHTML = `<div class="logo"><svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 34h40v6a12 12 0 0 1-12 12H24a12 12 0 0 1-12-12v-6z" fill="#fff"/><path d="M18 34V16a5 5 0 0 1 10 0" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/></svg></div>
      <div class="nm"><b>${h(b.name)}</b><small>${h(b.strasse || '')}${b.strasse ? ', ' : ''}${h(b.plz || '')} ${h(b.ort || '')}</small></div><div class="sp"></div>${(r && r.kopf) || ''}`;
    $('#poBody').innerHTML = r ? r.html : `<div class="po-hero"><div class="eyebrow">Link ungültig</div><h1>Dieser Link ist nicht (mehr) gültig.</h1><p>Bitte melden Sie sich bei ${h(b.name)}${b.telefon ? ' unter ' + h(b.telefon) : ''}.</p></div>`;
    $('#poFoot').innerHTML = (r && r.fuss) || `${h(b.name)} · ${h(b.telefon || '')} · ${h(b.email || '')}<br><a href="${location.pathname}">Zur Anmeldung</a>`;
    document.documentElement.style.setProperty('--tint', b.farbe || '#0F7C8C');
    if (r && Portal.nachZeichnen[s.art]) Portal.nachZeichnen[s.art](s.token);
  }
};
Store.horcher.push(grund => { if (S.shell === 'portal' && (grund === 'ersetzt' || grund === 'auto')) Portal.zeichnen(); });
