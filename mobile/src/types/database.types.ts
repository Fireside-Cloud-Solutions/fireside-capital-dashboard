// Auto-generated types for Fireside Capital Supabase schema
// Project: qqtiofdqplwycnwplmen
// Generated: 2026-02-19 (manual — based on known schema)

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      assets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string | null;
          value: number;
          loan_balance: number | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type?: string | null;
          value: number;
          loan_balance?: number | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: string | null;
          value?: number;
          loan_balance?: number | null;
          updated_at?: string | null;
        };
      };
      investments: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          account_type: string | null;
          balance: number;
          contributions: number | null;
          returns: number | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          account_type?: string | null;
          balance: number;
          contributions?: number | null;
          returns?: number | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          account_type?: string | null;
          balance?: number;
          contributions?: number | null;
          returns?: number | null;
          updated_at?: string | null;
        };
      };
      debts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string | null;
          balance: number;
          interest_rate: number | null;
          minimum_payment: number | null;
          loan_term: number | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type?: string | null;
          balance: number;
          interest_rate?: number | null;
          minimum_payment?: number | null;
          loan_term?: number | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: string | null;
          balance?: number;
          interest_rate?: number | null;
          minimum_payment?: number | null;
          loan_term?: number | null;
          updated_at?: string | null;
        };
      };
      bills: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          amount: number;
          frequency: string;
          due_date: string | null;
          nextDueDate: string | null;
          status: string | null;
          category: string | null;
          is_shared: boolean | null;
          source: string | null;
          external_id: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          amount: number;
          frequency: string;
          due_date?: string | null;
          nextDueDate?: string | null;
          status?: string | null;
          category?: string | null;
          is_shared?: boolean | null;
          source?: string | null;
          external_id?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          amount?: number;
          frequency?: string;
          due_date?: string | null;
          nextDueDate?: string | null;
          status?: string | null;
          category?: string | null;
          is_shared?: boolean | null;
          source?: string | null;
          external_id?: string | null;
          updated_at?: string | null;
        };
      };
      income: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string | null;
          amount: number;
          frequency: string;
          start_date: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type?: string | null;
          amount: number;
          frequency: string;
          start_date?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: string | null;
          amount?: number;
          frequency?: string;
          start_date?: string | null;
          updated_at?: string | null;
        };
      };
      snapshots: {
        Row: {
          id: string;
          user_id: string;
          net_worth: number;
          total_assets: number | null;
          total_debts: number | null;
          snapshot_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          net_worth: number;
          total_assets?: number | null;
          total_debts?: number | null;
          snapshot_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          net_worth?: number;
          total_assets?: number | null;
          total_debts?: number | null;
          snapshot_date?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string | null;
          amount: number;
          month: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category?: string | null;
          amount: number;
          month?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          category?: string | null;
          amount?: number;
          month?: string | null;
          updated_at?: string | null;
        };
      };
      settings: {
        Row: {
          id: string;
          user_id: string;
          emergency_fund_goal: number | null;
          current_balance: number | null;
          safety_buffer: number | null;
          category_budgets: Json | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          emergency_fund_goal?: number | null;
          current_balance?: number | null;
          safety_buffer?: number | null;
          category_budgets?: Json | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          emergency_fund_goal?: number | null;
          current_balance?: number | null;
          safety_buffer?: number | null;
          category_budgets?: Json | null;
          updated_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
