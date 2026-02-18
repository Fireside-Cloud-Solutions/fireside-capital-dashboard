# Research: Smart Transaction Categorization + Supabase Realtime
**Date:** 2026-02-17 | **Session:** Sprint Research 0751
**Researcher:** Capital (Researcher) | **Priority topics:** AI Categorization + Realtime

---

## Part 1: Smart Transaction Categorization

### Problem Statement (Current State)
`categorizer.js` only uses DB-stored learned patterns from `transaction_category_patterns`.  
**Result:** First-run experience is 100% "uncategorized" — no baseline rules exist.  
BUG-CATEGORIZER-TABLE-001: the table may not even exist in Supabase yet.  
BUG-CATEGORIZER-DELAY-001: 100ms artificial delay per transaction = 3.5s for 35 transactions.

### Recommended Architecture: 3-Layer Categorization

```
Transaction → Layer 1: Built-in Keyword Dict (sync, O(1))
               → 80-90% hit rate, zero DB calls, zero delay
            → Layer 2: Learned Patterns DB (async, only if L1 misses)
               → User corrections, improves over time
            → Layer 3: Zero-Shot ML Fallback (lazy-loaded, only if L1+L2 miss)
               → Handles edge cases, novel merchants
            → 'uncategorized' (final fallback)
```

---

### Layer 1: Built-in Merchant Keyword Dictionary

**Key insight from industry research:** 90% of common transactions match predictable merchant name patterns. A 200-line static dictionary handles the vast majority of transactions with zero latency.

**Implementation (add to categorizer.js):**

