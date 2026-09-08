// Order PWA Service Worker — Native App Shell & Offline Engine
const CACHE_NAME = 'order-pwa-v38.0';
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
  './manifest-sloo.json',
  './admin-manifest-sloo.json',
  './css/style.css?v=38.0',
  './js/store.js?v=38.0',
  './js/app.js?v=38.0',
  './js/admin.js?v=38.0',
  './js/pwa.js?v=38.0'
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

  const reqUrl = new URL(event.request.url);
  const fileName = reqUrl.pathname.split('/').pop();
  const isManifestReq = fileName && (fileName.startsWith('manifest-') || fileName.startsWith('admin-manifest-')) && fileName.endsWith('.json');

  // Dedicated Tenant Manifest Interceptor: Guarantees 100% authentic JSON even for brand-new restaurants
  if (isManifestReq) {
    event.respondWith(
      (async () => {
        // 1. In-memory dynamic manifests
        if (dynamicManifests[fileName]) {
          return new Response(JSON.stringify(dynamicManifests[fileName]), {
            status: 200,
            headers: {
              'Content-Type': 'application/manifest+json; charset=utf-8',
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
          });
        }

        // 2. Try network fetch first
        try {
          const networkRes = await fetch(event.request);
          const contentType = networkRes.headers.get('content-type') || '';
          // Only accept if HTTP 200 AND NOT html fallback from hosting
          if (networkRes.ok && !contentType.includes('text/html')) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
            return networkRes;
          }
        } catch (netErr) {}

        // 3. Check Cache
        const cachedRes = await caches.match(event.request);
        if (cachedRes) {
          const cachedType = cachedRes.headers.get('content-type') || '';
          if (!cachedType.includes('text/html')) {
            return cachedRes;
          }
        }

        // 4. Synthesize valid tenant manifest dynamically for ANY tenant
        const isAdm = fileName.startsWith('admin-manifest-');
        const mSlug = isAdm 
          ? fileName.replace('admin-manifest-', '').replace('.json', '') 
          : fileName.replace('manifest-', '').replace('.json', '');

        const iconUrl = isAdm ? 'https://iili.io/n3rYXyu.png' : 'https://iili.io/n3HVHX4.jpg';
        const iconType = isAdm ? 'image/png' : 'image/jpeg';
        const finalName = isAdm ? 'إدارة المطعم' : 'منيو المطعم';
        const finalShortName = isAdm ? 'الإدارة' : 'المنيو';

        const synthesized = {
          id: `harpy-${isAdm ? 'admin' : 'menu'}-${mSlug}-v38`,
          name: finalName,
          short_name: finalShortName,
          description: isAdm ? `إدارة المطعم - لوحة التحكم والطلبات` : `منيو المطعم - منيو ذكي وطلب مباشر`,
          start_url: isAdm ? `./admin.html?m=${mSlug}` : `./index.html?m=${mSlug}`,
          scope: isAdm ? `./admin.html` : `./`,
          display: 'standalone',
          background_color: '#120e0c',
          theme_color: '#ea580c',
          orientation: 'portrait',
          icons: [
            { src: iconUrl, sizes: '512x512', type: iconType, purpose: 'any' },
            { src: iconUrl, sizes: '192x192', type: iconType, purpose: 'any' },
            { src: iconUrl, sizes: '512x512', type: iconType, purpose: 'maskable' }
          ]
        };

        const finalResponse = new Response(JSON.stringify(synthesized), {
          status: 200,
          headers: {
            'Content-Type': 'application/manifest+json; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        });

        caches.open(CACHE_NAME).then(c => c.put(event.request, finalResponse.clone()));
        return finalResponse;
      })()
    );
    return;
  }

  // General Network-First strategy for all other assets
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
