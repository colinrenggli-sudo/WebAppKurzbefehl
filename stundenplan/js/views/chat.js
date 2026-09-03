/* STUNDENWERK · views/chat.js — Team-Chat (Pro): Kanäle für Schule, Fachschaften, Klassenteams, Direktnachrichten. Lokal, ohne Personendaten. */
(function () {
  const SW = (globalThis.SW = globalThis.SW || {});
  const h = SW.h; const U = SW.ui; const M = SW.model; const D = SW.domain;
  SW.views = SW.views || {};
  const READ_KEY = 'stundenwerk.chat.read';
  let channelId = null; let unsub = null; let draft = ''; let search = ''; let senderId = null;
  const ICONS = ['💬', '☕', '🗓️', '📘', '🗣️', '🏀', '👥', '📣', '🎉', '🧪', '📚', '🚀', '🌈', '🛠️'];
  const readMap = () => SW.lsGet(READ_KEY, {});
  const markRead = (cid, ts) => { const m = readMap(); m[cid] = ts; SW.lsSet(READ_KEY, m); };
  const unread = (state, cid) => { const last = readMap()[cid] || 0; return state.chat.messages.filter((m) => m.channelId === cid && m.ts > last && m.teacherId !== senderId).length; };

  function ensureDefaults(state) {
    if (state.chat.channels.length) return;
    SW.store.update((s) => { s.chat.channels.push({ id: 'ch_all', name: 'Lehrpersonenzimmer', kind: 'schule', icon: '☕', members: 'alle' }, { id: 'ch_plan', name: 'Stundenplanung', kind: 'schule', icon: '🗓️', members: 'alle' }); });
  }
  function systemMessages(state) {
    const tt = state.timetable; if (!tt) return;
    const ch = state.chat.channels.find((c) => c.id === 'ch_plan'); if (!ch) return;
    if (state.chat.messages.some((m) => m.system && m.ref === tt.id)) return;
    SW.store.update((s) => { s.chat.messages.push({ id: SW.uid('m'), channelId: ch.id, teacherId: null, system: true, ref: tt.id, text: `🗓️ Neuer Stundenplan erstellt (Score ${tt.score}, ${SW.sum(tt.lessons, (l) => l.len || 1)} Lektionen)${tt.status === 'published' ? ' – veröffentlicht' : ' – Entwurf'}.`, ts: tt.createdAt }); });
  }
  function membersOf(state, ch) {
    if (ch.kind === 'klasse') { const k = D.classOf(state, ch.classId); if (!k) return []; return SW.uniq([k.mainTeacherId, k.deputyTeacherId, k.abuTeacherId, ...Object.values(k.subjectTeachers || {}), ...(k.extraTeachers || []).map((e) => e.teacherId)].filter(Boolean)).map((id) => D.teacherOf(state, id)).filter(Boolean); }
    if (ch.kind === 'fach') return D.qualifiedTeachers(state, ch.subjectId);
    if (ch.kind === 'direkt') return (ch.members || []).map((id) => D.teacherOf(state, id)).filter(Boolean);
    return state.teachers.filter((t) => t.active !== false);
  }
  function channelModal(state) {
    const c = { id: SW.uid('ch'), name: '', kind: 'schule', icon: '💬', classId: null, subjectId: null };
    const extra = h('div');
    const draw = () => SW.mount(extra, c.kind === 'klasse' ? U.field('Klasse', U.select(state.classes.map((k) => ({ value: k.id, label: k.name })), c.classId, (v) => { c.classId = v; if (!c.name) nameInp.value = 'Klassenteam ' + (D.classOf(state, v)?.name || ''); c.name = nameInp.value; })) : c.kind === 'fach' ? U.field('Fach', U.select(state.subjects.map((s) => ({ value: s.id, label: s.name })), c.subjectId, (v) => { c.subjectId = v; if (!c.name) nameInp.value = 'Fachschaft ' + (D.subjectOf(state, v)?.short || ''); c.name = nameInp.value; })) : null);
    const nameInp = U.input({ value: '', oninput: (v) => (c.name = v), placeholder: 'z. B. Fachschaft Sprachen' });
    const body = h('div.col.g12', h('div.form-grid', U.field('Art', U.seg([{ value: 'schule', label: 'Schule' }, { value: 'fach', label: 'Fachschaft' }, { value: 'klasse', label: 'Klassenteam' }], 'schule', (v) => { c.kind = v; draw(); })), U.field('Name', nameInp)), extra, U.field('Symbol', U.chipPicker(ICONS.map((i) => ({ value: i, label: i })), '💬', (v) => (c.icon = v), { multi: false })));
    draw();
    const m = U.modal({ title: 'Kanal anlegen', body, footer: [h('button.btn', { onclick: () => m.close() }, 'Abbrechen'), h('button.btn.primary', { onclick: () => { c.name = c.name || nameInp.value; if (!c.name.trim()) return U.toast('Name angeben', { type: 'warn' }); SW.store.update((s) => s.chat.channels.push(c)); channelId = c.id; m.close(); } }, 'Anlegen')] });
  }
  function directModal(state) {
    const me = senderId; const others = state.teachers.filter((t) => t.active !== false && t.id !== me);
    let other = others[0]?.id || null;
    const m = U.modal({ title: 'Direktnachricht', body: U.field('Lehrperson', U.select(others.map((t) => ({ value: t.id, label: `${t.emoji} ${t.code || ''}` })), other, (v) => (other = v))), footer: [h('button.btn', { onclick: () => m.close() }, 'Abbrechen'), h('button.btn.primary', { onclick: () => { if (!other) return; let ch = state.chat.channels.find((c) => c.kind === 'direkt' && c.members?.includes(me) && c.members?.includes(other)); if (!ch) { ch = { id: SW.uid('ch'), name: '', kind: 'direkt', icon: '💬', members: [me, other] }; SW.store.update((s) => s.chat.channels.push(ch)); } channelId = ch.id; m.close(); SW.router.refresh(); } }, 'Öffnen')] });
  }
  const channelLabel = (state, ch) => { if (ch.kind !== 'direkt') return ch.name; const other = (ch.members || []).find((id) => id !== senderId) || ch.members?.[0]; const t = D.teacherOf(state, other); return t ? `${t.emoji} ${t.code || ''}` : 'Direkt'; };

  function content(el) {
    const state = SW.store.state; U.injectCSS('chat', '.chat-day{align-self:center;font-size:11px;color:var(--txt-3);background:var(--card-3);padding:2px 10px;border-radius:999px;margin:4px 0}.chat-sys{align-self:center;font-size:12px;color:var(--txt-2);background:var(--tint-soft);padding:4px 12px;border-radius:10px;max-width:90%;text-align:center}.chat-hint{font-size:11.5px;color:var(--txt-3);padding:0 12px 8px}');
    ensureDefaults(state); systemMessages(state);
    const isTeacher = state.settings.role === 'teacher';
    const active = state.teachers.filter((t) => t.active !== false);
    if (!active.length) { el.append(U.pageHeader({ title: 'Team-Chat' }), U.empty({ icon: '💬', title: 'Keine Lehrpersonen', text: 'Der Chat braucht mindestens eine Lehrperson.', action: h('a.btn.primary', { href: '#/lehrpersonen' }, 'Lehrpersonen') })); return; }
    senderId = isTeacher ? (state.settings.currentTeacherId || active[0].id) : (senderId && active.some((t) => t.id === senderId) ? senderId : active[0].id);
    const channels = state.chat.channels.filter((c) => c.kind !== 'direkt' || (c.members || []).includes(senderId));
    if (!channels.some((c) => c.id === channelId)) channelId = channels[0]?.id || null;
    const ch = channels.find((c) => c.id === channelId);
    el.append(U.demoStrip('chat'));
    el.append(U.pageHeader({ title: 'Team-Chat', lead: 'Kanäle für Schule, Fachschaften und Klassenteams – ohne Personendaten, Nachrichten bleiben auf diesem Gerät.', actions: [
      isTeacher ? U.teacherPill(D.teacherOf(state, senderId)) : h('div.flex.ai-c.g6', h('span.small.muted', 'Senden als'), U.select(active.map((t) => ({ value: t.id, label: `${t.emoji} ${t.code || ''}` })), senderId, (v) => { senderId = v; SW.router.refresh(); }, { cls: 'sm' })),
      h('button.btn', { onclick: () => directModal(state) }, SW.icon('user'), 'Direktnachricht'), h('button.btn.primary', { onclick: () => channelModal(state) }, SW.icon('plus'), 'Kanal'),
    ] }));
    // Kanalliste
    const left = h('div.side-l');
    const searchInp = U.input({ value: search, placeholder: 'Nachrichten suchen', cls: 'sm', oninput: (v) => { search = v; drawMsgs(); } });
    left.append(h('div', { style: { padding: '10px 10px 6px' } }, h('div.search', SW.icon('search'), searchInp)));
    const groups = [['schule', 'Schule'], ['fach', 'Fachschaften'], ['klasse', 'Klassenteams'], ['direkt', 'Direkt']];
    const listEl = h('div.scroll', { style: { flex: 1, padding: '0 8px 8px' } });
    for (const [kind, label] of groups) { const cs = channels.filter((c) => c.kind === kind); if (!cs.length) continue; listEl.append(h('div.nav-h', label)); for (const c of cs) { const n = unread(state, c.id); listEl.append(h('div.chan' + (c.id === channelId ? '.active' : ''), { onclick: () => { channelId = c.id; SW.router.refresh(); } }, h('span', c.icon || '💬'), h('span.trunc', channelLabel(state, c)), n ? h('span.cnt', String(n)) : null)); } }
    left.append(listEl);
    // Nachrichten
    const right = h('div.col', { style: { minWidth: 0 } });
    const msgs = h('div.msgs');
    const drawMsgs = () => {
      SW.clear(msgs); if (!ch) return;
      const q = search.trim().toLowerCase();
      const list = SW.sortBy(state.chat.messages.filter((m) => m.channelId === ch.id && (!q || (m.text || '').toLowerCase().includes(q))), (m) => m.ts);
      if (!list.length) msgs.append(h('div.empty', h('div.big', ch.icon || '💬'), h('h3', q ? 'Keine Treffer' : 'Noch keine Nachrichten'), h('p', q ? 'Anderen Suchbegriff versuchen.' : 'Schreibe die erste Nachricht in diesen Kanal.')));
      let lastDay = '';
      for (const m of list) {
        const day = SW.isoDate(new Date(m.ts)); if (day !== lastDay) { msgs.append(h('div.chat-day', day === SW.isoDate() ? 'Heute' : SW.fmtDateLong(day))); lastDay = day; }
        if (m.system) { msgs.append(h('div.chat-sys', m.text)); continue; }
        const t = D.teacherOf(state, m.teacherId); const me = m.teacherId === senderId;
        msgs.append(h('div.msg' + (me ? '.me' : ''), U.avatar(t, 'sm'), h('div', h('div.bub', m.text), h('div.meta', `${me ? 'Ich' : D.teacherLabel(t)} · ${SW.fmtTs(m.ts)}`))));
      }
      msgs.scrollTop = msgs.scrollHeight;
      if (list.length) markRead(ch.id, list[list.length - 1].ts);
    };
    const send = () => {
      const text = inp.value.trim(); if (!text || !ch) return;
      SW.store.update((s) => s.chat.messages.push({ id: SW.uid('m'), channelId: ch.id, teacherId: senderId, text, ts: Date.now() }), { op: 'chat' });
      inp.value = ''; draft = '';
      if (ch.kind === 'klasse') SW.store.notify({ icon: '💬', text: `Neue Nachricht in «${ch.name}» von ${D.teacherLabel(D.teacherOf(state, senderId))}.`, link: '#/chat' });
      drawMsgs();
    };
    const inp = U.input({ value: draft, placeholder: ch ? `Nachricht an ${channelLabel(state, ch)} …` : 'Kanal wählen', oninput: (v) => (draft = v) });
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
    if (ch) {
      const mem = membersOf(state, ch);
      right.append(h('div.card-h', h('div.flex.ai-c.g10', h('span', { style: { fontSize: '22px' } }, ch.icon || '💬'), h('div', h('h3', channelLabel(state, ch)), h('div.small.muted', ch.kind === 'klasse' ? `Klassenteam · ${mem.length} Lehrpersonen` : ch.kind === 'fach' ? `Fachschaft · ${mem.length} Lehrpersonen` : ch.kind === 'direkt' ? 'Direktnachricht' : `Alle Lehrpersonen · ${mem.length}`))), h('div.flex.ai-c.g6', h('div.flex', mem.slice(0, 8).map((t) => h('span.av.xs', { title: t.code || '', style: { marginLeft: '-4px', border: '2px solid var(--card)' } }, t.emoji))), mem.length > 8 ? h('span.small.muted', `+${mem.length - 8}`) : null, ch.kind !== 'schule' ? h('button.btn.icon.sm.ghost', { onclick: (e) => U.menu(e.currentTarget, [{ label: 'Umbenennen', icon: 'edit', fn: () => { const name = prompt('Neuer Name', ch.name); if (name) SW.store.update((s) => { const c = s.chat.channels.find((x) => x.id === ch.id); if (c) c.name = name; }); } }, { label: 'Kanal löschen', icon: 'trash', danger: true, fn: async () => { if (await U.confirm({ title: 'Kanal löschen?', text: 'Alle Nachrichten des Kanals werden gelöscht.', ok: 'Löschen', danger: true })) SW.store.update((s) => { s.chat.channels = s.chat.channels.filter((x) => x.id !== ch.id); s.chat.messages = s.chat.messages.filter((x) => x.channelId !== ch.id); }); } }]) }, SW.icon('more')) : null)));
      right.append(msgs, h('div.composer', inp, h('button.btn.primary', { onclick: send }, SW.icon('send'), 'Senden')), h('div.chat-hint', 'Enter sendet · Demo: keine Übertragung, Nachrichten bleiben in diesem Browser'));
    } else right.append(U.empty({ icon: '💬', title: 'Kein Kanal', text: 'Lege einen Kanal an.' }));
    el.append(h('div.card.chat', left, right));
    drawMsgs();
  }

  SW.views.chat = {
    title: 'Team-Chat', manualRefresh: true,
    render(el) {
      if (!unsub) unsub = SW.store.on((st, meta) => { if (SW.router.current?.route === 'chat' && meta.op !== 'chat' && meta.op !== 'notify') SW.router.refresh(); });
      el.append(U.proGate('chat', () => { const w = h('div.col.g16'); content(w); return w; }));
    },
    onLeave() { if (unsub) { unsub(); unsub = null; } },
  };
})();
