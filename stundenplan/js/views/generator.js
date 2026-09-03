/* STUNDENWERK · views/generator.js — Machbarkeitsanalyse, Einstellungen, Lauf, Ergebnis, Varianten. */
(function () {
  const SW = (globalThis.SW = globalThis.SW || {});
  const h = SW.h; const U = SW.ui; const M = SW.model; const D = SW.domain;
  SW.views = SW.views || {};

  let running = null; // { signal, el }
  let lastPlan = null; // Ergebnis des letzten Laufs (noch nicht übernommen)
  let unsub = null;

  const levelChip = (lvl) => h('span.chip.sm.' + (lvl === 'error' ? 'err' : lvl === 'warn' ? 'warn' : 'info'), lvl === 'error' ? 'Fehler' : lvl === 'warn' ? 'Warnung' : 'Hinweis');

  function feasibilityCard(state) {
    const f = D.feasibility(state);
    const groups = SW.groupBy(f.issues, (i) => i.level);
    const body = h('div.col.g12');
    if (!f.issues.length) body.append(U.banner(h('span', h('b', 'Alles bereit. '), 'Keine Probleme in den Stammdaten gefunden – der Generator kann starten.'), 'ok'));
    else {
      body.append(h('div.chips', h('span.chip.' + (f.errors ? 'err' : 'ok'), `${f.errors} Fehler`), h('span.chip.' + (f.warnings ? 'warn' : ''), `${f.warnings} Warnungen`), h('span.chip.info', `${(groups.info || []).length} Hinweise`)));
      if (f.errors) body.append(U.banner(h('span', h('b', 'Fehler blockieren einzelne Lektionen. '), 'Der Generator läuft trotzdem, platziert aber betroffene Lektionen nicht und nennt den Grund.'), 'err'));
      for (const lvl of ['error', 'warn', 'info']) {
        const list = groups[lvl]; if (!list?.length) continue;
        const details = h('details', { open: lvl !== 'info' }, h('summary.strong', { style: { cursor: 'pointer', padding: '6px 0' } }, `${lvl === 'error' ? 'Fehler' : lvl === 'warn' ? 'Warnungen' : 'Hinweise'} (${list.length})`));
        const ul = h('ul.list');
        for (const i of list) ul.append(h('li', h('span.dot.' + (lvl === 'error' ? 'err' : lvl === 'warn' ? 'warn' : 'tint')), h('div.grow', h('div.strong', i.title), h('div.small.muted', i.text)), i.link ? h('a.btn.sm', { href: i.link }, 'Beheben', SW.icon('arrowRight')) : null));
        details.append(ul); body.append(details);
      }
    }
    return { card: U.card({ title: 'Machbarkeitsanalyse', icon: '🔍', sub: 'Prüfung der Stammdaten vor dem Lauf', body, actions: [h('button.btn.sm', { onclick: () => SW.router.refresh() }, SW.icon('refresh'), 'Erneut prüfen')] }), f };
  }

  function settingsCard(state) {
    const s = state.settings;
    const seedInp = U.input({ type: 'number', value: s.seed, onchange: (v) => SW.store.state.settings.seed = Number(v) || 1 });
    const locked = (state.timetable?.lessons || []).filter((l) => l.locked).length;
    let keepLocked = true;
    const weights = h('div.form-grid');
    const sliders = {};
    for (const [k, label] of Object.entries(M.WEIGHT_LABELS)) {
      const val = h('span.num.small.muted', String(s.weights[k] ?? M.DEFAULT_WEIGHTS[k]));
      const r = h('input', { type: 'range', min: 0, max: 20, step: 0.5, value: s.weights[k] ?? M.DEFAULT_WEIGHTS[k], style: { width: '100%', accentColor: 'var(--tint)' } });
      r.addEventListener('input', () => (val.textContent = r.value));
      r.addEventListener('change', () => { SW.store.state.settings.weights[k] = Number(r.value); SW.store.save(); });
      sliders[k] = { r, val };
      weights.append(h('div.field', h('label.flex.jc-b', h('span', label), val), r));
    }
    const resetBtn = h('button.btn.sm', { onclick: () => { SW.store.state.settings.weights = { ...M.DEFAULT_WEIGHTS }; SW.store.save(); for (const [k, o] of Object.entries(sliders)) { o.r.value = M.DEFAULT_WEIGHTS[k]; o.val.textContent = String(M.DEFAULT_WEIGHTS[k]); } U.toast('Gewichtung zurückgesetzt'); } }, 'Standard');
    const body = h('div.col.g16',
      h('div.form-grid',
        U.field('Qualität', U.seg(M.QUALITY.map((q) => ({ value: q.id, label: `${q.name} · ${q.desc}` })), s.quality || 'normal', (v) => { SW.store.state.settings.quality = v; SW.store.save(); })),
        U.field('Seed (Zufallsstart)', h('div.inp-row', seedInp, h('button.btn.icon', { title: 'Würfeln', onclick: () => { const v = Math.floor(Math.random() * 100000); seedInp.value = v; SW.store.state.settings.seed = v; SW.store.save(); } }, '🎲')), { hint: 'Gleicher Seed und gleiche Daten ergeben denselben Plan.' }),
        U.field('Fixierte Lektionen', h('div.flex.ai-c.g10', U.switchEl(true, (v) => (keepLocked = v), 'Fixierte Lektionen beibehalten'), h('span.small', `${locked} fixierte Lektionen beibehalten`)), { hint: 'Lektionen mit Schloss im Stundenplan bleiben an ihrem Platz.' }),
      ),
      h('details', h('summary.strong', { style: { cursor: 'pointer' } }, 'Gewichtung der Kriterien'), h('p.small.muted.mt8', 'Höher = wichtiger. Harte Regeln (Doppelbelegung, Verfügbarkeit, Raumtyp) werden nie verletzt und sind hier nicht einstellbar.'), h('div.mt12', weights), h('div.mt12', resetBtn)),
    );
    return { card: U.card({ title: 'Einstellungen', icon: '⚙️', body }), get keepLocked() { return keepLocked; } };
  }

  async function run(state, opts, host) {
    const signal = { aborted: false };
    running = { signal };
    const bar = h('div.progress', h('i', { style: { width: '2%' } }));
    const phase = h('div.strong', 'Vorbereiten …'); const detail = h('div.small.muted', '');
    SW.mount(host, h('div.card.pad.col.g10', h('div.flex.ai-c.g10', h('span.spin'), phase, h('span.spacer'), h('button.btn.sm.danger.soft', { onclick: () => { signal.aborted = true; } }, SW.icon('stop'), 'Abbrechen')), bar, detail));
    try {
      const plan = await SW.solver.generate(state, {
        seed: state.settings.seed, quality: state.settings.quality, keepLocked: opts.keepLocked, signal,
        onProgress: (p) => { bar.firstChild.style.width = Math.round(Math.max(2, p.pct * 100)) + '%'; phase.textContent = p.phase + ' …'; detail.textContent = `${p.placed ?? 0} von ${p.total ?? 0} Einheiten platziert${p.score != null ? ' · Score ' + p.score : ''}`; },
      });
      running = null;
      lastPlan = plan;
      if (signal.aborted) U.toast('Lauf abgebrochen – Zwischenergebnis wird angezeigt', { type: 'warn' });
      SW.router.refresh();
    } catch (e) {
      running = null; console.error(e);
      SW.mount(host, U.banner(h('span', h('b', 'Fehler beim Generieren: '), String(e.message || e)), 'err'));
    }
  }

  function resultCard(state, plan) {
    const need = SW.sum(state.classes, (k) => D.classLessonCount(state, k));
    const placed = SW.sum(plan.lessons, (l) => l.len || 1);
    const cost = SW.solver.cost(state, plan.lessons);
    const cur = state.timetable;
    const delta = (a, b) => (b == null ? null : a - b);
    const kpis = h('div.grid.c4',
      U.kpi({ label: 'Score', value: String(plan.score), sub: 'kleiner ist besser' + (cur ? ` · bisher ${cur.score}` : ''), icon: '🎯' }),
      U.kpi({ label: 'Platziert', value: h('span', String(placed), h('small', `/ ${need}`)), sub: plan.unplaced.length ? `${SW.sum(plan.unplaced, (u) => u.lessons || u.len)} Lektionen offen` : 'alle Lektionen platziert', icon: '✅' }),
      U.kpi({ label: 'Freistunden Klassen', value: String(plan.stats.classGaps), sub: cur ? `bisher ${cur.stats?.classGaps ?? '–'}` : 'über alle Klassen', icon: '⏳' }),
      U.kpi({ label: 'Freistunden Lehrpersonen', value: String(plan.stats.teacherGaps), sub: `Raumauslastung ${Math.round(plan.stats.roomUtil * 100)} %`, icon: '👩‍🏫' }),
    );
    const body = h('div.col.g16', kpis);
    if (plan.unplaced.length) {
      const ul = h('ul.list');
      for (const u of plan.unplaced) { const k = D.classOf(state, u.classId), sj = D.subjectOf(state, u.subjectId), t = D.teacherOf(state, u.teacherId); ul.append(h('li', h('span', '⚠️'), h('div.grow', h('div.strong', `${k?.name || '?'} · ${sj?.name || '?'} · ${u.lessons || u.len} Lektion(en)`), h('div.small.muted', (t ? D.teacherLabel(t) + ' · ' : '') + u.reason)), k ? h('a.btn.sm', { href: '#/klassen/' + k.id }, 'Klasse') : null)); }
      body.append(h('div', h('h3.mb8', 'Nicht platzierte Lektionen'), ul));
    }
    const parts = Object.entries(cost.parts).filter(([k, v]) => v > 0).sort((a, b) => cost.weighted[b[0]] - cost.weighted[a[0]]);
    body.append(h('details', h('summary.strong', { style: { cursor: 'pointer' } }, 'Aufschlüsselung der Kriterien'), U.table({ cls: 'compact', cols: [{ label: 'Kriterium', render: (r) => M.WEIGHT_LABELS[r[0]] || r[0] }, { label: 'Anzahl', cls: 'r', render: (r) => SW.fmtNum(r[1], 1) }, { label: 'Gewichtet', cls: 'r', render: (r) => SW.fmtNum(cost.weighted[r[0]], 1) }], rows: parts })));
    const assigns = Object.entries(plan.assignments || {}).filter(([, m]) => Object.keys(m).length);
    if (assigns.length) {
      const ul = h('ul.list');
      for (const [cid, m] of assigns) { const k = D.classOf(state, cid); for (const [sid, tid] of Object.entries(m)) { if (k && (k.subjectTeachers || {})[sid] === tid) continue; ul.append(h('li', h('div.grow', h('span.strong', k?.name || '?'), ' · ', D.subjectOf(state, sid)?.name || '?'), U.teacherPill(D.teacherOf(state, tid)))); } }
      if (ul.children.length) body.append(h('div', h('h3.mb8', 'Automatische Lehrpersonen-Zuweisungen'), h('p.small.muted.mb8', 'Diese Fächer hatten keine feste Lehrperson. Der Generator hat die am wenigsten belastete qualifizierte Lehrperson gewählt.'), ul, h('button.btn.sm.mt8', { onclick: () => { SW.store.update((s) => D.applyAssignments(s, plan.assignments)); U.toast('Zuweisungen in den Klassen gespeichert', { type: 'ok' }); } }, SW.icon('check'), 'Zuweisungen in Klassen übernehmen')));
    }
    body.append(h('div.small.faint', `${plan.durationMs} ms · ${plan.iterations} Iterationen · Seed ${plan.seed} · ${plan.log.join(' · ')}`));
    const footer = [
      h('button.btn', { onclick: () => { lastPlan = null; SW.router.refresh(); } }, 'Verwerfen'),
      h('button.btn', { onclick: () => { SW.store.state.settings.seed = Math.floor(Math.random() * 100000); SW.store.save(); lastPlan = null; SW.router.refresh(); setTimeout(() => document.querySelector('#genStart')?.click(), 50); } }, '🎲', 'Nochmals mit neuem Seed'),
      h('button.btn.primary', { onclick: () => { SW.store.setTimetable(plan); lastPlan = null; U.toast('Stundenplan übernommen', { type: 'ok', action: { label: 'Öffnen', fn: () => (location.hash = '#/stundenplan') } }); SW.store.notify({ icon: '🗓️', text: `Neuer Stundenplan erstellt (Score ${plan.score}, ${placed}/${need} Lektionen).`, link: '#/stundenplan' }); location.hash = '#/stundenplan'; } }, SW.icon('check'), 'Plan übernehmen'),
    ];
    return U.card({ title: 'Ergebnis', icon: '🎉', sub: cur ? 'Der bestehende Plan wird beim Übernehmen als Variante archiviert.' : 'Plan übernehmen, um ihn im Stundenplan zu sehen.', body, footer });
  }

  function variantsCard(state) {
    const cur = state.timetable; const rows = [];
    if (cur) rows.push({ ...cur, current: true });
    rows.push(...state.variants);
    if (!rows.length) return U.card({ title: 'Aktueller Plan & Varianten', icon: '🗂️', body: h('p.muted', 'Noch kein Plan. Nach dem ersten Lauf erscheint er hier; ältere Pläne werden als Varianten aufbewahrt.') });
    const best = (k) => Math.min(...rows.map((r) => Number(r.stats?.[k] ?? r[k] ?? Infinity)));
    return U.card({ title: 'Aktueller Plan & Varianten', icon: '🗂️', body: U.table({ cls: 'compact', cols: [
      { label: 'Plan', render: (r) => h('div', h('div.strong', r.current ? 'Aktueller Plan' : (r.label || 'Variante')), h('div.tiny.faint', SW.fmtTs(r.createdAt) + ' · Seed ' + r.seed)) },
      { label: 'Status', render: (r) => r.current ? h('span.chip.' + (r.status === 'published' ? 'ok' : 'tint'), r.status === 'published' ? 'Veröffentlicht' : 'Entwurf') : h('span.chip', 'Archiv') },
      { label: 'Score', cls: 'r', render: (r) => h('span' + (r.score === best('score') ? '.strong.ok-c' : ''), String(r.score)) },
      { label: 'Lektionen', cls: 'r', render: (r) => String(SW.sum(r.lessons || [], (l) => l.len || 1)) },
      { label: 'Offen', cls: 'r', render: (r) => String((r.unplaced || []).length) },
      { label: 'Freist. Klassen', cls: 'r', render: (r) => String(r.stats?.classGaps ?? '–') },
      { label: 'Freist. LP', cls: 'r', render: (r) => String(r.stats?.teacherGaps ?? '–') },
      { label: '', cls: 'act', render: (r) => r.current ? h('a.btn.sm', { href: '#/stundenplan' }, 'Öffnen') : h('div.flex.g6.jc-e', h('button.btn.sm', { onclick: async () => { if (await U.confirm({ title: 'Variante wiederherstellen?', text: 'Der aktuelle Plan wird als Variante archiviert.', ok: 'Wiederherstellen' })) { SW.store.restoreVariant(r.id); U.toast('Variante wiederhergestellt', { type: 'ok' }); } } }, SW.icon('undo'), 'Wiederherstellen'), h('button.btn.sm.icon.ghost', { title: 'Löschen', onclick: async () => { if (await U.confirm({ title: 'Variante löschen?', ok: 'Löschen', danger: true })) SW.store.update((s) => { s.variants = s.variants.filter((v) => v.id !== r.id); }); } }, SW.icon('trash'))) },
    ], rows }) });
  }

  SW.views.generator = {
    title: 'Generator', manualRefresh: true,
    render(el) {
      const state = SW.store.state;
      if (!unsub) unsub = SW.store.on((st, meta) => { if (!running && SW.router.current?.route === 'generator' && !['setting'].includes(meta.op)) SW.router.refresh(); });
      const need = SW.sum(state.classes, (k) => D.classLessonCount(state, k));
      el.append(U.pageHeader({ title: 'Stundenplan generieren', lead: `${state.classes.length} Klassen · ${state.teachers.filter((t) => t.active !== false).length} Lehrpersonen · ${state.rooms.filter((r) => M.roomType(r.type).teachable && r.active !== false).length} Unterrichtsräume · ${need} Lektionen pro Woche` }));
      const { card: feas, f } = feasibilityCard(state);
      const settings = settingsCard(state);
      const runHost = h('div');
      const startBtn = h('button.btn.primary.lg#genStart', { disabled: !state.classes.length, onclick: () => { lastPlan = null; run(state, { keepLocked: settings.keepLocked }, runHost); startBtn.disabled = true; } }, SW.icon('wand'), 'Stundenplan generieren');
      const startCard = h('div.card.pad.col.g12', h('div.flex.ai-c.g12.wrap', startBtn, h('div.small.muted', f.errors ? `${f.errors} Fehler in den Stammdaten – betroffene Lektionen bleiben offen.` : 'Rechenzeit je nach Qualität 3 bis 20 Sekunden. Der Browser bleibt bedienbar.')), runHost);
      el.append(feas, settings.card, startCard);
      if (lastPlan) el.append(resultCard(state, lastPlan));
      el.append(variantsCard(state));
      if (!state.classes.length) el.append(U.empty({ icon: '🧩', title: 'Noch keine Klassen', text: 'Erfasse zuerst Räume, Fächer, Lehrgänge, Lehrpersonen und Klassen – oder lade die Demo-Daten.', action: h('div.flex.g8', h('a.btn.primary', { href: '#/klassen' }, 'Zu den Klassen'), h('button.btn', { onclick: () => SW.store.loadDemo() }, 'Demo-Daten laden')) }));
    },
    onLeave() { if (running) running.signal.aborted = true; if (unsub) { unsub(); unsub = null; } },
  };
})();
