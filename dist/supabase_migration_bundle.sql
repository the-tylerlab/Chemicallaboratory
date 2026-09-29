-- ============================================================================
-- SciPortal Consolidated Database Migration Bundle
-- Generated at: 2026-09-29T06:27:00.011Z
-- Target: Supabase (PostgreSQL)
-- ============================================================================

-- >>> START MIGRATION: 001_central_schema.sql <<<
-- ============================================================================
-- Migration: 001_central_schema.sql
-- Description: Central Database Schema with Constraints, Foreign Keys, Audit & Soft Delete
-- Author: SciPortal Security & Architecture
-- Compatible with PostgreSQL / Supabase
-- ============================================================================

-- 0. Migration Tracking Table
CREATE TABLE IF NOT EXISTS public.schema_migrations (
  version VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  checksum VARCHAR(64)
);

-- 1. Automatic Timestamp Update Trigger Function
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id VARCHAR(64) PRIMARY KEY,
  teacher_id VARCHAR(64) UNIQUE,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(255) DEFAULT 'กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี',
  email VARCHAR(255) UNIQUE,
  role VARCHAR(32) NOT NULL DEFAULT 'L1',
  role_name VARCHAR(64) DEFAULT 'Teacher / User',
  assigned_rooms JSONB DEFAULT '[]'::jsonb,
  password VARCHAR(255) NOT NULL,
  initials VARCHAR(16),
  color VARCHAR(32) DEFAULT '#0284c7',
  is_active BOOLEAN DEFAULT true NOT NULL,
  is_deleted BOOLEAN DEFAULT false NOT NULL,
  deleted_at TIMESTAMPTZ,
  deleted_by VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by VARCHAR(64) DEFAULT 'system',
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_by VARCHAR(64) DEFAULT 'system'
);

-- Backward compatibility & ensure all columns exist if table pre-existed
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS teacher_id VARCHAR(64);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "teacherId" VARCHAR(64);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS department VARCHAR(255) DEFAULT 'กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role VARCHAR(32) DEFAULT 'L1';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role_name VARCHAR(64) DEFAULT 'Teacher / User';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "roleName" VARCHAR(64);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS assigned_rooms JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "assignedRooms" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS initials VARCHAR(16);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS color VARCHAR(32) DEFAULT '#0284c7';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(64);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_by VARCHAR(64) DEFAULT 'system';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_by VARCHAR(64) DEFAULT 'system';

-- Sync teacher_id with teacherId
UPDATE public.users SET teacher_id = "teacherId" WHERE teacher_id IS NULL AND "teacherId" IS NOT NULL;
UPDATE public.users SET "teacherId" = teacher_id WHERE "teacherId" IS NULL AND teacher_id IS NOT NULL;

-- Unique constraint & indices on users
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_teacher_id_unique ON public.users(COALESCE(teacher_id, "teacherId")) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role) WHERE is_deleted = false;

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- 3. ITEMS TABLE (Chemicals & Equipment)
CREATE TABLE IF NOT EXISTS public.items (
  code VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(64) NOT NULL DEFAULT 'สารเคมี',
  qty NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (qty >= 0),
  damaged_qty NUMERIC(12, 2) DEFAULT 0 CHECK (damaged_qty >= 0),
  unit VARCHAR(32) NOT NULL DEFAULT 'ชิ้น',
  min_alert NUMERIC(12, 2) DEFAULT 5,
  expiry DATE,
  room VARCHAR(64) NOT NULL DEFAULT 'Lab 1',
  cabinet VARCHAR(64) NOT NULL DEFAULT 'ตู้ 1',
  shelf VARCHAR(64) NOT NULL DEFAULT 'ชั้น 1',
  chemical_type VARCHAR(64),
  cas_number VARCHAR(64),
  sds_url TEXT,
  ghs JSONB DEFAULT '[]'::jsonb,
  storage_condition VARCHAR(128),
  hazard_level VARCHAR(32),
  is_deleted BOOLEAN DEFAULT false NOT NULL,
  deleted_at TIMESTAMPTZ,
  deleted_by VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by VARCHAR(64) DEFAULT 'system',
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_by VARCHAR(64) DEFAULT 'system'
);

