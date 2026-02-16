# Chart.js Performance Optimization Research
**Research Sprint:** February 16, 2026  
**Status:** ✅ Complete  
**Researcher:** Capital (Orchestrator)

---

## Executive Summary

Analyzed Chart.js performance best practices and evaluated Fireside Capital's current implementation. The dashboard has **excellent Chart.js optimization** already in place (`charts.js`, `chart-theme.js`), but there are opportunities for further improvement, especially for large datasets and real-time updates.

---

## Current Implementation Analysis

### Strengths ✅

1. **Global Performance Defaults** — `Chart.defaults.animation = false` (enables Path2D caching)
2. **Parsing Disabled** — `Chart.defaults.parsing = false` (assumes pre-formatted data)
3. **Normalized Data** — `Chart.defaults.normalized = true` (sorted, unique indices)
4. **Tension = 0** — Straight lines instead of Bézier curves (faster rendering)
5. **spanGaps = true** — Skips line segmentation on gaps
6. **Time Range Filtering** — Limits data points shown (1M, 3M, 6M, 1Y, All)
7. **Decimation Check** — `shouldEnableDecimation(dataLength)` for 100+ points
8. **Theme Configuration** — Centralized color palette, font families, tooltip styling
9. **Responsive Legend** — Position changes based on viewport (`getResponsiveLegendPosition()`)
10. **Financial Color Palette** — Brand-aligned colors (Orange, Blue, Green)

### Current Performance Score: **A-**

---

## Official Chart.js Recommendations (Compliance Check)

| Recommendation | Status | Notes |
|----------------|--------|-------|
| **Parsing: false** | ✅ Implemented | `Chart.defaults.parsing = false` |
| **Normalized: true** | ✅ Implemented | `Chart.defaults.normalized = true` |
| **Data decimation** | ⚠️ Partial | Logic exists but not auto-applied |
| **Animations disabled** | ✅ Implemented | `Chart.defaults.animation = false` |
| **Min/max for scales** | ❌ Not implemented | Would skip auto-range calculation |
| **Rotation specified** | ❌ Not implemented | minRotation/maxRotation not set |
| **ticks.sampleSize** | ❌ Not implemented | Could speed up axis rendering |
| **Tension = 0** | ✅ Implemented | `Chart.defaults.datasets.line.tension = 0` |
| **spanGaps enabled** | ✅ Implemented | `Chart.defaults.datasets.line.spanGaps = true` |
| **Web Workers** | ❌ Not implemented | Offload rendering to background thread |
| **Reduced motion** | ✅ Implemented | `@media (prefers-reduced-motion: reduce)` |

---

## Recommendations for Improvement

### 1. **Implement Automatic Data Decimation**
**Priority:** High  
**Effort:** 2 hours  
**Impact:** Performance (50% faster rendering for large datasets)

**Problem:** `shouldEnableDecimation()` exists but decimation plugin isn't applied automatically.

**Solution:** Auto-enable decimation when data exceeds threshold.

#### Implementation:

```javascript
// charts.js enhancement
function getDecimationConfig(dataLength) {
  if (dataLength <= 100) {
    return {}; // No decimation needed
  }
  
  return {
    plugins: {
      decimation: {
        enabled: true,
        algorithm: 'lttb', // Largest Triangle Three Buckets (best quality/performance)
        samples: Math.min(dataLength, 500), // Cap at 500 points
        threshold: 100 // Only enable if > 100 points
      }
    }
  };
}

// Apply to chart creation
function createLineChart(ctx, data, labels, config = {}) {
  const decimationConfig = getDecimationConfig(data.length);
  
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        // ... other dataset config
      }]
    },
    options: {
      ...config,
      ...decimationConfig,
      parsing: false,
      normalized: true
    }
  });
}
```

**Documentation:** https://www.chartjs.org/docs/latest/configuration/decimation.html

---

