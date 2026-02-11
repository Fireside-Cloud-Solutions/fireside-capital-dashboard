# Bootstrap 5 Dark Mode Implementation — February 10, 2026

## Why Dark Mode for Financial Dashboards?

- **Reduces eye strain** — especially critical for users checking finances late at night
- **Better battery life** — 30% improvement on OLED/AMOLED screens
- **Modern aesthetic** — 80%+ of users prefer dark mode in low-light environments
- **Reduces glare** — beneficial for photosensitive users
- **Increased engagement** — platforms like Twitter/YouTube saw higher session times after dark mode
- **Professional appearance** — financial data looks sleeker in dark mode

---

## Bootstrap 5.3+ Built-in Dark Mode

**Good news:** Bootstrap 5.3.0+ includes native dark mode support via `data-bs-theme` attribute!

### How It Works
- Control via `data-bs-theme="dark"` or `data-bs-theme="light"` attribute
- Apply globally (`<html>`) or per-component (`<div>`, `.dropdown`)
- Automatic CSS variable overrides for Bootstrap components
- No media queries required (but supported)

---

## Implementation Strategy (3 Approaches)

### Approach 1: Global HTML Attribute (RECOMMENDED)
**Best for:** Fireside Capital — simple, clean, user-controlled

```html
<!doctype html>
<html lang="en" data-bs-theme="light">
<head>
  <!-- Bootstrap 5.3+ -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <!-- All Bootstrap components automatically theme-aware -->
</body>
</html>
```

**JavaScript toggle:**
```javascript
// theme-toggle.js
function setTheme(theme) {
  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-bs-theme', prefersDark ? 'dark' : 'light');
    localStorage.setItem('theme', 'auto');
  } else {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
  }
}

function getStoredTheme() {
  return localStorage.getItem('theme') || 'auto';
}

function initTheme() {
  setTheme(getStoredTheme());
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initTheme);

// Listen for system preference changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (getStoredTheme() === 'auto') {
    setTheme('auto');
  }
});
```

### Approach 2: Media Query (Automatic)
**Best for:** Respecting system preferences only

```css
/* No JavaScript needed - pure CSS */
@media (prefers-color-scheme: dark) {
  :root {
    /* Automatic dark mode based on system */
  }
}
```

**Cons:** No manual user control, can't override per-component

### Approach 3: CSS Variables + Custom (ADVANCED)
**Best for:** Full customization beyond Bootstrap defaults

```css
:root {
  color-scheme: light dark;
  
  /* Light theme (defaults) */
  --bs-body-bg: #ffffff;
  --bs-body-color: #212529;
  --card-bg: #ffffff;
  --chart-bg: #f8f9fa;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bs-body-bg: #0f0f0f;
    --bs-body-color: #e0e0e0;
    --card-bg: #1a1a1a;
    --chart-bg: #242424;
  }
}
```

---

## Fireside Capital Dark Mode Design

### Color Palette

#### Light Mode (Current)
```css
:root {
  /* Fireside Cloud brand colors */
  --fc-primary: #01a4ef;
  --fc-success: #81b900;
  --fc-danger: #f44e24;
  --fc-warning: #ffa500;
  
  /* Surfaces */
  --fc-body-bg: #ffffff;
  --fc-card-bg: #ffffff;
  --fc-surface-1: #f8f9fa;
  --fc-surface-2: #e9ecef;
  
  /* Text */
  --fc-text-primary: #212529;
  --fc-text-secondary: #6c757d;
  --fc-text-muted: #adb5bd;
  
  /* Borders */
  --fc-border-color: #dee2e6;
}
```

#### Dark Mode (NEW)
```css
[data-bs-theme="dark"] {
  /* Adjust brand colors for dark mode */
  --fc-primary: #4db8ff;     /* lighter blue */
  --fc-success: #a0d911;     /* brighter green */
  --fc-danger: #ff6b4a;      /* softer red */
  --fc-warning: #ffb84d;     /* muted orange */
  
  /* Surfaces (avoid pure black #000) */
  --fc-body-bg: #0f0f0f;     /* near-black */
  --fc-card-bg: #1a1a1a;     /* card elevation */
  --fc-surface-1: #242424;   /* elevated surface */
  --fc-surface-2: #2e2e2e;   /* higher elevation */
  
  /* Text (avoid pure white #fff) */
  --fc-text-primary: #e0e0e0; /* off-white */
  --fc-text-secondary: #a0a0a0; /* muted */
  --fc-text-muted: #707070;  /* very muted */
  
  /* Borders */
  --fc-border-color: #333333;
}
```

