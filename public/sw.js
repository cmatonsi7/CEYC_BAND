/*
 * Offline cache for the CEYC Band Library.
 * Paths are relative to this file, so it works under any GitHub Pages
 * repository path. Strategy: network first for the page and song data (so
 * updates arrive), cache first for hashed build assets and fonts.
 */
const VERSION = '__VERSION__'; // replaced at build time
const CACHE = `ceyc-band-${VERSION}`;
const PRECACHE = ['__PRECACHE__']; // replaced at build time with every built file
const SHELL = ['./', ...PRECACHE.filter((f) => f !== './__PRECACHE__')];

self.addEventListener('install', (event) => {
  // Cache files one by one so a single missing file can't block installation.
  event.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(SHELL.map((url) => c.add(url).catch(() => undefined))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('ceyc-band-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isAsset = url.pathname.includes('/assets/');
  if (isAsset) {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
        return res;
      })),
    );
    return;
  }

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
      .then((res) => res || new Response('Offline', { status: 503 })),
  );
});
