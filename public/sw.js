// Service Worker for performance optimization and caching
// Cache version - update on deploy to invalidate old caches
const CACHE_VERSION = 'v1.0.0';
const CACHE_PREFIX = 'kennedynespot-';
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`;
const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  '/og/og-default.jpg',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        // Remove only old caches that match our prefix but have a different version
        const oldCaches = cacheNames.filter((cacheName) => cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME);
        return Promise.all(oldCaches.map((cacheName) => caches.delete(cacheName)));
      })
      .then(() => self.clients.claim())
  );
});

// Listen for messages from the page to trigger immediate activation (useful during deploys)
self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING' || event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .then((fetchResponse) => {
            // Cache successful responses
            if (fetchResponse.status === 200) {
              const responseClone = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(event.request, responseClone));
            }
            return fetchResponse;
          });
      })
      .catch(() => {
        // Offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});
