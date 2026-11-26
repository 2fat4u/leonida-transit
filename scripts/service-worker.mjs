export function renderServiceWorker(version,assets){return `// Generated production app shell. No external assets or tracking.
const CACHE='vct-shell-${version}';
const ASSETS=${JSON.stringify(assets)};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const older=(await caches.keys()).filter(key=>key.startsWith('vct-shell-')&&key!==CACHE);for(const key of older.slice(0,-2))await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{const req=event.request,url=new URL(req.url);if(req.method!=='GET'||url.origin!==self.location.origin)return;
event.respondWith((async()=>{const cache=await caches.open(CACHE);const hit=await cache.match(req,{ignoreSearch:true,ignoreVary:true});if(hit)return hit;
// Preserve previous hashed assets through update/reload races.
if(url.pathname.startsWith('/assets/')){for(const key of (await caches.keys()).filter(key=>key.startsWith('vct-shell-')&&key!==CACHE)){const old=await (await caches.open(key)).match(req,{ignoreSearch:true,ignoreVary:true});if(old)return old;}}
if(req.mode==='navigate')return (await cache.match('/index.html',{ignoreVary:true}))||Response.error();
return fetch(req);})());});
`;}
