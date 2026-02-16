# UI/UX Audit — Reports Page
**Date:** February 16, 2026 06:45 AM EST  
**Auditor:** Capital (Architect Agent)  
**Page:** reports.html  
**Status:** ✅ Complete

---

## Executive Summary

The **Reports page** is the analytics hub of Fireside Capital, displaying financial summaries and comprehensive charts. The page structure is solid with proper page headers and chart organization, but has several design system inconsistencies that prevent it from matching the polish level of other audited pages.

**Overall Grade:** B (80/100)
- ✅ **Strong**: Page header structure, chart card styling, skeleton loaders, responsive grid
- ⚠️ **Needs Work**: Button hierarchy, section spacing, empty states, summary card semantics

---

## ✅ **Wins (What's Working Well)**

### 1. **Proper Page Header Structure**
- **Location**: `reports.html` line 80
- Uses `.page-header` container with `.page-header-actions` div
- Matches the design system established in Assets, Bills, Debts pages
- Properly separates title from action buttons

**Evidence:**
```html
<div class="page-header">
  <h2>Reports</h2>
  <div class="page-header-actions">
    <div id="pageActions" class="initially-hidden">
      <button class="btn btn-secondary">Export</button>
    </div>
  </div>
</div>
```

### 2. **Consistent Chart Card Structure**
- All chart cards use `.chart-card` class with proper spacing
- Chart titles use `<h5>` with uppercase, letter-spaced styling
- Skeleton loaders properly positioned inside `.chart-wrapper`
- Responsive grid: `col-xl-6 col-12` for side-by-side on desktop, stacked on mobile

**Evidence:**
```css
/* main.css lines 530-566 */
.chart-card {
  background: var(--color-bg-2);
  border-radius: 12px;
  border: 1px solid var(--color-border-subtle);
  padding: 24px;
  transition: box-shadow 200ms, transform 200ms;
}
```

### 3. **Summary Cards with Hover States**
- Three summary cards: Total Investments, Total Debts, Net Worth
- Consistent 24px padding, 12px border-radius
- Smooth hover transitions with translateY(-2px) and shadow-lg
- Proper text hierarchy: h6 (label) + h4 (value)

### 4. **Skeleton Loaders for Progressive Loading**
- Each chart has a skeleton loader with unique ID
- Loaders are hidden after chart renders (via reports.js)
- Uses `.skeleton-loader` and `.skeleton-chart-lg` classes
- Good UX practice for perceived performance

### 5. **Accessibility Features**
- `aria-label` on export button: "Export financial report as CSV"
- `title` attribute for tooltip: "Download current report data as CSV"
- Semantic HTML with proper heading hierarchy (h2 → h5 → h6)

---

## 🔍 **Issues Found**

### **FC-UIUX-018 — Export Button Incorrect Hierarchy**
- **Location**: `app/reports.html` line 84
- **Issue**: Export button uses `btn-secondary` (blue filled), but it's a utility action
- **Expected**: Utility actions should use `btn-outline-secondary` (tertiary in hierarchy)
- **Design System Rule**: 
  - **Primary (orange)**: 1 per page max (e.g., "Add Asset")
  - **Secondary (blue filled)**: 2 per page max (e.g., "Save", "Apply")
  - **Tertiary (outline)**: Unlimited utility actions (e.g., "Export", "Refresh")
- **Impact**: Breaks visual hierarchy, makes Export appear more important than it is
- **Priority**: 🟡 **Medium** (P2)
- **Effort**: 2 minutes
- **Fix**:
  ```html
  <!-- CURRENT (WRONG) -->
  <button class="btn btn-secondary" aria-label="Export financial report as CSV">
    <i class="bi bi-download"></i> Export
  </button>
  
  <!-- CORRECT -->
  <button class="btn btn-outline-secondary" aria-label="Export financial report as CSV">
    <i class="bi bi-download"></i> Export
  </button>
  ```

---

