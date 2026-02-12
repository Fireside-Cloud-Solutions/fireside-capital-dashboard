# Chart.js Research Report
**Fireside Capital Dashboard**  
**Date:** February 12, 2026  
**Researcher:** Capital (Orchestrator)  
**Status:** Complete — Ready for Implementation

---

## Executive Summary

Chart.js is already integrated with **good performance optimizations** (lazy loading, data decimation, time range filters). This research identifies **6 key enhancements** to elevate the financial dashboard's data visualization capabilities.

**Current State:**
- ✅ Chart.js lazy-loaded (saves 270 KB on non-chart pages)
- ✅ Performance optimizations (decimation for 100+ data points)
- ✅ Time range filters (1M, 3M, 6M, 1Y, All)
- ✅ Mobile-responsive chart sizing
- ⚠️ Limited chart types (line, bar, doughnut only)
- ⚠️ No candlestick/OHLC charts for investment tracking
- ⚠️ No zoom/pan plugin for deep analysis
- ⚠️ No annotations for marking important events
- ⚠️ No real-time streaming updates

**Recommended Enhancements:**
1. **Financial Chart Types** — Add candlestick/OHLC for investment performance
2. **Interactive Plugins** — Add zoom, crosshair, and annotations
3. **Real-time Updates** — Add streaming plugin for live data
4. **Advanced Formatting** — Number formatters for currency/percentages
5. **Chart Presets** — Reusable configurations for consistency
6. **Accessibility** — Screen reader support and keyboard navigation

---

## 1. Financial Chart Types (Candlestick & OHLC)

### Why It Matters
Financial dashboards need candlestick charts to visualize:
- **Stock/investment performance** (open, high, low, close)
- **Price movements** over time with volume indicators
- **Buy/sell signals** with visual markers

### Current State
Only line, bar, and doughnut charts are available. Investment tracking uses basic line charts which don't show intraday volatility.

### Recommended: chartjs-chart-financial

**Installation:**
```bash
npm install chart.js chartjs-chart-financial chartjs-adapter-luxon luxon
```

**Usage Example — Investment Performance:**
```javascript
import { Chart } from 'chart.js';
import { CandlestickController, CandlestickElement, OhlcController, OhlcElement } from 'chartjs-chart-financial';
import 'chartjs-adapter-luxon';

// Register financial chart types
Chart.register(CandlestickController, CandlestickElement, OhlcController, OhlcElement);

// Sample data structure
const investmentData = [
  { x: '2026-02-01', o: 245.30, h: 248.90, l: 244.10, c: 247.50 }, // ONDS stock
  { x: '2026-02-02', o: 247.50, h: 249.20, l: 246.00, c: 248.10 },
  { x: '2026-02-03', o: 248.10, h: 250.00, l: 247.50, c: 249.80 },
  // ...more data
];

// Create candlestick chart
const ctx = document.getElementById('investmentChart').getContext('2d');
const candlestickChart = new Chart(ctx, {
  type: 'candlestick',
  data: {
    datasets: [{
      label: 'ONDS Stock Price',
      data: investmentData,
      borderColor: 'rgba(1, 164, 239, 1)',      // Sky blue (up candle border)
      backgroundColor: 'rgba(1, 164, 239, 0.7)', // Sky blue fill
      color: {
        up: 'rgba(129, 185, 0, 0.9)',           // Lime green (bullish)
        down: 'rgba(244, 78, 36, 0.9)',         // Flame orange (bearish)
        unchanged: 'rgba(74, 74, 74, 0.9)'      // Neutral gray
      }
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    parsing: false, // Performance boost for pre-formatted data
    animation: false, // Faster rendering
    interaction: {
      intersect: false,
      mode: 'index'
    },
    scales: {
      x: {
        type: 'timeseries',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'MMM dd'
          }
        },
        grid: {
          color: 'rgba(74, 74, 74, 0.2)'
        },
        ticks: {
          color: '#b0b0b0',
          autoSkip: true,
          maxRotation: 0
        }
      },
      y: {
        type: 'linear',
        position: 'right',
        grid: {
          color: 'rgba(74, 74, 74, 0.2)'
        },
        ticks: {
          color: '#b0b0b0',
          callback: function(value) {
            return '$' + value.toFixed(2);
          }
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#f0f0f0',
          boxWidth: 12
        }
      },
      tooltip: {
        backgroundColor: 'rgba(26, 26, 26, 0.95)',
        titleColor: '#f0f0f0',
        bodyColor: '#b0b0b0',
        borderColor: 'rgba(1, 164, 239, 0.5)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const point = context.raw;
            return [
              `Open: $${point.o.toFixed(2)}`,
              `High: $${point.h.toFixed(2)}`,
              `Low: $${point.l.toFixed(2)}`,
              `Close: $${point.c.toFixed(2)}`
            ];
          }
        }
      }
    }
  }
});
```

