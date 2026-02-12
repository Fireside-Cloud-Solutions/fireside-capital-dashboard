# Consolidated Bug Report — UI/UX Audit Findings

**Created:** February 12, 2026 04:30 AM EST  
**Source:** UI/UX audits of Transactions, Friends, Budget pages  
**Total Issues:** 72 (10 P0, 21 P1, 28 P2, 13 P3)  
**Status:** Ready for Azure DevOps work item creation

---

## 🔴 PRIORITY 0 BUGS (CRITICAL) — 10 Issues

### Transactions Page (3 issues)

#### BUG-TX-001: Table Header/Body Column Mismatch
- **File:** app/transactions.html (lines 164-172)
- **Severity:** P0 (Accessibility/Semantic error)
- **Description:** Table defines 5 columns in `<thead>` but only renders 4-5 in `<tbody>`, causing visual misalignment. "Confidence" header aligns with "Pending" column instead of AI confidence score.
- **Impact:** Screen reader users receive incorrect column information
- **Effort:** 2 hours
- **Fix:** Either make Confidence a separate column OR rename header to "Status"

#### ARCH-TX-001: Transaction Logic Still Partially in app.js
- **File:** app/assets/js/app.js (lines unknown, needs audit)
- **Severity:** P0 (Architecture/Maintainability)
- **Description:** Despite having a dedicated transactions.js, some transaction logic remains embedded in monolithic app.js (4000+ lines)
- **Impact:** Code duplication, difficult to maintain, testing complexity
- **Effort:** 4 hours
- **Fix:** Extract all transaction functions into transactions.js

#### DATA-TX-001: No Transaction Data Visible
- **File:** app/transactions.html
- **Severity:** P0 (Data/Testing)
- **Description:** Empty state displays, no real transactions visible. Cannot verify table rendering, filtering, or AI categorization features.
- **Impact:** Cannot test core functionality
- **Effort:** 2 hours (investigate database, seed data if needed)
- **Fix:** Verify Supabase connection, seed sample transactions, or test with Plaid sandbox data

---

### Friends Page (5 issues)

#### ARCH-FRIENDS-001: All Friends Logic Embedded in Monolithic app.js
- **File:** app/assets/js/app.js (lines 4191-4400+)
- **Severity:** P0 (Architecture/Maintainability)
- **Description:** All friends functionality embedded in 4000+ line app.js instead of dedicated friends.js module
- **Impact:** Severe maintainability issues, cannot unit test, performance overhead
- **Effort:** 8 hours
- **Fix:** Create app/assets/js/friends.js and extract all functions (searchFriends, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, cancelFriendRequest, removeFriend)

#### FEAT-FRIENDS-001: No Remove Friend Button
- **File:** app/friends.html (My Friends section)
- **Severity:** P0 (Feature Gap)
- **Description:** No button to remove/unfriend an existing friend. Once added, cannot be removed.
- **Impact:** Users stuck with unwanted connections
- **Effort:** 2 hours
- **Fix:** Add "Remove" button in My Friends table, wire to removeFriend() function

#### FEAT-FRIENDS-002: No Cancel Outgoing Request Button
- **File:** app/friends.html (Outgoing Requests section)
- **Severity:** P0 (Feature Gap)
- **Description:** No button to cancel a pending friend request you sent. Cannot retract accidental requests.
- **Impact:** Accidental requests cannot be undone
- **Effort:** 2 hours
- **Fix:** Add "Cancel" button in Outgoing Requests table, wire to cancelFriendRequest() function

#### FEAT-FRIENDS-003: No Reject Incoming Request Button
- **File:** app/friends.html (Pending Requests section)
- **Severity:** P0 (Feature Gap)
- **Description:** Only "Accept" button exists for incoming requests. No way to reject/decline a friend request.
- **Impact:** Users cannot decline unwanted friend requests
- **Effort:** 2 hours
- **Fix:** Add "Reject" button next to "Accept" button, wire to rejectFriendRequest() function

