import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, type Asset, type Bill, type Debt, type Income, type Investment } from '../services/supabase';

// ─── Assets ───────────────────────────────────────────────────────────

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

// ─── Bills ───────────────────────────────────────────────────────────

export function useBills() {
  return useQuery({
    queryKey: ['bills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .not('status', 'eq', 'paid_off')
        .order('nextDueDate', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useUpcomingBills(days: number = 7) {
  return useQuery({
    queryKey: ['bills', 'upcoming', days],
    queryFn: async () => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() + days);
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .lte('nextDueDate', cutoff.toISOString())
        .not('status', 'eq', 'paid_off')
        .order('nextDueDate', { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 60 * 1000,
  });
}

export function useDeleteBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('bills').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bills'] }),
  });
}

// ─── Debts ───────────────────────────────────────────────────────────

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

export function useDeleteDebt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('debts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['debts'] }),
  });
}

// ─── Income ───────────────────────────────────────────────────────────

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

export function useDeleteIncome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('income').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['income'] }),
  });
}

// ─── Investments ───────────────────────────────────────────────────────

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

// ─── Dashboard aggregate ────────────────────────────────────────────────

function normalizeToMonthly(amount: number, frequency: string): number {
  switch (frequency) {
    case 'monthly': return amount;
    case 'bi-weekly': return (amount * 26) / 12;
    case 'weekly': return (amount * 52) / 12;
    case 'annually': return amount / 12;
    case 'quarterly': return amount / 3;
    default: return amount;
  }
}

export function useDashboardStats() {
  const assets = useAssets();
  const debts = useDebts();
  const bills = useBills();
  const income = useIncome();
  const investments = useInvestments();

  const queries = [assets, debts, bills, income, investments];
  const isLoading = queries.some(q => q.isLoading);
  const isError = queries.some(q => q.isError);

  if (isLoading || isError) {
    return { isLoading, isError, stats: null };
  }

  const assetValue = (assets.data ?? []).reduce((s, a) => s + (a.value ?? 0), 0);
  const investmentValue = (investments.data ?? []).reduce((s, i) => s + (i.balance ?? 0), 0);
  const totalAssets = assetValue + investmentValue;
  const totalDebts = (debts.data ?? []).reduce((s, d) => s + (d.balance ?? 0), 0);
  const netWorth = totalAssets - totalDebts;

  const monthlyIncome = (income.data ?? []).reduce(
    (s, i) => s + normalizeToMonthly(i.amount ?? 0, i.frequency),
    0
  );

  const monthlyBills = (bills.data ?? []).reduce(
    (s, b) => s + normalizeToMonthly(b.amount ?? 0, b.frequency),
    0
  );

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