**Mixed Chart Example — Price + Volume:**
```javascript
const mixedChart = new Chart(ctx, {
  data: {
    datasets: [
      {
        type: 'candlestick',
        label: 'ONDS Price',
        data: priceData, // [{ x, o, h, l, c }]
        yAxisID: 'price'
      },
      {
        type: 'bar',
        label: 'Volume',
        data: volumeData, // [{ x, y }]
        yAxisID: 'volume',
        backgroundColor: 'rgba(74, 74, 74, 0.5)'
      }
    ]
  },
  options: {
    scales: {
      x: {
        type: 'timeseries'
      },
      price: {
        type: 'linear',
        position: 'right'
      },
      volume: {
        type: 'linear',
        position: 'left',
        grid: { display: false },
        ticks: { display: false } // Hide volume ticks for cleaner look
      }
    }
  }
});
```

**Benefits:**
- ✅ **Professional financial visualization** — Industry-standard candlestick charts
- ✅ **Intraday volatility visible** — See high/low ranges, not just close prices
- ✅ **Mixed chart support** — Combine price + volume in one view
- ✅ **Performance optimized** — Designed for large datasets

---

## 2. Interactive Plugins (Zoom, Crosshair, Annotations)

### A. Zoom & Pan Plugin

**Why:** Allow users to drill into specific time periods for detailed analysis.

**Installation:**
```bash
npm install chartjs-plugin-zoom hammerjs
```

**Configuration:**
```javascript
import zoomPlugin from 'chartjs-plugin-zoom';
Chart.register(zoomPlugin);

const chartWithZoom = new Chart(ctx, {
  type: 'line',
  data: netWorthData,
  options: {
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
          modifierKey: 'ctrl' // Hold Ctrl to pan
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
            x: { min: 'original', max: 'original' } // Prevent zooming beyond data
          }
        }
      }
    }
  }
});

// Add reset zoom button
const resetBtn = document.getElementById('resetZoom');
resetBtn.addEventListener('click', () => {
  chartWithZoom.resetZoom();
});
```

**UI Enhancement:**
```html
<!-- Add to chart controls -->
<div class="chart-controls d-flex justify-content-between align-items-center mb-3">
  <div class="time-range-filter btn-group btn-group-sm">
    <!-- Existing time range buttons -->
  </div>
  <div class="zoom-controls btn-group btn-group-sm">
    <button class="btn btn-outline-secondary" id="resetZoom">
      <i class="bi bi-arrow-counterclockwise"></i> Reset Zoom
    </button>
    <button class="btn btn-outline-secondary" id="zoomIn">
      <i class="bi bi-zoom-in"></i>
    </button>
    <button class="btn btn-outline-secondary" id="zoomOut">
      <i class="bi bi-zoom-out"></i>
    </button>
  </div>
</div>
```

### B. Crosshair Plugin

**Why:** Improve tooltip precision and allow multi-chart synchronization.

**Installation:**
```bash
npm install chartjs-plugin-crosshair
```

