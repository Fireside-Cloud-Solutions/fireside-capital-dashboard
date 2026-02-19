import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../styles/theme';
import { useDebts, useDeleteDebt } from '../hooks/useFinancialData';

const fmtCurrency = (n: number) => `$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
const fmtPct = (n: number) => `${n.toFixed(2)}%`;

export default function DebtsScreen() {
  const { data: debts, isLoading } = useDebts();
  const deleteDebt = useDeleteDebt();

  const totalBalance = (debts ?? []).reduce((s, d) => s + (d.balance ?? 0), 0);
  const totalMonthly = (debts ?? []).reduce((s, d) => s + (d.monthly_payment ?? 0), 0);

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Debt',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteDebt.mutate(id) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Debts</Text>
          <Text style={styles.headerSub}>
            {(debts ?? []).length} account{(debts ?? []).length !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatLabel}>Total Balance</Text>
            <Text style={[styles.headerStatValue, { color: colors.danger }]}>{fmtCurrency(totalBalance)}</Text>
          </View>
          <View style={[styles.headerStat, { marginLeft: spacing.lg }]}>
            <Text style={styles.headerStatLabel}>Monthly</Text>
            <Text style={styles.headerStatValue}>{fmtCurrency(totalMonthly)}</Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />
      ) : (
        <FlatList
          data={debts ?? []}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardName}>{item.name}</Text>
                {item.interest_rate != null && (
                  <Text style={styles.cardRate}>{fmtPct(item.interest_rate)} APR</Text>
                )}
              </View>
              <View style={styles.cardRight}>
                <Text style={[styles.cardBalance, { color: colors.danger }]}>
                  {fmtCurrency(item.balance ?? 0)}
                </Text>
                {item.monthly_payment != null && (
                  <Text style={styles.cardPayment}>{fmtCurrency(item.monthly_payment)}/mo</Text>
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
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="trending-down-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>No debts — great work!</Text>
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
  cardRate: { fontSize: typography.xs, color: colors.textMuted, marginTop: 2 },
  cardRight: { alignItems: 'flex-end', marginRight: spacing.sm },
  cardBalance: { fontSize: typography.md, fontWeight: typography.bold },
  cardPayment: { fontSize: typography.xs, color: colors.textMuted, marginTop: 2 },
  deleteBtn: { padding: 4 },
  emptyState: { alignItems: 'center', paddingTop: 64, gap: spacing.sm },
  emptyText: { color: colors.textMuted, fontSize: typography.md },
});
