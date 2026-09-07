// Order PWA Service Worker — Native App Shell & Offline Engine
const CACHE_NAME = 'order-pwa-v34.0';
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
  './css/style.css?v=34.0',
  './js/store.js?v=34.0',
  './js/app.js?v=34.0',
  './js/admin.js?v=34.0',
  './js/pwa.js?v=34.0'
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
        // If server returns 404 or HTML for manifest, synthesize valid tenant manifest
        const reqUrl = new URL(event.request.url);
        const fileName = reqUrl.pathname.split('/').pop();
        if (fileName && (fileName.startsWith('manifest-') || fileName.startsWith('admin-manifest-')) && fileName.endsWith('.json')) {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.headers.get('content-type')?.includes('text/html')) {
            const isAdm = fileName.startsWith('admin-manifest-');
            const mSlug = isAdm ? fileName.replace('admin-manifest-', '').replace('.json', '') : fileName.replace('manifest-', '').replace('.json', '');
            const iconUrl = dynamicManifests[fileName]?.icons?.[0]?.src || (mSlug === 'saj' ? 'https://iili.io/n3HWDDG.jpg' : 'https://iili.io/n3HVHX4.jpg');
            const synthesized = dynamicManifests[fileName] || {
              id: `harpy-${isAdm ? 'admin' : 'menu'}-${mSlug}-v32`,
              name: isAdm ? `إدارة ${mSlug}` : mSlug,
              short_name: isAdm ? `إدارة ${mSlug}` : mSlug,
              description: isAdm ? `إدارة ${mSlug} - لوحة التحكم والطلبات` : `${mSlug} - منيو ذكي وطلب مباشر`,
              start_url: isAdm ? `./admin.html?m=${mSlug}` : `./index.html?m=${mSlug}`,
              scope: isAdm ? `./admin.html` : `./`,
              display: 'standalone',
              background_color: '#120e0c',
              theme_color: '#ea580c',
              orientation: 'portrait',
              icons: [
                { src: iconUrl, sizes: '512x512', type: 'image/jpeg', purpose: 'any' },
                { src: iconUrl, sizes: '192x192', type: 'image/jpeg', purpose: 'any' },
                { src: iconUrl, sizes: '512x512', type: 'image/jpeg', purpose: 'maskable' }
              ]
            };
            return new Response(JSON.stringify(synthesized), {
              status: 200,
              headers: {
                'Content-Type': 'application/manifest+json; charset=utf-8',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
              }
            });
          }
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
