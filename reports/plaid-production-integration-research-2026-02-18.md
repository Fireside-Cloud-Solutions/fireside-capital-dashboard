# Plaid Production Integration Research
**Date:** 2026-02-18 04:33 AM EST
**Session:** Sprint Research cron f6500924

---

## Executive Summary

The current Plaid integration is **non-functional**. `plaid.js` calls `/create_link_token` and `/exchange_public_token` which are dead endpoints — the Azure Static Web App has no server-side Plaid handler. The Plaid npm package is installed but never used. Moving to production requires building the full Azure Functions backend *first*.

This research covers: what's missing, the production requirements, the correct architecture for Azure Static Web Apps + Plaid, and 8 implementation tasks.

---

## Current State Audit

### What's Broken Right Now

| Layer | Issue | Impact |
|-------|-------|--------|
| `plaid.js` fetch `/create_link_token` | No Azure Function exists at this route | Link never opens in production (404) |
| `plaid.js` fetch `/exchange_public_token` | No Azure Function exists at this route | Public token exchange never happens |
| `plaid` npm package | Installed in `app/node_modules` — cannot run in static web app | Server-side Plaid calls impossible without Azure Functions |
| Access token storage | Not stored anywhere — DB table missing | Even if exchange worked, tokens would be lost |
| Webhook receiver | No endpoint exists | Transaction sync webhooks never received |
| `onExit` error handler | Empty (`if (err != null) {}`) | Errors silently swallowed |
| `alert()` calls | `plaid.js` uses `alert()` (BUG-UX-ALERT-001) | Blocking dialogs, unstyled on mobile |

### Root Cause
**`plaid.js` was built expecting an Express server** (`server.js`) that was never created. The architecture must be Azure Functions (`/api` folder).

---

## Production Requirements Checklist

### 1. Plaid Dashboard Steps (Human Required — Matt)

| Step | Required For | Status |
|------|-------------|--------|
| Complete Application Profile (name, logo, website) | US OAuth institutions (Chase, WF) | ❌ Unknown |
| Complete Company Profile | OAuth registration | ❌ Unknown |
| Complete Security Questionnaire | US OAuth institutions | ❌ Unknown |
| Set use-case description in Link Customization | Required for accounts after Oct 31, 2024 | ❌ Unknown |
| Request Production Access | All live bank connections | ❌ Not requested |
| Register OAuth redirect URIs | Mobile OAuth flow | ❌ Not configured |

### 2. Code Requirements (Automated — Agent Work)

| Requirement | Priority |
|-------------|----------|
| Azure Function: `/api/create-link-token` | P1 |
| Azure Function: `/api/exchange-public-token` | P1 |
| Azure Function: `/api/transactions-sync` | P1 |
| Azure Function: `/api/webhooks/plaid` | P1 |
| Supabase table: `plaid_items` (access tokens) | P1 |
| plaid.js OAuth redirect support | P1 |
| plaid.js update mode (ITEM_LOGIN_REQUIRED) | P1 |
| Replace alert() in plaid.js → Toast | P2 |

---

## Correct Architecture for Azure Static Web App + Plaid

```
Browser                     Azure Static Web App           Plaid API
  |                              |                              |
  |  1. Click "Connect Bank"     |                              |
  |----------------------------->|                              |
  |                              |  POST /api/create-link-token |
  |                              |----------------------------->|
  |                              |   returns link_token         |
  |                              |<-----------------------------|
  |  link_token                  |                              |
  |<-----------------------------|                              |
  |                              |                              |
  |  2. Plaid Link opens, user logs in to their bank           |
  |                              |                              |
  |  3. onSuccess(public_token)  |                              |
  |  POST /api/exchange-public-token                            |
  |----------------------------->|                              |
  |                              |  POST /item/public_token/exchange
  |                              |----------------------------->|
  |                              |   returns access_token       |
  |                              |<-----------------------------|
  |                              |  Store in plaid_items table  |
  |                              |  (server-side only, RLS)     |
  |  { success: true }           |                              |
  |<-----------------------------|                              |
  |                              |                              |
  |  4. POST /api/transactions-sync (triggered by webhook)     |
  |                              |  GET /transactions/sync      |
  |                              |----------------------------->|
  |                              |   returns added/removed/modified
  |                              |<-----------------------------|
  |                              |  Upsert into transactions    |
  |                              |  table (Supabase)            |
  |                              |                              |
  |                              |  5. Plaid fires webhook      |
  |                              |<-----------------------------|
  |                              |  POST /api/webhooks/plaid    |
  |                              |  (SYNC_UPDATES_AVAILABLE)    |
  |                              |  Queue: call transactions-sync
```

