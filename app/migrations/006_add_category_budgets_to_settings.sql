-- Migration: 006_add_category_budgets_to_settings
-- Date: 2026-02-17
-- Purpose: Add category_budgets JSONB column to settings table for FC-180
-- Required by: saveCategoryBudgets() in app.js, calculateBudgetVsActuals() in budget-actuals.js
-- Run in: Supabase SQL Editor

-- Add category_budgets column (JSONB, default empty object)
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS category_budgets JSONB DEFAULT '{}'::jsonb;

-- Add comment
COMMENT ON COLUMN public.settings.category_budgets
  IS 'Monthly spending limits per category (JSON: {dining: 300, groceries: 500, ...}). Powers Budget vs Actuals tracker.';

-- Verify: existing rows get default empty object
UPDATE public.settings
  SET category_budgets = '{}'::jsonb
  WHERE category_budgets IS NULL;
