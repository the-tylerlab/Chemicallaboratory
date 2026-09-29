/**
 * SciPortal Isolated Development / Demo Seeder
 * Populates sample development data ONLY when NODE_ENV=development
 * Does NOT pollute production environments.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const NODE_ENV = process.env.NODE_ENV || 'development';
const isClean = process.argv.includes('--clean');
const isForce = process.argv.includes('--force');

if (NODE_ENV === 'production' && !isForce) {
  console.error("❌ Refusing to seed demo data in PRODUCTION environment!");
  console.error("   If you really want to seed demo data in production, provide the --force flag.");
  process.exit(1);
}

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://avzneyaalenbyawfvykp.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Supabase configuration missing in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DEMO_ITEMS = [
  {
    code: "DEMO-CHEM-001",
    name: "[DEMO] ไฮโดรเจนเปอร์ออกไซด์ 30% (Hydrogen Peroxide 30%)",
    category: "สารเคมี",
    qty: 5,
    unit: "ขวด",
    min_alert: 2,
    room: "Lab 1",
    cabinet: "ตู้ A",
    shelf: "ชั้น 1",
    chemical_type: "Oxidizing",
    is_deleted: false,
    created_by: "demo_seeder"
  },
  {
    code: "DEMO-EQ-001",
    name: "[DEMO] กล้องจุลทรรศน์สองตา (Binocular Microscope)",
    category: "อุปกรณ์วิทยาศาสตร์",
    qty: 8,
    unit: "กล้อง",
    min_alert: 2,
    room: "Lab 3",
    cabinet: "ตู้กล้อง",
    shelf: "ชั้น 1",
    is_deleted: false,
    created_by: "demo_seeder"
  }
];

const DEMO_BOOKINGS = [
  {
    id: "demo_bk_001",
    room: "Lab 1",
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    slot: "09:00 - 10:30",
    purpose: "[DEMO] ทดสอบปฏิกิริยาการแยกสาร",
    teacher_id: "T101",
    booker_name: "ครูทดสอบ (Demo Teacher)",
    department: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
    status: "approved",
    is_deleted: false,
    created_by: "demo_seeder"
  }
];

async function seed() {
  console.log("==================================================");
  console.log(`🧪 SciPortal Demo Data Seeder [Env: ${NODE_ENV}]`);
  console.log("==================================================");

  if (isClean) {
    console.log("🧹 Cleaning all demo data...");
    const { error: err1 } = await supabase.from('items').delete().like('code', 'DEMO-%');
    const { error: err2 } = await supabase.from('bookings').delete().like('id', 'demo_%');
    if (err1 || err2) console.warn("Notice during cleanup:", err1 || err2);
    else console.log("✅ Demo data successfully removed.");
    return;
  }

  console.log("📥 Seeding demo items...");
  for (const item of DEMO_ITEMS) {
    const { error } = await supabase.from('items').upsert(item, { onConflict: 'code' });
    if (error) console.warn(`Item notice (${item.code}):`, error.message);
    else console.log(`   + Seeded: ${item.code} (${item.name})`);
  }

  console.log("📥 Seeding demo bookings...");
  for (const bk of DEMO_BOOKINGS) {
    const { error } = await supabase.from('bookings').upsert(bk, { onConflict: 'id' });
    if (error) console.warn(`Booking notice (${bk.id}):`, error.message);
    else console.log(`   + Seeded: ${bk.id} (${bk.room} - ${bk.date})`);
  }

  console.log("\n🎉 Demo data seeding complete! (Run with --clean to remove)");
}

seed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
