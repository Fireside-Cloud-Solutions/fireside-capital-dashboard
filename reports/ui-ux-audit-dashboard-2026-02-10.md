# UI/UX Audit Report — Dashboard Page
**Date:** February 10, 2026 — 5:26 AM  
**Page:** index.html (Dashboard)  
**Auditor:** Capital (Architect Agent)

---

## Executive Summary
The Dashboard page has a solid foundation with good performance optimizations (lazy-loading, DNS prefetch) and accessibility features. However, there are 8 actionable issues ranging from critical (loading state UX, CSS bundling) to minor (ARIA attributes, class consistency).

**Priority Breakdown:**
- 🔴 HIGH: 3 issues (skeleton states, CSS bundling, font loading)
- 🟡 MEDIUM: 3 issues (onboarding modal size, auth flash, empty states)
- 🟢 LOW: 2 issues (ARIA attributes, chart class consistency)

---

## CRITICAL ISSUES (HIGH PRIORITY)

### Issue #1: Skeleton Loading States Lack Context
**Location:** Stats cards (`.stat-card.loading`)  
**Current State:** Generic gray skeleton boxes with no labels  
**Problem:** Users see 6 identical gray boxes for 3-5 seconds with no indication what data is loading  
**Impact:** Confusing first-load experience, appears "broken" to new users  

**Recommended Fix:**
```html
<!-- BEFORE -->
<div class="stat-card loading">
  <div class="stat-card-skeleton">
    <div class="skeleton-loader skeleton-value"></div>
  </div>
  <div class="stat-value d-none" id="netWorthValue">$0.00</div>
</div>

<!-- AFTER -->
<div class="stat-card loading">
  <div class="stat-card-header">
    <span class="stat-label">Net Worth</span> <!-- KEEP VISIBLE -->
    <div class="stat-icon">...</div> <!-- KEEP VISIBLE -->
  </div>
  <div class="stat-card-skeleton">
    <div class="skeleton-loader skeleton-value"></div>
  </div>
  <div class="stat-value d-none" id="netWorthValue">$0.00</div>
</div>
```

**Work Item:** User Story  
**Title:** Improve skeleton loading states with visible labels  
**Effort:** 2 hours  
**Tags:** UX, Dashboard, Loading-States

---

### Issue #2: Performance — Multiple CSS Files
**Location:** `<head>` section  
**Current State:** 7+ separate CSS files loaded synchronously  
**Problem:** Each file = 1 HTTP request, blocking render until all downloaded  
**Impact:** First Contentful Paint (FCP) delayed by 500-800ms on 4G connections  

**Files to Bundle:**
1. `design-tokens.css` (vars)
2. `main.css` (base styles)
3. `components.css` (cards, buttons)
4. `responsive.css` (media queries)
5. `utilities.css` (spacing, helpers)

**Keep Separate:**
- `accessibility.css` (progressive enhancement)
- `logged-out-cta.css` (auth-dependent)
- `onboarding.css` (conditional on first visit)

**Recommended Fix:**
```bash
# Build script to concatenate critical CSS
cat design-tokens.css main.css components.css responsive.css utilities.css > bundle.css
```

**Work Item:** Task  
**Title:** Bundle critical CSS files into single stylesheet  
**Effort:** 3 hours (includes testing across all pages)  
**Tags:** Performance, CSS, Dashboard

---

### Issue #3: Google Fonts Blocking Render (FOIT)
**Location:** `<link href="https://fonts.googleapis.com/css2?family=Inter:...` in `<head>`  
**Current State:** No `font-display` strategy specified  
**Problem:** Text invisible for 1-2 seconds while fonts load (Flash of Invisible Text)  
**Impact:** Poor perceived performance, especially on mobile  

**Recommended Fix:**
```html
<!-- BEFORE -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Source+Serif+4:..." rel="stylesheet">

<!-- AFTER -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Source+Serif+4:...&display=swap" rel="stylesheet">
```

**Work Item:** Task  
**Title:** Add font-display:swap to Google Fonts for better FOIT handling  
**Effort:** 15 minutes  
**Tags:** Performance, Fonts, Quick-Win

---

## MODERATE ISSUES (MEDIUM PRIORITY)

### Issue #4: Onboarding Modal DOM Size
**Location:** Bottom of `index.html` (~lines 500-700)  
**Current State:** 200+ lines of onboarding wizard HTML always in DOM  
**Problem:** Increases initial HTML parse time even though modal is hidden  
**Impact:** +8KB HTML, slower Time to Interactive (TTI)  

**Recommended Fix:**
```javascript
// lazy-load-onboarding.js
if (!localStorage.getItem('onboarding_completed')) {
  fetch('partials/onboarding-modal.html')
    .then(r => r.text())
    .then(html => {
      document.body.insertAdjacentHTML('beforeend', html);
      // Then initialize onboarding.js
    });
}
```

**Work Item:** User Story  
**Title:** Lazy-load onboarding modal for first-time users only  
**Effort:** 4 hours  
**Tags:** Performance, Onboarding, FTUE

---

