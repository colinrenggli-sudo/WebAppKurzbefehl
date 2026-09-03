/* STUNDENWERK · views/rooms.js — Räume.
   Routen:  #/raeume            Liste (Karten oder Tabelle) mit Suche, Filter Raumtyp/Gebäude, Anlegen, Mehrfach-Anlage
            #/raeume/:id        Detail: Kopf, Kennzahlen, Wochenbelegung (Plan), Stammzimmer-Klassen, Buchungen, Ausstattung
   Schreibt ausschliesslich über SW.store (add/put/patch/remove/update); der Router rendert danach neu.
   Eigene CSS-Klassen mit Präfix .rm- (per SW.ui.injectCSS). */
(function () {
  const SW = (globalThis.SW = globalThis.SW || {});
  SW.views = SW.views || {};
  const h = SW.h; const M = SW.model; const U = SW.ui; const D = SW.domain;

  const CSS = `
.rm-toolbar select.inp{width:auto;min-width:172px;max-width:250px}
.rm-toolbar .rm-count{font-size:13px;color:var(--txt-3);white-space:nowrap;font-variant-numeric:tabular-nums}
@media (max-width:600px){.rm-toolbar .search{max-width:none;flex-basis:100%}.rm-toolbar select.inp{flex:1;min-width:0;max-width:none}.rm-toolbar .rm-count{display:none}}
.rm-ic{width:44px;height:44px;border-radius:12px;background:var(--card-3);display:grid;place-items:center;font-size:23px;flex:none;line-height:1}
.rm-ic.sm{width:32px;height:32px;border-radius:9px;font-size:17px}
.rm-ic.lg{width:76px;height:76px;border-radius:22px;font-size:42px;background:var(--tint-soft)}
.rm-card{display:flex;flex-direction:column;gap:10px;padding:14px 16px;outline:none}
.rm-card:focus-visible{box-shadow:var(--ring)}
.rm-card.inactive{opacity:.62;border-style:dashed}
.rm-card .rm-top{display:flex;align-items:flex-start;gap:12px}
.rm-card .rm-name{font-weight:650;font-size:15.5px;line-height:1.25;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rm-card .rm-top .btn{margin:-6px -8px 0 0}
.rm-meta{display:flex;gap:6px 14px;flex-wrap:wrap;font-size:13px;color:var(--txt-2);align-items:center;min-width:0}
.rm-meta span{display:inline-flex;align-items:center;gap:5px;min-width:0}
.rm-meta svg.i{width:15px;height:15px;color:var(--txt-3)}
.rm-feats{display:flex;flex-wrap:wrap;gap:4px}
.rm-card .rm-occ{margin-top:auto;padding-top:8px;border-top:1px solid var(--sep)}
.rm-card .rm-occ .meter .num{min-width:88px}
.rm-tbl .meter{min-width:150px}
.rm-tbl .meter .num{min-width:78px}
.rm-tbl tr.rm-off td{opacity:.55}
.rm-head{display:flex;align-items:center;gap:18px;flex-wrap:wrap}
.rm-head .grow{min-width:0}
.rm-head h1{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.rm-head .chips{margin-top:8px}
.rm-head .actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.rm-types{display:grid;grid-template-columns:repeat(auto-fill,minmax(215px,1fr));gap:8px;text-align:left;width:100%}
.rm-type{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:var(--r-s);background:var(--card-2);font-size:13px;min-width:0}
.rm-type .rm-ic{width:36px;height:36px;font-size:19px;border-radius:10px;background:var(--card)}
.rm-type b{display:block;font-size:13.5px;line-height:1.3}
.rm-type .d{color:var(--txt-3);font-size:12px;line-height:1.35;margin-top:2px}
.rm-empty{align-items:stretch}
.rm-empty .rm-empty-top{display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px}
.rm-empty .rm-empty-top p{max-width:56ch;color:var(--txt-2)}
.rm-empty h4{margin-top:22px;margin-bottom:10px}
.rm-book .rm-date{display:flex;flex-direction:column;align-items:center;justify-content:center;width:46px;height:46px;border-radius:10px;background:var(--card-3);flex:none;line-height:1.1}
.rm-book .rm-date b{font-size:17px;font-weight:720;font-variant-numeric:tabular-nums}
.rm-book .rm-date span{font-size:10.5px;color:var(--txt-3);text-transform:uppercase;letter-spacing:.04em}
.rm-book li.past{opacity:.55}
.rm-bulk-preview{background:var(--card-2);border-radius:var(--r-s);padding:10px 12px;font-size:13px;color:var(--txt-2);line-height:1.45}
.rm-legend{margin-top:10px}
.rm-legend i.free{background:repeating-linear-gradient(135deg,var(--card-3) 0 3px,transparent 3px 6px);border:1px solid var(--sep-2)}
.rm-legend i.ls{background:color-mix(in srgb,var(--tint) 20%,var(--card));border-left:3px solid var(--tint);border-radius:3px;min-height:0;padding:0;width:14px;height:14px;flex:none}
`;

  // UI-Zustand der Liste – überlebt das Neu-Rendern nach Store-Änderungen
  const L = { q: '', type: '', building: '', mode: SW.lsGet('stundenwerk.rooms.mode', 'cards') === 'table' ? 'table' : 'cards' };

  // ---------- Helfer ----------
  const st = () => SW.store.state;
  const canEdit = () => st().settings.role !== 'teacher';
  const typeOf = (r) => M.roomType(r.type);
  const featName = (id) => (M.ROOM_FEATURES.find((f) => f.id === id) || { name: id }).name;
  const byName = (a, b) => String(a).localeCompare(String(b), 'de', { numeric: true, sensitivity: 'base' });
  const sortRooms = (rooms) => [...rooms].sort((a, b) => (a.active === false) - (b.active === false) || byName(a.name, b.name));
  const buildingsOf = (state) => SW.uniq(state.rooms.map((r) => (r.building || '').trim()).filter(Boolean)).sort(byName);
  const floorsOf = (state) => SW.uniq(state.rooms.map((r) => (r.floor || '').trim()).filter(Boolean)).sort(byName);
  const weekCap = (state) => D.days(state).length * D.slotCount(state);
  const nameExists = (state, name, exceptId) => { const n = String(name || '').trim().toLowerCase(); return state.rooms.some((r) => r.id !== exceptId && String(r.name || '').trim().toLowerCase() === n); };
  const uniqueName = (state, base) => { let n = base, i = 2; while (nameExists(state, n)) n = `${base} ${i++}`; return n; };
  const homeClasses = (state, roomId) => state.classes.filter((k) => k.homeRoomId === roomId);
  const plural = (n, one, many) => `${SW.fmtNum(n)} ${n === 1 ? one : many}`;

  // Wöchentliche Sperrzeiten: room.blocked = {day:[bool×slots]}. Im Formular als Verfügbarkeitsraster (grün = frei) bearbeitet.
  const isBlocked = (r, d, s) => (D.roomBlocked ? D.roomBlocked(r, d, s) : !!(r.blocked && r.blocked[d] && r.blocked[d][s - 1]));
  const blockedCount = (state, r) => { let n = 0; for (const d of D.days(state)) for (let s = 1; s <= D.slotCount(state); s++) if (isBlocked(r, d, s)) n++; return n; };
  const blockedToAvail = (state, blocked) => { const v = {}; for (const d of D.days(state)) v[d] = SW.range(D.slotCount(state)).map((i) => !(blocked && blocked[d] && blocked[d][i])); return v; };
  const availToBlocked = (state, avail) => { const b = {}; for (const d of D.days(state)) { const arr = (avail[d] || []).map((x) => !x); if (arr.some(Boolean)) b[d] = arr; } return b; };
  const busyOf = (state, roomId) => { const busy = {}; for (const l of D.lessonsFor(state.timetable, { roomId })) { const k = D.classOf(state, l.classId), s = D.subjectOf(state, l.subjectId); busy[l.day] = busy[l.day] || []; for (let q = 0; q < (l.len || 1); q++) busy[l.day][l.slot - 1 + q] = `${k?.name || '?'} · ${s?.short || s?.name || '?'}`; } return busy; };

  // Belegung aus dem aktuellen Plan: Lektionen pro Woche je Raum (null = kein Plan vorhanden)
  const occupancyMap = (state) => { const tt = state.timetable; if (!tt) return null; const m = {}; for (const l of tt.lessons || []) if (l.roomId) m[l.roomId] = (m[l.roomId] || 0) + (l.len || 1); return m; };
  const occOf = (state, map, roomId) => { if (!map) return null; const cap = weekCap(state); const n = map[roomId] || 0; return { lessons: n, cap, ratio: cap ? n / cap : 0 }; };
  const occMeter = (o) => U.meter(o.ratio, { label: `${Math.round(o.ratio * 100)} % · ${plural(o.lessons, 'Lekt.', 'Lekt.')}` });

  // Buchungen eines Raums: kommende zuerst (aufsteigend), danach vergangene (absteigend)
  const roomBookings = (state, roomId) => {
    const today = SW.isoDate();
    const all = (state.bookings || []).filter((b) => b.roomId === roomId);
    const key = (b) => `${b.date || ''} ${b.from || ''}`;
    const up = all.filter((b) => (b.date || '') >= today).sort((a, b) => key(a).localeCompare(key(b)));
    const past = all.filter((b) => (b.date || '') < today).sort((a, b) => key(b).localeCompare(key(a)));
    return { upcoming: up, past, all: up.concat(past) };
  };
  const bookingKind = (id) => M.BOOKING_KINDS.find((k) => k.id === id) || { id, name: id || 'Buchung', icon: '📌' };
  const statusChip = (s) => h('span.chip.sm' + (s === 'bestätigt' ? '.ok' : s === 'offen' ? '.warn' : ''), s || 'offen');

  const goDetail = (id) => SW.router.go('#/raeume/' + id);
  const stop = (fn) => (e) => { e.stopPropagation(); e.preventDefault(); fn(e); };

  // ---------- Formular: Raum anlegen / bearbeiten / duplizieren ----------
  function roomForm({ room, title, sub, isNew, onSave, onDelete }) {
    const state = st();
    const r = SW.clone(room);
    let typeCap = typeOf(r).cap; // Standardkapazität des aktuell gewählten Typs
    const nameIn = U.input({ value: r.name, placeholder: 'z.B. Zimmer 101', oninput: (v) => { r.name = v; nameIn.removeAttribute('aria-invalid'); } });
    const capIn = U.input({ type: 'number', min: 0, step: 1, value: r.capacity ?? '', placeholder: '0', oninput: (v) => { r.capacity = v; capIn.removeAttribute('aria-invalid'); } });
    const typeHint = h('div.hint', typeOf(r).desc);
    const typeSel = U.select(M.ROOM_TYPES.map((t) => ({ value: t.id, label: `${t.icon}  ${t.name}` })), r.type, (v) => {
      const t = M.roomType(v); r.type = t.id; typeHint.textContent = t.desc;
      // Kapazität auf Standard des Typs setzen, wenn das Feld leer oder noch auf dem alten Standard ist
      if (capIn.value === '' || Number(capIn.value) === typeCap) { capIn.value = t.cap; r.capacity = t.cap; }
      typeCap = t.cap;
    });
    const dlB = h('datalist#rm-dl-building', buildingsOf(state).map((b) => h('option', { value: b })));
    const dlF = h('datalist#rm-dl-floor', floorsOf(state).map((f) => h('option', { value: f })));
    const buildingIn = U.input({ value: r.building, placeholder: 'z.B. Hauptgebäude', list: 'rm-dl-building', oninput: (v) => (r.building = v) });
    const floorIn = U.input({ value: r.floor, placeholder: 'z.B. 1. OG', list: 'rm-dl-floor', oninput: (v) => (r.floor = v) });
    const feats = U.chipPicker(M.ROOM_FEATURES, r.features || [], (v) => (r.features = v), { multi: true });
    const activeSw = U.switchEl(r.active !== false, (v) => (r.active = v), 'Aktiv');
    const notes = U.textarea({ value: r.notes || '', placeholder: 'Besonderheiten, Hinweise für den Hauswart …', oninput: (v) => (r.notes = v) });
    const hasPlan = !!state.timetable && !isNew;
    const availGrid = U.availabilityGrid({ value: blockedToAvail(state, r.blocked), onchange: (v) => (r.blocked = availToBlocked(state, v)), busy: hasPlan ? busyOf(state, r.id) : {}, state });
    const blockedInfo = h('span.small.muted');
    const reBlocked = () => SW.mount(blockedInfo, (() => { const n = blockedCount(state, r); return n ? `${plural(n, 'Lektion', 'Lektionen')} pro Woche gesperrt` : 'Keine Sperrzeiten'; })());
    availGrid.addEventListener('mouseup', () => setTimeout(reBlocked, 0)); availGrid.addEventListener('click', () => setTimeout(reBlocked, 0)); availGrid.addEventListener('touchend', () => setTimeout(reBlocked, 0));
    reBlocked();

    const save = () => {
      const name = String(r.name || '').trim();
      if (!name) { nameIn.setAttribute('aria-invalid', 'true'); nameIn.focus(); U.toast('Bitte einen Namen eingeben', { type: 'err' }); return; }
      if (nameExists(st(), name, isNew ? null : r.id)) { nameIn.setAttribute('aria-invalid', 'true'); nameIn.focus(); U.toast(`Es gibt bereits einen Raum «${name}»`, { type: 'err' }); return; }
      const cap = capIn.value === '' ? 0 : Number(capIn.value);
      if (!Number.isFinite(cap) || cap < 0 || Math.round(cap) !== cap) { capIn.setAttribute('aria-invalid', 'true'); capIn.focus(); U.toast('Kapazität muss eine ganze Zahl ab 0 sein', { type: 'err' }); return; }
      const out = { ...r, name, capacity: cap, building: String(r.building || '').trim(), floor: String(r.floor || '').trim(), features: [...(r.features || [])], active: r.active !== false, notes: String(r.notes || '').trim() };
      m.close(); onSave(out);
    };
    const body = h('div.form-grid', { onkeydown: (e) => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); save(); } } },
      h('div.span2', U.field('Name *', nameIn, { hint: 'Muss eindeutig sein' })),
      h('div.field', h('label', 'Raumtyp'), typeSel, typeHint),
      U.field('Kapazität (Plätze)', capIn, { hint: 'Für die Raumzuteilung: Klassengrösse ≤ Kapazität' }),
      U.field('Gebäude', h('div', buildingIn, dlB)),
      U.field('Stockwerk', h('div', floorIn, dlF)),
      h('div.span2', U.field('Ausstattung', feats)),
      h('div.span2.field', h('label', 'Status'), h('div.flex.ai-c.g10', activeSw, h('span.small.muted', 'Aktiv – inaktive Räume werden vom Generator nicht verplant'))),
      h('div.span2', U.field('Notizen', notes)),
    );
    const m = U.modal({
      title, sub, body,
      footer: [
        onDelete ? h('button.btn.danger.soft.left', { onclick: () => { m.close(); onDelete(); } }, SW.icon('trash'), 'Löschen') : null,
        h('button.btn', { onclick: () => m.close() }, 'Abbrechen'),
        h('button.btn.primary', { onclick: save }, SW.icon('check'), isNew ? 'Raum anlegen' : 'Speichern'),
      ],
    });
    return m;
  }

  function openCreate(preset) {
    const room = { ...M.newRoom(), ...(preset || {}) };
    roomForm({ room, title: 'Raum anlegen', sub: 'Ein Raum, der später vom Generator verplant oder für Anlässe gebucht werden kann.', isNew: true,
      onSave: (r) => { SW.store.add('rooms', r); U.toast(`«${r.name}» angelegt`, { type: 'ok', action: { label: 'Öffnen', fn: () => goDetail(r.id) } }); } });
  }
  function openEdit(room) {
    roomForm({ room, title: 'Raum bearbeiten', sub: room.name, isNew: false,
      onSave: (r) => { SW.store.put('rooms', r); U.toast('Gespeichert', { type: 'ok' }); },
      onDelete: () => deleteRoom(room) });
  }
  function openDuplicate(room) {
    const copy = { ...SW.clone(room), id: SW.uid('r'), name: uniqueName(st(), `${room.name} (Kopie)`) };
    roomForm({ room: copy, title: 'Raum duplizieren', sub: `Kopie von «${room.name}» – Name anpassen und speichern.`, isNew: true,
      onSave: (r) => { SW.store.add('rooms', r); U.toast(`«${r.name}» angelegt`, { type: 'ok', action: { label: 'Öffnen', fn: () => goDetail(r.id) } }); } });
  }
  function toggleActive(room) {
    const active = room.active === false;
    SW.store.patch('rooms', room.id, { active });
    U.toast(active ? `«${room.name}» aktiviert` : `«${room.name}» deaktiviert – wird nicht mehr verplant`, { type: active ? 'ok' : 'warn' });
  }
  async function deleteRoom(room, { afterDelete } = {}) {
    const state = st();
    const homes = homeClasses(state, room.id);
    const inPlan = SW.sum(D.lessonsFor(state.timetable, { roomId: room.id }), (l) => l.len || 1);
    const nb = roomBookings(state, room.id).all.length;
    const hints = [];
    if (homes.length) hints.push(`Stammzimmer von ${homes.map((k) => k.name).join(', ')} – die Zuordnung wird entfernt.`);
    if (inPlan) hints.push(`Im aktuellen Stundenplan mit ${plural(inPlan, 'Lektion', 'Lektionen')} belegt – diese Lektionen verlieren ihren Raum.`);
    if (nb) hints.push(`${plural(nb, 'Buchung', 'Buchungen')} werden ebenfalls gelöscht.`);
    const ok = await U.confirm({ title: `«${room.name}» löschen?`, text: (hints.length ? hints.join(' ') + ' ' : '') + 'Dieser Schritt kann nicht rückgängig gemacht werden.', ok: 'Löschen', danger: true });
    if (!ok) return;
    if (afterDelete) afterDelete();
    SW.store.remove('rooms', room.id);
    U.toast(`«${room.name}» gelöscht`);
  }
  function roomMenu(anchor, room, opts) {
    U.menu(anchor, [
      { label: 'Bearbeiten', icon: 'edit', fn: () => openEdit(room) },
      { label: 'Duplizieren', icon: 'copy', fn: () => openDuplicate(room) },
      { label: room.active === false ? 'Aktivieren' : 'Deaktivieren', icon: room.active === false ? 'check' : 'x', fn: () => toggleActive(room) },
      'sep',
      { label: 'Löschen', icon: 'trash', danger: true, fn: () => deleteRoom(room, opts) },
    ]);
  }

  // ---------- Mehrere Räume anlegen ----------
  function openBulk() {
    const state = st();
    const f = { prefix: 'Zimmer', from: 101, to: 110, type: 'klassenzimmer', capacity: 24, building: buildingsOf(state)[0] || 'Hauptgebäude', floor: '', features: ['beamer', 'whiteboard'] };
    const names = () => { const a = Number(f.from), b = Number(f.to); if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return []; const out = []; for (let n = a; n <= b && out.length < 200; n++) out.push(`${String(f.prefix || '').trim()} ${n}`.trim()); return out; };
    const preview = h('div.rm-bulk-preview');
    const rePreview = () => {
      const ns = names(); const skip = ns.filter((n) => nameExists(st(), n));
      SW.clear(preview);
      if (!ns.length) { preview.append(h('span.err-c', 'Bereich prüfen: «bis» muss grösser oder gleich «von» sein.')); return; }
      preview.append(h('div', h('b', `${plural(ns.length - skip.length, 'Raum', 'Räume')} werden angelegt`), ns.length > 3 ? `: ${ns[0]}, ${ns[1]} … ${ns[ns.length - 1]}` : `: ${ns.join(', ')}`), ns.length >= 200 ? h('div.warn-c', 'Maximal 200 Räume pro Durchgang.') : null);
      if (skip.length) preview.append(h('div.warn-c.mt4', `${skip.length} bereits vorhanden und werden übersprungen (${skip.slice(0, 3).join(', ')}${skip.length > 3 ? ' …' : ''}).`));
    };
    let typeCap = M.roomType(f.type).cap;
    const capIn = U.input({ type: 'number', min: 0, step: 1, value: f.capacity, oninput: (v) => (f.capacity = v) });
    const typeHint = h('div.hint', M.roomType(f.type).desc);
    const typeSel = U.select(M.ROOM_TYPES.map((t) => ({ value: t.id, label: `${t.icon}  ${t.name}` })), f.type, (v) => { const t = M.roomType(v); f.type = t.id; typeHint.textContent = t.desc; if (capIn.value === '' || Number(capIn.value) === typeCap) { capIn.value = t.cap; f.capacity = t.cap; } typeCap = t.cap; });
    const body = h('div.form-grid',
      U.field('Präfix', U.input({ value: f.prefix, placeholder: 'z.B. Zimmer', oninput: (v) => { f.prefix = v; rePreview(); } }), { hint: 'Name = Präfix + Nummer' }),
      h('div.flex.g8', U.field('Nummer von', U.input({ type: 'number', value: f.from, oninput: (v) => { f.from = v; rePreview(); } })), U.field('bis', U.input({ type: 'number', value: f.to, oninput: (v) => { f.to = v; rePreview(); } }))),
      h('div.field', h('label', 'Raumtyp'), typeSel, typeHint),
      U.field('Kapazität (Plätze)', capIn),
      U.field('Gebäude', h('div', U.input({ value: f.building, list: 'rm-dl-building2', oninput: (v) => (f.building = v) }), h('datalist#rm-dl-building2', buildingsOf(state).map((b) => h('option', { value: b }))))),
      U.field('Stockwerk', h('div', U.input({ value: f.floor, placeholder: 'z.B. 1. OG', list: 'rm-dl-floor2', oninput: (v) => (f.floor = v) }), h('datalist#rm-dl-floor2', floorsOf(state).map((x) => h('option', { value: x }))))),
      h('div.span2', U.field('Ausstattung', U.chipPicker(M.ROOM_FEATURES, f.features, (v) => (f.features = v), { multi: true }))),
      h('div.span2', preview),
    );
    rePreview();
    const m = U.modal({
      title: 'Mehrere Räume anlegen', sub: 'Gleichartige Räume in einem Schritt, z.B. Zimmer 101 bis 112.', body,
      footer: [
        h('button.btn', { onclick: () => m.close() }, 'Abbrechen'),
        h('button.btn.primary', { onclick: () => {
          const ns = names(); if (!ns.length) { U.toast('Bereich prüfen', { type: 'err' }); return; }
          const cap = capIn.value === '' ? 0 : Number(capIn.value);
          if (!Number.isFinite(cap) || cap < 0) { U.toast('Kapazität muss 0 oder grösser sein', { type: 'err' }); return; }
          const fresh = ns.filter((n) => !nameExists(st(), n));
          if (!fresh.length) { U.toast('Alle Namen existieren bereits', { type: 'warn' }); return; }
          SW.store.update((s) => { for (const name of fresh) s.rooms.push({ ...M.newRoom(), name, type: f.type, capacity: cap, building: String(f.building || '').trim(), floor: String(f.floor || '').trim(), features: [...f.features], active: true, notes: '' }); }, { coll: 'rooms', op: 'bulk' });
          m.close();
          U.toast(`${plural(fresh.length, 'Raum', 'Räume')} angelegt` + (ns.length - fresh.length ? ` · ${ns.length - fresh.length} übersprungen` : ''), { type: 'ok' });
        } }, SW.icon('plus'), 'Anlegen'),
      ],
    });
  }

  // Standard-Räume für den leeren Zustand: 6 Schulzimmer, 2 Informatik, 1 Turnhalle, 1 Aula
  function createDefaults() {
    const defs = [];
    for (let i = 1; i <= 6; i++) defs.push({ name: `Zimmer ${100 + i}`, type: 'klassenzimmer', capacity: 24, building: 'Hauptgebäude', floor: '1. OG', features: ['beamer', 'whiteboard', 'wandtafel'] });
    for (let i = 1; i <= 2; i++) defs.push({ name: `Informatik ${200 + i}`, type: 'informatik', capacity: 24, building: 'Hauptgebäude', floor: '2. OG', features: ['pc', 'beamer'] });
    defs.push({ name: 'Turnhalle', type: 'turnhalle', capacity: 30, building: 'Sporttrakt', floor: 'EG', features: ['lautsprecher'] });
    defs.push({ name: 'Aula', type: 'aula', capacity: 200, building: 'Hauptgebäude', floor: 'EG', features: ['buehne', 'lautsprecher', 'beamer', 'verdunkelung'] });
    const fresh = defs.filter((d) => !nameExists(st(), d.name));
    if (!fresh.length) { U.toast('Standard-Räume sind bereits vorhanden', { type: 'warn' }); return; }
    SW.store.update((s) => { for (const d of fresh) s.rooms.push({ ...M.newRoom(), ...d, active: true, notes: '' }); }, { coll: 'rooms', op: 'bulk' });
    U.toast(`${plural(fresh.length, 'Standard-Raum', 'Standard-Räume')} angelegt`, { type: 'ok' });
  }

  // ---------- Bausteine der Liste ----------
  const featChips = (ids, max = 4) => { const list = ids || []; const shown = list.slice(0, max); return h('div.rm-feats', shown.map((id) => h('span.chip.sm', featName(id))), list.length > max ? h('span.chip.sm.outline', `+${list.length - max}`) : null); };
  const inactiveChip = () => h('span.chip.sm.outline', 'Inaktiv');
  const placeText = (r) => [r.building, r.floor].filter((x) => x && String(x).trim()).join(' · ');

  function roomCard(state, r, occ, edit) {
    const t = typeOf(r);
    const card = h('div.card.clickable.rm-card' + (r.active === false ? '.inactive' : ''), { tabindex: '0', role: 'link', 'aria-label': r.name, onclick: () => goDetail(r.id), onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goDetail(r.id); } } },
      h('div.rm-top',
        h('span.rm-ic', { title: t.name }, t.icon),
        h('div.grow', h('div.rm-name', { title: r.name }, r.name), h('div.flex.ai-c.g6.wrap.mt4', h('span.chip.sm.tint', t.name), r.active === false ? inactiveChip() : null)),
        edit ? h('button.btn.icon.ghost.sm', { 'aria-label': 'Aktionen', title: 'Aktionen', onclick: stop((e) => roomMenu(e.currentTarget, r)) }, SW.icon('more')) : null),
      h('div.rm-meta',
        h('span', { title: 'Kapazität' }, SW.icon('users'), h('b.num', SW.fmtNum(r.capacity || 0)), h('span.faint', 'Plätze')),
        placeText(r) ? h('span', { title: 'Gebäude · Stockwerk' }, SW.icon('building'), placeText(r)) : null),
      (r.features || []).length ? featChips(r.features) : h('div.tiny.faint', 'Keine Ausstattung erfasst'),
      occ ? h('div.rm-occ', t.teachable ? occMeter(occ) : h('div.tiny.faint', 'Kein Unterrichtsraum – nur Buchungen')) : null,
    );
    return card;
  }

  function roomTable(state, rooms, occMap, edit) {
    const cols = [
      { label: 'Name', render: (r) => h('div.flex.ai-c.g10', h('span.rm-ic.sm', typeOf(r).icon), h('div', h('div.strong', r.name), r.active === false ? inactiveChip() : null)) },
      { label: 'Typ', render: (r) => h('span.chip.sm.tint', typeOf(r).name) },
      { label: 'Kapazität', cls: 'r', render: (r) => h('span.num', SW.fmtNum(r.capacity || 0)) },
      { label: 'Gebäude', render: (r) => r.building || h('span.faint', '–') },
      { label: 'Stockwerk', render: (r) => r.floor || h('span.faint', '–') },
      { label: 'Ausstattung', render: (r) => ((r.features || []).length ? featChips(r.features, 3) : h('span.faint', '–')) },
      { label: 'Belegung', render: (r) => { const o = occOf(state, occMap, r.id); if (!o) return h('span.faint', { title: 'Noch kein Stundenplan' }, '–'); if (!typeOf(r).teachable) return h('span.faint', 'kein Unterricht'); return occMeter(o); } },
      { label: 'Aktionen', cls: 'act', render: (r) => h('div.flex.jc-e.g4',
        h('a.btn.icon.ghost.sm', { href: '#/raeume/' + r.id, 'aria-label': 'Öffnen', title: 'Öffnen' }, SW.icon('chevronRight')),
        edit ? h('button.btn.icon.ghost.sm', { 'aria-label': 'Bearbeiten', title: 'Bearbeiten', onclick: stop(() => openEdit(r)) }, SW.icon('edit')) : null,
        edit ? h('button.btn.icon.ghost.sm', { 'aria-label': 'Aktionen', title: 'Weitere Aktionen', onclick: stop((e) => roomMenu(e.currentTarget, r)) }, SW.icon('more')) : null) },
    ];
    return h('div.card', U.table({ cols, rows: rooms, onRow: (r) => goDetail(r.id), cls: 'rm-tbl', rowClass: (r) => (r.active === false ? 'rm-off' : '') }));
  }

  function typeOverview() {
    return h('div.rm-types', M.ROOM_TYPES.map((t) => h('div.rm-type', h('span.rm-ic', t.icon), h('div.grow', h('b', t.name, ' ', t.teachable ? null : h('span.chip.sm.outline', 'kein Unterricht')), h('div.d', t.desc)))));
  }

  function emptyState(edit) {
    return h('div.card.pad.empty.rm-empty',
      h('div.rm-empty-top',
        h('div.big', '🏫'),
        h('h3', 'Noch keine Räume erfasst'),
        h('p', 'Räume sind die Grundlage jedes Stundenplans: Der Generator weist jeder Lektion einen passenden Raum zu – nach Raumtyp (z.B. Informatikzimmer für IKA) und Kapazität. Räume, in denen nicht unterrichtet wird, lassen sich für Anlässe und Sitzungen buchen.'),
        edit ? h('div.flex.g8.wrap.jc-c.mt8', h('button.btn.primary', { onclick: () => openCreate() }, SW.icon('plus'), 'Raum anlegen'), h('button.btn', { onclick: createDefaults }, SW.icon('sparkles'), 'Standard-Räume anlegen'), h('button.btn.ghost', { onclick: openBulk }, 'Mehrere anlegen')) : h('p.small.faint', 'Räume werden von der Planung erfasst.'),
        edit ? h('div.tiny.faint', 'Standard: 6 Schulzimmer, 2 Informatikzimmer, 1 Turnhalle, 1 Aula') : null),
      h('h4', 'Raumtypen'),
      typeOverview(),
    );
  }

  // ---------- Liste ----------
  function renderList(el, state) {
    const edit = canEdit();
    const rooms = sortRooms(state.rooms);
    const occMap = occupancyMap(state);
    const actions = edit ? [h('button.btn', { onclick: openBulk }, SW.icon('copy'), 'Mehrere anlegen'), h('button.btn.primary', { onclick: () => openCreate() }, SW.icon('plus'), 'Raum anlegen')] : [];
    el.append(U.pageHeader({ title: 'Räume', lead: 'Unterrichtsräume, Spezialräume und buchbare Räume der Schule. Der Generator berücksichtigt Raumtyp, Kapazität und Stammzimmer.', actions }));

    if (!rooms.length) { el.append(emptyState(edit)); return; }

    // Kennzahlen
    const teach = rooms.filter((r) => r.active !== false && typeOf(r).teachable);
    const inactive = rooms.filter((r) => r.active === false).length;
    const seats = SW.sum(teach, (r) => Number(r.capacity) || 0);
    const utils = occMap ? teach.map((r) => occOf(state, occMap, r.id).ratio) : [];
    const avgUtil = utils.length ? SW.sum(utils) / utils.length : null;
    el.append(h('div.grid.c4',
      U.kpi({ label: 'Räume', icon: '🚪', value: SW.fmtNum(rooms.length), sub: inactive ? `${inactive} inaktiv` : 'alle aktiv' }),
      U.kpi({ label: 'Unterrichtsräume', icon: '🏫', value: SW.fmtNum(teach.length), sub: `${SW.fmtNum(teach.length * weekCap(state))} Raumplätze pro Woche` }),
      U.kpi({ label: 'Plätze', icon: '👥', value: SW.fmtNum(seats), sub: 'in aktiven Unterrichtsräumen' }),
      U.kpi({ label: 'Ø Auslastung', icon: '📊', value: avgUtil == null ? '–' : Math.round(avgUtil * 100) + ' %', sub: avgUtil == null ? 'noch kein Stundenplan' : `${SW.fmtNum(SW.sum(Object.values(occMap)))} Lektionen im Plan`, onclick: avgUtil == null ? () => SW.router.go('#/generator') : null }),
    ));

    // Toolbar
    const body = h('div');
    const count = h('span.rm-count');
    const search = U.input({ value: L.q, placeholder: 'Suchen: Name, Gebäude, Stockwerk', oninput: SW.debounce((v) => { L.q = v; refresh(); }, 120) });
    const typeSel = U.select(M.ROOM_TYPES.filter((t) => rooms.some((r) => r.type === t.id) || t.id === L.type).map((t) => ({ value: t.id, label: `${t.icon}  ${t.name}` })), L.type, (v) => { L.type = v || ''; refresh(); }, { placeholder: 'Alle Raumtypen' });
    const bSel = U.select(buildingsOf(state).map((b) => ({ value: b, label: b })), L.building, (v) => { L.building = v || ''; refresh(); }, { placeholder: 'Alle Gebäude' });
    const resetBtn = h('button.btn.ghost.sm', { onclick: () => { L.q = ''; L.type = ''; L.building = ''; search.value = ''; typeSel.value = ''; bSel.value = ''; refresh(); } }, SW.icon('x'), 'Filter zurücksetzen');
    const seg = U.seg([{ value: 'cards', label: 'Karten' }, { value: 'table', label: 'Tabelle' }], L.mode, (v) => { L.mode = v; SW.lsSet('stundenwerk.rooms.mode', v); refresh(); });
    el.append(h('div.toolbar.rm-toolbar', h('div.search', SW.icon('search'), search), typeSel, bSel, resetBtn, h('div.spacer'), count, seg), body);

    const filtered = () => {
      const q = L.q.trim().toLowerCase();
      return rooms.filter((r) => (!L.type || r.type === L.type) && (!L.building || (r.building || '').trim() === L.building) && (!q || [r.name, r.building, r.floor, typeOf(r).name].some((x) => String(x || '').toLowerCase().includes(q))));
    };
    function refresh() {
      const list = filtered();
      const active = !!(L.q.trim() || L.type || L.building);
      resetBtn.classList.toggle('hide', !active);
      SW.mount(count, active ? `${SW.fmtNum(list.length)} von ${SW.fmtNum(rooms.length)} Räumen` : plural(rooms.length, 'Raum', 'Räume'));
      if (!list.length) { SW.mount(body, h('div.card', U.empty({ icon: '🔍', title: 'Keine Räume gefunden', text: 'Kein Raum passt zu Suche und Filtern.', action: h('button.btn', { onclick: () => resetBtn.click() }, 'Filter zurücksetzen') }))); return; }
      if (L.mode === 'table') SW.mount(body, roomTable(state, list, occMap, edit));
      else SW.mount(body, h('div.grid.auto', list.map((r) => roomCard(state, r, occOf(state, occMap, r.id), edit))));
    }
    refresh();
  }

  // ---------- Detail ----------
  function renderDetail(el, state, id) {
    const r = D.roomOf(state, id);
    if (!r) {
      el.append(U.pageHeader({ title: 'Räume' }), h('div.card', U.empty({ icon: '🚪', title: 'Raum nicht gefunden', text: 'Dieser Raum existiert nicht oder wurde gelöscht.', action: h('a.btn.primary', { href: '#/raeume' }, SW.icon('chevronLeft'), 'Zur Übersicht') })));
      return;
    }
    const edit = canEdit();
    const t = typeOf(r);
    const tt = state.timetable;
    const lessons = D.lessonsFor(tt, { roomId: r.id });
    const occ = tt ? occOf(state, { [r.id]: SW.sum(lessons, (l) => l.len || 1) }, r.id) : null;
    const homes = homeClasses(state, r.id);
    const bk = roomBookings(state, r.id);
    const afterDelete = () => SW.router.go('#/raeume');

    // Kopf
    el.append(h('div.rm-head',
      h('span.rm-ic.lg', { title: t.name }, t.icon),
      h('div.grow',
        h('div.tiny.faint', h('a', { href: '#/raeume' }, 'Räume'), ' / ', t.name),
        h('h1', r.name, r.active === false ? h('span.chip.warn', 'Inaktiv') : null),
        h('div.chips',
          h('span.chip.tint', t.icon + ' ' + t.name),
          h('span.chip', SW.icon('users'), `${SW.fmtNum(r.capacity || 0)} Plätze`),
          placeText(r) ? h('span.chip', SW.icon('building'), placeText(r)) : null,
          t.teachable ? null : h('span.chip.outline', 'Kein Unterrichtsraum'))),
      h('div.actions',
        h('a.btn', { href: '#/raeume' }, SW.icon('chevronLeft'), 'Zurück'),
        edit ? h('button.btn.primary', { onclick: () => openEdit(r) }, SW.icon('edit'), 'Bearbeiten') : null,
        edit ? h('button.btn.icon', { 'aria-label': 'Weitere Aktionen', title: 'Weitere Aktionen', onclick: (e) => roomMenu(e.currentTarget, r, { afterDelete }) }, SW.icon('more')) : null),
    ));
    if (r.active === false) el.append(U.banner(h('span', h('b', 'Deaktiviert: '), 'Dieser Raum wird vom Generator nicht verplant. Bestehende Buchungen bleiben erhalten.'), 'warn', { action: edit ? h('button.btn.sm', { onclick: () => toggleActive(r) }, 'Aktivieren') : null }));

    // Kennzahlen
    el.append(h('div.grid.c4',
      U.kpi({ label: 'Auslastung', icon: '📊', value: occ && t.teachable ? Math.round(occ.ratio * 100) + ' %' : '–', sub: !tt ? 'noch kein Stundenplan' : !t.teachable ? 'kein Unterrichtsraum' : `${SW.fmtNum(occ.lessons)} von ${SW.fmtNum(occ.cap)} Lektionen pro Woche` }),
      U.kpi({ label: 'Lektionen / Woche', icon: '📘', value: tt ? SW.fmtNum(SW.sum(lessons, (l) => l.len || 1)) : '–', sub: tt ? `an ${SW.uniq(lessons.map((l) => l.day)).length} Tagen · ${SW.uniq(lessons.map((l) => l.classId)).length} Klassen` : 'Plan im Generator erstellen' }),
      U.kpi({ label: 'Stammzimmer', icon: '👥', value: SW.fmtNum(homes.length), sub: homes.length ? homes.map((k) => k.name).join(', ') : 'keiner Klasse zugeordnet' }),
      U.kpi({ label: 'Buchungen', icon: '🗓️', value: SW.fmtNum(bk.upcoming.length), sub: bk.upcoming.length ? 'kommende Anlässe' : bk.past.length ? `${bk.past.length} vergangene` : 'keine Buchungen' }),
    ));

    // Wochenbelegung
    let gridBody;
    if (tt && (t.teachable || lessons.length)) {
      const grid = U.timetableGrid({ lessons, mode: 'room', showFree: true, state, onLessonClick: (l) => SW.router.go('#/stundenplan?view=klasse&id=' + l.classId) });
      gridBody = [h('div.scroll-x', grid), h('div.legend.rm-legend', h('span', h('i.ls'), 'Belegt (Klasse · Fach)'), h('span', h('i.free'), 'Frei'))];
      if (!lessons.length) gridBody.unshift(U.banner('Im aktuellen Stundenplan ist dieser Raum nicht belegt.', '', { icon: 'info' }));
    } else if (!tt) {
      gridBody = U.empty({ icon: '🗓️', title: 'Noch kein Stundenplan', text: 'Sobald ein Plan generiert ist, erscheint hier die Wochenbelegung dieses Raums mit freien Lektionen.', action: edit ? h('a.btn.primary', { href: '#/generator' }, SW.icon('wand'), 'Zum Generator') : null });
    } else {
      gridBody = U.empty({ icon: t.icon, title: 'Kein Unterrichtsraum', text: `${t.name}: Dieser Raumtyp wird nicht für Unterricht verplant, kann aber für Anlässe und Sitzungen gebucht werden.` });
    }
    el.append(U.card({ title: 'Wochenbelegung', icon: '🗓️', sub: tt ? (tt.status === 'published' ? 'Aktueller Stundenplan (veröffentlicht)' : 'Aktueller Planentwurf') : null, body: gridBody, actions: tt && lessons.length ? [h('a.btn.sm', { href: '#/stundenplan?view=raum&id=' + r.id }, SW.icon('grid'), 'Im Stundenplan öffnen')] : null }));

    // Klassen (Stammzimmer) und Details
    const classList = homes.length
      ? h('ul.list', homes.map((k) => h('li', h('span.rm-ic.sm', '👥'), h('div.grow', h('a.ttl', { href: '#/klassen/' + k.id }, k.name), h('div.sub', `${SW.fmtNum(k.size || 0)} Lernende · Schultage: ${(k.schoolDays || []).length ? k.schoolDays.map((d) => M.dayName(d, true)).join(', ') : '–'}`)), (k.size || 0) > (r.capacity || 0) ? h('span.chip.sm.err', { title: 'Klasse grösser als Kapazität' }, 'zu klein') : null, h('a.btn.icon.ghost.sm', { href: '#/klassen/' + k.id, 'aria-label': 'Klasse öffnen' }, SW.icon('chevronRight')))))
      : U.empty({ icon: '👥', title: 'Kein Stammzimmer', text: 'Keine Klasse hat diesen Raum als Stammzimmer. Das Stammzimmer wird bei der Klasse festgelegt.', action: edit && state.classes.length ? h('a.btn.sm', { href: '#/klassen' }, 'Zu den Klassen') : null });
    const details = U.card({ title: 'Ausstattung & Notizen', icon: '🧰', body: h('div.col.g12',
      (r.features || []).length ? h('div.chips', (r.features || []).map((f) => h('span.chip', featName(f)))) : h('div.small.muted', 'Keine Ausstattung erfasst.'),
      r.notes ? h('div', h('div.lbl', 'Notizen'), h('p.small.mt4', { style: { whiteSpace: 'pre-wrap' } }, r.notes)) : null) });

    const bookingList = bk.all.length
      ? h('ul.list.rm-book', bk.all.slice(0, 8).map((b) => { const k = bookingKind(b.kind); const past = (b.date || '') < SW.isoDate(); const d = b.date ? SW.parseDate(b.date) : null;
        return h('li' + (past ? '.past' : ''), h('div.rm-date', h('b', d ? String(d.getDate()) : '–'), h('span', d ? d.toLocaleDateString('de-CH', { month: 'short' }).replace('.', '') : '')), h('div.grow', h('div.ttl.trunc', { title: b.title || k.name }, k.icon + ' ', b.title || k.name), h('div.sub', `${b.date ? SW.fmtDateShort(b.date) : ''} · ${b.from || ''}–${b.to || ''} · ${k.name}${b.attendees ? ` · ${SW.fmtNum(b.attendees)} Personen` : ''}`)), statusChip(b.status)); }),
        bk.all.length > 8 ? h('li', h('a.small', { href: '#/hauswart' }, `Alle ${bk.all.length} Buchungen im Hauswart-Modul`)) : null)
      : U.empty({ icon: '🗓️', title: 'Keine Buchungen', text: 'Anlässe, Sitzungen und Unterhaltsarbeiten für diesen Raum werden im Modul «Hauswart & Events» erfasst.', action: h('a.btn.sm', { href: '#/hauswart' }, 'Hauswart & Events') });

    el.append(h('div.grid.c2',
      h('div.col.g16', U.card({ title: 'Stammzimmer von', icon: '👥', sub: homes.length ? plural(homes.length, 'Klasse', 'Klassen') : null, body: classList }), details),
      U.card({ title: 'Buchungen', icon: '🗓️', sub: bk.upcoming.length ? `${plural(bk.upcoming.length, 'kommende', 'kommende')}${bk.past.length ? ` · ${bk.past.length} vergangene` : ''}` : null, body: bookingList, actions: [h('a.btn.sm', { href: '#/hauswart' }, SW.icon('broom'), 'Hauswart')] }),
    ));
  }

  // ---------- Registrierung ----------
  SW.views['raeume'] = {
    title: 'Räume',
    render(el, params) {
      U.injectCSS('raeume', CSS);
      const state = st();
      if (params && params.id) renderDetail(el, state, params.id);
      else renderList(el, state);
    },
  };
})();
