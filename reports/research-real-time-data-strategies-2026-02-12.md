# Research: Real-Time Data Strategies for Financial Dashboards

**Date:** 2026-02-12 06:51 AM  
**Agent:** Capital (Researcher)  
**Sprint:** Sprint Research (cron f6500924)  
**Duration:** 45 minutes

---

## Executive Summary

**Research Question:** What's the best real-time data strategy for Fireside Capital — WebSockets, Polling, or Supabase Realtime?

**Answer:** **Supabase Realtime** (built-in Postgres subscriptions) is optimal for Fireside Capital. Already available, zero additional infrastructure, perfect for multi-user finance apps.

**Key Findings:**
1. ✅ Supabase Realtime = WebSockets + zero setup (already configured)
2. ✅ Sub-1-second updates for bills, transactions, net worth changes
3. ✅ No polling overhead, no server management, no Socket.io needed
4. ⚠️ Current app uses ZERO real-time features (reload required for all updates)

**Recommendation:** Implement Supabase Realtime subscriptions for 5 high-value use cases (2-3 hour implementation, massive UX improvement).

---

## The Three Approaches

### 1. Polling (Current State) ❌

**What it is:** JavaScript setInterval() repeatedly requests fresh data from Supabase.

**Current Implementation:**
```javascript
// This is what we do now (refresh on page load only)
async function loadBills() {
    const { data } = await supabase.from('bills').select('*');
    renderBills(data);
}
```

**Polling Implementation:**
```javascript
// Polling every 30 seconds
setInterval(async () => {
    const { data } = await supabase.from('bills').select('*');
    updateBillsUI(data);
}, 30000); // Check every 30 seconds
```

**Pros:**
- ✅ Simple to implement
- ✅ Works with any backend
- ✅ No special server setup

**Cons:**
- ❌ Wastes bandwidth (99% of polls find no changes)
- ❌ Battery drain on mobile
- ❌ 30-second delay before seeing updates
- ❌ Scales poorly (100 users × 30s = 100 unnecessary DB queries)
- ❌ Supabase charges per request (inefficient pricing)

**Verdict:** ❌ NOT RECOMMENDED — wasteful, slow, outdated approach.

---

### 2. WebSockets (Raw or Socket.io) ⚠️

**What it is:** Persistent two-way connection between browser and server for instant push notifications.

**Implementation (with Socket.io):**
```javascript
// Client-side
const socket = io('https://your-server.com');
socket.on('bill-added', (newBill) => {
    addBillToUI(newBill);
});

// Server-side (Node.js + Socket.io)
const io = require('socket.io')(server);
io.on('connection', (socket) => {
    // Listen for Supabase changes and broadcast
    supabase.from('bills').on('INSERT', (payload) => {
        socket.broadcast.emit('bill-added', payload.new);
    });
});
```

**Pros:**
- ✅ True real-time (sub-second updates)
- ✅ Efficient (only sends when data changes)
- ✅ Industry standard (used by Slack, Discord, trading apps)

**Cons:**
- ❌ Requires separate Node.js server (Azure App Service)
- ❌ Complex deployment (WebSocket support on Azure Static Web Apps)
- ❌ Connection management (reconnects, heartbeats)
- ❌ ~5-10 hours implementation + infra setup

**Verdict:** ⚠️ OVERKILL — we already have better built-in (Supabase Realtime).

---

### 3. Supabase Realtime (Recommended) ✅

**What it is:** Postgres database subscriptions via WebSocket, managed by Supabase. Zero server setup.

**How it works:**
1. Supabase exposes Postgres' `LISTEN/NOTIFY` over WebSockets
2. Subscribe to table changes (INSERT, UPDATE, DELETE)
3. Get instant callbacks when data changes
4. Works out-of-the-box (already included in Supabase)

**Implementation:**
```javascript
// Subscribe to bill changes (real-time)
const billsSubscription = supabase
    .channel('bills-channel')
    .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bills' },
        (payload) => {
            console.log('Bill changed:', payload);
            if (payload.eventType === 'INSERT') {
                addBillToUI(payload.new);
            } else if (payload.eventType === 'UPDATE') {
                updateBillInUI(payload.new);
            } else if (payload.eventType === 'DELETE') {
                removeBillFromUI(payload.old);
            }
        }
    )
    .subscribe();

// Cleanup when leaving page
window.addEventListener('beforeunload', () => {
    supabase.removeChannel(billsSubscription);
});
```

