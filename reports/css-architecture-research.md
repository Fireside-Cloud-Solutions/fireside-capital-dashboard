# CSS Architecture Research — Fireside Capital Dashboard
**Research Date:** February 21, 2026  
**Researcher:** Capital (Sprint Research Agent)  
**Topic:** CSS Architecture Best Practices & Recommendations

---

## Executive Summary

The Fireside Capital dashboard already has a **solid foundation** with modular CSS files, design tokens, and component separation. However, adopting a formal CSS methodology (ITCSS + BEM naming) would improve scalability, reduce specificity conflicts, and make the codebase easier for new developers to navigate.

**Current State:** ✅ Good foundation  
**Recommended Next Step:** Formalize architecture with ITCSS layers + BEM naming convention

---

## Current CSS Architecture Analysis

### ✅ What's Working Well

1. **Modular File Structure**
   - `design-tokens.css` — CSS custom properties (colors, spacing, typography)
   - `components.css` — Component-specific styles
   - `utilities.css` — Utility classes
   - `responsive.css` — Media queries
   - `critical.css` — Above-the-fold styles
   - `accessibility.css` — A11y enhancements

2. **Design System Foundation**
   - Comprehensive design tokens (color palette, typography scale, spacing grid)
   - 8px spacing system
   - Clear brand hierarchy (Flame Orange, Sky Blue, Lime Green)
   - Consistent border-radius, shadow, and transition tokens

3. **Documentation**
   - Inline comments explaining design decisions
   - Version tracking in CSS files
   - UX polish notes

### ⚠️ Areas for Improvement

1. **No Formal Naming Convention**
   - Class names are descriptive but inconsistent (`notification-item`, `#notificationBadge`, `.dropdown-header`)
   - No namespacing to distinguish components from utilities
   - Risk of naming collisions as the app grows

2. **Specificity Management**
   - Some use of ID selectors (`#notificationBell`, `#notificationList`)
   - Deep descendant selectors in places (`.notification-item:hover`)
   - No clear specificity hierarchy

3. **File Organization**
   - Components mixed in single file (40KB `components.css`)
   - No clear layer separation (settings → tools → generic → elements → objects → components → utilities)

---

## Recommended CSS Methodology: **ITCSS + BEM**

### Why ITCSS (Inverted Triangle CSS)?

**ITCSS** organizes CSS by **specificity** — from generic to specific, low to high:

```
Settings    →  CSS custom properties, variables
Tools       →  Mixins, functions (if using preprocessor)
Generic     →  Resets, normalize
Elements    →  Base HTML element styling (h1, p, button)
Objects     →  Layout patterns (.o-container, .o-grid)
Components  →  UI components (.c-card, .c-notification)
Utilities   →  Single-purpose classes (.u-mb-16, .u-text-center)
```

**Benefits:**
- ✅ Prevents specificity wars
- ✅ Clear import order
- ✅ Scales to enterprise-level projects
- ✅ Works perfectly with design tokens (Settings layer)

### Why BEM (Block Element Modifier)?

**BEM** provides a naming convention that makes component boundaries crystal clear:

```css
/* Block */
.c-notification { }

/* Element (child of block) */
.c-notification__item { }
.c-notification__badge { }

/* Modifier (variation) */
.c-notification--unread { }
.c-notification__badge--danger { }
```

**Benefits:**
- ✅ Self-documenting (you know what `.c-notification__badge--danger` does)
- ✅ No specificity surprises
- ✅ Easy to search codebase
- ✅ Namespace prefixes prevent collisions

---

## Recommended File Structure (ITCSS Layers)

```
assets/css/
├── 1-settings/
│   └── tokens.css          (current design-tokens.css)
├── 2-tools/
│   └── mixins.css          (future: if adopting PostCSS/SCSS)
├── 3-generic/
│   └── reset.css           (normalize/reset)
├── 4-elements/
│   └── base.css            (body, h1-h6, a, button defaults)
├── 5-objects/
│   ├── layout.css          (.o-container, .o-grid, .o-section)
│   └── media.css           (.o-media — image + content pattern)
├── 6-components/
│   ├── card.css            (.c-card)
│   ├── notification.css    (.c-notification)
│   ├── button.css          (.c-btn)
│   ├── form.css            (.c-form)
│   ├── chart.css           (.c-chart)
│   └── ...                 (one file per component)
├── 7-utilities/
│   ├── spacing.css         (.u-mb-16, .u-p-24)
│   ├── text.css            (.u-text-center, .u-text-primary)
│   └── visibility.css      (.u-hidden, .u-sr-only)
├── shame.css               (quick fixes/hacks — to be refactored)
└── main.css                (imports all layers in order)
```

