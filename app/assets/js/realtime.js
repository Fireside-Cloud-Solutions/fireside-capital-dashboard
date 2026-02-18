/**
 * realtime.js — Fireside Capital
 * Production-safe Supabase Realtime manager with exponential backoff retry.
 *
 * Features:
 *   - Unique channel name per session (prevents ghost subscriptions)
 *   - User-scoped filters (users only see their own data)
 *   - Exponential backoff retry: 5s → 10s → 20s → 40s → 80s
 *   - Event bus pattern: FiresideRealtime.on('transaction:insert', cb)
 *   - Auto-teardown on page unload
 *   - Demo mode guard (skips when isDemoMode() is true)
 *
 * Events emitted:
 *   'transaction:insert'  — payload: new transaction row
 *   'transaction:update'  — payload: updated transaction row
 *   'bill:update'         — payload: updated bill row
 *   'snapshot:insert'     — payload: new snapshot row
 *
 * Usage:
 *   // Initialize (call after auth is confirmed)
 *   FiresideRealtime.subscribe();
 *
 *   // Listen for events
 *   FiresideRealtime.on('transaction:insert', (transaction) => {
 *     refreshDashboard();
 *   });
 *
 *   // Cleanup (called automatically on beforeunload)
 *   FiresideRealtime.teardown();
 *
 * Depends on: Supabase client (sb), isDemoMode() from demo-data.js
 * Required: migration 007 must be run (ALTER PUBLICATION supabase_realtime ADD TABLE ...)
 *
 * FC-200 | Priority: P1 | Est: 2h
 */

