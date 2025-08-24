// Service Worker for Murder on the Bullet Express
const CACHE_NAME = 'bullet-express-v1'
const STATIC_CACHE = 'bullet-express-static-v1'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/menu',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// Game assets to cache (these will be cached when accessed)
const GAME_ASSETS = [
  '/images/logo.png',
  '/images/carriage_bg.jpg',
  '/images/menu_bg.jpg',
  '/images/lestrange.png',
  '/images/gaspard.png',
  '/images/zane.png',
  '/images/victim.png',
  '/audio/train_ambient.ogg',
  '/audio/click.ogg',
  '/audio/discovery.ogg',
  '/audio/mystery.ogg'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    }).then(() => {
      return self.skipWaiting()
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE
          })
          .map((cacheName) => {
            return caches.delete(cacheName)
          })
      )
    }).then(() => {
      return self.clients.claim()
    })
  )
})

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return
  }

  // Skip Supabase API calls (always fetch fresh)
  if (url.pathname.includes('supabase') || url.pathname.includes('api')) {
    return
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/menu')
      })
    )
    return
  }

  // Handle static assets
  if (STATIC_ASSETS.some(asset => url.pathname === asset) || 
      GAME_ASSETS.some(asset => url.pathname.includes(asset))) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }

        return fetch(request).then((response) => {
          // Cache the response for future use
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
      })
    )
    return
  }

  // Default: try network first, fall back to cache
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request)
    })
  )
})

// Background sync for offline actions (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle offline actions when connection is restored
      console.log('Background sync triggered')
    )
  }
})

// Push notifications for game events (future enhancement)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      data: data.data,
      actions: [
        {
          action: 'open',
          title: 'Open Game',
          icon: '/icons/detective-96x96.png'
        }
      ]
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/menu')
    )
  }
})