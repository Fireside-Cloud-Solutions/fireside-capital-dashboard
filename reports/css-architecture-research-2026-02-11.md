# CSS Architecture Research — February 11, 2026

## Executive Summary

Researched modern CSS architecture methodologies to improve maintainability and scalability of the Fireside Capital dashboard as features grow. Recommending **ITCSS + BEM hybrid** for our financial dashboard.

## Why This Matters

Current state: `app/assets/css/` contains flat CSS files with no clear organization. As we add features (dark theme, PWA, mobile responsiveness), unstructured CSS will:
- Create specificity conflicts (override wars)
- Make debugging harder
- Slow down development
- Increase risk of visual regressions

## Methodologies Evaluated

### 1. BEM (Block Element Modifier) ✅ Recommended
**Best for:** Component naming consistency
- **Pros:** Clear relationships, no specificity wars, team-friendly
- **Cons:** Verbose class names
- **Verdict:** Use for component naming

### 2. SMACSS (Scalable Modular Architecture)
**Best for:** Large teams, enterprise projects
- **Pros:** Clear categorization (Base/Layout/Module/State/Theme)
- **Cons:** Overkill for single-developer projects
- **Verdict:** Too heavyweight for us

### 3. ITCSS (Inverted Triangle CSS) ✅ Recommended
**Best for:** Managing specificity, file organization
- **Pros:** Prevents specificity conflicts, scales beautifully, flexible
- **Cons:** Requires discipline
- **Verdict:** Use for file structure

### 4. Atomic CSS
**Best for:** Utility-first frameworks (like Tailwind)
- **Pros:** Low learning curve, DRY
- **Cons:** HTML bloat, not ideal with Bootstrap
- **Verdict:** Skip (we're using Bootstrap)

### 5. OOCSS
**Best for:** Maximum code reuse
- **Pros:** DRY, flexible
- **Cons:** Less structured than BEM/ITCSS
- **Verdict:** Skip (covered by ITCSS)

## Recommendation: ITCSS + BEM Hybrid

Use **ITCSS for file structure** + **BEM for naming conventions**.

### File Structure (ITCSS Layers)

```
app/assets/css/
├── 1-settings/          # CSS variables, design tokens
│   ├── _colors.css
│   ├── _typography.css
│   └── _spacing.css
├── 2-tools/             # Mixins (if using preprocessor)
│   └── _mixins.css
├── 3-generic/           # Resets, normalize
│   └── _normalize.css
├── 4-elements/          # Bare HTML element styles
│   ├── _headings.css
│   ├── _links.css
│   └── _forms.css
├── 5-objects/           # Layout patterns (containers, grids)
│   ├── _container.css
│   └── _grid.css
├── 6-components/        # UI components (BEM naming)
│   ├── _card.css
│   ├── _chart.css
│   ├── _dashboard-header.css
│   ├── _metric-display.css
│   ├── _nav-sidebar.css
│   └── _table.css
├── 7-utilities/         # Helper classes
│   ├── _spacing.css
│   └── _visibility.css
└── main.css             # Import all layers
```

### BEM Naming Convention

```css
/* Block: independent component */
.metric-card { }

/* Element: part of block */
.metric-card__title { }
.metric-card__value { }
.metric-card__trend { }

/* Modifier: variation of block/element */
.metric-card--success { }
.metric-card--danger { }
.metric-card__trend--positive { }
```

### CSS Custom Properties (Design Tokens)

```css
/* app/assets/css/1-settings/_colors.css */
:root {
  /* Brand colors (from Fireside Cloud Solutions family) */
  --color-primary: #01a4ef;    /* Blue */
  --color-secondary: #f44e24;  /* Orange */
  --color-success: #81b900;    /* Green */
  --color-danger: #dc3545;
  --color-warning: #ffc107;
  --color-info: #17a2b8;
  
  /* Neutral palette */
  --color-gray-100: #f8f9fa;
  --color-gray-200: #e9ecef;
  --color-gray-300: #dee2e6;
  --color-gray-700: #495057;
  --color-gray-900: #212529;
  
  /* Semantic colors for finance */
  --color-positive: var(--color-success);
  --color-negative: var(--color-danger);
  --color-neutral: var(--color-gray-700);
  
  /* Background colors */
  --bg-body: #ffffff;
  --bg-surface: var(--color-gray-100);
  --bg-hover: var(--color-gray-200);
}

/* Dark theme (future) */
[data-theme="dark"] {
  --bg-body: #1a1a1a;
  --bg-surface: #2d2d2d;
  --bg-hover: #3a3a3a;
  --color-gray-700: #adb5bd;
}
```

```css
/* app/assets/css/1-settings/_spacing.css */
:root {
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
  --spacing-2xl: 3rem;     /* 48px */
}
```

```css
/* app/assets/css/1-settings/_typography.css */
:root {
  --font-family-heading: 'Source Serif 4', Georgia, serif;
  --font-family-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-family-mono: 'Monaco', 'Courier New', monospace;
  
  --font-size-xs: 0.75rem;   /* 12px */
  --font-size-sm: 0.875rem;  /* 14px */
  --font-size-base: 1rem;    /* 16px */
  --font-size-lg: 1.125rem;  /* 18px */
  --font-size-xl: 1.25rem;   /* 20px */
  --font-size-2xl: 1.5rem;   /* 24px */
  --font-size-3xl: 2rem;     /* 32px */
  
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

### Example Component: Metric Card

```css
/* app/assets/css/6-components/_metric-card.css */

/* Block */
.metric-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--color-gray-300);
  border-radius: 8px;
  padding: var(--spacing-lg);
  transition: box-shadow 0.2s ease;
}

