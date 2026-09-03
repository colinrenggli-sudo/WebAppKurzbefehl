/* STUNDENWERK · solver.js — Stundenplan-Generator.
   ------------------------------------------------------------------
   Ansatz: (1) Machbarkeit & Lehrpersonen-Zuweisung, (2) konstruktive Platzierung
   «schwierigste Einheit zuerst» mit Verdrängung (Ejection Chains) bei Konflikten,
   (3) lokale Suche (Simulated Annealing) auf den weichen Kriterien,
   (4) Raum-Nachoptimierung (Stammzimmer, keine Raumwechsel).
   Harte Regeln (nie verletzt): Klasse, Lehrperson und Raum je höchstens einmal pro Lektion;
   Lehrperson verfügbar; Klasse nur an ihren Schultagen; Raumtyp und Kapazität passen;
   Doppellektionen zusammenhängend und nicht über den Mittag; fixierte Lektionen bleiben.
   Deterministisch bei gleichem Seed und gleicher Iterationszahl.

   SW.solver.generate(state, opts) → Promise<Plan>
     opts: { seed, timeMs, maxIterations, weights, onProgress(p), signal:{aborted}, assignments, keepLocked:true, quality }
     Plan: { id, createdAt, seed, lessons[], unplaced[], score, stats, assignments, unassigned, durationMs, iterations, log[] }
   SW.solver.validate(state, lessons) → [{lessonId, type, text}]  unabhängige Prüfung aller harten Regeln
   SW.solver.cost(state, lessons, weights) → {total, parts}       Bewertung eines Plans
*/
(function () {
  const SW = (globalThis.SW = globalThis.SW || {});
  const M = SW.model; const D = SW.domain;
  const SOLVER = (SW.solver = {});

  SOLVER.generate = async function (state, opts = {}) {
    const t0 = Date.now();
    const seed = Number.isFinite(opts.seed) ? opts.seed : (state.settings.seed || 42);
    const rng = SW.rng(seed);
    const w = { ...M.DEFAULT_WEIGHTS, ...(state.settings.weights || {}), ...(opts.weights || {}) };
    const timeMs = opts.timeMs ?? (M.QUALITY.find((q) => q.id === (opts.quality || state.settings.quality))?.ms || 8000);
    const maxIter = opts.maxIterations ?? Infinity;
    const onProgress = opts.onProgress || (() => {});
    const signal = opts.signal || { aborted: false };
    const log = [];

    // ---------- 1 · Vorbereitung ----------
    const days = D.days(state); const S = D.slotCount(state); const lunch = state.settings.lunchAfter; const W = S + 2; // Zeilenbreite pro Tag
    const idx = (d, s) => d * W + s;
    const classes = state.classes; const teachers = state.teachers.filter((t) => t.active !== false);
    const rooms = state.rooms.filter((r) => r.active !== false && M.roomType(r.type).teachable);
    const cI = new Map(classes.map((k, i) => [k.id, i])); const tI = new Map(teachers.map((t, i) => [t.id, i])); const rI = new Map(rooms.map((r, i) => [r.id, i]));
    const N = 8 * W;
    const mk = (n) => { const a = []; for (let i = 0; i < n; i++) a.push(new Int32Array(N).fill(-1)); return a; };
    const cOcc = mk(classes.length), tOcc = mk(teachers.length), rOcc = mk(rooms.length);

    // Lehrpersonen-Zuweisung (explizit + automatisch)
    const auto = D.autoAssign(state, seed);
    const assignments = {}; for (const [cid, m] of Object.entries(auto.assignments)) assignments[cid] = { ...m };
    if (opts.assignments) for (const [cid, m] of Object.entries(opts.assignments)) assignments[cid] = { ...(assignments[cid] || {}), ...m };

    // Einheiten (Lektionen bzw. Doppellektionen)
    const units = []; const unplaced = [];
    const classHome = classes.map((k) => (k.homeRoomId && rI.has(k.homeRoomId) ? rI.get(k.homeRoomId) : -1));
    const classDays = classes.map((k) => (k.schoolDays?.length ? D.normDays(state, k.schoolDays) : days.slice()));
    const teacherAvail = teachers.map((t) => { const a = new Uint8Array(N); for (const d of days) for (let s = 1; s <= S; s++) a[idx(d, s)] = D.teacherAvailable(t, d, s) ? 1 : 0; return a; });
    const teacherPref = teachers.map((t) => (t.preferredDays?.length ? new Set(t.preferredDays.map(Number)) : null));

    for (const k of classes) {
      const ci = cI.get(k.id);
      for (const r of D.classRequirements(state, k)) {
        const tid = (r.teacherId && tI.has(r.teacherId) ? r.teacherId : null) || (assignments[k.id] || {})[r.subjectId] || null;
        const ti = tid != null && tI.has(tid) ? tI.get(tid) : -1;
        const cands = D.roomsFor(state, r.subject, k).filter((rm) => rI.has(rm.id)).map((rm) => rI.get(rm.id));
        const block = r.block === 2 ? 2 : 1;
        const nDouble = block === 2 ? Math.floor(r.lessons / 2) : 0; const nSingle = r.lessons - nDouble * 2;
        const mkUnit = (len) => ({ u: units.length, classId: k.id, ci, subjectId: r.subjectId, subject: r.subject, teacherId: tid, ti, len, rooms: cands, sport: (r.subject.roomReq === 'turnhalle'), d: -1, s: -1, r: -1, locked: false, positions: [], ejections: 0, tabu: new Map() });
        for (let i = 0; i < nDouble; i++) units.push(mkUnit(2));
        for (let i = 0; i < nSingle; i++) units.push(mkUnit(1));
      }
    }
    // Fixierte Lektionen aus dem bestehenden Plan übernehmen
    const lockedIn = []; const droppedLocks = [];
    if (opts.keepLocked !== false && state.timetable?.lessons) {
      for (const l of state.timetable.lessons) {
        if (!l.locked) continue;
        const ci = cI.get(l.classId); const ti = tI.get(l.teacherId); const ri = rI.get(l.roomId);
        if (ci == null) continue;
        // passende Einheit finden und fixieren – nur wenn die Lektion alle harten Regeln erfüllt
        const u = units.find((x) => x.d < 0 && !x.locked && x.ci === ci && x.subjectId === l.subjectId && x.len === (l.len || 1));
        if (!u) { droppedLocks.push(`${classes[ci].name} ${D.subjectOf(state, l.subjectId)?.short || ''} ${M.dayName(l.day, true)} ${l.slot}: passt nicht mehr zum Bedarf (Fach, Lektionenzahl oder Lektionsform geändert)`); continue; }
        const len = u.len; const tIdx = ti != null ? ti : u.ti;
        const problems = [];
        if (!days.includes(l.day) || l.slot < 1 || l.slot + len - 1 > S) problems.push('ausserhalb des Rasters');
        else {
          if (!classDays[ci].includes(l.day)) problems.push('kein Schultag');
          if (len > 1 && l.slot <= lunch && l.slot + len - 1 > lunch) problems.push('über den Mittag');
          if (tIdx < 0) problems.push('keine Lehrperson');
          else for (let q = 0; q < len; q++) if (!teacherAvail[tIdx][idx(l.day, l.slot + q)]) { problems.push('Lehrperson nicht verfügbar'); break; }
          if (ri == null || !u.rooms.includes(ri)) problems.push('Raum passt nicht');
          else for (let q = 0; q < len; q++) if (D.roomBlocked(rooms[ri], l.day, l.slot + q)) { problems.push('Raum gesperrt'); break; }
          for (let q = 0; q < len; q++) { const i = idx(l.day, l.slot + q); if (cOcc[ci][i] >= 0 || (tIdx >= 0 && tOcc[tIdx][i] >= 0) || (ri != null && rOcc[ri][i] >= 0)) { problems.push('Doppelbelegung mit anderer fixierter Lektion'); break; } }
        }
        if (problems.length) { droppedLocks.push(`${classes[ci].name} ${u.subject.short || ''} ${M.dayName(l.day, true)} ${l.slot}: ${SW.uniq(problems).join(', ')}`); continue; }
        u.locked = true; u.lockedId = l.id; u.d = l.day; u.s = l.slot; u.r = ri; if (ti != null) { u.ti = ti; u.teacherId = l.teacherId; }
        lockedIn.push(u);
        // sofort belegen, damit weitere fixierte Lektionen dagegen geprüft werden
        for (let q = 0; q < len; q++) { const i = idx(l.day, l.slot + q); cOcc[ci][i] = u.u; if (u.ti >= 0) tOcc[u.ti][i] = u.u; rOcc[ri][i] = u.u; }
      }
    }
    // Positionen (Tag, Startlektion) je Einheit
    for (const u of units) {
      if (u.locked) continue;
      if (u.ti < 0) { u.reason = 'Keine Lehrperson für dieses Fach zugewiesen und keine automatische Zuweisung möglich.'; continue; }
      if (!u.rooms.length) { u.reason = `Kein passender Raum (${M.roomReq(u.subject.roomReq).name}, ${classes[u.ci].size} Lernende).`; continue; }
      for (const d of classDays[u.ci]) for (let s = 1; s + u.len - 1 <= S; s++) {
        if (u.len > 1 && s <= lunch && s + u.len - 1 > lunch) continue;
        let ok = true; for (let q = 0; q < u.len; q++) if (!teacherAvail[u.ti][idx(d, s + q)]) { ok = false; break; }
        if (ok) u.positions.push({ d, s });
      }
      if (!u.positions.length) u.reason = !classDays[u.ci].length ? 'Die Schultage der Klasse liegen ausserhalb der Unterrichtstage der Schule.' : `${D.teacherLabel(teachers[u.ti])} ist an den Schultagen der Klasse (${classDays[u.ci].map((d) => M.dayName(d, true)).join(', ')}) ${u.len > 1 ? 'für keine Doppellektion' : 'nie'} verfügbar.`;
    }

    // ---------- Belegung & Kosten ----------
    const place = (u, d, s, r) => { u.d = d; u.s = s; u.r = r; for (let q = 0; q < u.len; q++) { const i = idx(d, s + q); cOcc[u.ci][i] = u.u; if (u.ti >= 0) tOcc[u.ti][i] = u.u; if (r >= 0) rOcc[r][i] = u.u; } };
    const unplace = (u) => { if (u.d < 0) return; for (let q = 0; q < u.len; q++) { const i = idx(u.d, u.s + q); cOcc[u.ci][i] = -1; if (u.ti >= 0) tOcc[u.ti][i] = -1; if (u.r >= 0) rOcc[u.r][i] = -1; } u.d = -1; u.s = -1; u.r = -1; };
    for (const u of lockedIn) { const d = u.d, s0 = u.s, r = u.r; u.d = -1; place(u, d, s0, r); }
    if (droppedLocks.length) log.push(`${droppedLocks.length} fixierte Lektionen nicht übernommen (Regelverstoss): ${droppedLocks.slice(0, 5).join('; ')}`);

    const classDayCost = (ci, d) => {
      let first = -1, last = -1, n = 0, late = 0, changes = 0, notHome = 0, sportL = 0, prevRoom = -2, same = 0; const cnt = {};
      const home = classHome[ci];
      for (let s = 1; s <= S; s++) {
        const ui = cOcc[ci][idx(d, s)]; if (ui < 0) continue; const u = units[ui];
        n++; if (first < 0) first = s; last = s;
        if (s === u.s) { const c = (cnt[u.subjectId] = (cnt[u.subjectId] || 0) + 1); if (c > 1) same++; if (u.sport && s === lunch + 1) sportL++; }
        if (s === S) late++;
        if (prevRoom !== -2 && u.r !== prevRoom) changes++; prevRoom = u.r;
        if (home >= 0 && u.r !== home && !u.sport && u.subject.roomReq !== 'informatik') notHome++;
      }
      if (!n) return 0;
      const gaps = last - first + 1 - n;
      return w.classGap * gaps + w.lateSlot * late + (first > 2 ? w.lateStart : 0) + (first === 1 ? w.earlyStart : 0) + w.roomChange * changes + w.homeRoom * notHome + w.sportAfterLunch * sportL + w.subjectSameDay * same;
    };
    const teacherDayCost = (ti, d) => {
      let first = -1, last = -1, n = 0;
      for (let s = 1; s <= S; s++) { if (tOcc[ti][idx(d, s)] < 0) continue; n++; if (first < 0) first = s; last = s; }
      if (!n) return 0;
      const gaps = last - first + 1 - n;
      return w.teacherGap * gaps + (n === 1 ? w.teacherSingleLesson : 0) + (teacherPref[ti] && !teacherPref[ti].has(d) ? w.teacherPrefDay * n : 0);
    };
    const classBalanceCost = (ci) => {
      const ds = classDays[ci]; if (ds.length < 2) return 0;
      let total = 0; const per = ds.map((d) => { let n = 0; for (let s = 1; s <= S; s++) if (cOcc[ci][idx(d, s)] >= 0) n++; total += n; return n; });
      const avg = total / ds.length; return (w.dayBalance * SW.sum(per, (n) => Math.abs(n - avg))) / 2;
    };
    const localCost = (u, d) => classDayCost(u.ci, d) + (u.ti >= 0 ? teacherDayCost(u.ti, d) : 0) + classBalanceCost(u.ci);
    const totalCost = () => { let c = 0; for (let ci = 0; ci < classes.length; ci++) { for (const d of days) c += classDayCost(ci, d); c += classBalanceCost(ci); } for (let ti = 0; ti < teachers.length; ti++) for (const d of days) c += teacherDayCost(ti, d); return c; };

    const freeFor = (u, d, s) => { for (let q = 0; q < u.len; q++) { const i = idx(d, s + q); if (cOcc[u.ci][i] >= 0 || (u.ti >= 0 && tOcc[u.ti][i] >= 0)) return false; } return true; };
    // Wöchentliche Sperrzeiten der Räume (room.blocked = {day:[bool×slots]}, z.B. Aula am Freitagnachmittag)
    const roomBlocked = rooms.map((r) => { const a = new Uint8Array(N); for (const d of days) for (let s = 1; s <= S; s++) a[idx(d, s)] = D.roomBlocked(r, d, s) ? 1 : 0; return a; });
    const roomFree = (r, d, s, len) => { for (let q = 0; q < len; q++) { const i = idx(d, s + q); if (rOcc[r][i] >= 0 || roomBlocked[r][i]) return false; } return true; };
    // besten freien Raum wählen: Raum der Vor-/Nachbarlektion, Stammzimmer, sonst erster passender
    const pickRoom = (u, d, s) => {
      const before = s > 1 ? cOcc[u.ci][idx(d, s - 1)] : -1; const after = s + u.len <= S ? cOcc[u.ci][idx(d, s + u.len)] : -1;
      const prefs = []; if (before >= 0) prefs.push(units[before].r); if (after >= 0) prefs.push(units[after].r); if (classHome[u.ci] >= 0) prefs.push(classHome[u.ci]);
      for (const r of prefs) if (r >= 0 && u.rooms.includes(r) && roomFree(r, d, s, u.len)) return r;
      for (const r of u.rooms) if (roomFree(r, d, s, u.len)) return r;
      return -1;
    };
    const stepNow = { n: 0 };
    const isTabu = (u, d, s) => { const t = u.tabu.get(d * 100 + s); return t != null && t > stepNow.n; };

    // beste Position (min. Kostenzuwachs) unter freien Positionen; gibt {d,s,r,delta} oder null
    const bestFree = (u, opts2 = {}) => {
      let best = null; let bestDelta = Infinity;
      const poss = opts2.shuffle ? rng.shuffle(u.positions) : u.positions;
      for (const p of poss) {
        if (!freeFor(u, p.d, p.s)) continue; if (opts2.noTabu && isTabu(u, p.d, p.s)) continue;
        const r = pickRoom(u, p.d, p.s); if (r < 0) continue;
        const before = localCost(u, p.d); place(u, p.d, p.s, r); const delta = localCost(u, p.d) - before + rng() * 0.01; unplace(u);
        if (delta < bestDelta) { bestDelta = delta; best = { d: p.d, s: p.s, r, delta }; }
      }
      return best;
    };

    // ---------- 2 · Konstruktion ----------
    const movable = units.filter((u) => !u.locked && !u.reason);
    const order = SW.sortBy(rng.shuffle(movable), (u) => u.positions.length, (u) => -u.len, (u) => -u.rooms.length * -1);
    const queue = order.slice();
    const maxEject = 40; let steps = 0; const stepLimit = Math.max(2000, movable.length * 60);
    // Verständlicher Grund, wenn eine Einheit aufgegeben wird: welche Ressource blockiert wie viele Positionen?
    const blockReason = (u) => {
      let bt = 0, bc = 0, br = 0; const n = u.positions.length;
      for (const p of u.positions) { let t = false, c = false, r = true; for (let q = 0; q < u.len; q++) { const i = idx(p.d, p.s + q); if (u.ti >= 0 && tOcc[u.ti][i] >= 0) t = true; if (cOcc[u.ci][i] >= 0) c = true; } for (const rr of u.rooms) if (roomFree(rr, p.d, p.s, u.len)) { r = false; break; } if (t) bt++; if (c) bc++; if (r) br++; }
      const parts = []; if (bt) parts.push(`Lehrperson ${D.teacherLabel(teachers[u.ti])} an ${bt} von ${n} möglichen Positionen bereits belegt`); if (bc) parts.push(`Klasse an ${bc} von ${n} Positionen belegt`); if (br) parts.push(`kein passender Raum frei an ${br} von ${n} Positionen`);
      return 'Keine konfliktfreie Position: ' + (parts.join('; ') || 'alle Positionen blockiert') + '.';
    };
    let lastYield = Date.now();
    const report = (phase, pct, extra) => onProgress({ phase, pct, placed: movable.filter((u) => u.d >= 0).length, total: movable.length, ...extra });
    while (queue.length && steps < stepLimit) {
      if (signal.aborted) break;
      steps++; stepNow.n = steps;
      const u = queue.shift(); if (u.d >= 0) continue;
      const b = bestFree(u, { noTabu: true }) || bestFree(u);
      if (b) { place(u, b.d, b.s, b.r); continue; }
      // Verdrängung: Position mit den wenigsten (verschiebbaren) Konflikten
      if (u.ejections >= maxEject) { u.reason = u.reason || blockReason(u); continue; }
      let bestP = null, bestConf = null, bestScore = Infinity; let blockedT = 0, blockedC = 0, blockedR = 0;
      for (const p of rng.shuffle(u.positions)) {
        if (isTabu(u, p.d, p.s)) continue;
        const conf = new Set(); let locked = false;
        for (let q = 0; q < u.len; q++) { const i = idx(p.d, p.s + q); const a = cOcc[u.ci][i], b2 = u.ti >= 0 ? tOcc[u.ti][i] : -1; if (a >= 0) { if (units[a].locked) locked = true; conf.add(a); blockedC++; } if (b2 >= 0) { if (units[b2].locked) locked = true; conf.add(b2); blockedT++; } }
        if (locked) continue;
        let r = -1; for (const rr of u.rooms) if (roomFree(rr, p.d, p.s, u.len)) { r = rr; break; }
        if (r < 0) { // Raumbelegung: Belegende Einheit des bevorzugten Raums verdrängen (wenn verschiebbar)
          blockedR++;
          let cand = -1; for (const rr of u.rooms) { let ok = true; const occ = new Set(); for (let q = 0; q < u.len; q++) { const i2 = idx(p.d, p.s + q); if (roomBlocked[rr][i2]) { ok = false; break; } const o = rOcc[rr][i2]; if (o >= 0) { if (units[o].locked) { ok = false; break; } occ.add(o); } } if (ok && occ.size <= 1) { cand = rr; occ.forEach((o) => conf.add(o)); break; } }
          if (cand < 0) continue; r = cand;
        }
        const score = conf.size * 10 + [...conf].reduce((a, c) => a + units[c].ejections * 0.5, 0) + rng();
        if (score < bestScore) { bestScore = score; bestP = { ...p, r }; bestConf = conf; }
      }
      if (!bestP || bestConf.size > 3) { u.ejections++; queue.push(u); if (u.ejections >= maxEject) u.reason = blockReason(u); continue; }
      for (const c of bestConf) { const v = units[c]; unplace(v); v.ejections++; v.tabu.set(v.d * 100 + v.s, steps + 15); v.tabu.set(bestP.d * 100 + bestP.s, steps + 15); queue.unshift(v); }
      u.ejections++; place(u, bestP.d, bestP.s, bestP.r);
      if (Date.now() - lastYield > 40) { report('Platzieren', Math.min(0.45, 0.05 + (0.4 * (movable.length - queue.length)) / Math.max(1, movable.length))); await SW.yieldToUI(); lastYield = Date.now(); }
    }
    for (const u of movable) if (u.d < 0 && !u.reason) u.reason = blockReason(u);
    log.push(`Konstruktion: ${movable.filter((u) => u.d >= 0).length}/${movable.length} platziert in ${steps} Schritten`);

    // ---------- 3 · Lokale Suche ----------
    // Simulated Annealing mit vier Zügen: zufälliges Verschieben, Tausch innerhalb der Klasse,
    // gezieltes Füllen einer Klassen-Freistunde, gezieltes Füllen einer Lehrpersonen-Freistunde.
    let cost = totalCost(); let best = cost; let bestSnap = snapshot();
    const tStart = Date.now(); const searchMs = Math.max(200, timeMs - (tStart - t0));
    let iter = 0; const T0 = 2.5, T1 = 0.03;
    function snapshot() { return units.map((u) => [u.d, u.s, u.r]); }
    function restore(snap) { for (const u of units) unplace(u); units.forEach((u, i) => { if (snap[i][0] >= 0) place(u, snap[i][0], snap[i][1], snap[i][2]); }); }
    const placed = () => movable.filter((u) => u.d >= 0);
    let pool = placed();
    const accept = (delta, T) => delta <= 0 || rng() < Math.exp(-delta / T);
    // Einheit u auf (d,s) verschieben, Delta bewerten; bei Ablehnung zurück. Gibt true bei Annahme.
    const tryMove = (u, d, s, T) => {
      if (d === u.d && s === u.s) return false;
      if (!u.positions.some((p) => p.d === d && p.s === s)) return false;
      const od = u.d, os = u.s, or = u.r; unplace(u);
      if (!freeFor(u, d, s)) { place(u, od, os, or); return false; }
      const r = pickRoom(u, d, s); if (r < 0) { place(u, od, os, or); return false; }
      const daysAff = d === od ? [od] : [od, d];
      const before = SW.sum(daysAff, (x) => classDayCost(u.ci, x) + (u.ti >= 0 ? teacherDayCost(u.ti, x) : 0)) + classBalanceCost(u.ci);
      place(u, d, s, r);
      const after = SW.sum(daysAff, (x) => classDayCost(u.ci, x) + (u.ti >= 0 ? teacherDayCost(u.ti, x) : 0)) + classBalanceCost(u.ci);
      const delta = after - before;
      if (accept(delta, T)) { cost += delta; return true; }
      unplace(u); place(u, od, os, or); return false;
    };
    // Zwei Einheiten derselben Klasse tauschen (gleiche Länge)
    const trySwap = (u, v, T) => {
      if (u === v || u.ci !== v.ci || u.len !== v.len || u.d < 0 || v.d < 0) return false;
      if (!u.positions.some((p) => p.d === v.d && p.s === v.s) || !v.positions.some((p) => p.d === u.d && p.s === u.s)) return false;
      const ud = u.d, us = u.s, ur = u.r, vd = v.d, vs = v.s, vr = v.r;
      const daysAff = SW.uniq([ud, vd]); const tis = SW.uniq([u.ti, v.ti].filter((x) => x >= 0));
      const evalCost = () => SW.sum(daysAff, (x) => classDayCost(u.ci, x) + SW.sum(tis, (ti) => teacherDayCost(ti, x)));
      const before = evalCost();
      unplace(u); unplace(v);
      if (!freeFor(u, vd, vs) || !freeFor(v, ud, us)) { place(u, ud, us, ur); place(v, vd, vs, vr); return false; }
      const ru = pickRoom(u, vd, vs); if (ru < 0) { place(u, ud, us, ur); place(v, vd, vs, vr); return false; }
      place(u, vd, vs, ru); const rv = pickRoom(v, ud, us); if (rv < 0) { unplace(u); place(u, ud, us, ur); place(v, vd, vs, vr); return false; } place(v, ud, us, rv);
      const delta = evalCost() - before;
      if (accept(delta, T)) { cost += delta; return true; }
      unplace(u); unplace(v); place(u, ud, us, ur); place(v, vd, vs, vr); return false;
    };
    const gapsOfLine = (occ, d) => { let first = -1, last = -1; const g = []; for (let s = 1; s <= S; s++) if (occ[idx(d, s)] >= 0) { if (first < 0) first = s; last = s; } if (first < 0) return g; for (let s = first; s <= last; s++) if (occ[idx(d, s)] < 0) g.push(s); return g; };
    const edgeUnits = (occ, d) => { let first = -1, last = -1; for (let s = 1; s <= S; s++) if (occ[idx(d, s)] >= 0) { if (first < 0) first = occ[idx(d, s)]; last = occ[idx(d, s)]; } return first < 0 ? [] : SW.uniq([first, last]).map((i) => units[i]); };
    while (iter < maxIter) {
      if (signal.aborted) break;
      const el = Date.now() - tStart; if (el > searchMs) break;
      iter++;
      const frac = Number.isFinite(maxIter) ? iter / maxIter : el / searchMs; const T = T0 * Math.pow(T1 / T0, frac);
      if (iter % 500 === 1) pool = placed();
      if (iter % 4000 === 0) { cost = totalCost(); if (cost > best * 1.15 && frac > 0.5) { restore(bestSnap); cost = best; pool = placed(); } }
      if (!pool.length) break;
      const kind = rng();
      if (kind < 0.3) {
        const u = pool[rng.int(pool.length)]; const p = u.positions[rng.int(u.positions.length)]; tryMove(u, p.d, p.s, T);
      } else if (kind < 0.55) {
        const u = pool[rng.int(pool.length)]; const same = pool.filter((v) => v.ci === u.ci && v !== u && v.len === u.len); if (same.length) trySwap(u, same[rng.int(same.length)], T);
      } else if (kind < 0.8) {
        // Klassen-Freistunde füllen: Randlektion des Tages oder Lektion eines anderen Tages in die Lücke ziehen
        const ci = rng.int(classes.length); const ds = classDays[ci]; const d = ds[rng.int(ds.length)];
        const gaps = gapsOfLine(cOcc[ci], d); if (!gaps.length) continue;
        const g = gaps[rng.int(gaps.length)];
        const cands = rng.shuffle([...edgeUnits(cOcc[ci], d), ...pool.filter((v) => v.ci === ci && v.d !== d)]);
        for (const u of cands.slice(0, 6)) { const starts = u.len === 2 ? [g - 1, g] : [g]; let done = false; for (const s0 of starts) if (s0 >= 1 && tryMove(u, d, s0, T)) { done = true; break; } if (done) break; }
      } else if (kind < 0.95) {
        // Lehrpersonen-Freistunde füllen: Randlektion der Lehrperson in die Lücke (direkt oder per Tausch mit der Lektion der Klasse an dieser Stelle)
        const ti = rng.int(teachers.length); const d = days[rng.int(days.length)];
        const gaps = gapsOfLine(tOcc[ti], d); if (!gaps.length) continue;
        const g = gaps[rng.int(gaps.length)];
        for (const u of rng.shuffle(edgeUnits(tOcc[ti], d))) {
          if (u.locked) continue;
          const starts = u.len === 2 ? [g - 1, g] : [g]; let done = false;
          for (const s0 of starts) {
            if (s0 < 1) continue;
            const occ = cOcc[u.ci][idx(d, s0)];
            if (occ < 0) { if (tryMove(u, d, s0, T)) { done = true; break; } }
            else { const v = units[occ]; if (!v.locked && v.s === s0 && v.len === u.len && trySwap(u, v, T)) { done = true; break; } }
          }
          if (done) break;
        }
      } else {
        // Unplatzierte nachträglich versuchen / Raum wechseln
        const un = movable.filter((x) => x.d < 0 && x.positions.length);
        if (un.length) {
          const x = un[rng.int(un.length)]; const b = bestFree(x);
          if (b) { place(x, b.d, b.s, b.r); x.reason = null; cost += b.delta; pool = placed(); }
          else {
            // Einschritt-Verdrängung: eine blockierende Einheit ausbauen, x setzen, Blockierer neu platzieren – sonst zurück
            const p = x.positions[rng.int(x.positions.length)]; const conf = new Set(); let locked = false;
            for (let q = 0; q < x.len; q++) { const i = idx(p.d, p.s + q); const a = cOcc[x.ci][i], b2 = x.ti >= 0 ? tOcc[x.ti][i] : -1; if (a >= 0) { if (units[a].locked) locked = true; conf.add(a); } if (b2 >= 0) { if (units[b2].locked) locked = true; conf.add(b2); } }
            if (!locked && conf.size === 1) {
              const v = units[[...conf][0]]; const vd = v.d, vs = v.s, vr = v.r; unplace(v);
              const r = pickRoom(x, p.d, p.s);
              if (r >= 0) { place(x, p.d, p.s, r); const bv = bestFree(v); if (bv) { place(v, bv.d, bv.s, bv.r); x.reason = null; cost = totalCost(); pool = placed(); } else { unplace(x); place(v, vd, vs, vr); } }
              else place(v, vd, vs, vr);
            }
          }
        }
        else { const u = pool[rng.int(pool.length)]; const r = pickRoom(u, u.d, u.s); if (r >= 0 && r !== u.r) { const before = classDayCost(u.ci, u.d); const or = u.r; const d = u.d, s = u.s; unplace(u); place(u, d, s, r); const delta = classDayCost(u.ci, d) - before; if (delta <= 0) cost += delta; else { unplace(u); place(u, d, s, or); } } }
      }
      if (cost < best - 1e-9) { best = cost; bestSnap = snapshot(); }
      if (iter % 400 === 0 && Date.now() - lastYield > 40) { report('Optimieren', 0.45 + 0.5 * frac, { score: Math.round(best) }); await SW.yieldToUI(); lastYield = Date.now(); }
    }
    restore(bestSnap); cost = totalCost();
    log.push(`Lokale Suche: ${iter} Iterationen, Kosten ${Math.round(cost)}`);

    // ---------- 4 · Raum-Nachoptimierung ----------
    for (let pass = 0; pass < 2; pass++) for (let ci = 0; ci < classes.length; ci++) for (const d of days) {
      for (let s = 1; s <= S; s++) { const ui = cOcc[ci][idx(d, s)]; if (ui < 0) continue; const u = units[ui]; if (u.s !== s || u.locked) continue; const before = classDayCost(ci, d); const or = u.r; unplace(u); const r = pickRoom(u, d, s); place(u, d, s, r >= 0 ? r : or); if (classDayCost(ci, d) > before) { unplace(u); place(u, d, s, or); } }
    }
    cost = totalCost();

    // ---------- Ergebnis ----------
    const lessons = []; const unplacedOut = [];
    for (const u of units) {
      if (u.d >= 0) lessons.push({ id: u.lockedId || SW.uid('l'), classId: u.classId, subjectId: u.subjectId, teacherId: u.teacherId, roomId: u.r >= 0 ? rooms[u.r].id : null, day: u.d, slot: u.s, len: u.len, locked: !!u.locked });
      else unplacedOut.push({ classId: u.classId, subjectId: u.subjectId, teacherId: u.teacherId, len: u.len, reason: u.reason || 'Keine Position gefunden.' });
    }
    // Gleiche Gründe zusammenfassen
    const grouped = Object.values(SW.groupBy(unplacedOut, (x) => x.classId + '|' + x.subjectId + '|' + x.reason)).map((g) => ({ ...g[0], count: g.length, lessons: SW.sum(g, (x) => x.len) }));
    const plan = { id: SW.uid('tt'), createdAt: Date.now(), seed, quality: opts.quality || state.settings.quality, status: 'draft', lessons, unplaced: grouped, score: Math.round(cost * 10) / 10, assignments, unassigned: auto.unassigned, durramMs: undefined, durationMs: Date.now() - t0, iterations: iter, steps, log, droppedLocks, weights: w };
    delete plan.durramMs;
    plan.stats = D.ttStats(state, plan);
    report('Fertig', 1, { score: plan.score });
    return plan;
  };

  // Unabhängige Prüfung aller harten Regeln eines Plans
  SOLVER.validate = function (state, lessons) {
    const out = []; const S = D.slotCount(state); const lunch = state.settings.lunchAfter; const days = D.days(state);
    const seen = { c: {}, t: {}, r: {} };
    for (const l of lessons) {
      const cls = D.classOf(state, l.classId), t = D.teacherOf(state, l.teacherId), room = D.roomOf(state, l.roomId), subj = D.subjectOf(state, l.subjectId);
      const len = l.len || 1;
      if (!cls) out.push({ lessonId: l.id, type: 'class', text: 'Klasse fehlt' });
      if (!subj) out.push({ lessonId: l.id, type: 'subject', text: 'Fach fehlt' });
      if (!t) out.push({ lessonId: l.id, type: 'teacher', text: 'Keine Lehrperson' });
      if (!room) out.push({ lessonId: l.id, type: 'room', text: 'Kein Raum' });
      if (!days.includes(l.day)) out.push({ lessonId: l.id, type: 'day', text: 'Ungültiger Tag' });
      if (l.slot < 1 || l.slot + len - 1 > S) out.push({ lessonId: l.id, type: 'slot', text: 'Ausserhalb des Rasters' });
      if (len > 1 && l.slot <= lunch && l.slot + len - 1 > lunch) out.push({ lessonId: l.id, type: 'lunch', text: 'Doppellektion über den Mittag' });
      if (cls?.schoolDays?.length && !cls.schoolDays.includes(l.day)) out.push({ lessonId: l.id, type: 'schoolday', text: `${cls.name}: kein Schultag am ${M.dayName(l.day)}` });
      if (room && subj && cls && !D.roomFits(room, subj, cls)) out.push({ lessonId: l.id, type: 'roomfit', text: `${room.name} passt nicht zu ${subj.name}/${cls.size} Lernenden` });
      for (let s = l.slot; s < l.slot + len; s++) {
        if (t && !D.teacherAvailable(t, l.day, s)) out.push({ lessonId: l.id, type: 'avail', text: `${D.teacherLabel(t)} nicht verfügbar ${M.dayName(l.day, true)} ${s}` });
        if (room && D.roomBlocked(room, l.day, s)) out.push({ lessonId: l.id, type: 'roomBlocked', text: `${room.name} gesperrt ${M.dayName(l.day, true)} ${s}` });
        const kc = l.classId + '|' + l.day + '|' + s, kt = l.teacherId + '|' + l.day + '|' + s, kr = l.roomId + '|' + l.day + '|' + s;
        if (seen.c[kc]) out.push({ lessonId: l.id, type: 'classDouble', text: `${cls?.name}: doppelt belegt ${M.dayName(l.day, true)} ${s}`, other: seen.c[kc] }); seen.c[kc] = l.id;
        if (l.teacherId) { if (seen.t[kt]) out.push({ lessonId: l.id, type: 'teacherDouble', text: `${D.teacherLabel(t)}: doppelt belegt ${M.dayName(l.day, true)} ${s}`, other: seen.t[kt] }); seen.t[kt] = l.id; }
        if (l.roomId) { if (seen.r[kr]) out.push({ lessonId: l.id, type: 'roomDouble', text: `${room?.name}: doppelt belegt ${M.dayName(l.day, true)} ${s}`, other: seen.r[kr] }); seen.r[kr] = l.id; }
      }
    }
    return out;
  };

  // Bewertung eines fertigen Plans (für Anzeige, Vergleich von Varianten)
  SOLVER.cost = function (state, lessons, weights) {
    const w = { ...M.DEFAULT_WEIGHTS, ...(state.settings.weights || {}), ...(weights || {}) };
    const S = D.slotCount(state); const lunch = state.settings.lunchAfter; const days = D.days(state);
    const parts = { classGap: 0, teacherGap: 0, subjectSameDay: 0, dayBalance: 0, lateSlot: 0, lateStart: 0, roomChange: 0, homeRoom: 0, teacherPrefDay: 0, teacherSingleLesson: 0, sportAfterLunch: 0, earlyStart: 0 };
    const byClassDay = SW.groupBy(lessons, (l) => l.classId + '|' + l.day); const byTeacherDay = SW.groupBy(lessons.filter((l) => l.teacherId), (l) => l.teacherId + '|' + l.day);
    const span = (ls) => { const occ = new Set(); ls.forEach((l) => D.lessonSlots(l).forEach((s) => occ.add(s))); const a = [...occ]; return { n: a.length, first: Math.min(...a), last: Math.max(...a), occ }; };
    for (const [key, ls] of Object.entries(byClassDay)) {
      const cls = D.classOf(state, key.split('|')[0]); const { n, first, last } = span(ls);
      parts.classGap += last - first + 1 - n; if (first > 2) parts.lateStart += 1; if (first === 1) parts.earlyStart += 1;
      parts.lateSlot += ls.filter((l) => l.slot + (l.len || 1) - 1 === S).length;
      const cnt = SW.groupBy(ls, (l) => l.subjectId); for (const g of Object.values(cnt)) parts.subjectSameDay += g.length - 1;
      const sorted = SW.sortBy(ls, (l) => l.slot); for (let i = 1; i < sorted.length; i++) if (sorted[i].roomId !== sorted[i - 1].roomId) parts.roomChange++;
      if (cls?.homeRoomId) parts.homeRoom += ls.filter((l) => l.roomId !== cls.homeRoomId && D.subjectOf(state, l.subjectId)?.roomReq !== 'turnhalle' && D.subjectOf(state, l.subjectId)?.roomReq !== 'informatik').length;
      parts.sportAfterLunch += ls.filter((l) => l.slot === lunch + 1 && D.subjectOf(state, l.subjectId)?.roomReq === 'turnhalle').length;
    }
    for (const [key, ls] of Object.entries(byTeacherDay)) {
      const t = D.teacherOf(state, key.split('|')[0]); const d = Number(key.split('|')[1]); const { n, first, last } = span(ls);
      parts.teacherGap += last - first + 1 - n; if (n === 1) parts.teacherSingleLesson++; if (t?.preferredDays?.length && !t.preferredDays.includes(d)) parts.teacherPrefDay += n;
    }
    for (const k of state.classes) { const ds = k.schoolDays?.length ? k.schoolDays : days; if (ds.length < 2) continue; const per = ds.map((d) => SW.sum(D.lessonsFor({ lessons }, { classId: k.id, day: d }), (l) => l.len || 1)); const avg = SW.sum(per) / ds.length; parts.dayBalance += SW.sum(per, (n) => Math.abs(n - avg)) / 2; }
    let total = 0; const weighted = {}; for (const [k, v] of Object.entries(parts)) { weighted[k] = v * (w[k] || 0); total += weighted[k]; }
    return { total: Math.round(total * 10) / 10, parts, weighted };
  };
})();
