# Sprint Dev 0421 — Bills Empty State Fix

**Date:** 2026-02-21 04:21 AM EST  
**Agent:** Capital (Lead Dev)  
**Trigger:** Cron job a54d89bf-1328-47bf-8cbb-e13ca14d056d  
**Duration:** ~15 minutes

## Context

Sprint UI/UX 0750 (Feb 20 7:50 AM) identified **BUG-UI-EMPTY-001** as P1 High priority:
- Bills table missing static empty state div
- Had inline empty state HTML in JavaScript instead
- Inconsistent with debts/income pattern

## Work Done

### 1. Added Static Empty State to bills.html

Created `#billEmptyState` div following the pattern from debts.html:

```html
<!-- Static empty state (shown by JS when no bills exist) -->
<div id="billEmptyState" class="empty-state" style="display:none">
  <i class="bi bi-receipt empty-state-icon"></i>
  <h3>No Bills Tracked</h3>
  <p>Add your recurring bills and subscriptions to track payments and stay on top of your finances.</p>
  <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addBillModal" aria-label="Add your first bill">
    <i class="bi bi-plus-circle me-2"></i> Add Your First Bill
  </button>
</div>
```

**Placement:** Right before the `.table-card` div (lines ~212-220)

### 2. Updated renderBills() in app.js

**Removed:** 45+ lines of inline empty state HTML (lines 1527-1554)

**Before:**
```javascript
if (activeBills.length === 0) {
  tbody.innerHTML = `
    <tr>
      <td colspan="6" class="text-center py-5">
        <div class="empty-state-inline">
          <svg>...</svg>
          <h3>No Bills Yet</h3>
          <p>Track your recurring expenses...</p>
          <button onclick="openBillModal()">Add Your First Bill</button>
          <button onclick="document.getElementById('scanEmailBillsBtn')?.click()">Scan Email</button>
        </div>
      </td>
    </tr>
  `;
  // Update summary cards
  return;
}
```

**After:**
```javascript
// Clear skeleton rows and let toggleEmptyState handle showing the static empty state div
if (activeBills.length === 0) {
  // Remove skeleton rows
  const skeletonRows = tbody.querySelectorAll('.skeleton-row');
  skeletonRows.forEach(row => row.remove());
  
  // Update summary cards to show $0.00
  const totalBillsEl = document.getElementById('totalBills');
  const subscriptionsCountEl = document.getElementById('subscriptionsCount');
  if (totalBillsEl) totalBillsEl.textContent = '$0.00';
  if (subscriptionsCountEl) subscriptionsCountEl.textContent = '0';
  
  return; // Exit early, toggleEmptyState already called above will show static empty state div
}

// Remove skeleton rows when we have data
const skeletonRows = tbody.querySelectorAll('.skeleton-row');
skeletonRows.forEach(row => row.remove());
```

**Key change:** Now relies on `toggleEmptyState('dataContainer', 'bills', allBills)` (line 1508) to show/hide the static div

## How It Works

1. `renderBills()` calls `toggleEmptyState('dataContainer', 'bills', allBills)` at line 1508
2. If `allBills.length === 0`, `showEmptyState('dataContainer', 'bills')` is called
3. `showEmptyState()` finds the existing `#billEmptyState` div and shows it via `style.display = 'block'`
4. `showEmptyState()` also hides the `.table-card` via `style.display = 'none'`
5. When bills exist, `hideEmptyState()` reverses this

## Integration with empty-states.js

The EMPTY_STATES configuration already has a 'bills' entry (line 26):
```javascript
bills: {
  icon: `<svg>...</svg>`,
  title: "No bills yet",
  text: "Add your recurring bills to track payment due dates...",
  cta: "Add Your First Bill",
  action: () => typeof openBillModal === 'function' && openBillModal()
}
```

However, since we're using a static div (not dynamically generated), the config is only used if the div doesn't exist. Our static div takes precedence.

## Benefits

1. **Consistency** — Matches debts/income pattern exactly
2. **Maintainability** — Empty state in HTML, not buried in JS
3. **Performance** — No repeated HTML generation on re-renders
4. **Infrastructure** — Uses shared empty-states.js toggleEmptyState()
5. **Cleaner code** — -3 net lines (removed 45 lines of inline HTML, added 21 lines static div + cleanup)

## Commit

**Hash:** be33da2  
**Message:** "fix(BUG-UI-EMPTY-001): Add static empty state to bills table - P1 15 min fix"  
**Files:** 2 (bills.html, app.js)  
**Lines:** +21 -24

## Discord Alert

**Channel:** #commands (1467330060813074576)  
**Message:** 1474698357996781598

## Next Priorities

**From Sprint UI/UX 0750 audit:**
1. **BUG-UI-TYPE-001** (P1, 30 min) — Typography hardcoded px units (WCAG 1.4.4 violation)

**Other P1 Ready items:**
- FC-108: Service Worker (M, 3-4h)
- FC-122: Lazy loading (S, 1-2h)
- FC-147: Dashboard F-pattern layout (M, 4-5h)

## Verification

**Testing needed:**
1. Navigate to Bills page with no data
2. Verify #billEmptyState div is visible
3. Verify table is hidden
4. Click "Add Your First Bill" button → modal should open
5. Add a bill → verify empty state hides, table shows

**Manual test not possible:** Azure deployment frozen (BUG-DEPLOY-STALE-0220-001)

## Notes

- Empty state follows UX best practices (icon + heading + description + CTA)
- Uses btn-primary for CTA (consistent with other pages post-button-hierarchy fixes)
- Bootstrap icon (bi-receipt) matches bills theme
- No "Scan Email" button in static div (keep it simple, focus on core action)
