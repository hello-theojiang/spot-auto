/* OpenSpotAuto — service worker : shell en cache, 100% hors-ligne. */
const CACHE = "openspotauto-v2";
const SHELL = [
  ".",
  "index.html",
  "manifest.webmanifest",
  "assets/css/app.css",
  "assets/icons/icon.svg",
  "assets/js/catalog.js",
  "assets/js/store.js",
  "assets/js/photos.js",
  "assets/js/anticheat.js",
  "assets/js/camera.js",
  "assets/js/ai.js",
  "assets/js/scoring.js",
  "assets/js/components.js",
  "assets/js/views/home.js",
  "assets/js/views/capture.js",
  "assets/js/views/spots.js",
  "assets/js/views/spot.js",
  "assets/js/views/classement.js",
  "assets/js/views/palmares.js",
  "assets/js/views/profils.js",
  "assets/js/views/reglages.js",
  "assets/js/views/legal.js",
  "assets/js/app.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match("index.html")))
  );
});
