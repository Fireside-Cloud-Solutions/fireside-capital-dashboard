-- =====================================================
-- FC-026: Data Import System - Database Schema
-- =====================================================
-- Description: Tables and policies for YNAB + CSV/XLSX import functionality
-- Author: Architect
-- Date: 2025-01-26
-- =====================================================

-- =====================================================
-- 1. IMPORT JOBS TABLE
-- =====================================================
-- Tracks all import operations (YNAB, CSV, XLSX)
-- Stores job status, progress, and error logs

CREATE TABLE IF NOT EXISTS import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Import metadata
  source TEXT NOT NULL CHECK (source IN ('ynab', 'csv', 'xlsx')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'complete', 'failed', 'cancelled')),
  
  -- Progress tracking
  total_rows INTEGER,
  successful_rows INTEGER DEFAULT 0,
  failed_rows INTEGER DEFAULT 0,
  
  -- Error and metadata storage
  error_log JSONB DEFAULT '[]'::jsonb,
  -- error_log structure: [{ "row": 42, "field": "amount", "error": "Invalid number format", "value": "abc" }]
  
  metadata JSONB DEFAULT '{}'::jsonb,
  -- metadata structure for CSV/XLSX: { "filename": "transactions.csv", "file_size": 2048, "original_columns": [...] }
  -- metadata structure for YNAB: { "ynab_budget_id": "...", "ynab_budget_name": "My Budget", "date_range": {...} }
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Index for user queries
CREATE INDEX IF NOT EXISTS idx_import_jobs_user_id ON import_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_import_jobs_status ON import_jobs(status);
CREATE INDEX IF NOT EXISTS idx_import_jobs_created_at ON import_jobs(created_at DESC);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_import_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_import_jobs_updated_at
  BEFORE UPDATE ON import_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_import_jobs_updated_at();

-- =====================================================
-- 2. IMPORT MAPPINGS TABLE
-- =====================================================
-- Stores user-defined column mappings for reuse
-- Example: User's "Chase Bank CSV" mapping saved for future imports

CREATE TABLE IF NOT EXISTS import_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Mapping identification
  mapping_name TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('csv', 'xlsx')),
  
  -- Column mapping configuration
  column_map JSONB NOT NULL,
  -- column_map structure: { "Date": "date", "Vendor": "merchant_name", "Amount": "amount", "Category": "category" }
  
  -- Additional mapping settings
  settings JSONB DEFAULT '{}'::jsonb,
  -- settings structure: { "skip_first_row": true, "date_format": "MM/DD/YYYY", "amount_is_negative": false }
  
  -- Usage tracking
  last_used_at TIMESTAMPTZ,
  use_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user queries
CREATE INDEX IF NOT EXISTS idx_import_mappings_user_id ON import_mappings(user_id);
CREATE INDEX IF NOT EXISTS idx_import_mappings_source_type ON import_mappings(source_type);

-- Ensure unique mapping names per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_import_mappings_unique_name 
  ON import_mappings(user_id, mapping_name);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_import_mappings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_import_mappings_updated_at
  BEFORE UPDATE ON import_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_import_mappings_updated_at();

-- =====================================================
-- 3. USER OAUTH TOKENS TABLE
-- =====================================================
-- Stores encrypted OAuth tokens for external services (YNAB, etc.)
-- Security: tokens are encrypted at rest, never exposed to frontend

CREATE TABLE IF NOT EXISTS user_oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Service identification
  service TEXT NOT NULL CHECK (service IN ('ynab')),
  
  -- OAuth credentials (encrypted)
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT DEFAULT 'Bearer',
  
  -- Token expiration
  expires_at TIMESTAMPTZ,
  
  -- Service-specific metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  -- metadata structure for YNAB: { "budget_id": "...", "budget_name": "..." }
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- Ensure one token per user per service
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_oauth_tokens_unique 
  ON user_oauth_tokens(user_id, service);

-- Index for token refresh queries
CREATE INDEX IF NOT EXISTS idx_user_oauth_tokens_expires_at ON user_oauth_tokens(expires_at);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_oauth_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_oauth_tokens_updated_at
  BEFORE UPDATE ON user_oauth_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_user_oauth_tokens_updated_at();

-- =====================================================
-- 4. ROW-LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_oauth_tokens ENABLE ROW LEVEL SECURITY;

-- Import Jobs Policies
CREATE POLICY "Users can view their own import jobs"
  ON import_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own import jobs"
  ON import_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own import jobs"
  ON import_jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own import jobs"
  ON import_jobs FOR DELETE
  USING (auth.uid() = user_id);

-- Import Mappings Policies
CREATE POLICY "Users can view their own import mappings"
  ON import_mappings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own import mappings"
  ON import_mappings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own import mappings"
  ON import_mappings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own import mappings"
  ON import_mappings FOR DELETE
  USING (auth.uid() = user_id);

-- OAuth Tokens Policies
CREATE POLICY "Users can view their own oauth tokens"
  ON user_oauth_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own oauth tokens"
  ON user_oauth_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own oauth tokens"
  ON user_oauth_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own oauth tokens"
  ON user_oauth_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 5. HELPER FUNCTIONS
-- =====================================================

-- Function to clean up old completed import jobs (retention: 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_import_jobs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM import_jobs
  WHERE status IN ('complete', 'failed', 'cancelled')
    AND created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update import mapping usage stats
CREATE OR REPLACE FUNCTION record_mapping_usage(mapping_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE import_mappings
  SET use_count = use_count + 1,
      last_used_at = NOW()
  WHERE id = mapping_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE import_jobs IS 'Tracks all data import operations from YNAB, CSV, or XLSX sources';
COMMENT ON TABLE import_mappings IS 'Stores user-defined column mappings for CSV/XLSX imports';
COMMENT ON TABLE user_oauth_tokens IS 'Stores encrypted OAuth tokens for external services (YNAB)';

COMMENT ON COLUMN import_jobs.error_log IS 'JSONB array of error objects with row number, field, error message, and value';
COMMENT ON COLUMN import_jobs.metadata IS 'Source-specific metadata (filename for CSV/XLSX, budget info for YNAB)';
COMMENT ON COLUMN import_mappings.column_map IS 'Maps source column names to Fireside Capital database fields';
COMMENT ON COLUMN import_mappings.settings IS 'Additional import settings like date format, skip rows, etc.';
COMMENT ON COLUMN user_oauth_tokens.access_token IS 'Encrypted OAuth access token (should be encrypted at application layer)';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
