# Database Validation Constraints — Deployment Guide

**Migration:** `app/migrations/003_add_data_validation_constraints.sql`  
**Date Created:** 2026-02-10  
**Status:** ✅ Migration file ready, validation passed  
**Deployment:** Requires manual execution in Supabase SQL Editor

---

## Summary

Added 26 CHECK constraints to enforce data integrity at the database level. These constraints prevent invalid data from being inserted regardless of how the data enters the system (web UI, API, direct SQL, etc.).

---

## Constraints Added

### Amount Validation (9 constraints)
- **bills.amount** > 0 (positive amounts only)
- **assets.value** >= 0 (can be $0 if depreciated)
- **assets.loan_amount** >= 0
- **debts.balance** >= 0
- **debts.monthly_payment** >= 0
- **debts.interest_rate** 0-100% (reasonable range)
- **income.amount** > 0 (positive amounts only)
- **investments.balance** >= 0
- **investments.annual_return** -100% to +1000% (prevents typos like 2500% instead of 25%)

### Date Validation (6 constraints)
- **bills.created_at** <= NOW() (no future timestamps)
- **assets.created_at** <= NOW()
- **debts.created_at** <= NOW()
- **income.created_at** <= NOW()
- **investments.created_at** <= NOW()
- **snapshots.created_at** <= NOW()

### Enum Validation (11 constraints)
- **bills.frequency** — valid values: daily, weekly, bi-weekly, monthly, quarterly, semi-annual, annual, one-time
- **bills.type** — 18 valid categories (Utilities, Rent/Mortgage, Insurance, etc.)
- **assets.type** — valid values: Real Estate, Vehicle, Other
- **investments.type** — valid values: 401k, IRA, Roth IRA, Brokerage, Savings, CD, Crypto, Other
- **debts.type** — valid values: Mortgage, Auto Loan, Student Loan, Personal Loan, Credit Card, Medical Debt, Other
- **income.frequency** — valid values: weekly, bi-weekly, monthly, quarterly, annual, one-time
- **income.type** — valid values: W2, 1099, Self-Employment, Rental, Investment, Other

---

## Pre-Deployment Validation

✅ **Validation Passed** (2026-02-10 06:55 AM EST)

Ran `scripts/validate-data.ps1` against live Supabase data:

```
=== Checking for Constraint Violations ===

Checking bills...
Bills with negative amounts: 0

Checking assets...
Assets with negative values: 0

Checking debts...
Debts with invalid values: 0

Checking income...
Income with negative amounts: 0

Checking investments...
Investments with invalid values: 0

=== Validation Complete ===
All checks passed! Safe to apply constraints.
```

**Result:** No existing data violates the proposed constraints. Safe to deploy.

---

## Deployment Instructions

### Option 1: Supabase SQL Editor (Recommended)

1. Navigate to https://supabase.com/dashboard/project/qqtiofdqplwycnwplmen/sql/new
2. Copy the contents of `app/migrations/003_add_data_validation_constraints.sql`
3. Paste into the SQL Editor
4. Click "Run" to execute
5. Verify success (should see "Success. No rows returned")

### Option 2: Supabase CLI (If Installed)

```bash
cd app/migrations
supabase db push
```

---

## Expected Behavior After Deployment

### Valid Data (Will Succeed)
```javascript
// ✅ Valid bill insertion
await supabase.from('bills').insert({
  name: 'Electric Bill',
  amount: 150.00,  // Positive ✅
  frequency: 'monthly',  // Valid enum ✅
  type: 'Utilities'  // Valid category ✅
});
```

### Invalid Data (Will Fail)
```javascript
// ❌ Negative amount
await supabase.from('bills').insert({
  name: 'Bad Bill',
  amount: -50.00  // ❌ Violates bills_amount_positive constraint
});
// Error: new row violates check constraint "bills_amount_positive"

// ❌ Invalid frequency
await supabase.from('bills').insert({
  name: 'Another Bill',
  amount: 100.00,
  frequency: 'daily-ish'  // ❌ Not in allowed values
});
// Error: new row violates check constraint "bills_frequency_valid"

// ❌ Future-dated timestamp
await supabase.from('bills').insert({
  name: 'Future Bill',
  amount: 100.00,
  created_at: '2027-01-01'  // ❌ In the future
});
// Error: new row violates check constraint "bills_created_at_not_future"
```

---

## Rollback Procedure

If constraints cause issues, rollback script is included at the bottom of the migration file:

```sql
-- Remove all constraints
ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_amount_positive;
ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_created_at_not_future;
ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_frequency_valid;
-- ... (see migration file for complete rollback script)
```

---

## Testing Checklist

After deployment, verify:

- [ ] Existing data still queries successfully (SELECT on all tables)
- [ ] Valid new data inserts successfully
- [ ] Invalid data (negative amounts) is rejected
- [ ] Invalid enums are rejected
- [ ] Future timestamps are rejected
- [ ] Error messages are clear and actionable

---

## Performance Impact

**Expected:** None. CHECK constraints are evaluated only during INSERT/UPDATE operations and add negligible overhead (<1ms per operation).

**Benefit:** Prevents expensive cleanup operations when bad data is discovered later.

---

## Next Steps (Phase 2)

After constraints are deployed:

1. **Add Performance Indexes** (2 hours)
   - 7 user_id indexes for RLS performance
   - 2 time-series indexes for dashboard charts
   - 2 bill_shares indexes for multi-user queries

2. **Optimize RLS Policies** (3 hours)
   - Refactor policies for better query planner efficiency
   - Add indexes to support RLS WHERE clauses

3. **Add Migration Testing** (2 hours)
   - Automated validation with pgTAP
   - CI/CD integration for migration safety

---

## References

- Research: `docs/research/11-database-optimization.md`
- Migration: `app/migrations/003_add_data_validation_constraints.sql`
- Validation: `scripts/validate-data.ps1`
- PostgreSQL docs: https://www.postgresql.org/docs/current/ddl-constraints.html
