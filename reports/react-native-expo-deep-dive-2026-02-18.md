# React Native Expo — Implementation Deep Dive
**Research Sprint:** February 18, 2026 — Session 0656  
**Status:** ✅ Complete  
**Researcher:** Capital (Orchestrator)  
**Base:** Existing scaffold in `mobile/` — Expo 54, RN 0.81, React Nav v7  
**Previous:** Strategy doc `reports/SPRINT-RESEARCH-REACT-NATIVE-EXPO-ARCHITECTURE-2026-02-09.md`

---

## Current State Audit

### What Exists
| File | Status | Notes |
|------|--------|-------|
| `mobile/App.tsx` | ✅ Works | Stack navigator, auth gate |
| `mobile/src/screens/LoginScreen.tsx` | ✅ Works | Supabase auth, form validation |
| `mobile/src/screens/DashboardScreen.tsx` | ✅ Works | 6 stat cards, 2 charts |
| `mobile/src/services/supabase.ts` | ✅ Works | Connected to live DB |
| `mobile/src/styles/theme.ts` | ⚠️ Wrong colors | Uses `#1a1a1a` / `#dc3545` — not Fireside brand |
| `mobile/src/types/index.ts` | ⚠️ Manual types | No DB-generated types |
| Bottom tabs | ❌ Missing | QUICKSTART.md confirms not built |
| CRUD screens | ❌ Missing | Assets, Bills, Debts, Income |
| TanStack Query | ❌ Missing | Needs install + wiring |
| Dark theme | ❌ Missing | Currently light mode only |

### Package Versions
```json
{
  "expo": "~54.0.33",
  "react-native": "0.81.5",
  "@supabase/supabase-js": "^2.93.3",
  "react-native-chart-kit": "^6.12.0"  // ⚠️ NOT MAINTAINED — last published 4 years ago
}
```

---

## Critical Finding: Chart Library

**`react-native-chart-kit` is unmaintained** — last npm publish was ~2021. Known issues:
- No active bug fixes
- Limited customization
- Uses deprecated React Native APIs

**Recommendation: `react-native-gifted-charts`**

| Library | Maintained | Expo | Animations | Financial Use |
|---------|------------|------|------------|---------------|
| react-native-chart-kit | ❌ Dead | ✅ | Basic | OK |
| victory-native | ✅ Active | ✅ | ✅ | ✅ Good |
| react-native-gifted-charts | ✅ Active | ✅ | ✅ | ✅ Best |

**Winner: `react-native-gifted-charts`** — Expo-compatible, simpler API, beautiful line/bar/pie charts, actively maintained (2025). Requires `react-native-svg` (already installed ✅) + `expo-linear-gradient`.

---

## Implementation Plan

### Step 1: Fix Theme Colors (5 min) — MOB-008

Current `theme.ts` uses wrong colors. Fireside brand:

```typescript
// mobile/src/styles/theme.ts — REPLACE ENTIRE FILE
export const colors = {
  // Fireside Brand
  primary: '#01a4ef',    // Fireside Blue
  cta: '#f44e24',        // Fireside Orange (CTAs)
  success: '#81b900',    // Fireside Green
  warning: '#ffc107',
  danger: '#dc3545',

  // Dark theme (default — matches web app)
  background: '#0f0f0f',
  backgroundCard: '#1a1a1a',
  backgroundElevated: '#242424',
  backgroundInput: '#2a2a2a',
  border: '#333333',
  borderSubtle: '#2a2a2a',

  // Text
  text: '#f0f0f0',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',
  textOnDark: '#ffffff',

  // Chart colors
  chartLine: '#01a4ef',
  chartBar: '#01a4ef',
  chartPositive: '#81b900',
  chartNegative: '#dc3545',
  chartNeutral: '#6b7280',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const radius = { sm: 6, md: 10, lg: 16, xl: 24, full: 9999 };

export const typography = {
  xs: 11, sm: 13, md: 15, lg: 17, xl: 22, xxl: 28, xxxl: 36,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Legacy compat — remove after migrating DashboardScreen
export const theme = {
  colors: {
    primary: colors.primary,
    accent: colors.cta,
    success: colors.success,
    background: colors.background,
    backgroundLight: colors.backgroundCard,
    text: colors.text,
    textLight: colors.textSecondary,
    white: '#ffffff',
    border: colors.border,
    cardBackground: colors.backgroundCard,
  },
  spacing,
  borderRadius: radius,
  fontSize: typography,
  fontWeight: { regular: '400' as const, semibold: '600' as const, bold: '700' as const },
  shadow,
  button: { minHeight: 44 },
};
```

