# Sprint Research Findings — February 15, 2026

**Research Session:** CSS Architecture, Financial UI Patterns, Chart.js, PWA, Performance  
**Researcher:** Capital (Orchestrator)  
**Date:** Sunday, February 15, 2026 @ 5:30 AM EST

---

## Executive Summary

The Fireside Capital dashboard has a **solid technical foundation** with well-architected CSS, proper design tokens, and Chart.js integration. Three high-priority improvements identified:

1. **PWA Service Worker** (P1) — Add offline support and app-like experience
2. **Chart Lazy Loading** (P1) — Improve page load performance with IntersectionObserver
3. **Stat Card Micro-Trends** (P2) — Enhance UX with contextual trend indicators

---

## Current State Assessment

### ✅ Strengths

#### CSS Architecture
- **design-tokens.css** — Comprehensive design system with:
  - Logo-native brand colors (orange/blue/green hierarchy)
  - Consistent 8px spacing grid
  - Semantic color system
  - Typography scale
  - Shadows, transitions, z-index
- **main.css** — Component styles with UX polish (January 2025 update)
- **utilities.css** — Reusable classes (chart heights, icons, visibility)
- **responsive.css** — Mobile-first breakpoints with touch targets

**Verdict:** CSS architecture is production-ready. No immediate changes needed.

#### Chart.js Integration
- `chart-theme.js` syncs design tokens with Chart.js defaults
- Financial formatting (currency tooltips/axes)
- Performance defaults (parsing disabled, animations off)
- Responsive height utilities
- Custom color palette for financial data

**Verdict:** Well implemented. Minor optimizations recommended (decimation, lazy loading).

#### Bootstrap Dark Theme
- Custom CSS variable overrides working well
- Consistent with design tokens
- Responsive to viewport changes

**Verdict:** Solid. No changes needed unless light mode toggle is added.

### ⚠️ Gaps Identified

#### PWA Implementation
**Status:** Partial
- ✅ `manifest.json` exists with proper metadata
- ❌ No service worker (missing offline support)
- ❌ No install prompt
- ❌ No cached assets

**Impact:** App requires internet connection for every page load. Slower repeat visits.

#### Performance
**Status:** Needs optimization
- `app.js` = 217KB (large bundle)
- Multiple external CDN calls (Bootstrap, Chart.js, fonts)
- No lazy loading for charts
- No code splitting

**Impact:** Slower initial page load, especially on mobile networks.

---

## Research Findings

### 1. Financial Dashboard UI Patterns

**Best Practices from Industry Leaders (Mint, YNAB, Personal Capital):**

#### Stat Card Hierarchy
```
┌─────────────────────────┐
│ LABEL (small, muted)    │
│ $152,340 (large, bold)  │ ← Primary value
│ ↑ +$8,420 (5.9%)       │ ← Trend indicator
│ vs. last month          │ ← Context
└─────────────────────────┘
```

**Implementation Example:**
```html
<div class="dashboard-card">
  <h5>Net Worth</h5>
  <p class="stat-value">$152,340</p>
  <div class="stat-trend">
    <span class="trend-indicator text-success">
      <i class="bi bi-arrow-up"></i> +$8,420 (5.9%)
    </span>
    <small class="trend-label text-muted">vs. last month</small>
  </div>
</div>
```

**CSS:**
```css
.stat-trend {
  margin-top: 8px;
  min-height: 40px;
}

.trend-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}

.trend-label {
  font-size: 12px;
  color: var(--color-text-tertiary);
  margin-top: 4px;
  opacity: 0.8;
}
```

#### Color Semantics
- **Green** — Positive (income, gains, net worth increase)
- **Red** — Negative (expenses, losses, net worth decrease)
- **Blue** — Neutral (info, actions, secondary data)
- **Orange** — Primary CTAs (add, edit, save)

**Current Status:** ✅ Already implemented via design tokens

#### Data Density
- **Desktop:** 3-5 stat cards per row
- **Tablet:** 2-3 cards per row
- **Mobile:** 1 card per row (stack vertically)

**Current Status:** ✅ Responsive grid working well

---

### 2. Chart.js Optimization

#### Current Implementation
- Charts load all data at once
- No decimation (all data points rendered)
- Animations disabled (good for performance)
- Parsing disabled (good for performance)

#### Recommendation: Add Decimation for Large Datasets

For **Reports** page with 365+ days of data:

```js
// charts.js — add to net worth trend chart
const netWorthConfig = {
  type: 'line',
  data: { /* ... */ },
  options: {
    // ... existing options
    plugins: {
      decimation: {
        enabled: true,
        algorithm: 'lttb', // Largest-Triangle-Three-Buckets (smoothest)
        samples: 50 // Downsample to 50 points
      }
    }
  }
};
```

