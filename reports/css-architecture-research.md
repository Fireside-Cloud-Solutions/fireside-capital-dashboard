# CSS Architecture Research — Fireside Capital Dashboard
**Research Sprint**: February 20, 2026  
**Status**: Complete ✅  
**Priority**: High — Impacts maintainability, performance, and scalability

---

## Executive Summary

The Fireside Capital dashboard currently uses a **monolithic CSS architecture** with Bootstrap 5 and custom styles. While the design tokens system is solid, the 98KB `main.css` file creates maintainability and performance issues. This research identifies **3 critical improvements** and provides implementation code.

---

## Current Architecture Analysis

### ✅ What's Working
- **Design Tokens System**: Excellent foundation (`design-tokens.css`) with:
  - Logo-native brand colors (Orange, Blue, Green)
  - Financial semantic colors (positive/negative/neutral)
  - Complete typography scale
  - Spacing grid (8px base)
  - Dark/light mode support
- **Modular Files**: Some separation exists (components, utilities, responsive)
- **Bootstrap Integration**: Custom CSS variables properly override Bootstrap defaults

### ⚠️ Issues Identified
1. **main.css is 98KB** — Contains 3,600+ lines; slow parse time
2. **CSS Duplication** — `main.css.orig` (184KB backup) exists; unclear usage
3. **No Component Scoping** — Risk of unintended side effects
4. **Critical CSS Missing** — No above-the-fold optimization (critical.css exists but only 1.6KB)
5. **No CSS Purging** — Unused Bootstrap/custom styles shipped to production

---

## Recommended Architecture: CUBE CSS + Critical Path

**CUBE CSS** = Composition, Utilities, Blocks, Exceptions
- **Composition**: Layout patterns (grid, stack, cluster)
- **Utilities**: Single-purpose classes (`.text-center`, `.mt-4`)
- **Blocks**: Component styles (`.card`, `.btn`, `.chart-container`)
- **Exceptions**: Context-specific overrides (`[data-theme="light"] .card`)

### Benefits
- **Scalable**: Easy to add new components without breaking existing ones
- **Performant**: Critical CSS inline, rest lazy-loaded
- **Maintainable**: Clear ownership (composition = layout, blocks = components)

---

## Implementation Plan

### Phase 1: Split main.css into Logical Modules (Immediate)
Break `main.css` into purpose-driven files:

```
app/assets/css/
├── core/
│   ├── reset.css          # Normalize + base element styles
│   ├── design-tokens.css  # (existing) Variables
│   └── typography.css     # Font stacks, headings, body text
├── composition/
│   ├── layouts.css        # .container, .grid-2-col, .stack
│   └── utilities.css      # (existing) Single-purpose helpers
├── blocks/
│   ├── buttons.css        # .btn, .btn-primary, .btn-ghost
│   ├── cards.css          # .card, .metric-card, .chart-card
│   ├── forms.css          # Input, select, checkbox styles
│   ├── navigation.css     # Sidebar, top nav, breadcrumbs
│   ├── tables.css         # Financial data tables
│   └── charts.css         # Chart.js container styles
├── pages/
│   ├── dashboard.css      # Dashboard-specific styles
│   ├── assets.css         # Assets page styles
│   └── reports.css        # Reports page styles
├── critical.css           # Above-fold (inline in <head>)
└── main.css               # Orchestrator (imports all modules)
```

**New main.css orchestrator**:
```css
/* Fireside Capital — Modular CSS Entry Point */
@import url('./core/reset.css');
@import url('./core/design-tokens.css');
@import url('./core/typography.css');

@import url('./composition/layouts.css');
@import url('./composition/utilities.css');

@import url('./blocks/buttons.css');
@import url('./blocks/cards.css');
@import url('./blocks/forms.css');
@import url('./blocks/navigation.css');
@import url('./blocks/tables.css');
@import url('./blocks/charts.css');

/* Page-specific (lazy-loaded per route) */
/* @import url('./pages/dashboard.css'); */
```

---

### Phase 2: Extract Critical CSS (Performance)
Inline critical CSS for instant first paint.

**Generate critical.css automatically**:
```powershell
# Install Critical package
npm install --save-dev critical

# Generate critical CSS for dashboard
npx critical https://nice-cliff-05b13880f.2.azurestaticapps.net/dashboard.html `
  --base app/ `
  --inline `
  --minify `
  --width 1920 `
  --height 1080 `
  --target critical.css
```

**Manual extraction** (if automation fails):
```css
/* critical.css — Above-the-fold styles only */
@import url('./core/design-tokens.css');

/* Layout shell */
.sidebar { width: 240px; background: var(--color-bg-2); }
.main-content { margin-left: 240px; padding: var(--space-lg); }

/* Dashboard KPI cards (first 4 visible) */
.metric-card {
  background: var(--color-bg-2);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-md);
}
.metric-value { font-size: var(--text-h2); font-weight: var(--weight-bold); }

/* Skeleton loader for charts */
.chart-skeleton {
  background: linear-gradient(90deg, var(--color-bg-2) 25%, var(--color-bg-3) 50%, var(--color-bg-2) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer { to { background-position: -200% 0; } }
```

