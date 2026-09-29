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