#### DATA-FRIENDS-001: No Friend Data Visible
- **File:** app/friends.html
- **Severity:** P0 (Data/Testing)
- **Description:** Empty state displays for all 3 sections (Pending, Friends, Outgoing). Cannot verify friend listing, request flow, or UI rendering.
- **Impact:** Cannot test core functionality
- **Effort:** 2 hours (investigate database, seed data if needed)
- **Fix:** Verify Supabase connections table, seed sample friend data, or create test accounts

---

### Budget Page (2 issues)

#### ARCH-BUDGET-001: All Budget Logic Embedded in Monolithic app.js
- **File:** app/assets/js/app.js (lines 2878, 3050+)
- **Severity:** P0 (Architecture/Maintainability)
- **Description:** All budget functionality embedded in 4000+ line app.js instead of dedicated budget.js module
- **Impact:** Maintainability issues, cannot unit test, performance overhead
- **Effort:** 6 hours
- **Fix:** Create app/assets/js/budget.js and extract all functions (loadBudgetForMonth, saveBudgetItem, updateBudgetItem, deleteBudgetItem, generateBudget, renderSummary, renderBudgetTable, calculateRemaining, navigateMonth)

#### FEAT-BUDGET-001: No Delete Budget Item Button
- **File:** app/budget.html (budget table)
- **Severity:** P0 (Feature Gap)
- **Description:** No button to delete a budget item. Once added, cannot be removed.
- **Impact:** Users cannot correct mistakes or remove obsolete items
- **Effort:** 2 hours
- **Fix:** Add "Delete" button in budget table, wire to deleteBudgetItem() function with confirmation modal

---

## 🟠 PRIORITY 1 BUGS (HIGH) — 21 Issues

### Transactions Page (6 issues)

#### UX-TX-001: Sync Button Not Disabled During Loading
- **Severity:** P1 (UX Polish)
- **Effort:** 1 hour
- **Fix:** Disable button, show spinner icon during Plaid sync

#### UX-TX-002: No Last Sync Timestamp
- **Severity:** P1 (Information)
- **Effort:** 1 hour
- **Fix:** Add "Last synced: [timestamp]" below sync button

#### UX-TX-003: No Transaction Count Display
- **Severity:** P1 (Information)
- **Effort:** 0.5 hours
- **Fix:** Add "Showing 42 transactions" above table

#### UX-TX-004: Auto-Categorize Button Always Enabled
- **Severity:** P1 (UX Polish)
- **Effort:** 1 hour
- **Fix:** Disable when all transactions already categorized or no transactions exist

#### DATA-TX-002: No Sample Transactions in Empty State
- **Severity:** P1 (Onboarding)
- **Effort:** 2 hours
- **Fix:** Add "View Sample Transactions" button that populates with demo data

#### FEAT-TX-001: No Bulk Actions
- **Severity:** P1 (Feature)
- **Effort:** 4 hours
- **Fix:** Add checkboxes, "Categorize Selected" and "Delete Selected" buttons

---

### Friends Page (8 issues)

#### UX-FRIENDS-001: Search Box Requires Manual Submit
- **Severity:** P1 (UX)
- **Effort:** 1 hour
- **Fix:** Add search-on-type (debounced) or auto-submit on Enter key

#### UX-FRIENDS-002: No Search Results Display
- **Severity:** P1 (Feature Gap)
- **Effort:** 3 hours
- **Fix:** Add search results section that displays users matching query

#### UX-FRIENDS-003: No Loading States for Friend Actions
- **Severity:** P1 (UX Polish)
- **Effort:** 2 hours
- **Fix:** Disable buttons, show spinner during accept/reject/send/cancel/remove operations

#### UX-FRIENDS-004: No Success/Error Messages
- **Severity:** P1 (Feedback)
- **Effort:** 2 hours
- **Fix:** Add toast notifications for all friend actions (success/error)

#### DATA-FRIENDS-002: No Friend Count Display
- **Severity:** P1 (Information)
- **Effort:** 0.5 hours
- **Fix:** Add "3 Friends" count in section header

