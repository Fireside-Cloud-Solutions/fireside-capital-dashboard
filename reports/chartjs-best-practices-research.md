# Chart.js Best Practices Research — Fireside Capital
**Date:** February 23, 2026  
**Researcher:** Capital  
**Status:** Complete  

## Executive Summary
Chart.js remains a strong choice for financial dashboards in 2026 due to its **responsive design**, **lightweight footprint**, and **simplicity**. However, accessibility must be manually implemented, and production-grade charts require structured configuration. This research provides actionable patterns for creating accessible, performant, and clear financial data visualizations.

## Key Findings

### 1. Chart.js Strengths for Financial Dashboards

#### Why Chart.js Over Alternatives?
| Feature | Chart.js | Highcharts | D3.js |
|---------|----------|------------|-------|
| Learning curve | ✅ Low | Medium | High |
| Bundle size | ✅ 60KB | 90KB+ | 240KB+ |
| Responsive by default | ✅ Yes | Yes | Manual |
| Accessibility | ⚠️ Manual | Built-in | Manual |
| Commercial use | ✅ Free | Paid | Free |

For Fireside Capital: **Chart.js is ideal** because:
- Already integrated in the codebase
- Lightweight (critical for mobile users)
- Simple configuration (fast iteration)
- Free for commercial use

### 2. Accessibility — The Biggest Gap

#### The Problem
**Canvas elements are invisible to screen readers** unless explicitly made accessible. Chart.js renders to `<canvas>`, which has no semantic meaning.

#### Solution: ARIA + Fallback Content
```html
<!-- ❌ WRONG: Inaccessible chart -->
<canvas id="spending-chart"></canvas>

<!-- ✅ CORRECT: Accessible chart -->
<canvas
  id="spending-chart"
  role="img"
  aria-label="Pie chart showing spending breakdown for February 2026: Housing 40% ($1,800), Food 20% ($900), Transportation 15% ($675), Other 25% ($1,125)"
>
  <!-- Fallback content for screen readers -->
  <table>
    <caption>Spending Breakdown — February 2026</caption>
    <thead>
      <tr>
        <th scope="col">Category</th>
        <th scope="col">Amount</th>
        <th scope="col">Percentage</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Housing</td>
        <td>$1,800</td>
        <td>40%</td>
      </tr>
      <tr>
        <td>Food</td>
        <td>$900</td>
        <td>20%</td>
      </tr>
      <tr>
        <td>Transportation</td>
        <td>$675</td>
        <td>15%</td>
      </tr>
      <tr>
        <td>Other</td>
        <td>$1,125</td>
        <td>25%</td>
      </tr>
    </tbody>
  </table>
</canvas>
```

#### Accessibility Checklist
- [ ] Every `<canvas>` has `role="img"`
- [ ] Every `<canvas>` has descriptive `aria-label`
- [ ] Fallback `<table>` inside `<canvas>` tags
- [ ] Chart colors meet WCAG AA contrast ratios
- [ ] Patterns used in addition to color (for colorblind users)

### 3. Responsive Design — Mobile-First Configuration

#### The Pattern
Chart.js automatically resizes charts to fit their parent container. However, **responsive options** (fonts, padding, legend position) must be configured.

#### Mobile-Optimized Chart Configuration
```javascript
// app/assets/js/charts/spending-chart.js
const spendingChartConfig = {
  type: 'doughnut',
  data: {
    labels: ['Housing', 'Food', 'Transportation', 'Other'],
    datasets: [{
      data: [1800, 900, 675, 1125],
      backgroundColor: [
        'var(--color-primary)',
        'var(--color-secondary)',
        'var(--color-warning)',
        'var(--color-contrast-medium)'
      ],
      borderWidth: 0
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.5, // Wider on mobile
    
    // Mobile-first legend positioning
    plugins: {
      legend: {
        display: true,
        position: 'bottom', // Below chart on mobile
        labels: {
          boxWidth: 12,
          padding: 10,
          font: {
            size: 14,
            family: 'Inter, sans-serif'
          },
          // Generate accessible labels
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                const percent = Math.round((value / total) * 100);
                
                return {
                  text: `${label} (${percent}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percent = Math.round((value / total) * 100);
            
            return `${label}: $${value.toLocaleString()} (${percent}%)`;
          }
        },
        bodyFont: {
          size: 14
        },
        padding: 12
      }
    },
    
    // Responsive breakpoints
    responsive: true,
    maintainAspectRatio: true,
    onResize: function(chart, size) {
      // Adjust legend position on larger screens
      if (size.width > 768) {
        chart.options.plugins.legend.position = 'right';
      } else {
        chart.options.plugins.legend.position = 'bottom';
      }
    }
  }
};

