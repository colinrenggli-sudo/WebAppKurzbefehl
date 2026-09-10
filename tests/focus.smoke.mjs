// Focus – Smoke-Test mit Playwright (Chromium, iPhone-14-Viewport)
//
// Deckt ab: Erststart und Onboarding, Routinen erledigen (inkl. Schritte und
// Mini-Version), perfekter Tag mit Feier, Rückgängig, To-Dos mit Fokus,
// Tagesabschluss, Migration alter Daten (focusTasksV2/focusHistory), Tageswechsel
// mit Joker über eine gestellte Uhr, «Willkommen zurück», Merge-Konvergenz,
// Token-Scoreboard (eintragen, bearbeiten, löschen/widerrufen, Belohnungen).
//
// Voraussetzungen (einmalig):   npm install playwright && npx playwright install chromium
// App ausliefern (Repo-Wurzel):  npx http-server -p 8123 -c-1 .
// Ausführen:                      node tests/focus.smoke.mjs
// Optional: BASE=http://127.0.0.1:8123/ OUT=tests/shots  (Screenshots landen in OUT)
import { chromium, devices } from 'playwright';
import fs from 'fs';
process.env.TZ = 'Europe/Zurich';

const BASE = process.env.BASE || 'http://127.0.0.1:8123/';
const OUT = process.env.OUT || new URL('./shots', import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });

const issues = [];
function note(msg) { issues.push(msg); console.log('ISSUE:', msg); }
function ok(msg) { console.log('ok:', msg); }

const browser = await chromium.launch();
const iphone = devices['iPhone 14'];

