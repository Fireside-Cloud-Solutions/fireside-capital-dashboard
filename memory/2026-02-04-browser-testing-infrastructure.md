# Browser Testing Infrastructure — Feb 4, 2026

## Context
After discovering a CSS bug (infinite chart height) that was missed because agents weren't verifying their work on the live site, the founder requested mandatory browser testing for all sub-agents.

## What Was Built

### 1. Automated Test Script
- **File:** `scripts/test-live-site.ps1`
- **Purpose:** Quick smoke tests (site availability, CSS integrity, known bugs)
- **Usage:** Can be run manually or scheduled

### 2. Comprehensive Testing Guide
- **File:** `docs/browser-testing-guide.md`
- **Contents:**
  - Step-by-step browser automation instructions
  - Role-specific testing checklists
  - Common issues to watch for
  - Browser tool reference

### 3. Credentials Storage
- **File:** `.credentials` (workspace root)
- **Contents:**
  - Live site URL and login credentials
  - Supabase connection info
- **Access:** All sub-agents can read this file

### 4. Updated Agent Templates
All templates now require browser verification:

- **Builder** → MUST test on live site before reporting completion
- **Auditor** → MUST audit live site security, not just code
- **Connector** → MUST test integrations in browser
- **Architect** → Should verify UI matches design specs
- **PM** → Added live site verification to acceptance criteria

### 5. Updated Orchestration Rules
- **AGENTS.md** → Capital can now REJECT sub-agent work if they skip testing
- Added mandatory verification section
- Agents must report what they tested

## Expected Impact

### Prevents
- ❌ CSS conflicts (like the infinite height issue)
- ❌ Frontend bugs that slip through code review
- ❌ Broken integrations that look fine in code
- ❌ Layout issues on different screen sizes
- ❌ JavaScript errors in production

### Workflow Changes
Before:
1. Write code
2. Commit and push
3. Report completion

After:
1. Write code
2. Commit and push
3. **Login to live site**
4. **Test affected pages**
5. **Take screenshots**
6. **Report what was tested + any issues**

## The CSS Bug That Triggered This

**Issue:** Asset Allocation chart expanding to 29,000px height  
**Root Cause:** `max-height: inherit !important` in main.css overriding the `max-height: 300px` from utilities.css  
**Why Missed:** No one checked the live site after deploying the "fix"  
**Fix:** Removed conflicting rule (commit f7c8402)  

**Quote from founder:**  
> "I want you to make sure all sub agents know that they can use this account and login and check things in the live site. They should be catching things like this. I shouldn't have to tell you to go in and fix it."

## Files Modified
- `templates/builder.md` — Added mandatory browser testing section
- `templates/auditor.md` — Added live site security testing requirement
- `templates/connector.md` — Added integration testing requirement
- `templates/architect.md` — Added UI verification note
- `templates/pm.md` — Added live site check to acceptance criteria template
- `AGENTS.md` — Added mandatory verification rules
- `STATUS.md` — Noted browser testing capability

## Created Files
- `scripts/test-live-site.ps1` — Automated smoke tests
- `docs/browser-testing-guide.md` — Comprehensive testing guide
- `.credentials` — Secure credential storage for all agents

## Enforcement
Capital (orchestrator) now has authority to:
1. **Reject** completion reports without testing evidence
2. **Require** agents to re-test properly
3. **Verify** screenshots and test results before accepting work

Testing is no longer optional — it's **part of the job definition**.

---

**Date:** Feb 4, 2026  
**Implemented by:** Capital (orchestrator)  
**Triggered by:** Infinite chart height bug (FC-056)
