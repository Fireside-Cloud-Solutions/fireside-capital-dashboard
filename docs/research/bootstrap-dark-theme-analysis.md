# Bootstrap Dark Theme Customization Research
**Research Date:** February 15, 2026  
**Sprint:** Sprint Check  
**Status:** Complete  

## Executive Summary
The Fireside Capital dashboard uses **Bootstrap 5.3.3** with extensive custom overrides for dark theme styling. The implementation is **production-ready** with good UX polish, but suffers from **specificity conflicts**, **incomplete coverage**, and **maintenance challenges**. Migrating to Bootstrap 5.3's native dark mode or building a custom SCSS theme would improve consistency and reduce CSS bloat.

---

## Current Implementation Analysis

### ✅ Strengths

#### 1. **Comprehensive Bootstrap Overrides**
Custom styles defined in `main.css` override Bootstrap defaults:

```css
/* =================================================================
   BUTTONS - Bootstrap Overrides (UX Polish)
   ================================================================= */
.btn {
  font-weight: var(--weight-semibold);
  border-radius: 8px;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 44px; /* WCAG 2.5.5 compliance */
  padding: 12px 20px;
  gap: 8px;
}

.btn-primary {
  background: var(--color-primary);
  border: 2px solid var(--color-primary);
  box-shadow: 0 2px 8px rgba(244, 78, 36, 0.25);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(244, 78, 36, 0.35);
}
```

**Benefits:**
- Consistent brand colors (Flame Orange, Sky Blue)
- WCAG-compliant touch targets (44px)
- Smooth transitions (150-200ms)
- Design token integration

#### 2. **Dark-First Design**
`<body data-theme="dark">` attribute with full dark styling:

```css
body[data-theme='dark'] {
  background-color: var(--color-bg-1);
  color: var(--color-text-primary);
}

.form-control,
.form-select {
  background-color: var(--color-bg-3);
  border: 2px solid var(--color-border-default);
  color: var(--color-text-primary);
}

.modal-content {
  background-color: var(--color-bg-2);
  border-color: var(--color-border-subtle);
}
```

#### 3. **Light Theme Support** (Partial)
Light theme overrides exist but incomplete:

```css
body[data-theme='light'] .card {
  background-color: #ffffff;
  color: #1a1a1a;
}

body[data-theme='light'] .form-control {
  background-color: #ffffff;
  border-color: #ced4da;
}
```

**Issue:** Only ~30% of components have light theme overrides.

#### 4. **Mobile-First Responsive Design**
```css
.btn-sm {
  min-height: 44px;
  padding: var(--space-2) var(--space-3);
}

@media (max-width: 575.98px) {
  .btn-group {
    flex-direction: column;
    width: 100%;
  }
}
```

#### 5. **UX Polish**
- Consistent 8px border radius on all components
- Smooth 150-200ms transitions
- Clear focus states (blue outline)
- Shadow elevation system
- Icon spacing (8-12px gap)

---

## ⚠️ Issues & Technical Debt

### 1. **High Specificity Conflicts**
Bootstrap CSS loaded first, custom overrides loaded second — creates specificity battles:

```html
<!-- HTML Load Order -->
<link href="bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
<link rel="stylesheet" href="assets/css/main.css" />
<!-- Custom styles must use !important to override Bootstrap -->
```

**Example Conflict:**
```css
/* Bootstrap default */
.mb-3 { margin-bottom: 1rem !important; }

/* Custom override */
.mb-24 { margin-bottom: 24px !important; }
/* ↑ Both use !important = specificity war */
```

**Impact:** 89 instances of `!important` in `main.css` (code smell).

---

### 2. **Incomplete Light Theme**
Light theme styles missing for:
- ❌ Sidebar navigation
- ❌ Dropdown menus
- ❌ Toasts & alerts
- ❌ Progress bars
- ❌ Tooltips & popovers
- ❌ Chart containers
- ❌ Empty states

**Current Coverage:** ~30% of components  
**Expected Coverage:** 100%

---

### 3. **Bootstrap Dark Mode Not Used**
Bootstrap 5.3+ has native dark mode support via `data-bs-theme="dark"`:

