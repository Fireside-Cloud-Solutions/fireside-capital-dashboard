# Import Error Handling Strategy

**Feature:** FC-026 - Data Import System (Error Handling)  
**Author:** Architect  
**Date:** 2025-01-26  
**Status:** Design Phase

---

## Overview

This document defines the error handling strategy for the Data Import System, including error types, user-facing messages, logging, and recovery procedures.

### Design Principles

1. **User-Friendly Messages** - Explain what went wrong and how to fix it
2. **Graceful Degradation** - Partial success is better than total failure
3. **Actionable Errors** - Every error should tell user what to do next
4. **Complete Logging** - Log enough to debug, but not sensitive data
5. **Recovery-Oriented** - Make it easy to retry/fix without starting over

---

## Error Classification

### Error Severity Levels

| Level | Description | User Action | Example |
|-------|-------------|-------------|---------|
| **Critical** | System failure, no data imported | Contact support | Database connection lost |
| **High** | Import failed completely | Fix data and retry | All rows invalid |
| **Medium** | Partial import failure | Review error log, optional retry | Some rows invalid |
| **Low** | Warning, import succeeded | No action needed | Potential duplicates detected |
| **Info** | Informational message | No action needed | Import completed successfully |

---

## Error Types & Handling

### 1. File Upload Errors

#### 1.1 File Too Large

**Cause:** File exceeds 10MB limit

**User Message:**
```
❌ File too large
Your file is 14.2 MB. The maximum file size is 10 MB.
Please split your data into smaller files or contact support for bulk imports.
```

**Technical Log:**
```json
{
  "error_type": "file_too_large",
  "file_size": 14200000,
  "max_size": 10485760,
  "filename": "transactions.csv"
}
```

**Recovery:** User must split file or reduce data range

---

#### 1.2 Invalid File Type

**Cause:** File is not CSV or XLSX

**User Message:**
```
❌ Invalid file type
Only CSV and XLSX files are supported. You uploaded a PDF file.
Please export your data as CSV or Excel format.
```

**Technical Log:**
```json
{
  "error_type": "invalid_file_type",
  "detected_type": "application/pdf",
  "expected_types": ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  "filename": "statement.pdf"
}
```

**Recovery:** User must convert file to supported format

---

#### 1.3 Corrupt or Malformed File

**Cause:** File cannot be parsed (invalid CSV/XLSX structure)

**User Message:**
```
❌ Unable to read file
The file appears to be corrupted or in an invalid format.
Please check the file and try again. If the problem persists, try exporting the data again.
```

**Technical Log:**
```json
{
  "error_type": "file_parse_error",
  "parse_error": "Unexpected end of data",
  "filename": "transactions.csv",
  "line_number": 234
}
```

**Recovery:** User must re-export or fix file

---

#### 1.4 Empty File

**Cause:** File has no data rows (only headers or completely empty)

**User Message:**
```
⚠️ Empty file
The file contains no data to import. Please check that you uploaded the correct file.
```

**Technical Log:**
```json
{
  "error_type": "empty_file",
  "row_count": 0,
  "has_headers": true,
  "filename": "transactions.csv"
}
```

**Recovery:** User must upload file with data

---

### 2. Column Mapping Errors

#### 2.1 Missing Required Fields

**Cause:** User did not map required columns (date, merchant_name, amount)

**User Message:**
```
❌ Required fields not mapped
Please map the following required fields:
• Transaction Date
• Merchant Name
• Amount

Without these fields, we cannot import your transactions.
```

**Technical Log:**
```json
{
  "error_type": "missing_required_fields",
  "missing_fields": ["date", "merchant_name"],
  "mapped_fields": ["amount", "category"]
}
```

**Recovery:** User must map required fields

---

#### 2.2 Duplicate Field Mapping

**Cause:** User mapped multiple columns to same field

**User Message:**
```
❌ Duplicate field mapping
You mapped multiple columns to "Amount":
• Column "Total" → Amount
• Column "Debit" → Amount

Each field can only be mapped once. Please review your mapping.
```

**Technical Log:**
```json
{
  "error_type": "duplicate_mapping",
  "field": "amount",
  "columns": ["Total", "Debit"]
}
```

**Recovery:** User must remove duplicate mapping

---

