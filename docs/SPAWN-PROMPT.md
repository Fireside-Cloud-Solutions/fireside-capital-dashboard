# Multi-Agent Spawn Prompt for Fireside HQ

Copy and paste this into Fireside HQ's #commands channel (or wherever you talk to it):

---

## PROMPT:

I need you to spawn two agents to fix the Fireside Capital website. Read the directive first:

**Read this file:** `C:\Users\chuba\fireside-capital\docs\MOBILE-FIX-DIRECTIVE.md`

Then spawn these agents:

### Agent 1: Developer
**Label:** `capital-dev-mobile-overhaul`  
**Task:**
```
You are fixing the Fireside Capital web app at C:\Users\chuba\fireside-capital.

READ C:\Users\chuba\fireside-capital\docs\MOBILE-FIX-DIRECTIVE.md FIRST. It has the full context.

Your job — Phase 1, 2, and 3 from the directive:

PHASE 1 - CSS CLEANUP:
1. Search ALL 8 CSS files for every rule targeting #userDropdown, #loggedInState, #username, .dropdown-toggle. Use: Select-String -Path "C:\Users\chuba\fireside-capital\app\assets\css\*.css" -Pattern "userDropdown|loggedInState.*btn|username"
2. REMOVE every duplicate/conflicting welcome button rule from mobile-optimizations.css, the inline <style> tags in HTML files, and anywhere else they appear.
3. Put ONE canonical welcome button rule set in styles.css under the existing "CRITICAL FIX: Welcome dropdown alignment" section (around line 2415). This is the ONLY place welcome button CSS should live.
4. Remove the inline style="" attribute from the #userDropdown button in all 10 HTML files — it shouldn't need inline styles if the CSS is clean.
5. Strip the inline <style> blocks in all 10 HTML files down to ONLY: sidebar-toggle position, #loggedInState/#loggedOutState position/visibility for auth flash prevention. Remove ALL button sizing/wrapping rules from inline styles.

PHASE 2 - AUTH STATE:
1. Verify logged-out CTA shows on all pages (check toggleLoggedOutCTA in app.js)
2. Verify pageActions display:none when logged out
3. Verify .auth-required elements hidden when logged out
4. Verify logout() works with try-catch

PHASE 3 - KPI CARDS:
1. Verify stat cards use col-lg-6 col-xl-4 grid
2. Verify responsive font sizing on .stat-value
3. Fix "No data yet" — should show dash when data exists but no trend history

AFTER ALL CHANGES: Commit everything in ONE commit and push to origin main. Wait for deploy. Then report back what you changed.

Use PowerShell (semicolons not &&). All files are at C:\Users\chuba\fireside-capital\app\
```

### Agent 2: QA Auditor (spawn AFTER dev agent completes)
**Label:** `capital-qa-mobile-audit`  
**Task:**
```
You are QA auditing the Fireside Capital web app at C:\Users\chuba\fireside-capital.
Live URL: https://nice-cliff-05b13880f.2.azurestaticapps.net/

READ C:\Users\chuba\fireside-capital\docs\MOBILE-FIX-DIRECTIVE.md for context.

Your job is Phase 4 — verify everything works. Do NOT make code changes yourself.

AUDIT CHECKLIST:
For each of the 10 pages (index, assets, investments, debts, bills, income, friends, budget, reports, settings):

1. LOGGED-IN STATE:
   - [ ] Welcome button text on one line (check CSS for any max-width constraints)
   - [ ] Welcome dropdown opens and shows Logout option
   - [ ] Action buttons (Add Asset, etc.) visible
   - [ ] Content loads properly
   - [ ] No horizontal scroll

2. LOGGED-OUT STATE:
   - [ ] Login/Sign Up buttons visible in header
   - [ ] Branded CTA card shows with Login/Sign Up buttons
   - [ ] NO action buttons visible (Add Asset, Add Investment, etc.)
   - [ ] "Connect a New Account" sidebar link hidden
   - [ ] No blank/empty content areas

3. KPI CARDS (dashboard only):
   - [ ] Dollar amounts never truncated at any width
   - [ ] Cards stack properly (2-per-row on medium, 3-per-row on large)
   - [ ] No "No data yet" alongside actual dollar values

4. CSS HYGIENE:
   - [ ] No duplicate #userDropdown rules across CSS files (search all 8 files)
   - [ ] No inline style="" on #userDropdown button
   - [ ] No !important on welcome button rules (except overriding Bootstrap)
   - [ ] Inline <style> blocks minimal (only positioning, no button styling)

METHOD: 
- Read the CSS files and HTML files directly
- Search for conflicting rules using Select-String
- Check the JavaScript auth flow in app.js
- Fetch the live URL with web_fetch to verify deployed state

FILE A REPORT with pass/fail for each item and any issues found. If issues exist, describe exactly what's wrong and which file/line needs fixing.
```

---

## HOW TO USE:
1. Paste the Developer agent task first
2. Wait for it to complete and deploy
3. Then paste the QA agent task
4. QA will file a report — if issues remain, send the report back to a new dev agent
