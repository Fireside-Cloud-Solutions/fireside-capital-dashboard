# CSS Architecture Research & Recommendations
**Sprint Research** | February 4, 2026  
**Status:** Complete ✅  
**Impact:** High — Foundation for maintainable growth

---

## Executive Summary

The Fireside Capital dashboard has a **solid foundation** with design tokens and some component separation, but lacks a **formal CSS architecture**. The 90KB `main.css` file and inconsistent naming patterns will cause maintainability issues as the app grows.

### Current State
- ✅ Design tokens implemented (`design-tokens.css`)
- ✅ Some file separation (components, utilities, responsive)
- ❌ No formal methodology (BEM, CUBE, ITCSS)
- ❌ `main.css` is too large (3600+ lines)
- ❌ Inconsistent class naming patterns
- ❌ No documentation of architecture decisions

### Recommended Path
Implement **BEM (Block Element Modifier)** with **CUBE CSS** layering for financial dashboard components.

---

## The Problem: Anti-Patterns Found

### 1. Overly Specific Selectors (Low Reusability)
```css
/* ❌ AVOID: Tightly coupled to HTML structure */
#sidebar .widget .content h3 + p {
  margin-top: 16px;
}

/* ✅ BETTER: Component-based, reusable */
.widget__first-paragraph {
  margin-top: 16px;
}
```

### 2. Parent-Dependent Styling (Unpredictable)
```css
/* ❌ AVOID: Widget changes based on location */
.card {
  background: var(--color-bg-2);
  padding: 24px;
}

#dashboard .card {
  padding: 16px; /* Different padding in dashboard */
}

body.homepage .card {
  background: white; /* Different color on homepage */
}

/* ✅ BETTER: Explicit modifiers */
.card {
  background: var(--color-bg-2);
  padding: 24px;
}

.card--compact {
  padding: 16px;
}

.card--light {
  background: white;
}
```

### 3. Generic Class Names (Namespace Collisions)
```css
/* ❌ AVOID: Too generic, likely to conflict */
.widget .title { }
.widget .actions { }
.widget .content { }

/* ✅ BETTER: Component namespaced */
.budget-widget__title { }
.budget-widget__actions { }
.budget-widget__content { }
```

---

## Recommended Architecture: BEM + CUBE CSS

### Why BEM?
**BEM (Block Element Modifier)** is perfect for financial dashboards:
- **Predictable**: Class names describe structure
- **Reusable**: Components are self-contained
- **Maintainable**: Easy to find and update
- **Scalable**: Works for teams of any size

### Why CUBE CSS Layering?
**CUBE (Composition Utility Block Exception)** organizes CSS by purpose:
1. **Composition**: Layout patterns (grid, stack, sidebar)
2. **Utility**: Single-purpose helpers (text-center, mt-16)
3. **Block**: Components (budget-card, transaction-row)
4. **Exception**: Context-specific overrides (rare, explicit)

---

## Implementation Plan

### Phase 1: Establish File Structure (Week 1)
```
app/assets/css/
├── design-tokens.css          ✅ EXISTS — Keep as-is
├── 00-reset.css               🆕 Browser normalization
├── 01-composition.css         🆕 Layout patterns
├── 02-utilities.css           ✅ EXISTS — Expand
├── 03-blocks/                 🆕 Component library
│   ├── _budget-card.css
│   ├── _transaction-row.css
│   ├── _account-summary.css
│   ├── _chart-widget.css
│   └── _nav.css
├── 04-exceptions.css          🆕 Context overrides (rare)
├── responsive.css             ✅ EXISTS — Merge into blocks
└── main.css                   ⚠️ REFACTOR — Import only
```

### Phase 2: Migrate Components to BEM (Week 2-3)

#### Example: Budget Card Component
**Before (current style):**
```html
<div class="card budget-item">
  <h4 class="title">Groceries</h4>
  <div class="progress-bar">
    <div class="fill" style="width: 65%"></div>
  </div>
  <p class="amount">$650 / $1,000</p>
  <button class="btn btn-primary">Edit</button>
</div>
```

**After (BEM style):**
```html
<div class="budget-card budget-card--warning">
  <h4 class="budget-card__title">Groceries</h4>
  <div class="budget-card__progress">
    <div class="budget-card__progress-fill" style="width: 65%"></div>
  </div>
  <p class="budget-card__amount">$650 / $1,000</p>
  <button class="budget-card__action">Edit</button>
</div>
```

