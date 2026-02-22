# Chart.js Implementation Guide — Fireside Capital
**Date:** February 22, 2026, 6:30 AM  
**Status:** Consolidation of all Chart.js research  
**Priority:** Medium — Builds on existing strong foundation

---

## Executive Summary

Fireside Capital already has **excellent Chart.js foundations**:
- ✅ Global dark theme (`chart-theme.js`)
- ✅ Optimized factory pattern (`chart-factory.js`)
- ✅ Decimation for large datasets (LTTB algorithm)
- ✅ Currency formatting, mobile optimizations
- ✅ Disabled animations (faster rendering)

This guide consolidates **100+ KB of research** into **8 actionable tasks** for the next level of chart optimization.

---

## 🎯 Implementation Tasks

### Priority 1: Quick Wins (< 2 hours total)

#### Task FC-CHART-006: Dynamic Theme Switching
**Problem:** Charts don't update when user toggles dark/light mode  
**Effort:** 30 minutes  
**Impact:** Visual consistency  

**Implementation:**
```javascript
// Add to chart-theme.js

/**
 * Update all Chart.js instances when theme changes.
 * Call when user toggles dark/light mode.
 */
function updateAllChartThemes() {
  const rootStyles = getComputedStyle(document.documentElement);
  const getToken = (prop) => rootStyles.getPropertyValue(prop).trim();

  // Update global defaults
  Chart.defaults.color = getToken('--color-text-secondary');
  Chart.defaults.borderColor = getToken('--color-border-subtle');
  Chart.defaults.backgroundColor = getToken('--color-bg-2');

  // Refresh all charts
  Object.values(Chart.instances).forEach(chart => {
    if (chart.options.scales) {
      Object.keys(chart.options.scales).forEach(scaleKey => {
        const scale = chart.options.scales[scaleKey];
        if (scale.grid) scale.grid.color = getToken('--color-border-subtle');
        if (scale.ticks) scale.ticks.color = getToken('--color-text-tertiary');
      });
    }
    chart.update('none'); // Redraw without animation
  });
}

// Listen for theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateAllChartThemes);

// Expose globally
window.updateAllChartThemes = updateAllChartThemes;
```

**Testing:**
1. Toggle browser dark/light mode
2. Charts should update colors instantly
3. Verify no performance regression

---

#### Task FC-CHART-007: Keyboard Navigation
**Problem:** Charts not keyboard-accessible (WCAG 2.1 AA failure)  
**Effort:** 1 hour  
**Impact:** Accessibility compliance  

**Implementation:**
```javascript
// Add to chart-factory.js

function createOptimizedChart(canvas, config) {
  // ... existing code ...

  // Add keyboard navigation
  canvas.setAttribute('tabindex', '0');
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', config.options.plugins?.title?.text || 'Financial chart');

  let highlightedIndex = null;

  canvas.addEventListener('keydown', (e) => {
    const chart = Chart.getChart(canvas);
    if (!chart || !chart.data.datasets[0]) return;

    const dataLength = chart.data.datasets[0].data.length;

    switch(e.key) {
      case 'ArrowRight':
        highlightedIndex = (highlightedIndex === null) ? 0 : Math.min(highlightedIndex + 1, dataLength - 1);
        announceDataPoint(chart, highlightedIndex);
        e.preventDefault();
        break;
      case 'ArrowLeft':
        highlightedIndex = (highlightedIndex === null) ? dataLength - 1 : Math.max(highlightedIndex - 1, 0);
        announceDataPoint(chart, highlightedIndex);
        e.preventDefault();
        break;
    }
  });

  return chart;
}

function announceDataPoint(chart, index) {
  const label = chart.data.labels[index];
  const value = chart.data.datasets[0].data[index];
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  
  const announcement = `${label}: ${formatted}`;
  
  // Update aria-live region (create if doesn't exist)
  let liveRegion = document.getElementById('chart-announcements');
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'chart-announcements';
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(liveRegion);
  }
  
  liveRegion.textContent = announcement;
}
```

**CSS (add to styles.css):**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

