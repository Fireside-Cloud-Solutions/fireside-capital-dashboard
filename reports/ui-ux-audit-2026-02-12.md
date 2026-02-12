# UI/UX Audit Report — February 12, 2026

**Auditor:** Architect (Capital AI)  
**Scope:** Fireside Capital Dashboard  
**Pages Reviewed:** Dashboard (index.html), Assets, Bills  
**CSS Files Reviewed:** main.css, components.css  

---

## 🔴 CRITICAL ISSUES (P0)

### 1. Notification Dropdown Width Conflict
**Issue:** Conflicting width constraints in notification dropdown causing potential layout breaks  
**Location:** `app/assets/css/components.css` lines 65-72  
**Current Code:**
```css
#notificationList,
#notificationDropdown .dropdown-menu,
.notification-dropdown-menu {
  width: 550px !important;
  max-width: 90vw !important;
  min-width: 400px !important;
}
```
**Problem:** On screens between 400px-610px (mobile), the min-width (400px) conflicts with max-width (90vw). On a 450px screen, 90vw = 405px, but min-width forces 400px, leaving only 50px for margins/padding.

**Fix:**
```css
#notificationList,
#notificationDropdown .dropdown-menu,
.notification-dropdown-menu {
  width: 550px !important;
  max-width: calc(100vw - 32px) !important; /* Allow 16px margins on each side */
  min-width: min(400px, calc(100vw - 32px)) !important; /* Responsive min-width */
}
```
**Priority:** P0 — Blocks mobile usability  
**Estimated Fix Time:** 5 minutes

---

### 2. Mobile Auth State Positioning Race Condition
**Issue:** Auth state containers (Login/Signup buttons) use `position: fixed` with `z-index: var(--z-modal)` (400), which conflicts with modal backdrops and sidebar overlay  
**Location:** `app/index.html`, `app/assets.html`, `app/bills.html` (inline `<style>` blocks)  
**Current Code:**
```css
#loggedInState, #loggedOutState {
  position: fixed !important;
  top: max(12px, env(safe-area-inset-top)) !important;
  right: 16px;
  z-index: var(--z-modal); /* 400 - conflicts with modals */
}
```
**Problem:** When a modal is open, the auth buttons appear OVER the modal backdrop, breaking visual hierarchy. Expected z-index stacking:
- Modal backdrop: 1050
- Modal: 1055
- Auth buttons: should be BELOW backdrop when modal is open

**Fix:**
```css
#loggedInState, #loggedOutState {
  position: fixed !important;
  top: max(12px, env(safe-area-inset-top)) !important;
  right: 16px;
  z-index: var(--z-sticky); /* 200 - page-level UI, not modal-level */
}
```
**Priority:** P0 — Breaks modal interactions on mobile  
**Estimated Fix Time:** 10 minutes (update all HTML files)

---

## 🟠 HIGH PRIORITY (P1)

### 3. Table Horizontal Scroll Breakpoint Too High
**Issue:** Tables force horizontal scroll at 600px min-width, but many modern phones are 390px-430px wide  
**Location:** `app/assets/css/main.css` lines 1520-1524 (approx)  
**Current Code:**
```css
@media (max-width: 575.98px) {
  .table {
    min-width: 600px; /* Forces scroll on ALL mobile devices */
  }
}
```
**Problem:** On a 390px iPhone, users must scroll 210px horizontally to see full table. This is excessive and hurts UX.

**Fix:** Implement responsive table columns with collapsible/stackable design:
```css
@media (max-width: 575.98px) {
  .table {
    min-width: 100%; /* Use full available width */
  }
  
  /* Hide non-essential columns on mobile */
  .table th:nth-child(n+5),
  .table td:nth-child(n+5) {
    display: none;
  }
  
  /* OR: Stack table cells vertically (card-style) */
  .table tbody tr {
    display: block;
    margin-bottom: 16px;
    border: 1px solid var(--color-border-subtle);
    border-radius: 8px;
  }
  
  .table tbody td {
    display: block;
    text-align: right;
    padding: 8px 16px;
  }
  
  .table tbody td::before {
    content: attr(data-label);
    float: left;
    font-weight: 600;
    color: var(--color-text-secondary);
  }
}
```
**Priority:** P1 — Impacts mobile usability significantly  
**Estimated Fix Time:** 2-4 hours (requires HTML data-label attributes)

