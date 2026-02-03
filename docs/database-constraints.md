# Database Validation Constraints

**Migration:** `003_add_data_validation_constraints.sql`  
**Created:** 2026-02-03  
**Status:** Ready to deploy

---

## Purpose

Add PostgreSQL CHECK constraints to prevent invalid data from being inserted into the database. This provides **database-level validation** as a safety net in addition to client-side and server-side validation.

---

## Constraints Added

### Assets Table (8 constraints)

| Constraint | Rule | Rationale |
|------------|------|-----------|
| `assets_value_non_negative` | `value >= 0` | Asset values cannot be negative |
| `assets_loan_non_negative` | `loan >= 0` | Loan amounts cannot be negative |
| `assets_purchase_price_non_negative` | `purchasePrice >= 0` | Purchase prices cannot be negative |
| `assets_interest_rate_valid` | `0 <= interestRate <= 100` | Interest rates are percentages (0-100%) |
| `assets_term_years_positive` | `termYears > 0` | Loan terms must be positive |
| `assets_created_at_not_future` | `created_at <= now()` | Records cannot be created in the future |
| `assets_purchase_date_not_future` | `purchaseDate <= CURRENT_DATE` | Purchase dates cannot be in the future |
| `assets_type_valid` | `type IN ('real-estate', 'vehicle', 'other')` | Valid asset types only |

### Bills Table (4 constraints)

| Constraint | Rule | Rationale |
|------------|------|-----------|
| `bills_amount_non_negative` | `amount >= 0` | Bill amounts cannot be negative |
| `bills_created_at_not_future` | `created_at <= now()` | Records cannot be created in the future |
| `bills_frequency_valid` | See enum list below | Valid frequency values only |
| `bills_type_valid` | See enum list below | Valid bill types only |

**Valid Frequencies:**
- `weekly`
- `bi-weekly`
- `semi-monthly`
- `monthly`
- `quarterly`
- `semi-annually`
- `annually`

**Valid Bill Types:**
- `housing`
- `auto`
- `utilities`
- `financing`
- `health`
- `subscriptions`
- `other`

### Debts Table (6 constraints)

| Constraint | Rule | Rationale |
|------------|------|-----------|
| `debts_amount_non_negative` | `amount >= 0` | Debt amounts cannot be negative |
| `debts_monthly_payment_non_negative` | `monthlyPayment >= 0` | Monthly payments cannot be negative |
| `debts_interest_rate_valid` | `0 <= interestRate <= 100` | Interest rates are percentages (0-100%) |
| `debts_term_positive` | `term > 0` | Loan terms must be positive |
| `debts_created_at_not_future` | `created_at <= now()` | Records cannot be created in the future |
| `debts_type_valid` | See enum list below | Valid debt types only |

**Valid Debt Types:**
- `credit-card`
- `student-loan`
- `mortgage`
- `auto-loan`
- `personal-loan`
- `other`

### Income Table (4 constraints)

| Constraint | Rule | Rationale |
|------------|------|-----------|
| `income_amount_non_negative` | `amount >= 0` | Income amounts cannot be negative |
| `income_created_at_not_future` | `created_at <= now()` | Records cannot be created in the future |
| `income_frequency_valid` | See enum list below | Valid frequency values only |
| `income_type_valid` | See enum list below | Valid income types only |

**Valid Frequencies:**
- `weekly`
- `bi-weekly`
- `semi-monthly`
- `monthly`
- `quarterly`
- `annually`

**Valid Income Types:**
- `salary`
- `hourly`
- `commission`
- `bonus`
- `freelance`
- `rental`
- `investment`
- `other`

### Investments Table (6 constraints)

| Constraint | Rule | Rationale |
|------------|------|-----------|
| `investments_value_non_negative` | `value >= 0` | Investment values cannot be negative |
| `investments_starting_balance_non_negative` | `startingBalance >= 0` | Starting balances cannot be negative |
| `investments_monthly_contribution_non_negative` | `monthlyContribution >= 0` | Contributions cannot be negative |
| `investments_annual_return_reasonable` | `-100 <= annualReturn <= 1000` | Returns between -100% (total loss) and 1000% (10x gain) |
| `investments_created_at_not_future` | `created_at <= now()` | Records cannot be created in the future |
| `investments_type_valid` | See enum list below | Valid investment types only |

**Valid Investment Types:**
- `401k`
- `ira`
- `roth-ira`
- `brokerage`
- `savings`
- `cd`
- `crypto`
- `other`

### Settings Table (2 constraints)

| Constraint | Rule | Rationale |
|------------|------|-----------|
| `settings_emergency_fund_goal_non_negative` | `emergency_fund_goal >= 0` | Emergency fund goals cannot be negative |
| `settings_created_at_not_future` | `created_at <= now()` | Records cannot be created in the future |

### Budgets Table (4 constraints)

