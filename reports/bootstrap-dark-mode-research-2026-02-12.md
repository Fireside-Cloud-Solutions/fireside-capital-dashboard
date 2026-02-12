# Bootstrap Dark Mode Research Report
**Fireside Capital Dashboard**  
**Date:** February 12, 2026  
**Researcher:** Capital (Orchestrator)  
**Status:** Complete — Ready for Implementation

---

## Executive Summary

The dashboard currently uses a **custom dark theme** with `data-theme="dark"` instead of Bootstrap 5.3's native dark mode system. This research identifies **4 key enhancements** to modernize the theme system and improve maintainability.

**Current State:**
- ✅ Dark mode working with custom `data-theme` attribute
- ✅ Theme toggle with localStorage persistence
- ✅ Chart color adaptation based on theme
- ⚠️ Not using Bootstrap 5.3's native `data-bs-theme` system
- ⚠️ Manual color mapping in JavaScript (getThemeColors())
- ⚠️ No system preference detection (prefers-color-scheme)
- ⚠️ Limited to dark/light (no additional themes like high contrast)

**Recommended Enhancements:**
1. **Migrate to Bootstrap 5.3 Native Dark Mode** — Use `data-bs-theme` for built-in support
2. **System Preference Detection** — Auto-detect user's OS theme preference
3. **Extended Theme System** — Support light, dark, auto, high-contrast modes
4. **CSS Custom Properties Alignment** — Sync design-tokens.css with Bootstrap variables

---

## 1. Migrate to Bootstrap 5.3 Native Dark Mode

### Why It Matters
Bootstrap 5.3+ has **built-in dark mode** via the `data-bs-theme` attribute. Using it provides:
- ✅ **Automatic component styling** — All Bootstrap components adapt to dark mode
- ✅ **Less custom CSS** — Bootstrap handles form controls, modals, dropdowns, etc.
- ✅ **Better consistency** — Follows Bootstrap's design language
- ✅ **Future-proof** — Gets updates with Bootstrap releases

### Current Implementation

**HTML (Current):**
```html
<body data-theme="dark">
  <!-- Custom attribute, not recognized by Bootstrap -->
</body>
```

**CSS (Current):**
```css
/* manual dark mode styles scattered across files */
[data-theme="dark"] {
  background-color: #0f0f0f;
  color: #f0f0f0;
}
```

**JavaScript (Current):**
```javascript
function getThemeColors() {
  const currentTheme = document.body.getAttribute('data-theme') || 'dark';
  
  if (currentTheme === 'light') {
    return {
      text: '#333',
      grid: '#ddd',
      fill: 'rgba(1, 164, 239, 0.1)'
    };
  }
  return {
    text: '#f0f0f0',
    grid: '#3a3a3a',
    fill: 'rgba(1, 164, 239, 0.2)'
  };
}
```

### Recommended: Bootstrap Native Dark Mode

**HTML (Recommended):**
```html
<!DOCTYPE html>
<html lang="en" data-bs-theme="dark">
<head>
  <!-- Bootstrap will automatically apply dark mode styles -->
</head>
<body>
  <!-- All Bootstrap components get dark styling automatically -->
</body>
</html>
```

**CSS (Recommended):**
```css
/* Override Bootstrap's dark mode variables to match Fireside brand */
[data-bs-theme="dark"] {
  /* Background colors (override Bootstrap defaults) */
  --bs-body-bg: #0f0f0f;              /* Fireside bg-1 */
  --bs-body-bg-rgb: 15, 15, 15;
  
  --bs-secondary-bg: #1a1a1a;         /* Fireside bg-2 (cards, elevated) */
  --bs-secondary-bg-rgb: 26, 26, 26;
  
  --bs-tertiary-bg: #262626;          /* Fireside bg-3 (inputs, hover) */
  --bs-tertiary-bg-rgb: 38, 38, 38;
  
  /* Text colors */
  --bs-body-color: #f0f0f0;           /* Fireside text-primary */
  --bs-body-color-rgb: 240, 240, 240;
  
  --bs-secondary-color: rgba(176, 176, 176, 0.75);  /* Fireside text-secondary */
  --bs-tertiary-color: rgba(153, 153, 153, 0.5);    /* Fireside text-tertiary */
  
  /* Border colors */
  --bs-border-color: #3a3a3a;         /* Fireside border-default */
  --bs-border-color-translucent: rgba(58, 58, 58, 0.175);
  
  /* Brand colors (unchanged) */
  --bs-primary: #f44e24;              /* Flame orange */
  --bs-primary-rgb: 244, 78, 36;
  
  --bs-secondary: #01a4ef;            /* Sky blue */
  --bs-secondary-rgb: 1, 164, 239;
  
  --bs-success: #81b900;              /* Lime green */
  --bs-success-rgb: 129, 185, 0;
  
  /* Link colors */
  --bs-link-color: #01a4ef;
  --bs-link-hover-color: #0190d4;
  
  /* Form controls */
  --bs-form-valid-color: #81b900;
  --bs-form-invalid-color: #dc3545;
}

/* Light mode overrides (if needed) */
[data-bs-theme="light"] {
  --bs-body-bg: #ffffff;
  --bs-body-color: #212529;
  /* ...more light mode variables */
}
```