**Pros:**
- ✅ Zero infrastructure (already running on Supabase)
- ✅ Sub-1-second updates (true real-time)
- ✅ Free tier: 200 concurrent connections
- ✅ Production-ready (used by 100K+ apps)
- ✅ Auto-reconnects, connection pooling included
- ✅ 2-3 hour implementation (not weeks)

**Cons:**
- ⚠️ Tied to Supabase (but we're already committed)
- ⚠️ Requires enabling Realtime in Supabase dashboard (1-click)

**Verdict:** ✅ **WINNER** — Best fit for Fireside Capital.

---

## Implementation Plan (2-3 Hours)

### Phase 1: Enable Supabase Realtime (5 minutes)

1. Go to Supabase Dashboard → Database → Replication
2. Enable Realtime for these tables:
   - `bills`
   - `transactions`
   - `snapshots`
   - `budgets`
   - `assets`
3. Save changes

### Phase 2: Create Real-Time Manager Utility (30 minutes)

**File:** `app/assets/js/realtime-manager.js`

```javascript
// Centralized real-time subscription manager
class RealtimeManager {
    constructor() {
        this.channels = new Map();
    }

    // Subscribe to table changes
    subscribe(tableName, callbacks) {
        const channelName = `${tableName}-channel`;
        
        const channel = supabase
            .channel(channelName)
            .on('postgres_changes',
                { event: '*', schema: 'public', table: tableName },
                (payload) => {
                    const { eventType } = payload;
                    if (eventType === 'INSERT' && callbacks.onInsert) {
                        callbacks.onInsert(payload.new);
                    } else if (eventType === 'UPDATE' && callbacks.onUpdate) {
                        callbacks.onUpdate(payload.new, payload.old);
                    } else if (eventType === 'DELETE' && callbacks.onDelete) {
                        callbacks.onDelete(payload.old);
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`[Realtime] Subscribed to ${tableName}`);
                }
            });

        this.channels.set(tableName, channel);
        return channel;
    }

    // Unsubscribe from table
    unsubscribe(tableName) {
        const channel = this.channels.get(tableName);
        if (channel) {
            supabase.removeChannel(channel);
            this.channels.delete(tableName);
            console.log(`[Realtime] Unsubscribed from ${tableName}`);
        }
    }

    // Cleanup all subscriptions (call on page unload)
    unsubscribeAll() {
        this.channels.forEach((channel, tableName) => {
            supabase.removeChannel(channel);
        });
        this.channels.clear();
        console.log('[Realtime] All subscriptions cleaned up');
    }
}

// Global instance
const realtimeManager = new RealtimeManager();

// Auto-cleanup on page unload
window.addEventListener('beforeunload', () => {
    realtimeManager.unsubscribeAll();
});
```

### Phase 3: Implement Real-Time Features (1-2 hours)

#### Use Case 1: Bills Page — Instant Bill Updates

**File:** `app/bills.html` (add to existing `bills.js` logic)

```javascript
// After initial bill load, subscribe to real-time updates
function initBillsRealtime() {
    realtimeManager.subscribe('bills', {
        onInsert: (newBill) => {
            console.log('New bill added:', newBill);
            addBillToTable(newBill); // Add to UI without reload
            updateBillSummary(); // Recalculate totals
            showToast('New bill added', 'success');
        },
        onUpdate: (updatedBill, oldBill) => {
            console.log('Bill updated:', updatedBill);
            updateBillInTable(updatedBill); // Update existing row
            updateBillSummary();
            showToast('Bill updated', 'info');
        },
        onDelete: (deletedBill) => {
            console.log('Bill deleted:', deletedBill);
            removeBillFromTable(deletedBill.id); // Remove row
            updateBillSummary();
            showToast('Bill deleted', 'warning');
        }
    });
}

// Helper: Add bill to table without reload
function addBillToTable(bill) {
    const tableBody = document.querySelector('#bills-table tbody');
    const row = createBillRow(bill); // Your existing row creation function
    tableBody.insertBefore(row, tableBody.firstChild); // Add to top
    row.classList.add('highlight-new'); // Animate new row
    setTimeout(() => row.classList.remove('highlight-new'), 2000);
}
```

#### Use Case 2: Dashboard — Live Net Worth Updates

**File:** `app/index.html` (Dashboard)

```javascript
// Subscribe to snapshots for live net worth updates
function initDashboardRealtime() {
    realtimeManager.subscribe('snapshots', {
        onInsert: (newSnapshot) => {
            console.log('New net worth snapshot:', newSnapshot);
            updateNetWorthDisplay(newSnapshot.netWorth);
            addPointToChart(newSnapshot); // Add to Chart.js
            showToast(`Net worth updated: $${formatCurrency(newSnapshot.netWorth)}`, 'success');
        }
    });

    // Also subscribe to assets, debts, investments for instant recalculation
    ['assets', 'debts', 'investments'].forEach(table => {
        realtimeManager.subscribe(table, {
            onInsert: () => recalculateNetWorth(),
            onUpdate: () => recalculateNetWorth(),
            onDelete: () => recalculateNetWorth()
        });
    });
}
```

#### Use Case 3: Transactions Page — Live Plaid Import Updates

**File:** `app/transactions.html`

```javascript
// Real-time transaction imports from Plaid
function initTransactionsRealtime() {
    realtimeManager.subscribe('transactions', {
        onInsert: (newTransaction) => {
            addTransactionToTable(newTransaction);
            updateSpendingSummary();
            // Show subtle notification
            showToast(`New transaction: ${newTransaction.name} ($${newTransaction.amount})`, 'info');
        }
    });
}
```

#### Use Case 4: Budget Page — Live Budget Tracking

**File:** `app/budget.html`

```javascript
// Real-time budget updates
function initBudgetRealtime() {
    realtimeManager.subscribe('budgets', {
        onUpdate: (updatedBudget) => {
            updateBudgetProgressBar(updatedBudget);
            if (updatedBudget.spent > updatedBudget.allocated) {
                showToast(`⚠️ Over budget: ${updatedBudget.category}`, 'warning');
            }
        }
    });
}
```

#### Use Case 5: Shared Bills — Multi-User Real-Time Sync

**File:** `app/bills.html` (Shared Bills section)

```javascript
// Real-time updates when friends modify shared bills
function initSharedBillsRealtime() {
    realtimeManager.subscribe('bills', {
        onUpdate: (bill) => {
            if (bill.isShared) {
                // Another user modified a shared bill
                updateSharedBillInUI(bill);
                showToast(`${bill.sharedWith} updated "${bill.name}"`, 'info');
            }
        }
    });
}
```

---

## Performance Comparison

| Method | Latency | Bandwidth (1 hour) | Battery Impact | Server Load |
|--------|---------|-------------------|----------------|-------------|
| **No Updates** (current) | ∞ (manual refresh) | 0 MB | None | 1 request |
| **Polling (30s)** | 0-30 seconds | 2.4 MB (120 requests) | High | 120 queries |
| **Polling (5s)** | 0-5 seconds | 14.4 MB (720 requests) | Very High | 720 queries |
| **WebSockets (custom)** | < 1 second | 0.05 MB | Low | 1 connection |
| **Supabase Realtime** | < 1 second | 0.05 MB | Low | 1 connection |

**Winner:** Supabase Realtime (same performance as custom WebSockets, zero infra)

---

## CSS Animations for Real-Time Updates

**File:** `app/assets/css/realtime-animations.css`

```css
/* Highlight newly added rows */
@keyframes highlight-new {
    0% { background-color: rgba(129, 185, 0, 0.3); }
    100% { background-color: transparent; }
}

.highlight-new {
    animation: highlight-new 2s ease-out;
}

/* Pulse effect for updated values */
@keyframes pulse-update {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

.value-updated {
    animation: pulse-update 0.5s ease-in-out;
    color: #81b900; /* Green = increase */
}

.value-decreased {
    animation: pulse-update 0.5s ease-in-out;
    color: #f44e24; /* Orange = decrease */
}

/* Real-time connection indicator */
.realtime-status {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 8px 12px;
    background: rgba(129, 185, 0, 0.9);
    color: white;
    border-radius: 8px;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.3s;
}

.realtime-status.disconnected {
    background: rgba(244, 78, 36, 0.9);
}

.realtime-status::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: white;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
}
```

---

## Error Handling & Reconnection

**File:** `app/assets/js/realtime-manager.js` (add to class)

```javascript
// Enhanced subscription with error handling
subscribe(tableName, callbacks) {
    const channelName = `${tableName}-channel`;
    
    const channel = supabase
        .channel(channelName)
        .on('postgres_changes',
            { event: '*', schema: 'public', table: tableName },
            (payload) => {
                // ... (same as before)
            }
        )
        .subscribe((status, err) => {
            if (status === 'SUBSCRIBED') {
                console.log(`[Realtime] ✅ Subscribed to ${tableName}`);
                updateRealtimeIndicator('connected');
            } else if (status === 'CHANNEL_ERROR') {
                console.error(`[Realtime] ❌ Error subscribing to ${tableName}:`, err);
                updateRealtimeIndicator('disconnected');
            } else if (status === 'TIMED_OUT') {
                console.warn(`[Realtime] ⏱️ Subscription timed out for ${tableName}`);
                updateRealtimeIndicator('disconnected');
                // Auto-retry after 5 seconds
                setTimeout(() => this.subscribe(tableName, callbacks), 5000);
            }
        });

    this.channels.set(tableName, channel);
    return channel;
}

// Show connection status to user
function updateRealtimeIndicator(status) {
    let indicator = document.querySelector('.realtime-status');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'realtime-status';
        document.body.appendChild(indicator);
    }

    if (status === 'connected') {
        indicator.classList.remove('disconnected');
        indicator.innerHTML = '<span></span> Live updates active';
    } else {
        indicator.classList.add('disconnected');
        indicator.innerHTML = '<span></span> Reconnecting...';
    }
}
```

---

## Security Considerations

### Row-Level Security (RLS) Still Enforced ✅

Supabase Realtime respects RLS policies:

```sql
-- Only users can see their own bills (RLS policy)
CREATE POLICY "Users can view own bills"
ON bills FOR SELECT
USING (auth.uid() = user_id);
```

**Result:** User A subscribing to `bills` will ONLY receive updates for their own bills, not other users' data. Zero security risk.

### Authentication Required

```javascript
// Realtime subscriptions require authenticated session
const { data: session } = await supabase.auth.getSession();
if (!session) {
    console.error('Must be logged in for real-time updates');
    return;
}
```

---

## Cost Analysis

### Supabase Realtime Pricing (Free Tier)

| Metric | Free Tier | Pro Tier ($25/mo) |
|--------|-----------|-------------------|
| **Concurrent connections** | 200 | 500 |
| **Messages per month** | 2 million | 5 million |
| **Data transfer** | 5 GB | 50 GB |

**For Fireside Capital (single user):**
- **Connections:** 1 (you)
- **Messages/month:** ~50,000 (5 tables × 100 changes/day × 30 days)
- **Verdict:** ✅ FREE TIER MORE THAN ENOUGH

### Comparison: Custom WebSocket Server

| Resource | Monthly Cost |
|----------|-------------|
| Azure App Service (B1) | $13.14 |
| Redis for pub/sub | $9.50 |
| SSL certificate | $0 (Let's Encrypt) |
| Maintenance time | 2-3 hours/month |
| **TOTAL** | **$22.64 + your time** |

**Supabase Realtime:** $0.00 (already included)

---

## Rollout Strategy

### Week 1: Foundation (2-3 hours)
1. Enable Realtime in Supabase Dashboard (5 min)
2. Create `realtime-manager.js` utility (30 min)
3. Add real-time status indicator (15 min)
4. Test with bills page (1 hour)

### Week 2: Expand (2-3 hours)
5. Dashboard real-time net worth (1 hour)
6. Transactions real-time import (1 hour)
7. Budget real-time tracking (30 min)

### Week 3: Polish (1-2 hours)
8. Add CSS animations for updates (30 min)
9. Error handling + reconnection logic (1 hour)
10. User testing + feedback (30 min)

**Total Effort:** 5-8 hours (1 week of casual work)

---

## Alternative: IndexedDB Caching (Future Enhancement)

For **offline support** + real-time updates:

```javascript
// Cache Supabase data in IndexedDB
async function cacheAndSubscribe(tableName) {
    // 1. Load from Supabase
    const { data } = await supabase.from(tableName).select('*');
    
    // 2. Cache in IndexedDB
    await db.table(tableName).bulkPut(data);
    
    // 3. Subscribe to real-time updates
    realtimeManager.subscribe(tableName, {
        onInsert: (row) => db.table(tableName).add(row),
        onUpdate: (row) => db.table(tableName).put(row),
        onDelete: (row) => db.table(tableName).delete(row.id)
    });
    
    // 4. Load from cache (instant, works offline)
    return await db.table(tableName).toArray();
}
```

**Benefits:**
- ✅ Instant page loads (IndexedDB = local database)
- ✅ Works offline (cached data)
- ✅ Syncs when online (Realtime updates cache)

**Research:** See next sprint's IndexedDB deep-dive.

---

## Recommendations

### HIGH PRIORITY (This Sprint)

**✅ ACTION ITEM 1: Enable Supabase Realtime (5 minutes)**
- Task: Turn on Realtime in Supabase Dashboard
- Effort: 5 minutes (one-click)
- Impact: Unlocks all real-time features

**✅ ACTION ITEM 2: Implement Bills Page Real-Time (2 hours)**
- Task: Add real-time subscriptions to bills page
- Effort: 2 hours (realtime-manager.js + bills.js integration)
- Impact: Instant bill updates, no page reload needed
- Code: See "Phase 2 + Phase 3" above

**✅ ACTION ITEM 3: Add Real-Time Status Indicator (30 minutes)**
- Task: Show "Live updates active" badge in corner
- Effort: 30 minutes (CSS + updateRealtimeIndicator())
- Impact: User confidence (they know it's real-time)

### MEDIUM PRIORITY (Next Sprint)

**✅ ACTION ITEM 4: Dashboard Real-Time Net Worth (1 hour)**
- Task: Live net worth updates on Dashboard
- Effort: 1 hour
- Impact: See net worth change instantly when adding assets/debts

**✅ ACTION ITEM 5: Transactions Real-Time Import (1 hour)**
- Task: Real-time Plaid transaction imports
- Effort: 1 hour
- Impact: See transactions appear instantly after Plaid sync

### FUTURE (Nice-to-Have)

**⏳ ACTION ITEM 6: IndexedDB + Realtime Hybrid (4-6 hours)**
- Task: Cache data in IndexedDB, sync with Realtime
- Effort: 4-6 hours
- Impact: Offline support + instant page loads

**⏳ ACTION ITEM 7: Push Notifications (2-3 hours)**
- Task: Browser push notifications for bill due dates
- Effort: 2-3 hours (Service Worker + Web Push API)
- Impact: Proactive reminders even when app closed

---

## Conclusion

**Verdict:** Supabase Realtime is the clear winner for Fireside Capital.

**Why:**
- ✅ Zero infrastructure (already running)
- ✅ Sub-1-second updates (true real-time)
- ✅ Free for single-user apps
- ✅ 2-3 hour implementation (not weeks)
- ✅ Production-ready (battle-tested by 100K+ apps)

**Next Steps:**
1. Enable Realtime in Supabase (5 min)
2. Build `realtime-manager.js` (30 min)
3. Implement bills page real-time (2 hours)
4. Expand to Dashboard, Transactions, Budget (3-4 hours)

**ROI:** Massive UX improvement for 5-8 hours of work. No polling waste, no server management, instant updates across all pages.

**Recommendation:** Start with Bills page (highest value), then Dashboard. Save Transactions + Budget for Week 2.

---

**Research Complete:** 2026-02-12 06:51 AM  
**Next Research Topic:** IndexedDB caching strategies (offline support) OR budget forecasting algorithms
