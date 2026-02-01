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
import { LineChart, PieChart } from 'react-native-chart-kit';
import { supabase } from '../services/supabase';
import { Asset, Investment, Debt, Bill, Income, DashboardStats } from '../types';
import { theme } from '../styles/theme';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - (theme.spacing.lg * 2);

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
  const [cashFlowData, setCashFlowData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [assetsRes, investmentsRes, debtsRes, billsRes, incomeRes, snapshotsRes] = await Promise.all([
        supabase.from('assets').select('*'),
        supabase.from('investments').select('*'),
        supabase.from('debts').select('*'),
        supabase.from('bills').select('*'),
        supabase.from('income').select('*'),
        supabase.from('snapshots').select('*').order('date', { ascending: true }).limit(7),
      ]);

      const assets = assetsRes.data || [];
      const investments = investmentsRes.data || [];
      const debts = debtsRes.data || [];
      const bills = billsRes.data || [];
      const incomes = incomeRes.data || [];
      const snapshots = snapshotsRes.data || [];

      const assetValue = assets.reduce((sum: number, asset: Asset) => sum + (asset.value || 0), 0);
      const investmentValue = investments.reduce((sum: number, inv: Investment) => sum + (inv.balance || 0), 0);
      const totalAssets = assetValue + investmentValue;

      const totalDebts = debts.reduce((sum: number, debt: Debt) => sum + (debt.balance || 0), 0);
      const netWorth = totalAssets - totalDebts;

      const monthlyIncome = incomes.reduce((sum: number, inc: Income) => {
        const amount = inc.amount || 0;
        switch (inc.frequency?.toLowerCase()) {
          case 'weekly':
            return sum + (amount * 52 / 12);
          case 'bi-weekly':
            return sum + (amount * 26 / 12);
          case 'monthly':
            return sum + amount;
          case 'yearly':
          case 'annual':
            return sum + (amount / 12);
          default:
            return sum + amount;
        }
      }, 0);

      const monthlyBills = bills.reduce((sum: number, bill: Bill) => {
        const amount = bill.amount || 0;
        switch (bill.frequency?.toLowerCase()) {
          case 'weekly':
            return sum + (amount * 52 / 12);
          case 'bi-weekly':
            return sum + (amount * 26 / 12);
          case 'monthly':
            return sum + amount;
          case 'quarterly':
            return sum + (amount / 3);
          case 'yearly':
          case 'annual':
            return sum + (amount / 12);
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

      const cashFlow = [
        {
          name: 'Income',
          amount: monthlyIncome,
          color: theme.colors.success,
          legendFontColor: theme.colors.text,
          legendFontSize: theme.fontSize.sm,
        },
        {
          name: 'Bills',
          amount: monthlyBills,
          color: theme.colors.accent,
          legendFontColor: theme.colors.text,
          legendFontSize: theme.fontSize.sm,
        },
      ];
      setCashFlowData(cashFlow);

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

  const StatCard = ({ title, value, color }: { title: string; value: number; color: string }) => (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{formatCurrency(value)}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
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
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
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
          <Text style={[
            styles.featuredValue,
            { color: stats.netWorth >= 0 ? theme.colors.success : theme.colors.accent }
          ]}>
            {formatCurrency(stats.netWorth)}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard title="Total Assets" value={stats.totalAssets} color={theme.colors.primary} />
          <StatCard title="Total Debts" value={stats.totalDebts} color={theme.colors.accent} />
        </View>

        <View style={styles.statsGrid}>
          <StatCard title="Monthly Income" value={stats.monthlyIncome} color={theme.colors.success} />
          <StatCard title="Monthly Bills" value={stats.monthlyBills} color={theme.colors.textLight} />
        </View>

        <View style={styles.singleCard}>
          <StatCard
            title="Net Cash Flow"
            value={stats.netCashFlow}
            color={stats.netCashFlow >= 0 ? theme.colors.success : theme.colors.accent}
          />
        </View>

        {/* Net Worth Trend Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Net Worth Trend</Text>
          {netWorthHistory.length > 0 ? (
            <LineChart
              data={{
                labels: netWorthHistory.map((_, i) => `W${i + 1}`),
                datasets: [
                  {
                    data: netWorthHistory,
                  },
                ],
              }}
              width={chartWidth}
              height={200}
              chartConfig={{
                backgroundColor: theme.colors.white,
                backgroundGradientFrom: theme.colors.white,
                backgroundGradientTo: theme.colors.white,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(26, 26, 26, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(108, 117, 125, ${opacity})`,
                style: {
                  borderRadius: theme.borderRadius.md,
                },
                propsForDots: {
                  r: '3',
                  strokeWidth: '2',
                  stroke: theme.colors.primary,
                },
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  stroke: theme.colors.border,
                  strokeWidth: 1,
                },
              }}
              bezier
              style={styles.chart}
              withVerticalLines={false}
              withHorizontalLabels={true}
              withVerticalLabels={true}
              fromZero={false}
            />
          ) : (
            <Text style={styles.noDataText}>No historical data available</Text>
          )}
        </View>

        {/* Cash Flow Breakdown Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Cash Flow Breakdown</Text>
          {cashFlowData.length > 0 && stats.monthlyIncome > 0 ? (
            <PieChart
              data={cashFlowData}
              width={chartWidth}
              height={200}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              style={styles.chart}
            />
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
    backgroundColor: theme.colors.backgroundLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
  },
  header: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl * 2,
    backgroundColor: theme.colors.primary,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.white,
    opacity: 0.8,
    marginTop: theme.spacing.xs,
  },
  content: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  featuredCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadow.card,
  },
  featuredLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featuredValue: {
    fontSize: 36,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: -1,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  singleCard: {
    marginBottom: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadow.card,
  },
  statTitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  chartCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadow.card,
  },
  chartTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  chart: {
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  noDataText: {
    textAlign: 'center',
    color: theme.colors.textLight,
    fontSize: theme.fontSize.md,
    paddingVertical: theme.spacing.xl,
  },
  footer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
});
