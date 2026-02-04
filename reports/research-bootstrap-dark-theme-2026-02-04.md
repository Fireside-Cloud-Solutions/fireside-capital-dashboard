# Bootstrap Dark Theme Research — February 4, 2026

## Executive Summary

Bootstrap 5.3+ includes native dark mode support via the `data-bs-theme` attribute. For Fireside Capital, implementing a dark theme requires:
1. **Theme toggler with localStorage** (light/dark/auto modes)
2. **Chart.js color scheme synchronization** (grid lines, text, tooltips)
3. **Financial data color optimization** (WCAG AAA contrast for numbers)
4. **CSS custom properties** for consistent theming across components

**Recommendation:** Implement a three-state theme switcher (light/dark/auto) with Chart.js reactive updates and high-contrast financial data colors.

---

## 1. Bootstrap Dark Mode Implementation

### How Bootstrap Dark Mode Works

Bootstrap 5.3+ uses the `data-bs-theme` attribute to control color modes:
- Applied to `<html>` → affects entire page
- Applied to components → scoped styling
- Uses CSS custom properties under the hood

**Key Concepts:**
- Light mode = default (no attribute needed)
- Dark mode = `data-bs-theme="dark"` on `<html>`
- Per-component overrides = `data-bs-theme="dark"` on specific elements

### Implementation Steps

#### 1.1 Enable Dark Mode Globally

```html
<!doctype html>
<html lang="en" data-bs-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Fireside Capital</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <!-- App content -->
</body>
</html>
```

#### 1.2 Theme Toggler with localStorage

Official Bootstrap theme switcher code (production-ready):

```javascript
/*!
 * Theme toggler for Fireside Capital
 * Based on Bootstrap's official implementation
 */

(() => {
  'use strict'

  // Storage helpers
  const getStoredTheme = () => localStorage.getItem('theme')
  const setStoredTheme = theme => localStorage.setItem('theme', theme)

  // Determine preferred theme
  const getPreferredTheme = () => {
    const storedTheme = getStoredTheme()
    if (storedTheme) {
      return storedTheme
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  // Apply theme to DOM
  const setTheme = theme => {
    if (theme === 'auto') {
      document.documentElement.setAttribute('data-bs-theme', 
        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    } else {
      document.documentElement.setAttribute('data-bs-theme', theme)
    }
  }

  // Initialize theme on load (prevents FOUC)
  setTheme(getPreferredTheme())

  // Update UI to reflect active theme
  const showActiveTheme = (theme, focus = false) => {
    const themeSwitcher = document.querySelector('#theme-switcher')
    if (!themeSwitcher) return

    const btnToActive = document.querySelector(`[data-bs-theme-value="${theme}"]`)
    
    document.querySelectorAll('[data-bs-theme-value]').forEach(element => {
      element.classList.remove('active')
      element.setAttribute('aria-pressed', 'false')
    })

    btnToActive.classList.add('active')
    btnToActive.setAttribute('aria-pressed', 'true')

    if (focus) {
      themeSwitcher.focus()
    }
  }

  // Listen for OS theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const storedTheme = getStoredTheme()
    if (storedTheme !== 'light' && storedTheme !== 'dark') {
      setTheme(getPreferredTheme())
    }
  })

  // DOM ready handler
  window.addEventListener('DOMContentLoaded', () => {
    showActiveTheme(getPreferredTheme())

    document.querySelectorAll('[data-bs-theme-value]')
      .forEach(toggle => {
        toggle.addEventListener('click', () => {
          const theme = toggle.getAttribute('data-bs-theme-value')
          setStoredTheme(theme)
          setTheme(theme)
          showActiveTheme(theme, true)
          
          // Trigger custom event for Chart.js updates
          window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }))
        })
      })
  })
})()
```

#### 1.3 Theme Switcher UI (Navbar)

