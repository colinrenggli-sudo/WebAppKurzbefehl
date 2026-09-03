/* STUNDENWERK · views/calendar.js — Kalender & Arbeitszeit (Pro): Wochenkalender, Zeiteinträge, Soll/Ist, Export. */
(function () {
  const SW = (globalThis.SW = globalThis.SW || {});
  const h = SW.h; const U = SW.ui; const M = SW.model; const D = SW.domain;
  SW.views = SW.views || {};
  let weekStart = SW.startOfWeek(SW.isoDate());
  let teacherId = null;
  const WEEKS_PER_YEAR = 42; // Arbeitswochen (Annahme: 52 minus Ferien/Feiertage)
  const PREP_FACTOR = 1; // pauschale Vor-/Nachbereitung: 1 × Lektionsdauer pro Lektion

  const CSS = `
  .cal-grid{display:grid;grid-template-columns:56px repeat(var(--cols),1fr);gap:0;min-width:700px;border:1px solid var(--sep);border-radius:12px;overflow:hidden;background:var(--card)}
  .cal-grid .cal-hd{padding:8px 6px;text-align:center;font-size:12.5px;font-weight:650;color:var(--txt-2);background:var(--card-2);border-bottom:1px solid var(--sep)}
  .cal-grid .cal-hd b{display:block;font-size:14px;color:var(--txt)}
  .cal-grid .cal-hd.today b{color:var(--tint)}
  .cal-grid .cal-time{font-size:11px;color:var(--txt-3);text-align:right;padding:2px 6px 0 0;border-top:1px solid var(--sep);height:var(--hh);font-variant-numeric:tabular-nums}
  .cal-grid .cal-col{position:relative;border-left:1px solid var(--sep);height:calc(var(--hh) * var(--hours));background:repeating-linear-gradient(to bottom,transparent 0 calc(var(--hh) - 1px),var(--sep) calc(var(--hh) - 1px) var(--hh));cursor:pointer}
  .cal-grid .cal-col.absent{background-image:repeating-linear-gradient(45deg,transparent 0 8px,color-mix(in srgb,var(--err) 12%,transparent) 8px 16px)}
  .cal-ev{position:absolute;left:3px;right:3px;border-radius:7px;padding:3px 6px;font-size:11.5px;line-height:1.25;overflow:hidden;border-left:3px solid var(--c,#888);background:color-mix(in srgb,var(--c,#888) 18%,var(--card));cursor:pointer}
  .cal-ev b{display:block;font-size:12px}
  .cal-ev.time{--c:var(--txt-3);background:var(--card-3);border-style:dashed}
  .cal-ev.booking{--c:var(--pro)}
  `;

  function weekLessonMinutes(state, tt, tid, monday) {
    if (!tt || monday < SW.startOfWeek(state.settings.semesterStart || '2000-01-01')) return { lessons: 0, minutes: 0 };
    const n = SW.sum(D.lessonsFor(tt, { teacherId: tid }), (l) => l.len || 1);
    return { lessons: n, minutes: n * (state.settings.lessonMinutes || 45) * (1 + PREP_FACTOR) };
  }
  const entryMinutes = (e) => Math.max(0, SW.minutes(e.to) - SW.minutes(e.from));
  function weekSummary(state, tt, t, monday) {
    const soll = ((state.settings.annualHoursFull || 1900) * ((t.employment || 100) / 100)) / WEEKS_PER_YEAR * 60;
    const wl = weekLessonMinutes(state, tt, t.id, monday);
    const entries = state.timeEntries.filter((e) => e.teacherId === t.id && e.date >= monday && e.date <= SW.addDays(monday, 6));
    const extra = SW.sum(entries, entryMinutes);
    return { soll, ist: wl.minutes + extra, lessons: wl.lessons, extra, entries };
  }

  function entryModal(state, t, entry) {
    const e = entry ? SW.clone(entry) : { ...M.newTimeEntry(), teacherId: t.id, date: weekStart };
    const body = h('div.form-grid',
      U.field('Datum', U.input({ type: 'date', value: e.date, oninput: (v) => (e.date = v) })),
      U.field('Art', U.select(M.TIME_KINDS.map((k) => ({ value: k.id, label: `${k.icon} ${k.name}` })), e.kind, (v) => (e.kind = v))),
      U.field('Von', U.input({ type: 'time', value: e.from, oninput: (v) => (e.from = v) })),
      U.field('Bis', U.input({ type: 'time', value: e.to, oninput: (v) => (e.to = v) })),
      U.field('Notiz', U.input({ value: e.note, oninput: (v) => (e.note = v), placeholder: 'z. B. Fachschaftssitzung' }), { cls: 'span2' }),
    );
    const m = U.modal({ title: entry ? 'Eintrag bearbeiten' : 'Arbeitszeit erfassen', sub: D.teacherLabel(t), body, footer: [
      entry ? h('button.btn.danger.soft', { onclick: async () => { if (await U.confirm({ title: 'Eintrag löschen?', ok: 'Löschen', danger: true })) { SW.store.remove('timeEntries', entry.id); m.close(); } } }, 'Löschen') : null, h('span.left'),
      h('button.btn', { onclick: () => m.close() }, 'Abbrechen'),
      h('button.btn.primary', { onclick: () => { if (!e.date || !e.from || !e.to) return U.toast('Datum und Zeit angeben', { type: 'warn' }); if (SW.minutes(e.to) <= SW.minutes(e.from)) return U.toast('«Bis» muss nach «Von» liegen', { type: 'warn' }); SW.store.put('timeEntries', e); m.close(); U.toast('Gespeichert', { type: 'ok' }); } }, 'Speichern'),
    ] });
  }

  function exportCSV(state, t) {
    const rows = [['Datum', 'Art', 'Von', 'Bis', 'Minuten', 'Notiz']];
    for (const e of SW.sortBy(state.timeEntries.filter((x) => x.teacherId === t.id), (x) => x.date)) rows.push([e.date, M.TIME_KINDS.find((k) => k.id === e.kind)?.name || e.kind, e.from, e.to, entryMinutes(e), e.note || '']);
    SW.download(`arbeitszeit-${t.code || t.id}.csv`, '﻿' + rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\n'), 'text/csv');
  }
  function exportICS(state, t) {
    const tt = state.timetable; const monday = SW.startOfWeek(state.settings.semesterStart || SW.isoDate());
    const fmt = (date, hhmm) => date.replace(/-/g, '') + 'T' + hhmm.replace(':', '') + '00';
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//STUNDENWERK//DE', 'X-WR-CALNAME:Stundenplan ' + (t.code || '')];
    for (const l of D.lessonsFor(tt, { teacherId: t.id })) { const d = SW.addDays(monday, l.day - 1); const s0 = state.settings.slots[l.slot - 1], s1 = state.settings.slots[l.slot + (l.len || 1) - 2]; if (!s0 || !s1) continue; lines.push('BEGIN:VEVENT', 'UID:' + l.id + '@stundenwerk', 'DTSTAMP:' + fmt(SW.isoDate(), '00:00'), 'DTSTART:' + fmt(d, s0.start), 'DTEND:' + fmt(d, s1.end), 'RRULE:FREQ=WEEKLY;COUNT=20', 'SUMMARY:' + `${D.classOf(state, l.classId)?.name || ''} ${D.subjectOf(state, l.subjectId)?.short || ''}`, 'LOCATION:' + (D.roomOf(state, l.roomId)?.name || ''), 'END:VEVENT'); }
    for (const e of state.timeEntries.filter((x) => x.teacherId === t.id)) lines.push('BEGIN:VEVENT', 'UID:' + e.id + '@stundenwerk', 'DTSTAMP:' + fmt(SW.isoDate(), '00:00'), 'DTSTART:' + fmt(e.date, e.from), 'DTEND:' + fmt(e.date, e.to), 'SUMMARY:' + (M.TIME_KINDS.find((k) => k.id === e.kind)?.name || e.kind) + (e.note ? ' – ' + e.note : ''), 'END:VEVENT');
    lines.push('END:VCALENDAR');
    SW.download(`kalender-${t.code || t.id}.ics`, lines.join('\r\n'), 'text/calendar');
  }

  function content(el) {
    const state = SW.store.state; const tt = state.timetable;
    U.injectCSS('calendar', CSS);
    const teachers = state.teachers.filter((t) => t.active !== false);
    if (!teachers.length) { el.append(U.pageHeader({ title: 'Kalender & Arbeitszeit' }), U.empty({ icon: '🗓️', title: 'Keine Lehrpersonen', text: 'Erfasse zuerst Lehrpersonen.', action: h('a.btn.primary', { href: '#/lehrpersonen' }, 'Lehrpersonen') })); return; }
    const isTeacher = state.settings.role === 'teacher';
    if (isTeacher) teacherId = state.settings.currentTeacherId || teachers[0].id;
    if (!teacherId || !teachers.some((t) => t.id === teacherId)) teacherId = teachers[0].id;
    const t = D.teacherOf(state, teacherId);
    const days = D.days(state); const dates = days.map((d) => SW.addDays(weekStart, d - 1));
    const H0 = 7, H1 = 19, HH = 44; const hours = H1 - H0;
    const semStart = state.settings.semesterStart || SW.isoDate();
    const inSemester = weekStart >= SW.startOfWeek(semStart);

    el.append(U.demoStrip('calendar'));
    el.append(U.pageHeader({ title: 'Kalender & Arbeitszeit', lead: 'Unterricht aus dem Stundenplan, eigene Zeiteinträge, Soll/Ist nach Berufsauftrag.', actions: [
      isTeacher ? null : U.select(teachers.map((x) => ({ value: x.id, label: `${x.emoji} ${x.code || ''}` })), teacherId, (v) => { teacherId = v; SW.router.refresh(); }),
      h('button.btn', { onclick: (e) => U.menu(e.currentTarget, [{ label: 'Zeiteinträge als CSV', icon: 'download', fn: () => exportCSV(state, t) }, { label: 'Kalender als ICS', icon: 'calendar', fn: () => exportICS(state, t) }]) }, SW.icon('download'), 'Export'),
      h('button.btn.primary', { onclick: () => entryModal(state, t) }, SW.icon('plus'), 'Eintrag erfassen'),
    ] }));

    // Navigation
    const nav = h('div.toolbar', h('button.btn.icon', { onclick: () => { weekStart = SW.addDays(weekStart, -7); SW.router.refresh(); } }, SW.icon('chevronLeft')), h('button.btn', { onclick: () => { weekStart = SW.startOfWeek(SW.isoDate()); SW.router.refresh(); } }, 'Heute'), h('button.btn.icon', { onclick: () => { weekStart = SW.addDays(weekStart, 7); SW.router.refresh(); } }, SW.icon('chevronRight')), h('h3', `KW ${SW.isoWeek(weekStart)} · ${SW.fmtDate(dates[0], { day: 'numeric', month: 'short' })} – ${SW.fmtDate(dates[dates.length - 1], { day: 'numeric', month: 'short', year: 'numeric' })}`), !inSemester ? h('span.chip.warn', 'vor Semesterbeginn – kein Unterricht') : null);

    // Grid
    const grid = h('div.cal-grid', { style: { '--cols': days.length, '--hh': HH + 'px', '--hours': hours } });
    grid.append(h('div.cal-hd', ''));
    for (const [i, d] of days.entries()) grid.append(h('div.cal-hd' + (dates[i] === SW.isoDate() ? '.today' : ''), h('b', M.dayName(d, true)), SW.fmtDate(dates[i], { day: 'numeric', month: 'numeric' })));
    const timeCol = h('div'); for (let hr = H0; hr < H1; hr++) timeCol.append(h('div.cal-time', `${String(hr).padStart(2, '0')}:00`)); grid.append(timeCol);
    const absences = state.absences.filter((a) => a.teacherId === t.id);
    const place = (col, from, to, cls, c, title, sub, onclick) => { const top = ((SW.minutes(from) - H0 * 60) / 60) * HH; const hgt = Math.max(18, ((SW.minutes(to) - SW.minutes(from)) / 60) * HH - 2); col.append(h('div.cal-ev' + (cls ? '.' + cls : ''), { style: { top: top + 'px', height: hgt + 'px', '--c': c }, title: `${title} ${from}–${to}`, onclick: (e) => { e.stopPropagation(); onclick && onclick(); } }, h('b', title), sub ? h('span', sub) : null)); };
    for (const [i, d] of days.entries()) {
      const date = dates[i]; const absent = absences.some((a) => a.from <= date && date <= a.to);
      const col = h('div.cal-col' + (absent ? '.absent' : ''), { onclick: (e) => { const y = e.offsetY; const hr = SW.clamp(Math.floor(y / HH) + H0, H0, H1 - 1); const ent = { ...M.newTimeEntry(), teacherId: t.id, date, from: `${String(hr).padStart(2, '0')}:00`, to: `${String(hr + 1).padStart(2, '0')}:00` }; entryModal(state, t, null); const m = document.querySelector('.modal-bd:last-child'); if (m) { const ins = m.querySelectorAll('input'); if (ins[0]) { ins[0].value = date; ins[0].dispatchEvent(new Event('input')); } if (ins[1]) { ins[1].value = ent.from; ins[1].dispatchEvent(new Event('input')); } if (ins[2]) { ins[2].value = ent.to; ins[2].dispatchEvent(new Event('input')); } } } });
      if (inSemester && tt && !absent) for (const l of D.lessonsFor(tt, { teacherId: t.id, day: d })) { const s0 = state.settings.slots[l.slot - 1], s1 = state.settings.slots[l.slot + (l.len || 1) - 2]; if (!s0 || !s1) continue; const sj = D.subjectOf(state, l.subjectId); place(col, s0.start, s1.end, '', sj?.color || '#888', `${D.classOf(state, l.classId)?.name || ''} · ${sj?.short || ''}`, D.roomOf(state, l.roomId)?.name || '', () => (location.hash = '#/stundenplan?view=lehrperson&id=' + t.id)); }
      for (const e of state.timeEntries.filter((x) => x.teacherId === t.id && x.date === date)) place(col, e.from, e.to, 'time', null, `${M.TIME_KINDS.find((k) => k.id === e.kind)?.icon || ''} ${M.TIME_KINDS.find((k) => k.id === e.kind)?.name || e.kind}`, e.note, () => entryModal(state, t, e));
      for (const b of state.bookings.filter((x) => x.teacherId === t.id && x.date === date)) place(col, b.from, b.to, 'booking', null, b.title, D.roomOf(state, b.roomId)?.name || '', () => (location.hash = '#/hauswart'));
      if (absent) col.append(h('div.cal-ev', { style: { top: '4px', '--c': 'var(--err)' } }, h('b', 'Abwesend'), M.ABSENCE_REASONS.find((r) => r.id === absences.find((a) => a.from <= date && date <= a.to)?.reason)?.name || ''));
      grid.append(col);
    }
    // Auswertung
    const ws = weekSummary(state, tt, t, weekStart);
    let cum = 0, cumSoll = 0; const rows = [];
    for (let w = 7; w >= 0; w--) { const mon = SW.addDays(weekStart, -7 * w); if (mon < SW.startOfWeek(semStart)) continue; const s = weekSummary(state, tt, t, mon); rows.push({ kw: SW.isoWeek(mon), mon, ...s }); }
    const semWeeks = []; for (let mon = SW.startOfWeek(semStart); mon <= weekStart; mon = SW.addDays(mon, 7)) { const s = weekSummary(state, tt, t, mon); cum += s.ist; cumSoll += s.soll; semWeeks.push(mon); }
    const saldo = ws.ist - ws.soll; const cumSaldo = cum - cumSoll;
    const summary = h('div.col.g12',
      h('div.stat-row', U.stat('Soll / Woche', SW.fmtHours(ws.soll)), U.stat('Ist / Woche', SW.fmtHours(ws.ist)), U.stat('Lektionen', String(ws.lessons)), U.stat('Erfasst', SW.fmtHours(ws.extra))),
      U.meter(ws.soll ? ws.ist / ws.soll : 0, { label: SW.fmtHours(ws.ist) + ' / ' + SW.fmtHours(ws.soll), cls: ws.ist > ws.soll * 1.1 ? 'warn' : 'ok' }),
      h('div.flex.jc-b.ai-c', h('span.small.muted', 'Saldo diese Woche'), h('b.' + (saldo > 0 ? 'warn-c' : 'ok-c'), (saldo > 0 ? '+' : '') + SW.fmtHours(saldo))),
      h('div.flex.jc-b.ai-c', h('span.small.muted', `Seit Semesterbeginn (${semWeeks.length} Wochen)`), h('b.' + (cumSaldo > 0 ? 'warn-c' : 'ok-c'), (cumSaldo > 0 ? '+' : '') + SW.fmtHours(cumSaldo))),
      h('p.tiny.faint', `Annahmen: ${state.settings.annualHoursFull} h Jahresarbeitszeit bei 100 %, ${WEEKS_PER_YEAR} Arbeitswochen, Pensum ${t.employment || 100} %. Pro Lektion zählen ${state.settings.lessonMinutes} Minuten Unterricht plus ${state.settings.lessonMinutes} Minuten pauschale Vor-/Nachbereitung; Sitzungen, Beratung und Weiterbildung werden manuell erfasst.`),
    );
    el.append(h('div.grid', { style: { gridTemplateColumns: 'minmax(0, 1fr) 300px' } }, h('div.col.g12', nav, h('div.card.pad-s', h('div.scroll-x', grid)), h('div.legend', h('span', h('i', { style: { background: 'var(--tint)' } }), 'Unterricht'), h('span', h('i', { style: { background: 'var(--card-3)', border: '1px dashed var(--txt-3)' } }), 'Arbeitszeit-Eintrag'), h('span', h('i', { style: { background: 'var(--pro)' } }), 'Anlass'), h('span.faint', 'Klick in eine leere Stunde erfasst einen Eintrag'))), h('div.col.g12', U.card({ title: 'Arbeitszeit', icon: '⏱️', sub: `${t.emoji} ${t.code || ''}`, body: summary }), U.card({ title: 'Letzte Wochen', icon: '📈', body: U.table({ cls: 'compact', cols: [{ label: 'KW', render: (r) => String(r.kw) }, { label: 'Lekt.', cls: 'r', render: (r) => String(r.lessons) }, { label: 'Ist', cls: 'r', render: (r) => SW.fmtHours(r.ist) }, { label: 'Saldo', cls: 'r', render: (r) => h('span' + (r.ist - r.soll > 0 ? '.warn-c' : '.ok-c'), (r.ist - r.soll > 0 ? '+' : '') + SW.fmtHours(r.ist - r.soll)) }], rows, empty: h('p.muted.small', 'Noch keine Wochen im Semester.') }) }))));
    if (window.innerWidth < 900) el.lastChild.style.gridTemplateColumns = '1fr';
  }

  SW.views.kalender = { title: 'Kalender & Arbeitszeit', render(el) { el.append(U.proGate('calendar', () => { const w = h('div.col.g16'); content(w); return w; })); } };
})();
