-- ============================================================================
-- SciPortal Supabase REPAIR SCRIPT
-- วันที่สร้าง: 2026-09-29
-- วัตถุประสงค์: สร้างตารางที่ขาดหายไปและซ่อมแซม schema ที่ไม่ตรงกัน
-- ปลอดภัย: ใช้ IF NOT EXISTS / IF EXISTS ทุกครั้ง (idempotent)
-- ============================================================================

-- ============================================================
-- STEP 1: ซ่อมแซม audit_logs (เพิ่ม actor_id ถ้ายังไม่มี)
-- ============================================================
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS actor_id   VARCHAR(64);
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS actor_name VARCHAR(255);
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS actor_role VARCHAR(32) DEFAULT 'L0';
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS action     VARCHAR(64);
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS resource   VARCHAR(64);
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS resource_id VARCHAR(128);
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS details    JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS ip         VARCHAR(64);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor     ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource  ON public.audit_logs(resource, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- ============================================================
-- STEP 2: สร้าง stock_movements (ถ้ายังไม่มี)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id                VARCHAR(64) PRIMARY KEY,
  item_code         VARCHAR(64) NOT NULL,
  item_name         VARCHAR(255) NOT NULL,
  type              VARCHAR(32) NOT NULL CHECK (type IN ('IN', 'OUT', 'ADJUST', 'DISPOSE', 'RETURN')),
  quantity          NUMERIC(12, 2) NOT NULL,
  previous_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0,
  new_quantity      NUMERIC(12, 2) NOT NULL DEFAULT 0,
  unit              VARCHAR(32) NOT NULL DEFAULT 'ชิ้น',
  reason            TEXT,
  reference_id      VARCHAR(64),
  lot_number        VARCHAR(64),
  is_deleted        BOOLEAN DEFAULT false NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by        VARCHAR(64) DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_item ON public.stock_movements(item_code);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON public.stock_movements(type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON public.stock_movements(created_at DESC);

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'stock_movements_read' AND tablename = 'stock_movements') THEN
    CREATE POLICY stock_movements_read ON public.stock_movements FOR SELECT USING (is_deleted = false);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'stock_movements_insert' AND tablename = 'stock_movements') THEN
    CREATE POLICY stock_movements_insert ON public.stock_movements FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'stock_movements_service' AND tablename = 'stock_movements') THEN
    CREATE POLICY stock_movements_service ON public.stock_movements FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ============================================================
-- STEP 3: สร้าง stock_adjustments (ถ้ายังไม่มี)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stock_adjustments (
  id                  VARCHAR(64) PRIMARY KEY,
  item_code           VARCHAR(64) NOT NULL,
  item_name           VARCHAR(255) NOT NULL,
  current_quantity    NUMERIC(12, 2) NOT NULL,
  adjusted_quantity   NUMERIC(12, 2) NOT NULL,
  unit                VARCHAR(32) NOT NULL DEFAULT 'ชิ้น',
  reason              TEXT NOT NULL,
  status              VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_by        VARCHAR(64) NOT NULL,
  requested_by_name   VARCHAR(255) NOT NULL,
  requested_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  reviewed_by         VARCHAR(64),
  reviewed_by_name    VARCHAR(255),
  reviewed_at         TIMESTAMPTZ,
  review_notes        TEXT,
  is_deleted          BOOLEAN DEFAULT false NOT NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_stock_adjustments_status ON public.stock_adjustments(status);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_item   ON public.stock_adjustments(item_code);

ALTER TABLE public.stock_adjustments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'stock_adjustments_read' AND tablename = 'stock_adjustments') THEN
    CREATE POLICY stock_adjustments_read ON public.stock_adjustments FOR SELECT USING (is_deleted = false);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'stock_adjustments_all' AND tablename = 'stock_adjustments') THEN
    CREATE POLICY stock_adjustments_all ON public.stock_adjustments FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'stock_adjustments_service' AND tablename = 'stock_adjustments') THEN
    CREATE POLICY stock_adjustments_service ON public.stock_adjustments FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ============================================================
