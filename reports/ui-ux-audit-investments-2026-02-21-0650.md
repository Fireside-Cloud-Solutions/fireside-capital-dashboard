# UI/UX Sprint Audit — Investments Page
**Date:** Saturday, February 21, 2026, 6:50 AM EST  
**Auditor:** Capital (Architect Agent)  
**Cron Job:** sprint-uiux (ad7d7355-8e6a-48fc-a006-4076a2937f6f)  
**Sprint:** UI/UX Continuous Improvement  

---

## 🎯 Audit Scope
Comprehensive review of Investments page (investments.html) for design consistency, accessibility, and UX improvements.

---

## ✅ Strengths

### 1. **Fixed: Page Actions Visibility**
**Status:** ✅ **CORRECT**  
- **Location:** Line 97 - `<div id="pageActions">` (NO `initially-hidden` class)  
- **No systemic bug:** Add Investment button visible on load  
- **Impact:** Good UX — primary action is immediately accessible  

### 2. **Empty State Implementation**
- **Location:** Lines 147-154  
- **Structure:** Icon, H3 heading, description, CTA button  
- **Icon size:** 80px (follows FC-UIUX-004 standard)  
- **Status:** ✅ Well-implemented with proper semantic hierarchy  

### 3. **Skeleton Loaders — BUT TOO FEW**
- **Location:** Lines 162-192 (3 skeleton rows)  
- **Columns:** 8 columns properly skeletonized  
- **Issue:** Only 3 rows (should be 5-7 for better perceived performance)  
- **Status:** ⚠️ Functional but suboptimal  

### 4. **Table Accessibility**
- **Caption:** Line 160 - Proper visually-hidden caption for screen readers  
  - "Investment accounts showing starting balance, contributions, returns, and current values"  
- **Semantic HTML:** Proper `<thead>`, `<tbody>` structure  
- **Status:** ✅ WCAG compliant  

### 5. **Form Required Field Indicators**
- **Location:** Lines 220, 223, 237 (modal form)  
- **Marks required fields with:** `<span class="text-danger">*</span>`  
- **Status:** ✅ Accessibility best practice (FC-049 compliant)  

### 6. **Responsive Design**
- Table wrapped in `.table-responsive` (line 159)  
- Mobile-friendly scrolling enabled  
- **Status:** ✅ Mobile optimized  

---

## ⚠️ Issues Found

### **Issue 1: Empty State Uses Inline Style (Cross-Page Pattern)**
**Location:** Line 147 - `<div id="investmentEmptyState" class="empty-state" style="display:none">`  
**Problem:** Uses inline `style="display:none"` instead of CSS class (e.g., `d-none`)  
**Cross-Page:** Same issue on Assets, Bills, Debts, Income  
**Fix:** Change to `<div id="investmentEmptyState" class="empty-state d-none">` and use JS `classList.remove('d-none')`  
**Priority:** **Low** (works, but inconsistent with Bootstrap patterns)  
**Time:** 2 minutes (per page)  
**Batch Fix:** Can be fixed across all pages in one commit  

---

### **Issue 2: Insufficient Skeleton Rows**
**Location:** Lines 162-192 (only 3 skeleton rows)  
**Problem:** Too few rows for perceived performance optimization  
**Best Practice:** Financial apps typically show 5-7 skeleton rows  
**Impact:** Short skeleton flash may feel "jumpy" on fast connections  
**Comparison:**  
  - Assets: 4 rows  
  - Transactions: 5 rows  
  - Investments: 3 rows ⚠️  
**Fix:** Add 2-3 more skeleton row blocks  
**Priority:** **Low** (UX polish)  
**Time:** 10 minutes  

---

### **Issue 3: Modal Form Spacing Inconsistency (Global)**
**Location:** Lines 217-248 (Add Investment modal form)  
**Problem:** Form labels use default `mb-3` (16px) spacing to inputs, should be tighter (mb-1 = 4px) for better visual grouping  
**Current State:**  
```html
<div class="mb-3">
  <label for="investmentName" class="form-label">Investment Name</label>
  <input type="text" class="form-control" id="investmentName">
</div>
```
- Label to input: 16px (too much — breaks visual grouping)  
- Input to next label: 16px (correct)  

**Fix:**  
```html
<div class="mb-3">
  <label for="investmentName" class="form-label mb-1">Investment Name</label>
  <input type="text" class="form-control" id="investmentName">
</div>
```

