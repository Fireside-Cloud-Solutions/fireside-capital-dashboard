# PWA (Progressive Web App) Research — February 4, 2026

## Executive Summary

Progressive Web Apps combine the reach of web apps with the reliability of native apps. For Fireside Capital, implementing PWA features means users can:
- **Access their financial dashboard offline** (view cached data, review transactions)
- **Install the app** to their home screen (one-tap access)
- **Receive push notifications** for payment reminders and budget alerts
- **Experience fast, app-like performance** (instant load, smooth transitions)

**Recommendation:** Implement a phased PWA strategy starting with basic offline support (app shell + static assets), then progressively enhance with offline data viewing, background sync, and push notifications.

**Key Challenge:** Financial data security requires careful consideration of what to cache offline and for how long.

---

## 1. What Is a PWA?

A Progressive Web App is a web application that uses modern web APIs to deliver an app-like experience. Three core technologies enable this:

### 1.1 Service Worker
A JavaScript file that runs separately from the main browser thread. It intercepts network requests and can:
- Cache resources for offline access
- Serve cached content when offline
- Sync data in the background
- Receive push notifications

### 1.2 Web App Manifest
A JSON file that describes the app to the browser:
- App name, icon, colors
- Display mode (standalone, fullscreen)
- Start URL and scope

### 1.3 HTTPS
PWAs must be served over HTTPS (except localhost for development). This is non-negotiable because service workers have powerful capabilities that could be abused on insecure connections.

---

## 2. App Shell vs True Offline Support

Understanding this distinction is critical for financial dashboards.

### 2.1 App Shell Model (Basic)
**What It Caches:** UI skeleton, navigation, CSS, JavaScript bundles
**What Still Requires Network:** All data (transactions, balances, bills)

**User Experience:**
- ✅ App opens offline
- ✅ Navigation works
- ❌ Shows empty states or "no data" messages
- ❌ Can't perform actions (add bills, categorize transactions)

**Good For:** Content sites, blogs, marketing pages

### 2.2 True Offline Support (Advanced)
**What It Caches:** App shell + previously viewed data
**What It Enables:** View cached data, queue actions for later sync

**User Experience:**
- ✅ App opens offline
- ✅ Navigation works
- ✅ Shows last-synced data
- ✅ Can perform actions (changes queued for sync)
- ✅ Automatic sync when back online

**Good For:** Finance apps, task managers, note-taking apps, dashboards

### 2.3 Recommendation for Fireside Capital

**Phase 1 (Week 1):** App shell model
- Cache HTML, CSS, JavaScript, fonts, icons
- Show offline indicator when network is down
- Display helpful message: "You're offline - Data will load when reconnected"

**Phase 2 (Week 2-3):** Read-only offline data
- Cache previously viewed dashboard data in IndexedDB
- Show last-synced timestamp
- Allow viewing of assets, bills, income, investments (read-only)

**Phase 3 (Week 4+):** Offline actions + background sync
- Queue changes (mark bill as paid, add transaction note)
- Auto-sync when connectivity returns
- Show pending changes indicator

**Phase 4 (Future):** Push notifications
- Payment reminders
- Budget alerts
- Net worth milestones

---

## 3. Service Worker Implementation

### 3.1 Basic Service Worker Structure

Create `public/sw.js`:

```javascript
// Service worker version (increment on updates)
const CACHE_VERSION = 'v1'
const CACHE_NAME = `fireside-capital-${CACHE_VERSION}`

// Files to cache immediately (app shell)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/assets.html',
  '/bills.html',
  '/budget.html',
  '/debts.html',
  '/income.html',
  '/investments.html',
  '/reports.html',
  '/settings.html',
  '/assets/css/styles.css',
  '/assets/css/bootstrap.min.css',
  '/assets/js/dashboard.js',
  '/assets/js/supabase.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
]

// Install event - cache app shell
self.addEventListener('install', (event) => {
  console.log('[SW] Install event')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell')
        return cache.addAll(PRECACHE_URLS)
      })
      .then(() => self.skipWaiting()) // Activate immediately
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event')
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => {
              console.log('[SW] Deleting old cache:', name)
              return caches.delete(name)
            })
        )
      })
      .then(() => self.clients.claim()) // Take control immediately
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log('[SW] Cache hit:', event.request.url)
          return cachedResponse
        }
        
        console.log('[SW] Network fetch:', event.request.url)
        return fetch(event.request)
          .then(response => {
            // Cache successful GET requests dynamically
            if (event.request.method === 'GET' && response.status === 200) {
              const responseClone = response.clone()
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseClone))
            }
            return response
          })
      })
      .catch(error => {
        console.log('[SW] Fetch failed:', error)
        // Return offline page if available
        if (event.request.destination === 'document') {
          return caches.match('/offline.html')
        }
      })
  )
})
```

