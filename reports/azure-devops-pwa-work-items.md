# Azure DevOps Work Items — PWA Implementation
**Created:** February 9, 2026  
**Project:** Fireside Capital  
**Area:** Progressive Web App (PWA)  
**Research:** `reports/SPRINT-RESEARCH-PWA-IMPLEMENTATION-2026-02-09.md`

---

## Work Item 1: PWA Manifest & App Icons

**Type:** Task  
**Priority:** High  
**Effort:** 3 hours  
**Sprint:** Sprint 2  
**Assigned To:** Builder  
**Tags:** pwa, manifest, icons, installability

### Description
Create the web app manifest and generate all required app icons to enable PWA installability on mobile and desktop browsers.

### Acceptance Criteria
- [ ] Generate 8 icon sizes (72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512)
- [ ] Generate 2 maskable icons (192x192, 512x512) with safe zone padding
- [ ] Create `manifest.json` with app metadata (name, description, colors, icons)
- [ ] Add manifest link to all 11 HTML pages: `<link rel="manifest" href="/manifest.json">`
- [ ] Add Apple-specific meta tags for iOS installability
- [ ] Add Microsoft-specific meta tags for Windows
- [ ] Test installability on Chrome desktop
- [ ] Test installability on Chrome mobile (Android)
- [ ] Test installability on Safari mobile (iOS 16.4+)
- [ ] Verify app icon appears correctly on home screen
- [ ] Verify app opens in standalone mode (no browser UI)

### Implementation Notes

#### Step 1: Generate Icons
Run the icon generator script:
```bash
cd C:\Users\chuba\fireside-capital
npm install sharp --save-dev
node scripts/generate-pwa-icons.js
```

**Script location:** `scripts/generate-pwa-icons.js` (provided in research report)

#### Step 2: Create Manifest
**File:** `app/manifest.json`

```json
{
  "name": "Fireside Capital Dashboard",
  "short_name": "Fireside Capital",
  "description": "Personal finance tracking and budgeting dashboard",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0e27",
  "theme_color": "#01a4ef",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "assets/img/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "assets/img/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "assets/img/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "assets/img/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "assets/img/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "assets/img/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "assets/img/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "assets/img/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["finance", "productivity", "business"],
  "shortcuts": [
    {
      "name": "Dashboard",
      "short_name": "Dashboard",
      "description": "View net worth overview",
      "url": "/index.html",
      "icons": [{"src": "assets/img/icons/icon-96x96.png", "sizes": "96x96"}]
    },
    {
      "name": "Bills",
      "short_name": "Bills",
      "description": "View upcoming bills",
      "url": "/bills.html",
      "icons": [{"src": "assets/img/icons/icon-96x96.png", "sizes": "96x96"}]
    }
  ]
}
```

#### Step 3: Update All HTML Pages
Add to `<head>` section of all 11 HTML pages (index, assets, bills, budget, debts, income, investments, reports, settings, transactions, friends):

```html
<!-- PWA Manifest -->
<link rel="manifest" href="/manifest.json">

<!-- Theme color for mobile browsers -->
<meta name="theme-color" content="#01a4ef">
<meta name="theme-color" content="#0a0e27" media="(prefers-color-scheme: dark)">

<!-- Apple-specific meta tags -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Fireside Capital">
<link rel="apple-touch-icon" href="/assets/img/icons/icon-192x192.png">

<!-- MS Application -->
<meta name="msapplication-TileColor" content="#01a4ef">
<meta name="msapplication-TileImage" content="/assets/img/icons/icon-144x144.png">
```

#### Step 4: Deploy & Test
```bash
cd C:\Users\chuba\fireside-capital\app
git add -A
git commit -m "Add PWA manifest and app icons for installability"
git push origin main
```

**Wait for Azure deployment (~2 minutes)**

**Test on live site:**
1. Chrome Desktop: Visit https://nice-cliff-05b13880f.2.azurestaticapps.net
   - DevTools → Application → Manifest → verify loaded
   - Look for install prompt (⊕ icon in address bar)
   - Click "Install" → verify app opens in window
2. Chrome Mobile (Android): Visit site on phone
   - Look for "Add to Home Screen" prompt
   - Install → verify icon on home screen
   - Open app → verify standalone mode (no browser UI)