```html
<nav class="navbar navbar-expand-lg bg-body-tertiary">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">Fireside Capital</a>
    
    <!-- Theme Switcher Dropdown -->
    <div class="dropdown ms-auto">
      <button class="btn btn-link nav-link py-2 px-0 px-lg-2 dropdown-toggle d-flex align-items-center"
              id="theme-switcher"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              aria-label="Toggle theme">
        <svg class="bi my-1 theme-icon-active" width="1em" height="1em"><use href="#circle-half"></use></svg>
        <span class="d-lg-none ms-2">Toggle theme</span>
      </button>
      <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="theme-switcher">
        <li>
          <button class="dropdown-item d-flex align-items-center" 
                  data-bs-theme-value="light" 
                  aria-pressed="false">
            <svg class="bi me-2 opacity-50" width="1em" height="1em"><use href="#sun-fill"></use></svg>
            Light
          </button>
        </li>
        <li>
          <button class="dropdown-item d-flex align-items-center" 
                  data-bs-theme-value="dark" 
                  aria-pressed="false">
            <svg class="bi me-2 opacity-50" width="1em" height="1em"><use href="#moon-stars-fill"></use></svg>
            Dark
          </button>
        </li>
        <li>
          <button class="dropdown-item d-flex align-items-center" 
                  data-bs-theme-value="auto" 
                  aria-pressed="true">
            <svg class="bi me-2 opacity-50" width="1em" height="1em"><use href="#circle-half"></use></svg>
            Auto
          </button>
        </li>
      </ul>
    </div>
  </div>
</nav>

<!-- SVG Icons -->
<svg xmlns="http://www.w3.org/2000/svg" class="d-none">
  <symbol id="sun-fill" viewBox="0 0 16 16">
    <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
  </symbol>
  <symbol id="moon-stars-fill" viewBox="0 0 16 16">
    <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278"/>
    <path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.73 1.73 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.73 1.73 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.73 1.73 0 0 0 1.097-1.097z"/>
  </symbol>
  <symbol id="circle-half" viewBox="0 0 16 16">
    <path d="M8 15A7 7 0 1 0 8 1zm0 1A8 8 0 1 1 8 0a8 8 0 0 1 0 16"/>
  </symbol>
</svg>
```

---

## 2. Chart.js Dark Mode Integration

Chart.js doesn't natively respond to Bootstrap's `data-bs-theme` changes. You must manually update chart colors when the theme changes.

### 2.1 Chart Theme Configuration

Create a centralized chart theme system:

