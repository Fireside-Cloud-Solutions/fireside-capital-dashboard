# CSS Architecture Research Report
**Fireside Capital Dashboard**  
**Date:** February 12, 2026  
**Researcher:** Capital (Orchestrator)  
**Status:** Complete — Ready for Implementation

---

## Executive Summary

Current CSS architecture is **strong** with a well-structured design token system and component separation. This research identifies **5 key enhancements** to improve maintainability, scalability, and developer experience as the dashboard grows.

**Current State:**
- ✅ Comprehensive design token system (`design-tokens.css`)
- ✅ Component-based organization (9 CSS files)
- ✅ Dark-first approach with logo-native brand system
- ✅ 8px spacing grid and mobile-responsive
- ⚠️ No formal naming convention (mixing approaches)
- ⚠️ No documented layer hierarchy
- ⚠️ Limited utility class system

**Recommended Enhancements:**
1. Adopt **ITCSS layer structure** for predictable specificity
2. Implement **BEM naming convention** for components
3. Expand **utility class library** for rapid development
4. Add **CSS cascade layers** (`@layer`) for explicit control
5. Create **component documentation** system

---

## 1. ITCSS (Inverted Triangle CSS) Layer Structure

### What It Is
ITCSS organizes CSS from least specific (settings) to most specific (utilities), creating a predictable cascade that prevents specificity wars.

### Current vs. Recommended Structure

**Current:**
```
app/assets/css/
├── design-tokens.css
├── main.css
├── components.css
├── financial-patterns.css
├── accessibility.css
├── responsive.css
├── utilities.css
├── onboarding.css
└── logged-out-cta.css
```

**Recommended ITCSS Structure:**
```
app/assets/css/
├── 01-settings/
│   └── design-tokens.css          (CSS custom properties — no output)
├── 02-tools/
│   ├── mixins.css                 (Helper mixins — no output)
│   └── functions.css              (CSS functions — no output)
├── 03-generic/
│   ├── normalize.css              (Browser resets)
│   └── box-sizing.css             (Universal rules)
├── 04-elements/
│   ├── typography.css             (h1-h6, p, a)
│   └── forms.css                  (input, button base styles)
├── 05-objects/
│   ├── layout.css                 (.o-container, .o-grid)
│   └── media.css                  (.o-media — reusable patterns)
├── 06-components/
│   ├── c-nav.css                  (Navigation component)
│   ├── c-card.css                 (Card component)
│   ├── c-chart.css                (Chart wrappers)
│   ├── c-metric.css               (Financial metrics)
│   ├── c-notification.css         (Notification system)
│   └── c-onboarding.css           (Onboarding flows)
├── 07-utilities/
│   ├── spacing.css                (Margin/padding utilities)
│   ├── typography.css             (Text utilities)
│   ├── color.css                  (Background/text colors)
│   └── display.css                (Flex/grid utilities)
└── main.css                       (Import orchestrator)
```

### Implementation Example

**`main.css` — ITCSS Import Order:**
```css
/* =================================================================
   Fireside Capital — Main Stylesheet (ITCSS Structure)
   Version: 3.0 | February 2026
   ================================================================= */

/* 01 — SETTINGS: Design tokens (no CSS output) */
@import url('./01-settings/design-tokens.css');

/* 02 — TOOLS: Mixins & functions (no CSS output) */
/* (Future: add when needed) */

/* 03 — GENERIC: Resets and browser normalization */
@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');

/* 04 — ELEMENTS: Bare HTML elements */
@import url('./04-elements/typography.css');
@import url('./04-elements/forms.css');

/* 05 — OBJECTS: Layout patterns (class-based, no cosmetics) */
@import url('./05-objects/layout.css');

/* 06 — COMPONENTS: UI components (high specificity allowed) */
@import url('./06-components/c-nav.css');
@import url('./06-components/c-card.css');
@import url('./06-components/c-chart.css');
@import url('./06-components/c-metric.css');
@import url('./06-components/c-notification.css');
@import url('./06-components/c-onboarding.css');

/* 07 — UTILITIES: Overrides and helpers (highest specificity) */
@import url('./07-utilities/spacing.css');
@import url('./07-utilities/typography.css');
@import url('./07-utilities/color.css');
@import url('./07-utilities/display.css');

/* Legacy imports (to be migrated) */
@import url('./financial-patterns.css');
@import url('./accessibility.css');
@import url('./responsive.css');
```