### 3. Data Validation Errors

#### 3.1 Invalid Date Format

**Cause:** Date cannot be parsed

**User Message (in preview/error log):**
```
Row 42: Invalid date
Value: "2025-13-40"
Expected format: YYYY-MM-DD or MM/DD/YYYY
```

**Technical Log:**
```json
{
  "error_type": "validation_error",
  "row": 42,
  "field": "date",
  "value": "2025-13-40",
  "error": "Invalid date",
  "suggestion": "Use format YYYY-MM-DD or MM/DD/YYYY"
}
```

**Recovery:** User can skip row or fix in source file

---

#### 3.2 Invalid Amount

**Cause:** Amount is not a valid number

**User Message:**
```
Row 67: Invalid amount
Value: "abc"
Expected: Numeric value (e.g., 12.34 or -45.67)
```

**Technical Log:**
```json
{
  "error_type": "validation_error",
  "row": 67,
  "field": "amount",
  "value": "abc",
  "error": "Invalid number format",
  "suggestion": "Expected numeric value (e.g., 12.34)"
}
```

**Recovery:** User can skip row or fix in source file

---

#### 3.3 Missing Required Value

**Cause:** Required field is empty

**User Message:**
```
Row 103: Missing merchant name
The merchant name field is required but was left blank.
```

**Technical Log:**
```json
{
  "error_type": "validation_error",
  "row": 103,
  "field": "merchant_name",
  "value": "",
  "error": "Required field is empty",
  "suggestion": "Provide a merchant name"
}
```

**Recovery:** User can skip row or fix in source file

---

#### 3.4 Value Too Long

**Cause:** Field exceeds maximum length

**User Message:**
```
Row 142: Merchant name too long
Value exceeds 255 character limit (current: 312 characters)
Please shorten the merchant name.
```

**Technical Log:**
```json
{
  "error_type": "validation_error",
  "row": 142,
  "field": "merchant_name",
  "value": "[truncated...]",
  "error": "Value exceeds maximum length",
  "max_length": 255,
  "actual_length": 312
}
```

**Recovery:** User can skip row or truncate value

---

### 4. Database Errors

#### 4.1 Connection Lost

**Cause:** Database connection interrupted during import

**User Message:**
```
❌ Import failed
Lost connection to database during import. No transactions were imported.
Please check your internet connection and try again.

If the problem persists, contact support with error code: DB_CONNECTION_LOST
```

**Technical Log:**
```json
{
  "error_type": "database_error",
  "error_code": "DB_CONNECTION_LOST",
  "import_job_id": "uuid",
  "rows_processed": 342,
  "total_rows": 520,
  "timestamp": "2025-01-26T10:42:00Z"
}
```

**Recovery:** Retry import (database transaction rolled back)

---

#### 4.2 Constraint Violation

**Cause:** Data violates database constraints (e.g., foreign key, unique constraint)

**User Message:**
```
Row 89: Database constraint violation
This transaction conflicts with existing data. This may indicate a duplicate entry.
```

**Technical Log:**
```json
{
  "error_type": "database_error",
  "error_code": "CONSTRAINT_VIOLATION",
  "row": 89,
  "constraint": "transactions_unique_key",
  "details": "duplicate key value violates unique constraint"
}
```

**Recovery:** User can skip row (likely duplicate)

---

### 5. YNAB Integration Errors

#### 5.1 OAuth Token Expired

**Cause:** YNAB access token expired and refresh failed

**User Message:**
```
❌ YNAB connection expired
Your YNAB authorization has expired. Please reconnect to continue importing.

[Reconnect to YNAB]
```

**Technical Log:**
```json
{
  "error_type": "oauth_error",
  "error_code": "TOKEN_EXPIRED",
  "service": "ynab",
  "user_id": "uuid",
  "expires_at": "2025-01-20T10:00:00Z"
}
```

**Recovery:** User must re-authorize YNAB

---

#### 5.2 YNAB Rate Limit

**Cause:** Hit YNAB's 200 requests/hour limit

**User Message:**
```
⏸️ YNAB rate limit reached
We've reached YNAB's hourly request limit. Your import will automatically resume in about 30 minutes.

We'll send you a notification when it's ready to continue.
```

