/* STUNDENWERK · model.js — Konstanten, Standardwerte, Schema.
   Kein Code mit Seiteneffekten; nur Daten, die überall gebraucht werden. */
(function () {
  const SW = (globalThis.SW = globalThis.SW || {});
  const M = (SW.model = {});

  M.APP = { name: 'STUNDENWERK', version: '1.0.0', storageKey: 'stundenwerk.v1', proPrice: 500 };

  // Wochentage (1 = Montag … 7 = Sonntag). Geplant wird Mo–Fr, Sa/So nur für Events.
  M.DAYS = [
    { n: 1, short: 'Mo', name: 'Montag' }, { n: 2, short: 'Di', name: 'Dienstag' }, { n: 3, short: 'Mi', name: 'Mittwoch' },
    { n: 4, short: 'Do', name: 'Donnerstag' }, { n: 5, short: 'Fr', name: 'Freitag' }, { n: 6, short: 'Sa', name: 'Samstag' }, { n: 7, short: 'So', name: 'Sonntag' },
  ];
  M.dayName = (n, short) => { const d = M.DAYS.find((x) => x.n === Number(n)); return d ? (short ? d.short : d.name) : '?'; };

  // Stundenraster nach Luzerner Berufsfachschulen: 45-Minuten-Lektionen 07:30–16:15, Pause nach der 2., Mittag 11:45–13:00.
  // "lunchAfter": nach dieser Lektion ist Mittag (Doppellektionen dürfen nicht darüber hinweg).
  M.DEFAULT_SLOTS = [
    { n: 1, start: '07:30', end: '08:15' }, { n: 2, start: '08:20', end: '09:05' },
    { n: 3, start: '09:20', end: '10:05' }, { n: 4, start: '10:10', end: '10:55' }, { n: 5, start: '11:00', end: '11:45' },
    { n: 6, start: '13:00', end: '13:45' }, { n: 7, start: '13:50', end: '14:35' },
    { n: 8, start: '14:40', end: '15:25' }, { n: 9, start: '15:30', end: '16:15' },
  ];
  M.DEFAULT_LUNCH_AFTER = 5;

  // Raumtypen. "teachable": kann für Unterricht verplant werden.
  M.ROOM_TYPES = [
    { id: 'klassenzimmer', name: 'Schulzimmer', icon: '🏫', teachable: true, cap: 24, desc: 'Normales Klassenzimmer mit Wandtafel und Beamer' },
    { id: 'informatik', name: 'Informatikzimmer', icon: '💻', teachable: true, cap: 24, desc: 'PC-Arbeitsplätze für IKA, Informatik' },
    { id: 'display', name: 'Raum mit Display', icon: '🖥️', teachable: true, cap: 24, desc: 'Interaktives Display / Smartboard' },
    { id: 'grossraum', name: 'Grossraum', icon: '🏛️', teachable: true, cap: 60, desc: 'Zwei Klassen, Prüfungen, Vorträge' },
    { id: 'aula', name: 'Aula', icon: '🎭', teachable: true, cap: 200, desc: 'Veranstaltungen, Informationsanlässe, Abschlussfeiern' },
    { id: 'turnhalle', name: 'Turnhalle', icon: '🏀', teachable: true, cap: 30, desc: 'Sportunterricht' },
    { id: 'labor', name: 'Labor / Atelier', icon: '🧪', teachable: true, cap: 20, desc: 'Naturwissenschaften, Gestaltung' },
    { id: 'aussen', name: 'Aussenanlage', icon: '🌳', teachable: true, cap: 40, desc: 'Sportplatz, Pausenhof' },
    { id: 'besprechung', name: 'Besprechungszimmer', icon: '🗣️', teachable: false, cap: 10, desc: 'Sitzungen, Elterngespräche' },
    { id: 'lehrerzimmer', name: 'Lehrpersonenzimmer', icon: '☕', teachable: false, cap: 40, desc: 'Arbeits- und Aufenthaltsraum' },
    { id: 'bibliothek', name: 'Mediothek', icon: '📚', teachable: false, cap: 40, desc: 'Selbstlernzone' },
    { id: 'mensa', name: 'Mensa', icon: '🍽️', teachable: false, cap: 150, desc: 'Verpflegung, Apéros' },
    { id: 'lager', name: 'Lager / Technik', icon: '📦', teachable: false, cap: 0, desc: 'Material, Technik, Hauswartung' },
  ];
  M.roomType = (id) => M.ROOM_TYPES.find((t) => t.id === id) || M.ROOM_TYPES[0];

  M.ROOM_FEATURES = [
    { id: 'beamer', name: 'Beamer' }, { id: 'display', name: 'Interaktives Display' }, { id: 'pc', name: 'PC-Arbeitsplätze' },
    { id: 'whiteboard', name: 'Whiteboard' }, { id: 'wandtafel', name: 'Wandtafel' }, { id: 'lautsprecher', name: 'Tonanlage' },
    { id: 'verdunkelung', name: 'Verdunkelung' }, { id: 'klima', name: 'Klimaanlage' }, { id: 'barrierefrei', name: 'Barrierefrei' },
    { id: 'gruppenraum', name: 'Gruppenraum nebenan' }, { id: 'buehne', name: 'Bühne' }, { id: 'kueche', name: 'Küche' },
  ];

  // Welche Raumtypen für welches Fach in Frage kommen: "any" = jeder unterrichtbare Standardraum.
  M.ROOM_REQ = [
    { id: 'any', name: 'Beliebiges Schulzimmer', types: ['klassenzimmer', 'display', 'informatik', 'grossraum'] },
    { id: 'klassenzimmer', name: 'Schulzimmer', types: ['klassenzimmer', 'display', 'grossraum'] },
    { id: 'informatik', name: 'Informatikzimmer', types: ['informatik'] },
    { id: 'display', name: 'Raum mit Display', types: ['display'] },
    { id: 'turnhalle', name: 'Turnhalle', types: ['turnhalle', 'aussen'] },
    { id: 'grossraum', name: 'Grossraum / Aula', types: ['grossraum', 'aula'] },
    { id: 'labor', name: 'Labor / Atelier', types: ['labor'] },
  ];
  M.roomReq = (id) => M.ROOM_REQ.find((r) => r.id === id) || M.ROOM_REQ[0];

  // Farbpalette für Fächer (hell/dunkel gleich gut lesbar als Balken/Rand)
  M.COLORS = ['#3B5BDB', '#0E9F6E', '#D97706', '#DC2626', '#7C3AED', '#0891B2', '#DB2777', '#65A30D', '#EA580C', '#4F46E5', '#0D9488', '#9333EA', '#B45309', '#2563EB', '#16A34A', '#C026D3'];

  // Emojis für Lehrpersonen: keine Gesichter, damit kein Bezug zu Geschlecht oder Herkunft entsteht.
  M.EMOJI_GROUPS = [
    { name: 'Tiere', list: ['🦁', '🐸', '🐷', '🐼', '🦊', '🐨', '🐯', '🐮', '🐵', '🐔', '🐧', '🐦', '🦆', '🦉', '🦅', '🐺', '🐗', '🐴', '🦄', '🐝', '🦋', '🐌', '🐞', '🐢', '🐍', '🦎', '🐙', '🦀', '🐬', '🐳', '🐠', '🦈', '🐊', '🐘', '🦒', '🦓', '🦘', '🐪', '🦥', '🦦', '🦔', '🐿️', '🦫', '🐇', '🐈', '🐕', '🦜', '🦩', '🦚', '🦢'] },
    { name: 'Natur', list: ['☀️', '🌙', '⭐', '🌈', '⚡', '❄️', '🔥', '🌊', '🌋', '🏔️', '🌵', '🌲', '🌴', '🍀', '🌻', '🌹', '🌷', '🌸', '🍁', '🍄', '🌰', '🐚', '🪐', '☄️', '🌍'] },
    { name: 'Essen', list: ['🍎', '🍐', '🍊', '🍋', '🍉', '🍇', '🍓', '🍒', '🥝', '🍍', '🥑', '🥕', '🌽', '🥐', '🧀', '🍕', '🍔', '🍩', '🍪', '🍫', '🍦', '☕', '🧁', '🥨', '🍯'] },
    { name: 'Objekte', list: ['🎸', '🎹', '🎺', '🎻', '🥁', '🎨', '🎭', '🎬', '📚', '✏️', '🔬', '🔭', '🧭', '⏰', '💡', '🔑', '🎈', '🎁', '🧩', '🎲', '🚀', '⚓', '🛸', '🎯', '🪁'] },
    { name: 'Sport', list: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥊', '⛳', '⛸️', '🎿', '🛹', '🚴', '🏊', '🧗', '🏄', '🏹'] },
  ];
  M.EMOJIS = M.EMOJI_GROUPS.flatMap((g) => g.list);

  // Rollen einer Lehrperson in einer Klasse
  M.TEACHER_ROLES = [
    { id: 'klassenlehrperson', name: 'Klassenlehrperson', short: 'KLP' },
    { id: 'stellvertretung', name: 'Stellvertretung', short: 'StV' },
    { id: 'abu', name: 'ABU-Lehrperson', short: 'ABU' },
    { id: 'fachlehrperson', name: 'Fachlehrperson', short: 'FLP' },
  ];

  // Gewichte der weichen Kriterien des Generators (höher = wichtiger)
  M.DEFAULT_WEIGHTS = {
    classGap: 12,        // Freistunde einer Klasse (zwischen erster und letzter Lektion des Tages)
    teacherGap: 3,       // Freistunde einer Lehrperson
    subjectSameDay: 5,   // gleiches Fach mehrmals am selben Tag (ausser Doppellektion)
    dayBalance: 2,       // ungleiche Verteilung der Lektionen auf die Schultage einer Klasse
    lateSlot: 1.5,       // Lektion in der letzten Lektion des Tages
    earlyStart: 0,       // Lektion in der ersten Lektion (0 = egal)
    roomChange: 1,       // Raumwechsel der Klasse innerhalb des Tages
    homeRoom: 0.7,       // Klasse nicht im Stammzimmer
    teacherPrefDay: 2,   // Lektion an einem nicht bevorzugten Tag der Lehrperson
    teacherSingleLesson: 4, // Lehrperson kommt für nur eine Lektion an einem Tag
    lateStart: 0.5,      // Klasse beginnt erst nach der 2. Lektion
    sportAfterLunch: 0.5,// Sport direkt nach dem Mittag
  };
  M.WEIGHT_LABELS = {
    classGap: 'Freistunden Klassen vermeiden', teacherGap: 'Freistunden Lehrpersonen vermeiden', subjectSameDay: 'Fach über die Woche verteilen',
    dayBalance: 'Schultage gleichmässig füllen', lateSlot: 'Letzte Lektion des Tages meiden', earlyStart: 'Erste Lektion des Tages meiden',
    roomChange: 'Raumwechsel vermeiden', homeRoom: 'Stammzimmer bevorzugen', teacherPrefDay: 'Wunschtage der Lehrpersonen', teacherSingleLesson: 'Einzelne Lektion pro Tag für Lehrperson vermeiden',
    lateStart: 'Später Unterrichtsbeginn vermeiden', sportAfterLunch: 'Sport nicht direkt nach dem Mittag',
  };

  M.QUALITY = [
    { id: 'schnell', name: 'Schnell', ms: 2500, desc: 'ca. 3 Sekunden' },
    { id: 'normal', name: 'Ausgewogen', ms: 8000, desc: 'ca. 8 Sekunden' },
    { id: 'gruendlich', name: 'Gründlich', ms: 20000, desc: 'ca. 20 Sekunden' },
  ];

  // Bezahlfunktionen (in der Demo hinter einer simulierten Paywall)
  M.PRO_FEATURES = [
    { id: 'calendar', name: 'Kalender & Arbeitszeit', icon: '🗓️', desc: 'Persönlicher Kalender jeder Lehrperson, Soll/Ist-Pensum, Mehrarbeit und Export.' },
    { id: 'chat', name: 'Team-Chat', icon: '💬', desc: 'Kanäle pro Klasse, Fachschaft und Schule. Direktnachrichten, ohne Personendaten.' },
    { id: 'facility', name: 'Hauswart & Events', icon: '🧹', desc: 'Raumbuchungen für Anlässe, automatische Reinigungs- und Aufbauaufträge aus der Belegung.' },
    { id: 'substitutes', name: 'Stellvertretungen', icon: '🔁', desc: 'Absenz erfassen, freie und qualifizierte Lehrpersonen für jede Lektion finden.' },
    { id: 'analytics', name: 'Auswertungen', icon: '📊', desc: 'Raumauslastung, Pensenverteilung, Freistunden-Statistik, Vergleich von Planvarianten.' },
  ];
  M.proFeature = (id) => M.PRO_FEATURES.find((f) => f.id === id);

  M.BOOKING_KINDS = [
    { id: 'event', name: 'Anlass', icon: '🎉' }, { id: 'reinigung', name: 'Reinigung', icon: '🧹' }, { id: 'aufbau', name: 'Auf-/Abbau', icon: '🔧' },
    { id: 'unterhalt', name: 'Unterhalt', icon: '🛠️' }, { id: 'pruefung', name: 'Prüfung', icon: '📝' }, { id: 'sitzung', name: 'Sitzung', icon: '🗣️' }, { id: 'extern', name: 'Externe Vermietung', icon: '🏢' },
  ];
  M.TIME_KINDS = [
    { id: 'unterricht', name: 'Unterricht', icon: '📘' }, { id: 'vorbereitung', name: 'Vor-/Nachbereitung', icon: '📝' }, { id: 'sitzung', name: 'Sitzung / Konferenz', icon: '🗣️' },
    { id: 'weiterbildung', name: 'Weiterbildung', icon: '🎓' }, { id: 'beratung', name: 'Beratung / Elterngespräch', icon: '🤝' }, { id: 'anlass', name: 'Schulanlass', icon: '🎉' }, { id: 'sonstiges', name: 'Sonstiges', icon: '📌' },
  ];
  M.ABSENCE_REASONS = [
    { id: 'krank', name: 'Krankheit' }, { id: 'weiterbildung', name: 'Weiterbildung' }, { id: 'militaer', name: 'Militär / Zivildienst' }, { id: 'urlaub', name: 'Urlaub' }, { id: 'sonstiges', name: 'Sonstiges' },
  ];

  // Leerer Zustand: so sieht der Speicher aus, bevor Daten erfasst werden.
  M.emptyState = () => ({
    version: 1,
    settings: {
      schoolName: 'KV Luzern Berufsfachschule', schoolYear: '2026/27', semesterStart: '2026-08-17',
      days: [1, 2, 3, 4, 5], slots: SW.clone(M.DEFAULT_SLOTS), lunchAfter: M.DEFAULT_LUNCH_AFTER,
      theme: 'auto', role: 'admin', currentTeacherId: null, proUnlocked: false, onboarded: false,
      weights: { ...M.DEFAULT_WEIGHTS }, quality: 'normal', seed: 42, lessonMinutes: 45,
      annualHoursFull: 1900, lessonsFull: 25, // Jahresarbeitszeit bei 100 % / Vollpensum in Lektionen
    },
    rooms: [], subjects: [], curricula: [], teachers: [], classes: [],
    timetable: null, variants: [],
    bookings: [], timeEntries: [], absences: [],
    chat: { channels: [], messages: [] },
    notifications: [],
  });

  // Schema-Vorlagen für neue Objekte
  M.newRoom = () => ({ id: SW.uid('r'), name: '', type: 'klassenzimmer', capacity: 24, building: 'Hauptgebäude', floor: '', features: ['beamer', 'whiteboard'], active: true, notes: '', blocked: {} }); // blocked: {day:[bool×slots]} wöchentliche Sperrzeiten
  M.newSubject = () => ({ id: SW.uid('s'), name: '', short: '', color: M.COLORS[0], roomReq: 'any', block: 1, category: 'allgemein' });
  M.newCurriculum = () => ({ id: SW.uid('c'), name: '', short: '', years: 3, description: '', subjects: [] }); // subjects: [{subjectId, lessons:{1:n,2:n,3:n}, block:1|2}]
  M.newTeacher = () => ({ id: SW.uid('t'), emoji: '🦁', code: '', color: '', subjectIds: [], maxLessons: 24, employment: 100, availability: {}, preferredDays: [], notes: '', active: true, note: '' });
  M.newClass = () => ({ id: SW.uid('k'), name: '', size: 22, curriculumId: null, year: 1, mainTeacherId: null, deputyTeacherId: null, abuTeacherId: null, homeRoomId: null, schoolDays: [], subjectTeachers: {}, extraTeachers: [], extraLessons: [], notes: '' });
  M.newBooking = () => ({ id: SW.uid('b'), title: '', roomId: null, date: SW.isoDate(), from: '18:00', to: '21:00', kind: 'event', assignee: '', notes: '', status: 'offen', attendees: 0, autoTasks: true, teacherId: null });
  M.newTimeEntry = () => ({ id: SW.uid('z'), teacherId: null, date: SW.isoDate(), from: '08:00', to: '09:00', kind: 'vorbereitung', note: '' });
  M.newAbsence = () => ({ id: SW.uid('a'), teacherId: null, from: SW.isoDate(), to: SW.isoDate(), reason: 'krank', note: '', substitutes: {} });
})();