**Benefits:**
- ✅ Clear mental model for where styles belong
- ✅ Prevents specificity wars
- ✅ Easier onboarding for new developers
- ✅ Predictable cascade behavior

---

## 2. BEM (Block Element Modifier) Naming Convention

### What It Is
BEM provides a structured naming pattern: `.block__element--modifier`

### Current vs. Recommended

**Current (Inconsistent):**
```css
/* Mixed naming — hard to understand relationships */
#notificationBell { }
#notificationBadge { }
.notification-menu { }
.notification-item { }
.card { }
.metric-card { }
```

**Recommended (BEM with Namespaces):**
```css
/* Component: Notification (namespace: c-) */
.c-notification { }                    /* Block */
.c-notification__bell { }              /* Element */
.c-notification__badge { }             /* Element */
.c-notification__menu { }              /* Element */
.c-notification__item { }              /* Element */
.c-notification__item--unread { }      /* Modifier */
.c-notification--empty { }             /* Modifier */

/* Component: Card (namespace: c-) */
.c-card { }                            /* Block */
.c-card__header { }                    /* Element */
.c-card__body { }                      /* Element */
.c-card__footer { }                    /* Element */
.c-card--metric { }                    /* Modifier */
.c-card--elevated { }                  /* Modifier */

/* Object: Layout (namespace: o-) */
.o-container { }                       /* Block */
.o-grid { }                            /* Block */
.o-grid__item { }                      /* Element */
.o-grid--2-col { }                     /* Modifier */

/* Utility: Spacing (namespace: u-) */
.u-mb-16 { margin-bottom: 16px !important; }
.u-mt-24 { margin-top: 24px !important; }
```

### Namespace Prefixes (BEMIT)

| Prefix | Purpose | Example | Specificity |
|--------|---------|---------|-------------|
| `c-` | Component | `.c-nav`, `.c-card` | Medium-High |
| `o-` | Object (layout pattern) | `.o-container`, `.o-grid` | Low-Medium |
| `u-` | Utility (single purpose) | `.u-mb-16`, `.u-text-center` | High (`!important`) |
| `t-` | Theme override | `.t-dark`, `.t-light` | Medium |
| `is-` / `has-` | State | `.is-active`, `.has-error` | Medium |
| `js-` | JavaScript hook | `.js-toggle`, `.js-modal` | None (no styles) |

### Migration Example

**Before:**
```html
<div id="notificationBell" class="btn btn-outline-secondary position-relative">
  <i class="bi bi-bell"></i>
  <span id="notificationBadge" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
    3
  </span>
</div>
```

**After (BEM):**
```html
<button class="c-notification__bell c-notification__bell--active">
  <i class="c-notification__icon bi bi-bell"></i>
  <span class="c-notification__badge c-notification__badge--danger">3</span>
</button>
```

**CSS:**
```css
/* Component: Notification Bell */
.c-notification__bell {
  position: relative;
  padding: var(--space-2);
  background-color: var(--color-bg-2);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  transition: var(--transition-all);
}

.c-notification__bell:hover {
  background-color: var(--color-bg-3);
  border-color: var(--color-primary);
  transform: scale(1.05);
}

.c-notification__bell--active {
  border-color: var(--color-primary);
}

.c-notification__icon {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  transition: var(--transition-color);
}

.c-notification__bell:hover .c-notification__icon {
  color: var(--color-primary);
}

.c-notification__badge {
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: 11px;
  font-weight: 600;
  line-height: 20px;
  text-align: center;
  border-radius: var(--radius-full);
  border: 2px solid var(--color-bg-1);
  box-shadow: var(--shadow-sm);
}

.c-notification__badge--danger {
  background-color: var(--color-danger);
  color: var(--color-text-on-brand);
}

.c-notification__badge--warning {
  background-color: var(--color-warning);
  color: var(--color-text-on-brand);
}

.c-notification__badge:empty {
  display: none;
}
```

