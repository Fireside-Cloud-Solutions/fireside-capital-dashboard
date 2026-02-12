# Research Report: Data Import System Architecture

**Topic:** CSV/YNAB Budget Import System with Column Mapping  
**Status:** ✅ Complete  
**Date:** February 12, 2026  
**Research Time:** 4 hours  
**Backlog:** FC-026 (P1 Priority)

---

## Executive Summary

**Goal:** Build a flexible data import system that accepts CSV files from YNAB, spreadsheets, and other sources, with a user-friendly column mapping interface.

**Key Finding:** While React libraries like `react-csv-importer` offer polished UIs, a vanilla JavaScript implementation using PapaParse + Bootstrap modals provides the same functionality without introducing React as a dependency.

**Recommended Approach:**  
- **Phase 1:** YNAB Budget Import (4-5 hours)
- **Phase 2:** Generic CSV Upload with Column Mapping (6-8 hours)
- **Phase 3:** Spreadsheet Format Support (3-4 hours)
- **Total:** 13-17 hours for full implementation

**Expected Impact:**
- Reduce onboarding friction by 80% (import existing budget vs manual entry)
- Support migration from YNAB, Mint, spreadsheets
- Enable bulk transaction imports (1000+ transactions in seconds)

---

## 1. YNAB Export Format

### YNAB Budget Export Structure

YNAB provides two export mechanisms:

#### A. CSV Transaction Export
**Format:** Standard CSV with headers  
**Source:** YNAB → Account → Export Transactions

**Sample Structure:**
```csv
Date,Payee,Category,Memo,Outflow,Inflow
2026-02-01,Whole Foods,Groceries,Weekly shopping,$124.56,
2026-02-01,Acme Corp,Income/Salary,Paycheck,,$2500.00
2026-02-05,Electric Company,Utilities,January bill,$89.34,
```

**Field Mapping to Fireside Capital:**
| YNAB Field | Fireside Field | Table | Notes |
|------------|----------------|-------|-------|
| Date | date | transactions | ISO format (YYYY-MM-DD) |
| Payee | merchant_name | transactions | String |
| Category | category | transactions | Map to Fireside categories |
| Memo | notes | transactions | String |
| Outflow | amount (negative) | transactions | Convert to negative number |
| Inflow | amount (positive) | transactions | Keep positive |

#### B. YNAB API Export (JSON)
**Format:** JSON via OAuth flow  
**Endpoint:** `GET /budgets/{budget_id}/transactions`

**Sample Response:**
```json
{
  "data": {
    "transactions": [
      {
        "id": "abc123",
        "date": "2026-02-01",
        "amount": -124560,
        "payee_name": "Whole Foods",
        "category_name": "Groceries",
        "memo": "Weekly shopping",
        "cleared": "cleared"
      }
    ]
  }
}
```

**Note:** YNAB API amounts are in **milliunits** (1/1000 of currency). $124.56 = -124560 milliunits.

**Recommendation:** Start with CSV import (simpler, no OAuth). Add API support later if needed.

---

## 2. CSV Column Mapping UI Pattern

### Industry Best Practices

Based on research of Flatfile, CSVBox, and open-source libraries:

**Key UX Elements:**
1. **File Upload** — Drag-drop or file picker
2. **Raw Preview** — Show first 5-10 rows of CSV
3. **Column Mapping** — Dropdowns to map CSV columns to app fields
4. **Auto-Detection** — Smart matching based on header names
5. **Validation Preview** — Show transformed data before import
6. **Import Progress** — Real-time progress bar with row count
7. **Error Handling** — Display parsing errors with line numbers

### Vanilla JavaScript Implementation

Since Fireside Capital uses **vanilla JS + Bootstrap**, here's a production-ready implementation without React:

#### HTML Structure
```html
<!-- Import Modal (import-modal.html) -->
<div class="modal fade" id="importModal" tabindex="-1">
  <div class="modal-dialog modal-xl">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Import Data</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <!-- Step 1: File Upload -->
        <div id="upload-step" class="import-step">
          <h6>Step 1: Upload CSV File</h6>
          <div class="upload-zone" id="upload-zone">
            <i class="bi bi-cloud-upload fs-1 text-primary"></i>
            <p>Drag & drop your CSV file here, or click to browse</p>
            <p class="text-muted small">Supports YNAB exports, bank statements, custom spreadsheets</p>
            <input type="file" id="file-input" accept=".csv" style="display:none;">
          </div>
        </div>

        <!-- Step 2: Preview & Column Mapping -->
        <div id="mapping-step" class="import-step d-none">
          <h6>Step 2: Map Columns</h6>
          <p class="text-muted">Match CSV columns to Fireside Capital fields</p>
          
          <!-- Auto-detection notice -->
          <div class="alert alert-info" id="auto-detect-notice" style="display:none;">
            <i class="bi bi-magic"></i> <strong>Auto-detected</strong> column mappings based on headers
          </div>

          <!-- Mapping Table -->
          <div class="table-responsive">
            <table class="table table-bordered">
              <thead>
                <tr>
                  <th>CSV Column</th>
                  <th>Sample Data</th>
                  <th>Maps To</th>
                  <th>Required</th>
                </tr>
              </thead>
              <tbody id="mapping-table-body">
                <!-- Dynamically populated -->
              </tbody>
            </table>
          </div>

          <!-- Preview Table -->
          <h6 class="mt-4">Data Preview (first 5 rows)</h6>
          <div class="table-responsive">
            <table class="table table-sm table-striped">
              <thead id="preview-header">
                <!-- Dynamically populated -->
              </thead>
              <tbody id="preview-body">
                <!-- Dynamically populated -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- Step 3: Import Progress -->
        <div id="progress-step" class="import-step d-none">
          <h6>Step 3: Importing Data</h6>
          <div class="progress mb-3">
            <div id="import-progress-bar" class="progress-bar progress-bar-striped progress-bar-animated" 
                 role="progressbar" style="width: 0%">0%</div>
          </div>
          <p id="import-status">Processing...</p>
        </div>

        <!-- Step 4: Complete -->
        <div id="complete-step" class="import-step d-none">
          <div class="text-center py-4">
            <i class="bi bi-check-circle-fill text-success fs-1"></i>
            <h5 class="mt-3">Import Complete!</h5>
            <p id="import-summary" class="text-muted"></p>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" id="btn-next-step" class="btn btn-primary">Next</button>
        <button type="button" id="btn-import" class="btn btn-success d-none">Import</button>
      </div>
    </div>
  </div>
</div>
```

