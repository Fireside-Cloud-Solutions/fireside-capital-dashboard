# Fireside Capital — Next Development Priorities
Date: 2026-02-01

## Completed Today
- ✅ **Mobile responsiveness fixes** — All touch targets optimized, forms prevent iOS zoom, charts responsive, modals fit on mobile (deployed)
- ✅ **Shared bills budget display** — Fixed critical bug where shared bills weren't appearing in budget table for shared_with users (deployed)
- ✅ **Security remediation roadmap** — Comprehensive plan created for 11 security findings from penetration test

---

## High Priority (Do Next)

### 1. Fix Assets Page Routing Failure [BUG-001]
**Why:** CRITICAL blocker — users cannot access Assets page at all. URL shows `assets.html` but page displays Bills content. Completely blocks asset management functionality (view, add, edit, delete assets). Affects net worth calculations and user trust.

**Effort:** 4-8 hours

**Root Cause:** Most likely Azure Static Web Apps routing misconfiguration or JavaScript routing conflict

**Assignee:** Builder

**Tasks:**
1. Verify `assets.html` file exists and has correct content in repo
2. Check `staticwebapp.config.json` for routing rules/fallback issues
3. Inspect browser network tab to see if assets.html returns 200 or redirect
4. Review JavaScript routing logic (window.location.pathname handling)
5. Test if other pages (Investments, Debts, Income) have same issue
6. Fix configuration or routing logic
7. Deploy and verify all pages accessible

**Acceptance Criteria:**
- [ ] Direct URL `/assets.html` loads Assets page content
- [ ] Sidebar "Assets" link navigates correctly
- [ ] Assets table displays with correct data (BMW X5, 2700 Bingham Drive)
- [ ] "Add Asset" button visible and functional
- [ ] Regression test: all other pages still work

---

### 2. Critical Security Fixes — XSS & CSRF [HIGH-01, HIGH-02]
**Why:** HIGH-severity vulnerabilities discovered in penetration test. XSS allows malicious code injection in 54 locations (bill names, notifications, shared bill participants). CSRF allows unauthorized state changes. Both pose data security risk and could compromise user accounts.

**Effort:** 28 hours (16 hrs XSS + 12 hrs CSRF)

**Assignee:** Builder + Auditor

**Tasks:**

**XSS Remediation (16 hours):**
1. Audit all 54 innerHTML assignments in codebase
2. Create `security-utils.js` with `escapeHtml()` and `sanitizeUserHTML()` functions
3. Refactor bill rendering to use `textContent` or escaping
4. Fix notification rendering (title and body)
5. Fix friend/shared bill participant name display
6. Test all XSS payloads from pentest report
7. Add unit tests for sanitization functions

**CSRF Protection (12 hours):**
1. Verify Supabase CORS restricted to production domain only
2. Configure session cookies with `SameSite=Strict` and `Secure` flags
3. Implement CSRF token system (double submit cookie pattern or custom header)
4. Add CSRF validation to all state-changing forms
5. Test with malicious cross-site request attempts
6. Verify legitimate operations still work

**Acceptance Criteria:**
- [ ] All user input passes through escaping/sanitization
- [ ] XSS payloads do NOT execute when entered in forms
- [ ] Session cookies have Secure and SameSite=Strict flags
- [ ] Cross-site requests blocked in testing
- [ ] All existing features still functional

---