**Configuration:**
```javascript
import CrosshairPlugin from 'chartjs-plugin-crosshair';
Chart.register(CrosshairPlugin);

const chartWithCrosshair = new Chart(ctx, {
  type: 'line',
  data: netWorthData,
  options: {
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      crosshair: {
        line: {
          color: 'rgba(1, 164, 239, 0.5)',  // Sky blue crosshair
          width: 1,
          dashPattern: [5, 5]
        },
        sync: {
          enabled: true,
          group: 1,  // Synchronize all charts in group 1
          suppressTooltips: false
        },
        zoom: {
          enabled: false  // Use separate zoom plugin instead
        }
      }
    }
  }
});
```

**Multi-Chart Sync Example:**
```javascript
// Net Worth Chart
const netWorthChart = new Chart(ctx1, {
  options: {
    plugins: {
      crosshair: { sync: { enabled: true, group: 1 } }
    }
  }
});

// Cash Flow Chart (synced with Net Worth)
const cashFlowChart = new Chart(ctx2, {
  options: {
    plugins: {
      crosshair: { sync: { enabled: true, group: 1 } }
    }
  }
});

// Moving crosshair on one chart updates the other automatically
```

### C. Annotations Plugin

**Why:** Mark important financial events (debt payoff, bonus received, major purchase).

**Installation:**
```bash
npm install chartjs-plugin-annotation
```

**Configuration:**
```javascript
import annotationPlugin from 'chartjs-plugin-annotation';
Chart.register(annotationPlugin);

const chartWithAnnotations = new Chart(ctx, {
  type: 'line',
  data: netWorthData,
  options: {
    plugins: {
      annotation: {
        annotations: {
          debtPayoff: {
            type: 'line',
            xMin: '2025-10-15',
            xMax: '2025-10-15',
            borderColor: 'rgba(129, 185, 0, 0.8)',  // Lime green
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              content: 'Car Loan Paid Off 🎉',
              enabled: true,
              position: 'start',
              backgroundColor: 'rgba(129, 185, 0, 0.9)',
              color: '#0f0f0f',
              font: {
                size: 11,
                weight: 'bold'
              }
            }
          },
          bonusReceived: {
            type: 'point',
            xValue: '2025-12-20',
            yValue: 850000,
            backgroundColor: 'rgba(1, 164, 239, 0.8)',  // Sky blue
            borderColor: 'rgba(1, 164, 239, 1)',
            borderWidth: 2,
            radius: 8,
            label: {
              content: 'Year-End Bonus',
              enabled: true,
              position: 'top'
            }
          },
          emergencyFundTarget: {
            type: 'line',
            yMin: 750000,
            yMax: 750000,
            borderColor: 'rgba(255, 193, 7, 0.6)',  // Warning yellow
            borderWidth: 2,
            borderDash: [10, 5],
            label: {
              content: 'Emergency Fund Target: $750K',
              enabled: true,
              position: 'end',
              backgroundColor: 'rgba(255, 193, 7, 0.9)',
              color: '#0f0f0f'
            }
          }
        }
      }
    }
  }
});
```

**Dynamic Annotations Example:**
```javascript
// Function to add annotation from user input
function addChartAnnotation(date, value, label, type = 'positive') {
  const color = type === 'positive' ? 
    'rgba(129, 185, 0, 0.8)' :  // Green
    'rgba(244, 78, 36, 0.8)';   // Orange/red

  const annotationId = `event_${Date.now()}`;
  
  netWorthChart.options.plugins.annotation.annotations[annotationId] = {
    type: 'line',
    xMin: date,
    xMax: date,
    borderColor: color,
    borderWidth: 2,
    label: {
      content: label,
      enabled: true,
      backgroundColor: color,
      color: '#0f0f0f'
    }
  };
  
  netWorthChart.update();
}

// UI: "Add Event" button triggers modal to input annotation details
```

---

## 3. Real-Time Streaming Updates

### Why It Matters
For dashboards that sync with live bank/investment accounts, real-time chart updates enhance user experience.

