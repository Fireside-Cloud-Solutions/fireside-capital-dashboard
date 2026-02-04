// subscriptions.js - Recurring Subscription Detection
// Pattern-matching algorithm to identify monthly subscriptions

// ===== SUBSCRIPTION KEYWORDS =====
const SUBSCRIPTION_KEYWORDS = [
  // Streaming
  'netflix', 'hulu', 'disney', 'hbo', 'prime video', 'paramount', 'peacock', 'apple tv',
  'youtube premium', 'crunchyroll', 'funimation', 'discovery+',
  // Music
  'spotify', 'apple music', 'youtube music', 'tidal', 'pandora', 'amazon music', 'soundcloud',
  // Fitness
  'planet fitness', 'la fitness', 'crunch', 'peloton', 'classpass', 'gym', 'fitness',
  // Software
  'adobe', 'microsoft 365', 'dropbox', 'icloud', 'google one', 'github',
  'notion', 'evernote', 'canva', 'grammarly', 'zoom',
  // News/Media
  'nytimes', 'wsj', 'washington post', 'medium', 'substack', 'new york times', 'wall street',
  // Other
  'amazon prime', 'costco', 'sams club', 'patreon', 'onlyfans',
  'subscription', 'monthly', 'membership'
];

// ===== DETECTION LOGIC =====

/**
 * Check if a bill is likely a subscription
 * @param {Object} bill - Bill object from database
 * @returns {Boolean} - True if likely subscription
 */
function isLikelySubscription(bill) {
  if (!bill) return false;
  
  // Already marked as subscription
  if (bill.type === 'subscriptions') return true;
  
  // Monthly frequency is strong indicator
  if (bill.frequency !== 'monthly') return false;
  
  // Check name against keyword list
  const nameLower = (bill.name || '').toLowerCase();
  const matchesKeyword = SUBSCRIPTION_KEYWORDS.some(keyword => 
    nameLower.includes(keyword)
  );
  
  return matchesKeyword;
}

/**
 * Detect all subscriptions from current bills
 * @returns {Array} - Array of subscription bills
 */
async function detectAllSubscriptions() {
  if (!currentUser) return [];
  
  const bills = window.bills || [];
  
  // Filter to active subscriptions only (exclude paid-off financing)
  const activeBills = bills.filter(b => {
    const info = getBillFinancingInfo(b);
    return !(info.isFinancing && info.status === 'paid_off');
  });
  
  return activeBills.filter(isLikelySubscription);
}

/**
 * Calculate total monthly subscription cost
 * @returns {Number} - Total monthly subscription cost
 */
async function calculateSubscriptionTotal() {
  const subs = await detectAllSubscriptions();
  return subs.reduce((total, bill) => {
    // Handle shared bills - only count user's portion
    const shareInfo = getShareInfoForBill(bill.id);
    const userAmount = (shareInfo && shareInfo.status === 'accepted') 
      ? shareInfo.owner_amount 
      : bill.amount;
    
    return total + getRaw(userAmount);
  }, 0);
}

/**
 * Get top N subscriptions by amount
 * @param {Number} limit - Number of subscriptions to return
 * @returns {Array} - Array of top subscription bills
 */
async function getTopSubscriptions(limit = 4) {
  const subs = await detectAllSubscriptions();
  
  // Sort by amount (descending) and take top N
  return subs
    .sort((a, b) => getRaw(b.amount) - getRaw(a.amount))
    .slice(0, limit);
}

/**
 * Mark or unmark a bill as subscription
 * @param {String} billId - Bill ID
 * @param {Boolean} isSubscription - True to mark as subscription
 */
async function markAsSubscription(billId, isSubscription) {
  if (!currentUser || !billId) return;
  
  // CSRF Protection
  try {
    if (typeof CSRF !== 'undefined') {
      CSRF.requireValidToken();
    }
  } catch (err) {
    alert(err.message);
    return;
  }
  
  const newType = isSubscription ? 'subscriptions' : 'other';
  
  const { error } = await sb
    .from('bills')
    .update({ type: newType })
    .eq('id', billId)
    .eq('user_id', currentUser.id);
  
  if (error) {
    console.error('Error updating subscription status:', error);
    alert('Failed to update subscription status. Please try again.');
    return;
  }
  
  // Clear cache and refresh data
  if (typeof clearCache === 'function') clearCache();
  if (typeof fetchAllDataFromSupabase === 'function') {
    await fetchAllDataFromSupabase(true);
  }
}