const FiresideRealtime = (() => {
  'use strict';

  // ─── State ──────────────────────────────────────────────────────────────────

  let channel = null;
  let retryCount = 0;
  let retryTimer = null;
  let isSubscribed = false;

  const MAX_RETRIES = 5;
  const BASE_DELAY_MS = 5000; // 5s, doubles each retry: 5→10→20→40→80s

  // Event bus: Map<eventName, callback[]>
  const handlers = new Map();

  // Metrics (for debugging)
  const metrics = {
    totalEvents: 0,
    connectionAttempts: 0,
    lastConnectedAt: null,
    lastEventAt: null
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  /**
   * Generate a unique channel name per session.
   * Critical: prevents "ghost subscriptions" where old channels
   * continue receiving events after a reconnect.
   */
  function getChannelName() {
    return `fireside-ops-${Date.now()}`;
  }

  /**
   * Check if Supabase client is available.
   */
  function hasSb() {
    return typeof sb !== 'undefined' && sb !== null;
  }

  /**
   * Check if demo mode is active — skip realtime in demo.
   */
  function inDemoMode() {
    return typeof isDemoMode === 'function' && isDemoMode();
  }

  // ─── Event Bus ───────────────────────────────────────────────────────────────

  /**
   * Register a callback for a realtime event.
   * @param {string} eventName - 'transaction:insert'|'transaction:update'|'bill:update'|'snapshot:insert'
   * @param {function} callback - called with the new/updated row payload
   */
  function on(eventName, callback) {
    if (typeof callback !== 'function') {
      console.error('[Realtime] on(): callback must be a function');
      return;
    }
    if (!handlers.has(eventName)) {
      handlers.set(eventName, []);
    }
    handlers.get(eventName).push(callback);
  }

  /**
   * Remove a specific callback (or all callbacks) for an event.
   * @param {string} eventName
   * @param {function} [callback] - if omitted, removes all callbacks for event
   */
  function off(eventName, callback) {
    if (!handlers.has(eventName)) return;
    if (!callback) {
      handlers.delete(eventName);
      return;
    }
    const filtered = handlers.get(eventName).filter(cb => cb !== callback);
    handlers.set(eventName, filtered);
  }

  /**
   * Dispatch an event to all registered handlers.
   * Errors in individual handlers are caught to prevent cascade failures.
   */
  function handleEvent(eventName, payload) {
    metrics.totalEvents++;
    metrics.lastEventAt = new Date().toISOString();

    const callbacks = handlers.get(eventName) || [];
    if (callbacks.length === 0) return; // No listeners — skip silently

    callbacks.forEach(cb => {
      try {
        cb(payload);
      } catch (err) {
        console.error(`[Realtime] Handler error for "${eventName}":`, err);
      }
    });
  }

  // ─── Subscription ────────────────────────────────────────────────────────────

  /**
   * Connect to Supabase Realtime and subscribe to table changes.
   * Safe to call multiple times — cleans up existing channel first.
   */
  async function subscribe() {
    // Guard: no Supabase client
    if (!hasSb()) {
      console.warn('[Realtime] Supabase client (sb) not available — skipping');
      return;
    }

    // Guard: demo mode — no auth, no DB, skip
    if (inDemoMode()) {
      console.debug('[Realtime] Demo mode active — skipping realtime connection');
      return;
    }

    metrics.connectionAttempts++;

    // Get current user for filter scoping
    let userId;
    try {
      const { data: { user }, error } = await sb.auth.getUser();
      if (error || !user) {
        console.debug('[Realtime] No authenticated user — skipping subscription');
        return;
      }
      userId = user.id;
    } catch (err) {
      console.error('[Realtime] Auth check failed:', err);
      return;
    }

    // Teardown any existing channel before creating a new one
    await _cleanup();

    // Create new unique channel
    channel = sb.channel(getChannelName())

      // ── Transactions ──────────────────────────────────────────────
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'transactions',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        handleEvent('transaction:insert', payload.new);
      })

      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'transactions',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        handleEvent('transaction:update', payload.new);
      })

      // ── Bills ─────────────────────────────────────────────────────
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'bills',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        handleEvent('bill:update', payload.new);
      })

      // ── Snapshots ─────────────────────────────────────────────────
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'snapshots',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        handleEvent('snapshot:insert', payload.new);
      })

      // ── Status handler ────────────────────────────────────────────
      .subscribe((status, err) => {
        switch (status) {
          case 'SUBSCRIBED':
            retryCount = 0; // Reset backoff counter on success
            isSubscribed = true;
            metrics.lastConnectedAt = new Date().toISOString();
            console.debug('[Realtime] ✅ Connected — listening for changes');
            break;

          case 'CHANNEL_ERROR':
            isSubscribed = false;
            console.warn('[Realtime] Channel error:', err);
            _scheduleRetry();
            break;

          case 'TIMED_OUT':
            isSubscribed = false;
            console.warn('[Realtime] Connection timed out — will retry');
            _scheduleRetry();
            break;

          case 'CLOSED':
            isSubscribed = false;
            console.debug('[Realtime] Channel closed');
            // Only retry if not a deliberate teardown
            if (channel !== null) {
              _scheduleRetry();
            }
            break;

          default:
            // 'SUBSCRIBING' — in progress, nothing to do
            break;
        }
      });
  }

  /**
   * Schedule a reconnection attempt with exponential backoff.
   * Caps at MAX_RETRIES to prevent infinite loops.
   */
  function _scheduleRetry() {
    if (retryCount >= MAX_RETRIES) {
      console.warn(`[Realtime] Max retries (${MAX_RETRIES}) reached — giving up. Manual reconnect required.`);
      return;
    }

    // Exponential backoff: 5s, 10s, 20s, 40s, 80s
    const delayMs = BASE_DELAY_MS * Math.pow(2, retryCount);
    retryCount++;

    console.debug(`[Realtime] Retry ${retryCount}/${MAX_RETRIES} in ${delayMs / 1000}s`);

    clearTimeout(retryTimer);
    retryTimer = setTimeout(() => {
      subscribe();
    }, delayMs);
  }

  /**
   * Remove the current channel from Supabase.
   * Internal helper — does not reset state.
   */
  async function _cleanup() {
    clearTimeout(retryTimer);
    retryTimer = null;

    if (channel && hasSb()) {
      try {
        await sb.removeChannel(channel);
      } catch (err) {
        // Non-fatal — channel may already be gone
      }
    }
    channel = null;
    isSubscribed = false;
  }

  /**
   * Fully disconnect and stop all reconnection attempts.
   * Called automatically on beforeunload.
   * Safe to call manually when navigating away from a realtime-enabled page.
   */
  async function teardown() {
    const savedChannel = channel;
    channel = null; // Set to null first to prevent _scheduleRetry from firing on CLOSED status
    clearTimeout(retryTimer);
    retryTimer = null;
    isSubscribed = false;

    if (savedChannel && hasSb()) {
      try {
        await sb.removeChannel(savedChannel);
      } catch (err) {
        // Non-fatal
      }
    }

    console.debug('[Realtime] Torn down — all subscriptions removed');
  }

  /**
   * Manually force a reconnection (useful after a network recovery event).
   * Resets retry counter so full backoff sequence restarts.
   */
  function reconnect() {
    retryCount = 0;
    clearTimeout(retryTimer);
    subscribe();
  }

  /**
   * Get current connection status and metrics.
   * Useful for debugging and health checks.
   */
  function status() {
    return {
      isSubscribed,
      retryCount,
      maxRetries: MAX_RETRIES,
      channelActive: channel !== null,
      demoMode: inDemoMode(),
      metrics: { ...metrics },
      handlerCount: [...handlers.entries()].reduce((acc, [k, v]) => {
        acc[k] = v.length;
        return acc;
      }, {})
    };
  }

  // ─── Auto-teardown ───────────────────────────────────────────────────────────

  // Clean up WebSocket connection when user navigates away.
  // Prevents orphaned connections in Supabase.
  window.addEventListener('beforeunload', () => {
    // Synchronous portion of teardown — clear timer and null channel
    channel = null;
    clearTimeout(retryTimer);
    // Note: async removeChannel() may not complete before page unloads,
    // but Supabase handles this gracefully on their end.
  });

  // ─── Public API ──────────────────────────────────────────────────────────────

  return {
    /** Connect and subscribe to realtime changes. Call after auth. */
    subscribe,
    /** Register a callback for a realtime event. */
    on,
    /** Remove a callback (or all callbacks) for an event. */
    off,
    /** Force a reconnection (resets retry counter). */
    reconnect,
    /** Fully disconnect and stop retrying. */
    teardown,
    /** Get current status and metrics for debugging. */
    status
  };
})();

// Make available globally
window.FiresideRealtime = FiresideRealtime;