---

## 3. Expanded Utility Class Library

### Current State
Limited utilities in `utilities.css`. Relying on inline styles and Bootstrap classes.

### Recommended Utility System

**`07-utilities/spacing.css`:**
```css
/* =================================================================
   SPACING UTILITIES — 8px Grid System
   Naming: u-{property}{direction}-{value}
   Properties: m (margin), p (padding)
   Directions: t (top), r (right), b (bottom), l (left), x (horizontal), y (vertical), (all)
   Values: 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96
   ================================================================= */

/* Margin Bottom */
.u-mb-0 { margin-bottom: 0 !important; }
.u-mb-4 { margin-bottom: 4px !important; }
.u-mb-8 { margin-bottom: 8px !important; }
.u-mb-12 { margin-bottom: 12px !important; }
.u-mb-16 { margin-bottom: 16px !important; }
.u-mb-24 { margin-bottom: 24px !important; }
.u-mb-32 { margin-bottom: 32px !important; }
.u-mb-48 { margin-bottom: 48px !important; }
.u-mb-64 { margin-bottom: 64px !important; }

/* Margin Top */
.u-mt-0 { margin-top: 0 !important; }
.u-mt-8 { margin-top: 8px !important; }
.u-mt-16 { margin-top: 16px !important; }
.u-mt-24 { margin-top: 24px !important; }
.u-mt-32 { margin-top: 32px !important; }

/* Margin X (Horizontal) */
.u-mx-auto { margin-left: auto !important; margin-right: auto !important; }
.u-mx-8 { margin-left: 8px !important; margin-right: 8px !important; }
.u-mx-16 { margin-left: 16px !important; margin-right: 16px !important; }

/* Margin Y (Vertical) */
.u-my-0 { margin-top: 0 !important; margin-bottom: 0 !important; }
.u-my-8 { margin-top: 8px !important; margin-bottom: 8px !important; }
.u-my-16 { margin-top: 16px !important; margin-bottom: 16px !important; }
.u-my-24 { margin-top: 24px !important; margin-bottom: 24px !important; }

/* Padding */
.u-p-0 { padding: 0 !important; }
.u-p-8 { padding: 8px !important; }
.u-p-16 { padding: 16px !important; }
.u-p-24 { padding: 24px !important; }
.u-p-32 { padding: 32px !important; }

/* Padding X/Y */
.u-px-8 { padding-left: 8px !important; padding-right: 8px !important; }
.u-px-16 { padding-left: 16px !important; padding-right: 16px !important; }
.u-px-24 { padding-left: 24px !important; padding-right: 24px !important; }

.u-py-8 { padding-top: 8px !important; padding-bottom: 8px !important; }
.u-py-16 { padding-top: 16px !important; padding-bottom: 16px !important; }
.u-py-24 { padding-top: 24px !important; padding-bottom: 24px !important; }

/* Responsive variants */
@media (min-width: 768px) {
  .u-mb-md-32 { margin-bottom: 32px !important; }
  .u-mb-md-48 { margin-bottom: 48px !important; }
  .u-px-md-32 { padding-left: 32px !important; padding-right: 32px !important; }
}
```

**`07-utilities/typography.css`:**
```css
/* =================================================================
   TYPOGRAPHY UTILITIES
   ================================================================= */

/* Font Sizes */
.u-text-xs { font-size: var(--text-small) !important; }
.u-text-sm { font-size: var(--text-body-sm) !important; }
.u-text-base { font-size: var(--text-body) !important; }
.u-text-lg { font-size: var(--text-body-lg) !important; }
.u-text-xl { font-size: var(--text-h3) !important; }
.u-text-2xl { font-size: var(--text-h2) !important; }

/* Font Weights */
.u-font-regular { font-weight: var(--weight-regular) !important; }
.u-font-medium { font-weight: var(--weight-medium) !important; }
.u-font-semibold { font-weight: var(--weight-semibold) !important; }
.u-font-bold { font-weight: var(--weight-bold) !important; }

/* Text Alignment */
.u-text-left { text-align: left !important; }
.u-text-center { text-align: center !important; }
.u-text-right { text-align: right !important; }

/* Text Colors */
.u-text-primary { color: var(--color-text-primary) !important; }
.u-text-secondary { color: var(--color-text-secondary) !important; }
.u-text-tertiary { color: var(--color-text-tertiary) !important; }
.u-text-muted { color: var(--color-text-secondary) !important; opacity: 0.7; }
.u-text-brand { color: var(--color-primary) !important; }
.u-text-success { color: var(--color-success) !important; }
.u-text-danger { color: var(--color-danger) !important; }
.u-text-warning { color: var(--color-warning) !important; }

/* Line Height */
.u-leading-tight { line-height: var(--leading-tight) !important; }
.u-leading-normal { line-height: var(--leading-normal) !important; }
.u-leading-relaxed { line-height: var(--leading-relaxed) !important; }

/* Text Decoration */
.u-no-underline { text-decoration: none !important; }
.u-underline { text-decoration: underline !important; }
```

