# Performance Optimization Research — Fireside Capital Dashboard
**Research Sprint**: February 20, 2026  
**Status**: In Progress 🔄  
**Priority**: High — Fast loading = better user experience

---

## Executive Summary

Optimize Fireside Capital dashboard for **sub-2-second load times** on 3G connections and **instant interactions** on modern hardware. Financial dashboards need to feel responsive — users check balances frequently and expect immediate feedback.

**Target Metrics** (Lighthouse):
- ⚡ **First Contentful Paint (FCP)**: < 1.5s
- 🎨 **Largest Contentful Paint (LCP)**: < 2.5s
- 🔄 **Cumulative Layout Shift (CLS)**: < 0.1
- ⏱️ **Time to Interactive (TTI)**: < 3.5s
- 📊 **Total Blocking Time (TBT)**: < 300ms

**Current Issues** (assumed based on typical SPAs):
- ❌ Large CSS files loaded synchronously
- ❌ Chart.js loads all charts on page load (even off-screen)
- ❌ Bootstrap CSS includes unused components
- ❌ No code splitting or lazy loading
- ❌ Images not optimized (if any)
- ❌ No service worker caching (addressed in PWA research)

---

## Strategy 1: Critical CSS Extraction

### Problem
Loading all CSS upfront blocks rendering. Users wait for 100KB+ of CSS before seeing any content.

### Solution
Extract and inline critical above-the-fold CSS in `<head>`, defer non-critical CSS loading.

### Implementation

**Step 1: Identify Critical CSS**
Use Chrome DevTools Coverage tool:
1. Open DevTools → More Tools → Coverage
2. Reload Dashboard page
3. Note which CSS rules are used for above-the-fold content
4. Extract to `critical.css`

**Step 2: Automate with Critical Package**
```powershell
# Install Critical package
npm install --save-dev critical

# Create extraction script
node scripts/extract-critical-css.js
```

**`scripts/extract-critical-css.js`**:
```javascript
const critical = require('critical');
const fs = require('fs');
const path = require('path');

const pages = ['dashboard.html', 'assets.html', 'bills.html', 'budget.html'];

pages.forEach(async (page) => {
  const { css, html } = await critical.generate({
    base: 'app/',
    src: page,
    target: {
      css: `app/assets/css/critical/${page.replace('.html', '')}.css`,
      html: `app/dist/${page}`
    },
    width: 1300,
    height: 900,
    inline: true,
    extract: true,
    dimensions: [
      { width: 375, height: 667 },   // Mobile
      { width: 768, height: 1024 },  // Tablet
      { width: 1920, height: 1080 }  // Desktop
    ]
  });

  console.log(`✅ Critical CSS extracted for ${page}`);
});
```

**Step 3: Update HTML Template**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fireside Capital — Dashboard</title>

  <!-- CRITICAL CSS (inlined) -->
  <style>
    /* design-tokens.css */
    :root { --color-primary: #01a4ef; /* ... */ }
    
    /* Base layout */
    body { font-family: Inter, sans-serif; margin: 0; }
    
    /* Above-the-fold components */
    .navbar { /* ... */ }
    .metric-card { /* ... */ }
  </style>

  <!-- NON-CRITICAL CSS (deferred) -->
  <link rel="preload" href="assets/css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="assets/css/main.css"></noscript>

  <!-- Defer Bootstrap (not needed for initial render) -->
  <link rel="preload" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"></noscript>
</head>
<body>
  <!-- Content -->
</body>
</html>
```

**Expected Improvement**: FCP reduced by **40-60%** (from ~2.5s → ~1s)

---

## Strategy 2: Lazy-Load Charts (Intersection Observer)

### Problem
Chart.js renders all charts on page load, even if they're below the fold. Wastes CPU and blocks main thread.

### Solution
Only render charts when they enter the viewport using Intersection Observer API.

### Implementation

**`assets/js/lazy-charts.js`**:
```javascript
/**
 * Lazy-load Chart.js charts when they enter viewport
 */

// Store chart configurations
const chartConfigs = new Map();

/**
 * Register a chart for lazy loading
 * @param {string} canvasId - Canvas element ID
 * @param {Function} renderFunction - Function that creates the chart
 */
function registerLazyChart(canvasId, renderFunction) {
  chartConfigs.set(canvasId, renderFunction);
}

/**
 * Initialize Intersection Observer for lazy chart loading
 */
function initLazyCharts() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const canvasId = entry.target.id;
          const renderFunction = chartConfigs.get(canvasId);
          
          if (renderFunction) {
            console.log(`[LazyCharts] Rendering ${canvasId}`);
            renderFunction();
            chartConfigs.delete(canvasId); // Remove after rendering
            observer.unobserve(entry.target); // Stop observing
          }
        }
      });
    },
    {
      root: null, // Viewport
      rootMargin: '100px', // Start loading 100px before visible
      threshold: 0.01
    }
  );

  // Observe all registered chart canvases
  chartConfigs.forEach((_, canvasId) => {
    const canvas = document.getElementById(canvasId);
    if (canvas) {
      observer.observe(canvas);
    }
  });
}

