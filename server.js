require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const fs = require('fs');
const path = require('path');
const webpush = require('web-push');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';
// ─── JWT SECRET ENFORCEMENT ──────────────────────────────────────────────────
// Strictly require JWT_SECRET from environment. NO fallback, NO default hardcoded secret.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('');
  console.error('╔══════════════════════════════════════════════════════════════╗');
  console.error('║  FATAL: JWT_SECRET environment variable is not set.          ║');
  console.error('║                                                              ║');
  console.error('║  Generate a secure secret and add it to your environment:    ║');
  console.error('║    node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))" ║');
  console.error('║                                                              ║');
  console.error('║  Then set:  JWT_SECRET=<generated_value>                     ║');
  console.error('║  The server will NOT start without this value.              ║');
  console.error('╚══════════════════════════════════════════════════════════════╝');
  console.error('');
  if (require.main === module) {
    process.exit(1);
  }
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

// In-memory blacklist for revoked tokens (logout)
const revokedTokens = new Set();

// Clean up expired tokens periodically (every 1 hour)
setInterval(() => {
  // If memory grows large, clear old invalid tokens
  if (revokedTokens.size > 10000) {
    revokedTokens.clear();
  }
}, 3600000).unref();

// ─── SUPABASE CONFIGURATION ───────────────────────────────────────────────────
// Values MUST come from environment variables. No hardcoded fallbacks.
// Supabase is optional (graceful degradation); missing vars disable cloud sync.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
let supabase = null;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('⚠️  SUPABASE_URL or SUPABASE_KEY not set — Supabase cloud sync disabled. Set these in .env to enable.');
} else {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('🚀 Supabase connected in server backend');
  } catch(e) {
    console.warn('Supabase init failed in server:', e.message);
  }
}

// Disable Express server technology disclosure
app.disable('x-powered-by');

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://script.google.com https://script.googleusercontent.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'"
  ].join('; ');
  res.setHeader('Content-Security-Policy', cspDirectives);

  next();
});

