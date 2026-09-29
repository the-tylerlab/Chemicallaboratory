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