---

### 4. Chart Height Constraint Conflicts
**Issue:** Chart wrappers have multiple conflicting height constraints causing overflow or clipping  
**Location:** `app/assets/css/main.css` lines 890-898 (approx)  
**Current Code:**
```css
.chart-wrapper {
  position: relative;
  width: 100%;
  min-height: 250px;
  max-width: 100%;
  overflow: hidden;
}

/* Earlier rule was removed but may still cause issues in derived classes */
```
**Problem:** Charts use `chart-height-lg` and `chart-height-md` utility classes, but these might inherit conflicting heights from parent `.chart-wrapper`.

**Fix:** Ensure utility classes override wrapper defaults:
```css
.chart-wrapper {
  position: relative;
  width: 100%;
  min-height: 250px;
  max-width: 100%;
  overflow: hidden;
}

.chart-wrapper.chart-height-lg {
  min-height: 400px !important;
  max-height: 400px !important;
}

.chart-wrapper.chart-height-md {
  min-height: 300px !important;
  max-height: 300px !important;
}
```
**Priority:** P1 — Charts may appear cropped or stretched  
**Estimated Fix Time:** 30 minutes

---

## 🟡 MEDIUM PRIORITY (P2)

### 5. Form Validation Error Message Positioning
**Issue:** No explicit positioning for `.invalid-feedback` messages — may overlap with next form field  
**Location:** `app/assets/css/main.css` (missing rule)  
**Current State:** Bootstrap default (relies on document flow)

**Fix:** Add consistent spacing:
```css
.invalid-feedback {
  display: block;
  margin-top: 8px;
  margin-bottom: 16px; /* Prevent overlap with next field */
  font-size: 14px;
  color: var(--color-error);
  line-height: 1.4;
}

.form-control.is-invalid ~ .invalid-feedback {
  display: block;
}
```
**Priority:** P2 — Affects form usability when errors occur  
**Estimated Fix Time:** 15 minutes

---

### 6. Empty State Icon Size Not Mobile-Optimized
**Issue:** Empty state icons are 64px on all screen sizes, too large on small mobile  
**Location:** `app/assets/css/main.css` lines 1470 (approx)  
**Current Code:**
```css
.empty-state-icon {
  font-size: 64px;
}
```
**Fix:** Scale down on mobile:
```css
.empty-state-icon {
  font-size: 64px;
}

@media (max-width: 575.98px) {
  .empty-state-icon {
    font-size: 48px;
  }
}

@media (max-width: 375px) {
  .empty-state-icon {
    font-size: 40px;
  }
}
```
**Priority:** P2 — Visual polish  
**Estimated Fix Time:** 10 minutes

---

### 7. Sidebar Logo Not Tappable on Mobile
**Issue:** Sidebar logo/brand is not a clickable link to return to dashboard  
**Location:** `app/index.html` lines 75-85 (approx)  
**Current Code:**
```html
<div class="sidebar-brand">
  <h4>
    <svg class="sidebar-logo" ...>...</svg>
    Fireside Capital
  </h4>
</div>
```
**Fix:** Make it a link:
```html
<div class="sidebar-brand">
  <a href="index.html" aria-label="Fireside Capital Home">
    <h4>
      <svg class="sidebar-logo" ...>...</svg>
      Fireside Capital
    </h4>
  </a>
</div>
```
Add CSS:
```css
.sidebar-brand a {
  text-decoration: none;
  color: inherit;
  display: block;
  padding: 0;
  border: none;
  transition: opacity 0.15s ease;
}

.sidebar-brand a:hover {
  opacity: 0.8;
  background: transparent;
}
```
**Priority:** P2 — Common UX pattern  
**Estimated Fix Time:** 15 minutes

