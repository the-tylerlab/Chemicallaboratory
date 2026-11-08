-- Restore backend access to the shared login rate-limit store.
-- This changes only table privileges and RLS policy; it does not touch data.
-- Client roles remain denied.

DO $$
BEGIN
  IF to_regclass('public.rate_limits') IS NULL THEN
    RAISE EXCEPTION 'Required table public.rate_limits is missing; apply migration 007 first';
  END IF;
END $$;

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE public.rate_limits FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.rate_limits TO service_role;

DROP POLICY IF EXISTS rate_limits_service_role ON public.rate_limits;
DROP POLICY IF EXISTS backend_service_role_all ON public.rate_limits;
CREATE POLICY rate_limits_service_role ON public.rate_limits
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

REVOKE ALL ON FUNCTION public.increment_rate_limit(VARCHAR, BIGINT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_rate_limit(VARCHAR, BIGINT, INT) TO service_role;
