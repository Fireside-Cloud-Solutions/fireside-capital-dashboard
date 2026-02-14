# PWA Research: Offline Capabilities for Financial Dashboard
**Date:** February 14, 2026  
**Researcher:** Capital  
**Status:** ✅ Complete

## Executive Summary

Progressive Web App (PWA) capabilities can transform Fireside Capital from a web-only dashboard into an installable, offline-capable app that works like a native mobile/desktop application. This research outlines the implementation strategy, benefits, and security considerations specific to financial data.

**Key Benefits:**
- 📱 **Installable** — Add to home screen (mobile/desktop)
- 🔌 **Offline Access** — View cached financial data without internet
- ⚡ **Faster Load** — Cached assets = instant startup
- 🔔 **Push Notifications** — Payment reminders, budget alerts (future)

**Security Considerations:**
- ⚠️ Financial data is sensitive — offline caching must be selective
- ⚠️ Service workers cache publicly — never cache auth tokens or raw financial data
- ✅ Cache static assets + UI only, fetch live data when online

---

## PWA Requirements (Minimum Viable)

### 1. HTTPS (Already Met ✅)
- **Current:** Azure Static Web Apps (HTTPS by default)
- **Required:** PWAs only work over HTTPS

### 2. Web App Manifest
- **File:** `manifest.json` (describes app metadata)
- **Location:** `/app/manifest.json`

### 3. Service Worker
- **File:** `sw.js` (handles offline caching and requests)
- **Location:** `/app/sw.js`

---

## Implementation Strategy

### Phase 1: Basic PWA (Installable, No Offline)
**Goal:** Make the dashboard installable on mobile/desktop.  
**Time:** 2-3 hours  
**Complexity:** Low

#### 1. Create manifest.json
```json
{
  "name": "Fireside Capital",
  "short_name": "Fireside",
  "description": "Personal finance dashboard for tracking net worth, budgets, and investments.",
  "start_url": "/index.html",
  "display": "standalone",
  "background_color": "#0f0f0f",
  "theme_color": "#f44e24",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/assets/images/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/assets/images/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "categories": ["finance", "productivity"],
  "screenshots": [
    {
      "src": "/assets/images/screenshot-desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/assets/images/screenshot-mobile.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

#### 2. Link Manifest in HTML
```html
<!-- Add to <head> in all pages -->
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#f44e24">
<link rel="apple-touch-icon" href="/assets/images/icon-192.png">
```

#### 3. Create PWA Icons
```
Required Sizes:
- 192x192 (Android)
- 512x512 (Android, Desktop)
- 180x180 (iOS — apple-touch-icon)

Tool: https://www.pwabuilder.com/imageGenerator
Upload logo → Download all sizes
```

#### 4. Minimal Service Worker (Registration Only)
```javascript
// app/sw.js (minimal version)
const CACHE_VERSION = 'v1';

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
});

// Fetch: Just pass through to network (no offline yet)
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
```

#### 5. Register Service Worker
```html
<!-- Add before </body> in index.html -->
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('✅ Service Worker registered', reg))
        .catch(err => console.error('❌ Service Worker registration failed', err));
    });
  }
</script>
```

**Test:** Open Chrome DevTools → Application → Manifest → Check installability

---

### Phase 2: Offline Asset Caching (Recommended)
**Goal:** Cache static files (HTML, CSS, JS) for instant load.  
**Time:** 4-6 hours  
**Complexity:** Medium

#### Cache Strategy: "Cache First, Network Fallback"
```javascript
// app/sw.js (with offline caching)
const CACHE_VERSION = 'fireside-v1.0.0';
const STATIC_CACHE = `static-${CACHE_VERSION}`;

// Files to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets.html',
  '/bills.html',
  '/budget.html',
  '/dashboard.html',
  '/debts.html',
  '/income.html',
  '/investments.html',
  '/reports.html',
  '/settings.html',
  '/assets/css/main.css',
  '/assets/css/design-tokens.css',
  '/assets/css/components.css',
  '/assets/css/financial-patterns.css',
  '/assets/css/category-icons.css',
  '/assets/css/empty-states.css',
  '/assets/js/main.js',
  '/assets/js/chart-theme.js',
  '/assets/images/logo.svg',
  // Add other critical assets
];