```html
<!-- Native Bootstrap Dark Mode (NOT USED) -->
<html data-bs-theme="dark">
```

**Benefits of Native Mode:**
- Automatic dark variants for all components
- No custom overrides needed
- Consistent across Bootstrap ecosystem
- Smaller CSS payload

**Current Approach:** Custom dark theme built from scratch.

---

### 4. **No SCSS Customization**
Bootstrap loaded from CDN (no build step):

```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
```

**Issue:** Cannot customize Bootstrap SCSS variables before compilation.

**Desired:**
```scss
// custom-bootstrap.scss
$primary: #f44e24;
$secondary: #01a4ef;
$success: #81b900;
$body-bg: #0f0f0f;
$body-color: #f0f0f0;

@import 'bootstrap/scss/bootstrap';
```

**Benefit:** Single source of truth, no overrides needed.

---

### 5. **Component Inconsistencies**

#### A. **Button Sizing**
```css
.btn { min-height: 44px; }
.btn-sm { min-height: 44px; }
/* ↑ Both same size = no "small" variant */
```

#### B. **Card Padding**
```css
.card-body { padding: 24px; }
.dashboard-card .card-body { padding: 20px; }
.stat-card .card-body { padding: 16px; }
/* ↑ Inconsistent padding across card types */
```

#### C. **Border Radius**
```css
.btn { border-radius: 8px; }
.card { border-radius: 12px; }
.modal-content { border-radius: 16px; }
/* ↑ No clear system (8px vs 12px vs 16px) */
```

**Issue:** Design tokens define clear radius scale, but application is inconsistent.

---

### 6. **CSS Bloat from Overrides**
Bootstrap CSS: **159 KB** (minified)  
Custom overrides in `main.css`: **92 KB** (uncompressed)  
**Combined payload:** ~250 KB

**Breakdown:**
- 30% of custom CSS is Bootstrap overrides
- 15% is responsive overrides
- 10% is theme-switching logic

**Opportunity:** Custom SCSS build could eliminate 40-50% of custom CSS.

---

## 🎯 Recommendations

### Priority 1: Adopt Bootstrap Native Dark Mode

#### **Current Approach:**
```html
<body data-theme="dark">
```
```css
/* 500+ lines of custom dark theme overrides */
```

#### **Proposed Approach:**
```html
<html data-bs-theme="dark">
```
```css
/* Bootstrap handles dark theme automatically */
```

**Migration Steps:**
1. Replace `data-theme="dark"` with `data-bs-theme="dark"`
2. Remove custom dark theme overrides where Bootstrap provides equivalent
3. Keep brand color overrides (primary, secondary, success)
4. Test all 8 pages for visual consistency

**Files to Modify:**
- `app/*.html` (8 files) — change attribute
- `app/assets/css/main.css` — remove duplicate dark overrides
- `app/assets/js/app.js` — update theme switcher logic

**Expected Savings:** 15-20 KB of CSS removed.

**Implementation:**
```javascript
// Theme switcher (updated)
function setTheme(theme) {
  document.documentElement.setAttribute('data-bs-theme', theme);
  localStorage.setItem('theme', theme);
}

// Auto-detect system preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
setTheme(localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light'));
```

---

### Priority 2: Build Custom Bootstrap SCSS

#### **Setup Bootstrap Build Pipeline**

**Install Dependencies:**
```bash
npm install bootstrap@5.3.3 sass --save-dev
```

