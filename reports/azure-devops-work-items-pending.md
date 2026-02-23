# Azure DevOps Work Items — UI/UX Audit Findings

**Project:** Fireside Capital  
**Organization:** fireside365  
**Area Path:** Fireside Capital\Dashboard  
**Iteration:** Current Sprint  
**Created By:** Architect (Capital AI)  
**Date:** February 23, 2026

---

## User Story 1: Screen Reader Navigation Improvements

**Type:** User Story  
**Title:** As a screen reader user, I want proper heading structure so I can navigate the dashboard efficiently  
**Priority:** 1 (High)  
**Story Points:** 5  
**Area Path:** Fireside Capital\Dashboard  
**Tags:** accessibility, wcag, a11y, design

### Description
Screen reader users currently cannot navigate the dashboard efficiently because:
- Stat cards lack semantic heading markup
- Chart titles use incorrect heading levels (h5 instead of h2/h3)
- Financial values lack ARIA labels for proper currency announcement
- Live regions missing for dynamic value updates

This fails WCAG 2.1 Level A criteria 1.3.1 (Info and Relationships) and 2.4.6 (Headings and Labels).

### Acceptance Criteria
- [ ] All stat card labels use semantic `<h2>` elements
- [ ] Chart card titles use proper `<h2>` heading hierarchy
- [ ] Stat values have `role="status"` and `aria-live="polite"`
- [ ] Currency values formatted for screen reader announcement (e.g., "250,430 dollars and 50 cents")
- [ ] Trend indicators include text alternatives ("Increased by 5.2%")
- [ ] Lighthouse accessibility score ≥ 90
- [ ] Passes NVDA and VoiceOver testing

### Tasks

#### Task 1.1: Update Typography Hierarchy
**Type:** Task  
**Title:** Refactor stat cards and chart cards to use semantic HTML headings  
**Assigned To:** Builder  
**Effort:** 2 hours  
**Priority:** 1

**Description:**
Update `index.html` and CSS to replace plain spans with semantic headings while maintaining visual appearance.

**Code Changes:**
- File: `app/index.html` lines 423-534
- File: `app/assets/css/main.css` (add `.stat-card h2` styles)
- Pattern: `<span class="stat-label">` → `<h2 class="stat-label">`

**Test:**
- Visual regression: Stat cards look identical before/after
- NVDA: Can navigate by heading (H key)
- Lighthouse: Heading order passes

---

#### Task 1.2: Add ARIA Labels to Financial Values
**Type:** Task  
**Title:** Implement ARIA live regions and currency formatting for stat card values  
**Assigned To:** Builder  
**Effort:** 4 hours  
**Priority:** 1

**Description:**
Add proper ARIA attributes and screen reader-friendly currency formatting to all stat card values.

**Code Changes:**
- File: `app/assets/js/charts.js` (update `updateStatCard()` function)
- File: `app/index.html` (add ARIA attributes to stat-value divs)
- Add `formatCurrencyForScreenReader()` utility function

**Test:**
- NVDA announces "Current value: 250,430 dollars and 50 cents" (not "dollar two five zero...")
- Value updates announce automatically (aria-live)
- VoiceOver on iOS behaves identically

---

## User Story 2: Mobile Notification Dropdown Fix

**Type:** User Story  
**Title:** As a mobile user, I want the notification dropdown to fit my screen so I can read all notifications  
**Priority:** 1 (High)  
**Story Points:** 2  
**Area Path:** Fireside Capital\Dashboard  
**Tags:** mobile, ux, responsive, bug

### Description
The notification dropdown has a fixed 550px width that causes horizontal scrolling on mobile devices (iPhone SE, Galaxy Fold). The "Mark all read" button becomes inaccessible.

### Acceptance Criteria
- [ ] Dropdown width adapts to screen size on devices < 600px wide
- [ ] No horizontal scrolling on iPhone SE (375px)
- [ ] No horizontal scrolling on Galaxy Fold (280px)
- [ ] Dropdown aligns to right edge of screen
- [ ] All interactive elements remain accessible (no overflow)
- [ ] Tested on iOS Safari, Chrome Android, Samsung Internet

### Tasks

#### Task 2.1: Fix Notification Dropdown Width
**Type:** Task  
**Title:** Implement responsive width for notification dropdown  
**Assigned To:** Builder  
**Effort:** 1 hour  
**Priority:** 1

**Description:**
Update CSS to use `min()` function for responsive width instead of fixed `550px`.

**Code Changes:**
- File: `app/assets/css/components.css` line ~78
- Change: `width: 550px` → `width: min(550px, calc(100vw - 32px))`
- Add mobile-specific media query for < 600px screens

**Test:**
- iPhone SE (375px): Dropdown fits screen, no scroll
- Galaxy Fold (280px): Dropdown fits screen, no scroll
- iPad (768px): Dropdown maintains 550px width
- Desktop (1920px): No visual change