// Install event: Cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Cache-first strategy for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Only cache same-origin requests
  if (url.origin !== location.origin) {
    event.respondWith(fetch(request));
    return;
  }
  
  // Cache-first for static assets
  if (request.method === 'GET' && 
      (url.pathname.startsWith('/assets/') || 
       url.pathname.endsWith('.html'))) {
    
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          if (cachedResponse) {
            console.log('[Service Worker] Cache hit:', url.pathname);
            return cachedResponse;
          }
          
          // Not in cache — fetch from network and cache for next time
          return fetch(request).then(networkResponse => {
            // Don't cache non-successful responses
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }
            
            // Clone response (can only be consumed once)
            const responseToCache = networkResponse.clone();
            
            caches.open(STATIC_CACHE).then(cache => {
              cache.put(request, responseToCache);
            });
            
            return networkResponse;
          });
        })
        .catch(() => {
          // Offline and not in cache — return offline page
          return caches.match('/offline.html');
        })
    );
  } else {
    // Network-first for API calls (Supabase)
    event.respondWith(fetch(request));
  }
});
```

#### Create Offline Fallback Page
```html
<!-- app/offline.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - Fireside Capital</title>
  <link rel="stylesheet" href="/assets/css/design-tokens.css">
  <style>
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: var(--color-bg-1);
      color: var(--color-text-primary);
      font-family: var(--font-body);
      text-align: center;
      padding: var(--space-lg);
    }
    .offline-container {
      max-width: 400px;
    }
    .offline-icon {
      font-size: 64px;
      margin-bottom: var(--space-lg);
      opacity: 0.5;
    }
    h1 {
      font-size: var(--text-h3);
      margin-bottom: var(--space-sm);
    }
    p {
      color: var(--color-text-secondary);
      margin-bottom: var(--space-lg);
    }
    .btn {
      padding: var(--space-sm) var(--space-lg);
      background-color: var(--color-primary);
      color: var(--color-button-text);
      border-radius: var(--radius-md);
      text-decoration: none;
      display: inline-block;
    }
  </style>
</head>
<body>
  <div class="offline-container">
    <div class="offline-icon">📡</div>
    <h1>You're Offline</h1>
    <p>Check your internet connection to view live financial data.</p>
    <a href="/" class="btn">Try Again</a>
  </div>
</body>
</html>
```

---

### Phase 3: Smart Data Caching (Advanced)
**Goal:** Cache read-only financial data for offline viewing.  
**Time:** 8-12 hours  
**Complexity:** High

#### Security-First Approach
```javascript
// NEVER cache:
// - Auth tokens (Supabase session)
// - User credentials
// - API responses with sensitive data

// SAFE to cache (read-only, encrypted at rest):
// - Net worth snapshots (historical, no PII)
// - Budget categories (public data structure)
// - Chart data (anonymized financial trends)
```

#### IndexedDB Strategy (Better than Cache API for Data)
```javascript
// Use IndexedDB for structured financial data
// Library: localforage (simple API over IndexedDB)

// Example: Cache last 30 days of snapshots
import localforage from 'localforage';

