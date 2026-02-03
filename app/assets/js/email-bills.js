/**
 * Email Bill Integration — Fireside Capital
 * 
 * Handles Gmail bill scanning, pending bill management,
 * and approval/rejection workflow.
 */

// Debug mode (set to true for development logging)
const DEBUG_EMAIL_BILLS = false;
function debugLog(...args) { if (DEBUG_EMAIL_BILLS) console.log('[Email Bills]', ...args); }

// ===== STATE =====
let pendingEmailBills = [];
let selectedBillIds = new Set();

// ===== CONSTANTS =====
const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.7,
  LOW: 0.5,
};

// ===== SCAN EMAIL FOR BILLS =====

/**
 * Trigger a manual Gmail scan for bills.
 * Calls the backend scanner and stores results in pending_bills table.
 */
async function scanEmailForBills() {
  // Rate limiting
  if (window.rateLimiters && !window.rateLimiters.email.allow('scanEmailBills')) {
    const remainingMs = window.rateLimiters.email.getRemainingTime('scanEmailBills');
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    showToast(`Too many scan requests. Please wait ${remainingSeconds} seconds.`, 'warning');
    return;
  }

  const scanBtn = document.getElementById('scanEmailBillsBtn');
  if (!scanBtn) return;

  const originalText = scanBtn.innerHTML;
  scanBtn.disabled = true;
  scanBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Scanning...';

  try {
    // Call the Gmail scanner backend
    // For now, this is a placeholder — we'll implement the actual backend endpoint
    const response = await fetch('/api/scan-email-bills', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await sb.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify({ days: 30 }),
    });

    if (!response.ok) {
      throw new Error(`Scan failed: ${response.statusText}`);
    }

    const result = await response.json();

    // Store parsed bills in pending_bills table
    if (result.bills && result.bills.length > 0) {
      await storePendingBills(result.bills);
      
      // Show success message
      showToast(`Found ${result.bills.length} bills! Review them below.`, 'success');
      
      // Refresh pending bills display
      await loadPendingEmailBills();
      
      // Auto-open review modal
      const reviewModal = new bootstrap.Modal(document.getElementById('emailReviewModal'));
      reviewModal.show();
    } else {
      showToast('No new bills found in your email.', 'info');
    }
  } catch (error) {
    console.error('[Email Bills] Scan error:', error);
    showToast(`Scan failed: ${error.message}. Gmail integration may not be set up yet.`, 'danger');
  } finally {
    scanBtn.disabled = false;
    scanBtn.innerHTML = originalText;
  }
}

/**
 * Store parsed bills in the pending_bills table.
 */
async function storePendingBills(bills) {
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  const records = bills.map((bill) => ({
    user_id: currentUser.id,
    vendor: bill.vendor,
    amount: bill.amount,
    due_date: bill.due_date || null,
    category: bill.category || 'other',
    confidence: bill.confidence || 0.5,
    source_email_id: bill.source_email_id || null,
    email_subject: bill._meta?.subject || '',
    email_snippet: bill._meta?.snippet || '',
    status: 'pending',
  }));

  const { data, error } = await sb
    .from('pending_bills')
    .insert(records)
    .select();

  if (error) {
    console.error('[Email Bills] Failed to store pending bills:', error);
    throw new Error(`Failed to save bills: ${error.message}`);
  }

  debugLog(`Stored ${data.length} pending bills`);
  return data;
}

// ===== LOAD & DISPLAY PENDING BILLS =====

/**
 * Load pending email bills from Supabase.
 */
async function loadPendingEmailBills() {
  if (!currentUser) return;

  try {
    const { data, error } = await sb
      .from('bills')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    pendingEmailBills = data || [];
    updatePendingBillsUI();
  } catch (error) {
    console.error('[Email Bills] Failed to load pending bills:', error);
  }
}

/**
 * Update the pending bills section badge and visibility.
 */
function updatePendingBillsUI() {
  const section = document.getElementById('pendingEmailBillsSection');
  const countEl = document.getElementById('pendingEmailCount');

  if (pendingEmailBills.length > 0) {
    section?.classList.remove('d-none');
    if (countEl) countEl.textContent = pendingEmailBills.length;
  } else {
    section?.classList.add('d-none');
  }
}

// ===== REVIEW MODAL =====

/**
 * Populate the review modal with pending bills.
 */
