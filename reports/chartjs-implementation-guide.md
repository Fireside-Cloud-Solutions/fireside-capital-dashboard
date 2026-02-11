# Chart.js Implementation Guide — February 10, 2026

## Why Chart.js for Fireside Capital?

**Chart.js is the ideal choice for our personal finance dashboard:**

- **Most popular:** 2M+ weekly downloads (market leader)
- **Free & open-source:** No licensing costs
- **Easy to implement:** Beginner-friendly API, detailed docs
- **Fast rendering:** HTML5 Canvas (faster than SVG)
- **Financial charts supported:** Via chartjs-chart-financial plugin
- **Extensive plugin ecosystem:** Thousands of extensions available
- **Recent improvements (v4+):**
  - Tree-shaking for smaller bundles
  - Better TypeScript support
  - Improved animations and zoom/pan controls
  - Enhanced customization

**Perfect fit for:** Quick dashboards, prototypes, and personal finance apps

---

## Chart Types for Financial Dashboards

### ✅ Line Charts — Time Series (PRIMARY)
**Use for:** Net worth over time, income trends, expense trends
**Why:** Excellent for showing financial progression
**Example use cases:**
- Net worth snapshots (daily/weekly/monthly)
- Income vs. expenses over 12 months
- Investment portfolio value over time

```javascript
const netWorthChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Net Worth',
      data: [120000, 122500, 125000, 123000, 126000, 125430],
      borderColor: '#01a4ef',
      backgroundColor: 'rgba(1, 164, 239, 0.1)',
      tension: 0.3,
      fill: true
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => `$${context.parsed.y.toLocaleString()}`
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`
        }
      }
    }
  }
});
```

### ✅ Bar Charts — Category Comparison
**Use for:** Expenses by category, monthly comparison
**Why:** Best for comparing discrete categories
**Example use cases:**
- Spending by category (rent, food, transport)
- Monthly expenses comparison
- Income sources breakdown

```javascript
const expenseChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Rent', 'Food', 'Transport', 'Entertainment', 'Utilities'],
    datasets: [{
      label: 'Monthly Expenses',
      data: [2000, 800, 300, 200, 150],
      backgroundColor: [
        '#f44e24', '#01a4ef', '#81b900', '#ffa500', '#9c27b0'
      ]
    }]
  },
  options: {
    responsive: true,
    indexAxis: 'y', // horizontal bars for better label readability
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => `$${context.parsed.x.toLocaleString()}`
        }
      }
    }
  }
});
```

### ✅ Doughnut Charts — Asset Allocation
**Use for:** Portfolio breakdown, spending distribution (3-5 categories only)
**Why:** Intuitive for part-to-whole visualization
**Example use cases:**
- Asset allocation (stocks, bonds, cash, real estate)
- Budget distribution
- Net worth composition

```javascript
const assetChart = new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: ['Investments', 'Property', 'Cash', 'Other'],
    datasets: [{
      data: [72000, 54000, 25000, 9000],
      backgroundColor: ['#01a4ef', '#81b900', '#ffa500', '#9c27b0'],
      borderWidth: 0
    }]
  },
  options: {
    responsive: true,
    cutout: '60%', // donut hole size
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: $${context.parsed.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    }
  }
});
```

### ⚠️ Candlestick Charts — Financial Securities (OPTIONAL)
**Use for:** Investment tracking (stocks, crypto)
**Why:** Standard for financial security visualization
**Requires:** chartjs-chart-financial plugin
**Example use cases:**
- Stock portfolio individual holdings
- Crypto price tracking

```javascript
// Requires: npm install chartjs-chart-financial
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
Chart.register(CandlestickController, CandlestickElement);

const stockChart = new Chart(ctx, {
  type: 'candlestick',
  data: {
    datasets: [{
      label: 'ONDS Stock Price',
      data: [
        {x: '2026-01-01', o: 5.2, h: 5.5, l: 5.1, c: 5.4},
        {x: '2026-01-02', o: 5.4, h: 5.7, l: 5.3, c: 5.6},
        // ...more data
      ]
    }]
  }
});
```

---

## Performance Optimization Techniques

### 1. Disable Animations (CRITICAL for Financial Dashboards)
**Why:** Animations slow down rendering and distract from data
**Impact:** 50-70% faster rendering

```javascript
const config = {
  options: {
    animation: false, // disable all animations
    // OR for specific animations:
    animations: {
      tension: {
        duration: 0
      }
    }
  }
};
```

### 2. Data Decimation (for Large Datasets)
**Why:** Reduce data points without losing visual fidelity
**Impact:** Massive performance gain for >1000 points

```javascript
const config = {
  options: {
    plugins: {
      decimation: {
        enabled: true,
        algorithm: 'lttb', // Largest Triangle Three Buckets
        samples: 100 // target number of samples
      }
    }
  }
};
```

### 3. Parsing: False (for Pre-formatted Data)
**Why:** Skip Chart.js data parsing when you control the format
**Impact:** 20-30% faster initialization

```javascript
const config = {
  data: {
    datasets: [{
      data: [
        {x: 1, y: 100},
        {x: 2, y: 105},
        // already in correct format
      ],
      parsing: false // skip parsing
    }]
  }
};
```

### 4. Lazy Loading Charts
**Why:** Only render charts when visible
**Impact:** Faster initial page load

```javascript
// Use Intersection Observer API
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const canvas = entry.target;
      renderChart(canvas); // initialize chart only when in viewport
      observer.unobserve(canvas);
    }
  });
});