---

## Azure Functions Implementation

### Function 1: `create-link-token`

```javascript
// api/create-link-token/index.js
const { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } = require('plaid');

const plaidConfig = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});
const plaidClient = new PlaidApi(plaidConfig);

module.exports = async function (context, req) {
  try {
    // Get user_id from Supabase JWT in Authorization header
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      context.res = { status: 401, body: { error: 'Unauthorized' } };
      return;
    }

    // Verify Supabase JWT (use Supabase admin client or verify JWKS)
    const userId = await verifySupabaseToken(authHeader.replace('Bearer ', ''));
    if (!userId) {
      context.res = { status: 401, body: { error: 'Invalid token' } };
      return;
    }

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: 'Fireside Capital',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
      webhook: `${process.env.APP_URL}/api/webhooks/plaid`,
      // OAuth redirect URI (required for mobile + major banks)
      redirect_uri: process.env.PLAID_REDIRECT_URI,
    });

    context.res = {
      status: 200,
      body: { link_token: response.data.link_token }
    };
  } catch (error) {
    console.error('[Plaid] create-link-token error:', error.response?.data || error.message);
    context.res = { status: 500, body: { error: 'Failed to create link token' } };
  }
};
```

### Function 2: `exchange-public-token`

```javascript
// api/exchange-public-token/index.js
module.exports = async function (context, req) {
  try {
    const { public_token, institution_name, institution_id } = req.body;
    const userId = await verifySupabaseToken(req.headers['authorization']?.replace('Bearer ', ''));
    if (!userId) {
      context.res = { status: 401, body: { error: 'Unauthorized' } };
      return;
    }

    // Exchange public_token → access_token (server-side ONLY — never expose to client)
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({ public_token });
    const { access_token, item_id } = exchangeResponse.data;

    // Store in Supabase (server-side with service role key — bypasses RLS)
    // The SERVICE ROLE KEY must NEVER go to the client
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY  // ← NOT the anon key
    );

    await supabaseAdmin.from('plaid_items').upsert({
      user_id: userId,
      item_id,
      access_token,          // ← NEVER returned to client
      institution_name,
      institution_id,
      cursor: null,          // Initial cursor for /transactions/sync
      status: 'active',
      created_at: new Date().toISOString(),
    }, { onConflict: 'item_id' });

    // Trigger initial transaction sync
    await triggerTransactionSync(userId, access_token, item_id, supabaseAdmin);

    context.res = {
      status: 200,
      body: { success: true, item_id, institution_name }
    };
  } catch (error) {
    console.error('[Plaid] exchange-public-token error:', error.response?.data || error.message);
    context.res = { status: 500, body: { error: 'Failed to exchange token' } };
  }
};
```

### Function 3: `transactions-sync`

