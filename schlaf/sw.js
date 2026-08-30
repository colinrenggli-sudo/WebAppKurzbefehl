// SCHLAFWERK – Service Worker
// Zwei Aufgaben: Benachrichtigungen anzeigen (auch als installierte PWA
// auf iOS) und die App beim Antippen wieder nach vorne holen.
// Bewusst kein Caching der App-Dateien: eine neue Version soll sofort
// ankommen, und offline funktioniert die Seite ohnehin ohne Netz.

self.addEventListener('install', () => { self.skipWaiting(); });

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});
