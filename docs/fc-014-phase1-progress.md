# FC-014 Phase 1 Progress Report
**Date:** 2026-02-03  
**Task:** Reduce !important usage  
**Status:** Phase 1 in progress

---

## Starting State
- **Total !important:** 305
- **Target:** 130 (57% reduction)

---

## Phase 1 Progress (Low-Hanging Fruit)

### Session 1: Safe Removals
**Commits:** 106130f, 883c6f4, f2be9b7, 6830a4a

**Removed from main.css:**
- canvas width/height (no competing styles)
- modal background (standalone property)
- sidebar-brand padding (no competition)
- display: inline-flex (no competition)
- box-sizing: border-box (standalone)
- opacity values (no competing styles)
- letter-spacing (standalone)
- cursor (standalone property)
- line-height (no competing styles)
- vertical-align (no competition)
- transform (no competing styles)
- pointer-events (standalone)
- white-space (no competition)

**Removed from responsive.css:**
- overflow-x: auto (media query specificity sufficient)
- overflow: visible (no competition)
- word-break: keep-all (standalone)
- flex-direction: column (media query sufficient)
- border-radius (no competition in mobile)
- text-align (standalone)
- justify-content (media query sufficient)
- align-items (no competing selectors)
- gap (media query sufficient)

---

## Current State (Updated 2026-02-03 1:45 PM)
- **Total !important:** 277
- **Removed:** 28 (9.2% reduction)
- **Remaining:** 147 to remove to reach target

### Session 2: Additional Safe Removals
**Commits:** c1c873d, [pending]

**Additional removals:**
- user-select (no competing styles)
- transition (animation property)
- position: relative (media query sufficient)
- z-index (no stacking conflicts)
- visibility (standalone)
- object-fit (no competition)
- box-shadow (standalone visual property)

---

## Categories Remaining

### Utility Classes (KEEP - 50-75 instances)
- `.mb-*`, `.p-*`, `.gap-*` spacing utilities
- `.d-none`, `.d-block`, `.d-flex` display utilities
- `.text-*`, `.bg-*` color utilities
- **Rationale:** Utilities should always override

### Mobile Layout Overrides (KEEP MOST - 60-80 instances)
- width: 100% !important on cards/containers
- flex properties forcing mobile stacking
- **Rationale:** Need to override desktop layouts at mobile breakpoints

### Bootstrap Overrides (REVIEW - 30-40 instances)
- Button heights/padding
- Modal styles
- Badge colors
- **Rationale:** Some may be unnecessary if we increase selector specificity

---

## Next Steps (Phase 2)

### Strategy: Increase Specificity
Replace !important with better selectors:

```css
/* Before */
.btn { color: blue !important; }

/* After */
.page-header .btn { color: blue; }
/* Or */
.btn-custom { color: blue; }
```

### Target Areas
1. **Page header buttons** — height/padding !important (5-8 instances)
2. **Badge colors** — background/color !important (10-15 instances)
3. **Card spacing** — padding/margin !important (15-20 instances)

---

## Risk Assessment

### Low Risk (Completed)
✅ Standalone properties with no competing selectors
✅ Properties in media queries (specificity already high)
✅ Visual properties (opacity, transforms)

### Medium Risk (Phase 2)
⚠️ Layout properties (width, height, padding)
⚠️ Bootstrap overrides (may conflict with base styles)
⚠️ Color overrides (may have theme dependencies)

### High Risk (Phase 3 or KEEP)
🔴 Utility classes (intentionally forceful)
🔴 Mobile critical layout (!important needed for stacking)
🔴 State classes (is-hidden, is-disabled)

---

## Testing Checklist

### After Phase 1
- [ ] Visual regression: All 10 pages
- [ ] Mobile (< 576px): Sidebar, cards, tables
- [ ] Tablet (576-768px): Layout stacking
- [ ] Desktop (> 768px): Default state
- [ ] Dark/light theme toggle
- [ ] Chart rendering (canvas width/height)
- [ ] Modal backgrounds
- [ ] Button heights in page header

---

**Phase 1 Status:** 6.9% complete (21/175 target removals)  
**Next:** Phase 2 (increase specificity to remove more)
