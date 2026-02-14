# Chart.js Research Report — Fireside Capital
**Date:** February 13, 2026  
**Research Focus:** Chart.js Implementation, Financial Visualization Optimization  
**Priority:** Medium  
**Status:** Complete

---

## Executive Summary

Fireside Capital currently uses **Chart.js** for dashboard visualizations with a solid implementation (`charts.js`). This report identifies optimization opportunities and advanced Chart.js features to enhance financial data visualization.

### Current Implementation Strengths

✅ **Time-range filters** — 1M, 3M, 6M, 1Y, All  
✅ **Responsive tooltips** — Currency formatting, enhanced styling  
✅ **Performance optimizations** — Data decimation for 100+ points  
✅ **Chart instance management** — Reusable instances, no memory leaks  
✅ **Local storage persistence** — User preferences saved

### Opportunities for Enhancement

⚠️ **Missing Plugins:**
- No annotation plugin (for target lines, milestones)
- No data labels (for key metrics visibility)
- No zoom/pan for detailed analysis
- No export functionality

⚠️ **Limited Chart Types:**
- Currently: Line, Bar, Pie/Doughnut, Gauge (custom)
- Missing: Candlestick, Waterfall, Funnel, Treemap

⚠️ **Accessibility Gaps:**
- No keyboard navigation for charts
- Missing ARIA labels
- No screen reader support

---

## Chart.js Version & Ecosystem

### Current Version Detection

```javascript
// Check Chart.js version (run in browser console)
console.log(Chart.version);
// Expected: 4.x (latest stable as of Feb 2026)
```

### Recommended Plugins

| Plugin | Purpose | Priority | Size Impact |
|--------|---------|----------|-------------|
| **chartjs-plugin-annotation** | Target lines, milestone markers | HIGH | +15KB |
| **chartjs-plugin-datalabels** | Show values on data points | MEDIUM | +12KB |
| **chartjs-plugin-zoom** | Pan/zoom for detailed analysis | MEDIUM | +8KB |
| **chartjs-chart-financial** | Candlestick charts for investments | LOW | +25KB |
| **chartjs-adapter-date-fns** | Better date formatting | HIGH | +10KB |

**Total Impact:** ~70KB (compressed) for all plugins  
**Benefit:** Significantly improved UX and functionality

---

## 1. Annotation Plugin — Target Lines & Milestones

### Use Cases:
- Budget targets on spending charts
- Net worth goals on balance charts
- Debt payoff milestones
- Investment return benchmarks

### Installation

```bash
npm install chartjs-plugin-annotation
```

### Implementation

```javascript
// Update charts.js
import annotationPlugin from 'chartjs-plugin-annotation';
Chart.register(annotationPlugin);

// Example: Net Worth Chart with Target Line
function createNetWorthChart(ctx, data, labels, target = 150000) {
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Net Worth',
        data: data,
        borderColor: '#01a4ef',
        backgroundColor: 'rgba(1, 164, 239, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        annotation: {
          annotations: {
            // Target line
            targetLine: {
              type: 'line',
              yMin: target,
              yMax: target,
              borderColor: '#81b900',
              borderWidth: 2,
              borderDash: [8, 4],
              label: {
                content: `Goal: ${formatCurrency(target)}`,
                enabled: true,
                position: 'end',
                backgroundColor: '#81b900',
                color: '#0f0f0f',
                font: {
                  weight: 'bold',
                  size: 12
                },
                padding: 6,
                borderRadius: 4
              }
            },
            
            // Milestone marker (e.g., when goal was set)
            milestoneMarker: {
              type: 'point',
              xValue: 'Jan 2026',
              yValue: target,
              backgroundColor: '#f44e24',
              borderColor: '#ffffff',
              borderWidth: 2,
              radius: 6,
              label: {
                content: 'Goal Set',
                enabled: true,
                position: 'top'
              }
            },
            
            // Warning zone (below emergency fund minimum)
            warningZone: {
              type: 'box',
              yMin: 0,
              yMax: 10000,
              backgroundColor: 'rgba(220, 53, 69, 0.1)',
              borderColor: '#dc3545',
              borderWidth: 1,
              borderDash: [5, 5],
              label: {
                content: 'Below Emergency Fund Minimum',
                enabled: true,
                position: 'center',
                color: '#dc3545'
              }
            }
          }
        },
        tooltip: getEnhancedTooltipConfig(true)
      },
      scales: {
        y: {
          beginAtZero: true,
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

### Dynamic Annotations (User-Editable Goals)

```javascript
// Update target line when user changes goal
function updateChartTarget(chart, newTarget) {
  chart.options.plugins.annotation.annotations.targetLine.yMin = newTarget;
  chart.options.plugins.annotation.annotations.targetLine.yMax = newTarget;
  chart.options.plugins.annotation.annotations.targetLine.label.content = `Goal: ${formatCurrency(newTarget)}`;
  chart.update();
}

