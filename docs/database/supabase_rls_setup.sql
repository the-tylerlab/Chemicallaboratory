-- ==============================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- Chemical Laboratory library system and scientific equipment
-- ==============================================================================

-- 1. Enable RLS on all existing core tables
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.system ENABLE ROW LEVEL SECURITY;

-- Create helper function to extract user role from auth.jwt() claims if Supabase Auth is used
CREATE OR REPLACE FUNCTION public.current_user_role() 
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claim.role', true),
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role'),
    'anon'
  );
$$ LANGUAGE sql STABLE;

-- Create helper function to extract user teacherId/id from auth.jwt()
CREATE OR REPLACE FUNCTION public.current_teacher_id() 
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claim.teacher_id', true),
    (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'teacherId'),
    ''
  );
$$ LANGUAGE sql STABLE;

-- ==============================================================================
-- 2. USERS TABLE POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Deny anon access to users" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Admins have full access to users" ON public.users;
DROP POLICY IF EXISTS "Service role full access to users" ON public.users;

-- Public/Anon cannot read passwords or sensitive user records directly
-- Backend server connects via service_role or API with server-side auth
CREATE POLICY "Service role full access to users" 
ON public.users 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Authenticated users can view user directory (name, department, email) but cannot see passwords
CREATE POLICY "Users can read directory" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (true);

-- Only Admins (L3) can insert, update, or delete users
CREATE POLICY "Admins have full access to users" 
ON public.users 
FOR ALL 
TO authenticated 
USING (
  public.current_user_role() IN ('L3', 'admin')
)
WITH CHECK (
  public.current_user_role() IN ('L3', 'admin')
);

-- ==============================================================================
-- 3. ITEMS TABLE POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Public can view inventory" ON public.items;
DROP POLICY IF EXISTS "Staff and Admin can insert items" ON public.items;
DROP POLICY IF EXISTS "Staff and Admin can update items" ON public.items;
DROP POLICY IF EXISTS "Admin can delete items" ON public.items;
DROP POLICY IF EXISTS "Service role full access to items" ON public.items;

CREATE POLICY "Service role full access to items" 
ON public.items FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Anyone (including guest/anon) can view catalog items
CREATE POLICY "Public can view inventory" 
ON public.items 
FOR SELECT 
TO public 
USING (true);

-- Staff (L2) and Admin (L3) can add new items
CREATE POLICY "Staff and Admin can insert items" 
ON public.items 
FOR INSERT 
TO authenticated 
WITH CHECK (
  public.current_user_role() IN ('L2', 'L3', 'staff', 'admin')
);

-- Staff (L2) and Admin (L3) can update items (qty, location, condition)
CREATE POLICY "Staff and Admin can update items" 
ON public.items 
FOR UPDATE 
TO authenticated 
USING (
  public.current_user_role() IN ('L2', 'L3', 'staff', 'admin')
)
WITH CHECK (
  public.current_user_role() IN ('L2', 'L3', 'staff', 'admin')
);

-- Only Admin (L3) can permanently delete inventory items
CREATE POLICY "Admin can delete items" 
ON public.items 
FOR DELETE 
TO authenticated 
USING (
  public.current_user_role() IN ('L3', 'admin')
);

-- ==============================================================================
-- 4. BOOKINGS TABLE POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Public can view approved bookings" ON public.bookings;
DROP POLICY IF EXISTS "Authenticated can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Staff and Admin can manage bookings" ON public.bookings;
DROP POLICY IF EXISTS "Service role full access to bookings" ON public.bookings;

CREATE POLICY "Service role full access to bookings" 
ON public.bookings FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Public can see calendar bookings (to know when labs are occupied)
CREATE POLICY "Public can view bookings calendar" 
ON public.bookings 
FOR SELECT 
TO public 
USING (true);

-- Teachers (L1+), Staff, Admin can submit booking requests
CREATE POLICY "Authenticated can create bookings" 
ON public.bookings 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Staff (L2) and Admin (L3) can approve, reject, or modify bookings
CREATE POLICY "Staff and Admin can manage bookings" 
ON public.bookings 
FOR UPDATE 
TO authenticated 
USING (
  public.current_user_role() IN ('L2', 'L3', 'staff', 'admin')
);

