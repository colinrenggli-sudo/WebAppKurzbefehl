/* STUNDENWERK · domain.js — fachliche Logik, die UI und Generator teilen.
   Reine Funktionen auf dem Zustand (state), keine DOM-Zugriffe. Läuft auch in Node-Tests.

   SW.domain.slots(state)                       Stundenraster [{n,start,end}]
   SW.domain.slotCount(state)
   SW.domain.crossesLunch(state, slot, len)     Doppellektion über den Mittag?
   SW.domain.classRequirements(state, cls)      [{subjectId, subject, lessons, block, teacherId, source}] Bedarf pro Fach
   SW.domain.classLessonCount(state, cls)       Lektionen pro Woche
   SW.domain.effectiveTeacher(state, cls, sid)  explizit zugewiesene Lehrperson oder null
   SW.domain.qualifiedTeachers(state, sid)      aktive Lehrpersonen, die das Fach unterrichten
   SW.domain.teacherAvailable(t, day, slot)     Verfügbarkeit aus t.availability[day][slot-1]
   SW.domain.teacherAvailableSlots(state, t, days?)  Anzahl verfügbarer Lektionen
   SW.domain.teacherLoad(state, tid)            geplante Lektionen (aus Zuweisungen der Klassen)
   SW.domain.roomsFor(state, subject, cls)      passende Räume, Stammzimmer zuerst
   SW.domain.autoAssign(state, seed)            fehlende Fach-Lehrpersonen automatisch zuweisen → {classId:{subjectId:teacherId}}, unassigned[]
   SW.domain.feasibility(state)                 Machbarkeitsanalyse → {issues:[{level,code,title,text,link}], ok, stats}
   SW.domain.lessonsFor(tt, filter)             Lektionen eines Plans nach classId/teacherId/roomId
   SW.domain.checkMove(state, tt, lesson, day, slot, roomId)  Konflikte einer manuellen Verschiebung
   SW.domain.ttStats(state, tt)                 Kennzahlen des Plans (Auslastung, Freistunden …)
*/
(function () {
  const SW = (globalThis.SW = globalThis.SW || {});
  const M = SW.model;
  const D = (SW.domain = {});

  D.slots = (state) => state.settings.slots;
  D.slotCount = (state) => state.settings.slots.length;
  D.days = (state) => state.settings.days || [1, 2, 3, 4, 5];
  D.crossesLunch = (state, slot, len) => { const L = state.settings.lunchAfter; return len > 1 && slot <= L && slot + len - 1 > L; };
  D.slotLabel = (state, n) => { const s = state.settings.slots[n - 1]; return s ? `${s.start}–${s.end}` : ''; };

  D.subjectOf = (state, id) => state.subjects.find((s) => s.id === id) || null;
  D.teacherOf = (state, id) => state.teachers.find((t) => t.id === id) || null;
  D.roomOf = (state, id) => state.rooms.find((r) => r.id === id) || null;
  D.classOf = (state, id) => state.classes.find((k) => k.id === id) || null;
  D.curriculumOf = (state, id) => state.curricula.find((c) => c.id === id) || null;
  D.teacherLabel = (t) => (t ? `${t.emoji}${t.code ? ' ' + t.code : ''}` : '–');

  // Bedarf einer Klasse: aus Lehrgang (Lehrjahr) + Zusatzlektionen der Klasse
  D.classRequirements = (state, cls) => {
    const out = [];
    const cur = D.curriculumOf(state, cls.curriculumId);
    if (cur) for (const cs of cur.subjects) {
      const n = Number((cs.lessons || {})[cls.year] || 0);
      if (n <= 0) continue;
      const subject = D.subjectOf(state, cs.subjectId); if (!subject) continue;
      out.push({ subjectId: cs.subjectId, subject, lessons: n, block: Number(cs.block || subject.block || 1), teacherId: D.effectiveTeacher(state, cls, cs.subjectId), source: 'lehrgang' });
    }
    for (const e of cls.extraLessons || []) {
      const subject = D.subjectOf(state, e.subjectId); if (!subject || !(e.lessons > 0)) continue;
      const ex = out.find((o) => o.subjectId === e.subjectId);
      if (ex) ex.lessons += Number(e.lessons);
      else out.push({ subjectId: e.subjectId, subject, lessons: Number(e.lessons), block: Number(e.block || subject.block || 1), teacherId: e.teacherId || D.effectiveTeacher(state, cls, e.subjectId), source: 'zusatz' });
    }
    return out;
  };
  D.classLessonCount = (state, cls) => SW.sum(D.classRequirements(state, cls), (r) => r.lessons);
  D.effectiveTeacher = (state, cls, sid) => {
    const t = (cls.subjectTeachers || {})[sid];
    return t && D.teacherOf(state, t) ? t : null;
  };
  D.qualifiedTeachers = (state, sid) => state.teachers.filter((t) => t.active !== false && (t.subjectIds || []).includes(sid));
  D.teacherAvailable = (t, day, slot) => { const a = t.availability && t.availability[day]; return !!(a && a[slot - 1]); };
  D.roomBlocked = (r, day, slot) => { const a = r && r.blocked && r.blocked[day]; return !!(a && a[slot - 1]); };
  D.teacherAvailableSlots = (state, t, days) => { let n = 0; for (const d of days || D.days(state)) for (let s = 1; s <= D.slotCount(state); s++) if (D.teacherAvailable(t, d, s)) n++; return n; };
  D.teacherDays = (state, t) => D.days(state).filter((d) => (t.availability?.[d] || []).some(Boolean));
  D.teacherLoad = (state, tid) => { let n = 0; for (const k of state.classes) for (const r of D.classRequirements(state, k)) if (r.teacherId === tid) n += r.lessons; return n; };
  D.teacherMaxLessons = (state, t) => Number(t.maxLessons || Math.round((state.settings.lessonsFull || 25) * (t.employment || 100) / 100));

  D.roomFits = (room, subject, cls) => {
    if (!room || room.active === false) return false;
    const req = M.roomReq(subject.roomReq || 'any');
    if (!req.types.includes(room.type)) return false;
    if (cls && room.capacity && room.capacity < (cls.size || 0)) return false;
    return true;
  };
  D.roomsFor = (state, subject, cls) => {
    const rooms = state.rooms.filter((r) => D.roomFits(r, subject, cls));
    const home = cls?.homeRoomId;
    return SW.sortBy(rooms, (r) => (r.id === home ? 0 : 1), (r) => (r.type === 'klassenzimmer' ? 0 : 1), (r) => r.capacity || 0);
  };

  // Automatische Zuweisung fehlender Fach-Lehrpersonen: qualifiziert, verfügbar an den Schultagen, möglichst wenig Last.
  D.autoAssign = (state, seed = 1) => {
    const rng = SW.rng(seed);
    const load = {}; for (const t of state.teachers) load[t.id] = D.teacherLoad(state, t.id);
    const result = {}; const unassigned = [];
    const jobs = [];
    for (const k of state.classes) for (const r of D.classRequirements(state, k)) if (!r.teacherId) jobs.push({ cls: k, r });
    // Schwierigste zuerst (wenige qualifizierte Lehrpersonen)
    jobs.sort((a, b) => D.qualifiedTeachers(state, a.r.subjectId).length - D.qualifiedTeachers(state, b.r.subjectId).length || b.r.lessons - a.r.lessons);
    for (const { cls, r } of jobs) {
      const cands = D.qualifiedTeachers(state, r.subjectId).map((t) => {
        const days = cls.schoolDays?.length ? cls.schoolDays : D.days(state);
        const avail = D.teacherAvailableSlots(state, t, days);
        const max = D.teacherMaxLessons(state, t);
        const free = Math.min(max, D.teacherAvailableSlots(state, t)) - load[t.id];
        const pref = [cls.mainTeacherId, cls.deputyTeacherId, cls.abuTeacherId].includes(t.id) ? 1 : 0;
        return { t, avail, free, pref, score: (avail >= r.lessons ? 0 : 100) + (free >= r.lessons ? 0 : 50) - pref * 5 + (load[t.id] / Math.max(1, max)) * 10 + rng() * 0.5 };
      }).filter((c) => c.avail > 0);
      cands.sort((a, b) => a.score - b.score);
      const best = cands[0];
      if (!best) { unassigned.push({ classId: cls.id, subjectId: r.subjectId, reason: 'Keine qualifizierte Lehrperson mit Verfügbarkeit an den Schultagen' }); continue; }
      (result[cls.id] = result[cls.id] || {})[r.subjectId] = best.t.id;
      load[best.t.id] += r.lessons;
    }
    return { assignments: result, unassigned };
  };
  D.applyAssignments = (state, assignments) => { for (const [cid, m] of Object.entries(assignments)) { const k = D.classOf(state, cid); if (!k) continue; k.subjectTeachers = { ...(k.subjectTeachers || {}), ...m }; } };

  // Machbarkeitsanalyse vor dem Generieren
  D.feasibility = (state, opts = {}) => {
    const issues = [];
    const add = (level, code, title, text, link) => issues.push({ level, code, title, text, link });
    const slotsPerDay = D.slotCount(state);
    const days = D.days(state);
    const teachRooms = state.rooms.filter((r) => r.active !== false && M.roomType(r.type).teachable);
    const assignments = opts.assignments || {};
    const effTeacher = (k, sid) => (assignments[k.id] || {})[sid] || D.effectiveTeacher(state, k, sid);

    if (!state.classes.length) add('error', 'no-classes', 'Keine Klassen', 'Erfasse mindestens eine Klasse mit Lehrgang und Schultagen.', '#/klassen');
    if (!teachRooms.length) add('error', 'no-rooms', 'Keine Unterrichtsräume', 'Erfasse Räume, in denen unterrichtet werden kann.', '#/raeume');
    if (!state.teachers.filter((t) => t.active !== false).length) add('error', 'no-teachers', 'Keine Lehrpersonen', 'Erfasse Lehrpersonen mit Fächern und Verfügbarkeit.', '#/lehrpersonen');

    let totalLessons = 0; const teacherNeed = {}; const teacherNeedByClass = {}; const roomNeed = {}; const autoByClass = {};
    for (const k of state.classes) {
      const reqs = D.classRequirements(state, k);
      const n = SW.sum(reqs, (r) => r.lessons); totalLessons += n;
      const link = '#/klassen/' + k.id;
      if (!k.curriculumId) add('error', 'class-no-cur', `${k.name}: kein Lehrgang`, 'Ohne Lehrgang hat die Klasse keine Lektionentafel.', link);
      else if (!n) add('warn', 'class-no-lessons', `${k.name}: keine Lektionen`, `Der Lehrgang hat im ${k.year}. Lehrjahr keine Lektionen hinterlegt.`, link);
      if (!k.schoolDays?.length) add('error', 'class-no-days', `${k.name}: keine Schultage`, 'Lege fest, an welchen Wochentagen die Klasse Schule hat.', link);
      else {
        const cap = k.schoolDays.length * slotsPerDay;
        if (n > cap) add('error', 'class-over', `${k.name}: zu viele Lektionen`, `${n} Lektionen pro Woche, aber nur ${cap} Plätze an ${k.schoolDays.length} Schultagen. Weiteren Schultag ergänzen.`, link);
        else if (n === cap) add('info', 'class-full', `${k.name}: Schultage voll belegt`, `${n} von ${cap} Lektionen – ganze Schultage ohne Spielraum. Lehrpersonen müssen an diesen Tagen durchgehend verfügbar sein.`, link);
        else if (n > cap * 0.9) add('info', 'class-tight', `${k.name}: Schultage fast voll`, `${n} von ${cap} möglichen Lektionen. Wenig Spielraum, um Freistunden zu vermeiden.`, link);
      }
      const roomsOk = teachRooms.filter((r) => r.capacity >= (k.size || 0) && M.roomReq('any').types.includes(r.type));
      if (!roomsOk.length && teachRooms.length) add('error', 'class-no-room', `${k.name}: kein Raum gross genug`, `${k.size} Lernende, aber kein Schulzimmer mit genügend Plätzen.`, link);
      for (const r of reqs) {
        const tid = effTeacher(k, r.subjectId);
        if (!tid) {
          const q = D.qualifiedTeachers(state, r.subjectId);
          if (!q.length) add('error', 'no-qualified', `${k.name} · ${r.subject.name}: keine Lehrperson`, `Keine Lehrperson unterrichtet «${r.subject.name}». Fach bei einer Lehrperson hinterlegen.`, '#/lehrpersonen');
          else (autoByClass[k.id] = autoByClass[k.id] || []).push(r.subject.short || r.subject.name);
        } else {
          teacherNeed[tid] = (teacherNeed[tid] || 0) + r.lessons;
          (teacherNeedByClass[tid] = teacherNeedByClass[tid] || []).push({ cls: k, r });
        }
        const req = M.roomReq(r.subject.roomReq || 'any');
        roomNeed[req.id] = (roomNeed[req.id] || 0) + r.lessons;
        const fitting = state.rooms.filter((rm) => D.roomFits(rm, r.subject, k));
        if (!fitting.length) add('error', 'subj-no-room', `${k.name} · ${r.subject.name}: kein passender Raum`, `Braucht «${req.name}» für ${k.size} Lernende, aber kein solcher Raum ist erfasst.`, '#/raeume');
        if (r.block === 2 && r.lessons % 2 === 1) add('info', 'odd-block', `${k.name} · ${r.subject.name}: ungerade Doppellektionen`, `${r.lessons} Lektionen als Doppellektionen, eine bleibt einzeln.`, '#/lehrgaenge');
      }
    }
    for (const [cid, subs] of Object.entries(autoByClass)) { const k = D.classOf(state, cid); add('info', 'auto-assign', `${k.name}: ${subs.length} ${subs.length === 1 ? 'Fach wird' : 'Fächer werden'} automatisch zugewiesen`, `${subs.join(', ')} – der Generator wählt jeweils die qualifizierte Lehrperson mit der geringsten Auslastung.`, '#/klassen/' + cid); }
    for (const [tid, need] of Object.entries(teacherNeed)) {
      const t = D.teacherOf(state, tid); if (!t) continue;
      const link = '#/lehrpersonen/' + tid;
      const avail = D.teacherAvailableSlots(state, t);
      const max = D.teacherMaxLessons(state, t);
      if (need > avail) add('error', 'teacher-avail', `${D.teacherLabel(t)}: zu wenig Verfügbarkeit`, `${need} Lektionen zugeteilt, aber nur ${avail} Lektionen verfügbar. Verfügbarkeit erweitern oder Lektionen umverteilen.`, link);
      else if (need > max) add('warn', 'teacher-max', `${D.teacherLabel(t)}: über dem Pensum`, `${need} Lektionen zugeteilt, Pensum erlaubt ${max}.`, link);
      else if (need > avail * 0.85) add('warn', 'teacher-tight', `${D.teacherLabel(t)}: Verfügbarkeit knapp`, `${need} von ${avail} verfügbaren Lektionen belegt.`, link);
      for (const { cls, r } of teacherNeedByClass[tid]) {
        if (!cls.schoolDays?.length) continue;
        const av = D.teacherAvailableSlots(state, t, cls.schoolDays);
        if (av < r.lessons) add('error', 'teacher-class-days', `${D.teacherLabel(t)} · ${cls.name} · ${r.subject.name}`, `An den Schultagen der Klasse (${cls.schoolDays.map((d) => M.dayName(d, true)).join(', ')}) nur ${av} Lektionen verfügbar, benötigt ${r.lessons}.`, link);
      }
      // Summe über alle Klassen desselben Tages könnte Verfügbarkeit übersteigen – grob prüfen
      const perDayNeed = {}; for (const { cls, r } of teacherNeedByClass[tid]) { const ds = cls.schoolDays?.length ? cls.schoolDays : days; for (const d of ds) perDayNeed[d] = (perDayNeed[d] || 0) + r.lessons / ds.length; }
      const dayAvail = {}; for (const d of days) dayAvail[d] = D.teacherAvailableSlots(state, t, [d]);
      if (t.active === false) add('error', 'teacher-inactive', `${D.teacherLabel(t)}: inaktiv, aber zugeteilt`, 'Die Lehrperson ist deaktiviert, hat aber Klassen zugewiesen.', link);
    }
    for (const [reqId, need] of Object.entries(roomNeed)) {
      const req = M.roomReq(reqId);
      const rooms = state.rooms.filter((r) => r.active !== false && req.types.includes(r.type));
      const cap = SW.sum(rooms, (r) => SW.sum(days, (d) => SW.sum(SW.range(slotsPerDay, 1), (s) => (D.roomBlocked(r, d, s) ? 0 : 1))));
      if (need > cap) add('error', 'room-cap', `Raumtyp «${req.name}» überbucht`, `${need} Lektionen brauchen diesen Raumtyp, ${rooms.length} Räume bieten ${cap} Plätze pro Woche.`, '#/raeume');
      else if (need > cap * 0.85 && rooms.length) add('warn', 'room-tight', `Raumtyp «${req.name}» knapp`, `${need} von ${cap} Plätzen pro Woche belegt (${Math.round((need / cap) * 100)} %).`, '#/raeume');
    }
    // Schultag-Ballung: Lektionen pro Tag vs. Räume
    const perDay = {}; for (const k of state.classes) { const n = D.classLessonCount(state, k); const ds = k.schoolDays?.length ? k.schoolDays : days; for (const d of ds) perDay[d] = (perDay[d] || 0) + n / ds.length; }
    const stdRooms = state.rooms.filter((r) => r.active !== false && M.roomReq('any').types.includes(r.type));
    for (const d of days) { const need = perDay[d] || 0; const cap = stdRooms.length * slotsPerDay; if (cap && need > cap) add('error', 'day-rooms', `${M.dayName(d)}: mehr Klassen als Räume`, `Ungefähr ${Math.round(need)} Lektionen an diesem Tag, aber nur ${cap} Raumplätze. Schultage der Klassen anders verteilen.`, '#/klassen'); }

    const order = { error: 0, warn: 1, info: 2 };
    issues.sort((a, b) => order[a.level] - order[b.level]);
    return { issues, ok: !issues.some((i) => i.level === 'error'), errors: issues.filter((i) => i.level === 'error').length, warnings: issues.filter((i) => i.level === 'warn').length, stats: { totalLessons, teacherNeed, roomNeed } };
  };

  D.lessonsFor = (tt, f = {}) => (tt?.lessons || []).filter((l) => (!f.classId || l.classId === f.classId) && (!f.teacherId || l.teacherId === f.teacherId) && (!f.roomId || l.roomId === f.roomId) && (!f.day || l.day === f.day));
  D.lessonSlots = (l) => SW.range(l.len || 1, l.slot);
  D.overlaps = (a, b) => a.day === b.day && a.slot < b.slot + (b.len || 1) && b.slot < a.slot + (a.len || 1);

  // Konflikte, wenn eine Lektion auf (day, slot, roomId) verschoben wird
  D.checkMove = (state, tt, lesson, day, slot, roomId) => {
    const conflicts = [];
    const len = lesson.len || 1;
    const cls = D.classOf(state, lesson.classId); const t = D.teacherOf(state, lesson.teacherId); const subject = D.subjectOf(state, lesson.subjectId);
    const moved = { ...lesson, day, slot, roomId: roomId === undefined ? lesson.roomId : roomId };
    if (slot < 1 || slot + len - 1 > D.slotCount(state)) conflicts.push({ type: 'slot', text: 'Ausserhalb des Stundenrasters' });
    if (D.crossesLunch(state, slot, len)) conflicts.push({ type: 'lunch', text: 'Doppellektion über den Mittag' });
    if (cls?.schoolDays?.length && !cls.schoolDays.includes(day)) conflicts.push({ type: 'day', text: `${cls.name} hat am ${M.dayName(day)} keinen Schultag` });
    if (t) for (let s = slot; s < slot + len; s++) if (!D.teacherAvailable(t, day, s)) { conflicts.push({ type: 'avail', text: `${D.teacherLabel(t)} ist um ${D.slotLabel(state, s)} nicht verfügbar` }); break; }
    const room = D.roomOf(state, moved.roomId);
    if (moved.roomId && room && subject && !D.roomFits(room, subject, cls)) conflicts.push({ type: 'room', text: `${room.name} passt nicht (Typ/Kapazität)` });
    if (room) for (let s = slot; s < slot + len; s++) if (D.roomBlocked(room, day, s)) { conflicts.push({ type: 'roomBlocked', text: `${room.name} ist um ${D.slotLabel(state, s)} gesperrt` }); break; }
    for (const o of tt.lessons) {
      if (o.id === lesson.id || !D.overlaps(o, moved)) continue;
      if (o.classId === moved.classId) conflicts.push({ type: 'class', text: `${cls?.name || 'Klasse'} hat bereits ${D.subjectOf(state, o.subjectId)?.short || 'Unterricht'}`, lessonId: o.id });
      if (o.teacherId && o.teacherId === moved.teacherId) conflicts.push({ type: 'teacher', text: `${D.teacherLabel(t)} unterrichtet bereits ${D.classOf(state, o.classId)?.name || ''}`, lessonId: o.id });
      if (o.roomId && o.roomId === moved.roomId) conflicts.push({ type: 'roomBusy', text: `${room?.name || 'Raum'} ist belegt durch ${D.classOf(state, o.classId)?.name || ''}`, lessonId: o.id });
    }
    return conflicts;
  };
  // Alle Konflikte eines Plans (nach manuellen Änderungen)
  D.ttConflicts = (state, tt) => { const out = []; for (const l of tt?.lessons || []) { const c = D.checkMove(state, tt, l, l.day, l.slot, l.roomId).filter((x) => x.type !== 'avail' || true); if (c.length) out.push({ lesson: l, conflicts: c }); } return out; };

  D.ttStats = (state, tt) => {
    const lessons = tt?.lessons || [];
    const slotsPerDay = D.slotCount(state); const days = D.days(state);
    const gapsOf = (list) => { let gaps = 0; const byDay = SW.groupBy(list, (l) => l.day); for (const arr of Object.values(byDay)) { const occ = new Set(); arr.forEach((l) => D.lessonSlots(l).forEach((s) => occ.add(s))); const ss = [...occ].sort((a, b) => a - b); for (let i = 1; i < ss.length; i++) gaps += ss[i] - ss[i - 1] - 1; } return gaps; };
    const classes = state.classes.map((k) => { const ls = D.lessonsFor(tt, { classId: k.id }); const n = SW.sum(ls, (l) => l.len || 1); return { id: k.id, name: k.name, lessons: n, need: D.classLessonCount(state, k), gaps: gapsOf(ls), days: SW.uniq(ls.map((l) => l.day)).length }; });
    const teachers = state.teachers.map((t) => { const ls = D.lessonsFor(tt, { teacherId: t.id }); const n = SW.sum(ls, (l) => l.len || 1); return { id: t.id, label: D.teacherLabel(t), lessons: n, max: D.teacherMaxLessons(state, t), avail: D.teacherAvailableSlots(state, t), gaps: gapsOf(ls), days: SW.uniq(ls.map((l) => l.day)).length }; });
    const rooms = state.rooms.filter((r) => M.roomType(r.type).teachable).map((r) => { const ls = D.lessonsFor(tt, { roomId: r.id }); const n = SW.sum(ls, (l) => l.len || 1); return { id: r.id, name: r.name, lessons: n, cap: days.length * slotsPerDay, util: n / (days.length * slotsPerDay) }; });
    return { total: SW.sum(lessons, (l) => l.len || 1), classGaps: SW.sum(classes, (c) => c.gaps), teacherGaps: SW.sum(teachers, (t) => t.gaps), classes, teachers, rooms, unplaced: (tt?.unplaced || []).length, roomUtil: rooms.length ? SW.sum(rooms, (r) => r.util) / rooms.length : 0 };
  };
})();