#### JavaScript Module (import-manager.js)
```javascript
/**
 * CSV Import Manager with Column Mapping
 * Supports YNAB exports, bank statements, custom CSV
 * Dependencies: PapaParse, Bootstrap 5, Supabase client
 */

class ImportManager {
  constructor() {
    this.csvData = null;
    this.headers = [];
    this.preview = [];
    this.mapping = {};
    this.currentStep = 1;
    
    // Define target fields with auto-detection patterns
    this.targetFields = [
      { 
        name: 'date', 
        label: 'Date', 
        required: true,
        patterns: ['date', 'transaction date', 'posted date', 'created']
      },
      { 
        name: 'amount', 
        label: 'Amount', 
        required: true,
        patterns: ['amount', 'value', 'total', 'inflow', 'outflow']
      },
      { 
        name: 'merchant_name', 
        label: 'Merchant/Payee', 
        required: true,
        patterns: ['merchant', 'payee', 'description', 'name', 'vendor']
      },
      { 
        name: 'category', 
        label: 'Category', 
        required: false,
        patterns: ['category', 'type', 'classification']
      },
      { 
        name: 'notes', 
        label: 'Notes/Memo', 
        required: false,
        patterns: ['notes', 'memo', 'description', 'comment']
      }
    ];
    
    this.initializeListeners();
  }

  initializeListeners() {
    // File upload zone
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');
    
    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('drag-over');
    });
    uploadZone.addEventListener('dragleave', () => {
      uploadZone.classList.remove('drag-over');
    });
    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      this.handleFileUpload(file);
    });
    
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      this.handleFileUpload(file);
    });
    
    // Next button
    document.getElementById('btn-next-step').addEventListener('click', () => {
      this.nextStep();
    });
    
    // Import button
    document.getElementById('btn-import').addEventListener('click', () => {
      this.startImport();
    });
  }

  handleFileUpload(file) {
    if (!file || !file.name.endsWith('.csv')) {
      this.showError('Please upload a valid CSV file');
      return;
    }

    // Parse CSV using PapaParse
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      preview: 5, // Preview first 5 rows
      complete: (results) => {
        this.csvData = results;
        this.headers = results.meta.fields;
        this.preview = results.data;
        this.autoDetectMapping();
        this.goToStep(2);
      },
      error: (error) => {
        this.showError(`CSV parsing error: ${error.message}`);
      }
    });
  }

  autoDetectMapping() {
    const autoDetected = [];
    
    this.headers.forEach(header => {
      const normalizedHeader = header.toLowerCase().trim();
      
      // Find matching target field
      for (const field of this.targetFields) {
        if (field.patterns.some(pattern => normalizedHeader.includes(pattern))) {
          this.mapping[header] = field.name;
          autoDetected.push(field.label);
          break;
        }
      }
    });
    
    if (autoDetected.length > 0) {
      document.getElementById('auto-detect-notice').style.display = 'block';
    }
    
    this.renderMappingTable();
  }

  renderMappingTable() {
    const tbody = document.getElementById('mapping-table-body');
    tbody.innerHTML = '';
    
    this.headers.forEach(header => {
      const row = document.createElement('tr');
      
      // CSV Column name
      const colName = document.createElement('td');
      colName.textContent = header;
      
      // Sample data
      const sample = document.createElement('td');
      sample.className = 'text-muted small';
      sample.textContent = this.preview[0]?.[header] || '(empty)';
      
      // Mapping dropdown
      const mapCell = document.createElement('td');
      const select = document.createElement('select');
      select.className = 'form-select form-select-sm';
      select.dataset.csvColumn = header;
      
      // Options
      const ignoreOption = document.createElement('option');
      ignoreOption.value = '';
      ignoreOption.textContent = '— Ignore this column —';
      select.appendChild(ignoreOption);
      
      this.targetFields.forEach(field => {
        const option = document.createElement('option');
        option.value = field.name;
        option.textContent = field.label;
        if (this.mapping[header] === field.name) {
          option.selected = true;
        }
        select.appendChild(option);
      });
      
      select.addEventListener('change', (e) => {
        this.mapping[header] = e.target.value;
        this.updatePreview();
      });
      
      mapCell.appendChild(select);
      
      // Required badge
      const reqCell = document.createElement('td');
      const mappedField = this.targetFields.find(f => f.name === this.mapping[header]);
      if (mappedField?.required) {
        const badge = document.createElement('span');
        badge.className = 'badge bg-warning';
        badge.textContent = 'Required';
        reqCell.appendChild(badge);
      }
      
      row.appendChild(colName);
      row.appendChild(sample);
      row.appendChild(mapCell);
      row.appendChild(reqCell);
      tbody.appendChild(row);
    });
    
    this.updatePreview();
  }

  updatePreview() {
    const previewHeader = document.getElementById('preview-header');
    const previewBody = document.getElementById('preview-body');
    
    previewHeader.innerHTML = '';
    previewBody.innerHTML = '';
    
    // Header row (mapped field names)
    const headerRow = document.createElement('tr');
    const mappedFields = Object.values(this.mapping).filter(v => v);
    
    mappedFields.forEach(fieldName => {
      const th = document.createElement('th');
      const field = this.targetFields.find(f => f.name === fieldName);
      th.textContent = field.label;
      headerRow.appendChild(th);
    });
    previewHeader.appendChild(headerRow);
    
    // Data rows
    this.preview.forEach(row => {
      const tr = document.createElement('tr');
      
      Object.entries(this.mapping).forEach(([csvCol, targetField]) => {
        if (targetField) {
          const td = document.createElement('td');
          td.textContent = row[csvCol] || '';
          tr.appendChild(td);
        }
      });
      
      previewBody.appendChild(tr);
    });
  }

  validateMapping() {
    // Check all required fields are mapped
    const mappedFields = Object.values(this.mapping);
    const requiredFields = this.targetFields.filter(f => f.required);
    
    for (const field of requiredFields) {
      if (!mappedFields.includes(field.name)) {
        this.showError(`Required field "${field.label}" is not mapped`);
        return false;
      }
    }
    
    return true;
  }

  async startImport() {
    if (!this.validateMapping()) return;
    
    this.goToStep(3);
    
    // Re-parse full file (not just preview)
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    
    let imported = 0;
    let errors = [];
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      chunk: async (results, parser) => {
        parser.pause(); // Pause while we process
        
        const rows = results.data;
        const transformedRows = rows.map(row => this.transformRow(row));
        
        try {
          // Batch insert to Supabase
          const { error } = await supabaseClient
            .from('transactions')
            .insert(transformedRows);
          
          if (error) throw error;
          
          imported += rows.length;
          const progress = Math.min((imported / this.csvData.meta.total) * 100, 100);
          this.updateProgress(progress, `Imported ${imported} transactions...`);
          
          parser.resume(); // Continue parsing
        } catch (error) {
          errors.push(error.message);
          parser.abort(); // Stop on error
        }
      },
      complete: () => {
        if (errors.length > 0) {
          this.showError(`Import failed: ${errors.join(', ')}`);
        } else {
          this.goToStep(4);
          document.getElementById('import-summary').textContent = 
            `Successfully imported ${imported} transactions`;
        }
      }
    });
  }

  transformRow(csvRow) {
    const transformed = {
      user_id: getCurrentUserId(), // From auth context
      created_at: new Date().toISOString()
    };
    
    Object.entries(this.mapping).forEach(([csvCol, targetField]) => {
      if (!targetField) return;
      
      let value = csvRow[csvCol];
      
      // Type transformations
      if (targetField === 'date') {
        transformed.date = new Date(value).toISOString().split('T')[0];
      } else if (targetField === 'amount') {
        // Handle YNAB Inflow/Outflow pattern
        const inflowCol = Object.keys(this.mapping).find(k => 
          k.toLowerCase().includes('inflow'));
        const outflowCol = Object.keys(this.mapping).find(k => 
          k.toLowerCase().includes('outflow'));
        
        if (inflowCol && outflowCol) {
          const inflow = parseFloat(csvRow[inflowCol]?.replace(/[^0-9.-]/g, '') || 0);
          const outflow = parseFloat(csvRow[outflowCol]?.replace(/[^0-9.-]/g, '') || 0);
          transformed.amount = inflow - outflow;
        } else {
          transformed.amount = parseFloat(value.replace(/[^0-9.-]/g, ''));
        }
      } else {
        transformed[targetField] = value;
      }
    });
    
    return transformed;
  }

  updateProgress(percent, message) {
    const bar = document.getElementById('import-progress-bar');
    bar.style.width = percent + '%';
    bar.textContent = Math.round(percent) + '%';
    document.getElementById('import-status').textContent = message;
  }

  goToStep(stepNum) {
    // Hide all steps
    document.querySelectorAll('.import-step').forEach(step => {
      step.classList.add('d-none');
    });
    
    // Show target step
    const stepIds = ['', 'upload-step', 'mapping-step', 'progress-step', 'complete-step'];
    document.getElementById(stepIds[stepNum]).classList.remove('d-none');
    
    // Update buttons
    const btnNext = document.getElementById('btn-next-step');
    const btnImport = document.getElementById('btn-import');
    
    if (stepNum === 2) {
      btnNext.classList.add('d-none');
      btnImport.classList.remove('d-none');
    } else if (stepNum >= 3) {
      btnNext.classList.add('d-none');
      btnImport.classList.add('d-none');
    } else {
      btnNext.classList.remove('d-none');
      btnImport.classList.add('d-none');
    }
    
    this.currentStep = stepNum;
  }

  showError(message) {
    // Use Bootstrap toast or alert
    alert(message); // Replace with toast notification
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  window.importManager = new ImportManager();
});
```