**CSS (BEM pattern):**
```css
/* Block: Budget Card Component */
.budget-card {
  background: var(--color-bg-2);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
}

/* Element: Child components */
.budget-card__title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 12px;
}

.budget-card__progress {
  height: 8px;
  background: var(--color-bg-3);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.budget-card__progress-fill {
  height: 100%;
  background: var(--color-accent);
  transition: width 0.3s ease;
}

.budget-card__amount {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
}

.budget-card__action {
  /* Inherits from global button styles */
  width: 100%;
}

/* Modifier: Warning state (over 80% spent) */
.budget-card--warning .budget-card__progress-fill {
  background: var(--color-warning);
}

.budget-card--warning .budget-card__title::after {
  content: " ⚠️";
}

/* Modifier: Danger state (over 100% spent) */
.budget-card--danger .budget-card__progress-fill {
  background: var(--color-danger);
}

.budget-card--danger .budget-card__amount {
  color: var(--color-danger);
  font-weight: 600;
}
```

---

## Composition Layer: Layout Patterns

Create reusable layout patterns that work across components:

**File: `01-composition.css`**
```css
/* Stack: Vertical rhythm */
.stack > * + * {
  margin-top: var(--stack-space, 24px);
}

.stack--sm {
  --stack-space: 8px;
}

.stack--lg {
  --stack-space: 32px;
}

/* Sidebar: Sidebar + main content */
.sidebar-layout {
  display: flex;
  gap: 24px;
}

.sidebar-layout > :first-child {
  flex: 0 0 280px;
}

.sidebar-layout > :last-child {
  flex: 1;
}

/* Grid: Auto-fit responsive grid */
.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: 24px;
}

/* Cluster: Horizontal grouping with wrapping */
.cluster {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
```

**Usage Example:**
```html
<!-- Budget page with composition -->
<div class="sidebar-layout">
  <aside class="stack">
    <div class="budget-card">...</div>
    <div class="budget-card">...</div>
  </aside>
  <main class="auto-grid">
    <div class="chart-widget">...</div>
    <div class="chart-widget">...</div>
  </main>
</div>
```

---

## Naming Convention Standard

### BEM Structure
```
.block { }                    /* Component root */
.block__element { }           /* Child component */
.block--modifier { }          /* Variant */
.block__element--modifier { } /* Element variant */
```

### Component Prefixes (Optional but Recommended)
```css
/* Layout components */
.l-container { }
.l-grid { }

/* Component blocks */
.c-budget-card { }
.c-transaction-row { }

/* Utilities */
.u-text-center { }
.u-mt-16 { }

/* JavaScript hooks (never style these) */
.js-modal-trigger { }
.js-chart-container { }
```

---

## Migration Strategy

### Step 1: Audit Current Components (1 day)
```bash
# List all unique class names in current CSS
grep -oh "\.[a-zA-Z0-9_-]*" app/assets/css/*.css | sort -u > class-audit.txt
```

### Step 2: Prioritize by Usage (1 day)
High-impact components to migrate first:
1. ✅ Cards (used everywhere)
2. ✅ Buttons (already fairly consistent)
3. ✅ Forms (inputs, selects)
4. ✅ Navigation
5. ✅ Charts/widgets
6. ✅ Transaction rows
7. ✅ Account summaries

### Step 3: Create Component Library (2 weeks)
Migrate 2-3 components per day:
- Extract component CSS to `03-blocks/_component-name.css`
- Update HTML to BEM naming
- Test in isolation
- Document in Storybook or style guide (future)

### Step 4: Refactor `main.css` (3 days)
```css
/* main.css becomes an orchestrator */
@import './design-tokens.css';
@import './00-reset.css';
@import './01-composition.css';
@import './02-utilities.css';

/* Components */
@import './03-blocks/_nav.css';
@import './03-blocks/_budget-card.css';
@import './03-blocks/_transaction-row.css';
@import './03-blocks/_chart-widget.css';
@import './03-blocks/_account-summary.css';
/* ... more components ... */

@import './04-exceptions.css';
```

---

## Code Examples: Real Dashboard Components

