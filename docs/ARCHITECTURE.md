# ARCHITECTURE.md — Fireside Capital System Architecture

> **Version:** 2.0 — Phase 2 Architecture Plan  
> **Author:** Architect Agent  
> **Date:** July 2025  
> **Status:** Ready for implementation by Builder agents

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Auth Flow](#2-auth-flow)
3. [Database Schema Improvements](#3-database-schema-improvements)
4. [Plaid Integration Roadmap](#4-plaid-integration-roadmap)
5. [Email Parsing Pipeline](#5-email-parsing-pipeline)
6. [Budget System Redesign](#6-budget-system-redesign)
7. [Reports & Analytics](#7-reports--analytics)
8. [Priority Roadmap](#8-priority-roadmap)

---

## 1. System Overview

### Current Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Azure Static Web Apps                  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Static HTML Pages (8 pages)                      │  │
│  │  index.html | assets | investments | debts        │  │
│  │  bills | income | budget | reports | settings     │  │
│  │                                                    │  │
│  │  assets/js/app.js  (1,186 lines — monolith)      │  │
│  │  assets/css/styles.css                            │  │
│  └────────────────────┬──────────────────────────────┘  │
│                       │ Supabase JS SDK (CDN)            │
└───────────────────────┼──────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                     Supabase                             │
│  ┌─────────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │  PostgreSQL  │  │   Auth   │  │   RLS Policies   │   │
│  │  8 tables    │  │  Email   │  │  user_id filter  │   │
│  └─────────────┘  └──────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│               ❌ Dead Code (Not Connected)               │
│  server.js (Express/Plaid) — Can't run on Azure SWA    │
│  plaid.js (hardcoded token, never imported)              │
│  authentication.js (wrong Supabase URL, unused)          │
│  transactions.js (localStorage — replaced by app.js)     │
│  charts.js (ES module exports — never imported)          │
│  budget.js (localStorage — replaced by app.js)           │
│  .env (Plaid secrets committed to GitHub ⚠️)             │
└─────────────────────────────────────────────────────────┘
```

### Target Architecture (Phase 2)

```
┌─────────────────────────────────────────────────────────┐
│                    Azure Static Web Apps                  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Static HTML Pages                                │  │
│  │  Modular JS: auth.js | data.js | render.js        │  │
│  │  budget.js | charts.js | reports.js               │  │
│  └────────────────────┬──────────────────────────────┘  │
└───────────────────────┼──────────────────────────────────┘
                        │
            ┌───────────┼───────────┐
            ▼           ▼           ▼
┌────────────────┐ ┌─────────┐ ┌─────────────────────┐
│   Supabase DB  │ │  Auth   │ │  Edge Functions      │
│  12+ tables    │ │  Email  │ │  plaid-link-token    │
│  + indexes     │ │  OAuth  │ │  plaid-exchange      │
│  + RLS         │ │         │ │  plaid-sync          │
└────────────────┘ └─────────┘ │  email-scan          │
                               │  generate-report     │
                               └─────────────────────┘
                                        │
                        ┌───────────────┼────────────────┐
                        ▼               ▼                ▼
                  ┌──────────┐   ┌───────────┐   ┌──────────┐
                  │  Plaid   │   │ Gmail API │   │ OpenAI   │
                  │  API     │   │ OAuth2    │   │ (extract │
                  │          │   │           │   │  bills)  │
                  └──────────┘   └───────────┘   └──────────┘
```

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Server-side logic | Supabase Edge Functions (Deno) | No separate backend needed; free tier handles our volume; same project as DB |
| Plaid token exchange | Edge Function, not Azure Function | Keep all backend in Supabase ecosystem; simpler deployment |
| Email parsing AI | OpenAI API via Edge Function | GPT-4o-mini is cheap (~$0.01/email), high accuracy for extraction |
| Report generation | Client-side Chart.js + server-side PDF | Charts render in browser; PDF export via Edge Function using jsPDF |
| Real-time sync | Supabase Realtime subscriptions | Already included in Supabase; no extra infrastructure |

---

## 2. Auth Flow

### 2.1 Current State

The auth system works but has issues:

- **`authentication.js`** — Points to the **old** Supabase project (`bgsdnlkhwgbdbdvmhrzv`). This file is dead code and should be deleted.
- **`app.js`** — Has the **correct** Supabase URL and contains all auth logic inline (signUp, login, logout, onAuthStateChange). This is the active code.
- **Modals** — Login/signup modals exist on `index.html` but were missing on sub-pages. Builder is adding them.
- **Session persistence** — Supabase JS SDK stores JWT in `localStorage` automatically. `onAuthStateChange` fires `INITIAL_SESSION` on page load if a token exists.
- **No email confirmation enforcement** — Supabase sends a confirmation email, but users can log in before confirming.

### 2.2 Correct Auth Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Sign Up    │────▶│  Supabase    │────▶│  Confirm     │
│   Form       │     │  auth.signUp │     │  Email Sent  │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                                  ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Dashboard  │◀────│  onAuthState │◀────│  User clicks │
│   Rendered   │     │  SIGNED_IN   │     │  confirm link│
└──────────────┘     └──────────────┘     └──────────────┘
                           ▲
                           │
┌──────────────┐     ┌──────────────┐
│   Login      │────▶│  signInWith  │
│   Form       │     │  Password    │
└──────────────┘     └──────────────┘
```

### 2.3 Implementation Requirements

#### A. Supabase Dashboard Configuration

| Setting | Value | Location |
|---------|-------|----------|
| Site URL | `https://nice-cliff-05b13880f.5.azurestaticapps.net` | Auth → URL Configuration |
| Redirect URLs | `https://nice-cliff-05b13880f.5.azurestaticapps.net/**` | Auth → URL Configuration |
| Redirect URLs (dev) | `http://localhost:*/**` | Auth → URL Configuration |
| Email confirmations | **Enabled** (default) | Auth → Email |
| Confirm email before login | **Recommended: Enable** | Auth → Settings → "Confirm email" |

#### B. Auth State Handler (Current — Keep)

The current `onAuthStateChange` in `app.js` is mostly correct. The flow:

1. Page loads → `supabase.auth.onAuthStateChange()` registered
2. Supabase SDK checks `localStorage` for existing JWT
3. If valid session: fires `INITIAL_SESSION` event with session
4. `handleAuthStateChange()` sets `currentUser`, shows UI, fetches data
5. If no session: fires `INITIAL_SESSION` with `null` session → shows login/signup

#### C. Files to Delete (Dead Code)

| File | Reason |
|------|--------|
| `assets/js/authentication.js` | Points to old Supabase project; all auth logic is in `app.js` |
| `assets/js/transactions.js` | Uses `localStorage`; all CRUD is in `app.js` with Supabase |
| `assets/js/budget.js` | Uses `localStorage`; budget logic is in `app.js` with Supabase |
| `assets/js/charts.js` | ES module exports but never imported; chart code is in `app.js` |
| `assets/js/utility.js` | ES module exports but never imported; utility functions are in `app.js` |

**Builder Task:** Delete these 5 files. They are vestiges of the pre-Supabase era. All their functionality exists (improved) in `app.js`.

#### D. Auth Guard for All Pages

Every page already loads `app.js` which runs `onAuthStateChange`. The `dataContainer` visibility pattern hides data when logged out. This is correct but should be hardened:

```javascript
// Add to app.js init() — redirect to index if not authenticated on sub-pages
supabase.auth.onAuthStateChange((event, session) => {
  if (!session && window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
    window.location.href = '/index.html';
  }
});
```

### 2.4 Future: OAuth Providers

When adding Google/GitHub OAuth login:

1. Enable provider in Supabase Dashboard → Auth → Providers
2. Add OAuth credentials (client ID/secret)
3. Add social login buttons to modals
4. Supabase handles redirect flow automatically

---

## 3. Database Schema Improvements

### 3.1 Current Schema Assessment

The current 8-table schema is **clean and functional** for the core use case. The new Supabase project avoided the column naming issues from the old DB (no more `nextduedate` vs `"nextDueDate"` duplicates).

**Issues found:**

| Issue | Table | Details |
|-------|-------|---------|
| Orphan columns in budgets | `budgets` | Has `name`, `category`, `needed_amount` fields that are always NULL when linking to bills/debts. Only populated for custom budget items. |
| No `startingBalance` in investments | `investments` | Column exists but isn't always used — some records have it, some don't. This is fine. |
| No transaction tracking | All | No way to record actual spending/payment activity. Budget can assign amounts but can't track what was actually spent. |
| No categories table | — | Bill/debt `type` is freeform text. No normalization. |
| No goals table | — | Emergency fund goal is in `settings`, but no generic goal tracking. |
| No linked accounts table | — | When Plaid integration goes live, need to store linked bank accounts. |

### 3.2 New Tables

#### `transactions` — Core spending/payment tracking

```sql
CREATE TABLE public.transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    
    -- Core fields
    date date NOT NULL,
    amount numeric NOT NULL,                    -- Positive = income, Negative = expense
    name text NOT NULL,                         -- "Starbucks", "Paycheck from HII"
    description text,                           -- Optional memo
    
    -- Categorization
    category text,                              -- "Dining", "Utilities", "Income"
    subcategory text,                           -- "Coffee", "Electric", "Salary"
    
    -- Linking
    bill_id uuid REFERENCES public.bills(id) ON DELETE SET NULL,
    debt_id uuid REFERENCES public.debts(id) ON DELETE SET NULL,
    income_id uuid REFERENCES public.income(id) ON DELETE SET NULL,
    budget_id uuid REFERENCES public.budgets(id) ON DELETE SET NULL,
    
    -- Source tracking
    source text NOT NULL DEFAULT 'manual',      -- 'manual', 'plaid', 'email', 'recurring'
    plaid_transaction_id text,                  -- Plaid's unique ID for deduplication
    
    -- Status
    is_pending boolean DEFAULT false,
    is_recurring boolean DEFAULT false
);

-- Indexes for common queries
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX idx_transactions_user_category ON public.transactions(user_id, category);
CREATE INDEX idx_transactions_plaid_id ON public.transactions(plaid_transaction_id) WHERE plaid_transaction_id IS NOT NULL;
CREATE INDEX idx_transactions_bill_id ON public.transactions(bill_id) WHERE bill_id IS NOT NULL;
CREATE INDEX idx_transactions_debt_id ON public.transactions(debt_id) WHERE debt_id IS NOT NULL;

-- RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own transactions" ON public.transactions 
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

#### `linked_accounts` — Plaid bank connections

```sql
CREATE TABLE public.linked_accounts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    
    -- Plaid fields
    plaid_item_id text NOT NULL,                -- Plaid Item ID
    plaid_access_token text NOT NULL,           -- Encrypted access token (stored server-side only)
    plaid_institution_id text,                  -- "ins_1" etc.
    institution_name text,                      -- "Chase", "Bank of America"
    
    -- Account details (from Plaid)
    accounts jsonb,                             -- Array of account objects with mask, name, type
    
    -- Sync state
    last_synced_at timestamptz,
    sync_cursor text,                           -- Plaid sync cursor for incremental sync
    status text DEFAULT 'active',               -- 'active', 'error', 'disconnected'
    error_message text,
    
    CONSTRAINT linked_accounts_plaid_item_unique UNIQUE (user_id, plaid_item_id)
);

-- RLS
ALTER TABLE public.linked_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own linked accounts" ON public.linked_accounts 
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

> **⚠️ Security Note:** `plaid_access_token` must NEVER be exposed to the client. This column should have an additional RLS policy or be excluded from client-facing queries. Alternatively, store tokens in Supabase Vault (encrypted secrets). See Section 4 for details.

#### `categories` — Normalized spending categories

```sql
CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,  -- NULL = system default
    name text NOT NULL,
    parent_category text,                       -- For subcategories
    icon text,                                  -- Bootstrap icon class
    color text,                                 -- Hex color for charts
    is_system boolean DEFAULT false,            -- true = can't be deleted
    
    CONSTRAINT categories_unique_per_user UNIQUE (user_id, name)
);

-- Seed system defaults
INSERT INTO public.categories (name, parent_category, icon, color, is_system, user_id) VALUES
    ('Housing', NULL, 'bi-house', '#4e73df', true, NULL),
    ('Utilities', 'Housing', 'bi-lightning', '#36b9cc', true, NULL),
    ('Transportation', NULL, 'bi-car-front', '#f6c23e', true, NULL),
    ('Food & Dining', NULL, 'bi-cup-hot', '#e74a3b', true, NULL),
    ('Groceries', 'Food & Dining', 'bi-cart', '#e74a3b', true, NULL),
    ('Healthcare', NULL, 'bi-heart-pulse', '#6f42c1', true, NULL),
    ('Insurance', NULL, 'bi-shield-check', '#20c997', true, NULL),
    ('Entertainment', NULL, 'bi-film', '#fd7e14', true, NULL),
    ('Shopping', NULL, 'bi-bag', '#d63384', true, NULL),
    ('Personal Care', NULL, 'bi-person', '#0dcaf0', true, NULL),
    ('Education', NULL, 'bi-book', '#198754', true, NULL),
    ('Savings', NULL, 'bi-piggy-bank', '#1cc88a', true, NULL),
    ('Debt Payments', NULL, 'bi-credit-card', '#858796', true, NULL),
    ('Income', NULL, 'bi-cash-stack', '#1cc88a', true, NULL),
    ('Other', NULL, 'bi-three-dots', '#adb5bd', true, NULL);

-- RLS: Users see system categories (user_id IS NULL) + their own
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see system + own categories" ON public.categories 
    FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Users manage own categories" ON public.categories 
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

#### `goals` — Financial goals tracker

```sql
CREATE TABLE public.goals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    
    name text NOT NULL,                         -- "Emergency Fund", "Vacation 2026"
    type text NOT NULL,                         -- 'savings', 'debt_payoff', 'net_worth', 'custom'
    target_amount numeric NOT NULL,
    current_amount numeric DEFAULT 0,
    target_date date,                           -- Optional deadline
    
    -- Linking (optional — goal can track a specific account/debt)
    linked_investment_id uuid REFERENCES public.investments(id) ON DELETE SET NULL,
    linked_debt_id uuid REFERENCES public.debts(id) ON DELETE SET NULL,
    
    status text DEFAULT 'active',               -- 'active', 'completed', 'paused'
    notes text
);

CREATE INDEX idx_goals_user_status ON public.goals(user_id, status);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own goals" ON public.goals 
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

### 3.3 Index Recommendations for Existing Tables

```sql
-- These indexes improve the most common query patterns

-- Snapshots: fetched by user sorted by date (net worth chart)
CREATE INDEX idx_snapshots_user_date ON public.snapshots(user_id, date DESC);

-- Bills/Debts: filtered by user, sorted by due date (upcoming payments)
CREATE INDEX idx_bills_user_due ON public.bills(user_id, "nextDueDate");
CREATE INDEX idx_debts_user_due ON public.debts(user_id, "nextDueDate");

-- Budgets: queried by user + month (budget page load)
CREATE INDEX idx_budgets_user_month ON public.budgets(user_id, month);

-- Income: filtered by user (dashboard calculation)
CREATE INDEX idx_income_user ON public.income(user_id);

-- Investments: filtered by user (dashboard totals)
CREATE INDEX idx_investments_user ON public.investments(user_id);
```

### 3.4 Schema Migration Plan

**Builder Task:** Create `app/Supabase/migration_v2.sql` with all new tables and indexes. The migration should be:
1. Idempotent — safe to run multiple times (use `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`)
2. Non-destructive — never drops existing tables
3. Documented — comments explaining each change

### 3.5 Settings Table Enhancement

Extend the `settings` table for new features:

```sql
ALTER TABLE public.settings 
    ADD COLUMN IF NOT EXISTS plaid_enabled boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS email_scan_enabled boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS email_provider text,            -- 'gmail', 'outlook'
    ADD COLUMN IF NOT EXISTS email_oauth_token jsonb,        -- Encrypted OAuth tokens
    ADD COLUMN IF NOT EXISTS report_frequency text DEFAULT 'monthly',  -- 'weekly', 'monthly', 'none'
    ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"upcoming_bills": true, "budget_alerts": true, "goal_milestones": true}'::jsonb;
```

---

## 4. Plaid Integration Roadmap

### 4.1 Current State (Broken)

| Component | Status | Problem |
|-----------|--------|---------|
| `server.js` | ❌ Dead code | Express server can't run on Azure Static Web Apps |
| `plaid.js` | ❌ Dead code | Has `'YOUR_LINK_TOKEN'` hardcoded; module never imported by any page |
| `.env` | ⚠️ Security risk | Contains real Plaid sandbox credentials committed to GitHub |
| Sidebar link | ❌ Broken | `onclick="openPlaidLink()"` calls undefined function (plaid.js not loaded) |
| `node_modules/plaid` | ❌ Wasted space | Server-side SDK installed but can never run in browser |

### 4.2 Architecture: Supabase Edge Functions

The Plaid flow requires server-side token handling. Since Azure Static Web Apps doesn't support a backend, we'll use **Supabase Edge Functions** (Deno runtime).

```
┌─────────┐   1. Click "Connect Account"    ┌─────────────────┐
│ Browser  │ ──────────────────────────────▶ │ Edge Function:   │
│          │   POST /functions/v1/           │ plaid-link-token │
│          │       plaid-link-token          │                  │
│          │ ◀────────────────────────────── │ Returns:         │
│          │   { link_token: "..." }         │ link_token       │
│          │                                 └──────┬──────────┘
│          │                                        │ Calls Plaid API
│          │                                        ▼
│          │                                 ┌──────────────┐
│          │   2. Opens Plaid Link modal     │  Plaid API   │
│          │ ──────────────────────────────▶ │  Sandbox /   │
│          │                                 │  Production  │
│          │   3. User selects bank,         └──────────────┘
│          │      enters credentials         
│          │                                 
│          │   4. Plaid returns public_token  
│          │                                 
│          │   5. Exchange token              ┌─────────────────┐
│          │ ──────────────────────────────▶ │ Edge Function:   │
│          │   POST /functions/v1/           │ plaid-exchange   │
│          │       plaid-exchange            │                  │
│          │   { public_token: "..." }       │ Exchanges token, │
│          │                                 │ stores in DB     │
│          │ ◀────────────────────────────── │ Returns:         │
│          │   { success: true,              │ account info     │
│          │     accounts: [...] }           └─────────────────┘
└─────────┘
```

### 4.3 Edge Function Implementations

#### Function 1: `plaid-link-token`

```typescript
// supabase/functions/plaid-link-token/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from "npm:plaid";

const plaidClient = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments[Deno.env.get("PLAID_ENV") || "sandbox"],
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": Deno.env.get("PLAID_CLIENT_ID")!,
        "PLAID-SECRET": Deno.env.get("PLAID_SECRET")!,
      },
    },
  })
);

serve(async (req) => {
  // Verify JWT from Supabase Auth
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return new Response("Unauthorized", { status: 401 });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return new Response("Unauthorized", { status: 401 });

  // Create Plaid Link token
  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: user.id },
    client_name: "Fireside Capital",
    products: [Products.Auth, Products.Transactions],
    country_codes: [CountryCode.Us],
    language: "en",
  });

  return new Response(JSON.stringify({ link_token: response.data.link_token }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

#### Function 2: `plaid-exchange`

```typescript
// supabase/functions/plaid-exchange/index.ts
// Exchanges public_token → access_token, stores in linked_accounts
// Returns sanitized account info (NEVER returns access_token to client)
```

#### Function 3: `plaid-sync`

```typescript
// supabase/functions/plaid-sync/index.ts
// Uses Plaid Transactions Sync API with cursor-based pagination
// Imports transactions into the transactions table
// Runs on demand or via Supabase cron (pg_cron)
```

### 4.4 Client-Side Integration

Replace the broken `plaid.js` with a clean implementation in `app.js`:

```javascript
// Plaid Link Integration
async function initPlaidLink() {
  if (!currentUser) return alert("Please log in first.");
  
  // 1. Get link token from Edge Function
  const { data, error } = await supabase.functions.invoke('plaid-link-token');
  if (error) return alert("Failed to initialize Plaid: " + error.message);
  
  // 2. Open Plaid Link
  const handler = Plaid.create({
    token: data.link_token,
    onSuccess: async (public_token, metadata) => {
      // 3. Exchange token via Edge Function
      const { data: result, error: exchangeError } = await supabase.functions.invoke('plaid-exchange', {
        body: { public_token, metadata }
      });
      if (exchangeError) return alert("Failed to connect account.");
      
      alert(`Successfully connected ${metadata.institution.name}!`);
      await fetchAllDataFromSupabase();
      renderAll();
    },
    onExit: (err) => {
      if (err) console.error("Plaid Link exited with error:", err);
    }
  });
  
  handler.open();
}
```

### 4.5 Implementation Phases

| Phase | Description | Effort | Blocked By |
|-------|-------------|--------|------------|
| **Phase A** | Delete dead files (`server.js`, `plaid.js`, `.env`). Remove Plaid sidebar link. Remove server-side npm deps. | 1 hour | Nothing |
| **Phase B** | Create `linked_accounts` and `transactions` tables in Supabase | 30 min | Nothing |
| **Phase C** | Build `plaid-link-token` Edge Function, test in sandbox | 2-3 hours | Supabase Edge Functions enabled |
| **Phase D** | Build `plaid-exchange` Edge Function | 2 hours | Phase C |
| **Phase E** | Build `plaid-sync` Edge Function + transaction import | 4-6 hours | Phase D |
| **Phase F** | Client UI for account management + transaction viewing | 4 hours | Phase E |
| **Phase G** | Apply for Plaid production credentials | 1-2 weeks (waiting) | Phase E tested in sandbox |
| **Phase H** | Switch to production, connect real accounts | 1 hour | Phase G approved |

### 4.6 Security Requirements

1. **Delete `.env` from repo immediately** and rotate Plaid credentials
2. Store Plaid secrets in **Supabase Edge Function secrets** (`supabase secrets set PLAID_CLIENT_ID=...`)
3. **Never expose `access_token` to the client** — store only in `linked_accounts` table, query only from Edge Functions
4. Consider using **Supabase Vault** for access token encryption at rest
5. Add `.env` to `.gitignore` (create one if missing)

---

## 5. Email Parsing Pipeline

### 5.1 Overview

Automatically extract bill information from emails (e.g., "Your Verizon bill of $197.77 is due July 21") and create/update bill records in Supabase.

### 5.2 Architecture

```
┌─────────────────┐    OAuth2     ┌─────────────┐
│   Gmail /       │ ◀───────────▶ │  Supabase   │
│   Outlook       │               │  Edge Fn:   │
│   Inbox         │               │  email-scan │
└────────┬────────┘               └──────┬──────┘
         │                               │
         │  Fetch unread bill emails      │ Extract with AI
         │  (label/filter based)          │
         ▼                               ▼
┌─────────────────┐               ┌──────────────┐
│  Email Content  │ ────────────▶ │  OpenAI      │
│  Subject, Body  │               │  GPT-4o-mini │
│  Sender         │               │  Extract:    │
└─────────────────┘               │  - Amount    │
                                  │  - Due date  │
                                  │  - Payee     │
                                  │  - Account # │
                                  └──────┬───────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │  Supabase    │
                                  │  bills table │
                                  │  (upsert)    │
                                  └──────────────┘
```

### 5.3 Gmail OAuth2 Setup

1. **Create Google Cloud Project** → Enable Gmail API
2. **Create OAuth2 credentials** (Web application type)
3. **Redirect URI:** `https://qqtiofdqplwycnwplmen.supabase.co/functions/v1/email-callback`
4. **Scopes needed:** `gmail.readonly`, `gmail.labels`
5. **Store refresh token** in `settings.email_oauth_token` (encrypted)

### 5.4 Edge Function: `email-scan`

```typescript
// supabase/functions/email-scan/index.ts
// 
// Flow:
// 1. Get user's Gmail OAuth token from settings table
// 2. Refresh access token if expired
// 3. Search Gmail for: "label:inbox subject:(bill OR statement OR payment due OR amount due) newer_than:7d"
// 4. For each matching email:
//    a. Get full message body (text/html → text extraction)
//    b. Send to OpenAI with extraction prompt
//    c. Parse structured response: { payee, amount, due_date, account_number }
//    d. Match to existing bill in bills table (by name similarity)
//    e. If match: update amount and nextDueDate
//    f. If no match: create new bill (pending user confirmation)
// 5. Mark processed emails with a label "Fireside/Processed"
```

### 5.5 AI Extraction Prompt

```
You are a bill extraction assistant. Given the following email content, extract:
- payee_name: The company/entity billing (e.g., "Verizon Wireless")
- amount: The dollar amount due (numeric, e.g., 197.77)
- due_date: The payment due date (ISO 8601, e.g., "2025-07-21")
- account_number: Last 4 digits of account if visible (e.g., "4523")
- bill_type: Category (Utility, Insurance, Subscription, Other)

Respond in JSON only. If a field cannot be determined, use null.

Email content:
---
{email_body}
---
```

### 5.6 Scheduling Options

| Method | How | Cost |
|--------|-----|------|
| **Manual trigger** (Phase 1) | "Scan Emails" button on Settings page | Free |
| **Supabase pg_cron** (Phase 2) | `SELECT cron.schedule('email-scan', '0 8 * * *', ...)` | Free (built into Supabase) |
| **Webhook from Gmail** (Phase 3) | Gmail Push Notifications → Edge Function | Complex setup |

**Recommendation:** Start with manual trigger. Add daily cron in Phase 2. Gmail webhooks are overkill for a personal dashboard.

### 5.7 Implementation Phases

| Phase | Description | Effort |
|-------|-------------|--------|
| **Phase A** | Add email settings UI (Settings page: connect Gmail button) | 2 hours |
| **Phase B** | Gmail OAuth2 flow Edge Function (`email-auth`, `email-callback`) | 4 hours |
| **Phase C** | Email scanning Edge Function (`email-scan`) | 4-6 hours |
| **Phase D** | AI extraction with OpenAI | 3 hours |
| **Phase E** | Bill matching + upsert logic | 3 hours |
| **Phase F** | Add "Scan Now" button + results UI | 2 hours |
| **Phase G** | pg_cron for daily auto-scan | 1 hour |

---

## 6. Budget System Redesign

### 6.1 Current State (Half-Baked)

The budget system currently:
- ✅ Lists bills and debts for the selected month
- ✅ Lets you assign dollar amounts to each item
- ✅ Shows funding progress bars
- ✅ Persists assignments to the `budgets` table
- ❌ Has no actual spending tracking ("Spent" column always shows $0.00)
- ❌ Has orphan fields in `budgets` table (`name`, `category`, `needed_amount`) that are NULL for linked items
- ❌ Only shows bills/debts — no way to budget for groceries, gas, entertainment, etc.
- ❌ No rollover logic (unspent budget doesn't carry to next month)
- ❌ Can't budget for investments/savings contributions

### 6.2 Redesigned Budget Model

#### Concept: Envelope Budgeting

Every dollar of income gets assigned to a "budget envelope." Each envelope tracks:
- **Budgeted:** How much you planned to spend
- **Spent:** How much you actually spent (from transactions)
- **Remaining:** Budgeted - Spent

```
┌─────────────────────────────────────────────────────────┐
│                    July 2025 Budget                       │
│                                                           │
│  Income: $12,838          Budgeted: $10,200               │
│  Remaining to budget: $2,638                              │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ BILLS & OBLIGATIONS              Budgeted    Spent   │ │
│  │ ─────────────────────────────────────────────────── │ │
│  │ Mortgage (2700 Bingham Dr)       $1,800      $1,800 │ │
│  │ BMW Lease                        $1,053      $1,053 │ │
│  │ Verizon Wireless                 $197        $197   │ │
│  │ People's Gas                     $86         $86    │ │
│  │ West Penn Power                  $106        $106   │ │
│  │ American Water                   $107        $107   │ │
│  │ Sewage                           $162        $0     │ │
│  │ HOA Fees                         $170        $170   │ │
│  └─────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ DEBT PAYMENTS                    Budgeted    Spent   │ │
│  │ ─────────────────────────────────────────────────── │ │
│  │ Capital One                      $200        $200   │ │
│  │ Robinhood Credit Card            $500        $500   │ │
│  └─────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ SAVINGS & INVESTMENTS            Budgeted    Spent   │ │
│  │ ─────────────────────────────────────────────────── │ │
│  │ Emergency Fund                   $200        $200   │ │
│  │ Robinhood Crypto                 $1,000      $1,000 │ │
│  └─────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ VARIABLE SPENDING                Budgeted    Spent   │ │
│  │ ─────────────────────────────────────────────────── │ │
│  │ Groceries                        $600        $423   │ │
│  │ Gas                              $200        $156   │ │
│  │ Dining Out                       $200        $89    │ │
│  │ Entertainment                    $100        $45    │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 6.3 Updated Budgets Table

The existing `budgets` table schema is close but needs refinement:

```sql
-- Clean up: the current budgets table works, but we should clarify usage

-- Current schema (keep):
-- id, user_id, month, item_id, item_type, assigned_amount, name, category, needed_amount

-- The design intent:
-- LINKED items (bills/debts): item_id references a bill/debt UUID, item_type = 'bill'/'debt'
-- CUSTOM items (groceries, gas): item_id is a generated UUID, item_type = 'custom'
--   → name and category fields are used for custom items
--   → needed_amount is the planned/estimated amount for custom items

-- Add investment linking:
-- item_type can also be 'investment' with item_id referencing investments.id
```

No schema change needed for budgets — the current design supports this. The work is in the **UI and app.js logic**.

### 6.4 Spending Tracking Integration

When `transactions` table exists, budget "Spent" calculation becomes:

```javascript
// For a linked bill budget item (e.g., "Verizon Wireless", item_type = 'bill'):
const spent = transactions
  .filter(t => t.bill_id === budgetItem.item_id 
    && t.date >= monthStart 
    && t.date <= monthEnd)
  .reduce((sum, t) => sum + Math.abs(t.amount), 0);

// For a custom budget item (e.g., "Groceries", item_type = 'custom'):
const spent = transactions
  .filter(t => t.category === budgetItem.category 
    && t.date >= monthStart 
    && t.date <= monthEnd)
  .reduce((sum, t) => sum + Math.abs(t.amount), 0);
```

### 6.5 Builder Implementation Tasks

1. **Budget UI enhancement:** Add sections for Bills, Debts, Investments, Custom Items
2. **Include investments in budget:** Monthly contributions should appear as budget line items
3. **Add "Quick Fill" button:** Auto-assign the `needed` amount to each item
4. **Spent column:** Query `transactions` table for actual spending (shows $0 until transactions exist)
5. **Month rollover:** "Copy from last month" button that duplicates budget assignments
6. **Category totals:** Group budget items by category with subtotals

---

## 7. Reports & Analytics

### 7.1 Current State

The reports page (`reports.html`) is a mostly-empty shell:
- Shows summary cards (Total Investments, Total Debts, Net Worth) — but they show $0 because `renderAll()` doesn't populate them
- Has a Net Worth Over Time chart canvas — uses the same `netWorthTimelineChart` ID as the dashboard, so it piggybacks off `app.js`
- Has an Export button that does nothing
- No actual report generation

The dashboard (`index.html`) has charts but some use fake/computed data:
- **Investment Growth:** Hardcoded `['Jun', 'Jul', 'Aug', 'Sep', 'Oct']` labels, simulated 3% monthly growth
- **Savings Rate:** Computes the same rate for every month (no actual monthly tracking)
- **Spending Categories:** Approximates from bill/debt types (decent, but not real transaction data)

### 7.2 Reports to Build

#### Report 1: Monthly Financial Summary

| Section | Data Source | Chart Type |
|---------|------------|------------|
| Income vs Expenses | `income` + `bills` + `debts` + `transactions` | Stacked bar |
| Savings Rate | `(income - expenses) / income * 100` | Line chart |
| Net Worth Change | `snapshots` delta | Single number + trend arrow |
| Top 5 Expenses | `transactions` grouped by category | Horizontal bar |
| Budget vs Actual | `budgets` + `transactions` | Grouped bar |
| Upcoming Obligations | `bills` + `debts` next 30 days | Table |

#### Report 2: Year-Over-Year Comparison

| Metric | Calculation |
|--------|-------------|
| Net Worth YoY | Current snapshot vs same month last year |
| Income Growth | Sum of income this year vs last year |
| Debt Reduction | Total debt now vs 12 months ago |
| Investment Returns | Investment value growth % |

#### Report 3: Spending Breakdown

| View | Details |
|------|---------|
| By Category | Pie/doughnut chart of spending categories |
| By Payee | Top 10 payees ranked by total spend |
| Trends | Month-over-month spending by category (line chart) |

#### Report 4: Debt Payoff Projections

| Feature | Details |
|---------|---------|
| Payoff timeline | Given current payments, when is each debt at $0? |
| Avalanche vs Snowball | Compare strategies with different ordering |
| Interest saved | How much interest is saved by paying extra |

### 7.3 Fixing Dashboard Charts

**Investment Growth Chart (currently fake):**
```javascript
// CURRENT (fake): Simulates 3% growth per month
const investData = investLabels.map((_, i) => Math.round(startValue * Math.pow(1.03, i)));

// FIXED: Use actual snapshot data + investment values
// Query monthly investment totals from snapshots or compute from investment records
const investmentSnapshots = await getMonthlyInvestmentTotals(); // New function
```

**Builder Task:** Create a new `investment_snapshots` or use `snapshots` table to store monthly investment totals alongside net worth. The daily snapshot currently only stores `netWorth` — it should also store `totalInvestments`, `totalDebts`, `totalAssets`.

**Updated snapshots schema:**
```sql
ALTER TABLE public.snapshots
    ADD COLUMN IF NOT EXISTS "totalInvestments" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "totalDebts" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "totalAssets" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "totalIncome" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "totalExpenses" numeric DEFAULT 0;
```

Then `updateDashboardCards()` saves all these values, not just `netWorth`.

**Savings Rate Chart (currently flat):**
```javascript
// CURRENT (broken): Same rate for every month because it doesn't track monthly actuals
const savingsData = netLabels.map(() => {
  const totalIncome = income.reduce(...); // Same total every month!
  ...
});

// FIXED: Use enhanced snapshots with monthly income/expense totals
```

### 7.4 Export Functionality

#### CSV Export (Client-Side)

```javascript
function exportToCSV(data, filename) {
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).join(',')).join('\n');
  const csv = `${headers}\n${rows}`;
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}
```

#### PDF Export (Client-Side with jsPDF)

```html
<!-- Add to reports.html -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
```

```javascript
async function exportReportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Render charts to canvas, add to PDF
  const reportEl = document.getElementById('reportContent');
  const canvas = await html2canvas(reportEl);
  const imgData = canvas.toDataURL('image/png');
  
  doc.setFontSize(20);
  doc.text('Fireside Capital — Monthly Report', 20, 20);
  doc.setFontSize(12);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
  doc.addImage(imgData, 'PNG', 10, 40, 190, 0);
  
  doc.save(`fireside-report-${new Date().toISOString().slice(0,7)}.pdf`);
}
```

### 7.5 Reports Page Rebuild

**Builder Task:** Rebuild `reports.html` with:

1. **Date range selector** (month picker or custom range)
2. **Report cards:** Income, Expenses, Net Worth Change, Savings Rate
3. **Charts:** All 4 report types from Section 7.2
4. **Export buttons:** CSV (raw data), PDF (formatted report)
5. **Populate summary cards** with actual data on `renderAll()`

---

## 8. Priority Roadmap

### P0: Critical — Fix Broken Things (Builder Handling)

| Task | Status | Effort |
|------|--------|--------|
| Add login/signup modals to all sub-pages | 🔧 In progress | 2 hours |
| Delete dead code files (authentication.js, transactions.js, budget.js, charts.js, utility.js) | 📋 Ready | 30 min |
| Delete `.env` from repo, add `.gitignore` | 📋 Ready | 15 min |
| Remove `server.js` and server-side npm dependencies | 📋 Ready | 30 min |
| Fix reports page to populate data from Supabase | 📋 Ready | 2 hours |
| Fix `renderAll()` to populate report summary cards | 📋 Ready | 30 min |

### P1: High — Make the App Actually Useful

| Task | Priority | Effort | Depends On |
|------|----------|--------|------------|
| **Create `transactions` table** | P1.1 | 1 hour | Nothing |
| **Create `categories` table with defaults** | P1.2 | 1 hour | Nothing |
| **Create `goals` table** | P1.3 | 30 min | Nothing |
| **Add indexes to existing tables** | P1.4 | 30 min | Nothing |
| **Enhance `snapshots` table** with investment/debt/asset/income/expense totals | P1.5 | 1 hour | Nothing |
| **Fix Investment Growth chart** to use real data | P1.6 | 2 hours | P1.5 |
| **Fix Savings Rate chart** to use real data | P1.7 | 2 hours | P1.5 |
| **Manual transaction entry UI** | P1.8 | 4 hours | P1.1, P1.2 |
| **Budget "Spent" column** from transactions | P1.9 | 3 hours | P1.8 |
| **Rebuild reports page** with real charts | P1.10 | 6 hours | P1.5 |
| **Export: CSV and PDF** | P1.11 | 3 hours | P1.10 |

### P2: Medium — Enhanced Features

| Task | Priority | Effort | Depends On |
|------|----------|--------|------------|
| **Plaid sandbox integration** (Edge Functions) | P2.1 | 12 hours | P0 complete |
| **Budget section for investments** | P2.2 | 2 hours | P1.9 |
| **Budget "Quick Fill" and "Copy Month"** | P2.3 | 2 hours | P1.9 |
| **Goals page** (savings goals, debt payoff targets) | P2.4 | 6 hours | P1.3 |
| **Debt payoff projections** (snowball/avalanche) | P2.5 | 4 hours | P1.10 |
| **Transactions page** (view, filter, categorize) | P2.6 | 6 hours | P1.8 |
| **Auto-categorize transactions** with rules | P2.7 | 3 hours | P2.6 |
| **Refactor `app.js`** into modules (auth.js, data.js, render.js, budget.js, charts.js) | P2.8 | 6 hours | All P1 |

### P3: Low — Future Enhancements

| Task | Priority | Effort | Depends On |
|------|----------|--------|------------|
| **Email bill parsing** (Gmail OAuth + AI) | P3.1 | 20 hours | P2.1 |
| **Plaid production** (apply + deploy) | P3.2 | 2 weeks | P2.1 tested |
| **Automatic transaction sync** from Plaid | P3.3 | 8 hours | P3.2 |
| **AI-powered spending insights** | P3.4 | 8 hours | P3.3 |
| **Discord bot integration** (daily summaries to #dashboard) | P3.5 | 6 hours | P1.10 |
| **Bill reminder notifications** to Discord #alerts | P3.6 | 3 hours | P3.5 |
| **Multi-user household support** | P3.7 | 12 hours | P3.2 |
| **Mobile-responsive redesign** | P3.8 | 8 hours | P2.8 |
| **Supabase Realtime** for live updates | P3.9 | 4 hours | P2.8 |

### Effort Summary

| Priority | Tasks | Total Effort |
|----------|-------|-------------|
| P0 (Critical) | 6 tasks | ~6 hours |
| P1 (High) | 11 tasks | ~26 hours |
| P2 (Medium) | 8 tasks | ~41 hours |
| P3 (Low) | 9 tasks | ~71+ hours |

### Recommended Sprint Plan

**Sprint 1 (Week 1-2): Foundation**
- Complete all P0 tasks
- P1.1–P1.5 (database improvements)
- P1.6–P1.7 (fix fake charts)

**Sprint 2 (Week 3-4): Transactions & Budget**
- P1.8 (manual transaction entry)
- P1.9 (budget spent tracking)
- P2.2–P2.3 (budget enhancements)

**Sprint 3 (Week 5-6): Reports & Export**
- P1.10 (rebuild reports page)
- P1.11 (CSV/PDF export)
- P2.5 (debt projections)

**Sprint 4 (Week 7-8): Plaid & Goals**
- P2.1 (Plaid sandbox)
- P2.4 (goals page)
- P2.6 (transactions page)

**Sprint 5+ (Month 3+): Advanced Features**
- P2.8 (code refactor)
- P3.1–P3.3 (email + Plaid production)
- P3.5–P3.6 (Discord integration)

---

## Appendix A: File Inventory & Status

| File | Status | Action |
|------|--------|--------|
| `app.js` (1,186 lines) | ✅ Active — all logic lives here | Keep; refactor later (P2.8) |
| `authentication.js` | ❌ Dead — old Supabase URL | **Delete** |
| `transactions.js` | ❌ Dead — localStorage only | **Delete** |
| `budget.js` | ❌ Dead — localStorage only | **Delete** |
| `charts.js` | ❌ Dead — ES modules never imported | **Delete** |
| `utility.js` | ❌ Dead — ES modules never imported | **Delete** |
| `server.js` | ❌ Dead — Express can't run on SWA | **Delete** |
| `plaid.js` | ❌ Dead — hardcoded token, never imported | **Delete** |
| `.env` | ⚠️ Security risk — secrets in repo | **Delete + add .gitignore** |
| `styles.css` | ✅ Active | Keep |
| `package.json` | ⚠️ Has server-side deps | **Clean up** — remove express, plaid, dotenv, cors, axios |
| `node_modules/` | ⚠️ Should not be in repo | **Add to .gitignore** |
| `Supabase/migration.sql` | ✅ Reference — current schema | Keep as documentation |
| `Supabase/seed_data.sql` | ✅ Reference — sample data | Keep as documentation |

## Appendix B: Supabase Configuration Checklist

- [ ] **Auth → URL Configuration → Site URL:** Set to production Azure URL
- [ ] **Auth → URL Configuration → Redirect URLs:** Add production + localhost URLs
- [ ] **Auth → Email Templates:** Customize confirmation email with Fireside Capital branding
- [ ] **Edge Functions:** Enable and deploy Plaid functions (when ready)
- [ ] **Database → Extensions:** Enable `pg_cron` for scheduled tasks (when ready)
- [ ] **Vault:** Set up for Plaid access token encryption (when ready)

## Appendix C: Environment Variables (Edge Functions)

| Variable | Description | Set Via |
|----------|-------------|---------|
| `PLAID_CLIENT_ID` | Plaid API client ID | `supabase secrets set` |
| `PLAID_SECRET` | Plaid API secret | `supabase secrets set` |
| `PLAID_ENV` | `sandbox` or `production` | `supabase secrets set` |
| `OPENAI_API_KEY` | For email bill extraction | `supabase secrets set` |
| `SUPABASE_URL` | Auto-injected by Supabase | Automatic |
| `SUPABASE_ANON_KEY` | Auto-injected by Supabase | Automatic |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-injected by Supabase | Automatic |
