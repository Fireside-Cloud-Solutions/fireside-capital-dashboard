# CSS Architecture Implementation Tasks
**Project:** Fireside Capital Dashboard  
**Epic:** CSS Architecture Modernization  
**Created:** February 14, 2026  
**Priority:** High  

---

## Tasks for Azure DevOps

### Epic: CSS Architecture Modernization
**Description:** Migrate Fireside Capital dashboard CSS to BEM methodology with SMACSS file organization for improved maintainability and scalability.  
**Priority:** High  
**Estimated Duration:** 5 weeks  
**Tags:** `research`, `css`, `architecture`, `technical-debt`

---

### Phase 1: Core Component Migration (Week 1)

#### Task 1.1: Convert Metric Cards to BEM
**Description:**
Refactor dashboard metric cards (Total Assets, Total Debts, Net Worth) to use BEM naming convention.

**Acceptance Criteria:**
- [ ] Create `3-components/metric-card.css` with BEM classes
- [ ] Update `index.html` to use `.metric-card`, `.metric-card__header`, `.metric-card__title`, `.metric-card__value` classes
- [ ] Implement modifiers: `--primary`, `--success`, `--danger`, `--compact`
- [ ] Remove legacy card CSS from `main.css`
- [ ] Visual regression test passes (screenshot comparison)
- [ ] Works on mobile, tablet, desktop

**Files Modified:**
- `app/assets/css/3-components/metric-card.css` (new)
- `app/index.html`
- `app/assets.html`
- `app/investments.html`

**Priority:** High  
**Estimated Hours:** 6  
**Tags:** `bem`, `css`, `component`, `dashboard`

---

#### Task 1.2: Convert Navigation to BEM
**Description:**
Refactor main navigation bar to use BEM naming convention.

**Acceptance Criteria:**
- [ ] Create `2-layout/main-nav.css` with BEM classes
- [ ] Update all HTML pages to use `.main-nav`, `.main-nav__link`, `.main-nav__link--active`
- [ ] Remove legacy nav CSS from `main.css`
- [ ] Active page highlighting works correctly
- [ ] Mobile responsive menu works
- [ ] Visual regression test passes

**Files Modified:**
- `app/assets/css/2-layout/main-nav.css` (new)
- All HTML pages (index.html, assets.html, bills.html, etc.)

**Priority:** High  
**Estimated Hours:** 5  
**Tags:** `bem`, `css`, `navigation`, `layout`

---

#### Task 1.3: Convert Notification System to BEM
**Description:**
Refactor notification bell and dropdown to use BEM naming convention.

**Acceptance Criteria:**
- [ ] Create `3-components/notification.css` with BEM classes
- [ ] Update HTML to use `.notification-bell`, `.notification-bell__badge`, `.notification-list`, `.notification-list__item`
- [ ] Implement modifiers: `--unread`, `--read`, `--urgent`
- [ ] Remove legacy notification CSS from `components.css`
- [ ] Bell animation works on new notifications
- [ ] Dropdown positioning correct on all screen sizes
- [ ] Visual regression test passes

**Files Modified:**
- `app/assets/css/3-components/notification.css` (new)
- `app/index.html`
- `app/assets/js/notification-manager.js`

**Priority:** Medium  
**Estimated Hours:** 4  
**Tags:** `bem`, `css`, `component`, `notification`

---

### Phase 2: File Organization (Week 2)

#### Task 2.1: Create SMACSS Folder Structure
**Description:**
Reorganize CSS files into SMACSS categories for better organization.

**Acceptance Criteria:**
- [ ] Create folder structure: `1-base/`, `2-layout/`, `3-components/`, `4-utilities/`
- [ ] Move `design-tokens.css` → `1-base/tokens.css`
- [ ] Split typography from `main.css` → `1-base/typography.css`
- [ ] Move utility classes → `4-utilities/spacing.css`, `4-utilities/colors.css`
- [ ] Update `main.css` to import all modules in correct order
- [ ] No visual changes to site (refactor only)
- [ ] All pages still load correctly

**Files Created:**
- `app/assets/css/1-base/` folder
- `app/assets/css/2-layout/` folder
- `app/assets/css/3-components/` folder
- `app/assets/css/4-utilities/` folder

**Priority:** Medium  
**Estimated Hours:** 6  
**Tags:** `smacss`, `css`, `organization`, `refactor`

