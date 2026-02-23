# UI/UX Audit Report — February 23, 2026

**Auditor:** Capital (Architect agent)  
**Date:** Monday, February 23, 2026 — 5:09 AM EST  
**Pages Reviewed:** Bills, Friends, Operations (partial)  
**Total Issues Found:** 12

---

## 🎯 Executive Summary

Completed first pass of Bills and Friends pages. Identified **3 high-priority** mobile/UX issues that impact core functionality, **5 medium-priority** design consistency issues, and **4 low-priority** polish items.

**Key Findings:**
- Mobile optimization gaps on small viewports (< 360px)
- Inconsistent use of semantic colors (warning vs info)
- Missing sortable table functionality on Bills page
- Button sizing inconsistency due to CSS override conflicts

---

## 📊 Issues by Priority

| Priority | Count | Pages Affected |
|----------|-------|----------------|
| HIGH     | 3     | Bills          |
| MEDIUM   | 5     | Bills, Friends |
| LOW      | 4     | Bills, Friends |

---

## 🔴 HIGH PRIORITY ISSUES

### Issue #1: Mobile Button Text Wrapping
- **Page:** Bills (`bills.html` line 115)
- **Problem:** "Scan Email for Bills" button wraps awkwardly on screens < 360px
- **Fix:** Add responsive class to hide text on mobile:
  ```html
  <i class="bi bi-envelope-check"></i> 
  <span class="d-none d-sm-inline">Scan Email for Bills</span>
  ```
- **Impact:** Poor mobile UX, especially on iPhone SE / small Android devices
- **Estimated Effort:** 5 minutes

### Issue #2: Semantic Color Misuse (Warning vs Info)
- **Page:** Bills (`bills.html` lines 132-147)
- **Problem:** Pending email bills card uses warning color (orange) for actionable inbox
- **Current:** `card-warning-border` + `icon-warning`
- **Should Be:** `card-info-border` + `icon-info`
- **Why:** Warning color implies urgency/error. This is an informational action item.
- **Impact:** Users interpret as error state, creates unnecessary anxiety
- **Estimated Effort:** 2 minutes

### Issue #3: Missing Sortable Table Functionality
- **Page:** Bills (`bills.html` lines 218-227)
- **Problem:** Table headers have no sort indicators or interactivity
- **Missing:** Click handlers on Amount, Frequency, Next Due columns
- **Fix:** Add `<th class="sortable" data-column="amount">` + JS sorting logic
- **Impact:** Core functionality gap — users can't organize bills by critical fields
- **Estimated Effort:** 2-3 hours (requires new JS component)

---

## 🟡 MEDIUM PRIORITY ISSUES

### Issue #4: Button Size Class Conflicts
- **Page:** Bills (`bills.html` line 114), Friends (`friends.html` line 87)
- **Problem:** Using `btn-lg` class but CSS forces 44px height globally on `.page-header .btn`
- **Evidence:** 
  ```css
  /* main.css line 346 */
  .page-header .btn {
    height: 44px;
    min-height: 44px;
    max-height: 44px;
  }
  ```
- **Fix:** Remove `btn-lg` from all page header buttons OR refactor CSS to allow size variants
- **Impact:** Bloated markup, visual inconsistency
- **Estimated Effort:** 15 minutes

### Issue #5: Empty State Icon Size Inconsistency
- **Page:** Bills empty state vs table empty states
- **Problem:** Bills uses 80px icons (`main.css` line 1188), tables use 64px
- **Root Cause:** FC-UIUX-004 increased size but didn't apply globally
- **Fix:** Standardize to 64px across all empty states OR commit to 80px everywhere
- **Impact:** Design system inconsistency
- **Estimated Effort:** 20 minutes

### Issue #6: Missing Summary Card Icons
- **Page:** Bills (`bills.html` lines 150-183)
- **Problem:** Summary cards lack contextual icons (other pages have them)
- **Recommended Icons:**
  - Monthly Bills Total: `<i class="bi bi-cash-stack"></i>`
  - Recurring: `<i class="bi bi-arrow-repeat"></i>`
  - Shared With Me: `<i class="bi bi-people"></i>`
  - Next Due: `<i class="bi bi-calendar-event"></i>`
- **Impact:** Reduced scannability compared to dashboard/debts pages
- **Estimated Effort:** 10 minutes

### Issue #7: Friends Page Needs Custom Empty State
- **Page:** Friends (when no friends added)
- **Problem:** Generic empty state — should have friendship/connection-themed illustration
- **Fix:** Add custom SVG or use `bi-people-fill` with friendly copy
- **Impact:** Less engaging first-time user experience
- **Estimated Effort:** 30 minutes