**Apply To:** ALL modal forms across all pages (global issue)  
**Priority:** **Medium** (affects UX on every form interaction)  
**Time:** 2 hours (global find/replace + testing)  

---

### **Issue 4: Eight-Column Table on Mobile**
**Location:** Table structure (lines 156-193)  
**Problem:** 8-column table will be extremely cramped on mobile devices (< 576px)  
**Columns:** Name, Type, Starting Balance, Monthly Contribution, Annual Return, Next Contribution, Current Value, Actions  
**Current:** Uses `.table-responsive` (horizontal scroll)  
**Better UX:** Add mobile card view for screens < 576px (like Transactions recommendation)  
**Priority:** **Medium** (mobile UX improvement)  
**Time:** 1-2 hours (CSS + JS for card layout)  

---

### **Issue 5: Empty State Heading Inconsistency (Cross-Page)**
**Location:** Line 149 - `<h3>No Investments Tracked</h3>`  
**Problem:** Investments uses H3 (correct), but Assets uses H5 — inconsistent hierarchy  
**Fix:** Standardize ALL empty states to H3 (already correct here)  
**Cross-Page Action:** Update Assets page to use H3 instead of H5  
**Priority:** **Low** (consistency)  
**Time:** 2 minutes per page  

---

### **Issue 6: No Mobile Form Optimization**
**Location:** Lines 210-249 (Add Investment Modal)  
**Problem:** Modal form has 7 fields — on mobile, this creates excessive scrolling  
**Best Practice:** Consider multi-step wizard for mobile (Step 1: Basic info, Step 2: Details)  
**Alternative:** Add collapsible "Advanced Options" section for optional fields  
**Priority:** **Low** (nice-to-have)  
**Time:** 3-4 hours (requires redesign)  

---

### **Issue 7: Current Value Field Placement**
**Location:** Line 237 - "Current Value" field in modal  
**Problem:** "Current Value" comes AFTER "Expected Annual Return", but logically it should be near "Starting Balance"  
**User Flow:**  
  - Starting Balance (past)  
  - Current Value (now) ← Should be here  
  - Monthly Contribution (ongoing)  
  - Expected Annual Return (projection)  
  - Next Contribution Date (future)  

**Fix:** Move "Current Value" field to line 229 (after Starting Balance)  
**Priority:** **Medium** (form logic improvement)  
**Time:** 5 minutes  

---

### **Issue 8: No Help Text for Complex Fields**
**Location:** Line 234 - "Expected Annual Return (%)" field  
**Problem:** No help text explaining what this means or typical ranges  
**User Impact:** Users may not know if "7%" is realistic or if "-20%" min is appropriate  
**Fix:** Add `.form-text` helper below input:  
```html
<small class="form-text text-muted">
  Typical stock market: 7-10% | Bonds: 3-5% | Savings: 1-2%
</small>
```
**Priority:** **Low** (nice-to-have)  
**Time:** 10 minutes  

---

## 🎨 Design Consistency Check

### ✅ Matches Design System
- **Button hierarchy:** Primary (orange) for "Add Investment" ✅  
- **Typography:** H1 title (32px), H3 empty state ✅  
- **Spacing:** Follows 8px grid system (mb-3, mt-3) ✅  
- **Icons:** Bootstrap Icons, consistent size ✅  
- **Theme:** Dark-first with FOUC prevention ✅  
- **Required field indicators:** Red asterisks ✅ (FC-049 compliant)  