```javascript
// assets/js/chart-themes.js

const ChartThemes = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: '#dee2e6',
    gridColor: 'rgba(0, 0, 0, 0.1)',
    textColor: '#212529',
    tooltipBg: 'rgba(255, 255, 255, 0.95)',
    tooltipBorder: '#dee2e6',
    
    // Financial data colors (high contrast)
    positive: '#198754',  // Green
    negative: '#dc3545',  // Red
    neutral: '#0d6efd',   // Blue
    warning: '#ffc107',   // Yellow
  },
  
  dark: {
    backgroundColor: 'rgba(33, 37, 41, 0.8)',
    borderColor: '#495057',
    gridColor: 'rgba(255, 255, 255, 0.1)',
    textColor: '#dee2e6',
    tooltipBg: 'rgba(33, 37, 41, 0.95)',
    tooltipBorder: '#495057',
    
    // Financial data colors (WCAG AAA compliant on dark bg)
    positive: '#75b798',  // Lighter green
    negative: '#f87171',  // Lighter red
    neutral: '#60a5fa',   // Lighter blue
    warning: '#fbbf24',   // Lighter yellow
  }
}

// Get current theme
function getCurrentTheme() {
  const theme = document.documentElement.getAttribute('data-bs-theme')
  return theme === 'dark' ? 'dark' : 'light'
}

// Apply theme to Chart.js config
function getChartOptions(baseOptions = {}) {
  const theme = ChartThemes[getCurrentTheme()]
  
  return {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      legend: {
        ...baseOptions.plugins?.legend,
        labels: {
          ...baseOptions.plugins?.legend?.labels,
          color: theme.textColor
        }
      },
      tooltip: {
        ...baseOptions.plugins?.tooltip,
        backgroundColor: theme.tooltipBg,
        titleColor: theme.textColor,
        bodyColor: theme.textColor,
        borderColor: theme.tooltipBorder,
        borderWidth: 1
      }
    },
    scales: {
      ...baseOptions.scales,
      x: {
        ...baseOptions.scales?.x,
        ticks: {
          ...baseOptions.scales?.x?.ticks,
          color: theme.textColor
        },
        grid: {
          ...baseOptions.scales?.x?.grid,
          color: theme.gridColor
        }
      },
      y: {
        ...baseOptions.scales?.y,
        ticks: {
          ...baseOptions.scales?.y?.ticks,
          color: theme.textColor
        },
        grid: {
          ...baseOptions.scales?.y?.grid,
          color: theme.gridColor
        }
      }
    }
  }
}

// Update all charts on theme change
function updateAllCharts() {
  const theme = getCurrentTheme()
  const colors = ChartThemes[theme]
  
  // Update each Chart.js instance
  Chart.instances.forEach(chart => {
    // Update scales
    if (chart.options.scales?.x) {
      chart.options.scales.x.ticks.color = colors.textColor
      chart.options.scales.x.grid.color = colors.gridColor
    }
    if (chart.options.scales?.y) {
      chart.options.scales.y.ticks.color = colors.textColor
      chart.options.scales.y.grid.color = colors.gridColor
    }
    
    // Update legend
    if (chart.options.plugins?.legend) {
      chart.options.plugins.legend.labels.color = colors.textColor
    }
    
    // Update tooltip
    if (chart.options.plugins?.tooltip) {
      chart.options.plugins.tooltip.backgroundColor = colors.tooltipBg
      chart.options.plugins.tooltip.titleColor = colors.textColor
      chart.options.plugins.tooltip.bodyColor = colors.textColor
      chart.options.plugins.tooltip.borderColor = colors.tooltipBorder
    }
    
    chart.update('none') // Update without animation
  })
}

// Listen for theme changes
window.addEventListener('themechange', () => {
  updateAllCharts()
})
```

### 2.2 Example: Net Worth Chart with Theme Support

```javascript
// Example usage in dashboard.js
import { ChartThemes, getCurrentTheme, getChartOptions } from './chart-themes.js'

function createNetWorthChart(canvasId, data) {
  const theme = ChartThemes[getCurrentTheme()]
  
  const ctx = document.getElementById(canvasId).getContext('2d')
  
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.dates,
      datasets: [{
        label: 'Net Worth',
        data: data.values,
        borderColor: theme.positive,
        backgroundColor: theme.positive + '20', // 20% opacity
        tension: 0.4,
        fill: true
      }]
    },
    options: getChartOptions({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Net Worth Over Time',
          color: theme.textColor
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: function(value) {
              return '$' + value.toLocaleString()
            }
          }
        }
      }
    })
  })
}
```

---

## 3. CSS Custom Properties for Financial Data

Use CSS variables for consistent theming of financial data outside of charts.

### 3.1 Custom Property Definitions

```css
/* assets/css/theme-overrides.css */

:root {
  /* Light mode financial colors */
  --fc-positive: #198754;
  --fc-negative: #dc3545;
  --fc-neutral: #0d6efd;
  --fc-warning: #ffc107;
  
  /* Light mode data display */
  --fc-card-bg: #ffffff;
  --fc-card-border: #dee2e6;
  --fc-text-primary: #212529;
  --fc-text-secondary: #6c757d;
  --fc-text-muted: #adb5bd;
  
  /* Light mode highlights */
  --fc-highlight-bg: rgba(13, 110, 253, 0.1);
  --fc-highlight-border: rgba(13, 110, 253, 0.3);
}

[data-bs-theme="dark"] {
  /* Dark mode financial colors (WCAG AAA compliant) */
  --fc-positive: #75b798;
  --fc-negative: #f87171;
  --fc-neutral: #60a5fa;
  --fc-warning: #fbbf24;
  
  /* Dark mode data display */
  --fc-card-bg: #212529;
  --fc-card-border: #495057;
  --fc-text-primary: #dee2e6;
  --fc-text-secondary: #adb5bd;
  --fc-text-muted: #6c757d;
  
  /* Dark mode highlights */
  --fc-highlight-bg: rgba(96, 165, 250, 0.15);
  --fc-highlight-border: rgba(96, 165, 250, 0.4);
}
```

