const VERSION = "v1";
const CACHE_NAME = `birthday-tracker-${VERSION}`;

const APP_STATIC_RESOURCES = [
  "/",
  "/static/index.html",
  "/static/style.css",
  "/static/app.js",
  "/static/favicon.ico",
  "/static/icon-192x192.png",
  "/static/icon-512x512.png",
];

self.addEventListener("install", (e) => {
  console.log("Service worker installed");
  // e.waitUntil(
  //   (async () => {
  //     const cache = await caches.open(CACHE_NAME);
  //     cache.addAll(APP_STATIC_RESOURCES);
  //   })()
  // );
});

self.addEventListener("activate", (event) => {
  console.log("Service worker activated");
  // event.waitUntil(
  //   (async () => {
  //     const names = await caches.keys();
  //     await Promise.all(
  //       names.map((name) => {
  //         if (name !== CACHE_NAME) {
  //           return caches.delete(name);
  //         }
  //         return undefined;
  //       })
  //     );
  //     await clients.claim();
  //   })()
  // );
});

self.addEventListener("fetch", (event) => {
  console.log("Fetching", event.request.url);
  // // when seeking an HTML page
  // if (event.request.mode === "navigate") {
  //   // Return to the index.html page
  //   event.respondWith(caches.match("/"));
  //   return;
  // }

  // // For every other request type
  // event.respondWith(
  //   (async () => {
  //     const cache = await caches.open(CACHE_NAME);
  //     const cachedResponse = await cache.match(event.request.url);
  //     if (cachedResponse) {
  //       // Return the cached response if it's available.
  //       return cachedResponse;
  //     }
  //     // Respond with a HTTP 404 response status.
  //     return new Response(null, { status: 404 });
  //   })()
  // );
});

self.addEventListener("message", (event) => {
  console.log("Message received", event);
});