const NOON = (() => { const d = new Date(); d.setHours(12, 0, 0, 0); return d; })();
async function newPage(opts = {}) {
  const ctx = await browser.newContext({ ...iphone, colorScheme: opts.colorScheme || 'dark', locale: 'de-CH', timezoneId: 'Europe/Zurich' });
  const page = await ctx.newPage();
  await page.clock.install({ time: NOON });
  page.on('pageerror', e => note('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/favicon|gstatic|firebase|net::ERR/i.test(m.text())) note('console.error: ' + m.text()); });
  return { ctx, page };
}


async function dismissAll(page) {
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(450);
    if (await page.locator('#celebrate.show').count()) { await page.click('#celebrateBtn'); } else break;
  }
  await page.waitForTimeout(200);
}

const D = (offsetDays) => { const d = new Date(NOON); d.setDate(d.getDate() + offsetDays); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

// ---------- Szenario A: Erststart ----------
{
  const { ctx, page } = await newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const title = await page.textContent('#navTitle');
  if (title.trim() !== 'Heute') note('nav title wrong: ' + title);
  const welcome = await page.locator('.empty-title').first().textContent().catch(() => '');
  if (!/Willkommen/.test(welcome)) note('onboarding not shown on first run: ' + welcome);
  await page.screenshot({ path: `${OUT}/a1-onboarding.png` });
  await page.click('[data-act="starter"][data-i="0"]');
  await page.waitForTimeout(300);
  await page.click('[data-act="starter"][data-i="1"]');
  await page.waitForTimeout(300);
  const cards = await page.locator('.routine').count();
  if (cards !== 2) note('expected 2 routines after starters, got ' + cards);
  await page.screenshot({ path: `${OUT}/a1b-onboarding-2.png` });
  await page.click('[data-act="onboardingDone"]');
  await page.waitForTimeout(400);
  if (await page.locator('[data-act="onboardingDone"]').count()) note('onboarding card still visible after Los geht\'s');
  await page.screenshot({ path: `${OUT}/a2-today.png` });
  // Routine erledigen
  await page.click('.routine .check-btn');
  await page.waitForTimeout(900);
  await dismissAll(page);
  const done = await page.locator('.routine.done').count();
  if (done !== 1) note('expected 1 done routine, got ' + done);
  const ring = await page.textContent('.ring-num');
  if (!/1/.test(ring)) note('ring not updated: ' + ring);
  await page.screenshot({ path: `${OUT}/a3-one-done.png` });
  // Zweite erledigen -> perfekter Tag -> Feier
  await page.click('.routine:not(.done) .check-btn');
  await page.waitForTimeout(1400);
  const celebrateShown = await page.locator('#celebrate.show').count();
  if (!celebrateShown) note('perfect-day celebration not shown');
  await page.screenshot({ path: `${OUT}/a4-celebrate.png` });
  await page.click('#celebrateBtn');
  await dismissAll(page);
  const badgesNow = await page.evaluate(() => Object.keys(S.game.badges));
  if (badgesNow.includes('comeback')) note('comeback badge wrongly unlocked on day one');
  const streakPill = await page.locator('.pill.flame').first().textContent();
  if (!/1 Tag/.test(streakPill)) note('streak pill after perfect day: ' + streakPill);
  // Rückgängig
  await page.click('.routine.done .check-btn');
  await page.waitForTimeout(500);
  const xpAfterUndo = await page.evaluate(() => totalXp());
  const st = await page.evaluate(() => JSON.parse(localStorage.getItem('focusHistory')));
  const todayEntry = st[Object.keys(st).sort().pop()];
  if (todayEntry.bonus && todayEntry.bonus.perfect) note('perfect bonus not revoked after undo');
  ok('xp after undo = ' + xpAfterUndo);
  // Routine-Editor öffnen (Nav +)
  await page.click('#navAdd');
  await page.waitForTimeout(600);
  if (!(await page.locator('#taskSheet.show').count())) note('task sheet did not open');
  await page.fill('#tName', 'Stretching');
  await page.fill('#tSubInput', 'Hamstrings'); await page.press('#tSubInput', 'Enter');
  await page.fill('#tSubInput', 'Hips'); await page.press('#tSubInput', 'Enter');
  // Wochenende abwählen
  await page.click('#tDays [data-d="6"]'); await page.click('#tDays [data-d="0"]');
  await page.fill('#tAlarm', '18:00');
  await page.screenshot({ path: `${OUT}/a5-editor.png` });
  await page.click('#tSave');
  await page.waitForTimeout(700);
  const cards2 = await page.locator('.routine').count();
  const wd = NOON.getDay();
  const expected = (wd === 0 || wd === 6) ? 2 : 3;
  if (cards2 !== expected) note(`expected ${expected} routines after adding weekday task, got ${cards2}`);
  if (expected === 3) {
    // Subtasks aufklappen und abhaken
    const card = () => page.locator('.routine', { hasText: 'Stretching' });
    await card().locator('.routine-hit').click();
    await page.waitForTimeout(400);
    const isOpen = await card().evaluate(el => el.classList.contains('open'));
    if (!isOpen) note('subtask accordion did not open');
    await card().locator('.sub-item').nth(0).click();
    await page.waitForTimeout(400);
    const subDone = await card().locator('.sub-item.done').count();
    if (subDone !== 1) note('subtask toggle failed, done=' + subDone);
    const startedChip = await card().locator('.meta-chip.sub', { hasText: 'angefangen' }).count();
    if (!startedChip) note('started chip (angefangen) missing');
    await card().locator('.sub-item').nth(1).click();
    await page.waitForTimeout(900);
    await dismissAll(page);
    const doneNow = await card().evaluate(el => el.classList.contains('done'));
    if (!doneNow) note('task not completed after all subtasks');
    await page.screenshot({ path: `${OUT}/a6-subtasks.png` });
  }
  // To-Dos
  await page.click('#tabTodos');
  await page.waitForTimeout(400);
  await page.fill('#quickInput', 'Steuern einreichen');
  await page.press('#quickInput', 'Enter');
  await page.waitForTimeout(300);
  await page.fill('#quickInput', 'Mama anrufen');
  await page.click('[data-act="quickAdd"]');
  await page.waitForTimeout(300);
  const rows = await page.locator('.todo-row').count();
  if (rows !== 2) note('expected 2 todos, got ' + rows);
  // Fokus setzen
  await page.locator('[data-act="todoFocus"]').first().click();
  await page.waitForTimeout(300);
  const focusRows = await page.locator('.focus-card .todo-row').count();
  if (focusRows !== 1) note('focus todo not in focus card: ' + focusRows);
  // Editor
  await page.locator('[data-act="todoEdit"]').last().click();
  await page.waitForTimeout(600);
  await page.click('#dDue [data-due="today"]');
  const todVisible = await page.locator('#dTodField').isVisible();
  if (!todVisible) note('time-of-day field not shown after due date');
  await page.click('#dTod [data-tod="evening"]');
  await page.fill('#dNote', 'Kurz melden');
  await page.click('#dSave');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/a7-todos.png` });
  // To-Do abhaken
  await page.locator('.list-card [data-act="todoToggle"]').first().click();
  await page.waitForTimeout(600);
  await dismissAll(page);
  const doneTodos = await page.evaluate(() => S.todos.filter(t => t.completed).length);
  if (doneTodos !== 1) note('todo completion failed: ' + doneTodos);
  // Fortschritt
  await page.click('#tabProgress');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/a8-progress.png` }); await page.locator('.card[aria-label="Kalender"]').screenshot({ path: `${OUT}/a8b-calendar.png` });
  const badgeCount = await page.locator('.badge:not(.locked)').count();
  ok('badges unlocked: ' + badgeCount);
  // Einstellungen
  await page.click('#navSettings');
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/a9-settings.png` });
  await page.click('#themeSeg [data-theme="light"]');
  await page.waitForTimeout(300);
  const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  if (theme !== 'light') note('theme switch failed: ' + theme);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  await page.click('#tabToday');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/a10-today-light.png` });
  // Kontextmenü per contextmenu-Event
  await page.locator('.routine').first().dispatchEvent('contextmenu');
  await page.waitForTimeout(500);
  if (!(await page.locator('#actionSheet.show').count())) note('context action sheet not shown');
  await page.screenshot({ path: `${OUT}/a11-actionsheet.png` });
  await page.click('#actionSheet [data-cancel]');
  await page.waitForTimeout(400);
  // Mini-Version über Kontextmenü
  const openCard = page.locator('.routine:not(.done)').first();
  if (await openCard.count()) {
    await openCard.dispatchEvent('contextmenu');
    await page.waitForTimeout(500);
    const miniBtn = page.locator('#actionSheet .action-btn', { hasText: 'Mini-Version' });
    if (!(await miniBtn.count())) note('mini option missing in context menu');
    else { await miniBtn.click(); await page.waitForTimeout(900); await dismissAll(page);
      const rec = await page.evaluate(() => { const e = S.history[todayKey()]; return Object.values(e.tasks).some(r => r.kind === 'mini'); });
      if (!rec) note('mini completion not recorded');
      if (!(await page.locator('.mini-chip').count())) note('mini chip not shown on card'); }
  }
  // Tagesabschluss
  const closeBtn = page.locator('.close-day');
  if (!(await closeBtn.count())) note('Tag abschliessen button not visible after perfect day');
  else {
    await closeBtn.click(); await page.waitForTimeout(600);
    if (!(await page.locator('#reviewSheet.show').count())) note('review sheet did not open');
    await page.click('#reviewBody [data-mood="good"]'); await page.waitForTimeout(200);
    const pick = page.locator('#reviewBody [data-pick]').first();
    if (await pick.count()) { await pick.click(); await page.waitForTimeout(200); }
    await page.fill('#reviewNewTodo', 'Rechnung zahlen'); await page.press('#reviewNewTodo', 'Enter'); await page.waitForTimeout(300);
    await page.screenshot({ path: `${OUT}/a12-review.png` });
    await page.click('#reviewSave'); await page.waitForTimeout(600);
    const rev = await page.evaluate(() => S.history[todayKey()].review);
    if (!rev || rev.mood !== 'good') note('review not saved: ' + JSON.stringify(rev));
    const focusN = await page.evaluate(() => S.todos.filter(t => t.focus && !t.completed).length);
    if (focusN < 1) note('review picks did not set focus: ' + focusN);
    if (!(await page.locator('.close-day.done').count())) note('close-day button not in done state after review');
    await page.screenshot({ path: `${OUT}/a13-today-after-review.png` });
  }
  await ctx.close();
}

