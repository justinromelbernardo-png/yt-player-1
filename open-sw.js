// Keeps the Study Portal Opener page on this device so it opens without internet.
// It only stores this page; the portals themselves are kept by the page (on the device), never here or online.
var V = "portal-opener-v4", FILES = ["open.html", "open-sw.js"];
self.addEventListener("install", function(e){
  e.waitUntil(caches.open(V).then(function(c){ return c.addAll(FILES); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k.indexOf("portal-opener-") === 0 && k !== V; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  var r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;
  var name = u.pathname.split("/").pop();
  if (FILES.indexOf(name) < 0) return;                                 // only the opener's own files
  e.respondWith(caches.open(V).then(function(c){
    return c.match(name).then(function(hit){
      var fresh = fetch(r).then(function(res){ if (res && res.ok) c.put(name, res.clone()); return res; }).catch(function(){ return hit; });
      return hit || fresh;                                                 // cached copy now, newer copy saved for next time
    });
  }));
});
