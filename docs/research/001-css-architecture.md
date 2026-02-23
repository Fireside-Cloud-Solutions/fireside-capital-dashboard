# CSS Architecture Research & Recommendations
**Research ID:** 001  
**Topic:** CSS Architecture Modernization  
**Date:** February 23, 2026  
**Status:** Complete  
**Priority:** High  

---

## Executive Summary

Fireside Capital dashboard currently has a **solid CSS foundation** with design tokens, component organization, and dark/light theme support. However, there are opportunities to modernize the architecture using CUBE CSS methodology, improve maintainability, and enhance performance.

### Current State
✅ **Strengths:**
- Comprehensive design token system (`design-tokens.css`)
- Modular file structure (components, utilities, responsive, etc.)
- Dark/light theme support with CSS variables
- Bootstrap 5 integration
- 8px spacing grid system

⚠️ **Weaknesses:**
- No explicit methodology (not following BEM, ITCSS, or CUBE)
- Some inconsistent naming conventions
- Large `main.css` file (3700+ lines)
- Mixed specificity levels
- Potential for CSS bloat

---

## Recommended Architecture: CUBE CSS

### What is CUBE CSS?
**CUBE** = Composition → Utility → Block → Exception

**Why CUBE for Fireside Capital:**
1. **Works WITH Bootstrap** (not against it)
2. **Embraces CSS cascade** (leverages design tokens effectively)
3. **Progressive enhancement** (mobile-first philosophy)
4. **Simple to learn** (no complex naming like BEM)
5. **Flexible** (allows Bootstrap utilities + custom components)

### CUBE CSS Layers

```
┌─────────────────────────────────────┐
│ 1. DESIGN TOKENS (Foundation)      │ ← Already have this!
│    design-tokens.css                │
├─────────────────────────────────────┤
│ 2. COMPOSITION (Layout patterns)    │ ← Need to extract
│    Stack, Cluster, Grid, etc.       │
├─────────────────────────────────────┤
│ 3. UTILITIES (Single-purpose)       │ ← Bootstrap + custom
│    .text-center, .mt-3, etc.        │
├─────────────────────────────────────┤
│ 4. BLOCKS (Components)              │ ← Already have this!
│    components.css                   │
├─────────────────────────────────────┤
│ 5. EXCEPTIONS (Variants)            │ ← Need to formalize
│    [data-state="loading"]           │
└─────────────────────────────────────┘
```

---

## Action Items

### ✅ Task 1: Create Composition Layer
**Effort:** 2 hours  
**Impact:** High  

Create `app/assets/css/composition.css` with layout primitives:

```css
/* =================================================================
   COMPOSITION — Layout Primitives (CUBE CSS Layer 2)
   ================================================================= */

/* Stack — Vertical rhythm with consistent spacing */
.stack {
  display: flex;
  flex-direction: column;
}

.stack > * + * {
  margin-block-start: var(--space-md); /* Default: 16px */
}

.stack[data-space="sm"] > * + * { margin-block-start: var(--space-sm); }
.stack[data-space="lg"] > * + * { margin-block-start: var(--space-lg); }
.stack[data-space="xl"] > * + * { margin-block-start: var(--space-xl); }

/* Cluster — Horizontal grouping with wrapping */
.cluster {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  align-items: center;
}

.cluster[data-space="sm"] { gap: var(--space-sm); }
.cluster[data-space="lg"] { gap: var(--space-lg); }
.cluster[data-justify="space-between"] { justify-content: space-between; }
.cluster[data-justify="end"] { justify-content: flex-end; }

/* Sidebar — Content with fixed-width sidebar */
.with-sidebar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-lg);
}

.with-sidebar > :first-child {
  flex-basis: 250px;
  flex-grow: 1;
}

.with-sidebar > :last-child {
  flex-basis: 0;
  flex-grow: 999;
  min-inline-size: 66%;
}

/* Grid — Auto-fit responsive grid */
.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr));
  gap: var(--space-lg);
}

.auto-grid[data-min="small"] {
  grid-template-columns: repeat(auto-fit, minmax(min(150px, 100%), 1fr));
}

.auto-grid[data-min="large"] {
  grid-template-columns: repeat(auto-fit, minmax(min(350px, 100%), 1fr));
}

/* Center — Horizontal centering with max-width */
.center {
  box-sizing: content-box;
  margin-inline: auto;
  max-inline-size: var(--container-lg);
  padding-inline: var(--space-md);
}

.center[data-max="sm"] { max-inline-size: var(--container-sm); }
.center[data-max="md"] { max-inline-size: var(--container-md); }
.center[data-max="xl"] { max-inline-size: var(--container-xl); }
```

**Usage Example:**
```html
<!-- Before: Inconsistent spacing -->
<div class="mb-24">
  <h2 class="mb-16">Assets</h2>
  <div class="row">
    <div class="col-md-4">Card 1</div>
    <div class="col-md-4">Card 2</div>
  </div>
</div>

<!-- After: CUBE composition -->
<section class="stack" data-space="lg">
  <h2>Assets</h2>
  <div class="auto-grid" data-min="small">
    <div>Card 1</div>
    <div>Card 2</div>
  </div>
</section>
```

---

### ✅ Task 2: Implement Component Naming Convention
**Effort:** 4 hours  
**Impact:** Medium  

Formalize component naming using **BEMIT** (BEM + ITCSS + Themes):

```
Prefix Guidelines:
- c-  = Component (e.g., .c-card, .c-stat-box)
- o-  = Object/Layout (e.g., .o-container, .o-grid)
- u-  = Utility (e.g., .u-text-center, .u-visually-hidden)
- is- = State (e.g., .is-active, .is-loading)
```

