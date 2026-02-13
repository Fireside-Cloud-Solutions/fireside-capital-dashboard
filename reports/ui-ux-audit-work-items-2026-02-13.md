# UI/UX Audit Work Items — February 13, 2026

**Audit Date:** Friday, February 13, 2026, 6:47 AM EST
**Auditor:** Capital (Architect agent)
**Pages Reviewed:** index.html, bills.html, assets.html, transactions.html
**Status:** Ready for Azure DevOps import

---

## HIGH PRIORITY TASKS

### Task #1: Standardize Spacing System to 8px Grid
**Type:** Task
**Priority:** 1 (High)
**Tags:** UI/UX, Design System, High Priority
**Effort:** 3 hours

**Description:**
Mixed spacing systems (4px base in design-tokens.css, 8px grid in main.css) causing visual inconsistency across the app.

**Acceptance Criteria:**
- [ ] Update design-tokens.css to use 8px base grid (--space-1 = 8px, --space-2 = 16px, etc.)
- [ ] Remove 4px-based utilities from the system
- [ ] Update all components using old spacing values
- [ ] Verify visual consistency across all pages
- [ ] Update documentation with new spacing scale

**Files to Modify:**
- `app/assets/css/design-tokens.css`
- `app/assets/css/main.css`
- All component CSS files using spacing utilities

**Testing:**
- Visual regression test on all pages
- Verify spacing consistency with design mockups

---

### Task #2: Fix Button Touch Targets for Accessibility
**Type:** Task
**Priority:** 1 (High)
**Tags:** UI/UX, Accessibility, WCAG 2.5.5, High Priority
**Effort:** 2 hours

**Description:**
Inconsistent button sizes across pages. Some buttons have `btn-touch-target` class (assets.html), others don't (bills.html), violating WCAG 2.5.5 (Target Size: 44x44px minimum).

**Acceptance Criteria:**
- [ ] Apply `btn-touch-target` class to all primary action buttons
- [ ] Ensure all interactive elements meet 44x44px minimum size
- [ ] Add utility class for touch targets in design system
- [ ] Document touch target standards in style guide

**Files to Modify:**
- `app/bills.html` — Add btn-touch-target to "Add Bill" button
- `app/index.html` — Verify all action buttons
- `app/transactions.html` — Add to sync button
- `app/investments.html` — Add to "Add Investment" button
- `app/debts.html` — Add to "Add Debt" button
- `app/income.html` — Add to "Add Income" button

**Testing:**
- Manual touch testing on mobile devices (iOS Safari, Chrome Android)
- Automated accessibility audit (axe DevTools)

---

### Task #3: Fix Text Contrast for WCAG AA Compliance
**Type:** Bug
**Priority:** 1 (High)
**Tags:** UI/UX, Accessibility, WCAG 2.1 AA, High Priority
**Effort:** 2 hours

**Description:**
`.text-muted` uses `opacity: 0.7` on already gray text (`--color-text-secondary`), potentially failing WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text).

**Acceptance Criteria:**
- [ ] Calculate actual color values that meet WCAG AA contrast
- [ ] Replace opacity-based muted text with solid colors
- [ ] Test all muted text instances with color contrast checker
- [ ] Ensure 4.5:1 contrast ratio for body text
- [ ] Ensure 3:1 contrast ratio for large text (18px+ or 14px+ bold)

**Files to Modify:**
- `app/assets/css/main.css` (~line 155)
- `app/assets/css/design-tokens.css` — Update `--color-text-muted` if needed