**Testing:**
1. Tab to a chart
2. Press Arrow Right/Left to navigate data points
3. Verify screen reader announces values
4. Test with NVDA, JAWS, VoiceOver

---

#### Task FC-CHART-008: Export to Image
**Problem:** Users can't save charts for reports/sharing  
**Effort:** 30 minutes  
**Impact:** User requested feature  

**Implementation:**
```javascript
// Add to chart-factory.js or new chart-utils.js

/**
 * Export any Chart.js chart to PNG
 * @param {HTMLCanvasElement} canvas - Chart canvas element
 * @param {string} filename - Download filename (default: 'chart.png')
 */
function exportChartToPNG(canvas, filename = 'fireside-chart.png') {
  // Get chart instance
  const chart = Chart.getChart(canvas);
  if (!chart) {
    console.error('No Chart.js instance found on canvas');
    return;
  }

  // Temporarily enable white background (charts are transparent by default)
  const originalBg = chart.options.plugins.customCanvasBackgroundColor?.color;
  if (!chart.options.plugins.customCanvasBackgroundColor) {
    chart.options.plugins.customCanvasBackgroundColor = {};
  }
  chart.options.plugins.customCanvasBackgroundColor.color = '#1a1a2e'; // Dark theme background
  chart.update('none');

  // Convert to blob and download
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);

    // Restore original background
    if (originalBg) {
      chart.options.plugins.customCanvasBackgroundColor.color = originalBg;
    } else {
      delete chart.options.plugins.customCanvasBackgroundColor;
    }
    chart.update('none');
  });
}

// Example usage:
// exportChartToPNG(document.getElementById('netWorthChart'), 'net-worth-feb-2026.png');
```

**Add export button to dashboard:**
```html
<!-- Add near each chart -->
<div class="chart-header d-flex justify-content-between align-items-center mb-2">
  <h5 class="mb-0">Net Worth Over Time</h5>
  <button class="btn btn-sm btn-outline-secondary" onclick="exportChartToPNG(document.getElementById('netWorthChart'), 'net-worth.png')">
    <i class="bi bi-download"></i> Export
  </button>
</div>
<canvas id="netWorthChart" height="300"></canvas>
```

**Testing:**
1. Click "Export" button on any chart
2. Verify PNG downloads with correct filename
3. Verify dark theme background is included
4. Check image quality (should be high-res)

---

### Priority 2: Performance Enhancements (3-4 hours)

#### Task FC-CHART-009: Lazy Load Chart.js
**Problem:** 270KB Chart.js library loads on every page (even non-chart pages)  
**Effort:** 2 hours  
**Impact:** 270KB saved on bills.html, income.html, debts.html, settings.html  

**Implementation:**
```javascript
// assets/js/lazy-loader.js (NEW FILE)

const CHART_PAGES = ['index.html', 'investments.html', 'reports.html'];

function needsCharts() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  return CHART_PAGES.includes(currentPage);
}

async function loadChartJS() {
  if (window.Chart) return Promise.resolve(); // Already loaded
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('✅ Chart.js lazy-loaded (270KB saved on non-chart pages)');
      
      // Load chart-theme.js after Chart.js is ready
      const themeScript = document.createElement('script');
      themeScript.src = 'assets/js/chart-theme.js';
      themeScript.onload = () => {
        // Load chart-factory.js
        const factoryScript = document.createElement('script');
        factoryScript.src = 'assets/js/chart-factory.js';
        factoryScript.onload = resolve;
        factoryScript.onerror = reject;
        document.head.appendChild(factoryScript);
      };
      themeScript.onerror = reject;
      document.head.appendChild(themeScript);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Auto-load on chart pages
if (needsCharts()) {
  document.addEventListener('DOMContentLoaded', () => {
    loadChartJS().then(() => {
      console.log('✅ Charts ready');
      // Trigger custom event for page-specific chart initialization
      window.dispatchEvent(new Event('chartsReady'));
    });
  });
}

// Expose for manual loading
window.loadChartJS = loadChartJS;
```

