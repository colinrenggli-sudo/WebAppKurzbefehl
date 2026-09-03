/* STUNDENWERK · views/curricula.js — Lehrgänge (Profile) mit Lektionentafel.
   Routen:  #/lehrgaenge        Liste als Karten: Name, Kürzel, Beschreibung, Lehrjahre, Fächer, Lektionen und Schultage je Lehrjahr, Klassen
            #/lehrgaenge/:id    Lektionentafel-Editor: Stammdaten (Modal), Schultage je Lehrjahr, Lektionen pro Fach und Lehrjahr,
                                Lektionsform, Summen und Kapazität je Lehrjahr, Klassen mit diesem Lehrgang
   Datenform: curricula[{ id, name, short, years, description, daysPerYear:{1:2,2:2,3:1}, subjects:[{ subjectId, lessons:{1:n,2:n,3:n}, block:1|2 }] }]
   manualRefresh: Zahlenfelder und Selects speichern per onchange über SW.store.update(fn, {quiet:true}) und aktualisieren nur
   Summen, Kapazität und Hinweise – der Fokus bleibt erhalten. Alle übrigen Store-Änderungen rendern die Ansicht neu
   (SW.store.on in render, Abmeldung in onLeave). Schreibt ausschliesslich über SW.store. Eigene CSS-Klassen mit Präfix .cu-. */