**Installation:**
```bash
npm install chartjs-plugin-streaming
```

**Configuration:**
```javascript
import 'chartjs-adapter-luxon';
import StreamingPlugin from 'chartjs-plugin-streaming';
Chart.register(StreamingPlugin);

const realtimeChart = new Chart(ctx, {
  type: 'line',
  data: {
    datasets: [{
      label: 'Account Balance',
      data: [],
      borderColor: 'rgba(1, 164, 239, 1)',
      backgroundColor: 'rgba(1, 164, 239, 0.1)',
      fill: true
    }]
  },
  options: {
    scales: {
      x: {
        type: 'realtime',
        realtime: {
          duration: 20000,    // Display last 20 seconds
          refresh: 1000,      // Update every 1 second
          delay: 1000,        // Delay of 1 second
          onRefresh: function(chart) {
            // Fetch new data point (e.g., from Plaid API)
            const newBalance = fetchLatestBalance();
            chart.data.datasets[0].data.push({
              x: Date.now(),
              y: newBalance
            });
          }
        },
        ticks: {
          color: '#b0b0b0'
        }
      },
      y: {
        ticks: {
          color: '#b0b0b0',
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    },
    plugins: {
      legend: {
        labels: { color: '#f0f0f0' }
      }
    }
  }
});

// Pause/resume streaming
document.getElementById('pauseStream').addEventListener('click', () => {
  realtimeChart.options.scales.x.realtime.pause = true;
  realtimeChart.update();
});

document.getElementById('resumeStream').addEventListener('click', () => {
  realtimeChart.options.scales.x.realtime.pause = false;
  realtimeChart.update();
});
```

**Use Cases:**
- **Live transaction monitoring** (when connected to Plaid)
- **Real-time stock price tracking** (for investment accounts)
- **Budget burn rate** (spending velocity during the month)

---

## 4. Advanced Number Formatting

### Current Issue
Number formatting is inconsistent across tooltips, axes, and legends.

### Recommended: Centralized Formatters

**`app/assets/js/chart-formatters.js`:**
```javascript
/* =========================================================
   Chart.js Formatters for Financial Data
   Fireside Capital Dashboard
   ========================================================= */

export const formatters = {
  /**
   * Currency formatter (USD)
   * @param {number} value
   * @param {object} options - { decimals: 0, compact: false }
   */
  currency: (value, options = {}) => {
    const { decimals = 0, compact = false } = options;
    
    if (compact && Math.abs(value) >= 1000000) {
      // 1M, 2.5M, etc.
      return '$' + (value / 1000000).toFixed(1) + 'M';
    } else if (compact && Math.abs(value) >= 1000) {
      // 1K, 150K, etc.
      return '$' + (value / 1000).toFixed(1) + 'K';
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  },

  /**
   * Percentage formatter
   * @param {number} value - Decimal (0.15 = 15%)
   * @param {number} decimals - Decimal places (default: 1)
   */
  percentage: (value, decimals = 1) => {
    return (value * 100).toFixed(decimals) + '%';
  },

  /**
   * Percentage change formatter with sign
   * @param {number} value - Decimal change
   */
  percentageChange: (value, decimals = 1) => {
    const sign = value >= 0 ? '+' : '';
    return sign + (value * 100).toFixed(decimals) + '%';
  },

  /**
   * Short date formatter
   * @param {string|Date} date
   */
  date: (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  },

  /**
   * Month/Year formatter
   * @param {string|Date} date
   */
  monthYear: (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  },

  /**
   * Number with commas (no currency symbol)
   */
  number: (value, decimals = 0) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }
};

/**
 * Apply formatters to Chart.js configuration
 * @param {object} chartConfig - Chart.js config object
 * @param {string} yAxisType - 'currency' | 'percentage' | 'number'
 */
export function applyFormatters(chartConfig, yAxisType = 'currency') {
  // Y-axis tick formatter
  if (!chartConfig.options) chartConfig.options = {};
  if (!chartConfig.options.scales) chartConfig.options.scales = {};
  if (!chartConfig.options.scales.y) chartConfig.options.scales.y = {};
  if (!chartConfig.options.scales.y.ticks) chartConfig.options.scales.y.ticks = {};
  
  chartConfig.options.scales.y.ticks.callback = function(value) {
    switch (yAxisType) {
      case 'currency':
        return formatters.currency(value, { compact: true });
      case 'percentage':
        return formatters.percentage(value / 100);
      default:
        return formatters.number(value);
    }
  };

  // Tooltip formatter
  if (!chartConfig.options.plugins) chartConfig.options.plugins = {};
  if (!chartConfig.options.plugins.tooltip) chartConfig.options.plugins.tooltip = {};
  if (!chartConfig.options.plugins.tooltip.callbacks) {
    chartConfig.options.plugins.tooltip.callbacks = {};
  }
  
  chartConfig.options.plugins.tooltip.callbacks.label = function(context) {
    let label = context.dataset.label || '';
    if (label) label += ': ';
    
    switch (yAxisType) {
      case 'currency':
        label += formatters.currency(context.parsed.y, { decimals: 2 });
        break;
      case 'percentage':
        label += formatters.percentage(context.parsed.y / 100);
        break;
      default:
        label += formatters.number(context.parsed.y);
    }
    
    return label;
  };
  
  return chartConfig;
}
```

