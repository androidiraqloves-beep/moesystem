const CACHE_NAME = 'repflow-iphone-offline-v12-safe';
const APP_ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'offline.html',
  'repflow-logo.png',
  'logo.png',
  'apple-touch-icon.png',
  'apple-touch-icon-120.png',
  'apple-touch-icon-152.png',
  'apple-touch-icon-167.png',
  'apple-touch-icon-180.png',
  'favicon.png',
  'favicon-32.png',
  'icon-32.png',
  'icon-120.png',
  'icon-152.png',
  'icon-167.png',
  'icon-180.png',
  'icon-192.png',
  'icon-256.png',
  'icon-384.png',
  'icon-512.png',
  'icon-1024.png',
  'maskable-512.png',
  'apple-splash-1125-2436.png',
  'apple-splash-1170-2532.png',
  'apple-splash-1242-2208.png',
  'apple-splash-1242-2688.png',
  'apple-splash-1290-2796.png',
  'apple-splash-750-1334.png',
  'apple-splash-828-1792.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(APP_ASSETS.map(asset => cache.add(asset).catch(() => null)))
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(k => k !== CACHE_NAME && k.startsWith('repflow-'))
        .map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('index.html', copy));
          return res;
        })
        .catch(() => caches.match('index.html', { ignoreSearch: true }).then(r => r || caches.match('offline.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        const url = new URL(req.url);
        if (url.origin === location.origin && res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        }
        return res;
      }).catch(() => caches.match('offline.html'));
    })
  );
});