```javascript
// api/transactions-sync/index.js
// Called by webhook receiver AND on-demand from client
async function syncTransactions(userId, accessToken, itemId, supabaseAdmin) {
  // Get current cursor for this Item
  const { data: item } = await supabaseAdmin
    .from('plaid_items')
    .select('cursor')
    .eq('item_id', itemId)
    .single();

  let cursor = item?.cursor || undefined;
  let hasMore = true;
  const allAdded = [], allModified = [], allRemoved = [];

  while (hasMore) {
    const response = await plaidClient.transactionsSync({
      access_token: accessToken,
      cursor,
      count: 500,
    });

    const data = response.data;
    allAdded.push(...data.added);
    allModified.push(...data.modified);
    allRemoved.push(...data.removed);
    hasMore = data.has_more;
    cursor = data.next_cursor;

    // CRITICAL: If mutation during pagination, restart with old cursor
    // (Plaid returns TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION error)
  }

  // Upsert added/modified transactions
  if (allAdded.length + allModified.length > 0) {
    const txns = [...allAdded, ...allModified].map(t => ({
      user_id: userId,
      plaid_transaction_id: t.transaction_id,
      account_id: t.account_id,
      amount: Math.abs(t.amount),
      type: t.amount > 0 ? 'expense' : 'income',  // Plaid: positive = debit
      description: t.merchant_name || t.name,
      merchant_name: t.merchant_name,
      category: t.personal_finance_category?.primary || 'uncategorized',
      date: t.date,
      pending: t.pending,
      logo_url: t.logo_url,
    }));
    await supabaseAdmin.from('transactions').upsert(txns, { onConflict: 'plaid_transaction_id' });
  }

  // Delete removed transactions
  if (allRemoved.length > 0) {
    const ids = allRemoved.map(t => t.transaction_id);
    await supabaseAdmin.from('transactions').delete().in('plaid_transaction_id', ids);
  }

  // Save new cursor
  await supabaseAdmin.from('plaid_items')
    .update({ cursor, last_synced: new Date().toISOString() })
    .eq('item_id', itemId);

  return { added: allAdded.length, modified: allModified.length, removed: allRemoved.length };
}
```

### Function 4: `webhooks-plaid` (Webhook Receiver)

```javascript
// api/webhooks-plaid/index.js
// CRITICAL: Respond within 10 seconds — just queue the work, don't do it here
module.exports = async function (context, req) {
  // Optional: Verify webhook signature from Plaid
  // X-Plaid-Verification-Token header → verify JWT against Plaid JWKS
  
  const { webhook_type, webhook_code, item_id, error } = req.body;
  
  // Always acknowledge immediately
  context.res = { status: 200, body: { received: true } };

  // Handle asynchronously (write to queue or process directly for low-volume)
  try {
    switch (`${webhook_type}/${webhook_code}`) {
      case 'TRANSACTIONS/SYNC_UPDATES_AVAILABLE':
        // New transactions ready — trigger sync
        await queueTransactionSync(item_id);
        break;
        
      case 'ITEM/PENDING_DISCONNECT':
        // Bank will disconnect soon — prompt user to re-link
        await supabaseAdmin.from('plaid_items')
          .update({ status: 'pending_disconnect' })
          .eq('item_id', item_id);
        // TODO: Send notification to user
        break;
        
      case 'ITEM/ERROR':
        if (error?.error_code === 'ITEM_LOGIN_REQUIRED') {
          // User changed bank password — mark for update mode
          await supabaseAdmin.from('plaid_items')
            .update({ status: 'needs_reauth', error_code: error.error_code })
            .eq('item_id', item_id);
          // TODO: Send #alerts Discord notification or in-app toast
        }
        break;
    }
  } catch (err) {
    console.error('[Plaid Webhook] Processing error:', err.message);
    // Non-200 response already sent — just log
  }
};
```

---

## Supabase Schema: `plaid_items` Table