**Usage:**
```javascript
import { formatters, applyFormatters } from './chart-formatters.js';

// Manual formatter usage
const tooltipLabel = formatters.currency(847234, { decimals: 2 });  // "$847,234.00"
const compactValue = formatters.currency(1500000, { compact: true }); // "$1.5M"
const changeLabel = formatters.percentageChange(0.025);  // "+2.5%"

// Auto-apply formatters to chart config
let chartConfig = {
  type: 'line',
  data: netWorthData,
  options: {
    scales: { y: {} }
  }
};

applyFormatters(chartConfig, 'currency');

const chart = new Chart(ctx, chartConfig);
```

---

## 5. Chart Configuration Presets

### Problem
Repeated configuration code for similar charts (colors, fonts, grid styling).

### Solution: Reusable Presets

**`app/assets/js/chart-presets.js`:**
```javascript
/* =========================================================
   Chart.js Presets for Fireside Capital Dashboard
   Eliminates repeated configuration
   ========================================================= */

import { formatters } from './chart-formatters.js';

// Design tokens (match design-tokens.css)
const colors = {
  primary: '#f44e24',        // Flame orange
  secondary: '#01a4ef',      // Sky blue
  accent: '#81b900',         // Lime green
  tertiary: '#4a4a4a',       // Neutral gray
  bg1: '#0f0f0f',
  bg2: '#1a1a1a',
  bg3: '#262626',
  textPrimary: '#f0f0f0',
  textSecondary: '#b0b0b0',
  textTertiary: '#999999',
  borderDefault: '#3a3a3a',
  success: '#81b900',
  danger: '#dc3545',
  warning: '#ffc107'
};

/**
 * Base configuration shared by all charts
 */
export const baseConfig = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 400,
    easing: 'easeInOutQuart'
  },
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    legend: {
      labels: {
        color: colors.textPrimary,
        font: {
          family: 'Inter, sans-serif',
          size: 12
        },
        boxWidth: 12,
        padding: 12,
        usePointStyle: true
      }
    },
    tooltip: {
      backgroundColor: 'rgba(26, 26, 26, 0.95)',
      titleColor: colors.textPrimary,
      bodyColor: colors.textSecondary,
      borderColor: 'rgba(1, 164, 239, 0.5)',
      borderWidth: 1,
      padding: 12,
      titleFont: {
        family: 'Inter, sans-serif',
        size: 13,
        weight: '600'
      },
      bodyFont: {
        family: 'Inter, sans-serif',
        size: 12
      },
      displayColors: true,
      boxWidth: 10,
      boxHeight: 10,
      boxPadding: 4
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(74, 74, 74, 0.2)',
        borderColor: colors.borderDefault
      },
      ticks: {
        color: colors.textSecondary,
        font: {
          family: 'Inter, sans-serif',
          size: 11
        },
        autoSkip: true,
        maxRotation: 0
      }
    },
    y: {
      grid: {
        color: 'rgba(74, 74, 74, 0.2)',
        borderColor: colors.borderDefault
      },
      ticks: {
        color: colors.textSecondary,
        font: {
          family: 'Inter, sans-serif',
          size: 11
        }
      }
    }
  }
};

/**
 * Line chart preset (for trends over time)
 */
export function createLineChart(ctx, data, label, options = {}) {
  const config = {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: label,
        data: data.values,
        borderColor: options.color || colors.secondary,
        backgroundColor: options.fillColor || `rgba(1, 164, 239, 0.1)`,
        borderWidth: 2,
        fill: options.fill !== false,
        tension: 0.3,  // Smooth curves
        pointRadius: options.showPoints ? 3 : 0,
        pointHoverRadius: 6,
        pointBackgroundColor: options.color || colors.secondary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      ...baseConfig,
      ...options,
      plugins: {
        ...baseConfig.plugins,
        ...options.plugins
      }
    }
  };
  
  return new Chart(ctx, config);
}

/**
 * Bar chart preset (for comparisons)
 */
export function createBarChart(ctx, data, label, options = {}) {
  const config = {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{
        label: label,
        data: data.values,
        backgroundColor: options.color || colors.primary,
        borderColor: options.borderColor || colors.primary,
        borderWidth: 0,
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      ...baseConfig,
      ...options,
      plugins: {
        ...baseConfig.plugins,
        ...options.plugins
      }
    }
  };
  
  return new Chart(ctx, config);
}

/**
 * Doughnut chart preset (for allocation/breakdown)
 */
export function createDoughnutChart(ctx, data, options = {}) {
  const defaultColors = [
    colors.primary,
    colors.secondary,
    colors.accent,
    colors.tertiary,
    colors.warning,
    colors.danger
  ];
  
  const config = {
    type: 'doughnut',
    data: {
      labels: data.labels,
      datasets: [{
        data: data.values,
        backgroundColor: options.colors || defaultColors,
        borderWidth: 2,
        borderColor: colors.bg1,
        hoverBorderColor: '#fff',
        hoverBorderWidth: 3
      }]
    },
    options: {
      ...baseConfig,
      ...options,
      cutout: options.cutout || '65%',
      plugins: {
        ...baseConfig.plugins,
        ...options.plugins,
        legend: {
          ...baseConfig.plugins.legend,
          position: options.legendPosition || 'right'
        }
      }
    }
  };
  
  return new Chart(ctx, config);
}

/**
 * Multi-dataset line chart preset (for comparisons over time)
 */
export function createMultiLineChart(ctx, datasets, options = {}) {
  const chartDatasets = datasets.map((dataset, index) => ({
    label: dataset.label,
    data: dataset.values,
    borderColor: dataset.color || [colors.secondary, colors.accent, colors.primary][index],
    backgroundColor: dataset.fillColor || 'transparent',
    borderWidth: 2,
    fill: false,
    tension: 0.3,
    pointRadius: 0,
    pointHoverRadius: 6
  }));
  
  const config = {
    type: 'line',
    data: {
      labels: datasets[0].labels,
      datasets: chartDatasets
    },
    options: {
      ...baseConfig,
      ...options,
      plugins: {
        ...baseConfig.plugins,
        ...options.plugins
      }
    }
  };
  
  return new Chart(ctx, config);
}

// Export colors for custom use
export { colors };
```

