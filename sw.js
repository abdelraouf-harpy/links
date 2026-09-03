// HarpyOrder Service Worker — Dynamic Fast-Update & Offline Engine
const CACHE_NAME = 'harpy-order-v9.7';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/admin.html',
  '/css/style.css?v=9.0',
  '/js/store.js?v=9.7',
  '/js/app.js?v=9.7',
  '/js/admin.js?v=9.7',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  // Network-First strategy: Always fetch latest version from server, fall back to cache only if offline
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
            if (event.request.url.includes('/admin')) {
              return caches.match('/admin.html', { ignoreSearch: true }) || caches.match('./admin.html', { ignoreSearch: true });
            }
            return caches.match('/index.html', { ignoreSearch: true }) || caches.match('./index.html', { ignoreSearch: true });
          }
        });
      })
  );
});
