const cacheName = 'antheng-v1';
const assets = [
  './',
  './index.html',
  './riwayat.html',
  './admin.html',
  './resi.html',
  './style.css',
  './script.js',
  './riwayatScript.js',
  './adminScript.js',
  './resiScript.js',
  './manifest.json'
];

// Install Service Worker & Caching Aset
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('Caching assets...');
      return cache.addAll(assets);
    })
  );
});

// Aktivasi & Hapus Cache Lama
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== cacheName)
        .map(key => caches.delete(key))
      );
    })
  );
});

// Fetching Aset dari Cache (Offline Support)
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cacheRes => {
      return cacheRes || fetch(e.request);
    })
  );
});