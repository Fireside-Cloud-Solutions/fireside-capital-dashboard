# BUG-REP-017: Reports Page Missing Chart Skeleton Loaders

**Created**: February 14, 2026 — 6:20 AM  
**Severity**: MEDIUM (P2)  
**Impact**: Loading state consistency, layout shift  
**Estimated Fix Time**: 1 hour

---

## Summary

Dashboard page has skeleton loaders for charts while data loads. Reports page shows nothing until charts render, causing blank cards and layout shift (poor UX consistency).

---

## Location

**File**: `app/reports.html`  
**Elements**: All 5 chart cards (Net Worth Timeline, Asset Allocation, Monthly Trends, Investment Growth, Debt Reduction)  
**Live URL**: https://nice-cliff-05b13880f.2.azurestaticapps.net/reports.html

---

## Current State

**Dashboard (GOOD) ✅**:
```html
<div class="chart-wrapper chart-height-md">
  <div class="chart-skeleton">
    <div class="skeleton-loader skeleton-line" style="width: 80%;"></div>
    <div class="skeleton-loader skeleton-line" style="width: 60%;"></div>
    <div class="skeleton-loader skeleton-line" style="width: 90%;"></div>
  </div>
  <canvas id="netWorthChart"></canvas>
</div>
```

**Reports (BAD) ❌**:
```html
<div class="chart-wrapper chart-height-lg">
  <canvas id="netWorthTimelineChart"></canvas>
</div>
```

**Result**: 
- Dashboard: Shows animated skeleton while loading → smooth transition
- Reports: Shows blank white card → sudden chart appearance (jarring)

---

## Expected Behavior

1. Page loads → Skeleton loaders visible in chart cards
2. JavaScript fetches data from Supabase
3. Chart renders
4. Skeleton loader fades out → Chart fades in
5. No layout shift, smooth visual transition

---

## Fix Required

### Step 1: Add Skeleton Loaders to HTML

**Net Worth Timeline Chart**:
```html
<div class="chart-wrapper chart-height-lg">
  <div class="chart-skeleton" id="netWorthSkeleton">
    <div class="skeleton-loader skeleton-chart-lg"></div>
  </div>
  <canvas id="netWorthTimelineChart"></canvas>
</div>
```

**Apply same pattern to all 5 charts**:
- Asset Allocation (`#assetAllocationSkeleton`)
- Monthly Trends (`#monthlyTrendsSkeleton`)
- Investment Growth (`#investmentGrowthSkeleton`)
- Debt Reduction (`#debtReductionSkeleton`)

### Step 2: Hide Skeletons After Chart Render (reports.js)

```javascript
// In createNetWorthTimelineChart() after chart initialization
const chart = new Chart(ctx, config);
document.getElementById('netWorthSkeleton')?.classList.add('d-none');

// Repeat for all 5 chart initialization functions
```

**Full Example**:
```javascript
function createNetWorthTimelineChart(snapshots) {
  const ctx = document.getElementById('netWorthTimelineChart');
  if (!ctx) return;
  
  const config = {
    type: 'line',
    data: {
      labels: snapshots.map(s => new Date(s.date).toLocaleDateString()),
      datasets: [{
        label: 'Net Worth',
        data: snapshots.map(s => s.net_worth),
        borderColor: 'var(--color-blue)',
        tension: 0.4
      }]
    }
  };
  
  const chart = new Chart(ctx, config);
  
  // Hide skeleton after chart renders
  document.getElementById('netWorthSkeleton')?.classList.add('d-none');
  
  console.log('[Reports] Net Worth Timeline chart created');
}
```

---

## Files to Update

1. **reports.html** — Add skeleton loaders to 5 chart cards (15 lines total)
2. **assets/js/reports.js** — Hide skeletons after chart render (5 lines total)

---

## CSS Already Exists ✅

Skeleton loader styles already defined in `main.css`:
```css
.chart-skeleton {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.skeleton-loader {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-chart-lg {
  width: 90%;
  height: 80%;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**No new CSS needed** ✅

---

## Testing Checklist

- [ ] Refresh Reports page → Skeleton loaders appear immediately
- [ ] Charts render → Skeletons disappear smoothly
- [ ] No layout shift during transition
- [ ] All 5 charts have skeleton loaders
- [ ] Consistent with Dashboard page UX

---

## Impact

**Before Fix**:
- ❌ Blank white cards while loading (looks broken)
- ❌ Sudden chart appearance (jarring UX)
- ❌ Layout shift when charts render
- ❌ Inconsistent with Dashboard page

**After Fix**:
- ✅ Animated skeleton loaders (looks polished)
- ✅ Smooth fade transition
- ✅ No layout shift
- ✅ Consistent UX across all pages

---

## Priority Justification

**MEDIUM (P2)** because:
- ✅ Not blocking functionality (charts work)
- ✅ Improves perceived performance (feels faster)
- ✅ Maintains UX consistency with Dashboard
- ✅ Quick fix (1 hour implementation)
- ✅ High visual impact for low effort

---

## Related Issues

- ~~Issue #18: Script loading order~~ ✅ FIXED (commit 8782bfe)
- ~~Issue #19: Summary card color coding~~ ✅ FIXED (commit 8782bfe)
- Issue #16: Reports export functionality (feature gap)

---

## Notes

- Skeleton loaders reduce perceived load time by ~20-30% (users feel page loads faster)
- Follows industry best practice (used by LinkedIn, Facebook, GitHub)
- Already implemented on Dashboard → just needs consistency on Reports
- Could add progressive reveal (skeletons fade out in sequence as charts load)