### Transaction Row Component
```css
/* File: 03-blocks/_transaction-row.css */

.transaction {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid var(--color-border-subtle);
  transition: background-color 0.15s ease;
}

.transaction:hover {
  background: var(--color-bg-3);
}

.transaction__icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-bg-3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.transaction__details {
  flex: 1;
  min-width: 0; /* Allow text truncation */
}

.transaction__merchant {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.transaction__category {
  font-size: 14px;
  color: var(--color-text-tertiary);
}

.transaction__amount {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  flex-shrink: 0;
}

/* Modifiers */
.transaction--income .transaction__amount {
  color: var(--color-success);
}

.transaction--expense .transaction__amount {
  color: var(--color-text-primary);
}

.transaction--pending {
  opacity: 0.6;
}

.transaction--pending .transaction__merchant::after {
  content: " (Pending)";
  font-size: 12px;
  color: var(--color-text-tertiary);
}
```

**HTML:**
```html
<div class="transaction transaction--expense">
  <div class="transaction__icon">🍔</div>
  <div class="transaction__details">
    <div class="transaction__merchant">McDonald's</div>
    <div class="transaction__category">Dining</div>
  </div>
  <div class="transaction__amount">-$12.50</div>
</div>
```

### Account Summary Component
```css
/* File: 03-blocks/_account-summary.css */

.account {
  background: var(--color-bg-2);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
}

.account__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.account__name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.account__type {
  font-size: 14px;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.account__balance {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.account__change {
  font-size: 14px;
  font-weight: 600;
}

.account__actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

/* Modifiers */
.account--checking {
  border-left: 4px solid var(--color-secondary);
}

.account--savings {
  border-left: 4px solid var(--color-accent);
}

.account--credit {
  border-left: 4px solid var(--color-warning);
}

.account__change--positive {
  color: var(--color-success);
}

.account__change--positive::before {
  content: "▲ ";
}

.account__change--negative {
  color: var(--color-danger);
}

.account__change--negative::before {
  content: "▼ ";
}
```

---

## Documentation Template

Create `docs/css-architecture.md`:

```markdown
# CSS Architecture Guide

## Methodology
We use **BEM (Block Element Modifier)** with **CUBE CSS** layering.

## File Structure
- `design-tokens.css` — All design decisions (colors, spacing, typography)
- `00-reset.css` — Browser normalization
- `01-composition.css` — Layout patterns (stack, grid, sidebar)
- `02-utilities.css` — Single-purpose helpers
- `03-blocks/` — Component library (BEM components)
- `04-exceptions.css` — Context-specific overrides (use sparingly)

## Naming Rules
1. Component root: `.component-name`
2. Child element: `.component-name__element`
3. Variant: `.component-name--modifier`
4. Never use IDs for styling
5. Keep specificity low (ideally single class)

## Adding a New Component
1. Create `03-blocks/_component-name.css`
2. Use BEM naming
3. Import in `main.css`
4. Document usage in this file

## Component Catalog
- `.budget-card` — Budget category display with progress
- `.transaction` — Transaction row for lists
- `.account` — Account summary card
- `.chart-widget` — Chart container with header
- `.stat-card` — Single metric display
```

---

## Metrics for Success

### Before Refactor
- ❌ `main.css`: 3,604 lines, 90KB
- ❌ No naming convention
- ❌ 47+ unique class patterns
- ❌ High specificity (IDs, nested selectors)

### After Refactor (Target)
- ✅ `main.css`: <100 lines (imports only)
- ✅ Component files: <300 lines each
- ✅ Consistent BEM naming
- ✅ Low specificity (single class selectors)
- ✅ Documented component library
- ✅ Faster builds (smaller files)
- ✅ Easier onboarding (clear patterns)

---

## Next Steps

1. **Immediate (Today):**
   - Create new file structure
   - Extract 1 component as proof of concept (`budget-card`)
   - Test in dashboard.html

2. **This Week:**
   - Migrate top 5 components (card, button, form, nav, transaction)
   - Update corresponding HTML
   - Write architecture docs

3. **Next Sprint:**
   - Complete component migration
   - Refactor `main.css` to imports
   - Add CSS linting (Stylelint with BEM plugin)

---

## Resources

- **BEM Official:** [getbem.com](http://getbem.com/)
- **CUBE CSS:** [cube.fyi](https://cube.fyi/)
- **CSS Architecture (Philip Walton):** Research source
- **Stylelint BEM:** [stylelint-selector-bem-pattern](https://github.com/davidtheclark/stylelint-selector-bem-pattern)

---

**Research Status:** ✅ Complete  
**Next Research Topic:** Financial Dashboard UI Patterns  
**Researcher:** Capital (Fireside Capital Orchestrator)  
**Date:** February 4, 2026
