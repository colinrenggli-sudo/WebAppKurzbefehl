/* ==================================================================
   36 · Konsole — Rahmen
   Seitenleiste, Kopfzeile, Seitenregister. Jede Seite ist eine
   Funktion Desk.seiten[route](rest) und liefert HTML fuer #deskview;
   Werkzeuge rechts oben ueber Desk.tools(html).
   ================================================================== */
const Desk = {
  seiten: {},           // route -> (rest) => html | Promise
  titel: {},            // route -> Titel in der Kopfzeile
  _route: '',

  zeichnen(t) {
    const route = t[0] || 'uebersicht';
    Desk._route = route;
    Desk.seitenleiste();
    const ich = Q.ich();
    if (ich) {
      $('#meAva').textContent = ich.kuerzel; $('#meAva').style.background = ich.farbe;
      $('#meName').textContent = ich.name; $('#meRolle').textContent = ich.funktion;
    }
    $('#sideFirma').textContent = DB.betrieb.name || 'BADWERK';
    $('#sideOrt').textContent = DB.betrieb.ort || '';
    $('#sideLogo').textContent = (DB.betrieb.kuerzel || 'BW');
    document.documentElement.style.setProperty('--tint', DB.betrieb.farbe || '#0F7C8C');
    const fn = Desk.seiten[route];
    const view = $('#deskview');
    $('#tbTools').innerHTML = (typeof Uebersicht !== 'undefined' ? Uebersicht.uhrWidget() : '');
    $('#tbTitel').textContent = Desk.titel[route] || (Nav.ZIELE_DESK.find(z => z.r === route) || {}).t || 'BADWERK';
    document.body.classList.toggle('vollbild', route === 'offerte');
    if (!fn) {
      view.innerHTML = `<div class="pg"><div class="empty"><span class="ic">${ic('i-info')}</span><b>Diese Seite gibt es nicht</b><p>${h(route)}</p></div></div>`;
      return;
    }
    const r = fn(t.slice(1));
    if (r && r.then) r.then(html => { if (Desk._route === route) view.innerHTML = html; });
    else view.innerHTML = r == null ? '' : r;
    view.scrollTop = 0;
    if (Desk.nachZeichnen[route]) Desk.nachZeichnen[route](t.slice(1));
    document.body.classList.remove('side-offen');
  },
  nachZeichnen: {},     // route -> fn nach dem Einsetzen (Canvas, Fokus, Karten)

  tools(html) { $('#tbTools').innerHTML = html + (typeof Uebersicht !== 'undefined' ? Uebersicht.uhrWidget() : ''); },
  titelSetzen(t, unter) { $('#tbTitel').innerHTML = h(t) + (unter ? ` <span class="sub">${h(unter)}</span>` : ''); },

  seitenleiste() {
    const nav = $('#sideNav');
    nav.innerHTML = Nav.ZIELE_DESK.map(z => {
      if (z.g) return `<div class="grp">${h(z.g)}</div>`;
      let n = 0; try { n = z.zahl ? z.zahl() : 0; } catch (e) { n = 0; }
      return `<a class="nav-i" href="#/${z.r}" ${Desk._route === z.r ? 'aria-current="page"' : ''}>
        <span class="ic">${ic(z.i)}</span><span class="t">${h(z.t)}</span>
        ${n ? `<span class="cnt ${z.heiss ? 'hot' : ''}">${n}</span>` : ''}</a>`;
    }).join('');
  },

  /** Neu zeichnen, wenn sich Daten aendern (Sync, Undo, Automationen). */
  aktualisieren() { if (S.shell === 'desk' && S.benutzerId) Nav.zeichnen(); }
};
Store.horcher.push(grund => { if (S.shell === 'desk' && (grund === 'ersetzt' || grund === 'undo' || grund === 'auto')) Desk.aktualisieren(); });

Act.menu = {
  side() { document.body.classList.toggle('side-offen'); },
  me() {
    const ich = Q.ich();
    UI.dialog({
      titel: ich.name, unter: ich.funktion, weite: 'slim',
      inhalt: `<div class="stack">
        <div class="row" style="gap:8px"><span class="lbl">Farbschema</span>
          <div class="seg">${[['auto', 'System'], ['light', 'Hell'], ['dark', 'Dunkel']].map(([v, t]) =>
            `<button data-act="menu.thema" data-v="${v}" ${(localStorage.getItem('badwerk.thema') || 'auto') === v ? 'aria-selected="true"' : ''}>${t}</button>`).join('')}</div></div>
        <div class="sync-slot">${Sync.anzeige()}</div>
      </div>`,
      aktionen: [{ text: 'Abmelden', art: 'danger soft', fn: () => S.abmelden() }, { text: 'Schliessen', art: 'primary' }]
    });
  },
  thema(el) {
    const v = el.dataset.v;
    localStorage.setItem('badwerk.thema', v);
    if (v === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = v;
    $$('[data-act="menu.thema"]').forEach(b => b.toggleAttribute('aria-selected', b.dataset.v === v));
  }
};