---

#### Task 2.2: Extract Layout Styles
**Description:**
Extract header, sidebar, footer layout styles into separate files.

**Acceptance Criteria:**
- [ ] Create `2-layout/grid.css` (container, grid system)
- [ ] Create `2-layout/header.css` (site header layout)
- [ ] Create `2-layout/sidebar.css` (navigation sidebar)
- [ ] Create `2-layout/footer.css` (site footer if applicable)
- [ ] Remove extracted styles from `main.css`
- [ ] Import new files in `main.css`
- [ ] No visual changes to site

**Files Created:**
- `app/assets/css/2-layout/grid.css`
- `app/assets/css/2-layout/header.css`
- `app/assets/css/2-layout/sidebar.css`

**Priority:** Medium  
**Estimated Hours:** 4  
**Tags:** `smacss`, `css`, `layout`, `refactor`

---

### Phase 3: Sass Integration (Week 3)

#### Task 3.1: Set Up Sass Build Process
**Description:**
Install Sass and configure build process for BEM nesting.

**Acceptance Criteria:**
- [ ] Install Sass: `npm install --save-dev sass`
- [ ] Add scripts to `package.json`: `css:build`, `css:watch`, `css:dev`
- [ ] Convert `main.css` → `main.scss`
- [ ] Convert component files to `.scss` format
- [ ] Test build process generates correct CSS
- [ ] Update `.gitignore` to exclude compiled CSS (keep source SCSS)
- [ ] Document build process in README

**Files Modified:**
- `package.json`
- `.gitignore`
- `README.md`

**Priority:** Medium  
**Estimated Hours:** 3  
**Tags:** `sass`, `build`, `tooling`, `setup`

---

#### Task 3.2: Convert Components to Sass with BEM Nesting
**Description:**
Refactor BEM components to use Sass `&` nesting for cleaner code.

**Acceptance Criteria:**
- [ ] Convert `.metric-card` classes to nested Sass
- [ ] Convert `.main-nav` classes to nested Sass
- [ ] Convert `.notification` classes to nested Sass
- [ ] Compiled CSS output matches previous CSS exactly
- [ ] No visual changes to site
- [ ] Build process runs without errors

**Example:**
```scss
.metric-card {
  &__title { }
  &__value { }
  &--primary { }
}
```

**Files Modified:**
- `app/assets/css/3-components/*.scss`

**Priority:** Low  
**Estimated Hours:** 4  
**Tags:** `sass`, `bem`, `refactor`

---

### Phase 4: Form & Table Migration (Week 4)

#### Task 4.1: Convert Forms to BEM
**Description:**
Refactor all forms (Add Asset, Add Bill, Add Debt, etc.) to use BEM naming.

**Acceptance Criteria:**
- [ ] Create `3-components/asset-form.css` with BEM classes
- [ ] Create `3-components/bill-form.css` with BEM classes
- [ ] Update HTML to use `.asset-form`, `.asset-form__input`, `.asset-form__submit`
- [ ] Implement modifiers: `--primary`, `--secondary`, `--disabled`
- [ ] Remove legacy form CSS
- [ ] All form validation still works
- [ ] Mobile keyboard input works correctly
- [ ] Visual regression test passes

**Files Modified:**
- `app/assets/css/3-components/asset-form.css` (new)
- `app/assets/css/3-components/bill-form.css` (new)
- `app/assets.html`
- `app/bills.html`
- `app/debts.html`

**Priority:** Medium  
**Estimated Hours:** 6  
**Tags:** `bem`, `css`, `forms`, `component`

---

#### Task 4.2: Convert Tables to BEM
**Description:**
Refactor data tables (Assets, Bills, Transactions) to use BEM naming.

**Acceptance Criteria:**
- [ ] Create `3-components/data-table.css` with BEM classes
- [ ] Update HTML to use `.data-table`, `.data-table__header`, `.data-table__row`, `.data-table__cell`
- [ ] Implement modifiers: `--striped`, `--hoverable`, `--compact`
- [ ] Remove legacy table CSS
- [ ] Sorting functionality still works
- [ ] Mobile responsive table works
- [ ] Visual regression test passes

**Files Modified:**
- `app/assets/css/3-components/data-table.css` (new)
- `app/assets.html`
- `app/bills.html`
- `app/transactions.html`

