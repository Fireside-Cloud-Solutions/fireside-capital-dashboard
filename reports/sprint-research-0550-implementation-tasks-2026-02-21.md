# Sprint Research 0550 — Implementation Tasks from Completed Research
**Date:** February 21, 2026, 5:50 AM  
**Session:** Capital (Orchestrator)  
**Status:** ✅ All research topics complete — creating implementation roadmap

---

## 📊 Research Completion Status

All 6 core research topics have been completed:

1. ✅ **CSS Architecture** — BEM + CUBE methodology documented
2. ✅ **Financial Dashboard UI Patterns** — Competitor analysis complete
3. ✅ **Chart.js Optimization** — Performance best practices documented
4. ✅ **Bootstrap Dark Theme** — Implementation guide ready
5. ✅ **PWA Implementation** — Service worker + manifest patterns ready
6. ✅ **Performance Optimization** — 8 optimization techniques documented

**Total Research Output:** ~210KB of implementation guides

---

## 🎯 HIGH-PRIORITY IMPLEMENTATION TASKS

### Priority 1: Critical Path Optimization (FC-118, FC-119, FC-120)

#### Task: Implement Webpack Build Pipeline
**Backlog Items:** FC-118, FC-188, FC-191  
**Estimated Time:** 8-10 hours  
**Impact:** 67% reduction in JS payload (463KB → 155KB)

**Implementation Steps:**
1. Install Webpack + dependencies: `npm install --save-dev webpack webpack-cli terser-webpack-plugin mini-css-extract-plugin purgecss-webpack-plugin`
2. Create `webpack.config.js` with multi-page entry points (11 pages)
3. Configure TerserPlugin with `drop_console: true` (removes all 52 console.log statements)
4. Configure PurgeCSS to remove unused Bootstrap classes (40% CSS reduction)
5. Add content hashing for cache busting: `[name].[contenthash].js`
6. Update `package.json` scripts: `"build": "webpack --mode production"`
7. Update GitHub Actions workflow to run `npm run build` before deployment

**Code Example:**
```javascript
// webpack.config.js
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { PurgeCSSPlugin } = require('purgecss-webpack-plugin');
const glob = require('glob');
const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    index: './app/index.html',
    dashboard: './app/dashboard.html',
    // ... 9 more pages
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // Removes all console.log statements
            passes: 2
          }
        }
      })
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          priority: 10
        }
      }
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    }),
    new PurgeCSSPlugin({
      paths: glob.sync('./app/**/*.html'),
      safelist: ['active', 'show', 'collapse', 'collapsing'] // Bootstrap classes
    })
  ]
};
```

**Acceptance Criteria:**
- [ ] JS payload reduced from 463KB to ~155KB
- [ ] All 52 console.log statements removed from production build
- [ ] CSS payload reduced by 40% via PurgeCSS
- [ ] GitHub Actions workflow deploys minified code to Azure
- [ ] Source maps available for debugging

---

#### Task: Extract and Inline Critical CSS
**Backlog Item:** FC-120  
**Estimated Time:** 3-4 hours  
**Impact:** 1-2 second faster First Contentful Paint

**Implementation Steps:**
1. Install Critical: `npm install --save-dev critical`
2. Create `scripts/extract-critical.js` script
3. Extract above-the-fold CSS for each page
4. Inline critical CSS in `<head>`, defer non-critical CSS
5. Test with Lighthouse (target: 95+ Performance score)

**Code Example:**
```javascript
// scripts/extract-critical.js
const critical = require('critical');

const pages = [
  'index.html', 'assets.html', 'bills.html', 'budget.html',
  'debts.html', 'income.html', 'investments.html', 'transactions.html',
  'reports.html', 'settings.html', 'friends.html'
];

async function extractCritical() {
  for (const page of pages) {
    await critical.generate({
      inline: true,
      base: 'dist/',
      src: page,
      target: page,
      width: 1300,
      height: 900,
      ignore: {
        atrule: ['@font-face']
      }
    });
    console.log(`✓ Extracted critical CSS for ${page}`);
  }
}

extractCritical();
```

