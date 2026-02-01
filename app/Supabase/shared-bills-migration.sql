-- ============================================================
-- Migration: Shared Bills & Social Connections
-- Fireside Capital
-- Date: 2025-07-21
-- Author: Architect Agent
--
-- PURPOSE:
--   Add social connections (friends) and bill sharing between users.
--   Enables couples, roommates, and partners to split bills with
--   customizable ratios and automatic recalculation when amounts change.
--
-- NEW TABLES:
--   - user_profiles    Public-facing user info (username, display name, avatar)
--   - connections       Friend/partner relationships
--   - bill_shares       Shared bill mappings with split configuration
--   - notifications     In-app notification queue
--
-- NEW FUNCTIONS:
--   - search_users_by_email()          Search users by email (SECURITY DEFINER)
--   - create_profile_for_new_user()    Auto-create profile on signup
--   - notify_connection_change()       Notification trigger for connections
--   - notify_bill_share_change()       Notification trigger for bill shares
--   - recalculate_bill_share_amounts() Auto-recalc on bill amount change
--   - notify_shared_bill_deletion()    Notify shared users on bill deletion
--   - check_shared_bills_on_disconnect() Warn about active shares on unfriend
--   - generate_monthly_budget()        UPDATED to handle shared bills
--
-- ARCHITECTURE DOC: docs/architecture/shared-bills.md
--
-- INSTRUCTIONS:
--   1. Open Supabase Dashboard → SQL Editor
--   2. Paste this entire script and run it
--   3. Enable Realtime on: notifications, bill_shares, connections
--   4. Backfill profiles for existing users (Section 10)
--
-- SAFE TO RUN MULTIPLE TIMES (IF NOT EXISTS guards on all objects)
-- ============================================================


-- ============================================================
-- 1. USER PROFILES TABLE
-- ============================================================
-- Public-facing user information. Searchable by other users.
-- Auto-created when a user signs up (via trigger on auth.users).

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username        text UNIQUE,
    display_name    text,
    avatar_url      text,
    email_visible   boolean DEFAULT false,
    created_at      timestamptz DEFAULT now(),
    updated_at      timestamptz DEFAULT now(),

    CONSTRAINT username_format CHECK (
        username IS NULL OR (
            length(username) BETWEEN 3 AND 30
            AND username ~ '^[a-zA-Z0-9_]+$'
        )
    )
);

-- Case-insensitive unique username
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_username_lower 
    ON public.user_profiles (lower(username));

-- Search by display name
CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name 
    ON public.user_profiles (lower(display_name));


-- ============================================================
-- 2. CONNECTIONS TABLE (Friend Relationships)
-- ============================================================
-- Directional model: requester → addressee
-- Status lifecycle: pending → accepted | declined | blocked

CREATE TABLE IF NOT EXISTS public.connections (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    addressee_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status          text NOT NULL DEFAULT 'pending',
    created_at      timestamptz DEFAULT now(),
    updated_at      timestamptz DEFAULT now(),

    CONSTRAINT connections_no_self CHECK (requester_id != addressee_id),
    CONSTRAINT connections_unique_pair UNIQUE (requester_id, addressee_id),
    CONSTRAINT connections_status_check CHECK (status IN ('pending', 'accepted', 'declined', 'blocked'))
);

CREATE INDEX IF NOT EXISTS idx_connections_requester 
    ON public.connections (requester_id, status);
CREATE INDEX IF NOT EXISTS idx_connections_addressee 
    ON public.connections (addressee_id, status);
-- Efficient "are these two users connected?" regardless of direction
CREATE INDEX IF NOT EXISTS idx_connections_pair 
    ON public.connections (
        LEAST(requester_id, addressee_id),
        GREATEST(requester_id, addressee_id)
    );


-- ============================================================
-- 3. BILL SHARES TABLE
-- ============================================================
-- Maps a bill to a shared user with split configuration.
-- The bill owner does NOT have a row here — they own the bill in bills table.

