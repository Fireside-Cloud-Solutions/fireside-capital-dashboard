-- ===================================================================
-- Fireside Capital — Data Validation Constraints
-- Version: 003
-- Date: 2026-02-03
-- Purpose: Prevent invalid data entry (negative amounts, future dates, invalid enums)
-- ===================================================================

-- ====================================
-- 1. AMOUNT VALIDATION (No Negatives)
-- ====================================

-- Bills: amount must be positive
ALTER TABLE bills
ADD CONSTRAINT bills_amount_positive CHECK (amount > 0);

-- Assets: value must be positive or zero (can be $0 if fully depreciated)
ALTER TABLE assets
ADD CONSTRAINT assets_value_nonnegative CHECK (value >= 0);

-- Assets: loan_balance must be positive or zero
ALTER TABLE assets
ADD CONSTRAINT assets_loan_balance_nonnegative CHECK (loan_balance >= 0);

-- Investments: starting_balance must be positive or zero
ALTER TABLE investments
ADD CONSTRAINT investments_starting_balance_nonnegative CHECK (starting_balance >= 0);

-- Investments: monthly_contribution must be positive or zero
ALTER TABLE investments
ADD CONSTRAINT investments_monthly_contribution_nonnegative CHECK (monthly_contribution >= 0);

-- Investments: annual_return must be between -100% and +1000% (reasonable bounds)
ALTER TABLE investments
ADD CONSTRAINT investments_annual_return_reasonable CHECK (annual_return >= -100 AND annual_return <= 1000);

-- Debts: balance must be positive or zero
ALTER TABLE debts
ADD CONSTRAINT debts_balance_nonnegative CHECK (balance >= 0);

-- Debts: interest_rate must be between 0% and 100%
ALTER TABLE debts
ADD CONSTRAINT debts_interest_rate_reasonable CHECK (interest_rate >= 0 AND interest_rate <= 100);

-- Debts: monthly_payment must be positive
ALTER TABLE debts
ADD CONSTRAINT debts_monthly_payment_positive CHECK (monthly_payment > 0);

-- Income: amount must be positive
ALTER TABLE income
ADD CONSTRAINT income_amount_positive CHECK (amount > 0);

-- Budgets: amount must be positive or zero
ALTER TABLE budgets
ADD CONSTRAINT budgets_amount_nonnegative CHECK (amount >= 0);

-- Snapshots: net_worth can be negative (allow for negative net worth scenarios)
-- No constraint needed for net_worth

-- ====================================
-- 2. DATE VALIDATION (No Future Dates Where Inappropriate)
-- ====================================

-- Bills: created_at cannot be in the future
ALTER TABLE bills
ADD CONSTRAINT bills_created_at_not_future CHECK (created_at <= NOW());

-- Assets: created_at cannot be in the future
ALTER TABLE assets
ADD CONSTRAINT assets_created_at_not_future CHECK (created_at <= NOW());

-- Investments: created_at cannot be in the future
ALTER TABLE investments
ADD CONSTRAINT investments_created_at_not_future CHECK (created_at <= NOW());

-- Debts: created_at cannot be in the future
ALTER TABLE debts
ADD CONSTRAINT debts_created_at_not_future CHECK (created_at <= NOW());

-- Income: created_at cannot be in the future
ALTER TABLE income
ADD CONSTRAINT income_created_at_not_future CHECK (created_at <= NOW());

-- Snapshots: created_at cannot be in the future
ALTER TABLE snapshots
ADD CONSTRAINT snapshots_created_at_not_future CHECK (created_at <= NOW());

-- ====================================
-- 3. ENUM VALIDATION (Valid Status/Frequency Values)
-- ====================================