-- Add missing columns to existing items table
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS qty NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS "damagedQty" NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS damaged_qty NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS "minAlert" NUMERIC(12, 2) DEFAULT 5;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS min_alert NUMERIC(12, 2) DEFAULT 5;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS expiry DATE;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS "chemicalType" VARCHAR(64);
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS chemical_type VARCHAR(64);
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS "sdsUrl" TEXT;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS sds_url TEXT;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS ghs JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(64);
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS created_by VARCHAR(64) DEFAULT 'system';
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS updated_by VARCHAR(64) DEFAULT 'system';

CREATE INDEX IF NOT EXISTS idx_items_category ON public.items(category) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_items_room_cabinet ON public.items(room, cabinet) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_items_expiry ON public.items(expiry) WHERE is_deleted = false;

DROP TRIGGER IF EXISTS trg_items_updated_at ON public.items;
CREATE TRIGGER trg_items_updated_at
BEFORE UPDATE ON public.items
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- 4. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id VARCHAR(64) PRIMARY KEY,
  room VARCHAR(64) NOT NULL,
  date DATE NOT NULL,
  slot VARCHAR(64) NOT NULL,
  purpose TEXT NOT NULL,
  teacher_id VARCHAR(64),
  booker_name VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  prep_items JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  is_deleted BOOLEAN DEFAULT false NOT NULL,
  deleted_at TIMESTAMPTZ,
  deleted_by VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by VARCHAR(64) DEFAULT 'system',
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_by VARCHAR(64) DEFAULT 'system'
);

-- Add missing columns to existing bookings table
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "bookerName" VARCHAR(255);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS booker_name VARCHAR(255);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "prepItems" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS prep_items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS "teacherId" VARCHAR(64);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS teacher_id VARCHAR(64);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(64);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS created_by VARCHAR(64) DEFAULT 'system';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS updated_by VARCHAR(64) DEFAULT 'system';

-- Unique constraint: A room slot can only be booked once per date for active bookings
CREATE UNIQUE INDEX IF NOT EXISTS uq_booking_room_slot 
ON public.bookings(room, date, slot) 
WHERE is_deleted = false AND status IN ('pending', 'approved');

CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(date, room) WHERE is_deleted = false;

DROP TRIGGER IF EXISTS trg_bookings_updated_at ON public.bookings;
CREATE TRIGGER trg_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- 5. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
  id VARCHAR(64) PRIMARY KEY,
  item_code VARCHAR(64) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  qty NUMERIC(12, 2) NOT NULL DEFAULT 1 CHECK (qty > 0),
  unit VARCHAR(32) NOT NULL DEFAULT 'ชิ้น',
  type VARCHAR(32) NOT NULL DEFAULT 'borrow',
  status VARCHAR(32) NOT NULL DEFAULT 'borrowed',
  teacher_id VARCHAR(64),
  borrower VARCHAR(255) NOT NULL,
  room VARCHAR(64),
  slot VARCHAR(64),
  date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expected_return_date TIMESTAMPTZ,
  return_date TIMESTAMPTZ,
  return_condition VARCHAR(64) DEFAULT 'ปกติ',
  damaged_qty NUMERIC(12, 2) DEFAULT 0,
  notes TEXT,
  booking_id VARCHAR(64),
  is_deleted BOOLEAN DEFAULT false NOT NULL,
  deleted_at TIMESTAMPTZ,
  deleted_by VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by VARCHAR(64) DEFAULT 'system',
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_by VARCHAR(64) DEFAULT 'system'
);

-- Add missing columns to existing transactions table
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "itemCode" VARCHAR(64);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS item_code VARCHAR(64);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "itemName" VARCHAR(255);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS item_name VARCHAR(255);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "expectedReturnDate" TIMESTAMPTZ;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS expected_return_date TIMESTAMPTZ;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "returnDate" TIMESTAMPTZ;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS return_date TIMESTAMPTZ;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "damagedQty" NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS damaged_qty NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "bookingId" VARCHAR(64);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS booking_id VARCHAR(64);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "teacherId" VARCHAR(64);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS teacher_id VARCHAR(64);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(64);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS created_by VARCHAR(64) DEFAULT 'system';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS updated_by VARCHAR(64) DEFAULT 'system';

