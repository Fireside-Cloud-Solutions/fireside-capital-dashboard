# Azure Functions Architecture Research
**Sprint Research Topic 14** — Phase 2: Backend API Layer  
**Date:** February 18, 2026 — 6:12 AM EST  
**Researcher:** Capital (Researcher)  
**Target:** Azure Functions backend for Fireside Capital (Plaid + Gmail + scheduled sync)

---

## 📋 Executive Summary

**Critical Discovery:** Azure Static Web Apps' managed Functions only support **HTTP triggers**. Timer/cron triggers require a **separately linked** Azure Functions app. This means:
- Plaid webhook receiver, Plaid link token API, Gmail OAuth exchange → **HTTP Functions in `api/`** ✅
- Gmail background sync (EMAIL-016), daily net worth snapshots → **Separate Azure Function App** ⚠️

**Recommendation:** Build HTTP functions first (FC-203, FC-204, FC-205, EMAIL-016-HTTP). Evaluate linked function app for scheduled sync in Sprint 3+.

---

## 🏗️ Folder Structure (V4 Programming Model)

```
fireside-capital/
├── app/                          ← Static Web App source
│   ├── assets/
│   └── index.html
├── api/                          ← Azure Functions backend
│   ├── src/
│   │   ├── functions/            ← One file per endpoint
│   │   │   ├── create-link-token.js
│   │   │   ├── exchange-public-token.js
│   │   │   ├── transactions-sync.js
│   │   │   ├── webhooks-plaid.js
│   │   │   └── gmail-exchange.js
│   │   └── shared/               ← Shared utilities
│   │       ├── supabase.js       ← Supabase client factory
│   │       ├── auth.js           ← JWT verification helper
│   │       └── errors.js         ← Standard error responses
│   ├── index.js                  ← Entry point (registers functions)
│   ├── host.json
│   ├── local.settings.json       ← Local dev secrets (gitignored)
│   └── package.json
└── .github/
    └── workflows/
        └── azure-static-web-apps-*.yml
```

### `api/host.json`
```json
{
  "version": "2.0",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "excludedTypes": "Request"
      }
    }
  },
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[4.*, 5.0.0)"
  }
}
```

