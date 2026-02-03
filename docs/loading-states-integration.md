# Loading States Integration Guide
**Fireside Capital**

Version: 1.0  
Date: 2026-02-03  
Files: `app/assets/js/loading-states.js`, `app/assets/css/loading-states.css`

---

## Overview

Consistent loading indicators improve perceived performance and user feedback. This guide shows how to integrate loading states throughout the Fireside Capital app.

---

## Quick Start

### 1. Add CSS & JS to HTML Pages

Add to `<head>` section of all pages:

```html
<link rel="stylesheet" href="assets/css/loading-states.css" />
```

Add before closing `</body>` tag (before `app.js`):

```html
<script src="assets/js/loading-states.js"></script>
```

### 2. Use Loading States in Your Code

```javascript
// Page-level loading
LoadingStates.showPageLoading('Fetching data...');
await fetchData();
LoadingStates.hidePageLoading();

// Button loading
LoadingStates.setButtonLoading('submitBtn', true, 'Saving...');
await saveData();
LoadingStates.setButtonLoading('submitBtn', false);

// Table loading
LoadingStates.showTableSpinner('billsTableBody', 'Loading bills...', 5);
const bills = await fetchBills();
renderBills(bills);
LoadingStates.hideTableLoading('billsTableBody');
```

---

## API Reference

### Page Loading

#### `showPageLoading(message)`
Shows full-page overlay with spinner.

```javascript
LoadingStates.showPageLoading('Loading your financial data...');
```

**Parameters:**
- `message` (string, optional) — Text to display below spinner. Default: `'Loading...'`

#### `hidePageLoading()`
Hides the page loading overlay.

```javascript
LoadingStates.hidePageLoading();
```

**Use case:** Initial page load, auth state changes, full data refresh.

---

### Card Loading

#### `showCardLoading(elementId, message)`
Shows spinner inside a card, hiding original content.

```javascript
LoadingStates.showCardLoading('stats-card-net-worth', 'Calculating...');
```

**Parameters:**
- `elementId` (string, required) — ID of card element
- `message` (string, optional) — Text to display below spinner

#### `hideCardLoading(elementId)`
Restores original card content.

```javascript
LoadingStates.hideCardLoading('stats-card-net-worth');
```

**Use case:** Dashboard stat cards, chart containers, summary sections.

---

### Button Loading

#### `setButtonLoading(buttonId, loading, loadingText)`
Shows spinner in button and disables it.

```javascript
// Show loading
LoadingStates.setButtonLoading('submitBtn', true, 'Saving...');

// Hide loading (restores original text)
LoadingStates.setButtonLoading('submitBtn', false);
```

**Parameters:**
- `buttonId` (string, required) — ID of button element
- `loading` (boolean, required) — `true` to show loading, `false` to hide
- `loadingText` (string, optional) — Text to display while loading. Default: `'Please wait...'`

**Use case:** Form submissions, delete confirmations, API calls.

---

### Table Loading

#### `showTableLoading(tableId, rows, columns)`
Shows skeleton loader rows in table.

```javascript
LoadingStates.showTableLoading('billsTableBody', 3, 5);
```

**Parameters:**
- `tableId` (string, required) — ID of `<tbody>` element
- `rows` (number, optional) — Number of skeleton rows. Default: `3`
- `columns` (number, optional) — Number of columns. Default: `5`

#### `showTableSpinner(tableId, message, colspan)`
Shows centered spinner in table (alternative to skeleton).

```javascript
LoadingStates.showTableSpinner('billsTableBody', 'Loading bills...', 5);
```

**Parameters:**
- `tableId` (string, required) — ID of `<tbody>` element
- `message` (string, optional) — Text to display. Default: `'Loading data...'`
- `colspan` (number, optional) — Number of columns to span. Default: `5`

#### `hideTableLoading(tableId)`
Restores original table content.

```javascript
LoadingStates.hideTableLoading('billsTableBody');
```

**Use case:** Bills table, assets table, investments table, any data grid.

---

### Empty States

#### `showEmptyState(elementId, config)`
Shows empty state with icon, title, message, and optional CTA button.

```javascript
LoadingStates.showEmptyState('billsTableBody', {
  icon: 'bi-receipt',
  title: 'No Bills Yet',
  message: 'Add your first bill to start tracking payments.',
  ctaText: 'Add Bill',
  ctaAction: 'openBillModal()'
});
```

**Parameters:**
- `elementId` (string, required) — ID of container element
- `config` (object, optional) — Configuration:
  - `icon` (string) — Bootstrap icon class (e.g., `'bi-inbox'`)
  - `title` (string) — Heading text
  - `message` (string) — Description text
  - `ctaText` (string) — Button text (optional)
  - `ctaAction` (string) — Button onclick handler (optional)

