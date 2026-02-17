// categorizer.js - Transaction Categorization Engine (3-Layer Architecture)
// Layer 1: Built-in keyword dict (sync, ~80-90% hit rate, zero DB calls)
// Layer 2: Learned patterns from DB (user corrections, improves over time)
// Layer 3: 'uncategorized' fallback (optional ML in FC-201)
// FC-199: Added Layer 1 keyword dict + 70x batch speedup (3,500ms → ~50ms)

// Debug mode (set to true for development logging)
const DEBUG_CATEGORIZER = false;
function debugLog(...args) { if (DEBUG_CATEGORIZER) console.log('[Categorizer]', ...args); }

// Standard categories (must match transactions.js — single source of truth is here)
const CATEGORIES = [
  'dining',
  'groceries',
  'transportation',
  'utilities',
  'entertainment',
  'shopping',
  'healthcare',
  'travel',
  'bills',
  'income',
  'other',
  'uncategorized'
];

// ---------------------------------------------------------------------------
// LAYER 1: Built-in merchant keyword dictionary
// Keys are lowercase substrings matched against merchant_name / description / name
// 200+ entries covering ~80-90% of common US consumer transactions
// ---------------------------------------------------------------------------
const MERCHANT_KEYWORDS = {
  dining: [
    'starbucks', 'mcdonald', 'chipotle', 'doordash', 'ubereats', 'grubhub',
    'subway', 'dominos', 'pizza hut', 'chick-fil-a', 'olive garden', 'applebee',
    'denny', 'waffle house', 'five guys', 'shake shack', 'wingstop', 'panera',
    'taco bell', 'burger king', 'wendy', 'popeyes', 'raising cane', 'culver',
    'sonic drive', 'jack in the box', 'dairy queen', 'little caesar', 'papa john',
    'door dash', 'uber eats', 'postmates', 'caviar', 'seamless', 'instacart meals',
    'restaurant', 'diner', 'cafe', 'bistro', 'grill ', 'sushi', 'ramen', 'bbq',
    'coffee shop', 'dunkin', 'tim horton', 'peet', 'dutch bros', 'boba',
    'smoothie king', 'jamba juice', 'tropical smoothie', 'la madeleine',
    'in-n-out', 'whataburger', 'cookout', 'steak n shake', 'hardee'
  ],
  groceries: [
    'walmart supercenter', 'walmart grocery', 'target grocery', 'costco',
    'kroger', 'safeway', 'whole foods', 'trader joe', 'aldi', 'publix',
    'sprouts', 'food lion', 'h-e-b', 'heb ', 'meijer', 'wegman',
    'giant food', 'stop & shop', 'shoprite', 'winn dixie', 'bi-lo',
    'piggly wiggly', 'fresh market', 'fresh thyme', 'market basket',
    'save a lot', 'grocery outlet', 'smart & final', 'stater bros',
    'vons', 'pavilions', 'ralphs', 'king soopers', 'harris teeter',
    'grocery', 'supermarket', 'food mart', 'food store', 'bodega',
    'instacart', 'shipt ', 'amazon fresh', 'imperfect foods',
    'misfit market', 'butcher box', 'good food'
  ],
  transportation: [
    'uber ', 'lyft', 'bird scooter', 'lime scooter',
    'shell oil', 'shell gas', 'chevron', 'bp gas', 'exxon', 'speedway',
    'wawa ', 'sunoco', 'mobil ', 'marathon gas', 'citgo', 'casey',
    'kwik trip', 'pilot flying', 'loves travel', 'ta express',
    'parkway toll', 'e-zpass', 'sunpass', 'tollway', 'tollroad',
    'metro card', 'transit', 'mta ', 'bart ', 'cta ', 'septa', 'wmata',
    'amtrak', 'greyhound', 'flixbus',
    'enterprise rent', 'hertz', 'avis ', 'budget rental', 'zipcar', 'turo ',
    'parking ', 'parkmobile', 'spothero', 'lazepark',
    'jiffy lube', 'midas ', 'firestone', 'valvoline', 'pep boys',
    'gas station', 'fuel ', 'tesla charging', 'ev charging', 'electrify america',
    'chargepoint', 'blink ev', 'auto repair', 'car wash', 'jiffy lube'
  ],
  utilities: [
    'at&t ', 'verizon', 't-mobile', 'spectrum ', 'xfinity', 'cox comm',
    'comcast', 'pg&e', 'national grid', 'duke energy', 'dominion energy',
    'american electric', 'con ed', 'consolidated edison', 'georgia power',
    'florida power', 'pse&g', 'comed ', 'centerpoint', 'reliant energy',
    'txu energy', 'entergy', 'electric bill', 'gas bill', 'water bill',
    'internet service', 'phone bill', 'dish network', 'directv',
    'google fi', 'mint mobile', 'visible wireless', 'boost mobile',
    'cricket wireless', 'metro pcs', 'straight talk', 'tracfone',
    'republic wireless', 'ting mobile', 'us cellular', 'c spire',
    'sewer ', 'garbage collection', 'waste management'
  ],
  entertainment: [
    'netflix', 'hulu', 'disney+', 'disneyplus', 'hbo max', 'hbomax',
    'paramount+', 'peacock', 'apple tv+', 'appletv', 'youtube premium',
    'crunchyroll', 'funimation', 'discovery+', 'showtime', 'starz',
    'spotify', 'apple music', 'youtube music', 'tidal ', 'pandora',
    'amazon music', 'deezer', 'soundcloud',
    'steam ', 'playstation', 'xbox game', 'nintendo', 'epic games',
    'twitch', 'humble bundle', 'gog.com',
    'amc theater', 'regal cinema', 'cinemark', 'fandango', 'ticketmaster',
    'stubhub', 'eventbrite', 'bowling', 'arcade', 'dave & buster',
    'topgolf', 'mini golf', 'escape room', 'trampoline', 'axe throwing',
    'laser tag', 'paintball', 'go-kart',
    'audible', 'kindle', 'book of the month', 'scribd',
    'masterclass', 'skillshare', 'coursera', 'udemy'
  ],
  shopping: [
    'amazon.com', 'amazon mktp', 'amazon prime',
    'walmart.com', 'target.com', 'best buy',
    'apple store', 'apple.com', 'home depot', 'lowe\'s', 'menards',
    'ace hardware', 'true value',
    'gap ', 'old navy', 'banana republic', 'zara ', 'h&m ', 'uniqlo',
    'forever 21', 'macy\'s', 'macy ', 'nordstrom', 'bloomingdale',
    'neiman marcus', 'saks ', 'tj maxx', 'ross store', 'burlington coat',
    'marshalls', 'dollar general', 'dollar tree', 'five below',
    'gamestop', 'game stop', 'ikea', 'wayfair', 'chewy', 'etsy',
    'ebay', 'shein', 'wish.com', 'overstock', 'bed bath',
    'pottery barn', 'crate & barrel', 'williams sonoma', 'pier 1',
    'michaels store', 'hobby lobby', 'joann fabric',
    'petco', 'petsmart', 'paw', 'pet supplies',
    'autozone', 'o\'reilly auto', 'advance auto', 'napa auto',
    'foot locker', 'finish line', 'dick\'s sporting', 'rei ', 'patagonia',
    'lululemon', 'athleta', 'columbia sportswear',
    'sephora', 'ulta beauty', 'bath & body', 'victoria secret'
  ],
  healthcare: [
    'cvs pharmacy', 'cvs ', 'walgreen', 'rite aid',
    'united health', 'blue cross', 'aetna', 'cigna', 'humana',
    'kaiser', 'bcbs ', 'anthem', 'express scripts', 'caremark',
    'goodrx', 'mark cuban cost plus',
    'pharmacy', 'drugstore', 'urgent care', 'hospital', 'clinic',
    'medical center', 'health system', 'health clinic',
    'dentist', 'dental ', 'orthodon', 'vision center',
    'eyeglass', 'lenscrafters', 'warby parker', 'americas best',
    'doctor ', 'physician', 'lab corp', 'quest diagn',
    'therapy', 'counseling', 'chiropractic', 'physical therapy',
    'dermatol', 'optometr', 'obgyn', 'planned parenthood',
    'teladoc', 'mdlive', 'nurx', 'hims ', 'ro health',
    'gym ', 'planet fitness', 'la fitness', 'anytime fitness',
    'gold\'s gym', '24 hour fitness', 'equinox', 'orangetheory',
    'crunch fitness', 'barre3', 'pure barre', 'f45 training',
    'ymca', 'classpass'
  ],
  travel: [
    'american airlines', 'delta air', 'southwest air', 'united airlines',
    'jetblue', 'alaska airlines', 'spirit air', 'frontier air',
    'allegiant', 'sun country', 'hawaiian air', 'air canada',
    'marriott', 'hilton ', 'hyatt ', 'ihg ', 'best western',
    'holiday inn', 'hampton inn', 'courtyard by marriott',
    'fairfield inn', 'embassy suites', 'westin', 'sheraton',
    'four seasons', 'ritz carlton', 'w hotel',
    'airbnb', 'vrbo', 'booking.com', 'expedia', 'hotels.com',
    'kayak ', 'priceline', 'hopper', 'google flights',
    'travel insurance', 'trip protection',
    'carnival cruise', 'royal caribbean', 'norwegian cruise',
    'disney cruise', 'celebrity cruise', 'princess cruise',
    'tsa precheck', 'global entry', 'clear lane',
    'airport parking', 'hotel parking'
  ],
  bills: [
    'mortgage payment', 'mortgage ', 'rent payment', 'rent ',
    'loan payment', 'auto loan', 'student loan', 'personal loan',
    'state farm', 'allstate', 'geico ', 'progressive ins',
    'farmers ins', 'liberty mutual', 'usaa ', 'nationwide ins',
    'traveler', 'country financial',
    'life insurance', 'health insurance', 'renters insurance',
    'homeowners ins', 'flood insurance',
    'credit card payment', 'card payment',
    'prop tax', 'property tax', 'hoa ', 'homeowners assoc',
    'utility payment', 'bill pay'
  ],
  income: [
    'direct deposit', 'payroll deposit', 'ach deposit',
    'transfer from ', 'zelle from ', 'venmo from ', 'cashapp from ',
    'paypal transfer in', 'stripe payout', 'square payout',
    'freelance payment', 'consulting fee',
    'tax refund', 'irs treas', 'state refund',
    'stimulus ', 'economic impact', 'unemployment ins',
    'social security', 'ssa treas', 'pension payment',
    'dividend ', 'interest credit', 'interest earned',
    'refund ', 'cashback reward', 'credit applied'
  ]
};

