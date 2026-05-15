const cacheName = 'antheng-v3-final';
const assets = [
  './',
  './index.html',
  './admin.html',
  './riwayat.html',
  './resi.html',
  './style.css',
  './script.js',
  './adminScript.js',
  './riwayatScript.js',
  './resiScript.js',
  './manifest.json'
];

// Tahap Install: Simpan semua file ke cache HP
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Tahap Fetch: Ambil dari cache jika jaringan gagal
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});

// Tahap Activate: Hapus cache versi lama
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== cacheName).map(key => caches.delete(key))
      );
    })
  );
});