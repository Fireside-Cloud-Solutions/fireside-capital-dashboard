# Bootstrap Dark Theme Customization Research
**Research Sprint:** February 16, 2026  
**Status:** ✅ Complete  
**Researcher:** Capital (Orchestrator)

---

## Executive Summary

Fireside Capital dashboard currently uses a custom `data-theme="dark"` implementation. Bootstrap 5.3 introduced official dark mode support via `data-bs-theme`, which provides better integration with Bootstrap components and built-in color variables. Migration recommended.

---

## Current Implementation

**HTML:**
```html
<body data-theme="dark">
```

**CSS:**
```css
/* Scattered across multiple files */
body[data-theme='light'] .text-muted { ... }
body[data-theme='light'] .form-label { ... }
```

**Issues:**
1. ❌ Not using Bootstrap 5.3's official `data-bs-theme` attribute
2. ❌ Manual color overrides in multiple CSS files (maintenance burden)
3. ❌ No theme toggle UI (always dark)
4. ❌ Doesn't respect system preference (`prefers-color-scheme`)
5. ❌ Bootstrap components (modals, toasts, dropdowns) don't automatically adapt

---

## Bootstrap 5.3 Dark Mode (Official)

### How It Works

Bootstrap 5.3+ uses `data-bs-theme` attribute:

```html
<!-- Apply globally -->
<html lang="en" data-bs-theme="dark">

<!-- Or per-component -->
<div class="dropdown" data-bs-theme="dark">...</div>
```

**Benefits:**
- ✅ All Bootstrap components automatically adapt (modals, buttons, forms, etc.)
- ✅ Uses CSS custom properties (`--bs-*` variables) for easy customization
- ✅ Supports light, dark, and custom themes
- ✅ Can be toggled dynamically via JavaScript
- ✅ Respects system preference with media query fallback

---

## Migration Recommendation

### Phase 1: Replace `data-theme` with `data-bs-theme`

**Priority:** High  
**Effort:** 3 hours  
**Impact:** High (better Bootstrap integration)

#### Steps:

1. **Update HTML:**
```html
<!-- Before -->
<body data-theme="dark">

<!-- After -->
<html lang="en" data-bs-theme="dark">
```

2. **Update CSS selectors:**
```css
/* Before */
body[data-theme='dark'] .card {
  background-color: #1a1a1a;
}

/* After */
[data-bs-theme='dark'] .card {
  background-color: var(--bs-body-bg); /* Use Bootstrap variable */
}
```

3. **Remove redundant overrides:**

Many custom dark mode styles can be deleted because Bootstrap now handles them:

```css
/* DELETE these - Bootstrap handles it now */
body[data-theme='dark'] .modal-content { ... }
body[data-theme='dark'] .dropdown-menu { ... }
body[data-theme='dark'] .btn-outline-secondary { ... }
```

4. **Update JavaScript (if any):**
```javascript
// Before
document.body.setAttribute('data-theme', 'dark');

// After
document.documentElement.setAttribute('data-bs-theme', 'dark');
```

---

### Phase 2: Implement Theme Toggle

**Priority:** Medium  
**Effort:** 2 hours  
**Impact:** Medium (user customization)

Add a theme switcher to allow users to choose light/dark/auto modes.

#### UI Implementation:

```html
<!-- Add to navbar (near user dropdown) -->
<div class="dropdown">
  <button class="btn btn-outline-secondary btn-icon" type="button" id="themeToggle" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Toggle theme">
    <i class="bi bi-moon-stars theme-icon" id="themeIcon"></i>
  </button>
  <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="themeToggle">
    <li>
      <button class="dropdown-item" data-bs-theme-value="light">
        <i class="bi bi-sun-fill me-2"></i> Light
      </button>
    </li>
    <li>
      <button class="dropdown-item active" data-bs-theme-value="dark">
        <i class="bi bi-moon-stars-fill me-2"></i> Dark
      </button>
    </li>
    <li>
      <button class="dropdown-item" data-bs-theme-value="auto">
        <i class="bi bi-circle-half me-2"></i> Auto
      </button>
    </li>
  </ul>
</div>
```