-- STEP 4: สร้าง equipment_maintenance_logs (ถ้ายังไม่มี)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.equipment_maintenance_logs (
  id                VARCHAR(64) PRIMARY KEY,
  equipment_code    VARCHAR(64) NOT NULL,
  equipment_name    VARCHAR(255) NOT NULL,
  type              VARCHAR(32) NOT NULL DEFAULT 'maintenance' CHECK (type IN ('maintenance', 'calibration', 'inspection', 'repair')),
  status            VARCHAR(32) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  description       TEXT,
  performed_by      VARCHAR(64),
  performed_by_name VARCHAR(255),
  scheduled_date    DATE,
  completed_date    DATE,
  next_service_date DATE,
  cost              NUMERIC(12, 2) DEFAULT 0,
  notes             TEXT,
  is_deleted        BOOLEAN DEFAULT false NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by        VARCHAR(64) DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_equip_maint_code   ON public.equipment_maintenance_logs(equipment_code);
CREATE INDEX IF NOT EXISTS idx_equip_maint_status ON public.equipment_maintenance_logs(status);
CREATE INDEX IF NOT EXISTS idx_equip_maint_date   ON public.equipment_maintenance_logs(scheduled_date);

ALTER TABLE public.equipment_maintenance_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'maint_read_all' AND tablename = 'equipment_maintenance_logs') THEN
    CREATE POLICY maint_read_all ON public.equipment_maintenance_logs FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'maint_write_staff' AND tablename = 'equipment_maintenance_logs') THEN
    CREATE POLICY maint_write_staff ON public.equipment_maintenance_logs FOR ALL USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'maint_service' AND tablename = 'equipment_maintenance_logs') THEN
    CREATE POLICY maint_service ON public.equipment_maintenance_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ============================================================
-- STEP 5: สร้าง equipment_repairs (ถ้ายังไม่มี)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.equipment_repairs (
  id                VARCHAR(64) PRIMARY KEY,
  equipment_code    VARCHAR(64) NOT NULL,
  equipment_name    VARCHAR(255) NOT NULL,
  issue_description TEXT NOT NULL,
  priority          VARCHAR(16) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status            VARCHAR(32) NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'in_progress', 'resolved', 'cancelled')),
  reported_by       VARCHAR(64),
  reported_by_name  VARCHAR(255),
  assigned_to       VARCHAR(64),
  assigned_to_name  VARCHAR(255),
  resolution_notes  TEXT,
  reported_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  resolved_at       TIMESTAMPTZ,
  estimated_cost    NUMERIC(12, 2),
  actual_cost       NUMERIC(12, 2),
  is_deleted        BOOLEAN DEFAULT false NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_repairs_code     ON public.equipment_repairs(equipment_code);
CREATE INDEX IF NOT EXISTS idx_repairs_status   ON public.equipment_repairs(status);
CREATE INDEX IF NOT EXISTS idx_repairs_priority ON public.equipment_repairs(priority);

ALTER TABLE public.equipment_repairs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'repairs_read_all' AND tablename = 'equipment_repairs') THEN
    CREATE POLICY repairs_read_all ON public.equipment_repairs FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'repairs_write_authenticated' AND tablename = 'equipment_repairs') THEN
    CREATE POLICY repairs_write_authenticated ON public.equipment_repairs FOR ALL USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'repairs_service' AND tablename = 'equipment_repairs') THEN
    CREATE POLICY repairs_service ON public.equipment_repairs FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ============================================================
-- STEP 6: ตรวจสอบว่าสร้างครบ (ผลลัพธ์จะแสดงหลัง run)
-- ============================================================
SELECT
  table_name,
  'EXISTS ✅' AS status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'items', 'users', 'bookings', 'transactions', 'purchase_orders',
    'audit_logs', 'stock_movements', 'stock_adjustments',
    'equipment_maintenance_logs', 'equipment_repairs'
  )
ORDER BY table_name;
