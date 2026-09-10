// Focus – Service Worker
// Aufgaben: (1) Benachrichtigungen anzeigen und die App beim Antippen nach vorne
// holen (auch als installierte PWA auf iOS), (2) die App offline verfügbar halten.
//
// Strategie:
//  · index.html / manifest: Netz zuerst, Cache als Rückfallebene – neue Versionen
//    kommen sofort an, offline startet trotzdem die letzte bekannte Version.
//  · Icons: Cache zuerst (ändern sich praktisch nie).
//  · /api/: nie zwischenspeichern – Abgleich und Erinnerungen müssen ans Netz.
// Die Versionsnummer unten bei jeder Änderung an index.html hochzählen,
// damit alte Caches sicher weggeräumt werden.

const VERSION = 'focus-v4.1.0';
const SHELL = ['./', './index.html', './manifest.json', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(SHELL)).catch(() => {}).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      // Nur eigene Caches aufräumen – die Schwester-Apps (DACHWERK, SCHLAFWERK) teilen sich denselben Origin
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('focus-') && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Abgleich und Erinnerungen laufen über /api/ und dürfen nie aus dem Cache
  // kommen – ein alter Stand von dort wäre schlimmer als gar keine Antwort.
  if (url.pathname.startsWith('/api/')) return;

  // App-Hülle: Netz zuerst, dann Cache
  // Nur die eigene Ebene bedienen – die Schwester-Apps (dach/, schlaf/, shop/, raumdesign/)
  // liegen auf demselben Origin und dürfen nicht HIGHs index.html als Offline-Fallback bekommen.
  const base = new URL('./', self.location).pathname;
  const own = url.pathname.startsWith(base) && !/^[^?#]*\/(dach|schlaf|shop|raumdesign)\//.test(url.pathname);
  if (url.origin === self.location.origin && own) {
    const isShell = req.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/manifest.json');
    if (isShell) {
      event.respondWith(
        fetch(req).then((res) => {
          if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)).catch(() => {}); }
          return res;
        }).catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
      );
      return;
    }
    if (/\.(png|svg|ico)$/.test(url.pathname)) {
      event.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => { if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)).catch(() => {}); } return res; })));
      return;
    }
    return;
  }

  // Alles Fremde geht unangetastet ans Netz: die App lädt nichts von aussen.
});

self.addEventListener('push', (event) => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) { d = { body: event.data ? event.data.text() : '' }; }
  const titel = d.title || 'HIGH';
  const opts = {
    body: d.body || 'Zeit für deine Routinen.',
    icon: './icon-192.png',
    badge: './icon-192.png',
    tag: d.tag || 'high',
    renotify: true,
  };
  // Ohne showNotification entzieht iOS der App die Erlaubnis – darum immer etwas zeigen.
  event.waitUntil(self.registration.showNotification(titel, opts));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Nur ein Fenster dieser App nach vorne holen, nicht eine Schwester-App auf demselben Origin
      const scope = self.registration.scope;
      for (const client of clients) {
        if (client.url.startsWith(scope) && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});
