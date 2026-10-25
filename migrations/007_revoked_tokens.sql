-- ============================================================================
-- Migration: 007_revoked_tokens.sql
-- Description: Shared Token Revocation Store and Atomic Shared Rate Limiting
-- Author: SciPortal Security & Infrastructure
-- Target: Supabase (PostgreSQL)
-- ============================================================================

-- 1. Create revoked_tokens table
CREATE TABLE IF NOT EXISTS public.revoked_tokens (
  token_hash VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  reason VARCHAR(128) DEFAULT 'LOGOUT'
);

-- 2. Indexes on expires_at and user_id for efficient lookup and cleanup
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_expires_at ON public.revoked_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_user_id ON public.revoked_tokens(user_id);

-- 3. Add token_revoked_before timestamp to users if not exists (for whole-account revocation on password reset)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS token_revoked_before TIMESTAMPTZ;

-- 4. Enable Row Level Security (RLS) on revoked_tokens
ALTER TABLE public.revoked_tokens ENABLE ROW LEVEL SECURITY;

-- 5. Revocation table privileges: Strictly restricted to service_role (trusted backend)
REVOKE ALL ON public.revoked_tokens FROM anon, authenticated, public;
GRANT ALL ON public.revoked_tokens TO service_role;

DROP POLICY IF EXISTS revoked_tokens_service_role ON public.revoked_tokens;
CREATE POLICY revoked_tokens_service_role ON public.revoked_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 6. Shared Rate Limiting Table (for Multi-Instance DDoS / Brute-force protection)
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key VARCHAR(128) PRIMARY KEY,
  count INT NOT NULL DEFAULT 1,
  first_attempt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_attempt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  blocked_until TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_last_attempt ON public.rate_limits(last_attempt);

-- 7. Enable Row Level Security (RLS) on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- 8. Rate limits privileges: Strictly restricted to service_role (trusted backend)
REVOKE ALL ON public.rate_limits FROM anon, authenticated, public;
GRANT ALL ON public.rate_limits TO service_role;

DROP POLICY IF EXISTS rate_limits_service_role ON public.rate_limits;
CREATE POLICY rate_limits_service_role ON public.rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 9. Atomic Increment Function for Shared Rate Limiting (Prevents Race Conditions)
CREATE OR REPLACE FUNCTION public.increment_rate_limit(
  p_key VARCHAR(128),
  p_window_ms BIGINT,
  p_max_attempts INT
)
RETURNS TABLE (
  count INT,
  first_attempt TIMESTAMPTZ,
  last_attempt TIMESTAMPTZ,
  blocked_until TIMESTAMPTZ,
  allowed BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
  v_window_interval INTERVAL := (p_window_ms || ' milliseconds')::INTERVAL;
  v_rec public.rate_limits%ROWTYPE;
BEGIN
  INSERT INTO public.rate_limits (key, count, first_attempt, last_attempt, blocked_until)
  VALUES (p_key, 1, v_now, v_now, NULL)
  ON CONFLICT (key) DO UPDATE
  SET
    count = CASE
      WHEN v_now - rate_limits.first_attempt > v_window_interval THEN 1
      ELSE rate_limits.count + 1
    END,
    first_attempt = CASE
      WHEN v_now - rate_limits.first_attempt > v_window_interval THEN v_now
      ELSE rate_limits.first_attempt
    END,
    last_attempt = v_now,
    blocked_until = CASE
      WHEN (v_now - rate_limits.first_attempt <= v_window_interval) AND (rate_limits.count + 1 >= p_max_attempts)
        THEN v_now + v_window_interval
      ELSE rate_limits.blocked_until
    END
  RETURNING * INTO v_rec;

  RETURN QUERY SELECT
    v_rec.count,
    v_rec.first_attempt,
    v_rec.last_attempt,
    v_rec.blocked_until,
    (v_rec.blocked_until IS NULL OR v_rec.blocked_until <= v_now);
END;
$$;

REVOKE ALL ON FUNCTION public.increment_rate_limit(VARCHAR, BIGINT, INT) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.increment_rate_limit(VARCHAR, BIGINT, INT) TO service_role;

-- 10. Record migration in schema_migrations
INSERT INTO public.schema_migrations (version, name, applied_at)
VALUES ('007', 'revoked_tokens_and_shared_rate_limits', NOW())
ON CONFLICT (version) DO UPDATE SET applied_at = NOW();