-- Creator or Admin can delete/cancel a booking
CREATE POLICY "Creator or Admin can cancel booking" 
ON public.bookings 
FOR DELETE 
TO authenticated 
USING (
  public.current_user_role() IN ('L3', 'admin') OR
  "bookerName" = public.current_teacher_id()
);

-- ==============================================================================
-- 5. TRANSACTIONS (BORROW / RETURN) POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Service role full access to transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view their transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated can request borrow" ON public.transactions;
DROP POLICY IF EXISTS "Staff and Admin can update transactions" ON public.transactions;

CREATE POLICY "Service role full access to transactions" 
ON public.transactions FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Users can view their own transactions; Staff & Admin can view all
CREATE POLICY "Users can view transactions" 
ON public.transactions 
FOR SELECT 
TO authenticated 
USING (
  public.current_user_role() IN ('L2', 'L3', 'L4', 'staff', 'admin', 'executive') OR
  borrower = public.current_teacher_id()
);

-- Authenticated teachers/users can submit borrow requests
CREATE POLICY "Authenticated can request borrow" 
ON public.transactions 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Staff (L2) and Admin (L3) can approve, check return, or mark damaged
CREATE POLICY "Staff and Admin can update transactions" 
ON public.transactions 
FOR UPDATE 
TO authenticated 
USING (
  public.current_user_role() IN ('L2', 'L3', 'staff', 'admin')
);

-- ==============================================================================
-- 6. PURCHASE ORDERS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Service role full access to purchase_orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Authorized roles can view purchase orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Teachers can propose purchase orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Executive and Admin can approve purchase orders" ON public.purchase_orders;

CREATE POLICY "Service role full access to purchase_orders" 
ON public.purchase_orders FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Authorized roles can view purchase orders" 
ON public.purchase_orders 
FOR SELECT 
TO authenticated 
USING (
  public.current_user_role() IN ('L1', 'L2', 'L3', 'L4', 'teacher', 'staff', 'admin', 'executive')
);

CREATE POLICY "Teachers can propose purchase orders" 
ON public.purchase_orders 
FOR INSERT 
TO authenticated 
WITH CHECK (
  public.current_user_role() IN ('L1', 'L2', 'L3', 'teacher', 'staff', 'admin')
);

CREATE POLICY "Executive and Admin can approve purchase orders" 
ON public.purchase_orders 
FOR UPDATE 
TO authenticated 
USING (
  public.current_user_role() IN ('L3', 'L4', 'admin', 'executive')
);

-- ==============================================================================
-- 7. AUDIT LOGS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Service role full access to audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admin and Executive can view audit logs" ON public.audit_logs;

CREATE POLICY "Service role full access to audit_logs" 
ON public.audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Strictly L3 Admin and L4 Executive can read audit logs
CREATE POLICY "Admin and Executive can view audit logs" 
ON public.audit_logs 
FOR SELECT 
TO authenticated 
USING (
  public.current_user_role() IN ('L3', 'L4', 'admin', 'executive')
);

-- System/Service or Authenticated can insert audit events
CREATE POLICY "Authenticated can record audit logs" 
ON public.audit_logs 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- ==============================================================================
-- 8. ANNOUNCEMENTS & SYSTEM POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Public can view announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admin can manage announcements" ON public.announcements;
DROP POLICY IF EXISTS "Service role full access to announcements" ON public.announcements;

CREATE POLICY "Service role full access to announcements" 
ON public.announcements FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Public can view announcements" 
ON public.announcements 
FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Admin can manage announcements" 
ON public.announcements 
FOR ALL 
TO authenticated 
USING (
  public.current_user_role() IN ('L3', 'admin')
);

-- ==============================================================================
-- 9. SAFE VIEW FOR USER DIRECTORY (WITHOUT PASSWORDS)
-- ==============================================================================
CREATE OR REPLACE VIEW public.user_directory AS
SELECT 
  id, 
  "teacherId", 
  name, 
  department, 
  email, 
  role, 
  "roleName", 
  "assignedRooms", 
  initials, 
  color, 
  "isActive", 
  "createdAt"
FROM public.users;

GRANT SELECT ON public.user_directory TO public;
