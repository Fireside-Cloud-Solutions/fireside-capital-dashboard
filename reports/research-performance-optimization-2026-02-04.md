# Performance Optimization Research — February 4, 2026

## Executive Summary

Performance directly impacts user engagement and trust, especially for financial dashboards where users expect instant access to their data. Fireside Capital should target:
- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 3.5s
- **Cumulative Layout Shift (CLS):** < 0.1

**Current State:** Vanilla JS + Bootstrap + Chart.js CDN (estimated ~4-5s initial load on 3G)

**Recommendation:** Implement a multi-layered optimization strategy targeting frontend assets, database queries, and caching. Expected improvement: **40-60% faster page loads** with minimal code changes.

---

## 1. Performance Audit Framework

### 1.1 Core Web Vitals

Google's Core Web Vitals measure user experience:

| Metric | What It Measures | Good | Needs Work | Poor |
|--------|------------------|------|------------|------|
| **LCP** (Largest Contentful Paint) | Main content visibility | < 2.5s | 2.5-4s | > 4s |
| **FID** (First Input Delay) | Interactivity responsiveness | < 100ms | 100-300ms | > 300ms |
| **CLS** (Cumulative Layout Shift) | Visual stability | < 0.1 | 0.1-0.25 | > 0.25 |
| **FCP** (First Contentful Paint) | First visible content | < 1.8s | 1.8-3s | > 3s |
| **TTI** (Time to Interactive) | Page fully interactive | < 3.8s | 3.8-7.3s | > 7.3s |

### 1.2 Measuring Current Performance

**Chrome DevTools Lighthouse:**
```bash
# Run in Chrome DevTools
1. Open DevTools (F12)
2. Switch to "Lighthouse" tab
3. Select "Performance" category
4. Click "Analyze page load"
```

**WebPageTest (for detailed metrics):**
```
URL: https://nice-cliff-05b13880f.2.azurestaticapps.net
Location: Dulles, VA (typical East Coast user)
Connection: 4G LTE
```

**Key Metrics to Track:**
- Time to First Byte (TTFB)
- DOM Content Loaded
- Total Page Size
- Number of Requests
- Render-Blocking Resources

---

## 2. Frontend Asset Optimization

### 2.1 Minimize CSS/JS Bundle Size

**Current Issues:**
- Bootstrap 5.3.0 full CSS: ~200KB (minified)
- Chart.js CDN: ~250KB (full build)
- Custom styles: Unknown size

**Optimization Strategy:**

#### A. PurgeCSS for Bootstrap

Remove unused Bootstrap styles:

```javascript
// Install PurgeCSS
npm install -D @fullhuman/postcss-purgecss

// postcss.config.js
module.exports = {
  plugins: [
    require('@fullhuman/postcss-purgecss')({
      content: [
        './app/**/*.html',
        './app/**/*.js'
      ],
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
      safelist: [
        'show', 'active', 'dropdown-menu', 'collapse', 'collapsing',
        /^toast/, /^modal/, /^btn-/, /^alert-/, /^card-/
      ]
    })
  ]
}
```

**Expected Savings:** ~60% reduction (Bootstrap 200KB → 80KB)

#### B. Tree-Shaking Chart.js

Use only needed modules:

```javascript
// Before (full CDN build)
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

// After (custom build with only what you need)
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
} from 'chart.js'

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
)
```

**Expected Savings:** ~40% reduction (Chart.js 250KB → 150KB)

#### C. Minification + Compression

```javascript
// Build script (package.json)
{
  "scripts": {
    "build:css": "postcss assets/css/styles.css -o assets/css/styles.min.css",
    "build:js": "terser assets/js/*.js --compress --mangle -o assets/js/bundle.min.js"
  }
}
```

Enable gzip/brotli compression on Azure Static Web Apps (automatic).

**Expected Savings:** ~70% smaller files over network

---

### 2.2 Lazy Loading & Code Splitting

#### A. Defer Non-Critical JavaScript

```html
<!-- Critical (loads immediately) -->
<script src="/assets/js/app.js"></script>

<!-- Non-critical (deferred) -->
<script src="/assets/js/charts.js" defer></script>
<script src="/assets/js/reports.js" defer></script>

<!-- Below-the-fold (lazy loaded) -->
<script>
  if ('IntersectionObserver' in window) {
    const chartContainer = document.getElementById('net-worth-chart')
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadChartJS()
        observer.disconnect()
      }
    })
    observer.observe(chartContainer)
  } else {
    loadChartJS() // Fallback for old browsers
  }
</script>
```

