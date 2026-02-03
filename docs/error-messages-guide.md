# Error Messages Guide
**Fireside Capital**

Version: 1.0  
Date: 2026-02-03  
File: `app/assets/js/error-messages.js`

---

## Overview

Convert technical error messages into user-friendly, actionable text. Improves UX by providing helpful guidance instead of cryptic error codes.

---

## Setup

Add before closing `</body>` tag (after `toast-notifications.js`, before `app.js`):

```html
<script src="assets/js/error-messages.js"></script>
```

---

## Basic Usage

### Before (raw error)
```javascript
try {
  const { error } = await sb.auth.signIn({ email, password });
  if (error) {
    alert(error.message); // "invalid login credentials"
  }
} catch (err) {
  alert(err.message);
}
```

### After (friendly error)
```javascript
try {
  const { error } = await sb.auth.signIn({ email, password });
  if (error) {
    ErrorMessages.handleAuthError(error); // Shows: "Incorrect email or password. Please check your credentials and try again."
  }
} catch (err) {
  ErrorMessages.handle(err, 'log in');
}
```

---

## API Reference

### Main Methods

#### `getFriendlyError(error)`
Converts error to user-friendly text (without showing toast).

```javascript
const friendlyError = ErrorMessages.getFriendlyError(error);
console.log(friendlyError);
Toast.error(friendlyError);
```

#### `handle(error, context)`
Handles error + shows toast automatically.

```javascript
try {
  await saveBill(billData);
} catch (error) {
  ErrorMessages.handle(error, 'save bill'); // Shows: "Failed to save bill. [friendly error]"
}
```

**Parameters:**
- `error` (Error|string|object) — Error to handle
- `context` (string, optional) — Operation being performed (e.g., `'save bill'`, `'load data'`)

---

### Category-Specific Handlers

#### `handleAuthError(error, showToast)`
Handles authentication errors.

```javascript
try {
  const { error } = await sb.auth.signIn({ email, password });
  if (error) {
    ErrorMessages.handleAuthError(error); // Auto-shows toast
  }
} catch (err) {
  ErrorMessages.handleAuthError(err, false); // No toast
}
```

**Common auth errors handled:**
- Invalid login credentials
- Email not confirmed
- User already registered
- Password too short
- Invalid email format
- Session expired

#### `handleDatabaseError(error, showToast)`
Handles database errors (Supabase).

```javascript
try {
  const { error } = await sb.from('bills').insert(billData);
  if (error) {
    ErrorMessages.handleDatabaseError(error);
  }
} catch (err) {
  ErrorMessages.handleDatabaseError(err);
}
```

**Common database errors handled:**
- Unique constraint violations
- Foreign key constraints
- Not null violations
- Check constraint failures
- Permission denied
- Row-level security violations

#### `handleNetworkError(error, showToast)`
Handles network/connectivity errors.

```javascript
try {
  const response = await fetch('/api/data');
  if (!response.ok) throw new Error('Network error');
} catch (error) {
  ErrorMessages.handleNetworkError(error);
}
```

**Common network errors handled:**
- Failed to fetch
- NetworkError
- Timeout
- CORS issues

#### `handleValidationError(error, showToast)`
Handles form validation errors (shows warning toast instead of error).

```javascript
try {
  if (amount <= 0) throw new Error('Amount must be positive');
  await saveBill(billData);
} catch (error) {
  ErrorMessages.handleValidationError(error); // Shows warning toast
}
```

**Common validation errors handled:**
- Negative amounts
- Invalid frequency
- Invalid dates
- Future dates
- Required fields

---

### Validation Helpers

#### `requireField(value, fieldName)`
Validates required field.

```javascript
try {
  ErrorMessages.requireField(billName, 'Bill name');
  ErrorMessages.requireField(billAmount, 'Bill amount');
  // Proceed with save...
} catch (error) {
  ErrorMessages.handleValidationError(error);
}
```

#### `requirePositive(value, fieldName)`
Validates positive number.

```javascript
try {
  ErrorMessages.requirePositive(billAmount, 'Bill amount');
  // Proceed with save...
} catch (error) {
  ErrorMessages.handleValidationError(error);
}
```

#### `requireEmail(email)`
Validates email format.

```javascript
try {
  ErrorMessages.requireEmail(userEmail);
  // Proceed with signup...
} catch (error) {
  ErrorMessages.handleValidationError(error);
}
```

---

## Migration Examples

### Example 1: Login Form

**Before:**
```javascript
async function login() {
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    alert(error.message); // "invalid login credentials"
  }
}
```

**After:**
```javascript
async function login() {
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    ErrorMessages.handleAuthError(error); // "Incorrect email or password. Please check your credentials and try again."
  }
}
```

### Example 2: Save Form

**Before:**
```javascript
async function saveBill() {
  try {
    const { error } = await sb.from('bills').insert(billData);
    if (error) throw error;
    alert('Bill saved!');
  } catch (err) {
    alert('Error: ' + err.message); // Technical message
  }
}
```

