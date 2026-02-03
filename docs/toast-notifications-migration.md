# Toast Notifications Migration Guide
**Fireside Capital**

Version: 1.0  
Date: 2026-02-03  
Files: `app/assets/js/toast-notifications.js`, `app/assets/css/toast-notifications.css`

---

## Overview

Replace browser `alert()` calls with styled, non-blocking toast notifications. Better UX, more professional, and supports success/error/warning/info types.

---

## Setup

### 1. Add to HTML Pages

Add to `<head>`:
```html
<link rel="stylesheet" href="assets/css/toast-notifications.css" />
```

Add before closing `</body>` (before `app.js`):
```html
<script src="assets/js/toast-notifications.js"></script>
```

---

## Migration Examples

### Before (alert)
```javascript
alert('Bill saved successfully!');
```

### After (toast)
```javascript
Toast.success('Bill saved successfully!');
```

---

### Before (alert for error)
```javascript
if (error) {
  alert('Failed to save bill. Please try again.');
}
```

### After (toast error)
```javascript
if (error) {
  Toast.error('Failed to save bill. Please try again.');
}
```

---

### Before (confirm dialog)
```javascript
if (confirm('Are you sure you want to delete this bill?')) {
  deleteBill(id);
}
```

### After (toast confirmation with action)
```javascript
Toast.confirm(
  'Are you sure you want to delete this bill?',
  () => deleteBill(id)
);
```

---

## API Reference

### Basic Methods

#### `Toast.success(message, options)`
Shows green success toast.

```javascript
Toast.success('Bill saved successfully!');
Toast.success('Budget updated!', { duration: 3000 });
```

#### `Toast.error(message, options)`
Shows red error toast (6 seconds default).

```javascript
Toast.error('Failed to load data. Please try again.');
Toast.error('Network error', { duration: 8000 });
```

#### `Toast.warning(message, options)`
Shows orange warning toast (5 seconds default).

```javascript
Toast.warning('This action cannot be undone.');
Toast.warning('Low account balance', { dismissible: false });
```

#### `Toast.info(message, options)`
Shows blue info toast (4 seconds default).

```javascript
Toast.info('Loading data...');
Toast.info('New feature available!', { duration: 6000 });
```

### Advanced Usage

#### `Toast.show(options)`
Full control over toast options.

```javascript
Toast.show({
  type: 'success',
  title: 'Payment Sent',
  message: 'Your payment has been processed.',
  duration: 5000,
  icon: 'bi bi-check-circle-fill',
  dismissible: true
});
```

**Options:**
- `type` — `'success'` | `'error'` | `'warning'` | `'info'` (default: `'info'`)
- `message` — Toast message text (required)
- `title` — Optional title above message
- `duration` — Time in ms before auto-dismiss (0 = never, default: 4000)
- `icon` — Bootstrap icon class (default: type-based icon)
- `dismissible` — Show close button (default: true)
- `action` — Action button config: `{ text: 'Undo', callback: fn }`

#### `Toast.confirm(message, callback, options)`
Shows a confirmation toast with action button.

```javascript
Toast.confirm(
  'Delete this bill?',
  () => {
    deleteBill(billId);
    Toast.success('Bill deleted');
  },
  { duration: 0 } // Don't auto-dismiss confirmations
);
```

#### `Toast.remove(toastId)`
Manually dismiss a toast.

```javascript
const toastId = Toast.info('Loading...');
// Later...
Toast.remove(toastId);
```

#### `Toast.clear()`
Remove all active toasts.

```javascript
Toast.clear();
```

#### `Toast.configure(options)`
Update global configuration.

```javascript
Toast.configure({
  position: 'bottom-right', // top-right | bottom-left | etc.
  duration: 5000, // Default duration
  maxToasts: 3 // Max toasts visible at once
});
```

---

## Position Options

```javascript
Toast.configure({ position: 'top-right' }); // Default
Toast.configure({ position: 'top-left' });
Toast.configure({ position: 'bottom-right' });
Toast.configure({ position: 'bottom-left' });
Toast.configure({ position: 'top-center' });
Toast.configure({ position: 'bottom-center' });
```

---

## Migration Checklist

### Step 1: Find All alert() Calls