#### JavaScript Implementation:

```javascript
// assets/js/theme-toggle.js
(() => {
  'use strict';
  
  // Get/set theme from localStorage
  const getStoredTheme = () => localStorage.getItem('theme');
  const setStoredTheme = theme => localStorage.setItem('theme', theme);
  
  // Determine preferred theme
  const getPreferredTheme = () => {
    const storedTheme = getStoredTheme();
    if (storedTheme) return storedTheme;
    
    // Default to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  
  // Apply theme to document
  const setTheme = theme => {
    const resolvedTheme = theme === 'auto' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    
    document.documentElement.setAttribute('data-bs-theme', resolvedTheme);
    updateThemeIcon(resolvedTheme);
  };
  
  // Update icon in navbar
  const updateThemeIcon = theme => {
    const icon = document.getElementById('themeIcon');
    if (!icon) return;
    
    icon.className = theme === 'dark' 
      ? 'bi bi-moon-stars theme-icon'
      : 'bi bi-sun-fill theme-icon';
  };
  
  // Update active state in dropdown
  const updateActiveButton = theme => {
    document.querySelectorAll('[data-bs-theme-value]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.bsThemeValue === theme);
    });
  };
  
  // Initialize theme on page load (before rendering to avoid flash)
  setTheme(getPreferredTheme());
  
  // Listen for system theme changes (auto mode)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    const storedTheme = getStoredTheme();
    if (storedTheme === 'auto' || !storedTheme) {
      setTheme('auto');
    }
  });
  
  // Theme toggle button listeners (wait for DOM)
  window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-bs-theme-value]').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.bsThemeValue;
        setStoredTheme(theme);
        setTheme(theme);
        updateActiveButton(theme);
      });
    });
    
    updateActiveButton(getStoredTheme() || 'dark');
  });
})();
```

**Load order (critical to prevent flash):**
```html
<head>
  <!-- Load theme JS BEFORE body to prevent flash -->
  <script src="assets/js/theme-toggle.js"></script>
</head>
```

---

### Phase 3: Customize Bootstrap Dark Theme Colors

**Priority:** Low  
**Effort:** 1 hour  
**Impact:** Low (brand alignment)

Override Bootstrap's default dark mode colors to match Fireside brand.

#### CSS Implementation:

```css
/* assets/css/bootstrap-dark-overrides.css */

[data-bs-theme='dark'] {
  /* Background colors (match design-tokens.css) */
  --bs-body-bg: var(--color-bg-1);              /* #0f0f0f */
  --bs-body-bg-rgb: var(--color-bg-1-rgb);
  --bs-secondary-bg: var(--color-bg-2);         /* #1a1a1a */
  --bs-tertiary-bg: var(--color-bg-3);          /* #262626 */
  
  /* Text colors */
  --bs-body-color: var(--color-text-primary);   /* #f0f0f0 */
  --bs-secondary-color: var(--color-text-secondary); /* #b0b0b0 */
  --bs-tertiary-color: var(--color-text-tertiary);   /* #999999 */
  
  /* Border colors */
  --bs-border-color: var(--color-border-subtle);
  --bs-border-color-translucent: rgba(var(--color-border-default), 0.15);
  
  /* Brand colors (use Fireside palette) */
  --bs-primary: var(--color-primary);           /* #f44e24 Orange */
  --bs-primary-rgb: var(--color-primary-rgb);
  --bs-secondary: var(--color-secondary);       /* #01a4ef Blue */
  --bs-secondary-rgb: var(--color-secondary-rgb);
  --bs-success: var(--color-accent);            /* #81b900 Green */
  --bs-success-rgb: var(--color-accent-rgb);
  
  /* Component-specific overrides */
  --bs-dropdown-bg: var(--color-bg-2);
  --bs-dropdown-border-color: var(--color-border-subtle);
  --bs-dropdown-link-hover-bg: var(--color-bg-3);
  
  --bs-modal-bg: var(--color-bg-2);
  --bs-modal-border-color: var(--color-border-default);
  
  --bs-card-bg: var(--color-bg-2);
  --bs-card-border-color: var(--color-border-subtle);
}
```

