-- Add data validation constraints to enforce data integrity
-- Migration: 003_add_data_validation_constraints
-- Date: 2026-02-10
-- Purpose: Prevent data corruption with database-level CHECK constraints
-- Reference: docs/research/11-database-optimization.md

-- ============================================================================
-- SECTION 1: AMOUNT VALIDATION (No Negatives)
-- ============================================================================

-- Bills: amount must be positive
ALTER TABLE bills
ADD CONSTRAINT bills_amount_positive CHECK (amount > 0);

-- Assets: value must be >= 0 (can be $0 if fully depreciated)
ALTER TABLE assets
ADD CONSTRAINT assets_value_nonnegative CHECK (value >= 0);

-- Assets: loan_amount must be >= 0
ALTER TABLE assets
ADD CONSTRAINT assets_loan_nonnegative CHECK (loan_amount >= 0);

-- Debts: balance must be >= 0
ALTER TABLE debts
ADD CONSTRAINT debts_balance_nonnegative CHECK (balance >= 0);

-- Debts: monthly_payment must be >= 0
ALTER TABLE debts
ADD CONSTRAINT debts_monthly_payment_nonnegative CHECK (monthly_payment >= 0);

-- Debts: interest_rate must be 0-100%
ALTER TABLE debts
ADD CONSTRAINT debts_interest_rate_reasonable CHECK (interest_rate >= 0 AND interest_rate <= 100);

-- Income: amount must be positive
ALTER TABLE income
ADD CONSTRAINT income_amount_positive CHECK (amount > 0);

-- Investments: balance must be >= 0
ALTER TABLE investments
ADD CONSTRAINT investments_balance_nonnegative CHECK (balance >= 0);

-- Investments: annual_return must be -100% to +1000% (prevents typos like 25% entered as 2500)
ALTER TABLE investments
ADD CONSTRAINT investments_annual_return_reasonable CHECK (annual_return >= -100 AND annual_return <= 1000);

-- ============================================================================
-- SECTION 2: DATE VALIDATION (No Future created_at Timestamps)
-- ============================================================================

-- Prevent backdating records (created_at must be <= NOW())
ALTER TABLE bills 
ADD CONSTRAINT bills_created_at_not_future CHECK (created_at <= NOW());

ALTER TABLE assets 
ADD CONSTRAINT assets_created_at_not_future CHECK (created_at <= NOW());

ALTER TABLE investments 
ADD CONSTRAINT investments_created_at_not_future CHECK (created_at <= NOW());

ALTER TABLE debts 
ADD CONSTRAINT debts_created_at_not_future CHECK (created_at <= NOW());

ALTER TABLE income 
ADD CONSTRAINT income_created_at_not_future CHECK (created_at <= NOW());

ALTER TABLE snapshots 
ADD CONSTRAINT snapshots_created_at_not_future CHECK (created_at <= NOW());

-- ============================================================================
-- SECTION 3: ENUM VALIDATION (Valid Categories)
-- ============================================================================

-- Bills: frequency must match allowed values
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

-- Assets: type must be valid category
ALTER TABLE assets
ADD CONSTRAINT assets_type_valid CHECK (
  type IN ('Real Estate', 'Vehicle', 'Other')
);

-- Investments: type must be valid category
ALTER TABLE investments
ADD CONSTRAINT investments_type_valid CHECK (
  type IN ('401k', 'IRA', 'Roth IRA', 'Brokerage', 'Savings', 'CD', 'Crypto', 'Other')
);

-- Debts: type must be valid category
ALTER TABLE debts
ADD CONSTRAINT debts_type_valid CHECK (
  type IN ('Mortgage', 'Auto Loan', 'Student Loan', 'Personal Loan', 'Credit Card', 'Medical Debt', 'Other')
);

-- Income: frequency must be valid
ALTER TABLE income
ADD CONSTRAINT income_frequency_valid CHECK (
  frequency IN ('weekly', 'bi-weekly', 'monthly', 'quarterly', 'annual', 'one-time')
);

-- Income: type must be valid category
ALTER TABLE income
ADD CONSTRAINT income_type_valid CHECK (
  type IN ('W2', '1099', 'Self-Employment', 'Rental', 'Investment', 'Other')
);

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON CONSTRAINT bills_amount_positive ON bills 
IS 'Prevents negative bill amounts';

COMMENT ON CONSTRAINT bills_frequency_valid ON bills 
IS 'Ensures bill frequency matches allowed values';

COMMENT ON CONSTRAINT bills_type_valid ON bills 
IS 'Ensures bill type matches allowed categories';

COMMENT ON CONSTRAINT assets_value_nonnegative ON assets 
IS 'Prevents negative asset values';

COMMENT ON CONSTRAINT debts_interest_rate_reasonable ON debts 
IS 'Prevents invalid interest rates (must be 0-100%)';

COMMENT ON CONSTRAINT investments_annual_return_reasonable ON investments 
IS 'Prevents typos in annual return (e.g., 2500% instead of 25%)';

-- ============================================================================
-- ROLLBACK SCRIPT (For Emergency Use)
-- ============================================================================

/*
-- To rollback this migration, run:

ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_amount_positive;
ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_created_at_not_future;
ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_frequency_valid;
ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_type_valid;

ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_value_nonnegative;
ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_loan_nonnegative;
ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_created_at_not_future;
ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_type_valid;

ALTER TABLE debts DROP CONSTRAINT IF EXISTS debts_balance_nonnegative;
ALTER TABLE debts DROP CONSTRAINT IF EXISTS debts_monthly_payment_nonnegative;
ALTER TABLE debts DROP CONSTRAINT IF EXISTS debts_interest_rate_reasonable;
ALTER TABLE debts DROP CONSTRAINT IF EXISTS debts_created_at_not_future;
ALTER TABLE debts DROP CONSTRAINT IF EXISTS debts_type_valid;

ALTER TABLE income DROP CONSTRAINT IF EXISTS income_amount_positive;
ALTER TABLE income DROP CONSTRAINT IF EXISTS income_created_at_not_future;
ALTER TABLE income DROP CONSTRAINT IF EXISTS income_frequency_valid;
ALTER TABLE income DROP CONSTRAINT IF EXISTS income_type_valid;

ALTER TABLE investments DROP CONSTRAINT IF EXISTS investments_balance_nonnegative;
ALTER TABLE investments DROP CONSTRAINT IF EXISTS investments_annual_return_reasonable;
ALTER TABLE investments DROP CONSTRAINT IF EXISTS investments_created_at_not_future;
ALTER TABLE investments DROP CONSTRAINT IF EXISTS investments_type_valid;

ALTER TABLE snapshots DROP CONSTRAINT IF EXISTS snapshots_created_at_not_future;
*/