**JavaScript (Recommended):**
```javascript
// Simplified theme management
function setTheme(theme) {
  // Set on <html> element (Bootstrap 5.3 best practice)
  document.documentElement.setAttribute('data-bs-theme', theme);
  localStorage.setItem('theme', theme);
  
  // Update toggle UI
  const themeSwitch = document.getElementById('themeSwitch');
  if (themeSwitch) {
    themeSwitch.checked = (theme === 'light');
  }
  
  // No need for manual chart color mapping — charts use CSS variables
  refreshChartsIfNeeded();
}

// Get current theme
function getTheme() {
  return document.documentElement.getAttribute('data-bs-theme') || 'dark';
}

// Chart colors now pull from CSS variables automatically
function getChartColors() {
  const styles = getComputedStyle(document.documentElement);
  
  return {
    primary: styles.getPropertyValue('--bs-primary').trim(),
    secondary: styles.getPropertyValue('--bs-secondary').trim(),
    success: styles.getPropertyValue('--bs-success').trim(),
    text: styles.getPropertyValue('--bs-body-color').trim(),
    grid: styles.getPropertyValue('--bs-border-color').trim(),
    background: styles.getPropertyValue('--bs-body-bg').trim()
  };
}
```

**Benefits:**
- ✅ **Automatic component styling** — Forms, buttons, modals adapt without custom CSS
- ✅ **Less JavaScript** — No manual color mapping
- ✅ **Consistency** — Bootstrap handles all component theming
- ✅ **Easier maintenance** — One place to update colors (CSS variables)

---

## 2. System Preference Detection (Auto Theme)

### Why It Matters
Users expect apps to respect their OS theme preference (`prefers-color-scheme`). This improves UX by matching the system theme automatically.

### Implementation

