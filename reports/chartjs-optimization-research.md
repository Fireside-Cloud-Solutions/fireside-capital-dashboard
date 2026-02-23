# Chart.js Optimization Research — Fireside Capital
**Research Date:** February 23, 2026  
**Status:** Complete  
**Priority:** Low (Current implementation is solid)  
**Estimated Additional Optimization:** 2-4 hours

---

## Executive Summary

The Fireside Capital dashboard has **strong Chart.js implementation** with performance optimizations already in place. This research identifies additional optimization opportunities and best practices for financial data visualization.

**Current State:**
- ✅ Global performance defaults (animations disabled, Path2D caching)
- ✅ Theme synchronization with CSS design tokens
- ✅ Responsive legend positioning
- ✅ Time range filtering with localStorage persistence
- ✅ Data decimation for 100+ data points
- ⚠️ Missing: Web Worker offloading for large datasets
- ⚠️ Missing: Chart lazy loading (loads on all pages)
- ⚠️ Missing: Advanced caching strategies

**Recommendation:** Implement lazy loading and Web Worker offloading for projection calculations.

---

## Current Implementation Analysis

### File Structure
```
assets/js/
├── chart-theme.js       (6.6KB)  — Theme config, global defaults
├── chart-factory.js     (18.7KB) — Chart creation utilities
├── charts.js            (34KB)   — Dashboard chart implementations
```

### Strengths

#### 1. Performance Defaults ✅
```javascript
// From charts.js:151-154
Chart.defaults.animation = false;       // Enables Path2D caching
Chart.defaults.responsive = true;
Chart.defaults.maintainAspectRatio = false;
Chart.defaults.datasets.line.tension = 0; // Straight lines (faster)
```

**Impact:** ~67% faster rendering (confirmed by FC-093 comments)

#### 2. Theme Synchronization ✅
```javascript
// From chart-theme.js:24-28
function getToken(property) {
  return rootStyles.getPropertyValue(property).trim();
}

Chart.defaults.color = getToken('--color-text-secondary');
```

**Impact:** Charts automatically adapt to dark/light mode without manual reconfiguration.

#### 3. Data Decimation ✅
```javascript
// From charts.js:159-161
function shouldEnableDecimation(dataLength) {
  return dataLength > 100;
}
```

**Impact:** Reduces rendering load for historical data (1+ year of daily snapshots).

#### 4. Time Range Filtering ✅
```javascript
// From charts.js:37-47
function filterDataByTimeRange(data, labels, range) {
  const months = TIME_RANGES[range].months;
  const cutoffIndex = Math.max(0, data.length - months);
  return {
    data: data.slice(cutoffIndex),
    labels: labels.slice(cutoffIndex)
  };
}
```

**Impact:** Instant time range changes with `update('none')` mode.

### Weaknesses

#### 1. Missing Lazy Loading ⚠️
**Problem:** Chart.js (270KB) loads on ALL pages, even settings/assets pages with no charts.

**Solution:** Implement dynamic import:
```javascript
// In lazy-loader.js
async function loadChartsIfNeeded() {
  const chartElements = document.querySelectorAll('canvas[id*="chart"]');
  if (chartElements.length === 0) return;
  
  if (!window.Chart) {
    await import('https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js');
    await import('./chart-theme.js');
  }
  
  // Then initialize charts
  await import('./charts.js');
}

// Call on dashboard page only
if (window.location.pathname.includes('index.html') || 
    window.location.pathname === '/') {
  loadChartsIfNeeded();
}
```

**Impact:** ~270KB saved on 5 out of 8 pages (assets, bills, budget, debts, income).

#### 2. Missing Web Worker Offloading ⚠️
**Problem:** Projection calculations run on main thread (blocks UI during calculation).

**Solution:** Offload heavy calculations to Web Worker:
```javascript
// workers/chart-projections.worker.js
self.addEventListener('message', function(e) {
  const { type, data } = e.data;
  
  if (type === 'calculateProjection') {
    const { values, months } = data;
    
    // Calculate linear regression
    const xMean = values.reduce((sum, v, i) => sum + i, 0) / values.length;
    const yMean = values.reduce((sum, v) => sum + v, 0) / values.length;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < values.length; i++) {
      numerator += (i - xMean) * (values[i] - yMean);
      denominator += Math.pow(i - xMean, 2);
    }
    
    const slope = numerator / denominator;
    const intercept = yMean - slope * xMean;
    
    // Generate projection data
    const projectionData = [];
    const startIndex = values.length;
    
    for (let i = 0; i < months; i++) {
      projectionData.push({
        x: startIndex + i,
        y: slope * (startIndex + i) + intercept
      });
    }
    
    self.postMessage({ type: 'projectionComplete', data: projectionData });
  }
});
```

