/* 陪伴小狗 - 离线缓存 Service Worker */
var CACHE = "doubao-pet-v2";
var CORE = [
  "./index.html",
  "manifest.webmanifest",
  "assets/pwa-icon-192.png",
  "assets/pwa-icon-512.png"
];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){
    return c.addAll(CORE);
  }).then(function(){ return self.skipWaiting(); }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener("fetch", function(e){
  var url;
  try { url = new URL(e.request.url); } catch(err){ return; }
  if(url.origin !== location.origin) return;
  if(e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function(hit){
      if(hit) return hit;
      return fetch(e.request).then(function(res){
        if(res && res.ok){
          var p = url.pathname;
          if(p.indexOf("assets/") >= 0 || p.endsWith(".html") || p.endsWith(".webmanifest")){
            var copy = res.clone();
            caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
          }
        }
        return res;
      }).catch(function(){
        return caches.match("./index.html");
      });
    })
  );
});
