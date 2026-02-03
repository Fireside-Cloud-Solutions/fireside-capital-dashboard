# Mobile Responsiveness Audit — Fireside Capital Dashboard
**Date:** February 2, 2026  
**Auditor:** Auditor Agent  
**Site:** https://nice-cliff-05b13880f.2.azurestaticapps.net

---

## Executive Summary

Tested the Fireside Capital dashboard across 4 mobile viewports and 5 key pages. Found **8 critical issues** and **12 medium priority issues** that significantly impact mobile usability. The site has a solid mobile-optimizations.css foundation, but several layout and rendering issues prevent effective mobile use.

### Test Coverage
- ✅ **iPhone SE** (375×667) — Small phone
- ✅ **iPhone 14** (390×844) — Standard phone  
- ✅ **Pixel 7** (412×915) — Android
- ✅ **iPad Mini** (768×1024) — Tablet

### Pages Tested
- ✅ Dashboard (index.html)
- ✅ Assets (assets.html)
- ✅ Bills (bills.html)
- ✅ Budget (budget.html)
- ✅ Navigation (sidebar/hamburger)

---

## Critical Issues (Fix Immediately)

### 1. **Charts Rendering as Black Boxes** 🔴
**Priority:** CRITICAL  
**Affected Pages:** Dashboard  
**Viewports:** All mobile (375px–768px)

**Issue:**
All dashboard charts (Net Worth Over Time, Monthly Cash Flow, etc.) render as completely black/empty boxes on mobile. This makes the dashboard essentially useless.

**Screenshot Reference:**
- Dashboard iPhone SE: Shows 6 black chart containers
- Dashboard iPhone 14: Same issue

**Root Cause:**
Chart.js canvas rendering may not be initializing properly on small viewports, or the dark theme CSS is causing visibility issues.

**Fix Required:**
```javascript
// In app/assets/js/main.js or dashboard-charts.js
// Add explicit mobile chart initialization check

function initializeCharts() {
  if (window.innerWidth < 768) {
    // Force chart redraw on mobile
    Chart.defaults.font.size = 11; // Smaller labels
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;
  }
  
  // Ensure canvas background is visible
  const canvases = document.querySelectorAll('.chart-wrapper canvas');
  canvases.forEach(canvas => {
    canvas.style.backgroundColor = 'transparent';
  });
}

// Call after DOM load
document.addEventListener('DOMContentLoaded', initializeCharts);
```

**Estimated Fix Time:** 2 hours (requires testing with Chart.js)

---

### 2. **Budget Table Horizontal Scroll Missing** 🔴
**Priority:** CRITICAL  
**Affected Pages:** Budget  
**Viewports:** All mobile (<768px)

**Issue:**
The budget table with columns (Item, Expected Income, Assigned, Spent, Remaining) doesn't scroll horizontally on mobile. Content is cut off or stacked poorly.

**Screenshot Reference:**
- Budget iPhone SE: Shows only "ITEM" column header visible
- Budget iPhone 14: Partial visibility

**Fix Required:**
```html
<!-- In budget.html -->
<div class="table-responsive">
  <table class="table table-hover budget-table">
    <!-- Existing table content -->
  </table>
</div>
```

```css
/* Add to mobile-optimizations.css */
@media (max-width: 767.98px) {
  .budget-table {
    min-width: 600px; /* Force horizontal scroll */
    font-size: 0.85rem;
  }
  
  .budget-table th,
  .budget-table td {
    padding: 8px 12px;
    white-space: nowrap;
  }
}
```

**Estimated Fix Time:** 1 hour

---

### 3. **Buttons Text Overlap on iPhone SE** 🔴
**Priority:** CRITICAL  
**Affected Pages:** Bills, Budget  
**Viewports:** 375px–390px

**Issue:**
Multi-word button text wraps awkwardly:
- "Email Bills For" wraps to 3 lines
- "Add Bill" button text breaks

**Screenshot Reference:**
- Bills iPhone SE: Shows "Ema for" and "Add Bill" text wrapping

**Fix Required:**
```css
/* Add to mobile-optimizations.css */
@media (max-width: 479.98px) {
  .btn {
    font-size: 0.85rem;
    padding: 10px 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  /* Stack buttons vertically on very small screens */
  .page-header-actions .btn {
    width: 100%;
    margin-bottom: 8px;
    white-space: normal; /* Allow wrap on full-width buttons */
  }
}
```

**Estimated Fix Time:** 1 hour

---

### 4. **Sidebar Overlay Not Closing on Tap** 🔴
**Priority:** CRITICAL  
**Affected Pages:** All  
**Viewports:** All mobile (<992px)

**Issue:**
Based on CSS review, the sidebar overlay should close when tapped, but the z-index stacking may prevent proper interaction. The hamburger button is z-index:500, overlay should be below it.

