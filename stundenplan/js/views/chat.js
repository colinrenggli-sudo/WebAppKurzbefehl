/* STUNDENWERK · views/chat.js — Team-Chat (Platzhalter, wird ersetzt) */
(function () {
  const SW = (globalThis.SW = globalThis.SW || {});
  SW.views = SW.views || {};
  SW.views['chat'] = { title: 'Team-Chat', render(el) { el.append(SW.ui.pageHeader({ title: 'Team-Chat' }), SW.ui.empty({ icon: '🚧', title: 'In Arbeit', text: 'Diese Ansicht wird gerade gebaut.' })); } };
})();
