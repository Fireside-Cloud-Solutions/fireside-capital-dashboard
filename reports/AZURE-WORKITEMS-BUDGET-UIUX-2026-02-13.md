# Azure DevOps Work Items: Budget Page UI/UX
**Created:** Friday, February 13, 2026 — 7:27 AM EST  
**Sprint:** Current Sprint  
**Area:** Fireside Capital / UI/UX  
**Source:** UI-UX-AUDIT-BUDGET-2026-02-13-0725.md

---

## Work Item #1: Budget - Month Navigation Mobile Touch Targets

**Type:** Bug  
**Priority:** 1 (High)  
**Effort:** 1 SP  
**Assigned To:** Builder  
**Tags:** accessibility, mobile, wcag, touch-targets

### Description
Month navigation controls (Previous/Next buttons) on Budget page use `.btn-sm` which may not meet WCAG 2.5.5 touch target requirements (44x44px minimum).

### Steps to Reproduce
1. Navigate to Budget page on mobile (or Chrome DevTools mobile view)
2. Inspect Previous/Next month buttons
3. Measure button dimensions

### Expected Behavior
- Buttons should be ≥44x44px on all screen sizes
- Proper spacing using design token variables
- `text-nowrap` class (not `text-no-wrap`)

### Acceptance Criteria
- [ ] Replace `.btn-sm` with `.btn-touch-target` class
- [ ] Update spacing to use `gap: var(--space-2)` instead of Bootstrap `.gap-2`
- [ ] Fix typo: `text-no-wrap` → `text-nowrap`
- [ ] Verify touch targets ≥44x44px in Chrome DevTools
- [ ] Test on actual mobile device

### Files to Modify
- `app/budget.html` (lines 168-173)
- `app/assets/css/components.css` (add `.btn-touch-target` if missing)

### Code Fix
```html
<!-- BEFORE -->
<button class="btn btn-outline-secondary btn-sm" id="prevMonth">
  <i class="bi bi-chevron-left"></i>
</button>

<!-- AFTER -->
<button class="btn btn-outline-secondary btn-touch-target" 
        id="prevMonth" aria-label="Previous month">
  <i class="bi bi-chevron-left"></i>
</button>
```

---

## Work Item #2: Budget - Add Empty State Component

**Type:** User Story  
**Priority:** 2 (Medium)  
**Effort:** 1 SP  
**Assigned To:** Builder  
**Tags:** ux, onboarding, empty-states

### User Story
As a **new user**  
I want to **see a helpful message when my budget is empty**  
So that I **understand how to create my first budget item**

### Description
Budget page has no empty state implementation. When `#budgetAssignmentTable` has no rows, users see a blank table with just headers. This creates confusion for first-time users.

### Acceptance Criteria
- [ ] Implement empty state component when budget table is empty
- [ ] Include icon (`.bi-calculator`), title, message, and CTA button
- [ ] Match empty state pattern from transactions/bills pages
- [ ] Show empty state on initial page load if no data
- [ ] Hide empty state when data exists

### Design Mockup
```html
<div class="empty-state" id="budgetEmptyState">
  <div class="empty-state-icon">
    <i class="bi bi-calculator"></i>
  </div>
  <h4 class="empty-state-title">No Budget Items Yet</h4>
  <p class="empty-state-message">
    Create your first budget item to start tracking spending.
  </p>
  <button class="btn btn-secondary" 
          data-bs-toggle="modal" 
          data-bs-target="#addBudgetItemModal">
    <i class="bi bi-plus-circle"></i> Add Budget Item
  </button>
</div>
```

### Files to Modify
- `app/budget.html` (add empty state component)
- `app/assets/js/budget.js` (show/hide logic)

### Dependencies
- Existing: `assets/js/empty-states.js` (pattern reference)
- Existing: `assets/css/components.css` (empty state styles)

---

## Work Item #3: Budget - Responsive Table Columns

**Type:** Task  
**Priority:** 2 (Medium)  
**Effort:** 2 SP  
**Assigned To:** Builder  
**Tags:** responsive, mobile, table

### Description
Budget table shows 7 columns on mobile, requiring horizontal scroll. This creates poor UX on small screens. Implement responsive column hiding.

### Current Columns
1. Item (keep)
2. Category (hide on mobile)
3. Needed (keep)
4. Assigned (keep)
5. Remaining (hide on tablet)
6. Funding Status (hide on mobile)
7. Actions (keep)

