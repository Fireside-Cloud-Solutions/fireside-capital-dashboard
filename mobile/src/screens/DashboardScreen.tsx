// MOB-014: Migrated from react-native-chart-kit → react-native-gifted-charts
// MOB-014: Migrated from legacy theme compat object → new design tokens
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-gifted-charts';
import { supabase } from '../services/supabase';
import { Asset, Investment, Debt, Bill, Income, DashboardStats } from '../types';
import { colors, spacing, radius, typography, shadow } from '../styles/theme';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - spacing.lg * 2;

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    netWorth: 0,
    totalAssets: 0,
    totalDebts: 0,
    monthlyIncome: 0,
    monthlyBills: 0,
    netCashFlow: 0,
  });
  const [netWorthHistory, setNetWorthHistory] = useState<number[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [assetsRes, investmentsRes, debtsRes, billsRes, incomeRes, snapshotsRes] =
        await Promise.all([
          supabase.from('assets').select('*'),
          supabase.from('investments').select('*'),
          supabase.from('debts').select('*'),
          supabase.from('bills').select('*'),
          supabase.from('income').select('*'),
          supabase
            .from('snapshots')
            .select('*')
            .order('date', { ascending: true })
            .limit(7),
        ]);

      const assets = assetsRes.data || [];
      const investments = investmentsRes.data || [];
      const debts = debtsRes.data || [];
      const bills = billsRes.data || [];
      const incomes = incomeRes.data || [];
      const snapshots = snapshotsRes.data || [];

      const assetValue = assets.reduce(
        (sum: number, asset: Asset) => sum + (asset.value || 0),
        0,
      );
      const investmentValue = investments.reduce(
        (sum: number, inv: Investment) => sum + (inv.balance || 0),
        0,
      );
      const totalAssets = assetValue + investmentValue;

      const totalDebts = debts.reduce(
        (sum: number, debt: Debt) => sum + (debt.balance || 0),
        0,
      );
      const netWorth = totalAssets - totalDebts;

      const monthlyIncome = incomes.reduce((sum: number, inc: Income) => {
        const amount = inc.amount || 0;
        switch (inc.frequency?.toLowerCase()) {
          case 'weekly':
            return sum + (amount * 52) / 12;
          case 'bi-weekly':
            return sum + (amount * 26) / 12;
          case 'monthly':
            return sum + amount;
          case 'yearly':
          case 'annual':
            return sum + amount / 12;
          default:
            return sum + amount;
        }
      }, 0);

      const monthlyBills = bills.reduce((sum: number, bill: Bill) => {
        const amount = bill.amount || 0;
        switch (bill.frequency?.toLowerCase()) {
          case 'weekly':
            return sum + (amount * 52) / 12;
          case 'bi-weekly':
            return sum + (amount * 26) / 12;
          case 'monthly':
            return sum + amount;
          case 'quarterly':
            return sum + amount / 3;
          case 'yearly':
          case 'annual':
            return sum + amount / 12;
          default:
            return sum + amount;
        }
      }, 0);

      const netCashFlow = monthlyIncome - monthlyBills;

      setStats({
        netWorth,
        totalAssets,
        totalDebts,
        monthlyIncome,
        monthlyBills,
        netCashFlow,
      });

      const history = snapshots.map((s: any) => s.net_worth || 0);
      if (history.length === 0) {
        history.push(netWorth);
      }
      setNetWorthHistory(history);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const StatCard = ({
    title,
    value,
    color,
  }: {
    title: string;
    value: number;
    color: string;
  }) => (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{formatCurrency(value)}</Text>
    </View>
  );

  // gifted-charts data shapes
  const lineData = netWorthHistory.map((value, i) => ({
    value,
    label: `W${i + 1}`,
  }));

  const pieData = [
    { value: stats.monthlyIncome, color: colors.success, text: 'Income' },
    { value: stats.monthlyBills, color: colors.cta, text: 'Bills' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Your financial overview</Text>
      </View>

      <View style={styles.content}>
        {/* Featured Net Worth Card */}
        <View style={styles.featuredCard}>
          <Text style={styles.featuredLabel}>Net Worth</Text>
          <Text
            style={[
              styles.featuredValue,
              { color: stats.netWorth >= 0 ? colors.success : colors.cta },
            ]}
          >
            {formatCurrency(stats.netWorth)}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard title="Total Assets" value={stats.totalAssets} color={colors.primary} />
          <StatCard title="Total Debts" value={stats.totalDebts} color={colors.cta} />
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Monthly Income"
            value={stats.monthlyIncome}
            color={colors.success}
          />
          <StatCard
            title="Monthly Bills"
            value={stats.monthlyBills}
            color={colors.textSecondary}
          />
        </View>

        <View style={styles.singleCard}>
          <StatCard
            title="Net Cash Flow"
            value={stats.netCashFlow}
            color={stats.netCashFlow >= 0 ? colors.success : colors.cta}
          />
        </View>

        {/* Net Worth Trend — react-native-gifted-charts LineChart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Net Worth Trend</Text>
          {netWorthHistory.length > 0 ? (
            <LineChart
              data={lineData}
              width={chartWidth}
              height={200}
              color={colors.chartLine}
              thickness={2}
              dataPointsColor={colors.primary}
              dataPointsRadius={4}
              curved
              areaChart
              startFillColor={colors.primary}
              startOpacity={0.2}
              endOpacity={0}
              xAxisColor={colors.border}
              yAxisColor={colors.border}
              yAxisTextStyle={{ color: colors.textMuted, fontSize: typography.xs }}
              xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: typography.xs }}
              rulesColor={colors.border}
              rulesType="solid"
              hideDataPoints={false}
              noOfSections={4}
              initialSpacing={20}
            />
          ) : (
            <Text style={styles.noDataText}>No historical data available</Text>
          )}
        </View>

        {/* Cash Flow Breakdown — react-native-gifted-charts PieChart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Cash Flow Breakdown</Text>
          {stats.monthlyIncome > 0 ? (
            <>
              <View style={styles.pieWrapper}>
                <PieChart
                  data={pieData}
                  donut
                  showText
                  textColor={colors.text}
                  radius={80}
                  innerRadius={55}
                  innerCircleColor={colors.backgroundCard}
                  centerLabelComponent={() => (
                    <View style={styles.pieCenterLabel}>
                      <Text style={styles.pieCenterLabelTitle}>Net Flow</Text>
                      <Text
                        style={[
                          styles.pieCenterLabelValue,
                          {
                            color:
                              stats.netCashFlow >= 0 ? colors.success : colors.danger,
                          },
                        ]}
                      >
                        {formatCurrency(stats.netCashFlow)}
                      </Text>
                    </View>
                  )}
                />
              </View>

              {/* Manual legend (gifted-charts doesn't auto-render one) */}
              <View style={styles.pieLegend}>
                <View style={styles.pieLegendItem}>
                  <View style={[styles.pieLegendDot, { backgroundColor: colors.success }]} />
                  <Text style={styles.pieLegendLabel}>Income</Text>
                  <Text style={[styles.pieLegendAmount, { color: colors.success }]}>
                    {formatCurrency(stats.monthlyIncome)}
                  </Text>
                </View>
                <View style={styles.pieLegendItem}>
                  <View style={[styles.pieLegendDot, { backgroundColor: colors.cta }]} />
                  <Text style={styles.pieLegendLabel}>Bills</Text>
                  <Text style={[styles.pieLegendAmount, { color: colors.cta }]}>
                    {formatCurrency(stats.monthlyBills)}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.noDataText}>No cash flow data available</Text>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Pull down to refresh</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.md,
    color: colors.textSecondary,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl * 2,
    backgroundColor: colors.primary,
  },
  headerTitle: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textOnDark,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: typography.md,
    color: colors.textOnDark,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  featuredCard: {
    backgroundColor: colors.backgroundCard,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  featuredLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.semibold,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featuredValue: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    letterSpacing: -1,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  singleCard: {
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
    padding: spacing.md,
    borderRadius: radius.md,
    ...shadow.card,
  },
  statTitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
  },
  chartCard: {
    backgroundColor: colors.backgroundCard,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  chartTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  noDataText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: typography.md,
    paddingVertical: spacing.xl,
  },
  pieWrapper: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  pieCenterLabel: {
    alignItems: 'center',
  },
  pieCenterLabelTitle: {
    color: colors.textSecondary,
    fontSize: typography.xs,
  },
  pieCenterLabelValue: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
  },
  pieLegend: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  pieLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pieLegendDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },
  pieLegendLabel: {
    flex: 1,
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  pieLegendAmount: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  footer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.sm,
    color: colors.textMuted,
  },
});
