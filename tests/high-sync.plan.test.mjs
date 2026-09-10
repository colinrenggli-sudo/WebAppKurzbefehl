// Prüft die Erinnerungslogik des Dienstes ohne Netz und ohne Container.
//   node tests/high-sync.plan.test.mjs
// Der Dienst wird dabei importiert, nicht gestartet: duePayloads() ist reine
// Rechnerei, und genau dort sassen die Fehler, die am Ende eine Erinnerung
// gekostet hätten.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
process.env.SYNC_TOKEN = 'test-token-abcdefghijklmnop';
process.env.DATA_DIR = process.env.DATA_DIR || '/tmp/high-sync-test-daten';
const require = createRequire(import.meta.url);
const m = require(new URL('../deploy/high-sync/server.js', import.meta.url).pathname);
const { duePayloads, appDayKey, appMinutes, planDayKey } = m;

const at = (s) => new Date(s);
let n = 0, bad = 0;
function t(name, fn) { n++; try { fn(); } catch (e) { bad++; console.log('FEHLT:', name, '\n   ', e.message); } }

const basis = {
  version: 2, dayEnd: 3, pause: null,
  morning: { at: '09:00', enabled: true },
  evening: { at: '20:00', enabled: true },
  tasks: [],
  today: { day: '2026-09-11', openRoutines: 2, openLabels: ['🧘 Meditieren', '📖 Lesen'], openTodos: 1, doneTaskIds: [] },
};
const kopie = (o) => JSON.parse(JSON.stringify(o));

t('App-Tag: 01:00 gehört noch zum Vortag', () => {
  assert.equal(appDayKey(at('2026-09-12T01:00:00'), 3), '2026-09-11');
  assert.equal(appDayKey(at('2026-09-12T03:00:00'), 3), '2026-09-12');
});

t('Minuten seit Tagesbeginn: 00:30 liegt nach 20:00', () => {
  assert.ok(appMinutes('00:30', 3) > appMinutes('20:00', 3));
  assert.equal(appMinutes('03:00', 3), 0);
  assert.equal(appMinutes('kaputt', 3), null);
});

t('Nachts um 01:00 gilt der Stand von gestern nicht als veraltet', () => {
  // 01:00 am 12.9. ist App-Tag 11.9. – der Plan passt, es ist nichts offen
  const p = kopie(basis);
  p.today.openRoutines = 0; p.today.openTodos = 0;
  p.tasks = [{ id: 't1', label: 'Sport', emoji: '🏃', at: '18:00' }];
  const due = duePayloads(p, at('2026-09-12T01:00:00'));
  assert.deepEqual(due.map(d => d.key), [], 'nichts offen → keine Erinnerung');
});

t('Ohne dayEnd verhält es sich wie bisher (Kalendertag)', () => {
  // Genau der Fall, der vorher schiefging: um 00:35 gilt der Stand von «gestern»
  // als veraltet, und der Wecker um 00:30 geht los, obwohl alles erledigt ist.
  const alt = kopie(basis); delete alt.dayEnd;
  alt.today.openRoutines = 0; alt.today.openTodos = 0; alt.today.openLabels = [];
  alt.tasks = [{ id: 'nacht', label: 'Zähne', emoji: '🪥', at: '00:30' }];
  assert.equal(duePayloads(alt, at('2026-09-12T00:35:00')).some(d => d.key === 'task:nacht'), true,
    'ohne dayEnd bleibt das alte Verhalten');
  const neu = kopie(alt); neu.dayEnd = 3;
  assert.equal(duePayloads(neu, at('2026-09-12T00:35:00')).some(d => d.key === 'task:nacht'), false,
    'mit dayEnd erkennt der Dienst, dass der Stand aktuell ist');
});

t('Wecker um 00:30 kommt um 00:30, nicht schon um 15:00', () => {
  const p = kopie(basis);
  p.tasks = [{ id: 'nacht', label: 'Zähne', emoji: '🪥', at: '00:30' }];
  assert.equal(duePayloads(p, at('2026-09-11T15:00:00')).some(d => d.key === 'task:nacht'), false);
  const nachts = kopie(p); // 00:30 des 12.9. = App-Tag 11.9.
  assert.equal(duePayloads(nachts, at('2026-09-12T00:35:00')).some(d => d.key === 'task:nacht'), true);
});

t('Ferien: keine Erinnerung', () => {
  const p = kopie(basis);
  p.pause = { from: '2026-09-08', until: '2026-09-20' };
  assert.deepEqual(duePayloads(p, at('2026-09-11T21:00:00')), []);
  // auch wenn der Stand veraltet ist
  const q = kopie(p); q.today.day = '2026-08-01';
  assert.deepEqual(duePayloads(q, at('2026-09-11T21:00:00')), []);
});

t('Morgens erinnert es auch, wenn nur To-Dos offen sind', () => {
  const p = kopie(basis);
  p.today.openRoutines = 0; p.today.openLabels = []; p.today.openTodos = 2;
  const due = duePayloads(p, at('2026-09-11T09:30:00'));
  const m = due.find(d => d.key === 'morning');
  assert.ok(m, 'Morgen-Erinnerung fehlt');
  assert.match(m.body, /2 To-Dos/);
});

t('Erledigte Routine löst keinen Wecker aus', () => {
  const p = kopie(basis);
  p.tasks = [{ id: 't1', label: 'Sport', emoji: '🏃', at: '08:00' }];
  p.today.doneTaskIds = ['t1'];
  assert.equal(duePayloads(p, at('2026-09-11T12:00:00')).some(d => d.key === 'task:t1'), false);
});

t('Alles erledigt: kein Wecker, kein Abend-Check', () => {
  const p = kopie(basis);
  p.today.openRoutines = 0; p.today.openTodos = 0; p.today.openLabels = [];
  p.tasks = [{ id: 't1', label: 'Sport', emoji: '🏃', at: '08:00' }];
  assert.deepEqual(duePayloads(p, at('2026-09-11T21:00:00')).map(d => d.key), []);
});

t('Abgeschaltete Erinnerung schweigt', () => {
  const p = kopie(basis);
  p.morning.enabled = false; p.evening.enabled = false;
  assert.deepEqual(duePayloads(p, at('2026-09-11T21:00:00')).map(d => d.key), []);
});

t('Tageswechsel: der Schlüssel für die Versandliste stimmt', () => {
  assert.equal(planDayKey(basis, at('2026-09-12T02:59:00')), '2026-09-11');
  assert.equal(planDayKey(basis, at('2026-09-12T03:01:00')), '2026-09-12');
});

console.log(bad ? `${bad} von ${n} Prüfungen fehlgeschlagen` : `alle ${n} Prüfungen bestanden`);
process.exit(bad ? 1 : 0);
