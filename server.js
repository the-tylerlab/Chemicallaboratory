const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const webpush = require('web-push');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static frontend files with no-cache headers during development/production
app.use(express.static(path.join(__dirname), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js') || filePath.endsWith('.html') || filePath.endsWith('.json')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'database.json');
const BUDGET_FILE = path.join(DB_DIR, 'budget.json');
const PURCHASE_ORDERS_FILE = path.join(DB_DIR, 'purchase_orders.json');
const BOOKINGS_FILE = path.join(DB_DIR, 'bookings.json');
const TRANSACTIONS_FILE = path.join(DB_DIR, 'transactions.json');
const USERS_FILE = path.join(DB_DIR, 'users.json');
const AUDIT_LOGS_FILE = path.join(DB_DIR, 'audit_logs.json');
const LAYOUTS_FILE = path.join(DB_DIR, 'layouts.json');
const FEEDBACKS_FILE = path.join(DB_DIR, 'feedbacks.json');
const PUSH_SUBSCRIPTIONS_FILE = path.join(DB_DIR, 'push_subscriptions.json');
const VAPID_KEYS_FILE = path.join(DB_DIR, 'vapid_keys.json');
const ANNOUNCEMENTS_FILE = path.join(DB_DIR, 'announcements.json');
const EMERGENCY_CONTACTS_FILE = path.join(DB_DIR, 'emergency_contacts.json');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initialize VAPID Keys for Web Push
function getOrGenerateVapidKeys() {
  try {
    if (fs.existsSync(VAPID_KEYS_FILE)) {
      const keys = JSON.parse(fs.readFileSync(VAPID_KEYS_FILE, 'utf-8'));
      if (keys.publicKey && keys.privateKey) return keys;
    }
  } catch (e) {}

  const newKeys = webpush.generateVAPIDKeys();
  fs.writeFileSync(VAPID_KEYS_FILE, JSON.stringify(newKeys, null, 2), 'utf-8');
  return newKeys;
}

const vapidKeys = getOrGenerateVapidKeys();
webpush.setVapidDetails(
  'mailto:admin@chemlab.local',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Default Demo Data to seed the database if it doesn't exist
const DEFAULT_SEEDS = [
  {
    code: "CHEM-001",
    name: "กรดไฮโดรคลอริก 37% (Hydrochloric Acid)",
    category: "สารเคมี",
    qty: 3, // Somchai borrowed 2, remaining 3
    unit: "ขวด",
    minAlert: 2,
    expiry: "2027-12-31",
    room: "Lab 1",
    cabinet: "ตู้ A",
    shelf: "ชั้น 2",
    createdAt: "2026-05-01T10:00:00.000Z"
  },
  {
    code: "CHEM-002",
    name: "เอทานอล 95% (Ethanol)",
    category: "สารเคมี",
    qty: 1,
    unit: "ขวด",
    minAlert: 2,
    expiry: "2027-05-15",
    room: "Lab 1",
    cabinet: "ตู้ A",
    shelf: "ชั้น 1",
    createdAt: "2026-05-10T11:30:00.000Z"
  },
  {
    code: "CHEM-003",
    name: "โซเดียมไฮดรอกไซด์ (Sodium Hydroxide)",
    category: "สารเคมี",
    qty: 2, // Somying borrowed 1, remaining 2
    unit: "ขวด",
    minAlert: 1,
    expiry: "2026-04-12",
    room: "Lab 2",
    cabinet: "ตู้ B",
    shelf: "ชั้น 3",
    createdAt: "2026-05-05T08:15:00.000Z"
  },
  {
    code: "EQ-001",
    name: "เครื่องชั่งดิจิตอล 4 ตำแหน่ง (Digital Balance)",
    category: "อุปกรณ์วิทยาศาสตร์",
    qty: 2,
    unit: "เครื่อง",
    minAlert: 1,
    expiry: "",
    room: "Lab 1",
    cabinet: "โต๊ะชั่งน้ำหนัก",
    shelf: "มุมขวา",
    createdAt: "2026-04-20T09:00:00.000Z"
  },
  {
    code: "GW-001",
    name: "บีกเกอร์ขนาด 250 มล. (Beaker 250ml)",
    category: "เครื่องแก้ว",
    qty: 11, // Mana returned 3 good and 1 damaged (original 12 - 1 damaged = 11)
    damagedQty: 1,
    unit: "ชิ้น",
    minAlert: 5,
    expiry: "",
    room: "Lab 2",
    cabinet: "ตู้เก็บเครื่องแก้ว",
    shelf: "ชั้น A",
    createdAt: "2026-05-12T14:20:00.000Z"
  },
  {
    code: "GW-002",
    name: "ปิเปตขนาด 10 มล. (Pipette 10ml)",
    category: "เครื่องแก้ว",
    qty: 8,
    unit: "ชิ้น",
    minAlert: 10,
    expiry: "",
    room: "Lab 2",
    cabinet: "ตู้เก็บเครื่องแก้ว",
    shelf: "ชั้น B",
    createdAt: "2026-05-15T15:00:00.000Z"
  },
  {
    code: "CHEM-004",
    name: "โพแทสเซียมเปอร์แมงกาเนต (Potassium Permanganate)",
    category: "สารเคมี",
    qty: 2,
    unit: "ขวด",
    minAlert: 1,
    expiry: "2026-06-15",
    room: "Lab 1",
    cabinet: "ตู้ B",
    shelf: "ชั้น 1",
    createdAt: "2026-05-18T10:45:00.000Z"
  }
];

// Helper: Load database items
function readDatabase() {
  try {
    // Create directory if not exists
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    
    // Create file if not exists
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_SEEDS, null, 2), 'utf-8');
      return DEFAULT_SEEDS;
    }
    
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database:", err);
    return [];
  }
}

// Helper: Save items to database
function writeDatabase(items) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(items, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error("Error writing database:", err);
    return false;
  }
}

