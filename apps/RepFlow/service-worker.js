const CACHE_NAME = 'repflow-ios-pwa-repflow-flat-v3';
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./admin.html",
  "./manifest.json",
  "./offline.html",
  "./repflow-logo.png",
  "./logo.png",
  "./apple-touch-icon.png",
  "./favicon.png",
  "./icon-32.png",
  "./icon-120.png",
  "./icon-152.png",
  "./icon-167.png",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-256.png",
  "./icon-384.png",
  "./icon-512.png",
  "./icon-1024.png",
  "./apple-touch-icon-120.png",
  "./apple-touch-icon-152.png",
  "./apple-touch-icon-167.png",
  "./apple-touch-icon-180.png",
  "./maskable-512.png",
  "./apple-splash-1125-2436.png",
  "./apple-splash-1170-2532.png",
  "./apple-splash-1242-2208.png",
  "./apple-splash-1242-2688.png",
  "./apple-splash-1290-2796.png",
  "./apple-splash-750-1334.png",
  "./apple-splash-828-1792.png"
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      return res;
    }).catch(() => caches.match('./index.html').then(r => r || caches.match('./offline.html'))));
    return;
  }
  event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(res => {
    const copy = res.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
    return res;
  }).catch(() => cached)));
});