---

## User Story 3: Theme Persistence Improvement

**Type:** User Story  
**Title:** As a user, I want my theme preference saved immediately so I don't lose it if my browser crashes  
**Priority:** 2 (Medium)  
**Story Points:** 1  
**Area Path:** Fireside Capital\Dashboard  
**Tags:** ux, persistence, accessibility

### Description
Currently, theme preference only saves on `window.beforeunload`, which means:
- Browser crashes lose the preference
- Mobile app terminations don't save (iOS/Android often don't fire `beforeunload`)
- Users frustrated by repeated theme changes

### Acceptance Criteria
- [ ] Theme saves immediately when toggle is changed
- [ ] Theme persists after forced browser close (kill process)
- [ ] Mobile app terminations preserve theme
- [ ] Error handling if localStorage fails (Safari private mode)
- [ ] Toast notification confirms save (optional UX enhancement)

### Tasks

#### Task 3.1: Implement Immediate Theme Persistence
**Type:** Task  
**Title:** Save theme to localStorage immediately on toggle change  
**Assigned To:** Builder  
**Effort:** 30 minutes  
**Priority:** 2

**Description:**
Move `localStorage.setItem('theme', value)` from `beforeunload` handler to toggle change handler.

**Code Changes:**
- File: `app/assets/js/app.js` (theme toggle handler)
- Add: `localStorage.setItem('theme', newTheme)` inside change event
- Remove: `beforeunload` theme save handler
- Add: Error handling for localStorage quota exceeded

**Test:**
1. Toggle theme, kill browser process immediately → Theme persists
2. Toggle theme on iOS, terminate app → Theme persists
3. Toggle theme in Safari private mode → Gracefully handles error

---

## User Story 4: Empty State Components

**Type:** User Story  
**Title:** As a new user, I want clear empty states so I know what actions to take  
**Priority:** 2 (Medium)  
**Story Points:** 8  
**Area Path:** Fireside Capital\Dashboard  
**Tags:** ux, onboarding, design

### Description
When sections have no data (subscriptions, upcoming payments, assets, etc.), only a loading spinner shows indefinitely. Users can't tell if:
- The app is broken
- Data is loading
- They need to add data manually

This causes support tickets and abandoned flows.

### Acceptance Criteria
- [ ] Empty states show illustration + message + CTA
- [ ] Consistent design across all pages (dashboard, assets, bills, debts, income, investments)
- [ ] Loading spinner replaced with proper empty state after 2 seconds
- [ ] CTA button links to appropriate "Add" page/modal
- [ ] Responsive layout (stacks on mobile)
- [ ] Matches Fireside brand design (icons, colors, spacing)

### Tasks

#### Task 4.1: Design Empty State Component
**Type:** Task  
**Title:** Create reusable empty state component (HTML + CSS)  
**Assigned To:** Architect  
**Effort:** 2 hours  
**Priority:** 2

**Description:**
Design and document a reusable empty state component that matches Fireside brand.

**Deliverables:**
- File: `app/assets/css/components.css` (add `.empty-state` styles)
- File: `docs/empty-state-pattern.md` (usage documentation)
- Pattern includes: icon, title, description, CTA button
- Variants: subscriptions, assets, bills, debts, income, transactions

---

#### Task 4.2: Implement Empty States on Dashboard
**Type:** Task  
**Title:** Replace loading spinners with empty states in subscriptions and upcoming widgets  
**Assigned To:** Builder  
**Effort:** 2 hours  
**Priority:** 2

**Description:**
Update `subscriptions.js` and dashboard to show proper empty states when no data exists.

**Code Changes:**
- File: `app/assets/js/subscriptions.js` (update render function)
- File: `app/index.html` (replace loading spinners)
- Add: 2-second timeout before showing empty state (prevents flash)

**Test:**
- New user with no data sees empty state immediately
- Empty state CTA links to bills.html?type=subscription
- Loading → Empty state transition is smooth (no flash)

---

#### Task 4.3: Implement Empty States Across All Pages
**Type:** Task  
**Title:** Add empty state components to assets, bills, debts, income, investments pages  
**Assigned To:** Builder  
**Effort:** 4 hours  
**Priority:** 3

**Description:**
Extend empty state pattern to all data tables and lists across the app.

**Pages:**
- assets.html
- bills.html
- debts.html
- income.html
- investments.html
- transactions.html

**Test:**
- Each page shows appropriate empty state when no data
- Empty state messages are contextual ("No assets yet" vs "No bills yet")
- CTAs link to correct add/import actions

---

## User Story 5: Form Validation Visual Feedback

**Type:** User Story  
**Title:** As a user, I want inline form validation so I know which fields are invalid  
**Priority:** 2 (Medium)  
**Story Points:** 8  
**Area Path:** Fireside Capital\Forms  
**Tags:** ux, accessibility, wcag, forms