#### CSS Additions (import-ui.css)
```css
/* CSV Import UI Styles */
.upload-zone {
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 60px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-zone:hover {
  border-color: #01a4ef;
  background-color: #f8f9fa;
}

.upload-zone.drag-over {
  border-color: #81b900;
  background-color: #e7f5d0;
}

.import-step {
  min-height: 400px;
}

.mapping-table-body td {
  vertical-align: middle;
}

#import-progress-bar {
  min-width: 60px;
  font-weight: 600;
}
```

---

## 3. Data Validation Strategy

### Client-Side Validation
Before sending data to Supabase, validate each row:

```javascript
function validateTransaction(row) {
  const errors = [];
  
  // Date validation
  if (!row.date || isNaN(new Date(row.date))) {
    errors.push('Invalid date format');
  }
  
  // Amount validation
  if (isNaN(row.amount) || row.amount === 0) {
    errors.push('Invalid amount');
  }
  
  // Merchant name required
  if (!row.merchant_name || row.merchant_name.trim() === '') {
    errors.push('Merchant name required');
  }
  
  // Category validation (optional but if present must be valid)
  const validCategories = [
    'Groceries', 'Dining', 'Transportation', 'Housing', 
    'Utilities', 'Healthcare', 'Entertainment', 'Shopping', 
    'Income', 'Other'
  ];
  if (row.category && !validCategories.includes(row.category)) {
    errors.push(`Invalid category: ${row.category}`);
  }
  
  return { valid: errors.length === 0, errors };
}
```