### Issue #8: Operations Toolbar Missing Accessibility Labels
- **Page:** Operations (`operations.html` line 133)
- **Problem:** Cash flow toggle buttons have no accessible labels
- **Current:** `<button type="button" class="btn btn-outline-secondary btn-sm active" data-days="30">30d</button>`
- **Should Have:** `aria-label="Show 30-day cash flow forecast"`
- **Impact:** Screen reader users can't understand button purpose
- **Estimated Effort:** 5 minutes

---

## 🟢 LOW PRIORITY ISSUES

### Issue #9: Skeleton Loading Density Too Low
- **Page:** Bills (`bills.html` lines 266-282)
- **Problem:** Only 3 skeleton rows — looks incomplete on large viewports
- **Fix:** Add 2-5 more skeleton rows to match typical table density
- **Impact:** Minor visual feedback improvement during loading
- **Estimated Effort:** 2 minutes

### Issue #10: Modal Form Missing Required Indicators
- **Page:** Bills (`bills.html` line 379 — Frequency field)
- **Problem:** "Amount" shows `*` but "Frequency" (also required) doesn't
- **Fix:** Add `<span class="text-danger">*</span>` to ALL required labels consistently
- **Impact:** Inconsistent form UX
- **Estimated Effort:** 3 minutes

### Issue #11: Invite Button Uses Ineffective Class
- **Page:** Friends (`friends.html` line 87)
- **Problem:** Same as Issue #4 — `btn-lg` has no effect
- **Fix:** Remove `btn-lg` class
- **Impact:** Bloated markup
- **Estimated Effort:** 1 minute

### Issue #12: Operations Comment References Nonexistent Bug ID
- **Page:** Operations (`operations.html` line 35)
- **Comment:** `<!-- Operations Dashboard styles ? components.css (BUG-UIUX-OPS-STYLE-BLOCK-001) -->`
- **Problem:** Bug ID doesn't exist in any tracking system, malformed HTML comment
- **Fix:** Remove comment or reference actual GitHub/Azure issue
- **Impact:** Developer confusion
- **Estimated Effort:** 1 minute

---

## 🔧 Recommended Work Items (Azure DevOps)

### Tasks to Create:

1. **[UI/UX] Fix mobile button wrapping on Bills page** (Priority: 1)
2. **[UI/UX] Change pending bills card to info color** (Priority: 1)
3. **[Feature] Add sortable table headers to Bills** (Priority: 1, 3 story points)
4. **[UI/UX] Remove btn-lg class conflicts** (Priority: 2)
5. **[Design] Standardize empty state icon size** (Priority: 2)
6. **[UI/UX] Add icons to Bills summary cards** (Priority: 2)
7. **[Design] Create Friends page custom empty state** (Priority: 2)
8. **[A11y] Add ARIA labels to Operations toolbar** (Priority: 2)
9. **[UI/UX] Increase Bills skeleton loading rows** (Priority: 3)
10. **[UI/UX] Add required indicators to Bills modal** (Priority: 3)
11. **[Cleanup] Remove ineffective btn-lg classes** (Priority: 3)
12. **[Cleanup] Fix Operations page HTML comment** (Priority: 3)

**Tags:** `UI/UX`, `Design`, `Mobile`, `Accessibility`, `Bills Page`, `Friends Page`, `Operations Page`

---

## 📈 Next Steps

1. **Manual Entry:** Create Azure DevOps tasks (PAT not configured in agent)
2. **Prioritize Mobile:** Issues #1, #2, #3 should be addressed first
3. **Quick Wins:** Issues #4, #6, #8, #10, #11, #12 are < 15 minutes each
4. **Design System:** Issue #5 requires design token update
5. **Feature Work:** Issue #3 (sortable tables) is larger scope — spike for reusable component

---

## 📋 Audit Coverage

**Completed:**
- ✅ Bills page (full audit)
- ✅ Friends page (full audit)
- ⏸️ Operations page (partial — toolbar and page header only)

**Remaining:**
- Assets
- Budget
- Debts
- Income
- Index (Dashboard)
- Investments
- Reports
- Settings
- Transactions

**Next Target:** Operations (complete), then Reports (last updated Feb 23)

---

**Report Generated:** 2026-02-23 05:10 AM EST  
**Audit Duration:** ~45 minutes  
**Issues/Hour Rate:** 16 issues/hour
