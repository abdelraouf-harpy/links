// =====================================================
// HARPY CARDS - PWA Service Worker
// =====================================================

const CACHE_NAME = 'harpy-cards-cache-v4';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => clients.claim())
  );
});

// Simple pass-through fetch handler to satisfy PWA installation criteria
// without caching Firestore REST API calls or causing static asset cache staleness
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request));
});
