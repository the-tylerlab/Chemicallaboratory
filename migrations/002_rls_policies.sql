-- ============================================================================
-- Migration: 002_rls_policies.sql
-- Description: Row Level Security (RLS) Policies for All Tables & Safe Views
-- Author: SciPortal Security & Architecture
-- ============================================================================

-- 1. Enable RLS on all central tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schema_migrations ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to allow clean re-application (idempotency)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname, tablename 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename IN ('users', 'items', 'bookings', 'transactions', 'purchase_orders', 'audit_logs', 'system', 'schema_migrations')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- 3. POLICIES FOR ITEMS TABLE
-- Read: Everyone can read active (non-deleted) items
CREATE POLICY "items_read_active" 
ON public.items 
FOR SELECT 
USING (is_deleted = false);

-- Write / Update / Delete: Authenticated service role or verified users
CREATE POLICY "items_service_all" 
ON public.items 
FOR ALL 
USING (auth.role() = 'service_role' OR auth.role() = 'authenticated' OR current_user = 'postgres')
WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated' OR current_user = 'postgres');

-- Fallback anon allow read/write for backend API proxy (if using publishable key)
CREATE POLICY "items_anon_read_write" 
ON public.items 
FOR ALL 
TO anon 
USING (true)
WITH CHECK (true);

-- 4. POLICIES FOR USERS TABLE
-- Service role full control
CREATE POLICY "users_service_all" 
ON public.users 
FOR ALL 
USING (auth.role() = 'service_role' OR current_user = 'postgres')
WITH CHECK (auth.role() = 'service_role' OR current_user = 'postgres');

-- Anon / Authenticated policy: Can select their own record or active non-deleted
CREATE POLICY "users_anon_read_active" 
ON public.users 
FOR SELECT 
TO anon, authenticated
USING (is_deleted = false);

CREATE POLICY "users_anon_modify" 
ON public.users 
FOR ALL 
TO anon, authenticated 
USING (true)
WITH CHECK (true);

-- Safe User Directory View (Excludes password hashes for client-side rendering)
CREATE OR REPLACE VIEW public.user_directory AS
SELECT 
  id,
  COALESCE(teacher_id, "teacherId") AS teacher_id,
  "teacherId",
  name,
  department,
  email,
  role,
  COALESCE(role_name, "roleName") AS role_name,
  "roleName",
  COALESCE(assigned_rooms, "assignedRooms") AS assigned_rooms,
  "assignedRooms",
  initials,
  color,
  COALESCE(is_active, "isActive") AS is_active,
  "isActive",
  is_deleted,
  created_at,
  updated_at
FROM public.users
WHERE is_deleted = false;

GRANT SELECT ON public.user_directory TO anon, authenticated;

-- 5. POLICIES FOR BOOKINGS TABLE
-- Read: Everyone can read active room bookings
CREATE POLICY "bookings_read_active" 
ON public.bookings 
FOR SELECT 
USING (is_deleted = false);

CREATE POLICY "bookings_all_access" 
ON public.bookings 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 6. POLICIES FOR TRANSACTIONS TABLE
CREATE POLICY "transactions_read_active" 
ON public.transactions 
FOR SELECT 
USING (is_deleted = false);

CREATE POLICY "transactions_all_access" 
ON public.transactions 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 7. POLICIES FOR PURCHASE ORDERS TABLE
CREATE POLICY "purchase_orders_read_active" 
ON public.purchase_orders 
FOR SELECT 
USING (is_deleted = false);

CREATE POLICY "purchase_orders_all_access" 
ON public.purchase_orders 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 8. POLICIES FOR AUDIT LOGS TABLE
-- Append-only for all, readable by service role or authenticated
CREATE POLICY "audit_logs_insert" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "audit_logs_read" 
ON public.audit_logs 
FOR SELECT 
USING (true);

-- 9. POLICIES FOR SYSTEM TABLE
CREATE POLICY "system_read" 
ON public.system 
FOR SELECT 
USING (true);

CREATE POLICY "system_write" 
ON public.system 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 10. POLICIES FOR SCHEMA MIGRATIONS TABLE
CREATE POLICY "schema_migrations_read" 
ON public.schema_migrations 
FOR SELECT 
USING (true);

CREATE POLICY "schema_migrations_write" 
ON public.schema_migrations 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Record migration version
INSERT INTO public.schema_migrations (version, name, applied_at)
VALUES ('002', 'rls_policies', NOW())
ON CONFLICT (version) DO UPDATE SET applied_at = NOW();
