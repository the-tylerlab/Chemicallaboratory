// ==========================================================================
// STATE MANAGEMENT & INITIALIZATION
// ==========================================================================

// Global state variable
let items = [];
let currentPage = 1;
const itemsPerPage = 10;
let fileToImport = null;
let userRole = localStorage.getItem("userRole") || (localStorage.getItem("isAdminLoggedIn") === "true" ? "admin" : "student");

// One-time cleanup of test data for production launch
if (!localStorage.getItem("lab_cleaned_v1.8.0")) {
  localStorage.removeItem("lab_transactions");
  localStorage.removeItem("lab_bookings");
  localStorage.removeItem("lab_items");
  localStorage.removeItem("userRole");
  localStorage.removeItem("isAdminLoggedIn");
  localStorage.setItem("lab_cleaned_v1.8.0", "true");
  userRole = "student";
}


// Configuration for login credentials (edit here to change username and password)
const USER_CREDENTIALS = {
  admin: {
    username: "admin",
    password: "admin1234" // รหัสผ่านของเจ้าหน้าที่แล็บ (Admin)
  },
  teacher: {
    username: "teacher",
    password: "teacher1234" // รหัสผ่านของครูผู้สอน (Teacher)
  }
};

// Constant Categories and Units
const CATEGORIES = ["สารเคมี", "อุปกรณ์วิทยาศาสตร์", "เครื่องแก้ว", "วัสดุสิ้นเปลือง"];
const UNITS = ["ขวด", "หลอด", "ชิ้น", "อัน", "เครื่อง", "กล่อง"];

// Current date tracking for expiration checks (Using system date or simulated date)
// Today's date reference: 2026-05-28
const TODAY = new Date('2026-05-28');

// Default Demo Data to populate LocalStorage if empty
const DEMO_DATA = [
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
    minAlert: 2, // Low stock!
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
    expiry: "2026-04-12", // Expired! (Before May 2026)
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
    expiry: "", // No expiry
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
    minAlert: 10, // Low stock! (8 <= 10)
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
    expiry: "2026-06-15", // Near expiry (18 days remaining from May 28, 2026)
    room: "Lab 1",
    cabinet: "ตู้ B",
    shelf: "ชั้น 1",
    createdAt: "2026-05-18T10:45:00.000Z"
  },
  {
    code: "CHEM-005",
    name: "กรดซัลฟิวริก 98% (Sulfuric Acid)",
    category: "สารเคมี",
    qty: 4,
    unit: "ขวด",
    minAlert: 2,
    expiry: "2027-10-15",
    room: "Lab 1",
    cabinet: "ตู้ A",
    shelf: "ชั้น 3",
    createdAt: "2026-05-20T09:30:00.000Z"
  },
  {
    code: "EQ-002",
    name: "เครื่องวัดความเป็นกรด-ด่าง (pH Meter)",
    category: "อุปกรณ์วิทยาศาสตร์",
    qty: 0,
    unit: "เครื่อง",
    minAlert: 1,
    expiry: "",
    room: "Lab 2",
    cabinet: "ตู้เก็บเครื่องมือ",
    shelf: "ชั้น 1",
    createdAt: "2026-05-22T14:00:00.000Z"
  },
  {
    code: "GW-003",
    name: "หลอดทดลองขนาดใหญ่ 25 มม. (Test Tube 25mm)",
    category: "เครื่องแก้ว",
    qty: 25,
    unit: "ชิ้น",
    minAlert: 10,
    expiry: "",
    room: "Lab 1",
    cabinet: "ตู้เก็บเครื่องแก้ว",
    shelf: "ชั้น C",
    createdAt: "2026-05-25T11:15:00.000Z"
  },
  {
    code: "CHEM-006",
    name: "แอมโมเนียโซลูชัน 25% (Ammonia Solution)",
    category: "สารเคมี",
    qty: 2,
    unit: "ขวด",
    minAlert: 1,
    expiry: "2026-06-25",
    room: "Lab 2",
    cabinet: "ตู้ A",
    shelf: "ชั้น 2",
    createdAt: "2026-05-26T15:45:00.000Z"
  }
];

// Firebase Configuration (เชื่อมต่อคลาวด์อัจฉริยะ)
// กรอกข้อมูลการตั้งค่าจากคลาสสิกคอนโซลของ Firebase เพื่อเปิดใช้งานระบบคลาวด์ซิงค์เรียลไทม์
const firebaseConfig = {
  apiKey: "AIzaSyBEYgji_zDVOrvrFknGn69Eoq6DE-vQri8",
  authDomain: "chemicallab-eefa4.firebaseapp.com",
  projectId: "chemicallab-eefa4",
  storageBucket: "chemicallab-eefa4.firebasestorage.app",
  messagingSenderId: "435854372023",
  appId: "1:435854372023:web:29c5c286d13e3bf9d6b132",
  measurementId: "G-2FX82TTHFP"
};

let db = null;
let isFirebaseOnline = false;

// ตรวจสอบและตั้งค่าเริ่มต้นให้กับ Firebase
if (typeof firebase !== 'undefined' && firebaseConfig.projectId !== "YOUR_PROJECT_ID") {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    isFirebaseOnline = true;
    console.log("🔥 Firebase initialized successfully. Operating in Cloud Sync Mode.");
  } catch (err) {
    console.error("🔥 Firebase initialization failed:", err);
    isFirebaseOnline = false;
  }
} else {
  console.log("🔥 Firebase not configured or script missing. Operating in LocalStorage / Local API mode.");
}

// Global API settings
const API_BASE = "http://localhost:3000/api";
let isBackendOnline = false;
let transactions = [];
let bookings = [];
let selectedSlots = [];
let selectedBorrowItems = [];
let isAdminLoggedIn = localStorage.getItem("isAdminLoggedIn") === "true";
const BOOKING_SLOTS = [
  "คาบ 1: 08:10 - 09:00",
  "คาบ 2: 09:00 - 09:50",
  "คาบ 3: 09:50 - 10:40",
  "คาบ 4: 10:50 - 11:40",
  "คาบ 5: 11:40 - 12:30",
  "พักกลางวัน: 12:30 - 13:20",
  "คาบ 6: 13:20 - 14:10",
  "คาบ 7: 14:10 - 15:00",
  "คาบ 8: 15:10 - 16:00"
];

// Initialize application on DOM ready
document.addEventListener("DOMContentLoaded", async () => {
  // First, check backend online status
  await checkBackendStatus();
  
  // One-Time Firebase Firestore database cleanup (for clearing mock data from cloud)
  if (!localStorage.getItem("firebase_cleared_v1.8.0") && isFirebaseOnline && db) {
    try {
      console.log("🧹 Starting Firebase Firestore cleanup...");
      
      // 1. Clear transactions collection
      const txSnapshot = await db.collection("transactions").get();
      const txBatch = db.batch();
      let txCount = 0;
      txSnapshot.forEach(doc => {
        txBatch.delete(doc.ref);
        txCount++;
      });
      if (txCount > 0) {
        await txBatch.commit();
        console.log(`🧹 Cleared ${txCount} transactions from Firebase.`);
      }

      // 2. Clear bookings collection
      const bkSnapshot = await db.collection("bookings").get();
      const bkBatch = db.batch();
      let bkCount = 0;
      bkSnapshot.forEach(doc => {
        bkBatch.delete(doc.ref);
        bkCount++;
      });
      if (bkCount > 0) {
        await bkBatch.commit();
        console.log(`🧹 Cleared ${bkCount} bookings from Firebase.`);
      }

      // 3. Clear and re-seed items collection
      const itSnapshot = await db.collection("items").get();
      const itBatch = db.batch();
      itSnapshot.forEach(doc => {
        itBatch.delete(doc.ref);
      });
      await itBatch.commit();
      
      const seedBatch = db.batch();
      DEMO_DATA.forEach(item => {
        const docRef = db.collection("items").doc(item.code);
        seedBatch.set(docRef, item);
      });
      await seedBatch.commit();
      
      localStorage.setItem("firebase_cleared_v1.8.0", "true");
      console.log("🧹 Firebase Firestore cleanup completed successfully.");
    } catch (err) {
      console.error("🧹 Firebase Firestore cleanup failed:", err);
    }
  }
  
  // Load data
  await loadAllItems();
  
  // Load borrowing transactions
  await loadAllTransactions();

  // Load room bookings
  await loadAllBookings();
  
  // Set up event listeners
  setupNavigation();
  setupFormHandlers();
  setupFilterHandlers();
  setupImportModal();
  setupDashboardCards();
  
  // Set up borrow form handlers
  setupBorrowForm();

  // Set up room booking form handlers
  setupBookingForm();
  
  // Set up login system (disabled - unified admin role)
  setupCsvExport();
  setupPrintReport();
  setupBarcodeScanner();
  setupCameraScanner();
  setupLoginHandlers();
  setupAccessDeniedModal();
  setupRepairModalHandlers();
  updateLoginUI();
  
  // Initialize Lucide icons initially
  lucide.createIcons();
});

// Check if Backend server is active
async function checkBackendStatus() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    
    const response = await fetch(`${API_BASE}/items`, { 
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' }
    });
    clearTimeout(timeoutId);
    
    if (response.ok) {
      isBackendOnline = true;
      console.log("⚡ Connected to Laboratory Backend Server (localhost:3000)");
      showToast("เชื่อมต่อระบบหลังบ้าน (Database Server) เรียบร้อยแล้ว!", "info");
    }
  } catch (err) {
    isBackendOnline = false;
    console.log("⚡ Backend offline. Operating in LocalStorage Fallback Mode.");
  }
}

// Load all items from either Firebase, Server API, or LocalStorage fallback
async function loadAllItems() {
  if (isFirebaseOnline) {
    try {
      const snapshot = await db.collection("items").get();
      const loadedItems = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d && d.code) {
          loadedItems.push(d);
        }
      });
      if (loadedItems.length > 0) {
        items = loadedItems;
        
        // Smart merge default items if missing
        let updated = false;
        const batch = db.batch();
        DEMO_DATA.forEach(demoItem => {
          if (!items.some(it => it.code === demoItem.code)) {
            items.push(demoItem);
            const docRef = db.collection("items").doc(demoItem.code);
            batch.set(docRef, demoItem);
            updated = true;
          }
        });
        if (updated) {
          await batch.commit();
          console.log("🔥 Seeded missing DEMO_DATA items to Firebase Firestore.");
        }
        
        console.log("🔥 Loaded " + items.length + " items from Firebase Cloud Firestore.");
        return;
      } else {
        // Seed Firestore if empty
        console.log("🔥 Firestore collection is empty. Seeding with DEMO_DATA...");
        const batch = db.batch();
        DEMO_DATA.forEach(item => {
          const docRef = db.collection("items").doc(item.code);
          batch.set(docRef, item);
        });
        await batch.commit();
        items = [...DEMO_DATA];
        return;
      }
    } catch (err) {
      console.error("🔥 Failed to load from Firebase Firestore:", err);
      // Self-healing fallback: disable Firebase for this session and alert user
      isFirebaseOnline = false;
      showToast("ระบบสลับการจัดเก็บมาเป็นแบบ Local Storage สำรอง เนื่องจากยังไม่ได้ตั้งค่าสิทธิ์อ่าน/เขียนในคลาวด์ Firebase", "warning");
    }
  }

  if (isBackendOnline) {
    try {
      const response = await fetch(`${API_BASE}/items`);
      if (response.ok) {
        items = await response.json();
        return;
      }
    } catch (err) {
      console.error("Failed to load from backend:", err);
    }
  }
  
  // LocalStorage Fallback
  const localData = localStorage.getItem("lab_items");
  if (localData) {
    items = JSON.parse(localData);
    
    // Smart merge default items if missing
    let updated = false;
    DEMO_DATA.forEach(demoItem => {
      if (!items.some(it => it.code === demoItem.code)) {
        items.push(demoItem);
        updated = true;
      }
    });
    if (updated) {
      saveItemsToLocal();
    }
  } else {
    items = [...DEMO_DATA];
    saveItemsToLocal();
  }
}

// Helper to save data strictly to local storage
function saveItemsToLocal() {
  localStorage.setItem("lab_items", JSON.stringify(items));
}


// Show Toast message
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  
  let iconName = "check-circle";
  if (type === "error") iconName = "x-circle";
  if (type === "warning") iconName = "alert-circle";
  if (type === "info") iconName = "info";

  toast.innerHTML = `
    <i data-lucide="${iconName}"></i>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  lucide.createIcons();

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.style.animation = "fadeInModal 0.3s reverse forwards";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ==========================================================================
// NAVIGATION (SPA ROUTING & PANEL SWITCHING)
// ==========================================================================
function setupNavigation() {
  const sidebarLinks = document.querySelectorAll(".menu-item-link");
  const panels = document.querySelectorAll(".panel");
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");

  sidebarLinks.forEach(link => {
    // Skip if it's the Import or Login link which opens modal instead of navigating
    if (link.id === "btnSidebarImport" || link.id === "btnSidebarLogin") return;

    link.addEventListener("click", (e) => {
      e.preventDefault();
      
      const targetPanelId = link.getAttribute("data-target");

      // Authorization check for sidebar navigation
      if (targetPanelId === "add-item" && !isAdminLoggedIn) {
        showToast("กรุณาเข้าสู่ระบบหลังบ้านเพื่อเพิ่มหรือแก้ไขข้อมูลสารเคมี/อุปกรณ์", "error");
        document.getElementById("loginModal").classList.add("active");
        lucide.createIcons();
        return;
      }
      
      // Update Active Navigation Item class
      sidebarLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      
      // Show Target Panel and Hide others
      panels.forEach(panel => {
        if (panel.id === `panel-${targetPanelId}`) {
          panel.classList.add("active");
        } else {
          panel.classList.remove("active");
        }
      });

      // On Mobile: Close sidebar after navigating
      if (window.innerWidth <= 1024) {
        sidebar.classList.remove("active");
      }

      // Reset page back to 1 when changing panels
      currentPage = 1;
      updateUI();

      // Auto-focus search input if navigating to all-items
      if (targetPanelId === "all-items") {
        const filterSearch = document.getElementById("filterSearch");
        if (filterSearch) {
          setTimeout(() => filterSearch.focus(), 50);
        }
      }
    });
  });

  // Mobile Hamburger Toggle
  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("active");
    });

    // Close sidebar clicking outside on mobile
    document.addEventListener("click", (e) => {
      if (window.innerWidth <= 1024 && 
          !sidebar.contains(e.target) && 
          !menuToggle.contains(e.target) && 
          sidebar.classList.contains("active")) {
        sidebar.classList.remove("active");
      }
    });
  }

  // Dashboard Stat Card click navigation shortcuts
  document.getElementById("statCardTotal").addEventListener("click", () => navigateToPanel("all-items", "all", "all"));
  document.getElementById("statCardExpired").addEventListener("click", () => navigateToPanel("all-items", "all", "expired"));
  document.getElementById("statCardLowStock").addEventListener("click", () => navigateToPanel("all-items", "all", "low-stock"));
  document.getElementById("statCardNearExpiry").addEventListener("click", () => navigateToPanel("all-items", "all", "near-expiry"));

  // Dashboard Quick buttons
  document.getElementById("quickBtnBorrowReturn").addEventListener("click", () => {
    navigateToPanel("borrow-return");
  });
  
  document.getElementById("quickBtnLabBooking").addEventListener("click", () => {
    navigateToPanel("lab-booking");
  });

  // Sidebar Import Button triggers modal
  document.getElementById("btnSidebarImport").addEventListener("click", (e) => {
    e.preventDefault();
    if (isAdminLoggedIn) {
      document.getElementById("importModal").classList.add("active");
    } else {
      document.getElementById("loginModal").classList.add("active");
      setTimeout(() => {
        const usernameInput = document.getElementById("loginUsername");
        if (usernameInput) usernameInput.focus();
      }, 100);
      lucide.createIcons();
    }
  });

  // "ดูทั้งหมด ->" Link on Dashboard
  document.getElementById("linkViewAll").addEventListener("click", (e) => {
    e.preventDefault();
    navigateToPanel("all-items");
  });
}

// Function to programmatically switch panels
function navigateToPanel(panelId, catFilter = "all", statusFilter = "all") {
  // Authorization check for admin page
  if (panelId === "add-item" && !isAdminLoggedIn) {
    document.getElementById("accessDeniedModal").classList.add("active");
    lucide.createIcons();
    return;
  }

  const panels = document.querySelectorAll(".panel");
  const sidebarLinks = document.querySelectorAll(".menu-item-link");
  
  // Update sidebar active link
  sidebarLinks.forEach(link => {
    if (link.getAttribute("data-target") === panelId) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Show panel
  panels.forEach(panel => {
    if (panel.id === `panel-${panelId}`) {
      panel.classList.add("active");
    } else {
      panel.classList.remove("active");
    }
  });

  // Set filters if navigating to All Items
  if (panelId === "all-items") {
    document.getElementById("filterCategory").value = catFilter;
    document.getElementById("filterStatus").value = statusFilter;
    const filterSearch = document.getElementById("filterSearch");
    if (filterSearch) {
      setTimeout(() => filterSearch.focus(), 50);
    }
  }

  currentPage = 1;
  updateUI();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================================================
// ITEM STATUS CALCULATION LOGIC
// ==========================================================================
function getItemStatus(item) {
  // 1. Expired Check
  if (item.expiry) {
    const expDate = new Date(item.expiry);
    // Strip time for clean date comparison
    const expClean = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());
    const todayClean = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
    
    if (expClean < todayClean) {
      return "expired";
    }
  }

  // 2. Near Expiry Check (within 30 days)
  if (item.expiry) {
    const expDate = new Date(item.expiry);
    const expClean = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());
    const todayClean = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
    
    const diffTime = expClean - todayClean;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 0 && diffDays <= 30) {
      return "near-expiry";
    }
  }

  // 3. Low Stock Check
  if (item.minAlert && Number(item.qty) <= Number(item.minAlert)) {
    return "low-stock";
  }

  return "normal";
}

// Get badge markup based on status
function getStatusBadgeMarkup(status) {
  switch (status) {
    case "expired":
      return `<span class="badge badge-red">🔴 หมดอายุ</span>`;
    case "near-expiry":
      return `<span class="badge badge-yellow">🟡 ใกล้หมดอายุ</span>`;
    case "low-stock":
      return `<span class="badge badge-orange">🟠 ใกล้หมดคลัง</span>`;
    case "normal":
    default:
      return `<span class="badge badge-green">🟢 ปกติ</span>`;
  }
}

// Helper: Format Thai Date (dd/mm/yyyy) or "-"
function formatThaiDate(dateStr) {
  if (!dateStr) return "-";
  const parts = dateStr.split("-"); // yyyy-mm-dd
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Helper: Get item display name (Thai only, strip any English in parentheses)
function getItemDisplayName(item) {
  if (!item || !item.name) return "";
  const name = item.name;
  const openParenIdx = name.indexOf('(');
  if (openParenIdx !== -1) {
    return name.substring(0, openParenIdx).trim();
  }
  return name;
}

// Helper: Format item name to display only the Thai part
function formatItemName(name) {
  if (!name) return "-";
  const displayName = getItemDisplayName({ name });
  return `<span class="name-th" style="display: block; font-weight: 600;">${displayName}</span>`;
}

// Helper: Get Thai room name
function getRoomThaiName(room) {
  if (room === "Lab 1") return "ห้องปฏิบัติการเคมี";
  if (room === "Lab 2") return "ห้องปฏิบัติการฟิสิกส์";
  if (room === "Lab 3") return "ห้องปฏิบัติการชีววิทยา";
  return room;
}

// ==========================================================================
// RENDER VIEWS & DYNAMIC TABLES
// ==========================================================================
function updateUI() {
  // Calculate general statistics
  const stats = {
    total: items.length,
    expired: 0,
    lowStock: 0,
    nearExpiry: 0
  };

  items.forEach(item => {
    const status = getItemStatus(item);
    if (status === "expired") stats.expired++;
    if (status === "low-stock") stats.lowStock++;
    if (status === "near-expiry") stats.nearExpiry++;
  });

  // Render Dashboard statistics
  document.getElementById("dashboardValTotal").innerText = stats.total;
  document.getElementById("dashboardValExpired").innerText = stats.expired;
  document.getElementById("dashboardValLowStock").innerText = stats.lowStock;
  document.getElementById("dashboardValNearExpiry").innerText = stats.nearExpiry;

  // Render Sidebar Alert Badge count if there are expired/near expiry/low stock items
  const totalAlerts = stats.expired + stats.nearExpiry + stats.lowStock;
  const sidebarAlertBadge = document.getElementById("alertSidebarCount");
  if (totalAlerts > 0) {
    sidebarAlertBadge.innerText = totalAlerts;
    sidebarAlertBadge.style.display = "inline-flex";
  } else {
    sidebarAlertBadge.style.display = "none";
  }

  // Render Dashboard "Recent Activity" Items List
  renderRecentItems();

  // Render Dashboard Widgets
  renderCategoryBreakdown();
  renderDashboardUrgentAlerts();

  // Render All Items Table with Filters and Pagination
  renderItemsTable();

  // Render Notifications List
  renderNotificationsList(stats);
  
  // Render Borrow/Return panel widgets
  populateBorrowItemDropdown();
  populateBorrowBookingSelect();
  renderTransactionsTable();

  // Render Room Booking widgets
  renderBookingSlots();
  renderBookingsTable();
  populateBookingPrepList();

  // Render newly added v1.6.0 widgets
  renderDashboardOverdueAlerts();
  renderDashboardDamagedStats();
  renderPendingRequests();
  
  // Trigger Lucide updates for newly rendered icon containers
  lucide.createIcons();
}

// 1. Dashboard: Recent Items List
function renderRecentItems() {
  const container = document.getElementById("recentItemsContainer");
  if (!container) return;

  // Sort items by creation date (descending)
  const sortedItems = [...items].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return dateB - dateA;
  });

  // Select top 4 recent
  const recents = sortedItems.slice(0, 4);

  if (recents.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><i data-lucide="database"></i></div>
        <div class="empty-state-text">ยังไม่มีรายการ</div>
      </div>
    `;
    return;
  }

  let html = `<div style="display: flex; flex-direction: column; gap: 12px; max-height: 350px; overflow-y: auto;">`;
  recents.forEach(item => {
    const status = getItemStatus(item);
    let statusClass = "badge-green";
    if (status === "expired") statusClass = "badge-red";
    if (status === "near-expiry") statusClass = "badge-yellow";
    if (status === "low-stock") statusClass = "badge-orange";

    html += `
      <div class="recent-item-card">
        <div class="recent-item-info">
          <span class="recent-item-name">${getItemDisplayName(item)}</span>
          <div class="recent-item-details">
            <span class="recent-item-code">${item.code}</span>
            <span>${item.category}</span>
          </div>
        </div>
        <div class="recent-item-status-qty">
          <span class="recent-item-qty">${item.qty} ${item.unit}</span>
          ${getStatusBadgeMarkup(status)}
        </div>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}

function renderCategoryBreakdown() {
  const container = document.getElementById("categoryBreakdownContainer");
  if (!container) return;

  const counts = {
    "สารเคมี": 0,
    "เครื่องแก้ว": 0,
    "อุปกรณ์ทั่วไป": 0,
    "อื่นๆ": 0
  };

  items.forEach(item => {
    const cat = item.category || "อื่นๆ";
    if (counts[cat] !== undefined) {
      counts[cat]++;
    } else {
      counts["อื่นๆ"]++;
    }
  });

  const total = items.length || 1;
  const categoriesList = [
    { name: "สารเคมี", count: counts["สารเคมี"], color: "#8b5cf6" },
    { name: "เครื่องแก้ว", count: counts["เครื่องแก้ว"], color: "#3b82f6" },
    { name: "อุปกรณ์ทั่วไป", count: counts["อุปกรณ์ทั่วไป"], color: "#10b981" },
    { name: "อื่นๆ", count: counts["อื่นๆ"], color: "#6b7280" }
  ];

  let html = "";
  categoriesList.forEach(cat => {
    const percentage = Math.round((cat.count / total) * 100);
    html += `
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
          <span style="font-weight: 500; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${cat.color};"></span>
            ${cat.name}
          </span>
          <span style="font-weight: 600; color: var(--text-muted);">${cat.count} รายการ (${percentage}%)</span>
        </div>
        <div style="width: 100%; height: 8px; background-color: rgba(255, 255, 255, 0.08); border-radius: 4px; overflow: hidden; border: 1px solid var(--border-color);">
          <div style="width: ${percentage}%; height: 100%; background-color: ${cat.color}; border-radius: 4px; transition: width 0.8s ease;"></div>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function renderDashboardUrgentAlerts() {
  const container = document.getElementById("dashboardUrgentContainer");
  const countBadge = document.getElementById("dashboardUrgentCount");
  if (!container) return;

  const urgentItems = items.filter(item => {
    const status = getItemStatus(item);
    return status === "expired" || status === "low-stock";
  });

  // Sort: Expired first
  urgentItems.sort((a, b) => {
    const statusA = getItemStatus(a);
    const statusB = getItemStatus(b);
    if (statusA === "expired" && statusB !== "expired") return -1;
    if (statusA !== "expired" && statusB === "expired") return 1;
    return 0;
  });

  if (urgentItems.length === 0) {
    countBadge.style.display = "none";
    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; padding: 16px; background-color: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.15); border-radius: var(--border-radius-md); color: #10b981; font-size: 13px;">
        <i data-lucide="check-circle" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
        <div style="font-weight: 500;">คลังพัสดุเรียบร้อยดี! ไม่มีรายการหมดอายุหรือใกล้หมดสต็อกในขณะนี้</div>
      </div>
    `;
    return;
  }

  countBadge.innerText = urgentItems.length;
  countBadge.style.display = "inline-flex";

  // Select top 3 urgent alerts
  const displayItems = urgentItems.slice(0, 3);
  let html = `<div style="display: flex; flex-direction: column; gap: 12px; height: 100%;">`;
  displayItems.forEach(item => {
    const status = getItemStatus(item);
    const isExpired = status === "expired";
    const bg = isExpired ? "rgba(239, 68, 68, 0.04)" : "rgba(249, 115, 22, 0.04)";
    const border = isExpired ? "rgba(239, 68, 68, 0.15)" : "rgba(249, 115, 22, 0.15)";
    const textColor = isExpired ? "#ef4444" : "#f97316";
    const alertLabel = isExpired ? "🚨 หมดอายุแล้ว" : "⚠️ ใกล้หมดสต็อก";
    const descText = isExpired 
      ? `หมดอายุเมื่อ: ${formatThaiDate(item.expiry)}`
      : `คงเหลือต่ำกว่าจุดสั่งซื้อขั้นต่ำ (คงเหลือ: ${item.qty} ${item.unit} / สั่งซื้อขั้นต่ำ: ${item.minAlert} ${item.unit})`;

    // Find original index in global list
    const originalIndex = items.findIndex(i => i.code === item.code);

    html += `
      <div style="display: flex; gap: 12px; padding: 16px; background-color: ${bg}; border: 1px solid ${border}; border-radius: var(--border-radius-md); transition: var(--transition-fast); flex: 1; align-items: center;">
        <div style="display: flex; flex-direction: column; gap: 4px; flex: 1; justify-content: center;">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span style="font-size: 11px; font-weight: 700; color: ${textColor}; background: ${isExpired ? 'rgba(239, 68, 68, 0.1)' : 'rgba(249, 115, 22, 0.1)'}; padding: 2px 6px; border-radius: 4px;">${alertLabel}</span>
            <span style="font-size: 13px; font-weight: 600; color: #0f172a;">${getItemDisplayName(item)}</span>
          </div>
          <div style="font-size: 11px; color: var(--text-muted); padding-left: 4px; line-height: 1.3;">
            ${descText}
          </div>
        </div>
        ${isAdminLoggedIn ? `
        <button class="action-icon-btn edit" onclick="editItem(${originalIndex})" title="แก้ไข/สั่งซื้อเพิ่ม" style="align-self: center; background: #fff; border: 1px solid var(--border-color); color: var(--primary); width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border-radius: var(--border-radius-sm);">
          <i data-lucide="edit-3" style="width: 14px; height: 14px;"></i>
        </button>
        ` : ""}
      </div>
    `;
  });

  if (urgentItems.length > 3) {
    html += `
      <a href="#" onclick="navigateToPanel('all-items')" style="font-size: 12px; color: var(--primary); text-align: center; font-weight: 600; display: block; margin-top: 4px;">
        ดูรายการแจ้งเตือนด่วนอีก ${urgentItems.length - 3} รายการ...
      </a>
    `;
  }
  html += `</div>`;
  container.innerHTML = html;
}

// 2. All Items Panel: Filters, Search, Table Rendering and Pagination
function renderItemsTable() {
  const tableBody = document.getElementById("itemsTableBody");
  if (!tableBody) return;

  const thActions = document.getElementById("thActions");
  if (thActions) {
    thActions.style.display = isAdminLoggedIn ? "" : "none";
  }

  const filterSearch = document.getElementById("filterSearch").value.toLowerCase().trim();
  const filterCategory = document.getElementById("filterCategory").value;
  const filterStatus = document.getElementById("filterStatus").value;

  // Filter the items list
  let filtered = items.filter(item => {
    // 1. Search Query
    const itemCode = item.code || "";
    const itemName = item.name || "";
    const itemCategory = item.category || "";
    const itemRoom = item.room || "";

    const matchesSearch = !filterSearch || 
      itemCode.toLowerCase().includes(filterSearch) || 
      itemName.toLowerCase().includes(filterSearch) || 
      itemCategory.toLowerCase().includes(filterSearch) ||
      itemRoom.toLowerCase().includes(filterSearch);

    // 2. Category Filter
    const matchesCategory = filterCategory === "all" || itemCategory === filterCategory;

    // 3. Status Filter
    const status = getItemStatus(item);
    const matchesStatus = filterStatus === "all" || status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort filtered items by creation date (newest first)
  filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  // Render Table Count header
  document.getElementById("tableTotalCount").innerText = filtered.length;
  
  if (filterSearch || filterCategory !== "all" || filterStatus !== "all") {
    document.getElementById("tableFilteredInfo").innerText = `(กรองข้อมูลจากทั้งหมด ${items.length} รายการ)`;
  } else {
    document.getElementById("tableFilteredInfo").innerText = "";
  }

  // Handle empty state after filter
  if (filtered.length === 0) {
    const colSpanVal = isAdminLoggedIn ? 6 : 5;
    tableBody.innerHTML = `
      <tr>
        <td colspan="${colSpanVal}" style="text-align: center; padding: 48px;">
          <div class="empty-state">
            <div class="empty-state-icon"><i data-lucide="package-search"></i></div>
            <div class="empty-state-text">ไม่พบรายการสินค้าที่ตรงกับเงื่อนไข</div>
          </div>
        </td>
      </tr>
    `;
    // Disable pagination buttons
    document.getElementById("btnPrevPage").disabled = true;
    document.getElementById("btnNextPage").disabled = true;
    document.getElementById("paginationInfo").innerText = `แสดงรายการที่ 0-0 จาก 0 รายการ`;
    return;
  }

  // Pagination Logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filtered.length);
  const paginatedItems = filtered.slice(startIndex, endIndex);

  // Update pagination texts
  document.getElementById("paginationInfo").innerText = `แสดงรายการที่ ${startIndex + 1}-${endIndex} จาก ${filtered.length} รายการ`;
  document.getElementById("btnPrevPage").disabled = currentPage === 1;
  document.getElementById("btnNextPage").disabled = currentPage === totalPages;

  // Render rows
  let rowsHtml = "";
  paginatedItems.forEach(item => {
    // Find index of this item in the global array
    const originalIndex = items.findIndex(i => i.code === item.code);
    
    // Construct location text
    const locationParts = [];
    if (item.room) locationParts.push(item.room);
    if (item.cabinet) locationParts.push(item.cabinet);
    if (item.shelf) locationParts.push(item.shelf);
    const locationText = locationParts.join(" > ") || "-";

    const status = getItemStatus(item);

    let ghsBadges = "";
    if (item.ghs && item.ghs.length > 0) {
      const ghsUrls = {
        explosive: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgo8c3ZnCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgdmVyc2lvbj0iMS4wIgogICB3aWR0aD0iNTc5cHQiCiAgIGhlaWdodD0iNTc5cHQiCiAgIHZpZXdCb3g9IjAgMCA1NzkgNTc5Ij4KICA8cGF0aAogICAgIGQ9Ik0gMjUuMzAxMTY1LDI4OS42NzE3MiAyODkuMzI5ODcsNTUzLjcwMDQ0IDU1My40MDI2MSwyODkuNjI3NyBDIDQ2NS4zNTAyMiwyMDEuNjc1NyAzNzcuNDcxODIsMTEzLjU0OTQyIDI4OS4zNzM5LDI1LjY0MzAyNCBMIDI1LjMwMTE2NSwyODkuNjcxNzIgeiIKICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO3N0cm9rZTpub25lIiAvPgogIDxwYXRoCiAgICAgZD0iTSAxNDcuNjU5NDEsMTQ4LjAxMjMzIDYsMjg5LjY3MTczIDE0Ny42Njg4Niw0MzEuMzQwNTkgMjg5LjMyODI3LDU3MyA0MzEuMDE2MDIsNDMxLjMxMjI0IDU3Mi43MDM3OCwyODkuNjI0NDkgNDMxLjA2MzI3LDE0Ny45ODM5OCBDIDM1My4xNjU3MSw3MC4wODY0MjQgMjg5LjQwMzg2LDYuMzQzNDcgMjg5LjM3NTUxLDYuMzQzNDcgYyAtMC4wMjg0LDAgLTYzLjc5OTY1LDYzLjc1MjQwMyAtMTQxLjcxNjEsMTQxLjY2ODg2IHogTSA0MDguNjIxODksMTcwLjQyNTM1IDUyNy44MjEwMywyODkuNjI0NDkgNDA4LjU2NTIsNDA4Ljg4MDMyIDI4OS4zMTg4Miw1MjguMTI2NyAxNzAuMTI5MTMsNDA4Ljg3MDg3IDUwLjkzOTQ0NCwyODkuNjE1MDQgMTcwLjEzODU4LDE3MC40MTU5MSBDIDIzNS42OTU3NCwxMDQuODU4NzQgMjg5LjM0NzE2LDUxLjIyNjIyIDI4OS4zNzU1MSw1MS4yMjYyMiBjIDAuMDI4MywwIDUzLjY4OTIyLDUzLjY0MTk3IDExOS4yNDYzOCwxMTkuMTk5MTMgeiIKICAgICBzdHlsZT0iZmlsbDojZmYwMDAwO3N0cm9rZTpub25lIiAvPgogIDxwYXRoCiAgICAgZD0ibSAzOTMuNSwxNzEuNTYyNSBjIC0wLjA4NzUsMC4wMTExIC0wLjE0Nzg4LDAuMTA0MDggLTAuMjE4NzUsMC4yODEyNSAtMC4wNTkxLDAuMTc3MTggLTExLjMzNzgyLDMyLjMyNjI2IC0yNS4wNjI1LDcxLjQ2ODc1IC0xMy43MjQ2NywzOS4xNDI0OSAtMjQuOTg0LDcxLjIyMjE5IC0yNS4wMzEyNSw3MS4yODEyNSAtMC4xNDE3NCwwLjE0MTczIC0xLjEzNjgsLTAuMjE3MjggLTEuMTI1LC0wLjQwNjI1IDAuMDExOCwtMC4xMjk5MyAyOS4zMjk3MSwtOTEuMzUzMDkgMjkuNjI1LC05Mi4xNTYyNSAwLjAzNTQsLTAuMDk0NSAtMC44NDE1LC0wLjY4Njk5IC0yLjYyNSwtMS43NSAtMi42NTc1NCwtMS41ODI3MSAtMi45Njg3NSwtMS43NTE0OCAtMi45Njg3NSwtMS41NjI1IDAsMC4xNjUzNiAtMjQuNDIxNSw5NS4zNTkgLTI0LjQ2ODc1LDk1LjQwNjI1IC0wLjAyMzYsMC4wMzU0IC0wLjY4OTIxLC0wLjExOTM0IC0xLjQ2ODc1LC0wLjM0Mzc1IC0xLjg2NjE5LC0wLjUzMTUxIC01LjAzODYsLTEuMTc3NjYgLTcuMDkzNzUsLTEuNDM3NSAtMi4zMDMyLC0wLjI4MzQ4IC03LjU0NjIyLC0wLjI5NTI5IC05LjYyNSwwIC05LjcwODg1LDEuMzU4MjkgLTE3LjU3NTE2LDUuMzc0MzggLTI0LjQzNzUsMTIuNDM3NSAtNC44MTg5OSw0Ljk2MDczIC04LjY1NTk4LDExLjM5NDA4IC0xMC42ODc1LDE3LjkzNzUgLTAuMjQ4MDQsMC43Nzk1NSAtMC40ODQsMS40NTI3NSAtMC41MzEyNSwxLjUgLTAuMDQ3MywwLjA0NzIgLTMuNzc2OTksLTIuNjgwMjkgLTguMzEyNSwtNi4wOTM3NSAtNC41MzU1MywtMy40MTM0NSAtOC4yODg4OCwtNi4xOTE2OSAtOC4zMTI1LC02LjE1NjI1IC0wLjAyMzYsMC4wMjM2IDAuNDMzMDYsMC45NTk4NiAxLDIuMDkzNzUgbCAxLjAzMTI1LDIuMDYyNSA3LjEyNSw0Ljc4MTI1IGMgNi44ODU5Niw0LjYxODIgNy4wOTAzLDQuNzg2NjUgNy4wMzEyNSw1LjA5Mzc1IC0wLjA1OTEsMC4yOTUyOCAwLjE3MTk2LDAuNTgwOTEgMi4xNTYyNSwyLjcxODc1IDEuMjE2NTYsMS4zMjI4NiAyLjU1NTM2LDIuNzUwNDcgMi45Njg3NSwzLjE4NzUgbCAwLjc4MTI1LDAuNzgxMjUgMi4wOTM3NSwtMC4xMjUgMi4wOTM3NSwtMC4xMjUgMy45Mzc1LDIuNjI1IGMgMi4xNjE0NiwxLjQyOTE2IDMuNzk0NTQsMi40Nzc4NiAzLjU5Mzc1LDIuMzEyNSAtMC4xODg5OSwtMC4xNjUzNSAtMS43NTYxMiwtMS4zNjg4MyAtMy40Njg3NSwtMi42NTYyNSAtMS43MDA4MiwtMS4yNzU2MSAtMy4wMjAxNywtMi4zMzE5NCAtMi45Mzc1LC0yLjM0Mzc1IDAuMDgyNywtMC4wMTE4IDIuODE0NCwtMC4xNjY1OSA2LjA2MjUsLTAuMzQzNzUgbCA1LjkwNjI1LC0wLjMxMjUgOC41LDQuMjgxMjUgYyA0LjcwMDg5LDIuMzM4NjMgOC41ODk1Niw0LjI1IDguNjI1LDQuMjUgMC4wMzU0LDAgMi4xNzA5NiwtMi41NDU3IDQuNzgxMjUsLTUuNjg3NSAyLjYxMDI5LC0zLjEyOTk3IDQuODIzNTgsLTUuNzgwNTEgNC45MDYyNSwtNS44NzUgMC4xMjk5MywtMC4xNTM1NSAtMC4yMTIzMywtMS4wNDcxNSAtMi4wMzEyNSwtNS41IC0xLjE5Mjk0LC0yLjkxNzM3IC0yLjE0ODYzLC01LjMyMDEzIC0yLjEyNSwtNS4zNDM3NSAwLjAyMzYsLTAuMDExOCAyLjk5ODk0LDAuMjk3NzMgNi42MjUsMC42ODc1IDMuNjI2MDUsMC4zODk3NyA2LjYwOTAxLDAuNjkxNjkgNi42NTYyNSwwLjY1NjI1IDAuMDM1NCwtMC4wNDcyIDAuNTExNTYsLTEuODUwMzUgMS4wMzEyNSwtNCBsIDAuOTY4NzUsLTMuOTM3NSAyLjkzNzUsLTAuMDMxMiBjIDEuNjE4MTUsLTAuMDExOCAzLjM5LDAuMDE1MyAzLjk2ODc1LDAuMDYyNSBsIDEuMDYyNSwwLjA5MzcgLTEwLjA2MjUsMTEgYyAtNS41NTEyOSw2LjAzNTU1IC0xMC4xODI1NywxMS4xMTU4OSAtMTAuMzEyNSwxMS4yODEyNSAtMC40NDg4MiwwLjUzMTUgMy41NTE3NCwtMy40NzY2OSAxMi45MDYyNSwtMTIuOTM3NSBsIDkuMjE4NzUsLTkuMzQzNzUgMy40Mzc1LC0wLjA2MjUgMy40MDYyNSwtMC4wNjI1IC0wLjU5Mzc1LC0wLjg3NSBjIC0wLjM0MjUzLC0wLjQ4NDI2IC0wLjk4ODY4LC0xLjMzMTY5IC0xLjQzNzUsLTEuODc1IC0wLjQ0ODgyLC0wLjU0MzMxIC0wLjc5MzA2LC0xLjAxNTI1IC0wLjc4MTI1LC0xLjA2MjUgMC4wMjM2LC0wLjA0NzMgMS4zMDgyOSwtMS4zODYwNCAyLjg0Mzc1LC0yLjk2ODc1IGwgMi43ODEyNSwtMi44NDM3NSAwLjMxMjUsMC42NTYyNSBjIDAuMTY1MzUsMC4zNzc5NiAwLjI4MTI1LDAuNzIyMTkgMC4yODEyNSwwLjc4MTI1IDAsMC4xODg5NyAwLjE1NDY5LDAuMTMwMjEgNC44NDM3NSwtMi4wMzEyNSAyLjQyMTMxLC0xLjExMDI2IDQuNDUyNzUsLTEuOTY1MyA0LjUsLTEuOTA2MjUgMC4wNDczLDAuMDQ3MyAwLjQ5MjEzLDEuNTYwMjUgMSwzLjM0Mzc1IDAuNDk2MDgsMS43ODM1IDAuOTUyNzUsMy4yOTY1IDEsMy4zNDM3NSAwLjA4MjcsMC4wOTQ1IDE0LjM2Nzg1LC0xMS40NDE0NCAxNC43ODEyNSwtMTEuOTM3NSAwLjA5NDUsLTAuMTI5OTIgMS44NzA1MiwtMy4zNjA2NSAzLjkzNzUsLTcuMTg3NSAyLjA2Njk2LC0zLjgzODY1IDMuODk3MTUsLTcuMTg1MjkgNC4wNjI1LC03LjQ2ODc1IDAuMTY1MzYsLTAuMjgzNDggMC4yMzg5MiwtMC41MjM2MiAwLjE1NjI1LC0wLjUgLTAuMDcwOSwwLjAyMzYgLTMuMDExNSwyLjQ1NzYxIC02LjUzMTI1LDUuMzc1IGwgLTYuNDA2MjUsNS4yODEyNSAtNC41OTM3NSwwLjEyNSBjIC0yLjUzOTQxLDAuMDU5MSAtNC43OTkyMSwwLjA4NjEgLTUsMC4wNjI1IC0wLjM0MjUyLC0wLjAzNTQgMi4xOTYzMSwtMi42MTkwNSA0Mi45Njg3NSwtNDMuNzgxMjUgMjMuODIzMjksLTI0LjA0NzcxIDQzLjM0Mzc1LC00My43NjUyNiA0My4zNDM3NSwtNDMuODEyNSAwLC0wLjA0NzIgLTEuMTI5OSwtMS4yMDQyIC0yLjUsLTIuNTYyNSAtMi4zMzg2MiwtMi4zMzg2MiAtMi40OTg1MiwtMi40NTA4IC0yLjY4NzUsLTIuMjUgLTAuMTA2MywwLjEwNjMgLTE5LjkyNDUsMjEuNjgxMDkgLTQ0LjAzMTI1LDQ3LjkzNzUgbCAtNDMuODEyNSw0Ny43NSAtMy40Njg3NSwyLjQzNzUgYyAtMS45MDE2MSwxLjMzNDY2IC0zLjUyMjg3LDIuNDkxNjQgLTMuNTkzNzUsMi41NjI1IC0wLjA4MjcsMC4wODI3IDAuMDEsMC4zODU4MSAwLjI4MTI1LDEgMC4zMzA3MSwwLjc3OTU0IDAuMzYwNDksMC45MTY1OSAwLjIxODc1LDEuMDkzNzUgLTAuMTI5OTIsMC4xNjUzNiAtNC42ODg0Niw1LjE5MTkxIC01LjU2MjUsNi4xMjUgLTAuMjEyNiwwLjIyNDQyIC0wLjIyMjQyLDAuMjEwOSAtMS4yNSwtMC43ODEyNSAtMS45OTYxLC0xLjk3MjQ4IC0zLjg4NDMsLTMuNDkxNiAtNi4xODc1LC01LjA2MjUgbCAtMS4xMjUsLTAuNzgxMjUgTCAzNzQuNSwyODIuMTI1IGMgMTcuMTI2MzEsLTI5LjQyMTgxIDIxLjY4MDYxLC0zNy4zMzEyIDIxLjU2MjUsLTM3LjQzNzUgLTAuMDcwOSwtMC4wODI3IC0xLjE5MzE0LC0wLjc4Mjk2IC0yLjQ2ODc1LC0xLjU2MjUgbCAtMi4zNDM3NSwtMS40Mzc1IC0wLjQwNjI1LDAuNzE4NzUgYyAtMC4yMTI2LDAuNDAxNTcgLTkuMDE1MDUsMTcuNzg5OTUgLTE5LjU2MjUsMzguNjI1IC0xMC44NzgxNiwyMS41MjAxIC0xOS4yMTgwMSwzNy44NzUgLTE5LjMxMjUsMzcuODc1IC0wLjExODExLDAgLTAuMTAyODUsLTAuMTQwNzQgMC4wNjI1LC0wLjYyNSAwLjEyOTkyLC0wLjMzMDcxIDExLjY1MjI5LC0zMi40NjQ1NiAyNS42MjUsLTcxLjQwNjI1IDEzLjk4NDUyLC0zOC45NDE2OSAyNS4zOTg2MywtNzAuODM1MzcgMjUuMzc1LC03MC45MDYyNSAtMC4wNDcyLC0wLjEwNjMgLTguNTM5ODQsLTQuMDc1NTIgLTkuNDM3NSwtNC40MDYyNSAtMC4wMzU0LC0wLjAxMTggLTAuMDY0NiwtMC4wMDQgLTAuMDkzNywwIHogbSAtNDMuMDkzNzUsNTQuNTMxMjUgLTEuMjE4NzUsMy4wMzEyNSAtMS4xODc1LDMuMDYyNSAtMi4zMTI1LC0wLjkwNjI1IGMgLTEuMjg3NDMsLTAuNTA3ODkgLTIuMzcwODEsLTAuODkwOTkgLTIuNDA2MjUsLTAuODQzNzUgLTAuMDM1NCwwLjA0NzIgLTAuNTgwOTQsMi42MDQ3NiAtMS4yMTg3NSw1LjY4NzUgLTAuNjI1OTksMy4wODI3NCAtMS4xNTIwNyw1LjcwNjIgLTEuMTg3NSw1LjgxMjUgLTAuMDM1NCwwLjE0MTc0IDAuNDg1MiwwLjQyNjY1IDIuMzc1LDEuMzEyNSAxLjM1ODMsMC42Mzc4IDIuNTAzNDQsMS4yMDI3NSAyLjU2MjUsMS4yNSAwLjA0NzIsMC4wNDcyIDAuNjI3NDQsMi4xMzI4MiAxLjMxMjUsNC42MjUgMC42NzMyNCwyLjQ4MDM2IDEuMjU3NjIsNC41Mzg4OSAxLjI4MTI1LDQuNTYyNSAwLjAyMzYsMC4wMjM2IDAuOTg2OTQsLTEuMzQ5ODYgMi4xNTYyNSwtMy4wNjI1IDIuMjIwNTMsLTMuMjQ4MDkgMi4yMTQ2NywtMy4yMzczIDkuMjE4NzUsLTEwLjg0Mzc1IGwgMC4zNzUsLTAuNDA2MjUgLTIuMDMxMjUsLTYuNTYyNSAtMi4wMzEyNSwtNi41NjI1IC0wLjg3NSwtMC4wNjI1IGMgLTAuNDg0MjYsLTAuMDQ3MiAtMS43NTcxMSwtMC4wODE5IC0yLjg0Mzc1LC0wLjA5MzcgbCAtMS45Njg3NSwwIHogTSA1MTEuNDY4NzUsMjU1LjI1IGMgLTAuMDQ3MiwwIC0wLjEyMDgyLDAuMTM5NTEgLTAuMTU2MjUsMC4yODEyNSAtMC4zNjYxNSwxLjIxNjU1IC00LjEwOTAxLDEyLjc5NjUgLTQuMTU2MjUsMTIuODQzNzUgLTAuMDIzNiwwLjAzNTQgLTIuNTU0MDcsMC4xNzA3NyAtNS42MjUsMC4zMTI1IGwgLTUuNTkzNzUsMC4yNSAtMS41OTM3NSwxLjE4NzUgYyAtMC44NzQwMywwLjY3MzI0IC0xLjYwMTM4LDEuMjM4MiAtMS42MjUsMS4yNSAtMC4wMzU0LDAuMDM1NCAtMS41MjM2Miw5LjU1ODMyIC0xLjUsOS41OTM3NSAwLjA0NzIsMC4wMzU0IDguNzE0NTYsNSA4Ljc1LDUgMC4wMjM2LDAgMS41OTgzOSwtMS42NzU0IDMuNSwtMy43MTg3NSAxLjkxMzQyLC0yLjA0MzM0IDMuNDk1ODEsLTMuNzMwNTYgMy41MzEyNSwtMy43MTg3NSAwLjAzNTQsMCAzLjE2NTUzLDIuMTMyMDkgNi45Njg3NSw0LjcxODc1IGwgNi45MDYyNSw0LjY4NzUgMC4wMzEyLC0xLjcxODc1IGMgMC4wMTE4LC0wLjk0NDkgMC4wMDgsLTQuNzk4OSAtMC4wNjI1LC04LjUzMTI1IGwgLTAuMTI1LC02Ljc4MTI1IC00LjU5Mzc1LC03Ljg0Mzc1IGMgLTIuNTI3NjEsLTQuMjk5MyAtNC42MDksLTcuODEyNSAtNC42NTYyNSwtNy44MTI1IHogbSAtMTE3LjUzMTI1LDQuNzgxMjUgLTAuMjE4NzUsMC4yODEyNSBjIC0wLjExODExLDAuMTUzNTUgLTAuODI2MDMsMS4xNzUxNyAtMS41OTM3NSwyLjI1IGwgLTEuMzc1LDEuOTM3NSAtMC44NzUsNC4zNzUgYyAtMC40NzI0NSwyLjQwOTQ5IC0wLjg3NSw0LjQ5NTA5IC0wLjg3NSw0LjYyNSAwLjAxMTgsMC4xNjUzNiAxLjAwMzE2LDEuMDk5MTMgMy4wOTM3NSwyLjkwNjI1IDEuNzAwODMsMS40NjQ2IDMuMTE2NjIsMi42NTYyNSAzLjE4NzUsMi42NTYyNSAwLjA1OTEsMCAxLjEyNzE5LC0xLjIxMTA5IDIuMzQzNzUsLTIuNjg3NSBsIDIuMjE4NzUsLTIuNzE4NzUgMC41LC0yLjQzNzUgYyAwLjI3MTY2LC0xLjMzNDY4IDAuNTU0MTMsLTIuNzM1MjMgMC42MjUsLTMuMTI1IGwgMC4xMjUsLTAuNzE4NzUgLTEuMzQzNzUsLTMuNjI1IGMgLTAuNzMyMywtMS45ODQyOSAtMS4zNzA4MSwtMy42NDAyNSAtMS40MDYyNSwtMy42ODc1IC0wLjA0NzMsLTAuMDQ3MiAtMC41NDYyNCwwLjQ0ODMyIC0xLjEyNSwxLjA2MjUgbCAtMS4wMzEyNSwxLjEyNSAtMS4xMjUsLTEuMTI1IC0xLjEyNSwtMS4wOTM3NSB6IE0gNDY2LjE1NjI1LDI2Ni41IGMgLTAuMDU5MSwwIC0yNi4wOTg1NSwxOC4zMzIyNCAtNTcuOTA2MjUsNDAuNzUgLTMxLjgwNzcsMjIuNDI5NTYgLTU3LjgzNjEyLDQwLjc4ODg4IC01Ny44MTI1LDQwLjgxMjUgMC4wMTE4LDAuMDIzNiAyNi4wOTQzOCwtMTYuMTE0NzcgNTcuOTM3NSwtMzUuODc1IGwgNTcuODc1LC0zNS45Mzc1IDAsLTQuOTA2MjUgYyAwLC0yLjY4MTE2IC0wLjA0NjUsLTQuODU1NTYgLTAuMDkzNywtNC44NDM3NSB6IE0gNDU0LjcxODc1LDI5OC4zNzUgNDUyLjM3NSwzMDEgNDUwLDMwMy41OTM3NSA0NDguODc1LDMwNi42MjUgYyAtMC42MjU5OSwxLjY2NTM5IC0xLjEzNjgxLDMuMDM4ODggLTEuMTI1LDMuMDYyNSAwLjA0NzIsMC4wNDczIDIwLjY0MDI2LDIuNTE2IDIwLjY4NzUsMi40Njg3NSAwLjAyMzYsLTAuMDExOCAtMy4wNjQxNSwtMy4xMzg0NiAtNi44NDM3NSwtNi45MDYyNSBsIC02Ljg3NSwtNi44NzUgeiBtIDk0Ljk2ODc1LDEuODEyNSBjIC0wLjA1OTEsLTAuMDExOCAtNDUuOTI4NTUsMTEuODQ3MTYgLTEwMS45Mzc1LDI2LjM3NSAtNTYuMDA4OTUsMTQuNTI3ODQgLTEwMS44MzYxMiwyNi40NDUxMiAtMTAxLjgxMjUsMjYuNDY4NzUgMC4wMzU0LDAuMDM1NCAyMDYuNTQyMzMsLTQ2Ljc0MTY0IDIwNi42MjUsLTQ2LjgxMjUgMC4wNzA5LC0wLjA0NzMgLTIuNzgwNTEsLTYuMDA3NjQgLTIuODc1LC02LjAzMTI1IHogbSAtMTIwLDE0IGMgLTAuMDU5MSwwLjAxMTggLTE1LjMyMjk3LDcuMjAwNjMgLTMzLjkzNzUsMTYgLTE4LjYxNDUzLDguNzk5MzkgLTMzLjkzNjc2LDE2LjA1NDE0IC0zNC4wMzEyNSwxNi4xMjUgLTAuMTI5OTMsMC4wOTQ1IC0wLjA4NzYsMC4xMDIxMSAwLjEyNSwwLjAzMTIgMC40MTM0LC0wLjE0MTc0IDY4LjQyNTcsLTI2LjM4MjYzIDY4LjQzNzUsLTI2LjQwNjI1IDAuMDExOCwwIC0wLjA3NywtMS4yOTIzIC0wLjIxODc1LC0yLjg3NSAtMC4xNDE3MiwtMS43MzYyNiAtMC4yOTIzMiwtMi44NzUgLTAuMzc1LC0yLjg3NSB6IG0gMTQ3LjU2MjUsNy4wOTM3NSBjIC0wLjE1MzU0LDAuMDExOCAtNTAuNDgwMTIsOC41NTEyNCAtMTExLjg3NSwxOC45Njg3NSAtNjEuMzgzMDcsMTAuNDA1NzEgLTExMS43NzIxNCwxOC45Mzc1IC0xMTEuOTM3NSwxOC45Mzc1IC0wLjIwMDc5LDAuMDExOCAtMC43MTU1NCwtMC4zNDIwMSAtMS42MjUsLTEuMDYyNSBsIC0xLjM3NSwtMS4wOTM3NSAtMC4wNjI1LDQuNTMxMjUgLTAuMDYyNSw0LjUzMTI1IC0zLjUzMTI1LDIuNDA2MjUgYyAtMS45NDg4NiwxLjMxMTA1IC0zLjYwNDgyLDIuMzYzMTkgLTMuNjg3NSwyLjM3NSAtMC4wODI3LDAgLTEuNTc2MjUsLTAuOTk4IC0zLjMxMjUsLTIuMjUgLTQuNjA2MzksLTMuMzMwNzggLTQuNjc1MDQsLTMuMzE5NyAtMC4yODEyNSwwLjA5MzcgMS42NTM1OCwxLjI4NzQ0IDMuMDc3NzUsMi4zNTkgMy4xMjUsMi40MDYyNSAwLjExODExLDAuMTA2MyAtNS41NTMzOSwzLjkzNDA2IC01LjcxODc1LDMuODc1IC0wLjA4MjcsLTAuMDIzNiAtMTQuMDE5ODYsLTExLjg5ODU2IC0xNy40Njg3NSwtMTQuODc1IGwgLTAuNzgxMjUsLTAuNjg3NSAtNi40Njg3NSw1LjU5Mzc1IGMgLTMuNTU1MTcsMy4wODI3NCAtNi41MTUyNSw1LjYyNSAtNi41NjI1LDUuNjI1IC0wLjA1OTEsMCAtMy43MTk0MSwtMC45NTU2OSAtOC4xMjUsLTIuMTI1IGwgLTgsLTIuMTI1IDIuMjUsMC4wNjI1IGMgMS4yNDAxOCwwLjAzNTQgMy4xMTI2NywwLjA1ODMgNC4xODc1LDAuMDkzNyAxLjg1NDM2LDAuMDQ3MyAtMy40MzA5OSwtMC4zNDg0MSAtOS43NSwtMC43NSAtMS4xNjkzMSwtMC4wODI3IC03LjUwNzI2LC0wLjUxMjMgLTE0LjA2MjUsLTAuOTM3NSBsIC0xMS45Mzc1LC0wLjc4MTI1IC0wLjAzMTIsLTAuMzQzNzUgYyAtMC4wNzA5LC0wLjQwMTU3IC0wLjAyMzEsLTAuMzg1NTkgLTEuMDYyNSwtMC4wMzEyIC0wLjc0NDExLDAuMjQ4MDQgLTAuODUzMDYsMC4yMzU0OSAtMy4xNTYyNSwwLjA5MzcgLTEuMjk5MjQsLTAuMDcwOSAtMi42NDU2NiwtMC4xNTIwOCAtMywtMC4xODc1IGwgLTAuNjU2MjUsLTAuMDkzNyAtMC41NjI1LC0xLjAzMTI1IC0wLjU2MjUsLTEgLTQuMDMxMjUsLTAuMjE4NzUgYyAtMi4yMjA1MSwtMC4xMTgxMSAtNC4zMjU1NCwtMC4xODc1IC00LjY1NjI1LC0wLjE4NzUgbCAtMC41OTM3NSwwIC0wLjUzMTI1LDAuODQzNzUgLTAuNSwwLjg3NSBMIDI0MC4yNSwzNjIuNzUgYyAtMC4zMzA3MywtMC4wMTE4IC0xMi42OTI4OCwtMC44MDA5MSAtMjcuNDY4NzUsLTEuNzgxMjUgLTE0Ljc3NTg4LC0wLjk2ODUzIC0yNy4wNjQ0NiwtMS43NjE4MSAtMjcuMzEyNSwtMS43NSBsIC0wLjQzNzUsMC4wMzEyIDEuMzc1LDEuNDY4NzUgYyAxLjE5Mjk0LDEuMjk5MjQgMS40MTUxLDEuNDk1ODEgMS43ODEyNSwxLjUzMTI1IDAuMjM2MjMsMC4wMjM2IDExLjkyNTE4LDAuNDk1NTYgMjUuOTY4NzUsMS4wNjI1IDE0LjA0MzU4LDAuNTY2OTQgMjUuNTg5NTYsMS4wNTgzMSAyNS42MjUsMS4wOTM3NSAwLjAzNTQsMC4wMzU0IC0wLjUyOTUxLDEuMDI1ODEgLTEuMjUsMi4yMTg3NSAtMC43MDg2OCwxLjE4MTEzIC0xLjI3NzgsMi4yMjIxOSAtMS4yMTg3NSwyLjI4MTI1IDAuMDQ3MiwwLjA0NzIgMS43NjE1NCwxLjI2NTk2IDMuNzgxMjUsMi43MTg3NSBsIDMuNjU2MjUsMi42NTYyNSA0LjAzMTI1LDAuNjU2MjUgYyAyLjIwODcsMC4zNzc5NSA0LjEwNDgxLDAuNjYwNDQgNC4xODc1LDAuNjI1IDAuMDgyNywtMC4wMjM2IDAuNjg5OTUsLTAuOTUyMjUgMS4zNzUsLTIuMDYyNSBsIDEuMjUsLTIuMDMxMjUgMi41NjI1LDAgMi41NjI1LDAgMCwtMC40Mzc1IGMgMCwtMC4yNDgwNCAtMC4wODg4LC0xLjY1Mjc3IC0wLjIxODc1LC0zLjA5Mzc1IC0wLjEyOTkzLC0xLjQ1Mjc5IC0wLjIyMjk0LC0yLjY1MjA3IC0wLjE4NzUsLTIuNjg3NSAwLjA3MDksLTAuMDcwOSAyNS41MDY2NCwwLjkwNTUxIDI2LjE1NjI1LDEgMC4zMDcxLDAuMDQ3MyAwLjM3NSwwLjA4MzkgMC4zNzUsMC4zNDM3NSAwLDAuNDM3MDMgMC42MjEzLDMuMTgyNTQgMS4wOTM3NSw0LjgxMjUgMC40MDE1OCwxLjM3MDEgMC40MDQyOSwxLjM3ODQ1IDAuMTU2MjUsMS40Mzc1IC0wLjEyOTkxLDAuMDIzNiAtMzEuNDI4MTYsMy42MTA0IC02OS41MzEyNSw3Ljk2ODc1IC0zOC4xMDMwOSw0LjM3MDE2IC02OS4yNjk0NCw3Ljk2ODc1IC02OS4yODEyNSw3Ljk2ODc1IC0wLjAzNTQsMC4wMjM2IC0wLjI4NTQ0LDMuMDU4MzMgLTAuMjUsMy4wOTM3NSAwLjAyMzYsMC4wMTE4IDMxLjMxMDA1LC00LjIxMzQ5IDY5LjUzMTI1LC05LjM3NSAzOC4yMjEyLC01LjE2MTUyIDY5LjU4MTIsLTkuMzc1IDY5LjY4NzUsLTkuMzc1IDAuMTI5OTMsMCAwLjI5MTU5LDAuMjUzOTIgMC40Njg3NSwwLjc1IDAuMTUzNTUsMC40MTMzOSAwLjUwMTk2LDEuMjU2NjMgMC43NSwxLjkwNjI1IDAuMjQ4MDQsMC42Mzc4IDAuNDI5ODgsMS4xNzU3IDAuNDA2MjUsMS4xODc1IC0wLjAyMzYsMC4wMTE4IC0yMy40MTY3OCw1LjE5Mjc5IC01MiwxMS41IC0yOC41ODMyMiw2LjMwNzIxIC01Mi4wNTc1OSwxMS41MzQ3IC01Mi4xODc1LDExLjU5Mzc1IC0wLjIwMDgsMC4wODI3IC0wLjMyMjA5LDAuMzg3NTMgLTAuNTkzNzUsMS43ODEyNSAtMC4xODg5NywwLjkyMTI3IC0wLjI4NTQ0LDEuNzE0NTYgLTAuMjUsMS43NSAwLjA1OTEsMC4wNDczIDEwNC43Nzc1NSwtMjUuNzQ4NTMgMTA1LjI1LC0yNS45Mzc1IDAuMDcwOSwtMC4wMjM2IDAuMjk5MjEsMC4zMDUzNSAwLjUsMC43MTg3NSAwLjI1OTg1LDAuNTE5NjkgMC4zMTMyNSwwLjc3NzA2IDAuMjE4NzUsMC44MTI1IC0wLjA4MjcsMC4wMjM2IC03Ljk3MTc2LDIuMTU1NzEgLTE3LjU2MjUsNC43MTg3NSBsIC0xNy40Njg3NSw0LjYyNSAtMC4yMTg3NSwxLjc4MTI1IGMgLTAuMTI5OTIsMC45ODAzMiAtMC4yMzA1NiwxLjgwMDY5IC0wLjIxODc1LDEuODEyNSAwLjAxMTgsMC4wMTE4IDguMTYwNDksLTIuNjUzOTcgMTguMDkzNzUsLTUuOTM3NSAxOC4xMTg0NSwtNS45NzY1IDE4LjIzODE5LC02LjAxNTUxIDE4LjI1LC01LjUzMTI1IDAsMC4wNzA5IC0xMi43MjU4NCw2Ljk5NjY0IC0yOC4yODEyNSwxNS40MDYyNSBsIC0yOC4zMTI1LDE1LjI4MTI1IDAuMDkzNywxLjEyNSBjIDAuMDQ3MiwwLjYxNDE5IDAuMDc3OCwxLjMxNDQ2IDAuMTI1LDEuNTYyNSBsIDAuMDkzNywwLjQzNzUgTCAyNjMuNSwzOTcuOTM3NSBjIDE1LjQ2MDkyLC05LjA5NDY2IDI4LjIwNjIsLTE2LjYwOSAyOC4zMTI1LC0xNi42NTYyNSAwLjE1MzU1LC0wLjA5NDUgMC4zNzY3MSwwLjE5MzEzIDEuMTU2MjUsMS40Njg3NSAwLjg4NTg1LDEuNDY0NTkgMi4wODQxMywzLjE3MTQ5IDMuMzEyNSw0LjcxODc1IDAuNDcyNDUsMC42MTQxOSAwLjUwMTQ5LDAuNzAyMDIgMC4zMTI1LDAuODQzNzUgLTAuMTA2MywwLjA3MDkgLTE0Ljk5ODkyLDExLjk2MTA5IC0zMy4wOTM3NSwyNi40MDYyNSBMIDIzMC42MjUsNDQxIGwgMi4zMTI1LDIuMjgxMjUgYyAxLjI4NzQzLDEuMjUyIDIuNDM2NzYsMi4zMTU5NSAyLjUzMTI1LDIuMzc1IDAuMTQxNzQsMC4wODI3IDQuNTM3ODUsLTMuOTI2NjUgMTkuNjU2MjUsLTE3Ljc4MTI1IDEwLjcyNDYxLC05LjgzODc2IDE5LjUwNzYzLC0xNy44NTU1NSAxOS41MzEyNSwtMTcuODQzNzUgMC4wMjM2LDAuMDIzNiAtMC4xNDI5NiwwLjM3OTY2IC0wLjM0Mzc1LDAuNzgxMjUgLTAuMjAwNzksMC4zODk3OCAtMC4zNDM3NSwwLjc1MzQ1IC0wLjM0Mzc1LDAuODEyNSAwLDAuMDgyNyAzLjI0NDA5LDMuNzUxNyA0LDQuNTMxMjUgMC4yMDA3OSwwLjIwMDc5IDAuMzA2NTYsMC4xNzIwMSAyLjU2MjUsLTAuODQzNzUgbCAyLjM0Mzc1LC0xLjA2MjUgMS4xODc1LDEuMTg3NSAxLjE4NzUsMS4xNTYyNSAyLjM0Mzc1LC0xLjQwNjI1IDIuMzc1LC0xLjQzNzUgMC45MDYyNSwtMy4wMzEyNSBjIDAuNTA3ODksLTEuNjc3MiAwLjg5NDQ0LC0zLjEyNDI2IDAuOTA2MjUsLTMuMjE4NzUgMCwtMC4xMDYzIC0wLjg5MjQ0LC0wLjczOTkgLTIuMTU2MjUsLTEuNTMxMjUgbCAtMi4xMjUsLTEuMzQzNzUgLTMuNDM3NSwtMC4wNjI1IC0zLjQwNjI1LC0wLjA2MjUgOC40MDYyNSwtNy43MTg3NSBjIDQuNjE4MiwtNC4yMjg0MyA4LjQxMzg4LC03LjY4NzUgOC40Mzc1LC03LjY4NzUgMC4wMTE4LDAgMC45NTk4OCwwLjkwOTE4IDIuMDkzNzUsMi4wMzEyNSAxLjEzMzg4LDEuMTIyMDYgMi42MDAzNywyLjQ4MDMxIDMuMjUsMyA3Ljg3ODEsNi4zMDcyMSAxNi44MzA3Niw5LjM2NTQxIDI2LjQ2ODc1LDkuMDkzNzUgNy41NzEsLTAuMjEyNiAxNC4zMDUyNCwtMi4zNTAwNiAyMC43MTg3NSwtNi41MzEyNSAyLjY0NTczLC0xLjcyNDQ0IDQuMzA5MjUsLTMuMDc1MjUgNi43MTg3NSwtNS40Mzc1IGwgMS41LC0xLjQzNzUgMjIuNDY4NzUsMTguMDkzNzUgYyAxMi4zNzgxOSw5Ljk2ODcgMjIuNTA3NjQsMTguMTA1NTYgMjIuNTMxMjUsMTguMDkzNzUgMC4wMTE4LC0wLjAyMzYgLTAuNTc2MDIsLTEuNDI0MTkgLTEuMzQzNzUsLTMuMTI1IGwgLTEuMzc1LC0zLjA5Mzc1IC0yMC44NzUsLTE1LjMxMjUgLTIwLjg3NSwtMTUuMjgxMjUgMC40MDYyNSwtMC41IGMgMC4yMjQ0MiwtMC4yNTk4NCAwLjgyODI0LC0xLjAxODQ0IDEuMzEyNSwtMS42NTYyNSAwLjQ5NjA4LC0wLjYyNTk5IDAuOTUyNzUsLTEuMTM2ODEgMSwtMS4xMjUgMC4wNTkxLDAuMDIzNiAxMi42NTcxOSw5Ljg1NTMzIDI4LDIxLjg0Mzc1IDE1LjM0MjgxLDExLjk4ODQxIDI4LjA4MzksMjEuOTM2MDEgMjguMzQzNzUsMjIuMTI1IGwgMC40Njg3NSwwLjM0Mzc1IDEuMzQzNzUsLTEuMzQzNzUgYyAwLjc0NDExLC0wLjc0NDExIDEuMzU1NTYsLTEuMzkwMjUgMS4zNDM3NSwtMS40Mzc1IC0wLjAyMzYsLTAuMDM1NCAtMTMuMTY3MjYsLTkuNTc3MDQgLTI5LjIxODc1LC0yMS4xODc1IC0xNi4wMzk2OSwtMTEuNjEwNDUgLTI5LjI2ODcsLTIxLjE3NDk1IC0yOS4zNzUsLTIxLjI4MTI1IC0wLjE4ODk3LC0wLjE3NzE3IC0wLjE1MzgsLTAuMjY4OTMgMC41MzEyNSwtMS4zNDM3NSAwLjQ2MDY0LC0wLjcyMDQ5IDAuNzgwNTEsLTEuMTI5MTkgMC44NzUsLTEuMDkzNzUgMC4wODI3LDAuMDM1NCAxMi4wMDc2LDcuMzA1NDUgMjYuNSwxNi4xODc1IDE0LjQ4MDU5LDguODcwMjUgMjYuMzcwODIsMTYuMDg2MTMgMjYuNDA2MjUsMTYuMDYyNSAwLjAyMzYsLTAuMDM1NCAtMC42MDMwNywtMS4zODE4NiAtMS40MDYyNSwtMyBsIC0xLjQ2ODc1LC0yLjkzNzUgLTI0LjgxMjUsLTEzLjYyNSAtMjQuODEyNSwtMTMuNjI1IDAuODQzNzUsLTEuNjU2MjUgYyAwLjQ3MjQ1LC0wLjkwOTQ2IDEuMDU2ODQsLTIuMDY2NDMgMS4yODEyNSwtMi41NjI1IGwgMC40MDYyNSwtMC45MDYyNSAxNS4zNzUsMy45Njg3NSBjIDguNDU2ODYsMi4xODUwOSAxNS4zOTAyNSw0LjAxNTI1IDE1LjQzNzUsNC4wNjI1IDAuMDk0NSwwLjA5NDUgLTEuMDg0NjQsMS43NSAtMS4yNSwxLjc1IC0wLjA1OTEsMCAtMi4xNDg4MywtMC4zOTQ5MyAtNC41OTM3NSwtMC44NDM3NSAtMi40NTY3NCwtMC40NjA2NCAtNC41MzA1MSwtMC44MTI1IC00LjYyNSwtMC44MTI1IC0wLjEyOTkzLDAgLTAuNjQ5NTksMC44Mjc3MiAtMS41LDIuMzc1IGwgLTEuMzEyNSwyLjQwNjI1IDMuMDkzNzUsMi4yODEyNSBjIDEuNzAwODEsMS4yNjM4IDMuODQ4MTYsMi44NDYyIDQuNzgxMjUsMy41MzEyNSBsIDEuNjg3NSwxLjI1IDEyLjU2MjUsMi4xNTYyNSBjIDYuODk3NzYsMS4xODExMyAxMi41NzAxMiwyLjExNzM2IDEyLjU5Mzc1LDIuMDkzNzUgMC4wMzU0LC0wLjAzNTQgMC4yNTY4OSwtMy4yMzM3MiAwLjM3NSwtNS4zMTI1IGwgMC4wMzEyLC0wLjcxODc1IC0yLjA2MjUsLTIuMzc1IC0yLjA2MjUsLTIuMzQzNzUgLTIuNTYyNSwtMS4wOTM3NSBjIC0xLjQxNzM1LC0wLjYwMjM3IC0yLjU0MzA2LC0xLjExMzIgLTIuNTMxMjUsLTEuMTI1IDAuMDExOCwtMC4wMTE4IDguMDQwNDEsMi4wMzQ4OSAxNy44NDM3NSw0LjU2MjUgOS44MDMzNCwyLjUyNzYgMTcuOTA1NTEsNC41OTM3NSAxOCw0LjU5Mzc1IDAuMDgyNywwIDAuMTI1LC0wLjAzNDcgMC4xMjUsLTAuMDkzNyAwLC0wLjA0NzMgMC4zNTYwNCwtMi40NjE4IDAuNzgxMjUsLTUuMzQzNzUgMC40MjUyLC0yLjg4MTk1IDAuNzYxODEsLTUuMjI2MzkgMC43NSwtNS4yNSAtMC4wMjM2LC0wLjAxMTggLTE4LjA3MzQsLTIuNTczNTEgLTQwLjEyNSwtNS42NTYyNSAtMjIuMDM5NzksLTMuMDgyNzQgLTQwLjEwMTM5LC01LjYzMjYzIC00MC4xMjUsLTUuNjU2MjUgLTAuMDIzNiwtMC4wMjM2IDAuMjEyMzUsLTAuODQzOTcgMC41MzEyNSwtMS44MTI1IDAuMzMwNzEsLTAuOTY4NTEgMC41OTM3NSwtMS44MzEyIDAuNTkzNzUsLTEuOTM3NSAwLC0wLjEyOTkyIC0wLjg2MTQyLC0wLjQ3ODA5IC0zLjA5Mzc1LC0xLjI4MTI1IEwgMzYyLjM3NSwzNjguNzUgMzYxLjc1LDM2Ny42NTYyNSBjIC0wLjM0MjUyLC0wLjU3ODc1IC0wLjU5Nzk0LC0xLjA4OTU4IC0wLjU2MjUsLTEuMTI1IDAuMDIzNiwtMC4wMzU0IDE3LjM2NTUsMC43NzcyOSAzOC41MzEyNSwxLjc4MTI1IGwgMzguNDY4NzUsMS44MTI1IDAuMzEyNSwwLjMxMjUgMC4zMTI1LDAuMzQzNzUgNi45Njg3NSwwLjQ2ODc1IDYuOTM3NSwwLjQ2ODc1IDAuNDA2MjUsLTAuNDM3NSAwLjQwNjI1LC0wLjQzNzUgNDkuMTg3NSwyLjM0Mzc1IGMgMjcuMDU5NTcsMS4yNzU2MSA0OS4yMDY5NCwyLjI5MzA2IDQ5LjIxODc1LDIuMjgxMjUgMC4wMjM2LC0wLjAyMzYgLTAuOTA5MTksLTAuNzMxNTQgLTIuMDMxMjUsLTEuNTkzNzUgbCAtMi4wMzEyNSwtMS41OTM3NSAtNDYuMzQzNzUsLTEuNDM3NSBjIC0yNS40ODg2OCwtMC44MTQ5OCAtNDYuNDA1NTEsLTEuNDg4MTkgLTQ2LjUsLTEuNSAtMC4wOTQ1LC0wLjAyMzYgMS4zMDA0LC0xLjcwNDQzIDMuMzQzNzUsLTQuMDMxMjUgMS45MzcwNCwtMi4xOTY4OSAzLjQ5MjM4LC00LjAxOTQ0IDMuNDY4NzUsLTQuMDMxMjUgLTAuMDExOCwtMC4wMjM2IC01LjU4MzUyLC0yLjQ5OTk0IC0xMi4zNzUsLTUuNSAtNi43OTE0NiwtMy4wMDAwNiAtMTIuMzU5LC01LjQ5NTgzIC0xMi40MDYyNSwtNS41MzEyNSAtMC4wNDcyLC0wLjAyMzYgLTEuNTg3MzEsMS4zODg3NSAtMy40MDYyNSwzLjEyNSBsIC0zLjMxMjUsMy4xNTYyNSAtNC42ODc1LDEuNTYyNSBjIC0yLjU2MzA1LDAuODYyMjMgLTQuNjk1MTMsMS41ODk1NiAtNC43MTg3NSwxLjYyNSAtMC4wMzU0LDAuMDIzNiAwLjQyODg4LDEuOTM1IDEuMDMxMjUsNC4yNSAwLjYwMjM3LDIuMzE1MDEgMS4wMzU0NCw0LjI2NTI2IDEsNC4zMTI1IC0wLjA0NzIsMC4wMzU0IC0xMy45NjQ3MiwtMC4zOTQxOSAtMzAuOTM3NSwtMC45Mzc1IC0xNi45NjA5NSwtMC41MzE1MSAtMzAuODkwMjUsLTAuOTQ5MzEgLTMwLjkzNzUsLTAuOTM3NSAtMC4wNDcyLDAgLTAuMzE3OTEsLTAuNDI5NjMgLTAuNjI1LC0wLjkzNzUgLTAuNTMxNTEsLTAuODc0MDQgLTAuNjU0NzEsLTEuMDAzNjUgLTMuODQzNzUsLTMuNTMxMjUgbCAtMy4zMTI1LC0yLjU5Mzc1IDAuNjI1LC0wLjA5MzcgYyAwLjM0MjUzLC0wLjA0NzMgNTAuNzczOTMsLTYuODkxODEgMTEyLjA2MjUsLTE1LjIxODc1IGwgMTExLjQzNzUsLTE1LjEyNSAwLjA2MjUsLTMuODEyNSAwLC0zLjgxMjUgLTAuMjUsMCB6IG0gLTMxNC4zNzUsMTguMzc1IGMgLTAuMDA0LDAuMDI1MyAwLjAxMzUsMC4wNjg5IDAuMDMxMiwwLjEyNSAwLjA0NzIsMC4xMjk5MyAwLjI1NjE0LDAuNzA2NjkgMC40Njg3NSwxLjI1IEwgMjYzLjc4MTI1LDM0MiAyODIuMjUsMzUwLjkwNjI1IGMgMTAuMTQ1ODYsNC44ODk4NiAxOC40NzYzOSw4Ljg1NTU2IDE4LjUsOC44NDM3NSAwLjAxMTgsLTAuMDIzNiAtOC4yMjU2OSwtNC40MzA3NSAtMTguMzEyNSwtOS43ODEyNSAtMTAuMDc0OTksLTUuMzUwNSAtMTguNjE0NDEsLTkuODczNTEgLTE4Ljk2ODc1LC0xMC4wNjI1IC0wLjQzNDA2LC0wLjI0ODAzIC0wLjU4MzIzLC0wLjMyNTg1IC0wLjU5Mzc1LC0wLjI1IHogbSAtMTYuMjE4NzUsMTAuODEyNSBjIC0wLjAzNTQsMCAtMC44MjQ1NCwwLjY3MzIxIC0xLjc4MTI1LDEuNSAtMC45NTY3MSwwLjgyNjc5IC0xLjcwMzQ5LDEuNTI3MDYgLTEuNjU2MjUsMS41NjI1IDAuMTE4MTEsMC4wOTQ1IDU1LjA1NDEyLDguNjY0NjIgNTUuMTI1LDguNTkzNzUgMC4wNDcyLC0wLjAzNTQgLTUxLjQ4NjcxLC0xMS42NjgwNiAtNTEuNjg3NSwtMTEuNjU2MjUgeiBtIDUyLjA2MjUsMTEuNjg3NSBjIC0wLjEyOTkxLC0wLjAxMTggLTAuMjAzNSwwLjAyNzEgLTAuMTU2MjUsMC4wNjI1IDAuMDM1NCwwLjAzNTQgMC4xMzYwOCwwLjAzNTQgMC4yMTg3NSwwIDAuMDk0NSwtMC4wMzU0IDAuMDY3NCwtMC4wNjI1IC0wLjA2MjUsLTAuMDYyNSB6IG0gLTQ1LjY4NzUsMi42ODc1IDAuODEyNSwwLjA2MjUgYyAwLjQzNzAzLDAuMDQ3MiAwLjk2NzI2LDAuMDgxOSAxLjE1NjI1LDAuMDkzNyAwLjI5NTI3LDAgMC4yNTg2MSwwLjA1NjggLTAuMzQzNzUsMC4yODEyNSAtMS4yMjgzNywwLjQ3MjQ1IC0xLjE3MDAzLDAuNDcyNDUgLTEuNDA2MjUsMCBsIC0wLjIxODc1LC0wLjQzNzUgeiBtIDE4MS42MjUsMS41NjI1IGMgMC4wNzA5LDAgMC42MzU4MSwwLjUyNjA2IDEuMjUsMS4xODc1IEwgNDM3LDM2OC44MTI1IGwgLTIsLTAuMDkzNyBjIC0xLjExMDI2LC0wLjA0NzIgLTMuMjg0NjcsLTAuMTA5MDEgLTQuODQzNzUsLTAuMTU2MjUgLTEuNTU5MDksLTAuMDM1NCAtMi43NTA3NCwtMC4xMjA4MSAtMi42NTYyNSwtMC4xNTYyNSAwLjMwNzA5LC0wLjEwNjMgNy4wMzgxNCwtMS45ODgxOSA3LjE1NjI1LC0yIHogbSAtMTM2LjMxMjUsMC4yNSBjIC0wLjAyODEsMC4wMTE4IC0wLjAyMzYsMC4wNDQ4IDAsMC4wNjI1IDAuMDM1NCwwLjAzNTQgMC4xMzYwOCwwLjAzNTQgMC4yMTg3NSwwIDAuMDk0NSwtMC4wMzU0IDAuMDM2MiwtMC4wNjI1IC0wLjA5MzcsLTAuMDYyNSAtMC4wNjUsLTAuMDA2IC0wLjA5NjksLTAuMDExOCAtMC4xMjUsMCB6IG0gLTkwLjAzMTI1LDMuNTYyNSBjIC0wLjA0NzIsLTAuMDExOCAtMS43MDMyMSwxLjE5OTI5IC0zLjY4NzUsMi42ODc1IEwgMjAxLjAzMTI1LDM3NS41NjI1IDIwMSwzNzcgYyAtMC4wMzU0LDEuNDA1NTQgLTAuMDQxMSwxLjQ1Mjc1IDAuMjE4NzUsMS41IDAuNDM3MDEsMC4wOTQ1IDE5LjcwOTY0LDEuODQ3OTQgMTkuODc1LDEuODEyNSAwLjExODExLC0wLjAzNTQgLTEyLjU0NTAzLC0xMC4wMzQ3IC0xMi43ODEyNSwtMTAuMDkzNzUgeiBNIDIzMi4yODEyNSwzOTMuMjUgYyAwLDAuMTA2MyA3LjIyNTY0LDcuMDYyNSA3LjM0Mzc1LDcuMDYyNSAwLjA3MDksMCAxLjI3NDM0LC0wLjQ3NjEzIDIuNjU2MjUsLTEuMDMxMjUgbCAyLjUsLTEgMCwtMi4xODc1IDAsLTIuMTg3NSAtMC4zMTI1LDAgYyAtMC40MTM0LDAgLTEwLjUzNTY2LC0wLjU1NDEyIC0xMS40Njg3NSwtMC42MjUgLTAuNDEzNCwtMC4wMzU0IC0wLjcxODc1LC0wLjA1NDkgLTAuNzE4NzUsLTAuMDMxMiB6IE0gMjA1Ljc1LDQxMS42MjUgYyAtMC4wMzU0LDAgLTAuMTAxMzksMC4wODU0IC0wLjEyNSwwLjE1NjI1IC0wLjAzNTQsMC4wODI3IC0wLjU5NjIsMS45NzQ2MSAtMS4yODEyNSw0LjIxODc1IGwgLTEuMjUsNC4wOTM3NSAwLjM3NSwwLjUzMTI1IGMgMi4wNDMzNSwyLjg0NjUxIDcuMTE2NjQsOS43NTc2MyA3LjE4NzUsOS43ODEyNSAwLjA0NzIsMC4wMTE4IDAuMjgzMjEsLTAuNTUzMTQgMC41MzEyNSwtMS4yNSAwLjI0ODA0LC0wLjcwODY3IDAuNzY2NDcsLTIuMTYzMzYgMS4xNTYyNSwtMy4yNSBsIDAuNjg3NSwtMS45Njg3NSAwLjQzNzUsLTAuMDYyNSBjIDAuMjQ4MDQsLTAuMDM1NCAxLjI1Nzg2LC0wLjEwOTAxIDIuMjUsLTAuMTU2MjUgbCAxLjc4MTI1LC0wLjA2MjUgMS40MDYyNSwtMS41MzEyNSAxLjQwNjI1LC0xLjUgMC43NSwtMi4yODEyNSBjIDAuNDAxNTksLTEuMjQwMTggMC42Nzk4NywtMi4yNTc2MiAwLjY1NjI1LC0yLjI4MTI1IC0wLjA3MDksLTAuMDcwOSAtNi42NTEzMywtMi41MzEyNSAtNi43ODEyNSwtMi41MzEyNSAtMC4wNzA5LDAgLTAuNTUwNDMsMC41NDU1IC0xLjA5Mzc1LDEuMjE4NzUgLTAuNTQzMzEsMC42ODUwNSAtMS4wNzM1NywxLjIxMTEzIC0xLjE1NjI1LDEuMTg3NSAtMC4wNzA5LC0wLjAyMzYgLTEuNjQ1NjMsLTAuOTg2OTQgLTMuNSwtMi4xNTYyNSAtMS44NTQzNiwtMS4xODExMiAtMy40MDIwOCwtMi4xNTYyNSAtMy40Mzc1LC0yLjE1NjI1IHoiCiAgICAgdHJhbnNmb3JtPSJzY2FsZSgwLjgsMC44KSIKICAgICBzdHlsZT0iZmlsbDojMDAwMDAwO3N0cm9rZTpub25lIiAvPgo8L3N2Zz4K",
        flammable: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMCIgdmlld0JveD0iMCAwIDU3OSA1NzkiPjxwYXRoIGQ9Im0yNSAyOTAgMjY0IDI2NCAyNjQtMjY0TDI4OSAyNiAyNSAyOTB6IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTE0OCAxNDggNiAyOTBsMTQyIDE0MSAxNDEgMTQyIDE0Mi0xNDIgMTQyLTE0MS0xNDItMTQyTDI4OSA2IDE0OCAxNDh6bTI2MSAyMiAxMTkgMTIwLTExOSAxMTktMTIwIDExOS0xMTktMTE5TDUxIDI5MGwxMTktMTIwTDI4OSA1MWwxMjAgMTE5eiIgZmlsbD0icmVkIi8+PHBhdGggZD0iTTI5MCAxMjFjLTE4IDM0IDMgNTMtMjAgMTAyLTEzLTEwLTYtNDctMzAtNDggMyAxMiAxIDE2IDAgMjAtMyAxNy04IDMxIDMgNTItMTctOC0xOC0yMy0zMi0zMyAzIDE2LTQgNDkgMTUgODEtMTctMi0yMy04LTQxLTI2IDE5IDEwMCAzNCAxMDMgMTA1IDEwOS02LTEtNDItNy01NS00OCAwLTEwLTEgOSAzNCAxMC0yMi0zNS0xNi0yOC0xNC00OCAxMCAxMyAyIDE1IDI3IDI1LTgtMjYgMTMtNDMgOC03MyA2IDEzIDI2IDExIDI1IDczIDE3LTE5IDE4LTYgMjYtMjYgMSAxMSA2IDI1LTE3IDQ5IDYgMiAxNiAzIDMxLTgtMTUgMTgtMSAxOC00MCA0NiA0OSAxIDgxLTMwIDgwLTk3LTIgNi0zIDE4LTI5IDIxIDE2LTE2IDI1LTQ5IDEyLTc1LTUgNC0xMiAyNC0yOSAyOSA4LTE0IDYtMzIgNi0zMnMzLTI1LTEyLTQ1Yy00IDMwLTQgNDYtMjMgNTAgMy0xNyA0LTI2LTYtNDYtMTAtMjEtMjItNDItMjQtNjJ6bS04MSAyNzR2MThoMTcxdi0xOEgyMDl6Ii8+PC9zdmc+",
        oxidizing: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgo8c3ZnCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgdmVyc2lvbj0iMS4wIgogICB3aWR0aD0iNTc5cHQiCiAgIGhlaWdodD0iNTc5cHQiCiAgIHZpZXdCb3g9IjAgMCA1NzkgNTc5Ij4KICA8cGF0aAogICAgIGQ9Ik0gMjUuMzAxMTY1LDI4OS42NzE3MiAyODkuMzI5ODcsNTUzLjcwMDQ0IDU1My40MDI2MSwyODkuNjI3NyBDIDQ2NS4zNTAyMiwyMDEuNjc1NyAzNzcuNDcxODIsMTEzLjU0OTQyIDI4OS4zNzM5LDI1LjY0MzAyNCBMIDI1LjMwMTE2NSwyODkuNjcxNzIgeiIKICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO3N0cm9rZTpub25lIiAvPgogIDxwYXRoCiAgICAgZD0iTSAxNDcuNjU5NDEsMTQ4LjAxMjMzIDYsMjg5LjY3MTczIDE0Ny42Njg4Niw0MzEuMzQwNTkgMjg5LjMyODI3LDU3MyA0MzEuMDE2MDIsNDMxLjMxMjI0IDU3Mi43MDM3OCwyODkuNjI0NDkgNDMxLjA2MzI3LDE0Ny45ODM5OCBDIDM1My4xNjU3MSw3MC4wODY0MjQgMjg5LjQwMzg2LDYuMzQzNDcgMjg5LjM3NTUxLDYuMzQzNDcgYyAtMC4wMjg0LDAgLTYzLjc5OTY1LDYzLjc1MjQwMyAtMTQxLjcxNjEsMTQxLjY2ODg2IHogTSA0MDguNjIxODksMTcwLjQyNTM1IDUyNy44MjEwMywyODkuNjI0NDkgNDA4LjU2NTIsNDA4Ljg4MDMyIDI4OS4zMTg4Miw1MjguMTI2NyAxNzAuMTI5MTMsNDA4Ljg3MDg3IDUwLjkzOTQ0NCwyODkuNjE1MDQgMTcwLjEzODU4LDE3MC40MTU5MSBDIDIzNS42OTU3NCwxMDQuODU4NzQgMjg5LjM0NzE2LDUxLjIyNjIyIDI4OS4zNzU1MSw1MS4yMjYyMiBjIDAuMDI4MywwIDUzLjY4OTIyLDUzLjY0MTk3IDExOS4yNDYzOCwxMTkuMTk5MTMgeiIKICAgICBzdHlsZT0iZmlsbDojZmYwMDAwO3N0cm9rZTpub25lIiAvPgogIDxwYXRoCiAgICAgZD0ibSAzNTguNjg3NSwxMDUuNjg3NSBjIC0xMS4wNDIzLDExLjk1MTA0IC0wLjAzNDYsNjEuMTIyOTUgLTIyLjg0Mzc1LDEwNy4yMTg3NSAtMTEuODI1MTMsLTEyLjYxMzQ2IC0xNi41NjY5MiwtMzYuMjY4NjMgLTI5Ljk2ODc1LC00OC4wOTM3NSA3LjA3MDQ2LDE4LjEzMTg2IC0xMi42MjYzMywxNi41NTc2NiAtNS41MzEyNSw3OS42MjUgLTEwLjcwNzI1LC0yLjY3NjgxIC0xMS4wMzcyNSwtNy4wODg0NiAtMzQuNjg3NSwtMzUuNDY4NzUgNC40MDM1MywyNy41MjIwNCAxLjYwNjYzLDQ0Ljk0MjE3IDcuMTI1LDc1LjY4NzUgMCwwIC01LjcwMDM2LC0xLjIwMTA5IC0zMy4xMjUsLTIxLjMxMjUgOC45MDA4NCwyOS45ODE3NSAtNi42NDg3NCw5My4xMTE2OSAyOC43ODEyNSwxMzcuNzUgTCAyNjguMzEyNSw0MDEgYyAyLjcyNjYyLDQwLjM5NCAzMS4xOTk5NCw3My43NjE3OCA2OS4xMjUsODMuODQzNzUgbCAtNjguNTMxMjUsMCAwLDI5LjAzMTI1IDE5MS4xMjUsMCAwLC0yOS4wMzEyNSAtNzQuNTMxMjUsMCBjIDM0LjMxMjQyLC05LjEyMjk4IDYwLjg2NjIzLC0zNy4zMTU1NSA2Ny42MjUsLTcyLjUzMTI1IGwgMCwtMC4wMzEyIGMgOS4zOTMwMSwtMTUuMDEzMDQgNTEuNDA0MTIsLTYzLjYxMjA2IDE5LjA5Mzc1LC0xNDEuODEyNSAwLDAgLTkuNDc5MywxNy4zNzc4NCAtMjYuODEyNSwyMi4wNjI1IDAsMCAyMi4yMDc2MywtMzcuMDE4MjQgMy45Mzc1LC02NyAwLDAgLTUuMzU0ODgsMjEuOTA2ODIgLTIzLjYyNSwyMi44NDM3NSAwLDAgOC44OTI4NywtNDYuNzI0MTQgLTE1LC03Ni40Njg3NSAtOC42NzE3NiwxOS43MDg1NSA1LjE5MjUxLDI3Ljg3NTU2IC0yMy42NTYyNSw0NC4xNTYyNSAtMy45NDY4NiwtNjAuNzIyOTIgLTE2LjU0OTg3LC03MC45NTc5MSAtMjguMzc1LC0xMTAuMzc1IHogTSAzNTIuMzc1LDIzOC4xMjUgYyAxMS4wMTUxNyw2Ljc3ODU2IDE4LjkzODk5LDE4LjQzNzMgMjEuMzQzNzUsNDAuMzEyNSAxLjA1Nzc0LDkuNjIxODkgNC42NTQ0MywxNS4xMzU4MyA3LjI4MTI1LDI0LjkwNjI1IC02LjI5OTIyLC0xLjM0MjU2IC0xMi44MzMzMiwtMi4wNjI1IC0xOS41MzEyNSwtMi4wNjI1IC04LjE4NDk3LDAgLTE2LjExOTk4LDEuMDQ5NzQgLTIzLjY4NzUsMy4wMzEyNSAtMS42Nzc1MSwtMzEuODY4MjIgMTUuMDAyODIsLTI0Ljg3MTI4IDE0LjU5Mzc1LC02Ni4xODc1IHogTSAzMTIuMTg3NSwyNjEgYyAwLDAgNC40MDg5OCwyNy43NzkyMSAxNS42NTYyNSw0Ni41MzEyNSAtNy45MjQ3OSwzLjA2MzQgLTE1LjMxOTk3LDcuMTk0NCAtMjIuMDMxMjUsMTIuMTg3NSAtMy42OTQ5MywtMjguNzk4NSA0LjY3MjU3LC0zNS4zMTA1MyA2LjM3NSwtNTguNzE4NzUgeiBtIDk3Ljc1LDE0LjE4NzUgYyAwLDAgNC4xMjk3NywyNy44MTUxNSA5Ljc1LDQ2LjQ2ODc1IC04LjkwNjEyLC03LjExNjgyIC0xOS4xNDkxMywtMTIuNjM0MzUgLTMwLjI4MTI1LC0xNi4xMjUgNC42OTE0MiwtOS42MDA2NiAxMS45MDgyOSwtMjIuMjQzMzkgMjAuNTMxMjUsLTMwLjM0Mzc1IHogbSAtMTQxLjEyNSwzMC43NSBjIDAsMCA4LjM3MDA3LDguNDQyNjcgMzAuMjUsMTkuMjgxMjUgLTcuNjc3NDksNi45MDI4MiAtMTQuMTk1MzUsMTUuMDcwMDUgLTE5LjI1LDI0LjE1NjI1IC0zLjQxMTk3LC0xMS4xNzUwNyAtOC4yMDAyMSwtMjguMDM4NzEgLTExLC00My40Mzc1IHogbSAxODUuMjgxMjUsMTAuMjUgYyAwLjczNDI5LDEwLjI4MDA0IDAuNzQ3MTQsMzUuMjg5NTIgLTMuOTM3NSw0OC44NzUgbCAwLjAzMTIsMC40Njg3NSBjIC00LjEzODk4LC0xMi42MTkzMiAtMTAuODkxNTksLTI0LjA0Nzk2IC0xOS42MjUsLTMzLjY1NjI1IDUuNjMzMzksLTQuNTAyMjEgMTUuMjExOTksLTExLjY4MTkyIDIzLjUzMTI1LC0xNS42ODc1IHogbSAtOTMuNDM3NSwxMC45MDYyNSBjIDM2LjgzMDY5LDEwZS02IDY2LjcxODc1LDI5LjkxOTMxIDY2LjcxODc1LDY2Ljc1IDAsMzYuODMwNjkgLTI5Ljg4ODA2LDY2LjcxODc1IC02Ni43MTg3NSw2Ni43MTg3NSAtMzYuODMwNjgsMCAtNjYuNzE4NzUsLTI5Ljg4ODA2IC02Ni43MTg3NSwtNjYuNzE4NzUgMCwtMzYuODMwNjggMjkuODg4MDYsLTY2Ljc1IDY2LjcxODc1LC02Ni43NSB6IgogICAgIHRyYW5zZm9ybT0ic2NhbGUoMC44LDAuOCkiCiAgICAgc3R5bGU9ImZpbGw6IzAwMDAwMDtzdHJva2U6bm9uZSIgLz4KPC9zdmc+Cg==",
        compressed_gas: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgo8c3ZnCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgdmVyc2lvbj0iMS4wIgogICB3aWR0aD0iNTc5cHQiCiAgIGhlaWdodD0iNTc5cHQiCiAgIHZpZXdCb3g9IjAgMCA1NzkgNTc5Ij4KICA8cGF0aAogICAgIGQ9Ik0gMjUuMzAxMTY1LDI4OS42NzE3MiAyODkuMzI5ODcsNTUzLjcwMDQ0IDU1My40MDI2MSwyODkuNjI3NyBDIDQ2NS4zNTAyMiwyMDEuNjc1NyAzNzcuNDcxODIsMTEzLjU0OTQyIDI4OS4zNzM5LDI1LjY0MzAyNCBMIDI1LjMwMTE2NSwyODkuNjcxNzIgeiIKICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO3N0cm9rZTpub25lIiAvPgogIDxwYXRoCiAgICAgZD0iTSAxNDcuNjU5NDEsMTQ4LjAxMjMzIDYsMjg5LjY3MTczIDE0Ny42Njg4Niw0MzEuMzQwNTkgMjg5LjMyODI3LDU3MyA0MzEuMDE2MDIsNDMxLjMxMjI0IDU3Mi43MDM3OCwyODkuNjI0NDkgNDMxLjA2MzI3LDE0Ny45ODM5OCBDIDM1My4xNjU3MSw3MC4wODY0MjQgMjg5LjQwMzg2LDYuMzQzNDcgMjg5LjM3NTUxLDYuMzQzNDcgYyAtMC4wMjg0LDAgLTYzLjc5OTY1LDYzLjc1MjQwMyAtMTQxLjcxNjEsMTQxLjY2ODg2IHogTSA0MDguNjIxODksMTcwLjQyNTM1IDUyNy44MjEwMywyODkuNjI0NDkgNDA4LjU3NDY1LDQwOC44NzA4NyAyODkuMzE4ODIsNTI4LjEyNjcgMTcwLjEyOTEzLDQwOC44NzA4NyA1MC45NDg4OTMsMjg5LjYwNTU5IDE3MC4xMzg1OCwxNzAuNDE1OTEgQyAyMzUuNjk1NzQsMTA0Ljg1ODc0IDI4OS4zNDcxNiw1MS4yMjYyMiAyODkuMzc1NTEsNTEuMjI2MjIgYyAwLjAyODMsMCA1My42ODkyMiw1My42NDE5NyAxMTkuMjQ2MzgsMTE5LjE5OTEzIHoiCiAgICAgc3R5bGU9ImZpbGw6I2ZmMDAwMDtzdHJva2U6bm9uZSIgLz4KICA8cGF0aAogICAgIGQ9Im0gNDM3LjYyNSwyODggYyAtMC45Njg1MiwtMC4wMDMgLTEuOTQ4MzEsMC4wNDQgLTIuNTYyNSwwLjE1NjI1IC0xLjE5Mjk0LDAuMjI0NDIgLTIzMS4yNjY5Niw2MS45OTM2IC0yMzIuMDkzNzUsNjIuMzEyNSAtNi41MTk4MSwyLjU2MzA0IC0xMC44OTU5LDkuNjcwMDkgLTEyLjIxODc1LDE5Ljg3NSAtMC4yNzE2NiwyLjA2Njk4IC0wLjM5OTM2LDUuODQwNSAtMC4yODEyNSw4LjI1IDAuMTg4OTgsMy45MDk1MiAwLjY5OTU0LDcuMjM5MSAxLjY1NjI1LDExLjEyNSAzLjg5NzcxLDE1LjgyNzA3IDEzLjc0NTYyLDI4LjI2Mjc1IDI0LjI4MTI1LDMwLjYyNSAxLjIyODM3LDAuMjcxNjYgNC4xMTUzNywwLjM0OTQxIDUuMzQzNzUsMC4xMjUgMS4wMzkzOSwtMC4xNzcxNiAyMjkuMDI4NzUsLTYxLjMxMDc2IDIzMS4zNDM3NSwtNjIuMDMxMjUgNC40MDU2LC0xLjM3MDEgNy43MjMxNCwtNC40NDU1MiAxMC4xNTYyNSwtOS40MDYyNSAxLjM1ODMsLTIuNzUyMDMgMi4xNzgxNCwtNS40MTQ3OSAyLjg3NSwtOS4zMTI1IDAuNTU1MTMsLTMuMDcwOTIgMS4wMzI3LC00LjM5MDcxIDIuMzQzNzUsLTYuMzc1IDEuNTk0NTMsLTIuNDIxMzEgNC4zNTY5NywtNC40ODU3MSA3LjE1NjI1LC01LjMxMjUgMC40NjA2NCwtMC4xMjk5MiAxMS44NDAwNCwtMy4xNzg4MSAyNS4yODEyNSwtNi43ODEyNSAxMy40NDEyLC0zLjYxNDI0IDI0LjcyNzYsLTYuNzA5NjQgMjUuMDkzNzUsLTYuODc1IDUuNDMzMTgsLTIuNDkyMTYgNy40MTEyMiwtMTAuNDI4MDEgNC4yODEyNSwtMTcuMTI1IC0xLjcyNDQ0LC0zLjY3MzI5IC00Ljg0OTEsLTYuMzg1MDggLTguMTU2MjUsLTcuMDkzNzUgLTEuMTIyMDcsLTAuMjM2MjMgLTIuODM0ODgsLTAuMjA5MTYgLTMuOTY4NzUsMC4wNjI1IC0wLjUxOTcsMC4xMjk5MiAtMTEuNzEzMDksMy4xMjQ2OSAtMjQuOTA2MjUsNi42NTYyNSAtMTMuMTgxMzYsMy41NDMzNyAtMjQuMjcwNjYsNi41MTEwOCAtMjQuNjI1LDYuNTkzNzUgLTAuNDI1MiwwLjEwNjMgLTEuMzYwNDUsMC4xNTYyNSAtMi43MTg3NSwwLjE1NjI1IC0yLjI2Nzc2LC0wLjAxMTggLTMuMTM4LC0wLjE2MjE0IC00Ljk2ODc1LC0wLjkwNjI1IC0yLjI5MTM5LC0wLjk0NDkgLTMuNzM1NjcsLTIuMDk1OTEgLTYuMDYyNSwtNC44MTI1IC0zLjQ4NDMxLC00LjA2MzA4IC02LjYyODg3LC02LjYyNzY4IC0xMC4xMjUsLTguMjgxMjUgLTEuNTAwMDIsLTAuNjk2ODYgLTMuMTEzOSwtMS4yMjA3MSAtNC41MzEyNSwtMS40Njg3NSAtMC42NDk2MiwtMC4xMTIyMSAtMS42MjUyMywtMC4xNTMzIC0yLjU5Mzc1LC0wLjE1NjI1IHoiCiAgICAgdHJhbnNmb3JtPSJzY2FsZSgwLjgsMC44KSIKICAgICBzdHlsZT0iZmlsbDojMDAwMDAwO3N0cm9rZTpub25lIiAvPgo8L3N2Zz4K",
        corrosive: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBoZWlnaHQ9IjcyNCIgd2lkdGg9IjcyNCIgdmlld0JveD0iMCAwIDczNSA3MzUiPgo8cGF0aCBkPSJtMzY3LjUgNzI3LjRsMzYwLTM2MC0zNjAtMzYwLTM2MCAzNjB6IiBmaWxsPSIjZjAwIi8+CjxwYXRoIGQ9Im0zNjcuNSA2NzAuMy0zMDIuOC0zMDIuOGwzMDIuOC0zMDIuOCAzMDIuOCAzMDIuOHoiIGZpbGw9IiNmZmYiLz4KPHBhdGggZD0ibTIzMy4zIDM4NC4xYy0xMS4xIDAtMTcuOS0zLjg1LTIxLjEtMTAuMTNoLTc5Ljk4djM2LjU2aDE5OS4zdi0zNi41NmgtNzIuNWMtNC45MyA2LjMyLTE0LjU0IDEwLjEzLTI1Ljc2IDEwLjEzIi8+PHBhdGggZD0ibTI1MS43IDM3MC41YzMuMjUgMCA3LjkxLTEuNTcgMTEuNjctOS4xLjg2LTEuNzEgMS4wMy0zLjg5IDEuMjItNi4yLjEtMS4yLjI2LTMuMTMuNTQtMy44Ny4zNi0uMjUgMS4xOS0uNjEgMS43OC0uODcgMi4yMS0uOTcgNS4yNC0yLjI5IDYuODMtNS40Ny44OS0xLjc4IDEuMTUtMy41NCAxLjE1LTUuMjIgMC0xLjI2LS4xNS0yLjQ3LS4yOS0zLjYyLS4xNS0xLjIxLS4yOC0yLjM3LS4yOC0zLjU3IDAtLjQxLjAwMS0uODIuMDUtMS4yNC4xOC0yLjEgMy44Ny02LjY1IDcuMTktOS41OGwtNS4wNy01Ljc3Yy0xLjU0IDEuMzUtOS4yMyA4LjQtOS43OCAxNC42OS0uMjEgMi40Ny4wNCA0LjU2LjI2IDYuNC4yNiAyLjE5LjM5IDMuNDgtLjExIDQuNDgtLjM1LjY5LTEuNzcgMS4zMi0zLjA0IDEuODctMS45Ni44Ni00LjE3IDEuODItNS40IDQuMDctMS4wOCAxLjk5LTEuMjkgNC41OC0xLjUgNy4wOS0uMDkgMS4xNS0uMjMgMi45LS40NSAzLjQyLS42NiAxLjMxLTEuMzUgMi4zNy0yLjA2IDMuMTYtLjQ4IDEuMzItMS4zMSAzLjIxLTIuNzMgNS4yNXY0LjA4Ii8+PHBhdGggZD0ibTI0MS43IDM2NS43bDQuMzkgNi4zYzIuNTEtMS43NSA0LjMxLTMuNzMgNS42MS01LjU5IDEuNDItMi4wMyAyLjI0LTMuOTIgMi43My01LjI1LjE4LS41LjMyLS45Mi40Mi0xLjIzLjY5LTIuMTUuMTgtNC4xOS0uMjctNS45OC0uNDctMS44OC0uNzQtMy4wOS0uMjItNC4yMy42LTEuMzQgMS42Mi0yLjE0IDIuOTEtMy4xNSAxLjQ3LTEuMTUgMy4zLTIuNTkgNC40NC01IDEuNDItMi45OC41OS02LjI3LS4yMS05LjQ0LS41Ni0yLjIzLTEuMTQtNC41NC0uODMtNi4zbC03LjU2LTEuMzRjLS4xNS44Mi0uMjEgMS42My0uMjEgMi40NCAwIDIuNTEuNiA0LjkxIDEuMTYgNy4wOS4zMSAxLjIzLjc2IDMgLjc2IDMuOSAwIC4xNi0uMDAxLjI5LS4wNC4zOS0uMzQuNzItMS4wNCAxLjI5LTIuMjQgMi4yNC0xLjY5IDEuMzMtMy43OSAyLjk4LTUuMTYgNi0uNzEgMS41OC0uOTUgMy4xMS0uOTUgNC41MSAwIDEuODQuNDEgMy40Ny43MyA0Ljc0LjE1LjYuMzcgMS40OC4zOCAxLjg0LS43OSAyLjQyLTIuMTcgNS41LTUuODEgOCIvPjxwYXRoIGQ9Im0yMDggMzUwYy41MS45NS44NCAxLjg0IDEuMDYgMi42OC43Ni40OSAxLjg4IDEuMjIgMi4xIDEuNTguMzQuOS4wMiAzLjQzLS4yIDUuMTEtLjA3LjU1LS4xNCAxLjA4LS4xOSAxLjYgMS44MyAxLjgzIDQuNzEgMy45NSA2LjI2IDQuNzNsLTIuODkgNS43OWMxLjQzIDIuMDQgMy4xIDQuMDggNC42MiA1Ljc1bDUuNjgtNS4xN2MtMy4yNy0zLjYtNS41Ny03LjEtNi4xMi04LjY0LS4wMDEtLjA3LS4wMDEtLjE0LS4wMDEtLjI0IDAtLjY3LjE2LTEuOTUuMjgtMi44NC4xOS0xLjUxLjQtMy4xMi40LTQuNzEgMC0xLjQ0LS4xNy0yLjg3LS42Ny00LjE4LTEuMDEtMi42NC0zLjM4LTQuMTUtNS4yNy01LjM2LTEuMTItLjcxLTIuNjUtMS42OS0yLjczLTIuMzEtLjAyLS4xNi0uMDMtLjMxLS4wMy0uNDcgMC0uNzcuMjQtMS41Ni42Ny0yLjkuNjMtMS45NSAxLjQ2LTQuNTMgMS40Ni04LjMgMC0uNTEtLjAyLTEuMDQtLjA1LTEuNTlsLTcuNjcuNDZjLjE5IDMuMi0uNDIgNS4wOC0xLjA2IDcuMS0uNiAxLjg3LTEuMjkgNC0uOTYgNi42Ny4wMi4xMy4wNC4yNS4wNi4zOCAxLjc4Ljk0IDMuODYgMi4yOSA1LjI1IDQuODciLz48cGF0aCBkPSJtMTkxLjggMzM0LjFjLjEzIDEuNS0uMTEgMi41Ni0uMzggMy44LS40NyAyLjExLTEuMDUgNC43My42OSA4LjE5IDEuNTUgMy4wOSA0LjIxIDQuNDIgNi4xNSA1LjM4IDEuNTcuNzggMi40OCAxLjI3IDIuOTkgMi4xOS42MyAxLjE2LjU2IDEuOTYuNDQgMy4yOS0uMTQgMS42Mi0uMzQgMy44NSAxLjA3IDYuMjUgMi4zIDMuOTIgOC4yOSA4LjExIDEwLjg0IDkuMzhsLjU0LTEuMDggMi44OS01Ljc5Yy0xLjU2LS43OC00LjQ0LTIuODktNi4yNi00LjczLS42MS0uNjEtMS4xLTEuMTktMS4zOS0xLjY4LS4xNC0uMjMtLjE1LS41Mi0uMDQtMS42Ny4xMS0xLjI0LjI1LTIuOTQtLjI4LTQuOTQtLjIyLS44NC0uNTUtMS43NC0xLjA2LTIuNjgtMS40LTIuNTgtMy40Ny0zLjkzLTUuMjYtNC44Ny0uMzctLjE5LS43My0uMzgtMS4wNy0uNTUtMS42NC0uODEtMi4zNC0xLjIxLTIuNy0xLjk0LS41LTEtLjQ0LTEuMzktLjA2LTMuMS4zMi0xLjQ2Ljc3LTMuNDUuNTQtNi4xMi0uNDQtNS4wNy00LjM2LTkuMzItNy41Mi0xMi43M2wtMi4zMy0yLjYxLTUuOTQgNC44NiAyLjYzIDIuOTZjMi4zNiAyLjU1IDUuMjkgNS43MyA1LjUxIDguMTgiLz48cGF0aCBkPSJtMjI1LjggMzM5LjNjMCA1LjkgMS40MiAxMy44MyA4LjM0IDEzLjgzIDYuOTEgMCA4Ljc0LTguOTQgOC43NC0xMi42IDAtMy4yMy00LjkxLTE2LjkxLTYuMS0yOS4zLTEuNTMtLjAyLTIuODEtLjQ2LTMuODgtMS4xNi0xLjA3IDEzLjktNy4xNSAyMy44Ni03LjE1IDI5LjIiLz48cGF0aCBkPSJtMzM0LjEgMjI3LjVjLTE1LjEgMi40LTg0LjEgMTQuOC05MC43IDE2LjEtOS44MSAxLjg4LTEyLjEtNy0xNi41Ni05LjEyIDAgMCA2LjYxIDM4LjgzIDcgNDEuNzIgMS4zOCAxMC4zOC01LjcyIDE1LjcyLTUuNzIgMjMuNDggMCAyLjgxIDEuMjIgOCA0Ljc5IDEwLjM1IDEuMDcuNyAyLjM1IDEuMTMgMy44OCAxLjE2LjA1IDAgLjA5IDAgLjE0IDAgNi43MiAwIDguMTYtNi43MiA4LjE2LTExLjg0IDAtNy45Mi0zLjg0LTEyLjQ4LTMuODQtMTQuNHMxLjYtNC4xNiA3LjY4LTUuMTJjNi4wOC0uOTYgODIuMS0xNC4xNiA5NC4xLTE2LjFzMjAuODgtMTEuNzYgMTguOTYtMjEuODRjLTEuOTItMTAuMS0xMi43Mi0xNi44LTI3Ljg0LTE0LjRtNS4yIDI4LjMyYy0xMC4yNC42NC05OS43IDkuMjgtOTkuNyA5LjI4bC0xLjkyLTEyLjY0czg4LjUtMTUuMzYgOTguOS0xNy4xYzEwLjQtMS43NiAxNy43NiAyLjQgMTcuNzYgOC45NiAwIDYuNTYtNC44IDEwLjg4LTE1IDExLjUyIi8+PHBhdGggZD0ibTQ5OC44IDMwNi4yYy0yLjA3IDEwLjY4LTYuNTIgMjAuOTMtNi41MiAyMy43NCAwIDMuNjYgMS4wOSAxMi44IDggMTIuOHM5LjEtOC4xMyA5LjEtMTRjMC00LjY2LTQuMDgtMTIuMi01Ljc5LTIzLjEtMSAuNDQtMi4xNC43LTMuNDUuNy0uNDcgMC0uOS0uMDUtMS4zMi0uMTMiLz48cGF0aCBkPSJtMzg3LjcgMjYxLjVjMTIgMS45MiA5Ni4xIDE1LjkzIDEwMi4yIDE2LjkgMy40Ny41NSA2LjMxIDIuODQgNi4zMSAzLjc5cy0zLjcxIDQuNS0zLjcxIDEwLjczYzAgNC43Ni43NCAxMi4yNiA2LjI2IDEzLjI5LjQxLjA4Ljg1LjEzIDEuMzIuMTMgMS4zMSAwIDIuNDUtLjI1IDMuNDUtLjcgNC4xNC0xLjgzIDUuNzgtNi45OSA1Ljc4LTExLjY5IDAtMTAuOTctNS43LTguODEtNC4zMy0xOS4yLjM4LTIuODggNS45Mi00MC41NCA1LjkyLTQwLjU0LTQuNDggMi4wOC01LjY3IDkuODItMTUuNDggNy45NC02LjY3LTEuMjgtODMuOC0xNS41MS05OC45LTE3Ljkxcy0yNS4zNiA1LjQ2LTI3LjMgMTUuNTQgNi40OCAxOS43OSAxOC40OCAyMS43MW05LTI5Ljc1YzEwLjQxIDEuNzEgMTA0LjEgMTguMSAxMDQuMSAxOC4xbC0xLjkyIDEyLjY0cy05Ni45LTguNDgtMTA3LjEtOS4xMmMtMTAuMjQtLjY0LTE0Ljg4LTQuMTYtMTQuODgtMTAuNzJzOC4xNi0xMi44IDE5Ljg0LTEwLjg4Ii8+PHBhdGggZD0ibTUzMi43IDMxOC4yYy4wNSAxLjA4LjA4IDEuNjctLjUxIDMtMS4xMiAyLjQ4LTMuMDcgNS41Ny02IDYuMjdsMS43NSA3LjQ4YzMuMzMtLjc4IDcuOTktMy4yNSAxMS4zLTEwLjYgMS4zNi0zIDEuMjUtNS4xIDEuMTgtNi41NC0uMDYtMS4yLS4wOS0xLjcuOTMtMy4zMS43My0xLjE0LjkzLTEuMTkgMS44LTEuNDIgMS45Ny0uNTIgNC4yMy0xLjM3IDYuMTgtNSAyLjIyLTQuMTQgMS41LTcuNTguOTgtMTAuMS0uMjgtMS4zOC0uNTEtMi40Ni0uMzMtMy41OS4yNy0xLjcyIDEuNDgtMy4wNCAzLjc5LTUuNDEgMS4yNS0xLjI5IDIuNjctMi43NSA0LjExLTQuNThsLTYtNC43NWMtMS4xOCAxLjUxLTIuNCAyLjc2LTMuNTggMy45Ny0yLjU2IDIuNjMtNS4yIDUuMzUtNS44NyA5LjU2LS40IDIuNTEuMDQgNC42NC40IDYuMzUuNDYgMi4yNC42MyAzLjI5LS4yMyA0LjktLjUyLjk4LS41NC45OC0xLjM2IDEuMi0xLjkzLjUxLTQuMTggMS4zMy02LjM0IDQuNzQtMi4xNSAzLjM5LTIuMjMgNS42My0yLjEyIDcuODEiLz48cGF0aCBkPSJtNTE5LjYgMzMxLjJjMy42OC0zLjI0IDQuODItNC40MSA2LjUtOS44MSAxLjA5LTMuNTEuODQtNS44My42NC03LjY5LS4xNi0xLjQ4LS4yNy0yLjU1LjIzLTQuNDYuMjYtLjk4LjM1LTEuMDIgMS40Mi0xLjYgMS42NC0uODggNC4zOC0yLjM1IDUuNTktNy4xMSAxLjExLTQuMzctLjE1LTcuMTItMS4wNy05LjEzLS43Mi0xLjU2LTEuMTUtMi41MS0uNzctNC41NmwtNy41Ni0xLjM4Yy0uOCA0LjQzLjQ0IDcuMTUgMS4zNSA5LjEzLjcyIDEuNTcgMS4wNSAyLjI5LjYxIDQtLjM4IDEuNDktLjY1IDEuNjMtMS43OCAyLjI0LTEuNTMuODItNC4xIDIuMi01LjIyIDYuMzktLjg4IDMuMjktLjY0IDUuNDktLjQ1IDcuMjYuMTcgMS41Ni4yOCAyLjYtLjM0IDQuNTgtMS4xMSAzLjU3LTEuMjMgMy42OC00LjI0IDYuMzJsLTEuNzkgMS41OSA1LjE0IDUuNzEgMS43Mi0xLjUzIi8+PHBhdGggZD0ibTQ2Mi43IDMwNS42Yy44NyAzLjg1IDMuNjEgNS41NCA1LjYxIDYuNzggMS44MiAxLjEzIDIuNDQgMS41OSAyLjY5IDIuOC40IDEuODguMjIgMi40Mi0uMDUgMy4yMi0uNTQgMS42LS45NSAzLjI4LS4xMyA2LjE4IDEuNDQgNS4xIDIuOTggNi43NiA4LjEgMTEuODdsNS40My01LjQzYy00Ljg1LTQuODUtNS4yNS01LjQxLTYuMTUtOC41NS0uMjQtLjg0LS4yMi0uOS4wMi0xLjYzLjU2LTEuNjggMS4wNS0zLjYzLjI4LTcuMjYtLjk2LTQuNTItNC4xLTYuNDUtNi4xNy03LjczLTEuNTctLjk3LTItMS4zMi0yLjE1LTEuOTMtLjI3LTEuMjIuMDItMi4xNS42Ny0zLjk4Ljc4LTIuMjIgMS43Ni00Ljk4IDEuMy04LjkzbC03LjYzLjljLjI2IDIuMTctLjI2IDMuNjMtLjkxIDUuNDctLjc1IDIuMTMtMS42OSA0LjgtLjkyIDguMjMiLz48cGF0aCBkPSJtNDU3LjUgMzAzLjZjMC0xLjM3LS4yMS0yLjk2LS44NS00Ljg2LTEuNzgtNS4yMy0zLjYzLTcuMjUtNS43Ny05LjU4bC0yLjE1LTIuNDQtNS45MSA0LjkgMi40MSAyLjczYzEuOTMgMi4xIDIuOSAzLjE2IDQuMTYgNi44Ni42NiAxLjk1LjQ2IDIuOTcuMTcgNC41MS0uMzggMS45OC0uOTEgNC42OS43OSA4LjUyIDEuODggNC4yMiA0LjY5IDUuMjYgNi41NiA1Ljk1IDEuMjQuNDYgMS40Ni41NCAxLjkgMS40Ny43NCAxLjYuNjUgMi4wNi40NyAyLjg5LS4yMyAxLjEtLjYyIDIuOTQuNDUgNS4zNSAxLjM3IDMuMTIgNS4yNCAxMC40OCAxMS41MSAxMS40bDEuMTItNy42Yy0xLjU0LS4yMy00LTMuMjUtNS42LTYuODlsLS4wNi0uMTguMS0uNTFjLjE2LS43Ni4zLTEuNTcuMy0yLjQ5IDAtMS4zOS0uMzEtMy4wNC0xLjMxLTUuMjEtMS43Ny0zLjgxLTQuNDQtNC44LTYuMjEtNS40NS0xLjMyLS40OS0xLjYzLS42LTIuMTktMS44Ni0uMzgtLjg2LS41Mi0xLjQ3LS41Mi0yLjA5IDAtLjU1LjExLTEuMS4yNS0xLjg1LjE5LS45OS40Mi0yLjE2LjQyLTMuNTgiLz48cGF0aCBkPSJtNTA3LjcgMzQ4LjRjLTcuNTMgNi4wOS0yNC4zOSA2LjU2LTMzLjMtMS41NmwtMS44OC0xLjcxLTIuMzEgMS4wN2MtMy40MyAxLjU5LTggMS43Mi0xMS42NyAxLjgyLTQuNjcuMTMtOC4zNi4yNC0xMC4yNSAzLjE5LTEuMzcgMi4xNC0xLjI0IDUuMS4zNyA3Ljk5LjI2LjQ4LjU3Ljk2LjkxIDEuNDRoMTYuNzVjLTYuMjMgMC05LjUtMi45NC0xMC43MS00LjguOTgtLjA3IDIuMTUtLjEyIDMuMTUtLjE0IDMuNjgtLjExIDguMTEtLjMxIDEyLjMxLTEuNjkgNC41OCAzLjQ5IDEwLjE3IDUuNDkgMTUuODcgNi4yNSA0LjEzLTQuODYgMTEuMS02LjY0IDE1LjE4LTYuNjR2NS43NWMzLjE4LS44MyA2LjExLTIuMDYgOC41Ni0zLjY1IDQuMDggMS43NiA5LjggNS4yMyAxMy43OCA3LjY0IDMuNDYgMi4xIDUuMTcgMy4xMyA2LjMxIDMuNTYgMy40OCAxLjM0IDE4IDIuNTMgMjYuOTkgMi41M3YtNy42OGMtMTAuMTYgMC0yMi4zMi0xLjM0LTI0LjItMi4wMi0uNjEtLjI1LTMuMDktMS43NS01LjA3LTIuOTYtNS4xNy0zLjE0LTEyLjI1LTcuNDQtMTcuMS05LjFsLTEuOTktLjY2LTEuNjMgMS4zMiIvPjxwYXRoIGQ9Im00NjYuMyAzNjAuNmgtMjguNjVjLTEyLjkgMC0xNC4yOCA3LjktMTQuMjggMTAuNjcgMCAuNzcuMDkgMS43NS4zNiAyLjhoMTEuNjRjLTMuNDIgMC00LjUxLTEuMzQtNC41MS0yLjc3czEuMzEtMyA2Ljc5LTNoNDUuOTljLjI1LTMuMTIgMS4zNi01LjY2IDIuOTYtNy42OGgtMjAuMyIvPjxwYXRoIGQ9Im00OTEuNCAzNjguM2gxLjFsMjIuOTYtNS4zNi0xMy4xLTIuMzJoLS4yNHYuNjZjLS4xIDAtOS42MS40My0xMC43MyA3Ii8+PHBhdGggZD0ibTQxOS4zIDM3NC4xYy03LjQgMC0xMi4zOCA1LjgxLTEyLjM4IDExLjI0IDAgNS4xOCA0LjYgMTEuNDMgMTIuNzYgMTEuNDNoMi4zOWMuNTUtMi45NSAyLjktNy4xNSAxMS42NS03LjYzdi0uMDVoLTE0Yy0yLjg4IDAtNS0yLjgyLTUuMDgtMy43NiAwLTEgMS40LTMuNTUgNC43LTMuNTVoNDkuODl2LTcuNjhoLTQ5Ljg5Ii8+PHBhdGggZD0ibTQyMiAzOTYuN2MtLjEyLjYzLS4xNSAxLjE5LS4xNSAxLjY2IDAgNi4zIDUuNTUgMTEuNDMgMTUgMTEuNDNoLjE4YzEuNDQtNC4yNiA2LjY5LTcuMjYgMTMuNjctNy42NHYtLjA1aC0xMy44NWMtNC43NiAwLTcuMzYtMi40OC03LjM2LTMuNzUgMC0xLjA5IDIuOTQtMS42NiA1Ljg0LTEuNjZoMzMuNzd2LTcuNjhoLTMzLjc3Yy0uNiAwLTEuMTYuMDItMS43MS4wNS04Ljc1LjQ4LTExLjEgNC42OC0xMS42NSA3LjYzIi8+PHBhdGggZD0ibTQzNy4xIDQwOS44Yy0uMjYuNzctLjQxIDEuNTgtLjQxIDIuNDIgMCA0LjgyIDQuMzIgMTAgMTMuOTYgMTAuODUgNi45OC41OCAzNy4xIDEuNTMgNDIuNjIgMS41MyA0LjUgMCAyMy4zNi0uNjEgMzMuNTItMy41NyAzLS44OCA1LjU1LTIuMDYgOC0zLjIgNS4yOC0yLjQ2IDEwLjc0LTUgMjIuNi01di03LjY4Yy0xMy41NyAwLTIwLjEgMy4wNC0yNS44NCA1LjcxLTIuMjkgMS4wNi00LjQ1IDIuMDctNi45MSAyLjc5LTguNTMgMi40OS0yNS45OCAzLjI2LTMxLjM3IDMuMjYtNS4xIDAtMzUuMi0uOTQtNDEuOTktMS41LTQuODgtLjQxLTYuOTEtMi4yOC02LjkxLTMuMTkuMTctLjQ3IDIuNTItMi40MiA3LjkyLTIuNDJoMzAuOTJsLTcuNC03LjY4aC0yMy41MmMtLjUxIDAtMS4wMi4wMi0xLjUyLjA1LTYuOTkuMzgtMTIuMjMgMy4zNy0xMy42NyA3LjYzIi8+PHBhdGggZD0ibTQ4Ni45IDM2MC4yYy0uMTEuMTMtLjIyLjI1LS4zMi4zOC0xLjYgMi4wMi0yLjcxIDQuNTYtMi45NiA3LjY4LS4wMy40My0uMDYuODYtLjA2IDEuMzEgMCA3LjE0IDMuNzYgMTkuNiAyOC45NiAyMi43OWwuOTYtNy42MmMtOC4zMS0xLjA1LTIyLjItNC40Mi0yMi4yLTE1LjE3IDAtLjQ2LjA0LS45LjExLTEuMzEgMS4xMy02LjU5IDEwLjYzLTcgMTAuNzMtN3YtNy42OGMtNC4wNyAwLTExLjEgMS43OC0xNS4xOCA2LjYzIi8+PC9zdmc+",
        toxic: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBoZWlnaHQ9IjcyNCIgd2lkdGg9IjcyNCIgdmlld0JveD0iMCAwIDczNSA3MzUiPgo8cGF0aCBkPSJtMzY3LjUgNzI3LjRsMzYwLTM2MC0zNjAtMzYwLTM2MCAzNjB6IiBmaWxsPSIjZjAwIi8+CjxwYXRoIGQ9Im0zNjcuNSA2NzAuMy0zMDIuOC0zMDIuOGwzMDIuOC0zMDIuOCAzMDIuOCAzMDIuOHoiIGZpbGw9IiNmZmYiLz4KPHBhdGggZD0ibTM2MS42IDM2NC4yYzguMjMgMCA1LjQ1LTMuMzMgMTIuNDgtMy4zMyA1LjczIDAgMy43OSAzLjI0IDExLjU2IDMuMjQgNy4yMSAwIDguOTctNS40NSA4Ljk3LTcuNjcgMC0zLjQyLTMuODgtNS42Mi01LjY0LTEwLjI2LTEuNzYtNC42Mi01LjE4LTIxLjcyLTE1LjYyLTIxLjcyLTMuODQgMC02LjEgMS41Ny04Ljk3IDQuOTktNC43MSA1LjU1LTUuMDkgMTQuODctOCAxOC40OS0yLjg3IDMuNTEtMy45OCA3LjI4LTMuOTggOS4yNSAwIDIuMTMgMS4wMiA3IDkuMjUgN20tODAuNTUgNTguNTEtNy45IDMuNzRjLTcuOTEgMy44MS0xNy43OCAxMS43Ny0xOS44MyAyOC4xLS4zNCAyLjY4LTYuMzkgOS43OS0xMi41OSA5Ljc5LTMuODEgMC04LjMyLTIuNTItOC45NC02LjI3LTEuMDgtNi40NC01Ljk1LTI5LjU1LTYuMTYtMzAuNTMtLjYtMi44NS0zLjQtNC42OC02LjI2LTQuMDdzLTQuNjggMy40LTQuMDcgNi4yNmMuMDAxLjA2Ljc2IDMuNjUuNzYgMy42NS05LjE4LTQuMzgtOS41Ni01LjE3LTkuNTYtOC4zMyAwLTMuOSA5LTguODcgMTYuMS04Ljg3IDUuOTcgMCAxMC41NCAxLjcxIDE0Ljk3IDMuMzYgNCAxLjUgOC4xMyAzLjA0IDEyLjggMy4wNCA2LjcyIDAgOC42NC0uNjggMTEuNzMtMi4zNWwyLjYtMS4yN2M0LjA3LTEuNzEgMzUuNjQtMTYuNzggNDkuNTUtMjMuNDMgMS45NCAyLjc4IDQuMjYgNS41NyA2Ljk0IDguMjVtLTMuMy01MmMxMi4yOSA3LjYzIDEyLjEgNy4yOSAxMi4xNiAxMi4xLS4xNSAxLjMtLjIgMy40NC0uMiA3LjQxIDAgMTMuMSAyNS41IDI0LjEgNDEuNTIgMjQuMSAxNy43NyAwIDQxLjMtMTIgNDEuMy0yNC40OXYtNi43NGMwLTUuMzIuNTYtNS44MSAxMC44My0xMS44NHYyNC45OWMwIDYuOTktOS41OCAyMS45MS0yNi44OSAzMC42MmwtLjU2LjI4Yy04LjM4IDQuMjEtMTguOCA5LTIzLjEgOS0zLjk3IDAtMTcuNDEtMy45Mi0yOC4xLTkuMzEtMTcuMzItOC43LTI2Ljg5LTIzLjYzLTI2Ljg5LTMwLjYyem0tMTA4LTQwLjljLS4wMi4wMDEwLS4wNC4wMy0uMDcuMDQuMDItLjAwMTAuMDQtLjAzLjA3LS4wNG0zMTAuOS05LjljMi4zMyAwIDMuMzQuNzYgMy45IDEuMzQgMy40IDMuNTEgMy4wNyAxMy43OCAyLjg0IDIxLjI4bC0uMTMgNS45NWMtLjA2IDIuOTIgMi4yNSA1LjIxIDUuMTYgNS4yOCAyLjkxLjA2IDUuMzMtMi4zNiA1LjQtNS4yOGwuMDUtMi4xM2MuMy44MS40NCAxLjUuNDQgMS45NXYxMC4xNmMwIDIuODgtLjg0IDYuMzItNC44MiA2LjMyLTMuMjcgMC03LjQ2LTIuMDQtMTEuNS00LTQuNjYtMi4yNy05LjEtNC40Mi0xMy41Ny00LjQybC0uNzYtLjAzYy0yLjYzLS4xMy04LjExLS4zOC0xNS44MyAzLjIzbC0uMTUuMDctNTcuNzUgMjkuM3YtMTQuNjhjOC41NC0zLjkgNDEuMy0xOC45MiA0OS40LTIzLjEgOS4xMy00LjcgMTYuMS0xNC43NSAyMC4yLTIwLjc2bDEuNTktMi4yN2MyLjc1LTMuNzggOC40Ny04LjE5IDE1LjU2LTguMTl6bS0yNjYuNCAzOS43LS4wOC0uMDNjLTcuNzItMy42Mi0xMy4yLTMuMzYtMTUuODMtMy4yM2wtLjc2LjAzYy00LjUgMC04LjkxIDIuMTUtMTMuNTcgNC40Mi00IDEuOTctOC4yMiA0LTExLjUgNC0zLjk5IDAtNC44Mi0zLjQzLTQuODItNi4zMnYtMTAuMTZjMC0uNDUuMTQtMS4xNC40NC0xLjk1bC4wNSAyLjEyYy4wNiAyLjkyIDIuNDggNS4zNCA1LjQgNS4yOCAyLjkxLS4wNiA1LjIzLTIuMzYgNS4xNi01LjI4bC0uMTMtNS45NWMtLjI0LTcuNS0uNTYtMTcuNzcgMi44My0yMS4yOC41Ni0uNTcgMS41Ny0xLjM0IDMuOS0xLjM0IDcuMDkgMCAxMi44MiA0LjQxIDE1LjU3IDguMTlsMS41OSAyLjI3YzQuMTQgNiAxMS4xIDE2LjEgMjAuMiAyMC43NiA3LjA4IDMuNjUgMzIuMyAxNS4yMyA0NC41OCAyMC44N3YxNC40NXptMTE3LjEtMTY0LjhjMjkuMzYgMCA0My42MiAxMi4yNSA2MS43IDI4LjY4bDkuNTggOC41OSAzLjU3IDMuMWMxMS40OCA5Ljk1IDIyLjMzIDE5LjM1IDIyLjMzIDI0LjkyIDAgNi45LTIuNDEgMTMuNzgtNS42OCAyMC4yLjM4LTIuMzUuNC0zLjkuNC02Ljg5IDAtMTEuMzctMy4xNC0xNi4yNy0xNC43NS0yOC40MWwtNy42MyA3LjNjMTAuODggMTEuMzcgMTEuODIgMTMuNzkgMTEuODIgMjEuMSAwIDQuNTUgMCA0LjU1LTIuMzEgMTQuOGwtMy4wNiAxMy43NC4zNSAxLjI1Yy4wNC4xMyAzLjU5IDEzLjE4IDMuNTkgMjUuNyAwIDEzLjEtOCAxNy45OC0xOC4xIDI0LjJsLTMuMTggMS45Ni0xMC44OSA2LjU2Yy0xMS41IDYuNzUtMTcuMjMgOS43My0xNy4yMyAyMS41MnY2Ljc0YzAgMy45MS0xNC43OCAxMy45My0zMC41MyAxMy45My0xNC40NiAwLTMwLjM4LTEwLTMwLjk2LTEzLjY0IDAtNC44My4yMS02LjkyLjIxLTYuOTIgMC0xMS41Ni01LjYtMTQuODEtMTYuNzctMjEuMjktMy4xMS0xLjgtNi45Ny00LjA1LTExLjUyLTYuOWwtMy4xOC0xLjk2Yy0xMC4xNC02LjItMTcuMzgtOS43Mi0xNy4zOC0yNC4yIDAtMTUuMjMgMy42My0yMC42NyAzLjYzLTI1LjM3cy01LjA3LTIzLTUuMDctMjUuODdjMC0uMzcuMDQtMy40Ni4wNC0zLjQ2IDAtNi44NS44Ny0xMi41NyAxMS40Ni0yMS45OC44Ni0uNzYgMi4xNy0zLjA5IDEuMTItNC4zOHMtMS40Ny0xLjgzLTIuNjktMy4yN2MtLjYxLS43Mi0xLjcyLTEtMi43OS0xLjAxLTEuMDcgMC0yLjExLjI4LTIuNTguNy0xMi41MyAxMS4xMy0xNS4xIDE5LjU2LTE1LjEgMjkuOTQgMCAwLS4wNCAzLjA5LS4wNCAzLjU1IDAgMi44Mi0uMTIgMS40IDEuMzMgNy4zMy00LjUyLTcuNjYtOC4zMi0xNi4yOC04LjMyLTI0Ljk1IDAtNS4zOSAxMC4zMy0xNC43NSAyMS4yNy0yNC42NWw0Ljc4LTQuMzRjMy43OC0zLjQ1IDcuMS02LjY3IDEwLjI0LTkuNzkgNy4yNC03LjExIDEyLjk1LTEyLjcyIDE5LjYtMTYuMSAxNC45OS03LjYgMjguNi0xMC40IDQyLjgyLTEwLjRtLTYyLjMgMjEwLjVjLTE4LjMyIDguNzYtNDUuMSAyMS41My00OC41NyAyMi45OGwtMy41MiAxLjcxYy0xLjUzLjgzLTIgMS4wNy02LjcxIDEuMDctMi43NSAwLTUuNjktMS4xLTkuMS0yLjM3LTQuODEtMS44LTEwLjc5LTQtMTguNjctNC0xMC44NiAwLTI2LjY0IDcuNTctMjYuNjQgMTkuNDMgMCAxMC41NiA2Ljc3IDEzLjczIDE3Ljk4IDE5bDQuODIgMi4yOWMxLjEzIDUuNTQgMi4yMSAxMC45NSAyLjYzIDEzLjQ4IDEuNTcgOS40NCAxMS4xIDE1LjEgMTkuMzYgMTUuMSAxMS44IDAgMjIuMS0xMS41NSAyMy4xLTE5IDEuMTktOS40NyA1Ljc0LTE1Ljk5IDEzLjkyLTE5LjkybDcuNzktMy42OSA0NC41LTIwLjk1YzMuMDUgMi4xOSA2LjM2IDQuMjMgOS45MiA2IDguNzEgNC4zOCAyNS4yIDEwLjg2IDMyLjg4IDEwLjg2IDYuODIgMCAxNy01LjE0IDI4LjEtMTAuNzIgNC43Ni0yLjM5IDguODQtNSAxMi40OS03Ljg3bDU0Ljc4IDI2LjM1YzguMTggMy45NCAxMi43MyAxMC40NSAxMy45MiAxOS45Mi45NCA3LjQ5IDExLjI3IDE5IDIzLjEgMTkgOC4yOCAwIDE3Ljc4LTUuNjQgMTkuMzYtMTUuMS40Mi0yLjUzIDEuNS03Ljk0IDIuNjMtMTMuNDhsLS40Ny4yMi40Ny0uMjIgNC44My0yLjI5YzExLjIxLTUuMjcgMTcuOTgtOC40NSAxNy45OC0xOSAwLTExLjg2LTE1Ljc3LTE5LjQzLTI2LjY0LTE5LjQzLTcuODggMC0xMy44NiAyLjI0LTE4LjY3IDQtMy40IDEuMjctNi4zNCAyLjM3LTkuMSAyLjM3LTQuNzEgMC01LjE4LS4yNS02LjcxLTEuMDdsLTMuNTItMS43MWMtMy43MS0xLjU2LTM0LjU0LTE2LjI2LTUyLjY2LTI0LjkzLjI1LS43Ni40Ni0xLjUxLjYzLTIuMjUgMTIuNDEtNi4yOCA2Mi44LTMxLjgxIDYzLTMxLjkxIDUuMzQtMi40OSA4LjY0LTIuMzQgMTAuODMtMi4yNGwxLjI2LjA0YzIuMDYgMCA1LjU2IDEuNyA4Ljk0IDMuMzUgNC44OCAyLjM4IDEwLjQyIDUuMDggMTYuMSA1LjA4IDkuMSAwIDE1LjM4LTYuOTQgMTUuMzgtMTYuODh2LTEwLjE2YzAtNS41Mi0zLjgxLTEzLjIxLTEwLjktMTcuNTEtLjM5LTYuNTYtMS43Ny0xMi43MS01LjgyLTE2Ljg5LTIuOTMtMy02Ljc5LTQuNTUtMTEuNDgtNC41NS0xMS4xIDAtMTkuNjkgNi40OC0yNC4xIDEyLjU0bC0xLjc0IDIuNDljLTMuMzUgNC44NS05LjU3IDEzLjg4LTE2LjM0IDE3LjM2LTQuODcgMi41MS0xOS4yMSA5LjE4LTMxLjQ1IDE0LjgyIDcuOTUtNS44IDE0Ljc1LTEzLjU5IDE0Ljc1LTI3LjcgMC04LjgyLTEuNTEtMTcuNi0yLjY3LTIzbDEuOS0yLjgyYzcuNjEtMTAuOTkgMTgtMjYgMTgtNDIuOTMgMC0xMC4zOS0xMC45LTE5LjgzLTI1Ljk4LTMyLjlsLTMuNTUtMy4wOC05LjQtOC40M2MtMTguMi0xNi41NC0zNS4zLTMyLjItNjguNzgtMzIuMi0xNS43MiAwLTMxLjMgNC00Ny41OSAxMi4yOC04LjExIDQuMTEtMTQuNjUgMTAuNTQtMjIuMiAxNy45OC0zLjExIDMuMDUtNi4zMiA2LjIxLTkuOTYgOS41M2wtNC43NSA0LjMyYy0xNC4zNiAxMy0yNC43NCAyMi40LTI0Ljc0IDMyLjQ4IDAgMTYuODkgMTAuNDIgMzEuOTQgMTggNDIuOTNsMS4zNSAyYy0xLjA4IDcuNzMtMi4yIDE3Ljk0LTIuMiAyNS4xIDAgOS44NSA0LjU0IDE2Ljc5IDEwLjQ3IDIyLjItOS40OS00LjQxLTE4LjU4LTguNjgtMjIuMjgtMTAuNTgtNi43Ny0zLjQ4LTEyLjk5LTEyLjUxLTE2LjM0LTE3LjM2bC0xLjc0LTIuNDljLTQuNDEtNi4xLTEzLjEtMTIuNTQtMjQuMS0xMi41NC00LjY5IDAtOC41NiAxLjUzLTExLjQ4IDQuNTUtNC4wNSA0LjE4LTUuNDQgMTAuMzMtNS44MiAxNi45LjAyLS4wMDEwLjA0LS4wMi4wNy0uMDQtLjAyLjAwMTAtLjA0LjAyLS4wNy4wNC03LjA5IDQuMy0xMC45MSAxMS45OS0xMC45MSAxNy41MXYxMC4xNmMwIDkuOTQgNi4zMyAxNi44OCAxNS4zOSAxNi44OCA1LjcxIDAgMTEuMjQtMi43IDE2LjEtNS4wOCAzLjM4LTEuNjUgNi44Ny0zLjM1IDguOTQtMy4zNWwxLjI2LS4wNGMyLjE5LS4xIDUuNDktLjI2IDEwLjgzIDIuMjQuMTkuMDkgNDAuMiAyMC4zOCA1Ny43MyAyOS4ybTEyMC44IDE0LjRjMTAuNzcgNS4xNSA0OC43OSAyMy4zMiA1My4yIDI1LjJsMi42IDEuMjdjMy4wOCAxLjY3IDUgMi4zNSAxMS43MyAyLjM1IDQuNjYgMCA4LjgtMS41NSAxMi44LTMuMDQgNC40Mi0xLjY1IDktMy4zNiAxNC45Ny0zLjM2IDcuMSAwIDE2LjEgNC45NyAxNi4xIDguODcgMCAzLjE2LS4zOCAzLjk1LTkuNTYgOC4zMy40Ni0yLjE4Ljc1LTMuNTkuNzctMy42NC42LTIuODUtMS4yMi01LjY1LTQuMDgtNi4yNi0yLjg1LS42LTUuNjUgMS4yMi02LjI1IDQuMDctLjIxLjk4LTUuMDggMjQuMS02LjE2IDMwLjUzLS42MyAzLjc1LTUuMTMgNi4yNi04Ljk0IDYuMjYtNi4yIDAtMTIuMjUtNy4xMS0xMi41OS05Ljc5LTIuMDUtMTYuMzYtMTEuOTEtMjQuMzItMTkuODItMjguMWwtNTEtMjQuNTNjMi40NS0yLjY2IDQuNTUtNS40IDYuMjktOC4xbS0xMy44LTczLjFjMTcuNiAwIDI1LTIyLjEgMjUtMjcuNzlzLTQuNS04LjEtNy4xNS04LjFoLTMzLjQ4Yy0zLjU3IDAtMTIuMTcgMi45MS0xMi4xNyA4LjQ3IDAgMi4wOCAxLjU2IDYuNjYgNC45MiAxMS4xIDUuOCA3LjY4IDEwLjgzIDE2LjI4IDIyLjg3IDE2LjI4bS04Ny40OS4wNGMxMiAwIDE3LjEtOC42IDIyLjg3LTE2LjI4IDMuMzYtNC40NSA0LjkyLTkgNC45Mi0xMS4xIDAtNS41Ni04LjYtOC40Ny0xMi4xNy04LjQ3aC0zMy40OGMtMi42NSAwLTcuMTQgMi4zOC03LjE0IDguMSAwIDUuNjkgNy40MSAyNy43OSAyNSAyNy43OW0tOS4xIDIxLjc2aC03Ljg0YzMuNzYgMS43MyA2LjYxIDMgNy44NCAzLjU5di0zLjU5bS0xMC40IDM2LjdjLjI1IDIuMTQuODYgNC40NiAxLjgxIDYuODh6Ii8+Cjwvc3ZnPgo=",
        irritant: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1NzkwIDU3OTAiPjxwYXRoIGQ9Im0yNTMgMjg5NyAyNjQwIDI2NDAgMjY0MS0yNjQwYy04ODAtODgwLTE3NjAtMTc2Mi0yNjQwLTI2NDBMMjUzIDI4OTciIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJtNjAgMjg5NyAyODMzIDI4MzMgMjgzNC0yODM0TDI4OTQgNjMgNjAgMjg5N3ptNTIxOCAwTDI4OTMgNTI4MCA1MTAgMjg5NiAyODk0IDUxMmwyMzg0IDIzODQiIGZpbGw9InJlZCIvPjxwYXRoIGQ9Ik0yODkyIDE0MjhoLTIwYTQ3NSA0NzUgMCAwIDAtMzAxIDEyMSAyMjkgMjI5IDAgMCAwLTY0IDExM2MtMyAxMS0zIDE0LTMgMzVzMCAyNSAzIDM3YzIgMTQgMTk1IDEzMTQgMTk3IDEzMzZhMjEzIDIxMyAwIDAgMCAyMzkgMTgyIDIxMyAyMTMgMCAwIDAgMTgwLTE4MmMzLTI3IDE5NS0xMzI0IDE5OC0xMzM3IDItMTIgMi0xNiAyLTM1IDAtMjMgMC0zMS01LTQ3YTIzNCAyMzQgMCAwIDAtMTA2LTEzOCA0OTYgNDk2IDAgMCAwLTI5MS04NWgtMzB6bTIwIDIwMTFoLTEyYTMwMiAzMDIgMCAwIDAtMjQzIDE0MSAzMzggMzM4IDAgMCAwLTU1IDIzMiAzNDMgMzQzIDAgMCAwIDExNCAyMTggMzEwIDMxMCAwIDAgMCAxOTkgNzQgMzE2IDMxNiAwIDAgMCAyNTgtMTQxIDM0MSAzNDEgMCAwIDAgNTQtMjM0IDM5MCAzOTAgMCAwIDAtMzItMTEwIDMxNyAzMTcgMCAwIDAtMjgxLTE4MCIvPjwvc3ZnPg==",
        health_hazard: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNzI0IiB3aWR0aD0iNzI0IiB2aWV3Qm94PSIwIDAgOTE5IDkxOSI+PHBhdGggZmlsbD0iI2YwMCIgZD0ibTQ1OS41IDkwOS4zbDQ0OS44LTQ0OS44LTQ0OS44LTQ0OS44LTQ0OS44IDQ0OS44eiIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Im00NTkuNSA4MzgtMzc4LjUtMzc4LjUgMzc4LjUtMzc4LjYgMzc4LjUgMzc4LjZ6Ii8+PHBhdGggZD0ibTQ2MS42IDE3MC4xYy01MyAwLTk2IDQ2LjMtOTYgMTAzLjQgMCAzNy4xIDEzLjg4IDg5LjIgNDAuOTQgMTIxLjFsLTMuMzEgMzMuODYtNzIuNiAyNi4zYzEuMTYgNS42NyA2LjE4IDkuOTMgMTIuMTggOS45MyAxLjA2IDAgMi4wOS0uMTUgMy4wNy0uNCAxLjM4IDUuMzYgNi4yMyA5LjMxIDEyIDkuMzEuNjEgMCAxLjIxLS4wNSAxLjgtLjE0IDEuNDIgNS4zIDYuMjQgOS4yMSAxMiA5LjIxIDEuNjkgMCAzLjMtLjM0IDQuNzctLjk1LjM5IDMuOTggMy43NiA3LjEgNy44NSA3LjEuOCAwIDEuNTgtLjEyIDIuMzEtLjM1IDEgNS44NSA2LjEgMTAuMzEgMTIuMjQgMTAuMzEgNC43OCAwIDguOTMtMi43IDExLTYuNjUgMi4wOSAxLjU5IDQuNjkgMi41NCA3LjUxIDIuNTQgMS44MyAwIDMuNTctLjQxIDUuMTMtMS4xMiAxLjYyIDMuNDQgNC42MyA2LjA5IDguMjkgNy4yMy0uMTQuNDUtLjI1LjkzLS4yNSAxLjQzIDAgMi41MyAyLjA1IDQuNTcgNC41NyA0LjU3czQuNTctMi4wNCA0LjU3LTQuNTdjMC0uNTYtLjExLTEuMDktLjMtMS41OSA1LjMzLTEuODcgOS4xNi02LjkzIDkuMTYtMTIuOSAwLTIuNzMtLjgxLTUuMjctMi4xOS03LjQgMi4yNC0uMyAzLjk2LTIuMTkgMy45Ni00LjUxIDAtMS45Ny0xLjI1LTMuNjQtMy00LjI3IDEuOS0yLjE5IDMuMDctNSAzLjA3LTguMTcgMC0uNTktLjA2LTEuMTgtLjE0LTEuNzUgNC42OS0xLjc4IDgtNi4zMSA4LTExLjYyIDAtMy4zMi0xLjMyLTYuMzItMy40NC04LjU1LjM5LjExLjc5LjE5IDEuMjEuMTkgMi41MiAwIDQuNTYtMi4wNSA0LjU2LTQuNTcgMC0yLjUzLTIuMDQtNC41Ny00LjU2LTQuNTctMSAwLTEuOTIuMzMtMi42OC44OC0uOTEtMS43LTIuNTYtMi45My00LjUyLTMuMjUgMS41NC0yLjUyIDIuNDQtNS40NiAyLjQ0LTguNjMgMC0yLjA1LS4zOS00LTEuMDctNS44MiA0LjcxLTEuNzYgOC4xLTYuMyA4LjEtMTEuNjIgMC0zLjExLTEuMTQtNS45NC0zLTguMTIgMy40NS0xLjE0IDUuOTQtNC4zOSA1Ljk0LTguMjMgMC0zLjE1LTEuNjktNS45LTQuMi03LjQyIDEuMTgtMS40OCAxLjg4LTMuMzQgMS44OC01LjM4IDAtLjUyLS4wNS0xLjAzLS4xNC0xLjUyIDEuOC0uMDkgMy40Ni0uNyA0LjgyLTEuNzItLjExLjU0LS4xNiAxLjA4LS4xNiAxLjY0IDAgMy4wOCAxLjYgNS43OCA0IDcuMzItLjQ4IDEuMzItLjc1IDIuNzQtLjc1IDQuMjIgMCA1LjA3IDMgOS40MSA3LjM2IDExLjM1LS40IDEuNDItLjYzIDIuOTItLjYzIDQuNDYgMCA1LjI2IDIuNDggOS45NCA2LjMzIDEyLjk0LTMuMzcgMS40Ny01LjczIDQuODMtNS43MyA4Ljc0czIuMzUgNy4yNiA1LjcxIDguNzRjLS42NyAxLjE2LTEuMDYgMi41MS0xLjA2IDMuOTUgMCAzLjE2IDEuODUgNS44NyA0LjUzIDcuMTMtLjc3IDEuOTEtMS4yIDMuOTktMS4yIDYuMTcgMCAyLjYyLjYzIDUuMSAxLjczIDcuMy0uNTMuNi0xIDEuMjItMS40NSAxLjg5LS44My0uODQtMS45OC0xLjM2LTMuMjUtMS4zNi0yLjUyIDAtNC41NyAyLjA0LTQuNTcgNC41NyAwIDIuNTIgMi4wNSA0LjU2IDQuNTcgNC41Ni4yMiAwIC40Mi0uMDMuNjMtLjA2LS4wMy40Mi0uMDYuODQtLjA2IDEuMjcgMCAzLjE3LjkxIDYuMTEgMi40NiA4LjYyLTEuMzMgMi41Mi0yLjA5IDUuMzktMi4wOSA4LjQ0IDAgNC42OCAxLjc4IDguOTIgNC42NyAxMi4xNC0uOCAxLjMtMS4yNyAyLjgyLTEuMjcgNC40NiAwIDQuNjcgMy43OCA4LjQ2IDguNDYgOC40NiA0LjE2IDAgNy42MS0zIDguMzItNi45NiAyLjI5LS4yNSA0LjQ0LS45MiA2LjM5LTEuOTMgMSAyLjE3IDMuMiAzLjY5IDUuNzUgMy42OSAzLjUxIDAgNi4zNS0yLjg0IDYuMzUtNi4zNSAwLTIuNjUtMS42NC00LjkyLTMuOTUtNS44Ny42NC0xLjM4IDEuMS0yLjg3IDEuMzgtNC40MSAxLjM3LjM3IDIuOC41OCA0LjI5LjU4LjE4IDAgLjM3LS4wMi41Ni0uMDIgMS4xMSAyLjg2IDMuODkgNC44OCA3LjE1IDQuODggMi41IDAgNC43Mi0xLjIgNi4xMi0zLjA2Ljc5IDIuODggMy40MiA1IDYuNTYgNSAyLjM3IDAgNC40Ni0xLjIyIDUuNjgtMy4wNyAxLjMyLjgxIDIuODYgMS4yOSA0LjUzIDEuMjkgNC43OSAwIDguNjctMy44OSA4LjY3LTguNjggMC0xLjYtLjQ0LTMuMDktMS4yLTQuMzguNjYuMjIgMS4zNy4zMyAyLjA5LjMzIDMuNzYgMCA2LjgxLTMuMDQgNi44MS02LjggMC0uMzItLjAzLS42My0uMDgtLjk0IDEuNDUgMi43OSA0LjM1IDQuNjkgNy43MSA0LjY5IDQuNzMgMCA4LjU3LTMuNzggOC42Ni04LjQ5IDIuMjYtMS40IDMuODQtMy44MSA0LjA5LTYuNi40NC4xNS45LjI0IDEuMzkuMjQgMi41MiAwIDQuNTctMi4wNCA0LjU3LTQuNTcgMC0uNTItLjA5LTEuMDMtLjI2LTEuNWwtNi45NC0yLjIzLTcyLjUtMjMuMzQtLjI5LTMwLjk1YzExLTExLjg0IDE5LjU5LTI3LjEgMjUuODEtNDMuNjkgMTEuNzgtMzEuNCAxOC4xLTY0LjYgMTguMS04MS45OCAwLTQ1LTQzLTEwMy40LTk2LTEwMy40em0tMTQ4LjYgMjkxLjljLTEuMjUgMC0yLjQyLjM2LTMuNDEuOTctMTcuMjUgNi42MS0zMS41NyAxMi4xLTM3IDE0LjMtMTIuMTcgNC44Ni0yMS4yIDE3Ljg3LTIxLjIgMzAuNzZ2NDEuNTRsNjcuMyA2OC4zYy42OC4xNSAxLjQuMjIgMi4xMy4yMiAzLjczIDAgNi45OS0yLjAzIDguNzMtNSAxLjM1LjUxIDIuODIuOCA0LjM1LjggNi44NyAwIDEyLjQ0LTUuNTcgMTIuNDQtMTIuNDQgMC0uNDktLjA0LS45OC0uMDktMS40NSAxLjg0IDIuMjggNC42NiAzLjc0IDcuODMgMy43NCA1LjU2IDAgMTAuMS00LjUxIDEwLjEtMTAuMSAwLTEuNTEtLjM0LTIuOTMtLjkzLTQuMjEgMi0uNzEgMy43NC0yLjA0IDQuOTQtMy43NiAxLjI4IDEuMzEgMy4wNiAyLjEyIDUgMi4xMiAzLjg5IDAgNy4xLTMuMTYgNy4xLTcgMC0yLjAzLS44Ni0zLjg1LTIuMjMtNS4xNCAyLjU4LTEuMjUgNC41NC0zLjU3IDUuMzEtNi4zOSAxLjYyIDEuNzggMy44NyAyLjk4IDYuMzkgMy4yNC0xIDEuMjMtMS42MyAyLjgtMS42MyA0LjUyIDAgMy44OSAzLjE2IDcgNy4xIDdzNy4xLTMuMTYgNy4xLTdjMC0zLjE5LTIuMTItNS44OC01LTYuNzUgMi4yNC0xLjg1IDMuNjctNC42NSAzLjY3LTcuNzggMC0uOTMtLjEzLTEuODEtLjM3LTIuNjYuMzEuMDIuNjIuMDQuOTMuMDQgMS40MiAwIDIuNzctLjI5IDMuOTktLjgyLjExIDIuNzEgMi4zMiA0Ljg4IDUuMDYgNC44OCAyLjggMCA1LjA4LTIuMjggNS4wOC01LjA4IDAtMi43NC0yLjE3LTQuOTUtNC44OS01LjA2LjUzLTEuMjIuODMtMi41Ny44My0zLjk5IDAtLjg3LS4xMy0xLjctLjM0LTIuNSAyLjUzIDAgNC41OC0yLjA0IDQuNTgtNC41NyAwLTIuNTItMi4wNS00LjU2LTQuNTgtNC41Ni0uMTMgMC0uMjUuMDItLjM4LjAzLS4yNi0zLjgtMi4yMi03LjEzLTUuMTMtOS4yMy4wMDEtLjI5LjA0LS41OC4wNC0uODggMC02Ljg3LTUuNTctMTIuNDMtMTIuNDQtMTIuNDMtMi4zOSAwLTQuNjIuNjgtNi41MSAxLjg2LjI3LS43Mi40Mi0xLjUuNDItMi4zMSAwLTMuNi0yLjkxLTYuNTItNi41MS02LjUyLS42NSAwLTEuMjYuMS0xLjg1LjI3LjA5LS41OC4xNC0xLjE4LjE0LTEuNzggMC02Ljg3LTUuNTYtMTIuNDQtMTIuNDMtMTIuNDQtMi4xMyAwLTQuMTMuNTMtNS44OCAxLjQ3LTEuNTctMi41Ni00LTQuNS02Ljk3LTUuMzkuMzctLjgyLjU5LTEuNzQuNTktMi43IDAtMy42LTIuOTItNi41Mi02LjUyLTYuNTItLjg1IDAtMS42NS4xNy0yLjM5LjQ2LS4wNS02LjgzLTUuNTktMTIuMzUtMTIuNDMtMTIuMzUtMS4xMSAwLTIuMTcuMTYtMy4xOS40My0uOTktMi4zMy0zLjMtMy45Ny02LTMuOTctMS41OSAwLTMuMDQuNTctNC4xNyAxLjUyLS40NC0zLjE4LTMuMTUtNS42My02LjQ1LTUuNjNtMzA0LjMgMS40NmMtMy4wNi4yNC01LjU1IDIuNDktNi4xNCA1LjQ0LS45My0uNDgtMS45OC0uNzUtMy4xLS43NS0zLjc2IDAtNi44IDMuMDQtNi44IDYuOCAwIC4zNy4wMy43My4wOSAxLjA4LTIuMDctMS41NC00LjYzLTIuNDYtNy40MS0yLjQ2LTYuODcgMC0xMi40NCA1LjU2LTEyLjQ0IDEyLjQzdi4wNmMtMS4yNi0uMy0yLjU3LS40OS0zLjkzLS40OS05LjEgMC0xNi40MSA3LjM1LTE2LjQxIDE2LjQyIDAgLjg1LjA4IDEuNjguMjEgMi41LS45Ny0uNDMtMi4wNC0uNjctMy4xNi0uNjctMi41OSAwLTQuODggMS4yNi02LjMyIDMuMTgtMS40OS0uNDktMy4wNy0uNzYtNC43Mi0uNzYtOC4wOSAwLTE0LjY3IDYuMzktMTUgMTQuNC0uNTItLjExLTEuMDUtLjE2LTEuNi0uMTYtNC4zNSAwLTcuODggMy41My03Ljg4IDcuODggMCAxLjMzLjMzIDIuNTcuOSAzLjY3LTEuMjUtLjcxLTIuNy0xLjEyLTQuMjQtMS4xMi00Ljc5IDAtOC42OCAzLjg5LTguNjggOC42OCAwIDIuNSAxLjA3IDQuNzUgMi43NiA2LjMzdi4wOGMtMiAuMi0zLjY4IDEuNTUtNC4zMiAzLjM5LS4yNi41Ny0uNCAxLjItLjQgMS44NiAwIDEuNi44MyAzIDIuMDggMy44My44Ny42NyAxLjk0IDEuMDggMy4xMiAxLjA4IDIuMTggMCA0LTEuMzcgNC43Ni0zLjI5IDEuMTguNjQgMi41MyAxIDMuOTcgMSAuNjUgMCAxLjI4LS4wOCAxLjg5LS4yMi0uMDUuNTItLjA4IDEuMDUtLjA4IDEuNTkgMCAxLjk4LjM5IDMuODcgMS4wOSA1LjYxLTIuOC42Ni00Ljg5IDMuMTYtNC44OSA2LjE2IDAgLjkzLjIgMS44LjU2IDIuNTkuOSAyLjI5IDMuMTIgMy45MiA1LjczIDMuOTIgMi4xNyAwIDQuMDYtMS4xMiA1LjE2LTIuOC40MS0uNTguNzQtMS4yMS45NS0xLjkgMS45NS45MyA0LjEzIDEuNDYgNi40NCAxLjQ2LjcyIDAgMS40MS0uMDcgMi4xLS4xNi0uNDEgMS4wOS0uNjQgMi4yNy0uNjQgMy41MSAwIDEuNjMuNCAzLjE2IDEuMDkgNC41Mi0uMzItLjA2LS42NS0uMS0uOTktLjEtMi44IDAtNS4wOCAyLjI3LTUuMDggNS4wOCAwIDIuOCAyLjI4IDUuMDggNS4wOCA1LjA4IDIuNTMgMCA0LjYxLTEuODYgNC45OS00LjI4IDEuMzcgNS4zOCA2LjI0IDkuMzYgMTIgOS4zNiAyLjYxIDAgNS0uOCA3LTIuMTcuNiA0Ljk5IDQuODUgOC44NiAxMCA4Ljg2IDIuNjIgMCA1LTEgNi44LTIuNjYtLjAyLjMtLjA1LjYxLS4wNS45MiAwIDYuODYgNS41NyAxMi40MyAxMi40NCAxMi40MyAyLjM1IDAgNC41NC0uNjYgNi40Mi0xLjgtLjk0IDEuMjgtMS41IDIuODYtMS41IDQuNTcgMCA0LjI5IDMuNDcgNy43NiA3Ljc1IDcuNzYgMi41OSAwIDQuODgtMS4yOCA2LjI5LTMuMjJsNjcuMy02MS45OXYtNDUuNGMwLTEzLjc3LTE0LjgyLTMwLjk4LTMyLjc0LTM3LjEtNC0xLjM3LTMwLjU2LTEwLTMwLjU2LTEwbS0xNTMuNCA2Yy0zLjUxIDAtNi4zNSAyLjg0LTYuMzUgNi4zNSAwIDIuNDIgMS4zNyA0LjUgMy4zNyA1LjU3LTEuOTEuNTUtMy4zMSAyLjI5LTMuMzEgNC4zNyAwIDIuNTMgMi4wNSA0LjU3IDQuNTcgNC41N3M0LjU3LTIuMDQgNC41Ny00LjU3YzAtMS41Mi0uNzUtMi44Ni0xLjktMy42OSAzLjA1LS40NiA1LjM5LTMuMDcgNS4zOS02LjI1IDAtMy41MS0yLjg0LTYuMzUtNi4zNC02LjM1bS0yMi43IDUuODlsLS4wMy4yNy0uMzItLjE3Yy4xMi0uMDMuMjQtLjA3LjM1LS4xbTEzLjc4IDIxLjYxYy0yLjUzIDAtNC41NyAyLjA1LTQuNTcgNC41N3MyLjA0IDQuNTcgNC41NyA0LjU3YzIuNTIgMCA0LjU3LTIuMDUgNC41Ny00LjU3cy0yLjA1LTQuNTctNC41Ny00LjU3bS00Mi4xIDQuODZjLTMuNiAwLTYuNTIgMi45Mi02LjUyIDYuNTJzMi45MiA2LjUxIDYuNTIgNi41MSA2LjUyLTIuOTEgNi41Mi02LjUxLTIuOTItNi41Mi02LjUyLTYuNTJtNzMuODYgMTEuNThjLTIuODEgMC01LjEgMi4yOS01LjEgNS4xIDAgMi44MiAyLjI5IDUuMTEgNS4xIDUuMTEuNDEgMCAuODEtLjA2IDEuMTgtLjE2LjE5IDMuNiAzLjE1IDYuNDYgNi43OSA2LjQ2LjUgMCAuOTgtLjA2IDEuNDUtLjE2IDMuMTYtLjM2IDUuNjItMyA1LjYyLTYuMjcgMC0xLjE2LS4zMy0yLjIzLS44Ny0zLjE3LTEuMDctMi4zNi0zLjQ0LTQtNi4yLTQtMS4xMiAwLTIuMTcuMjctMy4xLjc1LS42My0yLjEtMi41Ni0zLjY1LTQuODctMy42NW0tNzAuODUgMTEuNjdjLTIuNTMgMC00LjU3IDIuMDUtNC41NyA0LjU3IDAgMi41MyAyLjA0IDQuNTcgNC41NyA0LjU3Ljk2IDAgMS44Ni0uMyAyLjYtLjgyLjE3IDMuMzYgMi45MSA2IDYuMzEgNiAzLjUxIDAgNi4zNS0yLjg0IDYuMzUtNi4zNSAwLTMuNS0yLjg0LTYuMzQtNi4zNS02LjM0LTEuNzUgMC0zLjMzLjcxLTQuNDggMS44NS0uNDgtMi0yLjI4LTMuNTEtNC40My0zLjUxbTg5IDMyLjUxYy0zLjc2IDAtNi44IDMuMDQtNi44IDYuOCAwIC44Ni4xNiAxLjY4LjQ1IDIuNDQtMi40Ni4zNC00LjM3IDIuNDQtNC4zNyA1IDAgLjcyLjE2IDEuNC40MyAyIC43MSAxLjc5IDIuNDUgMy4wNyA0LjUgMy4wN2guMTNjMi44MiAwIDUuMS0yLjI4IDUuMS01LjA4IDAtLjIzLS4wNC0uNDUtLjA3LS42Ny4yMS4wMi40Mi4wMy42My4wMyAzLjc2IDAgNi44LTMuMDQgNi44LTYuOHMtMy4wNC02LjgtNi44LTYuOG0tNTMuMyA4LjU4Yy0zLjUxIDAtNi4zNSAyLjg1LTYuMzUgNi4zNSAwIDMuNTEgMi44NCA2LjM1IDYuMzUgNi4zNSAzLjUgMCA2LjM0LTIuODQgNi4zNC02LjM1IDAtMy41LTIuODQtNi4zNS02LjM0LTYuMzVtLTM3IC45M2MtMi44IDAtNS4wOCAyLjI3LTUuMDggNS4wOCAwIDIuOCAyLjI4IDUuMDcgNS4wOCA1LjA3czUuMDctMi4yNyA1LjA3LTUuMDdjMC0yLjgxLTIuMjctNS4wOC01LjA3LTUuMDhtNy40NCAxMy43OGMtMy44OSAwLTcuMSAzLjE2LTcuMSA3IDAgMy41NCAyLjYxIDYuNDYgNiA2Ljk3LS4wMi4yNi0uMDUuNTItLjA1Ljc5LTIuMTYtMS43OC00LjkyLTIuODYtNy45NC0yLjg2LTQuNTIgMC04LjQ3IDIuNDMtMTAuNjUgNi0xLjg0LTIuMDMtNC40OS0zLjMxLTcuNDUtMy4zMS00LjcgMC04LjY0IDMuMjItOS43NSA3LjU4LTEuNjItMS4xMS0zLjU3LTEuNzUtNS42OC0xLjc1LTUuNTYgMC0xMC4xIDQuNS0xMC4xIDEwLjEgMCAuNzguMDkgMS41My4yNiAyLjI2LTIuNjctMi40My02LjIxLTMuOTMtMTAuMS0zLjkzLTYuMjEgMC0xMS41MyAzLjc2LTEzLjgzIDkuMTItMS42Mi0xLjEtMy41Ny0xLjc1LTUuNjgtMS43NS01LjU2IDAtMTAuMSA0LjUtMTAuMSAxMC4xIDAgLjgxLjEgMS42LjI4IDIuMzVsMTIyLjIgMTI0LjFjMS42LS42NyAyLjcyLTIuMjUgMi43Mi00LjA5IDAtMS43NC0xLjAyLTMuMjMtMi40OC0zLjk2IDEuNzMtLjYxIDIuOTgtMi4yMyAyLjk4LTQuMTcgMC0xLjgzLTEuMTEtMy40LTIuNjktNC4wOCAxLjU3LTEuMDMgMi42LTIuOCAyLjYtNC44MSAwLTIuNzUtMS45Mi01LTQuNDktNS42MiA1LjExLTMuNTMgOC40Ny05LjQyIDguNDctMTYuMSAwLTQuMTMtMS4yOC03Ljk1LTMuNDYtMTEuMSAzLjUyLTIuMiA1Ljg2LTYuMSA1Ljg2LTEwLjU1IDAtNS0yLjk4LTkuMzUtNy4yNy0xMS4zMSAxLjY5LTEuMjkgMi43OC0zLjMxIDIuNzgtNS42IDAtMi4zOS0xLjE5LTQuNS0zLTUuNzggMS4wMy0xLjIyIDEuNjQtMi43OSAxLjY0LTQuNTEgMC0zLjg5LTMuMTYtNy03LjEtNy0uNTkgMC0xLjE1LjA4LTEuNy4yMS43OS0xLjYzIDEuMjUtMy40NiAxLjI1LTUuNCAwLTEuODEtLjQtMy41My0xLjEtNS4wOCAzLjY2LS4yNiA2LjU0LTMuMyA2LjU0LTcgMC0zLTEuOTItNS42MS00LjYxLTYuNiAyLjYzLTIuMjggNC4zMS01LjY0IDQuMzEtOS40IDAtNC4zLTIuMTgtOC4wOS01LjUtMTAuMzIgMS45Mi0yLjE5IDMuMS01LjA2IDMuMS04LjIgMC0yLjc1LS45LTUuMjgtMi40Mi03LjM0IDEuOTYtLjcgMy4zNy0yLjU2IDMuMzctNC43NiAwLTIuOC0yLjI3LTUuMDgtNS4wOC01LjA4LTEuNzEgMC0zLjIyLjg2LTQuMTQgMi4xNi0yLjI3LTIuODEtNS43NS00LjYxLTkuNjUtNC42MS0xLjgzIDAtMy41NS40LTUuMTEgMS4xLTEuMTktMi4yMS0zLjUzLTMuNzItNi4yMi0zLjcyem02OS4xIDIuMDNjLTQuNjcgMC04LjQ2IDMuNzktOC40NiA4LjQ2IDAgMS40NC4zNyAyLjggMSAzLjk4LTEuMjItMS0yLjc4LTEuNjEtNC40OC0xLjYxLTMuOSAwLTcuMSAzLjE1LTcuMSA3IDAgMy4zNSAyLjM0IDYuMTUgNS40OCA2Ljg2LS45MiAxLjc0LTEuNDUgMy43MS0xLjQ1IDUuODEgMCA0IDEuOTMgNy42MSA0LjkxIDkuODgtMS4xNCAyLjEyLTEuNzkgNC41NC0xLjc5IDcuMTEgMCAzLjk5IDEuNTYgNy42MSA0LjEgMTAuMy0uODMgMS44Ny0xLjMgMy45My0xLjMgNi4xIDAgLjg0LjA5IDEuNjYuMjIgMi40Ni0xLjAyLS43LTIuMjMtMS4xNi0zLjU0LTEuMjUuODYtMS4xNyAxLjM4LTIuNjEgMS4zOC00LjE3IDAtMy45LTMuMTYtNy03LjEtNy0zLjkgMC03LjEgMy4xNS03LjEgNyAwIDEuODcuNzIgMy41NiAxLjkxIDQuODItMi45NS44NC01LjEyIDMuNTYtNS4xMiA2Ljc4IDAgMy44OSAzLjE2IDcgNy4xIDcgLjIyIDAgLjQzLS4wNC42NS0uMDYtMS4zIDIuMjItMi4wNiA0LjgxLTIuMDYgNy41NyAwIDUuMjUgMi42OSA5Ljg2IDYuNzYgMTIuNTUtNS4zOCAyLjI5LTkuMTYgNy42My05LjE2IDEzLjg1IDAgNC41MSAxLjk5IDguNTUgNS4xNCAxMS4zMS0zLjI2IDIuMjQtNS40IDUuOTktNS40IDEwLjI0IDAgMS43NC4zNiAzLjM5IDEgNC44OS0uOTEgMS41MS0xLjQ0IDMuMjctMS40NCA1LjE2IDAgMi4xOC43MSA0LjIgMS44OSA1Ljg1LTEuMDIuODEtMS42OSAyLjA1LTEuNjkgMy40NiAwIDEuNTIuNzcgMi44NyAxLjk0IDMuNjctMS4yMi43OS0yIDIuMTUtMiAzLjcxIDAgLjI4LjAzLjU2LjA4LjgzLTEgLjgxLTEuNjggMi4wNC0xLjY4IDMuNDUgMCAxLjg0IDEuMTIgMy40MSAyLjcxIDQuMDlsMTMxLjctMTIxLjZjLjI2LS43NC40MS0xLjUzLjQxLTIuMzYgMC0zLjktMy4xNi03LTctNy0xLjIxIDAtMi4zNS4zMS0zLjM0Ljg0LTEuMjItNC4xOS01LjA5LTcuMjUtOS42Ny03LjI1LTEuOTggMC0zLjgxLjU4LTUuMzcgMS41Ni4wMi0uMjYuMDQtLjUxLjA0LS43NyAwLTYuODctNS41Ny0xMi40NC0xMi40NC0xMi40NC0xLjYxIDAtMy4xNC4zMi00LjU1Ljg4LS4xOC0zLjc0LTMuMjUtNi43Mi03LTYuNzItMy45IDAtNyAzLjE2LTcgNy4xIDAgLjMuMDIuNi4wNi44OS0xLjc3LTIuODgtNC45NS00LjgxLTguNTgtNC44MS0uNTggMC0xLjE0LjA2LTEuNjkuMTUtLjA4LTYuOC01LjYxLTEyLjI5LTEyLjQzLTEyLjI5LS43IDAtMS4zNy4wNy0yLjA0LjE4LS4zMy0zLjU4LTMuMzUtNi4zOC03LTYuMzgtMy4wNCAwLTUuNjIgMS45Mi02LjYyIDQuNjEtLjMxLS4wMi0uNjItLjA0LS45NC0uMDQtMS40MiAwLTIuNzkuMjEtNC4wOS41Ny0xLjIxLTMuMTktNC4yOS01LjQ3LTcuOTEtNS40N3ptLTI4LjIgMjcuNzNjLTIuODEgMC01LjA4IDIuMjgtNS4wOCA1LjA4IDAgMS41Mi42OCAyLjg2IDEuNzMgMy43OS0xLjM2IDEuMjgtMi4yMSAzLjEtMi4yMSA1LjEyIDAgMy44OSAzLjE2IDcgNy4xIDcgMy45IDAgNy4xLTMuMTYgNy4xLTcgMC0yLjg2LTEuNy01LjMxLTQuMTUtNi40Mi40Mi0uNzQuNjgtMS41OC42OC0yLjQ5IDAtMi44LTIuMjctNS4wOC01LjA3LTUuMDgiLz48L3N2Zz4=",
        environmental: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBoZWlnaHQ9IjcyNCIgd2lkdGg9IjcyNCIgdmlld0JveD0iMCAwIDczNSA3MzUiPgo8cGF0aCBkPSJtMzY3LjUgNzI3LjRsMzYwLTM2MC0zNjAtMzYwLTM2MCAzNjB6IiBmaWxsPSIjZjAwIi8+CjxwYXRoIGQ9Im0zNjcuNSA2NzAuMy0zMDIuOC0zMDIuOGwzMDIuOC0zMDIuOCAzMDIuOCAzMDIuOHoiIGZpbGw9IiNmZmYiLz4KPGcgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjUiPgo8cGF0aCBkPSJtMjIzLjcgMzY3LjJoMjgxLjIiLz4KPHBhdGggc3Ryb2tlLXdpZHRoPSI0IiBkPSJtNDYyLjcgNDE4IDMyLjk4IDIzLjc5LTMxLjM2IDE1LjEgNDIuMiAzLjc5LTExLjM2IDE1LjFoMjMuM2wuNTQgMTYuNzYtMjk0LjItMS42MDVzNDkuMi0xNC41OCA1Ny4zLTguNjM1YzEwLjgyLTQuODcgODkuOC0zOC40IDg5LjgtMzYuMm0tNzUuNzItMjUuOTggMS42Mi04NS40LTQyLjcyLTIzLjJzLTYuNDktNC4zMy0xNS42OC0xLjYyYy0zLjI1IDEuMDgtNy41NyAyLjE2LTcuNTcgMi4xNnMyMy4zLTE5LjQ3IDI3LjU4LTE3Ljg0YzQuMzMgMS42MiAzNC42MSAxNi4yMiAzNC42MSAxNi4yMnMtMy4yNS0yMi43MS0xMS4zNi0yOS4yLTM5LjQ3LTMxLjM2LTM5LjQ3LTMxLjM2di01Ljk1bDQyLjcyIDI1Ljk2czEuNjItMjQuODctNy0zOS40N2MtOC42NS0xNC42LTE1LjEtMjcuNTgtMTUuMS0yNy41OGwyLjctMi4xNiAyMS4xIDMyLjQ0IDctMjIuMiA0LjMzLTEuMDhzLTUuNDEgMzEuMzYtMS42MiA0MS4xYzMuNzkgOS43MyAxNy44NCA2Mi43MyAxNy44NCA2Mi43M2wyMS4xLTMwLjNzLjU0LTEyLjQ0LS41NC0yMS4xYy0xLjA4LTguNjUtMi43LTQ4LjY3LTIuNy00OC42N2gzLjc5bDUuOTUgNDMuOCAzNC4xLTM5LjQ3djQuMzNzLTMzLjUxIDQyLjItMzEuODkgNTEuNGMxLjYyIDkuMTkgMy4yNCAxNC42LTIuNyAyNy41OHMtOS43MyAyMi4yLTkuNzMgMjIuMiAxNy44NC0yMS4xIDI1Ljk2LTIyLjcxYzguMTEtLjU0IDE4LjkxLjU0IDI2LjQ4LTUuOTVzMjUuOTYtMjcgMjUuOTYtMjdsLTI4LjY2IDQ0LjNzLTEzLjUxLjU0LTE4LjkxIDYuNDljLTUuNDEgNS45NS0yNy41OCAzMS4zNi0yNy41OCAzMS4zNnY1OC40bDM2Ljc2IDE4LjM4LTQ0Ljg3IDYuNDktMTAuODIgMTUuNjgtMTQuNi0xMi40NC00MC42MiAzLjczNXoiLz4KPHBhdGggZmlsbD0iI2ZmZiIgZD0ibTM1NS4yIDQ0NS4xYzEwLjI5LTQuMjkgMjctMTEuMzYgMzYuNzYtMjUuNDIgMTAuMS0xNC41NCA0NS45Ni03NS43IDk1LjItNzAuOC0yLjcgNi40OS0xMS4zNiAyMC41NS0xMS4zNiAyMC41NWwzNS4xLTEwLjgycy41NCA0Ni41LTY1Ljk3IDc2LjJjLTMwLjgyIDEwLjgyLTM3LjMgMTEuMzYtNDAgMTUuMS0yLjcgMy43OS0xNS4xIDIyLjcxLTE1LjEgMjIuNzFsLTU1LjE0LTI0LjNzMTQuMDYtLjUxNSAyMC41MS0zLjIxNXoiLz4KPC9nPgo8ZWxsaXBzZSBjeT0iMzg1LjgiIGN4PSI0ODQuMyIgcng9IjUuOTUiIHJ5PSI1LjEzIi8+Cjwvc3ZnPgo="
      };
      ghsBadges = `<div style="display: flex; gap: 6px; margin-top: 4px; flex-wrap: wrap;">` + 
        item.ghs.map(g => {
          const url = ghsUrls[g];
          return url ? `<img src="${url}" alt="${g}" style="width: 20px; height: 20px;" title="${g}">` : "";
        }).filter(html => html !== "").join("") + 
        `</div>`;
    }

    rowsHtml += `
      <tr class="table-clickable-row" onclick="showItemDetail(event, '${item.code}')" style="cursor: pointer;" title="คลิกเพื่อดูรายละเอียด">
        <td data-label="รายการ">
          <div class="product-cell">
            <span class="product-code">${item.code}</span>
            <span class="product-name">${formatItemName(item.name)}</span>
            <span class="product-cat">${item.category}</span>
            ${ghsBadges}
          </div>
        </td>
        <td data-label="จำนวนคงเหลือ" style="font-weight: 600; font-size: 14px;">${item.qty} ${item.unit}</td>
        <td data-label="วันหมดอายุ">
          <span style="${status === 'expired' ? 'color: var(--accent-red); font-weight: 600;' : ''}">
            ${formatThaiDate(item.expiry)}
          </span>
        </td>
        <td data-label="สถานที่จัดเก็บ" style="color: var(--text-muted); font-size: 12px;">${locationText}</td>
        <td data-label="สถานะ">${getStatusBadgeMarkup(status)}</td>
        ${isAdminLoggedIn ? `
        <td data-label="จัดการ">
          <div class="table-actions">
            <button class="action-icon-btn edit" onclick="editItem(${originalIndex})" title="แก้ไขรายการ">
              <i data-lucide="edit-3" style="width: 14px; height: 14px;"></i>
            </button>
            <button class="action-icon-btn delete" onclick="deleteItem(${originalIndex})" title="ลบรายการ">
              <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
            </button>
          </div>
        </td>
        ` : ""}
      </tr>
    `;
  });

  tableBody.innerHTML = rowsHtml;
}

// Setup pagination controls
function setupFilterHandlers() {
  document.getElementById("filterSearch").addEventListener("input", () => {
    currentPage = 1;
    renderItemsTable();
    lucide.createIcons();
  });
  
  document.getElementById("filterCategory").addEventListener("change", () => {
    currentPage = 1;
    renderItemsTable();
    lucide.createIcons();
  });
  
  document.getElementById("filterStatus").addEventListener("change", () => {
    currentPage = 1;
    renderItemsTable();
    lucide.createIcons();
  });

  document.getElementById("btnPrevPage").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderItemsTable();
      lucide.createIcons();
    }
  });

  document.getElementById("btnNextPage").addEventListener("click", () => {
    currentPage++;
    renderItemsTable();
    lucide.createIcons();
  });
}

// 3. Notifications Panel: Group details rendering
function renderNotificationsList(stats) {
  const expiredList = document.getElementById("alertListExpired");
  const nearExpiryList = document.getElementById("alertListNearExpiry");
  const lowStockList = document.getElementById("alertListLowStock");

  // Update counts in header badges
  document.getElementById("alertCountExpired").innerText = stats.expired;
  document.getElementById("alertCountNearExpiry").innerText = stats.nearExpiry;
  document.getElementById("alertCountLowStock").innerText = stats.lowStock;

  let expiredHtml = "";
  let nearExpiryHtml = "";
  let lowStockHtml = "";

  items.forEach(item => {
    const status = getItemStatus(item);
    const index = items.findIndex(i => i.code === item.code);
    const storageStr = [item.room, item.cabinet, item.shelf].filter(Boolean).join(" > ") || "-";

    if (status === "expired") {
      expiredHtml += `
      <div class="notification-item status-expired">
        <div class="notification-header">
          <div class="notification-title-group">
            <span class="notification-title">${getItemDisplayName(item)}</span>
            <span class="notification-code">${item.code}</span>
          </div>
          ${isAdminLoggedIn ? `<button class="action-icon-btn edit" onclick="editItem(${index})" title="อัปเดตข้อมูล"><i data-lucide="edit-3" style="width: 14px; height: 14px;"></i></button>` : ""}
        </div>
        <div class="notification-meta">
          <span class="notification-location">
            <i data-lucide="map-pin" style="width: 12px; height: 12px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i>
            จัดเก็บ: ${storageStr}
          </span>
        </div>
        <div class="notification-alert-banner expired">
          <i data-lucide="alert-triangle" style="width: 14px; height: 14px; flex-shrink: 0;"></i>
          <span><strong>หมดอายุแล้วเมื่อ:</strong> ${formatThaiDate(item.expiry)} (คงเหลือ: ${item.qty} ${item.unit})</span>
        </div>
      </div>
      `;
    } else if (status === "near-expiry") {
      const expDate = new Date(item.expiry);
      const diffTime = expDate - TODAY;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      nearExpiryHtml += `
      <div class="notification-item status-near-expiry">
        <div class="notification-header">
          <div class="notification-title-group">
            <span class="notification-title">${getItemDisplayName(item)}</span>
            <span class="notification-code">${item.code}</span>
          </div>
          ${isAdminLoggedIn ? `<button class="action-icon-btn edit" onclick="editItem(${index})" title="อัปเดตข้อมูล"><i data-lucide="edit-3" style="width: 14px; height: 14px;"></i></button>` : ""}
        </div>
        <div class="notification-meta">
          <span class="notification-location">
            <i data-lucide="map-pin" style="width: 12px; height: 12px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i>
            จัดเก็บ: ${storageStr}
          </span>
        </div>
        <div class="notification-alert-banner near-expiry">
          <i data-lucide="clock" style="width: 14px; height: 14px; flex-shrink: 0;"></i>
          <span><strong>จะหมดอายุใน ${diffDays} วัน:</strong> ${formatThaiDate(item.expiry)} (คงเหลือ: ${item.qty} ${item.unit})</span>
        </div>
      </div>
      `;
    } else if (status === "low-stock") {
      lowStockHtml += `
      <div class="notification-item status-low-stock">
        <div class="notification-header">
          <div class="notification-title-group">
            <span class="notification-title">${getItemDisplayName(item)}</span>
            <span class="notification-code">${item.code}</span>
          </div>
          ${isAdminLoggedIn ? `<button class="action-icon-btn edit" onclick="editItem(${index})" title="อัปเดตสต็อก"><i data-lucide="edit-3" style="width: 14px; height: 14px;"></i></button>` : ""}
        </div>
        <div class="notification-meta">
          <span class="notification-location">
            <i data-lucide="map-pin" style="width: 12px; height: 12px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i>
            จัดเก็บ: ${storageStr}
          </span>
        </div>
        <div class="notification-alert-banner low-stock">
          <i data-lucide="package" style="width: 14px; height: 14px; flex-shrink: 0;"></i>
          <span><strong>ใกล้หมดคลัง:</strong> คงเหลือ ${item.qty} ${item.unit} (จุดสั่งซื้อขั้นต่ำ: ${item.minAlert} ${item.unit})</span>
        </div>
      </div>
      `;
    }
  });

  // Expired Items Section output
  if (expiredHtml) {
    expiredList.innerHTML = expiredHtml;
  } else {
    expiredList.innerHTML = `
      <div class="empty-state" style="padding: 24px;">
        <div class="empty-state-text">🎉 ไม่มีรายการสารเคมีหรืออุปกรณ์หมดอายุ</div>
      </div>
    `;
  }

  // Near Expiry Items Section output
  if (nearExpiryHtml) {
    nearExpiryList.innerHTML = nearExpiryHtml;
  } else {
    nearExpiryList.innerHTML = `
      <div class="empty-state" style="padding: 24px;">
        <div class="empty-state-text">🎉 ไม่มีรายการพัสดุใกล้หมดอายุใน 30 วัน</div>
      </div>
    `;
  }

  // Low Stock Items Section output
  if (lowStockHtml) {
    lowStockList.innerHTML = lowStockHtml;
  } else {
    lowStockList.innerHTML = `
      <div class="empty-state" style="padding: 24px;">
        <div class="empty-state-text">🎉 จำนวนสินค้าพัสดุทุกรายการอยู่ในเกณฑ์ปลอดภัย</div>
      </div>
    `;
  }
}

// ==========================================================================
// BACKEND API AJAX CRUD WRAPPERS
// ==========================================================================

async function createItemBackend(itemData) {
  if (isFirebaseOnline) {
    try {
      await db.collection("items").doc(itemData.code).set(itemData);
      items.push(itemData);
      return true;
    } catch (err) {
      console.error("🔥 Firebase write failed:", err);
      showToast("เกิดข้อผิดพลาดในการเขียนข้อมูลไปยัง Firebase", "error");
      return false;
    }
  }

  if (isBackendOnline) {
    try {
      const response = await fetch(`${API_BASE}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData)
      });
      if (response.ok) {
        const savedItem = await response.json();
        items.push(savedItem);
        return true;
      } else {
        const errData = await response.json();
        showToast(errData.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล", "error");
        return false;
      }
    } catch (err) {
      console.error("Backend write failed, using LocalStorage fallback:", err);
    }
  }

  // Fallback
  items.push(itemData);
  saveItemsToLocal();
  return true;
}

async function updateItemBackend(code, itemData, index) {
  if (isFirebaseOnline) {
    try {
      await db.collection("items").doc(code).set(itemData);
      items[index] = itemData;
      return true;
    } catch (err) {
      console.error("🔥 Firebase update failed:", err);
      showToast("เกิดข้อผิดพลาดในการอัปเดตข้อมูลไปยัง Firebase", "error");
      return false;
    }
  }

  if (isBackendOnline) {
    try {
      const response = await fetch(`${API_BASE}/items/${encodeURIComponent(code)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData)
      });
      if (response.ok) {
        const updatedItem = await response.json();
        items[index] = updatedItem;
        return true;
      } else {
        const errData = await response.json();
        showToast(errData.error || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล", "error");
        return false;
      }
    } catch (err) {
      console.error("Backend update failed, using LocalStorage fallback:", err);
    }
  }

  // Fallback
  items[index] = itemData;
  saveItemsToLocal();
  return true;
}

// ==========================================================================
// FORM SUBMIT / CREATE / UPDATE / DELETE HANDLERS
// ==========================================================================
function setupFormHandlers() {
  const form = document.getElementById("itemForm");
  const btnReset = document.getElementById("btnResetForm");
  const btnCancelEdit = document.getElementById("btnCancelEdit");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!isAdminLoggedIn) {
      showToast("กรุณาเข้าสู่ระบบในฐานะผู้ดูแลระบบก่อนบันทึกข้อมูล", "error");
      return;
    }

    const code = document.getElementById("itemCode").value.trim();
    const name = document.getElementById("itemName").value.trim();
    const category = document.getElementById("itemCategory").value;
    const qty = Number(document.getElementById("itemQty").value);
    const unit = document.getElementById("itemUnit").value;
    const minAlert = document.getElementById("itemMinAlert").value;
    const expiry = document.getElementById("itemExpiry").value;
    const room = document.getElementById("itemRoom").value.trim();
    const cabinet = document.getElementById("itemCabinet").value.trim();
    const shelf = document.getElementById("itemShelf").value.trim();
    
    // v1.6.0 upgrades
    const chemicalType = document.getElementById("itemChemicalType").value;
    const sdsUrl = document.getElementById("itemSdsUrl").value.trim();
    const damagedQty = Number(document.getElementById("itemDamagedQty").value || 0);
    const repairQty = Number(document.getElementById("itemRepairQty").value || 0);
    
    // Retrieve checked GHS checkboxes
    const ghsCheckboxes = document.querySelectorAll('input[name="ghs"]:checked');
    const ghs = Array.from(ghsCheckboxes).map(cb => cb.value);

    const editIndex = document.getElementById("editItemIndex").value;

    // Check duplicate code when creating new item
    if (editIndex === "") {
      const codeExists = items.some(item => (item.code || "").toLowerCase() === code.toLowerCase());
      if (codeExists) {
        showToast(`ไม่สามารถใช้รหัส ${code} ได้เนื่องจากมีในระบบแล้ว!`, "error");
        return;
      }
    }

    // Chemical Incompatibility Check
    if (category === "สารเคมี" && chemicalType && room && cabinet) {
      let conflictType = null;
      let conflictName = "";

      const potentialConflict = items.find(item => {
        // Skip current item if in edit mode
        if (editIndex !== "" && item.code === items[editIndex].code) return false;

        if (item.category === "สารเคมี" && item.room === room && item.cabinet === cabinet && item.chemicalType) {
          if (chemicalType === "acid" && item.chemicalType === "base") {
            conflictType = "base";
            conflictName = getItemDisplayName(item);
            return true;
          }
          if (chemicalType === "base" && item.chemicalType === "acid") {
            conflictType = "acid";
            conflictName = getItemDisplayName(item);
            return true;
          }
          if (chemicalType === "oxidizer" && item.chemicalType === "organic") {
            conflictType = "organic";
            conflictName = getItemDisplayName(item);
            return true;
          }
          if (chemicalType === "organic" && item.chemicalType === "oxidizer") {
            conflictType = "oxidizer";
            conflictName = getItemDisplayName(item);
            return true;
          }
        }
        return false;
      });

      if (potentialConflict) {
        const typeLabels = {
          acid: "กรด",
          base: "เบส/ด่าง",
          oxidizer: "สารออกซิไดซ์",
          organic: "ตัวทำละลายอินทรีย์/สารไวไฟ"
        };
        const msg = `⚠️ คำเตือนสารเคมีเข้ากันไม่ได้:\n` +
                    `พบ "${conflictName}" ซึ่งเป็นสารประเภท "${typeLabels[conflictType]}" จัดเก็บอยู่ใน "${room} > ${cabinet}" เรียบร้อยแล้ว\n` +
                    `ไม่ควรจัดเก็บสารประเภท "${typeLabels[chemicalType]}" ร่วมกันในตู้เดียวกัน\n\n` +
                    `คุณต้องการบันทึกการจัดเก็บต่อไปใช่หรือไม่?`;
        if (!confirm(msg)) {
          return;
        }
      }
    }

    const itemData = {
      code,
      name,
      category,
      qty,
      unit,
      minAlert: minAlert ? Number(minAlert) : null,
      expiry: expiry || "",
      room,
      cabinet,
      shelf,
      chemicalType,
      sdsUrl,
      damagedQty,
      repairQty,
      ghs,
      dilutions: editIndex !== "" ? (items[editIndex].dilutions || []) : [],
      createdAt: editIndex !== "" ? items[editIndex].createdAt : new Date().toISOString()
    };

    if (editIndex !== "") {
      // Edit mode
      const success = await updateItemBackend(code, itemData, editIndex);
      if (!success) return;
      showToast(`อัปเดตข้อมูล "${name}" เรียบร้อยแล้ว!`);
      
      // Reset Form status to Create Mode
      document.getElementById("editItemIndex").value = "";
      document.getElementById("formPanelTitle").innerText = "เพิ่มสาร/อุปกรณ์";
      document.getElementById("formPanelSubtitle").innerText = "กรอกข้อมูลรายละเอียดของสารเคมีหรืออุปกรณ์เพื่อบันทึกเข้าสู่คลังแล็บ";
      document.getElementById("btnSubmitForm").innerText = "บันทึกข้อมูล";
      document.getElementById("itemCode").disabled = false;
      btnCancelEdit.style.display = "none";
    } else {
      // Create mode
      const success = await createItemBackend(itemData);
      if (!success) return;
      showToast(`บันทึกข้อมูล "${name}" เข้าสู่ระบบแล้ว!`);
    }

    // Reset Form safety elements
    document.querySelectorAll('input[name="ghs"]').forEach(cb => cb.checked = false);
    document.getElementById("itemChemicalType").value = "";
    document.getElementById("itemSdsUrl").value = "";
    document.getElementById("itemDamagedQty").value = 0;
    document.getElementById("itemRepairQty").value = 0;

    // Update UI directly
    updateUI();
    form.reset();
    
    // Set default value back to "ขวด" after reset
    document.getElementById("itemUnit").value = "ขวด";
    document.getElementById("itemMinAlert").value = "";

    // Navigate to all items to view
    navigateToPanel("all-items");
  });

  // Form Reset handler
  btnReset.addEventListener("click", () => {
    form.reset();
    document.getElementById("itemUnit").value = "ขวด";
    document.getElementById("itemMinAlert").value = "";
    document.getElementById("itemChemicalType").value = "";
    document.getElementById("itemSdsUrl").value = "";
    document.getElementById("itemDamagedQty").value = 0;
    document.getElementById("itemRepairQty").value = 0;
    document.querySelectorAll('input[name="ghs"]').forEach(cb => cb.checked = false);
  });

  // Cancel edit handler
  btnCancelEdit.addEventListener("click", () => {
    form.reset();
    document.getElementById("editItemIndex").value = "";
    document.getElementById("formPanelTitle").innerText = "เพิ่มสาร/อุปกรณ์";
    document.getElementById("formPanelSubtitle").innerText = "กรอกข้อมูลรายละเอียดของสารเคมีหรืออุปกรณ์เพื่อบันทึกเข้าสู่คลังแล็บ";
    document.getElementById("btnSubmitForm").innerText = "บันทึกข้อมูล";
    document.getElementById("itemCode").disabled = false;

    btnCancelEdit.style.display = "none";
    document.getElementById("itemUnit").value = "ขวด";
    document.getElementById("itemMinAlert").value = "";
    document.getElementById("itemChemicalType").value = "";
    document.getElementById("itemSdsUrl").value = "";
    document.getElementById("itemDamagedQty").value = 0;
    document.getElementById("itemRepairQty").value = 0;
    document.querySelectorAll('input[name="ghs"]').forEach(cb => cb.checked = false);
    navigateToPanel("all-items");
  });
}

// Global Edit Action called from tables
window.editItem = function(index) {
  if (!isAdminLoggedIn) {
    showToast("กรุณาเข้าสู่ระบบในฐานะผู้ดูแลระบบก่อนทำรายการนี้", "error");
    return;
  }

  const item = items[index];
  if (!item) return;

  // Navigate to edit form
  navigateToPanel("add-item");

  // Populate form fields
  document.getElementById("editItemIndex").value = index;
  document.getElementById("itemCode").value = item.code;
  document.getElementById("itemCode").disabled = true; // Lock code editing
  document.getElementById("itemName").value = item.name;
  document.getElementById("itemCategory").value = item.category;
  document.getElementById("itemQty").value = item.qty;
  document.getElementById("itemUnit").value = item.unit;
  document.getElementById("itemMinAlert").value = item.minAlert || "";
  document.getElementById("itemExpiry").value = item.expiry || "";
  document.getElementById("itemRoom").value = item.room || "";
  document.getElementById("itemCabinet").value = item.cabinet || "";
  document.getElementById("itemShelf").value = item.shelf || "";
  
  // v1.6.0 safety properties populating
  document.getElementById("itemChemicalType").value = item.chemicalType || "";
  document.getElementById("itemSdsUrl").value = item.sdsUrl || "";
  document.getElementById("itemDamagedQty").value = item.damagedQty || 0;
  document.getElementById("itemRepairQty").value = item.repairQty || 0;

  // Populate GHS checkboxes
  const ghsCheckboxes = document.querySelectorAll('input[name="ghs"]');
  ghsCheckboxes.forEach(cb => {
    cb.checked = item.ghs && item.ghs.includes(cb.value);
  });

  // UI state change
  document.getElementById("formPanelTitle").innerText = "แก้ไขข้อมูลสาร/อุปกรณ์";
  document.getElementById("formPanelSubtitle").innerText = `กำลังดำเนินการแก้ไขรายการ: [${item.code}] ${getItemDisplayName(item)}`;
  document.getElementById("btnSubmitForm").innerText = "บันทึกการแก้ไข";
  document.getElementById("btnCancelEdit").style.display = "inline-flex";
};

// Global Delete Action
window.deleteItem = async function(index) {
  if (!isAdminLoggedIn) {
    showToast("กรุณาเข้าสู่ระบบในฐานะผู้ดูแลระบบก่อนทำรายการนี้", "error");
    return;
  }

  const item = items[index];
  if (!item) return;

  if (confirm(`คุณต้องการลบรายการ "${getItemDisplayName(item)}" (${item.code}) ออกจากระบบใช่หรือไม่?`)) {
    if (isFirebaseOnline) {
      try {
        await db.collection("items").doc(item.code).delete();
        items.splice(index, 1);
        showToast(`ลบรายการ "${getItemDisplayName(item)}" สำเร็จ!`, "warning");
      } catch (err) {
        console.error("🔥 Firebase delete failed:", err);
        showToast("เกิดข้อผิดพลาดในการลบข้อมูลบน Firebase", "error");
        return;
      }
    } else if (isBackendOnline) {
      try {
        const response = await fetch(`${API_BASE}/items/${encodeURIComponent(item.code)}`, {
          method: "DELETE"
        });
        if (response.ok) {
          items.splice(index, 1);
          showToast(`ลบรายการ "${getItemDisplayName(item)}" สำเร็จ!`, "warning");
        } else {
          const errData = await response.json();
          showToast(errData.error || "เกิดข้อผิดพลาดในการลบข้อมูลหลังบ้าน", "error");
          return;
        }
      } catch (err) {
        console.error("Backend delete failed, falling back:", err);
        items.splice(index, 1);
        saveItemsToLocal();
        showToast(`ลบรายการ "${getItemDisplayName(item)}" สำเร็จ! (Offline)`, "warning");
      }
    } else {
      items.splice(index, 1);
      saveItemsToLocal();
      showToast(`ลบรายการ "${getItemDisplayName(item)}" สำเร็จ!`, "warning");
    }
    updateUI();
  }
};


// ==========================================================================
// CSV IMPORT & TEMPLATE DOWNLOAD SYSTEM
// ==========================================================================
function setupImportModal() {
  const modal = document.getElementById("importModal");
  const btnClose = document.getElementById("modalClose");
  const btnCancel = document.getElementById("btnCancelImport");
  const fileInput = document.getElementById("csvFileInput");
  const fileNameDisplay = document.getElementById("csvFileName");
  const btnConfirm = document.getElementById("btnConfirmImport");
  const btnDownload = document.getElementById("btnDownloadTemplate");

  // Close modal events
  const closeModalFunc = () => {
    modal.classList.remove("active");
    // Clear selection
    fileInput.value = "";
    fileNameDisplay.innerText = "no file selected";
    btnConfirm.disabled = true;
    fileToImport = null;
  };

  btnClose.addEventListener("click", closeModalFunc);
  btnCancel.addEventListener("click", closeModalFunc);

  // Close modal when clicking on dark backdrop
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModalFunc();
  });

  // Handle File Input Selection
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.name.slice(-4).toLowerCase() !== ".csv") {
        showToast("กรุณาเลือกไฟล์สกุล .csv เท่านั้น!", "error");
        fileInput.value = "";
        fileNameDisplay.innerText = "no file selected";
        btnConfirm.disabled = true;
        fileToImport = null;
        return;
      }
      fileToImport = file;
      fileNameDisplay.innerText = file.name;
      btnConfirm.disabled = false;
    }
  });

  // Handle Import Submission (Read & Parse CSV)
  btnConfirm.addEventListener("click", () => {
    if (!fileToImport) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
      const text = e.target.result;
      await parseCSVAndImport(text);
      closeModalFunc();
    };
    // Use UTF-8 to support Thai characters correctly
    reader.readAsText(fileToImport, "UTF-8");
  });

  // Handle CSV Template Download
  btnDownload.addEventListener("click", (e) => {
    e.preventDefault();
    downloadCSVTemplate();
  });
}

// Download UTF-8 CSV with BOM for automatic Excel support
function downloadCSVTemplate() {
  const instructions = [
    "# คู่มือการอ้างอิงข้อมูลของระบบสำหรับนำเข้าไฟล์ (System Import Reference Guide)",
    "# 1. คอลัมน์ที่จำเป็นต้องระบุ (ต้องไม่เว้นว่าง): รหัส, ชื่อ, หมวดหมู่, จำนวน, หน่วย",
    "# 2. หมวดหมู่* (ต้องตรงตามค่าใดค่าหนึ่ง): สารเคมี | อุปกรณ์วิทยาศาสตร์ | เครื่องแก้ว | วัสดุสิ้นเปลือง",
    "# 3. หน่วย* (เช่น): ขวด | เครื่อง | ชิ้น | อัน | กล่อง | หลอด | แกลลอน | ใบ | ชุด",
    "# 4. วันหมดอายุ(YYYY-MM-DD): ปี-เดือน-วัน ค.ศ. เช่น 2027-08-20 (เว้นว่างได้ถ้าไม่มี)",
    "# 5. ห้อง (ตรงตามระบบ): ห้องปฏิบัติการเคมี (หรือ Lab 1) | ห้องปฏิบัติการฟิสิกส์ (หรือ Lab 2) | ห้องปฏิบัติการชีววิทยา (หรือ Lab 3) | นอกห้องปฏิบัติการ (หรือ None)",
    "# 6. ประเภทสารเคมี: acid (กรด) | base (เบส) | oxidizer (สารออกซิไดซ์) | organic (สารไวไฟ) | other (สารเคมีทั่วไป)",
    "# 7. คอลัมน์ GHS (ระเบิดได้ - ภัยสิ่งแวดล้อม): ให้ใส่ Y หรือ 1 หรือ x เพื่อเลือกใช้สัญลักษณ์ความปลอดภัย GHS นั้นๆ (เว้นว่างหากไม่เกี่ยวข้อง)"
  ];
  
  const headers = [
    "รหัส*", 
    "ชื่อ*", 
    "หมวดหมู่*", 
    "จำนวน*", 
    "หน่วย*", 
    "จำนวนที่ชำรุด", 
    "จำนวนส่งซ่อม", 
    "จุดสั่งซื้อขั้นต่ำ", 
    "วันหมดอายุ(YYYY-MM-DD)", 
    "ห้อง", 
    "ตู้", 
    "ชั้น", 
    "ประเภทสารเคมี", 
    "ลิงก์ SDS", 
    "ระเบิดได้(GHS)", 
    "ไวไฟ(GHS)", 
    "ออกซิไดซ์(GHS)", 
    "ก๊าซความดัน(GHS)", 
    "กัดกร่อน(GHS)", 
    "ความเป็นพิษ(GHS)", 
    "ระคายเคือง(GHS)", 
    "ภัยสุขภาพ(GHS)", 
    "ภัยสิ่งแวดล้อม(GHS)"
  ];
  
  const sampleRow1 = [
    "CHEM-005", "กรดอะซิติก (Acetic Acid)", "สารเคมี", "3", "ขวด", "0", "0", "1", "2027-08-20", "ห้องปฏิบัติการเคมี", "ตู้ B", "ชั้น 1", 
    "acid", "https://example.com/sds-acetic.pdf", "", "Y", "", "", "Y", "", "Y", "", ""
  ];
  const sampleRow2 = [
    "EQ-002", "กล้องจุลทรรศน์แบบใช้แสง (Microscope)", "อุปกรณ์วิทยาศาสตร์", "4", "เครื่อง", "0", "0", "2", "", "ห้องปฏิบัติการฟิสิกส์", "ตู้เก็บอุปกรณ์", "ตู้ด้านซ้าย", 
    "", "", "", "", "", "", "", "", "", "", ""
  ];
  const sampleRow3 = [
    "GW-003", "บีกเกอร์ 250 มล. (Beaker 250ml)", "เครื่องแก้ว", "10", "ใบ", "1", "0", "5", "", "ห้องปฏิบัติการชีววิทยา", "ตู้แก้ว A", "ชั้น 2", 
    "", "", "", "", "", "", "", "", "", "", ""
  ];
  
  const csvContent = [
    ...instructions,
    headers.join(","),
    sampleRow1.join(","),
    sampleRow2.join(","),
    sampleRow3.join(",")
  ].join("\n");

  // UTF-8 BOM
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const tempLink = document.createElement("a");
  tempLink.setAttribute("href", url);
  tempLink.setAttribute("download", "Template_Chemical_Library.csv");
  tempLink.style.visibility = "hidden";
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
  
  showToast("ดาวน์โหลดไฟล์ Template เรียบร้อยแล้ว!");
}

// Parse CSV text into arrays and push to local items
async function parseCSVAndImport(csvText) {
  const lines = csvText.split(/\r\n|\n/);
  if (lines.length < 2) {
    showToast("ไฟล์ไม่มีข้อมูลสำหรับการนำเข้า!", "error");
    return;
  }

  const importList = [];
  let errorCount = 0;
  let headerSkipped = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty rows
    if (line.startsWith('#')) continue; // Skip comment rows

    if (!headerSkipped) {
      headerSkipped = true;
      continue; // Skip header row
    }

    const cols = line.split(",").map(c => c.trim().replace(/^"|"$/g, ''));

    if (cols.length < 5) {
      errorCount++;
      continue;
    }

    const code = cols[0];
    const name = cols[1];
    const category = cols[2];
    const qty = Number(cols[3]);
    const unit = cols[4];
    const damagedQty = cols[5] ? Number(cols[5]) : 0;
    const repairQty = cols[6] ? Number(cols[6]) : 0;
    const minAlert = cols[7] ? Number(cols[7]) : null;
    const expiry = cols[8] || "";
    let room = cols[9] || "";
    const cabinet = cols[10] || "";
    const shelf = cols[11] || "";
    const chemicalType = cols[12] || "";
    const sdsUrl = cols[13] || "";

    // Parse GHS checkboxes from column indices 14-22
    const ghs = [];
    const isChecked = (val) => {
      if (!val) return false;
      const normalized = val.trim().toLowerCase();
      return ["y", "1", "x", "yes", "true", "/", "ใช่", "ติ๊ก"].includes(normalized);
    };

    if (cols.length > 14 && isChecked(cols[14])) ghs.push("explosive");
    if (cols.length > 15 && isChecked(cols[15])) ghs.push("flammable");
    if (cols.length > 16 && isChecked(cols[16])) ghs.push("oxidizing");
    if (cols.length > 17 && isChecked(cols[17])) ghs.push("compressed_gas");
    if (cols.length > 18 && isChecked(cols[18])) ghs.push("corrosive");
    if (cols.length > 19 && isChecked(cols[19])) ghs.push("toxic");
    if (cols.length > 20 && isChecked(cols[20])) ghs.push("irritant");
    if (cols.length > 21 && isChecked(cols[21])) ghs.push("health_hazard");
    if (cols.length > 22 && isChecked(cols[22])) ghs.push("environmental");

    // Support both Thai names and short codes for room mapping
    if (room === "ห้องปฏิบัติการเคมี") room = "Lab 1";
    else if (room === "ห้องปฏิบัติการฟิสิกส์") room = "Lab 2";
    else if (room === "ห้องปฏิบัติการชีววิทยา") room = "Lab 3";
    else if (room === "นอกห้องปฏิบัติการ") room = "None";

    // Validation checks for compulsory fields
    if (!code || !name || !category || isNaN(qty) || !unit) {
      errorCount++;
      continue;
    }

    importList.push({
      code,
      name,
      category,
      qty,
      unit,
      damagedQty,
      repairQty,
      minAlert,
      expiry,
      room,
      cabinet,
      shelf,
      chemicalType,
      sdsUrl,
      ghs,
      createdAt: new Date().toISOString()
    });
  }

  if (isFirebaseOnline) {
    try {
      let importedCount = 0;
      
      // Perform batch writes in chunks of 500 (Firestore batch size limit)
      const batchLimit = 500;
      for (let i = 0; i < importList.length; i += batchLimit) {
        const chunk = importList.slice(i, i + batchLimit);
        const batch = db.batch();
        
        chunk.forEach(newItem => {
          const docRef = db.collection("items").doc(newItem.code);
          batch.set(docRef, newItem);
          importedCount++;
        });
        
        await batch.commit();
      }
      
      await loadAllItems();
      updateUI();
      showToast(`นำเข้าคลาวด์สำเร็จ ${importedCount} รายการ! ${errorCount > 0 ? `(ข้ามรายการผิดพลาด ${errorCount} รายการ)` : ''}`, "success");
    } catch (err) {
      console.error("🔥 Firebase batch import failed:", err);
      showToast("เกิดข้อผิดพลาดในการบันทึกข้อมูลนำเข้าคลาวด์", "error");
    }
    return;
  }

  if (isBackendOnline) {
    try {
      const response = await fetch(`${API_BASE}/items/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(importList)
      });
      if (response.ok) {
        const result = await response.json();
        await loadAllItems();
        updateUI();
        showToast(`นำเข้าสำเร็จ ${result.imported} รายการ! ${result.errors > 0 ? `(ข้ามรายการซ้ำ/ผิดพลาด ${result.errors} รายการ)` : ''}`, "success");
      } else {
        showToast("เกิดข้อผิดพลาดในการนำเข้าหลังบ้าน", "error");
      }
    } catch (err) {
      console.error("Backend batch import failed, falling back:", err);
      showToast("เกิดข้อผิดพลาดในการสื่อสารกับเซิร์ฟเวอร์หลังบ้าน", "error");
    }
    return;
  }

  // Local Fallback Mode
  let localImportCount = 0;
  importList.forEach(newItem => {
    // Check duplicate code locally safely
    const isDuplicate = items.some(item => (item.code || "").toLowerCase() === (newItem.code || "").toLowerCase());
    if (isDuplicate) {
      errorCount++;
      return;
    }
    items.push(newItem);
    localImportCount++;
  });

  saveItemsToLocal();
  updateUI();

  if (localImportCount > 0) {
    showToast(`นำเข้าข้อมูลพัสดุสำเร็จ ${localImportCount} รายการ! ${errorCount > 0 ? `(มีข้อผิดพลาด/ซ้ำ ${errorCount} รายการ)` : ''}`, "success");
  } else {
    showToast(`ไม่สามารถนำเข้าข้อมูลได้! มีข้อผิดพลาดในตารางข้อมูล`, "error");
  }
}

// ==========================================================================
// ADDITIONAL DECORATIVE UI EVENTS
// ==========================================================================
function setupDashboardCards() {
  // We can add micro-animations to stat cards on click if necessary.
}

// ==========================================================================
// BORROW / RETURN SYSTEM (AUTOMATIC STOCK RECONCILIATION)
// ==========================================================================

// Load transactions from Firebase or LocalStorage
async function loadAllTransactions() {
  const defaultTrans = [
    {
      id: "tx-mock-001",
      itemCode: "CHEM-001",
      itemName: "กรดไฮโดรคลอริก 37% (Hydrochloric Acid)",
      qty: 2,
      borrower: "นายสมชาย เรียนดี",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      type: "borrow",
      status: "borrowed",
      notes: "แล็บวิชาเคมี 1 เรื่องกรด-เบส",
      expectedReturnDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      bookingId: "book_mock_001",
      room: "Lab 1",
      slot: "3",
      supervisingTeacher: "อาจารย์สมศักดิ์ รักสอน",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "tx-mock-002",
      itemCode: "CHEM-003",
      itemName: "โซเดียมไฮดรอกไซด์ (Sodium Hydroxide)",
      qty: 1,
      borrower: "นางสาวสมหญิง ใจดี",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      type: "borrow",
      status: "borrowed",
      notes: "แล็บเคมีฟิสิกส์ เรื่องปฏิกิริยาความร้อน",
      expectedReturnDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      bookingId: "book_mock_002",
      room: "Lab 2",
      slot: "4, 5",
      supervisingTeacher: "อาจารย์ศิริมา ดีใจ",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "tx-mock-003",
      itemCode: "GW-001",
      itemName: "บีกเกอร์ขนาด 250 มล. (Beaker 250ml)",
      qty: 4,
      borrower: "นายมานะ ขยันเรียน",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      type: "borrow",
      status: "returned",
      notes: "ทดลองเรื่องความเข้มข้นสารละลาย",
      expectedReturnDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      bookingId: "",
      room: "Lab 2",
      slot: "2",
      supervisingTeacher: "อาจารย์วิภาดา ใฝ่รู้",
      returnDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      damagedQty: 1,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  if (isFirebaseOnline) {
    try {
      const snapshot = await db.collection("transactions").get();
      const loadedTrans = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d && d.id) {
          loadedTrans.push(d);
        }
      });
      transactions = loadedTrans;
      
      // Smart merge missing default transactions
      let updated = false;
      const batch = db.batch();
      defaultTrans.forEach(demoTx => {
        if (!transactions.some(tx => tx.id === demoTx.id)) {
          transactions.push(demoTx);
          const docRef = db.collection("transactions").doc(demoTx.id);
          batch.set(docRef, demoTx);
          updated = true;
        }
      });
      if (updated) {
        await batch.commit();
        console.log("🔥 Seeded missing mock transactions to Firebase.");
      }
      
      console.log("🔥 Loaded " + transactions.length + " transactions from Firebase Cloud.");
      return;
    } catch (err) {
      console.error("🔥 Failed to load transactions from Firebase:", err);
      isFirebaseOnline = false;
    }
  }

  // LocalStorage Fallback
  const localTrans = localStorage.getItem("lab_transactions");
  if (localTrans) {
    transactions = JSON.parse(localTrans);
    
    // Smart merge default transactions
    let updated = false;
    defaultTrans.forEach(demoTx => {
      if (!transactions.some(tx => tx.id === demoTx.id)) {
        transactions.push(demoTx);
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem("lab_transactions", JSON.stringify(transactions));
    }
  } else {
    transactions = [...defaultTrans];
    localStorage.setItem("lab_transactions", JSON.stringify(transactions));
  }
}

// Helper to save a single transaction
async function saveTransaction(transData) {
  if (isFirebaseOnline) {
    try {
      await db.collection("transactions").doc(transData.id).set(transData);
      transactions.push(transData);
      return true;
    } catch (err) {
      console.error("🔥 Firebase save transaction failed:", err);
      showToast("เกิดข้อผิดพลาดในการบันทึกประวัติไปยังคลาวด์", "error");
      return false;
    }
  }

  // LocalStorage Fallback
  transactions.push(transData);
  localStorage.setItem("lab_transactions", JSON.stringify(transactions));
  return true;
}

// Populate Booking Dropdown in Borrow Form
function populateBorrowBookingSelect() {
  const select = document.getElementById("borrowBookingSelect");
  if (!select) return;

  // Preserve the selected value
  const selectedVal = select.value;

  // Clear options except the first two
  while (select.options.length > 2) {
    select.remove(2);
  }

  // Filter approved bookings
  const approvedBookings = bookings.filter(b => b.status === "approved");

  approvedBookings.forEach(b => {
    const option = document.createElement("option");
    option.value = b.id;
    option.textContent = `[${getRoomThaiName(b.room)}] ${b.slot} (${formatThaiDate(b.date)}) โดย ${b.bookerName}`;
    select.appendChild(option);
  });

  // Restore selected value if it still exists
  if (selectedVal) {
    select.value = selectedVal;
  }
}

// Populate Dropdown List of Items for Borrow Form
function populateBorrowItemDropdown() {
  const optionsList = document.getElementById("borrowItemOptionsList");
  const triggerText = document.querySelector("#borrowItemSelectTrigger .custom-select-trigger-text");
  
  if (!optionsList) return;

  // Clear custom options list
  optionsList.innerHTML = '';

  // Sort items alphabetically by name safely
  const sortedItems = [...items].sort((a, b) => (a.name || "").localeCompare(b.name || "", 'th'));

  sortedItems.forEach(item => {
    // Populate custom list item
    const customOpt = document.createElement("div");
    customOpt.className = "custom-select-option";
    customOpt.setAttribute("data-value", item.code);
    customOpt.innerHTML = `
      <div class="custom-opt-name">${getItemDisplayName(item) || "ไม่มีชื่อพัสดุ"}</div>
      <div class="custom-opt-details">
        <span class="custom-opt-code">${item.code || "ไม่มีรหัส"}</span>
        <span class="custom-opt-qty">คงเหลือ: ${item.qty || 0} ${item.unit || "หน่วย"}</span>
      </div>
    `;
    
    // Add click handler to select item
    customOpt.addEventListener("click", () => {
      selectCustomOption(item.code, `${getItemDisplayName(item) || "ไม่มีชื่อพัสดุ"} (${item.code || "ไม่มีรหัส"})`);
    });

    optionsList.appendChild(customOpt);
  });

  if (triggerText) {
    triggerText.innerText = '-- ค้นหาและเลือกรายการที่ต้องการเพิ่ม --';
    triggerText.classList.remove("has-value");
  }
}

// Custom Searchable Dropdown selection logic
function selectCustomOption(value, text) {
  addBorrowItem(value);
  const dropdownMenu = document.getElementById("borrowItemSelectDropdown");
  const chevron = document.querySelector("#borrowItemSelectWrapper .custom-select-chevron");
  
  // Close dropdown
  if (dropdownMenu) dropdownMenu.classList.remove("open");
  if (chevron) chevron.style.transform = "rotate(0deg)";
}

// Multi-item borrowing support functions
function addBorrowItem(itemCode) {
  const item = items.find(i => i.code === itemCode);
  if (!item) return;

  const existing = selectedBorrowItems.find(i => i.code === itemCode);
  if (existing) {
    showToast(`"${getItemDisplayName(item)}" ถูกเลือกไปแล้ว`, "info");
    return;
  }

  selectedBorrowItems.push({
    code: item.code,
    name: getItemDisplayName(item),
    unit: item.unit || "ชิ้น",
    maxQty: item.qty || 0,
    qty: 1
  });

  renderSelectedBorrowItems();
}

function renderSelectedBorrowItems() {
  const container = document.getElementById("selectedItemsContainer");
  if (!container) return;

  if (selectedBorrowItems.length === 0) {
    container.innerHTML = `
      <div class="empty-selected-items" style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 20px 0;">
        (กรุณาเลือกรายการสารเคมี / อุปกรณ์จากกล่องด้านบนเพื่อทำรายการ)
      </div>
    `;
    return;
  }

  let html = "";
  selectedBorrowItems.forEach((item) => {
    const isReturn = document.querySelector('input[name="borrowType"]:checked')?.value === "return";
    
    html += `
      <div class="selected-item-row" style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: 8px 12px; gap: 12px;">
        <div style="display: flex; flex-direction: column; gap: 6px; flex: 1;">
          <span style="font-weight: 600; font-size: 13.5px; color: var(--text-main); line-height: 1.5;">${item.name}</span>
          <span style="font-size: 11px; color: var(--text-muted);">
            รหัส: ${item.code} | คงเหลือในคลัง: ${item.maxQty} ${item.unit}
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span style="font-size: 12px; color: var(--text-muted);">จำนวน:</span>
          <input type="number" 
                 class="form-control" 
                 value="${item.qty}" 
                 min="1" 
                 ${!isReturn ? `max="${item.maxQty}"` : ''} 
                 style="width: 70px; padding: 4px 8px; text-align: center; font-size: 13px; height: 30px;"
                 onchange="updateBorrowItemQty('${item.code}', this.value)">
          <button type="button" 
                  class="btn-remove" 
                  onclick="removeBorrowItem('${item.code}')" 
                  style="color: var(--accent-red); cursor: pointer; display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 4px; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.1);">
            <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  lucide.createIcons();
}

window.updateBorrowItemQty = function(code, val) {
  const item = selectedBorrowItems.find(i => i.code === code);
  if (item) {
    const isReturn = document.querySelector('input[name="borrowType"]:checked')?.value === "return";
    let num = Number(val);
    if (isNaN(num) || num <= 0) num = 1;
    
    if (!isReturn && num > item.maxQty) {
      showToast(`จำนวนที่ยืมไม่สามารถมากกว่าจำนวนคงเหลือในคลัง (${item.maxQty})`, "error");
      num = item.maxQty;
    }
    
    item.qty = num;
    renderSelectedBorrowItems();
  }
};

window.removeBorrowItem = function(code) {
  selectedBorrowItems = selectedBorrowItems.filter(i => i.code !== code);
  renderSelectedBorrowItems();
};

// Setup custom searchable select event listeners
function setupCustomSearchableSelect() {
  const wrapper = document.getElementById("borrowItemSelectWrapper");
  if (!wrapper) return;

  const trigger = document.getElementById("borrowItemSelectTrigger");
  const dropdownMenu = document.getElementById("borrowItemSelectDropdown");
  const searchInput = document.getElementById("borrowItemSearchInput");
  const clearBtn = document.getElementById("borrowItemClearSearch");
  const optionsList = document.getElementById("borrowItemOptionsList");
  const chevron = wrapper.querySelector(".custom-select-chevron");
  const form = document.getElementById("borrowForm");

  if (!trigger || !dropdownMenu || !searchInput || !clearBtn || !optionsList) return;

  // Toggle dropdown on trigger click
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = dropdownMenu.classList.contains("open");
    
    if (isOpen) {
      dropdownMenu.classList.remove("open");
      if (chevron) chevron.style.transform = "rotate(0deg)";
    } else {
      dropdownMenu.classList.add("open");
      if (chevron) chevron.style.transform = "rotate(180deg)";
      setTimeout(() => {
        searchInput.focus();
        if (searchInput.value) searchInput.select();
      }, 50);
    }
  });

  // Search input typing handler
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();
    
    // Show/hide clear button
    clearBtn.style.display = query ? "block" : "none";
    
    const options = optionsList.querySelectorAll(".custom-select-option");
    let hasMatch = false;

    options.forEach(opt => {
      const name = opt.querySelector(".custom-opt-name").innerText.toLowerCase();
      const code = opt.querySelector(".custom-opt-code").innerText.toLowerCase();
      
      if (name.includes(query) || code.includes(query)) {
        opt.style.display = "flex";
        hasMatch = true;
      } else {
        opt.style.display = "none";
      }
    });

    // Remove existing no-results message if any
    const existingNoResults = optionsList.querySelector(".custom-select-no-results");
    if (existingNoResults) existingNoResults.remove();

    // Show no-results if nothing matched
    if (!hasMatch && options.length > 0) {
      const noResultsDiv = document.createElement("div");
      noResultsDiv.className = "custom-select-no-results";
      noResultsDiv.innerText = "❌ ไม่พบรายการพัสดุหรืออุปกรณ์";
      optionsList.appendChild(noResultsDiv);
    }
  });

  // Clear button click handler
  clearBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    searchInput.value = "";
    clearBtn.style.display = "none";
    
    const options = optionsList.querySelectorAll(".custom-select-option");
    options.forEach(opt => opt.style.display = "flex");

    const existingNoResults = optionsList.querySelector(".custom-select-no-results");
    if (existingNoResults) existingNoResults.remove();

    searchInput.focus();
  });

  // Prevent dropdown closing when clicking inside dropdown menu
  dropdownMenu.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // Click outside wrapper to close dropdown
  document.addEventListener("click", () => {
    if (dropdownMenu.classList.contains("open")) {
      dropdownMenu.classList.remove("open");
      if (chevron) chevron.style.transform = "rotate(0deg)";
    }
  });

  // Escape key to close dropdown
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && dropdownMenu.classList.contains("open")) {
      dropdownMenu.classList.remove("open");
      if (chevron) chevron.style.transform = "rotate(0deg)";
    }
  });

  // Reset form listener
  if (form) {
    form.addEventListener("reset", () => {
      const triggerText = trigger.querySelector(".custom-select-trigger-text");
      if (triggerText) {
        triggerText.innerText = "-- กรุณาเลือกรายการ --";
        triggerText.classList.remove("has-value");
      }
      searchInput.value = "";
      clearBtn.style.display = "none";
      
      const options = optionsList.querySelectorAll(".custom-select-option");
      options.forEach(opt => opt.style.display = "flex");

      const existingNoResults = optionsList.querySelector(".custom-select-no-results");
      if (existingNoResults) existingNoResults.remove();
      
      if (chevron) chevron.style.transform = "rotate(0deg)";
    });
  }
}

// Helper to add days to a date string safely
function addDays(dateStr, days) {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  } catch (e) {
    return "";
  }
}

// Setup Form listeners and Submit operations for Borrow/Return
function setupBorrowForm() {
  const form = document.getElementById("borrowForm");
  const btnReset = document.getElementById("btnResetBorrow");
  const borrowDateInput = document.getElementById("borrowDate");

  if (!form) return;

  // Set up custom searchable select listeners
  setupCustomSearchableSelect();

  // Set default date to today
  if (borrowDateInput) {
    const today = new Date().toISOString().split('T')[0];
    borrowDateInput.value = today;
  }

  // Handle Lab session booking dropdown changes
  const borrowBookingSelect = document.getElementById("borrowBookingSelect");
  if (borrowBookingSelect) {
    borrowBookingSelect.addEventListener("change", () => {
      const bookingId = borrowBookingSelect.value;
      const borrowRoomSelect = document.getElementById("borrowRoom");
      const borrowSlotSelect = document.getElementById("borrowSlot");
      
      if (bookingId && bookingId !== "none") {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
          if (borrowDateInput) {
            borrowDateInput.value = booking.date;
            borrowDateInput.disabled = true;
          }
          if (borrowRoomSelect) {
            borrowRoomSelect.value = booking.room;
            borrowRoomSelect.disabled = true;
          }
          if (borrowSlotSelect) {
            const slotMatch = booking.slot.match(/คาบ \d+|พักกลางวัน/);
            borrowSlotSelect.value = slotMatch ? slotMatch[0] : "None";
            borrowSlotSelect.disabled = true;
          }
        }
      } else {
        // Enable fields
        if (borrowDateInput) {
          borrowDateInput.disabled = false;
        }
        if (borrowRoomSelect) {
          borrowRoomSelect.disabled = false;
        }
        if (borrowSlotSelect) {
          borrowSlotSelect.disabled = false;
        }
        
        if (bookingId === "none") {
          if (borrowRoomSelect) borrowRoomSelect.value = "None";
          if (borrowSlotSelect) borrowSlotSelect.value = "None";
        }
      }
    });
  }

  function updateBorrowerDatalist() {
    const datalist = document.getElementById("borrowerList");
    if (!datalist) return;

    const borrowType = document.querySelector('input[name="borrowType"]:checked')?.value || "borrow";
    const names = new Set();

    if (borrowType === "return") {
      // Return mode: suggest active borrowers
      transactions.forEach(t => {
        if (t.borrower && t.type === "borrow" && t.status === "borrowed") {
          names.add(t.borrower.trim());
        }
      });
    } else {
      // Borrow mode: suggest all unique historical borrowers
      transactions.forEach(t => {
        if (t.borrower) {
          names.add(t.borrower.trim());
        }
      });
    }

    datalist.innerHTML = Array.from(names)
      .map(name => `<option value="${name}"></option>`)
      .join("");
  }

  function updateBorrowFormUI() {
    const borrowType = document.querySelector('input[name="borrowType"]:checked')?.value || "borrow";
    const singleItemSelectGroup = document.getElementById("singleItemSelectGroup");
    const selectedItemsGroup = document.getElementById("selectedItemsGroup");
    const borrowBookingDetailsRow = document.getElementById("borrowBookingDetailsRow");
    
    const borrowDateInput = document.getElementById("borrowDate");
    const borrowRoomSelect = document.getElementById("borrowRoom");
    const borrowSlotSelect = document.getElementById("borrowSlot");
    const btnSubmitBorrowSpan = document.querySelector("#btnSubmitBorrow span");

    if (borrowType === "return") {
      if (singleItemSelectGroup) singleItemSelectGroup.style.display = "none";
      if (selectedItemsGroup) selectedItemsGroup.style.display = "none";
      if (borrowBookingDetailsRow) borrowBookingDetailsRow.style.display = "none";
      
      if (borrowDateInput) borrowDateInput.required = false;
      if (borrowRoomSelect) borrowRoomSelect.required = false;
      if (borrowSlotSelect) borrowSlotSelect.required = false;
      
      if (btnSubmitBorrowSpan) btnSubmitBorrowSpan.textContent = "ยืนยันการคืนพัสดุทั้งหมด";
    } else {
      if (singleItemSelectGroup) singleItemSelectGroup.style.display = "block";
      if (selectedItemsGroup) selectedItemsGroup.style.display = "block";
      if (borrowBookingDetailsRow) borrowBookingDetailsRow.style.display = "grid";
      
      if (borrowDateInput) borrowDateInput.required = true;
      if (borrowRoomSelect) borrowRoomSelect.required = true;
      if (borrowSlotSelect) borrowSlotSelect.required = true;
      
      if (btnSubmitBorrowSpan) btnSubmitBorrowSpan.textContent = "บันทึกรายการ";
    }

    updateBorrowerDatalist();
  }

  function refreshReturnItemsChecklist() {
    const borrowType = document.querySelector('input[name="borrowType"]:checked')?.value || "borrow";
    const borrowerNameInput = document.getElementById("borrowerName");
    const borrowerName = borrowerNameInput ? borrowerNameInput.value.trim() : "";
    const containerGroup = document.getElementById("returnItemsChecklistGroup");
    const container = document.getElementById("returnItemsChecklistContainer");

    if (!containerGroup || !container) return;

    if (borrowType !== "return" || !borrowerName) {
      containerGroup.style.display = "none";
      container.innerHTML = "";
      return;
    }

    // Find active borrowed transactions
    const borrowedTx = transactions.filter(t => 
      t.borrower && 
      t.borrower.trim().toLowerCase() === borrowerName.toLowerCase() && 
      t.type === "borrow" && 
      t.status === "borrowed"
    );

    if (borrowedTx.length === 0) {
      containerGroup.style.display = "block";
      container.innerHTML = `
        <div style="font-size: 13px; color: var(--text-muted); text-align: center; padding: 12px; font-weight: 500;">
          ไม่มีรายการพัสดุค้างยืมสำหรับชื่อนี้
        </div>
      `;
      return;
    }

    containerGroup.style.display = "block";
    let html = "";
    borrowedTx.forEach(tx => {
      const item = items.find(i => i.code === tx.itemCode) || { name: tx.itemName || tx.itemCode, unit: "ชิ้น" };
      html += `
        <div class="return-item-row" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; width: 100%; max-width: 100%; overflow: hidden; box-sizing: border-box;">
          <div style="flex: 1; min-width: 0; padding-right: 8px;">
            <div style="font-weight: 600; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${item.name}">
              ${item.name}
            </div>
            <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">
              รหัส: ${tx.itemCode} | ยืม: <strong style="color: var(--primary-purple);">${tx.qty}</strong> ${item.unit || "ชิ้น"}
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
            <label style="font-size: 11px; color: var(--accent-red); font-weight: 600; display: flex; align-items: center; gap: 4px; cursor: pointer; user-select: none; margin-bottom: 0;">
              <input type="checkbox" class="damage-checkbox" data-tx-id="${tx.id}" style="width: 14px; height: 14px; cursor: pointer;">
              <span>ชำรุด</span>
            </label>
            <input type="number" class="damage-qty-input" data-tx-id="${tx.id}" value="1" min="1" max="${tx.qty}" style="width: 56px; height: 26px; padding: 2px 4px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 12px; display: none; text-align: center; outline: none;">
          </div>
        </div>
      `;
    });
    container.innerHTML = html;

    // Attach checkbox event listeners
    const checkboxes = container.querySelectorAll(".damage-checkbox");
    checkboxes.forEach(cb => {
      cb.addEventListener("change", (e) => {
        const txId = e.target.getAttribute("data-tx-id");
        const qtyInput = container.querySelector(`.damage-qty-input[data-tx-id="${txId}"]`);
        if (qtyInput) {
          qtyInput.style.display = e.target.checked ? "inline-block" : "none";
        }
      });
    });
  }

  // Initial call
  updateBorrowFormUI();

  // Listen for borrowType change (radio buttons) to refresh selected list
  const borrowTypeRadios = document.querySelectorAll('input[name="borrowType"]');
  borrowTypeRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      renderSelectedBorrowItems();
      updateBorrowFormUI();
      refreshReturnItemsChecklist();
    });
  });

  // Listen for borrowerName inputs to refresh checklist
  const borrowerNameInput = document.getElementById("borrowerName");
  if (borrowerNameInput) {
    borrowerNameInput.addEventListener("input", () => {
      refreshReturnItemsChecklist();
    });
  }

  // Reset handler
  btnReset.addEventListener("click", () => {
    form.reset();
    selectedBorrowItems = [];
    renderSelectedBorrowItems();
    
    const returnItemsChecklistGroup = document.getElementById("returnItemsChecklistGroup");
    const returnItemsChecklistContainer = document.getElementById("returnItemsChecklistContainer");
    if (returnItemsChecklistGroup) returnItemsChecklistGroup.style.display = "none";
    if (returnItemsChecklistContainer) returnItemsChecklistContainer.innerHTML = "";
    
    if (borrowDateInput) {
      const today = new Date().toISOString().split('T')[0];
      borrowDateInput.value = today;
      borrowDateInput.disabled = false;
    }
    const borrowRoomSelect = document.getElementById("borrowRoom");
    if (borrowRoomSelect) borrowRoomSelect.disabled = false;
    const borrowSlotSelect = document.getElementById("borrowSlot");
    if (borrowSlotSelect) borrowSlotSelect.disabled = false;

    if (borrowBookingSelect) {
      borrowBookingSelect.value = "";
      borrowBookingSelect.dispatchEvent(new Event('change'));
    }

    updateBorrowFormUI();
  });

  // Form submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const borrowType = document.querySelector('input[name="borrowType"]:checked').value;
    const borrowerName = document.getElementById("borrowerName").value.trim();

    if (!borrowerName) {
      showToast("กรุณากรอกชื่อผู้ทำรายการ", "error");
      return;
    }

    if (borrowType === "return") {
      // Find all transactions currently borrowed by this user
      const borrowedTx = transactions.filter(t => 
        t.borrower && 
        t.borrower.trim().toLowerCase() === borrowerName.toLowerCase() && 
        t.type === "borrow" && 
        t.status === "borrowed"
      );

      if (borrowedTx.length === 0) {
        showToast(`ไม่พบรายการยืมพัสดุที่ยังไม่ได้คืนสำหรับผู้ยืมชื่อ "${borrowerName}"`, "error");
        return;
      }

      if (confirm(`คุณต้องการยืนยันการคืนพัสดุทั้งหมดจำนวน ${borrowedTx.length} รายการ ของผู้ยืม "${borrowerName}" ใช่หรือไม่?`)) {
        let successCount = 0;
        for (const tx of borrowedTx) {
          // Find the item
          const itemIndex = items.findIndex(i => i.code === tx.itemCode);
          if (itemIndex === -1) continue;
          const item = items[itemIndex];

          // Check if this item has a damage count specified
          const chkDamage = document.querySelector(`.damage-checkbox[data-tx-id="${tx.id}"]`);
          const numDamage = document.querySelector(`.damage-qty-input[data-tx-id="${tx.id}"]`);
          
          let damagedCount = 0;
          if (chkDamage && chkDamage.checked) {
            damagedCount = Math.min(tx.qty, Math.max(0, Number(numDamage?.value || 0)));
          }

          const goodReturnedCount = tx.qty - damagedCount;

          // Calculate new stock quantity (good items go back to qty, damaged items do not)
          const newQty = item.qty + goodReturnedCount;
          const newDamagedQty = (item.damagedQty || 0) + damagedCount;

          // Update item stock in backend/cloud
          const updatedItem = { 
            ...item, 
            qty: newQty,
            damagedQty: newDamagedQty
          };
          const successBackend = await updateItemBackend(item.code, updatedItem, itemIndex);

          if (successBackend) {
            // Update transaction status
            const updatedTrans = { 
              ...tx, 
              status: "returned",
              returnDate: new Date().toISOString().split('T')[0],
              damagedQty: damagedCount
            };
            
            // Update in Firebase or LocalStorage
            if (isFirebaseOnline) {
              try {
                await db.collection("transactions").doc(tx.id).set(updatedTrans);
                const idx = transactions.findIndex(t => t.id === tx.id);
                if (idx !== -1) transactions[idx] = updatedTrans;
              } catch (err) {
                console.error("🔥 Failed to update transaction on Firebase:", err);
                continue;
              }
            } else {
              // Local fallback
              const idx = transactions.findIndex(t => t.id === tx.id);
              if (idx !== -1) transactions[idx] = updatedTrans;
              localStorage.setItem("lab_transactions", JSON.stringify(transactions));
            }
            successCount++;
          }
        }

        if (successCount > 0) {
          showToast(`คืนพัสดุสำเร็จทั้งหมด ${successCount} รายการ!`, "success");
          
          // Clear selection and reset form
          selectedBorrowItems = [];
          renderSelectedBorrowItems();
          form.reset();
          
          const returnItemsChecklistGroup = document.getElementById("returnItemsChecklistGroup");
          const returnItemsChecklistContainer = document.getElementById("returnItemsChecklistContainer");
          if (returnItemsChecklistGroup) returnItemsChecklistGroup.style.display = "none";
          if (returnItemsChecklistContainer) returnItemsChecklistContainer.innerHTML = "";
          
          if (borrowDateInput) {
            const today = new Date().toISOString().split('T')[0];
            borrowDateInput.value = today;
          }
          
          // Reset UI toggles
          updateBorrowFormUI();
          updateUI();
        } else {
          showToast("เกิดข้อผิดพลาดในการคืนพัสดุ", "error");
        }
      }
      return;
    }

    // BORROW FLOW
    if (selectedBorrowItems.length === 0) {
      showToast("กรุณาเลือกรายการพัสดุ/อุปกรณ์อย่างน้อย 1 รายการเพื่อทำรายการ", "error");
      return;
    }

    const borrowDate = document.getElementById("borrowDate").value;
    const borrowNotes = document.getElementById("borrowNotes").value.trim();

    if (!borrowDate) {
      showToast("กรุณากรอกข้อมูลวันที่ใช้งาน", "error");
      return;
    }

    const bookingSelect = document.getElementById("borrowBookingSelect");
    const bookingId = bookingSelect ? bookingSelect.value : "";
    const borrowRoom = document.getElementById("borrowRoom").value;
    const borrowSlot = document.getElementById("borrowSlot").value;
    
    let supervisingTeacher = "";
    if (bookingId && bookingId !== "none") {
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        supervisingTeacher = booking.bookerName;
      }
    }

    // Determine expected return date (7 days after borrow)
    const expectedReturnDate = addDays(borrowDate, 7);

    // Validate stock and process each item
    let processedCount = 0;

    for (const selectedItem of selectedBorrowItems) {
      const itemIndex = items.findIndex(item => item.code === selectedItem.code);
      if (itemIndex === -1) continue;
      const item = items[itemIndex];

      // Double check stock quantity
      if (selectedItem.qty > item.qty) {
        showToast(`ไม่สามารถยืม "${getItemDisplayName(item)}" ได้! จำนวนที่ยืม (${selectedItem.qty}) มากกว่าคงเหลือในคลัง (${item.qty})`, "error");
        return;
      }

      if (userRole === "student") {
        // Student View: Creates pending request, no stock change
        const transactionData = {
          id: "TX-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
          itemCode: item.code,
          itemName: getItemDisplayName(item),
          qty: selectedItem.qty,
          borrower: borrowerName,
          date: borrowDate,
          type: "borrow",
          status: "pending",
          notes: borrowNotes,
          expectedReturnDate,
          bookingId: bookingId || "",
          room: borrowRoom,
          slot: borrowSlot,
          supervisingTeacher: supervisingTeacher || "",
          createdAt: new Date().toISOString()
        };
        const success = await saveTransaction(transactionData);
        if (success) processedCount++;
      } else {
        // Teacher View: Decrement stock immediately and save approved transaction
        const newQty = item.qty - selectedItem.qty;
        const updatedItem = { ...item, qty: newQty };
        const successBackend = await updateItemBackend(item.code, updatedItem, itemIndex);

        if (successBackend) {
          const transactionData = {
            id: "TX-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
            itemCode: item.code,
            itemName: getItemDisplayName(item),
            qty: selectedItem.qty,
            borrower: borrowerName,
            date: borrowDate,
            type: "borrow",
            status: "borrowed",
            notes: borrowNotes,
            expectedReturnDate,
            bookingId: bookingId || "",
            room: borrowRoom,
            slot: borrowSlot,
            supervisingTeacher: supervisingTeacher || "",
            createdAt: new Date().toISOString()
          };
          const success = await saveTransaction(transactionData);
          if (success) processedCount++;
        }
      }
    }

    if (processedCount > 0) {
      if (userRole === "student") {
        showToast(`ส่งคำขออนุมัติยืม ${processedCount} รายการเรียบร้อยแล้ว!`, "info");
      } else {
        showToast(`ทำรายการยืม ${processedCount} รายการสำเร็จ!`, "success");
      }
      
      // Clear selection and reset form
      selectedBorrowItems = [];
      renderSelectedBorrowItems();
      form.reset();
      
      if (borrowBookingSelect) {
        borrowBookingSelect.value = "";
        borrowBookingSelect.dispatchEvent(new Event('change'));
      }
      
      updateBorrowFormUI();
      updateUI();
    }
  });
}

function renderTransactionsTable() {
  const tableBody = document.getElementById("transactionsTableBody");
  if (!tableBody) return;

  if (transactions.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="2" style="text-align: center; padding: 48px;">
          <div class="empty-state">
            <div class="empty-state-icon"><i data-lucide="history"></i></div>
            <div class="empty-state-text">ยังไม่มีประวัติการทำรายการยืม-คืน</div>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  // Sort transactions by date/time (newest first)
  const sortedTrans = [...transactions].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  let html = "";
  sortedTrans.forEach(tx => {
    let nameThai = tx.itemName;
    const braceIndex = tx.itemName.indexOf("(");
    if (braceIndex !== -1) {
      nameThai = tx.itemName.substring(0, braceIndex).trim();
    }

    html += `
      <tr class="table-clickable-row" onclick="showTransactionDetail('${tx.id}')" style="cursor: pointer;" title="คลิกเพื่อดูรายละเอียดเพิ่มเติม">
        <td data-label="วันทำรายการ" style="font-size: 12px; color: var(--text-muted);">${formatThaiDate(tx.date)}</td>
        <td data-label="รายการพัสดุ">
          <div style="font-weight: 600; color: #0f172a; font-size: 12.5px; line-height: 1.5;">${nameThai}</div>
        </td>
      </tr>
    `;
  });

  tableBody.innerHTML = html;
}
// Quick click action to Return currently borrowed item
window.returnBorrowedItem = async function(transId) {
  const txIndex = transactions.findIndex(t => t.id === transId);
  if (txIndex === -1) return;
  const tx = transactions[txIndex];

  if (confirm(`คุณต้องการยืนยันการคืนพัสดุ "${tx.itemName}" จำนวน ${tx.qty} หน่วย จากผู้ยืม "${tx.borrower}" ใช่หรือไม่?`)) {
    // Find the item
    const itemIndex = items.findIndex(i => i.code === tx.itemCode);
    if (itemIndex === -1) {
      showToast("ไม่พบพัสดุนี้ในระบบคลัง (อาจถูกลบไปแล้ว)", "error");
      return;
    }
    const item = items[itemIndex];

    // Calculate new stock quantity
    const newQty = item.qty + tx.qty;

    // Update item stock in backend/cloud
    const updatedItem = { ...item, qty: newQty };
    const success = await updateItemBackend(item.code, updatedItem, itemIndex);

    if (success) {
      // Update transaction status
      const updatedTrans = { ...tx, status: "returned" };
      
      // Update in Firebase or LocalStorage
      if (isFirebaseOnline) {
        try {
          await db.collection("transactions").doc(transId).set(updatedTrans);
          transactions[txIndex] = updatedTrans;
        } catch (err) {
          console.error("🔥 Failed to update transaction on Firebase:", err);
          showToast("เกิดข้อผิดพลาดในการบันทึกสถานะลงคลาวด์", "error");
          return;
        }
      } else {
        // Local fallback
        transactions[txIndex] = updatedTrans;
        localStorage.setItem("lab_transactions", JSON.stringify(transactions));
      }

      showToast(`คืน "${getItemDisplayName(item)}" จำนวน ${tx.qty} หน่วย เรียบร้อยแล้ว!`, "success");
      updateUI();
    }
  }
};

// ==========================================================================
// LABORATORY ROOM BOOKING SYSTEM
// ==========================================================================

async function loadAllBookings() {
  const defaultBookings = [
    {
      id: "book_mock_001",
      room: "Lab 1",
      date: new Date().toISOString().split('T')[0],
      slot: "3",
      bookerName: "นายสมชาย เรียนดี",
      purpose: "เพื่อทดสอบกระบวนการทำแล็บเคมีเบื้องต้น",
      prepItems: [
        {
          code: "CHEM-001",
          qty: 2
        }
      ],
      status: "approved",
      createdAt: new Date().toISOString()
    },
    {
      id: "book_mock_002",
      room: "Lab 2",
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      slot: "4, 5",
      bookerName: "นางสาวสมหญิง ใจดี",
      purpose: "ทดลองเรื่องกลศาสตร์แรงและการหมุน",
      prepItems: [
        {
          code: "CHEM-003",
          qty: 1
        }
      ],
      status: "approved",
      createdAt: new Date().toISOString()
    }
  ];

  if (isFirebaseOnline) {
    try {
      const snapshot = await db.collection("bookings").get();
      const loadedBookings = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d && d.id) {
          loadedBookings.push(d);
        }
      });
      bookings = loadedBookings;
      
      // Smart merge missing default bookings
      let updated = false;
      const batch = db.batch();
      defaultBookings.forEach(demoBk => {
        if (!bookings.some(b => b.id === demoBk.id)) {
          bookings.push(demoBk);
          const docRef = db.collection("bookings").doc(demoBk.id);
          batch.set(docRef, demoBk);
          updated = true;
        }
      });
      if (updated) {
        await batch.commit();
        console.log("🔥 Seeded missing mock bookings to Firebase Firestore.");
      }
      
      console.log("🔥 Loaded " + bookings.length + " bookings from Firebase Cloud.");
      return;
    } catch (err) {
      console.error("🔥 Failed to load bookings from Firebase:", err);
      isFirebaseOnline = false;
    }
  }

  // LocalStorage Fallback
  const localBookings = localStorage.getItem("lab_bookings");
  if (localBookings) {
    bookings = JSON.parse(localBookings);
    
    // Smart merge default bookings
    let updated = false;
    defaultBookings.forEach(demoBk => {
      if (!bookings.some(b => b.id === demoBk.id)) {
        bookings.push(demoBk);
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem("lab_bookings", JSON.stringify(bookings));
    }
  } else {
    bookings = [...defaultBookings];
    localStorage.setItem("lab_bookings", JSON.stringify(bookings));
  }
}

async function saveBooking(bookingData) {
  if (isFirebaseOnline) {
    try {
      await db.collection("bookings").doc(bookingData.id).set(bookingData);
      bookings.push(bookingData);
      return true;
    } catch (err) {
      console.error("🔥 Firebase save booking failed:", err);
      showToast("เกิดข้อผิดพลาดในการบันทึกการจองลงคลาวด์", "error");
      return false;
    }
  }

  // LocalStorage Fallback
  bookings.push(bookingData);
  localStorage.setItem("lab_bookings", JSON.stringify(bookings));
  return true;
}

async function updateBookingStatus(bookingId, status) {
  const index = bookings.findIndex(b => b.id === bookingId);
  if (index === -1) return false;

  const updatedBooking = { ...bookings[index], status: status };

  if (isFirebaseOnline) {
    try {
      await db.collection("bookings").doc(bookingId).set(updatedBooking);
      bookings[index] = updatedBooking;
      return true;
    } catch (err) {
      console.error("🔥 Firebase update booking failed:", err);
      showToast("เกิดข้อผิดพลาดในการเปลี่ยนสถานะการจองบนคลาวด์", "error");
      return false;
    }
  }

  // LocalStorage Fallback
  bookings[index] = updatedBooking;
  localStorage.setItem("lab_bookings", JSON.stringify(bookings));
  return true;
}

function renderBookingSlots() {
  const grid = document.getElementById("bookingSlotsGrid");
  const room = document.getElementById("bookingRoom") ? document.getElementById("bookingRoom").value : "Lab 1";
  const date = document.getElementById("bookingDate") ? document.getElementById("bookingDate").value : "";

  // Show booking form vs access denied banner based on role
  const bookingForm = document.getElementById("bookingForm");
  const bookingAccessDenied = document.getElementById("bookingAccessDenied");
  if (bookingForm && bookingAccessDenied) {
    if (userRole === "student") {
      bookingForm.style.display = "none";
      bookingAccessDenied.style.display = "block";
    } else {
      bookingForm.style.display = "block";
      bookingAccessDenied.style.display = "none";
    }
  }

  if (!grid) return;

  if (!date) {
    grid.innerHTML = `<div style="grid-column: span 1; text-align: center; color: var(--text-muted); font-size: 13px; padding: 12px;">-- กรุณาเลือกวันที่ก่อนเพื่อตรวจสอบความว่าง --</div>`;
    return;
  }

  // Get active bookings for this room, date, and status = "approved" (not cancelled)
  const activeBookings = bookings.filter(b => b.room === room && b.date === date && b.status === "approved");
  
  let html = "";
  BOOKING_SLOTS.forEach(slot => {
    // Check if slot is booked (supports multiple comma-separated slots in a booking)
    const isBooked = activeBookings.some(b => b.slot.split(", ").includes(slot));
    const isSelected = selectedSlots.includes(slot);

    let statusClass = "vacant";
    let statusLabel = "🟢 ว่าง";
    if (isBooked) {
      statusClass = "booked";
      statusLabel = `<i data-lucide="lock" style="width: 12px; height: 12px;"></i> ถูกจองแล้ว`;
    } else if (isSelected) {
      statusClass = "selected";
      statusLabel = "🟣 เลือกอยู่";
    }

    html += `
      <div class="booking-slot-card ${statusClass}" onclick="selectBookingSlot('${slot}', ${isBooked})">
        <div class="booking-slot-time">
          <i data-lucide="clock" style="width: 16px; height: 16px;"></i>
          <span>${slot}</span>
        </div>
        <span class="booking-slot-status ${statusClass}">${statusLabel}</span>
      </div>
    `;
  });

  grid.innerHTML = html;
  lucide.createIcons();
}

// Helper function to check if selected slots are consecutive
function areSlotsConsecutive(slots) {
  if (slots.length <= 1) return true;
  const indices = slots.map(s => BOOKING_SLOTS.indexOf(s));
  indices.sort((a, b) => a - b);
  for (let i = 0; i < indices.length - 1; i++) {
    if (indices[i+1] - indices[i] !== 1) {
      return false;
    }
  }
  return true;
}

window.selectBookingSlot = function(slot, isBooked) {
  if (isBooked) {
    showToast("ช่วงเวลานี้ถูกจองไปแล้ว กรุณาเลือกช่วงเวลาอื่น", "error");
    return;
  }

  const slotIndex = BOOKING_SLOTS.indexOf(slot);
  if (slotIndex === -1) return;

  if (selectedSlots.includes(slot)) {
    // Deselect if clicked again
    const tempSlots = selectedSlots.filter(s => s !== slot);
    if (areSlotsConsecutive(tempSlots)) {
      selectedSlots = tempSlots;
    } else {
      // If deselecting a slot in the middle breaks consecutiveness, reset selection to empty
      selectedSlots = [];
      showToast("ล้างการเลือกแล้ว เนื่องจากคุณยกเลิกคาบตรงกลางของการเลือกแบบคาบติดต่อ", "info");
    }
  } else {
    if (selectedSlots.length === 0) {
      selectedSlots = [slot];
    } else {
      // Find the indices of currently selected slots to enforce consecutive selection
      const currentIndices = selectedSlots.map(s => BOOKING_SLOTS.indexOf(s));
      const minIndex = Math.min(...currentIndices);
      const maxIndex = Math.max(...currentIndices);

      if (slotIndex === minIndex - 1 || slotIndex === maxIndex + 1) {
        // Consecutive slot! Add to selection
        selectedSlots.push(slot);
      } else {
        // Not consecutive! Smooth UX: reset selection to only the newly clicked slot
        selectedSlots = [slot];
      }
    }
  }

  // Sort selected slots in class period order
  selectedSlots.sort((a, b) => BOOKING_SLOTS.indexOf(a) - BOOKING_SLOTS.indexOf(b));

  const selectedSlotInput = document.getElementById("selectedBookingSlot");
  if (selectedSlotInput) {
    selectedSlotInput.value = selectedSlots.join(", ");
  }

  // Re-render slots to show selected status
  renderBookingSlots();
};

function setupBookingForm() {
  const form = document.getElementById("bookingForm");
  const btnReset = document.getElementById("btnResetBooking");
  const bookingDateInput = document.getElementById("bookingDate");
  const bookingRoomSelect = document.getElementById("bookingRoom");

  if (!form) return;

  // Set default date to today
  if (bookingDateInput) {
    const today = new Date().toISOString().split('T')[0];
    bookingDateInput.value = today;
  }

  // Listeners to re-render slot matrix whenever Room or Date changes
  if (bookingDateInput) {
    bookingDateInput.addEventListener("change", () => {
      // Clear selected slots
      selectedSlots = [];
      const selectedSlotInput = document.getElementById("selectedBookingSlot");
      if (selectedSlotInput) selectedSlotInput.value = "";
      renderBookingSlots();
    });
  }

  if (bookingRoomSelect) {
    bookingRoomSelect.addEventListener("change", () => {
      // Clear selected slots
      selectedSlots = [];
      const selectedSlotInput = document.getElementById("selectedBookingSlot");
      if (selectedSlotInput) selectedSlotInput.value = "";
      renderBookingSlots();
    });
  }

  // Reset handler
  btnReset.addEventListener("click", () => {
    form.reset();
    if (bookingDateInput) {
      const today = new Date().toISOString().split('T')[0];
      bookingDateInput.value = today;
    }
    selectedSlots = [];
    const selectedSlotInput = document.getElementById("selectedBookingSlot");
    if (selectedSlotInput) selectedSlotInput.value = "";
    
    // Reset prep items checklist checkboxes
    document.querySelectorAll('input[name="bookingPrepItem"]').forEach(cb => cb.checked = false);
    
    renderBookingSlots();
  });

  // Submit handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (userRole === "student") {
      showToast("เฉพาะครูและเจ้าหน้าที่แล็บเท่านั้นที่สามารถจองห้องปฏิบัติการได้", "error");
      return;
    }

    const room = document.getElementById("bookingRoom").value;
    const date = document.getElementById("bookingDate").value;
    const slot = document.getElementById("selectedBookingSlot").value;
    const bookerName = document.getElementById("bookerName").value.trim();
    const purpose = document.getElementById("bookingPurpose").value.trim();

    if (!room || !date || !slot || !bookerName || !purpose) {
      showToast("กรุณากรอกข้อมูลและเลือกช่วงเวลาว่างให้ครบถ้วน", "error");
      return;
    }

    const slotsToBook = slot.split(", ");

    // Defensive check to ensure selected slots are consecutive
    if (!areSlotsConsecutive(slotsToBook)) {
      showToast("กรุณาเลือกช่วงเวลาที่ติดต่อกันเท่านั้น (สำหรับคาบคู่/คาบติดต่อ)", "error");
      return;
    }

    // Defensive double-booking check (check if any of the selected slots are already booked)
    const isAlreadyBooked = bookings.some(b => {
      if (b.room !== room || b.date !== date || b.status !== "approved") return false;
      const bookedSlots = b.slot.split(", ");
      return slotsToBook.some(s => bookedSlots.includes(s));
    });

    if (isAlreadyBooked) {
      showToast("ไม่สามารถจองได้! มีบางช่วงเวลาที่คุณเลือกถูกจองตัดหน้าไปแล้ว", "error");
      return;
    }

    // Retrieve prep items checklist
    const prepCheckboxes = document.querySelectorAll('input[name="bookingPrepItem"]:checked');
    const prepItems = Array.from(prepCheckboxes).map(cb => {
      const code = cb.value;
      const qtyInput = document.querySelector(`.prep-qty-input[data-code="${code}"]`);
      return {
        code,
        qty: qtyInput ? Number(qtyInput.value) : 1
      };
    });

    const bookingData = {
      id: "book_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      room,
      date,
      slot,
      bookerName,
      purpose,
      prepItems,
      status: "approved",
      createdAt: new Date().toISOString()
    };

    const success = await saveBooking(bookingData);
    if (success) {
      showToast(`จองห้อง "${getRoomThaiName(room)}" ช่วงเวลา ${slot} เรียบร้อยแล้ว!`, "success");
      form.reset();
      if (bookingDateInput) {
        const today = new Date().toISOString().split('T')[0];
        bookingDateInput.value = today;
      }
      selectedSlots = [];
      const selectedSlotInput = document.getElementById("selectedBookingSlot");
      if (selectedSlotInput) selectedSlotInput.value = "";
      
      // Clear prep check boxes
      document.querySelectorAll('input[name="bookingPrepItem"]').forEach(cb => cb.checked = false);
      
      updateUI();
    }
  });
}

function renderBookingsTable() {
  const tableBody = document.getElementById("bookingsTableBody");
  if (!tableBody) return;

  // Sort bookings: newest first
  const sortedBookings = [...bookings].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return dateB - dateA;
  });

  if (sortedBookings.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="2" style="text-align: center; padding: 40px;">
          <div class="empty-state">
            <div class="empty-state-icon"><i data-lucide="calendar-x"></i></div>
            <div class="empty-state-text">ยังไม่มีประวัติการจองห้องปฏิบัติการ</div>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  let html = "";
  sortedBookings.forEach(b => {
    // Format Date nicely for display
    const formattedDate = formatThaiDate(b.date);
    
    // Split slots by comma and create a line for each slot
    const slotHtml = b.slot.split(", ").map(s => `
      <div style="font-weight: 600; color: var(--text-main); font-size: 11px; line-height: 1.4; margin-top: 2px;">${s}</div>
    `).join("");

    html += `
      <tr class="table-clickable-row" onclick="showBookingDetail('${b.id}')" style="cursor: pointer;" title="คลิกเพื่อดูรายละเอียดเพิ่มเติม">
        <td data-label="วันที่เข้าใช้" style="font-size: 12px; font-weight: 500; color: var(--text-muted);">${formattedDate}</td>
        <td data-label="ห้องแล็บ">
          <div style="margin-bottom: 4px;">
            <span style="font-family: var(--font-sans); background-color: rgba(139, 92, 246, 0.08); color: #8b5cf6; font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 600; display: inline-block; width: max-content;">${getRoomThaiName(b.room)}</span>
          </div>
          ${slotHtml}
        </td>
      </tr>
    `;
  });

  tableBody.innerHTML = html;
  lucide.createIcons();
}

window.cancelBookingRecord = async function(bookingId) {
  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) return;

  if (confirm(`คุณต้องการยกเลิกการจองห้อง "${getRoomThaiName(booking.room)}" ช่วงเวลา ${booking.slot} ในวันที่ ${formatThaiDate(booking.date)} ใช่หรือไม่?`)) {
    const success = await updateBookingStatus(bookingId, "cancelled");
    if (success) {
      showToast("ยกเลิกการจองห้องปฏิบัติการเรียบร้อยแล้ว!", "warning");
      updateUI();
    }
  }
};

// ==========================================================================
// ADMIN LOGIN SYSTEM
// ==========================================================================
function updateLoginUI() {
  const sidebarLoginText = document.getElementById("sidebarLoginText");
  const sidebarLoginIcon = document.getElementById("sidebarLoginIcon");
  
  if (isAdminLoggedIn) {
    if (sidebarLoginText) sidebarLoginText.innerText = "ออกจากระบบ";
    if (sidebarLoginIcon) {
      sidebarLoginIcon.setAttribute("data-lucide", "log-out");
    }
  } else {
    if (sidebarLoginText) sidebarLoginText.innerText = "เข้าสู่ระบบหลังบ้าน";
    if (sidebarLoginIcon) {
      sidebarLoginIcon.setAttribute("data-lucide", "log-in");
    }
    
    // Redirect if on admin panel
    const activePanel = document.querySelector(".panel.active");
    if (activePanel && activePanel.id === "panel-add-item") {
      navigateToPanel("dashboard");
    }
  }

  // Show/Hide Admin-Only navigation items
  const menuItemAddItem = document.getElementById("menuItemAddItem");
  const menuItemImport = document.getElementById("menuItemImport");
  if (menuItemAddItem) {
    menuItemAddItem.style.display = "block";
  }
  if (menuItemImport) {
    menuItemImport.style.display = "block";
  }
  
  // Update role switcher toggle state visual representation
  const btnStudent = document.getElementById("roleBtnStudent");
  const btnTeacher = document.getElementById("roleBtnTeacher");
  const btnAdmin = document.getElementById("roleBtnAdmin");
  
  if (btnStudent && btnTeacher && btnAdmin) {
    [btnStudent, btnTeacher, btnAdmin].forEach(btn => {
      btn.classList.remove("active");
      btn.style.background = "none";
      btn.style.color = "rgba(255,255,255,0.6)";
    });
    
    let activeBtn;
    if (userRole === "admin") activeBtn = btnAdmin;
    else if (userRole === "teacher") activeBtn = btnTeacher;
    else activeBtn = btnStudent;
    
    if (activeBtn) {
      activeBtn.classList.add("active");
      activeBtn.style.background = "rgba(255,255,255,0.15)";
      activeBtn.style.color = "#ffffff";
    }
  }
  
  // Update entire UI to apply admin / viewer state
  updateUI();
}

function setupLoginHandlers() {
  const btnSidebarLogin = document.getElementById("btnSidebarLogin");
  const loginModal = document.getElementById("loginModal");
  const loginModalClose = document.getElementById("loginModalClose");
  const btnCancelLogin = document.getElementById("btnCancelLogin");
  const adminLoginForm = document.getElementById("adminLoginForm");
  const btnTogglePassword = document.getElementById("btnTogglePassword");
  const loginPasswordInput = document.getElementById("loginPassword");
  const eyeIcon = document.getElementById("eyeIcon");

  if (btnSidebarLogin) {
    btnSidebarLogin.addEventListener("click", (e) => {
      e.preventDefault();
      const isUserLoggedIn = (userRole === "admin" || userRole === "teacher");
      if (isUserLoggedIn) {
        // Logout
        isAdminLoggedIn = false;
        userRole = "student";
        localStorage.removeItem("isAdminLoggedIn");
        localStorage.removeItem("userRole");
        showToast("ออกจากระบบเรียบร้อยแล้ว", "info");
        updateLoginUI();
        lucide.createIcons();
      } else {
        // Show login modal
        if (loginModal) {
          loginModal.classList.add("active");
          const usernameInput = document.getElementById("loginUsername");
          if (usernameInput) usernameInput.value = "";
          if (loginPasswordInput) loginPasswordInput.value = "";
          const errorMsg = document.getElementById("loginErrorMsg");
          if (errorMsg) errorMsg.style.display = "none";
          lucide.createIcons();
        }
      }
    });
  }

  // Close modal helper
  const closeModal = () => {
    if (loginModal) loginModal.classList.remove("active");
  };

  if (loginModalClose) {
    loginModalClose.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal();
    });
  }
  
  if (btnCancelLogin) {
    btnCancelLogin.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal();
    });
  }

  // Submit login form
  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const usernameInput = document.getElementById("loginUsername");
      const username = usernameInput ? usernameInput.value.trim() : "";
      const password = loginPasswordInput ? loginPasswordInput.value : "";

      // Check credentials based on credentials configuration
      if (username === USER_CREDENTIALS.admin.username && password === USER_CREDENTIALS.admin.password) {
        isAdminLoggedIn = true;
        userRole = "admin";
        localStorage.setItem("isAdminLoggedIn", "true");
        localStorage.setItem("userRole", "admin");
        showToast("เข้าสู่ระบบในฐานะ เจ้าหน้าที่แล็บ สำเร็จ!", "success");
        closeModal();
        updateLoginUI();
        lucide.createIcons();
      } else if (username === USER_CREDENTIALS.teacher.username && password === USER_CREDENTIALS.teacher.password) {
        isAdminLoggedIn = false;
        userRole = "teacher";
        localStorage.setItem("isAdminLoggedIn", "false");
        localStorage.setItem("userRole", "teacher");
        showToast("เข้าสู่ระบบในฐานะ ครูผู้สอน สำเร็จ!", "success");
        closeModal();
        updateLoginUI();
        lucide.createIcons();
      } else {
        const errorMsg = document.getElementById("loginErrorMsg");
        if (errorMsg) errorMsg.style.display = "flex";
      }
    });
  }

  // Password visibility toggle
  if (btnTogglePassword && loginPasswordInput && eyeIcon) {
    btnTogglePassword.addEventListener("click", (e) => {
      e.preventDefault();
      if (loginPasswordInput.type === "password") {
        loginPasswordInput.type = "text";
        eyeIcon.setAttribute("data-lucide", "eye-off");
      } else {
        loginPasswordInput.type = "password";
        eyeIcon.setAttribute("data-lucide", "eye");
      }
      lucide.createIcons();
    });
  }
}

// Function to initialize and handle the custom Access Denied modal (Lock Screen)
function setupAccessDeniedModal() {
  const modal = document.getElementById("accessDeniedModal");
  const btnClose = document.getElementById("accessDeniedModalClose");
  const btnRequest = document.getElementById("btnAccessDeniedRequest");
  const loginModal = document.getElementById("loginModal");

  if (!modal) return;

  const closeModal = () => {
    modal.classList.remove("active");
  };

  if (btnClose) {
    btnClose.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal();
    });
  }

  // Close modal when clicking on the overlay backdrop
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Request Access button click logic: closes lock modal and launches login modal
  if (btnRequest) {
    btnRequest.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal();
      
      if (loginModal) {
        loginModal.classList.add("active");
        setTimeout(() => {
          const usernameInput = document.getElementById("loginUsername");
          if (usernameInput) usernameInput.focus();
        }, 100);
      }
      lucide.createIcons();
    });
  }
}

// ==========================================================================
// DETAIL MODAL SYSTEM
// ==========================================================================
window.showTransactionDetail = function(txId) {
  const tx = transactions.find(t => t.id === txId);
  if (!tx) return;

  const modal = document.getElementById("detailModal");
  const title = document.getElementById("detailModalTitle");
  const body = document.getElementById("detailModalBody");
  const footer = document.getElementById("detailModalFooter");

  if (!modal || !title || !body || !footer) return;

  // Set Title
  title.innerHTML = `
    <i data-lucide="history" style="width: 18px; height: 18px; color: #8b5cf6;"></i>
    <span>รายละเอียดการยืม-คืนพัสดุ</span>
  `;

  // Determine status and badge classes
  const isBorrowed = tx.type === "borrow";
  const statusText = tx.status === "borrowed" ? "กำลังยืม" : "คืนแล้ว";
  const statusBadge = tx.status === "borrowed" ? "badge-borrowed" : "badge-returned";

  // Build Body HTML
  body.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <div style="display: grid; grid-template-columns: 1fr 2fr; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
        <span style="font-weight: 600; color: var(--text-muted);">รายการพัสดุ:</span>
        <span style="font-weight: 600; color: #0f172a;">${tx.itemName}</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 2fr; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
        <span style="font-weight: 600; color: var(--text-muted);">รหัสรายการ:</span>
        <span style="font-family: monospace; font-size: 13px;">${tx.itemCode}</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 2fr; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
        <span style="font-weight: 600; color: var(--text-muted);">จำนวน:</span>
        <span style="font-weight: 600;">${tx.qty} หน่วย</span>
      </div>
      ${tx.damagedQty && tx.damagedQty > 0 ? `
      <div style="display: grid; grid-template-columns: 1fr 2fr; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
        <span style="font-weight: 600; color: var(--accent-red);">ชำรุดเสียหาย:</span>
        <span style="font-weight: 600; color: var(--accent-red);">${tx.damagedQty} หน่วย</span>
      </div>
      ` : ""}
      <div style="display: grid; grid-template-columns: 1fr 2fr; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
        <span style="font-weight: 600; color: var(--text-muted);">ผู้ทำรายการ:</span>
        <span style="font-weight: 500;">${tx.borrower}</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 2fr; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
        <span style="font-weight: 600; color: var(--text-muted);">วันที่ทำรายการ:</span>
        <span>${formatThaiDate(tx.date)}</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 2fr; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
        <span style="font-weight: 600; color: var(--text-muted);">ประเภท:</span>
        <span><span class="${statusBadge}" style="display: inline-block;">${statusText}</span></span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-weight: 600; color: var(--text-muted);">หมายเหตุ / วัตถุประสงค์:</span>
        <div style="background-color: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding: 10px 12px; font-size: 13px; color: var(--text-main); font-style: italic; min-height: 50px;">
          ${tx.notes || "-"}
        </div>
      </div>
    </div>
  `;

  // Build Footer Actions
  let actionBtn = "";
  if (tx.status === "borrowed") {
    actionBtn = `
      <button class="btn btn-primary" style="background-color: var(--accent-green); border-color: var(--accent-green); display: inline-flex; align-items: center; gap: 6px;" onclick="closeDetailModal(); setTimeout(() => returnBorrowedItem('${tx.id}'), 200);">
        <i data-lucide="check" style="width: 16px; height: 16px;"></i>
        <span>คืนพัสดุ</span>
      </button>
    `;
  }
  footer.innerHTML = `
    <button class="btn btn-secondary" onclick="closeDetailModal()">ปิด</button>
    ${actionBtn}
  `;

  // Show Modal
  modal.classList.add("active");
  lucide.createIcons();
};

window.showBookingDetail = function(bkId) {
  const bk = bookings.find(b => b.id === bkId);
  if (!bk) return;

  const modal = document.getElementById("detailModal");
  const title = document.getElementById("detailModalTitle");
  const body = document.getElementById("detailModalBody");
  const footer = document.getElementById("detailModalFooter");

  if (!modal || !title || !body || !footer) return;

  // Set Title
  title.innerHTML = `
    <i data-lucide="calendar" style="width: 18px; height: 18px; color: #8b5cf6;"></i>
    <span>รายละเอียดการจองห้องปฏิบัติการ</span>
  `;

  // Determine status and badge classes
  const isApproved = bk.status === "approved";
  const statusClass = isApproved ? "badge-approved" : "badge-cancelled";
  const statusLabel = isApproved ? "อนุมัติ" : "ยกเลิกแล้ว";

  let prepHtml = "";
  if (bk.prepItems && bk.prepItems.length > 0) {
    prepHtml = `
      <div style="display: flex; flex-direction: column; gap: 4px; border-top: 1px solid #f1f5f9; padding-top: 10px;">
        <span style="font-weight: 600; color: var(--text-muted);">วัสดุ / สารเคมีที่เตรียมสอน:</span>
        <div style="display: flex; flex-direction: column; gap: 4px; padding-left: 12px; margin-top: 4px;">
          ${bk.prepItems.map(pi => {
            const item = items.find(i => i.code === pi.code);
            const name = item ? getItemDisplayName(item) : pi.code;
            const unit = item ? item.unit : "หน่วย";
            return `<div style="font-size: 13px; font-weight: 500; color: #334155;">• ${name} (${pi.code}) - <strong>${pi.qty}</strong> ${unit}</div>`;
          }).join("")}
        </div>
      </div>
    `;
  }

  // Build Body HTML
  body.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <div style="display: grid; grid-template-columns: 1fr 2fr; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
        <span style="font-weight: 600; color: var(--text-muted);">ห้องแล็บ:</span>
        <span style="font-weight: 600; color: #0f172a;">${getRoomThaiName(bk.room)}</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 2fr; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
        <span style="font-weight: 600; color: var(--text-muted);">วันที่จองเข้าใช้:</span>
        <span style="font-weight: 600;">${formatThaiDate(bk.date)}</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 2fr; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
        <span style="font-weight: 600; color: var(--text-muted);">ช่วงเวลา (คาบ):</span>
        <span style="font-weight: 600; color: #8b5cf6;">${bk.slot}</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 2fr; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
        <span style="font-weight: 600; color: var(--text-muted);">ผู้จองห้องแล็บ:</span>
        <span style="font-weight: 500;">${bk.bookerName}</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 2fr; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
        <span style="font-weight: 600; color: var(--text-muted);">สถานะการจอง:</span>
        <span><span class="badge ${statusClass}" style="display: inline-block;">${statusLabel}</span></span>
      </div>
      ${bk.purpose ? `
      <div style="display: flex; flex-direction: column; gap: 4px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
        <span style="font-weight: 600; color: var(--text-muted);">วัตถุประสงค์การใช้งาน:</span>
        <div style="background-color: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding: 10px 12px; font-size: 13px; color: var(--text-main); font-style: italic; min-height: 40px;">
          ${bk.purpose}
        </div>
      </div>` : ''}
      ${prepHtml}
    </div>
  `;

  // Build Footer Actions
  let actionBtn = "";
  if (isApproved) {
    actionBtn = `
      <button class="btn btn-primary" style="background-color: var(--accent-red); border-color: var(--accent-red); display: inline-flex; align-items: center; gap: 6px;" onclick="closeDetailModal(); setTimeout(() => cancelBookingRecord('${bk.id}'), 200);">
        <i data-lucide="x-circle" style="width: 16px; height: 16px;"></i>
        <span>ยกเลิกการจอง</span>
      </button>
    `;
  }
  footer.innerHTML = `
    <button class="btn btn-secondary" onclick="closeDetailModal()">ปิด</button>
    ${actionBtn}
  `;

  // Show Modal
  modal.classList.add("active");
  lucide.createIcons();
};

window.closeDetailModal = function() {
  const modal = document.getElementById("detailModal");
  if (modal) modal.classList.remove("active");
};

// Setup detail modal listeners on load
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("detailModal");
  const closeBtn = document.getElementById("detailModalClose");
  
  if (modal) {
    if (closeBtn) closeBtn.addEventListener("click", window.closeDetailModal);
    
    // Close modal when clicking on overlay background
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        window.closeDetailModal();
      }
    });
  }
});

// ==========================================================================
// TEACHER PORTAL & SCIENCE LAB FEATURE SUITE (v1.6.0) FUNCTIONS
// ==========================================================================

function setupRoleSwitcher() {
  // Disabled - unified admin/teacher role
}

function renderDashboardOverdueAlerts() {
  const container = document.getElementById("dashboardOverdueContainer");
  const countBadge = document.getElementById("dashboardOverdueCount");
  if (!container) return;

  const overdueTrans = transactions.filter(tx => {
    return tx.type === "borrow" && tx.status === "borrowed" && tx.expectedReturnDate && tx.expectedReturnDate < "2026-05-28";
  });

  if (overdueTrans.length === 0) {
    if (countBadge) countBadge.style.display = "none";
    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; padding: 16px; background-color: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.15); border-radius: var(--border-radius-md); color: #10b981; font-size: 13px;">
        <i data-lucide="check-circle" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
        <div style="font-weight: 500;">ไม่มีรายการค้างคืนที่เกินกำหนดส่ง!</div>
      </div>
    `;
    return;
  }

  if (countBadge) {
    countBadge.innerText = overdueTrans.length;
    countBadge.style.display = "inline-flex";
  }

  let html = `<div style="display: flex; flex-direction: column; gap: 12px;">`;
  overdueTrans.forEach(tx => {
    html += `
      <div style="display: flex; flex-direction: column; gap: 6px; padding: 12px 16px; background-color: rgba(239, 68, 68, 0.04); border: 1px solid rgba(239, 68, 68, 0.15); border-radius: var(--border-radius-md);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <span style="font-size: 13px; font-weight: 600; color: #0f172a;">${tx.itemName}</span>
          <span class="badge badge-red" style="font-size: 10px; padding: 1px 6px;">⚠️ เกินกำหนด ${getOverdueDays(tx.expectedReturnDate)} วัน</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); flex-wrap: wrap; gap: 4px;">
          <span>ผู้ยืม: <strong>${tx.borrower}</strong> (จำนวน: ${tx.qty})</span>
          <span>กำหนดคืน: <strong style="color: var(--accent-red);">${formatThaiDate(tx.expectedReturnDate)}</strong></span>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}

function getOverdueDays(expectedDateStr) {
  const exp = new Date(expectedDateStr);
  const diffTime = TODAY.getTime() - exp.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

function renderDashboardDamagedStats() {
  const container = document.getElementById("dashboardDamagedContainer");
  if (!container) return;

  const damagedItems = items.filter(item => (item.damagedQty && item.damagedQty > 0) || (item.repairQty && item.repairQty > 0));

  if (damagedItems.length === 0) {
    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; padding: 16px; background-color: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.15); border-radius: var(--border-radius-md); color: #10b981; font-size: 13px;">
        <i data-lucide="shield-check" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
        <div style="font-weight: 500;">ไม่มีรายการพัสดุที่ชำรุดหรืออยู่ระหว่างส่งซ่อม!</div>
      </div>
    `;
    return;
  }

  let totalDamaged = 0;
  let totalRepair = 0;
  
  damagedItems.forEach(item => {
    totalDamaged += (item.damagedQty || 0);
    totalRepair += (item.repairQty || 0);
  });

  let html = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
      <div style="background-color: rgba(239, 68, 68, 0.03); border: 1px solid rgba(239, 68, 68, 0.1); border-radius: var(--border-radius-md); padding: 12px; text-align: center;">
        <div style="font-size: 11px; color: var(--text-muted); font-weight: 500;">ชำรุดทั้งหมด</div>
        <div style="font-size: 20px; font-weight: 700; color: var(--accent-red); margin-top: 4px;">${totalDamaged}</div>
      </div>
      <div style="background-color: rgba(245, 158, 11, 0.03); border: 1px solid rgba(245, 158, 11, 0.1); border-radius: var(--border-radius-md); padding: 12px; text-align: center;">
        <div style="font-size: 11px; color: var(--text-muted); font-weight: 500;">อยู่ระหว่างส่งซ่อม</div>
        <div style="font-size: 20px; font-weight: 700; color: var(--accent-orange); margin-top: 4px;">${totalRepair}</div>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px; max-height: 180px; overflow-y: auto;">
  `;

  damagedItems.forEach(item => {
    const dQty = item.damagedQty || 0;
    const rQty = item.repairQty || 0;
    const isBackoffice = (userRole === "admin" || userRole === "teacher");
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; font-size: 12px;">
        <span style="font-weight: 500; color: #334155;">${getItemDisplayName(item)} (${item.code})</span>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="display: flex; gap: 6px;">
            ${dQty > 0 ? `<span class="badge badge-red" style="font-size: 10px; padding: 1px 6px;">ชำรุด: ${dQty} ${item.unit}</span>` : ""}
            ${rQty > 0 ? `<span class="badge badge-orange" style="font-size: 10px; padding: 1px 6px;">ส่งซ่อม: ${rQty} ${item.unit}</span>` : ""}
          </div>
          ${isBackoffice ? `
            <button class="btn-manage-repair" data-code="${item.code}" style="background: none; border: none; padding: 4px; cursor: pointer; color: var(--text-muted); display: inline-flex; align-items: center; justify-content: center; transition: color 0.2s;" onmouseover="this.style.color='var(--accent-orange)'" onmouseout="this.style.color='var(--text-muted)'" title="จัดการพัสดุชำรุด/ส่งซ่อม">
              <i data-lucide="wrench" style="width: 14px; height: 14px;"></i>
            </button>
          ` : ""}
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;

  if (userRole === "admin" || userRole === "teacher") {
    container.querySelectorAll(".btn-manage-repair").forEach(btn => {
      btn.addEventListener("click", () => {
        const code = btn.getAttribute("data-code");
        openRepairModal(code);
      });
    });
  }

  // Render icons inside dashboard container
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }
}

function renderPendingRequests() {
  const card = document.getElementById("pendingRequestsCard");
  const container = document.getElementById("pendingRequestsContainer");
  const countBadge = document.getElementById("pendingRequestsCount");
  
  if (!card || !container) return;

  if (userRole !== "teacher" && userRole !== "admin") {
    card.style.display = "none";
    return;
  }

  // Get all unique supervising teachers
  const uniqueTeachers = new Set();
  transactions.forEach(tx => {
    if (tx.status === "pending" && tx.supervisingTeacher) {
      uniqueTeachers.add(tx.supervisingTeacher);
    }
  });
  bookings.forEach(b => {
    if (b.status === "approved" && b.bookerName) {
      uniqueTeachers.add(b.bookerName);
    }
  });

  // Populate/maintain filter dropdown
  const filterSelect = document.getElementById("teacherFilterSelect");
  if (filterSelect) {
    const currentFilter = filterSelect.value;
    
    // Clear and rebuild options
    filterSelect.innerHTML = '<option value="all">แสดงทั้งหมด (Show All)</option>';
    uniqueTeachers.forEach(teacher => {
      const option = document.createElement("option");
      option.value = teacher;
      option.textContent = teacher;
      filterSelect.appendChild(option);
    });

    // Handle event listener only once
    if (!filterSelect.dataset.listenerInitialized) {
      filterSelect.addEventListener("change", () => {
        renderPendingRequests();
      });
      filterSelect.dataset.listenerInitialized = "true";
    }

    // Set default value based on role switch
    if (!filterSelect.value || filterSelect.dataset.lastRole !== userRole) {
      filterSelect.dataset.lastRole = userRole;
      if (userRole === "teacher") {
        if (uniqueTeachers.size > 0) {
          filterSelect.value = Array.from(uniqueTeachers)[0];
        } else {
          filterSelect.value = "all";
        }
      } else {
        filterSelect.value = "all";
      }
    } else if (currentFilter && Array.from(filterSelect.options).some(opt => opt.value === currentFilter)) {
      filterSelect.value = currentFilter;
    }
  }

  const selectedTeacher = filterSelect ? filterSelect.value : "all";

  // Filter pending requests
  let filteredTx = transactions.filter(tx => tx.type === "borrow" && tx.status === "pending");
  if (selectedTeacher !== "all") {
    filteredTx = filteredTx.filter(tx => tx.supervisingTeacher === selectedTeacher);
  }

  if (filteredTx.length === 0) {
    card.style.display = "block";
    if (countBadge) countBadge.innerText = "0";
    container.innerHTML = `
      <div style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 13px;">
        ไม่มีคำขอยืมรอดำเนินการในขณะนี้
      </div>
    `;
    return;
  }

  card.style.display = "block";
  if (countBadge) countBadge.innerText = filteredTx.length;

  let html = "";
  filteredTx.forEach(tx => {
    html += `
      <div style="display: flex; flex-direction: column; gap: 8px; padding: 12px; background-color: rgba(245, 158, 11, 0.03); border: 1px solid rgba(245, 158, 11, 0.15); border-radius: var(--border-radius-md); font-size: 13px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
          <div>
            <div style="font-weight: 600; color: #1e293b;">${tx.itemName}</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">รหัส: ${tx.itemCode} | จำนวน: <strong>${tx.qty}</strong></div>
          </div>
          <span class="badge badge-orange" style="font-size: 10px; padding: 1px 6px;">รอดำเนินการ</span>
        </div>
        <div style="font-size: 11px; color: #475569; padding-left: 2px; display: flex; flex-direction: column; gap: 2px;">
          <div>ผู้ยืม: <strong>${tx.borrower}</strong> | วันยืม: ${formatThaiDate(tx.date)}</div>
          ${tx.supervisingTeacher ? `<div>ครูผู้ดูแลคาบ: <strong style="color: var(--primary-purple);">${tx.supervisingTeacher}</strong></div>` : ""}
          ${tx.room && tx.room !== "None" ? `<div>ห้องปฏิบัติการ: <strong>${getRoomThaiName(tx.room)}</strong>${tx.slot && tx.slot !== "None" ? ` (ช่วงเวลา: <strong>${tx.slot}</strong>)` : ""}</div>` : ""}
        </div>
        ${tx.notes ? `<div style="font-size: 11px; color: var(--text-muted); font-style: italic; background-color: #ffffff; padding: 6px; border-radius: 4px; border: 1px solid #f1f5f9;">${tx.notes}</div>` : ""}
        <div style="display: flex; gap: 8px; margin-top: 4px;">
          <button type="button" class="btn btn-primary" style="flex: 1; padding: 6px 12px; font-size: 12px; background-color: var(--accent-green); border-color: var(--accent-green); display: inline-flex; align-items: center; justify-content: center; gap: 4px;" onclick="approveBorrowRequest('${tx.id}')">
            <i data-lucide="check" style="width: 14px; height: 14px;"></i> อนุมัติ
          </button>
          <button type="button" class="btn btn-danger" style="flex: 1; padding: 6px 12px; font-size: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 4px;" onclick="rejectBorrowRequest('${tx.id}')">
            <i data-lucide="x" style="width: 14px; height: 14px;"></i> ปฏิเสธ
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  lucide.createIcons();
}

window.approveBorrowRequest = async function(txId) {
  const txIndex = transactions.findIndex(t => t.id === txId);
  if (txIndex === -1) return;
  const tx = transactions[txIndex];

  // Teacher role validation: Can only approve requests belonging to their class period
  if (userRole === "teacher") {
    const filterSelect = document.getElementById("teacherFilterSelect");
    const activeTeacher = filterSelect ? filterSelect.value : "";
    if (!tx.supervisingTeacher || tx.supervisingTeacher !== activeTeacher) {
      showToast("คุณสามารถอนุมัติเฉพาะคำขอยืมในคาบเรียนของตนเองเท่านั้น (คาบตัวเอง)", "error");
      return;
    }
  }

  // Stock check
  const itemIndex = items.findIndex(i => i.code === tx.itemCode);
  if (itemIndex === -1) {
    showToast("ไม่พบพัสดุในระบบเพื่อตัดสต็อก", "error");
    return;
  }
  const item = items[itemIndex];
  if (tx.qty > item.qty) {
    showToast(`สต็อกคงเหลือไม่พออนุมัติ! (คงเหลือ: ${item.qty} | คำขอ: ${tx.qty})`, "error");
    return;
  }

  // Update item stock
  const updatedItem = { ...item, qty: item.qty - tx.qty };
  const success = await updateItemBackend(item.code, updatedItem, itemIndex);
  if (success) {
    // Approve transaction
    transactions[txIndex].status = "borrowed";
    localStorage.setItem("lab_transactions", JSON.stringify(transactions));
    if (isFirebaseOnline) {
      try {
        await db.collection("transactions").doc(txId).update({ status: "borrowed" });
      } catch (err) {
        console.error("Firebase update failed:", err);
      }
    }
    showToast(`อนุมัติคำขอยืม "${tx.itemName}" เรียบร้อยแล้ว!`, "success");
    updateUI();
  }
};

window.rejectBorrowRequest = async function(txId) {
  const txIndex = transactions.findIndex(t => t.id === txId);
  if (txIndex === -1) return;
  const tx = transactions[txIndex];

  // Teacher role validation: Can only reject requests belonging to their class period
  if (userRole === "teacher") {
    const filterSelect = document.getElementById("teacherFilterSelect");
    const activeTeacher = filterSelect ? filterSelect.value : "";
    if (!tx.supervisingTeacher || tx.supervisingTeacher !== activeTeacher) {
      showToast("คุณสามารถปฏิเสธเฉพาะคำขอยืมในคาบเรียนของตนเองเท่านั้น (คาบตัวเอง)", "error");
      return;
    }
  }

  if (confirm("คุณต้องการปฏิเสธคำขอยืมนี้ใช่หรือไม่?")) {
    transactions[txIndex].status = "rejected";
    localStorage.setItem("lab_transactions", JSON.stringify(transactions));
    if (isFirebaseOnline) {
      try {
        await db.collection("transactions").doc(txId).update({ status: "rejected" });
      } catch (err) {
        console.error("Firebase update failed:", err);
      }
    }
    showToast("ปฏิเสธคำขอยืมเรียบร้อยแล้ว", "info");
    updateUI();
  }
};

window.showItemDetail = function(event, itemCode) {
  if (event && (event.target.closest('button') || event.target.closest('.action-icon-btn'))) return;

  const item = items.find(i => i.code === itemCode);
  if (!item) return;

  const modal = document.getElementById("detailModal");
  const title = document.getElementById("detailModalTitle");
  const body = document.getElementById("detailModalBody");
  const footer = document.getElementById("detailModalFooter");

  if (!modal || !title || !body || !footer) return;

  // Title with icon
  title.innerHTML = `
    <i data-lucide="flask-conical" style="width: 18px; height: 18px; color: #8b5cf6;"></i>
    <span>รายละเอียดสาร/อุปกรณ์</span>
  `;

  // GHS Pictograms Section
  let ghsSection = "";
  if (item.category === "สารเคมี") {
    const ghsInfo = {
      explosive: { text: "ระเบิดได้ (Explosive)", url: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgo8c3ZnCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgdmVyc2lvbj0iMS4wIgogICB3aWR0aD0iNTc5cHQiCiAgIGhlaWdodD0iNTc5cHQiCiAgIHZpZXdCb3g9IjAgMCA1NzkgNTc5Ij4KICA8cGF0aAogICAgIGQ9Ik0gMjUuMzAxMTY1LDI4OS42NzE3MiAyODkuMzI5ODcsNTUzLjcwMDQ0IDU1My40MDI2MSwyODkuNjI3NyBDIDQ2NS4zNTAyMiwyMDEuNjc1NyAzNzcuNDcxODIsMTEzLjU0OTQyIDI4OS4zNzM5LDI1LjY0MzAyNCBMIDI1LjMwMTE2NSwyODkuNjcxNzIgeiIKICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO3N0cm9rZTpub25lIiAvPgogIDxwYXRoCiAgICAgZD0iTSAxNDcuNjU5NDEsMTQ4LjAxMjMzIDYsMjg5LjY3MTczIDE0Ny42Njg4Niw0MzEuMzQwNTkgMjg5LjMyODI3LDU3MyA0MzEuMDE2MDIsNDMxLjMxMjI0IDU3Mi43MDM3OCwyODkuNjI0NDkgNDMxLjA2MzI3LDE0Ny45ODM5OCBDIDM1My4xNjU3MSw3MC4wODY0MjQgMjg5LjQwMzg2LDYuMzQzNDcgMjg5LjM3NTUxLDYuMzQzNDcgYyAtMC4wMjg0LDAgLTYzLjc5OTY1LDYzLjc1MjQwMyAtMTQxLjcxNjEsMTQxLjY2ODg2IHogTSA0MDguNjIxODksMTcwLjQyNTM1IDUyNy44MjEwMywyODkuNjI0NDkgNDA4LjU2NTIsNDA4Ljg4MDMyIDI4OS4zMTg4Miw1MjguMTI2NyAxNzAuMTI5MTMsNDA4Ljg3MDg3IDUwLjkzOTQ0NCwyODkuNjE1MDQgMTcwLjEzODU4LDE3MC40MTU5MSBDIDIzNS42OTU3NCwxMDQuODU4NzQgMjg5LjM0NzE2LDUxLjIyNjIyIDI4OS4zNzU1MSw1MS4yMjYyMiBjIDAuMDI4MywwIDUzLjY4OTIyLDUzLjY0MTk3IDExOS4yNDYzOCwxMTkuMTk5MTMgeiIKICAgICBzdHlsZT0iZmlsbDojZmYwMDAwO3N0cm9rZTpub25lIiAvPgogIDxwYXRoCiAgICAgZD0ibSAzOTMuNSwxNzEuNTYyNSBjIC0wLjA4NzUsMC4wMTExIC0wLjE0Nzg4LDAuMTA0MDggLTAuMjE4NzUsMC4yODEyNSAtMC4wNTkxLDAuMTc3MTggLTExLjMzNzgyLDMyLjMyNjI2IC0yNS4wNjI1LDcxLjQ2ODc1IC0xMy43MjQ2NywzOS4xNDI0OSAtMjQuOTg0LDcxLjIyMjE5IC0yNS4wMzEyNSw3MS4yODEyNSAtMC4xNDE3NCwwLjE0MTczIC0xLjEzNjgsLTAuMjE3MjggLTEuMTI1LC0wLjQwNjI1IDAuMDExOCwtMC4xMjk5MyAyOS4zMjk3MSwtOTEuMzUzMDkgMjkuNjI1LC05Mi4xNTYyNSAwLjAzNTQsLTAuMDk0NSAtMC44NDE1LC0wLjY4Njk5IC0yLjYyNSwtMS43NSAtMi42NTc1NCwtMS41ODI3MSAtMi45Njg3NSwtMS43NTE0OCAtMi45Njg3NSwtMS41NjI1IDAsMC4xNjUzNiAtMjQuNDIxNSw5NS4zNTkgLTI0LjQ2ODc1LDk1LjQwNjI1IC0wLjAyMzYsMC4wMzU0IC0wLjY4OTIxLC0wLjExOTM0IC0xLjQ2ODc1LC0wLjM0Mzc1IC0xLjg2NjE5LC0wLjUzMTUxIC01LjAzODYsLTEuMTc3NjYgLTcuMDkzNzUsLTEuNDM3NSAtMi4zMDMyLC0wLjI4MzQ4IC03LjU0NjIyLC0wLjI5NTI5IC05LjYyNSwwIC05LjcwODg1LDEuMzU4MjkgLTE3LjU3NTE2LDUuMzc0MzggLTI0LjQzNzUsMTIuNDM3NSAtNC44MTg5OSw0Ljk2MDczIC04LjY1NTk4LDExLjM5NDA4IC0xMC42ODc1LDE3LjkzNzUgLTAuMjQ4MDQsMC43Nzk1NSAtMC40ODQsMS40NTI3NSAtMC41MzEyNSwxLjUgLTAuMDQ3MywwLjA0NzIgLTMuNzc2OTksLTIuNjgwMjkgLTguMzEyNSwtNi4wOTM3NSAtNC41MzU1MywtMy40MTM0NSAtOC4yODg4OCwtNi4xOTE2OSAtOC4zMTI1LC02LjE1NjI1IC0wLjAyMzYsMC4wMjM2IDAuNDMzMDYsMC45NTk4NiAxLDIuMDkzNzUgbCAxLjAzMTI1LDIuMDYyNSA3LjEyNSw0Ljc4MTI1IGMgNi44ODU5Niw0LjYxODIgNy4wOTAzLDQuNzg2NjUgNy4wMzEyNSw1LjA5Mzc1IC0wLjA1OTEsMC4yOTUyOCAwLjE3MTk2LDAuNTgwOTEgMi4xNTYyNSwyLjcxODc1IDEuMjE2NTYsMS4zMjI4NiAyLjU1NTM2LDIuNzUwNDcgMi45Njg3NSwzLjE4NzUgbCAwLjc4MTI1LDAuNzgxMjUgMi4wOTM3NSwtMC4xMjUgMi4wOTM3NSwtMC4xMjUgMy45Mzc1LDIuNjI1IGMgMi4xNjE0NiwxLjQyOTE2IDMuNzk0NTQsMi40Nzc4NiAzLjU5Mzc1LDIuMzEyNSAtMC4xODg5OSwtMC4xNjUzNSAtMS43NTYxMiwtMS4zNjg4MyAtMy40Njg3NSwtMi42NTYyNSAtMS43MDA4MiwtMS4yNzU2MSAtMy4wMjAxNywtMi4zMzE5NCAtMi45Mzc1LC0yLjM0Mzc1IDAuMDgyNywtMC4wMTE4IDIuODE0NCwtMC4xNjY1OSA2LjA2MjUsLTAuMzQzNzUgbCA1LjkwNjI1LC0wLjMxMjUgOC41LDQuMjgxMjUgYyA0LjcwMDg5LDIuMzM4NjMgOC41ODk1Niw0LjI1IDguNjI1LDQuMjUgMC4wMzU0LDAgMi4xNzA5NiwtMi41NDU3IDQuNzgxMjUsLTUuNjg3NSAyLjYxMDI5LC0zLjEyOTk3IDQuODIzNTgsLTUuNzgwNTEgNC45MDYyNSwtNS44NzUgMC4xMjk5MywtMC4xNTM1NSAtMC4yMTIzMywtMS4wNDcxNSAtMi4wMzEyNSwtNS41IC0xLjE5Mjk0LC0yLjkxNzM3IC0yLjE0ODYzLC01LjMyMDEzIC0yLjEyNSwtNS4zNDM3NSAwLjAyMzYsLTAuMDExOCAyLjk5ODk0LDAuMjk3NzMgNi42MjUsMC42ODc1IDMuNjI2MDUsMC4zODk3NyA2LjYwOTAxLDAuNjkxNjkgNi42NTYyNSwwLjY1NjI1IDAuMDM1NCwtMC4wNDcyIDAuNTExNTYsLTEuODUwMzUgMS4wMzEyNSwtNCBsIDAuOTY4NzUsLTMuOTM3NSAyLjkzNzUsLTAuMDMxMiBjIDEuNjE4MTUsLTAuMDExOCAzLjM5LDAuMDE1MyAzLjk2ODc1LDAuMDYyNSBsIDEuMDYyNSwwLjA5MzcgLTEwLjA2MjUsMTEgYyAtNS41NTEyOSw2LjAzNTU1IC0xMC4xODI1NywxMS4xMTU4OSAtMTAuMzEyNSwxMS4yODEyNSAtMC40NDg4MiwwLjUzMTUgMy41NTE3NCwtMy40NzY2OSAxMi45MDYyNSwtMTIuOTM3NSBsIDkuMjE4NzUsLTkuMzQzNzUgMy40Mzc1LC0wLjA2MjUgMy40MDYyNSwtMC4wNjI1IC0wLjU5Mzc1LC0wLjg3NSBjIC0wLjM0MjUzLC0wLjQ4NDI2IC0wLjk4ODY4LC0xLjMzMTY5IC0xLjQzNzUsLTEuODc1IC0wLjQ0ODgyLC0wLjU0MzMxIC0wLjc5MzA2LC0xLjAxNTI1IC0wLjc4MTI1LC0xLjA2MjUgMC4wMjM2LC0wLjA0NzMgMS4zMDgyOSwtMS4zODYwNCAyLjg0Mzc1LC0yLjk2ODc1IGwgMi43ODEyNSwtMi44NDM3NSAwLjMxMjUsMC42NTYyNSBjIDAuMTY1MzUsMC4zNzc5NiAwLjI4MTI1LDAuNzIyMTkgMC4yODEyNSwwLjc4MTI1IDAsMC4xODg5NyAwLjE1NDY5LDAuMTMwMjEgNC44NDM3NSwtMi4wMzEyNSAyLjQyMTMxLC0xLjExMDI2IDQuNDUyNzUsLTEuOTY1MyA0LjUsLTEuOTA2MjUgMC4wNDczLDAuMDQ3MyAwLjQ5MjEzLDEuNTYwMjUgMSwzLjM0Mzc1IDAuNDk2MDgsMS43ODM1IDAuOTUyNzUsMy4yOTY1IDEsMy4zNDM3NSAwLjA4MjcsMC4wOTQ1IDE0LjM2Nzg1LC0xMS40NDE0NCAxNC43ODEyNSwtMTEuOTM3NSAwLjA5NDUsLTAuMTI5OTIgMS44NzA1MiwtMy4zNjA2NSAzLjkzNzUsLTcuMTg3NSAyLjA2Njk2LC0zLjgzODY1IDMuODk3MTUsLTcuMTg1MjkgNC4wNjI1LC03LjQ2ODc1IDAuMTY1MzYsLTAuMjgzNDggMC4yMzg5MiwtMC41MjM2MiAwLjE1NjI1LC0wLjUgLTAuMDcwOSwwLjAyMzYgLTMuMDExNSwyLjQ1NzYxIC02LjUzMTI1LDUuMzc1IGwgLTYuNDA2MjUsNS4yODEyNSAtNC41OTM3NSwwLjEyNSBjIC0yLjUzOTQxLDAuMDU5MSAtNC43OTkyMSwwLjA4NjEgLTUsMC4wNjI1IC0wLjM0MjUyLC0wLjAzNTQgMi4xOTYzMSwtMi42MTkwNSA0Mi45Njg3NSwtNDMuNzgxMjUgMjMuODIzMjksLTI0LjA0NzcxIDQzLjM0Mzc1LC00My43NjUyNiA0My4zNDM3NSwtNDMuODEyNSAwLC0wLjA0NzIgLTEuMTI5OSwtMS4yMDQyIC0yLjUsLTIuNTYyNSAtMi4zMzg2MiwtMi4zMzg2MiAtMi40OTg1MiwtMi40NTA4IC0yLjY4NzUsLTIuMjUgLTAuMTA2MywwLjEwNjMgLTE5LjkyNDUsMjEuNjgxMDkgLTQ0LjAzMTI1LDQ3LjkzNzUgbCAtNDMuODEyNSw0Ny43NSAtMy40Njg3NSwyLjQzNzUgYyAtMS45MDE2MSwxLjMzNDY2IC0zLjUyMjg3LDIuNDkxNjQgLTMuNTkzNzUsMi41NjI1IC0wLjA4MjcsMC4wODI3IDAuMDEsMC4zODU4MSAwLjI4MTI1LDEgMC4zMzA3MSwwLjc3OTU0IDAuMzYwNDksMC45MTY1OSAwLjIxODc1LDEuMDkzNzUgLTAuMTI5OTIsMC4xNjUzNiAtNC42ODg0Niw1LjE5MTkxIC01LjU2MjUsNi4xMjUgLTAuMjEyNiwwLjIyNDQyIC0wLjIyMjQyLDAuMjEwOSAtMS4yNSwtMC43ODEyNSAtMS45OTYxLC0xLjk3MjQ4IC0zLjg4NDMsLTMuNDkxNiAtNi4xODc1LC01LjA2MjUgbCAtMS4xMjUsLTAuNzgxMjUgTCAzNzQuNSwyODIuMTI1IGMgMTcuMTI2MzEsLTI5LjQyMTgxIDIxLjY4MDYxLC0zNy4zMzEyIDIxLjU2MjUsLTM3LjQzNzUgLTAuMDcwOSwtMC4wODI3IC0xLjE5MzE0LC0wLjc4Mjk2IC0yLjQ2ODc1LC0xLjU2MjUgbCAtMi4zNDM3NSwtMS40Mzc1IC0wLjQwNjI1LDAuNzE4NzUgYyAtMC4yMTI2LDAuNDAxNTcgLTkuMDE1MDUsMTcuNzg5OTUgLTE5LjU2MjUsMzguNjI1IC0xMC44NzgxNiwyMS41MjAxIC0xOS4yMTgwMSwzNy44NzUgLTE5LjMxMjUsMzcuODc1IC0wLjExODExLDAgLTAuMTAyODUsLTAuMTQwNzQgMC4wNjI1LC0wLjYyNSAwLjEyOTkyLC0wLjMzMDcxIDExLjY1MjI5LC0zMi40NjQ1NiAyNS42MjUsLTcxLjQwNjI1IDEzLjk4NDUyLC0zOC45NDE2OSAyNS4zOTg2MywtNzAuODM1MzcgMjUuMzc1LC03MC45MDYyNSAtMC4wNDcyLC0wLjEwNjMgLTguNTM5ODQsLTQuMDc1NTIgLTkuNDM3NSwtNC40MDYyNSAtMC4wMzU0LC0wLjAxMTggLTAuMDY0NiwtMC4wMDQgLTAuMDkzNywwIHogbSAtNDMuMDkzNzUsNTQuNTMxMjUgLTEuMjE4NzUsMy4wMzEyNSAtMS4xODc1LDMuMDYyNSAtMi4zMTI1LC0wLjkwNjI1IGMgLTEuMjg3NDMsLTAuNTA3ODkgLTIuMzcwODEsLTAuODkwOTkgLTIuNDA2MjUsLTAuODQzNzUgLTAuMDM1NCwwLjA0NzIgLTAuNTgwOTQsMi42MDQ3NiAtMS4yMTg3NSw1LjY4NzUgLTAuNjI1OTksMy4wODI3NCAtMS4xNTIwNyw1LjcwNjIgLTEuMTg3NSw1LjgxMjUgLTAuMDM1NCwwLjE0MTc0IDAuNDg1MiwwLjQyNjY1IDIuMzc1LDEuMzEyNSAxLjM1ODMsMC42Mzc4IDIuNTAzNDQsMS4yMDI3NSAyLjU2MjUsMS4yNSAwLjA0NzIsMC4wNDcyIDAuNjI3NDQsMi4xMzI4MiAxLjMxMjUsNC42MjUgMC42NzMyNCwyLjQ4MDM2IDEuMjU3NjIsNC41Mzg4OSAxLjI4MTI1LDQuNTYyNSAwLjAyMzYsMC4wMjM2IDAuOTg2OTQsLTEuMzQ5ODYgMi4xNTYyNSwtMy4wNjI1IDIuMjIwNTMsLTMuMjQ4MDkgMi4yMTQ2NywtMy4yMzczIDkuMjE4NzUsLTEwLjg0Mzc1IGwgMC4zNzUsLTAuNDA2MjUgLTIuMDMxMjUsLTYuNTYyNSAtMi4wMzEyNSwtNi41NjI1IC0wLjg3NSwtMC4wNjI1IGMgLTAuNDg0MjYsLTAuMDQ3MiAtMS43NTcxMSwtMC4wODE5IC0yLjg0Mzc1LC0wLjA5MzcgbCAtMS45Njg3NSwwIHogTSA1MTEuNDY4NzUsMjU1LjI1IGMgLTAuMDQ3MiwwIC0wLjEyMDgyLDAuMTM5NTEgLTAuMTU2MjUsMC4yODEyNSAtMC4zNjYxNSwxLjIxNjU1IC00LjEwOTAxLDEyLjc5NjUgLTQuMTU2MjUsMTIuODQzNzUgLTAuMDIzNiwwLjAzNTQgLTIuNTU0MDcsMC4xNzA3NyAtNS42MjUsMC4zMTI1IGwgLTUuNTkzNzUsMC4yNSAtMS41OTM3NSwxLjE4NzUgYyAtMC44NzQwMywwLjY3MzI0IC0xLjYwMTM4LDEuMjM4MiAtMS42MjUsMS4yNSAtMC4wMzU0LDAuMDM1NCAtMS41MjM2Miw5LjU1ODMyIC0xLjUsOS41OTM3NSAwLjA0NzIsMC4wMzU0IDguNzE0NTYsNSA4Ljc1LDUgMC4wMjM2LDAgMS41OTgzOSwtMS42NzU0IDMuNSwtMy43MTg3NSAxLjkxMzQyLC0yLjA0MzM0IDMuNDk1ODEsLTMuNzMwNTYgMy41MzEyNSwtMy43MTg3NSAwLjAzNTQsMCAzLjE2NTUzLDIuMTMyMDkgNi45Njg3NSw0LjcxODc1IGwgNi45MDYyNSw0LjY4NzUgMC4wMzEyLC0xLjcxODc1IGMgMC4wMTE4LC0wLjk0NDkgMC4wMDgsLTQuNzk4OSAtMC4wNjI1LC04LjUzMTI1IGwgLTAuMTI1LC02Ljc4MTI1IC00LjU5Mzc1LC03Ljg0Mzc1IGMgLTIuNTI3NjEsLTQuMjk5MyAtNC42MDksLTcuODEyNSAtNC42NTYyNSwtNy44MTI1IHogbSAtMTE3LjUzMTI1LDQuNzgxMjUgLTAuMjE4NzUsMC4yODEyNSBjIC0wLjExODExLDAuMTUzNTUgLTAuODI2MDMsMS4xNzUxNyAtMS41OTM3NSwyLjI1IGwgLTEuMzc1LDEuOTM3NSAtMC44NzUsNC4zNzUgYyAtMC40NzI0NSwyLjQwOTQ5IC0wLjg3NSw0LjQ5NTA5IC0wLjg3NSw0LjYyNSAwLjAxMTgsMC4xNjUzNiAxLjAwMzE2LDEuMDk5MTMgMy4wOTM3NSwyLjkwNjI1IDEuNzAwODMsMS40NjQ2IDMuMTE2NjIsMi42NTYyNSAzLjE4NzUsMi42NTYyNSAwLjA1OTEsMCAxLjEyNzE5LC0xLjIxMTA5IDIuMzQzNzUsLTIuNjg3NSBsIDIuMjE4NzUsLTIuNzE4NzUgMC41LC0yLjQzNzUgYyAwLjI3MTY2LC0xLjMzNDY4IDAuNTU0MTMsLTIuNzM1MjMgMC42MjUsLTMuMTI1IGwgMC4xMjUsLTAuNzE4NzUgLTEuMzQzNzUsLTMuNjI1IGMgLTAuNzMyMywtMS45ODQyOSAtMS4zNzA4MSwtMy42NDAyNSAtMS40MDYyNSwtMy42ODc1IC0wLjA0NzMsLTAuMDQ3MiAtMC41NDYyNCwwLjQ0ODMyIC0xLjEyNSwxLjA2MjUgbCAtMS4wMzEyNSwxLjEyNSAtMS4xMjUsLTEuMTI1IC0xLjEyNSwtMS4wOTM3NSB6IE0gNDY2LjE1NjI1LDI2Ni41IGMgLTAuMDU5MSwwIC0yNi4wOTg1NSwxOC4zMzIyNCAtNTcuOTA2MjUsNDAuNzUgLTMxLjgwNzcsMjIuNDI5NTYgLTU3LjgzNjEyLDQwLjc4ODg4IC01Ny44MTI1LDQwLjgxMjUgMC4wMTE4LDAuMDIzNiAyNi4wOTQzOCwtMTYuMTE0NzcgNTcuOTM3NSwtMzUuODc1IGwgNTcuODc1LC0zNS45Mzc1IDAsLTQuOTA2MjUgYyAwLC0yLjY4MTE2IC0wLjA0NjUsLTQuODU1NTYgLTAuMDkzNywtNC44NDM3NSB6IE0gNDU0LjcxODc1LDI5OC4zNzUgNDUyLjM3NSwzMDEgNDUwLDMwMy41OTM3NSA0NDguODc1LDMwNi42MjUgYyAtMC42MjU5OSwxLjY2NTM5IC0xLjEzNjgxLDMuMDM4ODggLTEuMTI1LDMuMDYyNSAwLjA0NzIsMC4wNDczIDIwLjY0MDI2LDIuNTE2IDIwLjY4NzUsMi40Njg3NSAwLjAyMzYsLTAuMDExOCAtMy4wNjQxNSwtMy4xMzg0NiAtNi44NDM3NSwtNi45MDYyNSBsIC02Ljg3NSwtNi44NzUgeiBtIDk0Ljk2ODc1LDEuODEyNSBjIC0wLjA1OTEsLTAuMDExOCAtNDUuOTI4NTUsMTEuODQ3MTYgLTEwMS45Mzc1LDI2LjM3NSAtNTYuMDA4OTUsMTQuNTI3ODQgLTEwMS44MzYxMiwyNi40NDUxMiAtMTAxLjgxMjUsMjYuNDY4NzUgMC4wMzU0LDAuMDM1NCAyMDYuNTQyMzMsLTQ2Ljc0MTY0IDIwNi42MjUsLTQ2LjgxMjUgMC4wNzA5LC0wLjA0NzMgLTIuNzgwNTEsLTYuMDA3NjQgLTIuODc1LC02LjAzMTI1IHogbSAtMTIwLDE0IGMgLTAuMDU5MSwwLjAxMTggLTE1LjMyMjk3LDcuMjAwNjMgLTMzLjkzNzUsMTYgLTE4LjYxNDUzLDguNzk5MzkgLTMzLjkzNjc2LDE2LjA1NDE0IC0zNC4wMzEyNSwxNi4xMjUgLTAuMTI5OTMsMC4wOTQ1IC0wLjA4NzYsMC4xMDIxMSAwLjEyNSwwLjAzMTIgMC40MTM0LC0wLjE0MTc0IDY4LjQyNTcsLTI2LjM4MjYzIDY4LjQzNzUsLTI2LjQwNjI1IDAuMDExOCwwIC0wLjA3NywtMS4yOTIzIC0wLjIxODc1LC0yLjg3NSAtMC4xNDE3MiwtMS43MzYyNiAtMC4yOTIzMiwtMi44NzUgLTAuMzc1LC0yLjg3NSB6IG0gMTQ3LjU2MjUsNy4wOTM3NSBjIC0wLjE1MzU0LDAuMDExOCAtNTAuNDgwMTIsOC41NTEyNCAtMTExLjg3NSwxOC45Njg3NSAtNjEuMzgzMDcsMTAuNDA1NzEgLTExMS43NzIxNCwxOC45Mzc1IC0xMTEuOTM3NSwxOC45Mzc1IC0wLjIwMDc5LDAuMDExOCAtMC43MTU1NCwtMC4zNDIwMSAtMS42MjUsLTEuMDYyNSBsIC0xLjM3NSwtMS4wOTM3NSAtMC4wNjI1LDQuNTMxMjUgLTAuMDYyNSw0LjUzMTI1IC0zLjUzMTI1LDIuNDA2MjUgYyAtMS45NDg4NiwxLjMxMTA1IC0zLjYwNDgyLDIuMzYzMTkgLTMuNjg3NSwyLjM3NSAtMC4wODI3LDAgLTEuNTc2MjUsLTAuOTk4IC0zLjMxMjUsLTIuMjUgLTQuNjA2MzksLTMuMzMwNzggLTQuNjc1MDQsLTMuMzE5NyAtMC4yODEyNSwwLjA5MzcgMS42NTM1OCwxLjI4NzQ0IDMuMDc3NzUsMi4zNTkgMy4xMjUsMi40MDYyNSAwLjExODExLDAuMTA2MyAtNS41NTMzOSwzLjkzNDA2IC01LjcxODc1LDMuODc1IC0wLjA4MjcsLTAuMDIzNiAtMTQuMDE5ODYsLTExLjg5ODU2IC0xNy40Njg3NSwtMTQuODc1IGwgLTAuNzgxMjUsLTAuNjg3NSAtNi40Njg3NSw1LjU5Mzc1IGMgLTMuNTU1MTcsMy4wODI3NCAtNi41MTUyNSw1LjYyNSAtNi41NjI1LDUuNjI1IC0wLjA1OTEsMCAtMy43MTk0MSwtMC45NTU2OSAtOC4xMjUsLTIuMTI1IGwgLTgsLTIuMTI1IDIuMjUsMC4wNjI1IGMgMS4yNDAxOCwwLjAzNTQgMy4xMTI2NywwLjA1ODMgNC4xODc1LDAuMDkzNyAxLjg1NDM2LDAuMDQ3MyAtMy40MzA5OSwtMC4zNDg0MSAtOS43NSwtMC43NSAtMS4xNjkzMSwtMC4wODI3IC03LjUwNzI2LC0wLjUxMjMgLTE0LjA2MjUsLTAuOTM3NSBsIC0xMS45Mzc1LC0wLjc4MTI1IC0wLjAzMTIsLTAuMzQzNzUgYyAtMC4wNzA5LC0wLjQwMTU3IC0wLjAyMzEsLTAuMzg1NTkgLTEuMDYyNSwtMC4wMzEyIC0wLjc0NDExLDAuMjQ4MDQgLTAuODUzMDYsMC4yMzU0OSAtMy4xNTYyNSwwLjA5MzcgLTEuMjk5MjQsLTAuMDcwOSAtMi42NDU2NiwtMC4xNTIwOCAtMywtMC4xODc1IGwgLTAuNjU2MjUsLTAuMDkzNyAtMC41NjI1LC0xLjAzMTI1IC0wLjU2MjUsLTEgLTQuMDMxMjUsLTAuMjE4NzUgYyAtMi4yMjA1MSwtMC4xMTgxMSAtNC4zMjU1NCwtMC4xODc1IC00LjY1NjI1LC0wLjE4NzUgbCAtMC41OTM3NSwwIC0wLjUzMTI1LDAuODQzNzUgLTAuNSwwLjg3NSBMIDI0MC4yNSwzNjIuNzUgYyAtMC4zMzA3MywtMC4wMTE4IC0xMi42OTI4OCwtMC44MDA5MSAtMjcuNDY4NzUsLTEuNzgxMjUgLTE0Ljc3NTg4LC0wLjk2ODUzIC0yNy4wNjQ0NiwtMS43NjE4MSAtMjcuMzEyNSwtMS43NSBsIC0wLjQzNzUsMC4wMzEyIDEuMzc1LDEuNDY4NzUgYyAxLjE5Mjk0LDEuMjk5MjQgMS40MTUxLDEuNDk1ODEgMS43ODEyNSwxLjUzMTI1IDAuMjM2MjMsMC4wMjM2IDExLjkyNTE4LDAuNDk1NTYgMjUuOTY4NzUsMS4wNjI1IDE0LjA0MzU4LDAuNTY2OTQgMjUuNTg5NTYsMS4wNTgzMSAyNS42MjUsMS4wOTM3NSAwLjAzNTQsMC4wMzU0IC0wLjUyOTUxLDEuMDI1ODEgLTEuMjUsMi4yMTg3NSAtMC43MDg2OCwxLjE4MTEzIC0xLjI3NzgsMi4yMjIxOSAtMS4yMTg3NSwyLjI4MTI1IDAuMDQ3MiwwLjA0NzIgMS43NjE1NCwxLjI2NTk2IDMuNzgxMjUsMi43MTg3NSBsIDMuNjU2MjUsMi42NTYyNSA0LjAzMTI1LDAuNjU2MjUgYyAyLjIwODcsMC4zNzc5NSA0LjEwNDgxLDAuNjYwNDQgNC4xODc1LDAuNjI1IDAuMDgyNywtMC4wMjM2IDAuNjg5OTUsLTAuOTUyMjUgMS4zNzUsLTIuMDYyNSBsIDEuMjUsLTIuMDMxMjUgMi41NjI1LDAgMi41NjI1LDAgMCwtMC40Mzc1IGMgMCwtMC4yNDgwNCAtMC4wODg4LC0xLjY1Mjc3IC0wLjIxODc1LC0zLjA5Mzc1IC0wLjEyOTkzLC0xLjQ1Mjc5IC0wLjIyMjk0LC0yLjY1MjA3IC0wLjE4NzUsLTIuNjg3NSAwLjA3MDksLTAuMDcwOSAyNS41MDY2NCwwLjkwNTUxIDI2LjE1NjI1LDEgMC4zMDcxLDAuMDQ3MyAwLjM3NSwwLjA4MzkgMC4zNzUsMC4zNDM3NSAwLDAuNDM3MDMgMC42MjEzLDMuMTgyNTQgMS4wOTM3NSw0LjgxMjUgMC40MDE1OCwxLjM3MDEgMC40MDQyOSwxLjM3ODQ1IDAuMTU2MjUsMS40Mzc1IC0wLjEyOTkxLDAuMDIzNiAtMzEuNDI4MTYsMy42MTA0IC02OS41MzEyNSw3Ljk2ODc1IC0zOC4xMDMwOSw0LjM3MDE2IC02OS4yNjk0NCw3Ljk2ODc1IC02OS4yODEyNSw3Ljk2ODc1IC0wLjAzNTQsMC4wMjM2IC0wLjI4NTQ0LDMuMDU4MzMgLTAuMjUsMy4wOTM3NSAwLjAyMzYsMC4wMTE4IDMxLjMxMDA1LC00LjIxMzQ5IDY5LjUzMTI1LC05LjM3NSAzOC4yMjEyLC01LjE2MTUyIDY5LjU4MTIsLTkuMzc1IDY5LjY4NzUsLTkuMzc1IDAuMTI5OTMsMCAwLjI5MTU5LDAuMjUzOTIgMC40Njg3NSwwLjc1IDAuMTUzNTUsMC40MTMzOSAwLjUwMTk2LDEuMjU2NjMgMC43NSwxLjkwNjI1IDAuMjQ4MDQsMC42Mzc4IDAuNDI5ODgsMS4xNzU3IDAuNDA2MjUsMS4xODc1IC0wLjAyMzYsMC4wMTE4IC0yMy40MTY3OCw1LjE5Mjc5IC01MiwxMS41IC0yOC41ODMyMiw2LjMwNzIxIC01Mi4wNTc1OSwxMS41MzQ3IC01Mi4xODc1LDExLjU5Mzc1IC0wLjIwMDgsMC4wODI3IC0wLjMyMjA5LDAuMzg3NTMgLTAuNTkzNzUsMS43ODEyNSAtMC4xODg5NywwLjkyMTI3IC0wLjI4NTQ0LDEuNzE0NTYgLTAuMjUsMS43NSAwLjA1OTEsMC4wNDczIDEwNC43Nzc1NSwtMjUuNzQ4NTMgMTA1LjI1LC0yNS45Mzc1IDAuMDcwOSwtMC4wMjM2IDAuMjk5MjEsMC4zMDUzNSAwLjUsMC43MTg3NSAwLjI1OTg1LDAuNTE5NjkgMC4zMTMyNSwwLjc3NzA2IDAuMjE4NzUsMC44MTI1IC0wLjA4MjcsMC4wMjM2IC03Ljk3MTc2LDIuMTU1NzEgLTE3LjU2MjUsNC43MTg3NSBsIC0xNy40Njg3NSw0LjYyNSAtMC4yMTg3NSwxLjc4MTI1IGMgLTAuMTI5OTIsMC45ODAzMiAtMC4yMzA1NiwxLjgwMDY5IC0wLjIxODc1LDEuODEyNSAwLjAxMTgsMC4wMTE4IDguMTYwNDksLTIuNjUzOTcgMTguMDkzNzUsLTUuOTM3NSAxOC4xMTg0NSwtNS45NzY1IDE4LjIzODE5LC02LjAxNTUxIDE4LjI1LC01LjUzMTI1IDAsMC4wNzA5IC0xMi43MjU4NCw2Ljk5NjY0IC0yOC4yODEyNSwxNS40MDYyNSBsIC0yOC4zMTI1LDE1LjI4MTI1IDAuMDkzNywxLjEyNSBjIDAuMDQ3MiwwLjYxNDE5IDAuMDc3OCwxLjMxNDQ2IDAuMTI1LDEuNTYyNSBsIDAuMDkzNywwLjQzNzUgTCAyNjMuNSwzOTcuOTM3NSBjIDE1LjQ2MDkyLC05LjA5NDY2IDI4LjIwNjIsLTE2LjYwOSAyOC4zMTI1LC0xNi42NTYyNSAwLjE1MzU1LC0wLjA5NDUgMC4zNzY3MSwwLjE5MzEzIDEuMTU2MjUsMS40Njg3NSAwLjg4NTg1LDEuNDY0NTkgMi4wODQxMywzLjE3MTQ5IDMuMzEyNSw0LjcxODc1IDAuNDcyNDUsMC42MTQxOSAwLjUwMTQ5LDAuNzAyMDIgMC4zMTI1LDAuODQzNzUgLTAuMTA2MywwLjA3MDkgLTE0Ljk5ODkyLDExLjk2MTA5IC0zMy4wOTM3NSwyNi40MDYyNSBMIDIzMC42MjUsNDQxIGwgMi4zMTI1LDIuMjgxMjUgYyAxLjI4NzQzLDEuMjUyIDIuNDM2NzYsMi4zMTU5NSAyLjUzMTI1LDIuMzc1IDAuMTQxNzQsMC4wODI3IDQuNTM3ODUsLTMuOTI2NjUgMTkuNjU2MjUsLTE3Ljc4MTI1IDEwLjcyNDYxLC05LjgzODc2IDE5LjUwNzYzLC0xNy44NTU1NSAxOS41MzEyNSwtMTcuODQzNzUgMC4wMjM2LDAuMDIzNiAtMC4xNDI5NiwwLjM3OTY2IC0wLjM0Mzc1LDAuNzgxMjUgLTAuMjAwNzksMC4zODk3OCAtMC4zNDM3NSwwLjc1MzQ1IC0wLjM0Mzc1LDAuODEyNSAwLDAuMDgyNyAzLjI0NDA5LDMuNzUxNyA0LDQuNTMxMjUgMC4yMDA3OSwwLjIwMDc5IDAuMzA2NTYsMC4xNzIwMSAyLjU2MjUsLTAuODQzNzUgbCAyLjM0Mzc1LC0xLjA2MjUgMS4xODc1LDEuMTg3NSAxLjE4NzUsMS4xNTYyNSAyLjM0Mzc1LC0xLjQwNjI1IDIuMzc1LC0xLjQzNzUgMC45MDYyNSwtMy4wMzEyNSBjIDAuNTA3ODksLTEuNjc3MiAwLjg5NDQ0LC0zLjEyNDI2IDAuOTA2MjUsLTMuMjE4NzUgMCwtMC4xMDYzIC0wLjg5MjQ0LC0wLjczOTkgLTIuMTU2MjUsLTEuNTMxMjUgbCAtMi4xMjUsLTEuMzQzNzUgLTMuNDM3NSwtMC4wNjI1IC0zLjQwNjI1LC0wLjA2MjUgOC40MDYyNSwtNy43MTg3NSBjIDQuNjE4MiwtNC4yMjg0MyA4LjQxMzg4LC03LjY4NzUgOC40Mzc1LC03LjY4NzUgMC4wMTE4LDAgMC45NTk4OCwwLjkwOTE4IDIuMDkzNzUsMi4wMzEyNSAxLjEzMzg4LDEuMTIyMDYgMi42MDAzNywyLjQ4MDMxIDMuMjUsMyA3Ljg3ODEsNi4zMDcyMSAxNi44MzA3Niw5LjM2NTQxIDI2LjQ2ODc1LDkuMDkzNzUgNy41NzEsLTAuMjEyNiAxNC4zMDUyNCwtMi4zNTAwNiAyMC43MTg3NSwtNi41MzEyNSAyLjY0NTczLC0xLjcyNDQ0IDQuMzA5MjUsLTMuMDc1MjUgNi43MTg3NSwtNS40Mzc1IGwgMS41LC0xLjQzNzUgMjIuNDY4NzUsMTguMDkzNzUgYyAxMi4zNzgxOSw5Ljk2ODcgMjIuNTA3NjQsMTguMTA1NTYgMjIuNTMxMjUsMTguMDkzNzUgMC4wMTE4LC0wLjAyMzYgLTAuNTc2MDIsLTEuNDI0MTkgLTEuMzQzNzUsLTMuMTI1IGwgLTEuMzc1LC0zLjA5Mzc1IC0yMC44NzUsLTE1LjMxMjUgLTIwLjg3NSwtMTUuMjgxMjUgMC40MDYyNSwtMC41IGMgMC4yMjQ0MiwtMC4yNTk4NCAwLjgyODI0LC0xLjAxODQ0IDEuMzEyNSwtMS42NTYyNSAwLjQ5NjA4LC0wLjYyNTk5IDAuOTUyNzUsLTEuMTM2ODEgMSwtMS4xMjUgMC4wNTkxLDAuMDIzNiAxMi42NTcxOSw5Ljg1NTMzIDI4LDIxLjg0Mzc1IDE1LjM0MjgxLDExLjk4ODQxIDI4LjA4MzksMjEuOTM2MDEgMjguMzQzNzUsMjIuMTI1IGwgMC40Njg3NSwwLjM0Mzc1IDEuMzQzNzUsLTEuMzQzNzUgYyAwLjc0NDExLC0wLjc0NDExIDEuMzU1NTYsLTEuMzkwMjUgMS4zNDM3NSwtMS40Mzc1IC0wLjAyMzYsLTAuMDM1NCAtMTMuMTY3MjYsLTkuNTc3MDQgLTI5LjIxODc1LC0yMS4xODc1IC0xNi4wMzk2OSwtMTEuNjEwNDUgLTI5LjI2ODcsLTIxLjE3NDk1IC0yOS4zNzUsLTIxLjI4MTI1IC0wLjE4ODk3LC0wLjE3NzE3IC0wLjE1MzgsLTAuMjY4OTMgMC41MzEyNSwtMS4zNDM3NSAwLjQ2MDY0LC0wLjcyMDQ5IDAuNzgwNTEsLTEuMTI5MTkgMC44NzUsLTEuMDkzNzUgMC4wODI3LDAuMDM1NCAxMi4wMDc2LDcuMzA1NDUgMjYuNSwxNi4xODc1IDE0LjQ4MDU5LDguODcwMjUgMjYuMzcwODIsMTYuMDg2MTMgMjYuNDA2MjUsMTYuMDYyNSAwLjAyMzYsLTAuMDM1NCAtMC42MDMwNywtMS4zODE4NiAtMS40MDYyNSwtMyBsIC0xLjQ2ODc1LC0yLjkzNzUgLTI0LjgxMjUsLTEzLjYyNSAtMjQuODEyNSwtMTMuNjI1IDAuODQzNzUsLTEuNjU2MjUgYyAwLjQ3MjQ1LC0wLjkwOTQ2IDEuMDU2ODQsLTIuMDY2NDMgMS4yODEyNSwtMi41NjI1IGwgMC40MDYyNSwtMC45MDYyNSAxNS4zNzUsMy45Njg3NSBjIDguNDU2ODYsMi4xODUwOSAxNS4zOTAyNSw0LjAxNTI1IDE1LjQzNzUsNC4wNjI1IDAuMDk0NSwwLjA5NDUgLTEuMDg0NjQsMS43NSAtMS4yNSwxLjc1IC0wLjA1OTEsMCAtMi4xNDg4MywtMC4zOTQ5MyAtNC41OTM3NSwtMC44NDM3NSAtMi40NTY3NCwtMC40NjA2NCAtNC41MzA1MSwtMC44MTI1IC00LjYyNSwtMC44MTI1IC0wLjEyOTkzLDAgLTAuNjQ5NTksMC44Mjc3MiAtMS41LDIuMzc1IGwgLTEuMzEyNSwyLjQwNjI1IDMuMDkzNzUsMi4yODEyNSBjIDEuNzAwODEsMS4yNjM4IDMuODQ4MTYsMi44NDYyIDQuNzgxMjUsMy41MzEyNSBsIDEuNjg3NSwxLjI1IDEyLjU2MjUsMi4xNTYyNSBjIDYuODk3NzYsMS4xODExMyAxMi41NzAxMiwyLjExNzM2IDEyLjU5Mzc1LDIuMDkzNzUgMC4wMzU0LC0wLjAzNTQgMC4yNTY4OSwtMy4yMzM3MiAwLjM3NSwtNS4zMTI1IGwgMC4wMzEyLC0wLjcxODc1IC0yLjA2MjUsLTIuMzc1IC0yLjA2MjUsLTIuMzQzNzUgLTIuNTYyNSwtMS4wOTM3NSBjIC0xLjQxNzM1LC0wLjYwMjM3IC0yLjU0MzA2LC0xLjExMzIgLTIuNTMxMjUsLTEuMTI1IDAuMDExOCwtMC4wMTE4IDguMDQwNDEsMi4wMzQ4OSAxNy44NDM3NSw0LjU2MjUgOS44MDMzNCwyLjUyNzYgMTcuOTA1NTEsNC41OTM3NSAxOCw0LjU5Mzc1IDAuMDgyNywwIDAuMTI1LC0wLjAzNDcgMC4xMjUsLTAuMDkzNyAwLC0wLjA0NzMgMC4zNTYwNCwtMi40NjE4IDAuNzgxMjUsLTUuMzQzNzUgMC40MjUyLC0yLjg4MTk1IDAuNzYxODEsLTUuMjI2MzkgMC43NSwtNS4yNSAtMC4wMjM2LC0wLjAxMTggLTE4LjA3MzQsLTIuNTczNTEgLTQwLjEyNSwtNS42NTYyNSAtMjIuMDM5NzksLTMuMDgyNzQgLTQwLjEwMTM5LC01LjYzMjYzIC00MC4xMjUsLTUuNjU2MjUgLTAuMDIzNiwtMC4wMjM2IDAuMjEyMzUsLTAuODQzOTcgMC41MzEyNSwtMS44MTI1IDAuMzMwNzEsLTAuOTY4NTEgMC41OTM3NSwtMS44MzEyIDAuNTkzNzUsLTEuOTM3NSAwLC0wLjEyOTkyIC0wLjg2MTQyLC0wLjQ3ODA5IC0zLjA5Mzc1LC0xLjI4MTI1IEwgMzYyLjM3NSwzNjguNzUgMzYxLjc1LDM2Ny42NTYyNSBjIC0wLjM0MjUyLC0wLjU3ODc1IC0wLjU5Nzk0LC0xLjA4OTU4IC0wLjU2MjUsLTEuMTI1IDAuMDIzNiwtMC4wMzU0IDE3LjM2NTUsMC43NzcyOSAzOC41MzEyNSwxLjc4MTI1IGwgMzguNDY4NzUsMS44MTI1IDAuMzEyNSwwLjMxMjUgMC4zMTI1LDAuMzQzNzUgNi45Njg3NSwwLjQ2ODc1IDYuOTM3NSwwLjQ2ODc1IDAuNDA2MjUsLTAuNDM3NSAwLjQwNjI1LC0wLjQzNzUgNDkuMTg3NSwyLjM0Mzc1IGMgMjcuMDU5NTcsMS4yNzU2MSA0OS4yMDY5NCwyLjI5MzA2IDQ5LjIxODc1LDIuMjgxMjUgMC4wMjM2LC0wLjAyMzYgLTAuOTA5MTksLTAuNzMxNTQgLTIuMDMxMjUsLTEuNTkzNzUgbCAtMi4wMzEyNSwtMS41OTM3NSAtNDYuMzQzNzUsLTEuNDM3NSBjIC0yNS40ODg2OCwtMC44MTQ5OCAtNDYuNDA1NTEsLTEuNDg4MTkgLTQ2LjUsLTEuNSAtMC4wOTQ1LC0wLjAyMzYgMS4zMDA0LC0xLjcwNDQzIDMuMzQzNzUsLTQuMDMxMjUgMS45MzcwNCwtMi4xOTY4OSAzLjQ5MjM4LC00LjAxOTQ0IDMuNDY4NzUsLTQuMDMxMjUgLTAuMDExOCwtMC4wMjM2IC01LjU4MzUyLC0yLjQ5OTk0IC0xMi4zNzUsLTUuNSAtNi43OTE0NiwtMy4wMDAwNiAtMTIuMzU5LC01LjQ5NTgzIC0xMi40MDYyNSwtNS41MzEyNSAtMC4wNDcyLC0wLjAyMzYgLTEuNTg3MzEsMS4zODg3NSAtMy40MDYyNSwzLjEyNSBsIC0zLjMxMjUsMy4xNTYyNSAtNC42ODc1LDEuNTYyNSBjIC0yLjU2MzA1LDAuODYyMjMgLTQuNjk1MTMsMS41ODk1NiAtNC43MTg3NSwxLjYyNSAtMC4wMzU0LDAuMDIzNiAwLjQyODg4LDEuOTM1IDEuMDMxMjUsNC4yNSAwLjYwMjM3LDIuMzE1MDEgMS4wMzU0NCw0LjI2NTI2IDEsNC4zMTI1IC0wLjA0NzIsMC4wMzU0IC0xMy45NjQ3MiwtMC4zOTQxOSAtMzAuOTM3NSwtMC45Mzc1IC0xNi45NjA5NSwtMC41MzE1MSAtMzAuODkwMjUsLTAuOTQ5MzEgLTMwLjkzNzUsLTAuOTM3NSAtMC4wNDcyLDAgLTAuMzE3OTEsLTAuNDI5NjMgLTAuNjI1LC0wLjkzNzUgLTAuNTMxNTEsLTAuODc0MDQgLTAuNjU0NzEsLTEuMDAzNjUgLTMuODQzNzUsLTMuNTMxMjUgbCAtMy4zMTI1LC0yLjU5Mzc1IDAuNjI1LC0wLjA5MzcgYyAwLjM0MjUzLC0wLjA0NzMgNTAuNzczOTMsLTYuODkxODEgMTEyLjA2MjUsLTE1LjIxODc1IGwgMTExLjQzNzUsLTE1LjEyNSAwLjA2MjUsLTMuODEyNSAwLC0zLjgxMjUgLTAuMjUsMCB6IG0gLTMxNC4zNzUsMTguMzc1IGMgLTAuMDA0LDAuMDI1MyAwLjAxMzUsMC4wNjg5IDAuMDMxMiwwLjEyNSAwLjA0NzIsMC4xMjk5MyAwLjI1NjE0LDAuNzA2NjkgMC40Njg3NSwxLjI1IEwgMjYzLjc4MTI1LDM0MiAyODIuMjUsMzUwLjkwNjI1IGMgMTAuMTQ1ODYsNC44ODk4NiAxOC40NzYzOSw4Ljg1NTU2IDE4LjUsOC44NDM3NSAwLjAxMTgsLTAuMDIzNiAtOC4yMjU2OSwtNC40MzA3NSAtMTguMzEyNSwtOS43ODEyNSAtMTAuMDc0OTksLTUuMzUwNSAtMTguNjE0NDEsLTkuODczNTEgLTE4Ljk2ODc1LC0xMC4wNjI1IC0wLjQzNDA2LC0wLjI0ODAzIC0wLjU4MzIzLC0wLjMyNTg1IC0wLjU5Mzc1LC0wLjI1IHogbSAtMTYuMjE4NzUsMTAuODEyNSBjIC0wLjAzNTQsMCAtMC44MjQ1NCwwLjY3MzIxIC0xLjc4MTI1LDEuNSAtMC45NTY3MSwwLjgyNjc5IC0xLjcwMzQ5LDEuNTI3MDYgLTEuNjU2MjUsMS41NjI1IDAuMTE4MTEsMC4wOTQ1IDU1LjA1NDEyLDguNjY0NjIgNTUuMTI1LDguNTkzNzUgMC4wNDcyLC0wLjAzNTQgLTUxLjQ4NjcxLC0xMS42NjgwNiAtNTEuNjg3NSwtMTEuNjU2MjUgeiBtIDUyLjA2MjUsMTEuNjg3NSBjIC0wLjEyOTkxLC0wLjAxMTggLTAuMjAzNSwwLjAyNzEgLTAuMTU2MjUsMC4wNjI1IDAuMDM1NCwwLjAzNTQgMC4xMzYwOCwwLjAzNTQgMC4yMTg3NSwwIDAuMDk0NSwtMC4wMzU0IDAuMDY3NCwtMC4wNjI1IC0wLjA2MjUsLTAuMDYyNSB6IG0gLTQ1LjY4NzUsMi42ODc1IDAuODEyNSwwLjA2MjUgYyAwLjQzNzAzLDAuMDQ3MiAwLjk2NzI2LDAuMDgxOSAxLjE1NjI1LDAuMDkzNyAwLjI5NTI3LDAgMC4yNTg2MSwwLjA1NjggLTAuMzQzNzUsMC4yODEyNSAtMS4yMjgzNywwLjQ3MjQ1IC0xLjE3MDAzLDAuNDcyNDUgLTEuNDA2MjUsMCBsIC0wLjIxODc1LC0wLjQzNzUgeiBtIDE4MS42MjUsMS41NjI1IGMgMC4wNzA5LDAgMC42MzU4MSwwLjUyNjA2IDEuMjUsMS4xODc1IEwgNDM3LDM2OC44MTI1IGwgLTIsLTAuMDkzNyBjIC0xLjExMDI2LC0wLjA0NzIgLTMuMjg0NjcsLTAuMTA5MDEgLTQuODQzNzUsLTAuMTU2MjUgLTEuNTU5MDksLTAuMDM1NCAtMi43NTA3NCwtMC4xMjA4MSAtMi42NTYyNSwtMC4xNTYyNSAwLjMwNzA5LC0wLjEwNjMgNy4wMzgxNCwtMS45ODgxOSA3LjE1NjI1LC0yIHogbSAtMTM2LjMxMjUsMC4yNSBjIC0wLjAyODEsMC4wMTE4IC0wLjAyMzYsMC4wNDQ4IDAsMC4wNjI1IDAuMDM1NCwwLjAzNTQgMC4xMzYwOCwwLjAzNTQgMC4yMTg3NSwwIDAuMDk0NSwtMC4wMzU0IDAuMDM2MiwtMC4wNjI1IC0wLjA5MzcsLTAuMDYyNSAtMC4wNjUsLTAuMDA2IC0wLjA5NjksLTAuMDExOCAtMC4xMjUsMCB6IG0gLTkwLjAzMTI1LDMuNTYyNSBjIC0wLjA0NzIsLTAuMDExOCAtMS43MDMyMSwxLjE5OTI5IC0zLjY4NzUsMi42ODc1IEwgMjAxLjAzMTI1LDM3NS41NjI1IDIwMSwzNzcgYyAtMC4wMzU0LDEuNDA1NTQgLTAuMDQxMSwxLjQ1Mjc1IDAuMjE4NzUsMS41IDAuNDM3MDEsMC4wOTQ1IDE5LjcwOTY0LDEuODQ3OTQgMTkuODc1LDEuODEyNSAwLjExODExLC0wLjAzNTQgLTEyLjU0NTAzLC0xMC4wMzQ3IC0xMi43ODEyNSwtMTAuMDkzNzUgeiBNIDIzMi4yODEyNSwzOTMuMjUgYyAwLDAuMTA2MyA3LjIyNTY0LDcuMDYyNSA3LjM0Mzc1LDcuMDYyNSAwLjA3MDksMCAxLjI3NDM0LC0wLjQ3NjEzIDIuNjU2MjUsLTEuMDMxMjUgbCAyLjUsLTEgMCwtMi4xODc1IDAsLTIuMTg3NSAtMC4zMTI1LDAgYyAtMC40MTM0LDAgLTEwLjUzNTY2LC0wLjU1NDEyIC0xMS40Njg3NSwtMC42MjUgLTAuNDEzNCwtMC4wMzU0IC0wLjcxODc1LC0wLjA1NDkgLTAuNzE4NzUsLTAuMDMxMiB6IE0gMjA1Ljc1LDQxMS42MjUgYyAtMC4wMzU0LDAgLTAuMTAxMzksMC4wODU0IC0wLjEyNSwwLjE1NjI1IC0wLjAzNTQsMC4wODI3IC0wLjU5NjIsMS45NzQ2MSAtMS4yODEyNSw0LjIxODc1IGwgLTEuMjUsNC4wOTM3NSAwLjM3NSwwLjUzMTI1IGMgMi4wNDMzNSwyLjg0NjUxIDcuMTE2NjQsOS43NTc2MyA3LjE4NzUsOS43ODEyNSAwLjA0NzIsMC4wMTE4IDAuMjgzMjEsLTAuNTUzMTQgMC41MzEyNSwtMS4yNSAwLjI0ODA0LC0wLjcwODY3IDAuNzY2NDcsLTIuMTYzMzYgMS4xNTYyNSwtMy4yNSBsIDAuNjg3NSwtMS45Njg3NSAwLjQzNzUsLTAuMDYyNSBjIDAuMjQ4MDQsLTAuMDM1NCAxLjI1Nzg2LC0wLjEwOTAxIDIuMjUsLTAuMTU2MjUgbCAxLjc4MTI1LC0wLjA2MjUgMS40MDYyNSwtMS41MzEyNSAxLjQwNjI1LC0xLjUgMC43NSwtMi4yODEyNSBjIDAuNDAxNTksLTEuMjQwMTggMC42Nzk4NywtMi4yNTc2MiAwLjY1NjI1LC0yLjI4MTI1IC0wLjA3MDksLTAuMDcwOSAtNi42NTEzMywtMi41MzEyNSAtNi43ODEyNSwtMi41MzEyNSAtMC4wNzA5LDAgLTAuNTUwNDMsMC41NDU1IC0xLjA5Mzc1LDEuMjE4NzUgLTAuNTQzMzEsMC42ODUwNSAtMS4wNzM1NywxLjIxMTEzIC0xLjE1NjI1LDEuMTg3NSAtMC4wNzA5LC0wLjAyMzYgLTEuNjQ1NjMsLTAuOTg2OTQgLTMuNSwtMi4xNTYyNSAtMS44NTQzNiwtMS4xODExMiAtMy40MDIwOCwtMi4xNTYyNSAtMy40Mzc1LC0yLjE1NjI1IHoiCiAgICAgdHJhbnNmb3JtPSJzY2FsZSgwLjgsMC44KSIKICAgICBzdHlsZT0iZmlsbDojMDAwMDAwO3N0cm9rZTpub25lIiAvPgo8L3N2Zz4K" },
      flammable: { text: "ไวไฟ (Flammable)", url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMCIgdmlld0JveD0iMCAwIDU3OSA1NzkiPjxwYXRoIGQ9Im0yNSAyOTAgMjY0IDI2NCAyNjQtMjY0TDI4OSAyNiAyNSAyOTB6IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTE0OCAxNDggNiAyOTBsMTQyIDE0MSAxNDEgMTQyIDE0Mi0xNDIgMTQyLTE0MS0xNDItMTQyTDI4OSA2IDE0OCAxNDh6bTI2MSAyMiAxMTkgMTIwLTExOSAxMTktMTIwIDExOS0xMTktMTE5TDUxIDI5MGwxMTktMTIwTDI4OSA1MWwxMjAgMTE5eiIgZmlsbD0icmVkIi8+PHBhdGggZD0iTTI5MCAxMjFjLTE4IDM0IDMgNTMtMjAgMTAyLTEzLTEwLTYtNDctMzAtNDggMyAxMiAxIDE2IDAgMjAtMyAxNy04IDMxIDMgNTItMTctOC0xOC0yMy0zMi0zMyAzIDE2LTQgNDkgMTUgODEtMTctMi0yMy04LTQxLTI2IDE5IDEwMCAzNCAxMDMgMTA1IDEwOS02LTEtNDItNy01NS00OCAwLTEwLTEgOSAzNCAxMC0yMi0zNS0xNi0yOC0xNC00OCAxMCAxMyAyIDE1IDI3IDI1LTgtMjYgMTMtNDMgOC03MyA2IDEzIDI2IDExIDI1IDczIDE3LTE5IDE4LTYgMjYtMjYgMSAxMSA2IDI1LTE3IDQ5IDYgMiAxNiAzIDMxLTgtMTUgMTgtMSAxOC00MCA0NiA0OSAxIDgxLTMwIDgwLTk3LTIgNi0zIDE4LTI5IDIxIDE2LTE2IDI1LTQ5IDEyLTc1LTUgNC0xMiAyNC0yOSAyOSA4LTE0IDYtMzIgNi0zMnMzLTI1LTEyLTQ1Yy00IDMwLTQgNDYtMjMgNTAgMy0xNyA0LTI2LTYtNDYtMTAtMjEtMjItNDItMjQtNjJ6bS04MSAyNzR2MThoMTcxdi0xOEgyMDl6Ii8+PC9zdmc+" },
      oxidizing: { text: "ออกซิไดซ์ (Oxidizing)", url: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgo8c3ZnCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgdmVyc2lvbj0iMS4wIgogICB3aWR0aD0iNTc5cHQiCiAgIGhlaWdodD0iNTc5cHQiCiAgIHZpZXdCb3g9IjAgMCA1NzkgNTc5Ij4KICA8cGF0aAogICAgIGQ9Ik0gMjUuMzAxMTY1LDI4OS42NzE3MiAyODkuMzI5ODcsNTUzLjcwMDQ0IDU1My40MDI2MSwyODkuNjI3NyBDIDQ2NS4zNTAyMiwyMDEuNjc1NyAzNzcuNDcxODIsMTEzLjU0OTQyIDI4OS4zNzM5LDI1LjY0MzAyNCBMIDI1LjMwMTE2NSwyODkuNjcxNzIgeiIKICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO3N0cm9rZTpub25lIiAvPgogIDxwYXRoCiAgICAgZD0iTSAxNDcuNjU5NDEsMTQ4LjAxMjMzIDYsMjg5LjY3MTczIDE0Ny42Njg4Niw0MzEuMzQwNTkgMjg5LjMyODI3LDU3MyA0MzEuMDE2MDIsNDMxLjMxMjI0IDU3Mi43MDM3OCwyODkuNjI0NDkgNDMxLjA2MzI3LDE0Ny45ODM5OCBDIDM1My4xNjU3MSw3MC4wODY0MjQgMjg5LjQwMzg2LDYuMzQzNDcgMjg5LjM3NTUxLDYuMzQzNDcgYyAtMC4wMjg0LDAgLTYzLjc5OTY1LDYzLjc1MjQwMyAtMTQxLjcxNjEsMTQxLjY2ODg2IHogTSA0MDguNjIxODksMTcwLjQyNTM1IDUyNy44MjEwMywyODkuNjI0NDkgNDA4LjU2NTIsNDA4Ljg4MDMyIDI4OS4zMTg4Miw1MjguMTI2NyAxNzAuMTI5MTMsNDA4Ljg3MDg3IDUwLjkzOTQ0NCwyODkuNjE1MDQgMTcwLjEzODU4LDE3MC40MTU5MSBDIDIzNS42OTU3NCwxMDQuODU4NzQgMjg5LjM0NzE2LDUxLjIyNjIyIDI4OS4zNzU1MSw1MS4yMjYyMiBjIDAuMDI4MywwIDUzLjY4OTIyLDUzLjY0MTk3IDExOS4yNDYzOCwxMTkuMTk5MTMgeiIKICAgICBzdHlsZT0iZmlsbDojZmYwMDAwO3N0cm9rZTpub25lIiAvPgogIDxwYXRoCiAgICAgZD0ibSAzNTguNjg3NSwxMDUuNjg3NSBjIC0xMS4wNDIzLDExLjk1MTA0IC0wLjAzNDYsNjEuMTIyOTUgLTIyLjg0Mzc1LDEwNy4yMTg3NSAtMTEuODI1MTMsLTEyLjYxMzQ2IC0xNi41NjY5MiwtMzYuMjY4NjMgLTI5Ljk2ODc1LC00OC4wOTM3NSA3LjA3MDQ2LDE4LjEzMTg2IC0xMi42MjYzMywxNi41NTc2NiAtNS41MzEyNSw3OS42MjUgLTEwLjcwNzI1LC0yLjY3NjgxIC0xMS4wMzcyNSwtNy4wODg0NiAtMzQuNjg3NSwtMzUuNDY4NzUgNC40MDM1MywyNy41MjIwNCAxLjYwNjYzLDQ0Ljk0MjE3IDcuMTI1LDc1LjY4NzUgMCwwIC01LjcwMDM2LC0xLjIwMTA5IC0zMy4xMjUsLTIxLjMxMjUgOC45MDA4NCwyOS45ODE3NSAtNi42NDg3NCw5My4xMTE2OSAyOC43ODEyNSwxMzcuNzUgTCAyNjguMzEyNSw0MDEgYyAyLjcyNjYyLDQwLjM5NCAzMS4xOTk5NCw3My43NjE3OCA2OS4xMjUsODMuODQzNzUgbCAtNjguNTMxMjUsMCAwLDI5LjAzMTI1IDE5MS4xMjUsMCAwLC0yOS4wMzEyNSAtNzQuNTMxMjUsMCBjIDM0LjMxMjQyLC05LjEyMjk4IDYwLjg2NjIzLC0zNy4zMTU1NSA2Ny42MjUsLTcyLjUzMTI1IGwgMCwtMC4wMzEyIGMgOS4zOTMwMSwtMTUuMDEzMDQgNTEuNDA0MTIsLTYzLjYxMjA2IDE5LjA5Mzc1LC0xNDEuODEyNSAwLDAgLTkuNDc5MywxNy4zNzc4NCAtMjYuODEyNSwyMi4wNjI1IDAsMCAyMi4yMDc2MywtMzcuMDE4MjQgMy45Mzc1LC02NyAwLDAgLTUuMzU0ODgsMjEuOTA2ODIgLTIzLjYyNSwyMi44NDM3NSAwLDAgOC44OTI4NywtNDYuNzI0MTQgLTE1LC03Ni40Njg3NSAtOC42NzE3NiwxOS43MDg1NSA1LjE5MjUxLDI3Ljg3NTU2IC0yMy42NTYyNSw0NC4xNTYyNSAtMy45NDY4NiwtNjAuNzIyOTIgLTE2LjU0OTg3LC03MC45NTc5MSAtMjguMzc1LC0xMTAuMzc1IHogTSAzNTIuMzc1LDIzOC4xMjUgYyAxMS4wMTUxNyw2Ljc3ODU2IDE4LjkzODk5LDE4LjQzNzMgMjEuMzQzNzUsNDAuMzEyNSAxLjA1Nzc0LDkuNjIxODkgNC42NTQ0MywxNS4xMzU4MyA3LjI4MTI1LDI0LjkwNjI1IC02LjI5OTIyLC0xLjM0MjU2IC0xMi44MzMzMiwtMi4wNjI1IC0xOS41MzEyNSwtMi4wNjI1IC04LjE4NDk3LDAgLTE2LjExOTk4LDEuMDQ5NzQgLTIzLjY4NzUsMy4wMzEyNSAtMS42Nzc1MSwtMzEuODY4MjIgMTUuMDAyODIsLTI0Ljg3MTI4IDE0LjU5Mzc1LC02Ni4xODc1IHogTSAzMTIuMTg3NSwyNjEgYyAwLDAgNC40MDg5OCwyNy43NzkyMSAxNS42NTYyNSw0Ni41MzEyNSAtNy45MjQ3OSwzLjA2MzQgLTE1LjMxOTk3LDcuMTk0NCAtMjIuMDMxMjUsMTIuMTg3NSAtMy42OTQ5MywtMjguNzk4NSA0LjY3MjU3LC0zNS4zMTA1MyA2LjM3NSwtNTguNzE4NzUgeiBtIDk3Ljc1LDE0LjE4NzUgYyAwLDAgNC4xMjk3NywyNy44MTUxNSA5Ljc1LDQ2LjQ2ODc1IC04LjkwNjEyLC03LjExNjgyIC0xOS4xNDkxMywtMTIuNjM0MzUgLTMwLjI4MTI1LC0xNi4xMjUgNC42OTE0MiwtOS42MDA2NiAxMS45MDgyOSwtMjIuMjQzMzkgMjAuNTMxMjUsLTMwLjM0Mzc1IHogbSAtMTQxLjEyNSwzMC43NSBjIDAsMCA4LjM3MDA3LDguNDQyNjcgMzAuMjUsMTkuMjgxMjUgLTcuNjc3NDksNi45MDI4MiAtMTQuMTk1MzUsMTUuMDcwMDUgLTE5LjI1LDI0LjE1NjI1IC0zLjQxMTk3LC0xMS4xNzUwNyAtOC4yMDAyMSwtMjguMDM4NzEgLTExLC00My40Mzc1IHogbSAxODUuMjgxMjUsMTAuMjUgYyAwLjczNDI5LDEwLjI4MDA0IDAuNzQ3MTQsMzUuMjg5NTIgLTMuOTM3NSw0OC44NzUgbCAwLjAzMTIsMC40Njg3NSBjIC00LjEzODk4LC0xMi42MTkzMiAtMTAuODkxNTksLTI0LjA0Nzk2IC0xOS42MjUsLTMzLjY1NjI1IDUuNjMzMzksLTQuNTAyMjEgMTUuMjExOTksLTExLjY4MTkyIDIzLjUzMTI1LC0xNS42ODc1IHogbSAtOTMuNDM3NSwxMC45MDYyNSBjIDM2LjgzMDY5LDEwZS02IDY2LjcxODc1LDI5LjkxOTMxIDY2LjcxODc1LDY2Ljc1IDAsMzYuODMwNjkgLTI5Ljg4ODA2LDY2LjcxODc1IC02Ni43MTg3NSw2Ni43MTg3NSAtMzYuODMwNjgsMCAtNjYuNzE4NzUsLTI5Ljg4ODA2IC02Ni43MTg3NSwtNjYuNzE4NzUgMCwtMzYuODMwNjggMjkuODg4MDYsLTY2Ljc1IDY2LjcxODc1LC02Ni43NSB6IgogICAgIHRyYW5zZm9ybT0ic2NhbGUoMC44LDAuOCkiCiAgICAgc3R5bGU9ImZpbGw6IzAwMDAwMDtzdHJva2U6bm9uZSIgLz4KPC9zdmc+Cg==" },
      compressed_gas: { text: "ก๊าซความดัน (Compressed Gas)", url: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgo8c3ZnCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgdmVyc2lvbj0iMS4wIgogICB3aWR0aD0iNTc5cHQiCiAgIGhlaWdodD0iNTc5cHQiCiAgIHZpZXdCb3g9IjAgMCA1NzkgNTc5Ij4KICA8cGF0aAogICAgIGQ9Ik0gMjUuMzAxMTY1LDI4OS42NzE3MiAyODkuMzI5ODcsNTUzLjcwMDQ0IDU1My40MDI2MSwyODkuNjI3NyBDIDQ2NS4zNTAyMiwyMDEuNjc1NyAzNzcuNDcxODIsMTEzLjU0OTQyIDI4OS4zNzM5LDI1LjY0MzAyNCBMIDI1LjMwMTE2NSwyODkuNjcxNzIgeiIKICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO3N0cm9rZTpub25lIiAvPgogIDxwYXRoCiAgICAgZD0iTSAxNDcuNjU5NDEsMTQ4LjAxMjMzIDYsMjg5LjY3MTczIDE0Ny42Njg4Niw0MzEuMzQwNTkgMjg5LjMyODI3LDU3MyA0MzEuMDE2MDIsNDMxLjMxMjI0IDU3Mi43MDM3OCwyODkuNjI0NDkgNDMxLjA2MzI3LDE0Ny45ODM5OCBDIDM1My4xNjU3MSw3MC4wODY0MjQgMjg5LjQwMzg2LDYuMzQzNDcgMjg5LjM3NTUxLDYuMzQzNDcgYyAtMC4wMjg0LDAgLTYzLjc5OTY1LDYzLjc1MjQwMyAtMTQxLjcxNjEsMTQxLjY2ODg2IHogTSA0MDguNjIxODksMTcwLjQyNTM1IDUyNy44MjEwMywyODkuNjI0NDkgNDA4LjU3NDY1LDQwOC44NzA4NyAyODkuMzE4ODIsNTI4LjEyNjcgMTcwLjEyOTEzLDQwOC44NzA4NyA1MC45NDg4OTMsMjg5LjYwNTU5IDE3MC4xMzg1OCwxNzAuNDE1OTEgQyAyMzUuNjk1NzQsMTA0Ljg1ODc0IDI4OS4zNDcxNiw1MS4yMjYyMiAyODkuMzc1NTEsNTEuMjI2MjIgYyAwLjAyODMsMCA1My42ODkyMiw1My42NDE5NyAxMTkuMjQ2MzgsMTE5LjE5OTEzIHoiCiAgICAgc3R5bGU9ImZpbGw6I2ZmMDAwMDtzdHJva2U6bm9uZSIgLz4KICA8cGF0aAogICAgIGQ9Im0gNDM3LjYyNSwyODggYyAtMC45Njg1MiwtMC4wMDMgLTEuOTQ4MzEsMC4wNDQgLTIuNTYyNSwwLjE1NjI1IC0xLjE5Mjk0LDAuMjI0NDIgLTIzMS4yNjY5Niw2MS45OTM2IC0yMzIuMDkzNzUsNjIuMzEyNSAtNi41MTk4MSwyLjU2MzA0IC0xMC44OTU5LDkuNjcwMDkgLTEyLjIxODc1LDE5Ljg3NSAtMC4yNzE2NiwyLjA2Njk4IC0wLjM5OTM2LDUuODQwNSAtMC4yODEyNSw4LjI1IDAuMTg4OTgsMy45MDk1MiAwLjY5OTU0LDcuMjM5MSAxLjY1NjI1LDExLjEyNSAzLjg5NzcxLDE1LjgyNzA3IDEzLjc0NTYyLDI4LjI2Mjc1IDI0LjI4MTI1LDMwLjYyNSAxLjIyODM3LDAuMjcxNjYgNC4xMTUzNywwLjM0OTQxIDUuMzQzNzUsMC4xMjUgMS4wMzkzOSwtMC4xNzcxNiAyMjkuMDI4NzUsLTYxLjMxMDc2IDIzMS4zNDM3NSwtNjIuMDMxMjUgNC40MDU2LC0xLjM3MDEgNy43MjMxNCwtNC40NDU1MiAxMC4xNTYyNSwtOS40MDYyNSAxLjM1ODMsLTIuNzUyMDMgMi4xNzgxNCwtNS40MTQ3OSAyLjg3NSwtOS4zMTI1IDAuNTU1MTMsLTMuMDcwOTIgMS4wMzI3LC00LjM5MDcxIDIuMzQzNzUsLTYuMzc1IDEuNTk0NTMsLTIuNDIxMzEgNC4zNTY5NywtNC40ODU3MSA3LjE1NjI1LC01LjMxMjUgMC40NjA2NCwtMC4xMjk5MiAxMS44NDAwNCwtMy4xNzg4MSAyNS4yODEyNSwtNi43ODEyNSAxMy40NDEyLC0zLjYxNDI0IDI0LjcyNzYsLTYuNzA5NjQgMjUuMDkzNzUsLTYuODc1IDUuNDMzMTgsLTIuNDkyMTYgNy40MTEyMiwtMTAuNDI4MDEgNC4yODEyNSwtMTcuMTI1IC0xLjcyNDQ0LC0zLjY3MzI5IC00Ljg0OTEsLTYuMzg1MDggLTguMTU2MjUsLTcuMDkzNzUgLTEuMTIyMDcsLTAuMjM2MjMgLTIuODM0ODgsLTAuMjA5MTYgLTMuOTY4NzUsMC4wNjI1IC0wLjUxOTcsMC4xMjk5MiAtMTEuNzEzMDksMy4xMjQ2OSAtMjQuOTA2MjUsNi42NTYyNSAtMTMuMTgxMzYsMy41NDMzNyAtMjQuMjcwNjYsNi41MTEwOCAtMjQuNjI1LDYuNTkzNzUgLTAuNDI1MiwwLjEwNjMgLTEuMzYwNDUsMC4xNTYyNSAtMi43MTg3NSwwLjE1NjI1IC0yLjI2Nzc2LC0wLjAxMTggLTMuMTM4LC0wLjE2MjE0IC00Ljk2ODc1LC0wLjkwNjI1IC0yLjI5MTM5LC0wLjk0NDkgLTMuNzM1NjcsLTIuMDk1OTEgLTYuMDYyNSwtNC44MTI1IC0zLjQ4NDMxLC00LjA2MzA4IC02LjYyODg3LC02LjYyNzY4IC0xMC4xMjUsLTguMjgxMjUgLTEuNTAwMDIsLTAuNjk2ODYgLTMuMTEzOSwtMS4yMjA3MSAtNC41MzEyNSwtMS40Njg3NSAtMC42NDk2MiwtMC4xMTIyMSAtMS42MjUyMywtMC4xNTMzIC0yLjU5Mzc1LC0wLjE1NjI1IHoiCiAgICAgdHJhbnNmb3JtPSJzY2FsZSgwLjgsMC44KSIKICAgICBzdHlsZT0iZmlsbDojMDAwMDAwO3N0cm9rZTpub25lIiAvPgo8L3N2Zz4K" },
      corrosive: { text: "กัดกร่อน (Corrosive)", url: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBoZWlnaHQ9IjcyNCIgd2lkdGg9IjcyNCIgdmlld0JveD0iMCAwIDczNSA3MzUiPgo8cGF0aCBkPSJtMzY3LjUgNzI3LjRsMzYwLTM2MC0zNjAtMzYwLTM2MCAzNjB6IiBmaWxsPSIjZjAwIi8+CjxwYXRoIGQ9Im0zNjcuNSA2NzAuMy0zMDIuOC0zMDIuOGwzMDIuOC0zMDIuOCAzMDIuOCAzMDIuOHoiIGZpbGw9IiNmZmYiLz4KPHBhdGggZD0ibTIzMy4zIDM4NC4xYy0xMS4xIDAtMTcuOS0zLjg1LTIxLjEtMTAuMTNoLTc5Ljk4djM2LjU2aDE5OS4zdi0zNi41NmgtNzIuNWMtNC45MyA2LjMyLTE0LjU0IDEwLjEzLTI1Ljc2IDEwLjEzIi8+PHBhdGggZD0ibTI1MS43IDM3MC41YzMuMjUgMCA3LjkxLTEuNTcgMTEuNjctOS4xLjg2LTEuNzEgMS4wMy0zLjg5IDEuMjItNi4yLjEtMS4yLjI2LTMuMTMuNTQtMy44Ny4zNi0uMjUgMS4xOS0uNjEgMS43OC0uODcgMi4yMS0uOTcgNS4yNC0yLjI5IDYuODMtNS40Ny44OS0xLjc4IDEuMTUtMy41NCAxLjE1LTUuMjIgMC0xLjI2LS4xNS0yLjQ3LS4yOS0zLjYyLS4xNS0xLjIxLS4yOC0yLjM3LS4yOC0zLjU3IDAtLjQxLjAwMS0uODIuMDUtMS4yNC4xOC0yLjEgMy44Ny02LjY1IDcuMTktOS41OGwtNS4wNy01Ljc3Yy0xLjU0IDEuMzUtOS4yMyA4LjQtOS43OCAxNC42OS0uMjEgMi40Ny4wNCA0LjU2LjI2IDYuNC4yNiAyLjE5LjM5IDMuNDgtLjExIDQuNDgtLjM1LjY5LTEuNzcgMS4zMi0zLjA0IDEuODctMS45Ni44Ni00LjE3IDEuODItNS40IDQuMDctMS4wOCAxLjk5LTEuMjkgNC41OC0xLjUgNy4wOS0uMDkgMS4xNS0uMjMgMi45LS40NSAzLjQyLS42NiAxLjMxLTEuMzUgMi4zNy0yLjA2IDMuMTYtLjQ4IDEuMzItMS4zMSAzLjIxLTIuNzMgNS4yNXY0LjA4Ii8+PHBhdGggZD0ibTI0MS43IDM2NS43bDQuMzkgNi4zYzIuNTEtMS43NSA0LjMxLTMuNzMgNS42MS01LjU5IDEuNDItMi4wMyAyLjI0LTMuOTIgMi43My01LjI1LjE4LS41LjMyLS45Mi40Mi0xLjIzLjY5LTIuMTUuMTgtNC4xOS0uMjctNS45OC0uNDctMS44OC0uNzQtMy4wOS0uMjItNC4yMy42LTEuMzQgMS42Mi0yLjE0IDIuOTEtMy4xNSAxLjQ3LTEuMTUgMy4zLTIuNTkgNC40NC01IDEuNDItMi45OC41OS02LjI3LS4yMS05LjQ0LS41Ni0yLjIzLTEuMTQtNC41NC0uODMtNi4zbC03LjU2LTEuMzRjLS4xNS44Mi0uMjEgMS42My0uMjEgMi40NCAwIDIuNTEuNiA0LjkxIDEuMTYgNy4wOS4zMSAxLjIzLjc2IDMgLjc2IDMuOSAwIC4xNi0uMDAxLjI5LS4wNC4zOS0uMzQuNzItMS4wNCAxLjI5LTIuMjQgMi4yNC0xLjY5IDEuMzMtMy43OSAyLjk4LTUuMTYgNi0uNzEgMS41OC0uOTUgMy4xMS0uOTUgNC41MSAwIDEuODQuNDEgMy40Ny43MyA0Ljc0LjE1LjYuMzcgMS40OC4zOCAxLjg0LS43OSAyLjQyLTIuMTcgNS41LTUuODEgOCIvPjxwYXRoIGQ9Im0yMDggMzUwYy41MS45NS44NCAxLjg0IDEuMDYgMi42OC43Ni40OSAxLjg4IDEuMjIgMi4xIDEuNTguMzQuOS4wMiAzLjQzLS4yIDUuMTEtLjA3LjU1LS4xNCAxLjA4LS4xOSAxLjYgMS44MyAxLjgzIDQuNzEgMy45NSA2LjI2IDQuNzNsLTIuODkgNS43OWMxLjQzIDIuMDQgMy4xIDQuMDggNC42MiA1Ljc1bDUuNjgtNS4xN2MtMy4yNy0zLjYtNS41Ny03LjEtNi4xMi04LjY0LS4wMDEtLjA3LS4wMDEtLjE0LS4wMDEtLjI0IDAtLjY3LjE2LTEuOTUuMjgtMi44NC4xOS0xLjUxLjQtMy4xMi40LTQuNzEgMC0xLjQ0LS4xNy0yLjg3LS42Ny00LjE4LTEuMDEtMi42NC0zLjM4LTQuMTUtNS4yNy01LjM2LTEuMTItLjcxLTIuNjUtMS42OS0yLjczLTIuMzEtLjAyLS4xNi0uMDMtLjMxLS4wMy0uNDcgMC0uNzcuMjQtMS41Ni42Ny0yLjkuNjMtMS45NSAxLjQ2LTQuNTMgMS40Ni04LjMgMC0uNTEtLjAyLTEuMDQtLjA1LTEuNTlsLTcuNjcuNDZjLjE5IDMuMi0uNDIgNS4wOC0xLjA2IDcuMS0uNiAxLjg3LTEuMjkgNC0uOTYgNi42Ny4wMi4xMy4wNC4yNS4wNi4zOCAxLjc4Ljk0IDMuODYgMi4yOSA1LjI1IDQuODciLz48cGF0aCBkPSJtMTkxLjggMzM0LjFjLjEzIDEuNS0uMTEgMi41Ni0uMzggMy44LS40NyAyLjExLTEuMDUgNC43My42OSA4LjE5IDEuNTUgMy4wOSA0LjIxIDQuNDIgNi4xNSA1LjM4IDEuNTcuNzggMi40OCAxLjI3IDIuOTkgMi4xOS42MyAxLjE2LjU2IDEuOTYuNDQgMy4yOS0uMTQgMS42Mi0uMzQgMy44NSAxLjA3IDYuMjUgMi4zIDMuOTIgOC4yOSA4LjExIDEwLjg0IDkuMzhsLjU0LTEuMDggMi44OS01Ljc5Yy0xLjU2LS43OC00LjQ0LTIuODktNi4yNi00LjczLS42MS0uNjEtMS4xLTEuMTktMS4zOS0xLjY4LS4xNC0uMjMtLjE1LS41Mi0uMDQtMS42Ny4xMS0xLjI0LjI1LTIuOTQtLjI4LTQuOTQtLjIyLS44NC0uNTUtMS43NC0xLjA2LTIuNjgtMS40LTIuNTgtMy40Ny0zLjkzLTUuMjYtNC44Ny0uMzctLjE5LS43My0uMzgtMS4wNy0uNTUtMS42NC0uODEtMi4zNC0xLjIxLTIuNy0xLjk0LS41LTEtLjQ0LTEuMzktLjA2LTMuMS4zMi0xLjQ2Ljc3LTMuNDUuNTQtNi4xMi0uNDQtNS4wNy00LjM2LTkuMzItNy41Mi0xMi43M2wtMi4zMy0yLjYxLTUuOTQgNC44NiAyLjYzIDIuOTZjMi4zNiAyLjU1IDUuMjkgNS43MyA1LjUxIDguMTgiLz48cGF0aCBkPSJtMjI1LjggMzM5LjNjMCA1LjkgMS40MiAxMy44MyA4LjM0IDEzLjgzIDYuOTEgMCA4Ljc0LTguOTQgOC43NC0xMi42IDAtMy4yMy00LjkxLTE2LjkxLTYuMS0yOS4zLTEuNTMtLjAyLTIuODEtLjQ2LTMuODgtMS4xNi0xLjA3IDEzLjktNy4xNSAyMy44Ni03LjE1IDI5LjIiLz48cGF0aCBkPSJtMzM0LjEgMjI3LjVjLTE1LjEgMi40LTg0LjEgMTQuOC05MC43IDE2LjEtOS44MSAxLjg4LTEyLjEtNy0xNi41Ni05LjEyIDAgMCA2LjYxIDM4LjgzIDcgNDEuNzIgMS4zOCAxMC4zOC01LjcyIDE1LjcyLTUuNzIgMjMuNDggMCAyLjgxIDEuMjIgOCA0Ljc5IDEwLjM1IDEuMDcuNyAyLjM1IDEuMTMgMy44OCAxLjE2LjA1IDAgLjA5IDAgLjE0IDAgNi43MiAwIDguMTYtNi43MiA4LjE2LTExLjg0IDAtNy45Mi0zLjg0LTEyLjQ4LTMuODQtMTQuNHMxLjYtNC4xNiA3LjY4LTUuMTJjNi4wOC0uOTYgODIuMS0xNC4xNiA5NC4xLTE2LjFzMjAuODgtMTEuNzYgMTguOTYtMjEuODRjLTEuOTItMTAuMS0xMi43Mi0xNi44LTI3Ljg0LTE0LjRtNS4yIDI4LjMyYy0xMC4yNC42NC05OS43IDkuMjgtOTkuNyA5LjI4bC0xLjkyLTEyLjY0czg4LjUtMTUuMzYgOTguOS0xNy4xYzEwLjQtMS43NiAxNy43NiAyLjQgMTcuNzYgOC45NiAwIDYuNTYtNC44IDEwLjg4LTE1IDExLjUyIi8+PHBhdGggZD0ibTQ5OC44IDMwNi4yYy0yLjA3IDEwLjY4LTYuNTIgMjAuOTMtNi41MiAyMy43NCAwIDMuNjYgMS4wOSAxMi44IDggMTIuOHM5LjEtOC4xMyA5LjEtMTRjMC00LjY2LTQuMDgtMTIuMi01Ljc5LTIzLjEtMSAuNDQtMi4xNC43LTMuNDUuNy0uNDcgMC0uOS0uMDUtMS4zMi0uMTMiLz48cGF0aCBkPSJtMzg3LjcgMjYxLjVjMTIgMS45MiA5Ni4xIDE1LjkzIDEwMi4yIDE2LjkgMy40Ny41NSA2LjMxIDIuODQgNi4zMSAzLjc5cy0zLjcxIDQuNS0zLjcxIDEwLjczYzAgNC43Ni43NCAxMi4yNiA2LjI2IDEzLjI5LjQxLjA4Ljg1LjEzIDEuMzIuMTMgMS4zMSAwIDIuNDUtLjI1IDMuNDUtLjcgNC4xNC0xLjgzIDUuNzgtNi45OSA1Ljc4LTExLjY5IDAtMTAuOTctNS43LTguODEtNC4zMy0xOS4yLjM4LTIuODggNS45Mi00MC41NCA1LjkyLTQwLjU0LTQuNDggMi4wOC01LjY3IDkuODItMTUuNDggNy45NC02LjY3LTEuMjgtODMuOC0xNS41MS05OC45LTE3Ljkxcy0yNS4zNiA1LjQ2LTI3LjMgMTUuNTQgNi40OCAxOS43OSAxOC40OCAyMS43MW05LTI5Ljc1YzEwLjQxIDEuNzEgMTA0LjEgMTguMSAxMDQuMSAxOC4xbC0xLjkyIDEyLjY0cy05Ni45LTguNDgtMTA3LjEtOS4xMmMtMTAuMjQtLjY0LTE0Ljg4LTQuMTYtMTQuODgtMTAuNzJzOC4xNi0xMi44IDE5Ljg0LTEwLjg4Ii8+PHBhdGggZD0ibTUzMi43IDMxOC4yYy4wNSAxLjA4LjA4IDEuNjctLjUxIDMtMS4xMiAyLjQ4LTMuMDcgNS41Ny02IDYuMjdsMS43NSA3LjQ4YzMuMzMtLjc4IDcuOTktMy4yNSAxMS4zLTEwLjYgMS4zNi0zIDEuMjUtNS4xIDEuMTgtNi41NC0uMDYtMS4yLS4wOS0xLjcuOTMtMy4zMS43My0xLjE0LjkzLTEuMTkgMS44LTEuNDIgMS45Ny0uNTIgNC4yMy0xLjM3IDYuMTgtNSAyLjIyLTQuMTQgMS41LTcuNTguOTgtMTAuMS0uMjgtMS4zOC0uNTEtMi40Ni0uMzMtMy41OS4yNy0xLjcyIDEuNDgtMy4wNCAzLjc5LTUuNDEgMS4yNS0xLjI5IDIuNjctMi43NSA0LjExLTQuNThsLTYtNC43NWMtMS4xOCAxLjUxLTIuNCAyLjc2LTMuNTggMy45Ny0yLjU2IDIuNjMtNS4yIDUuMzUtNS44NyA5LjU2LS40IDIuNTEuMDQgNC42NC40IDYuMzUuNDYgMi4yNC42MyAzLjI5LS4yMyA0LjktLjUyLjk4LS41NC45OC0xLjM2IDEuMi0xLjkzLjUxLTQuMTggMS4zMy02LjM0IDQuNzQtMi4xNSAzLjM5LTIuMjMgNS42My0yLjEyIDcuODEiLz48cGF0aCBkPSJtNTE5LjYgMzMxLjJjMy42OC0zLjI0IDQuODItNC40MSA2LjUtOS44MSAxLjA5LTMuNTEuODQtNS44My42NC03LjY5LS4xNi0xLjQ4LS4yNy0yLjU1LjIzLTQuNDYuMjYtLjk4LjM1LTEuMDIgMS40Mi0xLjYgMS42NC0uODggNC4zOC0yLjM1IDUuNTktNy4xMSAxLjExLTQuMzctLjE1LTcuMTItMS4wNy05LjEzLS43Mi0xLjU2LTEuMTUtMi41MS0uNzctNC41NmwtNy41Ni0xLjM4Yy0uOCA0LjQzLjQ0IDcuMTUgMS4zNSA5LjEzLjcyIDEuNTcgMS4wNSAyLjI5LjYxIDQtLjM4IDEuNDktLjY1IDEuNjMtMS43OCAyLjI0LTEuNTMuODItNC4xIDIuMi01LjIyIDYuMzktLjg4IDMuMjktLjY0IDUuNDktLjQ1IDcuMjYuMTcgMS41Ni4yOCAyLjYtLjM0IDQuNTgtMS4xMSAzLjU3LTEuMjMgMy42OC00LjI0IDYuMzJsLTEuNzkgMS41OSA1LjE0IDUuNzEgMS43Mi0xLjUzIi8+PHBhdGggZD0ibTQ2Mi43IDMwNS42Yy44NyAzLjg1IDMuNjEgNS41NCA1LjYxIDYuNzggMS44MiAxLjEzIDIuNDQgMS41OSAyLjY5IDIuOC40IDEuODguMjIgMi40Mi0uMDUgMy4yMi0uNTQgMS42LS45NSAzLjI4LS4xMyA2LjE4IDEuNDQgNS4xIDIuOTggNi43NiA4LjEgMTEuODdsNS40My01LjQzYy00Ljg1LTQuODUtNS4yNS01LjQxLTYuMTUtOC41NS0uMjQtLjg0LS4yMi0uOS4wMi0xLjYzLjU2LTEuNjggMS4wNS0zLjYzLjI4LTcuMjYtLjk2LTQuNTItNC4xLTYuNDUtNi4xNy03LjczLTEuNTctLjk3LTItMS4zMi0yLjE1LTEuOTMtLjI3LTEuMjIuMDItMi4xNS42Ny0zLjk4Ljc4LTIuMjIgMS43Ni00Ljk4IDEuMy04LjkzbC03LjYzLjljLjI2IDIuMTctLjI2IDMuNjMtLjkxIDUuNDctLjc1IDIuMTMtMS42OSA0LjgtLjkyIDguMjMiLz48cGF0aCBkPSJtNDU3LjUgMzAzLjZjMC0xLjM3LS4yMS0yLjk2LS44NS00Ljg2LTEuNzgtNS4yMy0zLjYzLTcuMjUtNS43Ny05LjU4bC0yLjE1LTIuNDQtNS45MSA0LjkgMi40MSAyLjczYzEuOTMgMi4xIDIuOSAzLjE2IDQuMTYgNi44Ni42NiAxLjk1LjQ2IDIuOTcuMTcgNC41MS0uMzggMS45OC0uOTEgNC42OS43OSA4LjUyIDEuODggNC4yMiA0LjY5IDUuMjYgNi41NiA1Ljk1IDEuMjQuNDYgMS40Ni41NCAxLjkgMS40Ny43NCAxLjYuNjUgMi4wNi40NyAyLjg5LS4yMyAxLjEtLjYyIDIuOTQuNDUgNS4zNSAxLjM3IDMuMTIgNS4yNCAxMC40OCAxMS41MSAxMS40bDEuMTItNy42Yy0xLjU0LS4yMy00LTMuMjUtNS42LTYuODlsLS4wNi0uMTguMS0uNTFjLjE2LS43Ni4zLTEuNTcuMy0yLjQ5IDAtMS4zOS0uMzEtMy4wNC0xLjMxLTUuMjEtMS43Ny0zLjgxLTQuNDQtNC44LTYuMjEtNS40NS0xLjMyLS40OS0xLjYzLS42LTIuMTktMS44Ni0uMzgtLjg2LS41Mi0xLjQ3LS41Mi0yLjA5IDAtLjU1LjExLTEuMS4yNS0xLjg1LjE5LS45OS40Mi0yLjE2LjQyLTMuNTgiLz48cGF0aCBkPSJtNTA3LjcgMzQ4LjRjLTcuNTMgNi4wOS0yNC4zOSA2LjU2LTMzLjMtMS41NmwtMS44OC0xLjcxLTIuMzEgMS4wN2MtMy40MyAxLjU5LTggMS43Mi0xMS42NyAxLjgyLTQuNjcuMTMtOC4zNi4yNC0xMC4yNSAzLjE5LTEuMzcgMi4xNC0xLjI0IDUuMS4zNyA3Ljk5LjI2LjQ4LjU3Ljk2LjkxIDEuNDRoMTYuNzVjLTYuMjMgMC05LjUtMi45NC0xMC43MS00LjguOTgtLjA3IDIuMTUtLjEyIDMuMTUtLjE0IDMuNjgtLjExIDguMTEtLjMxIDEyLjMxLTEuNjkgNC41OCAzLjQ5IDEwLjE3IDUuNDkgMTUuODcgNi4yNSA0LjEzLTQuODYgMTEuMS02LjY0IDE1LjE4LTYuNjR2NS43NWMzLjE4LS44MyA2LjExLTIuMDYgOC41Ni0zLjY1IDQuMDggMS43NiA5LjggNS4yMyAxMy43OCA3LjY0IDMuNDYgMi4xIDUuMTcgMy4xMyA2LjMxIDMuNTYgMy40OCAxLjM0IDE4IDIuNTMgMjYuOTkgMi41M3YtNy42OGMtMTAuMTYgMC0yMi4zMi0xLjM0LTI0LjItMi4wMi0uNjEtLjI1LTMuMDktMS43NS01LjA3LTIuOTYtNS4xNy0zLjE0LTEyLjI1LTcuNDQtMTcuMS05LjFsLTEuOTktLjY2LTEuNjMgMS4zMiIvPjxwYXRoIGQ9Im00NjYuMyAzNjAuNmgtMjguNjVjLTEyLjkgMC0xNC4yOCA3LjktMTQuMjggMTAuNjcgMCAuNzcuMDkgMS43NS4zNiAyLjhoMTEuNjRjLTMuNDIgMC00LjUxLTEuMzQtNC41MS0yLjc3czEuMzEtMyA2Ljc5LTNoNDUuOTljLjI1LTMuMTIgMS4zNi01LjY2IDIuOTYtNy42OGgtMjAuMyIvPjxwYXRoIGQ9Im00OTEuNCAzNjguM2gxLjFsMjIuOTYtNS4zNi0xMy4xLTIuMzJoLS4yNHYuNjZjLS4xIDAtOS42MS40My0xMC43MyA3Ii8+PHBhdGggZD0ibTQxOS4zIDM3NC4xYy03LjQgMC0xMi4zOCA1LjgxLTEyLjM4IDExLjI0IDAgNS4xOCA0LjYgMTEuNDMgMTIuNzYgMTEuNDNoMi4zOWMuNTUtMi45NSAyLjktNy4xNSAxMS42NS03LjYzdi0uMDVoLTE0Yy0yLjg4IDAtNS0yLjgyLTUuMDgtMy43NiAwLTEgMS40LTMuNTUgNC43LTMuNTVoNDkuODl2LTcuNjhoLTQ5Ljg5Ii8+PHBhdGggZD0ibTQyMiAzOTYuN2MtLjEyLjYzLS4xNSAxLjE5LS4xNSAxLjY2IDAgNi4zIDUuNTUgMTEuNDMgMTUgMTEuNDNoLjE4YzEuNDQtNC4yNiA2LjY5LTcuMjYgMTMuNjctNy42NHYtLjA1aC0xMy44NWMtNC43NiAwLTcuMzYtMi40OC03LjM2LTMuNzUgMC0xLjA5IDIuOTQtMS42NiA1Ljg0LTEuNjZoMzMuNzd2LTcuNjhoLTMzLjc3Yy0uNiAwLTEuMTYuMDItMS43MS4wNS04Ljc1LjQ4LTExLjEgNC42OC0xMS42NSA3LjYzIi8+PHBhdGggZD0ibTQzNy4xIDQwOS44Yy0uMjYuNzctLjQxIDEuNTgtLjQxIDIuNDIgMCA0LjgyIDQuMzIgMTAgMTMuOTYgMTAuODUgNi45OC41OCAzNy4xIDEuNTMgNDIuNjIgMS41MyA0LjUgMCAyMy4zNi0uNjEgMzMuNTItMy41NyAzLS44OCA1LjU1LTIuMDYgOC0zLjIgNS4yOC0yLjQ2IDEwLjc0LTUgMjIuNi01di03LjY4Yy0xMy41NyAwLTIwLjEgMy4wNC0yNS44NCA1LjcxLTIuMjkgMS4wNi00LjQ1IDIuMDctNi45MSAyLjc5LTguNTMgMi40OS0yNS45OCAzLjI2LTMxLjM3IDMuMjYtNS4xIDAtMzUuMi0uOTQtNDEuOTktMS41LTQuODgtLjQxLTYuOTEtMi4yOC02LjkxLTMuMTkuMTctLjQ3IDIuNTItMi40MiA3LjkyLTIuNDJoMzAuOTJsLTcuNC03LjY4aC0yMy41MmMtLjUxIDAtMS4wMi4wMi0xLjUyLjA1LTYuOTkuMzgtMTIuMjMgMy4zNy0xMy42NyA3LjYzIi8+PHBhdGggZD0ibTQ4Ni45IDM2MC4yYy0uMTEuMTMtLjIyLjI1LS4zMi4zOC0xLjYgMi4wMi0yLjcxIDQuNTYtMi45NiA3LjY4LS4wMy40My0uMDYuODYtLjA2IDEuMzEgMCA3LjE0IDMuNzYgMTkuNiAyOC45NiAyMi43OWwuOTYtNy42MmMtOC4zMS0xLjA1LTIyLjItNC40Mi0yMi4yLTE1LjE3IDAtLjQ2LjA0LS45LjExLTEuMzEgMS4xMy02LjU5IDEwLjYzLTcgMTAuNzMtN3YtNy42OGMtNC4wNyAwLTExLjEgMS43OC0xNS4xOCA2LjYzIi8+PC9zdmc+" },
      toxic: { text: "สารพิษ (Toxic)", url: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBoZWlnaHQ9IjcyNCIgd2lkdGg9IjcyNCIgdmlld0JveD0iMCAwIDczNSA3MzUiPgo8cGF0aCBkPSJtMzY3LjUgNzI3LjRsMzYwLTM2MC0zNjAtMzYwLTM2MCAzNjB6IiBmaWxsPSIjZjAwIi8+CjxwYXRoIGQ9Im0zNjcuNSA2NzAuMy0zMDIuOC0zMDIuOGwzMDIuOC0zMDIuOCAzMDIuOCAzMDIuOHoiIGZpbGw9IiNmZmYiLz4KPHBhdGggZD0ibTM2MS42IDM2NC4yYzguMjMgMCA1LjQ1LTMuMzMgMTIuNDgtMy4zMyA1LjczIDAgMy43OSAzLjI0IDExLjU2IDMuMjQgNy4yMSAwIDguOTctNS40NSA4Ljk3LTcuNjcgMC0zLjQyLTMuODgtNS42Mi01LjY0LTEwLjI2LTEuNzYtNC42Mi01LjE4LTIxLjcyLTE1LjYyLTIxLjcyLTMuODQgMC02LjEgMS41Ny04Ljk3IDQuOTktNC43MSA1LjU1LTUuMDkgMTQuODctOCAxOC40OS0yLjg3IDMuNTEtMy45OCA3LjI4LTMuOTggOS4yNSAwIDIuMTMgMS4wMiA3IDkuMjUgN20tODAuNTUgNTguNTEtNy45IDMuNzRjLTcuOTEgMy44MS0xNy43OCAxMS43Ny0xOS44MyAyOC4xLS4zNCAyLjY4LTYuMzkgOS43OS0xMi41OSA5Ljc5LTMuODEgMC04LjMyLTIuNTItOC45NC02LjI3LTEuMDgtNi40NC01Ljk1LTI5LjU1LTYuMTYtMzAuNTMtLjYtMi44NS0zLjQtNC42OC02LjI2LTQuMDdzLTQuNjggMy40LTQuMDcgNi4yNmMuMDAxLjA2Ljc2IDMuNjUuNzYgMy42NS05LjE4LTQuMzgtOS41Ni01LjE3LTkuNTYtOC4zMyAwLTMuOSA5LTguODcgMTYuMS04Ljg3IDUuOTcgMCAxMC41NCAxLjcxIDE0Ljk3IDMuMzYgNCAxLjUgOC4xMyAzLjA0IDEyLjggMy4wNCA2LjcyIDAgOC42NC0uNjggMTEuNzMtMi4zNWwyLjYtMS4yN2M0LjA3LTEuNzEgMzUuNjQtMTYuNzggNDkuNTUtMjMuNDMgMS45NCAyLjc4IDQuMjYgNS41NyA2Ljk0IDguMjVtLTMuMy01MmMxMi4yOSA3LjYzIDEyLjEgNy4yOSAxMi4xNiAxMi4xLS4xNSAxLjMtLjIgMy40NC0uMiA3LjQxIDAgMTMuMSAyNS41IDI0LjEgNDEuNTIgMjQuMSAxNy43NyAwIDQxLjMtMTIgNDEuMy0yNC40OXYtNi43NGMwLTUuMzIuNTYtNS44MSAxMC44My0xMS44NHYyNC45OWMwIDYuOTktOS41OCAyMS45MS0yNi44OSAzMC42MmwtLjU2LjI4Yy04LjM4IDQuMjEtMTguOCA5LTIzLjEgOS0zLjk3IDAtMTcuNDEtMy45Mi0yOC4xLTkuMzEtMTcuMzItOC43LTI2Ljg5LTIzLjYzLTI2Ljg5LTMwLjYyem0tMTA4LTQwLjljLS4wMi4wMDEwLS4wNC4wMy0uMDcuMDQuMDItLjAwMTAuMDQtLjAzLjA3LS4wNG0zMTAuOS05LjljMi4zMyAwIDMuMzQuNzYgMy45IDEuMzQgMy40IDMuNTEgMy4wNyAxMy43OCAyLjg0IDIxLjI4bC0uMTMgNS45NWMtLjA2IDIuOTIgMi4yNSA1LjIxIDUuMTYgNS4yOCAyLjkxLjA2IDUuMzMtMi4zNiA1LjQtNS4yOGwuMDUtMi4xM2MuMy44MS40NCAxLjUuNDQgMS45NXYxMC4xNmMwIDIuODgtLjg0IDYuMzItNC44MiA2LjMyLTMuMjcgMC03LjQ2LTIuMDQtMTEuNS00LTQuNjYtMi4yNy05LjEtNC40Mi0xMy41Ny00LjQybC0uNzYtLjAzYy0yLjYzLS4xMy04LjExLS4zOC0xNS44MyAzLjIzbC0uMTUuMDctNTcuNzUgMjkuM3YtMTQuNjhjOC41NC0zLjkgNDEuMy0xOC45MiA0OS40LTIzLjEgOS4xMy00LjcgMTYuMS0xNC43NSAyMC4yLTIwLjc2bDEuNTktMi4yN2MyLjc1LTMuNzggOC40Ny04LjE5IDE1LjU2LTguMTl6bS0yNjYuNCAzOS43LS4wOC0uMDNjLTcuNzItMy42Mi0xMy4yLTMuMzYtMTUuODMtMy4yM2wtLjc2LjAzYy00LjUgMC04LjkxIDIuMTUtMTMuNTcgNC40Mi00IDEuOTctOC4yMiA0LTExLjUgNC0zLjk5IDAtNC44Mi0zLjQzLTQuODItNi4zMnYtMTAuMTZjMC0uNDUuMTQtMS4xNC40NC0xLjk1bC4wNSAyLjEyYy4wNiAyLjkyIDIuNDggNS4zNCA1LjQgNS4yOCAyLjkxLS4wNiA1LjIzLTIuMzYgNS4xNi01LjI4bC0uMTMtNS45NWMtLjI0LTcuNS0uNTYtMTcuNzcgMi44My0yMS4yOC41Ni0uNTcgMS41Ny0xLjM0IDMuOS0xLjM0IDcuMDkgMCAxMi44MiA0LjQxIDE1LjU3IDguMTlsMS41OSAyLjI3YzQuMTQgNiAxMS4xIDE2LjEgMjAuMiAyMC43NiA3LjA4IDMuNjUgMzIuMyAxNS4yMyA0NC41OCAyMC44N3YxNC40NXptMTE3LjEtMTY0LjhjMjkuMzYgMCA0My42MiAxMi4yNSA2MS43IDI4LjY4bDkuNTggOC41OSAzLjU3IDMuMWMxMS40OCA5Ljk1IDIyLjMzIDE5LjM1IDIyLjMzIDI0LjkyIDAgNi45LTIuNDEgMTMuNzgtNS42OCAyMC4yLjM4LTIuMzUuNC0zLjkuNC02Ljg5IDAtMTEuMzctMy4xNC0xNi4yNy0xNC43NS0yOC40MWwtNy42MyA3LjNjMTAuODggMTEuMzcgMTEuODIgMTMuNzkgMTEuODIgMjEuMSAwIDQuNTUgMCA0LjU1LTIuMzEgMTQuOGwtMy4wNiAxMy43NC4zNSAxLjI1Yy4wNC4xMyAzLjU5IDEzLjE4IDMuNTkgMjUuNyAwIDEzLjEtOCAxNy45OC0xOC4xIDI0LjJsLTMuMTggMS45Ni0xMC44OSA2LjU2Yy0xMS41IDYuNzUtMTcuMjMgOS43My0xNy4yMyAyMS41MnY2Ljc0YzAgMy45MS0xNC43OCAxMy45My0zMC41MyAxMy45My0xNC40NiAwLTMwLjM4LTEwLTMwLjk2LTEzLjY0IDAtNC44My4yMS02LjkyLjIxLTYuOTIgMC0xMS41Ni01LjYtMTQuODEtMTYuNzctMjEuMjktMy4xMS0xLjgtNi45Ny00LjA1LTExLjUyLTYuOWwtMy4xOC0xLjk2Yy0xMC4xNC02LjItMTcuMzgtOS43Mi0xNy4zOC0yNC4yIDAtMTUuMjMgMy42My0yMC42NyAzLjYzLTI1LjM3cy01LjA3LTIzLTUuMDctMjUuODdjMC0uMzcuMDQtMy40Ni4wNC0zLjQ2IDAtNi44NS44Ny0xMi41NyAxMS40Ni0yMS45OC44Ni0uNzYgMi4xNy0zLjA5IDEuMTItNC4zOHMtMS40Ny0xLjgzLTIuNjktMy4yN2MtLjYxLS43Mi0xLjcyLTEtMi43OS0xLjAxLTEuMDcgMC0yLjExLjI4LTIuNTguNy0xMi41MyAxMS4xMy0xNS4xIDE5LjU2LTE1LjEgMjkuOTQgMCAwLS4wNCAzLjA5LS4wNCAzLjU1IDAgMi44Mi0uMTIgMS40IDEuMzMgNy4zMy00LjUyLTcuNjYtOC4zMi0xNi4yOC04LjMyLTI0Ljk1IDAtNS4zOSAxMC4zMy0xNC43NSAyMS4yNy0yNC42NWw0Ljc4LTQuMzRjMy43OC0zLjQ1IDcuMS02LjY3IDEwLjI0LTkuNzkgNy4yNC03LjExIDEyLjk1LTEyLjcyIDE5LjYtMTYuMSAxNC45OS03LjYgMjguNi0xMC40IDQyLjgyLTEwLjRtLTYyLjMgMjEwLjVjLTE4LjMyIDguNzYtNDUuMSAyMS41My00OC41NyAyMi45OGwtMy41MiAxLjcxYy0xLjUzLjgzLTIgMS4wNy02LjcxIDEuMDctMi43NSAwLTUuNjktMS4xLTkuMS0yLjM3LTQuODEtMS44LTEwLjc5LTQtMTguNjctNC0xMC44NiAwLTI2LjY0IDcuNTctMjYuNjQgMTkuNDMgMCAxMC41NiA2Ljc3IDEzLjczIDE3Ljk4IDE5bDQuODIgMi4yOWMxLjEzIDUuNTQgMi4yMSAxMC45NSAyLjYzIDEzLjQ4IDEuNTcgOS40NCAxMS4xIDE1LjEgMTkuMzYgMTUuMSAxMS44IDAgMjIuMS0xMS41NSAyMy4xLTE5IDEuMTktOS40NyA1Ljc0LTE1Ljk5IDEzLjkyLTE5LjkybDcuNzktMy42OSA0NC41LTIwLjk1YzMuMDUgMi4xOSA2LjM2IDQuMjMgOS45MiA2IDguNzEgNC4zOCAyNS4yIDEwLjg2IDMyLjg4IDEwLjg2IDYuODIgMCAxNy01LjE0IDI4LjEtMTAuNzIgNC43Ni0yLjM5IDguODQtNSAxMi40OS03Ljg3bDU0Ljc4IDI2LjM1YzguMTggMy45NCAxMi43MyAxMC40NSAxMy45MiAxOS45Mi45NCA3LjQ5IDExLjI3IDE5IDIzLjEgMTkgOC4yOCAwIDE3Ljc4LTUuNjQgMTkuMzYtMTUuMS40Mi0yLjUzIDEuNS03Ljk0IDIuNjMtMTMuNDhsLS40Ny4yMi40Ny0uMjIgNC44My0yLjI5YzExLjIxLTUuMjcgMTcuOTgtOC40NSAxNy45OC0xOSAwLTExLjg2LTE1Ljc3LTE5LjQzLTI2LjY0LTE5LjQzLTcuODggMC0xMy44NiAyLjI0LTE4LjY3IDQtMy40IDEuMjctNi4zNCAyLjM3LTkuMSAyLjM3LTQuNzEgMC01LjE4LS4yNS02LjcxLTEuMDdsLTMuNTItMS43MWMtMy43MS0xLjU2LTM0LjU0LTE2LjI2LTUyLjY2LTI0LjkzLjI1LS43Ni40Ni0xLjUxLjYzLTIuMjUgMTIuNDEtNi4yOCA2Mi44LTMxLjgxIDYzLTMxLjkxIDUuMzQtMi40OSA4LjY0LTIuMzQgMTAuODMtMi4yNGwxLjI2LjA0YzIuMDYgMCA1LjU2IDEuNyA4Ljk0IDMuMzUgNC44OCAyLjM4IDEwLjQyIDUuMDggMTYuMSA1LjA4IDkuMSAwIDE1LjM4LTYuOTQgMTUuMzgtMTYuODh2LTEwLjE2YzAtNS41Mi0zLjgxLTEzLjIxLTEwLjktMTcuNTEtLjM5LTYuNTYtMS43Ny0xMi43MS01LjgyLTE2Ljg5LTIuOTMtMy02Ljc5LTQuNTUtMTEuNDgtNC41NS0xMS4xIDAtMTkuNjkgNi40OC0yNC4xIDEyLjU0bC0xLjc0IDIuNDljLTMuMzUgNC44NS05LjU3IDEzLjg4LTE2LjM0IDE3LjM2LTQuODcgMi41MS0xOS4yMSA5LjE4LTMxLjQ1IDE0LjgyIDcuOTUtNS44IDE0Ljc1LTEzLjU5IDE0Ljc1LTI3LjcgMC04LjgyLTEuNTEtMTcuNi0yLjY3LTIzbDEuOS0yLjgyYzcuNjEtMTAuOTkgMTgtMjYgMTgtNDIuOTMgMC0xMC4zOS0xMC45LTE5LjgzLTI1Ljk4LTMyLjlsLTMuNTUtMy4wOC05LjQtOC40M2MtMTguMi0xNi41NC0zNS4zLTMyLjItNjguNzgtMzIuMi0xNS43MiAwLTMxLjMgNC00Ny41OSAxMi4yOC04LjExIDQuMTEtMTQuNjUgMTAuNTQtMjIuMiAxNy45OC0zLjExIDMuMDUtNi4zMiA2LjIxLTkuOTYgOS41M2wtNC43NSA0LjMyYy0xNC4zNiAxMy0yNC43NCAyMi40LTI0Ljc0IDMyLjQ4IDAgMTYuODkgMTAuNDIgMzEuOTQgMTggNDIuOTNsMS4zNSAyYy0xLjA4IDcuNzMtMi4yIDE3Ljk0LTIuMiAyNS4xIDAgOS44NSA0LjU0IDE2Ljc5IDEwLjQ3IDIyLjItOS40OS00LjQxLTE4LjU4LTguNjgtMjIuMjgtMTAuNTgtNi43Ny0zLjQ4LTEyLjk5LTEyLjUxLTE2LjM0LTE3LjM2bC0xLjc0LTIuNDljLTQuNDEtNi4xLTEzLjEtMTIuNTQtMjQuMS0xMi41NC00LjY5IDAtOC41NiAxLjUzLTExLjQ4IDQuNTUtNC4wNSA0LjE4LTUuNDQgMTAuMzMtNS44MiAxNi45LjAyLS4wMDEwLjA0LS4wMi4wNy0uMDQtLjAyLjAwMTAtLjA0LjAyLS4wNy4wNC03LjA5IDQuMy0xMC45MSAxMS45OS0xMC45MSAxNy41MXYxMC4xNmMwIDkuOTQgNi4zMyAxNi44OCAxNS4zOSAxNi44OCA1LjcxIDAgMTEuMjQtMi43IDE2LjEtNS4wOCAzLjM4LTEuNjUgNi44Ny0zLjM1IDguOTQtMy4zNWwxLjI2LS4wNGMyLjE5LS4xIDUuNDktLjI2IDEwLjgzIDIuMjQuMTkuMDkgNDAuMiAyMC4zOCA1Ny43MyAyOS4ybTEyMC44IDE0LjRjMTAuNzcgNS4xNSA0OC43OSAyMy4zMiA1My4yIDI1LjJsMi42IDEuMjdjMy4wOCAxLjY3IDUgMi4zNSAxMS43MyAyLjM1IDQuNjYgMCA4LjgtMS41NSAxMi44LTMuMDQgNC40Mi0xLjY1IDktMy4zNiAxNC45Ny0zLjM2IDcuMSAwIDE2LjEgNC45NyAxNi4xIDguODcgMCAzLjE2LS4zOCAzLjk1LTkuNTYgOC4zMy40Ni0yLjE4Ljc1LTMuNTkuNzctMy42NC42LTIuODUtMS4yMi01LjY1LTQuMDgtNi4yNi0yLjg1LS42LTUuNjUgMS4yMi02LjI1IDQuMDctLjIxLjk4LTUuMDggMjQuMS02LjE2IDMwLjUzLS42MyAzLjc1LTUuMTMgNi4yNi04Ljk0IDYuMjYtNi4yIDAtMTIuMjUtNy4xMS0xMi41OS05Ljc5LTIuMDUtMTYuMzYtMTEuOTEtMjQuMzItMTkuODItMjguMWwtNTEtMjQuNTNjMi40NS0yLjY2IDQuNTUtNS40IDYuMjktOC4xbS0xMy44LTczLjFjMTcuNiAwIDI1LTIyLjEgMjUtMjcuNzlzLTQuNS04LjEtNy4xNS04LjFoLTMzLjQ4Yy0zLjU3IDAtMTIuMTcgMi45MS0xMi4xNyA4LjQ3IDAgMi4wOCAxLjU2IDYuNjYgNC45MiAxMS4xIDUuOCA3LjY4IDEwLjgzIDE2LjI4IDIyLjg3IDE2LjI4bS04Ny40OS4wNGMxMiAwIDE3LjEtOC42IDIyLjg3LTE2LjI4IDMuMzYtNC40NSA0LjkyLTkgNC45Mi0xMS4xIDAtNS41Ni04LjYtOC40Ny0xMi4xNy04LjQ3aC0zMy40OGMtMi42NSAwLTcuMTQgMi4zOC03LjE0IDguMSAwIDUuNjkgNy40MSAyNy43OSAyNSAyNy43OW0tOS4xIDIxLjc2aC03Ljg0YzMuNzYgMS43MyA2LjYxIDMgNy44NCAzLjU5di0zLjU5bS0xMC40IDM2LjdjLjI1IDIuMTQuODYgNC40NiAxLjgxIDYuODh6Ii8+Cjwvc3ZnPgo=" },
      irritant: { text: "ระคายเคือง (Irritant)", url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1NzkwIDU3OTAiPjxwYXRoIGQ9Im0yNTMgMjg5NyAyNjQwIDI2NDAgMjY0MS0yNjQwYy04ODAtODgwLTE3NjAtMTc2Mi0yNjQwLTI2NDBMMjUzIDI4OTciIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJtNjAgMjg5NyAyODMzIDI4MzMgMjgzNC0yODM0TDI4OTQgNjMgNjAgMjg5N3ptNTIxOCAwTDI4OTMgNTI4MCA1MTAgMjg5NiAyODk0IDUxMmwyMzg0IDIzODQiIGZpbGw9InJlZCIvPjxwYXRoIGQ9Ik0yODkyIDE0MjhoLTIwYTQ3NSA0NzUgMCAwIDAtMzAxIDEyMSAyMjkgMjI5IDAgMCAwLTY0IDExM2MtMyAxMS0zIDE0LTMgMzVzMCAyNSAzIDM3YzIgMTQgMTk1IDEzMTQgMTk3IDEzMzZhMjEzIDIxMyAwIDAgMCAyMzkgMTgyIDIxMyAyMTMgMCAwIDAgMTgwLTE4MmMzLTI3IDE5NS0xMzI0IDE5OC0xMzM3IDItMTIgMi0xNiAyLTM1IDAtMjMgMC0zMS01LTQ3YTIzNCAyMzQgMCAwIDAtMTA2LTEzOCA0OTYgNDk2IDAgMCAwLTI5MS04NWgtMzB6bTIwIDIwMTFoLTEyYTMwMiAzMDIgMCAwIDAtMjQzIDE0MSAzMzggMzM4IDAgMCAwLTU1IDIzMiAzNDMgMzQzIDAgMCAwIDExNCAyMTggMzEwIDMxMCAwIDAgMCAxOTkgNzQgMzE2IDMxNiAwIDAgMCAyNTgtMTQxIDM0MSAzNDEgMCAwIDAgNTQtMjM0IDM5MCAzOTAgMCAwIDAtMzItMTEwIDMxNyAzMTcgMCAwIDAtMjgxLTE4MCIvPjwvc3ZnPg==" },
      health_hazard: { text: "ภัยสุขภาพ (Health Hazard)", url: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNzI0IiB3aWR0aD0iNzI0IiB2aWV3Qm94PSIwIDAgOTE5IDkxOSI+PHBhdGggZmlsbD0iI2YwMCIgZD0ibTQ1OS41IDkwOS4zbDQ0OS44LTQ0OS44LTQ0OS44LTQ0OS44LTQ0OS44IDQ0OS44eiIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Im00NTkuNSA4MzgtMzc4LjUtMzc4LjUgMzc4LjUtMzc4LjYgMzc4LjUgMzc4LjZ6Ii8+PHBhdGggZD0ibTQ2MS42IDE3MC4xYy01MyAwLTk2IDQ2LjMtOTYgMTAzLjQgMCAzNy4xIDEzLjg4IDg5LjIgNDAuOTQgMTIxLjFsLTMuMzEgMzMuODYtNzIuNiAyNi4zYzEuMTYgNS42NyA2LjE4IDkuOTMgMTIuMTggOS45MyAxLjA2IDAgMi4wOS0uMTUgMy4wNy0uNCAxLjM4IDUuMzYgNi4yMyA5LjMxIDEyIDkuMzEuNjEgMCAxLjIxLS4wNSAxLjgtLjE0IDEuNDIgNS4zIDYuMjQgOS4yMSAxMiA5LjIxIDEuNjkgMCAzLjMtLjM0IDQuNzctLjk1LjM5IDMuOTggMy43NiA3LjEgNy44NSA3LjEuOCAwIDEuNTgtLjEyIDIuMzEtLjM1IDEgNS44NSA2LjEgMTAuMzEgMTIuMjQgMTAuMzEgNC43OCAwIDguOTMtMi43IDExLTYuNjUgMi4wOSAxLjU5IDQuNjkgMi41NCA3LjUxIDIuNTQgMS44MyAwIDMuNTctLjQxIDUuMTMtMS4xMiAxLjYyIDMuNDQgNC42MyA2LjA5IDguMjkgNy4yMy0uMTQuNDUtLjI1LjkzLS4yNSAxLjQzIDAgMi41MyAyLjA1IDQuNTcgNC41NyA0LjU3czQuNTctMi4wNCA0LjU3LTQuNTdjMC0uNTYtLjExLTEuMDktLjMtMS41OSA1LjMzLTEuODcgOS4xNi02LjkzIDkuMTYtMTIuOSAwLTIuNzMtLjgxLTUuMjctMi4xOS03LjQgMi4yNC0uMyAzLjk2LTIuMTkgMy45Ni00LjUxIDAtMS45Ny0xLjI1LTMuNjQtMy00LjI3IDEuOS0yLjE5IDMuMDctNSAzLjA3LTguMTcgMC0uNTktLjA2LTEuMTgtLjE0LTEuNzUgNC42OS0xLjc4IDgtNi4zMSA4LTExLjYyIDAtMy4zMi0xLjMyLTYuMzItMy40NC04LjU1LjM5LjExLjc5LjE5IDEuMjEuMTkgMi41MiAwIDQuNTYtMi4wNSA0LjU2LTQuNTcgMC0yLjUzLTIuMDQtNC41Ny00LjU2LTQuNTctMSAwLTEuOTIuMzMtMi42OC44OC0uOTEtMS43LTIuNTYtMi45My00LjUyLTMuMjUgMS41NC0yLjUyIDIuNDQtNS40NiAyLjQ0LTguNjMgMC0yLjA1LS4zOS00LTEuMDctNS44MiA0LjcxLTEuNzYgOC4xLTYuMyA4LjEtMTEuNjIgMC0zLjExLTEuMTQtNS45NC0zLTguMTIgMy40NS0xLjE0IDUuOTQtNC4zOSA1Ljk0LTguMjMgMC0zLjE1LTEuNjktNS45LTQuMi03LjQyIDEuMTgtMS40OCAxLjg4LTMuMzQgMS44OC01LjM4IDAtLjUyLS4wNS0xLjAzLS4xNC0xLjUyIDEuOC0uMDkgMy40Ni0uNyA0LjgyLTEuNzItLjExLjU0LS4xNiAxLjA4LS4xNiAxLjY0IDAgMy4wOCAxLjYgNS43OCA0IDcuMzItLjQ4IDEuMzItLjc1IDIuNzQtLjc1IDQuMjIgMCA1LjA3IDMgOS40MSA3LjM2IDExLjM1LS40IDEuNDItLjYzIDIuOTItLjYzIDQuNDYgMCA1LjI2IDIuNDggOS45NCA2LjMzIDEyLjk0LTMuMzcgMS40Ny01LjczIDQuODMtNS43MyA4Ljc0czIuMzUgNy4yNiA1LjcxIDguNzRjLS42NyAxLjE2LTEuMDYgMi41MS0xLjA2IDMuOTUgMCAzLjE2IDEuODUgNS44NyA0LjUzIDcuMTMtLjc3IDEuOTEtMS4yIDMuOTktMS4yIDYuMTcgMCAyLjYyLjYzIDUuMSAxLjczIDcuMy0uNTMuNi0xIDEuMjItMS40NSAxLjg5LS44My0uODQtMS45OC0xLjM2LTMuMjUtMS4zNi0yLjUyIDAtNC41NyAyLjA0LTQuNTcgNC41NyAwIDIuNTIgMi4wNSA0LjU2IDQuNTcgNC41Ni4yMiAwIC40Mi0uMDMuNjMtLjA2LS4wMy40Mi0uMDYuODQtLjA2IDEuMjcgMCAzLjE3LjkxIDYuMTEgMi40NiA4LjYyLTEuMzMgMi41Mi0yLjA5IDUuMzktMi4wOSA4LjQ0IDAgNC42OCAxLjc4IDguOTIgNC42NyAxMi4xNC0uOCAxLjMtMS4yNyAyLjgyLTEuMjcgNC40NiAwIDQuNjcgMy43OCA4LjQ2IDguNDYgOC40NiA0LjE2IDAgNy42MS0zIDguMzItNi45NiAyLjI5LS4yNSA0LjQ0LS45MiA2LjM5LTEuOTMgMSAyLjE3IDMuMiAzLjY5IDUuNzUgMy42OSAzLjUxIDAgNi4zNS0yLjg0IDYuMzUtNi4zNSAwLTIuNjUtMS42NC00LjkyLTMuOTUtNS44Ny42NC0xLjM4IDEuMS0yLjg3IDEuMzgtNC40MSAxLjM3LjM3IDIuOC41OCA0LjI5LjU4LjE4IDAgLjM3LS4wMi41Ni0uMDIgMS4xMSAyLjg2IDMuODkgNC44OCA3LjE1IDQuODggMi41IDAgNC43Mi0xLjIgNi4xMi0zLjA2Ljc5IDIuODggMy40MiA1IDYuNTYgNSAyLjM3IDAgNC40Ni0xLjIyIDUuNjgtMy4wNyAxLjMyLjgxIDIuODYgMS4yOSA0LjUzIDEuMjkgNC43OSAwIDguNjctMy44OSA4LjY3LTguNjggMC0xLjYtLjQ0LTMuMDktMS4yLTQuMzguNjYuMjIgMS4zNy4zMyAyLjA5LjMzIDMuNzYgMCA2LjgxLTMuMDQgNi44MS02LjggMC0uMzItLjAzLS42My0uMDgtLjk0IDEuNDUgMi43OSA0LjM1IDQuNjkgNy43MSA0LjY5IDQuNzMgMCA4LjU3LTMuNzggOC42Ni04LjQ5IDIuMjYtMS40IDMuODQtMy44MSA0LjA5LTYuNi40NC4xNS45LjI0IDEuMzkuMjQgMi41MiAwIDQuNTctMi4wNCA0LjU3LTQuNTcgMC0uNTItLjA5LTEuMDMtLjI2LTEuNWwtNi45NC0yLjIzLTcyLjUtMjMuMzQtLjI5LTMwLjk1YzExLTExLjg0IDE5LjU5LTI3LjEgMjUuODEtNDMuNjkgMTEuNzgtMzEuNCAxOC4xLTY0LjYgMTguMS04MS45OCAwLTQ1LTQzLTEwMy40LTk2LTEwMy40em0tMTQ4LjYgMjkxLjljLTEuMjUgMC0yLjQyLjM2LTMuNDEuOTctMTcuMjUgNi42MS0zMS41NyAxMi4xLTM3IDE0LjMtMTIuMTcgNC44Ni0yMS4yIDE3Ljg3LTIxLjIgMzAuNzZ2NDEuNTRsNjcuMyA2OC4zYy42OC4xNSAxLjQuMjIgMi4xMy4yMiAzLjczIDAgNi45OS0yLjAzIDguNzMtNSAxLjM1LjUxIDIuODIuOCA0LjM1LjggNi44NyAwIDEyLjQ0LTUuNTcgMTIuNDQtMTIuNDQgMC0uNDktLjA0LS45OC0uMDktMS40NSAxLjg0IDIuMjggNC42NiAzLjc0IDcuODMgMy43NCA1LjU2IDAgMTAuMS00LjUxIDEwLjEtMTAuMSAwLTEuNTEtLjM0LTIuOTMtLjkzLTQuMjEgMi0uNzEgMy43NC0yLjA0IDQuOTQtMy43NiAxLjI4IDEuMzEgMy4wNiAyLjEyIDUgMi4xMiAzLjg5IDAgNy4xLTMuMTYgNy4xLTcgMC0yLjAzLS44Ni0zLjg1LTIuMjMtNS4xNCAyLjU4LTEuMjUgNC41NC0zLjU3IDUuMzEtNi4zOSAxLjYyIDEuNzggMy44NyAyLjk4IDYuMzkgMy4yNC0xIDEuMjMtMS42MyAyLjgtMS42MyA0LjUyIDAgMy44OSAzLjE2IDcgNy4xIDdzNy4xLTMuMTYgNy4xLTdjMC0zLjE5LTIuMTItNS44OC01LTYuNzUgMi4yNC0xLjg1IDMuNjctNC42NSAzLjY3LTcuNzggMC0uOTMtLjEzLTEuODEtLjM3LTIuNjYuMzEuMDIuNjIuMDQuOTMuMDQgMS40MiAwIDIuNzctLjI5IDMuOTktLjgyLjExIDIuNzEgMi4zMiA0Ljg4IDUuMDYgNC44OCAyLjggMCA1LjA4LTIuMjggNS4wOC01LjA4IDAtMi43NC0yLjE3LTQuOTUtNC44OS01LjA2LjUzLTEuMjIuODMtMi41Ny44My0zLjk5IDAtLjg3LS4xMy0xLjctLjM0LTIuNSAyLjUzIDAgNC41OC0yLjA0IDQuNTgtNC41NyAwLTIuNTItMi4wNS00LjU2LTQuNTgtNC41Ni0uMTMgMC0uMjUuMDItLjM4LjAzLS4yNi0zLjgtMi4yMi03LjEzLTUuMTMtOS4yMy4wMDEtLjI5LjA0LS41OC4wNC0uODggMC02Ljg3LTUuNTctMTIuNDMtMTIuNDQtMTIuNDMtMi4zOSAwLTQuNjIuNjgtNi41MSAxLjg2LjI3LS43Mi40Mi0xLjUuNDItMi4zMSAwLTMuNi0yLjkxLTYuNTItNi41MS02LjUyLS42NSAwLTEuMjYuMS0xLjg1LjI3LjA5LS41OC4xNC0xLjE4LjE0LTEuNzggMC02Ljg3LTUuNTYtMTIuNDQtMTIuNDMtMTIuNDQtMi4xMyAwLTQuMTMuNTMtNS44OCAxLjQ3LTEuNTctMi41Ni00LTQuNS02Ljk3LTUuMzkuMzctLjgyLjU5LTEuNzQuNTktMi43IDAtMy42LTIuOTItNi41Mi02LjUyLTYuNTItLjg1IDAtMS42NS4xNy0yLjM5LjQ2LS4wNS02LjgzLTUuNTktMTIuMzUtMTIuNDMtMTIuMzUtMS4xMSAwLTIuMTcuMTYtMy4xOS40My0uOTktMi4zMy0zLjMtMy45Ny02LTMuOTctMS41OSAwLTMuMDQuNTctNC4xNyAxLjUyLS40NC0zLjE4LTMuMTUtNS42My02LjQ1LTUuNjNtMzA0LjMgMS40NmMtMy4wNi4yNC01LjU1IDIuNDktNi4xNCA1LjQ0LS45My0uNDgtMS45OC0uNzUtMy4xLS43NS0zLjc2IDAtNi44IDMuMDQtNi44IDYuOCAwIC4zNy4wMy43My4wOSAxLjA4LTIuMDctMS41NC00LjYzLTIuNDYtNy40MS0yLjQ2LTYuODcgMC0xMi40NCA1LjU2LTEyLjQ0IDEyLjQzdi4wNmMtMS4yNi0uMy0yLjU3LS40OS0zLjkzLS40OS05LjEgMC0xNi40MSA3LjM1LTE2LjQxIDE2LjQyIDAgLjg1LjA4IDEuNjguMjEgMi41LS45Ny0uNDMtMi4wNC0uNjctMy4xNi0uNjctMi41OSAwLTQuODggMS4yNi02LjMyIDMuMTgtMS40OS0uNDktMy4wNy0uNzYtNC43Mi0uNzYtOC4wOSAwLTE0LjY3IDYuMzktMTUgMTQuNC0uNTItLjExLTEuMDUtLjE2LTEuNi0uMTYtNC4zNSAwLTcuODggMy41My03Ljg4IDcuODggMCAxLjMzLjMzIDIuNTcuOSAzLjY3LTEuMjUtLjcxLTIuNy0xLjEyLTQuMjQtMS4xMi00Ljc5IDAtOC42OCAzLjg5LTguNjggOC42OCAwIDIuNSAxLjA3IDQuNzUgMi43NiA2LjMzdi4wOGMtMiAuMi0zLjY4IDEuNTUtNC4zMiAzLjM5LS4yNi41Ny0uNCAxLjItLjQgMS44NiAwIDEuNi44MyAzIDIuMDggMy44My44Ny42NyAxLjk0IDEuMDggMy4xMiAxLjA4IDIuMTggMCA0LTEuMzcgNC43Ni0zLjI5IDEuMTguNjQgMi41MyAxIDMuOTcgMSAuNjUgMCAxLjI4LS4wOCAxLjg5LS4yMi0uMDUuNTItLjA4IDEuMDUtLjA4IDEuNTkgMCAxLjk4LjM5IDMuODcgMS4wOSA1LjYxLTIuOC42Ni00Ljg5IDMuMTYtNC44OSA2LjE2IDAgLjkzLjIgMS44LjU2IDIuNTkuOSAyLjI5IDMuMTIgMy45MiA1LjczIDMuOTIgMi4xNyAwIDQuMDYtMS4xMiA1LjE2LTIuOC40MS0uNTguNzQtMS4yMS45NS0xLjkgMS45NS45MyA0LjEzIDEuNDYgNi40NCAxLjQ2LjcyIDAgMS40MS0uMDcgMi4xLS4xNi0uNDEgMS4wOS0uNjQgMi4yNy0uNjQgMy41MSAwIDEuNjMuNCAzLjE2IDEuMDkgNC41Mi0uMzItLjA2LS42NS0uMS0uOTktLjEtMi44IDAtNS4wOCAyLjI3LTUuMDggNS4wOCAwIDIuOCAyLjI4IDUuMDggNS4wOCA1LjA4IDIuNTMgMCA0LjYxLTEuODYgNC45OS00LjI4IDEuMzcgNS4zOCA2LjI0IDkuMzYgMTIgOS4zNiAyLjYxIDAgNS0uOCA3LTIuMTcuNiA0Ljk5IDQuODUgOC44NiAxMCA4Ljg2IDIuNjIgMCA1LTEgNi44LTIuNjYtLjAyLjMtLjA1LjYxLS4wNS45MiAwIDYuODYgNS41NyAxMi40MyAxMi40NCAxMi40MyAyLjM1IDAgNC41NC0uNjYgNi40Mi0xLjgtLjk0IDEuMjgtMS41IDIuODYtMS41IDQuNTcgMCA0LjI5IDMuNDcgNy43NiA3Ljc1IDcuNzYgMi41OSAwIDQuODgtMS4yOCA2LjI5LTMuMjJsNjcuMy02MS45OXYtNDUuNGMwLTEzLjc3LTE0LjgyLTMwLjk4LTMyLjc0LTM3LjEtNC0xLjM3LTMwLjU2LTEwLTMwLjU2LTEwbS0xNTMuNCA2Yy0zLjUxIDAtNi4zNSAyLjg0LTYuMzUgNi4zNSAwIDIuNDIgMS4zNyA0LjUgMy4zNyA1LjU3LTEuOTEuNTUtMy4zMSAyLjI5LTMuMzEgNC4zNyAwIDIuNTMgMi4wNSA0LjU3IDQuNTcgNC41N3M0LjU3LTIuMDQgNC41Ny00LjU3YzAtMS41Mi0uNzUtMi44Ni0xLjktMy42OSAzLjA1LS40NiA1LjM5LTMuMDcgNS4zOS02LjI1IDAtMy41MS0yLjg0LTYuMzUtNi4zNC02LjM1bS0yMi43IDUuODlsLS4wMy4yNy0uMzItLjE3Yy4xMi0uMDMuMjQtLjA3LjM1LS4xbTEzLjc4IDIxLjYxYy0yLjUzIDAtNC41NyAyLjA1LTQuNTcgNC41N3MyLjA0IDQuNTcgNC41NyA0LjU3YzIuNTIgMCA0LjU3LTIuMDUgNC41Ny00LjU3cy0yLjA1LTQuNTctNC41Ny00LjU3bS00Mi4xIDQuODZjLTMuNiAwLTYuNTIgMi45Mi02LjUyIDYuNTJzMi45MiA2LjUxIDYuNTIgNi41MSA2LjUyLTIuOTEgNi41Mi02LjUxLTIuOTItNi41Mi02LjUyLTYuNTJtNzMuODYgMTEuNThjLTIuODEgMC01LjEgMi4yOS01LjEgNS4xIDAgMi44MiAyLjI5IDUuMTEgNS4xIDUuMTEuNDEgMCAuODEtLjA2IDEuMTgtLjE2LjE5IDMuNiAzLjE1IDYuNDYgNi43OSA2LjQ2LjUgMCAuOTgtLjA2IDEuNDUtLjE2IDMuMTYtLjM2IDUuNjItMyA1LjYyLTYuMjcgMC0xLjE2LS4zMy0yLjIzLS44Ny0zLjE3LTEuMDctMi4zNi0zLjQ0LTQtNi4yLTQtMS4xMiAwLTIuMTcuMjctMy4xLjc1LS42My0yLjEtMi41Ni0zLjY1LTQuODctMy42NW0tNzAuODUgMTEuNjdjLTIuNTMgMC00LjU3IDIuMDUtNC41NyA0LjU3IDAgMi41MyAyLjA0IDQuNTcgNC41NyA0LjU3Ljk2IDAgMS44Ni0uMyAyLjYtLjgyLjE3IDMuMzYgMi45MSA2IDYuMzEgNiAzLjUxIDAgNi4zNS0yLjg0IDYuMzUtNi4zNSAwLTMuNS0yLjg0LTYuMzQtNi4zNS02LjM0LTEuNzUgMC0zLjMzLjcxLTQuNDggMS44NS0uNDgtMi0yLjI4LTMuNTEtNC40My0zLjUxbTg5IDMyLjUxYy0zLjc2IDAtNi44IDMuMDQtNi44IDYuOCAwIC44Ni4xNiAxLjY4LjQ1IDIuNDQtMi40Ni4zNC00LjM3IDIuNDQtNC4zNyA1IDAgLjcyLjE2IDEuNC40MyAyIC43MSAxLjc5IDIuNDUgMy4wNyA0LjUgMy4wN2guMTNjMi44MiAwIDUuMS0yLjI4IDUuMS01LjA4IDAtLjIzLS4wNC0uNDUtLjA3LS42Ny4yMS4wMi40Mi4wMy42My4wMyAzLjc2IDAgNi44LTMuMDQgNi44LTYuOHMtMy4wNC02LjgtNi44LTYuOG0tNTMuMyA4LjU4Yy0zLjUxIDAtNi4zNSAyLjg1LTYuMzUgNi4zNSAwIDMuNTEgMi44NCA2LjM1IDYuMzUgNi4zNSAzLjUgMCA2LjM0LTIuODQgNi4zNC02LjM1IDAtMy41LTIuODQtNi4zNS02LjM0LTYuMzVtLTM3IC45M2MtMi44IDAtNS4wOCAyLjI3LTUuMDggNS4wOCAwIDIuOCAyLjI4IDUuMDcgNS4wOCA1LjA3czUuMDctMi4yNyA1LjA3LTUuMDdjMC0yLjgxLTIuMjctNS4wOC01LjA3LTUuMDhtNy40NCAxMy43OGMtMy44OSAwLTcuMSAzLjE2LTcuMSA3IDAgMy41NCAyLjYxIDYuNDYgNiA2Ljk3LS4wMi4yNi0uMDUuNTItLjA1Ljc5LTIuMTYtMS43OC00LjkyLTIuODYtNy45NC0yLjg2LTQuNTIgMC04LjQ3IDIuNDMtMTAuNjUgNi0xLjg0LTIuMDMtNC40OS0zLjMxLTcuNDUtMy4zMS00LjcgMC04LjY0IDMuMjItOS43NSA3LjU4LTEuNjItMS4xMS0zLjU3LTEuNzUtNS42OC0xLjc1LTUuNTYgMC0xMC4xIDQuNS0xMC4xIDEwLjEgMCAuNzguMDkgMS41My4yNiAyLjI2LTIuNjctMi40My02LjIxLTMuOTMtMTAuMS0zLjkzLTYuMjEgMC0xMS41MyAzLjc2LTEzLjgzIDkuMTItMS42Mi0xLjEtMy41Ny0xLjc1LTUuNjgtMS43NS01LjU2IDAtMTAuMSA0LjUtMTAuMSAxMC4xIDAgLjgxLjEgMS42LjI4IDIuMzVsMTIyLjIgMTI0LjFjMS42LS42NyAyLjcyLTIuMjUgMi43Mi00LjA5IDAtMS43NC0xLjAyLTMuMjMtMi40OC0zLjk2IDEuNzMtLjYxIDIuOTgtMi4yMyAyLjk4LTQuMTcgMC0xLjgzLTEuMTEtMy40LTIuNjktNC4wOCAxLjU3LTEuMDMgMi42LTIuOCAyLjYtNC44MSAwLTIuNzUtMS45Mi01LTQuNDktNS42MiA1LjExLTMuNTMgOC40Ny05LjQyIDguNDctMTYuMSAwLTQuMTMtMS4yOC03Ljk1LTMuNDYtMTEuMSAzLjUyLTIuMiA1Ljg2LTYuMSA1Ljg2LTEwLjU1IDAtNS0yLjk4LTkuMzUtNy4yNy0xMS4zMSAxLjY5LTEuMjkgMi43OC0zLjMxIDIuNzgtNS42IDAtMi4zOS0xLjE5LTQuNS0zLTUuNzggMS4wMy0xLjIyIDEuNjQtMi43OSAxLjY0LTQuNTEgMC0zLjg5LTMuMTYtNy03LjEtNy0uNTkgMC0xLjE1LjA4LTEuNy4yMS43OS0xLjYzIDEuMjUtMy40NiAxLjI1LTUuNCAwLTEuODEtLjQtMy41My0xLjEtNS4wOCAzLjY2LS4yNiA2LjU0LTMuMyA2LjU0LTcgMC0zLTEuOTItNS42MS00LjYxLTYuNiAyLjYzLTIuMjggNC4zMS01LjY0IDQuMzEtOS40IDAtNC4zLTIuMTgtOC4wOS01LjUtMTAuMzIgMS45Mi0yLjE5IDMuMS01LjA2IDMuMS04LjIgMC0yLjc1LS45LTUuMjgtMi40Mi03LjM0IDEuOTYtLjcgMy4zNy0yLjU2IDMuMzctNC43NiAwLTIuOC0yLjI3LTUuMDgtNS4wOC01LjA4LTEuNzEgMC0zLjIyLjg2LTQuMTQgMi4xNi0yLjI3LTIuODEtNS43NS00LjYxLTkuNjUtNC42MS0xLjgzIDAtMy41NS40LTUuMTEgMS4xLTEuMTktMi4yMS0zLjUzLTMuNzItNi4yMi0zLjcyem02OS4xIDIuMDNjLTQuNjcgMC04LjQ2IDMuNzktOC40NiA4LjQ2IDAgMS40NC4zNyAyLjggMSAzLjk4LTEuMjItMS0yLjc4LTEuNjEtNC40OC0xLjYxLTMuOSAwLTcuMSAzLjE1LTcuMSA3IDAgMy4zNSAyLjM0IDYuMTUgNS40OCA2Ljg2LS45MiAxLjc0LTEuNDUgMy43MS0xLjQ1IDUuODEgMCA0IDEuOTMgNy42MSA0LjkxIDkuODgtMS4xNCAyLjEyLTEuNzkgNC41NC0xLjc5IDcuMTEgMCAzLjk5IDEuNTYgNy42MSA0LjEgMTAuMy0uODMgMS44Ny0xLjMgMy45My0xLjMgNi4xIDAgLjg0LjA5IDEuNjYuMjIgMi40Ni0xLjAyLS43LTIuMjMtMS4xNi0zLjU0LTEuMjUuODYtMS4xNyAxLjM4LTIuNjEgMS4zOC00LjE3IDAtMy45LTMuMTYtNy03LjEtNy0zLjkgMC03LjEgMy4xNS03LjEgNyAwIDEuODcuNzIgMy41NiAxLjkxIDQuODItMi45NS44NC01LjEyIDMuNTYtNS4xMiA2Ljc4IDAgMy44OSAzLjE2IDcgNy4xIDcgLjIyIDAgLjQzLS4wNC42NS0uMDYtMS4zIDIuMjItMi4wNiA0LjgxLTIuMDYgNy41NyAwIDUuMjUgMi42OSA5Ljg2IDYuNzYgMTIuNTUtNS4zOCAyLjI5LTkuMTYgNy42My05LjE2IDEzLjg1IDAgNC41MSAxLjk5IDguNTUgNS4xNCAxMS4zMS0zLjI2IDIuMjQtNS40IDUuOTktNS40IDEwLjI0IDAgMS43NC4zNiAzLjM5IDEgNC44OS0uOTEgMS41MS0xLjQ0IDMuMjctMS40NCA1LjE2IDAgMi4xOC43MSA0LjIgMS44OSA1Ljg1LTEuMDIuODEtMS42OSAyLjA1LTEuNjkgMy40NiAwIDEuNTIuNzcgMi44NyAxLjk0IDMuNjctMS4yMi43OS0yIDIuMTUtMiAzLjcxIDAgLjI4LjAzLjU2LjA4LjgzLTEgLjgxLTEuNjggMi4wNC0xLjY4IDMuNDUgMCAxLjg0IDEuMTIgMy40MSAyLjcxIDQuMDlsMTMxLjctMTIxLjZjLjI2LS43NC40MS0xLjUzLjQxLTIuMzYgMC0zLjktMy4xNi03LTctNy0xLjIxIDAtMi4zNS4zMS0zLjM0Ljg0LTEuMjItNC4xOS01LjA5LTcuMjUtOS42Ny03LjI1LTEuOTggMC0zLjgxLjU4LTUuMzcgMS41Ni4wMi0uMjYuMDQtLjUxLjA0LS43NyAwLTYuODctNS41Ny0xMi40NC0xMi40NC0xMi40NC0xLjYxIDAtMy4xNC4zMi00LjU1Ljg4LS4xOC0zLjc0LTMuMjUtNi43Mi03LTYuNzItMy45IDAtNyAzLjE2LTcgNy4xIDAgLjMuMDIuNi4wNi44OS0xLjc3LTIuODgtNC45NS00LjgxLTguNTgtNC44MS0uNTggMC0xLjE0LjA2LTEuNjkuMTUtLjA4LTYuOC01LjYxLTEyLjI5LTEyLjQzLTEyLjI5LS43IDAtMS4zNy4wNy0yLjA0LjE4LS4zMy0zLjU4LTMuMzUtNi4zOC03LTYuMzgtMy4wNCAwLTUuNjIgMS45Mi02LjYyIDQuNjEtLjMxLS4wMi0uNjItLjA0LS45NC0uMDQtMS40MiAwLTIuNzkuMjEtNC4wOS41Ny0xLjIxLTMuMTktNC4yOS01LjQ3LTcuOTEtNS40N3ptLTI4LjIgMjcuNzNjLTIuODEgMC01LjA4IDIuMjgtNS4wOCA1LjA4IDAgMS41Mi42OCAyLjg2IDEuNzMgMy43OS0xLjM2IDEuMjgtMi4yMSAzLjEtMi4yMSA1LjEyIDAgMy44OSAzLjE2IDcgNy4xIDcgMy45IDAgNy4xLTMuMTYgNy4xLTcgMC0yLjg2LTEuNy01LjMxLTQuMTUtNi40Mi40Mi0uNzQuNjgtMS41OC42OC0yLjQ5IDAtMi44LTIuMjctNS4wOC01LjA3LTUuMDgiLz48L3N2Zz4=" },
      environmental: { text: "สิ่งแวดล้อม (Eco)", url: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBoZWlnaHQ9IjcyNCIgd2lkdGg9IjcyNCIgdmlld0JveD0iMCAwIDczNSA3MzUiPgo8cGF0aCBkPSJtMzY3LjUgNzI3LjRsMzYwLTM2MC0zNjAtMzYwLTM2MCAzNjB6IiBmaWxsPSIjZjAwIi8+CjxwYXRoIGQ9Im0zNjcuNSA2NzAuMy0zMDIuOC0zMDIuOGwzMDIuOC0zMDIuOCAzMDIuOCAzMDIuOHoiIGZpbGw9IiNmZmYiLz4KPGcgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjUiPgo8cGF0aCBkPSJtMjIzLjcgMzY3LjJoMjgxLjIiLz4KPHBhdGggc3Ryb2tlLXdpZHRoPSI0IiBkPSJtNDYyLjcgNDE4IDMyLjk4IDIzLjc5LTMxLjM2IDE1LjEgNDIuMiAzLjc5LTExLjM2IDE1LjFoMjMuM2wuNTQgMTYuNzYtMjk0LjItMS42MDVzNDkuMi0xNC41OCA1Ny4zLTguNjM1YzEwLjgyLTQuODcgODkuOC0zOC40IDg5LjgtMzYuMm0tNzUuNzItMjUuOTggMS42Mi04NS40LTQyLjcyLTIzLjJzLTYuNDktNC4zMy0xNS42OC0xLjYyYy0zLjI1IDEuMDgtNy41NyAyLjE2LTcuNTcgMi4xNnMyMy4zLTE5LjQ3IDI3LjU4LTE3Ljg0YzQuMzMgMS42MiAzNC42MSAxNi4yMiAzNC42MSAxNi4yMnMtMy4yNS0yMi43MS0xMS4zNi0yOS4yLTM5LjQ3LTMxLjM2LTM5LjQ3LTMxLjM2di01Ljk1bDQyLjcyIDI1Ljk2czEuNjItMjQuODctNy0zOS40N2MtOC42NS0xNC42LTE1LjEtMjcuNTgtMTUuMS0yNy41OGwyLjctMi4xNiAyMS4xIDMyLjQ0IDctMjIuMiA0LjMzLTEuMDhzLTUuNDEgMzEuMzYtMS42MiA0MS4xYzMuNzkgOS43MyAxNy44NCA2Mi43MyAxNy44NCA2Mi43M2wyMS4xLTMwLjNzLjU0LTEyLjQ0LS41NC0yMS4xYy0xLjA4LTguNjUtMi43LTQ4LjY3LTIuNy00OC42N2gzLjc5bDUuOTUgNDMuOCAzNC4xLTM5LjQ3djQuMzNzLTMzLjUxIDQyLjItMzEuODkgNTEuNGMxLjYyIDkuMTkgMy4yNCAxNC42LTIuNyAyNy41OHMtOS43MyAyMi4yLTkuNzMgMjIuMiAxNy44NC0yMS4xIDI1Ljk2LTIyLjcxYzguMTEtLjU0IDE4LjkxLjU0IDI2LjQ4LTUuOTVzMjUuOTYtMjcgMjUuOTYtMjdsLTI4LjY2IDQ0LjNzLTEzLjUxLjU0LTE4LjkxIDYuNDljLTUuNDEgNS45NS0yNy41OCAzMS4zNi0yNy41OCAzMS4zNnY1OC40bDM2Ljc2IDE4LjM4LTQ0Ljg3IDYuNDktMTAuODIgMTUuNjgtMTQuNi0xMi40NC00MC42MiAzLjczNXoiLz4KPHBhdGggZmlsbD0iI2ZmZiIgZD0ibTM1NS4yIDQ0NS4xYzEwLjI5LTQuMjkgMjctMTEuMzYgMzYuNzYtMjUuNDIgMTAuMS0xNC41NCA0NS45Ni03NS43IDk1LjItNzAuOC0yLjcgNi40OS0xMS4zNiAyMC41NS0xMS4zNiAyMC41NWwzNS4xLTEwLjgycy41NCA0Ni41LTY1Ljk3IDc2LjJjLTMwLjgyIDEwLjgyLTM3LjMgMTEuMzYtNDAgMTUuMS0yLjcgMy43OS0xNS4xIDIyLjcxLTE1LjEgMjIuNzFsLTU1LjE0LTI0LjNzMTQuMDYtLjUxNSAyMC41MS0zLjIxNXoiLz4KPC9nPgo8ZWxsaXBzZSBjeT0iMzg1LjgiIGN4PSI0ODQuMyIgcng9IjUuOTUiIHJ5PSI1LjEzIi8+Cjwvc3ZnPgo=" }
    };
    const ghsBadges = item.ghs && item.ghs.length > 0
      ? item.ghs.map(g => {
          const info = ghsInfo[g];
          if (info) {
            return `
              <span class="badge badge-red" style="font-size: 11px; padding: 4px 8px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); color: var(--accent-red); font-weight: 500;">
                <img src="${info.url}" alt="${info.text}" style="width: 18px; height: 18px; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.08));">
                <span>${info.text}</span>
              </span>
            `;
          }
          return `<span class="badge badge-red" style="font-size: 11px; padding: 4px 8px; border-radius: 6px;">${g}</span>`;
        }).join(" ")
      : "<span style='color: var(--text-muted); font-style: italic;'>ไม่มีสัญลักษณ์อันตรายเฉพาะ</span>";
    
    ghsSection = `
      <div style="background-color: rgba(239, 68, 68, 0.02); border: 1px solid rgba(239, 68, 68, 0.1); border-radius: var(--border-radius-md); padding: 12px; display: flex; flex-direction: column; gap: 8px;">
        <span style="font-weight: 600; color: var(--accent-red); display: flex; align-items: center; gap: 6px; font-size: 13px;">
          <i data-lucide="shield-alert" style="width: 14px; height: 14px;"></i> สัญลักษณ์ความปลอดภัย (GHS)
        </span>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px;">
          ${ghsBadges}
        </div>
        ${item.sdsUrl ? `
          <a href="${item.sdsUrl}" target="_blank" class="btn btn-secondary" style="margin-top: 8px; padding: 6px 12px; font-size: 12px; border-color: rgba(239, 68, 68, 0.2); color: var(--accent-red); display: inline-flex; align-items: center; justify-content: center; gap: 6px; text-decoration: none; width: fit-content; background: rgba(239, 68, 68, 0.04);">
            📄 SDS Safety Sheet
          </a>
        ` : `
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">ไม่มีข้อมูล SDS (ลิงก์ความปลอดภัย)</div>
        `}
      </div>
    `;
  }

  // QR Code URL
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(item.code)}`;

  // Dilutions Section (only for Chemicals)
  let dilutionsSection = "";
  if (item.category === "สารเคมี") {
    let dilutionsListHtml = "";
    if (item.dilutions && item.dilutions.length > 0) {
      dilutionsListHtml = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-color); text-align: left; color: var(--text-muted);">
              <th style="padding: 4px;">ความเข้มข้น</th>
              <th style="padding: 4px;">ปริมาตร</th>
              <th style="padding: 4px;">จำนวน</th>
              <th style="padding: 4px;">ที่จัดเก็บ</th>
              ${isAdminLoggedIn ? '<th style="padding: 4px; text-align: center;">ลบ</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${item.dilutions.map((d, dIdx) => `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 6px 4px; font-weight: 600; color: #1e293b;">${d.concentration}</td>
                <td style="padding: 6px 4px; color: #334155;">${d.volume}</td>
                <td style="padding: 6px 4px; color: #334155;">${d.qty} ขวด</td>
                <td style="padding: 6px 4px; color: var(--text-muted);">${d.location || "-"}</td>
                ${isAdminLoggedIn ? `
                  <td style="padding: 6px 4px; text-align: center;">
                    <button type="button" style="background: none; border: none; color: var(--accent-red); cursor: pointer; padding: 2px;" onclick="deleteDilution('${item.code}', ${dIdx})">
                      <i data-lucide="trash-2" style="width: 12px; height: 12px;"></i>
                    </button>
                  </td>
                ` : ''}
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    } else {
      dilutionsListHtml = `<div style="font-size: 12px; color: var(--text-muted); font-style: italic; padding: 8px 0;">ไม่มีรายการสารละลายเจือจาง</div>`;
    }

    dilutionsSection = `
      <div style="border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding: 12px; display: flex; flex-direction: column; gap: 6px; background-color: #fafafa;">
        <span style="font-weight: 600; color: var(--primary-purple); display: flex; align-items: center; gap: 6px; font-size: 13px;">
          <i data-lucide="flask-conical" style="width: 14px; height: 14px;"></i> รายการสารละลายเจือจาง (Dilutions)
        </span>
        ${dilutionsListHtml}
        
        ${isAdminLoggedIn ? `
          <button type="button" class="btn btn-secondary" style="padding: 4px 8px; font-size: 11px; margin-top: 8px; width: fit-content;" onclick="toggleAddDilutionForm()">
            + เพิ่มสารละลายเจือจาง
          </button>
          
          <div id="addDilutionForm" style="display: none; border-top: 1px solid var(--border-color); padding-top: 10px; margin-top: 10px; flex-direction: column; gap: 8px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <label style="font-size: 11px; font-weight: 600; margin-bottom: 4px; display: block;">ความเข้มข้น *</label>
                <input type="text" id="dilutionConcentration" placeholder="เช่น 0.1M HCl" style="width: 100%; padding: 6px; font-size: 12px; border: 1px solid var(--border-color); border-radius: 4px;">
              </div>
              <div>
                <label style="font-size: 11px; font-weight: 600; margin-bottom: 4px; display: block;">ปริมาตร *</label>
                <input type="text" id="dilutionVolume" placeholder="เช่น 250ml" style="width: 100%; padding: 6px; font-size: 12px; border: 1px solid var(--border-color); border-radius: 4px;">
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <label style="font-size: 11px; font-weight: 600; margin-bottom: 4px; display: block;">จำนวน (ขวด) *</label>
                <input type="number" id="dilutionQty" value="1" min="1" style="width: 100%; padding: 6px; font-size: 12px; border: 1px solid var(--border-color); border-radius: 4px;">
              </div>
              <div>
                <label style="font-size: 11px; font-weight: 600; margin-bottom: 4px; display: block;">สถานที่จัดเก็บ</label>
                <input type="text" id="dilutionLocation" placeholder="เช่น ตู้ A ชั้น 2" style="width: 100%; padding: 6px; font-size: 12px; border: 1px solid var(--border-color); border-radius: 4px;">
              </div>
            </div>
            <button type="button" class="btn btn-primary" style="padding: 6px 12px; font-size: 12px; background-color: var(--primary-purple); width: fit-content; margin-top: 4px;" onclick="submitAddDilution('${item.code}')">บันทึกสารเจือจาง</button>
          </div>
        ` : ""}
      </div>
    `;
  }

  // Damaged Stats Section
  const damagedQty = item.damagedQty || 0;
  const repairQty = item.repairQty || 0;
  const damagedSection = `
    <div style="display: flex; gap: 12px; border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding: 12px; background: rgba(0,0,0,0.01);">
      <div style="flex: 1;">
        <span style="font-size: 11px; color: var(--text-muted); font-weight: 500;">ชำรุด</span>
        <div style="font-size: 16px; font-weight: 700; color: var(--accent-red); margin-top: 2px;">${damagedQty} ${item.unit}</div>
      </div>
      <div style="flex: 1; border-left: 1px solid var(--border-color); padding-left: 12px;">
        <span style="font-size: 11px; color: var(--text-muted); font-weight: 500;">อยู่ระหว่างส่งซ่อม</span>
        <div style="font-size: 16px; font-weight: 700; color: var(--accent-orange); margin-top: 2px;">${repairQty} ${item.unit}</div>
      </div>
    </div>
  `;

  // General details view layout
  body.innerHTML = `
    <div style="display: flex; gap: 16px; align-items: flex-start; border-bottom: 1px solid var(--border-color); padding-bottom: 16px;">
      <div style="border: 1px solid var(--border-color); border-radius: 8px; padding: 8px; background: #fff; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; align-items: center; gap: 6px;">
        <img src="${qrUrl}" alt="QR Code" style="width: 100px; height: 100px;">
        <span style="font-family: monospace; font-size: 11px; font-weight: bold; color: var(--text-muted);">${item.code}</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px; flex: 1;">
        <h4 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0;">${getItemDisplayName(item)}</h4>
        <div style="font-size: 12px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${item.category}</div>
        <div style="display: grid; grid-template-columns: 80px 1fr; font-size: 13px; margin-top: 8px; gap: 4px;">
          <span style="color: var(--text-muted); font-weight: 500;">จำนวนคงเหลือ:</span>
          <span style="font-weight: 700; color: var(--primary-purple);">${item.qty} ${item.unit}</span>
          
          <span style="color: var(--text-muted); font-weight: 500;">สถานที่เก็บ:</span>
          <span style="font-weight: 600;">${item.room || "-"} > ${item.cabinet || "-"} > ${item.shelf || "-"}</span>
          
          <span style="color: var(--text-muted); font-weight: 500;">วันหมดอายุ:</span>
          <span style="font-weight: 600;">${item.expiry ? formatThaiDate(item.expiry) : "-"}</span>
        </div>
      </div>
    </div>

    ${ghsSection}

    ${damagedSection}

    ${dilutionsSection}
  `;

  // Build Footer Actions
  footer.innerHTML = `
    <button type="button" class="btn btn-secondary" onclick="closeDetailModal()">ปิด</button>
    <button type="button" class="btn btn-primary" style="background-color: var(--primary-purple); border-color: var(--primary-purple); display: inline-flex; align-items: center; gap: 6px;" onclick="printItemLabel('${item.code}')">
      <i data-lucide="printer" style="width: 16px; height: 16px;"></i>
      <span>พิมพ์บาร์โค้ด / สติกเกอร์</span>
    </button>
  `;

  // Open the modal
  modal.classList.add("active");
  lucide.createIcons();
};

window.toggleAddDilutionForm = function() {
  const form = document.getElementById("addDilutionForm");
  if (!form) return;
  if (form.style.display === "none" || form.style.display === "") {
    form.style.display = "flex";
  } else {
    form.style.display = "none";
  }
};

window.submitAddDilution = async function(itemCode) {
  const itemIndex = items.findIndex(i => i.code === itemCode);
  if (itemIndex === -1) return;
  const item = items[itemIndex];

  const conc = document.getElementById("dilutionConcentration").value.trim();
  const vol = document.getElementById("dilutionVolume").value.trim();
  const qty = Number(document.getElementById("dilutionQty").value || 1);
  const loc = document.getElementById("dilutionLocation").value.trim();

  if (!conc || !vol || isNaN(qty) || qty <= 0) {
    showToast("กรุณากรอกข้อมูลความเข้มข้น ปริมาตร และจำนวนให้ครบถ้วน", "error");
    return;
  }

  const newDilution = {
    id: "dil-" + Date.now(),
    concentration: conc,
    volume: vol,
    qty: qty,
    location: loc
  };

  const updatedDilutions = [...(item.dilutions || []), newDilution];
  const updatedItem = { ...item, dilutions: updatedDilutions };

  const success = await updateItemBackend(item.code, updatedItem, itemIndex);
  if (success) {
    showToast("เพิ่มสารละลายเจือจางสำเร็จ!", "success");
    showItemDetail(null, itemCode);
    updateUI();
  }
};

window.deleteDilution = async function(itemCode, dIdx) {
  const itemIndex = items.findIndex(i => i.code === itemCode);
  if (itemIndex === -1) return;
  const item = items[itemIndex];

  if (confirm("คุณต้องการลบสารละลายเจือจางนี้ใช่หรือไม่?")) {
    const updatedDilutions = [...(item.dilutions || [])];
    updatedDilutions.splice(dIdx, 1);
    const updatedItem = { ...item, dilutions: updatedDilutions };

    const success = await updateItemBackend(item.code, updatedItem, itemIndex);
    if (success) {
      showToast("ลบรายการเจือจางสำเร็จ", "info");
      showItemDetail(null, itemCode);
      updateUI();
    }
  }
};

window.printItemLabel = function(itemCode) {
  const item = items.find(i => i.code === itemCode);
  if (!item) return;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(item.code)}`;

  const printWindow = window.open("", "_blank", "width=600,height=400");
  if (!printWindow) {
    showToast("ไม่สามารถเปิดหน้าต่างพิมพ์ได้ กรุณาเปิดสิทธิ์การใช้งาน Pop-up บนบราวเซอร์", "error");
    return;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>พิมพ์สติกเกอร์บาร์โค้ด - ${item.code}</title>
        <style>
          body {
            font-family: 'Inter', 'Sarabun', sans-serif;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #fff;
          }
          .label-card {
            border: 2px dashed #000;
            padding: 20px;
            width: 380px;
            display: flex;
            gap: 16px;
            align-items: center;
            box-sizing: border-box;
          }
          .qr-img {
            width: 120px;
            height: 120px;
          }
          .info {
            display: flex;
            flex-direction: column;
            gap: 4px;
            flex: 1;
          }
          .title {
            font-size: 16px;
            font-weight: bold;
            margin: 0 0 6px 0;
            line-height: 1.3;
          }
          .code {
            font-family: monospace;
            font-size: 14px;
            font-weight: bold;
            color: #333;
          }
          .loc {
            font-size: 12px;
            color: #555;
            margin-top: 4px;
          }
          @media print {
            body { padding: 0; }
            .label-card { border-style: solid; }
          }
        </style>
      </head>
      <body>
        <div class="label-card">
          <img class="qr-img" src="${qrUrl}" alt="QR Code">
          <div class="info">
            <h3 class="title">${getItemDisplayName(item)}</h3>
            <span class="code">CODE: ${item.code}</span>
            <div class="loc">จัดเก็บ: ${item.room || "-"} > ${item.cabinet || "-"} > ${item.shelf || "-"}</div>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

function setupCsvExport() {
  const btn = document.getElementById("btnExportCSV");
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (items.length === 0) {
      showToast("ไม่มีข้อมูลในระบบที่สามารถส่งออกได้", "error");
      return;
    }

    const headers = [
      "รหัส",
      "ชื่อ",
      "หมวดหมู่",
      "จำนวนคงเหลือ",
      "หน่วย",
      "จุดสั่งซื้อต่ำสุด",
      "วันหมดอายุ",
      "ห้อง/Lab",
      "ตู้เก็บของ",
      "ชั้นวาง",
      "ประเภทอันตรายเคมี",
      "ลิงก์ SDS",
      "ชำรุด",
      "ส่งซ่อม"
    ];

    let csvContent = "\ufeff"; // UTF-8 BOM to display Thai characters correctly in Excel
    csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",") + "\n";

    items.forEach(item => {
      const row = [
        item.code || "",
        item.name || "",
        item.category || "",
        item.qty || 0,
        item.unit || "",
        item.minAlert || "",
        item.expiry || "",
        item.room || "",
        item.cabinet || "",
        item.shelf || "",
        item.chemicalType || "",
        item.sdsUrl || "",
        item.damagedQty || 0,
        item.repairQty || 0
      ];
      csvContent += row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `chemical_lab_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("ส่งออกไฟล์ CSV สำเร็จ!", "success");
  });
}

function setupPrintReport() {
  const btn = document.getElementById("btnPrintReport");
  if (!btn) return;

  btn.addEventListener("click", () => {
    window.print();
  });
}

function setupBarcodeScanner() {
  const input = document.getElementById("scanInput");
  if (!input) return;

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const code = input.value.trim();
      if (!code) return;

      const item = items.find(i => i.code.toLowerCase() === code.toLowerCase());
      if (item) {
        showItemDetail(null, item.code);
        showToast(`สแกนพบพัสดุ: ${getItemDisplayName(item)}`, "success");
      } else {
        showToast(`ไม่พบรหัสพัสดุ: ${code}`, "warning");
      }
      input.value = "";
    }
  });
}

function populateBookingPrepList() {
  const container = document.getElementById("bookingPrepContainer");
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `<span style="font-size: 12px; color: var(--text-muted); font-style: italic;">ไม่มีพัสดุในคลัง</span>`;
    return;
  }

  let html = "";
  items.forEach(item => {
    html += `
      <label style="display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13px; font-weight: 500; cursor: pointer; padding: 4px 0; border-bottom: 1px solid #f8fafc;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" name="bookingPrepItem" value="${item.code}" style="accent-color: #8b5cf6; width: 15px; height: 15px;">
          <span>${getItemDisplayName(item)} (${item.code})</span>
        </div>
        <div style="display: flex; align-items: center; gap: 4px;">
          <span style="font-size: 11px; color: var(--text-muted);">จำนวน:</span>
          <input type="number" class="prep-qty-input" data-code="${item.code}" value="1" min="1" max="${item.qty}" style="width: 50px; padding: 2px 4px; font-size: 12px; border: 1px solid var(--border-color); border-radius: 4px; text-align: center;">
        </div>
      </label>
    `;
  });
  container.innerHTML = html;
}

// ==========================================================================
// CAMERA QR & BARCODE SCANNER SYSTEM (html5-qrcode)
// ==========================================================================
let html5QrcodeScanner = null;

function setupCameraScanner() {
  const btnTrigger = document.getElementById("btnTriggerCameraScan");
  const modalClose = document.getElementById("cameraScanModalClose");
  const btnCancel = document.getElementById("btnCancelCameraScan");
  const modal = document.getElementById("cameraScanModal");

  if (!btnTrigger || !modal) return;

  // Trigger Open Scanner
  btnTrigger.addEventListener("click", () => {
    startCameraScan();
  });

  // Close Scanner Events
  const closeScanner = () => {
    stopCameraScan();
  };

  modalClose.addEventListener("click", closeScanner);
  btnCancel.addEventListener("click", closeScanner);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeScanner();
  });
}

function startCameraScan() {
  const modal = document.getElementById("cameraScanModal");
  if (!modal) return;
  
  modal.classList.add("active");
  const resultsDiv = document.getElementById("qr-reader-results");
  if (resultsDiv) {
    resultsDiv.innerText = "วางคิวอาร์โค้ดหรือบาร์โค้ดให้อยู่ในกรอบของกล้องเพื่อทำการสแกน";
    resultsDiv.style.color = "var(--text-muted)";
  }

  // Clear previous scanner instances if any
  if (html5QrcodeScanner) {
    try {
      html5QrcodeScanner.clear();
    } catch (e) {
      console.error("Error clearing scanner: ", e);
    }
  }

  // Initialize new Html5Qrcode instance
  html5QrcodeScanner = new Html5Qrcode("qr-reader");

  const qrCodeSuccessCallback = (decodedText, decodedResult) => {
    console.log(`Scan successful. Decoded text: ${decodedText}`, decodedResult);
    
    // Stop scanning and close modal
    stopCameraScan();

    const code = decodedText.trim();
    if (!code) return;

    // Search items list for a matching code
    const item = items.find(i => i.code.toLowerCase() === code.toLowerCase());
    if (item) {
      showItemDetail(null, item.code);
      showToast(`สแกนพบพัสดุ: ${getItemDisplayName(item)}`, "success");
    } else {
      showToast(`ไม่พบรหัสพัสดุ: ${code}`, "warning");
    }
  };

  const config = { fps: 15, qrbox: { width: 250, height: 250 } };

  // Request camera access and start
  html5QrcodeScanner.start(
    { facingMode: "environment" }, // Rear camera
    config,
    qrCodeSuccessCallback
  ).catch(err => {
    console.error("Error starting html5-qrcode: ", err);
    if (resultsDiv) {
      resultsDiv.innerText = "ไม่สามารถเปิดกล้องได้ กรุณาตรวจสอบสิทธิ์การเข้าถึงกล้องถ่ายภาพ";
      resultsDiv.style.color = "var(--accent-red)";
    }
    showToast("เกิดข้อผิดพลาดในการเปิดกล้อง!", "error");
  });
}

function stopCameraScan() {
  const modal = document.getElementById("cameraScanModal");
  if (modal) {
    modal.classList.remove("active");
  }

  if (html5QrcodeScanner) {
    try {
      if (html5QrcodeScanner.isScanning) {
        html5QrcodeScanner.stop().then(() => {
          html5QrcodeScanner.clear();
          html5QrcodeScanner = null;
        }).catch(err => {
          console.error("Failed to stop scanner cleanly: ", err);
          html5QrcodeScanner = null;
        });
      } else {
        html5QrcodeScanner.clear();
        html5QrcodeScanner = null;
      }
    } catch (e) {
      console.error("Error stopping scanner: ", e);
      html5QrcodeScanner = null;
    }
  }
}

// ==========================================
// REPAIR / DAMAGED ITEMS MODAL CONTROLLERS
// ==========================================
let currentRepairItemCode = null;

function openRepairModal(code) {
  const item = items.find(i => i.code === code);
  if (!item) {
    showToast("ไม่พบข้อมูลพัสดุ", "error");
    return;
  }

  currentRepairItemCode = code;
  
  // Set item metadata in UI
  document.getElementById("repairItemName").innerText = item.name;
  document.getElementById("repairItemCode").innerText = `รหัส: ${item.code}`;
  
  const dQty = item.damagedQty || 0;
  const rQty = item.repairQty || 0;
  
  document.getElementById("repairDamagedQtyText").innerText = dQty;
  document.getElementById("repairUnderRepairQtyText").innerText = rQty;
  
  // Default values
  const actionTypeSelect = document.getElementById("repairActionType");
  actionTypeSelect.value = "send_to_repair";
  
  const sourceTypeSelect = document.getElementById("repairSourceType");
  sourceTypeSelect.value = "damaged";

  const actionQtyInput = document.getElementById("repairActionQty");
  actionQtyInput.value = 1;
  actionQtyInput.min = 1;

  // Update dynamic fields
  updateRepairModalFields(item);

  // Show modal
  const modal = document.getElementById("repairModal");
  if (modal) {
    modal.classList.add("active");
  }
}

function updateRepairModalFields(item) {
  const actionType = document.getElementById("repairActionType").value;
  const sourceGroup = document.getElementById("repairSourceGroup");
  const sourceTypeSelect = document.getElementById("repairSourceType");
  const actionQtyInput = document.getElementById("repairActionQty");
  const maxQtyHint = document.getElementById("repairMaxQtyHint");
  
  const dQty = item.damagedQty || 0;
  const rQty = item.repairQty || 0;
  
  let maxQty = 0;
  
  if (actionType === "send_to_repair") {
    // Can only send to repair from damagedQty
    sourceGroup.style.display = "none";
    maxQty = dQty;
  } else {
    // For repair_success or repair_fail_discard:
    // We can deduct from damagedQty or repairQty
    if (dQty > 0 && rQty > 0) {
      sourceGroup.style.display = "block";
      // Determine max based on selected source type
      const source = sourceTypeSelect.value;
      if (source === "damaged") {
        maxQty = dQty;
      } else {
        maxQty = rQty;
      }
    } else {
      sourceGroup.style.display = "none";
      if (dQty > 0) {
        maxQty = dQty;
      } else if (rQty > 0) {
        maxQty = rQty;
      } else {
        maxQty = 0;
      }
    }
  }
  
  actionQtyInput.max = maxQty;
  maxQtyHint.innerText = `จำนวนสูงสุดที่ทำรายการได้: ${maxQty} ${item.unit}`;
  
  // Cap current value if it exceeds max
  if (parseInt(actionQtyInput.value) > maxQty) {
    actionQtyInput.value = maxQty;
  }
  if (maxQty === 0) {
    actionQtyInput.value = 0;
  }
}

function setupRepairModalHandlers() {
  const modal = document.getElementById("repairModal");
  const closeBtn = document.getElementById("repairModalClose");
  const actionTypeSelect = document.getElementById("repairActionType");
  const sourceTypeSelect = document.getElementById("repairSourceType");
  const confirmBtn = document.getElementById("btnConfirmRepairAction");
  const actionQtyInput = document.getElementById("repairActionQty");

  if (!modal || !closeBtn || !actionTypeSelect || !sourceTypeSelect || !confirmBtn || !actionQtyInput) return;

  const closeModal = () => {
    modal.classList.remove("active");
    currentRepairItemCode = null;
  };

  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Handle action type changes
  actionTypeSelect.addEventListener("change", () => {
    if (!currentRepairItemCode) return;
    const item = items.find(i => i.code === currentRepairItemCode);
    if (item) {
      updateRepairModalFields(item);
    }
  });

  // Handle source type changes
  sourceTypeSelect.addEventListener("change", () => {
    if (!currentRepairItemCode) return;
    const item = items.find(i => i.code === currentRepairItemCode);
    if (item) {
      updateRepairModalFields(item);
    }
  });

  // Handle confirmation
  confirmBtn.addEventListener("click", async () => {
    if (!currentRepairItemCode) return;
    
    const itemIndex = items.findIndex(i => i.code === currentRepairItemCode);
    if (itemIndex === -1) {
      showToast("ไม่พบพัสดุนี้ในระบบ", "error");
      return;
    }
    
    const item = items[itemIndex];
    const actionType = actionTypeSelect.value;
    const actionQty = parseInt(actionQtyInput.value);
    
    if (isNaN(actionQty) || actionQty <= 0) {
      showToast("กรุณาระบุจำนวนที่ต้องการจัดการให้ถูกต้อง", "warning");
      return;
    }
    
    const dQty = item.damagedQty || 0;
    const rQty = item.repairQty || 0;
    
    // Determine the source to deduct from
    let source = "damaged";
    if (actionType === "send_to_repair") {
      source = "damaged";
    } else {
      if (dQty > 0 && rQty > 0) {
        source = sourceTypeSelect.value;
      } else if (dQty > 0) {
        source = "damaged";
      } else if (rQty > 0) {
        source = "repair";
      } else {
        showToast("ไม่มีพัสดุชำรุดหรือส่งซ่อมให้จัดการ", "warning");
        return;
      }
    }
    
    // Validate quantities
    if (source === "damaged" && actionQty > dQty) {
      showToast(`จำนวนชำรุดมีไม่เพียงพอ (มีเพียง ${dQty} ${item.unit})`, "warning");
      return;
    }
    if (source === "repair" && actionQty > rQty) {
      showToast(`จำนวนส่งซ่อมมีไม่เพียงพอ (มีเพียง ${rQty} ${item.unit})`, "warning");
      return;
    }
    
    // Prepare updated item object
    const updatedItem = { ...item };
    
    if (actionType === "send_to_repair") {
      updatedItem.damagedQty = dQty - actionQty;
      updatedItem.repairQty = rQty + actionQty;
      
      showToast(`ส่งซ่อมพัสดุจำนวน ${actionQty} ${item.unit} เรียบร้อยแล้ว`, "success");
    } 
    else if (actionType === "repair_success") {
      if (source === "damaged") {
        updatedItem.damagedQty = dQty - actionQty;
      } else {
        updatedItem.repairQty = rQty - actionQty;
      }
      // Add back to active qty
      updatedItem.qty = (item.qty || 0) + actionQty;
      
      showToast(`ซ่อมเสร็จสิ้นและคืนพัสดุ ${actionQty} ${item.unit} เข้าคลังสินค้าเรียบร้อยแล้ว`, "success");
    } 
    else if (actionType === "repair_fail_discard") {
      if (source === "damaged") {
        updatedItem.damagedQty = dQty - actionQty;
      } else {
        updatedItem.repairQty = rQty - actionQty;
      }
      // Simply subtract without increasing active qty (discarded/thrown away)
      
      showToast(`ทำการจำหน่ายออก (ทิ้ง) พัสดุจำนวน ${actionQty} ${item.unit} เรียบร้อยแล้ว`, "success");
    }
    
    // Clean up properties if 0
    if (updatedItem.damagedQty === 0) updatedItem.damagedQty = 0;
    if (updatedItem.repairQty === 0) updatedItem.repairQty = 0;
    
    // Save to database/backend
    const success = await updateItemBackend(updatedItem.code, updatedItem, itemIndex);
    if (success) {
      closeModal();
      updateUI();
    } else {
      showToast("เกิดข้อผิดพลาดในการอัปเดตข้อมูลพัสดุ", "error");
    }
  });
}

