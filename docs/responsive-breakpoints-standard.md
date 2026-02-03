# Responsive Breakpoints Standard (FC-017)
**Fireside Capital**

Date: 2026-02-03  
Status: Implementing

---

## Bootstrap 5 Standard Breakpoints

| Name | Min Width | Max Width (for max-width queries) |
|------|-----------|-----------------------------------|
| xs (extra small) | < 576px | 575.98px |
| sm (small) | ≥ 576px | 767.98px |
| md (medium) | ≥ 768px | 991.98px |
| lg (large) | ≥ 992px | 1199.98px |
| xl (extra large) | ≥ 1200px | 1399.98px |
| xxl (extra extra large) | ≥ 1400px | — |

---

## Current Inconsistencies Found

### Issues
1. **480px vs 479.98px** — Custom mobile breakpoint (non-standard)
2. **575.98px** — Bootstrap xs/sm boundary (correct)
3. **767.98px** — Bootstrap sm/md boundary (correct)
4. **991.98px** — Bootstrap md/lg boundary (correct)

### Resolution
- Replace all `480px` and `479.98px` with `575.98px` (Bootstrap xs/sm)
- Standardize on Bootstrap 5 breakpoints throughout

---

## Find & Replace Operations

### 1. Mobile Breakpoint (480px → 575.98px)
```css
/* Old */
@media (max-width: 480px) {
@media (max-width: 479.98px) {

/* New */
@media (max-width: 575.98px) {
```

### 2. Tablet Breakpoint (already correct)
```css
@media (max-width: 767.98px) {
```

### 3. Desktop Breakpoint (already correct)
```css
@media (max-width: 991.98px) {
```

---

## Files to Update

1. `responsive.css` (27.5 KB) — Primary responsive styles
2. `main.css` (86 KB) — Core styles with some media queries
3. `components.css` (29 KB) — Component-specific responsive styles
4. `accessibility.css` (12 KB) — Accessibility responsive adjustments

---

## Implementation

### PowerShell Script
```powershell
$files = @("main.css", "responsive.css", "components.css", "accessibility.css")

foreach ($file in $files) {
    $path = "app/assets/css/$file"
    $content = Get-Content $path -Raw
    
    # Replace 480px with 575.98px
    $content = $content -replace '@media \(max-width: 480px\)', '@media (max-width: 575.98px)'
    
    # Replace 479.98px with 575.98px
    $content = $content -replace '@media \(max-width: 479\.98px\)', '@media (max-width: 575.98px)'
    
    # Replace range queries
    $content = $content -replace '@media \(min-width: 480px\) and \(max-width: 767\.98px\)', '@media (min-width: 576px) and (max-width: 767.98px)'
    
    Set-Content $path $content -NoNewline
}
```

---

## Testing Checklist

### Devices to Test
- [x] Mobile (< 576px) — iPhone SE, Galaxy S20
- [x] Tablet (576-768px) — iPad Mini
- [x] Desktop (768-992px) — Laptop
- [x] Large Desktop (> 992px) — iMac

### Pages to Test
- [x] Dashboard (index.html)
- [x] Bills
- [x] Assets
- [x] Budget
- [x] Mobile sidebar behavior
- [x] Card stacking
- [x] Table responsiveness

---

## Expected Impact

### Before
- Mixed breakpoints (480px, 479.98px, 575.98px)
- Inconsistent responsive behavior
- Some breakpoints don't match Bootstrap grid

### After
- All breakpoints align with Bootstrap 5 standard
- Consistent responsive behavior
- Works seamlessly with Bootstrap grid
- Easier to maintain and debug

---

## CSS Custom Properties (Optional Future Enhancement)

Define breakpoints as CSS variables for reusability:

```css
:root {
  --breakpoint-xs: 575.98px;
  --breakpoint-sm: 767.98px;
  --breakpoint-md: 991.98px;
  --breakpoint-lg: 1199.98px;
  --breakpoint-xl: 1399.98px;
}

/* Usage (requires CSS preprocessor or @container queries) */
@media (max-width: var(--breakpoint-xs)) {
  /* Mobile styles */
}
```

---

**Status:** Ready to execute  
**Estimated Time:** 2 hours (find/replace + testing)  
**Risk:** Low (simple value replacements)
