# URGENT Visual Bugs — Immediate Fix List
**Date:** February 4, 2026, 2:16 PM EST  
**Priority:** P0 CRITICAL — User-reported issues  
**Estimated Time:** 3-4 hours

---

## 1. Delete Icons Too Small (Budget Page + Everywhere) 🔴
**Severity:** HIGH  
**Pages Affected:** Budget, Bills, Assets, Debts, Income, Investments  

**Issue:** Delete icons (trash can) are tiny and inconsistent with site proportions.

**Current:** Small `.bi-trash` icons (likely 16px or default size)  
**Expected:** Larger, more accessible icons (24px minimum)

**Fix:**
```css
/* In components.css or utilities.css */
.btn .bi-trash,
.action-icon .bi-trash {
  font-size: 1.25rem; /* 20px */
}

/* For icon-only buttons */
.btn-icon-only .bi {
  font-size: 1.5rem; /* 24px */
}
```

**Files to Update:**
- `assets/css/components.css` (add icon sizing utility)
- Search all HTML files for `.bi-trash` and ensure parent has proper class

**Time:** 30 minutes

---

## 2. Welcome Button Alignment Regression 🔴
**Severity:** CRITICAL (Regression)  
**Pages Affected:** All pages  

**Issue:** "Welcome, Matt" button pushed up to top again — alignment broken (we fixed this yesterday).

**Screenshot Evidence:** Button and notification bell are misaligned

**What Broke:** Likely CSS conflict or inline style override

**Fix Strategy:**
1. Check git history for yesterday's fix (commit hash)
2. Verify CSS rules are still present
3. Check for conflicting rules added since then
4. Re-apply the fix (symmetric padding approach)

**Expected:**
```css
#userDropdown {
  padding-top: 0.625rem;   /* 10px */
  padding-bottom: 0.625rem; /* 10px */
  vertical-align: middle;
}
```

**Time:** 20 minutes

---

## 3. Dashboard Chart Labels Unreadable 🔴
**Severity:** HIGH  
**Location:** Dashboard — Top Spending Categories chart  
**Screenshot:** Red box around legend text

**Issue:** Chart legend text is too small/low contrast, unreadable

**Fix:**
```javascript
// In charts.js, Top Spending Categories chart config
plugins: {
  legend: {
    position: 'right',
    labels: {
      color: theme.text,
      font: {
        size: 14, // Increase from 12
        weight: '500' // Make bolder
      },
      padding: 20, // More spacing
      boxWidth: 20,
      boxHeight: 20
    }
  }
}
```

**Time:** 15 minutes

---

## 4. Debt/Finance Cards Layout — Not Responsive 🔴
**Severity:** HIGH  
**Location:** Debts page — Financing & Payoff Tracking cards  
**Screenshot:** Shows current layout with issues

**Current Layout Problems:**
- Share/Edit/Delete buttons are below the financing name
- Financing name doesn't use full width
- "financing" tag and APR tag are on separate lines

