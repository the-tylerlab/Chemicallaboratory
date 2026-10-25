-- ============================================================================
-- Rollback Migration: 007_rollback_revoked_tokens.sql
-- Description: Safe Rollback for Migration 007 (revoked_tokens and rate_limits)
-- Safety: Drops ONLY the security metadata tables created in 007,
-- preserving users, inventory, bookings, and business data intact.
-- Target: Supabase (PostgreSQL)
-- ============================================================================

-- 1. Drop atomic rate limit function
DROP FUNCTION IF EXISTS public.increment_rate_limit(VARCHAR, BIGINT, INT);

-- 2. Drop rate_limits policy and table
DROP POLICY IF EXISTS rate_limits_service_role ON public.rate_limits;
DROP TABLE IF EXISTS public.rate_limits;

-- 3. Drop revoked_tokens policy and table
DROP POLICY IF EXISTS revoked_tokens_service_role ON public.revoked_tokens;
DROP TABLE IF EXISTS public.revoked_tokens;

-- 4. Revert schema migration entry
DELETE FROM public.schema_migrations WHERE version = '007';
