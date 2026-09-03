/* STUNDENWERK · views/substitutes.js — Absenzen und Stellvertretungen (Pro): betroffene Lektionen, Kandidaten, Auto-Lösung, Druck. */
(function () {
  const SW = (globalThis.SW = globalThis.SW || {});
  const h = SW.h; const U = SW.ui; const M = SW.model; const D = SW.domain;
  SW.views = SW.views || {};
  let showPast = false; let openId = null;

  // Betroffene Lektionen einer Absenz: je Datum im Zeitraum (nur Unterrichtstage) die Lektionen laut Plan
  function affected(state, a) {
    const tt = state.timetable; if (!tt) return [];
    const out = [];
    for (let d = a.from; d <= a.to && out.length < 400; d = SW.addDays(d, 1)) { const wd = SW.weekday(d); if (!D.days(state).includes(wd)) continue; for (const l of SW.sortBy(D.lessonsFor(tt, { teacherId: a.teacherId, day: wd }), (x) => x.slot)) out.push({ date: d, lesson: l, key: l.id + '@' + d }); }
    return out;
  }
  // Kandidaten für eine Lektion an einem Datum: qualifiziert, verfügbar, frei laut Plan, nicht selbst abwesend
  function candidates(state, lesson, date, absentId) {
    const tt = state.timetable; const len = lesson.len || 1; const wd = SW.weekday(date);
    const cls = D.classOf(state, lesson.classId);
    const weekLoad = (tid) => SW.sum(state.absences, (a) => Object.values(a.substitutes || {}).filter((v) => v === tid).length);
    return state.teachers.filter((t) => t.active !== false && t.id !== absentId && (t.subjectIds || []).includes(lesson.subjectId))
      .filter((t) => SW.range(len, lesson.slot).every((s) => D.teacherAvailable(t, wd, s)))
      .filter((t) => !tt.lessons.some((o) => o.teacherId === t.id && D.overlaps(o, lesson)))
      .filter((t) => !state.absences.some((a) => a.teacherId === t.id && a.from <= date && date <= a.to))
      .map((t) => { const load = SW.sum(D.lessonsFor(tt, { teacherId: t.id }), (l) => l.len || 1); const max = D.teacherMaxLessons(state, t); const inHouse = D.lessonsFor(tt, { teacherId: t.id, day: wd }).length > 0; const team = [cls?.deputyTeacherId, cls?.mainTeacherId, cls?.abuTeacherId].includes(t.id); const score = (team ? 3 : 0) + (inHouse ? 2 : 0) + (load < max ? 1 : 0) - weekLoad(t.id) * 0.5 - load / Math.max(1, max); return { t, load, max, inHouse, team, score }; })
      .sort((a, b) => b.score - a.score);
  }
  SW.views._substituteCandidates = candidates;

  function absenceModal(state, existing) {
    const isTeacher = state.settings.role === 'teacher';
    const a = existing ? SW.clone(existing) : { ...M.newAbsence(), teacherId: isTeacher ? state.settings.currentTeacherId : (state.teachers[0]?.id || null) };
    const body = h('div.form-grid',
      U.field('Lehrperson', U.select(state.teachers.filter((t) => t.active !== false).map((t) => ({ value: t.id, label: `${t.emoji} ${t.code || ''}` })), a.teacherId, (v) => (a.teacherId = v))),
      U.field('Grund', U.select(M.ABSENCE_REASONS.map((r) => ({ value: r.id, label: r.name })), a.reason, (v) => (a.reason = v))),
      U.field('Von', U.input({ type: 'date', value: a.from, oninput: (v) => { a.from = v; if (a.to < v) a.to = v; } })),
      U.field('Bis', U.input({ type: 'date', value: a.to, oninput: (v) => (a.to = v) })),
      U.field('Notiz', U.input({ value: a.note, oninput: (v) => (a.note = v) }), { cls: 'span2' }),
    );
    const m = U.modal({ title: existing ? 'Absenz bearbeiten' : 'Absenz erfassen', body, footer: [h('button.btn', { onclick: () => m.close() }, 'Abbrechen'), h('button.btn.primary', { onclick: () => {
      if (!a.teacherId || !a.from || !a.to) return U.toast('Lehrperson und Zeitraum angeben', { type: 'warn' }); if (a.to < a.from) return U.toast('«Bis» liegt vor «Von»', { type: 'warn' });
      SW.store.put('absences', a); openId = a.id; m.close();
      const n = affected(state, a).length; U.toast(`Absenz gespeichert – ${n} Lektionen betroffen`, { type: 'ok' });
      if (!existing) SW.store.notify({ icon: '🔁', text: `Absenz ${D.teacherLabel(D.teacherOf(state, a.teacherId))} ${SW.fmtDate(a.from)}${a.to !== a.from ? '–' + SW.fmtDate(a.to) : ''}: ${n} Lektionen zu besetzen.`, link: '#/stellvertretung' });
    } }, 'Speichern')] });
  }

  function absenceDetail(state, a) {
    const tt = state.timetable; const rows = affected(state, a); const subs = a.substitutes || {};
    const t = D.teacherOf(state, a.teacherId);
    if (!tt) return h('p.muted', 'Ohne Stundenplan können keine betroffenen Lektionen ermittelt werden.');
    if (!rows.length) return h('p.muted', 'Keine Lektionen in diesem Zeitraum betroffen.');
    const setSub = (key, v, silent) => { SW.store.update((st) => { const x = st.absences.find((z) => z.id === a.id); if (!x) return; x.substitutes = { ...(x.substitutes || {}) }; if (v) x.substitutes[key] = v; else delete x.substitutes[key]; }); if (!silent && v && v !== 'ausfall' && v !== 'selbststudium') { const [lid, date] = key.split('@'); const l = tt.lessons.find((x) => x.id === lid); const st = D.teacherOf(state, v); SW.store.notify({ icon: '🔁', text: `Stellvertretung: ${D.teacherLabel(st)} übernimmt ${D.classOf(state, l?.classId)?.name || ''} ${D.subjectOf(state, l?.subjectId)?.short || ''} am ${SW.fmtDate(date)}.`, link: '#/stellvertretung' }); } };
    const table = U.table({ cls: 'compact', cols: [
      { label: 'Datum', render: (r) => h('span.nowrap', SW.fmtDateShort(r.date)) },
      { label: 'Lektion', render: (r) => h('span.nowrap', `${r.lesson.slot}${(r.lesson.len || 1) > 1 ? '–' + (r.lesson.slot + 1) : ''} · ${D.slotLabel(state, r.lesson.slot)}`) },
      { label: 'Klasse', render: (r) => h('a.strong', { href: '#/stundenplan?view=klasse&id=' + r.lesson.classId }, D.classOf(state, r.lesson.classId)?.name || '?') },
      { label: 'Fach', render: (r) => U.subjectTag(D.subjectOf(state, r.lesson.subjectId)) },
      { label: 'Raum', render: (r) => D.roomOf(state, r.lesson.roomId)?.name || '–' },
      { label: 'Lösung', render: (r) => { const c = candidates(state, r.lesson, r.date, a.teacherId); const cur = subs[r.key] || ''; const sel = U.select([{ value: 'ausfall', label: '⛔ Ausfall (Klasse frei)' }, { value: 'selbststudium', label: '📚 Aufgaben im Selbststudium' }, ...c.map((x) => ({ value: x.t.id, label: `${x.t.emoji} ${x.t.code || ''} · ${x.team ? 'Klassenteam · ' : ''}${x.inHouse ? 'im Haus · ' : ''}${x.load}/${x.max} Lekt.` }))], cur, (v) => setSub(r.key, v), { placeholder: c.length ? `offen – ${c.length} Kandidaten` : 'offen – keine qualifizierte Lehrperson frei', cls: 'sm' }); sel.style.minWidth = '260px'; return sel; } },
      { label: '', render: (r) => { const v = subs[r.key]; return v ? h('span.chip.sm.' + (v === 'ausfall' ? 'warn' : 'ok'), v === 'ausfall' ? 'Ausfall' : v === 'selbststudium' ? 'Selbststudium' : 'besetzt') : h('span.chip.sm.err', 'offen'); } },
    ], rows });
    const solved = rows.filter((r) => subs[r.key]).length;
    const auto = () => { let n = 0; SW.store.update((st) => { const x = st.absences.find((z) => z.id === a.id); x.substitutes = { ...(x.substitutes || {}) }; for (const r of rows) { if (x.substitutes[r.key]) continue; const c = candidates(st, r.lesson, r.date, a.teacherId); x.substitutes[r.key] = c[0] ? c[0].t.id : 'ausfall'; n++; } }); U.toast(`${n} Lektionen gelöst`, { type: 'ok' }); };
    const print = () => { const w = window.open('', '_blank'); if (!w) return U.toast('Popup blockiert', { type: 'warn' }); const lines = rows.map((r) => { const v = subs[r.key]; const sol = !v ? 'offen' : v === 'ausfall' ? 'Ausfall' : v === 'selbststudium' ? 'Selbststudium' : D.teacherLabel(D.teacherOf(state, v)); return `<tr><td>${SW.fmtDateShort(r.date)}</td><td>${r.lesson.slot} · ${D.slotLabel(state, r.lesson.slot)}</td><td>${SW.esc(D.classOf(state, r.lesson.classId)?.name || '')}</td><td>${SW.esc(D.subjectOf(state, r.lesson.subjectId)?.name || '')}</td><td>${SW.esc(D.roomOf(state, r.lesson.roomId)?.name || '')}</td><td><b>${SW.esc(sol)}</b></td></tr>`; }).join(''); w.document.write(`<!doctype html><html lang="de-CH"><head><meta charset="utf-8"><title>Stellvertretungsplan</title><style>body{font-family:system-ui,sans-serif;padding:24px}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ccc;padding:6px 8px;text-align:left;font-size:13px}</style></head><body><h2>Stellvertretungsplan · ${SW.esc(state.settings.schoolName)}</h2><p>Absenz ${SW.esc(D.teacherLabel(t))} · ${SW.fmtDate(a.from)}${a.to !== a.from ? ' – ' + SW.fmtDate(a.to) : ''} · ${SW.esc(M.ABSENCE_REASONS.find((x) => x.id === a.reason)?.name || '')}</p><table><tr><th>Datum</th><th>Lektion</th><th>Klasse</th><th>Fach</th><th>Raum</th><th>Stellvertretung</th></tr>${lines}</table><p style="color:#888;font-size:12px">Stand ${SW.fmtTs(Date.now())} · Lehrpersonen als Emoji/Kürzel (keine Personendaten)</p><script>setTimeout(()=>print(),200)</script></body></html>`); w.document.close(); };
    return h('div.col.g10', h('div.flex.ai-c.g8.wrap', h('span.chip.' + (solved === rows.length ? 'ok' : 'warn'), `${solved} / ${rows.length} gelöst`), h('span.spacer'), h('button.btn.sm', { onclick: auto }, SW.icon('zap'), 'Alle automatisch lösen'), h('button.btn.sm', { onclick: print }, SW.icon('print'), 'Stellvertretungsplan drucken')), table);
  }

  function content(el) {
    const state = SW.store.state; const tt = state.timetable; const today = SW.isoDate();
    const isTeacher = state.settings.role === 'teacher'; const me = isTeacher ? state.settings.currentTeacherId : null;
    const all = SW.sortBy(state.absences, (a) => a.from);
    const upcoming = all.filter((a) => a.to >= today); const past = all.filter((a) => a.to < today);
    const stats = all.map((a) => { const rows = affected(state, a); return { a, n: rows.length, solved: rows.filter((r) => (a.substitutes || {})[r.key]).length }; });
    const open = SW.sum(stats.filter((s) => s.a.to >= today), (s) => s.n - s.solved);
    el.append(U.demoStrip('substitutes'));
    el.append(U.pageHeader({ title: 'Stellvertretungen', lead: 'Absenz erfassen – die App findet für jede Lektion qualifizierte, verfügbare und freie Lehrpersonen.', actions: [h('button.btn.primary', { onclick: () => absenceModal(state) }, SW.icon('plus'), 'Absenz erfassen')] }));
    el.append(h('div.grid.c4', U.kpi({ label: 'Offene Absenzen', value: String(upcoming.length), icon: '🤒' }), U.kpi({ label: 'Betroffene Lektionen', value: String(SW.sum(stats.filter((s) => s.a.to >= today), (s) => s.n)), sub: 'kommende Absenzen', icon: '📘' }), U.kpi({ label: 'Noch offen', value: String(open), sub: open ? 'Lektionen ohne Lösung' : 'alles gelöst', icon: open ? '⚠️' : '✅', cls: open ? '' : '' }), U.kpi({ label: 'Heute abwesend', value: String(all.filter((a) => a.from <= today && today <= a.to).length), icon: '📅' })));
    if (!tt) el.append(U.banner(h('span', h('b', 'Kein Stundenplan vorhanden. '), 'Ohne Plan können betroffene Lektionen nicht ermittelt werden – Absenzen lassen sich trotzdem erfassen.'), 'warn', { action: h('a.btn.sm', { href: '#/generator' }, 'Generator') }));
    if (isTeacher && tt) {
      const mine = []; for (const a of all) for (const [key, v] of Object.entries(a.substitutes || {})) if (v === me) { const [lid, date] = key.split('@'); const l = tt.lessons.find((x) => x.id === lid); if (l && date >= today) mine.push({ a, l, date }); }
      el.append(U.card({ title: 'Meine Stellvertretungen', icon: '🔁', body: mine.length ? h('ul.list', SW.sortBy(mine, (x) => x.date).map((x) => h('li', h('span.tabular.strong', SW.fmtDateShort(x.date)), h('span', `${x.l.slot} · ${D.slotLabel(state, x.l.slot)}`), h('span.chip', D.classOf(state, x.l.classId)?.name), U.subjectTag(D.subjectOf(state, x.l.subjectId)), h('span.grow'), h('span.small.muted', 'für ' + D.teacherLabel(D.teacherOf(state, x.a.teacherId)))))) : h('p.muted', 'Keine übernommenen Lektionen.') }));
    }
    const list = (items) => items.length ? h('div.col.g10', items.map(({ a, n, solved }) => { const t = D.teacherOf(state, a.teacherId); const isOpen = openId === a.id; return h('div.card', h('div.card-h', { style: { cursor: 'pointer' }, onclick: () => { openId = isOpen ? null : a.id; SW.router.refresh(); } }, h('div.flex.ai-c.g10.wrap', U.avatar(t, 'sm'), h('div', h('div.strong', `${D.teacherLabel(t)} · ${SW.fmtDate(a.from)}${a.to !== a.from ? ' – ' + SW.fmtDate(a.to) : ''}`), h('div.small.muted', (M.ABSENCE_REASONS.find((r) => r.id === a.reason)?.name || a.reason) + (a.note ? ' · ' + a.note : ''))), h('span.chip', `${n} Lektionen`), h('span.chip.' + (n === 0 ? '' : solved === n ? 'ok' : solved ? 'warn' : 'err'), n === 0 ? 'nichts betroffen' : solved === n ? 'gelöst' : `${solved}/${n} gelöst`)), h('div.flex.g6', h('button.btn.icon.sm.ghost', { title: 'Bearbeiten', onclick: (e) => { e.stopPropagation(); absenceModal(state, a); } }, SW.icon('edit')), h('button.btn.icon.sm.ghost', { title: 'Löschen', onclick: async (e) => { e.stopPropagation(); if (await U.confirm({ title: 'Absenz löschen?', ok: 'Löschen', danger: true })) SW.store.remove('absences', a.id); } }, SW.icon('trash')), SW.icon(isOpen ? 'chevronDown' : 'chevronRight'))), isOpen ? h('div.card-b', absenceDetail(state, a)) : null); })) : U.empty({ icon: '🌤️', title: 'Keine Absenzen', text: 'Alle Lehrpersonen sind da. Absenzen erfassen, um Stellvertretungen zu planen.' });
    el.append(h('div.flex.jc-b.ai-c', h('h3', 'Aktuelle und kommende Absenzen'), h('label.check', h('input', { type: 'checkbox', checked: showPast, onchange: (e) => { showPast = e.target.checked; SW.router.refresh(); } }), 'Vergangene anzeigen')));
    el.append(list(stats.filter((s) => s.a.to >= today)));
    if (showPast) el.append(h('h3.mt12', 'Vergangene'), list(stats.filter((s) => s.a.to < today)));
  }

  SW.views.stellvertretung = { title: 'Stellvertretungen', render(el) { el.append(U.proGate('substitutes', () => { const w = h('div.col.g16'); content(w); return w; })); } };
})();
