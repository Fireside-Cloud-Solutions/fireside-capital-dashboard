# Fireside Capital Mobile

Unified mobile app for Fireside Capital personal finance platform.

## Features

- ✅ **Authentication** - Supabase-powered login with session management
- ✅ **Dashboard** - Financial overview with net worth, assets, debts, income, and bills
- ✅ **Charts** - Line chart for net worth trend, pie chart for cash flow breakdown
- ✅ **Real-time Data** - Pull-to-refresh for latest financial data
- ✅ **Responsive UI** - Works on iOS, Android, and web

## Tech Stack

- **Expo SDK 54** - Cross-platform React Native framework
- **React Navigation** - Native stack navigation
- **Supabase** - Backend database and authentication
- **TypeScript** - Type-safe development
- **React Native Chart Kit** - Beautiful charts

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run the App

```bash
# Start Expo dev server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## Project Structure

```
mobile/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.tsx      # Authentication screen
│   │   └── DashboardScreen.tsx  # Main dashboard with charts
│   ├── services/
│   │   └── supabase.ts          # Supabase client config
│   ├── styles/
│   │   └── theme.ts             # App-wide theme constants
│   └── types/
│       └── index.ts             # TypeScript interfaces
├── assets/                       # Images and icons
├── App.tsx                       # Root component with navigation
├── package.json                  # Dependencies
└── tsconfig.json                # TypeScript config
```

## Database Schema

See main project documentation for Supabase table schemas:
- `assets` - Real estate, vehicles
- `investments` - Investment accounts
- `debts` - Loans and debts
- `bills` - Recurring bills
- `income` - Income sources
- `snapshots` - Net worth history

## Consolidated From

This app was consolidated from three separate projects:
- `mobile-app/` - Dashboard screen with charts
- `FiresideCapital/` - Authentication and navigation setup
- Best features from each merged into this unified app

## Next Steps

- [ ] Add bottom tab navigation for Assets, Debts, Bills, Income screens
- [ ] Implement transaction list and categorization
- [ ] Add budget tracking
- [ ] Implement goal setting and progress tracking
- [ ] Push notifications for bill reminders
- [ ] Biometric authentication (Face ID/Touch ID)
