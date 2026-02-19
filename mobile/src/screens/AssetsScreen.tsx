import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, typography } from '../styles/theme';
import { useAssets } from '../hooks/useFinancialData';

const fmt = (n: number) => `$${Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

export default function AssetsScreen() {
  const { data: assets, isLoading } = useAssets();
  const totalValue = (assets ?? []).reduce((s, a) => s + (a.value ?? 0), 0);
  const totalEquity = (assets ?? []).reduce((s, a) => s + (a.value ?? 0) - (a.loan_balance ?? 0), 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assets</Text>
      </View>
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />
      ) : (
        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Total Value</Text>
          <Text style={styles.summaryValue}>{fmt(totalValue)}</Text>
          <Text style={[styles.summaryLabel, { marginTop: spacing.sm }]}>Total Equity</Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>{fmt(totalEquity)}</Text>
          <Text style={[styles.summaryLabel, { marginTop: spacing.lg, color: colors.textMuted }]}>
            {(assets ?? []).length} asset{(assets ?? []).length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.md,
    backgroundColor: colors.backgroundCard, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: typography.xl, fontWeight: typography.bold, color: colors.text },
  summary: { alignItems: 'center', paddingTop: spacing.xl },
  summaryLabel: { fontSize: typography.sm, color: colors.textSecondary },
  summaryValue: { fontSize: typography.xxxl, fontWeight: typography.bold, color: colors.text },
});
