// Fireside Capital — Azure Functions Auth Helper
// FC-207: Supabase JWT verification
//
// Verifies Supabase Bearer tokens by calling auth.getUser() on the Supabase auth server.
// This is more secure than local JWT decode — catches revoked sessions and logged-out users.
//
// Usage in a function handler:
//   const { user, supabase, error } = await verifySupabaseToken(request);
//   if (error) return { status: 401, body: JSON.stringify({ error }) };

'use strict';

const { createClient } = require('@supabase/supabase-js');

/**
 * Verify a Supabase JWT from the Authorization header.
 *
 * @param {import('@azure/functions').HttpRequest} request - Azure Functions request
 * @returns {Promise<{ user: object|null, supabase: object|null, error: string|null }>}
 */
async function verifySupabaseToken(request) {
  const authHeader = request.headers.get('authorization') || '';

  if (!authHeader.startsWith('Bearer ')) {
    return { user: null, supabase: null, error: 'Missing or malformed Authorization header' };
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return { user: null, supabase: null, error: 'Empty Bearer token' };
  }

  // Create a Supabase client scoped to this user's JWT
  // This respects RLS policies and validates the token server-side
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
      auth: { persistSession: false },
    }
  );

  // getUser() hits the Supabase auth server — not just a local JWT decode
  // This catches revoked sessions, deleted accounts, etc.
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return {
      user: null,
      supabase: null,
      error: error?.message || 'Invalid or expired token',
    };
  }

  return { user, supabase, error: null };
}

/**
 * Standard 401 response for auth failures.
 */
function unauthorizedResponse(message = 'Unauthorized') {
  return {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: message }),
  };
}

/**
 * Standard 500 response for unexpected errors.
 */
function errorResponse(message, context) {
  if (context) context.log.error(message);
  return {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'Internal server error' }),
  };
}

/**
 * Standard JSON success response.
 */
function jsonResponse(data, status = 200) {
  return {
    status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}

module.exports = { verifySupabaseToken, unauthorizedResponse, errorResponse, jsonResponse };
