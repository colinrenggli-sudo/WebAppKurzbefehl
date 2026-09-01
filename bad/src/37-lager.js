/* ==================================================================
   37 · Lager-App — Rahmen
   Handy zuerst: Kopf, Inhalt, vier Reiter unten. Auf dem grossen
   Bildschirm im Telefonrahmen mit Erklaerspalte daneben.
   Seiten: Fld.seiten['scan'](rest) -> html
   ================================================================== */
const Fld = {
  seiten: {},
  nachZeichnen: {},
  _route: '',

  zeichnen(t) {
    const route = t[0] || 'scan';
    Fld._route = route;
    const ich = Q.ich();
    const fn = Fld.seiten[route];
    document.documentElement.style.setProperty('--tint', DB.betrieb.farbe || '#0F7C8C');
    $('#fldTabs').innerHTML = Nav.ZIELE_LAGER.map(z => {
      const r = z.r.split('/')[1];
      return `<a class="fld-tab" href="#/${z.r}" ${route === r ? 'aria-current="page"' : ''}>${ic(z.i)}<span>${h(z.t)}</span></a>`;
    }).join('');
    if (!fn) { $('#fldBody').innerHTML = `<div class="fld-inner"><div class="empty"><b>Seite fehlt</b><p>${h(route)}</p></div></div>`; return; }
    const r = fn(t.slice(1), ich);
    $('#fldBody').innerHTML = r == null ? '' : r;
    $('#fldBody').scrollTop = 0;
    if (Fld.nachZeichnen[route]) Fld.nachZeichnen[route](t.slice(1));
    Fld.seite();
  },

  /** Kopfzeile: Titel, Untertitel, Knopf rechts. */
  kopf(titel, unter, rechts) {
    $('#fldHead').innerHTML = `<div style="min-width:0;flex:1"><h1>${h(titel)}</h1>${unter ? `<div class="sub">${h(unter)}</div>` : ''}</div>${rechts || ''}`;
  },

  /** Erklaerspalte neben dem Telefonrahmen (nur am grossen Bildschirm). */
  seite() {
    const s = Fld.erklaerung[Fld._route] || Fld.erklaerung.scan;
    $('#fldSide').innerHTML = `<h2>${h(s.titel)}</h2><p>${h(s.text)}</p><div class="fld-steps">${(s.schritte || []).map((x, i) =>
      `<div class="fld-step"><span class="n">${i + 1}</span><div><b>${h(x[0])}</b><small>${h(x[1])}</small></div></div>`).join('')}</div>`;
  },
  erklaerung: {},

  aktualisieren() { if (S.shell === 'lager' && S.benutzerId) Nav.zeichnen(); }
};
Store.horcher.push(grund => { if (S.shell === 'lager' && (grund === 'ersetzt' || grund === 'undo' || grund === 'auto')) Fld.aktualisieren(); });