#### B. Dynamic Imports for Charts

```javascript
// Load Chart.js only when needed
async function initializeChart(canvasId, data) {
  if (!window.Chart) {
    const { Chart } = await import('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/+esm')
    window.Chart = Chart
  }
  
  return new Chart(canvasId, data)
}
```

**Impact:** ~1.5s faster initial page load (Chart.js loads async)

---

### 2.3 Image Optimization

#### A. Responsive Images

```html
<!-- Before -->
<img src="/assets/img/logo.png" alt="Fireside Capital">

<!-- After (responsive + WebP) -->
<picture>
  <source srcset="/assets/img/logo.webp" type="image/webp">
  <source srcset="/assets/img/logo.png" type="image/png">
  <img src="/assets/img/logo.png" 
       alt="Fireside Capital"
       width="200" 
       height="50"
       loading="lazy">
</picture>
```

#### B. Convert to WebP

```bash
# Install cwebp
npm install -g cwebp

# Convert images
cwebp -q 80 logo.png -o logo.webp
```

**Savings:** ~25-35% smaller than PNG/JPEG

---

### 2.4 Font Optimization

#### A. Preload Critical Fonts

```html
<head>
  <!-- Preload Source Serif 4 (headings) -->
  <link rel="preload" 
        href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@600;700&display=swap" 
        as="style"
        onload="this.onload=null;this.rel='stylesheet'">
  
  <!-- Fallback for no JS -->
  <noscript>
    <link rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@600;700&display=swap">
  </noscript>
</head>
```

#### B. Use System Fonts as Fallback

```css
body {
  font-family: 
    'Inter', 
    -apple-system, 
    BlinkMacSystemFont, 
    'Segoe UI', 
    'Roboto', 
    'Oxygen', 
    'Ubuntu', 
    'Cantarell', 
    sans-serif;
  font-display: swap; /* Show fallback immediately */
}
```

**Impact:** Eliminates FOUT (Flash of Unstyled Text)

---

## 3. Database Query Optimization

### 3.1 Current Supabase Schema Analysis

```sql
-- Existing tables (from TOOLS.md)
assets (id, name, type, value, loan_amount, equity, user_id, created_at)
investments (id, account_name, type, balance, contributions, returns, user_id, created_at)
debts (id, name, type, balance, interest_rate, monthly_payment, term_months, user_id, created_at)
bills (id, name, amount, due_date, frequency, category, paid, user_id, created_at)
income (id, source, type, amount, frequency, user_id, created_at)
snapshots (id, date, net_worth, assets_total, debts_total, user_id, created_at)
budgets (id, category, allocated_amount, spent_amount, month, year, user_id, created_at)
settings (id, user_id, emergency_fund_goal, created_at, updated_at)
```

### 3.2 Add Missing Indexes

Most Supabase queries filter by `user_id`. Ensure indexes exist:

```sql
-- Check existing indexes
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON debts(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);
CREATE INDEX IF NOT EXISTS idx_income_user_id ON income(user_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_user_id ON snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);

-- Composite index for common dashboard query
CREATE INDEX IF NOT EXISTS idx_snapshots_user_date 
  ON snapshots(user_id, date DESC);

-- Index for unpaid bills query
CREATE INDEX IF NOT EXISTS idx_bills_user_paid_due 
  ON bills(user_id, paid, due_date);
```

**Impact:** 10-100x faster queries (especially on dashboard load)

### 3.3 Optimize Dashboard Query

**Bad (N+1 queries):**
```javascript
// Fetches 6 separate queries
const { data: assets } = await supabase.from('assets').select('*')
const { data: debts } = await supabase.from('debts').select('*')
const { data: investments } = await supabase.from('investments').select('*')
const { data: income } = await supabase.from('income').select('*')
const { data: bills } = await supabase.from('bills').select('*').eq('paid', false)
const { data: snapshots } = await supabase.from('snapshots').select('*').order('date', { ascending: false }).limit(30)
```

