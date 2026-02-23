# Azure DevOps Research Work Items — Ready for Import
**Created:** Monday, February 23, 2026, 5:58 AM  
**Agent:** Researcher (Capital)  
**Org:** fireside365  
**Project:** Fireside Capital

---

## Summary

**Research Status:** ✅ 12/12 topics complete (100%)  
**Implementation Status:** ⏸️ Waiting for Builder  
**Work Items to Create:** 15 (3 User Stories + 12 Tasks)  
**Total Estimated Effort:** ~18 hours  
**Expected Impact:** 60-70% performance improvement, -100KB bundle size, +10 Lighthouse points

---

## ⚡ QUICK WINS — Highest Priority (3.5 hours)

### User Story #1: Chart.js Performance Optimization
**Priority:** 1 (High)  
**Description:** Optimize Chart.js bundle size and rendering performance  
**Acceptance Criteria:**
- [ ] Bundle size reduced from 240KB to ~140KB (-42%)
- [ ] Page load time improved by 500ms
- [ ] Lighthouse performance score +10 points
- [ ] All 13 charts working correctly

**Tasks:**

#### Task #1: Create Chart.js Custom Build
**Effort:** 2 hours  
**Priority:** 1  
**Description:** Build custom Chart.js bundle with only needed components  
**Implementation:**
```bash
# Install Chart.js source
npm install chart.js

# Create custom build file
cat > app/assets/js/chart-custom-build.js << 'EOF'
import {
  Chart,
  LineController,
  BarController,
  DoughnutController,
  PieController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(
  LineController,
  BarController,
  DoughnutController,
  PieController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default Chart;
EOF

# Build bundle
npx esbuild app/assets/js/chart-custom-build.js --bundle --minify --outfile=app/assets/js/chartjs-custom.min.js

# Update HTML
# Replace: <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
# With: <script src="/assets/js/chartjs-custom.min.js"></script>
```

**Acceptance Criteria:**
- [ ] Custom bundle created (140KB vs 240KB CDN)
- [ ] All 13 charts render correctly
- [ ] No console errors

**Reference:** `docs/research/chartjs-performance-findings.md` lines 45-78

---

### User Story #2: CSS Architecture Modernization
**Priority:** 1 (High)  
**Description:** Implement CSS Layers to eliminate !important wars  
**Acceptance Criteria:**
- [ ] CSS organized into @layer structure
- [ ] 200+ !important declarations removed
- [ ] No specificity conflicts

**Tasks:**

#### Task #2: Implement CSS Layers
**Effort:** 30 minutes  
**Priority:** 1  
**Description:** Organize CSS into cascading layers to control specificity  
**Implementation:**
```css
/* Add to top of main.css */
@layer reset, base, tokens, components, utilities, overrides;

/* Existing reset styles */
@layer reset {
  *, *::before, *::after {
    box-sizing: border-box;
  }
}

/* Design tokens */
@layer tokens {
  :root {
    --color-primary: #01a4ef;
    --color-danger: #f44e24;
    /* ... existing custom properties */
  }
}

/* Components */
@layer components {
  .btn {
    /* Existing button styles */
  }
  
  .card {
    /* Existing card styles */
  }
}

/* Utilities (highest priority) */
@layer utilities {
  .text-center { text-align: center !important; }
  .d-none { display: none !important; }
}
```

**Acceptance Criteria:**
- [ ] All CSS files organized into layers
- [ ] Can remove !important from 200+ declarations
- [ ] Visual regression testing passes

**Reference:** `docs/research/01-css-architecture.md` lines 102-156

---

#### Task #3: Implement Container Queries for Responsive Charts
**Effort:** 1 hour  
**Priority:** 1  
**Description:** Make charts responsive to their container width, not viewport  
**Implementation:**
```css
/* Add to main.css */
.chart-wrapper {
  container-type: inline-size;
  container-name: chart;
}

@container chart (max-width: 500px) {
  .chart-legend {
    display: none;
  }
  
  .chart-title {
    font-size: 14px;
  }
}

@container chart (min-width: 800px) {
  .chart-wrapper {
    padding: 24px;
  }
}
```

**Update HTML:**
```html
<!-- Wrap all charts -->
<div class="chart-wrapper" style="height: 300px;">
  <canvas id="netWorthChart"></canvas>
</div>
```

**Acceptance Criteria:**
- [ ] All 13 charts wrapped in container query wrappers
- [ ] Charts resize based on container, not viewport
- [ ] Mobile responsiveness improved
- [ ] Visual regression testing passes

**Reference:** `docs/research/css-architecture-findings.md` lines 89-134

---

## 🚀 HIGH-PRIORITY IMPLEMENTATIONS (8 hours)

### User Story #3: Critical CSS Extraction
**Priority:** 2 (Medium-High)  
**Description:** Extract above-the-fold CSS to improve First Contentful Paint  
**Acceptance Criteria:**
- [ ] FCP improved by 40-50%
- [ ] Critical CSS inlined (<14KB)
- [ ] Non-critical CSS deferred

**Tasks:**

