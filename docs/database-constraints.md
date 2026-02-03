# Database Constraints Documentation
**Fireside Capital — Data Validation**

Version: 1.0  
Date: 2026-02-03  
Migration: `003_add_data_validation_constraints.sql`

---

## Overview

This document describes the CHECK constraints added to the Fireside Capital database to prevent invalid data entry. These constraints provide **defense-in-depth** security by enforcing data integrity at the database level, even if client-side validation is bypassed.

---

## Constraint Categories

### 1. Amount Validation (No Negatives)

| Table | Column | Constraint | Reason |
|-------|--------|------------|--------|
| `bills` | `amount` | > 0 | Bills cannot have negative amounts |
| `assets` | `value` | >= 0 | Asset value can be $0 (fully depreciated) but not negative |
| `assets` | `loan_balance` | >= 0 | Loan balances cannot be negative |
| `investments` | `starting_balance` | >= 0 | Starting balance cannot be negative |
| `investments` | `monthly_contribution` | >= 0 | Contributions cannot be negative |
| `investments` | `annual_return` | -100 to 1000 | Return between -100% (total loss) and +1000% (extreme gain) |
| `debts` | `balance` | >= 0 | Debt balance cannot be negative |
| `debts` | `interest_rate` | 0 to 100 | Interest rate between 0% and 100% |
| `debts` | `monthly_payment` | > 0 | Monthly payment must be positive |
| `income` | `amount` | > 0 | Income cannot be negative |
| `budgets` | `amount` | >= 0 | Budget allocations cannot be negative |

**Note:** `snapshots.net_worth` does NOT have a constraint because negative net worth is a valid scenario (liabilities exceed assets).

### 2. Date Validation (No Future Dates)

| Table | Column | Constraint | Reason |
|-------|--------|------------|--------|
| `bills` | `created_at` | <= NOW() | Cannot create bills in the future |
| `assets` | `created_at` | <= NOW() | Cannot create assets in the future |
| `investments` | `created_at` | <= NOW() | Cannot create investments in the future |
| `debts` | `created_at` | <= NOW() | Cannot create debts in the future |
| `income` | `created_at` | <= NOW() | Cannot create income in the future |
| `snapshots` | `created_at` | <= NOW() | Cannot create snapshots in the future |

**Note:** `due_date` on bills does NOT have a constraint because bills can be due in the future.

### 3. Enum Validation (Valid Categories)

#### Bills
- **frequency:** `daily`, `weekly`, `bi-weekly`, `monthly`, `quarterly`, `semi-annual`, `annual`, `one-time`
- **type:** `Utilities`, `Rent/Mortgage`, `Insurance`, `Subscriptions`, `Phone/Internet`, `Transportation`, `Healthcare`, `Education`, `Childcare`, `Pet Care`, `Loans`, `Credit Cards`, `Taxes`, `Entertainment`, `Memberships`, `Home Maintenance`, `Auto Financing`, `Other`

#### Assets
- **type:** `Real Estate`, `Vehicle`, `Electronics`, `Jewelry`, `Art`, `Collectibles`, `Other`

#### Investments
- **type:** `401k`, `IRA`, `Roth IRA`, `Brokerage`, `Savings`, `CD`, `Crypto`, `Real Estate`, `HSA`, `529 Plan`, `Pension`, `Stock Options`, `Other`

#### Debts
- **type:** `Mortgage`, `Auto Loan`, `Student Loan`, `Personal Loan`, `Credit Card`, `Medical Debt`, `HELOC`, `Other`

#### Income
- **frequency:** `hourly`, `daily`, `weekly`, `bi-weekly`, `semi-monthly`, `monthly`, `quarterly`, `annual`, `one-time`
- **type:** `W2 Salary`, `1099 Contract`, `Freelance`, `Business Income`, `Investment Income`, `Rental Income`, `Dividends`, `Interest`, `Capital Gains`, `Social Security`, `Pension`, `Alimony`, `Child Support`, `Gift`, `Other`

---

## Constraints NOT Applied (And Why)

### 1. Assets: `loan_balance <= value`
**Why skipped:** Negative equity is a real scenario (e.g., underwater mortgage where you owe $300k on a house worth $250k).

### 2. Bills: `owner_amount + shared_amount = amount`
**Why skipped:** Enforced at application level to allow for rounding differences.

### 3. Debts: `monthly_payment <= balance`
**Why skipped:** Final payment can be larger than remaining balance.

---

## How to Apply

### Prerequisites
1. Backup the database before applying constraints
2. Verify no existing data violates constraints (run verification queries below)