// ---------- Szenario B: Legacy-Daten (altes Format) ----------
{
  const { ctx, page } = await newPage();
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ y1, y2, y3, today }) => {
    localStorage.clear();
    localStorage.setItem('focusTasksV2', JSON.stringify([
      { id: 'meditate', label: 'Meditieren', emoji: '🧘', color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', completed: false, counter: 12, subtasks: [] },
      { id: 'work', label: '<img src=x onerror=alert(1)>Crazy Work', emoji: '🔥', color: '#06B6D4', bg: 'rgba(6,182,212,0.08)', completed: true, counter: 3 },
      { id: 'stretches', label: 'Stretches', emoji: '🤸', color: '#10B981', bg: 'x', completed: false, counter: 0, alarmTime: '07:30', alarmNotifiedDate: null,
        subtasks: [{ name: 'Hamstring', completed: true }, { name: 'Hip', completed: false }] },
    ]));
    localStorage.setItem('focusHistory', JSON.stringify({
      [y3]: { completed: true, done: 3, total: 3, timestamp: 1 },
      [y2]: { completed: true, done: 3, total: 3, timestamp: 1 },
      [y1]: { completed: true, done: 3, total: 3, timestamp: 1 },
      [today]: { completed: false, done: 1, total: 3, timestamp: 1 },
      'garbage': 5,
    }));
    localStorage.setItem('focusTodosV1', JSON.stringify([{ id: 'a', title: 'Alt', note: '', dueDate: y1, timeOfDay: 'morning', completed: false, completedAt: null, createdAt: '2026-01-01T00:00:00Z' }]));
    localStorage.setItem('focusTodoSettingsV1', JSON.stringify({ notifyEnabled: true, notifyTime: '08:30', lastNotifiedDate: null }));
    localStorage.setItem('focusLastReset', 'Mon Jan 01 2024');
  }, { y1: D(-1), y2: D(-2), y3: D(-3), today: D(0) });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const cards = await page.locator('.routine').count();
  if (cards !== 3) note('legacy: expected 3 routines, got ' + cards);
  const streak = await page.evaluate(() => currentStreak());
  if (streak !== 4) note('legacy: expected streak 4 (3 perfect days + today partial) from history, got ' + streak);
  const xp = await page.evaluate(() => totalXp());
  ok('legacy xp = ' + xp + ', streak = ' + streak);
  const alerted = await page.evaluate(() => !!document.querySelector('img[src="x"]'));
  if (alerted) note('legacy: XSS payload rendered unescaped');
  const labelText = await page.locator('.routine-title').nth(1).textContent();
  if (!labelText.includes('<img')) note('legacy: label not rendered as text: ' + labelText);
  // completed flag of legacy 'work' must reset because lastReset != today
  const anyDone = await page.locator('.routine.done').count();
  if (anyDone !== 0) note('legacy: completed flags not reset on new day: ' + anyDone);
  const settings = await page.evaluate(() => S.settings);
  if (settings.notifyTime !== '08:30' || !settings.notifyEnabled) note('legacy: todo settings not migrated');
  await page.screenshot({ path: `${OUT}/b1-legacy-today.png` });
  await page.click('#tabProgress');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/b2-legacy-progress.png` }); await page.locator('.card[aria-label="Kalender"]').screenshot({ path: `${OUT}/b2b-legacy-calendar.png` }); await page.locator('.rstat').first().locator('..').screenshot({ path: `${OUT}/b2c-legacy-rstats.png` });
  const ws = await page.evaluate(() => weekStats(todayKey()));
  if (ws.done < 3) note('legacy: week stats ignore legacy perfect days: ' + JSON.stringify(ws));
  const streakText = await page.locator('.streak-num').textContent();
  if (!/^4/.test(streakText.trim())) note('legacy: streak card shows ' + streakText);
  await ctx.close();
}

// ---------- Szenario C: Tageswechsel & Joker (Uhr manipulieren) ----------
{
  const ctx = await browser.newContext({ ...iphone, colorScheme: 'dark', locale: 'de-CH', timezoneId: 'Europe/Zurich' });
  const page = await ctx.newPage();
  page.on('pageerror', e => note('C pageerror: ' + e.message));
  const base = new Date(NOON); base.setHours(10, 0, 0, 0);
  await page.clock.install({ time: base });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('[data-act="starter"][data-i="0"]');
  await page.waitForTimeout(300);
  // Tag 1..7 perfekt -> Joker verdienen
  for (let day = 0; day < 7; day++) {
    if (day > 0) {
      const t = new Date(base); t.setDate(t.getDate() + day);
      await page.clock.setSystemTime(t);
      await page.evaluate(() => tick());
      await page.waitForTimeout(200);
    }
    const open = await page.locator('.routine:not(.done) .check-btn').count();
    if (!open) { note('C: no open routine on day ' + day); break; }
    await page.click('.routine:not(.done) .check-btn');
    await page.waitForTimeout(900);
    await dismissAll(page);
  }
  let streak = await page.evaluate(() => currentStreak());
  let jokers = await page.evaluate(() => S.game.jokers);
  if (streak !== 7) note('C: expected streak 7, got ' + streak);
  if (jokers !== 2) note('C: expected 2 jokers (1 start + 1 earned), got ' + jokers);
  ok(`C: streak ${streak}, jokers ${jokers}`);
  // Tag 7 verpassen, Tag 8 öffnen -> Joker eingesetzt, Streak bleibt
  const t9 = new Date(base); t9.setDate(t9.getDate() + 8);
  await page.clock.setSystemTime(t9);
  await page.evaluate(() => tick());
  await page.waitForTimeout(300);
  streak = await page.evaluate(() => currentStreak());
  jokers = await page.evaluate(() => S.game.jokers);
  const frozen = await page.evaluate(() => Object.values(S.history).filter(e => e.frozen).length);
  if (frozen !== 1) note('C: expected 1 frozen day, got ' + frozen);
  if (streak !== 7) note('C: expected streak 7 kept via joker, got ' + streak);
  if (jokers !== 1) note('C: expected 1 joker left, got ' + jokers);
  ok(`C after miss: streak ${streak}, jokers ${jokers}, frozen ${frozen}`);
  // Weitere Tage verpassen -> Joker verbraucht, Streak bricht
  const t13 = new Date(base); t13.setDate(t13.getDate() + 12);
  await page.clock.setSystemTime(t13);
  await page.evaluate(() => tick());
  await page.waitForTimeout(1500);
  // Comeback-Dialog: «Als verpasst» wählen
  if (await page.locator('#actionSheet.show').count()) {
    const opts = page.locator('#actionSheet .action-btn:not(.cancel)');
    if ((await opts.count()) < 2) note('C: comeback sheet without two options');
    await page.screenshot({ path: `${OUT}/c0-comeback.png` });
    await opts.nth(1).click(); await page.waitForTimeout(500);
  } else note('C: comeback sheet not shown after 4 missed days');
  streak = await page.evaluate(() => currentStreak());
  jokers = await page.evaluate(() => S.game.jokers);
  if (streak !== 0) note('C: expected streak 0 after 3 missed days, got ' + streak);
  if (jokers !== 0) note('C: expected 0 jokers, got ' + jokers);
  const best = await page.evaluate(() => bestStreak());
  if (best !== 7) note('C: best streak should be 7, got ' + best);
  ok(`C after break: streak ${streak}, best ${best}, jokers ${jokers}`);
  await page.click('#tabProgress');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/c1-progress-after-break.png` }); await page.locator('.card[aria-label="Kalender"]').screenshot({ path: `${OUT}/c1b-calendar.png` });
  await ctx.close();
}


