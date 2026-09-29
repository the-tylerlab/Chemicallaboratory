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
