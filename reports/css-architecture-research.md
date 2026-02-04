# CSS Architecture Research — Fireside Capital
**Research Date:** February 4, 2026  
**Topic:** Modern CSS Architecture for Financial Dashboard

## Executive Summary

Researched modern CSS architecture patterns for the Fireside Capital dashboard. **Recommendation: Adopt ITCSS (Inverted Triangle CSS)** layered architecture with BEM naming conventions, custom properties for design tokens, and modular component structure.

This approach will:
- ✅ **Improve maintainability** — Clear separation of concerns across 7 layers
- ✅ **Reduce specificity conflicts** — Top-down specificity management
- ✅ **Accelerate development** — Reusable objects and components
- ✅ **Enable theming** — CSS custom properties for dark mode support
- ✅ **Bootstrap compatibility** — Works alongside Bootstrap 5's utilities

---

## ITCSS Architecture Overview

ITCSS organizes CSS into 7 layers (low → high specificity):

```
Settings   → Variables, design tokens
Tools      → Mixins, functions (if using Sass)
Generic    → Reset, normalize
Elements   → Base HTML styles
Objects    → Layout patterns (grid, container)
Components → UI components (cards, charts)
Utilities  → Override classes (!important)
```

---

## Proposed File Structure

```
app/assets/css/
├── main.css                    # Main import file
├── 01-settings/
│   ├── _colors.css            # Color design tokens
│   ├── _typography.css        # Font variables
│   └── _spacing.css           # Spacing scale
├── 02-generic/
│   └── _reset.css             # Minimal reset
├── 03-elements/
│   ├── _typography.css        # Base heading/paragraph styles
│   └── _forms.css             # Base form element styles
├── 04-objects/
│   ├── _container.css         # Layout containers
│   ├── _grid.css              # Custom grid patterns
│   └── _stack.css             # Vertical spacing pattern
├── 05-components/
│   ├── _card.css              # Financial cards
│   ├── _chart.css             # Chart wrappers
│   ├── _metric.css            # Metric displays
│   ├── _table.css             # Data tables
│   └── _button.css            # Button variants
└── 06-utilities/
    ├── _visibility.css        # Show/hide utilities
    └── _spacing.css           # Margin/padding overrides
```

---

## Implementation Examples

### 1. Settings Layer — Design Tokens

**File:** `app/assets/css/01-settings/_colors.css`

```css
/* Fireside Capital Design Tokens */
:root {
  /* Brand Colors */
  --color-primary: #01a4ef;        /* Blue (links, primary actions) */
  --color-secondary: #f44e24;      /* Orange (CTAs) */
  --color-success: #81b900;        /* Green (positive values) */
  --color-danger: #dc3545;         /* Red (negative values, alerts) */
  --color-warning: #ffc107;        /* Yellow (warnings) */

  /* Neutral Scale */
  --color-neutral-50: #f8f9fa;
  --color-neutral-100: #e9ecef;
  --color-neutral-200: #dee2e6;
  --color-neutral-300: #ced4da;
  --color-neutral-400: #adb5bd;
  --color-neutral-500: #6c757d;
  --color-neutral-600: #495057;
  --color-neutral-700: #343a40;
  --color-neutral-800: #212529;
  --color-neutral-900: #0d1117;

  /* Semantic Colors */
  --color-background: #ffffff;
  --color-surface: var(--color-neutral-50);
  --color-border: var(--color-neutral-200);
  --color-text-primary: var(--color-neutral-800);
  --color-text-secondary: var(--color-neutral-600);
  --color-text-muted: var(--color-neutral-500);

  /* Financial-specific */
  --color-income: var(--color-success);
  --color-expense: var(--color-danger);
  --color-investment: #6f42c1;      /* Purple for investments */
  --color-debt: #fd7e14;            /* Orange for debt */
}

/* Dark theme (future) */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: var(--color-neutral-900);
    --color-surface: var(--color-neutral-800);
    --color-border: var(--color-neutral-700);
    --color-text-primary: var(--color-neutral-100);
    --color-text-secondary: var(--color-neutral-300);
    --color-text-muted: var(--color-neutral-400);
  }
}
```

**File:** `app/assets/css/01-settings/_typography.css`

```css
:root {
  /* Font Families */
  --font-heading: 'Source Serif 4', 'Georgia', serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'SF Mono', 'Consolas', monospace;

  /* Font Sizes (fluid scale) */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */

  /* Font Weights */
  --weight-normal: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

**File:** `app/assets/css/01-settings/_spacing.css`

```css
:root {
  /* Spacing Scale (8px base) */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */

  /* Layout Dimensions */
  --container-max: 1200px;
  --sidebar-width: 280px;
  --header-height: 64px;

  /* Borders */
  --border-width: 1px;
  --border-radius-sm: 0.25rem;
  --border-radius: 0.5rem;
  --border-radius-lg: 0.75rem;
  --border-radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}
