-- ============================================================
-- แก้ RLS: อนุญาตให้ INSERT equipment tables ได้โดยไม่ต้อง auth
-- (backend ใช้ anon key สำหรับ initial seed / server-side operations)
-- ============================================================

-- equipment_maintenance_logs: เพิ่ม insert policy สำหรับ anon
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'maint_insert_anon' AND tablename = 'equipment_maintenance_logs'
  ) THEN
    CREATE POLICY maint_insert_anon 
    ON public.equipment_maintenance_logs 
    FOR INSERT 
    WITH CHECK (true);
  END IF;
END $$;

-- equipment_repairs: เพิ่ม insert policy สำหรับ anon
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'repairs_insert_anon' AND tablename = 'equipment_repairs'
  ) THEN
    CREATE POLICY repairs_insert_anon 
    ON public.equipment_repairs 
    FOR INSERT 
    WITH CHECK (true);
  END IF;
END $$;

-- ตรวจสอบ policies ทั้งหมดที่มีอยู่
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename IN ('equipment_maintenance_logs', 'equipment_repairs')
ORDER BY tablename, policyname;