---

## 🟢 LOW PRIORITY (P3)

### 8. Button Icon Spacing Inconsistency
**Issue:** Some buttons use `me-2` for icon spacing, others rely on gap utility  
**Location:** Various HTML files (sidebar links use `me-2`, page action buttons use parent gap)  
**Recommendation:** Standardize on CSS gap for all buttons (already in `.btn { gap: 8px; }`)  
**Fix:** Remove redundant `me-2` classes from button icons:
```html
<!-- Before -->
<button class="btn btn-primary">
  <i class="bi bi-plus-circle me-2"></i> Add Asset
</button>

<!-- After -->
<button class="btn btn-primary">
  <i class="bi bi-plus-circle"></i> Add Asset
</button>
```
**Priority:** P3 — Visual consistency (minor)  
**Estimated Fix Time:** 1 hour (search/replace across all HTML)

---

### 9. Missing Keyboard Navigation Indicators
**Issue:** Dropdown menus and modals don't show keyboard focus clearly enough  
**Location:** `app/assets/css/main.css` `:focus-visible` rules exist but may need enhancement  
**Current Code:**
```css
:focus-visible {
  outline: var(--focus-ring);
  outline-offset: var(--focus-ring-offset);
}
```
**Fix:** Add focus states to dropdown items:
```css
.dropdown-item:focus-visible {
  outline: 2px solid var(--color-secondary);
  outline-offset: -2px;
  background-color: var(--color-bg-3);
}

.modal-content:focus-visible {
  outline: 3px solid var(--color-secondary);
  outline-offset: 4px;
}
```
**Priority:** P3 — Accessibility enhancement  
**Estimated Fix Time:** 30 minutes

---

### 10. Time Range Filter Mobile Overflow
**Issue:** Time range filter buttons with 5+ options may overflow on very small screens (320px)  
**Location:** `app/assets/css/main.css` lines 980-1020 (approx)  
**Current Code:** Buttons use `flex: 1` to divide space equally  
**Recommendation:** On very small screens, allow 2-row layout:
```css
@media (max-width: 359.98px) {
  .time-range-filter {
    flex-wrap: wrap;
  }
  
  .time-range-filter .btn {
    flex: 1 1 calc(50% - 4px); /* 2 buttons per row */
    min-width: 60px;
  }
}
```
**Priority:** P3 — Edge case (320px devices rare)  
**Estimated Fix Time:** 20 minutes

---

## ✅ POSITIVE FINDINGS

1. **Excellent** consistent 8px spacing grid usage
2. **Strong** accessibility foundation (skip links, ARIA labels, semantic HTML)
3. **Good** dark mode implementation with proper contrast
4. **Solid** responsive breakpoint coverage (991px, 575px, 375px, 359px)
5. **Professional** transition timing (150ms-200ms) across interactive elements
6. **Well-implemented** loading states and skeleton loaders

---

## 📊 SUMMARY

| Priority | Count | Total Estimated Time |
|----------|-------|---------------------|
| P0 (Critical) | 2 | 15 minutes |
| P1 (High) | 2 | 5-6 hours |
| P2 (Medium) | 3 | 40 minutes |
| P3 (Low) | 3 | 2 hours |
| **TOTAL** | **10** | **~8 hours** |

---

## 🎯 RECOMMENDED ACTION PLAN

### Immediate (Today)
1. Fix notification dropdown width conflict (5min)
2. Fix auth state z-index issue (10min)

### This Week
3. Implement responsive table design (4h)
4. Fix chart height constraints (30min)
5. Add form validation spacing (15min)

### Next Sprint
6. Optimize empty state icons for mobile (10min)
7. Make sidebar logo clickable (15min)
8. Standardize button icon spacing (1h)
9. Enhance keyboard focus indicators (30min)
10. Fix time range filter overflow (20min)

---

**Next Audit Session:** Review Investments, Debts, Income, Transactions pages  
**Pages Remaining:** 7 of 11 pages  
**Overall Progress:** 36% complete