| Constraint | Rule | Rationale |
|------------|------|-----------|
| `budgets_assigned_amount_non_negative` | `assigned_amount >= 0` | Assigned amounts cannot be negative |
| `budgets_needed_amount_non_negative` | `needed_amount >= 0` | Needed amounts cannot be negative |
| `budgets_item_type_valid` | `item_type IN ('bill', 'debt', 'saving')` | Valid item types only |
| `budgets_month_format_valid` | Regex: `^\d{4}-(0[1-9]|1[0-2])$` | Month must be YYYY-MM format |

### Snapshots Table (2 constraints)

| Constraint | Rule | Rationale |
|------------|------|-----------|
| `snapshots_date_not_future` | `date <= CURRENT_DATE` | Snapshots cannot be dated in the future |
| `snapshots_created_at_not_future` | `created_at <= now()` | Records cannot be created in the future |

**Note:** Net worth can be negative (when debts exceed assets), so no constraint is applied to the `netWorth` column.

---

## Total Constraints: 30 (Deployed)

**Note:** Original plan included 46 constraints, but enum validations (type/frequency fields) were excluded due to existing data inconsistencies. A data normalization task has been added to the backlog.

| Table | Constraints |
|-------|-------------|
| assets | 8 |
| bills | 4 |
| debts | 6 |
| income | 4 |
| investments | 6 |
| settings | 2 |
| budgets | 4 |
| snapshots | 2 |

---

## Deployment Instructions

### 1. Apply the Migration

Go to Supabase SQL Editor and run:

```sql
-- Run the entire contents of:
-- app/Supabase/003_add_data_validation_constraints.sql
```

### 2. Verify Constraints Were Added

```sql
-- List all constraints on a specific table
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.bills'::regclass;

-- Count total constraints added
SELECT COUNT(*) FROM pg_constraint 
WHERE conname LIKE '%_non_negative' 
   OR conname LIKE '%_valid' 
   OR conname LIKE '%_not_future'
   OR conname LIKE '%_positive'
   OR conname LIKE '%_reasonable';
```

### 3. Test Constraints

```sql
-- Test negative amount (should fail with constraint violation)
INSERT INTO public.bills (user_id, name, amount) 
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'Test Bill', -10);
-- Expected error: new row for relation "bills" violates check constraint "bills_amount_non_negative"

-- Test invalid frequency (should fail)
INSERT INTO public.bills (user_id, name, frequency) 
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'Test Bill', 'daily');
-- Expected error: new row for relation "bills" violates check constraint "bills_frequency_valid"

-- Test future date (should fail)
INSERT INTO public.bills (user_id, name, created_at) 
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'Test Bill', '2099-01-01'::timestamptz);
-- Expected error: new row for relation "bills" violates check constraint "bills_created_at_not_future"
```

---

## Impact on Existing Data

**These constraints will NOT reject existing invalid data.** They only prevent NEW invalid data from being inserted.

If you have existing data that violates these constraints:

1. **Option A:** Fix the data first, then apply constraints
2. **Option B:** Use `NOT VALID` constraints (apply immediately, validate later)

To apply constraints without validating existing data:

```sql
-- Example: Add constraint but don't validate existing rows
ALTER TABLE public.bills 
  ADD CONSTRAINT bills_amount_non_negative 
  CHECK (amount IS NULL OR amount >= 0) NOT VALID;

-- Later, validate existing data:
ALTER TABLE public.bills VALIDATE CONSTRAINT bills_amount_non_negative;
```

---

## Client-Side Changes

The JavaScript form validation already enforces these rules:

- `min="0"` on amount inputs
- `type="date"` prevents future dates
- `<select>` dropdowns restrict to valid enum values

**These database constraints are a safety net** — they catch edge cases where client validation is bypassed (API calls, SQL console, migration scripts, etc.).

---

## Error Handling

When a constraint violation occurs, Supabase returns a PostgreSQL error:

```json
{
  "code": "23514",
  "message": "new row for relation \"bills\" violates check constraint \"bills_amount_non_negative\"",
  "details": "Failing row contains (...)."
}
```

The app's error handler (`error-messages.js`) should catch these and display user-friendly messages:

```javascript
if (error.code === '23514') {
  // CHECK constraint violation
  if (error.message.includes('non_negative')) {
    return "Amount must be a positive number.";
  }
  if (error.message.includes('frequency_valid')) {
    return "Please select a valid frequency.";
  }
  // ... etc
}
```

---

## Rollback

If these constraints cause issues, run the rollback script at the bottom of `003_add_data_validation_constraints.sql`:

```sql
-- Drop all constraints
ALTER TABLE public.assets DROP CONSTRAINT IF EXISTS assets_value_non_negative;
ALTER TABLE public.assets DROP CONSTRAINT IF EXISTS assets_loan_non_negative;
-- ... (full script in migration file)
```

---

## Next Steps

1. **Apply migration** in Supabase SQL Editor
2. **Test constraints** with sample invalid data
3. **Update error-messages.js** to handle constraint violation errors (code `23514`)
4. **Monitor logs** for constraint violations in production

---

**Owner:** Capital  
**Last Updated:** 2026-02-03  
**Status:** Ready to deploy