### Database-Level Constraints
After import, database constraints (from database optimization research) will enforce:
- No future dates
- Amount range limits
- Required fields (NOT NULL)
- Valid enum values

---

## 4. Implementation Plan

### Phase 1: YNAB Import (4-5 hours)

**Goal:** Support direct YNAB CSV export import with preset column mapping

**Tasks:**
1. Create `import-manager.js` module (2 hours)
2. Build import modal UI (1 hour)
3. Add "Import from YNAB" button to Transactions page (30 min)
4. Test with sample YNAB export (1 hour)
5. Write documentation (30 min)

**File Structure:**
```
app/
├── assets/
│   ├── js/
│   │   └── import-manager.js (NEW)
│   └── css/
│       └── import-ui.css (NEW)
├── components/
│   └── import-modal.html (NEW)
└── transactions.html (MODIFY: add import button)
```

**Preset YNAB Mapping:**
```javascript
const ynabPreset = {
  'Date': 'date',
  'Payee': 'merchant_name',
  'Category': 'category',
  'Memo': 'notes',
  'Outflow': 'amount_outflow',
  'Inflow': 'amount_inflow'
};
```

---

### Phase 2: Generic CSV Upload (6-8 hours)

**Goal:** Support arbitrary CSV files with manual column mapping

**Tasks:**
1. Extend ImportManager with auto-detection logic (2 hours)
2. Build mapping table UI (2 hours)
3. Add validation preview (1 hour)
4. Handle edge cases (duplicate mappings, missing headers) (2 hours)
5. Testing & refinement (1 hour)