**Better (parallel queries with Promise.all):**
```javascript
const [assets, debts, investments, income, bills, snapshots] = await Promise.all([
  supabase.from('assets').select('*'),
  supabase.from('debts').select('*'),
  supabase.from('investments').select('*'),
  supabase.from('income').select('*'),
  supabase.from('bills').select('*').eq('paid', false),
  supabase.from('snapshots').select('*').order('date', { ascending: false }).limit(30)
])
```

**Impact:** ~40% faster (parallel execution)

### 3.4 Create Dashboard Materialized View

For complex calculations (net worth, totals), use a materialized view:

```sql
-- Create materialized view for dashboard summary
CREATE MATERIALIZED VIEW dashboard_summary AS
SELECT 
  user_id,
  COALESCE(SUM(CASE WHEN table_name = 'assets' THEN value ELSE 0 END), 0) AS total_assets,
  COALESCE(SUM(CASE WHEN table_name = 'investments' THEN balance ELSE 0 END), 0) AS total_investments,
  COALESCE(SUM(CASE WHEN table_name = 'debts' THEN balance ELSE 0 END), 0) AS total_debts,
  COALESCE(SUM(CASE WHEN table_name = 'income' THEN amount ELSE 0 END), 0) AS total_income
FROM (
  SELECT user_id, 'assets' AS table_name, value FROM assets
  UNION ALL
  SELECT user_id, 'investments', balance FROM investments
  UNION ALL
  SELECT user_id, 'debts', balance FROM debts
  UNION ALL
  SELECT user_id, 'income', amount FROM income
) combined
GROUP BY user_id;

-- Refresh materialized view (run nightly via cron)
REFRESH MATERIALIZED VIEW dashboard_summary;

-- Query becomes simple
SELECT * FROM dashboard_summary WHERE user_id = $1;
```

**Impact:** ~80% faster dashboard load (precomputed totals)

### 3.5 Implement Query Result Caching

Cache dashboard data for 5 minutes:

```javascript
// Simple in-memory cache
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function getCachedData(key, fetcher) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('[Cache] Hit:', key)
    return cached.data
  }
  
  console.log('[Cache] Miss:', key)
  const data = await fetcher()
  cache.set(key, { data, timestamp: Date.now() })
  return data
}

// Usage
const dashboardData = await getCachedData('dashboard', async () => {
  return Promise.all([
    supabase.from('assets').select('*'),
    supabase.from('debts').select('*'),
    // ... other queries
  ])
})
```

**Impact:** Instant subsequent page loads (within 5min window)

---

## 4. Chart.js Performance

### 4.1 Optimize Large Datasets

**Problem:** Net worth chart with 365 data points (daily for 1 year) lags.

**Solution A: Data Decimation**

```javascript
function decimateData(data, targetPoints = 30) {
  if (data.length <= targetPoints) return data
  
  const step = Math.ceil(data.length / targetPoints)
  return data.filter((_, index) => index % step === 0)
}

// Use on chart
const netWorthData = await fetchSnapshots() // 365 points
const chartData = decimateData(netWorthData, 30) // Show only 30 points

new Chart(ctx, {
  data: {
    labels: chartData.map(d => d.date),
    datasets: [{
      data: chartData.map(d => d.net_worth)
    }]
  }
})
```

**Solution B: Aggregation**

```sql
-- Monthly aggregation instead of daily
SELECT 
  DATE_TRUNC('month', date) AS month,
  AVG(net_worth) AS avg_net_worth,
  MIN(net_worth) AS min_net_worth,
  MAX(net_worth) AS max_net_worth
FROM snapshots
WHERE user_id = $1
  AND date > NOW() - INTERVAL '1 year'
GROUP BY DATE_TRUNC('month', date)
ORDER BY month DESC;
```

**Impact:** 10x fewer points = 10x faster rendering

### 4.2 Disable Animations on Initial Load

```javascript
const chartConfig = {
  type: 'line',
  data: chartData,
  options: {
    animation: {
      duration: 0 // Disable on first render
    },
    plugins: {
      legend: {
        display: true
      }
    },
    scales: {
      x: {
        ticks: {
          maxTicksLimit: 10 // Limit x-axis labels
        }
      }
    }
  }
}

const chart = new Chart(ctx, chartConfig)
```

**Impact:** ~300ms faster chart render

### 4.3 Use `ResponsivePlugin` Throttling

