import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { colors, spacing, typography } from '../styles/theme';
import { useBills } from '../hooks/useFinancialData';

const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

const getDaysUntilDue = (dueDate: string | null) => {
  if (!dueDate) return 999;
  const diff = new Date(dueDate).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const getUrgencyColor = (days: number) => {
  if (days < 0) return colors.danger;
  if (days <= 3) return colors.danger;
  if (days <= 7) return colors.warning;
  return colors.success;
};

const getUrgencyLabel = (days: number) => {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `Due in ${days}d`;
};

export default function BillsScreen() {
  const { data: bills, isLoading } = useBills();
  const totalMonthly = (bills ?? []).reduce((s, b) => {
    if (b.frequency === 'monthly') return s + (b.amount ?? 0);
    if (b.frequency === 'bi-weekly') return s + ((b.amount ?? 0) * 26) / 12;
    if (b.frequency === 'annually') return s + (b.amount ?? 0) / 12;
    return s + (b.amount ?? 0);
  }, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bills</Text>
        <Text style={styles.headerSub}>{fmt(totalMonthly)}/mo</Text>
      </View>
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />
      ) : (
        <FlatList
          data={bills ?? []}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
          renderItem={({ item }) => {
            const days = getDaysUntilDue(item.nextDueDate);
            const urgencyColor = getUrgencyColor(days);
            return (
              <View style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardFreq}>{item.frequency}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.cardAmount}>{fmt(item.amount ?? 0)}</Text>
                  <View style={[styles.badge, { backgroundColor: `${urgencyColor}20`, borderColor: urgencyColor }]}>
                    <Text style={[styles.badgeText, { color: urgencyColor }]}>
                      {getUrgencyLabel(days)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 64 }}>
              <Text style={{ color: colors.textMuted, fontSize: typography.md }}>No active bills</Text>
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
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.md,
    backgroundColor: colors.backgroundCard, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: typography.xl, fontWeight: typography.bold, color: colors.text },
  headerSub: { fontSize: typography.md, color: colors.textSecondary },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.backgroundCard, borderRadius: 10, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  cardName: { fontSize: typography.md, fontWeight: typography.semibold, color: colors.text },
  cardFreq: { fontSize: typography.xs, color: colors.textMuted, textTransform: 'capitalize' },
  cardAmount: { fontSize: typography.md, fontWeight: typography.bold, color: colors.text },
  badge: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99, borderWidth: 1 },
  badgeText: { fontSize: typography.xs, fontWeight: typography.semibold },
});
