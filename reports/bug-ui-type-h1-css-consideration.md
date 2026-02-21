# BUG-UI-TYPE-SYSTEMIC-H1-001 — CSS Consideration

**Issue:** When changing `<h2>` to `<h1>` in `.page-header`, verify CSS styling

---

## CURRENT CSS (main.css)

**Finding:** main.css defines `.page-header h2` styles but NO `.page-header h1` styles

**Lines to check:**
```css
.page-header h2 {
  /* styles here */
}
```

**Search results:** 2 occurrences of `.page-header h2` in main.css

---

## RECOMMENDATION

When implementing BUG-UI-TYPE-SYSTEMIC-H1-001 fix:

### Option 1: Add h1 selector (RECOMMENDED)
```css
/* Before */
.page-header h2 {
  margin: 0;
  font-size: var(--fs-h2);
  /* ... more styles ... */
}

/* After */
.page-header h1,
.page-header h2 {
  margin: 0;
  font-size: var(--fs-h2);
  /* ... more styles ... */
}
```

### Option 2: Replace h2 with h1
```css
/* Change selector from h2 to h1 */
.page-header h1 {
  margin: 0;
  font-size: var(--fs-h2);
  /* ... more styles ... */
}
```

**Recommendation:** Use Option 1 (add both selectors) for backward compatibility in case any modals or components still use h2.

---

## VERIFICATION CHECKLIST

After CSS change:
- [ ] Read main.css `.page-header h1` styles
- [ ] Verify Settings page visual appearance (already using h1)
- [ ] Verify font size matches current h2 appearance
- [ ] Verify margin/padding matches current layout
- [ ] Check for any visual regressions on page headers

---

**Note:** Settings page (commit ac37738) already uses `<h1>` but styling may still be relying on h2 CSS. Verify Settings looks correct before batch fixing other 11 pages.

---

**Created:** 2026-02-21 04:46 AM EST  
**Session:** Sprint QA 0446