**Import order in `main.css`:**
```css
/* 1. Settings */
@import '1-settings/tokens.css';

/* 2. Tools (skip if not using preprocessor) */

/* 3. Generic */
@import '3-generic/reset.css';

/* 4. Elements */
@import '4-elements/base.css';

/* 5. Objects */
@import '5-objects/layout.css';
@import '5-objects/media.css';

/* 6. Components */
@import '6-components/button.css';
@import '6-components/card.css';
@import '6-components/notification.css';
/* ... */

/* 7. Utilities */
@import '7-utilities/spacing.css';
@import '7-utilities/text.css';

/* Shame */
@import 'shame.css';
```

---

## BEM Naming Convention Guide

### Component Namespace Prefixes

```css
.c-   Component      (.c-card, .c-btn, .c-notification)
.o-   Object/Layout  (.o-container, .o-grid, .o-media)
.u-   Utility        (.u-mb-16, .u-text-center, .u-hidden)
.is-  State          (.is-active, .is-loading, .is-error)
.has- State          (.has-dropdown, .has-icon)
```

### Example: Refactoring Notification Component

**Before (current):**
```css
#notificationBell { }
#notificationBadge { }
.notification-item { }
.notification-item.unread { }
.dropdown-header { }
```

**After (BEM + namespace):**
```css
.c-notification { }
.c-notification__bell { }
.c-notification__badge { }
.c-notification__badge--danger { }
.c-notification__menu { }
.c-notification__item { }
.c-notification__item--unread { }
.c-notification__header { }
```

**HTML:**
```html
<div class="c-notification">
  <button class="c-notification__bell" aria-label="Notifications">
    <i class="bi bi-bell"></i>
    <span class="c-notification__badge c-notification__badge--danger">3</span>
  </button>
  
  <div class="c-notification__menu">
    <div class="c-notification__header">
      <strong>Notifications</strong>
      <button class="c-btn c-btn--text">Mark all read</button>
    </div>
    
    <div class="c-notification__item c-notification__item--unread">
      <i class="bi bi-exclamation-circle"></i>
      <div class="c-notification__content">
        <strong>Bill Due Soon</strong>
        <p>Electric bill due in 3 days ($125.50)</p>
      </div>
    </div>
  </div>
</div>
```

---

## Migration Strategy (Incremental)

**Option A: Big Bang Refactor (NOT RECOMMENDED)**
- Rewrite all CSS at once
- High risk, breaks existing pages

**Option B: Gradual Migration (RECOMMENDED)**
1. ✅ Create new ITCSS folder structure
2. ✅ Move `design-tokens.css` → `1-settings/tokens.css`
3. ✅ Create `main.css` with new import order
4. ✅ Refactor ONE component at a time (start with smallest)
5. ✅ Update HTML to use BEM classes
6. ✅ Remove old CSS once all references updated
7. ✅ Repeat for next component

**Start with:** Notification component (already isolated in `components.css`)

---

## Code Example: Button Component

**File: `6-components/button.css`**
```css
/* ==========================================
   Button Component
   Namespace: .c-btn
   
   Variants:
   - Primary (Flame Orange)
   - Secondary (Sky Blue)
   - Tertiary (Neutral Gray)
   - Success (Lime Green)
   - Danger (Red outline)
   
   Sizes: default, small, large
   States: disabled, loading
   ========================================== */

/* Block */
.c-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2); /* 8px */
  padding: var(--space-3) var(--space-4); /* 12px 16px */
  font-family: var(--font-body);
  font-size: var(--text-body);
  font-weight: var(--weight-semibold);
  line-height: 1.5;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 150ms ease;
  min-height: 44px; /* WCAG touch target */
  
  /* Default: Tertiary (neutral gray) */
  background-color: var(--color-tertiary);
  color: var(--color-button-text);
}

.c-btn:hover:not(:disabled) {
  background-color: var(--color-tertiary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.c-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.c-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modifier: Primary (Flame Orange) */
.c-btn--primary {
  background-color: var(--color-primary);
  color: var(--color-button-text);
}

.c-btn--primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

/* Modifier: Secondary (Sky Blue) */
.c-btn--secondary {
  background-color: var(--color-secondary);
  color: var(--color-button-text);
}

.c-btn--secondary:hover:not(:disabled) {
  background-color: var(--color-secondary-hover);
}

/* Modifier: Success (Lime Green) */
.c-btn--success {
  background-color: var(--color-accent);
  color: var(--color-button-text);
}

.c-btn--success:hover:not(:disabled) {
  background-color: var(--color-accent-hover);
}

/* Modifier: Danger (Red outline) */
.c-btn--danger {
  background-color: transparent;
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.c-btn--danger:hover:not(:disabled) {
  background-color: var(--color-danger);
  color: var(--color-text-primary);
}

/* Modifier: Small */
.c-btn--sm {
  padding: var(--space-2) var(--space-3); /* 8px 12px */
  font-size: var(--text-sm);
  min-height: 36px;
}

/* Modifier: Large */
.c-btn--lg {
  padding: var(--space-4) var(--space-6); /* 16px 24px */
  font-size: var(--text-lg);
  min-height: 52px;
}

/* Modifier: Full width */
.c-btn--block {
  width: 100%;
}

/* Modifier: Icon-only */
.c-btn--icon {
  padding: var(--space-3);
  min-width: 44px;
}

/* State: Loading */
.c-btn.is-loading {
  position: relative;
  color: transparent;
  pointer-events: none;
}

.c-btn.is-loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

**Usage in HTML:**
```html
<!-- Primary action -->
<button class="c-btn c-btn--primary">Connect Bank Account</button>