### Acceptance Criteria
- [ ] Hide "Category" column on screens <992px (lg breakpoint)
- [ ] Hide "Remaining" column on screens <768px (md breakpoint)
- [ ] Hide "Funding Status" column on screens <1200px (xl breakpoint)
- [ ] Ensure table doesn't break layout on mobile
- [ ] Test on mobile devices (iPhone, Android)
- [ ] Verify horizontal scroll behavior if needed

### Implementation
Add responsive Bootstrap classes to table headers:

```html
<th class="col-width-22">Item</th>
<th class="col-width-13 d-none d-lg-table-cell">Category</th>
<th class="col-width-13">Needed</th>
<th class="col-width-14">Assigned</th>
<th class="col-width-13 d-none d-md-table-cell">Remaining</th>
<th class="col-width-15 d-none d-xl-table-cell">Funding Status</th>
<th class="col-width-10">Actions</th>
```

**Note:** Also apply same classes to corresponding `<td>` elements in JavaScript rendering.

### Files to Modify
- `app/budget.html` (table header, lines 243-251)
- `app/assets/js/budget.js` (update row rendering logic)

---

## Work Item #4: [GLOBAL] Design System - Spacing Scale Alignment

**Type:** Technical Debt  
**Priority:** 1 (High)  
**Effort:** 3 SP  
**Assigned To:** Architect  
**Tags:** design-system, css, architecture

### Description
**GLOBAL ISSUE affecting all pages:**

Spacing system inconsistency between design tokens and actual usage:
- `design-tokens.css` defines 4px base (`--space-1: 0.25rem`)
- `main.css` documents "8px grid system"
- Bootstrap gutters use different increments (`.g-3` = 16px, `.g-xl-4` = 24px)

This creates confusion and makes it hard to maintain consistent spacing.

### Impact
- All pages using Bootstrap grid gutters (`.g-3`, `.g-xl-4`)
- Developers unsure which spacing to use
- Violates design system principles

### Proposed Solution
**Option A:** Align design tokens to 8px base
```css
/* design-tokens.css */
--space-1: 0.5rem;   /* 8px */
--space-2: 1rem;     /* 16px */
--space-3: 1.5rem;   /* 24px */
--space-4: 2rem;     /* 32px */
```

**Option B:** Document 4px base as intentional, update `main.css` comments

### Acceptance Criteria
- [ ] Choose spacing system (4px or 8px base)
- [ ] Update `design-tokens.css` with correct values
- [ ] Update `main.css` comments to match
- [ ] Replace Bootstrap gutters with design token spacing across all pages
- [ ] Document decision in `docs/design-system.md`
- [ ] Run visual regression tests to ensure no layout breaks

### Files to Audit (11 pages)
- All `.html` files using `.g-3`, `.g-xl-4`, `.gap-*` classes

### Estimated Impact
- 11 HTML pages to update
- 3 CSS files to modify
- 2-3 hours of testing

---

## Work Item #5: Budget - Generate Budget Button Affordance

**Type:** Enhancement  
**Priority:** 3 (Low)  
**Effort:** 0.5 SP  
**Assigned To:** Builder  
**Tags:** ux, tooltips

### Description
"Generate Budget" button uses secondary styling but represents a powerful automation feature. Users may not understand what it does without trying it.

### Acceptance Criteria
- [ ] Add tooltip explaining feature: "Auto-generate budget based on your bills and income"
- [ ] Consider promoting to `.btn-primary` (flame orange) if it's a key feature
- [ ] Verify tooltip works on mobile (touch to show)

### Files to Modify
- `app/budget.html` (line 177)
- `app/assets/js/budget.js` (initialize Bootstrap tooltips)

---

## Summary

**Total Work Items:** 5  
**High Priority:** 2 (Issues #1, #4)  
**Medium Priority:** 2 (Issues #2, #3)  
**Low Priority:** 1 (Issue #5)  
**Total Effort:** 7.5 Story Points

### Sprint Recommendation
Include Issues #1, #2, #4 in current sprint (4 SP total).  
Defer Issues #3, #5 to next sprint (3.5 SP).

### Dependencies
- Issue #4 (Design System) affects all pages — recommend tackling early
- Issues #1-3 are isolated to Budget page

---

## Next Steps
1. Create these work items in Azure DevOps (org: fireside365, project: Fireside Capital)
2. Assign to Builder agent
3. Link to audit report: `reports/UI-UX-AUDIT-BUDGET-2026-02-13-0725.md`
4. Schedule for current sprint
