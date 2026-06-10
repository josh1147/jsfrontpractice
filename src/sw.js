/* Service Worker：应用外壳缓存（网络优先，离线回退）。 */

const CACHE = 'scmj-v2';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './css/style.css',
  './data/tiles.js',
  './js/app.js',
  './js/ui/dom.js',
  './js/ui/tile.js',
  './js/ui/feedback.js',
  './js/engine/index.js',
  './js/engine/hand.js',
  './js/engine/win.js',
  './js/engine/ting.js',
  './js/engine/score.js',
  './js/lessons/registry.js',
  './js/lessons/gen.js',
  './js/lessons/lesson-1-tiles.js',
  './js/lessons/lesson-2-quemen.js',
  './js/lessons/lesson-3-melds.js',
  './js/lessons/lesson-4-win.js',
  './js/lessons/lesson-5-penggang.js',
  './js/lessons/lesson-6-sevenpairs.js',
  './js/lessons/lesson-7-score.js',
  './js/lessons/lesson-8-final.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 网络优先：在线时总是拿最新内容并回填缓存；离线时回退到缓存。
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