-- Bills: frequency must be valid
ALTER TABLE bills
ADD CONSTRAINT bills_frequency_valid CHECK (
  frequency IN ('daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'semi-annual', 'annual', 'one-time')
);

-- Bills: type must be valid category
ALTER TABLE bills
ADD CONSTRAINT bills_type_valid CHECK (
  type IN (
    'Utilities', 'Rent/Mortgage', 'Insurance', 'Subscriptions', 'Phone/Internet',
    'Transportation', 'Healthcare', 'Education', 'Childcare', 'Pet Care',
    'Loans', 'Credit Cards', 'Taxes', 'Entertainment', 'Memberships',
    'Home Maintenance', 'Auto Financing', 'Other'
  )
);

-- Assets: type must be valid
ALTER TABLE assets
ADD CONSTRAINT assets_type_valid CHECK (
  type IN ('Real Estate', 'Vehicle', 'Electronics', 'Jewelry', 'Art', 'Collectibles', 'Other')
);

-- Investments: type must be valid
ALTER TABLE investments
ADD CONSTRAINT investments_type_valid CHECK (
  type IN (
    '401k', 'IRA', 'Roth IRA', 'Brokerage', 'Savings', 'CD', 'Crypto', 'Real Estate',
    'HSA', '529 Plan', 'Pension', 'Stock Options', 'Other'
  )
);

-- Debts: type must be valid
ALTER TABLE debts
ADD CONSTRAINT debts_type_valid CHECK (
  type IN ('Mortgage', 'Auto Loan', 'Student Loan', 'Personal Loan', 'Credit Card', 'Medical Debt', 'HELOC', 'Other')
);

-- Income: frequency must be valid
ALTER TABLE income
ADD CONSTRAINT income_frequency_valid CHECK (
  frequency IN ('hourly', 'daily', 'weekly', 'bi-weekly', 'semi-monthly', 'monthly', 'quarterly', 'annual', 'one-time')
);

-- Income: type must be valid
ALTER TABLE income
ADD CONSTRAINT income_type_valid CHECK (
  type IN ('W2 Salary', '1099 Contract', 'Freelance', 'Business Income', 'Investment Income', 'Rental Income', 'Dividends', 'Interest', 'Capital Gains', 'Social Security', 'Pension', 'Alimony', 'Child Support', 'Gift', 'Other')
);

-- ====================================
-- 4. RELATIONSHIP VALIDATION
-- ====================================

-- Assets: loan_balance cannot exceed value (prevents negative equity from being hidden)
-- NOTE: Commented out because negative equity is a real scenario (e.g., underwater mortgage)
-- ALTER TABLE assets
-- ADD CONSTRAINT assets_loan_not_exceed_value CHECK (loan_balance <= value);

-- Bill Shares: owner_amount + shared_amount should equal original bill amount
-- NOTE: Enforced at application level, not database level (allows for rounding differences)

-- ====================================
-- 5. LOGICAL VALIDATION
-- ====================================

-- Debts: monthly_payment must be <= balance (prevents payment from exceeding debt)
-- NOTE: Commented out because final payment can be larger than remaining balance
-- ALTER TABLE debts
-- ADD CONSTRAINT debts_payment_not_exceed_balance CHECK (monthly_payment <= balance);

-- ===================================================================
-- VERIFICATION QUERIES (Run after migration)
-- ===================================================================

-- Test 1: Try to insert negative amount bill (should fail)
-- INSERT INTO bills (user_id, name, amount, frequency, type, due_date) 
-- VALUES ('test-user-id', 'Test Negative', -100, 'monthly', 'Utilities', '2026-03-01');

-- Test 2: Try to insert future created_at (should fail)
-- INSERT INTO bills (user_id, name, amount, frequency, type, due_date, created_at)
-- VALUES ('test-user-id', 'Test Future', 100, 'monthly', 'Utilities', '2026-03-01', '2027-01-01');

-- Test 3: Try to insert invalid frequency (should fail)
-- INSERT INTO bills (user_id, name, amount, frequency, type, due_date)
-- VALUES ('test-user-id', 'Test Invalid', 100, 'sometimes', 'Utilities', '2026-03-01');

-- Test 4: Verify existing data complies with new constraints
-- SELECT 'Bills with negative amounts' AS issue, COUNT(*) AS count FROM bills WHERE amount < 0
-- UNION ALL
-- SELECT 'Assets with negative values', COUNT(*) FROM assets WHERE value < 0
-- UNION ALL
-- SELECT 'Investments with invalid annual_return', COUNT(*) FROM investments WHERE annual_return < -100 OR annual_return > 1000
-- UNION ALL
-- SELECT 'Bills with invalid frequency', COUNT(*) FROM bills WHERE frequency NOT IN ('daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'semi-annual', 'annual', 'one-time');

-- ===================================================================
-- NOTES
-- ===================================================================

-- 1. These constraints are applied at the DATABASE level, providing defense-in-depth
--    even if client-side validation is bypassed.
--
-- 2. If any existing data violates these constraints, the migration will FAIL.
--    In that case, clean the data first, then re-run the migration.
--
-- 3. Some constraints (like loan_balance vs value for assets) are intentionally
--    NOT enforced because they represent valid real-world scenarios (negative equity).
--
-- 4. All constraints are named explicitly (e.g., bills_amount_positive) to make
--    debugging easier when constraint violations occur.
--
-- 5. These constraints work with Supabase's Row Level Security (RLS) to provide
--    comprehensive data protection.

-- ===================================================================
-- ROLLBACK (if needed)
-- ===================================================================

-- To remove all constraints:
/*
ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_amount_positive;
ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_created_at_not_future;
ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_frequency_valid;
ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_type_valid;

ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_value_nonnegative;
ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_loan_balance_nonnegative;
ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_created_at_not_future;
ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_type_valid;

ALTER TABLE investments DROP CONSTRAINT IF EXISTS investments_starting_balance_nonnegative;
ALTER TABLE investments DROP CONSTRAINT IF EXISTS investments_monthly_contribution_nonnegative;
ALTER TABLE investments DROP CONSTRAINT IF EXISTS investments_annual_return_reasonable;
ALTER TABLE investments DROP CONSTRAINT IF EXISTS investments_created_at_not_future;
ALTER TABLE investments DROP CONSTRAINT IF EXISTS investments_type_valid;

ALTER TABLE debts DROP CONSTRAINT IF EXISTS debts_balance_nonnegative;
ALTER TABLE debts DROP CONSTRAINT IF EXISTS debts_interest_rate_reasonable;
ALTER TABLE debts DROP CONSTRAINT IF EXISTS debts_monthly_payment_positive;
ALTER TABLE debts DROP CONSTRAINT IF EXISTS debts_created_at_not_future;
ALTER TABLE debts DROP CONSTRAINT IF EXISTS debts_type_valid;

ALTER TABLE income DROP CONSTRAINT IF EXISTS income_amount_positive;
ALTER TABLE income DROP CONSTRAINT IF EXISTS income_created_at_not_future;
ALTER TABLE income DROP CONSTRAINT IF EXISTS income_frequency_valid;
ALTER TABLE income DROP CONSTRAINT IF EXISTS income_type_valid;

ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_amount_nonnegative;

ALTER TABLE snapshots DROP CONSTRAINT IF EXISTS snapshots_created_at_not_future;
*/
