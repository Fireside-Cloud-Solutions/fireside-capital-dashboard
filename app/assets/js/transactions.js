// transactions.js - Transaction Management Module

// Plaid Express server URL — configured for dev (localhost:3000)
// Override by setting window.PLAID_SERVER_URL before this script loads (e.g., from server config)
const PLAID_SERVER_URL = (typeof window.PLAID_SERVER_URL !== 'undefined')
  ? window.PLAID_SERVER_URL
  : 'http://localhost:3000';

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

// Pagination state
let currentPage = 1;
let itemsPerPage = 50;
let totalCount = 0;
let activeFilters = {}; // Track active filters for pagination

// Load all transactions for current user with pagination
async function loadTransactions(options = {}) {
  try {
    const user = await sb.auth.getUser();
    if (!user.data.user) return { data: [], count: 0 };
    
    const limit = options.limit || 50;
    const page = options.page || 1;
    const offset = (page - 1) * limit;
    
    // Build query
    let query = sb
      .from('transactions')
      .select('*', { count: 'exact' }) // Get total count for pagination
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
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return { data: data || [], count: count || 0 };
    
  } catch (error) {
    console.error('Load transactions error:', error);
    return { data: [], count: 0 };
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
    
    // Fetch from backend (PLAID_SERVER_URL defaults to localhost:3000 for dev)
    const response = await fetch(`${PLAID_SERVER_URL}/api/transactions/sync`, {
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

// Update pagination UI
function updatePaginationUI() {
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  
  document.getElementById('pageIndicator').textContent = 
    `Page ${currentPage} of ${totalPages || 1}`;
  
  document.getElementById('prevPageBtn').disabled = currentPage === 1;
  document.getElementById('nextPageBtn').disabled = currentPage >= totalPages;
  
  // Show/hide pagination if only 1 page
  const controls = document.getElementById('paginationControls');
  if (totalPages <= 1) {
    controls.classList.add('d-none');
  } else {
    controls.classList.remove('d-none');
  }
}

// Render transactions table
async function renderTransactionsTable(filters = {}) {
  const tbody = document.getElementById('transactionsTableBody');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const emptyState = document.getElementById('emptyState');
  const tableWrapper = document.querySelector('.table-responsive');
  
  if (!tbody) return;
  
  // Show loading
  tbody.innerHTML = '';
  if (loadingSpinner) loadingSpinner.classList.remove('d-none');
  if (emptyState) emptyState.classList.add('d-none');
  
  // Get filters with pagination
  const options = {
    category: filters.category || '',
    startDate: filters.startDate || '',
    endDate: filters.endDate || '',
    page: currentPage,
    limit: itemsPerPage
  };
  
  // Load paginated data
  const result = await loadTransactions(options);
  const transactions = result.data;
  totalCount = result.count;
  
  // Hide loading
  if (loadingSpinner) loadingSpinner.classList.add('d-none');
  
  // Toggle empty state vs table visibility
  if (transactions.length === 0) {
    if (tableWrapper) tableWrapper.classList.add('d-none');
    if (emptyState) emptyState.classList.remove('d-none');
    updatePaginationUI(); // Hide pagination controls when table is empty
    return;
  }
  
  // Show table, hide empty state
  if (tableWrapper) tableWrapper.classList.remove('d-none');
  if (emptyState) emptyState.classList.add('d-none');
  
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
  
  // Update pagination UI
  updatePaginationUI();
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

// Add manual transaction
async function addManualTransaction() {
  const submitBtn = document.getElementById('addTransactionSubmitBtn');
  const alertDiv = document.getElementById('addTransactionAlert');
  
  try {
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Adding...';
    
    // Get form values
    const date = document.getElementById('transactionDate').value;
    const description = document.getElementById('transactionDescription').value.trim();
    const amount = parseFloat(document.getElementById('transactionAmount').value);
    const type = document.getElementById('transactionType').value;
    const category = document.getElementById('transactionCategory').value;
    const account = document.getElementById('transactionAccount').value.trim() || 'Manual Entry';
    
    // Validate
    if (!date || !description || !amount || !type || !category) {
      throw new Error('Please fill in all required fields');
    }
    
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    
    // Get current user
    const user = await sb.auth.getUser();
    if (!user.data.user) {
      throw new Error('You must be logged in to add transactions');
    }
    
    // Prepare transaction data
    // Note: Plaid convention is expense = positive, income = negative
    const transactionAmount = type === 'expense' ? amount : -amount;
    
    const transaction = {
      user_id: user.data.user.id,
      date: date,
      merchant_name: description,
      amount: transactionAmount,
      category: category,
      source: 'manual',
      confidence_level: 1.0,
      user_confirmed: true,
      account_name: account,
      pending: false,
      name: description
    };
    
    // Insert into Supabase
    const { data, error } = await sb
      .from('transactions')
      .insert([transaction])
      .select();
    
    if (error) throw error;
    
    // Show success message
    showToast(`Transaction added successfully!`, 'success');
    
    // Reset form
    document.getElementById('addTransactionForm').reset();
    
    // Close modal
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addTransactionModal'));
    modal.hide();
    
    // Reload transactions
    await renderTransactionsTable();
    
  } catch (error) {
    console.error('Add transaction error:', error);
    
    // Show error in alert
    alertDiv.className = 'alert alert-danger';
    alertDiv.textContent = error.message || 'Failed to add transaction';
    alertDiv.classList.remove('d-none');
    
  } finally {
    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Add Transaction';
  }
}

// Auto-initialize on page load when transactions.html is present
document.addEventListener('DOMContentLoaded', async () => {
  // Check for transactions page elements after DOM is ready (fixes race condition)
  if (document.getElementById('transactionsTableBody')) {
    try {
      console.log('[Transactions] Initializing page...');
      await renderTransactionsTable();
      console.log('[Transactions] Page initialized successfully');
      
      // Set up pagination event listeners
      const prevBtn = document.getElementById('prevPageBtn');
      const nextBtn = document.getElementById('nextPageBtn');
      const itemsPerPageSelect = document.getElementById('itemsPerPage');
      
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          if (currentPage > 1) {
            currentPage--;
            renderTransactionsTable(activeFilters);
          }
        });
      }
      
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          const totalPages = Math.ceil(totalCount / itemsPerPage);
          if (currentPage < totalPages) {
            currentPage++;
            renderTransactionsTable(activeFilters);
          }
        });
      }
      
      if (itemsPerPageSelect) {
        itemsPerPageSelect.addEventListener('change', (e) => {
          itemsPerPage = parseInt(e.target.value);
          currentPage = 1; // Reset to page 1
          renderTransactionsTable(activeFilters);
        });
      }
      
    } catch (error) {
      console.error('[Transactions] Initialization failed:', error);
    }
  }
});