// Initialize chart
const ctx = document.getElementById('spending-chart').getContext('2d');
const spendingChart = new Chart(ctx, spendingChartConfig);
```

### 4. Financial Chart Types — When to Use What

#### Chart Type Decision Matrix
| Data Type | Best Chart | Why |
|-----------|------------|-----|
| Spending breakdown | Doughnut/Pie | Shows proportions clearly |
| Net worth over time | Line | Shows trends and momentum |
| Income vs. Expenses | Bar (grouped) | Compares two metrics side-by-side |
| Debt payoff progress | Horizontal bar | Shows completion percentage |
| Budget vs. Actual | Bar (stacked) | Shows variance at a glance |

#### Doughnut Chart — Spending Breakdown
**When to use:** Category distributions (spending by category, asset allocation)  
**Configuration:**
```javascript
{
  type: 'doughnut',
  data: { /* categories and values */ },
  options: {
    cutout: '70%', // Larger center hole = cleaner look
    plugins: {
      legend: {
        position: 'right' // Desktop: legend on side
      }
    }
  }
}
```

#### Line Chart — Net Worth Trend
**When to use:** Trends over time (net worth, savings balance, investment growth)  
**Configuration:**
```javascript
{
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Net Worth',
      data: [120000, 122000, 125000, 123000, 127000, 127482],
      borderColor: 'var(--color-success)',
      backgroundColor: 'rgba(129, 185, 0, 0.1)', // Subtle fill
      tension: 0.4, // Smooth curves
      fill: true,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: false, // Financial data rarely starts at 0
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            return 'Net Worth: $' + context.parsed.y.toLocaleString();
          }
        }
      }
    }
  }
}
```

#### Horizontal Bar Chart — Debt Payoff Progress
**When to use:** Progress toward goals (debt payoff, savings targets)  
**Configuration:**
```javascript
{
  type: 'bar',
  data: {
    labels: ['Student Loan', 'Car Loan', 'Credit Card'],
    datasets: [{
      label: 'Paid Off',
      data: [35, 60, 80], // Percentages
      backgroundColor: 'var(--color-success)',
      barThickness: 20
    }, {
      label: 'Remaining',
      data: [65, 40, 20],
      backgroundColor: 'var(--color-contrast-low)',
      barThickness: 20
    }]
  },
  options: {
    indexAxis: 'y', // Horizontal bars
    scales: {
      x: {
        stacked: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      },
      y: {
        stacked: true
      }
    },
    plugins: {
      legend: {
        display: false // Legend not needed for binary progress
      }
    }
  }
}
```

### 5. Color Accessibility — Patterns Over Color

#### The Problem
**4.25% of users are colorblind** (1 in 12 men, 1 in 200 women). Relying solely on color to differentiate data is inaccessible.

#### Solution: Combine Color + Patterns
```javascript
// Define patterns for accessibility
const createPattern = (color, type) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 10;
  canvas.height = 10;
  
  ctx.fillStyle = color;
  
  switch(type) {
    case 'dots':
      ctx.fillRect(0, 0, 2, 2);
      ctx.fillRect(5, 5, 2, 2);
      break;
    case 'stripes':
      ctx.fillRect(0, 0, 5, 10);
      break;
    case 'cross':
      ctx.fillRect(0, 4, 10, 2);
      ctx.fillRect(4, 0, 2, 10);
      break;
    default:
      ctx.fillRect(0, 0, 10, 10);
  }
  
  return ctx.createPattern(canvas, 'repeat');
};

