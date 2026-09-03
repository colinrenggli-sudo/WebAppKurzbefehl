/* Service Worker: macht STUNDENWERK offline lauffähig (Netz zuerst, sonst Cache). */
const CACHE = 'stundenwerk-v1';
const FILES = ['./', './index.html', './manifest.json', './icon.svg', './css/app.css',
  './js/util.js', './js/model.js', './js/store.js', './js/domain.js', './js/solver.js', './js/seed.js', './js/ui.js', './js/router.js', './js/app.js',
  './js/views/dashboard.js', './js/views/rooms.js', './js/views/subjects.js', './js/views/curricula.js', './js/views/teachers.js', './js/views/classes.js',
  './js/views/generator.js', './js/views/timetable.js', './js/views/portal.js', './js/views/calendar.js', './js/views/chat.js', './js/views/facility.js',
  './js/views/substitutes.js', './js/views/analytics.js', './js/views/settings.js'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((n) => n !== CACHE).map((n) => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then((a) => { const k = a.clone(); caches.open(CACHE).then((c) => c.put(e.request, k)); return a; }).catch(() => caches.match(e.request).then((a) => a || caches.match('./index.html'))));
});