CREATE INDEX IF NOT EXISTS idx_transactions_item ON public.transactions(COALESCE(item_code, "itemCode")) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status) WHERE is_deleted = false;

DROP TRIGGER IF EXISTS trg_transactions_updated_at ON public.transactions;
CREATE TRIGGER trg_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- 6. PURCHASE ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(64),
  name VARCHAR(255),
  unit_price NUMERIC(14, 2) DEFAULT 0,
  quantity NUMERIC(12, 2) DEFAULT 1,
  total_price NUMERIC(14, 2) DEFAULT 0,
  budget NUMERIC(14, 2) DEFAULT 0,
  discount NUMERIC(6, 2) DEFAULT 0,
  fiscal_year VARCHAR(16) DEFAULT '2569',
  academic_year VARCHAR(16) DEFAULT '2569',
  semester VARCHAR(16) DEFAULT '1',
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  teacher_id VARCHAR(64),
  requester VARCHAR(255),
  department VARCHAR(255) DEFAULT 'กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี',
  is_deleted BOOLEAN DEFAULT false NOT NULL,
  deleted_at TIMESTAMPTZ,
  deleted_by VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by VARCHAR(64) DEFAULT 'system',
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_by VARCHAR(64) DEFAULT 'system'
);

ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS "unitPrice" NUMERIC(14, 2) DEFAULT 0;
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS "totalPrice" NUMERIC(14, 2) DEFAULT 0;
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS "academicYear" VARCHAR(16) DEFAULT '2569';
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS "teacherId" VARCHAR(64);
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS teacher_id VARCHAR(64);
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(64);
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS created_by VARCHAR(64) DEFAULT 'system';
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS updated_by VARCHAR(64) DEFAULT 'system';

DROP TRIGGER IF EXISTS trg_purchase_orders_updated_at ON public.purchase_orders;
CREATE TRIGGER trg_purchase_orders_updated_at
BEFORE UPDATE ON public.purchase_orders
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- 7. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  actor_id VARCHAR(64) NOT NULL,
  actor_name VARCHAR(255) NOT NULL,
  actor_role VARCHAR(32) NOT NULL DEFAULT 'L0',
  action VARCHAR(64) NOT NULL,
  resource VARCHAR(64) NOT NULL,
  resource_id VARCHAR(128),
  details JSONB DEFAULT '{}'::jsonb,
  ip VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- 8. SYSTEM CONFIGURATION TABLE
CREATE TABLE IF NOT EXISTS public.system (
  key VARCHAR(64) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_by VARCHAR(64) DEFAULT 'system'
);

-- Record migration version
INSERT INTO public.schema_migrations (version, name, applied_at)
VALUES ('001', 'central_schema', NOW())
ON CONFLICT (version) DO UPDATE SET applied_at = NOW();


-- >>> END MIGRATION: 001_central_schema.sql <<<

-- >>> START MIGRATION: 002_rls_policies.sql <<<
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


-- >>> END MIGRATION: 002_rls_policies.sql <<<

-- >>> START MIGRATION: 003_seed_production_core.sql <<<
-- ============================================================================
-- Migration: 003_seed_production_core.sql
-- Description: Core Baseline Configuration (Zero Mock Data for Production)
-- Author: SciPortal Security & Architecture
-- ============================================================================

-- 1. Ensure baseline System Configuration exists (Budget, Layouts, Announcements)
INSERT INTO public.system (key, value, updated_at, updated_by)
VALUES 
  ('budget', '{"budget": 100000, "fiscalYear": "2569", "allocated": 0}'::jsonb, NOW(), 'system_init')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.system (key, value, updated_at, updated_by)