// Use patterns in chart
const spendingChart = new Chart(ctx, {
  type: 'doughnut',
  data: {
    datasets: [{
      data: [1800, 900, 675, 1125],
      backgroundColor: [
        createPattern('#01a4ef', 'solid'),
        createPattern('#f44e24', 'stripes'),
        createPattern('#ffc107', 'dots'),
        createPattern('#6c757d', 'cross')
      ]
    }]
  }
});
```

**Simpler approach:** Use shades of the same color
```javascript
backgroundColor: [
  'rgba(1, 164, 239, 1.0)',   // Primary (full opacity)
  'rgba(1, 164, 239, 0.75)',  // 75% opacity
  'rgba(1, 164, 239, 0.5)',   // 50% opacity
  'rgba(1, 164, 239, 0.25)'   // 25% opacity
]
```

### 6. Performance Optimization — Prevent Chart Lag

#### The Problem
Financial dashboards often update in real-time (balance refreshes, transaction imports). Recreating charts on every update causes lag.

#### Solution: Update Data, Don't Recreate Chart
```javascript
// ❌ WRONG: Recreates chart on every update (slow)
function updateSpendingChart(newData) {
  const ctx = document.getElementById('spending-chart').getContext('2d');
  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: newData
  });
}

// ✅ CORRECT: Updates existing chart (fast)
let spendingChart = null;

function initSpendingChart(initialData) {
  const ctx = document.getElementById('spending-chart').getContext('2d');
  spendingChart = new Chart(ctx, {
    type: 'doughnut',
    data: initialData
  });
}

function updateSpendingChart(newData) {
  if (spendingChart) {
    // Update data
    spendingChart.data.datasets[0].data = newData.values;
    spendingChart.data.labels = newData.labels;
    
    // Animate update
    spendingChart.update('active'); // 'active' for smooth transition
  }
}
```

#### Animation Configuration
```javascript
options: {
  animation: {
    duration: 750, // Smooth but not slow
    easing: 'easeInOutQuart'
  },
  // Disable animations on data updates for performance
  transitions: {
    active: {
      animation: {
        duration: 400
      }
    }
  }
}
```

### 7. Text Descriptions — Critical for Accessibility

#### The Pattern
**Every chart should have a text summary** that:
1. Describes what the chart shows
2. Highlights key insights
3. Provides context for decisions

#### Example: Spending Chart Description
```html
<div class="chart-wrapper">
  <canvas id="spending-chart" role="img" aria-labelledby="spending-chart-desc">
    <!-- Fallback table here -->
  </canvas>
  
  <!-- Text description (visible to all users) -->
  <p id="spending-chart-desc" class="chart-description text-sm color-contrast-medium margin-top-sm">
    Your spending for February 2026 totals $4,500. Housing ($1,800, 40%) and Food ($900, 20%) are your largest expenses.
    Food spending is 15% over your budget—consider reducing dining out this month.
  </p>
</div>
```

### 8. Tooltip Customization — Financial Context

#### Default Tooltips (Not Great)
```
Housing
1800
```

#### Customized Tooltips (Much Better)
```
Housing: $1,800 (40% of budget)
⚠️ 5% over budget
```

#### Implementation
```javascript
plugins: {
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    titleFont: {
      size: 14,
      weight: 'bold'
    },
    bodyFont: {
      size: 13
    },
    padding: 12,
    callbacks: {
      title: function(context) {
        return context[0].label;
      },
      label: function(context) {
        const value = context.parsed;
        const dataset = context.dataset;
        const total = dataset.data.reduce((a, b) => a + b, 0);
        const percent = Math.round((value / total) * 100);
        
        // Add budget comparison
        const budgets = {
          'Housing': 1800,
          'Food': 780,
          'Transportation': 650,
          'Other': 1000
        };
        
        const category = context.label;
        const budget = budgets[category];
        const variance = budget ? value - budget : null;
        
        let label = `$${value.toLocaleString()} (${percent}%)`;
        
        if (variance !== null) {
          if (variance > 0) {
            label += `\n⚠️ $${variance.toLocaleString()} over budget`;
          } else if (variance < 0) {
            label += `\n✓ $${Math.abs(variance).toLocaleString()} under budget`;
          }
        }
        
        return label;
      }
    }
  }
}
```

### 9. Chart.js Plugin Architecture

#### Useful Plugins for Financial Dashboards
| Plugin | Purpose | Use Case |
|--------|---------|----------|
| chartjs-plugin-datalabels | Show values on chart | Display percentages on pie slices |
| chartjs-plugin-annotation | Add reference lines | Mark budget thresholds |
| chartjs-plugin-zoom | Pan and zoom | Explore long time-series data |

#### Example: Data Labels on Doughnut Chart
```html
<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2"></script>
```

```javascript
{
  type: 'doughnut',
  data: { /* ... */ },
  options: {
    plugins: {
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold',
          size: 14
        },
        formatter: function(value, context) {
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percent = Math.round((value / total) * 100);
          return percent + '%';
        }
      }
    }
  },
  plugins: [ChartDataLabels]
}
```

### 10. Chart Configuration Structure

#### Maintainable Chart Factory Pattern
```javascript
// app/assets/js/charts/chart-factory.js
class FinancialChartFactory {
  static defaultOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          font: {
            family: 'Inter, sans-serif'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 }
      }
    }
  };
  
  static currencyFormatter(value) {
    return '$' + value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  
  static createSpendingChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    return new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: {
        ...this.defaultOptions,
        cutout: '70%',
        plugins: {
          ...this.defaultOptions.plugins,
          tooltip: {
            ...this.defaultOptions.plugins.tooltip,
            callbacks: {
              label: function(context) {
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percent = Math.round((value / total) * 100);
                return `${context.label}: ${FinancialChartFactory.currencyFormatter(value)} (${percent}%)`;
              }
            }
          }
        }
      }
    });
  }
  
  static createNetWorthChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    return new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        ...this.defaultOptions,
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: function(value) {
                return FinancialChartFactory.currencyFormatter(value);
              }
            }
          }
        },
        plugins: {
          ...this.defaultOptions.plugins,
          tooltip: {
            ...this.defaultOptions.plugins.tooltip,
            callbacks: {
              label: function(context) {
                return 'Net Worth: ' + FinancialChartFactory.currencyFormatter(context.parsed.y);
              }
            }
          }
        }
      }
    });
  }
}