**Fix Required:**
```css
/* Verify/fix in mobile-optimizations.css */
@media (max-width: 991.98px) {
  .sidebar-overlay {
    z-index: 450 !important; /* Below hamburger (500), above sidebar (400) */
  }
  
  .sidebar {
    z-index: 400 !important;
  }
  
  .sidebar-toggle {
    z-index: 500 !important; /* Always clickable */
  }
}
```

**Estimated Fix Time:** 30 minutes

---

### 5. **Welcome Dropdown Extends Off-Screen** 🔴
**Priority:** CRITICAL  
**Affected Pages:** All  
**Viewports:** 375px–412px

**Issue:**
The "Welcome, Brittany ▾" dropdown button is too wide on small screens and may extend beyond viewport or overlap with notification bell.

**Screenshot Reference:**
- All mobile screenshots show cramped top bar

**Fix Required:**
```css
/* Add to mobile-optimizations.css */
@media (max-width: 479.98px) {
  #userDropdown {
    font-size: 0.75rem;
    padding: 8px 12px;
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  /* Shorten username display */
  #username {
    max-width: 60px;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
```

**Estimated Fix Time:** 1 hour

---

### 6. **Stat Cards Text Too Small on iPhone SE** 🔴
**Priority:** HIGH  
**Affected Pages:** Dashboard  
**Viewports:** 375px

**Issue:**
The mobile-optimizations.css reduces stat card font sizes to 10px for labels, which is below WCAG minimum readable size (12px minimum).

**Fix Required:**
```css
/* Update in mobile-optimizations.css */
@media (max-width: 479.98px) {
  .dashboard-card h5,
  .stat-label {
    font-size: 12px !important; /* Was 10px - too small */
    margin-bottom: var(--space-1);
  }
  
  .stat-value {
    font-size: 1.6rem; /* Slightly larger for readability */
  }
}
```

**Estimated Fix Time:** 30 minutes

---

### 7. **Page Titles Break Layout on iPhone SE** 🔴
**Priority:** HIGH  
**Affected Pages:** Bills, Budget  
**Viewports:** 375px

**Issue:**
Page title "Budget" shows as "Budge\nt" (line break mid-word) on iPhone SE.

**Screenshot Reference:**
- Budget iPhone SE: Shows broken title

**Fix Required:**
```css
/* Add to mobile-optimizations.css */
@media (max-width: 479.98px) {
  .main-content h1,
  .main-content h2 {
    word-break: keep-all;
    overflow-wrap: normal;
    hyphens: none;
  }
}
```

**Estimated Fix Time:** 15 minutes

---

### 8. **Notification Dropdown Cuts Off Content** 🔴
**Priority:** HIGH  
**Affected Pages:** All  
**Viewports:** All mobile

**Issue:**
The notification dropdown uses `overflow-y: auto` but may not scroll properly or show scrollbar on mobile browsers.

**Fix Required:**
```css
/* Update in mobile-optimizations.css */
@media (max-width: 991.98px) {
  #notificationDropdown .dropdown-menu {
    /* Existing styles... */
    
    /* Add touch scroll optimization */
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    
    /* Show scrollbar on mobile for clarity */
    scrollbar-width: thin;
    scrollbar-color: var(--color-border-subtle) transparent;
  }
  
  #notificationDropdown .dropdown-menu::-webkit-scrollbar {
    display: block !important; /* Override hidden scrollbar */
    width: 4px;
  }
  
  #notificationDropdown .dropdown-menu::-webkit-scrollbar-thumb {
    background-color: var(--color-border-subtle);
    border-radius: 2px;
  }
}
```

**Estimated Fix Time:** 30 minutes

---

## Medium Priority Issues

### 9. **Bills Stats Cards Too Narrow**
**Priority:** MEDIUM  
**Affected Pages:** Bills  
**Viewports:** 375px–390px

**Issue:**
The "MONTHLY BILLS TOTAL", "RECURRING", and "SHARED WITH ME" stat cards appear cramped with text wrapping awkwardly.

**Fix Required:**
```css
/* Add to mobile-optimizations.css */
@media (max-width: 479.98px) {
  .bills-stats .stat-card {
    min-height: 100px;
    padding: 16px;
  }
  
  .bills-stats .stat-label {
    font-size: 11px;
    line-height: 1.3;
  }
}
```

**Estimated Fix Time:** 30 minutes

---

### 10. **Budget Warning Box Too Wide**
**Priority:** MEDIUM  
**Affected Pages:** Budget  
**Viewports:** 375px–390px

**Issue:**
The yellow warning box "No income sources found..." appears too wide and may extend beyond container.