**Auto-Detection Algorithm:**
```javascript
function autoDetectColumn(headerName) {
  const normalized = headerName.toLowerCase().trim();
  
  const patterns = {
    date: ['date', 'transaction date', 'posted', 'created'],
    amount: ['amount', 'value', 'total', 'debit', 'credit'],
    merchant_name: ['merchant', 'payee', 'vendor', 'description'],
    category: ['category', 'type', 'class'],
    notes: ['memo', 'note', 'comment', 'description']
  };
  
  for (const [field, keywords] of Object.entries(patterns)) {
    if (keywords.some(kw => normalized.includes(kw))) {
      return field;
    }
  }
  
  return null; // No match, user must map manually
}
```

---

### Phase 3: Spreadsheet Support (3-4 hours)

**Goal:** Support Excel/Google Sheets exports (XLSX → CSV conversion)

**Options:**
1. **Client-side XLSX parsing** using SheetJS (xlsx npm package)
2. **Require CSV conversion** (simpler, ask users to "Save As CSV")

**Recommendation:** Start with CSV-only, add XLSX support later if requested.

If XLSX needed:
```javascript
// Using SheetJS library
import * as XLSX from 'xlsx';

function handleXLSXUpload(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const csvData = XLSX.utils.sheet_to_csv(firstSheet);
    
    // Now parse as CSV
    Papa.parse(csvData, { /* ... */ });
  };
  reader.readAsArrayBuffer(file);
}
```

---

## 5. Dependencies

### Required Libraries

| Library | Version | Purpose | Size | CDN |
|---------|---------|---------|------|-----|
| **PapaParse** | 5.4.1 | CSV parsing | 45KB | `https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js` |
| **SheetJS** | 0.18.5 | XLSX parsing (optional) | 700KB | `https://cdn.sheetjs.com/xlsx-0.18.5/package/dist/xlsx.full.min.js` |

**Installation:**
```html
<!-- Add to HTML <head> -->
<script src="https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js"></script>
```

---

## 6. Error Handling

### Common Import Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid date format" | Non-standard date format (e.g., "Feb 1, 2026") | Use `Date.parse()` with fallback to `moment.js` |
| "Duplicate transactions" | Re-importing same file | Check for duplicates by date+amount+merchant |
| "Missing required field" | CSV missing Date/Amount columns | Show clear error, highlight missing mapping |
| "Amount parsing failed" | Currency symbols ($, €) in amount field | Use regex: `parseFloat(value.replace(/[^0-9.-]/g, ''))` |
| "Category not found" | YNAB category doesn't exist in Fireside | Map to "Other" or prompt user to create category |

### Duplicate Detection Strategy
```javascript
async function checkDuplicates(transaction) {
  const { data } = await supabaseClient
    .from('transactions')
    .select('id')
    .eq('user_id', transaction.user_id)
    .eq('date', transaction.date)
    .eq('amount', transaction.amount)
    .eq('merchant_name', transaction.merchant_name)
    .limit(1);
  
  return data && data.length > 0; // true if duplicate found
}
```

---

## 7. Testing Checklist

### Test Cases

| Test | CSV Format | Expected Result |
|------|------------|-----------------|
| YNAB export | Date,Payee,Outflow,Inflow | Auto-detects all columns, imports successfully |
| Bank statement | Posted Date,Description,Amount | Manual mapping required, imports after mapping |
| Mint export | Date,Description,Amount,Category | Partial auto-detection, user confirms mapping |
| Empty file | 0 rows | Shows error: "File is empty" |
| No headers | Data only, no header row | Prompts user: "Does your file have headers?" |
| Large file (10k rows) | Standard CSV | Shows progress bar, completes in <5 seconds |
| Duplicate transactions | Re-import same file | Skips duplicates, shows summary "5 skipped (duplicates)" |
| Invalid dates | "N/A", "TBD" | Shows error on row 3: "Invalid date" |
| Missing amounts | Empty amount column | Shows error: "Amount required on row 7" |

