# FC-077: Chart.js Canvas Reuse Error (CRITICAL)

**Date:** 2026-02-08 04:20 AM EST  
**Discovered By:** Capital (Sprint QA cron)  
**Fixed:** 2026-02-08 04:36 AM EST (Commit a029745)  
**Severity:** 🔴 CRITICAL  
**Priority:** P0 (Production Blocker)  
**Status:** ✅ FIXED (Code reviewed, awaiting live site verification)  
**Affects:** Dashboard page (index.html), Reports page (reports.html)

---

## Summary

6 of 9 dashboard charts fail to render due to Chart.js canvas reuse errors. The error "Canvas is already in use. Chart with ID 'X' must be destroyed before the canvas can be reused" appears in console for every affected chart.

---

## Impact

**User Impact:** Dashboard + Reports pages mostly broken for new users  
**Affected Pages:** 2 (Dashboard, Reports)  
**Affected Charts:** 6/9 on Dashboard (67% failure rate), 5/5 on Reports (100% failure rate)
- ❌ Net Worth Over Time
- ❌ Monthly Net Worth Change
- ❌ Top Spending Categories
- ❌ Savings Rate Over Time
- ❌ Investment Growth Over Time
- ❌ Debt-to-Income Ratio

**Working Charts:**
- ✅ Monthly Cash Flow
- ✅ Emergency Fund Progress (no chart, CTA only)
- ✅ Asset Allocation (empty state, no chart)

---

## Steps to Reproduce

**Dashboard:**
1. Open https://nice-cliff-05b13880f.2.azurestaticapps.net/
2. Close welcome modal ("Skip for now")
3. Close onboarding complete modal ("Go to Dashboard")
4. Observe dashboard charts
5. Open browser console

**Expected:** All 9 charts render with data or empty states  
**Actual:** 6 charts show "Chart could not be loaded" error messages

**Reports Page:**
1. Open https://nice-cliff-05b13880f.2.azurestaticapps.net/reports.html
2. Observe page (no modals)
3. Open browser console

**Expected:** All 5 charts render with data or empty states  
**Actual:** All 5 charts show empty/broken rendering

---

## Console Errors

```
Failed to render Net Worth Timeline: Error: Canvas is already in use. 
Chart with ID '0' must be destroyed before the canvas with ID 
'netWorthTimelineChart' can be reused.
```

Same error pattern for chart IDs: 0, 1, 2, 3, 4, 5

---

## Root Cause Analysis

**Hypothesis:** Chart rendering function is being called multiple times without destroying previous chart instances. The `safeCreateChart()` utility in `app.js` is not properly handling chart destruction before recreation.

**Likely Causes:**
1. Double initialization (DOMContentLoaded + manual call)
2. Onboarding modal completion triggers re-render
3. `renderAll()` being called multiple times
4. Chart instances not stored in global registry for cleanup

**Files Involved:**
- `app/assets/js/app.js` (lines 223, 237 - safeCreateChart)
- `app/assets/js/charts.js` (all chart render functions)
- `app/assets/js/app-polish-enhancements.js` (line 157 - renderAll wrapper)

---

## Evidence

**Screenshots:**  
- Dashboard: MEDIA:C:\Users\chuba\.clawdbot\media\browser\d6417bc7-5668-4614-b159-4a348823343c.jpg  
- Reports: MEDIA:C:\Users\chuba\.clawdbot\media\browser\9e3138c9-3225-4c40-8ab9-c2e07fb645d2.jpg  
**Git Commit:** 9845b9b (FC-056 skeleton loaders - most recent)  
**Browser:** Chrome 131  
**OS:** Windows 11

---

## Recommended Fix

### Option 1: Enhance safeCreateChart (2 hours)
```javascript
// Store all chart instances globally
window.chartInstances = window.chartInstances || {};

function safeCreateChart(canvasId, config) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  
  // Destroy existing chart if present
  if (window.chartInstances[canvasId]) {
    window.chartInstances[canvasId].destroy();
    delete window.chartInstances[canvasId];
  }
  
  // Create new chart
  const chart = new Chart(canvas.getContext('2d'), config);
  window.chartInstances[canvasId] = chart;
  return chart;
}
```

### Option 2: Add destroyAllCharts utility (1 hour)
```javascript
function destroyAllCharts() {
  Object.values(Chart.instances).forEach(chart => chart.destroy());
}

// Call before any re-render
window.addEventListener('DOMContentLoaded', () => {
  destroyAllCharts();
  renderAll();
});
```

### Option 3: Prevent double initialization (30 min)
```javascript
let isRendered = false;
async function renderAll() {
  if (isRendered) return;
  isRendered = true;
  // ... existing code
}
```

**Recommended:** Option 1 (most robust, fixes root cause)

---

## Priority Justification

- **P0 Priority:** Dashboard is the landing page - first impression for all users
- **User Experience:** 67% of dashboard content is broken
- **Recent Regression:** Likely introduced by FC-056 (skeleton loaders) or related chart refactoring
- **Quick Fix:** 1-2 hours estimated (well-understood Chart.js issue)

---

## Related Issues

- FC-056: Skeleton loaders (recently completed - commit 4845557)
- FC-057: Chart heights standardization (commit e0a41b0)
- Previous chart-related work may have introduced double-render logic

---

## Testing Checklist

After fix:
- [ ] All 6 broken charts render correctly
- [ ] No console errors on page load
- [ ] No errors after closing onboarding modals
- [ ] Charts re-render correctly on time range filter changes
- [ ] No performance degradation (check for memory leaks)
- [ ] Test on Reports page (also has charts)
- [ ] Verify on mobile viewports

---

## Notes

- Monthly Cash Flow chart works because it's rendered differently or earlier in sequence
- This is a client-side JavaScript bug, not a backend/API issue
- Chart.js version: 4.4.7 (from CDN)
- Skeleton loaders may have changed render timing

---

## Fix Applied

**Commit:** a029745 (2026-02-08 04:36 AM)  
**Author:** Matt (chubacher@firesidecloudsolutions.com)  
**Implementation:** Option 1 (Enhance safeCreateChart)

**Changes Made:**
```javascript
// Global chart instance registry added (app.js line 193)
window.chartInstances = window.chartInstances || {};

// FC-077 Fix in safeCreateChart (app.js lines 227-236)
const canvasId = canvas.id;
if (canvasId && window.chartInstances[canvasId]) {
  console.log(`Destroying existing chart instance for: ${canvasId}`);
  window.chartInstances[canvasId].destroy();
  delete window.chartInstances[canvasId];
}

// Store new instance after creation (app.js lines 240-242)
if (canvas && canvas.id) {
  window.chartInstances[canvas.id] = chart;
}
```

**Code Review:** ✅ PASS  
- Implements recommended Option 1 from bug report
- Proper destroy before create pattern
- Global registry maintained correctly
- No memory leaks (old instances deleted)

**Live Site Verification:** ⏳ PENDING (requires browser test)  
**Next Step:** Test on https://nice-cliff-05b13880f.2.azurestaticapps.net/ to verify all charts render correctly

---

**Action:** ✅ FIXED - Code complete, needs live site verification