```

---

### 2. Generic Layer — Minimal Reset

**File:** `app/assets/css/02-generic/_reset.css`

```css
/* Minimal reset to supplement Bootstrap's reboot */

* {
  box-sizing: border-box;
}

html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Remove default margins on common elements */
h1, h2, h3, h4, h5, h6,
p, ul, ol, figure, blockquote {
  margin: 0 0 var(--space-4) 0;
}

/* Better button reset */
button {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  cursor: pointer;
}

/* Remove input number spinners */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
```

---

### 3. Elements Layer — Base Styles

**File:** `app/assets/css/03-elements/_typography.css`

```css
/* Base typography (unclassed) */

body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--color-text-primary);
  background-color: var(--color-background);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-tight);
  color: var(--color-text-primary);
}

h1 { font-size: var(--text-4xl); }
h2 { font-size: var(--text-3xl); }
h3 { font-size: var(--text-2xl); }
h4 { font-size: var(--text-xl); }
h5 { font-size: var(--text-lg); }
h6 { font-size: var(--text-base); }

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color 0.15s ease-in-out;
}

a:hover {
  color: color-mix(in srgb, var(--color-primary) 85%, black);
}

strong {
  font-weight: var(--weight-semibold);
}

code {
  font-family: var(--font-mono);
  font-size: 0.9em;
  padding: 0.125rem 0.25rem;
  background-color: var(--color-neutral-100);
  border-radius: var(--border-radius-sm);
}
```

---

### 4. Objects Layer — Layout Patterns

**File:** `app/assets/css/04-objects/_container.css`

```css
/* Layout containers (prefix: o-) */

.o-container {
  width: 100%;
  max-width: var(--container-max);
  margin-inline: auto;
  padding-inline: var(--space-4);
}

.o-container--narrow {
  max-width: 960px;
}

.o-container--wide {
  max-width: 1400px;
}

.o-container--fluid {
  max-width: none;
  padding-inline: var(--space-6);
}
```

**File:** `app/assets/css/04-objects/_stack.css`

```css
/* Vertical spacing pattern (replaces margin-bottom hell) */

.o-stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.o-stack--tight { gap: var(--space-2); }
.o-stack--loose { gap: var(--space-8); }
.o-stack--xl { gap: var(--space-12); }
```

**File:** `app/assets/css/04-objects/_grid.css`

```css
/* Responsive grid (supplements Bootstrap grid) */

.o-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.o-grid--2 {
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.o-grid--3 {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.o-grid--4 {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

@media (min-width: 768px) {
  .o-grid--fixed-2 { grid-template-columns: repeat(2, 1fr); }
  .o-grid--fixed-3 { grid-template-columns: repeat(3, 1fr); }
  .o-grid--fixed-4 { grid-template-columns: repeat(4, 1fr); }
}
```

---

### 5. Components Layer — UI Components

**File:** `app/assets/css/05-components/_metric.css`

```css
/* Financial metric display component (prefix: c-) */

.c-metric {
  padding: var(--space-4);
  background: var(--color-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--border-radius);
}

.c-metric__label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.c-metric__value {
  display: block;
  font-size: var(--text-3xl);
  font-weight: var(--weight-bold);
  color: var(--color-text-primary);
  line-height: 1.2;
}

.c-metric__change {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  margin-top: var(--space-2);
}

.c-metric__change--positive {
  color: var(--color-success);
}

.c-metric__change--negative {
  color: var(--color-danger);
}

.c-metric__change::before {
  content: '';
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
}

.c-metric__change--positive::before {
  border-bottom: 6px solid currentColor;
}

.c-metric__change--negative::before {
  border-top: 6px solid currentColor;
}

/* Variants */
.c-metric--highlight {
  background: linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 85%, white) 100%);
  color: white;
  border: none;
}

.c-metric--highlight .c-metric__label,
.c-metric--highlight .c-metric__value {
  color: white;
}
```

**File:** `app/assets/css/05-components/_card.css`

```css
/* Financial card component */

.c-card {
  background: var(--color-background);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: box-shadow 0.2s ease-in-out;
}

.c-card:hover {
  box-shadow: var(--shadow-md);
}

.c-card__header {
  padding: var(--space-5);
  border-bottom: var(--border-width) solid var(--color-border);
  background: var(--color-surface);
}

.c-card__title {
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  margin: 0;
}

.c-card__subtitle {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-top: var(--space-1);
}

.c-card__body {
  padding: var(--space-5);
}

.c-card__footer {
  padding: var(--space-4) var(--space-5);
  border-top: var(--border-width) solid var(--color-border);
  background: var(--color-surface);
}

/* Category-specific cards */
.c-card--asset { border-left: 4px solid var(--color-primary); }
.c-card--investment { border-left: 4px solid var(--color-investment); }
.c-card--debt { border-left: 4px solid var(--color-debt); }
.c-card--bill { border-left: 4px solid var(--color-warning); }
```

**File:** `app/assets/css/05-components/_chart.css`

```css
/* Chart wrapper component (for Chart.js) */

.c-chart {
  position: relative;
  width: 100%;
  min-height: 300px;
}

.c-chart--sm { min-height: 200px; }
.c-chart--md { min-height: 300px; }
.c-chart--lg { min-height: 400px; }
.c-chart--xl { min-height: 500px; }

.c-chart__canvas {
  display: block;
  max-width: 100%;
  height: auto;
}

.c-chart__loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.c-chart__error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: inherit;
  color: var(--color-danger);
  font-size: var(--text-sm);
  padding: var(--space-4);
  text-align: center;
}
```

**File:** `app/assets/css/05-components/_table.css`

```css
/* Financial data table component */