**Testing:**
- WCAG color contrast checker (https://webaim.org/resources/contrastchecker/)
- Automated accessibility audit (axe DevTools, WAVE)
- Manual review on all pages with muted text

**Color Calculations:**
```
Background: #0f0f0f (--color-bg-1) = RGB(15, 15, 15) = Luminance 0.004
Current: #b0b0b0 at 70% opacity = effective #7a7a7a
Target: Achieve 4.5:1 contrast ratio
Required luminance: ≥ 0.185
Required color: ~#999999 or lighter
```

---

## MEDIUM PRIORITY TASKS

### Task #4: Fix Mobile Navigation Z-Index Conflict
**Type:** Bug
**Priority:** 2 (Medium)
**Tags:** UI/UX, Mobile, Responsive Design
**Effort:** 1 hour

**Description:**
Hamburger menu uses `z-index: var(--z-modal)` (400) but auth buttons use `var(--z-sticky)` (200), causing potential overlap issues on mobile.

**Acceptance Criteria:**
- [ ] Hamburger menu → `var(--z-sticky)` (200)
- [ ] Keep modals at `var(--z-modal)` (400)
- [ ] Verify no overlap issues on mobile viewports
- [ ] Update z-index documentation

**Files to Modify:**
- Critical inline CSS in all .html files (search for `sidebar-toggle`)

---

### Task #5: Improve Notification Dropdown Responsiveness
**Type:** Task
**Priority:** 2 (Medium)
**Tags:** UI/UX, Responsive Design, Tablet
**Effort:** 1 hour

**Description:**
Fixed width `550px` on notification dropdown doesn't adapt well to tablet viewports (768px-1024px).

**Acceptance Criteria:**
- [ ] Replace fixed width with responsive calculation
- [ ] Use `max(400px, min(550px, calc(100vw - 48px)))`
- [ ] Test on tablet viewports (768px, 1024px)
- [ ] Verify text wrapping works properly

**Files to Modify:**
- `app/assets/css/components.css` — Notification dropdown styles

---

### Task #6: Add Empty State to Transactions Page
**Type:** Task
**Priority:** 2 (Medium)
**Tags:** UI/UX, First-Time User Experience
**Effort:** 2 hours

**Description:**
No visual guidance when no transactions exist (bills.html has good empty state via subscriptions widget).

**Acceptance Criteria:**
- [ ] Design empty state component (icon, message, CTA)
- [ ] Add "Connect Bank Account" CTA button
- [ ] Match bills.html empty state styling
- [ ] Show when transaction list is empty

**Files to Modify:**
- `app/transactions.html`
- `app/assets/css/components.css` (if new styles needed)

**Design:**
```
Icon: bi-arrow-left-right (large, muted)
Heading: "No Transactions Yet"
Message: "Connect your bank account to automatically import and categorize transactions."
CTA: "Connect Bank Account" (secondary button, opens Plaid)
```

---

### Task #7: Convert Typography to Design Token Variables
**Type:** Task
**Priority:** 2 (Medium)
**Tags:** UI/UX, Design System, Scalability
**Effort:** 3 hours

**Description:**
Mix of px and rem units for font sizes. Some use hardcoded `32px`, others use `var(--text-h2)`.

**Acceptance Criteria:**
- [ ] Replace all hardcoded px font sizes with design token variables
- [ ] Document font size scale usage
- [ ] Verify responsive scaling on mobile

**Files to Modify:**
- `app/assets/css/main.css`
- All component CSS files with hardcoded font sizes

---

### Task #8: Apply Skeleton Loaders Consistently
**Type:** Task
**Priority:** 2 (Medium)
**Tags:** UI/UX, Performance, Polish
**Effort:** 4 hours

**Description:**
Dashboard has elegant skeleton loaders for stat cards, but other pages (bills, assets, transactions) show plain spinners or nothing during load.

**Acceptance Criteria:**
- [ ] Create skeleton loader components for tables/lists
- [ ] Apply to bills list
- [ ] Apply to assets table
- [ ] Apply to transactions table
- [ ] Match dashboard skeleton styling

**Files to Modify:**
- `app/bills.html`
- `app/assets.html`
- `app/transactions.html`
- `app/assets/css/components.css` (skeleton loader utilities)

---

## LOW PRIORITY TASKS

### Task #9: Smooth Page Actions Transition
**Type:** Enhancement
**Priority:** 3 (Low)
**Tags:** UI/UX, Polish, Animation
**Effort:** 1 hour

**Description:**
Page action buttons (Add Bill, Add Asset) appear abruptly after login, causing layout shift. Should fade in smoothly like auth buttons.

**Acceptance Criteria:**
- [ ] Pre-render with `opacity: 0`
- [ ] Fade in with auth state using CSS transition
- [ ] Match auth button fade-in timing (150ms)

**Files to Modify:**
- `app/bills.html`
- `app/assets.html`
- `app/assets/css/main.css` (update `.initially-hidden` class)

---

### Task #10: Extract Duplicate Page Header to Component
**Type:** Technical Debt
**Priority:** 3 (Low)
**Tags:** Code Quality, DRY Principle
**Effort:** 3 hours

**Description:**
Identical auth state markup repeated on every page (~60 lines each). Extract to shared component.

**Acceptance Criteria:**
- [ ] Create JavaScript template for page header
- [ ] Inject dynamically on page load
- [ ] Reduce HTML duplication across pages
- [ ] Maintain current functionality

**Files to Modify:**
- Create new `app/assets/js/page-header.js`
- Update all .html pages to use component

---

## SUMMARY

**Total Tasks:** 10
- **High Priority:** 3 tasks (7 hours)
- **Medium Priority:** 5 tasks (13 hours)
- **Low Priority:** 2 tasks (4 hours)

**Total Effort:** 24 hours (~3 sprint days)

**Recommended Sprint Assignment:**
- Sprint 1 (Current): High priority tasks (#1, #2, #3)
- Sprint 2 (Next): Medium priority tasks (#4-#8)
- Sprint 3 (Future): Low priority tasks (#9-#10)

---

## IMPORT INSTRUCTIONS

To import these work items into Azure DevOps:

1. Navigate to: https://dev.azure.com/fireside365/Fireside%20Capital/_backlogs/backlog/Fireside%20Capital%20Team/Backlog%20items
2. Click "New Work Item" → "Task"
3. Copy title, description, tags, and priority from each task above
4. Assign to appropriate sprint
5. Link to parent User Story: "UI/UX Audit - February 2026"

Or use Azure DevOps REST API with PAT authentication:
```powershell
$pat = $env:AZURE_DEVOPS_PAT
# See Azure DevOps API documentation for batch import
```