```sql
-- Migration 008: plaid_items table for secure access token storage
CREATE TABLE IF NOT EXISTS public.plaid_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,  -- NEVER returned to client via RLS
  institution_name TEXT,
  institution_id TEXT,
  cursor TEXT,                 -- /transactions/sync cursor
  status TEXT NOT NULL DEFAULT 'active'  
    CHECK (status IN ('active', 'pending_disconnect', 'needs_reauth', 'error', 'inactive')),
  error_code TEXT,
  last_synced TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for webhook lookups (by item_id — no user_id needed)
CREATE INDEX idx_plaid_items_item_id ON public.plaid_items(item_id);

-- RLS: Users can see their own items BUT CANNOT see access_token
ALTER TABLE public.plaid_items ENABLE ROW LEVEL SECURITY;

-- SELECT: User can see item metadata (not access_token — filtered by view)
CREATE POLICY "plaid_items_select_own" ON public.plaid_items
  FOR SELECT USING (auth.uid() = user_id);

-- UPDATE/INSERT/DELETE: Only server-side (service role key bypasses RLS)
-- Client can NEVER write to this table

-- Security view: Strip access_token before client can see it
CREATE VIEW public.plaid_items_safe AS
  SELECT id, user_id, item_id, institution_name, institution_id,
         status, error_code, last_synced, created_at
  FROM public.plaid_items;

-- Grant view access (NOT the base table)
GRANT SELECT ON public.plaid_items_safe TO authenticated;
```

---

## Client-Side Changes (plaid.js)

### OAuth Redirect Support (Required for Chase, Wells Fargo)

```javascript
// Check if returning from OAuth redirect
const urlParams = new URLSearchParams(window.location.search);
const oauthStateId = urlParams.get('oauth_state_id');

if (oauthStateId) {
  // User returning from bank OAuth — restore Link session
  const savedLinkToken = sessionStorage.getItem('plaid_link_token');
  if (savedLinkToken) {
    plaidLinkHandler = Plaid.create({
      token: savedLinkToken,
      receivedRedirectUri: window.location.href,  // ← CRITICAL for OAuth return
      onSuccess: handlePlaidSuccess,
      onExit: handlePlaidExit,
      onEvent: handlePlaidEvent,
    });
    plaidLinkHandler.open();
  }
}

async function openPlaidLink() {
  const response = await fetch('/api/create-link-token', {
    headers: {
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
    }
  });
  const { link_token } = await response.json();
  
  // Save token for OAuth return
  sessionStorage.setItem('plaid_link_token', link_token);
  
  plaidLinkHandler = Plaid.create({
    token: link_token,
    onSuccess: handlePlaidSuccess,
    onExit: handlePlaidExit,
    onEvent: handlePlaidEvent,
  });
  plaidLinkHandler.open();
}
```

### Error Handling (onExit + onEvent)

```javascript
function handlePlaidExit(err, metadata) {
  sessionStorage.removeItem('plaid_link_token');
  
  if (err != null) {
    const { error_type, error_code, error_message } = err;
    
    if (error_code === 'INVALID_LINK_TOKEN') {
      // Token expired — create new one
      Toast.warning('Connection session expired. Please try again.');
      openPlaidLink();
      return;
    }
    
    if (error_type === 'INSTITUTION_ERROR') {
      Toast.warning(`Your bank is temporarily unavailable. Please try again later.`);
      return;
    }
    
    // Log for analytics (don't show raw error to user)
    console.warn('[Plaid] Exit error:', { error_type, error_code, institution: metadata?.institution?.name });
    Toast.info('Bank connection cancelled.');
  }
}

function handlePlaidEvent(eventName, metadata) {
  // Key events to track for conversion analytics
  const trackable = ['OPEN', 'HANDOFF', 'ERROR', 'EXIT', 'TRANSITION_VIEW'];
  if (trackable.includes(eventName)) {
    console.log(`[Plaid Analytics] ${eventName}:`, metadata?.view_name || metadata?.error_code || '');
  }
}
```

### Update Mode (ITEM_LOGIN_REQUIRED)