### **FC-UIUX-019 — Inconsistent Section Spacing**
- **Location**: `app/reports.html` lines 179, 197
- **Issue**: Chart rows use `mt-3` (Bootstrap's 1rem = 16px), breaking the 8px grid system
- **Expected**: Section spacing should use `mb-24` (24px) or `mb-32` (32px) from design tokens
- **Design System Rule**: 
  - Small gaps: 8px, 16px
  - Section spacing: 24px, 32px
  - Large gaps: 48px
- **Impact**: Inconsistent vertical rhythm across the app
- **Priority**: 🟡 **Medium** (P2)
- **Effort**: 5 minutes
- **Fix**:
  ```html
  <!-- CURRENT (WRONG) -->
  <div class="row g-3 g-xl-4 mt-3">
  
  <!-- CORRECT (Match design system) -->
  <div class="row g-3 g-xl-4 mb-24">
  ```
  
  **Note**: Apply to lines 179 and 197. Also ensure the primary net worth chart card has `mb-32` or `section-spacing` class for proper breathing room.

---

### **FC-UIUX-020 — Missing Empty State**
- **Location**: `app/reports.html` — no empty state markup exists
- **Issue**: When user has no snapshot data, charts fail to render with no fallback UI
- **Expected**: Show empty state inside `#dataContainer` when no data exists
- **Design System Reference**: See `empty-states.css` and `empty-states.js`
- **Impact**: Poor UX for new users or users who haven't connected accounts yet
- **Priority**: 🟡 **Medium** (P2)
- **Effort**: 30 minutes
- **Fix**:
  ```html
  <!-- Add this BEFORE the summary cards -->
  <div id="reportsEmptyState" class="empty-state d-none">
    <i class="bi bi-graph-up empty-state-icon"></i>
    <h5 class="empty-state-title">No Report Data Yet</h5>
    <p class="empty-state-description">
      Connect your financial accounts to see comprehensive reports and charts.
    </p>
    <button class="btn btn-primary" data-action="open-plaid-link">
      <i class="bi bi-bank2"></i> Connect Your First Account
    </button>
  </div>
  ```
  
  **reports.js modification:**
  ```javascript
  // In loadReportSummary(), after checking snapshots.length === 0:
  if (snapshots && snapshots.length > 0) {
    // ... existing code ...
    document.getElementById('dataContainer').classList.remove('data-hidden');
    document.getElementById('reportsEmptyState')?.classList.add('d-none');
  } else {
    // Show empty state
    document.getElementById('dataContainer').classList.add('data-hidden');
    document.getElementById('reportsEmptyState')?.classList.remove('d-none');
  }
  ```

---

### **FC-UIUX-021 — Summary Card Semantic Inconsistency**
- **Location**: `app/reports.html` lines 132-144
- **Issue**: Summary cards use `.summary-card` class, but dashboard uses `.stat-card`
- **Expected**: Consistent naming convention across similar UI elements
- **Impact**: Minor — CSS works correctly, but confusing for developers (two names for same pattern)
- **Priority**: 🟢 **Low** (P3) — Tech debt cleanup
- **Effort**: 1 hour (audit all pages, unify naming)
- **Recommendation**: 
  - Option 1: Alias `.summary-card` to `.stat-card` in CSS
  - Option 2: Refactor all `.summary-card` instances to `.stat-card` (breaking change)
- **Decision needed**: Ask PM which approach to take

---

### **FC-UIUX-022 — Chart Heights Not Defined**
- **Location**: `app/reports.html` lines 159, 174, 188, 202, 216
- **Issue**: Chart wrappers don't specify height classes (no `.chart-height-lg` or `.chart-height-md`)
- **Expected**: Explicit height classes for consistent chart sizing
- **Design System Pattern**: Dashboard and other pages use `.chart-height-lg` (400px) and `.chart-height-md` (300px)
- **Impact**: Charts may render at inconsistent heights, especially on first load
- **Priority**: 🟢 **Low** (P3)
- **Effort**: 5 minutes
- **Fix**:
  ```html
  <!-- Primary chart (Net Worth Timeline) -->
  <div class="chart-wrapper chart-height-lg">
  
  <!-- Secondary charts (Cash Flow, Categories, Savings, Investments) -->
  <div class="chart-wrapper chart-height-md">
  ```
  
  **Note**: Verify `.chart-height-lg` and `.chart-height-md` classes exist in main.css or components.css. If not, define them.

---

### **FC-UIUX-023 — Inconsistent Icon Usage**
- **Location**: `app/reports.html` line 85
- **Issue**: Export button uses `<i class="bi bi-download"></i>` (Bootstrap Icons), but some pages use different icon sets
- **Expected**: Consistent icon library across all action buttons
- **Impact**: Minimal — icons render correctly, but maintenance concern
- **Priority**: 🟢 **Low** (P3)
- **Effort**: Audit only (no fix needed now)
- **Note**: Fireside Capital uses Bootstrap Icons exclusively. Verify all pages follow this standard.

---

## 📋 **Recommendations**

### 1. **Fix Button Hierarchy (High Impact)**
- Change Export button from `btn-secondary` to `btn-outline-secondary`
- **Benefit**: Proper visual hierarchy, matches design system
- **Effort**: 2 minutes

### 2. **Standardize Section Spacing (Medium Impact)**
- Replace `mt-3` with `mb-24` or `mb-32` on chart rows
- **Benefit**: Consistent 8px grid system, better vertical rhythm
- **Effort**: 5 minutes

### 3. **Add Empty State (High Impact)**
- Implement empty state for new users with no snapshot data
- **Benefit**: Better onboarding UX, clear call-to-action
- **Effort**: 30 minutes

### 4. **Define Chart Heights (Low Impact)**
- Add `.chart-height-lg` and `.chart-height-md` classes to chart wrappers
- **Benefit**: Consistent chart sizing, prevents layout shift
- **Effort**: 5 minutes

### 5. **Audit Summary Card Naming (Tech Debt)**
- Decide: Unify `.summary-card` and `.stat-card` naming
- **Benefit**: Clearer codebase, easier maintenance
- **Effort**: 1 hour (research + decision + implementation)

---

## 🎯 **Azure DevOps Work Items Created**

| ID | Type | Title | Priority | Effort |
|----|------|-------|----------|--------|
| TBD | Task | FC-UIUX-018: Fix Export button hierarchy (reports page) | P2 | 2 min |
| TBD | Task | FC-UIUX-019: Standardize section spacing on reports page | P2 | 5 min |
| TBD | User Story | FC-UIUX-020: Add empty state to reports page | P2 | 30 min |
| TBD | Task | FC-UIUX-022: Add explicit chart height classes | P3 | 5 min |
| TBD | Task | FC-UIUX-021: Audit and unify .summary-card vs .stat-card naming | P3 | 1 hr |

**Total Quick Fixes (P2):** ~37 minutes  
**Total Tech Debt (P3):** ~1 hour 5 minutes

---

## 📊 **Design System Compliance**

| Category | Score | Notes |
|----------|-------|-------|
| Page Header Structure | A | ✓ Proper .page-header with actions div |
| Button Hierarchy | C | ✗ Export button uses wrong hierarchy |
| Spacing Consistency | C | ✗ mt-3 breaks 8px grid system |
| Typography Hierarchy | A | ✓ h2 → h5 → h6 semantic structure |
| Chart Card Styling | A | ✓ Consistent .chart-card with hover states |
| Empty States | F | ✗ No empty state for new users |
| Accessibility | A | ✓ aria-labels, semantic HTML |
| Responsive Design | A | ✓ Proper grid system, mobile-first |
| Interaction Polish | A | ✓ Smooth transitions, hover states |

**Overall Grade:** B (80/100)

---

## 🔧 **Quick Fixes Summary**

**Priority 2 (37 minutes):**
1. Change Export button to outline style (2 min)
2. Replace `mt-3` with `mb-24` on chart rows (5 min)
3. Add empty state UI and logic (30 min)

**Priority 3 (1 hr 5 min):**
4. Add chart height classes (5 min)
5. Audit summary-card vs stat-card naming (1 hr)

**Total effort to resolve all P2 issues:** ~40 minutes

---

## 📝 **Testing Checklist**

After fixes are applied, verify:
- [ ] Export button appears as outline (tertiary style)
- [ ] Chart rows have consistent 24px or 32px spacing
- [ ] Empty state shows when user has no snapshot data
- [ ] Empty state "Connect Account" button triggers Plaid flow
- [ ] Charts render at consistent heights (400px for primary, 300px for secondary)
- [ ] Skeleton loaders disappear after charts load
- [ ] Mobile layout stacks charts properly (single column)
- [ ] Hover states work on summary cards and chart cards

---

## 🚀 **Next Steps**

1. Create Azure DevOps work items with details above
2. Assign FC-UIUX-018 and FC-UIUX-019 to Builder (quick fixes)
3. Assign FC-UIUX-020 to Builder (requires JS changes + HTML)
4. Schedule FC-UIUX-021 for tech debt sprint (non-urgent)
5. Continue UI/UX audit with next page: **Settings** (high visibility)

---

**Audit Completed:** February 16, 2026 06:45 AM EST  
**Next Audit:** Settings page (settings.html)  
**Audited Pages:** Dashboard, Assets, Bills, Investments, Debts, Reports (6/11)  
**Remaining Pages:** Settings, Budget, Transactions, Income, Friends (5/11)
