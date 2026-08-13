const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static frontend files (index.html, style.css, app.js) directly from current directory
app.use(express.static(path.join(__dirname)));

const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'database.json');
const BUDGET_FILE = path.join(DB_DIR, 'budget.json');
const PURCHASE_ORDERS_FILE = path.join(DB_DIR, 'purchase_orders.json');
const BOOKINGS_FILE = path.join(DB_DIR, 'bookings.json');
const TRANSACTIONS_FILE = path.join(DB_DIR, 'transactions.json');
const USERS_FILE = path.join(DB_DIR, 'users.json');
const AUDIT_LOGS_FILE = path.join(DB_DIR, 'audit_logs.json');

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

// ==========================================================================
// HTTP API ENDPOINTS
// ==========================================================================

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
  res.json({ success: true });
});

// ==========================================
// ADMIN PANEL ENDPOINTS
// ==========================================

// USERS
app.get('/api/users', (req, res) => {
  res.json(readUsers());
});

app.post('/api/users', (req, res) => {
  const users = readUsers();
  const newUser = req.body;
  newUser.id = "u" + Date.now();
  
  // Assign random color/initials for mockup
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#d946ef"];
  newUser.color = colors[Math.floor(Math.random() * colors.length)];
  newUser.initials = newUser.name ? newUser.name.charAt(0).toUpperCase() : "U";
  
  users.push(newUser);
  writeUsers(users);
  res.json({ success: true, user: newUser });
});

app.put('/api/users/:id', (req, res) => {
  const users = readUsers();
  const index = users.findIndex(u => u.id === req.params.id);
  if (index !== -1) {
    users[index] = { ...users[index], ...req.body };
    writeUsers(users);
    res.json({ success: true, user: users[index] });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

app.delete('/api/users/:id', (req, res) => {
  let users = readUsers();
  users = users.filter(u => u.id !== req.params.id);
  writeUsers(users);
  res.json({ success: true });
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
  res.json({ success: true, log: newLog });
});

// DANGER ZONE (Clear Workspace)
app.delete('/api/workspace', (req, res) => {
  try {
    // Clear the core arrays but keep the files
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2), 'utf-8');
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
    fs.writeFileSync(PURCHASE_ORDERS_FILE, JSON.stringify([], null, 2), 'utf-8');
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
