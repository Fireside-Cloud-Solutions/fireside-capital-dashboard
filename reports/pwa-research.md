# PWA (Progressive Web App) Research — Fireside Capital Dashboard
**Research Sprint**: February 20, 2026  
**Status**: Complete ✅  
**Priority**: High — Offline access + mobile experience

---

## Executive Summary

Transform Fireside Capital into a **Progressive Web App** to enable offline access, installability, and native-like mobile experience. Financial dashboards benefit significantly from PWAs — users can check balances, view charts, and access data without internet connection.

**PWA Benefits**:
- 📱 **Installable** — Add to home screen (iOS/Android/Desktop)
- 🔌 **Offline access** — View cached data when internet unavailable
- ⚡ **Fast loading** — Pre-cached assets load instantly
- 📊 **Background sync** — Queue transactions/updates when offline
- 🔔 **Push notifications** — Payment reminders, budget alerts

**Implementation Effort**: Low (2-3 days) — Requires 3 files + manifest

---

## PWA Core Requirements

### 1. Web App Manifest (`manifest.json`)
Tells browsers how to display the app when installed.

**Create** `app/manifest.json`:
```json
{
  "name": "Fireside Capital",
  "short_name": "Fireside",
  "description": "Personal finance dashboard for tracking assets, debts, budgets, and investments",
  "start_url": "/dashboard.html",
  "display": "standalone",
  "background_color": "#0f0f0f",
  "theme_color": "#f44e24",
  "orientation": "any",
  "icons": [
    {
      "src": "assets/icons/icon-72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "assets/icons/icon-96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "assets/icons/icon-128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "assets/icons/icon-144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "assets/icons/icon-152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "assets/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "assets/icons/icon-384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "assets/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["finance", "productivity"],
  "screenshots": [
    {
      "src": "assets/screenshots/desktop-dashboard.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Dashboard overview"
    },
    {
      "src": "assets/screenshots/mobile-dashboard.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Mobile dashboard"
    }
  ],
  "shortcuts": [
    {
      "name": "Dashboard",
      "short_name": "Home",
      "description": "View your financial overview",
      "url": "/dashboard.html",
      "icons": [{ "src": "assets/icons/shortcut-dashboard.png", "sizes": "96x96" }]
    },
    {
      "name": "Add Transaction",
      "short_name": "Add",
      "description": "Record a new transaction",
      "url": "/dashboard.html?action=add-transaction",
      "icons": [{ "src": "assets/icons/shortcut-add.png", "sizes": "96x96" }]
    },
    {
      "name": "Reports",
      "short_name": "Reports",
      "description": "View financial reports",
      "url": "/reports.html",
      "icons": [{ "src": "assets/icons/shortcut-reports.png", "sizes": "96x96" }]
    }
  ],
  "prefer_related_applications": false
}
```

**Link manifest** in all HTML files (`<head>`):
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#f44e24">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Fireside">
<link rel="apple-touch-icon" href="assets/icons/icon-192.png">
```

---

### 2. Service Worker (`sw.js`)
Handles offline caching, background sync, and push notifications.

**Create** `app/sw.js`:
```javascript
/**
 * Service Worker — Fireside Capital Dashboard
 * Handles offline caching, background sync, and push notifications.
 * 
 * Caching Strategy:
 * - App Shell (HTML, CSS, JS): Cache-first (instant load)
 * - API Data (Supabase): Network-first (fresh data when online)
 * - Static Assets (images, fonts): Cache-first (rarely change)
 */

const CACHE_NAME = 'fireside-capital-v1.0.0';
const RUNTIME_CACHE = 'fireside-runtime-v1.0.0';