### Issue #5: Auth State Flash Prevention
**Location:** Inline critical CSS in `<head>`, lines 50-70  
**Current State:** Uses `opacity: 0; visibility: hidden` on auth containers  
**Problem:** Elements still rendered in DOM, slight flash on fast connections  
**Impact:** Minor visual polish issue  

**Recommended Fix:**
```css
/* BEFORE */
#loggedInState, #loggedOutState {
  opacity: 0;
  visibility: hidden;
}

/* AFTER */
#loggedInState, #loggedOutState {
  display: none;
}
body.auth-resolved #loggedInState.show,
body.auth-resolved #loggedOutState.show {
  display: block;
  animation: fadeIn 0.15s ease;
}
```

**Work Item:** Task  
**Title:** Improve auth state visibility with display:none instead of opacity  
**Effort:** 1 hour  
**Tags:** UX, Auth, Visual-Polish

---

### Issue #6: Empty State Styling Not Visible
**Location:** Upcoming Transactions widget, Subscriptions widget  
**Current State:** Shows generic spinner when no data exists  
**Problem:** New users see "Loading..." forever if they haven't added any data  
**Impact:** Confusing FTUE (First Time User Experience)  

**Recommended Fix:**
```html
<div id="upcomingPaymentsList">
  <!-- If no data -->
  <div class="empty-state">
    <i class="bi bi-calendar-x empty-state-icon"></i>
    <p class="empty-state-text">No upcoming transactions</p>
    <a href="bills.html" class="btn btn-sm btn-outline-secondary">Add Your First Bill</a>
  </div>
</div>
```

**Work Item:** User Story  
**Title:** Add friendly empty states for widgets with no data  
**Effort:** 3 hours  
**Tags:** UX, Empty-States, FTUE

---

## MINOR ISSUES (LOW PRIORITY)

### Issue #7: Mobile Sidebar Toggle Accessibility
**Location:** `.sidebar-toggle` button (hamburger menu)  
**Current State:** Has `aria-label="Toggle navigation"` but no `aria-expanded`  
**Problem:** Screen readers can't announce sidebar open/closed state  
**Impact:** Accessibility compliance (WCAG 2.1 Level AA)  

**Recommended Fix:**
```html
<button class="sidebar-toggle" id="sidebarToggle" 
        aria-label="Toggle navigation" 
        aria-expanded="false">
  <i class="bi bi-list"></i>
</button>
```
```javascript
// In sidebar toggle handler
sidebarToggle.addEventListener('click', () => {
  const isExpanded = sidebar.classList.toggle('show');
  sidebarToggle.setAttribute('aria-expanded', isExpanded);
});
```

**Work Item:** Task  
**Title:** Add aria-expanded attribute to mobile sidebar toggle  
**Effort:** 30 minutes  
**Tags:** Accessibility, A11y, WCAG

---

### Issue #8: Chart Wrappers Have Redundant Classes
**Location:** All chart cards in dashboard  
**Current State:** Some charts have both `.chart-height-lg` and `.chart-height-md`  
**Problem:** Inconsistent class usage, potential style conflicts  
**Impact:** Harder to maintain CSS, confusing for developers  

**Recommended Fix:**
```html
<!-- Standardize to ONE size class per chart -->
<div class="chart-wrapper chart-height-lg"> <!-- Large charts -->
<div class="chart-wrapper chart-height-md"> <!-- Medium charts -->
<div class="chart-wrapper chart-height-sm"> <!-- Small charts -->
```

**Work Item:** Task  
**Title:** Standardize chart height classes (one per chart)  
**Effort:** 1 hour  
**Tags:** CSS, Code-Quality, Refactor

---

## THINGS DONE RIGHT ✅
- **Chart.js lazy-loading** — Saves 270KB on non-dashboard pages
- **DNS prefetch/preconnect** — Reduces latency for external resources
- **Smooth transitions** — All interactive elements have 150-200ms transitions
- **Responsive grid** — Stats cards adapt from 1-column (mobile) to 3-column (desktop)
- **Skip-to-content link** — Keyboard navigation accessibility
- **CSRF protection** — Security scripts loaded and configured
- **Safe area insets** — iOS notch/Dynamic Island support with `env(safe-area-inset-top)`

---

## AZURE DEVOPS WORK ITEMS TO CREATE

### User Stories
1. **Improve skeleton loading states with visible labels** (HIGH, 2h)
2. **Lazy-load onboarding modal for first-time users only** (MEDIUM, 4h)
3. **Add friendly empty states for widgets with no data** (MEDIUM, 3h)

### Tasks
1. **Bundle critical CSS files into single stylesheet** (HIGH, 3h)
2. **Add font-display:swap to Google Fonts** (HIGH, 15min)
3. **Improve auth state visibility with display:none** (MEDIUM, 1h)
4. **Add aria-expanded attribute to mobile sidebar toggle** (LOW, 30min)
5. **Standardize chart height classes** (LOW, 1h)

---

## NEXT AUDIT
**Page:** Assets (assets.html)  
**Focus Areas:** Form validation, data table UX, mobile responsiveness
