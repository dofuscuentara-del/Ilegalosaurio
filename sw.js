const CACHE_NAME = 'Ilegalosaurios-v1';

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/panel_empleado.html',
  '/panel_admin.html',
  '/index.css',
  '/panel_empleado.css',
  '/panel_admin.css',
  '/index.js',
  '/panel_empleado.js',
  '/panel_admin.js',
  '/manifest.json'
];

/* =====================
   INSTALL
===================== */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

/* =====================
   ACTIVATE
===================== */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

/* =====================
   FETCH
===================== */
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
