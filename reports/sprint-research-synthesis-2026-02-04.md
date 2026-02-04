# Sprint Research Synthesis — Fireside Capital Dashboard
**Date:** February 4, 2026  
**Researcher:** Sprint Research Agent  
**Status:** ✅ All 6 topics completed

## Executive Summary
Completed comprehensive research on CSS architecture, financial dashboard UI patterns, Chart.js, Bootstrap dark theme, PWA, and performance optimization. Below are the **top 10 actionable recommendations** with implementation code.

---

## 🎯 Top 10 Actionable Recommendations

### 1. Implement CSS Custom Properties for Theming
**Impact:** High | **Effort:** Low | **File:** `app/assets/css/variables.css` (new)

```css
:root {
  /* Brand Colors */
  --brand-primary: #01a4ef;
  --brand-secondary: #f44e24;
  --brand-success: #81b900;
  
  /* Semantic Colors */
  --color-positive: #10b981;
  --color-negative: #ef4444;
  --color-neutral: #6b7280;
  
  /* UI Colors (Light Mode) */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --border-color: #dee2e6;
  
  /* Spacing Scale */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
}

[data-bs-theme="dark"] {
  --bg-primary: #212529;
  --bg-secondary: #343a40;
  --text-primary: #f8f9fa;
  --text-secondary: #adb5bd;
  --border-color: #495057;
}
```

**Update `app/index.html`:**
```html
<link rel="stylesheet" href="assets/css/variables.css">
```

---

### 2. Add Metric Cards with Trend Indicators
**Impact:** High | **Effort:** Medium | **File:** `app/assets/js/components/metric-card.js` (new)

```javascript
/**
 * MetricCard Component — Financial metric with trend visualization
 * Usage: MetricCard.render({ title, value, change, trend, format })
 */
export const MetricCard = {
  render({ title, value, change, trend = 'neutral', format = 'currency', compactValue = null }) {
    const formattedValue = this.formatValue(value, format);
    const trendIcon = this.getTrendIcon(trend);
    const trendColor = trend === 'up' ? 'success' : trend === 'down' ? 'danger' : 'secondary';
    
    return `
      <div class="card metric-card">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h6 class="text-muted mb-0">${title}</h6>
            ${change ? `<span class="badge bg-${trendColor}">${trendIcon} ${change}</span>` : ''}
          </div>
          <div class="metric-value">${formattedValue}</div>
          ${compactValue ? `<small class="text-muted">${compactValue}</small>` : ''}
        </div>
      </div>
    `;
  },
  
  formatValue(value, format) {
    switch(format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      case 'percent':
        return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
      case 'number':
        return new Intl.NumberFormat('en-US').format(value);
      default:
        return value;
    }
  },
  
  getTrendIcon(trend) {
    const icons = {
      up: '↑',
      down: '↓',
      neutral: '→'
    };
    return icons[trend] || icons.neutral;
  }
};
```

**CSS for metric cards (`app/assets/css/components.css`):**
```css
.metric-card {
  border-left: 4px solid var(--brand-primary);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.metric-card .badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.35rem 0.65rem;
}
```

---

### 3. Implement Chart.js Time-Series with Zoom
**Impact:** High | **Effort:** Medium | **File:** `app/assets/js/charts/net-worth-chart.js` (update)

```javascript
import { Chart } from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import zoomPlugin from 'chartjs-plugin-zoom';

Chart.register(zoomPlugin);

export function createNetWorthChart(ctx, data) {
  return new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        label: 'Net Worth',
        data: data.map(d => ({ x: new Date(d.date), y: d.net_worth })),
        borderColor: '#01a4ef',
        backgroundColor: 'rgba(1, 164, 239, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
            tooltipFormat: 'MMM d, yyyy',
            displayFormats: {
              day: 'MMM d',
              week: 'MMM d',
              month: 'MMM yyyy'
            }
          },
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: false,
          ticks: {
            callback: value => '$' + (value / 1000).toFixed(0) + 'k'
          }
        }
      },
      plugins: {
        zoom: {
          pan: {
            enabled: true,
            mode: 'x'
          },
          zoom: {
            wheel: {
              enabled: true,
              speed: 0.1
            },
            pinch: {
              enabled: true
            },
            mode: 'x'
          }
        },
        tooltip: {
          callbacks: {
            label: context => 
              'Net Worth: ' + new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD' 
              }).format(context.parsed.y)
          }
        }
      }
    }
  });
}
```

