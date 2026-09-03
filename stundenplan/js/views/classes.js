/* STUNDENWERK · views/classes.js — Klassen.
   Routen:  #/klassen          Liste: Kennzahlen, Suche, Filter Lehrgang/Lehrjahr, Anlegen, Menü «Weitere»
                               (Schultage automatisch verteilen, Lehrpersonen automatisch zuweisen)
            #/klassen/:id      Detail: Kopf, Kennzahlen, Lektionentafel (Fach-Lehrpersonen, Zusatzlektionen),
                               Team (KLP/StV/ABU, weitere Lehrpersonen), Hinweise, Wochenplan (wenn Plan vorhanden)
   Schreibt ausschliesslich über SW.store (add/put/patch/remove/update); der Router rendert danach neu.
   Eigene CSS-Klassen mit Präfix .kl- (per SW.ui.injectCSS). */
(function () {
  const SW = (globalThis.SW = globalThis.SW || {});
  SW.views = SW.views || {};
  const h = SW.h; const M = SW.model; const U = SW.ui; const D = SW.domain;

  const CSS = `
.kl-toolbar select.inp{width:auto;min-width:160px;max-width:260px}
.kl-toolbar .kl-count{font-size:13px;color:var(--txt-3);white-space:nowrap;font-variant-numeric:tabular-nums}
@media (max-width:600px){.kl-toolbar .search{max-width:none;flex-basis:100%}.kl-toolbar select.inp{flex:1;min-width:0;max-width:none}.kl-toolbar .kl-count{display:none}}
.kl-tbl td{white-space:nowrap}
.kl-tbl .kl-name{font-weight:680;font-size:14.5px}
.kl-tbl .kl-sub{font-size:12px;color:var(--txt-3);margin-top:1px}
.kl-tbl .kl-days{gap:3px;flex-wrap:nowrap}
.kl-tbl tr.kl-err td .kl-name{color:var(--err-txt)}
@media (max-width:980px){.kl-tbl .hm{display:none}}
.kl-ic{width:76px;height:76px;border-radius:22px;background:var(--tint-soft);display:grid;place-items:center;font-size:40px;flex:none;line-height:1}
.kl-head{display:flex;align-items:center;gap:18px;flex-wrap:wrap}
.kl-head .grow{min-width:0}
.kl-head h1{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.kl-head .chips{margin-top:8px}
.kl-head .actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.kl-head a.chip{color:var(--txt-2)}
.kl-head a.chip:hover{text-decoration:none;background:var(--tint-soft);color:var(--tint-txt)}
.kl-kpi-err .val{color:var(--err)}
.kl-team .kl-role{width:150px;flex:none}
.kl-team .kl-role .sub{font-size:12px;color:var(--txt-3)}
.kl-team a:hover{text-decoration:none}
@media (max-width:600px){.kl-team .kl-role{width:104px}}
.kl-req td{vertical-align:middle}
.kl-tsel{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.kl-tsel select.inp{flex:1;min-width:230px;max-width:340px}
.kl-sum{padding:12px 14px;border-radius:var(--r-s);background:var(--card-2);display:flex;flex-direction:column;gap:8px}
.kl-sum .meter .num{min-width:72px}
.kl-form h4{margin-bottom:10px}
.field .hint.kl-warn{color:var(--warn)}
.kl-issues li .btn{flex:none}
.kl-legend{margin-top:10px}
.kl-empty .empty p{max-width:60ch}
.kl-empty .kl-missing{margin-top:10px;font-size:13px;color:var(--txt-2)}
`;

  // UI-Zustand der Liste – überlebt das Neu-Rendern nach Store-Änderungen
  const L = { q: '', cur: '', year: '' };

  // ---------- Helfer ----------
  const st = () => SW.store.state;
  const canEdit = () => st().settings.role !== 'teacher';
  const byName = (a, b) => String(a).localeCompare(String(b), 'de', { numeric: true, sensitivity: 'base' });
  const byCode = (a, b) => byName(a.code || a.emoji, b.code || b.emoji);
  const sortClasses = (list) => [...list].sort((a, b) => byName(a.name, b.name));
  const plural = (n, one, many) => `${SW.fmtNum(n)} ${n === 1 ? one : many}`;
  const dayNames = (days) => (days || []).map((d) => M.dayName(d, true)).join(', ');
  const roomCap = (r) => (D.roomCap ? D.roomCap(r) : (Number(r?.capacity) > 0 ? Number(r.capacity) : Infinity));
  // Schultage innerhalb der Unterrichtstage der Schule (Tage ausserhalb settings.days zählen nicht)
  const schoolDaysOf = (state, k) => (D.normDays ? D.normDays(state, k.schoolDays) : SW.uniq((k.schoolDays || []).map(Number).filter((d) => D.days(state).includes(d))).sort((a, b) => a - b));
  const classDays = (state, k) => { const d = schoolDaysOf(state, k); return d.length ? d : D.days(state); };
  const capacityOf = (state, k) => schoolDaysOf(state, k).length * D.slotCount(state);
  const nameExists = (state, name, exceptId) => { const n = String(name || '').trim().toLowerCase(); return state.classes.some((k) => k.id !== exceptId && String(k.name || '').trim().toLowerCase() === n); };
  const roleOf = (id) => M.TEACHER_ROLES.find((r) => r.id === id) || { id, name: id || 'Lehrperson', short: '' };
  const teacherOpts = (state) => [...state.teachers.filter((t) => t.active !== false)].sort(byCode).map((t) => ({ value: t.id, label: D.teacherLabel(t) }));
  const HOME_TYPES = ['klassenzimmer', 'display', 'grossraum'];
  const pillLink = (t) => (t ? h('a', { href: '#/lehrpersonen/' + t.id, title: 'Lehrperson öffnen' }, U.teacherPill(t)) : h('span.faint', '–'));
  const levelChip = (lvl) => h('span.chip.sm.' + (lvl === 'error' ? 'err' : lvl === 'warn' ? 'warn' : 'info'), lvl === 'error' ? 'Fehler' : lvl === 'warn' ? 'Warnung' : 'Hinweis');
  const goDetail = (id) => SW.router.go('#/klassen/' + id);

  // Status einer Klasse: bereit / n Fächer automatisch / unvollständig
  const statusOf = (state, k) => {
    if (!k.curriculumId) return { level: 'err', label: 'unvollständig', text: 'Kein Lehrgang zugeordnet' };
    if (!schoolDaysOf(state, k).length) return { level: 'err', label: 'unvollständig', text: (k.schoolDays || []).length ? 'Die Schultage liegen ausserhalb der Unterrichtstage der Schule' : 'Keine Schultage festgelegt' };
    const reqs = D.classRequirements(state, k);
    if (!reqs.length) return { level: 'warn', label: 'keine Lektionen', text: `Der Lehrgang hat im ${k.year}. Lehrjahr keine Lektionen hinterlegt` };
    const open = reqs.filter((r) => !r.teacherId).length;
    if (open) return { level: 'info', label: `${open} ${open === 1 ? 'Fach' : 'Fächer'} automatisch`, text: 'Der Generator wählt für diese Fächer eine qualifizierte Lehrperson mit der geringsten Auslastung' };
    return { level: 'ok', label: 'bereit', text: 'Lehrgang, Schultage und alle Lehrpersonen sind festgelegt' };
  };
  const statusChip = (s, sm = true) => h('span.chip' + (sm ? '.sm' : '') + '.' + s.level, { title: s.text }, s.label);

  // Verfügbarkeit einer Lehrperson an den Schultagen der Klasse
  const availOnDays = (state, t, k) => D.teacherAvailableSlots(state, t, classDays(state, k));
  // «frei»: verfügbare Lektionen an den Schultagen abzüglich Lektionen, die der Lehrperson in Klassen mit gleichen Schultagen bereits fest zugeteilt sind
  const freeOnDays = (state, t, k, sid) => {
    const days = classDays(state, k); let used = 0;
    for (const o of state.classes) {
      if (!classDays(state, o).some((d) => days.includes(d))) continue;
      for (const r of D.classRequirements(state, o)) if (r.teacherId === t.id && !(o.id === k.id && r.subjectId === sid)) used += r.lessons;
    }
    return Math.max(0, availOnDays(state, t, k) - used);
  };
  const teacherOptLabel = (state, t, k, sid) => `${D.teacherLabel(t)} – an Schultagen frei: ${freeOnDays(state, t, k, sid)} Lekt.`;

  // ---------- Schreiboperationen ----------
  function setSubjectTeacher(k, sid, tid) {
    const map = { ...(k.subjectTeachers || {}) };
    if (tid) map[sid] = tid; else delete map[sid];
    // Zusatzlektionen desselben Fachs folgen der Zuweisung, damit die Lektionentafel eindeutig bleibt
    const extras = (k.extraLessons || []).map((e) => (e.subjectId === sid ? { ...e, teacherId: tid || null } : e));
    SW.store.patch('classes', k.id, { subjectTeachers: map, extraLessons: extras });
  }

  async function deleteClass(k, after) {
    const state = st();
    const n = SW.sum(D.lessonsFor(state.timetable, { classId: k.id }), (l) => l.len || 1);
    const ok = await U.confirm({ title: `${k.name} löschen?`, text: `Die Klasse wird mit Team, Fach-Zuweisungen und Zusatzlektionen entfernt.${n ? ` ${plural(n, 'Lektion', 'Lektionen')} im aktuellen Stundenplan werden ebenfalls gelöscht.` : ''}`, ok: 'Löschen', danger: true });
    if (!ok) return;
    SW.store.remove('classes', k.id);
    U.toast(`${k.name} gelöscht`);
    after && after();
  }

  // Lehrpersonen automatisch zuweisen – nur für diese Klasse
  function autoAssignClass(k) {
    const state = st();
    const res = D.autoAssign(state, state.settings.seed || 1);
    const m = res.assignments[k.id] || {}; const n = Object.keys(m).length;
    const un = res.unassigned.filter((u) => u.classId === k.id);
    if (!n && !un.length) return U.toast('Alle Fächer dieser Klasse haben bereits eine Lehrperson', { type: 'ok' });
    if (n) SW.store.update((s) => D.applyAssignments(s, { [k.id]: m }));
    if (un.length) U.toast(`${n} zugewiesen · ohne qualifizierte Lehrperson: ${un.map((u) => D.subjectOf(state, u.subjectId)?.short || D.subjectOf(state, u.subjectId)?.name || '?').join(', ')}`, { type: 'warn', ms: 5500 });
    else U.toast(`${plural(n, 'Lehrperson', 'Lehrpersonen')} zugewiesen`, { type: 'ok' });
  }

  // Lehrpersonen automatisch zuweisen – alle Klassen
  async function autoAssignAll() {
    const state = st();
    const open = SW.sum(state.classes, (k) => D.classRequirements(state, k).filter((r) => !r.teacherId).length);
    if (!open) return U.toast('Alle Fächer haben bereits eine feste Lehrperson', { type: 'ok' });
    const ok = await U.confirm({ title: 'Lehrpersonen automatisch zuweisen?', text: `${plural(open, 'Fach hat', 'Fächer haben')} noch keine Lehrperson. Zugewiesen wird jeweils eine qualifizierte Lehrperson mit Verfügbarkeit an den Schultagen und der geringsten Auslastung. Bestehende Zuweisungen bleiben unverändert.`, ok: 'Zuweisen' });
    if (!ok) return;
    const res = D.autoAssign(state, state.settings.seed || 1);
    const n = SW.sum(Object.values(res.assignments), (m) => Object.keys(m).length);
    if (n) SW.store.update((s) => D.applyAssignments(s, res.assignments));
    U.toast(n ? `${plural(n, 'Zuweisung', 'Zuweisungen')} gespeichert${res.unassigned.length ? ` · ${res.unassigned.length} offen` : ''}` : 'Keine Zuweisung möglich', { type: n ? 'ok' : 'warn' });
    if (res.unassigned.length) unassignedModal(state, res.unassigned);
  }
  function unassignedModal(state, list) {
    const m = U.modal({ title: `${plural(list.length, 'Fach', 'Fächer')} nicht zuweisbar`, sub: 'Keine qualifizierte Lehrperson mit Verfügbarkeit an den Schultagen der Klasse.', size: 'wide',
      body: h('ul.list', list.map((u) => { const k = D.classOf(state, u.classId); const s = D.subjectOf(state, u.subjectId); return h('li', h('span', '⚠️'), h('div.grow', h('div.strong', `${k?.name || '?'} · ${s?.name || '?'}`), h('div.small.muted', u.reason)), k ? h('a.btn.sm', { href: '#/klassen/' + k.id, onclick: () => m.close() }, 'Klasse') : null); })),
      footer: [h('a.btn', { href: '#/lehrpersonen', onclick: () => m.close() }, SW.icon('user'), 'Lehrpersonen'), h('button.btn.primary', { onclick: () => m.close() }, 'Schliessen')] });
  }

  // Schultage gemäss Lehrgang (daysPerYear) möglichst gleichmässig über die Woche verteilen
  function planSchoolDays(state) {
    const days = D.days(state); const load = {}; for (const d of days) load[d] = 0;
    const jobs = []; const skipped = [];
    for (const k of state.classes) {
      const cur = D.curriculumOf(state, k.curriculumId); const n = Math.min(days.length, Number(cur?.daysPerYear?.[k.year] || 0));
      if (!cur || !(n > 0)) { skipped.push(k); continue; }
      jobs.push({ k, n, lessons: D.classLessonCount(state, k) });
    }
    jobs.sort((a, b) => b.n - a.n || b.lessons - a.lessons || byName(a.k.name, b.k.name));
    const result = {};
    for (const j of jobs) {
      const w = Math.max(1, j.lessons) / j.n; // Gewicht pro Schultag: Lektionen dieser Klasse an diesem Tag
      const chosen = []; const cand = [...days];
      for (let i = 0; i < j.n && cand.length; i++) {
        const dist = (d) => (chosen.length ? Math.min(...chosen.map((c) => Math.abs(c - d))) : 0);
        cand.sort((a, b) => load[a] - load[b] || dist(b) - dist(a) || a - b);
        const d = cand.shift(); chosen.push(d); load[d] += w;
      }
      result[j.k.id] = chosen.sort((a, b) => a - b);
    }
    return { result, skipped, count: jobs.length };
  }
  async function distributeDays() {
    const state = st();
    if (!state.classes.length) return U.toast('Keine Klassen vorhanden');
    const plan = planSchoolDays(state);
    if (!plan.count) return U.toast('Kein Lehrgang gibt Schultage pro Lehrjahr vor', { type: 'warn' });
    const ok = await U.confirm({ title: 'Schultage automatisch verteilen?', text: `Für ${plural(plan.count, 'Klasse', 'Klassen')} werden die Schultage gemäss Lehrgang (Tage pro Lehrjahr) möglichst gleichmässig auf ${dayNames(D.days(state))} verteilt. Bestehende Schultage werden ersetzt.${plan.skipped.length ? ` ${plural(plan.skipped.length, 'Klasse', 'Klassen')} ohne Lehrgang oder Tagesvorgabe bleiben unverändert.` : ''}`, ok: 'Verteilen' });
    if (!ok) return;
    SW.store.update((s) => { for (const k of s.classes) if (plan.result[k.id]) k.schoolDays = plan.result[k.id]; });
    U.toast(`Schultage für ${plural(plan.count, 'Klasse', 'Klassen')} verteilt`, { type: 'ok' });
  }

  // ---------- Formular: Klasse anlegen / bearbeiten ----------
  function classForm({ cls, isNew }) {
    const state = st();
    const k = { ...M.newClass(), ...SW.clone(cls || {}) };
    k.schoolDays = Array.isArray(k.schoolDays) ? k.schoolDays.map(Number) : [];
    k.year = Number(k.year) || 1;

    const nameIn = U.input({ value: k.name, placeholder: 'z.B. K1a', oninput: (v) => { k.name = v; nameIn.removeAttribute('aria-invalid'); } });
    const sizeIn = U.input({ type: 'number', min: 0, max: 200, step: 1, value: k.size ?? '', placeholder: '0', oninput: (v) => { k.size = v === '' ? 0 : v; fillRooms(); } });
    const yearSel = U.select([], k.year, (v) => { k.year = Number(v) || 1; daysHintUpdate(); });
    const curSel = U.select(state.curricula.map((c) => ({ value: c.id, label: c.short ? `${c.short} · ${c.name}` : c.name })), k.curriculumId, (v) => { k.curriculumId = v; curSel.removeAttribute('aria-invalid'); fillYears(); daysHintUpdate(); }, { placeholder: state.curricula.length ? 'Lehrgang wählen' : 'Noch kein Lehrgang erfasst' });
    const daysHint = h('div.hint');
    const chips = U.dayChips(D.days(state), k.schoolDays, (v) => { k.schoolDays = v; daysHintUpdate(); });
    const roomSel = U.select([], k.homeRoomId, (v) => (k.homeRoomId = v), { placeholder: 'kein Stammzimmer' });
    const tOpts = teacherOpts(state);
    const klpSel = U.select(tOpts, k.mainTeacherId, (v) => (k.mainTeacherId = v), { placeholder: 'keine' });
    const depSel = U.select(tOpts, k.deputyTeacherId, (v) => (k.deputyTeacherId = v), { placeholder: 'keine' });
    const abuSel = U.select(tOpts, k.abuTeacherId, (v) => (k.abuTeacherId = v), { placeholder: 'keine' });
    const notesIn = U.textarea({ value: k.notes || '', placeholder: 'Besonderheiten, Absprachen, Hinweise für die Planung …', oninput: (v) => (k.notes = v) });

    const fillYears = () => {
      const cur = D.curriculumOf(state, k.curriculumId); const years = Math.max(1, Number(cur?.years) || 3);
      k.year = SW.clamp(Number(k.year) || 1, 1, years);
      SW.mount(yearSel, SW.range(years, 1).map((y) => h('option', { value: y, selected: y === k.year }, `${y}. Lehrjahr`)));
      yearSel.value = String(k.year);
    };
    const daysHintUpdate = () => {
      const cur = D.curriculumOf(state, k.curriculumId); const n = Number(cur?.daysPerYear?.[k.year] || 0); const sel = k.schoolDays.length;
      let text = n ? `Lehrgang sieht ${plural(n, 'Schultag', 'Schultage')} pro Woche vor` : 'Wochentage, an denen die Klasse Unterricht hat';
      if (n && sel && sel !== n) text += ` · gewählt: ${sel}`;
      if (!sel) text += ' · noch kein Schultag gewählt';
      daysHint.textContent = text;
      daysHint.classList.toggle('kl-warn', !sel || (n > 0 && sel > 0 && sel !== n));
    };
    const fillRooms = () => {
      const size = Number(k.size) || 0;
      const rooms = state.rooms.filter((r) => r.active !== false && HOME_TYPES.includes(r.type)).sort((a, b) => byName(a.name, b.name));
      const fit = rooms.filter((r) => roomCap(r) >= size);
      const cur = k.homeRoomId ? D.roomOf(state, k.homeRoomId) : null;
      const curFits = !!cur && fit.some((r) => r.id === cur.id);
      SW.mount(roomSel,
        h('option', { value: '' }, 'kein Stammzimmer'),
        cur && !curFits ? h('option', { value: cur.id, selected: true }, `${cur.name} (${SW.fmtNum(cur.capacity || 0)})${roomCap(cur) < size ? ' – zu klein' : cur.active === false ? ' – inaktiv' : !HOME_TYPES.includes(cur.type) ? ' – kein Schulzimmer' : ''}`) : null,
        fit.map((r) => h('option', { value: r.id, selected: r.id === k.homeRoomId }, `${r.name} (${SW.fmtNum(r.capacity || 0)})`)));
      if (!cur) k.homeRoomId = null;
      roomSel.value = k.homeRoomId || '';
    };
    fillYears(); daysHintUpdate(); fillRooms();

    const section = (title, ...content) => h('div.kl-form', h('h4', title), ...content);
    const body = h('div.col.g16',
      section('Grunddaten', h('div.form-grid',
        U.field('Name *', nameIn, { hint: 'Eindeutige Bezeichnung der Klasse' }),
        U.field('Lernende', sizeIn, { hint: 'Bestimmt die nötige Raumgrösse' }),
        U.field('Lehrgang *', curSel, { hint: state.curricula.length ? 'Bestimmt Fächer und Lektionen pro Lehrjahr' : h('span', 'Zuerst einen Lehrgang erfassen: ', h('a', { href: '#/lehrgaenge', onclick: () => m.close() }, 'Zu den Lehrgängen')) }),
        U.field('Lehrjahr', yearSel))),
      section('Schultage & Stammzimmer', h('div.form-grid',
        h('div.field.span2', h('label', 'Schultage'), chips, daysHint),
        U.field('Stammzimmer', roomSel, { hint: 'Schulzimmer, Raum mit Display oder Grossraum mit genügend Plätzen' }))),
      section('Team', h('div.form-grid',
        U.field('Klassenlehrperson', klpSel), U.field('Stellvertretung', depSel), U.field('ABU-Lehrperson', abuSel))),
      section('Notizen', U.field('', notesIn)),
    );
    body.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('input')) { e.preventDefault(); save(); } });

    const save = () => {
      const name = String(k.name || '').trim();
      if (!name) { nameIn.setAttribute('aria-invalid', 'true'); nameIn.focus(); return U.toast('Bitte einen Namen eingeben', { type: 'err' }); }
      if (nameExists(state, name, k.id)) { nameIn.setAttribute('aria-invalid', 'true'); nameIn.focus(); return U.toast(`Eine Klasse «${name}» gibt es bereits`, { type: 'err' }); }
      if (!k.curriculumId) { curSel.setAttribute('aria-invalid', 'true'); curSel.focus(); return U.toast('Bitte einen Lehrgang wählen', { type: 'err' }); }
      const obj = { ...k, name, size: Math.max(0, Math.round(Number(k.size) || 0)), year: Number(k.year) || 1, schoolDays: SW.uniq(k.schoolDays.map(Number)).sort((a, b) => a - b), notes: String(k.notes || '') };
      if (isNew) SW.store.add('classes', obj); else SW.store.put('classes', obj);
      m.close();
      if (!obj.schoolDays.length) U.toast('Gespeichert – ohne Schultage kann die Klasse nicht verplant werden', { type: 'warn', ms: 4500 });
      else U.toast(isNew ? `Klasse ${obj.name} angelegt` : 'Änderungen gespeichert', { type: 'ok', action: isNew ? { label: 'Öffnen', fn: () => goDetail(obj.id) } : null });
    };
    const m = U.modal({ title: isNew ? 'Klasse anlegen' : `${cls.name} bearbeiten`, sub: isNew ? 'Lehrgang und Lehrjahr bestimmen die Lektionentafel.' : 'Änderungen wirken sich auf die nächste Generierung aus.', size: 'wide', body,
      footer: [h('button.btn', { onclick: () => m.close() }, 'Abbrechen'), h('button.btn.primary', { onclick: save }, SW.icon('check'), isNew ? 'Anlegen' : 'Speichern')] });
    return m;
  }
  const openCreate = () => classForm({ cls: null, isNew: true });
  const openEdit = (k) => classForm({ cls: k, isNew: false });

  // ---------- Formular: weitere Lehrperson im Team ----------
  function extraTeacherModal(k) {
    const state = st();
    const inTeam = new Set([k.mainTeacherId, k.deputyTeacherId, k.abuTeacherId, ...(k.extraTeachers || []).map((e) => e.teacherId)].filter(Boolean));
    const opts = teacherOpts(state).filter((o) => !inTeam.has(o.value));
    let teacherId = opts[0]?.value || null; let role = 'fachlehrperson';
    const body = h('div.form-grid',
      U.field('Lehrperson', U.select(opts, teacherId, (v) => (teacherId = v), { placeholder: opts.length ? 'Lehrperson wählen' : 'Keine weitere Lehrperson verfügbar' }), { hint: opts.length ? null : h('span', h('a', { href: '#/lehrpersonen', onclick: () => m.close() }, 'Lehrpersonen erfassen')) }),
      U.field('Rolle', U.select(M.TEACHER_ROLES.map((r) => ({ value: r.id, label: `${r.name} (${r.short})` })), role, (v) => (role = v || 'fachlehrperson'))));
    const m = U.modal({ title: 'Lehrperson zum Team hinzufügen', sub: k.name, body, footer: [
      h('button.btn', { onclick: () => m.close() }, 'Abbrechen'),
      h('button.btn.primary', { disabled: !opts.length, onclick: () => { if (!teacherId) return U.toast('Bitte eine Lehrperson wählen', { type: 'err' }); SW.store.patch('classes', k.id, { extraTeachers: [...(k.extraTeachers || []), { teacherId, role }] }); m.close(); U.toast('Lehrperson zum Team hinzugefügt', { type: 'ok' }); } }, SW.icon('plus'), 'Hinzufügen')] });
  }
  async function removeExtraTeacher(k, idx) {
    const e = (k.extraTeachers || [])[idx]; const t = D.teacherOf(st(), e?.teacherId);
    if (!(await U.confirm({ title: 'Aus dem Team entfernen?', text: `${D.teacherLabel(t)} wird als ${roleOf(e?.role).name} aus dem Team entfernt. Fach-Zuweisungen bleiben bestehen.`, ok: 'Entfernen', danger: true }))) return;
    SW.store.patch('classes', k.id, { extraTeachers: (k.extraTeachers || []).filter((_, i) => i !== idx) });
    U.toast('Aus dem Team entfernt');
  }

  // ---------- Formular: Zusatzlektion ----------
  function extraLessonModal(k) {
    const state = st();
    const subjects = [...state.subjects].sort((a, b) => byName(a.name, b.name));
    let subjectId = subjects[0]?.id || null; let lessons = 1; let block = Number(subjects[0]?.block || 1); let teacherId = null;
    const tSel = U.select([], null, (v) => (teacherId = v), { placeholder: 'automatisch (Generator wählt)' });
    const blockSeg = U.seg([{ value: 1, label: 'Einzellektionen' }, { value: 2, label: 'Doppellektionen' }], block, (v) => (block = Number(v)));
    const refill = () => {
      const q = subjectId ? D.qualifiedTeachers(state, subjectId).sort(byCode) : [];
      SW.mount(tSel, h('option', { value: '' }, q.length ? 'automatisch (Generator wählt)' : 'keine qualifizierte Lehrperson – automatisch'), q.map((t) => h('option', { value: t.id }, teacherOptLabel(state, t, k, subjectId))));
      teacherId = null; tSel.value = '';
    };
    refill();
    const body = subjects.length ? h('div.form-grid',
      U.field('Fach', U.select(subjects.map((s) => ({ value: s.id, label: s.name })), subjectId, (v) => { subjectId = v; block = Number(D.subjectOf(state, v)?.block || 1); blockSeg.set(block); refill(); })),
      U.field('Lektionen pro Woche', U.input({ type: 'number', min: 1, max: 20, step: 1, value: 1, oninput: (v) => (lessons = v) })),
      U.field('Form', blockSeg), U.field('Lehrperson', tSel, { hint: 'Nur Lehrpersonen, die das Fach unterrichten' }))
      : U.empty({ icon: '📘', title: 'Keine Fächer erfasst', text: 'Zusatzlektionen brauchen ein Fach.', action: h('a.btn', { href: '#/faecher', onclick: () => m.close() }, 'Zu den Fächern') });
    const m = U.modal({ title: 'Zusatzlektion hinzufügen', sub: `${k.name} · ergänzt die Lektionentafel des Lehrgangs`, body, footer: [
      h('button.btn', { onclick: () => m.close() }, 'Abbrechen'),
      h('button.btn.primary', { disabled: !subjects.length, onclick: () => {
        const n = Math.round(Number(lessons) || 0);
        if (!subjectId) return U.toast('Bitte ein Fach wählen', { type: 'err' });
        if (!(n >= 1)) return U.toast('Mindestens eine Lektion pro Woche', { type: 'err' });
        SW.store.patch('classes', k.id, { extraLessons: [...(k.extraLessons || []), { subjectId, lessons: n, block, teacherId: teacherId || null }] });
        m.close(); U.toast('Zusatzlektion hinzugefügt', { type: 'ok' });
      } }, SW.icon('plus'), 'Hinzufügen')] });
  }
  async function removeExtraLesson(k, idx) {
    const e = (k.extraLessons || [])[idx]; const s = D.subjectOf(st(), e?.subjectId);
    if (!(await U.confirm({ title: 'Zusatzlektion entfernen?', text: `${s?.name || 'Fach'} · ${plural(e?.lessons || 0, 'Lektion', 'Lektionen')} pro Woche.`, ok: 'Entfernen', danger: true }))) return;
    SW.store.patch('classes', k.id, { extraLessons: (k.extraLessons || []).filter((_, i) => i !== idx) });
    U.toast('Zusatzlektion entfernt');
  }

  // ---------- Leerer Zustand ----------
  function emptyState(state, edit) {
    const missing = [];
    if (!state.curricula.length) missing.push(['Lehrgänge', '#/lehrgaenge']);
    if (!state.teachers.length) missing.push(['Lehrpersonen', '#/lehrpersonen']);
    if (!state.rooms.length) missing.push(['Räume', '#/raeume']);
    const nothing = !state.curricula.length && !state.teachers.length && !state.rooms.length && !state.subjects.length;
    return h('div.card.kl-empty', U.empty({ icon: '👥', title: 'Noch keine Klassen erfasst',
      text: 'Eine Klasse verbindet Lehrgang und Lehrjahr mit Lernenden, Schultagen, Stammzimmer und Lehrpersonen. Aus der Lektionentafel des Lehrgangs weiss der Generator, welche Fächer wie oft pro Woche zu planen sind.',
      action: h('div.col.ai-c.g8',
        edit ? h('div.flex.g8.wrap.jc-c', h('button.btn.primary', { onclick: openCreate }, SW.icon('plus'), 'Klasse anlegen'), nothing ? h('button.btn', { onclick: () => { SW.store.loadDemo(); U.toast('Demo-Daten geladen', { type: 'ok' }); } }, '🚀', 'Demo-Daten laden') : null) : h('p.small.faint', 'Klassen werden von der Planung erfasst.'),
        missing.length ? h('div.kl-missing', 'Empfohlen vorab erfassen: ', missing.map(([n, href], i) => [i ? ' · ' : null, h('a', { href }, n)])) : null) }));
  }

  // ---------- Liste ----------
  function renderList(el, state) {
    const edit = canEdit();
    const classes = sortClasses(state.classes);
    const moreMenu = (e) => U.menu(e.currentTarget, [
      { label: 'Schultage automatisch verteilen', icon: 'calendar', fn: distributeDays, disabled: !classes.length },
      { label: 'Lehrpersonen automatisch zuweisen', icon: 'sparkles', fn: autoAssignAll, disabled: !classes.length },
      'sep',
      { label: 'Zum Generator', icon: 'wand', fn: () => SW.router.go('#/generator') },
    ]);
    const actions = edit ? [h('button.btn', { onclick: moreMenu, 'aria-label': 'Weitere Aktionen' }, SW.icon('more'), 'Weitere'), h('button.btn.primary', { onclick: openCreate }, SW.icon('plus'), 'Klasse anlegen')] : [];
    el.append(U.pageHeader({ title: 'Klassen', lead: 'Lehrgang, Lehrjahr, Schultage und Lehrpersonen jeder Klasse. Die Lektionentafel des Lehrgangs bestimmt, was der Generator pro Woche verplant.', actions }));
    if (!classes.length) { el.append(emptyState(state, edit)); return; }

    // Kennzahlen
    const status = new Map(classes.map((k) => [k.id, statusOf(state, k)]));
    const lessonsOf = new Map(classes.map((k) => [k.id, D.classLessonCount(state, k)]));
    const students = SW.sum(classes, (k) => Number(k.size) || 0);
    const lessons = SW.sum(classes, (k) => lessonsOf.get(k.id));
    const noDays = classes.filter((k) => !schoolDaysOf(state, k).length).length;
    const ready = classes.filter((k) => status.get(k.id).level === 'ok').length;
    const curCount = SW.uniq(classes.map((k) => k.curriculumId).filter(Boolean)).length;
    el.append(h('div.grid.c4',
      U.kpi({ label: 'Klassen', icon: '👥', value: SW.fmtNum(classes.length), sub: `${ready} bereit · ${plural(curCount, 'Lehrgang', 'Lehrgänge')}` }),
      U.kpi({ label: 'Lernende gesamt', icon: '🎓', value: SW.fmtNum(students), sub: `Ø ${SW.fmtNum(students / classes.length, 1)} pro Klasse` }),
      U.kpi({ label: 'Lektionen / Woche gesamt', icon: '📘', value: SW.fmtNum(lessons), sub: `Ø ${SW.fmtNum(lessons / classes.length, 1)} pro Klasse` }),
      U.kpi({ label: 'Klassen ohne Schultage', icon: '📅', value: SW.fmtNum(noDays), sub: noDays ? 'Schultage festlegen oder automatisch verteilen' : 'alle Klassen haben Schultage', cls: noDays ? 'kl-kpi-err' : '', onclick: noDays && edit ? distributeDays : null }),
    ));

    // Toolbar
    const body = h('div');
    const count = h('span.kl-count');
    const search = U.input({ value: L.q, placeholder: 'Suchen: Klasse, Lehrgang, Lehrperson, Zimmer', oninput: SW.debounce((v) => { L.q = v; refresh(); }, 120) });
    const curSel = U.select(state.curricula.filter((c) => classes.some((k) => k.curriculumId === c.id) || c.id === L.cur).map((c) => ({ value: c.id, label: c.short ? `${c.short} · ${c.name}` : c.name })), L.cur, (v) => { L.cur = v || ''; refresh(); }, { placeholder: 'Alle Lehrgänge' });
    const maxYears = Math.max(1, ...state.curricula.map((c) => Number(c.years) || 0), ...classes.map((k) => Number(k.year) || 0));
    const yearSel = U.select(SW.range(maxYears, 1).map((y) => ({ value: String(y), label: `${y}. Lehrjahr` })), L.year, (v) => { L.year = v || ''; refresh(); }, { placeholder: 'Alle Lehrjahre' });
    const resetBtn = h('button.btn.ghost.sm', { onclick: () => { L.q = ''; L.cur = ''; L.year = ''; search.value = ''; curSel.value = ''; yearSel.value = ''; refresh(); } }, SW.icon('x'), 'Filter zurücksetzen');
    el.append(h('div.toolbar.kl-toolbar', h('div.search', SW.icon('search'), search), curSel, yearSel, resetBtn, h('div.spacer'), count), body);

    const filtered = () => {
      const q = L.q.trim().toLowerCase();
      return classes.filter((k) => {
        if (L.cur && k.curriculumId !== L.cur) return false;
        if (L.year && String(k.year) !== L.year) return false;
        if (!q) return true;
        const c = D.curriculumOf(state, k.curriculumId); const r = D.roomOf(state, k.homeRoomId);
        const team = [k.mainTeacherId, k.deputyTeacherId, k.abuTeacherId].map((id) => D.teacherOf(state, id)?.code);
        return [k.name, c?.short, c?.name, r?.name, ...team].some((x) => String(x || '').toLowerCase().includes(q));
      });
    };
    const cols = [
      { label: 'Klasse', render: (k) => h('div.kl-name', k.name) },
      { label: 'Lehrgang', render: (k) => { const c = D.curriculumOf(state, k.curriculumId); return c ? h('div', h('div', c.short || c.name), h('div.kl-sub', `${k.year}. Lehrjahr`)) : h('span.chip.sm.err', 'kein Lehrgang'); } },
      { label: 'Lernende', cls: 'r', render: (k) => h('span.num', SW.fmtNum(k.size || 0)) },
      { label: 'KLP', render: (k) => pillLink(D.teacherOf(state, k.mainTeacherId)) },
      { label: 'StV', cls: 'hm', render: (k) => pillLink(D.teacherOf(state, k.deputyTeacherId)) },
      { label: 'ABU', cls: 'hm', render: (k) => pillLink(D.teacherOf(state, k.abuTeacherId)) },
      { label: 'Schultage', render: (k) => { const d = schoolDaysOf(state, k); return d.length ? h('div.chips.kl-days', d.map((x) => h('span.chip.sm.tint', M.dayName(x, true)))) : h('span.chip.sm.err', (k.schoolDays || []).length ? 'ausserhalb' : 'keine'); } },
      { label: 'Lekt./Woche', cls: 'r', render: (k) => h('span.num', SW.fmtNum(lessonsOf.get(k.id))) },
      { label: 'Stammzimmer', cls: 'hm', render: (k) => { const r = D.roomOf(state, k.homeRoomId); return r ? h('span', r.name, roomCap(r) < (Number(k.size) || 0) ? h('span.chip.sm.warn', { style: { marginLeft: '6px' }, title: 'Zimmer hat weniger Plätze als Lernende' }, 'zu klein') : null) : h('span.faint', '–'); } },
      { label: 'Status', render: (k) => statusChip(status.get(k.id)) },
      edit ? { label: '', cls: 'act', render: (k) => h('div.flex.g4.jc-e', h('button.btn.icon.ghost.sm', { title: 'Bearbeiten', 'aria-label': 'Bearbeiten', onclick: () => openEdit(k) }, SW.icon('edit')), h('button.btn.icon.ghost.sm', { title: 'Löschen', 'aria-label': 'Löschen', onclick: () => deleteClass(k) }, SW.icon('trash'))) } : null,
    ].filter(Boolean);
    function refresh() {
      const list = filtered();
      const active = !!(L.q.trim() || L.cur || L.year);
      resetBtn.classList.toggle('hide', !active);
      SW.mount(count, active ? `${SW.fmtNum(list.length)} von ${SW.fmtNum(classes.length)} Klassen` : plural(classes.length, 'Klasse', 'Klassen'));
      if (!list.length) { SW.mount(body, h('div.card', U.empty({ icon: '🔍', title: 'Keine Klassen gefunden', text: 'Keine Klasse passt zu Suche und Filtern.', action: h('button.btn', { onclick: () => resetBtn.click() }, 'Filter zurücksetzen') }))); return; }
      SW.mount(body, h('div.card', U.table({ cols, rows: list, cls: 'kl-tbl', onRow: (k) => goDetail(k.id), rowClass: (k) => (status.get(k.id).level === 'err' ? 'kl-err' : '') })));
    }
    refresh();
  }

  // ---------- Detail: Karten ----------
  function requirementsCard(state, k, edit) {
    const reqs = D.classRequirements(state, k);
    const cur = D.curriculumOf(state, k.curriculumId);
    const total = SW.sum(reqs, (r) => r.lessons); const cap = capacityOf(state, k);
    const extraBySubject = SW.groupBy(k.extraLessons || [], (e) => e.subjectId);
    const open = reqs.filter((r) => !r.teacherId).length;
    const body = h('div.col.g16');

    if (!cur) body.append(U.empty({ icon: '📚', title: 'Kein Lehrgang zugeordnet', text: 'Der Lehrgang bestimmt die Fächer und Lektionen pro Lehrjahr dieser Klasse.', action: edit ? h('button.btn.primary', { onclick: () => openEdit(k) }, SW.icon('edit'), 'Lehrgang zuordnen') : null }));
    else if (!reqs.length) body.append(U.empty({ icon: '📭', title: 'Keine Lektionen', text: `«${cur.name}» hat im ${k.year}. Lehrjahr keine Lektionen hinterlegt.`, action: h('a.btn', { href: '#/lehrgaenge/' + cur.id }, SW.icon('layers'), 'Lehrgang öffnen') }));

    if (reqs.length) {
      const teacherCell = (r) => {
        const q = D.qualifiedTeachers(state, r.subjectId).sort(byCode);
        const t = r.teacherId ? D.teacherOf(state, r.teacherId) : null;
        const av = t ? availOnDays(state, t, k) : null;
        const chip = !t ? (q.length ? h('span.chip.sm.info', { title: 'Der Generator wählt die qualifizierte Lehrperson mit der geringsten Auslastung' }, 'automatisch') : h('a.chip.sm.err', { href: '#/lehrpersonen', title: 'Keine Lehrperson unterrichtet dieses Fach – bei einer Lehrperson hinterlegen' }, 'keine qualifizierte Lehrperson'))
          : !q.some((x) => x.id === t.id) ? h('span.chip.sm.err', { title: 'Das Fach ist bei dieser Lehrperson nicht hinterlegt' }, 'nicht qualifiziert')
          : av < r.lessons ? h('span.chip.sm.warn', { title: `An den Schultagen (${dayNames(classDays(state, k))}) nur ${av} Lektionen verfügbar, benötigt ${r.lessons}` }, `nur ${av} Lekt. verfügbar`) : null;
        if (!edit) return h('div.flex.ai-c.g8.wrap', t ? pillLink(t) : h('span.faint', 'automatisch'), chip);
        const opts = q.map((x) => ({ value: x.id, label: teacherOptLabel(state, x, k, r.subjectId) }));
        if (t && !q.some((x) => x.id === t.id)) opts.unshift({ value: t.id, label: `${D.teacherLabel(t)} – nicht qualifiziert` });
        const sel = U.select(opts, r.teacherId, (v) => setSubjectTeacher(k, r.subjectId, v), { placeholder: q.length ? 'automatisch (Generator wählt)' : 'automatisch – keine qualifizierte Lehrperson', cls: 'sm' });
        sel.setAttribute('aria-label', `Lehrperson für ${r.subject.name}`);
        return h('div.kl-tsel', sel, chip);
      };
      body.append(U.table({ cls: 'compact.kl-req', rows: reqs, cols: [
        { label: 'Fach', render: (r) => h('div.flex.ai-c.g8.wrap', U.subjectTag(r.subject), r.source === 'zusatz' ? h('span.chip.sm.outline', { title: 'Nur als Zusatzlektion, nicht im Lehrgang' }, 'Zusatz') : null) },
        { label: 'Lektionen', cls: 'r', render: (r) => { const ex = SW.sum(extraBySubject[r.subjectId] || [], (e) => Number(e.lessons) || 0); return h('div', h('span.num.strong', String(r.lessons)), r.source === 'lehrgang' && ex ? h('div.tiny.faint', `inkl. ${ex} Zusatz`) : null); } },
        { label: 'Form', render: (r) => h('span.chip.sm', r.block === 2 ? 'Doppellektion' : 'Einzellektion') },
        { label: 'Lehrperson', render: teacherCell },
      ] }));
      const ratio = cap ? total / cap : 0;
      body.append(h('div.kl-sum',
        h('div.flex.jc-b.ai-c.g10.wrap', h('span.strong', `${plural(total, 'Lektion', 'Lektionen')} pro Woche`), h('span.small.muted', cap ? `Kapazität: ${plural(schoolDaysOf(state, k).length, 'Schultag', 'Schultage')} × ${D.slotCount(state)} Lektionen = ${cap} Plätze` : 'Keine Schultage – keine Kapazität')),
        U.meter(ratio, { label: cap ? `${total} / ${cap}` : '–', cls: cap && total > cap ? 'err' : null }),
        cap && total > cap ? h('div.small.err-c', 'Mehr Lektionen als Plätze – einen weiteren Schultag ergänzen.') : cap && total === cap ? h('div.small.warn-c', 'Schultage ganz gefüllt – kein Spielraum für Freistunden.') : null));
    }

    // Zusatzlektionen
    const ex = k.extraLessons || [];
    const exBody = ex.length ? U.table({ cls: 'compact', rows: ex.map((e, i) => ({ ...e, _i: i })), cols: [
      { label: 'Fach', render: (e) => { const s = D.subjectOf(state, e.subjectId); return s ? U.subjectTag(s) : h('span.faint', 'Fach gelöscht'); } },
      { label: 'Lektionen', cls: 'r', render: (e) => h('span.num', String(e.lessons)) },
      { label: 'Form', render: (e) => h('span.chip.sm', Number(e.block) === 2 ? 'Doppellektion' : 'Einzellektion') },
      { label: 'Lehrperson', render: (e) => { const t = D.teacherOf(state, e.teacherId); return t ? pillLink(t) : h('span.chip.sm.info', 'automatisch'); } },
      edit ? { label: '', cls: 'act', render: (e) => h('button.btn.icon.ghost.sm', { title: 'Entfernen', 'aria-label': 'Zusatzlektion entfernen', onclick: () => removeExtraLesson(k, e._i) }, SW.icon('trash')) } : null,
    ].filter(Boolean) }) : h('p.small.muted', 'Keine Zusatzlektionen. Sie ergänzen die Lektionentafel des Lehrgangs, z.B. für Stützkurse, Freifächer oder Projektarbeit.');
    body.append(h('div', h('div.flex.jc-b.ai-c.g8.wrap.mb8', h('h4', 'Zusatzlektionen'), edit ? h('button.btn.sm', { onclick: () => extraLessonModal(k) }, SW.icon('plus'), 'Zusatzlektion') : null), exBody));

    return U.card({ title: 'Lektionentafel', icon: '📘', sub: cur ? `${cur.short || cur.name} · ${k.year}. Lehrjahr${open ? ` · ${open} ${open === 1 ? 'Fach' : 'Fächer'} ohne feste Lehrperson` : ''}` : 'Fächer und Lektionen pro Woche', body,
      actions: edit && reqs.length ? [h('button.btn.sm', { disabled: !open, title: open ? 'Fehlende Lehrpersonen für diese Klasse zuweisen' : 'Alle Fächer haben eine Lehrperson', onclick: () => autoAssignClass(k) }, SW.icon('sparkles'), 'Automatisch zuweisen')] : null });
  }

  function teamCard(state, k, edit) {
    const reqs = D.classRequirements(state, k);
    const subjectsOf = (tid) => reqs.filter((r) => r.teacherId === tid).map((r) => r.subject.short || r.subject.name);
    const row = (roleName, short, t, action) => h('li',
      h('div.kl-role', h('div.strong', roleName), h('div.sub', short)),
      h('div.grow.flex.ai-c.g8.wrap', t ? pillLink(t) : h('span.faint', 'nicht festgelegt'), t && subjectsOf(t.id).length ? h('span.small.muted', subjectsOf(t.id).join(', ')) : null),
      action || null);
    const editBtn = edit ? () => h('button.btn.icon.ghost.sm', { title: 'Bearbeiten', 'aria-label': 'Team bearbeiten', onclick: () => openEdit(k) }, SW.icon('edit')) : () => null;
    const ul = h('ul.list.kl-team',
      row('Klassenlehrperson', 'KLP', D.teacherOf(state, k.mainTeacherId), editBtn()),
      row('Stellvertretung', 'StV', D.teacherOf(state, k.deputyTeacherId), editBtn()),
      row('ABU-Lehrperson', 'ABU', D.teacherOf(state, k.abuTeacherId), editBtn()));
    (k.extraTeachers || []).forEach((e, i) => { const t = D.teacherOf(state, e.teacherId); if (!t) return; const r = roleOf(e.role); ul.append(row(r.name, r.short, t, edit ? h('button.btn.icon.ghost.sm', { title: 'Aus dem Team entfernen', 'aria-label': 'Aus dem Team entfernen', onclick: () => removeExtraTeacher(k, i) }, SW.icon('x')) : null)); });
    const teamIds = new Set([k.mainTeacherId, k.deputyTeacherId, k.abuTeacherId, ...(k.extraTeachers || []).map((e) => e.teacherId)].filter(Boolean));
    const others = SW.uniq(reqs.map((r) => r.teacherId).filter(Boolean)).filter((id) => !teamIds.has(id)).map((id) => D.teacherOf(state, id)).filter(Boolean).sort(byCode);
    const body = h('div.col.g12', ul,
      others.length ? h('div', h('div.lbl.mb8', 'Weitere Fachlehrpersonen'), h('div.chips', others.map((t) => h('a', { href: '#/lehrpersonen/' + t.id, title: subjectsOf(t.id).join(', ') }, U.teacherPill(t, subjectsOf(t.id).join(', ')))))) : null);
    return U.card({ title: 'Team', icon: '👥', sub: 'Klassenlehrperson, Stellvertretung, ABU und weitere Lehrpersonen', body, actions: edit ? [h('button.btn.sm', { onclick: () => extraTeacherModal(k) }, SW.icon('plus'), 'Hinzufügen')] : null });
  }

  function issuesCard(state, k, edit) {
    const link = '#/klassen/' + k.id;
    const issues = D.feasibility(state).issues.filter((i) => i.link === link || (['teacher-class-days', 'teacher-double'].includes(i.code) && String(i.title || '').includes(` · ${k.name} · `)));
    const fixable = ['class-no-cur', 'class-cur-missing', 'class-no-days', 'class-over', 'class-day-cap', 'class-no-room', 'class-no-lessons', 'class-full', 'class-tight'];
    const body = issues.length
      ? h('ul.list.kl-issues', issues.map((i) => h('li', levelChip(i.level), h('div.grow', h('div.strong', i.title), h('div.small.muted', i.text)),
        i.link && i.link !== link ? h('a.btn.sm', { href: i.link }, 'Beheben', SW.icon('arrowRight')) : edit && fixable.includes(i.code) ? h('button.btn.sm', { onclick: () => openEdit(k) }, SW.icon('edit'), 'Bearbeiten') : null)))
      : U.banner(h('span', h('b', 'Keine Hinweise. '), 'Die Stammdaten dieser Klasse sind vollständig – der Generator kann sie verplanen.'), 'ok');
    return U.card({ title: 'Hinweise', icon: '🔍', sub: issues.length ? `${plural(issues.length, 'Punkt', 'Punkte')} aus der Machbarkeitsanalyse` : 'Machbarkeitsanalyse des Generators', body, actions: [h('a.btn.sm', { href: '#/generator' }, SW.icon('wand'), 'Generator')] });
  }

  function timetableCard(state, k, total) {
    const tt = state.timetable;
    const lessons = D.lessonsFor(tt, { classId: k.id });
    const placed = SW.sum(lessons, (l) => l.len || 1);
    const sd = schoolDaysOf(state, k); const offDays = sd.length ? D.days(state).filter((d) => !sd.includes(d)) : [];
    const grid = U.timetableGrid({ lessons, mode: 'class', dense: true, state, offDays, onLessonClick: () => SW.router.go('#/stundenplan?view=klasse&id=' + k.id) });
    const subs = SW.uniq(lessons.map((l) => l.subjectId)).map((s) => D.subjectOf(state, s)).filter(Boolean);
    const body = [
      !lessons.length ? U.banner(h('span', 'Im aktuellen Stundenplan hat diese Klasse keine Lektionen. ', h('a', { href: '#/generator' }, 'Plan neu generieren')), 'warn') : placed < total ? U.banner(h('span', h('b', `${total - placed} Lektionen fehlen im Plan. `), 'Details im Generator unter «Nicht platzierte Lektionen».'), 'warn', { action: h('a.btn.sm', { href: '#/generator' }, 'Generator') }) : null,
      h('div.scroll-x', grid),
      subs.length ? h('div.legend.kl-legend', subs.map((s) => h('span', h('i', { style: { background: s.color } }), s.name))) : null,
    ];
    return U.card({ title: 'Wochenplan', icon: '🗓️', sub: `${placed} von ${total} Lektionen im ${tt.status === 'published' ? 'veröffentlichten Plan' : 'Planentwurf'} · Stand ${SW.fmtTs(tt.createdAt)}`, body, actions: [h('a.btn.sm', { href: '#/stundenplan?view=klasse&id=' + k.id }, SW.icon('grid'), 'Im Stundenplan öffnen')] });
  }

  // ---------- Detail ----------
  function renderDetail(el, state, id) {
    const k = D.classOf(state, id);
    if (!k) {
      el.append(U.pageHeader({ title: 'Klassen' }), h('div.card', U.empty({ icon: '👥', title: 'Klasse nicht gefunden', text: 'Diese Klasse existiert nicht oder wurde gelöscht.', action: h('a.btn.primary', { href: '#/klassen' }, SW.icon('chevronLeft'), 'Zur Übersicht') })));
      return;
    }
    const edit = canEdit();
    const cur = D.curriculumOf(state, k.curriculumId);
    const room = D.roomOf(state, k.homeRoomId);
    const tt = state.timetable;
    const status = statusOf(state, k);
    const reqs = D.classRequirements(state, k);
    const total = SW.sum(reqs, (r) => r.lessons); const cap = capacityOf(state, k);
    const assigned = reqs.filter((r) => r.teacherId).length; const open = reqs.length - assigned;
    const placed = tt ? SW.sum(D.lessonsFor(tt, { classId: k.id }), (l) => l.len || 1) : 0;
    const menu = (e) => U.menu(e.currentTarget, [
      { label: 'Automatisch zuweisen', icon: 'sparkles', fn: () => autoAssignClass(k), disabled: !open },
      { label: 'Im Stundenplan öffnen', icon: 'grid', fn: () => SW.router.go('#/stundenplan?view=klasse&id=' + k.id) },
      'sep',
      { label: 'Klasse löschen', icon: 'trash', danger: true, fn: () => deleteClass(k, () => SW.router.go('#/klassen')) },
    ]);

    // Kopf
    el.append(h('div.kl-head',
      h('span.kl-ic', '👥'),
      h('div.grow',
        h('div.tiny.faint', h('a', { href: '#/klassen' }, 'Klassen'), ' / ', cur ? (cur.short || cur.name) : 'ohne Lehrgang'),
        h('h1', k.name, statusChip(status, false)),
        h('div.chips',
          cur ? h('a.chip', { href: '#/lehrgaenge/' + cur.id, title: cur.name }, SW.icon('layers'), cur.short || cur.name) : h('span.chip.err', 'kein Lehrgang'),
          h('span.chip', `${k.year}. Lehrjahr`),
          h('span.chip', SW.icon('users'), `${SW.fmtNum(k.size || 0)} Lernende`),
          schoolDaysOf(state, k).length ? h('span.chip', SW.icon('calendar'), dayNames(schoolDaysOf(state, k))) : h('span.chip.err', SW.icon('calendar'), 'keine Schultage'),
          room ? h('a.chip', { href: '#/raeume/' + room.id, title: `${M.roomType(room.type).name} · ${SW.fmtNum(room.capacity || 0)} Plätze` }, SW.icon('door'), room.name) : h('span.chip.outline', 'kein Stammzimmer'))),
      h('div.actions',
        h('a.btn', { href: '#/klassen' }, SW.icon('chevronLeft'), 'Zurück'),
        h('a.btn', { href: '#/stundenplan?view=klasse&id=' + k.id }, SW.icon('grid'), 'Stundenplan'),
        edit ? h('button.btn.primary', { onclick: () => openEdit(k) }, SW.icon('edit'), 'Bearbeiten') : null,
        edit ? h('button.btn.icon', { 'aria-label': 'Weitere Aktionen', title: 'Weitere Aktionen', onclick: menu }, SW.icon('more')) : null),
    ));
    if (status.level === 'err') el.append(U.banner(h('span', h('b', 'Unvollständig: '), status.text, '. Ohne Lehrgang und Schultage kann der Generator diese Klasse nicht verplanen.'), 'err', { action: edit ? h('button.btn.sm', { onclick: () => openEdit(k) }, 'Bearbeiten') : null }));
    if (k.notes) el.append(U.banner(h('span', { style: { whiteSpace: 'pre-wrap' } }, k.notes), '', { icon: '📝' }));

    // Kennzahlen
    el.append(h('div.grid.c4',
      U.kpi({ label: 'Lektionen / Woche', icon: '📘', value: SW.fmtNum(total), sub: cap ? `${SW.fmtNum(cap)} Plätze an ${plural(schoolDaysOf(state, k).length, 'Schultag', 'Schultagen')}` : 'keine Schultage festgelegt', cls: cap && total > cap ? 'kl-kpi-err' : '' }),
      U.kpi({ label: 'Lehrpersonen', icon: '🎓', value: h('span', String(assigned), h('small', `/ ${reqs.length}`)), sub: open ? `${open} ${open === 1 ? 'Fach' : 'Fächer'} automatisch` : reqs.length ? 'alle Fächer fest zugewiesen' : 'keine Fächer' }),
      U.kpi({ label: 'Im Stundenplan', icon: '🗓️', value: tt ? h('span', String(placed), h('small', `/ ${total}`)) : '–', sub: tt ? (tt.status === 'published' ? 'Lektionen im veröffentlichten Plan' : 'Lektionen im Planentwurf') : 'noch kein Stundenplan', onclick: !tt && edit ? () => SW.router.go('#/generator') : null }),
      U.kpi({ label: 'Status', icon: '✅', value: statusChip(status, false), sub: status.text }),
    ));

    el.append(requirementsCard(state, k, edit));
    el.append(h('div.grid.c2', teamCard(state, k, edit), issuesCard(state, k, edit)));
    if (tt) el.append(timetableCard(state, k, total));
  }

  // ---------- Registrierung ----------
  SW.views['klassen'] = {
    title: 'Klassen',
    render(el, params) {
      U.injectCSS('klassen', CSS);
      const state = st();
      if (params && params.id) renderDetail(el, state, params.id);
      else renderList(el, state);
    },
  };
})();