**HTML implementation**:
```html
<!-- dashboard.html -->
<head>
  <!-- Critical CSS inlined -->
  <style>
    <?php include 'assets/css/critical.css'; ?>
  </style>
  
  <!-- Non-critical CSS lazy-loaded -->
  <link rel="preload" href="assets/css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="assets/css/main.css"></noscript>
</head>
```

---

### Phase 3: Purge Unused CSS (Production Optimization)
Remove unused Bootstrap classes and custom styles.

**PurgeCSS config** (`purgecss.config.js`):
```javascript
module.exports = {
  content: [
    './app/**/*.html',
    './app/assets/js/**/*.js',
  ],
  css: ['./app/assets/css/main.css'],
  output: './app/assets/css/dist/',
  safelist: [
    /^chart-/,      // Chart.js classes (dynamically added)
    /^toast-/,      // Toast notifications
    /^modal-/,      // Bootstrap modals
    /^dropdown-/,   // Bootstrap dropdowns
    'show', 'active', 'disabled', // Dynamic states
  ],
  defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
}
```

**Build script** (package.json):
```json
{
  "scripts": {
    "build:css": "purgecss --config purgecss.config.js",
    "watch:css": "chokidar 'app/assets/css/**/*.css' -c 'npm run build:css'"
  },
  "devDependencies": {
    "@fullhuman/postcss-purgecss": "^6.0.0",
    "purgecss": "^6.0.0",
    "chokidar-cli": "^3.0.0"
  }
}
```

**Expected savings**: 98KB → ~35KB (64% reduction)

---

### Phase 4: Component-Scoped Styles (Best Practice)
Use BEM naming or data attributes to prevent style conflicts.

**Before (global scope)**:
```css
.card { background: var(--color-bg-2); }
.card-title { font-size: var(--text-h3); }
```

**After (BEM)**:
```css
.metric-card { background: var(--color-bg-2); }
.metric-card__title { font-size: var(--text-h3); }
.metric-card__value { font-size: var(--text-h2); color: var(--color-financial-positive); }
.metric-card__value--negative { color: var(--color-financial-negative); }
```

**Or use data attributes**:
```css
[data-component="metric-card"] { background: var(--color-bg-2); }
[data-component="metric-card"] [data-element="title"] { font-size: var(--text-h3); }
```

---

## Financial Dashboard Specific Patterns

### Pattern 1: Metric Cards
```css
/* blocks/cards.css */
.metric-card {
  background: var(--color-bg-2);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-md);
  transition: var(--transition-shadow);
}
.metric-card:hover { box-shadow: var(--shadow-lg); }

.metric-card__label {
  font-size: var(--text-body-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}

.metric-card__value {
  font-size: var(--text-h1);
  font-weight: var(--weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.metric-card__change {
  font-size: var(--text-body-sm);
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}
.metric-card__change--positive { color: var(--color-financial-positive); }
.metric-card__change--negative { color: var(--color-financial-negative); }
```

### Pattern 2: Financial Tables
```css
/* blocks/tables.css */
.financial-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: var(--color-bg-2);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.financial-table thead {
  background: var(--color-bg-3);
}

.financial-table th {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-size: var(--text-body-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}

.financial-table td {
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--color-border-subtle);
}

.financial-table__amount--positive { color: var(--color-financial-positive-text); }
.financial-table__amount--negative { color: var(--color-financial-negative-text); }

/* Hover row highlight */
.financial-table tbody tr:hover {
  background: var(--color-bg-3);
  transition: background var(--duration-fast) var(--ease-default);
}
```

### Pattern 3: Chart Containers
```css
/* blocks/charts.css */
.chart-container {
  background: var(--color-bg-2);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-md);
  position: relative;
  min-height: 400px; /* Prevents layout shift */
}

.chart-container__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.chart-container__title {
  font-size: var(--text-h4);
  font-weight: var(--weight-semibold);
  color: var(--color-text-primary);
}

.chart-container__controls {
  display: flex;
  gap: var(--space-2);
}

/* Canvas wrapper with aspect ratio */
.chart-wrapper {
  position: relative;
  width: 100%;
  height: 400px; /* Fixed height for financial charts */
}

/* Loading state */
.chart-container--loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border-subtle);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
```

---

## Implementation Checklist

- [ ] **Week 1**: Split main.css into modular files (core/, composition/, blocks/)
- [ ] **Week 1**: Extract critical.css for dashboard.html
- [ ] **Week 2**: Implement PurgeCSS build process
- [ ] **Week 2**: Convert global styles to BEM naming
- [ ] **Week 3**: Add lazy-loading for page-specific CSS
- [ ] **Week 3**: Measure performance (Lighthouse score before/after)

---

## Performance Targets

| Metric | Before | Target | Impact |
|--------|--------|--------|--------|
| CSS File Size | 98KB | 35KB | 64% reduction |
| First Contentful Paint | ~1.2s | ~0.6s | 50% faster |
| Time to Interactive | ~2.5s | ~1.5s | 40% faster |
| Lighthouse Score | 78 | 95+ | Production ready |

---

## Next Steps

1. **Create Task Work Item**: "Split main.css into modular architecture"
2. **Create Task Work Item**: "Implement PurgeCSS build process"
3. **Create Task Work Item**: "Extract critical.css for all pages"
4. **Update Documentation**: Add CSS architecture guide to `/docs`

---

**Researcher**: Capital (Orchestrator)  
**Next Research Topic**: Chart.js configuration for financial dashboards