**`07-utilities/display.css`:**
```css
/* =================================================================
   DISPLAY & LAYOUT UTILITIES
   ================================================================= */

/* Display */
.u-block { display: block !important; }
.u-inline { display: inline !important; }
.u-inline-block { display: inline-block !important; }
.u-flex { display: flex !important; }
.u-inline-flex { display: inline-flex !important; }
.u-grid { display: grid !important; }
.u-hidden { display: none !important; }

/* Flexbox Utilities */
.u-flex-row { flex-direction: row !important; }
.u-flex-col { flex-direction: column !important; }
.u-flex-wrap { flex-wrap: wrap !important; }
.u-flex-nowrap { flex-wrap: nowrap !important; }

.u-items-start { align-items: flex-start !important; }
.u-items-center { align-items: center !important; }
.u-items-end { align-items: flex-end !important; }
.u-items-stretch { align-items: stretch !important; }

.u-justify-start { justify-content: flex-start !important; }
.u-justify-center { justify-content: center !important; }
.u-justify-end { justify-content: flex-end !important; }
.u-justify-between { justify-content: space-between !important; }
.u-justify-around { justify-content: space-around !important; }

.u-gap-4 { gap: 4px !important; }
.u-gap-8 { gap: 8px !important; }
.u-gap-12 { gap: 12px !important; }
.u-gap-16 { gap: 16px !important; }
.u-gap-24 { gap: 24px !important; }

/* Grid Utilities */
.u-grid-cols-1 { grid-template-columns: repeat(1, 1fr) !important; }
.u-grid-cols-2 { grid-template-columns: repeat(2, 1fr) !important; }
.u-grid-cols-3 { grid-template-columns: repeat(3, 1fr) !important; }
.u-grid-cols-4 { grid-template-columns: repeat(4, 1fr) !important; }

/* Position */
.u-relative { position: relative !important; }
.u-absolute { position: absolute !important; }
.u-fixed { position: fixed !important; }
.u-sticky { position: sticky !important; }
```

**`07-utilities/color.css`:**
```css
/* =================================================================
   COLOR UTILITIES
   ================================================================= */

/* Background Colors */
.u-bg-1 { background-color: var(--color-bg-1) !important; }
.u-bg-2 { background-color: var(--color-bg-2) !important; }
.u-bg-3 { background-color: var(--color-bg-3) !important; }

.u-bg-primary { background-color: var(--color-primary) !important; }
.u-bg-secondary { background-color: var(--color-secondary) !important; }
.u-bg-accent { background-color: var(--color-accent) !important; }

.u-bg-success { background-color: var(--color-success-bg) !important; }
.u-bg-warning { background-color: var(--color-warning-bg) !important; }
.u-bg-danger { background-color: var(--color-danger-bg) !important; }
.u-bg-info { background-color: var(--color-info-bg) !important; }

/* Border Colors */
.u-border-subtle { border-color: var(--color-border-subtle) !important; }
.u-border-default { border-color: var(--color-border-default) !important; }
.u-border-strong { border-color: var(--color-border-strong) !important; }
.u-border-primary { border-color: var(--color-primary) !important; }
.u-border-success { border-color: var(--color-success) !important; }
.u-border-danger { border-color: var(--color-danger) !important; }
```

