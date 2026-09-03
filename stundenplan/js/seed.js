/* STUNDENWERK · seed.js — Demo-Datensatz nach dem Muster einer grossen kaufmännischen Berufsfachschule (KV Luzern).
   Deterministisch (fester Seed), keine Personendaten: Lehrpersonen sind Emojis mit Tiernamen als Kürzel.
   SW.seed.build({ scale: 1 }) → vollständiger Zustand. scale 2 verdoppelt Klassen und Lehrpersonen (Stresstest). */
(function () {
  const SW = (globalThis.SW = globalThis.SW || {});
  const M = SW.model;

  const SUBJECTS = [
    { id: 's_wg', name: 'Wirtschaft & Gesellschaft', short: 'W&G', color: '#3B5BDB', roomReq: 'any', block: 2, category: 'beruf' },
    { id: 's_de', name: 'Deutsch (Standardsprache)', short: 'D', color: '#DC2626', roomReq: 'any', block: 1, category: 'sprache' },
    { id: 's_fr', name: 'Französisch', short: 'F', color: '#0891B2', roomReq: 'any', block: 1, category: 'sprache' },
    { id: 's_en', name: 'Englisch', short: 'E', color: '#7C3AED', roomReq: 'any', block: 1, category: 'sprache' },
    { id: 's_ika', name: 'IKA (Information, Kommunikation, Administration)', short: 'IKA', color: '#0E9F6E', roomReq: 'informatik', block: 2, category: 'beruf' },
    { id: 's_vv', name: 'Vertiefen & Vernetzen / Selbständige Arbeit', short: 'V&V', color: '#B7791F', roomReq: 'any', block: 1, category: 'beruf' },
    { id: 's_ufk', name: 'Überfachliche Kompetenzen', short: 'ÜfK', color: '#65A30D', roomReq: 'any', block: 1, category: 'allgemein' },
    { id: 's_sp', name: 'Sport', short: 'SP', color: '#EA580C', roomReq: 'turnhalle', block: 2, category: 'sport' },
    { id: 's_abu', name: 'Allgemeinbildung (ABU)', short: 'ABU', color: '#DB2777', roomReq: 'any', block: 2, category: 'allgemein' },
    { id: 's_bk', name: 'Berufskenntnisse Detailhandel (HKB A–D)', short: 'BK', color: '#65A30D', roomReq: 'any', block: 2, category: 'beruf' },
    { id: 's_bkv', name: 'Berufskenntnisse Vertiefung (HKB E/F)', short: 'BK-V', color: '#16A34A', roomReq: 'any', block: 2, category: 'beruf' },
    { id: 's_ma', name: 'Mathematik', short: 'M', color: '#4F46E5', roomReq: 'any', block: 1, category: 'bm' },
    { id: 's_frw', name: 'Finanz- und Rechnungswesen', short: 'FRW', color: '#0D9488', roomReq: 'any', block: 2, category: 'bm' },
    { id: 's_wr', name: 'Wirtschaft und Recht', short: 'WR', color: '#2563EB', roomReq: 'any', block: 2, category: 'bm' },
    { id: 's_gp', name: 'Geschichte und Politik', short: 'GP', color: '#B45309', roomReq: 'any', block: 1, category: 'bm' },
    { id: 's_tu', name: 'Technik und Umwelt', short: 'TU', color: '#9333EA', roomReq: 'display', block: 1, category: 'bm' },
    { id: 's_hkb_a', name: 'HKB A · Handeln in agilen Arbeits- und Organisationsformen', short: 'HKB A', color: '#2563EB', roomReq: 'any', block: 1, category: 'kv2023' },
    { id: 's_hkb_b', name: 'HKB B · Interagieren in einem vernetzten Arbeitsumfeld (inkl. Englisch)', short: 'HKB B', color: '#16A34A', roomReq: 'any', block: 2, category: 'kv2023' },
    { id: 's_hkb_c', name: 'HKB C · Koordinieren von unternehmerischen Arbeitsprozessen', short: 'HKB C', color: '#C026D3', roomReq: 'any', block: 2, category: 'kv2023' },
    { id: 's_hkb_d', name: 'HKB D · Gestalten von Kunden- oder Lieferantenbeziehungen', short: 'HKB D', color: '#D97706', roomReq: 'any', block: 2, category: 'kv2023' },
    { id: 's_hkb_e', name: 'HKB E · Einsetzen von Technologien der digitalen Arbeitswelt', short: 'HKB E', color: '#0891B2', roomReq: 'informatik', block: 2, category: 'kv2023' },
    { id: 's_wpb', name: 'Wahlpflichtbereich (Französisch oder Projektarbeit)', short: 'WPB', color: '#0E7490', roomReq: 'any', block: 1, category: 'kv2023' },
    { id: 's_opt', name: 'Option (Finanzen / Technologie / Kommunikation)', short: 'OPT', color: '#B7791F', roomReq: 'any', block: 1, category: 'kv2023' },
  ];

  // Lektionentafeln: Lektionen pro Woche je Lehrjahr. Wochenverteilung als Annäherung an die Jahrestotale der
  // Bildungsverordnungen (Kaufleute 2023: 1800 Lektionen, 2-2-1 Schultage; Details in RECHERCHE.md).
  const L = (a, b, c) => ({ 1: a, 2: b ?? 0, 3: c ?? 0 });
  const CURRICULA = [
    { id: 'c_k23', name: 'Kauffrau/Kaufmann EFZ (Kaufleute 2023)', short: 'KV EFZ', years: 3, days: { 1: 2, 2: 2, 3: 1 }, description: 'Bildungsverordnung 2023: Handlungskompetenzbereiche A–E, Wahlpflichtbereich, Option im 3. Lehrjahr.',
      subjects: [['s_hkb_a', L(2, 1, 1), 1], ['s_hkb_b', L(2, 2, 1), 2], ['s_hkb_c', L(3, 4, 1), 2], ['s_hkb_d', L(3, 4, 1), 2], ['s_hkb_e', L(3, 2, 1), 2], ['s_wpb', L(3, 3, 0), 1], ['s_opt', L(0, 0, 3), 1], ['s_sp', L(2, 2, 1), 2]] },
    { id: 'c_m', name: 'Kaufleute EFZ mit BM1 Typ Wirtschaft', short: 'KV BM1', years: 3, days: { 1: 2, 2: 2, 3: 2 }, description: 'Lehrbegleitende Berufsmaturität: Grundlagen-, Schwerpunkt- und Ergänzungsfächer, zwei Schultage in allen Lehrjahren.',
      subjects: [['s_de', L(2, 2, 2), 1], ['s_fr', L(2, 2, 2), 1], ['s_en', L(2, 2, 2), 1], ['s_ma', L(2, 2, 1), 1], ['s_frw', L(2, 3, 3), 2], ['s_wr', L(2, 2, 3), 2], ['s_gp', L(0, 1, 2), 1], ['s_tu', L(1, 1, 1), 1], ['s_hkb_c', L(2, 1, 1), 1], ['s_hkb_e', L(1, 1, 0), 1], ['s_sp', L(2, 1, 1), 2]] },
    { id: 'c_e', name: 'Kauffrau/Kaufmann EFZ · E-Profil (auslaufend)', short: 'E-Profil', years: 3, days: { 1: 2, 2: 2, 3: 1 }, description: 'Erweiterte Grundbildung mit zwei Fremdsprachen (Bildungsverordnung 2012).',
      subjects: [['s_wg', L(5, 6, 2), 2], ['s_de', L(2, 2, 2), 1], ['s_fr', L(2, 2, 2), 1], ['s_en', L(2, 2, 2), 1], ['s_ika', L(3, 2, 0), 2], ['s_vv', L(1, 2, 0), 1], ['s_ufk', L(1, 0, 0), 1], ['s_sp', L(2, 2, 1), 2]] },
    { id: 'c_b', name: 'Kauffrau/Kaufmann EFZ · B-Profil (auslaufend)', short: 'B-Profil', years: 3, days: { 1: 2, 2: 2, 3: 1 }, description: 'Basis-Grundbildung mit einer Fremdsprache und mehr IKA (Bildungsverordnung 2012).',
      subjects: [['s_wg', L(6, 6, 2), 2], ['s_de', L(2, 2, 2), 1], ['s_en', L(2, 2, 2), 1], ['s_ika', L(4, 4, 2), 2], ['s_vv', L(1, 2, 0), 1], ['s_ufk', L(1, 0, 0), 1], ['s_sp', L(2, 2, 1), 2]] },
    { id: 'c_eba', name: 'Kauffrau/Kaufmann EBA', short: 'KV EBA', years: 2, days: { 1: 2, 2: 1 }, description: 'Zweijährige Grundbildung (Bildungsverordnung 2023): zwei Schultage im 1., ein Schultag im 2. Lehrjahr.',
      subjects: [['s_hkb_a', L(2, 2), 1], ['s_hkb_b', L(4, 2), 2], ['s_hkb_c', L(3, 2), 2], ['s_hkb_d', L(3, 0), 2], ['s_hkb_e', L(2, 1), 2], ['s_sp', L(2, 1), 2]] },
    { id: 'c_dh', name: 'Detailhandelsfachfrau/-mann EFZ', short: 'Detailhandel', years: 3, days: { 1: 2, 2: 2, 3: 1 }, description: 'Verkauf 2022+: Berufskenntnisse HKB A–D, Vertiefung im 3. Lehrjahr, Fremdsprache, Allgemeinbildung, Sport.',
      subjects: [['s_bk', L(9, 14, 0), 2], ['s_bkv', L(0, 0, 5), 2], ['s_en', L(1, 1, 1), 1], ['s_abu', L(2, 2, 2), 2], ['s_sp', L(1, 1, 1), 1]] },
    { id: 'c_dha', name: 'Detailhandelsassistent/in EBA', short: 'DH EBA', years: 2, days: { 1: 1, 2: 1 }, description: 'Zweijährige Grundbildung Detailhandel, ein Schultag pro Woche.',
      subjects: [['s_bk', L(7, 7), 2], ['s_abu', L(1, 1), 1], ['s_sp', L(1, 1), 1]] },
  ];

  const ROOMS = [];
  const room = (name, type, capacity, building, floor, features) => ROOMS.push({ id: 'r_' + name.replace(/[^\w]/g, '').toLowerCase(), name, type, capacity, building, floor, features, active: true, notes: '' });
  for (let i = 1; i <= 12; i++) room(`Zimmer ${100 + i}`, 'klassenzimmer', i % 3 === 0 ? 28 : 26, 'Dreilinden', '1. OG', ['beamer', 'whiteboard', 'wandtafel']);
  for (let i = 1; i <= 4; i++) room(`Zimmer ${200 + i}`, 'display', 26, 'Dreilinden', '2. OG', ['display', 'whiteboard', 'lautsprecher']);
  for (let i = 1; i <= 5; i++) room(`Informatik ${300 + i}`, 'informatik', 24, 'Dreilinden', '3. OG', ['pc', 'beamer', 'klima']);
  room('Grossraum 401', 'grossraum', 60, 'Dreilinden', '4. OG', ['beamer', 'lautsprecher', 'verdunkelung']);
  room('Aula', 'aula', 220, 'Dreilinden', 'EG', ['buehne', 'lautsprecher', 'beamer', 'verdunkelung', 'barrierefrei']);
  room('Turnhalle 1', 'turnhalle', 30, 'Sporttrakt', 'EG', ['lautsprecher']);
  room('Turnhalle 2', 'turnhalle', 30, 'Sporttrakt', 'EG', ['lautsprecher']);
  room('Labor 501', 'labor', 20, 'Landenberg', '1. OG', ['beamer']);
  room('Sitzungszimmer A', 'besprechung', 12, 'Dreilinden', 'EG', ['display']);
  room('Sitzungszimmer B', 'besprechung', 8, 'Dreilinden', '2. OG', ['whiteboard']);
  room('Lehrpersonenzimmer', 'lehrerzimmer', 45, 'Dreilinden', '1. OG', ['kueche']);
  room('Mediothek', 'bibliothek', 40, 'Dreilinden', 'EG', ['pc']);
  room('Mensa', 'mensa', 160, 'Dreilinden', 'EG', ['kueche', 'barrierefrei']);
  room('Technik & Lager', 'lager', 0, 'Landenberg', 'UG', []);

  // Lehrpersonen: [Emoji, Kürzel, Fächer, Pensum %, Verfügbarkeitsmuster, Wunschtage]
  // Muster: 'voll' = Mo–Fr ganztags; 'mo-do' etc.; 'vm' = nur Vormittag; 'nm' = nur Nachmittag
  const TEACHERS = [
    ['🦁', 'Löwe', ['s_wg', 's_frw', 's_wr'], 100, { 1: 'x', 2: 'x', 3: 'x', 4: 'x', 5: 'x' }],
    ['🐸', 'Frosch', ['s_wg', 's_hkb_c', 's_vv'], 90, { 1: 'x', 2: 'x', 3: 'x', 4: 'x', 5: 'vm' }],
    ['🐷', 'Schwein', ['s_de', 's_gp', 's_ufk'], 80, { 1: 'x', 2: 'x', 4: 'x', 5: 'x' }],
    ['☀️', 'Sonne', ['s_de', 's_abu'], 100, { 1: 'x', 2: 'x', 3: 'x', 4: 'x', 5: 'x' }],
    ['🦊', 'Fuchs', ['s_fr', 's_wpb'], 60, { 1: 'x', 2: 'x', 4: 'x' }],
    ['🐼', 'Panda', ['s_fr', 's_en', 's_wpb'], 100, { 1: 'x', 2: 'x', 3: 'x', 4: 'x', 5: 'x' }],
    ['🐨', 'Koala', ['s_en', 's_hkb_b'], 70, { 2: 'x', 3: 'x', 4: 'x', 5: 'x' }],
    ['🐯', 'Tiger', ['s_en', 's_hkb_d', 's_hkb_b'], 100, { 1: 'x', 2: 'x', 3: 'x', 4: 'x', 5: 'x' }],
    ['🐮', 'Kuh', ['s_ika', 's_hkb_e'], 100, { 1: 'x', 2: 'x', 3: 'x', 4: 'x', 5: 'x' }],
    ['🐵', 'Affe', ['s_ika', 's_hkb_e', 's_opt'], 80, { 1: 'x', 3: 'x', 4: 'x', 5: 'x' }],
    ['🐧', 'Pinguin', ['s_sp'], 100, { 1: 'x', 2: 'x', 3: 'x', 4: 'x', 5: 'x' }],
    ['🦉', 'Eule', ['s_sp'], 50, { 1: 'x', 4: 'x', 5: 'vm' }],
    ['🦅', 'Adler', ['s_wg', 's_hkb_a', 's_hkb_c'], 100, { 1: 'x', 2: 'x', 3: 'x', 4: 'x', 5: 'x' }],
    ['🐺', 'Wolf', ['s_ma', 's_tu'], 80, { 1: 'x', 2: 'x', 3: 'x', 4: 'x' }],
    ['🐴', 'Pferd', ['s_abu', 's_de'], 100, { 1: 'x', 2: 'x', 3: 'x', 4: 'x', 5: 'x' }],
    ['🦄', 'Einhorn', ['s_bk', 's_bkv', 's_wg'], 80, { 2: 'x', 3: 'x', 5: 'x' }],
    ['🐝', 'Biene', ['s_bk', 's_bkv', 's_hkb_d'], 100, { 1: 'x', 2: 'x', 3: 'x', 4: 'x', 5: 'x' }],
    ['🦋', 'Falter', ['s_hkb_a', 's_hkb_c', 's_opt', 's_ufk'], 90, { 1: 'x', 2: 'x', 3: 'x', 4: 'x', 5: 'vm' }],
    ['🐢', 'Schildkröte', ['s_hkb_b', 's_hkb_e', 's_ika'], 100, { 1: 'x', 2: 'x', 3: 'x', 4: 'x', 5: 'x' }],
    ['🐙', 'Krake', ['s_wg', 's_frw', 's_ma', 's_wr'], 100, { 1: 'x', 2: 'x', 3: 'x', 4: 'x', 5: 'x' }],
    ['🐬', 'Delfin', ['s_de', 's_fr', 's_wpb'], 80, { 1: 'x', 2: 'x', 3: 'x', 4: 'nm', 5: 'x' }],
    ['🐘', 'Elefant', ['s_en', 's_fr', 's_hkb_b'], 100, { 1: 'x', 2: 'x', 3: 'x', 4: 'x', 5: 'x' }],
    ['🦒', 'Giraffe', ['s_sp', 's_abu'], 90, { 1: 'x', 2: 'x', 3: 'x', 5: 'x' }],
    ['🐿️', 'Hörnchen', ['s_ika', 's_hkb_e', 's_hkb_b'], 100, { 1: 'x', 2: 'x', 3: 'x', 4: 'x', 5: 'x' }],
    ['🦜', 'Papagei', ['s_hkb_c', 's_hkb_d', 's_opt'], 100, { 1: 'x', 2: 'x', 3: 'x', 4: 'x', 5: 'x' }],
    ['🌈', 'Regenbogen', ['s_wg', 's_hkb_a', 's_vv'], 70, { 1: 'x', 3: 'x', 4: 'x', 5: 'x' }],
    ['🍀', 'Klee', ['s_de', 's_en', 's_wpb'], 100, { 1: 'x', 2: 'x', 3: 'x', 4: 'x', 5: 'x' }],
    ['🍎', 'Apfel', ['s_abu', 's_bk', 's_bkv'], 80, { 1: 'x', 2: 'x', 3: 'x', 4: 'x' }],
    ['🎸', 'Gitarre', ['s_ma', 's_frw', 's_tu', 's_wr'], 100, { 1: 'x', 2: 'x', 3: 'x', 4: 'x', 5: 'x' }],
    ['🚀', 'Rakete', ['s_ika', 's_hkb_e'], 60, { 2: 'x', 4: 'x', 5: 'x' }],
    ['⚽', 'Ball', ['s_sp'], 80, { 1: 'x', 2: 'x', 3: 'x', 4: 'x' }],
    ['🌙', 'Mond', ['s_fr', 's_gp', 's_wpb'], 60, { 1: 'x', 2: 'x', 5: 'x' }],
    ['🦔', 'Igel', ['s_wg', 's_hkb_c', 's_hkb_d', 's_wr'], 100, { 1: 'x', 2: 'x', 3: 'x', 4: 'x', 5: 'x' }],
    ['🐳', 'Wal', ['s_en', 's_hkb_d', 's_hkb_b'], 90, { 1: 'x', 2: 'x', 3: 'x', 4: 'x', 5: 'vm' }],
    ['🐦', 'Spatz', ['s_bk', 's_bkv', 's_abu'], 100, { 1: 'x', 2: 'x', 3: 'x', 4: 'x', 5: 'x' }],
    ['🍋', 'Zitrone', ['s_hkb_c', 's_hkb_d', 's_hkb_a'], 80, { 1: 'x', 2: 'x', 3: 'x', 5: 'x' }],
  ];
  const EXTRA_EMOJI = ['🦆', '🐗', '🐌', '🐞', '🐍', '🦎', '🦀', '🐳', '🐠', '🦈', '🐊', '🦓', '🦘', '🐪', '🦥', '🦦', '🦫', '🐇', '🐈', '🐕', '🦩', '🦚', '🦢', '⭐', '⚡', '❄️', '🔥', '🌊', '🌵', '🌲', '🌻', '🌹', '🍁', '🍄'];

  // Klassen: [Name, Lehrgang, Lehrjahr, Grösse, Schultage]
  const CLASSES = [
    ['K1a', 'c_k23', 1, 24, [1, 4]], ['K1b', 'c_k23', 1, 23, [2, 5]], ['K1c', 'c_k23', 1, 22, [1, 3]],
    ['K2a', 'c_k23', 2, 22, [2, 4]], ['K2b', 'c_k23', 2, 21, [3, 5]],
    ['K3a', 'c_k23', 3, 20, [2]], ['K3b', 'c_k23', 3, 19, [4]],
    ['M1a', 'c_m', 1, 24, [1, 3]], ['M2a', 'c_m', 2, 22, [2, 5]], ['M3a', 'c_m', 3, 21, [1, 4]],
    ['E3a', 'c_e', 3, 20, [3]], ['B3a', 'c_b', 3, 18, [5]],
    ['BA1a', 'c_eba', 1, 16, [3, 5]], ['BA2a', 'c_eba', 2, 14, [2]],
    ['DH1a', 'c_dh', 1, 20, [1, 4]], ['DH2a', 'c_dh', 2, 18, [2, 5]], ['DH3a', 'c_dh', 3, 17, [3]],
    ['DA1a', 'c_dha', 1, 14, [4]], ['DA2a', 'c_dha', 2, 12, [1]],
  ];

  function availability(pattern, S, lunch) {
    const out = {};
    for (const [d, p] of Object.entries(pattern)) {
      out[d] = SW.range(S).map((i) => (p === 'x' ? true : p === 'vm' ? i < lunch : p === 'nm' ? i >= lunch : false));
    }
    return out;
  }

  SW.seed = {
    build({ scale = 1 } = {}) {
      const st = M.emptyState();
      const rng = SW.rng(7);
      const S = st.settings.slots.length; const lunch = st.settings.lunchAfter;
      st.settings.onboarded = true; st.settings.schoolName = 'KV Luzern Berufsfachschule';
      st.subjects = SW.clone(SUBJECTS);
      st.curricula = CURRICULA.map((c) => ({ id: c.id, name: c.name, short: c.short, years: c.years, description: c.description, daysPerYear: c.days, subjects: c.subjects.map(([subjectId, lessons, block]) => ({ subjectId, lessons, block })) }));
      st.rooms = SW.clone(ROOMS);
      if (scale > 1) for (let k = 1; k < scale; k++) {
        const bld = 'Erweiterung ' + k; const base = 100 * (k + 5);
        for (let i = 1; i <= 12; i++) st.rooms.push({ id: `r_zimmer${base + i}`, name: `Zimmer ${base + i}`, type: 'klassenzimmer', capacity: 26, building: bld, floor: '1. OG', features: ['beamer', 'whiteboard'], active: true, notes: '' });
        for (let i = 1; i <= 3; i++) st.rooms.push({ id: `r_display${base + 20 + i}`, name: `Zimmer ${base + 20 + i}`, type: 'display', capacity: 26, building: bld, floor: '2. OG', features: ['display'], active: true, notes: '' });
        for (let i = 1; i <= 5; i++) st.rooms.push({ id: `r_info${base + 30 + i}`, name: `Informatik ${base + 30 + i}`, type: 'informatik', capacity: 24, building: bld, floor: '3. OG', features: ['pc', 'beamer'], active: true, notes: '' });
        for (let i = 1; i <= 2; i++) st.rooms.push({ id: `r_halle${k}_${i}`, name: `Turnhalle ${k * 2 + i}`, type: 'turnhalle', capacity: 30, building: bld, floor: 'EG', features: ['lautsprecher'], active: true, notes: '' });
      }
      // Wöchentliche Sperrzeiten: Aula freitags ab Mittag (Konferenzen/Anlässe), Turnhalle 2 montags 1.–2. Lektion (Unterhalt)
      st.rooms.find((r) => r.id === 'r_aula').blocked = { 5: SW.range(S).map((i) => i >= lunch) };
      st.rooms.find((r) => r.id === 'r_turnhalle2').blocked = { 1: SW.range(S).map((i) => i < 2) };
      // Lehrpersonen
      let teachers = TEACHERS.map(([emoji, code, subjectIds, employment, pattern], i) => ({ ...M.newTeacher(), id: 't_' + code.toLowerCase().replace(/[^a-z]/g, ''), emoji, code, subjectIds, employment, maxLessons: Math.round((25 * employment) / 100), availability: availability(pattern, S, lunch), preferredDays: [], notes: '', _g: 0 }));
      if (scale > 1) {
        // Kopien der Schule: Schultage und Verfügbarkeiten um k Tage verschoben, damit jede Kopie für sich machbar bleibt
        const pool = M.EMOJIS.filter((e) => !TEACHERS.some((t) => t[0] === e)); let pi = 0;
        const shift = (pattern, k) => { const out = {}; for (const [d, v] of Object.entries(pattern)) out[((Number(d) - 1 + k) % 5) + 1] = v; return out; };
        for (let k = 1; k < scale; k++) teachers = teachers.concat(TEACHERS.map(([emoji, code, subjectIds, employment, pattern]) => ({ ...M.newTeacher(), id: `t_${code.toLowerCase().replace(/[^a-z]/g, '')}${k}`, emoji: pool[pi++ % pool.length], code: code + ' ' + (k + 1), subjectIds, employment, maxLessons: Math.round((25 * employment) / 100), availability: availability(shift(pattern, k), S, lunch), preferredDays: [], _g: k })));
      }
      st.teachers = teachers;
      // Klassen
      const stdRooms = st.rooms.filter((r) => r.type === 'klassenzimmer' || r.type === 'display');
      let classes = [];
      for (let k = 0; k < scale; k++) for (const [name, curriculumId, year, size, schoolDays] of CLASSES) {
        const suffix = k ? String.fromCharCode(97 + k + 2) : '';
        const days = k ? schoolDays.map((d) => ((d - 1 + k) % 5) + 1) : schoolDays;
        classes.push({ ...M.newClass(), id: 'k_' + (name + suffix).toLowerCase(), name: name + suffix, size, curriculumId, year, schoolDays: days, homeRoomId: null, subjectTeachers: {}, notes: '', _g: k });
      }
      // Stammzimmer verteilen: Klassen mit gleichen Schultagen dürfen nicht dasselbe Zimmer haben
      const used = {}; // roomId → Set(days)
      for (const k of classes) {
        const r = stdRooms.find((rm) => rm.capacity >= k.size && !(used[rm.id] || []).some((d) => k.schoolDays.includes(d)));
        if (r) { k.homeRoomId = r.id; used[r.id] = [...(used[r.id] || []), ...k.schoolDays]; }
      }
      // Klassenlehrpersonen, Stellvertretung, ABU: qualifizierte Lehrpersonen zuweisen und deren Fach fix zuteilen
      const load = {}; teachers.forEach((t) => (load[t.id] = 0));
      const pick = (subjectId, days, exclude = [], g = 0) => {
        const cands = teachers.filter((t) => t._g === g && t.subjectIds.includes(subjectId) && !exclude.includes(t.id) && days.every((d) => (t.availability[d] || []).some(Boolean)));
        if (!cands.length) return null;
        cands.sort((a, b) => load[a.id] / a.maxLessons - load[b.id] / b.maxLessons + (rng() - 0.5) * 0.05);
        return cands[0];
      };
      for (const k of classes) {
        const cur = st.curricula.find((c) => c.id === k.curriculumId);
        const mainSubject = cur.subjects.find((s) => ['s_wg', 's_hkb_c', 's_bk', 's_bkv', 's_frw', 's_abu'].includes(s.subjectId) && s.lessons[k.year] > 0) || cur.subjects[0];
        const klp = pick(mainSubject.subjectId, k.schoolDays, [], k._g);
        if (klp) { k.mainTeacherId = klp.id; k.subjectTeachers[mainSubject.subjectId] = klp.id; load[klp.id] += mainSubject.lessons[k.year]; }
        const abu = cur.subjects.find((s) => s.subjectId === 's_abu' && s.lessons[k.year] > 0);
        if (abu) { const t = pick('s_abu', k.schoolDays, [klp?.id], k._g); if (t) { k.abuTeacherId = t.id; k.subjectTeachers['s_abu'] = t.id; load[t.id] += abu.lessons[k.year]; } }
        const dep = pick(cur.subjects[1]?.subjectId || mainSubject.subjectId, k.schoolDays, [klp?.id], k._g);
        if (dep) k.deputyTeacherId = dep.id;
        // Weitere Fächer: etwa zwei Drittel fix zuweisen, der Rest bleibt für die automatische Zuweisung
        for (const s of cur.subjects) {
          if (k.subjectTeachers[s.subjectId] || !(s.lessons[k.year] > 0)) continue;
          if (rng() < 0.65) { const t = pick(s.subjectId, k.schoolDays, [], k._g); if (t) { k.subjectTeachers[s.subjectId] = t.id; load[t.id] += s.lessons[k.year]; } }
        }
      }
      st.classes = classes;
      for (const t of teachers) delete t._g; for (const k of classes) delete k._g;
      // Buchungen / Events (Hauswart)
      const monday = SW.startOfWeek(SW.isoDate());
      st.bookings = [
        { ...M.newBooking(), id: 'b_1', title: 'Informationsabend Berufsmaturität', roomId: 'r_aula', date: SW.addDays(monday, 2), from: '18:30', to: '20:30', kind: 'event', attendees: 180, assignee: 'Hauswart', status: 'bestätigt', notes: 'Bestuhlung Reihen, Mikrofon, Beamer' },
        { ...M.newBooking(), id: 'b_2', title: 'Lehrpersonenkonferenz', roomId: 'r_aula', date: SW.addDays(monday, 4), from: '13:30', to: '16:30', kind: 'sitzung', attendees: 90, assignee: 'Schulleitung', status: 'bestätigt', notes: '' },
        { ...M.newBooking(), id: 'b_3', title: 'Diplomfeier Detailhandel', roomId: 'r_aula', date: SW.addDays(monday, 11), from: '17:00', to: '22:00', kind: 'event', attendees: 220, assignee: 'Hauswart', status: 'offen', notes: 'Apéro in der Mensa, Bühnentechnik' },
        { ...M.newBooking(), id: 'b_4', title: 'Vermietung: Vereinsversammlung', roomId: 'r_grossraum401', date: SW.addDays(monday, 8), from: '19:00', to: '21:30', kind: 'extern', attendees: 45, assignee: 'Hauswart', status: 'bestätigt', notes: 'Rechnung an Verein' },
        { ...M.newBooking(), id: 'b_5', title: 'Beamer-Wartung Zimmer 101–106', roomId: 'r_zimmer101', date: SW.addDays(monday, 5), from: '07:00', to: '12:00', kind: 'unterhalt', assignee: 'Technik', status: 'offen', notes: 'Lampenwechsel, Reinigung der Filter' },
      ];
      // Chat
      st.chat.channels = [
        { id: 'ch_all', name: 'Lehrpersonenzimmer', kind: 'schule', icon: '☕', members: 'alle' },
        { id: 'ch_plan', name: 'Stundenplanung', kind: 'schule', icon: '🗓️', members: 'alle' },
        { id: 'ch_wg', name: 'Fachschaft W&G', kind: 'fach', icon: '📘', subjectId: 's_wg' },
        { id: 'ch_spr', name: 'Fachschaft Sprachen', kind: 'fach', icon: '🗣️', subjectId: 's_en' },
        { id: 'ch_sport', name: 'Fachschaft Sport', kind: 'fach', icon: '🏀', subjectId: 's_sp' },
        { id: 'ch_k1a', name: 'Klassenteam K1a', kind: 'klasse', icon: '👥', classId: 'k_k1a' },
        { id: 'ch_m1a', name: 'Klassenteam M1a', kind: 'klasse', icon: '👥', classId: 'k_m1a' },
      ];
      const now = Date.now(); const H = 3600000;
      st.chat.messages = [
        { id: 'm1', channelId: 'ch_all', teacherId: 't_lwe', text: 'Guten Morgen zusammen – der Kaffee im Lehrpersonenzimmer ist wieder frisch. ☕', ts: now - 30 * H },
        { id: 'm2', channelId: 'ch_all', teacherId: 't_sonne', text: 'Erinnerung: Konferenz am Freitag 13:30 in der Aula.', ts: now - 26 * H },
        { id: 'm3', channelId: 'ch_plan', teacherId: 't_adler', text: 'Der neue Planentwurf ist da. Bitte bis Mittwoch die eigene Verfügbarkeit prüfen.', ts: now - 20 * H },
        { id: 'm4', channelId: 'ch_plan', teacherId: 't_kuh', text: 'Bei mir stimmt alles, danke! Könnte Informatik 303 am Donnerstag frei bleiben? Wir bräuchten es für die Prüfung.', ts: now - 19 * H },
        { id: 'm5', channelId: 'ch_plan', teacherId: 't_adler', text: 'Ist notiert – ich buche 303 am Donnerstag 3./4. Lektion für die IKA-Prüfung.', ts: now - 18 * H },
        { id: 'm6', channelId: 'ch_wg', teacherId: 't_frosch', text: 'Hat jemand die aktualisierten Unterlagen zur Mehrwertsteuer? Die Sätze haben geändert.', ts: now - 8 * H },
        { id: 'm7', channelId: 'ch_wg', teacherId: 't_krake', text: 'Ja, lade ich heute Abend in den Teams-Ordner. 8.1 % / 2.6 % / 3.8 %.', ts: now - 7 * H },
        { id: 'm8', channelId: 'ch_k1a', teacherId: 't_lwe', text: 'K1a: Am Donnerstag ist die Klasse im Betriebsbesuch, Lektionen 6–9 fallen aus.', ts: now - 5 * H },
        { id: 'm9', channelId: 'ch_sport', teacherId: 't_pinguin', text: 'Turnhalle 2 hat einen neuen Boden – bitte nur mit Hallenschuhen. 🏀', ts: now - 3 * H },
        { id: 'm10', channelId: 'ch_all', teacherId: 't_panda', text: 'Bonjour! Der Frankreich-Austausch ist bestätigt: 12 Lernende aus Lyon, Woche 38.', ts: now - 1 * H },
      ];
      // Arbeitszeit-Einträge (einige Lehrpersonen, aktuelle Woche)
      const kinds = ['vorbereitung', 'sitzung', 'beratung', 'weiterbildung'];
      st.timeEntries = [];
      for (const t of teachers.slice(0, 12)) for (let d = 0; d < 5; d++) {
        if (rng() < 0.5) continue;
        const from = 7 + rng.int(9); const dur = 1 + rng.int(3);
        st.timeEntries.push({ ...M.newTimeEntry(), id: SW.uid('z'), teacherId: t.id, date: SW.addDays(monday, d), from: `${String(from).padStart(2, '0')}:00`, to: `${String(from + dur).padStart(2, '0')}:00`, kind: kinds[rng.int(kinds.length)], note: '' });
      }
      const todayIso = SW.isoDate(); const absFrom = SW.weekday(todayIso) > 5 ? SW.addDays(monday, 7) : todayIso;
      st.absences = [{ ...M.newAbsence(), id: 'a_1', teacherId: 't_lwe', from: absFrom, to: SW.addDays(absFrom, SW.weekday(absFrom) >= 5 ? 0 : 1), reason: 'krank', note: 'Grippe – Rückkehr voraussichtlich Ende Woche', substitutes: {} }];
      st.notifications = [{ id: 'n_1', ts: now - 2 * H, read: false, icon: '🗓️', text: 'Willkommen! Demo-Daten geladen – Generator starten, um den ersten Plan zu erstellen.', link: '#/generator' }];
      return st;
    },
  };
})();
