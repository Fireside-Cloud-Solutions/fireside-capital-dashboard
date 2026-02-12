# UI/UX Audit — Investments Page (investments.html)
**Auditor:** Capital (QA Sprint)  
**Date:** 2026-02-12 05:40 AM EST  
**Session:** SPRINT QA — Cron 013cc4e7

## 📋 AUDIT SUMMARY

**Status:** ⚠️ GOOD — PRODUCTION-READY WITH GAPS  
**Issues:** 1 P0, 4 P1, 6 P2, 3 P3 = **14 total**  
**Grade:** B+ (87/100)

## 🔴 P0 ISSUES (1)
1. **ARCH-INVESTMENTS-001:** All investments logic embedded in monolithic app.js (6h)

## 🟠 P1 ISSUES (4)
1. **UX-INVESTMENTS-001:** No HTML empty state markup (2h)
2. **UX-INVESTMENTS-002:** No loading skeleton states (3h)
3. **FEAT-INVESTMENTS-001:** No total investments summary cards (Total Value, Total Contributions, Total Returns, ROI%) (2h)
4. **FEAT-INVESTMENTS-002:** No investment allocation pie chart (401k vs IRA vs Brokerage vs Crypto) (4h)

## 🟡 P2 ISSUES (6)
1. **UX-INVESTMENTS-003:** No "Last Updated" timestamp (1h)
2. **FORM-INVESTMENTS-001:** No inline form validation (3h)
3. **FEAT-INVESTMENTS-003:** No filter by account type (401k/IRA/Brokerage/Crypto) (2h)
4. **FEAT-INVESTMENTS-004:** No export to CSV (2h)
5. **UX-INVESTMENTS-004:** No ROI color coding (positive=green, negative=red) (1h)
6. **FEAT-INVESTMENTS-005:** No historical performance chart (investment value over time) (4h)

## 🔵 P3 ISSUES (3)
1. **POLISH-INVESTMENTS-001:** Modal title doesn't change for edit mode (0.5h)
2. **POLISH-INVESTMENTS-002:** No hover effect on table rows (0.5h)
3. **POLISH-INVESTMENTS-003:** No account type icons in Type column (1h)

## 📊 SUMMARY
**Total Effort:** 34 hours (~0.85 weeks)  
**Architecture:** Same monolithic app.js issue  
**Missing:** Empty states, loading skeletons, summary cards, allocation pie chart  
**Opportunity:** Investment performance tracking with historical chart (similar to Dashboard Net Worth Timeline)

**Last Updated:** 2026-02-12 05:40 AM EST  
**Next:** Reports page audit
