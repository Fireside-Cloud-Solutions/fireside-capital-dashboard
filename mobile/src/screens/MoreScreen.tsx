import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography } from '../styles/theme';
import { supabase } from '../services/supabase';

type RootStackParamList = {
  Main: undefined;
  Debts: undefined;
  Income: undefined;
  Login: undefined;
};

type NavProp = NativeStackNavigationProp<RootStackParamList>;

interface MoreItem {
  icon: string;
  label: string;
  onPress: () => void;
}

export default function MoreScreen() {
  const navigation = useNavigation<NavProp>();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const items: MoreItem[] = [
    {
      icon: 'trending-down-outline',
      label: 'Debts',
      onPress: () => navigation.navigate('Debts'),
    },
    {
      icon: 'wallet-outline',
      label: 'Income',
      onPress: () => navigation.navigate('Income'),
    },
    {
      icon: 'settings-outline',
      label: 'Settings',
      onPress: () => {},
    },
    {
      icon: 'log-out-outline',
      label: 'Sign Out',
      onPress: handleLogout,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More</Text>
      </View>
      <View style={styles.list}>
        {items.map((item, i) => (
          <TouchableOpacity key={i} style={styles.row} onPress={item.onPress}>
            <Ionicons name={item.icon as any} size={22} color={colors.primary} style={styles.rowIcon} />
            <Text style={styles.rowLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
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
  },
  headerTitle: { fontSize: typography.xl, fontWeight: typography.bold, color: colors.text },
  list: { paddingTop: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundCard,
  },
  rowIcon: { marginRight: spacing.md },
  rowLabel: { flex: 1, fontSize: typography.md, color: colors.text },
});
