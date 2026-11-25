// QARATUN service worker: the game works offline after the first full load and updates itself.
// - the page (index.html): network first, so a new version shows up on the next launch; cached copy when offline
// - game assets (assets/*.js, icons): served from cache at once, refreshed in the background
// - libraries and fonts from CDNs: cache first (their URLs are versioned)
const CACHE = 'qaratun-v1';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

const put = (req, res) => { if (res && (res.ok || res.type === 'opaque')) caches.open(CACHE).then(c => c.put(req, res)); };

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  // the page itself: network first
  if (req.mode === 'navigate' || (sameOrigin && /\/(index\.html)?$/.test(url.pathname))) {
    e.respondWith(fetch(req).then(res => { put(req, res.clone()); return res; }).catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
    return;
  }
  // game files: stale-while-revalidate
  if (sameOrigin) {
    e.respondWith(caches.match(req).then(hit => {
      const net = fetch(req).then(res => { put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  // CDN libraries and fonts: cache first
  if (/cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(url.host)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { put(req, res.clone()); return res; })));
  }
});
