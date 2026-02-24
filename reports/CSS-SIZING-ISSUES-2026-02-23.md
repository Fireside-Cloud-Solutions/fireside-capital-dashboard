# CSS/Sizing Issues Audit — 2026-02-23 22:15 EST

**Reporter:** Matt Hubacher (beefsnacks4338)  
**Status:** CRITICAL — User frustration high, reported multiple times  
**Root Cause:** Orchestrator focused on accessibility/features while visual polish bugs persisted

---

## Issues Identified (7 total)

### Issue #1: Budget Page Button Sizing
**Location:** `budget.html` lines 132, 139  
**Problem:** "Generate Budget" and "Add Item" buttons using `.btn-sm` class  
**Expected:** Standard 44px height buttons (WCAG touch target minimum)  
**Current:** 31px height (btn-sm)  
**Impact:** Buttons look undersized compared to other pages, inconsistent UX

**Fix:**
```html
<!-- BEFORE -->
<button class="btn btn-secondary btn-sm" id="generateBudgetBtn">
<button class="btn btn-primary btn-sm" data-bs-toggle="modal">

<!-- AFTER -->
<button class="btn btn-secondary" id="generateBudgetBtn">
<button class="btn btn-primary" data-bs-toggle="modal">
```

---

### Issue #2: Welcome Dropdown Caret Alignment
**Location:** All 12 HTML pages, navbar header  
**Problem:** Dropdown caret (▼) not vertically centered with button text  
**Current CSS:** None specific for `.dropdown-caret`  
**Impact:** Visually awkward on all pages

**Fix:** Add CSS to `components.css`:
```css
.dropdown-caret {
  display: inline-block;
  margin-left: 4px;
  vertical-align: middle;
  line-height: 1;
}
```

---

### Issue #3: Bills Aging Badges Layout
**Location:** `operations.js` lines 567-568 (renderBillsAging function)  
**Problem:** Badge + text layout causes wrapping/awkward spacing  
**Current HTML:**
```html
<span class="badge bg-danger rounded-pill">5</span>
<span class="fw-medium small">🔴 Due ≤7 days</span>
```

**Fix:** Wrap in flex container:
```javascript
// BEFORE
<div class="d-flex align-items-center gap-2">
  <span class="badge bg-${variant} rounded-pill">${bucketBills.length}</span>
  <span class="fw-medium small">${emoji} ${label}</span>
</div>

// AFTER (add align-items and ensure no line breaks)
<div class="d-flex align-items-center gap-2 flex-nowrap">
  <span class="badge bg-${variant} rounded-pill d-flex align-items-center justify-content-center" style="min-width: 24px; height: 24px;">${bucketBills.length}</span>
  <span class="fw-medium small text-nowrap">${emoji} ${label}</span>
</div>
```

---

### Issue #4: Safe to Spend "Bills ≤7 days" Badge
**Location:** `operations.js` line 253 (renderSafeToSpend function)  
**Problem:** Inline badge sizing inconsistent with rest of app  
**Current:**
```html
<span>Bills ≤7 days <span class="badge bg-danger ms-1">5</span></span>
```

**Fix:** Better spacing and sizing:
```javascript
// AFTER
<div class="d-flex justify-content-between align-items-center mb-1">
  <span class="d-flex align-items-center gap-2">
    Bills ≤7 days
    <span class="badge bg-danger rounded-pill d-flex align-items-center justify-content-center" style="min-width: 20px; height: 20px; font-size: 11px;">${billsDue7d.length}</span>
  </span>
  <span>−${opsFormatCurrency(billsDue7dTotal)}</span>
</div>
```

---

### Issue #5: "Scan Email for Bills" Button Mobile Layout
**Location:** `bills.html` line 93  
**Problem:** Text hidden on mobile (.d-none .d-sm-inline) leaves icon + awkward spacing  
**Current:**
```html
<button class="btn btn-outline-secondary btn-lg" id="scanEmailBillsBtn">
  <i class="bi bi-envelope-check"></i> <span class="d-none d-sm-inline">Scan Email for Bills</span>
</button>
```

**Impact:** Mobile shows only icon with trailing space  
**Fix:** Remove space between icon and span:
```html
<button class="btn btn-outline-secondary btn-lg" id="scanEmailBillsBtn">
  <i class="bi bi-envelope-check"></i><span class="d-none d-sm-inline ms-2">Scan Email for Bills</span>
</button>
```

---

### Issue #6: Asset Card Action Buttons Crowding
**Location:** `assets.html` (and other pages with icon-only action buttons)  
**Problem:** Link/Edit/Delete icon buttons too close together  
**Current:** Using Bootstrap default spacing  
**Expected:** Minimum 8px gap between icon buttons

**Fix:** Add to `main.css`:
```css
/* Action button groups in cards */
.card-actions .btn-icon,
.table .btn-icon {
  margin-left: 4px;
  margin-right: 4px;
}

.card-actions .btn-icon:first-child {
  margin-left: 0;
}

.card-actions .btn-icon:last-child {
  margin-right: 0;
}
```

---

### Issue #7: Input Fields with $ Prefix Alignment
**Location:** All modal forms with currency inputs  
**Problem:** Dollar sign prefix not vertically centered with input field  
**Current:** Using Bootstrap `.input-group` with `.input-group-text`

**Fix:** Add to `components.css`:
```css
/* Currency input prefix alignment */
.input-group-text {
  display: flex;
  align-items: center;
  padding-top: 0;
  padding-bottom: 0;
  line-height: 1;
}
```

---

## Estimated Fix Time

| Issue | Time | Priority |
|-------|------|----------|
| #1: Budget buttons | 2 min | P1 |
| #2: Welcome caret | 3 min | P2 |
| #3: Bills aging badges | 10 min | P2 |
| #4: Safe to Spend badge | 5 min | P2 |
| #5: Scan Email button | 2 min | P3 |
| #6: Asset buttons | 5 min | P2 |
| #7: Currency inputs | 3 min | P3 |
| **TOTAL** | **30 min** | |

---

## Root Cause Analysis

**Why These Persisted:**

1. **Orchestrator prioritized accessibility over visual polish** — Recent STATUS.md shows 90% of work on WCAG compliance, empty states, aria-labels
2. **No systematic visual QA** — Audits focused on code quality, not pixel-perfect CSS
3. **User feedback not tracked** — User reported these "several times before" but no backlog items created
4. **No browser testing on actual pages** — Most QA was code-level verification, not live site screenshots

**Prevention:**

1. Add visual regression testing to sprint QA
2. Browser screenshots of all pages after major CSS changes
3. User-reported issues go directly to BACKLOG.md with P1 priority
4. Bi-weekly "polish sprint" for CSS/visual bugs only

---

## Fix Plan

**Approach:** Fix ALL 7 issues in one commit, test on live site, deploy

**Steps:**
1. Fix #1: Remove `.btn-sm` from budget.html (2 min)
2. Fix #2: Add `.dropdown-caret` CSS to components.css (3 min)
3. Fix #3 & #4: Update renderBillsAging() and renderSafeToSpend() in operations.js (15 min)
4. Fix #5: Fix button spacing in bills.html (2 min)
5. Fix #6: Add card-actions CSS to main.css (5 min)
6. Fix #7: Fix input-group-text alignment in components.css (3 min)
7. Git commit, push, verify on live site

**Total Time:** 30 minutes (code) + 10 minutes (testing) = 40 minutes

---

**Status:** Ready for immediate fix  
**Assigned:** Capital (me)  
**Deadline:** Tonight (before user checks again)