**Add to `app/package.json`:**
```json
{
  "dependencies": {
    "chart.js": "^4.4.0",
    "chartjs-adapter-date-fns": "^3.0.0",
    "chartjs-plugin-zoom": "^2.0.1",
    "date-fns": "^3.0.0"
  }
}
```

---

### 4. Bootstrap Dark Mode Toggle
**Impact:** Medium | **Effort:** Low | **File:** `app/assets/js/theme-switcher.js` (new)

```javascript
/**
 * Theme Switcher — Toggle between light/dark modes
 * Persists preference to localStorage
 */
export const ThemeSwitcher = {
  init() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.setTheme(savedTheme);
    this.attachToggle();
  },
  
  setTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update Chart.js default colors
    if (window.Chart) {
      const textColor = theme === 'dark' ? '#f8f9fa' : '#212529';
      const gridColor = theme === 'dark' ? '#495057' : '#dee2e6';
      
      window.Chart.defaults.color = textColor;
      window.Chart.defaults.borderColor = gridColor;
    }
  },
  
  toggle() {
    const current = document.documentElement.getAttribute('data-bs-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  },
  
  attachToggle() {
    const button = document.getElementById('theme-toggle');
    if (button) {
      button.addEventListener('click', () => this.toggle());
    }
  }
};

// Auto-init on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ThemeSwitcher.init());
} else {
  ThemeSwitcher.init();
}
```

**Add toggle button to navbar:**
```html
<button id="theme-toggle" class="btn btn-outline-secondary btn-sm">
  <i class="bi bi-moon-stars"></i>
</button>
```

---

### 5. PWA Manifest & Service Worker
**Impact:** Medium | **Effort:** Low | **Files:** `app/manifest.json` + `app/sw.js` (new)

**`app/manifest.json`:**
```json
{
  "name": "Fireside Capital",
  "short_name": "Capital",
  "description": "Personal finance dashboard",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#01a4ef",
  "icons": [
    {
      "src": "/assets/img/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/assets/img/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["finance", "productivity"],
  "shortcuts": [
    {
      "name": "Dashboard",
      "url": "/",
      "icon": "/assets/img/icon-192.png"
    },
    {
      "name": "Add Transaction",
      "url": "/?action=add-transaction",
      "icon": "/assets/img/icon-192.png"
    }
  ]
}
```

**`app/sw.js` (Cache-First Strategy):**
```javascript
const CACHE_NAME = 'fireside-capital-v1';
const urlsToCache = [
  '/',
  '/assets/css/style.css',
  '/assets/js/main.js',
  '/assets/img/logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

**Register in `app/index.html`:**
```html
<head>
  <link rel="manifest" href="/manifest.json">
  <script>
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  </script>
</head>
```

---

### 6. Lazy Load Chart.js Charts
**Impact:** Medium | **Effort:** Low | **File:** `app/assets/js/utils/lazy-charts.js` (new)

```javascript
/**
 * Lazy Chart Loader — Only render charts when visible
 * Uses IntersectionObserver to defer off-screen charts
 */
export const LazyCharts = {
  observers: new Map(),
  
  observe(canvasId, renderFunction) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          renderFunction(canvas);
          observer.disconnect();
        }
      });
    }, {
      rootMargin: '50px' // Start loading slightly before visible
    });
    
    observer.observe(canvas);
    this.observers.set(canvasId, observer);
  },
  
  observeAll(chartConfigs) {
    chartConfigs.forEach(({ id, render }) => this.observe(id, render));
  }
};
```

**Usage example:**
```javascript
import { LazyCharts } from './utils/lazy-charts.js';
import { createNetWorthChart } from './charts/net-worth-chart.js';