### `api/local.settings.json` (gitignored)
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "SUPABASE_URL": "https://qqtiofdqplwycnwplmen.supabase.co",
    "SUPABASE_SERVICE_ROLE_KEY": "<from Supabase dashboard>",
    "PLAID_CLIENT_ID": "<from .credentials>",
    "PLAID_SECRET_SANDBOX": "<from .credentials>",
    "PLAID_SECRET_PRODUCTION": "<from .credentials>",
    "PLAID_ENV": "sandbox",
    "PLAID_WEBHOOK_URL": "https://nice-cliff-05b13880f.2.azurestaticapps.net/api/webhooks-plaid",
    "GOOGLE_CLIENT_ID": "<from Google Cloud Console>",
    "GOOGLE_CLIENT_SECRET": "<from Google Cloud Console>"
  }
}
```

### `api/package.json`
```json
{
  "name": "fireside-capital-api",
  "version": "1.0.0",
  "description": "Azure Functions API for Fireside Capital",
  "main": "src/index.js",
  "scripts": {
    "start": "func start",
    "test": "jest"
  },
  "dependencies": {
    "@azure/functions": "^4.5.0",
    "@supabase/supabase-js": "^2.49.1",
    "plaid": "^29.0.0",
    "jsonwebtoken": "^9.0.0"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## 🔐 Authentication Pattern

### The Core Challenge
Fireside Capital uses Supabase Auth (JWT). Azure SWA injects its own auth header (`x-ms-client-principal`), but our users authenticate via Supabase, not Azure AD. We need to **verify Supabase JWTs** in our functions.

### Pattern: Bearer Token Verification via `supabase.auth.getUser()`

```javascript
// api/src/shared/auth.js
const { createClient } = require('@supabase/supabase-js');

/**
 * Verify a Supabase JWT and return the user.
 * Uses getUser() which verifies WITH the auth server — not just local decode.
 * This catches revoked sessions, logged-out users, etc.
 * 
 * @param {Request} request - Azure Functions request
 * @returns {{ user, error }} — user if valid, error if not
 */
async function verifySupabaseToken(request) {
  const authHeader = request.headers.get('authorization') || '';
  
  if (!authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Missing Bearer token' };
  }
  
  const token = authHeader.slice(7);
  
  // Create a client with the user's token (respects RLS)
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      global: {
        headers: { Authorization: `Bearer ${token}` }
      },
      auth: { persistSession: false }
    }
  );
  
  // getUser() hits the auth server — more secure than getClaims()
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return { user: null, error: error?.message || 'Invalid token' };
  }
  
  return { user, supabase };
}

module.exports = { verifySupabaseToken };
```

### Pattern: Service Role Client (for privileged operations)

```javascript
// api/src/shared/supabase.js
const { createClient } = require('@supabase/supabase-js');

let _serviceClient = null;

/**
 * Service role client — bypasses RLS.
 * Use ONLY for operations that legitimately need admin access:
 * - Storing Plaid access_token (never returned to client)
 * - Writing to plaid_items table
 * - Webhook processing (no user JWT available)
 */
function getServiceClient() {
  if (!_serviceClient) {
    _serviceClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );
  }
  return _serviceClient;
}

/**
 * User-scoped client — respects RLS.
 * Use for ALL user-initiated actions (Plaid link, transactions sync).
 * Pass the user's Supabase JWT.
 */
function getUserClient(token) {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY, // service key but with user JWT overrides auth
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false }
    }
  );
}

module.exports = { getServiceClient, getUserClient };
```

---

## 📡 HTTP Function Pattern (V4 Model)

### Standard Function Template

```javascript
// api/src/functions/create-link-token.js
const { app } = require('@azure/functions');
const { verifySupabaseToken } = require('../shared/auth');

app.http('create-link-token', {
  methods: ['POST'],
  authLevel: 'anonymous',  // Auth handled by our Supabase JWT check
  handler: async (request, context) => {
    context.log('create-link-token invoked');
    
    // 1. Verify caller is authenticated
    const { user, error: authError } = await verifySupabaseToken(request);
    if (authError) {
      return {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: authError })
      };
    }
    
    try {
      // 2. Business logic (Plaid, Gmail, etc.)
      // ... see FC-203 implementation
      
      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link_token: '...' })
      };
    } catch (err) {
      context.log.error('create-link-token error:', err);
      return {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Internal server error' })
      };
    }
  }
});
```

### `api/src/index.js` (Entry Point)
```javascript
// Register all functions
require('./functions/create-link-token');
require('./functions/exchange-public-token');
require('./functions/transactions-sync');
require('./functions/webhooks-plaid');
require('./functions/gmail-exchange');
```

---

## ⚠️ Critical Constraint: HTTP-Only Triggers

**SWA managed Functions = HTTP triggers only.**

From official docs:
> "Triggers and bindings are limited to HTTP"

This means:
- ✅ `/api/create-link-token` — HTTP POST
- ✅ `/api/exchange-public-token` — HTTP POST  
- ✅ `/api/transactions-sync` — HTTP POST
- ✅ `/api/webhooks-plaid` — HTTP POST (called by Plaid)
- ✅ `/api/gmail-exchange` — HTTP POST
- ❌ Timer trigger for Gmail background sync — **NOT SUPPORTED in api/**
- ❌ Timer trigger for daily snapshots — **NOT SUPPORTED in api/**

### Workaround Options for Scheduled Tasks

| Option | Complexity | Cost |
|--------|-----------|------|
| **A. External cron hits HTTP endpoint** | Low | Free (use GitHub Actions schedule or Clawdbot cron) |
| **B. Linked standalone Azure Functions App** | Medium | ~$0/month on Consumption plan |
| **C. Supabase pg_cron extension** | Low | Included in Supabase |
| **D. Azure Logic Apps** | Low | Pay-per-use ($0.000025/action) |

**Recommendation for Fireside Capital:**
- Daily net worth snapshot → **Option C: Supabase pg_cron** (already has all data, no external call needed)
- Gmail background sync → **Option A: GitHub Actions cron** calls `/api/gmail-sync-trigger` HTTP endpoint (MVP), then Option B when volume justifies it

---

## 🚀 GitHub Actions Workflow Update

Update `.github/workflows/azure-static-web-apps-*.yml`:

```yaml
###### Repository/Build Configurations ######
app_location: "app"         # Static Web App source
api_location: "api"         # Azure Functions source — ADD THIS
output_location: ""         # Built app content (empty = no build step)
###### End of Repository/Build Configurations ######
```

**Also add secrets to GitHub repo** (Settings → Secrets → Actions):
```
SUPABASE_SERVICE_ROLE_KEY
PLAID_CLIENT_ID
PLAID_SECRET_SANDBOX
PLAID_SECRET_PRODUCTION
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

**Set in Azure Static Web App** (portal → Environment Variables):
Same secrets as above — these become `process.env.*` in production Functions.

---

## 🔒 Security Rules

| Rule | Implementation |
|------|---------------|
| Never return `access_token` to client | Service client only writes to `plaid_items.access_token`; `plaid_items_safe` VIEW strips it |
| Verify user on every request | `verifySupabaseToken()` in every handler before any logic |
| Secrets in environment only | No secrets in code; `local.settings.json` gitignored |
| Idempotent webhooks | All webhook handlers check for existing records before processing |
| CORS | SWA handles CORS for `api/` automatically (same origin) |
| authLevel: 'anonymous' | SWA edge handles auth routing; we do our own Supabase JWT check |

---

## 📋 Local Development

```bash
# Install Azure Functions Core Tools (v4)
npm install -g azure-functions-core-tools@4

# Install Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Start locally (serves app/ + api/ together)
cd C:\Users\chuba\fireside-capital
swa start app --api-location api

# App: http://localhost:4280
# API: http://localhost:4280/api/*
# Functions: http://localhost:7071
```

`local.settings.json` is gitignored — devs must create their own with real sandbox keys.

---

## 🗺️ Implementation Map

```
FC-207 (api/ boilerplate — 30 min)
├── Create api/ folder structure
├── Write host.json + package.json + index.js
├── Write shared/auth.js + shared/supabase.js
└── Add api_location to GitHub Actions workflow

FC-203 (create-link-token function — 2h)
├── Uses: shared/auth.js (verify user), Plaid SDK
└── Depends on: FC-207

FC-204 (exchange-public-token + transactions-sync — 3h)
├── Uses: shared/supabase.js (service client for plaid_items)
└── Depends on: FC-202 (plaid_items table), FC-207

FC-205 (webhooks-plaid — 1h)
├── Uses: shared/supabase.js (service client, no user JWT)
└── Depends on: FC-207

EMAIL-016 (gmail-sync-trigger HTTP function — 2h)
├── HTTP trigger called by GitHub Actions cron
├── Processes all users with stored Gmail tokens
└── Depends on: FC-207, EMAIL-011/012 (gmail-connector + bill-parser)
```

---

## 📊 Task Estimates

| ID | Description | Est | Priority |
|----|-------------|-----|----------|
| FC-207 | `api/` folder boilerplate (structure + shared utils + host.json) | 30 min | P1 |
| FC-SNAP-001 | Supabase pg_cron for daily net worth snapshots | 30 min | P2 |
| AZ-SECRETS-001 | Configure Azure SWA environment variables + GitHub secrets | 15 min (Matt) | P1 |
| EMAIL-016-HTTP | Gmail sync HTTP trigger (cron-callable) | 2h | P2 |

---

## ✅ Summary

1. **Start with FC-207** — creates the `api/` skeleton used by all other functions
2. **FC-203/204/205** can then be built on top (Plaid functions — see Plaid research report)
3. **Timer triggers** (scheduled sync) solved via pg_cron (DB-side) or GitHub Actions (external cron calling HTTP endpoint) — no separate Azure Functions app needed for MVP
4. **Security model** is clean: Supabase JWT verified on every request via `getUser()` (server-side validation, not just decode), service role key never exposed to client, all secrets in env vars

**Full Plaid implementation details:** `reports/plaid-production-integration-research-2026-02-18.md`  
**Full Gmail implementation details:** `reports/gmail-bill-parsing-research-2026-02-18.md`
