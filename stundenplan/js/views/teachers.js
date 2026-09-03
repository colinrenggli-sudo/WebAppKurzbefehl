/* STUNDENWERK · views/teachers.js — Lehrpersonen.
   Routen:  #/lehrpersonen          Liste (Karten oder Tabelle) mit Suche, Filter Fach / verfügbar am, Anlegen
            #/lehrpersonen/:id      Detail: Kopf, Kennzahlen, Verfügbarkeit (bearbeitbar, mit Plan-Overlay), Wochenplan, Klassen, Hinweise
   Datenschutz: Lehrpersonen haben keinen Namen – nur Emoji (t.emoji) und optional ein Kürzel (t.code).
   Schreibt ausschliesslich über SW.store. Die Ansicht ist manualRefresh: das Verfügbarkeitsraster wird erst mit «Speichern»
   persistiert; Store-Änderungen rendern nur neu, wenn keine ungespeicherten Änderungen vorliegen.
   Eigene CSS-Klassen mit Präfix .lp- (per SW.ui.injectCSS). */
(function () {
  const SW = (globalThis.SW = globalThis.SW || {});
  SW.views = SW.views || {};
  const h = SW.h; const M = SW.model; const U = SW.ui; const D = SW.domain;

  const CSS = `
.lp-toolbar select.inp{width:auto;min-width:160px;max-width:240px}
.lp-toolbar .lp-count{font-size:13px;color:var(--txt-3);white-space:nowrap;font-variant-numeric:tabular-nums}
@media (max-width:600px){.lp-toolbar .search{max-width:none;flex-basis:100%}.lp-toolbar select.inp{flex:1;min-width:0;max-width:none}.lp-toolbar .lp-count{display:none}}
.lp-card{display:flex;flex-direction:column;gap:10px;padding:14px 16px;outline:none}
.lp-card:focus-visible{box-shadow:var(--ring)}
.lp-card.inactive{opacity:.62;border-style:dashed}
.lp-card .lp-top{display:flex;align-items:flex-start;gap:12px}
.lp-card .lp-name{font-weight:650;font-size:15.5px;line-height:1.25;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lp-card .lp-name.none{color:var(--txt-3);font-weight:500}
.lp-card .lp-top .btn{margin:-6px -8px 0 0}
.lp-meta{display:flex;gap:6px 14px;flex-wrap:wrap;font-size:13px;color:var(--txt-2);align-items:center;min-width:0}
.lp-meta span{display:inline-flex;align-items:center;gap:5px;min-width:0}
.lp-meta svg.i{width:15px;height:15px;color:var(--txt-3)}
.lp-subjs{display:flex;flex-wrap:wrap;gap:4px}
.lp-subj{display:inline-flex;align-items:center;gap:5px;height:22px;padding:0 8px 0 6px;border-radius:var(--r-full);font-size:11.5px;font-weight:620;background:color-mix(in srgb,var(--c,#888) 14%,var(--card-3));color:var(--txt-2);white-space:nowrap;line-height:1}
.lp-subj i{width:8px;height:8px;border-radius:2.5px;background:var(--c,#888);display:inline-block;flex:none}
.lp-days{display:flex;flex-direction:column;gap:3px;min-width:0}
.lp-days .daybar{height:9px}
.lp-days .daybar i{cursor:default}
.lp-days .daybar i.on{background:var(--ok);opacity:.85}
.lp-days .daybar i.on.part{opacity:.4}
.lp-days .lbls{display:flex;gap:2px}
.lp-days .lbls span{flex:1;text-align:center;font-size:10px;color:var(--txt-3);line-height:1;font-variant-numeric:tabular-nums}
.lp-card .lp-load{margin-top:auto;padding-top:8px;border-top:1px solid var(--sep);display:flex;flex-direction:column;gap:4px}
.lp-card .lp-load .meter .num{min-width:58px}
.lp-card .lp-load .lbl{display:flex;justify-content:space-between;gap:8px}
.lp-tbl .meter{min-width:140px}
.lp-tbl .meter .num{min-width:58px}
.lp-tbl .lp-days{width:96px}
.lp-tbl tr.lp-off td{opacity:.55}
.lp-tbl .lp-subjs{max-width:280px}
.lp-head{display:flex;align-items:center;gap:18px;flex-wrap:wrap}
.lp-head .grow{min-width:0}
.lp-head h1{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.lp-head h1 .none{color:var(--txt-3);font-weight:500}
.lp-head .chips{margin-top:8px}
.lp-head .actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.lp-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.lp-stat{background:var(--card-2);border-radius:var(--r-s);padding:10px 12px;min-width:0}
.lp-stat b{display:block;font-size:22px;font-weight:720;letter-spacing:-.02em;font-variant-numeric:tabular-nums;line-height:1.15}
.lp-stat b small{font-size:13px;font-weight:600;color:var(--txt-3);letter-spacing:0;margin-left:3px}
.lp-stat span{font-size:12px;color:var(--txt-3);display:block;margin-top:2px}
@media (max-width:600px){.lp-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
.lp-meters{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px 22px}
.lp-meters .lbl{display:flex;justify-content:space-between;gap:8px;margin-bottom:4px}
.lp-meters .meter .num{min-width:72px}
.lp-presets{display:flex;gap:6px;flex-wrap:wrap}
.lp-avail-wrap{overflow-x:auto;padding-bottom:2px}
.lp-legend i.on{background:var(--ok);opacity:.85}
.lp-legend i.busy{background:var(--tint);position:relative;overflow:hidden}
.lp-legend i.busy::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(45deg,transparent 0 3px,rgba(255,255,255,.3) 3px 6px)}
.lp-legend i.off{background:var(--card-3);border:1px solid var(--sep-2)}
.lp-dirty{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:var(--warn-txt);font-weight:600}
.lp-dirty .dot{background:var(--warn)}
.lp-form{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:22px;align-items:start}
.lp-form .seg{flex-wrap:wrap}
.lp-g14{display:flex;flex-direction:column;gap:14px}
@media (max-width:720px){.lp-form{grid-template-columns:1fr}}
.lp-empty{align-items:stretch}
.lp-empty .lp-empty-top{display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px}
.lp-empty .lp-empty-top p{max-width:58ch;color:var(--txt-2)}
.lp-ex{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:6px}
.lp-ex .teacher-pill{font-size:14px;padding:4px 12px 4px 4px}
.lp-ex .teacher-pill .av{width:28px;height:28px;font-size:16px;border-radius:9px}
.lp-principles{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;text-align:left;width:100%;margin-top:18px}
.lp-principle{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:var(--r-s);background:var(--card-2);font-size:13px;min-width:0}
.lp-principle .ic{font-size:20px;flex:none;line-height:1.2}
.lp-principle b{display:block;font-size:13.5px;line-height:1.3}
.lp-principle .d{color:var(--txt-3);font-size:12px;line-height:1.35;margin-top:2px}
.lp-cls .sub{display:flex;gap:6px 10px;flex-wrap:wrap;align-items:center;margin-top:3px}
.lp-cls .lp-n{font-variant-numeric:tabular-nums;font-size:13px;color:var(--txt-2);white-space:nowrap}
.lp-issues li .lvl{flex:none}
.lp-pro-body{display:flex;flex-direction:column;gap:12px}
.lp-pro-stats{display:flex;gap:16px;flex-wrap:wrap}
`;

  // UI-Zustand der Liste – überlebt das Neu-Rendern nach Store-Änderungen
  const L = { q: '', subject: '', day: '', mode: SW.lsGet('stundenwerk.teachers.mode', 'cards') === 'table' ? 'table' : 'cards' };
  // Ungespeicherter Entwurf der Verfügbarkeit auf der Detailseite: { id, availability, preferredDays }
  let draft = null;
  let unsub = null;

  // ---------- Helfer ----------
  const st = () => SW.store.state;
  const canEdit = () => st().settings.role !== 'teacher';
  const byText = (a, b) => String(a).localeCompare(String(b), 'de', { numeric: true, sensitivity: 'base' });
  const sortTeachers = (list) => [...list].sort((a, b) => (a.active === false) - (b.active === false) || (!a.code) - (!b.code) || byText(a.code || a.emoji, b.code || b.emoji));
  const plural = (n, one, many) => `${SW.fmtNum(n)} ${n === 1 ? one : many}`;
  const label = (t) => D.teacherLabel(t);
  const codeOrFallback = (t) => (t.code && String(t.code).trim()) || '';
  const subjectsOf = (state, t) => (t.subjectIds || []).map((id) => D.subjectOf(state, id)).filter(Boolean);
  const maxOf = (state, t) => D.teacherMaxLessons(state, t);
  const availOf = (state, t) => D.teacherAvailableSlots(state, t);
  const loadOf = (state, id) => D.teacherLoad(state, id);
  const planOf = (state, id) => (state.timetable ? SW.sum(D.lessonsFor(state.timetable, { teacherId: id }), (l) => l.len || 1) : null);
  const employmentOf = (t) => Number(t.employment || 100);
  const goDetail = (id) => SW.router.go('#/lehrpersonen/' + id);
  const stop = (fn) => (e) => { e.stopPropagation(); e.preventDefault(); fn(e); };
  const ratioCls = (r) => (r > 1 ? 'err' : r > 0.85 ? 'warn' : 'ok');

  // Emojis: vergebene Symbole (ausser der eigenen Person), nächstes freies Symbol
  const usedEmojis = (state, exceptId) => new Set(state.teachers.filter((t) => t.id !== exceptId).map((t) => t.emoji).filter(Boolean));
  const nextFreeEmoji = (state, after) => {
    const used = usedEmojis(state, null); const all = M.EMOJIS; const idx = all.indexOf(after);
    for (let i = 1; i <= all.length; i++) { const e = all[(idx + i) % all.length]; if (!used.has(e)) return e; }
    return after || '❔';
  };
  const codeExists = (state, code, exceptId) => { const c = String(code || '').trim().toLowerCase(); return !!c && state.teachers.some((t) => t.id !== exceptId && String(t.code || '').trim().toLowerCase() === c); };
  const uniqueCode = (state, base) => { if (!base) return ''; let n = base, i = 2; while (codeExists(state, n)) n = `${base} ${i++}`; return n; };

  // Verfügbarkeit: normalisieren (nur Schultage, Länge = Anzahl Lektionen), vergleichen, Standard «ganze Woche»
  const normAvail = (state, a) => { const n = D.slotCount(state); const out = {}; for (const d of D.days(state)) { const arr = Array.isArray(a?.[d]) ? a[d].slice(0, n).map(Boolean) : []; while (arr.length < n) arr.push(false); out[d] = arr; } return out; };
  const fullWeek = (state) => { const p = U.availabilityPresets(state); const out = {}; for (const d of D.days(state)) out[d] = [...p.ganzerTag]; return out; };
  const sameAvail = (state, a, b) => JSON.stringify(normAvail(state, a)) === JSON.stringify(normAvail(state, b));
  const sameDays = (a, b) => JSON.stringify([...(a || [])].map(Number).sort()) === JSON.stringify([...(b || [])].map(Number).sort());
  const countAvail = (state, a) => { let n = 0; for (const d of D.days(state)) for (const x of a?.[d] || []) if (x) n++; return n; };
  const dayCount = (state, t, d) => (t.availability?.[d] || []).filter(Boolean).length;

  // Belegung aus dem Plan als Overlay fürs Verfügbarkeitsraster: {day:[label|null]}
  const busyOf = (state, id) => { const busy = {}; for (const l of D.lessonsFor(state.timetable, { teacherId: id })) { const k = D.classOf(state, l.classId), s = D.subjectOf(state, l.subjectId); busy[l.day] = busy[l.day] || []; for (let q = 0; q < (l.len || 1); q++) busy[l.day][l.slot - 1 + q] = `${k?.name || '?'} · ${s?.short || s?.name || '?'}`; } return busy; };

  // Klassen, in denen die Person eine Rolle hat (KLP / StV / ABU / weitere Rollen / Fachlehrperson)
  const roleOf = (id) => M.TEACHER_ROLES.find((r) => r.id === id) || { id, name: id, short: id };
  function classesOf(state, id) {
    const out = [];
    for (const k of state.classes) {
      const roles = [];
      if (k.mainTeacherId === id) roles.push(roleOf('klassenlehrperson'));
      if (k.deputyTeacherId === id) roles.push(roleOf('stellvertretung'));
      if (k.abuTeacherId === id) roles.push(roleOf('abu'));
      for (const e of k.extraTeachers || []) if (e.teacherId === id && !roles.some((r) => r.id === e.role)) roles.push(roleOf(e.role || 'fachlehrperson'));
      const reqs = D.classRequirements(state, k).filter((r) => r.teacherId === id);
      const subjects = SW.uniq(reqs.map((r) => r.subjectId)).map((sid) => D.subjectOf(state, sid)).filter(Boolean);
      for (const sid of Object.keys(k.subjectTeachers || {})) if (k.subjectTeachers[sid] === id && !subjects.some((s) => s.id === sid)) { const s = D.subjectOf(state, sid); if (s) subjects.push(s); }
      if (subjects.length && !roles.length) roles.push(roleOf('fachlehrperson'));
      if (roles.length || subjects.length) out.push({ cls: k, roles, subjects, lessons: SW.sum(reqs, (r) => r.lessons) });
    }
    return out.sort((a, b) => byText(a.cls.name, b.cls.name));
  }
  const issuesOf = (state, id) => D.feasibility(state).issues.filter((i) => i.link === '#/lehrpersonen/' + id);

  // ---------- Bausteine ----------
  const subjectChips = (subjects, max = 4) => {
    if (!subjects.length) return h('div.tiny.faint', 'Keine Fächer hinterlegt');
    const shown = subjects.slice(0, max);
    return h('div.lp-subjs', shown.map((s) => h('span.lp-subj', { style: { '--c': s.color || '#888' }, title: s.name }, h('i'), s.short || s.name)), subjects.length > max ? h('span.chip.sm.outline', { title: subjects.slice(max).map((s) => s.name).join(', ') }, `+${subjects.length - max}`) : null);
  };
  const dayBar = (state, t, { labels = true } = {}) => {
    const days = D.days(state); const n = D.slotCount(state);
    const bar = h('div.daybar', days.map((d) => { const c = dayCount(state, t, d); return h('i' + (c ? '.on' : '') + (c && c < n ? '.part' : ''), { title: `${M.dayName(d)}: ${c ? plural(c, 'Lektion', 'Lektionen') : 'nicht verfügbar'}` }); }));
    return h('div.lp-days', bar, labels ? h('div.lbls', days.map((d) => h('span', M.dayName(d, true)))) : null);
  };
  const loadMeter = (load, max, { plan } = {}) => {
    const ratio = max ? load / max : (load ? 2 : 0);
    return U.meter(ratio, { cls: ratioCls(ratio), label: `${SW.fmtNum(load)} / ${SW.fmtNum(max)}${plan != null ? ` · Plan ${SW.fmtNum(plan)}` : ''}` });
  };
  const inactiveChip = () => h('span.chip.sm.outline', 'Inaktiv');
  const nameEl = (t, cls = 'lp-name') => (codeOrFallback(t) ? h('div.' + cls, { title: t.code }, t.code) : h('div.' + cls + '.none', 'ohne Kürzel'));

  // ---------- Formular: anlegen / bearbeiten / duplizieren ----------
  function teacherForm({ teacher, title, sub, isNew, onSave, onDelete }) {
    const state = st();
    const t = SW.clone(teacher);
    const lessonsFull = Number(state.settings.lessonsFull || 25);
    const used = usedEmojis(state, isNew ? null : t.id);
    if (used.has(t.emoji)) t.emoji = nextFreeEmoji(state, t.emoji);
    const picker = U.emojiPicker({ value: t.emoji, used, onpick: (e) => (t.emoji = e) });
    const codeIn = U.input({ value: t.code || '', placeholder: 'z.B. Löwe, 17 oder KM', oninput: (v) => { t.code = v; codeIn.removeAttribute('aria-invalid'); } });
    const subjPick = state.subjects.length ? U.chipPicker(state.subjects.map((s) => ({ value: s.id, label: s.short || s.name, icon: '' })), t.subjectIds || [], (v) => (t.subjectIds = v), { multi: true }) : h('div.small.muted', 'Noch keine Fächer erfasst. ', h('a', { href: '#/faecher' }, 'Fächer erfassen'), ', damit sie hier zugeordnet werden können.');
    const maxIn = U.input({ type: 'number', min: 0, max: 60, step: 1, value: t.maxLessons ?? Math.round((lessonsFull * employmentOf(t)) / 100), oninput: (v) => { t.maxLessons = v; maxIn.removeAttribute('aria-invalid'); } });
    const empIn = U.input({ type: 'number', min: 10, max: 100, step: 5, value: employmentOf(t), oninput: (v) => { t.employment = v; empIn.removeAttribute('aria-invalid'); if (v !== '' && Number.isFinite(Number(v))) { const m = Math.round((lessonsFull * SW.clamp(Number(v), 0, 100)) / 100); maxIn.value = m; t.maxLessons = m; } } });
    const days = U.dayChips(D.days(state), t.preferredDays || [], (v) => (t.preferredDays = v));
    const activeSw = U.switchEl(t.active !== false, (v) => (t.active = v), 'Aktiv');
    const notes = U.textarea({ value: t.notes || '', placeholder: 'Hinweise für die Planung, z.B. «nur vormittags im Frühling» …', oninput: (v) => (t.notes = v) });

    const save = () => {
      if (!t.emoji) { U.toast('Bitte ein Symbol wählen', { type: 'err' }); return; }
      if (usedEmojis(st(), isNew ? null : t.id).has(t.emoji)) { U.toast('Dieses Symbol ist bereits vergeben – bitte ein anderes wählen', { type: 'err' }); return; }
      const code = String(t.code || '').trim();
      if (codeExists(st(), code, isNew ? null : t.id)) { codeIn.setAttribute('aria-invalid', 'true'); codeIn.focus(); U.toast(`Das Kürzel «${code}» ist bereits vergeben`, { type: 'err' }); return; }
      const emp = empIn.value === '' ? 100 : Number(empIn.value);
      if (!Number.isFinite(emp) || emp < 10 || emp > 100) { empIn.setAttribute('aria-invalid', 'true'); empIn.focus(); U.toast('Pensum muss zwischen 10 und 100 % liegen', { type: 'err' }); return; }
      const max = maxIn.value === '' ? Math.round((lessonsFull * emp) / 100) : Number(maxIn.value);
      if (!Number.isFinite(max) || max < 0 || Math.round(max) !== max) { maxIn.setAttribute('aria-invalid', 'true'); maxIn.focus(); U.toast('Max. Lektionen muss eine ganze Zahl ab 0 sein', { type: 'err' }); return; }
      const subjectIds = [...(t.subjectIds || [])];
      const out = { ...t, emoji: t.emoji, code, subjectIds, employment: Math.round(emp), maxLessons: max, preferredDays: [...(t.preferredDays || [])].map(Number).sort(), active: t.active !== false, notes: String(t.notes || '').trim() };
      if (isNew && !countAvail(st(), out.availability)) out.availability = fullWeek(st());
      m.close();
      onSave(out);
      if (!subjectIds.length) U.toast('Ohne Fächer wird diese Lehrperson vom Generator nicht eingesetzt', { type: 'warn', ms: 4500 });
    };
    const body = h('div.lp-form', { onkeydown: (e) => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); save(); } } },
      h('div.col.g12',
        U.field('Symbol *', picker, { hint: 'Das Symbol ersetzt den Namen. Bereits vergebene Symbole sind ausgegraut.' })),
      h('div.lp-g14',
        U.field('Kürzel (optional)', codeIn, { hint: 'Kein Name – ein Tiername, eine Nummer oder ein Kürzel genügt.' }),
        U.field('Fächer', subjPick, { hint: 'Nur für diese Fächer wird die Lehrperson eingeteilt.' }),
        h('div.form-grid',
          U.field('Pensum (%)', empIn, { hint: `Vollpensum = ${SW.fmtNum(lessonsFull)} Lektionen pro Woche` }),
          U.field('Max. Lektionen pro Woche', maxIn, { hint: 'Aus dem Pensum berechnet – kann angepasst werden' })),
        U.field('Wunschtage', days, { hint: 'Weiche Regel: Der Generator bevorzugt diese Tage, garantiert sie aber nicht.' }),
        h('div.field', h('label', 'Status'), h('div.flex.ai-c.g10', activeSw, h('span.small.muted', 'Aktiv – inaktive Lehrpersonen werden nicht verplant'))),
        U.field('Notizen', notes),
        isNew ? U.banner('Die Verfügbarkeit (welche Lektionen an welchen Tagen) wird auf der Detailseite im Wochenraster gezeichnet. Neue Lehrpersonen starten mit der ganzen Woche.', '', { icon: 'info' }) : null),
    );
    const m = U.modal({
      title, sub, body, size: 'wide',
      footer: [
        onDelete ? h('button.btn.danger.soft.left', { onclick: () => { m.close(); onDelete(); } }, SW.icon('trash'), 'Löschen') : null,
        h('button.btn', { onclick: () => m.close() }, 'Abbrechen'),
        h('button.btn.primary', { onclick: save }, SW.icon('check'), isNew ? 'Lehrperson anlegen' : 'Speichern'),
      ],
    });
    return m;
  }

  function openCreate() {
    const state = st();
    const teacher = { ...M.newTeacher(), emoji: nextFreeEmoji(state, M.EMOJIS[0]), maxLessons: Number(state.settings.lessonsFull || 25), availability: fullWeek(state) };
    teacherForm({ teacher, title: 'Lehrperson anlegen', sub: 'Nur Symbol und Kürzel – keine Personendaten.', isNew: true,
      onSave: (t) => { SW.store.add('teachers', t); U.toast(`${label(t)} angelegt`, { type: 'ok' }); goDetail(t.id); } });
  }
  function openEdit(teacher) {
    teacherForm({ teacher, title: 'Lehrperson bearbeiten', sub: label(teacher), isNew: false,
      onSave: (t) => { const { id, availability, ...fields } = t; SW.store.patch('teachers', teacher.id, fields); U.toast('Gespeichert', { type: 'ok' }); },
      onDelete: () => deleteTeacher(teacher) });
  }
  function openDuplicate(teacher) {
    const state = st();
    const copy = { ...SW.clone(teacher), id: SW.uid('t'), emoji: nextFreeEmoji(state, teacher.emoji), code: uniqueCode(state, teacher.code ? String(teacher.code).trim() : '') };
    teacherForm({ teacher: copy, title: 'Lehrperson duplizieren', sub: `Kopie von ${label(teacher)} – Fächer, Pensum und Verfügbarkeit werden übernommen.`, isNew: true,
      onSave: (t) => { SW.store.add('teachers', t); U.toast(`${label(t)} angelegt`, { type: 'ok' }); goDetail(t.id); } });
  }
  function toggleActive(teacher) {
    const active = teacher.active === false;
    SW.store.patch('teachers', teacher.id, { active });
    U.toast(active ? `${label(teacher)} aktiviert` : `${label(teacher)} deaktiviert – wird nicht mehr verplant`, { type: active ? 'ok' : 'warn' });
  }
  async function deleteTeacher(teacher, { afterDelete } = {}) {
    const state = st();
    const cls = classesOf(state, teacher.id);
    const inPlan = planOf(state, teacher.id) || 0;
    const hints = ['Alle Klassenzuordnungen (Klassenlehrperson, Stellvertretung, ABU, Fächer) werden entfernt.'];
    if (cls.length) hints.unshift(`Eingesetzt in ${cls.map((c) => c.cls.name).slice(0, 6).join(', ')}${cls.length > 6 ? ' …' : ''}.`);
    if (inPlan) hints.push(`${plural(inPlan, 'Lektion', 'Lektionen')} im aktuellen Stundenplan werden gelöscht.`);
    const ok = await U.confirm({ title: `${label(teacher)} löschen?`, text: hints.join(' ') + ' Dieser Schritt kann nicht rückgängig gemacht werden.', ok: 'Löschen', danger: true });
    if (!ok) return;
    if (draft && draft.id === teacher.id) draft = null;
    if (afterDelete) afterDelete();
    SW.store.remove('teachers', teacher.id);
    U.toast(`${label(teacher)} gelöscht`);
  }
  function teacherMenu(anchor, teacher, opts) {
    U.menu(anchor, [
      { label: 'Bearbeiten', icon: 'edit', fn: () => openEdit(teacher) },
      { label: 'Duplizieren', icon: 'copy', fn: () => openDuplicate(teacher) },
      { label: teacher.active === false ? 'Aktivieren' : 'Deaktivieren', icon: teacher.active === false ? 'check' : 'x', fn: () => toggleActive(teacher) },
      'sep',
      { label: 'Löschen', icon: 'trash', danger: true, fn: () => deleteTeacher(teacher, opts) },
    ]);
  }
  function viewAs(teacher) {
    SW.store.update((s) => { s.settings.currentTeacherId = teacher.id; s.settings.role = 'teacher'; }, { op: 'setting', key: 'role' });
    U.toast(`Ansicht als ${label(teacher)}`, { type: 'ok' });
    location.hash = '#/portal';
  }

  // ---------- Liste ----------
  function teacherCard(state, t, edit) {
    const subjects = subjectsOf(state, t);
    const max = maxOf(state, t); const load = loadOf(state, t.id); const plan = planOf(state, t.id);
    const card = h('div.card.clickable.lp-card' + (t.active === false ? '.inactive' : ''), { tabindex: '0', role: 'link', 'aria-label': label(t), onclick: () => goDetail(t.id), onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goDetail(t.id); } } },
      h('div.lp-top',
        U.avatar(t, 'lg'),
        h('div.grow', nameEl(t), h('div.flex.ai-c.g6.wrap.mt4', h('span.chip.sm.tint', `${SW.fmtNum(employmentOf(t))} %`), h('span.chip.sm', `max. ${SW.fmtNum(max)} Lekt.`), t.active === false ? inactiveChip() : null)),
        edit ? h('button.btn.icon.ghost.sm', { 'aria-label': 'Aktionen', title: 'Aktionen', onclick: stop((e) => teacherMenu(e.currentTarget, t)) }, SW.icon('more')) : null),
      subjectChips(subjects),
      h('div.lp-meta', h('span', { title: 'Verfügbare Lektionen pro Woche' }, SW.icon('clock'), h('b.num', SW.fmtNum(availOf(state, t))), h('span.faint', 'Lekt. verfügbar'))),
      dayBar(state, t),
      h('div.lp-load', h('div.lbl.small.muted', h('span', 'Zugeteilt / max.'), plan != null ? h('span', { title: 'Lektionen im aktuellen Stundenplan' }, `im Plan: ${SW.fmtNum(plan)}`) : null), loadMeter(load, max)),
    );
    return card;
  }

  function teacherTable(state, list, edit) {
    const hasPlan = !!state.timetable;
    const cols = [
      { label: 'Lehrperson', render: (t) => h('div.flex.ai-c.g10', U.avatar(t, 'sm'), h('div', nameEl(t, 'strong'), t.active === false ? inactiveChip() : null)) },
      { label: 'Fächer', render: (t) => subjectChips(subjectsOf(state, t), 3) },
      { label: 'Pensum', cls: 'r', render: (t) => h('span.num', `${SW.fmtNum(employmentOf(t))} %`) },
      { label: 'Max.', cls: 'r', render: (t) => h('span.num', SW.fmtNum(maxOf(state, t))) },
      { label: 'Verfügbar', render: (t) => h('div.flex.ai-c.g10', dayBar(state, t, { labels: false }), h('span.num.small.muted', SW.fmtNum(availOf(state, t)))) },
      { label: 'Zugeteilt', render: (t) => loadMeter(loadOf(state, t.id), maxOf(state, t)) },
      hasPlan ? { label: 'Im Plan', cls: 'r', render: (t) => h('span.num', SW.fmtNum(planOf(state, t.id))) } : null,
      { label: 'Aktionen', cls: 'act', render: (t) => h('div.flex.jc-e.g4',
        h('a.btn.icon.ghost.sm', { href: '#/lehrpersonen/' + t.id, 'aria-label': 'Öffnen', title: 'Öffnen' }, SW.icon('chevronRight')),
        edit ? h('button.btn.icon.ghost.sm', { 'aria-label': 'Bearbeiten', title: 'Bearbeiten', onclick: stop(() => openEdit(t)) }, SW.icon('edit')) : null,
        edit ? h('button.btn.icon.ghost.sm', { 'aria-label': 'Aktionen', title: 'Weitere Aktionen', onclick: stop((e) => teacherMenu(e.currentTarget, t)) }, SW.icon('more')) : null) },
    ].filter(Boolean);
    return h('div.card', U.table({ cols, rows: list, onRow: (t) => goDetail(t.id), cls: 'lp-tbl', rowClass: (t) => (t.active === false ? 'lp-off' : '') }));
  }

  function emptyState(state, edit) {
    const ex = [{ emoji: '🦁', code: 'Löwe' }, { emoji: '🐸', code: 'Frosch' }, { emoji: '☀️', code: 'Sonne' }, { emoji: '🎸', code: '17' }];
    return h('div.card.pad.empty.lp-empty',
      h('div.lp-empty-top',
        h('div.lp-ex', ex.map((t) => U.teacherPill(t))),
        h('h3', 'Noch keine Lehrpersonen erfasst'),
        h('p', 'Lehrpersonen werden ohne Namen geführt: Jede Person erhält ein Symbol und optional ein Kürzel – zum Beispiel einen Tiernamen oder eine Nummer. So bleibt der Stundenplan datenschutzfreundlich und trotzdem gut lesbar. Fächer, Pensum und Verfügbarkeit steuern, wo der Generator die Person einsetzt.'),
        edit ? h('div.flex.g8.wrap.jc-c.mt8', h('button.btn.primary', { onclick: openCreate }, SW.icon('plus'), 'Lehrperson anlegen'), state.subjects.length ? null : h('a.btn', { href: '#/faecher' }, SW.icon('book'), 'Zuerst Fächer erfassen')) : h('p.small.faint', 'Lehrpersonen werden von der Planung erfasst.')),
      h('div.lp-principles',
        h('div.lp-principle', h('span.ic', '🛡️'), h('div.grow', h('b', 'Kein Name, kein Foto'), h('div.d', 'Nur Symbol und Kürzel werden gespeichert – nichts verlässt diesen Browser.'))),
        h('div.lp-principle', h('span.ic', '📘'), h('div.grow', h('b', 'Fächer'), h('div.d', 'Nur für die hinterlegten Fächer wird eine Lehrperson eingeteilt.'))),
        h('div.lp-principle', h('span.ic', '⏱️'), h('div.grow', h('b', 'Pensum & Verfügbarkeit'), h('div.d', 'Pensum in Prozent ergibt die maximalen Lektionen; im Wochenraster wird gezeichnet, wann Unterricht möglich ist.'))),
        h('div.lp-principle', h('span.ic', '📅'), h('div.grow', h('b', 'Wunschtage'), h('div.d', 'Weiche Regel – der Generator bevorzugt sie, harte Grenze bleibt die Verfügbarkeit.')))),
    );
  }

  function renderList(el, state) {
    const edit = canEdit();
    const teachers = sortTeachers(state.teachers);
    const actions = edit ? [h('button.btn.primary', { onclick: openCreate }, SW.icon('plus'), 'Lehrperson anlegen')] : [];
    el.append(U.pageHeader({ title: 'Lehrpersonen', lead: 'Ohne Namen: Jede Lehrperson ist ein Symbol mit optionalem Kürzel. Fächer, Pensum und Verfügbarkeit steuern die Zuteilung im Generator.', actions }));
    if (!teachers.length) { el.append(emptyState(state, edit)); return; }

    // Kennzahlen
    const active = teachers.filter((t) => t.active !== false);
    const inactive = teachers.length - active.length;
    const fte = SW.sum(active, (t) => employmentOf(t)) / 100;
    const totalMax = SW.sum(active, (t) => maxOf(state, t));
    const totalLoad = SW.sum(active, (t) => loadOf(state, t.id));
    const totalAvail = SW.sum(active, (t) => availOf(state, t));
    const noSubj = active.filter((t) => !(t.subjectIds || []).length);
    const noAvail = active.filter((t) => !availOf(state, t));
    el.append(h('div.grid.c4',
      U.kpi({ label: 'Lehrpersonen', icon: '👩‍🏫', value: SW.fmtNum(active.length), sub: inactive ? `${plural(inactive, 'inaktive', 'inaktive')} ausgeblendet` : 'alle aktiv' }),
      U.kpi({ label: 'Vollzeitstellen', icon: '💼', value: SW.fmtNum(fte, 1), sub: `Ø Pensum ${active.length ? Math.round(SW.sum(active, (t) => employmentOf(t)) / active.length) : 0} %` }),
      U.kpi({ label: 'Zugeteilte Lektionen', icon: '📘', value: h('span', SW.fmtNum(totalLoad), h('small', `/ ${SW.fmtNum(totalMax)}`)), sub: totalMax ? `${Math.round((totalLoad / totalMax) * 100)} % der Pensen aus Klassenzuweisungen` : 'keine Pensen' }),
      U.kpi({ label: 'Verfügbare Lektionen', icon: '⏱️', value: SW.fmtNum(totalAvail), sub: active.length ? `Ø ${SW.fmtNum(totalAvail / active.length, 1)} pro Lehrperson und Woche` : '–' }),
    ));
    if (edit && (noSubj.length || noAvail.length)) {
      const parts = [];
      if (noSubj.length) parts.push(h('span', h('b', `${plural(noSubj.length, 'Lehrperson', 'Lehrpersonen')} ohne Fächer: `), h('span.flex.ai-c.g4.wrap', { style: { display: 'inline-flex' } }, noSubj.slice(0, 5).map((t) => h('a', { href: '#/lehrpersonen/' + t.id, style: { textDecoration: 'none' } }, U.teacherPill(t))), noSubj.length > 5 ? h('span.small', ` +${noSubj.length - 5}`) : null)));
      if (noAvail.length) parts.push(h('span', h('b', `${plural(noAvail.length, 'Lehrperson', 'Lehrpersonen')} ohne Verfügbarkeit: `), h('span', { style: { display: 'inline-flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' } }, noAvail.slice(0, 5).map((t) => h('a', { href: '#/lehrpersonen/' + t.id, style: { textDecoration: 'none' } }, U.teacherPill(t))), noAvail.length > 5 ? h('span.small', ` +${noAvail.length - 5}`) : null)));
      el.append(U.banner(h('div.col.g6', parts), 'warn'));
    }

    // Toolbar
    const body = h('div');
    const count = h('span.lp-count');
    const search = U.input({ value: L.q, placeholder: 'Suchen: Kürzel, Symbol, Fach', oninput: SW.debounce((v) => { L.q = v; refresh(); }, 120) });
    const subjOpts = state.subjects.filter((s) => teachers.some((t) => (t.subjectIds || []).includes(s.id)) || s.id === L.subject).map((s) => ({ value: s.id, label: s.short ? `${s.short} · ${s.name}` : s.name }));
    const subjSel = U.select(subjOpts, L.subject, (v) => { L.subject = v || ''; refresh(); }, { placeholder: 'Alle Fächer' });
    const daySel = U.select(D.days(state).map((d) => ({ value: String(d), label: `verfügbar am ${M.dayName(d)}` })), L.day, (v) => { L.day = v || ''; refresh(); }, { placeholder: 'Verfügbar an allen Tagen' });
    const resetBtn = h('button.btn.ghost.sm', { onclick: () => { L.q = ''; L.subject = ''; L.day = ''; search.value = ''; subjSel.value = ''; daySel.value = ''; refresh(); } }, SW.icon('x'), 'Filter zurücksetzen');
    const seg = U.seg([{ value: 'cards', label: 'Karten' }, { value: 'table', label: 'Tabelle' }], L.mode, (v) => { L.mode = v; SW.lsSet('stundenwerk.teachers.mode', v); refresh(); });
    el.append(h('div.toolbar.lp-toolbar', h('div.search', SW.icon('search'), search), subjSel, daySel, resetBtn, h('div.spacer'), count, seg), body);

    const filtered = () => {
      const q = L.q.trim().toLowerCase();
      return teachers.filter((t) => (!L.subject || (t.subjectIds || []).includes(L.subject))
        && (!L.day || dayCount(state, t, Number(L.day)) > 0)
        && (!q || [t.code, t.emoji, ...subjectsOf(state, t).flatMap((s) => [s.short, s.name])].some((x) => String(x || '').toLowerCase().includes(q))));
    };
    function refresh() {
      const list = filtered();
      const activeF = !!(L.q.trim() || L.subject || L.day);
      resetBtn.classList.toggle('hide', !activeF);
      SW.mount(count, activeF ? `${SW.fmtNum(list.length)} von ${SW.fmtNum(teachers.length)} Lehrpersonen` : plural(teachers.length, 'Lehrperson', 'Lehrpersonen'));
      if (!list.length) { SW.mount(body, h('div.card', U.empty({ icon: '🔍', title: 'Keine Lehrpersonen gefunden', text: 'Keine Lehrperson passt zu Suche und Filtern.', action: h('button.btn', { onclick: () => resetBtn.click() }, 'Filter zurücksetzen') }))); return; }
      if (L.mode === 'table') SW.mount(body, teacherTable(state, list, edit));
      else SW.mount(body, h('div.grid.auto', list.map((t) => teacherCard(state, t, edit))));
    }
    refresh();
  }

  // ---------- Detail ----------
  function renderDetail(el, state, id) {
    const t = D.teacherOf(state, id);
    if (!t) {
      if (draft && draft.id === id) draft = null;
      el.append(U.pageHeader({ title: 'Lehrpersonen' }), h('div.card', U.empty({ icon: '👩‍🏫', title: 'Lehrperson nicht gefunden', text: 'Diese Lehrperson existiert nicht oder wurde gelöscht.', action: h('a.btn.primary', { href: '#/lehrpersonen' }, SW.icon('chevronLeft'), 'Zur Übersicht') })));
      return;
    }
    const edit = canEdit();
    const isMe = state.settings.role === 'teacher' && state.settings.currentTeacherId === id;
    const canPaint = edit || isMe;
    const tt = state.timetable;
    const subjects = subjectsOf(state, t);
    const max = maxOf(state, t); const load = loadOf(state, id); const plan = planOf(state, id);
    const lessons = D.lessonsFor(tt, { teacherId: id });
    const afterDelete = () => SW.router.go('#/lehrpersonen');

    // Entwurf der Verfügbarkeit (nur für diese Person, sonst verwerfen)
    if (draft && draft.id !== id) draft = null;
    if (!draft) draft = { id, availability: normAvail(state, t.availability), preferredDays: [...(t.preferredDays || [])].map(Number).sort() };
    const isDirty = () => !sameAvail(state, draft.availability, t.availability) || !sameDays(draft.preferredDays, t.preferredDays);

    // Kopf
    el.append(h('div.lp-head',
      U.avatar(t, 'xl'),
      h('div.grow',
        h('div.tiny.faint', h('a', { href: '#/lehrpersonen' }, 'Lehrpersonen'), ' / ', t.emoji),
        h('h1', codeOrFallback(t) ? t.code : h('span.none', 'Lehrperson ohne Kürzel'), t.active === false ? h('span.chip.warn', 'Inaktiv') : null),
        h('div.chips',
          h('span.chip.tint', `${SW.fmtNum(employmentOf(t))} % · max. ${plural(max, 'Lektion', 'Lektionen')}`),
          subjects.length ? subjects.map((s) => h('span.lp-subj', { style: { '--c': s.color || '#888' }, title: s.name }, h('i'), s.short || s.name)) : h('span.chip.warn', 'Keine Fächer'),
          (t.preferredDays || []).length ? h('span.chip', { title: 'Wunschtage (weiche Regel)' }, '★ ' + t.preferredDays.map((d) => M.dayName(d, true)).join(', ')) : null)),
      h('div.actions',
        h('a.btn', { href: '#/lehrpersonen' }, SW.icon('chevronLeft'), 'Zurück'),
        edit ? h('button.btn.primary', { onclick: () => openEdit(t) }, SW.icon('edit'), 'Bearbeiten') : null,
        h('a.btn', { href: '#/stundenplan?view=lehrperson&id=' + id }, SW.icon('grid'), 'Stundenplan'),
        edit ? h('button.btn', { onclick: () => viewAs(t), title: 'Portal-Ansicht dieser Lehrperson öffnen' }, SW.icon('eye'), 'Als diese Lehrperson anzeigen') : null,
        edit ? h('button.btn.icon', { 'aria-label': 'Weitere Aktionen', title: 'Weitere Aktionen', onclick: (e) => teacherMenu(e.currentTarget, t, { afterDelete }) }, SW.icon('more')) : null),
    ));
    if (t.active === false) el.append(U.banner(h('span', h('b', 'Deaktiviert: '), 'Diese Lehrperson wird vom Generator nicht verplant. Klassenzuordnungen bleiben erhalten.'), 'warn', { action: edit ? h('button.btn.sm', { onclick: () => toggleActive(t) }, 'Aktivieren') : null }));
    if (t.notes) el.append(U.banner(h('span', h('b', 'Notiz: '), t.notes), '', { icon: 'info' }));

    // Kennzahlen (live beim Zeichnen)
    const kpiBody = h('div.lp-g14');
    const reKpi = () => {
      const avail = countAvail(state, draft.availability);
      const rAvail = avail ? load / avail : (load ? 2 : 0);
      const rMax = max ? load / max : (load ? 2 : 0);
      SW.mount(kpiBody,
        h('div.lp-stats',
          h('div.lp-stat', h('b', SW.fmtNum(avail), h('small', `/ ${SW.fmtNum(D.days(state).length * D.slotCount(state))}`)), h('span', 'Lektionen verfügbar')),
          h('div.lp-stat', h('b', SW.fmtNum(load)), h('span', 'zugeteilt (Klassen)')),
          h('div.lp-stat', h('b', plan == null ? '–' : SW.fmtNum(plan)), h('span', plan == null ? 'im Plan · noch kein Plan' : 'Lektionen im Plan')),
          h('div.lp-stat', h('b', SW.fmtNum(max)), h('span', `max. · Pensum ${SW.fmtNum(employmentOf(t))} %`))),
        h('div.lp-meters',
          h('div', h('div.lbl.small.muted', h('span', 'Zuteilung / Verfügbarkeit'), h('span.num', `${SW.fmtNum(load)} / ${SW.fmtNum(avail)}`)), U.meter(rAvail, { cls: ratioCls(rAvail), label: avail ? `${Math.round(rAvail * 100)} %` : '–' })),
          h('div', h('div.lbl.small.muted', h('span', 'Zuteilung / Pensum'), h('span.num', `${SW.fmtNum(load)} / ${SW.fmtNum(max)}`)), U.meter(rMax, { cls: ratioCls(rMax), label: max ? `${Math.round(rMax * 100)} %` : '–' }))),
        load > avail ? U.banner(h('span', h('b', 'Zu wenig Verfügbarkeit: '), `${plural(load, 'Lektion ist', 'Lektionen sind')} zugeteilt, aber nur ${plural(avail, 'Lektion', 'Lektionen')} verfügbar. Verfügbarkeit erweitern oder Zuweisungen in den Klassen anpassen.`), 'err')
          : load > max ? U.banner(h('span', h('b', 'Über dem Pensum: '), `${plural(load, 'Lektion', 'Lektionen')} zugeteilt, das Pensum erlaubt ${SW.fmtNum(max)}.`), 'warn')
          : avail && load > avail * 0.85 ? U.banner(h('span', h('b', 'Knapp: '), `${SW.fmtNum(load)} von ${SW.fmtNum(avail)} verfügbaren Lektionen sind belegt – wenig Spielraum für den Generator.`), 'warn')
          : null);
    };
    reKpi();
    el.append(U.card({ title: 'Kennzahlen', icon: '📊', sub: 'Zuteilung aus den Klassen, Verfügbarkeit aus dem Raster unten', body: kpiBody }));

    // Verfügbarkeit (bearbeitbar)
    const presets = U.availabilityPresets(state);
    const grid = U.availabilityGrid({ value: draft.availability, readonly: !canPaint, busy: tt ? busyOf(state, id) : {}, state, onchange: (v) => { draft.availability = normAvail(state, v); reKpi(); reDirty(); } });
    const dayChips = U.dayChips(D.days(state), draft.preferredDays, (v) => { draft.preferredDays = v; reDirty(); });
    const dirtyEl = h('span.lp-dirty');
    const saveBtn = h('button.btn.primary', { onclick: () => {
      const availability = { ...(t.availability || {}), ...normAvail(state, draft.availability) };
      SW.store.patch('teachers', id, { availability, preferredDays: [...draft.preferredDays].map(Number).sort() });
      draft = null;
      U.toast('Verfügbarkeit gespeichert', { type: 'ok' });
    } }, SW.icon('check'), 'Speichern');
    const discardBtn = h('button.btn', { onclick: () => { draft = null; SW.router.refresh(); U.toast('Änderungen verworfen'); } }, 'Verwerfen');
    const reDirty = () => { const d = isDirty(); saveBtn.disabled = !d; discardBtn.disabled = !d; SW.mount(dirtyEl, d ? [h('span.dot'), 'Ungespeicherte Änderungen'] : null); };
    const applyPreset = (fn) => { const v = {}; for (const d of D.days(state)) v[d] = [...fn(d)]; draft.availability = v; grid.setValue(v); reKpi(); reDirty(); };
    const presetBtns = canPaint ? h('div.lp-presets',
      h('button.btn.sm', { onclick: () => applyPreset(() => presets.ganzerTag) }, 'Ganze Woche'),
      h('button.btn.sm', { onclick: () => applyPreset(() => presets.vormittag) }, 'Vormittage'),
      h('button.btn.sm', { onclick: () => applyPreset(() => presets.nachmittag) }, 'Nachmittage'),
      h('button.btn.sm', { onclick: () => applyPreset((d) => (d <= 4 ? presets.ganzerTag : presets.keiner)) }, 'Mo–Do'),
      h('button.btn.sm.ghost', { onclick: () => applyPreset(() => presets.keiner) }, SW.icon('x'), 'Leeren')) : null;
    const availBody = h('div.lp-g14',
      presetBtns,
      h('div.lp-avail-wrap', grid),
      h('div.legend.lp-legend', h('span', h('i.on'), 'Verfügbar'), h('span', h('i.off'), 'Nicht verfügbar'), tt ? h('span', h('i.busy'), 'Im Plan belegt (Klasse · Fach)') : null, canPaint ? h('span.faint', 'Klicken oder ziehen · Kopfzeile: ganzen Tag umschalten · Nummer: Lektion an allen Tagen') : null),
      h('div.field', h('label', 'Wunschtage'), canPaint ? dayChips : h('div.chips', (draft.preferredDays.length ? draft.preferredDays.map((d) => h('span.chip', M.dayName(d, true))) : [h('span.small.muted', 'keine')])), h('div.hint', 'Weiche Regel: Der Generator bevorzugt diese Tage, die harte Grenze bleibt die Verfügbarkeit oben.')),
    );
    reDirty();
    el.append(U.card({ title: 'Verfügbarkeit', icon: '🗓️', sub: canPaint ? 'Wann diese Lehrperson unterrichten kann – wird erst mit «Speichern» übernommen' : 'Nur lesend – die Verfügbarkeit bearbeitet die Planung oder die Lehrperson selbst im Portal', body: availBody, footer: canPaint ? [dirtyEl, h('span.left'), discardBtn, saveBtn] : null }));

    // Klassen, Hinweise, Pro-Karte
    const cls = classesOf(state, id);
    const classList = cls.length
      ? h('ul.list.lp-cls', cls.map((c) => h('li',
        h('span.av.sm', '👥'),
        h('div.grow', h('a.ttl', { href: '#/klassen/' + c.cls.id }, c.cls.name), h('div.sub', c.roles.map((r) => h('span.chip.sm' + (r.id === 'klassenlehrperson' ? '.tint' : ''), { title: r.name }, r.short)), c.subjects.map((s) => h('span.lp-subj', { style: { '--c': s.color || '#888' }, title: s.name }, h('i'), s.short || s.name)), h('span.tiny.faint', `Schultage: ${(c.cls.schoolDays || []).length ? c.cls.schoolDays.map((d) => M.dayName(d, true)).join(', ') : '–'}`))),
        c.lessons ? h('span.lp-n', plural(c.lessons, 'Lekt.', 'Lekt.')) : null,
        h('a.btn.icon.ghost.sm', { href: '#/klassen/' + c.cls.id, 'aria-label': 'Klasse öffnen' }, SW.icon('chevronRight')))))
      : U.empty({ icon: '👥', title: 'In keiner Klasse eingesetzt', text: 'Klassenlehrperson, Stellvertretung, ABU und Fach-Lehrpersonen werden bei der Klasse festgelegt. Fehlende Fach-Zuweisungen vergibt der Generator automatisch an qualifizierte Lehrpersonen.', action: edit && state.classes.length ? h('a.btn.sm', { href: '#/klassen' }, 'Zu den Klassen') : null });
    const issues = issuesOf(state, id);
    const levelChip = (lvl) => h('span.chip.sm.lvl.' + (lvl === 'error' ? 'err' : lvl === 'warn' ? 'warn' : 'info'), lvl === 'error' ? 'Fehler' : lvl === 'warn' ? 'Warnung' : 'Hinweis');
    const issueList = issues.length
      ? h('ul.list.lp-issues', issues.map((i) => h('li', levelChip(i.level), h('div.grow', h('div.strong', i.title), h('div.small.muted', i.text)))))
      : U.banner(h('span', h('b', 'Alles in Ordnung. '), 'Die Machbarkeitsanalyse meldet für diese Lehrperson keine Probleme.'), 'ok');
    const pro = U.isPro();
    const myEntries = (state.timeEntries || []).filter((e) => e.teacherId === id).length;
    const myAbs = (state.absences || []).filter((a) => a.teacherId === id).length;
    const proCard = U.card({ title: 'Arbeitszeit & Kalender', icon: '🗓️', actions: pro ? null : [U.lockBadge()], body: h('div.lp-pro-body',
      h('p.small.muted', 'Persönlicher Kalender mit Unterricht aus dem Stundenplan, eigene Zeiteinträge, Soll/Ist nach Berufsauftrag und Absenzen.'),
      pro ? h('div.lp-pro-stats', U.stat('Zeiteinträge', SW.fmtNum(myEntries)), U.stat('Absenzen', SW.fmtNum(myAbs))) : null,
      h('div', pro ? h('a.btn', { href: '#/kalender' }, SW.icon('calendar'), 'Kalender öffnen') : h('button.btn', { onclick: () => U.paywall('calendar', () => SW.router.refresh()) }, SW.icon('lock'), 'Kalender öffnen', U.lockBadge()))) });
    el.append(h('div.grid.c2',
      U.card({ title: 'Klassen', icon: '👥', sub: cls.length ? `${plural(cls.length, 'Klasse', 'Klassen')} · ${plural(SW.sum(cls, (c) => c.lessons), 'Lektion', 'Lektionen')} pro Woche` : null, body: classList }),
      h('div.col.g16', U.card({ title: 'Hinweise zur Planung', icon: '🔍', sub: issues.length ? `${plural(issues.length, 'Hinweis', 'Hinweise')} aus der Machbarkeitsanalyse` : null, body: issueList, actions: [h('a.btn.sm', { href: '#/generator' }, SW.icon('wand'), 'Generator')] }), proCard),
    ));

    // Wochenplan
    let planBody;
    if (tt) {
      const offDays = D.days(state).filter((d) => !(t.availability?.[d] || []).some(Boolean));
      const ttGrid = U.timetableGrid({ lessons, mode: 'teacher', dense: true, state, showFree: true, offDays, onLessonClick: (l) => SW.router.go('#/stundenplan?view=klasse&id=' + l.classId) });
      planBody = [lessons.length ? null : U.banner('Im aktuellen Stundenplan hat diese Lehrperson keine Lektionen.', '', { icon: 'info' }), h('div.scroll-x', ttGrid)];
    } else {
      planBody = U.empty({ icon: '🗓️', title: 'Noch kein Stundenplan', text: 'Sobald ein Plan generiert ist, erscheint hier der Wochenplan dieser Lehrperson.', action: edit ? h('a.btn.primary', { href: '#/generator' }, SW.icon('wand'), 'Zum Generator') : null });
    }
    el.append(U.card({ title: 'Wochenplan', icon: '🗓️', sub: tt ? `${plural(SW.sum(lessons, (l) => l.len || 1), 'Lektion', 'Lektionen')} · ${tt.status === 'published' ? 'veröffentlichter Plan' : 'Planentwurf'}` : null, body: planBody, actions: tt ? [h('a.btn.sm', { href: '#/stundenplan?view=lehrperson&id=' + id }, SW.icon('grid'), 'Im Stundenplan öffnen')] : null }));
  }

  // ---------- Store-Abonnement (manualRefresh) ----------
  function onStore(state, meta) {
    const cur = SW.router.current; if (!cur || cur.route !== 'lehrpersonen') return;
    if (meta.op === 'notify' || (meta.op === 'setting' && meta.key === 'theme')) return;
    // Ungespeicherte Verfügbarkeit nicht überschreiben – ausser die Person selbst wurde bearbeitet (Entwurf bleibt erhalten)
    if (draft && cur.id === draft.id && SW.domain.teacherOf(state, draft.id)) {
      const t = SW.domain.teacherOf(state, draft.id);
      const dirty = !sameAvail(state, draft.availability, t.availability) || !sameDays(draft.preferredDays, t.preferredDays);
      if (dirty && !(meta.coll === 'teachers' && meta.id === draft.id)) return;
    }
    SW.router.refresh();
  }

  // ---------- Registrierung ----------
  SW.views['lehrpersonen'] = {
    title: 'Lehrpersonen', manualRefresh: true,
    render(el, params) {
      U.injectCSS('lehrpersonen', CSS);
      if (!unsub) unsub = SW.store.on(onStore);
      const state = st();
      if (params && params.id) renderDetail(el, state, params.id);
      else renderList(el, state);
    },
    onLeave() { if (unsub) { unsub(); unsub = null; } },
  };
})();
