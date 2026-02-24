# Azure DevOps Work Items — Sprint Research Findings
**Created:** February 24, 2026 4:52 AM  
**Session:** sprint-research (cron f6500924)  
**Status:** ✅ Ready for Manual Import

---

## Import Instructions

**Azure DevOps:** https://dev.azure.com/fireside365/Fireside%20Capital  
**Project:** Fireside Capital

1. Navigate to Boards → Work Items
2. Click "+ New Work Item"
3. Copy details from each task below
4. Link related tasks to parent User Story/Feature

---

## 📊 CSS Architecture Research (001) — 6 Implementation Tasks

**Research Document:** `docs/research/css-architecture-analysis.md` (18.1 KB)  
**Implementation Effort:** 42 hours total (3 sprints)

### EPIC: CSS Architecture Modernization
**Type:** Epic  
**Priority:** P2  
**Description:** Implement ITCSS + BEM methodology for scalable CSS architecture. Reduce bundle size by 30-40%, improve maintainability, enable dark theme system.

**Acceptance Criteria:**
- [ ] CSS organized into 7 ITCSS layers (Settings, Tools, Generic, Elements, Objects, Components, Utilities)
- [ ] BEM naming convention documented and applied
- [ ] PostCSS build pipeline with autoprefixer + cssnano + PurgeCSS
- [ ] 230 KB → 150 KB CSS bundle size (-35%)
- [ ] Critical CSS inlined, non-critical async loaded
- [ ] FCP improved from ~1.2s to <0.8s (-33%)

---

### Task 1: Document CSS Architecture and BEM Naming Convention
**Type:** Task  
**Priority:** P1  
**Effort:** 2 hours  
**Parent:** CSS Architecture Modernization  
**Tags:** documentation, research

**Description:**  
Create comprehensive architecture guide in `docs/css-architecture.md` documenting:
- ITCSS layer purpose and usage
- BEM naming convention with examples
- Where to add new styles (decision tree)
- Component creation checklist

**Acceptance Criteria:**
- [ ] `docs/css-architecture.md` created with full ITCSS guide
- [ ] 20+ BEM examples covering common patterns
- [ ] Decision tree: "Where should I add this CSS?"
- [ ] Shared with team, added to onboarding docs

**Code Example:**
```markdown
# CSS Architecture Guide

## ITCSS Layers

1. **Settings** — Design tokens (colors, spacing, typography)
2. **Tools** — Mixins, functions
3. **Generic** — Reset, normalize
4. **Elements** — Base HTML elements (h1, p, a)
5. **Objects** — Layout primitives (.container, .stack)
6. **Components** — UI components (.c-dashboard-card)
7. **Utilities** — Single-purpose helpers (.u-mt-24)

## BEM Naming

`.block__element--modifier`

Examples:
- `.c-dashboard-card` (block)
- `.c-dashboard-card__header` (element)
- `.c-dashboard-card--highlighted` (modifier)
```

---

### Task 2: Audit and Reduce CSS Duplication
**Type:** Task  
**Priority:** P1  
**Effort:** 4 hours  
**Parent:** CSS Architecture Modernization  
**Tags:** refactoring, performance

**Description:**  
Find and consolidate duplicate CSS rules across 9 CSS files. Expected ~20 KB reduction.

**Steps:**
1. Run CSS duplication analysis: `csscss app/assets/css/*.css`
2. Identify duplicate rulesets (button styles, card layouts, etc.)
3. Extract to appropriate ITCSS layer (Objects or Components)
4. Update references in all files
5. Test on live site (all 12 pages)

**Acceptance Criteria:**
- [ ] No duplicate button, card, or form styles across files
- [ ] ~20 KB reduction in total CSS size
- [ ] All 12 pages tested with browser automation
- [ ] Zero visual regressions

**Known Duplicates:**
- Button styles (4 instances)
- Card shadow/border patterns (7 instances)
- Form validation states (3 instances)

---

### Task 3: Move Inline Styles to Components.css
**Type:** Task  
**Priority:** P1  
**Effort:** 6 hours  
**Parent:** CSS Architecture Modernization  
**Tags:** refactoring, accessibility, BEM

**Description:**  
Extract all `<style>` blocks from 12 HTML files, apply BEM naming, move to `components.css`.

