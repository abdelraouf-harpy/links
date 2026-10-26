// Order PWA Service Worker — Native App Shell & Offline Engine
// OneSignal Web Push SDK Integration
try {
  importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
} catch (e) {
  console.warn("[SW] OneSignal worker import notice:", e);
}

const CACHE_NAME = 'order-pwa-v139.0';
const IMAGE_CACHE_NAME = 'order-images-v6';
const ASSETS_TO_CACHE = [
  './',
  './OneSignalSDKWorker.js',
  './index.html',
  './order.html',
  './portfolio.html',
  './admin.html',
  './admin/',
  './admin/index.html',
  './order/',
  './order/index.html',
  './menu/',
  './menu/index.html',
  './manifest.json',
  './admin-manifest.json',
  './favicon.ico',
  './assets/brand/favicon.png',
  './assets/brand/apple-touch-icon.png',
  './assets/brand/harpy_order_emblem_transparent.png',
  './assets/brand/harpy_order_logo.png',
  './assets/icons/order-icon-512.png',
  './assets/icons/order-icon-192.png',
  './assets/icons/admin-icon-512.png',
  './assets/icons/admin-icon-192.png',
  './assets/portfolio/logo.png',
  './assets/portfolio/facebook_profile_logo.png',
  './assets/portfolio/01_Logo_and_Branding/order_logo_vector.svg',
  './css/order-tokens.css?v=103.0',
  './css/order-client.css?v=103.0',
  './css/order-admin.css?v=103.0',
  './css/portfolio.css?v=2.0',
  './js/core/demo-seed-data.js?v=103.0',
  './js/core/sound-effects.js?v=103.0',
  './js/store.js?v=103.0',
  './js/admin/admin-core.js?v=103.0',
  './js/admin/admin-auth.js?v=103.0',
  './js/admin/kitchen-orders.js?v=103.0',
  './js/admin/inventory-manager.js?v=103.0',
  './js/admin/catalog-manager.js?v=103.0',
  './js/admin/category-manager.js?v=103.0',
  './js/admin/stories-manager.js?v=103.0',
  './js/admin/backup-restore.js?v=103.0',
  './js/admin/settings-manager.js?v=103.0',
  './js/admin/pos-terminal.js?v=103.0',
  './js/admin/admin-push.js?v=119.0',
  './js/client/client-core.js?v=103.0',
  './js/client/menu-view.js?v=103.0',
  './js/client/stories-viewer.js?v=103.0',
  './js/client/customizer-modal.js?v=103.0',
  './js/client/cart-ledger.js?v=103.0',
  './js/client/order-tracking.js?v=103.0',
  './js/app.js?v=103.0',
  './js/admin.js?v=103.0',
  './js/pwa.js?v=103.0'
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

  // Bypass Products POS & Inventory app — let products manage its own SW & caching
  if (reqUrl.pathname.startsWith('/products/') || reqUrl.pathname === '/products') {
    return;
  }

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

        const finalName = isAdm ? `${storeName} | إدارة` : storeName;
        const finalShortName = isAdm ? `إدارة ${storeName}` : storeName;
        const iconUrl = isAdm ? './assets/icons/admin-icon-512.png' : './assets/icons/order-icon-512.png';
        const icon192 = isAdm ? './assets/icons/admin-icon-192.png' : './assets/icons/order-icon-192.png';
        const iconType = 'image/png';

        const synthesized = {
          id: isAdm ? `/admin/?m=${mSlug}` : `/order/?m=${mSlug}`,
          name: finalName,
          short_name: finalShortName,
          description: isAdm ? `Order Admin — Dashboard & Kitchen` : `Order — Smart Digital Menu`,
          start_url: isAdm ? `./admin/?m=${mSlug}` : `./order/?m=${mSlug}`,
          scope: isAdm ? `./admin/` : `./order/`,
          display: 'standalone',
          background_color: '#070B13',
          theme_color: '#FF6A00',
          orientation: 'portrait',
          icons: [
            { src: iconUrl, sizes: '512x512', type: iconType, purpose: 'any' },
            { src: icon192, sizes: '192x192', type: iconType, purpose: 'any' },
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
            const reqUrlLower = event.request.url.toLowerCase();
            if (reqUrlLower.includes('admin')) {
              return caches.match('./admin/index.html', { ignoreSearch: true })
                .then(r => r || caches.match('./admin/', { ignoreSearch: true }))
                .then(r => r || caches.match('./admin.html', { ignoreSearch: true }))
                .then(r => r || networkResponse);
            }
            if (reqUrlLower.includes('order') || reqUrlLower.includes('menu') || reqUrlLower.includes('m=')) {
              return caches.match('./order/index.html', { ignoreSearch: true })
                .then(r => r || caches.match('./order/', { ignoreSearch: true }))
                .then(r => r || caches.match('./order.html', { ignoreSearch: true }))
                .then(r => r || caches.match('./menu/index.html', { ignoreSearch: true }))
                .then(r => r || networkResponse);
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
            const reqUrlLower = event.request.url.toLowerCase();
            if (reqUrlLower.includes('admin')) {
              return caches.match('./admin/index.html', { ignoreSearch: true })
                .then(r => r || caches.match('./admin/', { ignoreSearch: true }))
                .then(r => r || caches.match('./admin.html', { ignoreSearch: true }));
            }
            if (reqUrlLower.includes('menu') || reqUrlLower.includes('/order') || reqUrlLower.includes('order.html') || reqUrlLower.includes('m=')) {
              return caches.match('./menu/index.html', { ignoreSearch: true })
                .then(r => r || caches.match('./menu/', { ignoreSearch: true }))
                .then(r => r || caches.match('./order.html', { ignoreSearch: true }));
            }
            return caches.match('./index.html', { ignoreSearch: true });
          }
        });
      })
  );
});

// Local Notification Click Navigation
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : './admin.html';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes('admin') && 'focus' in client) {
          if ('navigate' in client && targetUrl) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