#### DATA-FRIENDS-003: No Sample Friends in Empty State
- **Severity:** P1 (Onboarding)
- **Effort:** 2 hours
- **Fix:** Add "View Sample Friends" button for demo mode

#### FEAT-FRIENDS-004: No Friend Profile View
- **Severity:** P1 (Feature)
- **Effort:** 6 hours
- **Fix:** Add click handler to friend name → modal/page with profile details

#### FEAT-FRIENDS-005: No Shared Bills Display
- **Severity:** P1 (Feature)
- **Effort:** 4 hours
- **Fix:** Add "Shared Bills" tab or section showing bills split with each friend

---

### Budget Page (7 issues)

#### UX-BUDGET-001: No Loading State for Generate Budget
- **Severity:** P1 (UX Polish)
- **Effort:** 1 hour
- **Fix:** Disable button, show spinner during AI budget generation

#### UX-BUDGET-002: No Success Message After Budget Item Saved
- **Severity:** P1 (Feedback)
- **Effort:** 1 hour
- **Fix:** Add toast notification "Budget item saved successfully"

#### UX-BUDGET-003: No Confirmation Before Delete
- **Severity:** P1 (Safety)
- **Effort:** 1 hour
- **Fix:** Add confirmation modal "Delete this budget item? This cannot be undone."

#### UX-BUDGET-004: Month Navigation No Visual Feedback
- **Severity:** P1 (UX Polish)
- **Effort:** 0.5 hours
- **Fix:** Highlight current month, show loading state during month switch

#### DATA-BUDGET-001: No Budget Item Count Display
- **Severity:** P1 (Information)
- **Effort:** 0.5 hours
- **Fix:** Add "5 items budgeted for February 2026" above table

#### DATA-BUDGET-002: No Sample Budget in Empty State
- **Severity:** P1 (Onboarding)
- **Effort:** 2 hours
- **Fix:** Add "View Sample Budget" button that populates demo data

#### FEAT-BUDGET-001-EXT: No Edit Budget Item Button
- **Severity:** P1 (Feature Gap)
- **Effort:** 3 hours
- **Fix:** Add "Edit" button in budget table, open modal pre-filled with existing values

---

## 🟡 PRIORITY 2 BUGS (MEDIUM) — 28 Issues

### Transactions Page (12 issues)

#### CSS-TX-001: Table Not Responsive on Mobile
- **Severity:** P2 (Responsive Design)
- **Effort:** 3 hours
- **Fix:** Add horizontal scroll or card layout for mobile

#### CSS-TX-002: Dropdown Overflows on Small Screens
- **Severity:** P2 (Responsive Design)
- **Effort:** 1 hour
- **Fix:** Limit dropdown width, add ellipsis/scroll

#### A11Y-TX-001: No Skip to Main Content Link
- **Severity:** P2 (Accessibility)
- **Effort:** 0.5 hours
- **Fix:** Add skip link (already exists in other pages)

#### A11Y-TX-002: Filter Buttons Missing aria-pressed State
- **Severity:** P2 (Accessibility)
- **Effort:** 1 hour
- **Fix:** Add aria-pressed="true/false" to filter buttons

#### PERF-TX-001: Table Renders All Transactions at Once
- **Severity:** P2 (Performance)
- **Effort:** 4 hours
- **Fix:** Add pagination or virtual scrolling for 1000+ transactions

#### PERF-TX-002: Category Dropdown Renders 30 Options for Every Row
- **Severity:** P2 (Performance)
- **Effort:** 2 hours
- **Fix:** Use shared dropdown or render on focus

#### UX-TX-005: No Visual Indicator for Filtered State
- **Severity:** P2 (UX)
- **Effort:** 1 hour
- **Fix:** Show "Filtered by: [category]" badge when filter active

#### UX-TX-006: Date Range Inputs No Max/Min Validation
- **Severity:** P2 (Validation)
- **Effort:** 1 hour
- **Fix:** Add validation: start date ≤ end date, max 1 year range

