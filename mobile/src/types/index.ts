export interface Asset {
  id: string;
  user_id: string;
  name: string;
  value: number;
  loan_balance?: number;
  equity?: number;
  created_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  name: string;
  balance: number;
  contributions?: number;
  returns?: number;
  created_at: string;
}

export interface Debt {
  id: string;
  user_id: string;
  name: string;
  balance: number;
  interest_rate?: number;
  monthly_payment?: number;
  created_at: string;
}

export interface Bill {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  frequency: string;
  due_date?: string;
  created_at: string;
}

export interface Income {
  id: string;
  user_id: string;
  source: string;
  amount: number;
  frequency: string;
  created_at: string;
}

export interface DashboardStats {
  netWorth: number;
  totalAssets: number;
  totalDebts: number;
  monthlyIncome: number;
  monthlyBills: number;
  netCashFlow: number;
}
