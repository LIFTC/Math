/* MATH — service worker.  © 2026 LIFTC.
   BUMP THIS VERSION ON EVERY UPDATE or phones will keep the old copy. */
var CACHE = "math-v1";
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./music.m4a",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", function(e){
  self.skipWaiting();
  // One bad asset must not break the whole install.
  e.waitUntil(caches.open(CACHE).then(function(c){
    return Promise.all(ASSETS.map(function(u){ return c.add(u).catch(function(){}); }));
  }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){ return k === CACHE ? null : caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function(hit){
      return hit || fetch(e.request).then(function(res){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copy).catch(function(){}); });
        return res;
      });
    }).catch(function(){
      // Only fall back to the page for navigations, never for assets.
      if(e.request.mode === "navigate") return caches.match("./index.html");
      return new Response("", {status: 504});
    })
  );
});
