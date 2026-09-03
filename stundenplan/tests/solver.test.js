// Tests für den Generator: harte Regeln, Vollständigkeit, Determinismus, Machbarkeitsanalyse.
// Ausführen: node tests/solver.test.js
const SW = require('./load.js');
const assert = require('assert');
const D = SW.domain;
let failed = 0; const results = [];
async function test(name, fn) { try { await fn(); results.push('✓ ' + name); } catch (e) { failed++; results.push('✗ ' + name + '\n    ' + (e.stack || e).toString().split('\n').slice(0, 3).join('\n    ')); } }

(async () => {
  const state = SW.seed.build();
  await test('Demo-Daten: Machbarkeitsanalyse ohne Fehler', () => {
    const f = D.feasibility(state);
    const errs = f.issues.filter((i) => i.level === 'error');
    assert.strictEqual(errs.length, 0, 'Fehler: ' + errs.map((e) => e.title + ' – ' + e.text).join(' | '));
  });
  let plan;
  await test('Generator platziert alle Lektionen (Demo, seed 42)', async () => {
    const t0 = Date.now();
    plan = await SW.solver.generate(state, { seed: 42, maxIterations: 60000, timeMs: 60000 });
    const need = SW.sum(state.classes, (k) => D.classLessonCount(state, k));
    const placed = SW.sum(plan.lessons, (l) => l.len || 1);
    console.log(`  → ${placed}/${need} Lektionen, Kosten ${plan.score}, ${plan.durationMs} ms, ${plan.iterations} Iterationen, Freistunden Klassen ${plan.stats.classGaps}, LP ${plan.stats.teacherGaps}`);
    if (plan.unplaced.length) console.log('  unplatziert:', plan.unplaced.map((u) => `${D.classOf(state, u.classId).name} ${D.subjectOf(state, u.subjectId).short}: ${u.reason}`));
    assert.strictEqual(placed, need);
    assert.strictEqual(plan.unplaced.length, 0);
  });
  await test('Harte Regeln: keine Verletzungen', () => {
    const v = SW.solver.validate(state, plan.lessons);
    assert.strictEqual(v.length, 0, v.slice(0, 5).map((x) => x.text).join(' | '));
  });
  await test('Weiche Kriterien: keine Freistunden bei Klassen', () => {
    assert.ok(plan.stats.classGaps <= 2, 'Freistunden Klassen: ' + plan.stats.classGaps);
  });
  await test('Kostenfunktion stimmt mit Solver überein (grob)', () => {
    const c = SW.solver.cost(state, plan.lessons);
    assert.ok(Math.abs(c.total - plan.score) < Math.max(3, plan.score * 0.05), `cost ${c.total} vs score ${plan.score}`);
  });
  await test('Determinismus: gleicher Seed → gleicher Plan', async () => {
    const a = await SW.solver.generate(state, { seed: 7, maxIterations: 3000, timeMs: 60000 });
    const b = await SW.solver.generate(state, { seed: 7, maxIterations: 3000, timeMs: 60000 });
    const key = (p) => p.lessons.map((l) => [l.classId, l.subjectId, l.day, l.slot, l.roomId].join(':')).sort().join('|');
    assert.strictEqual(key(a), key(b));
  });
  await test('Fixierte Lektionen bleiben', async () => {
    const st = SW.clone(state); st.timetable = SW.clone(plan);
    const fixed = st.timetable.lessons.slice(0, 5); fixed.forEach((l) => (l.locked = true));
    const p2 = await SW.solver.generate(st, { seed: 99, maxIterations: 2000, timeMs: 60000 });
    for (const f of fixed) { const m = p2.lessons.find((l) => l.id === f.id); assert.ok(m && m.day === f.day && m.slot === f.slot, 'Fixierte Lektion verschoben'); }
    assert.strictEqual(SW.solver.validate(st, p2.lessons).length, 0);
  });
  await test('Unmögliche Verfügbarkeit → verständlicher Grund', async () => {
    const st = SW.clone(state);
    const k = st.classes[0]; const sid = Object.keys(k.subjectTeachers)[0]; const t = st.teachers.find((x) => x.id === k.subjectTeachers[sid]);
    for (const d of k.schoolDays) t.availability[d] = t.availability[d].map(() => false);
    const f = D.feasibility(st); assert.ok(f.issues.some((i) => i.level === 'error' && i.code === 'teacher-class-days'), 'Machbarkeit meldet nichts');
    const p = await SW.solver.generate(st, { seed: 1, maxIterations: 500, timeMs: 60000 });
    assert.ok(p.unplaced.some((u) => u.classId === k.id && u.subjectId === sid && /verfügbar/.test(u.reason)), JSON.stringify(p.unplaced.slice(0, 2)));
    assert.strictEqual(SW.solver.validate(st, p.lessons).length, 0);
  });
  await test('Leerer Zustand → kein Absturz', async () => {
    const st = SW.model.emptyState();
    const p = await SW.solver.generate(st, { seed: 1, maxIterations: 10, timeMs: 1000 });
    assert.strictEqual(p.lessons.length, 0);
    const f = D.feasibility(st); assert.ok(f.errors > 0);
  });
  await test('Stresstest: doppelte Schule (scale 2)', async () => {
    const st = SW.seed.build({ scale: 2 });
    const f = D.feasibility(st); const errs = f.issues.filter((i) => i.level === 'error');
    console.log(`  → ${st.classes.length} Klassen, ${st.teachers.length} LP, Fehler in Analyse: ${errs.length}`, errs.slice(0, 3).map((e) => e.title));
    const t0 = Date.now();
    const p = await SW.solver.generate(st, { seed: 3, maxIterations: 40000, timeMs: 60000 });
    const need = SW.sum(st.classes, (k) => D.classLessonCount(st, k)); const placed = SW.sum(p.lessons, (l) => l.len || 1);
    console.log(`  → ${placed}/${need} platziert, Kosten ${p.score}, ${Date.now() - t0} ms, Freistunden Klassen ${p.stats.classGaps}`);
    if (p.unplaced.length) console.log('  unplatziert:', p.unplaced.slice(0, 5).map((u) => `${D.classOf(st, u.classId).name} ${D.subjectOf(st, u.subjectId).short}: ${u.reason}`));
    assert.strictEqual(SW.solver.validate(st, p.lessons).length, 0);
    assert.ok(placed >= need * 0.97, `nur ${placed}/${need}`);
  });
  console.log(results.join('\n'));
  console.log(failed ? `\n${failed} Test(s) fehlgeschlagen` : '\nAlle Tests bestanden');
  process.exit(failed ? 1 : 0);
})();
