-- ============================================================================
-- Migration: 008_least_privilege_writes.sql
-- Restrict direct client writes; the trusted backend uses service_role.
-- No table or data changes are performed by this migration.
-- ============================================================================

-- Remove policies that granted direct client writes broadly.
DROP POLICY IF EXISTS "items_anon_read_write" ON public.items;
DROP POLICY IF EXISTS "users_anon_modify" ON public.users;
DROP POLICY IF EXISTS "bookings_all_access" ON public.bookings;
DROP POLICY IF EXISTS "transactions_all_access" ON public.transactions;
DROP POLICY IF EXISTS "purchase_orders_all_access" ON public.purchase_orders;
DROP POLICY IF EXISTS "audit_logs_insert" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_read" ON public.audit_logs;
DROP POLICY IF EXISTS "system_write" ON public.system;
DROP POLICY IF EXISTS "schema_migrations_write" ON public.schema_migrations;

-- Do not expose password hashes through direct table reads. The API and the
-- password-free user_directory view remain the supported client interfaces.
DROP POLICY IF EXISTS "users_anon_read_active" ON public.users;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.users FROM anon, authenticated, PUBLIC;
GRANT ALL ON public.users TO service_role;

-- Client roles retain existing read access where the application requires it,
-- but only the trusted backend may mutate these records.
REVOKE INSERT, UPDATE, DELETE ON public.items, public.bookings, public.transactions,
  public.purchase_orders, public.audit_logs, public.system, public.schema_migrations
  FROM anon, authenticated, PUBLIC;
GRANT INSERT, UPDATE, DELETE ON public.items, public.bookings, public.transactions,
  public.purchase_orders, public.audit_logs, public.system, public.schema_migrations
  TO service_role;

-- Ensure the audited service-role path is represented explicitly in RLS too.
DROP POLICY IF EXISTS "items_service_all" ON public.items;
CREATE POLICY "items_service_all" ON public.items FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "users_service_all" ON public.users;
CREATE POLICY "users_service_all" ON public.users FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "bookings_service_all" ON public.bookings;
CREATE POLICY "bookings_service_all" ON public.bookings FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "transactions_service_all" ON public.transactions;
CREATE POLICY "transactions_service_all" ON public.transactions FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "purchase_orders_service_all" ON public.purchase_orders;
CREATE POLICY "purchase_orders_service_all" ON public.purchase_orders FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "audit_logs_service_all" ON public.audit_logs;
CREATE POLICY "audit_logs_service_all" ON public.audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "system_service_all" ON public.system;
CREATE POLICY "system_service_all" ON public.system FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "schema_migrations_service_all" ON public.schema_migrations;
CREATE POLICY "schema_migrations_service_all" ON public.schema_migrations FOR ALL TO service_role USING (true) WITH CHECK (true);

INSERT INTO public.schema_migrations (version, name, applied_at)
VALUES ('008', 'least_privilege_writes', NOW())
ON CONFLICT (version) DO UPDATE SET applied_at = NOW();