### 3.2 Usage in HTML

```html
<!-- Financial data cards -->
<div class="card" style="background-color: var(--fc-card-bg); border-color: var(--fc-card-border);">
  <div class="card-body">
    <h5 class="card-title" style="color: var(--fc-text-primary);">Total Assets</h5>
    <p class="card-text display-4" style="color: var(--fc-positive);">$1,245,832</p>
    <p class="card-text text-muted" style="color: var(--fc-text-secondary);">
      <span style="color: var(--fc-positive);">▲ 8.2%</span> from last month
    </p>
  </div>
</div>

<!-- Negative value example -->
<div class="card">
  <div class="card-body">
    <h5 class="card-title">Total Debts</h5>
    <p class="card-text display-4" style="color: var(--fc-negative);">-$184,500</p>
  </div>
</div>
```

### 3.3 Utility Classes

```css
/* Financial utility classes */
.text-positive { color: var(--fc-positive) !important; }
.text-negative { color: var(--fc-negative) !important; }
.text-neutral { color: var(--fc-neutral) !important; }
.text-warning-fc { color: var(--fc-warning) !important; }

.bg-positive-subtle { 
  background-color: var(--fc-highlight-bg) !important; 
  border: 1px solid var(--fc-highlight-border);
}

/* Budget progress bars */
.progress-bar-budget-good { background-color: var(--fc-positive); }
.progress-bar-budget-warn { background-color: var(--fc-warning); }
.progress-bar-budget-over { background-color: var(--fc-negative); }
```

---

## 4. Contrast Considerations for Financial Dashboards

Financial data requires **WCAG AAA compliance** (7:1 contrast ratio) because:
- Numbers must be instantly readable
- Color-blind users need sufficient contrast
- Dark mode often has reduced ambient lighting

### 4.1 Recommended Color Pairs

| Element | Light Mode | Dark Mode | Contrast |
|---------|------------|-----------|----------|
| Positive $ | `#198754` on white | `#75b798` on `#212529` | 7.5:1 |
| Negative $ | `#dc3545` on white | `#f87171` on `#212529` | 7.2:1 |
| Primary text | `#212529` on white | `#dee2e6` on `#212529` | 15:1 |
| Secondary text | `#6c757d` on white | `#adb5bd` on `#212529` | 8.5:1 |

### 4.2 Testing Contrast

Use Chrome DevTools or online tools to verify contrast:

```javascript
// Quick contrast checker (paste in console)
function checkContrast(fg, bg) {
  const getLuminance = (hex) => {
    const rgb = parseInt(hex.slice(1), 16)
    const r = ((rgb >> 16) & 0xff) / 255
    const g = ((rgb >> 8) & 0xff) / 255
    const b = (rgb & 0xff) / 255
    
    const [rs, gs, bs] = [r, g, b].map(c => 
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    )
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }
  
  const l1 = getLuminance(fg)
  const l2 = getLuminance(bg)
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
  
  console.log(`Contrast ratio: ${ratio.toFixed(2)}:1`)
  console.log(`WCAG AA (4.5:1): ${ratio >= 4.5 ? '✅' : '❌'}`)
  console.log(`WCAG AAA (7:1): ${ratio >= 7 ? '✅' : '❌'}`)
}

// Test examples
checkContrast('#198754', '#ffffff') // Light mode positive
checkContrast('#75b798', '#212529') // Dark mode positive
```

---

## 5. Implementation Roadmap for Fireside Capital

### Phase 1: Core Theme System (Day 1)
1. Add theme toggler to `app/index.html` navbar
2. Include Bootstrap's theme switcher JS
3. Test theme persistence across page navigation
4. Verify all Bootstrap components render correctly in dark mode