<!-- Secondary action -->
<button class="c-btn c-btn--secondary">View Details</button>

<!-- Danger action -->
<button class="c-btn c-btn--danger">Delete Account</button>

<!-- Small button -->
<button class="c-btn c-btn--secondary c-btn--sm">Edit</button>

<!-- Loading state -->
<button class="c-btn c-btn--primary is-loading">Saving...</button>

<!-- Icon button -->
<button class="c-btn c-btn--icon" aria-label="Settings">
  <i class="bi bi-gear"></i>
</button>
```

---

## Utility Classes (7-utilities/)

**File: `7-utilities/spacing.css`**
```css
/* ==========================================
   Spacing Utilities
   Namespace: .u-
   Grid: 8px base
   ========================================== */

/* Margin bottom */
.u-mb-0  { margin-bottom: 0 !important; }
.u-mb-8  { margin-bottom: 8px !important; }
.u-mb-16 { margin-bottom: 16px !important; }
.u-mb-24 { margin-bottom: 24px !important; }
.u-mb-32 { margin-bottom: 32px !important; }
.u-mb-48 { margin-bottom: 48px !important; }

/* Margin top */
.u-mt-0  { margin-top: 0 !important; }
.u-mt-8  { margin-top: 8px !important; }
.u-mt-16 { margin-top: 16px !important; }
.u-mt-24 { margin-top: 24px !important; }
.u-mt-32 { margin-top: 32px !important; }

/* Padding */
.u-p-8  { padding: 8px !important; }
.u-p-16 { padding: 16px !important; }
.u-p-24 { padding: 24px !important; }
.u-p-32 { padding: 32px !important; }

/* Padding horizontal/vertical */
.u-px-16 { padding-left: 16px !important; padding-right: 16px !important; }
.u-px-24 { padding-left: 24px !important; padding-right: 24px !important; }
.u-py-16 { padding-top: 16px !important; padding-bottom: 16px !important; }
.u-py-24 { padding-top: 24px !important; padding-bottom: 24px !important; }

/* Gap (for flexbox/grid) */
.u-gap-8  { gap: 8px !important; }
.u-gap-12 { gap: 12px !important; }
.u-gap-16 { gap: 16px !important; }
.u-gap-24 { gap: 24px !important; }
```

---

## Key Takeaways

### ✅ Keep Doing
- Design tokens in CSS custom properties
- 8px spacing grid
- Modular file separation
- Inline documentation

### 🔄 Improve
- Adopt ITCSS folder structure (7 layers)
- Implement BEM naming with namespace prefixes
- Break apart large `components.css` into individual component files
- Eliminate ID selectors in CSS
- Create `shame.css` for quick fixes that need refactoring

### 🚀 Benefits
- **Scalability:** Easier to add new components without naming conflicts
- **Maintainability:** New developers can navigate codebase faster
- **Consistency:** BEM enforces uniform naming patterns
- **Specificity Control:** ITCSS prevents specificity wars
- **Performance:** Easier to identify unused CSS for removal

---

## Next Steps (Implementation Backlog)

1. ✅ **Research Complete** — Create Azure DevOps tasks
2. 🔨 **Create ITCSS folder structure** in `assets/css/`
3. 🔨 **Migrate design-tokens.css** → `1-settings/tokens.css`
4. 🔨 **Refactor notification component** (first BEM migration)
5. 🔨 **Refactor button component** (use example code above)
6. 🔨 **Create utilities** with `.u-` namespace
7. 🔨 **Document migration in CONTRIBUTING.md**
8. 🔨 **Update build process** if needed (CSS imports)

---

## References

- [ITCSS: Scalable and Maintainable CSS Architecture](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture)
- [5 Methodologies for Architecting CSS](https://www.valoremreply.com/resources/insights/blog/2020/november/5-methodologies-for-architecting-css/)
- [Efficient CSS Architectures: BEM, SMACSS, and ITCSS](https://codedamn.com/news/css/efficient-css-architectures-bem-smacss-itcss)
- [BEM Methodology Documentation](http://getbem.com/)
- [CSS Architecture for Design Systems](https://bradfrost.com/blog/post/css-architecture-for-design-systems/)

---

**Research Status:** ✅ Complete  
**Implementation Status:** 🔨 Ready for tasking  
**Estimated Effort:** 2-3 sprints (gradual migration)