---

### Step 2: Generate Supabase TypeScript Types — MOB-009

Replace manual types with DB-generated types. Run once, commit file.

```bash
# Install Supabase CLI (dev dependency)
cd mobile
npx supabase login  # requires SUPABASE_ACCESS_TOKEN or browser OAuth

# Generate types from live project
npx supabase gen types typescript \
  --project-id qqtiofdqplwycnwplmen \
  --schema public \
  > src/types/database.types.ts

# Commit the generated file
git add src/types/database.types.ts
```

**Update `src/services/supabase.ts`:**

```typescript
import 'react-native-url-polyfill/auto';  // already in package
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

const supabaseUrl = 'https://qqtiofdqplwycnwplmen.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type Asset = Tables<'assets'>;
export type Bill = Tables<'bills'>;
export type Debt = Tables<'debts'>;
export type Income = Tables<'income'>;
export type Investment = Tables<'investments'>;
export type Snapshot = Tables<'snapshots'>;
export type Budget = Tables<'budgets'>;
```

---

### Step 3: Install & Configure TanStack Query — MOB-010

```bash
cd mobile
npm install @tanstack/react-query @react-native-community/netinfo
```

**Wire into App.tsx:**

```typescript
// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { AppState, Platform } from 'react-native';
import { onlineManager, focusManager } from '@tanstack/react-query';

// 1. Online detection via NetInfo
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

// 2. App focus detection (refresh stale queries on foreground)
function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 min — financial data doesn't change every second
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    },
  },
});

export default function App() {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        {/* ... */}
      </NavigationContainer>
    </QueryClientProvider>
  );
}
```

---

### Step 4: Supabase Query Hooks — MOB-011

**`src/hooks/useFinancialData.ts` — All data hooks:**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Asset, Bill, Debt, Income, Investment } from '../services/supabase';

// ─── Assets ───────────────────────────────────────────────────

export function useAssets() {
  return useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useDeleteAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('assets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assets'] }),
  });
}

// ─── Bills ────────────────────────────────────────────────────

