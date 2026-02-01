-- ============================================================
-- Fireside Capital — Full Database Migration
-- Generated from backup: db_cluster-15-08-2025@06-10-32
-- 
-- INSTRUCTIONS:
-- 1. Create a new Supabase project
-- 2. Go to SQL Editor
-- 3. Paste this entire script and run it
-- 4. Sign up in the app with your email
-- 5. Run the user_id update script (at the bottom) with your new UUID
-- ============================================================

-- ========================
-- TABLE: assets
-- ========================
CREATE TABLE public.assets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    name text,
    type text,
    value numeric,
    loan numeric,
    "interestRate" numeric,
    "loanStartDate" date,
    "nextDueDate" date,
    "purchaseDate" date,
    "purchasePrice" numeric,
    "termYears" numeric,
    CONSTRAINT assets_pkey PRIMARY KEY (id)
);

-- ========================
-- TABLE: bills
-- ========================
CREATE TABLE public.bills (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    name text,
    type text,
    amount numeric,
    frequency text,
    "nextDueDate" date,
    CONSTRAINT bills_pkey PRIMARY KEY (id)
);

-- ========================
-- TABLE: debts
-- ========================
CREATE TABLE public.debts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    name text,
    type text,
    amount numeric,
    "interestRate" numeric,
    term integer,
    "monthlyPayment" numeric,
    "nextDueDate" date,
    CONSTRAINT debts_pkey PRIMARY KEY (id)
);

-- ========================
-- TABLE: income
-- ========================
CREATE TABLE public.income (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    name text,
    type text,
    amount numeric,
    frequency text,
    "nextDueDate" date,
    CONSTRAINT income_pkey PRIMARY KEY (id)
);

-- ========================
-- TABLE: investments
-- ========================
CREATE TABLE public.investments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    name text,
    type text,
    value numeric,
    "startingBalance" numeric,
    "monthlyContribution" numeric,
    "annualReturn" numeric,
    "nextContributionDate" date,
    CONSTRAINT investments_pkey PRIMARY KEY (id)
);

-- ========================
-- TABLE: settings
-- ========================
CREATE TABLE public.settings (
    user_id uuid NOT NULL,
    emergency_fund_goal numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT settings_pkey PRIMARY KEY (user_id)
);

-- ========================
-- TABLE: snapshots
-- ========================
CREATE TABLE public.snapshots (
    user_id uuid NOT NULL,
    date date NOT NULL,
    "netWorth" numeric,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT snapshots_pkey PRIMARY KEY (user_id, date)
);

-- ========================
-- TABLE: budgets
-- ========================
CREATE TABLE public.budgets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    month text NOT NULL,
    item_id uuid NOT NULL,
    item_type text NOT NULL,
    assigned_amount numeric DEFAULT 0,
    name text,
    category text,
    needed_amount numeric DEFAULT 0,
    CONSTRAINT budgets_pkey PRIMARY KEY (id),
    CONSTRAINT budgets_user_id_month_item_id_key UNIQUE (user_id, month, item_id)
);

-- ============================================================
-- FOREIGN KEYS (references auth.users)
-- ============================================================
ALTER TABLE public.assets ADD CONSTRAINT assets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.bills ADD CONSTRAINT bills_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.debts ADD CONSTRAINT debts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.income ADD CONSTRAINT income_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.investments ADD CONSTRAINT investments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.settings ADD CONSTRAINT settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.snapshots ADD CONSTRAINT snapshots_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.budgets ADD CONSTRAINT budgets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Enable all access for users based on user_id" ON public.assets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable all access for users based on user_id" ON public.bills FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable all access for users based on user_id" ON public.budgets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable all access for users based on user_id" ON public.debts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable all access for users based on user_id" ON public.income FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable all access for users based on user_id" ON public.investments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable all access for users based on user_id" ON public.settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable all access for users based on user_id" ON public.snapshots FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
