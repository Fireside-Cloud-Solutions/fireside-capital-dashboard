# Bootstrap 5.3 Dark Mode Implementation
**Date:** February 13, 2026  
**Status:** Complete  
**Tags:** research, bootstrap, dark-mode, theming, sprint

## Summary
Researched Bootstrap 5.3 native dark mode implementation (released v5.3.0). Bootstrap now has **built-in dark mode support** via `data-bs-theme` attribute with CSS custom properties. No custom CSS rewriting needed!

## Key Finding: Bootstrap 5.3+ Has Native Dark Mode! 🎉

**Before v5.3:** Required complete CSS rewriting, SASS variable overrides, nightmare.  
**After v5.3:** Add `data-bs-theme="dark"` to `<html>` element. Done.

---

## How Bootstrap Dark Mode Works

### 1. data-bs-theme Attribute (Recommended)
**Global dark mode:**
```html
<!doctype html>
<html lang="en" data-bs-theme="dark">
  <head>
    <link href="bootstrap.min.css" rel="stylesheet">
  </head>
  <body>
    <!-- Everything is dark -->
  </body>
</html>
```

**Component-level override:**
```html
<html data-bs-theme="dark">
  <!-- Global dark theme -->
  
  <div class="dropdown" data-bs-theme="light">
    <!-- This dropdown stays light -->
  </div>
</html>
```

### 2. CSS Custom Properties
Bootstrap 5.3 defines dozens of CSS variables that change based on `data-bs-theme`:

```css
/* Light mode (default) */
:root {
  --bs-body-bg: #ffffff;
  --bs-body-color: #212529;
  --bs-border-color: #dee2e6;
}

/* Dark mode */
[data-bs-theme="dark"] {
  --bs-body-bg: #212529;
  --bs-body-color: #dee2e6;
  --bs-border-color: #495057;
}
```

### 3. JavaScript Theme Toggle (Official Bootstrap Code)
```javascript
/*!
 * Color mode toggler for Bootstrap's docs
 * Copyright 2011-2025 The Bootstrap Authors
 * Licensed under CC BY 3.0
 */

(() => {
  'use strict';
  
  const getStoredTheme = () => localStorage.getItem('theme');
  const setStoredTheme = theme => localStorage.setItem('theme', theme);
  
  const getPreferredTheme = () => {
    const storedTheme = getStoredTheme();
    if (storedTheme) {
      return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  
  const setTheme = theme => {
    if (theme === 'auto') {
      document.documentElement.setAttribute('data-bs-theme', 
        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      );
    } else {
      document.documentElement.setAttribute('data-bs-theme', theme);
    }
  };
  
  // Set theme on page load
  setTheme(getPreferredTheme());
  
  // Listen for OS theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const storedTheme = getStoredTheme();
    if (storedTheme !== 'light' && storedTheme !== 'dark') {
      setTheme(getPreferredTheme());
    }
  });
  
  // Theme toggle button click handler
  window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-bs-theme-value]').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const theme = toggle.getAttribute('data-bs-theme-value');
        setStoredTheme(theme);
        setTheme(theme);
      });
    });
  });
})();
```

---

## Bootstrap Dark Mode Variables (Key Ones)

| Variable | Light | Dark |
|----------|-------|------|
| `--bs-body-bg` | #ffffff | #212529 |
| `--bs-body-color` | #212529 | #dee2e6 |
| `--bs-secondary-bg` | #e9ecef | #343a40 |
| `--bs-tertiary-bg` | #f8f9fa | #2b3035 |
| `--bs-border-color` | #dee2e6 | #495057 |
| `--bs-link-color` | #0d6efd | #6ea8fe |
| `--bs-link-hover-color` | #0a58ca | #8bb9fe |

**Full list:** https://getbootstrap.com/docs/5.3/customize/color-modes/#variables

---

## Implementation for Fireside Capital

### Phase 1: Enable Basic Dark Mode (15 min)

**Step 1: Add theme toggle button**
```html
<!-- app/index.html (navbar) -->
<div class="d-flex align-items-center">
  <button id="themeToggle" class="btn btn-link text-decoration-none" 
          aria-label="Toggle theme">
    <i class="bi bi-moon-stars" id="themeIcon"></i>
  </button>
</div>
```