#### Task #4: Extract and Inline Critical CSS
**Effort:** 1 hour  
**Priority:** 2  
**Implementation:**
```bash
# Install Critical
npm install critical

# Extract critical CSS for dashboard
npx critical https://nice-cliff-05b13880f.2.azurestaticapps.net/index.html \
  --base app \
  --inline \
  --width 1300 \
  --height 900 \
  --target index.html

# Repeat for all 12 pages
```

**Acceptance Criteria:**
- [ ] Critical CSS extracted for all 12 pages
- [ ] Inlined in <head> (< 14KB each)
- [ ] Non-critical CSS loaded async
- [ ] FCP improved by 400-500ms

**Reference:** `reports/SPRINT-RESEARCH-PERFORMANCE-OPTIMIZATION-2026-02-04.md` lines 215-267

---

#### Task #5: Add Preconnect Hints for Supabase
**Effort:** 30 minutes  
**Priority:** 2  
**Implementation:**
```html
<!-- Add to <head> of all 12 HTML files -->
<link rel="preconnect" href="https://qqtiofdqplwycnwplmen.supabase.co">
<link rel="dns-prefetch" href="https://qqtiofdqplwycnwplmen.supabase.co">
```

**Acceptance Criteria:**
- [ ] All 12 pages have preconnect hints
- [ ] API requests 100-300ms faster (verified via DevTools)
- [ ] First API call latency reduced

**Reference:** `docs/research/00-INDEX.md` lines 442-450

---

#### Task #6: Implement Chart.js Lazy Loading
**Effort:** 2 hours  
**Priority:** 2  
**Implementation:**
```javascript
// Add to chart-factory.js
const chartObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const canvas = entry.target;
      const chartConfig = chartConfigs.get(canvas.id);
      
      if (chartConfig) {
        new Chart(canvas, chartConfig);
        chartObserver.unobserve(canvas);
      }
    }
  });
}, {
  rootMargin: '100px' // Load 100px before entering viewport
});

// Update all chart initialization
document.querySelectorAll('canvas[data-lazy-chart]').forEach(canvas => {
  chartObserver.observe(canvas);
});
```

**Acceptance Criteria:**
- [ ] Charts only render when visible
- [ ] Initial page load 40% faster
- [ ] No visual difference for above-the-fold charts
- [ ] Smooth transitions for below-the-fold charts

**Reference:** `reports/research-chartjs-optimization-2026-02-13.md` lines 178-225

---

#### Task #7: Implement Font Preloading
**Effort:** 30 minutes  
**Priority:** 2  
**Implementation:**
```html
<!-- Add to <head> of all 12 HTML files -->
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&display=swap" as="style">
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" as="style">

<!-- Load fonts async -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&display=swap" media="print" onload="this.media='all'">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" media="print" onload="this.media='all'">
```

**Acceptance Criteria:**
- [ ] All 12 pages preload fonts
- [ ] FCP improved by 200-300ms
- [ ] No FOUT (Flash of Unstyled Text)

**Reference:** `docs/research/00-INDEX.md` lines 451-458

---

#### Task #8: Add Event Listener Delegation
**Effort:** 1-2 hours  
**Priority:** 2  
**Implementation:**
```javascript
// BEFORE (many individual listeners)
document.querySelectorAll('.edit-btn').forEach(btn => {
  btn.addEventListener('click', handleEdit);
});

// AFTER (single delegated listener)
document.querySelector('#assetsTable').addEventListener('click', (e) => {
  if (e.target.matches('.edit-btn')) {
    handleEdit(e);
  }
});
```

**Acceptance Criteria:**
- [ ] Refactor tables to use delegation (assets, bills, debts, income, investments, transactions)
- [ ] Memory usage reduced by 60-70%
- [ ] No functional regressions

**Reference:** `docs/research/00-INDEX.md` lines 459-466

---

#### Task #9: Add Performance Budgets to Build
**Effort:** 1 hour  
**Priority:** 3  
**Implementation:**
```javascript
// Create webpack.config.js
module.exports = {
  performance: {
    maxAssetSize: 200000,  // 200KB
    maxEntrypointSize: 300000,  // 300KB
    hints: 'error'
  }
};
```

**Acceptance Criteria:**
- [ ] Webpack build configured
- [ ] Performance budgets enforced
- [ ] Build fails if budgets exceeded

**Reference:** `docs/research/00-INDEX.md` lines 467-474

---

#### Task #10: Set Up Lighthouse CI Performance Gates
**Effort:** 2-3 hours  
**Priority:** 3  
**Implementation:**
```yaml
# Create .github/workflows/lighthouse-ci.yml
name: Lighthouse CI
on: [pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://nice-cliff-05b13880f.2.azurestaticapps.net/
          budgetPath: ./budget.json
          uploadArtifacts: true
```

**Acceptance Criteria:**
- [ ] Lighthouse CI workflow created
- [ ] PRs blocked if performance < 90
- [ ] Lighthouse reports uploaded as artifacts

**Reference:** `docs/research/00-INDEX.md` lines 475-482

---

