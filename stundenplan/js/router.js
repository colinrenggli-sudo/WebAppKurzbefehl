/* STUNDENWERK · router.js — Hash-Routing, Navigation, Seitentitel.
   Routen: #/dashboard  #/generator  #/stundenplan?view=klasse&id=…  #/klassen[/id]  #/lehrpersonen[/id]  #/raeume[/id]
           #/lehrgaenge[/id]  #/faecher  #/kalender  #/chat  #/hauswart  #/stellvertretung  #/auswertung  #/einstellungen  #/portal
   Eine Ansicht registriert sich als SW.views[name] = { title, render(container, params), manualRefresh? }
   params = { id, query: {…}, path: [...] }.  SW.router.go('#/klassen/abc'), SW.router.refresh(), SW.router.current
*/
(function () {
  const SW = (globalThis.SW = globalThis.SW || {});
  const h = SW.h;
  SW.views = SW.views || {};

  const NAV = [
    { group: 'Planung', items: [
      { route: 'dashboard', label: 'Dashboard', icon: 'home' },
      { route: 'generator', label: 'Generator', icon: 'wand' },
      { route: 'stundenplan', label: 'Stundenplan', icon: 'grid' },
    ] },
    { group: 'Stammdaten', items: [
      { route: 'klassen', label: 'Klassen', icon: 'users', count: 'classes' },
      { route: 'lehrpersonen', label: 'Lehrpersonen', icon: 'user', count: 'teachers' },
      { route: 'raeume', label: 'Räume', icon: 'door', count: 'rooms' },
      { route: 'lehrgaenge', label: 'Lehrgänge', icon: 'layers', count: 'curricula' },
      { route: 'faecher', label: 'Fächer', icon: 'book', count: 'subjects' },
    ] },
    { group: 'Pro', items: [
      { route: 'kalender', label: 'Kalender & Arbeitszeit', icon: 'calendar', pro: 'calendar' },
      { route: 'chat', label: 'Team-Chat', icon: 'chat', pro: 'chat' },
      { route: 'hauswart', label: 'Hauswart & Events', icon: 'broom', pro: 'facility' },
      { route: 'stellvertretung', label: 'Stellvertretungen', icon: 'swap', pro: 'substitutes' },
      { route: 'auswertung', label: 'Auswertungen', icon: 'chart', pro: 'analytics' },
    ] },
    { group: 'System', items: [
      { route: 'einstellungen', label: 'Einstellungen', icon: 'settings' },
    ] },
  ];
  const NAV_TEACHER = [
    { group: 'Mein Bereich', items: [
      { route: 'portal', label: 'Mein Stundenplan', icon: 'grid' },
      { route: 'kalender', label: 'Kalender & Arbeitszeit', icon: 'calendar', pro: 'calendar' },
      { route: 'chat', label: 'Team-Chat', icon: 'chat', pro: 'chat' },
      { route: 'stellvertretung', label: 'Stellvertretungen', icon: 'swap', pro: 'substitutes' },
    ] },
    { group: 'Schule', items: [
      { route: 'stundenplan', label: 'Alle Stundenpläne', icon: 'layers' },
      { route: 'raeume', label: 'Räume', icon: 'door' },
      { route: 'einstellungen', label: 'Einstellungen', icon: 'settings' },
    ] },
  ];
  const TABS = ['dashboard', 'generator', 'stundenplan', 'klassen', 'lehrpersonen'];
  const TABS_TEACHER = ['portal', 'kalender', 'chat', 'stundenplan', 'einstellungen'];

  const R = (SW.router = {
    current: null, container: null,
    parse() {
      const hash = location.hash || '#/dashboard';
      const [pathPart, q] = hash.slice(1).split('?');
      const path = pathPart.split('/').filter(Boolean);
      const query = {}; if (q) for (const kv of q.split('&')) { const [k, v] = kv.split('='); query[decodeURIComponent(k)] = decodeURIComponent(v || ''); }
      return { route: path[0] || 'dashboard', id: path[1] || null, path, query };
    },
    go(hash) { if (location.hash === hash) R.render(); else location.hash = hash; },
    refresh() { R.render(true); },
    render(isRefresh) {
      const p = R.parse();
      let view = SW.views[p.route];
      if (!view) { view = SW.views.dashboard; p.route = 'dashboard'; }
      const st = SW.store.state;
      if (st.settings.role === 'teacher' && p.route === 'dashboard') { location.hash = '#/portal'; return; }
      const prev = R.current;
      if (prev && prev.view && prev.view.onLeave && (prev.route !== p.route || !isRefresh)) { try { prev.view.onLeave(); } catch (e) { console.error(e); } }
      R.current = { ...p, view };
      const scrollY = isRefresh ? (R.container.parentElement?.scrollTop || window.scrollY) : 0;
      SW.clear(R.container);
      const wrap = h('div.page.fade-in');
      R.container.append(wrap);
      try { view.render(wrap, p); } catch (e) { console.error(e); wrap.append(SW.ui.banner(h('span', h('b', 'Fehler in der Ansicht: '), String(e.message || e)), 'err')); }
      document.title = (view.title || 'STUNDENWERK') + ' · STUNDENWERK';
      const t = document.querySelector('.top .title'); if (t) SW.mount(t, view.title || '');
      R.renderNav();
      if (isRefresh) window.scrollTo(0, scrollY); else window.scrollTo(0, 0);
      SW.ui.closeMenu();
      document.querySelector('.side')?.classList.remove('open'); document.querySelector('.side-bd')?.classList.remove('open');
    },
    renderNav() {
      const st = SW.store.state; const role = st.settings.role || 'admin';
      const nav = document.querySelector('.nav'); if (!nav) return;
      SW.clear(nav);
      const groups = role === 'teacher' ? NAV_TEACHER : NAV;
      const cur = R.current?.route;
      for (const g of groups) {
        nav.append(h('div.nav-h', g.group));
        for (const it of g.items) {
          const a = h('a.nav-i' + (cur === it.route ? '.active' : ''), { href: '#/' + it.route }, h('span.ic', SW.icon(it.icon)), h('span', it.label));
          if (it.pro && !st.settings.proUnlocked) a.append(h('span.lock', SW.icon('lock'), 'PRO'));
          else if (it.count) a.append(h('span.cnt', String((st[it.count] || []).length)));
          nav.append(a);
        }
      }
      const tabs = document.querySelector('.tabbar'); if (tabs) {
        SW.clear(tabs);
        const list = (role === 'teacher' ? TABS_TEACHER : TABS).map((r) => groups.flatMap((g) => g.items).find((i) => i.route === r)).filter(Boolean);
        for (const it of list) tabs.append(h('a' + (cur === it.route ? '.active' : ''), { href: '#/' + it.route }, SW.icon(it.icon), h('span', it.label.split(' ')[0])));
      }
    },
    init(container) {
      R.container = container;
      window.addEventListener('hashchange', () => R.render());
      R.render();
    },
  });
  R.NAV = NAV;
})();