CREATE TABLE IF NOT EXISTS public.bill_shares (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id         uuid NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
    owner_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_with_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status          text NOT NULL DEFAULT 'pending',
    
    -- Split configuration
    split_type      text NOT NULL DEFAULT 'percentage',
    owner_percent   numeric,
    shared_percent  numeric,
    owner_fixed     numeric,
    shared_fixed    numeric,
    
    -- Denormalized calculated amounts (updated via trigger)
    owner_amount    numeric,
    shared_amount   numeric,
    
    created_at      timestamptz DEFAULT now(),
    updated_at      timestamptz DEFAULT now(),
    accepted_at     timestamptz,

    CONSTRAINT bill_shares_no_self CHECK (owner_id != shared_with_id),
    CONSTRAINT bill_shares_unique UNIQUE (bill_id, shared_with_id),
    CONSTRAINT bill_shares_status_check CHECK (
        status IN ('pending', 'accepted', 'declined', 'cancelled')
    ),
    CONSTRAINT bill_shares_split_type_check CHECK (
        split_type IN ('percentage', 'fixed', 'equal')
    ),
    CONSTRAINT bill_shares_percent_valid CHECK (
        split_type != 'percentage' OR (
            owner_percent >= 0 AND owner_percent <= 100
            AND shared_percent >= 0 AND shared_percent <= 100
            AND (owner_percent + shared_percent) BETWEEN 99.99 AND 100.01
        )
    ),
    CONSTRAINT bill_shares_fixed_valid CHECK (
        split_type != 'fixed' OR (
            owner_fixed >= 0 AND shared_fixed >= 0
        )
    )
);

CREATE INDEX IF NOT EXISTS idx_bill_shares_bill 
    ON public.bill_shares (bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_shares_owner 
    ON public.bill_shares (owner_id, status);
CREATE INDEX IF NOT EXISTS idx_bill_shares_shared 
    ON public.bill_shares (shared_with_id, status);


-- ============================================================
-- 4. NOTIFICATIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type            text NOT NULL,
    title           text NOT NULL,
    body            text,
    data            jsonb DEFAULT '{}',
    is_read         boolean DEFAULT false,
    created_at      timestamptz DEFAULT now(),

    CONSTRAINT notifications_type_check CHECK (type IN (
        'friend_request',
        'friend_accepted',
        'bill_shared',
        'bill_share_accepted',
        'bill_share_declined',
        'bill_amount_updated',
        'bill_deleted',
        'payment_reminder',
        'connection_removed'
    ))
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
    ON public.notifications (user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
    ON public.notifications (user_id, created_at DESC);


-- ============================================================
-- 5. ROW LEVEL SECURITY — user_profiles
-- ============================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can manage their own profile (all operations)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' AND policyname = 'Users can manage own profile'
    ) THEN
        CREATE POLICY "Users can manage own profile"
            ON public.user_profiles FOR ALL
            USING (auth.uid() = id)
            WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Any authenticated user can search profiles (for friend discovery)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' AND policyname = 'Authenticated users can search profiles'
    ) THEN
        CREATE POLICY "Authenticated users can search profiles"
            ON public.user_profiles FOR SELECT
            USING (auth.role() = 'authenticated');
    END IF;
END $$;


-- ============================================================
-- 6. ROW LEVEL SECURITY — connections
-- ============================================================

ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'connections' AND policyname = 'Users can view own connections'
    ) THEN
        CREATE POLICY "Users can view own connections"
            ON public.connections FOR SELECT
            USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'connections' AND policyname = 'Users can send friend requests'
    ) THEN
        CREATE POLICY "Users can send friend requests"
            ON public.connections FOR INSERT
            WITH CHECK (auth.uid() = requester_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'connections' AND policyname = 'Users can update own connections'
    ) THEN
        CREATE POLICY "Users can update own connections"
            ON public.connections FOR UPDATE
            USING (auth.uid() = requester_id OR auth.uid() = addressee_id)
            WITH CHECK (auth.uid() = requester_id OR auth.uid() = addressee_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'connections' AND policyname = 'Users can delete own connections'
    ) THEN
        CREATE POLICY "Users can delete own connections"
            ON public.connections FOR DELETE
            USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
    END IF;
