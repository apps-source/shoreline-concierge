/* Minimal service worker: cache icons only, network-first for everything else. */
const CACHE_NAME = 'shoreline-cache-v2'
const ASSETS = [
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/wave-pattern.svg'
]

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)))
})

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
      await self.clients.claim()
    })()
  )
})

self.addEventListener('fetch', event => {
  const { request } = event

  // Let Next.js handle its own assets without SW interference
  if (request.url.includes('/_next/')) return

  // Cache-first only for our small icon set
  if (ASSETS.includes(new URL(request.url).pathname)) {
    event.respondWith(
      caches.match(request).then(resp => resp || fetch(request).then(r => {
        const clone = r.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
        return r
      }))
    )
    return
  }

  // Network-first for everything else to avoid stale HTML/CSS
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  )
})
