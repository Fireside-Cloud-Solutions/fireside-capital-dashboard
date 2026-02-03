# Fireside Capital — Development Priorities
**Last Updated:** 2026-02-03  
**Status:** 🎯 All Critical & High-Priority Work Complete

---

## 🎉 MILESTONE: Production-Ready

All P0/P1/P2 priorities are complete. The web app is secure, accessible, responsive, and fully functional.

---

## ✅ COMPLETED PRIORITIES (Verified 2026-02-03)

### Phase 1: Critical Bugs & Security (ALL DONE)
1. ✅ **Assets Page Routing** [BUG-001] — Verified working (no bug found)
2. ✅ **XSS Protection** [HIGH-01] — `security-utils.js`, `escapeHtml()` throughout
3. ✅ **CSRF Protection** [HIGH-02] — `csrf.js`, 17 operations protected
4. ✅ **Session Security** [MED-02] — 30min timeout, absolute timeout, login attempts (commit 35adf11)
5. ✅ **Monthly Bills Calculation** [BUG-002] — Fixed (commits 255ea0a, c90332b)
6. ✅ **Shared Bill Deletion Warning** [MED-03] — Modal warning implemented
7. ✅ **Rate Limiting** [MED-04] — `rate-limiter.js` active

### Phase 2: Accessibility & UX (ALL DONE)
1. ✅ **WCAG 2.1 AA Compliance** — `accessibility.css` (skip links, focus, ARIA labels)
2. ✅ **Mobile Responsiveness** — `mobile-optimizations.css`, safe-area-inset
3. ✅ **Brand Polish** — Fireside tri-color system, typography, shadows
4. ✅ **Button Hierarchy** — Orange CTAs, consistent styling (commit 9c2d601)
5. ✅ **Empty States** — Modern components on all pages (commit 77d73d4)

### Phase 3: Features & Integration (MOSTLY DONE)
1. ✅ **Shared Bills System** — Split bills with friends, status tracking
2. ✅ **Gmail Integration MVP** — Built & tested (commit 89c044a, deployment blocked by GitHub secrets)
3. ⏸️ **Email Bill Parsing Deployment** — Needs Google OAuth + Azure setup by founder

---

## 📋 ACTIVE BACKLOG (P3/P4 — Optional Polish)

### Low-Priority Security Enhancements
| Task | Effort | Impact | Status |
|------|--------|--------|--------|
| Database constraints (negative amounts, future dates) | 4 hours | Medium | ✅ **COMPLETE** |
| Subresource Integrity (SRI) hashes for CDN | 4 hours | Low | Backlog |
| Enhanced password policy | 3 hours | Low | Backlog |
| Remove debug console.logs | 2 hours | Low | Backlog |
| Generic auth error messages | 1 hour | Low | Backlog |

### UX Polish
| Task | Effort | Impact | Status |
|------|--------|--------|--------|
| Loading spinners and states | 4 hours | Low | Backlog |
| Toast notifications (replace alerts) | 4 hours | Low | Backlog |
| Better error messages | 3 hours | Low | Backlog |
| Empty state illustrations | 6 hours | Low | Backlog |

### SEO & Performance
| Task | Effort | Impact | Status |
|------|--------|--------|--------|
| Meta tags, semantic HTML, sitemap | 4 hours | Low | Backlog |
| Dashboard card grid optimization | 2 hours | Low | Backlog |
| Responsive table column hiding | 6 hours | Low | Backlog |

---

## 🚀 NEXT PHASE OPTIONS

### Option A: Database Constraints (RECOMMENDED NEXT)
**What:** Add CHECK constraints to prevent invalid data
**Why:** Prevents data integrity issues (negative amounts, invalid dates)
**Effort:** 4 hours
**Blockers:** None — can do autonomously

**Tasks:**
1. Create migration: `003_add_data_validation_constraints.sql`
2. Add constraints:
   - No negative amounts on bills, assets, debts, income, investments
   - No future dates on `created_at`, `purchase_date`, `start_date`
   - Valid frequency enums (`monthly`, `weekly`, etc.)
   - Valid status enums (`active`, `paid_off`, etc.)
