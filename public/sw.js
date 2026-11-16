/* eslint-disable no-restricted-globals */
/**
 * Service Worker for Interactive Weekly To-Do Dashboard PWA
 * Implements:
 * - Versioned Cache Management & Automatic Cleanup on Activate
 * - Network-First with Offline App-Shell Fallback for SPA Route Navigations
 * - Cache-First for Static Assets (Icons, Images, Fonts, Hashed Production Bundles)
 * - Stale-While-Revalidate for App Modules & Stylesheets
 * - Strict Exclusion of Sensitive / Authenticated / Non-GET Requests
 */

const SW_VERSION = 'v2.1.0';
const CACHE_PREFIX = 'interactive-todo-pwa-';
const SHELL_CACHE = `${CACHE_PREFIX}shell-${SW_VERSION}`;
const STATIC_CACHE = `${CACHE_PREFIX}static-${SW_VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}runtime-${SW_VERSION}`;
const FONTS_CACHE = `${CACHE_PREFIX}fonts-${SW_VERSION}`;

const ACTIVE_CACHES = [SHELL_CACHE, STATIC_CACHE, RUNTIME_CACHE, FONTS_CACHE];

const PRECACHE_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
];

const SPA_ROUTE_PATHS = new Set([
  '/',
  '/how-it-works',
  '/daily-columns',
  '/one-click',
  '/live-progress',
  '/color-themes',
  '/monthly-yearly',
  '/built-to-reuse',
  '/spreadsheet',
  '/everything-you-get',
]);

function isSensitiveOrNonCacheableRequest(request, url) {
  if (request.method !== 'GET') return true;
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return true;
  if (request.headers.has('Authorization')) return true;
  if (request.headers.get('Cache-Control') === 'no-store') return true;
  if (
    url.pathname.startsWith('/api/auth') ||
    url.pathname.startsWith('/oauth') ||
    url.searchParams.has('access_token') ||
    url.searchParams.has('token')
  ) {
    return true;
  }
  return false;
}

function isFontRequest(request, url) {
  return (
    request.destination === 'font' ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com' ||
    /\.(woff2?|ttf|otf|eot)$/i.test(url.pathname)
  );
}

function isStaticAssetRequest(request, url) {
  if (url.origin !== self.location.origin) return false;
  if (url.pathname.startsWith('/assets/')) return true;
  if (
    request.destination === 'image' ||
    request.destination === 'manifest' ||
    /\.(png|svg|ico|jpg|jpeg|webp|gif|webmanifest)$/i.test(url.pathname)
  ) {
    return true;
  }
  return false;
}

function isAppModuleOrStyleRequest(request, url) {
  if (url.origin !== self.location.origin) return false;
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/.vite/') ||
    url.pathname.startsWith('/@vite/') ||
    url.pathname.startsWith('/@react-refresh') ||
    /\.(js|mjs|ts|tsx|css|json)$/i.test(url.pathname)
  ) {
    return true;
  }
  return false;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const shellCache = await caches.open(SHELL_CACHE);
      await Promise.allSettled(
        PRECACHE_SHELL_URLS.map(async (url) => {
          try {
            const isHtml = url === '/' || url === '/index.html';
            const response = await fetch(url, {
              cache: 'reload',
              headers: isHtml ? { Accept: 'text/html' } : undefined,
            });
            if (response && response.ok) {
              await shellCache.put(url, response.clone());
            }
          } catch {
            // Ignore single asset fetch error during install
          }
        })
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((name) => {
          if (name.startsWith(CACHE_PREFIX) && !ACTIVE_CACHES.includes(name)) {
            return caches.delete(name);
          }
          return Promise.resolve(false);
        })
      );
      await self.clients.claim();
      const clientsList = await self.clients.matchAll({ type: 'window' });
      for (const client of clientsList) {
        client.postMessage({
          type: 'SW_ACTIVATED',
          version: SW_VERSION,
          timestamp: Date.now(),
        });
      }
    })()
  );
});

// Strategy 1: Network-First for Navigation Requests with App-Shell Offline Fallback
async function handleNavigationRequest(request) {
  const shellCache = await caches.open(SHELL_CACHE);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      await shellCache.put('/', networkResponse.clone());
      await shellCache.put('/index.html', networkResponse.clone());
      return networkResponse;
    }
  } catch {
    // Offline: serve cached SPA shell
  }

  const cachedIndex =
    (await shellCache.match(request, { ignoreVary: true, ignoreSearch: true })) ||
    (await shellCache.match('/index.html', { ignoreVary: true, ignoreSearch: true })) ||
    (await shellCache.match('/', { ignoreVary: true, ignoreSearch: true }));
  if (cachedIndex) {
    return cachedIndex;
  }

  return new Response(
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Interactive Weekly To-Do Dashboard (Offline)</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>',
    {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }
  );
}