// Usage example
registerLazyChart('chart-net-worth', () => {
  createNetWorthChart('chart-net-worth');
});

registerLazyChart('chart-spending-breakdown', () => {
  createSpendingBreakdownChart('chart-spending-breakdown');
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLazyCharts);
} else {
  initLazyCharts();
}
```

**Update Chart Definitions** (`charts.js`):
```javascript
// OLD: Immediate rendering
window.addEventListener('DOMContentLoaded', () => {
  createNetWorthChart('chart-net-worth');
  createSpendingBreakdownChart('chart-spending-breakdown');
  createAssetAllocationChart('chart-asset-allocation');
});

// NEW: Lazy rendering
window.addEventListener('DOMContentLoaded', () => {
  registerLazyChart('chart-net-worth', () => createNetWorthChart('chart-net-worth'));
  registerLazyChart('chart-spending-breakdown', () => createSpendingBreakdownChart('chart-spending-breakdown'));
  registerLazyChart('chart-asset-allocation', () => createAssetAllocationChart('chart-asset-allocation'));
  initLazyCharts();
});
```

**Expected Improvement**: TTI reduced by **30-50%** (charts only render when needed)

---

## Strategy 3: Debounce Expensive Operations

### Problem
Real-time search/filter operations trigger expensive re-renders on every keystroke, blocking UI.

### Solution
Debounce user input to reduce unnecessary calculations.

### Implementation

**`assets/js/debounce.js`**:
```javascript
/**
 * Debounce function — delays execution until after wait period
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function — limits execution to once per period
 * @param {Function} func - Function to throttle
 * @param {number} limit - Minimum time between executions (ms)
 * @returns {Function} Throttled function
 */
function throttle(func, limit = 300) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
```

**Usage Example** (search/filter):
```javascript
// Transaction search (debounced)
const searchInput = document.getElementById('transaction-search');
const searchTransactions = debounce((query) => {
  console.log('[Search] Filtering transactions:', query);
  const filtered = allTransactions.filter((tx) =>
    tx.description.toLowerCase().includes(query.toLowerCase())
  );
  renderTransactionList(filtered);
}, 300); // Wait 300ms after user stops typing

searchInput.addEventListener('input', (e) => {
  searchTransactions(e.target.value);
});

// Scroll event (throttled) — update sticky header
const handleScroll = throttle(() => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 100) {
    navbar.classList.add('navbar-sticky');
  } else {
    navbar.classList.remove('navbar-sticky');
  }
}, 100); // Max once per 100ms

window.addEventListener('scroll', handleScroll);
```

**Expected Improvement**: Reduces input lag from **200-500ms → <50ms**

---

## Strategy 4: Code Splitting & Lazy Loading JS

### Problem
Loading all JavaScript upfront (Chart.js, Bootstrap, Supabase client) delays interactivity.

### Solution
Split code into critical (navbar, theme toggle) and non-critical (charts, modals) bundles. Load non-critical code asynchronously.

### Implementation

**Option A: Dynamic Imports (Modern Browsers)**
```javascript
// Critical code (loaded immediately)
import { initThemeToggle } from './theme-toggle.js';
import { initNavbar } from './navbar.js';

