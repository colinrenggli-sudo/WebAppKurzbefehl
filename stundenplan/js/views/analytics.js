/* STUNDENWERK · views/analytics.js — Auswertungen (Platzhalter, wird ersetzt) */
(function () {
  const SW = (globalThis.SW = globalThis.SW || {});
  SW.views = SW.views || {};
  SW.views['auswertung'] = { title: 'Auswertungen', render(el) { el.append(SW.ui.pageHeader({ title: 'Auswertungen' }), SW.ui.empty({ icon: '🚧', title: 'In Arbeit', text: 'Diese Ansicht wird gerade gebaut.' })); } };
})();