**Create Custom Theme:**
```scss
// assets/scss/custom-bootstrap.scss

// 1. Import design tokens
@import 'design-tokens-scss';

// 2. Override Bootstrap variables
$primary: #f44e24;       // Flame Orange
$secondary: #01a4ef;     // Sky Blue
$success: #81b900;       // Lime Green
$danger: #dc3545;
$warning: #ffc107;
$info: #01a4ef;

// Dark theme colors
$body-bg: #0f0f0f;
$body-color: #f0f0f0;
$body-bg-dark: #0f0f0f;
$body-color-dark: #f0f0f0;

// Component overrides
$border-radius: 0.5rem;           // 8px
$border-radius-lg: 0.75rem;       // 12px
$border-radius-xl: 1rem;          // 16px
$btn-border-radius: 0.5rem;
$card-border-radius: 0.75rem;
$modal-content-border-radius: 1rem;

// Spacing
$spacer: 1rem; // 16px base (Bootstrap default)

// Typography
$font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
$headings-font-family: 'Source Serif 4', Georgia, serif;

// Shadows
$box-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.4);
$box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
$box-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.35);

// Forms
$input-bg: #262626;
$input-border-color: #3a3a3a;
$input-color: #f0f0f0;
$input-focus-border-color: #01a4ef;

// 3. Import Bootstrap
@import 'bootstrap/scss/bootstrap';

// 4. Custom component extensions
.btn-primary {
  box-shadow: 0 2px 8px rgba(244, 78, 36, 0.25);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(244, 78, 36, 0.35);
  }
}
```

**Build Script:**
```json
// package.json
{
  "scripts": {
    "build:css": "sass assets/scss/custom-bootstrap.scss:assets/css/bootstrap-custom.min.css --style compressed",
    "watch:css": "sass --watch assets/scss/custom-bootstrap.scss:assets/css/bootstrap-custom.min.css"
  }
}
```

**Update HTML:**
```html
<!-- OLD -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
<link rel="stylesheet" href="assets/css/main.css" />

<!-- NEW -->
<link rel="stylesheet" href="assets/css/bootstrap-custom.min.css" />
<link rel="stylesheet" href="assets/css/utilities.css" /> <!-- Only utility classes -->
```

**Expected Benefits:**
- 40-50% reduction in custom CSS overrides
- Single source of truth for theming
- Consistent component styling
- Easier to maintain/update

---

### Priority 3: Fix Component Inconsistencies

#### A. **Standardize Border Radius**
Use design token scale consistently:

```css
/* Design tokens already define these */
--radius-sm: 0.25rem;   /* 4px  — subtle rounding */
--radius-md: 0.5rem;    /* 8px  — buttons, inputs */
--radius-lg: 0.75rem;   /* 12px — cards */
--radius-xl: 1rem;      /* 16px — modals */

/* Apply consistently */
.btn { border-radius: var(--radius-md); }
.form-control { border-radius: var(--radius-md); }
.card { border-radius: var(--radius-lg); }
.modal-content { border-radius: var(--radius-xl); }
```

#### B. **Fix Button Sizing**
```css
.btn { min-height: 44px; padding: 12px 20px; }
.btn-lg { min-height: 52px; padding: 16px 24px; }
.btn-sm { min-height: 36px; padding: 8px 16px; } /* Actually smaller */
```

#### C. **Standardize Card Padding**
```css
.card-body { padding: var(--space-lg); } /* 24px everywhere */
.card-header { padding: var(--space-md); } /* 16px everywhere */
.card-footer { padding: var(--space-md); }
```

---

### Priority 4: Complete Light Theme

Add missing light theme overrides:

```css
/* Sidebar */
body[data-theme='light'] .sidebar {
  background-color: #f8f9fa;
  color: #1a1a1a;
  border-right: 1px solid #dee2e6;
}

body[data-theme='light'] .sidebar a {
  color: #6c757d;
}

body[data-theme='light'] .sidebar a:hover {
  background-color: #e9ecef;
  color: #1a1a1a;
}

/* Dropdowns */
body[data-theme='light'] .dropdown-menu {
  background-color: #ffffff;
  border-color: #dee2e6;
}

body[data-theme='light'] .dropdown-item:hover {
  background-color: #f8f9fa;
}

/* Alerts */
body[data-theme='light'] .alert {
  background-color: #f8f9fa;
  border-color: #dee2e6;
  color: #1a1a1a;
}

/* Toasts */
body[data-theme='light'] .toast {
  background-color: #ffffff;
  border-color: #dee2e6;
  color: #1a1a1a;
}
```

**Testing Checklist:**
- [ ] Sidebar navigation
- [ ] All button variants
- [ ] Form inputs & selects
- [ ] Modals & dialogs
- [ ] Dropdowns & menus
- [ ] Alerts & toasts
- [ ] Cards & panels
- [ ] Tables
- [ ] Charts (background colors)
- [ ] Empty states

