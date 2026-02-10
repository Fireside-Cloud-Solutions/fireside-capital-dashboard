# UI/UX Audit Report — Bills Page
**Date:** February 10, 2026 — 5:30 AM  
**Page:** bills.html (Bills & Subscriptions)  
**Auditor:** Capital (Architect Agent)

---

## Executive Summary
The Bills page has strong features (email scanning, subscription filtering, shared bills) but suffers from poor empty states and confusing UI affordances. The subscription filter toggle lacks clear visual feedback, and the warning-colored pending bills card creates unnecessary anxiety.

---

## CRITICAL ISSUES (HIGH PRIORITY)

### Issue #16: "Scan Email for Bills" Button Lacks Explanation
**Location:** Page header, `#scanEmailBillsBtn`  
**Current State:** Button text is "Scan Email for Bills" with envelope icon  
**Problem:** Users don't know what this does until they click it (then see OAuth prompt and get confused)  
**Impact:** Feature abandonment, low adoption rate  

**Recommended Fix:**
```html
<button class="btn btn-secondary" id="scanEmailBillsBtn" 
        data-bs-toggle="tooltip" 
        title="Connect Gmail to automatically detect bills from your inbox">
  <i class="bi bi-envelope-check"></i> Scan Email for Bills
</button>
```

**OR better: Add onboarding modal on first click:**
```javascript
if (!localStorage.getItem('email_scan_explained')) {
  // Show modal explaining feature
  // "We'll scan your Gmail for bills and invoices. You review before we add them."
  localStorage.setItem('email_scan_explained', 'true');
}
```

**Work Item:** User Story  
**Title:** Add explanation tooltip/modal to "Scan Email for Bills" button  
**Effort:** 2 hours  
**Tags:** UX, Onboarding, Email-Integration

---

### Issue #17: Empty Table States Missing (3 Locations)
**Locations:**  
1. Recurring Bills table (`#billTableBody`)  
2. Shared With Me table (`#sharedWithMeTableBody`)  
3. Pending Email Bills section (when `pendingEmailCount = 0`)  

**Current State:** All show blank tables/hidden sections  
**Problem:** New users see nothing, don't understand what these features do  
**Impact:** Poor FTUE (First Time User Experience)  

**Recommended Fix:**
```html
<!-- Recurring Bills Empty State -->
<tr class="empty-state-row" id="billsEmptyState">
  <td colspan="6" class="text-center py-5">
    <div class="empty-state">
      <i class="bi bi-receipt empty-state-icon"></i>
      <h4>No bills yet</h4>
      <p class="text-muted">Track recurring expenses like rent, utilities, subscriptions, and loan payments.</p>
      <div class="d-flex gap-2 justify-content-center">
        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addBillModal">
          <i class="bi bi-plus-circle"></i> Add Your First Bill
        </button>
        <button class="btn btn-outline-secondary" id="scanEmailFromEmpty">
          <i class="bi bi-envelope-check"></i> Scan Email
        </button>
      </div>
    </div>
  </td>
</tr>

<!-- Shared Bills Empty State -->
<tr class="empty-state-row" id="sharedEmptyState">
  <td colspan="7" class="text-center py-5">
    <div class="empty-state">
      <i class="bi bi-share empty-state-icon"></i>
      <h4>No shared bills yet</h4>
      <p class="text-muted">Friends can share bills with you for easy expense splitting.</p>
      <a href="friends.html" class="btn btn-outline-secondary">
        <i class="bi bi-people"></i> Manage Friends
      </a>
    </div>
  </td>
</tr>
```

**Work Item:** User Story  
**Title:** Add contextual empty states to all Bills page tables  
**Effort:** 3 hours  
**Tags:** UX, Empty-States, Bills

---

### Issue #18: Subscription Filter Toggle Lacks Visual Feedback
**Location:** Filter buttons: "All Bills" vs "Subscriptions Only"  
**Current State:** Both use `.btn-outline-secondary`, active state only changes `aria-pressed`  
**Problem:** Users can't visually tell which filter is active  
**Impact:** Confusing filter UX, users re-click the same button thinking it didn't work  

