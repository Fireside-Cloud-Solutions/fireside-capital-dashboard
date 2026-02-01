-- Migration: Fix bills RLS policy for pending bill shares
-- Date: 2025-07-16
-- Problem: When a user had a pending bill share, they couldn't see the bill name
--   or amount because the RLS policy on `bills` only allowed SELECT access for
--   shares with status = 'accepted'. This caused "Unknown Bill" / $0.00 in the UI.
-- Fix: Updated the policy to allow SELECT for any bill_share status (pending, accepted, declined).

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Shared users can read shared bills" ON public.bills;

-- Create updated policy: allow reading bills for any share status (including pending)
CREATE POLICY "Shared users can read shared bills"
ON public.bills
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bill_shares
    WHERE bill_shares.bill_id = bills.id
    AND bill_shares.shared_with_id = auth.uid()
  )
);

-- Note: The existing "Enable all access for users based on user_id" policy
-- still handles owner access (auth.uid() = user_id). These two policies
-- combine with OR logic, so owners AND shared users can both read bills.
