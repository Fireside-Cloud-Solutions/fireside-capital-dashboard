# Chart.js Implementation Patterns for Financial Dashboard
**Research Sprint** | February 24, 2026  
**Status:** 🔄 In Progress  
**Implementation Priority:** HIGH

---

## Executive Summary
Fireside Capital dashboard uses Chart.js for data visualization. This research identifies best practices for performance, responsiveness, accessibility, and financial-specific patterns.

---

## 1. CURRENT IMPLEMENTATION AUDIT

### Existing Chart Usage
Let me check what charts are currently implemented...

[TO BE COMPLETED — Need to audit app/assets/js/ for Chart.js usage]

---

## 2. CHART.JS BEST PRACTICES (2024-2026)

### Performance Optimization

#### Canvas vs DOM
**Chart.js uses Canvas rendering** — excellent for 100-10,000 data points, but:
- ⚠️ No per-element DOM manipulation (vs D3.js)
- ✅ Better performance than SVG for large datasets
- ✅ Hardware-accelerated rendering

**Recommendation:** Chart.js is optimal for Fireside Capital's use case (financial time series, bar charts, pie charts).

#### Animation Best Practices
```javascript
// DISABLE animations on initial load for faster rendering
const chartConfig = {
  type: 'line',
  data: data,
  options: {
    animation: {
      duration: 0  // Disable on load
    },
    responsive: true,
    maintainAspectRatio: false
  }
};

// RE-ENABLE animations after initial render
chart.options.animation.duration = 750;
```

#### Large Dataset Handling
```javascript
// For datasets > 1000 points: Enable decimation
options: {
  plugins: {
    decimation: {
      enabled: true,
      algorithm: 'lttb',  // Largest-Triangle-Three-Buckets
      samples: 500        // Reduce to 500 visible points
    }
  }
}
```

### Responsive Design

#### Container-Based Sizing
```html
<!-- ❌ BAD: Fixed dimensions -->
<canvas id="myChart" width="400" height="200"></canvas>

<!-- ✅ GOOD: Responsive container -->
<div class="c-chart-wrapper" style="position: relative; height: 400px;">
  <canvas id="myChart"></canvas>
</div>
```

```javascript
// Chart.js automatically inherits parent container size
const chart = new Chart(ctx, {
  type: 'line',
  data: data,
  options: {
    responsive: true,
    maintainAspectRatio: false  // Fill container height
  }
});
```

#### Responsive Font Sizes
```javascript
options: {
  plugins: {
    legend: {
      labels: {
        font: {
          size: function(context) {
            // Scale font based on viewport
            const width = context.chart.width;
            return width < 600 ? 10 : 12;
          }
        }
      }
    }
  },
  scales: {
    x: {
      ticks: {
        font: {
          size: function(context) {
            const width = context.chart.width;
            return width < 600 ? 9 : 11;
          }
        }
      }
    }
  }
}
```

### Financial Dashboard Patterns

#### Currency Formatting
```javascript
// Use Intl.NumberFormat for proper currency formatting
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

options: {
  plugins: {
    tooltip: {
      callbacks: {
        label: function(context) {
          return currencyFormatter.format(context.parsed.y);
        }
      }
    }
  },
  scales: {
    y: {
      ticks: {
        callback: function(value) {
          // Compact notation for large numbers
          if (value >= 1000000) {
            return '$' + (value / 1000000).toFixed(1) + 'M';
          } else if (value >= 1000) {
            return '$' + (value / 1000).toFixed(0) + 'K';
          }
          return currencyFormatter.format(value);
        }
      }
    }
  }
}
```

#### Time Series (Net Worth Over Time)
```javascript
// Use time scale for proper date handling
import 'chartjs-adapter-date-fns';  // Date adapter

const netWorthChart = new Chart(ctx, {
  type: 'line',
  data: {
    datasets: [{
      label: 'Net Worth',
      data: [
        { x: '2024-01-01', y: 100000 },
        { x: '2024-02-01', y: 105000 },
        { x: '2024-03-01', y: 110000 }
      ],
      borderColor: 'var(--color-primary)',
      backgroundColor: 'rgba(244, 78, 36, 0.1)',
      fill: true,
      tension: 0.4  // Smooth curve
    }]
  },
  options: {
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'month',
          displayFormats: {
            month: 'MMM yyyy'
          }
        },
        grid: {
          color: 'var(--color-border-1)'
        }
      },
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return '$' + (value / 1000).toFixed(0) + 'K';
          }
        },
        grid: {
          color: 'var(--color-border-1)'
        }
      }
    }
  }
});
```

