-- ============================================================================
-- Rollback Migration: rollback_007_revoked_tokens.sql
-- Description: Clean Rollback for 007_revoked_tokens.sql
-- Target: Supabase (PostgreSQL)
-- ============================================================================

DROP POLICY IF EXISTS rate_limits_service_role ON public.rate_limits;
DROP TABLE IF EXISTS public.rate_limits CASCADE;

DROP POLICY IF EXISTS revoked_tokens_service_role ON public.revoked_tokens;
DROP TABLE IF EXISTS public.revoked_tokens CASCADE;

DELETE FROM public.schema_migrations WHERE version = '007';
