/* STUNDENWERK · views/dashboard.js — Dashboard: Startseite der Planung.
   Inhalt: KPI-Reihe · Plan-Status · Machbarkeitsanalyse · Auslastung (nur mit Plan)
           · Heute · Startklar-Checkliste · Pro-Teaser · grosser Leerzustand ohne Daten.
   Nur lesend auf SW.store.state; Aktionen führen in die jeweiligen Ansichten. */
(function () {
  const SW = (globalThis.SW = globalThis.SW || {});
  SW.views = SW.views || {};
  const h = SW.h;

  const CSS = `
.dash-grid{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:18px;align-items:start}
.dash-col{display:flex;flex-direction:column;gap:18px;min-width:0}
@media (max-width:980px){.dash-grid{grid-template-columns:1fr}}
.dash-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:10px}
.dash-stat{background:var(--card-2);border-radius:var(--r-s);padding:10px 12px;display:flex;flex-direction:column;gap:2px;min-width:0}
.dash-stat b{font-size:22px;font-weight:720;letter-spacing:-.02em;font-variant-numeric:tabular-nums;line-height:1.15}
.dash-stat b small{font-size:13px;font-weight:600;color:var(--txt-3);letter-spacing:0;margin-left:3px}
.dash-stat span{font-size:12px;color:var(--txt-3)}
.dash-stat.ok b{color:var(--ok)}.dash-stat.warn b{color:var(--warn)}.dash-stat.err b{color:var(--err)}
.dash-list{display:flex;flex-direction:column}
.dash-issue{display:flex;gap:10px;align-items:flex-start;padding:10px 6px;margin:0 -6px;border-bottom:1px solid var(--sep);color:inherit;border-radius:var(--r-s)}
.dash-issue:last-child{border-bottom:0}
a.dash-issue:hover{background:var(--card-2);text-decoration:none}
.dash-issue .dot{margin-top:6px}
.dash-issue .dot.info{background:var(--info)}
.dash-issue .ttl{font-weight:600;font-size:14px}
.dash-issue .txt{font-size:12.5px;color:var(--txt-2);margin-top:1px}
.dash-issue svg.i{color:var(--txt-3);margin-top:2px}
.dash-check{display:flex;align-items:center;gap:12px;padding:9px 6px;margin:0 -6px;border-radius:var(--r-s);color:inherit}
a.dash-check:hover{background:var(--card-2);text-decoration:none}
.dash-check .ic{width:24px;height:24px;border-radius:50%;border:2px solid var(--sep-2);display:grid;place-items:center;flex:none;color:transparent;transition:background .15s,border-color .15s}
.dash-check.done .ic{background:var(--ok);border-color:var(--ok);color:#fff}
.dash-check .ic svg.i{width:14px;height:14px;stroke-width:2.6}
.dash-check .lbl{font-weight:600;font-size:14px;color:var(--txt)}
.dash-check.done .lbl{color:var(--txt-2)}
.dash-check .sub{font-size:12.5px;color:var(--txt-3)}
.dash-check svg.i.chev{color:var(--txt-3)}
.dash-util{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px}
@media (max-width:600px){.dash-util{grid-template-columns:1fr}}
.dash-util-row{display:grid;grid-template-columns:minmax(96px,132px) 1fr;gap:10px;align-items:center;padding:6px 0;color:inherit;min-width:0}
a.dash-util-row:hover{text-decoration:none}
.dash-util-row .nm{font-weight:600;font-size:13.5px;min-width:0}
.dash-pro{display:flex;flex-direction:column;gap:6px;padding:16px;position:relative}
.dash-pro .ic{font-size:28px;line-height:1;margin-bottom:4px}
.dash-pro .lock-badge{position:absolute;top:12px;right:12px}
.dash-hero .empty{padding:48px 20px 40px}
.dash-hero .empty p{max-width:56ch}
.dash-hero .empty .btn{margin-top:0}
.dash-today-cls{display:flex;flex-wrap:wrap;gap:6px}
.dash-today-cls a.chip:hover{background:var(--tint-soft);color:var(--tint-txt);text-decoration:none}
.dash-booking{display:flex;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid var(--sep)}
.dash-booking:last-child{border-bottom:0}
.dash-booking .ic{font-size:18px;flex:none;width:28px;text-align:center}
.dash-booking .ttl{font-weight:600;font-size:14px}
.dash-booking .sub{font-size:12.5px;color:var(--txt-3)}
`;

  const fmt = (n) => SW.fmtNum(n);
  const go = (hash) => () => SW.router.go(hash);
  const stat = (label, value, cls) => h('div.dash-stat' + (cls ? '.' + cls : ''), h('b', value), h('span', label));
  const linkBtn = (href, label, cls = '', icon) => h('a.btn' + (cls ? '.' + cls : ''), { href }, icon ? SW.icon(icon) : null, label);

  // ---------- Kennzahlen des Zustands ----------
  function facts(st) {
    const D = SW.domain, M = SW.model;
    const active = st.teachers.filter((t) => t.active !== false);
    const teachRooms = st.rooms.filter((r) => r.active !== false && M.roomType(r.type).teachable);
    const lessons = SW.sum(st.classes, (k) => D.classLessonCount(st, k));
    return { active, teachRooms, lessons };
  }

  // ---------- KPI-Reihe ----------
  function kpiRow(st, F) {
    const U = SW.ui;
    const learners = SW.sum(st.classes, (k) => Number(k.size) || 0);
    const inactive = st.teachers.length - F.active.length;
    const avgEmp = F.active.length ? Math.round(SW.sum(F.active, (t) => Number(t.employment) || 0) / F.active.length) : 0;
    const avgLessons = st.classes.length ? Math.round((F.lessons / st.classes.length) * 10) / 10 : 0;
    return h('div.grid.c4',
      U.kpi({ icon: SW.icon('users'), label: 'Klassen', value: fmt(st.classes.length), sub: st.classes.length ? `${fmt(learners)} Lernende` : 'Noch keine erfasst', onclick: go('#/klassen') }),
      U.kpi({ icon: SW.icon('user'), label: 'Lehrpersonen', value: fmt(F.active.length), sub: F.active.length ? (inactive ? `${fmt(inactive)} inaktiv · Ø Pensum ${avgEmp} %` : `Ø Pensum ${avgEmp} %`) : 'Noch keine erfasst', onclick: go('#/lehrpersonen') }),
      U.kpi({ icon: SW.icon('door'), label: 'Unterrichtsräume', value: fmt(F.teachRooms.length), sub: st.rooms.length ? `${fmt(st.rooms.length)} Räume gesamt` : 'Noch keine erfasst', onclick: go('#/raeume') }),
      U.kpi({ icon: SW.icon('grid'), label: 'Lektionen pro Woche', value: fmt(F.lessons), sub: st.classes.length ? `Ø ${fmt(avgLessons, 1)} pro Klasse` : 'Aus Lehrgängen und Klassen', onclick: go('#/lehrgaenge') }),
    );
  }

  // ---------- Plan-Status ----------
  function planCard(st, F) {
    const U = SW.ui, D = SW.domain, M = SW.model;
    const tt = st.timetable;
    if (!tt) {
      const feas = D.feasibility(st);
      return U.card({ title: 'Stundenplan', icon: '🗓️', actions: [h('span.chip', 'Kein Plan')],
        body: U.empty({ icon: '🪄', title: 'Noch kein Stundenplan',
          text: feas.ok ? 'Die Stammdaten sind vollständig. Der Generator platziert alle Lektionen automatisch – in wenigen Sekunden.' : 'Sobald Räume, Lehrpersonen und Klassen erfasst sind, erstellt der Generator den Plan automatisch. Die Machbarkeitsanalyse zeigt, was noch fehlt.',
          action: linkBtn('#/generator', 'Stundenplan generieren', 'primary', 'wand') }) });
    }
    const stats = D.ttStats(st, tt);
    const need = F.lessons;
    const placed = stats.total;
    const unplaced = SW.sum(tt.unplaced || [], (u) => Number(u.lessons ?? u.count ?? 1));
    const conflicts = D.ttConflicts(st, tt).length;
    const created = new Date(tt.createdAt || Date.now());
    const quality = M.QUALITY.find((q) => q.id === tt.quality);
    const published = tt.status === 'published';
    const subParts = [`Erstellt am ${SW.fmtDate(created)}, ${SW.fmtTime(created)}`];
    if (quality) subParts.push(`Qualität «${quality.name}»`);
    if (tt.seed != null) subParts.push(`Seed ${tt.seed}`);
    if ((st.variants || []).length) subParts.push(SW.plural(st.variants.length, 'ältere Variante', 'ältere Varianten'));
    const ratio = need ? placed / need : (placed ? 1 : 0);
    const body = [
      h('div.dash-stats',
        stat('Score (tiefer ist besser)', fmt(tt.score, 1)),
        stat('Platziert / benötigt', h('span', fmt(placed), h('small', '/ ' + fmt(need)))),
        stat('Unplatziert', fmt(unplaced), unplaced ? 'err' : 'ok'),
        stat('Freistunden Klassen', fmt(stats.classGaps), stats.classGaps ? 'warn' : 'ok'),
        stat('Freistunden Lehrpersonen', fmt(stats.teacherGaps)),
      ),
      h('div.mt12', U.meter(ratio, { label: SW.fmtPct(ratio) + ' platziert', cls: unplaced ? 'warn' : 'ok' })),
    ];
    if (unplaced) body.push(h('div.mt12', U.banner(h('span', h('b', SW.plural(unplaced, 'Lektion', 'Lektionen') + ' ohne Platz. '), 'Details und Ursachen im Generator.'), 'warn', { action: linkBtn('#/generator', 'Anzeigen', 'sm') })));
    if (conflicts) body.push(h('div.mt12', U.banner(h('span', h('b', SW.plural(conflicts, 'Konflikt', 'Konflikte') + ' im Plan. '), 'Stammdaten wurden nach dem Generieren geändert oder Lektionen manuell verschoben.'), 'err', { action: linkBtn('#/stundenplan', 'Prüfen', 'sm') })));
    return U.card({ title: 'Stundenplan', icon: '🗓️', sub: subParts.join(' · '),
      actions: [h('span.chip' + (published ? '.ok' : '.warn'), h('span.dot'), published ? 'Veröffentlicht' : 'Entwurf')],
      body,
      footer: [linkBtn('#/generator', 'Neu generieren', '', 'refresh'), linkBtn('#/stundenplan', 'Stundenplan öffnen', 'primary', 'grid')] });
  }

  // ---------- Machbarkeitsanalyse ----------
  function feasibilityCard(st) {
    const U = SW.ui, D = SW.domain;
    const f = D.feasibility(st);
    const infos = f.issues.length - f.errors - f.warnings;
    const chips = [
      h('span.chip' + (f.errors ? '.err' : ''), SW.plural(f.errors, 'Fehler', 'Fehler')),
      h('span.chip' + (f.warnings ? '.warn' : ''), SW.plural(f.warnings, 'Warnung', 'Warnungen')),
      h('span.chip' + (infos ? '.info' : ''), SW.plural(infos, 'Hinweis', 'Hinweise')),
    ];
    const body = [];
    if (!f.issues.length) body.push(U.banner(h('span', h('b', 'Alles bereit. '), 'Keine Hindernisse gefunden – der Generator kann starten.'), 'ok'));
    else if (f.ok) body.push(U.banner(h('span', h('b', 'Generierung möglich. '), 'Keine Fehler; Warnungen und Hinweise können das Ergebnis verschlechtern.'), 'ok'));
    else body.push(U.banner(h('span', h('b', SW.plural(f.errors, 'Fehler blockiert', 'Fehler blockieren') + ' die Generierung. '), 'Die Einträge unten führen direkt zur Ursache.'), 'err'));
    if (f.issues.length) {
      const list = h('div.dash-list.mt12');
      for (const it of f.issues.slice(0, 6)) {
        const dotCls = it.level === 'error' ? 'err' : it.level === 'warn' ? 'warn' : 'info';
        const row = h((it.link ? 'a' : 'div') + '.dash-issue', it.link ? { href: it.link } : null,
          h('span.dot.' + dotCls), h('div.grow', h('div.ttl', it.title), it.text ? h('div.txt', it.text) : null), it.link ? SW.icon('chevronRight') : null);
        list.append(row);
      }
      body.push(list);
      if (f.issues.length > 6) body.push(h('div.small.muted.mt8', `${fmt(f.issues.length - 6)} weitere Einträge in der Machbarkeitsanalyse des Generators.`));
    }
    return U.card({ title: 'Machbarkeitsanalyse', icon: '🔍', actions: chips, body, footer: [linkBtn('#/generator', 'Alle anzeigen', 'ghost', 'arrowRight')] });
  }

  // ---------- Startklar-Checkliste ----------
  function checklistCard(st, F) {
    const U = SW.ui, D = SW.domain;
    const curOk = st.curricula.filter((c) => (c.subjects || []).some((s) => Object.values(s.lessons || {}).some((n) => Number(n) > 0)));
    const tAvail = F.active.filter((t) => Object.values(t.availability || {}).some((a) => Array.isArray(a) && a.some(Boolean)));
    const clsOk = st.classes.filter((k) => k.curriculumId && D.curriculumOf(st, k.curriculumId) && k.schoolDays?.length);
    const items = [
      { done: F.teachRooms.length > 0, label: 'Räume erfasst', sub: F.teachRooms.length ? SW.plural(F.teachRooms.length, 'Unterrichtsraum', 'Unterrichtsräume') : 'Schulzimmer, Informatikzimmer, Turnhallen …', link: '#/raeume' },
      { done: st.subjects.length > 0, label: 'Fächer erfasst', sub: st.subjects.length ? SW.plural(st.subjects.length, 'Fach', 'Fächer') : 'Mit Raumanforderung und Doppellektion', link: '#/faecher' },
      { done: curOk.length > 0, label: 'Lehrgänge mit Lektionentafel', sub: curOk.length ? `${fmt(curOk.length)} von ${fmt(st.curricula.length)} mit Lektionen` : 'Lektionen pro Fach und Lehrjahr', link: '#/lehrgaenge' },
      { done: tAvail.length > 0, label: 'Lehrpersonen mit Verfügbarkeit', sub: tAvail.length ? `${fmt(tAvail.length)} von ${fmt(F.active.length)} mit Verfügbarkeit` : 'Fächer und verfügbare Lektionen hinterlegen', link: '#/lehrpersonen' },
      { done: st.classes.length > 0 && clsOk.length === st.classes.length, label: 'Klassen mit Schultagen und Lehrgang', sub: st.classes.length ? `${fmt(clsOk.length)} von ${fmt(st.classes.length)} vollständig` : 'Lehrgang, Lehrjahr und Schultage festlegen', link: '#/klassen' },
      { done: !!st.timetable, label: 'Stundenplan generiert', sub: st.timetable ? `Erstellt am ${SW.fmtDate(new Date(st.timetable.createdAt || Date.now()))}` : 'Generator starten, sobald alles erfasst ist', link: st.timetable ? '#/stundenplan' : '#/generator' },
    ];
    const done = items.filter((i) => i.done).length;
    const body = [U.meter(done / items.length, { label: `${done} von ${items.length}`, cls: done === items.length ? 'ok' : '' })];
    const list = h('div.dash-list.mt8');
    for (const it of items) list.append(h('a.dash-check' + (it.done ? '.done' : ''), { href: it.link },
      h('span.ic', SW.icon('check')), h('div.grow', h('div.lbl', it.label), h('div.sub', it.sub)), SW.icon('chevronRight', 'chev')));
    body.push(list);
    if (done === items.length) body.push(h('div.mt8', U.banner('Startklar – alle Schritte sind erledigt.', 'ok')));
    return U.card({ title: 'Startklar-Checkliste', icon: '✅', sub: done === items.length ? 'Alles erledigt' : `${done} von ${items.length} Schritten erledigt`, body });
  }

  // ---------- Heute ----------
  function todayCard(st) {
    const U = SW.ui, D = SW.domain, M = SW.model;
    const today = SW.isoDate(); const wd = SW.weekday(today);
    const schoolDay = D.days(st).includes(wd) && wd <= 5;
    const tt = st.timetable;
    const body = [];
    if (!schoolDay) {
      body.push(U.banner(h('span', h('b', 'Kein Schultag. '), `Am ${M.dayName(wd)} findet kein Unterricht statt.`), '', { icon: '🌤️' }));
    } else {
      const classes = st.classes.filter((k) => (k.schoolDays || []).includes(wd));
      const lessonsToday = tt ? SW.sum(D.lessonsFor(tt, { day: wd }), (l) => l.len || 1) : null;
      body.push(h('div.dash-stats',
        stat('Klassen mit Schule', fmt(classes.length)),
        stat('Lektionen laut Plan', lessonsToday == null ? '–' : fmt(lessonsToday)),
      ));
      if (classes.length) {
        const chips = h('div.dash-today-cls.mt12');
        const shown = classes.slice(0, 14);
        for (const k of shown) chips.append(h('a.chip', { href: tt ? `#/stundenplan?view=klasse&id=${k.id}` : `#/klassen/${k.id}`, title: k.name }, k.name));
        if (classes.length > shown.length) chips.append(h('span.chip.outline', `+${fmt(classes.length - shown.length)} weitere`));
        body.push(chips);
      } else if (st.classes.length) body.push(h('div.small.muted.mt12', `Keine Klasse hat am ${M.dayName(wd)} Schule.`));
      if (!tt && st.classes.length) body.push(h('div.small.muted.mt8', 'Noch kein Plan – Lektionen erscheinen nach dem Generieren.'));
    }
    // Buchungen heute (auch an Wochenenden möglich)
    const bookings = SW.sortBy((st.bookings || []).filter((b) => b.date === today), (b) => b.from || '');
    body.push(h('h4.mt16.mb8', 'Buchungen heute'));
    if (!bookings.length) body.push(h('div.small.muted', 'Keine Raumbuchungen für heute.'));
    else {
      const list = h('div.dash-list');
      for (const b of bookings) {
        const kind = M.BOOKING_KINDS.find((k) => k.id === b.kind); const room = D.roomOf(st, b.roomId);
        const statusCls = b.status === 'bestätigt' ? '.ok' : b.status === 'erledigt' ? '' : '.warn';
        list.append(h('div.dash-booking', h('span.ic', kind?.icon || '📌'),
          h('div.grow', h('div.ttl.trunc', b.title || kind?.name || 'Buchung'), h('div.sub', [b.from && b.to ? `${b.from}–${b.to}` : null, room ? room.name : null, kind?.name].filter(Boolean).join(' · '))),
          b.status ? h('span.chip.sm' + statusCls, b.status) : null));
      }
      body.push(list);
    }
    return U.card({ title: 'Heute', icon: '📅', sub: SW.fmtDateLong(today), body,
      actions: U.isPro() && bookings.length ? [linkBtn('#/hauswart', 'Hauswart', 'sm.ghost')] : null });
  }

  // ---------- Auslastung (nur mit Plan) ----------
  function utilCard(st) {
    const U = SW.ui, D = SW.domain;
    const tt = st.timetable; if (!tt) return null;
    const stats = D.ttStats(st, tt);
    const rooms = SW.sortBy(stats.rooms, (r) => -r.util, (r) => r.name).slice(0, 5);
    const teachers = SW.sortBy(stats.teachers.filter((t) => t.max > 0), (t) => -(t.lessons / t.max), (t) => t.label).slice(0, 5);
    const roomCol = h('div', h('h4.mb8', 'Räume nach Belegung'));
    if (!rooms.length) roomCol.append(h('div.small.muted', 'Keine Unterrichtsräume erfasst.'));
    for (const r of rooms) roomCol.append(h('a.dash-util-row', { href: `#/stundenplan?view=raum&id=${r.id}` },
      h('div', h('div.nm.trunc', r.name), h('div.tiny.faint', `${fmt(r.lessons)} von ${fmt(r.cap)} Lektionen`)), U.meter(r.util, { label: SW.fmtPct(r.util) })));
    const teachCol = h('div', h('h4.mb8', 'Lehrpersonen nach Pensum'));
    if (!teachers.length) teachCol.append(h('div.small.muted', 'Keine Lehrpersonen erfasst.'));
    for (const t of teachers) {
      const teacher = D.teacherOf(st, t.id); const ratio = t.lessons / t.max;
      teachCol.append(h('a.dash-util-row', { href: `#/stundenplan?view=lehrperson&id=${t.id}` },
        h('div', U.teacherPill(teacher)), U.meter(ratio, { label: `${fmt(t.lessons)} / ${fmt(t.max)}`, cls: ratio > 1 ? 'err' : ratio > 0.85 ? 'warn' : 'ok' })));
    }
    return U.card({ title: 'Auslastung', icon: '📊', sub: `Ø Raumauslastung ${SW.fmtPct(stats.roomUtil)} · ${fmt(stats.total)} Lektionen im Plan`, body: h('div.dash-util', roomCol, teachCol),
      footer: U.isPro() ? [linkBtn('#/auswertung', 'Auswertungen', 'ghost', 'chart')] : null });
  }

  // ---------- Pro-Teaser ----------
  function proTeaser() {
    const U = SW.ui, M = SW.model;
    if (U.isPro()) return null;
    const feats = ['calendar', 'chat', 'facility'].map((id) => M.proFeature(id)).filter(Boolean);
    const open = (id) => () => U.paywall(id, () => SW.router.refresh());
    return h('div',
      h('div.flex.ai-e.jc-b.g8.wrap.mb12', h('div', h('h2', 'STUNDENWERK Pro'), h('div.small.muted', 'Erweiterungen für den Schulalltag – in dieser Demo per simuliertem Kauf freischaltbar.')), h('span.chip.pro', `CHF ${fmt(M.APP.proPrice)} / Monat pro Schule`)),
      h('div.grid.c3', feats.map((f) => h('div.card.dash-pro.clickable', { role: 'button', tabindex: '0', onclick: open(f.id), onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(f.id)(); } } },
        h('div.ic', f.icon), U.lockBadge(), h('div.strong', f.name), h('div.small.muted', f.desc)))));
  }

  // ---------- Leerzustand ohne Daten ----------
  function emptyHero() {
    const U = SW.ui;
    return h('div.card.dash-hero', U.empty({ icon: '🗓️', title: 'Willkommen bei STUNDENWERK',
      text: 'Noch keine Daten vorhanden. Der Demo-Datensatz nach dem Muster einer grossen kaufmännischen Berufsfachschule ist sofort bereit zum Generieren – oder alles selbst erfassen: Räume, Fächer, Lehrgänge, Lehrpersonen und Klassen.',
      action: h('div.flex.jc-c.g8.wrap.mt8',
        h('button.btn.primary.lg', { onclick: () => { SW.store.loadDemo(); U.toast('Demo-Daten geladen', { type: 'ok' }); } }, '🚀 Demo-Datensatz laden'),
        h('button.btn.lg', { onclick: () => { SW.store.update((s) => { s.settings.onboarded = true; }); SW.router.go('#/raeume'); } }, SW.icon('plus'), 'Leer starten')) }));
  }

  SW.views['dashboard'] = {
    title: 'Dashboard',
    render(el) {
      SW.ui.injectCSS('dashboard', CSS);
      const U = SW.ui; const st = SW.store.state; const s = st.settings;
      const F = facts(st);
      const noData = !st.classes.length && !st.rooms.length;
      const lead = [s.schoolName, s.schoolYear ? `Schuljahr ${s.schoolYear}` : null, SW.fmtDateLong(SW.isoDate())].filter(Boolean).join(' · ');
      const actions = noData ? [] : st.timetable
        ? [linkBtn('#/generator', 'Generator', '', 'wand'), linkBtn('#/stundenplan', 'Stundenplan öffnen', 'primary', 'grid')]
        : [linkBtn('#/generator', 'Stundenplan generieren', 'primary', 'wand')];
      el.append(U.pageHeader({ title: 'Dashboard', lead, actions }));

      if (noData) {
        el.append(emptyHero(), h('div.dash-grid', h('div.dash-col', checklistCard(st, F)), h('div.dash-col', todayCard(st))), proTeaser());
        return;
      }
      el.append(
        kpiRow(st, F),
        h('div.dash-grid',
          h('div.dash-col', planCard(st, F), feasibilityCard(st), utilCard(st)),
          h('div.dash-col', todayCard(st), checklistCard(st, F)),
        ),
        proTeaser(),
      );
    },
  };
})();