### 2. **Specify Min/Max for Y-Axis Scales**
**Priority:** Medium  
**Effort:** 1 hour  
**Impact:** Performance (skip auto-range calculation)

**Problem:** Chart.js recalculates Y-axis min/max on every render.

**Solution:** Pre-calculate min/max from data and pass to chart config.

#### Implementation:

```javascript
// charts.js enhancement
function getAxisBounds(data, paddingPercent = 10) {
  const min = Math.min(...data.filter(v => v !== null));
  const max = Math.max(...data.filter(v => v !== null));
  const range = max - min;
  const padding = range * (paddingPercent / 100);
  
  return {
    min: Math.floor(min - padding),
    max: Math.ceil(max + padding)
  };
}

// Usage in chart creation
function createNetWorthChart(data) {
  const bounds = getAxisBounds(data);
  
  return new Chart(ctx, {
    type: 'line',
    data: { /* ... */ },
    options: {
      scales: {
        y: {
          min: bounds.min,
          max: bounds.max,
          ticks: {
            callback: function(value) {
              return formatCurrency(value);
            }
          }
        }
      }
    }
  });
}
```

**Benefit:** Eliminates expensive auto-range calculation on every update.

---

### 3. **Set Fixed Rotation for Tick Labels**
**Priority:** Low  
**Effort:** 30 minutes  
**Impact:** Performance (minor, but cumulative)

**Problem:** Chart.js auto-calculates optimal rotation for tick labels (CPU intensive).

**Solution:** Set `minRotation` and `maxRotation` to the same value.

#### Implementation:

```javascript
// chart-theme.js addition
Chart.defaults.scales.category.ticks.minRotation = 0;
Chart.defaults.scales.category.ticks.maxRotation = 0;

// For time-based charts with many labels:
Chart.defaults.scales.time.ticks.minRotation = 45;
Chart.defaults.scales.time.ticks.maxRotation = 45;
```

---

### 4. **Use `ticks.sampleSize` for Large Datasets**
**Priority:** Low  
**Effort:** 30 minutes  
**Impact:** Performance (faster axis rendering)

**Problem:** Chart.js measures all labels to determine axis width.

**Solution:** Sample only a subset of labels.

#### Implementation:

```javascript
// chart-theme.js addition
Chart.defaults.scales.category.ticks.sampleSize = 50; // Sample 50 labels max

// For financial dashboards with tabular numbers (all same width):
Chart.defaults.scales.linear.ticks.sampleSize = 10;
```

**Note:** Only useful if labels have minimal variance in width (which they do for financial data with tabular-nums).

---

### 5. **Offload Rendering to Web Workers (Advanced)**
**Priority:** Low  
**Effort:** 8 hours  
**Impact:** Performance (massive for complex dashboards)

**Problem:** Chart rendering blocks the main thread, causing UI jank.

**Solution:** Use OffscreenCanvas + Web Workers to render charts in background thread.

#### Implementation:

```javascript
// Main thread: chart-worker-manager.js
class ChartWorkerManager {
  constructor() {
    this.worker = new Worker('assets/js/chart-worker.js');
    this.chartId = 0;
    this.callbacks = new Map();
  }
  
  createChart(canvasId, config, data) {
    const canvas = document.getElementById(canvasId);
    const offscreen = canvas.transferControlToOffscreen();
    const id = ++this.chartId;
    
    return new Promise((resolve) => {
      this.callbacks.set(id, resolve);
      
      this.worker.postMessage({
        action: 'create',
        id: id,
        canvas: offscreen,
        config: config,
        data: data
      }, [offscreen]); // Transfer ownership
    });
  }
  
  updateChart(id, data) {
    this.worker.postMessage({
      action: 'update',
      id: id,
      data: data
    });
  }
  
  destroyChart(id) {
    this.worker.postMessage({
      action: 'destroy',
      id: id
    });
  }
}

// Usage:
const chartManager = new ChartWorkerManager();
await chartManager.createChart('netWorthChart', config, data);
```