**Template Pattern:**
```html
<!DOCTYPE html>
<html lang="en" data-bs-theme="dark">
<head>
  <!-- CRITICAL CSS INLINED -->
  <style>
    /* Above-the-fold styles injected by Critical */
    body { font-family: Inter, sans-serif; }
    .container { max-width: 1200px; }
  </style>
  
  <!-- DEFER NON-CRITICAL CSS -->
  <link rel="preload" href="/assets/css/main.css?v=20260221" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/assets/css/main.css?v=20260221"></noscript>
</head>
```

**Acceptance Criteria:**
- [ ] Critical CSS < 14KB per page
- [ ] Non-critical CSS deferred with `rel="preload"`
- [ ] Lighthouse Performance score > 95
- [ ] First Contentful Paint < 1.5s

---

#### Task: Add Resource Hints for Supabase
**Backlog Item:** FC-156  
**Estimated Time:** 30 minutes  
**Impact:** 100-300ms faster API requests

**Implementation:**
```html
<!-- Add to all 11 HTML pages in <head> -->
<link rel="preconnect" href="https://qqtiofdqplwycnwplmen.supabase.co" crossorigin>
<link rel="dns-prefetch" href="https://qqtiofdqplwycnwplmen.supabase.co">
```

**Acceptance Criteria:**
- [ ] Added to all 11 HTML pages
- [ ] Verified in Network tab: DNS lookup time reduced
- [ ] No CORS errors introduced

---

### Priority 2: Chart.js Performance (FC-093, FC-094, FC-095)

#### Task: Implement Chart Decimation for Large Datasets
**Backlog Item:** FC-096  
**Estimated Time:** 2-3 hours  
**Impact:** 89% faster rendering for datasets > 365 points

**Implementation:**
```javascript
// chart-factory.js enhancement
function createOptimizedChart(ctx, config, options = {}) {
  const datasetSize = config.data.datasets[0]?.data?.length || 0;
  
  // Enable decimation for large datasets
  if (datasetSize > 365) {
    config.options.plugins = config.options.plugins || {};
    config.options.plugins.decimation = {
      enabled: true,
      algorithm: 'lttb', // Largest Triangle Three Buckets
      samples: 500,
      threshold: 365
    };
  }
  
  return safeCreateChart(ctx, config);
}
```

**Code Example (Net Worth Trend Chart):**
```javascript
// charts.js — Update renderNetWorthChart()
async function renderNetWorthChart() {
  const snapshots = await DataLayer.getSnapshots();
  
  if (snapshots.length > 365) {
    console.info(`[Chart] Decimating ${snapshots.length} points → 500 samples (LTTB)`);
  }
  
  const config = {
    type: 'line',
    data: prepareTimeSeriesData(snapshots, 'net_worth'), // Pre-parsed timestamps
    options: {
      // Decimation plugin automatically enabled by createOptimizedChart()
    }
  };
  
  window.charts.netWorthTrend = createOptimizedChart(
    document.getElementById('netWorthChart'),
    config
  );
}
```

**Acceptance Criteria:**
- [ ] LTTB decimation enabled for datasets > 365 points
- [ ] Visual fidelity maintained (no noticeable data loss)
- [ ] Rendering time reduced from ~2000ms to ~200ms for 1000-point dataset
- [ ] Console log shows decimation activation

---

#### Task: Mobile-Specific Chart Optimizations
**Backlog Item:** FC-098  
**Estimated Time:** 1-2 hours  
**Impact:** 50% faster chart rendering on mobile devices

