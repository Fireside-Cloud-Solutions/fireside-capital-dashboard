# MOBILE FIX DIRECTIVE — Fireside Capital
## Multi-Agent Task Brief

**Priority:** CRITICAL  
**Date:** 2026-02-03  
**Project:** Fireside Capital Dashboard  
**Repo:** C:\Users\chuba\fireside-capital  
**Live URL:** https://nice-cliff-05b13880f.2.azurestaticapps.net/  
**Deploy:** Auto-deploys from GitHub `main` branch via Azure Static Web Apps  

---

## THE PROBLEM

The Welcome button ("Welcome, Matt ▾") in the mobile top bar STILL wraps text onto two lines despite 6+ commit attempts. The root cause is **CSS specificity hell** — there are 6 CSS files with overlapping, conflicting rules, many using `!important`, at different media query breakpoints. Fixing one rule exposes another downstream override.

Additionally:
- Logged-out pages show blank content (CTAs were added but need verification)
- Action buttons may still show when logged out
- KPI card numbers may overflow at mid-breakpoints
- Logout may not work reliably

---

## THE CSS ARCHITECTURE (a.k.a. The Mess)

### Files loaded in order (cascade order matters!):
1. `app/assets/css/design-tokens.css` — CSS variables
2. `app/assets/css/styles.css` — Main styles (~2450 lines)
3. `app/assets/css/notification-polish.css` — Notification dropdown
4. `app/assets/css/polish.css` — General polish utilities
5. `app/assets/css/mobile-optimizations.css` — Mobile responsive (~1100 lines)
6. `app/assets/css/brand-polish.css` — Brand colors/polish
7. `app/assets/css/accessibility.css` — WCAG compliance (~460 lines)
8. `app/assets/css/logged-out-cta.css` — Logged-out CTA cards

**Plus:** Each of the 10 HTML files has an inline `<style>` tag in `<head>` with critical CSS that duplicates/overrides some mobile rules.

### The Welcome Button Conflict Map

These are ALL the CSS rules that affect `#userDropdown` or its ancestors. When the viewport is <480px, EVERY rule from ALL matching media queries applies simultaneously:

| File | Line | Media Query | Selector | Property | Value |
|------|------|-------------|----------|----------|-------|
| styles.css | 2415 | `max-width: 768px` | `#userDropdown` | white-space, max-width, display | nowrap, none, inline-flex (all !important) |
| styles.css | 2433 | `max-width: 768px` | `#userDropdown span` | display | inline !important |
| styles.css | 817 | none | `.btn` | display | inline-flex |
| mobile-opts | 273 | `max-width: 479.98px` | `#userDropdown` | max-width | **was 160px !important** (just changed to none) |
| mobile-opts | 279 | `max-width: 479.98px` | `#username` | max-width, display | 80px, inline-block |
| mobile-opts | 788 | `max-width: 991.98px` | `#loggedInState .btn` | height, display | 48px, inline-flex |
| mobile-opts | 819 | `max-width: 991.98px` | `#userDropdown` | max-width | none !important |
| inline HTML | ~130 | `max-width: 991.98px` | `#loggedInState .btn` | white-space, flex-wrap | nowrap, nowrap (all !important) |
| inline HTML | button attr | none | `style="..."` on button | white-space, max-width | nowrap, none (all !important) |
| accessibility.css | 374 | `max-width: 575.98px` | `.btn, button` | min-height, padding | 48px, space-3 space-4 |

**The global `* { max-width: 100% }` rule was removed from styles.css** and replaced with targeted `img, video, canvas, svg, table { max-width: 100% }`.

---

## WHAT NEEDS TO HAPPEN

### Phase 1: CSS Cleanup (Dev Agent)
1. **Consolidate ALL welcome button CSS into ONE place.** Remove every duplicate/conflicting rule from every file. Put the canonical rule in styles.css under a clearly marked section.
2. **Remove all inline `<style>` blocks from the 10 HTML files** that duplicate mobile-optimizations.css rules. These cause cascade conflicts. If critical CSS is needed for flash prevention, keep ONLY the minimum (hamburger position, auth state visibility) — NOT button styling.
3. **Verify the welcome button works at these widths:** 320px, 375px, 428px, 480px, 768px, 1024px, 1200px, 1440px.
4. **The button should:** Show "Welcome, Name ▾" on ONE line at all widths. On very narrow screens (<375px), truncate the name (not "Welcome,").

### Phase 2: Auth State Fixes (Dev Agent)
1. **Logged-out state:** Every page should show a branded CTA card with Login/Sign Up buttons instead of blank content.
2. **Action buttons:** "Add Investment", "Add Asset", etc. must be `display: none` when logged out. The `pageActions` div and any `auth-required` elements should be hidden.
3. **Logout:** Must work reliably. Wrapped in try-catch with forced UI update.
4. **Sidebar:** "Connect a New Account" hidden when logged out.

### Phase 3: KPI Cards (Dev Agent)  
1. Dashboard stat cards should never truncate dollar amounts.
2. Grid: `col-12 col-md-6 col-lg-6 col-xl-4` (NOT col-lg-3 col-xl-3).
3. Font size: responsive with `clamp()` or breakpoint-specific sizing.
4. "No data yet" should only show when net worth is actually $0.

### Phase 4: Full QA (QA Agent)
1. Open EVERY page at 375px and 1200px.
2. Check logged-in AND logged-out states.
3. Verify: no text truncation, no horizontal scroll, no blank pages, no visible action buttons when logged out.
4. File a report with screenshots or descriptions of any remaining issues.

---

## 10 HTML PAGES
All in `app/`:
- index.html (Dashboard)
- assets.html
- investments.html
- debts.html
- bills.html
- income.html
- friends.html
- budget.html
- reports.html
- settings.html

## KEY JS FILE
- `app/assets/js/app.js` (~4500 lines) — auth state, data rendering, all page logic

---

## RULES FOR THE TEAM
1. **Search ALL CSS files before adding any rule.** Use `Select-String` to find every existing rule for the selector you're modifying.
2. **Never use `!important` unless overriding Bootstrap.** If you need `!important`, document WHY.
3. **One canonical location per component.** Don't scatter welcome button CSS across 4 files.
4. **Test at multiple breakpoints.** Not just "mobile" — test 375px, 480px, 768px, 1024px.
5. **Commit and push as a single batch** — no rapid-fire pushes that cancel Azure deploys.
6. **QA must verify before declaring done.** No "should work" — actually check.

---

## GIT WORKFLOW
```powershell
cd C:\Users\chuba\fireside-capital
git add -A
git commit -m "descriptive message"
git push origin main
# Wait 2-3 min for Azure deploy, then verify at live URL
```