// ===== APP SHELL FILES (always cached) =====
const APP_SHELL = [
  '/',
  '/dashboard.html',
  '/assets.html',
  '/bills.html',
  '/budget.html',
  '/debts.html',
  '/income.html',
  '/investments.html',
  '/reports.html',
  '/settings.html',
  
  // CSS (modular architecture)
  '/assets/css/design-tokens.css',
  '/assets/css/main.css',
  '/assets/css/components.css',
  '/assets/css/utilities.css',
  '/assets/css/responsive.css',
  
  // JavaScript
  '/assets/js/app.js',
  '/assets/js/chart-theme.js',
  '/assets/js/chart-factory.js',
  '/assets/js/charts.js',
  '/assets/js/theme-toggle.js',
  
  // Fonts
  '/assets/fonts/Inter-Regular.woff2',
  '/assets/fonts/Inter-Medium.woff2',
  '/assets/fonts/Inter-SemiBold.woff2',
  '/assets/fonts/SourceSerif4-Regular.woff2',
  '/assets/fonts/SourceSerif4-SemiBold.woff2',
  
  // Icons
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  
  // External dependencies (CDN)
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css',
];

// ===== INSTALL EVENT (cache app shell) =====
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(APP_SHELL);
    }).then(() => {
      console.log('[Service Worker] Installed successfully');
      return self.skipWaiting(); // Activate immediately
    })
  );
});

// ===== ACTIVATE EVENT (clean old caches) =====
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Activated successfully');
      return self.clients.claim(); // Take control of all pages
    })
  );
});

// ===== FETCH EVENT (serve from cache or network) =====
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // STRATEGY 1: Cache-First (App Shell, Static Assets)
  if (APP_SHELL.includes(url.pathname) || request.destination === 'image' || request.destination === 'font') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          console.log('[Service Worker] Serving from cache:', url.pathname);
          return cachedResponse;
        }
        
        // Not in cache: fetch from network and cache it
        return fetch(request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // STRATEGY 2: Network-First (API Data from Supabase)
  if (url.hostname.includes('supabase.co') || url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Cache successful responses
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed: serve stale data from cache
          console.log('[Service Worker] Network failed, serving cached API data');
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || new Response(
              JSON.stringify({ error: 'Offline', message: 'No cached data available' }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }

  // STRATEGY 3: Network-Only (everything else)
  event.respondWith(fetch(request));
});

// ===== BACKGROUND SYNC (queue offline actions) =====
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    console.log('[Service Worker] Background sync: transactions');
    event.waitUntil(syncTransactions());
  }
});

async function syncTransactions() {
  // Retrieve queued transactions from IndexedDB
  // Send to Supabase when back online
  // (Implementation requires IndexedDB setup)
  console.log('[Service Worker] Syncing queued transactions...');
}

