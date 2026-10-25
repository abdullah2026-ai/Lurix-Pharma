const CACHE_NAME = "lurix-pharma-static-v1";

// Cache ONLY safe static assets, brand icons, and public landing page shell
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // STRICT SECURITY RULE:
  // NEVER cache API requests, authentication routes, or private dashboard state!
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/dashboard") ||
    url.pathname.startsWith("/pos") ||
    url.pathname.startsWith("/medicines") ||
    url.pathname.startsWith("/accounts") ||
    url.pathname.startsWith("/reports") ||
    url.pathname.startsWith("/settings") ||
    url.pathname.startsWith("/users") ||
    url.pathname.startsWith("/audit") ||
    event.request.method !== "GET"
  ) {
    // Network-only. If offline, the browser or app client handles offline state.
    return;
  }

  // Stale-while-revalidate for safe static public assets only
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and request is for page navigation, return cached root if available
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