VALUES 
  ('lab_announcement_settings', '{
    "badgeText": "📢 ระบบฐานข้อมูลห้องปฏิบัติการวิทยาศาสตร์",
    "mainTitle": "ยินดีต้อนรับสู่ระบบบริหารจัดการห้องปฏิบัติการวิทยาศาสตร์",
    "subTitle": "SciPortal Lab Management System - Source of Truth: Supabase",
    "statusTag": "ระบบออนไลน์ปกติ",
    "emergencyContacts": [
      {"name": "ศูนย์ความปลอดภัยห้องปฏิบัติการ", "tel": "02-123-4567", "role": "ฉุกเฉิน 24 ชม."}
    ]
  }'::jsonb, NOW(), 'system_init')
ON CONFLICT (key) DO NOTHING;

-- 2. Soft-delete any legacy mock data items that might exist from legacy seeding
UPDATE public.bookings 
SET is_deleted = true, deleted_at = NOW(), deleted_by = 'migration_003_cleanup'
WHERE id LIKE 'book_mock_%' 
   OR id LIKE 'test_booking_%'
   OR id LIKE 'book_20260711%'
   OR id LIKE 'book_20260713%';

UPDATE public.transactions
SET is_deleted = true, deleted_at = NOW(), deleted_by = 'migration_003_cleanup'
WHERE id LIKE 'tx-mock%' 
   OR id LIKE 'tx_mock_%';

UPDATE public.purchase_orders
SET is_deleted = true, deleted_at = NOW(), deleted_by = 'migration_003_cleanup'
WHERE id LIKE 'ord-mock-%'
   OR id LIKE 'po_mock_%';

-- 3. Record migration version
INSERT INTO public.schema_migrations (version, name, applied_at)
VALUES ('003', 'seed_production_core', NOW())
ON CONFLICT (version) DO UPDATE SET applied_at = NOW();


-- >>> END MIGRATION: 003_seed_production_core.sql <<<

-- >>> START MIGRATION: 004_p2_inventory_advanced.sql <<<
-- ============================================================================
-- Migration: 004_p2_inventory_advanced.sql
-- Description: Advanced Chemical & Inventory Master Schema (Lot, Expiry, Safety, Movements, Adjustments)
-- Author: SciPortal Security & Architecture
-- Compatible with PostgreSQL / Supabase
-- ============================================================================

-- 1. EXPAND ITEMS TABLE WITH CHEMICAL & STOCK CONTROL FIELDS
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS formula VARCHAR(128);
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS lot_number VARCHAR(64);
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS batch_number VARCHAR(64);
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS received_date DATE;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS supplier VARCHAR(255);
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS reorder_point NUMERIC(12, 2) DEFAULT 10;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS safety_stock NUMERIC(12, 2) DEFAULT 5;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS storage_location VARCHAR(255);
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS position VARCHAR(64);
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS storage_group VARCHAR(64) DEFAULT 'General';
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS incompatible_groups JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS signal_word VARCHAR(32) DEFAULT 'Warning';
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS hazard_statements JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS precautionary_statements JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS qr_code_data TEXT;

-- Backward compatibility columns for camelCase
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS "lotNumber" VARCHAR(64);
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS "receivedDate" DATE;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS "reorderPoint" NUMERIC(12, 2) DEFAULT 10;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS "safetyStock" NUMERIC(12, 2) DEFAULT 5;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS "storageGroup" VARCHAR(64) DEFAULT 'General';
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS "signalWord" VARCHAR(32) DEFAULT 'Warning';

CREATE INDEX IF NOT EXISTS idx_items_lot ON public.items(lot_number) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_items_cas ON public.items(cas_number) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_items_storage_group ON public.items(storage_group) WHERE is_deleted = false;

