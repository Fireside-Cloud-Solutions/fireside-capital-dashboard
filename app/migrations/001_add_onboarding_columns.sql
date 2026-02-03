-- Add onboarding tracking columns to settings table
-- Migration: 001_add_onboarding_columns
-- Date: 2026-02-03
-- Purpose: Track user onboarding and tour completion status

-- Add onboarding_completed column
ALTER TABLE public.settings 
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Add tour_completed column
ALTER TABLE public.settings 
  ADD COLUMN IF NOT EXISTS tour_completed BOOLEAN DEFAULT FALSE;

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_settings_onboarding 
  ON public.settings(user_id, onboarding_completed);

CREATE INDEX IF NOT EXISTS idx_settings_tour 
  ON public.settings(user_id, tour_completed);

-- Add comment
COMMENT ON COLUMN public.settings.onboarding_completed 
  IS 'Tracks whether user has completed the initial onboarding wizard';

COMMENT ON COLUMN public.settings.tour_completed 
  IS 'Tracks whether user has completed the feature tour';