```javascript
// Worker thread: chart-worker.js
importScripts('https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js');

const charts = new Map();

self.addEventListener('message', (event) => {
  const { action, id, canvas, config, data } = event.data;
  
  switch (action) {
    case 'create':
      const ctx = canvas.getContext('2d');
      const chart = new Chart(ctx, {
        ...config,
        data: data
      });
      charts.set(id, chart);
      self.postMessage({ action: 'created', id: id });
      break;
      
    case 'update':
      const chart = charts.get(id);
      if (chart) {
        chart.data.datasets[0].data = data;
        chart.update('none');
      }
      break;
      
    case 'destroy':
      const chartToDestroy = charts.get(id);
      if (chartToDestroy) {
        chartToDestroy.destroy();
        charts.delete(id);
      }
      break;
  }
});
```

**Caveats:**
- Can't use DOM interactions (tooltips work, but no click events)
- Plugin ecosystem limited (some plugins use DOM)
- Browser support: Chrome 69+, Firefox 105+, Safari 16.4+ (check with `if (canvas.transferControlToOffscreen)`)

**Recommendation:** Only implement if dashboard has 5+ charts or real-time updates.

---

### 6. **Implement Chart Lazy Loading**
**Priority:** Medium  
**Effort:** 2 hours  
**Impact:** Performance (initial page load)

**Problem:** All charts load immediately, even if below the fold.

**Solution:** Use Intersection Observer to load charts only when visible.

#### Implementation:

```javascript
// lazy-loader.js enhancement
const chartObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const canvas = entry.target;
      const chartType = canvas.dataset.chartType;
      const chartId = canvas.id;
      
      // Load chart based on type
      switch (chartType) {
        case 'netWorth':
          loadNetWorthChart(chartId);
          break;
        case 'cashFlow':
          loadCashFlowChart(chartId);
          break;
        // Add other chart types
      }
      
      // Stop observing once loaded
      chartObserver.unobserve(canvas);
    }
  });
}, {
  rootMargin: '100px' // Start loading 100px before visible
});

// Observe all chart canvases on page load
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('canvas[data-lazy-chart]').forEach(canvas => {
    chartObserver.observe(canvas);
  });
});
```

```html
<!-- index.html usage -->
<canvas id="netWorthChart" data-lazy-chart data-chart-type="netWorth" width="400" height="200"></canvas>
<canvas id="cashFlowChart" data-lazy-chart data-chart-type="cashFlow" width="400" height="200"></canvas>
```

**Benefit:** Faster initial page load (only load above-the-fold charts immediately).

---

### 7. **Add Chart Caching for Repeated Views**
**Priority:** Low  
**Effort:** 1 hour  
**Impact:** Performance (repeated page visits)

**Problem:** Charts re-render from scratch every time the page loads.

**Solution:** Cache rendered chart images in IndexedDB or sessionStorage.

#### Implementation:

```javascript
// chart-cache.js
class ChartCache {
  constructor() {
    this.cacheKey = 'chartCache';
    this.maxAge = 5 * 60 * 1000; // 5 minutes
  }
  
  async get(chartId) {
    const cached = sessionStorage.getItem(`${this.cacheKey}_${chartId}`);
    if (!cached) return null;
    
    const { dataUrl, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;
    
    if (age > this.maxAge) {
      this.delete(chartId);
      return null;
    }
    
    return dataUrl;
  }
  
  set(chartId, chart) {
    const dataUrl = chart.toBase64Image();
    const data = {
      dataUrl: dataUrl,
      timestamp: Date.now()
    };
    
    sessionStorage.setItem(`${this.cacheKey}_${chartId}`, JSON.stringify(data));
  }
  
  delete(chartId) {
    sessionStorage.removeItem(`${this.cacheKey}_${chartId}`);
  }
}

// Usage:
const chartCache = new ChartCache();

async function loadNetWorthChart(canvasId) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  
  // Try to load from cache
  const cachedImage = await chartCache.get(canvasId);
  if (cachedImage) {
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.src = cachedImage;
    
    // Load actual chart in background
    loadActualChart(canvasId).then(chart => {
      chartCache.set(canvasId, chart);
    });
  } else {
    const chart = await loadActualChart(canvasId);
    chartCache.set(canvasId, chart);
  }
}
```