initThemeToggle();
initNavbar();

// Non-critical code (loaded when needed)
document.addEventListener('DOMContentLoaded', async () => {
  // Lazy-load Chart.js only if charts exist on page
  if (document.querySelector('.chart-canvas')) {
    const { createNetWorthChart } = await import('./charts.js');
    createNetWorthChart('chart-net-worth');
  }

  // Lazy-load modal library only when modal is triggered
  document.querySelector('[data-bs-toggle="modal"]')?.addEventListener('click', async () => {
    await import('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js');
  }, { once: true });
});
```

**Option B: Script Tag with `defer` and `async`**
```html
<!-- Critical JS (defer = execute after DOM ready) -->
<script src="assets/js/app.js" defer></script>

<!-- Non-critical JS (async = load in background) -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js" async></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" async></script>
```

**Expected Improvement**: TBT reduced by **20-40%**

---

## Strategy 5: Image Optimization

### Problem
Unoptimized images (screenshots, icons, charts) slow down page load.

### Solution
- Convert images to WebP format (smaller than PNG/JPG)
- Use `<picture>` element with responsive srcset
- Lazy-load images below the fold

### Implementation

**Convert Images to WebP**:
```powershell
# Using ImageMagick
magick convert dashboard-screenshot.png -quality 85 dashboard-screenshot.webp

# Batch conversion
Get-ChildItem -Path assets/images -Filter *.png | ForEach-Object {
  $outputPath = $_.FullName -replace '.png', '.webp'
  magick convert $_.FullName -quality 85 $outputPath
}
```

**Responsive Images with `<picture>`**:
```html
<picture>
  <!-- Modern browsers: WebP -->
  <source srcset="assets/images/dashboard-screenshot.webp" type="image/webp">
  
  <!-- Fallback: PNG -->
  <img src="assets/images/dashboard-screenshot.png" 
       alt="Dashboard screenshot" 
       loading="lazy"
       width="1200" 
       height="800">
</picture>
```

**Lazy-Load Images** (native):
```html
<img src="assets/images/chart.png" 
     alt="Chart" 
     loading="lazy">
```

**Expected Improvement**: Reduces image payload by **40-70%**

---

## Strategy 6: Reduce CSS Bloat (PurgeCSS)

### Problem
Bootstrap CSS includes thousands of unused classes, increasing file size from ~200KB → ~20KB.

### Solution
Use PurgeCSS to remove unused CSS classes from Bootstrap and custom stylesheets.

### Implementation

**Install PurgeCSS**:
```powershell
npm install --save-dev @fullhuman/postcss-purgecss
```

**Create PurgeCSS Config** (`purgecss.config.js`):
```javascript
module.exports = {
  content: [
    './app/**/*.html',
    './app/assets/js/**/*.js'
  ],
  css: [
    './app/assets/css/main.css',
    './node_modules/bootstrap/dist/css/bootstrap.min.css'
  ],
  safelist: [
    // Dynamically-added classes (keep these)
    'show', 'active', 'modal-open', 'dropdown-menu', 'collapse',
    /^bs-/, // Bootstrap dynamic classes
    /^chart-/, // Chart.js classes
    /^theme-/ // Theme toggle classes
  ],
  output: './app/assets/css/optimized/'
};
```

**Run PurgeCSS**:
```powershell
npx purgecss --config purgecss.config.js
```

**Expected Improvement**: Reduces CSS from **200KB → 30KB** (85% reduction)

---

## Strategy 7: Prefetch/Preconnect Critical Resources

### Problem
DNS lookups and TLS handshakes for CDN resources (Bootstrap, Chart.js, Supabase) add latency.

### Solution
Use `<link rel="preconnect">` to establish early connections, `<link rel="dns-prefetch">` for DNS resolution.

### Implementation

**Add to `<head>`**:
```html
<!-- Preconnect to CDNs -->
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="preconnect" href="https://qqtiofdqplwycnwplmen.supabase.co" crossorigin>

