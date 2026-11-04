// Service worker: keeps the lab working offline after the first visit.
// Bump VERSION whenever the files change so phones pick up the new copy.
const VERSION='chemlab-v3';
const FILES=['./','index.html','lab2d.html','three.min.js','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  // pages: network first so updates arrive, cache as fallback; everything else: cache first
  const page=e.request.mode==='navigate';
  e.respondWith((page?fetch(e.request).then(r=>{const c=r.clone();caches.open(VERSION).then(x=>x.put(e.request,c));return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html')))
    :caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res.ok&&(res.type==='basic'||res.type==='cors')){const c=res.clone();caches.open(VERSION).then(x=>x.put(e.request,c));}return res;}))));
});
