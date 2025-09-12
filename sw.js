const CACHE_NAME = 'quizmaster-v1.0.0';
const STATIC_CACHE = 'quizmaster-static-v1.0.0';
const DYNAMIC_CACHE = 'quizmaster-dynamic-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  '/assets/icons/apple-touch-icon.png',
  '/assets/icons/favicon-32x32.png',
  '/assets/icons/favicon-16x16.png',
  '/assets/icons/mstile-150x150.png',
  '/assets/icons/android-chrome-192x192.png',
  '/assets/icons/android-chrome-512x512.png',
  '/assets/icons/maskable-icon-192x192.png',
  '/assets/icons/maskable-icon-512x512.png'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/quizzes/,
  /\/api\/categories/,
  /\/api\/users\/profile/,
  /\/api\/analytics/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache', request.url);
          return cachedResponse;
        }

        // Check if this is an API request
        const isApiRequest = url.pathname.startsWith('/api/');
        const shouldCacheApi = API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));

        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response.ok) {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            // Cache API responses if they match our patterns
            if (isApiRequest && shouldCacheApi) {
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  console.log('Service Worker: Caching API response', request.url);
                  cache.put(request, responseToCache);
                });
            }
            // Cache static assets
            else if (!isApiRequest && url.origin === location.origin) {
              caches.open(STATIC_CACHE)
                .then((cache) => {
                  console.log('Service Worker: Caching static asset', request.url);
                  cache.put(request, responseToCache);
                });
            }

            return response;
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed', request.url, error);
            
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            
            // Return cached version if available for other requests
            return caches.match(request);
          });
      })
  );
});

// Background sync for quiz submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'quiz-submission') {
    console.log('Service Worker: Background sync for quiz submission');
    event.waitUntil(
      // Handle offline quiz submissions
      handleOfflineQuizSubmissions()
    );
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'New quiz available!',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Take Quiz',
        icon: '/assets/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('QuizMaster', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/quizzes')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle offline quiz submissions
async function handleOfflineQuizSubmissions() {
  try {
    // Get offline submissions from IndexedDB
    const submissions = await getOfflineSubmissions();
    
    for (const submission of submissions) {
      try {
        // Try to submit to server
        const response = await fetch('/api/quiz-submissions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${submission.token}`
          },
          body: JSON.stringify(submission.data)
        });

        if (response.ok) {
          // Remove from offline storage
          await removeOfflineSubmission(submission.id);
          console.log('Service Worker: Offline submission synced', submission.id);
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync submission', submission.id, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Error handling offline submissions', error);
  }
}

// IndexedDB helpers for offline storage
function getOfflineSubmissions() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('QuizMasterOffline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['submissions'], 'readonly');
      const store = transaction.objectStore('submissions');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('submissions')) {
        db.createObjectStore('submissions', { keyPath: 'id' });
      }
    };
  });
}

function removeOfflineSubmission(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('QuizMasterOffline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['submissions'], 'readwrite');
      const store = transaction.objectStore('submissions');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker: Loaded');
