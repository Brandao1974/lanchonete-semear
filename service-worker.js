const cacheName = "semear-v1";

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

self.addEventListener("fetch", e => {
e.respondWith(
caches.match(e.request)
.then(response => {
return response || fetch(e.request);
})
);
});