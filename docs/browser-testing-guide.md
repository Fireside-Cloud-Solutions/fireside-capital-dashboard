# Browser Testing Guide — Fireside Capital

**CRITICAL:** All sub-agents MUST verify their work on the live site before reporting completion.

## Quick Start

### Credentials
Located in `.credentials` at workspace root:
- **URL:** https://nice-cliff-05b13880f.2.azurestaticapps.net
- **Email:** matt@firesidecloudsolutions.com
- **Password:** vRpBE5387U5G%0

### Testing Process

1. **Open the browser** (use the `browser` tool with `profile: clawd`)
   ```
   browser action=open profile=clawd targetUrl=https://nice-cliff-05b13880f.2.azurestaticapps.net
   ```

2. **Login**
   ```
   browser action=act profile=clawd targetId=[ID] request={"kind":"click","ref":"[login-button-ref]"}
   ```
   Then fill credentials and submit.

3. **Take full-page screenshots** of every page you changed
   ```
   browser action=screenshot profile=clawd targetId=[ID] fullPage=true
   ```

4. **Inspect computed styles** if you made CSS changes
   ```
   browser action=act profile=clawd targetId=[ID] request={"kind":"evaluate","fn":"() => { const el = document.querySelector('[selector]'); return window.getComputedStyle(el); }"}
   ```

5. **Check for layout issues**
   - Look for infinite scroll/height
   - Verify charts render at correct size
   - Check responsive breakpoints
   - Test dark/light mode if applicable

## What to Check Based on Your Changes

### Frontend (Builder)
- [ ] All affected pages load without errors
- [ ] UI elements render correctly
- [ ] Responsive behavior works
- [ ] No console errors
- [ ] Charts/graphs display properly
- [ ] Forms submit successfully
- [ ] Navigation works

### CSS Changes (Builder/Architect)
- [ ] Inspect computed styles match your intent
- [ ] No conflicting rules override your changes
- [ ] Responsive breakpoints work
- [ ] No infinite height/width issues
- [ ] Colors match design system

### API/Backend (Connector/Builder)
- [ ] API calls succeed (check Network tab)
- [ ] Data displays correctly
- [ ] Error handling works
- [ ] Loading states appear

### Database Changes (Architect)
- [ ] Data saves correctly
- [ ] Queries return expected results
- [ ] Relations work
- [ ] No orphaned records

## Common Issues to Watch For

1. **Infinite chart heights** (like we just had)
   - Always check Chart.js canvas heights
   - Verify parent containers have max-height

2. **CSS cascading conflicts**
   - Check which stylesheet loads last
   - Use DevTools to see which rules win

3. **Caching issues**
   - Azure Static Web Apps cache aggressively
   - Wait 2-3 minutes after push
   - Hard refresh (Ctrl+Shift+R)

4. **Build failures**
   - Check GitHub Actions status
   - Wait for deployment to complete

## Browser Tool Reference

### Basic Actions
- `open` - Navigate to URL
- `snapshot` - Get page structure (accessibility tree)
- `screenshot` - Visual capture
- `act` - Interact (click, type, etc.)
- `tabs` - List open tabs

### Advanced
- `evaluate` - Run JavaScript in page context
- `console` - Read console messages
- `pdf` - Save page as PDF

## When to Skip Testing

**NEVER.** Even for "small fixes," verify it works. The 5 minutes of testing saves hours of debugging later.

## Reporting Your Test Results

When you complete work, include:
```
## Testing Completed
✓ Logged into live site
✓ Verified [page names]
✓ Screenshots: [list any issues found]
✓ No console errors
✓ Responsive: tested mobile/tablet/desktop
```
