# CSS Architecture Research — Fireside Capital Dashboard
**Date:** February 23, 2026  
**Researcher:** Capital  
**Status:** Complete  

## Executive Summary
Modern CSS architecture has evolved toward a hybrid approach combining **CSS Globals + BEM + Utility Classes**. The CUBE CSS methodology (Composition, Utility, Block, Exception) provides a pragmatic framework for scalable financial dashboards.

## Key Findings

### 1. Recommended Architecture: Hybrid BEM + Utilities

#### Why This Approach?
- **BEM alone** → Too many class names, bloated CSS for minor variations
- **Utilities alone** → Unreadable HTML, poor for complex animations
- **Hybrid** → Best of both: DRY code, fast customization, maintainable

#### Layer Structure
```
Global Styles (CSS Custom Properties)
    ↓
Composition (Layout Skeletons)
    ↓
Utilities (Single-purpose classes)
    ↓
Blocks (Component-specific BEM)
    ↓
Exceptions (Data attribute variants)
```

### 2. CSS Globals — Foundation Layer

#### What Goes in Globals
- **Design tokens:** spacing, typography, colors, shadows
- **Responsive rules:** cascade through custom properties
- **Behavioral components:** `.text-component`, `.card-base`

#### Implementation for Fireside Capital
```css
/* app/assets/css/globals/_tokens.css */
:root {
  /* Spacing Scale */
  --space-unit: 1em;
  --space-xs: calc(0.5 * var(--space-unit));
  --space-sm: calc(0.75 * var(--space-unit));
  --space-md: calc(1.25 * var(--space-unit));
  --space-lg: calc(2 * var(--space-unit));
  --space-xl: calc(3.25 * var(--space-unit));

  /* Typography Scale */
  --text-base-size: 1em;
  --text-scale-ratio: 1.2;
  --text-xs: calc(var(--text-base-size) / var(--text-scale-ratio) / var(--text-scale-ratio));
  --text-sm: calc(var(--text-xs) * var(--text-scale-ratio));
  --text-md: calc(var(--text-sm) * var(--text-scale-ratio) * var(--text-scale-ratio));
  --text-lg: calc(var(--text-md) * var(--text-scale-ratio));
  --text-xl: calc(var(--text-lg) * var(--text-scale-ratio));
  --text-xxl: calc(var(--text-xl) * var(--text-scale-ratio));

  /* Financial Dashboard Colors */
  --color-primary: #01a4ef;
  --color-secondary: #f44e24;
  --color-success: #81b900;
  --color-danger: #dc3545;
  --color-warning: #ffc107;
  
  /* Contrast levels for text hierarchy */
  --color-contrast-higher: #1a1a1a;
  --color-contrast-high: #333;
  --color-contrast-medium: #666;
  --color-contrast-low: #999;
  
  /* Surface colors */
  --color-bg: #ffffff;
  --color-bg-light: #f8f9fa;
  --color-bg-dark: #2c3e50;
}

/* Responsive scaling at 64rem (1024px) */
@media (min-width: 64rem) {
  :root {
    --space-unit: 1.25em;
    --text-base-size: 1.125em;
    --text-scale-ratio: 1.25;
  }
}

/* Dark theme tokens */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #1a1a1a;
    --color-bg-light: #2c2c2c;
    --color-contrast-higher: #f8f9fa;
    --color-contrast-high: #e0e0e0;
    --color-contrast-medium: #b3b3b3;
  }
}
```

### 3. Utility Classes — Speed Layer

#### Core Utilities Needed
```css
/* app/assets/css/globals/_utilities.css */

/* Spacing */
.padding-xs { padding: var(--space-xs); }
.padding-sm { padding: var(--space-sm); }
.padding-md { padding: var(--space-md); }
.padding-lg { padding: var(--space-lg); }
.padding-xl { padding: var(--space-xl); }

.margin-top-md { margin-top: var(--space-md); }
.margin-bottom-lg { margin-bottom: var(--space-lg); }

/* Typography */
.text-xs { font-size: var(--text-xs); }
.text-sm { font-size: var(--text-sm); }
.text-md { font-size: var(--text-md); }
.text-lg { font-size: var(--text-lg); }
.text-xl { font-size: var(--text-xl); }
.text-xxl { font-size: var(--text-xxl); }

.text-center { text-align: center; }
.text-right { text-align: right; }
.font-bold { font-weight: 700; }
.font-normal { font-weight: 400; }

/* Colors */
.color-primary { color: var(--color-primary); }
.color-success { color: var(--color-success); }
.color-danger { color: var(--color-danger); }
.color-contrast-medium { color: var(--color-contrast-medium); }

.bg-primary { background-color: var(--color-primary); }
.bg-light { background-color: var(--color-bg-light); }

/* Layout */
.flex { display: flex; }
.flex-column { flex-direction: column; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.gap-sm { gap: var(--space-sm); }
.gap-md { gap: var(--space-md); }

/* Display */
.block { display: block; }
.hidden { display: none; }
.width-100 { width: 100%; }

/* Financial-specific */
.currency {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}

.amount-positive { color: var(--color-success); }
.amount-negative { color: var(--color-danger); }
```

### 4. BEM Components — Behavior Layer

#### When to Use BEM
- Complex hover/focus effects
- Animations and transitions
- Positioning relationships between elements
- Component-specific behavioral CSS