```bash
cd C:\Users\chuba\fireside-capital\app
Select-String -Path "assets\js\app.js" -Pattern "alert\("
```

### Step 2: Replace One by One

| Old | New |
|-----|-----|
| `alert('Success')` | `Toast.success('Success')` |
| `alert('Error')` | `Toast.error('Error')` |
| `alert('Warning')` | `Toast.warning('Warning')` |
| `alert('Info')` | `Toast.info('Info')` |

### Step 3: Test Each Page

- ✅ Login/signup flows
- ✅ Form submissions (bills, assets, etc.)
- ✅ Delete confirmations
- ✅ Network errors
- ✅ Success messages

---

## Common Patterns

### Form Submission Success
```javascript
async function saveBill() {
  try {
    const { error } = await sb.from('bills').insert(billData);
    if (error) throw error;
    
    Toast.success('Bill saved successfully!');
    bootstrap.Modal.getInstance(document.getElementById('billModal')).hide();
    await loadBills();
  } catch (err) {
    Toast.error('Failed to save bill. Please try again.');
    console.error(err);
  }
}
```

### Network Error Handling
```javascript
try {
  const response = await fetch('/api/data');
  if (!response.ok) throw new Error('Network error');
  
  const data = await response.json();
  Toast.success('Data loaded successfully');
} catch (err) {
  Toast.error('Failed to load data. Check your connection.');
}
```

### Async Operation with Loading
```javascript
const toastId = Toast.info('Deleting bill...', { duration: 0 });

try {
  await deleteBill(billId);
  Toast.remove(toastId);
  Toast.success('Bill deleted successfully!');
} catch (err) {
  Toast.remove(toastId);
  Toast.error('Failed to delete bill.');
}
```

### Undo Action
```javascript
Toast.show({
  type: 'success',
  message: 'Bill deleted',
  duration: 5000,
  action: {
    text: 'Undo',
    callback: () => {
      restoreBill(billId);
      Toast.info('Bill restored');
    }
  }
});
```

---

## Styling Customization

### Change Toast Colors

Edit `toast-notifications.css`:

```css
.toast-success {
  border-left-color: #81b900; /* Fireside green */
}

.toast-error {
  border-left-color: #f44e24; /* Fireside orange for errors */
}
```

### Change Animation Speed

Edit `toast-notifications.css`:

```css
.toast {
  transition: all 500ms cubic-bezier(0.4, 0, 0.2, 1); /* Slower */
}
```

### Change Toast Width

Edit `toast-notifications.css`:

```css
.toast-container {
  max-width: 500px; /* Wider toasts */
}
```

---

## Accessibility

1. **ARIA roles** — Toasts have `role="alert"` and `aria-live="polite"` (or `assertive` for errors)
2. **Keyboard navigation** — Close button is keyboard accessible
3. **`prefers-reduced-motion`** — Animations simplified for users who need it
4. **Screen reader announcements** — Toast messages are announced automatically

---

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

---

## Testing

### Manual Test

1. Open browser console
2. Run: `Toast.success('Test success toast')`
3. Run: `Toast.error('Test error toast')`
4. Run: `Toast.warning('Test warning toast')`
5. Run: `Toast.info('Test info toast')`

### Automated Test

```javascript
// Test all toast types
Toast.success('Success test');
Toast.error('Error test');
Toast.warning('Warning test');
Toast.info('Info test');

// Test confirmation
Toast.confirm('Confirm test?', () => alert('Confirmed!'));

// Test custom options
Toast.show({
  type: 'success',
  title: 'Custom Title',
  message: 'Custom message with title',
  duration: 8000
});
```

---

## Performance

- **Minimal overhead** — Toasts are created on-demand, not pre-rendered
- **Automatic cleanup** — Dismissed toasts are removed from DOM
- **Max limit** — Only 5 toasts shown at once (configurable)
- **No dependencies** — Pure JavaScript, no external libraries

---

## Related Documentation

- [Loading States](./loading-states-integration.md)
- [UX Polish Guide](./UX_POLISH.md)
- [Accessibility Guide](./ACCESSIBILITY.md)

---

**Last Updated:** 2026-02-03  
**Owner:** Capital (Orchestrator)
