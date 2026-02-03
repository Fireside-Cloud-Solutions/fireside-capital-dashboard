-- ============================================================
-- Fireside Capital — Enum Constraints Migration
-- Migration: 004
-- Created: 2026-02-03
-- Purpose: Add CHECK constraints for type/frequency enums
-- Prerequisites: Run normalize-database-enums.js FIRST
-- ============================================================

-- ==========================
-- ASSETS TYPE CONSTRAINT
-- ==========================

ALTER TABLE public.assets 
  ADD CONSTRAINT assets_type_valid 
  CHECK (type IS NULL OR type IN (
    'real-estate',
    'vehicle',
    'other'
  ));

-- ==========================
-- BILLS TYPE CONSTRAINT
-- ==========================

ALTER TABLE public.bills 
  ADD CONSTRAINT bills_type_valid 
  CHECK (type IS NULL OR type IN (
    'housing',
    'auto',
    'utilities',
    'financing',
    'health',
    'subscriptions',
    'other'
  ));

-- ==========================
-- BILLS FREQUENCY CONSTRAINT
-- ==========================

ALTER TABLE public.bills 
  ADD CONSTRAINT bills_frequency_valid 
  CHECK (frequency IS NULL OR frequency IN (
    'weekly',
    'bi-weekly',
    'semi-monthly',
    'monthly',
    'quarterly',
    'semi-annually',
    'annually'
  ));

-- ==========================
-- DEBTS TYPE CONSTRAINT
-- ==========================

ALTER TABLE public.debts 
  ADD CONSTRAINT debts_type_valid 
  CHECK (type IS NULL OR type IN (
    'credit-card',
    'student-loan',
    'mortgage',
    'auto-loan',
    'personal-loan',
    'other'
  ));

-- ==========================
-- INCOME TYPE CONSTRAINT
-- ==========================

ALTER TABLE public.income 
  ADD CONSTRAINT income_type_valid 
  CHECK (type IS NULL OR type IN (
    'salary',
    'hourly',
    'commission',
    'bonus',
    'freelance',
    'rental',
    'investment',
    'other'
  ));

-- ==========================
-- INCOME FREQUENCY CONSTRAINT
-- ==========================

ALTER TABLE public.income 
  ADD CONSTRAINT income_frequency_valid 
  CHECK (frequency IS NULL OR frequency IN (
    'weekly',
    'bi-weekly',
    'semi-monthly',
    'monthly',
    'quarterly',
    'annually'
  ));

-- ==========================
-- INVESTMENTS TYPE CONSTRAINT
-- ==========================

ALTER TABLE public.investments 
  ADD CONSTRAINT investments_type_valid 
  CHECK (type IS NULL OR type IN (
    '401k',
    'ira',
    'roth-ira',
    'brokerage',
    'savings',
    'cd',
    'crypto',
    'other'
  ));

-- ==========================
-- BUDGETS ITEM_TYPE CONSTRAINT
-- ==========================

ALTER TABLE public.budgets 
  ADD CONSTRAINT budgets_item_type_valid 
  CHECK (item_type IS NULL OR item_type IN (
    'bill',
    'debt',
    'saving'
  ));

-- ============================================================
-- VERIFICATION
-- ============================================================

-- Test invalid type (should fail)
-- INSERT INTO public.bills (user_id, name, type) VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'Test', 'INVALID');

-- Test invalid frequency (should fail)
-- INSERT INTO public.bills (user_id, name, frequency) VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'Test', 'DAILY');

-- ============================================================
-- ROLLBACK
-- ============================================================

-- ALTER TABLE public.assets DROP CONSTRAINT IF EXISTS assets_type_valid;
-- ALTER TABLE public.bills DROP CONSTRAINT IF EXISTS bills_type_valid;
-- ALTER TABLE public.bills DROP CONSTRAINT IF EXISTS bills_frequency_valid;
-- ALTER TABLE public.debts DROP CONSTRAINT IF EXISTS debts_type_valid;
-- ALTER TABLE public.income DROP CONSTRAINT IF EXISTS income_type_valid;
-- ALTER TABLE public.income DROP CONSTRAINT IF EXISTS income_frequency_valid;
-- ALTER TABLE public.investments DROP CONSTRAINT IF EXISTS investments_type_valid;
-- ALTER TABLE public.budgets DROP CONSTRAINT IF EXISTS budgets_item_type_valid;