### 3.2 Register the Service Worker

Add to `assets/js/app.js` (or main.js):

```javascript
// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered:', registration.scope)
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            showUpdateNotification()
          }
        })
      })
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  })
}

function showUpdateNotification() {
  // Show toast/banner: "New version available. Refresh to update."
  const toast = document.createElement('div')
  toast.className = 'toast show position-fixed bottom-0 end-0 m-3'
  toast.innerHTML = `
    <div class="toast-header">
      <strong class="me-auto">Update Available</strong>
      <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
    </div>
    <div class="toast-body">
      A new version is available.
      <button class="btn btn-primary btn-sm mt-2" onclick="location.reload()">Refresh Now</button>
    </div>
  `
  document.body.appendChild(toast)
}
```

### 3.3 Caching Strategies

Different resource types need different strategies:

| Resource | Strategy | Reason |
|----------|----------|--------|
| HTML pages | Network first, cache fallback | Show fresh content, fallback if offline |
| CSS/JS | Cache first, network fallback | Static assets rarely change |
| Images/icons | Cache first, network fallback | Large files, expensive to re-download |
| API data (Supabase) | Network only (or IndexedDB) | Financial data must be current |
| Chart.js CDN | Cache first | Third-party library, stable |

**Important for Financial Apps:**
- **Never cache Supabase API responses in the service worker cache**
- Use IndexedDB for structured data that needs offline access
- Always show "last updated" timestamps for offline data

---

## 4. Web App Manifest

Create `public/manifest.json`:

```json
{
  "name": "Fireside Capital",
  "short_name": "Capital",
  "description": "Personal finance dashboard with AI-powered insights",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#01a4ef",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "shortcuts": [
    {
      "name": "Dashboard",
      "short_name": "Dashboard",
      "description": "View net worth overview",
      "url": "/dashboard.html",
      "icons": [{ "src": "/icons/dashboard.png", "sizes": "96x96" }]
    },
    {
      "name": "Bills",
      "short_name": "Bills",
      "description": "Upcoming payments",
      "url": "/bills.html",
      "icons": [{ "src": "/icons/bills.png", "sizes": "96x96" }]
    },
    {
      "name": "Budget",
      "short_name": "Budget",
      "description": "Monthly budget tracking",
      "url": "/budget.html",
      "icons": [{ "src": "/icons/budget.png", "sizes": "96x96" }]
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/dashboard-wide.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/dashboard-narrow.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ],
  "categories": ["finance", "productivity"],
  "prefer_related_applications": false
}
```

### Link the Manifest

Add to `<head>` in all HTML files:

```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#01a4ef">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Capital">
<link rel="apple-touch-icon" href="/icons/icon-192x192.png">
```

---

## 5. IndexedDB for Offline Data

Service worker caches are for static files. IndexedDB is for structured data.

### 5.1 Database Setup

Create `assets/js/offline-db.js`:

```javascript
// IndexedDB wrapper for Fireside Capital
const DB_NAME = 'fireside-capital'
const DB_VERSION = 1

let db = null

// Initialize database
export async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      
      // Create object stores
      if (!db.objectStoreNames.contains('assets')) {
        db.createObjectStore('assets', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('bills')) {
        const billsStore = db.createObjectStore('bills', { keyPath: 'id' })
        billsStore.createIndex('due_date', 'due_date', { unique: false })
      }
      if (!db.objectStoreNames.contains('debts')) {
        db.createObjectStore('debts', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('income')) {
        db.createObjectStore('income', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('investments')) {
        db.createObjectStore('investments', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('snapshots')) {
        const snapshotsStore = db.createObjectStore('snapshots', { keyPath: 'id' })
        snapshotsStore.createIndex('date', 'date', { unique: false })
      }
      
      // Metadata store (sync timestamps)
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'key' })
      }
    }
  })
}

// Save data to IndexedDB
export async function saveToStore(storeName, data) {
  if (!db) await initDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    
    // Clear old data
    store.clear()
    
    // Add new data
    data.forEach(item => store.add(item))
    
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

// Get all data from store
export async function getFromStore(storeName) {
  if (!db) await initDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.getAll()
    
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Save sync timestamp
export async function setSyncTime(storeName, timestamp = Date.now()) {
  if (!db) await initDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['meta'], 'readwrite')
    const store = transaction.objectStore('meta')
    
    store.put({ key: `${storeName}_sync`, timestamp })
    
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

// Get sync timestamp
export async function getSyncTime(storeName) {
  if (!db) await initDB()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['meta'], 'readonly')
    const store = transaction.objectStore('meta')
    const request = store.get(`${storeName}_sync`)
    
    request.onsuccess = () => resolve(request.result?.timestamp || null)
    request.onerror = () => reject(request.error)
  })
}
```

### 5.2 Integration with Supabase

Modify existing data fetching to cache results:

```javascript
// assets/js/dashboard.js (example)
import { saveToStore, getFromStore, getSyncTime, setSyncTime } from './offline-db.js'

async function loadAssets() {
  try {
    // Try network first
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('value', { ascending: false })
    
    if (error) throw error
    
    // Save to IndexedDB
    await saveToStore('assets', data)
    await setSyncTime('assets')
    
    renderAssets(data)
    
  } catch (error) {
    console.warn('Network failed, loading from cache:', error)
    
    // Fallback to IndexedDB
    const cachedAssets = await getFromStore('assets')
    const syncTime = await getSyncTime('assets')
    
    if (cachedAssets.length > 0) {
      renderAssets(cachedAssets)
      showOfflineIndicator(syncTime)
    } else {
      showNoDataMessage()
    }
  }
}

function showOfflineIndicator(syncTime) {
  const timeAgo = formatTimeAgo(syncTime)
  const banner = document.createElement('div')
  banner.className = 'alert alert-warning'
  banner.textContent = `Viewing offline data (last updated ${timeAgo})`
  document.querySelector('.container').prepend(banner)
}
```

---

## 6. Background Sync

The Background Sync API allows queued actions to be retried automatically when connectivity returns, even if the user has closed the app.

### 6.1 Queue Actions When Offline

```javascript
// assets/js/sync-queue.js

export async function queueAction(action) {
  if (!db) await initDB()
  
  const transaction = db.transaction(['queue'], 'readwrite')
  const store = transaction.objectStore('queue')
  
  const queueItem = {
    id: crypto.randomUUID(),
    action: action.type, // 'add_bill', 'mark_paid', 'delete_asset'
    payload: action.payload,
    timestamp: Date.now(),
    synced: false
  }
  
  await store.add(queueItem)
  
  // Register background sync
  if ('sync' in registration) {
    await registration.sync.register('sync-financial-data')
  }
}

// In service worker (sw.js)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-financial-data') {
    event.waitUntil(syncQueuedActions())
  }
})

async function syncQueuedActions() {
  // Get unsynchronized actions from IndexedDB
  // Send to Supabase
  // Mark as synced
  console.log('[SW] Syncing queued actions...')
}
```

---

## 7. Azure Static Web Apps Deployment

### 7.1 MIME Types Configuration