```javascript
async function openPlaidUpdateMode(itemId) {
  // Called when plaid_items_safe shows status = 'needs_reauth'
  const response = await fetch('/api/create-link-token', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ update_mode_item_id: itemId })  // Server passes access_token to Plaid
  });
  const { link_token } = await response.json();
  
  plaidLinkHandler = Plaid.create({
    token: link_token,
    onSuccess: (_, metadata) => {
      Toast.success(`${metadata.institution.name} reconnected successfully!`);
      // Re-trigger transaction sync
    },
    onExit: handlePlaidExit,
    onEvent: handlePlaidEvent,
  });
  plaidLinkHandler.open();
}
```

---

## Security Requirements

| Requirement | Implementation |
|-------------|---------------|
| `access_token` storage | Supabase `plaid_items` table, server-side only (service role key) |
| Client NEVER sees `access_token` | RLS + view that strips the column |
| Supabase service role key | Azure Functions environment variable ONLY — never in client JS |
| Plaid webhook verification | Verify `X-Plaid-Verification-Token` JWT against Plaid JWKS |
| HTTPS required | Azure Static Web Apps provides HTTPS automatically |
| Plaid IP allowlist | 52.21.26.131, 52.21.47.157, 52.41.247.19, 52.88.82.239 |

---

## Environment Variables Needed (Azure Functions)

```bash
# Azure Functions App Settings
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_production_secret      # Different from sandbox!
PLAID_ENV=production                      # 'sandbox' | 'development' | 'production'
PLAID_REDIRECT_URI=https://nice-cliff-05b13880f.2.azurestaticapps.net/transactions.html
APP_URL=https://nice-cliff-05b13880f.2.azurestaticapps.net

SUPABASE_URL=https://qqtiofdqplwycnwplmen.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # ← NEVER the anon key
```

---

## Implementation Order

```
FC-202 (DB migration: plaid_items table + security view)
→ FC-203 (Azure Function: create-link-token)
→ FC-204 (Azure Function: exchange-public-token + transactions-sync)
→ FC-205 (Azure Function: webhooks-plaid receiver)
→ FC-206 (plaid.js: OAuth redirect + update mode + error handling)
→ FC-207 (Matt: Plaid Dashboard compliance checklist)
→ FC-208 (End-to-end test in sandbox → production pilot)
```

**Estimated total:** ~12-16 hours of agent work + 1-2 hours of Matt's dashboard setup time.

**Prerequisite for any of this:** Matt must request Plaid Production access.

---

## What This Unlocks

Once complete:
- Real bank connections for any US institution (including Chase, Wells Fargo via OAuth)
- Automatic transaction sync whenever new transactions appear
- Categorizer Layer 1 + Layer 2 auto-run on each new batch
- Operations Dashboard live-updates via Supabase Realtime (FC-200 + FC-173)
- Payment reminders based on actual account balance
- Safe to Spend calculation using real balance data

---

## New Tasks Created

| ID | Priority | Est | Description |
|----|----------|-----|-------------|
| FC-202 | P1 | 30 min | Supabase migration 008: `plaid_items` table + RLS + `plaid_items_safe` view |
| FC-203 | P1 | 2h | Azure Function: `/api/create-link-token` (+ update mode variant) |
| FC-204 | P1 | 3h | Azure Function: `/api/exchange-public-token` + `transactions-sync` (cursor pattern) |
| FC-205 | P1 | 1h | Azure Function: `/api/webhooks-plaid` (idempotent receiver, PENDING_DISCONNECT + ITEM_LOGIN_REQUIRED handlers) |
| FC-206 | P1 | 2h | Rewrite `plaid.js`: OAuth redirect, `onExit` error types, `onEvent` analytics, update mode, replace alert() → Toast |
| FC-207 | P2 | 30 min | Create `api/package.json` + `api/host.json` + base function boilerplate (copy from `api-disabled` pattern) |
| FC-208 | P1 | 1h | Matt TODO: Plaid Dashboard compliance checklist (profile, security questionnaire, production access request, OAuth redirect URI registration) |
| FC-209 | P3 | 1h | Plaid Link conversion analytics — log `onEvent` data to Supabase `plaid_link_events` table for drop-off analysis |
