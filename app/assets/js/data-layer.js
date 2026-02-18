/**
 * data-layer.js — FC-185: Demo/Live Routing Wrapper
 *
 * Thin abstraction over all Supabase data queries.
 * When isDemoMode() is true, routes to DEMO_DATA instead of Supabase.
 * Future code calls DataLayer.getBills() instead of writing its own
 * isDemoMode() check.
 *
 * Depends on: demo-data.js (for isDemoMode, DEMO_DATA, DEMO_USER, DEMO_SETTINGS)
 * Must load: AFTER demo-data.js, BEFORE app.js
 */

const DataLayer = {

  // ===== AUTH HELPER =====================================================

  async getCurrentUser() {
    if (typeof isDemoMode === 'function' && isDemoMode()) {
      return DEMO_USER;
    }
    if (typeof sb === 'undefined') return null;
    const { data: { user } } = await sb.auth.getUser();
    return user || null;
  },

  // ===== TABLE READS =====================================================

  async getAssets() {
    if (typeof isDemoMode === 'function' && isDemoMode()) {
      return { data: DEMO_DATA.assets, error: null };
    }
    if (typeof sb === 'undefined') return { data: [], error: 'Supabase not initialized' };
    const user = await this.getCurrentUser();
    if (!user) return { data: [], error: 'Not authenticated' };
    return await sb.from('assets')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });
  },

  async getIncome() {
    if (typeof isDemoMode === 'function' && isDemoMode()) {
      return { data: DEMO_DATA.income, error: null };
    }
    if (typeof sb === 'undefined') return { data: [], error: 'Supabase not initialized' };
    const user = await this.getCurrentUser();
    if (!user) return { data: [], error: 'Not authenticated' };
    return await sb.from('income')
      .select('*')
      .eq('user_id', user.id)
      .order('source', { ascending: true });
  },

  async getBills() {
    if (typeof isDemoMode === 'function' && isDemoMode()) {
      return { data: DEMO_DATA.bills, error: null };
    }
    if (typeof sb === 'undefined') return { data: [], error: 'Supabase not initialized' };
    const user = await this.getCurrentUser();
    if (!user) return { data: [], error: 'Not authenticated' };
    return await sb.from('bills')
      .select('*')
      .eq('user_id', user.id)
      .order('due_day', { ascending: true });
  },

  async getDebts() {
    if (typeof isDemoMode === 'function' && isDemoMode()) {
      return { data: DEMO_DATA.debts, error: null };
    }
    if (typeof sb === 'undefined') return { data: [], error: 'Supabase not initialized' };
    const user = await this.getCurrentUser();
    if (!user) return { data: [], error: 'Not authenticated' };
    return await sb.from('debts')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });
  },

  async getInvestments() {
    if (typeof isDemoMode === 'function' && isDemoMode()) {
      return { data: DEMO_DATA.investments, error: null };
    }
    if (typeof sb === 'undefined') return { data: [], error: 'Supabase not initialized' };
    const user = await this.getCurrentUser();
    if (!user) return { data: [], error: 'Not authenticated' };
    return await sb.from('investments')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });
  },

  /**
   * @param {Object} opts
   * @param {string} [opts.category]    - Filter by category
   * @param {string} [opts.startDate]   - 'YYYY-MM-DD' lower bound
   * @param {string} [opts.endDate]     - 'YYYY-MM-DD' upper bound
   * @param {number} [opts.limit]       - Page size
   * @param {number} [opts.offset]      - Page offset
   */
  async getTransactions(opts = {}) {
    if (typeof isDemoMode === 'function' && isDemoMode()) {
      let data = [...(DEMO_DATA.transactions || [])];
      if (opts.category)  data = data.filter(t => t.category === opts.category);
      if (opts.startDate) data = data.filter(t => t.date >= opts.startDate);
      if (opts.endDate)   data = data.filter(t => t.date <= opts.endDate);
      // Sort descending by date (newest first) to match Supabase default
      data.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));
      const total = data.length;
      if (opts.offset) data = data.slice(opts.offset);
      if (opts.limit)  data = data.slice(0, opts.limit);
      return { data, count: total, error: null };
    }
    if (typeof sb === 'undefined') return { data: [], count: 0, error: 'Supabase not initialized' };
    const user = await this.getCurrentUser();
    if (!user) return { data: [], count: 0, error: 'Not authenticated' };

    let query = sb.from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (opts.category)  query = query.eq('category', opts.category);
    if (opts.startDate) query = query.gte('date', opts.startDate);
    if (opts.endDate)   query = query.lte('date', opts.endDate);
    if (opts.limit)     query = query.limit(opts.limit);
    if (opts.offset)    query = query.range(opts.offset, opts.offset + (opts.limit || 50) - 1);

    return await query;
  },

  /**
   * @param {Object} opts
   * @param {number} [opts.limit]     - Max records
   * @param {string} [opts.startDate] - 'YYYY-MM-DD' lower bound
   */
  async getSnapshots(opts = {}) {
    if (typeof isDemoMode === 'function' && isDemoMode()) {
      let data = [...(DEMO_DATA.snapshots || [])];
      if (opts.startDate) data = data.filter(s => s.date >= opts.startDate);
      data.sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0));
      if (opts.limit) data = data.slice(-opts.limit);
      return { data, error: null };
    }
    if (typeof sb === 'undefined') return { data: [], error: 'Supabase not initialized' };
    const user = await this.getCurrentUser();
    if (!user) return { data: [], error: 'Not authenticated' };

    let query = sb.from('snapshots')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });

    if (opts.startDate) query = query.gte('date', opts.startDate);
    if (opts.limit)     query = query.limit(opts.limit);

    return await query;
  },

  /**
   * Returns a single settings object (not an array).
   */
  async getSettings() {
    if (typeof isDemoMode === 'function' && isDemoMode()) {
      return { data: DEMO_DATA.settings || DEMO_SETTINGS, error: null };
    }
    if (typeof sb === 'undefined') return { data: null, error: 'Supabase not initialized' };
    const user = await this.getCurrentUser();
    if (!user) return { data: null, error: 'Not authenticated' };
    const result = await sb.from('settings')
      .select('*')
      .eq('user_id', user.id)
      .single();
    return result;
  },

  // ===== WRITES ==========================================================

  /**
   * Upsert settings. In demo mode, no-op (returns payload as success).
   * @param {Object} payload
   */
  async upsertSettings(payload) {
    if (typeof isDemoMode === 'function' && isDemoMode()) {
      return { data: payload, error: null };
    }
    if (typeof sb === 'undefined') return { data: null, error: 'Supabase not initialized' };
    const user = await this.getCurrentUser();
    if (!user) return { data: null, error: 'Not authenticated' };
    return await sb.from('settings')
      .upsert({ ...payload, user_id: user.id }, { onConflict: 'user_id' });
  },
};

window.DataLayer = DataLayer;
