# Chart.js Financial Dashboard Research Report
**Project:** Fireside Capital Dashboard  
**Date:** February 16, 2026  
**Researcher:** Capital (Orchestrator Agent)  
**Status:** ✅ Complete

---

## Executive Summary

Fireside Capital uses **Chart.js** for all dashboard visualizations with:
- ✅ Performance optimizations (67% faster rendering)
- ✅ Basic dark/light theme support (`getThemeColors()`)
- ✅ Time range filters with localStorage persistence
- ⚠️ **Hardcoded colors** (not using CSS custom properties)
- ⚠️ **Manual theme updates** (charts don't auto-update on theme change)
- ⚠️ **Limited responsiveness** (legend position could be improved)

**Key Recommendation:** Integrate CSS custom properties for dynamic theming and add theme change listener to update all charts automatically.

---

## Current Implementation

### Chart Instances
**Location:** `app/assets/js/charts.js`

```javascript
let chartInstances = {
  netWorth: null,                  // Line chart - net worth over time
  cashFlow: null,                  // Bar chart - income vs expenses
  netWorthDelta: null,             // Bar chart - monthly net worth change
  spendingCategories: null,        // Doughnut - spending breakdown
  savingsRate: null,               // Line chart - savings rate %
  investmentGrowth: null,          // Line chart - investment projections
  assetAllocation: null,           // Pie chart - asset types
  dtiGauge: null                   // Doughnut gauge - debt-to-income ratio
};
```

### Performance Optimizations (FC-093)
**Status:** ✅ Already implemented

```javascript
// Global defaults for all charts (67% faster)
Chart.defaults.animation = false;              // Disable animations (enables Path2D caching)
Chart.defaults.responsive = true;              // Enable responsive behavior
Chart.defaults.maintainAspectRatio = false;    // Allow flexible aspect ratios
Chart.defaults.datasets.line.tension = 0;      // Straight lines (faster rendering)
Chart.defaults.datasets.line.spanGaps = true;  // Skip line segmentation on gaps
```

**Impact:** 67% faster chart rendering compared to default settings.

### Theme Support
**Location:** `app/assets/js/app.js:149`

**Current Implementation:**
```javascript
function getThemeColors() {
  const currentTheme = document.body.getAttribute('data-theme') || 'dark';
  
  if (currentTheme === 'light') {
    return {
      fill: 'rgba(244, 78, 36, 0.15)',
      text: '#1a1a1a',
      grid: 'rgba(0, 0, 0, 0.08)'
    };
  } else {
    return {
      fill: 'rgba(244, 78, 36, 0.15)',
      text: '#f0f0f0',
      grid: 'rgba(240, 240, 240, 0.08)'
    };
  }
}
```

**Usage Example:**
```javascript
const theme = getThemeColors();

chartInstances.netWorth = await safeCreateChart(ctx, {
  type: 'line',
  data: {
    labels: filtered.labels,
    datasets: [{
      label: 'Net Worth',
      data: filtered.data,
      borderColor: '#f44e24',               // ❌ Hardcoded
      backgroundColor: 'rgba(244, 78, 36, 0.15)',  // ❌ Hardcoded
      pointBackgroundColor: '#f44e24',      // ❌ Hardcoded
      pointBorderColor: '#fff'              // ❌ Hardcoded
    }]
  },
  options: {
    scales: {
      y: {
        ticks: { color: theme.text },       // ✅ Dynamic
        grid: { color: theme.grid }         // ✅ Dynamic
      },
      x: {
        ticks: { color: theme.text }        // ✅ Dynamic
      }
    }
  }
});
```

**Issues:**
1. ❌ Dataset colors are hardcoded (don't change with theme)
2. ❌ No listener for theme changes (charts don't update until page reload)
3. ❌ Not using CSS custom properties (duplicates design tokens)

---

## Chart.js Dark Theme Support (Industry Research)

### Finding: No Native Support
Chart.js **does not** have built-in `prefers-color-scheme` support. From the Chart.js GitHub discussion (#9214):

> "The detection is easy, but too slow to do in chart update: `window.matchMedia('(prefers-color-scheme: dark)').matches`. So I don't think we will be doing it in the core lib."

### Recommended Approach: CSS Custom Properties
**Best practice** (2026): Use CSS custom properties for all chart colors and read them in JavaScript.

**Example:**
```css
/* design-tokens.css */
:root {
  --chart-primary: #f44e24;
  --chart-secondary: #01a4ef;
  --chart-success: #81b900;
  --chart-danger: #e53935;
  --chart-text: #f0f0f0;
  --chart-grid: rgba(240, 240, 240, 0.08);
  --chart-fill: rgba(244, 78, 36, 0.15);
}

body[data-theme='light'] {
  --chart-text: #1a1a1a;
  --chart-grid: rgba(0, 0, 0, 0.08);
}
```

```javascript
// Get CSS variable value
function getCSSVariable(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// Use in charts
borderColor: getCSSVariable('--chart-primary'),
backgroundColor: getCSSVariable('--chart-fill'),
```

---

## Recommendations

### 1. **Integrate CSS Custom Properties (High Priority)**

**Problem:** Colors are hardcoded, duplicating design tokens from `design-tokens.css`.

**Solution:** Add chart-specific CSS variables and read them in JavaScript.

**Implementation:**

#### Step 1: Add to `design-tokens.css`
```css
/* =================================================================
   CHART COLORS — Based on brand colors
   ================================================================= */
:root {
  /* Primary chart colors (logo-native) */
  --chart-primary: var(--color-primary);           /* #f44e24 */
  --chart-secondary: var(--color-secondary);       /* #01a4ef */
  --chart-success: var(--color-accent);            /* #81b900 */
  --chart-danger: var(--color-danger);             /* #e53935 */
  --chart-warning: var(--color-warning);           /* #ffc107 */
  --chart-info: var(--color-info);                 /* #01a4ef */
  
  /* Chart UI elements */
  --chart-text: var(--color-text-primary);         /* #f0f0f0 */
  --chart-text-muted: var(--color-text-secondary); /* #b0b0b0 */
  --chart-grid: rgba(240, 240, 240, 0.08);
  --chart-fill: rgba(244, 78, 36, 0.15);
  --chart-bg: var(--color-bg-2);                   /* #1a1a1a */
  
  /* Multi-color palette (for pie/doughnut charts) */
  --chart-palette-1: #f44e24;  /* Orange */
  --chart-palette-2: #01a4ef;  /* Blue */
  --chart-palette-3: #81b900;  /* Green */
  --chart-palette-4: #ffa726;  /* Amber */
  --chart-palette-5: #ab47bc;  /* Purple */
  --chart-palette-6: #26c6da;  /* Cyan */
  --chart-palette-7: #ef5350;  /* Red */
  --chart-palette-8: #66bb6a;  /* Light Green */
}

/* Light theme overrides */
body[data-theme='light'] {
  --chart-text: var(--color-text-primary);         /* #1a1a1a */
  --chart-grid: rgba(0, 0, 0, 0.08);
  --chart-bg: #ffffff;
}
```

#### Step 2: Create helper function in `app.js`
```javascript
/**
 * Get CSS custom property value from :root
 * @param {string} name - CSS variable name (e.g., '--chart-primary')
 * @returns {string} - Color value
 */
function getCSSVar(name) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

/**
 * Get all chart theme colors from CSS custom properties
 * @returns {object} - Theme colors object
 */
function getChartTheme() {
  return {
    // Primary colors
    primary: getCSSVar('--chart-primary'),
    secondary: getCSSVar('--chart-secondary'),
    success: getCSSVar('--chart-success'),
    danger: getCSSVar('--chart-danger'),
    warning: getCSSVar('--chart-warning'),
    info: getCSSVar('--chart-info'),
    
    // UI elements
    text: getCSSVar('--chart-text'),
    textMuted: getCSSVar('--chart-text-muted'),
    grid: getCSSVar('--chart-grid'),
    fill: getCSSVar('--chart-fill'),
    bg: getCSSVar('--chart-bg'),
    
    // Palette array
    palette: [
      getCSSVar('--chart-palette-1'),
      getCSSVar('--chart-palette-2'),
      getCSSVar('--chart-palette-3'),
      getCSSVar('--chart-palette-4'),
      getCSSVar('--chart-palette-5'),
      getCSSVar('--chart-palette-6'),
      getCSSVar('--chart-palette-7'),
      getCSSVar('--chart-palette-8')
    ]
  };
}
```

#### Step 3: Update chart creation
**Before:**
```javascript
const theme = getThemeColors();  // Old function

chartInstances.netWorth = await safeCreateChart(ctx, {
  type: 'line',
  data: {
    datasets: [{
      borderColor: '#f44e24',  // ❌ Hardcoded
      backgroundColor: 'rgba(244, 78, 36, 0.15)',
      pointBackgroundColor: '#f44e24',
      pointBorderColor: '#fff'
    }]
  },
  options: {
    scales: {
      y: { ticks: { color: theme.text } }
    }
  }
});
```

**After:**
```javascript
const theme = getChartTheme();  // ✅ New function

chartInstances.netWorth = await safeCreateChart(ctx, {
  type: 'line',
  data: {
    datasets: [{
      borderColor: theme.primary,           // ✅ Dynamic
      backgroundColor: theme.fill,          // ✅ Dynamic
      pointBackgroundColor: theme.primary,  // ✅ Dynamic
      pointBorderColor: theme.bg            // ✅ Dynamic
    }]
  },
  options: {
    scales: {
      y: { ticks: { color: theme.text } }   // ✅ Dynamic
    }
  }
});
```

---

### 2. **Add Theme Change Listener (High Priority)**

**Problem:** When user toggles dark/light mode, charts don't update until page reload.

**Solution:** Listen for theme changes and update all chart instances.

**Implementation:**

#### Add to `app.js` (after theme toggle logic)
```javascript
/**
 * Update all Chart.js instances with new theme colors
 * Call this when theme changes
 */
function updateAllChartsTheme() {
  const theme = getChartTheme();
  
  Object.values(chartInstances).forEach(chart => {
    if (!chart) return;
    
    // Update scales
    if (chart.options.scales) {
      if (chart.options.scales.y) {
        chart.options.scales.y.ticks.color = theme.text;
        chart.options.scales.y.grid.color = theme.grid;
      }
      if (chart.options.scales.x) {
        chart.options.scales.x.ticks.color = theme.text;
        chart.options.scales.x.grid.color = theme.grid;
      }
    }
    
    // Update plugins (legend, tooltip)
    if (chart.options.plugins) {
      if (chart.options.plugins.legend) {
        chart.options.plugins.legend.labels.color = theme.text;
      }
      if (chart.options.plugins.tooltip) {
        chart.options.plugins.tooltip.backgroundColor = theme.bg;
        chart.options.plugins.tooltip.titleColor = theme.text;
        chart.options.plugins.tooltip.bodyColor = theme.textMuted;
        chart.options.plugins.tooltip.borderColor = theme.primary;
      }
    }
    
    // Update chart (with 'none' mode = no animation)
    chart.update('none');
  });
}

// Add listener to theme toggle button
document.getElementById('themeToggle')?.addEventListener('click', () => {
  // ... existing theme toggle logic ...
  
  // Update charts after theme changes
  setTimeout(() => {
    updateAllChartsTheme();
  }, 50);  // Small delay to let CSS vars update
});

// Also listen for system theme changes (if using prefers-color-scheme)
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!document.getElementById('themeToggle').classList.contains('manual-override')) {
    updateAllChartsTheme();
  }
});
```

---

### 3. **Responsive Legend Positioning (Medium Priority)**

**Problem:** Chart legends are always positioned on the right, which causes overflow on mobile.

**Current Implementation:**
```javascript
function getResponsiveLegendPosition() {
  return window.innerWidth < 768 ? 'bottom' : 'right';
}
```

**Problem:** This function exists but isn't consistently used.

**Solution:** Ensure all charts use this function.

**Implementation:**

#### Update all chart configurations
```javascript
// Apply to all charts
options: {
  plugins: {
    legend: {
      position: getResponsiveLegendPosition(),
      labels: {
        color: theme.text,
        padding: window.innerWidth < 768 ? 10 : 15,
        font: {
          size: window.innerWidth < 768 ? 11 : 12
        }
      }
    }
  }
}
```

#### Add window resize listener
```javascript
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    const newPosition = getResponsiveLegendPosition();
    
    Object.values(chartInstances).forEach(chart => {
      if (!chart || !chart.options.plugins?.legend) return;
      
      chart.options.plugins.legend.position = newPosition;
      chart.options.plugins.legend.labels.padding = window.innerWidth < 768 ? 10 : 15;
      chart.options.plugins.legend.labels.font.size = window.innerWidth < 768 ? 11 : 12;
      chart.update('none');
    });
  }, 250);
});
```

---

### 4. **Improve Tooltip Styling (Low Priority)**

**Problem:** Tooltips use default Chart.js styling, which doesn't match Fireside brand.

**Recommendation:** Customize tooltip appearance.

**Implementation:**

#### Add global Chart.js tooltip defaults
```javascript
// Add to charts.js (after other Chart.defaults)
Chart.defaults.plugins.tooltip = {
  backgroundColor: getCSSVar('--color-bg-2'),
  titleColor: getCSSVar('--color-text-primary'),
  bodyColor: getCSSVar('--color-text-secondary'),
  borderColor: getCSSVar('--chart-primary'),
  borderWidth: 1,
  padding: 12,
  boxPadding: 6,
  usePointStyle: true,
  cornerRadius: 8,  // Match design system border radius
  titleFont: {
    family: getCSSVar('--font-body'),
    size: 14,
    weight: '600'
  },
  bodyFont: {
    family: getCSSVar('--font-body'),
    size: 13
  },
  callbacks: {
    // Format currency values
    label: function(context) {
      let label = context.dataset.label || '';
      if (label) {
        label += ': ';
      }
      
      // Check if value is currency (datasets with $ in label)
      if (context.dataset.label && 
          (context.dataset.label.includes('$') || 
           context.dataset.label.toLowerCase().includes('worth') ||
           context.dataset.label.toLowerCase().includes('income'))) {
        label += formatCurrency(context.parsed.y || context.parsed);
      } else {
        label += context.formattedValue;
      }
      
      return label;
    }
  }
};
```

---

### 5. **Add Loading States (Medium Priority)**

**Problem:** Charts appear instantly without data, causing layout shift.

**Recommendation:** Use skeleton loaders while charts initialize.

**Implementation:**

#### Add skeleton CSS (see CSS Architecture report)
```css
/* In components.css */
.chart-skeleton {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--color-bg-2) 0%,
    var(--color-bg-3) 50%,
    var(--color-bg-2) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: var(--radius-md);
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

#### Update chart creation
```javascript
async function createNetWorthChart() {
  const canvas = document.getElementById('netWorthChart');
  if (!canvas) return;
  
  // Show loading state
  canvas.parentElement.classList.add('chart-skeleton');
  
  try {
    // ... fetch data and create chart ...
    
    // Remove loading state
    canvas.parentElement.classList.remove('chart-skeleton');
  } catch (error) {
    canvas.parentElement.classList.remove('chart-skeleton');
    canvas.parentElement.innerHTML = '<p class="text-muted text-center">Unable to load chart data.</p>';
  }
}
```

---

## Financial Dashboard Patterns (Best Practices)

### 1. **Color Semantics**
**Use consistent colors for financial data:**

```javascript
const financialColors = {
  income: getCSSVar('--chart-success'),     // Green
  expense: getCSSVar('--chart-danger'),     // Red
  asset: getCSSVar('--chart-secondary'),    // Blue
  liability: getCSSVar('--chart-warning'),  // Amber
  netWorth: getCSSVar('--chart-primary')    // Orange
};
```

**Example: Cash Flow Chart**
```javascript
datasets: [
  {
    label: 'Income',
    data: incomeData,
    backgroundColor: financialColors.income,  // ✅ Green = positive
    borderColor: financialColors.income
  },
  {
    label: 'Expenses',
    data: expenseData,
    backgroundColor: financialColors.expense,  // ✅ Red = negative
    borderColor: financialColors.expense
  }
]
```

### 2. **Tabular Number Formatting**
**Use monospace fonts for currency values in tooltips:**

```javascript
callbacks: {
  label: function(context) {
    return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
  }
},
bodyFont: {
  family: getCSSVar('--font-mono'),  // Monospace for currency
  size: 13
}
```

### 3. **Accessibility (WCAG 2.1 AA)**
**Ensure charts are keyboard navigable and screen-reader friendly:**

```html
<canvas id="netWorthChart" 
        role="img" 
        aria-label="Net worth over time line chart showing growth from January to June">
</canvas>
```

```javascript
// Add ARIA labels dynamically
options: {
  plugins: {
    aria: {
      enabled: true,
      description: function(chart) {
        const data = chart.data.datasets[0].data;
        const latest = data[data.length - 1];
        const earliest = data[0];
        const change = latest - earliest;
        const changePercent = ((change / earliest) * 100).toFixed(1);
        
        return `Net worth chart showing ${changePercent}% ${change >= 0 ? 'increase' : 'decrease'} from ${formatCurrency(earliest)} to ${formatCurrency(latest)}`;
      }
    }
  }
}
```

---

## Performance Recommendations

### 1. **Data Decimation (Already Implemented)**
**Status:** ✅ Already using for datasets with 100+ points

```javascript
function shouldEnableDecimation(dataLength) {
  return dataLength > 100;
}
```

### 2. **Chart Caching**
**Recommendation:** Cache chart instances to avoid re-creation on page navigation.

```javascript
// Store in sessionStorage (survives page refresh)
function saveChartState(chartId, data, labels) {
  const state = { data, labels, timestamp: Date.now() };
  sessionStorage.setItem(`chart_${chartId}`, JSON.stringify(state));
}

function loadChartState(chartId, maxAge = 300000) {  // 5 minutes
  const cached = sessionStorage.getItem(`chart_${chartId}`);
  if (!cached) return null;
  
  const state = JSON.parse(cached);
  if (Date.now() - state.timestamp > maxAge) {
    sessionStorage.removeItem(`chart_${chartId}`);
    return null;
  }
  
  return state;
}
```

### 3. **Lazy Loading**
**Recommendation:** Only initialize charts when they enter viewport.

```javascript
// Use Intersection Observer
const chartObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.initialized) {
      const chartId = entry.target.id;
      initializeChart(chartId);
      entry.target.dataset.initialized = 'true';
      chartObserver.unobserve(entry.target);
    }
  });
}, { rootMargin: '50px' });

