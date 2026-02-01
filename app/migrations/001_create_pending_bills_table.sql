-- Migration: Create pending_bills table for Gmail bill integration
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS pending_bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  due_date DATE,
  category TEXT,
  confidence NUMERIC(3, 2),
  source_email_id TEXT,
  email_subject TEXT,
  email_snippet TEXT,
  status TEXT DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pending_bills_user ON pending_bills(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_bills_status ON pending_bills(status);
CREATE INDEX IF NOT EXISTS idx_pending_bills_created ON pending_bills(created_at DESC);

-- Row Level Security (RLS) — users can only see their own pending bills
ALTER TABLE pending_bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pending bills"
  ON pending_bills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pending bills"
  ON pending_bills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending bills"
  ON pending_bills FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pending bills"
  ON pending_bills FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pending_bills_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pending_bills_updated_at
  BEFORE UPDATE ON pending_bills
  FOR EACH ROW
  EXECUTE FUNCTION update_pending_bills_updated_at();

-- Migration complete
-- Run this SQL in Supabase dashboard > SQL Editor