**Impact:**
- 365 data points → 50 points (87% reduction)
- Faster rendering
- Smoother pan/zoom
- Still visually accurate

**When to use:**
- Reports page (1+ years of daily data)
- Any chart with >100 data points

**When NOT to use:**
- Dashboard (7-30 day views)
- Small datasets (<50 points)

---

### 3. PWA Implementation

#### What's Missing
1. Service worker for offline caching
2. Install prompt for "Add to Home Screen"
3. Cached static assets (CSS, JS, fonts)

#### Recommended Service Worker

**File:** `service-worker.js` (root directory)

```js
const CACHE_NAME = 'fireside-capital-v1';
const STATIC_ASSETS = [
  '/',
  '/assets/css/design-tokens.css',
  '/assets/css/main.css',
  '/assets/css/components.css',
  '/assets/css/responsive.css',
  '/assets/css/utilities.css',
  '/assets/js/app.js',
  '/assets/js/chart-theme.js',
  '/assets/js/charts.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install: cache static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Fetch: serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip Supabase API calls (always fetch fresh financial data)
  if (event.request.url.includes('supabase.co')) {
    return event.respondWith(fetch(event.request));
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        console.log('[SW] Serving from cache:', event.request.url);
        return response;
      }
      
      console.log('[SW] Fetching from network:', event.request.url);
      return fetch(event.request).then(networkResponse => {
        // Cache new assets for future use
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      });
    })
  );
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => {
          console.log('[SW] Deleting old cache:', key);
          return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});
```

**Register in `app.js` (after Supabase auth check):**

```js
// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('✅ Service Worker registered:', registration.scope);
      })
      .catch(error => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
}
```

**Benefits:**
- Offline fallback (show cached UI if no internet)
- Faster repeat visits (assets loaded from cache)
- App-like experience (no white screen on load)
- "Add to Home Screen" prompt (mobile)

**Privacy Note:** Financial data (Supabase API calls) is NEVER cached. Only static assets (CSS, JS, fonts).

---

### 4. Performance Audit

#### Bundle Size Analysis

| File | Size | Notes |
|------|------|-------|
| `app.js` | 217KB | Large — consider code splitting |
| `charts.js` | 33KB | Reasonable |
| `chart-theme.js` | 6KB | Good |
| `app-polish-enhancements.js` | 9KB | Good |
| `categorizer.js` | 5KB | Good |

**Total JS:** ~280KB (uncompressed)

#### Recommendations

##### A. Lazy Load Charts (Priority: High)

Only load charts when they scroll into view:

```js
// charts.js — add to bottom of file
const chartObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const canvas = entry.target;
      const chartType = canvas.dataset.chartType;
      
      // Load chart data and render
      if (chartType === 'networth') {
        loadNetWorthChart(canvas);
      } else if (chartType === 'spending') {
        loadSpendingChart(canvas);
      }
      // ... other chart types
      
      chartObserver.unobserve(canvas);
    }
  });
}, { 
  rootMargin: '100px' // Start loading 100px before visible
});

// Observe all chart canvases
document.querySelectorAll('.chart-wrapper canvas').forEach(canvas => {
  if (canvas.dataset.chartType) {
    chartObserver.observe(canvas);
  }
});
```

**Add to HTML canvases:**
```html
<canvas id="netWorthChart" data-chart-type="networth"></canvas>
```

**Impact:**
- Dashboard loads 3-4 charts instead of 8+
- Faster initial render
- Lower memory usage

##### B. Preload Critical Resources (Priority: Medium)

Add to `<head>` of all pages:

```html
<!-- Preload critical CSS -->
<link rel="preload" href="assets/css/design-tokens.css" as="style">
<link rel="preload" href="assets/css/main.css" as="style">

<!-- Preload critical JS -->
<link rel="preload" href="assets/js/app.js" as="script">

<!-- Preconnect to CDNs -->
<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

**Impact:**
- Browser starts downloading critical files sooner
- Faster time-to-interactive (TTI)

##### C. Code Splitting (Priority: Low)

Split `app.js` into:
- `core.js` — Auth, navigation, notifications (load on all pages)
- `dashboard.js` — Dashboard-specific charts and logic
- `reports.js` — Reports page only
- `budget.js` — Budget page only

**Example:**
```html
<!-- dashboard.html -->
<script src="assets/js/core.js"></script>
<script src="assets/js/dashboard.js"></script>

