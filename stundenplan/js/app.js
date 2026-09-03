/* STUNDENWERK · app.js — Start: Zustand laden, Shell aufbauen, Router starten. */
(function () {
  const SW = (globalThis.SW = globalThis.SW || {});
  const h = SW.h; const U = SW.ui; const M = SW.model;

  function applyTheme() {
    const t = SW.store.state.settings.theme || 'auto';
    document.documentElement.setAttribute('data-theme', t);
    const b = document.querySelector('#themeBtn'); if (b) SW.mount(b, SW.icon(t === 'dark' ? 'sun' : 'moon'));
  }
  SW.applyTheme = applyTheme;

  function roleSwitch() {
    const st = SW.store.state;
    const wrap = h('div.flex.ai-c.g8');
    const seg = U.seg([{ value: 'admin', label: 'Planung' }, { value: 'teacher', label: 'Lehrperson' }], st.settings.role || 'admin', (v) => {
      if (v === 'teacher' && !st.teachers.length) { U.toast('Zuerst eine Lehrperson erfassen', { type: 'warn' }); seg.set('admin'); return; }
      if (v === 'teacher' && !st.settings.currentTeacherId) SW.store.state.settings.currentTeacherId = st.teachers[0].id;
      SW.store.setSetting('role', v);
      location.hash = v === 'teacher' ? '#/portal' : '#/dashboard';
      renderTop();
    }, { sm: true });
    wrap.append(seg);
    if (st.settings.role === 'teacher') {
      const sel = U.select(st.teachers.filter((t) => t.active !== false).map((t) => ({ value: t.id, label: `${t.emoji} ${t.code || ''}` })), st.settings.currentTeacherId, (v) => { SW.store.setSetting('currentTeacherId', v); SW.router.refresh(); }, { cls: 'sm' });
      sel.style.width = '120px'; sel.title = 'Als welche Lehrperson anzeigen?';
      wrap.append(sel);
    }
    return wrap;
  }

  // Plan-Status als globales Signal in der Topbar
  function planChip() {
    const st = SW.store.state; const tt = st.timetable;
    if (!tt) return h('a.chip.hide-m', { href: '#/generator', title: 'Noch kein Stundenplan' }, '○ Kein Plan');
    const n = SW.domain.ttConflicts(st, tt).length; const open = (tt.unplaced || []).length;
    const cls = n ? 'err' : tt.status === 'published' ? 'ok' : 'tint';
    const txt = n ? `Entwurf · ${n} Konflikte` : tt.status === 'published' ? '● Veröffentlicht' : `○ Entwurf${open ? ' · ' + open + ' offen' : ''}`;
    return h('a.chip.hide-m.' + cls, { href: '#/stundenplan', title: 'Zum Stundenplan' }, txt);
  }
  function renderTop() {
    const top = document.querySelector('.top'); const st = SW.store.state;
    SW.mount(top,
      h('button.btn.icon.ghost.menu-btn', { onclick: () => { document.querySelector('.side').classList.add('open'); document.querySelector('.side-bd').classList.add('open'); }, 'aria-label': 'Menü' }, SW.icon('menu')),
      h('div.title', SW.router.current?.view?.title || ''),
      h('div.spacer'),
      planChip(),
      h('div.hide-m', roleSwitch()),
      st.settings.proUnlocked ? h('span.chip.pro.hide-m', '🧪 Pro-Demo') : h('button.btn.sm.pro.hide-m', { onclick: () => U.paywall('calendar', () => { renderTop(); SW.router.refresh(); }) }, SW.icon('star'), 'Pro'),
      h('button.btn.icon.ghost', { onclick: () => SW.quickSearch(), 'aria-label': 'Suche', title: 'Suche (Cmd/Ctrl + K)' }, SW.icon('search')),
      h('button.btn.icon.ghost#bellBtn', { onclick: showNotifications, 'aria-label': 'Benachrichtigungen', title: 'Benachrichtigungen' }, SW.icon('info')),
      h('button.btn.icon.ghost#themeBtn', { onclick: () => { const cur = SW.store.state.settings.theme; const next = cur === 'dark' ? 'light' : cur === 'light' ? 'auto' : 'dark'; SW.store.setSetting('theme', next); applyTheme(); U.toast('Darstellung: ' + ({ auto: 'automatisch', dark: 'dunkel', light: 'hell' }[next])); }, 'aria-label': 'Darstellung', title: 'Hell / Dunkel' }, SW.icon('moon')),
    );
    updateBell();
    applyTheme();
  }
  function updateBell() {
    const b = document.querySelector('#bellBtn'); if (!b) return;
    const unread = SW.store.state.notifications.filter((n) => !n.read).length;
    SW.mount(b, h('span.rel', SW.icon('info'), unread ? h('span', { style: { position: 'absolute', top: '-4px', right: '-6px', background: 'var(--err)', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '0 5px', borderRadius: '999px', lineHeight: '15px' } }, String(unread)) : null));
  }
  function showNotifications(e) {
    const ns = SW.store.state.notifications;
    const body = h('div.list', { style: { maxWidth: '360px', maxHeight: '60vh', overflow: 'auto' } });
    if (!ns.length) body.append(h('div.muted.small', { style: { padding: '8px 4px' } }, 'Keine Benachrichtigungen.'));
    for (const n of ns.slice(0, 20)) body.append(h('div.row', { style: { padding: '8px 4px' } }, h('span', n.icon || '🔔'), h('div.grow', h('div.small' + (n.read ? '.muted' : '.strong'), n.text), h('div.tiny.faint', SW.fmtTs(n.ts))), n.link ? h('a.btn.xs', { href: n.link, onclick: () => U.closeMenu() }, 'Öffnen') : null));
    U.popover(e.currentTarget, body);
    SW.store.markNotificationsRead(); updateBell();
  }

  function renderSide() {
    const side = document.querySelector('.side'); const st = SW.store.state;
    SW.mount(side,
      h('a.brand', { href: '#/dashboard' }, h('div.logo', 'SW'), h('div', h('div.name', 'STUNDENWERK'), h('div.sub', st.settings.schoolName || 'Stundenplanung'))),
      h('nav.nav'),
      h('div.side-foot', h('div.show-m', roleSwitch()), h('div.tiny.faint', { style: { padding: '4px 8px' } }, `Schuljahr ${st.settings.schoolYear || ''} · Daten nur in diesem Browser`)),
    );
    SW.router.renderNav();
  }

  function welcome() {
    const m = U.modal({
      title: 'Willkommen bei STUNDENWERK', sub: 'Automatische Stundenplanung für Berufsfachschulen', size: 'wide',
      body: [
        h('p.muted', 'Räume, Lehrpersonen (nur als Emoji), Klassen und Lehrgänge erfassen – den Rest übernimmt der Generator. Für den Einstieg gibt es einen fertigen Demo-Datensatz nach dem Muster der KV Luzern Berufsfachschule.'),
        h('div.grid.c2',
          h('div.card.pad.clickable', { onclick: () => { SW.store.loadDemo(); m.close(); U.toast('Demo-Daten geladen', { type: 'ok' }); boot(); } }, h('div', { style: { fontSize: '32px' } }, '🚀'), h('h3.mt8', 'Demo-Daten laden'), h('p.small.muted.mt4', 'Räume, Fächer, Lehrgänge, Lehrpersonen mit Verfügbarkeiten und Klassen – bereit zum Generieren.')),
          h('div.card.pad.clickable', { onclick: () => { SW.store.update((s) => { s.settings.onboarded = true; }); m.close(); boot(); } }, h('div', { style: { fontSize: '32px' } }, '📝'), h('h3.mt8', 'Leer starten'), h('p.small.muted.mt4', 'Alles selbst erfassen. Fächer und Raumtypen bringen sinnvolle Vorgaben mit.')),
        ),
        U.banner(h('span', h('b', 'Datenschutz: '), 'Lehrpersonen werden nur als Emoji oder Kürzel geführt. Alle Daten bleiben in diesem Browser (localStorage); nichts wird übertragen.'), '', { icon: 'shield' }),
      ],
    });
  }

  function boot() {
    renderSide(); renderTop();
    if (!SW.router.container) SW.router.init(document.querySelector('.main'));
    else SW.router.refresh();
  }

  document.addEventListener('DOMContentLoaded', () => {
    SW.store.load();
    applyTheme();
    document.querySelector('.side-bd').addEventListener('click', () => { document.querySelector('.side').classList.remove('open'); document.querySelector('.side-bd').classList.remove('open'); });
    const refresh = SW.debounce(() => { renderSide(); updateBell(); const v = SW.router.current?.view; if (v && !v.manualRefresh) SW.router.refresh(); else SW.router.renderNav(); }, 60);
    SW.store.on((st, meta) => { if (meta.op === 'setting' && ['theme', 'proUnlocked', 'role', 'currentTeacherId'].includes(meta.key)) { renderTop(); } if (meta.op === 'setting' && meta.key === 'theme') return; if (meta.op === 'notify') { updateBell(); return; } if (['timetable', 'update', 'import', 'demo', 'reset'].includes(meta.op)) renderTop(); refresh(); });
    boot();
    if (!SW.store.state.settings.onboarded && !SW.store.state.classes.length) welcome();
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
    document.addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); SW.quickSearch && SW.quickSearch(); } });
  });
  // Schnellsuche (Cmd/Ctrl+K): Klassen, Lehrpersonen, Räume, Lehrgänge, Fächer, Ansichten
  SW.quickSearch = function () {
    const st = SW.store.state;
    const items = [
      ...st.classes.map((k) => ({ icon: '👥', label: k.name, sub: 'Klasse · ' + (SW.domain.curriculumOf(st, k.curriculumId)?.short || ''), href: '#/klassen/' + k.id })),
      ...st.teachers.map((t) => ({ icon: t.emoji, label: t.code || 'Lehrperson', sub: 'Lehrperson · ' + (t.subjectIds || []).map((sid) => SW.domain.subjectOf(st, sid)?.short).filter(Boolean).join(', '), href: '#/lehrpersonen/' + t.id })),
      ...st.rooms.map((r) => ({ icon: M.roomType(r.type).icon, label: r.name, sub: 'Raum · ' + M.roomType(r.type).name, href: '#/raeume/' + r.id })),
      ...st.curricula.map((c) => ({ icon: '🎓', label: c.name, sub: 'Lehrgang', href: '#/lehrgaenge/' + c.id })),
      ...st.subjects.map((sj) => ({ icon: '📘', label: sj.name, sub: 'Fach · ' + sj.short, href: '#/faecher' })),
      ...SW.router.NAV.flatMap((g) => g.items).map((it) => ({ icon: '➡️', label: it.label, sub: 'Ansicht', href: '#/' + it.route })),
    ];
    const list = h('div.list', { style: { maxHeight: '50vh', overflow: 'auto' } });
    const inp = U.input({ placeholder: 'Suchen … (Klasse, Lehrperson, Raum, Ansicht)', oninput: (v) => draw(v) });
    let sel = 0; let shown = [];
    const draw = (q) => {
      const s = (q || '').trim().toLowerCase();
      shown = (s ? items.filter((i) => (i.label + ' ' + i.sub).toLowerCase().includes(s)) : items.slice(0, 12)).slice(0, 12); sel = 0;
      SW.mount(list, shown.length ? shown.map((i, n) => h('div.row', { style: { padding: '8px 6px', borderRadius: '8px', cursor: 'pointer', background: n === sel ? 'var(--tint-soft)' : '' }, onclick: () => go(i) }, h('span.av.sm', i.icon), h('div.grow', h('div.strong', i.label), h('div.tiny.faint', i.sub)))) : h('div.muted.small', { style: { padding: '10px 6px' } }, 'Nichts gefunden.'));
    };
    const go = (i) => { m.close(); location.hash = i.href; };
    const m = U.modal({ title: 'Schnellsuche', sub: 'Tipp: Cmd/Ctrl + K öffnet die Suche von überall', body: [inp, list] });
    inp.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { sel = Math.min(sel + 1, shown.length - 1); draw(inp.value); } else if (e.key === 'ArrowUp') { sel = Math.max(sel - 1, 0); draw(inp.value); } else if (e.key === 'Enter' && shown[sel]) go(shown[sel]); });
    draw('');
  };
  SW.welcome = welcome;
})();