function populateEmailReviewModal() {
  const loadingEl = document.getElementById('emailReviewLoading');
  const emptyEl = document.getElementById('emailReviewEmpty');
  const batchActionsEl = document.getElementById('emailReviewBatchActions');
  const listEl = document.getElementById('emailReviewList');

  // Show loading state initially
  loadingEl?.classList.remove('d-none');
  emptyEl?.classList.add('d-none');
  batchActionsEl?.classList.add('d-none');
  if (listEl) listEl.textContent = '';

  // Simulate loading delay for UX
  setTimeout(() => {
    loadingEl?.classList.add('d-none');

    if (pendingEmailBills.length === 0) {
      emptyEl?.classList.remove('d-none');
      return;
    }

    batchActionsEl?.classList.remove('d-none');
    renderPendingBillsList();
  }, 300);
}

/**
 * Render the list of pending bills in the review modal.
 */
function renderPendingBillsList() {
  const listEl = document.getElementById('emailReviewList');
  if (!listEl) return;

  listEl.innerHTML = pendingEmailBills
    .map((bill) => {
      const confidencePercent = Math.round(bill.confidence * 100);
      const confidenceBadge = getConfidenceBadge(bill.confidence);
      const isSelected = selectedBillIds.has(bill.id);

      return `
        <div class="card mb-3 pending-bill-card ${isSelected ? 'selected' : ''}" data-bill-id="${bill.id}">
          <div class="card-body">
            <div class="row">
              <!-- Selection Checkbox -->
              <div class="col-auto d-flex align-items-center">
                <div class="form-check">
                  <input 
                    class="form-check-input bill-checkbox" 
                    type="checkbox" 
                    value="${bill.id}" 
                    id="bill-${bill.id}"
                    ${isSelected ? 'checked' : ''}
                  >
                </div>
              </div>

              <!-- Bill Details -->
              <div class="col">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 class="mb-1">
                      ${escapeHtml(bill.vendor)}
                      ${confidenceBadge}
                    </h6>
                    <small class="text-muted">
                      <i class="bi bi-envelope me-1"></i>${escapeHtml(bill.email_subject || 'No subject')}
                    </small>
                  </div>
                  <div class="text-end">
                    <h5 class="mb-0" style="color: var(--color-primary);">${formatCurrency(bill.amount)}</h5>
                    ${bill.due_date ? `<small class="text-muted">Due: ${formatDate(bill.due_date)}</small>` : ''}
                  </div>
                </div>

                <!-- Category & Email Snippet -->
                <div class="row g-2 mb-2">
                  <div class="col-md-4">
                    <label class="form-label form-label-sm">Category</label>
                    <select class="form-select form-select-sm bill-category" data-bill-id="${bill.id}">
                      <option value="utilities" ${bill.category === 'utilities' ? 'selected' : ''}>Utilities</option>
                      <option value="housing" ${bill.category === 'housing' ? 'selected' : ''}>Housing</option>
                      <option value="auto" ${bill.category === 'auto' ? 'selected' : ''}>Auto</option>
                      <option value="insurance" ${bill.category === 'insurance' ? 'selected' : ''}>Insurance</option>
                      <option value="subscriptions" ${bill.category === 'subscriptions' ? 'selected' : ''}>Subscriptions</option>
                      <option value="health" ${bill.category === 'health' ? 'selected' : ''}>Health</option>
                      <option value="other" ${bill.category === 'other' ? 'selected' : ''}>Other</option>
                    </select>
                  </div>
                  <div class="col-md-8">
                    <label class="form-label form-label-sm">Email Preview</label>
                    <div class="email-snippet">
                      ${escapeHtml(bill.email_snippet || 'No preview available').substring(0, 120)}...
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="d-flex gap-2 mt-3">
                  <button class="btn btn-sm btn-success approve-bill-btn" data-bill-id="${bill.id}">
                    <i class="bi bi-check-circle"></i> Approve
                  </button>
                  <button class="btn btn-sm btn-danger reject-bill-btn" data-bill-id="${bill.id}">
                    <i class="bi bi-x-circle"></i> Reject
                  </button>
                  <button class="btn btn-sm btn-outline-primary edit-bill-btn" data-bill-id="${bill.id}">
                    <i class="bi bi-pencil"></i> Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  // Attach event listeners
  attachBillCardEventListeners();
}

/**
 * Get a confidence badge based on confidence score.
 */
function getConfidenceBadge(confidence) {
  const percent = Math.round(confidence * 100);
  if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) {
    return `<span class="badge bg-success ms-2">${percent}% confident</span>`;
  } else if (confidence >= CONFIDENCE_THRESHOLDS.LOW) {
    return `<span class="badge bg-warning text-dark ms-2">${percent}% confident</span>`;
  } else {
    return `<span class="badge bg-danger ms-2">${percent}% confident</span>`;
  }
}

/**
 * Attach event listeners to bill cards.
 */
function attachBillCardEventListeners() {
  // Checkboxes
  document.querySelectorAll('.bill-checkbox').forEach((checkbox) => {
    checkbox.addEventListener('change', (e) => {
      const billId = e.target.value;
      if (e.target.checked) {
        selectedBillIds.add(billId);
      } else {
        selectedBillIds.delete(billId);
      }
      updateBillCardSelection(billId, e.target.checked);
    });
  });

  // Approve buttons
  document.querySelectorAll('.approve-bill-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const billId = e.currentTarget.dataset.billId;
      approveBill(billId);
    });
  });

  // Reject buttons
  document.querySelectorAll('.reject-bill-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const billId = e.currentTarget.dataset.billId;
      rejectBill(billId);
    });
  });

  // Edit buttons
  document.querySelectorAll('.edit-bill-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const billId = e.currentTarget.dataset.billId;
      editBill(billId);
    });
  });

  // Category changes
  document.querySelectorAll('.bill-category').forEach((select) => {
    select.addEventListener('change', (e) => {
      const billId = e.currentTarget.dataset.billId;
      updateBillCategory(billId, e.target.value);
    });
  });
}

/**
 * Update visual selection state of a bill card.
 */
function updateBillCardSelection(billId, isSelected) {
  const card = document.querySelector(`.pending-bill-card[data-bill-id="${billId}"]`);
  if (card) {
    if (isSelected) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  }
}

// ===== BILL ACTIONS =====

/**
 * Approve a single bill — adds it to the bills table and marks as approved.
 */
async function approveBill(billId) {
  const bill = pendingEmailBills.find((b) => b.id === billId);
  if (!bill) return;

  try {
    // Insert into bills table
    const { error: insertError } = await sb.from('bills').insert({
      user_id: currentUser.id,
      name: bill.vendor,
      type: bill.category,
      amount: bill.amount,
      nextDueDate: bill.due_date,
      frequency: 'monthly', // Default frequency
      isFinancing: false,
    });

    if (insertError) throw insertError;

    // Mark as approved in pending_bills
    const { error: updateError } = await sb
      .from('pending_bills')
      .update({ status: 'approved' })
      .eq('id', billId);

    if (updateError) throw updateError;

    // Remove from local state
    pendingEmailBills = pendingEmailBills.filter((b) => b.id !== billId);
    selectedBillIds.delete(billId);

    // Re-render
    renderPendingBillsList();
    updatePendingBillsUI();
    
    // Reload bills page data
    if (typeof loadBills === 'function') {
      loadBills();
    }

    showToast(`✓ ${bill.vendor} added to your bills`, 'success');
  } catch (error) {
    console.error('[Email Bills] Failed to approve bill:', error);
    showToast(`Failed to approve bill: ${error.message}`, 'danger');
  }
}

/**
 * Reject a single bill — marks it as rejected.
 */
async function rejectBill(billId) {
  try {
    const { error } = await sb
      .from('pending_bills')
      .update({ status: 'rejected' })
      .eq('id', billId);

    if (error) throw error;

    // Remove from local state
    pendingEmailBills = pendingEmailBills.filter((b) => b.id !== billId);
    selectedBillIds.delete(billId);

    // Re-render
    renderPendingBillsList();
    updatePendingBillsUI();

    showToast('Bill rejected', 'info');
  } catch (error) {
    console.error('[Email Bills] Failed to reject bill:', error);
    showToast(`Failed to reject bill: ${error.message}`, 'danger');
  }
}

/**
 * Edit a bill — opens inline editor or modal.
 * For Phase 1, we'll allow editing category, amount, and due date inline.
 */
function editBill(billId) {
  const bill = pendingEmailBills.find((b) => b.id === billId);
  if (!bill) return;

  // For now, show a simple prompt — in Phase 2 we can add a proper modal
  const newAmount = prompt(`Edit amount for ${bill.vendor}:`, bill.amount);
  if (newAmount !== null && !isNaN(newAmount)) {
    updateBillAmount(billId, parseFloat(newAmount));
  }
}

/**
 * Update bill category in local state and Supabase.
 */
async function updateBillCategory(billId, newCategory) {
  try {
    const { error } = await sb
      .from('pending_bills')
      .update({ category: newCategory })
      .eq('id', billId);

    if (error) throw error;

    // Update local state
    const bill = pendingEmailBills.find((b) => b.id === billId);
    if (bill) bill.category = newCategory;
  } catch (error) {
    console.error('[Email Bills] Failed to update category:', error);
  }
}

/**
 * Update bill amount in local state and Supabase.
 */
async function updateBillAmount(billId, newAmount) {
  try {
    const { error } = await sb
      .from('pending_bills')
      .update({ amount: newAmount })
      .eq('id', billId);

    if (error) throw error;

    // Update local state
    const bill = pendingEmailBills.find((b) => b.id === billId);
    if (bill) bill.amount = newAmount;

    // Re-render
    renderPendingBillsList();
    showToast('Amount updated', 'success');
  } catch (error) {
    console.error('[Email Bills] Failed to update amount:', error);
    showToast(`Failed to update amount: ${error.message}`, 'danger');
  }
}

// ===== BATCH ACTIONS =====

/**
 * Approve all bills with confidence >= 70%.
 */
async function approveAllHighConfidence() {
  const highConfidenceBills = pendingEmailBills.filter(
    (b) => b.confidence >= CONFIDENCE_THRESHOLDS.HIGH
  );

  if (highConfidenceBills.length === 0) {
    showToast('No high-confidence bills to approve', 'info');
    return;
  }

  const confirmed = confirm(
    `Approve ${highConfidenceBills.length} high-confidence bills?`
  );
  if (!confirmed) return;

  for (const bill of highConfidenceBills) {
    await approveBill(bill.id);
  }

  showToast(`Approved ${highConfidenceBills.length} bills`, 'success');
}

/**
 * Reject all bills with confidence <= 50%.
 */
async function rejectAllLowConfidence() {
  const lowConfidenceBills = pendingEmailBills.filter(
    (b) => b.confidence <= CONFIDENCE_THRESHOLDS.LOW
  );

  if (lowConfidenceBills.length === 0) {
    showToast('No low-confidence bills to reject', 'info');
    return;
  }

  const confirmed = confirm(
    `Reject ${lowConfidenceBills.length} low-confidence bills?`
  );
  if (!confirmed) return;

  for (const bill of lowConfidenceBills) {
    await rejectBill(bill.id);
  }

  showToast(`Rejected ${lowConfidenceBills.length} bills`, 'success');
}

/**
 * Select all bills.
 */
function selectAllBills() {
  pendingEmailBills.forEach((bill) => selectedBillIds.add(bill.id));
  document.querySelectorAll('.bill-checkbox').forEach((checkbox) => {
    checkbox.checked = true;
    updateBillCardSelection(checkbox.value, true);
  });
}

/**
 * Deselect all bills.
 */
function deselectAllBills() {
  selectedBillIds.clear();
  document.querySelectorAll('.bill-checkbox').forEach((checkbox) => {
    checkbox.checked = false;
    updateBillCardSelection(checkbox.value, false);
  });
}

// ===== UTILITY =====

/**
 * Show a toast notification (simple implementation).
 */
function showToast(message, type = 'info') {
  // For now, use browser alert — in Phase 2 we can add a proper toast component
  alert(message);
}

// ===== EVENT LISTENERS =====

function initEmailBillsEventListeners() {
  // Scan button
  const scanBtn = document.getElementById('scanEmailBillsBtn');
  if (scanBtn) {
    scanBtn.addEventListener('click', scanEmailForBills);
  }

  // Review modal open event
  const reviewModal = document.getElementById('emailReviewModal');
  if (reviewModal) {
    reviewModal.addEventListener('show.bs.modal', populateEmailReviewModal);
  }

  // Batch action buttons
  const approveAllBtn = document.getElementById('approveAllHighConfidenceBtn');
  if (approveAllBtn) {
    approveAllBtn.addEventListener('click', approveAllHighConfidence);
  }

  const rejectAllBtn = document.getElementById('rejectAllLowConfidenceBtn');
  if (rejectAllBtn) {
    rejectAllBtn.addEventListener('click', rejectAllLowConfidence);
  }

  const selectAllBtn = document.getElementById('selectAllBtn');
  if (selectAllBtn) {
    selectAllBtn.addEventListener('click', selectAllBills);
  }

  const deselectAllBtn = document.getElementById('deselectAllBtn');
  if (deselectAllBtn) {
    deselectAllBtn.addEventListener('click', deselectAllBills);
  }

  // Save button (for future batch approval)
  const saveBtn = document.getElementById('saveEmailReviewBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      // Approve all selected bills
      const selectedBills = Array.from(selectedBillIds);
      if (selectedBills.length === 0) {
        showToast('No bills selected', 'warning');
        return;
      }

      for (const billId of selectedBills) {
        await approveBill(billId);
      }

      // Close modal if all bills processed
      if (pendingEmailBills.length === 0) {
        bootstrap.Modal.getInstance(reviewModal)?.hide();
      }
    });
  }
}

// ===== INITIALIZATION =====

// Auto-load pending bills when page loads (called from app.js after auth)
function initEmailBills() {
  initEmailBillsEventListeners();
  loadPendingEmailBills();
}

// Export for use in app.js
if (typeof window !== 'undefined') {
  window.initEmailBills = initEmailBills;
  window.loadPendingEmailBills = loadPendingEmailBills;
}