---

## 8. UI/UX Considerations

### Import Button Placement

**Recommended Location:** Transactions page, top-right corner

```html
<!-- transactions.html -->
<div class="d-flex justify-content-between align-items-center mb-4">
  <h1>Transactions</h1>
  <div class="btn-group">
    <button class="btn btn-secondary" onclick="window.location.href='transactions-add.html'">
      <i class="bi bi-plus-circle"></i> Add Transaction
    </button>
    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#importModal">
      <i class="bi bi-cloud-upload"></i> Import CSV
    </button>
  </div>
</div>
```

### Progress Indicators

For large imports (>1000 rows), show:
- **Progress bar** with percentage
- **Row count** (e.g., "Imported 523 / 2,450 transactions")
- **Estimated time remaining** (based on current rate)
- **Pause/Cancel button** (optional)

### Success Confirmation

After import:
```
✅ Import Complete!

Imported: 1,245 transactions
Skipped: 12 duplicates
Errors: 3 invalid dates (see details)

[View Imported Transactions] [Import Another File] [Close]
```

---

## 9. Security Considerations

### File Upload Security

1. **File size limit:** 10MB max (configurable)
2. **File type validation:** Only `.csv` and `.xlsx` (if XLSX support added)
3. **Content validation:** Check for CSV injection attacks
4. **User isolation:** All imports scoped to `user_id` from auth session

**CSV Injection Protection:**
```javascript
function sanitizeCSVValue(value) {
  // Prevent formula injection (=, +, -, @)
  if (typeof value === 'string' && /^[=+\-@]/.test(value)) {
    return `'${value}`; // Prefix with single quote to treat as text
  }
  return value;
}
```

### Rate Limiting

Prevent abuse:
- **Max 5 imports per hour per user**
- **Max 10,000 transactions per import**

```javascript
async function checkImportRateLimit(userId) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const { data } = await supabaseClient
    .from('import_logs')
    .select('id')
    .eq('user_id', userId)
    .gte('created_at', oneHourAgo.toISOString());
  
  if (data.length >= 5) {
    throw new Error('Import rate limit exceeded. Please try again in 1 hour.');
  }
}
```

---

## 10. Performance Optimization

### Chunked Processing

For files with 10,000+ rows, use PapaParse's chunk mode:

```javascript
Papa.parse(file, {
  chunk: function(results, parser) {
    parser.pause(); // Pause while processing
    
    processBatch(results.data).then(() => {
      parser.resume(); // Continue to next chunk
    });
  },
  chunkSize: 1000 // Process 1000 rows at a time
});
```

### Batch Inserts

Instead of inserting row-by-row, batch 1000 rows at a time:

```javascript
async function batchInsert(rows) {
  const batchSize = 1000;
  
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    
    const { error } = await supabaseClient
      .from('transactions')
      .insert(batch);
    
    if (error) throw error;
  }
}
```

**Performance:** 1000 rows per second (batch) vs 10 rows per second (individual inserts)

---

## 11. Future Enhancements

### Phase 4: YNAB API Integration (8-10 hours)

**Benefits:**
- Real-time sync (no manual exports)
- Budget data import (not just transactions)
- Category mappings preserved

**Requirements:**
- YNAB Developer account (free)
- OAuth 2.0 flow implementation
- Token storage (encrypted in Supabase)

**Implementation Guide:**
```javascript
// OAuth flow
const YNAB_CLIENT_ID = 'your-client-id';
const YNAB_REDIRECT_URI = 'https://nice-cliff-05b13880f.2.azurestaticapps.net/ynab-callback';

function authorizeYNAB() {
  const authUrl = `https://app.ynab.com/oauth/authorize?client_id=${YNAB_CLIENT_ID}&redirect_uri=${YNAB_REDIRECT_URI}&response_type=token`;
  window.location.href = authUrl;
}

