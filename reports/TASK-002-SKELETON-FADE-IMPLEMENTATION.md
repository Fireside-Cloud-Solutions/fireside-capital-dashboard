# TASK #2: Skeleton Loader Fade Transitions — Implementation Plan

**Status:** 🟡 **IN PROGRESS** (CSS ✅ Complete | JS ⏳ Pending)  
**Priority:** Medium  
**Total Effort:** 2 hours  
**Completed:** 10 minutes (CSS only)  
**Remaining:** 1-2 hours (JavaScript implementation)

---

## 📋 OVERVIEW

Add smooth fade-out transitions to skeleton loaders to prevent jarring instant swaps when real content loads.

**Acceptance Criteria:**
- [x] Add CSS transition to .skeleton-loader class
- [x] Add CSS transition to .skeleton-row class
- [x] Add CSS transition to .stat-card-skeleton class
- [x] Add CSS transition to .chart-skeleton class
- [ ] Update JavaScript to add .fade-out class before removing skeletons
- [ ] Test on all pages with loading states

---

## ✅ PART 1: CSS IMPLEMENTATION (COMPLETE)

**Commit:** 1dec046  
**Date:** 2026-02-22 07:22 AM  
**Files Changed:** `app/assets/css/components.css`

### Changes Made

**1. Base Skeleton Loader Transition**
```css
.skeleton-loader {
  /* ... existing styles ... */
  transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.skeleton-loader.fade-out {
  opacity: 0;
}
```

**2. Skeleton Row Transition**
```css
.skeleton-row {
  transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.skeleton-row.fade-out {
  opacity: 0;
}
```

**3. Stat Card Skeleton Transition**
```css
.stat-card-skeleton {
  transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card-skeleton.fade-out {
  opacity: 0;
}
```

**4. Chart Skeleton Transition**
```css
.chart-skeleton {
  /* ... existing styles ... */
  transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.chart-skeleton.fade-out {
  opacity: 0;
}
```

### CSS Quality

**Strengths:**
- ✅ Consistent 150ms timing across all skeleton types
- ✅ Uses cubic-bezier easing for smooth acceleration/deceleration
- ✅ Non-breaking change (fade-out only applies when class added)
- ✅ Minimal CSS additions (17 lines total)
- ✅ Follows existing animation patterns

**Testing Notes:**
- Transition will not activate until JavaScript adds .fade-out class
- Current behavior unchanged (skeletons still instantly swap)
- Backwards compatible (no breaking changes)

---

## ⏳ PART 2: JAVASCRIPT IMPLEMENTATION (PENDING)

### Required Changes

**Goal:** Add .fade-out class → wait 150ms → remove skeleton elements

**Implementation Pattern:**
```javascript
// BEFORE (current - instant removal):
document.querySelector('.skeleton-row').remove();

// AFTER (with fade transition):
function removeSkeletonWithFade(element) {
  element.classList.add('fade-out');
  setTimeout(() => {
    element.remove();
  }, 150); // Match CSS transition duration
}

// Usage:
removeSkeletonWithFade(document.querySelector('.skeleton-row'));
```

### Files to Update

**High Priority (Most Visible Impact):**

1. **app/assets/js/app.js** (Primary file)
   - `renderDashboard()` — 8 chart skeletons
   - `renderAssets()` — Table skeleton rows
   - `renderBills()` — Table skeleton rows + 3 stat cards
   - `renderBudget()` — Table skeleton rows + 4 stat cards
   - `renderDebts()` — Table skeleton rows
   - `renderIncome()` — Table skeleton rows + 3 KPI cards
   - `renderInvestments()` — Table skeleton rows
   - `renderSettings()` — 2 card skeletons

2. **app/assets/js/transactions.js**
   - `renderTransactionsTable()` — Table skeleton rows

3. **app/assets/js/operations.js**
   - Chart skeleton removals (if any)

4. **app/assets/js/friends.js**
   - Search results skeleton (if any)

5. **app/assets/js/reports.js**
   - `renderReports()` — 3 stat card skeletons + 5 chart skeletons

### Implementation Strategy

