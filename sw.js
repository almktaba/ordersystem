/* عامل الخدمة — يجعل التطبيق قابلًا للتثبيت ويعمل عند ضعف الاتصال.
   الاستراتيجية: الشبكة أولًا للملفات الأساسية (حتى تظهر تحديثات المنتجات فورًا)،
   وإن تعذر الاتصال نعرض آخر نسخة محفوظة. */

const CACHE = 'almaktaba-v3';
const SHELL = [
  './',
  'index.html',
  'exercises.html',
  'style.css',
  'exercises.css',
  'app.js',
  'exercises.js',
  'products_v20260511234705.js',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  // cache:'reload' يجبر جلب نسخة حديثة من الشبكة بدل كاش المتصفح
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) =>
        Promise.all(
          SHELL.map((url) =>
            fetch(url, { cache: 'reload' })
              .then((res) => (res && res.ok ? c.put(url, res) : null))
              .catch(() => null)
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const stripSearch = (url) => {
  const u = new URL(url);
  u.search = '';
  u.hash = '';
  return u.toString();
};

function fetchWithTimeout(req, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(req, { signal: ctrl.signal, cache: 'reload' }).finally(() => clearTimeout(timer));
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  const key = new Request(stripSearch(req.url));
  try {
    const res = await fetchWithTimeout(req, 8000);
    if (res && res.ok) cache.put(key, res.clone());
    return res;
  } catch (_) {
    const hit = await cache.match(key);
    if (hit) return hit;
    if (req.mode === 'navigate') {
      const index = await cache.match('index.html');
      if (index) return index;
    }
    return Response.error();
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  const refresh = fetch(req, { cache: 'reload' })
    .then((res) => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => hit);
  return hit || refresh;
}

self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // الخطوط من جوجل: كاش مع تحديث بالخلفية
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  if (url.origin !== self.location.origin) return;

  // الصفحات والسكربتات والأنماط والبيانات: الشبكة أولًا
  if (
    req.mode === 'navigate' ||
    /\.(html|js|css|json)$/i.test(url.pathname)
  ) {
    event.respondWith(networkFirst(req));
    return;
  }

  // الصور: الكاش أولًا مع تحديث بالخلفية
  event.respondWith(staleWhileRevalidate(req));
});
