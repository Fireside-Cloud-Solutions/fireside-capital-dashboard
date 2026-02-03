// transactions.js - Transaction Management Module

// Standard categories
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
  'other'
];

// Load all transactions for current user
async function loadTransactions(options = {}) {
  try {
    const user = await sb.auth.getUser();
    if (!user.data.user) return [];
    
    let query = sb
      .from('transactions')
      .select('*')
      .eq('user_id', user.data.user.id)
      .order('date', { ascending: false });
    
    // Apply filters
    if (options.category) {
      query = query.eq('category', options.category);
    }
    
    if (options.startDate) {
      query = query.gte('date', options.startDate);
    }
    
    if (options.endDate) {
      query = query.lte('date', options.endDate);
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
    
  } catch (error) {
    console.error('Load transactions error:', error);
    return [];
  }
}

// Sync transactions from Plaid
async function syncTransactions() {
  try {
    // Show loading
    const syncBtn = document.getElementById('syncTransactionsBtn');
    if (syncBtn) {
      syncBtn.disabled = true;
      syncBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Syncing...';
    }
    
    // TODO: Get stored Plaid access token from backend
    // For now, this is a stub - requires Plaid connection first
    const accessToken = localStorage.getItem('plaid_access_token');
    
    if (!accessToken) {
      showToast('Please connect a bank account first', 'warning');
      return;
    }
    
    // Fetch from backend
    const response = await fetch('http://localhost:3000/api/transactions/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Sync failed');
    }
    
    const data = await response.json();
    
    // Store in Supabase (with AI categorization)
    const categorized = await categorizeTransactionsBatch(data.transactions);
    
    const user = await sb.auth.getUser();
    const toInsert = categorized.map(t => ({
      ...t,
      user_id: user.data.user.id
    }));
    
    const { error } = await sb
      .from('transactions')
      .upsert(toInsert, {
        onConflict: 'plaid_transaction_id'
      });
    
    if (error) throw error;
    
    showToast(`Synced ${data.count} transactions!`, 'success');
    await renderTransactionsTable();
    
  } catch (error) {
    console.error('Sync error:', error);
    showToast('Failed to sync transactions: ' + error.message, 'danger');
  } finally {
    // Reset button
    const syncBtn = document.getElementById('syncTransactionsBtn');
    if (syncBtn) {
      syncBtn.disabled = false;
      syncBtn.innerHTML = '<i class="bi bi-arrow-repeat"></i> Sync Transactions';
    }
  }
}

// Render transactions table
async function renderTransactionsTable() {
  const tbody = document.getElementById('transactionsTableBody');
  if (!tbody) return;
  
  const transactions = await loadTransactions({ limit: 100 });
  
  if (transactions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-5">
          <i class="bi bi-inbox" style="font-size: 3rem; color: var(--color-text-tertiary);"></i>
          <p class="mt-3 text-muted">No transactions yet. Sync from your bank to get started.</p>
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = transactions.map(t => `
    <tr>
      <td>${new Date(t.date).toLocaleDateString()}</td>
      <td>${escapeHtml(t.merchant_name || t.name)}</td>
      <td>
        <select class="form-select form-select-sm" onchange="updateTransactionCategory('${t.id}', this.value)">
          ${CATEGORIES.map(cat => `
            <option value="${cat}" ${t.category === cat ? 'selected' : ''}>${cat}</option>
          `).join('')}
        </select>
        ${!t.user_confirmed && t.confidence > 0 ? `
          <small class="text-muted">AI: ${Math.round(t.confidence * 100)}%</small>
        ` : ''}
      </td>
      <td class="${t.amount > 0 ? 'text-danger' : 'text-success'}">
        ${t.amount > 0 ? '-' : '+'}${formatCurrency(Math.abs(t.amount))}
      </td>
      <td>
        ${t.pending ? '<span class="badge bg-warning">Pending</span>' : ''}
      </td>
    </tr>
  `).join('');
}

// Update transaction category
async function updateTransactionCategory(transactionId, newCategory) {
  try {
    const { error } = await sb
      .from('transactions')
      .update({
        category: newCategory,
        user_confirmed: true
      })
      .eq('id', transactionId);
    
    if (error) throw error;
    
    // Learn from correction
    await learnCategoryPattern(transactionId, newCategory);
    
    showToast('Category updated', 'success');
    
  } catch (error) {
    console.error('Update category error:', error);
    showToast('Failed to update category', 'danger');
  }
}

// Helper function to escape HTML (prevent XSS)
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Helper function to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}
