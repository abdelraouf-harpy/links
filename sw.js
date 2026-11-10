// Order PWA Service Worker — Native App Shell & Offline Engine
// OneSignal Web Push SDK Integration
try {
  importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
} catch (e) {
  console.warn("[SW] OneSignal worker import notice:", e);
}

const CACHE_NAME = 'order-pwa-v183.0';
const IMAGE_CACHE_NAME = 'order-images-v6';
const ASSETS_TO_CACHE = [
  './',
  './OneSignalSDKWorker.js',
  './index.html',
  './order.html',
  './portfolio.html',
  './admin.html',
  './master.html',
  './admin/',
  './admin/index.html',
  './order/',
  './order/index.html',
  './menu/',
  './menu/index.html',
  './manifest.json',
  './admin-manifest.json',
  './master-manifest.json',
  './favicon.ico',
  './assets/brand/favicon.png',
  './assets/brand/apple-touch-icon.png',
  './assets/brand/harpy_order_emblem_transparent.png',
  './assets/brand/harpy_order_logo.png',
  './assets/brand/chef_harpy_qr_template.webp',
  './assets/brand/chef_harpy_qr_template.png',
  './assets/brand/master_pwa_icon_192.png',
  './assets/brand/master_pwa_icon_512.png',
  './assets/brand/master_apple_touch_icon.png',
  './assets/icons/order-icon-512.png',
  './assets/icons/order-icon-192.png',
  './assets/icons/admin-icon-512.png',
  './assets/icons/admin-icon-192.png',
  './assets/portfolio/logo.png',
  './assets/portfolio/facebook_profile_logo.png',
  './assets/portfolio/01_Logo_and_Branding/order_logo_vector.svg',
  './css/order-tokens.css?v=180.0',
  './css/order-client.css?v=180.0',
  './css/order-admin.css?v=180.0',
  './css/portfolio.css?v=180.0',
  './js/core/demo-seed-data.js?v=180.0',
  './js/core/sound-effects.js?v=180.0',
  './js/core/i18n.js?v=180.0',
  './js/store.js?v=180.0',
  './js/admin/admin-core.js?v=180.0',
  './js/admin/admin-auth.js?v=180.0',
  './js/admin/kitchen-orders.js?v=180.0',
  './js/admin/inventory-manager.js?v=180.0',
  './js/admin/catalog-manager.js?v=180.0',
  './js/admin/category-manager.js?v=180.0',
  './js/admin/stories-manager.js?v=180.0',
  './js/admin/backup-restore.js?v=180.0',
  './js/admin/settings-manager.js?v=180.0',
  './js/admin/pos-terminal.js?v=180.0',
  './js/admin/admin-push.js?v=180.0',
  './js/client/client-core.js?v=180.0',
  './js/client/menu-view.js?v=180.0',
  './js/client/stories-viewer.js?v=180.0',
  './js/client/customizer-modal.js?v=180.0',
  './js/client/cart-ledger.js?v=180.0',
  './js/client/order-tracking.js?v=180.0',
  './js/app.js?v=180.0',
  './js/admin.js?v=180.0',
  './js/pwa.js?v=180.0'
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
      .then(() => {
        return self.clients.matchAll({ type: 'window' }).then(clients => {
          clients.forEach(c => c.postMessage({ type: 'SW_CLAIMED', version: CACHE_NAME }));
        });
      })
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

  // Bypass Cards NFC app — let cards manage its own SW & caching
  if (reqUrl.pathname.startsWith('/cards/') || reqUrl.pathname === '/cards') {
    return;
  }

  // Bypass all external Cloud APIs for zero-latency direct browser networking
  if (reqUrl.hostname.includes('firebaseio.com') ||
      reqUrl.hostname.includes('googleapis.com') ||
      reqUrl.hostname.includes('gstatic.com') ||
      reqUrl.hostname.includes('onesignal.com')) {
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

        // 2. Synthesize valid tenant manifest dynamically from live Firebase settings
        const isAdm = fileName.startsWith('admin-manifest-');
        const mSlug = isAdm 
          ? fileName.replace('admin-manifest-', '').replace('.json', '').split('?')[0] 
          : fileName.replace('manifest-', '').replace('.json', '').split('?')[0];

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

        const cleanShort = (storeName || (mSlug === 'king' ? 'كينج' : mSlug)).split('|')[0].trim();
        const finalName = isAdm ? `${cleanShort} | لوحة الإدارة` : `${cleanShort} | قائمة الطعام`;
        const finalShortName = isAdm ? `إدارة ${cleanShort}` : cleanShort;
        const iconUrl = isAdm ? './assets/icons/admin-icon-512.png' : './assets/icons/order-icon-512.png';
        const icon192 = isAdm ? './assets/icons/admin-icon-192.png' : './assets/icons/order-icon-192.png';
        const iconType = 'image/png';

        const synthesized = {
          id: isAdm ? `/admin/?m=${mSlug}` : `/order/?m=${mSlug}`,
          name: finalName,
          short_name: finalShortName,
          description: isAdm ? `${cleanShort} - لوحة الإدارة وتجهيز الطلبات` : `${cleanShort} - المنيو الذكي وطلب الأوردر`,
          start_url: isAdm ? `./admin/?m=${mSlug}` : `./order/?m=${mSlug}`,
          scope: isAdm ? `./admin/` : `./order/`,
          display: 'standalone',
          background_color: '#FFFFFF',
          theme_color: '#FFFFFF',
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
            if (reqUrlLower.includes('master')) {
              return caches.match('./master.html', { ignoreSearch: true }).then(r => r || networkResponse);
            }
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
            if (reqUrlLower.includes('master')) {
              return caches.match('./master.html', { ignoreSearch: true });
            }
            if (reqUrlLower.includes('admin')) {
              return caches.match('./admin/index.html', { ignoreSearch: true })
                .then(r => r || caches.match('./admin/', { ignoreSearch: true }))
                .then(r => r || caches.match('./admin.html', { ignoreSearch: true }));
            }
            if (reqUrlLower.includes('order') || reqUrlLower.includes('menu') || reqUrlLower.includes('m=')) {
              return caches.match('./order/index.html', { ignoreSearch: true })
                .then(r => r || caches.match('./order/', { ignoreSearch: true }))
                .then(r => r || caches.match('./order.html', { ignoreSearch: true }))
                .then(r => r || caches.match('./menu/index.html', { ignoreSearch: true }));
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
