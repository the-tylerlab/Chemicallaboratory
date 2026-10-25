-- ============================================================================
-- Migration: 007_revoked_tokens.sql
-- Description: Shared Token Revocation Store for Multi-Instance / Serverless Architectures
-- Author: SciPortal Security & Infrastructure
-- ============================================================================

-- 1. Create revoked_tokens table
CREATE TABLE IF NOT EXISTS public.revoked_tokens (
  token_hash VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  reason VARCHAR(128) DEFAULT 'LOGOUT'
);

-- 2. Index on expires_at for efficient cleanup and lookup
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_expires_at ON public.revoked_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_user_id ON public.revoked_tokens(user_id);

-- 3. Add token_revoked_before timestamp to users if not exists (for whole-account revocation on password reset)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS token_revoked_before TIMESTAMPTZ;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.revoked_tokens ENABLE ROW LEVEL SECURITY;

-- 5. Revocation table policy: Service role full access, anon cannot read/write directly
DROP POLICY IF EXISTS revoked_tokens_service_role ON public.revoked_tokens;
CREATE POLICY revoked_tokens_service_role ON public.revoked_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 6. Record migration in schema_migrations
INSERT INTO public.schema_migrations (version, name, applied_at)
VALUES ('007', 'revoked_tokens', NOW())
ON CONFLICT (version) DO UPDATE SET applied_at = NOW();
