/* STUNDENWERK · views/portal.js — «Mein Bereich» für Lehrpersonen: heute, Woche, Klassen, Verfügbarkeit, Pro-Teaser. */
(function () {
  const SW = (globalThis.SW = globalThis.SW || {});
  const h = SW.h; const U = SW.ui; const M = SW.model; const D = SW.domain;
  SW.views = SW.views || {};
  let saveTimer = null;

  SW.views.portal = {
    title: 'Mein Stundenplan',
    render(el) {
      const state = SW.store.state; const tt = state.timetable;
      const active = state.teachers.filter((t) => t.active !== false);
      const me = D.teacherOf(state, state.settings.currentTeacherId) || active[0];
      if (!me) { el.append(U.pageHeader({ title: 'Mein Bereich' }), U.empty({ icon: '👩‍🏫', title: 'Keine Lehrpersonen erfasst', text: 'Sobald Lehrpersonen erfasst sind, sehen sie hier ihren Stundenplan.', action: h('a.btn.primary', { href: '#/lehrpersonen' }, 'Lehrpersonen') })); return; }
      const mine = D.lessonsFor(tt, { teacherId: me.id });
      const n = SW.sum(mine, (l) => l.len || 1); const max = D.teacherMaxLessons(state, me);
      const today = SW.weekday(SW.isoDate());
      const roles = state.classes.flatMap((k) => { const r = []; if (k.mainTeacherId === me.id) r.push({ k, role: 'Klassenlehrperson' }); if (k.deputyTeacherId === me.id) r.push({ k, role: 'Stellvertretung' }); if (k.abuTeacherId === me.id) r.push({ k, role: 'ABU' }); for (const [sid, tid] of Object.entries(k.subjectTeachers || {})) if (tid === me.id && ![k.mainTeacherId, k.deputyTeacherId, k.abuTeacherId].includes(me.id)) r.push({ k, role: D.subjectOf(state, sid)?.short || 'Fach' }); return r; });
      const uniqRoles = Object.values(SW.groupBy(roles, (r) => r.k.id)).map((g) => ({ k: g[0].k, roles: SW.uniq(g.map((x) => x.role)) }));

      el.append(U.pageHeader({ title: 'Mein Bereich', lead: 'Persönliche Übersicht – nur Emoji und Kürzel, keine Personendaten.', actions: [h('a.btn', { href: '#/stundenplan?view=lehrperson&id=' + me.id }, SW.icon('grid'), 'Ganzer Plan'), h('a.btn', { href: '#/lehrpersonen/' + me.id }, SW.icon('user'), 'Profil')] }));
      // Kopf
      el.append(h('div.card.pad.flex.ai-c.g16.wrap',
        U.avatar(me, 'xl'),
        h('div.grow', h('h2', me.code || 'Lehrperson'), h('div.chips.mt8', h('span.chip.tint', `Pensum ${me.employment || 100} %`), (me.subjectIds || []).map((s) => { const sj = D.subjectOf(state, s); return sj ? h('span.chip', h('i.dot', { style: { background: sj.color } }), sj.short) : null; })), h('div.mt12', { style: { maxWidth: '360px' } }, U.meter(max ? n / max : 0, { label: `${n} / ${max} Lektionen` }))),
        tt ? h('span.chip.' + (tt.status === 'published' ? 'ok' : 'warn'), tt.status === 'published' ? '● Plan veröffentlicht' : '○ Entwurf – kann sich noch ändern') : h('span.chip', 'Noch kein Stundenplan'),
      ));
      if (!tt) el.append(U.banner(h('span', h('b', 'Noch kein Stundenplan veröffentlicht. '), 'Sobald die Planung einen Plan übernimmt, erscheint er hier.'), 'info'));

      // Heute
      const todayLs = SW.sortBy(mine.filter((l) => l.day === today), (l) => l.slot);
      const now = new Date(); const nowMin = now.getHours() * 60 + now.getMinutes();
      const todayBody = today > 5 ? h('p.muted', 'Wochenende – kein Unterricht. Schönes Wochenende!') : !tt ? h('p.muted', 'Kein Plan vorhanden.') : !todayLs.length ? h('p.muted', `Heute (${M.dayName(today)}) keine Lektionen.`) : h('ul.list', todayLs.map((l) => { const s0 = state.settings.slots[l.slot - 1], s1 = state.settings.slots[l.slot + (l.len || 1) - 2]; const cur = s0 && s1 && nowMin >= SW.minutes(s0.start) && nowMin <= SW.minutes(s1.end); const next = s0 && SW.minutes(s0.start) > nowMin; const sj = D.subjectOf(state, l.subjectId); return h('li', { style: cur ? { background: 'var(--tint-soft)', borderRadius: '10px', padding: '10px' } : null }, h('div.tabular.strong', { style: { minWidth: '96px' } }, `${s0?.start || ''}–${s1?.end || ''}`), h('span.subj', { style: { '--c': sj?.color } }, h('i'), sj?.name || '?'), h('div.grow'), h('span.chip', D.classOf(state, l.classId)?.name || '?'), U.roomTag(D.roomOf(state, l.roomId)), cur ? h('span.chip.tint', 'jetzt') : next && !todayLs.some((x) => x !== l && state.settings.slots[x.slot - 1] && SW.minutes(state.settings.slots[x.slot - 1].start) > nowMin && x.slot < l.slot) ? h('span.chip', 'nächste') : null); }));
      const week = U.timetableGrid({ lessons: mine, mode: 'teacher', state, showFree: true, dense: true, offDays: D.days(state).filter((d) => !(me.availability?.[d] || []).some(Boolean)), onLessonClick: (l) => { const sj = D.subjectOf(state, l.subjectId); U.toast(`${D.classOf(state, l.classId)?.name} · ${sj?.name} · ${D.roomOf(state, l.roomId)?.name || 'kein Raum'}`); } });
      el.append(h('div.grid.c2', U.card({ title: `Heute, ${SW.fmtDate(SW.isoDate(), { weekday: 'long', day: 'numeric', month: 'long' })}`, icon: '📅', body: todayBody }), U.card({ title: 'Meine Klassen', icon: '👥', body: uniqRoles.length ? h('ul.list', uniqRoles.map(({ k, roles: rs }) => h('li', h('div.grow', h('a.strong', { href: '#/stundenplan?view=klasse&id=' + k.id }, k.name), h('div.small.muted', `${D.curriculumOf(state, k.curriculumId)?.short || ''} · ${k.year}. Lehrjahr · ${k.size} Lernende`)), h('div.chips', rs.map((r) => h('span.chip.sm' + (r === 'Klassenlehrperson' ? '.tint' : ''), r)))))) : h('p.muted', 'Noch keiner Klasse zugeteilt.') })));
      el.append(U.card({ title: 'Meine Woche', icon: '🗓️', body: tt ? h('div.scroll-x', week) : h('p.muted', 'Noch kein Plan.'), actions: [h('a.btn.sm', { href: '#/stundenplan?view=lehrperson&id=' + me.id }, 'Öffnen')] }));

      // Verfügbarkeit (bearbeitbar)
      const busy = {}; for (const l of mine) { busy[l.day] = busy[l.day] || []; for (let s = l.slot; s < l.slot + (l.len || 1); s++) busy[l.day][s - 1] = `${D.classOf(state, l.classId)?.name} · ${D.subjectOf(state, l.subjectId)?.short}`; }
      const grid = U.availabilityGrid({ value: me.availability, busy, state, onchange: (v) => { me.availability = v; SW.store.save(); clearTimeout(saveTimer); saveTimer = setTimeout(() => U.toast('Verfügbarkeit gespeichert', { type: 'ok', ms: 1500 }), 700); } });
      const presets = U.availabilityPresets(state);
      const setAll = (p) => { const v = {}; for (const d of D.days(state)) v[d] = [...presets[p]]; grid.setValue(v); me.availability = v; SW.store.save(); U.toast('Verfügbarkeit gespeichert', { type: 'ok', ms: 1500 }); };
      el.append(U.card({ title: 'Meine Verfügbarkeit', icon: '🕒', sub: 'Änderungen wirken beim nächsten Generieren. Schraffiert = bereits verplant.', body: h('div.col.g12', h('div.chips', h('button.btn.sm', { onclick: () => setAll('ganzerTag') }, 'Ganze Woche'), h('button.btn.sm', { onclick: () => setAll('vormittag') }, 'Vormittage'), h('button.btn.sm', { onclick: () => setAll('nachmittag') }, 'Nachmittage'), h('button.btn.sm.ghost', { onclick: () => setAll('keiner') }, 'Leeren')), h('div.scroll-x', grid), h('div.legend', h('span', h('i', { style: { background: 'var(--ok)' } }), 'verfügbar'), h('span', h('i', { style: { background: 'var(--tint)' } }), 'verplant'), h('span', h('i', { style: { background: 'var(--card-3)' } }), 'nicht verfügbar')), h('div', h('div.lbl.mb8', 'Wunschtage (weiche Regel)'), U.dayChips(D.days(state), me.preferredDays || [], (v) => { SW.store.patch('teachers', me.id, { preferredDays: v }); }))) }));

      // Benachrichtigungen + Pro
      const ns = state.notifications.slice(0, 5);
      const pro = (fid, href) => { const f = M.proFeature(fid); return h('div.card.pad.clickable', { onclick: () => (U.isPro() ? (location.hash = href) : U.paywall(fid, () => (location.hash = href))) }, h('div.flex.ai-c.g8', h('span', { style: { fontSize: '26px' } }, f.icon), h('div.grow', h('div.strong', f.name), h('div.small.muted', f.desc)), U.isPro() ? SW.icon('chevronRight') : U.lockBadge())); };
      el.append(h('div.grid.c2', U.card({ title: 'Benachrichtigungen', icon: '🔔', body: ns.length ? h('ul.list', ns.map((x) => h('li', h('span', x.icon || '🔔'), h('div.grow', h('div.small', x.text), h('div.tiny.faint', SW.fmtTs(x.ts))), x.link ? h('a.btn.xs', { href: x.link }, 'Öffnen') : null))) : h('p.muted', 'Keine Benachrichtigungen.') }), h('div.col.g10', pro('calendar', '#/kalender'), pro('chat', '#/chat'), pro('substitutes', '#/stellvertretung'))));
    },
  };
})();