// Strategy 2: Cache-First for Static Assets & Fonts
async function handleCacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, { ignoreVary: true });
  if (cached) {
    return cached;
  }
  try {
    const networkResponse = await fetch(request);
    if (
      networkResponse &&
      (networkResponse.ok || networkResponse.type === 'opaque')
    ) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const fallback = await caches.match(request, {
      ignoreVary: true,
      ignoreSearch: true,
    });
    if (fallback) return fallback;
    throw new Error('Asset unavailable offline');
  }
}

// Strategy 3: Stale-While-Revalidate for App Code & Styles
async function handleStaleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached =
    (await cache.match(request, { ignoreVary: true })) ||
    (await cache.match(request.url, { ignoreVary: true }));

  const networkFetchPromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse && networkResponse.ok) {
        await cache.put(request, networkResponse.clone());
        await cache.put(request.url, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => null);

  if (cached) {
    return cached;
  }

  const networkResponse = await networkFetchPromise;
  if (networkResponse) {
    return networkResponse;
  }

  const ignoreSearchMatch = await cache.match(request, {
    ignoreVary: true,
    ignoreSearch: true,
  });
  if (ignoreSearchMatch) {
    return ignoreSearchMatch;
  }

  const anyCacheMatch = await caches.match(request, {
    ignoreVary: true,
    ignoreSearch: true,
  });
  if (anyCacheMatch) {
    return anyCacheMatch;
  }

  return new Response('/* Offline cached fallback */', {
    status: 503,
    statusText: 'Offline',
  });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (isSensitiveOrNonCacheableRequest(request, url)) {
    return;
  }

  // Handle SPA page navigations (HTML documents & known routes)
  if (
    request.mode === 'navigate' ||
    (url.origin === self.location.origin &&
      request.destination === 'document') ||
    (url.origin === self.location.origin &&
      SPA_ROUTE_PATHS.has(url.pathname) &&
      request.headers.get('accept')?.includes('text/html'))
  ) {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle Google Fonts & font files with Cache-First
  if (isFontRequest(request, url)) {
    event.respondWith(handleCacheFirst(request, FONTS_CACHE));
    return;
  }

  // Handle Icons, Images, Manifest, and Production Hashed Bundles with Cache-First
  if (isStaticAssetRequest(request, url)) {
    event.respondWith(handleCacheFirst(request, STATIC_CACHE));
    return;
  }

  // Handle JS/TS/CSS/JSON modules with Stale-While-Revalidate
  if (isAppModuleOrStyleRequest(request, url)) {
    event.respondWith(handleStaleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }
});

// Listen for client messages to warm caches, inspect cache status, or skipWaiting
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || typeof data !== 'object') return;

  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (data.type === 'WARM_ACTIVE_RESOURCES' && Array.isArray(data.urls)) {
    event.waitUntil(
      (async () => {
        const runtimeCache = await caches.open(RUNTIME_CACHE);
        const shellCache = await caches.open(SHELL_CACHE);
        // Ensure index shell is cached with Accept: text/html
        try {
          const rootRes = await fetch('/', {
            cache: 'no-cache',
            headers: { Accept: 'text/html' },
          });
          if (rootRes && rootRes.ok) {
            await shellCache.put('/', rootRes.clone());
            await shellCache.put('/index.html', rootRes.clone());
          }
        } catch {
          // ignore if offline
        }

        const visited = new Set();
        const queue = [
          ...data.urls,
          '/src/main.tsx',
          '/@vite/client',
          '/@react-refresh',
        ];

        while (queue.length > 0) {
          const batch = queue.splice(0, 20);
          await Promise.allSettled(
            batch.map(async (rawUrl) => {
              try {
                const u = new URL(rawUrl, self.location.origin);
                if (u.origin !== self.location.origin) return;
                if (visited.has(u.href)) return;
                visited.add(u.href);

                let res = await runtimeCache.match(u.href, {
                  ignoreVary: true,
                });
                if (!res) {
                  const netRes = await fetch(u.href);
                  if (netRes && netRes.ok) {
                    await runtimeCache.put(u.href, netRes.clone());
                    res = netRes;
                  }
                }

                // Only parse small /src/ application files (skip large vendor bundles) to discover imports rapidly
                if (res && u.pathname.startsWith('/src/')) {
                  const text = await res.clone().text();
                  const importRegex =
                    /(?:from\s+|import\s*\(\s*|import\s+)["'](\/(?:src|node_modules\/\.vite|@vite|@react-refresh|assets)[^"']+)["']/g;
                  let match;
                  while ((match = importRegex.exec(text)) !== null) {
                    const depUrl = new URL(match[1], self.location.origin).href;
                    if (!visited.has(depUrl)) {
                      queue.push(depUrl);
                    }
                  }
                }
              } catch {
                // ignore individual resource warm errors
              }
            })
          );
        }

        const allClients = await self.clients.matchAll({
          includeUncontrolled: true,
          type: 'window',
        });
        for (const client of allClients) {
          client.postMessage({
            type: 'CACHE_WARM_COMPLETE',
            version: SW_VERSION,
            cachedCount: visited.size,
            timestamp: Date.now(),
          });
        }
      })()
    );
  }
});