#### Example: Debt Card Component
```html
<!-- app/debts.html -->
<article class="debt-card radius-md padding-md bg-light">
  <div class="debt-card__header flex justify-between align-center margin-bottom-sm">
    <h3 class="debt-card__title text-lg font-bold">Student Loan</h3>
    <span class="debt-card__badge" data-variant="active">Active</span>
  </div>
  
  <div class="debt-card__metrics">
    <div class="metric">
      <span class="metric__label text-sm color-contrast-medium">Balance</span>
      <span class="metric__value text-xl currency amount-negative">$24,350.00</span>
    </div>
    <div class="metric">
      <span class="metric__label text-sm color-contrast-medium">Rate</span>
      <span class="metric__value text-lg">5.25%</span>
    </div>
  </div>
  
  <div class="debt-card__progress-wrapper margin-top-md">
    <div class="debt-card__progress" data-progress="35"></div>
  </div>
</article>
```

```css
/* app/assets/css/components/_debt-card.css */
.debt-card {
  position: relative;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.debt-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.debt-card__badge {
  padding: 0.25em 0.75em;
  border-radius: 999px;
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  background-color: var(--color-contrast-low);
  color: white;
}

.debt-card__badge[data-variant="active"] {
  background-color: var(--color-success);
}

.debt-card__badge[data-variant="paid"] {
  background-color: var(--color-primary);
}

.debt-card__progress-wrapper {
  height: 8px;
  background-color: var(--color-bg-light);
  border-radius: 999px;
  overflow: hidden;
}

.debt-card__progress {
  height: 100%;
  background: linear-gradient(90deg, var(--color-success) 0%, var(--color-primary) 100%);
  border-radius: 999px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  width: 0%;
}

.debt-card__progress[data-progress="35"] {
  width: 35%;
}
```

### 5. Exception Pattern — Data Attributes Over Modifiers

#### Why Data Attributes?
- **Easier JS integration:** `element.dataset.variant = 'active'`
- **Accessible:** Don't interfere with ARIA attributes
- **Cleaner HTML:** `data-variant="ghost"` vs `button--ghost button--large button--disabled`

#### Example: Button Variants
```html
<button class="btn" data-variant="solid">Pay Now</button>
<button class="btn" data-variant="ghost">Details</button>
<button class="btn" data-variant="disabled">Paid</button>
```

```css
.btn {
  padding: var(--space-sm) var(--space-md);
  border: 2px solid transparent;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background-color: var(--color-primary);
  color: white;
}

.btn[data-variant="ghost"] {
  background-color: transparent;
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn[data-variant="disabled"] {
  opacity: 0.5;
  cursor: not-allowed;
}
```

## Recommendations for Fireside Capital

### Phase 1: Establish Globals (Week 1)
**Priority:** HIGH  
**Effort:** 4 hours  

1. Create `app/assets/css/globals/` directory
2. Build design token files:
   - `_tokens.css` → spacing, typography, colors
   - `_utilities.css` → utility classes
   - `_reset.css` → CSS reset
   - `_text-component.css` → text wrapper behavioral class
3. Import globals in `style.css`

### Phase 2: Refactor Existing Components (Week 1-2)
**Priority:** MEDIUM  
**Effort:** 8 hours  

Refactor these pages using hybrid approach:
- ✅ **dashboard.html** → Cards showing account summaries
- ✅ **debts.html** → Debt cards with progress bars
- ✅ **bills.html** → Bill cards with due date badges
- ✅ **investments.html** → Portfolio cards with charts

### Phase 3: Component Library (Week 2)
**Priority:** MEDIUM  
**Effort:** 6 hours  

Document reusable patterns:
- Card variants (metric-card, account-card, bill-card)
- Button variants (solid, ghost, danger, success)
- Badge variants (status, priority, category)
- Form components (input, select, checkbox with utility classes)

### Phase 4: Dark Mode (Week 3)
**Priority:** LOW  
**Effort:** 3 hours  

Leverage CSS custom properties for automatic dark mode:
```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #1a1a1a;
    --color-bg-light: #2c2c2c;
    /* ... other dark tokens */
  }
}
```

## File Structure Recommendation
```
app/assets/css/
├── globals/
│   ├── _tokens.css          # Design tokens
│   ├── _reset.css           # CSS reset
│   ├── _utilities.css       # Utility classes
│   ├── _text-component.css  # Text wrapper
│   └── _grid.css            # Grid layout utilities
├── components/
│   ├── _debt-card.css
│   ├── _bill-card.css
│   ├── _account-card.css
│   ├── _metric-card.css
│   ├── _btn.css
│   └── _badge.css
├── pages/
│   ├── _dashboard.css       # Page-specific styles
│   ├── _debts.css
│   └── _bills.css
└── style.css                # Main import file
```

## Anti-Patterns to Avoid

### ❌ DON'T: Create BEM classes for everything
```html
<!-- Too many meaningless names -->
<div class="card__content-wrapper">
  <p class="card__text card__text--small card__text--secondary"></p>
</div>
```

### ✅ DO: Use utilities for simple properties
```html
<!-- Clear, self-documenting -->
<div class="padding-md">
  <p class="text-sm color-contrast-medium"></p>
</div>
```

### ❌ DON'T: Use utilities for complex effects
```html
<!-- Unreadable utility soup -->
<div class="position-relative overflow-hidden transition-all duration-300 hover:translate-y-2 hover:shadow-lg"></div>
```

### ✅ DO: Use BEM for behavioral CSS
```html
<div class="debt-card"></div> <!-- .debt-card handles hover/transitions in CSS -->
```

## Next Steps
1. **Task:** Create globals directory structure
2. **Task:** Build design token CSS file with Fireside brand colors
3. **Task:** Create utility classes file
4. **Task:** Refactor debt-card component as proof of concept
5. **Task:** Document component patterns in Storybook or style guide

## References
- [CUBE CSS Methodology](https://cube.fyi/)
- [BEM + Utilities (CSS-Tricks)](https://css-tricks.com/building-a-scalable-css-architecture-with-bem-and-utility-classes/)
- [CodyFrame Architecture](https://codyhouse.co/ds/docs/framework)