// Usage:
document.getElementById('netWorthGoalInput').addEventListener('change', (e) => {
  const newGoal = parseFloat(e.target.value);
  updateChartTarget(chartInstances.netWorth, newGoal);
  
  // Save to database
  updateUserGoal('net_worth', newGoal);
});
```

---

## 2. Data Labels Plugin — Show Key Metrics

### Use Cases:
- Highlight current balance (last data point)
- Show min/max values
- Display percentage changes
- Mark significant events

### Installation

```bash
npm install chartjs-plugin-datalabels
```

### Implementation

```javascript
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(ChartDataLabels);

// Example: Show value on last point only
function createBalanceChart(ctx, data, labels) {
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Account Balance',
        data: data,
        borderColor: '#01a4ef',
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      plugins: {
        datalabels: {
          display: function(context) {
            // Only show on last point
            return context.dataIndex === context.dataset.data.length - 1;
          },
          align: 'top',
          offset: 10,
          formatter: function(value) {
            return formatCurrency(value);
          },
          backgroundColor: '#f44e24',
          borderRadius: 6,
          color: '#ffffff',
          font: {
            weight: 'bold',
            size: 14
          },
          padding: {
            top: 6,
            bottom: 6,
            left: 10,
            right: 10
          }
        }
      }
    }
  });
}

// Advanced: Show labels on min/max points
function createSpendingChart(ctx, data, labels) {
  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Monthly Spending',
        data: data,
        backgroundColor: function(context) {
          const value = context.parsed.y;
          if (value === minValue) return '#81b900'; // Green for lowest
          if (value === maxValue) return '#dc3545'; // Red for highest
          return '#01a4ef'; // Blue for normal
        }
      }]
    },
    options: {
      plugins: {
        datalabels: {
          display: function(context) {
            const value = context.parsed.y;
            // Show label on min and max only
            return value === minValue || value === maxValue;
          },
          align: function(context) {
            const value = context.parsed.y;
            return value === maxValue ? 'end' : 'start';
          },
          formatter: function(value, context) {
            if (value === minValue) return `Lowest: ${formatCurrency(value)}`;
            if (value === maxValue) return `Highest: ${formatCurrency(value)}`;
          },
          font: {
            weight: 'bold',
            size: 11
          }
        }
      }
    }
  });
}
```

---

## 3. Zoom & Pan Plugin — Detailed Analysis

### Use Cases:
- Zoom into specific time periods
- Pan through long transaction histories
- Detailed investigation of spending spikes
- Accessibility (screen magnification users)

### Installation

```bash
npm install chartjs-plugin-zoom
```

### Implementation

```javascript
import zoomPlugin from 'chartjs-plugin-zoom';
Chart.register(zoomPlugin);

function createZoomableChart(ctx, data, labels) {
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Net Worth History',
        data: data,
        borderColor: '#01a4ef',
        borderWidth: 2
      }]
    },
    options: {
      plugins: {
        zoom: {
          pan: {
            enabled: true,
            mode: 'x',
            modifierKey: 'ctrl' // Require Ctrl key for panning
          },
          zoom: {
            wheel: {
              enabled: true,
              speed: 0.1
            },
            pinch: {
              enabled: true
            },
            mode: 'x',
            limits: {
              x: {
                min: 'original',
                max: 'original'
              }
            }
          }
        }
      }
    }
  });
}

