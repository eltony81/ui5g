var TEMPORARY_CACHE_STRATEGY = true;
//${prod.cache.strategy}
const CACHE_NAME = 'pwa-cache-${cache.manifest.version}';
const RESOURCES_TO_PRELOAD = [
  'index.html',
  'manifest.json',
  'pwamanifest.json',
  'register-worker.js',
  'Component-preload.js'
];

// Preload some resources during install
self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(RESOURCES_TO_PRELOAD);
      // if any item isn't successfully added to
      // cache, the whole operation fails.
    }).catch(function(error) {
      console.error(error);
    })
  );
});

// Delete obsolete caches during activate
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // only process GET requests

  if (TEMPORARY_CACHE_STRATEGY === true) {
    if (event.request.method === 'GET') {
      event.respondWith(
        caches.open(CACHE_NAME).then(function(cache) {
          return fetch(event.request).then(function(response) {
            if (response.type === 'opaque') {
              return response;
            } else if (!response.ok) {
              console.error(response.statusText);
            } else {
              cache.put(event.request, response.clone());
              return response;
            }
          });
        })
      );
    }
  } else {

    if (event.request.method === 'GET') {
      event.respondWith(
        caches.match(event.request).then(function(response) {
          if (response) {
            return response; // There is a cached version of the resource already
          }
          let requestCopy = event.request.clone();
          return fetch(requestCopy).then(function(response) {
            // opaque responses cannot be examined, they will just error
            if (response.type === 'opaque') {
              // don't cache opaque response, you cannot validate it's status/success
              return response;
              // response.ok => response.status == 2xx ? true : false;
            } else if (!response.ok) {
              console.error(response.statusText);
            } else {
              return caches.open(CACHE_NAME).then(function(cache) {
                cache.put(event.request, response.clone());
                return response;
                // if the response fails to cache, catch the error
              }).catch(function(error) {
                console.error(error);
                return error;
              });
            }
          }).catch(function(error) {
            // fetch will fail if server cannot be reached,
            // this means that either the client or server is offline
            console.error(error);
            return caches.match('offline-404.html');
          });
        })
      );
    }
  }
});