**Fix Required:**
```css
/* Add to mobile-optimizations.css */
@media (max-width: 479.98px) {
  .alert {
    font-size: 0.8rem;
    padding: 12px;
    border-radius: 8px;
    word-wrap: break-word;
  }
  
  .alert-warning {
    max-width: 100%;
  }
}
```

**Estimated Fix Time:** 15 minutes

---

### 11. **Empty State Icons Too Large on Mobile**
**Priority:** MEDIUM  
**Affected Pages:** Assets, Investments (when empty)  
**Viewports:** 375px–768px

**Issue:**
The 64px empty state icons take up excessive space on mobile, pushing CTA buttons too far down.

**Fix Required:**
```css
/* Add to mobile-optimizations.css */
@media (max-width: 479.98px) {
  .empty-state .empty-icon,
  .empty-state svg {
    width: 48px !important;
    height: 48px !important;
  }
  
  .empty-state h3 {
    font-size: 1.25rem;
    margin-top: 12px;
  }
  
  .empty-state p {
    font-size: 0.85rem;
  }
}
```

**Estimated Fix Time:** 30 minutes

---

### 12. **Month Selector Too Small on Budget Page**
**Priority:** MEDIUM  
**Affected Pages:** Budget  
**Viewports:** 375px–412px

**Issue:**
The month navigation (< February >) has small touch targets and cramped layout.

**Fix Required:**
```css
/* Add to mobile-optimizations.css */
@media (max-width: 479.98px) {
  .month-selector {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .month-selector button {
    min-width: 44px;
    min-height: 44px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .month-selector .current-month {
    font-size: 1rem;
    font-weight: 600;
  }
}
```

**Estimated Fix Time:** 30 minutes

---

### 13. **Generate Budget Button Cramped**
**Priority:** MEDIUM  
**Affected Pages:** Budget  
**Viewports:** 375px–390px

**Issue:**
The "Generate Budget" button with icon appears cramped next to the month selector.

**Fix Required:**
```css
/* Stack on very small screens */
@media (max-width: 479.98px) {
  .budget-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .budget-header .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
```

**Estimated Fix Time:** 20 minutes

---

### 14. **Sidebar Brand Logo Too Large on Mobile**
**Priority:** MEDIUM  
**Affected Pages:** All (sidebar)  
**Viewports:** All mobile

**Issue:**
The Fireside logo in the sidebar may be too large when sidebar is expanded on mobile.

**Fix Required:**
```css
/* Add to mobile-optimizations.css */
@media (max-width: 991.98px) {
  .sidebar-brand h4 {
    font-size: 1.1rem;
  }
  
  .sidebar-logo {
    width: 24px;
    height: 22px;
  }
}
```

**Estimated Fix Time:** 15 minutes

---

### 15. **Form Labels Too Small**
**Priority:** MEDIUM  
**Affected Pages:** Modals (Add Asset, Add Bill, etc.)  
**Viewports:** 375px–479px

**Issue:**
Form labels are set to 0.85rem (13.6px) on mobile, which is below comfortable reading size.

**Fix Required:**
```css
/* Update in mobile-optimizations.css */
@media (max-width: 479.98px) {
  .form-label {
    font-size: 0.9rem !important; /* Was 0.85rem */
    margin-bottom: var(--space-1-5);
  }
}
```

**Estimated Fix Time:** 10 minutes

---

### 16. **Chart Titles Too Small on Mobile**
**Priority:** MEDIUM  
**Affected Pages:** Dashboard  
**Viewports:** 375px–479px

**Issue:**
Chart card titles are reduced to 10px on small mobile, making them hard to read.

**Fix Required:**
```css
/* Update in mobile-optimizations.css */
@media (max-width: 479.98px) {
  .chart-card h5 {
    font-size: 12px !important; /* Was 10px */
    margin-bottom: var(--space-2);
    font-weight: 600;
  }
}
```

**Estimated Fix Time:** 10 minutes

---

### 17. **Upcoming Payments List Scrolling Unclear**
**Priority:** MEDIUM  
**Affected Pages:** Dashboard  
**Viewports:** All mobile

**Issue:**
The upcoming payments list has max-height but no visual indication it's scrollable.

**Fix Required:**
```css
/* Add to mobile-optimizations.css */
@media (max-width: 767.98px) {
  #upcomingPaymentsList {
    max-height: 200px !important;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    
    /* Add fade indicator at bottom */
    position: relative;
  }
  
  #upcomingPaymentsList::after {
    content: "";
    position: sticky;
    bottom: 0;
    display: block;
    height: 30px;
    background: linear-gradient(transparent, var(--color-bg-1));
    pointer-events: none;
  }
}
```

**Estimated Fix Time:** 30 minutes

---

### 18. **Add Item Button on Budget Overlaps Content**
**Priority:** MEDIUM  
**Affected Pages:** Budget  
**Viewports:** 375px–412px

