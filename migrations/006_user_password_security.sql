-- ============================================================================
-- Migration: 006_user_password_security.sql
-- Description: Mandatory Password Change Flag & Password Lifecycle Timestamps
-- Author: SciPortal Security & Audit
-- ============================================================================

-- 1. Add password security columns to public.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;

-- 2. Enforce must_change_password on all active users
UPDATE public.users 
SET must_change_password = true,
    "mustChangePassword" = true,
    updated_at = NOW(),
    updated_by = 'migration_006_security'
WHERE is_deleted = false;

-- 3. Update view definition for safe user directory (ensuring password columns remain masked)
CREATE OR REPLACE VIEW public.user_directory AS
SELECT 
  id,
  COALESCE(teacher_id, "teacherId") as "teacherId",
  name,
  department,
  email,
  role,
  COALESCE(role_name, "roleName") as "roleName",
  COALESCE(assigned_rooms, "assignedRooms") as "assignedRooms",
  initials,
  color,
  COALESCE(is_active, "isActive") as "isActive",
  must_change_password,
  created_at
FROM public.users
WHERE is_deleted = false;

-- 4. Record migration version
INSERT INTO public.schema_migrations (version, name, applied_at)
VALUES ('006', 'user_password_security', NOW())
ON CONFLICT (version) DO UPDATE SET applied_at = NOW();