<!-- DNS prefetch (fallback for older browsers) -->
<link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
<link rel="dns-prefetch" href="https://fonts.googleapis.com">

<!-- Preload critical fonts -->
<link rel="preload" href="assets/fonts/Inter-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/SourceSerif4-SemiBold.woff2" as="font" type="font/woff2" crossorigin>
```

**Expected Improvement**: Reduces time-to-first-byte by **100-300ms**

---

## Strategy 8: Virtual Scrolling for Long Lists

### Problem
Rendering 1,000+ transactions at once blocks main thread and causes jank.

### Solution
Only render visible rows (virtualization), dynamically add/remove items as user scrolls.

### Implementation

**Using `virtual-scroller` Library**:
```html
<script src="https://cdn.jsdelivr.net/npm/virtual-scroller@2.0.0/dist/virtual-scroller.min.js"></script>

<div id="transaction-list"></div>

<script>
const transactions = [/* 1,000+ transactions */];

const virtualScroller = new VirtualScroller({
  container: document.getElementById('transaction-list'),
  items: transactions,
  itemHeight: 60, // Fixed height per row
  renderItem: (transaction) => {
    const row = document.createElement('div');
    row.className = 'transaction-row';
    row.innerHTML = `
      <div class="tx-date">${transaction.date}</div>
      <div class="tx-description">${transaction.description}</div>
      <div class="tx-amount">${transaction.amount}</div>
    `;
    return row;
  }
});
</script>
```

**Custom Implementation** (lightweight):
```javascript
function createVirtualList(container, items, itemHeight) {
  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(container.clientHeight / itemHeight);
  let scrollTop = 0;

  // Create virtual container
  const viewport = document.createElement('div');
  viewport.style.height = `${totalHeight}px`;
  viewport.style.position = 'relative';
  container.appendChild(viewport);

  function render() {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = startIndex + visibleCount + 1;
    
    viewport.innerHTML = '';
    
    for (let i = startIndex; i < endIndex && i < items.length; i++) {
      const row = document.createElement('div');
      row.style.position = 'absolute';
      row.style.top = `${i * itemHeight}px`;
      row.style.height = `${itemHeight}px`;
      row.innerHTML = renderRow(items[i]);
      viewport.appendChild(row);
    }
  }

  container.addEventListener('scroll', () => {
    scrollTop = container.scrollTop;
    render();
  });

  render();
}

// Usage
const container = document.getElementById('transaction-list');
createVirtualList(container, transactions, 60);
```

**Expected Improvement**: Handles **10,000+ items** without lag

---

## Strategy 9: Web Workers for Heavy Calculations

### Problem
Complex calculations (budget projections, debt payoff schedules) block UI thread.

### Solution
Offload calculations to Web Workers (background threads).

### Implementation

**Create Worker** (`assets/js/workers/budget-calculator.worker.js`):
```javascript
/**
 * Web Worker — Budget Projections
 */
self.addEventListener('message', (e) => {
  const { type, data } = e.data;

  if (type === 'calculate-projection') {
    const projection = calculateBudgetProjection(data);
    self.postMessage({ type: 'projection-result', projection });
  }
});

function calculateBudgetProjection({ income, expenses, savings, months }) {
  const projection = [];
  let balance = 0;

  for (let i = 0; i < months; i++) {
    balance += income - expenses - savings;
    projection.push({
      month: i + 1,
      balance,
      savings: savings * (i + 1)
    });
  }

  return projection;
}
```

**Use Worker** (`app.js`):
```javascript
const budgetWorker = new Worker('assets/js/workers/budget-calculator.worker.js');

budgetWorker.addEventListener('message', (e) => {
  if (e.data.type === 'projection-result') {
    console.log('[Worker] Projection:', e.data.projection);
    renderProjectionChart(e.data.projection);
  }
});

