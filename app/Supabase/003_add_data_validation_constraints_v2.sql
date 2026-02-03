-- ============================================================
-- Fireside Capital — Data Validation Constraints Migration
-- Migration: 003 (Revised)
-- Created: 2026-02-03
-- Purpose: Add CHECK constraints for critical data validation
-- Note: Type/frequency enums excluded due to existing data inconsistency
-- ============================================================

-- ==========================
-- ASSETS TABLE CONSTRAINTS
-- ==========================

-- Prevent negative values
ALTER TABLE public.assets 
  ADD CONSTRAINT assets_value_non_negative 
  CHECK (value IS NULL OR value >= 0);

ALTER TABLE public.assets 
  ADD CONSTRAINT assets_loan_non_negative 
  CHECK (loan IS NULL OR loan >= 0);

ALTER TABLE public.assets 
  ADD CONSTRAINT assets_purchase_price_non_negative 
  CHECK ("purchasePrice" IS NULL OR "purchasePrice" >= 0);

-- Interest rate should be between 0 and 100 (percentage)
ALTER TABLE public.assets 
  ADD CONSTRAINT assets_interest_rate_valid 
  CHECK ("interestRate" IS NULL OR ("interestRate" >= 0 AND "interestRate" <= 100));

-- Term years should be positive
ALTER TABLE public.assets 
  ADD CONSTRAINT assets_term_years_positive 
  CHECK ("termYears" IS NULL OR "termYears" > 0);

-- No future created_at dates
ALTER TABLE public.assets 
  ADD CONSTRAINT assets_created_at_not_future 
  CHECK (created_at IS NULL OR created_at <= now());

-- Purchase date shouldn't be in the future
ALTER TABLE public.assets 
  ADD CONSTRAINT assets_purchase_date_not_future 
  CHECK ("purchaseDate" IS NULL OR "purchaseDate" <= CURRENT_DATE);

-- ==========================
-- BILLS TABLE CONSTRAINTS
-- ==========================

-- Prevent negative amounts
ALTER TABLE public.bills 
  ADD CONSTRAINT bills_amount_non_negative 
  CHECK (amount IS NULL OR amount >= 0);

-- No future created_at dates
ALTER TABLE public.bills 
  ADD CONSTRAINT bills_created_at_not_future 
  CHECK (created_at IS NULL OR created_at <= now());

-- ==========================
-- DEBTS TABLE CONSTRAINTS
-- ==========================

-- Prevent negative amounts
ALTER TABLE public.debts 
  ADD CONSTRAINT debts_amount_non_negative 
  CHECK (amount IS NULL OR amount >= 0);

ALTER TABLE public.debts 
  ADD CONSTRAINT debts_monthly_payment_non_negative 
  CHECK ("monthlyPayment" IS NULL OR "monthlyPayment" >= 0);

-- Interest rate should be between 0 and 100 (percentage)
ALTER TABLE public.debts 
  ADD CONSTRAINT debts_interest_rate_valid 
  CHECK ("interestRate" IS NULL OR ("interestRate" >= 0 AND "interestRate" <= 100));

-- Term should be positive
ALTER TABLE public.debts 
  ADD CONSTRAINT debts_term_positive 
  CHECK (term IS NULL OR term > 0);

-- No future created_at dates
ALTER TABLE public.debts 
  ADD CONSTRAINT debts_created_at_not_future 
  CHECK (created_at IS NULL OR created_at <= now());

-- ==========================
-- INCOME TABLE CONSTRAINTS
-- ==========================

-- Prevent negative amounts
ALTER TABLE public.income 
  ADD CONSTRAINT income_amount_non_negative 
  CHECK (amount IS NULL OR amount >= 0);

-- No future created_at dates
ALTER TABLE public.income 
  ADD CONSTRAINT income_created_at_not_future 
  CHECK (created_at IS NULL OR created_at <= now());

-- ==========================
-- INVESTMENTS TABLE CONSTRAINTS
-- ==========================

-- Prevent negative values
ALTER TABLE public.investments 
  ADD CONSTRAINT investments_value_non_negative 
  CHECK (value IS NULL OR value >= 0);

ALTER TABLE public.investments 
  ADD CONSTRAINT investments_starting_balance_non_negative 
  CHECK ("startingBalance" IS NULL OR "startingBalance" >= 0);

ALTER TABLE public.investments 
  ADD CONSTRAINT investments_monthly_contribution_non_negative 
  CHECK ("monthlyContribution" IS NULL OR "monthlyContribution" >= 0);

-- Annual return should be between -100 and 1000 (allow losses and gains)
ALTER TABLE public.investments 
  ADD CONSTRAINT investments_annual_return_reasonable 
  CHECK ("annualReturn" IS NULL OR ("annualReturn" >= -100 AND "annualReturn" <= 1000));

-- No future created_at dates
ALTER TABLE public.investments 
  ADD CONSTRAINT investments_created_at_not_future 
  CHECK (created_at IS NULL OR created_at <= now());

-- ==========================
-- SETTINGS TABLE CONSTRAINTS
-- ==========================

-- Emergency fund goal should be non-negative
ALTER TABLE public.settings 
  ADD CONSTRAINT settings_emergency_fund_goal_non_negative 
  CHECK (emergency_fund_goal IS NULL OR emergency_fund_goal >= 0);

