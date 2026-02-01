# Button Hierarchy Fix — February 1, 2026

## Summary
Fixed button hierarchy violations across all 8 HTML pages to implement the Fireside tri-color button system correctly.

## Root Cause
Too many `btn-primary` (orange) buttons on each page, breaking visual hierarchy and making the interface cluttered.

## Changes Made

### Hierarchy Rules Applied
- **PRIMARY (orange):** 1 per page max — the MAIN action (Add Asset, Add Bill, Add Item, etc.)
- **SECONDARY (blue):** 2-3 per page — supportive actions (Scan Email, Generate, Export, user dropdowns)
- **TERTIARY (gray outline):** Unlimited — utility actions (Login, Notifications)

### Files Changed (8)

#### 1. index.html (Dashboard)
**Buttons reclassified:**
- Login button: `btn-outline-primary` → `btn-outline-secondary` (utility)
- Notification bell: `btn-outline-primary` → `btn-outline-secondary` (utility)
- User dropdown: `btn-primary` → `btn-secondary` (navigation)
- Sign Up button: **kept as `btn-primary`** (main action for logged-out state)

**Result:** 1 primary button (Sign Up), clear hierarchy established

---

#### 2. assets.html
**Buttons reclassified:**
- Login button: `btn-outline-primary` → `btn-outline-secondary`
- Sign Up button: `btn-primary` → `btn-secondary`
- Notification bell: `btn-outline-primary` → `btn-outline-secondary`
- User dropdown: `btn-primary` → `btn-secondary`
- Add Asset button: **kept as `btn-primary`** (main action)

**Result:** 1 primary button (Add Asset), supporting buttons demoted to blue

---

#### 3. bills.html
**Buttons reclassified:**
- **Scan Email for Bills:** `btn-outline-primary` → `btn-secondary` (supportive action)
- Login button: `btn-outline-primary` → `btn-outline-secondary`
- Sign Up button: `btn-primary` → `btn-secondary`
- Notification bell: `btn-outline-primary` → `btn-outline-secondary`
- User dropdown: `btn-primary` → `btn-secondary`
- Add Bill button: **kept as `btn-primary`** (main action)

**Result:** 1 primary button (Add Bill), 1 secondary (Scan Email), clear visual hierarchy

---

#### 4. debts.html
**Buttons reclassified:**
- Login button: `btn-outline-primary` → `btn-outline-secondary`
- Sign Up button: `btn-primary` → `btn-secondary`
- Notification bell: `btn-outline-primary` → `btn-outline-secondary`
- User dropdown: `btn-primary` → `btn-secondary`
- Add Debt button: **kept as `btn-primary`** (main action)

**Result:** 1 primary button (Add Debt)

---

#### 5. budget.html
**Buttons reclassified:**
- **Previous/Next month:** `btn-outline-primary` → `btn-outline-secondary` (navigation)
- **Generate Budget:** `btn-success` → `btn-secondary` (supportive action)
- Login button: `btn-outline-primary` → `btn-outline-secondary`
- Sign Up button: `btn-primary` → `btn-secondary`
- Notification bell: `btn-outline-primary` → `btn-outline-secondary`
- User dropdown: `btn-primary` → `btn-secondary`
- Add Item button: **kept as `btn-primary`** (main action)

**Result:** 1 primary button (Add Item), 1 secondary (Generate), utility buttons demoted

---

#### 6. income.html
**Buttons reclassified:**
- Login button: `btn-outline-primary` → `btn-outline-secondary`
- Sign Up button: `btn-primary` → `btn-secondary`
- Notification bell: `btn-outline-primary` → `btn-outline-secondary`
- User dropdown: `btn-primary` → `btn-secondary`
- Add Income button: **kept as `btn-primary`** (main action)

**Result:** 1 primary button (Add Income)

---

#### 7. investments.html
**Buttons reclassified:**
- Login button: `btn-outline-primary` → `btn-outline-secondary`
- Sign Up button: `btn-primary` → `btn-secondary`
- Notification bell: `btn-outline-primary` → `btn-outline-secondary`
- User dropdown: `btn-primary` → `btn-secondary`
- Add Investment button: **kept as `btn-primary`** (main action)

**Result:** 1 primary button (Add Investment)

---

#### 8. reports.html
**Buttons reclassified:**
- **Export button:** `btn-outline-primary` → `btn-secondary` (supportive action)
- Login button: `btn-outline-primary` → `btn-outline-secondary`
- Sign Up button: `btn-primary` → `btn-secondary`
- Notification bell: `btn-outline-primary` → `btn-outline-secondary`
- User dropdown: `btn-primary` → `btn-secondary`

**Result:** No primary button needed (view-only page), secondary action (Export) clearly defined

---

## Total Buttons Reclassified

| Page | Primary Kept | Changed to Secondary | Changed to Outline-Secondary | Total Changes |
|------|--------------|---------------------|------------------------------|---------------|
| index.html | 1 (Sign Up) | 1 (User dropdown) | 2 (Login, Notification) | 3 |
| assets.html | 1 (Add Asset) | 2 (Sign Up, User dropdown) | 2 (Login, Notification) | 4 |
| bills.html | 1 (Add Bill) | 3 (Scan Email, Sign Up, User dropdown) | 2 (Login, Notification) | 5 |
| debts.html | 1 (Add Debt) | 2 (Sign Up, User dropdown) | 2 (Login, Notification) | 4 |
| budget.html | 1 (Add Item) | 3 (Generate, Sign Up, User dropdown) | 4 (Prev, Next, Login, Notification) | 7 |
| income.html | 1 (Add Income) | 2 (Sign Up, User dropdown) | 2 (Login, Notification) | 4 |
| investments.html | 1 (Add Investment) | 2 (Sign Up, User dropdown) | 2 (Login, Notification) | 4 |
| reports.html | 0 | 3 (Export, Sign Up, User dropdown) | 2 (Login, Notification) | 5 |
| **TOTAL** | **7** | **18** | **18** | **36 buttons reclassified** |

---

## Visual Hierarchy Impact

### Before
- ❌ Multiple orange buttons competing for attention on every page
- ❌ No clear primary action
- ❌ Cluttered, overwhelming interface

### After
- ✅ **1 orange button per page** (or 0 on view-only pages) — instantly draws eye to main action
- ✅ **Blue secondary buttons** provide supportive actions without competing
- ✅ **Gray outline buttons** recede into background for utility functions
- ✅ Clean, professional hierarchy matches design system

---

## Testing Checklist

- [ ] index.html: Sign Up is only orange button
- [ ] assets.html: Add Asset is only orange button
- [ ] bills.html: Add Bill is only orange button, Scan Email is blue
- [ ] debts.html: Add Debt is only orange button
- [ ] budget.html: Add Item is only orange button, Generate Budget is blue
- [ ] income.html: Add Income is only orange button
- [ ] investments.html: Add Investment is only orange button
- [ ] reports.html: No orange buttons, Export is blue

---

## Expected Outcome

Users should now experience:
1. **Clear visual priority** — one main action per page
2. **Reduced cognitive load** — less orange = easier to scan
3. **Better usability** — immediate understanding of what to do next
4. **Professional polish** — design system properly implemented

---

**Builder:** Completed button hierarchy fix across all 8 pages  
**Date:** February 1, 2026  
**Total changes:** 36 button class modifications