// Hardened CORS configuration (restricts arbitrary origins while allowing app domains)
const allowedOrigins = [
  'https://chemicallab.vercel.app',
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some(allowed =>
      allowed instanceof RegExp ? allowed.test(origin) : allowed === origin
    );
    if (isAllowed) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Security Guard: Strictly block public exposure of sensitive database schemas, migrations, and local seed files
app.use((req, res, next) => {
  const reqPath = (req.path || '').toLowerCase();
  if (
    reqPath.endsWith('.sql') ||
    reqPath.startsWith('/dist') ||
    reqPath.startsWith('/migrations') ||
    reqPath.startsWith('/scripts') ||
    reqPath.includes('users.example.json') ||
    reqPath.includes('users.json') ||
    reqPath.includes('vapid_keys.json') ||
    reqPath.includes('temporary_credentials.json')
  ) {
    return res.status(404).send('Not Found');
  }
  next();
});

// High-performance gzip/deflate compression for static assets and API responses
app.use(compression({
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// High-performance static serving with ETag validation & asset-optimized caching
app.use(express.static(path.join(__dirname), {
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (
      filePath.endsWith('.woff2') ||
      filePath.endsWith('.woff') ||
      filePath.endsWith('.ttf') ||
      filePath.endsWith('.svg') ||
      filePath.endsWith('.png') ||
      filePath.endsWith('.webp') ||
      filePath.endsWith('.ico')
    ) {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    } else if (
      filePath.endsWith('.js') ||
      filePath.endsWith('.css') ||
      filePath.endsWith('.html') ||
      filePath.endsWith('.json')
    ) {
      res.setHeader('Cache-Control', 'no-cache');
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
const USERS_EXAMPLE_FILE = path.join(DB_DIR, 'users.example.json');
const AUDIT_LOGS_FILE = path.join(DB_DIR, 'audit_logs.json');
const LAYOUTS_FILE = path.join(DB_DIR, 'layouts.json');
const FEEDBACKS_FILE = path.join(DB_DIR, 'feedbacks.json');
const PUSH_SUBSCRIPTIONS_FILE = path.join(DB_DIR, 'push_subscriptions.json');
const VAPID_KEYS_FILE = path.join(DB_DIR, 'vapid_keys.json');
const ANNOUNCEMENTS_FILE = path.join(DB_DIR, 'announcements.json');
const EMERGENCY_CONTACTS_FILE = path.join(DB_DIR, 'emergency_contacts.json');
const STOCK_MOVEMENTS_FILE = path.join(DB_DIR, 'stock_movements.json');
const STOCK_ADJUSTMENTS_FILE = path.join(DB_DIR, 'stock_adjustments.json');
const EQUIPMENT_MAINTENANCE_FILE = path.join(DB_DIR, 'equipment_maintenance.json');
const EQUIPMENT_REPAIRS_FILE = path.join(DB_DIR, 'equipment_repairs.json');

// Ensure data directory exists
try {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
} catch (e) {}

// Initialize VAPID Keys for Web Push
function getOrGenerateVapidKeys() {
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    return {
      publicKey: process.env.VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY
    };
  }

  try {
    if (fs.existsSync(VAPID_KEYS_FILE)) {
      const keys = JSON.parse(fs.readFileSync(VAPID_KEYS_FILE, 'utf-8'));
      if (keys.publicKey && keys.privateKey) return keys;
    }
  } catch (e) {}

  try {
    const newKeys = webpush.generateVAPIDKeys();
    try {
      fs.writeFileSync(VAPID_KEYS_FILE, JSON.stringify(newKeys, null, 2), 'utf-8');
    } catch (e) {}
    return newKeys;
  } catch (e) {
    return { publicKey: '', privateKey: '' };
  }
}

const vapidKeys = getOrGenerateVapidKeys();
try {
  if (vapidKeys.publicKey && vapidKeys.privateKey) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:admin@chemlab.local',
      vapidKeys.publicKey,
      vapidKeys.privateKey
    );
  }
} catch (e) {}

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
      const initial = NODE_ENV === 'production' ? [] : DEFAULT_SEEDS;
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database:", err);
    return [];
  }
}

// Helper: Safe JSON File Writer (prevents touching file timestamp if content is unchanged, avoiding infinite reload loops)
function safeWriteJson(filePath, data) {
  try {
    const jsonStr = JSON.stringify(data, null, 2);
    if (fs.existsSync(filePath)) {
      try {
        const existing = fs.readFileSync(filePath, 'utf-8');
        if (existing === jsonStr) {
          return true; // Content unchanged, do not touch file!
        }
      } catch (readErr) {}
    } else {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, jsonStr, 'utf-8');
    return true;
  } catch (err) {
    console.error("Error writing " + filePath + ":", err.message);
    return false;
  }
}

// Helper: Save items to database
function writeDatabase(items) {
  return safeWriteJson(DB_FILE, items);
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
  return safeWriteJson(BUDGET_FILE, budgetData);
}

// Helper: Read purchase orders from database
function readPurchaseOrders() {
  try {
    if (!fs.existsSync(PURCHASE_ORDERS_FILE)) {
      const defaultOrders = NODE_ENV === 'production' ? [] : [
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
      safeWriteJson(PURCHASE_ORDERS_FILE, defaultOrders);
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
  return safeWriteJson(PURCHASE_ORDERS_FILE, orders);
}

// Helper: Read bookings from database
function readBookings() {
  try {
    if (!fs.existsSync(BOOKINGS_FILE)) {
      safeWriteJson(BOOKINGS_FILE, []);
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
  return safeWriteJson(BOOKINGS_FILE, bookings);
}

// Helper: Read layouts from database
function readLayouts() {
  try {
    if (!fs.existsSync(LAYOUTS_FILE)) {
      safeWriteJson(LAYOUTS_FILE, {});
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
  return safeWriteJson(LAYOUTS_FILE, layouts);
}

// Helper: Read transactions from database
function readTransactions() {
  try {
    if (!fs.existsSync(TRANSACTIONS_FILE)) {
      safeWriteJson(TRANSACTIONS_FILE, []);
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
  return safeWriteJson(TRANSACTIONS_FILE, transactions);
}

// Helper: Read stock movements
function readStockMovements() {
  try {
    if (!fs.existsSync(STOCK_MOVEMENTS_FILE)) {
      safeWriteJson(STOCK_MOVEMENTS_FILE, []);
      return [];
    }
    const data = fs.readFileSync(STOCK_MOVEMENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper: Save stock movements
function writeStockMovements(movements) {
  return safeWriteJson(STOCK_MOVEMENTS_FILE, movements);
}

// Helper: Read stock adjustments
function readStockAdjustments() {
  try {
    if (!fs.existsSync(STOCK_ADJUSTMENTS_FILE)) {
      safeWriteJson(STOCK_ADJUSTMENTS_FILE, []);
      return [];
    }
    const data = fs.readFileSync(STOCK_ADJUSTMENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper: Save stock adjustments
function writeStockAdjustments(adjustments) {
  return safeWriteJson(STOCK_ADJUSTMENTS_FILE, adjustments);
}

// Helper: Read equipment maintenance logs
function readEquipmentMaintenance() {
  try {
    if (!fs.existsSync(EQUIPMENT_MAINTENANCE_FILE)) {
      safeWriteJson(EQUIPMENT_MAINTENANCE_FILE, []);
      return [];
    }
    const data = fs.readFileSync(EQUIPMENT_MAINTENANCE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper: Write equipment maintenance logs
function writeEquipmentMaintenance(logs) {
  return safeWriteJson(EQUIPMENT_MAINTENANCE_FILE, logs);
}

// Helper: Read equipment repair requests
function readEquipmentRepairs() {
  try {
    if (!fs.existsSync(EQUIPMENT_REPAIRS_FILE)) {
      safeWriteJson(EQUIPMENT_REPAIRS_FILE, []);
      return [];
    }
    const data = fs.readFileSync(EQUIPMENT_REPAIRS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper: Write equipment repair requests
function writeEquipmentRepairs(repairs) {
  return safeWriteJson(EQUIPMENT_REPAIRS_FILE, repairs);
}

// Helper: Read users (Strictly Development / Offline Mock Data)
function readUsers() {
  if (IS_PRODUCTION) {
    // SECURITY: In production, user profiles and credentials MUST NOT be loaded from local files
    return [];
  }
  try {
    if (!fs.existsSync(USERS_FILE)) {
      if (fs.existsSync(USERS_EXAMPLE_FILE)) {
        try {
          const exampleData = fs.readFileSync(USERS_EXAMPLE_FILE, 'utf-8');
          safeWriteJson(USERS_FILE, JSON.parse(exampleData));
          return JSON.parse(exampleData);
        } catch (e) {}
      }
      return [];
    }
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeUsers(users) {
  if (IS_PRODUCTION) {
    // SECURITY: In production, local user file modification is disabled
    return false;
  }
  return safeWriteJson(USERS_FILE, users);
}

// Helper: Read audit logs
function readAuditLogs() {
  try {
    if (!fs.existsSync(AUDIT_LOGS_FILE)) {
      safeWriteJson(AUDIT_LOGS_FILE, []);
      return [];
    }
    const data = fs.readFileSync(AUDIT_LOGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeAuditLogs(logs) {
  return safeWriteJson(AUDIT_LOGS_FILE, logs);
}

// ==========================================
// SECURITY, AUTHENTICATION & RBAC MIDDLEWARES
// ==========================================

// Helper: Normalize user role string
function normalizeRole(role) {
  if (!role) return 'L0';
  const r = String(role).toUpperCase().trim();
  if (r === 'ADMIN' || r === 'L3') return 'L3';
  if (r === 'STAFF' || r === 'L2') return 'L2';
  if (r === 'TEACHER' || r === 'L1') return 'L1';
  if (r === 'EXECUTIVE' || r === 'L4') return 'L4';
  return r;
}

// Breached historical credentials from Git history that are permanently revoked (excluding teacher IDs)
const LEAKED_HISTORICAL_PASSWORDS = new Set([
  'admin',
  'admin1234',
  'teacher1234',
  'Admin@Lab2026',
  'C#8m!K2$vL',
  'Admin@Lab2805',
  '1234',
  'password',
  '12345678'
]);

// Helper: Verify password with bcrypt (supports Teacher ID default and custom updated passwords)
function verifyPassword(inputPassword, storedPasswordOrHash, user = null) {
  if (!inputPassword || !storedPasswordOrHash) return false;
  const cleanInput = String(inputPassword).trim();
  
  // Guard 1: Never allow historical leaked passwords
  if (LEAKED_HISTORICAL_PASSWORDS.has(cleanInput)) return false;
  
  const strHash = String(storedPasswordOrHash).trim();
  if (strHash.startsWith('$2a$') || strHash.startsWith('$2b$')) {
    if (bcrypt.compareSync(cleanInput, strHash)) return true;
  }
  
  // Plaintext match fallback
  if (cleanInput === strHash) return true;

  // Allow login with Teacher ID if user's password defaults to teacherId
  if (user && user.teacherId && cleanInput === String(user.teacherId).trim()) {
    if (!strHash || strHash === user.teacherId || !strHash.startsWith('$2')) {
      return true;
    }
  }

  return false;
}

// Helper: Sanitize user object (never leak password / password hash)
function sanitizeUser(u) {
  if (!u) return null;
  const copy = { ...u };
  delete copy.password;
  delete copy.password_hash;
  return copy;
}

// Middleware: Authenticate JWT Token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      code: 'AUTH_REQUIRED',
      message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ (Authentication required)'
    });
  }

  if (revokedTokens.has(token)) {
    return res.status(401).json({
      success: false,
      code: 'TOKEN_REVOKED',
      message: 'เซสชันนี้ได้ออกจากระบบแล้ว กรุณาเข้าสู่ระบบใหม่'
    });
  }

  if (!JWT_SECRET) {
    return res.status(500).json({
      success: false,
      code: 'SERVER_MISCONFIGURED',
      message: 'ระบบรักษาความปลอดภัยไม่พร้อมใช้งาน (JWT_SECRET is not configured)'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          code: 'TOKEN_EXPIRED',
          message: 'เซสชันการใช้งานหมดอายุ กรุณาเข้าสู่ระบบใหม่ (Session expired)'
        });
      }
      return res.status(401).json({
        success: false,
        code: 'TOKEN_INVALID',
        message: 'โทเค็นยืนยันตัวตนไม่ถูกต้อง (Invalid token)'
      });
    }
    req.user = decoded;
    req.token = token;
    next();
  });
}

// Middleware: Optional Authentication (attaches req.user if token is present and valid)
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (!token || revokedTokens.has(token)) {
    req.user = null;
    return next();
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    req.user = err ? null : decoded;
    req.token = token;
    next();
  });
}

// Middleware: Role-Based Access Control (RBAC)
function requireRole(...allowedRoles) {
  const normalizedAllowed = allowedRoles.map(r => normalizeRole(r));
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: 'AUTH_REQUIRED',
        message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ'
      });
    }
    const userRole = normalizeRole(req.user.role || req.user.roleLevel);
    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        message: `คุณไม่มีสิทธิ์เข้าถึงฟังก์ชันนี้ (ต้องการ ${allowedRoles.join('/')} แต่คุณคือ ${userRole})`
      });
    }
    next();
  };
}

// Helper: Normalize room name for strict & robust comparison
function normalizeRoomIdentifier(str) {
  if (!str) return '';
  str = String(str).toLowerCase().trim();
  const m = str.match(/(?:lab|ห้อง|ห้องปฏิบัติการ|ห้องแล็บ)\s*([0-9]+|[a-z]+)/i);
  if (m) {
    return `lab_${m[1]}`;
  }
  return str.replace(/\s+/g, '_');
}

function isRoomMatching(roomA, roomB) {
  if (!roomA || !roomB) return false;
  const strA = String(roomA).toLowerCase().trim();
  const strB = String(roomB).toLowerCase().trim();
  if (strA === strB) return true;
  const normA = normalizeRoomIdentifier(roomA);
  const normB = normalizeRoomIdentifier(roomB);
  if (normA && normB && normA === normB) return true;
  return strA.includes(strB) || strB.includes(strA);
}

// Helper: Check if user has permission to manage items/bookings in a specific room
// SECURITY RULE: Empty assignedRooms strictly gives NO permission. Explicit permission required.
function canUserAccessRoom(user, targetRoom) {
  if (!user) return false;
  const role = normalizeRole(user.role || user.roleLevel);
  // Admins and Executives have global room access
  if (role === 'L3' || role === 'L4') return true;

  // Staff (L2): MUST have explicitly assigned rooms. Empty or missing assignedRooms = NO PERMISSION.
  if (role === 'L2') {
    if (!targetRoom || String(targetRoom).trim() === '') {
      return false; // Items or actions without a designated room cannot be managed by room-scoped staff
    }
    let assigned = user.assignedRooms;
    if (typeof assigned === 'string' && assigned.trim()) {
      assigned = assigned.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
    }
    if (!Array.isArray(assigned) || assigned.length === 0) {
      return false; // Strict: No assigned rooms = ZERO permission
    }
    return assigned.some(r => isRoomMatching(r, targetRoom));
  }

  return false;
}

// Enhanced Central Audit Log Function
function recordAuditLog({ actorId, actorName, actorRole, action, resource, resourceId, details, req }) {
  try {
    const logs = readAuditLogs();
    const user = req ? req.user : null;
    const newLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
      actorId: actorId || (user ? (user.teacherId || user.id) : 'system'),
      actorName: actorName || (user ? user.name : 'ระบบอัตโนมัติ'),
      actorRole: actorRole || (user ? (user.role || user.roleLevel) : 'L0'),
      action: action || 'ACTION',
      resource: resource || 'general',
      resourceId: resourceId ? String(resourceId) : '',
      details: typeof details === 'object' ? JSON.stringify(details) : (details || ''),
      ip: req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '') : ''
    };
    logs.unshift(newLog);
    if (logs.length > 500) logs.pop();
    writeAuditLogs(logs);

    if (supabase) {
      supabase.from('audit_logs').insert([newLog]).then(null, err => {
        console.warn('Supabase audit log sync notice:', err.message);
      });
    }
    return newLog;
  } catch (e) {
    console.error('Audit log write error:', e.message);
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
    if (supabase) {
      supabase.from('system').upsert({
        key: 'lab_announcement_settings',
        value: settings
      }).catch(err => console.log('Supabase announcement write note:', err.message));
    }
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
// GOOGLE_SCRIPT_URL must be set in .env to enable Google Sheets sync.
// If absent, all syncToGoogleSheets() calls are silently skipped (graceful no-op).
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || null;

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

// Resilient Cloud Fetcher for Google Sheets (Dual POST / GET strategy)
async function fetchGoogleSheetTable(table) {
  if (!GOOGLE_SCRIPT_URL) return [];
  try {
    const postRes = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'GET_DATA', table })
    });
    if (postRes.ok) {
      const json = await postRes.json();
      if (json.status === 'success' && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch (e) {}

  try {
    const getRes = await fetch(`${GOOGLE_SCRIPT_URL}?table=${encodeURIComponent(table)}`, {
      method: 'GET',
      redirect: 'follow'
    });
    if (getRes.ok) {
      const json = await getRes.json();
      if (json.status === 'success' && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch (e) {}

  return [];
}

// ==========================================================================
// SOURCE OF TRUTH: SUPABASE (with Local Offline Standby & Google Sheets Backup)
// ==========================================================================

let itemsCache = null;
let lastItemsFetch = 0;
let inFlightItemsPromise = null;

async function fetchLiveItems(forceRefresh = false) {
  if (!forceRefresh && itemsCache && (Date.now() - lastItemsFetch < 15000)) {
    return itemsCache;
  }

  if (!forceRefresh && inFlightItemsPromise) {
    return inFlightItemsPromise;
  }

  const fetchPromise = (async () => {
    // 1. Primary Source of Truth: Supabase
    if (supabase) {
      try {
        const { data: supaItems, error } = await supabase.from('items').select('*');
        if (!error && Array.isArray(supaItems) && supaItems.length > 0) {
          const activeItems = supaItems.filter(item => {
            if (item.is_deleted === true || item.isDeleted === true) return false;
            if (NODE_ENV === 'production' && String(item.code || '').startsWith('DEMO-')) return false;
            return true;
          });

          const normalized = activeItems.map(item => ({
            ...item,
            qty: Number(item.qty !== undefined ? item.qty : (item.quantity !== undefined ? item.quantity : 0)),
            minAlert: Number(item.minAlert !== undefined ? item.minAlert : (item.min_alert !== undefined ? item.min_alert : 5)),
            damagedQty: Number(item.damagedQty !== undefined ? item.damagedQty : (item.damaged_qty !== undefined ? item.damaged_qty : 0)),
            createdAt: item.createdAt || item.created_at || new Date().toISOString(),
            updatedAt: item.updatedAt || item.updated_at || new Date().toISOString(),
            createdBy: item.createdBy || item.created_by || 'system',
            updatedBy: item.updatedBy || item.updated_by || 'system',
            is_deleted: false
          }));

          if (!fs.existsSync(DB_FILE)) writeDatabase(normalized);
          itemsCache = normalized;
          lastItemsFetch = Date.now();
          return normalized;
        }
      } catch(e) {
        console.warn("[SourceOfTruth:Supabase] Items read notice:", e.message);
      }
    }

    // 2. Standby Offline Backup (Local JSON)
    const localItems = readDatabase().filter(i => !i.is_deleted && !(NODE_ENV === 'production' && String(i.code || '').startsWith('DEMO-')));
    itemsCache = localItems;
    lastItemsFetch = Date.now();
    return localItems;
  })();

  if (!forceRefresh) {
    inFlightItemsPromise = fetchPromise;
  }

  try {
    return await fetchPromise;
  } finally {
    if (!forceRefresh || inFlightItemsPromise === fetchPromise) {
      inFlightItemsPromise = null;
    }
  }
}

let bookingsCache = null;
let lastBookingsFetch = 0;

async function fetchLiveBookings(forceRefresh = false) {
  if (!forceRefresh && bookingsCache && (Date.now() - lastBookingsFetch < 15000)) {
    return bookingsCache;
  }

  // 1. Primary Source of Truth: Supabase
  if (supabase) {
    try {
      const { data: supaBookings, error } = await supabase.from('bookings').select('*');
      if (!error && Array.isArray(supaBookings)) {
        const activeBookings = supaBookings.filter(b => {
          if (b.is_deleted === true || b.isDeleted === true) return false;
          if (NODE_ENV === 'production' && String(b.id || '').startsWith('demo_')) return false;
          return true;
        });

        const normalized = activeBookings.map(b => ({
          ...b,
          slot: b.slot || b.time_slot || '',
          bookerName: b.bookerName || b.booker_name || '',
          prepItems: b.prepItems || b.prep_items || [],
          teacherId: b.teacherId || b.teacher_id || '',
          createdAt: b.createdAt || b.created_at || new Date().toISOString(),
          updatedAt: b.updatedAt || b.updated_at || new Date().toISOString(),
          is_deleted: false
        }));

        if (!fs.existsSync(BOOKINGS_FILE)) writeBookings(normalized);
        bookingsCache = normalized;
        lastBookingsFetch = Date.now();
        return normalized;
      }
    } catch(e) {
      console.warn("[SourceOfTruth:Supabase] Bookings read notice:", e.message);
    }
  }

  // 2. Standby Offline Backup
  const localBookings = readBookings().filter(b => !b.is_deleted && !(NODE_ENV === 'production' && String(b.id || '').startsWith('demo_')));
  bookingsCache = localBookings;
  lastBookingsFetch = Date.now();
  return localBookings;
}

let transactionsCache = null;
let lastTransactionsFetch = 0;

async function fetchLiveTransactions(forceRefresh = false) {
  if (!forceRefresh && transactionsCache && (Date.now() - lastTransactionsFetch < 15000)) {
    return transactionsCache;
  }

  // 1. Primary Source of Truth: Supabase
  if (supabase) {
    try {
      const { data: supaTxs, error } = await supabase.from('transactions').select('*');
      if (!error && Array.isArray(supaTxs)) {
        const activeTxs = supaTxs.filter(tx => {
          if (tx.is_deleted === true || tx.isDeleted === true) return false;
          if (NODE_ENV === 'production' && String(tx.id || '').startsWith('tx-mock')) return false;
          return true;
        });

        const normalized = activeTxs.map(tx => ({
          ...tx,
          itemCode: tx.itemCode || tx.item_code || '',
          itemName: tx.itemName || tx.item_name || '',
          expectedReturnDate: tx.expectedReturnDate || tx.expected_return_date || null,
          returnDate: tx.returnDate || tx.return_date || null,
          damagedQty: Number(tx.damagedQty !== undefined ? tx.damagedQty : (tx.damaged_qty !== undefined ? tx.damaged_qty : 0)),
          createdAt: tx.createdAt || tx.created_at || new Date().toISOString(),
          updatedAt: tx.updatedAt || tx.updated_at || new Date().toISOString(),
          is_deleted: false
        }));

        if (!fs.existsSync(TRANSACTIONS_FILE)) writeTransactions(normalized);
        transactionsCache = normalized;
        lastTransactionsFetch = Date.now();
        return normalized;
      }
    } catch(e) {
      console.warn("[SourceOfTruth:Supabase] Transactions read notice:", e.message);
    }
  }

  // 2. Standby Offline Backup
  const localTxs = readTransactions().filter(tx => !tx.is_deleted && !(NODE_ENV === 'production' && String(tx.id || '').startsWith('tx-mock')));
  transactionsCache = localTxs;
  lastTransactionsFetch = Date.now();
  return localTxs;
}

let poCache = null;
let lastPoFetch = 0;

async function fetchLivePurchaseOrders(forceRefresh = false) {
  if (!forceRefresh && poCache && (Date.now() - lastPoFetch < 15000)) {
    return poCache;
  }

  // 1. Primary Source of Truth: Supabase
  if (supabase) {
    try {
      const { data: supaPOs, error } = await supabase.from('purchase_orders').select('*');
      if (!error && Array.isArray(supaPOs)) {
        const activePOs = supaPOs.filter(po => {
          if (po.is_deleted === true || po.isDeleted === true) return false;
          if (NODE_ENV === 'production' && String(po.id || '').startsWith('ord-mock-')) return false;
          return true;
        });

        const normalized = activePOs.map(po => ({
          ...po,
          unitPrice: Number(po.unitPrice !== undefined ? po.unitPrice : (po.unit_price !== undefined ? po.unit_price : 0)),
          totalPrice: Number(po.totalPrice !== undefined ? po.totalPrice : (po.total_price !== undefined ? po.total_price : 0)),
          academicYear: po.academicYear || po.academic_year || '2569',
          createdAt: po.createdAt || po.created_at || new Date().toISOString(),
          updatedAt: po.updatedAt || po.updated_at || new Date().toISOString(),
          is_deleted: false
        }));

        if (!fs.existsSync(PURCHASE_ORDERS_FILE)) writePurchaseOrders(normalized);
        poCache = normalized;
        lastPoFetch = Date.now();
        return normalized;
      }
    } catch(e) {
      console.warn("[SourceOfTruth:Supabase] Purchase orders read notice:", e.message);
    }
  }

  // 2. Standby Offline Backup
  const localOrders = readPurchaseOrders().filter(po => !po.is_deleted && !(NODE_ENV === 'production' && String(po.id || '').startsWith('ord-mock-')));
  poCache = localOrders;
  lastPoFetch = Date.now();
  return localOrders;
}

async function fetchLiveBudget() {
  let budgetObj = readBudget();
  if (supabase) {
    try {
      const { data } = await supabase.from('system').select('value').eq('key', 'budget').maybeSingle();
      if (data && data.value && data.value.budget !== undefined) {
        budgetObj = data.value;
        if (!fs.existsSync(BUDGET_FILE)) writeBudget(budgetObj);
      }
    } catch(e) {}
  }
  return budgetObj;
}

async function fetchLiveAnnouncements() {
  let ann = readAnnouncements();
  if (supabase) {
    try {
      const { data } = await supabase.from('system').select('value').eq('key', 'lab_announcement_settings').maybeSingle();
      if (data && data.value) {
        ann = { ...ann, ...data.value };
        if (!fs.existsSync(ANNOUNCEMENTS_FILE)) writeAnnouncements(ann);
      }
    } catch(e) {}
  }
  return ann;
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

// Full Cloud Sync Aggregator Endpoint — Strictly L3 Admin
app.get('/api/sync/all-cloud-data', authenticateToken, requireRole('L3'), async (req, res) => {
  try {
    const [users, items, bookings, transactions, purchaseOrders, budget, announcements] = await Promise.all([
      fetchLiveUsers(true),
      fetchLiveItems(true),
      fetchLiveBookings(true),
      fetchLiveTransactions(true),
      fetchLivePurchaseOrders(true),
      fetchLiveBudget(),
      fetchLiveAnnouncements()
    ]);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      counts: {
        users: users.length,
        items: items.length,
        bookings: bookings.length,
        transactions: transactions.length,
        purchaseOrders: purchaseOrders.length
      },
      data: {
        users: users.map(u => sanitizeUser(u)),
        items,
        bookings,
        transactions,
        purchaseOrders,
        budget,
        announcements
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manual / Full Trigger: Sync All Tables to Google Sheets — Strictly L3 Admin
app.post('/api/sync-google-sheets', authenticateToken, requireRole('L3'), async (req, res) => {
  try {
    const items = await fetchLiveItems(false);
    const transactions = await fetchLiveTransactions(false);
    const bookings = await fetchLiveBookings(false);
    const purchaseOrders = await fetchLivePurchaseOrders(false);
    const users = await fetchLiveUsers(false);
    const auditLogs = readAuditLogs();
    const announcements = await fetchLiveAnnouncements();

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
    res.json({ version: pkg.version || '2.7.0', pwa: true, name: 'Chemical Laboratory System' });
  } catch (e) {
    res.json({ version: '2.7.0', pwa: true });
  }
});

// GET /api/health — System health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabaseConnected: Boolean(supabase),
    jwtSecretConfigured: Boolean(JWT_SECRET),
    version: require('./package.json').version || '2.7.0'
  });
});

// ─── PUBLIC CLIENT CONFIG ENDPOINT ───────────────────────────────────────────
// Serves Supabase anon/publishable key + URL to the frontend.
// The anon key is RLS-scoped and designed for client use, but must NOT be
// hardcoded in source — it is loaded from .env and served at runtime only.
app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl: SUPABASE_URL || null,
    supabaseKey: SUPABASE_KEY || null,
    googleScriptUrl: GOOGLE_SCRIPT_URL || null,
    nodeEnv: NODE_ENV,
    isProduction: IS_PRODUCTION,
    architecture: {
      sourceOfTruth: 'Supabase',
      cacheLayer: 'LocalStorage/IndexedDB',
      backupIntegration: 'GoogleSheets',
      mockData: 'development_only'
    }
  });
});

// 1. GET /api/items — Fetch all items from cloud & local
app.get('/api/items', async (req, res) => {
  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
  const items = await fetchLiveItems();
  const sanitized = items.map(({ createdBy, updatedBy, is_deleted, ...rest }) => rest);
  res.json(sanitized);
});

// 2. POST /api/items — Create a new item (L2 Staff or L3 Admin)
app.post('/api/items', authenticateToken, requireRole('L2', 'L3'), async (req, res) => {
  const newItem = req.body;
  if (newItem.qty === undefined && newItem.quantity !== undefined) {
    newItem.qty = newItem.quantity;
  }
  if (!newItem.code || !newItem.name || !newItem.category || newItem.qty === undefined || !newItem.unit) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Room access control for L2 staff
  if (normalizeRole(req.user.role) === 'L2' && !canUserAccessRoom(req.user, newItem.room)) {
    return res.status(403).json({
      error: `เจ้าหน้าที่ไม่มีสิทธิ์เพิ่มพัสดุในห้อง ${newItem.room || 'ไม่ระบุ'} (ห้องที่ดูแล: ${(req.user.assignedRooms || []).join(', ') || 'ไม่มี'})`
    });
  }

  const items = await fetchLiveItems();
  
  // Check duplicate
  const exists = items.some(item => item.code.toLowerCase() === newItem.code.toLowerCase());
  if (exists) {
    return res.status(409).json({ error: `Item code ${newItem.code} already exists` });
  }

  // Add creation and audit metadata
  const now = new Date().toISOString();
  const actor = req.user?.teacherId || req.user?.name || 'system';
  newItem.createdAt = newItem.createdAt || now;
  newItem.created_at = newItem.createdAt;
  newItem.updatedAt = now;
  newItem.updated_at = now;
  newItem.createdBy = actor;
  newItem.created_by = actor;
  newItem.updatedBy = actor;
  newItem.updated_by = actor;
  newItem.is_deleted = false;
  
  items.push(newItem);
  writeDatabase(items);
  itemsCache = items;

  // 1. Sync to Supabase (Primary Source of Truth)
  if (supabase) {
    supabase.from('items').upsert(newItem, { onConflict: 'code' }).then(null, err => {
      console.warn("[SourceOfTruth:Supabase] upsert item err:", err.message);
    });
  }

  // 2. Export / Backup to Google Sheets (Asynchronous Outbound Sink)
  syncToGoogleSheets('Items', 'UPSERT', newItem, 'code');

  // Audit Log
  recordAuditLog({
    action: 'ITEM_CREATE',
    resource: 'items',
    resourceId: newItem.code,
    details: `เพิ่มพัสดุ/สารเคมี: ${newItem.name} (${newItem.code}, จำนวน: ${newItem.qty} ${newItem.unit}, ห้อง: ${newItem.room})`,
    req
  });
  
  res.status(201).json(newItem);
});

// 3. PUT /api/items/:code — Update an existing item (L2 Staff or L3 Admin)
app.put('/api/items/:code', authenticateToken, requireRole('L2', 'L3'), async (req, res) => {
  const codeToUpdate = req.params.code.toLowerCase();
  const updatedData = req.body;
  
  const items = await fetchLiveItems();
  const index = items.findIndex(item => item.code.toLowerCase() === codeToUpdate);
  
  if (index === -1) {
    return res.status(404).json({ error: "Item not found" });
  }

  // Room access control for L2 staff
  if (normalizeRole(req.user.role) === 'L2' && !canUserAccessRoom(req.user, items[index].room)) {
    return res.status(403).json({
      error: `เจ้าหน้าที่ไม่มีสิทธิ์แก้ไขพัสดุในห้อง ${items[index].room || 'ไม่ระบุ'}`
    });
  }

  // Preserve creation date and update audit fields
  const now = new Date().toISOString();
  const actor = req.user?.teacherId || req.user?.name || 'system';
  updatedData.createdAt = items[index].createdAt;
  updatedData.created_at = items[index].createdAt;
  updatedData.updatedAt = now;
  updatedData.updated_at = now;
  updatedData.updatedBy = actor;
  updatedData.updated_by = actor;
  
  items[index] = { ...items[index], ...updatedData };
  writeDatabase(items);
  itemsCache = items;

  // 1. Sync to Supabase (Primary Source of Truth)
  if (supabase) {
    supabase.from('items').upsert(items[index], { onConflict: 'code' }).then(null, err => {
      console.warn("[SourceOfTruth:Supabase] update item err:", err.message);
    });
  }

  // 2. Export / Backup to Google Sheets (Asynchronous Outbound Sink)
  syncToGoogleSheets('Items', 'UPSERT', items[index], 'code');

  // Audit Log
  recordAuditLog({
    action: 'ITEM_UPDATE',
    resource: 'items',
    resourceId: req.params.code,
    details: `แก้ไขข้อมูลพัสดุ: ${items[index].name} (${req.params.code}, คงเหลือ: ${items[index].qty} ${items[index].unit})`,
    req
  });
  
  res.json(items[index]);
});

// 4. DELETE /api/items/:code — Soft Delete an item (Strictly L3 Admin)
app.delete('/api/items/:code', authenticateToken, requireRole('L3'), async (req, res) => {
  const codeToDelete = req.params.code.toLowerCase();
  const items = await fetchLiveItems();
  const itemToDelete = items.find(item => item.code.toLowerCase() === codeToDelete);
  
  if (!itemToDelete) {
    return res.status(404).json({ error: "Item not found" });
  }

  const actor = req.user?.teacherId || req.user?.name || 'admin';
  const now = new Date().toISOString();

  // 1. Soft Delete in Supabase (Primary Source of Truth)
  if (supabase) {
    try {
      await supabase.from('items').update({
        is_deleted: true,
        deleted_at: now,
        deleted_by: actor
      }).eq('code', itemToDelete.code);
    } catch(err) {
      console.warn("[SourceOfTruth:Supabase] Soft delete item err:", err.message);
    }
  }

  // 2. Update local backup cache
  const filteredItems = items.filter(item => item.code.toLowerCase() !== codeToDelete);
  writeDatabase(filteredItems);
  itemsCache = filteredItems;

  // 3. Export / Backup to Google Sheets
  syncToGoogleSheets('Items', 'DELETE', { code: itemToDelete.code }, 'code');

  // Audit Log
  recordAuditLog({
    action: 'ITEM_DELETE',
    resource: 'items',
    resourceId: req.params.code,
    details: `ลบพัสดุออกจากคลัง (Soft Delete): ${itemToDelete.name} (${itemToDelete.code})`,
    req
  });

  res.json({ success: true, message: `Item ${codeToDelete} removed successfully (soft deleted)` });
});

// 5. POST /api/items/import — Batch Import (Strictly L3 Admin)
app.post('/api/items/import', authenticateToken, requireRole('L3'), async (req, res) => {
  const importedItems = req.body;
  if (!Array.isArray(importedItems)) {
    return res.status(400).json({ error: "Data must be an array" });
  }

  const items = await fetchLiveItems();
  let successCount = 0;
  let errorCount = 0;
  const newItemsToSync = [];

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
    newItemsToSync.push(newItem);
    successCount++;

    // Sync to Google Sheets
    syncToGoogleSheets('Items', 'UPSERT', newItem, 'code');
  });

  if (successCount > 0) {
    writeDatabase(items);
    itemsCache = items;
    if (supabase && newItemsToSync.length > 0) {
      supabase.from('items').upsert(newItemsToSync, { onConflict: 'code' }).then(null, err => {
        console.warn("Supabase batch import items err:", err.message);
      });
    }
  }

  // Audit Log
  recordAuditLog({
    action: 'ITEMS_IMPORT',
    resource: 'items',
    resourceId: 'batch',
    details: `นำเข้าข้อมูลพัสดุสำเร็จ ${successCount} รายการ (ข้อผิดพลาด ${errorCount} รายการ)`,
    req
  });

  res.json({ 
    success: true, 
    imported: successCount, 
    errors: errorCount 
  });
});

// ==========================================================================
// 🟡 P2 — INVENTORY: ADVANCED ENDPOINTS (Alerts, Movements, Adjustments, QR, Compatibility)
// ==========================================================================

// Chemical Incompatibility Matrix Definition
const INCOMPATIBILITY_RULES = [
  { groupA: 'Acids', groupB: 'Bases', severity: 'danger', message: 'ปฏิกิริยาสะเทินคายความร้อนสูง อาจเกิดการเดือดและกระเด็นรุนแรง' },
  { groupA: 'Flammable Liquids', groupB: 'Oxidizers', severity: 'extreme', message: 'สารไวไฟและสารออกซิไดซ์ ห้ามเก็บร่วมกันเด็ดขาด เสี่ยงเกิดเพลิงไหม้หรือระเบิด' },
  { groupA: 'Acids', groupB: 'Cyanides/Sulfides', severity: 'extreme', message: 'อาจเกิดก๊าซพิษร้ายแรง เช่น ไฮโดรเจนไซยาไนด์ หรือไฮโดรเจนซัลไฟด์' },
  { groupA: 'Water-Reactive', groupB: 'Acids', severity: 'extreme', message: 'เกิดก๊าซไฮโดรเจนไวไฟสูงและปฏิกิริยารุนแรง' },
  { groupA: 'Nitric Acid', groupB: 'Organic Solvents', severity: 'danger', message: 'กรดไนตริกเข้มข้นทำปฏิกิริยารุนแรงกับตัวทำละลายอินทรีย์' }
];

// 1. GET /api/inventory/alerts — Real-time Multi-factor Alerts
app.get('/api/inventory/alerts', optionalAuth, async (req, res) => {
  try {
    const items = await fetchLiveItems();
    const now = new Date();
    const future30 = new Date(now.getTime() + 30 * 86400000);
    const todayStr = now.toISOString().slice(0, 10);

    const expired = [];
    const nearExpiry = [];
    const lowStock = [];
    const reorderNeeded = [];

    // Group items by cabinet to detect chemical storage conflicts
    const cabinetMap = {};

    items.forEach(item => {
      const q = parseFloat(item.qty !== undefined ? item.qty : (item.quantity || 0));
      const minStock = parseFloat(item.minAlert !== undefined ? item.minAlert : (item.minStock || 5));
      const reorderPt = parseFloat(item.reorderPoint !== undefined ? item.reorderPoint : (minStock * 2));

      // Low stock & Reorder alert
      if (q <= minStock) {
        lowStock.push({
          code: item.code,
          name: item.name,
          currentQty: q,
          minStock,
          unit: item.unit || 'ชิ้น',
          room: item.room,
          cabinet: item.cabinet
        });
      } else if (q <= reorderPt) {
        reorderNeeded.push({
          code: item.code,
          name: item.name,
          currentQty: q,
          reorderPoint: reorderPt,
          unit: item.unit || 'ชิ้น',
          room: item.room
        });
      }

      // Expiry alerts
      const expStr = item.expiry || item.expiryDate || item.expiry_date;
      if (expStr) {
        const expDate = new Date(expStr);
        if (expDate < now) {
          expired.push({
            code: item.code,
            name: item.name,
            expiryDate: expStr,
            lotNumber: item.lotNumber || item.lot_number || '-',
            room: item.room,
            cabinet: item.cabinet
          });
        } else if (expDate <= future30) {
          nearExpiry.push({
            code: item.code,
            name: item.name,
            expiryDate: expStr,
            lotNumber: item.lotNumber || item.lot_number || '-',
            daysRemaining: Math.ceil((expDate - now) / 86400000),
            room: item.room,
            cabinet: item.cabinet
          });
        }
      }

      // Storage compatibility bucket
      if (item.category === 'สารเคมี') {
        const locKey = `${item.room || 'Unknown'} > ${item.cabinet || 'Unknown'}`;
        if (!cabinetMap[locKey]) cabinetMap[locKey] = [];
        cabinetMap[locKey].push(item);
      }
    });

    // Detect compatibility conflicts
    const compatibilityAlerts = [];
    Object.entries(cabinetMap).forEach(([location, chemList]) => {
      if (chemList.length < 2) return;
      for (let i = 0; i < chemList.length; i++) {
        for (let j = i + 1; j < chemList.length; j++) {
          const a = chemList[i];
          const b = chemList[j];
          const groupA = a.storageGroup || a.chemicalType || (a.name.includes('กรด') ? 'Acids' : (a.name.includes('ไฮดรอกไซด์') ? 'Bases' : 'General'));
          const groupB = b.storageGroup || b.chemicalType || (b.name.includes('กรด') ? 'Acids' : (b.name.includes('ไฮดรอกไซด์') ? 'Bases' : 'General'));

          INCOMPATIBILITY_RULES.forEach(rule => {
            const match1 = (groupA === rule.groupA && groupB === rule.groupB) || (groupA === rule.groupB && groupB === rule.groupA);
            if (match1) {
              compatibilityAlerts.push({
                location,
                itemA: { code: a.code, name: a.name, group: groupA },
                itemB: { code: b.code, name: b.name, group: groupB },
                severity: rule.severity,
                warning: rule.message
              });
            }
          });
        }
      }
    });

    res.json({
      success: true,
      timestamp: now.toISOString(),
      counts: {
        expired: expired.length,
        nearExpiry: nearExpiry.length,
        lowStock: lowStock.length,
        reorderNeeded: reorderNeeded.length,
        compatibilityAlerts: compatibilityAlerts.length,
        totalAlerts: expired.length + nearExpiry.length + lowStock.length + compatibilityAlerts.length
      },
      alerts: {
        expired,
        nearExpiry,
        lowStock,
        reorderNeeded,
        compatibilityAlerts
      }
    });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET /api/inventory/movements — Stock Movement History (Audit Trail)
app.get('/api/inventory/movements', authenticateToken, requireRole('L1', 'L2', 'L3', 'L4'), async (req, res) => {
  try {
    const { itemCode, type, limit = 50 } = req.query;
    let movements = [];

    if (supabase) {
      try {
        let query = supabase.from('stock_movements').select('*').order('created_at', { ascending: false }).limit(parseInt(limit));
        if (itemCode) query = query.eq('item_code', itemCode);
        if (type) query = query.eq('type', type);
        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          movements = data;
        }
      } catch(e) {}
    }

    if (movements.length === 0) {
      movements = readStockMovements();
      if (itemCode) movements = movements.filter(m => m.item_code === itemCode || m.itemCode === itemCode);
      if (type) movements = movements.filter(m => m.type === type);
      movements.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
      movements = movements.slice(0, parseInt(limit));
    }

    res.json({ success: true, count: movements.length, movements });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. POST /api/inventory/movements — Record Manual Stock Movement (IN, OUT, DISPOSE)
app.post('/api/inventory/movements', authenticateToken, requireRole('L2', 'L3'), async (req, res) => {
  try {
    const { itemCode, type, quantity, reason, referenceId, lotNumber } = req.body;
    const delta = parseFloat(quantity);

    if (!itemCode || !type || isNaN(delta) || delta <= 0) {
      return res.status(400).json({ error: "ข้อมูลไม่ครบถ้วน: ต้องระบุ itemCode, type ('IN', 'OUT', 'DISPOSE') และจำนวน > 0" });
    }

    const items = await fetchLiveItems();
    const itemIndex = items.findIndex(i => (i.code || '').toLowerCase() === itemCode.toLowerCase());
    if (itemIndex === -1) {
      return res.status(404).json({ error: `ไม่พบพัสดุรหัส ${itemCode}` });
    }

    const item = items[itemIndex];
    if (normalizeRole(req.user.role) === 'L2' && !canUserAccessRoom(req.user, item.room)) {
      return res.status(403).json({
        error: `เจ้าหน้าที่ไม่มีสิทธิ์ทำรายการเคลื่อนไหวสต็อกพัสดุในห้อง ${item.room || 'ไม่ระบุ'} (ห้องที่ดูแล: ${(req.user.assignedRooms || []).join(', ') || 'ไม่มี'})`
      });
    }
    const prevQty = parseFloat(item.qty !== undefined ? item.qty : (item.quantity || 0));
    let newQty = prevQty;

    if (type === 'IN' || type === 'RETURN') {
      newQty = prevQty + delta;
    } else if (type === 'OUT' || type === 'DISPOSE') {
      if (prevQty < delta) {
        return res.status(400).json({ error: `ยอดคงเหลือไม่พอ (คงเหลือ ${prevQty}, ต้องการตัด ${delta})` });
      }
      newQty = prevQty - delta;
    } else {
      return res.status(400).json({ error: `ประเภทการเคลื่อนไหว '${type}' ไม่ถูกต้อง` });
    }

    const now = new Date().toISOString();
    const actor = req.user?.teacherId || req.user?.name || 'system';

    // Update Item Quantity
    item.qty = newQty;
    item.quantity = newQty;
    item.updatedAt = now;
    item.updated_at = now;
    item.updatedBy = actor;
    item.updated_by = actor;

    writeDatabase(items);
    itemsCache = items;

    if (supabase) {
      supabase.from('items').update({
        qty: newQty,
        updated_at: now,
        updated_by: actor
      }).eq('code', item.code).then(null, () => {});
    }

    // Record Stock Movement Log
    const movement = {
      id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      item_code: item.code,
      itemCode: item.code,
      item_name: item.name,
      itemName: item.name,
      type: type,
      quantity: delta,
      previous_quantity: prevQty,
      previousQuantity: prevQty,
      new_quantity: newQty,
      newQuantity: newQty,
      unit: item.unit || 'ชิ้น',
      reason: reason || `บันทึกการเคลื่อนไหวสต็อก (${type})`,
      reference_id: referenceId || null,
      lot_number: lotNumber || item.lotNumber || item.lot_number || null,
      is_deleted: false,
      created_at: now,
      createdAt: now,
      created_by: actor,
      createdBy: actor
    };

    const localMovements = readStockMovements();
    localMovements.unshift(movement);
    writeStockMovements(localMovements);

    if (supabase) {
      supabase.from('stock_movements').insert([movement]).then(null, () => {});
    }

    // Google Sheets Backup
    syncToGoogleSheets('Items', 'UPSERT', item, 'code');

    // Audit Log
    recordAuditLog({
      action: 'STOCK_MOVEMENT',
      resource: 'inventory',
      resourceId: item.code,
      details: `ปรับสต็อก ${type}: ${item.name} (${prevQty} -> ${newQty} ${item.unit}) โดย ${actor}, เหตุผล: ${reason || '-'}`,
      req
    });

    res.status(201).json({ success: true, movement, currentStock: newQty });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. GET /api/inventory/adjustments — List Stock Adjustments
app.get('/api/inventory/adjustments', authenticateToken, requireRole('L1', 'L2', 'L3', 'L4'), async (req, res) => {
  try {
    const { status } = req.query;
    let list = [];

    if (supabase) {
      try {
        let query = supabase.from('stock_adjustments').select('*').order('created_at', { ascending: false });
        if (status) query = query.eq('status', status);
        const { data, error } = await query;
        if (!error && Array.isArray(data)) list = data;
      } catch(e) {}
    }

    if (list.length === 0) {
      list = readStockAdjustments();
      if (status) list = list.filter(a => a.status === status);
      list.sort((a, b) => new Date(b.created_at || b.requestedAt) - new Date(a.created_at || a.requestedAt));
    }

    res.json({ success: true, count: list.length, adjustments: list });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. POST /api/inventory/adjustments — Request Stock Adjustment (Staff L2 / Admin L3)
app.post('/api/inventory/adjustments', authenticateToken, requireRole('L2', 'L3'), async (req, res) => {
  try {
    const { itemCode, adjustedQuantity, reason } = req.body;
    const targetQty = parseFloat(adjustedQuantity);

    if (!itemCode || isNaN(targetQty) || targetQty < 0 || !reason) {
      return res.status(400).json({ error: "ต้องระบุ itemCode, adjustedQuantity (>= 0) และ reason ให้ชัดเจน" });
    }

    const items = await fetchLiveItems();
    const item = items.find(i => (i.code || '').toLowerCase() === itemCode.toLowerCase());
    if (!item) {
      return res.status(404).json({ error: `ไม่พบพัสดุรหัส ${itemCode}` });
    }

    if (normalizeRole(req.user.role) === 'L2' && !canUserAccessRoom(req.user, item.room)) {
      return res.status(403).json({
        error: `เจ้าหน้าที่ไม่มีสิทธิ์ขอปรับยอดสต็อกพัสดุในห้อง ${item.room || 'ไม่ระบุ'} (ห้องที่ดูแล: ${(req.user.assignedRooms || []).join(', ') || 'ไม่มี'})`
      });
    }

    const currentQty = parseFloat(item.qty !== undefined ? item.qty : (item.quantity || 0));
    const now = new Date().toISOString();
    const actorId = req.user?.teacherId || req.user?.id || 'system';
    const actorName = req.user?.name || req.user?.username || actorId;

    const adjustment = {
      id: `adj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      item_code: item.code,
      itemCode: item.code,
      item_name: item.name,
      itemName: item.name,
      current_quantity: currentQty,
      currentQuantity: currentQty,
      adjusted_quantity: targetQty,
      adjustedQuantity: targetQty,
      difference: targetQty - currentQty,
      unit: item.unit || 'ชิ้น',
      reason: reason.trim(),
      status: 'pending',
      requested_by: actorId,
      requestedBy: actorId,
      requested_by_name: actorName,
      requestedByName: actorName,
      requested_at: now,
      requestedAt: now,
      is_deleted: false,
      created_at: now,
      updated_at: now
    };

    const localAdj = readStockAdjustments();
    localAdj.unshift(adjustment);
    writeStockAdjustments(localAdj);

    if (supabase) {
      supabase.from('stock_adjustments').insert([adjustment]).then(null, () => {});
    }

    recordAuditLog({
      action: 'STOCK_ADJUSTMENT_REQUEST',
      resource: 'inventory',
      resourceId: item.code,
      details: `ส่งคำขอปรับยอดสต็อก: ${item.name} (${currentQty} -> ${targetQty} ${item.unit}), เหตุผล: ${reason}`,
      req
    });

    res.status(201).json({ success: true, adjustment });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. POST /api/inventory/adjustments/:id/review — Approve/Reject Adjustment (Strictly L3 Admin or L4 Executive)
app.post('/api/inventory/adjustments/:id/review', authenticateToken, requireRole('L3', 'L4'), async (req, res) => {
  try {
    const { action, reviewNotes } = req.body;
    if (action !== 'approved' && action !== 'rejected') {
      return res.status(400).json({ error: "action ต้องเป็น 'approved' หรือ 'rejected'" });
    }

    const localAdj = readStockAdjustments();
    const index = localAdj.findIndex(a => a.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: "ไม่พบคำขอปรับยอดสต็อกนี้" });
    }

    const adj = localAdj[index];
    if (adj.status !== 'pending') {
      return res.status(400).json({ error: `คำขอนี้ได้รับการพิจารณาไปแล้ว (${adj.status})` });
    }

    const now = new Date().toISOString();
    const reviewerId = req.user?.teacherId || req.user?.id || 'admin';
    const reviewerName = req.user?.name || reviewerId;

    adj.status = action;
    adj.reviewed_by = reviewerId;
    adj.reviewedBy = reviewerId;
    adj.reviewed_by_name = reviewerName;
    adj.reviewedByName = reviewerName;
    adj.reviewed_at = now;
    adj.reviewedAt = now;
    adj.review_notes = reviewNotes || '';
    adj.reviewNotes = reviewNotes || '';
    adj.updated_at = now;

    // If approved, update actual item stock and append to movements!
    if (action === 'approved') {
      const items = await fetchLiveItems();
      const itemIndex = items.findIndex(i => (i.code || '').toLowerCase() === adj.item_code.toLowerCase());
      if (itemIndex !== -1) {
        const item = items[itemIndex];
        const prevStock = item.qty;
        item.qty = adj.adjusted_quantity;
        item.quantity = adj.adjusted_quantity;
        item.updatedAt = now;
        item.updated_at = now;
        item.updatedBy = reviewerId;
        item.updated_by = reviewerId;

        writeDatabase(items);
        itemsCache = items;

        if (supabase) {
          supabase.from('items').update({
            qty: adj.adjusted_quantity,
            updated_at: now,
            updated_by: reviewerId
          }).eq('code', item.code).then(null, () => {});
        }

        // Record stock movement
        const movement = {
          id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          item_code: item.code,
          itemCode: item.code,
          item_name: item.name,
          itemName: item.name,
          type: 'ADJUST',
          quantity: Math.abs(adj.difference),
          previous_quantity: prevStock,
          previousQuantity: prevStock,
          new_quantity: adj.adjusted_quantity,
          newQuantity: adj.adjusted_quantity,
          unit: item.unit || 'ชิ้น',
          reason: `อนุมัติการปรับยอดคงคลัง: ${adj.reason}`,
          reference_id: adj.id,
          is_deleted: false,
          created_at: now,
          createdAt: now,
          created_by: reviewerId,
          createdBy: reviewerId
        };

        const movements = readStockMovements();
        movements.unshift(movement);
        writeStockMovements(movements);

        if (supabase) {
          supabase.from('stock_movements').insert([movement]).then(null, () => {});
        }

        syncToGoogleSheets('Items', 'UPSERT', item, 'code');
      }
    }

    writeStockAdjustments(localAdj);

    if (supabase) {
      supabase.from('stock_adjustments').update({
        status: action,
        reviewed_by: reviewerId,
        reviewed_by_name: reviewerName,
        reviewed_at: now,
        review_notes: reviewNotes || '',
        updated_at: now
      }).eq('id', adj.id).then(null, () => {});
    }

    recordAuditLog({
      action: action === 'approved' ? 'STOCK_ADJUSTMENT_APPROVE' : 'STOCK_ADJUSTMENT_REJECT',
      resource: 'inventory',
      resourceId: adj.item_code,
      details: `${action === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}การปรับยอดสต็อก: ${adj.item_name} (${adj.current_quantity} -> ${adj.adjusted_quantity}) โดย ${reviewerName}`,
      req
    });

    res.json({ success: true, adjustment: adj });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. GET /api/inventory/compatibility — Chemical Storage Compatibility Checker
app.get('/api/inventory/compatibility', async (req, res) => {
  try {
    const { groupA, groupB } = req.query;
    if (!groupA || !groupB) {
      return res.json({
        success: true,
        supportedGroups: ['Acids', 'Bases', 'Flammable Liquids', 'Oxidizers', 'Toxics', 'Water-Reactive', 'General'],
        rules: INCOMPATIBILITY_RULES
      });
    }

    const conflict = INCOMPATIBILITY_RULES.find(rule => 
      (rule.groupA.toLowerCase() === groupA.toLowerCase() && rule.groupB.toLowerCase() === groupB.toLowerCase()) ||
      (rule.groupA.toLowerCase() === groupB.toLowerCase() && rule.groupB.toLowerCase() === groupA.toLowerCase())
    );

    res.json({
      success: true,
      compatible: !conflict,
      severity: conflict ? conflict.severity : 'safe',
      message: conflict ? conflict.message : 'สารทั้งสองกลุ่มสามารถจัดเก็บในตู้เดียวกันได้ตามมาตรฐานความปลอดภัย',
      recommendation: conflict ? 'ต้องแยกเก็บคนละตู้จัดเก็บ หรือมีถาดรองรับสารรั่วไหลทุติยภูมิ (Secondary Containment) แยกต่างหาก' : 'จัดเก็บได้ตามปกติ'
    });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. GET /api/inventory/qr/:code — QR / Barcode Data Payload
app.get('/api/inventory/qr/:code', async (req, res) => {
  try {
    const items = await fetchLiveItems();
    const item = items.find(i => (i.code || '').toLowerCase() === req.params.code.toLowerCase());
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    const payload = {
      format: "SCIPORTAL-LAB-V2",
      code: item.code,
      name: item.name,
      category: item.category,
      lotNumber: item.lotNumber || item.lot_number || 'N/A',
      location: `${item.room || '-'} / ${item.cabinet || '-'} / ${item.shelf || '-'}`,
      expiry: item.expiry || item.expiryDate || '-',
      cas: item.casNumber || item.cas_number || '-',
      hazards: item.ghs || [],
      directUrl: `/index.html?item=${encodeURIComponent(item.code)}`
    };

    res.json({
      success: true,
      code: item.code,
      qrString: JSON.stringify(payload),
      summary: payload
    });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 🟡 P2 — EQUIPMENT MASTER & MAINTENANCE ENDPOINTS
// ==========================================

// GET /api/equipment/assets — List all scientific instruments and equipment
app.get('/api/equipment/assets', optionalAuth, async (req, res) => {
  try {
    const items = await fetchLiveItems();
    let equipmentItems = items.filter(it => it.category !== 'สารเคมี' && !it.is_deleted);
    if (equipmentItems.length === 0) {
      equipmentItems = items.filter(it => !it.is_deleted);
    }
    
    const assets = equipmentItems.map((it, idx) => ({
      code: it.code,
      name: it.name,
      category: it.category || 'อุปกรณ์วิทยาศาสตร์',
      assetId: it.assetId || it.asset_id || `คร.${(it.room || '67').replace(/\D/g, '') || '67'}-${String(idx + 1).padStart(4, '0')}`,
      serialNumber: it.serialNumber || it.serial_number || `SN-${it.code.replace(/[^a-zA-Z0-9]/g, '')}`,
      location: {
        room: it.room || 'Lab 1',
        cabinet: it.cabinet || 'ตู้ A',
        shelf: it.shelf || 'ชั้น 1',
        position: it.position || '-'
      },
      condition: it.condition || (Number(it.qty || it.quantity || 0) <= 0 ? 'damaged' : 'good'),
      quantity: Number(it.qty || it.quantity || 0),
      unit: it.unit || 'เครื่อง',
      purchaseDate: it.purchaseDate || it.purchase_date || '2024-01-15',
      warrantyExpiry: it.warrantyExpiry || it.warranty_expiry || '2027-01-15',
      supplier: it.supplier || 'บริษัท สื่อวิทยาศาสตร์ จำกัด',
      maintenanceSchedule: it.maintenanceSchedule || it.maintenance_schedule || '6_months',
      lastMaintenanceDate: it.lastMaintenanceDate || it.last_maintenance_date || '2026-01-10',
      nextMaintenanceDate: it.nextMaintenanceDate || it.next_maintenance_date || '2026-07-10',
      calibrationDate: it.calibrationDate || it.calibration_date || '2026-02-01',
      nextCalibrationDate: it.nextCalibrationDate || it.next_calibration_date || '2027-02-01',
      calibrationCertificate: it.calibrationCertificate || it.calibration_certificate || `CERT-CAL-${it.code}`
    }));

    res.json({ success: true, count: assets.length, data: assets });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/equipment/maintenance — List maintenance logs
app.get('/api/equipment/maintenance', optionalAuth, async (req, res) => {
  try {
    let logs = [];
    if (supabase) {
      try {
        const { data, error } = await supabase.from('equipment_maintenance_logs').select('*').order('performed_at', { ascending: false });
        if (!error && Array.isArray(data) && data.length > 0) logs = data;
      } catch(e) {}
    }
    if (logs.length === 0) {
      logs = readEquipmentMaintenance();
    }
    res.json({ success: true, count: logs.length, data: logs });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/equipment/maintenance — Create maintenance / calibration log
app.post('/api/equipment/maintenance', authenticateToken, requireRole('L2', 'L3', 'L4'), async (req, res) => {
  try {
    const { itemCode, assetId, type, status, technician, cost, performedAt, nextDueDate, notes, certificateUrl } = req.body;
    const items = await fetchLiveItems();
    const item = items.find(i => (i.code || '').toLowerCase() === itemCode.toLowerCase());
    const targetRoom = item ? item.room : req.body.room;
    if (normalizeRole(req.user.role) === 'L2' && !canUserAccessRoom(req.user, targetRoom)) {
      return res.status(403).json({
        error: `เจ้าหน้าที่ไม่มีสิทธิ์บันทึกการบำรุงรักษาอุปกรณ์ในห้อง ${targetRoom || 'ไม่ระบุ'} (ห้องที่ดูแล: ${(req.user.assignedRooms || []).join(', ') || 'ไม่มี'})`
      });
    }

    const newLog = {
      id: `maint_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      item_code: itemCode,
      asset_id: assetId || '',
      type: type || 'maintenance',
      status: status || 'completed',
      technician: technician || req.user.name,
      cost: parseFloat(cost || 0),
      performed_at: performedAt || new Date().toISOString(),
      next_due_date: nextDueDate || null,
      notes: notes || '',
      certificate_url: certificateUrl || '',
      created_by: req.user.teacherId || req.user.id || 'staff',
      created_at: new Date().toISOString()
    };

    const logs = readEquipmentMaintenance();
    logs.unshift(newLog);
    writeEquipmentMaintenance(logs);

    if (supabase) {
      supabase.from('equipment_maintenance_logs').insert([newLog]).then(null, () => {});
      const updates = {};
      if (type === 'calibration') {
        updates.calibration_date = newLog.performed_at.split('T')[0];
        if (nextDueDate) updates.next_calibration_date = nextDueDate;
        if (certificateUrl) updates.calibration_certificate = certificateUrl;
      } else {
        updates.last_maintenance_date = newLog.performed_at.split('T')[0];
        if (nextDueDate) updates.next_maintenance_date = nextDueDate;
      }
      supabase.from('items').update(updates).eq('code', itemCode).then(null, () => {});
    }

    recordAuditLog({
      action: 'EQUIPMENT_MAINTENANCE',
      resource: 'equipment',
      resourceId: itemCode,
      details: `บันทึกการบำรุงรักษา/สอบเทียบเครื่องมือ ${itemCode} (${type}) โดย ${newLog.technician}`,
      req
    });

    res.status(201).json({ success: true, log: newLog });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/equipment/repairs — List broken / under repair items
app.get('/api/equipment/repairs', optionalAuth, async (req, res) => {
  try {
    let repairs = [];
    if (supabase) {
      try {
        const { data, error } = await supabase.from('equipment_repairs').select('*').order('created_at', { ascending: false });
        if (!error && Array.isArray(data) && data.length > 0) repairs = data;
      } catch(e) {}
    }
    if (repairs.length === 0) {
      repairs = readEquipmentRepairs();
    }
    res.json({ success: true, count: repairs.length, data: repairs });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/equipment/repairs — Report broken equipment
app.post('/api/equipment/repairs', authenticateToken, requireRole('L1', 'L2', 'L3', 'L4'), async (req, res) => {
  try {
    const { itemCode, assetId, itemName, issueDescription, priority } = req.body;
    if (!itemCode || !issueDescription) {
      return res.status(400).json({ error: "itemCode and issueDescription are required" });
    }

    const items = await fetchLiveItems();
    const item = items.find(i => (i.code || '').toLowerCase() === itemCode.toLowerCase());

    const newRepair = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      item_code: itemCode,
      asset_id: assetId || (item ? item.asset_id : ''),
      item_name: itemName || (item ? item.name : itemCode),
      issue_description: issueDescription,
      reported_by: req.user.name || req.user.teacherId || 'ครูผู้แจ้ง',
      reported_at: new Date().toISOString(),
      repair_status: 'reported',
      priority: priority || 'medium',
      technician_notes: '',
      repair_cost: 0,
      created_at: new Date().toISOString()
    };

    const repairs = readEquipmentRepairs();
    repairs.unshift(newRepair);
    writeEquipmentRepairs(repairs);

    if (item) {
      item.condition = 'under_repair';
      writeDatabase(items);
      itemsCache = items;
    }

    if (supabase) {
      supabase.from('equipment_repairs').insert([newRepair]).then(null, () => {});
      supabase.from('items').update({ condition: 'under_repair' }).eq('code', itemCode).then(null, () => {});
    }

    recordAuditLog({
      action: 'EQUIPMENT_REPAIR_REPORT',
      resource: 'equipment',
      resourceId: itemCode,
      details: `แจ้งเครื่องมือชำรุด/ส่งซ่อม: ${newRepair.item_name} - อาการ: ${issueDescription}`,
      req
    });

    res.status(201).json({ success: true, repair: newRepair });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/equipment/repairs/:id — Update repair progress / status
app.patch('/api/equipment/repairs/:id', authenticateToken, requireRole('L2', 'L3', 'L4'), async (req, res) => {
  try {
    const { id } = req.params;
    const { repairStatus, technicianNotes, repairCost } = req.body;

    const repairs = readEquipmentRepairs();
    const rep = repairs.find(r => r.id === id);
    if (!rep) return res.status(404).json({ error: "Repair record not found" });

    const items = await fetchLiveItems();
    const item = items.find(i => (i.code || '').toLowerCase() === (rep.item_code || '').toLowerCase());
    const targetRoom = item ? item.room : rep.room;
    if (normalizeRole(req.user.role) === 'L2' && !canUserAccessRoom(req.user, targetRoom)) {
      return res.status(403).json({
        error: `เจ้าหน้าที่ไม่มีสิทธิ์อัปเดตงานซ่อมอุปกรณ์ในห้อง ${targetRoom || 'ไม่ระบุ'} (ห้องที่ดูแล: ${(req.user.assignedRooms || []).join(', ') || 'ไม่มี'})`
      });
    }

    const now = new Date().toISOString();
    if (repairStatus) rep.repair_status = repairStatus;
    if (technicianNotes !== undefined) rep.technician_notes = technicianNotes;
    if (repairCost !== undefined) rep.repair_cost = parseFloat(repairCost || 0);

    if (repairStatus === 'repaired') {
      rep.resolved_at = now;
      rep.resolved_by = req.user.name;

      const items = await fetchLiveItems();
      const item = items.find(i => (i.code || '').toLowerCase() === (rep.item_code || '').toLowerCase());
      if (item) {
        item.condition = 'good';
        writeDatabase(items);
        itemsCache = items;
        if (supabase) {
          supabase.from('items').update({ condition: 'good' }).eq('code', item.code).then(null, () => {});
        }
      }
    } else if (repairStatus === 'decommissioned') {
      const items = await fetchLiveItems();
      const item = items.find(i => (i.code || '').toLowerCase() === (rep.item_code || '').toLowerCase());
      if (item) {
        item.condition = 'decommissioned';
        writeDatabase(items);
        itemsCache = items;
        if (supabase) {
          supabase.from('items').update({ condition: 'decommissioned' }).eq('code', item.code).then(null, () => {});
        }
      }
    }

    writeEquipmentRepairs(repairs);
    if (supabase) {
      supabase.from('equipment_repairs').update({
        repair_status: rep.repair_status,
        technician_notes: rep.technician_notes,
        repair_cost: rep.repair_cost,
        resolved_at: rep.resolved_at || null,
        resolved_by: rep.resolved_by || null
      }).eq('id', id).then(null, () => {});
    }

    recordAuditLog({
      action: 'EQUIPMENT_REPAIR_UPDATE',
      resource: 'equipment',
      resourceId: rep.item_code,
      details: `อัปเดตสถานะการซ่อม ${rep.item_name} เป็น ${rep.repair_status} โดย ${req.user.name}`,
      req
    });

    res.json({ success: true, repair: rep });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/equipment/qr/:code — QR payload for equipment asset tag
app.get('/api/equipment/qr/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const items = await fetchLiveItems();
    const item = items.find(i => (i.code || '').toLowerCase() === code.toLowerCase());
    if (!item) return res.status(404).json({ error: "Equipment not found" });

    const payload = {
      format: "SCIPORTAL-EQ-V2",
      assetId: item.asset_id || item.assetId || `EQ-${item.code}`,
      code: item.code,
      name: item.name,
      category: item.category,
      condition: item.condition || 'good',
      location: `${item.room || 'Lab 1'} / ${item.cabinet || '-'} / ${item.shelf || '-'}`,
      serialNumber: item.serial_number || item.serialNumber || '-',
      nextCalibration: item.next_calibration_date || item.nextCalibrationDate || '-',
      nextMaintenance: item.next_maintenance_date || item.nextMaintenanceDate || '-',
      directUrl: `/index.html?asset=${encodeURIComponent(item.code)}`
    };

    res.json({
      success: true,
      code: item.code,
      qrString: JSON.stringify(payload),
      summary: payload
    });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/equipment/history/:code — Borrow history for this equipment
app.get('/api/equipment/history/:code', optionalAuth, async (req, res) => {
  try {
    const { code } = req.params;
    const transactions = await fetchLiveTransactions();
    const history = transactions.filter(tx => (tx.itemCode || tx.item_code || '').toLowerCase() === code.toLowerCase());
    res.json({ success: true, count: history.length, data: history });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 🟡 P2 — LABORATORY BOOKING & ROOM AVAILABILITY
// ==========================================

// GET /api/bookings/availability — Interactive room availability matrix (Lab 1 - Lab 8)
app.get('/api/bookings/availability', async (req, res) => {
  try {
    const { date } = req.query;
    const checkDate = date || new Date().toISOString().split('T')[0];
    const bookings = await fetchLiveBookings();

    const rooms = ['Lab 1', 'Lab 2', 'Lab 3', 'Lab 4', 'Lab 5', 'Lab 6', 'Lab 7', 'Lab 8'];
    const standardSlots = [
      '08:30 - 10:20',
      '10:30 - 12:20',
      '13:00 - 14:50',
      '15:00 - 16:50'
    ];

    const matrix = rooms.map(room => {
      const roomBookings = bookings.filter(b => 
        (b.room || '').toLowerCase() === room.toLowerCase() &&
        (b.date || '') === checkDate &&
        b.status !== 'cancelled' &&
        b.status !== 'rejected'
      );

      const slots = standardSlots.map(slot => {
        const found = roomBookings.find(b => (b.timeSlot || b.slot || '') === slot);
        return {
          slot,
          isAvailable: !found,
          booking: found ? {
            id: found.id,
            teacherName: found.teacherName || found.bookerName,
            className: found.className || found.class_name || '-',
            experimentName: found.experimentName || found.experiment_name || found.purpose || '-',
            status: found.status
          } : null
        };
      });

      return {
        room,
        date: checkDate,
        totalBookings: roomBookings.length,
        isFullyBooked: slots.every(s => !s.isAvailable),
        slots
      };
    });

    res.json({ success: true, date: checkDate, availability: matrix });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bookings/check-conflict — Real-time booking conflict detector
app.post('/api/bookings/check-conflict', async (req, res) => {
  try {
    const { room, date, timeSlot, excludeId } = req.body;
    if (!room || !date || !timeSlot) {
      return res.status(400).json({ error: "room, date, and timeSlot are required" });
    }

    const bookings = await fetchLiveBookings();
    const conflict = bookings.find(b => 
      b.id !== excludeId &&
      (b.room || '').toLowerCase() === room.toLowerCase() &&
      b.date === date &&
      (b.timeSlot || b.slot) === timeSlot &&
      b.status !== 'cancelled' &&
      b.status !== 'rejected'
    );

    res.json({
      hasConflict: !!conflict,
      conflictingBooking: conflict ? {
        id: conflict.id,
        teacherName: conflict.teacherName || conflict.bookerName,
        purpose: conflict.purpose || conflict.experimentName,
        status: conflict.status
      } : null
    });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings (Public can view to check room availability calendar)
app.get('/api/bookings', async (req, res) => {
  const bookings = await fetchLiveBookings();
  res.json(bookings);
});

// POST /api/bookings — Authenticated Users (L1 Teachers, L2 Staff, L3 Admin, L4 Executive)
app.post('/api/bookings', authenticateToken, requireRole('L1', 'L2', 'L3', 'L4'), async (req, res) => {
  try {
    const payload = req.body;

    // Handle single booking submission
    if (!Array.isArray(payload) && payload && typeof payload === 'object') {
      const callerRole = normalizeRole(req.user.role || req.user.roleLevel);
      const canManageOthers = (callerRole === 'L2' || callerRole === 'L3' || callerRole === 'L4');
      const teacherId = canManageOthers ? (payload.teacherId || req.user.teacherId || req.user.id || '') : (req.user.teacherId || req.user.id || '');
      const teacherName = canManageOthers ? (payload.teacherName || req.user.name || 'ครูผู้สอน') : (req.user.name || 'ครูผู้สอน');
      const bookingStatus = (canManageOthers && payload.status === 'approved') ? 'approved' : 'pending';

      const targetRoom = payload.room || 'Lab 1';
      if (callerRole === 'L2' && !canUserAccessRoom(req.user, targetRoom)) {
        return res.status(403).json({
          error: `เจ้าหน้าที่ไม่มีสิทธิ์สร้างหรือจัดการการจองในห้อง ${targetRoom} (ห้องที่ดูแล: ${(req.user.assignedRooms || []).join(', ') || 'ไม่มี'})`
        });
      }

      const bookings = await fetchLiveBookings();
      const newBooking = {
        id: payload.id || `BK-${Date.now()}`,
        room: targetRoom,
        date: payload.date || new Date().toISOString().split('T')[0],
        timeSlot: payload.timeSlot || payload.slot || '08:30 - 10:20',
        slot: payload.timeSlot || payload.slot || '08:30 - 10:20',
        purpose: payload.purpose || payload.experimentName || 'การเรียนการสอนปฏิบัติการ',
        teacherId,
        teacherName,
        className: payload.className || payload.class_name || 'ม.5/1',
        studentCount: parseInt(payload.studentCount || payload.student_count || 30),
        experimentName: payload.experimentName || payload.experiment_name || payload.purpose || 'การทดลองวิทยาศาสตร์',
        requiredEquipment: payload.requiredEquipment || payload.required_equipment || [],
        requiredChemicals: payload.requiredChemicals || payload.required_chemicals || [],
        preparationChecklist: payload.preparationChecklist || payload.preparation_checklist || [
          { task: "จัดเตรียมสารเคมีตามสูตร", done: false },
          { task: "ตรวจสอบเครื่องแก้วและอุปกรณ์", done: false },
          { task: "จัดวางอุปกรณ์ประจำโต๊ะปฏิบัติการ", done: false }
        ],
        cleanupChecklist: payload.cleanupChecklist || payload.cleanup_checklist || [
          { task: "ตรวจนับเครื่องแก้วส่งคืน", done: false },
          { task: "แยกขยะสารเคมีอันตราย", done: false },
          { task: "ทำความสะอาดและปิดวาล์วแก๊ส", done: false }
        ],
        status: bookingStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Conflict detection unless override is explicitly specified
      const conflict = bookings.find(b => 
        (b.room || '').toLowerCase() === newBooking.room.toLowerCase() &&
        b.date === newBooking.date &&
        (b.timeSlot || b.slot) === newBooking.timeSlot &&
        b.status !== 'cancelled' &&
        b.status !== 'rejected'
      );

      if (conflict && !payload.conflictOverride) {
        return res.status(409).json({
          error: `ห้อง ${newBooking.room} ในช่วงเวลา ${newBooking.timeSlot} ของวันที่ ${newBooking.date} มีผู้จองแล้ว`,
          conflict
        });
      }

      bookings.unshift(newBooking);
      writeBookings(bookings);
      bookingsCache = bookings;

      if (supabase) {
        supabase.from('bookings').insert([{
          id: newBooking.id,
          room: newBooking.room,
          date: newBooking.date,
          slot: newBooking.slot || newBooking.timeSlot || '',
          bookerName: newBooking.teacherName || newBooking.teacherId || '',
          purpose: newBooking.purpose || newBooking.experimentName || '',
          prepItems: newBooking.requiredChemicals || newBooking.requiredEquipment || [],
          status: newBooking.status || 'pending',
          createdAt: newBooking.createdAt || new Date().toISOString()
        }]).then(null, (err) => console.error("Supabase booking insert error:", err));
      }

      syncToGoogleSheets('Bookings', 'UPSERT', formatBookingForSync(newBooking), 'id');

      recordAuditLog({
        action: 'BOOKING_CREATE',
        resource: 'bookings',
        resourceId: newBooking.id,
        details: `สร้างคำขอจองห้อง ${newBooking.room} วันที่ ${newBooking.date} (${newBooking.timeSlot}) โดย ${newBooking.teacherName}`,
        req
      });

      return res.status(201).json({ success: true, booking: newBooking });
    }

    // Array batch submission (backward compatibility)
    const bookings = payload;
    const callerRole = normalizeRole(req.user.role || req.user.roleLevel);
    if (callerRole === 'L2' && Array.isArray(bookings)) {
      const unauthorized = bookings.find(b => !canUserAccessRoom(req.user, b.room));
      if (unauthorized) {
        return res.status(403).json({
          error: `เจ้าหน้าที่ไม่มีสิทธิ์จัดการข้อมูลการจองในห้อง ${unauthorized.room || 'ไม่ระบุ'} (ห้องที่ดูแล: ${(req.user.assignedRooms || []).join(', ') || 'ไม่มี'})`
        });
      }
    }
    writeBookings(bookings);
    bookingsCache = bookings;
    if (Array.isArray(bookings)) {
      if (supabase) {
        supabase.from('bookings').upsert(bookings, { onConflict: 'id' }).then(null, () => {});
      }
      bookings.forEach(b => syncToGoogleSheets('Bookings', 'UPSERT', formatBookingForSync(b), 'id'));
    }

    recordAuditLog({
      action: 'BOOKING_BATCH_UPDATE',
      resource: 'bookings',
      resourceId: Array.isArray(bookings) && bookings.length > 0 ? bookings[0].id : 'booking',
      details: `บันทึก/อัปเดตข้อมูลการจองห้องปฏิบัติการชุดรวม`,
      req
    });

    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bookings/:id/review — Approve or Reject Booking (Staff L2 / Admin L3)
app.post('/api/bookings/:id/review', authenticateToken, requireRole('L2', 'L3', 'L4'), async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;
    if (action !== 'approved' && action !== 'rejected') {
      return res.status(400).json({ error: "Action must be 'approved' or 'rejected'" });
    }

    const bookings = await fetchLiveBookings();
    const bk = bookings.find(b => b.id === id);
    if (!bk) return res.status(404).json({ error: "Booking not found" });

    if (normalizeRole(req.user.role) === 'L2' && !canUserAccessRoom(req.user, bk.room)) {
      return res.status(403).json({
        error: `เจ้าหน้าที่ไม่มีสิทธิ์อนุมัติหรือปฏิเสธการจองในห้อง ${bk.room || 'ไม่ระบุ'} (ห้องที่ดูแล: ${(req.user.assignedRooms || []).join(', ') || 'ไม่มี'})`
      });
    }

    const now = new Date().toISOString();
    bk.status = action;
    bk.reviewed_by = req.user.name;
    bk.reviewedBy = req.user.name;
    bk.reviewed_at = now;
    bk.reviewedAt = now;
    if (action === 'rejected') {
      bk.rejection_reason = reason || 'ห้องไม่พร้อมใช้งานหรือเกิดข้อขัดข้อง';
      bk.rejectionReason = bk.rejection_reason;
    }

    writeBookings(bookings);
    bookingsCache = bookings;

    if (supabase) {
      supabase.from('bookings').update({
        status: action,
        reviewed_by: req.user.name,
        reviewed_at: now,
        rejection_reason: bk.rejection_reason || null
      }).eq('id', id).then(null, () => {});
    }

    recordAuditLog({
      action: action === 'approved' ? 'BOOKING_APPROVE' : 'BOOKING_REJECT',
      resource: 'bookings',
      resourceId: id,
      details: `${action === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}การจองห้อง ${bk.room} (${bk.date}) โดย ${req.user.name}`,
      req
    });

    res.json({ success: true, booking: bk });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bookings/:id/checklist — Update Preparation / Cleanup Checklist
app.post('/api/bookings/:id/checklist', authenticateToken, requireRole('L1', 'L2', 'L3', 'L4'), async (req, res) => {
  try {
    const { id } = req.params;
    const { type, index, done } = req.body; // type: 'preparation' or 'cleanup'

    const bookings = await fetchLiveBookings();
    const bk = bookings.find(b => b.id === id);
    if (!bk) return res.status(404).json({ error: "Booking not found" });

    const callerRole = normalizeRole(req.user.role || req.user.roleLevel);
    const isOwner = (bk.teacherId && (bk.teacherId === req.user.teacherId || bk.teacherId === req.user.id));
    if (callerRole === 'L1' && !isOwner) {
      return res.status(403).json({ error: "คุณสามารถแก้ไขเช็กลิสต์ได้เฉพาะรายการจองของตนเองเท่านั้น" });
    }
    if (callerRole === 'L2' && !canUserAccessRoom(req.user, bk.room)) {
      return res.status(403).json({
        error: `เจ้าหน้าที่ไม่มีสิทธิ์แก้ไขเช็กลิสต์ในห้อง ${bk.room || 'ไม่ระบุ'} (ห้องที่ดูแล: ${(req.user.assignedRooms || []).join(', ') || 'ไม่มี'})`
      });
    }

    const checklistKey = type === 'cleanup' ? 'cleanupChecklist' : 'preparationChecklist';
    if (!bk[checklistKey]) bk[checklistKey] = [];

    if (index >= 0 && index < bk[checklistKey].length) {
      bk[checklistKey][index].done = !!done;
      bk[checklistKey][index].updatedAt = new Date().toISOString();
      bk[checklistKey][index].updatedBy = req.user.name;
    }

    writeBookings(bookings);
    bookingsCache = bookings;

    if (supabase) {
      const supaKey = type === 'cleanup' ? 'cleanup_checklist' : 'preparation_checklist';
      supabase.from('bookings').update({
        [supaKey]: bk[checklistKey]
      }).eq('id', id).then(null, () => {});
    }

    res.json({ success: true, checklist: bk[checklistKey] });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bookings/:id/cancel — Cancel Booking
app.post('/api/bookings/:id/cancel', authenticateToken, requireRole('L1', 'L2', 'L3', 'L4'), async (req, res) => {
  try {
    const { id } = req.params;
    const bookings = await fetchLiveBookings();
    const bk = bookings.find(b => b.id === id);
    if (!bk) return res.status(404).json({ error: "Booking not found" });

    const callerRole = normalizeRole(req.user.role || req.user.roleLevel);
    const isOwner = (bk.teacherId && (bk.teacherId === req.user.teacherId || bk.teacherId === req.user.id));
    if (callerRole === 'L1' && !isOwner) {
      return res.status(403).json({ error: "คุณสามารถยกเลิกได้เฉพาะรายการจองของตนเองเท่านั้น" });
    }
    if (callerRole === 'L2' && !isOwner && !canUserAccessRoom(req.user, bk.room)) {
      return res.status(403).json({
        error: `เจ้าหน้าที่ไม่มีสิทธิ์ยกเลิกการจองในห้อง ${bk.room || 'ไม่ระบุ'} (ห้องที่ดูแล: ${(req.user.assignedRooms || []).join(', ') || 'ไม่มี'})`
      });
    }

    const now = new Date().toISOString();
    bk.status = 'cancelled';
    bk.cancelled_at = now;
    bk.cancelled_by = req.user.name;

    writeBookings(bookings);
    bookingsCache = bookings;

    if (supabase) {
      supabase.from('bookings').update({
        status: 'cancelled'
      }).eq('id', id).then(null, () => {});
    }

    recordAuditLog({
      action: 'BOOKING_CANCEL',
      resource: 'bookings',
      resourceId: id,
      details: `ยกเลิกการจองห้อง ${bk.room} (${bk.date}) โดย ${req.user.name}`,
      req
    });

    res.json({ success: true, booking: bk });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 🟡 P2 — BORROW / RETURN WORKFLOW & DUE DATES
// ==========================================

// GET /api/transactions — Role-based data access (Authenticated)
app.get('/api/transactions', authenticateToken, async (req, res) => {
  const transactions = await fetchLiveTransactions();
  const role = normalizeRole(req.user.role || req.user.roleLevel);

  if (role === 'L3' || role === 'L4' || role === 'L2') {
    return res.json(transactions);
  }

  const myName = String(req.user.name || '').toLowerCase().trim();
  const myId = String(req.user.teacherId || req.user.id || '').toLowerCase().trim();
  const filtered = transactions.filter(tx => {
    const b = String(tx.borrower || tx.teacherId || '').toLowerCase().trim();
    return b.includes(myName) || b.includes(myId) || (myId && b === myId);
  });
  res.json(filtered);
});

// POST /api/transactions — Authenticated (Strictly L2 Staff, L3 Admin, L4 Executive)
app.post('/api/transactions', authenticateToken, requireRole('L2', 'L3', 'L4'), async (req, res) => {
  const transactions = req.body;
  const role = normalizeRole(req.user.role || req.user.roleLevel);
  if (role === 'L2' && Array.isArray(transactions)) {
    const unauthorized = transactions.find(t => t.room && !canUserAccessRoom(req.user, t.room));
    if (unauthorized) {
      return res.status(403).json({
        error: `เจ้าหน้าที่ไม่มีสิทธิ์บันทึกประวัติการยืม-คืนในห้อง ${unauthorized.room} (ห้องที่ดูแล: ${(req.user.assignedRooms || []).join(', ') || 'ไม่มี'})`
      });
    }
  }
  writeTransactions(transactions);
  transactionsCache = transactions;
  if (Array.isArray(transactions)) {
    if (supabase) {
      supabase.from('transactions').upsert(transactions, { onConflict: 'id' }).then(null, () => {});
    }
    transactions.forEach(tx => syncToGoogleSheets('Transactions', 'UPSERT', tx, 'id'));
  }

  recordAuditLog({
    action: 'TRANSACTION_CREATE',
    resource: 'transactions',
    resourceId: Array.isArray(transactions) && transactions.length > 0 ? transactions[0].id : 'transaction',
    details: `บันทึกรายการขอยืม-คืน/เบิกสารเคมีและอุปกรณ์`,
    req
  });

  res.json({ success: true });
});

// POST /api/borrow/request — Digital Borrow Request with Stock Check
app.post('/api/borrow/request', authenticateToken, requireRole('L1', 'L2', 'L3', 'L4'), async (req, res) => {
  try {
    const { itemCode, quantity, dueDate, responsiblePerson, notes } = req.body;
    if (!itemCode) return res.status(400).json({ error: "itemCode is required" });

    const reqQty = parseFloat(quantity || 1);
    const items = await fetchLiveItems();
    const item = items.find(i => (i.code || '').toLowerCase() === itemCode.toLowerCase());
    if (!item) return res.status(404).json({ error: "ไม่พบข้อมูลพัสดุในระบบ" });

    const currentStock = parseFloat(item.qty || item.quantity || 0);
    if (currentStock < reqQty) {
      return res.status(400).json({
        error: `ยอดคงเหลือในคลังไม่เพียงพอ (คงเหลือ: ${currentStock} ${item.unit || 'ชิ้น'})`
      });
    }

    const userRole = normalizeRole(req.user.roleLevel || req.user.role);
    const isDirectApproved = (userRole === 'L3' || userRole === 'L4') || (userRole === 'L2' && canUserAccessRoom(req.user, item.room));

    const newTx = {
      id: `TX-${Date.now()}`,
      itemCode: item.code,
      item_code: item.code,
      itemName: item.name,
      item_name: item.name,
      category: item.category,
      room: item.room || '',
      quantity: reqQty,
      unit: item.unit || 'ชิ้น',
      borrower: req.user.name || 'ผู้ยืม',
      teacherId: req.user.teacherId || req.user.id || '',
      responsiblePerson: responsiblePerson || req.user.name,
      borrowDate: new Date().toISOString(),
      dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
      expectedReturnDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
      returnDate: null,
      status: 'borrowed',
      approvalStatus: isDirectApproved ? 'approved' : 'pending',
      approvedBy: isDirectApproved ? req.user.name : null,
      approvedAt: isDirectApproved ? new Date().toISOString() : null,
      damagedStatus: 'none',
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    // If auto-approved, deduct stock immediately
    if (isDirectApproved) {
      item.qty = Math.max(0, currentStock - reqQty);
      item.quantity = item.qty;
      writeDatabase(items);
      itemsCache = items;
      if (supabase) {
        supabase.from('items').update({ qty: item.qty }).eq('code', item.code).then(null, () => {});
      }
    }

    const txs = await fetchLiveTransactions();
    txs.unshift(newTx);
    writeTransactions(txs);
    transactionsCache = txs;

    if (supabase) {
      const supaTx = {
        id: newTx.id,
        itemCode: newTx.itemCode || newTx.item_code,
        itemName: newTx.itemName || newTx.item_name,
        qty: Number(newTx.quantity || newTx.qty || 1),
        borrower: newTx.borrower || '',
        date: newTx.borrowDate ? newTx.borrowDate.split('T')[0] : new Date().toISOString().split('T')[0],
        type: newTx.type || 'BORROW',
        status: newTx.status || 'borrowed',
        notes: newTx.notes || '',
        expectedReturnDate: newTx.expectedReturnDate || newTx.dueDate || '',
        bookingId: newTx.bookingId || '',
        room: newTx.room || '',
        slot: newTx.slot || '',
        supervisingTeacher: newTx.responsiblePerson || newTx.teacherId || '',
        returnDate: newTx.returnDate || null,
        damagedQty: Number(newTx.damagedQty || 0),
        createdAt: newTx.createdAt || new Date().toISOString()
      };
      supabase.from('transactions').insert([supaTx]).then(null, (err) => console.error("Supabase tx insert error:", err));
    }

    syncToGoogleSheets('Transactions', 'UPSERT', newTx, 'id');
    if (isDirectApproved) {
      syncToGoogleSheets('Items', 'UPSERT', item, 'code');
    }

    recordAuditLog({
      action: 'BORROW_REQUEST',
      resource: 'transactions',
      resourceId: newTx.id,
      details: `ทำรายการขอยืม: ${newTx.itemName} จำนวน ${reqQty} ${newTx.unit} โดย ${newTx.borrower}`,
      req
    });

    res.status(201).json({ success: true, transaction: newTx });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/borrow/:id/return — Return item with condition check and stock restock (L1 Teacher [own item] / L2 Staff / L3 Admin / L4 Exec)
app.post('/api/borrow/:id/return', authenticateToken, requireRole('L1', 'L2', 'L3', 'L4'), async (req, res) => {
  try {
    const { id } = req.params;
    const { condition, damagedStatus, damageFine, damageNotes } = req.body;

    const txs = await fetchLiveTransactions();
    const tx = txs.find(t => t.id === id);
    if (!tx) return res.status(404).json({ error: "ไม่พบข้อมูลรายการยืม" });
    if (tx.status === 'returned') return res.status(400).json({ error: "รายการนี้ส่งคืนแล้ว" });

    const items = await fetchLiveItems();
    const item = items.find(i => (i.code || '').toLowerCase() === (tx.itemCode || tx.item_code || '').toLowerCase());
    const targetRoom = item ? item.room : tx.room;
    const userRoleLevel = normalizeRole(req.user.role);
    if (userRoleLevel === 'L1') {
      const isOwn = (tx.borrower && tx.borrower.toLowerCase().includes(String(req.user.name || '').toLowerCase())) ||
                    (tx.teacherId && tx.teacherId === req.user.teacherId) ||
                    (tx.userId && tx.userId === req.user.id);
      if (!isOwn) {
        return res.status(403).json({ error: "ครูผู้สอนสามารถคืนพัสดุได้เฉพาะรายการของตนเองเท่านั้น" });
      }
    } else if (userRoleLevel === 'L2' && !canUserAccessRoom(req.user, targetRoom)) {
      return res.status(403).json({
        error: `เจ้าหน้าที่ไม่มีสิทธิ์บันทึกการส่งคืนพัสดุในห้อง ${targetRoom || 'ไม่ระบุ'} (ห้องที่ดูแล: ${(req.user.assignedRooms || []).join(', ') || 'ไม่มี'})`
      });
    }

    const now = new Date().toISOString();
    tx.status = 'returned';
    tx.returnDate = now;
    tx.return_date = now;
    tx.condition = condition || 'สมบูรณ์';
    tx.damagedStatus = damagedStatus || 'none';
    tx.damageFine = parseFloat(damageFine || 0);
    tx.damageNotes = damageNotes || '';

    // Restock item if condition is good or minor
    if (tx.damagedStatus !== 'missing' && tx.damagedStatus !== 'severe_damage') {
      const items = await fetchLiveItems();
      const item = items.find(i => (i.code || '').toLowerCase() === (tx.itemCode || tx.item_code || '').toLowerCase());
      if (item) {
        item.qty = parseFloat(item.qty || 0) + parseFloat(tx.quantity || 1);
        item.quantity = item.qty;
        writeDatabase(items);
        itemsCache = items;
        if (supabase) {
          supabase.from('items').update({ qty: item.qty }).eq('code', item.code).then(null, () => {});
        }
      }
    }

    writeTransactions(txs);
    transactionsCache = txs;

    if (supabase) {
      supabase.from('transactions').update({
        status: 'returned',
        return_date: now,
        damaged_status: tx.damagedStatus,
        damage_fine: tx.damageFine,
        damage_notes: tx.damageNotes
      }).eq('id', id).then(null, () => {});
    }

    recordAuditLog({
      action: 'BORROW_RETURN',
      resource: 'transactions',
      resourceId: id,
      details: `บันทึกรับคืน: ${tx.itemName} สภาพ: ${tx.condition} รับคืนโดย ${req.user.name}`,
      req
    });

    res.json({ success: true, transaction: tx });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/borrow/overdue — List overdue loans
app.get('/api/borrow/overdue', optionalAuth, async (req, res) => {
  try {
    const txs = await fetchLiveTransactions();
    const role = normalizeRole(req.user.role || req.user.roleLevel);
    const myId = String(req.user.teacherId || req.user.id || '').toLowerCase().trim();
    const myName = String(req.user.name || '').toLowerCase().trim();
    const now = new Date();

    const overdue = txs.filter(tx => {
      if (tx.status === 'returned') return false;
      const due = tx.dueDate || tx.expectedReturnDate;
      if (!due) return false;
      if (new Date(due) >= now) return false;
      if (role === 'L1') {
        const b = String(tx.borrower || tx.teacherId || '').toLowerCase().trim();
        return b.includes(myName) || b.includes(myId) || (myId && b === myId);
      }
      return true;
    }).map(tx => {
      const due = new Date(tx.dueDate || tx.expectedReturnDate);
      const daysOverdue = Math.max(1, Math.floor((now.getTime() - due.getTime()) / 86400000));
      return {
        ...tx,
        daysOverdue
      };
    });

    res.json({ success: true, count: overdue.length, overdue });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/borrow/quick-scan/:code — Quick asset lookup for QR scanning
app.get('/api/borrow/quick-scan/:code', optionalAuth, async (req, res) => {
  try {
    const { code } = req.params;
    const items = await fetchLiveItems();
    const item = items.find(i => (i.code || '').toLowerCase() === code.toLowerCase());
    if (!item) return res.status(404).json({ error: "Item not found" });

    const txs = await fetchLiveTransactions();
    const activeLoan = txs.find(t => 
      (t.itemCode || t.item_code || '').toLowerCase() === code.toLowerCase() &&
      t.status === 'borrowed'
    );

    res.json({
      success: true,
      item: {
        code: item.code,
        name: item.name,
        category: item.category,
        stock: item.qty || item.quantity || 0,
        unit: item.unit || 'ชิ้น',
        location: `${item.room || '-'} / ${item.cabinet || '-'}`
      },
      activeLoan: activeLoan || null
    });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 🟡 P2 — PROCUREMENT & BUDGET REAL-TIME TRACKING
// ==========================================

// GET /api/budget — Authenticated (Teachers, Staff, Admins, Executives)
app.get('/api/budget', authenticateToken, requireRole('L1', 'L2', 'L3', 'L4'), async (req, res) => {
  const budget = await fetchLiveBudget();
  res.json(budget);
});

// POST /api/budget — Strictly L3 Admin
app.post('/api/budget', authenticateToken, requireRole('L3'), async (req, res) => {
  const data = req.body;
  writeBudget(data);
  if (supabase) {
    supabase.from('system').upsert({ key: 'budget', value: data }).then(null, () => {});
  }

  recordAuditLog({
    action: 'BUDGET_UPDATE',
    resource: 'system',
    resourceId: 'budget',
    details: `อัปเดตงบประมาณห้องแล็บ: ${data.budget} บาท`,
    req
  });

  res.json({ success: true, budget: data.budget });
});

// GET /api/budget/summary — Real-time budget analytics & remaining balances (Authenticated)
app.get('/api/budget/summary', authenticateToken, requireRole('L1', 'L2', 'L3', 'L4'), async (req, res) => {
  try {
    const budgetData = await fetchLiveBudget();
    const totalBudget = parseFloat(budgetData?.budget || 150000);
    const purchaseOrders = await fetchLivePurchaseOrders();

    const approvedPOs = purchaseOrders.filter(po => po.status === 'approved' || po.status === 'received' || po.status === 'ordered');
    const spentBudget = approvedPOs.reduce((sum, po) => sum + parseFloat(po.totalPrice || po.estimatedCost || 0), 0);
    const remainingBudget = Math.max(0, totalBudget - spentBudget);
    const utilizationRate = totalBudget > 0 ? ((spentBudget / totalBudget) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      fiscalYear: 2026,
      totalBudget,
      spentBudget,
      remainingBudget,
      utilizationRate: Number(utilizationRate),
      totalPurchaseOrders: purchaseOrders.length,
      pendingApprovalCount: purchaseOrders.filter(po => po.status === 'pending').length
    });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/purchase-orders — Role-based data access control
app.get('/api/purchase-orders', optionalAuth, async (req, res) => {
  const orders = await fetchLivePurchaseOrders();
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required to view purchase orders" });
  }

  const role = normalizeRole(req.user.role || req.user.roleLevel);
  if (role === 'L3' || role === 'L4') {
    return res.json(orders);
  }

  const myId = String(req.user.teacherId || req.user.id || '').toLowerCase().trim();
  const myName = String(req.user.name || '').toLowerCase().trim();
  const filtered = orders.filter(po => {
    const reqStr = String(po.requester || po.teacherId || po.createdByName || '').toLowerCase().trim();
    return reqStr.includes(myId) || reqStr.includes(myName) || (myId && reqStr === myId);
  });
  res.json(filtered);
});

// POST /api/purchase-orders — Authenticated (L1 Teachers, L2 Staff, L3 Admin, L4 Executive)
app.post('/api/purchase-orders', authenticateToken, requireRole('L1', 'L2', 'L3', 'L4'), async (req, res) => {
  const orders = req.body;
  writePurchaseOrders(orders);
  poCache = orders;
  if (Array.isArray(orders)) {
    if (supabase) {
      supabase.from('purchase_orders').upsert(orders, { onConflict: 'id' }).then(null, () => {});
    }
    orders.forEach(po => syncToGoogleSheets('Purchase_Orders', 'UPSERT', po, 'id'));
  }

  recordAuditLog({
    action: 'PURCHASE_ORDER_CREATE',
    resource: 'purchase_orders',
    resourceId: Array.isArray(orders) ? `${orders.length} items` : 'order',
    details: `บันทึกรายการขอจัดซื้อพัสดุ/สารเคมี (${Array.isArray(orders) ? orders.length : 1} รายการ)`,
    req
  });

  res.json({ success: true });
});

// POST /api/procurement/orders — Submit Purchase Request with Approval Chain
app.post('/api/procurement/orders', authenticateToken, requireRole('L1', 'L2', 'L3', 'L4'), async (req, res) => {
  try {
    const { title, items, estimatedCost, supplierName, quotationRef, reason, priority } = req.body;
    const poList = await fetchLivePurchaseOrders();

    const newPO = {
      id: `PO-${Date.now()}`,
      title: title || 'คำขอจัดซื้อสารเคมีและวัสดุห้องปฏิบัติการ',
      items: Array.isArray(items) ? items : [],
      estimatedCost: parseFloat(estimatedCost || 0),
      totalPrice: parseFloat(estimatedCost || 0),
      supplierName: supplierName || 'บริษัท เคมีภัณฑ์สากล จำกัด',
      quotationRef: quotationRef || '',
      invoiceRef: '',
      reason: reason || '',
      priority: priority || 'medium',
      requester: req.user.name || 'ผู้ขอจัดซื้อ',
      teacherId: req.user.teacherId || req.user.id || '',
      department: req.user.department || 'วิทยาศาสตร์และเทคโนโลยี',
      status: 'pending', // pending, approved, ordered, received, rejected
      receivingStatus: 'unreceived',
      approvalChain: [
        {
          step: 1,
          role: 'Requester',
          status: 'submitted',
          by: req.user.name,
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    };

    poList.unshift(newPO);
    writePurchaseOrders(poList);
    poCache = poList;

    if (supabase) {
      supabase.from('purchase_orders').insert([newPO]).then(null, () => {});
    }

    recordAuditLog({
      action: 'PROCUREMENT_PR_SUBMIT',
      resource: 'purchase_orders',
      resourceId: newPO.id,
      details: `ยื่นคำขอจัดซื้อ ${newPO.title} มูลค่า ${newPO.estimatedCost} บาท โดย ${newPO.requester}`,
      req
    });

    res.status(201).json({ success: true, order: newPO });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/procurement/orders/:id/review — Approve or Reject Purchase Request (Admin L3 / Executive L4)
app.post('/api/procurement/orders/:id/review', authenticateToken, requireRole('L3', 'L4'), async (req, res) => {
  try {
    const { id } = req.params;
    const { action, comments } = req.body;
    if (action !== 'approved' && action !== 'rejected') {
      return res.status(400).json({ error: "Action must be 'approved' or 'rejected'" });
    }

    const orders = await fetchLivePurchaseOrders();
    const po = orders.find(p => p.id === id);
    if (!po) return res.status(404).json({ error: "Purchase order not found" });

    po.status = action;
    po.reviewedBy = req.user.name;
    po.reviewedAt = new Date().toISOString();
    if (!po.approvalChain) po.approvalChain = [];
    po.approvalChain.push({
      step: 2,
      role: req.user.roleLevel || 'Executive',
      status: action,
      by: req.user.name,
      comments: comments || '',
      timestamp: new Date().toISOString()
    });

    writePurchaseOrders(orders);
    poCache = orders;

    if (supabase) {
      supabase.from('purchase_orders').update({
        status: action,
        reviewed_by: req.user.name,
        approval_chain: po.approvalChain
      }).eq('id', id).then(null, () => {});
    }

    recordAuditLog({
      action: action === 'approved' ? 'PROCUREMENT_APPROVE' : 'PROCUREMENT_REJECT',
      resource: 'purchase_orders',
      resourceId: id,
      details: `${action === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}คำขอจัดซื้อ ${po.title} (${po.estimatedCost} บ.) โดย ${req.user.name}`,
      req
    });

    res.json({ success: true, order: po });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/procurement/orders/:id/receive — Receiving Goods & Auto-Restock Inventory
app.post('/api/procurement/orders/:id/receive', authenticateToken, requireRole('L2', 'L3', 'L4'), async (req, res) => {
  try {
    const { id } = req.params;
    const { invoiceRef, receivedItems, isFullReceiving } = req.body;

    const orders = await fetchLivePurchaseOrders();
    const po = orders.find(p => p.id === id);
    if (!po) return res.status(404).json({ error: "Purchase order not found" });

    const now = new Date().toISOString();
    po.receivingStatus = isFullReceiving ? 'received' : 'partial';
    po.status = isFullReceiving ? 'received' : po.status;
    if (invoiceRef) po.invoiceRef = invoiceRef;

    // Auto-restock items into inventory & create movements
    const items = await fetchLiveItems();
    const movements = readStockMovements();

    if (Array.isArray(receivedItems)) {
      const callerRole = normalizeRole(req.user.role || req.user.roleLevel);
      if (callerRole === 'L2') {
        const unauthorized = receivedItems.find(rcv => {
          const item = items.find(i => (i.code || '').toLowerCase() === (rcv.code || '').toLowerCase());
          const room = item ? item.room : rcv.room;
          return room && !canUserAccessRoom(req.user, room);
        });
        if (unauthorized) {
          return res.status(403).json({
            error: "เจ้าหน้าที่ไม่มีสิทธิ์รับพัสดุเข้าห้องที่ตนเองไม่ได้ดูแล"
          });
        }
      }

      receivedItems.forEach(rcv => {
        const item = items.find(i => (i.code || '').toLowerCase() === (rcv.code || '').toLowerCase());
        const rcvQty = parseFloat(rcv.receivedQty || rcv.qty || 0);
        if (item && rcvQty > 0) {
          item.qty = parseFloat(item.qty || 0) + rcvQty;
          item.quantity = item.qty;

          // Record IN movement
          movements.unshift({
            id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            item_code: item.code,
            itemCode: item.code,
            item_name: item.name,
            itemName: item.name,
            type: 'IN',
            quantity: rcvQty,
            balance_after: item.qty,
            balanceAfter: item.qty,
            reason: `รับพัสดุเข้าคลังจากใบสั่งซื้อ ${po.id}`,
            actor: req.user.name,
            actor_id: req.user.teacherId || req.user.id || 'staff',
            created_at: now
          });
        }
      });

      writeDatabase(items);
      itemsCache = items;
      writeStockMovements(movements);

      if (supabase) {
        items.forEach(it => {
          supabase.from('items').update({ qty: it.qty }).eq('code', it.code).then(null, () => {});
        });
      }
    }

    writePurchaseOrders(orders);
    poCache = orders;

    recordAuditLog({
      action: 'PROCUREMENT_RECEIVE',
      resource: 'purchase_orders',
      resourceId: id,
      details: `ตรวจรับพัสดุเข้าคลังจาก ${po.id} (สถานะ: ${po.receivingStatus}) โดย ${req.user.name}`,
      req
    });

    res.json({ success: true, order: po });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 🟡 P2 — ROLE-BASED DASHBOARD AGGREGATOR
// ==========================================

// GET /api/dashboard/role-view — Dynamic role-customized dashboard payload
app.get('/api/dashboard/role-view', optionalAuth, async (req, res) => {
  try {
    const roleRank = { 'L0': 0, 'L1': 1, 'L2': 2, 'L3': 3, 'L4': 4 };
    const userRole = req.user ? normalizeRole(req.user.role || req.user.roleLevel) : 'L0';
    let activeRole = req.user ? userRole : 'L1';

    const requestedRole = req.query.role ? normalizeRole(req.query.role) : null;
    if (requestedRole) {
      // Admin (L3) and Executive (L4) can preview any dashboard view; others can preview at or below their rank
      const userMaxRank = roleRank[userRole] || 0;
      const requestedRank = roleRank[requestedRole] || 0;
      if (req.user && (userRole === 'L3' || userRole === 'L4' || requestedRank <= userMaxRank)) {
        activeRole = requestedRole;
      }
    }

    const items = await fetchLiveItems();
    const bookings = await fetchLiveBookings();
    const transactions = await fetchLiveTransactions();
    const purchaseOrders = await fetchLivePurchaseOrders();
    const budgetData = await fetchLiveBudget();

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const future30 = new Date(now.getTime() + 30 * 86400000);

    // Common alerts
    const expiredCount = items.filter(it => it.expiry && new Date(it.expiry) < now).length;
    const lowStockCount = items.filter(it => {
      const q = parseFloat(it.qty || it.quantity || 0);
      const min = parseFloat(it.minAlert || it.minStock || 5);
      return q <= min;
    }).length;
    const nearExpiryCount = items.filter(it => {
      if (!it.expiry) return false;
      const exp = new Date(it.expiry);
      return exp >= now && exp <= future30;
    }).length;

    // 1. TEACHER DASHBOARD (L1)
    if (activeRole === 'L1') {
      const myId = String(req.user?.teacherId || req.user?.id || 't1').toLowerCase();
      const myName = String(req.user?.name || '').toLowerCase();

      const myBookings = bookings.filter(b => {
        const tId = String(b.teacherId || b.teacher_id || '').toLowerCase();
        const tName = String(b.teacherName || b.bookerName || '').toLowerCase();
        return tId.includes(myId) || tName.includes(myName);
      });

      const myBorrowings = transactions.filter(tx => {
        const b = String(tx.borrower || tx.teacherId || '').toLowerCase();
        return b.includes(myId) || b.includes(myName);
      });

      const upcomingClasses = myBookings.filter(b => b.date >= todayStr && b.status === 'approved');

      return res.json({
        success: true,
        role: 'Teacher',
        roleLevel: 'L1',
        data: {
          myBookingsCount: myBookings.length,
          myActiveBookings: myBookings.filter(b => b.status === 'approved' || b.status === 'pending'),
          myBorrowingsCount: myBorrowings.length,
          myActiveLoans: myBorrowings.filter(tx => tx.status === 'borrowed'),
          upcomingClasses,
          notifications: [
            { text: `คุณมีห้องปฏิบัติการจองแล้ว ${myBookings.filter(b => b.status === 'approved').length} รายการ`, type: 'info' },
            { text: `พัสดุรอส่งคืน ${myBorrowings.filter(t => t.status === 'borrowed').length} รายการ`, type: 'warning' }
          ]
        }
      });
    }

    // 2. STAFF DASHBOARD (L2)
    if (activeRole === 'L2') {
      const todayPreparations = bookings.filter(b => b.date === todayStr && b.status === 'approved');
      const borrowReturnDueToday = transactions.filter(t => {
        if (t.status === 'returned') return false;
        const due = (t.dueDate || t.expectedReturnDate || '').split('T')[0];
        return due === todayStr;
      });
      const pendingBookings = bookings.filter(b => b.status === 'pending');
      const repairs = readEquipmentRepairs().filter(r => r.repair_status === 'reported' || r.repair_status === 'under_repair');

      return res.json({
        success: true,
        role: 'Staff',
        roleLevel: 'L2',
        data: {
          lowStockCount,
          expiredCount,
          nearExpiryCount,
          todayPreparations,
          borrowReturnDueToday,
          pendingRequestsCount: pendingBookings.length,
          pendingBookings,
          maintenanceDueCount: repairs.length,
          equipmentUnderRepair: repairs
        }
      });
    }

    // 3. ADMIN DASHBOARD (L3)
    if (activeRole === 'L3') {
      const users = readUsers();
      const auditLogs = readAuditLogs();
      const totalInventoryValue = items.reduce((sum, it) => sum + (parseFloat(it.qty || 0) * (parseFloat(it.unitPrice || 120))), 0);

      return res.json({
        success: true,
        role: 'Admin',
        roleLevel: 'L3',
        data: {
          totalItems: items.length,
          totalInventoryValue: Math.round(totalInventoryValue),
          totalUsers: users.length,
          activeBookingsCount: bookings.filter(b => b.status === 'approved').length,
          pendingProcurementsCount: purchaseOrders.filter(po => po.status === 'pending').length,
          totalAuditEvents: auditLogs.length,
          recentAuditLogs: auditLogs.slice(0, 5),
          budgetSummary: {
            total: budgetData?.budget || 150000,
            pendingPOs: purchaseOrders.filter(po => po.status === 'pending').length
          }
        }
      });
    }

    // 4. EXECUTIVE DASHBOARD (L4)
    const totalLabs = 8;
    const bookedRoomsThisMonth = new Set(bookings.filter(b => b.status === 'approved').map(b => b.room)).size;
    const labUtilizationRate = Math.min(100, Math.round((bookedRoomsThisMonth / totalLabs) * 100));
    const totalInventoryValue = items.reduce((sum, it) => sum + (parseFloat(it.qty || 0) * (parseFloat(it.unitPrice || 120))), 0);
    const totalBudget = parseFloat(budgetData?.budget || 150000);
    const spentBudget = purchaseOrders
      .filter(po => po.status === 'approved' || po.status === 'received')
      .reduce((sum, po) => sum + parseFloat(po.totalPrice || po.estimatedCost || 0), 0);

    return res.json({
      success: true,
      role: 'Executive',
      roleLevel: 'L4',
      data: {
        totalLabs,
        labUtilizationRate: `${labUtilizationRate}%`,
        totalInventoryValue: Math.round(totalInventoryValue),
        chemicalUsageCount: transactions.filter(t => t.category === 'สารเคมี').length,
        budgetUsage: {
          totalBudget,
          spentBudget,
          remainingBudget: Math.max(0, totalBudget - spentBudget),
          usagePercent: `${totalBudget > 0 ? Math.round((spentBudget / totalBudget) * 100) : 0}%`
        },
        monthlyExpenditure: spentBudget,
        safetyIncidentsCount: 0
      }
    });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
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

let usersCache = null;
let lastUsersFetch = 0;

// Fetch Live Users — Supabase / Database as Single Source of Truth
async function fetchLiveUsers(forceRefresh = false) {
  if (!forceRefresh && usersCache && (Date.now() - lastUsersFetch < 15000)) {
    return usersCache;
  }

  // 1. Primary Source of Truth: Supabase Database
  if (supabase) {
    try {
      const { data: supaUsers, error } = await supabase.from('users').select('*');
      if (!error && Array.isArray(supaUsers) && supaUsers.length > 0) {
        const activeUsers = supaUsers.filter(u => u.is_deleted !== true && u.isDeleted !== true);

        const cleanUsers = activeUsers.map(su => {
          const tId = String(su.teacherId || su.teacher_id || su.id || '').trim();
          const isAdmin = (tId === 'admin' || tId === '10823' || su.id === 'u_admin' || su.id === 'u_10823');
          const defaultPlain = isAdmin ? 'SciAdmin@2026' : tId;
          let userPass = su.password;
          if (!userPass || (!userPass.startsWith('$2a$') && !userPass.startsWith('$2b$'))) {
            userPass = bcrypt.hashSync(defaultPlain, 10);
          }
          const plainPass = su.plain_password || defaultPlain;
          const mustChange = Boolean(su.must_change_password || su.mustChangePassword);

          return {
            id: su.id || ("u_" + tId),
            teacherId: tId,
            teacher_id: tId,
            name: su.name || `ครู (${tId})`,
            department: su.department || 'กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี',
            email: su.email || `${tId.toLowerCase()}@lab.school.ac.th`,
            role: su.role || 'L1',
            roleName: su.roleName || su.role_name || 'Teacher / User',
            assignedRooms: Array.isArray(su.assignedRooms) ? su.assignedRooms : (typeof su.assignedRooms === 'string' && su.assignedRooms ? su.assignedRooms.split(',').map(s => s.trim()) : (Array.isArray(su.assigned_rooms) ? su.assigned_rooms : [])),
            initials: su.initials || calculateUserInitials(su.name) || 'U',
            color: su.color || getRoleColor(su.role),
            password: userPass,
            plain_password: plainPass,
            display_password: plainPass,
            must_change_password: mustChange,
            mustChangePassword: mustChange,
            password_changed_at: su.password_changed_at || null,
            isActive: su.isActive !== false && su.is_active !== false,
            createdAt: su.createdAt || su.created_at || new Date().toISOString(),
            updatedAt: su.updatedAt || su.updated_at || new Date().toISOString(),
            createdBy: su.createdBy || su.created_by || 'system',
            updatedBy: su.updatedBy || su.updated_by || 'system',
            is_deleted: false
          };
        });

        // NOTE: Production database users are NEVER written to a local JSON file
        usersCache = cleanUsers;
        lastUsersFetch = Date.now();
        return cleanUsers;
      }
    } catch(e) {
      console.warn("[SourceOfTruth:Supabase] Users read notice:", e.message);
    }
  }

  // 2. Production Security Guard: In production, users MUST come from the database backend
  if (IS_PRODUCTION) {
    console.error("[Auth:Security] In production mode, authentication and users MUST come from database backend. Local fallback rejected.");
    return [];
  }

  // 3. Standby Offline Mock (Development Only)
  const localUsers = readUsers().filter(u => !u.is_deleted).map(u => {
    const tId = String(u.teacherId || u.teacher_id || u.id || '').trim();
    const isAdmin = (tId === 'admin' || tId === '10823' || u.id === 'u_admin' || u.id === 'u_10823');
    const defaultPlain = isAdmin ? 'SciAdmin@2026' : tId;
    return {
      ...u,
      plain_password: u.plain_password || defaultPlain,
      display_password: u.display_password || u.plain_password || defaultPlain
    };
  });
  usersCache = localUsers;
  lastUsersFetch = Date.now();
  return localUsers;
}

// USERS — Safe Directory for authenticated/guest, Full list strictly for L3 Admin
app.get('/api/users', optionalAuth, async (req, res) => {
  const users = await fetchLiveUsers();
  const role = req.user ? normalizeRole(req.user.role || req.user.roleLevel) : 'L0';

  if (role === 'L3') {
    // Admin gets full user list with visible display_password for password management
    const adminView = users.map(u => {
      const copy = { ...u };
      copy.initials = calculateUserInitials(u.name) || u.initials || 'U';
      const isAdmin = (u.teacherId === 'admin' || u.teacherId === '10823' || u.id === 'u_admin' || u.id === 'u_10823');
      copy.display_password = u.plain_password || u.display_password || (isAdmin ? 'SciAdmin@2026' : (u.teacherId || ''));
      delete copy.password;
      delete copy.password_hash;
      return copy;
    });
    return res.json(adminView);
  }

  // Non-admins / guest: Safe public directory without sensitive credentials
  const safeDirectory = users.map(u => ({
    id: u.id,
    teacherId: u.teacherId,
    name: u.name,
    department: u.department,
    role: u.role,
    roleName: u.roleName,
    assignedRooms: u.assignedRooms,
    initials: calculateUserInitials(u.name) || u.initials || 'U',
    color: u.color,
    isActive: u.isActive
  }));
  res.json(safeDirectory);
});

// CREATE USER — Strictly L3 Admin
app.post('/api/users', authenticateToken, requireRole('L3'), async (req, res) => {
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
  newUser.teacher_id = newUser.teacherId;
  newUser.assignedRooms = Array.isArray(newUser.assignedRooms) ? newUser.assignedRooms : [];
  newUser.isActive = newUser.isActive !== false;
  
  const now = new Date().toISOString();
  const actor = req.user?.teacherId || req.user?.name || 'system';
  newUser.createdAt = newUser.createdAt || now;
  newUser.created_at = newUser.createdAt;
  newUser.updatedAt = now;
  newUser.updated_at = now;
  newUser.createdBy = actor;
  newUser.created_by = actor;
  newUser.updatedBy = actor;
  newUser.updated_by = actor;
  newUser.is_deleted = false;

  // Securely hash password with bcrypt
  const rawPass = String(newUser.password || newUser.teacherId || '1234').trim();
  newUser.password = bcrypt.hashSync(rawPass, 10);
  
  // Assign avatar color strictly based on role
  newUser.color = getRoleColor(newUser.role);
  newUser.initials = calculateUserInitials(newUser.name);
  
  users.push(newUser);
  writeUsers(users);
  usersCache = users;

  // 1. Sync to Supabase (Primary Source of Truth)
  if (supabase) {
    try {
      await supabase.from('users').upsert(newUser, { onConflict: 'id' });
    } catch(err) {
      console.warn("[SourceOfTruth:Supabase] user sync error:", err.message);
    }
  }

  // 2. Export / Backup to Google Sheets (Asynchronous Outbound Sink)
  const copy = sanitizeUser(newUser);
  syncToGoogleSheets('Users', 'UPSERT', copy, 'teacherId');

  // Audit Log
  recordAuditLog({
    action: 'USER_CREATE',
    resource: 'users',
    resourceId: newUser.id,
    details: `เพิ่มผู้ใช้ใหม่: ${newUser.name} (${newUser.teacherId}, Role: ${newUser.role})`,
    req
  });

  res.json({ success: true, user: sanitizeUser(newUser) });
});

// BATCH CREATE USERS — Strictly L3 Admin
app.post('/api/users/batch', authenticateToken, requireRole('L3'), async (req, res) => {
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

  let addedCount = 0;
  let updatedCount = 0;
  const processedUsers = [];

  incomingList.forEach(u => {
    const teacherId = (u.teacherId || '').toString().trim();
    if (!teacherId) return;

    const role = (u.role || 'L1').toUpperCase();
    const cleanRole = ['L1', 'L2', 'L3', 'L4'].includes(role) ? role : 'L1';
    
    let assignedRooms = [];
    if (Array.isArray(u.assignedRooms)) {
      assignedRooms = u.assignedRooms;
    } else if (typeof u.assignedRooms === 'string' && u.assignedRooms.trim()) {
      assignedRooms = u.assignedRooms.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
    }

    const name = (u.name || '').trim();
    const dept = (u.department || '').trim() || 'กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี';
    const email = (u.email || '').trim() || `${teacherId.toLowerCase()}@lab.school.ac.th`;
    
    // Hash password with bcrypt
    const rawPass = String(u.password || teacherId).trim();
    const hashedPassword = (rawPass.startsWith('$2a$') || rawPass.startsWith('$2b$'))
      ? rawPass
      : bcrypt.hashSync(rawPass, 10);

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
      password: hashedPassword,
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

    const copy = sanitizeUser(formattedUser);
    syncToGoogleSheets('Users', 'UPSERT', copy, 'teacherId');
  });

  writeUsers(users);

  // Sync to Supabase
  if (supabase && processedUsers.length > 0) {
    try {
      await supabase.from('users').upsert(processedUsers, { onConflict: 'id' });
    } catch(err) {
      console.warn("Supabase batch user sync error:", err.message);
    }
  }

  // Audit Log
  recordAuditLog({
    action: 'USERS_BATCH_CREATE',
    resource: 'users',
    resourceId: 'batch',
    details: `นำเข้า/อัปเดตผู้ใช้งานจำนวนรวม ${processedUsers.length} รายการ (เพิ่ม ${addedCount}, แก้ไข ${updatedCount})`,
    req
  });

  res.json({
    success: true,
    addedCount: addedCount,
    updatedCount: updatedCount,
    totalProcessed: processedUsers.length,
    users: users.map(u => sanitizeUser(u))
  });
});

// UPDATE USER — Strictly L3 Admin
app.put('/api/users/:id', authenticateToken, requireRole('L3'), async (req, res) => {
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

    // If password is being changed, hash it with bcrypt and save plain_password
    if (req.body.password && typeof req.body.password === 'string') {
      const p = req.body.password.trim();
      if (p) {
        if (!p.startsWith('$2a$') && !p.startsWith('$2b$')) {
          updated.password = bcrypt.hashSync(p, 10);
          updated.plain_password = p;
          updated.display_password = p;
        } else {
          updated.password = p;
        }
      }
    }

    users[index] = updated;
    writeUsers(users);

    const copy = sanitizeUser(users[index]);
    syncToGoogleSheets('Users', 'UPSERT', copy, 'teacherId');

    // Sync to Supabase
    if (supabase) {
      try {
        await supabase.from('users').upsert(users[index], { onConflict: 'id' });
      } catch(err) {
        console.warn("Supabase update user sync error:", err.message);
      }
    }

    // Audit Log
    recordAuditLog({
      action: 'USER_UPDATE',
      resource: 'users',
      resourceId: users[index].id,
      details: `แก้ไขข้อมูลผู้ใช้: ${users[index].name} (${users[index].teacherId})`,
      req
    });

    res.json({ success: true, user: sanitizeUser(users[index]) });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

// RESET USER PASSWORD (L3 Admin only - can reset to Teacher ID or custom new password)
app.post('/api/users/:id/reset-password', authenticateToken, requireRole('L3'), async (req, res) => {
  const { id } = req.params;
  const { newPassword, resetToTeacherId } = req.body;
  
  const users = await fetchLiveUsers(true);
  const user = users.find(u => u.id === id || u.teacherId === id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้ในระบบ' });
  }

  let chosenPassword = '';
  if (resetToTeacherId || !newPassword) {
    chosenPassword = String(user.teacherId || user.id);
  } else {
    chosenPassword = String(newPassword).trim();
  }

  if (chosenPassword.length < 4) {
    return res.status(400).json({ success: false, message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร' });
  }

  const newHash = bcrypt.hashSync(chosenPassword, 10);
  user.password = newHash;
  user.plain_password = chosenPassword;
  user.display_password = chosenPassword;
  user.must_change_password = false;
  user.mustChangePassword = false;
  user.password_changed_at = new Date().toISOString();
  user.updatedAt = new Date().toISOString();
  user.updatedBy = req.user.teacherId || req.user.id;

  // Persist locally
  if (!IS_PRODUCTION) {
    const localUsers = readUsers();
    const lIdx = localUsers.findIndex(u => u.id === user.id || u.teacherId === user.teacherId);
    if (lIdx !== -1) {
      localUsers[lIdx].password = newHash;
      localUsers[lIdx].plain_password = chosenPassword;
      localUsers[lIdx].display_password = chosenPassword;
      localUsers[lIdx].must_change_password = false;
      localUsers[lIdx].mustChangePassword = false;
      localUsers[lIdx].password_changed_at = user.password_changed_at;
      localUsers[lIdx].updatedAt = user.updatedAt;
      localUsers[lIdx].updatedBy = user.updatedBy;
      writeUsers(localUsers);
    }
  }

  // Persist to Supabase
  if (supabase) {
    try {
      const updateData = {
        password: newHash,
        plain_password: chosenPassword,
        must_change_password: false,
        password_changed_at: user.password_changed_at,
        updated_at: user.updatedAt,
        updated_by: user.updatedBy
      };
      const { error } = await supabase.from('users').update(updateData).eq('id', user.id);
      if (error && error.message.includes('plain_password')) {
        delete updateData.plain_password;
        await supabase.from('users').update(updateData).eq('id', user.id);
      }
    } catch(err) {
      console.warn("[Admin:ResetPassword] Supabase update warning:", err.message);
    }
  }

  // Audit Log
  recordAuditLog({
    actorId: req.user.teacherId || req.user.id,
    actorName: req.user.name,
    actorRole: req.user.role || 'L3',
    action: 'ADMIN_RESET_USER_PASSWORD',
    resource: 'users',
    resourceId: user.id,
    details: `ผู้ดูแลระบบ ${req.user.name} ได้รีเซ็ตรหัสผ่านใหม่ให้กับ ${user.name} (${user.teacherId}): ${chosenPassword}`,
    req
  });

  return res.json({
    success: true,
    message: `รีเซ็ตรหัสผ่านให้ ${user.name} สำเร็จแล้ว`,
    teacherId: user.teacherId,
    newPassword: chosenPassword
  });
});

// DELETE USER — Strictly L3 Admin
app.delete('/api/users/:id', authenticateToken, requireRole('L3'), async (req, res) => {
  const targetId = req.params.id;
  let users = readUsers();
  const userToDelete = users.find(u => u.id === targetId || u.teacherId === targetId || u.teacher_id === targetId);
  users = users.filter(u => u.id !== targetId && u.teacherId !== targetId && u.teacher_id !== targetId);
  writeUsers(users);

  // Invalidate in-memory cache so subsequent fetches reload fresh state
  usersCache = null;
  lastUsersFetch = 0;

  const actor = req.user?.teacherId || req.user?.name || 'admin';
  const teacherId = userToDelete?.teacherId || userToDelete?.teacher_id || targetId;

  // 1. Delete in Supabase (Primary Source of Truth)
  if (supabase) {
    try {
      const cleanTargetId = String(targetId || '').replace(/^u_/, '');
      const cleanTeacherId = String(teacherId || '').replace(/^u_/, '');
      const orClauses = [
        `id.eq.${targetId}`,
        `teacherId.eq.${targetId}`,
        `id.eq.${cleanTargetId}`,
        `teacherId.eq.${cleanTargetId}`
      ];
      if (teacherId && teacherId !== targetId) {
        orClauses.push(
          `id.eq.${teacherId}`,
          `teacherId.eq.${teacherId}`,
          `id.eq.${cleanTeacherId}`,
          `teacherId.eq.${cleanTeacherId}`
        );
      }
      await supabase.from('users').delete().or([...new Set(orClauses)].join(','));
    } catch(err) {
      console.warn("[SourceOfTruth:Supabase] Delete user notice:", err.message);
    }
  }

  // 2. Export / Backup to Google Sheets
  if (teacherId) {
    syncToGoogleSheets('Users', 'DELETE', { teacherId: teacherId }, 'teacherId');
  }

  // Audit Log
  recordAuditLog({
    action: 'USER_DELETE',
    resource: 'users',
    resourceId: targetId,
    details: `ลบผู้ใช้งาน: ${userToDelete ? userToDelete.name : targetId} (${teacherId})`,
    req
  });

  res.json({ success: true, message: "User deleted successfully" });
});

// BATCH DELETE USERS ENDPOINT — Strictly L3 Admin
app.post('/api/users/batch-delete', authenticateToken, requireRole('L3'), async (req, res) => {
  const { ids, teacherIds } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "No user IDs provided" });
  }

  const allIds = Array.isArray(teacherIds) ? [...new Set([...ids, ...teacherIds])] : ids;

  let users = readUsers();
  const deletedUsers = users.filter(u => allIds.includes(u.id) || (u.teacherId && allIds.includes(u.teacherId)));
  users = users.filter(u => !allIds.includes(u.id) && (!u.teacherId || !allIds.includes(u.teacherId)));
  writeUsers(users);

  // Invalidate in-memory cache
  usersCache = null;
  lastUsersFetch = 0;

  // 1. Delete in Supabase (Primary Source of Truth)
  if (supabase) {
    try {
      const cleanIds = (ids || []).map(x => String(x).replace(/^u_/, ''));
      const cleanTids = (teacherIds || []).map(x => String(x).replace(/^u_/, ''));
      const allTargetIds = [...new Set([...ids, ...cleanIds])].filter(Boolean);
      const allTargetTids = [...new Set([...(teacherIds || []), ...cleanTids])].filter(Boolean);

      if (allTargetIds.length > 0) {
        await supabase.from('users').delete().in('id', allTargetIds);
      }
      if (allTargetTids.length > 0) {
        await supabase.from('users').delete().in('teacherId', allTargetTids);
      }
    } catch(err) {
      console.warn("[SourceOfTruth:Supabase] Batch delete users notice:", err.message);
    }
  }

  // 2. Export / Backup to Google Sheets
  const sheetsTargets = [...new Set([...deletedUsers.map(u => u.teacherId), ...(teacherIds || [])])].filter(Boolean);
  sheetsTargets.forEach(tId => {
    syncToGoogleSheets('Users', 'DELETE', { teacherId: tId }, 'teacherId');
  });

  // Audit Log
  recordAuditLog({
    action: 'USERS_BATCH_DELETE',
    resource: 'users',
    resourceId: 'batch',
    details: `ลบผู้ใช้งานจำนวน ${ids.length} รายการ`,
    req
  });

  res.json({ success: true, deletedCount: ids.length });
});

// Helper: Normalize Thai numbers (e.g. ๑๒๓ -> 123)
function normalizeThaiDigits(str) {
  if (!str) return '';
  const thaiDigits = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  return String(str).replace(/[๐-๙]/g, ch => {
    const idx = thaiDigits.indexOf(ch);
    return idx !== -1 ? idx : ch;
  });
}

// AUTH LOGIN ENDPOINT (Supports Teacher ID, Email, Name, or ID)
app.post('/api/auth/login', async (req, res) => {
  if (!JWT_SECRET) {
    return res.status(500).json({
      success: false,
      code: 'SERVER_MISCONFIGURED',
      message: 'ระบบยืนยันตัวตนไม่พร้อมใช้งาน กรุณากำหนดค่า JWT_SECRET ในสภาพแวดล้อมระบบ'
    });
  }
  const { username, password } = req.body;
  if (IS_PRODUCTION && !supabase) {
    return res.status(503).json({
      success: false,
      message: "ระบบยืนยันตัวตนในโหมด Production ต้องเชื่อมต่อฐานข้อมูลหลัก กรุณาตรวจสอบการตั้งค่าฐานข้อมูล"
    });
  }
  let users = await fetchLiveUsers();
  
  const rawUser = normalizeThaiDigits((username || '').trim());
  const cleanUser = rawUser.toLowerCase();
  const rawPass = normalizeThaiDigits((password || '').trim());
  const cleanPass = rawPass;

  if (!cleanUser) {
    return res.status(400).json({ success: false, message: "กรุณาระบุรหัสประจำตัวครูหรือชื่อผู้ใช้งาน" });
  }

  const findUserInList = (list) => {
    return list.find(u => {
      const tId = normalizeThaiDigits(String(u.teacherId || '')).trim().toLowerCase();
      const uEmail = String(u.email || '').trim().toLowerCase();
      const uId = String(u.id || '').trim().toLowerCase();
      const uName = String(u.name || '').trim().toLowerCase();
      const uNameWithoutTitle = uName.replace(/^(ครู|อาจารย์|อ\.|ม\.|มิส|นาย|นางสาว|นาง|น\.ส\.|ดร\.|ผอ\.)\s*/, '');

      // 1. Exact matches on teacherId, email, id, name
      if (tId && (tId === cleanUser || Number(tId) === Number(cleanUser))) return true;
      if (uEmail && uEmail === cleanUser) return true;
      if (uId && uId === cleanUser) return true;
      if (uName && uName === cleanUser) return true;
      if (uNameWithoutTitle && uNameWithoutTitle === cleanUser) return true;

      // 2. Partial match on name
      if (cleanUser.length >= 3 && (uName.includes(cleanUser) || cleanUser.includes(uNameWithoutTitle))) return true;

      // 3. Admin alias (match specific admin user account)
      if (cleanUser === 'admin') {
        if (tId === 'admin' || uId === 'u_admin' || uEmail.startsWith('admin@')) return true;
      }

      return false;
    });
  };

  let user = findUserInList(users);

  // If user is not found, force fresh fetch from Google Sheets in case they were just added!
  if (!user && GOOGLE_SCRIPT_URL) {
    users = await fetchLiveUsers(true);
    user = findUserInList(users);
  }

  if (user) {
    const userPass = String(user.password || '').trim();
    
    // Guard against Breached Passwords from known leak list
    if (LEAKED_HISTORICAL_PASSWORDS.has(cleanPass)) {
      recordAuditLog({
        actorId: user.teacherId || user.id,
        actorName: user.name,
        actorRole: user.role || 'L0',
        action: 'LOGIN_REJECTED_BREACHED_PASSWORD',
        resource: 'auth',
        resourceId: user.id,
        details: `ปฏิเสธการเข้าสู่ระบบ: ตรวจพบการใช้รหัสผ่านที่ถูกเพิกถอนความปลอดภัย (${cleanUser})`,
        req
      });
      return res.status(401).json({
        success: false,
        code: 'CREDENTIAL_REVOKED_SECURITY_RESET',
        message: 'รหัสผ่านนี้ถูกระงับเนื่องจากนโยบายความปลอดภัย กรุณาติดต่อผู้ดูแลระบบเพื่อรีเซ็ตรหัสผ่าน'
      });
    }

    // Check password match securely with bcrypt
    const isPasswordCorrect = verifyPassword(cleanPass, userPass, user);

    if (isPasswordCorrect) {
      const mustChange = Boolean(user.must_change_password || user.mustChangePassword);

      // Generate JWT Token with secure claims & expiration
      const tokenPayload = {
        jti: crypto.randomUUID ? crypto.randomUUID() : (Date.now() + '-' + Math.random().toString(36).slice(2)),
        id: user.id,
        teacherId: user.teacherId || user.id,
        name: user.name,
        role: user.role || 'L1',
        roleLevel: normalizeRole(user.role || 'L1'),
        department: user.department || '',
        assignedRooms: user.assignedRooms || [],
        mustChangePassword: mustChange
      };

      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      // Record Audit Log for successful login
      recordAuditLog({
        actorId: user.teacherId || user.id,
        actorName: user.name,
        actorRole: user.role || 'L1',
        action: 'USER_LOGIN',
        resource: 'auth',
        resourceId: user.id,
        details: `เข้าสู่ระบบสำเร็จในฐานะ ${user.name} (${user.role || 'L1'})${mustChange ? ' [จำเป็นต้องเปลี่ยนรหัสผ่าน]' : ''}`,
        req
      });

      return res.json({
        success: true,
        token,
        must_change_password: mustChange,
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
          color: user.color || '#3b82f6',
          must_change_password: mustChange
        }
      });
    } else {
      recordAuditLog({
        actorId: user.teacherId || user.id,
        actorName: user.name,
        actorRole: user.role || 'L0',
        action: 'LOGIN_FAILED',
        resource: 'auth',
        resourceId: user.id,
        details: `รหัสผ่านไม่ถูกต้องสำหรับชื่อผู้ใช้ ${cleanUser}`,
        req
      });

      return res.status(401).json({ 
        success: false, 
        message: "รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านของท่านหรือติดต่อผู้ดูแลระบบ" 
      });
    }
  }

  return res.status(401).json({ 
    success: false, 
    message: "ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาติดต่อผู้ดูแลระบบ (Admin) เพื่อเพิ่มรายชื่อในหน้าจัดการสิทธิ์ผู้ใช้งาน" 
  });
});

// AUTH LOGOUT ENDPOINT (Server-side Session Revocation)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  if (req.token) {
    revokedTokens.add(req.token);
  }
  recordAuditLog({
    actorId: req.user.teacherId || req.user.id,
    actorName: req.user.name,
    actorRole: req.user.role,
    action: 'USER_LOGOUT',
    resource: 'auth',
    resourceId: req.user.id,
    details: `ออกจากระบบ (${req.user.name})`,
    req
  });
  res.json({ success: true, message: 'ออกจากระบบเรียบร้อยแล้ว' });
});

// AUTH CHANGE PASSWORD ENDPOINT (Enforces strong passwords, prohibits leaked/teacherId passwords)
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "กรุณาระบุรหัสผ่านปัจจุบันและรหัสผ่านใหม่" });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: "รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน" });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร" });
  }

  if (newPassword === currentPassword) {
    return res.status(400).json({ success: false, message: "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม" });
  }

  const cleanNew = normalizeThaiDigits(newPassword.trim());
  const teacherId = String(req.user.teacherId || '').trim();

  // Guard: Rule 1 & Rule 5 - Cannot use leaked passwords or Teacher ID
  if (LEAKED_HISTORICAL_PASSWORDS.has(cleanNew) || (teacherId && cleanNew === teacherId)) {
    return res.status(400).json({ 
      success: false, 
      message: "รหัสผ่านใหม่มีความเสี่ยงสูงหรือเดาง่ายเกินไป (ห้ามใช้รหัสประจำตัวครูหรือรหัสผ่านทั่วไป)" 
    });
  }

  const users = await fetchLiveUsers(true);
  const user = users.find(u => u.id === req.user.id || u.teacherId === req.user.teacherId);

  if (!user) {
    return res.status(404).json({ success: false, message: "ไม่พบข้อมูลผู้ใช้ในระบบ" });
  }

  // Verify current password
  const isCurrentValid = verifyPassword(currentPassword, user.password, user);
  if (!isCurrentValid) {
    return res.status(401).json({ success: false, message: "รหัสผ่านปัจจุบันไม่ถูกต้อง" });
  }

  // Hash new password with bcrypt (10 rounds)
  const newHash = bcrypt.hashSync(cleanNew, 10);
  user.password = newHash;
  user.plain_password = cleanNew;
  user.display_password = cleanNew;
  user.must_change_password = false;
  user.mustChangePassword = false;
  user.password_changed_at = new Date().toISOString();
  user.updatedAt = new Date().toISOString();
  user.updatedBy = req.user.teacherId || req.user.id;

  // Persist locally if non-production
  if (!IS_PRODUCTION) {
    const localUsers = readUsers();
    const lIdx = localUsers.findIndex(u => u.id === user.id || u.teacherId === user.teacherId);
    if (lIdx !== -1) {
      localUsers[lIdx].password = newHash;
      localUsers[lIdx].plain_password = cleanNew;
      localUsers[lIdx].display_password = cleanNew;
      localUsers[lIdx].must_change_password = false;
      localUsers[lIdx].mustChangePassword = false;
      localUsers[lIdx].password_changed_at = user.password_changed_at;
      writeUsers(localUsers);
    }
  }

  // Persist to Supabase if connected
  if (supabase) {
    try {
      const updatePayload = {
        password: newHash,
        plain_password: cleanNew,
        must_change_password: false,
        password_changed_at: user.password_changed_at,
        updated_at: user.updatedAt,
        updated_by: user.updatedBy
      };
      const { error } = await supabase.from('users').update(updatePayload).eq('id', user.id);
      if (error && error.message.includes('plain_password')) {
        delete updatePayload.plain_password;
        await supabase.from('users').update(updatePayload).eq('id', user.id);
      }
    } catch(err) {
      console.warn("[Auth:ChangePassword] Supabase update notice:", err.message);
    }
  }

  // Issue fresh JWT without mustChangePassword restriction
  const tokenPayload = {
    jti: crypto.randomUUID ? crypto.randomUUID() : (Date.now() + '-' + Math.random().toString(36).slice(2)),
    id: user.id,
    teacherId: user.teacherId || user.id,
    name: user.name,
    role: user.role || 'L1',
    roleLevel: normalizeRole(user.role || 'L1'),
    department: user.department || '',
    assignedRooms: user.assignedRooms || [],
    mustChangePassword: false
  };

  const newToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  // Record Audit Log (DO NOT log the password!)
  recordAuditLog({
    actorId: user.teacherId || user.id,
    actorName: user.name,
    actorRole: user.role || 'L1',
    action: 'USER_PASSWORD_CHANGE',
    resource: 'auth',
    resourceId: user.id,
    details: `ผู้ใช้ ${user.name} (${user.teacherId}) ได้เปลี่ยนรหัสผ่านใหม่เรียบร้อยแล้ว`,
    req
  });

  return res.json({
    success: true,
    message: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว",
    token: newToken,
    must_change_password: false
  });
});

// AUTH ME ENDPOINT (Verify session token and return user info)
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// AUDIT LOGS — Protected: strictly L3 Admin and L4 Executive only
app.get('/api/audit-logs', authenticateToken, requireRole('L3', 'L4'), (req, res) => {
  res.json(readAuditLogs());
});

app.post('/api/audit-logs', authenticateToken, (req, res) => {
  const newLog = recordAuditLog({
    action: req.body.action || 'CUSTOM_EVENT',
    resource: req.body.resource || 'system',
    resourceId: req.body.resourceId || '',
    details: req.body.details || req.body.actionText || '',
    req
  });
  syncToGoogleSheets('Audit_Logs', 'UPSERT', newLog, 'id');
  res.json({ success: true, log: newLog });
});

// GET /api/layouts
app.get('/api/layouts', (req, res) => {
  res.json(readLayouts());
});

// POST /api/layouts — Strictly L3 Admin
app.post('/api/layouts', authenticateToken, requireRole('L3'), (req, res) => {
  const success = writeLayouts(req.body);
  if (success) {
    recordAuditLog({
      action: 'LAYOUTS_UPDATE',
      resource: 'layouts',
      resourceId: 'all',
      details: 'อัปเดตและบันทึกผังตู้จัดเก็บสารเคมี (Cabinet Layouts)',
      req
    });
    res.json({ success: true });
  } else {
    res.status(500).json({ error: "Failed to save layouts" });
  }
});

// FEEDBACKS — Restricted to Lab Staff & Admins
app.get('/api/feedbacks', authenticateToken, requireRole('L2', 'L3', 'L4'), (req, res) => {
  res.json(readFeedbacks());
});

app.post('/api/feedbacks', optionalAuth, (req, res) => {
  const feedbacks = readFeedbacks();
  const newFeedback = req.body;
  newFeedback.id = newFeedback.id || "fb-" + Date.now();
  newFeedback.timestamp = newFeedback.timestamp || new Date().toISOString();
  newFeedback.status = newFeedback.status || "unread";
  
  feedbacks.unshift(newFeedback);
  
  writeFeedbacks(feedbacks);
  res.json({ success: true, feedback: newFeedback });
});

app.put('/api/feedbacks/:id', authenticateToken, requireRole('L2', 'L3'), (req, res) => {
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

// POST /api/announcements — Strictly L3 Admin
app.post('/api/announcements', authenticateToken, requireRole('L3'), (req, res) => {
  const success = writeAnnouncements(req.body);
  if (success) {
    recordAuditLog({
      action: 'ANNOUNCEMENT_UPDATE',
      resource: 'announcements',
      resourceId: 'ticker',
      details: `อัปเดตข้อความประกาศ: ${req.body.text || ''}`,
      req
    });
    res.json({ success: true, settings: req.body });
  } else {
    res.status(500).json({ error: "Failed to save announcements" });
  }
});

// EMERGENCY CONTACTS
app.get('/api/emergency-contacts', (req, res) => {
  res.json(readEmergencyContacts());
});

// POST /api/emergency-contacts — Strictly L3 Admin
app.post('/api/emergency-contacts', authenticateToken, requireRole('L3'), (req, res) => {
  const success = writeEmergencyContacts(req.body);
  if (success) {
    syncToGoogleSheets('Announcements', 'UPSERT', { ...readAnnouncements(), emergencyContacts: req.body }, 'badgeText');
    recordAuditLog({
      action: 'EMERGENCY_CONTACTS_UPDATE',
      resource: 'emergency_contacts',
      resourceId: 'contacts',
      details: 'อัปเดตข้อมูลผู้ติดต่อกรณีฉุกเฉินประจำห้องแล็บ',
      req
    });
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

// GET Push Subscriptions status — Strictly L3 Admin
app.get('/api/push-subscriptions', authenticateToken, requireRole('L3'), (req, res) => {
  const subs = readPushSubscriptions();
  res.json({ count: subs.length, subscriptions: subs });
});

// POST Save Push Subscription — Authenticated
app.post('/api/push-subscriptions', authenticateToken, (req, res) => {
  const { subscription, deviceName } = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: "Invalid subscription data" });
  }

  const subs = readPushSubscriptions();
  const existingIdx = subs.findIndex(s => s.subscription && s.subscription.endpoint === subscription.endpoint);
  
  const record = {
    id: "sub_" + Date.now(),
    subscription,
    userRole: normalizeRole(req.user.role || req.user.roleLevel),
    userId: req.user.id || req.user.teacherId,
    userName: req.user.name || 'User',
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

// DELETE Push Subscription — Authenticated
app.delete('/api/push-subscriptions', authenticateToken, (req, res) => {
  const { endpoint } = req.body;
  let subs = readPushSubscriptions();
  subs = subs.filter(s => s.subscription && s.subscription.endpoint !== endpoint);
  writePushSubscriptions(subs);
  res.json({ success: true, count: subs.length });
});

// POST Send Test Push Notification — Strictly L3 Admin
app.post('/api/test-push', authenticateToken, requireRole('L3'), async (req, res) => {
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

// POST Trigger Push Notification for new request — Authenticated
app.post('/api/notify-admins', authenticateToken, async (req, res) => {
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

// POST Quick-Approve directly from Push Notification action button (L2 Staff or L3 Admin)
app.post('/api/quick-approve', authenticateToken, requireRole('L2', 'L3'), (req, res) => {
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

    // Verify room access for L2 staff
    if (normalizeRole(req.user.role) === 'L2' && !canUserAccessRoom(req.user, bookings[bkIndex].room)) {
      return res.status(403).json({ error: `เจ้าหน้าที่ไม่มีสิทธิ์อนุมัติการจองห้อง ${bookings[bkIndex].room}` });
    }

    bookings[bkIndex].status = "approved";
    bookings[bkIndex].approvedAt = new Date().toISOString();
    writeBookings(bookings);

    // Central Audit Log
    recordAuditLog({
      action: "QUICK_APPROVE_BOOKING",
      resource: "bookings",
      resourceId: id,
      details: `อนุมัติการจองห้อง ${bookings[bkIndex].room} ของ ${bookings[bkIndex].bookerName}`,
      req
    });

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
      // Verify room access for L2 staff
      if (normalizeRole(req.user.role) === 'L2' && !canUserAccessRoom(req.user, item.room)) {
        return res.status(403).json({ error: `เจ้าหน้าที่ไม่มีสิทธิ์อนุมัติรายการในห้อง ${item.room}` });
      }

      if (item.qty < (tx.qty || 1)) {
        return res.status(400).json({ error: `สต็อกคงเหลือไม่พอ (${item.qty} ${item.unit || ''})` });
      }
      items[itemIndex].qty = item.qty - (tx.qty || 1);
      writeDatabase(items);
    }

    transactions[txIndex].status = "borrowed";
    transactions[txIndex].approvedAt = new Date().toISOString();
    writeTransactions(transactions);

    // Central Audit Log
    recordAuditLog({
      action: "QUICK_APPROVE_BORROW",
      resource: "transactions",
      resourceId: id,
      details: `อนุมัติคำขอยืม ${tx.itemName} จำนวน ${tx.qty} โดย ${tx.borrower}`,
      req
    });

    return res.json({ 
      success: true, 
      message: `อนุมัติคำขอยืม "${tx.itemName}" และตัดสต็อกเรียบร้อยแล้ว!` 
    });
  }

  res.status(400).json({ error: "Unknown request type" });
});

// DANGER ZONE (Clear Workspace) — Strictly L3 Admin
app.delete('/api/workspace', authenticateToken, requireRole('L3'), (req, res) => {
  try {
    // Clear the core arrays but keep the files
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2), 'utf-8');
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
    fs.writeFileSync(PURCHASE_ORDERS_FILE, JSON.stringify([], null, 2), 'utf-8');
    fs.writeFileSync(FEEDBACKS_FILE, JSON.stringify([], null, 2), 'utf-8');
    
    // Record reset action in audit logs
    recordAuditLog({
      action: "RESET_WORKSPACE",
      resource: "workspace",
      resourceId: "all",
      details: "รีเซ็ตและล้างข้อมูล Workspace ทั้งหมด",
      req
    });
    
    res.json({ success: true, message: "Workspace has been completely cleared." });
  } catch (err) {
    res.status(500).json({ error: "Failed to reset workspace." });
  }
});

// Start Express Web Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🧪 Laboratory Management System Backend running!`);
    console.log(`🌐 Server available at: http://localhost:${PORT}`);
    console.log(`🗃️ Database file: ${DB_FILE}`);
    console.log(`=======================================================`);
  });
}

module.exports = app;

