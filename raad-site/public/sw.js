/*
 * AL-RAAD service worker. It only caches the app shell (the page and the site's own build
 * files) so the site can be installed as an app and opens without a connection.
 *
 * Everything else goes straight to the network and is never cached or intercepted:
 * WhatsApp (wa.me), phone calls (tel:), Google Maps and every other external link.
 */
const CACHE = 'raad-shell-v1';
const SHELL = ['/', '/manifest.webmanifest', '/images/raad/icon-192.png', '/images/raad/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Only this site's own files. wa.me, tel:, maps and any other origin are left alone.
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    // The page: network first (always fresh), the cached copy only when offline.
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && url.pathname === '/') {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put('/', copy));
          }
          return response;
        })
        .catch(() => caches.match('/')),
    );
    return;
  }

  if (url.pathname.startsWith('/_next/static/')) {
    // Build files (scripts, styles, fonts) have a content hash in their name: safe to reuse.
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
  // Anything else (photos, icons, etc.) is not intercepted.
});