**Expected Layout (Per User's Arrows):**
```
BMW PAYMENT                          [share] [edit] [delete]
─────────────────────────────────────────────────────────
[financing] [4.1% APR]

Progress: 60%
[progress bar]
...
```

**Fix:**
```html
<!-- Update card header structure -->
<div class="d-flex justify-content-between align-items-start mb-3">
  <div class="flex-grow-1">
    <h5 class="mb-2">BMW PAYMENT</h5>
    <div class="d-flex gap-2 flex-wrap">
      <span class="badge bg-secondary">financing</span>
      <span class="badge bg-warning text-dark">4.1% APR</span>
    </div>
  </div>
  <div class="d-flex gap-2">
    <button class="btn btn-sm btn-outline-secondary" aria-label="Share">
      <i class="bi bi-share"></i>
    </button>
    <button class="btn btn-sm btn-outline-secondary" aria-label="Edit">
      <i class="bi bi-pencil"></i>
    </button>
    <button class="btn btn-sm btn-outline-danger" aria-label="Delete">
      <i class="bi bi-trash"></i>
    </button>
  </div>
</div>
```

**Files to Update:**
- `debts.html` (card template)
- `assets/js/app.js` (renderFinancingCards function)

**Time:** 45 minutes

---

## 5. Shared Tags on Bills — Unreadable & Too Bright 🔴
**Severity:** HIGH  
**Location:** Bills page — Shared bill indicators  

**Issue:** "Shared" badges are too bright and text is unreadable

**Current:** Likely using `bg-warning` (bright yellow) or similar
**Expected:** Muted badge with good contrast

**Fix:**
```html
<!-- Change from -->
<span class="badge bg-warning">Shared</span>

<!-- To -->
<span class="badge bg-secondary">
  <i class="bi bi-people-fill me-1"></i>Shared
</span>
```

OR

```css
/* Custom shared badge style */
.badge-shared {
  background-color: rgba(129, 185, 0, 0.2); /* Green tint, 20% opacity */
  color: #81b900; /* Fireside green */
  border: 1px solid rgba(129, 185, 0, 0.4);
}
```

**Files to Update:**
- `bills.html` or `assets/js/app.js` (wherever badges are rendered)

**Time:** 20 minutes

---

## 6. Reports Page — Only One Chart 🔴
**Severity:** MEDIUM (Feature Gap)  
**Location:** Reports page  
**Screenshot:** Shows single "Net Worth Over Time" chart

**Issue:** Reports page only has one big chart. User wants key visualizations/KPIs moved here from dashboard.

**User's Intent:**
- Reports should highlight ONLY the most important metrics
- Dashboard should be cleaner with less clutter
- Reports becomes the "deep dive" page

**Proposed Reports Page Layout:**
```
┌─────────────────────────────────────────────────────┐
│ [TOTAL INVESTMENTS] [TOTAL DEBTS] [NET WORTH]       │ ← Already exists
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ NET WORTH OVER TIME                                  │ ← Already exists
│ [1M] [3M] [6M] [1Y] [ALL]                           │
│ [large line chart]                                   │
└─────────────────────────────────────────────────────┘

┌────────────────────┬────────────────────────────────┐
│ MONTHLY CASH FLOW  │ SPENDING BY CATEGORY           │ ← Move from dashboard
│ [bar chart]        │ [doughnut chart]               │
└────────────────────┴────────────────────────────────┘

┌────────────────────┬────────────────────────────────┐
│ SAVINGS RATE       │ INVESTMENT GROWTH              │ ← Move from dashboard
│ [line chart]       │ [line chart]                   │
└────────────────────┴────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ DETAILED BREAKDOWN TABLE                             │ ← New section
│ [Monthly income/expense/net table]                   │
└─────────────────────────────────────────────────────┘
```

**Charts to Move from Dashboard to Reports:**
1. Monthly Cash Flow (already has chart rendering code)
2. Top Spending Categories (doughnut chart)
3. Savings Rate Over Time (line chart)
4. Investment Growth Over Time (line chart)

**Charts to KEEP on Dashboard (Summary View):**
1. Net Worth Over Time (primary metric)
2. Monthly Net Worth Change (trend indicator)
3. Emergency Fund Progress (goal tracking)
4. Asset Allocation (portfolio balance)
5. Debt-to-Income Ratio (health indicator)

**Fix:**
1. Copy chart rendering code from `assets/js/charts.js`
2. Add canvas elements to `reports.html`
3. Update chart initialization in reports page JS
4. Remove moved charts from dashboard (or make them smaller)

**Time:** 1.5 hours

---

## Execution Plan

### Phase 1: Quick Visual Fixes (90 minutes)
1. **Delete icons sizing** (30 min)
2. **Welcome button alignment** (20 min)
3. **Chart labels readability** (15 min)
4. **Shared tags styling** (20 min)

### Phase 2: Layout Fixes (45 minutes)
5. **Debt card responsive layout** (45 min)

### Phase 3: Reports Page Enhancement (1.5 hours)
6. **Move charts to Reports page** (1.5 hrs)

**Total Time:** ~3 hours

---

## Testing Checklist

After each fix:
- ✅ Test on live site using browser automation
- ✅ Screenshot the fix
- ✅ Test mobile responsiveness
- ✅ Verify no regressions on other pages
- ✅ Commit with descriptive message

---

## Builder Instructions

1. **Read credentials:** `.credentials`
2. **Login to live site:** Use browser tool
3. **Fix issues 1-5 FIRST** (quick wins, visible progress)
4. **Test each fix immediately** (screenshot before/after)
5. **Commit after each fix** (atomic commits)
6. **Then tackle Reports page** (larger feature)

**Priority:** Show visible progress quickly — user is frustrated.

**Report back:** Screenshot of each fix + commit hash

---

**Created:** Feb 4, 2026, 2:16 PM EST  
**Requested By:** Founder (Matt)  
**Status:** Ready to execute
