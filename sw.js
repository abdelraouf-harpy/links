// Order PWA Service Worker — Native App Shell & Offline Engine
const CACHE_NAME = 'order-pwa-v40.4';
const IMAGE_CACHE_NAME = 'order-images-v1';
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
  './css/style.css?v=40.4',
  './js/store.js?v=40.4',
  './js/app.js?v=40.4',
  './js/admin.js?v=40.4',
  './js/pwa.js?v=40.4'
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
          // Preserve current app cache and dedicated image cache
          if (key !== CACHE_NAME && key !== IMAGE_CACHE_NAME) {
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
  if (event.data && event.data.type === 'PURGE_IMAGE_URL' && event.data.url) {
    caches.open(IMAGE_CACHE_NAME).then(c => c.delete(event.data.url));
  }
  if (event.data && event.data.type === 'PURGE_ALL_IMAGES') {
    caches.delete(IMAGE_CACHE_NAME);
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

        let storeName = mSlug;
        try {
          const rtdbRes = await fetch(`https://harpy-order-default-rtdb.firebaseio.com/restaurants/${mSlug}/settings.json`, { cache: 'no-store' });
          if (rtdbRes.ok) {
            const settings = await rtdbRes.json();
            if (settings) {
              storeName = (settings.storeName || settings.name || mSlug).trim();
            }
          }
        } catch (e) {}

        const finalName = isAdm ? 'Admin' : 'Order';
        const finalShortName = isAdm ? 'Admin' : 'Order';
        const iconUrl = isAdm ? 'https://iili.io/n3rYXyu.png' : 'https://iili.io/n3HVHX4.jpg';
        const iconType = isAdm ? 'image/png' : 'image/jpeg';

        const synthesized = {
          id: `harpy-${isAdm ? 'admin' : 'order'}-${mSlug}-v38`,
          name: finalName,
          short_name: finalShortName,
          description: isAdm ? `Order Admin — Dashboard & Kitchen` : `Order — Smart Digital Menu`,
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

  // Dedicated Stale-While-Revalidate Image Caching (Instant 0ms display with background revalidation & opaque support)
  const isImageReq = event.request.destination === 'image' || 
    /\.(png|jpg|jpeg|webp|svg|gif|avif)(\?.*)?$/i.test(reqUrl.pathname) || 
    reqUrl.hostname.includes('iili.io') ||
    reqUrl.pathname.includes('/images/');

  if (isImageReq) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(async (imgCache) => {
        const cachedRes = await imgCache.match(event.request);

        // Fetch in parallel for background refresh
        const fetchPromise = fetch(event.request).then((networkRes) => {
          // Cache both standard 200 responses and opaque (status 0) cross-origin responses from image hosts
          if (networkRes && (networkRes.status === 200 || networkRes.type === 'opaque')) {
            imgCache.put(event.request, networkRes.clone()).catch(() => {});
          }
          return networkRes;
        }).catch(() => null);

        // If in cache, return immediately for 0ms instant display!
        if (cachedRes) {
          return cachedRes;
        }

        // If not in cache yet, await network response
        const netRes = await fetchPromise;
        if (netRes) return netRes;
        return cachedRes || new Response('', { status: 404 });
      })
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
