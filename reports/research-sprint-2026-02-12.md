# Research Sprint Report — February 12, 2026

**Researcher:** Capital (Orchestrator)  
**Focus Areas:** CSS Architecture, Financial Dashboard UI Patterns, Chart.js Integration  
**Status:** In Progress

---

## 🏗️ CSS Architecture Analysis

### Current State (✅ STRONG)
The Fireside Capital dashboard has a **well-structured CSS architecture**:

```
assets/css/
├── design-tokens.css      (13.6 KB) — Brand colors, spacing, typography
├── financial-patterns.css (10.5 KB) — Financial-specific components
├── components.css         (33.2 KB) — Reusable UI components
├── utilities.css          (9.0 KB)  — Utility classes
├── responsive.css         (28.3 KB) — Breakpoint-specific styles
├── accessibility.css      (11.7 KB) — A11y overrides
├── main.css              (91.1 KB) — Core framework
├── onboarding.css        (8.2 KB)  — Onboarding flow styles
└── logged-out-cta.css    (4.6 KB)  — Landing page CTA
```

**Total CSS:** ~209 KB (minification recommended)

### ✅ Strengths
1. **Design tokens pattern** — CSS custom properties for theming
2. **Modular separation** — Concerns properly separated
3. **Financial-specific patterns** — Dedicated file for money display, charts, data tables
4. **Accessibility layer** — Separate file shows intentional focus on a11y

### 🚨 Areas for Improvement

#### 1. **CSS Load Performance**
**Problem:** 209 KB total CSS, 9 separate files  
**Impact:** Multiple HTTP requests, potential render-blocking

**RECOMMENDATION:**
```javascript
// Build step — Concatenate & minify CSS
// Add to package.json scripts:
"build:css": "postcss assets/css/*.css --dir dist/css --use cssnano autoprefixer"
```

**Task to create:** "Implement CSS build pipeline with PostCSS"

#### 2. **Critical CSS Extraction**
**Problem:** Main.css (91 KB) loads before first paint  
**Impact:** Slower initial page render

**RECOMMENDATION:**
```html
<!-- Inline critical CSS in <head> -->
<style>
  /* Only above-the-fold styles */
  :root { --color-bg-1: #0f0f0f; }
  body { background: var(--color-bg-1); }
  .nav-bar { /* critical nav styles */ }
</style>

<!-- Defer non-critical CSS -->
<link rel="preload" href="/assets/css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/assets/css/main.css"></noscript>
```

**Task to create:** "Extract and inline critical CSS for above-the-fold content"

#### 3. **CSS Variables for Theming**
**Current:** Design tokens exist but may not be fully leveraged  
**Opportunity:** Dark/light theme toggle

**RECOMMENDATION:**
```css
/* In design-tokens.css — Add theme switching */
:root {
  --theme-bg-1: #0f0f0f;
  --theme-bg-2: #1a1a1a;
  --theme-text-primary: #f5f5f5;
}

[data-theme="light"] {
  --theme-bg-1: #ffffff;
  --theme-bg-2: #f5f5f5;
  --theme-text-primary: #1a1a1a;
}

/* Then replace hardcoded colors */
body {
  background: var(--theme-bg-1);
  color: var(--theme-text-primary);
}
```

**Task to create:** "Add light/dark theme toggle with CSS variables"

---

## 💰 Financial Dashboard UI Best Practices

### Research Findings

#### 1. **Number Formatting Standards**
✅ **Already implemented** in `financial-patterns.css`:
```css
.amount {
  font-variant-numeric: tabular-nums; /* Aligns decimals */
  font-feature-settings: "tnum" 1;
}
```

**Additional recommendation — Add currency formatting utility:**
```javascript
// assets/js/formatters.js
export const formatCurrency = (amount, options = {}) => {
  const {
    locale = 'en-US',
    currency = 'USD',
    compact = false
  } = options;
  
  if (compact && Math.abs(amount) >= 1000) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
};

// Usage:
// formatCurrency(1250000) → "$1,250,000.00"
// formatCurrency(1250000, { compact: true }) → "$1.3M"
```

**Task to create:** "Add currency formatting utility with compact notation"

#### 2. **Data Visualization Hierarchy**
**Best Practice:** Use size + color to indicate importance

**RECOMMENDATION:**
```css
/* Add to financial-patterns.css */
.metric-hero {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.metric-supporting {
  font-size: 1.25rem;
  font-weight: 600;
  opacity: 0.8;
}

.metric-context {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--color-text-tertiary);
}

/* Example usage on dashboard */
<div class="metric-card">
  <div class="metric-hero">$247,392</div>
  <div class="metric-supporting">Net Worth</div>
  <div class="metric-context">↑ $12,450 (5.3%) this month</div>
</div>
```