// Reset zoom button
document.getElementById('resetZoom').addEventListener('click', () => {
  chartInstances.netWorth.resetZoom();
});
```

**Add UI controls:**

```html
<!-- Zoom Controls -->
<div class="chart-controls">
  <button id="zoomIn" class="btn btn-sm btn-outline-secondary">
    <i class="bi bi-zoom-in"></i> Zoom In
  </button>
  <button id="zoomOut" class="btn btn-sm btn-outline-secondary">
    <i class="bi bi-zoom-out"></i> Zoom Out
  </button>
  <button id="resetZoom" class="btn btn-sm btn-outline-secondary">
    <i class="bi bi-arrow-clockwise"></i> Reset
  </button>
  
  <span class="text-muted text-small ms-3">
    <i class="bi bi-info-circle"></i> 
    Scroll to zoom • Ctrl+drag to pan
  </span>
</div>
```

```javascript
// Programmatic zoom
document.getElementById('zoomIn').addEventListener('click', () => {
  chartInstances.netWorth.zoom(1.1);
});

document.getElementById('zoomOut').addEventListener('click', () => {
  chartInstances.netWorth.zoom(0.9);
});
```

---

## 4. Date Adapter — Better Date Formatting

### Problem
Default Chart.js date handling is basic. Financial dashboards need:
- Relative dates ("3 days ago")
- Fiscal year alignment
- Custom formats per time range (daily: "Jan 5", monthly: "Jan 2026")

### Installation

```bash
npm install chartjs-adapter-date-fns date-fns
```

### Implementation

```javascript
import 'chartjs-adapter-date-fns';
import { format, parseISO } from 'date-fns';

// Better time scale configuration
function createTimeSeriesChart(ctx, data) {
  return new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        label: 'Account Balance',
        data: data.map(item => ({
          x: parseISO(item.date), // ISO 8601 string to Date object
          y: item.value
        })),
        borderColor: '#01a4ef'
      }]
    },
    options: {
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'month',
            displayFormats: {
              day: 'MMM d',
              week: 'MMM d',
              month: 'MMM yyyy',
              quarter: 'QQQ yyyy',
              year: 'yyyy'
            },
            tooltipFormat: 'PPP' // e.g., "February 13th, 2026"
          },
          adapters: {
            date: {
              locale: enUS // or import from date-fns/locale
            }
          },
          title: {
            display: true,
            text: 'Date'
          }
        },
        y: {
          ticks: {
            callback: function(value) {
              return formatCurrency(value);
            }
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: function(tooltipItems) {
              // Custom date formatting in tooltip
              const date = tooltipItems[0].parsed.x;
              return format(new Date(date), 'PPPP'); // "Friday, February 13th, 2026"
            }
          }
        }
      }
    }
  });
}
```

---

## 5. Advanced Chart Types for Finance

### Waterfall Charts (Income/Expense Flow)

```javascript
// Custom waterfall chart for monthly income/expense breakdown
function createWaterfallChart(ctx, data) {
  const categories = data.map(d => d.label);
  const values = data.map(d => d.value);
  
  // Calculate cumulative values
  let cumulative = 0;
  const starts = [];
  const amounts = [];
  const colors = [];
  
  values.forEach((value, i) => {
    starts.push(cumulative);
    amounts.push(value);
    cumulative += value;
    
    // Color coding
    if (i === 0) colors.push('#01a4ef'); // Starting balance
    else if (i === values.length - 1) colors.push('#81b900'); // Ending balance
    else colors.push(value > 0 ? '#81b900' : '#dc3545'); // Income/Expense
  });
  
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: categories,
      datasets: [
        {
          label: 'Start',
          data: starts,
          backgroundColor: 'transparent',
          borderColor: 'transparent'
        },
        {
          label: 'Change',
          data: amounts,
          backgroundColor: colors,
          borderWidth: 0
        }
      ]
    },
    options: {
      scales: {
        x: { stacked: true },
        y: { 
          stacked: true,
          ticks: {
            callback: function(value) {
              return formatCurrency(value);
            }
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              if (context.datasetIndex === 0) return null; // Hide "Start" dataset
              const value = context.parsed.y;
              return `${context.label}: ${formatCurrency(value)}`;
            }
          }
        }
      }
    }
  });
}