END $$;


-- ============================================================
-- 7. ROW LEVEL SECURITY — bill_shares
-- ============================================================

ALTER TABLE public.bill_shares ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'bill_shares' AND policyname = 'Users can view own bill shares'
    ) THEN
        CREATE POLICY "Users can view own bill shares"
            ON public.bill_shares FOR SELECT
            USING (auth.uid() = owner_id OR auth.uid() = shared_with_id);
    END IF;
END $$;

-- Only bill owners can create shares, AND must be connected to the shared user
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'bill_shares' AND policyname = 'Bill owners can create shares'
    ) THEN
        CREATE POLICY "Bill owners can create shares"
            ON public.bill_shares FOR INSERT
            WITH CHECK (
                auth.uid() = owner_id
                AND EXISTS (
                    SELECT 1 FROM public.connections
                    WHERE status = 'accepted'
                    AND (
                        (requester_id = auth.uid() AND addressee_id = bill_shares.shared_with_id)
                        OR (addressee_id = auth.uid() AND requester_id = bill_shares.shared_with_id)
                    )
                )
            );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'bill_shares' AND policyname = 'Participants can update bill shares'
    ) THEN
        CREATE POLICY "Participants can update bill shares"
            ON public.bill_shares FOR UPDATE
            USING (auth.uid() = owner_id OR auth.uid() = shared_with_id)
            WITH CHECK (auth.uid() = owner_id OR auth.uid() = shared_with_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'bill_shares' AND policyname = 'Bill owners can delete shares'
    ) THEN
        CREATE POLICY "Bill owners can delete shares"
            ON public.bill_shares FOR DELETE
            USING (auth.uid() = owner_id);
    END IF;
END $$;


-- ============================================================
-- 8. ROW LEVEL SECURITY — bills (EXTEND for shared access)
-- ============================================================
-- IMPORTANT: This adds a SELECT-only policy for shared users.
-- The existing "Enable all access for users based on user_id" policy
-- remains intact for bill owners (full CRUD).

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'bills' AND policyname = 'Shared users can read shared bills'
    ) THEN
        CREATE POLICY "Shared users can read shared bills"
            ON public.bills FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.bill_shares
                    WHERE bill_shares.bill_id = bills.id
                    AND bill_shares.shared_with_id = auth.uid()
                    AND bill_shares.status = 'accepted'
                )
            );
    END IF;
END $$;


-- ============================================================
-- 9. ROW LEVEL SECURITY — notifications
-- ============================================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' AND policyname = 'Users can manage own notifications'
    ) THEN
        CREATE POLICY "Users can manage own notifications"
            ON public.notifications FOR ALL
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;


-- ============================================================
-- 10. AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, display_name)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data ->> 'first_name',
            split_part(NEW.email, '@', 1)
        )
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- Create trigger on auth.users (Supabase-managed)
DROP TRIGGER IF EXISTS trg_create_profile_on_signup ON auth.users;
CREATE TRIGGER trg_create_profile_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_profile_for_new_user();


-- ============================================================
-- 11. BACKFILL PROFILES FOR EXISTING USERS
-- ============================================================
-- Run once after migration. Creates profiles for any existing users
-- who signed up before this migration.

INSERT INTO public.user_profiles (id, display_name)
SELECT 
    u.id,
    COALESCE(
        u.raw_user_meta_data ->> 'first_name',
        split_part(u.email, '@', 1)
    )
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 12. SEARCH USERS BY EMAIL (SERVER-SIDE FUNCTION)
-- ============================================================
-- Secure email search: only returns users who opted in (email_visible=true)
-- Uses SECURITY DEFINER to access auth.users which isn't queryable by clients