```javascript
Chart.defaults.responsive = true
Chart.defaults.maintainAspectRatio = false
Chart.defaults.resizeDelay = 300 // Throttle resize events
```

---

## 5. Layout & Rendering Optimization

### 5.1 Prevent Cumulative Layout Shift (CLS)

**Problem:** Cards/charts shift when data loads.

**Solution:** Reserve space with skeletons

```html
<!-- Before (causes layout shift) -->
<div id="net-worth-card" class="card">
  <!-- Empty, content loads later -->
</div>

<!-- After (stable layout) -->
<div id="net-worth-card" class="card" style="min-height: 200px;">
  <div class="skeleton">
    <div class="skeleton-line" style="width: 60%;"></div>
    <div class="skeleton-line" style="width: 40%;"></div>
  </div>
</div>

<style>
.skeleton {
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-line {
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  margin: 10px 0;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
```

**Impact:** CLS score < 0.1 (from ~0.3)

### 5.2 Optimize Bootstrap Grid Rendering

**Before (unnecessary nesting):**
```html
<div class="container">
  <div class="row">
    <div class="col-12">
      <div class="row">
        <div class="col-md-6">
          <div class="card">...</div>
        </div>
        <div class="col-md-6">
          <div class="card">...</div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**After (flatter DOM):**
```html
<div class="container">
  <div class="row">
    <div class="col-md-6">
      <div class="card">...</div>
    </div>
    <div class="col-md-6">
      <div class="card">...</div>
    </div>
  </div>
</div>
```

**Impact:** Fewer DOM nodes = faster paint

---

## 6. Network Optimization

### 6.1 Resource Hints

```html
<head>
  <!-- DNS prefetch for external resources -->
  <link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
  <link rel="dns-prefetch" href="https://fonts.googleapis.com">
  <link rel="dns-prefetch" href="https://qqtiofdqplwycnwplmen.supabase.co">
  
  <!-- Preconnect to critical origins -->
  <link rel="preconnect" href="https://qqtiofdqplwycnwplmen.supabase.co" crossorigin>
  
  <!-- Preload critical CSS -->
  <link rel="preload" href="/assets/css/styles.min.css" as="style">
  
  <!-- Preload critical fonts -->
  <link rel="preload" 
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" 
        as="style">
</head>
```

**Impact:** ~200-400ms faster resource loading

### 6.2 Implement HTTP/2 Server Push (Azure Static Web Apps)

Azure Static Web Apps uses HTTP/2 by default. No additional configuration needed.

### 6.3 Enable Caching Headers

```json
// staticwebapp.config.json
{
  "routes": [
    {
      "route": "/assets/css/*",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "route": "/assets/js/*",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "route": "/assets/img/*",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "route": "/*.html",
      "headers": {
        "cache-control": "public, max-age=3600, must-revalidate"
      }
    }
  ]
}
```

---

## 7. JavaScript Performance

### 7.1 Debounce Expensive Operations

```javascript
// Debounce chart updates on window resize
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Usage
window.addEventListener('resize', debounce(() => {
  chart.resize()
}, 300))
```

### 7.2 Use `requestAnimationFrame` for Animations

```javascript
// Smooth counter animation
function animateValue(element, start, end, duration) {
  const startTime = performance.now()
  
  function update(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    const value = start + (end - start) * progress
    element.textContent = '$' + value.toLocaleString()
    
    if (progress < 1) {
      requestAnimationFrame(update)
    }
  }
  
  requestAnimationFrame(update)
}

// Usage
animateValue(document.getElementById('net-worth'), 0, 1245832, 1000)
```

### 7.3 Avoid Memory Leaks

```javascript
// Clean up Chart.js instances
let chartInstance = null

function renderChart(canvas, data) {
  // Destroy previous instance
  if (chartInstance) {
    chartInstance.destroy()
  }
  
  chartInstance = new Chart(canvas, data)
  return chartInstance
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
```

---

## 8. Monitoring & Testing

### 8.1 Real User Monitoring (RUM)

Add web-vitals library:

```html
<script type="module">
  import {onCLS, onFID, onLCP, onFCP, onTTFB} from 'https://unpkg.com/web-vitals@3?module';

  function sendToAnalytics(metric) {
    // Send to your analytics endpoint
    console.log(metric)
    
    // Example: send to Supabase
    fetch('https://qqtiofdqplwycnwplmen.supabase.co/rest/v1/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'YOUR_ANON_KEY'
      },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        page: window.location.pathname,
        timestamp: new Date().toISOString()
      })
    })
  }

  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onLCP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