**Priority:** Medium  
**Estimated Hours:** 5  
**Tags:** `bem`, `css`, `tables`, `component`

---

### Phase 5: Button System (Week 4)

#### Task 5.1: Create Unified Button Component
**Description:**
Create a single, reusable button component with all variants in BEM.

**Acceptance Criteria:**
- [ ] Create `3-components/button.css` with BEM classes
- [ ] Base class: `.button`
- [ ] Implement variants: `--primary`, `--secondary`, `--danger`, `--success`, `--outline`
- [ ] Implement sizes: `--small`, `--medium` (default), `--large`
- [ ] Implement states: `--disabled`, `--loading`
- [ ] Update all HTML pages to use new button classes
- [ ] Remove Bootstrap button classes where possible
- [ ] WCAG 2.5.5 compliance (44px minimum touch target)
- [ ] Hover/focus states work correctly
- [ ] Visual regression test passes

**Files Modified:**
- `app/assets/css/3-components/button.css` (new)
- All HTML pages

**Priority:** Medium  
**Estimated Hours:** 5  
**Tags:** `bem`, `css`, `buttons`, `component`, `wcag`

---

### Phase 6: Documentation & Cleanup (Week 5)

#### Task 6.1: Write Internal BEM Style Guide
**Description:**
Create comprehensive documentation for the BEM/SMACSS architecture.

**Acceptance Criteria:**
- [ ] Create `docs/css-style-guide.md`
- [ ] Document BEM naming rules with examples
- [ ] Document SMACSS folder organization
- [ ] Include "Do's and Don'ts" section
- [ ] Add code snippets for common patterns
- [ ] Include Sass nesting examples
- [ ] Link to external BEM resources
- [ ] Add to onboarding documentation

**Files Created:**
- `docs/css-style-guide.md`

**Priority:** Medium  
**Estimated Hours:** 4  
**Tags:** `documentation`, `style-guide`, `onboarding`

---

#### Task 6.2: Remove Legacy CSS
**Description:**
Remove old, unused CSS classes and files after migration is complete.

**Acceptance Criteria:**
- [ ] Audit all CSS files for unused classes
- [ ] Remove duplicate styles
- [ ] Remove `!important` flags where no longer needed
- [ ] Delete legacy files: `components.css`, old `main.css`
- [ ] Run PurgeCSS to identify truly unused styles
- [ ] Final file size check (target: <150 KB uncompressed)
- [ ] Full site regression test (all pages, all devices)
- [ ] No console errors
- [ ] Performance test shows improvement

**Files Deleted:**
- `app/assets/css-backup/` (keep for 1 week, then delete)
- Legacy CSS files

**Priority:** Low  
**Estimated Hours:** 4  
**Tags:** `cleanup`, `optimization`, `technical-debt`

---

#### Task 6.3: Set Up CSS Linting
**Description:**
Add Stylelint with BEM rules to enforce naming conventions.

**Acceptance Criteria:**
- [ ] Install Stylelint: `npm install --save-dev stylelint stylelint-config-standard`
- [ ] Create `.stylelintrc.json` with BEM rules
- [ ] Add linting script to `package.json`: `npm run lint:css`
- [ ] Fix all linting errors
- [ ] Add pre-commit hook (optional)
- [ ] Add to CI/CD pipeline (Azure DevOps)
- [ ] Document linting process in README

**Files Created:**
- `.stylelintrc.json`
- `package.json` (updated)

**Priority:** Low  
**Estimated Hours:** 3  
**Tags:** `tooling`, `linting`, `quality`, `ci-cd`

---

## Summary

**Total Tasks:** 13  
**Estimated Total Hours:** 58 hours (~2 weeks for 1 developer)  
**Priority Breakdown:**
- High: 3 tasks (15 hours)
- Medium: 8 tasks (38 hours)
- Low: 2 tasks (5 hours)

**Dependencies:**
- Phase 2 depends on Phase 1 completion
- Phase 3 depends on Phase 2 completion
- Phase 5 can run parallel to Phase 4
- Phase 6 must be last

**Risk Mitigation:**
- Visual regression testing after each component conversion
- Maintain legacy CSS alongside BEM during migration
- One component at a time (fail-safe rollback)
- Full backup before starting Phase 1

---

**Next Action:** Import these tasks into Azure DevOps (org: fireside365, project: Fireside Capital) with tag `research-implementation`.
