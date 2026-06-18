const CACHE_NAME = 'sentraops-v1'
const STATIC_CACHE = 'sentraops-static-v1'

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll([
        '/manifest.json',
        '/icons/icon-192.svg',
        '/icons/icon-512.svg',
        '/favicon.svg',
        '/offline.html',
      ])
    }).catch(() => {})
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const { pathname } = new URL(event.request.url)

  // Static assets: cache-first
  if (
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/_next/static/') ||
    pathname === '/manifest.json' ||
    pathname === '/favicon.svg'
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone()
            caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, clone)).catch(() => {})
          }
          return response
        })
      })
    )
    return
  }

  // Navigation: network-first, fallback to cached, then offline page
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {})
        }
        return response
      }).catch(async () => {
        const cached = await caches.match(event.request)
        if (cached) return cached
        const offline = await caches.match('/offline.html')
        return offline || new Response('Tidak Ada Koneksi', { status: 503 })
      })
    )
    return
  }

  // Everything else (API, etc): network-only, no caching
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response(JSON.stringify({ error: 'offline' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
    })
  )
})
