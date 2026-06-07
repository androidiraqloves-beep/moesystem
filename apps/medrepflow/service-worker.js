const CACHE_NAME='medrep-flow-logo4-exact-root-20260607';
const ASSETS=[
  './',
  './index.html?v=logo4',
  './index.html',
  './manifest.json?v=logo4',
  './manifest.json',
  './icon-32.png?v=logo4',
  './icon-96.png?v=logo4',
  './icon-180.png?v=logo4',
  './icon-32.png',
  './icon-96.png',
  './icon-180.png'
];
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.pathname.endsWith('/manifest.json') || url.pathname.endsWith('.png')) {
    event.respondWith(
      fetch(event.request, { cache: 'reload' })
        .then(resp => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return resp;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request)
        .then(resp => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return resp;
        })
        .catch(() => caches.match('./index.html')))
  );
});