### ⚠️ Minor Inconsistencies
1. **Empty state inline style** (Issue #1) - Should use CSS class  
2. **Modal form spacing** (Issue #3) - Labels too far from inputs  
3. **Skeleton row count** (Issue #2) - Fewer than other pages  

---

## 📱 Mobile Responsiveness

### ✅ Current Implementation
- Table horizontal scroll enabled (`.table-responsive`)  
- Sidebar toggle for mobile navigation  
- Responsive header layout  
- Modal forms stack properly on narrow screens  

### ⚠️ Potential Improvements
- **8-column table** will be hard to read on narrow screens (Issue #4)  
- **Consider mobile card view** (stacked layout) for better UX  
- **7-field modal** creates excessive scrolling on small screens (Issue #6)  
- **Test on 320px width** (iPhone SE) to verify usability  

---

## 🔧 Cross-Page Pattern Analysis

### Pattern 1: Hidden Page Actions ✅
**Status:** ✅ **CORRECT** (no `initially-hidden` class)  
Investments page does NOT have the systemic bug — Add button is visible on load.

### Pattern 2: Empty State Heading
**Investments:** H3 (correct) ✅  
**Assets:** H5 (inconsistent) ⚠️  
**Recommendation:** Investments is the correct pattern — update Assets to match  

### Pattern 3: Skeleton Loaders
**Assets:** 4 rows  
**Transactions:** 5 rows  
**Investments:** 3 rows ⚠️  
**Recommendation:** Standardize to 5-7 rows across all pages  

### Pattern 4: Empty State Display Control
**Assets:** `style="display:none"` (inline)  
**Investments:** `style="display:none"` (inline)  
**Recommendation:** Batch fix to use `d-none` class across all pages  

---

## 🚀 Recommended Fixes (Priority Order)

### **High Priority (This Sprint)**
1. **Fix Issue #7:** Move "Current Value" field placement (5 min) — Better form logic  

### **Medium Priority (Next Sprint)**
2. **Fix Issue #3:** Modal form spacing (global) (2 hours) — Better UX on all forms  
3. **Fix Issue #4:** Add mobile card view for 8-column table (1-2 hours) — Mobile UX  

### **Low Priority (Backlog)**
4. **Fix Issue #1:** Replace inline style with d-none class (2 min per page)  
5. **Fix Issue #2:** Add 2-3 more skeleton rows (10 min)  
6. **Fix Issue #8:** Add help text for Expected Annual Return (10 min)  
7. **Fix Issue #6:** Multi-step modal for mobile (3-4 hours) — Nice-to-have  

---

## 📊 Audit Status Summary

### Pages Audited: 5/12
- ✅ Dashboard  
- ✅ Assets  
- ✅ Transactions  
- ✅ Operations  
- ✅ **Investments (this audit)**  

### Pages Remaining: 7
- Debts  
- Income  
- Friends  
- Budget  
- Reports  
- Settings  
- Bills (needs re-audit)  

### Issues Summary (Investments Page)
- **High Priority:** 0  
- **Medium Priority:** 2 (form field placement, mobile table UX)  
- **Low Priority:** 4 (consistency + polish)  
- **Total Issues:** 8  
- **Cross-Page Issues:** 3 (can be batch-fixed)  

---

## 🏆 Overall Investments Page Score

**Accessibility:** A (excellent caption, semantic HTML, required indicators)  
**Performance:** B+ (good skeletons, but only 3 rows)  
**UX:** B (good foundation, but form field order suboptimal)  
**Design Consistency:** A- (minor inline style inconsistency)  
**Mobile Responsiveness:** B (works, but 8 columns cramped)  

**Overall Grade:** A- (well-implemented, minor improvements needed)

---

## 🔍 Comparison to Other Pages

**Investments vs Assets:**
- ✅ Both have proper empty states (Investments uses H3, Assets uses H5)  
- ⚠️ Investments has fewer skeleton rows (3 vs 4)  
- ✅ Both have proper ARIA/accessibility  
- ⚠️ Both use inline style for empty state (should use d-none)  
- ✅ Investments has required field indicators (Assets missing some)  

**Investments vs Dashboard:**
- ✅ Both have excellent empty states  
- ✅ Both have proper accessibility  
- ⚠️ Investments table more complex (8 columns vs 6 stat cards)  
- ✅ Both fixed hidden actions issue  

**Recommendation:** Investments page is **on par with other audited pages** — same minor polish issues.

---

## 📝 Next Actions

### Immediate (This Sprint)
1. **Fix Issue #7:** Move Current Value field in modal (5 min) — QUICK WIN  
2. **Continue audit:** Next page = **Debts** (debts.html)  
3. **Log cross-page patterns** for batch fixes:  
   - Empty state inline styles → d-none class  
   - Skeleton row count standardization (5-7 rows)  
   - Modal form label spacing (mb-1 on labels)  

### Future Sprint
1. **Batch fix modal form spacing** across all pages (global UX improvement)  
2. **Research mobile card view** for wide tables (Investments, Assets, Transactions)  
3. **Add help text** for complex financial fields (Expected Return, Interest Rate, etc.)  

---

**Report Generated:** 2026-02-21 06:50 AM EST  
**Auditor:** Capital (Architect)  
**Next Audit:** Debts page (debts.html)  
**Status:** Investments page audit complete ✅