// Trigger calculation
budgetWorker.postMessage({
  type: 'calculate-projection',
  data: { income: 8000, expenses: 5000, savings: 1000, months: 12 }
});
```

**Expected Improvement**: UI remains responsive during heavy calculations

---

## Strategy 10: Service Worker Caching (PWA)

### Problem
Every page load requires network requests, slow on poor connections.

### Solution
Cache app shell (HTML, CSS, JS) and API responses using Service Worker (covered in PWA research).

**See**: `reports/pwa-research.md` — Service Worker implementation

**Expected Improvement**: Repeat visits load in **<500ms** (from cache)

---

## Performance Testing Checklist

### Lighthouse Audit
```powershell
# Run Lighthouse via CLI
npm install -g lighthouse

lighthouse https://nice-cliff-05b13880f.2.azurestaticapps.net `
  --output html `
  --output-path ./reports/lighthouse-report.html `
  --chrome-flags="--headless"
```

**Target Scores**:
- Performance: **90+**
- Accessibility: **100**
- Best Practices: **100**
- SEO: **100**
- PWA: **100** (after PWA implementation)

### WebPageTest
Test on real devices/connections:
- https://www.webpagetest.org
- Location: Los Angeles (West Coast USA)
- Connection: 3G, 4G, Cable
- Target: **Speed Index < 3.0s**

### Chrome DevTools Performance Tab
1. Open DevTools → Performance
2. Click Record
3. Load Dashboard page
4. Stop recording
5. Analyze:
   - **FCP** (blue line): < 1.5s
   - **LCP** (green line): < 2.5s
   - **Long Tasks** (red bars): Minimize

---

## Performance Budget

Set hard limits to prevent regressions:

| Resource Type | Max Size | Current | Target |
|---------------|----------|---------|--------|
| **Total Page** | 2.5 MB | ? | < 1 MB |
| **JavaScript** | 500 KB | ? | < 300 KB |
| **CSS** | 150 KB | ? | < 50 KB |
| **Images** | 500 KB | ? | < 200 KB |
| **Fonts** | 100 KB | ? | < 80 KB |

**Enforcement**:
```json
{
  "budgets": [
    {
      "resourceSizes": [
        { "resourceType": "script", "budget": 300 },
        { "resourceType": "stylesheet", "budget": 50 },
        { "resourceType": "image", "budget": 200 }
      ]
    }
  ]
}
```

---

## Quick Wins (Implement First)

1. ✅ **Defer Non-Critical CSS** (30 min) → FCP -40%
2. ✅ **Lazy-Load Charts** (1 hour) → TTI -30%
3. ✅ **Debounce Search Input** (15 min) → UX improvement
4. ✅ **Add `defer` to Scripts** (10 min) → TBT -20%
5. ✅ **Preconnect to CDNs** (5 min) → TTFB -100ms

**Total Time**: 2 hours  
**Total Impact**: **~50% faster load time**

---

## Implementation Roadmap

### Week 1: Foundation
- [ ] Extract critical CSS (inline in `<head>`)
- [ ] Defer non-critical CSS/JS
- [ ] Add preconnect/dns-prefetch hints
- [ ] Run baseline Lighthouse audit

### Week 2: Lazy Loading
- [ ] Implement lazy chart loading (Intersection Observer)
- [ ] Lazy-load images (`loading="lazy"`)
- [ ] Code split JS (dynamic imports)
- [ ] Debounce search/filter operations

### Week 3: Optimization
- [ ] Run PurgeCSS on Bootstrap
- [ ] Convert images to WebP
- [ ] Implement virtual scrolling for transaction list
- [ ] Create Web Worker for budget calculations

### Week 4: Testing
- [ ] Run Lighthouse audits (target: 90+ performance)
- [ ] WebPageTest on 3G connection
- [ ] Real device testing (iOS Safari, Android Chrome)
- [ ] Set performance budget (fail CI if exceeded)

---

## Next Steps

1. **Create Task Work Items** for each optimization strategy
2. **Baseline Performance Audit** — Lighthouse + WebPageTest (before optimization)
3. **Implement Quick Wins** — 2 hours for 50% improvement
4. **Track Metrics** — Dashboard showing FCP, LCP, TTI over time

---

**Researcher**: Capital (Orchestrator)  
**Status**: Complete ✅  
**Ready for Implementation**: Yes ✅