// ---------- Szenario D: Merge-Konvergenz & Tombstones (im Seitenkontext) ----------
{
  const { ctx, page } = await newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const today = todayKey(), y = addDays(today, -1);
    const mk = (over) => stateFromRaw(Object.assign({
      tasks: [{ id: 'a', label: 'A', emoji: '🧘', colorId: 'green', days: [0,1,2,3,4,5,6], createdAt: 0, updatedAt: 10, counter: 3, counterBase: 3 },
              { id: 'b', label: 'B', emoji: '📚', colorId: 'blue', days: [0,1,2,3,4,5,6], createdAt: 0, updatedAt: 10, counter: 1, counterBase: 1 }],
      todos: [{ id: 't1', title: 'X', createdAt: '2026-01-01T00:00:00Z', updatedAt: 5 }],
      settings: { theme: 'dark', updatedAt: 0 },
      history: { [y]: { completed: true, done: 2, total: 2, tasks: { a: { at: 1000, xp: 10 }, b: { at: 1001, xp: 10 } }, todos: {}, bonus: { perfect: 25 }, final: true } },
      game: { jokers: 1, firstDay: y, lastOpenDay: today, updatedAt: 0 },
    }, over));
    // Gerät A: heute a erledigt, dann wieder zurückgenommen (Tombstone). Gerät B: hat nur die Erledigung gesehen.
    const A = mk({ history: { [y]: { completed: true, done: 2, total: 2, tasks: { a: { at: 1000, xp: 10 }, b: { at: 1001, xp: 10 } }, todos: {}, bonus: { perfect: 25 }, final: true },
                              [today]: { tasks: { a: { undone: 5000 } }, todos: {}, bonus: {}, done: 0, total: 2 } } });
    const B = mk({ history: { [y]: { completed: true, done: 2, total: 2, tasks: { a: { at: 1000, xp: 10 }, b: { at: 1001, xp: 10 } }, todos: {}, bonus: { perfect: 25 }, final: true },
                              [today]: { tasks: { a: { at: 4000, xp: 10 } }, todos: {}, bonus: {}, done: 1, total: 2 } },
                   game: { jokers: 2, firstDay: y, lastOpenDay: today, updatedAt: 0 } });
    const AB = mergeStates(A, B), BA = mergeStates(B, A);
    const hAB = hashState(AB), hBA = hashState(BA);
    const idem = hashState(mergeStates(AB, B)) === hAB && hashState(mergeStates(AB, A)) === hAB;
    const tomb = !!(AB.history[today].tasks.a && AB.history[today].tasks.a.undone);
    const jokers = AB.game.jokers;
    // Beide Seiten normalisiert (settings-Defaults) müssen gleich hashen
    const symmetric = hashState(stateFromRaw(JSON.parse(JSON.stringify({ tasks: AB.tasks, todos: AB.todos, settings: AB.settings, taskHistory: AB.history, game: AB.game })))) === hAB;
    return { commutative: hAB === hBA, idem, tomb, jokers, symmetric, doneToday: AB.history[today].tasks.a };
  });
  if (!r.commutative) note('D: merge not commutative');
  if (!r.idem) note('D: merge not idempotent');
  if (!r.tomb) note('D: tombstone lost in merge: ' + JSON.stringify(r.doneToday));
  if (r.jokers !== 1) note('D: joker tie-break should take min (1), got ' + r.jokers);
  if (!r.symmetric) note('D: hash of round-tripped cloud doc differs from local hash (sync would ping-pong)');
  ok('D: merge commutative=' + r.commutative + ' idem=' + r.idem + ' tomb=' + r.tomb + ' symmetric=' + r.symmetric);
  await ctx.close();
}

