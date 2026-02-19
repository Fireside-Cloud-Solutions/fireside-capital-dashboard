import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../styles/theme';

export default function BudgetScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Budget</Text>
      </View>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Budget vs Actuals</Text>
        <Text style={styles.placeholderSub}>Coming soon — MOB-013</Text>
      </View>
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
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: typography.lg, fontWeight: typography.semibold, color: colors.text },
  placeholderSub: { fontSize: typography.sm, color: colors.textMuted, marginTop: spacing.sm },
});