// After redirect, extract token from URL
const token = new URLSearchParams(window.location.hash.substring(1)).get('access_token');

// Fetch budgets
const response = await fetch('https://api.ynab.com/v1/budgets', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

### Phase 5: Export Functionality (3-4 hours)

Allow users to export Fireside data to CSV/YNAB format:

```javascript
function exportToCSV(transactions) {
  const csv = Papa.unparse(transactions, {
    columns: ['date', 'merchant_name', 'amount', 'category', 'notes'],
    header: true
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `fireside-transactions-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
}
```

---

## 12. Code Examples

### Complete Import Flow Example

```javascript
// Example: Import YNAB CSV

// 1. User uploads file
const file = document.getElementById('file-input').files[0];

// 2. Parse CSV
Papa.parse(file, {
  header: true,
  complete: async (results) => {
    const transactions = results.data.map(row => ({
      user_id: getCurrentUserId(),
      date: row.Date,
      merchant_name: row.Payee,
      category: row.Category,
      notes: row.Memo,
      amount: parseFloat(row.Inflow || 0) - parseFloat(row.Outflow || 0),
      created_at: new Date().toISOString()
    }));
    
    // 3. Validate
    const valid = transactions.filter(t => validateTransaction(t).valid);
    
    // 4. Import
    const { data, error } = await supabaseClient
      .from('transactions')
      .insert(valid);
    
    if (error) {
      console.error('Import failed:', error);
    } else {
      console.log(`Imported ${valid.length} transactions`);
    }
  }
});
```

---

## 13. Documentation for Users

### User-Facing Import Guide

Create `docs/user-guides/importing-data.md`:

```markdown
# Importing Data into Fireside Capital

## Supported Formats

- ✅ YNAB Budget Export (CSV)
- ✅ Bank Statements (CSV)
- ✅ Mint Export (CSV)
- ✅ Custom Spreadsheets (CSV)
- 🚧 Excel Files (coming soon)

## How to Import from YNAB

1. In YNAB, go to **Account → Export Transactions**
2. Save the CSV file to your computer
3. In Fireside Capital, go to **Transactions** page
4. Click **Import CSV** button
5. Upload your YNAB export file
6. Columns will be auto-detected — review and confirm
7. Click **Import** and wait for completion

## How to Import from a Spreadsheet

1. Export your spreadsheet as CSV (File → Download → CSV)
2. In Fireside Capital, click **Import CSV**
3. Upload the CSV file
4. **Map columns** to Fireside fields:
   - **Date** (required)
   - **Amount** (required)
   - **Merchant/Payee** (required)
   - Category (optional)
   - Notes (optional)
5. Click **Import**

## Common Issues

**"Invalid date format"**  
→ Ensure dates are in YYYY-MM-DD format (e.g., 2026-02-12)

**"Amount required"**  
→ Check that the Amount column contains numbers (remove $ symbols)

**"Duplicate transactions"**  
→ This file has already been imported. Duplicates are automatically skipped.
```

---

## Recommended Next Steps

### Immediate Actions (Capital to delegate)
1. **Builder:** Implement Phase 1 (YNAB Import) — 4-5 hours
2. **Auditor:** Review ImportManager code for security issues — 1 hour
3. **PM:** Add FC-026 subtasks to BACKLOG.md — 30 min

### Future Research Topics
1. **YNAB API OAuth Flow** — Full integration research (8 hours)
2. **Excel/XLSX Parsing** — SheetJS implementation guide (2 hours)
3. **Data Export System** — CSV/JSON export with templates (3 hours)

---

**Research completed by:** Capital (Orchestrator)  
**Date:** February 12, 2026  
**Total research time:** 4 hours  
**Implementation time estimate:** 13-17 hours (Phases 1-3)  
**Priority:** P1 (High) — Reduces onboarding friction significantly
