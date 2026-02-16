# PWA Implementation Guide — Fireside Capital
**Research Sprint:** February 16, 2026  
**Status:** ✅ Complete  
**Researcher:** Capital (Orchestrator)

---

## Current State

**✅ Has:** manifest.json with basic metadata  
**❌ Missing:** Service worker (offline support, caching)  
**❌ Missing:** Add to homescreen prompt  
**❌ Missing:** Background sync  

**PWA Score:** ~30/100 (manifest only, no offline capability)

---

## PWA Requirements Checklist

| Requirement | Status | Priority |
|-------------|--------|----------|
| HTTPS | ✅ (Azure Static Web Apps) | - |
| Web App Manifest | ✅ | - |
| Service Worker | ❌ | High |
| Offline Page | ❌ | High |
| Asset Caching | ❌ | High |
| Installable | ⚠️ Partial | Medium |
| Background Sync | ❌ | Low |
| Push Notifications | ❌ | Low |

---

## Implementation Recommendations

### 1. Create Service Worker
**Priority:** High  
**Effort:** 4 hours  
**Impact:** Offline support, faster loading

```javascript
// sw.js (create in app root)
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `fireside-capital-${CACHE_VERSION}`;

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets.html',
  '/bills.html',
  '/budget.html',
  '/debts.html',
  '/income.html',
  '/investments.html',
  '/reports.html',
  '/settings.html',
  '/transactions.html',
  '/assets/css/design-tokens.css',
  '/assets/css/main.css',
  '/assets/css/components.css',
  '/assets/css/responsive.css',
  '/assets/js/app.js',
  '/assets/js/supabase-client.js',
  '/offline.html', // Custom offline page
  '/manifest.json'
];

// CDN resources to cache
const CDN_RESOURCES = [
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css'
];

// Install event — cache static assets
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Caching static assets');
      return cache.addAll(STATIC_ASSETS.concat(CDN_RESOURCES));
    }).then(() => self.skipWaiting())
  );
});

// Activate event — clean up old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('fireside-capital-') && name !== CACHE_NAME)
          .map(name => {
            console.log('[ServiceWorker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event — network-first for API, cache-first for assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip Supabase API requests (always go to network)
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Network-first for HTML pages (fresh content)
  if (event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful response
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache, then offline page
          return caches.match(event.request).then(cached => {
            return cached || caches.match('/offline.html');
          });
        })
    );
    return;
  }
  
  // Cache-first for static assets (CSS, JS, images)
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        // Cache successful response
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
```

---

### 2. Register Service Worker
**Priority:** High  
**Effort:** 30 minutes

```javascript
// Add to app.js (top of DOMContentLoaded)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registered:', registration.scope);
        
        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      })
      .catch(error => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
}
```

---

### 3. Create Custom Offline Page
**Priority:** High  
**Effort:** 1 hour

```html
<!-- offline.html -->
<!DOCTYPE html>
<html lang="en" data-bs-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - Fireside Capital</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f0f0f;
      color: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 1rem;
    }
    .offline-container {
      text-align: center;
      max-width: 500px;
    }
    .offline-icon {
      font-size: 4rem;
      margin-bottom: 1.5rem;
      opacity: 0.5;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    p {
      color: #b0b0b0;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    .retry-btn {
      background: #01a4ef;
      color: #0f0f0f;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      font-size: 1rem;
    }
    .retry-btn:hover {
      background: #0190d4;
    }
  </style>
</head>
<body>
  <div class="offline-container">
    <div class="offline-icon">📡</div>
    <h1>You're Offline</h1>
    <p>
      Fireside Capital needs an internet connection to sync your financial data. 
      Some features may be unavailable until you're back online.
    </p>
    <button class="retry-btn" onclick="location.reload()">Retry Connection</button>
  </div>
</body>
</html>
```

---

### 4. Improve manifest.json
**Priority:** Medium  
**Effort:** 30 minutes

```json
{
  "name": "Fireside Capital Dashboard",
  "short_name": "Fireside Capital",
  "description": "Personal finance tracking and budgeting dashboard",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#0f0f0f",
  "theme_color": "#01a4ef",
  "orientation": "portrait-primary",
  "categories": ["finance", "productivity", "business"],
  "icons": [
    {
      "src": "assets/img/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "assets/img/icons/icon-192x192-maskable.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "assets/img/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "assets/img/icons/icon-512x512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "Dashboard",
      "short_name": "Dashboard",
      "description": "View your net worth and financial overview",
      "url": "/index.html",
      "icons": [{ "src": "assets/img/icons/dashboard-96x96.png", "sizes": "96x96" }]
    },
    {
      "name": "Add Transaction",
      "short_name": "Add",
      "description": "Quickly add a new transaction",
      "url": "/transactions.html#add",
      "icons": [{ "src": "assets/img/icons/add-96x96.png", "sizes": "96x96" }]
    },
    {
      "name": "Bills",
      "short_name": "Bills",
      "description": "View upcoming bills",
      "url": "/bills.html",
      "icons": [{ "src": "assets/img/icons/bills-96x96.png", "sizes": "96x96" }]
    }
  ]
}
```

---

### 5. Add Install Prompt
**Priority:** Low  
**Effort:** 1 hour

```javascript
// app.js addition
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent default browser install prompt
  e.preventDefault();
  deferredPrompt = e;
  
  // Show custom install button (if user hasn't dismissed it before)
  const installDismissed = localStorage.getItem('install-prompt-dismissed');
  if (!installDismissed) {
    showInstallButton();
  }
});

function showInstallButton() {
  const installBtn = document.getElementById('install-app-btn');
  if (!installBtn) return;
  
  installBtn.style.display = 'block';
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ App installed');
    } else {
      console.log('❌ User dismissed install');
      localStorage.setItem('install-prompt-dismissed', 'true');
    }
    
    deferredPrompt = null;
    installBtn.style.display = 'none';
  });
}
```

---

## Testing Checklist

1. **Lighthouse PWA Audit:** Score > 90
2. **Offline functionality:** Cached pages load without network
3. **Install prompt:** Appears on eligible devices
4. **Service worker updates:** Old cache cleared on new version
5. **iOS Safari:** Add to homescreen works
6. **Android Chrome:** Install banner appears

---

## Total Effort: ~7 hours

| Task | Effort |
|------|--------|
| Service worker | 4h |
| Register SW | 30m |
| Offline page | 1h |
| Manifest improvements | 30m |
| Install prompt | 1h |

---

**Research Status:** ✅ Complete  
**Next Research Topic:** Performance Optimization (Final)