**Recommended Fix:**
```javascript
// Toggle active state with filled button
showAllBillsBtn.addEventListener('click', () => {
  showAllBillsBtn.classList.remove('btn-outline-secondary');
  showAllBillsBtn.classList.add('btn-secondary', 'active');
  
  showSubscriptionsBtn.classList.remove('btn-secondary', 'active');
  showSubscriptionsBtn.classList.add('btn-outline-secondary');
  
  // ... filter logic
});
```

**Work Item:** Task  
**Title:** Fix subscription filter toggle visual feedback (filled button for active state)  
**Effort:** 1 hour  
**Tags:** UX, Visual-Polish, Bills

---

## MODERATE ISSUES (MEDIUM PRIORITY)

### Issue #19: Summary Cards Show $0.00 Before Data Loads
**Location:** Monthly Bills Total, Recurring Count, Shared Count cards  
**Current State:** Cards show "$0.00" and "0" immediately on page load  
**Problem:** Users think they have no bills (especially if data is slow to load)  
**Impact:** Confusing initial state, creates false impression  

**Recommended Fix:**
```html
<div class="summary-card loading">
  <h6>Monthly Bills Total</h6>
  <div class="skeleton-loader skeleton-value"></div>
  <h4 id="billsTotal" class="d-none">$0.00</h4>
</div>
```

**Work Item:** Task  
**Title:** Add skeleton loaders to Bills page summary cards  
**Effort:** 1 hour  
**Tags:** UX, Loading-States, Bills

---

### Issue #20: Pending Email Bills Uses Warning Color Incorrectly
**Location:** `<div class="card card-warning-border">`  
**Current State:** Yellow/orange warning color with envelope-exclamation icon  
**Problem:** Warning colors signal errors/problems — pending bills are informational, not problematic  
**Impact:** Creates unnecessary user anxiety ("What's wrong?")  

**Recommended Fix:**
```html
<!-- Change from warning to info -->
<div class="card card-info-border">
  <div class="card-body-padded">
    <div class="d-flex justify-content-between align-items-center">
      <div>
        <h5 class="mb-1">
          <i class="bi bi-envelope-check me-2 icon-info"></i>
          Pending Bills from Email
        </h5>
        <p class="text-muted mb-0">
          <span id="pendingEmailCount">0</span> bills awaiting your review
        </p>
      </div>
      <button class="btn btn-primary" ... >
        <i class="bi bi-eye"></i> Review Bills
      </button>
    </div>
  </div>
</div>
```

**Work Item:** Task  
**Title:** Change pending email bills card from warning to info color  
**Effort:** 30 minutes  
**Tags:** UX, Visual-Design, Bills

---

### Issue #21: Frequency Column Doesn't Sort Properly
**Location:** Table "Frequency" column (Monthly, Weekly, Annually, etc.)  
**Current State:** If sortable, sorts alphabetically (Annually, Monthly, Weekly)  
**Problem:** Users expect frequency to sort by actual time period (Weekly < Monthly < Annually)  
**Impact:** Table sorting doesn't meet user expectations  

**Recommended Fix:**
```html
<td data-sort-value="30">Monthly</td>
<td data-sort-value="7">Weekly</td>
<td data-sort-value="365">Annually</td>
```
```javascript
// Sort by data-sort-value attribute instead of text content
```

**Work Item:** Task  
**Title:** Fix frequency column sorting to use numeric sort order  
**Effort:** 2 hours  
**Tags:** UX, Tables, Bills

---

## MINOR ISSUES (LOW PRIORITY)

### Issue #22: Actions Column Too Narrow on Mobile
**Location:** Table actions (edit/delete buttons)  
**Current State:** Two icon buttons side-by-side in narrow column  
**Problem:** Buttons get squished on mobile, hard to tap accurately  
**Impact:** Mobile usability issue  