---

## 4. CSS Cascade Layers (@layer)

### What It Is
Native CSS feature for explicit cascade control (better than ITCSS alone).

### Implementation

**`main.css` with @layer:**
```css
/* =================================================================
   Fireside Capital — Layered Architecture
   Explicit cascade control with @layer
   ================================================================= */

/* Define layer order (lowest to highest specificity) */
@layer reset, base, layout, components, utilities;

/* RESET LAYER — Third-party resets */
@layer reset {
  @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap-reboot.min.css');
}

/* BASE LAYER — Design tokens & element styles */
@layer base {
  @import url('./01-settings/design-tokens.css');
  @import url('./04-elements/typography.css');
  @import url('./04-elements/forms.css');
}

/* LAYOUT LAYER — Structural patterns */
@layer layout {
  @import url('./05-objects/layout.css');
  @import url('./05-objects/media.css');
}

/* COMPONENTS LAYER — UI components */
@layer components {
  @import url('./06-components/c-nav.css');
  @import url('./06-components/c-card.css');
  @import url('./06-components/c-chart.css');
  @import url('./06-components/c-notification.css');
}

/* UTILITIES LAYER — Overrides (always win) */
@layer utilities {
  @import url('./07-utilities/spacing.css');
  @import url('./07-utilities/typography.css');
  @import url('./07-utilities/color.css');
  @import url('./07-utilities/display.css');
}
```

**Benefits:**
- ✅ **Explicit cascade control** — utilities ALWAYS override components
- ✅ **No specificity hacks** — layer order determines priority
- ✅ **Predictable behavior** — `.u-mb-16` beats `.c-card { margin-bottom: 24px; }`
- ✅ **Future-proof** — native CSS feature (100% browser support as of 2023)

### Example Component Using Layers

**`06-components/c-metric.css`:**
```css
@layer components {
  /* Financial Metric Card Component */
  .c-metric {
    padding: var(--space-lg);
    background-color: var(--color-bg-2);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    transition: var(--transition-all);
  }

  .c-metric:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-glow-sm);
    transform: translateY(-2px);
  }

  .c-metric__label {
    margin-bottom: var(--space-2);
    font-size: var(--text-small);
    font-weight: var(--weight-medium);
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: var(--tracking-wide);
  }

  .c-metric__value {
    margin-bottom: var(--space-1);
    font-size: var(--text-h2);
    font-weight: var(--weight-bold);
    color: var(--color-text-primary);
    font-family: var(--font-heading);
  }

  .c-metric__change {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--text-small);
    font-weight: var(--weight-medium);
  }

  .c-metric__change--positive {
    color: var(--color-success);
  }

  .c-metric__change--negative {
    color: var(--color-danger);
  }

  .c-metric__change--neutral {
    color: var(--color-text-tertiary);
  }

  /* Modifiers */
  .c-metric--compact {
    padding: var(--space-md);
  }

  .c-metric--highlighted {
    border-color: var(--color-primary);
    background: linear-gradient(
      135deg,
      var(--color-bg-2) 0%,
      rgba(244, 78, 36, 0.05) 100%
    );
  }
}
```

**Usage in HTML:**
```html
<!-- Financial Metric Component -->
<div class="c-metric c-metric--highlighted u-mb-24">
  <div class="c-metric__label">Net Worth</div>
  <div class="c-metric__value">$847,234</div>
  <div class="c-metric__change c-metric__change--positive">
    <i class="bi bi-arrow-up"></i>
    <span>+$12,450 (1.5%) this month</span>
  </div>
</div>

<!-- Compact variant with utility override -->
<div class="c-metric c-metric--compact u-mb-16">
  <div class="c-metric__label">Cash on Hand</div>
  <div class="c-metric__value">$23,891</div>
</div>
```

---

## 5. Component Documentation System

### Problem
No documented component library. Developers guess at class names and HTML structure.

### Solution
Create a living style guide (HTML file) showcasing all components.