**Usage:**
```javascript
import { createLineChart, createBarChart, createDoughnutChart } from './chart-presets.js';
import { applyFormatters } from './chart-formatters.js';

// Create net worth chart (1 line of code)
const netWorthChart = createLineChart(
  document.getElementById('netWorthChart').getContext('2d'),
  { labels: months, values: netWorthValues },
  'Net Worth',
  { fill: true, color: '#01a4ef' }
);
applyFormatters(netWorthChart.config, 'currency');

// Create spending breakdown (1 line of code)
const spendingChart = createDoughnutChart(
  document.getElementById('spendingChart').getContext('2d'),
  { labels: categories, values: amounts }
);
applyFormatters(spendingChart.config, 'currency');

// Create income vs expenses comparison (1 line of code)
const cashFlowChart = createMultiLineChart(
  document.getElementById('cashFlowChart').getContext('2d'),
  [
    { label: 'Income', labels: months, values: incomeValues, color: '#81b900' },
    { label: 'Expenses', labels: months, values: expenseValues, color: '#f44e24' }
  ]
);
applyFormatters(cashFlowChart.config, 'currency');
```

**Benefits:**
- ✅ **10x faster chart creation** — 1 line vs 100+ lines
- ✅ **Consistent styling** — All charts match design system
- ✅ **Easier maintenance** — Update once, apply everywhere
- ✅ **Reduced bugs** — Less copy-paste errors