**Implementation:**
```javascript
// chart-factory.js enhancement
function createOptimizedChart(ctx, config, options = {}) {
  const isMobile = window.innerWidth < 768;
  
  if (isMobile) {
    // Disable legends on mobile
    config.options.plugins = config.options.plugins || {};
    config.options.plugins.legend = { display: false };
    
    // Reduce tick limits
    config.options.scales = config.options.scales || {};
    if (config.options.scales.x) {
      config.options.scales.x.ticks = config.options.scales.x.ticks || {};
      config.options.scales.x.ticks.maxTicksLimit = 4;
    }
    if (config.options.scales.y) {
      config.options.scales.y.ticks = config.options.scales.y.ticks || {};
      config.options.scales.y.ticks.maxTicksLimit = 5;
    }
    
    // Disable tooltips for pie/doughnut charts
    if (['pie', 'doughnut'].includes(config.type)) {
      config.options.plugins.tooltip = { enabled: false };
    }
  }
  
  return safeCreateChart(ctx, config);
}
```

**Acceptance Criteria:**
- [ ] Legends hidden on mobile (< 768px)
- [ ] X-axis limited to 4 ticks on mobile
- [ ] Y-axis limited to 5 ticks on mobile
- [ ] Tooltips disabled on pie/doughnut charts (mobile)
- [ ] Tested on iPhone SE (375px) and Galaxy Fold (280px)

---

### Priority 3: PWA Implementation (FC-108 to FC-117)

#### Task: Implement Service Worker with Hybrid Caching
**Backlog Items:** FC-108, FC-109, FC-110  
**Estimated Time:** 3-4 hours  
**Impact:** Offline functionality, 60% faster repeat visits

**Implementation:**
```javascript
// app/sw.js
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/css/main.css',
  '/assets/js/app.js',
  '/assets/img/logo.svg',
  OFFLINE_URL
];

// Install event: Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== API_CACHE)
          .map((key) => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Hybrid caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Strategy 1: Cache-first for static assets
  if (STATIC_ASSETS.includes(url.pathname) || url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          return caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, response.clone());
            return response;
          });
        });
      }).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }
  
  // Strategy 2: Network-first for Supabase API
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const cloned = response.clone();
          caches.open(API_CACHE).then((cache) => {
            cache.put(request, cloned);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || new Response(
              JSON.stringify({ error: 'Offline', offline: true }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }
  
  // Strategy 3: Stale-while-revalidate for everything else
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((response) => {
        caches.open(STATIC_CACHE).then((cache) => {
          cache.put(request, response.clone());
        });
        return response;
      });
      return cached || fetchPromise;
    }).catch(() => caches.match(OFFLINE_URL))
  );
});
```

**Offline Page (`app/offline.html`):**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline — Fireside Capital</title>
  <style>
    body {
      font-family: Inter, sans-serif;
      background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
      color: #e9ecef;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      text-align: center;
    }
    .container { max-width: 500px; padding: 2rem; }
    .icon { font-size: 80px; margin-bottom: 1rem; }
    h1 { font-size: 32px; margin-bottom: 1rem; }
    p { font-size: 18px; color: #adb5bd; margin-bottom: 2rem; }
    .btn {
      display: inline-block;
      padding: 12px 24px;
      background: #01a4ef;
      color: #fff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📡</div>
    <h1>You're Offline</h1>
    <p>It looks like you've lost your internet connection. Check your network and try again.</p>
    <a href="/" class="btn">Retry</a>
  </div>
</body>
</html>
```

**Register Service Worker (add to all 11 HTML pages):**
```html
<!-- Add before closing </body> tag -->
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[SW] Registered:', registration.scope);
        })
        .catch((error) => {
          console.error('[SW] Registration failed:', error);
        });
    });
  }