// ===== PUSH NOTIFICATIONS (payment reminders) =====
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Fireside Capital';
  const options = {
    body: data.body || 'You have a notification',
    icon: '/assets/icons/icon-192.png',
    badge: '/assets/icons/badge-72.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/dashboard.html' },
    actions: [
      { action: 'open', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    const urlToOpen = event.notification.data.url;
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  }
});
```

---

### 3. Service Worker Registration (`app.js`)
Register the service worker when the app loads.

**Add to** `app/assets/js/app.js`:
```javascript
/**
 * Register Service Worker for PWA functionality
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration.scope);

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000 * 60); // Check every hour
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });

  // Listen for service worker updates
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('🔄 Service Worker updated, reloading page...');
    window.location.reload();
  });
}
```

---

## Offline Data Strategy

### Cached Data (Always Available Offline)
- ✅ Dashboard HTML/CSS/JS
- ✅ All pages (assets, bills, budget, etc.)
- ✅ Chart.js library + theme config
- ✅ Bootstrap CSS/JS
- ✅ Static assets (icons, fonts)

### Dynamic Data (Network-First, Fallback to Cache)
- 📊 Supabase API responses (snapshots, assets, debts, etc.)
- 💾 Cached for 24 hours, updated when online
- ⚠️ Show "Last updated: X hours ago" banner when offline

### User Actions (Background Sync)
When offline, queue these actions and sync when back online:
- ➕ Add transaction
- ✏️ Edit budget
- 🗑️ Delete item
- 💰 Update asset value

**Implementation** (IndexedDB queue):
```javascript
// Queue an offline action
async function queueOfflineAction(action, data) {
  const db = await openDatabase();
  const tx = db.transaction('pendingActions', 'readwrite');
  tx.store.add({ action, data, timestamp: Date.now() });
}

// Sync queued actions when online
async function syncPendingActions() {
  const db = await openDatabase();
  const tx = db.transaction('pendingActions', 'readonly');
  const actions = await tx.store.getAll();

  for (const item of actions) {
    try {
      await sendToSupabase(item.action, item.data);
      // Remove from queue on success
      const deleteTx = db.transaction('pendingActions', 'readwrite');
      deleteTx.store.delete(item.id);
    } catch (error) {
      console.error('Failed to sync action:', error);
    }
  }
}

// Register background sync
if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
  navigator.serviceWorker.ready.then((registration) => {
    return registration.sync.register('sync-transactions');
  });
}
```

---

## Offline UI Indicators

### Status Banner (show when offline)
```html
<!-- Add to all pages (top of <body>) -->
<div id="offline-banner" class="alert alert-warning d-none" role="alert">
  <i class="bi bi-wifi-off me-2"></i>
  <strong>You're offline.</strong> Some data may be out of date.
  <span id="last-sync">Last synced: <time>2 hours ago</time></span>
</div>
```

**JavaScript** (show/hide banner):
```javascript
// Update online/offline status
window.addEventListener('online', () => {
  document.getElementById('offline-banner').classList.add('d-none');
  console.log('✅ Back online');
  syncPendingActions(); // Sync queued actions
});

window.addEventListener('offline', () => {
  document.getElementById('offline-banner').classList.remove('d-none');
  console.log('⚠️ Offline mode');
});

// Initialize on load
if (!navigator.onLine) {
  document.getElementById('offline-banner').classList.remove('d-none');
}
```

---

## Icon Generation

PWA requires multiple icon sizes. Generate from a master 512x512 PNG.

**Using ImageMagick** (PowerShell):
```powershell
# Master icon: assets/icons/icon-master.png (512x512)
$sizes = @(72, 96, 128, 144, 152, 192, 384, 512)

foreach ($size in $sizes) {
  magick convert assets/icons/icon-master.png `
    -resize "${size}x${size}" `
    assets/icons/icon-$size.png
}

# Maskable icon (with padding for iOS)
magick convert assets/icons/icon-master.png `
  -resize 512x512 `
  -background transparent `
  -gravity center `
  -extent 600x600 `
  assets/icons/icon-512-maskable.png
```

**Without ImageMagick** (use online tool):
- https://www.pwabuilder.com/imageGenerator
- Upload 512x512 PNG, download zip with all sizes

---

## Install Prompts

### Desktop (Chrome, Edge)
Show custom install prompt when user is engaged:

```javascript
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent default mini-infobar
  e.preventDefault();
  
  // Store event for later
  deferredPrompt = e;
  
  // Show custom install button
  document.getElementById('install-button').classList.remove('d-none');
});

document.getElementById('install-button').addEventListener('click', async () => {
  if (!deferredPrompt) return;
  
  // Show install prompt
  deferredPrompt.prompt();
  
  // Wait for user response
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`User ${outcome === 'accepted' ? 'installed' : 'dismissed'} the app`);
  
  // Clear prompt
  deferredPrompt = null;
  document.getElementById('install-button').classList.add('d-none');
});

// Track successful installs
window.addEventListener('appinstalled', () => {
  console.log('✅ PWA installed successfully');
  // Track analytics
});
```

**HTML** (install button):
```html
<button id="install-button" class="btn btn-primary d-none">
  <i class="bi bi-download me-2"></i> Install App
</button>
```

### Mobile (iOS Safari)
iOS doesn't support `beforeinstallprompt`. Show manual instructions:

```html
<!-- iOS install instructions (show on iPhone/iPad only) -->
<div id="ios-install-prompt" class="alert alert-info d-none">
  <strong>Install Fireside Capital</strong>
  <ol class="mb-0 mt-2">
    <li>Tap the Share button <i class="bi bi-box-arrow-up"></i></li>
    <li>Select "Add to Home Screen"</li>
  </ol>
</div>

<script>
// Detect iOS Safari
const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator.standalone);

if (isIos && !isInStandaloneMode) {
  document.getElementById('ios-install-prompt').classList.remove('d-none');
}
</script>
```

---

## Testing PWA

### Lighthouse Audit
Run Chrome DevTools Lighthouse audit:
1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Progressive Web App" category
4. Click "Analyze page load"

**Target Score**: 100/100

**Common Issues**:
- ❌ Service worker not registered → Check `/sw.js` exists
- ❌ Manifest not linked → Add `<link rel="manifest">` to HTML
- ❌ Icons missing → Generate all required sizes
- ❌ No HTTPS → PWA requires secure context (except localhost)

### Manual Testing
- [ ] Install app (desktop: Chrome address bar "Install" button)
- [ ] Launch installed app (should open in standalone window)
- [ ] Go offline (DevTools → Network → Offline)
- [ ] Navigate between pages (should work offline)
- [ ] Check charts load (cached data)
- [ ] Add offline action (should queue)
- [ ] Go back online (should sync automatically)

---

## Performance Improvements

### Lazy-Load Non-Critical Pages
```javascript
// In service worker: don't cache all pages upfront
const CRITICAL_PAGES = [
  '/dashboard.html',
  '/assets.html'
];

const LAZY_PAGES = [
  '/bills.html',
  '/budget.html',
  '/debts.html',
  '/income.html',
  '/investments.html',
  '/reports.html',
  '/settings.html'
];

// Cache critical pages on install
event.waitUntil(
  caches.open(CACHE_NAME).then((cache) => {
    return cache.addAll(CRITICAL_PAGES);
  })
);

// Cache lazy pages on first visit (fetch event)
```

### Pre-Cache Next Page
When user hovers over a link, pre-fetch that page:

```javascript
document.querySelectorAll('a[href]').forEach((link) => {
  link.addEventListener('mouseenter', () => {
    const url = link.href;
    if (url.startsWith(window.location.origin)) {
      fetch(url); // Browser will cache it
    }
  });
});
```

---

## Push Notifications (Optional Enhancement)

### Server Setup (Supabase Edge Function)
Send push notifications from Supabase when:
- Payment due in 3 days
- Budget 75% used
- Net worth milestone reached

**Supabase Edge Function** (`send-push-notification`):
```javascript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { subscription, title, body, url } = await req.json()

  const payload = JSON.stringify({ title, body, url })

  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'TTL': '86400' // 24 hours
    },
    body: payload
  })

  return new Response(JSON.stringify({ success: response.ok }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### Client-Side Subscription
```javascript
// Request notification permission
async function subscribeToPushNotifications() {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.log('⚠️ Notification permission denied');
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY' // Generate with web-push library
  });

  // Save subscription to Supabase
  await supabase.from('push_subscriptions').insert({
    user_id: userId,
    subscription: subscription.toJSON()
  });

  console.log('✅ Subscribed to push notifications');
}
```

---

## Implementation Checklist

### Week 1: Core PWA Setup
- [ ] Create `manifest.json` with app metadata
- [ ] Generate app icons (72px - 512px)
- [ ] Link manifest in all HTML files
- [ ] Create `sw.js` with app shell caching
- [ ] Register service worker in `app.js`
- [ ] Test offline functionality (Dashboard page only)

### Week 2: Offline Data Strategy
- [ ] Implement network-first caching for Supabase API
- [ ] Add offline banner UI
- [ ] Set up IndexedDB for action queuing
- [ ] Implement background sync
- [ ] Test offline actions (add transaction, edit budget)

### Week 3: Polish & Testing
- [ ] Add install prompt (desktop + iOS instructions)
- [ ] Generate screenshots for app stores
- [ ] Lighthouse PWA audit (target: 100/100)
- [ ] Cross-browser testing (Chrome, Edge, Safari, Firefox)
- [ ] Mobile testing (iOS Safari, Android Chrome)

---

## Next Steps

1. **Create Task Work Item**: "Set up PWA manifest and service worker"
2. **Create Task Work Item**: "Implement offline data caching with IndexedDB"
3. **Create Task Work Item**: "Add install prompt UI"
4. **Update Documentation**: Add PWA setup guide to `/docs`

---

**Researcher**: Capital (Orchestrator)  
**Ready for Implementation**: Yes ✅
