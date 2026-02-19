import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../styles/theme';
import { useIncome, useDeleteIncome } from '../hooks/useFinancialData';

const fmtCurrency = (n: number) => `$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

const normalizeToMonthly = (amount: number, freq: string | null) => {
  switch (freq) {
    case 'monthly': return amount;
    case 'bi-weekly': return (amount * 26) / 12;
    case 'weekly': return (amount * 52) / 12;
    case 'annually': return amount / 12;
    case 'quarterly': return amount / 3;
    default: return amount;
  }
};

const FREQ_LABELS: Record<string, string> = {
  monthly: 'Monthly',
  'bi-weekly': 'Bi-weekly',
  weekly: 'Weekly',
  annually: 'Annual',
  quarterly: 'Quarterly',
};

export default function IncomeScreen() {
  const { data: income, isLoading } = useIncome();
  const deleteIncome = useDeleteIncome();

  const totalMonthly = (income ?? []).reduce(
    (s, i) => s + normalizeToMonthly(i.amount ?? 0, i.frequency),
    0
  );

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Income Source',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteIncome.mutate(id) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Income</Text>
          <Text style={styles.headerSub}>
            {(income ?? []).length} source{(income ?? []).length !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatLabel}>Monthly Total</Text>
            <Text style={[styles.headerStatValue, { color: colors.success }]}>
              {fmtCurrency(totalMonthly)}
            </Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />
      ) : (
        <FlatList
          data={income ?? []}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
          renderItem={({ item }) => {
            const monthly = normalizeToMonthly(item.amount ?? 0, item.frequency);
            return (
              <View style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  {item.employer && (
                    <Text style={styles.cardEmployer}>{item.employer}</Text>
                  )}
                  <Text style={styles.cardFreq}>
                    {FREQ_LABELS[item.frequency ?? ''] ?? item.frequency}
                  </Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={[styles.cardAmount, { color: colors.success }]}>
                    {fmtCurrency(item.amount ?? 0)}
                  </Text>
                  {item.frequency !== 'monthly' && (
                    <Text style={styles.cardMonthly}>{fmtCurrency(monthly)}/mo</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item.id, item.name)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>No income sources yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: 56,
    paddingBottom: spacing.md,
    backgroundColor: colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  headerTitle: { fontSize: typography.xl, fontWeight: typography.bold, color: colors.text },
  headerSub: { fontSize: typography.xs, color: colors.textMuted, marginTop: 2 },
  headerStats: { flexDirection: 'row' },
  headerStat: {},
  headerStatLabel: { fontSize: typography.xs, color: colors.textMuted },
  headerStatValue: { fontSize: typography.lg, fontWeight: typography.bold, color: colors.text },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: 10,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardName: { fontSize: typography.md, fontWeight: typography.semibold, color: colors.text },
  cardEmployer: { fontSize: typography.xs, color: colors.textSecondary, marginTop: 2 },
  cardFreq: { fontSize: typography.xs, color: colors.textMuted, marginTop: 2, textTransform: 'capitalize' },
  cardRight: { alignItems: 'flex-end', marginRight: spacing.sm },
  cardAmount: { fontSize: typography.md, fontWeight: typography.bold },
  cardMonthly: { fontSize: typography.xs, color: colors.textMuted, marginTop: 2 },
  deleteBtn: { padding: 4 },
  emptyState: { alignItems: 'center', paddingTop: 64, gap: spacing.sm },
  emptyText: { color: colors.textMuted, fontSize: typography.md },
});
