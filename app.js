// ==========================================================================
// STATE MANAGEMENT & INITIALIZATION
// ==========================================================================

// Global state variable
let items = [];
let currentPage = 1;
const itemsPerPage = 10;
let fileToImport = null;
let userRole = "student"; // Default role

// default science lab kits
const LAB_KITS = {
  titration: {
    name: "ชุดไทเทรต (Titration Kit)",
    items: [
      { code: "GW-001", qty: 2 }, // บีกเกอร์ขนาด 250 มล.
      { code: "GW-002", qty: 2 }, // ปิเปตขนาด 10 มล.
      { code: "CHEM-001", qty: 1 } // กรดไฮโดรคลอริก 37%
    ]
  },
  distillation: {
    name: "ชุดทดลองกลั่น (Distillation Kit)",
    items: [
      { code: "GW-001", qty: 1 }, // บีกเกอร์ขนาด 250 มล.
      { code: "CHEM-002", qty: 1 } // เอทานอล 95%
    ]
  },
  extraction: {
    name: "ชุดสกัดสาร (Extraction Kit)",
    items: [
      { code: "GW-002", qty: 1 }, // ปิเปตขนาด 10 มล.
      { code: "CHEM-002", qty: 1 }, // เอทานอล 95%
      { code: "CHEM-004", qty: 1 } // โพแทสเซียมเปอร์แมงกาเนต
    ]
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
    qty: 5,
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
    qty: 3,
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
    qty: 12,
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
let isAdminLoggedIn = sessionStorage.getItem("admin_logged_in") === "true";
const BOOKING_SLOTS = [
  "คาบ 1: 08:10 - 09:00",
  "คาบ 2: 09:00 - 09:50",
  "คาบ 3: 09:50 - 10:40",
  "คาบ 4: 10:50 - 11:40",
  "คาบ 5: 11:40 - 12:30",
  "คาบ 6: 12:30 - 13:20",
  "คาบ 7: 13:20 - 14:10",
  "คาบ 8: 14:10 - 15:00",
  "คาบ 9: 15:10 - 16:00"
];

// Initialize application on DOM ready
document.addEventListener("DOMContentLoaded", async () => {
  // First, check backend online status
  await checkBackendStatus();
  
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
  
  // Set up login system
  setupLoginHandlers();
  setupRoleSwitcher();
  setupCsvExport();
  setupPrintReport();
  setupBarcodeScanner();
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
  document.getElementById("quickBtnSearch").addEventListener("click", () => {
    navigateToPanel("all-items");
    document.getElementById("filterSearch").focus();
  });
  
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
      showToast("กรุณาเข้าสู่ระบบหลังบ้านเพื่อนำเข้าไฟล์ข้อมูล", "error");
      document.getElementById("loginModal").classList.add("active");
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
    showToast("กรุณาเข้าสู่ระบบหลังบ้านเพื่อเพิ่มหรือแก้ไขข้อมูลสารเคมี/อุปกรณ์", "error");
    document.getElementById("loginModal").classList.add("active");
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
          <span class="recent-item-name">${item.name}</span>
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
            <span style="font-size: 13px; font-weight: 600; color: #0f172a;">${item.name}</span>
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
        explosive: "./images/GHS-explosive.svg",
        flammable: "./images/GHS-flammable.svg",
        oxidizing: "./images/GHS-oxidizing.svg",
        compressed_gas: "./images/GHS-compressed-gas.svg",
        corrosive: "./images/GHS-corrosive.svg",
        toxic: "./images/GHS-toxic.svg",
        irritant: "./images/GHS-irritant.svg",
        health_hazard: "./images/GHS-health-hazard.svg",
        environmental: "./images/GHS-environmental.svg"
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
            <span class="product-name">${item.name}</span>
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
            <span class="notification-title">${item.name}</span>
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
            <span class="notification-title">${item.name}</span>
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
            <span class="notification-title">${item.name}</span>
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
            conflictName = item.name;
            return true;
          }
          if (chemicalType === "base" && item.chemicalType === "acid") {
            conflictType = "acid";
            conflictName = item.name;
            return true;
          }
          if (chemicalType === "oxidizer" && item.chemicalType === "organic") {
            conflictType = "organic";
            conflictName = item.name;
            return true;
          }
          if (chemicalType === "organic" && item.chemicalType === "oxidizer") {
            conflictType = "oxidizer";
            conflictName = item.name;
            return true;
          }
        }
        return false;
      });

      if (potentialConflict) {
        const typeLabels = {
          acid: "กรด (Acid)",
          base: "เบส/ด่าง (Base)",
          oxidizer: "สารออกซิไดซ์ (Oxidizer)",
          organic: "ตัวทำละลายอินทรีย์/สารไวไฟ (Organic/Flammable)"
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
  document.getElementById("formPanelSubtitle").innerText = `กำลังดำเนินการแก้ไขรายการ: [${item.code}] ${item.name}`;
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

  if (confirm(`คุณต้องการลบรายการ "${item.name}" (${item.code}) ออกจากระบบใช่หรือไม่?`)) {
    if (isFirebaseOnline) {
      try {
        await db.collection("items").doc(item.code).delete();
        items.splice(index, 1);
        showToast(`ลบรายการ "${item.name}" สำเร็จ!`, "warning");
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
          showToast(`ลบรายการ "${item.name}" สำเร็จ!`, "warning");
        } else {
          const errData = await response.json();
          showToast(errData.error || "เกิดข้อผิดพลาดในการลบข้อมูลหลังบ้าน", "error");
          return;
        }
      } catch (err) {
        console.error("Backend delete failed, falling back:", err);
        items.splice(index, 1);
        saveItemsToLocal();
        showToast(`ลบรายการ "${item.name}" สำเร็จ! (Offline)`, "warning");
      }
    } else {
      items.splice(index, 1);
      saveItemsToLocal();
      showToast(`ลบรายการ "${item.name}" สำเร็จ!`, "warning");
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
  const headers = ["รหัส*", "ชื่อ*", "หมวดหมู่*", "จำนวน*", "หน่วย*", "จุดสั่งซื้อขั้นต่ำ", "วันหมดอายุ(YYYY-MM-DD)", "ห้อง", "ตู้", "ชั้น"];
  const sampleRow1 = ["CHEM-005", "กรดอะซิติก (Acetic Acid)", "สารเคมี", "3", "ขวด", "1", "2027-08-20", "Lab 1", "ตู้ B", "ชั้น 1"];
  const sampleRow2 = ["EQ-002", "กล้องจุลทรรศน์แบบใช้แสง (Microscope)", "อุปกรณ์วิทยาศาสตร์", "4", "เครื่อง", "2", "", "Lab 2", "ตู้เก็บอุปกรณ์", "ตู้ด้านซ้าย"];
  
  const csvContent = [
    headers.join(","),
    sampleRow1.join(","),
    sampleRow2.join(",")
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

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty rows

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
    const minAlert = cols[5] ? Number(cols[5]) : null;
    const expiry = cols[6] || "";
    const room = cols[7] || "";
    const cabinet = cols[8] || "";
    const shelf = cols[9] || "";

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
      minAlert,
      expiry,
      room,
      cabinet,
      shelf,
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
      id: "tx-1",
      itemCode: "GW-001",
      itemName: "บีกเกอร์ขนาด 250 มล. (Beaker 250ml)",
      qty: 2,
      borrower: "สมชาย มีดี",
      date: "2026-06-03",
      type: "borrow",
      status: "borrowed",
      notes: "ทำการทดลองวิเคราะห์หาค่าความเป็นกรด-ด่าง",
      expectedReturnDate: "2026-06-10",
      createdAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: "tx-2",
      itemCode: "CHEM-001",
      itemName: "กรดไฮโดรคลอริก 37% (Hydrochloric Acid)",
      qty: 1,
      borrower: "ใจดี เรียนดี",
      date: "2026-06-02",
      type: "return",
      status: "returned",
      notes: "ใช้เตรียมสารละลาย และส่งคืนขวดสารที่เหลือเข้าชั้น",
      expectedReturnDate: "2026-06-09",
      createdAt: new Date(Date.now() - 259200000).toISOString()
    },
    {
      id: "tx-3",
      itemCode: "CHEM-004",
      itemName: "โพแทสเซียมเปอร์แมงกาเนต (Potassium Permanganate)",
      qty: 1,
      borrower: "ดร. วีระศักดิ์",
      date: "2026-06-04",
      type: "borrow",
      status: "borrowed",
      notes: "เตรียมใช้ทดลองหาปริมาณสารอินทรีย์ในน้ำ",
      expectedReturnDate: "2026-06-11",
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: "tx-4",
      itemCode: "GW-002",
      itemName: "ปิเปตขนาด 10 มล. (Pipette 10ml)",
      qty: 3,
      borrower: "ใจดี เรียนดี",
      date: "2026-06-04",
      type: "borrow",
      status: "borrowed",
      notes: "ใช้สำหรับย้ายของเหลวการทดลองเคมีวิเคราะห์",
      expectedReturnDate: "2026-06-11",
      createdAt: new Date().toISOString()
    },
    {
      id: "tx-5",
      itemCode: "CHEM-002",
      itemName: "เอทานอล 95% (Ethanol)",
      qty: 1,
      borrower: "นายสมชาย เรียนดี",
      date: "2026-05-15",
      type: "borrow",
      status: "borrowed",
      notes: "การทดลองเรื่องสารประกอบอินทรีย์",
      expectedReturnDate: "2026-05-22",
      createdAt: "2026-05-15T09:00:00.000Z"
    },
    {
      id: "tx-6",
      itemCode: "GW-002",
      itemName: "ปิเปตขนาด 10 มล. (Pipette 10ml)",
      qty: 2,
      borrower: "นางสาวสมหญิง ใจดี",
      date: "2026-05-10",
      type: "borrow",
      status: "borrowed",
      notes: "วิชาเคมี ชั้น ม.5",
      expectedReturnDate: "2026-05-17",
      createdAt: "2026-05-10T10:00:00.000Z"
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

// Populate Dropdown List of Items for Borrow Form
function populateBorrowItemDropdown() {
  const dropdown = document.getElementById("borrowItemCode");
  const optionsList = document.getElementById("borrowItemOptionsList");
  const triggerText = document.querySelector("#borrowItemSelectTrigger .custom-select-trigger-text");
  
  if (!dropdown || !optionsList) return;

  // Preserve selected value if any
  const selectedVal = dropdown.value;

  // Clear hidden select except first default option
  dropdown.innerHTML = '<option value="" disabled selected>-- กรุณาเลือกรายการ --</option>';
  // Clear custom options list
  optionsList.innerHTML = '';

  // Sort items alphabetically by name safely
  const sortedItems = [...items].sort((a, b) => (a.name || "").localeCompare(b.name || "", 'th'));

  sortedItems.forEach(item => {
    // 1. Populate hidden select
    const option = document.createElement("option");
    option.value = item.code;
    option.innerText = `${item.name || "ไม่มีชื่อพัสดุ"} (${item.code || "ไม่มีรหัส"}) [คงเหลือ: ${item.qty || 0} ${item.unit || "หน่วย"}]`;
    dropdown.appendChild(option);

    // 2. Populate custom list item
    const customOpt = document.createElement("div");
    customOpt.className = "custom-select-option";
    customOpt.setAttribute("data-value", item.code);
    customOpt.innerHTML = `
      <div class="custom-opt-name">${item.name || "ไม่มีชื่อพัสดุ"}</div>
      <div class="custom-opt-details">
        <span class="custom-opt-code">${item.code || "ไม่มีรหัส"}</span>
        <span class="custom-opt-qty">คงเหลือ: ${item.qty || 0} ${item.unit || "หน่วย"}</span>
      </div>
    `;
    
    // Add click handler to select item
    customOpt.addEventListener("click", () => {
      selectCustomOption(item.code, `${item.name || "ไม่มีชื่อพัสดุ"} (${item.code || "ไม่มีรหัส"})`);
    });

    optionsList.appendChild(customOpt);
  });

  // Restore previous selection if it still exists
  if (selectedVal) {
    dropdown.value = selectedVal;
    const foundItem = items.find(item => item.code === selectedVal);
    if (foundItem) {
      triggerText.innerText = `${foundItem.name || "ไม่มีชื่อพัสดุ"} (${foundItem.code || "ไม่มีรหัส"})`;
      triggerText.classList.add("has-value");

      // Highlight custom list option
      const options = optionsList.querySelectorAll(".custom-select-option");
      options.forEach(opt => {
        if (opt.getAttribute("data-value") === selectedVal) {
          opt.classList.add("selected");
        } else {
          opt.classList.remove("selected");
        }
      });
    }
  } else {
    triggerText.innerText = '-- กรุณาเลือกรายการ --';
    triggerText.classList.remove("has-value");
  }
}

// Custom Searchable Dropdown selection logic
function selectCustomOption(value, text) {
  const dropdown = document.getElementById("borrowItemCode");
  const triggerText = document.querySelector("#borrowItemSelectTrigger .custom-select-trigger-text");
  const dropdownMenu = document.getElementById("borrowItemSelectDropdown");
  const chevron = document.querySelector("#borrowItemSelectWrapper .custom-select-chevron");
  const optionsList = document.getElementById("borrowItemOptionsList");

  if (!dropdown) return;

  dropdown.value = value;
  if (triggerText) {
    triggerText.innerText = text;
    triggerText.classList.add("has-value");
  }
  
  // Update selected class visually
  if (optionsList) {
    const options = optionsList.querySelectorAll(".custom-select-option");
    options.forEach(opt => {
      if (opt.getAttribute("data-value") === value) {
        opt.classList.add("selected");
      } else {
        opt.classList.remove("selected");
      }
    });
  }

  // Close dropdown
  if (dropdownMenu) dropdownMenu.classList.remove("open");
  if (chevron) chevron.style.transform = "rotate(0deg)";
  
  // Trigger change event
  dropdown.dispatchEvent(new Event('change'));
}

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

  // Handle Lab Kit Dropdown Change and Previews
  const kitSelect = document.getElementById("borrowLabKit");
  const kitPreview = document.getElementById("labKitPreview");
  const kitItemsList = document.getElementById("labKitItemsList");
  const singleItemSelectGroup = document.getElementById("singleItemSelectGroup");
  const borrowQtyInput = document.getElementById("borrowQty");

  if (kitSelect) {
    kitSelect.addEventListener("change", () => {
      const kitId = kitSelect.value;
      if (kitId && LAB_KITS[kitId]) {
        // Hide single select group and force borrow quantity to be determined by the kit
        singleItemSelectGroup.style.display = "none";
        document.getElementById("borrowItemCode").required = false;
        
        // Populate items list preview
        kitPreview.style.display = "block";
        let listHtml = "";
        let allAvailable = true;

        LAB_KITS[kitId].items.forEach(kitItem => {
          const item = items.find(i => i.code === kitItem.code);
          const currentStock = item ? item.qty : 0;
          const reqQty = kitItem.qty;
          const name = item ? item.name : kitItem.code;
          const unit = item ? item.unit : "ชิ้น";
          const hasStock = currentStock >= reqQty;
          if (!hasStock) allAvailable = false;

          listHtml += `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.05); padding: 4px 0;">
              <span style="font-weight: 500;">• ${name}</span>
              <span>
                จำนวน: <strong>${reqQty}</strong> / ในคลัง: <strong style="color: ${hasStock ? 'var(--accent-green)' : 'var(--accent-red)'};">${currentStock} ${unit}</strong>
                ${hasStock ? '' : ' <span style="font-size: 11px; font-weight: bold; color: var(--accent-red);">(ไม่พอ)</span>'}
              </span>
            </div>
          `;
        });

        kitItemsList.innerHTML = listHtml;
        lucide.createIcons();
        
        // Lock quantity input to 1 (since quantity is defined inside the kit)
        borrowQtyInput.value = 1;
        borrowQtyInput.disabled = true;

        if (!allAvailable) {
          document.getElementById("btnSubmitBorrow").disabled = true;
          showToast("ชุดอุปกรณ์มีวัสดุบางรายการไม่เพียงพอในคลัง", "error");
        } else {
          document.getElementById("btnSubmitBorrow").disabled = false;
        }
      } else {
        // Show single select group again
        singleItemSelectGroup.style.display = "block";
        document.getElementById("borrowItemCode").required = true;
        kitPreview.style.display = "none";
        kitItemsList.innerHTML = "";
        
        borrowQtyInput.value = 1;
        borrowQtyInput.disabled = false;
        document.getElementById("btnSubmitBorrow").disabled = false;
      }
    });
  }

  // Hide/Show Lab Kit dropdown depending on Borrow vs Return type
  const borrowTypeRadios = document.querySelectorAll('input[name="borrowType"]');
  borrowTypeRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      const isReturn = document.querySelector('input[name="borrowType"]:checked').value === "return";
      const kitGroup = document.getElementById("labKitSelectGroup");
      const kitSelectEl = document.getElementById("borrowLabKit");
      
      if (isReturn) {
        if (kitGroup) kitGroup.style.display = "none";
        if (kitSelectEl) {
          kitSelectEl.value = "";
          kitSelectEl.dispatchEvent(new Event('change'));
        }
      } else {
        if (kitGroup) kitGroup.style.display = "block";
      }
    });
  });

  // Reset handler
  btnReset.addEventListener("click", () => {
    form.reset();
    if (borrowDateInput) {
      const today = new Date().toISOString().split('T')[0];
      borrowDateInput.value = today;
    }
    if (kitSelect) {
      kitSelect.value = "";
      kitSelect.dispatchEvent(new Event('change'));
    }
    const kitGroup = document.getElementById("labKitSelectGroup");
    if (kitGroup) kitGroup.style.display = "block";
  });

  // Form submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const borrowType = document.querySelector('input[name="borrowType"]:checked').value;
    const borrowerName = document.getElementById("borrowerName").value.trim();
    const borrowDate = document.getElementById("borrowDate").value;
    const borrowNotes = document.getElementById("borrowNotes").value.trim();
    const kitId = kitSelect ? kitSelect.value : "";

    if (!borrowerName || !borrowDate) {
      showToast("กรุณากรอกข้อมูลผู้ทำรายการและวันที่", "error");
      return;
    }

    // Determine expected return date (7 days after borrow)
    const expectedReturnDate = addDays(borrowDate, 7);

    // 1. LAB KIT BUNDLE BORROWING FLOW
    if (borrowType === "borrow" && kitId && LAB_KITS[kitId]) {
      const kit = LAB_KITS[kitId];
      
      // Stock pre-check
      let allAvailable = true;
      kit.items.forEach(kitItem => {
        const item = items.find(i => i.code === kitItem.code);
        if (!item || item.qty < kitItem.qty) {
          allAvailable = false;
        }
      });

      if (!allAvailable) {
        showToast("ไม่สามารถทำรายการได้เนื่องจากพัสดุบางรายการในชุดมีไม่เพียงพอ", "error");
        return;
      }

      // Execute borrows
      let loggedCount = 0;
      for (const kitItem of kit.items) {
        const itemIndex = items.findIndex(i => i.code === kitItem.code);
        const item = items[itemIndex];

        if (userRole === "student") {
          // Student View: Creates pending request, no stock change
          const transactionData = {
            id: "TX-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
            itemCode: item.code,
            itemName: item.name,
            qty: kitItem.qty,
            borrower: borrowerName,
            date: borrowDate,
            type: "borrow",
            status: "pending",
            notes: `[ยืมในชุด: ${kit.name}] ${borrowNotes}`,
            expectedReturnDate,
            kitName: kit.name,
            createdAt: new Date().toISOString()
          };
          await saveTransaction(transactionData);
          loggedCount++;
        } else {
          // Teacher View: Auto approve, decrements stock immediately
          const newQty = item.qty - kitItem.qty;
          const updatedItem = { ...item, qty: newQty };
          const success = await updateItemBackend(item.code, updatedItem, itemIndex);
          
          if (success) {
            const transactionData = {
              id: "TX-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
              itemCode: item.code,
              itemName: item.name,
              qty: kitItem.qty,
              borrower: borrowerName,
              date: borrowDate,
              type: "borrow",
              status: "borrowed",
              notes: `[ยืมในชุด: ${kit.name}] ${borrowNotes}`,
              expectedReturnDate,
              kitName: kit.name,
              createdAt: new Date().toISOString()
            };
            await saveTransaction(transactionData);
            loggedCount++;
          }
        }
      }

      if (loggedCount > 0) {
        if (userRole === "student") {
          showToast(`ส่งคำขออนุมัติยืมชุดพัสดุ "${kit.name}" เรียบร้อยแล้ว!`, "info");
        } else {
          showToast(`ทำรายการยืมชุดพัสดุ "${kit.name}" สำเร็จ!`, "success");
        }
        form.reset();
        if (kitSelect) {
          kitSelect.value = "";
          kitSelect.dispatchEvent(new Event('change'));
        }
        updateUI();
      }
      return;
    }

    // 2. SINGLE ITEM BORROW/RETURN FLOW
    const itemCode = document.getElementById("borrowItemCode").value;
    const borrowQty = Number(document.getElementById("borrowQty").value);

    if (!itemCode || isNaN(borrowQty) || borrowQty <= 0) {
      showToast("กรุณาเลือกรายการและระบุจำนวนให้ถูกต้อง", "error");
      return;
    }

    const itemIndex = items.findIndex(item => item.code === itemCode);
    if (itemIndex === -1) {
      showToast("ไม่พบข้อมูลพัสดุในระบบ", "error");
      return;
    }
    const item = items[itemIndex];

    if (borrowType === "borrow") {
      if (borrowQty > item.qty) {
        showToast(`ไม่สามารถยืมได้! จำนวนที่ยืม (${borrowQty}) มากกว่าจำนวนคงเหลือในคลัง (${item.qty})`, "error");
        return;
      }

      if (userRole === "student") {
        // Student View: Creates pending request, no stock change
        const transactionData = {
          id: "TX-" + Date.now(),
          itemCode: item.code,
          itemName: item.name,
          qty: borrowQty,
          borrower: borrowerName,
          date: borrowDate,
          type: "borrow",
          status: "pending",
          notes: borrowNotes,
          expectedReturnDate,
          createdAt: new Date().toISOString()
        };
        const logged = await saveTransaction(transactionData);
        if (logged) {
          showToast(`ส่งคำขออนุมัติยืม "${item.name}" เรียบร้อยแล้ว!`, "info");
          form.reset();
          updateUI();
        }
      } else {
        // Teacher View: Decrement stock immediately and save approved transaction
        const newQty = item.qty - borrowQty;
        const updatedItem = { ...item, qty: newQty };
        const success = await updateItemBackend(item.code, updatedItem, itemIndex);

        if (success) {
          const transactionData = {
            id: "TX-" + Date.now(),
            itemCode: item.code,
            itemName: item.name,
            qty: borrowQty,
            borrower: borrowerName,
            date: borrowDate,
            type: "borrow",
            status: "borrowed",
            notes: borrowNotes,
            expectedReturnDate,
            createdAt: new Date().toISOString()
          };
          const logged = await saveTransaction(transactionData);
          if (logged) {
            showToast(`ทำรายการยืม "${item.name}" สำเร็จ!`, "success");
            form.reset();
            updateUI();
          }
        }
      }
    } else {
      // RETURN FLOW (Immediate Return)
      const newQty = item.qty + borrowQty;
      const updatedItem = { ...item, qty: newQty };
      const success = await updateItemBackend(item.code, updatedItem, itemIndex);

      if (success) {
        const transactionData = {
          id: "TX-" + Date.now(),
          itemCode: item.code,
          itemName: item.name,
          qty: borrowQty,
          borrower: borrowerName,
          date: borrowDate,
          type: "return",
          status: "returned",
          notes: borrowNotes,
          expectedReturnDate: "",
          createdAt: new Date().toISOString()
        };
        const logged = await saveTransaction(transactionData);
        if (logged) {
          showToast(`ทำรายการคืน "${item.name}" สำเร็จ!`, "success");
          form.reset();
          updateUI();
        }
      }
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
    let nameEng = "";
    const braceIndex = tx.itemName.indexOf("(");
    if (braceIndex !== -1) {
      nameThai = tx.itemName.substring(0, braceIndex).trim();
      nameEng = tx.itemName.substring(braceIndex).trim();
    }

    html += `
      <tr class="table-clickable-row" onclick="showTransactionDetail('${tx.id}')" style="cursor: pointer;" title="คลิกเพื่อดูรายละเอียดเพิ่มเติม">
        <td data-label="วันทำรายการ" style="font-size: 12px; color: var(--text-muted);">${formatThaiDate(tx.date)}</td>
        <td data-label="รายการพัสดุ">
          <div style="font-weight: 600; color: #0f172a; font-size: 12px; line-height: 1.4;">${nameThai}</div>
          ${nameEng ? `<div style="color: var(--text-muted); font-size: 11px; line-height: 1.3; margin-top: 1px;">${nameEng}</div>` : ''}
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

      showToast(`คืน "${item.name}" จำนวน ${tx.qty} หน่วย เรียบร้อยแล้ว!`, "success");
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
      id: "bk-1",
      room: "Lab 1",
      date: "2026-06-03",
      slot: "คาบ 1: 08:10 - 09:00, คาบ 2: 09:00 - 09:50",
      bookerName: "อาจารย์ วีระศักดิ์",
      status: "approved",
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: "bk-2",
      room: "Lab 2",
      date: "2026-06-04",
      slot: "คาบ 3: 09:50 - 10:40",
      bookerName: "สมชาย มีดี",
      status: "approved",
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: "bk-3",
      room: "Lab 1",
      date: "2026-06-04",
      slot: "คาบ 5: 11:30 - 12:20, คาบ 6: 12:20 - 13:10",
      bookerName: "ดร. ณรงค์ศักดิ์",
      status: "approved",
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: "bk-4",
      room: "Lab 2",
      date: "2026-06-05",
      slot: "คาบ 1: 08:10 - 09:00, คาบ 2: 09:00 - 09:50",
      bookerName: "ผศ. ดร. สมเกียรติ",
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
      showToast(`จองห้อง "${room}" ช่วงเวลา ${slot} เรียบร้อยแล้ว!`, "success");
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
            <span class="product-code" style="background-color: rgba(139, 92, 246, 0.08); color: #8b5cf6; font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${b.room}</span>
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

  if (confirm(`คุณต้องการยกเลิกการจองห้อง "${booking.room}" ช่วงเวลา ${booking.slot} ในวันที่ ${formatThaiDate(booking.date)} ใช่หรือไม่?`)) {
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
  
  // Update entire UI to apply admin / viewer state
  updateUI();
}

function setupLoginHandlers() {
  const btnLogin = document.getElementById("btnSidebarLogin");
  const loginModal = document.getElementById("loginModal");
  const btnClose = document.getElementById("loginModalClose");
  const btnCancel = document.getElementById("btnCancelLogin");
  const form = document.getElementById("adminLoginForm");
  const errorMsg = document.getElementById("loginErrorMsg");
  const btnTogglePassword = document.getElementById("btnTogglePassword");
  const passwordInput = document.getElementById("loginPassword");
  const usernameInput = document.getElementById("loginUsername");
  const eyeIcon = document.getElementById("eyeIcon");

  if (!btnLogin || !loginModal) return;

  // Toggle login / logout
  btnLogin.addEventListener("click", (e) => {
    e.preventDefault();
    if (isAdminLoggedIn) {
      if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
        isAdminLoggedIn = false;
        sessionStorage.removeItem("admin_logged_in");
        showToast("ออกจากระบบหลังบ้านแล้ว", "info");
        updateLoginUI();
      }
    } else {
      // Clear inputs
      if (usernameInput) usernameInput.value = "";
      if (passwordInput) {
        passwordInput.value = "";
        passwordInput.type = "password";
      }
      if (eyeIcon) eyeIcon.setAttribute("data-lucide", "eye");
      if (errorMsg) errorMsg.style.display = "none";
      
      loginModal.classList.add("active");
      lucide.createIcons();
    }
  });

  const closeModal = () => {
    loginModal.classList.remove("active");
  };

  if (btnClose) btnClose.addEventListener("click", closeModal);
  if (btnCancel) btnCancel.addEventListener("click", closeModal);

  // Toggle password visibility
  if (btnTogglePassword && passwordInput) {
    btnTogglePassword.addEventListener("click", () => {
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeIcon.setAttribute("data-lucide", "eye-off");
      } else {
        passwordInput.type = "password";
        eyeIcon.setAttribute("data-lucide", "eye");
      }
      lucide.createIcons();
    });
  }

  // Handle Form Submission
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = usernameInput.value.trim();
      const password = passwordInput.value;

      if (username === "admin" && password === "admin1234") {
        isAdminLoggedIn = true;
        sessionStorage.setItem("admin_logged_in", "true");
        showToast("เข้าสู่ระบบหลังบ้านสำเร็จ ยินดีต้อนรับผู้ดูแลระบบ!", "success");
        closeModal();
        updateLoginUI();
      } else {
        if (errorMsg) errorMsg.style.display = "flex";
      }
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
        <span style="font-weight: 600; color: var(--text-muted);">วัสดุ / สารเคมีที่เตรียมสอน (Prep Items):</span>
        <div style="display: flex; flex-direction: column; gap: 4px; padding-left: 12px; margin-top: 4px;">
          ${bk.prepItems.map(pi => {
            const item = items.find(i => i.code === pi.code);
            const name = item ? item.name : pi.code;
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
        <span style="font-weight: 600; color: #0f172a;">${bk.room === "Lab 1" ? "Lab 1 (ห้องเคมีทั่วไป)" : bk.room === "Lab 2" ? "Lab 2 (ห้องฟิสิกส์/วิเคราะห์)" : bk.room === "Lab 3" ? "Lab 3 (ห้องชีวภาพ/จุลชีววิทยา)" : bk.room}</span>
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
  const btnStudent = document.getElementById("roleBtnStudent");
  const btnTeacher = document.getElementById("roleBtnTeacher");
  if (!btnStudent || !btnTeacher) return;

  const setRoleActiveState = (role) => {
    if (role === "teacher") {
      btnTeacher.classList.add("active");
      btnTeacher.style.background = "rgba(255,255,255,0.15)";
      btnTeacher.style.color = "#ffffff";
      
      btnStudent.classList.remove("active");
      btnStudent.style.background = "none";
      btnStudent.style.color = "rgba(255,255,255,0.6)";
    } else {
      btnStudent.classList.add("active");
      btnStudent.style.background = "rgba(255,255,255,0.15)";
      btnStudent.style.color = "#ffffff";
      
      btnTeacher.classList.remove("active");
      btnTeacher.style.background = "none";
      btnTeacher.style.color = "rgba(255,255,255,0.6)";
    }
  };

  btnStudent.addEventListener("click", () => {
    userRole = "student";
    isAdminLoggedIn = false;
    sessionStorage.setItem("admin_logged_in", "false");
    localStorage.setItem("user_role", "student");
    setRoleActiveState("student");
    showToast("เปลี่ยนบทบาทเป็น นักเรียน (Student) แล้ว", "info");
    updateLoginUI();
  });

  btnTeacher.addEventListener("click", () => {
    userRole = "teacher";
    isAdminLoggedIn = true;
    sessionStorage.setItem("admin_logged_in", "true");
    localStorage.setItem("user_role", "teacher");
    setRoleActiveState("teacher");
    showToast("เปลี่ยนบทบาทเป็น ครู/เจ้าหน้าที่ (Teacher/Staff) แล้ว", "info");
    updateLoginUI();
  });

  // Load initial role state
  const savedRole = localStorage.getItem("user_role") || "student";
  userRole = savedRole;
  isAdminLoggedIn = (savedRole === "teacher");
  sessionStorage.setItem("admin_logged_in", isAdminLoggedIn ? "true" : "false");
  setRoleActiveState(savedRole);
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
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; font-size: 12px;">
        <span style="font-weight: 500; color: #334155;">${item.name} (${item.code})</span>
        <div style="display: flex; gap: 6px;">
          ${dQty > 0 ? `<span class="badge badge-red" style="font-size: 10px; padding: 1px 6px;">ชำรุด: ${dQty} ${item.unit}</span>` : ""}
          ${rQty > 0 ? `<span class="badge badge-orange" style="font-size: 10px; padding: 1px 6px;">ส่งซ่อม: ${rQty} ${item.unit}</span>` : ""}
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

function renderPendingRequests() {
  const card = document.getElementById("pendingRequestsCard");
  const container = document.getElementById("pendingRequestsContainer");
  const countBadge = document.getElementById("pendingRequestsCount");
  
  if (!card || !container) return;

  if (userRole !== "teacher") {
    card.style.display = "none";
    return;
  }

  const pendingTx = transactions.filter(tx => tx.type === "borrow" && tx.status === "pending");

  if (pendingTx.length === 0) {
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
  if (countBadge) countBadge.innerText = pendingTx.length;

  let html = "";
  pendingTx.forEach(tx => {
    html += `
      <div style="display: flex; flex-direction: column; gap: 8px; padding: 12px; background-color: rgba(245, 158, 11, 0.03); border: 1px solid rgba(245, 158, 11, 0.15); border-radius: var(--border-radius-md); font-size: 13px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
          <div>
            <div style="font-weight: 600; color: #1e293b;">${tx.itemName}</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">รหัส: ${tx.itemCode} | จำนวน: <strong>${tx.qty}</strong></div>
          </div>
          <span class="badge badge-orange" style="font-size: 10px; padding: 1px 6px;">รอดำเนินการ</span>
        </div>
        <div style="font-size: 11px; color: #475569; padding-left: 2px;">
          ผู้ยืม: <strong>${tx.borrower}</strong> | วันยืม: ${formatThaiDate(tx.date)}
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
      explosive: { text: "ระเบิดได้ (Explosive)", url: "./images/GHS-explosive.svg" },
      flammable: { text: "ไวไฟ (Flammable)", url: "./images/GHS-flammable.svg" },
      oxidizing: { text: "ออกซิไดซ์ (Oxidizing)", url: "./images/GHS-oxidizing.svg" },
      compressed_gas: { text: "ก๊าซความดัน (Compressed Gas)", url: "./images/GHS-compressed-gas.svg" },
      corrosive: { text: "กัดกร่อน (Corrosive)", url: "./images/GHS-corrosive.svg" },
      toxic: { text: "สารพิษ (Toxic)", url: "./images/GHS-toxic.svg" },
      irritant: { text: "ระคายเคือง (Irritant)", url: "./images/GHS-irritant.svg" },
      health_hazard: { text: "ภัยสุขภาพ (Health Hazard)", url: "./images/GHS-health-hazard.svg" },
      environmental: { text: "สิ่งแวดล้อม (Eco)", url: "./images/GHS-environmental.svg" }
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
        <h4 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0;">${item.name}</h4>
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
            <h3 class="title">${item.name}</h3>
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
      "รหัส (Item Code)",
      "ชื่อ (Name)",
      "หมวดหมู่ (Category)",
      "จำนวนคงเหลือ (Quantity)",
      "หน่วย (Unit)",
      "จุดสั่งซื้อต่ำสุด (Min Reorder)",
      "วันหมดอายุ (Expiry Date)",
      "ห้อง/Lab (Room)",
      "ตู้เก็บของ (Cabinet)",
      "ชั้นวาง (Shelf)",
      "ประเภทอันตรายเคมี (Chemical Type)",
      "ลิงก์ SDS (SDS Link)",
      "ชำรุด (Damaged)",
      "ส่งซ่อม (Repairing)"
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
        showToast(`สแกนพบพัสดุ: ${item.name}`, "success");
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
          <span>${item.name} (${item.code})</span>
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

