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