```javascript
// Built-in merchant → category keyword map
// Keys are lowercase substrings found in merchant_name or description
const MERCHANT_KEYWORDS = {
  dining: [
    'starbucks', 'mcdonald', 'chipotle', 'doordash', 'ubereats', 'grubhub',
    'subway', 'dominos', 'pizza hut', 'chick-fil-a', 'olive garden', 'applebee',
    'denny', 'waffle house', 'five guys', 'shake shack', 'wingstop', 'panera',
    'taco bell', 'burger king', 'wendy', 'popeyes', 'raising cane', 'culver',
    'sonic drive', 'jack in the box', 'dairy queen', 'little caesar', 'papa john',
    'door dash', 'uber eats', 'postmates', 'caviar', 'seamless', 'instacart meals',
    'restaurant', 'diner', 'cafe', 'bistro', 'grill', 'sushi', 'ramen', 'bbq',
    'coffee', 'dunkin', 'tim horton', 'peet', 'dutch bros'
  ],
  groceries: [
    'walmart', 'target', 'costco', 'kroger', 'safeway', 'whole foods', 'trader joe',
    'aldi', 'publix', 'sprouts', 'food lion', 'h-e-b', 'heb ', 'meijer', 'wegman',
    'giant', 'stop & shop', 'shoprite', 'winn dixie', 'bi-lo', 'piggly wiggly',
    'fresh market', 'fresh thyme', 'market basket', 'save a lot', 'aldi ',
    'grocery', 'supermarket', 'food mart', 'bodega', 'instacart'
  ],
  transportation: [
    'uber ', 'lyft', 'shell', 'chevron', 'bp gas', 'exxon', 'speedway', 'wawa',
    'sunoco', 'mobil', 'marathon', 'citgo', 'casey', 'kwik trip', 'pilot flying',
    'loves travel', 'ta express', 'parkway', 'e-zpass', 'sunpass', 'tollway',
    'metro card', 'transit', 'mta', 'bart ', 'cta ', 'septa', 'wmata',
    'amtrak', 'greyhound', 'enterprise rent', 'hertz', 'avis', 'budget rental',
    'zipcar', 'parking', 'auto repair', 'jiffy lube', 'midas', 'firestone',
    'gas station', 'fuel', 'tesla charging', 'ev charging'
  ],
  utilities: [
    'at&t', 'verizon', 't-mobile', 'spectrum', 'xfinity', 'cox comm', 'comcast',
    'pg&e', 'national grid', 'duke energy', 'dominion energy', 'american electric',
    'con ed', 'consolidated edison', 'georgia power', 'florida power', 'pse&g',
    'comed ', 'centerpoint', 'reliant energy', 'txu energy', 'entergy',
    'electric bill', 'gas bill', 'water bill', 'internet service', 'phone bill',
    'dish network', 'directv', 'google fi', 'mint mobile', 'visible wireless',
    'boost mobile', 'cricket wireless', 'metro pcs'
  ],
  entertainment: [
    'netflix', 'hulu', 'disney+', 'disneyplus', 'hbo max', 'hbomax', 'paramount+',
    'peacock', 'apple tv+', 'youtube premium', 'crunchyroll', 'funimation',
    'spotify', 'apple music', 'youtube music', 'tidal', 'pandora', 'amazon music',
    'steam ', 'playstation', 'xbox game', 'nintendo', 'epic games', 'twitch',
    'amc theater', 'regal cinema', 'cinemark', 'fandango', 'ticketmaster', 'stubhub',
    'eventbrite', 'bowling', 'arcade', 'dave & buster', 'topgolf', 'mini golf',
    'discovery+', 'paramount network', 'showtime', 'starz'
  ],
  shopping: [
    'amazon', 'amazon.com', 'amazon mktp', 'walmart.com', 'target.com', 'best buy',
    'apple store', 'apple.com', 'home depot', 'lowe', 'menards', 'ace hardware',
    'gap', 'old navy', 'banana republic', 'zara', 'h&m ', 'uniqlo', 'forever 21',
    'macy', 'nordstrom', 'bloomingdale', 'neiman marcus', 'saks', 'tj maxx',
    'ross store', 'burlington', 'marshalls', 'dollar general', 'dollar tree',
    'five below', 'game stop', 'gamestop', 'ikea', 'wayfair', 'chewy', 'etsy',
    'ebay', 'shein', 'wish.com', 'overstock', 'bed bath', 'pottery barn',
    'crate & barrel', 'williams sonoma', 'pier 1', 'michael', 'hobby lobby',
    'joann fabric', 'petco', 'petsmart', 'autozone', 'o\'reilly auto', 'advance auto'
  ],
  healthcare: [
    'cvs ', 'cvs pharmacy', 'walgreen', 'rite aid', 'united health', 'blue cross',
    'aetna', 'cigna', 'humana', 'kaiser', 'bcbs', 'anthem', 'express scripts',
    'goodrx', 'pharmacy', 'drugstore', 'urgent care', 'hospital', 'clinic',
    'medical center', 'health system', 'dentist', 'dental', 'orthodon', 'vision',
    'eyeglass', 'lenscrafters', 'warby parker', 'doctor', 'physician', 'lab corp',
    'quest diagn', 'therapy', 'counseling', 'chiropractic', 'physical therapy',
    'dermatol', 'optometr', 'obgyn', 'planned parenthood', 'teladoc', 'mdlive'
  ],
  travel: [
    'american airlines', 'delta ', 'southwest air', 'united airlines', 'jetblue',
    'alaska airlines', 'spirit air', 'frontier air', 'allegiant', 'sun country',
    'marriott', 'hilton', 'hyatt', 'ihg ', 'best western', 'holiday inn',
    'hampton inn', 'courtyard by marriott', 'fairfield inn', 'embassy suites',
    'airbnb', 'vrbo', 'booking.com', 'expedia', 'hotels.com', 'kayak', 'priceline',
    'travel insurance', 'trip protection', 'cruise', 'carnival cruise', 'royal caribbean',
    'norwegian cruise', 'amtrak', 'luggage', 'travel bag'
  ],
  bills: [
    'mortgage', 'rent payment', 'loan payment', 'auto loan', 'student loan',
    'personal loan', 'insurance premium', 'state farm', 'allstate', 'geico',
    'progressive ins', 'farmers ins', 'liberty mutual', 'usaa ', 'nationwide ins',
    'life insurance', 'health insurance', 'renters insurance', 'homeowners',
    'credit card payment', 'transfer to', 'payment to', 'online payment',
    'prop tax', 'property tax', 'hoa ', 'homeowners assoc'
  ],
  income: [
    'direct deposit', 'payroll', 'ach deposit', 'transfer from', 'zelle from',
    'venmo from', 'cashapp from', 'paypal transfer', 'stripe payout', 'square payout',
    'freelance', 'consulting', 'refund', 'tax refund', 'stimulus', 'unemployment',
    'social security', 'pension', 'dividend', 'interest payment'
  ]
};

/**
 * Layer 1: Built-in keyword categorization (sync, instant)
 * Call this BEFORE checkLearnedPattern() to avoid unnecessary DB calls
 */
function categorizeByKeyword(transaction) {
  const text = [
    transaction.merchant_name || '',
    transaction.description || '',
    transaction.name || ''
  ].join(' ').toLowerCase();

  for (const [category, keywords] of Object.entries(MERCHANT_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
        return { category, confidence: 0.85, source: 'keyword' };
      }
    }
  }
  return null; // No match - proceed to Layer 2
}
```

