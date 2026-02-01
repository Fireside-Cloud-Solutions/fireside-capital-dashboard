# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Start the Development Server

```bash
npm start
```

This will open the Expo Dev Tools in your browser.

### 3. Run on Your Device

Choose one:

**iOS Simulator** (Mac only):
```bash
npm run ios
```

**Android Emulator**:
```bash
npm run android
```

**Physical Device:**
- Install **Expo Go** app from App Store or Play Store
- Scan the QR code from the terminal

**Web Browser:**
```bash
npm run web
```

---

## 🔐 Test Login

The app connects to Supabase at:
- **URL:** https://qqtiofdqplwycnwplmen.supabase.co

You'll need valid credentials in the Supabase Auth system.

To create test credentials:
1. Go to Supabase dashboard
2. Navigate to Authentication → Users
3. Click "Add user"
4. Enter email + password
5. Use those credentials in the mobile app

---

## 📱 Expected Behavior

### On First Launch:
1. App shows loading spinner
2. Checks for existing session
3. Redirects to Login screen (no session) or Dashboard (active session)

### After Login:
1. User enters email + password
2. Loading spinner appears
3. On success → Dashboard appears
4. On error → Error message shown

### Dashboard:
1. Fetches data from Supabase tables
2. Shows 6 stat cards: Net Worth, Assets, Debts, Income, Bills, Cash Flow
3. Shows 2 charts: Net Worth Trend, Cash Flow Breakdown
4. Pull down to refresh data

---

## 🐛 Troubleshooting

### "Cannot connect to Metro"
```bash
# Clear cache and restart
npx expo start -c
```

### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### "Supabase error"
- Check internet connection
- Verify Supabase URL and anon key in `src/services/supabase.ts`
- Check Supabase project status

### "No data in Dashboard"
- Login to Supabase dashboard
- Check that tables exist: assets, investments, debts, bills, income, snapshots
- Add sample data to tables
- Pull down to refresh in the app

---

## 📚 Next Features to Build

- [ ] Bottom tab navigation
- [ ] Assets list screen
- [ ] Debts list screen
- [ ] Bills list screen
- [ ] Income list screen
- [ ] Add/Edit/Delete functionality
- [ ] Settings screen
- [ ] Logout button
- [ ] User registration
- [ ] Password reset

---

## 🔗 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Supabase Docs](https://supabase.com/docs)
- [React Native Chart Kit](https://github.com/indiespirit/react-native-chart-kit)

---

**Ready to build!** 🎉