**Process:**
1. Scan all 12 HTML pages for `<style>` blocks
2. Convert each block to BEM component (`.c-component-name`)
3. Add to `app/assets/css/6-components/`
4. Test on live site with browser automation

**Acceptance Criteria:**
- [ ] Zero `<style>` blocks in HTML files
- [ ] All styles moved to BEM components
- [ ] Live site tested (all 12 pages, screenshots)
- [ ] Cache-busting version updated (`?v=20260224`)

**Example:**
```html
<!-- BEFORE -->
<style>
.my-custom-card { padding: 16px; border: 1px solid #ccc; }
</style>

<!-- AFTER -->
<!-- In HTML: -->
<div class="c-custom-card">...</div>

<!-- In app/assets/css/6-components/_custom-card.css: -->
.c-custom-card {
  padding: var(--spacing-16);
  border: 1px solid var(--color-border);
}
```

---

### Task 4: Set Up PostCSS Build Pipeline
**Type:** Task  
**Priority:** P2  
**Effort:** 8 hours  
**Parent:** CSS Architecture Modernization  
**Tags:** devops, performance

**Description:**  
Add PostCSS build system with autoprefixer, cssnano, PurgeCSS. Expected 30-40% CSS size reduction (230 KB → 150 KB).

**Steps:**
1. Install PostCSS + plugins: `npm install postcss postcss-cli autoprefixer cssnano @fullhuman/postcss-purgecss --save-dev`
2. Create `postcss.config.js`
3. Update `package.json` scripts
4. Configure PurgeCSS safelist (dynamic classes, Chart.js)
5. Update Azure Static Web Apps GitHub Actions workflow
6. Test production build

**Acceptance Criteria:**
- [ ] PostCSS configured with 3 plugins
- [ ] `npm run build:css` minifies and purges
- [ ] CSS bundle: 230 KB → 150 KB (-35%)
- [ ] Azure deployment auto-runs build
- [ ] Zero visual regressions after purge

**postcss.config.js:**
```javascript
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('cssnano')({ preset: 'default' }),
    require('@fullhuman/postcss-purgecss')({
      content: ['./app/**/*.html', './app/**/*.js'],
      safelist: [/^bi-/, /^chart-/, /^toast-/, 'show', 'fade', 'modal-open']
    })
  ]
};
```

---

### Task 5: Generate Critical CSS for All Pages
**Type:** Task  
**Priority:** P2  
**Effort:** 6 hours  
**Parent:** CSS Architecture Modernization  
**Tags:** performance, FCP

**Description:**  
Extract above-the-fold CSS for all 12 pages, inline in `<head>`, async load non-critical. Expected 200-400ms faster FCP.

**Steps:**
1. Install Critical: `npm install critical --save-dev`
2. Generate critical CSS for all 12 pages
3. Inline critical CSS in `<head>` of each page
4. Async load full CSS: `<link rel="preload" as="style" onload="this.onload=null;this.rel='stylesheet'">`
5. Test FCP on slow 3G

**Acceptance Criteria:**
- [ ] Critical CSS < 14 KB per page
- [ ] FCP improved: ~1.2s → <0.8s (-33%)
- [ ] Lighthouse Performance score > 95
- [ ] No FOUC (Flash of Unstyled Content)

**Critical CSS Example:**
```html
<head>
  <!-- Inline critical CSS (design tokens + auth + typography) -->
  <style>
    :root { --color-primary: #f44e24; /* ... */ }
    body { font-family: Inter, sans-serif; /* ... */ }
  </style>
  
  <!-- Async load full CSS -->
  <link rel="preload" href="/assets/css/main.css?v=20260224" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/assets/css/main.css?v=20260224"></noscript>
</head>
```

---

### Task 6: Create Component Library Documentation
**Type:** Task  
**Priority:** P3  
**Effort:** 16 hours  
**Parent:** CSS Architecture Modernization  
**Tags:** documentation, devex

**Description:**  
Build living style guide documenting all reusable components. Expected 50% faster feature development.

**Steps:**
1. Set up style guide page (`styleguide.html`)
2. Document 20+ components (buttons, cards, forms, charts, modals, toasts, badges, empty states)
3. Include HTML examples, CSS class reference, usage guidelines
4. Add dark/light mode toggle for style guide
5. Deploy to `/styleguide.html` on Azure

**Acceptance Criteria:**
- [ ] Style guide page with 20+ components documented
- [ ] Copy-paste HTML examples for each component
- [ ] Dark/light mode examples
- [ ] Linked from main README
- [ ] Team onboarding time reduced by 50%

