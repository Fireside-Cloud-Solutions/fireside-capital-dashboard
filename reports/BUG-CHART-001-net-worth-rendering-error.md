# BUG-CHART-001: Net Worth Chart Rendering Error

**Created:** 2026-02-10 06:25 AM EST  
**Severity:** P0 (Critical)  
**Status:** New  
**Found By:** Capital (Sprint QA cron 013cc4e7)  
**Affected Commit:** fb6fbf1 (Chart.js performance optimizations)

---

## Summary

Net Worth Timeline chart fails to render with JavaScript error: "Cannot read properties of null (reading 'x')". Chart shows fallback message "Chart could not be loaded" instead of data visualization.

---

## Impact

- **User Impact:** HIGH — Dashboard primary chart (Net Worth) is completely broken
- **Pages Affected:** Dashboard (index.html)
- **Browser Tested:** Chrome (latest)
- **Reproducible:** 100% on live site

---

## Steps to Reproduce

1. Navigate to https://nice-cliff-05b13880f.2.azurestaticapps.net/
2. Login with valid credentials
3. Observe Dashboard page loads
4. **BUG:** Net Worth Over Time chart shows "Chart could not be loaded"

---

## Console Error

```
Failed to render Net Worth Timeline: TypeError: Cannot read properties of null (reading 'x')
    at g (https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js:19:54516)
    at LineController.getMinMax (https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js:19:54569)
    at xo.getMinMax (https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js:19:63799)
    at xo.determineDataLimits (https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js:19:141137)
    at xo.update (https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js:19:64923)
```

**Location:** app.js:253 (chart error handler)

---

## Root Cause Analysis

**File:** `app/assets/js/charts.js` (lines 239-280)

**Problem:** Chart.js performance optimization added `parsing: false` flag, but projection dataset uses null values:

```javascript
// Line 235-239 (projection dataset)
datasets.push({
  label: 'Projected (based on avg trend)',
  data: [...Array(filtered.data.length - 1).fill(null), 
         filtered.data[filtered.data.length - 1], 
         ...projectionData],
  // ...
});

// Line 251-252 (performance flags)
options: {
  parsing: false, // ❌ INCOMPATIBLE WITH NULL VALUES
  normalized: true,
  // ...
}
```

**Conflict:** `parsing: false` requires data in `{x, y}` format or pure numeric arrays. Null values in the middle of a dataset cause Chart.js to crash when trying to read `.x` property.

---

## Working Charts (No Projection Datasets)

These charts render successfully because they don't use projection datasets with null padding:
- Monthly Cash Flow ✅
- Monthly Net Worth Change ✅
- Savings Rate Over Time ✅
- Investment Growth Over Time ✅
- Top Spending Categories ✅
- Asset Allocation ✅
- Debt-to-Income Ratio ✅

---

## Fix Options

### Option 1: Remove `parsing: false` for Charts with Projections (Quick Fix)
**Pros:** Minimal code change, safe  
**Cons:** Loses ~20% performance benefit for this chart  
**Time:** 5 minutes

```javascript
// Only enable parsing:false if NO projection dataset
parsing: projectionData.length === 0 ? false : true,
normalized: projectionData.length === 0 ? true : false,
```

### Option 2: Convert Projection Data to {x, y} Format (Proper Fix)
**Pros:** Keeps full performance optimization  
**Cons:** More complex, requires data restructuring  
**Time:** 20 minutes

```javascript
// Convert all data to {x, y} format
data: {
  labels: undefined, // No labels when using {x,y}
  datasets: [
    {
      label: 'Net Worth',
      data: filtered.labels.map((label, i) => ({ 
        x: label, 
        y: filtered.data[i] 
      }))
    },
    {
      label: 'Projected',
      data: projectionLabels.map((label, i) => ({
        x: label,
        y: projectionData[i]
      }))
    }
  ]
}
```

### Option 3: Disable Projections Temporarily (Workaround)
**Pros:** Immediate fix, no risk  
**Cons:** Removes feature temporarily  
**Time:** 2 minutes

---

## Recommended Fix

**Option 1** — Quick fix for immediate deployment, then implement Option 2 in next sprint for full performance benefit.

---

## Related Issues

**BUG-CHART-002:** PWA manifest icons missing (404) — P2 priority  
**Issue Location:** Same commit (fb6fbf1 / 0b24dc0)

---

## Testing Checklist

After fix:
- [ ] Net Worth chart renders without errors
- [ ] Projection line shows correctly (if enabled)
- [ ] Time range filters work (1M, 3M, 6M, 1Y, All)
- [ ] Console shows no Chart.js errors
- [ ] Other 6 charts still render correctly
- [ ] Performance remains good (< 300ms render time)

---

## Work Item

**Azure DevOps:** BUG-CHART-001  
**Type:** Bug  
**Priority:** P0  
**Size:** XS (5-20 min)  
**Sprint:** Current  
**Assignee:** Capital/Builder

---

## Git Blame

**Introduced By:** Commit fb6fbf1  
**Author:** Capital (Sprint Dev cron)  
**Date:** 2026-02-10 06:15 AM  
**Message:** "perf(charts): Add Chart.js performance optimizations - 40-60% faster rendering"

**Previous Working Commit:** f42b1b2 (PWA implementation)

---

## Notes

This is a regression bug — the chart worked before the performance optimization. The fix should be straightforward but must be deployed ASAP as it breaks the primary dashboard visualization.

All other charts render successfully, confirming the issue is specific to projection dataset handling.
