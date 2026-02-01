-- =====================================================
-- RLS SECURITY AUDIT MIGRATION
-- Date: 2025-01-31
-- Purpose: Enable Row Level Security on all tables
-- =====================================================

-- This migration ensures all tables have RLS enabled with proper policies
-- to prevent unauthorized cross-user data access.

-- =====================================================
-- 1. ASSETS TABLE
-- =====================================================
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own assets" ON public.assets;
CREATE POLICY "Users can view their own assets"
ON public.assets FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own assets" ON public.assets;
CREATE POLICY "Users can insert their own assets"
ON public.assets FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own assets" ON public.assets;
CREATE POLICY "Users can update their own assets"
ON public.assets FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own assets" ON public.assets;
CREATE POLICY "Users can delete their own assets"
ON public.assets FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 2. INVESTMENTS TABLE
-- =====================================================
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own investments" ON public.investments;
CREATE POLICY "Users can view their own investments"
ON public.investments FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own investments" ON public.investments;
CREATE POLICY "Users can insert their own investments"
ON public.investments FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own investments" ON public.investments;
CREATE POLICY "Users can update their own investments"
ON public.investments FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own investments" ON public.investments;
CREATE POLICY "Users can delete their own investments"
ON public.investments FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 3. DEBTS TABLE
-- =====================================================
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own debts" ON public.debts;
CREATE POLICY "Users can view their own debts"
ON public.debts FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own debts" ON public.debts;
CREATE POLICY "Users can insert their own debts"
ON public.debts FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own debts" ON public.debts;
CREATE POLICY "Users can update their own debts"
ON public.debts FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own debts" ON public.debts;
CREATE POLICY "Users can delete their own debts"
ON public.debts FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 4. BILLS TABLE
-- =====================================================
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own bills" ON public.bills;
CREATE POLICY "Users can view their own bills"
ON public.bills FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own bills" ON public.bills;
CREATE POLICY "Users can insert their own bills"
ON public.bills FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own bills" ON public.bills;
CREATE POLICY "Users can update their own bills"
ON public.bills FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bills" ON public.bills;
CREATE POLICY "Users can delete their own bills"
ON public.bills FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 5. INCOME TABLE
-- =====================================================
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own income" ON public.income;
CREATE POLICY "Users can view their own income"
ON public.income FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own income" ON public.income;
CREATE POLICY "Users can insert their own income"
ON public.income FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own income" ON public.income;
CREATE POLICY "Users can update their own income"
ON public.income FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own income" ON public.income;
CREATE POLICY "Users can delete their own income"
ON public.income FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 6. BUDGETS TABLE
-- =====================================================
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own budgets" ON public.budgets;
CREATE POLICY "Users can view their own budgets"
ON public.budgets FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own budgets" ON public.budgets;
CREATE POLICY "Users can insert their own budgets"
ON public.budgets FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own budgets" ON public.budgets;
CREATE POLICY "Users can update their own budgets"
ON public.budgets FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own budgets" ON public.budgets;
CREATE POLICY "Users can delete their own budgets"
ON public.budgets FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 7. SETTINGS TABLE
-- =====================================================
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own settings" ON public.settings;
CREATE POLICY "Users can view their own settings"
ON public.settings FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own settings" ON public.settings;
CREATE POLICY "Users can insert their own settings"
ON public.settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own settings" ON public.settings;
CREATE POLICY "Users can update their own settings"
ON public.settings FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own settings" ON public.settings;
CREATE POLICY "Users can delete their own settings"
ON public.settings FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 8. SNAPSHOTS TABLE
-- =====================================================
ALTER TABLE public.snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own snapshots" ON public.snapshots;
CREATE POLICY "Users can view their own snapshots"
ON public.snapshots FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own snapshots" ON public.snapshots;
CREATE POLICY "Users can insert their own snapshots"
ON public.snapshots FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own snapshots" ON public.snapshots;
CREATE POLICY "Users can update their own snapshots"
ON public.snapshots FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own snapshots" ON public.snapshots;
CREATE POLICY "Users can delete their own snapshots"
ON public.snapshots FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 9. USER_PROFILES TABLE (Special case)
-- Users can view all profiles (for friend search)
-- but can only update/delete their own
-- =====================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;
CREATE POLICY "Users can view all profiles"
ON public.user_profiles FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
CREATE POLICY "Users can insert their own profile"
ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON public.user_profiles;
CREATE POLICY "Users can delete their own profile"
ON public.user_profiles FOR DELETE
USING (auth.uid() = id);

-- =====================================================
-- 10. CONNECTIONS TABLE (Special case)
-- Users can see connections where they are either the owner or the friend
-- =====================================================
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own connections" ON public.connections;
CREATE POLICY "Users can view their own connections"
ON public.connections FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = friend_id);

DROP POLICY IF EXISTS "Users can create connections they own" ON public.connections;
CREATE POLICY "Users can create connections they own"
ON public.connections FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update connections they own or are part of" ON public.connections;
CREATE POLICY "Users can update connections they own or are part of"
ON public.connections FOR UPDATE
USING (auth.uid() = user_id OR auth.uid() = friend_id);

DROP POLICY IF EXISTS "Users can delete connections they own" ON public.connections;
CREATE POLICY "Users can delete connections they own"
ON public.connections FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 11. BILL_SHARES TABLE (Special case)
-- Users can see bill shares where they are either the owner or the shared_with user
-- =====================================================
ALTER TABLE public.bill_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view bill shares they own or are shared with" ON public.bill_shares;
CREATE POLICY "Users can view bill shares they own or are shared with"
ON public.bill_shares FOR SELECT
USING (auth.uid() = owner_id OR auth.uid() = shared_with_id);

DROP POLICY IF EXISTS "Users can create bill shares they own" ON public.bill_shares;
CREATE POLICY "Users can create bill shares they own"
ON public.bill_shares FOR INSERT
WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update bill shares they own or are shared with" ON public.bill_shares;
CREATE POLICY "Users can update bill shares they own or are shared with"
ON public.bill_shares FOR UPDATE
USING (auth.uid() = owner_id OR auth.uid() = shared_with_id);

DROP POLICY IF EXISTS "Users can delete bill shares they own" ON public.bill_shares;
CREATE POLICY "Users can delete bill shares they own"
ON public.bill_shares FOR DELETE
USING (auth.uid() = owner_id);

-- =====================================================
-- 12. NOTIFICATIONS TABLE
-- =====================================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;
CREATE POLICY "Users can insert their own notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- VERIFICATION QUERY
-- Run this to verify all tables have RLS enabled:
-- =====================================================
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('assets', 'investments', 'debts', 'bills', 'income', 
--                   'budgets', 'settings', 'snapshots', 'user_profiles', 
--                   'connections', 'bill_shares', 'notifications')
-- ORDER BY tablename;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