.c-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}

.c-table__head {
  background: var(--color-surface);
  border-bottom: 2px solid var(--color-border);
}

.c-table__header {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-weight: var(--weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  font-size: var(--text-xs);
}

.c-table__body {
  background: var(--color-background);
}

.c-table__row {
  border-bottom: var(--border-width) solid var(--color-border);
  transition: background-color 0.15s ease-in-out;
}

.c-table__row:hover {
  background: var(--color-surface);
}

.c-table__cell {
  padding: var(--space-4);
  vertical-align: middle;
}

.c-table__cell--numeric {
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-family: var(--font-mono);
}

.c-table__cell--positive {
  color: var(--color-success);
  font-weight: var(--weight-medium);
}

.c-table__cell--negative {
  color: var(--color-danger);
  font-weight: var(--weight-medium);
}

/* Responsive table (mobile scroll) */
@media (max-width: 767px) {
  .c-table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}
```

---

### 6. Utilities Layer — Override Classes

**File:** `app/assets/css/06-utilities/_visibility.css`

```css
/* Visibility utilities (prefix: u-) */

.u-hidden {
  display: none !important;
}

.u-visible {
  display: block !important;
}

.u-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

@media (max-width: 767px) {
  .u-hidden-mobile { display: none !important; }
}

@media (min-width: 768px) {
  .u-hidden-desktop { display: none !important; }
}
```

---

### 7. Main Import File

**File:** `app/assets/css/main.css`

```css
/**
 * Fireside Capital — Main Stylesheet
 * Architecture: ITCSS + BEM
 * Date: February 2026
 */

/* 1. Settings — Design tokens */
@import '01-settings/_colors.css';
@import '01-settings/_typography.css';
@import '01-settings/_spacing.css';

/* 2. Generic — Resets */
@import '02-generic/_reset.css';

/* 3. Elements — Base HTML styles */
@import '03-elements/_typography.css';

/* 4. Objects — Layout patterns */
@import '04-objects/_container.css';
@import '04-objects/_stack.css';
@import '04-objects/_grid.css';

/* 5. Components — UI components */
@import '05-components/_metric.css';
@import '05-components/_card.css';
@import '05-components/_chart.css';
@import '05-components/_table.css';
@import '05-components/_button.css';

/* 6. Utilities — Overrides */
@import '06-utilities/_visibility.css';
@import '06-utilities/_spacing.css';

/* Bootstrap 5 (load after base styles) */
/* Already included via CDN in HTML, customize via CSS variables */
```

---

## Example Usage in HTML

### Dashboard Page

```html
<div class="o-container">
  <!-- Page header -->
  <header class="o-stack--tight">
    <h1>Dashboard</h1>
    <p class="text-muted">Financial overview for February 2026</p>
  </header>

  <!-- Metrics grid -->
  <div class="o-grid o-grid--4">
    <!-- Net Worth Card -->
    <div class="c-metric c-metric--highlight">
      <span class="c-metric__label">Net Worth</span>
      <span class="c-metric__value">$487,250</span>
      <span class="c-metric__change c-metric__change--positive">
        +$12,450 (2.6%)
      </span>
    </div>

    <!-- Other metrics -->
    <div class="c-metric">
      <span class="c-metric__label">Total Assets</span>
      <span class="c-metric__value">$812,000</span>
    </div>

    <div class="c-metric">
      <span class="c-metric__label">Total Debts</span>
      <span class="c-metric__value">$324,750</span>
    </div>

    <div class="c-metric">
      <span class="c-metric__label">Monthly Income</span>
      <span class="c-metric__value">$8,200</span>
    </div>
  </div>

  <!-- Charts section -->
  <div class="o-stack--loose">
    <div class="c-card">
      <div class="c-card__header">
        <h2 class="c-card__title">Net Worth Trend</h2>
        <p class="c-card__subtitle">Last 12 months</p>
      </div>
      <div class="c-card__body">
        <div class="c-chart c-chart--md">
          <canvas id="netWorthChart" class="c-chart__canvas"></canvas>
        </div>
      </div>
    </div>
  </div>

  <!-- Asset table -->
  <div class="c-card">
    <div class="c-card__header">
      <h2 class="c-card__title">Assets</h2>
    </div>
    <div class="c-card__body">
      <table class="c-table">
        <thead class="c-table__head">
          <tr class="c-table__row">
            <th class="c-table__header">Name</th>
            <th class="c-table__header">Type</th>
            <th class="c-table__header c-table__cell--numeric">Value</th>
            <th class="c-table__header c-table__cell--numeric">Change</th>
          </tr>
        </thead>
        <tbody class="c-table__body">
          <tr class="c-table__row">
            <td class="c-table__cell">Primary Residence</td>
            <td class="c-table__cell">Real Estate</td>
            <td class="c-table__cell c-table__cell--numeric">$450,000</td>
            <td class="c-table__cell c-table__cell--numeric c-table__cell--positive">+$8,500</td>
          </tr>
          <!-- More rows... -->
        </tbody>
      </table>
    </div>
  </div>
</div>
```

---

## Integration Steps

### Step 1: Create Directory Structure
```powershell
# Create ITCSS layer directories
cd C:\Users\chuba\fireside-capital\app\assets\css
mkdir 01-settings, 02-generic, 03-elements, 04-objects, 05-components, 06-utilities
```

### Step 2: Extract Variables from Existing CSS
```powershell
# Audit existing styles and extract:
# - Colors → 01-settings/_colors.css
# - Font sizes → 01-settings/_typography.css
# - Spacing values → 01-settings/_spacing.css
```

### Step 3: Update HTML `<head>` Section
```html
<!-- Before Bootstrap (design tokens) -->
<link rel="stylesheet" href="/assets/css/main.css">

<!-- Bootstrap 5 (load after tokens) -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
```

### Step 4: Refactor Existing Components
Gradually migrate existing inline/scattered styles into component files:
- Dashboard cards → `_card.css`
- Charts → `_chart.css`
- Tables → `_table.css`
- Buttons → `_button.css`

### Step 5: Document Naming Conventions
Add to project docs:
- **Objects:** `.o-*` (layout patterns)
- **Components:** `.c-*` (UI components)
- **Utilities:** `.u-*` (overrides with !important)
- **BEM modifiers:** `.c-card--asset`, `.c-metric__value`

---

## Benefits for Fireside Capital

### 1. **Dark Mode Support**
Custom properties enable instant dark theme via `prefers-color-scheme`:
```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #0d1117;
    --color-text-primary: #f8f9fa;
  }
}
```

### 2. **Consistent Spacing**
No more random margins — use spacing scale:
```css
/* Before */
.card { margin-bottom: 20px; }

