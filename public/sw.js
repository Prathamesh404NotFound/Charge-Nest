/* VoltSetu PWA service worker
 * - Cache-first for the app shell (html/js/css/fonts/icons) with a network race on first load
 * - Stale-while-revalidate for image navigation (external thumbnails)
 * - Network-first for Firebase REST calls so live spot data is always fresh
 * - Skips waiting for faster activation during updates
 */
const CACHE_SHELL = "voltsetu-shell-v1";
const CACHE_IMAGES = "voltsetu-images-v1";
const MAX_IMAGE_CACHE = 80;

const SHELL_URLS = ["/", "/index.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_SHELL)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("voltsetu-") && key !== CACHE_SHELL && key !== CACHE_IMAGES)
            .map((key) => caches.delete(key))
        )
      ),
    ])
  );
});

/* Network-first for Firebase REST/RTDB and map tile requests. */
function isLiveApi(url) {
  return /firebaseio\.com|firebasedatabase\.app|tile\.openstreetmap\.org|tile\.openstreetmap\.de/.test(url);
}

function isImageRequest(request) {
  return request.destination === "image";
}

function trimImageCache() {
  return caches.open(CACHE_IMAGES).then((cache) =>
    cache.keys().then((keys) => {
      if (keys.length > MAX_IMAGE_CACHE) {
        return Promise.all(keys.slice(0, keys.length - MAX_IMAGE_CACHE).map((key) => cache.delete(key)));
      }
    })
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  // Only manage http(s) navigation and same-origin assets
  if (!/^https?:\/\//i.test(request.url)) return;

  if (isLiveApi(request.url)) {
    // Network-first: always prefer the freshest data
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  if (isImageRequest(request)) {
    // Stale-while-revalidate for images
    event.respondWith(
      caches.open(CACHE_IMAGES).then((cache) =>
        cache.match(request).then((cached) => {
          const networked = fetch(request)
            .then((response) => {
              if (response.ok) cache.put(request, response.clone());
              trimImageCache();
              return response;
            })
            .catch(() => cached || responseFallback());
          return cached || networked;
        })
      )
    );
    return;
  }

  // Cache-first app shell for navigation and same-origin assets
  event.respondWith(
    caches.match(request).then((cached) => {
      const networked = fetch(request)
        .then((response) => {
          if (response.ok && request.url.startsWith(self.location.origin)) {
            caches.open(CACHE_SHELL).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => cached || fallbackPage());
      return cached || networked;
    })
  );
});

function fallbackPage() {
  return caches.match("/index.html");
}

function responseFallback() {
  return new Response("", { status: 408, statusText: "Request timed out" });
}
