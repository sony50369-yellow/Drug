const CACHE_NAME='ivdrug-cache-v12';
const CORE=['./','./index.html','./style.css','./app.js','./drugs.json','./manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(CORE)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE_NAME&&caches.delete(k)))));});
self.addEventListener('fetch',e=>{
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{
      const copy=res.clone(); caches.open(CACHE_NAME).then(c=>c.put(e.request,copy)); return res;
    }).catch(()=>caches.match('./index.html')))
  );
});