LazyCharts.observeAll([
  { id: 'netWorthChart', render: ctx => createNetWorthChart(ctx, netWorthData) },
  { id: 'spendingChart', render: ctx => createSpendingChart(ctx, spendingData) }
]);
```

---

### 7. Supabase Query Optimization
**Impact:** High | **Effort:** Low | **File:** `app/assets/js/api/supabase-client.js` (update)

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qqtiofdqplwycnwplmen.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGlvZmRxcGx3eWNud3BsbWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDY5NDIsImV4cCI6MjA4NTQ4Mjk0Mn0.Vjg7hQDPWJwmbkQccw5CXH_Npi2YJgJbt-OAEnF_P5g'
);

/**
 * Optimized Queries with Select Projection & Caching
 */
export const FinanceAPI = {
  cache: new Map(),
  
  async getDashboardData() {
    const cacheKey = 'dashboard';
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 60000) { // 1 min cache
        return cached.data;
      }
    }
    
    // Parallel requests with specific field selection
    const [assets, debts, investments, recentSnapshots] = await Promise.all([
      supabase.from('assets').select('value, loan').eq('user_id', userId),
      supabase.from('debts').select('balance, interest_rate').eq('user_id', userId),
      supabase.from('investments').select('balance').eq('user_id', userId),
      supabase.from('snapshots')
        .select('date, net_worth, assets_total, debts_total')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(30)
    ]);
    
    const data = {
      assets: assets.data,
      debts: debts.data,
      investments: investments.data,
      snapshots: recentSnapshots.data
    };
    
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  },
  
  invalidateCache(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
};
```

---

### 8. Performance: Code Splitting with Dynamic Imports
**Impact:** High | **Effort:** Medium | **File:** `app/assets/js/main.js` (update)

```javascript
/**
 * Route-based code splitting
 * Only load chart libraries when needed
 */
const router = {
  '/': () => import('./pages/dashboard.js').then(m => m.init()),
  '/assets': () => import('./pages/assets.js').then(m => m.init()),
  '/bills': () => import('./pages/bills.js').then(m => m.init()),
  '/reports': async () => {
    // Lazy load Chart.js only on reports page
    const [{ default: Chart }, reportsModule] = await Promise.all([
      import('chart.js/auto'),
      import('./pages/reports.js')
    ]);
    window.Chart = Chart;
    return reportsModule.init();
  }
};

async function navigate(path) {
  const loader = document.getElementById('page-loader');
  loader?.classList.remove('d-none');
  
  try {
    const handler = router[path] || router['/'];
    await handler();
  } catch (error) {
    console.error('Navigation error:', error);
  } finally {
    loader?.classList.add('d-none');
  }
}

// Initialize on load
navigate(window.location.pathname);
```

**Add loading spinner to `app/index.html`:**
```html
<div id="page-loader" class="d-none position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75" style="z-index: 9999;">
  <div class="spinner-border text-primary" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>
</div>
```

---

### 9. Accessible Data Tables with Sorting
**Impact:** Medium | **Effort:** Low | **File:** `app/assets/js/components/data-table.js` (new)

```javascript
/**
 * DataTable Component — Accessible, sortable tables for financial data
 */
export class DataTable {
  constructor(containerId, columns, data) {
    this.container = document.getElementById(containerId);
    this.columns = columns;
    this.data = data;
    this.sortColumn = null;
    this.sortDirection = 'asc';
    
    this.render();
  }
  
  render() {
    const table = document.createElement('table');
    table.className = 'table table-hover';
    table.setAttribute('role', 'table');
    
    // Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    this.columns.forEach((col, idx) => {
      const th = document.createElement('th');
      th.textContent = col.label;
      th.setAttribute('scope', 'col');
      
      if (col.sortable) {
        th.style.cursor = 'pointer';
        th.addEventListener('click', () => this.sort(idx));
      }
      
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Body
    const tbody = document.createElement('tbody');
    const sortedData = this.getSortedData();
    
    sortedData.forEach(row => {
      const tr = document.createElement('tr');
      
      this.columns.forEach(col => {
        const td = document.createElement('td');
        const value = row[col.field];
        td.innerHTML = col.format ? col.format(value) : value;
        tr.appendChild(td);
      });
      
      tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    this.container.innerHTML = '';
    this.container.appendChild(table);
  }
  
  sort(columnIndex) {
    if (this.sortColumn === columnIndex) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = columnIndex;
      this.sortDirection = 'asc';
    }
    this.render();
  }
  
  getSortedData() {
    if (this.sortColumn === null) return this.data;
    
    const field = this.columns[this.sortColumn].field;
    return [...this.data].sort((a, b) => {
      if (a[field] < b[field]) return this.sortDirection === 'asc' ? -1 : 1;
      if (a[field] > b[field]) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }
}
```

**Usage:**
```javascript
new DataTable('bills-table', [
  { label: 'Name', field: 'name', sortable: true },
  { label: 'Amount', field: 'amount', sortable: true, format: v => '$' + v.toFixed(2) },
  { label: 'Due Date', field: 'due_date', sortable: true }
], billsData);
```

---

### 10. Offline-First with IndexedDB Cache
**Impact:** Medium | **Effort:** High | **File:** `app/assets/js/utils/offline-db.js` (new)