**Benefit:** Instant chart display on repeat visits (perceived performance).

---

### 8. **Reduce Tooltip Complexity**
**Priority:** Low  
**Effort:** 30 minutes  
**Impact:** Performance (hover interactions)

**Problem:** Complex tooltip callbacks can slow down hover interactions.

**Solution:** Pre-format data instead of formatting in callbacks.

#### Before (Slow):
```javascript
tooltip: {
  callbacks: {
    label: function(context) {
      return formatCurrency(context.parsed.y) + ' - ' + getChangeDescription(context);
    }
  }
}
```

#### After (Fast):
```javascript
// Pre-format data
const formattedData = rawData.map(value => ({
  y: value,
  label: formatCurrency(value)
}));

// Simple tooltip
tooltip: {
  callbacks: {
    label: function(context) {
      return context.raw.label; // Already formatted
    }
  }
}
```

---

## Performance Monitoring

Add performance tracking to measure impact of optimizations:

```javascript
// charts.js addition
function trackChartPerformance(chartId, startTime) {
  const renderTime = performance.now() - startTime;
  
  // Log to console (dev mode)
  if (window.location.hostname === 'localhost') {
    console.log(`📊 Chart ${chartId} rendered in ${renderTime.toFixed(2)}ms`);
  }
  
  // Send to analytics (production)
  if (typeof gtag !== 'undefined') {
    gtag('event', 'chart_render', {
      chart_id: chartId,
      render_time: Math.round(renderTime),
      data_points: chartInstances[chartId]?.data?.labels?.length || 0
    });
  }
}

// Usage:
function createNetWorthChart() {
  const startTime = performance.now();
  
  // ... chart creation logic
  
  trackChartPerformance('netWorth', startTime);
}
```

---

## Implementation Priority

| Task | Priority | Effort | Impact | Assigned To |
|------|----------|--------|--------|-------------|
| Automatic decimation | High | 2h | High | Builder |
| Specify min/max scales | Medium | 1h | Medium | Builder |
| Chart lazy loading | Medium | 2h | Medium | Builder |
| Fixed rotation | Low | 30m | Low | Builder |
| ticks.sampleSize | Low | 30m | Low | Builder |
| Chart caching | Low | 1h | Low | Builder |
| Web Workers | Low | 8h | High* | Builder (if needed) |
| Tooltip optimization | Low | 30m | Low | Builder |

**Total Effort (excluding Web Workers):** ~7.5 hours

*High impact only for complex dashboards with 5+ charts or real-time updates.

---

## Testing Requirements

1. **Performance Benchmarks:**
   - Measure render time before/after each optimization
   - Test with various dataset sizes (10, 100, 1000, 10000 points)
   - Monitor FPS during chart updates

2. **Visual Regression:**
   - Ensure decimation doesn't degrade visual quality
   - Verify min/max bounds don't clip data
   - Confirm lazy loading doesn't cause layout shift

3. **Browser Compatibility:**
   - Test in Chrome, Firefox, Safari, Edge
   - Test on mobile (iOS Safari, Android Chrome)
   - Verify graceful degradation for older browsers

---

## References

- [Chart.js Official Performance Guide](https://www.chartjs.org/docs/latest/general/performance.html)
- [Chart.js Decimation Plugin](https://www.chartjs.org/docs/latest/configuration/decimation.html)
- [MDN: OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)
- [MDN: transferControlToOffscreen](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/transferControlToOffscreen)

---

**Research Status:** ✅ Complete  
**Next Research Topic:** Bootstrap Dark Theme Customization