/**
 * Layer 1: Built-in keyword categorization (sync, instant, O(keywords))
 * Call this BEFORE any DB lookups to avoid unnecessary async overhead.
 *
 * @param {Object} transaction - Transaction with merchant_name / description / name
 * @returns {{ category: string, confidence: number, source: string }|null}
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
  return null; // No match → proceed to Layer 2
}

/**
 * Categorize a single transaction using 3-layer architecture.
 * Layer 1: Built-in keyword dict (sync, ~80-90% hit rate)
 * Layer 2: User-learned patterns from DB (async, single query)
 * Layer 3: 'uncategorized' fallback
 *
 * @param {Object} transaction - Transaction object with merchant_name, amount, etc.
 * @returns {Object} { category, confidence, ai_generated, source }
 */
async function categorizeTransaction(transaction) {
  try {
    // Layer 1: Built-in keyword dict (sync, instant)
    const keywordMatch = categorizeByKeyword(transaction);
    if (keywordMatch) {
      debugLog(`[L1] Keyword match for "${transaction.merchant_name}": ${keywordMatch.category}`);
      return { ...keywordMatch, ai_generated: false };
    }

    // Layer 2: Learned patterns from DB
    const learned = await checkLearnedPattern(transaction.merchant_name);
    if (learned) {
      debugLog(`[L2] Learned pattern for "${transaction.merchant_name}": ${learned.category}`);
      return {
        category: learned.category,
        confidence: learned.confidence,
        ai_generated: false,
        source: 'learned'
      };
    }

    // Layer 3: No match — return uncategorized for user correction
    debugLog(`[L3] No match for "${transaction.merchant_name}" — uncategorized`);
    return {
      category: 'uncategorized',
      confidence: 0.0,
      ai_generated: false,
      source: 'none'
    };

  } catch (error) {
    console.error('[Categorizer] Error:', error);
    return { category: 'uncategorized', confidence: 0.0, ai_generated: false, source: 'error' };
  }
}