**Technical Log:**
```json
{
  "error_type": "rate_limit_error",
  "service": "ynab",
  "retry_after": 1800,
  "requests_made": 200,
  "requests_limit": 200
}
```

**Recovery:** Automatic retry after rate limit resets

---

#### 5.3 YNAB Budget Not Found

**Cause:** Selected budget was deleted in YNAB

**User Message:**
```
❌ Budget not found
The selected YNAB budget "My Personal Budget" no longer exists.
It may have been deleted or you may have lost access.

Please select a different budget or check your YNAB account.
```

**Technical Log:**
```json
{
  "error_type": "not_found_error",
  "service": "ynab",
  "resource": "budget",
  "budget_id": "ynab-budget-id-1"
}
```

**Recovery:** User must select different budget

---

### 6. System Errors

#### 6.1 Out of Memory

**Cause:** File too large to process in memory

**User Message:**
```
❌ File too large to process
Your file is too large for online processing.
Please contact support for assistance with bulk imports.

Error code: OUT_OF_MEMORY
```

**Technical Log:**
```json
{
  "error_type": "system_error",
  "error_code": "OUT_OF_MEMORY",
  "file_size": 15000000,
  "memory_used": 512000000,
  "memory_limit": 536870912
}
```

**Recovery:** Contact support for server-side processing

---

#### 6.2 Timeout

**Cause:** Import took longer than maximum allowed time

**User Message:**
```
⏱️ Import timeout
Your import is taking longer than expected and has been paused.
This usually happens with very large files.

[Resume Import] [Contact Support]
```

**Technical Log:**
```json
{
  "error_type": "timeout_error",
  "import_job_id": "uuid",
  "rows_processed": 8234,
  "total_rows": 12000,
  "elapsed_time": 300000,
  "timeout_limit": 300000
}
```

**Recovery:** Resume import or use background processing

---

## Error Aggregation

### Grouping Similar Errors

When multiple rows have the same error type, group them:

**Instead of:**
```
Row 42: Invalid date format
Row 43: Invalid date format
Row 44: Invalid date format
Row 45: Invalid date format
...
```

**Show:**
```
Invalid date format (45 rows affected)
Rows: 42-86

Sample errors:
• Row 42: "2025-13-40"
• Row 67: "01/32/2025"
• Row 83: "99/99/9999"

[Download Full Error Log]
```

---

## Error Log Export

### CSV Format

**Structure:**
```csv
Row,Field,Value,Error,Suggestion
42,date,"2025-13-40",Invalid date format,Use format YYYY-MM-DD
67,amount,"abc",Invalid number format,Expected numeric value (e.g. 12.34)
103,merchant_name,,Required field missing,Provide merchant name
```

**Generation Function:**
```javascript
function generateErrorLogCSV(errors) {
  const header = 'Row,Field,Value,Error,Suggestion\n';
  
  const rows = errors.map(e => {
    return [
      e.row,
      e.field || 'N/A',
      `"${(e.value || '').toString().replace(/"/g, '""')}"`,
      `"${e.error}"`,
      `"${e.suggestion || 'See documentation'}"`
    ].join(',');
  });
  
  return header + rows.join('\n');
}
```

---

## User-Facing Error Messages

### Error Message Template

```
[Icon] [Title]
[Description]
[Details/Context]
[Action Button(s)]
```

### Example: Validation Errors

```
⚠️ Some rows have errors

520 of 523 rows are valid and ready to import.
3 rows have validation errors and will be skipped.

┌─────────────────────────────────────────────┐
│ Row  │ Error                                │
├──────┼──────────────────────────────────────┤
│ 42   │ Invalid date: "2025-13-40"           │
│ 67   │ Invalid amount: "abc"                │
│ 103  │ Missing merchant name                │
└─────────────────────────────────────────────┘

What would you like to do?
⚪ Skip these 3 rows and import the remaining 520
⚪ Fix errors in spreadsheet and re-upload

