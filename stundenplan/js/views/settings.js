/* STUNDENWERK · views/settings.js — Schule, Stundenraster, Generator, Darstellung, Pro-Demo, Daten, Datenschutz. */
(function () {
  const SW = (globalThis.SW = globalThis.SW || {});
  const h = SW.h; const U = SW.ui; const M = SW.model; const D = SW.domain;
  SW.views = SW.views || {};

  function schoolCard(state) {
    const s = state.settings; const f = { ...s };
    const body = h('div.form-grid',
      U.field('Schulname', U.input({ value: s.schoolName, oninput: (v) => (f.schoolName = v) })),
      U.field('Schuljahr', U.input({ value: s.schoolYear, oninput: (v) => (f.schoolYear = v), placeholder: '2026/27' })),
      U.field('Semesterbeginn', U.input({ type: 'date', value: s.semesterStart, oninput: (v) => (f.semesterStart = v) }), { hint: 'Erster Montag für Kalender und ICS-Export.' }),
      U.field('Unterrichtstage', U.dayChips([1, 2, 3, 4, 5, 6], s.days, (v) => (f.days = v.length ? v : [1, 2, 3, 4, 5]))),
      U.field('Vollpensum (Lektionen pro Woche bei 100 %)', U.input({ type: 'number', value: s.lessonsFull, min: 10, max: 35, oninput: (v) => (f.lessonsFull = Number(v) || 25) })),
      U.field('Jahresarbeitszeit bei 100 % (Stunden)', U.input({ type: 'number', value: s.annualHoursFull, min: 1000, max: 2500, oninput: (v) => (f.annualHoursFull = Number(v) || 1900) })),
      U.field('Lektionsdauer (Minuten)', U.input({ type: 'number', value: s.lessonMinutes, min: 30, max: 90, oninput: (v) => (f.lessonMinutes = Number(v) || 45) })),
    );
    return U.card({ title: 'Schule', icon: '🏫', body, footer: [h('button.btn.primary', { onclick: () => { SW.store.update((st) => Object.assign(st.settings, { schoolName: f.schoolName, schoolYear: f.schoolYear, semesterStart: f.semesterStart, days: f.days, lessonsFull: f.lessonsFull, annualHoursFull: f.annualHoursFull, lessonMinutes: f.lessonMinutes })); U.toast('Gespeichert', { type: 'ok' }); } }, 'Speichern')] });
  }

  function slotsCard(state) {
    let slots = SW.clone(state.settings.slots); let lunch = state.settings.lunchAfter;
    const tbl = h('div');
    const draw = () => {
      const t = h('table.tbl.compact'); t.append(h('thead', h('tr', h('th', 'Nr.'), h('th', 'Beginn'), h('th', 'Ende'), h('th', ''))));
      const tb = h('tbody');
      slots.forEach((sl, i) => { sl.n = i + 1; tb.append(h('tr', h('td.strong', String(sl.n)), h('td', U.input({ type: 'time', value: sl.start, cls: 'sm', onchange: (v) => (sl.start = v) })), h('td', U.input({ type: 'time', value: sl.end, cls: 'sm', onchange: (v) => (sl.end = v) })), h('td.act', h('button.btn.icon.xs.ghost', { title: 'Entfernen', onclick: () => { slots.splice(i, 1); draw(); } }, SW.icon('x'))))); });
      t.append(tb); SW.mount(tbl, h('div.tbl-wrap', t));
      lunchSel.replaceChildren(...slots.map((sl) => h('option', { value: sl.n, selected: sl.n === lunch }, `nach Lektion ${sl.n} (${sl.end})`)));
    };
    const lunchSel = h('select.inp', { onchange: () => (lunch = Number(lunchSel.value)) }); lunchSel.style.maxWidth = '260px';
    draw();
    const add = () => { const last = slots[slots.length - 1]; const st = last ? SW.hhmm(SW.minutes(last.end) + 5) : '07:30'; slots.push({ n: slots.length + 1, start: st, end: SW.hhmm(SW.minutes(st) + (state.settings.lessonMinutes || 45)) }); draw(); };
    const preset = (n) => { slots = SW.clone(M.DEFAULT_SLOTS).slice(0, n); lunch = Math.min(lunch, n); if (n === 8) lunch = 4; draw(); };
    const save = async () => {
      const old = state.settings.slots.length;
      if (slots.length !== old) { const ok = await U.confirm({ title: 'Anzahl Lektionen ändern?', text: `Das Raster hat neu ${slots.length} statt ${old} Lektionen. Verfügbarkeiten und Raumsperren werden angepasst, der aktuelle Stundenplan wird verworfen.`, ok: 'Ändern', danger: true }); if (!ok) return; }
      SW.store.update((st) => {
        st.settings.slots = slots.map((s, i) => ({ n: i + 1, start: s.start, end: s.end })); st.settings.lunchAfter = SW.clamp(lunch, 0, slots.length);
        if (slots.length !== old) {
          const fix = (obj) => { for (const d of Object.keys(obj || {})) { const a = obj[d] || []; obj[d] = SW.range(slots.length).map((i) => !!a[i]); } };
          for (const t of st.teachers) fix(t.availability); for (const r of st.rooms) fix(r.blocked);
          st.timetable = null;
        }
      });
      U.toast('Stundenraster gespeichert', { type: 'ok' });
    };
    return U.card({ title: 'Stundenraster', icon: '🕘', sub: `${slots.length} Lektionen à ${state.settings.lessonMinutes} Minuten`, body: h('div.col.g12', tbl, h('div.flex.g8.wrap', h('button.btn.sm', { onclick: add }, SW.icon('plus'), 'Lektion anhängen'), h('button.btn.sm', { onclick: () => preset(9) }, 'Standard (9 Lektionen)'), h('button.btn.sm', { onclick: () => preset(8) }, '8 Lektionen')), U.field('Mittagspause', lunchSel, { hint: 'Doppellektionen werden nie über den Mittag gelegt.' })), footer: [h('button.btn.primary', { onclick: save }, 'Raster speichern')] });
  }

  function dataCard(state) {
    const size = Math.round(SW.store.exportJSON().length / 1024);
    const file = h('input', { type: 'file', accept: '.json,application/json', style: { display: 'none' } });
    file.addEventListener('change', () => { const f = file.files[0]; if (!f) return; const r = new FileReader(); r.onload = async () => { try { const raw = JSON.parse(r.result); const ok = await U.confirm({ title: 'Sicherung laden?', text: `Datei enthält ${(raw.classes || []).length} Klassen, ${(raw.teachers || []).length} Lehrpersonen, ${(raw.rooms || []).length} Räume (Schuljahr ${raw.settings?.schoolYear || '?'}). Alle aktuellen Daten werden ersetzt.`, ok: 'Laden', danger: true }); if (ok) { SW.store.importJSON(r.result); U.toast('Sicherung geladen', { type: 'ok' }); location.hash = '#/dashboard'; } } catch (e) { U.toast('Ungültige Datei: ' + e.message, { type: 'err' }); } }; r.readAsText(f); file.value = ''; });
    let scale = 1;
    const body = h('div.col.g14',
      h('div.flex.g8.wrap.ai-c', h('button.btn', { onclick: () => SW.download(`stundenwerk-${(state.settings.schoolYear || '').replace('/', '-')}-${SW.isoDate()}.json`, SW.store.exportJSON(), 'application/json') }, SW.icon('download'), 'Sicherung herunterladen'), h('button.btn', { onclick: () => file.click() }, SW.icon('upload'), 'Sicherung laden'), file, h('span.small.muted', `Belegt ${size} KB im Browserspeicher`)),
      h('hr.divider'),
      h('div.flex.g8.wrap.ai-c', U.seg([{ value: 1, label: 'Demo (19 Klassen)' }, { value: 2, label: 'Grosse Schule (38 Klassen)' }, { value: 4, label: 'Sehr gross (76 Klassen)' }], 1, (v) => (scale = Number(v))), h('button.btn', { onclick: async () => { if (await U.confirm({ title: 'Demo-Daten laden?', text: 'Alle aktuellen Daten werden durch den Demo-Datensatz ersetzt.', ok: 'Laden', danger: true })) { SW.store.update((st) => { const fresh = SW.store.migrate(SW.seed.build({ scale })); for (const k of Object.keys(fresh)) st[k] = fresh[k]; st.settings.onboarded = true; }); U.toast('Demo-Daten geladen', { type: 'ok' }); location.hash = '#/dashboard'; } } }, '🚀', 'Demo-Daten laden')),
      h('div.flex.g8.wrap.ai-c', h('button.btn.danger.soft', { onclick: async () => { if (await U.confirm({ title: 'Wirklich alles löschen?', text: 'Räume, Lehrpersonen, Klassen, Pläne und Einstellungen werden aus diesem Browser entfernt. Vorher eine Sicherung herunterladen!', ok: 'Alles löschen', danger: true })) { SW.store.reset(); U.toast('Alle Daten gelöscht'); location.hash = '#/dashboard'; SW.welcome(); } } }, SW.icon('trash'), 'Alles löschen')),
    );
    return U.card({ title: 'Daten', icon: '💾', sub: 'Alle Daten liegen nur in diesem Browser (localStorage).', body });
  }

  SW.views.einstellungen = {
    title: 'Einstellungen',
    render(el) {
      const state = SW.store.state; const s = state.settings;
      el.append(U.pageHeader({ title: 'Einstellungen', lead: 'Schule, Stundenraster, Generator, Darstellung und Daten.' }));
      el.append(schoolCard(state), slotsCard(state));
      el.append(U.card({ title: 'Generator', icon: '🪄', body: h('div.form-grid', U.field('Standardqualität', U.seg(M.QUALITY.map((q) => ({ value: q.id, label: `${q.name} · ${q.desc}` })), s.quality, (v) => SW.store.setSetting('quality', v))), U.field('Seed', U.input({ type: 'number', value: s.seed, onchange: (v) => SW.store.setSetting('seed', Number(v) || 1) }), { hint: 'Gewichtung der Kriterien: im Generator unter «Einstellungen».' })), actions: [h('a.btn.sm', { href: '#/generator' }, 'Zum Generator')] }));
      el.append(U.card({ title: 'Darstellung', icon: '🎨', body: h('div.form-grid', U.field('Farbschema', U.seg([{ value: 'auto', label: 'Automatisch' }, { value: 'light', label: 'Hell' }, { value: 'dark', label: 'Dunkel' }], s.theme || 'auto', (v) => { SW.store.setSetting('theme', v); SW.applyTheme(); })), U.field('Rolle', U.seg([{ value: 'admin', label: 'Planung' }, { value: 'teacher', label: 'Lehrperson' }], s.role || 'admin', (v) => { if (v === 'teacher' && !state.teachers.length) return U.toast('Zuerst eine Lehrperson erfassen', { type: 'warn' }); if (v === 'teacher' && !s.currentTeacherId) SW.store.state.settings.currentTeacherId = state.teachers[0].id; SW.store.setSetting('role', v); }), { hint: 'Die Rolle «Lehrperson» zeigt die Sicht einer einzelnen Lehrperson (Auswahl oben rechts).' })) }));
      el.append(U.card({ title: 'STUNDENWERK Pro (Demo)', icon: '⭐', body: h('div.col.g12', h('div.flex.ai-c.g10.wrap', s.proUnlocked ? h('span.chip.pro', '🧪 Pro-Demo aktiv – simulierter Kauf') : h('span.chip', 'Nicht freigeschaltet'), h('span.small.muted', 'CHF 500 pro Monat und Schule, alle Lehrpersonen inklusive. Der Generator bleibt kostenlos.')), h('ul.feat-list', M.PRO_FEATURES.map((p) => h('li', h('span.ic', p.icon), h('div', h('div.strong', p.name), h('div.small.muted', p.desc))))), h('div.flex.g8.wrap', h('button.btn.pro', { onclick: () => U.paywall('calendar', () => SW.router.refresh()) }, SW.icon('star'), 'Paywall anzeigen'), s.proUnlocked ? h('button.btn', { onclick: () => { SW.store.setSetting('proUnlocked', false); U.toast('Pro-Demo beendet'); } }, 'Demo beenden') : null)) }));
      el.append(dataCard(state));
      el.append(U.card({ title: 'Datenschutz & Info', icon: '🛡️', body: h('div.col.g10.small', h('p', h('b', 'Keine Personendaten. '), 'Lehrpersonen werden ausschliesslich als Emoji mit optionalem Kürzel geführt. Die App speichert weder Namen noch eine Zuordnungstabelle. Rechtlich ist das eine Pseudonymisierung (Datenminimierung nach Art. 7 DSG); Fach, Klasse und Zeit lassen Insider die Person trotzdem erkennen – persönliche Pläne daher nicht öffentlich aushängen.'), h('p', h('b', 'Kein Server. '), 'Alle Daten bleiben in diesem Browser (localStorage). Es gibt keine Übertragung, keine Tracker und keine Drittanbieter-Skripte. Wer den Browserspeicher löscht, verliert die Daten – regelmässig eine Sicherung herunterladen.'), h('p', h('b', 'Exporte. '), 'JSON-, CSV- und ICS-Dateien sind Kopien der Daten und liegen in der Verantwortung der Schule (revidiertes DSG, kantonales Datenschutzgesetz Luzern).'), h('p.faint', `STUNDENWERK ${M.APP.version} · Fachgrundlagen in RECHERCHE.md · Aufbau in ARCHITEKTUR.md`)) }));
    },
  };
})();