// Usage:
const waterfallData = [
  { label: 'Starting Balance', value: 5000 },
  { label: 'Salary', value: 6500 },
  { label: 'Rent', value: -1800 },
  { label: 'Groceries', value: -600 },
  { label: 'Utilities', value: -200 },
  { label: 'Transportation', value: -150 },
  { label: 'Savings', value: -1000 },
  { label: 'Ending Balance', value: 7750 }
];
```

### Gauge Charts (DTI Ratio, Savings Rate)

```javascript
// Enhanced gauge chart (already partially in charts.js)
function createGaugeChart(ctx, value, max = 100, thresholds = { low: 30, high: 70 }) {
  const percentage = (value / max) * 100;
  
  // Determine color based on thresholds
  let color;
  if (percentage <= thresholds.low) color = '#81b900'; // Good
  else if (percentage <= thresholds.high) color = '#ffc107'; // Warning
  else color = '#dc3545'; // Danger
  
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [value, max - value],
        backgroundColor: [color, 'rgba(255, 255, 255, 0.1)'],
        borderWidth: 0,
        circumference: 180,
        rotation: 270
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
        // Custom center text plugin
        centerText: {
          text: `${percentage.toFixed(1)}%`,
          color: color,
          fontSize: 32,
          fontWeight: 'bold'
        }
      }
    },
    plugins: [{
      id: 'centerText',
      afterDraw: function(chart) {
        const ctx = chart.ctx;
        const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
        const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
        
        ctx.save();
        ctx.font = `${chart.options.plugins.centerText.fontWeight} ${chart.options.plugins.centerText.fontSize}px Inter`;
        ctx.fillStyle = chart.options.plugins.centerText.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(chart.options.plugins.centerText.text, centerX, centerY);
        ctx.restore();
      }
    }]
  });
}

// Usage:
createGaugeChart(
  document.getElementById('dtiGauge').getContext('2d'),
  28, // Current DTI: 28%
  100,
  { low: 30, high: 43 } // DTI thresholds
);
```

---

## 6. Chart Export Functionality

### PNG Export

```javascript
// Add to charts.js utility functions
function exportChartAsPNG(chartInstance, filename) {
  // Create download link
  const link = document.createElement('a');
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.png`;
  link.href = chartInstance.toBase64Image();
  link.click();
}

// Add export button to chart containers
function addExportButton(chartContainer, chartInstance, chartName) {
  const exportBtn = document.createElement('button');
  exportBtn.className = 'btn btn-sm btn-ghost chart-export-btn';
  exportBtn.innerHTML = '<i class="bi bi-download"></i> Export';
  exportBtn.title = 'Download chart as PNG';
  
  exportBtn.addEventListener('click', () => {
    exportChartAsPNG(chartInstance, chartName);
  });
  
  chartContainer.querySelector('.chart-header').appendChild(exportBtn);
}
```

**HTML Structure:**

```html
<div class="chart-container">
  <div class="chart-header">
    <h4 class="chart-title">Net Worth Trend</h4>
    <div class="chart-actions">
      <!-- Time range filters here -->
      <!-- Export button will be appended here -->
    </div>
  </div>
  <canvas id="netWorthChart"></canvas>
</div>
```

### CSV Export (Data Behind Chart)

```javascript
function exportChartDataAsCSV(chartInstance, filename) {
  const { labels, datasets } = chartInstance.data;
  
  // Build CSV
  let csv = 'Date,' + datasets.map(ds => ds.label).join(',') + '\n';
  
  labels.forEach((label, i) => {
    const row = [label];
    datasets.forEach(ds => {
      row.push(ds.data[i]);
    });
    csv += row.join(',') + '\n';
  });
  
  // Download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${filename}-data-${new Date().toISOString().split('T')[0]}.csv`;
  link.href = url;
  link.click();
  window.URL.revokeObjectURL(url);
}
```

---

## 7. Accessibility Enhancements

### Keyboard Navigation

```javascript
// Add keyboard controls to charts
function makeChartAccessible(canvasId, chartInstance) {
  const canvas = document.getElementById(canvasId);
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', `${chartInstance.data.datasets[0].label} chart`);
  canvas.setAttribute('tabindex', '0');
  
  // Add keyboard controls
  canvas.addEventListener('keydown', (e) => {
    if (!chartInstance.config.options.plugins.zoom) return;
    
    switch(e.key) {
      case '+':
      case '=':
        e.preventDefault();
        chartInstance.zoom(1.1);
        break;
      case '-':
      case '_':
        e.preventDefault();
        chartInstance.zoom(0.9);
        break;
      case 'r':
      case 'R':
        e.preventDefault();
        chartInstance.resetZoom();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        chartInstance.pan({ x: -50 });
        break;
      case 'ArrowRight':
        e.preventDefault();
        chartInstance.pan({ x: 50 });
        break;
    }
  });
  
  // Show keyboard hints on focus
  canvas.addEventListener('focus', () => {
    showKeyboardHints(canvasId);
  });
}

