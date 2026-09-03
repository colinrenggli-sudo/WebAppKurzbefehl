/* STUNDENWERK · ui.js — wiederverwendbare Bausteine.
   Alle Funktionen geben DOM-Elemente zurück (via SW.h) oder öffnen Overlays.

   Overlays
     SW.ui.modal({title, sub, body, footer, size:'narrow'|'wide'|'xl', onClose}) → {el, close()}
     SW.ui.confirm({title, text, ok:'Löschen', danger:true}) → Promise<boolean>
     SW.ui.toast(text, {type:'ok'|'err'|'warn', action:{label, fn}, ms})
     SW.ui.menu(anchorEl, [{label, icon, fn, danger}, 'sep', …])
   Formulare
     SW.ui.field(label, inputEl, {hint, error})   SW.ui.input({type, value, oninput, placeholder, min, max, step})
     SW.ui.select(options:[{value,label}], value, onchange)   SW.ui.textarea(...)   SW.ui.check(label, checked, onchange)
     SW.ui.switchEl(checked, onchange)   SW.ui.seg(options, value, onchange)   SW.ui.chipPicker(options, values, onchange, {multi})
     SW.ui.emojiPicker({value, used:Set, onpick})   SW.ui.colorPicker(value, onchange)
   Fachliches
     SW.ui.avatar(teacher, size)   SW.ui.teacherPill(teacher)   SW.ui.subjectTag(subject)   SW.ui.roomTag(room)   SW.ui.dayChips(days, value, onchange)
     SW.ui.availabilityGrid({value, onchange, readonly, busy})   SW.ui.timetableGrid({lessons, mode, dense, days, onDrop, onLessonClick, highlight})
     SW.ui.lessonCard(lesson, {mode})
   Layout
     SW.ui.pageHeader({title, lead, actions:[el]})   SW.ui.kpi({label, value, sub, icon})   SW.ui.empty({icon, title, text, action})
     SW.ui.banner(text|el, type, {icon, action})   SW.ui.card({title, body, actions, footer})   SW.ui.tabs(items, active, onchange)
     SW.ui.table({cols:[{label, key|render, cls}], rows, onRow, empty})   SW.ui.lockBadge()   SW.ui.proGate(featureId, renderFn) → el
     SW.ui.paywall(featureId)  Demo-Paywall-Modal
*/
(function () {
  const SW = (globalThis.SW = globalThis.SW || {});
  const M = SW.model; const h = SW.h;
  const U = (SW.ui = {});

  // Ansicht-spezifisches CSS einmalig einfügen (id = Name der Ansicht)
  U.injectCSS = (id, css) => { if (document.getElementById('css-' + id)) return; const st = document.createElement('style'); st.id = 'css-' + id; st.textContent = css; document.head.append(st); };

  // ---------- Overlays ----------
  const openModals = [];
  U.modal = ({ title, sub, body, footer, size, onClose, cls }) => {
    const el = h('div.modal-bd', { role: 'dialog', 'aria-modal': 'true' });
    const box = h('div.modal' + (size ? '.' + size : '') + (cls ? '.' + cls : ''));
    const api = { el, box, close: () => { if (!el.isConnected) return; el.remove(); openModals.splice(openModals.indexOf(api), 1); document.body.style.overflow = openModals.length ? 'hidden' : ''; onClose && onClose(); } };
    box.append(
      h('div.modal-h', h('div', h('h2', title), sub ? h('div.sub', sub) : null), h('button.btn.icon.ghost', { onclick: api.close, 'aria-label': 'Schliessen' }, SW.icon('x'))),
      h('div.modal-b', body),
      footer ? h('div.modal-f', footer) : null,
    );
    el.append(box);
    el.addEventListener('mousedown', (e) => { if (e.target === el) api.close(); });
    document.body.append(el); document.body.style.overflow = 'hidden';
    openModals.push(api);
    setTimeout(() => { const f = box.querySelector('input:not([type=hidden]),select,textarea,button.primary'); f && f.focus && f.focus(); }, 30);
    return api;
  };
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && openModals.length) openModals[openModals.length - 1].close(); });
  U.closeAllModals = () => [...openModals].forEach((m) => m.close());

  U.confirm = ({ title = 'Sicher?', text = '', ok = 'OK', cancel = 'Abbrechen', danger = false }) => new Promise((res) => {
    const m = U.modal({ title, size: 'narrow', body: h('p.muted', text), onClose: () => res(false), footer: [h('button.btn', { onclick: () => m.close() }, cancel), h('button.btn' + (danger ? '.danger' : '.primary'), { onclick: () => { res(true); m.close(); } }, ok)] });
    m.box.querySelector('.modal-f .btn:last-child').focus();
  });

  U.toast = (text, { type = '', action, ms = 3200 } = {}) => {
    let host = document.querySelector('.toasts'); if (!host) { host = h('div.toasts'); document.body.append(host); }
    const t = h('div.toast' + (type ? '.' + type : ''), h('span.grow', text), action ? h('button.btn', { onclick: () => { action.fn(); t.remove(); } }, action.label) : null);
    host.append(t); setTimeout(() => t.remove(), ms);
    return t;
  };

  let openMenu = null;
  U.menu = (anchor, items) => {
    U.closeMenu();
    const m = h('div.menu');
    for (const it of items) {
      if (it === 'sep') { m.append(h('hr')); continue; }
      if (!it) continue;
      m.append(h('button' + (it.danger ? '.danger' : ''), { onclick: () => { U.closeMenu(); it.fn && it.fn(); }, disabled: it.disabled }, it.icon ? (SW.iconNames.includes(it.icon) ? SW.icon(it.icon) : h('span', it.icon)) : null, it.label));
    }
    document.body.append(m);
    const r = anchor.getBoundingClientRect(); const mw = m.offsetWidth, mh = m.offsetHeight;
    let x = r.right - mw, y = r.bottom + 6; if (x < 8) x = 8; if (y + mh > innerHeight - 8) y = r.top - mh - 6;
    m.style.left = x + 'px'; m.style.top = y + 'px';
    openMenu = m;
    setTimeout(() => document.addEventListener('mousedown', U._menuOut), 0);
    return m;
  };
  U._menuOut = (e) => { if (openMenu && !openMenu.contains(e.target)) U.closeMenu(); };
  U.closeMenu = () => { if (openMenu) { openMenu.remove(); openMenu = null; document.removeEventListener('mousedown', U._menuOut); } };

  U.popover = (anchor, content) => {
    U.closeMenu();
    const p = h('div.popover', content); document.body.append(p);
    const r = anchor.getBoundingClientRect(); let x = r.left, y = r.bottom + 6;
    if (x + p.offsetWidth > innerWidth - 8) x = innerWidth - 8 - p.offsetWidth; if (y + p.offsetHeight > innerHeight - 8) y = r.top - p.offsetHeight - 6;
    p.style.left = Math.max(8, x) + 'px'; p.style.top = Math.max(8, y) + 'px';
    openMenu = p; setTimeout(() => document.addEventListener('mousedown', U._menuOut), 0);
    return p;
  };

  // ---------- Formulare ----------
  U.field = (label, input, { hint, error, cls } = {}) => h('div.field' + (cls ? '.' + cls : ''), label ? h('label', label) : null, input, hint ? h('div.hint', hint) : null, error ? h('div.error', error) : null);
  U.input = ({ type = 'text', value = '', oninput, onchange, placeholder, min, max, step, cls = '', required, list, disabled, id } = {}) => {
    const el = h('input.inp' + (cls ? '.' + cls : ''), { type, placeholder, min, max, step, required, list, disabled, id });
    el.value = value ?? '';
    if (oninput) el.addEventListener('input', () => oninput(type === 'number' ? (el.value === '' ? '' : Number(el.value)) : el.value, el));
    if (onchange) el.addEventListener('change', () => onchange(type === 'number' ? (el.value === '' ? '' : Number(el.value)) : el.value, el));
    return el;
  };
  U.textarea = ({ value = '', oninput, placeholder, rows = 3 }) => { const el = h('textarea.inp', { placeholder, rows }); el.value = value ?? ''; if (oninput) el.addEventListener('input', () => oninput(el.value, el)); return el; };
  U.select = (options, value, onchange, { placeholder, cls = '' } = {}) => {
    const el = h('select.inp' + (cls ? '.' + cls : ''));
    if (placeholder) el.append(h('option', { value: '' }, placeholder));
    for (const o of options) el.append(h('option', { value: o.value ?? o.id, selected: String(o.value ?? o.id) === String(value ?? '') }, o.label ?? o.name));
    if (value == null || value === '') el.value = '';
    if (onchange) el.addEventListener('change', () => onchange(el.value === '' ? null : el.value, el));
    return el;
  };
  U.check = (label, checked, onchange) => { const i = h('input', { type: 'checkbox', checked: !!checked }); if (onchange) i.addEventListener('change', () => onchange(i.checked)); return h('label.check', i, h('span', label)); };
  U.switchEl = (checked, onchange, label) => { const b = h('button.switch', { role: 'switch', 'aria-checked': String(!!checked), 'aria-label': label || '' }); b.addEventListener('click', () => { const v = b.getAttribute('aria-checked') !== 'true'; b.setAttribute('aria-checked', String(v)); onchange && onchange(v); }); return b; };
  U.seg = (options, value, onchange, { sm } = {}) => {
    const el = h('div.seg' + (sm ? '.sm' : ''));
    const re = (v) => { el.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.v === String(v))); };
    for (const o of options) el.append(h('button', { dataset: { v: o.value ?? o.id }, onclick: () => { re(o.value ?? o.id); onchange && onchange(o.value ?? o.id); } }, o.icon ? h('span', o.icon + ' ') : null, o.label ?? o.name));
    re(value); el.set = re; return el;
  };
  U.chipPicker = (options, values, onchange, { multi = true, cls = '' } = {}) => {
    let cur = multi ? new Set(values || []) : values;
    const el = h('div.chips' + (cls ? '.' + cls : ''));
    const re = () => { el.querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', multi ? cur.has(c.dataset.v) : String(cur) === c.dataset.v)); };
    for (const o of options) {
      const v = String(o.value ?? o.id);
      el.append(h('span.chip.pick', { dataset: { v }, onclick: () => { if (multi) { cur.has(v) ? cur.delete(v) : cur.add(v); onchange([...cur]); } else { cur = v; onchange(v); } re(); } }, o.icon ? h('span', o.icon) : null, o.label ?? o.name));
    }
    re(); el.set = (v) => { cur = multi ? new Set(v || []) : v; re(); }; return el;
  };
  U.colorPicker = (value, onchange) => {
    const el = h('div.chips');
    const re = () => el.querySelectorAll('button').forEach((b) => (b.style.boxShadow = b.dataset.c === value ? '0 0 0 3px var(--card), 0 0 0 5px ' + value : ''));
    for (const c of M.COLORS) el.append(h('button', { dataset: { c }, style: { width: '26px', height: '26px', borderRadius: '8px', background: c }, onclick: () => { value = c; re(); onchange(c); }, 'aria-label': c }));
    re(); return el;
  };
  U.emojiPicker = ({ value, used = new Set(), onpick }) => {
    const wrap = h('div.col.g10');
    const preview = h('div.flex.ai-c.g10', h('span.av.lg', value || '❔'), h('div', h('div.strong', 'Gewähltes Symbol'), h('div.small.muted', 'Nur das Symbol wird gespeichert, kein Name.')));
    const grid = h('div.emoji-grid');
    const render = (group) => {
      SW.clear(grid);
      const list = group ? M.EMOJI_GROUPS.find((g) => g.name === group).list : M.EMOJIS;
      for (const e of list) grid.append(h('button' + (e === value ? '.on' : '') + (used.has(e) && e !== value ? '.used' : ''), { type: 'button', onclick: () => { value = e; preview.querySelector('.av').textContent = e; grid.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.textContent === e)); onpick(e); }, title: used.has(e) && e !== value ? 'Bereits vergeben' : '' }, e));
    };
    const seg = U.seg([{ value: '', label: 'Alle' }, ...M.EMOJI_GROUPS.map((g) => ({ value: g.name, label: g.name }))], '', (v) => render(v), { sm: true });
    render('');
    wrap.append(preview, seg, grid);
    return wrap;
  };
  U.dayChips = (days, value, onchange, opts) => U.chipPicker(days.map((d) => ({ value: String(d), label: M.dayName(d, true) })), (value || []).map(String), (v) => onchange(v.map(Number).sort()), opts);

  // ---------- Fachliches ----------
  U.avatar = (t, size = '') => h('span.av' + (size ? '.' + size : ''), { title: t?.code || '', style: t?.color ? { background: t.color + '22' } : null }, t ? t.emoji : '❔');
  U.teacherPill = (t, extra) => h('span.teacher-pill', U.avatar(t, 'xs'), t ? (t.code || 'Lehrperson') : 'offen', extra ? h('span.faint', extra) : null);
  U.subjectTag = (s) => h('span.subj', { style: { '--c': s?.color || '#999' } }, h('i'), s ? s.name : '–');
  U.roomTag = (r) => { const t = r ? M.roomType(r.type) : null; return h('span.chip', t ? t.icon + ' ' : '', r ? r.name : '–'); };
  U.lockBadge = () => h('span.lock-badge', SW.icon('lock'), 'PRO');

  // Verfügbarkeitsraster: value = {day: [bool×slots]}; busy = {day: [lessonLabel|null]}
  U.availabilityGrid = ({ value = {}, onchange, readonly = false, busy = {}, state }) => {
    state = state || SW.store.state;
    const days = SW.domain.days(state); const slots = SW.domain.slots(state); const lunch = state.settings.lunchAfter;
    const val = SW.clone(value) || {};
    const norm = (d) => { if (!Array.isArray(val[d])) val[d] = Array(slots.length).fill(false); while (val[d].length < slots.length) val[d].push(false); return val[d]; };
    days.forEach(norm);
    const el = h('div.avail' + (readonly ? '.ro' : ''), { style: { '--cols': days.length } });
    const cells = {};
    const paint = () => { for (const d of days) for (let i = 0; i < slots.length; i++) { const c = cells[d + ':' + i]; const b = busy[d]?.[i]; c.className = 'c' + (val[d][i] ? ' on' : '') + (b ? ' busy' : '') + (i === lunch ? ' lunch' : ''); c.title = b ? b : (val[d][i] ? 'verfügbar' : 'nicht verfügbar'); } };
    const emit = () => { paint(); onchange && onchange(SW.clone(val)); };
    el.append(h('div'));
    for (const d of days) el.append(h('div.hd', { onclick: readonly ? null : () => { const all = val[d].every(Boolean); val[d] = val[d].map(() => !all); emit(); }, title: readonly ? '' : 'Ganzen Tag umschalten' }, M.dayName(d, true)));
    let drag = null;
    for (let i = 0; i < slots.length; i++) {
      el.append(h('div.tm' + (i === lunch ? '.lunch' : ''), { onclick: readonly ? null : () => { const all = days.every((d) => val[d][i]); for (const d of days) val[d][i] = !all; emit(); }, title: `${slots[i].start}–${slots[i].end}` }, String(slots[i].n)));
      for (const d of days) {
        const c = h('div.c', { dataset: { d, i } });
        if (!readonly) {
          c.addEventListener('mousedown', (e) => { e.preventDefault(); drag = !val[d][i]; val[d][i] = drag; emit(); });
          c.addEventListener('mouseenter', () => { if (drag !== null) { val[d][i] = drag; emit(); } });
          c.addEventListener('touchstart', (e) => { e.preventDefault(); val[d][i] = !val[d][i]; emit(); }, { passive: false });
        }
        cells[d + ':' + i] = c; el.append(c);
      }
    }
    document.addEventListener('mouseup', () => (drag = null));
    paint();
    el.getValue = () => SW.clone(val);
    el.setValue = (v) => { for (const d of days) { val[d] = Array.isArray(v?.[d]) ? [...v[d]] : Array(slots.length).fill(false); norm(d); } paint(); };
    return el;
  };
  // Vorlagen für Verfügbarkeit
  U.availabilityPresets = (state) => { const n = SW.domain.slotCount(state); const L = state.settings.lunchAfter; return {
    ganzerTag: Array(n).fill(true), vormittag: SW.range(n).map((i) => i < L), nachmittag: SW.range(n).map((i) => i >= L), keiner: Array(n).fill(false) }; };

  // Lektionskarte
  U.lessonCard = (l, { mode = 'class', state, draggable = false, locked = false, conflict = false, onclick } = {}) => {
    state = state || SW.store.state; const D = SW.domain;
    const s = D.subjectOf(state, l.subjectId), t = D.teacherOf(state, l.teacherId), r = D.roomOf(state, l.roomId), k = D.classOf(state, l.classId);
    const card = h('div.ls' + ((l.len || 1) > 1 ? '.span2' : '') + (draggable ? '.draggable' : '') + (locked || l.locked ? '.locked' : '') + (conflict ? '.conflict' : ''), { style: { '--c': s?.color || '#888' }, dataset: { id: l.id }, draggable: draggable ? 'true' : null, onclick });
    const title = mode === 'class' ? (s?.name || '?') : mode === 'teacher' ? `${k?.name || '?'} · ${s?.short || s?.name || '?'}` : `${k?.name || '?'} · ${s?.short || s?.name || '?'}`;
    card.append(h('b', title));
    const meta = h('div.m');
    if (mode !== 'teacher') meta.append(t ? h('span.flex.ai-c.g4', U.avatar(t, 'xs'), t.code || '') : h('span.err-c', 'keine LP'));
    if (mode !== 'room') meta.append(h('span', r ? (M.roomType(r.type).icon + ' ' + r.name) : '⚠️ kein Raum'));
    card.append(meta);
    return card;
  };

  // Wochenraster: lessons gefiltert (z.B. einer Klasse). mode: class|teacher|room.
  // onDrop(lesson, day, slot) für Drag & Drop; highlight: {day, slot} Set-Key "d:s" → Klasse "drop"/"bad"
  U.timetableGrid = ({ lessons = [], mode = 'class', dense = false, state, days, onDrop, onLessonClick, draggable = false, offDays = [], cellClass, showFree = false, extra }) => {
    state = state || SW.store.state; const D = SW.domain;
    days = days || D.days(state); const slots = D.slots(state); const lunch = state.settings.lunchAfter;
    const el = h('div.tt' + (dense ? '.dense' : ''), { style: { '--cols': days.length } });
    el.append(h('div.hd', ''));
    for (const d of days) el.append(h('div.hd', h('b', M.dayName(d, true)), h('span.faint', M.dayName(d).slice(0, 2) === M.dayName(d, true) ? '' : M.dayName(d))));
    const occupied = {}; // key d:s → true (belegt durch Doppellektion)
    const byStart = {};
    for (const l of lessons) { byStart[l.day + ':' + l.slot] = byStart[l.day + ':' + l.slot] || []; byStart[l.day + ':' + l.slot].push(l); for (let s = l.slot + 1; s < l.slot + (l.len || 1); s++) occupied[l.day + ':' + s] = l; }
    let dragging = null;
    for (let i = 0; i < slots.length; i++) {
      const sl = slots[i];
      if (i === lunch) el.append(h('div.lunch', 'Mittag'));
      el.append(h('div.tm', h('b', String(sl.n)), h('span', sl.start), h('span', sl.end)));
      for (const d of days) {
        const key = d + ':' + sl.n;
        const off = offDays.includes(d);
        const cell = h('div.cell' + (off ? '.off' : '') + (showFree && !byStart[key] && !occupied[key] && !off ? '.free' : ''), { dataset: { day: d, slot: sl.n } });
        if (cellClass) { const c = cellClass(d, sl.n); if (c) cell.classList.add(c); }
        if (occupied[key]) { cell.style.visibility = 'hidden'; cell.classList.add('cont'); }
        for (const l of byStart[key] || []) {
          const card = U.lessonCard(l, { mode, state, draggable: draggable && !l.locked, onclick: onLessonClick ? (e) => { e.stopPropagation(); onLessonClick(l, card); } : null, conflict: !!l._conflict });
          if ((l.len || 1) > 1) { card.style.position = 'absolute'; card.style.inset = '0'; card.style.height = 'calc(200% + 3px)'; card.style.zIndex = '1'; cell.style.overflow = 'visible'; }
          if (draggable && !l.locked) {
            card.addEventListener('dragstart', (e) => { dragging = l; card.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', l.id); } catch {} el.dispatchEvent(new CustomEvent('sw-dragstart', { detail: l })); });
            card.addEventListener('dragend', () => { dragging = null; card.classList.remove('dragging'); el.querySelectorAll('.cell.drop,.cell.bad').forEach((c) => c.classList.remove('drop', 'bad')); el.dispatchEvent(new CustomEvent('sw-dragend')); });
          }
          cell.append(card);
        }
        if (onDrop) {
          cell.addEventListener('dragover', (e) => { if (!dragging) return; e.preventDefault(); const ok = el._canDrop ? el._canDrop(dragging, d, sl.n) : true; cell.classList.toggle('drop', ok); cell.classList.toggle('bad', !ok); e.dataTransfer.dropEffect = ok ? 'move' : 'none'; });
          cell.addEventListener('dragleave', () => cell.classList.remove('drop', 'bad'));
          cell.addEventListener('drop', (e) => { e.preventDefault(); cell.classList.remove('drop', 'bad'); if (dragging) onDrop(dragging, d, sl.n, cell); dragging = null; });
        }
        if (extra) { const x = extra(d, sl.n, cell); if (x) cell.append(x); }
        el.append(cell);
      }
    }
    el.setCanDrop = (fn) => (el._canDrop = fn);
    return el;
  };

  // ---------- Layout ----------
  U.pageHeader = ({ title, lead, actions = [], icon }) => h('div.page-h', h('div', h('h1', icon ? h('span', icon + ' ') : null, title), lead ? h('p.lead', lead) : null), actions.length ? h('div.actions', actions) : null);
  U.kpi = ({ label, value, sub, icon, cls = '', onclick }) => h('div.card.kpi' + (onclick ? '.clickable' : '') + (cls ? '.' + cls : ''), { onclick }, h('div.lbl', icon ? h('span', icon) : null, label), h('div.val', value), sub ? h('div.sub', sub) : null);
  U.empty = ({ icon = '📭', title, text, action }) => h('div.empty', h('div.big', icon), title ? h('h3', title) : null, text ? h('p', text) : null, action || null);
  U.banner = (content, type = '', { icon, action, cls = '' } = {}) => h('div.banner' + (type ? '.' + type : '') + (cls ? '.' + cls : ''), h('span.ic', icon ? (SW.iconNames.includes(icon) ? SW.icon(icon) : icon) : SW.icon(type === 'err' ? 'alert' : type === 'warn' ? 'warnc' : type === 'ok' ? 'ok' : 'info')), h('div.grow', content), action || null);
  U.card = ({ title, sub, body, actions, footer, cls = '', icon }) => h('div.card' + (cls ? '.' + cls : ''), title ? h('div.card-h', h('div', h('h3', icon ? h('span', icon + ' ') : null, title), sub ? h('div.small.muted', sub) : null), actions ? h('div.flex.g6', actions) : null) : null, h('div.card-b', body), footer ? h('div.card-f', footer) : null);
  U.tabs = (items, active, onchange) => { const el = h('div.tabs'); const re = (v) => el.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.v === String(v))); for (const it of items) el.append(h('button', { dataset: { v: it.value ?? it.id }, onclick: () => { re(it.value ?? it.id); onchange(it.value ?? it.id); } }, it.icon ? h('span', it.icon) : null, it.label ?? it.name, it.count != null ? h('span.chip.sm', String(it.count)) : null)); re(active); el.set = re; return el; };
  U.table = ({ cols, rows, onRow, empty, cls = '', rowClass }) => {
    if (!rows.length && empty) return empty;
    const t = h('table.tbl' + (cls ? '.' + cls : ''));
    t.append(h('thead', h('tr', cols.map((c) => h('th' + (c.cls ? '.' + c.cls : ''), c.label)))));
    const tb = h('tbody');
    for (const r of rows) {
      const tr = h('tr' + (onRow ? '.clickable' : '') + (rowClass ? '.' + (rowClass(r) || '') : ''), { onclick: onRow ? (e) => { if (e.target.closest('button,a,input,select')) return; onRow(r); } : null });
      for (const c of cols) tr.append(h('td' + (c.cls ? '.' + c.cls : ''), c.render ? c.render(r) : r[c.key]));
      tb.append(tr);
    }
    t.append(tb);
    return h('div.tbl-wrap', t);
  };
  U.stat = (label, value) => h('div.st', h('b', String(value)), h('span', label));
  U.meter = (ratio, { cls, label } = {}) => { const p = SW.clamp(ratio || 0, 0, 1); const c = cls || (p > 1 ? 'err' : p > 0.85 ? 'warn' : 'ok'); return h('div.meter', h('div.progress.' + c, h('i', { style: { width: Math.round(p * 100) + '%' } })), h('span.num', label ?? Math.round(p * 100) + ' %')); };

  // ---------- Paywall (Demo) ----------
  U.isPro = () => !!SW.store.state.settings.proUnlocked;
  // Simulierter Kauf in drei Schritten: Paket → Angaben → Bestätigung. Es wird nichts verrechnet.
  U.paywall = (featureId, onContinue) => {
    const f = M.proFeature(featureId) || { name: 'Pro-Funktion', icon: '⭐', desc: '' };
    const st = SW.store.state; let step = 1; let plan = 'monat'; let pay = 'rechnung'; let role = 'Schulleitung'; let agb = false;
    const body = h('div.col.g16'); const foot = h('div.flex.g8.jc-e.wrap.w100');
    const steps = () => h('div.flex.g6.ai-c.small.muted', [1, 2, 3].map((n) => h('span.chip' + (n === step ? '.tint' : n < step ? '.ok' : ''), `${n < step ? '✓ ' : ''}${['Paket', 'Angaben', 'Bestätigung'][n - 1]}`)));
    const draw = () => {
      SW.clear(body); SW.clear(foot);
      if (step === 1) {
        body.append(steps(),
          h('div.paywall-hero', h('div', { style: { fontSize: '40px' } }, f.icon), h('h2', f.name), h('p.muted', f.desc), h('div.price', plan === 'jahr' ? 'CHF 5’400' : 'CHF 500', h('small', plan === 'jahr' ? ' / Jahr pro Schule' : ' / Monat pro Schule')), U.seg([{ value: 'monat', label: 'Monatlich CHF 500' }, { value: 'jahr', label: 'Jährlich CHF 5’400 · zwei Monate geschenkt' }], plan, (v) => { plan = v; draw(); }), h('div.small.muted', 'Alle Lehrpersonen inklusive · alle Module · Hosting in der Schweiz · jederzeit kündbar · Der Generator bleibt kostenlos.')),
          h('ul.feat-list', M.PRO_FEATURES.map((p) => h('li', h('span.ic', p.icon), h('div', h('div.strong', p.name), h('div.small.muted', p.desc))))),
          U.banner(h('span', h('b', 'Demo: '), 'Der Kauf wird nur simuliert. Es werden keine Zahlungsdaten erfasst und nichts verrechnet.'), 'pro', { icon: '🧪' }));
        foot.append(h('button.btn', { onclick: () => m.close() }, 'Später'), h('button.btn.pro', { onclick: () => { step = 2; draw(); } }, SW.icon('arrowRight'), '14 Tage kostenlos testen'));
      } else if (step === 2) {
        body.append(steps(), h('div.form-grid',
          U.field('Schule', U.input({ value: st.settings.schoolName || '', placeholder: 'Name der Schule' })),
          U.field('Rolle', U.select(['Schulleitung', 'Sekretariat', 'Stundenplanung', 'IT'].map((r) => ({ value: r, label: r })), role, (v) => (role = v))),
          U.field('Zahlungsart', U.seg([{ value: 'rechnung', label: 'Rechnung mit QR-Code' }, { value: 'karte', label: 'Kreditkarte (Demo)' }], pay, (v) => { pay = v; draw(); }), { hint: pay === 'rechnung' ? 'Schweizer QR-Rechnung, zahlbar innert 30 Tagen.' : 'In der Demo werden keine Kartendaten abgefragt.' }),
          U.field('Kostenstelle / Referenz', U.input({ placeholder: 'optional' })),
        ), U.check('Ich akzeptiere die Nutzungsbedingungen (Demo).', agb, (v) => (agb = v)));
        foot.append(h('button.btn', { onclick: () => { step = 1; draw(); } }, 'Zurück'), h('button.btn.pro', { onclick: () => { if (!agb) return U.toast('Bitte Nutzungsbedingungen akzeptieren', { type: 'warn' }); step = 3; draw(); } }, SW.icon('check'), 'Testphase starten'));
      } else {
        const ends = SW.addDays(SW.isoDate(), 14);
        body.append(steps(), h('div.paywall-hero', h('div', { style: { fontSize: '48px' } }, '🎉'), h('h2', 'Testphase gestartet'), h('p.muted', `Alle Pro-Funktionen sind bis ${SW.fmtDate(ends)} freigeschaltet. Danach ${plan === 'jahr' ? 'CHF 5’400 pro Jahr' : 'CHF 500 pro Monat'} ${pay === 'rechnung' ? 'auf Rechnung' : 'per Kreditkarte'}.`), h('div.chip.pro', '🧪 Simulation – es wird nichts verrechnet')));
        foot.append(h('button.btn.pro.lg', { onclick: () => { SW.store.update((s) => Object.assign(s.settings, { proUnlocked: true, proPlan: plan, proPay: pay, proSince: SW.isoDate(), proTrialEnds: ends })); U.toast('Pro-Demo freigeschaltet', { type: 'ok' }); m.close(); onContinue && onContinue(); } }, SW.icon('unlock'), 'Los geht’s'));
      }
    };
    const m = U.modal({ title: 'STUNDENWERK Pro', sub: 'Betrieb der Schule: Kalender, Stellvertretungen, Hauswart, Chat, Auswertungen', size: 'wide', body, footer: foot });
    draw();
    return m;
  };
  // Pro-Sperre als Teaser: der echte Inhalt wird unscharf gezeigt, darüber die Kaufkarte.
  U.proGate = (featureId, render) => {
    if (U.isPro()) return render();
    const f = M.proFeature(featureId);
    let inner; try { inner = render(); } catch (e) { console.error(e); inner = h('div'); }
    const teaser = h('div.pro-teaser', { inert: '' }, inner);
    const isTeacher = SW.store.state.settings.role === 'teacher';
    const card = h('div.pro-card.card.pad', h('div', { style: { fontSize: '44px' } }, f?.icon || '🔒'), h('h2.mt8', f?.name || 'Pro-Funktion'), h('p.muted.mt8', f?.desc || ''), h('div.mt12', h('span.lock-badge', SW.icon('lock'), 'PRO · CHF 500 / Monat pro Schule')), h('p.small.muted.mt12', isTeacher ? 'Die Schule hat STUNDENWERK Pro noch nicht aktiviert.' : 'Der Generator bleibt kostenlos – Pro ist der Betrieb der Schule.'), h('div.mt16.flex.jc-c.g8.wrap', isTeacher ? h('button.btn', { onclick: () => { SW.store.notify({ icon: '⭐', text: 'Eine Lehrperson wünscht die Freischaltung von STUNDENWERK Pro.', link: '#/einstellungen' }); U.toast('Schulleitung informiert', { type: 'ok' }); } }, 'Schulleitung informieren') : null, h('button.btn.pro.lg', { onclick: () => U.paywall(featureId, () => SW.router.refresh()) }, SW.icon('unlock'), isTeacher ? 'Demo trotzdem ansehen' : '14 Tage kostenlos testen'), h('a.btn.lg', { href: '#/dashboard' }, 'Zurück')));
    return h('div.pro-wrap', teaser, card);
  };
  U.demoStrip = (featureId) => U.isPro() ? h('div.demo-strip', h('span', '🧪'), h('span.grow', 'Pro-Demo aktiv – simulierter Kauf, keine Verrechnung.'), h('button.btn.xs.ghost', { onclick: () => { SW.store.setSetting('proUnlocked', false); SW.router.refresh(); } }, 'Demo beenden')) : null;
})();
