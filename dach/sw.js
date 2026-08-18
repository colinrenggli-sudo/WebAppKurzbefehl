/* Service Worker: macht DACHWERK offline lauffähig.
   Die App ist eine einzige Datei – gecacht wird genau diese, plus
   Manifest und Symbol. Kartenkacheln kommen aus dem Netz und werden
   nur so lange behalten, wie der Browser sie behalten mag. */
const CACHE = 'dachwerk-v1';
const DATEIEN = ['./', './index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(DATEIEN)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;

  // Karten und Schnittstellen nie aus dem Cache beantworten
  if (url.origin !== location.origin) {
    e.respondWith(fetch(e.request).catch(() => new Response('', { status: 504 })));
    return;
  }
  // Eigene Dateien: zuerst Netz, sonst Cache — so bleibt die App aktuell und offline nutzbar
  e.respondWith(
    fetch(e.request)
      .then(a => { const k = a.clone(); caches.open(CACHE).then(c => c.put(e.request, k)); return a; })
      .catch(() => caches.match(e.request).then(a => a || caches.match('./index.html')))
  );
});