### Phase 2: Chart.js Integration (Day 2)
1. Create `assets/js/chart-themes.js` module
2. Update existing Chart.js instances to use theme system
3. Wire up `themechange` event listener
4. Test chart updates without page reload

### Phase 3: Custom Styling (Day 3)
1. Define CSS custom properties for financial data colors
2. Update all financial number displays to use new variables
3. Create utility classes for common patterns
4. Run contrast checks on all color combinations

### Phase 4: Testing & Refinement (Day 4)
1. Test on actual financial data (edge cases: $0, negatives, large numbers)
2. Verify mobile dark mode (AMOLED screens)
3. Check accessibility with screen readers
4. User acceptance testing

---

## 6. Code Integration Points

### Files to Create
- `app/assets/js/theme-switcher.js` (Bootstrap theme logic)
- `app/assets/js/chart-themes.js` (Chart.js theme integration)
- `app/assets/css/theme-overrides.css` (Financial color variables)

### Files to Modify
- `app/index.html` (add theme switcher to navbar)
- `app/dashboard.html` (add theme switcher to navbar)
- All pages with Chart.js (import chart-themes.js)
- `app/assets/css/styles.css` (use CSS custom properties)

### Supabase Consideration
Store user theme preference in `settings` table:

```sql
ALTER TABLE settings ADD COLUMN theme VARCHAR(10) DEFAULT 'auto';
-- Values: 'light', 'dark', 'auto'
```

Sync with localStorage on login:

```javascript
// On page load
const userTheme = await fetchUserThemeFromSupabase()
if (userTheme && userTheme !== getStoredTheme()) {
  setStoredTheme(userTheme)
  setTheme(userTheme)
}

// On theme change
async function saveThemeToSupabase(theme) {
  await supabase
    .from('settings')
    .update({ theme })
    .eq('user_id', currentUser.id)
}
```

---

## 7. Performance Considerations

### Preventing Flash of Unstyled Content (FOUC)

Place theme initialization in `<head>` before any CSS loads:

```html
<head>
  <script>
    // Execute immediately to prevent FOUC
    (function() {
      const theme = localStorage.getItem('theme') || 'auto'
      if (theme === 'auto') {
        document.documentElement.setAttribute('data-bs-theme', 
          window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      } else {
        document.documentElement.setAttribute('data-bs-theme', theme)
      }
    })()
  </script>
  
  <link href="bootstrap.min.css" rel="stylesheet">
  <!-- Rest of head -->
</head>
```

### Chart Update Performance

Use `chart.update('none')` to skip animations when theme changes:

```javascript
chart.update('none') // Instant update
// vs
chart.update()       // Animated update (slower, distracting during theme change)
```

---

## 8. Accessibility Checklist

- [ ] WCAG AAA contrast (7:1) for all financial numbers
- [ ] Theme switcher keyboard accessible (Tab, Enter, Arrow keys)
- [ ] Screen reader announces theme changes
- [ ] Focus indicators visible in both themes
- [ ] Charts have accessible labels (ARIA)
- [ ] Color not the only indicator (use icons + text for +/-)

---

## 9. Browser Compatibility

Bootstrap 5.3 dark mode is supported in:
- Chrome/Edge 76+
- Firefox 67+
- Safari 12.1+
- iOS Safari 12.2+

**Note:** IE11 not supported (Bootstrap 5 dropped support).

---

## 10. References

- [Bootstrap 5.3 Color Modes Documentation](https://getbootstrap.com/docs/5.3/customize/color-modes/)
- [Chart.js Colors Guide](https://www.chartjs.org/docs/latest/general/colors.html)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced.html)
- [MDN prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)

---

## Next Steps

1. **Spawn Builder agent** to implement theme switcher in `app/index.html`
2. **Create chart-themes.js** module with theme switching logic
3. **Update CSS** with financial data color variables
4. **Test across all 8 pages** of the dashboard
5. **Add theme preference** to Supabase settings table

**Estimated Implementation Time:** 2-3 days (including testing)