**After:**
```javascript
async function saveBill() {
  try {
    const { error } = await sb.from('bills').insert(billData);
    if (error) throw error;
    Toast.success('Bill saved successfully!');
  } catch (err) {
    ErrorMessages.handle(err, 'save bill'); // User-friendly + auto-toast
  }
}
```

### Example 3: Form Validation

**Before:**
```javascript
function validateBill() {
  if (!billName) {
    alert('Name is required');
    return false;
  }
  if (billAmount <= 0) {
    alert('Amount must be positive');
    return false;
  }
  return true;
}
```

**After:**
```javascript
function validateBill() {
  try {
    ErrorMessages.requireField(billName, 'Bill name');
    ErrorMessages.requirePositive(billAmount, 'Bill amount');
    return true;
  } catch (error) {
    ErrorMessages.handleValidationError(error);
    return false;
  }
}
```

### Example 4: Network Request

**Before:**
```javascript
async function loadData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (err) {
    alert('Failed to load data'); // No guidance
  }
}
```

**After:**
```javascript
async function loadData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (err) {
    ErrorMessages.handleNetworkError(err); // "Network error. Check your internet connection and try again."
  }
}
```

---

## Custom Error Messages

### Register Custom Error Pattern

```javascript
ErrorMessages.registerCustomError(
  'bill name already exists', // Pattern to match
  {
    message: 'A bill with this name already exists.',
    action: 'Please use a different name or edit the existing bill.'
  },
  'validation' // Category: 'auth'|'database'|'network'|'validation'
);
```

---

## Error Message Patterns

### Authentication Errors
| Technical | Friendly |
|-----------|----------|
| "invalid login credentials" | "Incorrect email or password. Please check your credentials and try again." |
| "email not confirmed" | "Please confirm your email before logging in. Check your inbox (and spam folder) for the confirmation link." |
| "user already registered" | "An account with this email already exists. Try logging in instead, or use the 'Forgot Password' link." |
| "jwt expired" | "Your session has expired. Please log in again." |

### Database Errors
| Technical | Friendly |
|-----------|----------|
| "unique constraint" | "This item already exists. Please use a different name or check your existing records." |
| "foreign key constraint" | "Cannot delete this item because it is being used elsewhere. Remove dependencies first, then try again." |
| "not null violation" | "Required field is missing. Please fill in all required fields and try again." |
| "permission denied" | "You do not have permission to perform this action. Contact support if you believe this is an error." |

### Network Errors
| Technical | Friendly |
|-----------|----------|
| "Failed to fetch" | "Network error. Check your internet connection and try again." |
| "timeout" | "Request timed out. The server is taking too long to respond. Please try again." |

### Validation Errors
| Technical | Friendly |
|-----------|----------|
| "amount must be positive" | "Amount cannot be negative. Please enter a positive number." |
| "invalid frequency" | "Invalid frequency selected. Please select a valid frequency (monthly, weekly, etc.)." |
| "future date" | "Date cannot be in the future. Please enter today or a past date." |

---

## Best Practices

### 1. Always Log Original Error
```javascript
try {
  // ...
} catch (error) {
  ErrorMessages.handle(error, 'save bill'); // Shows user-friendly message
  console.error('[Save Bill]', error); // Log technical details
}
```

### 2. Provide Context
```javascript
// Good: Specific context
ErrorMessages.handle(error, 'save bill');

// Bad: No context
ErrorMessages.handle(error);
```

### 3. Use Category-Specific Handlers
```javascript
// Auth errors
ErrorMessages.handleAuthError(error);

// Database errors
ErrorMessages.handleDatabaseError(error);

// Network errors
ErrorMessages.handleNetworkError(error);

// Validation errors
ErrorMessages.handleValidationError(error);
```

### 4. Validate Early
```javascript
// Validate inputs before making API calls
try {
  ErrorMessages.requireField(billName, 'Bill name');
  ErrorMessages.requirePositive(billAmount, 'Bill amount');
  
  // Only make API call if validation passes
  const { error } = await sb.from('bills').insert(billData);
  if (error) throw error;
} catch (error) {
  ErrorMessages.handle(error, 'save bill');
}
```

---

## Accessibility

- **Toast integration** — Works seamlessly with Toast notification system (ARIA live regions)
- **Console logging** — Technical errors logged for developers while showing user-friendly messages
- **Action guidance** — Error messages include next steps ("Check your internet connection", "Try logging in instead")

---

## Browser Support

- ✅ All modern browsers (pure JavaScript, no dependencies)

---

## Related Documentation

- [Toast Notifications](./toast-notifications-migration.md)
- [Form Validation](./FORMS.md)
- [Error Handling Best Practices](./ERROR_HANDLING.md)

---

**Last Updated:** 2026-02-03  
**Owner:** Capital (Orchestrator)