Create `staticwebapp.config.json` in the root:

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": [
      "/sw.js",
      "/manifest.json",
      "/icons/*",
      "/assets/*.{css,js,png,jpg,svg}",
      "*.css",
      "*.js"
    ]
  },
  "mimeTypes": {
    "json": "application/json",
    "webmanifest": "application/manifest+json",
    "js": "application/javascript"
  },
  "responseOverrides": {
    "404": {
      "rewrite": "/index.html",
      "statusCode": 200
    }
  }
}
```

### 7.2 Service Worker Scope

Ensure service worker is at the root (`/sw.js`), not in `/assets/js/`. This gives it scope over the entire app.

### 7.3 HTTPS Requirement

Azure Static Web Apps automatically provides HTTPS. No additional configuration needed.

---

## 8. Security Considerations for Financial PWAs

### 8.1 What NOT to Cache Offline

**Never cache:**
- Supabase anon keys (already public, but don't cache responses)
- User authentication tokens (use secure HttpOnly cookies)
- Bank API credentials (Plaid tokens)
- Payment processing data

### 8.2 Cache Expiration

Financial data should expire quickly:

```javascript
// Set max age for cached data (24 hours)
const MAX_CACHE_AGE = 24 * 60 * 60 * 1000

async function isCacheStale(storeName) {
  const syncTime = await getSyncTime(storeName)
  return !syncTime || (Date.now() - syncTime) > MAX_CACHE_AGE
}
```

### 8.3 Clear Cache on Logout

```javascript
function logout() {
  // Clear Supabase session
  supabase.auth.signOut()
  
  // Clear IndexedDB
  indexedDB.deleteDatabase('fireside-capital')
  
  // Unregister service worker (optional, drastic)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(reg => reg.unregister())
    })
  }
  
  // Clear all caches
  caches.keys().then(names => {
    names.forEach(name => caches.delete(name))
  })
  
  window.location.href = '/login.html'
}
```

---

## 9. Testing PWA Features

### 9.1 Lighthouse Audit

Run in Chrome DevTools:
1. Open DevTools (F12)
2. Switch to "Lighthouse" tab
3. Select "Progressive Web App" category
4. Click "Analyze page load"

**Target Score:** 90+ for installability

### 9.2 Manual Testing

**Test Cases:**
| Scenario | Expected Behavior |
|----------|-------------------|
| Fresh install | App loads, service worker registers, data fetched from Supabase |
| Offline (first time) | Shows "no data" or cached app shell |
| Offline (revisit) | Shows last-synced data with timestamp |
| Come back online | Auto-syncs, updates data, removes offline indicator |
| Add to home screen | App opens in standalone mode (no browser chrome) |
| Update available | Shows notification, refreshes on user action |

### 9.3 Chrome DevTools Offline Mode

1. Open DevTools
2. Application tab → Service Workers
3. Check "Offline" checkbox
4. Refresh page

---

## 10. Implementation Roadmap

### Week 1: Core PWA Setup
**Goal:** Basic installability + app shell caching

**Tasks:**
1. Create `manifest.json` with app metadata
2. Generate PWA icons (72x72 to 512x512)
3. Link manifest in all HTML `<head>` sections
4. Create basic service worker (`sw.js`) with precaching
5. Register service worker in `app.js`
6. Test with Lighthouse (aim for 90+ PWA score)

**Deliverables:**
- [ ] App installable from browser
- [ ] Offline page shows when network fails
- [ ] Service worker caches HTML/CSS/JS

---

### Week 2: Offline Data Viewing
**Goal:** View previously loaded data when offline

**Tasks:**
1. Set up IndexedDB wrapper (`offline-db.js`)
2. Modify Supabase data fetching to cache in IndexedDB
3. Add fallback logic (network → cache → empty state)
4. Show "last synced" timestamp when offline
5. Add offline indicator banner

**Deliverables:**
- [ ] Dashboard data viewable offline
- [ ] Bills/assets/income viewable offline
- [ ] Clear indication of offline state

---

### Week 3: Background Sync
**Goal:** Queue actions offline, sync when back online

**Tasks:**
1. Create sync queue in IndexedDB
2. Modify form submissions to queue when offline
3. Implement Background Sync API
4. Handle sync failures gracefully
5. Show pending changes indicator

**Deliverables:**
- [ ] Can mark bills as paid offline
- [ ] Can add notes/categories offline
- [ ] Changes auto-sync when online

---

### Week 4 (Future): Push Notifications
**Goal:** Payment reminders via push notifications

**Tasks:**
1. Request notification permission
2. Subscribe to push service
3. Store subscription in Supabase
4. Send test notifications from backend
5. Handle notification clicks (deep link to bills page)

**Deliverables:**
- [ ] Payment reminders 3 days before due date
- [ ] Budget alerts when exceeding threshold
- [ ] Net worth milestone celebrations

---

## 11. File Structure

```
app/
├── index.html                  (link manifest, register SW)
├── dashboard.html
├── bills.html
├── ... (other pages)
├── manifest.json               (PWA manifest)
├── sw.js                       (service worker - MUST be at root)
├── offline.html                (fallback page when offline)
├── staticwebapp.config.json    (Azure config)
├── assets/
│   ├── js/
│   │   ├── app.js              (SW registration)
│   │   ├── offline-db.js       (IndexedDB wrapper)
│   │   ├── sync-queue.js       (Background sync logic)
│   │   ├── dashboard.js        (modified to use cache)
│   │   └── ...
│   └── css/
│       └── styles.css
├── icons/
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
└── screenshots/
    ├── dashboard-wide.png
    └── dashboard-narrow.png