---

## 6. Accessibility Enhancements

### Current Issues
- Charts not readable by screen readers
- No keyboard navigation
- Insufficient color contrast for colorblind users

### Recommended Fixes

#### A. Screen Reader Support

**Add ARIA labels and data tables:**
```html
<div class="chart-container" style="position: relative; height: 400px;">
  <canvas id="netWorthChart" 
          role="img" 
          aria-label="Net worth over time line chart">
  </canvas>
  
  <!-- Accessible data table (visually hidden, screen reader accessible) -->
  <table class="sr-only" aria-label="Net worth data">
    <caption>Monthly Net Worth from Jan 2025 to Feb 2026</caption>
    <thead>
      <tr>
        <th>Month</th>
        <th>Net Worth</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Jan 2025</td>
        <td>$834,784</td>
      </tr>
      <tr>
        <td>Feb 2025</td>
        <td>$841,230</td>
      </tr>
      <!-- ...more rows -->
    </tbody>
  </table>
</div>
```

**CSS for screen-reader-only content:**
```css
/* utilities.css */
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

#### B. Keyboard Navigation

**Add keyboard controls:**
```javascript
// Allow keyboard users to explore chart data
canvas.setAttribute('tabindex', '0');
canvas.addEventListener('keydown', (e) => {
  const chart = Chart.getChart(canvas);
  if (!chart) return;
  
  const activeElements = chart.getActiveElements();
  const dataLength = chart.data.labels.length;
  let currentIndex = activeElements[0]?.index || 0;
  
  switch (e.key) {
    case 'ArrowRight':
      e.preventDefault();
      currentIndex = Math.min(currentIndex + 1, dataLength - 1);
      break;
    case 'ArrowLeft':
      e.preventDefault();
      currentIndex = Math.max(currentIndex - 1, 0);
      break;
    case 'Home':
      e.preventDefault();
      currentIndex = 0;
      break;
    case 'End':
      e.preventDefault();
      currentIndex = dataLength - 1;
      break;
    default:
      return;
  }
  
  // Update active element
  chart.setActiveElements([{
    datasetIndex: 0,
    index: currentIndex
  }]);
  chart.tooltip.setActiveElements([{
    datasetIndex: 0,
    index: currentIndex
  }]);
  chart.update();
  
  // Announce to screen readers
  const value = chart.data.datasets[0].data[currentIndex];
  const label = chart.data.labels[currentIndex];
  announceToScreenReader(`${label}: ${formatters.currency(value)}`);
});

// Live region for screen reader announcements
function announceToScreenReader(message) {
  let liveRegion = document.getElementById('chart-live-region');
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'chart-live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  }
  liveRegion.textContent = message;
}
```

#### C. Colorblind-Friendly Palettes

**Update chart presets with accessible colors:**
```javascript
// chart-presets.js