**JavaScript:**
```javascript
/* =========================================================
   Theme Manager with System Preference Detection
   Fireside Capital Dashboard
   ========================================================= */

const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

class ThemeManager {
  constructor() {
    this.themeSwitch = document.getElementById('themeSwitch');
    this.autoToggle = document.getElementById('autoThemeToggle');
    
    // Initialize theme
    this.init();
  }
  
  /**
   * Initialize theme system
   */
  init() {
    const savedTheme = this.getSavedTheme();
    
    if (savedTheme === THEMES.AUTO) {
      this.enableAutoTheme();
    } else {
      this.setTheme(savedTheme || THEMES.DARK);
    }
    
    // Listen for system preference changes
    this.watchSystemPreference();
    
    // Setup toggle listeners
    this.setupToggles();
  }
  
  /**
   * Get saved theme from localStorage
   */
  getSavedTheme() {
    return localStorage.getItem('theme') || THEMES.AUTO;
  }
  
  /**
   * Get system preferred theme
   */
  getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 
      THEMES.DARK : THEMES.LIGHT;
  }
  
  /**
   * Set theme manually
   */
  setTheme(theme) {
    if (![THEMES.LIGHT, THEMES.DARK, THEMES.AUTO].includes(theme)) {
      console.warn(`Invalid theme: ${theme}. Defaulting to dark.`);
      theme = THEMES.DARK;
    }
    
    if (theme === THEMES.AUTO) {
      this.enableAutoTheme();
      return;
    }
    
    // Apply theme
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update UI
    this.updateToggleUI(theme);
    
    // Refresh charts
    this.refreshCharts();
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }
  
  /**
   * Enable auto theme (follow system preference)
   */
  enableAutoTheme() {
    const systemTheme = this.getSystemTheme();
    document.documentElement.setAttribute('data-bs-theme', systemTheme);
    localStorage.setItem('theme', THEMES.AUTO);
    
    this.updateToggleUI(THEMES.AUTO, systemTheme);
    this.refreshCharts();
  }
  
  /**
   * Watch for system preference changes
   */
  watchSystemPreference() {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    darkModeQuery.addEventListener('change', (e) => {
      // Only auto-update if user has selected "auto" mode
      const savedTheme = this.getSavedTheme();
      if (savedTheme === THEMES.AUTO) {
        const newTheme = e.matches ? THEMES.DARK : THEMES.LIGHT;
        document.documentElement.setAttribute('data-bs-theme', newTheme);
        this.refreshCharts();
      }
    });
  }
  
  /**
   * Setup toggle listeners
   */
  setupToggles() {
    // Manual theme toggle (dark/light switch)
    if (this.themeSwitch) {
      this.themeSwitch.addEventListener('change', (e) => {
        const newTheme = e.target.checked ? THEMES.LIGHT : THEMES.DARK;
        this.setTheme(newTheme);
      });
    }
    
    // Auto theme toggle checkbox
    if (this.autoToggle) {
      this.autoToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.enableAutoTheme();
        } else {
          // Disable auto, set to current system theme
          const currentTheme = this.getSystemTheme();
          this.setTheme(currentTheme);
        }
      });
    }
  }
  
  /**
   * Update toggle UI state
   */
  updateToggleUI(theme, appliedTheme = null) {
    const actualTheme = appliedTheme || theme;
    
    // Update dark/light switch
    if (this.themeSwitch) {
      this.themeSwitch.checked = (actualTheme === THEMES.LIGHT);
      
      // Disable switch if in auto mode
      if (theme === THEMES.AUTO) {
        this.themeSwitch.disabled = true;
      } else {
        this.themeSwitch.disabled = false;
      }
    }
    
    // Update auto toggle
    if (this.autoToggle) {
      this.autoToggle.checked = (theme === THEMES.AUTO);
    }
    
    // Update label text
    const label = document.querySelector('label[for="themeSwitch"]');
    if (label) {
      if (theme === THEMES.AUTO) {
        label.innerHTML = `🌗 Auto (${actualTheme === THEMES.DARK ? 'Dark' : 'Light'})`;
      } else if (actualTheme === THEMES.DARK) {
        label.innerHTML = '🌙 Dark Mode';
      } else {
        label.innerHTML = '☀️ Light Mode';
      }
    }
  }
  
  /**
   * Refresh charts when theme changes
   */
  refreshCharts() {
    // Refresh chart instances
    if (typeof renderNetWorthChart === 'function') {
      renderNetWorthChart();
    }
    if (typeof generateMonthlyCashFlowChart === 'function') {
      generateMonthlyCashFlowChart();
    }
    
    // Re-apply chart colors from CSS variables
    if (window.Chart) {
      const colors = getChartColors();
      Chart.defaults.color = colors.text;
      Chart.defaults.borderColor = colors.grid;
    }
  }
  
  /**
   * Get computed chart colors from CSS variables
   */
  getChartColors() {
    const styles = getComputedStyle(document.documentElement);
    
    return {
      primary: styles.getPropertyValue('--bs-primary').trim(),
      secondary: styles.getPropertyValue('--bs-secondary').trim(),
      success: styles.getPropertyValue('--bs-success').trim(),
      text: styles.getPropertyValue('--bs-body-color').trim(),
      grid: styles.getPropertyValue('--bs-border-color').trim(),
      background: styles.getPropertyValue('--bs-body-bg').trim()
    };
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.themeManager = new ThemeManager();
});

// Expose helper functions globally
window.getChartColors = () => window.themeManager.getChartColors();
window.setTheme = (theme) => window.themeManager.setTheme(theme);
```

**HTML (Theme Toggle UI):**
```html
<!-- Updated theme toggle in navigation -->
<div class="theme-controls">
  <!-- Auto theme option -->
  <div class="form-check mb-2">
    <input class="form-check-input" type="checkbox" id="autoThemeToggle">
    <label class="form-check-label" for="autoThemeToggle">
      🌗 Auto (follow system)
    </label>
  </div>
  
  <!-- Manual dark/light switch -->
  <div class="form-check form-switch">
    <input class="form-check-input" type="checkbox" id="themeSwitch">
    <label class="form-check-label" for="themeSwitch">
      🌙 Dark Mode
    </label>
  </div>
</div>
```

