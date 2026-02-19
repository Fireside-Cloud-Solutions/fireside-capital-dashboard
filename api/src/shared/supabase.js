// Fireside Capital — Azure Functions Supabase Client Factory
// FC-207: Client factories for service-role and user-scoped operations
//
// TWO clients — choose the right one:
//   getServiceClient()   → service role, bypasses RLS — use for webhooks, Plaid token storage
//   getUserClient(token) → user JWT, respects RLS — use for all user-initiated actions

'use strict';

const { createClient } = require('@supabase/supabase-js');

let _serviceClient = null;

/**
 * Service role client — bypasses RLS.
 *
 * USE ONLY FOR:
 * - Storing Plaid access_token (must never be exposed to client)
 * - Webhook processing (no user JWT available in webhooks)
 * - Admin operations (migrations, cron functions)
 *
 * DO NOT USE FOR: Any operation triggered by user request where RLS should apply.
 *
 * Singleton — created once per cold start.
 *
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
function getServiceClient() {
  if (!_serviceClient) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables');
    }
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
 *
 * USE FOR:
 * - All user-initiated operations (Plaid link token creation, transactions sync)
 * - Any query that should be filtered by auth.uid()
 *
 * Uses service role key but overrides with user's JWT — this way RLS sees the correct
 * auth.uid() while the function still has write access it needs.
 *
 * NOT a singleton — creates a new client per request (cheap, 1ms).
 *
 * @param {string} token - User's Supabase JWT (from Bearer header)
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
function getUserClient(token) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables');
  }
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    }
  );
}

module.exports = { getServiceClient, getUserClient };