// ---------- Szenario E: Token-Scoreboard ----------
{
  const { ctx, page } = await newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('#tabTokens'); await page.waitForTimeout(400);
  const rewards0 = await page.locator('.reward-row').count();
  if (rewards0 !== 4) note('E: expected 4 default rewards, got ' + rewards0);
  await page.screenshot({ path: `${OUT}/e1-tokens-empty.png` });
  // 25 Token eintragen
  await page.click('#tokenBtn'); await page.waitForTimeout(600);
  await page.click('#tokenSheet [data-k="10"]'); for (let i = 0; i < 15; i++) await page.click('#kPlus');
  await page.fill('#kNote', 'Planer-App nach drei Monaten fertig – heisst jetzt HIGH');
  await page.click('#kSave'); await page.waitForTimeout(700); await dismissAll(page);
  let total = await page.evaluate(() => tokenTotal());
  if (total !== 25) note('E: expected total 25, got ' + total);
  // +10 -> 35 -> Kokosnuss erreicht -> Feier
  await page.click('#tokenBtn'); await page.waitForTimeout(600);
  await page.click('#tokenSheet [data-k="10"]'); await page.click('#kSave'); await page.waitForTimeout(900);
  const celebrated = await page.locator('#celebrate.show').count();
  if (!celebrated) note('E: reward celebration not shown');
  await page.screenshot({ path: `${OUT}/e2-reward-reached.png` });
  await dismissAll(page);
  const reached = await page.locator('.reward-row.reached').count();
  if (reached !== 1) note('E: expected 1 reached reward, got ' + reached);
  await page.screenshot({ path: `${OUT}/e3-tokens.png` });
  // Eintrag bearbeiten: 25 -> 5 => total 15 -> Kokosnuss wieder offen
  await page.locator('.log-row').last().click(); await page.waitForTimeout(600);
  await page.click('#tokenSheet [data-k="5"]'); await page.click('#kSave'); await page.waitForTimeout(600);
  total = await page.evaluate(() => tokenTotal());
  if (total !== 15) note('E: expected total 15 after edit, got ' + total);
  if (await page.locator('.reward-row.reached').count() !== 0) note('E: reward should be un-reached after edit');
  // Eigene Belohnung anlegen (20) -> sofort erreicht? nein 15 < 20
  await page.click('[data-act="rewardAdd"]'); await page.waitForTimeout(600);
  await page.fill('#rName', 'Kaffee'); await page.fill('#rPoints', '20'); await page.click('#rSave'); await page.waitForTimeout(600);
  if (await page.locator('.reward-row').count() !== 5) note('E: custom reward not added');
  // Eintrag löschen + Widerrufen
  await page.locator('.log-row').first().click(); await page.waitForTimeout(600);
  await page.click('#kDelete'); await page.waitForTimeout(500);
  if (await page.evaluate(() => tokenTotal()) !== 5) note('E: delete did not reduce total');
  await page.click('.toast-btn'); await page.waitForTimeout(500);
  if (await page.evaluate(() => tokenTotal()) !== 15) note('E: undo did not restore entry');
  // Merge-Roundtrip mit Token
  const sym = await page.evaluate(() => { const st = currentState(); const rt = stateFromRaw(JSON.parse(JSON.stringify(gatherCloudDoc()))); return hashState(mergeStates(st, rt)) === hashState(st); });
  if (!sym) note('E: token state not stable through cloud roundtrip');
  ok('E: tokens total=' + total + ' rewards ok');
  await ctx.close();
}