#### UX-TX-007: No Clear Filters Button
- **Severity:** P2 (UX)
- **Effort:** 0.5 hours
- **Fix:** Add "Clear Filters" button when any filter active

#### FEAT-TX-002: No Export Transactions Button
- **Severity:** P2 (Feature)
- **Effort:** 3 hours
- **Fix:** Add "Export CSV" button

#### FEAT-TX-003: No Transaction Details Modal
- **Severity:** P2 (Feature)
- **Effort:** 4 hours
- **Fix:** Click transaction row → modal with full details, receipt upload, notes

#### FEAT-TX-004: No Split Transaction Feature
- **Severity:** P2 (Feature)
- **Effort:** 8 hours
- **Fix:** Add "Split" button → modal to assign portions to different categories

---

### Friends Page (7 issues)

#### CSS-FRIENDS-001: Table Not Responsive on Mobile
- **Severity:** P2 (Responsive Design)
- **Effort:** 3 hours
- **Fix:** Add card layout for mobile

#### A11Y-FRIENDS-001: No Skip to Main Content Link
- **Severity:** P2 (Accessibility)
- **Effort:** 0.5 hours
- **Fix:** Add skip link

#### A11Y-FRIENDS-002: Search Input Missing aria-describedby
- **Severity:** P2 (Accessibility)
- **Effort:** 0.5 hours
- **Fix:** Add description "Search by name or email"

#### UX-FRIENDS-005: No Alphabetical Sort
- **Severity:** P2 (UX)
- **Effort:** 2 hours
- **Fix:** Add sort buttons (A-Z, Z-A, Recent)

#### UX-FRIENDS-006: No Friend Request Timestamp
- **Severity:** P2 (Information)
- **Effort:** 1 hour
- **Fix:** Add "Requested 2 days ago" in pending requests table

#### FEAT-FRIENDS-006: No Block User Feature
- **Severity:** P2 (Safety)
- **Effort:** 4 hours
- **Fix:** Add "Block" button → prevents future friend requests

#### FEAT-FRIENDS-007: No Friend Activity Feed
- **Severity:** P2 (Feature)
- **Effort:** 8 hours
- **Fix:** Add activity section showing friend bill splits, payment status

---

### Budget Page (9 issues)

#### CSS-BUDGET-001: Table Not Responsive on Mobile
- **Severity:** P2 (Responsive Design)
- **Effort:** 3 hours
- **Fix:** Add card layout for mobile

#### CSS-BUDGET-002: Summary Cards Overlap on Tablet
- **Severity:** P2 (Responsive Design)
- **Effort:** 2 hours
- **Fix:** Adjust breakpoints, stack vertically on medium screens

#### A11Y-BUDGET-001: No Skip to Main Content Link
- **Severity:** P2 (Accessibility)
- **Effort:** 0.5 hours
- **Fix:** Add skip link

#### A11Y-BUDGET-002: Month Navigation Buttons Missing aria-label
- **Severity:** P2 (Accessibility)
- **Effort:** 0.5 hours
- **Fix:** Add aria-label="Previous month" and "Next month"

#### UX-BUDGET-005: No Visual Progress Bars
- **Severity:** P2 (UX Enhancement)
- **Effort:** 3 hours
- **Fix:** Add progress bars showing spent/budgeted for each item

#### UX-BUDGET-006: No Budget vs Actual Comparison
- **Severity:** P2 (Feature)
- **Effort:** 4 hours
- **Fix:** Add "Actual Spent" column from transactions data

#### FEAT-BUDGET-002: No Recurring Budget Templates
- **Severity:** P2 (Feature)
- **Effort:** 6 hours
- **Fix:** Add "Copy from Last Month" button

#### FEAT-BUDGET-003: No Budget Alerts
- **Severity:** P2 (Feature)
- **Effort:** 4 hours
- **Fix:** Add notification when spending exceeds budgeted amount

