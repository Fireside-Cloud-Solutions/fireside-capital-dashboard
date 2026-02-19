import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../styles/theme';
import { useAssets, useDeleteAsset } from '../hooks/useFinancialData';

const fmtCurrency = (n: number) => `$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
const fmtCurrencyRound = (n: number) => `$${Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

export default function AssetsScreen() {
  const { data: assets, isLoading } = useAssets();
  const deleteAsset = useDeleteAsset();

  const totalValue = (assets ?? []).reduce((s, a) => s + (a.value ?? 0), 0);
  const totalEquity = (assets ?? []).reduce((s, a) => s + (a.value ?? 0) - (a.loan_balance ?? 0), 0);

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Asset',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAsset.mutate(id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Assets</Text>
          <Text style={styles.headerSub}>
            {(assets ?? []).length} asset{(assets ?? []).length !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatLabel}>Total Value</Text>
            <Text style={styles.headerStatValue}>{fmtCurrencyRound(totalValue)}</Text>
          </View>
          <View style={[styles.headerStat, { marginLeft: spacing.lg }]}>
            <Text style={styles.headerStatLabel}>Equity</Text>
            <Text style={[styles.headerStatValue, { color: colors.success }]}>
              {fmtCurrencyRound(totalEquity)}
            </Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />
      ) : (
        <FlatList
          data={assets ?? []}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
          renderItem={({ item }) => {
            const equity = (item.value ?? 0) - (item.loan_balance ?? 0);
            return (
              <View style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardType}>{item.type ?? 'Asset'}</Text>
                  {item.loan_balance != null && item.loan_balance > 0 && (
                    <Text style={styles.cardLoan}>Loan: {fmtCurrency(item.loan_balance)}</Text>
                  )}
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.cardValue}>{fmtCurrency(item.value ?? 0)}</Text>
                  <Text style={[styles.cardEquity, { color: equity >= 0 ? colors.success : colors.danger }]}>
                    Equity: {fmtCurrency(equity)}
                  </Text>
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
              <Ionicons name="home-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>No assets yet</Text>
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
  cardType: { fontSize: typography.xs, color: colors.textMuted, textTransform: 'capitalize', marginTop: 2 },
  cardLoan: { fontSize: typography.xs, color: colors.warning, marginTop: 2 },
  cardRight: { alignItems: 'flex-end', marginRight: spacing.sm },
  cardValue: { fontSize: typography.md, fontWeight: typography.bold, color: colors.text },
  cardEquity: { fontSize: typography.xs, marginTop: 2 },
  deleteBtn: { padding: 4 },
  emptyState: { alignItems: 'center', paddingTop: 64, gap: spacing.sm },
  emptyText: { color: colors.textMuted, fontSize: typography.md },
});
