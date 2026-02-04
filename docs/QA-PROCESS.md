# QA Process — Fireside Capital

**Last Updated:** February 3, 2026

## Overview
Systematic QA process for the Fireside Capital dashboard to ensure production quality.

## QA Checklist

### 1. Git History Review
- [ ] Check commits since last QA run
- [ ] Identify recent changes that need testing
- [ ] Note any rollbacks or reverts

### 2. HTML Pages (All 11)
- [ ] Button hierarchy (max 1 primary orange per view)
- [ ] Empty states present and styled
- [ ] Forms have proper validation
- [ ] Modals properly sized
- [ ] Safe-area-inset for iOS notch support
- [ ] No duplicate class attributes
- [ ] No broken asset links

### 3. CSS Quality
- [ ] No duplicate class definitions
- [ ] No conflicting rules
- [ ] Design tokens properly used
- [ ] Responsive breakpoints consistent
- [ ] Light/dark mode both supported
- [ ] No excessive !important usage

### 4. Accessibility (WCAG 2.1 AA)
- [ ] Touch targets ≥ 44×44px (mobile)
- [ ] Form inputs ≥ 16px (prevents iOS zoom)
- [ ] Skip links present
- [ ] ARIA labels on icon-only buttons
- [ ] Focus states visible
- [ ] Color contrast meets AA standard

### 5. Mobile Responsiveness
- [ ] Safe-area-inset on all pages
- [ ] Touch targets 44px minimum
- [ ] Text 16px minimum (form inputs)
- [ ] Hamburger menu smooth
- [ ] Tables scroll horizontally
- [ ] Charts stack properly

### 6. Code Quality
- [ ] Console statements removed (production)
- [ ] TODO comments tracked
- [ ] No security vulnerabilities
- [ ] Error handling consistent
- [ ] Toast notifications used (not alerts)

### 7. Cross-Browser Testing
- [ ] Chrome (primary)
- [ ] Safari (iOS compatibility)
- [ ] Firefox
- [ ] Edge

---

## QA Session Template

### Pre-Audit
1. Read `DIRECTIVE.md`, `STATUS.md`, `BACKLOG.md`
2. Check git log since last audit
3. Review previous QA reports in `reports/`

### During Audit
1. Test systematically (use checklist above)
2. Document findings in real-time
3. Take screenshots of visual bugs
4. File issues with clear reproduction steps

### Post-Audit
1. Generate comprehensive report (`reports/QA-SPRINT-REPORT-YYYY-MM-DD-HHMM.md`)
2. File individual bug reports (`reports/ISSUE-XXX.md`)
3. Add bugs to `BACKLOG.md` with FC-XXX IDs
4. Update `STATUS.md` with QA grade
5. Post summary to Discord #dashboard
6. Write session log to `memory/YYYY-MM-DD-qa.md`

---

## Issue Template

```markdown
# ISSUE-XXX — [Brief Title]

**Severity:** 🔴 CRITICAL | 🟠 HIGH | 🟡 MEDIUM | 🟢 LOW  
**Filed:** [Date & Time]  
**Status:** OPEN | IN PROGRESS | RESOLVED  

## Summary
[One-line description]

## Current Behavior
[What's happening now]

## Expected Behavior
[What should happen]

## Reproduction Steps
1. [Step 1]
2. [Step 2]
3. [Observe issue]

## Affected Files
- `path/to/file1.html` (line X)
- `path/to/file2.css` (line Y)

## Recommended Fix
[Specific code changes or approach]

## Effort
- **Time:** [estimate]
- **Risk:** Low | Medium | High
- **Assignee:** Builder | Auditor | Capital

---

**Related Backlog Item:** FC-XXX
```

---

## QA Grades

| Grade | Criteria |
|-------|----------|
| A | No critical/high bugs, < 3 medium bugs, production ready |
| B+ | No critical bugs, < 5 medium bugs, minor polish needed |
| B | No critical bugs, < 10 medium bugs, some work needed |
| B- | 1 critical bug OR many medium bugs, significant work needed |
| C | Multiple critical bugs, not production ready |
| F | Blocking bugs, cannot deploy |

---

## Reports Archive

All QA reports stored in `reports/` with naming convention:
- Sprint reports: `QA-SPRINT-REPORT-YYYY-MM-DD-HHMM.md`
- Bug reports: `ISSUE-XXX.md`
- Audit reports: `AUDIT-[type]-YYYY-MM-DD.md`

---

## Automated QA (Future)

### Potential Tools
- **Lighthouse:** Performance, accessibility, SEO scores
- **Axe DevTools:** WCAG compliance automated checks
- **Playwright:** E2E testing automation
- **CSS Lint:** Static analysis for CSS quality
- **ESLint:** JavaScript code quality

### Not Yet Implemented
Manual QA currently sufficient for project size. Automate when team scales.

---

**Process Owner:** Capital (QA Bot)  
**Last QA:** February 3, 2026 (Grade B+)  
**Next QA:** After FC-027 resolved or in 24 hours