3. Safari Mobile (iOS): Visit site on iPhone
   - Share → Add to Home Screen
   - Verify icon on home screen
   - Open app → verify standalone mode

### Testing Checklist
- [ ] Lighthouse audit shows "Installable" badge
- [ ] Chrome desktop install prompt appears
- [ ] Chrome mobile install prompt appears
- [ ] Safari iOS "Add to Home Screen" works
- [ ] Installed app opens in standalone mode
- [ ] App icon matches branding (Fireside Capital logo)
- [ ] Theme color applied to mobile browser UI

### Related Research
`reports/SPRINT-RESEARCH-PWA-IMPLEMENTATION-2026-02-09.md` — Sections: "Web App Manifest" and "App Icons Generation"

---

## Work Item 2: Service Worker for Caching & Offline

**Type:** Task  
**Priority:** High  
**Effort:** 5 hours  
**Sprint:** Sprint 2  
**Assigned To:** Builder  
**Tags:** pwa, service-worker, offline, caching

### Description
Implement a service worker to enable offline functionality, cache static assets, and improve repeat page load performance by 88%.

### Acceptance Criteria
- [ ] Create `sw.js` service worker with caching strategies
- [ ] Implement cache-first strategy for static assets (CSS, JS, images)
- [ ] Implement network-first strategy for Supabase API calls
- [ ] Create offline fallback page (`offline.html`)
- [ ] Register service worker on all pages
- [ ] Test offline functionality (disconnect wifi, navigate between pages)
- [ ] Test cache hit on repeat page load (should be < 0.5s)
- [ ] Test service worker update mechanism
- [ ] Verify no console errors

### Implementation Notes

#### Step 1: Create Service Worker
**File:** `app/sw.js`

```javascript
const CACHE_NAME = 'fireside-capital-v1';
const OFFLINE_URL = '/offline.html';

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
  '/offline.html',
  '/assets/css/design-tokens.css',
  '/assets/css/main.css',
  '/assets/js/supabase-client.js',
  '/assets/js/charts.js',
  '/assets/js/theme.js',
  '/assets/img/logo-white.svg',
  '/assets/img/icons/icon-192x192.png',
  '/assets/img/icons/icon-512x512.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// Install event — cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log('[Service Worker] Install complete');
      return self.skipWaiting();
    })
  );
});

// Activate event — clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Activate complete');
      return self.clients.claim();
    })
  );
});

// Fetch event — serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') return;

  // API calls (Supabase) — Network-first with offline fallback
  if (url.hostname === 'qqtiofdqplwycnwplmen.supabase.co') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // Static assets — Cache-first
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });

        return response;
      }).catch(() => {
        if (request.headers.get('accept').includes('text/html')) {
          return caches.match(OFFLINE_URL);
        }
      });
    })
  );
});
```

**Full implementation provided in research report.**

#### Step 2: Create Offline Fallback Page
**File:** `app/offline.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline — Fireside Capital</title>
  <link rel="stylesheet" href="/assets/css/design-tokens.css">
  <style>
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: var(--color-background);
      color: var(--color-text);
      font-family: var(--font-body);
      text-align: center;
      padding: var(--space-6);
    }
    .offline-icon { font-size: 4rem; margin-bottom: var(--space-4); }
    h1 { font-size: 2rem; margin-bottom: var(--space-3); }
    p { font-size: 1.125rem; margin-bottom: var(--space-5); }
    .btn {
      display: inline-block;
      padding: var(--space-3) var(--space-5);
      background: var(--color-primary);
      color: white;
      text-decoration: none;
      border-radius: var(--radius-md);
    }
  </style>
</head>
<body>
  <div>
    <div class="offline-icon">📡</div>
    <h1>You're Offline</h1>
    <p>Your cached data is still available to view.</p>
    <a href="/" class="btn" onclick="window.location.reload(); return false;">Try Again</a>
  </div>
</body>
</html>
```

#### Step 3: Register Service Worker
**File:** `app/assets/js/pwa-init.js`

```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration.scope);
        setInterval(() => registration.update(), 60 * 60 * 1000);
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
}
```

**Add to all HTML pages before closing `</body>`:**
```html
<script src="/assets/js/pwa-init.js"></script>
```

#### Step 4: Configure Azure Static Web Apps
**File:** `app/staticwebapp.config.json`

```json
{
  "routes": [
    {
      "route": "/sw.js",
      "headers": {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Service-Worker-Allowed": "/"
      }
    }
  ]
}
```

