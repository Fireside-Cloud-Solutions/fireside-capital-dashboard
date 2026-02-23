# CSS Architecture Implementation Tasks

## Overview
These tasks implement the CSS architecture research findings from `reports/css-architecture-research.md`.

**Epic:** Modernize CSS Architecture  
**Priority:** Medium  
**Total Estimated Effort:** 15 hours  

---

## Task 1: Build CSS Globals Directory Structure
**Priority:** High  
**Effort:** 30 minutes  
**Dependencies:** None  

### Description
Create the foundational directory structure for CSS globals (design tokens, utilities, resets).

### Acceptance Criteria
- [ ] Create `app/assets/css/globals/` directory
- [ ] Create placeholder files:
  - `_tokens.css`
  - `_utilities.css`
  - `_reset.css`
  - `_text-component.css`
  - `_grid.css`
- [ ] Update `app/assets/css/style.css` to import globals
- [ ] Verify build process includes new files

### Files to Modify
- `app/assets/css/style.css`

### Files to Create
- `app/assets/css/globals/_tokens.css`
- `app/assets/css/globals/_utilities.css`
- `app/assets/css/globals/_reset.css`
- `app/assets/css/globals/_text-component.css`
- `app/assets/css/globals/_grid.css`

---

## Task 2: Create Design Token System
**Priority:** High  
**Effort:** 2 hours  
**Dependencies:** Task 1  

### Description
Build the CSS custom property system for spacing, typography, and colors using Fireside brand guidelines.

### Acceptance Criteria
- [ ] Define spacing scale (xs, sm, md, lg, xl)
- [ ] Define typography scale with modular ratio
- [ ] Define color tokens (primary, secondary, success, danger, warning)
- [ ] Define contrast levels for text (higher, high, medium, low)
- [ ] Add responsive scaling at 64rem breakpoint
- [ ] Add dark mode tokens using `prefers-color-scheme`
- [ ] Document token usage in comments

### Code Reference
See `reports/css-architecture-research.md` → Section 2 "CSS Globals"

### Brand Colors
- Primary: #01a4ef (blue)
- Secondary: #f44e24 (orange)
- Success: #81b900 (green)
- Danger: #dc3545 (red)
- Warning: #ffc107 (yellow)

### Files to Modify
- `app/assets/css/globals/_tokens.css`

---

## Task 3: Generate Utility Classes
**Priority:** High  
**Effort:** 1.5 hours  
**Dependencies:** Task 2  

### Description
Create single-purpose utility classes that reference design tokens for rapid component development.

### Acceptance Criteria
- [ ] Spacing utilities (padding-*, margin-*)
- [ ] Typography utilities (text-xs through text-xxl)
- [ ] Color utilities (color-*, bg-*)
- [ ] Layout utilities (flex, grid, gap-*)
- [ ] Display utilities (block, hidden, width-100)
- [ ] Financial-specific utilities (currency, amount-positive, amount-negative)
- [ ] All utilities reference tokens from `_tokens.css`

### Code Reference
See `reports/css-architecture-research.md` → Section 3 "Utility Classes"

### Files to Modify
- `app/assets/css/globals/_utilities.css`

---

## Task 4: Refactor Debt Card Component (Proof of Concept)
**Priority:** Medium  
**Effort:** 3 hours  
**Dependencies:** Task 1, Task 2, Task 3  

### Description
Refactor the debt card component on `debts.html` using the hybrid BEM + utilities approach. This serves as a proof of concept for the new architecture.

### Acceptance Criteria
- [ ] Update HTML markup to use utility classes for spacing/typography
- [ ] Create `_debt-card.css` with BEM classes for behavioral CSS only
- [ ] Use data attributes for badge variants (active, paid-off)
- [ ] Implement hover effects and progress bar animation
- [ ] Maintain visual parity with current design
- [ ] Test on mobile and desktop viewports
- [ ] Verify dark mode token compatibility

### Code Reference
See `reports/css-architecture-research.md` → Section 4 "BEM Components"

### Files to Modify
- `app/debts.html`