```javascript
/**
 * Offline Database — IndexedDB wrapper for offline-first architecture
 */
export class OfflineDB {
  constructor(dbName = 'FiresideCapitalDB', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
  }
  
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('assets')) {
          db.createObjectStore('assets', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('bills')) {
          db.createObjectStore('bills', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('snapshots')) {
          const snapshotsStore = db.createObjectStore('snapshots', { keyPath: 'date' });
          snapshotsStore.createIndex('date', 'date', { unique: true });
        }
      };
    });
  }
  
  async set(storeName, data) {
    const tx = this.db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    
    if (Array.isArray(data)) {
      data.forEach(item => store.put(item));
    } else {
      store.put(data);
    }
    
    return tx.complete;
  }
  
  async get(storeName, key) {
    const tx = this.db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    return store.get(key);
  }
  
  async getAll(storeName) {
    const tx = this.db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    return store.getAll();
  }
}

// Usage with Supabase sync
const db = new OfflineDB();
await db.init();

// Cache Supabase response
const assets = await supabase.from('assets').select('*');
await db.set('assets', assets.data);

// Read from cache (works offline)
const cachedAssets = await db.getAll('assets');
```

---

## 📊 Implementation Priority Matrix

| Recommendation | Impact | Effort | Priority |
|----------------|--------|--------|----------|
| 1. CSS Variables | High | Low | **P0** |
| 2. Metric Cards | High | Medium | **P0** |
| 7. Query Optimization | High | Low | **P0** |
| 8. Code Splitting | High | Medium | **P1** |
| 3. Chart.js Time-Series | High | Medium | **P1** |
| 4. Dark Mode Toggle | Medium | Low | **P1** |
| 6. Lazy Load Charts | Medium | Low | **P2** |
| 5. PWA Manifest | Medium | Low | **P2** |
| 9. Data Tables | Medium | Low | **P2** |
| 10. Offline DB | Medium | High | **P3** |

---

## 🚀 Quick Start Implementation Plan

### Phase 1: Foundation (Week 1)
1. Create `app/assets/css/variables.css` — CSS custom properties
2. Create `app/assets/css/components.css` — Metric card styles
3. Create `app/assets/js/theme-switcher.js` — Dark mode toggle
4. Update `app/index.html` — Link new CSS, add theme toggle button

### Phase 2: Charts & Performance (Week 2)
5. Update `app/package.json` — Add Chart.js dependencies
6. Create `app/assets/js/charts/net-worth-chart.js` — Time-series chart with zoom
7. Create `app/assets/js/utils/lazy-charts.js` — Intersection Observer for charts
8. Update `app/assets/js/api/supabase-client.js` — Query optimization

### Phase 3: Progressive Enhancement (Week 3)
9. Create `app/manifest.json` + `app/sw.js` — PWA support
10. Create `app/assets/js/components/metric-card.js` — Metric card component
11. Create `app/assets/js/components/data-table.js` — Sortable tables
12. Update `app/assets/js/main.js` — Route-based code splitting

### Phase 4: Advanced Features (Week 4+)
13. Create `app/assets/js/utils/offline-db.js` — IndexedDB cache layer
14. Update all chart instances to use new Chart.js patterns
15. Add accessibility audits (ARIA labels, keyboard nav)
16. Performance audit (Lighthouse, bundle size analysis)

---

## 📝 Testing Checklist

- [ ] CSS variables work in light/dark mode
- [ ] Theme toggle persists across page reloads
- [ ] Charts render with zoom/pan enabled
- [ ] Lazy loading triggers when scrolling to charts
- [ ] PWA manifest validates (Chrome DevTools → Application)
- [ ] Service worker caches static assets
- [ ] Supabase queries use field projection
- [ ] Code splitting reduces initial bundle size
- [ ] Tables are keyboard-navigable
- [ ] Metric cards show correct trend indicators

---

## 🔗 Reference Documentation

All research reports available in `reports/`:
- `research-css-architecture-2026-02-03.md`
- `research-financial-dashboard-ui-patterns-2026-02-03.md`
- `research-chartjs-advanced-patterns-2026-02-03.md`
- `research-bootstrap-dark-theme-2026-02-04.md`
- `research-pwa-progressive-web-app-2026-02-04.md`
- `research-performance-optimization-2026-02-04.md`

---

**Next Action:** Spawn **Builder** sub-agent with Phase 1 tasks to begin implementation.