#### Step 5: Deploy & Test
```bash
cd C:\Users\chuba\fireside-capital\app
git add -A
git commit -m "Add service worker for offline functionality and caching"
git push origin main
```

**Test on live site:**
1. Visit https://nice-cliff-05b13880f.2.azurestaticapps.net
2. Open DevTools → Application → Service Workers → verify "activated and running"
3. Open DevTools → Application → Cache Storage → verify cached assets
4. Enable "Offline" in DevTools Network tab
5. Navigate between pages → should load from cache
6. Try to visit uncached page → should show offline.html
7. Disable offline mode → verify pages fetch fresh data

### Testing Checklist
- [ ] Service worker registers successfully
- [ ] Static assets cached on first visit
- [ ] Repeat page load < 0.5s (cache hit)
- [ ] Offline navigation works between cached pages
- [ ] Offline fallback page appears for uncached URLs
- [ ] API calls work when online
- [ ] API calls fall back to cache when offline
- [ ] Service worker updates when cache version changes
- [ ] No console errors

### Performance Validation
**Before:** Second page load ~2.5s  
**After:** Second page load < 0.5s (cache hit)  
**Target:** 88% faster repeat loads ✅

### Related Research
`reports/SPRINT-RESEARCH-PWA-IMPLEMENTATION-2026-02-09.md` — Section: "Service Worker Strategy"

---

## Work Item 3: Offline Transaction Queue (IndexedDB)

**Type:** Task  
**Priority:** Medium  
**Effort:** 4 hours  
**Sprint:** Sprint 3  
**Assigned To:** Builder  
**Tags:** pwa, offline, indexeddb, background-sync

### Description
Implement an offline transaction queue using IndexedDB to allow users to add transactions while offline, then automatically sync to Supabase when back online.

### Acceptance Criteria
- [ ] Create IndexedDB database (`fireside-capital-offline`)
- [ ] Create object store for pending transactions
- [ ] Queue transactions when offline
- [ ] Display UI indicator showing pending transaction count
- [ ] Auto-sync queued transactions when back online
- [ ] Register background sync (if supported)
- [ ] Test offline → add transaction → reconnect → verify auto-sync
- [ ] Handle sync errors gracefully

### Implementation Notes

**File:** `app/assets/js/offline-queue.js`

```javascript
const DB_NAME = 'fireside-capital-offline';
const DB_VERSION = 1;
const STORE_NAME = 'pending-transactions';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

export async function queueTransaction(transaction) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  
  transaction.queuedAt = new Date().toISOString();
  transaction.synced = false;
  
  await store.add(transaction);
  console.log('📥 Transaction queued:', transaction);
  
  if ('serviceWorker' in navigator && 'sync' in navigator.serviceWorker) {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register('sync-transactions');
  }
  
  return true;
}

export async function syncPendingTransactions() {
  if (!navigator.onLine) return;
  
  const pending = await getPendingTransactions();
  if (pending.length === 0) return;
  
  console.log(`🔄 Syncing ${pending.length} pending transactions...`);
  
  for (const transaction of pending) {
    try {
      const response = await fetch('https://qqtiofdqplwycnwplmen.supabase.co/rest/v1/transactions', {
        method: 'POST',
        headers: {
          'apikey': 'ANON_KEY',
          'Authorization': 'Bearer ANON_KEY',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transaction)
      });
      
      if (response.ok) {
        transaction.synced = true;
        console.log(`✅ Synced: ${transaction.description}`);
      }
    } catch (error) {
      console.error(`❌ Sync error:`, error);
    }
  }
}

window.addEventListener('online', syncPendingTransactions);
```

**Full implementation provided in research report.**

### Testing Checklist
- [ ] IndexedDB database created
- [ ] Transaction queued when offline
- [ ] UI indicator shows "1 pending"
- [ ] Reconnect triggers auto-sync
- [ ] Pending count updates after sync
- [ ] Error handling works for failed syncs

### Related Research
`reports/SPRINT-RESEARCH-PWA-IMPLEMENTATION-2026-02-09.md` — Section: "Background Sync for Offline Transactions"

---

## Work Item 4: Push Notifications for Bill Reminders

**Type:** Task  
**Priority:** Medium  
**Effort:** 4 hours  
**Sprint:** Sprint 3  
**Assigned To:** Builder  
**Tags:** pwa, notifications, push-api, bills