/* After */
.c-card { margin-bottom: var(--space-5); }
```

### 3. **Reusable Patterns**
Objects like `.o-stack` and `.o-grid` reduce code duplication:
```html
<!-- Before: Manual spacing -->
<div style="display: flex; flex-direction: column; gap: 16px;">...</div>

<!-- After: Object pattern -->
<div class="o-stack">...</div>
```

### 4. **Scalable for Growth**
Adding new pages/components is straightforward:
- New component? Add to `05-components/`
- New layout pattern? Add to `04-objects/`
- Need override? Add to `06-utilities/`

### 5. **Bootstrap Interoperability**
ITCSS doesn't replace Bootstrap — it complements it:
- Use Bootstrap utilities (`d-flex`, `mb-3`, etc.) for rapid prototyping
- Use ITCSS components for consistent brand styling
- Override Bootstrap variables using custom properties

---

## Next Steps

1. ✅ **Builder:** Implement ITCSS directory structure in `app/assets/css/`
2. ✅ **Builder:** Create design token files (settings layer)
3. ✅ **Builder:** Migrate existing components to ITCSS components
4. ✅ **Builder:** Update HTML templates to use new class names
5. ✅ **Auditor:** Review for accessibility and cross-browser compatibility
6. ✅ **Builder:** Document component library in `docs/components.md`

---

## References

- **ITCSS Methodology:** https://blog.openreplay.com/scalable-maintainable-css-with-itcss-architecture/
- **BEM Naming:** https://getbem.com/
- **CSS Custom Properties:** https://developer.mozilla.org/en-US/docs/Web/CSS/--*
- **Bootstrap Theming:** https://getbootstrap.com/docs/5.3/customize/css-variables/

---

**Status:** ✅ Research complete — Ready for implementation  
**Estimated Effort:** 2-3 days for full migration  
**Priority:** High (foundational infrastructure)