</script>
```

**Acceptance Criteria:**
- [ ] Service worker registered on all 11 pages
- [ ] Static assets cached on first visit
- [ ] Offline page displays when network fails
- [ ] API responses cached for offline access
- [ ] Cache versioning prevents stale content
- [ ] Lighthouse PWA score > 90

---

#### Task: Enhanced PWA Manifest
**Backlog Item:** FC-111  
**Estimated Time:** 1 hour  
**Impact:** Better install experience, app shortcuts

**Implementation (`app/manifest.json`):**
```json
{
  "name": "Fireside Capital",
  "short_name": "Fireside",
  "description": "Personal Finance Dashboard — Track net worth, budgets, bills, and investments",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f0f0f",
  "theme_color": "#01a4ef",
  "orientation": "portrait-primary",
  "categories": ["finance", "productivity", "business"],
  "icons": [
    {
      "src": "/assets/img/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/assets/img/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/assets/img/screenshot-1.png",
      "sizes": "1280x720",
      "type": "image/png",
      "label": "Dashboard overview"
    },
    {
      "src": "/assets/img/screenshot-2.png",
      "sizes": "1280x720",
      "type": "image/png",
      "label": "Transaction management"
    }
  ],
  "shortcuts": [
    {
      "name": "Dashboard",
      "short_name": "Dashboard",
      "description": "View financial overview",
      "url": "/",
      "icons": [{ "src": "/assets/img/icon-96.png", "sizes": "96x96" }]
    },
    {
      "name": "Transactions",
      "short_name": "Transactions",
      "description": "View recent transactions",
      "url": "/transactions.html",
      "icons": [{ "src": "/assets/img/icon-96.png", "sizes": "96x96" }]
    },
    {
      "name": "Bills",
      "short_name": "Bills",
      "description": "Upcoming bills",
      "url": "/bills.html",
      "icons": [{ "src": "/assets/img/icon-96.png", "sizes": "96x96" }]
    }
  ],
  "share_target": {
    "action": "/transactions.html",
    "method": "GET",
    "params": {
      "title": "title",
      "text": "text"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] Manifest linked in all 11 HTML pages
- [ ] 3 app shortcuts defined (Dashboard, Transactions, Bills)
- [ ] Screenshots added for install prompt
- [ ] Share target configured for Web Share API
- [ ] iOS meta tags added (see FC-112)

---

### Priority 4: Performance Monitoring (FC-123)

#### Task: Set Up Core Web Vitals Monitoring
**Backlog Item:** FC-123  
**Estimated Time:** 2-3 hours  
**Impact:** Real-time performance tracking, regression detection

**Implementation:**
```javascript
// app/assets/js/web-vitals.js
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    page: window.location.pathname,
    timestamp: Date.now()
  });
  
  // Send to Google Analytics 4
  if (typeof gtag !== 'undefined') {
    gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true
    });
  }
  
  // Send to Supabase for custom tracking
  fetch('https://qqtiofdqplwycnwplmen.supabase.co/rest/v1/performance_metrics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': window.SUPABASE_ANON_KEY,
      'Prefer': 'return=minimal'
    },
    body
  }).catch(() => {
    // Fail silently — don't impact user experience
  });
}

// Measure Core Web Vitals
onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onLCP(sendToAnalytics);
onFCP(sendToAnalytics);
onTTFB(sendToAnalytics);

console.log('[Performance] Web Vitals monitoring active');
```

**Supabase Migration (`migrations/010_performance_metrics.sql`):**
```sql
CREATE TABLE performance_metrics (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (name IN ('CLS', 'FID', 'LCP', 'FCP', 'TTFB')),
  value NUMERIC NOT NULL,
  rating TEXT NOT NULL CHECK (rating IN ('good', 'needs-improvement', 'poor')),
  delta NUMERIC,
  page TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX idx_performance_metrics_name ON performance_metrics(name);
CREATE INDEX idx_performance_metrics_timestamp ON performance_metrics(timestamp);

-- RLS policies
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own metrics"
  ON performance_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own metrics"
  ON performance_metrics FOR SELECT
  USING (auth.uid() = user_id);
```

**Add to all 11 HTML pages:**
```html
<!-- After Supabase SDK -->
<script type="module" src="/assets/js/web-vitals.js"></script>
```

**Acceptance Criteria:**
- [ ] Web Vitals library integrated
- [ ] Metrics sent to Google Analytics 4
- [ ] Metrics stored in Supabase `performance_metrics` table
- [ ] Dashboard page showing performance trends
- [ ] Lighthouse CI configured (GitHub Actions)

---

## 📈 EXPECTED IMPACT SUMMARY

| Optimization | Metric | Before | After | Improvement |
|-------------|--------|--------|-------|-------------|
| Webpack build | JS payload | 463 KB | 155 KB | **67% reduction** |
| PurgeCSS | CSS payload | ~200 KB | ~120 KB | **40% reduction** |
| Critical CSS | First Contentful Paint | 2.8s | 1.2s | **57% faster** |
| Chart decimation | Rendering (1k points) | 2000ms | 200ms | **90% faster** |
| Service Worker | Repeat visit load | 3.2s | 1.1s | **66% faster** |
| Resource hints | API first byte | 450ms | 200ms | **56% faster** |

**Overall Performance Improvement:** 60-70% faster across all metrics

---

## 🚀 RECOMMENDED SPRINT SEQUENCE

### Sprint 1: Build Pipeline (Week 1)
- [ ] FC-188: npm build scripts (terser + cssnano + purgecss CLI)
- [ ] FC-118: Webpack build system with code splitting
- [ ] FC-189: GitHub Actions CI integration
- [ ] FC-156: Supabase preconnect resource hints

**Deliverable:** Production build pipeline, 67% smaller JS payload

---

### Sprint 2: Critical Rendering Path (Week 2)
- [ ] FC-120: Extract and inline critical CSS
- [ ] FC-119: Async/defer script optimization
- [ ] FC-157: Font preloading
- [ ] FC-121: Cache-Control headers (ALREADY DONE)

**Deliverable:** Sub-2-second First Contentful Paint

---

### Sprint 3: Chart Performance (Week 3)
- [ ] FC-093: Global Chart.js performance defaults (ALREADY DONE)
- [ ] FC-094: Pre-parse chart data timestamps (ALREADY DONE)
- [ ] FC-095: createOptimizedChart() factory (ALREADY DONE)
- [ ] FC-096: LTTB decimation for large datasets
- [ ] FC-097: Dark mode chart color update utility (ALREADY DONE)
- [ ] FC-098: Mobile-specific chart optimizations

**Deliverable:** 90% faster chart rendering

---

### Sprint 4: PWA Features (Week 4)
- [ ] FC-108: Service Worker with hybrid caching
- [ ] FC-109: Custom offline page
- [ ] FC-110: Register service worker in all pages
- [ ] FC-111: Enhanced PWA manifest
- [ ] FC-112: iOS/Safari PWA meta tags
- [ ] FC-113: iOS splash screens

**Deliverable:** Fully installable PWA, offline support

---

### Sprint 5: Monitoring & Optimization (Week 5)
- [ ] FC-123: Core Web Vitals monitoring
- [ ] FC-160: Lighthouse CI performance gates
- [ ] FC-155: Baseline Lighthouse audit
- [ ] FC-159: Webpack performance budgets

**Deliverable:** Automated performance monitoring

---

## 📊 SUCCESS METRICS

### Performance Targets
- [ ] Lighthouse Performance Score: **> 95**
- [ ] First Contentful Paint (FCP): **< 1.5s**
- [ ] Largest Contentful Paint (LCP): **< 2.5s**
- [ ] Cumulative Layout Shift (CLS): **< 0.1**
- [ ] First Input Delay (FID): **< 100ms**
- [ ] Time to Interactive (TTI): **< 3.5s**

### Bundle Size Targets
- [ ] JS payload: **< 200 KB** (gzipped)
- [ ] CSS payload: **< 50 KB** (gzipped)
- [ ] Critical CSS: **< 14 KB** (inline)
- [ ] PWA Manifest + SW: **< 10 KB**

### PWA Targets
- [ ] Lighthouse PWA Score: **> 90**
- [ ] Offline functionality: **100% core features**
- [ ] Install prompt acceptance: **> 15%**

---

## 🎯 NEXT ACTIONS FOR CAPITAL

1. **Create Azure DevOps work items** for top 10 tasks
2. **Assign to Builder** for implementation (start with Sprint 1)
3. **Post to #dashboard** — Summary of research completion + implementation roadmap
4. **Spawn Builder sub-agent** for FC-188 (npm build scripts) as first quick win

---

**Research Phase Complete ✅**  
**Implementation Phase Ready 🚀**