**Update index.html, investments.html, reports.html:**
```html
<!-- REMOVE these lines: -->
<!-- <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script> -->
<!-- <script src="assets/js/chart-theme.js"></script> -->
<!-- <script src="assets/js/chart-factory.js"></script> -->

<!-- ADD this instead: -->
<script src="assets/js/lazy-loader.js"></script>

<!-- Update chart initialization to wait for chartsReady event: -->
<script>
  window.addEventListener('chartsReady', () => {
    // Existing chart code here
    loadDashboardCharts();
  });
</script>
```

**Testing:**
1. Open bills.html → Network tab shows NO Chart.js load
2. Open index.html → Chart.js loads + charts render correctly
3. Verify all 3 chart pages work (index, investments, reports)
4. Check console for "✅ Charts ready" message

**Expected Impact:**
- **Bills.html load time:** 2.1s → 1.4s (33% faster)
- **Income.html load time:** 1.9s → 1.3s (32% faster)
- **Total bandwidth saved:** ~270KB per non-chart page visit

---

#### Task FC-CHART-010: Real-Time Data Updates
**Problem:** Charts require full page reload to show new data  
**Effort:** 2 hours  
**Impact:** Live dashboard experience  

**Implementation:**
```javascript
// Add to chart-factory.js

/**
 * Update chart data without full re-render
 * @param {Chart} chart - Chart.js instance
 * @param {Object} newData - { labels: [...], datasets: [{ data: [...] }] }
 */
function updateChartData(chart, newData) {
  // Update labels if provided
  if (newData.labels) {
    chart.data.labels = newData.labels;
  }

  // Update datasets
  if (newData.datasets) {
    newData.datasets.forEach((newDataset, index) => {
      if (chart.data.datasets[index]) {
        // Update existing dataset
        Object.assign(chart.data.datasets[index], newDataset);
      } else {
        // Add new dataset
        chart.data.datasets.push(newDataset);
      }
    });
  }

  // Efficient update (no animation)
  chart.update('none');
}

// Supabase Realtime Integration
function subscribeToChartUpdates(tableName, chartId, transformData) {
  const chart = Chart.getChart(document.getElementById(chartId));
  if (!chart) {
    console.error(`Chart ${chartId} not found`);
    return;
  }

  // Subscribe to Supabase realtime changes
  const subscription = supabase
    .channel(`${tableName}_changes`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: tableName },
      async (payload) => {
        console.log(`📊 Chart update: ${tableName}`, payload);
        
        // Re-fetch data and update chart
        const { data } = await supabase.from(tableName).select('*').order('created_at', { ascending: false });
        const chartData = transformData(data);
        updateChartData(chart, chartData);
      }
    )
    .subscribe();

  return subscription;
}

// Example usage:
// subscribeToChartUpdates('snapshots', 'netWorthChart', (data) => ({
//   labels: data.map(s => new Date(s.date).toLocaleDateString()),
//   datasets: [{ data: data.map(s => s.net_worth) }]
// }));
```

**Testing:**
1. Open dashboard
2. In another tab, add a transaction in Supabase dashboard
3. Verify chart updates within 1-2 seconds (no page reload)
4. Check console for "📊 Chart update" messages

**Expected Impact:**
- Live dashboard experience
- No manual refreshes needed
- Better user engagement

---

### Priority 3: Advanced Features (4-6 hours)

#### Task FC-CHART-011: Sparkline Component
**Problem:** Need compact charts for KPI cards  
**Effort:** 2 hours  
**Impact:** Better dashboard density  

**Implementation:**
```javascript
// assets/js/sparkline.js (NEW FILE)

/**
 * Create a minimal sparkline chart
 * @param {string} canvasId - Canvas element ID
 * @param {number[]} data - Array of numbers
 * @param {Object} options - Color, trend indicator, etc.
 */
function createSparkline(canvasId, data, options = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const trend = data[data.length - 1] > data[0] ? 'up' : 'down';
  const color = options.color || (trend === 'up' ? '#28a745' : '#dc3545');

  return new Chart(canvas, {
    type: 'line',
    data: {
      labels: data.map((_, i) => i), // Minimal labels
      datasets: [{
        data: data,
        borderColor: color,
        backgroundColor: color + '20', // 20% opacity
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 3,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          displayColors: false,
          callbacks: {
            title: () => '',
            label: (context) => new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0
            }).format(context.parsed.y)
          }
        }
      },
      scales: {
        x: { display: false },
        y: { display: false }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  });
}

// Example usage:
// <canvas id="netWorthSparkline" height="40"></canvas>
// createSparkline('netWorthSparkline', [100000, 102000, 105000, 108000, 112000]);
```