(function () {
  const SW = (globalThis.SW = globalThis.SW || {});
  SW.views = SW.views || {};
  const h = SW.h; const M = SW.model; const U = SW.ui; const D = SW.domain;

  const CSS = `
.cu-ic{width:44px;height:44px;border-radius:12px;background:var(--card-3);display:grid;place-items:center;font-size:23px;flex:none;line-height:1}
.cu-ic.sm{width:32px;height:32px;border-radius:9px;font-size:17px}
.cu-ic.lg{width:76px;height:76px;border-radius:22px;font-size:42px;background:var(--tint-soft)}
.cu-card{display:flex;flex-direction:column;gap:10px;padding:14px 16px;outline:none}
.cu-card:focus-visible{box-shadow:var(--ring)}
.cu-top{display:flex;align-items:flex-start;gap:12px}
.cu-name{font-weight:650;font-size:15.5px;line-height:1.25;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.cu-desc{font-size:13px;color:var(--txt-2);line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.8em}
.cu-years{display:grid;grid-template-columns:repeat(auto-fit,minmax(68px,1fr));gap:6px}
.cu-year{display:flex;flex-direction:column;align-items:center;gap:1px;padding:8px 6px;border-radius:var(--r-s);background:var(--card-2);border:1px solid transparent;text-align:center;line-height:1.15;min-width:0}
.cu-year .cu-ylbl{font-size:11px;font-weight:650;color:var(--txt-3);text-transform:uppercase;letter-spacing:.05em}
.cu-year b{font-size:20px;font-weight:720;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.cu-year .cu-ysub{font-size:11.5px;color:var(--txt-3);white-space:nowrap}
.cu-year.over{background:var(--err-soft);border-color:color-mix(in srgb,var(--err) 35%,transparent)}
.cu-year.over b,.cu-year.over .cu-ysub{color:var(--err-txt)}
.cu-year.zero b{color:var(--txt-3)}
.cu-meta{display:flex;gap:6px 14px;flex-wrap:wrap;font-size:13px;color:var(--txt-2)}
.cu-meta span{display:inline-flex;align-items:center;gap:5px;min-width:0}
.cu-meta svg.i{width:15px;height:15px;color:var(--txt-3)}
.cu-foot{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:auto;padding-top:10px;border-top:1px solid var(--sep)}
.cu-foot .cu-del{margin-left:auto}
.cu-head{display:flex;align-items:center;gap:18px;flex-wrap:wrap}
.cu-head .grow{min-width:0}
.cu-head h1{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.cu-head .chips{margin-top:8px}
.cu-head .cu-lead{color:var(--txt-2);margin-top:8px;max-width:78ch;font-size:14px;line-height:1.45}
.cu-head .actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.cu-ypanels{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px}
.cu-ypanel{background:var(--card-2);border:1px solid var(--sep);border-radius:var(--r-s);padding:12px 14px;display:flex;flex-direction:column;gap:10px;min-width:0}
.cu-ypanel.over{border-color:color-mix(in srgb,var(--err) 45%,transparent)}
.cu-yhead{display:flex;align-items:center;justify-content:space-between;gap:8px}
.cu-yhead b{font-size:14.5px}
.cu-ycap{display:flex;flex-direction:column;gap:4px}
.cu-ycap .meter .num{min-width:64px}
.cu-tbl{min-width:560px}
.cu-tbl th.y,.cu-tbl td.y{text-align:center}
.cu-tbl th .cu-thsub{display:block;font-size:11px;font-weight:500;text-transform:none;letter-spacing:0;color:var(--txt-3);margin-top:2px;white-space:nowrap}
.cu-tbl input.cu-num{width:72px;text-align:center;margin:0 auto;font-variant-numeric:tabular-nums;padding:0 4px 0 8px}
.cu-tbl input.cu-num.cu-odd{border-color:var(--warn);box-shadow:0 0 0 2px color-mix(in srgb,var(--warn) 22%,transparent)}
.cu-tbl td.cu-subj{max-width:340px;min-width:200px}
.cu-tbl td.cu-subj .subj{white-space:normal;line-height:1.3}
.cu-tbl tfoot td{background:var(--card-2);font-weight:600;border-top:2px solid var(--sep-2);border-bottom:0}
.cu-tbl tfoot td.cu-over{color:var(--err-txt);background:var(--err-soft)}
.cu-tbl tbody tr.cu-missing td{opacity:.7}
.cu-add{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding-top:14px;margin-top:4px;border-top:1px dashed var(--sep-2)}
.cu-add select.inp{flex:1;min-width:220px;max-width:460px}
.cu-hints{display:flex;flex-direction:column;gap:6px;margin-top:12px}
.cu-hint{display:flex;align-items:flex-start;gap:9px;font-size:13px;line-height:1.4;padding:7px 10px;border-radius:var(--r-s);background:var(--card-2);color:var(--txt-2)}
.cu-hint .dot{margin-top:5px}
.cu-hint.err{background:var(--err-soft);color:var(--err-txt)}
.cu-hint.warn{background:var(--warn-soft);color:var(--warn-txt)}
.cu-hint.ok{background:var(--ok-soft);color:var(--ok-txt)}
.cu-empty{align-items:stretch}
.cu-empty .cu-empty-top{display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px}
.cu-empty .cu-empty-top p{max-width:62ch;color:var(--txt-2)}
.cu-empty h4{margin-top:22px;margin-bottom:10px}
.cu-tpls{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px;text-align:left;width:100%}
.cu-tpl{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border-radius:var(--r-s);background:var(--card-2);font-size:13px;min-width:0}
.cu-tpl.off{opacity:.72}
.cu-tpl b{font-size:13.5px;line-height:1.3}
.cu-tpl .d{color:var(--txt-3);font-size:12px;line-height:1.35}
.cu-kls li .cu-ic.sm{background:var(--tint-soft)}
@media (max-width:600px){.cu-head .actions{width:100%}.cu-head .actions .btn:not(.icon){flex:1}}
`;

  const MAX_LESSONS = 12;          // Lektionen pro Woche und Fach (Zahlenfeld 0–12)
  const MAX_DAYS = 5;              // Schultage pro Woche
  const YEAR_OPTIONS = [2, 3, 4];  // wählbare Lehrjahre

  // Vorlagen für den leeren Zustand. Fächer werden über das Kürzel (short) gesucht; alle «required» müssen vorhanden sein,
  // die übrigen Fächer werden übernommen, wenn sie existieren. Lektionen je Lehrjahr als Array [1. LJ, 2. LJ, 3. LJ].
  const TEMPLATES = [
    { name: 'Kauffrau/Kaufmann EFZ (Kaufleute 2023)', short: 'KV EFZ', years: 3, days: { 1: 2, 2: 2, 3: 1 },
      description: 'Bildungsverordnung 2023: Handlungskompetenzbereiche A–E, Wahlpflichtbereich, Option im 3. Lehrjahr. Zwei Schultage im 1. und 2., ein Schultag im 3. Lehrjahr.',
      required: ['HKB A', 'HKB B', 'HKB C', 'HKB D', 'HKB E'],
      subjects: [['HKB A', [2, 1, 1], 1], ['HKB B', [2, 2, 1], 2], ['HKB C', [3, 4, 1], 2], ['HKB D', [3, 4, 1], 2], ['HKB E', [3, 2, 1], 2], ['WPB', [3, 3, 0], 1], ['OPT', [0, 0, 3], 1], ['SP', [2, 2, 1], 2]] },
    { name: 'Kaufleute EFZ mit BM1 Typ Wirtschaft', short: 'KV BM1', years: 3, days: { 1: 2, 2: 2, 3: 2 },
      description: 'Lehrbegleitende Berufsmaturität: Grundlagen-, Schwerpunkt- und Ergänzungsfächer, zwei Schultage in allen Lehrjahren.',
      required: ['D', 'E', 'M', 'FRW', 'WR'],
      subjects: [['D', [2, 2, 2], 1], ['F', [2, 2, 2], 1], ['E', [2, 2, 2], 1], ['M', [2, 2, 1], 1], ['FRW', [2, 3, 3], 2], ['WR', [2, 2, 3], 2], ['GP', [0, 1, 2], 1], ['TU', [1, 1, 1], 1], ['HKB C', [2, 1, 1], 1], ['HKB E', [1, 1, 0], 1], ['SP', [2, 1, 1], 2]] },
    { name: 'Kauffrau/Kaufmann EBA', short: 'KV EBA', years: 2, days: { 1: 2, 2: 1 },
      description: 'Zweijährige Grundbildung (Bildungsverordnung 2023): zwei Schultage im 1., ein Schultag im 2. Lehrjahr.',
      required: ['HKB A', 'HKB B', 'HKB C'],
      subjects: [['HKB A', [2, 2], 1], ['HKB B', [4, 2], 2], ['HKB C', [3, 2], 2], ['HKB D', [3, 0], 2], ['HKB E', [2, 1], 2], ['SP', [2, 1], 2]] },
  ];

  // ---------- Helfer ----------
  const st = () => SW.store.state;
  const canEdit = () => st().settings.role !== 'teacher';
  const byName = (a, b) => String(a).localeCompare(String(b), 'de', { numeric: true, sensitivity: 'base' });
  const norm = (s) => String(s || '').trim().replace(/\s+/g, ' ').toLowerCase();
  const plural = (n, one, many) => `${SW.fmtNum(n)} ${n === 1 ? one : many}`;
  const dayWord = (n) => `${n} ${n === 1 ? 'Tag' : 'Tage'}`;
  const yearsOf = (c) => SW.clamp(Math.round(Number(c.years) || 3), 1, 6);
  const yearList = (c) => SW.range(yearsOf(c), 1);
  const defaultDays = (y) => (y <= 2 ? 2 : 1);
  const daysFor = (c, y) => { const v = Number((c.daysPerYear || {})[y]); return Number.isFinite(v) && v >= 1 ? SW.clamp(Math.round(v), 1, MAX_DAYS) : defaultDays(y); };
  const lessonsOf = (row, y) => { const n = Number((row.lessons || {})[y]); return Number.isFinite(n) && n > 0 ? n : 0; };
  const capFor = (state, c, y) => daysFor(c, y) * D.slotCount(state);
  const totalFor = (c, y) => SW.sum(c.subjects || [], (r) => lessonsOf(r, y));
  const blockOf = (state, row) => (Number(row.block || D.subjectOf(state, row.subjectId)?.block || 1) === 2 ? 2 : 1);
  const subjectsOf = (c) => (Array.isArray(c.subjects) ? c.subjects : []);
  const classesOf = (state, id) => state.classes.filter((k) => k.curriculumId === id);
  const hasLessons = (c) => subjectsOf(c).some((r) => Object.values(r.lessons || {}).some((n) => Number(n) > 0));
  const nameExists = (state, name, exceptId) => state.curricula.some((c) => c.id !== exceptId && norm(c.name) === norm(name));
  const shortExists = (state, short, exceptId) => state.curricula.some((c) => c.id !== exceptId && norm(c.short) === norm(short));
  const uniqueName = (state, base) => { let n = base, i = 2; while (nameExists(state, n)) n = `${base} ${i++}`; return n; };
  const uniqueShort = (state, base) => { let n = base, i = 2; while (shortExists(state, n)) n = `${base} ${i++}`; return n; };
  const findSubject = (state, short) => state.subjects.find((s) => norm(s.short) === norm(short)) || null;
  const sortCurricula = (list) => [...list].sort((a, b) => byName(a.name, b.name));
  const goDetail = (id) => SW.router.go('#/lehrgaenge/' + id);
  const stop = (fn) => (e) => { e.stopPropagation(); e.preventDefault(); fn(e); };

  // Prüfung einer Lektionentafel: Überbelegung, leere Lehrjahre, ungerade Anzahl bei Doppellektionen, gelöschte Fächer
  function analyse(state, c) {
    const issues = [];
    const S = D.slotCount(state);
    const rows = subjectsOf(c);
    for (const y of yearList(c)) {
      const total = totalFor(c, y), cap = capFor(state, c, y), days = daysFor(c, y);
      if (total > cap) issues.push({ level: 'err', year: y, text: `${y}. Lehrjahr: ${total} Lektionen pro Woche, aber nur ${cap} Plätze (${plural(days, 'Schultag', 'Schultage')} × ${S} Lektionen). Weiteren Schultag ergänzen oder Lektionen reduzieren.` });
      else if (!total && rows.length) issues.push({ level: 'warn', year: y, text: `${y}. Lehrjahr: keine Lektionen hinterlegt – Klassen in diesem Lehrjahr hätten keinen Unterricht.` });
      for (const r of rows) {
        const n = lessonsOf(r, y);
        if (blockOf(state, r) === 2 && n % 2 === 1) issues.push({ level: 'info', year: y, text: `${y}. Lehrjahr · «${D.subjectOf(state, r.subjectId)?.name || 'Fach'}»: ${n} Lektionen als Doppellektionen – eine Lektion bleibt einzeln.` });
      }
    }
    const missing = rows.filter((r) => !D.subjectOf(state, r.subjectId)).length;
    if (missing) issues.push({ level: 'warn', text: `${plural(missing, 'Eintrag verweist', 'Einträge verweisen')} auf ein gelöschtes Fach – Zeile entfernen.` });
    return issues;
  }
  const worstLevel = (issues) => (issues.some((i) => i.level === 'err') ? 'err' : issues.some((i) => i.level === 'warn') ? 'warn' : issues.length ? 'info' : '');

  // Schreiben ohne Neu-Rendern: die Ansicht aktualisiert nur Summen und Hinweise (siehe Store-Listener unten)
  const quietUpdate = (id, fn) => SW.store.update((s) => { const c = s.curricula.find((x) => x.id === id); if (c) fn(c, s); }, { coll: 'curricula', id, op: 'patch', quiet: true });

  // ---------- Formular: Stammdaten (anlegen, bearbeiten, duplizieren) ----------
  function curForm({ cur, title, sub, isNew, onSave, onDelete }) {
    const state = st();
    const c = SW.clone(cur);
    const origYears = yearsOf(cur);
    const nameIn = U.input({ value: c.name, placeholder: 'z.B. Kauffrau/Kaufmann EFZ', oninput: (v) => { c.name = v; nameIn.removeAttribute('aria-invalid'); } });
    const shortIn = U.input({ value: c.short, placeholder: 'z.B. KV EFZ', oninput: (v) => { c.short = v; shortIn.removeAttribute('aria-invalid'); } });
    const yearsHint = h('div.hint');
    const reHint = () => {
      const y = yearsOf(c);
      const parts = ['Für jedes Lehrjahr werden Schultage und Lektionen hinterlegt.'];
      if (!isNew && y < origYears) {
        const dropped = SW.range(origYears - y, y + 1);
        const affected = subjectsOf(c).filter((r) => dropped.some((d) => lessonsOf(r, d) > 0)).length;
        parts.push(`Lektionen ab dem ${y + 1}. Lehrjahr werden entfernt${affected ? ` (${plural(affected, 'Fach', 'Fächer')} betroffen)` : ''}.`);
        const kls = classesOf(state, c.id).filter((k) => Number(k.year) > y).length;
        if (kls) parts.push(`${plural(kls, 'Klasse ist', 'Klassen sind')} in einem höheren Lehrjahr.`);
      }
      SW.mount(yearsHint, parts.join(' '));
      yearsHint.classList.toggle('warn-c', !isNew && y < origYears);
    };
    const yearOpts = SW.uniq([...YEAR_OPTIONS, yearsOf(c)]).sort((a, b) => a - b);
    const yearsSeg = U.seg(yearOpts.map((y) => ({ value: y, label: `${y} Lehrjahre` })), yearsOf(c), (v) => { c.years = Number(v); reHint(); });
    reHint();
    const desc = U.textarea({ value: c.description || '', placeholder: 'Bildungsverordnung, Profil, Besonderheiten …', oninput: (v) => (c.description = v) });

    const save = () => {
      const name = String(c.name || '').trim(); const short = String(c.short || '').trim();
      if (!name) { nameIn.setAttribute('aria-invalid', 'true'); nameIn.focus(); U.toast('Bitte einen Namen eingeben', { type: 'err' }); return; }
      if (nameExists(st(), name, isNew ? null : c.id)) { nameIn.setAttribute('aria-invalid', 'true'); nameIn.focus(); U.toast(`Es gibt bereits einen Lehrgang «${name}»`, { type: 'err' }); return; }
      if (!short) { shortIn.setAttribute('aria-invalid', 'true'); shortIn.focus(); U.toast('Bitte ein Kürzel eingeben', { type: 'err' }); return; }
      if (short.length > 12) { shortIn.setAttribute('aria-invalid', 'true'); shortIn.focus(); U.toast('Das Kürzel darf höchstens 12 Zeichen haben', { type: 'err' }); return; }
      if (shortExists(st(), short, isNew ? null : c.id)) { shortIn.setAttribute('aria-invalid', 'true'); shortIn.focus(); U.toast(`Das Kürzel «${short}» ist bereits vergeben`, { type: 'err' }); return; }
      const years = yearsOf(c);
      const daysPerYear = {}; for (const y of SW.range(years, 1)) daysPerYear[y] = daysFor(c, y);
      const subjects = subjectsOf(c).map((r) => { const lessons = {}; for (const y of SW.range(years, 1)) lessons[y] = lessonsOf(r, y); return { subjectId: r.subjectId, lessons, block: Number(r.block) === 2 ? 2 : 1 }; });
      const out = { ...c, name, short, years, description: String(c.description || '').trim(), daysPerYear, subjects };
      m.close(); onSave(out);
    };
    const body = h('div.form-grid', { onkeydown: (e) => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); save(); } } },
      h('div.span2', U.field('Name *', nameIn, { hint: 'Vollständige Bezeichnung des Lehrgangs oder Profils' })),
      U.field('Kürzel *', shortIn, { hint: 'Kurzform für Karten und Listen, z.B. «KV EFZ»' }),
      h('div.field', h('label', 'Lehrjahre'), h('div', yearsSeg), yearsHint),
      h('div.span2', U.field('Beschreibung', desc)),
    );
    const m = U.modal({
      title, sub, body,
      footer: [
        onDelete ? h('button.btn.danger.soft.left', { onclick: () => { m.close(); onDelete(); } }, SW.icon('trash'), 'Löschen') : null,
        h('button.btn', { onclick: () => m.close() }, 'Abbrechen'),
        h('button.btn.primary', { onclick: save }, SW.icon('check'), isNew ? 'Lehrgang anlegen' : 'Speichern'),
      ],
    });
    return m;
  }

  function openCreate() {
    const cur = { ...M.newCurriculum(), daysPerYear: {} };
    curForm({ cur, title: 'Lehrgang anlegen', sub: 'Stammdaten – die Lektionentafel wird im nächsten Schritt erfasst.', isNew: true,
      onSave: (out) => { SW.store.add('curricula', out); U.toast(`«${out.name}» angelegt – jetzt die Lektionentafel erfassen`, { type: 'ok' }); goDetail(out.id); } });
  }
  function openEdit(cur, opts) {
    curForm({ cur, title: 'Stammdaten bearbeiten', sub: cur.name, isNew: false,
      onSave: (out) => { SW.store.put('curricula', out); U.toast('Gespeichert', { type: 'ok' }); },
      onDelete: () => deleteCur(cur, opts) });
  }
  function openDuplicate(cur) {
    const state = st();
    const copy = { ...SW.clone(cur), id: SW.uid('c'), name: uniqueName(state, `${cur.name} (Kopie)`), short: uniqueShort(state, cur.short || 'Kopie') };
    curForm({ cur: copy, title: 'Lehrgang duplizieren', sub: `Kopie von «${cur.name}» mit derselben Lektionentafel – Name und Kürzel anpassen.`, isNew: true,
      onSave: (out) => { SW.store.add('curricula', out); U.toast(`«${out.name}» angelegt`, { type: 'ok', action: { label: 'Öffnen', fn: () => goDetail(out.id) } }); } });
  }
  async function deleteCur(cur, { afterDelete } = {}) {
    const kls = classesOf(st(), cur.id);
    const names = kls.map((k) => k.name).slice(0, 6).join(', ') + (kls.length > 6 ? ' …' : '');
    const text = (kls.length ? `${plural(kls.length, 'Klasse', 'Klassen')} (${names}) ${kls.length === 1 ? 'verliert' : 'verlieren'} den Lehrgang und ${kls.length === 1 ? 'hat' : 'haben'} danach keine Lektionentafel mehr. ` : '') + 'Dieser Schritt kann nicht rückgängig gemacht werden.';
    const ok = await U.confirm({ title: `«${cur.name}» löschen?`, text, ok: 'Löschen', danger: true });
    if (!ok) return;
    if (afterDelete) afterDelete();
    SW.store.remove('curricula', cur.id);
    U.toast(`«${cur.name}» gelöscht`);
  }
  function curMenu(anchor, cur, opts) {
    U.menu(anchor, [
      { label: 'Stammdaten bearbeiten', icon: 'edit', fn: () => openEdit(cur, opts) },
      { label: 'Duplizieren', icon: 'copy', fn: () => openDuplicate(cur) },
      'sep',
      { label: 'Löschen', icon: 'trash', danger: true, fn: () => deleteCur(cur, opts) },
    ]);
  }

  // ---------- Vorlagen (leerer Zustand) ----------
  function templateStatus(state, t) {
    const missing = t.subjects.map(([short]) => short).filter((s) => !findSubject(state, s));
    const reqMissing = t.required.filter((s) => !findSubject(state, s));
    const optMissing = missing.filter((s) => !reqMissing.includes(s));
    const exists = state.curricula.some((c) => norm(c.short) === norm(t.short) || norm(c.name) === norm(t.name));
    return { missing, reqMissing, optMissing, ok: !reqMissing.length, exists };
  }
  function buildTemplate(state, t) {
    const subjects = [];
    for (const [short, arr, block] of t.subjects) {
      const s = findSubject(state, short); if (!s) continue;
      const lessons = {}; for (const y of SW.range(t.years, 1)) lessons[y] = Number(arr[y - 1] || 0);
      subjects.push({ subjectId: s.id, lessons, block: Number(block) === 2 ? 2 : 1 });
    }
    return { ...M.newCurriculum(), name: t.name, short: t.short, years: t.years, description: t.description, daysPerYear: { ...t.days }, subjects };
  }
  function createDefaults() {
    const state = st();
    const made = []; const skipped = [];
    for (const t of TEMPLATES) {
      const s = templateStatus(state, t);
      if (s.exists) { skipped.push(`${t.short}: bereits vorhanden`); continue; }
      if (!s.ok) { skipped.push(`${t.short}: Fächer fehlen (${s.reqMissing.join(', ')})`); continue; }
      made.push(buildTemplate(state, t));
    }
    if (!made.length) {
      const text = !state.subjects.length ? 'Zuerst Fächer anlegen – die Standard-Lehrgänge brauchen passende Fächer (z.B. HKB A–E, Sport).' : `Keine Vorlage passt zu den vorhandenen Fächern. ${skipped.join(' · ')}`;
      U.toast(text, { type: 'warn', ms: 7000, action: { label: 'Fächer', fn: () => SW.router.go('#/faecher') } });
      return;
    }
    SW.store.update((s) => { for (const c of made) s.curricula.push(c); }, { coll: 'curricula', op: 'bulk' });
    U.toast(`${plural(made.length, 'Standard-Lehrgang', 'Standard-Lehrgänge')} angelegt` + (skipped.length ? ` · ${skipped.length} übersprungen` : ''), { type: 'ok' });
  }
  function templateOverview(state) {
    return h('div.cu-tpls', TEMPLATES.map((t) => {
      const s = templateStatus(state, t);
      const days = SW.range(t.years, 1).map((y) => t.days[y]).join(' · ');
      return h('div.cu-tpl' + (s.ok && !s.exists ? '' : '.off'),
        h('div.flex.ai-c.g8.wrap', h('b', t.name), h('span.chip.sm.tint', t.short)),
        h('div.d', `${t.years} Lehrjahre · ${t.subjects.length} Fächer · Schultage ${days} · ${t.description}`),
        h('div', s.exists ? h('span.chip.sm', 'Bereits vorhanden') : s.ok ? h('span.chip.sm.ok', SW.icon('check'), s.optMissing.length ? `Fächer vorhanden · ohne ${s.optMissing.join(', ')}` : 'Alle Fächer vorhanden') : h('span.chip.sm.warn', `Es fehlen: ${s.reqMissing.join(', ')}`)));
    }));
  }
  function emptyState(state, edit) {
    return h('div.card.pad.empty.cu-empty',
      h('div.cu-empty-top',
        h('div.big', '🎓'),
        h('h3', 'Noch keine Lehrgänge erfasst'),
        h('p', 'Ein Lehrgang (Profil) legt die Lektionentafel fest: welche Fächer in welchem Lehrjahr wie viele Lektionen pro Woche haben und an wie vielen Tagen die Klassen zur Schule kommen. Jede Klasse verweist auf einen Lehrgang und ihr Lehrjahr – daraus ergibt sich der Bedarf, den der Generator verplant.'),
        edit ? h('div.flex.g8.wrap.jc-c.mt8', h('button.btn.primary', { onclick: openCreate }, SW.icon('plus'), 'Lehrgang anlegen'), h('button.btn', { onclick: createDefaults }, SW.icon('sparkles'), 'Standard-Lehrgänge anlegen')) : h('p.small.faint', 'Lehrgänge werden von der Planung erfasst.'),
        edit ? h('div.tiny.faint', 'Standard: Kaufleute EFZ 2023 (HKB), Kaufleute mit BM1, Kaufleute EBA – nur, wenn passende Fächer vorhanden sind') : null),
      !state.subjects.length ? h('div.mt16', U.banner(h('span', h('b', 'Noch keine Fächer. '), 'Lektionentafeln bestehen aus Fächern – bitte zuerst Fächer anlegen (z.B. HKB A–E, Sport, Deutsch).'), 'warn', { action: h('a.btn.sm', { href: '#/faecher' }, 'Zu den Fächern', SW.icon('arrowRight')) })) : null,
      h('h4', 'Vorlagen'),
      templateOverview(state),
    );
  }

  // ---------- Liste ----------
  function curCard(state, c, edit) {
    const years = yearList(c); const kls = classesOf(state, c.id); const rows = subjectsOf(c);
    const level = worstLevel(analyse(state, c).filter((i) => i.level !== 'info'));
    const card = h('div.card.clickable.cu-card', { tabindex: '0', role: 'link', 'aria-label': c.name, onclick: () => goDetail(c.id), onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goDetail(c.id); } } },
      h('div.cu-top',
        h('span.cu-ic', '🎓'),
        h('div.grow',
          h('div.cu-name', { title: c.name }, c.name || 'Lehrgang'),
          h('div.flex.ai-c.g6.wrap.mt4', h('span.chip.sm.tint', c.short || '–'), h('span.chip.sm', `${years.length} Lehrjahre`),
            level === 'err' ? h('span.chip.sm.err', 'Überbelegt') : !rows.length ? h('span.chip.sm.warn', 'Keine Fächer') : !hasLessons(c) ? h('span.chip.sm.warn', 'Keine Lektionen') : level === 'warn' ? h('span.chip.sm.warn', 'Hinweise') : null))),
      h('p.cu-desc' + (c.description ? '' : '.faint'), { title: c.description || '' }, c.description || 'Keine Beschreibung'),
      h('div.cu-years', years.map((y) => { const total = totalFor(c, y), cap = capFor(state, c, y), d = daysFor(c, y); return h('div.cu-year' + (total > cap ? '.over' : total ? '' : '.zero'), { title: `${y}. Lehrjahr: ${total} Lektionen pro Woche an ${dayWord(d)} (Kapazität ${cap})` }, h('span.cu-ylbl', `${y}. LJ`), h('b', String(total)), h('span.cu-ysub', `Lekt. · ${dayWord(d)}`)); })),
      h('div.cu-meta',
        h('span', { title: 'Fächer in der Lektionentafel' }, SW.icon('book'), plural(rows.length, 'Fach', 'Fächer')),
        h('span', { title: 'Klassen mit diesem Lehrgang' }, SW.icon('users'), kls.length ? plural(kls.length, 'Klasse', 'Klassen') : 'keine Klasse')),
      h('div.cu-foot',
        h('a.btn.sm', { href: '#/lehrgaenge/' + c.id, onclick: (e) => e.stopPropagation() }, SW.icon('edit'), edit ? 'Bearbeiten' : 'Öffnen'),
        edit ? h('button.btn.sm', { onclick: stop(() => openDuplicate(c)) }, SW.icon('copy'), 'Duplizieren') : null,
        edit ? h('button.btn.sm.icon.ghost.cu-del', { 'aria-label': 'Löschen', title: 'Löschen', onclick: stop(() => deleteCur(c)) }, SW.icon('trash')) : null),
    );
    return card;
  }

  function renderList(el, state) {
    const edit = canEdit();
    const list = sortCurricula(state.curricula);
    const actions = edit ? [h('button.btn.primary', { onclick: openCreate }, SW.icon('plus'), 'Lehrgang anlegen')] : [];
    el.append(U.pageHeader({ title: 'Lehrgänge', lead: 'Lehrgänge und Profile mit ihrer Lektionentafel: Fächer, Lektionen pro Woche und Schultage je Lehrjahr. Klassen verweisen auf Lehrgang und Lehrjahr – daraus entsteht der Bedarf für den Generator.', actions }));
    if (!list.length) { el.append(emptyState(state, edit)); return; }

    // Kennzahlen
    const withTafel = list.filter(hasLessons).length;
    const assigned = state.classes.filter((k) => k.curriculumId && D.curriculumOf(state, k.curriculumId));
    const unassigned = state.classes.length - assigned.length;
    const used = SW.uniq(list.flatMap((c) => subjectsOf(c).map((r) => r.subjectId))).filter((sid) => D.subjectOf(state, sid));
    const problems = list.filter((c) => !hasLessons(c) || worstLevel(analyse(state, c)) === 'err' || worstLevel(analyse(state, c)) === 'warn');
    el.append(h('div.grid.c4',
      U.kpi({ label: 'Lehrgänge', icon: '🎓', value: SW.fmtNum(list.length), sub: withTafel === list.length ? 'alle mit Lektionentafel' : `${SW.fmtNum(withTafel)} mit Lektionentafel` }),
      U.kpi({ label: 'Klassen zugeordnet', icon: '👥', value: h('span', SW.fmtNum(assigned.length), h('small', `/ ${SW.fmtNum(state.classes.length)}`)), sub: !state.classes.length ? 'noch keine Klassen erfasst' : unassigned ? `${plural(unassigned, 'Klasse', 'Klassen')} ohne Lehrgang` : 'alle Klassen haben einen Lehrgang', onclick: () => SW.router.go('#/klassen') }),
      U.kpi({ label: 'Fächer in Verwendung', icon: '📘', value: h('span', SW.fmtNum(used.length), h('small', `/ ${SW.fmtNum(state.subjects.length)}`)), sub: 'in Lektionentafeln enthalten', onclick: () => SW.router.go('#/faecher') }),
      U.kpi({ label: 'Prüfung', icon: problems.length ? '⚠️' : '✅', value: problems.length ? SW.fmtNum(problems.length) : '0', sub: problems.length ? `${problems.length === 1 ? 'Lehrgang' : 'Lehrgänge'} mit Überbelegung oder ohne Lektionen` : 'alle Lektionentafeln in Ordnung' }),
    ));
    if (unassigned && edit) el.append(U.banner(h('span', h('b', `${plural(unassigned, 'Klasse', 'Klassen')} ohne Lehrgang. `), 'Ohne Lehrgang hat eine Klasse keine Lektionentafel und wird vom Generator nicht verplant.'), 'warn', { action: h('a.btn.sm', { href: '#/klassen' }, 'Zu den Klassen', SW.icon('arrowRight')) }));

    el.append(h('div.grid.auto', list.map((c) => curCard(state, c, edit))));
  }

  // ---------- Detail: Lektionentafel-Editor ----------
  function renderDetail(el, state, id) {
    const c0 = D.curriculumOf(state, id);
    if (!c0) {
      el.append(U.pageHeader({ title: 'Lehrgänge' }), h('div.card', U.empty({ icon: '🎓', title: 'Lehrgang nicht gefunden', text: 'Dieser Lehrgang existiert nicht oder wurde gelöscht.', action: h('a.btn.primary', { href: '#/lehrgaenge' }, SW.icon('chevronLeft'), 'Zur Übersicht') })));
      return;
    }
    const edit = canEdit();
    const years = yearList(c0);
    const S = D.slotCount(state);
    const kls = SW.sortBy(classesOf(state, id), (k) => Number(k.year) || 0, (k) => k.name);
    const afterDelete = () => SW.router.go('#/lehrgaenge');
    const cur = () => D.curriculumOf(st(), id) || c0;   // immer die aktuelle Fassung aus dem Store lesen
    const refs = { panel: {}, thsub: {}, sum: {}, inputs: {}, hints: h('div.cu-hints') };

    // Kopf
    const rows0 = subjectsOf(c0);
    el.append(h('div.cu-head',
      h('span.cu-ic.lg', '🎓'),
      h('div.grow',
        h('div.tiny.faint', h('a', { href: '#/lehrgaenge' }, 'Lehrgänge'), ' / ', c0.short || c0.name),
        h('h1', c0.name || 'Lehrgang'),
        h('div.chips',
          h('span.chip.tint', c0.short || '–'),
          h('span.chip', SW.icon('layers'), `${years.length} Lehrjahre`),
          h('span.chip', SW.icon('book'), plural(rows0.length, 'Fach', 'Fächer')),
          h('span.chip', SW.icon('users'), kls.length ? plural(kls.length, 'Klasse', 'Klassen') : 'keine Klasse')),
        c0.description ? h('p.cu-lead', c0.description) : null),
      h('div.actions',
        h('a.btn', { href: '#/lehrgaenge' }, SW.icon('chevronLeft'), 'Zurück'),
        edit ? h('button.btn.primary', { onclick: () => openEdit(cur(), { afterDelete }) }, SW.icon('edit'), 'Stammdaten') : null,
        edit ? h('button.btn.icon', { 'aria-label': 'Weitere Aktionen', title: 'Weitere Aktionen', onclick: (e) => curMenu(e.currentTarget, cur(), { afterDelete }) }, SW.icon('more')) : null),
    ));

    // Schultage und Kapazität je Lehrjahr
    const panels = h('div.cu-ypanels');
    for (const y of years) {
      const sel = U.select(SW.range(MAX_DAYS, 1).map((n) => ({ value: n, label: `${dayWord(n)} pro Woche` })), daysFor(c0, y), (v) => { quietUpdate(id, (c) => { c.daysPerYear = { ...(c.daysPerYear || {}) }; c.daysPerYear[y] = SW.clamp(Number(v) || 1, 1, MAX_DAYS); }); updateSums(); }, { cls: 'sm' });
      sel.setAttribute('aria-label', `Schultage ${y}. Lehrjahr`);
      if (!edit) sel.disabled = true;
      const inYear = kls.filter((k) => Number(k.year) === y);
      const meter = h('div'); const txt = h('div.small.muted');
      const panel = h('div.cu-ypanel',
        h('div.cu-yhead', h('b', `${y}. Lehrjahr`), h('span.chip.sm', { title: inYear.length ? inYear.map((k) => k.name).join(', ') : '' }, inYear.length ? plural(inYear.length, 'Klasse', 'Klassen') : 'keine Klasse')),
        U.field('Schultage', sel),
        h('div.cu-ycap', meter, txt));
      refs.panel[y] = { panel, meter, txt };
      panels.append(panel);
    }
    el.append(U.card({ title: 'Schultage pro Lehrjahr', icon: '🗓️', sub: `Kapazität = Schultage × ${S} Lektionen pro Tag. Klassen legen die konkreten Wochentage selbst fest.`, body: panels }));

    // Lektionentafel
    const tblHost = h('div.tbl-wrap');
    const addHost = h('div');
    const cardBody = h('div', tblHost, addHost, refs.hints);
    el.append(U.card({ title: 'Lektionentafel', icon: '📘', sub: 'Lektionen pro Woche je Fach und Lehrjahr. Änderungen werden beim Verlassen des Feldes gespeichert.', body: cardBody }));

    // Ein Zahlenfeld: 0–12, speichern per onchange, Enter springt zur nächsten Zeile derselben Spalte
    const lessonInput = (r, y, s) => {
      const inp = U.input({ type: 'number', min: 0, max: MAX_LESSONS, step: 1, value: lessonsOf(r, y), cls: 'sm.cu-num', disabled: !edit, onchange: (v, elI) => onLessonChange(r.subjectId, y, v, elI) });
      inp.setAttribute('aria-label', `${s?.name || 'Fach'}, ${y}. Lehrjahr`); inp.dataset.sid = r.subjectId; inp.dataset.year = String(y);
      inp.addEventListener('focus', () => inp.select());
      inp.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        if (e.key === 'Enter' || e.altKey) {
          e.preventDefault();
          const order = subjectsOf(cur()).map((x) => x.subjectId); const i = order.indexOf(r.subjectId);
          const next = refs.inputs[order[i + (e.key === 'ArrowUp' ? -1 : 1)] + ':' + y];
          if (next) next.focus(); else inp.blur();
        }
      });
      refs.inputs[r.subjectId + ':' + y] = inp;
      return inp;
    };
    function onLessonChange(sid, y, v, inp) {
      const r = subjectsOf(cur()).find((x) => x.subjectId === sid); if (!r) return;
      const prev = lessonsOf(r, y);
      const n = v === '' ? 0 : Number(v);
      if (!Number.isFinite(n) || n < 0 || n > MAX_LESSONS || Math.round(n) !== n) { inp.value = prev; U.toast(`Bitte eine ganze Zahl von 0 bis ${MAX_LESSONS} eingeben`, { type: 'err' }); return; }
      inp.value = n;
      if (n === prev) return;
      quietUpdate(id, (c) => { const row = subjectsOf(c).find((x) => x.subjectId === sid); if (!row) return; row.lessons = { ...(row.lessons || {}) }; row.lessons[y] = n; });
      updateSums();
    }
    function onBlockChange(sid, block) {
      quietUpdate(id, (c) => { const row = subjectsOf(c).find((x) => x.subjectId === sid); if (row) row.block = block === 2 ? 2 : 1; });
      updateSums();
    }
    async function removeSubject(sid) {
      const s = D.subjectOf(st(), sid);
      const ok = await U.confirm({ title: `«${s?.name || 'Fach'}» aus der Lektionentafel entfernen?`, text: 'Die Lektionen dieses Fachs werden in allen Lehrjahren entfernt. Klassen mit diesem Lehrgang haben das Fach danach nicht mehr im Bedarf.', ok: 'Entfernen', danger: true });
      if (!ok) return;
      SW.store.update((st2) => { const c = st2.curricula.find((x) => x.id === id); if (c) c.subjects = subjectsOf(c).filter((x) => x.subjectId !== sid); }, { coll: 'curricula', id, op: 'patch' });
      U.toast(`«${s?.name || 'Fach'}» entfernt`);
    }
    function addSubject(sid) {
      const s = D.subjectOf(st(), sid); if (!s) return;
      if (subjectsOf(cur()).some((x) => x.subjectId === sid)) { U.toast(`«${s.name}» ist bereits in der Lektionentafel`, { type: 'warn' }); return; }
      const lessons = {}; for (const y of years) lessons[y] = 0;
      SW.store.update((st2) => { const c = st2.curricula.find((x) => x.id === id); if (!c) return; c.subjects = [...subjectsOf(c), { subjectId: sid, lessons, block: Number(s.block) === 2 ? 2 : 1 }]; }, { coll: 'curricula', id, op: 'patch' });
      // Nach dem Neu-Rendern das erste Zahlenfeld der neuen Zeile fokussieren
      setTimeout(() => { const inp = document.querySelector(`.cu-tbl input[data-sid="${CSS_escape(sid)}"][data-year="${years[0]}"]`); if (inp) { inp.focus(); inp.scrollIntoView({ block: 'center', behavior: 'smooth' }); } }, 0);
    }
    const CSS_escape = (s) => (globalThis.CSS && CSS.escape ? CSS.escape(s) : String(s).replace(/["\\]/g, '\\$&'));

    function buildTable() {
      const c = cur(); const rows = subjectsOf(c);
      const thead = h('thead', h('tr',
        h('th', 'Fach'),
        years.map((y) => { const sub = h('span.cu-thsub'); refs.thsub[y] = sub; return h('th.y', `${y}. LJ`, sub); }),
        h('th', 'Lektionsform'),
        h('th', '')));
      const tbody = h('tbody');
      if (!rows.length) tbody.append(h('tr', h('td', { colspan: years.length + 3 }, h('div.empty', { style: { padding: '26px 12px' } }, h('div.big', '📘'), h('h3', 'Noch keine Fächer in der Lektionentafel'), h('p', edit ? (st().subjects.length ? 'Unten ein Fach wählen und hinzufügen – danach die Lektionen pro Woche je Lehrjahr eintragen.' : 'Zuerst Fächer anlegen, dann hier die Lektionen pro Woche je Lehrjahr eintragen.') : 'Für diesen Lehrgang sind noch keine Fächer hinterlegt.')))));
      for (const r of rows) {
        const s = D.subjectOf(st(), r.subjectId);
        const tr = h('tr' + (s ? '' : '.cu-missing'), { dataset: { sid: r.subjectId } });
        tr.append(h('td.cu-subj', h('div.flex.ai-c.g8.wrap', U.subjectTag(s), s ? h('span.chip.sm', s.short) : h('span.chip.sm.err', 'Fach gelöscht')), s && s.roomReq && s.roomReq !== 'any' ? h('div.tiny.faint.mt4', 'Raum: ' + M.roomReq(s.roomReq).name) : null));
        for (const y of years) tr.append(h('td.y', lessonInput(r, y, s)));
        const block = blockOf(st(), r);
        tr.append(h('td', edit ? U.seg([{ value: 1, label: 'Einzel' }, { value: 2, label: 'Doppel' }], block, (v) => onBlockChange(r.subjectId, Number(v)), { sm: true }) : h('span.chip.sm', block === 2 ? 'Doppellektion' : 'Einzellektion')));
        tr.append(h('td.act', edit ? h('button.btn.icon.ghost.sm', { 'aria-label': 'Fach entfernen', title: 'Aus der Lektionentafel entfernen', onclick: () => removeSubject(r.subjectId) }, SW.icon('trash')) : null));
        tbody.append(tr);
      }
      const tfoot = h('tfoot', h('tr',
        h('td', 'Total pro Woche', h('div.tiny.faint', { style: { fontWeight: '400' } }, 'Summe / Kapazität')),
        years.map((y) => { const td = h('td.y.num'); refs.sum[y] = td; return td; }),
        h('td', ''), h('td', '')));
      SW.mount(tblHost, h('table.tbl.cu-tbl', thead, tbody, tfoot));

      // Fach hinzufügen
      SW.clear(addHost);
      if (edit) {
        const inTafel = new Set(rows.map((r) => r.subjectId));
        const avail = SW.sortBy(st().subjects.filter((s) => !inTafel.has(s.id)), (s) => s.name.toLowerCase());
        if (!st().subjects.length) addHost.append(h('div.cu-add', h('span.small.muted.grow', 'Noch keine Fächer vorhanden.'), h('a.btn.sm', { href: '#/faecher' }, 'Fächer anlegen', SW.icon('arrowRight'))));
        else if (!avail.length) addHost.append(h('div.cu-add', h('span.small.muted', 'Alle vorhandenen Fächer sind in der Lektionentafel enthalten.')));
        else {
          const addBtn = h('button.btn.sm.primary', { disabled: true }, SW.icon('plus'), 'Hinzufügen');
          const sel = U.select(avail.map((s) => ({ value: s.id, label: `${s.name} (${s.short})` })), '', (v) => { addBtn.disabled = !v; }, { placeholder: 'Fach wählen …', cls: 'sm' });
          sel.setAttribute('aria-label', 'Fach hinzufügen');
          addBtn.addEventListener('click', () => { if (sel.value) addSubject(sel.value); });
          sel.addEventListener('keydown', (e) => { if (e.key === 'Enter' && sel.value) { e.preventDefault(); addSubject(sel.value); } });
          addHost.append(h('div.cu-add', h('span.lbl', 'Fach hinzufügen'), sel, addBtn, h('span.tiny.faint', `${avail.length} verfügbar`)));
        }
      }
      updateSums();
    }

    // Nur Summen, Kapazität, Markierungen und Hinweise aktualisieren – kein Neu-Rendern, Fokus bleibt erhalten
    function updateSums() {
      const c = cur(); const state2 = st();
      const issues = analyse(state2, c);
      for (const y of years) {
        const total = totalFor(c, y), cap = capFor(state2, c, y), days = daysFor(c, y);
        const over = total > cap, full = total === cap && total > 0;
        const p = refs.panel[y];
        if (p) {
          p.panel.classList.toggle('over', over);
          SW.mount(p.meter, U.meter(cap ? total / cap : 0, { label: `${total} / ${cap}`, cls: over ? 'err' : full ? 'warn' : 'ok' }));
          SW.mount(p.txt, over ? h('span.err-c', `${total - cap} ${total - cap === 1 ? 'Lektion' : 'Lektionen'} zu viel für ${dayWord(days)}`) : full ? h('span.warn-c', 'Schultage voll belegt – kein Spielraum') : `${plural(total, 'Lektion', 'Lektionen')} pro Woche · ${cap - total} frei`);
        }
        if (refs.thsub[y]) SW.mount(refs.thsub[y], `${dayWord(days)} · ${cap} Plätze`);
        const td = refs.sum[y];
        if (td) { td.classList.toggle('cu-over', over); SW.mount(td, h('b', String(total)), h('span.faint', { style: { fontWeight: '400' } }, ` / ${cap}`)); td.title = over ? `${total - cap} über der Kapazität` : `${cap - total} frei`; }
      }
      for (const [key, inp] of Object.entries(refs.inputs)) {
        const [sid, y] = key.split(':');
        const r = subjectsOf(c).find((x) => x.subjectId === sid);
        const odd = !!r && blockOf(state2, r) === 2 && lessonsOf(r, Number(y)) % 2 === 1;
        inp.classList.toggle('cu-odd', odd);
        inp.title = odd ? 'Ungerade Anzahl bei Doppellektionen – eine Lektion bleibt einzeln' : '';
      }
      const rows = subjectsOf(c);
      SW.mount(refs.hints,
        !rows.length ? null
          : issues.length ? issues.map((i) => h('div.cu-hint.' + (i.level === 'err' ? 'err' : i.level === 'warn' ? 'warn' : 'info'), h('span.dot.' + (i.level === 'err' ? 'err' : i.level === 'warn' ? 'warn' : 'tint')), h('span.grow', i.text)))
          : h('div.cu-hint.ok', h('span.dot.ok'), h('span.grow', 'Lektionentafel in Ordnung: keine Überbelegung, Doppellektionen gehen auf.')));
    }
    buildTable();

    // Klassen mit diesem Lehrgang
    const klsBody = kls.length
      ? h('ul.list.cu-kls', kls.map((k) => {
        const y = Number(k.year) || 0; const need = D.classLessonCount(state, k); const sd = k.schoolDays || [];
        const want = years.includes(y) ? daysFor(c0, y) : null;
        return h('li',
          h('span.cu-ic.sm', '👥'),
          h('div.grow', h('a.ttl', { href: '#/klassen/' + k.id }, k.name), h('div.sub', `${y ? y + '. Lehrjahr' : 'Lehrjahr offen'} · ${plural(k.size || 0, 'Lernende', 'Lernende')} · Schultage: ${sd.length ? sd.map((d) => M.dayName(d, true)).join(', ') : '–'}`)),
          h('div.flex.g6.wrap.jc-e',
            h('span.chip.sm', { title: 'Lektionen pro Woche aus Lehrgang und Zusatzlektionen' }, `${need} Lekt.`),
            !years.includes(y) ? h('span.chip.sm.err', { title: 'Der Lehrgang hat dieses Lehrjahr nicht' }, 'Lehrjahr ausserhalb') : null,
            want != null && sd.length && sd.length !== want ? h('span.chip.sm.warn', { title: `Lehrgang sieht ${dayWord(want)} vor` }, `${sd.length} statt ${want} Schultage`) : null,
            want != null && !sd.length ? h('span.chip.sm.warn', 'keine Schultage') : null),
          h('a.btn.icon.ghost.sm', { href: '#/klassen/' + k.id, 'aria-label': 'Klasse öffnen', title: 'Klasse öffnen' }, SW.icon('chevronRight')));
      }))
      : U.empty({ icon: '👥', title: 'Keine Klasse mit diesem Lehrgang', text: 'Der Lehrgang wird bei der Klasse zusammen mit dem Lehrjahr festgelegt. Erst dann entsteht aus der Lektionentafel ein Bedarf für den Generator.', action: edit ? h('a.btn.sm', { href: '#/klassen' }, 'Zu den Klassen', SW.icon('arrowRight')) : null });
    el.append(U.card({ title: 'Klassen mit diesem Lehrgang', icon: '👥', sub: kls.length ? plural(kls.length, 'Klasse', 'Klassen') : null, body: klsBody, actions: kls.length ? [h('a.btn.sm', { href: '#/klassen' }, SW.icon('users'), 'Alle Klassen')] : null }));
  }

  // ---------- Registrierung ----------
  let unsub = null;
  const subscribe = () => {
    if (unsub) return;
    unsub = SW.store.on((state, meta = {}) => {
      if (meta.quiet) return;                                    // eigene Zellen-Änderungen: nur Summen aktualisiert
      if (meta.op === 'notify' || (meta.op === 'setting' && meta.key === 'theme')) return;
      if (SW.router.current?.route !== 'lehrgaenge') return;
      SW.router.refresh();
    });
  };

  SW.views['lehrgaenge'] = {
    title: 'Lehrgänge', manualRefresh: true,
    render(el, params) {
      U.injectCSS('lehrgaenge', CSS);
      subscribe();
      const state = st();
      if (params && params.id) renderDetail(el, state, params.id);
      else renderList(el, state);
    },
    onLeave() { if (unsub) { unsub(); unsub = null; } },
  };
})();
