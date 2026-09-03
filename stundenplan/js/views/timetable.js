/* STUNDENWERK · views/timetable.js — Stundenplan: Klasse / Lehrperson / Raum / Übersicht, Drag & Drop, Fixieren, Export, Druck. */
(function () {
  const SW = (globalThis.SW = globalThis.SW || {});
  const h = SW.h; const U = SW.ui; const M = SW.model; const D = SW.domain;
  SW.views = SW.views || {};

  const undoStack = [];
  const snapshot = () => SW.clone(SW.store.state.timetable.lessons);
  const pushUndo = () => { undoStack.push(snapshot()); if (undoStack.length > 50) undoStack.shift(); };
  const undo = () => { const s = undoStack.pop(); if (!s) return U.toast('Nichts rückgängig zu machen'); SW.store.update((st) => { st.timetable.lessons = s; st.timetable.status = 'draft'; }); U.toast('Rückgängig gemacht'); };
  const isAdmin = () => (SW.store.state.settings.role || 'admin') === 'admin';

  // Freien passenden Raum für eine Lektion an (day, slot) finden – bevorzugt bisheriger Raum, Stammzimmer, Nachbarlektion
  function bestRoom(state, tt, lesson, day, slot) {
    const cls = D.classOf(state, lesson.classId), subj = D.subjectOf(state, lesson.subjectId); if (!cls || !subj) return lesson.roomId || null;
    const len = lesson.len || 1;
    const free = (rid) => { const r = D.roomOf(state, rid); if (!r || !D.roomFits(r, subj, cls)) return false; for (let s = slot; s < slot + len; s++) if (D.roomBlocked(r, day, s)) return false; return !tt.lessons.some((o) => o.id !== lesson.id && o.roomId === rid && D.overlaps(o, { day, slot, len })); };
    const prefs = [lesson.roomId, cls.homeRoomId];
    const before = tt.lessons.find((o) => o.classId === cls.id && o.day === day && o.slot + (o.len || 1) === slot); const after = tt.lessons.find((o) => o.classId === cls.id && o.day === day && o.slot === slot + len);
    if (before) prefs.push(before.roomId); if (after) prefs.push(after.roomId);
    for (const p of prefs) if (p && free(p)) return p;
    for (const r of D.roomsFor(state, subj, cls)) if (free(r.id)) return r.id;
    return null;
  }
  SW.views._bestRoom = bestRoom;

  function moveLesson(lesson, day, slot) {
    const state = SW.store.state; const tt = state.timetable;
    const conflicts = D.checkMove(state, tt, lesson, day, slot, undefined).filter((c) => c.type !== 'roomBusy');
    if (conflicts.length) { U.toast('Nicht möglich: ' + conflicts[0].text, { type: 'err' }); return false; }
    const room = bestRoom(state, tt, lesson, day, slot);
    if (!room) { U.toast('Kein passender Raum frei zu dieser Zeit', { type: 'err' }); return false; }
    pushUndo();
    SW.store.update((st) => { const l = st.timetable.lessons.find((x) => x.id === lesson.id); if (l) { l.day = day; l.slot = slot; l.roomId = room; } st.timetable.status = 'draft'; });
    U.toast('Lektion verschoben', { action: { label: 'Rückgängig', fn: undo } });
    return true;
  }

  function lessonModal(lesson) {
    const state = SW.store.state; const tt = state.timetable;
    const cls = D.classOf(state, lesson.classId), subj = D.subjectOf(state, lesson.subjectId), t = D.teacherOf(state, lesson.teacherId), room = D.roomOf(state, lesson.roomId);
    const len = lesson.len || 1;
    const roomOpts = state.rooms.filter((r) => r.active !== false && subj && D.roomFits(r, subj, cls) && !tt.lessons.some((o) => o.id !== lesson.id && o.roomId === r.id && D.overlaps(o, lesson)) && !SW.range(len, lesson.slot).some((s) => D.roomBlocked(r, lesson.day, s)));
    const teacherOpts = state.teachers.filter((x) => x.active !== false && (x.id === lesson.teacherId || ((x.subjectIds || []).includes(lesson.subjectId) && SW.range(len, lesson.slot).every((s) => D.teacherAvailable(x, lesson.day, s)) && !tt.lessons.some((o) => o.id !== lesson.id && o.teacherId === x.id && D.overlaps(o, lesson)))));
    const patch = (p, msg) => { pushUndo(); SW.store.update((st) => { const l = st.timetable.lessons.find((x) => x.id === lesson.id); if (l) Object.assign(l, p); st.timetable.status = 'draft'; }); if (msg) U.toast(msg, { type: 'ok' }); };
    const conflicts = D.checkMove(state, tt, lesson, lesson.day, lesson.slot, lesson.roomId);
    const body = h('div.col.g12',
      h('div.flex.ai-c.g10', h('span.subj', { style: { '--c': subj?.color || '#999', fontSize: '18px' } }, h('i'), subj?.name || '?'), h('span.chip', `${M.dayName(lesson.day)} · ${D.slotLabel(state, lesson.slot)}${len > 1 ? ' – ' + (state.settings.slots[lesson.slot + len - 2]?.end || '') : ''}`), h('span.chip', len > 1 ? 'Doppellektion' : 'Einzellektion')),
      conflicts.length ? U.banner(h('span', h('b', 'Konflikte: '), conflicts.map((c) => c.text).join(' · ')), 'err') : null,
      h('div.form-grid',
        U.field('Klasse', h('a.btn', { href: '#/klassen/' + (cls?.id || '') }, cls?.name || '?')),
        U.field('Lehrperson', isAdmin() ? U.select(teacherOpts.map((x) => ({ value: x.id, label: `${x.emoji} ${x.code || ''}` })), lesson.teacherId, (v) => patch({ teacherId: v }, 'Lehrperson geändert'), { placeholder: 'keine' }) : U.teacherPill(t), { hint: isAdmin() ? 'Nur qualifizierte, verfügbare und freie Lehrpersonen' : '' }),
        U.field('Raum', isAdmin() ? U.select(roomOpts.map((r) => ({ value: r.id, label: `${M.roomType(r.type).icon} ${r.name} (${r.capacity})` })), lesson.roomId, (v) => patch({ roomId: v }, 'Raum geändert'), { placeholder: 'kein Raum' }) : U.roomTag(room), { hint: isAdmin() ? 'Nur passende, zu dieser Zeit freie Räume' : '' }),
      ),
      isAdmin() ? U.banner(h('span', lesson.locked ? 'Diese Lektion ist fixiert und bleibt bei einer Neugenerierung an ihrem Platz.' : 'Fixierte Lektionen behält der Generator beim nächsten Lauf bei.'), '', { icon: 'pin' }) : null,
    );
    const footer = isAdmin() ? [
      h('button.btn.danger.soft', { onclick: async () => { if (await U.confirm({ title: 'Lektion löschen?', text: 'Die Lektion fehlt dann im Plan der Klasse. Der Generator ergänzt sie beim nächsten Lauf wieder.', ok: 'Löschen', danger: true })) { pushUndo(); SW.store.update((st) => { st.timetable.lessons = st.timetable.lessons.filter((x) => x.id !== lesson.id); st.timetable.status = 'draft'; }); m.close(); U.toast('Lektion gelöscht', { action: { label: 'Rückgängig', fn: undo } }); } } }, SW.icon('trash'), 'Löschen'),
      h('span.left'),
      h('button.btn', { onclick: () => { patch({ locked: !lesson.locked }); m.close(); U.toast(lesson.locked ? 'Fixierung gelöst' : 'Lektion fixiert', { type: 'ok' }); } }, SW.icon(lesson.locked ? 'unlock' : 'lock'), lesson.locked ? 'Fixierung lösen' : 'Fixieren'),
      h('button.btn.primary', { onclick: () => m.close() }, 'Fertig'),
    ] : [h('button.btn.primary', { onclick: () => m.close() }, 'Schliessen')];
    const m = U.modal({ title: `${cls?.name || ''} · ${subj?.short || ''}`, sub: t ? `${D.teacherLabel(t)} · ${room ? room.name : 'kein Raum'}` : 'keine Lehrperson', body, footer });
  }

  function addLessonModal(cls, day, slot) {
    const state = SW.store.state; const tt = state.timetable;
    const reqs = D.classRequirements(state, cls);
    let subjectId = reqs[0]?.subjectId || state.subjects[0]?.id; let teacherId = null; let len = 1; let roomId = null;
    const info = h('div.small.muted');
    const teacherSel = U.select([], null, (v) => (teacherId = v), { placeholder: 'Lehrperson wählen' });
    const roomSel = U.select([], null, (v) => (roomId = v), { placeholder: 'Raum wählen' });
    const refill = () => {
      const subj = D.subjectOf(state, subjectId); const probe = { id: '_new', classId: cls.id, subjectId, day, slot, len };
      const ts = state.teachers.filter((x) => x.active !== false && (x.subjectIds || []).includes(subjectId) && SW.range(len, slot).every((s) => D.teacherAvailable(x, day, s)) && !tt.lessons.some((o) => o.teacherId === x.id && D.overlaps(o, probe)));
      SW.mount(teacherSel, h('option', { value: '' }, ts.length ? 'Lehrperson wählen' : 'keine freie Lehrperson'), ts.map((x) => h('option', { value: x.id, selected: x.id === teacherId }, `${x.emoji} ${x.code || ''}`)));
      if (!ts.some((x) => x.id === teacherId)) teacherId = (cls.subjectTeachers || {})[subjectId] && ts.some((x) => x.id === cls.subjectTeachers[subjectId]) ? cls.subjectTeachers[subjectId] : (ts[0]?.id || null); teacherSel.value = teacherId || '';
      const rs = subj ? state.rooms.filter((r) => r.active !== false && D.roomFits(r, subj, cls) && !tt.lessons.some((o) => o.roomId === r.id && D.overlaps(o, probe)) && !SW.range(len, slot).some((s) => D.roomBlocked(r, day, s))) : [];
      SW.mount(roomSel, h('option', { value: '' }, rs.length ? 'Raum wählen' : 'kein Raum frei'), rs.map((r) => h('option', { value: r.id, selected: r.id === roomId }, `${M.roomType(r.type).icon} ${r.name} (${r.capacity})`)));
      if (!rs.some((r) => r.id === roomId)) roomId = rs.find((r) => r.id === cls.homeRoomId)?.id || rs[0]?.id || null; roomSel.value = roomId || '';
      const have = SW.sum(D.lessonsFor(tt, { classId: cls.id }).filter((l) => l.subjectId === subjectId), (l) => l.len || 1); const need = reqs.find((r) => r.subjectId === subjectId)?.lessons || 0;
      info.textContent = `${subj?.name || ''}: ${have} von ${need} Lektionen pro Woche im Plan`;
    };
    const body = h('div.col.g12',
      h('div.form-grid',
        U.field('Fach', U.select(state.subjects.map((s) => ({ value: s.id, label: s.name })), subjectId, (v) => { subjectId = v; refill(); })),
        U.field('Länge', U.seg([{ value: 1, label: 'Einzellektion' }, { value: 2, label: 'Doppellektion' }], 1, (v) => { len = Number(v); refill(); })),
        U.field('Lehrperson', teacherSel), U.field('Raum', roomSel),
      ), info);
    refill();
    const m = U.modal({ title: `Lektion hinzufügen · ${cls.name}`, sub: `${M.dayName(day)} · ${D.slotLabel(state, slot)}`, body, footer: [h('button.btn', { onclick: () => m.close() }, 'Abbrechen'), h('button.btn.primary', { onclick: () => {
      if (!subjectId || !teacherId || !roomId) return U.toast('Fach, Lehrperson und Raum wählen', { type: 'warn' });
      const l = { id: SW.uid('l'), classId: cls.id, subjectId, teacherId, roomId, day, slot, len, locked: true };
      const c = D.checkMove(state, tt, l, day, slot, roomId); if (c.length) return U.toast(c[0].text, { type: 'err' });
      pushUndo(); SW.store.update((st) => { st.timetable.lessons.push(l); st.timetable.status = 'draft'; }); m.close(); U.toast('Lektion hinzugefügt (fixiert)', { type: 'ok' });
    } }, 'Hinzufügen')] });
  }

  // ---------- Export ----------
  function exportCSV(state, lessons, name) {
    const rows = [['Klasse', 'Fach', 'Lehrperson', 'Raum', 'Tag', 'Lektion', 'Beginn', 'Ende', 'Länge']];
    for (const l of SW.sortBy(lessons, (l) => l.day, (l) => l.slot)) { const s0 = state.settings.slots[l.slot - 1], s1 = state.settings.slots[l.slot + (l.len || 1) - 2]; rows.push([D.classOf(state, l.classId)?.name, D.subjectOf(state, l.subjectId)?.name, D.teacherLabel(D.teacherOf(state, l.teacherId)), D.roomOf(state, l.roomId)?.name || '', M.dayName(l.day), l.slot, s0?.start, s1?.end, l.len || 1]); }
    SW.download(`stundenplan-${name}.csv`, '﻿' + rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\n'), 'text/csv');
  }
  function exportICS(state, lessons, name) {
    const start = state.settings.semesterStart || SW.isoDate(); const monday = SW.startOfWeek(start);
    const fmt = (date, hhmm) => date.replace(/-/g, '') + 'T' + hhmm.replace(':', '') + '00';
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//STUNDENWERK//DE', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:' + name];
    for (const l of lessons) { const d = SW.addDays(monday, l.day - 1); const s0 = state.settings.slots[l.slot - 1], s1 = state.settings.slots[l.slot + (l.len || 1) - 2]; if (!s0 || !s1) continue; lines.push('BEGIN:VEVENT', 'UID:' + l.id + '@stundenwerk', 'DTSTAMP:' + fmt(SW.isoDate(), '00:00'), 'DTSTART:' + fmt(d, s0.start), 'DTEND:' + fmt(d, s1.end), 'RRULE:FREQ=WEEKLY;COUNT=20', 'SUMMARY:' + `${D.classOf(state, l.classId)?.name || ''} ${D.subjectOf(state, l.subjectId)?.short || ''} (${D.teacherLabel(D.teacherOf(state, l.teacherId))})`, 'LOCATION:' + (D.roomOf(state, l.roomId)?.name || ''), 'END:VEVENT'); }
    lines.push('END:VCALENDAR');
    SW.download(`stundenplan-${name}.ics`, lines.join('\r\n'), 'text/calendar');
  }

  // ---------- Übersicht (Klassen × Lektionen eines Tages) ----------
  function overview(state, tt, day) {
    const slots = D.slots(state); const rooms = state.rooms.filter((r) => M.roomType(r.type).teachable && r.active !== false).length;
    const classes = SW.sortBy(state.classes, (k) => k.name);
    const table = h('table.tbl.compact', { style: { minWidth: '720px' } });
    table.append(h('thead', h('tr', h('th', 'Klasse'), slots.map((s) => h('th.c', { title: `${s.start}–${s.end}` }, String(s.n))))));
    const tb = h('tbody'); const used = slots.map(() => 0);
    for (const k of classes) {
      const tr = h('tr'); tr.append(h('td', h('a.strong', { href: '#/stundenplan?view=klasse&id=' + k.id }, k.name)));
      const ls = D.lessonsFor(tt, { classId: k.id, day });
      const off = k.schoolDays?.length && !k.schoolDays.includes(day);
      for (let s = 1; s <= slots.length; s++) {
        const l = ls.find((x) => x.slot <= s && s < x.slot + (x.len || 1));
        if (l) { used[s - 1]++; const sj = D.subjectOf(state, l.subjectId); const t = D.teacherOf(state, l.teacherId); tr.append(h('td.c', { style: { background: `color-mix(in srgb, ${sj?.color || '#888'} 22%, transparent)`, fontWeight: 600, fontSize: '12px', cursor: 'pointer' }, title: `${sj?.name || ''} · ${D.teacherLabel(t)} · ${D.roomOf(state, l.roomId)?.name || ''}`, onclick: () => lessonModal(l) }, sj?.short || '?')); }
        else tr.append(h('td.c', { style: off ? { background: 'var(--card-3)', opacity: 0.5 } : null }, off ? '' : '·'));
      }
      tb.append(tr);
    }
    table.append(tb, h('tfoot', h('tr', h('th', 'Räume belegt'), used.map((n) => h('th.c', { style: { color: n > rooms ? 'var(--err)' : 'inherit' } }, `${n}/${rooms}`)))));
    return h('div.scroll-x', table);
  }

  SW.views.stundenplan = {
    title: 'Stundenplan',
    render(el, params) {
      const state = SW.store.state; const tt = state.timetable;
      if (!tt) { el.append(U.pageHeader({ title: 'Stundenplan' }), U.empty({ icon: '🗓️', title: 'Noch kein Stundenplan', text: 'Der Generator erstellt aus Klassen, Lehrpersonen und Räumen einen konfliktfreien Wochenplan.', action: h('a.btn.primary.lg', { href: '#/generator' }, SW.icon('wand'), 'Stundenplan generieren') })); return; }
      const q = params.query || {};
      let view = q.view || 'klasse'; if (!['klasse', 'lehrperson', 'raum', 'uebersicht'].includes(view)) view = 'klasse';
      const lists = { klasse: SW.sortBy(state.classes, (k) => k.name), lehrperson: SW.sortBy(state.teachers.filter((t) => t.active !== false), (t) => t.code || t.emoji), raum: SW.sortBy(state.rooms.filter((r) => M.roomType(r.type).teachable), (r) => r.name) };
      const list = lists[view] || []; let id = q.id && list.some((x) => x.id === q.id) ? q.id : list[0]?.id;
      if (view === 'lehrperson' && !q.id && state.settings.role === 'teacher' && state.settings.currentTeacherId) id = state.settings.currentTeacherId;
      const day = Number(q.day) || SW.clamp(SW.weekday(SW.isoDate()), 1, 5);
      const go = (v, i, extra = '') => (location.hash = `#/stundenplan?view=${v}${i ? '&id=' + i : ''}${extra}`);
      const conflicts = D.ttConflicts(state, tt);
      const label = (x) => view === 'klasse' ? x.name : view === 'lehrperson' ? `${x.emoji} ${x.code || ''}` : x.name;
      const obj = list.find((x) => x.id === id);
      const idx = list.findIndex((x) => x.id === id);

      // Kopf
      const seg = U.seg([{ value: 'klasse', label: 'Klasse' }, { value: 'lehrperson', label: 'Lehrperson' }, { value: 'raum', label: 'Raum' }, { value: 'uebersicht', label: 'Übersicht' }], view, (v) => go(v, lists[v]?.[0]?.id));
      const sel = view !== 'uebersicht' ? U.select(list.map((x) => ({ value: x.id, label: label(x) })), id, (v) => go(view, v)) : U.seg(D.days(state).map((d) => ({ value: d, label: M.dayName(d, true) })), day, (v) => go('uebersicht', null, '&day=' + v));
      if (sel.tagName === 'SELECT') sel.style.maxWidth = '240px';
      const nav = view !== 'uebersicht' ? h('div.flex.g4', h('button.btn.icon', { disabled: idx <= 0, onclick: () => go(view, list[idx - 1].id), title: 'Vorherige' }, SW.icon('chevronLeft')), h('button.btn.icon', { disabled: idx >= list.length - 1, onclick: () => go(view, list[idx + 1].id), title: 'Nächste' }, SW.icon('chevronRight'))) : null;
      const status = h('button.chip.' + (tt.status === 'published' ? 'ok' : 'tint'), { title: 'Status wechseln', onclick: () => { if (!isAdmin()) return; SW.store.update((st) => { st.timetable.status = st.timetable.status === 'published' ? 'draft' : 'published'; }); U.toast(tt.status === 'published' ? 'Plan als Entwurf markiert' : 'Plan veröffentlicht – sichtbar für Lehrpersonen', { type: 'ok' }); if (tt.status !== 'published') SW.store.notify({ icon: '📣', text: 'Der Stundenplan wurde veröffentlicht.', link: '#/portal' }); } }, tt.status === 'published' ? '● Veröffentlicht' : '○ Entwurf');
      const confChip = h('button.chip.' + (conflicts.length ? 'err' : 'ok'), { onclick: () => { if (!conflicts.length) return U.toast('Keine Konflikte im Plan', { type: 'ok' }); U.modal({ title: `${conflicts.length} Konflikte`, size: 'wide', body: h('ul.list', conflicts.map((c) => h('li', h('span', '⚠️'), h('div.grow', h('div.strong', `${D.classOf(state, c.lesson.classId)?.name} · ${D.subjectOf(state, c.lesson.subjectId)?.short} · ${M.dayName(c.lesson.day, true)} ${c.lesson.slot}`), h('div.small.muted', c.conflicts.map((x) => x.text).join(' · '))), h('button.btn.sm', { onclick: () => { U.closeAllModals(); lessonModal(c.lesson); } }, 'Öffnen')))) }); } }, conflicts.length ? `${conflicts.length} Konflikte` : 'Keine Konflikte');
      const exportMenu = (e) => { const lessons = view === 'uebersicht' ? tt.lessons : D.lessonsFor(tt, view === 'klasse' ? { classId: id } : view === 'lehrperson' ? { teacherId: id } : { roomId: id }); const name = view === 'uebersicht' ? 'alle' : (obj ? label(obj).replace(/[^\w]+/g, '-') : 'plan'); U.menu(e.currentTarget, [{ label: 'CSV (Excel)', icon: 'download', fn: () => exportCSV(state, lessons, name) }, { label: 'Kalender (ICS, wöchentlich)', icon: 'calendar', fn: () => exportICS(state, lessons, name) }, { label: 'JSON (ganzer Plan)', icon: 'copy', fn: () => SW.download('stundenplan.json', JSON.stringify(tt, null, 2), 'application/json') }]); };
      el.append(U.pageHeader({ title: 'Stundenplan', lead: `Erstellt ${SW.fmtTs(tt.createdAt)} · Score ${tt.score} · ${SW.sum(tt.lessons, (l) => l.len || 1)} Lektionen${tt.unplaced?.length ? ` · ${tt.unplaced.length} offen` : ''}`, actions: [
        status, confChip,
        isAdmin() ? h('button.btn', { onclick: undo, title: 'Rückgängig (Ctrl+Z)', disabled: !undoStack.length }, SW.icon('undo'), 'Rückgängig') : null,
        h('button.btn', { onclick: exportMenu }, SW.icon('download'), 'Export'),
        h('button.btn', { onclick: () => window.print() }, SW.icon('print'), 'Drucken'),
        isAdmin() ? h('a.btn.primary', { href: '#/generator' }, SW.icon('wand'), 'Neu generieren') : null,
      ] }));
      if (tt.unplaced?.length) el.append(U.banner(h('span', h('b', `${tt.unplaced.length} Lektionen konnten nicht platziert werden. `), tt.unplaced.slice(0, 2).map((u) => `${D.classOf(state, u.classId)?.name} ${D.subjectOf(state, u.subjectId)?.short}: ${u.reason}`).join(' · ')), 'warn', { action: h('a.btn.sm', { href: '#/generator' }, 'Im Generator ansehen') }));
      el.append(h('div.toolbar.no-print', seg, sel, nav));

      // Druckkopf
      el.append(h('div.print-only', h('h2', `${state.settings.schoolName} · Stundenplan ${obj ? label(obj) : M.dayName(day)}`), h('div.small', `Schuljahr ${state.settings.schoolYear} · Stand ${SW.fmtTs(tt.createdAt)} · ${tt.status === 'published' ? 'Gültig' : 'Entwurf'}`)));

      if (view === 'uebersicht') { el.append(h('div.card.pad-s', overview(state, tt, day))); return; }
      if (!obj) { el.append(U.empty({ icon: '🔎', title: 'Nichts ausgewählt', text: 'Es gibt noch keinen Eintrag für diese Ansicht.' })); return; }

      const lessons = D.lessonsFor(tt, view === 'klasse' ? { classId: id } : view === 'lehrperson' ? { teacherId: id } : { roomId: id });
      const confSet = new Set(conflicts.map((c) => c.lesson.id)); lessons.forEach((l) => (l._conflict = confSet.has(l.id)));
      const mode = view === 'klasse' ? 'class' : view === 'lehrperson' ? 'teacher' : 'room';
      const offDays = view === 'klasse' && obj.schoolDays?.length ? D.days(state).filter((d) => !obj.schoolDays.includes(d)) : view === 'lehrperson' ? D.days(state).filter((d) => !(obj.availability?.[d] || []).some(Boolean)) : [];
      const grid = U.timetableGrid({ lessons, mode, state, draggable: isAdmin(), showFree: true, offDays,
        onLessonClick: (l) => lessonModal(l),
        onDrop: isAdmin() ? (l, d, s) => moveLesson(l, d, s) : null,
        extra: isAdmin() && view === 'klasse' ? (d, s, cell) => { if (lessons.some((l) => l.day === d && l.slot <= s && s < l.slot + (l.len || 1))) return null; cell.style.cursor = 'pointer'; cell.title = 'Lektion hinzufügen'; cell.addEventListener('click', () => addLessonModal(obj, d, s)); return null; } : null,
      });
      grid.setCanDrop((l, d, s) => D.checkMove(state, tt, l, d, s, undefined).filter((c) => c.type !== 'roomBusy').length === 0);
      // Kennzahlen zur Auswahl
      const n = SW.sum(lessons, (l) => l.len || 1);
      const info = h('div.flex.g16.wrap.small.muted');
      if (view === 'klasse') { const need = D.classLessonCount(state, obj); const kl = D.teacherOf(state, obj.mainTeacherId); info.append(h('span', `${n} von ${need} Lektionen`), h('span', `Schultage: ${(obj.schoolDays || []).map((d) => M.dayName(d, true)).join(', ') || '–'}`), kl ? h('span.flex.ai-c.g4', 'Klassenlehrperson ', U.avatar(kl, 'xs'), kl.code || '') : null, h('span', `Stammzimmer: ${D.roomOf(state, obj.homeRoomId)?.name || '–'}`)); }
      if (view === 'lehrperson') info.append(h('span', `${n} Lektionen im Plan · Pensum max. ${D.teacherMaxLessons(state, obj)}`), h('span', `Fächer: ${(obj.subjectIds || []).map((s) => D.subjectOf(state, s)?.short).filter(Boolean).join(', ')}`));
      if (view === 'raum') info.append(h('span', `${n} Lektionen · Auslastung ${Math.round((n / (D.days(state).length * D.slotCount(state))) * 100)} %`), h('span', `${M.roomType(obj.type).name} · ${obj.capacity} Plätze`));
      if (isAdmin()) info.append(h('span.faint', view === 'klasse' ? 'Lektionen ziehen zum Verschieben · Klick auf eine Lektion für Details · Klick auf freie Zelle zum Hinzufügen' : 'Lektionen ziehen zum Verschieben · Klick für Details'));
      el.append(info, h('div.card.pad-s', h('div.scroll-x', grid)));
      // Legende
      const subs = SW.uniq(lessons.map((l) => l.subjectId)).map((s) => D.subjectOf(state, s)).filter(Boolean);
      if (subs.length) el.append(h('div.legend', subs.map((s) => h('span', h('i', { style: { background: s.color } }), s.name))));
    },
  };
  document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'z' && SW.router.current?.route === 'stundenplan' && isAdmin() && !e.target.closest('input,textarea')) { e.preventDefault(); undo(); } });
})();