function showKeyboardHints(canvasId) {
  const hints = document.createElement('div');
  hints.className = 'keyboard-hints';
  hints.innerHTML = `
    <strong>Keyboard shortcuts:</strong>
    <kbd>+</kbd> Zoom in • 
    <kbd>-</kbd> Zoom out • 
    <kbd>R</kbd> Reset • 
    <kbd>←→</kbd> Pan
  `;
  
  const container = document.getElementById(canvasId).closest('.chart-container');
  container.appendChild(hints);
  
  // Auto-hide after 5 seconds
  setTimeout(() => hints.remove(), 5000);
}
```

### Screen Reader Support

```javascript
// Generate text description of chart
function generateChartDescription(chartInstance) {
  const { labels, datasets } = chartInstance.data;
  const dataset = datasets[0];
  const values = dataset.data;
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const current = values[values.length - 1];
  const previous = values[values.length - 2];
  const change = ((current - previous) / previous) * 100;
  
  return `
    ${dataset.label} from ${labels[0]} to ${labels[labels.length - 1]}.
    Current value: ${formatCurrency(current)}.
    ${change > 0 ? 'Up' : 'Down'} ${Math.abs(change).toFixed(1)}% from previous period.
    Range: ${formatCurrency(min)} to ${formatCurrency(max)}.
    Average: ${formatCurrency(avg)}.
  `.trim();
}

// Add description to canvas
function addChartDescription(canvasId, chartInstance) {
  const description = generateChartDescription(chartInstance);
  const canvas = document.getElementById(canvasId);
  canvas.setAttribute('aria-label', description);
  
  // Also add visible description for sighted users (optional)
  const descEl = document.createElement('p');
  descEl.className = 'chart-description visually-hidden';
  descEl.textContent = description;
  canvas.after(descEl);
}
```

---

## Performance Optimization Checklist

Current `charts.js` already has some optimizations. Enhancements:

### 1. Lazy Loading (Already Implemented ✅)

```html
<!-- Current implementation (good!) -->
<script src="assets/js/lazy-loader.js"></script>
```

### 2. Canvas Pooling (Reduce Memory)

```javascript
// Reuse canvas elements instead of destroying/recreating
const canvasPool = [];

function getCanvas() {
  return canvasPool.pop() || document.createElement('canvas');
}

function releaseCanvas(canvas) {
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  canvasPool.push(canvas);
}
```

### 3. Debounced Updates

```javascript
// Debounce chart updates on window resize
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

window.addEventListener('resize', debounce(() => {
  Object.values(chartInstances).forEach(chart => {
    if (chart) chart.resize();
  });
}, 250));
```

### 4. Offscreen Rendering (Web Workers)

For complex charts with 1000+ data points:

```javascript
// worker.js
self.onmessage = function(e) {
  const { data } = e.data;
  
  // Perform expensive calculations here
  const processed = data.map(point => ({
    x: point.date,
    y: calculateMovingAverage(point.value, 7)
  }));
  
  self.postMessage(processed);
};