CREATE OR REPLACE FUNCTION search_users_by_email(search_email text)
RETURNS TABLE (
    id uuid, 
    username text, 
    display_name text, 
    avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.username, p.display_name, p.avatar_url
    FROM public.user_profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE lower(u.email) = lower(search_email)
    AND p.email_visible = true
    AND p.id != auth.uid();
END;
$$;


-- ============================================================
-- 13. NOTIFICATION TRIGGERS — Connections
-- ============================================================

CREATE OR REPLACE FUNCTION notify_connection_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_requester_name text;
    v_addressee_name text;
BEGIN
    SELECT COALESCE(display_name, username, 'Someone') INTO v_requester_name
    FROM public.user_profiles WHERE id = NEW.requester_id;
    
    SELECT COALESCE(display_name, username, 'Someone') INTO v_addressee_name
    FROM public.user_profiles WHERE id = NEW.addressee_id;

    -- New friend request (INSERT with status='pending')
    IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
        INSERT INTO public.notifications (user_id, type, title, body, data)
        VALUES (
            NEW.addressee_id,
            'friend_request',
            'New Friend Request',
            v_requester_name || ' wants to connect with you',
            jsonb_build_object(
                'connection_id', NEW.id, 
                'requester_id', NEW.requester_id
            )
        );
    END IF;

    -- Friend request accepted
    IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'accepted' THEN
        INSERT INTO public.notifications (user_id, type, title, body, data)
        VALUES (
            NEW.requester_id,
            'friend_accepted',
            'Friend Request Accepted',
            v_addressee_name || ' accepted your friend request',
            jsonb_build_object(
                'connection_id', NEW.id, 
                'addressee_id', NEW.addressee_id
            )
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_connection_notifications ON public.connections;
CREATE TRIGGER trg_connection_notifications
    AFTER INSERT OR UPDATE ON public.connections
    FOR EACH ROW
    EXECUTE FUNCTION notify_connection_change();


-- ============================================================
-- 14. NOTIFICATION TRIGGERS — Bill Shares
-- ============================================================

CREATE OR REPLACE FUNCTION notify_bill_share_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_bill_name text;
    v_owner_name text;
    v_shared_name text;
BEGIN
    SELECT name INTO v_bill_name 
    FROM public.bills WHERE id = NEW.bill_id;
    
    SELECT COALESCE(display_name, username, 'Someone') INTO v_owner_name
    FROM public.user_profiles WHERE id = NEW.owner_id;
    
    SELECT COALESCE(display_name, username, 'Someone') INTO v_shared_name
    FROM public.user_profiles WHERE id = NEW.shared_with_id;

    -- New bill share invitation
    IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
        INSERT INTO public.notifications (user_id, type, title, body, data)
        VALUES (
            NEW.shared_with_id,
            'bill_shared',
            'Bill Shared With You',
            v_owner_name || ' wants to share "' || COALESCE(v_bill_name, 'a bill') 
                || '" with you — your portion: $' || ROUND(NEW.shared_amount, 2),
            jsonb_build_object(
                'share_id', NEW.id, 
                'bill_id', NEW.bill_id, 
                'owner_id', NEW.owner_id
            )
        );
    END IF;

    -- Bill share accepted
    IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'accepted' THEN
        INSERT INTO public.notifications (user_id, type, title, body, data)
        VALUES (
            NEW.owner_id,
            'bill_share_accepted',
            'Bill Share Accepted',
            v_shared_name || ' accepted the shared bill "' || COALESCE(v_bill_name, '') || '"',
            jsonb_build_object(
                'share_id', NEW.id, 
                'bill_id', NEW.bill_id
            )
        );
    END IF;

    -- Bill share declined
    IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'declined' THEN
        INSERT INTO public.notifications (user_id, type, title, body, data)
        VALUES (
            NEW.owner_id,
            'bill_share_declined',
            'Bill Share Declined',
            v_shared_name || ' declined the shared bill "' || COALESCE(v_bill_name, '') || '"',
            jsonb_build_object(
                'share_id', NEW.id, 
                'bill_id', NEW.bill_id
            )
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bill_share_notifications ON public.bill_shares;
CREATE TRIGGER trg_bill_share_notifications
    AFTER INSERT OR UPDATE ON public.bill_shares
    FOR EACH ROW
    EXECUTE FUNCTION notify_bill_share_change();


-- ============================================================
-- 15. AUTO-RECALCULATE SPLIT AMOUNTS ON BILL UPDATE
-- ============================================================
-- When a bill's amount changes (e.g., email parser detects new amount),
-- all accepted shares are recalculated and both users are notified.

CREATE OR REPLACE FUNCTION recalculate_bill_share_amounts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_share record;
    v_new_owner_amount numeric;
    v_new_shared_amount numeric;
    v_old_shared_amount numeric;
BEGIN
    -- Only run if amount actually changed
    IF OLD.amount IS NOT DISTINCT FROM NEW.amount THEN
        RETURN NEW;
    END IF;

    -- Recalculate all accepted shares for this bill
    FOR v_share IN
        SELECT * FROM public.bill_shares
        WHERE bill_id = NEW.id
        AND status = 'accepted'
    LOOP
        v_old_shared_amount := v_share.shared_amount;
        
        CASE v_share.split_type
            WHEN 'equal' THEN
                v_new_owner_amount := NEW.amount / 2;
                v_new_shared_amount := NEW.amount / 2;
            WHEN 'percentage' THEN
                v_new_owner_amount := NEW.amount * (v_share.owner_percent / 100);
                v_new_shared_amount := NEW.amount * (v_share.shared_percent / 100);
            WHEN 'fixed' THEN
                -- Fixed amounts don't change — but warn if totals don't match
                v_new_owner_amount := v_share.owner_fixed;
                v_new_shared_amount := v_share.shared_fixed;
        END CASE;

        -- Update the share amounts
        UPDATE public.bill_shares
        SET owner_amount = ROUND(v_new_owner_amount, 2),
            shared_amount = ROUND(v_new_shared_amount, 2),
            updated_at = now()
        WHERE id = v_share.id;

        -- Notify OWNER about the bill amount change
        INSERT INTO public.notifications (user_id, type, title, body, data)
        VALUES (
            v_share.owner_id,
            'bill_amount_updated',
            'Shared Bill Updated',
            '"' || NEW.name || '" updated: $' || OLD.amount || ' → $' || NEW.amount 
                || ' (your share: $' || ROUND(v_new_owner_amount, 2) || ')',
            jsonb_build_object(
                'share_id', v_share.id, 
                'bill_id', NEW.id, 
                'old_amount', OLD.amount, 
                'new_amount', NEW.amount
            )
        );

        -- Notify SHARED USER about the bill amount change
        INSERT INTO public.notifications (user_id, type, title, body, data)
        VALUES (
            v_share.shared_with_id,
            'bill_amount_updated',
            'Shared Bill Updated',
            '"' || NEW.name || '" updated: $' || OLD.amount || ' → $' || NEW.amount 
                || ' (your share: $' || ROUND(v_new_shared_amount, 2) || ')',
            jsonb_build_object(
                'share_id', v_share.id, 
                'bill_id', NEW.id, 
                'old_amount', v_old_shared_amount, 
                'new_amount', ROUND(v_new_shared_amount, 2)
            )
        );
    END LOOP;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bill_amount_change ON public.bills;
CREATE TRIGGER trg_bill_amount_change
    AFTER UPDATE OF amount ON public.bills
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_bill_share_amounts();


-- ============================================================
-- 16. NOTIFY SHARED USERS WHEN BILL IS DELETED
-- ============================================================
-- Fires BEFORE DELETE so we can still read bill_shares (CASCADE hasn't fired yet)

CREATE OR REPLACE FUNCTION notify_shared_bill_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_share record;
    v_owner_name text;
BEGIN
    SELECT COALESCE(display_name, username, 'A user') INTO v_owner_name
    FROM public.user_profiles WHERE id = OLD.user_id;

    FOR v_share IN
        SELECT * FROM public.bill_shares
        WHERE bill_id = OLD.id 
        AND status IN ('accepted', 'pending')
    LOOP
        INSERT INTO public.notifications (user_id, type, title, body, data)
        VALUES (
            v_share.shared_with_id,
            'bill_deleted',
            'Shared Bill Removed',
            v_owner_name || ' deleted "' || OLD.name || '" which was shared with you',
            jsonb_build_object(
                'bill_name', OLD.name, 
                'owner_id', OLD.user_id
            )
        );
    END LOOP;

    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_bill_deletion_notify ON public.bills;
CREATE TRIGGER trg_bill_deletion_notify
    BEFORE DELETE ON public.bills
    FOR EACH ROW
    EXECUTE FUNCTION notify_shared_bill_deletion();


-- ============================================================
-- 17. WARN ABOUT SHARED BILLS ON CONNECTION REMOVAL
-- ============================================================

CREATE OR REPLACE FUNCTION check_shared_bills_on_disconnect()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_active_shares integer;
    v_other_user uuid;
BEGIN
    -- Determine the other user in this connection
    IF OLD.requester_id = auth.uid() THEN
        v_other_user := OLD.addressee_id;
    ELSE
        v_other_user := OLD.requester_id;
    END IF;

    -- Count active bill shares between these users
    SELECT COUNT(*) INTO v_active_shares
    FROM public.bill_shares
    WHERE status IN ('accepted', 'pending')
    AND (
        (owner_id = auth.uid() AND shared_with_id = v_other_user)
        OR (owner_id = v_other_user AND shared_with_id = auth.uid())
    );

    -- Notify the other user if there are active shares
    IF v_active_shares > 0 THEN
        INSERT INTO public.notifications (user_id, type, title, body, data)
        VALUES (
            v_other_user,
            'connection_removed',
            'Connection Removed',
            'A connection was removed. You still have ' || v_active_shares 
                || ' shared bill(s) — these remain active.',
            jsonb_build_object(
                'removed_by_id', auth.uid(), 
                'active_shares', v_active_shares
            )
        );
    END IF;

    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_connection_removal_check ON public.connections;
CREATE TRIGGER trg_connection_removal_check
    BEFORE DELETE ON public.connections
    FOR EACH ROW
    EXECUTE FUNCTION check_shared_bills_on_disconnect();


-- ============================================================
-- 18. UPDATED BUDGET GENERATION (Shared Bills Aware)
-- ============================================================
-- Replaces the existing generate_monthly_budget function.
-- Now handles:
--   PART 1: Bills the user owns (using owner_amount if shared)
--   PART 2: Bills shared with the user (using shared_amount)

CREATE OR REPLACE FUNCTION generate_monthly_budget(
    p_user_id uuid,
    p_month text  -- format: 'YYYY-MM'
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count integer := 0;
    v_prev_month text;
    v_bill record;
    v_needed numeric;
    v_prev_amount numeric;
    v_share record;
BEGIN
    -- Calculate previous month string
    v_prev_month := to_char(
        (p_month || '-01')::date - interval '1 month',
        'YYYY-MM'
    );

    -- ============================
    -- PART 1: Bills I own
    -- ============================
    FOR v_bill IN
        SELECT b.id, b.name, b.type, b.amount, b.is_variable,
               bs.owner_amount, bs.status AS share_status
        FROM public.bills b
        LEFT JOIN public.bill_shares bs 
            ON bs.bill_id = b.id AND bs.status = 'accepted'
        WHERE b.user_id = p_user_id
          AND b.status = 'active'
    LOOP
        -- Use owner_amount if bill is shared and accepted
        IF v_bill.owner_amount IS NOT NULL AND v_bill.share_status = 'accepted' THEN
            v_needed := v_bill.owner_amount;
        ELSIF v_bill.is_variable = true THEN
            -- Variable bill: use last month's assigned amount as estimate
            SELECT assigned_amount INTO v_prev_amount
            FROM public.budgets
            WHERE user_id = p_user_id
              AND month = v_prev_month
              AND item_id = v_bill.id
              AND item_type = 'bill'
            LIMIT 1;
            v_needed := COALESCE(v_prev_amount, v_bill.amount);
        ELSE
            v_needed := v_bill.amount;
        END IF;

        INSERT INTO public.budgets (
            user_id, month, item_id, item_type,
            name, category, needed_amount, assigned_amount
        )
        VALUES (
            p_user_id, p_month, v_bill.id, 'bill',
            v_bill.name, v_bill.type, v_needed, v_needed
        )
        ON CONFLICT (user_id, month, item_id)
        DO UPDATE SET
            needed_amount = EXCLUDED.needed_amount,
            name = EXCLUDED.name,
            category = EXCLUDED.category;

        v_count := v_count + 1;
    END LOOP;

    -- ============================
    -- PART 2: Bills shared with me
    -- ============================
    FOR v_share IN
        SELECT bs.id AS share_id, bs.bill_id, bs.shared_amount,
               b.name, b.type, b.is_variable
        FROM public.bill_shares bs
        JOIN public.bills b ON b.id = bs.bill_id
        WHERE bs.shared_with_id = p_user_id
          AND bs.status = 'accepted'
          AND b.status = 'active'
    LOOP
        INSERT INTO public.budgets (
            user_id, month, item_id, item_type,
            name, category, needed_amount, assigned_amount
        )
        VALUES (
            p_user_id, p_month, v_share.bill_id, 'shared_bill',
            v_share.name || ' (shared)', v_share.type,
            v_share.shared_amount, v_share.shared_amount
        )
        ON CONFLICT (user_id, month, item_id)
        DO UPDATE SET
            needed_amount = EXCLUDED.needed_amount,
            name = EXCLUDED.name,
            category = EXCLUDED.category;

        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$;


-- ============================================================
-- 19. NOTIFICATION CLEANUP FUNCTION (Optional)
-- ============================================================
-- Call periodically to remove old read notifications (>90 days)
-- Usage: SELECT cleanup_old_notifications();

CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted integer;
BEGIN
    DELETE FROM public.notifications
    WHERE is_read = true
    AND created_at < now() - interval '90 days';
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$$;


-- ============================================================
-- 20. HELPER: CHECK IF TWO USERS ARE CONNECTED
-- ============================================================
-- Usage: SELECT are_users_connected('uuid-a', 'uuid-b');

CREATE OR REPLACE FUNCTION are_users_connected(user_a uuid, user_b uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.connections
        WHERE status = 'accepted'
        AND (
            (requester_id = user_a AND addressee_id = user_b)
            OR (requester_id = user_b AND addressee_id = user_a)
        )
    );
$$;


-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
--
-- New tables:
--   user_profiles    — Public user info (username, display name, avatar)
--   connections      — Friend/partner relationships
--   bill_shares      — Shared bill mappings with split ratios
--   notifications    — In-app notification queue
--
-- New RLS policies:
--   user_profiles    — Own profile CRUD + authenticated search
--   connections      — View/manage own connections
--   bill_shares      — View own shares, owners create, both update
--   bills (extended) — Shared users can READ shared bills
--   notifications    — Own notifications only
--
-- New triggers:
--   trg_create_profile_on_signup   — Auto-create profile on user registration
--   trg_connection_notifications   — Notify on friend request / accept
--   trg_bill_share_notifications   — Notify on bill share / accept / decline
--   trg_bill_amount_change         — Recalculate splits when bill amount changes
--   trg_bill_deletion_notify       — Notify shared users when bill is deleted
--   trg_connection_removal_check   — Warn about active shares on unfriend
--
-- Updated functions:
--   generate_monthly_budget()      — Now handles shared bills
--
-- New functions:
--   search_users_by_email()        — Secure email-based user search
--   are_users_connected()          — Check if two users are friends
--   cleanup_old_notifications()    — Purge old read notifications
--
-- NEXT STEPS:
--   1. Enable Realtime on: notifications, bill_shares, connections
--      (Supabase Dashboard → Database → Replication)
--   2. Deploy frontend changes (friends page, share UI, notification bell)
--   3. Test with two user accounts
-- ============================================================