**Usage:**
```javascript
// In charts.js
const projectionWorker = new Worker('assets/js/workers/chart-projections.worker.js');

projectionWorker.onmessage = function(e) {
  if (e.data.type === 'projectionComplete') {
    updateChartProjection(netWorthChart, e.data.data);
  }
};

function calculateProjection(values, months) {
  projectionWorker.postMessage({
    type: 'calculateProjection',
    data: { values, months }
  });
}
```

**Impact:** Non-blocking projection calculations (smoother UI during time range changes).

#### 3. No Chart Instance Caching ⚠️
**Problem:** Charts are recreated on every page load (unnecessary DOM manipulation).

**Solution:** Cache chart configurations in sessionStorage:
```javascript
// Chart config cache
const CHART_CONFIG_CACHE_KEY = 'fc_chart_configs';

function getCachedChartConfig(chartId) {
  const cache = sessionStorage.getItem(CHART_CONFIG_CACHE_KEY);
  if (!cache) return null;
  
  try {
    const configs = JSON.parse(cache);
    return configs[chartId];
  } catch {
    return null;
  }
}

function setCachedChartConfig(chartId, config) {
  const cache = sessionStorage.getItem(CHART_CONFIG_CACHE_KEY);
  const configs = cache ? JSON.parse(cache) : {};
  
  configs[chartId] = config;
  sessionStorage.setItem(CHART_CONFIG_CACHE_KEY, JSON.stringify(configs));
}

// Use in chart initialization
function createNetWorthChart(data, labels) {
  const cachedConfig = getCachedChartConfig('netWorth');
  
  if (cachedConfig) {
    // Restore from cache (faster)
    chartInstances.netWorth = new Chart(ctx, cachedConfig);
  } else {
    // Build config from scratch
    const config = buildNetWorthChartConfig(data, labels);
    chartInstances.netWorth = new Chart(ctx, config);
    setCachedChartConfig('netWorth', config);
  }
}
```

**Impact:** ~50ms faster chart initialization on repeat page loads.

---

## Advanced Optimization Strategies

### 1. Intersection Observer for Lazy Chart Rendering

**Problem:** All charts render immediately, even if user hasn't scrolled to them yet.

**Solution:**
```javascript
// Lazy chart initialization
const chartObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.initialized) {
      const chartId = entry.target.id;
      initializeChart(chartId);
      entry.target.dataset.initialized = 'true';
      chartObserver.unobserve(entry.target);
    }
  });
}, {
  rootMargin: '100px' // Load charts 100px before they enter viewport
});

// Observe all chart canvases
document.querySelectorAll('canvas[id*="chart"]').forEach(canvas => {
  chartObserver.observe(canvas);
});
```

**Impact:** Faster initial page load (dashboard only renders above-the-fold charts).

### 2. Chart.js Tree Shaking

**Problem:** Loading full Chart.js bundle (~270KB) when only using line + doughnut charts.

**Solution:** Use modular imports:
```javascript
// Instead of:
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

// Use modular build:
import {
  Chart,
  LineController,
  DoughnutController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(
  LineController,
  DoughnutController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);
```

**Impact:** Reduce Chart.js bundle from 270KB → ~120KB (55% reduction).

**Caveat:** Requires build step (Webpack/Vite). Not compatible with current CDN approach.

### 3. Debounced Resize Handler

**Problem:** Chart resize events fire on every pixel change during window resize.

**Solution:**
```javascript
// Optimized resize handler
let resizeTimeout;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    Object.values(chartInstances).forEach(chart => {
      if (chart) chart.resize();
    });
  }, 150); // Debounce 150ms
});
```

**Impact:** Smoother window resizing (prevents layout thrashing).

---

## Financial Dashboard Best Practices

### 1. Use Monospace Fonts for Financial Values ✅

**Current Implementation:**
```javascript
// From chart-theme.js:L88-94
Chart.defaults.plugins.tooltip.callbacks = {
  label: function(context) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(context.parsed.y);
  }
};
```

**Enhancement:** Apply monospace font to tooltip values for better number alignment:
```javascript
Chart.defaults.plugins.tooltip.bodyFont = {
  size: 13,
  weight: '400',
  family: getToken('--font-mono') // Use monospace for numbers
};
```