</script>
```

### 8.2 Performance Budget

Set thresholds for key metrics:

```javascript
// performance-budget.json
{
  "timings": {
    "firstContentfulPaint": 1500,
    "largestContentfulPaint": 2500,
    "timeToInteractive": 3500
  },
  "resourceSizes": {
    "total": 500,      // KB
    "script": 200,
    "stylesheet": 100,
    "image": 150
  },
  "resourceCounts": {
    "total": 30,
    "script": 10,
    "stylesheet": 5,
    "image": 10
  }
}
```

### 8.3 Automated Testing

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run Lighthouse
lhci autorun --config=lighthouserc.js

# lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['https://nice-cliff-05b13880f.2.azurestaticapps.net/'],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', {minScore: 0.9}],
        'categories:accessibility': ['warn', {minScore: 0.9}],
        'first-contentful-paint': ['error', {maxNumericValue: 1500}],
        'largest-contentful-paint': ['error', {maxNumericValue: 2500}]
      }
    }
  }
}
```

---

## 9. Azure Static Web Apps Optimization

### 9.1 Enable Azure CDN (Front Door)

Already enabled by default. No action needed.

### 9.2 Configure staticwebapp.config.json

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/assets/*", "/icons/*", "*.css", "*.js"]
  },
  "mimeTypes": {
    "json": "application/json",
    "webmanifest": "application/manifest+json",
    "woff2": "font/woff2"
  },
  "routes": [
    {
      "route": "/assets/*",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    }
  ],
  "globalHeaders": {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Content-Security-Policy": "default-src 'self' https://qqtiofdqplwycnwplmen.supabase.co https://cdn.jsdelivr.net https://fonts.googleapis.com; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;"
  }
}
```

---

## 10. Performance Checklist

### Frontend Optimization
- [ ] Minify and compress CSS/JS
- [ ] Purge unused Bootstrap styles (PurgeCSS)
- [ ] Tree-shake Chart.js (custom build)
- [ ] Convert images to WebP
- [ ] Add `width`/`height` attributes to images
- [ ] Lazy load below-the-fold content
- [ ] Defer non-critical JavaScript
- [ ] Use skeleton loaders (prevent CLS)
- [ ] Add resource hints (dns-prefetch, preconnect)
- [ ] Enable font-display: swap

### Database Optimization
- [ ] Add indexes on `user_id` columns
- [ ] Create composite indexes for common queries
- [ ] Use Promise.all() for parallel queries
- [ ] Implement query result caching (5min TTL)
- [ ] Create materialized view for dashboard summary
- [ ] Set up database connection pooling

### Chart.js Optimization
- [ ] Decimate large datasets (30-50 points max)
- [ ] Disable animations on initial load
- [ ] Throttle resize events (300ms debounce)
- [ ] Use time-based aggregation (daily → monthly)
- [ ] Destroy chart instances on page unload

### Caching & CDN
- [ ] Configure cache-control headers
- [ ] Enable service worker caching (PWA)
- [ ] Use Azure CDN for static assets
- [ ] Set long cache TTL for immutable assets (1 year)
- [ ] Implement stale-while-revalidate strategy

### Monitoring
- [ ] Integrate web-vitals library
- [ ] Track Core Web Vitals in Supabase
- [ ] Set performance budgets
- [ ] Run weekly Lighthouse audits
- [ ] Monitor real user metrics

---

## 11. Expected Improvements

| Metric | Current (Estimated) | After Optimization | Improvement |
|--------|---------------------|-------------------|-------------|
| **Page Load (3G)** | 4.5s | 2.0s | **-56%** |
| **First Contentful Paint** | 2.8s | 1.2s | **-57%** |
| **Time to Interactive** | 5.2s | 3.0s | **-42%** |
| **Lighthouse Performance** | 65 | 95 | **+46%** |
| **Bundle Size** | 650KB | 280KB | **-57%** |
| **Database Query Time** | 800ms | 120ms | **-85%** |
| **Chart Render Time** | 450ms | 150ms | **-67%** |

---

## 12. Implementation Priority

### Phase 1: Quick Wins (Week 1)
**Effort:** Low | **Impact:** High

1. Add database indexes (30 minutes)
2. Parallelize Supabase queries with Promise.all() (1 hour)
3. Add resource hints to `<head>` (30 minutes)
4. Minify CSS/JS (1 hour)
5. Add cache-control headers (30 minutes)

**Expected Impact:** 30-40% faster load times

---

### Phase 2: Asset Optimization (Week 2)
**Effort:** Medium | **Impact:** High

1. Set up PurgeCSS for Bootstrap (2 hours)
2. Create custom Chart.js build (2 hours)
3. Convert images to WebP (1 hour)
4. Implement lazy loading for charts (3 hours)
5. Add skeleton loaders (2 hours)

**Expected Impact:** Additional 20-30% improvement

---

### Phase 3: Advanced (Week 3)
**Effort:** High | **Impact:** Medium

1. Implement query caching (4 hours)
2. Create materialized view for dashboard (3 hours)
3. Integrate web-vitals monitoring (2 hours)
4. Set up Lighthouse CI (2 hours)
5. Optimize Chart.js datasets (3 hours)

**Expected Impact:** Final 10-15% improvement + ongoing monitoring

---

## 13. Cost-Benefit Analysis

### Time Investment
- Phase 1: ~4 hours
- Phase 2: ~10 hours
- Phase 3: ~14 hours
- **Total:** ~28 hours (1 sprint)

### Benefits
- **User Experience:** 2-3x faster page loads
- **Engagement:** ~20-30% improvement (faster = more usage)
- **SEO:** Better Core Web Vitals = higher Google rankings
- **Mobile:** 50-60% faster on 3G/4G networks
- **Costs:** Lower bandwidth usage (smaller bundles)

### ROI
- **High:** Phase 1 (low effort, high impact)
- **High:** Phase 2 (medium effort, high impact)
- **Medium:** Phase 3 (high effort, medium impact + monitoring)

---

## 14. Performance Regression Prevention

### GitHub Actions CI

```yaml
# .github/workflows/performance.yml
name: Performance Audit

on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://nice-cliff-05b13880f.2.azurestaticapps.net/
            https://nice-cliff-05b13880f.2.azurestaticapps.net/dashboard.html
          budgetPath: ./budget.json
          uploadArtifacts: true
```

---

## 15. Tools & Resources

### Performance Testing
- **Lighthouse** (Chrome DevTools): https://developer.chrome.com/docs/lighthouse
- **WebPageTest**: https://www.webpagetest.org
- **GTmetrix**: https://gtmetrix.com
- **web-vitals** library: https://github.com/GoogleChrome/web-vitals

### Optimization Tools
- **PurgeCSS**: https://purgecss.com
- **Terser** (JS minifier): https://terser.org
- **cwebp** (WebP converter): https://developers.google.com/speed/webp/docs/cwebp
- **Rollup** (bundler): https://rollupjs.org

### Monitoring
- **Azure Application Insights**: Built into Static Web Apps
- **Sentry**: https://sentry.io (error + performance tracking)
- **LogRocket**: https://logrocket.com (session replay)

---

## 16. Key Takeaways

1. **Database indexes are critical** — 10-100x speedup for queries filtering by `user_id`
2. **Parallel queries matter** — Use Promise.all() instead of sequential awaits
3. **Chart.js datasets should be small** — 30-50 data points max for smooth rendering
4. **Bootstrap is bloated** — PurgeCSS saves ~60% of CSS bundle size
5. **Caching is your friend** — 5-minute TTL for dashboard data eliminates repeat queries
6. **Skeletons prevent layout shift** — Reserve space for dynamic content
7. **Monitor real users** — web-vitals library tracks Core Web Vitals automatically

---

## 17. Next Steps

1. **Run baseline Lighthouse audit** on current dashboard
2. **Spawn Builder agent** to implement Phase 1 quick wins:
   - Add database indexes
   - Parallelize Supabase queries
   - Add resource hints to HTML
   - Configure cache headers
3. **Measure impact** with follow-up Lighthouse audit
4. **Proceed to Phase 2** if improvements are significant

**Estimated Timeline:** 1 sprint (2 weeks) for Phases 1-2

---

**End of Performance Optimization Research**