**Add to KPI cards:**
```html
<div class="col-md-3">
  <div class="card">
    <div class="card-body">
      <h6 class="text-muted mb-1">Net Worth</h6>
      <h3 class="mb-2">$112,450</h3>
      <canvas id="netWorthSparkline" height="40"></canvas>
      <small class="text-success"><i class="bi bi-arrow-up"></i> +12.5% vs last month</small>
    </div>
  </div>
</div>
```

**Testing:**
1. Verify sparklines render in KPI cards
2. Check hover tooltips show correct values
3. Test responsiveness (mobile/desktop)

---

#### Task FC-CHART-012: Chart Error Boundaries
**Problem:** Bad data crashes entire page  
**Effort:** 1 hour  
**Impact:** Stability & user experience  

**Implementation:**
```javascript
// Add to chart-factory.js

function createOptimizedChart(canvas, config) {
  try {
    // Validate data
    if (!config.data || !config.data.datasets || config.data.datasets.length === 0) {
      throw new Error('Invalid chart data: datasets missing');
    }

    config.data.datasets.forEach((dataset, index) => {
      if (!Array.isArray(dataset.data)) {
        throw new Error(`Invalid data in dataset ${index}: expected array`);
      }
      
      // Check for NaN/Infinity
      dataset.data = dataset.data.map(val => {
        if (val === null || val === undefined || !isFinite(val)) {
          console.warn(`Invalid data point: ${val}, replacing with 0`);
          return 0;
        }
        return val;
      });
    });

    // ... existing createOptimizedChart code ...
    
  } catch (error) {
    console.error('Chart creation failed:', error);
    
    // Show error state instead of crashing
    canvas.parentElement.innerHTML = `
      <div class="alert alert-warning" role="alert">
        <i class="bi bi-exclamation-triangle"></i>
        <strong>Chart Unavailable</strong><br>
        ${error.message}. Please refresh or contact support.
      </div>
    `;
    
    return null;
  }
}
```

**Testing:**
1. Pass invalid data: `createOptimizedChart(canvas, { data: null })`
2. Verify error message displays (no crash)
3. Pass data with NaN: `{ data: { datasets: [{ data: [1, NaN, 3] }] } }`
4. Verify NaN is replaced with 0 + warning logged

---

#### Task FC-CHART-013: Waterfall Chart for Cash Flow
**Problem:** Hard to visualize income vs expenses visually  
**Effort:** 3 hours  
**Impact:** Better cash flow analysis  

**Implementation:**
```javascript
// assets/js/waterfall-chart.js (NEW FILE)

/**
 * Create a waterfall chart (stacked bar with floating bars)
 * Shows income (green up), expenses (red down), net (blue)
 */
function createWaterfallChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  // Calculate cumulative values
  let cumulative = 0;
  const chartData = data.map(item => {
    const start = cumulative;
    cumulative += item.value;
    return {
      label: item.label,
      value: item.value,
      start: start,
      end: cumulative,
      color: item.value >= 0 ? '#28a745' : '#dc3545'
    };
  });

  return new Chart(canvas, {
    type: 'bar',
    data: {
      labels: chartData.map(d => d.label),
      datasets: [
        {
          label: 'Base',
          data: chartData.map(d => d.start),
          backgroundColor: 'transparent',
          borderColor: 'transparent'
        },
        {
          label: 'Change',
          data: chartData.map(d => Math.abs(d.value)),
          backgroundColor: chartData.map(d => d.color),
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => {
              const index = context.dataIndex;
              const value = chartData[index].value;
              return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(value);
            }
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false }
        },
        y: {
          stacked: true,
          ticks: {
            callback: (value) => new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0
            }).format(value)
          }
        }
      }
    }
  });
}

// Example usage:
// createWaterfallChart('cashFlowWaterfall', [
//   { label: 'Starting Balance', value: 5000 },
//   { label: 'Salary', value: 4500 },
//   { label: 'Rent', value: -1500 },
//   { label: 'Groceries', value: -400 },
//   { label: 'Utilities', value: -200 },
//   { label: 'Ending Balance', value: 7400 }
// ]);
```