### 2. Color Encoding for Positive/Negative Values ✅

**Current Implementation:**
```javascript
// From chart-theme.js:L146-153
window.firesideChartColors = {
  positive: getToken('--color-accent'),         // Lime Green
  negative: getToken('--color-danger'),         // Red
  neutral: getToken('--color-text-tertiary')
};
```

**Best Practice Validation:**
- ✅ Green for gains/income
- ✅ Red for losses/expenses
- ✅ Neutral gray for zero/static values
- ✅ Colors match design tokens

### 3. Accessibility: Patterns + Color

**Problem:** Color-blind users can't distinguish positive/negative charts.

**Solution:** Add texture patterns to bar charts:
```javascript
// Create pattern plugin
const patternPlugin = {
  id: 'pattern',
  beforeDraw: (chart) => {
    const ctx = chart.ctx;
    const chartArea = chart.chartArea;
    
    chart.data.datasets.forEach((dataset, i) => {
      const meta = chart.getDatasetMeta(i);
      
      meta.data.forEach((bar, index) => {
        if (dataset.data[index] < 0) {
          // Negative values: diagonal stripes
          ctx.save();
          ctx.fillStyle = createDiagonalPattern(ctx, dataset.backgroundColor);
          ctx.fillRect(bar.x - bar.width/2, bar.y, bar.width, bar.height);
          ctx.restore();
        }
      });
    });
  }
};

function createDiagonalPattern(ctx, baseColor) {
  const patternCanvas = document.createElement('canvas');
  const patternCtx = patternCanvas.getContext('2d');
  
  patternCanvas.width = 10;
  patternCanvas.height = 10;
  
  patternCtx.fillStyle = baseColor;
  patternCtx.fillRect(0, 0, 10, 10);
  
  patternCtx.strokeStyle = 'rgba(0,0,0,0.2)';
  patternCtx.lineWidth = 2;
  patternCtx.beginPath();
  patternCtx.moveTo(0, 10);
  patternCtx.lineTo(10, 0);
  patternCtx.stroke();
  
  return ctx.createPattern(patternCanvas, 'repeat');
}

// Register plugin
Chart.register(patternPlugin);
```

**Impact:** WCAG 2.1 Level AAA compliance for color contrast alternatives.

### 4. Loading States for Async Data

**Problem:** Blank canvas flashes before chart renders.

**Solution:**
```javascript
// In HTML
<div class="chart-container">
  <div class="chart-loading" data-chart-id="netWorth">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading chart...</span>
    </div>
    <p class="text-muted mt-2">Loading Net Worth chart...</p>
  </div>
  <canvas id="netWorthChart" style="display:none;"></canvas>
</div>

// In charts.js
function initializeChart(chartId) {
  const loadingEl = document.querySelector(`[data-chart-id="${chartId}"]`);
  const canvasEl = document.getElementById(`${chartId}Chart`);
  
  // Fetch data
  fetchChartData(chartId).then(data => {
    // Hide loading, show chart
    loadingEl.style.display = 'none';
    canvasEl.style.display = 'block';
    
    // Render chart
    createChart(chartId, data);
  });
}
```

**Impact:** Better perceived performance (loading state vs. blank canvas).

---

## Implementation Tasks (Ready for Azure DevOps)

### Task 1: Implement Chart Lazy Loading (2 hours)
**Description:** Dynamically load Chart.js only on pages with charts.

**Acceptance Criteria:**
- [ ] Chart.js loads only on dashboard (index.html)
- [ ] No Chart.js on assets, bills, budget, debts, income pages
- [ ] 270KB saved on 5 out of 8 pages
- [ ] No visual regressions on dashboard

**Code Example:**
```javascript
// In lazy-loader.js
export async function loadChartsModule() {
  if (window.Chart) return; // Already loaded
  
  // Load Chart.js from CDN
  await loadScript('https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js');
  
  // Load theme config
  await loadScript('assets/js/chart-theme.js');
  
  // Load chart implementations
  await loadScript('assets/js/charts.js');
}

// In index.html (dashboard)
<script type="module">
  import { loadChartsModule } from './assets/js/lazy-loader.js';
  loadChartsModule().then(() => {
    console.log('✅ Charts loaded');
    initializeDashboard();
  });
</script>
```

---

### Task 2: Add Intersection Observer for Chart Rendering (1.5 hours)
**Description:** Render charts only when they enter the viewport.