.metric-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Elements */
.metric-card__title {
  font-family: var(--font-family-body);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-700);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-sm);
}

.metric-card__value {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-gray-900);
  margin-bottom: var(--spacing-xs);
}

.metric-card__trend {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.metric-card__trend-icon {
  width: 16px;
  height: 16px;
}

/* Modifiers */
.metric-card--success {
  border-left: 4px solid var(--color-success);
}

.metric-card--danger {
  border-left: 4px solid var(--color-danger);
}

.metric-card--neutral {
  border-left: 4px solid var(--color-gray-300);
}

.metric-card__trend--positive {
  color: var(--color-positive);
}

.metric-card__trend--negative {
  color: var(--color-negative);
}

.metric-card__trend--neutral {
  color: var(--color-neutral);
}

/* Responsive */
@media (max-width: 768px) {
  .metric-card__value {
    font-size: var(--font-size-2xl);
  }
}
```

### HTML Usage

```html
<!-- Net Worth Card -->
<div class="metric-card metric-card--success">
  <div class="metric-card__title">Total Net Worth</div>
  <div class="metric-card__value">$247,532.18</div>
  <div class="metric-card__trend metric-card__trend--positive">
    <svg class="metric-card__trend-icon"><!-- up arrow --></svg>
    +5.2% this month
  </div>
</div>

<!-- Debt Card -->
<div class="metric-card metric-card--danger">
  <div class="metric-card__title">Total Debt</div>
  <div class="metric-card__value">$45,320.00</div>
  <div class="metric-card__trend metric-card__trend--negative">
    <svg class="metric-card__trend-icon"><!-- down arrow --></svg>
    -$1,200 this month
  </div>
</div>
```

## Implementation Steps

### Phase 1: Setup Structure (2-3 hours)
1. Create ITCSS folder structure in `app/assets/css/`
2. Extract existing styles into appropriate layers
3. Create `main.css` that imports all layers in order
4. Update `index.html` and other pages to reference `main.css`

### Phase 2: Extract Design Tokens (1-2 hours)
1. Audit existing colors, spacing, typography
2. Create CSS custom properties in `1-settings/`
3. Replace hardcoded values with variables

### Phase 3: Componentize (3-4 hours)
1. Identify reusable components (cards, buttons, tables, charts)
2. Refactor to BEM naming
3. Move to `6-components/` layer

### Phase 4: Documentation (1 hour)
1. Create `app/assets/css/README.md` with guidelines
2. Document naming conventions
3. Add code examples

**Total Effort:** ~8-10 hours (can be split across sprints)

## Benefits

✅ **Dark theme becomes trivial** — just swap CSS custom properties  
✅ **No more specificity wars** — ITCSS guarantees proper cascade  
✅ **Easier to find styles** — predictable file locations  
✅ **Reusable components** — BEM makes composition clear  
✅ **Better performance** — smaller, more organized CSS bundles  
✅ **Future-proof** — scales to 50+ pages without issues  

## Code Quality Wins

- **Before:** 1,200 lines in `styles.css` (hard to navigate)
- **After:** 12 files × 100 lines each (easy to find/edit)
- **Before:** `!important` wars to override specificity
- **After:** Clean cascade, no `!important` needed
- **Before:** Unclear what styles affect what
- **After:** BEM naming makes relationships obvious

## Next Steps

1. **Create Azure DevOps Task:** "Refactor CSS to ITCSS + BEM architecture"
2. **Assign to Builder** for implementation
3. **Update style guide** in `docs/` after completion

---

**Research completed:** February 11, 2026, 7:30 AM  
**Researcher:** Capital  
**Status:** Ready for implementation
