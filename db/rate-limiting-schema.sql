-- ===== RATE LIMITING SCHEMA =====
-- Secure, database-backed rate limiting to prevent abuse
-- Created: 2026-02-01

-- ===== RATE LIMITS TABLE =====
CREATE TABLE IF NOT EXISTS rate_limits (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, operation)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_op ON rate_limits(user_id, operation);

-- RLS policies
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own rate limits" ON rate_limits;
CREATE POLICY "Users can read own rate limits"
  ON rate_limits FOR SELECT
  USING (auth.uid() = user_id);

-- ===== RATE LIMIT CHECK FUNCTION =====
-- Returns TRUE if operation is allowed, FALSE if rate limited
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_operation TEXT,
  p_max_requests INTEGER,
  p_window_minutes INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_count INTEGER;
  v_window_start TIMESTAMPTZ;
BEGIN
  -- Get current rate limit record
  SELECT request_count, window_start
  INTO v_current_count, v_window_start
  FROM rate_limits
  WHERE user_id = p_user_id AND operation = p_operation;
  
  -- If no record exists, create one and allow
  IF NOT FOUND THEN
    INSERT INTO rate_limits (user_id, operation, request_count, window_start)
    VALUES (p_user_id, p_operation, 1, NOW());
    RETURN TRUE;
  END IF;
  
  -- Check if window has expired
  IF NOW() > v_window_start + (p_window_minutes || ' minutes')::INTERVAL THEN
    -- Reset window
    UPDATE rate_limits
    SET request_count = 1, window_start = NOW()
    WHERE user_id = p_user_id AND operation = p_operation;
    RETURN TRUE;
  END IF;
  
  -- Check if limit exceeded
  IF v_current_count >= p_max_requests THEN
    RETURN FALSE; -- Rate limit exceeded
  END IF;
  
  -- Increment counter and allow
  UPDATE rate_limits
  SET request_count = request_count + 1
  WHERE user_id = p_user_id AND operation = p_operation;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===== CLEANUP FUNCTION =====
-- Remove old rate limit records (run periodically)
CREATE OR REPLACE FUNCTION cleanup_rate_limits() RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits
  WHERE window_start < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===== GRANT PERMISSIONS =====
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON rate_limits TO authenticated;
GRANT EXECUTE ON FUNCTION check_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_rate_limits TO authenticated;