### Files to Create
- `app/assets/css/components/_debt-card.css`

### Testing Checklist
- [ ] Desktop (1920px): Layout correct, animations smooth
- [ ] Tablet (768px): Cards stack properly
- [ ] Mobile (375px): No horizontal scroll
- [ ] Dark mode: Colors readable
- [ ] Hover states: Smooth transitions

---

## Task 5: Create CSS Reset File
**Priority:** Low  
**Effort:** 30 minutes  
**Dependencies:** Task 1  

### Description
Implement a modern CSS reset to normalize browser defaults.

### Acceptance Criteria
- [ ] Box-sizing reset (border-box on all elements)
- [ ] Remove default margins on headings and paragraphs
- [ ] Normalize form elements
- [ ] Set sensible defaults for images (max-width: 100%, display: block)
- [ ] Reset button styles

### Files to Modify
- `app/assets/css/globals/_reset.css`

### Reference
Use modern-normalize or similar as base

---

## Task 6: Document Component Patterns
**Priority:** Low  
**Effort:** 2 hours  
**Dependencies:** Task 4  

### Description
Create a living style guide documenting the new CSS architecture patterns and reusable components.

### Acceptance Criteria
- [ ] Create `docs/css-style-guide.md`
- [ ] Document when to use BEM vs utilities
- [ ] Document all utility class categories
- [ ] Document component naming conventions
- [ ] Include code examples for common patterns
- [ ] Add anti-pattern examples (what NOT to do)

### Files to Create
- `docs/css-style-guide.md`

---

## Task 7: Refactor Remaining Pages
**Priority:** Low  
**Effort:** 6 hours  
**Dependencies:** Task 4  

### Description
Apply the new CSS architecture to all remaining dashboard pages.

### Pages to Refactor
- [ ] `dashboard.html` → Account summary cards
- [ ] `bills.html` → Bill cards with due date badges
- [ ] `investments.html` → Portfolio cards
- [ ] `assets.html` → Asset cards
- [ ] `budget.html` → Budget category cards
- [ ] `income.html` → Income source cards
- [ ] `reports.html` → Report cards

### Acceptance Criteria per Page
- [ ] Replace inline styles with utility classes
- [ ] Extract component-specific CSS to `components/` directory
- [ ] Use data attributes for variants
- [ ] Verify responsive behavior
- [ ] Test dark mode compatibility

---

## Task 8: Implement Dark Mode Toggle
**Priority:** Low  
**Effort:** 2 hours  
**Dependencies:** Task 2, Task 7  

### Description
Add a user-facing dark mode toggle that overrides system preferences.

### Acceptance Criteria
- [ ] Add toggle button in header/settings
- [ ] Store preference in localStorage
- [ ] Apply dark mode by adding `data-theme="dark"` to `<html>`
- [ ] Update CSS to check `[data-theme="dark"]` in addition to `prefers-color-scheme`
- [ ] Smooth transition between themes

### Files to Modify
- `app/assets/js/theme-toggle.js` (create)
- `app/assets/css/globals/_tokens.css`
- All page HTML files (add toggle button)

---

## Implementation Order
1. Task 1: Directory structure ✅ (Foundation)
2. Task 2: Design tokens ✅ (Foundation)
3. Task 5: CSS reset ✅ (Foundation)
4. Task 3: Utility classes ✅ (Foundation)
5. Task 4: Debt card refactor 🎯 (Proof of concept)
6. Task 6: Documentation 📚 (Knowledge transfer)
7. Task 7: Refactor remaining pages 🔄 (Scale)
8. Task 8: Dark mode toggle 🌙 (Polish)

---

## Success Metrics
- **Code Reduction:** 40-50% reduction in CSS file size
- **Consistency:** 100% of spacing values use tokens (no magic numbers)
- **Maintainability:** Average 30% faster component customization
- **Accessibility:** All color contrasts meet WCAG AA standards
- **Performance:** CSS bundle under 50KB (gzipped)

---

## Related Documents
- Research: `reports/css-architecture-research.md`
- Memory: `memory/2026-02-23-sprint-research.md`