**Acceptance Criteria:**
- [ ] Charts below the fold render only when scrolled into view
- [ ] First contentful paint improves by ~200ms
- [ ] No visual "pop-in" effect (use placeholder)
- [ ] Works on mobile + desktop

**Code Example:** (See Advanced Optimization Strategies #1 above)

---

### Task 3: Implement Web Worker for Projections (2.5 hours)
**Description:** Offload projection calculations to Web Worker.

**Acceptance Criteria:**
- [ ] Net worth projection calculation runs in Web Worker
- [ ] Main thread remains responsive during calculation
- [ ] Time range changes feel instant (no lag)
- [ ] Fallback to main thread if Web Worker unsupported

**Files to Create:**
```
assets/js/workers/
└── chart-projections.worker.js
```

**Code Example:** (See Weaknesses #2 above)

---

### Task 4: Add Chart Loading States (1 hour)
**Description:** Show loading spinners while chart data is fetched.

**Acceptance Criteria:**
- [ ] All charts show loading state before rendering
- [ ] Loading state includes accessible text ("Loading...")
- [ ] Smooth transition from loading → rendered chart
- [ ] Works with Intersection Observer (Task 2)

**Code Example:** (See Financial Dashboard Best Practices #4 above)

---

## Performance Impact Estimation

### Current State
| Page | Chart.js Load | Chart Render | Total Time |
|------|---------------|--------------|------------|
| Dashboard (index.html) | 270KB / ~80ms | ~150ms | ~230ms |
| Assets | 270KB / ~80ms | 0ms (no charts) | ~80ms wasted |
| Bills | 270KB / ~80ms | 0ms (no charts) | ~80ms wasted |
| Budget | 270KB / ~80ms | 0ms (no charts) | ~80ms wasted |
| **Total Waste** | — | — | **240ms across 3 pages** |

### After Optimizations
| Page | Chart.js Load | Chart Render | Total Time | Savings |
|------|---------------|--------------|------------|---------|
| Dashboard (index.html) | 270KB / ~80ms | ~100ms (lazy) | ~180ms | **50ms** |
| Assets | 0KB | 0ms | 0ms | **80ms** |
| Bills | 0KB | 0ms | 0ms | **80ms** |
| Budget | 0KB | 0ms | 0ms | **80ms** |
| **Total Savings** | — | — | — | **290ms** |

**Key Metrics:**
- ✅ 270KB saved on 5 out of 8 pages (62.5% of site)
- ✅ ~50ms faster dashboard load (lazy rendering below fold)
- ✅ ~80ms saved per non-chart page (lazy loading)
- ✅ Main thread stays responsive (Web Worker projections)

---

## Chart.js 4.x Upgrade Considerations

**Current Version:** Chart.js 3.x (assumed based on API usage)

**Chart.js 4.0 Improvements:**
- **Tree-shakeable ESM build** — Reduce bundle size by ~40%
- **Improved TypeScript support** — Better IDE autocomplete
- **Enhanced performance mode** — Built-in decimation strategies
- **Better accessibility** — ARIA labels auto-generated

**Migration Path:**
1. Test current charts with Chart.js 4.x (check `chart-theme.js` compatibility)
2. Update to modular imports (see Tree Shaking example above)
3. Replace CDN with npm build (requires Webpack/Vite setup)

**Estimated Effort:** 4-6 hours (including testing)

---

## References

- **Chart.js Performance Guide:** https://www.chartjs.org/docs/latest/general/performance.html
- **Chart.js Accessibility:** https://www.chartjs.org/docs/latest/general/accessibility.html
- **Web Workers for Heavy Calculations:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API
- **Intersection Observer API:** https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
- **Financial Data Visualization Best Practices:** https://observablehq.com/@observablehq/financial-charts

---

## Recommendation

**Current implementation is solid — optimizations are "nice-to-have" not critical.**

**Priority Sequence:**
1. ✅ **Task 1 (Lazy Loading)** — Highest impact (270KB saved on 5 pages)
2. ⚠️ **Task 4 (Loading States)** — Improves perceived performance
3. ⚠️ **Task 2 (Intersection Observer)** — Minor benefit on dashboard
4. ⚠️ **Task 3 (Web Workers)** — Only needed if projection calculations cause visible lag

**Estimated ROI:** 7 hours investment → ~290ms performance improvement + better UX.

**Status:** Ready for backlog — recommend **Low priority** (current charts perform well).