**Step 2: Add theme toggle script**
```javascript
// app/assets/js/theme.js
(function() {
  'use strict';
  
  const THEME_KEY = 'firesideCapitalTheme';
  
  const getStoredTheme = () => localStorage.getItem(THEME_KEY);
  const setStoredTheme = theme => localStorage.setItem(THEME_KEY, theme);
  
  const getPreferredTheme = () => {
    const stored = getStoredTheme();
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  
  const setTheme = theme => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    updateIcon(theme);
  };
  
  const updateIcon = theme => {
    const icon = document.getElementById('themeIcon');
    if (!icon) return;
    
    if (theme === 'dark') {
      icon.className = 'bi bi-sun-fill';
    } else {
      icon.className = 'bi bi-moon-stars';
    }
  };
  
  // Set on load (before page renders to prevent flash)
  setTheme(getPreferredTheme());
  
  // Toggle button handler
  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;
    
    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-bs-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      setStoredTheme(next);
      setTheme(next);
    });
  });
  
  // Listen for OS preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!getStoredTheme()) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
})();
```

**Step 3: Add to all pages**
```html
<!-- Add to <head> BEFORE other stylesheets (prevents flash) -->
<script src="assets/js/theme.js"></script>
```

---

### Phase 2: Custom Financial Dashboard Colors (30 min)

Bootstrap's default dark mode uses grays. For financial dashboards, we need custom colors for:
- Positive values (green)
- Negative values (red)
- Brand colors (Fireside blue/orange)

**Create custom theme overrides:**
```css
/* app/assets/css/theme-dark.css */

[data-bs-theme="dark"] {
  /* Financial colors */
  --color-positive: #28a745; /* Brighter green for dark bg */
  --color-negative: #dc3545; /* Brighter red */
  --color-neutral: #6c757d;
  
  /* Brand colors (adjusted for dark mode) */
  --color-brand-blue: #2eb8ff; /* Lighter blue */
  --color-brand-orange: #ff6b4a; /* Lighter orange */
  --color-brand-green: #9bd900; /* Lighter green */
  
  /* Card backgrounds (slightly lighter than body) */
  --bs-card-bg: #2c2f36;
  --bs-card-border-color: #495057;
  
  /* Chart backgrounds */
  --chart-bg: #1a1d23;
  --chart-grid-color: #495057;
  --chart-text-color: #dee2e6;
}
```

**Use in components:**
```css
.c-dashboard-card__value--positive {
  color: var(--color-positive);
}

.c-dashboard-card__value--negative {
  color: var(--color-negative);
}

.c-stat-card {
  background-color: var(--bs-card-bg);
  border-color: var(--bs-card-border-color);
  color: var(--bs-body-color);
}
```

---

### Phase 3: Chart.js Dark Mode Integration (15 min)

Update Chart.js colors when theme changes:

```javascript
// app/assets/js/modules/charts.js

function getChartColors(theme) {
  const isDark = theme === 'dark';
  
  return {
    text: isDark ? '#dee2e6' : '#212529',
    grid: isDark ? '#495057' : '#dee2e6',
    positive: isDark ? '#28a745' : '#28a745',
    negative: isDark ? '#dc3545' : '#dc3545',
    brandBlue: isDark ? '#2eb8ff' : '#01a4ef',
    brandOrange: isDark ? '#ff6b4a' : '#f44e24'
  };
}

function updateChartTheme(chart, theme) {
  const colors = getChartColors(theme);
  
  // Update scales
  if (chart.options.scales) {
    Object.keys(chart.options.scales).forEach(scaleKey => {
      const scale = chart.options.scales[scaleKey];
      if (scale.ticks) scale.ticks.color = colors.text;
      if (scale.grid) scale.grid.color = colors.grid;
    });
  }
  
  // Update legend
  if (chart.options.plugins?.legend?.labels) {
    chart.options.plugins.legend.labels.color = colors.text;
  }
  
  // Update dataset colors (if needed)
  chart.data.datasets.forEach(dataset => {
    // Only update if using theme colors (not custom colors)
    if (dataset.useThemeColors) {
      dataset.borderColor = colors.brandBlue;
      dataset.backgroundColor = colors.brandBlue + '33'; // 20% opacity
    }
  });
  
  chart.update('none'); // Update without animation
}

// Listen for theme changes
document.addEventListener('DOMContentLoaded', () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'data-bs-theme') {
        const theme = document.documentElement.getAttribute('data-bs-theme');
        
        // Update all charts
        Object.values(window.chartInstances || {}).forEach(chart => {
          updateChartTheme(chart, theme);
        });
      }
    });
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-bs-theme']
  });
});
```

---

### Phase 4: Prevent Flash of Unstyled Content (FOUC)

**Problem:** Page loads in light mode, then flashes to dark mode.  
**Solution:** Set theme in `<head>` before any content renders.

```html
<!-- Add inline at TOP of <head> (before any CSS) -->
<script>
  (function() {
    const theme = localStorage.getItem('firesideCapitalTheme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-bs-theme', theme);
  })();
</script>
```

---

## Custom Color Mode (Optional)

Create a "Fireside" theme with brand colors:

```css
[data-bs-theme="fireside"] {
  --bs-body-bg: #0a1628; /* Deep navy */
  --bs-body-color: #e9ecef;
  --bs-primary: #01a4ef; /* Fireside blue */
  --bs-secondary: #f44e24; /* Fireside orange */
  --bs-success: #81b900; /* Fireside green */
  
  --bs-link-color: #01a4ef;
  --bs-link-hover-color: #0284c7;
  
  --bs-card-bg: #1a2332;
  --bs-border-color: #2c3e50;
}
```

**Usage:**
```html
<html data-bs-theme="fireside">
```

---

## Theme Toggle UI Patterns

### 1. Icon Button (Simple)
```html
<button id="themeToggle" class="btn btn-link">
  <i class="bi bi-moon-stars"></i>
</button>
```

### 2. Dropdown (Light/Dark/Auto)
```html
<div class="dropdown">
  <button class="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown">
    <i class="bi bi-circle-half"></i> Theme
  </button>
  <ul class="dropdown-menu">
    <li><a class="dropdown-item" data-bs-theme-value="light">☀️ Light</a></li>
    <li><a class="dropdown-item" data-bs-theme-value="dark">🌙 Dark</a></li>
    <li><a class="dropdown-item" data-bs-theme-value="auto">💻 Auto</a></li>
  </ul>
</div>
```

### 3. Toggle Switch
```html
<div class="form-check form-switch">
  <input class="form-check-input" type="checkbox" id="themeSwitch">
  <label class="form-check-label" for="themeSwitch">Dark Mode</label>
</div>
```

---

## Testing Checklist

### Visual Testing
- [ ] All pages render correctly in dark mode
- [ ] Cards have sufficient contrast
- [ ] Charts use dark-mode-appropriate colors
- [ ] Forms are readable (inputs, labels, placeholders)
- [ ] Modals and dropdowns have proper backgrounds
- [ ] Icons/SVGs are visible
- [ ] Tables have readable alternating rows

### Functional Testing
- [ ] Theme persists across page reloads
- [ ] Theme syncs with OS preference (if no stored preference)
- [ ] OS preference change updates theme (if auto mode)
- [ ] Charts update when theme changes
- [ ] No flash of unstyled content (FOUC)

### Accessibility Testing
- [ ] Color contrast ratios meet WCAG 2.1 AA (4.5:1 text, 3:1 UI)
- [ ] Theme toggle has aria-label
- [ ] Focus states visible in both modes
- [ ] Screen readers announce theme changes

---

## Common Issues & Solutions

### Issue 1: Chart Colors Don't Update
**Problem:** Charts stay light when switching to dark mode.  
**Solution:** Add MutationObserver to watch `data-bs-theme` and update Chart.js instances.

### Issue 2: Custom Components Stay Light
**Problem:** Custom CSS classes don't inherit Bootstrap variables.  
**Solution:** Use `var(--bs-body-bg)` instead of hardcoded colors.

**Before:**
```css
.custom-card {
  background-color: #ffffff;
  color: #212529;
}
```

**After:**
```css
.custom-card {
  background-color: var(--bs-body-bg);
  color: var(--bs-body-color);
}
```

### Issue 3: Flash of Light Mode on Load
**Problem:** Page loads light, then switches to dark.  
**Solution:** Set theme in inline `<script>` at top of `<head>`.

---

## Implementation Tasks
- [ ] Add Bootstrap 5.3 color mode toggle script
- [ ] Create theme toggle button in navbar
- [ ] Add custom financial dashboard color overrides
- [ ] Update Chart.js to respond to theme changes
- [ ] Add inline script to prevent FOUC
- [ ] Test all pages in both modes
- [ ] Validate WCAG contrast ratios
- [ ] Update README with theme documentation

---

## Resources
- **Bootstrap 5.3 Color Modes:** https://getbootstrap.com/docs/5.3/customize/color-modes/
- **Official Toggle Code:** https://getbootstrap.com/docs/5.3/customize/color-modes/#javascript
- **Practical Guide:** https://www.ayush.nz/2022/01/practical-light-dark-mode-jekyll-bootstrap5
- **Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **Bootstrap Icons:** https://icons.getbootstrap.com/

---

## Key Takeaways
1. **Bootstrap 5.3+ has native dark mode** - No custom SASS rewriting needed
2. **Use `data-bs-theme` attribute** - Toggle globally or per-component
3. **Leverage CSS custom properties** - `var(--bs-body-bg)` automatically updates
4. **Persist preference** - Store in localStorage, respect OS preference as default
5. **Update Chart.js colors** - Watch `data-bs-theme` with MutationObserver
6. **Prevent FOUC** - Set theme inline in `<head>` before any CSS loads

**For Fireside Capital:** Bootstrap 5.3's built-in dark mode makes this a 1-2 hour implementation instead of days of custom CSS work.