### 3. Accessibility Remediation — WCAG 2.1 Level A Compliance
**Why:** Current score 68/100 (FAIL). Critical issues prevent screen reader users from using the app. Icon-only buttons have no labels (users can't tell what Edit/Delete buttons do), modals can't be closed, forms lack proper labels. Legal compliance risk (Section 508, ADA). Affects ~15% of potential users with disabilities.

**Effort:** 16 hours

**Assignee:** Builder

**Tasks:**
1. **Critical (Level A) fixes:**
   - Add `aria-label` to all icon-only buttons (Edit, Delete, View)
   - Add `aria-label="Close"` to all modal close buttons
   - Ensure all form inputs have associated labels
   - Add skip navigation link
   - Fix keyboard focus order on all pages
   
2. **High Priority (Level AA) fixes:**
   - Increase color contrast to 4.5:1 minimum (gray text on cards)
   - Add visible focus indicators (2px outline)
   - Ensure all interactive elements keyboard accessible
   
3. **Testing:**
   - Run axe DevTools on all pages (target 95+ score)
   - Test with NVDA/JAWS screen reader
   - Keyboard-only navigation test (no mouse)

**Acceptance Criteria:**
- [ ] axe DevTools score 95+ on all pages
- [ ] All buttons announce purpose to screen readers
- [ ] All modals closeable with keyboard
- [ ] All forms completable with keyboard only
- [ ] Color contrast meets WCAG AA (4.5:1)

---

## Medium Priority (This Week)

### 4. Monthly Bills Total Calculation Fix [BUG-002]
- **Issue:** Displays $6,337.59 but expected is $5,944.18 (discrepancy of $393.41)
- **Root Cause:** Likely using full bill amounts instead of user's share for split bills, or hidden bills not visible in table
- **Effort:** 4 hours
- **Impact:** Misleading summary, affects budget planning accuracy

### 5. Shared Bill Deletion UX Improvement [MED-03]
- **Issue:** Deleting a shared bill has no warning about impact on other users
- **Fix:** Add confirmation dialog warning owner when deleting shared bills, implement soft delete
- **Effort:** 8 hours
- **Impact:** Prevents accidental data loss, better UX for shared bill users

### 6. Rate Limiting Implementation [MED-04]
- **Issue:** No protection against abuse (unlimited connection requests, bill creation spam)
- **Fix:** Database triggers (10 connections/hour, 20 bills/minute), Supabase API limits, client debouncing
- **Effort:** 6 hours
- **Impact:** Prevents abuse, improves system stability

### 7. Session Security Hardening [MED-02]
- **Issue:** Session cookies missing security flags in some configurations
- **Fix:** Verify and enforce Secure, SameSite, and timeout flags on all cookies
- **Effort:** 4 hours
- **Impact:** Reduces session hijacking risk

---

## Low Priority (Backlog)

### Security Enhancements
- Remove debug code from production (2 hours)
- Generic auth error messages (1 hour)
- Subresource Integrity (SRI) hashes for CDN resources (4 hours)
- Security headers in staticwebapp.config.json (6 hours)
- Enhanced password policy (3 hours)
- Database constraints (negative amounts, future dates) (4 hours)

### iOS App Development
- **Timeline:** 5-6 weeks for MVP (Phase 1)
- **Approach:** React Native + Expo (recommended)
- **Dependencies:**
  - Mobile web app fully functional (must fix bugs first)
  - Apple Developer Program enrollment ($99)
  - Expo account setup
  - React Native development environment
- **Deliverables:** TestFlight beta, 6 core screens, Supabase integration, offline mode
- **Phase 2 (3-4 weeks):** Plaid integration, push notifications, Face ID
- **Phase 3 (4-5 weeks):** AI categorization, widgets, Android app

### Automation Features
- Email integration (Gmail/Outlook bill parsing) — 20 hours
- Automated Discord reports (weekly/monthly summaries) — 8 hours
- Smart transaction categorization (OpenAI API) — 12 hours
- Scheduled budget generation (auto-create on 1st of month) — 4 hours

### UX Polish
- Loading spinners and states — 4 hours
- Empty state illustrations — 6 hours
- Better error messages — 3 hours
- Toast notifications instead of alerts — 4 hours
- Dashboard card grid optimization for mobile — 2 hours
- Responsive table column hiding (mobile) — 6 hours

---

## Blockers

### iOS App Blockers
1. **Assets page routing bug** — Must fix before iOS app can rely on same API/data
2. **Security vulnerabilities** — Cannot launch mobile app with XSS/CSRF issues
3. **Accessibility issues** — Native app should meet standards from day 1

### Security Remediation Blockers
- None identified — all fixes are independent and can proceed

### Automation Blockers
1. **Email API credentials** — Need Gmail/Outlook OAuth setup for email parsing
2. **Discord webhook setup** — Need channel webhooks configured for automated reports

---

## Recommendations

**Recommended Focus: Fix the Assets Page Bug FIRST (Priority #1)**

**Why:**
1. **Blocks all asset management** — Users cannot view, add, edit, or delete assets (critical functionality loss)
2. **Fast fix** — Likely 4-8 hours to diagnose and fix routing issue
3. **High user impact** — Affects every user trying to manage real estate, vehicles, valuables
4. **Prerequisite for iOS app** — Cannot build mobile app if core pages don't work
5. **Erodes trust** — Major bug visible to all users, hurts perception of app quality

**Immediate Action Plan (Next 24-48 Hours):**
1. ✅ **Hour 0-4:** Spawn Builder agent to fix Assets page routing (Priority #1)
2. ✅ **Hour 4-20:** Builder implements XSS remediation (Priority #2.1)
3. ✅ **Hour 20-32:** Builder implements CSRF protection (Priority #2.2)
4. ✅ **Hour 32-48:** Builder fixes critical accessibility issues (Priority #3)

**This Week (Days 3-7):**
- Fix monthly bills calculation (Priority #4)
- Implement shared bill deletion warnings (Priority #5)
- Add rate limiting (Priority #6)
- Harden session security (Priority #7)

**Next Phase (Week 2+):**
- Complete remaining security items from remediation roadmap
- Begin iOS app setup (environment, accounts, project init)
- Plan automation features (email parsing, Discord reports)

**Success Metrics:**
- ✅ All CRITICAL bugs fixed by end of Week 1
- ✅ Zero HIGH-severity security vulnerabilities by end of Week 1
- ✅ WCAG Level A compliance by end of Week 1
- ✅ All MEDIUM issues resolved by end of Week 2
- 🎯 iOS app TestFlight beta deployed by end of Week 6

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-01  
**Next Review:** After Priority #1 completion  
**Owner:** Capital (Orchestrator)