#### FEAT-BUDGET-004: No Annual Budget View
- **Severity:** P2 (Feature)
- **Effort:** 6 hours
- **Fix:** Add year selector and annual summary table

---

## 🔵 PRIORITY 3 BUGS (LOW) — 13 Issues

### Transactions Page (5 issues)

#### POLISH-TX-001: No Hover State on Table Rows
- **Severity:** P3 (Polish)
- **Effort:** 0.5 hours

#### POLISH-TX-002: No Transaction Icon by Category
- **Severity:** P3 (Visual)
- **Effort:** 2 hours

#### POLISH-TX-003: No Merchant Logo Display
- **Severity:** P3 (Visual)
- **Effort:** 4 hours

#### POLISH-TX-004: No Empty State Illustration
- **Severity:** P3 (Visual)
- **Effort:** 1 hour

#### POLISH-TX-005: No Keyboard Shortcuts (j/k navigation)
- **Severity:** P3 (Power User)
- **Effort:** 3 hours

---

### Friends Page (4 issues)

#### POLISH-FRIENDS-001: No Friend Avatar/Photo
- **Severity:** P3 (Visual)
- **Effort:** 4 hours

#### POLISH-FRIENDS-002: No Empty State Illustration
- **Severity:** P3 (Visual)
- **Effort:** 1 hour

#### POLISH-FRIENDS-003: No Friend Suggestions (AI)
- **Severity:** P3 (Enhancement)
- **Effort:** 8 hours

#### POLISH-FRIENDS-004: No Friend Groups/Tags
- **Severity:** P3 (Organization)
- **Effort:** 6 hours

---

### Budget Page (4 issues)

#### POLISH-BUDGET-001: No Color Coding by Category
- **Severity:** P3 (Visual)
- **Effort:** 2 hours

#### POLISH-BUDGET-002: No Empty State Illustration
- **Severity:** P3 (Visual)
- **Effort:** 1 hour

#### POLISH-BUDGET-003: No Budget Goal Celebration
- **Severity:** P3 (Engagement)
- **Effort:** 3 hours

#### POLISH-BUDGET-004: No Budget Recommendations (AI)
- **Severity:** P3 (Enhancement)
- **Effort:** 8 hours

---

## 📊 SUMMARY BY SEVERITY

| Priority | Count | Total Effort | Description |
|----------|-------|--------------|-------------|
| P0 | 10 | 42 hours | Critical bugs blocking production readiness |
| P1 | 21 | 49 hours | High-priority features and UX improvements |
| P2 | 28 | 94 hours | Medium-priority enhancements |
| P3 | 13 | 43 hours | Low-priority polish and nice-to-haves |
| **TOTAL** | **72** | **228 hours** | ~5.7 weeks at 40 hours/week |

---

## 📊 SUMMARY BY PAGE

| Page | P0 | P1 | P2 | P3 | Total | Effort |
|------|-----|-----|-----|-----|-------|--------|
| Transactions | 3 | 6 | 12 | 5 | 26 | 54h |
| Friends | 5 | 8 | 7 | 4 | 24 | 74h |
| Budget | 2 | 7 | 9 | 4 | 22 | 62h |
| **TOTAL** | **10** | **21** | **28** | **13** | **72** | **190h** |

---

## 🎯 RECOMMENDED ACTION PLAN

### Phase 1: Critical Fixes (P0 Only) — 42 hours (~1 week)

**Architectural Refactoring (22 hours):**
1. Create friends.js module (8h) — Extract from app.js
2. Create budget.js module (6h) — Extract from app.js
3. Extract remaining transaction logic (4h) — Move to transactions.js
4. Fix table header/body column mismatch (2h) — Transactions page
5. Add delete button for budget items (2h) — Budget page

**Feature Gaps (12 hours):**
1. Add remove friend button (2h)
2. Add cancel outgoing request button (2h)
3. Add reject incoming request button (2h)
4. Investigate empty transaction data (2h)
5. Investigate empty friend data (2h)
6. Investigate empty budget data (2h) *(Not in original P0, but critical for testing)*