**Task to create:** "Implement metric hierarchy classes for dashboard"

#### 3. **Status Indicators**
Financial apps need clear visual status:

**RECOMMENDATION:**
```css
/* Add to financial-patterns.css */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-badge::before {
  content: '';
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.status-paid {
  background: var(--color-accent-light);
  color: var(--color-accent);
}

.status-due-soon {
  background: rgba(255, 193, 7, 0.15);
  color: #ffc107;
}

.status-overdue {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.status-upcoming {
  background: var(--color-secondary-light);
  color: var(--color-secondary);
}
```

**Task to create:** "Add status badge component for bills and payments"

#### 4. **Transaction Lists**
**Research finding:** Financial apps need scannable transaction lists

**RECOMMENDATION:**
```html
<!-- Transaction list pattern -->
<div class="transaction-list">
  <div class="transaction-item">
    <div class="transaction-icon">
      <svg><!-- category icon --></svg>
    </div>
    <div class="transaction-details">
      <div class="transaction-name">Amazon.com</div>
      <div class="transaction-meta">Jan 15 • Shopping</div>
    </div>
    <div class="transaction-amount amount-negative">-$127.49</div>
  </div>
</div>
```

```css
/* Add to financial-patterns.css */
.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.transaction-item {
  display: grid;
  grid-template-columns: 48px 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  transition: background 0.15s ease;
}

.transaction-item:hover {
  background: var(--color-bg-3);
  cursor: pointer;
}

.transaction-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-3);
  border-radius: 50%;
}

.transaction-details {
  min-width: 0; /* Allow text truncation */
}

.transaction-name {
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.transaction-meta {
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
}

.transaction-amount {
  font-weight: 700;
  font-size: 1.125rem;
  text-align: right;
}
```

**Task to create:** "Build transaction list component with hover states"

---

## 📊 Chart.js Integration Best Practices

### Current State
Chart.js is loaded via CDN in HTML files.

### Recommendations

#### 1. **Consistent Chart Theming**
**RECOMMENDATION:**
```javascript
// assets/js/chart-theme.js
export const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#f5f5f5',
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 14
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(26, 26, 26, 0.95)',
      titleColor: '#f5f5f5',
      bodyColor: '#d4d4d4',
      borderColor: '#3f3f3f',
      borderWidth: 1,
      padding: 12,
      displayColors: true,
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) label += ': ';
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(context.parsed.y);
          }
          return label;
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.05)',
        borderColor: '#3f3f3f'
      },
      ticks: {
        color: '#a3a3a3'
      }
    },
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.05)',
        borderColor: '#3f3f3f'
      },
      ticks: {
        color: '#a3a3a3',
        callback: function(value) {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            maximumFractionDigits: 1
          }).format(value);
        }
      }
    }
  }
};

// Usage in dashboard.html:
import { chartDefaults } from './chart-theme.js';

const netWorthChart = new Chart(ctx, {
  type: 'line',
  data: { ... },
  options: {
    ...chartDefaults,
    // Page-specific overrides
  }
});
```

**Task to create:** "Create centralized Chart.js theme configuration"

#### 2. **Performance: Chart Data Updates**
**Problem:** Re-creating charts on every data update is expensive

**RECOMMENDATION:**
```javascript
// Instead of destroying and recreating:
chart.destroy();
chart = new Chart(ctx, config); // ❌ Slow

// Update data in place:
chart.data.datasets[0].data = newData;
chart.update('none'); // Skip animation for instant update
// or
chart.update(); // With animation
```

**Task to create:** "Optimize chart updates to use .update() instead of destroy/recreate"

#### 3. **Chart Accessibility**
**RECOMMENDATION:**
```html
<!-- Add ARIA labels to canvas elements -->
<canvas 
  id="netWorthChart" 
  role="img" 
  aria-label="Net worth over time, showing growth from $180,000 to $247,000"
></canvas>

<!-- Provide data table fallback -->
<details class="chart-data-table">
  <summary>View data table</summary>
  <table>
    <thead>
      <tr><th>Month</th><th>Net Worth</th></tr>
    </thead>
    <tbody id="netWorthTableData">
      <!-- Populated by JS -->
    </tbody>
  </table>
</details>
```

**Task to create:** "Add ARIA labels and data table fallbacks for all charts"

---

## 🌙 Bootstrap Dark Theme Optimization