[Download Error Report] [Cancel] [Continue]
```

---

## Toast Notifications

### Success Messages

```javascript
const toasts = {
  upload_success: {
    type: 'success',
    message: 'File uploaded successfully',
    duration: 3000
  },
  mapping_saved: {
    type: 'success',
    message: 'Column mapping saved for future use',
    duration: 3000
  },
  import_complete: {
    type: 'success',
    message: (count) => `Successfully imported ${count} transactions`,
    duration: 5000,
    action: {
      label: 'View Transactions',
      url: '/transactions'
    }
  }
};
```

### Error Messages

```javascript
const errorToasts = {
  upload_failed: {
    type: 'error',
    message: 'Failed to upload file. Please try again.',
    duration: 5000
  },
  import_failed: {
    type: 'error',
    message: 'Import failed. Please check error log for details.',
    duration: 7000,
    action: {
      label: 'Download Error Log',
      callback: downloadErrorLog
    }
  },
  network_error: {
    type: 'error',
    message: 'Network error. Please check your connection.',
    duration: 5000,
    action: {
      label: 'Retry',
      callback: retryOperation
    }
  }
};
```

### Warning Messages

```javascript
const warningToasts = {
  duplicates_detected: {
    type: 'warning',
    message: (count) => `${count} potential duplicates detected and skipped`,
    duration: 5000
  },
  partial_import: {
    type: 'warning',
    message: (success, failed) => `Imported ${success} transactions. ${failed} rows failed.`,
    duration: 7000,
    action: {
      label: 'View Errors',
      callback: showErrorLog
    }
  }
};
```

---

## Error Recovery Strategies

### 1. Automatic Retry

**Applicable to:**
- Network errors
- Temporary database connection issues
- Rate limit errors (after cooldown)

**Implementation:**
```javascript
async function importWithRetry(jobId, maxRetries = 3) {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      return await executeImport(jobId);
    } catch (error) {
      attempt++;
      
      if (!isRetryableError(error) || attempt >= maxRetries) {
        throw error;
      }
      
      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
      console.log(`Import failed (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
}

function isRetryableError(error) {
  const retryableErrors = [
    'NETWORK_ERROR',
    'DB_CONNECTION_TIMEOUT',
    'RATE_LIMIT_ERROR'
  ];
  
  return retryableErrors.includes(error.code);
}
```

---

### 2. Partial Import Completion

**Strategy:** If 80%+ rows succeed, mark import as "complete with errors"

**Implementation:**
```javascript
async function finalizeImport(jobId, stats) {
  const successRate = stats.successful_rows / stats.total_rows;
  
  let status;
  if (successRate === 1) {
    status = 'complete';
  } else if (successRate >= 0.8) {
    status = 'complete'; // Success despite some errors
  } else if (successRate > 0) {
    status = 'partial'; // Partial success
  } else {
    status = 'failed'; // Total failure
  }
  
  await supabase
    .from('import_jobs')
    .update({
      status,
      successful_rows: stats.successful_rows,
      failed_rows: stats.failed_rows,
      error_log: stats.errors,
      completed_at: new Date()
    })
    .eq('id', jobId);
  
  return status;
}
```

---

### 3. Resume Import

**Strategy:** For timeout/interruption, allow resuming from last processed row

**Implementation:**
```javascript
async function resumeImport(jobId) {
  const job = await getImportJob(jobId);
  
  if (job.status !== 'processing') {
    throw new Error('Can only resume processing jobs');
  }
  
  const lastProcessedRow = job.successful_rows + job.failed_rows;
  const remainingRows = job.metadata.rows.slice(lastProcessedRow);
  
  console.log(`Resuming import from row ${lastProcessedRow + 1}`);
  
  // Continue processing remaining rows
  await processRows(jobId, remainingRows, lastProcessedRow);
}
```

---

## Logging Strategy

### What to Log

**Application Logs:**
```javascript
// Start of import
logger.info('Import started', {
  import_job_id: jobId,
  user_id: userId,
  source: 'csv',
  total_rows: 523,
  filename: 'transactions.csv'
});

// Progress updates (every 100 rows)
logger.debug('Import progress', {
  import_job_id: jobId,
  rows_processed: 300,
  total_rows: 523,
  success_rate: 0.98
});

// Validation errors
logger.warn('Validation error', {
  import_job_id: jobId,
  row: 42,
  field: 'date',
  value: '2025-13-40',
  error: 'Invalid date format'
});

// Import complete
logger.info('Import complete', {
  import_job_id: jobId,
  successful_rows: 520,
  failed_rows: 3,
  duration_ms: 42000
});

// Import failed
logger.error('Import failed', {
  import_job_id: jobId,
  error: error.message,
  stack: error.stack,
  rows_processed: 342
});
```

### Error Log Structure (Database)

**Table: `import_jobs.error_log` (JSONB column)**

```json
[
  {
    "row": 42,
    "field": "date",
    "value": "2025-13-40",
    "error": "Invalid date format",
    "suggestion": "Use format YYYY-MM-DD"
  },
  {
    "row": 67,
    "field": "amount",
    "value": "abc",
    "error": "Invalid number format",
    "suggestion": "Expected numeric value"
  }
]
```

---

## Error Monitoring & Alerting

### Metrics to Track

**Key Metrics:**
- Import success rate (%) by source (YNAB vs. CSV)
- Average validation error rate (%)
- Most common error types
- Average import duration
- Peak import volume (imports per hour)

**Alerts:**
- Import success rate < 80% (investigate)
- Database connection errors > 5/hour (critical)
- File upload failures > 20/hour (investigate)
- YNAB API errors > 10/hour (check API status)

### Monitoring Dashboard

**Sample Queries:**
```sql
-- Import success rate (last 24 hours)
SELECT 
  source,
  COUNT(*) as total_imports,
  SUM(CASE WHEN status = 'complete' THEN 1 ELSE 0 END) as successful,
  ROUND(SUM(CASE WHEN status = 'complete' THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as success_rate
FROM import_jobs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY source;

-- Most common validation errors
SELECT 
  error_log->>'error' as error_type,
  COUNT(*) as occurrences
FROM import_jobs,
  jsonb_array_elements(error_log) as error
WHERE status IN ('complete', 'failed')
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY error_type
ORDER BY occurrences DESC
LIMIT 10;
```

---

## Testing Checklist

### Error Scenario Tests

- [ ] **File Upload Errors**
  - [ ] Upload file > 10MB (expect "file too large" error)
  - [ ] Upload PDF file (expect "invalid file type" error)
  - [ ] Upload corrupt CSV (expect "parse error")
  - [ ] Upload empty CSV (expect "empty file" warning)

- [ ] **Column Mapping Errors**
  - [ ] Skip all required fields (expect "missing required fields" error)
  - [ ] Map two columns to same field (expect "duplicate mapping" error)

- [ ] **Validation Errors**
  - [ ] Import rows with invalid dates (expect validation errors)
  - [ ] Import rows with invalid amounts (expect validation errors)
  - [ ] Import rows with missing required values (expect validation errors)

- [ ] **Database Errors**
  - [ ] Simulate database connection loss mid-import (expect rollback)
  - [ ] Import duplicate transactions (expect constraint violation handling)

- [ ] **YNAB Errors**
  - [ ] Use expired YNAB token (expect "token expired" error)
  - [ ] Simulate YNAB rate limit (expect graceful retry)
  - [ ] Select deleted YNAB budget (expect "budget not found" error)

- [ ] **Recovery**
  - [ ] Retry failed import (expect success)
  - [ ] Resume interrupted import (expect continuation)
  - [ ] Download error log CSV (expect valid CSV)

---

## User Documentation

### FAQ Section

**Q: What happens to rows with errors?**
A: Rows with validation errors are skipped. Valid rows are imported. You can download an error log to fix and re-import the failed rows.

**Q: Can I undo an import?**
A: Not yet (Phase 2 feature). For now, you can manually delete imported transactions or contact support.

**Q: Why do I see duplicate warnings?**
A: We detected transactions with the same date, merchant, and amount. To prevent duplicates, we skip these rows. If they're not actually duplicates, you can adjust the data slightly (e.g., add notes).

**Q: My import is stuck at "Processing". What should I do?**
A: Refresh the page. If it's still stuck after 5 minutes, the import may have failed. Contact support with your import job ID.

---

## References

- [Error Handling Best Practices](https://www.nngroup.com/articles/error-message-guidelines/)
- [Material Design Error Messages](https://material.io/design/communication/confirmation-acknowledgement.html)
- [RESTful API Error Codes](https://restfulapi.net/http-status-codes/)

---

**Next Steps:**
- Implement centralized error handler middleware
- Create error message catalog
- Build error log export feature
- Set up monitoring dashboard
- Write user-facing error documentation