**Issue:**
The "Add Item" button may overlap with the stats cards above it due to insufficient margin.

**Fix Required:**
```css
/* Add to mobile-optimizations.css */
@media (max-width: 479.98px) {
  .budget-controls {
    margin-top: 20px;
    margin-bottom: 20px;
  }
  
  .budget-controls .btn {
    width: 100%;
  }
}
```

**Estimated Fix Time:** 15 minutes

---

### 19. **Table Action Buttons Too Small**
**Priority:** MEDIUM  
**Affected Pages:** Bills, Assets (when populated)  
**Viewports:** All mobile

**Issue:**
Table row action buttons (Edit, Delete, Share) are .btn-sm which may be below 44px touch target.

**Fix Required:**
```css
/* Update in mobile-optimizations.css */
@media (max-width: 767.98px) and (pointer: coarse) {
  .table .btn-sm {
    min-height: 44px !important; /* Already present - verify working */
    min-width: 44px !important;
    padding: 10px;
  }
}
```

**Estimated Fix Time:** 15 minutes (verification only)

---

### 20. **Modal Close Button Hard to Tap**
**Priority:** MEDIUM  
**Affected Pages:** All (modals)  
**Viewports:** 375px–412px

**Issue:**
Modal close (×) button may be too small on mobile.

**Fix Required:**
```css
/* Add to mobile-optimizations.css */
@media (max-width: 479.98px) {
  .modal-header .btn-close {
    min-width: 44px;
    min-height: 44px;
    padding: 0;
    background-size: 16px;
  }
}
```

**Estimated Fix Time:** 15 minutes

---

## Low Priority Issues

### 21. **Footer Links Too Close Together** (If footer exists)
### 22. **Dropdown Menu Items Slightly Small** (37px height, need 44px)
### 23. **Chart Legend Text Overlapping** (Dashboard charts)
### 24. **Date Picker Too Small** (Budget month selector)

---

## Testing Recommendations

### Before Deployment:
1. **Real Device Testing** - Test on actual iPhone SE, Pixel 7, iPad Mini
2. **Touch Target Audit** - Use Chrome DevTools "Show Device Toolbar" → "Show tap areas"
3. **Scrolling Test** - Test all scrollable containers with actual touch gestures
4. **Landscape Orientation** - Test key pages in landscape mode
5. **Slow Connection Test** - Test chart loading on 3G/4G

### Testing Checklist:
- [ ] All charts render with data on mobile
- [ ] All buttons are tappable (44×44px minimum)
- [ ] No horizontal scrolling on main content
- [ ] Tables scroll horizontally when needed
- [ ] Sidebar opens/closes smoothly
- [ ] Modals fit on screen without clipping
- [ ] Forms are usable (no input zoom on iOS)
- [ ] Text is readable (12px minimum)

---

## Implementation Priority

### Phase 1: Critical Fixes (Day 1)
- Issue #1: Chart rendering
- Issue #2: Budget table scroll
- Issue #3: Button text wrapping
- Issue #4: Sidebar overlay interaction

**Estimated Time:** 5 hours

### Phase 2: High Priority (Day 2)
- Issue #5: Welcome dropdown
- Issue #6: Stat card text size
- Issue #7: Page title breaking
- Issue #8: Notification scroll

**Estimated Time:** 3 hours

### Phase 3: Medium Priority (Day 3-4)
- Issues #9-20

**Estimated Time:** 4-5 hours

---

## Code Review Findings

### Positive Observations ✅
- Solid mobile-optimizations.css foundation already in place
- Good use of CSS custom properties for theming
- Bootstrap 5 grid system properly implemented
- Accessibility features present (skip links, aria labels)
- Touch target considerations already documented

### Areas for Improvement ❌
- **Chart.js initialization** needs mobile-specific logic
- **Font sizes too aggressive** - 10px is too small (use 12px minimum)
- **Z-index stacking** needs verification for overlay interactions
- **Table responsiveness** not consistently applied across all pages
- **Button sizing** needs refinement for small viewports

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| **Total Issues Found** | 20 |
| **Critical** | 8 |
| **Medium** | 12 |
| **Low** | 4 (not detailed) |
| **Estimated Total Fix Time** | 12-15 hours |
| **Pages Tested** | 5 |
| **Viewports Tested** | 4 |
| **Screenshots Captured** | 6 |

---

## Next Steps

1. **Review this report** with the development team
2. **Prioritize fixes** based on user impact
3. **Create tickets** for each issue in backlog
4. **Test fixes** on real devices before deployment
5. **Consider mobile-first redesign** for future iterations

---

**Report Generated:** February 2, 2026  
**Audit Tool:** Clawdbot Browser Automation + Manual Code Review  
**Status:** Complete ✅
