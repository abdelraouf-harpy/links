// Order PWA Service Worker — Native App Shell & Offline Engine
const CACHE_NAME = 'order-pwa-v31.1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './admin.html',
  './manifest.json',
  './admin-manifest.json',
  './manifest-saj.json',
  './admin-manifest-saj.json',
  './manifest-king.json',
  './admin-manifest-king.json',
  './icons/saj-logo.png',
  './icons/king-logo.png',
  './pwa_icon.png',
  './admin_pwa_icon.png',
  './admin_icon-192.png',
  './icon-192.png',
  './icon-512.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './favicon.png',
  './css/style.css?v=31.1',
  './js/store.js?v=31.1',
  './js/app.js?v=31.1',
  './js/admin.js?v=31.1',
  './js/pwa.js?v=31.1'
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

const dynamicManifests = {};

// Real-time message listener from client UI for instant update execution
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHES') {
    event.waitUntil(
      caches.keys().then((keys) => {
        return Promise.all(keys.map(k => caches.delete(k)));
      })
    );
  }
  if (event.data && event.data.type === 'SET_DYNAMIC_MANIFEST') {
    const { slug, isAdmin, manifest } = event.data;
    if (slug && manifest) {
      const fileName = isAdmin ? `admin-manifest-${slug}.json` : `manifest-${slug}.json`;
      dynamicManifests[fileName] = manifest;
      const jsonStr = JSON.stringify(manifest);
      const res = new Response(jsonStr, {
        status: 200,
        headers: {
          'Content-Type': 'application/manifest+json; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      caches.open(CACHE_NAME).then(cache => {
        cache.put('./' + fileName, res.clone());
        cache.put('/' + fileName, res);
      });
    }
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Serve dynamic manifest immediately if registered
  try {
    const reqUrl = new URL(event.request.url);
    const fileName = reqUrl.pathname.split('/').pop();
    if (fileName && (fileName.startsWith('manifest-') || fileName.startsWith('admin-manifest-')) && fileName.endsWith('.json')) {
      if (dynamicManifests[fileName]) {
        event.respondWith(
          new Response(JSON.stringify(dynamicManifests[fileName]), {
            status: 200,
            headers: {
              'Content-Type': 'application/manifest+json; charset=utf-8',
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
          })
        );
        return;
      }
    }
  } catch(e) {}
  
  // Network-First strategy: Always fetch latest version from server, fall back to cache if offline or 404 navigation
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return networkResponse;
        }
        // If server returns 404 for an HTML navigation request, fall back to cached shell
        if (networkResponse && networkResponse.status === 404) {
          const accept = event.request.headers.get('accept') || '';
          if (accept.includes('text/html') || event.request.mode === 'navigate') {
            if (event.request.url.includes('/admin')) {
              return caches.match('./admin.html', { ignoreSearch: true }).then(r => r || networkResponse);
            }
            return caches.match('./index.html', { ignoreSearch: true }).then(r => r || networkResponse);
          }
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
            if (event.request.url.includes('/admin')) {
              return caches.match('./admin.html', { ignoreSearch: true });
            }
            return caches.match('./index.html', { ignoreSearch: true });
          }
        });
      })
  );
});
