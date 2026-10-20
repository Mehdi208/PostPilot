// PostPilot PWA Service Worker — Enterprise Offline & Shell Cache
const CACHE_NAME = 'postpilot-pwa-v2';
const OFFLINE_FALLBACK = '/';

const PRECACHE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
  '/icons/icon.svg',
  '/radar/tapioca-brown-sugar.jpg',
  '/radar/caramel-pour.jpg',
  '/radar/combo-burger.jpg',
  '/radar/boba-drink.jpg',
  '/radar/restaurant-vibes.jpg',
  '/radar/tapioca-2.jpg',
  '/radar/tapioca-3.jpg',
  '/radar/matcha-tea.jpg',
  '/radar/fruit-tea.jpg',
  '/radar/avatar-1.jpg',
  '/radar/avatar-2.jpg',
  '/radar/avatar-3.jpg',
  '/radar/avatar-4.jpg',
  '/mentions-legales',
  '/confidentialite'
];

// 1. Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[PostPilot SW] Pre-caching warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. Activation & Cleanup of Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and browser extensions
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // API calls: Network first, never store stale POST/mutation caches
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Connexion hors ligne', offline: true }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      })
    );
    return;
  }

  // HTML page navigations: Network First with offline fallback to cached shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const fallbackShell = await caches.match(OFFLINE_FALLBACK);
          return fallbackShell || Response.error();
        })
    );
    return;
  }

  // Next.js static assets & icons: Cache First with background refresh
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // Revalidate in background
          fetch(request)
            .then((fresh) => {
              if (fresh && fresh.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(request, fresh));
              }
            })
            .catch(() => {});
          return cached;
        }

        return fetch(request).then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      })
    );
    return;
  }

  // Default: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