**Outcome:** Production-ready core functionality, testable with data

---

### Phase 2: High-Priority Improvements (P1 Only) — 49 hours (~1.2 weeks)

**UX Polish (15 hours):**
- Loading states for all async operations (6h)
- Success/error toast notifications (4h)
- Month navigation visual feedback (1h)
- Search-on-type for friends (1h)
- Sync button improvements (2h)
- Auto-categorize button state (1h)

**Information Display (4 hours):**
- Transaction count (0.5h)
- Friend count (0.5h)
- Budget item count (0.5h)
- Last sync timestamp (1h)
- Friend request timestamps (1h)
- Current month highlighting (0.5h)

**Features (30 hours):**
- Edit budget item button (3h)
- Friend profile view (6h)
- Shared bills display (4h)
- Bulk transaction actions (4h)
- Sample data for empty states (6h total)
- Search results display (3h)
- Export transactions CSV (3h)
- Budget templates (1h)

**Outcome:** Professional UX, feature-complete for MVP

---

### Phase 3: Medium-Priority Enhancements (P2 Only) — 94 hours (~2.4 weeks)

**Responsive Design (21 hours):**
- Mobile table layouts (9h across 3 pages)
- Card layouts for mobile (9h)
- Summary card breakpoints (2h)
- Dropdown overflow fixes (1h)

**Accessibility (4.5 hours):**
- Skip links for all pages (1.5h)
- ARIA labels and states (3h)

**Performance (10 hours):**
- Transaction table pagination (4h)
- Optimize category dropdowns (2h)
- Virtual scrolling (4h)

**Features (58.5 hours):**
- Transaction details modal (4h)
- Split transaction feature (8h)
- Friend activity feed (8h)
- Block user feature (4h)
- Budget vs actual comparison (4h)
- Recurring budget templates (6h)
- Budget alerts (4h)
- Annual budget view (6h)
- Filters and sorting (5h)
- Export features (3h)
- Friend suggestions (8h)
- Friend groups/tags (6h)
- Visual enhancements (8.5h)

**Outcome:** Production-grade app with advanced features

---

### Phase 4: Polish & Enhancements (P3 Only) — 43 hours (~1.1 weeks)

**Visual Polish (16 hours):**
- Category icons (2h)
- Merchant logos (4h)
- Friend avatars (4h)
- Empty state illustrations (3h)
- Color coding (2h)
- Hover states (1h)

**Engagement (11 hours):**
- Budget goal celebrations (3h)
- AI budget recommendations (8h)

**Power User Features (16 hours):**
- AI friend suggestions (8h)
- Friend groups/tags (6h)
- Keyboard shortcuts (3h)

**Outcome:** Delightful, polished, engaging experience

---

## 🚀 AZURE DEVOPS WORK ITEM CREATION

**Recommended Approach:**
1. Create all P0 items first (10 work items) — Immediate sprint
2. Create P1 items (21 work items) — Next sprint
3. Defer P2/P3 to backlog grooming session with founder

**Work Item Format:**

```
Title: [BUG-TX-001] Table header/body column mismatch (transactions.html)
Type: Bug
Priority: 1 (Critical)
Effort: 2
Area Path: Fireside Capital\Frontend
Iteration: Sprint 1
Description:
Table defines 5 columns in <thead> but only renders 4-5 in <tbody>, causing visual misalignment. "Confidence" header aligns with "Pending" column instead of AI confidence score.

File: app/transactions.html (lines 164-172)
Impact: Screen reader users receive incorrect column information
Fix: Either make Confidence a separate column OR rename header to "Status"

Acceptance Criteria:
[ ] Table header columns match tbody columns exactly
[ ] Screen reader announces correct column names
[ ] Visual alignment correct on desktop and mobile
[ ] No semantic HTML errors
```

---

**Last Updated:** February 12, 2026 04:30 AM EST  
**Next Action:** Create Azure DevOps work items for P0 bugs (10 items, 42 hours total)  
**Status:** Ready for work item creation and sprint planning