## 📊 MEDIUM-PRIORITY IMPLEMENTATIONS (6.5 hours)

#### Task #11: Implement CSS Nesting Refactor
**Effort:** 2 hours  
**Priority:** 3  
**Implementation:**
```css
/* BEFORE */
.card { }
.card .card-header { }
.card .card-header .card-title { }

/* AFTER (CSS Nesting) */
.card {
  .card-header {
    .card-title {
      font-size: 1.25rem;
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All component CSS refactored to use nesting
- [ ] Improved readability and maintainability
- [ ] Visual regression testing passes

**Reference:** `docs/research/01-css-architecture.md` lines 78-101

---

#### Task #12: Implement View Transitions API
**Effort:** 1 hour  
**Priority:** 3  
**Implementation:**
```javascript
// Add smooth page transitions
if (document.startViewTransition) {
  document.startViewTransition(() => {
    // Navigate to new page
  });
}
```

**Acceptance Criteria:**
- [ ] Smooth transitions between pages
- [ ] Polyfill for unsupported browsers
- [ ] No jank or layout shifts

**Reference:** `docs/research/css-architecture-analysis.md` lines 245-289

---

#### Task #13: Reorganize CSS Files (ITCSS Structure)
**Effort:** 4 hours  
**Priority:** 3  
**Implementation:**
```
app/assets/css/
├── 1-settings/
│   └── design-tokens.css
├── 3-generic/
│   └── reset.css
├── 4-elements/
│   └── typography.css
├── 5-objects/
│   └── layouts.css
├── 6-components/
│   ├── buttons.css
│   ├── cards.css
│   └── charts.css
├── 7-utilities/
│   └── utilities.css
└── main.css (imports all layers)
```

**Acceptance Criteria:**
- [ ] CSS split into ITCSS layers
- [ ] main.css imports in correct order
- [ ] No visual regressions

**Reference:** `docs/research/01-css-architecture.md` lines 45-77

---

## 📋 Backlog Copy-Paste Work Item Templates

### For Azure DevOps Web UI

**User Story #1:**
```
Title: Chart.js Performance Optimization
Work Item Type: User Story
Area Path: Fireside Capital
Iteration: Current
Priority: 1
Effort: 2
Description: Optimize Chart.js bundle size and rendering performance
Acceptance Criteria:
- Bundle size reduced from 240KB to ~140KB (-42%)
- Page load time improved by 500ms
- Lighthouse performance score +10 points
- All 13 charts working correctly

Tags: performance, research-implementation, quick-win
```

**Task #1 (child of User Story #1):**
```
Title: Create Chart.js Custom Build
Work Item Type: Task
Parent: User Story #1
Area Path: Fireside Capital
Iteration: Current
Priority: 1
Original Estimate: 2
Description: Build custom Chart.js bundle with only needed components
Details: See reports/azure-devops-research-work-items-2026-02-23.md Task #1

Tags: performance, chart-js, bundle-optimization
```

Repeat for Tasks #2-13...

---

## 🎯 Expected Impact Summary

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Bundle Size** | 463KB | 155KB | -67% |
| **First Contentful Paint** | 2.8s | 1.5s | -46% |
| **Lighthouse Performance** | 72 | 95+ | +23 points |
| **Chart Rendering** | 2000ms | 200ms | -90% |
| **Page Load Time** | 4.2s | 2.1s | -50% |
| **CSS Size** | 223KB | 180KB | -19% |
| **Memory Usage** | High | Low | -60% (event delegation) |

---

## 🚀 Recommended Implementation Order

1. **Week 1 (Quick Wins — 3.5h):**
   - Task #1: Chart.js tree-shaking (2h)
   - Task #2: CSS Layers (30min)
   - Task #3: Container Queries (1h)

2. **Week 2 (Performance — 4h):**
   - Task #4: Critical CSS extraction (1h)
   - Task #5: Preconnect hints (30min)
   - Task #6: Chart lazy loading (2h)
   - Task #7: Font preloading (30min)

3. **Week 3 (Code Quality — 4h):**
   - Task #8: Event delegation (2h)
   - Task #11: CSS Nesting (2h)

4. **Week 4 (CI/CD — 4h):**
   - Task #9: Performance budgets (1h)
   - Task #10: Lighthouse CI (3h)

5. **Week 5 (Refactoring — 5h):**
   - Task #12: View Transitions (1h)
   - Task #13: ITCSS reorganization (4h)

**Total:** 20.5 hours over 5 weeks

---

## 📁 References

- `docs/research/00-INDEX.md` — Full research index
- `docs/research/01-css-architecture.md` — CSS architecture guide
- `docs/research/chartjs-performance-findings.md` — Chart.js optimization
- `docs/research/css-architecture-findings.md` — CSS container queries
- `reports/SPRINT-RESEARCH-PERFORMANCE-OPTIMIZATION-2026-02-04.md` — Performance guide

---

**Created by:** Researcher (Capital)  
**Date:** 2026-02-23 05:58 AM  
**Status:** Ready for Azure DevOps import  
**Next Step:** Founder or Builder to create work items via web UI