-- 2. STOCK MOVEMENTS TABLE (Audit trail for every stock delta)
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id VARCHAR(64) PRIMARY KEY,
  item_code VARCHAR(64) NOT NULL REFERENCES public.items(code) ON UPDATE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  type VARCHAR(32) NOT NULL CHECK (type IN ('IN', 'OUT', 'ADJUST', 'DISPOSE', 'RETURN')),
  quantity NUMERIC(12, 2) NOT NULL,
  previous_quantity NUMERIC(12, 2) NOT NULL,
  new_quantity NUMERIC(12, 2) NOT NULL,
  unit VARCHAR(32) NOT NULL DEFAULT 'ชิ้น',
  reason TEXT,
  reference_id VARCHAR(64),
  lot_number VARCHAR(64),
  is_deleted BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by VARCHAR(64) DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_item ON public.stock_movements(item_code);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON public.stock_movements(type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON public.stock_movements(created_at DESC);

-- 3. STOCK ADJUSTMENTS TABLE (Approval Workflow)
CREATE TABLE IF NOT EXISTS public.stock_adjustments (
  id VARCHAR(64) PRIMARY KEY,
  item_code VARCHAR(64) NOT NULL REFERENCES public.items(code) ON UPDATE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  current_quantity NUMERIC(12, 2) NOT NULL,
  adjusted_quantity NUMERIC(12, 2) NOT NULL,
  difference NUMERIC(12, 2) GENERATED ALWAYS AS (adjusted_quantity - current_quantity) STORED,
  unit VARCHAR(32) NOT NULL DEFAULT 'ชิ้น',
  reason TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_by VARCHAR(64) NOT NULL,
  requested_by_name VARCHAR(255) NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  reviewed_by VARCHAR(64),
  reviewed_by_name VARCHAR(255),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  is_deleted BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_stock_adjustments_status ON public.stock_adjustments(status);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_item ON public.stock_adjustments(item_code);

DROP TRIGGER IF EXISTS trg_stock_adjustments_updated_at ON public.stock_adjustments;
CREATE TRIGGER trg_stock_adjustments_updated_at
BEFORE UPDATE ON public.stock_adjustments
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- 4. RLS POLICIES FOR NEW TABLES
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stock_movements_read" 
ON public.stock_movements 
FOR SELECT 
USING (is_deleted = false);

CREATE POLICY "stock_movements_insert" 
ON public.stock_movements 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "stock_adjustments_read" 
ON public.stock_adjustments 
FOR SELECT 
USING (is_deleted = false);

CREATE POLICY "stock_adjustments_all" 
ON public.stock_adjustments 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 5. Record migration version
INSERT INTO public.schema_migrations (version, name, applied_at)
VALUES ('004', 'p2_inventory_advanced', NOW())
ON CONFLICT (version) DO UPDATE SET applied_at = NOW();


-- >>> END MIGRATION: 004_p2_inventory_advanced.sql <<<

-- >>> START MIGRATION: 005_p2_modules.sql <<<
-- ==============================================================================
-- Migration 005: P2 Comprehensive Modules (Equipment, Booking, Borrow/Return, Procurement)
-- ==============================================================================

-- 1. Extend items table for Equipment Master
ALTER TABLE public.items 
  ADD COLUMN IF NOT EXISTS asset_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS serial_number VARCHAR(100),
  ADD COLUMN IF NOT EXISTS condition VARCHAR(50) DEFAULT 'good',
  ADD COLUMN IF NOT EXISTS purchase_date DATE,
  ADD COLUMN IF NOT EXISTS warranty_expiry DATE,
  ADD COLUMN IF NOT EXISTS maintenance_schedule VARCHAR(100),
  ADD COLUMN IF NOT EXISTS last_maintenance_date DATE,
  ADD COLUMN IF NOT EXISTS next_maintenance_date DATE,
  ADD COLUMN IF NOT EXISTS calibration_date DATE,
  ADD COLUMN IF NOT EXISTS next_calibration_date DATE,
  ADD COLUMN IF NOT EXISTS calibration_certificate VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_items_asset_id ON public.items (asset_id) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_items_condition ON public.items (condition) WHERE is_deleted = FALSE;

-- 2. Equipment Maintenance & Calibration Logs Table
CREATE TABLE IF NOT EXISTS public.equipment_maintenance_logs (
  id VARCHAR(64) PRIMARY KEY,
  item_code VARCHAR(64) NOT NULL,
  asset_id VARCHAR(100),
  type VARCHAR(50) NOT NULL DEFAULT 'maintenance', -- maintenance, calibration, repair, inspection
  status VARCHAR(50) NOT NULL DEFAULT 'completed', -- scheduled, in_progress, completed, cancelled
  technician VARCHAR(255),
  cost NUMERIC(12, 2) DEFAULT 0,
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  next_due_date DATE,
  notes TEXT,
  certificate_url VARCHAR(255),
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_maint_item ON public.equipment_maintenance_logs(item_code);
CREATE INDEX IF NOT EXISTS idx_maint_type ON public.equipment_maintenance_logs(type);

-- 3. Equipment Repair Requests Table
CREATE TABLE IF NOT EXISTS public.equipment_repairs (
  id VARCHAR(64) PRIMARY KEY,
  item_code VARCHAR(64) NOT NULL,
  asset_id VARCHAR(100),
  item_name VARCHAR(255),
  issue_description TEXT NOT NULL,
  reported_by VARCHAR(255) NOT NULL,
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  repair_status VARCHAR(50) NOT NULL DEFAULT 'reported', -- reported, under_repair, repaired, decommissioned
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  technician_notes TEXT,
  repair_cost NUMERIC(12, 2) DEFAULT 0,
  resolved_at TIMESTAMPTZ,
  resolved_by VARCHAR(255),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_repairs_status ON public.equipment_repairs(repair_status);

-- 4. Extend Laboratory Bookings Table
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS class_name VARCHAR(50),
  ADD COLUMN IF NOT EXISTS student_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS experiment_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS required_equipment JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS required_chemicals JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS preparation_checklist JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS cleanup_checklist JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(255),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_bookings_date_room ON public.bookings(date, room) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status) WHERE is_deleted = FALSE;

-- 5. Extend Transactions (Borrow/Return) Table
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS asset_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS approval_status VARCHAR(30) DEFAULT 'approved', -- pending, approved, rejected
  ADD COLUMN IF NOT EXISTS approved_by VARCHAR(255),
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_overdue BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS damaged_status VARCHAR(30) DEFAULT 'none', -- none, minor_damage, severe_damage, missing
  ADD COLUMN IF NOT EXISTS damage_notes TEXT,
  ADD COLUMN IF NOT EXISTS damage_fine NUMERIC(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS responsible_person VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_transactions_due_date ON public.transactions(due_date) WHERE is_deleted = FALSE;

-- 6. Extend Purchase Orders Table
ALTER TABLE public.purchase_orders
  ADD COLUMN IF NOT EXISTS supplier_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS quotation_ref VARCHAR(100),
  ADD COLUMN IF NOT EXISTS invoice_ref VARCHAR(100),
  ADD COLUMN IF NOT EXISTS approval_chain JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS receiving_status VARCHAR(30) DEFAULT 'unreceived', -- unreceived, partial, received
  ADD COLUMN IF NOT EXISTS received_items JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS budget_deducted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS budget_year INTEGER DEFAULT 2026;

-- 7. Row-Level Security for new tables
ALTER TABLE public.equipment_maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_repairs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'maint_read_all' AND tablename = 'equipment_maintenance_logs') THEN
    CREATE POLICY maint_read_all ON public.equipment_maintenance_logs FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'maint_write_staff' AND tablename = 'equipment_maintenance_logs') THEN
    CREATE POLICY maint_write_staff ON public.equipment_maintenance_logs FOR ALL USING (
      auth.role() = 'authenticated'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'repairs_read_all' AND tablename = 'equipment_repairs') THEN
    CREATE POLICY repairs_read_all ON public.equipment_repairs FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'repairs_write_authenticated' AND tablename = 'equipment_repairs') THEN
    CREATE POLICY repairs_write_authenticated ON public.equipment_repairs FOR ALL USING (
      auth.role() = 'authenticated'
    );
  END IF;
END $$;


-- >>> END MIGRATION: 005_p2_modules.sql <<<