async function cacheFinancialData() {
  const { data: snapshots } = await supabase
    .from('snapshots')
    .select('*')
    .gte('snapshot_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('snapshot_date', { ascending: false });
  
  await localforage.setItem('snapshots_cache', {
    data: snapshots,
    timestamp: Date.now(),
    expires: Date.now() + 24 * 60 * 60 * 1000  // 24 hours
  });
}

async function getSnapshotsOffline() {
  const cached = await localforage.getItem('snapshots_cache');
  
  if (cached && Date.now() < cached.expires) {
    return cached.data;
  }
  
  return null;
}
```

**Note:** This is optional — most financial dashboards require live data.

---

## Testing Checklist

### PWA Installation
- [ ] Manifest validates (Chrome DevTools → Application → Manifest)
- [ ] Icons display correctly in install prompt
- [ ] App installs on Android (Chrome)
- [ ] App installs on iOS (Safari → Share → Add to Home Screen)
- [ ] App installs on desktop (Chrome → Install button)

### Offline Functionality
- [ ] Static assets load offline (CSS, JS, images)
- [ ] Offline page displays when network fails
- [ ] Online → Offline transition is smooth
- [ ] Service worker updates without breaking cache

### Performance
- [ ] First load caches all critical assets
- [ ] Second load is instant (cache hit)
- [ ] Lighthouse PWA score > 90

---

## Lighthouse PWA Checklist

Run: Chrome DevTools → Lighthouse → Progressive Web App

**Required for 100/100:**
- ✅ Registers a service worker
- ✅ Responds with 200 when offline
- ✅ Has a web app manifest
- ✅ Configured for a custom splash screen
- ✅ Sets a theme color
- ✅ Content sized correctly for viewport
- ✅ Has a `<meta name="viewport">` tag
- ✅ Provides apple-touch-icon

---

## Security Best Practices

### 1. NEVER Cache Sensitive Data in Service Worker
```javascript
// ❌ NEVER DO THIS
self.addEventListener('fetch', (event) => {
  // Caching all API responses = security risk
  event.respondWith(
    caches.match(event.request) || fetch(event.request)
  );
});

// ✅ DO THIS
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Never cache Supabase API calls
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Only cache static assets
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(event.request) || fetch(event.request)
    );
  }
});
```

### 2. Invalidate Cache on Version Change
```javascript
// Increment version on every deployment
const CACHE_VERSION = 'v1.2.0';  // Update this!

// Old caches are deleted in activate event
```

### 3. Clear Cache on Logout
```javascript
// In logout handler
if ('serviceWorker' in navigator) {
  caches.keys().then(names => {
    names.forEach(name => caches.delete(name));
  });
}
```

---

## Implementation Priority

| Phase | Feature | Benefit | Effort | Priority |
|-------|---------|---------|--------|----------|
| **Phase 1** | Manifest + Basic SW | Installable app | Low | **P1** |
| **Phase 1** | PWA Icons (192, 512) | Professional install prompt | Low | **P1** |
| **Phase 2** | Static asset caching | Instant load | Medium | **P2** |
| **Phase 2** | Offline fallback page | Graceful offline | Low | **P2** |
| **Phase 3** | IndexedDB data cache | Offline data viewing | High | **P3** |
| **Phase 3** | Background sync | Offline transaction entry | High | **P3** |

---

## Tools & Resources

### PWA Builder
- **URL:** https://www.pwabuilder.com/
- **Use:** Generate manifest, service worker, icons automatically
- **Recommended:** Use as reference, customize for Fireside Capital

### Icon Generator
- **URL:** https://www.pwabuilder.com/imageGenerator
- **Upload:** Fireside Capital logo
- **Download:** All required sizes (192x192, 512x512, etc.)

### Testing Tools
- **Lighthouse:** Chrome DevTools → Lighthouse → PWA audit
- **PWA Compat:** https://github.com/GoogleChromeLabs/pwa-compat (iOS polyfills)

---

## Expected Outcomes

### User Experience
- 📱 **Mobile:** Tap "Add to Home Screen" → Launches like native app
- 💻 **Desktop:** Click "Install" button → Standalone window (no browser chrome)
- ⚡ **Performance:** Second load < 500ms (cached assets)
- 🔌 **Offline:** View cached dashboard (no live data, graceful message)

### Business Impact
- 📈 Increased engagement (easier access via home screen)
- 💾 Reduced bandwidth costs (cached assets)
- 🏆 Modern tech stack (PWA = competitive advantage)

---

## Next Steps

**This Weekend:**
1. Create `manifest.json`
2. Generate PWA icons (192, 512, 180)
3. Link manifest in HTML
4. Test installability on mobile

**This Week:**
1. Implement Phase 2 service worker (static caching)
2. Create offline fallback page
3. Run Lighthouse audit → Fix issues

**Next Sprint:**
1. IndexedDB caching strategy (optional)
2. Push notification system (payment reminders)
3. Background sync (future enhancement)

---

## References

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google PWA Training](https://developers.google.com/codelabs/pwa-training)
- [PWA Builder](https://www.pwabuilder.com/)
- [Workbox (Google's PWA Library)](https://developers.google.com/web/tools/workbox)

---

**Status:** Ready for Phase 1 implementation  
**Next Research Topic:** General performance audit (Core Web Vitals)  
**Dependencies:** HTTPS (already met), icons (need creation)
