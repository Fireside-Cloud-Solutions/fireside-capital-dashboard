# Bootstrap 5 Dark Theme Customization Guide
**Research Date:** February 10, 2026  
**Researcher:** Capital (Orchestrator Agent)  
**Bootstrap Version:** 5.3.3 (latest stable)  
**Status:** ✅ Complete

---

## Executive Summary

Bootstrap 5.3+ introduces native dark mode support with `data-bs-theme="dark"`. However, Fireside Capital uses a custom dark-first design system with logo-native brand colors. This guide covers optimal integration patterns.

**Current Implementation Score:** A- (Custom design tokens override Bootstrap defaults effectively)

---

## Table of Contents
1. [Bootstrap Dark Mode Overview](#bootstrap-dark-mode-overview)
2. [Fireside Capital Integration](#fireside-capital-integration)
3. [Custom Variable Overrides](#custom-variable-overrides)
4. [Component-Specific Styling](#component-specific-styling)
5. [Theme Switching](#theme-switching)
6. [Performance Considerations](#performance-considerations)

---

## Bootstrap Dark Mode Overview

### Native Bootstrap 5.3+ Dark Mode

Bootstrap 5.3 introduces `data-bs-theme` attribute for theme control:

```html
<!-- Dark theme (global) -->
<html data-bs-theme="dark">

<!-- Or per-component -->
<div data-bs-theme="dark">
  <button class="btn btn-primary">Button</button>
</div>
```

**Default Bootstrap Dark Colors:**
```scss
// Bootstrap 5.3 dark theme variables
$body-bg-dark:          #212529;
$body-color-dark:       #dee2e6;
$border-color-dark:     #495057;
$link-color-dark:       #6ea8fe;
```

**Problem:** Bootstrap defaults don't match Fireside Capital's charcoal-based design system.

---

## Fireside Capital Integration

### Current Approach ✅

Fireside Capital uses **custom CSS variables** that override Bootstrap defaults:

```css
/* design-tokens.css */
:root {
  /* Charcoal-based backgrounds (more refined than Bootstrap's #212529) */
  --color-bg-1: #0f0f0f;  /* Page base */
  --color-bg-2: #1a1a1a;  /* Elevated surface (cards, nav) */
  --color-bg-3: #262626;  /* Active surface (inputs, hover) */
  
  /* Logo-native brand colors */
  --color-primary: #f44e24;   /* Flame Orange */
  --color-secondary: #01a4ef; /* Sky Blue */
  --color-accent: #81b900;    /* Lime Green */
  
  /* Override Bootstrap defaults */
  --bs-body-bg: var(--color-bg-1);
  --bs-body-color: var(--color-text-primary);
  --bs-primary: var(--color-primary);
  --bs-secondary-color: var(--color-text-secondary);
  --bs-border-color: var(--color-border-subtle);
}
```

**Verdict:** ✅ Excellent approach. Custom tokens provide full control while maintaining Bootstrap compatibility.

---

## Custom Variable Overrides

### 1. **Bootstrap Component Variables**

Bootstrap 5.3 uses CSS variables for all components. Override them to match Fireside branding:

```css
/* main.css - Bootstrap overrides */
:root {
  /* ----- BUTTONS ----- */
  --bs-btn-border-radius: 0.5rem; /* 8px (Fireside standard) */
  --bs-btn-font-weight: 600;
  --bs-btn-padding-x: 1.25rem;
  --bs-btn-padding-y: 0.75rem;
  
  /* Primary button (Flame Orange) */
  --bs-btn-bg: var(--color-primary);
  --bs-btn-border-color: var(--color-primary);
  --bs-btn-hover-bg: var(--color-primary-hover);
  --bs-btn-hover-border-color: var(--color-primary-hover);
  --bs-btn-active-bg: var(--color-primary-active);
  
  /* ----- FORMS ----- */
  --bs-form-control-bg: var(--color-bg-3);
  --bs-form-control-color: var(--color-text-primary);
  --bs-form-control-border-color: var(--color-border-default);
  --bs-form-control-focus-border-color: var(--color-secondary);
  --bs-form-control-focus-box-shadow: 0 0 0 0.25rem rgba(1, 164, 239, 0.25);
  
  /* ----- CARDS ----- */
  --bs-card-bg: var(--color-bg-2);
  --bs-card-border-color: var(--color-border-subtle);
  --bs-card-border-radius: 0.75rem; /* 12px */
  
  /* ----- MODALS ----- */
  --bs-modal-bg: var(--color-bg-2);
  --bs-modal-color: var(--color-text-primary);
  --bs-modal-border-color: var(--color-border-subtle);
  --bs-modal-border-radius: 1rem; /* 16px */
  
  /* ----- DROPDOWNS ----- */
  --bs-dropdown-bg: var(--color-bg-2);
  --bs-dropdown-color: var(--color-text-primary);
  --bs-dropdown-border-color: var(--color-border-subtle);
  --bs-dropdown-link-hover-bg: var(--color-bg-3);
  --bs-dropdown-link-active-bg: var(--color-primary-light);
  
  /* ----- TABLES ----- */
  --bs-table-bg: transparent;
  --bs-table-color: var(--color-text-primary);
  --bs-table-border-color: var(--color-border-subtle);
  --bs-table-striped-bg: rgba(var(--color-bg-3-rgb), 0.5);
  --bs-table-hover-bg: rgba(var(--color-primary-rgb), 0.06);
  
  /* ----- ALERTS ----- */
  --bs-alert-border-radius: 0.5rem;
  --bs-alert-padding-x: 1rem;
  --bs-alert-padding-y: 0.75rem;
}
```

---

### 2. **Light Mode Overrides**

Fireside Capital supports light mode toggle. Define light theme variables:

```css
/* Light mode overrides */
body[data-theme='light'] {
  /* Backgrounds */
  --color-bg-1: #f8f9fa;
  --color-bg-2: #ffffff;
  --color-bg-3: #e9ecef;
  
  /* Text */
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #6a6a6a;
  --color-text-tertiary: #999999;
  
  /* Borders */
  --color-border-subtle: #e0e0e0;
  --color-border-default: #d0d0d0;
  --color-border-strong: #b0b0b0;
  
  /* Override Bootstrap variables for light mode */
  --bs-body-bg: #f8f9fa;
  --bs-body-color: #1a1a1a;
  --bs-border-color: #e0e0e0;
  
  /* Component-specific light mode */
  --bs-table-striped-bg: rgba(0, 0, 0, 0.02);
  --bs-table-hover-bg: rgba(1, 164, 239, 0.04);
  --bs-dropdown-link-hover-bg: #f5f5f5;
}
```

---

### 3. **Brand Color Integration**

Map Fireside logo colors to Bootstrap's semantic palette:

```css
:root {
  /* Bootstrap primary → Flame Orange */
  --bs-primary: #f44e24;
  --bs-primary-rgb: 244, 78, 36;
  
  /* Bootstrap secondary → Sky Blue */
  --bs-secondary: #01a4ef;
  --bs-secondary-rgb: 1, 164, 239;
  
  /* Bootstrap success → Lime Green */
  --bs-success: #81b900;
  --bs-success-rgb: 129, 185, 0;
  
  /* Bootstrap warning → Amber (non-logo) */
  --bs-warning: #ffc107;
  --bs-warning-rgb: 255, 193, 7;
  
  /* Bootstrap danger → Red (non-logo) */
  --bs-danger: #dc3545;
  --bs-danger-rgb: 220, 53, 69;
  
  /* Bootstrap info → Sky Blue (same as secondary) */
  --bs-info: #01a4ef;
  --bs-info-rgb: 1, 164, 239;
}
```

**Usage:**
```html
<!-- Uses Flame Orange -->
<button class="btn btn-primary">High Impact CTA</button>

<!-- Uses Sky Blue -->
<button class="btn btn-secondary">Medium Impact Action</button>

<!-- Uses Lime Green -->
<div class="alert alert-success">Goal achieved!</div>
```

---

## Component-Specific Styling

### 1. **Buttons**

Bootstrap buttons with Fireside branding:

```css
/* Button hierarchy (matches AGENTS.md guidance) */

/* PRIMARY: Flame Orange - High impact (1 per page max) */
.btn-primary {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  box-shadow: 0 2px 8px rgba(244, 78, 36, 0.25);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
  box-shadow: 0 4px 12px rgba(244, 78, 36, 0.35);
  transform: translateY(-2px);
}

/* SECONDARY: Sky Blue - Medium impact (2 per page max) */
.btn-secondary {
  background: var(--color-secondary);
  border-color: var(--color-secondary);
  color: white;
}

.btn-secondary:hover {
  background: var(--color-secondary-hover);
  border-color: var(--color-secondary-hover);
  transform: translateY(-2px);
}

/* TERTIARY: Neutral outline - Low impact (unlimited) */
.btn-outline-secondary {
  background: transparent;
  border-color: var(--color-border-default);
  color: var(--color-text-secondary);
}

.btn-outline-secondary:hover {
  background: var(--color-bg-3);
  border-color: var(--color-border-strong);
  color: var(--color-text-primary);
}

/* DANGER: Red outline only (destructive actions) */
.btn-danger {
  background: transparent;
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.btn-danger:hover {
  background: var(--color-danger);
  border-color: var(--color-danger);
  color: white;
}
```

---

### 2. **Forms**

Accessible, theme-aware form controls:

```css
/* Form controls with Fireside branding */
.form-control,
.form-select {
  background-color: var(--color-bg-3);
  border: 2px solid var(--color-border-default);
  color: var(--color-text-primary);
  border-radius: 0.5rem;
  font-size: 1rem;
  padding: 0.75rem 1rem;
  transition: border-color 200ms ease, box-shadow 200ms ease;
}

.form-control:focus,
.form-select:focus {
  background-color: var(--color-bg-3);
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 0.25rem rgba(1, 164, 239, 0.25);
  color: var(--color-text-primary);
}

/* Error state */
.form-control.is-invalid {
  border-color: var(--color-danger);
}

.form-control.is-invalid:focus {
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}

/* Success state */
.form-control.is-valid {
  border-color: var(--color-success);
}

.form-control.is-valid:focus {
  box-shadow: 0 0 0 0.25rem rgba(129, 185, 0, 0.25);
}

/* Placeholder text */
.form-control::placeholder {
  color: var(--color-text-tertiary);
  opacity: 1;
}
```

---

### 3. **Cards**

Financial dashboard cards with proper elevation:

```css
.card {
  background: var(--color-bg-2);
  border-radius: 0.75rem;
  border: 1px solid var(--color-border-subtle);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: box-shadow 200ms ease, transform 200ms ease;
}

.card:hover {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* Card header with subtle separation */
.card-header {
  background-color: var(--color-bg-3);
  border-bottom: 1px solid var(--color-border-subtle);
  padding: 1rem 1.5rem;
}

/* Card body with consistent padding */
.card-body {
  padding: 1.5rem;
}

/* Light mode adjustments */
body[data-theme='light'] .card {
  background: #ffffff;
  border-color: #e0e0e0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}
```

---

### 4. **Modals**

Accessible modals with Fireside branding:

```css
.modal-content {
  background-color: var(--color-bg-2);
  border: 1px solid var(--color-border-subtle);
  border-radius: 1rem;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.5);
}

.modal-header {
  border-bottom: 1px solid var(--color-border-subtle);
  padding: 1.25rem 1.5rem;
}

.modal-title {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 1.5rem;
  color: var(--color-text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  border-top: 1px solid var(--color-border-subtle);
  padding: 1.25rem 1.5rem;
  gap: 0.75rem;
}

/* Close button - visible on dark */
.btn-close {
  filter: invert(1) grayscale(100%) brightness(200%);
}

body[data-theme='light'] .btn-close {
  filter: none;
}
```

---

### 5. **Dropdowns**

Consistent dropdown styling:

```css
.dropdown-menu {
  background-color: var(--color-bg-2);
  border: 1px solid var(--color-border-subtle);
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.3);
  padding: 0.25rem 0;
}

.dropdown-item {
  color: var(--color-text-secondary);
  padding: 0.625rem 1rem;
  transition: all 150ms ease;
}

.dropdown-item:hover,
.dropdown-item:focus {
  background-color: var(--color-bg-3);
  color: var(--color-text-primary);
}

.dropdown-divider {
  border-top-color: var(--color-border-subtle);
  margin: 0.25rem 0;
}
```

---

### 6. **Tables**

Financial data tables with hover states:

```css
.table {
  color: var(--color-text-primary);
  border-color: var(--color-border-subtle);
  --bs-table-bg: transparent;
  --bs-table-striped-bg: rgba(var(--color-bg-3-rgb), 0.5);
  --bs-table-hover-bg: rgba(var(--color-primary-rgb), 0.06);
}

.table th {
  background-color: var(--color-bg-3);
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid var(--color-border-default);
  padding: 1rem 1.25rem;
}

.table td {
  color: var(--color-text-primary);
  border-color: var(--color-border-subtle);
  padding: 1rem 1.25rem;
  vertical-align: middle;
}

.table tbody tr {
  transition: background-color 150ms ease;
}

.table tbody tr:hover {
  background-color: rgba(var(--color-primary-rgb), 0.04);
}
```

---

### 7. **Alerts**

Semantic alerts with Fireside colors:

```css
.alert {
  border-radius: 0.5rem;
  border: 1px solid transparent;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
}

.alert-success {
  background-color: rgba(var(--color-success-rgb), 0.12);
  color: var(--color-success);
  border-color: var(--color-success);
}

.alert-danger {
  background-color: rgba(var(--color-danger-rgb), 0.12);
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.alert-warning {
  background-color: rgba(var(--color-warning-rgb), 0.12);
  color: var(--color-warning);
  border-color: var(--color-warning);
}

.alert-info {
  background-color: rgba(var(--color-info-rgb), 0.12);
  color: var(--color-info);
  border-color: var(--color-info);
}
```

---

## Theme Switching

### 1. **Theme Toggle Implementation**

```javascript
// theme-toggle.js
class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'dark';
    this.init();
  }
  
  init() {
    document.body.dataset.theme = this.currentTheme;
    this.updateBootstrapTheme();
    this.updateCharts();
    this.dispatchThemeChange();
  }
  
  toggle() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', this.currentTheme);
    document.body.dataset.theme = this.currentTheme;
    this.updateBootstrapTheme();
    this.updateCharts();
    this.dispatchThemeChange();
  }
  
  updateBootstrapTheme() {
    // Update Bootstrap data-bs-theme attribute
    document.documentElement.setAttribute('data-bs-theme', this.currentTheme);
  }
  
  updateCharts() {
    // Update Chart.js instances (if present)
    if (window.chartInstances) {
      Object.values(window.chartInstances).forEach(chart => {
        this.applyChartTheme(chart);
      });
    }
  }
  
  applyChartTheme(chart) {
    const colors = this.getChartColors();
    chart.options.scales.x.ticks.color = colors.text;
    chart.options.scales.y.ticks.color = colors.text;
    chart.options.scales.x.grid.color = colors.grid;
    chart.options.scales.y.grid.color = colors.grid;
    chart.options.plugins.legend.labels.color = colors.text;
    chart.update('none');
  }
  
  getChartColors() {
    return this.currentTheme === 'dark' 
      ? { text: '#f0f0f0', grid: '#2a2a2a' }
      : { text: '#1a1a1a', grid: '#e0e0e0' };
  }
  
  dispatchThemeChange() {
    window.dispatchEvent(new CustomEvent('themeChange', {
      detail: { theme: this.currentTheme }
    }));
  }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// Bind to toggle button
document.getElementById('themeToggle')?.addEventListener('click', () => {
  themeManager.toggle();
});
```

**Usage:**
```html
<button id="themeToggle" class="btn btn-outline-secondary btn-icon">
  <i class="bi bi-moon-stars" id="themeIcon"></i>
</button>
```

---

### 2. **Smooth Theme Transitions**

```css
/* Smooth color transitions for theme switch */
* {
  transition: background-color 200ms ease,
              border-color 200ms ease,
              color 200ms ease;
}

/* Disable transitions for reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}
```

---

### 3. **Respect System Preferences**

```javascript
// Auto-detect system theme preference
function detectSystemTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

// Use system preference if no saved theme
const savedTheme = localStorage.getItem('theme');
if (!savedTheme) {
  themeManager.currentTheme = detectSystemTheme();
  themeManager.init();
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    // Only auto-switch if user hasn't set preference
    themeManager.currentTheme = e.matches ? 'dark' : 'light';
    themeManager.init();
  }
});
```

---

## Performance Considerations

### 1. **CSS Custom Properties vs SCSS Variables**

**Recommendation:** ✅ Use CSS custom properties (already implemented)

**Why:**
- **Runtime switching:** Theme changes without page reload
- **JavaScript access:** Can read/modify via `getComputedStyle()`
- **Browser support:** 98%+ (IE11 not supported, but acceptable for 2026)

**SCSS variables** (don't use for theming):
- Compile-time only
- Requires rebuild for theme changes
- Better for structural constants (breakpoints, z-index scale)

---

### 2. **Minimize Specificity Conflicts**

Bootstrap has high specificity for some components. Avoid `!important`:

```css
/* ❌ Bad: !important creates specificity wars */
.card {
  background-color: var(--color-bg-2) !important;
}

/* ✅ Good: Override Bootstrap variables instead */
:root {
  --bs-card-bg: var(--color-bg-2);
}
```

---

### 3. **Lazy Load Bootstrap Components**

Only load Bootstrap JS for components you use:

```html
<!-- Don't load full Bootstrap bundle -->
<!-- <script src="bootstrap.bundle.min.js"></script> -->

<!-- Load only needed components -->
<script src="bootstrap/dropdown.js"></script>
<script src="bootstrap/modal.js"></script>
<script src="bootstrap/toast.js"></script>
```

**Expected savings:** ~40KB (80KB → 40KB)

---

## Testing Recommendations

### 1. **Cross-Theme Visual Regression**

```javascript
// Percy.io or Chromatic tests
describe('Theme Switching', () => {
  it('renders dashboard correctly in dark mode', async () => {
    await page.goto('/index.html');
    await page.evaluate(() => document.body.dataset.theme = 'dark');
    await percySnapshot(page, 'Dashboard - Dark Mode');
  });
  
  it('renders dashboard correctly in light mode', async () => {
    await page.goto('/index.html');
    await page.evaluate(() => document.body.dataset.theme = 'light');
    await percySnapshot(page, 'Dashboard - Light Mode');
  });
});
```

---

### 2. **Contrast Ratio Testing**

```javascript
// Use axe-core for WCAG contrast checks
const axe = require('axe-core');

async function testContrast(theme) {
  await page.evaluate((t) => document.body.dataset.theme = t, theme);
  const results = await page.evaluate(() => axe.run({
    rules: ['color-contrast']
  }));
  
  console.log(`${theme} mode contrast violations:`, results.violations);
}

await testContrast('dark');
await testContrast('light');
```

---

## Conclusion

Fireside Capital's Bootstrap integration is **excellent**. The custom CSS variable system provides full control while maintaining Bootstrap compatibility. Key strengths:

1. ✅ **Custom design tokens** override Bootstrap defaults cleanly
2. ✅ **Logo-native brand colors** mapped to semantic palette
3. ✅ **Dark-first approach** with proper light mode support
4. ✅ **Component-specific styling** maintains consistency

**Recommended Enhancements:**
1. Implement `ThemeManager` class for instant theme switching (2-3 hours)
2. Add smooth transition animations for theme changes (1 hour)
3. Respect system theme preference `prefers-color-scheme` (1 hour)
4. Lazy load Bootstrap JS components (1 hour)

**Estimated ROI:**
- **User Experience:** Instant theme switching without reload
- **Performance:** 40KB smaller JS bundle (lazy loading)
- **Accessibility:** System preference respect
- **Developer Experience:** Centralized theme management

---

**Research Completed:** February 10, 2026  
**Next Review:** After implementing ThemeManager class
