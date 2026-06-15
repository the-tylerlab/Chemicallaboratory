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

// Start Express Web Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🧪 Laboratory Management System Backend running!`);
  console.log(`🌐 Server available at: http://localhost:${PORT}`);
  console.log(`🗃️ Database file: ${DB_FILE}`);
  console.log(`=======================================================`);
});