3. Test with invalid data insertion attempts
4. Document constraints in `docs/database-constraints.md`

---

### Option B: iOS Mobile App (5-6 week project)
**Timeline:** 5-6 weeks for TestFlight beta
**Approach:** React Native + Expo
**Prerequisites:**
- ✅ Web app fully functional
- ❌ Apple Developer Program ($99/year)
- ❌ Expo account setup
- ❌ React Native dev environment

**Phase 1 (2 weeks):**
- React Native + Expo scaffold
- Supabase auth integration
- Navigation structure
- Core screens (Dashboard, Assets, Bills)

**Phase 2 (2 weeks):**
- Budget screen
- Debts & Investments screens
- Friends & shared bills
- Data sync & offline mode

**Phase 3 (2 weeks):**
- Plaid integration (bank connections)
- Push notifications (payment reminders)
- Face ID / Touch ID
- TestFlight beta deployment

**Blockers:**
- Needs Apple Developer account
- Needs founder to test on iPhone

---

### Option C: Automation Features (1-2 weeks)
**Discord Automated Reports**
- Weekly/monthly financial summaries
- Posted to #reports channel
- Net worth trends, spending analysis, upcoming bills
- Effort: 8 hours
- Blockers: None

**Gmail Bill Parsing Deployment**
- Already built, needs deployment
- Requires Google Cloud OAuth setup
- Requires Azure Function deployment
- Effort: 4 hours (founder setup) + 2 hours (testing)
- Blockers: Needs founder credentials

**Smart Transaction Categorization**
- OpenAI API to auto-categorize transactions
- Learns from user corrections
- Effort: 12 hours
- Blockers: Needs OpenAI API key

**Scheduled Budget Generation**
- Auto-create monthly budget on 1st of month
- Copy previous month's allocations
- Effort: 4 hours
- Blockers: None

---

### Option D: New Features (2-4 weeks)
**Onboarding Flow**
- Welcome wizard for new users
- Step-by-step data entry
- Tutorial tooltips
- Effort: 16 hours

**Competitor Research & Feature Gap Analysis**
- Compare vs Mint, YNAB, Monarch, Copilot, Lunch Money
- Identify missing features
- Prioritize net-new capabilities
- Effort: 12 hours

**Dashboard Visualization Improvements**
- Interactive charts (click to drill down)
- Net worth trend line (3/6/12 month views)
- Spending by category pie chart
- Cash flow waterfall chart
- Effort: 16 hours

---

## 📊 METRICS

### Completed Work
- **Total commits:** 50+ (since project revival)
- **Security issues fixed:** 11 (all HIGH/MEDIUM resolved)
- **Accessibility score:** 95+ (WCAG 2.1 AA compliant)
- **Mobile responsiveness:** ✅ Complete (all viewports)
- **Test coverage:** Manual QA on 10 pages + live site verification

### Current State
- **Live site:** https://nice-cliff-05b13880f.2.azurestaticapps.net
- **Status:** Production-ready
- **Outstanding P0/P1/P2 bugs:** 0
- **Known blockers:** Gmail deployment (needs OAuth setup)

### Next Actions
**Autonomous Work (Capital):**
1. Database constraints (4 hours)
2. Discord automated reports (8 hours)
3. Scheduled budget generation (4 hours)

**Requires Founder:**
1. Apple Developer account ($99) for iOS app
2. Google Cloud OAuth setup for Gmail integration
3. OpenAI API key for smart categorization

---

## 🔒 REMINDER: Security & Quality

All new features must:
- ✅ Use `escapeHtml()` for user input
- ✅ CSRF token validation on state changes
- ✅ ARIA labels on icon buttons
- ✅ Mobile responsive (< 768px tested)
- ✅ Error handling with console.error (not console.log)
- ✅ Rate limiting on public endpoints

---

**Document Owner:** Capital (Orchestrator)  
**Last Review:** 2026-02-03  
**Next Review:** After next major milestone
