# UI/UX Audit Report: Dashboard (index.html)

**Date:** February 9, 2026  
**Page:** index.html (Main Dashboard)  
**Auditor:** Architect Agent  
**Status:** In Progress

---

## Executive Summary

The Fireside Capital dashboard demonstrates strong foundation work with:
- ✅ Comprehensive design token system
- ✅ Dark/light theme support
- ✅ Accessibility features (WCAG 2.1 AA target)
- ✅ Responsive breakpoints
- ✅ Modern component structure

However, there are **critical UX issues** affecting usability, visual hierarchy, and mobile experience.

---

## Critical Issues (P0 - Must Fix)

### Issue 1: Visual Hierarchy Confusion
**Location:** All stat cards (lines 160-280)  
**Problem:** Net Worth, Total Assets, Debts, Investments, Bills, and Income cards all look identical with no visual differentiation. Users cannot quickly scan what matters most.

**Current State:**
- All cards use same background color (#1a1a1a)
- All values use same typography (28px bold)
- Only difference is icon color (easily missed)
- No semantic color coding for negative/positive values

**Fix:**
```css
/* Priority-based visual hierarchy */
.stat-card--primary { /* Net Worth - Most important */
  background: linear-gradient(135deg, rgba(244, 78, 36, 0.12) 0%, rgba(1, 164, 239, 0.08) 100%);
  border-left: 4px solid var(--color-primary);
}

.stat-card--danger { /* Debts - Needs attention */
  border-left: 4px solid var(--color-danger);
}

.stat-card--success { /* Assets/Investments - Positive */
  border-left: 4px solid var(--color-success);
}

/* Value Typography Hierarchy */
.stat-value--primary {
  font-size: 36px; /* Net Worth should be larger */
  font-weight: 700;
}

.stat-value--secondary {
  font-size: 28px; /* Other values */
}
```

**Priority:** P0  
**Effort:** 2 hours

---

### Issue 2: Empty State Failure
**Location:** Line 374 (subscriptionsList), Line 410 (upcomingPaymentsList)  
**Problem:** When no data exists, users see a tiny loading spinner permanently OR blank space with no guidance.

**Current State:**
```html
<div class="text-center py-3">
  <div class="spinner-border spinner-border-sm text-muted" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>
</div>
```

**Fix:**
```html
<div class="empty-state" id="subscriptionsEmptyState">
  <i class="bi bi-credit-card-2-front empty-state-icon"></i>
  <h3>No Subscriptions Yet</h3>
  <p>Track your recurring payments to see spending patterns</p>
  <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addBillModal">
    <i class="bi bi-plus-lg"></i> Add Subscription
  </button>
</div>
```

**Priority:** P0 (Users are currently stuck)  
**Effort:** 3 hours (requires JS changes)

---

### Issue 3: Mobile Header Collision
**Location:** Lines 73-103 (auth state buttons in header)  
**Problem:** On mobile, the hamburger menu button (top-left fixed) and the login/user dropdown buttons (top-right fixed) can overlap on very small screens (< 375px).

**Current Issue:**
- Both use `position: fixed !important`
- Both use `z-index: 1000`
- No collision detection

**Fix:**
```css
@media (max-width: 374.98px) {
  #loggedInState, #loggedOutState {
    top: 64px !important; /* Move below hamburger */
  }
  
  .main-content {
    padding-top: calc(var(--space-5) + 96px) !important; /* Account for stacked buttons */
  }
}
```

**Priority:** P0  
**Effort:** 1 hour

---

## High Priority Issues (P1 - Should Fix)

### Issue 4: Chart Loading Skeleton Inconsistency
**Location:** Lines 423-580 (chart cards)  
**Problem:** Charts use `.loading` class and skeleton placeholders, but they flash awkwardly during load. No smooth transition.

**Fix:**
```css
.chart-card.loading .chart-skeleton {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.3; }
}

.chart-card canvas {
  opacity: 0;
  transition: opacity 400ms ease-in;
}

.chart-card.loaded canvas {
  opacity: 1;
}
```

**Priority:** P1  
**Effort:** 2 hours

---

### Issue 5: Notification Bell Usability
**Location:** Line 144 (notificationBell)  
**Problem:** 
- Badge says "0" when there are no notifications (should be hidden)
- Bell doesn't indicate urgency (no color change for overdue bills)
- Dropdown is too narrow (550px max) - notification text wraps awkwardly

**Fix:**
```css
/* Hide badge when 0 */
#notificationBadge[data-count="0"] {
  display: none !important;
}

/* Urgent notification indicator */
#notificationBell.has-urgent {
  animation: bellPulse 2s ease-in-out infinite;
}

@keyframes bellPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(244, 78, 36, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(244, 78, 36, 0); }
}

/* Wider dropdown */
#notificationList {
  width: 420px !important;
  max-width: 92vw !important;
}
```

**Priority:** P1  
**Effort:** 2 hours

---

### Issue 6: Responsive Grid Breakpoints Wrong
**Location:** Lines 162-349 (stat cards row)  
**Problem:** Grid uses `col-12 col-md-6 col-lg-6 col-xl-4` which causes:
- 1 column on mobile (good)
- 2 columns on tablet (good)
- 2 columns on desktop (BAD - wastes space)
- 3 columns on XL (good)

Most users are on 1920x1080 displays (desktop size), seeing only 2 cards per row instead of 3.

**Fix:**
```html
<!-- Change all stat cards to: -->
<div class="col-12 col-sm-6 col-lg-4">
```

**Priority:** P1  
**Effort:** 15 minutes

---

## Medium Priority Issues (P2 - Nice to Have)

### Issue 7: Font Loading Flash
**Location:** Line 16-17 (Google Fonts CDN)  
**Problem:** Page renders with system fonts, then "flashes" when Inter/Source Serif 4 load. Looks unpolished.

**Fix:**
```css
/* Add to main.css */
@font-face {
  font-family: 'Inter';
  src: local('Inter'), url('/assets/fonts/Inter-var.woff2') format('woff2');
  font-display: swap;
}

@font-face {
  font-family: 'Source Serif 4';
  src: local('Source Serif 4'), url('/assets/fonts/SourceSerif4-var.woff2') format('woff2');
  font-display: swap;
}
```

**Priority:** P2  
**Effort:** 3 hours (requires font file hosting)

---

### Issue 8: Chart Color Palette Lacks Semantic Meaning
**Location:** N/A (controlled by assets/js/charts.js)  
**Problem:** Charts use random colors for categories. No visual logic.

**Recommendation:**
- Red/Orange: Expenses, debts, outgoing money
- Blue/Cyan: Income, assets, incoming money
- Green: Savings, positive growth
- Yellow/Amber: Alerts, warnings, upcoming payments

**Priority:** P2  
**Effort:** 4 hours (requires JS refactor)

---

### Issue 9: Welcome Button Positioning
**Location:** Line 150 (user dropdown)  
**Problem:** The "Welcome, [Username]" button has inconsistent text wrapping on tablets (768px-991px). "Welcome," prefix disappears via CSS but button doesn't resize smoothly.

**Fix:**
```css
@media (max-width: 991.98px) {
  .welcome-prefix {
    display: none;
  }
  
  #userDropdown {
    min-width: auto;
    padding-left: 12px;
    padding-right: 12px;
  }
}
```

**Priority:** P2  
**Effort:** 30 minutes

---

## Low Priority Issues (P3 - Polish)

### Issue 10: Sidebar Logo Not Vertically Centered
**Location:** Line 119 (sidebar-brand)  
**Problem:** Logo SVG and "Fireside Capital" text are slightly misaligned (logo appears 2px higher).

**Fix:**
```css
.sidebar-brand h4 {
  align-items: center; /* Already present */
  line-height: 1; /* Add this */
}

.sidebar-brand .sidebar-logo {
  margin-top: 2px; /* Visual compensation */
}
```

**Priority:** P3  
**Effort:** 10 minutes

---

## Accessibility Issues (WCAG 2.1 AA)

### Issue A11Y-1: Missing ARIA Labels on Charts
**Location:** Lines 423-580 (all canvas elements)  
**Problem:** Screen readers announce "canvas" with no context.

**Fix:**
```html
<canvas id="netWorthTimelineChart" 
        role="img" 
        aria-label="Net worth over time chart showing growth trend from January to February"></canvas>
```

**Priority:** P1  
**Effort:** 1 hour

---

### Issue A11Y-2: Stat Cards Not Semantic
**Location:** Lines 160-349  
**Problem:** Stat cards are `<div>` with no semantic structure. Screen readers announce values out of context.

**Fix:**
```html
<div class="stat-card" role="region" aria-labelledby="netWorthLabel">
  <div class="stat-card-header">
    <span class="stat-label" id="netWorthLabel">Net Worth</span>
    ...
  </div>
  <p class="stat-value" aria-live="polite" id="netWorthValue">$0.00</p>
</div>
```

**Priority:** P1  
**Effort:** 2 hours

---

## Performance Issues

### Issue PERF-1: Chart.js Lazy Loading Not Working
**Location:** Line 30 comment says Chart.js is lazy-loaded, but line 715 loads it eagerly with `defer`.

**Problem:** Dashboard loads 270 KB of Chart.js on every page, even settings.html.

**Fix:**
```html
<!-- Remove from index.html line 715 -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>

<!-- Add to assets/js/charts.js top -->
if (!window.Chart) {
  await import('https://cdn.jsdelivr.net/npm/chart.js@4');
}
```

**Priority:** P2  
**Effort:** 2 hours

---

## Summary Metrics

- **Total Issues Found:** 13
- **P0 (Critical):** 3
- **P1 (High):** 6
- **P2 (Medium):** 3
- **P3 (Low):** 1
- **Accessibility Issues:** 2
- **Performance Issues:** 1

**Estimated Total Effort:** 22.75 hours  
**Recommended Sprint Focus:** P0 + P1 issues (15 hours)

---

## Next Steps

1. Create Azure DevOps work items for each issue
2. Prioritize P0 issues for immediate sprint
3. Assign builder agent for implementation
4. Schedule QA review with auditor agent
5. Continue audit on remaining pages: assets.html, bills.html, budget.html, etc.
