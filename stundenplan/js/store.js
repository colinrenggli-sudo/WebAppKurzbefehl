/* STUNDENWERK · store.js — Zustand, Persistenz (localStorage), CRUD, Ereignisse.
   API:
     SW.store.state                 aktueller Zustand (nur lesen; ändern über die Methoden unten)
     SW.store.load() / save()       laden / speichern (save wird automatisch nach jeder Änderung aufgerufen)
     SW.store.get(coll, id)         ein Objekt aus 'rooms' | 'subjects' | 'curricula' | 'teachers' | 'classes' | 'bookings' | 'timeEntries' | 'absences'
     SW.store.map(coll)             Map id -> Objekt (gecacht bis zur nächsten Änderung)
     SW.store.add(coll, obj)        anlegen (gibt obj zurück)
     SW.store.put(coll, obj)        ersetzen/anlegen nach id
     SW.store.patch(coll, id, p)    Felder ändern
     SW.store.remove(coll, id)      löschen (räumt Verweise auf, z.B. Lehrperson aus Klassen)
     SW.store.update(fn)            beliebige Änderung: fn(state) → danach save + emit
     SW.store.setSetting(k, v)      Einstellung ändern
     SW.store.on(fn) / off(fn)      Änderungen abonnieren: fn(state, meta)
     SW.store.exportJSON() / importJSON(text) / reset() / loadDemo()
     SW.store.setTimetable(tt)      generierten Plan übernehmen (Variante wird in variants archiviert)
*/
(function () {
  const SW = (globalThis.SW = globalThis.SW || {});
  const M = SW.model;
  const KEY = M.APP.storageKey;
  const listeners = new Set();
  let maps = {};

  const S = (SW.store = {
    state: M.emptyState(),
    COLLECTIONS: ['rooms', 'subjects', 'curricula', 'teachers', 'classes', 'bookings', 'timeEntries', 'absences'],

    load() {
      const raw = SW.lsGet(KEY, null);
      if (raw && typeof raw === 'object') S.state = S.migrate(raw);
      else S.state = M.emptyState();
      maps = {};
      return S.state;
    },
    migrate(raw) {
      const base = M.emptyState();
      const st = { ...base, ...raw, settings: { ...base.settings, ...(raw.settings || {}) } };
      st.settings.weights = { ...M.DEFAULT_WEIGHTS, ...(raw.settings?.weights || {}) };
      if (!st.chat) st.chat = { channels: [], messages: [] };
      for (const c of S.COLLECTIONS) if (!Array.isArray(st[c])) st[c] = [];
      if (!Array.isArray(st.variants)) st.variants = [];
      if (!Array.isArray(st.notifications)) st.notifications = [];
      st.version = 1;
      return st;
    },
    save() {
      S.state.savedAt = Date.now();
      const ok = SW.lsSet(KEY, S.state);
      if (!ok && SW.ui?.toast) SW.ui.toast('Speichern fehlgeschlagen (Speicher voll?)', { type: 'err' });
      return ok;
    },
    emit(meta = {}) { maps = {}; for (const fn of [...listeners]) { try { fn(S.state, meta); } catch (e) { console.error('store listener', e); } } },
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    off(fn) { listeners.delete(fn); },

    get(coll, id) { return id == null ? null : S.map(coll).get(id) || null; },
    map(coll) { if (!maps[coll]) maps[coll] = new Map((S.state[coll] || []).map((o) => [o.id, o])); return maps[coll]; },
    list(coll) { return S.state[coll] || []; },

    add(coll, obj) { if (!obj.id) obj.id = SW.uid(coll[0]); S.state[coll].push(obj); S.save(); S.emit({ coll, id: obj.id, op: 'add' }); return obj; },
    put(coll, obj) { const i = S.state[coll].findIndex((o) => o.id === obj.id); if (i >= 0) S.state[coll][i] = obj; else S.state[coll].push(obj); S.save(); S.emit({ coll, id: obj.id, op: i >= 0 ? 'put' : 'add' }); return obj; },
    patch(coll, id, p) { const o = S.state[coll].find((x) => x.id === id); if (!o) return null; Object.assign(o, p); S.save(); S.emit({ coll, id, op: 'patch' }); return o; },
    remove(coll, id) {
      const st = S.state;
      st[coll] = st[coll].filter((o) => o.id !== id);
      // Verweise bereinigen
      if (coll === 'teachers') {
        for (const k of st.classes) {
          for (const f of ['mainTeacherId', 'deputyTeacherId', 'abuTeacherId']) if (k[f] === id) k[f] = null;
          for (const s of Object.keys(k.subjectTeachers || {})) if (k.subjectTeachers[s] === id) delete k.subjectTeachers[s];
          k.extraTeachers = (k.extraTeachers || []).filter((e) => e.teacherId !== id);
          k.extraLessons = (k.extraLessons || []).map((e) => (e.teacherId === id ? { ...e, teacherId: null } : e));
        }
        if (st.settings.currentTeacherId === id) st.settings.currentTeacherId = null;
        st.timeEntries = st.timeEntries.filter((e) => e.teacherId !== id);
        st.absences = st.absences.filter((a) => a.teacherId !== id);
        if (st.timetable) st.timetable.lessons = st.timetable.lessons.filter((l) => l.teacherId !== id);
      }
      if (coll === 'rooms') {
        for (const k of st.classes) if (k.homeRoomId === id) k.homeRoomId = null;
        st.bookings = st.bookings.filter((b) => b.roomId !== id);
        if (st.timetable) for (const l of st.timetable.lessons) if (l.roomId === id) l.roomId = null;
      }
      if (coll === 'subjects') {
        for (const c of st.curricula) c.subjects = c.subjects.filter((s) => s.subjectId !== id);
        for (const t of st.teachers) t.subjectIds = (t.subjectIds || []).filter((s) => s !== id);
        for (const k of st.classes) { delete (k.subjectTeachers || {})[id]; k.extraLessons = (k.extraLessons || []).filter((e) => e.subjectId !== id); }
        if (st.timetable) st.timetable.lessons = st.timetable.lessons.filter((l) => l.subjectId !== id);
      }
      if (coll === 'curricula') for (const k of st.classes) if (k.curriculumId === id) k.curriculumId = null;
      if (coll === 'classes') {
        if (st.timetable) st.timetable.lessons = st.timetable.lessons.filter((l) => l.classId !== id);
        st.chat.channels = st.chat.channels.filter((c) => c.classId !== id);
      }
      S.save(); S.emit({ coll, id, op: 'remove' });
    },
    update(fn, meta) { const r = fn(S.state); S.save(); S.emit(meta || { op: 'update' }); return r; },
    setSetting(k, v) { S.state.settings[k] = v; S.save(); S.emit({ op: 'setting', key: k }); },

    setTimetable(tt) {
      const st = S.state;
      if (st.timetable) {
        st.variants.unshift({ id: st.timetable.id, createdAt: st.timetable.createdAt, score: st.timetable.score, stats: st.timetable.stats, lessons: st.timetable.lessons, unplaced: st.timetable.unplaced, seed: st.timetable.seed, label: st.timetable.label });
        st.variants = st.variants.slice(0, 5);
      }
      st.timetable = tt;
      S.save(); S.emit({ op: 'timetable' });
    },
    restoreVariant(id) {
      const st = S.state;
      const v = st.variants.find((x) => x.id === id); if (!v) return;
      st.variants = st.variants.filter((x) => x.id !== id);
      S.setTimetable({ ...v, status: 'draft' });
    },

    exportJSON() { return JSON.stringify(S.state, null, 2); },
    importJSON(text) { const raw = JSON.parse(text); if (!raw || typeof raw !== 'object' || !raw.settings) throw new Error('Keine gültige STUNDENWERK-Datei'); S.state = S.migrate(raw); S.save(); S.emit({ op: 'import' }); },
    reset() { S.state = M.emptyState(); S.save(); S.emit({ op: 'reset' }); },
    loadDemo() { if (!SW.seed) throw new Error('Demo-Daten nicht geladen'); S.state = S.migrate(SW.seed.build()); S.state.settings.onboarded = true; S.save(); S.emit({ op: 'demo' }); },

    // Benachrichtigungen (Glocke oben rechts)
    notify(n) { S.state.notifications.unshift({ id: SW.uid('n'), ts: Date.now(), read: false, ...n }); S.state.notifications = S.state.notifications.slice(0, 50); S.save(); S.emit({ op: 'notify' }); },
    markNotificationsRead() { for (const n of S.state.notifications) n.read = true; S.save(); S.emit({ op: 'notify' }); },
  });
})();