#### Spending Categories (Donut Chart)
```javascript
const spendingChart = new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: ['Housing', 'Transport', 'Food', 'Utilities', 'Entertainment', 'Other'],
    datasets: [{
      data: [1500, 450, 600, 250, 300, 400],
      backgroundColor: [
        'var(--color-primary)',
        'var(--color-secondary)',
        'var(--color-accent)',
        'var(--color-tertiary)',
        '#9b59b6',
        '#95a5a6'
      ],
      borderWidth: 0
    }]
  },
  options: {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          generateLabels: function(chart) {
            const data = chart.data;
            const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
            
            return data.labels.map((label, i) => {
              const value = data.datasets[0].data[i];
              const percentage = ((value / total) * 100).toFixed(1);
              
              return {
                text: `${label}: $${value} (${percentage}%)`,
                fillStyle: data.datasets[0].backgroundColor[i],
                hidden: false,
                index: i
              };
            });
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${currencyFormatter.format(value)} (${percentage}%)`;
          }
        }
      }
    }
  }
});
```

### Dark Theme Integration
```javascript
// Use CSS variables for theme consistency
Chart.defaults.color = 'var(--color-text-2)';
Chart.defaults.borderColor = 'var(--color-border-1)';

const chartOptions = {
  options: {
    plugins: {
      legend: {
        labels: {
          color: 'var(--color-text-1)'
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'var(--color-border-1)'
        },
        ticks: {
          color: 'var(--color-text-2)'
        }
      },
      y: {
        grid: {
          color: 'var(--color-border-1)'
        },
        ticks: {
          color: 'var(--color-text-2)'
        }
      }
    }
  }
};
```

---

## 3. RECOMMENDED CHART LIBRARY

### Chart Configuration Factory
**Create reusable chart factory with Fireside branding:**

```javascript
// assets/js/chart-factory.js