**Testing:**
1. Create sample cash flow data (income + expenses)
2. Verify green bars for income, red for expenses
3. Check tooltip shows correct values
4. Verify cumulative calculation is correct

---

## 📊 Implementation Priority Matrix

| Task | Priority | Effort | Impact | When |
|------|----------|--------|--------|------|
| FC-CHART-006: Theme Switching | P1 | 30 min | Medium | Sprint 2 |
| FC-CHART-007: Keyboard Nav | P1 | 1 hour | High (A11y) | Sprint 2 |
| FC-CHART-008: Export PNG | P1 | 30 min | Medium | Sprint 2 |
| FC-CHART-009: Lazy Load | P2 | 2 hours | High | Sprint 3 |
| FC-CHART-010: Real-Time | P2 | 2 hours | High | Sprint 3 |
| FC-CHART-011: Sparklines | P3 | 2 hours | Medium | Sprint 4 |
| FC-CHART-012: Error Boundaries | P3 | 1 hour | Medium | Sprint 3 |
| FC-CHART-013: Waterfall | P3 | 3 hours | Low | Sprint 5+ |

**Total Effort:** ~12 hours  
**Expected Impact:**
- **Accessibility:** WCAG 2.1 AA compliant
- **Performance:** 33% faster load on non-chart pages
- **UX:** Live updates, export functionality, better error handling
- **Lighthouse:** +5-8 points (from accessibility + performance gains)

---

## 🧪 Testing Checklist

### Manual Testing
- [ ] Toggle dark/light mode → charts update colors
- [ ] Tab to chart → press Arrow keys → hear announcements (screen reader)
- [ ] Click "Export" on each chart → PNG downloads correctly
- [ ] Open bills.html → Network tab shows NO Chart.js load
- [ ] Add transaction in Supabase → dashboard updates live
- [ ] Pass invalid data to chart → error message displays (no crash)

### Automated Testing (Future)
- [ ] Lighthouse accessibility score > 95
- [ ] Visual regression tests (Percy/Chromatic)
- [ ] Performance budget: Chart.js lazy-load saves 270KB

---

## 📚 Research Sources

This guide consolidates findings from:
- `reports/chartjs-research.md` (20.8 KB)
- `reports/chartjs-optimization-research.md` (29.4 KB)
- `reports/chartjs-best-practices-research.md` (15.2 KB)
- `reports/chart-js-bootstrap-dark-research-2026-02-17.md` (12.1 KB)
- Industry best practices (Mint, Personal Capital, YNAB)

**Total Research Consolidated:** ~100 KB → 8 actionable tasks

---

## ✅ Next Steps

1. **For Capital (Orchestrator):**
   - Post this guide to Discord #reports
   - Create Azure DevOps work items (FC-CHART-006 through FC-CHART-013)
   - Assign to Builder for Sprint 2-3 implementation

2. **For Builder (Implementation):**
   - Start with P1 tasks (theme switching, keyboard nav, export)
   - Test on live site after each task
   - Git commit with task ID in message

3. **For Auditor (QA):**
   - Run Lighthouse accessibility audit after FC-CHART-007
   - Verify WCAG 2.1 AA compliance
   - Test screen reader compatibility (NVDA, JAWS, VoiceOver)

---

**Research Complete:** ✅  
**Implementation Ready:** ✅  
**Estimated Completion:** Sprint 2-3 (Weeks 2-3)

---

*Last Updated: February 22, 2026, 6:30 AM EST*  
*Document Owner: Capital (Orchestrator Agent)*