export function useBills() {
  return useQuery({
    queryKey: ['bills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .not('status', 'eq', 'paid_off')
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

// Upcoming bills (due within 7 days) — for dashboard alert
export function useUpcomingBills(days: number = 7) {
  return useQuery({
    queryKey: ['bills', 'upcoming', days],
    queryFn: async () => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() + days);
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .lte('due_date', cutoff.toISOString())
        .not('status', 'eq', 'paid_off')
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 60 * 1000, // 1 min for upcoming — more time-sensitive
  });
}

// ─── Debts ────────────────────────────────────────────────────

export function useDebts() {
  return useQuery({
    queryKey: ['debts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .order('balance', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// ─── Income ───────────────────────────────────────────────────

export function useIncome() {
  return useQuery({
    queryKey: ['income'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('income')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// ─── Investments ──────────────────────────────────────────────

export function useInvestments() {
  return useQuery({
    queryKey: ['investments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .order('balance', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// ─── Dashboard aggregate ─────────────────────────────────────

export function useDashboardStats() {
  const assets = useAssets();
  const debts = useDebts();
  const bills = useBills();
  const income = useIncome();
  const investments = useInvestments();

  const isLoading = [assets, debts, bills, income, investments].some(q => q.isLoading);
  const isError = [assets, debts, bills, income, investments].some(q => q.isError);

  if (isLoading || isError) return { isLoading, isError, stats: null };

  const assetValue = (assets.data || []).reduce((s, a) => s + (a.value || 0), 0);
  const investmentValue = (investments.data || []).reduce((s, i) => s + (i.balance || 0), 0);
  const totalAssets = assetValue + investmentValue;
  const totalDebts = (debts.data || []).reduce((s, d) => s + (d.balance || 0), 0);
  const netWorth = totalAssets - totalDebts;

  // Normalize income to monthly
  const monthlyIncome = (income.data || []).reduce((s, i) => {
    if (i.frequency === 'monthly') return s + (i.amount || 0);
    if (i.frequency === 'bi-weekly') return s + (i.amount || 0) * 26 / 12;
    if (i.frequency === 'weekly') return s + (i.amount || 0) * 52 / 12;
    if (i.frequency === 'annually') return s + (i.amount || 0) / 12;
    return s;
  }, 0);

  const monthlyBills = (bills.data || []).reduce((s, b) => {
    if (b.frequency === 'monthly') return s + (b.amount || 0);
    if (b.frequency === 'bi-weekly') return s + (b.amount || 0) * 26 / 12;
    if (b.frequency === 'weekly') return s + (b.amount || 0) * 52 / 12;
    if (b.frequency === 'annually') return s + (b.amount || 0) / 12;
    return s;
  }, 0);

  return {
    isLoading: false,
    isError: false,
    stats: {
      netWorth,
      totalAssets,
      totalDebts,
      monthlyIncome,
      monthlyBills,
      netCashFlow: monthlyIncome - monthlyBills,
    },
  };
}
```

---

### Step 5: Bottom Tab Navigation — MOB-012

```bash
cd mobile
npm install @react-navigation/bottom-tabs @expo/vector-icons
```

**`App.tsx` — Full navigation structure:**

```typescript
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './src/styles/theme';

// Screens
import DashboardScreen from './src/screens/DashboardScreen';
import AssetsScreen from './src/screens/AssetsScreen';
import BillsScreen from './src/screens/BillsScreen';
import BudgetScreen from './src/screens/BudgetScreen';
import MoreScreen from './src/screens/MoreScreen';  // Debts, Income, Settings, Logout

const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.backgroundCard,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 60,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, [string, string]> = {
            Dashboard: ['speedometer', 'speedometer-outline'],
            Assets: ['home', 'home-outline'],
            Bills: ['receipt', 'receipt-outline'],
            Budget: ['pie-chart', 'pie-chart-outline'],
            More: ['ellipsis-horizontal', 'ellipsis-horizontal-outline'],
          };
          const [active, inactive] = icons[route.name] || ['apps', 'apps-outline'];
          return <Ionicons name={(focused ? active : inactive) as any} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Assets" component={AssetsScreen} />
      <Tab.Screen name="Bills" component={BillsScreen} />
      <Tab.Screen name="Budget" component={BudgetScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}

// Main App — auth-gated
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ... auth check ...

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer theme={{
        dark: true,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.backgroundCard,
          text: colors.text,
          border: colors.border,
          notification: colors.cta,
        },
        fonts: { ...DefaultTheme.fonts }
      }}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <Stack.Screen name="Main" component={MainTabs} />
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
```

---

### Step 6: Reusable List Screen Pattern — MOB-013

Template for Assets/Bills/Debts/Income (CRUD):

```typescript
// src/screens/AssetsScreen.tsx — FULL IMPLEMENTATION
import React, { useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAssets, useDeleteAsset } from '../hooks/useFinancialData';
import { colors, spacing, radius, typography, shadow } from '../styles/theme';
import { Asset } from '../services/supabase';

const fmt = (n: number) => `$${Math.abs(n).toLocaleString('en-US', {
  minimumFractionDigits: 0, maximumFractionDigits: 0
})}`;

export default function AssetsScreen() {
  const { data: assets, isLoading, refetch } = useAssets();
  const deleteAsset = useDeleteAsset();
  const queryClient = useQueryClient();

  // Refresh when tab gains focus
  useFocusEffect(useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['assets'], stale: true });
  }, [queryClient]));

  const handleDelete = (asset: Asset) => {
    Alert.alert(
      'Delete Asset',
      `Remove "${asset.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAsset.mutate(asset.id, {
            onError: () => Alert.alert('Error', 'Failed to delete asset.'),
          }),
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Asset }) => {
    const equity = (item.value || 0) - (item.loan_balance || 0);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Ionicons name="home-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.cardTitle}>
            <Text style={styles.cardName}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>{item.type || 'Asset'}</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDelete(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
        <View style={styles.cardStats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Value</Text>
            <Text style={styles.statValue}>{fmt(item.value || 0)}</Text>
          </View>
          {(item.loan_balance || 0) > 0 && (
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Loan</Text>
              <Text style={[styles.statValue, { color: colors.danger }]}>{fmt(item.loan_balance || 0)}</Text>
            </View>
          )}
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Equity</Text>
            <Text style={[styles.statValue, { color: equity >= 0 ? colors.success : colors.danger }]}>
              {fmt(equity)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const totalValue = (assets || []).reduce((s, a) => s + (a.value || 0), 0);
  const totalEquity = (assets || []).reduce((s, a) => s + (a.value || 0) - (a.loan_balance || 0), 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assets</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add" size={20} color={colors.background} />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Bar */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Value</Text>
          <Text style={styles.summaryValue}>{fmt(totalValue)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Equity</Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>{fmt(totalEquity)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Count</Text>
          <Text style={styles.summaryValue}>{(assets || []).length}</Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={assets || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="home-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Assets Yet</Text>
              <Text style={styles.emptySubtitle}>Add your first asset to track your wealth</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.md,
    backgroundColor: colors.backgroundCard, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: typography.xl, fontWeight: typography.bold, color: colors.text },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.md, minHeight: 44,
  },
  addBtnText: { color: colors.background, fontWeight: typography.semibold, fontSize: typography.sm },
  summary: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.backgroundCard, paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: typography.xs, color: colors.textMuted, marginBottom: 2 },
  summaryValue: { fontSize: typography.md, fontWeight: typography.semibold, color: colors.text },
  summaryDivider: { width: 1, height: 32, backgroundColor: colors.border },
  listContent: { padding: spacing.md, gap: spacing.sm },
  card: {
    backgroundColor: colors.backgroundCard, borderRadius: radius.lg,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border, ...shadow.card,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  cardIcon: {
    width: 36, height: 36, borderRadius: radius.md,
    backgroundColor: `${colors.primary}20`, alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.sm,
  },
  cardTitle: { flex: 1 },
  cardName: { fontSize: typography.md, fontWeight: typography.semibold, color: colors.text },
  cardSubtitle: { fontSize: typography.xs, color: colors.textMuted, textTransform: 'capitalize' },
  cardStats: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { alignItems: 'center' },
  statLabel: { fontSize: typography.xs, color: colors.textMuted, marginBottom: 2 },
  statValue: { fontSize: typography.sm, fontWeight: typography.semibold, color: colors.text },
  empty: { alignItems: 'center', paddingVertical: 64, gap: spacing.sm },
  emptyTitle: { fontSize: typography.lg, fontWeight: typography.semibold, color: colors.text },
  emptySubtitle: { fontSize: typography.sm, color: colors.textMuted, textAlign: 'center' },
});
```

---

### Step 7: Upgrade Chart Library — MOB-014

```bash
cd mobile
npm install react-native-gifted-charts expo-linear-gradient
# react-native-svg already installed ✅
```

**Replace charts in DashboardScreen:**

```typescript
// Before (react-native-chart-kit):
import { LineChart, PieChart } from 'react-native-chart-kit';

// After (react-native-gifted-charts):
import { LineChart, PieChart, BarChart } from 'react-native-gifted-charts';

// Net Worth Trend (line chart)
const netWorthData = snapshots.map((s, i) => ({
  value: s.net_worth,
  label: new Date(s.snapshot_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  dataPointText: i === snapshots.length - 1 ? `$${(s.net_worth / 1000).toFixed(0)}k` : undefined,
}));

<LineChart
  data={netWorthData}
  color={colors.chartLine}
  thickness={2.5}
  dataPointsColor={colors.primary}
  startFillColor={`${colors.primary}40`}
  endFillColor={`${colors.primary}00`}
  initialSpacing={20}
  spacing={52}
  backgroundColor="transparent"
  noOfSections={4}
  yAxisColor="transparent"
  xAxisColor={colors.border}
  yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
  xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 10 }}
  hideRules={false}
  rulesColor={colors.borderSubtle}
  rulesType="solid"
  areaChart
  curved
  isAnimated
/>

// Cash Flow Bar Chart
const cashFlowData = [
  { value: monthlyIncome, label: 'Income', frontColor: colors.success },
  { value: monthlyBills, label: 'Bills', frontColor: colors.danger },
  { value: Math.max(0, monthlyIncome - monthlyBills), label: 'Net', frontColor: colors.primary },
];

<BarChart
  data={cashFlowData}
  barWidth={60}
  spacing={20}
  roundedTop
  roundedBottom={false}
  hideRules={false}
  rulesColor={colors.borderSubtle}
  xAxisColor="transparent"
  yAxisColor="transparent"
  yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
  labelWidth={60}
  xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 10 }}
  isAnimated
/>
```

---

### Step 8: Bills Screen with Urgency Indicators — MOB-015

```typescript
// src/screens/BillsScreen.tsx — key pattern
import { useBills } from '../hooks/useFinancialData';

const getDaysUntilDue = (dueDate: string) => {
  const diff = new Date(dueDate).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const getUrgencyColor = (days: number) => {
  if (days < 0) return colors.danger;   // overdue
  if (days <= 3) return colors.danger;  // urgent
  if (days <= 7) return colors.warning; // soon
  return colors.success;               // upcoming
};

const getUrgencyLabel = (days: number) => {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `Due in ${days}d`;
};

// In FlatList renderItem:
const daysUntil = getDaysUntilDue(item.due_date);
const urgencyColor = getUrgencyColor(daysUntil);

<View style={[styles.urgencyBadge, { backgroundColor: `${urgencyColor}20`, borderColor: urgencyColor }]}>
  <Text style={[styles.urgencyText, { color: urgencyColor }]}>
    {getUrgencyLabel(daysUntil)}
  </Text>
</View>
```

---

### Step 9: Demo Mode in Mobile — MOB-016

Port the web app's demo mode to mobile:

```typescript
// src/services/demoMode.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEMO_KEY = 'fireside_demo_mode';

export const isDemoMode = async (): Promise<boolean> => {
  const val = await AsyncStorage.getItem(DEMO_KEY);
  return val === 'true';
};

export const enableDemoMode = () => AsyncStorage.setItem(DEMO_KEY, 'true');
export const disableDemoMode = () => AsyncStorage.removeItem(DEMO_KEY);

// Demo data mirror from web app's demo-data.js
export const DEMO_DATA = {
  assets: [
    { id: 'demo-1', name: 'Primary Residence', type: 'real_estate', value: 485000, loan_balance: 342000, user_id: 'demo' },
    { id: 'demo-2', name: '2022 Tesla Model Y', type: 'vehicle', value: 38000, loan_balance: 22400, user_id: 'demo' },
  ],
  bills: [
    { id: 'demo-b1', name: 'Mortgage', amount: 1850, frequency: 'monthly', due_date: '2026-03-01', status: 'active', user_id: 'demo' },
    { id: 'demo-b2', name: 'Car Insurance', amount: 142, frequency: 'monthly', due_date: '2026-02-22', status: 'active', user_id: 'demo' },
    { id: 'demo-b3', name: 'Netflix', amount: 22.99, frequency: 'monthly', due_date: '2026-02-25', status: 'active', user_id: 'demo' },
  ],
  income: [
    { id: 'demo-i1', name: 'Tech Corp', type: 'salary', amount: 5200, frequency: 'bi-weekly', user_id: 'demo' },
    { id: 'demo-i2', name: 'Freelance', type: 'freelance', amount: 800, frequency: 'monthly', user_id: 'demo' },
  ],
  debts: [
    { id: 'demo-d1', name: 'Student Loan', balance: 24500, interest_rate: 5.05, minimum_payment: 275, user_id: 'demo' },
    { id: 'demo-d2', name: 'Car Loan', balance: 11200, interest_rate: 4.5, minimum_payment: 320, user_id: 'demo' },
  ],
  investments: [
    { id: 'demo-inv1', name: '401(k)', balance: 45200, account_type: '401k', contributions: 500, user_id: 'demo' },
    { id: 'demo-inv2', name: 'Roth IRA', balance: 18700, account_type: 'roth_ira', contributions: 250, user_id: 'demo' },
  ],
};
```

**Update query hooks to check demo mode:**

```typescript
// In useAssets() queryFn:
queryFn: async () => {
  const demo = await isDemoMode();
  if (demo) return DEMO_DATA.assets;

  const { data, error } = await supabase.from('assets').select('*');
  if (error) throw error;
  return data;
}
```

---

## Dependency Installation Summary

```bash
cd C:\Users\chuba\fireside-capital\mobile

# Tab navigation
npm install @react-navigation/bottom-tabs

# Vector icons (Ionicons built into Expo)
# @expo/vector-icons is already bundled with expo ✅

# TanStack Query
npm install @tanstack/react-query @react-native-community/netinfo

# Better charts
npm install react-native-gifted-charts expo-linear-gradient

# Generate types (run manually once)
npx supabase gen types typescript --project-id qqtiofdqplwycnwplmen > src/types/database.types.ts
```

---

## Known Expo 54 + RN 0.81 Gotchas

| Issue | Cause | Fix |
|-------|-------|-----|
| `AsyncStorage is deprecated` | @supabase/supabase-js upgrade | Use `@react-native-async-storage/async-storage` ✅ already installed |
| Tab bar covering content | Missing safe area | `paddingBottom: insets.bottom` from `useSafeAreaInsets()` |
| `shadow` not on Android | iOS-only prop | Add `elevation: N` alongside shadow props |
| Hermes + React 19 | New React 19 JSX runtime | Ensure babel config uses `'plugin:@babel/plugin-transform-react-jsx'` |
| `url-polyfill` warning | RN 0.81 URL API | Keep `import 'react-native-url-polyfill/auto'` at top of supabase.ts |
| Navigation dark theme | React Nav default is light | Pass `theme` prop to `NavigationContainer` (shown in Step 5) |

---

## Implementation Order (Task Sequence)

```
MOB-008: Fix theme.ts → Fireside brand colors + dark (5 min)
MOB-009: Generate DB types + update supabase.ts (30 min)
MOB-010: Install TanStack Query + wire AppState/NetInfo (30 min)
MOB-011: Create src/hooks/useFinancialData.ts (45 min)
MOB-012: Bottom tab navigation (45 min)
MOB-013: AssetsScreen + BillsScreen + DebtsScreen + IncomeScreen (3h)
MOB-014: Upgrade charts to react-native-gifted-charts (1h)
MOB-015: Bills urgency indicators (30 min)
MOB-016: Demo mode port to mobile (1h)
```

**Total estimated effort: ~8.5 hours**

---

## New Tasks for Backlog

| ID | Priority | Est | Description |
|----|----------|-----|-------------|
| MOB-008 | P1 | 5 min | Fix `theme.ts` — update to Fireside brand colors (#01a4ef primary, #f44e24 CTA, #81b900 success) + dark background (#0f0f0f) |
| MOB-009 | P1 | 30 min | Generate Supabase TypeScript types (`npx supabase gen types typescript --project-id qqtiofdqplwycnwplmen`) + update `src/services/supabase.ts` with `createClient<Database>` |
| MOB-010 | P1 | 30 min | Install + configure TanStack Query v5 — `QueryClientProvider` in App.tsx, `onlineManager` via NetInfo, `focusManager` via AppState |
| MOB-011 | P1 | 45 min | Create `src/hooks/useFinancialData.ts` — hooks: useAssets, useBills, useDebts, useIncome, useInvestments, useDashboardStats, useUpcomingBills |
| MOB-012 | P1 | 45 min | Add bottom tab navigation — install `@react-navigation/bottom-tabs`, create 5-tab structure (Dashboard, Assets, Bills, Budget, More), apply dark NavigationContainer theme |
| MOB-013 | P1 | 3h | Build CRUD list screens — AssetsScreen, BillsScreen, DebtsScreen, IncomeScreen using reusable pattern from this research |
| MOB-014 | P2 | 1h | Upgrade from dead `react-native-chart-kit` to `react-native-gifted-charts` — line chart for net worth trend, bar chart for cash flow |
| MOB-015 | P2 | 30 min | Bills urgency indicators — color-coded badges (overdue/urgent/soon/upcoming) based on days until due date |
| MOB-016 | P3 | 1h | Port demo mode to mobile — `src/services/demoMode.ts` with AsyncStorage flag + demo data constants |

---

**Research Status:** ✅ Complete  
**Previous research topics:** 14/14 complete (see STATUS.md)  
**This topic:** MOB-002 deep-dive implementation specifics  
**Report:** `reports/react-native-expo-deep-dive-2026-02-18.md`