// Observe all chart canvases
document.querySelectorAll('canvas[id$="Chart"]').forEach(canvas => {
  chartObserver.observe(canvas);
});
```

---

## Testing Recommendations

### 1. **Visual Regression Testing**
**Tools:** Percy.io, Chromatic, or Playwright screenshots

```javascript
// Add to test suite
test('charts render correctly in dark mode', async ({ page }) => {
  await page.goto('/dashboard');
  await page.evaluate(() => {
    document.body.setAttribute('data-theme', 'dark');
  });
  await page.waitForTimeout(100);  // Let theme apply
  
  const screenshot = await page.screenshot();
  expect(screenshot).toMatchSnapshot('dashboard-dark.png');
});

test('charts render correctly in light mode', async ({ page }) => {
  await page.goto('/dashboard');
  await page.evaluate(() => {
    document.body.setAttribute('data-theme', 'light');
  });
  await page.waitForTimeout(100);
  
  const screenshot = await page.screenshot();
  expect(screenshot).toMatchSnapshot('dashboard-light.png');
});
```

### 2. **Accessibility Testing**
**Tools:** axe-core, Pa11y

```javascript
// Add to test suite
test('charts are keyboard accessible', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Tab through charts
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => document.activeElement.id);
  expect(focused).toContain('Chart');
  
  // Check ARIA labels
  const ariaLabel = await page.getAttribute('#netWorthChart', 'aria-label');
  expect(ariaLabel).toBeTruthy();
});
```

---

## Action Items

### Immediate (This Sprint)
- [ ] **Create task:** Add CSS custom properties for chart colors
- [ ] **Create task:** Implement theme change listener for charts
- [ ] **Create task:** Test theme switching on all 8 charts

### Next Sprint
- [ ] **Create task:** Add loading states (skeleton loaders)
- [ ] **Create task:** Improve tooltip styling
- [ ] **Create task:** Implement responsive legend positioning

### Future
- [ ] Add visual regression testing (Percy/Chromatic)
- [ ] Implement lazy loading for below-fold charts
- [ ] Add chart export functionality (PNG/SVG)
- [ ] Consider Chart.js v5 migration (when stable)

---

## Code Examples

### Example 1: Complete Net Worth Chart with New Theme System
```javascript
async function createNetWorthChart() {
  const ctx = document.getElementById('netWorthChart');
  if (!ctx) return;
  
  // Get theme colors from CSS variables
  const theme = getChartTheme();
  
  // Fetch data
  const snapshots = await fetchSnapshots();
  const labels = snapshots.map(s => s.date);
  const data = snapshots.map(s => s.netWorth);
  
  // Destroy existing chart
  if (chartInstances.netWorth) {
    chartInstances.netWorth.destroy();
  }
  
  // Create chart with dynamic theme
  chartInstances.netWorth = await safeCreateChart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Net Worth',
        data: data,
        borderColor: theme.primary,
        backgroundColor: theme.fill,
        pointBackgroundColor: theme.primary,
        pointBorderColor: theme.bg,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          ticks: {
            callback: (value) => formatCurrency(value),
            color: theme.text,
            font: { family: theme.fontBody }
          },
          grid: {
            color: theme.grid,
            drawBorder: false
          }
        },
        x: {
          ticks: {
            color: theme.text,
            font: { family: theme.fontBody }
          },
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: theme.bg,
          titleColor: theme.text,
          bodyColor: theme.textMuted,
          borderColor: theme.primary,
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (context) => {
              return `Net Worth: ${formatCurrency(context.parsed.y)}`;
            }
          }
        }
      }
    }
  });
}
```

### Example 2: Cash Flow Chart with Semantic Colors
```javascript
async function createCashFlowChart() {
  const theme = getChartTheme();
  
  chartInstances.cashFlow = await safeCreateChart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          backgroundColor: theme.success,  // ✅ Green = positive
          borderColor: theme.success,
          borderWidth: 2
        },
        {
          label: 'Expenses',
          data: expenseData,
          backgroundColor: theme.danger,   // ✅ Red = negative
          borderColor: theme.danger,
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          ticks: {
            callback: (value) => formatCurrency(value),
            color: theme.text
          },
          grid: { color: theme.grid }
        },
        x: {
          ticks: { color: theme.text },
          grid: { display: false }
        }
      },
      plugins: {
        legend: {
          position: getResponsiveLegendPosition(),
          labels: { color: theme.text }
        }
      }
    }
  });
}
```

---

## Conclusion

The Fireside Capital Chart.js implementation is **performant and functional** but would benefit from:
1. ✅ CSS custom property integration (eliminate hardcoded colors)
2. ✅ Theme change listener (instant theme updates)
3. ✅ Improved responsive behavior (legend positioning)

**Priority Actions:**
1. 🎯 Add CSS custom properties for charts
2. 🎯 Implement theme change listener
3. 🎯 Test on all 8 dashboard charts

**Next Research Topic:** Bootstrap Dark Theme (verify current approach vs. Bootstrap 5.3+ dark mode features)

---

**Research Completed By:** Capital (Orchestrator)  
**Date:** February 16, 2026, 6:50 AM EST  
**Status:** Ready for Builder implementation