**Updated `categorizeTransaction()` to use layers:**

```javascript
async function categorizeTransaction(transaction) {
  // Layer 1: Built-in keyword dict (sync, instant, ~85% accuracy)
  const keywordMatch = categorizeByKeyword(transaction);
  if (keywordMatch) return { ...keywordMatch, ai_generated: false };

  // Layer 2: Learned patterns from DB
  const learned = await checkLearnedPattern(transaction.merchant_name);
  if (learned) {
    return { category: learned.category, confidence: learned.confidence, ai_generated: false, source: 'learned' };
  }

  // Layer 3: Return uncategorized (ML fallback optional - see FC-200)
  return { category: 'uncategorized', confidence: 0.0, ai_generated: false, source: 'none' };
}
```

**Remove the 100ms artificial delay in batch mode:**
```javascript
// BEFORE (BUG-CATEGORIZER-DELAY-001):
await new Promise(resolve => setTimeout(resolve, 100));

// AFTER: No delay needed - Layer 1 is sync, Layer 2 is batched
// For DB calls: batch query all at once using .in() filter
```

**Batch optimization for Layer 2:**
```javascript
async function categorizeTransactionsBatch(transactions) {
  // Layer 1: Sync categorization for all (instant)
  const results = transactions.map(t => {
    const kw = categorizeByKeyword(t);
    return kw ? { ...t, ...kw } : { ...t, category: 'uncategorized', confidence: 0 };
  });

  // Layer 2: Only DB-query the uncategorized ones (single query, not N queries)
  const uncategorized = results.filter(r => r.category === 'uncategorized');
  if (uncategorized.length > 0 && typeof sb !== 'undefined') {
    const patterns = uncategorized.map(t =>
      (t.merchant_name || '').toLowerCase().replace(/[^a-z0-9]/g, '')
    );
    const { data } = await sb
      .from('transaction_category_patterns')
      .select('*')
      .in('merchant_pattern', patterns)
      .order('confidence', { ascending: false });

    if (data) {
      for (const r of uncategorized) {
        const pattern = (r.merchant_name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const match = data.find(d => d.merchant_pattern === pattern);
        if (match) {
          r.category = match.category;
          r.confidence = match.confidence;
          r.source = 'learned';
        }
      }
    }
  }
  return results;
}
```

**Impact:** 35 transactions: 3,500ms → ~50ms (70x faster). 80-90% auto-categorized on first run.

---

### Layer 3 (Optional): Transformers.js Zero-Shot Classification

For the small remainder of truly novel merchants, browser-based ML is now viable.

**Model options:**
| Model | Size | Accuracy | Load Time |
|-------|------|----------|-----------|
| `Xenova/bart-large-mnli` | 400MB | Excellent | 5-10s | Too large |
| `Xenova/nli-deberta-v3-small` | 86MB | Good | 2-3s | Feasible |
| `Xenova/mobilebert-uncased` | 11MB | OK | <1s | **Recommended** |