**Current (inconsistent):**
```css
.stat-card { }
.card { }
.metric-card { }
```

**Proposed (BEMIT):**
```css
.c-stat-card { }
.c-stat-card__title { }
.c-stat-card__value { }
.c-stat-card--highlighted { }
.c-stat-card[data-variant="danger"] { } /* Exception */
```

**Migration Strategy:**
1. Create `components-refactor.css` with new naming
2. Update HTML templates incrementally (page by page)
3. Deprecate old classes gradually
4. Document in `STYLE_GUIDE.md`

---

### ✅ Task 3: Split `main.css` into Smaller Modules
**Effort:** 3 hours  
**Impact:** Medium  

`main.css` is 3700+ lines. Break into:

```
app/assets/css/
├── design-tokens.css       (✅ already exists)
├── reset.css               (NEW - normalize + resets)
├── composition.css         (NEW - layout primitives)
├── components/             (NEW directory)
│   ├── c-stat-card.css
│   ├── c-notification.css
│   ├── c-chart-card.css
│   ├── c-data-table.css
│   └── c-empty-state.css
├── utilities.css           (✅ already exists - expand)
├── responsive.css          (✅ already exists)
├── accessibility.css       (✅ already exists)
└── bundle.css              (Entry point - imports all)
```

**`bundle.css` structure:**
```css
/* CUBE CSS Layer Order */
@import './design-tokens.css';    /* Layer 1: Tokens */
@import './reset.css';             /* Normalize */
@import './composition.css';       /* Layer 2: Composition */
@import './utilities.css';         /* Layer 3: Utilities */

/* Components (alphabetical) */
@import './components/c-stat-card.css';
@import './components/c-notification.css';
@import './components/c-chart-card.css';
@import './components/c-data-table.css';
@import './components/c-empty-state.css';

@import './responsive.css';        /* Media queries */
@import './accessibility.css';     /* A11y overrides */
```

---

### ✅ Task 4: Performance Optimization
**Effort:** 2 hours  
**Impact:** High  

**Critical CSS Extraction:**
```html
<!-- index.html -->
<head>
  <!-- Inline critical CSS (above-the-fold) -->
  <style>
    /* Copy from critical.css */
    :root { /* tokens */ }
    body { /* base styles */ }
    .c-stat-card { /* dashboard cards */ }
  </style>
  
  <!-- Defer non-critical CSS -->
  <link rel="preload" href="bundle.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="bundle.css"></noscript>
</head>
```

**CSS Purging (Production):**
```json
// package.json
{
  "scripts": {
    "build:css": "postcss bundle.css -o dist/bundle.min.css",
    "purge:css": "purgecss --css dist/bundle.min.css --content app/**/*.html app/**/*.js --output dist/"
  },
  "devDependencies": {
    "@fullhuman/postcss-purgecss": "^5.0.0",
    "cssnano": "^6.0.0"
  }
}
```

---

### ✅ Task 5: Create CSS Style Guide
**Effort:** 2 hours  
**Impact:** Medium  

Create `docs/CSS_STYLE_GUIDE.md`:

```markdown
# Fireside Capital CSS Style Guide

## Architecture: CUBE CSS

### 1. Design Tokens
Always use CSS variables, never hardcode values:
✅ color: var(--color-primary);
❌ color: #f44e24;

### 2. Composition (Layout)
Use composition classes for layout, not utilities:
✅ <div class="stack" data-space="lg">
❌ <div class="d-flex flex-column" style="gap: 24px">

### 3. Components
Prefix with `c-` and use data attributes for variants:
✅ <div class="c-stat-card" data-variant="danger">
❌ <div class="stat-card stat-card-danger">

### 4. Utilities
Use Bootstrap utilities for one-off adjustments:
✅ <div class="c-stat-card mb-3">
❌ Create .stat-card-margin-bottom class

### 5. Exceptions
Use data attributes or state classes:
✅ .c-stat-card[data-loading="true"] { opacity: 0.5; }
✅ .c-stat-card.is-loading { opacity: 0.5; }
❌ .c-stat-card--loading { opacity: 0.5; }
```

---

## Metrics & Success Criteria

**Before Refactor:**
- Total CSS size: ~450KB (uncompressed)
- Lines of code: ~4000
- Specificity conflicts: Moderate
- Maintainability score: 6/10

**After Refactor (Target):**
- Total CSS size: <200KB (with purge)
- Lines of code: ~2500 (modularized)
- Specificity conflicts: Minimal
- Maintainability score: 9/10

**Performance Targets:**
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Lighthouse Performance: 95+

---

## Migration Timeline

| Week | Task | Owner |
|------|------|-------|
| Week 1 | Create composition.css + style guide | Builder |
| Week 2 | Refactor dashboard.html to CUBE | Builder |
| Week 3 | Split components into modules | Builder |
| Week 4 | Implement CSS purging in build | Builder |

---

## References

- [CUBE CSS Documentation](https://cube.fyi)
- [ITCSS Architecture](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture)
- [BEMIT Naming Convention](https://csswizardry.com/2015/08/bemit-taking-the-bem-naming-convention-a-step-further/)
- [Every Layout (Composition Primitives)](https://every-layout.dev)

---

## Next Steps

1. **Review this document** with the team
2. **Prototype composition.css** on dashboard.html
3. **Measure baseline metrics** (Lighthouse, CSS stats)
4. **Create migration tasks** in Azure DevOps
5. **Document patterns** as they emerge

**Estimated Total Effort:** 13 hours  
**Expected ROI:** 3x (improved maintainability, faster development, better performance)