**Option A: Utility Function (RECOMMENDED)**
```javascript
// Add to app.js (top-level utility section)

/**
 * Smoothly fade out and remove skeleton loading elements
 * @param {HTMLElement|NodeList|Array} elements - Element(s) to remove
 * @param {number} duration - Fade duration in ms (default 150)
 */
function removeSkeletonsWithFade(elements, duration = 150) {
  // Handle single element
  if (elements instanceof HTMLElement) {
    elements.classList.add('fade-out');
    setTimeout(() => elements.remove(), duration);
    return;
  }

  // Handle multiple elements (NodeList or Array)
  elements.forEach(el => {
    el.classList.add('fade-out');
    setTimeout(() => el.remove(), duration);
  });
}

// Usage Examples:
// Single element:
removeSkeletonsWithFade(document.querySelector('.chart-skeleton'));

// Multiple elements:
removeSkeletonsWithFade(document.querySelectorAll('.skeleton-row'));

// With custom duration:
removeSkeletonsWithFade(chartSkeleton, 200);
```

**Option B: Direct Inline (Not Recommended)**
- Repeat fade-out logic in every function
- Harder to maintain
- More code duplication

### Estimated Effort by File

| File | Skeleton Removals | Estimated Time |
|------|------------------|----------------|
| app.js | 30-40 instances | 45 min |
| transactions.js | 5-10 instances | 15 min |
| operations.js | 5-10 instances | 15 min |
| friends.js | 2-5 instances | 10 min |
| reports.js | 8-10 instances | 15 min |
| **TOTAL** | **50-75 instances** | **100 min (1.6h)** |

### Testing Plan

**Pages to Test After Implementation:**

1. **Dashboard** — 8 chart skeletons fade smoothly
2. **Assets** — Table rows fade before real data appears
3. **Bills** — Table + 3 stat cards fade smoothly
4. **Budget** — Table + 4 stat cards fade smoothly
5. **Debts** — Table rows fade smoothly
6. **Income** — Table + 3 KPI cards fade smoothly
7. **Investments** — Table rows fade smoothly
8. **Transactions** — Table rows + pagination fade smoothly
9. **Reports** — 3 stat cards + 5 charts fade smoothly
10. **Settings** — 2 card skeletons fade smoothly
11. **Operations** — Chart skeletons fade smoothly
12. **Friends** — Search result skeletons fade smoothly

**Test Scenarios:**
- ✅ Slow connection (throttle to 3G) — verify fade is visible
- ✅ Fast connection (local dev) — verify no flash/jank
- ✅ Multiple rapid page loads — verify no stuck skeletons
- ✅ Empty states — verify skeletons don't interfere with empty state display

---

## 📊 EXPECTED IMPACT

**Before:**
- Instant swap from skeleton → real content (jarring flash)
- Users perceive loading as "glitchy" or "choppy"

**After:**
- Smooth 150ms fade from skeleton → real content
- Professional, polished loading experience
- +10-15% perceived performance improvement (subjective)

**Accessibility:**
- ✅ Respects `prefers-reduced-motion` (existing CSS already handles this)
- ✅ Screen readers unaffected (skeletons are decorative)
- ✅ No keyboard trap issues (skeletons not focusable)

---

## 🚀 DEPLOYMENT CHECKLIST

**Before Deployment:**
- [ ] Implement `removeSkeletonsWithFade()` utility in app.js
- [ ] Replace all `.remove()` calls on skeletons with utility function
- [ ] Test on all 12 pages (slow + fast connections)
- [ ] Verify `prefers-reduced-motion` still works
- [ ] Check console for errors (timeout cleanup issues)

**After Deployment:**
- [ ] Monitor Azure deployment logs
- [ ] Hard refresh live site to clear cache
- [ ] Test on production with DevTools Network throttling
- [ ] Confirm smooth fades on all pages
- [ ] Close TASK #2 in Azure DevOps

---

## 📝 NOTES

**Why 150ms?**
- Apple Human Interface Guidelines: 100-200ms for state transitions
- Material Design: 100-300ms for fade transitions
- 150ms is the sweet spot: fast enough to feel responsive, slow enough to be noticeable

**Why cubic-bezier(0.4, 0, 0.2, 1)?**
- Material Design "Standard Easing" curve
- Accelerates at start, decelerates at end
- Feels more natural than linear fade

**Potential Issues:**
- ⚠️ If data loads faster than 150ms, fade may feel laggy
- ⚠️ Multiple rapid page changes could leave orphaned timeouts
- ✅ Solution: Always clear timeouts on component unmount (not applicable for this SPA pattern)

---

**Next Session:** Implement JavaScript utility function and update all skeleton removal calls (1-2 hours)