-- No future created_at dates
ALTER TABLE public.settings 
  ADD CONSTRAINT settings_created_at_not_future 
  CHECK (created_at IS NULL OR created_at <= now());

-- ==========================
-- BUDGETS TABLE CONSTRAINTS
-- ==========================

-- Prevent negative amounts
ALTER TABLE public.budgets 
  ADD CONSTRAINT budgets_assigned_amount_non_negative 
  CHECK (assigned_amount IS NULL OR assigned_amount >= 0);

ALTER TABLE public.budgets 
  ADD CONSTRAINT budgets_needed_amount_non_negative 
  CHECK (needed_amount IS NULL OR needed_amount >= 0);

-- Month should be in YYYY-MM format
ALTER TABLE public.budgets 
  ADD CONSTRAINT budgets_month_format_valid 
  CHECK (month IS NULL OR month ~ '^\d{4}-(0[1-9]|1[0-2])$');

-- ==========================
-- SNAPSHOTS TABLE CONSTRAINTS
-- ==========================

-- No future dates for snapshots
ALTER TABLE public.snapshots 
  ADD CONSTRAINT snapshots_date_not_future 
  CHECK (date IS NULL OR date <= CURRENT_DATE);

-- No future created_at dates
ALTER TABLE public.snapshots 
  ADD CONSTRAINT snapshots_created_at_not_future 
  CHECK (created_at IS NULL OR created_at <= now());

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Test negative amount (should fail)
-- INSERT INTO public.bills (user_id, name, amount) VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'Test', -10);

-- Test future created_at (should fail)
-- INSERT INTO public.bills (user_id, name, created_at) VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'Test', '2099-01-01'::timestamptz);

-- Test interest rate > 100 (should fail)
-- INSERT INTO public.assets (user_id, name, "interestRate") VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'Test', 150);

-- ============================================================
-- ROLLBACK SCRIPT
-- ============================================================

-- ALTER TABLE public.assets DROP CONSTRAINT IF EXISTS assets_value_non_negative;
-- ALTER TABLE public.assets DROP CONSTRAINT IF EXISTS assets_loan_non_negative;
-- ALTER TABLE public.assets DROP CONSTRAINT IF EXISTS assets_purchase_price_non_negative;
-- ALTER TABLE public.assets DROP CONSTRAINT IF EXISTS assets_interest_rate_valid;
-- ALTER TABLE public.assets DROP CONSTRAINT IF EXISTS assets_term_years_positive;
-- ALTER TABLE public.assets DROP CONSTRAINT IF EXISTS assets_created_at_not_future;
-- ALTER TABLE public.assets DROP CONSTRAINT IF EXISTS assets_purchase_date_not_future;
-- 
-- ALTER TABLE public.bills DROP CONSTRAINT IF EXISTS bills_amount_non_negative;
-- ALTER TABLE public.bills DROP CONSTRAINT IF EXISTS bills_created_at_not_future;
-- 
-- ALTER TABLE public.debts DROP CONSTRAINT IF EXISTS debts_amount_non_negative;
-- ALTER TABLE public.debts DROP CONSTRAINT IF EXISTS debts_monthly_payment_non_negative;
-- ALTER TABLE public.debts DROP CONSTRAINT IF EXISTS debts_interest_rate_valid;
-- ALTER TABLE public.debts DROP CONSTRAINT IF EXISTS debts_term_positive;
-- ALTER TABLE public.debts DROP CONSTRAINT IF EXISTS debts_created_at_not_future;
-- 
-- ALTER TABLE public.income DROP CONSTRAINT IF EXISTS income_amount_non_negative;
-- ALTER TABLE public.income DROP CONSTRAINT IF EXISTS income_created_at_not_future;
-- 
-- ALTER TABLE public.investments DROP CONSTRAINT IF EXISTS investments_value_non_negative;
-- ALTER TABLE public.investments DROP CONSTRAINT IF EXISTS investments_starting_balance_non_negative;
-- ALTER TABLE public.investments DROP CONSTRAINT IF EXISTS investments_monthly_contribution_non_negative;
-- ALTER TABLE public.investments DROP CONSTRAINT IF EXISTS investments_annual_return_reasonable;
-- ALTER TABLE public.investments DROP CONSTRAINT IF EXISTS investments_created_at_not_future;
-- 
-- ALTER TABLE public.settings DROP CONSTRAINT IF EXISTS settings_emergency_fund_goal_non_negative;
-- ALTER TABLE public.settings DROP CONSTRAINT IF EXISTS settings_created_at_not_future;
-- 
-- ALTER TABLE public.budgets DROP CONSTRAINT IF EXISTS budgets_assigned_amount_non_negative;
-- ALTER TABLE public.budgets DROP CONSTRAINT IF EXISTS budgets_needed_amount_non_negative;
-- ALTER TABLE public.budgets DROP CONSTRAINT IF EXISTS budgets_month_format_valid;
-- 
-- ALTER TABLE public.snapshots DROP CONSTRAINT IF EXISTS snapshots_date_not_future;
-- ALTER TABLE public.snapshots DROP CONSTRAINT IF EXISTS snapshots_created_at_not_future;