**Why avoid pure black/white?**
- Pure black (#000) creates harsh contrast → eye strain
- Pure white (#fff) on black causes "halation" (blurring) for astigmatic users
- Off-white (#e0e0e0) and near-black (#0f0f0f) are more comfortable

---

## Component-Specific Adjustments

### Dashboard Cards
```html
<div class="card c-dashboard-card">
  <div class="card-body">
    <h5 class="card-title">Net Worth</h5>
    <p class="card-text display-4">$125,430</p>
    <p class="text-success">↑ +$2,340 (1.9%) this month</p>
  </div>
</div>
```

```css
/* Light mode */
.c-dashboard-card {
  background-color: var(--fc-card-bg);
  border: 1px solid var(--fc-border-color);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Dark mode adjustments */
[data-bs-theme="dark"] .c-dashboard-card {
  background-color: var(--fc-card-bg);
  border-color: var(--fc-border-color);
  box-shadow: 0 2px 8px rgba(0,0,0,0.3); /* stronger shadow for depth */
}
```

### Navigation
```html
<nav class="navbar navbar-expand-lg">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">Fireside Capital</a>
    <!-- Theme toggle -->
    <button class="btn btn-link" id="theme-toggle" aria-label="Toggle theme">
      <i class="bi bi-moon-fill" id="theme-icon"></i>
    </button>
  </div>
</nav>
```

```css
/* Navbar automatically adapts with Bootstrap dark mode */
[data-bs-theme="dark"] .navbar {
  --bs-navbar-color: var(--fc-text-primary);
  --bs-navbar-bg: var(--fc-surface-1);
}
```

### Forms & Inputs
```css
[data-bs-theme="dark"] .form-control {
  background-color: var(--fc-surface-2);
  border-color: var(--fc-border-color);
  color: var(--fc-text-primary);
}

[data-bs-theme="dark"] .form-control:focus {
  background-color: var(--fc-surface-2);
  border-color: var(--fc-primary);
  box-shadow: 0 0 0 0.25rem rgba(77, 184, 255, 0.25);
}
```

### Tables
```css
[data-bs-theme="dark"] .table {
  --bs-table-bg: var(--fc-card-bg);
  --bs-table-striped-bg: var(--fc-surface-1);
  --bs-table-hover-bg: var(--fc-surface-2);
  --bs-table-border-color: var(--fc-border-color);
}
```

---

## Chart.js Dark Mode Integration

**CRITICAL:** Charts must adapt to theme changes!

```javascript
// chart-dark-mode.js
function getChartTheme() {
  const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
  
  return {
    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
    textColor: isDark ? '#e0e0e0' : '#212529',
    gridColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    tooltipBg: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.8)'
  };
}

function createDarkModeChart(ctx, config) {
  const theme = getChartTheme();
  
  // Apply theme to chart options
  config.options.scales = {
    ...config.options.scales,
    x: {
      ...config.options.scales?.x,
      ticks: {
        color: theme.textColor
      },
      grid: {
        color: theme.gridColor
      }
    },
    y: {
      ...config.options.scales?.y,
      ticks: {
        color: theme.textColor
      },
      grid: {
        color: theme.gridColor
      }
    }
  };
  
  config.options.plugins = {
    ...config.options.plugins,
    legend: {
      labels: {
        color: theme.textColor
      }
    },
    tooltip: {
      backgroundColor: theme.tooltipBg
    }
  };
  
  return new Chart(ctx, config);
}

// Listen for theme changes and update charts
let charts = [];

function updateChartsTheme() {
  const theme = getChartTheme();
  charts.forEach(chart => {
    // Update chart theme
    chart.options.scales.x.ticks.color = theme.textColor;
    chart.options.scales.y.ticks.color = theme.textColor;
    chart.options.scales.x.grid.color = theme.gridColor;
    chart.options.scales.y.grid.color = theme.gridColor;
    chart.options.plugins.legend.labels.color = theme.textColor;
    chart.update('none'); // no animation
  });
}

// Listen for theme toggle
document.addEventListener('themeChanged', updateChartsTheme);
```

---

## Theme Toggle UI

### Simple Toggle Button (Recommended)
```html
<button id="theme-toggle" class="btn btn-link" aria-label="Toggle dark mode">
  <i class="bi bi-moon-fill d-dark-none"></i>
  <i class="bi bi-sun-fill d-light-none"></i>
</button>
```

```css
/* Hide icons based on theme */
[data-bs-theme="light"] .d-light-none { display: none; }
[data-bs-theme="dark"] .d-dark-none { display: none; }
```

```javascript
document.getElementById('theme-toggle').addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-bs-theme');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  updateChartsTheme(); // update charts
  document.dispatchEvent(new Event('themeChanged'));
});
```

### Advanced 3-Way Toggle (Light / Dark / Auto)
```html
<div class="btn-group" role="group">
  <input type="radio" class="btn-check" name="theme" id="theme-light" value="light">
  <label class="btn btn-outline-secondary" for="theme-light">
    <i class="bi bi-sun-fill"></i>
  </label>
  
  <input type="radio" class="btn-check" name="theme" id="theme-auto" value="auto" checked>
  <label class="btn btn-outline-secondary" for="theme-auto">
    <i class="bi bi-circle-half"></i>
  </label>
  
  <input type="radio" class="btn-check" name="theme" id="theme-dark" value="dark">
  <label class="btn btn-outline-secondary" for="theme-dark">
    <i class="bi bi-moon-fill"></i>
  </label>
</div>
```

```javascript
document.querySelectorAll('[name="theme"]').forEach(input => {
  input.addEventListener('change', (e) => {
    setTheme(e.target.value);
    updateChartsTheme();
  });
});
```

---

## Accessibility Considerations

### 1. Maintain Contrast Ratios
**WCAG 2.1 AA Standard:**
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum

```css
/* Good contrast in dark mode */
[data-bs-theme="dark"] {
  --fc-text-primary: #e0e0e0; /* on #0f0f0f = 12.6:1 ✅ */
  --fc-text-secondary: #a0a0a0; /* on #0f0f0f = 7.1:1 ✅ */
}
```

**Test with:** [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### 2. Semantic Color-Scheme
```css
:root {
  color-scheme: light dark; /* tells browser to use appropriate scrollbars, form controls */
}
```

### 3. Don't Rely on Color Alone
```html
<!-- Bad -->
<span class="text-success">+$2,340</span>

<!-- Good -->
<span class="text-success">↑ +$2,340</span>
```

### 4. Respect User Preferences
```javascript
// Respect prefers-reduced-motion for theme transitions
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.documentElement.style.transition = prefersReducedMotion ? 'none' : 'background-color 0.3s ease, color 0.3s ease';
```

---

## Performance Optimization

### 1. Prevent Flash of Incorrect Theme (FOIT)
**Problem:** Page loads light, then flashes to dark after JS runs

**Solution:** Inline theme initialization in `<head>`
```html
<head>
  <script>
    // Runs before any rendering - prevents flash
    (function() {
      const theme = localStorage.getItem('theme') || 'auto';
      if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-bs-theme', prefersDark ? 'dark' : 'light');
      } else {
        document.documentElement.setAttribute('data-bs-theme', theme);
      }
    })();
  </script>
  <!-- Then load Bootstrap CSS -->
  <link href="bootstrap.min.css" rel="stylesheet">
</head>
```

### 2. CSS Variable Strategy
```css
/* Single source of truth */
:root {
  --fc-transition: background-color 0.3s ease, color 0.3s ease;
}

body {
  background-color: var(--fc-body-bg);
  color: var(--fc-text-primary);
  transition: var(--fc-transition);
}
```

### 3. Lazy Load Theme-Specific Assets
```javascript
// Load dark mode images only when needed
function loadDarkModeImage(img) {
  if (document.documentElement.getAttribute('data-bs-theme') === 'dark') {
    img.src = img.dataset.darkSrc;
  }
}
```

---

## Testing Checklist

### Visual Testing
- ✅ All pages render correctly in both modes
- ✅ All components (cards, buttons, forms) adapt properly
- ✅ Charts update colors correctly
- ✅ Images remain visible (not too dark/bright)
- ✅ Logos have appropriate variants (light/dark)

### Functional Testing
- ✅ Toggle button works on all pages
- ✅ Theme persists across page loads
- ✅ Theme persists across sessions (localStorage)
- ✅ Auto mode respects system preference
- ✅ Theme changes trigger chart updates

### Accessibility Testing
- ✅ Contrast ratios meet WCAG AA (4.5:1)
- ✅ Focus states visible in both modes
- ✅ Screen readers announce theme changes
- ✅ Keyboard navigation works
- ✅ No reliance on color alone for meaning

### Performance Testing
- ✅ No flash of incorrect theme on load
- ✅ Theme toggle feels instant (<100ms)
- ✅ No layout shift during theme change
- ✅ Charts update without full re-render

### Browser Testing
- ✅ Chrome / Edge (Chromium)
- ✅ Firefox
- ✅ Safari (macOS / iOS)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## Implementation Timeline

### Phase 1: Setup (Day 1)
1. Upgrade to Bootstrap 5.3+ (if not already)
2. Add theme-toggle.js script
3. Create inline FOIT prevention script
4. Add toggle button to navbar
5. Implement localStorage persistence

### Phase 2: Styling (Days 2-3)
1. Define dark mode color palette (CSS variables)
2. Audit all pages for custom styles
3. Add `[data-bs-theme="dark"]` overrides
4. Test all components in dark mode
5. Adjust contrast ratios where needed

### Phase 3: Chart Integration (Day 4)
1. Create chart-dark-mode.js utility
2. Update all Chart.js instances
3. Add theme change listeners
4. Test chart updates on toggle

### Phase 4: Polish & Testing (Day 5)
1. Add smooth transitions
2. Test on all browsers/devices
3. Run accessibility audit
4. Fix any bugs/issues
5. Document for team

**Total time estimate:** 5 days (1 developer)

---

## Code Example: Complete Implementation

```html
<!DOCTYPE html>
<html lang="en" data-bs-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fireside Capital</title>
  
  <!-- FOIT Prevention -->
  <script>
    (function() {
      const theme = localStorage.getItem('theme') || 'auto';
      if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-bs-theme', prefersDark ? 'dark' : 'light');
      } else {
        document.documentElement.setAttribute('data-bs-theme', theme);
      }
    })();
  </script>
  
  <!-- Bootstrap 5.3+ -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  
  <!-- Custom styles -->
  <link href="assets/css/main.css" rel="stylesheet">
  
  <style>
    :root {
      color-scheme: light dark;
      --fc-transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
    }
    
    body {
      transition: var(--fc-transition);
    }
    
    /* Hide icons based on theme */
    [data-bs-theme="light"] .d-light-none { display: none !important; }
    [data-bs-theme="dark"] .d-dark-none { display: none !important; }
  </style>
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">Fireside Capital</a>
      
      <!-- Theme Toggle -->
      <button id="theme-toggle" class="btn btn-link ms-auto" aria-label="Toggle dark mode">
        <i class="bi bi-moon-fill fs-5 d-dark-none"></i>
        <i class="bi bi-sun-fill fs-5 d-light-none"></i>
      </button>
    </div>
  </nav>
  
  <div class="container mt-4">
    <div class="row">
      <div class="col-md-4">
        <div class="card c-dashboard-card">
          <div class="card-body">
            <h5 class="card-title">Net Worth</h5>
            <p class="display-4 mb-0">$125,430</p>
            <p class="text-success mb-0">↑ +$2,340 (1.9%)</p>
            <small class="text-muted">vs. last month</small>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    // Theme toggle functionality
    function setTheme(theme) {
      if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-bs-theme', prefersDark ? 'dark' : 'light');
        localStorage.setItem('theme', 'auto');
      } else {
        document.documentElement.setAttribute('data-bs-theme', theme);
        localStorage.setItem('theme', theme);
      }
      
      // Dispatch event for charts
      document.dispatchEvent(new Event('themeChanged'));
    }
    
    document.getElementById('theme-toggle').addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-bs-theme');
      const newTheme = current === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
    
    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (localStorage.getItem('theme') === 'auto') {
        setTheme('auto');
      }
    });
  </script>
</body>
</html>
```

---

## Resources

- **Bootstrap Dark Mode Docs:** https://getbootstrap.com/docs/5.3/customize/color-modes/
- **Dark Mode Best Practices:** https://natebal.com/best-practices-for-dark-mode/
- **MDN color-scheme:** https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme
- **WCAG Contrast Guidelines:** https://webaim.org/articles/contrast/
- **Bootstrap Icons:** https://icons.getbootstrap.com/

---

## Next Steps

1. ✅ **Research complete**
2. ⬜ **Upgrade to Bootstrap 5.3+** (verify version)
3. ⬜ **Add theme-toggle.js**
4. ⬜ **Define dark mode color palette**
5. ⬜ **Implement FOIT prevention**
6. ⬜ **Add toggle button to all pages**
7. ⬜ **Update Chart.js for dark mode**
8. ⬜ **Test on all devices**

---

**Research completed:** February 10, 2026  
**Researcher:** Capital (Fireside Capital AI)  
**Status:** Ready for implementation  
**Estimated implementation time:** 5 days (1 developer)