**Style Guide Structure:**
```
Styleguide
├── Colors (design tokens)
├── Typography (headings, body, code)
├── Buttons (primary, secondary, outline, sizes)
├── Cards (dashboard-card, stat-card, chart-card)
├── Forms (inputs, validation, labels)
├── Charts (wrapper, skeleton, empty)
├── Modals (structure, sizes)
├── Toasts (success, error, warning, info)
└── Empty States (icons, microcopy, CTAs)
```

---

## 📈 Chart.js Research (002) — 10 Implementation Tasks

**Research Document:** `docs/research/chartjs-financial-dashboard-best-practices.md` (23.9 KB)  
**Implementation Effort:** 21 hours total (4 sprints)

### EPIC: Chart.js Enhancements
**Type:** Epic  
**Priority:** P2  
**Description:** Add accessibility, real-time updates, advanced chart types, and export functionality to Chart.js implementation.

**Acceptance Criteria:**
- [ ] WCAG 2.1 AA compliance (ARIA labels, keyboard nav, alt text)
- [ ] Real-time chart updates via Supabase subscriptions
- [ ] 7 chart types (current: 4 → waterfall, heatmap, sankey)
- [ ] Chart export (PNG + CSV downloads)
- [ ] Performance tested with 5+ years of data

---

### Sprint 1: Accessibility (6 hours)

#### Task 7: Add ARIA Labels to All Chart Canvases
**Type:** Task  
**Priority:** P1  
**Effort:** 2 hours  
**Parent:** Chart.js Enhancements  
**Tags:** accessibility, WCAG

**Description:**  
Add descriptive `aria-label` attributes to all 9 chart canvases (Dashboard: 8, Reports: 5).

**Acceptance Criteria:**
- [ ] All 13 canvas elements have `aria-label`
- [ ] Labels describe chart purpose: "Net worth trend over last 12 months"
- [ ] Screen reader testing (NVDA/JAWS)

**Code Example:**
```html
<!-- Dashboard: Net Worth Trend Chart -->
<canvas id="netWorthChart" 
        role="img" 
        aria-label="Net worth trend chart showing monthly values for the last 12 months"></canvas>
```

---

#### Task 8: Create Hidden Fallback Data Tables for Screen Readers
**Type:** Task  
**Priority:** P1  
**Effort:** 2 hours  
**Parent:** Chart.js Enhancements  
**Tags:** accessibility, WCAG

**Description:**  
Add hidden `<table>` elements with chart data for screen readers.

**Acceptance Criteria:**
- [ ] One `<table>` per chart with `.sr-only` class
- [ ] Tables include headers, data rows with proper `<th>` scope
- [ ] Screen reader announces table summary

**Code Example:**
```html
<table class="sr-only" aria-label="Net worth data table">
  <caption>Monthly net worth values for 2026</caption>
  <thead>
    <tr><th scope="col">Month</th><th scope="col">Net Worth</th></tr>
  </thead>
  <tbody>
    <tr><td>Jan 2026</td><td>$125,430.50</td></tr>
    <!-- ... -->
  </tbody>
</table>
```

---

#### Task 9: Implement Keyboard Navigation for Charts
**Type:** Task  
**Priority:** P1  
**Effort:** 2 hours  
**Parent:** Chart.js Enhancements  
**Tags:** accessibility, WCAG

**Description:**  
Add arrow key navigation to cycle through data points.

**Acceptance Criteria:**
- [ ] Left/Right arrows cycle through chart data points
- [ ] Up/Down arrows switch between datasets (multi-line charts)
- [ ] Tooltip follows keyboard focus
- [ ] Focus ring visible on chart canvas

**Code Example:**
```javascript
canvas.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') {
    currentIndex = (currentIndex + 1) % chart.data.labels.length;
    showTooltipAtIndex(chart, currentIndex);
  }
});
```

---

### Sprint 2: Real-Time Updates (3 hours)

#### Task 10: Connect Supabase Subscriptions to Charts
**Type:** Task  
**Priority:** P2  
**Effort:** 3 hours  
**Parent:** Chart.js Enhancements  
**Tags:** feature, real-time

**Description:**  
Subscribe to Supabase realtime events, update charts when data changes.

