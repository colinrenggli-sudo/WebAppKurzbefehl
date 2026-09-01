/* ==================================================================
   99 · Start
   Reihenfolge: Daten laden, Sitzung wiederherstellen, Oberflaeche
   zeichnen, Links mit Token auswerten, Sync starten, Automationen
   einmal laufen lassen.
   ================================================================== */
(function () {
  'use strict';

  // Farbschema: gespeicherte Wahl gewinnt, sonst System
  const th = localStorage.getItem('badwerk.thema');
  if (th === 'light' || th === 'dark') document.documentElement.dataset.theme = th;

  Store.laden();
  S.laden();

  // Anmeldung
  $('#keypad').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) Login.tippen(b.dataset.k); });
  $('#lgUsers').addEventListener('click', e => { const b = e.target.closest('[data-code]'); if (b) { S.code = b.dataset.code; Login.pruefen(); } });
  document.addEventListener('keydown', e => {
    if (S.shell !== 'none' || $('#login').classList.contains('hide')) return;
    if (/^[0-9]$/.test(e.key)) Login.tippen(e.key);
    else if (e.key === 'Backspace') Login.tippen('back');
    else if (e.key === 'Escape') Login.tippen('clear');
  });
  Login.zeichnen();

  // Links mit Token (Portale, QR-Scan) – vor der Sitzung, weil sie diese uebersteuern
  const p = new URLSearchParams(location.search);
  if (typeof Portal !== 'undefined' && Portal.ausUrl(p)) return;

  // Sitzung
  if (S.benutzerId && Q.benutzer(S.benutzerId)) {
    const b = Q.benutzer(S.benutzerId);
    S.shell = S.shellFuer(b);
    document.body.dataset.shell = S.shell;
    $('#login').classList.add('hide');
    Nav.zeichnen();
  } else {
    S.benutzerId = null; S.shell = 'none';
    document.body.dataset.shell = 'none';
  }

  // Sync und Automationen
  Sync.start();
  if (typeof Auto !== 'undefined') { Auto.laufen('start'); setInterval(() => Auto.laufen('takt'), 60000); }

  // Service Worker nur ueber http(s), nicht ab Datei
  if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').catch(() => { });
  }
})();