class FiresideChartFactory {
  constructor() {
    // Set global defaults
    Chart.defaults.font.family = 'var(--font-body)';
    Chart.defaults.color = 'var(--color-text-2)';
    Chart.defaults.borderColor = 'var(--color-border-1)';
    
    this.currencyFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    });
  }
  
  createLineChart(ctx, data, options = {}) {
    return new Chart(ctx, {
      type: 'line',
      data: data,
      options: this._mergeOptions({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: 'var(--color-text-1)',
              padding: 15,
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: 'var(--color-bg-3)',
            titleColor: 'var(--color-text-1)',
            bodyColor: 'var(--color-text-2)',
            borderColor: 'var(--color-border-1)',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: ${this.currencyFormatter.format(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'var(--color-border-1)',
              drawBorder: false
            },
            ticks: {
              color: 'var(--color-text-2)'
            }
          },
          y: {
            grid: {
              color: 'var(--color-border-1)',
              drawBorder: false
            },
            ticks: {
              color: 'var(--color-text-2)',
              callback: (value) => this._formatCurrency(value)
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }, options)
    });
  }
  
  createBarChart(ctx, data, options = {}) {
    return new Chart(ctx, {
      type: 'bar',
      data: data,
      options: this._mergeOptions({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'var(--color-bg-3)',
            titleColor: 'var(--color-text-1)',
            bodyColor: 'var(--color-text-2)',
            borderColor: 'var(--color-border-1)',
            borderWidth: 1,
            callbacks: {
              label: (context) => {
                return this.currencyFormatter.format(context.parsed.y);
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: 'var(--color-text-2)'
            }
          },
          y: {
            grid: {
              color: 'var(--color-border-1)',
              drawBorder: false
            },
            ticks: {
              color: 'var(--color-text-2)',
              callback: (value) => this._formatCurrency(value)
            }
          }
        }
      }, options)
    });
  }
  
  createDonutChart(ctx, data, options = {}) {
    return new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: this._mergeOptions({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: 'var(--color-text-1)',
              padding: 12,
              usePointStyle: true,
              generateLabels: (chart) => {
                const data = chart.data;
                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                
                return data.labels.map((label, i) => {
                  const value = data.datasets[0].data[i];
                  const percentage = ((value / total) * 100).toFixed(1);
                  
                  return {
                    text: `${label} (${percentage}%)`,
                    fillStyle: data.datasets[0].backgroundColor[i],
                    hidden: false,
                    index: i
                  };
                });
              }
            }
          },
          tooltip: {
            backgroundColor: 'var(--color-bg-3)',
            titleColor: 'var(--color-text-1)',
            bodyColor: 'var(--color-text-2)',
            borderColor: 'var(--color-border-1)',
            borderWidth: 1,
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${this.currencyFormatter.format(value)} (${percentage}%)`;
              }
            }
          }
        }
      }, options)
    });
  }
  
  _formatCurrency(value) {
    if (value >= 1000000) {
      return '$' + (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return '$' + (value / 1000).toFixed(0) + 'K';
    }
    return this.currencyFormatter.format(value);
  }
  
  _mergeOptions(defaults, custom) {
    return {
      ...defaults,
      ...custom,
      plugins: {
        ...defaults.plugins,
        ...custom.plugins
      },
      scales: custom.scales || defaults.scales
    };
  }
}

// Export singleton instance
export const chartFactory = new FiresideChartFactory();
```

### Usage Example
```javascript
// In any page (e.g., dashboard.js)
import { chartFactory } from './chart-factory.js';

// Net Worth Over Time
const netWorthCtx = document.getElementById('netWorthChart').getContext('2d');
const netWorthData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [{
    label: 'Net Worth',
    data: [100000, 105000, 110000, 108000, 115000, 120000],
    borderColor: 'var(--color-primary)',
    backgroundColor: 'rgba(244, 78, 36, 0.1)',
    fill: true,
    tension: 0.4
  }]
};

const netWorthChart = chartFactory.createLineChart(netWorthCtx, netWorthData);

// Spending by Category
const spendingCtx = document.getElementById('spendingChart').getContext('2d');
const spendingData = {
  labels: ['Housing', 'Transport', 'Food', 'Utilities', 'Entertainment'],
  datasets: [{
    data: [1500, 450, 600, 250, 300],
    backgroundColor: [
      'var(--color-primary)',
      'var(--color-secondary)',
      'var(--color-accent)',
      'var(--color-tertiary)',
      '#9b59b6'
    ]
  }]
};

const spendingChart = chartFactory.createDonutChart(spendingCtx, spendingData);
```

---

## 4. ACCESSIBILITY

### ARIA Labels
```html
<div class="c-chart-wrapper" role="img" aria-label="Net worth over time line chart">
  <canvas id="netWorthChart"></canvas>
</div>
```

### Keyboard Navigation
```javascript
// Enable keyboard interaction with chart
chart.options.plugins.legend.onClick = function(e, legendItem, legend) {
  // Toggle dataset visibility
  const index = legendItem.datasetIndex;
  const chart = legend.chart;
  const meta = chart.getDatasetMeta(index);
  
  meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;
  chart.update();
};
```

### Screen Reader Support
```javascript
// Generate accessible table alternative
function generateAccessibleTable(chart) {
  const table = document.createElement('table');
  table.className = 'visually-hidden';  // Bootstrap SR-only class
  table.setAttribute('aria-label', 'Chart data table');
  
  // Header row
  const thead = table.createTHead();
  const headerRow = thead.insertRow();
  headerRow.insertCell().textContent = 'Period';
  chart.data.datasets.forEach(dataset => {
    headerRow.insertCell().textContent = dataset.label;
  });
  
  // Data rows
  const tbody = table.createTBody();
  chart.data.labels.forEach((label, i) => {
    const row = tbody.insertRow();
    row.insertCell().textContent = label;
    chart.data.datasets.forEach(dataset => {
      row.insertCell().textContent = currencyFormatter.format(dataset.data[i]);
    });
  });
  
  return table;
}

// Insert after canvas
const canvas = document.getElementById('myChart');
canvas.parentNode.appendChild(generateAccessibleTable(chart));
```

---

## 5. PERFORMANCE MONITORING

### Chart Load Time
```javascript
performance.mark('chart-start');

const chart = new Chart(ctx, config);

chart.options.animation.onComplete = function() {
  performance.mark('chart-end');
  performance.measure('chart-render', 'chart-start', 'chart-end');
  
  const measure = performance.getEntriesByName('chart-render')[0];
  console.log(`Chart rendered in ${measure.duration.toFixed(2)}ms`);
  
  // Alert if slow
  if (measure.duration > 1000) {
    console.warn('Chart render exceeded 1 second — consider optimization');
  }
};
```

---

## 6. NEXT STEPS

### Implementation Tasks
- [ ] **Task 1:** Audit existing Chart.js usage in `app/assets/js/`
- [ ] **Task 2:** Create `chart-factory.js` with Fireside branding
- [ ] **Task 3:** Refactor all charts to use factory pattern
- [ ] **Task 4:** Add responsive font sizing
- [ ] **Task 5:** Implement accessible table alternatives
- [ ] **Task 6:** Add performance monitoring
- [ ] **Task 7:** Create chart component CSS (`.c-chart-wrapper`)

### Chart Library Recommendations
**Current:** Chart.js (KEEP — good choice)  
**Alternatives Considered:**
- D3.js — Too complex for this use case
- Recharts — React-specific (not needed)
- ApexCharts — Commercial license required for some features

**Verdict:** Chart.js is optimal for Fireside Capital.

---

**Research status:** 75% complete  
**Next:** Audit existing implementation and create factory  
**Estimated implementation:** 6-8 hours
