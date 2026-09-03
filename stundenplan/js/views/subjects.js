/* STUNDENWERK · views/subjects.js — Fächer.
   Route:  #/faecher   Kennzahlen, Tabelle mit Suche und Filtern, Anlegen / Bearbeiten / Löschen im Modal,
                       Standardfächer für den leeren Zustand.
   Schreibt ausschliesslich über SW.store (add/put/remove/update); der Router rendert danach neu.
   Eigene CSS-Klassen mit Präfix .sj- (per SW.ui.injectCSS). */
(function () {
  const SW = (globalThis.SW = globalThis.SW || {});
  SW.views = SW.views || {};
  const h = SW.h; const M = SW.model; const U = SW.ui; const D = SW.domain;

  const CSS = `
.sj-toolbar select.inp{width:auto;min-width:168px;max-width:250px}
.sj-toolbar .sj-count{font-size:13px;color:var(--txt-3);white-space:nowrap;font-variant-numeric:tabular-nums}
@media (max-width:600px){.sj-toolbar .search{max-width:none;flex-basis:100%}.sj-toolbar select.inp{flex:1;min-width:0;max-width:none}.sj-toolbar .sj-count{display:none}}
.sj-kpi-warn .val{color:var(--warn)}
.sj-kpi-ok .val{color:var(--ok)}
.sj-tbl th,.sj-tbl td{padding-left:10px;padding-right:10px}
.sj-tbl td.sj-name{min-width:210px;max-width:420px}
.sj-tbl td.sj-name .subj{align-items:flex-start;line-height:1.3}
.sj-tbl td.sj-name .subj i{margin-top:5px}
.sj-tbl td.sj-room{min-width:130px}
.sj-tbl td.sj-nowrap{white-space:nowrap}
@media (min-width:981px) and (max-width:1330px){.sj-tbl .sj-cat{display:none}}
.sj-short{display:inline-block;font-family:var(--ff-num);font-size:12.5px;font-weight:650;background:var(--card-3);color:var(--txt-2);padding:2px 7px;border-radius:6px;white-space:nowrap;letter-spacing:.01em}
.sj-avs{display:inline-flex;align-items:center;padding-left:4px}
.sj-avs .av{margin-left:-7px;border:2px solid var(--card);box-sizing:content-box}
.sj-avs .av:first-child{margin-left:-4px}
.sj-preview{display:flex;flex-wrap:wrap;gap:12px 16px;align-items:center;padding:12px 14px;border-radius:var(--r-s);background:var(--card-2);min-width:0}
.sj-preview .ls{flex:none;width:156px;min-height:56px;cursor:default}
.sj-preview .sj-prev-meta{display:flex;flex-direction:column;gap:6px;min-width:0;flex:1 1 150px}
.sj-preview .sj-prev-tag{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;min-width:0}
.sj-preview .sj-prev-tag .subj{min-width:0;align-items:flex-start;line-height:1.3}
.sj-preview .sj-prev-tag .subj i{margin-top:5px}
.sj-usage{display:grid;grid-template-columns:auto 1fr;gap:8px 14px;align-items:center;font-size:13px;padding:12px 14px;border-radius:var(--r-s);background:var(--card-2)}
.sj-usage .k{color:var(--txt-3);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap}
.sj-usage .v{display:flex;flex-wrap:wrap;gap:6px;align-items:center;min-width:0}
.sj-usage a.chip:hover{text-decoration:none;background:var(--tint-soft);color:var(--tint-txt)}
.sj-empty{align-items:stretch}
.sj-empty .sj-empty-top{display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px}
.sj-empty .sj-empty-top p{max-width:58ch;color:var(--txt-2)}
.sj-empty h4{margin-top:22px;margin-bottom:10px}
.sj-defaults{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;text-align:left;width:100%}
.sj-default{display:flex;gap:10px;align-items:center;padding:9px 12px;border-radius:var(--r-s);background:var(--card-2);font-size:13px;min-width:0}
.sj-default .subj{min-width:0;flex:1}
.sj-default .subj span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
`;

  // Kategorien der Fächer
  const CATEGORIES = [
    { id: 'allgemein', name: 'Allgemeinbildung', icon: '📚' },
    { id: 'sprache', name: 'Sprachen', icon: '🗣️' },
    { id: 'beruf', name: 'Berufskunde', icon: '💼' },
    { id: 'sport', name: 'Sport', icon: '🏀' },
    { id: 'bm', name: 'Berufsmaturität', icon: '🎓' },
    { id: 'kv2023', name: 'Kaufleute 2023', icon: '🧭' },
    { id: 'wahl', name: 'Wahlbereich', icon: '⭐' },
  ];
  const catOf = (id) => CATEGORIES.find((c) => c.id === id) || { id: id || '', name: id ? SW.cap(String(id)) : 'Ohne Kategorie', icon: '📘' };

  // Standardfächer für den leeren Zustand
  const DEFAULTS = [
    { name: 'Wirtschaft & Gesellschaft', short: 'W&G', color: '#3B5BDB', roomReq: 'any', block: 2, category: 'beruf' },
    { name: 'Deutsch', short: 'D', color: '#DC2626', roomReq: 'any', block: 1, category: 'sprache' },
    { name: 'Französisch', short: 'F', color: '#0891B2', roomReq: 'any', block: 1, category: 'sprache' },
    { name: 'Englisch', short: 'E', color: '#7C3AED', roomReq: 'any', block: 1, category: 'sprache' },
    { name: 'IKA (Information, Kommunikation, Administration)', short: 'IKA', color: '#0E9F6E', roomReq: 'informatik', block: 2, category: 'beruf' },
    { name: 'Sport', short: 'SP', color: '#EA580C', roomReq: 'turnhalle', block: 2, category: 'sport' },
    { name: 'Allgemeinbildung (ABU)', short: 'ABU', color: '#DB2777', roomReq: 'any', block: 2, category: 'allgemein' },
  ];

  // Filterzustand der Liste – überlebt das Neu-Rendern nach Store-Änderungen
  const L = { q: '', cat: '', only: '' };
  const ONLY = [
    { value: 'hint', label: 'Mit Hinweisen' },
    { value: 'noTeacher', label: 'Ohne Lehrperson' },
    { value: 'noRoom', label: 'Ohne passenden Raum' },
    { value: 'unused', label: 'In keinem Lehrgang' },
  ];

  // ---------- Helfer ----------
  const st = () => SW.store.state;
  const canEdit = () => st().settings.role !== 'teacher';
  const byName = (a, b) => String(a).localeCompare(String(b), 'de', { numeric: true, sensitivity: 'base' });
  const plural = (n, one, many) => `${SW.fmtNum(n)} ${n === 1 ? one : many}`;
  const norm = (s) => String(s || '').trim().toLowerCase();
  const stop = (fn) => (e) => { e.stopPropagation(); e.preventDefault(); fn(e); };
  const nameExists = (state, name, exceptId) => state.subjects.some((s) => s.id !== exceptId && norm(s.name) === norm(name));
  const shortExists = (state, short, exceptId) => state.subjects.some((s) => s.id !== exceptId && norm(s.short) === norm(short));
  const roomsFor = (state, req) => state.rooms.filter((r) => r.active !== false && req.types.includes(r.type));

  // Nächste unbenutzte Farbe der Palette; sind alle vergeben, die am seltensten verwendete
  const nextColor = (state) => {
    const used = state.subjects.map((s) => String(s.color || '').toUpperCase());
    const free = M.COLORS.find((c) => !used.includes(c.toUpperCase()));
    if (free) return free;
    const count = (c) => used.filter((u) => u === c.toUpperCase()).length;
    return [...M.COLORS].sort((a, b) => count(a) - count(b))[0];
  };

  // Kurzname aus dem Namen vorschlagen: «Wirtschaft & Gesellschaft» → W&G, «Allgemeinbildung (ABU)» → ABU, «HKB A · …» → HKB A, «Deutsch» → DE
  const STOP = new Set(['und', 'oder', 'der', 'die', 'das', 'des', 'dem', 'den', 'in', 'im', 'von', 'vom', 'mit', 'für', 'fuer', 'an', 'am', 'auf', 'zu', 'zur', 'zum', 'inkl', 'the', 'of', 'and']);
  function suggestShort(name) {
    const full = String(name || '').trim();
    if (!full) return '';
    const par = full.match(/\(([^)]*)\)/);
    if (par && /^[A-ZÄÖÜ0-9&-]{1,6}$/.test(par[1].trim())) return par[1].trim();
    const base = full.split(/\s[·–—/-]\s/)[0].replace(/\([^)]*\)/g, '').trim();
    if (!base) return full.slice(0, 6).toUpperCase();
    if (base.length <= 6 && base === base.toUpperCase()) return base;
    const hasAmp = /&|\bund\b/i.test(base);
    const words = base.split(/[\s,/]+/).map((w) => w.replace(/^-+|-+$/g, '')).filter((w) => w && w !== '&' && !STOP.has(w.toLowerCase()));
    if (!words.length) return base.slice(0, 6).toUpperCase();
    if (words.length === 1) { const w = words[0]; return /^[A-ZÄÖÜ0-9]+$/.test(w) && w.length <= 6 ? w : w.slice(0, 2).toUpperCase(); }
    const initials = words.map((w) => w[0].toUpperCase());
    if (hasAmp && initials.length === 2) return initials.join('&');
    return initials.join('').slice(0, 6);
  }

  // Kennzahlen je Fach: Lektionen pro Woche über alle Klassen, Klassen, Lehrgänge, qualifizierte Lehrpersonen, Raumsituation
  function analyse(state) {
    const per = {};
    const info = (id) => (per[id] = per[id] || { lessons: 0, classes: new Set(), curricula: [], teachers: [], roomMissing: false });
    for (const k of state.classes) for (const r of D.classRequirements(state, k)) { const i = info(r.subjectId); i.lessons += r.lessons; i.classes.add(k.id); }
    for (const s of state.subjects) {
      const i = info(s.id);
      i.curricula = state.curricula.filter((c) => (c.subjects || []).some((x) => x.subjectId === s.id));
      i.teachers = D.qualifiedTeachers(state, s.id);
      i.roomMissing = !roomsFor(state, M.roomReq(s.roomReq || 'any')).length;
      i.hint = !i.teachers.length || i.roomMissing;
    }
    return per;
  }

  // ---------- Bausteine ----------
  const shortBadge = (s) => h('span.sj-short', s.short || '–');
  const catChip = (id) => { const c = catOf(id); return h('span.chip.sm', { title: 'Kategorie' }, h('span', c.icon), c.name); };
  const avatarStack = (teachers, max = 3) => {
    const shown = teachers.slice(0, max);
    return h('span.sj-avs', { title: teachers.map((t) => D.teacherLabel(t)).join(', ') }, shown.map((t) => U.avatar(t, 'xs')));
  };
  const previewCard = (s) => h('div.ls', { style: { '--c': s.color || '#888' } }, h('b', s.name || 'Fachname'), h('div.m', h('span', `${s.short || 'Kurz'} · ${M.roomReq(s.roomReq || 'any').name}`)));

  // ---------- Formular: Fach anlegen / bearbeiten ----------
  function subjectForm({ subject, title, sub, isNew, onSave, onDelete }) {
    const state = st();
    const s = SW.clone(subject);
    s.block = Number(s.block) === 2 ? 2 : 1;
    let shortTouched = !isNew && !!String(s.short || '').trim();

    // Vorschau
    const prevHost = h('div.sj-prev-card');
    const prevTag = h('div.sj-prev-tag');
    const rePreview = () => { SW.mount(prevHost, previewCard(s)); SW.mount(prevTag, U.subjectTag({ name: s.name || 'Fachname', color: s.color }), shortBadge(s)); };
    const preview = h('div.sj-preview', prevHost, h('div.sj-prev-meta', prevTag, h('div.tiny.faint', 'So erscheint das Fach im Stundenplan.')));

    const nameIn = U.input({ value: s.name, placeholder: 'z.B. Wirtschaft & Gesellschaft', oninput: (v) => { s.name = v; nameIn.removeAttribute('aria-invalid'); if (!shortTouched) { s.short = suggestShort(v); shortIn.value = s.short; } rePreview(); } });
    const shortIn = U.input({ value: s.short, placeholder: 'z.B. W&G', oninput: (v) => { s.short = v; shortIn.removeAttribute('aria-invalid'); shortTouched = !!v.trim(); if (!shortTouched) { s.short = suggestShort(s.name); shortIn.value = s.short; } rePreview(); } });
    shortIn.setAttribute('maxlength', '6'); shortIn.setAttribute('autocapitalize', 'characters'); shortIn.setAttribute('spellcheck', 'false');
    const colorPick = U.colorPicker(s.color, (c) => { s.color = c; rePreview(); });
    const roomHint = h('div.hint');
    const reRoomHint = () => { const req = M.roomReq(s.roomReq || 'any'); const n = roomsFor(state, req).length; SW.mount(roomHint, n ? `${plural(n, 'passender Raum', 'passende Räume')} vorhanden` : h('span.warn-c', state.rooms.length ? 'Kein passender Raum erfasst – der Generator kann dieses Fach nicht platzieren.' : 'Noch keine Räume erfasst.')); };
    const roomSel = U.select(M.ROOM_REQ.map((r) => ({ value: r.id, label: r.name })), s.roomReq || 'any', (v) => { s.roomReq = v || 'any'; reRoomHint(); rePreview(); });
    const blockSeg = U.seg([{ value: 1, label: 'Einzellektion' }, { value: 2, label: 'Doppellektion' }], s.block, (v) => (s.block = Number(v)));
    const catSel = U.select(CATEGORIES.map((c) => ({ value: c.id, label: `${c.icon}  ${c.name}` })), CATEGORIES.some((c) => c.id === s.category) ? s.category : 'allgemein', (v) => (s.category = v || 'allgemein'));
    if (!CATEGORIES.some((c) => c.id === s.category)) s.category = 'allgemein';
    reRoomHint(); rePreview();

    const save = () => {
      const name = String(s.name || '').trim();
      const short = String(s.short || '').trim();
      if (!name) { nameIn.setAttribute('aria-invalid', 'true'); nameIn.focus(); U.toast('Bitte einen Namen eingeben', { type: 'err' }); return; }
      if (nameExists(st(), name, isNew ? null : s.id)) { nameIn.setAttribute('aria-invalid', 'true'); nameIn.focus(); U.toast(`Es gibt bereits ein Fach «${name}»`, { type: 'err' }); return; }
      if (!short) { shortIn.setAttribute('aria-invalid', 'true'); shortIn.focus(); U.toast('Bitte einen Kurznamen eingeben', { type: 'err' }); return; }
      if ([...short].length > 6) { shortIn.setAttribute('aria-invalid', 'true'); shortIn.focus(); U.toast('Der Kurzname darf höchstens 6 Zeichen haben', { type: 'err' }); return; }
      if (shortExists(st(), short, isNew ? null : s.id)) { shortIn.setAttribute('aria-invalid', 'true'); shortIn.focus(); U.toast(`Der Kurzname «${short}» ist bereits vergeben`, { type: 'err' }); return; }
      const out = { ...s, name, short, color: s.color || M.COLORS[0], roomReq: M.roomReq(s.roomReq || 'any').id, block: s.block === 2 ? 2 : 1, category: s.category || 'allgemein' };
      m.close(); onSave(out);
    };

    // Verwendung (nur bestehende Fächer)
    let usage = null;
    if (!isNew) {
      const i = analyse(state)[s.id];
      const curChips = i.curricula.length ? i.curricula.map((c) => h('a.chip.sm', { href: '#/lehrgaenge/' + c.id, title: c.name, onclick: () => m.close() }, c.short || c.name)) : [h('span.faint', 'In keinem Lehrgang – erscheint in keiner Lektionentafel.')];
      const tChips = i.teachers.length ? i.teachers.map((t) => U.teacherPill(t)) : [h('span.chip.sm.warn', 'keine Lehrperson'), h('span.faint.small', 'Fach bei einer Lehrperson hinterlegen.')];
      usage = h('div.sj-usage',
        h('span.k', 'Lehrgänge'), h('div.v', curChips),
        h('span.k', 'Lehrpersonen'), h('div.v', tChips),
        h('span.k', 'Bedarf'), h('div.v', h('span', i.lessons ? `${plural(i.lessons, 'Lektion', 'Lektionen')} pro Woche in ${plural(i.classes.size, 'Klasse', 'Klassen')}` : 'Aktuell keine Lektionen in den Klassen.')),
      );
    }

    const body = h('div.col.g16', { onkeydown: (e) => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); save(); } } },
      preview,
      h('div.form-grid',
        h('div.span2', U.field('Name *', nameIn, { hint: 'Vollständige Bezeichnung, z.B. wie in der Lektionentafel' })),
        U.field('Kurzname *', shortIn, { hint: 'Höchstens 6 Zeichen – wird aus dem Namen vorgeschlagen' }),
        h('div.field', h('label', 'Kategorie'), catSel, h('div.hint', 'Zum Gruppieren und Filtern')),
        h('div.span2', U.field('Farbe', colorPick, { hint: 'Kennfarbe im Stundenplan' })),
        h('div.field', h('label', 'Raumbedarf'), roomSel, roomHint),
        U.field('Lektionsform', blockSeg, { hint: 'Standard für Lehrgänge; dort pro Fach übersteuerbar' }),
      ),
      usage,
    );
    const m = U.modal({
      title, sub, body,
      footer: [
        onDelete ? h('button.btn.danger.soft.left', { onclick: () => { m.close(); onDelete(); } }, SW.icon('trash'), 'Löschen') : null,
        h('button.btn', { onclick: () => m.close() }, 'Abbrechen'),
        h('button.btn.primary', { onclick: save }, SW.icon('check'), isNew ? 'Fach anlegen' : 'Speichern'),
      ],
    });
    return m;
  }

  function openCreate() {
    const subject = { ...M.newSubject(), color: nextColor(st()) };
    subjectForm({ subject, title: 'Fach anlegen', sub: 'Ein Fach, das in Lektionentafeln der Lehrgänge und bei Lehrpersonen verwendet wird.', isNew: true,
      onSave: (s) => { SW.store.add('subjects', s); U.toast(`«${s.name}» angelegt`, { type: 'ok' }); } });
  }
  function openEdit(subject) {
    subjectForm({ subject, title: 'Fach bearbeiten', sub: subject.name, isNew: false,
      onSave: (s) => { SW.store.put('subjects', s); U.toast('Gespeichert', { type: 'ok' }); },
      onDelete: () => deleteSubject(subject) });
  }
  async function deleteSubject(subject) {
    const state = st();
    const i = analyse(state)[subject.id] || { curricula: [], teachers: [], classes: new Set(), lessons: 0 };
    const extra = state.classes.filter((k) => (k.extraLessons || []).some((e) => e.subjectId === subject.id)).length;
    const inPlan = SW.sum(D.lessonsFor(state.timetable).filter((l) => l.subjectId === subject.id), (l) => l.len || 1);
    const hints = [];
    if (i.curricula.length) hints.push(`Wird in ${plural(i.curricula.length, 'Lehrgang', 'Lehrgängen')} verwendet (${i.curricula.map((c) => c.short || c.name).join(', ')}) – das Fach wird aus den Lektionentafeln entfernt.`);
    else hints.push('Wird in keinem Lehrgang verwendet.');
    if (i.teachers.length) hints.push(`${plural(i.teachers.length, 'Lehrperson verliert', 'Lehrpersonen verlieren')} die Qualifikation für dieses Fach.`);
    if (extra) hints.push(`Zusatzlektionen in ${plural(extra, 'Klasse', 'Klassen')} werden entfernt.`);
    if (inPlan) hints.push(`${plural(inPlan, 'Lektion', 'Lektionen')} im aktuellen Stundenplan werden gelöscht.`);
    const ok = await U.confirm({ title: `«${subject.name}» löschen?`, text: hints.join(' ') + ' Dieser Schritt kann nicht rückgängig gemacht werden.', ok: 'Löschen', danger: true });
    if (!ok) return;
    SW.store.remove('subjects', subject.id);
    U.toast(`«${subject.name}» gelöscht`);
  }

  // Standardfächer anlegen (bereits vorhandene Namen/Kurznamen werden übersprungen)
  function createDefaults() {
    const state = st();
    const fresh = DEFAULTS.filter((d) => !nameExists(state, d.name) && !shortExists(state, d.short));
    if (!fresh.length) { U.toast('Standardfächer sind bereits vorhanden', { type: 'warn' }); return; }
    SW.store.update((s) => { for (const d of fresh) s.subjects.push({ ...M.newSubject(), ...d }); }, { coll: 'subjects', op: 'bulk' });
    U.toast(`${plural(fresh.length, 'Standardfach', 'Standardfächer')} angelegt`, { type: 'ok' });
  }

  // ---------- Leerer Zustand ----------
  function emptyState(edit) {
    return h('div.card.pad.empty.sj-empty',
      h('div.sj-empty-top',
        h('div.big', '📘'),
        h('h3', 'Noch keine Fächer erfasst'),
        h('p', 'Fächer sind die Bausteine der Lektionentafeln: Jeder Lehrgang legt fest, wie viele Lektionen pro Fach und Lehrjahr unterrichtet werden, und jede Lehrperson hinterlegt, welche Fächer sie unterrichtet. Raumbedarf und Lektionsform steuern, wo und wie der Generator die Lektionen platziert.'),
        edit ? h('div.flex.g8.wrap.jc-c.mt8', h('button.btn.primary', { onclick: openCreate }, SW.icon('plus'), 'Fach anlegen'), h('button.btn', { onclick: createDefaults }, SW.icon('sparkles'), 'Standardfächer anlegen')) : h('p.small.faint', 'Fächer werden von der Planung erfasst.'),
      ),
      edit ? h('h4', 'Standardfächer') : null,
      edit ? h('div.sj-defaults', DEFAULTS.map((d) => h('div.sj-default', U.subjectTag(d), shortBadge(d)))) : null,
    );
  }

  // ---------- Tabelle ----------
  function subjectTable(state, list, per, edit) {
    const cols = [
      { label: 'Fach', cls: 'sj-name', render: (s) => { const i = per[s.id]; return h('div', U.subjectTag(s), i && !i.curricula.length ? h('div.tiny.faint.mt4', 'In keinem Lehrgang') : null); } },
      { label: 'Kurz', cls: 'sj-nowrap', render: (s) => shortBadge(s) },
      { label: 'Raumbedarf', cls: 'sj-room', render: (s) => { const req = M.roomReq(s.roomReq || 'any'); const i = per[s.id]; return h('div.flex.ai-c.g6.wrap', h('span', req.name), i?.roomMissing ? h('span.chip.sm.err', { title: `Kein aktiver Raum vom Typ ${req.types.map((t) => M.roomType(t).name).join(' / ')} erfasst` }, 'kein Raum') : null); } },
      { label: 'Lektionsform', cls: 'sj-nowrap', render: (s) => (Number(s.block) === 2 ? h('span', { title: 'Doppellektion – wird als zusammenhängender Block von zwei Lektionen geplant' }, 'Doppel') : h('span.muted', { title: 'Einzellektion' }, 'Einzel')) },
      { label: 'Kategorie', cls: 'sj-nowrap.sj-cat', render: (s) => catChip(s.category) },
      { label: 'Lehrpersonen', cls: 'sj-nowrap', render: (s) => { const t = per[s.id]?.teachers || []; return t.length ? h('div.flex.ai-c.g8', avatarStack(t), h('span.num.strong', String(t.length))) : h('span.chip.sm.warn', { title: 'Keine aktive Lehrperson unterrichtet dieses Fach' }, 'keine Lehrperson'); } },
      { label: h('span', { title: 'Lektionen pro Woche über alle Klassen' }, 'Lekt./Woche'), cls: 'r.sj-nowrap', render: (s) => { const i = per[s.id]; const n = i?.lessons || 0; return h('div', h('div.num.strong', n ? SW.fmtNum(n) : h('span.faint', '0')), h('div.tiny.faint', n ? plural(i.classes.size, 'Klasse', 'Klassen') : 'keine Klasse')); } },
    ];
    if (edit) cols.push({ label: 'Aktionen', cls: 'act', render: (s) => h('div.flex.jc-e.g4',
      h('button.btn.icon.ghost.sm', { 'aria-label': 'Bearbeiten', title: 'Bearbeiten', onclick: stop(() => openEdit(s)) }, SW.icon('edit')),
      h('button.btn.icon.ghost.sm', { 'aria-label': 'Löschen', title: 'Löschen', onclick: stop(() => deleteSubject(s)) }, SW.icon('trash'))) });
    return h('div.card', U.table({ cols, rows: list, onRow: edit ? (s) => openEdit(s) : null, cls: 'sj-tbl' }));
  }

  // ---------- Seite ----------
  function renderList(el, state) {
    const edit = canEdit();
    const subjects = [...state.subjects].sort((a, b) => byName(a.name, b.name));
    const actions = edit ? [h('button.btn.primary', { onclick: openCreate }, SW.icon('plus'), 'Fach anlegen')] : [];
    el.append(U.pageHeader({ title: 'Fächer', lead: 'Unterrichtsfächer mit Kennfarbe, Raumbedarf und Lektionsform. Lehrgänge legen die Lektionen pro Fach fest, Lehrpersonen ihre Fächer.', actions }));
    if (!subjects.length) { el.append(emptyState(edit)); return; }

    const per = analyse(state);
    const totalLessons = SW.sum(subjects, (s) => per[s.id]?.lessons || 0);
    const noTeacher = subjects.filter((s) => !(per[s.id]?.teachers || []).length);
    const noRoom = subjects.filter((s) => per[s.id]?.roomMissing);
    const cats = SW.uniq(subjects.map((s) => s.category || '')).length;

    // Kennzahlen
    el.append(h('div.grid.c3',
      U.kpi({ label: 'Fächer', icon: '📘', value: SW.fmtNum(subjects.length), sub: `in ${plural(cats, 'Kategorie', 'Kategorien')}` }),
      U.kpi({ label: 'Lektionen pro Woche', icon: '🗓️', value: SW.fmtNum(totalLessons), sub: state.classes.length ? `Bedarf über ${plural(state.classes.length, 'Klasse', 'Klassen')}` : 'noch keine Klassen erfasst', onclick: state.classes.length ? null : () => SW.router.go('#/klassen') }),
      U.kpi({ label: 'Fächer ohne Lehrperson', icon: '👩‍🏫', value: SW.fmtNum(noTeacher.length), sub: noTeacher.length ? 'anklicken, um zu filtern' : 'alle Fächer sind abgedeckt', cls: noTeacher.length ? 'sj-kpi-warn' : 'sj-kpi-ok', onclick: noTeacher.length ? () => { L.only = L.only === 'noTeacher' ? '' : 'noTeacher'; onlySel.value = L.only; refresh(); } : null }),
    ));

    // Hinweise
    if (!state.rooms.some((r) => r.active !== false && M.roomType(r.type).teachable)) el.append(U.banner(h('span', h('b', 'Noch keine Unterrichtsräume erfasst. '), 'Der Raumbedarf der Fächer kann erst geprüft werden, wenn Räume vorhanden sind.'), 'info', { action: edit ? h('a.btn.sm', { href: '#/raeume' }, 'Räume erfassen') : null }));
    else if (noRoom.length) el.append(U.banner(h('span', h('b', `${plural(noRoom.length, 'Fach', 'Fächer')} ohne passenden Raum: `), noRoom.map((s) => s.name).join(', '), '. Der Generator kann diese Lektionen nicht platzieren – Raum anlegen oder Raumbedarf anpassen.'), 'err', { action: edit ? h('a.btn.sm', { href: '#/raeume' }, 'Zu den Räumen') : null }));

    // Werkzeugleiste
    const body = h('div');
    const count = h('span.sj-count');
    const search = U.input({ value: L.q, placeholder: 'Suchen: Name, Kurzname, Kategorie', oninput: SW.debounce((v) => { L.q = v; refresh(); }, 120) });
    const catSel = U.select(CATEGORIES.filter((c) => subjects.some((s) => s.category === c.id) || c.id === L.cat).map((c) => ({ value: c.id, label: `${c.icon}  ${c.name}` })), L.cat, (v) => { L.cat = v || ''; refresh(); }, { placeholder: 'Alle Kategorien' });
    const onlySel = U.select(ONLY, L.only, (v) => { L.only = v || ''; refresh(); }, { placeholder: 'Alle Fächer' });
    const resetBtn = h('button.btn.ghost.sm', { onclick: () => { L.q = ''; L.cat = ''; L.only = ''; search.value = ''; catSel.value = ''; onlySel.value = ''; refresh(); } }, SW.icon('x'), 'Filter zurücksetzen');
    el.append(h('div.toolbar.sj-toolbar', h('div.search', SW.icon('search'), search), catSel, onlySel, resetBtn, h('div.spacer'), count), body);

    const matchOnly = (s) => { const i = per[s.id]; switch (L.only) { case 'hint': return !!i?.hint; case 'noTeacher': return !(i?.teachers || []).length; case 'noRoom': return !!i?.roomMissing; case 'unused': return !(i?.curricula || []).length; default: return true; } };
    const filtered = () => {
      const q = norm(L.q);
      return subjects.filter((s) => (!L.cat || (s.category || '') === L.cat) && matchOnly(s) && (!q || [s.name, s.short, catOf(s.category).name, M.roomReq(s.roomReq || 'any').name].some((x) => norm(x).includes(q))));
    };
    function refresh() {
      const list = filtered();
      const active = !!(norm(L.q) || L.cat || L.only);
      resetBtn.classList.toggle('hide', !active);
      SW.mount(count, active ? `${SW.fmtNum(list.length)} von ${SW.fmtNum(subjects.length)} Fächern` : plural(subjects.length, 'Fach', 'Fächer'));
      if (!list.length) { SW.mount(body, h('div.card', U.empty({ icon: '🔍', title: 'Keine Fächer gefunden', text: 'Kein Fach passt zu Suche und Filtern.', action: h('button.btn', { onclick: () => resetBtn.click() }, 'Filter zurücksetzen') }))); return; }
      SW.mount(body, subjectTable(state, list, per, edit));
    }
    refresh();
  }

  SW.views['faecher'] = {
    title: 'Fächer',
    render(el) {
      U.injectCSS('faecher', CSS);
      renderList(el, st());
    },
  };
})();
