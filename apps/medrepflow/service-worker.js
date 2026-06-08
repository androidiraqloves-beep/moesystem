const CACHE_NAME='medrep-flow-commercial-cache-v3-cachefix';
const VERSION='commercial3';
const ASSETS=[
  './manifest.json?v='+VERSION,
  './manifest.json',
  './icon-32.png?v='+VERSION,
  './icon-96.png?v='+VERSION,
  './icon-180.png?v='+VERSION,
  './icon-32.png',
  './icon-96.png',
  './icon-180.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const isHTML = event.request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
  if (isHTML) {
    event.respondWith(
      fetch(event.request, {cache:'no-store'}).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
        return resp;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }
  event.respondWith(
    fetch(event.request, {cache:'reload'}).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return resp;
    }).catch(() => caches.match(event.request))
  );
});