**Benefits:**
- ✅ **Respects user preferences** — Auto-detects OS theme
- ✅ **Reduces user friction** — No manual theme selection needed
- ✅ **Dynamic updates** — Follows OS theme changes in real-time
- ✅ **Manual override** — Users can still choose a specific theme

---

## 3. Extended Theme System (High Contrast Mode)

### Why It Matters
Accessibility standards (WCAG 2.1 Level AAA) require high contrast options for users with low vision or color blindness.

### Implementation

**CSS (High Contrast Theme):**
```css
/* High Contrast Dark Mode */
[data-bs-theme="high-contrast-dark"] {
  /* Background colors (pure black for maximum contrast) */
  --bs-body-bg: #000000;
  --bs-secondary-bg: #0a0a0a;
  --bs-tertiary-bg: #141414;
  
  /* Text colors (pure white for maximum contrast) */
  --bs-body-color: #ffffff;
  --bs-secondary-color: rgba(255, 255, 255, 0.85);
  --bs-tertiary-color: rgba(255, 255, 255, 0.7);
  
  /* Border colors (higher contrast) */
  --bs-border-color: #666666;
  --bs-border-color-translucent: rgba(102, 102, 102, 0.3);
  
  /* Brand colors (adjusted for better contrast) */
  --bs-primary: #ff5733;              /* Brighter orange */
  --bs-secondary: #00bfff;            /* Brighter blue */
  --bs-success: #9acd32;              /* Brighter green */
  
  /* Links (higher contrast) */
  --bs-link-color: #00cfff;
  --bs-link-hover-color: #00a3cc;
  
  /* Focus states (more visible) */
  --bs-focus-ring-width: 3px;
  --bs-focus-ring-opacity: 1;
  --bs-focus-ring-color: #00cfff;
}

/* High Contrast Light Mode */
[data-bs-theme="high-contrast-light"] {
  --bs-body-bg: #ffffff;
  --bs-body-color: #000000;
  --bs-border-color: #000000;
  
  --bs-primary: #cc0000;              /* Dark red (higher contrast) */
  --bs-secondary: #0066cc;            /* Dark blue */
  --bs-success: #009900;              /* Dark green */
  
  --bs-link-color: #0000ee;
  --bs-link-hover-color: #0000cc;
}
```

**JavaScript (Add to ThemeManager):**
```javascript
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  HIGH_CONTRAST_DARK: 'high-contrast-dark',
  HIGH_CONTRAST_LIGHT: 'high-contrast-light',
  AUTO: 'auto'
};

// Add high contrast detection
getSystemTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const prefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches;
  
  if (prefersHighContrast) {
    return prefersDark ? THEMES.HIGH_CONTRAST_DARK : THEMES.HIGH_CONTRAST_LIGHT;
  }
  
  return prefersDark ? THEMES.DARK : THEMES.LIGHT;
}
```

**HTML (Theme Selector Dropdown):**
```html
<!-- Advanced theme selector (in settings page) -->
<div class="mb-3">
  <label for="themeSelect" class="form-label">Theme</label>
  <select class="form-select" id="themeSelect">
    <option value="auto">Auto (follow system)</option>
    <option value="dark">Dark</option>
    <option value="light">Light</option>
    <option value="high-contrast-dark">High Contrast Dark</option>
    <option value="high-contrast-light">High Contrast Light</option>
  </select>
</div>
```

**Benefits:**
- ✅ **WCAG AAA compliance** — Meets accessibility standards
- ✅ **Better for low vision** — Maximum contrast ratios
- ✅ **Colorblind friendly** — Relies on contrast, not color alone
- ✅ **Professional appearance** — Shows attention to accessibility

---

## 4. CSS Custom Properties Alignment

### Problem
Current design-tokens.css duplicates some values that Bootstrap already provides. This creates maintenance overhead.

### Solution: Extend Bootstrap Variables

