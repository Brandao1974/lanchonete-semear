const CACHE_VERSION = new Date().getTime();
const cacheName = `semear-${CACHE_VERSION}`;

const assets = [
"./",
"./index.html",
"./style.css",
"./script.js",
"./manifest.json",
"./icons/favicon-96x96.png",
"./icons/icon-192.png",
"./icons/icon-512.png"
];

self.addEventListener("install", e => {
e.waitUntil(
caches.open(cacheName)
.then(cache => cache.addAll(assets))
);
});

self.addEventListener("activate", event => {
event.waitUntil(
caches.keys().then(keys => {
return Promise.all(
keys
.filter(key => key !== cacheName)
.map(key => caches.delete(key))
);
})
);
});

self.addEventListener("message", event => {
if (event.data && event.data.type === "SKIP_WAITING") {
self.skipWaiting();
}
});

self.addEventListener("fetch", e => {
e.respondWith(
caches.match(e.request)
.then(response => {
return response || fetch(e.request);
})
);
});
