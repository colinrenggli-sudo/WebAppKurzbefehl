/* STUNDENWERK · views/facility.js — Hauswart & Events (Pro): Buchungen, abgeleitete Aufgaben, Reinigungsplan, Belegung. */
(function () {
  const SW = (globalThis.SW = globalThis.SW || {});
  const h = SW.h; const U = SW.ui; const M = SW.model; const D = SW.domain;
  SW.views = SW.views || {};
  let tab = 'buchungen'; let mode = 'liste'; let weekStart = SW.startOfWeek(SW.isoDate()); let cleanDate = SW.isoDate(); let occDay = SW.clamp(SW.weekday(SW.isoDate()), 1, 5);
  let filters = { q: '', kind: '', room: '', status: '' }; let onlyOpen = true;
  const kindOf = (id) => M.BOOKING_KINDS.find((k) => k.id === id) || M.BOOKING_KINDS[0];
  const STATUS = [{ id: 'offen', name: 'Offen', cls: 'warn' }, { id: 'bestätigt', name: 'Bestätigt', cls: 'ok' }, { id: 'erledigt', name: 'Erledigt', cls: '' }];
  const statusChip = (s) => { const st = STATUS.find((x) => x.id === s) || STATUS[0]; return h('span.chip.sm' + (st.cls ? '.' + st.cls : ''), st.name); };
  const overlap = (a1, a2, b1, b2) => SW.minutes(a1) < SW.minutes(b2) && SW.minutes(b1) < SW.minutes(a2);

  // Unterricht laut Plan, der sich mit einer Buchung überschneidet (Wochentag des Datums)
  function lessonConflicts(state, b) {
    const tt = state.timetable; if (!tt || !b.roomId || !b.date) return [];
    const wd = SW.weekday(b.date); const out = [];
    for (const l of D.lessonsFor(tt, { roomId: b.roomId, day: wd })) { const s0 = state.settings.slots[l.slot - 1], s1 = state.settings.slots[l.slot + (l.len || 1) - 2]; if (s0 && s1 && overlap(b.from, b.to, s0.start, s1.end)) out.push(l); }
    return out;
  }
  function bookingConflicts(state, b) { return state.bookings.filter((o) => o.id !== b.id && o.roomId === b.roomId && o.date === b.date && overlap(b.from, b.to, o.from, o.to)); }

  // Abgeleitete Aufgaben einer Buchung
  function tasksOf(state, b) {
    if (!b.autoTasks) return [];
    const room = D.roomOf(state, b.roomId); const out = []; const done = b.tasksDone || {};
    const minus = (t, m) => SW.hhmm(Math.max(0, SW.minutes(t) - m)); const plus = (t, m) => SW.hhmm(Math.min(23 * 60 + 59, SW.minutes(t) + m));
    if (['event', 'extern', 'pruefung'].includes(b.kind)) out.push({ key: 'aufbau', name: 'Aufbau / Bestuhlung', icon: '🪑', time: minus(b.from, 60), who: b.assignee || 'Hauswart' });
    if (room && (room.features || []).some((f) => ['beamer', 'display', 'lautsprecher', 'buehne'].includes(f))) out.push({ key: 'technik', name: 'Technik-Check', icon: '🎛️', time: minus(b.from, 30), who: 'Technik' });
    out.push({ key: 'reinigung', name: 'Reinigung', icon: '🧹', time: b.to, who: b.assignee || 'Hauswart', dur: '1 h' });
    if (['event', 'extern'].includes(b.kind)) out.push({ key: 'abbau', name: 'Abbau', icon: '🔧', time: plus(b.to, 15), who: b.assignee || 'Hauswart' });
    return out.map((t) => ({ ...t, booking: b, done: !!done[t.key], room }));
  }

  function bookingModal(state, existing) {
    const b = existing ? SW.clone(existing) : { ...M.newBooking(), roomId: state.rooms.find((r) => r.type === 'aula')?.id || state.rooms[0]?.id || null };
    const warn = h('div');
    const check = () => { const lc = lessonConflicts(state, b); const bc = bookingConflicts(state, b); const room = D.roomOf(state, b.roomId); const items = []; if (bc.length) items.push(U.banner(h('span', h('b', 'Doppelbuchung: '), bc.map((o) => `${o.title} (${o.from}–${o.to})`).join(', ')), 'err')); if (lc.length) items.push(U.banner(h('span', h('b', 'Überschneidung mit Unterricht: '), SW.uniq(lc.map((l) => `${D.classOf(state, l.classId)?.name} ${D.subjectOf(state, l.subjectId)?.short} (${D.slotLabel(state, l.slot)})`)).join(', '), ' – Klassen müssen umgeteilt werden.'), 'warn')); if (room && b.attendees > (room.capacity || 0) && room.capacity) items.push(U.banner(h('span', `${b.attendees} Teilnehmende, aber ${room.name} fasst ${room.capacity}.`), 'warn')); if (room && b.date) { const wd = SW.weekday(b.date); const blocked = SW.range(D.slotCount(state), 1).filter((s) => D.roomBlocked(room, wd, s)); if (blocked.length) items.push(U.banner(h('span', `Hinweis: ${room.name} hat am ${M.dayName(wd)} wöchentliche Sperrzeiten (Lektionen ${blocked.join(', ')}).`), 'info')); } SW.mount(warn, items); };
    const body = h('div.col.g12',
      h('div.form-grid',
        U.field('Titel', U.input({ value: b.title, oninput: (v) => (b.title = v), placeholder: 'z. B. Informationsabend' }), { cls: 'span2' }),
        U.field('Raum', U.select(state.rooms.map((r) => ({ value: r.id, label: `${M.roomType(r.type).icon} ${r.name} (${r.capacity})` })), b.roomId, (v) => { b.roomId = v; check(); })),
        U.field('Art', U.select(M.BOOKING_KINDS.map((k) => ({ value: k.id, label: `${k.icon} ${k.name}` })), b.kind, (v) => (b.kind = v))),
        U.field('Datum', U.input({ type: 'date', value: b.date, oninput: (v) => { b.date = v; check(); } })),
        U.field('Teilnehmende', U.input({ type: 'number', value: b.attendees || 0, min: 0, oninput: (v) => { b.attendees = Number(v) || 0; check(); } })),
        U.field('Von', U.input({ type: 'time', value: b.from, oninput: (v) => { b.from = v; check(); } })),
        U.field('Bis', U.input({ type: 'time', value: b.to, oninput: (v) => { b.to = v; check(); } })),
        U.field('Verantwortlich', h('div.col.g6', U.input({ value: b.assignee, oninput: (v) => (b.assignee = v), placeholder: 'Hauswart', id: 'fac-assignee' }), h('div.chips', ['Hauswart', 'Technik', 'Schulleitung', 'Sekretariat'].map((n) => h('span.chip.pick', { onclick: () => { b.assignee = n; document.getElementById('fac-assignee').value = n; } }, n))))),
        U.field('Status', U.select(STATUS.map((s) => ({ value: s.id, label: s.name })), b.status, (v) => (b.status = v))),
        U.field('Notizen', U.textarea({ value: b.notes, oninput: (v) => (b.notes = v), rows: 2 }), { cls: 'span2' }),
        U.field('Aufgaben', h('div.flex.ai-c.g10', U.switchEl(b.autoTasks !== false, (v) => (b.autoTasks = v)), h('span.small', 'Aufbau, Technik-Check, Reinigung und Abbau automatisch ableiten'))),
      ), warn);
    check();
    const m = U.modal({ title: existing ? 'Buchung bearbeiten' : 'Buchung anlegen', size: 'wide', body, footer: [h('button.btn', { onclick: () => m.close() }, 'Abbrechen'), h('button.btn.primary', { onclick: () => {
      if (!b.title.trim() || !b.roomId || !b.date) return U.toast('Titel, Raum und Datum angeben', { type: 'warn' });
      if (SW.minutes(b.to) <= SW.minutes(b.from)) return U.toast('«Bis» muss nach «Von» liegen', { type: 'warn' });
      if (bookingConflicts(state, b).length) return U.toast('Der Raum ist zu dieser Zeit bereits gebucht', { type: 'err' });
      SW.store.put('bookings', b); m.close(); U.toast(existing ? 'Buchung gespeichert' : 'Buchung angelegt', { type: 'ok' });
      if (!existing && ['event', 'extern'].includes(b.kind)) SW.store.notify({ icon: '🎉', text: `${D.roomOf(state, b.roomId)?.name || 'Raum'} gebucht: ${b.title} am ${SW.fmtDate(b.date)} ${b.from}–${b.to}.`, link: '#/hauswart' });
    } }, 'Speichern')] });
  }

  function bookingsTab(state) {
    const wrap = h('div.col.g12');
    const list = SW.sortBy(state.bookings.filter((b) => (!filters.q || (b.title + ' ' + (b.notes || '')).toLowerCase().includes(filters.q.toLowerCase())) && (!filters.kind || b.kind === filters.kind) && (!filters.room || b.roomId === filters.room) && (!filters.status || b.status === filters.status)), (b) => b.date, (b) => b.from);
    wrap.append(h('div.toolbar', h('div.search', SW.icon('search'), U.input({ value: filters.q, placeholder: 'Suchen', oninput: (v) => { filters.q = v; SW.router.refresh(); } })), U.select(M.BOOKING_KINDS.map((k) => ({ value: k.id, label: k.icon + ' ' + k.name })), filters.kind, (v) => { filters.kind = v || ''; SW.router.refresh(); }, { placeholder: 'Alle Arten', cls: 'sm' }), U.select(state.rooms.map((r) => ({ value: r.id, label: r.name })), filters.room, (v) => { filters.room = v || ''; SW.router.refresh(); }, { placeholder: 'Alle Räume', cls: 'sm' }), U.select(STATUS.map((s) => ({ value: s.id, label: s.name })), filters.status, (v) => { filters.status = v || ''; SW.router.refresh(); }, { placeholder: 'Alle Status', cls: 'sm' }), h('span.spacer'), U.seg([{ value: 'liste', label: 'Liste' }, { value: 'woche', label: 'Woche' }], mode, (v) => { mode = v; SW.router.refresh(); }, { sm: true })));
    const menu = (b) => (e) => U.menu(e.currentTarget, [{ label: 'Bearbeiten', icon: 'edit', fn: () => bookingModal(state, b) }, { label: b.status === 'bestätigt' ? 'Als erledigt markieren' : 'Bestätigen', icon: 'check', fn: () => SW.store.patch('bookings', b.id, { status: b.status === 'bestätigt' ? 'erledigt' : 'bestätigt' }) }, { label: 'Duplizieren', icon: 'copy', fn: () => SW.store.add('bookings', { ...SW.clone(b), id: SW.uid('b'), date: SW.addDays(b.date, 7), status: 'offen', tasksDone: {} }) }, 'sep', { label: 'Löschen', icon: 'trash', danger: true, fn: async () => { if (await U.confirm({ title: 'Buchung löschen?', ok: 'Löschen', danger: true })) SW.store.remove('bookings', b.id); } }]);
    const card = (b) => { const room = D.roomOf(state, b.roomId); const lc = lessonConflicts(state, b); return h('div.flex.ai-c.g12.wrap', { style: { padding: '10px 0', borderBottom: '1px solid var(--sep)' } }, h('span', { style: { fontSize: '22px' } }, kindOf(b.kind).icon), h('div.grow', h('div.strong', b.title), h('div.small.muted', `${b.from}–${b.to} · ${room ? M.roomType(room.type).icon + ' ' + room.name : 'kein Raum'}${b.attendees ? ' · ' + b.attendees + ' Personen' : ''}${b.assignee ? ' · ' + b.assignee : ''}`)), lc.length ? h('span.chip.sm.warn', { title: 'Überschneidung mit Unterricht' }, '⚠️ Unterricht') : null, statusChip(b.status), h('button.btn.icon.sm.ghost', { onclick: menu(b) }, SW.icon('more'))); };
    if (mode === 'liste') {
      if (!list.length) wrap.append(U.empty({ icon: '🎉', title: 'Keine Buchungen', text: 'Anlässe, Prüfungen, Sitzungen und externe Vermietungen hier erfassen.', action: h('button.btn.primary', { onclick: () => bookingModal(state) }, 'Buchung anlegen') }));
      else { const byDate = SW.groupBy(list, (b) => b.date); const today = SW.isoDate(); for (const [date, bs] of Object.entries(byDate)) wrap.append(h('div.card.pad-s', h('div.flex.ai-c.g8.mb8', h('h3', SW.fmtDateLong(date)), date === today ? h('span.chip.sm.tint', 'heute') : date < today ? h('span.chip.sm', 'vergangen') : null), bs.map(card))); }
    } else {
      const dates = SW.range(7).map((i) => SW.addDays(weekStart, i));
      wrap.append(h('div.toolbar', h('button.btn.icon.sm', { onclick: () => { weekStart = SW.addDays(weekStart, -7); SW.router.refresh(); } }, SW.icon('chevronLeft')), h('button.btn.sm', { onclick: () => { weekStart = SW.startOfWeek(SW.isoDate()); SW.router.refresh(); } }, 'Heute'), h('button.btn.icon.sm', { onclick: () => { weekStart = SW.addDays(weekStart, 7); SW.router.refresh(); } }, SW.icon('chevronRight')), h('h3', `KW ${SW.isoWeek(weekStart)}`)));
      wrap.append(h('div.scroll-x', h('div.grid', { style: { gridTemplateColumns: 'repeat(7, minmax(150px, 1fr))', minWidth: '1050px' } }, dates.map((date) => h('div.card.pad-s', { style: date === SW.isoDate() ? { borderColor: 'var(--tint)' } : null }, h('div.strong.mb8', SW.fmtDate(date, { weekday: 'short', day: 'numeric', month: 'numeric' })), list.filter((b) => b.date === date).map((b) => h('div.ls', { style: { '--c': b.kind === 'event' || b.kind === 'extern' ? 'var(--pro)' : b.kind === 'reinigung' || b.kind === 'unterhalt' ? 'var(--warn)' : 'var(--info)', marginBottom: '6px', cursor: 'pointer' }, onclick: () => bookingModal(state, b) }, h('b', kindOf(b.kind).icon + ' ' + b.title), h('div.m', h('span', `${b.from}–${b.to}`), h('span', D.roomOf(state, b.roomId)?.name || '')))), h('button.btn.xs.ghost.w100', { onclick: () => { const nb = { ...M.newBooking(), date }; bookingModal(state, null); setTimeout(() => { const i = document.querySelector('.modal input[type=date]'); if (i) { i.value = date; i.dispatchEvent(new Event('input')); } }, 20); } }, '+ Buchung'))))));
    }
    return wrap;
  }

  function tasksTab(state) {
    const all = state.bookings.flatMap((b) => tasksOf(state, b)).filter((t) => !onlyOpen || !t.done);
    const sorted = SW.sortBy(all, (t) => t.booking.date, (t) => t.time);
    const today = SW.isoDate(); const weekEnd = SW.addDays(SW.startOfWeek(today), 6);
    const wrap = h('div.col.g12');
    wrap.append(h('div.grid.c3', U.kpi({ label: 'Heute offen', value: String(all.filter((t) => t.booking.date === today && !t.done).length), icon: '📌' }), U.kpi({ label: 'Diese Woche', value: String(all.filter((t) => t.booking.date >= SW.startOfWeek(today) && t.booking.date <= weekEnd).length), icon: '🗓️' }), U.kpi({ label: 'Gesamt offen', value: String(state.bookings.flatMap((b) => tasksOf(state, b)).filter((t) => !t.done).length), icon: '🧹' })));
    wrap.append(h('div.toolbar', U.check('Nur offene', onlyOpen, (v) => { onlyOpen = v; SW.router.refresh(); }), h('span.spacer'), h('button.btn.sm', { onclick: () => window.print() }, SW.icon('print'), 'Liste drucken')));
    if (!sorted.length) wrap.append(U.empty({ icon: '✅', title: 'Keine Aufgaben', text: 'Aufgaben entstehen automatisch aus Buchungen mit aktivierter Aufgaben-Ableitung.' }));
    else { const byDate = SW.groupBy(sorted, (t) => t.booking.date); for (const [date, ts] of Object.entries(byDate)) wrap.append(h('div.card.pad-s', h('h3.mb8', SW.fmtDateLong(date)), h('ul.list', ts.map((t) => h('li', h('label.check', h('input', { type: 'checkbox', checked: t.done, onchange: (e) => SW.store.patch('bookings', t.booking.id, { tasksDone: { ...(t.booking.tasksDone || {}), [t.key]: e.target.checked } }) })), h('span', t.icon), h('div.grow', h('div.strong' + (t.done ? '.muted' : ''), { style: t.done ? { textDecoration: 'line-through' } : null }, `${t.time} · ${t.name}${t.dur ? ' (' + t.dur + ')' : ''}`), h('div.small.muted', `${t.room?.name || ''} · ${t.booking.title} · ${t.who}`)), h('span.chip.sm', t.who)))))); }
    return wrap;
  }

  function cleaningTab(state) {
    const tt = state.timetable; const wd = SW.weekday(cleanDate); const doneList = (state.cleaningDone || {})[cleanDate] || [];
    const wrap = h('div.col.g12');
    wrap.append(h('div.toolbar', U.input({ type: 'date', value: cleanDate, onchange: (v) => { cleanDate = v; SW.router.refresh(); } }), h('span.small.muted', `${M.dayName(wd)} · ${D.days(state).includes(wd) ? 'Unterrichtstag' : 'kein Unterrichtstag'}`)));
    const rows = state.rooms.filter((r) => r.active !== false).map((r) => { const ls = tt && D.days(state).includes(wd) ? D.lessonsFor(tt, { roomId: r.id, day: wd }) : []; const bs = state.bookings.filter((b) => b.roomId === r.id && b.date === cleanDate); let lastEnd = null; for (const l of ls) { const s1 = state.settings.slots[l.slot + (l.len || 1) - 2]; if (s1 && (!lastEnd || SW.minutes(s1.end) > SW.minutes(lastEnd))) lastEnd = s1.end; } for (const b of bs) if (!lastEnd || SW.minutes(b.to) > SW.minutes(lastEnd)) lastEnd = b.to; return { r, uses: SW.sum(ls, (l) => l.len || 1), bookings: bs, lastEnd, done: doneList.includes(r.id) }; });
    const used = rows.filter((x) => x.uses || x.bookings.length); const unused = rows.filter((x) => !x.uses && !x.bookings.length);
    const toggle = (rid, v) => SW.store.update((s) => { s.cleaningDone = s.cleaningDone || {}; const l = new Set(s.cleaningDone[cleanDate] || []); v ? l.add(rid) : l.delete(rid); s.cleaningDone[cleanDate] = [...l]; });
    wrap.append(h('div.grid.c3', U.kpi({ label: 'Zu reinigen', value: String(used.length), icon: '🧹' }), U.kpi({ label: 'Erledigt', value: String(used.filter((x) => x.done).length), icon: '✅' }), U.kpi({ label: 'Nicht genutzt', value: String(unused.length), sub: 'keine Reinigung nötig', icon: '🚪' })));
    if (!tt) wrap.append(U.banner('Ohne Stundenplan zeigt der Reinigungsplan nur Buchungen.', 'info'));
    wrap.append(U.card({ title: 'Reinigungsplan', icon: '🧹', sub: SW.fmtDateLong(cleanDate), body: U.table({ cls: 'compact', cols: [{ label: '', render: (x) => h('input', { type: 'checkbox', checked: x.done, onchange: (e) => toggle(x.r.id, e.target.checked) }) }, { label: 'Raum', render: (x) => h('span' + (x.done ? '.muted' : '.strong'), `${M.roomType(x.r.type).icon} ${x.r.name}`) }, { label: 'Nutzungen', render: (x) => `${x.uses ? x.uses + ' Lektionen' : ''}${x.uses && x.bookings.length ? ' · ' : ''}${x.bookings.map((b) => b.title).join(', ')}` }, { label: 'Letzte Nutzung endet', cls: 'r', render: (x) => x.lastEnd || '–' }, { label: 'Reinigung ab', cls: 'r', render: (x) => h('b', x.lastEnd || '–') }], rows: SW.sortBy(used, (x) => x.lastEnd || ''), empty: h('p.muted', 'Keine Raumnutzung an diesem Tag.') }), actions: [h('button.btn.sm', { onclick: () => window.print() }, SW.icon('print'), 'Drucken')] }));
    if (unused.length) wrap.append(h('details', h('summary.small.muted', { style: { cursor: 'pointer' } }, `${unused.length} nicht genutzte Räume`), h('div.chips.mt8', unused.map((x) => h('span.chip', x.r.name)))));
    return wrap;
  }

  function occupancyTab(state) {
    const tt = state.timetable; const S = D.slotCount(state); const days = D.days(state);
    const wrap = h('div.col.g12');
    wrap.append(h('div.toolbar', U.seg(days.map((d) => ({ value: d, label: M.dayName(d, true) })), occDay, (v) => { occDay = Number(v); SW.router.refresh(); })));
    if (!tt) { wrap.append(U.banner('Ohne Stundenplan gibt es keine Belegung.', 'info')); return wrap; }
    const rooms = SW.sortBy(state.rooms.filter((r) => r.active !== false && M.roomType(r.type).teachable), (r) => r.name);
    const t = h('table.tbl.compact', { style: { minWidth: '640px' } }); t.append(h('thead', h('tr', h('th', 'Raum'), SW.range(S, 1).map((s) => h('th.c', String(s))), h('th.r', 'Woche'))));
    const tb = h('tbody');
    for (const r of rooms) { const tr = h('tr'); tr.append(h('td', h('a.strong', { href: '#/raeume/' + r.id }, `${M.roomType(r.type).icon} ${r.name}`))); for (let s = 1; s <= S; s++) { const l = tt.lessons.find((x) => x.roomId === r.id && x.day === occDay && x.slot <= s && s < x.slot + (x.len || 1)); const blocked = D.roomBlocked(r, occDay, s); tr.append(h('td.c', { style: { background: l ? `color-mix(in srgb, ${D.subjectOf(state, l.subjectId)?.color || '#888'} 25%, transparent)` : blocked ? 'repeating-linear-gradient(45deg, var(--card-3) 0 4px, transparent 4px 8px)' : '', fontSize: '11.5px', fontWeight: 600 }, title: l ? `${D.classOf(state, l.classId)?.name} · ${D.subjectOf(state, l.subjectId)?.name}` : blocked ? 'gesperrt' : 'frei' }, l ? D.classOf(state, l.classId)?.name || '' : blocked ? '⛔' : '')); } const n = SW.sum(D.lessonsFor(tt, { roomId: r.id }), (l) => l.len || 1); tr.append(h('td.r', { style: { minWidth: '120px' } }, U.meter(n / (days.length * S), { label: `${n} Lekt.` }))); tb.append(tr); }
    t.append(tb); wrap.append(h('div.card.pad-s', h('div.scroll-x', t)), h('div.legend', h('span', h('i', { style: { background: 'var(--tint-soft)' } }), 'belegt (Fachfarbe)'), h('span', h('i', { style: { background: 'repeating-linear-gradient(45deg, var(--card-3) 0 3px, transparent 3px 6px)' } }), 'gesperrt'), h('span', h('i', { style: { background: 'var(--card)', border: '1px solid var(--sep)' } }), 'frei')));
    return wrap;
  }

  function content(el, params) {
    const state = SW.store.state;
    if (params?.query?.tab) tab = params.query.tab;
    el.append(U.demoStrip('facility'));
    const open = state.bookings.flatMap((b) => tasksOf(state, b)).filter((t) => !t.done).length;
    el.append(U.pageHeader({ title: 'Hauswart & Events', lead: 'Raumbuchungen mit Konfliktprüfung gegen den Stundenplan, abgeleitete Aufgaben und Reinigungsplan.', actions: [h('button.btn.primary', { onclick: () => bookingModal(state) }, SW.icon('plus'), 'Buchung anlegen')] }));
    el.append(U.tabs([{ value: 'buchungen', label: 'Buchungen', icon: '🎉', count: state.bookings.length }, { value: 'aufgaben', label: 'Aufgaben', icon: '🧹', count: open }, { value: 'reinigung', label: 'Reinigungsplan', icon: '🗓️' }, { value: 'belegung', label: 'Belegung', icon: '🏫' }], tab, (v) => { tab = v; SW.router.refresh(); }));
    el.append(tab === 'aufgaben' ? tasksTab(state) : tab === 'reinigung' ? cleaningTab(state) : tab === 'belegung' ? occupancyTab(state) : bookingsTab(state));
  }
  SW.views.hauswart = { title: 'Hauswart & Events', render(el, params) { el.append(U.proGate('facility', () => { const w = h('div.col.g16'); content(w, params); return w; })); } };
})();