**Acceptance Criteria:**
- [ ] Charts update automatically when bills/debts/income change
- [ ] Smooth animation on data update
- [ ] No full page reload required

**Code Example:**
```javascript
supabase
  .channel('bills-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'bills' }, payload => {
    updateDashboardCharts();
  })
  .subscribe();
```

---

### Sprint 3: Export & Advanced Types (8 hours)

#### Task 11: Add PNG/CSV Export Buttons
**Type:** Task  
**Priority:** P2  
**Effort:** 2 hours  
**Parent:** Chart.js Enhancements  
**Tags:** feature, export

**Description:**  
Add "Download as PNG" and "Download as CSV" buttons to all charts.

**Acceptance Criteria:**
- [ ] Export buttons on all 13 charts
- [ ] PNG: Downloads chart canvas as image
- [ ] CSV: Downloads underlying data with headers

---

#### Task 12: Waterfall Chart for Cash Flow Analysis
**Type:** Task  
**Priority:** P2  
**Effort:** 2 hours  
**Parent:** Chart.js Enhancements  
**Tags:** feature, chart-type

**Description:**  
Add waterfall chart showing income → expenses → net cash flow.

**Acceptance Criteria:**
- [ ] Waterfall chart on Operations page
- [ ] Green bars (income), red bars (expenses), blue bar (net)
- [ ] Tooltip shows cumulative vs individual values

---

#### Task 13: Spending Heatmap (Day/Hour Visualization)
**Type:** Task  
**Priority:** P3  
**Effort:** 2 hours  
**Parent:** Chart.js Enhancements  
**Tags:** feature, chart-type

**Description:**  
Add heatmap showing when user spends most (day of week × hour of day).

**Acceptance Criteria:**
- [ ] Heatmap on Reports page
- [ ] X-axis: Hour (0-23), Y-axis: Day (Mon-Sun)
- [ ] Color intensity = spending amount

---

#### Task 14: Budget Flow Sankey Diagram
**Type:** Task  
**Priority:** P3  
**Effort:** 2 hours  
**Parent:** Chart.js Enhancements  
**Tags:** feature, chart-type

**Description:**  
Add sankey diagram showing income → budget categories → spending.

**Acceptance Criteria:**
- [ ] Sankey on Budget page
- [ ] Flow width = dollar amount
- [ ] Interactive hover states

---

### Sprint 4: Annotations & Polish (4 hours)

#### Task 15: Goal Lines, Event Markers, Budget Range Shading
**Type:** Task  
**Priority:** P3  
**Effort:** 3 hours  
**Parent:** Chart.js Enhancements  
**Tags:** feature, annotations

**Description:**  
Add Chart.js annotation plugin for goal lines, event markers, budget ranges.

**Acceptance Criteria:**
- [ ] Goal line on net worth chart (user-defined target)
- [ ] Event markers (major purchases, windfalls)
- [ ] Budget range shading (green zone = on budget)

---

#### Task 16: Performance Testing with 5+ Years of Data
**Type:** Task  
**Priority:** P3  
**Effort:** 1 hour  
**Parent:** Chart.js Enhancements  
**Tags:** testing, performance

**Description:**  
Test chart rendering with 1,825+ data points (5 years daily).

**Acceptance Criteria:**
- [ ] Charts render < 500ms with 1,825 points
- [ ] Decimation algorithm tested (LTTB, min-max)
- [ ] Mobile performance verified (< 1s render)

---

## 📋 Summary

**Total Implementation Effort:** 63 hours (16 tasks)
- CSS Architecture: 42 hours (6 tasks)
- Chart.js Enhancements: 21 hours (10 tasks)

**Expected ROI:**
- 35% CSS bundle size reduction (230 KB → 150 KB)
- 33% faster First Contentful Paint (~1.2s → <0.8s)
- WCAG 2.1 AA compliance (accessibility lawsuit protection)
- 50% faster feature development (component library)
- Real-time dashboard with live data updates
- Advanced financial insights (7 chart types vs 4)

**Next Steps:**
1. Import these work items to Azure DevOps manually
2. Prioritize Sprint 1 tasks (CSS documentation + Chart accessibility)
3. Assign to Builder agent for implementation
4. QA verification after each sprint

---

**Document Created By:** Capital (Researcher)  
**Session:** sprint-research (cron f6500924-c6f4-4377-b5e5-05720086ce0b)  
**Date:** February 24, 2026 4:52 AM
