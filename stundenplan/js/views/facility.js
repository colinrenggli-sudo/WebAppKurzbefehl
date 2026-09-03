/* STUNDENWERK · views/facility.js — Hauswart & Events (Platzhalter, wird ersetzt) */
(function () {
  const SW = (globalThis.SW = globalThis.SW || {});
  SW.views = SW.views || {};
  SW.views['hauswart'] = { title: 'Hauswart & Events', render(el) { el.append(SW.ui.pageHeader({ title: 'Hauswart & Events' }), SW.ui.empty({ icon: '🚧', title: 'In Arbeit', text: 'Diese Ansicht wird gerade gebaut.' })); } };
})();