// Usage
const spendingChart = FinancialChartFactory.createSpendingChart('spending-chart', spendingData);
const netWorthChart = FinancialChartFactory.createNetWorthChart('net-worth-chart', netWorthData);
```

## Recommendations for Fireside Capital

### Phase 1: Accessibility Audit & Fix (4 hours)
**Priority:** HIGH  
**Files:** All pages with charts (dashboard.html, reports.html, investments.html)

1. Add `role="img"` and `aria-label` to all `<canvas>` elements
2. Add fallback `<table>` inside canvas tags
3. Add text descriptions below charts
4. Verify color contrast ratios (WCAG AA minimum)

### Phase 2: Chart Factory Pattern (6 hours)
**Priority:** MEDIUM  

1. Create `app/assets/js/charts/chart-factory.js`
2. Extract all chart configurations into factory methods
3. Centralize currency formatting, tooltip callbacks
4. Update all pages to use factory pattern

### Phase 3: Mobile Optimization (3 hours)
**Priority:** MEDIUM  

1. Test all charts on mobile viewports
2. Adjust legend positions (bottom on mobile, right on desktop)
3. Reduce font sizes on mobile
4. Test touch interactions (tooltips, legends)

### Phase 4: Enhanced Tooltips (2 hours)
**Priority:** LOW  

1. Add budget variance to spending chart tooltips
2. Add trend indicators to net worth chart tooltips
3. Add percentage changes to all charts

### Phase 5: Performance Optimization (2 hours)
**Priority:** LOW  

1. Replace chart recreation with `.update()` method
2. Add debouncing to real-time data updates
3. Measure and optimize animation durations

## Code Examples Provided
✅ Accessible canvas with ARIA and fallback table  
✅ Mobile-optimized chart configuration  
✅ Financial chart type decision matrix  
✅ Doughnut, line, and horizontal bar chart configs  
✅ Pattern-based backgrounds for colorblind accessibility  
✅ Performance-optimized update pattern  
✅ Customized financial tooltips  
✅ Chart factory pattern for maintainability  

## Success Metrics
- **Accessibility:** 100% of charts pass WCAG AA
- **Performance:** Chart updates under 200ms
- **Mobile usability:** 95%+ of users can read charts on mobile
- **Clarity:** Text descriptions provided for all charts

## Related Documents
- CSS Architecture: `reports/css-architecture-research.md`
- UI Patterns: `reports/financial-dashboard-ui-patterns-research.md`

## References
- [Chart.js Official Docs](https://www.chartjs.org/docs/latest/)
- [Chart.js Accessibility Guide](https://www.chartjs.org/docs/latest/general/accessibility.html)
- [Chart Accessibility Best Practices (Highcharts)](https://www.highcharts.com/blog/best-practices/best-chart-accessibility-practices/)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