<!-- reports.html -->
<script src="assets/js/core.js"></script>
<script src="assets/js/reports.js"></script>
```

**Impact:**
- Smaller initial bundle (core.js ~ 100KB vs 217KB)
- Faster page-specific loads

**Effort:** 8-16 hours (medium complexity)

---

## Recommended Task Work Items

### For Azure DevOps

#### 1. Add Micro-Trends to Dashboard Stat Cards
- **Priority:** P2 (Medium)
- **Effort:** 2 hours
- **Tags:** `ui-enhancement`, `dashboard`
- **Description:** Add trend indicators (e.g., "↑ +$8,420 (5.9%) vs. last month") below stat values on dashboard cards. Improves contextual awareness without adding new sections.
- **Acceptance Criteria:**
  - Trend indicator visible on all dashboard stat cards
  - Shows direction (up/down arrow), absolute change, percentage change
  - Color-coded (green = positive, red = negative)
  - Responsive on mobile (stacks properly)

---

#### 2. Implement Service Worker for PWA Offline Support
- **Priority:** P1 (High)
- **Effort:** 4 hours
- **Tags:** `pwa`, `performance`
- **Description:** Add service worker to cache static assets (CSS, JS, fonts) for offline access. Improves repeat visit performance and enables "Add to Home Screen" functionality.
- **Acceptance Criteria:**
  - `service-worker.js` created and registered in `app.js`
  - Static assets cached on first visit
  - Offline fallback shows cached UI (with notice if disconnected)
  - Financial data (Supabase calls) NEVER cached
  - Browser console logs service worker registration

---

#### 3. Lazy Load Charts with IntersectionObserver
- **Priority:** P1 (High)
- **Effort:** 3 hours
- **Tags:** `performance`, `charts`
- **Description:** Use IntersectionObserver API to only render charts when they scroll into view. Reduces initial page load time and memory usage.
- **Acceptance Criteria:**
  - Charts on dashboard, reports, and other pages load on-demand
  - No visible delay when scrolling to charts
  - Charts render within 100ms of entering viewport
  - Memory usage reduced on pages with 5+ charts

---

#### 4. Add Chart.js Decimation for Reports Page
- **Priority:** P2 (Medium)
- **Effort:** 1 hour
- **Tags:** `performance`, `charts`
- **Description:** Enable Chart.js decimation plugin on reports page to downsample large datasets (365+ days) to 50-100 points. Improves rendering performance without visual quality loss.
- **Acceptance Criteria:**
  - Decimation enabled on net worth trend chart (reports page)
  - Dataset reduced from 365 points to 50 points
  - Chart still visually accurate (no jagged lines)
  - Pan/zoom performance improved

---

#### 5. Performance Audit — Code Splitting Analysis
- **Priority:** P3 (Low)
- **Effort:** 8 hours
- **Tags:** `performance`, `architecture`
- **Description:** Analyze `app.js` bundle and create plan for splitting into page-specific modules (core, dashboard, reports, budget). Document dependency tree and migration strategy.
- **Deliverables:**
  - Dependency map of `app.js` (what functions are used on which pages)
  - Proposed module structure (`core.js`, `dashboard.js`, etc.)
  - Migration plan with effort estimates
  - Performance impact analysis (estimated bundle size reduction)

---

## Next Sprint Focus

### Top Priorities (Immediate Action)
1. ✅ **PWA Service Worker** — Add offline support and faster repeat visits
2. ✅ **Chart Lazy Loading** — Improve page load performance
3. ✅ **Stat Card Micro-Trends** — Better UX with contextual data

### Future Research Topics
- **Accessibility Audit** — WCAG 2.1 AA compliance check (focus states, screen readers, keyboard navigation)
- **Mobile Gestures** — Swipe navigation between pages (native app feel)
- **Dark/Light Theme Toggle** — User preference setting (localStorage + CSS variables)
- **Transaction Categorization ML** — Auto-categorize transactions using simple keyword matching or basic ML

---

## Conclusion

The Fireside Capital dashboard has a **strong technical foundation**. CSS architecture, Chart.js integration, and Bootstrap theming are all production-ready. The three high-priority improvements (PWA service worker, chart lazy loading, stat card trends) will significantly enhance user experience and performance without major architectural changes.

**Estimated Total Effort:** 10 hours (P1 tasks only)  
**Impact:** Faster page loads, offline support, better contextual awareness

**Status:** Research complete. Ready for task assignment and implementation.

---

**Researcher:** Capital (Orchestrator)  
**Date:** Sunday, February 15, 2026 @ 5:30 AM EST  
**Next Check:** Sunday, February 15, 2026 @ 6:30 AM