**Recommended Fix:**
```html
<!-- Desktop: show both buttons -->
<div class="d-none d-md-flex gap-1">
  <button class="btn btn-sm btn-outline-secondary">Edit</button>
  <button class="btn btn-sm btn-outline-danger">Delete</button>
</div>

<!-- Mobile: show dropdown menu -->
<div class="dropdown d-md-none">
  <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown">
    <i class="bi bi-three-dots-vertical"></i>
  </button>
  <ul class="dropdown-menu dropdown-menu-end">
    <li><a class="dropdown-item">Edit</a></li>
    <li><a class="dropdown-item text-danger">Delete</a></li>
  </ul>
</div>
```

**Work Item:** Task  
**Title:** Convert table actions to dropdown menu on mobile  
**Effort:** 2 hours  
**Tags:** Mobile, Responsive, Bills

---

### Issue #23: Filter Buttons Should Be Radio Button Group
**Location:** "All Bills" / "Subscriptions Only" toggle  
**Current State:** Two separate `<button>` elements with manual `aria-pressed`  
**Problem:** Screen readers don't announce this as a mutually exclusive choice  
**Impact:** Accessibility (WCAG 2.1 Level AA)  

**Recommended Fix:**
```html
<div role="radiogroup" aria-label="Bill filters">
  <button type="button" role="radio" aria-checked="true" 
          class="btn btn-sm btn-secondary" id="showAllBillsBtn">
    All Bills
  </button>
  <button type="button" role="radio" aria-checked="false"
          class="btn btn-sm btn-outline-secondary" id="showSubscriptionsBtn">
    <i class="bi bi-credit-card-2-front me-1"></i>Subscriptions Only
  </button>
</div>
```

**Work Item:** Task  
**Title:** Convert filter buttons to proper ARIA radio group  
**Effort:** 1 hour  
**Tags:** Accessibility, A11y, WCAG

---

## FEATURE OPPORTUNITY (HIGH VALUE)

### "Mark as Paid" Quick Action
**Problem:** Users pay bills manually (outside the app), but can't easily mark them as paid without deleting the recurring entry.  
**Solution:** Add "Mark as Paid" button next to bills with upcoming due dates.  
**Implementation:**
```html
<button class="btn btn-sm btn-success" data-bill-id="123">
  <i class="bi bi-check-circle"></i> Mark Paid
</button>
```
- Track payment history in new `bill_payments` table
- Show payment status badge in table row
- Don't delete recurring bill (just log this instance as paid)

**Work Item:** User Story  
**Title:** Add "Mark as Paid" feature for manual bill payments  
**Effort:** 4 hours  
**Tags:** Feature, Bills, Payment-Tracking

---

## THINGS DONE RIGHT ✅
- **Subscription insights** — Data-driven widget
- **Email bill scanning** — Automation feature (needs better onboarding)
- **Shared bills** — Collaborative/social feature
- **Summary cards** — Quick overview at a glance
- **Filter toggle** — Good idea, needs better visual feedback

---

## AZURE DEVOPS WORK ITEMS TO CREATE

### User Stories
1. **Add explanation tooltip/modal to "Scan Email for Bills" button** (HIGH, 2h)
2. **Add contextual empty states to all Bills page tables** (HIGH, 3h)
3. **Add "Mark as Paid" feature for manual bill payments** (FEATURE, 4h)

### Tasks
1. **Fix subscription filter toggle visual feedback** (HIGH, 1h)
2. **Add skeleton loaders to Bills page summary cards** (MEDIUM, 1h)
3. **Change pending email bills card from warning to info color** (MEDIUM, 30min)
4. **Fix frequency column sorting to use numeric order** (MEDIUM, 2h)
5. **Convert table actions to dropdown menu on mobile** (LOW, 2h)
6. **Convert filter buttons to proper ARIA radio group** (LOW, 1h)

---

## NEXT AUDIT
**Page:** Budget (budget.html)  
**Focus Areas:** Data visualization, category management, progress indicators
