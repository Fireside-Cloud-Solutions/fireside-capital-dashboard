# Fireside Capital - Onboarding Flow Documentation

## Overview

The onboarding flow is a multi-step wizard that welcomes new users and guides them through initial setup. It appears automatically for brand-new users who have no data in the system.

## Flow Structure

### Step 1: Welcome Screen
- **Purpose:** Greet the user and explain the app
- **Content:**
  - Fireside Capital logo
  - Welcome message
  - Brief app description
  - Two CTAs: "Get Started" (primary) or "Skip for now" (secondary)
- **Behavior:**
  - Non-dismissible modal (must click button to proceed)
  - Shows ONLY to users with no data and `onboarding_completed = false`

### Step 2: Profile Setup
- **Purpose:** Collect basic user information
- **Fields:**
  - First Name (optional)
  - Last Name (optional)
  - Emergency Fund Goal (optional, default: $10,000)
- **Progress:** "Step 1 of 4"
- **Actions:**
  - "Continue" → saves settings and advances to Quick Start
  - "Skip this step" → jumps to Quick Start without saving

### Step 3: Quick Start Options
- **Purpose:** Help user add their first data item
- **Options (4 clickable cards):**
  1. Connect Bank Account (Plaid integration)
  2. Add an Asset (Real estate, vehicle, etc.)
  3. Track a Bill (Recurring expense)
  4. Add Income (Salary or other source)
- **Progress:** "Step 2 of 4"
- **Behavior:**
  - Clicking any card opens the relevant modal
  - After adding 1 item, automatically advances to Feature Tour
  - "I'll do this later" skips to Feature Tour

### Step 4: Feature Tour
- **Purpose:** Offer an interactive guided tour
- **Content:**
  - Heading: "Want a quick tour?"
  - Description of 2-minute interactive guide
  - Illustration/icon
- **Progress:** "Step 3 of 4"
- **Actions:**
  - "Start Tour" → launches tooltip-based tour
  - "Skip Tour" → proceeds to success screen

### Step 5: Success
- **Purpose:** Celebrate completion and dismiss
- **Content:**
  - Success icon (check mark)
  - "You're all set!" heading
  - Confirmation message
  - "Go to Dashboard" button
- **Behavior:**
  - Sets `onboarding_completed = true` in settings table
  - Closes modal and shows dashboard

## Feature Tour (Interactive Tooltips)

If user clicks "Start Tour" in Step 4, they get a 5-stop guided tour:

### Tour Stops:
1. **Sidebar Navigation** (right of sidebar)
   - Text: "Navigate between different sections of your finances here."
   - Button: "Next"

2. **Add Item Buttons** (below button)
   - Text: "Quickly add assets, bills, debts, and more from any page."
   - Buttons: "Next" / "Skip Tour"

3. **Net Worth Card** (above card)
   - Text: "Your net worth is calculated automatically from your assets, debts, and investments."
   - Buttons: "Next" / "Skip Tour"

4. **Charts Section** (above chart)
   - Text: "Track your financial progress over time with interactive charts."
   - Buttons: "Next" / "Skip Tour"

5. **User Menu** (below dropdown)
   - Text: "Access settings and log out from here."
   - Button: "Finish Tour"

### Tour Implementation:
- Dark overlay with spotlight on highlighted element
- Positioned tooltips with arrows
- Smooth transitions and scrolling
- Saves `tour_completed = true` flag

## Technical Details

### Files Created:
- `app/assets/js/onboarding.js` - Main onboarding logic
- `app/assets/css/onboarding.css` - Onboarding styles
- `app/assets/js/tour.js` - Feature tour implementation

### Files Modified:
- `app/index.html` - Added modal HTML and script includes
- `app/assets/js/app.js` - Added `checkOnboardingStatus()` function

### Database Changes:
- Added `onboarding_completed` column to `settings` table
- Added `tour_completed` column to `settings` table
- Created indexes for faster queries

### Trigger Logic:
```javascript
// In app.js, after fetchAllDataFromSupabase()
async function checkOnboardingStatus() {
  // Only show on dashboard
  const currentPage = window.location.pathname.split('/').pop();
  if (currentPage !== 'index.html' && currentPage !== '') return;
  
  // Check if user has any data
  const hasData = hasAssets || hasBills || hasIncome || hasInvestments || hasDebts;
  
  // Check onboarding flag
  const onboardingDone = settings.onboarding_completed || false;
  
  // Show if no data AND not completed
  if (!hasData && !onboardingDone) {
    showOnboardingWizard();
  }
}
```

## Design Principles

1. **Non-intrusive:** Users can skip any step at any time
2. **Progress-aware:** Clear progress indicators throughout
3. **Celebratory:** Positive language and animations
4. **Branded:** Matches Fireside tri-color system (Orange CTAs, Blue secondary)
5. **Mobile-friendly:** Fully responsive design

## Visual Style

- **Modal:** Bootstrap modal with dark theme
- **Transitions:** 150-200ms smooth animations
- **Typography:** 
  - Headings: Source Serif 4, 24-32px
  - Body: Inter, 16px
- **Colors:**
  - Primary CTA: Orange (#f44e24)
  - Secondary: Blue (#01a4ef)
  - Success: Green (#81b900)
- **Spacing:** 8px grid system

## Mobile Responsiveness

- Single-column layout on mobile
- Stacked buttons
- Full-width cards
- Adjusted font sizes (24px headings → 20px)
- Touch-friendly targets (44px minimum)

## Testing Checklist

- [x] Onboarding shows for brand-new users (no data)
- [x] Onboarding does NOT show for returning users
- [x] All "Skip" buttons work and advance correctly
- [x] Profile setup saves to settings table
- [x] Quick start cards open correct modals
- [x] Feature tour highlights correct elements
- [x] `onboarding_completed` flag saved to database
- [x] Mobile responsive design
- [x] Smooth animations
- [x] No console errors

## Future Enhancements

- [ ] Analytics tracking for completion rates
- [ ] A/B testing different messaging
- [ ] Video tutorials instead of text
- [ ] Contextual help throughout the app
- [ ] Re-trigger tour from settings page
- [ ] Onboarding for specific features (e.g., bill splitting)

## Support & Maintenance

**Owner:** Builder (Frontend & Backend Development)  
**Last Updated:** February 3, 2026  
**Version:** 1.0  
**Status:** Production Ready
