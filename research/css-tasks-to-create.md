# CSS Architecture — Implementation Tasks for Azure DevOps
**Created:** February 14, 2026  
**Source:** research/css-architecture-research.md

Copy these tasks into Azure DevOps (org: fireside365, project: Fireside Capital)

---

## Task 1: CSS Token Consistency Audit
**Type:** Task  
**Priority:** 2 (Medium)  
**Tags:** CSS, Performance, Tech Debt  
**Estimated Effort:** 2-3 hours

### Description
Replace hardcoded color/spacing/shadow values with design tokens from `design-tokens.css`.

Current audit shows ~18% of declarations use hardcoded values instead of CSS custom properties.

**Priority Files:**
- `main.css` — 47 instances
- `components.css` — 23 instances  
- `responsive.css` — 12 instances

### Example Fix
```css
/* BEFORE */
.stat-card {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  color: #f0f0f0;
}

/* AFTER */
.stat-card {
  background: var(--color-bg-2);
  border: 1px solid var(--color-border-subtle);
  color: var(--color-text-primary);
}
```

### Acceptance Criteria
- [ ] All hardcoded hex colors replaced with `var(--color-*)` tokens
- [ ] All hardcoded spacing values replaced with `var(--space-*)` tokens
- [ ] All hardcoded shadows replaced with `var(--shadow-*)` tokens
- [ ] Visual regression test passes (no UI changes)

### Reference
`research/css-architecture-research.md` — Section 3: Maintainability Improvements

---

## Task 2: CSS Implement PostCSS + PurgeCSS
**Type:** Task  
**Priority:** 1 (High)  
**Tags:** CSS, Performance, Optimization  
**Estimated Effort:** 4-6 hours

### Description
Set up PostCSS build pipeline with PurgeCSS to remove unused CSS in production builds.

Financial dashboards typically use **<40% of Bootstrap**. 

**Expected Reduction:** 225 KB → 95 KB (58% smaller)

### Implementation Steps
1. Install dependencies:
   ```bash
   npm install --save-dev postcss postcss-cli autoprefixer @fullhuman/postcss-purgecss
   ```

2. Create `postcss.config.js`:
   ```javascript
   module.exports = {
     plugins: [
       require('autoprefixer'),
       require('@fullhuman/postcss-purgecss')({
         content: ['./app/**/*.html', './app/**/*.js'],
         safelist: [/^modal-/, /^dropdown-/, /^btn-/, /^alert-/, /^chart-/],
         defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
       })
     ]
   }
   ```

3. Add build script to `package.json`:
   ```json
   "scripts": {
     "build:css": "postcss app/assets/css/**/*.css --dir app/assets/css/dist"
   }
   ```

### Acceptance Criteria
- [ ] PostCSS pipeline configured with autoprefixer + PurgeCSS
- [ ] Build script in package.json
- [ ] CSS bundle size reduced by >50%
- [ ] All pages render correctly in production build
- [ ] No console errors related to missing CSS classes

### Reference
`research/css-architecture-research.md` — Section 2: Task 2

---

## Task 3: CSS Split main.css into Modules
**Type:** Task  
**Priority:** 1 (High)  
**Tags:** CSS, Performance, Refactoring  
**Estimated Effort:** 5-7 hours

### Description
Split `main.css` (91 KB) into logical modules for better critical CSS extraction.

### Target Structure
```
main.css (91 KB) → SPLIT INTO:
  ├── base.css          ~15 KB  (normalize, typography, colors)
  ├── layout.css        ~20 KB  (grid, containers, sidebar)
  ├── forms.css         ~18 KB  (inputs, buttons, validation)
  ├── navigation.css    ~12 KB  (navbar, sidebar, breadcrumbs)
  └── widgets.css       ~26 KB  (charts, stats, cards)
```

### Loading Strategy
```html
<!-- Critical: above-the-fold only -->
<link rel="stylesheet" href="assets/css/design-tokens.css">
<link rel="stylesheet" href="assets/css/base.css">
<link rel="stylesheet" href="assets/css/layout.css">

<!-- Deferred: below-the-fold -->
<link rel="preload" href="assets/css/forms.css" as="style" onload="this.rel='stylesheet'">
<link rel="preload" href="assets/css/widgets.css" as="style" onload="this.rel='stylesheet'">
```

### Expected Improvement
Reduces render-blocking CSS from **170 KB to ~50 KB**

### Acceptance Criteria
- [ ] main.css split into 5 modules (base, layout, forms, navigation, widgets)
- [ ] Critical CSS loaded synchronously
- [ ] Non-critical CSS loaded with preload
- [ ] All pages render correctly
- [ ] FCP improved by >100ms (measure with Lighthouse)