### Current State
Custom dark theme using CSS variables (not Bootstrap's built-in dark mode).

### Recommendation: Stick with Custom Implementation
**Rationale:**
- Bootstrap 5.3+ dark mode is opt-in and adds overhead
- Custom CSS variables give more control
- Already implemented and working

**Enhancement: Add theme switcher**
```javascript
// assets/js/theme-switcher.js
class ThemeSwitcher {
  constructor() {
    this.theme = localStorage.getItem('theme') || 'dark';
    this.apply();
  }
  
  apply() {
    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('theme', this.theme);
  }
  
  toggle() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this.apply();
  }
}

export const themeSwitcher = new ThemeSwitcher();
```

```html
<!-- Add to nav bar -->
<button 
  id="themeToggle" 
  class="btn btn-tertiary" 
  aria-label="Toggle theme"
  onclick="themeSwitcher.toggle()"
>
  <svg class="icon-sun"><!-- sun icon --></svg>
  <svg class="icon-moon"><!-- moon icon --></svg>
</button>
```

**Task to create:** "Add theme toggle button with localStorage persistence"

---

## 📱 PWA (Progressive Web App) Research

### Benefits for Financial Dashboard
1. **Offline access** — View cached financial data without internet
2. **Install to home screen** — Native app feel
3. **Background sync** — Queue transactions when offline
4. **Push notifications** — Payment reminders (requires backend)

### Implementation Plan

#### Step 1: Service Worker
```javascript
// assets/sw.js
const CACHE_NAME = 'fireside-capital-v1';
const urlsToCache = [
  '/',
  '/assets/css/main.css',
  '/assets/js/main.js',
  '/dashboard.html',
  '/assets.html',
  '/bills.html'
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

#### Step 2: Web App Manifest
```json
// manifest.json
{
  "name": "Fireside Capital",
  "short_name": "Capital",
  "start_url": "/dashboard.html",
  "display": "standalone",
  "background_color": "#0f0f0f",
  "theme_color": "#f44e24",
  "icons": [
    {
      "src": "/assets/img/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/assets/img/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### Step 3: Register Service Worker
```html
<!-- Add to all HTML files before </body> -->
<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW registered', reg))
    .catch(err => console.error('SW registration failed', err));
}
</script>
```

**Tasks to create:**
1. "Create service worker for offline caching"
2. "Add web app manifest for PWA install"
3. "Generate PWA icons in multiple sizes"
4. "Test PWA install on mobile devices"

---

## ⚡ Performance Recommendations

### 1. **Lazy Load Chart.js**
**Problem:** Chart.js loads on every page, even pages without charts

**RECOMMENDATION:**
```html
<!-- Only load Chart.js on pages that need it -->
<script>
if (document.querySelector('canvas')) {
  import('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js')
    .then(() => {
      // Initialize charts
    });
}
</script>
```

**Task to create:** "Implement lazy loading for Chart.js library"

### 2. **Image Optimization**
**RECOMMENDATION:**
```html
<!-- Use WebP with fallback -->
<picture>
  <source srcset="/assets/img/logo.webp" type="image/webp">
  <img src="/assets/img/logo.png" alt="Fireside Capital" loading="lazy">
</picture>
```

**Task to create:** "Convert PNG/JPG assets to WebP format"

### 3. **Database Query Optimization**
**RECOMMENDATION for Supabase queries:**
```javascript
// ❌ Bad: Multiple round trips
const bills = await supabase.from('bills').select('*');
const debts = await supabase.from('debts').select('*');
const assets = await supabase.from('assets').select('*');

// ✅ Good: Single query with RPC
const { data } = await supabase.rpc('get_dashboard_summary', {
  user_id: userId
});
```

**Task to create:** "Create Supabase RPC function for dashboard summary data"

---

## 📋 Action Items Summary

### HIGH PRIORITY
1. ✅ **Implement CSS build pipeline** (PostCSS + minification)
2. ✅ **Add currency formatting utility** with compact notation
3. ✅ **Create Chart.js theme configuration** for consistent styling
4. ✅ **Add status badge component** for bills/payments

### MEDIUM PRIORITY
5. ✅ **Extract critical CSS** for faster first paint
6. ✅ **Build transaction list component** with proper styling
7. ✅ **Add theme toggle** (dark/light mode)
8. ✅ **Optimize chart updates** (use .update() method)

### LOW PRIORITY (Future Enhancements)
9. ⏳ **PWA implementation** (service worker + manifest)
10. ⏳ **Lazy load Chart.js** on pages that need it
11. ⏳ **Convert images to WebP** format
12. ⏳ **Create Supabase RPC** for dashboard queries

---

## 📊 Next Research Sprint
- **WebSockets vs Polling** for real-time transaction updates
- **Data caching strategies** (IndexedDB vs localStorage)
- **Financial data security** (encryption at rest)
- **Budget forecasting algorithms**

---

**Report Generated:** February 12, 2026 5:50 AM EST  
**Next Review:** February 19, 2026
