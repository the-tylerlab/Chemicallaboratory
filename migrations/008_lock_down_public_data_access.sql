-- ============================================================================
-- Migration: 008_lock_down_public_data_access.sql
-- Purpose: Keep database access behind the application API and its auth/RBAC.
-- Safety:  This migration changes privileges and policies only; it does not
--          insert, update, or delete application records.
-- ============================================================================

-- Tables used by the application. The conditional handling keeps this forward
-- migration safe for databases where optional modules have not been installed.
DO $$
DECLARE
  v_table TEXT;
  v_policy RECORD;
  v_tables TEXT[] := ARRAY[
    'users', 'items', 'bookings', 'transactions', 'purchase_orders',
    'audit_logs', 'system', 'schema_migrations', 'stock_movements',
    'stock_adjustments', 'equipment_maintenance_logs', 'equipment_repairs',
    'revoked_tokens', 'rate_limits', 'announcements'
  ];
BEGIN
  FOREACH v_table IN ARRAY v_tables LOOP
    IF to_regclass(format('public.%I', v_table)) IS NULL THEN
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', v_table);

    -- Remove permissive legacy policies before installing the restricted set.
    FOR v_policy IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = v_table
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', v_policy.policyname, v_table);
    END LOOP;

    EXECUTE format(
      'CREATE POLICY backend_service_role_all ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
      v_table
    );
  END LOOP;
END $$;

-- Strip client privileges from existing public-schema relations, then give the
-- trusted server role the access it needs. Table owners remain unaffected.
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, anon, authenticated;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Safe user directory views from older migrations must not be exposed directly;
-- the backend returns the filtered fields required by the UI.
DO $$
BEGIN
  IF to_regclass('public.user_directory') IS NOT NULL THEN
    REVOKE ALL PRIVILEGES ON public.user_directory FROM PUBLIC, anon, authenticated;
    GRANT SELECT ON public.user_directory TO service_role;
  END IF;
END $$;

-- Future public-schema objects must not acquire client access by default.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL PRIVILEGES ON TABLES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL PRIVILEGES ON SEQUENCES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO service_role;

INSERT INTO public.schema_migrations (version, name, applied_at)
VALUES ('008', 'lock_down_public_data_access', NOW())
ON CONFLICT (version) DO NOTHING;
