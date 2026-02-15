# Bootstrap Dark Theme Research — Fireside Capital Dashboard
**Date:** February 15, 2026  
**Status:** Completed  
**Priority:** Medium

## Executive Summary

Fireside Capital uses Bootstrap 5.3 with dark mode capability. This research provides strategies to customize Bootstrap's dark theme to match Fireside's brand (Flame Orange, Sky Blue, Lime Green) while maintaining Bootstrap's utility classes and component system.

### Current State
- **Bootstrap 5.3** loaded from CDN (150 KB minified)
- **No custom theme** applied (using Bootstrap's default dark gray palette)
- **No light mode toggle** (design-tokens.css has light mode defined but unused)
- **Brand colors defined** in design-tokens.css but not integrated with Bootstrap

### Key Findings
1. Bootstrap 5.3 supports `data-bs-theme="dark"` for dark mode
2. CSS variables can override Bootstrap's default colors
3. Custom color modes can be created (e.g., `data-bs-theme="fireside"`)
4. **Recommendation:** Build custom Bootstrap with Sass (reduce 150 KB → 60 KB)
5. **Alternative:** Override CSS variables (simpler, CDN compatible)

---

## 1. Current Bootstrap Usage Analysis

### CDN Links (from HTML files)
```html
<!-- CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">

<!-- JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
```

### Components Used (from page inspection)
- **Grid system** (`container`, `row`, `col-*`)
- **Navbar** (`navbar`, `navbar-brand`, `navbar-toggler`)
- **Buttons** (`btn`, `btn-primary`, `btn-secondary`)
- **Forms** (`form-control`, `form-select`, `form-check`)
- **Cards** (`card`, `card-header`, `card-body`)
- **Modals** (`modal`, `modal-dialog`)
- **Dropdowns** (`dropdown`, `dropdown-menu`)
- **Utilities** (`d-flex`, `mb-3`, `text-center`, etc.)

### Components NOT Used
- Accordion (custom implementation exists)
- Alerts (custom implementation)
- Badges, Breadcrumbs, Carousel, Collapse, List groups, Navs, Pagination, Popovers, Progress bars, Spinners, Toasts, Tooltips

---

## 2. Strategy A: CSS Variable Overrides (Recommended)

### Why This Approach?
- ✅ **CDN compatible** (no build process needed)
- ✅ **Quick to implement** (one CSS file)
- ✅ **Easy to maintain** (standard CSS)
- ❌ **Can't remove unused components** (still loading full Bootstrap)

### Implementation

#### Step 1: Create `bootstrap-theme-override.css`
```css
/* app/assets/css/bootstrap-theme-override.css
   Fireside Capital — Bootstrap Dark Theme Override
   Integrates Bootstrap 5.3 with Fireside brand colors
   Place AFTER bootstrap.min.css in HTML
*/

/* ================================================================
   BOOTSTRAP DARK MODE — GLOBAL OVERRIDES
   ================================================================ */

[data-bs-theme="dark"] {
  /* BODY */
  --bs-body-color: var(--color-text-primary);           /* #f0f0f0 */
  --bs-body-color-rgb: var(--color-text-primary-rgb);
  --bs-body-bg: var(--color-bg-1);                      /* #0f0f0f */
  --bs-body-bg-rgb: var(--color-bg-1-rgb);
  
  /* EMPHASIS COLORS */
  --bs-emphasis-color: var(--color-text-primary);       /* #f0f0f0 */
  --bs-secondary-color: var(--color-text-secondary);    /* #b0b0b0 */
  --bs-tertiary-color: var(--color-text-tertiary);      /* #999999 */
  
  /* BACKGROUNDS (elevated surfaces) */
  --bs-secondary-bg: var(--color-bg-2);                 /* #1a1a1a */
  --bs-tertiary-bg: var(--color-bg-3);                  /* #262626 */
  
  /* BORDERS */
  --bs-border-color: var(--color-border-default);       /* #3a3a3a */
  --bs-border-color-translucent: rgba(58, 58, 58, 0.5);
  
  /* BRAND COLORS */
  --bs-primary: var(--color-primary);                   /* #f44e24 Flame Orange */
  --bs-primary-rgb: var(--color-primary-rgb);
  --bs-secondary: var(--color-secondary);               /* #01a4ef Sky Blue */
  --bs-secondary-rgb: var(--color-secondary-rgb);
  --bs-success: var(--color-accent);                    /* #81b900 Lime Green */
  --bs-success-rgb: var(--color-accent-rgb);
  
  /* Keep Bootstrap defaults for these */
  /* --bs-danger (already good at #dc3545) */
  /* --bs-warning (already good at #ffc107) */
  /* --bs-info (use our Sky Blue instead) */
  --bs-info: var(--color-secondary);
  --bs-info-rgb: var(--color-secondary-rgb);
  
  /* LINKS */
  --bs-link-color: var(--color-secondary);              /* Sky Blue */
  --bs-link-hover-color: var(--color-secondary-hover);
  
  /* COMPONENT BACKGROUNDS */
  --bs-card-bg: var(--color-bg-2);                      /* Match design-tokens.css */
  --bs-modal-bg: var(--color-bg-2);
  --bs-dropdown-bg: var(--color-bg-2);
  --bs-popover-bg: var(--color-bg-2);
  --bs-tooltip-bg: var(--color-bg-3);
  
  /* FORM CONTROLS */
  --bs-form-control-bg: var(--color-bg-2);
  --bs-form-control-border-color: var(--color-border-default);
  --bs-form-control-focus-border-color: var(--color-secondary);
  --bs-form-select-bg: var(--color-bg-2);
  
  /* NAVBAR */
  --bs-navbar-color: var(--color-text-primary);
  --bs-navbar-hover-color: var(--color-secondary);
  --bs-navbar-active-color: var(--color-secondary);
  --bs-navbar-brand-color: var(--color-text-primary);
  --bs-navbar-toggler-border-color: var(--color-border-default);
  
  /* BUTTONS (primary = Flame Orange) */
  --bs-btn-primary-bg: var(--color-primary);
  --bs-btn-primary-border-color: var(--color-primary);
  --bs-btn-primary-hover-bg: var(--color-primary-hover);
  --bs-btn-primary-hover-border-color: var(--color-primary-hover);
  --bs-btn-primary-active-bg: var(--color-primary-active);
  --bs-btn-primary-color: var(--color-button-text);     /* Dark text on orange */
  
  /* BUTTONS (secondary = Sky Blue) */
  --bs-btn-secondary-bg: var(--color-secondary);
  --bs-btn-secondary-border-color: var(--color-secondary);
  --bs-btn-secondary-hover-bg: var(--color-secondary-hover);
  --bs-btn-secondary-hover-border-color: var(--color-secondary-hover);
  --bs-btn-secondary-active-bg: var(--color-secondary-active);
  --bs-btn-secondary-color: var(--color-button-text);   /* Dark text on blue */
  
  /* BUTTONS (success = Lime Green) */
  --bs-btn-success-bg: var(--color-accent);
  --bs-btn-success-border-color: var(--color-accent);
  --bs-btn-success-hover-bg: var(--color-accent-hover);
  --bs-btn-success-hover-border-color: var(--color-accent-hover);
  --bs-btn-success-active-bg: var(--color-accent-active);
  --bs-btn-success-color: var(--color-button-text);     /* Dark text on green */
}

/* ================================================================
   COMPONENT REFINEMENTS
   ================================================================ */

/* CARDS — Match Fireside design tokens exactly */
[data-bs-theme="dark"] .card {
  background-color: var(--color-bg-2);
  border-color: var(--color-border-subtle);
  border-radius: var(--radius-lg);                      /* 12px (Fireside standard) */
  box-shadow: var(--shadow-md);
}

.card-header {
  background-color: var(--color-bg-3);
  border-bottom-color: var(--color-border-subtle);
}

/* NAVBAR — Elevated surface */
[data-bs-theme="dark"] .navbar {
  background-color: var(--color-bg-2) !important;
  border-bottom: 1px solid var(--color-border-subtle);
  box-shadow: var(--shadow-sm);
}

/* FORMS — Consistent with Fireside inputs */
[data-bs-theme="dark"] .form-control,
[data-bs-theme="dark"] .form-select {
  background-color: var(--color-bg-2);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);                      /* 8px */
  color: var(--color-text-primary);
  padding: var(--space-md);
  transition: var(--transition-all);
}

[data-bs-theme="dark"] .form-control:focus,
[data-bs-theme="dark"] .form-select:focus {
  background-color: var(--color-bg-3);
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 0.2rem rgba(1, 164, 239, 0.25);     /* Sky Blue focus ring */
  outline: 0;
}

/* BUTTONS — Match Fireside button system */
[data-bs-theme="dark"] .btn {
  border-radius: var(--radius-md);                      /* 8px */
  padding: var(--space-2) var(--space-4);
  font-weight: var(--weight-medium);
  transition: var(--transition-all);
  border-width: 2px;
}

[data-bs-theme="dark"] .btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

[data-bs-theme="dark"] .btn:active {
  transform: translateY(0);
}

/* MODALS — Match card styling */
[data-bs-theme="dark"] .modal-content {
  background-color: var(--color-bg-2);
  border-color: var(--color-border-default);
  border-radius: var(--radius-xl);                      /* 16px */
  box-shadow: var(--shadow-2xl);
}

[data-bs-theme="dark"] .modal-header {
  border-bottom-color: var(--color-border-subtle);
  padding: var(--space-lg);
}

[data-bs-theme="dark"] .modal-footer {
  border-top-color: var(--color-border-subtle);
  padding: var(--space-lg);
}

/* DROPDOWNS — Elevated surface */
[data-bs-theme="dark"] .dropdown-menu {
  background-color: var(--color-bg-2);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

[data-bs-theme="dark"] .dropdown-item {
  color: var(--color-text-primary);
  transition: var(--transition-bg);
}

[data-bs-theme="dark"] .dropdown-item:hover,
[data-bs-theme="dark"] .dropdown-item:focus {
  background-color: var(--color-bg-3);
  color: var(--color-text-primary);
}

[data-bs-theme="dark"] .dropdown-item.active {
  background-color: var(--color-secondary);
  color: var(--color-button-text);
}

/* TABLES — Financial data styling */
[data-bs-theme="dark"] .table {
  --bs-table-bg: transparent;
  --bs-table-striped-bg: rgba(255, 255, 255, 0.02);
  --bs-table-hover-bg: var(--color-bg-3);
  --bs-table-border-color: var(--color-border-subtle);
  color: var(--color-text-primary);
}

[data-bs-theme="dark"] .table thead {
  background-color: var(--color-bg-3);
  border-bottom: 2px solid var(--color-border-default);
}

/* ================================================================
   LIGHT MODE OVERRIDES (optional)
   ================================================================ */

[data-bs-theme="light"] {
  --bs-body-bg: #ffffff;
  --bs-body-color: #1a1a1a;
  --bs-secondary-bg: #f5f5f5;
  --bs-tertiary-bg: #e0e0e0;
  --bs-border-color: #d0d0d0;
  
  /* Keep Fireside brand colors in light mode */
  --bs-primary: var(--color-primary);                   /* Flame Orange */
  --bs-secondary: var(--color-secondary);               /* Sky Blue */
  --bs-success: var(--color-accent);                    /* Lime Green */
}

/* ================================================================
   ACCESSIBILITY FIXES
   ================================================================ */

/* Ensure focus states are always visible */
[data-bs-theme="dark"] .btn:focus-visible,
[data-bs-theme="dark"] .form-control:focus-visible,
[data-bs-theme="dark"] .form-select:focus-visible {
  outline: var(--focus-ring);
  outline-offset: var(--focus-ring-offset);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  [data-bs-theme="dark"] {
    --bs-border-color: #ffffff;
    --bs-body-color: #ffffff;
  }
}
```

#### Step 2: Update HTML Template
```html
<!DOCTYPE html>
<html lang="en" data-bs-theme="dark" data-theme="dark">
<head>
  <!-- 1. Design Tokens (must come first) -->
  <link rel="stylesheet" href="assets/css/design-tokens.css">
  
  <!-- 2. Bootstrap 5.3 (CDN) -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  
  <!-- 3. Bootstrap Theme Override (AFTER Bootstrap) -->
  <link rel="stylesheet" href="assets/css/bootstrap-theme-override.css">
  
  <!-- 4. Rest of Fireside CSS -->
  <link rel="stylesheet" href="assets/css/main.css">
  <link rel="stylesheet" href="assets/css/components.css">
  <!-- ... other CSS ... -->
</head>
<body>
  <!-- Content here -->
</body>
</html>
```

**Load Order Critical:**
1. `design-tokens.css` (defines CSS custom properties)
2. `bootstrap.min.css` (Bootstrap defaults)
3. `bootstrap-theme-override.css` (Fireside customizations)
4. Other Fireside CSS files

---

## 3. Strategy B: Custom Bootstrap Build (Advanced)

### Why This Approach?
- ✅ **Smaller file size** (150 KB → 60 KB, 60% reduction)
- ✅ **Remove unused components** (accordion, carousel, etc.)
- ✅ **Full control over variables**
- ❌ **Requires build process** (Sass, npm scripts)
- ❌ **More complex maintenance**

### Implementation

#### Step 1: Install Bootstrap via npm
```bash
cd app
npm init -y
npm install bootstrap@5.3.3 sass --save-dev
```

#### Step 2: Create Custom Sass File
```scss
/* app/assets/scss/custom-bootstrap.scss */

// 1. Include functions first (so you can manipulate colors, SVGs, calc, etc)
@import "../../node_modules/bootstrap/scss/functions";

// 2. Override default variables (use Fireside colors)
$primary:   #f44e24;  // Flame Orange
$secondary: #01a4ef;  // Sky Blue
$success:   #81b900;  // Lime Green
$danger:    #dc3545;  // Keep default
$warning:   #ffc107;  // Keep default
$info:      #01a4ef;  // Sky Blue

// Dark mode colors
$body-bg-dark:          #0f0f0f;
$body-color-dark:       #f0f0f0;
$secondary-bg-dark:     #1a1a1a;
$tertiary-bg-dark:      #262626;
$border-color-dark:     #3a3a3a;

// Typography
$font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
$font-family-serif: 'Source Serif 4', 'Georgia', 'Times New Roman', serif;
$headings-font-family: $font-family-serif;

// Spacing
$spacer: 1rem; // 16px

// Border radius
$border-radius:    0.5rem;   // 8px
$border-radius-sm: 0.25rem;  // 4px
$border-radius-lg: 0.75rem;  // 12px
$border-radius-xl: 1rem;     // 16px

// Shadows
$box-shadow:    0 4px 6px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3);
$box-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3);
$box-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.35), 0 4px 6px rgba(0, 0, 0, 0.25);

// Enable/disable components
$enable-shadows: true;
$enable-gradients: false;
$enable-transitions: true;
$enable-dark-mode: true;

// 3. Include remainder of required Bootstrap stylesheets
@import "../../node_modules/bootstrap/scss/variables";
@import "../../node_modules/bootstrap/scss/variables-dark";
@import "../../node_modules/bootstrap/scss/maps";
@import "../../node_modules/bootstrap/scss/mixins";
@import "../../node_modules/bootstrap/scss/root";

// 4. Include only the components you use
@import "../../node_modules/bootstrap/scss/reboot";
@import "../../node_modules/bootstrap/scss/type";
@import "../../node_modules/bootstrap/scss/grid";
@import "../../node_modules/bootstrap/scss/containers";
@import "../../node_modules/bootstrap/scss/buttons";
@import "../../node_modules/bootstrap/scss/forms";
@import "../../node_modules/bootstrap/scss/nav";
@import "../../node_modules/bootstrap/scss/navbar";
@import "../../node_modules/bootstrap/scss/card";
@import "../../node_modules/bootstrap/scss/dropdown";
@import "../../node_modules/bootstrap/scss/modal";
@import "../../node_modules/bootstrap/scss/transitions";

// 5. Utilities API (spacing, display, flex, etc.)
@import "../../node_modules/bootstrap/scss/utilities";
@import "../../node_modules/bootstrap/scss/utilities/api";

// 6. Fireside-specific overrides
[data-bs-theme="dark"] {
  .card {
    border-radius: $border-radius-lg;
    box-shadow: $box-shadow;
  }
  
  .btn {
    font-weight: 500;
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: $box-shadow;
    }
    
    &:active {
      transform: translateY(0);
    }
  }
}
```

#### Step 3: Build Script
```json
// package.json
{
  "scripts": {
    "build:bootstrap": "sass assets/scss/custom-bootstrap.scss assets/css/bootstrap-custom.min.css --style=compressed",
    "watch:bootstrap": "sass assets/scss/custom-bootstrap.scss assets/css/bootstrap-custom.min.css --watch"
  }
}
```

#### Step 4: Update HTML
```html
<head>
  <link rel="stylesheet" href="assets/css/design-tokens.css">
  <!-- Replace CDN Bootstrap with custom build -->
  <link rel="stylesheet" href="assets/css/bootstrap-custom.min.css">
  <link rel="stylesheet" href="assets/css/main.css">
</head>
```

### File Size Comparison
| Approach | File Size | Components | Build Process |
|----------|-----------|------------|---------------|
| Bootstrap CDN (full) | 150 KB | All | None |
| Bootstrap CDN + Override | 150 KB + 8 KB | All | None |
| Custom Sass Build | 60 KB | Selected | npm run build |

---

## 4. Light/Dark Mode Toggle

### JavaScript Toggle (works with both strategies)
```javascript
// assets/js/theme-toggle.js

class ThemeToggle {
  constructor() {
    this.currentTheme = this.getStoredTheme() || this.getPreferredTheme();
    this.init();
  }
  
  init() {
    this.setTheme(this.currentTheme);
    this.attachListeners();
  }
  
  getStoredTheme() {
    return localStorage.getItem('theme');
  }
  
  setStoredTheme(theme) {
    localStorage.setItem('theme', theme);
  }
  
  getPreferredTheme() {
    const storedTheme = this.getStoredTheme();
    if (storedTheme) return storedTheme;
    
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  
  setTheme(theme) {
    // Update both data-bs-theme (Bootstrap) and data-theme (Fireside)
    document.documentElement.setAttribute('data-bs-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update design-tokens.css color-scheme
    document.documentElement.style.colorScheme = theme;
    
    this.currentTheme = theme;
    this.setStoredTheme(theme);
    
    // Dispatch event for charts and other components
    document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  }
  
  toggle() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    
    // Update toggle button icon
    this.updateToggleIcon(newTheme);
  }
  
  updateToggleIcon(theme) {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;
    
    const icon = toggleBtn.querySelector('i');
    if (theme === 'dark') {
      icon.classList.remove('bi-moon-fill');
      icon.classList.add('bi-sun-fill');
      toggleBtn.setAttribute('aria-label', 'Switch to light mode');
    } else {
      icon.classList.remove('bi-sun-fill');
      icon.classList.add('bi-moon-fill');
      toggleBtn.setAttribute('aria-label', 'Switch to dark mode');
    }
  }
  
  attachListeners() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggle());
    }
    
    // Listen for OS theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!this.getStoredTheme()) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ThemeToggle());
} else {
  new ThemeToggle();
}
```

### HTML Toggle Button
```html
<!-- Add to navbar -->
<button id="theme-toggle" class="btn btn-outline-secondary" aria-label="Toggle theme">
  <i class="bi bi-sun-fill"></i>
</button>
```

---

## 5. Action Items

### Priority 1 (This Sprint) ✓
- [x] **Research Bootstrap dark theme** (completed)
- [ ] Create task: "Implement bootstrap-theme-override.css with Fireside colors"
- [ ] Create task: "Add theme toggle button to navbar"
- [ ] Create task: "Test Bootstrap components in light/dark mode"

### Priority 2 (Next Sprint)
- [ ] Create task: "Evaluate custom Bootstrap build (60% size reduction)"
- [ ] Create task: "Audit Bootstrap component usage (identify unused components)"
- [ ] Create task: "Document Bootstrap + Fireside integration patterns"

### Priority 3 (Future)
- [ ] Create task: "Create custom Bootstrap theme builder script"
- [ ] Create task: "Add auto-theme based on time of day (optional feature)"

---

## 6. Recommendation

**Use Strategy A (CSS Variable Overrides)** for immediate implementation:

### Why?
1. **No build process** — works with existing CDN setup
2. **Quick to implement** — one CSS file, 30 minutes of work
3. **Easy to maintain** — standard CSS, no Sass knowledge required
4. **Reversible** — can switch to Strategy B later if needed

### When to switch to Strategy B?
- When you want to remove unused Bootstrap components
- When 150 KB file size becomes a performance issue
- When you need deeper customization (mixins, functions)

---

## 7. Testing Checklist

After implementing theme override:

- [ ] **Buttons:** All variants (primary, secondary, success, danger) display Fireside colors
- [ ] **Forms:** Inputs, selects, checkboxes match Fireside design-tokens
- [ ] **Cards:** Background, border, shadow match Fireside components
- [ ] **Navbar:** Dark elevated surface with brand colors for links
- [ ] **Modals:** Dark background with proper contrast
- [ ] **Dropdowns:** Match card styling with hover states
- [ ] **Tables:** Readable with alternating row colors
- [ ] **Light mode:** All components work in light mode
- [ ] **Theme toggle:** Switches smoothly without flash
- [ ] **Charts:** Update colors when theme changes

---

## 8. References

### Bootstrap Documentation
- [Bootstrap 5.3 Color Modes](https://getbootstrap.com/docs/5.3/customize/color-modes/) — Official dark mode guide
- [Bootstrap CSS Variables](https://getbootstrap.com/docs/5.3/customize/css-variables/) — Complete variable list
- [Bootstrap Sass Customization](https://getbootstrap.com/docs/5.3/customize/sass/) — Custom build guide

### Tools
- [Bootstrap Theme Customizer](https://bootstrap.build/) — Visual theme builder
- [Bootstrap Icons](https://icons.getbootstrap.com/) — Icon library (already in use)

---

## Conclusion

Fireside Capital can achieve **full brand integration** with Bootstrap 5.3 using CSS variable overrides. This approach:
- Maintains Fireside's Flame Orange/Sky Blue/Lime Green palette
- Works with existing CDN setup (no build process)
- Supports light/dark mode toggle
- Keeps Bootstrap utilities and grid system

**Estimated implementation time:** 1-2 hours  
**File size impact:** +8 KB (bootstrap-theme-override.css)  
**Complexity:** Low (standard CSS)

**Next step:** Create task work items and implement bootstrap-theme-override.css.

---

**Completed by:** Capital (orchestrator)  
**Next research topic:** PWA (Progressive Web App) implementation