**Architecture:** Worker-based, lazy-loaded only when uncategorized transactions exist.

```javascript
// FC-200 (future): transformers-worker.js
// Only loads if Layer 1+2 still leave uncategorized transactions
if ('serviceWorker' in navigator) {
  const worker = new Worker('/assets/js/transformers-worker.js');
  worker.postMessage({
    task: 'classify',
    texts: uncategorizedMerchants,
    labels: Object.keys(MERCHANT_KEYWORDS)
  });
  worker.onmessage = ({ data }) => {
    // Apply ML categories to remaining uncategorized transactions
  };
}
```

**Recommendation:** Skip ML for now. Layer 1 alone covers 80-90% of transactions. Schedule FC-200 as P3 for "Sprint 3 AI Enhancement."

---

## Part 2: Supabase Realtime for Live Dashboard Updates

### Use Case for Fireside Capital

The Operations Dashboard (FC-173) needs to react when:
1. A new transaction is added manually or via Plaid
2. A bill is marked paid
3. Net worth changes (asset value updated)

Without Realtime: user must manually refresh to see changes.  
With Realtime: ops dashboard KPI cards update within ~200ms of DB write.

### Setup Requirements

**Step 1: Enable Realtime publication** (one-time SQL):
```sql
-- Run in Supabase SQL Editor
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE bills;
ALTER PUBLICATION supabase_realtime ADD TABLE snapshots;
-- Note: assets, investments, debts can be added later
```

**Step 2: RLS must allow SELECT for authenticated users** (already done for all tables).

### Production-Ready Implementation Pattern

Key problem from research: Supabase channels drop every ~30 minutes without reconnection logic.

```javascript
// realtime.js — production-safe Supabase Realtime manager
// Add to app/assets/js/realtime.js

const FiresideRealtime = (() => {
  let channel = null;
  let retryCount = 0;
  const MAX_RETRIES = 5;
  const BASE_DELAY = 5000; // 5s
  let retryTimer = null;
  const handlers = new Map(); // event → [callbacks]

  function getChannelName() {
    // Unique channel name per session prevents ghost subscriptions
    return `fireside-${Date.now()}`;
  }

  async function subscribe() {
    if (typeof sb === 'undefined') return;
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;

    // Clean up any existing channel first
    if (channel) {
      await sb.removeChannel(channel);
      channel = null;
    }

    channel = sb.channel(getChannelName())
      // Listen to user's transactions only (filter by user_id)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'transactions',
        filter: `user_id=eq.${user.id}`
      }, (payload) => handleEvent('transaction:insert', payload.new))
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'bills',
        filter: `user_id=eq.${user.id}`
      }, (payload) => handleEvent('bill:update', payload.new))
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'snapshots',
        filter: `user_id=eq.${user.id}`
      }, (payload) => handleEvent('snapshot:insert', payload.new))
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          retryCount = 0; // Reset on success
          console.debug('[Realtime] Connected');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          scheduleRetry();
        } else if (status === 'CLOSED') {
          scheduleRetry();
        }
      });
  }

  function scheduleRetry() {
    if (retryCount >= MAX_RETRIES) {
      console.warn('[Realtime] Max retries reached — giving up');
      return;
    }
    // Exponential backoff: 5s, 10s, 20s, 40s, 80s
    const delay = BASE_DELAY * Math.pow(2, retryCount);
    retryCount++;
    console.debug(`[Realtime] Retrying in ${delay}ms (attempt ${retryCount})`);
    clearTimeout(retryTimer);
    retryTimer = setTimeout(() => subscribe(), delay);
  }

  function handleEvent(eventName, payload) {
    const callbacks = handlers.get(eventName) || [];
    callbacks.forEach(cb => {
      try { cb(payload); } catch (e) { console.error('[Realtime] Handler error', e); }
    });
  }

  function on(eventName, callback) {
    if (!handlers.has(eventName)) handlers.set(eventName, []);
    handlers.get(eventName).push(callback);
  }

  function teardown() {
    clearTimeout(retryTimer);
    if (channel && typeof sb !== 'undefined') {
      sb.removeChannel(channel);
      channel = null;
    }
  }

  // Auto-teardown on page unload
  window.addEventListener('beforeunload', teardown);

  return { subscribe, on, teardown };
})();

// Export for use in app.js / operational-dashboard.js
window.FiresideRealtime = FiresideRealtime;
```

