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
      else { const et = e.teacherId && D.teacherOf(state, e.teacherId)?.active !== false && D.teacherOf(state, e.teacherId) ? e.teacherId : null; out.push({ subjectId: e.subjectId, subject, lessons: Number(e.lessons), block: Number(e.block || subject.block || 1), teacherId: et || D.effectiveTeacher(state, cls, e.subjectId), source: 'zusatz' }); }
    }
    return out;
  };
  D.classLessonCount = (state, cls) => SW.sum(D.classRequirements(state, cls), (r) => r.lessons);
  D.effectiveTeacher = (state, cls, sid) => {
    const t = (cls.subjectTeachers || {})[sid]; const obj = t ? D.teacherOf(state, t) : null;
    return obj && obj.active !== false ? t : null;
  };
  D.roomCap = (r) => (Number(r?.capacity) > 0 ? Number(r.capacity) : Infinity);
  D.normDays = (state, days) => SW.uniq((days || []).map(Number).filter((d) => D.days(state).includes(d))).sort();
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
    if (cls && D.roomCap(room) < (cls.size || 0)) return false;
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

  // Anzahl nicht überlappender Doppellektions-Plätze einer Lehrperson an einem Tag (zusammenhängend, nicht über den Mittag)
  D.doublePairs = (state, t, day) => { const S = D.slotCount(state); const L = state.settings.lunchAfter; let pairs = 0, run = 0; for (let s = 1; s <= S + 1; s++) { const av = s <= S && D.teacherAvailable(t, day, s) && !(s === L + 1 && run > 0 && false); if (s <= S && D.teacherAvailable(t, day, s) && !(s === L + 1)) run++; else { pairs += Math.floor(run / 2); run = s <= S && D.teacherAvailable(t, day, s) ? 1 : 0; } } return pairs; };
  const subsets = (arr) => { const out = []; const n = arr.length; for (let m = 1; m < 1 << n; m++) out.push(arr.filter((_, i) => m & (1 << i))); return out; };

  // Machbarkeitsanalyse vor dem Generieren. Berücksichtigt automatische Zuweisungen (wie der Generator).
  D.feasibility = (state, opts = {}) => {
    const issues = [];
    const add = (level, code, title, text, link) => issues.push({ level, code, title, text, link });
    const slotsPerDay = D.slotCount(state);
    const days = D.days(state);
    const teachRooms = state.rooms.filter((r) => r.active !== false && M.roomType(r.type).teachable);
    const auto = opts.assignments ? { assignments: opts.assignments, unassigned: [] } : D.autoAssign(state, state.settings.seed || 1);
    const assignments = auto.assignments || {};
    const effTeacher = (k, sid, r) => r?.teacherId || (assignments[k.id] || {})[sid] || null;
    const norm = (k) => D.normDays(state, k.schoolDays);

    if (!state.classes.length) add('error', 'no-classes', 'Keine Klassen', 'Erfasse mindestens eine Klasse mit Lehrgang und Schultagen.', '#/klassen');
    if (!teachRooms.length) add('error', 'no-rooms', 'Keine Unterrichtsräume', 'Erfasse Räume, in denen unterrichtet werden kann.', '#/raeume');
    if (!state.teachers.filter((t) => t.active !== false).length) add('error', 'no-teachers', 'Keine Lehrpersonen', 'Erfasse Lehrpersonen mit Fächern und Verfügbarkeit.', '#/lehrpersonen');
    if (!days.length || !slotsPerDay) add('error', 'no-grid', 'Kein Stundenraster', 'In den Einstellungen Unterrichtstage und Lektionen festlegen.', '#/einstellungen');

    let totalLessons = 0; const teacherNeed = {}; const teacherJobs = {}; const roomNeed = {}; const roomJobs = {}; const autoByClass = {};
    for (const k of state.classes) {
      const reqs = D.classRequirements(state, k);
      const n = SW.sum(reqs, (r) => r.lessons); totalLessons += n;
      const link = '#/klassen/' + k.id; const kd = norm(k);
      if (!k.curriculumId) add('error', 'class-no-cur', `${k.name}: kein Lehrgang`, 'Ohne Lehrgang hat die Klasse keine Lektionentafel.', link);
      else if (!D.curriculumOf(state, k.curriculumId)) add('error', 'class-cur-missing', `${k.name}: Lehrgang existiert nicht mehr`, 'Der zugewiesene Lehrgang wurde gelöscht. Einen Lehrgang wählen.', link);
      else if (!n) add('warn', 'class-no-lessons', `${k.name}: keine Lektionen`, `Der Lehrgang hat im ${k.year}. Lehrjahr keine Lektionen hinterlegt.`, link);
      if (!kd.length) add('error', 'class-no-days', `${k.name}: keine Schultage`, (k.schoolDays || []).length ? 'Die Schultage liegen ausserhalb der Unterrichtstage der Schule.' : 'Lege fest, an welchen Wochentagen die Klasse Schule hat.', link);
      else {
        const cap = kd.length * slotsPerDay;
        if (n > cap) add('error', 'class-over', `${k.name}: zu viele Lektionen`, `${n} Lektionen pro Woche, aber nur ${cap} Plätze an ${kd.length} Schultagen. Weiteren Schultag ergänzen.`, link);
        else if (n === cap) add('info', 'class-full', `${k.name}: Schultage voll belegt`, `${n} von ${cap} Lektionen – ganze Schultage ohne Spielraum. Lehrpersonen müssen an diesen Tagen durchgehend verfügbar sein.`, link);
        else if (n > cap * 0.9) add('info', 'class-tight', `${k.name}: Schultage fast voll`, `${n} von ${cap} möglichen Lektionen. Wenig Spielraum, um Freistunden zu vermeiden.`, link);
      }
      // Tageskapazität der Klasse: Fächer, deren Lehrperson nur an einer Teilmenge der Schultage kann
      if (kd.length > 1 && n <= kd.length * slotsPerDay) {
        const subjDays = reqs.map((r) => { const tid = effTeacher(k, r.subjectId, r); const t = tid ? D.teacherOf(state, tid) : null; return { r, days: t ? kd.filter((d) => D.teacherAvailableSlots(state, t, [d]) > 0) : kd }; });
        for (const S of subsets(kd)) { if (S.length === kd.length) continue; const need = SW.sum(subjDays.filter((x) => x.days.every((d) => S.includes(d))), (x) => x.r.lessons); if (need > S.length * slotsPerDay) { add('error', 'class-day-cap', `${k.name}: zu viele Lektionen für ${S.map((d) => M.dayName(d, true)).join('/')}`, `${need} Lektionen haben Lehrpersonen, die nur an ${S.map((d) => M.dayName(d)).join(' und ')} können – Platz für ${S.length * slotsPerDay}.`, link); break; } }
      }
      const roomsAny = state.rooms.filter((r) => r.active !== false && D.roomCap(r) >= (k.size || 0) && M.roomType(r.type).teachable);
      if (!roomsAny.length && teachRooms.length) add('error', 'class-no-room', `${k.name}: kein Raum gross genug`, `${k.size} Lernende, aber kein Unterrichtsraum mit genügend Plätzen.`, link);
      for (const r of reqs) {
        const tid = effTeacher(k, r.subjectId, r);
        if (!r.teacherId) {
          const q = D.qualifiedTeachers(state, r.subjectId);
          if (!q.length) add('error', 'no-qualified', `${k.name} · ${r.subject.name}: keine Lehrperson`, `Keine aktive Lehrperson unterrichtet «${r.subject.name}». Fach bei einer Lehrperson hinterlegen.`, '#/lehrpersonen');
          else if (!tid) add('error', 'no-assignable', `${k.name} · ${r.subject.name}: keine Lehrperson verfügbar`, `${q.length} qualifizierte Lehrpersonen, aber keine ist an den Schultagen der Klasse (${kd.map((d) => M.dayName(d, true)).join(', ') || '–'}) verfügbar.`, link);
          else (autoByClass[k.id] = autoByClass[k.id] || []).push(r.subject.short || r.subject.name);
        }
        if (tid) { teacherNeed[tid] = (teacherNeed[tid] || 0) + r.lessons; (teacherJobs[tid] = teacherJobs[tid] || []).push({ cls: k, r, days: kd }); }
        const req = M.roomReq(r.subject.roomReq || 'any');
        roomNeed[req.id] = (roomNeed[req.id] || 0) + r.lessons; (roomJobs[req.id] = roomJobs[req.id] || []).push({ cls: k, r, days: kd });
        const fitting = state.rooms.filter((rm) => D.roomFits(rm, r.subject, k));
        if (!fitting.length) add('error', 'subj-no-room', `${k.name} · ${r.subject.name}: kein passender Raum`, `Braucht «${req.name}» für ${k.size} Lernende, aber kein solcher Raum ist erfasst.`, '#/raeume');
        if (r.block === 2 && r.lessons % 2 === 1) add('info', 'odd-block', `${k.name} · ${r.subject.name}: ungerade Doppellektionen`, `${r.lessons} Lektionen als Doppellektionen, eine bleibt einzeln.`, '#/lehrgaenge');
      }
    }
    for (const [cid, subs] of Object.entries(autoByClass)) { const k = D.classOf(state, cid); add('info', 'auto-assign', `${k.name}: ${subs.length} ${subs.length === 1 ? 'Fach wird' : 'Fächer werden'} automatisch zugewiesen`, `${subs.join(', ')} – der Generator wählt jeweils die qualifizierte Lehrperson mit der geringsten Auslastung.`, '#/klassen/' + cid); }
    for (const [tid, need] of Object.entries(teacherNeed)) {
      const t = D.teacherOf(state, tid); if (!t) continue;
      const link = '#/lehrpersonen/' + tid; const label = D.teacherLabel(t);
      const avail = D.teacherAvailableSlots(state, t);
      const max = D.teacherMaxLessons(state, t);
      if (t.active === false) { add('error', 'teacher-inactive', `${label}: inaktiv, aber zugeteilt`, 'Die Lehrperson ist deaktiviert, hat aber Klassen zugewiesen.', link); continue; }
      if (need > avail) add('error', 'teacher-avail', `${label}: zu wenig Verfügbarkeit`, `${need} Lektionen zugeteilt, aber nur ${avail} Lektionen verfügbar. Verfügbarkeit erweitern oder Lektionen umverteilen.`, link);
      else if (need > max) add('warn', 'teacher-max', `${label}: über dem Pensum`, `${need} Lektionen zugeteilt, Pensum erlaubt ${max}.`, link);
      else if (need > avail * 0.85) add('warn', 'teacher-tight', `${label}: Verfügbarkeit knapp`, `${need} von ${avail} verfügbaren Lektionen belegt.`, link);
      let dayIssue = false;
      for (const { cls, r, days: kd } of teacherJobs[tid]) {
        if (!kd.length) continue;
        const av = D.teacherAvailableSlots(state, t, kd);
        if (av < r.lessons) { add('error', 'teacher-class-days', `${label} · ${cls.name} · ${r.subject.name}`, `An den Schultagen der Klasse (${kd.map((d) => M.dayName(d, true)).join(', ')}) nur ${av} Lektionen verfügbar, benötigt ${r.lessons}.`, link); dayIssue = true; }
        else if (r.block === 2 && r.lessons >= 2) { const pairs = SW.sum(kd, (d) => D.doublePairs(state, t, d)); if (pairs < Math.floor(r.lessons / 2)) add('error', 'teacher-double', `${label} · ${cls.name} · ${r.subject.name}: Doppellektionen`, `Nur ${pairs} zusammenhängende Doppellektions-Plätze an den Schultagen verfügbar, benötigt ${Math.floor(r.lessons / 2)}.`, link); }
      }
      // Tageskapazität: für jede Teilmenge der Unterrichtstage müssen die Lektionen der Klassen, die nur innerhalb liegen, Platz haben
      if (!dayIssue) for (const S of subsets(days)) { const need2 = SW.sum(teacherJobs[tid].filter((j) => j.days.length && j.days.every((d) => S.includes(d))), (j) => j.r.lessons); if (!need2) continue; const cap = D.teacherAvailableSlots(state, t, S); if (need2 > cap) { add('error', 'teacher-day-cap', `${label}: zu viele Lektionen für ${S.map((d) => M.dayName(d, true)).join('/')}`, `${need2} Lektionen von Klassen, die nur an ${S.map((d) => M.dayName(d)).join(', ')} Schule haben – aber nur ${cap} verfügbare Lektionen an diesen Tagen.`, link); break; } }
    }
    for (const [reqId, need] of Object.entries(roomNeed)) {
      const req = M.roomReq(reqId);
      const rooms = state.rooms.filter((r) => r.active !== false && req.types.includes(r.type));
      const capOn = (S) => SW.sum(rooms, (r) => SW.sum(S, (d) => SW.sum(SW.range(slotsPerDay, 1), (s) => (D.roomBlocked(r, d, s) ? 0 : 1))));
      const cap = capOn(days);
      if (need > cap) add('error', 'room-cap', `Raumtyp «${req.name}» überbucht`, `${need} Lektionen brauchen diesen Raumtyp, ${rooms.length} Räume bieten ${cap} freie Plätze pro Woche.`, '#/raeume');
      else {
        let hit = false;
        for (const S of subsets(days)) { if (S.length === days.length) continue; const n2 = SW.sum(roomJobs[reqId].filter((j) => j.days.length && j.days.every((d) => S.includes(d))), (j) => j.r.lessons); if (n2 > capOn(S)) { add('error', 'room-day-cap', `Raumtyp «${req.name}» am ${S.map((d) => M.dayName(d, true)).join('/')} überbucht`, `${n2} Lektionen von Klassen mit Schultagen nur an ${S.map((d) => M.dayName(d)).join(', ')}, aber nur ${capOn(S)} freie Plätze in ${rooms.length} Räumen.`, '#/klassen'); hit = true; break; } }
        if (!hit && rooms.length && need > cap * 0.85) add('warn', 'room-tight', `Raumtyp «${req.name}» knapp`, `${need} von ${cap} Plätzen pro Woche belegt (${Math.round((need / cap) * 100)} %).`, '#/raeume');
      }
    }
    const order = { error: 0, warn: 1, info: 2 };
    issues.sort((a, b) => order[a.level] - order[b.level]);
    return { issues, ok: !issues.some((i) => i.level === 'error'), errors: issues.filter((i) => i.level === 'error').length, warnings: issues.filter((i) => i.level === 'warn').length, stats: { totalLessons, teacherNeed, roomNeed }, assignments };
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
    if (cls?.schoolDays?.length) { const kd = D.normDays(state, cls.schoolDays); if (kd.length && !kd.includes(day)) conflicts.push({ type: 'day', text: `${cls.name} hat am ${M.dayName(day)} keinen Schultag` }); }
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