**`01-settings/design-tokens.css` (Updated):**
```css
/* =================================================================
   Fireside Capital — Design Tokens (Bootstrap-aligned)
   Version: 3.0 | February 2026
   
   Strategy: Extend Bootstrap 5.3 variables, don't replace them.
   Use Bootstrap vars where possible, add Fireside-specific ones.
   ================================================================= */

:root {
  /* -----------------------------------------------------------------
     FIRESIDE BRAND COLORS
     These override Bootstrap's default brand colors
     ----------------------------------------------------------------- */
  --bs-primary: #f44e24;              /* Flame Orange (replaces Bootstrap blue) */
  --bs-primary-rgb: 244, 78, 36;
  
  --bs-secondary: #01a4ef;            /* Sky Blue */
  --bs-secondary-rgb: 1, 164, 239;
  
  --bs-success: #81b900;              /* Lime Green */
  --bs-success-rgb: 129, 185, 0;
  
  /* Fireside-specific brand colors (not in Bootstrap) */
  --color-accent: var(--bs-success);  /* Alias for success */
  --color-tertiary: #4a4a4a;          /* Neutral Gray */
  --color-tertiary-rgb: 74, 74, 74;
  
  /* -----------------------------------------------------------------
     BACKGROUNDS (Use Bootstrap vars + add Fireside levels)
     ----------------------------------------------------------------- */
  /* Bootstrap provides: --bs-body-bg, --bs-secondary-bg, --bs-tertiary-bg */
  /* Add Fireside-specific levels */
  --color-bg-1: var(--bs-body-bg);
  --color-bg-2: var(--bs-secondary-bg);
  --color-bg-3: var(--bs-tertiary-bg);
  
  /* -----------------------------------------------------------------
     TEXT COLORS (Use Bootstrap vars)
     ----------------------------------------------------------------- */
  --color-text-primary: var(--bs-body-color);
  --color-text-secondary: var(--bs-secondary-color);
  --color-text-tertiary: var(--bs-tertiary-color);
  
  /* -----------------------------------------------------------------
     BORDERS (Use Bootstrap vars)
     ----------------------------------------------------------------- */
  --color-border-subtle: var(--bs-border-color-translucent);
  --color-border-default: var(--bs-border-color);
  --color-border-strong: var(--bs-emphasis-color);
  
  /* -----------------------------------------------------------------
     SPACING, RADIUS, SHADOWS (Keep Fireside system)
     Bootstrap's spacing is limited — Fireside uses 8px grid
     ----------------------------------------------------------------- */
  /* ...existing spacing variables (--space-*) */
  
  /* -----------------------------------------------------------------
     TRANSITIONS (Keep Fireside system)
     ----------------------------------------------------------------- */
  /* ...existing transition variables */
}

/* Dark mode overrides (applied when data-bs-theme="dark") */
[data-bs-theme="dark"] {
  /* Override Bootstrap's dark mode defaults with Fireside charcoal palette */
  --bs-body-bg: #0f0f0f;              /* Fireside bg-1 */
  --bs-secondary-bg: #1a1a1a;         /* Fireside bg-2 */
  --bs-tertiary-bg: #262626;          /* Fireside bg-3 */
  
  --bs-body-color: #f0f0f0;           /* Fireside text-primary */
  --bs-secondary-color: rgba(176, 176, 176, 0.75);
  --bs-tertiary-color: rgba(153, 153, 153, 0.5);
  
  --bs-border-color: #3a3a3a;
  --bs-border-color-translucent: rgba(58, 58, 58, 0.175);
  
  /* Keep Fireside brand colors (don't change in dark mode) */
  --bs-primary: #f44e24;
  --bs-secondary: #01a4ef;
  --bs-success: #81b900;
}
```

**Benefits:**
- ✅ **Less duplication** — Reuse Bootstrap variables where possible
- ✅ **Automatic Bootstrap updates** — Future Bootstrap releases work seamlessly
- ✅ **Easier debugging** — Fewer variables to track
- ✅ **Better component integration** — Bootstrap components use correct colors

---

## Migration Checklist

### Phase 1: Bootstrap Native Dark Mode
- [ ] Change `data-theme="dark"` to `data-bs-theme="dark"` in all HTML files
- [ ] Update `setupThemeToggle()` to use `data-bs-theme` attribute
- [ ] Override Bootstrap dark mode variables in design-tokens.css
- [ ] Test all Bootstrap components (forms, buttons, modals) in dark/light modes
- [ ] Remove custom theme CSS that Bootstrap now handles

### Phase 2: System Preference Detection
- [ ] Create `ThemeManager` class with auto-detection
- [ ] Add "Auto (follow system)" toggle to UI
- [ ] Watch for `prefers-color-scheme` changes
- [ ] Update charts to use CSS variable colors
- [ ] Test on Windows 11, macOS, iOS, Android

### Phase 3: High Contrast Mode
- [ ] Add `data-bs-theme="high-contrast-dark"` stylesheet
- [ ] Add `data-bs-theme="high-contrast-light"` stylesheet
- [ ] Detect `prefers-contrast: more` media query
- [ ] Add theme selector dropdown in Settings page
- [ ] Test with Windows High Contrast mode

