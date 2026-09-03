/* STUNDENWERK · views/teachers.js — Lehrpersonen (Platzhalter, wird ersetzt) */
(function () {
  const SW = (globalThis.SW = globalThis.SW || {});
  SW.views = SW.views || {};
  SW.views['lehrpersonen'] = { title: 'Lehrpersonen', render(el) { el.append(SW.ui.pageHeader({ title: 'Lehrpersonen' }), SW.ui.empty({ icon: '🚧', title: 'In Arbeit', text: 'Diese Ansicht wird gerade gebaut.' })); } };
})();