### Description
Implement local push notifications to remind users of upcoming bills 3-7 days before they're due.

### Acceptance Criteria
- [ ] Request notification permission on first load
- [ ] Check for upcoming bills (due in 3-7 days)
- [ ] Send local notification for each upcoming bill
- [ ] Notification click opens bills page
- [ ] Test notification on Chrome desktop
- [ ] Test notification on Chrome mobile
- [ ] Test notification on Safari mobile (iOS 16.4+)
- [ ] Notifications respect browser permission settings

### Implementation Notes

**File:** `app/assets/js/push-notifications.js`

```javascript
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('❌ Browser does not support notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') return true;
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}

export function sendLocalNotification(title, body, options = {}) {
  if (Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        body,
        icon: '/assets/img/icons/icon-192x192.png',
        badge: '/assets/img/icons/badge-72x72.png',
        ...options
      });
    });
  }
}

// In bills.js — check for upcoming bills
async function checkUpcomingBills() {
  const bills = await supabase
    .from('bills')
    .select('*')
    .gte('due_date', new Date().toISOString())
    .lte('due_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());
  
  for (const bill of bills.data) {
    const daysUntilDue = Math.ceil((new Date(bill.due_date) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue <= 3) {
      sendLocalNotification(
        '💰 Bill Reminder',
        `${bill.name} is due in ${daysUntilDue} days — $${bill.amount}`,
        { tag: `bill-${bill.id}`, requireInteraction: true }
      );
    }
  }
}
```

**Full implementation provided in research report.**

### Testing Checklist
- [ ] Permission request appears on first visit
- [ ] Notifications sent for bills due in 3 days
- [ ] Notification click opens bills page
- [ ] Chrome desktop notifications work
- [ ] Chrome mobile notifications work
- [ ] Safari iOS notifications work (16.4+)
- [ ] No notifications sent if permission denied

### Related Research
`reports/SPRINT-RESEARCH-PWA-IMPLEMENTATION-2026-02-09.md` — Section: "Push Notifications for Bill Reminders"

---

## Deployment & Validation

### Lighthouse PWA Audit (Target: 90+)
```bash
# Run in Chrome DevTools
1. Open DevTools → Lighthouse tab
2. Select "Progressive Web App" category
3. Click "Generate report"
4. Target: 90+ score
```

**Key Criteria:**
- ✅ Installable
- ✅ Service worker registered
- ✅ HTTPS enabled
- ✅ Responsive viewport
- ✅ Themed address bar
- ✅ Offline fallback
- ✅ 192x192 and 512x512 icons

### Browser Testing Matrix

| Feature | Chrome | Edge | Safari | Firefox |
|---------|--------|------|--------|---------|
| Manifest | ✅ Test | ✅ Test | ✅ Test (16.4+) | ⚠️ Partial |
| Service Worker | ✅ Test | ✅ Test | ✅ Test | ✅ Test |
| Installability | ✅ Test | ✅ Test | ✅ Test | ❌ No |
| Push Notifications | ✅ Test | ✅ Test | ✅ Test (16.4+) | ✅ Test |
| Background Sync | ✅ Test | ✅ Test | ❌ No | ❌ No |

---

## Manual Creation in Azure DevOps

### Instructions
1. Navigate to: https://dev.azure.com/fireside365/Fireside%20Capital/_workitems
2. Click **New Work Item** → **Task**
3. For each work item above:
   - Copy title
   - Copy description + acceptance criteria
   - Set **Priority** (1 = High, 2 = Medium)
   - Set **Original Estimate** (hours)
   - Set **Assigned To:** Builder
   - Add **Tags:** pwa, manifest, icons, etc.
   - Click **Save**

### Estimated Timeline
- **Work Item 1:** 3 hours (PWA Manifest)
- **Work Item 2:** 5 hours (Service Worker)
- **Work Item 3:** 4 hours (Offline Queue)
- **Work Item 4:** 4 hours (Push Notifications)

**Total:** 16 hours across Sprint 2-3

---

**Status:** Ready for manual creation in Azure DevOps  
**Total Effort:** 16 hours across 4 tasks  
**Expected Impact:** Installable app, 88% faster repeat loads, offline functionality, bill reminders  
**Browser Support:** 95%+ global coverage