### Reference
`research/css-architecture-research.md` — Section 2: Task 3

---

## Task 4: CSS Extract and Inline Critical CSS
**Type:** Task  
**Priority:** 1 (High)  
**Tags:** CSS, Performance, FCP  
**Estimated Effort:** 3-4 hours

### Description
Use Critical or Critters to extract above-the-fold CSS and inline in `<head>`. Defer non-critical CSS with preload.

**Expected Improvement:** FCP improves by 150-250ms on 3G, 50-100ms on 4G

### Implementation
1. Install Critical:
   ```bash
   npm install critical --save-dev
   ```

2. Create extraction script:
   ```javascript
   // scripts/extract-critical.js
   const critical = require('critical');

   critical.generate({
     inline: true,
     base: 'app/',
     src: 'index.html',
     target: 'index.html',
     width: 1300,
     height: 900,
     dimensions: [
       { width: 375, height: 667 },   // iPhone
       { width: 1300, height: 900 }   // Desktop
     ]
   });
   ```

3. Add to build process:
   ```json
   "scripts": {
     "build:critical": "node scripts/extract-critical.js"
   }
   ```

### Result
```html
<head>
  <style>
    /* Inline critical CSS here - design tokens, layout skeleton, hero */
    :root { /* All design tokens */ }
    body { background: var(--color-bg-1); }
    /* ... first screen only */
  </style>
  
  <link rel="preload" href="assets/css/bundle.css" as="style" onload="this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="assets/css/bundle.css"></noscript>
</head>
```

### Acceptance Criteria
- [ ] Critical CSS extraction script created
- [ ] Above-the-fold CSS inlined in <head>
- [ ] Non-critical CSS deferred with preload
- [ ] FCP improved by >100ms (Lighthouse)
- [ ] All pages render correctly without FOUC

### Reference
`research/css-architecture-research.md` — Section 2: Task 1

---

## Task 5: CSS Create Custom Bootstrap Build
**Type:** Task  
**Priority:** 2 (Medium)  
**Tags:** CSS, Performance, Bootstrap  
**Estimated Effort:** 3-4 hours

### Description
Replace full Bootstrap CDN (190 KB) with custom SCSS build containing only used components.

**Used Components:**
✅ Grid, utilities, cards, buttons, forms, modals, dropdowns, alerts

**NOT Used:**
❌ Accordion, carousel, offcanvas, progress, spinners

**Expected Reduction:** 190 KB → 85 KB (55% smaller)

### Implementation
1. Install Bootstrap:
   ```bash
   npm install bootstrap@5.3.3 --save
   ```

2. Create custom build:
   ```scss
   // custom-bootstrap.scss
   @import "bootstrap/scss/functions";
   @import "bootstrap/scss/variables";
   @import "bootstrap/scss/mixins";

   // Layout & components
   @import "bootstrap/scss/root";
   @import "bootstrap/scss/reboot";
   @import "bootstrap/scss/type";
   @import "bootstrap/scss/containers";
   @import "bootstrap/scss/grid";

   // Components (only what we use)
   @import "bootstrap/scss/buttons";
   @import "bootstrap/scss/forms";
   @import "bootstrap/scss/card";
   @import "bootstrap/scss/modal";
   @import "bootstrap/scss/dropdown";
   @import "bootstrap/scss/alert";

   // Utilities
   @import "bootstrap/scss/utilities";
   @import "bootstrap/scss/utilities/api";
   ```

3. Build:
   ```bash
   sass custom-bootstrap.scss:bootstrap-custom.min.css --style=compressed
   ```

### Acceptance Criteria
- [ ] Custom Bootstrap SCSS build created
- [ ] Build process documented in package.json
- [ ] Bootstrap bundle size reduced by >50%
- [ ] All Bootstrap components render correctly
- [ ] No console errors or missing styles

### Reference
`research/css-architecture-research.md` — Section 5: Bootstrap 5 Integration

---

## Summary
- **Total Tasks:** 5
- **Total Effort:** 17-24 hours (~3-4 days)
- **Expected Performance Gain:**
  - FCP: 1.8s → 1.4s (22% faster)
  - CSS size: 225 KB → 95 KB (58% smaller)
  - LCP: 2.4s → 2.0s (17% faster)

## Recommended Order
1. **Task 3** — Split main.css (enables Tasks 2 & 4)
2. **Task 2** — PostCSS + PurgeCSS (biggest quick win)
3. **Task 4** — Critical CSS extraction (FCP improvement)
4. **Task 1** — Token consistency (maintainability)
5. **Task 5** — Custom Bootstrap (nice-to-have)
