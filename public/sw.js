// Service Worker BEM Unsoed PWA
const CACHE_NAME = "bem-unsoed-v1";

const STATIC_ASSETS = [
  "/",
  "/app",
  "/logo.webp",
  "/logobem.png",
  "/favicon.ico",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-icon.png",
  "/icons/maskable-icon-512.png",
];

// Install Event: pre-cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("PWA: Gagal pre-cache beberapa aset statis:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event: bersihkan cache lama
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: network first untuk halaman & data, cache first untuk aset statis
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Jangan sentuh request mutasi atau API non-GET
  if (event.request.method !== "GET") {
    return;
  }

  // Aset statis (_next/static, fonts, icons, images) -> Stale-While-Revalidate
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".woff2")
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // Halaman navigasi & API GET -> Network-first dengan fallback ke cache
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          event.request.mode === "navigate"
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;

        // Jika navigasi offline dan tidak ada cache, kembalikan offline fallback jika tersedia
        if (event.request.mode === "navigate") {
          return caches.match("/app");
        }

        return new Response("Offline", {
          status: 503,
          statusText: "Service Unavailable (Offline)",
        });
      })
  );
});
