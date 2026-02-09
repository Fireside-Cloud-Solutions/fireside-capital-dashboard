# UI/UX Audit Work Items — February 9, 2026

**Created by:** Capital (Orchestrator)  
**Audit Date:** 2026-02-09  
**Project:** Fireside Capital  
**Azure DevOps:** https://dev.azure.com/fireside365/Fireside%20Capital

---

## 🔴 HIGH PRIORITY WORK ITEMS

### WI-1: Fix Auth Button Layout Shift on Mobile
**Type:** Bug  
**Priority:** 2 (High)  
**Area Path:** Fireside Capital\UI  
**Iteration:** Sprint 1  

**Description:**  
Auth buttons (Login/Signup vs Welcome dropdown) cause layout shift when switching between logged-out and logged-in states on mobile. Critical inline CSS attempts to fix but doesn't fully prevent snap.

**Location:**  
- All HTML pages — Top-right auth state (Login/Signup vs Welcome dropdown)
- `main.css` — Auth state containers

**Acceptance Criteria:**
- [ ] Both auth states (#loggedOutState and #loggedInState) have identical fixed dimensions
- [ ] No visible layout shift when auth state changes
- [ ] Smooth opacity fade transition (200ms)
- [ ] Z-index values use design tokens consistently

**Technical Notes:**  
Use `opacity: 0` + `visibility: hidden` with fixed positioning on both states. Ensure both containers have identical dimensions to prevent reflow.

---

### WI-2: Fix Chart Wrapper Max-Height Bug ✅ FALSE POSITIVE
**Type:** Bug  
**Priority:** 2 (High)  
**Area Path:** Fireside Capital\UI  
**Iteration:** Sprint 1  
**Status:** ✅ CLOSED - FALSE POSITIVE (2026-02-09 @ 7:55 AM)

**Description:**  
Chart wrapper max-height rule was removed from `main.css` (line 1144) with comment "REMOVED: This rule was OVERRIDING the correct max-height values" but no explicit max-height is set elsewhere. Charts could expand infinitely.

**Resolution:**  
VERIFIED: `utilities.css:48-105` has comprehensive chart height utilities with proper max-height constraints:
- `.chart-height-sm`: 260px with responsive breakpoints
- `.chart-height-md`: 300px with responsive breakpoints
- `.chart-height-lg`: 350px with responsive breakpoints
- `.chart-wrapper-centered`: 260px with flex centering

All chart wrappers are using these utility classes. No bug exists.

**Location:**  
- `main.css:1144` — Chart wrapper styles
- `utilities.css:48-105` — Chart height utilities ✅ VERIFIED

**Verification:** Sprint Dev session 2026-02-09 @ 7:55 AM

---

### WI-3: Remove Duplicate Auth Section from Bills Page ✅ FALSE POSITIVE
**Type:** Bug  
**Priority:** 2 (High)  
**Area Path:** Fireside Capital\UI  
**Iteration:** Sprint 1  
**Status:** ✅ CLOSED - FALSE POSITIVE (2026-02-09 @ 7:55 AM)

**Description:**  
Bills.html page has TWO identical auth button sections (one in `.page-header`, one inside a separate `<div>`). This creates duplicate DOM elements and potential layout conflicts.

**Resolution:**  
VERIFIED: No duplicate auth sections exist in bills.html:
- `id="loggedOutState"`: 1 instance only (line 108)
- `id="loggedInState"`: 1 instance only (line 113)

Bills page structure matches other pages (assets.html, transactions.html, etc.) - all have single auth state container as third child of `.page-header`. No bug exists.

**Location:**  
- `bills.html:107-138` — Single auth section (VERIFIED) ✅

**Verification:** Sprint Dev session 2026-02-09 @ 7:55 AM

---

### WI-4: Standardize Theme Toggle Across All Pages
**Type:** Feature  
**Priority:** 2 (High)  
**Area Path:** Fireside Capital\UI  
**Iteration:** Sprint 1  

**Description:**  
Budget and Settings pages have a "Theme Toggle" in the sidebar that OTHER pages don't have. Inconsistent UI element that should appear on ALL pages or be moved to settings.

**Location:**  
- `budget.html:106-111` — Theme toggle in sidebar
- `settings.html:106-111` — Theme toggle in sidebar
- All other pages — Missing theme toggle

**Acceptance Criteria:**
- [ ] Choose one approach: (a) Add to all pages, or (b) Move to settings only, or (c) Add to user dropdown
- [ ] Theme toggle appears consistently across all pages
- [ ] Theme preference persists across sessions
- [ ] Smooth transition between themes

**Recommendation:**  
Move theme toggle to user dropdown menu (next to "Account Settings" and "Logout") for consistency and accessibility.

---

### WI-5: Fix Sidebar Z-Index Conflicts on Mobile
**Type:** Bug  
**Priority:** 2 (High)  
**Area Path:** Fireside Capital\UI  
**Iteration:** Sprint 1  

**Description:**  
Sidebar toggle button (`z-index: calc(var(--z-sticky) + 10)`) and auth buttons (`z-index: 1000`) can overlap. Hardcoded `1000` doesn't use design tokens.

**Location:**  
- `main.css:1026-1080` — Sidebar mobile styles
- Critical inline CSS in all HTML pages

**Acceptance Criteria:**
- [ ] All z-index values use design tokens from `design-tokens.css`
- [ ] Sidebar toggle uses `var(--z-modal)`
- [ ] Auth buttons use `calc(var(--z-modal) + 1)`
- [ ] No visual overlaps on mobile (test at 375px, 414px, 768px)

**Technical Notes:**  
Update critical inline CSS in all HTML pages to use design tokens.

---

## 🟡 MEDIUM PRIORITY WORK ITEMS

### WI-6: Fix Button Hierarchy on Dashboard
**Type:** Bug  
**Priority:** 3 (Medium)  
**Area Path:** Fireside Capital\UI  
**Iteration:** Sprint 2  

**Description:**  
Dashboard page doesn't follow tri-color hierarchy rule (Orange PRIMARY = 1/page, Blue SECONDARY = 2/page, Gray TERTIARY = unlimited). Multiple secondary buttons appear without clear priority.

**Location:**  
- `index.html` — Dashboard page (no page header actions)

**Acceptance Criteria:**
- [ ] Dashboard has NO primary CTA (view-only page)
- [ ] "View All" links use tertiary style (text link or outline button)
- [ ] Chart time range filters use tertiary style
- [ ] Visual hierarchy is clear at a glance

**Related Pages:**  
- Bills page: "Add Bill" = PRIMARY, "Scan Email" = SECONDARY
- Transactions page: "Sync from Bank" = PRIMARY, others = SECONDARY/TERTIARY

---

### WI-7: Fix Button Hierarchy on Transactions Page ✅ COMPLETE
**Type:** Bug  
**Priority:** 3 (Medium)  
**Area Path:** Fireside Capital\UI  
**Iteration:** Sprint 2  
**Status:** ✅ CLOSED - FIXED (2026-02-09 @ 5:43 AM)

**Description:**  
Three action buttons at top-level: "Sync from Bank" (PRIMARY), "Add Transaction" (SECONDARY), "Auto-Categorize" (TERTIARY). But "Sync" is PRIMARY orange yet sits inline with secondary actions, breaking visual hierarchy.

**Resolution:**  
FIXED in commit `55281d5` by Sprint Dev session 0543:
- "Sync from Bank": `btn-primary` (orange) ✅
- "Add Transaction": `btn-secondary` (blue) ✅ 
- "Auto-Categorize": `btn-outline-secondary` (gray outline) ✅

Button hierarchy now follows tri-color system correctly.

**Location:**  
- `transactions.html:144,147` — Button classes updated

**Commit:** 55281d5 (2026-02-09 @ 5:43 AM)  
**Verification:** Sprint Dev session 2026-02-09 @ 5:43 AM

---

### WI-8: Fix Empty State Button Styles ✅ COMPLETE
**Type:** Bug  
**Priority:** 3 (Medium)  
**Area Path:** Fireside Capital\UI  
**Iteration:** Sprint 2  
**Status:** ✅ CLOSED - FIXED (2026-02-09 @ 7:40 AM)

**Description:**  
Empty state CTAs use `.btn-secondary` (blue) but should use `.btn-primary` (orange) as they are the PRIMARY action when no data exists.

**Resolution:**  
FIXED in commit `b65f797` by Sprint Dev session 0737:
- transactions.html:220 — "Sync from Bank" → `btn-primary` ✅
- friends.html:165 — "Search for Friends" (Pending) → `btn-primary` ✅
- friends.html:185 — "Find Friends" (My friends) → `btn-primary` ✅
- friends.html:205 — "Search for Friends" (Sent) → `btn-primary` ✅

All 4 empty state buttons now use orange primary styling.

**Location:**  
- `transactions.html:220` — Fixed
- `friends.html:165,185,205` — Fixed

**Commit:** b65f797 (2026-02-09 @ 7:40 AM)  
**Verification:** Sprint QA session 2026-02-09 @ 7:41 AM (WI-8 verified & passed)

---

### WI-9: Fix Notification Dropdown Width on Tablets
**Type:** Bug  
**Priority:** 3 (Medium)  
**Area Path:** Fireside Capital\UI  
**Iteration:** Sprint 2  

**Description:**  
Notification dropdown set to 550px width, but on tablets (768px-1024px) it's capped at 95vw. Text wraps awkwardly on medium screens.

**Location:**  
- `components.css:15-24` — Notification dropdown styles

**Acceptance Criteria:**
- [ ] Use `max-width: min(550px, 95vw)` for all breakpoints
- [ ] `.notification-title` has `max-width: 100%` and `word-break: break-word`
- [ ] Test on iPad (768px) and iPad Pro (1024px)
- [ ] No awkward text wrapping or overflow

**Technical Notes:**  
Ensure notification text can wrap properly across all screen sizes.

---

### WI-10: Fix Budget Page Month Navigation Alignment
**Type:** Bug  
**Priority:** 3 (Medium)  
**Area Path:** Fireside Capital\UI  
**Iteration:** Sprint 2  

**Description:**  
Month navigation (prev/next buttons + month label) uses inconsistent button sizes (`.btn-sm`) while page actions use standard `.btn`. Visually misaligned with other controls.

**Location:**  
- `budget.html:124-129` — Month navigation

**Acceptance Criteria:**
- [ ] Remove `.btn-sm` from month nav buttons
- [ ] Use standard button size
- [ ] Wrap navigation in separate visual group with border/background
- [ ] Aligned with other page controls

---

### WI-11: Improve Friends Page Empty State Copy
**Type:** Improvement  
**Priority:** 3 (Medium)  
**Area Path:** Fireside Capital\UX  
**Iteration:** Sprint 2  

**Description:**  
Three empty state sections (Pending, My Friends, Outgoing) all have identical "Search for Friends" buttons with same icon/text. Confusing when multiple appear.

**Location:**  
- `friends.html:152-219` — Three empty state sections

**Acceptance Criteria:**
- [ ] First empty state: PRIMARY button ("Find Your First Friend")
- [ ] Subsequent empty states: Link style or secondary button
- [ ] Vary button text: "Find Your First Friend", "Search for More", "Add More Friends"
- [ ] Each empty state has unique copy

**UX Notes:**  
Make each empty state feel contextually relevant to its section.

---

### WI-12: Fix Table Column Widths on Mobile
**Type:** Bug  
**Priority:** 3 (Medium)  
**Area Path:** Fireside Capital\UI  
**Iteration:** Sprint 2  

**Description:**  
`.col-width-*` classes use fixed percentages that break table layout on mobile. No responsive adjustments. Tables force horizontal scroll even when content could reflow.

**Location:**  
- `utilities.css:190-195` — Table column width classes
- `main.css:1724` — Mobile table styles

**Acceptance Criteria:**
- [ ] Add media query to remove fixed widths on mobile (<768px)
- [ ] Test responsive table patterns: hide non-critical columns or use card-based layouts
- [ ] Tables readable on iPhone SE (375px) without excessive scrolling

**Technical Fix:**
```css
@media (max-width: 767.98px) {
  .col-width-10, .col-width-13, .col-width-14, .col-width-15, .col-width-22 {
    width: auto !important;
  }
}
```

---

### WI-13: Expand Settings Page
**Type:** Feature  
**Priority:** 3 (Medium)  
**Area Path:** Fireside Capital\Feature  
**Iteration:** Sprint 3  

**Description:**  
Entire settings page has ONE field (Emergency Fund Goal). Poor UX — feels incomplete/abandoned. Users expect more settings.

**Location:**  
- `settings.html:149-172` — Settings page

**Acceptance Criteria:**
- [ ] Add at least 2-3 more settings:
  - Profile settings (name, email display)
  - Notification preferences
  - Data export/backup option
- [ ] Or redirect to profile modal instead of dedicated page
- [ ] Settings page feels feature-complete

**UX Notes:**  
Consider whether a dedicated settings page is necessary or if these should live elsewhere.

---

## 🟢 LOW PRIORITY WORK ITEMS (POLISH)

### WI-14: Add Stat Card Fade-In Animation
**Type:** Improvement  
**Priority:** 4 (Low)  
**Area Path:** Fireside Capital\UI  
**Iteration:** Backlog  

**Description:**  
Skeleton loaders use `.loading` class but the transition between skeleton and actual content isn't smooth. No fade-in animation when data loads.

**Location:**  
- `index.html` — Dashboard stat cards

**Acceptance Criteria:**
- [ ] Add CSS transition: `opacity 200ms ease` to `.stat-value` and `.stat-trend`
- [ ] Add `@keyframes fadeIn` animation
- [ ] Smooth transition from skeleton to content

---

### WI-15: Standardize Icon Usage in Section Headers
**Type:** Improvement  
**Priority:** 4 (Low)  
**Area Path:** Fireside Capital\UI  
**Iteration:** Backlog  

**Description:**  
Some headings have icons, others don't. No consistent pattern for when icons should appear.

**Location:**  
- All pages — Section headings

**Acceptance Criteria:**
- [ ] Establish icon usage rule:
  - Page titles: NO icons
  - Top-level sections: Icons ALWAYS (e.g., "📋 Recurring Bills")
  - Sub-sections: Icons optional
- [ ] Apply consistently across all pages
- [ ] Document in style guide

---

### WI-16: Hide Empty Page Header Actions
**Type:** Bug  
**Priority:** 4 (Low)  
**Area Path:** Fireside Capital\UI  
**Iteration:** Backlog  

**Description:**  
Some pages have action buttons, others leave `.page-header-actions` empty but still render the div. Creates inconsistent spacing.

**Location:**  
- All pages — `.page-header-actions`

**Acceptance Criteria:**
- [ ] Add CSS rule: `.page-header-actions:empty { display: none; }`
- [ ] Test on all pages to ensure no layout shift

---

### WI-17: Add Scrollable List Fade Indicator
**Type:** Improvement  
**Priority:** 4 (Low)  
**Area Path:** Fireside Capital\UI  
**Iteration:** Backlog  

**Description:**  
`.list-scrollable::after` fade gradient only shows on mobile, but desktop lists can also scroll and would benefit from fade indicator.

**Location:**  
- `utilities.css:155-173` — Scrollable list styles

**Acceptance Criteria:**
- [ ] Apply fade indicator to ALL `.list-scrollable` elements, not just mobile
- [ ] Adjust opacity based on scroll position via JS
- [ ] Fade indicator clearly shows more content below

---

### WI-18: Add Active State to Action Buttons
**Type:** Improvement  
**Priority:** 4 (Low)  
**Area Path:** Fireside Capital\UI  
**Iteration:** Backlog  

**Description:**  
Primary action buttons show hover state but no `:active` (pressed) state. Feels less responsive when clicked.

**Location:**  
- All pages — Buttons like "Apply Filters", "Save Settings"

**Acceptance Criteria:**
- [ ] Verify `:active` styles defined in `main.css` work correctly
- [ ] Add explicit `:active` styles for all button variants if missing
- [ ] Test on all primary/secondary/tertiary buttons

---

### WI-19: Fix Chart Height on Small Screens
**Type:** Bug  
**Priority:** 4 (Low)  
**Area Path:** Fireside Capital\UI  
**Iteration:** Backlog  

**Description:**  
Chart height utilities use fixed values that don't scale well on very small screens (320px-375px). Mobile phones get charts that are too tall for viewport.

**Location:**  
- `utilities.css:48-105` — Chart height utilities

**Acceptance Criteria:**
- [ ] Test on iPhone SE (375px width)
- [ ] Ensure charts don't dominate screen
- [ ] Verify responsive breakpoints work as intended

---

### WI-20: Standardize Filters vs Table Card Styling
**Type:** Improvement  
**Priority:** 4 (Low)  
**Area Path:** Fireside Capital\UI  
**Iteration:** Backlog  

**Description:**  
Filters section uses `.card` class but nearby table uses `.table-card` class. Both should match for visual consistency.

**Location:**  
- `transactions.html:174-195` — Filters card

**Acceptance Criteria:**
- [ ] Change filters to use `.table-card` class
- [ ] Or create dedicated `.filter-card` class that matches `.table-card` styling
- [ ] Visual consistency between filter cards and table cards

---

### WI-21: Verify Welcome Dropdown No-Wrap Fix
**Type:** Bug  
**Priority:** 4 (Low)  
**Area Path:** Fireside Capital\UI  
**Iteration:** Backlog  

**Description:**  
`main.css:1518` mentions "Fix Welcome dropdown wrapping - see CRITICAL FIX block below" but no critical fix block exists in the file (truncated at line 1961).

**Location:**  
- `main.css:1518` — Dropdown styles

**Acceptance Criteria:**
- [ ] Read full `main.css` to find critical fix
- [ ] If missing, add: `.dropdown .welcome-prefix { white-space: nowrap; }`
- [ ] Test welcome dropdown doesn't wrap on small screens

---

## 📈 Summary

**Total Work Items:** 21  
- **High Priority:** 5 work items  
- **Medium Priority:** 8 work items  
- **Low Priority:** 8 work items  

**Estimated Effort:**  
- High: ~16 hours (avg 3.2 hours per item)  
- Medium: ~24 hours (avg 3 hours per item)  
- Low: ~12 hours (avg 1.5 hours per item)  
**Total: ~52 hours**

---

## 🎯 Next Steps

1. **Import work items to Azure DevOps**
   - Use Azure CLI or manual creation
   - Assign to Builder sub-agent

2. **Prioritize for Sprint 1**
   - Focus on HIGH priority items first
   - Fix foundational issues before polish

3. **Test on live site**
   - Use browser automation for verification
   - Test on mobile devices (375px, 414px, 768px, 1024px)

4. **Create regression test suite**
   - Document expected behavior
   - Add visual regression tests

---

**Created by:** Capital (Orchestrator)  
**Date:** 2026-02-09 6:25 AM EST