// Colorblind-safe palette (based on IBM Design Language)
export const accessibleColors = {
  blue: '#0f62fe',      // Primary
  purple: '#8a3ffc',    // Secondary
  teal: '#08bdba',      // Accent 1
  magenta: '#d12771',   // Accent 2
  cyan: '#1192e8',      // Accent 3
  orange: '#ff832b',    // Warning
  red: '#da1e28',       // Danger
  green: '#24a148'      // Success
};

// Apply to doughnut charts
export function createAccessibleDoughnutChart(ctx, data, options = {}) {
  const safeColors = [
    accessibleColors.blue,
    accessibleColors.purple,
    accessibleColors.teal,
    accessibleColors.magenta,
    accessibleColors.cyan,
    accessibleColors.orange
  ];
  
  return createDoughnutChart(ctx, data, {
    ...options,
    colors: safeColors
  });
}
```

---

## Implementation Roadmap

### Phase 1: Plugin Integration (Week 1)
- [ ] Install chartjs-chart-financial, chartjs-plugin-zoom, chartjs-plugin-crosshair, chartjs-plugin-annotation
- [ ] Test financial chart types with sample ONDS stock data
- [ ] Add zoom/pan controls to net worth chart
- [ ] Test on live dashboard

### Phase 2: Formatters & Presets (Week 2)
- [ ] Create `chart-formatters.js` with currency/percentage/date formatters
- [ ] Create `chart-presets.js` with reusable chart factories
- [ ] Refactor existing charts to use presets
- [ ] Reduce app.js chart code by ~70%

### Phase 3: Financial Features (Week 3)
- [ ] Build investment performance page with candlestick charts
- [ ] Add annotation system for marking financial events
- [ ] Implement crosshair sync between net worth + cash flow charts
- [ ] Add "Add Event" UI for user-defined annotations

### Phase 4: Accessibility (Week 4)
- [ ] Add ARIA labels and data tables to all charts
- [ ] Implement keyboard navigation (Arrow keys, Home, End)
- [ ] Switch to colorblind-safe palette
- [ ] Test with NVDA and VoiceOver screen readers

---

## Success Metrics

**Before:**
- 3 chart types (line, bar, doughnut)
- 150+ lines of repeated config code
- No zoom/pan capabilities
- No financial chart types
- Limited accessibility

**After (Target):**
- 6 chart types (+ candlestick, OHLC, mixed)
- 1-line chart creation with presets
- Zoom/pan/crosshair on all time-series charts
- Investment tracking with professional candlestick charts
- Full keyboard navigation + screen reader support
- Colorblind-friendly palettes

**Developer Experience:**
- ✅ Chart creation time: 10 minutes → 1 minute
- ✅ Config code reduction: -70%
- ✅ Consistent formatting across all charts
- ✅ Professional financial visualizations

---

## References

- **Chart.js Docs:** https://www.chartjs.org/docs/latest/
- **Financial Charts Plugin:** https://github.com/chartjs/chartjs-chart-financial
- **Zoom Plugin:** https://github.com/chartjs/chartjs-plugin-zoom
- **Crosshair Plugin:** https://github.com/abelheinsbroek/chartjs-plugin-crosshair
- **Annotation Plugin:** https://github.com/chartjs/chartjs-plugin-annotation
- **Streaming Plugin:** https://github.com/nagix/chartjs-plugin-streaming
- **Accessibility Guide:** https://www.chartjs.org/docs/latest/general/accessibility.html

---

## Next Steps

1. **Review this report** with the team
2. **Prioritize phases** based on user needs
3. **Create Azure DevOps work items** for each phase
4. **Assign Builder agent** to implement Phase 1 (plugins)
5. **User testing** after Phase 3 (financial features)

**Status:** Research complete, ready for implementation  
**Estimated Effort:** 4 weeks (1 phase per week)  
**Risk Level:** Low (incremental additions, backward compatible)