**Use case:** Empty tables, no data scenarios, first-time user experience.

---

### Inline Loading

#### `showInlineLoading(elementId, size)`
Shows spinner inline (replaces element content).

```javascript
LoadingStates.showInlineLoading('net-worth-value', 'sm');
```

**Parameters:**
- `elementId` (string, required) — ID of element
- `size` (string, optional) — `'sm'` | `'md'` | `'lg'`. Default: `'sm'`

#### `hideInlineLoading(elementId)`
Restores original element content.

```javascript
LoadingStates.hideInlineLoading('net-worth-value');
```

**Use case:** Stat values updating, inline calculations, small sections.

---

## Integration Examples

### Example 1: Bills Page Data Fetch

```javascript
async function loadBills() {
  // Show table skeleton
  LoadingStates.showTableLoading('billsTableBody', 5, 5);
  
  try {
    const { data, error } = await sb.from('bills').select('*');
    
    if (error) throw error;
    
    if (data.length === 0) {
      // Show empty state
      LoadingStates.showEmptyState('billsTableBody', {
        icon: 'bi-receipt',
        title: 'No Bills Yet',
        message: 'Add your first bill to start tracking payments.',
        ctaText: 'Add Bill',
        ctaAction: 'openBillModal()'
      });
    } else {
      // Render bills
      renderBills(data);
      LoadingStates.hideTableLoading('billsTableBody');
    }
  } catch (err) {
    console.error('Failed to load bills:', err);
    LoadingStates.hideTableLoading('billsTableBody');
    alert('Failed to load bills. Please try again.');
  }
}
```

### Example 2: Save Button with Loading

```javascript
async function saveBill() {
  const btn = 'saveBillBtn';
  LoadingStates.setButtonLoading(btn, true, 'Saving...');
  
  try {
    const { error } = await sb.from('bills').insert({
      name: 'Electric Bill',
      amount: 120,
      frequency: 'monthly'
    });
    
    if (error) throw error;
    
    alert('Bill saved successfully!');
    bootstrap.Modal.getInstance(document.getElementById('billModal')).hide();
    await loadBills(); // Reload table
  } catch (err) {
    console.error('Failed to save bill:', err);
    alert('Failed to save bill. Please try again.');
  } finally {
    LoadingStates.setButtonLoading(btn, false);
  }
}
```

### Example 3: Dashboard Cards

```javascript
async function loadNetWorthCard() {
  LoadingStates.showCardLoading('stats-card-net-worth');
  
  try {
    const netWorth = await calculateNetWorth();
    document.getElementById('net-worth-value').textContent = formatCurrency(netWorth);
    LoadingStates.hideCardLoading('stats-card-net-worth');
  } catch (err) {
    console.error('Failed to load net worth:', err);
    LoadingStates.hideCardLoading('stats-card-net-worth');
  }
}
```

### Example 4: Page-Level Initial Load

```javascript
async function init() {
  LoadingStates.showPageLoading('Loading Fireside Capital...');
  
  try {
    await checkAuth();
    await loadAllData();
    LoadingStates.hidePageLoading();
  } catch (err) {
    console.error('Initialization failed:', err);
    LoadingStates.hidePageLoading();
    alert('Failed to initialize app. Please refresh the page.');
  }
}
```

---

## Customization

### Change Spinner Color

Edit `loading-states.css`:

```css
.spinner-border {
  color: #f44e24; /* Fireside orange */
}
```

### Adjust Skeleton Animation Speed

Edit `loading-states.css`:

```css
@keyframes skeleton-pulse {
  0%, 100% { background-position: 200% 0; }
}
/* Change animation duration */
.skeleton-loader {
  animation: skeleton-pulse 2s ease-in-out infinite; /* Slower */
}
```

### Custom Empty State HTML

Instead of `showEmptyState()`, manually insert HTML:

```html
<div class="empty-state">
  <img src="assets/img/empty-state-bills.svg" alt="No bills" />
  <h3>No Bills Yet</h3>
  <p>Your bills will appear here once you add them.</p>
  <button class="btn btn-primary" onclick="openBillModal()">Add Bill</button>
</div>
```

---

## Accessibility Notes

1. **Spinners include `visually-hidden` text** — Screen readers announce "Loading..."
2. **`prefers-reduced-motion` support** — Animations disabled for users who prefer reduced motion
3. **Focus management** — Buttons are disabled during loading to prevent double-submission
4. **Color contrast** — Loading text meets WCAG AA standards

---

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

---

## Related Documentation

- [UX Polish Guide](./UX_POLISH.md)
- [Accessibility Guide](./ACCESSIBILITY.md)
- [Bootstrap Spinners](https://getbootstrap.com/docs/5.3/components/spinners/)

---

**Last Updated:** 2026-02-03  
**Owner:** Capital (Orchestrator)