// Helper: Read budget from database
function readBudget() {
  try {
    if (!fs.existsSync(BUDGET_FILE)) {
      fs.writeFileSync(BUDGET_FILE, JSON.stringify({ budget: 100000 }, null, 2), 'utf-8');
      return { budget: 100000 };
    }
    const data = fs.readFileSync(BUDGET_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return { budget: 100000 };
  }
}

// Helper: Save budget to database
function writeBudget(budgetData) {
  try {
    fs.writeFileSync(BUDGET_FILE, JSON.stringify(budgetData, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return false;
  }
}

// Helper: Read purchase orders from database
function readPurchaseOrders() {
  try {
    if (!fs.existsSync(PURCHASE_ORDERS_FILE)) {
      const defaultOrders = [
        {
          id: "ord-mock-001",
          code: "CHEM-001",
          name: "กรดไฮโดรคลอริก 37% (Hydrochloric Acid)",
          unitPrice: 350.00,
          quantity: 5,
          totalPrice: 1750.00,
          budget: 2000.00,
          discount: 5
        },
        {
          id: "ord-mock-002",
          code: "EQ-005",
          name: "เครื่องชั่งดิจิตอล 2 ตำแหน่ง",
          unitPrice: 2400.00,
          quantity: 2,
          totalPrice: 4800.00,
          budget: 5000.00,
          discount: 10
        }
      ];
      fs.writeFileSync(PURCHASE_ORDERS_FILE, JSON.stringify(defaultOrders, null, 2), 'utf-8');
      return defaultOrders;
    }
    const data = fs.readFileSync(PURCHASE_ORDERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper: Save purchase orders to database
function writePurchaseOrders(orders) {
  try {
    fs.writeFileSync(PURCHASE_ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return false;
  }
}

// Helper: Read bookings from database
function readBookings() {
  try {
    if (!fs.existsSync(BOOKINGS_FILE)) {
      fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const data = fs.readFileSync(BOOKINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper: Save bookings to database
function writeBookings(bookings) {
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return false;
  }
}

// Helper: Read layouts from database
function readLayouts() {
  try {
    if (!fs.existsSync(LAYOUTS_FILE)) {
      fs.writeFileSync(LAYOUTS_FILE, JSON.stringify({}, null, 2), 'utf-8');
      return {};
    }
    const data = fs.readFileSync(LAYOUTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

// Helper: Save layouts to database
function writeLayouts(layouts) {
  try {
    fs.writeFileSync(LAYOUTS_FILE, JSON.stringify(layouts, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return false;
  }
}

// Helper: Read transactions from database
function readTransactions() {
  try {
    if (!fs.existsSync(TRANSACTIONS_FILE)) {
      fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const data = fs.readFileSync(TRANSACTIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper: Save transactions to database
function writeTransactions(transactions) {
  try {
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return false;
  }
}

// Helper: Read users
function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      const defaultUsers = [
        { id: "u1", name: "Admin User", email: "admin@organisation.com", role: "admin", initials: "A", color: "var(--primary-purple)" },
        { id: "u2", name: "Staff Member", email: "staff@organisation.com", role: "staff", initials: "S", color: "#3b82f6" }
      ];
      fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2), 'utf-8');
      return defaultUsers;
    }
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return false;
  }
}

// Helper: Read audit logs
function readAuditLogs() {
  try {
    if (!fs.existsSync(AUDIT_LOGS_FILE)) {
      fs.writeFileSync(AUDIT_LOGS_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const data = fs.readFileSync(AUDIT_LOGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeAuditLogs(logs) {
  try {
    fs.writeFileSync(AUDIT_LOGS_FILE, JSON.stringify(logs, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return false;
  }
}

// Helper: Read feedbacks
function readFeedbacks() {
  try {
    if (!fs.existsSync(FEEDBACKS_FILE)) {
      fs.writeFileSync(FEEDBACKS_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const data = fs.readFileSync(FEEDBACKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeFeedbacks(feedbacks) {
  try {
    fs.writeFileSync(FEEDBACKS_FILE, JSON.stringify(feedbacks, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return false;
  }
}

// Helper: Read announcements
function readAnnouncements() {
  const defaultAnnouncements = {
    enabled: true,
    text: "🛡️ การใช้อุปกรณ์คุ้มครองความปลอดภัย (PPE) ต้องสวมเสื้อกาวน์ แว่นตานิรภัย และรองเท้าหุ้มส้นตลอดเวลาที่ปฏิบัติการ | 💨 การทดลองที่มีไอระเหยหรือกรดเข้มข้น กรุณาทำในตู้ดูดควัน (Fume Hood) และเปิดระบบระบายอากาศก่อนเริ่มงาน | 📞 เหตุฉุกเฉินและอุบัติเหตุ ติดต่อแอดมิน หรือแจ้งผ่านเมนู 'แจ้งปัญหา' | 📖 ศูนย์ข้อมูลและความปลอดภัย ศึกษากฎระเบียบ SHECU และเอกสาร SDS ได้ที่เมนูศูนย์ข้อมูล",
    badgeText: "📢 ประกาศ & ความปลอดภัย",
    speed: 55,
    gap: 36,
    theme: "orange",
    pauseOnHover: true,
    updatedAt: new Date().toISOString()
  };

  try {
    if (!fs.existsSync(ANNOUNCEMENTS_FILE)) {
      fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(defaultAnnouncements, null, 2), 'utf-8');
      return defaultAnnouncements;
    }
    const data = fs.readFileSync(ANNOUNCEMENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return defaultAnnouncements;
  }
}

function writeAnnouncements(settings) {
  try {
    const dataToSave = {
      ...settings,
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return false;
  }
}

// Emergency Contacts Helpers
function readEmergencyContacts() {
  const defaultContacts = {
    admin: "แอดมิน (ม.วงศกร ด้วงเกลี้ยง): ยังไม่ระบุ",
    nurse: "ห้องพยาบาล: ยังไม่ระบุ",
    fire: "แจ้งเหตุเพลิงไหม้: ยังไม่ระบุ"
  };
  try {
    if (!fs.existsSync(EMERGENCY_CONTACTS_FILE)) {
      fs.writeFileSync(EMERGENCY_CONTACTS_FILE, JSON.stringify(defaultContacts, null, 2), 'utf-8');
      return defaultContacts;
    }
    const data = fs.readFileSync(EMERGENCY_CONTACTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return defaultContacts;
  }
}

function writeEmergencyContacts(contacts) {
  try {
    const dataToSave = {
      ...contacts,
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(EMERGENCY_CONTACTS_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return false;
  }
}

// ==========================================================================
// GOOGLE SHEETS REAL-TIME BACKUP SYNC DISPATCHER
// ==========================================================================
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxMA_8zdAdniensdoPQx9XkhTVya4c-afMx2qz7adS3eHs5OlBpsEkbZGLXMac1taN8xw/exec';

async function syncToGoogleSheets(table, action, data, keyField = 'id') {
  if (!GOOGLE_SCRIPT_URL) return;
  try {
    const payload = {
      table,
      action,
      keyField,
      data
    };
    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => {
      console.warn(`[GoogleSheetsSync] Sync notice for ${table}:`, err.message);
    });
  } catch (e) {
    console.warn(`[GoogleSheetsSync] Dispatch failed:`, e.message);
  }
}

// ==========================================================================
// HTTP API ENDPOINTS
// ==========================================================================

function formatBookingForSync(b) {
  const roomNames = {
    'Lab 1': 'ห้องปฏิบัติการเคมี อาคารอัสสัมชัญ',
    'Lab 2': 'ห้องปฏิบัติการฟิสิกส์ อาคารเซนต์ปีเตอร์',
    'Lab 3': 'ห้องปฏิบัติการชีววิทยา อาคารเซนต์ปีเตอร์',
    'Lab 4': 'ห้องปฏิบัติการวิทยาศาสตร์ อาคารราฟาเอล',
    'Lab 5': 'ห้องศูนย์ สสวท. (วิทยาศาสตร์) อาคารราฟาเอล',
    'Lab 6': 'ห้องปฏิบัติการวิทยาศาสตร์ อาคารอัสสัมชัญ',
    'Lab 7': 'ห้องศูนย์ STEM CENTER',
    'Lab 8': 'ห้องปฏิบัติการวิทยาศาสตร์ (EP) อาคารยอห์น แมรี่'
  };
  return {
    id: b.id,
    room: roomNames[b.room] || b.room || '',
    date: b.date || '',
    slot: b.slot || '',
    gradeLevel: b.gradeLevel || '-',
    studentCount: b.studentCount ? `${b.studentCount} คน` : '-',
    purpose: b.purpose || b.activity || '',
    bookerName: b.bookerName || b.teacherName || '',
    prepItems: Array.isArray(b.prepItems) ? JSON.stringify(b.prepItems) : (b.prepItems || ''),
    status: b.status === 'approved' ? 'อนุมัติแล้ว' : (b.status === 'pending' ? 'รออนุมัติ' : 'ปฏิเสธ'),
    createdAt: b.createdAt || new Date().toISOString()
  };
}

// Manual / Full Trigger: Sync All Tables to Google Sheets
app.post('/api/sync-google-sheets', async (req, res) => {
  try {
    const items = readDatabase();
    const transactions = readTransactions();
    const bookings = readBookings();
    const purchaseOrders = readPurchaseOrders();
    const users = readUsers();
    const auditLogs = readAuditLogs();
    const announcements = readAnnouncements();

    items.forEach(item => syncToGoogleSheets('Items', 'UPSERT', item, 'code'));
    transactions.forEach(tx => syncToGoogleSheets('Transactions', 'UPSERT', tx, 'id'));
    bookings.forEach(b => syncToGoogleSheets('Bookings', 'UPSERT', formatBookingForSync(b), 'id'));
    purchaseOrders.forEach(po => syncToGoogleSheets('Purchase_Orders', 'UPSERT', po, 'id'));
    users.forEach(u => {
      const copy = { ...u };
      delete copy.password;
      syncToGoogleSheets('Users', 'UPSERT', copy, 'teacherId');
    });
    auditLogs.forEach(log => syncToGoogleSheets('Audit_Logs', 'UPSERT', log, 'id'));
    if (announcements) {
      syncToGoogleSheets('Announcements', 'UPSERT', announcements, 'badgeText');
    }

    res.json({ success: true, message: 'Google Sheets sync dispatched for all records.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/version — Fetch dynamic system version
app.get('/api/version', (req, res) => {
  try {
    const pkg = require('./package.json');
    res.json({ version: pkg.version || '2.6.0', pwa: true, name: 'Chemical Laboratory System' });
  } catch (e) {
    res.json({ version: '2.6.0', pwa: true });
  }
});

// 1. GET /api/items — Fetch all items
app.get('/api/items', (req, res) => {
  const items = readDatabase();
  res.json(items);
});

// 2. POST /api/items — Create a new item
app.post('/api/items', (req, res) => {
  const newItem = req.body;
  if (!newItem.code || !newItem.name || !newItem.category || newItem.qty === undefined || !newItem.unit) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const items = readDatabase();
  
  // Check duplicate
  const exists = items.some(item => item.code.toLowerCase() === newItem.code.toLowerCase());
  if (exists) {
    return res.status(409).json({ error: `Item code ${newItem.code} already exists` });
  }

  // Add creation timestamp
  newItem.createdAt = newItem.createdAt || new Date().toISOString();
  
  items.push(newItem);
  writeDatabase(items);

  // Sync to Google Sheets in Real-time
  syncToGoogleSheets('Items', 'UPSERT', newItem, 'code');
  
  res.status(201).json(newItem);
});

// 3. PUT /api/items/:code — Update an existing item
app.put('/api/items/:code', (req, res) => {
  const codeToUpdate = req.params.code.toLowerCase();
  const updatedData = req.body;
  
  const items = readDatabase();
  const index = items.findIndex(item => item.code.toLowerCase() === codeToUpdate);
  
  if (index === -1) {
    return res.status(404).json({ error: "Item not found" });
  }

  // Preserve creation date
  updatedData.createdAt = items[index].createdAt;
  
  items[index] = { ...items[index], ...updatedData };
  writeDatabase(items);

  // Sync to Google Sheets in Real-time
  syncToGoogleSheets('Items', 'UPSERT', items[index], 'code');
  
  res.json(items[index]);
});

// 4. DELETE /api/items/:code — Delete an item
app.delete('/api/items/:code', (req, res) => {
  const codeToDelete = req.params.code.toLowerCase();
  const items = readDatabase();
  
  const initialLength = items.length;
  const filteredItems = items.filter(item => item.code.toLowerCase() !== codeToDelete);
  
  if (filteredItems.length === initialLength) {
    return res.status(404).json({ error: "Item not found" });
  }
  
  writeDatabase(filteredItems);

  // Sync to Google Sheets in Real-time
  syncToGoogleSheets('Items', 'DELETE', { code: codeToDelete }, 'code');

  res.json({ success: true, message: `Item ${codeToDelete} removed successfully` });
});

// 5. POST /api/items/import — Batch Import
app.post('/api/items/import', (req, res) => {
  const importedItems = req.body;
  if (!Array.isArray(importedItems)) {
    return res.status(400).json({ error: "Data must be an array" });
  }

  const items = readDatabase();
  let successCount = 0;
  let errorCount = 0;

  importedItems.forEach(newItem => {
    if (!newItem.code || !newItem.name || !newItem.category || newItem.qty === undefined || !newItem.unit) {
      errorCount++;
      return;
    }

    // Check duplicate
    const exists = items.some(item => item.code.toLowerCase() === newItem.code.toLowerCase());
    if (exists) {
      errorCount++;
      return;
    }

    newItem.createdAt = newItem.createdAt || new Date().toISOString();
    items.push(newItem);
    successCount++;

    // Sync to Google Sheets
    syncToGoogleSheets('Items', 'UPSERT', newItem, 'code');
  });

  if (successCount > 0) {
    writeDatabase(items);
  }

  res.json({ 
    success: true, 
    imported: successCount, 
    errors: errorCount 
  });
});

// GET /api/budget
app.get('/api/budget', (req, res) => {
  res.json(readBudget());
});

// POST /api/budget
app.post('/api/budget', (req, res) => {
  const data = req.body;
  writeBudget(data);
  res.json({ success: true, budget: data.budget });
});

// GET /api/purchase-orders
app.get('/api/purchase-orders', (req, res) => {
  res.json(readPurchaseOrders());
});

// POST /api/purchase-orders
app.post('/api/purchase-orders', (req, res) => {
  const orders = req.body;
  writePurchaseOrders(orders);
  if (Array.isArray(orders)) {
    orders.forEach(po => syncToGoogleSheets('Purchase_Orders', 'UPSERT', po, 'id'));
  }
  res.json({ success: true });
});

// GET /api/bookings
app.get('/api/bookings', (req, res) => {
  res.json(readBookings());
});

// POST /api/bookings
app.post('/api/bookings', (req, res) => {
  const bookings = req.body;
  writeBookings(bookings);
  if (Array.isArray(bookings)) {
    bookings.forEach(b => syncToGoogleSheets('Bookings', 'UPSERT', formatBookingForSync(b), 'id'));
  }
  res.json({ success: true });
});

// GET /api/transactions
app.get('/api/transactions', (req, res) => {
  res.json(readTransactions());
});

// POST /api/transactions
app.post('/api/transactions', (req, res) => {
  const transactions = req.body;
  writeTransactions(transactions);
  if (Array.isArray(transactions)) {
    transactions.forEach(tx => syncToGoogleSheets('Transactions', 'UPSERT', tx, 'id'));
  }
  res.json({ success: true });
});

// ==========================================
// ADMIN PANEL ENDPOINTS
// ==========================================

function calculateUserInitials(name) {
  if (!name || typeof name !== 'string') return 'U';
  const trimmed = name.trim();
  if (/^admin$/i.test(trimmed) || /^\(Admin\)$/i.test(trimmed)) return "AD";

  let cleanName = name.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').trim();

  // Known Thai & English Titles to strip (including school prefixes: มิส, ม., มาสเตอร์, ภราดา, ฯลฯ)
  const titlePrefixes = [
    /^ว่าที่\s*ร\.ต\.\s*(?:หญิง\s*)?/i,
    /^ว่าที่\s*ร้อยตรี\s*(?:หญิง\s*)?/i,
    /^รอง\s*ผู้อำนวยการ\s*/i,
    /^รอง\s*ผอ\.\s*/i,
    /^ผู้อำนวยการ\s*/i,
    /^ผอ\.\s*/i,
    /^เจ้าหน้าที่\s*/i,
    /^จนท\.\s*/i,
    /^ผศ\.ดร\.\s*/i,
    /^ผศ\.\s*/i,
    /^รศ\.ดร\.\s*/i,
    /^รศ\.\s*/i,
    /^ศ\.ดร\.\s*/i,
    /^ศ\.\s*/i,
    /^ดร\.\s*/i,
    /^อาจารย์\s*/i,
    /^อ\.\s*/i,
    /^ภราดา\s*/i,
    /^บราเดอร์\s*/i,
    /^ซิสเตอร์\s*/i,
    /^เซอร์\s*/i,
    /^มาสเตอร์\s*/i,
    /^มัสเตอร์\s*/i,
    /^มิส(?:\.|\s+|$)/i,
    /^มิส/i,
    /^ม\.(?:\s+|$)?/i,
    /^ม\s+/i,
    /^ครู\s*/i,
    /^นางสาว\s*/i,
    /^น\.ส\.\s*/i,
    /^นส\.\s*/i,
    /^นาง\s*/i,
    /^นาย\s*/i,
    /^คุณ\s*/i,
    /^Mr\.\s*/i,
    /^Mrs\.\s*/i,
    /^Ms\.\s*/i,
    /^Miss\s*/i,
    /^Master\s*/i,
    /^Dr\.\s*/i,
    /^Prof\.\s*/i
  ];

  let matched = true;
  while (matched) {
    matched = false;
    for (const prefix of titlePrefixes) {
      if (prefix.test(cleanName)) {
        cleanName = cleanName.replace(prefix, '').trim();
        matched = true;
        break;
      }
    }
  }

  if (cleanName.includes("ผู้ดูแลระบบ") || cleanName.toLowerCase().includes("admin")) {
    return "AD";
  }

  const parts = cleanName.split(/\s+/).filter(Boolean);
  const leadingVowels = ['เ', 'แ', 'โ', 'ใ', 'ไ'];
  const thaiMarks = /[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/g;

  const getInitialConsonant = (word) => {
    if (!word) return '';
    const rawChars = Array.from(word);
    if (leadingVowels.includes(rawChars[0]) && rawChars.length > 1) {
      const base = rawChars[1].replace(thaiMarks, '');
      return base || rawChars[1];
    }
    const base = rawChars[0].replace(thaiMarks, '');
    return base || rawChars[0];
  };

  if (parts.length >= 2) {
    const firstChar = getInitialConsonant(parts[0]);
    const lastChar = getInitialConsonant(parts[parts.length - 1]);
    return (firstChar + lastChar).toUpperCase();
  } else if (parts.length === 1) {
    const word = parts[0];
    const pureLetters = Array.from(word.replace(thaiMarks, '')).filter(c => !leadingVowels.includes(c));
    if (pureLetters.length >= 2) {
      return (pureLetters[0] + pureLetters[1]).toUpperCase();
    }
    return word.substring(0, 2).toUpperCase();
  }

  return 'U';
}

function getRoleColor(role) {
  const r = (role || "").toUpperCase();
  if (r === "L4" || r.includes("EXECUTIVE") || r.includes("ผู้บริหาร")) return "#be185d";
  if (r === "L3" || r.includes("ADMIN") || r.includes("ผู้ดูแล") || r.includes("MANAGER")) return "#7c3aed";
  if (r === "L2" || r.includes("STAFF") || r.includes("เจ้าหน้าที่")) return "#ea580c";
  if (r === "L1" || r.includes("TEACHER") || r.includes("ครู")) return "#0284c7";
  return "#64748b";
}

// USERS
app.get('/api/users', (req, res) => {
  const users = readUsers();
  const refreshedUsers = users.map(u => ({
    ...u,
    initials: calculateUserInitials(u.name) || u.initials || 'U'
  }));
  res.json(refreshedUsers);
});

app.post('/api/users', (req, res) => {
  const users = readUsers();
  const newUser = req.body;
  newUser.id = "u_" + (newUser.teacherId || Date.now());
  
  // Format role and roleName
  const roleNames = {
    'L1': 'Teacher / User',
    'L2': 'Staff / Operator',
    'L3': 'Manager / System Manager',
    'L4': 'Executive / Head of Department'
  };
  newUser.role = newUser.role || 'L1';
  newUser.roleName = roleNames[newUser.role] || 'Teacher / User';
  newUser.teacherId = (newUser.teacherId || '').trim();
  newUser.assignedRooms = Array.isArray(newUser.assignedRooms) ? newUser.assignedRooms : [];
  newUser.isActive = newUser.isActive !== false;
  newUser.createdAt = newUser.createdAt || new Date().toISOString();

  // If password not set, default password is the teacherId
  if (!newUser.password) {
    newUser.password = newUser.teacherId;
  }
  
  // Assign avatar color strictly based on role
  newUser.color = getRoleColor(newUser.role);
  newUser.initials = calculateUserInitials(newUser.name);
  
  users.push(newUser);
  writeUsers(users);
  const copy = { ...newUser };
  delete copy.password;
  syncToGoogleSheets('Users', 'UPSERT', copy, 'teacherId');
  res.json({ success: true, user: newUser });
});

app.post('/api/users/batch', (req, res) => {
  const users = readUsers();
  const incomingList = req.body;
  if (!Array.isArray(incomingList) || incomingList.length === 0) {
    return res.status(400).json({ success: false, error: 'Expected a non-empty array of users' });
  }

  const roleNames = {
    'L1': 'Teacher / User',
    'L2': 'Staff / Operator',
    'L3': 'Manager / System Manager',
    'L4': 'Executive / Head of Department'
  };
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#d946ef", "#be185d"];

  let addedCount = 0;
  let updatedCount = 0;
  const processedUsers = [];

  incomingList.forEach(u => {
    const teacherId = (u.teacherId || '').toString().trim();
    if (!teacherId) return;

    const role = (u.role || 'L1').toUpperCase();
    const cleanRole = ['L1', 'L2', 'L3', 'L4'].includes(role) ? role : 'L1';
    
    // Parse assignedRooms if string
    let assignedRooms = [];
    if (Array.isArray(u.assignedRooms)) {
      assignedRooms = u.assignedRooms;
    } else if (typeof u.assignedRooms === 'string' && u.assignedRooms.trim()) {
      assignedRooms = u.assignedRooms.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
    }

    const name = (u.name || '').trim();
    const dept = (u.department || '').trim() || 'กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี';
    const email = (u.email || '').trim() || `${teacherId.toLowerCase()}@lab.school.ac.th`;
    const password = u.password || teacherId;
    const defaultColor = cleanRole === 'L2' ? '#ea580c' : cleanRole === 'L3' ? '#7c3aed' : cleanRole === 'L4' ? '#be185d' : '#0284c7';

    const formattedUser = {
      id: "u_" + teacherId,
      teacherId: teacherId,
      name: name || `ผู้ใช้งาน ${teacherId}`,
      department: dept,
      email: email,
      role: cleanRole,
      roleName: roleNames[cleanRole] || 'Teacher / User',
      assignedRooms: assignedRooms,
      password: password,
      initials: calculateUserInitials(name),
      color: u.color || defaultColor,
      isActive: u.isActive !== false,
      createdAt: u.createdAt || new Date().toISOString()
    };

    const existingIdx = users.findIndex(ex => (ex.teacherId || '').toLowerCase() === teacherId.toLowerCase());
    if (existingIdx !== -1) {
      users[existingIdx] = { ...users[existingIdx], ...formattedUser };
      updatedCount++;
      processedUsers.push(users[existingIdx]);
    } else {
      users.push(formattedUser);
      addedCount++;
      processedUsers.push(formattedUser);
    }

    const copy = { ...formattedUser };
    delete copy.password;
    syncToGoogleSheets('Users', 'UPSERT', copy, 'teacherId');
  });

  writeUsers(users);
  res.json({
    success: true,
    addedCount: addedCount,
    updatedCount: updatedCount,
    totalProcessed: processedUsers.length,
    users: users
  });
});

app.put('/api/users/:id', (req, res) => {
  const users = readUsers();
  const index = users.findIndex(u => u.id === req.params.id);
  if (index !== -1) {
    const roleNames = {
      'L1': 'Teacher / User',
      'L2': 'Staff / Operator',
      'L3': 'Manager / System Manager',
      'L4': 'Executive / Head of Department'
    };
    const updated = { ...users[index], ...req.body };
    if (updated.name) {
      updated.initials = calculateUserInitials(updated.name);
    }
    if (req.body.role) {
      updated.roleName = roleNames[req.body.role] || updated.roleName;
    }
    if (req.body.assignedRooms) {
      updated.assignedRooms = Array.isArray(req.body.assignedRooms) ? req.body.assignedRooms : [];
    }
    users[index] = updated;
    writeUsers(users);
    const copy = { ...users[index] };
    delete copy.password;
    syncToGoogleSheets('Users', 'UPSERT', copy, 'teacherId');
    res.json({ success: true, user: users[index] });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

app.delete('/api/users/:id', (req, res) => {
  let users = readUsers();
  const userToDelete = users.find(u => u.id === req.params.id);
  users = users.filter(u => u.id !== req.params.id);
  writeUsers(users);
  if (userToDelete) {
    syncToGoogleSheets('Users', 'DELETE', { teacherId: userToDelete.teacherId }, 'teacherId');
  }
  res.json({ success: true });
});

// AUTH LOGIN ENDPOINT (Supports Teacher ID as username & password)
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();
  
  const cleanUser = (username || '').trim();
  const cleanPass = (password || '').trim();

  // Find user by teacherId, email, or id
  const user = users.find(u => 
    (u.teacherId && u.teacherId.toLowerCase() === cleanUser.toLowerCase()) ||
    (u.email && u.email.toLowerCase() === cleanUser.toLowerCase()) ||
    (u.id && u.id.toLowerCase() === cleanUser.toLowerCase()) ||
    (cleanUser.toLowerCase() === 'admin' && (u.role === 'L3' || u.role === 'admin'))
  );

  if (user) {
    // Check password (default is teacherId if not set, or match explicit password)
    const expectedPassword = user.password || user.teacherId;
    if (cleanPass === expectedPassword || (cleanUser.toLowerCase() === 'admin' && cleanPass === 'admin1234')) {
      return res.json({
        success: true,
        user: {
          id: user.id,
          teacherId: user.teacherId || user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'L1',
          roleName: user.roleName || 'Teacher / User',
          department: user.department || '',
          assignedRooms: user.assignedRooms || [],
          initials: calculateUserInitials(user.name) || user.initials || 'U',
          color: user.color || '#3b82f6'
        }
      });
    }
  }

  // Fallback for default hardcoded quick accounts
  if (cleanUser === 'admin' && (cleanPass === 'admin' || cleanPass === 'admin1234')) {
    return res.json({
      success: true,
      user: {
        id: "u_admin",
        teacherId: "admin",
        name: "ผู้ดูแลระบบ (Admin)",
        email: "admin@lab.school.ac.th",
        role: "L3",
        roleName: "Manager / System Manager",
        department: "งานบริหารระบบห้องปฏิบัติการ",
        assignedRooms: [],
        initials: "AD",
        color: "#7c3aed"
      }
    });
  }

  return res.status(401).json({ success: false, message: "รหัสประจำตัวครูหรือรหัสผ่านไม่ถูกต้อง" });
});

// AUDIT LOGS
app.get('/api/audit-logs', (req, res) => {
  res.json(readAuditLogs());
});

app.post('/api/audit-logs', (req, res) => {
  const logs = readAuditLogs();
  const newLog = req.body;
  newLog.id = "log-" + Date.now();
  newLog.timestamp = new Date().toISOString();
  logs.unshift(newLog); // prepend to top
  
  // Keep only last 100 logs
  if (logs.length > 100) logs.pop();
  
  writeAuditLogs(logs);
  syncToGoogleSheets('Audit_Logs', 'UPSERT', newLog, 'id');
  res.json({ success: true, log: newLog });
});

// GET /api/layouts
app.get('/api/layouts', (req, res) => {
  res.json(readLayouts());
});

// POST /api/layouts
app.post('/api/layouts', (req, res) => {
  const success = writeLayouts(req.body);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: "Failed to save layouts" });
  }
});

// FEEDBACKS
app.get('/api/feedbacks', (req, res) => {
  res.json(readFeedbacks());
});

app.post('/api/feedbacks', (req, res) => {
  const feedbacks = readFeedbacks();
  const newFeedback = req.body;
  newFeedback.id = newFeedback.id || "fb-" + Date.now();
  newFeedback.timestamp = newFeedback.timestamp || new Date().toISOString();
  newFeedback.status = newFeedback.status || "unread";
  
  feedbacks.unshift(newFeedback);
  
  writeFeedbacks(feedbacks);
  res.json({ success: true, feedback: newFeedback });
});

app.put('/api/feedbacks/:id', (req, res) => {
  const feedbacks = readFeedbacks();
  const index = feedbacks.findIndex(f => f.id === req.params.id);
  if (index !== -1) {
    feedbacks[index] = { ...feedbacks[index], ...req.body };
    writeFeedbacks(feedbacks);
    res.json({ success: true, feedback: feedbacks[index] });
  } else {
    res.status(404).json({ error: "Feedback not found" });
  }
});

// ANNOUNCEMENTS
app.get('/api/announcements', (req, res) => {
  res.json(readAnnouncements());
});

app.post('/api/announcements', (req, res) => {
  const success = writeAnnouncements(req.body);
  if (success) {
    res.json({ success: true, settings: req.body });
  } else {
    res.status(500).json({ error: "Failed to save announcements" });
  }
});

// EMERGENCY CONTACTS
app.get('/api/emergency-contacts', (req, res) => {
  res.json(readEmergencyContacts());
});

app.post('/api/emergency-contacts', (req, res) => {
  const success = writeEmergencyContacts(req.body);
  if (success) {
    syncToGoogleSheets('Announcements', 'UPSERT', { ...readAnnouncements(), emergencyContacts: req.body }, 'badgeText');
    res.json({ success: true, contacts: req.body });
  } else {
    res.status(500).json({ error: "Failed to save emergency contacts" });
  }
});

// ==========================================
// WEB PUSH NOTIFICATIONS & QUICK APPROVALS
// ==========================================

// Helper: Read push subscriptions
function readPushSubscriptions() {
  try {
    if (!fs.existsSync(PUSH_SUBSCRIPTIONS_FILE)) {
      fs.writeFileSync(PUSH_SUBSCRIPTIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const data = fs.readFileSync(PUSH_SUBSCRIPTIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper: Save push subscriptions
function writePushSubscriptions(subs) {
  try {
    fs.writeFileSync(PUSH_SUBSCRIPTIONS_FILE, JSON.stringify(subs, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return false;
  }
}

// Helper: Broadcast push notification to all admin subscriptions
async function sendPushToAdmins(payload) {
  const subscriptions = readPushSubscriptions();
  if (!subscriptions || subscriptions.length === 0) return;

  const validSubscriptions = [];
  const stringifiedPayload = JSON.stringify(payload);

  for (const item of subscriptions) {
    try {
      if (item && item.subscription) {
        await webpush.sendNotification(item.subscription, stringifiedPayload);
        validSubscriptions.push(item);
      }
    } catch (err) {
      console.warn('Push delivery failed for subscription:', err.statusCode || err.message);
      // Remove subscriptions that are expired or 410/404 Gone
      if (err.statusCode !== 410 && err.statusCode !== 404) {
        validSubscriptions.push(item);
      }
    }
  }

  if (validSubscriptions.length !== subscriptions.length) {
    writePushSubscriptions(validSubscriptions);
  }
}

// GET VAPID Public Key
app.get('/api/push-vapid-public-key', (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

// GET Push Subscriptions status
app.get('/api/push-subscriptions', (req, res) => {
  const subs = readPushSubscriptions();
  res.json({ count: subs.length, subscriptions: subs });
});

// POST Save Push Subscription
app.post('/api/push-subscriptions', (req, res) => {
  const { subscription, userRole, deviceName } = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: "Invalid subscription data" });
  }

  const subs = readPushSubscriptions();
  const existingIdx = subs.findIndex(s => s.subscription && s.subscription.endpoint === subscription.endpoint);
  
  const record = {
    id: "sub_" + Date.now(),
    subscription,
    userRole: userRole || "admin",
    deviceName: deviceName || "Browser",
    updatedAt: new Date().toISOString()
  };

  if (existingIdx !== -1) {
    subs[existingIdx] = record;
  } else {
    subs.push(record);
  }

  writePushSubscriptions(subs);
  res.json({ success: true, count: subs.length });
});

// DELETE Push Subscription
app.delete('/api/push-subscriptions', (req, res) => {
  const { endpoint } = req.body;
  let subs = readPushSubscriptions();
  subs = subs.filter(s => s.subscription && s.subscription.endpoint !== endpoint);
  writePushSubscriptions(subs);
  res.json({ success: true, count: subs.length });
});

// POST Send Test Push Notification
app.post('/api/test-push', async (req, res) => {
  const subs = readPushSubscriptions();
  if (subs.length === 0) {
    return res.status(400).json({ error: "ยังไม่มีอุปกรณ์แอดมินลงทะเบียนรับแจ้งเตือน" });
  }

  const payload = {
    title: "🔔 ทดสอบการแจ้งเตือนแอดมิน (Web Push)",
    body: "ระบบพร้อมส่งแจ้งเตือนคำขอและรองรับการกดอนุมัติแล้ว!",
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    data: { type: "test", time: Date.now() },
    actions: [
      { action: "view", title: "🔍 เปิดหน้าระบบ" }
    ]
  };

  await sendPushToAdmins(payload);
  res.json({ success: true, sentToCount: subs.length });
});

// POST Trigger Push Notification for new request
app.post('/api/notify-admins', async (req, res) => {
  const { type, id, title, booker, item, date, room, qty, unit } = req.body;
  
  let pushTitle = "🔔 มีคำขอใหม่รอการอนุมัติ";
  let pushBody = "มีรายการคำขอใหม่จากนักเรียนในระบบ";

  if (type === "booking") {
    pushTitle = "📅 คำขอจองห้องแล็บใหม่!";
    pushBody = `${booker || 'ผู้ใช้'} ขอจอง ${room || 'ห้องแล็บ'} วันที่ ${date || '-'}`;
  } else if (type === "borrow") {
    pushTitle = "🔬 คำขอยืมสารเคมี/อุปกรณ์ใหม่!";
    pushBody = `${booker || 'ผู้ใช้'} ขอยืม ${item || 'พัสดุ'} (${qty || 1} ${unit || 'ชิ้น'})`;
  }

  const payload = {
    title: pushTitle,
    body: pushBody,
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    tag: `request-${type}-${id || Date.now()}`,
    data: {
      id: id,
      type: type,
      url: "/#requests"
    },
    actions: [
      { action: "approve", title: "✅ อนุมัติทันที" },
      { action: "view", title: "🔍 ดูรายละเอียด" }
    ]
  };

  await sendPushToAdmins(payload);
  res.json({ success: true });
});

// POST Quick-Approve directly from Push Notification action button
app.post('/api/quick-approve', (req, res) => {
  const { id, type } = req.body;
  if (!id) {
    return res.status(400).json({ error: "Missing request ID" });
  }

  if (type === "booking") {
    const bookings = readBookings();
    const bkIndex = bookings.findIndex(b => b.id === id);
    if (bkIndex === -1) {
      return res.status(404).json({ error: "ไม่พบข้อมูลคำขอจองห้องแล็บ" });
    }
    if (bookings[bkIndex].status === "approved") {
      return res.json({ success: true, message: "คำขอนี้ได้รับการอนุมัติไปแล้ว" });
    }

    bookings[bkIndex].status = "approved";
    bookings[bkIndex].approvedAt = new Date().toISOString();
    writeBookings(bookings);

    // Add Audit log
    const logs = readAuditLogs();
    logs.unshift({
      id: "log-" + Date.now(),
      action: "QUICK_APPROVE_BOOKING",
      details: `อนุมัติการจองห้อง ${bookings[bkIndex].room} ของ ${bookings[bkIndex].bookerName} ผ่าน Push Notification`,
      timestamp: new Date().toISOString(),
      user: "Admin (Push Action)"
    });
    writeAuditLogs(logs);

    return res.json({ 
      success: true, 
      message: `อนุมัติการจองห้อง "${bookings[bkIndex].room}" เรียบร้อยแล้ว!` 
    });
  } 
  else if (type === "borrow") {
    const transactions = readTransactions();
    const txIndex = transactions.findIndex(t => t.id === id);
    if (txIndex === -1) {
      return res.status(404).json({ error: "ไม่พบรายการคำขอยืม" });
    }
    if (transactions[txIndex].status === "borrowed" || transactions[txIndex].status === "approved") {
      return res.json({ success: true, message: "คำขอนี้ได้รับการอนุมัติไปแล้ว" });
    }

    const tx = transactions[txIndex];
    const items = readDatabase();
    const itemIndex = items.findIndex(i => i.code === tx.itemCode);

    if (itemIndex !== -1) {
      const item = items[itemIndex];
      if (item.qty < (tx.qty || 1)) {
        return res.status(400).json({ error: `สต็อกคงเหลือไม่พอ (${item.qty} ${item.unit || ''})` });
      }
      items[itemIndex].qty = item.qty - (tx.qty || 1);
      writeDatabase(items);
    }

    transactions[txIndex].status = "borrowed";
    transactions[txIndex].approvedAt = new Date().toISOString();
    writeTransactions(transactions);

    // Add Audit log
    const logs = readAuditLogs();
    logs.unshift({
      id: "log-" + Date.now(),
      action: "QUICK_APPROVE_BORROW",
      details: `อนุมัติคำขอยืม ${tx.itemName} จำนวน ${tx.qty} โดย ${tx.borrower} ผ่าน Push Notification`,
      timestamp: new Date().toISOString(),
      user: "Admin (Push Action)"
    });
    writeAuditLogs(logs);

    return res.json({ 
      success: true, 
      message: `อนุมัติคำขอยืม "${tx.itemName}" และตัดสต็อกเรียบร้อยแล้ว!` 
    });
  }

  res.status(400).json({ error: "Unknown request type" });
});

// DANGER ZONE (Clear Workspace)
app.delete('/api/workspace', (req, res) => {
  try {
    // Clear the core arrays but keep the files
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2), 'utf-8');
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
    fs.writeFileSync(PURCHASE_ORDERS_FILE, JSON.stringify([], null, 2), 'utf-8');
    fs.writeFileSync(FEEDBACKS_FILE, JSON.stringify([], null, 2), 'utf-8');
    // Audit logs remain for compliance, or clear them too depending on requirement. Let's clear them too for this demo.
    fs.writeFileSync(AUDIT_LOGS_FILE, JSON.stringify([], null, 2), 'utf-8');
    
    // Add a final audit log for the reset action itself
    const finalLog = [{ id: "log-reset", action: "RESET_WORKSPACE", details: "Workspace was completely reset.", timestamp: new Date().toISOString(), user: "Admin" }];
    fs.writeFileSync(AUDIT_LOGS_FILE, JSON.stringify(finalLog, null, 2), 'utf-8');
    
    res.json({ success: true, message: "Workspace has been completely cleared." });
  } catch (err) {
    res.status(500).json({ error: "Failed to reset workspace." });
  }
});

// Start Express Web Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🧪 Laboratory Management System Backend running!`);
  console.log(`🌐 Server available at: http://localhost:${PORT}`);
  console.log(`🗃️ Database file: ${DB_FILE}`);
  console.log(`=======================================================`);
});