document.querySelectorAll('.chart-canvas').forEach(canvas => {
  observer.observe(canvas);
});
```

### 5. Throttle Updates (for Real-time Data)
**Why:** Avoid re-rendering on every data change
**Impact:** Smooth performance with live data

```javascript
let updateTimeout;
function updateChartData(chart, newData) {
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    chart.data.datasets[0].data = newData;
    chart.update('none'); // 'none' mode = skip animations
  }, 100); // throttle to 10 updates/second max
}
```

### 6. Reduce Points Rendered
**Why:** Financial charts don't need individual point dots
**Impact:** Cleaner look + better performance

```javascript
const config = {
  options: {
    elements: {
      point: {
        radius: 0, // no dots on line charts
        hitRadius: 10 // but keep hover detection area
      },
      line: {
        borderWidth: 2,
        tension: 0.3 // smooth curves
      }
    }
  }
};
```

---

## Responsive Design Best Practices

### 1. Container-Based Responsiveness
**Rule:** Chart.js requires a relatively-positioned parent container

```html
<div class="chart-container" style="position: relative; height: 300px; width: 100%;">
  <canvas id="myChart"></canvas>
</div>
```

```javascript
const config = {
  options: {
    responsive: true,
    maintainAspectRatio: false // fill container height
  }
};
```

### 2. Mobile-Specific Adjustments
**Why:** Smaller screens need different layouts

```javascript
const isMobile = window.innerWidth < 768;

const config = {
  options: {
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'right',
        labels: {
          font: {
            size: isMobile ? 10 : 12
          }
        }
      },
      tooltip: {
        mode: isMobile ? 'nearest' : 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        ticks: {
          maxTicksLimit: isMobile ? 6 : 12, // fewer labels on mobile
          font: {
            size: isMobile ? 10 : 12
          }
        }
      }
    }
  }
};
```

### 3. Dynamic Height Based on Content
```css
/* Desktop: fixed height cards */
.c-chart-container {
  height: 300px;
}

/* Mobile: taller charts for readability */
@media (max-width: 768px) {
  .c-chart-container {
    height: 250px;
    margin-bottom: 1rem;
  }
}
```

---

## Essential Plugins

### 1. chartjs-adapter-luxon (DATE HANDLING)
**Why:** Chart.js requires date library for time-series
**Install:** `npm install chartjs-adapter-luxon luxon`
**Use:** Automatic time axis formatting

```javascript
import 'chartjs-adapter-luxon';

const config = {
  options: {
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'month',
          displayFormats: {
            month: 'MMM yyyy'
          }
        }
      }
    }
  }
};
```

### 2. chartjs-plugin-annotation (GOALS & TARGETS)
**Why:** Show target lines, savings goals, budget limits
**Install:** `npm install chartjs-plugin-annotation`

```javascript
import annotationPlugin from 'chartjs-plugin-annotation';
Chart.register(annotationPlugin);

const config = {
  plugins: [annotationPlugin],
  options: {
    plugins: {
      annotation: {
        annotations: {
          savingsGoal: {
            type: 'line',
            yMin: 150000,
            yMax: 150000,
            borderColor: '#81b900',
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              content: 'Goal: $150k',
              display: true
            }
          }
        }
      }
    }
  }
};
```

### 3. chartjs-plugin-zoom (INTERACTIVITY)
**Why:** Zoom and pan for detailed analysis
**Install:** `npm install chartjs-plugin-zoom`

```javascript
import zoomPlugin from 'chartjs-plugin-zoom';
Chart.register(zoomPlugin);

const config = {
  options: {
    plugins: {
      zoom: {
        zoom: {
          wheel: {
            enabled: true // zoom with mouse wheel
          },
          pinch: {
            enabled: true // zoom with touch pinch
          }
        },
        pan: {
          enabled: true,
          mode: 'x' // pan horizontally
        }
      }
    }
  }
};
```

### 4. chartjs-plugin-datalabels (DIRECT LABELING)
**Why:** Show values directly on charts
**Install:** `npm install chartjs-plugin-datalabels`

```javascript
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(ChartDataLabels);

