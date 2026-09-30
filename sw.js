/* Voz a LSM: guarda la app y lo ya descargado para usarlo sin internet */
const V='voz-a-lsm-v1';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.allSettled(SHELL.map(u=>c.add(u)))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(/anthropic\.com$|firestore\.googleapis\.com$|identitytoolkit|securetoken|firebaseapp\.com$|apis\.google\.com$/.test(u.hostname))return;
  const net=()=>fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const c=res.clone();caches.open(V).then(cc=>cc.put(r,c));}return res;});
  if(u.origin===self.location.origin){
    // Primero la red (para ver cambios), y si no hay internet, lo guardado
    e.respondWith(net().catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))));
    return;
  }
  if(/cdn\.jsdelivr\.net$|gstatic\.com$|fonts\.googleapis\.com$|storage\.googleapis\.com$/.test(u.hostname)){
    e.respondWith(caches.match(r).then(m=>m||net()));
  }
});