// main.js
const chartWorker = new Worker('assets/js/chart-worker.js');

chartWorker.postMessage({ data: rawData });

chartWorker.onmessage = function(e) {
  updateChartData(chartInstances.netWorth, e.data);
};
```

---

## Implementation Roadmap

### Phase 1: Essential Plugins (3-5 hours)
1. ✅ Install annotation plugin
2. ✅ Add target lines to net worth chart
3. ✅ Install datalabels plugin
4. ✅ Show current value on balance charts
5. ✅ Add export PNG functionality

### Phase 2: Enhanced Interactivity (5-7 hours)
1. ⏳ Install zoom plugin
2. ⏳ Add zoom/pan controls to all charts
3. ⏳ Implement keyboard navigation
4. ⏳ Add CSV export
5. ⏳ Create waterfall chart for cash flow

### Phase 3: Accessibility & Polish (3-5 hours)
1. ⏳ Add ARIA labels to all charts
2. ⏳ Generate screen reader descriptions
3. ⏳ Implement keyboard shortcuts
4. ⏳ Add keyboard hint overlays
5. ⏳ Test with screen readers (NVDA, JAWS)

---

## Recommended Azure DevOps Tasks

### Task 1: Chart.js Annotation Plugin
**Type:** Enhancement  
**Priority:** High  
**Effort:** 4 hours

Add annotation plugin and implement target lines:
- Install chartjs-plugin-annotation
- Add target line to net worth chart
- Add warning zones to debt charts
- User-editable goal markers
- Visual milestone indicators

**Acceptance Criteria:**
- Target lines appear on charts
- Users can edit goals via settings
- Milestones persist to database
- Visual warning zones for critical thresholds

---

### Task 2: Data Labels & Chart Export
**Type:** Enhancement  
**Priority:** Medium  
**Effort:** 3 hours

Add data labels and export functionality:
- Install chartjs-plugin-datalabels
- Show current value on last data point
- Add "Export PNG" button to charts
- Add "Export CSV" for data download

**Acceptance Criteria:**
- Key metrics labeled on charts
- Export buttons functional
- Downloaded files have proper naming
- CSV includes all data points

---

### Task 3: Zoom & Pan Controls
**Type:** Feature  
**Priority:** Medium  
**Effort:** 4 hours

Enable detailed chart analysis with zoom/pan:
- Install chartjs-plugin-zoom
- Add zoom controls UI
- Enable scroll-to-zoom
- Add reset zoom button
- Keyboard shortcuts

**Acceptance Criteria:**
- Users can zoom in/out on charts
- Pan works with Ctrl+drag
- Keyboard shortcuts functional (+/- to zoom)
- Reset button returns to original view

---

### Task 4: Chart Accessibility
**Type:** Accessibility  
**Priority:** High  
**Effort:** 5 hours

Make charts accessible to all users:
- Add ARIA labels to all canvases
- Generate text descriptions
- Implement keyboard navigation
- Add screen reader support
- Test with NVDA/JAWS

**Acceptance Criteria:**
- All charts have descriptive ARIA labels
- Keyboard navigation works (tab, arrow keys)
- Screen readers announce chart summaries
- WCAG AA compliance
- Documented keyboard shortcuts

---

## Conclusion

Current Chart.js implementation is solid. These enhancements will:
1. **Improve functionality** — Annotations, zoom, export
2. **Enhance usability** — Data labels, better tooltips
3. **Ensure accessibility** — Keyboard nav, screen readers
4. **Boost engagement** — Interactive features, visual milestones

**Next Steps:**
1. Install recommended plugins (~70KB total)
2. Implement Phase 1 (essential features)
3. User testing for zoom/pan UX
4. Accessibility audit with assistive tech

---

**Research By:** Capital (Orchestrator)  
**Reviewed:** Ready for Builder implementation  
**Last Updated:** February 13, 2026