### Phase 4: CSS Alignment
- [ ] Audit design-tokens.css for Bootstrap variable overlaps
- [ ] Replace duplicates with Bootstrap variable references
- [ ] Test all pages for visual regressions
- [ ] Document which variables are Fireside-specific vs Bootstrap

---

## Code Example: Complete Theme Implementation

**`app/assets/js/theme-manager.js`:**
```javascript
/* =========================================================
   Theme Manager for Fireside Capital Dashboard
   Bootstrap 5.3 Native Dark Mode + System Preference Detection
   ========================================================= */

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

export class ThemeManager {
  constructor() {
    this.init();
  }
  
  init() {
    const savedTheme = localStorage.getItem('theme') || THEMES.AUTO;
    
    if (savedTheme === THEMES.AUTO) {
      this.enableAutoTheme();
    } else {
      this.setTheme(savedTheme);
    }
    
    this.watchSystemPreference();
    this.setupToggle();
  }
  
  getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 
      THEMES.DARK : THEMES.LIGHT;
  }
  
  setTheme(theme) {
    if (theme === THEMES.AUTO) {
      this.enableAutoTheme();
      return;
    }
    
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
    this.updateUI(theme);
  }
  
  enableAutoTheme() {
    const systemTheme = this.getSystemTheme();
    document.documentElement.setAttribute('data-bs-theme', systemTheme);
    localStorage.setItem('theme', THEMES.AUTO);
    this.updateUI(THEMES.AUTO, systemTheme);
  }
  
  watchSystemPreference() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (localStorage.getItem('theme') === THEMES.AUTO) {
        const newTheme = e.matches ? THEMES.DARK : THEMES.LIGHT;
        document.documentElement.setAttribute('data-bs-theme', newTheme);
      }
    });
  }
  
  setupToggle() {
    const toggle = document.getElementById('themeSwitch');
    if (!toggle) return;
    
    toggle.addEventListener('change', (e) => {
      this.setTheme(e.target.checked ? THEMES.LIGHT : THEMES.DARK);
    });
  }
  
  updateUI(theme, appliedTheme = null) {
    const actual = appliedTheme || theme;
    const toggle = document.getElementById('themeSwitch');
    const label = document.querySelector('label[for="themeSwitch"]');
    
    if (toggle) {
      toggle.checked = (actual === THEMES.LIGHT);
    }
    
    if (label) {
      label.innerHTML = theme === THEMES.AUTO ? 
        `🌗 Auto (${actual === THEMES.DARK ? 'Dark' : 'Light'})` :
        (actual === THEMES.DARK ? '🌙 Dark Mode' : '☀️ Light Mode');
    }
  }
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
  });
} else {
  window.themeManager = new ThemeManager();
}
```

**Usage:**
```html
<!-- In app.html -->
<script type="module" src="assets/js/theme-manager.js"></script>

<div class="theme-toggle">
  <div class="form-check form-switch">
    <input class="form-check-input" type="checkbox" id="themeSwitch">
    <label class="form-check-label" for="themeSwitch">🌙 Dark Mode</label>
  </div>
</div>
```

---

## Success Metrics

**Before:**
- Custom `data-theme` system
- Manual color mapping in JavaScript
- No system preference detection
- 2 themes (dark, light)

**After (Target):**
- Bootstrap 5.3 native dark mode
- Automatic color adaptation via CSS variables
- System preference auto-detection
- 3+ themes (light, dark, auto, high-contrast)

**Developer Experience:**
- ✅ Less custom CSS to maintain
- ✅ Bootstrap components work out-of-the-box
- ✅ Easier to add new themes
- ✅ Better accessibility compliance

---

## References

- **Bootstrap Color Modes:** https://getbootstrap.com/docs/5.3/customize/color-modes/
- **Bootstrap CSS Variables:** https://getbootstrap.com/docs/5.3/customize/css-variables/
- **MDN prefers-color-scheme:** https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme
- **MDN prefers-contrast:** https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast
- **WCAG Contrast Requirements:** https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html

---

## Next Steps

1. **Review this report** with the team
2. **Prioritize migration phases** (start with Phase 1)
3. **Create Azure DevOps work items** for each phase
4. **Assign Builder agent** to execute Phase 1 migration
5. **Test on multiple devices** (Windows, macOS, iOS, Android)

**Status:** Research complete, ready for implementation  
**Estimated Effort:** 2 weeks (all phases)  
**Risk Level:** Low (Bootstrap handles most complexity)