const config = {
  plugins: [ChartDataLabels],
  options: {
    plugins: {
      datalabels: {
        formatter: (value) => `$${value.toLocaleString()}`,
        color: '#fff',
        font: {
          weight: 'bold'
        }
      }
    }
  }
};
```

---

## Fireside Capital Implementation Plan

### Phase 1: Setup & Core Charts (Week 1)
1. **Install Chart.js + adapters**
   ```bash
   npm install chart.js chartjs-adapter-luxon luxon
   ```

2. **Create chart utility module**
   ```javascript
   // app/assets/js/chart-utils.js
   import { Chart } from 'chart.js/auto';
   import 'chartjs-adapter-luxon';
   
   export const chartDefaults = {
     responsive: true,
     maintainAspectRatio: false,
     animation: false,
     plugins: {
       tooltip: {
         backgroundColor: 'rgba(0,0,0,0.8)',
         cornerRadius: 4,
         displayColors: false
       },
       legend: {
         labels: {
           usePointStyle: true,
           padding: 15
         }
       }
     }
   };
   
   export const formatCurrency = (value) => {
     return `$${value.toLocaleString('en-US', {
       minimumFractionDigits: 0,
       maximumFractionDigits: 0
     })}`;
   };
   ```

3. **Build net worth trend chart** (dashboard.html)
4. **Build expense breakdown chart** (dashboard.html)
5. **Build asset allocation chart** (assets.html)

### Phase 2: Advanced Features (Week 2)
1. **Add annotation plugin** for savings goals
2. **Add zoom plugin** for detailed analysis
3. **Implement responsive mobile layouts**
4. **Add "last updated" timestamp**

### Phase 3: Performance & Polish (Week 3)
1. **Implement lazy loading** for below-fold charts
2. **Add loading states** (skeleton screens)
3. **Optimize data queries** (limit to visible date ranges)
4. **Add chart export** (PNG/CSV)

---

## Example: Complete Dashboard Chart

```javascript
// app/assets/js/dashboard-charts.js
import { Chart } from 'chart.js/auto';
import 'chartjs-adapter-luxon';

export function createNetWorthChart(canvasId, snapshots) {
  const ctx = document.getElementById(canvasId);
  
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: snapshots.map(s => s.date),
      datasets: [{
        label: 'Net Worth',
        data: snapshots.map(s => s.net_worth),
        borderColor: '#01a4ef',
        backgroundColor: 'rgba(1, 164, 239, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHitRadius: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (context) => `Net Worth: $${context.parsed.y.toLocaleString()}`
          }
        }
      },
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
            display: false
          }
        },
        y: {
          ticks: {
            callback: (value) => `$${(value / 1000).toFixed(0)}k`
          },
          grid: {
            color: 'rgba(0,0,0,0.05)'
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    }
  });
}

// Usage in dashboard.html:
// <canvas id="netWorthChart" class="c-chart"></canvas>
// <script type="module">
//   import { createNetWorthChart } from './assets/js/dashboard-charts.js';
//   const snapshots = await fetchSnapshots(); // from Supabase
//   createNetWorthChart('netWorthChart', snapshots);
// </script>
```

---

## Color Palette (Fireside Capital Brand)

```javascript
export const colors = {
  primary: '#01a4ef',      // Fireside blue (main lines, primary actions)
  success: '#81b900',      // Green (positive trends, goals met)
  danger: '#f44e24',       // Orange/red (negative trends, alerts)
  warning: '#ffa500',      // Yellow/orange (caution, approaching limits)
  
  // Chart-specific
  income: '#81b900',
  expenses: '#f44e24',
  assets: '#01a4ef',
  debts: '#ff6b6b',
  netWorth: '#01a4ef',
  
  // Category colors (expenses)
  rent: '#f44e24',
  food: '#01a4ef',
  transport: '#81b900',
  entertainment: '#ffa500',
  utilities: '#9c27b0',
  other: '#607d8b'
};
```

---

## Common Pitfalls & Solutions

### ❌ Chart Not Responsive
**Problem:** Chart doesn't resize with window
**Solution:** Ensure parent container has position: relative and height set

### ❌ Chart Rendering Slow
**Problem:** Too many data points or animations enabled
**Solution:** Disable animations, use data decimation, reduce point radius to 0

### ❌ Dates Not Formatting Correctly
**Problem:** Missing date adapter
**Solution:** Install and import chartjs-adapter-luxon

### ❌ Charts Overlapping on Mobile
**Problem:** maintainAspectRatio: true (default)
**Solution:** Set maintainAspectRatio: false and control height via CSS

### ❌ Tooltip Shows Wrong Format
**Problem:** Default tooltip formatter
**Solution:** Use custom tooltip callback to format currency

---

## Resources

- **Official Docs:** https://www.chartjs.org/docs/latest/
- **GitHub:** https://github.com/chartjs/Chart.js
- **Financial Plugin:** https://github.com/chartjs/chartjs-chart-financial
- **Plugin Directory:** https://github.com/chartjs/awesome
- **Performance Guide:** https://www.chartjs.org/docs/latest/general/performance.html
- **Responsive Guide:** https://www.chartjs.org/docs/latest/configuration/responsive.html

---

## Next Steps

1. ✅ **Research complete**
2. ⬜ **Install Chart.js + adapters**
3. ⬜ **Create chart-utils.js module**
4. ⬜ **Build net worth trend chart**
5. ⬜ **Build expense breakdown chart**
6. ⬜ **Build asset allocation chart**
7. ⬜ **Integrate with Supabase data**
8. ⬜ **Test on mobile devices**

---

**Research completed:** February 10, 2026  
**Researcher:** Capital (Fireside Capital AI)  
**Status:** Ready for implementation
