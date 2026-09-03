/* STUNDENWERK · views/analytics.js — Auswertungen (Pro): Raumauslastung, Heatmap, Pensen, Klassen, Kriterien, Varianten. */
(function () {
  const SW = (globalThis.SW = globalThis.SW || {});
  const h = SW.h; const U = SW.ui; const M = SW.model; const D = SW.domain;
  SW.views = SW.views || {};
  const CSS = `
  .an-bars{display:flex;flex-direction:column;gap:6px}
  .an-bar{display:grid;grid-template-columns:160px 1fr 70px;align-items:center;gap:10px;font-size:13px}
  .an-bar .lbl{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .an-bar .trk{height:12px;background:var(--card-3);border-radius:6px;overflow:hidden}
  .an-bar .trk i{display:block;height:100%;background:var(--c,var(--tint));border-radius:6px}
  .an-bar .val{text-align:right;font-variant-numeric:tabular-nums;color:var(--txt-2)}
  .an-heat{display:grid;grid-template-columns:48px repeat(var(--n),1fr);gap:3px;min-width:420px}
  .an-heat .hd{font-size:11px;color:var(--txt-3);text-align:center}
  .an-heat .c{height:28px;border-radius:6px;background:color-mix(in srgb,var(--tint) calc(var(--p) * 1%),var(--card-3));display:grid;place-items:center;font-size:11px;color:var(--txt);font-variant-numeric:tabular-nums}
  .an-mini{display:flex;height:8px;border-radius:4px;overflow:hidden;min-width:120px}
  .an-mini i{display:block;height:100%}
  @media (max-width:600px){.an-bar{grid-template-columns:90px 1fr 56px}}
  `;
  const bar = (label, ratio, val, color) => h('div.an-bar', h('span.lbl', label), h('div.trk', h('i', { style: { width: Math.round(SW.clamp(ratio, 0, 1) * 100) + '%', '--c': color || null } })), h('span.val', val));

  function content(el) {
    const state = SW.store.state; const tt = state.timetable; U.injectCSS('analytics', CSS);
    el.append(U.demoStrip('analytics'));
    if (!tt) { el.append(U.pageHeader({ title: 'Auswertungen' }), U.empty({ icon: '📊', title: 'Noch kein Stundenplan', text: 'Auswertungen brauchen einen generierten Plan.', action: h('a.btn.primary', { href: '#/generator' }, 'Zum Generator') })); return; }
    const stats = D.ttStats(state, tt); const cost = SW.solver.cost(state, tt.lessons); const days = D.days(state); const S = D.slotCount(state);
    el.append(U.pageHeader({ title: 'Auswertungen', lead: `Plan vom ${SW.fmtTs(tt.createdAt)} · ${stats.total} Lektionen`, actions: [h('button.btn', { onclick: () => { const rows = [['Raum', 'Typ', 'Lektionen', 'Kapazität', 'Auslastung']]; for (const r of stats.rooms) rows.push([r.name, M.roomType(D.roomOf(state, r.id)?.type).name, r.lessons, r.cap, Math.round(r.util * 100) + ' %']); SW.download('raumauslastung.csv', '﻿' + rows.map((r) => r.map((c) => `"${c}"`).join(';')).join('\n'), 'text/csv'); } }, SW.icon('download'), 'CSV')] }));
    el.append(h('div.grid.c4', U.kpi({ label: 'Lektionen im Plan', value: String(stats.total), icon: '📘' }), U.kpi({ label: 'Raumauslastung Ø', value: Math.round(stats.roomUtil * 100) + ' %', sub: `${stats.rooms.length} Unterrichtsräume`, icon: '🏫' }), U.kpi({ label: 'Freistunden', value: h('span', String(stats.classGaps), h('small', ` Klassen · ${stats.teacherGaps} LP`)), icon: '⏳' }), U.kpi({ label: 'Score', value: String(tt.score), sub: 'kleiner ist besser', icon: '🎯' })));
    // Raumauslastung + Heatmap
    const rooms = SW.sortBy(stats.rooms, (r) => -r.util);
    const heat = h('div.an-heat', { style: { '--n': S } }, h('div'), SW.range(S, 1).map((s) => h('div.hd', String(s))));
    const nRooms = stats.rooms.length || 1;
    for (const d of days) { heat.append(h('div.hd', { style: { alignSelf: 'center' } }, M.dayName(d, true))); for (let s = 1; s <= S; s++) { const n = SW.uniq(tt.lessons.filter((l) => l.day === d && l.slot <= s && s < l.slot + (l.len || 1) && l.roomId).map((l) => l.roomId)).length; heat.append(h('div.c', { style: { '--p': Math.round((n / nRooms) * 100) }, title: `${M.dayName(d)} Lektion ${s}: ${n} von ${nRooms} Räumen belegt` }, String(n))); } }
    el.append(h('div.grid.c2', U.card({ title: 'Raumauslastung', icon: '🏫', body: h('div.an-bars', rooms.slice(0, 14).map((r) => bar(r.name, r.util, `${r.lessons} · ${Math.round(r.util * 100)} %`, r.util > 0.85 ? 'var(--warn)' : null)), rooms.length > 14 ? h('div.small.faint', `… und ${rooms.length - 14} weitere`) : null) }), U.card({ title: 'Belegte Räume je Lektion', icon: '🔥', sub: 'Tage × Lektionen, dunkler = mehr Räume belegt', body: h('div.scroll-x', heat) })));
    // Pensen
    const teachers = SW.sortBy(stats.teachers.filter((t) => t.lessons || t.max), (t) => -t.lessons);
    el.append(U.card({ title: 'Pensen der Lehrpersonen', icon: '👩‍🏫', sub: 'Lektionen im Plan im Verhältnis zum Maximum', body: h('div.grid.c2', h('div.an-bars', teachers.slice(0, 18).map((t) => bar(t.label, t.max ? t.lessons / t.max : 0, `${t.lessons} / ${t.max}`, t.lessons > t.max ? 'var(--err)' : t.lessons > t.max * 0.9 ? 'var(--warn)' : 'var(--ok)'))), U.table({ cls: 'compact', cols: [{ label: 'LP', render: (t) => h('span.flex.ai-c.g6', U.avatar(D.teacherOf(state, t.id), 'xs'), D.teacherOf(state, t.id)?.code || '') }, { label: 'Lekt.', cls: 'r', render: (t) => String(t.lessons) }, { label: 'Max', cls: 'r', render: (t) => String(t.max) }, { label: 'Verf.', cls: 'r', render: (t) => String(t.avail) }, { label: 'Freist.', cls: 'r', render: (t) => String(t.gaps) }, { label: 'Tage', cls: 'r', render: (t) => String(t.days) }], rows: teachers })) }));
    // Klassen
    const classRows = state.classes.map((k) => { const st = stats.classes.find((c) => c.id === k.id); const ls = D.lessonsFor(tt, { classId: k.id }); let changes = 0; for (const d of days) { const dl = SW.sortBy(ls.filter((l) => l.day === d), (l) => l.slot); for (let i = 1; i < dl.length; i++) if (dl[i].roomId !== dl[i - 1].roomId) changes++; } const bySub = SW.groupBy(ls, (l) => l.subjectId); return { k, st, changes, bySub, total: SW.sum(ls, (l) => l.len || 1) }; });
    el.append(U.card({ title: 'Klassen', icon: '👥', body: U.table({ cls: 'compact', cols: [{ label: 'Klasse', render: (r) => h('a.strong', { href: '#/stundenplan?view=klasse&id=' + r.k.id }, r.k.name) }, { label: 'Lektionen', cls: 'r', render: (r) => `${r.st?.lessons ?? 0} / ${r.st?.need ?? 0}` }, { label: 'Freist.', cls: 'r', render: (r) => h('span' + (r.st?.gaps ? '.err-c.strong' : ''), String(r.st?.gaps ?? 0)) }, { label: 'Schultage', render: (r) => (r.k.schoolDays || []).map((d) => M.dayName(d, true)).join(', ') }, { label: 'Raumwechsel', cls: 'r', render: (r) => String(r.changes) }, { label: 'Fachverteilung', render: (r) => h('div.an-mini', { title: Object.entries(r.bySub).map(([sid, ls]) => `${D.subjectOf(state, sid)?.short}: ${SW.sum(ls, (l) => l.len || 1)}`).join(', ') }, Object.entries(r.bySub).map(([sid, ls]) => h('i', { style: { width: (SW.sum(ls, (l) => l.len || 1) / Math.max(1, r.total)) * 100 + '%', background: D.subjectOf(state, sid)?.color || '#888' } }))) }], rows: classRows }) }));
    // Kriterien + Varianten
    const parts = Object.entries(cost.parts).filter(([, v]) => v > 0).sort((a, b) => cost.weighted[b[0]] - cost.weighted[a[0]]);
    const variants = [{ ...tt, current: true }, ...state.variants];
    const best = (f) => Math.min(...variants.map(f));
    el.append(h('div.grid.c2', U.card({ title: 'Kriterien', icon: '🎯', sub: 'Woraus sich der Score zusammensetzt', body: U.table({ cls: 'compact', cols: [{ label: 'Kriterium', render: (r) => M.WEIGHT_LABELS[r[0]] || r[0] }, { label: 'Anzahl', cls: 'r', render: (r) => SW.fmtNum(r[1], 1) }, { label: 'Gewicht', cls: 'r', render: (r) => SW.fmtNum((tt.weights || state.settings.weights)[r[0]] ?? 0, 1) }, { label: 'Punkte', cls: 'r', render: (r) => SW.fmtNum(cost.weighted[r[0]], 1) }], rows: parts, empty: h('p.muted', 'Keine Abzüge – perfekter Plan.') }) }), U.card({ title: 'Varianten-Vergleich', icon: '🗂️', body: U.table({ cls: 'compact', cols: [{ label: 'Plan', render: (v) => h('div', h('div.strong', v.current ? 'Aktuell' : (v.label || 'Variante')), h('div.tiny.faint', SW.fmtTs(v.createdAt))) }, { label: 'Score', cls: 'r', render: (v) => h('span' + (v.score === best((x) => x.score) ? '.ok-c.strong' : ''), String(v.score)) }, { label: 'Offen', cls: 'r', render: (v) => String((v.unplaced || []).length) }, { label: 'Freist. Kl.', cls: 'r', render: (v) => h('span' + ((v.stats?.classGaps ?? 0) === best((x) => x.stats?.classGaps ?? 0) ? '.ok-c.strong' : ''), String(v.stats?.classGaps ?? '–')) }, { label: 'Freist. LP', cls: 'r', render: (v) => String(v.stats?.teacherGaps ?? '–') }], rows: variants }), actions: [h('a.btn.sm', { href: '#/generator' }, 'Generator')] })));
  }
  SW.views.auswertung = { title: 'Auswertungen', render(el) { el.append(U.proGate('analytics', () => { const w = h('div.col.g16'); content(w); return w; })); } };
})();