### Apply Migration
```bash
# Option 1: Supabase SQL Editor
# Copy the contents of migrations/003_add_data_validation_constraints.sql
# Paste into Supabase SQL Editor (https://supabase.com/dashboard/project/YOUR_PROJECT/editor)
# Click "RUN"

# Option 2: psql CLI
psql "postgresql://postgres:[YOUR-PASSWORD]@db.qqtiofdqplwycnwplmen.supabase.co:5432/postgres" \
  -f migrations/003_add_data_validation_constraints.sql
```

### Verification Queries
Run these queries to check for existing data that would violate constraints:

```sql
-- Check for bills with negative amounts
SELECT 'Bills with negative amounts' AS issue, COUNT(*) AS count 
FROM bills WHERE amount < 0

UNION ALL

-- Check for assets with negative values
SELECT 'Assets with negative values', COUNT(*) 
FROM assets WHERE value < 0

UNION ALL

-- Check for investments with invalid annual_return
SELECT 'Investments with invalid annual_return', COUNT(*) 
FROM investments WHERE annual_return < -100 OR annual_return > 1000

UNION ALL

-- Check for bills with invalid frequency
SELECT 'Bills with invalid frequency', COUNT(*) 
FROM bills 
WHERE frequency NOT IN ('daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'semi-annual', 'annual', 'one-time')

UNION ALL

-- Check for future created_at dates
SELECT 'Bills with future created_at', COUNT(*) 
FROM bills WHERE created_at > NOW();
```

If any query returns `count > 0`, clean the data before applying constraints.

---

## Error Handling

When a constraint is violated, PostgreSQL returns an error:

### Example Error
```
ERROR:  new row for relation "bills" violates check constraint "bills_amount_positive"
DETAIL:  Failing row contains (abc123, user-id, Test Bill, -100.00, monthly, Utilities, 2026-03-01, ...).
```

### Client-Side Handling
```javascript
try {
  const { data, error } = await sb.from('bills').insert({ amount: -100, ... });
  
  if (error) {
    if (error.message.includes('bills_amount_positive')) {
      alert('Bill amount must be positive.');
    } else if (error.message.includes('bills_frequency_valid')) {
      alert('Invalid bill frequency.');
    } else {
      alert('Database error: ' + error.message);
    }
  }
} catch (err) {
  console.error('Unexpected error:', err);
}
```

---

## Maintenance

### Adding New Constraint
1. Create a new migration file (e.g., `004_add_new_constraint.sql`)
2. Use explicit constraint names: `ALTER TABLE table_name ADD CONSTRAINT constraint_name CHECK (condition);`
3. Test with invalid data
4. Document in this file
5. Apply to Supabase

### Removing Constraint
```sql
ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_amount_positive;
```

### Temporarily Disabling Constraints
**Warning:** This is dangerous and should only be used for emergency data fixes.

```sql
-- Disable constraint validation (PostgreSQL)
-- NOTE: This is not possible in most managed databases like Supabase
-- Instead, drop the constraint, fix data, then re-add it
```

---

## Security Benefits

1. **Defense-in-depth:** Even if client-side validation is bypassed (e.g., via direct API calls), the database rejects invalid data
2. **Data integrity:** Prevents application bugs from corrupting the database
3. **Audit trail:** Constraint violations are logged, helping identify security issues
4. **Performance:** CHECK constraints are faster than triggers for simple validations

---

## Testing

### Test Case 1: Negative Amount
```sql
-- Should FAIL
INSERT INTO bills (user_id, name, amount, frequency, type, due_date) 
VALUES ('test-user-id', 'Test Negative', -100, 'monthly', 'Utilities', '2026-03-01');
```

### Test Case 2: Future created_at
```sql
-- Should FAIL
INSERT INTO bills (user_id, name, amount, frequency, type, due_date, created_at)
VALUES ('test-user-id', 'Test Future', 100, 'monthly', 'Utilities', '2026-03-01', '2027-01-01');
```

### Test Case 3: Invalid Frequency
```sql
-- Should FAIL
INSERT INTO bills (user_id, name, amount, frequency, type, due_date)
VALUES ('test-user-id', 'Test Invalid', 100, 'sometimes', 'Utilities', '2026-03-01');
```

### Test Case 4: Valid Data
```sql
-- Should SUCCEED
INSERT INTO bills (user_id, name, amount, frequency, type, due_date)
VALUES ('test-user-id', 'Electric Bill', 100, 'monthly', 'Utilities', '2026-03-01');
```

---

## Related Documentation

- [Row Level Security (RLS) Configuration](../migrations/RLS-SECURITY-TEST-REPORT.md)
- [Security Audit Results](../reports/SECURITY-AUDIT-RESULTS.md)
- [Database Schema](./ARCHITECTURE.md)

---

**Last Updated:** 2026-02-03  
**Migration Version:** 003  
**Owner:** Capital (Orchestrator)