// ===== DASHBOARD WIDGET =====

/**
 * Load and render subscription widget on dashboard
 */
async function loadSubscriptionWidget() {
  const widget = document.getElementById('subscriptionsWidget');
  if (!widget) return; // Not on dashboard
  
  try {
    const subs = await detectAllSubscriptions();
    const total = await calculateSubscriptionTotal();
    
    // Update count and total
    const countEl = document.getElementById('subscriptionCount');
    const totalEl = document.getElementById('subscriptionTotal');
    
    if (countEl) countEl.textContent = subs.length;
    if (totalEl) totalEl.textContent = formatCurrency(total);
    
    const listEl = document.getElementById('subscriptionsList');
    if (!listEl) return;
    
    // Empty state
    if (subs.length === 0) {
      listEl.innerHTML = `
        <p class="text-muted text-center py-3">
          <i class="bi bi-info-circle me-2"></i>
          No subscriptions detected yet. Add monthly bills to track them here.
        </p>
      `;
      return;
    }
    
    // Show top 4 by amount
    const topSubs = subs
      .sort((a, b) => getRaw(b.amount) - getRaw(a.amount))
      .slice(0, 4);
    
    listEl.innerHTML = topSubs.map(sub => {
      // Handle shared bills
      const shareInfo = getShareInfoForBill(sub.id);
      const displayAmount = (shareInfo && shareInfo.status === 'accepted') 
        ? shareInfo.owner_amount 
        : sub.amount;
      
      return `
        <div class="d-flex justify-content-between align-items-center py-2" style="border-bottom: 1px solid var(--color-border-subtle);">
          <div>
            <strong>${escapeHtml(sub.name)}</strong>
            <small class="text-muted d-block">${formatCurrency(displayAmount)}/month</small>
          </div>
          <button class="btn btn-sm btn-link text-danger" onclick="removeSubscription('${escapeAttribute(sub.id)}')" aria-label="Remove ${escapeAttribute(sub.name)} from subscriptions">
            <i class="bi bi-x-circle"></i>
          </button>
        </div>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Error loading subscription widget:', error);
    // Show error state
    const listEl = document.getElementById('subscriptionsList');
    if (listEl) {
      listEl.innerHTML = `
        <p class="text-danger text-center py-3">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Failed to load subscriptions
        </p>
      `;
    }
  }
}

/**
 * Remove a bill from subscriptions (mark as 'other')
 * @param {String} billId - Bill ID
 */
async function removeSubscription(billId) {
  if (!confirm('Mark this as not a subscription?')) return;
  
  await markAsSubscription(billId, false);
  
  // Reload widget
  await loadSubscriptionWidget();
  
  // Also reload dashboard cards and bills table if they exist
  if (typeof updateDashboardCards === 'function') updateDashboardCards();
  if (typeof renderBills === 'function') renderBills();
}

// ===== BILLS PAGE INTEGRATION =====

/**
 * Filter bills table to show only subscriptions
 */
function filterBillsToSubscriptions() {
  const tableBody = document.getElementById('billTableBody');
  if (!tableBody) return;
  
  const bills = window.bills || [];
  const subscriptions = bills.filter(isLikelySubscription);
  
  // Update button states
  const showAllBtn = document.getElementById('showAllBillsBtn');
  const showSubsBtn = document.getElementById('showSubscriptionsBtn');
  if (showAllBtn) {
    showAllBtn.classList.remove('active');
  }
  if (showSubsBtn) {
    showSubsBtn.classList.add('active');
  }
  
  // Handle empty state when no subscriptions
  if (subscriptions.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-5">
          <div class="text-muted">
            <i class="bi bi-inbox" style="font-size: 3rem; opacity: 0.3;"></i>
            <p class="mt-3 mb-0">No subscriptions detected</p>
            <small>Add monthly recurring bills to track subscriptions</small>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  // Re-render table with only subscriptions
  tableBody.innerHTML = subscriptions.map(b => {
    const shareInfo = getShareInfoForBill(b.id);
    const displayAmount = (shareInfo && shareInfo.status === 'accepted') 
      ? shareInfo.owner_amount 
      : b.amount;
    
    const typeColor = getCategoryBadgeClass(b.type);
    
    return `
      <tr>
        <td>${escapeHtml(b.name)}</td>
        <td><span class="badge ${typeColor}">${escapeHtml(toTitleCase(b.type))}</span></td>
        <td>${formatCurrency(displayAmount)}</td>
        <td>${escapeHtml(toTitleCase(b.frequency))}</td>
        <td>${b.nextDueDate ? escapeHtml(formatDate(b.nextDueDate)) : '-'}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary" onclick="openBillModal('${escapeAttribute(b.id)}')" aria-label="Edit ${escapeAttribute(b.name)}">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteBill('${escapeAttribute(b.id)}', '${escapeAttribute(b.name)}')" aria-label="Delete ${escapeAttribute(b.name)}">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Show all bills (remove subscription filter)
 */
function showAllBills() {
  // Update button states
  const showAllBtn = document.getElementById('showAllBillsBtn');
  const showSubsBtn = document.getElementById('showSubscriptionsBtn');
  if (showAllBtn) {
    showAllBtn.classList.add('active');
  }
  if (showSubsBtn) {
    showSubsBtn.classList.remove('active');
  }
  
  if (typeof renderBills === 'function') {
    renderBills();
  }
}

/**
 * Add subscription insights to bills page
 */
async function renderSubscriptionInsights() {
  const insightsContainer = document.getElementById('subscriptionInsights');
  if (!insightsContainer) return;
  
  const subs = await detectAllSubscriptions();
  const total = await calculateSubscriptionTotal();
  
  if (subs.length === 0) {
    insightsContainer.innerHTML = `
      <div class="alert alert-info">
        <i class="bi bi-info-circle me-2"></i>
        No subscriptions detected. Add monthly recurring bills to track subscriptions.
      </div>
    `;
    return;
  }
  
  // Find largest subscription
  const largest = subs.reduce((max, sub) => 
    getRaw(sub.amount) > getRaw(max.amount) ? sub : max
  , subs[0]);
  
  insightsContainer.innerHTML = `
    <div class="row g-3">
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h6 class="text-muted mb-2">Total Monthly Cost</h6>
            <h3 class="mb-0">${formatCurrency(total)}</h3>
            <small class="text-muted">${subs.length} active subscription${subs.length !== 1 ? 's' : ''}</small>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h6 class="text-muted mb-2">Largest Subscription</h6>
            <h4 class="mb-0">${escapeHtml(largest.name)}</h4>
            <small class="text-muted">${formatCurrency(largest.amount)}/month</small>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h6 class="text-muted mb-2">Annual Cost</h6>
            <h3 class="mb-0">${formatCurrency(total * 12)}</h3>
            <small class="text-muted">Based on current subscriptions</small>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ===== INITIALIZATION =====

// Auto-load widget when on dashboard
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Wait for auth and data to load
    const checkAndLoad = setInterval(() => {
      if (currentUser && window.bills) {
        clearInterval(checkAndLoad);
        
        // Load widget if on dashboard
        if (document.getElementById('subscriptionsWidget')) {
          loadSubscriptionWidget();
        }
        
        // Load insights if on bills page
        if (document.getElementById('subscriptionInsights')) {
          renderSubscriptionInsights();
          
          // Check for ?filter=subscriptions URL parameter
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('filter') === 'subscriptions') {
            filterBillsToSubscriptions();
          }
        }
      }
    }, 500);
    
    // Stop checking after 10 seconds
    setTimeout(() => clearInterval(checkAndLoad), 10000);
  });
}