// ---------- Szenario F: Reduzierte Bewegung – nichts Unsichtbares darf im Weg stehen ----------
// Hintergrund: «Bewegung reduzieren» (iOS-Einstellung) hatte den ausgeblendeten
// In-App-Hinweis sichtbar und tastbar gemacht. Er klebte über der obersten Leiste
// und über dem Kopf jedes Sheets – «Neue Routine» liess sich nicht mehr schliessen.
{
  const ctx = await browser.newContext({ ...iphone, colorScheme: 'dark', locale: 'de-CH', timezoneId: 'Europe/Zurich', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.clock.install({ time: NOON });
  page.on('pageerror', e => note('F: pageerror: ' + e.message));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const banner = await page.evaluate(() => { const c = getComputedStyle(document.getElementById('banner')); return { op: +c.opacity, pe: c.pointerEvents }; });
  if (banner.op !== 0 || banner.pe !== 'none') note(`F: hidden banner is visible/tappable (opacity ${banner.op}, pointer-events ${banner.pe})`);
  const topEl = await page.evaluate(() => { const el = document.elementFromPoint(30, 70); return el ? (el.id || el.className || el.tagName) : 'nothing'; });
  if (/banner/.test(String(topEl))) note('F: banner covers the navbar area');
  // Onboarding und Navigationsknöpfe müssen erreichbar sein
  await page.click('[data-act="starter"][data-i="0"]'); await page.waitForTimeout(300);
  await page.click('[data-act="onboardingDone"]'); await page.waitForTimeout(400);
  try { await page.click('#navAdd', { timeout: 5000 }); } catch (e) { note('F: navbar "+" not tappable'); }
  await page.waitForTimeout(600);
  if (!(await page.locator('#taskSheet.show').count())) note('F: routine sheet did not open');
  try { await page.click('#taskSheet [data-close]', { timeout: 5000 }); } catch (e) { note('F: routine sheet cannot be closed'); }
  await page.waitForTimeout(600);
  if (await page.locator('#taskSheet.show').count()) note('F: routine sheet stayed open');
  // Ein Hinweis darf sich nie über ein offenes Sheet legen
  await page.evaluate(() => openTaskEditor(null)); await page.waitForTimeout(500);
  const delivered = await page.evaluate(() => notify('⏰', 'Test', 'Body', 'f-test'));
  if (delivered !== false || await page.locator('#banner.show').count()) note('F: banner shown over an open sheet');
  // Eine Feier wartet, bis das Sheet zu ist – und geht dabei nicht verloren
  await page.evaluate(() => celebrate({ emoji: '🎉', eyebrow: 'Test', title: 'Test' })); await page.waitForTimeout(500);
  if (await page.locator('#celebrate.show').count()) note('F: celebration covered an open sheet');
  await page.evaluate(() => closeSheet()); await page.waitForTimeout(1200);
  if (!(await page.locator('#celebrate.show').count())) note('F: deferred celebration was lost');
  await page.click('#celebrateBtn'); await page.waitForTimeout(500);
  ok('F: reduced motion – no invisible blockers');
  await ctx.close();
}

// ---------- Szenario G: Erinnerungen ----------
// Hintergrund: Ohne erteilte Systemberechtigung passierte gar nichts – auch der In-App-Hinweis
// nicht, der keine Berechtigung braucht. Ausserdem überschrieben sich mehrere Erinnerungen
// im selben Durchlauf, Alarme feuerten in der Pause und nach dem Tageswechsel ein zweites Mal.
{
  const ctx = await browser.newContext({ ...iphone, colorScheme: 'dark', locale: 'de-CH', timezoneId: 'Europe/Zurich' });
  const page = await ctx.newPage();
  const EVENING = new Date(NOON); EVENING.setHours(21, 0, 0, 0);
  await page.clock.install({ time: EVENING });
  page.on('pageerror', e => note('G: pageerror: ' + e.message));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  // Ohne Berechtigung (Chromium verweigert standardmässig) muss der In-App-Hinweis trotzdem kommen
  const shown = await page.evaluate(async () => {
    S.settings.onboardingDone = true; S.settings.eveningEnabled = true; S.settings.eveningTime = '20:00';
    S.tasks = [normalizeTask({ id: 'g1', label: 'Bewegung', emoji: '🏃' })];
    S.device.lastEveningDate = null;
    saveAll(); renderAll();
    await tick();
    return { perm: (window.Notification && Notification.permission) || 'none', banner: document.getElementById('banner').classList.contains('show'), title: document.getElementById('bannerTitle').textContent, marked: S.device.lastEveningDate };
  });
  if (shown.perm === 'granted') note('G: test expected an ungranted permission, got granted');
  if (!shown.banner) note('G: no in-app reminder without system permission (' + JSON.stringify(shown) + ')');
  if (!shown.marked) note('G: reminder was not marked as delivered');
  // Ein zweiter Hinweis darf den ersten nicht überschreiben, sondern wartet
  const second = await page.evaluate(async () => await notify('📝', 'Zweiter', 'Hinweis', 'g-2'));
  if (second !== false) note('G: a second reminder overwrote the visible one');
  await page.evaluate(() => hideBanner());
  // Alarme schweigen in der Pause
  const paused = await page.evaluate(async () => {
    S.tasks[0].alarmTime = '07:00';
    S.game.pause = { from: todayKey(), until: addDays(todayKey(), 7) };
    S.device.alarmNotified = {}; saveAll();
    await tick();
    return document.getElementById('banner').classList.contains('show');
  });
  if (paused) note('G: routine alarm fired during a pause');
  // Und am Anlegetag der Routine ebenfalls nicht
  const fresh = await page.evaluate(async () => {
    S.game.pause = null;
    S.tasks[0].createdAt = Date.now();
    S.device.alarmNotified = {}; saveAll();
    await tick();
    return document.getElementById('banner').classList.contains('show');
  });
  if (fresh) note('G: alarm fired for a routine created today');
  // Nach dem Tageswechsel um 03:00 darf dieselbe Erinnerung nicht erneut kommen
  const twice = await page.evaluate(async () => {
    S.tasks[0].createdAt = Date.now() - 86400000 * 5;
    S.device.alarmNotified = {}; S.device.lastEveningDate = null; saveAll();
    await tick();
    const first = document.getElementById('banner').classList.contains('show');
    hideBanner();
    const before = JSON.stringify(S.device.alarmNotified);
    return { first, before };
  });
  if (!twice.first) note('G: alarm did not fire for an overdue routine');
  await page.clock.setFixedTime(new Date(NOON.getFullYear(), NOON.getMonth(), NOON.getDate() + 1, 3, 30, 0));
  const again = await page.evaluate(async () => { await tick(); return document.getElementById('banner').classList.contains('show'); });
  if (again) note('G: the same alarm fired again after the 03:00 day change');
  ok('G: reminders – in-app without permission, one at a time, quiet during a pause');
  await ctx.close();
}

// ---------- Szenario H: Darstellungsvarianten ----------
// Hell, erhöhter Kontrast und ein schmales Gerät: nichts darf herausragen,
// jedes Sheet muss sich schliessen lassen, keine Fehler in der Konsole.
{
  for (const [name, opts] of [
    ['hell', { colorScheme: 'light' }],
    ['kontrast', { colorScheme: 'dark', contrast: 'more' }],
    ['schmal', { colorScheme: 'dark', viewport: { width: 320, height: 568 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
  ]) {
    const ctx = await browser.newContext({ ...iphone, locale: 'de-CH', timezoneId: 'Europe/Zurich', ...opts });
    const page = await ctx.newPage();
    await page.clock.install({ time: NOON });
    page.on('pageerror', e => note(`H (${name}): pageerror: ` + e.message));
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    await page.evaluate(() => {
      S.settings.onboardingDone = true;
      S.tasks = [normalizeTask({ label: 'Meditieren', emoji: '🧘' }), normalizeTask({ label: 'Bewegung', emoji: '🏃', subtasks: [{ name: 'Aufwärmen' }, { name: 'Laufen' }] })];
      S.todos = [normalizeTodo({ title: 'Steuererklärung fertig machen', focus: true, focusRank: 1 })];
      addTokenEntry(12, 'Keller aufgeräumt');
      saveAll(); renderAll();
    });
    await page.waitForTimeout(500);
    for (let i = 0; i < 6; i++) { if (await page.locator('#celebrate.show').count()) { await page.click('#celebrateBtn'); await page.waitForTimeout(400); } else break; }
    await page.evaluate(() => { closeAllSheets(); hideBanner(); });
    for (const tab of ['today', 'todos', 'tokens', 'progress']) {
      await page.evaluate(t => switchTab(t), tab); await page.waitForTimeout(350);
      const bad = await page.evaluate((tab) => {
        const out = [];
        if (document.documentElement.scrollWidth > innerWidth + 1) out.push(`${tab}: horizontaler Überlauf`);
        document.querySelectorAll('.view.active *').forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.width && (r.left < -1 || r.right > innerWidth + 1)) {
            const cls = (el.className && String(el.className).split(' ')[0]) || el.tagName;
            if (!/dots|cal-|badge-grid/.test(cls)) out.push(`${tab}: «${cls}» ragt heraus`);
          }
        });
        return out;
      }, tab);
      bad.forEach(b => note(`H (${name}): ${b}`));
    }
    for (const [sheet, fn] of [['taskSheet', () => openTaskEditor(null)], ['settings', () => openSettings()], ['review', () => openReview()]]) {
      await page.evaluate(fn); await page.waitForTimeout(450);
      if (!(await page.locator('.sheet.show').count())) { note(`H (${name}): ${sheet} öffnet nicht`); continue; }
      const state = await page.evaluate(() => {
        const s = document.querySelector('.sheet.show'); const b = s.querySelector('[data-close]');
        if (!b) return 'kein Schliessknopf';
        const r = b.getBoundingClientRect();
        const hit = document.elementFromPoint(Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2));
        return (b.contains(hit) || hit === b) ? 'ok' : 'verdeckt';
      });
      if (state !== 'ok') note(`H (${name}): ${sheet} Schliessknopf ${state}`);
      await page.evaluate(() => closeAllSheets()); await page.waitForTimeout(350);
    }
    await ctx.close();
  }
  ok('H: hell, Kontrast und 320 pt – nichts ragt heraus, alle Sheets schliessbar');
}

await browser.close();
console.log('\n==== SUMMARY ====');
console.log(issues.length ? issues.join('\n') : 'no issues');
fs.writeFileSync(`${OUT}/../issues.json`, JSON.stringify(issues, null, 2));
