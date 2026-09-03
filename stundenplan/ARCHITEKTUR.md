# STUNDENWERK – Architektur und Konventionen

Statische Web-App ohne Build. Klassische `<script>`-Dateien in fester Reihenfolge (siehe `index.html`),
alles hängt am globalen Namensraum `SW`. Läuft per Doppelklick (file://) und auf GitHub Pages.
Sprache der Oberfläche: Deutsch (Schweiz) – **ss statt ß**, Du-Form vermeiden, neutral formulieren
(«Lehrperson», nicht «Lehrer»).

## Dateien

| Datei | Inhalt |
|---|---|
| `css/app.css` | Design-System: Tokens (Light/Dark), Layout, Bausteine (.btn .inp .card .chip .tbl .tabs .banner .kpi …), Wochenraster (.tt .ls), Verfügbarkeit (.avail), Chat, Paywall, Druck |
| `js/util.js` | `SW.h()` DOM-Builder, `SW.icon(name)`, Format/Datum (`SW.fmtDate`, `SW.isoDate`, `SW.addDays`), `SW.rng(seed)`, `SW.uid`, `SW.debounce`, `SW.download` |
| `js/model.js` | Konstanten: `M.DAYS`, `M.ROOM_TYPES`, `M.ROOM_REQ`, `M.EMOJI_GROUPS`, `M.COLORS`, `M.DEFAULT_WEIGHTS`, `M.PRO_FEATURES`, `M.BOOKING_KINDS`, `M.TIME_KINDS`, Schema-Vorlagen `M.newRoom()` … |
| `js/store.js` | `SW.store`: `state`, `get/map/list/add/put/patch/remove/update/setSetting`, `on(fn)`, `setTimetable(tt)`, `exportJSON/importJSON/reset/loadDemo`, `notify()` |
| `js/domain.js` | `SW.domain`: Bedarf pro Klasse, Lehrpersonen-Zuweisung, Machbarkeitsanalyse, Konfliktprüfung, Plan-Statistiken |
| `js/solver.js` | `SW.solver.generate(state, opts)` (async, Fortschritt), `validate(state, lessons)`, `cost(state, lessons)` |
| `js/seed.js` | `SW.seed.build({scale})` Demo-Datensatz |
| `js/ui.js` | `SW.ui`: Modal, Confirm, Toast, Menü, Formularfelder, Emoji-Picker, Verfügbarkeitsraster, Wochenraster, Paywall |
| `js/router.js` | Hash-Routing, Navigation (`SW.router.go/refresh/current`) |
| `js/views/*.js` | Eine Ansicht pro Datei: `SW.views[route] = { title, render(el, params), manualRefresh?, onLeave? }` |
| `js/app.js` | Start, Shell (Sidebar, Topbar, Rollenwechsel, Theme), Onboarding |

## Datenmodell (`SW.store.state`)

```js
settings: { schoolName, schoolYear, semesterStart, days:[1..5], slots:[{n,start,end}], lunchAfter:5, theme, role:'admin'|'teacher',
            currentTeacherId, proUnlocked:false, weights:{…}, quality:'schnell'|'normal'|'gruendlich', seed, lessonsFull:25, annualHoursFull:1900 }
rooms:     [{ id, name, type:'klassenzimmer'|'informatik'|'display'|'grossraum'|'aula'|'turnhalle'|'labor'|'aussen'|'besprechung'|…, capacity, building, floor, features:[], active, notes, blocked:{ '1':[bool×slots] } (wöchentliche Sperrzeiten) }]
subjects:  [{ id, name, short, color, roomReq:'any'|'klassenzimmer'|'informatik'|'display'|'turnhalle'|'grossraum'|'labor', block:1|2, category }]
curricula: [{ id, name, short, years, description, daysPerYear:{1:2,2:2,3:1}, subjects:[{ subjectId, lessons:{1:n,2:n,3:n}, block:1|2 }] }]
teachers:  [{ id, emoji, code, color, subjectIds:[], maxLessons, employment, availability:{ '1':[bool×slots], … }, preferredDays:[], notes, active }]
classes:   [{ id, name, size, curriculumId, year, mainTeacherId, deputyTeacherId, abuTeacherId, homeRoomId, schoolDays:[1,4],
              subjectTeachers:{ subjectId: teacherId }, extraTeachers:[{teacherId, role}], extraLessons:[{subjectId, lessons, block, teacherId}], notes }]
timetable: { id, createdAt, seed, status:'draft'|'published', lessons:[{ id, classId, subjectId, teacherId, roomId, day, slot, len, locked }],
             unplaced:[{classId, subjectId, teacherId, len, reason, count}], score, stats, assignments, log, weights, label }
variants:  [ ältere Pläne, max. 5 ]
bookings:  [{ id, title, roomId, date:'YYYY-MM-DD', from:'18:00', to:'21:00', kind:'event'|'reinigung'|'aufbau'|'unterhalt'|'pruefung'|'sitzung'|'extern', assignee, status:'offen'|'bestätigt'|'erledigt', attendees, notes, autoTasks }]
timeEntries: [{ id, teacherId, date, from, to, kind, note }]     absences: [{ id, teacherId, from, to, reason, note, substitutes:{lessonId: teacherId} }]
chat: { channels:[{ id, name, kind:'schule'|'fach'|'klasse'|'direkt', icon, classId?, subjectId?, members? }], messages:[{ id, channelId, teacherId, text, ts }] }
notifications: [{ id, ts, read, icon, text, link }]
```

Lehrpersonen haben **keinen Namen** – nur `emoji` und optional ein Kürzel `code` (in der Demo Tiernamen).
Überall `SW.ui.avatar(t)` / `SW.ui.teacherPill(t)` / `SW.domain.teacherLabel(t)` verwenden.

## Regeln für Ansichten

1. `render(el, params)` baut die Seite **synchron** in `el` (ein `div.page`) auf; `params = { id, query, path }`.
2. Nur über `SW.store`-Methoden schreiben. Nach jeder Änderung rendert der Router die aktuelle Ansicht neu
   (ausser `manualRefresh: true` – dann selbst `SW.store.on(...)` abonnieren und in `onLeave` abmelden).
3. Formulare in Modals (`SW.ui.modal`), Felder mit `SW.ui.field(label, SW.ui.input({...}))`. Pflichtfelder prüfen, Fehler als Toast.
4. Löschen immer mit `await SW.ui.confirm({danger:true})`.
5. Seitenkopf: `SW.ui.pageHeader({title, lead, actions:[…]})`. Leere Zustände: `SW.ui.empty({...})` mit Aktion.
6. Pro-Ansichten: `el.append(SW.ui.proGate('calendar', () => inhalt()))` – der Inhalt wird nur gebaut, wenn `proUnlocked`.
   Oben in Pro-Ansichten `SW.ui.demoStrip()` einfügen.
7. Keine Inline-Styles ausser für dynamische Werte (Farben, Breiten). CSS-Klassen aus `app.css` nutzen; zusätzliches CSS der Ansicht
   mit `SW.ui.injectCSS('ansicht', '…')` am Anfang von `render` einfügen, Klassen mit Präfix der Ansicht (z.B. `.gen-…`).
8. Links auf Objekte: `#/klassen/<id>`, `#/lehrpersonen/<id>`, `#/raeume/<id>`, `#/lehrgaenge/<id>`, `#/stundenplan?view=klasse&id=<id>` (view: klasse|lehrperson|raum).
9. Zahlen mit `SW.fmtNum`, Datum mit `SW.fmtDate`. Schweizer Schreibweise.
10. Alles muss auch mit **leerem Zustand** (keine Daten) funktionieren, ohne Fehler.