---

### Priority 5: Add Theme Switcher UI

Currently no UI to toggle themes (only system preference auto-detect).

**Add Toggle Button:**
```html
<!-- Navbar or Settings Page -->
<button class="btn btn-sm btn-outline-secondary" id="themeToggle" aria-label="Toggle theme">
  <i class="bi bi-moon-stars" id="themeIcon"></i>
</button>
```

**JavaScript:**
```javascript
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-bs-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  setTheme(newTheme);
  updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
  themeIcon.className = theme === 'dark' 
    ? 'bi bi-sun-fill' 
    : 'bi bi-moon-stars';
}

// Auto-detect system preference
const prefersDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');
prefersDarkQuery.addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    setTheme(e.matches ? 'dark' : 'light');
  }
});
```

**Settings Page Option:**
```html
<div class="form-check form-switch">
  <input class="form-check-input" type="checkbox" id="darkModeSwitch">
  <label class="form-check-label" for="darkModeSwitch">
    Dark Mode
  </label>
</div>
```

---

## 📊 Migration Roadmap

### Phase 1: Bootstrap Native Dark Mode (Week 1)
- [ ] Replace `data-theme` with `data-bs-theme`
- [ ] Remove duplicate dark theme overrides
- [ ] Test across all 8 pages
- [ ] Fix visual regressions

**Deliverable:** 15-20 KB CSS reduction

---

### Phase 2: SCSS Build Pipeline (Week 2)
- [ ] Install Bootstrap SCSS + build tools
- [ ] Create `custom-bootstrap.scss` with brand variables
- [ ] Build custom Bootstrap CSS
- [ ] Update HTML to load custom build
- [ ] Test across all pages

**Deliverable:** Single source of truth, 40% fewer overrides

---

### Phase 3: Component Consistency Audit (Week 3)
- [ ] Standardize border radius usage
- [ ] Fix button sizing variants
- [ ] Unify card padding
- [ ] Apply design token scale consistently
- [ ] Document component usage patterns

**Deliverable:** Design system documentation

---

### Phase 4: Complete Light Theme (Week 4)
- [ ] Add missing light theme overrides
- [ ] Test every component in light mode
- [ ] Add theme switcher UI
- [ ] Document theme system

**Deliverable:** Full dual-theme support

---

## 🛠️ Implementation Tasks

### Immediate (Sprint 1)
- [ ] **Task 1:** Migrate to `data-bs-theme="dark"` attribute
- [ ] **Task 2:** Remove duplicate dark overrides from `main.css`
- [ ] **Task 3:** Test all pages for visual consistency
- [ ] **Task 4:** Add theme switcher button to navbar

### Short-Term (Sprint 2-3)
- [ ] **Task 5:** Set up SCSS build pipeline with custom Bootstrap
- [ ] **Task 6:** Create `custom-bootstrap.scss` with brand colors
- [ ] **Task 7:** Standardize border radius across components
- [ ] **Task 8:** Fix button sizing variants (.btn-sm actually smaller)

### Long-Term (Q2 2026)
- [ ] **Task 9:** Complete light theme for all components
- [ ] **Task 10:** Create component usage documentation
- [ ] **Task 11:** Implement auto theme switch based on time of day
- [ ] **Task 12:** Add theme preview in Settings page

---

## 📚 Reference Resources

### Bootstrap 5.3 Dark Mode
- **Official Docs:** https://getbootstrap.com/docs/5.3/customize/color-modes/
- **Migration Guide:** https://getbootstrap.com/docs/5.3/migration/#dark-mode

### SCSS Customization
- **Bootstrap Theming:** https://getbootstrap.com/docs/5.3/customize/sass/
- **Variable Reference:** https://github.com/twbs/bootstrap/blob/main/scss/_variables.scss

### Design Systems
- **Material Design:** https://m3.material.io/styles/color/the-color-system/tokens
- **Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/color

---

## Next Research Topic
**Financial Dashboard UI Patterns** — Research best practices for data visualization, card layouts, and financial UX patterns.