**`app/styleguide.html`:**
```html
<!DOCTYPE html>
<html lang="en" data-bs-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fireside Capital — Component Library</title>
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- Icons -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
  
  <!-- Styles -->
  <link rel="stylesheet" href="assets/css/main.css">
  
  <style>
    /* Styleguide-specific layout */
    .sg-section {
      margin-bottom: 64px;
      padding-bottom: 48px;
      border-bottom: 1px solid var(--color-border-subtle);
    }
    .sg-section:last-child {
      border-bottom: none;
    }
    .sg-header {
      margin-bottom: 32px;
    }
    .sg-title {
      margin-bottom: 8px;
      font-size: var(--text-h2);
      font-weight: var(--weight-bold);
      font-family: var(--font-heading);
    }
    .sg-description {
      color: var(--color-text-secondary);
    }
    .sg-example {
      padding: 32px;
      background-color: var(--color-bg-1);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-lg);
      margin-bottom: 16px;
    }
    .sg-code {
      padding: 16px;
      background-color: var(--color-bg-3);
      border-radius: var(--radius-md);
      font-family: var(--font-mono);
      font-size: 13px;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <div class="o-container" style="max-width: 1200px; margin: 0 auto; padding: 48px 24px;">
    
    <!-- Header -->
    <header style="margin-bottom: 64px; text-align: center;">
      <h1 style="font-size: 3rem; font-weight: 700; font-family: var(--font-heading); margin-bottom: 16px;">
        Fireside Capital Component Library
      </h1>
      <p style="font-size: 1.125rem; color: var(--color-text-secondary);">
        Design system reference for the Fireside Capital Dashboard
      </p>
    </header>

    <!-- Color Tokens -->
    <section class="sg-section">
      <div class="sg-header">
        <h2 class="sg-title">Color Tokens</h2>
        <p class="sg-description">Logo-native brand colors from the Fireside 365 chevron</p>
      </div>

      <div class="u-grid u-grid-cols-4 u-gap-16">
        <div>
          <div style="height: 100px; background-color: var(--color-primary); border-radius: 8px; margin-bottom: 8px;"></div>
          <div class="u-text-sm u-font-medium">Primary (Flame Orange)</div>
          <code class="u-text-xs u-text-tertiary">#f44e24</code>
        </div>
        <div>
          <div style="height: 100px; background-color: var(--color-secondary); border-radius: 8px; margin-bottom: 8px;"></div>
          <div class="u-text-sm u-font-medium">Secondary (Sky Blue)</div>
          <code class="u-text-xs u-text-tertiary">#01a4ef</code>
        </div>
        <div>
          <div style="height: 100px; background-color: var(--color-accent); border-radius: 8px; margin-bottom: 8px;"></div>
          <div class="u-text-sm u-font-medium">Accent (Lime Green)</div>
          <code class="u-text-xs u-text-tertiary">#81b900</code>
        </div>
        <div>
          <div style="height: 100px; background-color: var(--color-tertiary); border-radius: 8px; margin-bottom: 8px;"></div>
          <div class="u-text-sm u-font-medium">Tertiary (Neutral Gray)</div>
          <code class="u-text-xs u-text-tertiary">#4a4a4a</code>
        </div>
      </div>
    </section>

    <!-- Metric Component -->
    <section class="sg-section">
      <div class="sg-header">
        <h2 class="sg-title">Metric Component</h2>
        <p class="sg-description">Display financial metrics with value and change indicators</p>
      </div>

      <div class="sg-example">
        <div class="u-grid u-grid-cols-3 u-gap-24">
          <div class="c-metric">
            <div class="c-metric__label">Net Worth</div>
            <div class="c-metric__value">$847,234</div>
            <div class="c-metric__change c-metric__change--positive">
              <i class="bi bi-arrow-up"></i>
              <span>+1.5% this month</span>
            </div>
          </div>

          <div class="c-metric c-metric--highlighted">
            <div class="c-metric__label">Total Assets</div>
            <div class="c-metric__value">$1,234,567</div>
            <div class="c-metric__change c-metric__change--positive">
              <i class="bi bi-arrow-up"></i>
              <span>+2.3% this month</span>
            </div>
          </div>

          <div class="c-metric">
            <div class="c-metric__label">Total Debts</div>
            <div class="c-metric__value">$387,333</div>
            <div class="c-metric__change c-metric__change--negative">
              <i class="bi bi-arrow-down"></i>
              <span>+0.8% this month</span>
            </div>
          </div>
        </div>
      </div>

      <div class="sg-code">
&lt;div class="c-metric"&gt;
  &lt;div class="c-metric__label"&gt;Net Worth&lt;/div&gt;
  &lt;div class="c-metric__value"&gt;$847,234&lt;/div&gt;
  &lt;div class="c-metric__change c-metric__change--positive"&gt;
    &lt;i class="bi bi-arrow-up"&gt;&lt;/i&gt;
    &lt;span&gt;+1.5% this month&lt;/span&gt;
  &lt;/div&gt;
&lt;/div&gt;
      </div>
    </section>

    <!-- Add more components: Cards, Buttons, Forms, Charts, etc. -->

  </div>
</body>
</html>
```