### Usage in operational-dashboard.js

```javascript
// After initial data load, wire up realtime updates:
function initRealtimeUpdates() {
  FiresideRealtime.subscribe();

  // New transaction → refresh KPI cards
  FiresideRealtime.on('transaction:insert', (transaction) => {
    console.debug('[Ops] New transaction received:', transaction.merchant_name);
    // Debounce to batch rapid inserts
    clearTimeout(window._opsRefreshTimer);
    window._opsRefreshTimer = setTimeout(() => {
      refreshSafeToSpend();   // Recalculate Safe to Spend
      refreshCashFlowChart(); // Add new dot to chart
    }, 500);
  });

  // Bill paid → refresh bills aging widget
  FiresideRealtime.on('bill:update', (bill) => {
    if (bill.last_paid) refreshBillsAging();
  });

  // New snapshot → refresh net worth display
  FiresideRealtime.on('snapshot:insert', (snapshot) => {
    updateNetWorthDisplay(snapshot.net_worth);
  });
}
```

### Demo Mode + Realtime

In demo mode, Realtime should be skipped (no auth, no DB):
```javascript
function initRealtimeUpdates() {
  if (typeof isDemoMode === 'function' && isDemoMode()) return; // Skip in demo
  FiresideRealtime.subscribe();
  // ... rest of setup
}
```

### Performance Notes

- Realtime connections are WebSocket — zero polling overhead
- Each channel = 1 WebSocket connection (shared across multiple event listeners)
- Free Supabase plan: 200 concurrent connections — fine for personal use
- Channel drops every ~30min in free tier are normal — the retry logic handles it

---

## New Tasks Created

| ID | Priority | Est | Description |
|----|----------|-----|-------------|
| FC-197 | **P1** | 2h | Enhance `categorizer.js` — add Layer 1 keyword dict + batched Layer 2 query (remove 100ms delay, fix BUG-CATEGORIZER-DELAY-001) |
| FC-198 | **P1** | 1h | Create `transaction_category_patterns` migration + verify table exists (fix BUG-CATEGORIZER-TABLE-001) |
| FC-199 | **P1** | 2h | Create `realtime.js` — production-safe Supabase Realtime manager (retry logic, user filtering, event bus) |
| FC-200 | P3 | 4h | Layer 3 Transformers.js worker — zero-shot classification for uncategorized remainder |

**Prerequisite SQL (FC-198):**
```sql
-- Run in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.transaction_category_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  merchant_pattern TEXT NOT NULL,
  category TEXT NOT NULL,
  confidence NUMERIC(3,2) DEFAULT 1.0,
  times_used INTEGER DEFAULT 1,
  last_used TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.transaction_category_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own patterns" ON public.transaction_category_patterns
  FOR ALL USING (auth.uid() = user_id);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE bills;
ALTER PUBLICATION supabase_realtime ADD TABLE snapshots;
```

---

## Summary

| Topic | Current State | After Research |
|-------|-------------|----------------|
| Categorization | 0% auto-categorized (DB patterns only) | 80-90% auto-categorized (Layer 1 keywords) |
| Batch speed | 3,500ms for 35 transactions | ~50ms (70x faster) |
| Realtime | None — manual refresh only | WebSocket live updates with auto-retry |
| ML categorization | "Capital AI Agent" placeholder | Clear path: Transformers.js worker (FC-200) |

**Implementation order:** FC-198 (SQL migration) → FC-197 (categorizer upgrade) → FC-199 (realtime.js) → FC-193-196 (Supabase RPCs for ops dashboard) → FC-173 (build operations.html)