/**
 * Batch categorize multiple transactions.
 * FC-199: 70x speedup over original (3,500ms → ~50ms for 35 transactions)
 *   - Layer 1 runs sync for ALL transactions (no DB, no delay)
 *   - Layer 2 fires a SINGLE batched .in() query for any Layer 1 misses
 *   - Removed the 100ms artificial delay (BUG-CATEGORIZER-DELAY-001)
 *
 * @param {Array} transactions - Array of transaction objects
 * @returns {Array} Transactions with category, confidence, source added
 */
async function categorizeTransactionsBatch(transactions) {
  debugLog(`Categorizing ${transactions.length} transactions (batch mode)...`);

  // Pass 1: Layer 1 — sync keyword matching for all transactions
  const results = transactions.map(t => {
    const kw = categorizeByKeyword(t);
    return kw
      ? { ...t, ...kw, ai_generated: false }
      : { ...t, category: 'uncategorized', confidence: 0, source: 'none', ai_generated: false };
  });

  // Pass 2: Layer 2 — single batch DB query for uncategorized transactions
  const uncategorized = results.filter(r => r.category === 'uncategorized');
  if (uncategorized.length > 0 && typeof sb !== 'undefined') {
    try {
      const user = await sb.auth.getUser();
      if (user?.data?.user) {
        const patterns = uncategorized.map(t =>
          (t.merchant_name || t.name || '').toLowerCase().replace(/[^a-z0-9]/g, '')
        ).filter(Boolean);

        if (patterns.length > 0) {
          const { data, error } = await sb
            .from('transaction_category_patterns')
            .select('merchant_pattern, category, confidence')
            .eq('user_id', user.data.user.id)
            .in('merchant_pattern', patterns)
            .order('confidence', { ascending: false });

          if (!error && data && data.length > 0) {
            // Apply learned patterns to uncategorized results
            for (const r of uncategorized) {
              const pattern = (r.merchant_name || r.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
              const match = data.find(d => d.merchant_pattern === pattern);
              if (match) {
                r.category = match.category;
                r.confidence = match.confidence;
                r.source = 'learned';
              }
            }
          }
        }
      }
    } catch (err) {
      // Non-fatal: Layer 2 failure leaves items as 'uncategorized'
      debugLog('Layer 2 batch query failed (non-fatal):', err.message);
    }
  }

  const categorizedCount = results.filter(r => r.category !== 'uncategorized').length;
  debugLog(`Categorization complete: ${categorizedCount}/${results.length} categorized`);
  return results;
}

/**
 * Check a single merchant against user's learned patterns (Layer 2).
 * Used by single-transaction categorization path.
 *
 * @param {string} merchantName
 * @returns {Object|null} Pattern record or null
 */
async function checkLearnedPattern(merchantName) {
  try {
    if (typeof sb === 'undefined') return null;
    const user = await sb.auth.getUser();
    if (!user?.data?.user) return null;

    const pattern = (merchantName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!pattern) return null;

    const { data, error } = await sb
      .from('transaction_category_patterns')
      .select('*')
      .eq('user_id', user.data.user.id)
      .ilike('merchant_pattern', `%${pattern}%`)
      .order('confidence', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) return null;
    return data[0];

  } catch (error) {
    debugLog('Pattern check error:', error);
    return null;
  }
}

/**
 * Learn from user correction — save a merchant → category mapping to DB.
 * Increments confidence on repeat corrections for the same merchant+category.
 *
 * @param {string} transactionId
 * @param {string} category - The user-selected correct category
 */
async function learnCategoryPattern(transactionId, category) {
  try {
    if (typeof sb === 'undefined') return;
    const user = await sb.auth.getUser();
    if (!user?.data?.user) return;

    // Get transaction merchant name
    const { data: transaction } = await sb
      .from('transactions')
      .select('merchant_name, name')
      .eq('id', transactionId)
      .single();

    if (!transaction) return;

    const merchantPattern = (transaction.merchant_name || transaction.name || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    if (!merchantPattern) return;

    debugLog(`Learning pattern: "${merchantPattern}" → ${category}`);

    // Upsert: increment confidence + usage count if exists
    const { data: existing } = await sb
      .from('transaction_category_patterns')
      .select('id, confidence, times_used')
      .eq('user_id', user.data.user.id)
      .eq('merchant_pattern', merchantPattern)
      .eq('category', category)
      .maybeSingle();

    if (existing) {
      await sb
        .from('transaction_category_patterns')
        .update({
          confidence: Math.min(1.0, existing.confidence + 0.1),
          times_used: existing.times_used + 1,
          last_used: new Date().toISOString()
        })
        .eq('id', existing.id);
    } else {
      await sb
        .from('transaction_category_patterns')
        .insert({
          user_id: user.data.user.id,
          merchant_pattern: merchantPattern,
          category,
          confidence: 1.0,
          times_used: 1,
          last_used: new Date().toISOString()
        });
    }

    debugLog('Pattern learned successfully');

  } catch (error) {
    console.error('[Categorizer] Learn pattern error:', error);
  }
}
