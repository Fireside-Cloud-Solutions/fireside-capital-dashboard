# BUG-UI-TYPE-SYSTEMIC-H1-001 — Missing h1 Tags (WCAG 2.4.6 Violation)

**Severity:** P1 (High) — WCAG Accessibility Violation  
**Size:** S (2-4h)  
**Status:** Ready  
**Found:** 2026-02-21 04:46 AM EST (Sprint QA 0446 systematic audit)  
**Reporter:** Capital (QA Lead)

---

## 🐛 ISSUE SUMMARY

**ALL 11 PAGES** use `<h2>` for the page title instead of `<h1>`.

**WCAG 2.4.6 Violation:** "Headings and Labels - Descriptive"  
**Impact:** Screen readers expect ONE h1 per page to identify the main content. Users cannot quickly understand the page purpose.

---

## 📍 AFFECTED FILES (11 PAGES)

| Page | File | Line | Current Code |
|------|------|------|--------------|
| Assets | assets.html | 89 | `<h2>Assets</h2>` |
| Bills | bills.html | 88 | `<h2>Bills</h2>` |
| Budget | budget.html | 88 | `<h2>Budget</h2>` |
| Dashboard | index.html | 102 | `<h2>Dashboard</h2>` |
| Debts | debts.html | 88 | `<h2>Debts</h2>` |
| Friends | friends.html | 88 | `<h2>Friends & Connections</h2>` |
| Income | income.html | 88 | `<h2>Income</h2>` |
| Investments | investments.html | 88 | `<h2>Investments</h2>` |
| Operations | operations.html | 89 | `<h2><i class="bi bi-activity me-2 text-primary"></i> Operations</h2>` |
| Reports | reports.html | 95 | `<h2>Reports</h2>` |
| Transactions | transactions.html | 88 | `<h2>Transactions</h2>` |

**Settings** ✅ ALREADY FIXED (commit ac37738, 2026-02-21)

---

## 🔧 FIX REQUIRED

**Find/Replace:**
```diff
- <h2>PageTitle</h2>
+ <h1>PageTitle</h1>
```

**Special case (Operations page):**
```diff
- <h2><i class="bi bi-activity me-2 text-primary"></i> Operations</h2>
+ <h1><i class="bi bi-activity me-2 text-primary"></i> Operations</h1>
```

**Estimated effort:** 15-20 minutes (batch find/replace across 11 files)

---

## ✅ VERIFICATION CHECKLIST

After fix:
- [ ] All 12 pages have exactly ONE h1 element
- [ ] h1 is the page title in `.page-header`
- [ ] No visual regression (h1 should inherit h2 styles via CSS)
- [ ] Screen reader test: Page title announced correctly
- [ ] WCAG 2.4.6 compliance achieved

---

## 📊 ACCESSIBILITY IMPACT

**Before:**
- 11 of 12 pages fail WCAG 2.4.6
- Screen readers cannot identify main page content
- Poor accessibility for visually impaired users

**After:**
- 100% WCAG 2.4.6 compliance
- Clear semantic heading hierarchy
- Improved screen reader experience

---

## 📝 NOTES

**Why Settings was fixed first:**
- Sprint UI/UX 0432 audit identified this issue on Settings page
- Quick fix applied (commit ac37738)
- Sprint QA 0446 systematic audit caught the systemic pattern

**Related:**
- This is the SAME bug pattern as BUG-UI-TYPE-SETTINGS-001 (now Done)
- Should be batch-fixed across all remaining pages

**CSS Consideration — CRITICAL:**
- main.css defines `.page-header h2` styles (lines 204-208, 251-253)
- NO `.page-header h1` styles defined
- MUST add h1 selector or h1 tags will use default browser styles (too large)

**Required CSS change (main.css):**
```css
/* Line 204: Change from */
.page-header h2 {

/* To */
.page-header h1,
.page-header h2 {

/* Line 251: Change from */
.page-header h2 {

/* To */
.page-header h1,
.page-header h2 {
```

See: `reports/bug-ui-type-h1-css-consideration.md`

---

## 🎯 RECOMMENDED APPROACH

**Option 1: PowerShell Batch Fix (5 min)**
```powershell
$files = @(
  "assets.html", "bills.html", "budget.html", "debts.html",
  "friends.html", "income.html", "index.html", "investments.html",
  "operations.html", "reports.html", "transactions.html"
)

foreach ($file in $files) {
  $path = "C:\Users\chuba\fireside-capital\app\$file"
  $content = Get-Content $path -Raw
  
  # Standard pattern
  $content = $content -replace '<h2>([^<]+)</h2>', '<h1>$1</h1>'
  
  # Operations page (with icon)
  $content = $content -replace '<h2>(<i class="bi.*?</i>.*?)</h2>', '<h1>$1</h1>'
  
  Set-Content $path $content
}
```

**Option 2: Manual Fix (15-20 min)**
- Open each file
- Find `.page-header` section
- Change `<h2>` to `<h1>` (and closing tag)
- Save and commit

---

## 🚀 DEPLOYMENT

**Git commit:**
```bash
git add app/*.html
git commit -m "fix(a11y): BUG-UI-TYPE-SYSTEMIC-H1-001 - Change page title h2 to h1 for WCAG 2.4.6 compliance across 11 pages"
git push origin main
```

**BACKLOG update:**
- Add BUG-UI-TYPE-SYSTEMIC-H1-001 as P1, S, Ready
- Mark as Done after commit

---

**Created:** 2026-02-21 04:46 AM EST  
**Session:** Sprint QA 0446 (cron 013cc4e7)