### Description
Currently, form validation only shows an alert banner at the top. Users don't know which specific field is invalid, causing:
- Confusion ("What's wrong?")
- Re-entering all fields unnecessarily
- WCAG 2.1 Level A failure (3.3.1 Error Identification)
- Mobile users can't see alert when it scrolls off-screen

### Acceptance Criteria
- [ ] Invalid fields show red border (Bootstrap `.is-invalid`)
- [ ] Error message appears below invalid field
- [ ] ARIA attributes update (`aria-invalid="true"`, `aria-describedby`)
- [ ] Screen readers announce field-specific errors
- [ ] Validation runs on blur (not just submit)
- [ ] Passes WCAG 2.1 Level AA (3.3.1, 3.3.3)

### Tasks

#### Task 5.1: Create Validation Utility Functions
**Type:** Task  
**Title:** Build reusable form validation helpers with ARIA support  
**Assigned To:** Builder  
**Effort:** 2 hours  
**Priority:** 2

**Description:**
Create utility functions for common validation patterns (email, password, required fields).

**Deliverables:**
- File: `app/assets/js/form-validation.js`
- Functions: `validateEmail()`, `validatePassword()`, `validateRequired()`, `showFieldError()`, `clearFieldError()`
- Each function handles visual feedback + ARIA attributes

---

#### Task 5.2: Apply Validation to Login/Signup Modals
**Type:** Task  
**Title:** Implement inline validation on login and signup forms  
**Assigned To:** Builder  
**Effort:** 2 hours  
**Priority:** 2

**Code Changes:**
- File: `app/index.html` (add `.invalid-feedback` divs)
- File: `app/assets/js/app.js` (update form handlers)
- Add: Blur event listeners for real-time validation

**Test:**
- Enter invalid email → Red border, error text appears
- Screen reader announces "Email address invalid. Please enter a valid email."
- Fix email → Border turns green, error disappears

---

#### Task 5.3: Apply Validation to Data Entry Forms
**Type:** Task  
**Title:** Add inline validation to assets, bills, debts, income forms  
**Assigned To:** Builder  
**Effort:** 4 hours  
**Priority:** 3

**Pages:**
- assets.html (Add Asset form)
- bills.html (Add Bill form)
- debts.html (Add Debt form)
- income.html (Add Income form)
- investments.html (Add Investment form)

---

## Bug: Mobile Touch Targets Below 44px

**Type:** Bug  
**Title:** Sidebar links and icon buttons below WCAG 2.5.5 minimum touch target size  
**Priority:** 3 (Low)  
**Severity:** Medium  
**Area Path:** Fireside Capital\Dashboard  
**Tags:** accessibility, wcag, mobile

### Description
Sidebar navigation links and icon-only buttons (notification bell, user dropdown) have 40px touch targets. WCAG 2.5.5 Level AAA requires 44px minimum.

**Impact:**
- Motor impairment users struggle with precision
- Mobile users on bumpy surfaces have mis-taps
- Fails WCAG 2.5.5 Level AAA

### Acceptance Criteria
- [ ] All interactive elements have min 44px height/width
- [ ] Sidebar links: 44px height
- [ ] Icon buttons: 44px × 44px
- [ ] Stat cards (if clickable): 44px min height
- [ ] Visual balance maintained (no awkward spacing)

### Steps to Reproduce
1. Open dashboard on iPhone SE
2. Tap sidebar links rapidly
3. Notice occasional mis-taps to adjacent links

### Expected Behavior
All sidebar links and buttons have 44px minimum touch target.

### Actual Behavior
Sidebar links are 40px, icon buttons are 40px.

### Fix
Update CSS:
```css
.sidebar a { min-height: 44px; padding: 14px 24px; }
.btn-icon { width: 44px; height: 44px; }
```

---

## Import Instructions (Manual)

**To create these work items in Azure DevOps:**

1. Navigate to: https://dev.azure.com/fireside365/Fireside%20Capital/_workitems
2. Click "+ New Work Item" → "User Story"
3. Copy/paste each User Story section above
4. For each User Story, create child Tasks using the task sections
5. Assign to team members as indicated
6. Add to current sprint
7. Link related tasks to parent User Story

**Bulk Import Alternative:**

If Azure DevOps CLI is installed:
```bash
az boards work-item create \
  --title "As a screen reader user, I want proper heading structure..." \
  --type "User Story" \
  --area "Fireside Capital\Dashboard" \
  --iteration "Current Sprint" \
  --assigned-to "builder@fireside.com" \
  --priority 1 \
  --story-points 5 \
  --description "$(cat user-story-1-description.txt)"
```

---

**Status:** Ready for Import  
**Total User Stories:** 5  
**Total Tasks:** 11  
**Total Bugs:** 1  
**Estimated Effort:** 35 hours  
**Sprint:** Current + Next