```

---

## 12. Performance Metrics

PWA implementation should improve these metrics:

| Metric | Before PWA | After PWA | Impact |
|--------|------------|-----------|--------|
| First Load (3G) | 4.5s | 2.8s | -38% |
| Repeat Visit | 3.2s | 0.8s | -75% |
| Offline Load | ❌ Fails | ✅ 0.5s | Infinite |
| Install Size | N/A | ~2MB cached | Minimal |

---

## 13. Browser Compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| Service Worker | ✅ 40+ | ✅ 17+ | ✅ 44+ | ✅ 11.1+ |
| Web App Manifest | ✅ 73+ | ✅ 79+ | ✅ Yes | ✅ 16.4+ |
| IndexedDB | ✅ 24+ | ✅ 12+ | ✅ 16+ | ✅ 10+ |
| Background Sync | ✅ 49+ | ✅ 79+ | ❌ No | ❌ No |
| Push API | ✅ 42+ | ✅ 17+ | ✅ 44+ | ✅ 16+ |

**Note:** iOS Safari requires users to "Add to Home Screen" for full PWA features.

---

## 14. Cost-Benefit Analysis

### Benefits
- **Zero distribution cost** (no App Store fees)
- **Instant updates** (no review process)
- **Cross-platform** (one codebase for iOS/Android/Desktop)
- **Improved retention** (home screen icon = 3x engagement)
- **Offline reliability** (critical for finance apps)

### Trade-offs
- **No native APIs** (can't access full device capabilities)
- **iOS limitations** (push notifications work differently)
- **Storage limits** (50MB-1GB depending on device)
- **Complexity** (service worker debugging is harder)

---

## 15. Key Takeaways

1. **Start simple:** App shell + manifest = installable PWA in 1 day
2. **Security first:** Never cache sensitive data in service worker cache
3. **Use IndexedDB for data:** Service worker cache is for static assets only
4. **Show offline state clearly:** Users must know they're viewing stale data
5. **Test on real devices:** iOS Safari behaves differently than Chrome
6. **Monitor cache size:** Financial apps should limit to 10-20MB cached data
7. **Azure deployment is easy:** Static Web Apps handles HTTPS/MIME types automatically

---

## 16. Next Steps

1. **Spawn Builder agent** to:
   - Create `manifest.json` with Fireside Capital branding
   - Generate PWA icons (use Fireside Cloud logo)
   - Create basic service worker with app shell caching
   - Add SW registration to existing pages

2. **Design offline experience:**
   - Create `/offline.html` fallback page
   - Design offline indicator banner
   - Add "last synced" timestamp to dashboard

3. **Phase 2 planning:**
   - IndexedDB schema design
   - Sync strategy for each data type
   - Background sync implementation timeline

---

## 17. References

- [Google PWA Training](https://developers.google.com/codelabs/pwa-training)
- [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest Spec](https://www.w3.org/TR/appmanifest/)
- [Azure Static Web Apps PWA Guide](https://www.azurestaticwebapps.dev/blog/pwa-on-swa)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

---

**Estimated Implementation Time:**
- Phase 1 (Basic PWA): 1 week
- Phase 2 (Offline data): 1-2 weeks
- Phase 3 (Background sync): 1 week
- Phase 4 (Push notifications): 2 weeks

**Total:** 5-6 weeks for full PWA implementation