**Load order:**
```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
<link rel="stylesheet" href="assets/css/design-tokens.css" />
<link rel="stylesheet" href="assets/css/bootstrap-dark-overrides.css" /> <!-- Load AFTER design-tokens -->
<link rel="stylesheet" href="assets/css/main.css" />
```

---

## Light Mode Support (Optional)

If you want to support light mode (not just dark), add light theme overrides:

```css
[data-bs-theme='light'] {
  /* Use lighter backgrounds */
  --bs-body-bg: #ffffff;
  --bs-body-color: #212529;
  
  /* Adjust Fireside brand colors for light mode (higher contrast) */
  --bs-primary: #d94420; /* Darker orange for readability */
  --bs-secondary: #0190d4; /* Darker blue */
  --bs-success: #648e00; /* Darker green */
  
  /* Component adjustments */
  --bs-border-color: #dee2e6;
  --bs-card-bg: #f8f9fa;
}

/* Custom component overrides for light mode */
[data-bs-theme='light'] .stat-card {
  background-color: #ffffff;
  border: 1px solid #dee2e6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

[data-bs-theme='light'] .sidebar {
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
}
```

---

## Testing Checklist

After migration, test:

1. **All pages render correctly** in dark mode (dashboard, assets, bills, etc.)
2. **Bootstrap components** adapt properly:
   - Modals (login, signup)
   - Dropdowns (user menu, notifications)
   - Forms (inputs, selects, checkboxes)
   - Buttons (primary, secondary, outline)
   - Toasts/alerts
3. **Theme toggle works** (light, dark, auto)
4. **System preference respected** (auto mode)
5. **No flash** on page load (theme applied before render)
6. **localStorage persists** theme preference
7. **Chart.js adapts** to theme change (may need to re-render charts)
8. **Accessibility** (keyboard navigation, screen reader announcements)

---

## Performance Considerations

**Before:**
- Custom `data-theme` requires manual overrides for every Bootstrap component
- Maintenance burden (must update CSS when Bootstrap updates)
- Larger CSS file size (redundant overrides)

**After:**
- Bootstrap handles component theming automatically
- Smaller CSS file (delete redundant overrides)
- Better caching (Bootstrap CSS unchanged, only custom overrides)
- Easier to maintain (update Bootstrap variables, not individual selectors)

---

## Migration Effort Summary

| Phase | Priority | Effort | Impact |
|-------|----------|--------|--------|
| Replace `data-theme` → `data-bs-theme` | High | 3h | High |
| Implement theme toggle | Medium | 2h | Medium |
| Customize dark theme colors | Low | 1h | Low |
| **Total** | | **6h** | |

---

## Implementation Plan

1. **Builder:** Migrate `data-theme` to `data-bs-theme` (3h)
   - Update HTML (`<html data-bs-theme="dark">`)
   - Replace CSS selectors (`[data-bs-theme='dark']`)
   - Remove redundant Bootstrap component overrides
   - Test all pages

2. **Builder:** Add theme toggle UI + JS (2h)
   - Create theme toggle dropdown in navbar
   - Implement `theme-toggle.js` (light/dark/auto)
   - Save preference to localStorage
   - Test theme switching

3. **Builder:** Customize dark theme colors (1h)
   - Create `bootstrap-dark-overrides.css`
   - Override Bootstrap variables to match Fireside brand
   - Test visual consistency

4. **Auditor:** Verify accessibility (1h)
   - Test keyboard navigation on theme toggle
   - Verify color contrast in both themes
   - Test screen reader announcements

5. **Verify on live site** per `docs/browser-testing-guide.md`

---

## References

- [Bootstrap 5.3 Color Modes](https://getbootstrap.com/docs/5.3/customize/color-modes/)
- [Bootstrap Dark Mode Examples](https://getbootstrap.com/docs/5.3/examples/)
- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [prefers-color-scheme (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)

---

**Research Status:** ✅ Complete  
**Next Research Topic:** PWA (Progressive Web App) Implementation