### Benefits
- ✅ **Visual reference** for all components
- ✅ **Copy-paste code snippets** for rapid development
- ✅ **Design consistency** across pages
- ✅ **Onboarding tool** for new developers

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Reorganize CSS files into ITCSS structure
- [ ] Update `main.css` with `@layer` imports
- [ ] Create utility class files (spacing, typography, display, color)
- [ ] Test existing pages for regressions

### Phase 2: Component Migration (Week 2)
- [ ] Audit existing components (notification, card, nav)
- [ ] Refactor components to BEM naming convention
- [ ] Update HTML templates to use new class names
- [ ] Create `.c-metric` component for financial data

### Phase 3: Documentation (Week 3)
- [ ] Build `styleguide.html` with all components
- [ ] Document component variants and modifiers
- [ ] Add usage examples for each component
- [ ] Screenshot components for quick reference

### Phase 4: Cleanup (Week 4)
- [ ] Remove unused CSS rules
- [ ] Consolidate duplicate styles
- [ ] Run CSS linter (stylelint)
- [ ] Minify production CSS bundle

---

## Code Quality Checklist

Before committing CSS changes:

- [ ] **ITCSS Layer Compliance:** Styles in correct layer folder
- [ ] **BEM Naming:** All component classes follow `.c-block__element--modifier`
- [ ] **Design Tokens:** No hardcoded values (use CSS custom properties)
- [ ] **Utility Classes:** One-purpose utilities with `!important`
- [ ] **Browser Testing:** Tested in Chrome, Firefox, Safari
- [ ] **Mobile Testing:** Responsive breakpoints verified
- [ ] **Accessibility:** Keyboard focus states visible
- [ ] **Performance:** No unused CSS rules

---

## Metrics & Success Criteria

**Before:**
- 9 CSS files, ~4,500 lines
- No naming convention
- Mixed specificity
- Bootstrap overrides scattered

**After (Target):**
- ITCSS structure with 25+ files (organized)
- BEM naming with BEMIT namespaces
- Predictable cascade via `@layer`
- 60+ utility classes for rapid development
- Living style guide with 15+ documented components

**Developer Experience Goals:**
- ✅ New developer can add a component in < 15 minutes
- ✅ Zero specificity conflicts
- ✅ Utility classes cover 80% of layout needs
- ✅ Component HTML copy-paste ready from style guide

---

## References

- **ITCSS:** https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture
- **BEM:** https://getbem.com/introduction/
- **BEMIT Namespaces:** https://csswizardry.com/2015/08/bemit-taking-the-bem-naming-convention-a-step-further/
- **CSS Cascade Layers:** https://developer.mozilla.org/en-US/docs/Web/CSS/@layer
- **Tailwind Utilities Reference:** https://tailwindcss.com/docs/utility-first

---

## Next Steps

1. **Review this report** with the team
2. **Prioritize implementation phases** (start with Phase 1)
3. **Create Azure DevOps work items** for each phase
4. **Assign Builder agent** to execute Phase 1 migration
5. **Schedule UX review** after Phase 2 completion

**Status:** Research complete, ready for implementation planning  
**Estimated Effort:** 4 weeks (1 phase per week)  
**Risk Level:** Low (incremental migration, backward compatible)
