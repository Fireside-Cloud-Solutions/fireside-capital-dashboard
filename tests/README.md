# Fireside Capital - Test Suite

This directory contains comprehensive test coverage for the Fireside Capital dashboard, including automated mathematical validation tests and manual testing procedures.

## Files

### 1. `math-validation.test.js`
Automated test suite validating all financial calculations across the dashboard.

**Run with:**
```bash
cd app
npm test
```

**Coverage:**
- ✅ Amortization calculations (19 tests)
- ✅ Budget calculations (8 tests)
- ✅ Net worth calculations (5 tests)
- ✅ Income vs expenses (4 tests)
- ✅ Shared bill split math (8 tests)
- ✅ Data integrity & edge cases (10 tests)
- ✅ Financing info calculations (4 tests)

**Total:** 58 tests

### 2. `manual-test-plan.md`
Step-by-step manual testing instructions for all 8 pages of the dashboard.

**Includes:**
- Test Suite 1: Dashboard Page (index.html)
- Test Suite 2: Assets Page (assets.html)
- Test Suite 3: Investments Page (investments.html)
- Test Suite 4: Debts Page (debts.html)
- Test Suite 5: Bills Page (bills.html)
- Test Suite 6: Income Page (income.html)
- Test Suite 7: Budget Page (budget.html)
- Test Suite 8: Reports Page (reports.html)
- Test Suite 9: Settings Page (settings.html)
- Test Suite 10: Authentication & Security
- Test Suite 11: Data Isolation & Row-Level Security
- Test Suite 12: Edge Cases & Error Handling
- Test Suite 13: Theme Toggle
- Test Suite 14: Responsive Design (Mobile)

### 3. `../qa-comprehensive-report.md` (root directory)
Full audit report with findings, security analysis, and recommendations.

**Sections:**
1. Mathematical Validation Results
2. Security Audit
3. Bug Report
4. Data Integrity Validation
5. Performance Analysis
6. Accessibility (WCAG AA)
7. Browser Compatibility
8. Recommendations Summary
9. Test Execution Log
10. Sign-Off

## Quick Start

### Run Automated Tests
```bash
cd app
npm test
```

**Expected Output:**
```
✅ Passed: 58
❌ Failed: 0
Success Rate: 100.00%

🎉 All tests passed! The financial calculations are accurate.
```

### Run Manual Tests
1. Open `tests/manual-test-plan.md`
2. Follow step-by-step instructions for each page
3. Document results using the bug reporting template

## Test Results Summary

### Automated Tests: ✅ 100% PASS
- All 58 mathematical validation tests passed
- Zero tolerance for calculation errors in financial apps

### Manual Tests: 🟡 IN PROGRESS
- Documented procedures ready for execution
- Interactive testing required for UI/UX validation

### Security Audit: 🔴 CRITICAL ISSUES FOUND
- CRIT-02: XSS vulnerability (input sanitization needed)
- MED-01: No rate limiting on database queries
- See `qa-comprehensive-report.md` for full details

## Contributing

When adding new features:
1. Write corresponding test cases in `math-validation.test.js`
2. Update `manual-test-plan.md` with new test scenarios
3. Run `npm test` to verify all tests still pass
4. Update this README if new test files are added

## Standards

- **Financial Accuracy:** Zero tolerance for rounding errors > $0.01
- **Test Coverage:** All calculation functions must have automated tests
- **Manual Testing:** All user flows must have documented test plans
- **Security:** All user input must be sanitized (escapeHtml)

## Contact

For questions about testing procedures, contact the Auditor agent or review the main project documentation in the root directory.

---

**Last Updated:** February 1, 2026  
**Test Suite Version:** 1.0.0  
**Application Version:** 1.0.0
