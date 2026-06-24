// ==========================================================================
// STATE MANAGEMENT & INITIALIZATION
// ==========================================================================

// Global state variable
let items = [];
let currentPage = 1;
const itemsPerPage = 10;
let fileToImport = null;
let userRole = localStorage.getItem("userRole") || (localStorage.getItem("isAdminLoggedIn") === "true" ? "admin" : "student");


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
  // Load data
  await loadAllItems();
  
  // Load borrowing transactions
  await loadAllTransactions();

  // Load room bookings
  await loadAllBookings();
  
  // Load purchase orders
  await loadPurchaseOrders();
  
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
  
  setupCsvExport();
  setupPrintReport();
  setupDashboardReports();
  setupHistoryExports();
  setupGhsSuggestions();
  setupWasteClassificationWizard();
  setupBarcodeScanner();
  setupCameraScanner();
  setupLoginHandlers();
  setupAccessDeniedModal();
  setupRepairModalHandlers();
  setupChatbot();
  setupPurchaseOrders();
  setupLabPlanner();
  updateLoginUI();
  
  // Initialize Lucide icons initially
  lucide.createIcons();

  // Background synchronization for budget and purchase orders (multi-admin sync)
  setInterval(() => {
    if (typeof syncBudgetInRealtime === "function") {
      syncBudgetInRealtime();
    }
  }, 8000); // Poll every 8 seconds
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
      const isBackoffice = (userRole === "admin" || userRole === "teacher");
      if ((targetPanelId === "add-item" || targetPanelId === "purchase-orders" || targetPanelId === "reports") && !isBackoffice) {
        showToast("กรุณาเข้าสู่ระบบหลังบ้านเพื่อเข้าใช้งานหน้านี้", "error");
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

  const quickBtnAddItem = document.getElementById("quickBtnAddItem");
  if (quickBtnAddItem) {
    quickBtnAddItem.addEventListener("click", () => {
      navigateToPanel("add-item");
    });
  }

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

  // Version Modal Handlers
  const versionBadge = document.getElementById("versionBadge");
  const versionModal = document.getElementById("versionModal");
  const versionModalClose = document.getElementById("versionModalClose");
  if (versionBadge && versionModal) {
    versionBadge.addEventListener("click", () => {
      versionModal.classList.add("active");
      lucide.createIcons();
    });
  }
  if (versionModalClose && versionModal) {
    versionModalClose.addEventListener("click", () => {
      versionModal.classList.remove("active");
    });
    versionModal.addEventListener("click", (e) => {
      if (e.target === versionModal) {
        versionModal.classList.remove("active");
      }
    });
  }
}

// Function to programmatically switch panels
function navigateToPanel(panelId, catFilter = "all", statusFilter = "all") {
  // Authorization check for admin page
  const isBackoffice = (userRole === "admin" || userRole === "teacher");
  if ((panelId === "add-item" || panelId === "purchase-orders" || panelId === "reports") && !isBackoffice) {
    document.getElementById("accessDeniedModal").classList.add("active");
    lucide.createIcons();
    return;
  }

  const panels = document.querySelectorAll(".panel");
  const sidebarLinks = document.querySelectorAll(".menu-item-link");
  
  // Update sidebar active link
  sidebarLinks.forEach(link => {
    const target = link.getAttribute("data-target");
    if (panelId === "purchase-orders" && target === "add-item") {
      link.classList.add("active");
    } else if (target === panelId) {
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
  if (room === "Lab 1" || room === "ห้องปฏิบัติการเคมี" || room === "ห้องปฏิบัติการเคมี อาคารอัสสัมชัญ") return "ห้องปฏิบัติการเคมี อาคารอัสสัมชัญ";
  if (room === "Lab 2" || room === "ห้องปฏิบัติการฟิสิกส์" || room === "ห้องปฏิบัติการฟิสิกส์ อาคารเซนต์ปีเตอร์") return "ห้องปฏิบัติการฟิสิกส์ อาคารเซนต์ปีเตอร์";
  if (room === "Lab 3" || room === "ห้องปฏิบัติการชีววิทยา" || room === "ห้องปฏิบัติการชีววิทยา อาคารเซนต์ปีเตอร์") return "ห้องปฏิบัติการชีววิทยา อาคารเซนต์ปีเตอร์";
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
  
  // Show/Hide export buttons depending on login status
  const borrowExportActions = document.getElementById("borrowExportActions");
  const bookingExportActions = document.getElementById("bookingExportActions");
  const quickBtnAddItem = document.getElementById("quickBtnAddItem");
  const isBackoffice = (userRole === "admin" || userRole === "teacher");
  if (borrowExportActions) borrowExportActions.style.display = isBackoffice ? "inline-flex" : "none";
  if (bookingExportActions) bookingExportActions.style.display = isBackoffice ? "inline-flex" : "none";
  if (quickBtnAddItem) quickBtnAddItem.style.display = isBackoffice ? "flex" : "none";
  
  // Trigger Lucide updates for newly rendered icon containers
  renderOrdersTable();
  renderAnalyticsCharts();
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

  // Select top 3 recent
  const recents = sortedItems.slice(0, 3);

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

  // Set count badge at the card header
  const totalCountEl = document.getElementById("categoryBreakdownCount");
  if (totalCountEl) {
    totalCountEl.textContent = `${items.length} รายการ`;
  }

  const counts = {
    "สารเคมี": 0,
    "อุปกรณ์วิทยาศาสตร์": 0,
    "เครื่องแก้ว": 0,
    "วัสดุสิ้นเปลือง": 0,
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
    { name: "อุปกรณ์วิทยาศาสตร์", count: counts["อุปกรณ์วิทยาศาสตร์"], color: "#10b981" },
    { name: "เครื่องแก้ว", count: counts["เครื่องแก้ว"], color: "#3b82f6" },
    { name: "วัสดุสิ้นเปลือง", count: counts["วัสดุสิ้นเปลือง"], color: "#f97316" }
  ];

  // Only display 'อื่นๆ' if there are items fall under this fallback category
  if (counts["อื่นๆ"] > 0) {
    categoriesList.push({ name: "อื่นๆ", count: counts["อื่นๆ"], color: "#6b7280" });
  }

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
          const g1 = chemicalType;
          const g2 = item.chemicalType;
          if (areIncompatible(g1, g2)) {
            conflictType = g2;
            conflictName = getItemDisplayName(item);
            return true;
          }
        }
        return false;
      });

      if (potentialConflict) {
        const typeLabels = {
          "A": "กลุ่ม A - เบสอินทรีย์ (Organic Bases)",
          "B": "กลุ่ม B - สารที่ลุกติดไฟเอง/ทำปฏิกิริยากับน้ำ (Pyrophoric/Water Reactive)",
          "C": "กลุ่ม C - เบสอนินทรีย์ (Inorganic Bases)",
          "D": "กลุ่ม D - กรดอินทรีย์ (Organic Acids)",
          "E": "กลุ่ม E - สารออกซิไดเซอร์อนินทรีย์ (Inorganic Oxidizers)",
          "F": "กลุ่ม F - กรดอนินทรีย์ (Inorganic Acids)",
          "G": "กลุ่ม G - สารเคมีทั่วไปที่ไม่ว่องไว (General)",
          "I": "กลุ่ม I - สารออกซิไดเซอร์ที่เป็นกรดแก่ (Strong Oxidizing Acids)",
          "K": "กลุ่ม K - สารระเบิดได้ที่มีความคงตัว (Stable Explosives)",
          "L": "กลุ่ม L - สารไวไฟและตัวทำละลายอินทรีย์ (Flammables/Solvents)",
          "X": "กลุ่ม X - สารที่ไม่เข้ากันกับสารอื่น (Incompatible with ALL)"
        };
        const msg = `⚠️ คำเตือนจัดเก็บสารเคมีร่วมตู้ที่ไม่เข้ากัน:\n` +
                    `พบ "${conflictName}" ซึ่งเป็นสารประเภท "${typeLabels[conflictType]}" จัดเก็บอยู่ใน "${room} > ${cabinet}" เรียบร้อยแล้ว\n` +
                    `สารประเภท "${typeLabels[chemicalType]}" และ "${typeLabels[conflictType]}" ไม่ควรจัดเก็บร่วมกันในตู้เดียวกันตามมาตรฐานความปลอดภัย\n\n` +
                    `คุณต้องการบันทึกการจัดเก็บร่วมกันต่อไปใช่หรือไม่?`;
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
    if (typeof window.clearCompatibilityRecommendation === "function") {
      window.clearCompatibilityRecommendation();
    }
    
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
    if (typeof window.clearCompatibilityRecommendation === "function") {
      window.clearCompatibilityRecommendation();
    }
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
    if (typeof window.clearCompatibilityRecommendation === "function") {
      window.clearCompatibilityRecommendation();
    }
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

  if (typeof window.applyGhsSuggestions === "function") {
    window.applyGhsSuggestions();
  }
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
    "# 5. ห้อง (ตรงตามระบบ): ห้องปฏิบัติการเคมี อาคารอัสสัมชัญ (หรือ Lab 1) | ห้องปฏิบัติการฟิสิกส์ อาคารเซนต์ปีเตอร์ (หรือ Lab 2) | ห้องปฏิบัติการชีววิทยา อาคารเซนต์ปีเตอร์ (หรือ Lab 3) | นอกห้องปฏิบัติการ (หรือ None)",
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
    "CHEM-005", "กรดอะซิติก (Acetic Acid)", "สารเคมี", "3", "ขวด", "0", "0", "1", "2027-08-20", "ห้องปฏิบัติการเคมี อาคารอัสสัมชัญ", "ตู้ B", "ชั้น 1", 
    "acid", "https://example.com/sds-acetic.pdf", "", "Y", "", "", "Y", "", "Y", "", ""
  ];
  const sampleRow2 = [
    "EQ-002", "กล้องจุลทรรศน์แบบใช้แสง (Microscope)", "อุปกรณ์วิทยาศาสตร์", "4", "เครื่อง", "0", "0", "2", "", "ห้องปฏิบัติการฟิสิกส์ อาคารเซนต์ปีเตอร์", "ตู้เก็บอุปกรณ์", "ตู้ด้านซ้าย", 
    "", "", "", "", "", "", "", "", "", "", ""
  ];
  const sampleRow3 = [
    "GW-003", "บีกเกอร์ 250 มล. (Beaker 250ml)", "เครื่องแก้ว", "10", "ใบ", "1", "0", "5", "", "ห้องปฏิบัติการชีววิทยา อาคารเซนต์ปีเตอร์", "ตู้แก้ว A", "ชั้น 2", 
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
    if (room === "ห้องปฏิบัติการเคมี" || room === "ห้องปฏิบัติการเคมี อาคารอัสสัมชัญ") room = "Lab 1";
    else if (room === "ห้องปฏิบัติการฟิสิกส์" || room === "ห้องปฏิบัติการฟิสิกส์ อาคารเซนต์ปีเตอร์") room = "Lab 2";
    else if (room === "ห้องปฏิบัติการชีววิทยา" || room === "ห้องปฏิบัติการชีววิทยา อาคารเซนต์ปีเตอร์") room = "Lab 3";
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
    },
    {
      id: "tx-mock-004",
      itemCode: "GW-002",
      itemName: "ปิเปตขนาด 10 มล. (Pipette 10ml)",
      qty: 2,
      borrower: "นายมานะ ขยันเรียน",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      type: "borrow",
      status: "borrowed",
      notes: "ศึกษาการดูดจ่ายสารเคมีและเซลล์พืช",
      expectedReturnDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      bookingId: "book_mock_003",
      room: "Lab 3",
      slot: "1, 2",
      supervisingTeacher: "อาจารย์ศิริมา ดีใจ",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "tx-mock-005",
      itemCode: "CHEM-002",
      itemName: "เอทานอล 95% (Ethanol)",
      qty: 1,
      borrower: "นางสาววิภา ใฝ่เรียน",
      date: new Date().toISOString().split('T')[0],
      type: "borrow",
      status: "pending",
      notes: "สกัดคลอโรฟิลล์จากใบพืช",
      expectedReturnDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      bookingId: "book_mock_004",
      room: "Lab 1",
      slot: "5, 6",
      supervisingTeacher: "อาจารย์สมศักดิ์ รักสอน",
      createdAt: new Date().toISOString()
    },
    {
      id: "tx-mock-006",
      itemCode: "EQ-001",
      itemName: "เครื่องชั่งดิจิตอล 4 ตำแหน่ง (Digital Balance)",
      qty: 1,
      borrower: "นายชูชาติ รักชาติ",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      type: "borrow",
      status: "returned",
      notes: "ชั่งสารเคมีเพื่อทดลองแรงลอยตัวและกระแสไฟฟ้า",
      expectedReturnDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      bookingId: "book_mock_005",
      room: "Lab 2",
      slot: "3",
      supervisingTeacher: "อาจารย์วิภาดา ใฝ่รู้",
      returnDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
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
      if (loadedTrans.length > 0) {
        transactions = loadedTrans;
        console.log("🔥 Loaded " + transactions.length + " transactions from Firebase Cloud.");
        return;
      } else {
        // Seed Firebase if empty
        const batch = db.batch();
        defaultTrans.forEach(demoTx => {
          transactions.push(demoTx);
          const docRef = db.collection("transactions").doc(demoTx.id);
          batch.set(docRef, demoTx);
        });
        await batch.commit();
        console.log("🔥 Seeded default transactions to Firebase.");
        return;
      }
    } catch (err) {
      console.error("🔥 Failed to load transactions from Firebase:", err);
      isFirebaseOnline = false;
    }
  }

  if (isBackendOnline) {
    try {
      const response = await fetch(`${API_BASE}/transactions`);
      if (response.ok) {
        transactions = await response.json();
        localStorage.setItem("lab_transactions", JSON.stringify(transactions));
        return;
      }
    } catch (e) {
      console.error("Failed to load transactions from backend:", e);
    }
  }

  // LocalStorage Fallback
  const localTrans = localStorage.getItem("lab_transactions");
  if (localTrans) {
    transactions = JSON.parse(localTrans);
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
  syncTransactionsToBackend();
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
              syncTransactionsToBackend();
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
        syncTransactionsToBackend();
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
    },
    {
      id: "book_mock_003",
      room: "Lab 3",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      slot: "1, 2",
      bookerName: "นายมานะ ขยันเรียน",
      purpose: "ศึกษาการดูดจ่ายสารเคมีและเซลล์พืชด้วยกล้องจุลทรรศน์",
      prepItems: [
        {
          code: "GW-002",
          qty: 2
        }
      ],
      status: "approved",
      createdAt: new Date().toISOString()
    },
    {
      id: "book_mock_004",
      room: "Lab 1",
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      slot: "5, 6",
      bookerName: "นางสาววิภา ใฝ่เรียน",
      purpose: "สกัดคลอโรฟิลล์เพื่อวัดอัตราการสังเคราะห์แสง",
      prepItems: [
        {
          code: "CHEM-002",
          qty: 1
        }
      ],
      status: "pending",
      createdAt: new Date().toISOString()
    },
    {
      id: "book_mock_005",
      room: "Lab 2",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      slot: "3",
      bookerName: "นายชูชาติ รักชาติ",
      purpose: "ทดสอบแรงลอยตัวและกระแสไฟฟ้าเบื้องต้น",
      prepItems: [
        {
          code: "EQ-001",
          qty: 1
        }
      ],
      status: "approved",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
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
      if (loadedBookings.length > 0) {
        bookings = loadedBookings;
        console.log("🔥 Loaded " + bookings.length + " bookings from Firebase Cloud.");
        return;
      } else {
        // Seed Firebase if empty
        const batch = db.batch();
        defaultBookings.forEach(demoBk => {
          bookings.push(demoBk);
          const docRef = db.collection("bookings").doc(demoBk.id);
          batch.set(docRef, demoBk);
        });
        await batch.commit();
        console.log("🔥 Seeded default bookings to Firebase.");
        return;
      }
    } catch (err) {
      console.error("🔥 Failed to load bookings from Firebase:", err);
      isFirebaseOnline = false;
    }
  }

  if (isBackendOnline) {
    try {
      const response = await fetch(`${API_BASE}/bookings`);
      if (response.ok) {
        bookings = await response.json();
        localStorage.setItem("lab_bookings", JSON.stringify(bookings));
        return;
      }
    } catch (e) {
      console.error("Failed to load bookings from backend:", e);
    }
  }

  // LocalStorage Fallback
  const localBookings = localStorage.getItem("lab_bookings");
  if (localBookings) {
    bookings = JSON.parse(localBookings);
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
  syncBookingsToBackend();
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
  syncBookingsToBackend();
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

// Sync functions to persist local changes to database server
function syncBudgetToBackend() {
  if (isFirebaseOnline) {
    db.collection("system").doc("budget").set({ budget: annualBudget })
      .catch(e => console.error("Failed to sync budget to Firebase:", e));
  }
  if (isBackendOnline) {
    fetch(`${API_BASE}/budget`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budget: annualBudget })
    }).catch(e => console.error("Failed to sync budget to backend:", e));
  }
}

function syncPurchaseOrdersToBackend() {
  if (isFirebaseOnline) {
    purchaseOrders.forEach(o => {
      db.collection("purchase_orders").doc(o.id).set(o)
        .catch(e => console.error("Failed to sync purchase order to Firebase:", e));
    });
  }
  if (isBackendOnline) {
    fetch(`${API_BASE}/purchase-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(purchaseOrders)
    }).catch(e => console.error("Failed to sync purchase orders to backend:", e));
  }
}

function syncBookingsToBackend() {
  if (isBackendOnline) {
    fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookings)
    }).catch(e => console.error("Failed to sync bookings to backend:", e));
  }
}

function syncTransactionsToBackend() {
  if (isBackendOnline) {
    fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactions)
    }).catch(e => console.error("Failed to sync transactions to backend:", e));
  }
}

// ==========================================================================
// PURCHASE ORDERS SYSTEM
// ==========================================================================
let purchaseOrders = [];
let purchaseOrderDrafts = [];
let annualBudget = 100000;

async function loadAnnualBudget() {
  if (isFirebaseOnline) {
    try {
      const doc = await db.collection("system").doc("budget").get();
      if (doc.exists) {
        annualBudget = parseFloat(doc.data().budget) || 100000;
        localStorage.setItem("lab_annual_budget", annualBudget.toString());
        return;
      } else {
        await db.collection("system").doc("budget").set({ budget: 100000 });
        annualBudget = 100000;
        localStorage.setItem("lab_annual_budget", "100000");
        return;
      }
    } catch (e) {
      console.error("Failed to load budget from Firebase:", e);
    }
  }

  if (isBackendOnline) {
    try {
      const response = await fetch(`${API_BASE}/budget`);
      if (response.ok) {
        const data = await response.json();
        annualBudget = parseFloat(data.budget) || 100000;
        localStorage.setItem("lab_annual_budget", annualBudget.toString());
        return;
      }
    } catch (e) {
      console.error("Failed to load budget from backend:", e);
    }
  }

  const localBudget = localStorage.getItem("lab_annual_budget");
  if (localBudget) {
    annualBudget = parseFloat(localBudget) || 100000;
  } else {
    annualBudget = 100000;
    localStorage.setItem("lab_annual_budget", annualBudget.toString());
  }
}

function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

async function loadPurchaseOrders() {
  await loadAnnualBudget();
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

  if (isFirebaseOnline) {
    try {
      const snapshot = await db.collection("purchase_orders").get();
      const loadedOrders = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d && d.id) loadedOrders.push(d);
      });
      if (loadedOrders.length > 0) {
        purchaseOrders = loadedOrders;
        localStorage.setItem("lab_purchase_orders", JSON.stringify(purchaseOrders));
        return;
      } else {
        const batch = db.batch();
        defaultOrders.forEach(o => {
          const docRef = db.collection("purchase_orders").doc(o.id);
          batch.set(docRef, o);
        });
        await batch.commit();
        purchaseOrders = [...defaultOrders];
        localStorage.setItem("lab_purchase_orders", JSON.stringify(purchaseOrders));
        return;
      }
    } catch (e) {
      console.error("Failed to load purchase orders from Firebase:", e);
    }
  }

  if (isBackendOnline) {
    try {
      const response = await fetch(`${API_BASE}/purchase-orders`);
      if (response.ok) {
        purchaseOrders = await response.json();
        localStorage.setItem("lab_purchase_orders", JSON.stringify(purchaseOrders));
        return;
      }
    } catch (e) {
      console.error("Failed to load purchase orders from backend:", e);
    }
  }

  const localOrders = localStorage.getItem("lab_purchase_orders");
  if (localOrders) {
    try {
      purchaseOrders = JSON.parse(localOrders);
      // Migrate old mock data formats to new format (using % discount) if they exist
      let updated = false;
      purchaseOrders.forEach(o => {
        if (o.id === "ord-mock-001" && (typeof o.budget !== 'number' || o.discount === 100)) {
          o.budget = 2000.00;
          o.discount = 5;
          delete o.budgetDiscount;
          updated = true;
        }
        if (o.id === "ord-mock-002" && (typeof o.budget !== 'number' || o.discount === 500)) {
          o.budget = 5000.00;
          o.discount = 10;
          delete o.budgetDiscount;
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem("lab_purchase_orders", JSON.stringify(purchaseOrders));
      }
    } catch (e) {
      console.error("Error parsing purchase orders:", e);
      purchaseOrders = [...defaultOrders];
      localStorage.setItem("lab_purchase_orders", JSON.stringify(purchaseOrders));
    }
  } else {
    purchaseOrders = [...defaultOrders];
    localStorage.setItem("lab_purchase_orders", JSON.stringify(purchaseOrders));
  }
}

// Background synchronization for budget and purchase orders (multi-admin sync)
async function syncBudgetInRealtime() {
  let changed = false;

  // 1. Sync Budget
  if (isFirebaseOnline) {
    try {
      const doc = await db.collection("system").doc("budget").get();
      if (doc.exists) {
        const val = parseFloat(doc.data().budget) || 100000;
        if (val !== annualBudget) {
          annualBudget = val;
          localStorage.setItem("lab_annual_budget", annualBudget.toString());
          changed = true;
        }
      }
    } catch (e) {
      console.error("Firebase budget sync failed:", e);
    }
  } else if (isBackendOnline) {
    try {
      const response = await fetch(`${API_BASE}/budget`);
      if (response.ok) {
        const data = await response.json();
        const val = parseFloat(data.budget) || 100000;
        if (val !== annualBudget) {
          annualBudget = val;
          localStorage.setItem("lab_annual_budget", annualBudget.toString());
          changed = true;
        }
      }
    } catch (e) {
      console.error("Backend budget sync failed:", e);
    }
  }

  // 2. Sync Purchase Orders
  if (isFirebaseOnline) {
    try {
      const snapshot = await db.collection("purchase_orders").get();
      const loadedOrders = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d && d.id) loadedOrders.push(d);
      });
      if (loadedOrders.length !== purchaseOrders.length || JSON.stringify(loadedOrders) !== JSON.stringify(purchaseOrders)) {
        purchaseOrders = loadedOrders;
        localStorage.setItem("lab_purchase_orders", JSON.stringify(purchaseOrders));
        changed = true;
      }
    } catch (e) {
      console.error("Firebase purchase orders sync failed:", e);
    }
  } else if (isBackendOnline) {
    try {
      const response = await fetch(`${API_BASE}/purchase-orders`);
      if (response.ok) {
        const data = await response.json();
        if (data.length !== purchaseOrders.length || JSON.stringify(data) !== JSON.stringify(purchaseOrders)) {
          purchaseOrders = data;
          localStorage.setItem("lab_purchase_orders", JSON.stringify(purchaseOrders));
          changed = true;
        }
      }
    } catch (e) {
      console.error("Backend purchase orders sync failed:", e);
    }
  }

  // 3. Update UI if anything changed
  if (changed) {
    updateBudgetUI();
    const poTable = document.getElementById("purchaseOrdersTableBody");
    if (poTable) {
      renderOrdersTable();
    }
  }
}

function setupPurchaseOrders() {
  const form = document.getElementById("purchaseOrderForm");
  const poUnitPrice = document.getElementById("poUnitPrice");
  const poQuantity = document.getElementById("poQuantity");
  const poDiscount = document.getElementById("poDiscount");
  const poTotalPrice = document.getElementById("poTotalPrice");
  const btnReset = document.getElementById("btnResetPurchaseOrder");
 
  if (poUnitPrice && poQuantity && poTotalPrice) {
    const calculateTotal = () => {
      const price = parseFloat(poUnitPrice.value) || 0;
      const qty = parseInt(poQuantity.value) || 0;
      const discount = poDiscount ? (parseFloat(poDiscount.value) || 0) : 0;
      const total = price * qty * (1 - discount / 100);
      poTotalPrice.value = total.toFixed(2);
    };
 
    poUnitPrice.addEventListener("input", calculateTotal);
    poQuantity.addEventListener("input", calculateTotal);
    if (poDiscount) {
      poDiscount.addEventListener("input", calculateTotal);
    }
  }
 
  if (btnReset && form) {
    btnReset.addEventListener("click", () => {
      form.reset();
      if (poTotalPrice) poTotalPrice.value = "0.00";
    });
  }
 
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
 
      const code = document.getElementById("poProductCode").value.trim();
      const name = document.getElementById("poProductName").value.trim();
      const unitPrice = parseFloat(document.getElementById("poUnitPrice").value) || 0;
      const quantity = parseInt(document.getElementById("poQuantity").value) || 1;
      const discount = parseFloat(document.getElementById("poDiscount").value) || 0;
 
      const newDraftItem = {
        id: "draft-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
        code,
        name,
        unitPrice,
        quantity,
        totalPrice: unitPrice * quantity * (1 - discount / 100),
        discount
      };
 
      purchaseOrderDrafts.push(newDraftItem);
      
      form.reset();
      if (poTotalPrice) poTotalPrice.value = "0.00";
 
      showToast("เพิ่มรายการสินค้าลงตารางชั่วคราวสำเร็จ", "success");
      renderPoDrafts();
      
      const firstInput = document.getElementById("poProductCode");
      if (firstInput) firstInput.focus();
    });
  }

  // Setup Budget Inline Editor
  const btnEditAnnualBudget = document.getElementById("btnEditAnnualBudget");
  const btnSaveAnnualBudget = document.getElementById("btnSaveAnnualBudget");
  const btnCancelAnnualBudget = document.getElementById("btnCancelAnnualBudget");
  const containerAnnualBudget = document.getElementById("containerAnnualBudget");
  const annualBudgetEditForm = document.getElementById("annualBudgetEditForm");
  const txtAnnualBudget = document.getElementById("txtAnnualBudget");

  if (btnEditAnnualBudget && containerAnnualBudget && annualBudgetEditForm && txtAnnualBudget) {
    btnEditAnnualBudget.addEventListener("click", () => {
      txtAnnualBudget.value = annualBudget;
      containerAnnualBudget.style.display = "none";
      annualBudgetEditForm.style.display = "flex";
      txtAnnualBudget.focus();
    });
  }

  if (btnSaveAnnualBudget && containerAnnualBudget && annualBudgetEditForm && txtAnnualBudget) {
    btnSaveAnnualBudget.addEventListener("click", () => {
      const newBudget = parseFloat(txtAnnualBudget.value);
      if (isNaN(newBudget) || newBudget < 0) {
        showToast("กรุณากรอกงบประมาณที่ถูกต้อง", "error");
        return;
      }
      annualBudget = newBudget;
      localStorage.setItem("lab_annual_budget", annualBudget.toString());
      syncBudgetToBackend();
      containerAnnualBudget.style.display = "flex";
      annualBudgetEditForm.style.display = "none";
      showToast("แก้ไขงบประมาณประจำปีสำเร็จ", "success");
      updateUI();
    });
  }

  if (btnCancelAnnualBudget && containerAnnualBudget && annualBudgetEditForm) {
    btnCancelAnnualBudget.addEventListener("click", () => {
      containerAnnualBudget.style.display = "flex";
      annualBudgetEditForm.style.display = "none";
    });
  }

  // Setup Commit Draft Button
  const btnCommit = document.getElementById("btnCommitPoDraft");
  if (btnCommit) {
    btnCommit.addEventListener("click", () => {
      if (purchaseOrderDrafts.length === 0) return;

      let subtotal = 0;
      purchaseOrderDrafts.forEach(item => {
        subtotal += item.totalPrice;
      });

      let totalSpent = 0;
      purchaseOrders.forEach(order => {
        totalSpent += order.totalPrice;
      });
      const remainingBudget = annualBudget - totalSpent;

      if (subtotal > remainingBudget) {
        const exceededAmount = subtotal - remainingBudget;
        const confirmSave = confirm(
          `คำเตือน: ราคารวมการสั่งซื้อนี้ (${subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท) ` +
          `เกินงบประมาณประจำปีคงเหลือ (${remainingBudget.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท) ` +
          `เป็นจำนวน ${exceededAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท\n\n` +
          `คุณยังต้องการทำรายการบันทึกสั่งซื้อต่อไปหรือไม่?`
        );
        if (!confirmSave) return;
      }

      purchaseOrderDrafts.forEach(draft => {
        draft.id = "ord-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
        draft.date = new Date().toISOString().split('T')[0];
        purchaseOrders.push(draft);
      });

      localStorage.setItem("lab_purchase_orders", JSON.stringify(purchaseOrders));
      syncPurchaseOrdersToBackend();
      purchaseOrderDrafts = [];

      renderPoDrafts();
      updateUI();
      showToast("บันทึกรายการสั่งซื้อทั้งหมดสำเร็จ", "success");
    });
  }
}

window.deleteDraftItem = function(index) {
  purchaseOrderDrafts.splice(index, 1);
  renderPoDrafts();
  showToast("ลบรายการชั่วคราวสำเร็จ", "success");
};

window.renderPoDrafts = function() {
  const container = document.getElementById("poDraftContainer");
  const listEl = document.getElementById("poDraftList");
  const totalEl = document.getElementById("poDraftTotal");
  const btnCommitText = document.getElementById("btnCommitPoDraftText");

  if (!container || !listEl || !totalEl || !btnCommitText) return;

  if (purchaseOrderDrafts.length === 0) {
    container.style.display = "none";
    return;
  }

  container.style.display = "block";

  let html = "";
  let subtotal = 0;

  purchaseOrderDrafts.forEach((item, index) => {
    subtotal += item.totalPrice;
    html += `
      <div class="draft-item">
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <span style="font-weight: 600; color: var(--text-main); text-align: left;">${escapeHTML(item.name)}</span>
          <span style="font-size: 11px; color: var(--text-muted); font-family: monospace; text-align: left;">
            <span style="font-family: monospace;">${escapeHTML(item.code)}</span> • ${item.quantity} x ${item.unitPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บ.
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-weight: 700; color: var(--text-main);">${item.totalPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บ.</span>
          <button type="button" class="action-icon-btn delete" onclick="deleteDraftItem(${index})" style="padding: 4px; width: 28px; height: 28px; border: none; background: transparent; cursor: pointer;" title="ลบรายการนี้">
            <i data-lucide="trash-2" style="width: 14px; height: 14px; color: var(--accent-red);"></i>
          </button>
        </div>
      </div>
    `;
  });

  listEl.innerHTML = html;
  totalEl.innerText = subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " บาท";
  btnCommitText.innerText = `บันทึกใบสั่งซื้อทั้งหมด (${purchaseOrderDrafts.length} รายการ)`;

  lucide.createIcons();
};

function updateBudgetUI() {
  // Load annual budget
  const localBudget = localStorage.getItem("lab_annual_budget");
  annualBudget = localBudget ? parseFloat(localBudget) : 100000;

  // Calculate total spent
  let totalSpent = 0;
  purchaseOrders.forEach(order => {
    totalSpent += order.totalPrice;
  });

  // Calculate remaining
  const remainingBudget = annualBudget - totalSpent;

  // Update DOM
  const lblAnnualBudget = document.getElementById("lblAnnualBudget");
  const lblTotalSpent = document.getElementById("lblTotalSpent");
  const lblRemainingBudget = document.getElementById("lblRemainingBudget");
  const cardRemainingBudget = document.getElementById("cardRemainingBudget");
  const iconRemainingBudget = document.getElementById("iconRemainingBudget");

  if (lblAnnualBudget) lblAnnualBudget.innerText = annualBudget.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (lblTotalSpent) lblTotalSpent.innerText = totalSpent.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (lblRemainingBudget) lblRemainingBudget.innerText = remainingBudget.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (cardRemainingBudget && iconRemainingBudget) {
    if (remainingBudget < 0) {
      // Exceeded budget - Red
      cardRemainingBudget.style.borderColor = "var(--accent-red)";
      iconRemainingBudget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
      iconRemainingBudget.style.color = "rgb(239, 68, 68)";
    } else if (remainingBudget < (annualBudget * 0.3)) {
      // Warning low budget (< 30%) - Orange
      cardRemainingBudget.style.borderColor = "#f97316";
      iconRemainingBudget.style.backgroundColor = "rgba(249, 115, 22, 0.1)";
      iconRemainingBudget.style.color = "rgb(249, 115, 22)";
    } else {
      // Healthy budget - Green
      cardRemainingBudget.style.borderColor = "var(--border-color)";
      iconRemainingBudget.style.backgroundColor = "rgba(16, 185, 129, 0.1)";
      iconRemainingBudget.style.color = "rgb(16, 185, 129)";
    }
  }
}

function renderOrdersTable() {
  updateBudgetUI();
  const formCol = document.getElementById("purchaseOrderFormCol");
  const grid = document.getElementById("purchaseOrdersGrid");
  const isBackoffice = (userRole === "admin" || userRole === "teacher");

  const budgetStatGrid = document.getElementById("budgetStatGrid");
  if (budgetStatGrid) {
    if (isBackoffice) {
      budgetStatGrid.style.gridTemplateColumns = "380px 1fr 1fr";
      budgetStatGrid.style.gap = "30px";
    } else {
      budgetStatGrid.style.gridTemplateColumns = "repeat(3, 1fr)";
      budgetStatGrid.style.gap = "20px";
    }
  }

  if (formCol && grid) {
    if (isBackoffice) {
      formCol.style.display = "block";
      grid.style.gridTemplateColumns = "380px 1fr";
    } else {
      formCol.style.display = "none";
      grid.style.gridTemplateColumns = "1fr";
    }
  }

  const tbody = document.getElementById("purchaseOrdersTableBody");
  if (!tbody) return;

  if (purchaseOrders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px;">
          <div class="empty-state">
            <div class="empty-state-icon"><i data-lucide="shopping-cart"></i></div>
            <div class="empty-state-text">ยังไม่มีรายการสั่งซื้อ</div>
          </div>
        </td>
      </tr>
    `;
    const grandTotalEl = document.getElementById("poGrandTotal");
    if (grandTotalEl) grandTotalEl.innerText = "0.00 บาท";
    
    const actionHeaders = document.querySelectorAll(".po-action-header");
    actionHeaders.forEach(th => th.style.display = isBackoffice ? "" : "none");
    return;
  }

  const actionHeaders = document.querySelectorAll(".po-action-header");
  actionHeaders.forEach(th => th.style.display = isBackoffice ? "" : "none");

  let html = "";
  let grandTotal = 0;

  purchaseOrders.forEach(order => {
    grandTotal += order.totalPrice;
    
    let discountText = "-";
    if (typeof order.discount === 'number' && order.discount > 0) {
      discountText = `<span style="font-size: 13px; color: var(--accent-green); font-weight: 500;">ลด ${order.discount}%</span>`;
    } else if (order.budgetDiscount) {
      discountText = order.budgetDiscount;
    }

    html += `
      <tr>
        <td data-label="รหัสสินค้า" style="font-weight: 500;"><span style="font-family: monospace;">${escapeHTML(order.code)}</span></td>
        <td data-label="ชื่อสินค้า">${escapeHTML(order.name)}</td>
        <td data-label="ราคา/หน่วย" style="text-align: right;">${order.unitPrice.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td data-label="จำนวน" style="text-align: center;">${order.quantity}</td>
        <td data-label="ราคารวม" style="text-align: right; font-weight: 600;">${order.totalPrice.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td data-label="ส่วนลด">${discountText}</td>
        ${isBackoffice ? `
          <td data-label="จัดการ" style="text-align: center;">
            <button class="action-icon-btn delete" onclick="deletePurchaseOrder('${order.id}')" title="ลบรายการสั่งซื้อ">
              <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
            </button>
          </td>
        ` : `
          <td style="display: none;"></td>
        `}
      </tr>
    `;
  });

  tbody.innerHTML = html;

  const grandTotalEl = document.getElementById("poGrandTotal");
  if (grandTotalEl) {
    grandTotalEl.innerText = grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " บาท";
  }
}

window.deletePurchaseOrder = function(orderId) {
  if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการสั่งซื้อนี้?")) return;
  
  if (isFirebaseOnline) {
    db.collection("purchase_orders").doc(orderId).delete()
      .catch(e => console.error("Failed to delete purchase order from Firebase:", e));
  }
  
  purchaseOrders = purchaseOrders.filter(o => o.id !== orderId);
  localStorage.setItem("lab_purchase_orders", JSON.stringify(purchaseOrders));
  syncPurchaseOrdersToBackend();
  showToast("ลบรายการสั่งซื้อสำเร็จ", "success");
  updateUI();
};

// ==========================================================================
// ADMIN LOGIN SYSTEM
// ==========================================================================
function updateLoginUI() {
  const sidebarLoginText = document.getElementById("sidebarLoginText");
  const sidebarLoginIcon = document.getElementById("sidebarLoginIcon");
  const isBackoffice = (userRole === "admin" || userRole === "teacher");
  
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
  }

  // Redirect if on admin panel or purchase orders panel and not backoffice
  if (!isBackoffice) {
    const activePanel = document.querySelector(".panel.active");
    if (activePanel && (activePanel.id === "panel-add-item" || activePanel.id === "panel-purchase-orders" || activePanel.id === "panel-reports")) {
      navigateToPanel("dashboard");
    }
  }

  // Show/Hide Admin-Only navigation items
  const menuItemAddItem = document.getElementById("menuItemAddItem");
  const menuItemImport = document.getElementById("menuItemImport");
  const menuItemPurchaseOrders = document.getElementById("menuItemPurchaseOrders");
  const menuItemReports = document.getElementById("menuItemReports");
  if (menuItemAddItem) {
    menuItemAddItem.style.display = "block";
  }
  if (menuItemImport) {
    menuItemImport.style.display = "block";
  }
  if (menuItemPurchaseOrders) {
    menuItemPurchaseOrders.style.display = "none";
  }
  if (menuItemReports) {
    menuItemReports.style.display = isBackoffice ? "block" : "none";
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
    syncTransactionsToBackend();
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
    syncTransactionsToBackend();
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

function renderTopBorrowedChart() {
  const container = document.getElementById("chartBorrowedContainer");
  if (!container) return;

  const borrowCounts = {};
  transactions.forEach(tx => {
    const name = tx.itemName || tx.itemCode;
    if (!name) return;
    borrowCounts[name] = (borrowCounts[name] || 0) + 1;
  });

  const topBorrowed = Object.entries(borrowCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (topBorrowed.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 20px;">
        <div class="empty-state-icon" style="font-size: 24px; color: var(--text-muted);"><i data-lucide="bar-chart-2"></i></div>
        <div class="empty-state-text" style="font-size: 13px; color: var(--text-muted); margin-top: 8px;">ยังไม่มีข้อมูลการยืม</div>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  const maxCount = Math.max(...topBorrowed.map(d => d.count)) || 1;

  let svgHtml = `<svg width="100%" height="220" viewBox="0 0 450 220" style="background: transparent; font-family: var(--font-sans);">`;

  // Add gradient definitions
  svgHtml += `
    <defs>
      <linearGradient id="barGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#8b5cf6" />
        <stop offset="100%" stop-color="#3b82f6" />
      </linearGradient>
    </defs>
  `;

  topBorrowed.forEach((d, idx) => {
    const y = 15 + idx * 40;
    const barWidth = (d.count / maxCount) * 260;
    const displayName = d.name.length > 18 ? d.name.substring(0, 16) + "..." : d.name;

    svgHtml += `
      <!-- Text Label -->
      <text x="10" y="${y + 12}" fill="var(--text-main)" font-size="12.5" font-weight="500">${displayName}</text>
      
      <!-- Bar Track -->
      <rect x="140" y="${y}" width="260" height="14" rx="7" fill="#f1f5f9" />
      
      <!-- Active Bar -->
      <rect x="140" y="${y}" width="${barWidth}" height="14" rx="7" fill="url(#barGrad)">
        <animate attributeName="width" from="0" to="${barWidth}" dur="0.8s" fill="freeze" />
      </rect>
      
      <!-- Value Label -->
      <text x="${145 + barWidth}" y="${y + 12}" fill="var(--text-main)" font-size="11.5" font-weight="600">${d.count} ครั้ง</text>
    `;
  });

  svgHtml += `</svg>`;
  container.innerHTML = svgHtml;
}

function renderBookingChart() {
  const container = document.getElementById("chartBookingContainer");
  if (!container) return;

  const roomCounts = {
    "Lab 1": 0,
    "Lab 2": 0,
    "Lab 3": 0
  };

  bookings.forEach(b => {
    let roomKey = "Lab 1";
    if (b.room === "Lab 2" || b.room === "ห้องปฏิบัติการฟิสิกส์" || (b.room && b.room.includes("ฟิสิกส์"))) roomKey = "Lab 2";
    else if (b.room === "Lab 3" || b.room === "ห้องปฏิบัติการชีววิทยา" || (b.room && b.room.includes("ชีววิทยา"))) roomKey = "Lab 3";
    
    roomCounts[roomKey]++;
  });

  const maxCount = Math.max(roomCounts["Lab 1"], roomCounts["Lab 2"], roomCounts["Lab 3"]) || 1;

  let svgHtml = `<svg width="100%" height="220" viewBox="0 0 300 220" style="background: transparent; font-family: var(--font-sans);">`;

  // Add vertical gradient and shadow definitions
  svgHtml += `
    <defs>
      <linearGradient id="bookingBarGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#3f1b85" />
        <stop offset="100%" stop-color="#8b5cf6" />
      </linearGradient>
      <filter id="barShadow" x="-25%" y="-25%" width="150%" height="150%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#3f1b85" flood-opacity="0.15" />
      </filter>
    </defs>
    
    <!-- Grid Lines -->
    <line x1="20" y1="50" x2="280" y2="50" stroke="rgba(0,0,0,0.04)" stroke-width="1" stroke-dasharray="3 3" />
    <line x1="20" y1="105" x2="280" y2="105" stroke="rgba(0,0,0,0.04)" stroke-width="1" stroke-dasharray="3 3" />
    <line x1="20" y1="160" x2="280" y2="160" stroke="rgba(0,0,0,0.08)" stroke-width="1.5" />
  `;

  const labs = [
    { key: "Lab 1", name: "แล็บเคมี", x: 60 },
    { key: "Lab 2", name: "แล็บฟิสิกส์", x: 150 },
    { key: "Lab 3", name: "แล็บชีวะ", x: 240 }
  ];

  labs.forEach(lab => {
    const count = roomCounts[lab.key] || 0;
    const barHeight = (count / maxCount) * 110;
    const y = 160 - barHeight;

    svgHtml += `
      <!-- Bar Track -->
      <rect x="${lab.x - 12}" y="50" width="24" height="110" rx="12" fill="rgba(63, 27, 133, 0.04)" />
      
      <!-- Active Bar -->
      <rect x="${lab.x - 12}" y="${y}" width="24" height="${barHeight}" rx="12" fill="url(#bookingBarGrad)" filter="url(#barShadow)">
        <animate attributeName="height" from="0" to="${barHeight}" dur="0.8s" fill="freeze" />
        <animate attributeName="y" from="160" to="${y}" dur="0.8s" fill="freeze" />
      </rect>
      
      <!-- Value text -->
      <text x="${lab.x}" y="42" fill="var(--text-main)" font-size="12" font-weight="700" text-anchor="middle">${count} ครั้ง</text>
      
      <!-- X-Axis Label -->
      <text x="${lab.x}" y="185" fill="var(--text-muted)" font-size="12" font-weight="600" text-anchor="middle">${lab.name}</text>
    `;
  });

  svgHtml += `</svg>`;
  container.innerHTML = svgHtml;
}

function renderAnalyticsCharts() {
  renderBookingChart();
}

function setupPrintReport() {
  const btn = document.getElementById("btnPrintReport");
  if (btn) {
    btn.addEventListener("click", () => {
      printComprehensiveInventoryReport();
    });
  }
}

function printComprehensiveInventoryReport() {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    showToast("ไม่สามารถเปิดหน้าต่างพิมพ์ได้ กรุณาเปิดสิทธิ์การใช้งาน Pop-up บนบราวเซอร์", "error");
    return;
  }

  // Calculate statistics
  const totalItems = items.length;
  let expiredCount = 0;
  let lowStockCount = 0;
  let nearExpiryCount = 0;
  let damagedCount = 0;
  let repairCount = 0;

  items.forEach(item => {
    const status = getItemStatus(item);
    if (status === "expired") expiredCount++;
    if (status === "low-stock") lowStockCount++;
    if (status === "near-expiry") nearExpiryCount++;
    if (item.damagedQty) damagedCount += Number(item.damagedQty);
    if (item.repairQty) repairCount += Number(item.repairQty);
  });

  const expiredItems = items.filter(item => getItemStatus(item) === "expired");
  const lowStockItems = items.filter(item => getItemStatus(item) === "low-stock");
  const recentTxs = [...transactions].sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate)).slice(0, 10);

  let html = `
    <html>
      <head>
        <title>รายงานสรุปสถานะคลังพัสดุและเคมีภัณฑ์ - ${new Date().toLocaleDateString('th-TH')}</title>
        <style>
          body {
            font-family: 'Prompt', sans-serif;
            color: #1e293b;
            padding: 40px;
            background-color: #ffffff;
            line-height: 1.5;
          }
          .report-header {
            text-align: center;
            border-bottom: 3px double #3f1b85;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .report-header h1 {
            margin: 0 0 10px 0;
            color: #3f1b85;
            font-size: 24px;
          }
          .report-header p {
            margin: 0;
            color: #64748b;
            font-size: 14px;
          }
          .report-meta {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            color: #475569;
            margin-bottom: 30px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .stats-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            background-color: #f8fafc;
          }
          .stats-card.alert {
            border-color: #fecaca;
            background-color: #fef2f2;
          }
          .stats-card.warning {
            border-color: #fed7aa;
            background-color: #fff7ed;
          }
          .stats-value {
            font-size: 24px;
            font-weight: 700;
            color: #1e293b;
            margin-top: 5px;
          }
          .stats-card.alert .stats-value {
            color: #ef4444;
          }
          .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #3f1b85;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 8px;
            margin-top: 30px;
            margin-bottom: 15px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #cbd5e1;
            padding: 8px 10px;
            text-align: left;
          }
          th {
            background-color: #f1f5f9;
            font-weight: 600;
          }
          .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
          }
          .badge-red { background-color: #fee2e2; color: #ef4444; }
          .badge-orange { background-color: #ffedd5; color: #f97316; }
          .badge-yellow { background-color: #fef3c7; color: #d97706; }
          .badge-green { background-color: #d1fae5; color: #10b981; }
          .signature-section {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
          }
          .signature-box {
            text-align: center;
            width: 200px;
          }
          .signature-line {
            border-bottom: 1px solid #94a3b8;
            height: 40px;
            margin-bottom: 10px;
          }
          @media print {
            body {
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <h1>รายงานสรุปสถานะคลังพัสดุและเคมีภัณฑ์</h1>
          <p>ระบบบริหารจัดการห้องปฏิบัติการเคมีและอุปกรณ์วิทยาศาสตร์</p>
        </div>

        <div class="report-meta">
          <div><strong>วันที่ออกรายงาน:</strong> ${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} น.</div>
          <div><strong>ผู้ออกรายงาน:</strong> ผู้ดูแลระบบ (Admin)</div>
        </div>

        <div class="stats-grid">
          <div class="stats-card">
            <div>รายการพัสดุทั้งหมด</div>
            <div class="stats-value">${totalItems} รายการ</div>
          </div>
          <div class="stats-card alert">
            <div>หมดอายุแล้ว</div>
            <div class="stats-value">${expiredCount} รายการ</div>
          </div>
          <div class="stats-card warning">
            <div>สินค้าใกล้หมดคลัง</div>
            <div class="stats-value">${lowStockCount} รายการ</div>
          </div>
          <div class="stats-card warning">
            <div>ใกล้หมดอายุ (ภายใน 30 วัน)</div>
            <div class="stats-value">${nearExpiryCount} รายการ</div>
          </div>
          <div class="stats-card alert">
            <div>ชำรุดเสียหาย</div>
            <div class="stats-value">${damagedCount} ชิ้น</div>
          </div>
          <div class="stats-card">
            <div>ส่งซ่อมบำรุง</div>
            <div class="stats-value">${repairCount} ชิ้น</div>
          </div>
        </div>

        <!-- Expired Items Section -->
        \${expiredItems.length > 0 ? \`
          <div class="section-title">รายการเคมีภัณฑ์หมดอายุ</div>
          <table>
            <thead>
              <tr>
                <th>รหัส</th>
                <th>ชื่อเคมีภัณฑ์</th>
                <th>จำนวนคงเหลือ</th>
                <th>หน่วย</th>
                <th>วันหมดอายุ</th>
                <th>สถานที่เก็บ</th>
              </tr>
            </thead>
            <tbody>
              \${expiredItems.map(item => \`
                <tr>
                  <td>\${item.code}</td>
                  <td>\${item.name}</td>
                  <td>\${item.qty}</td>
                  <td>\${item.unit}</td>
                  <td style="color: #ef4444; font-weight: 500;">\${item.expiry ? formatThaiDate(item.expiry) : "-"}</td>
                  <td>\${item.room || "-"} > \${item.cabinet || "-"}</td>
                </tr>
              \`).join("")}
            </tbody>
          </table>
        \` : ""}

        <!-- Low Stock Items Section -->
        \${lowStockItems.length > 0 ? \`
          <div class="section-title">รายการพัสดุใกล้หมดคลัง (Low Stock)</div>
          <table>
            <thead>
              <tr>
                <th>รหัส</th>
                <th>ชื่อสาร/อุปกรณ์</th>
                <th>จำนวนคงเหลือ</th>
                <th>จุดแจ้งเตือนขั้นต่ำ</th>
                <th>หน่วย</th>
                <th>สถานที่เก็บ</th>
              </tr>
            </thead>
            <tbody>
              \${lowStockItems.map(item => \`
                <tr>
                  <td>\${item.code}</td>
                  <td>\${item.name}</td>
                  <td style="color: #f97316; font-weight: 600;">\${item.qty}</td>
                  <td>\${item.minAlert}</td>
                  <td>\${item.unit}</td>
                  <td>\${item.room || "-"} > \${item.cabinet || "-"}</td>
                </tr>
              \`).join("")}
            </tbody>
          </table>
        \` : ""}

        <!-- Full Inventory Summary Table -->
        <div class="section-title">สรุปรายการคลังพัสดุทั้งหมด</div>
        <table>
          <thead>
            <tr>
              <th>รหัส</th>
              <th>ชื่อสาร/อุปกรณ์</th>
              <th>หมวดหมู่</th>
              <th>จำนวนคงเหลือ</th>
              <th>หน่วย</th>
              <th>สถานที่จัดเก็บ</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            \${items.map(item => {
              const status = getItemStatus(item);
              let statusLabel = '<span class="badge badge-green">ปกติ</span>';
              if (status === "expired") statusLabel = '<span class="badge badge-red">หมดอายุ</span>';
              else if (status === "near-expiry") statusLabel = '<span class="badge badge-yellow">ใกล้หมดอายุ</span>';
              else if (status === "low-stock") statusLabel = '<span class="badge badge-orange">ใกล้หมด</span>';

              return \`
                <tr>
                  <td>\${item.code}</td>
                  <td>\${item.name}</td>
                  <td>\${item.category}</td>
                  <td>\${item.qty}</td>
                  <td>\${item.unit}</td>
                  <td>\${item.room || "-"} / \${item.cabinet || "-"} / \${item.shelf || "-"}</td>
                  <td>\${statusLabel}</td>
                </tr>
              \`;
            }).join("")}
          </tbody>
        </table>

        <!-- Recent Borrow/Return History -->
        <div class="section-title">ประวัติการยืม-คืนล่าสุด (10 รายการล่าสุด)</div>
        <table>
          <thead>
            <tr>
              <th>รหัสรายการ</th>
              <th>ชื่อผู้ยืม</th>
              <th>ชื่อพัสดุ/เคมีภัณฑ์</th>
              <th>จำนวน</th>
              <th>วันที่ยืม</th>
              <th>วันที่คืน</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            \${recentTxs.map(tx => \`
              <tr>
                <td>\${tx.id}</td>
                <td>\${tx.borrower}</td>
                <td>\${tx.itemName}</td>
                <td>\${tx.qty} \${tx.itemUnit || "ชิ้น"}</td>
                <td>\${tx.borrowDate ? formatThaiDate(tx.borrowDate) : "-"}</td>
                <td>\${tx.returnDate ? formatThaiDate(tx.returnDate) : "-"}</td>
                <td>
                  <span class="badge \${tx.status === "returned" ? "badge-green" : "badge-orange"}">
                    \${tx.status === "returned" ? "คืนแล้ว" : "ยังไม่คืน"}
                  </span>
                </td>
              </tr>
            \`).join("")}
          </tbody>
        </table>

        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line"></div>
            <div>( ลงชื่อ )...................................................</div>
            <div style="margin-top: 5px;">ผู้พิมพ์รายงาน</div>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <div>( ลงชื่อ )...................................................</div>
            <div style="margin-top: 5px;">เจ้าหน้าที่ดูแลห้องปฏิบัติการ</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

function setupDashboardReports() {
  const btnInv = document.getElementById("dashboardBtnExportInventory");
  const btnTx = document.getElementById("dashboardBtnExportTransactions");
  const btnPrint = document.getElementById("dashboardBtnPrintReport");
  
  if (btnInv) {
    btnInv.addEventListener("click", () => {
      const originalBtn = document.getElementById("btnExportCSV");
      if (originalBtn) {
        originalBtn.click();
      }
    });
  }
  
  if (btnTx) {
    btnTx.addEventListener("click", () => {
      if (transactions.length === 0) {
        showToast("ไม่มีประวัติการยืม-คืนที่สามารถส่งออกได้", "error");
        return;
      }
      const headers = [
        "รหัสรายการ",
        "รหัสพัสดุ",
        "ชื่อพัสดุ/เคมีภัณฑ์",
        "ประเภท",
        "จำนวน",
        "หน่วย",
        "ผู้ยืม",
        "ผู้ทำรายการ",
        "วันที่ยืม",
        "กำหนดคืน",
        "วันที่คืนจริง",
        "สถานะ",
        "หมายเหตุ"
      ];
      const rows = transactions.map(tx => [
        tx.id || "",
        tx.itemCode || "",
        tx.itemName || "",
        tx.itemCategory || "",
        tx.qty || 0,
        tx.itemUnit || "ชิ้น",
        tx.borrower || "",
        tx.officer || "",
        tx.borrowDate || "",
        tx.dueDate || "",
        tx.returnDate || "",
        tx.status || "",
        tx.note || ""
      ]);
      exportDataToCSV(`borrow_return_history_all_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
      showToast("ส่งออกประวัติการยืม-คืนทั้งหมดสำเร็จ!", "success");
    });
  }
  
  if (btnPrint) {
    btnPrint.addEventListener("click", () => {
      printComprehensiveInventoryReport();
    });
  }
}

function areIncompatible(g1, g2) {
  if (!g1 || !g2) return false;
  if (g1 === "X" || g2 === "X") return true; // Group X is incompatible with everything, including itself
  if (g1 === "B" && g2 !== "B") return true;
  if (g2 === "B" && g1 !== "B") return true;
  if (g1 === "I" && g2 !== "I") return true;
  if (g2 === "I" && g1 !== "I") return true;
  if (g1 === "K" && g2 !== "K") return true;
  if (g2 === "K" && g1 !== "K") return true;
  
  // Specific pairwise incompatibility rules based on poster and Stanford storage compatibility guidelines
  const incompatibilities = {
    "A": ["C", "D", "F", "E"],
    "C": ["A", "D", "F", "E"],
    "D": ["A", "C", "E"],
    "F": ["A", "C", "E", "L"],
    "E": ["A", "C", "D", "F", "L"],
    "L": ["E", "F", "C"]
  };
  
  if (incompatibilities[g1] && incompatibilities[g1].includes(g2)) return true;
  if (incompatibilities[g2] && incompatibilities[g2].includes(g1)) return true;
  
  return false;
}

function setupGhsSuggestions() {
  const itemNameInput = document.getElementById("itemName");
  const itemCategorySelect = document.getElementById("itemCategory");
  const chemTypeSelect = document.getElementById("itemChemicalType");
  const recBadge = document.getElementById("compatibilityRecBadge");
  const wasteCard = document.getElementById("wasteClassificationCard");
  
  if (!itemNameInput || !itemCategorySelect || !recBadge) return;
  
  // Storage Rec Modal Elements
  const storageRecModal = document.getElementById("storageRecModal");
  const storageRecModalClose = document.getElementById("storageRecModalClose");
  const storageRecModalCloseBtn = document.getElementById("storageRecModalCloseBtn");
  const storageRecModalBody = document.getElementById("storageRecModalBody");
  const storageRecModalHeader = document.getElementById("storageRecModalHeader");

  function closeRecModal() {
    if (storageRecModal) {
      storageRecModal.classList.remove("active");
    }
  }

  if (storageRecModalClose) storageRecModalClose.addEventListener("click", closeRecModal);
  if (storageRecModalCloseBtn) storageRecModalCloseBtn.addEventListener("click", closeRecModal);
  if (storageRecModal) {
    storageRecModal.addEventListener("click", (e) => {
      if (e.target === storageRecModal) {
        closeRecModal();
      }
    });
  }

  window.openCompatibilityPopup = function() {
    if (!window.currentStorageRecommendation || !storageRecModal || !storageRecModalBody) return;
    
    storageRecModalBody.innerHTML = window.currentStorageRecommendation.text;
    
    if (storageRecModalHeader) {
      storageRecModalHeader.style.background = window.currentStorageRecommendation.borderColor;
    }
    
    storageRecModal.classList.add("active");
  };
  
  function getGhsSuggestions(name) {
    const suggestions = [];
    const nameLower = name.toLowerCase();
    
    // Flammable
    const flammablePatterns = ["ไวไฟ", "เอทานอล", "มีทานอล", "เมทานอล", "แอลกอฮอล์", "อะซิโตน", "โทลูอีน", "ไซลีน", "เฮกเซน", "ไฮโดรเจน", "บิวเทน", "โพรเพน", "อีเธอร์", "ฟอสฟอรัส", "โซเดียม", "flammable", "ethanol", "methanol", "alcohol", "acetone", "toluene", "xylene", "hexane", "hydrogen", "butane", "propane", "ether", "gasoline", "solvent"];
    if (flammablePatterns.some(p => nameLower.includes(p))) {
      suggestions.push("flammable");
    }
    
    // Corrosive
    const corrosivePatterns = ["กรด", "ไฮโดรคลอริก", "ซัลฟิวริก", "ไนตริก", "อะซิติก", "เบส", "ด่าง", "โซเดียมไฮดรอกไซด์", "แอมโมเนีย", "โพแทสเซียมไฮดรอกไซด์", "acid", "hydrochloric", "sulfuric", "nitric", "acetic", "base", "alkali", "hydroxide", "ammonia", "corrosive"];
    if (corrosivePatterns.some(p => nameLower.includes(p))) {
      suggestions.push("corrosive");
    }
    
    // Toxic
    const toxicPatterns = ["พิษ", "ไซยาไนด์", "คลอรีน", "สารหนู", "ปรอท", "เมทานอล", "ฟอร์มาลิน", "ฟอร์มาลดีไฮด์", "เบนซีน", "toxic", "poison", "cyanide", "chlorine", "arsenic", "mercury", "benzene", "formalin", "formaldehyde"];
    if (toxicPatterns.some(p => nameLower.includes(p))) {
      suggestions.push("toxic");
    }
    
    // Explosive
    const explosivePatterns = ["ระเบิด", "ดินปืน", "ไนโตร", "แอมโมเนียมไนเตรต", "explosive", "nitro", "tnt", "dynamite", "azide", "picric"];
    if (explosivePatterns.some(p => nameLower.includes(p))) {
      suggestions.push("explosive");
    }
    
    // Oxidizing
    const oxidizingPatterns = ["ออกซิไดซ์", "เปอร์ออกไซด์", "ด่างทับทิม", "โพแทสเซียมเปอร์แมงกาเนต", "ไนเตรต", "คลอเรต", "oxidizing", "oxidizer", "peroxide", "permanganate", "nitrate", "chlorate"];
    if (oxidizingPatterns.some(p => nameLower.includes(p))) {
      suggestions.push("oxidizing");
    }
    
    // Compressed gas
    const gasPatterns = ["ก๊าซความดัน", "แก๊สความดัน", "ถังแก๊ส", "ถังก๊าซ", "ไนโตรเจนเหลว", "compressed gas", "cylinder", "liquid nitrogen"];
    if (gasPatterns.some(p => nameLower.includes(p))) {
      suggestions.push("compressed_gas");
    }
    
    // Irritant
    const irritantPatterns = ["ระคายเคือง", "คลอรีน", "แอมโมเนีย", "ฟีนอล", "irritant", "irritating"];
    if (irritantPatterns.some(p => nameLower.includes(p))) {
      suggestions.push("irritant");
    }
    
    // Health hazard
    const healthPatterns = ["มะเร็ง", "กลายพันธุ์", "สารก่อมะเร็ง", "เบนซีน", "ฟอร์มาลดีไฮด์", "carcinogen", "mutagen", "health hazard"];
    if (healthPatterns.some(p => nameLower.includes(p))) {
      suggestions.push("health_hazard");
    }
    
    // Environmental
    const envPatterns = ["สิ่งแวดล้อม", "เป็นพิษต่อสัตว์น้ำ", "คอปเปอร์ซัลเฟต", "โลหะหนัก", "environmental", "toxic to aquatic", "eco-toxic", "pollutant"];
    if (envPatterns.some(p => nameLower.includes(p))) {
      suggestions.push("environmental");
    }
    
    return suggestions;
  }
  
  function applyGhsSuggestions() {
    const category = itemCategorySelect.value;
    const wasteCard = document.getElementById("wasteClassificationCard");

    if (category !== "สารเคมี") {
      if (recBadge) {
        recBadge.style.display = "none";
        recBadge.innerHTML = "";
      }
      if (wasteCard) {
        wasteCard.style.display = "none";
      }
      return;
    } else {
      if (wasteCard) {
        wasteCard.style.display = "block";
      }
    }
    
    const name = itemNameInput.value.trim();
    if (!name) {
      if (recBadge) {
        recBadge.style.display = "none";
        recBadge.innerHTML = "";
      }
      return;
    }
    
    const suggestions = getGhsSuggestions(name);
    
    // Auto-check suggestion checkboxes
    document.querySelectorAll('input[name="ghs"]').forEach(cb => {
      if (suggestions.includes(cb.value)) {
        cb.checked = true;
      }
    });

    // Compatibility group suggestions & Auto-hazard dropdown select
    if (recBadge && chemTypeSelect) {
      const nameLower = name.toLowerCase();
      
      const incompatibleAllPatterns = ["acrolein", "benzyl azide", "picric acid", "phosphorus", "sodium azide", "sodium hydrogen sulfide", "กรดพิกริก", "ฟอสฟอรัส", "โซเดียมเอไซด์"];
      const explosivePatterns = ["nitroguanidine", "tetrazene", "urea nitrate", "explosive", "สารระเบิด", "ไนโทรกัวนิดีน", "ยูเรียไนเตรต"];
      const waterReactivePatterns = ["benzoyl chloride", "lithium aluminum hydride", "lithium metal", "methyl lithium", "methanesulfonyl chloride", "potassium metal", "sodium borohydride", "sodium sulfide", "zinc dust", "pyrophoric", "water reactive", "ทำปฏิกิริยากับน้ำ", "ลุกติดไฟได้เอง", "โซเดียมโบโรไฮไดรด์", "ลิเทียมอะลูมิเนียมไฮไดรด์", "ผงสังกะสี", "โลหะโซเดียม", "โลหะโพแทสเซียม"];
      const strongOxidizingAcidPatterns = ["chromic acid", "hno3", "nitric acid", "perchloric acid", "hclo4", "periodic acid", "sulfuric acid", "h2so4", "กรดซัลฟิวริก", "กรดไนตริก", "กรดเปอร์คลอริก", "กรดโครมิก"];
      const inorganicAcidPatterns = ["hydrochloric acid", "hcl", "hydrofluoric acid", "hf", "phosphoric acid", "h3po4", "กรดไฮโดรคลอริก", "กรดเกลือ", "กรดฟอสฟอริก", "กรดไฮโดรฟลูออริก", "กรดอนินทรีย์"];
      const organicAcidPatterns = ["acetic acid", "benzoic acid", "citric acid", "edta", "formic acid", "maleic acid", "propionic acid", "succinic acid", "trifluoroacetic acid", "tfa", "acetic anhydride", "กรดอะซิติก", "กรดซิตริก", "กรดฟอร์มิก", "กรดอินทรีย์"];
      const organicBasePatterns = ["benzylamine", "diethylamine", "ethanolamine", "imidazole", "piperidine", "pyridine", "triethanolamine", "เบสอินทรีย์", "เอทาโนลามีน", "ไพริดีน", "อิมิดาโซล"];
      const inorganicBasePatterns = ["ammonium hydroxide", "barium hydroxide", "calcium hydroxide", "cesium hydroxide", "lithium hydroxide", "potassium hydroxide", "sodium hydroxide", "naoh", "koh", "ca(oh)2", "เบสอนินทรีย์", "โซเดียมไฮดรอกไซด์", "โพแทสเซียมไฮดรอกไซด์", "แอมโมเนียมไฮดรอกไซด์"];
      const oxidizerPatterns = ["aluminum nitrate", "ammonium persulfate", "calcium nitrate", "hydrogen peroxide", "silver nitrate", "sodium chlorate", "sodium dichromate", "sodium hypochlorite", "sodium nitrate", "oxidizer", "peroxide", "nitrate", "chlorate", "ออกซิไดเซอร์", "ไฮโดรเจนเปอร์ออกไซด์", "ไนเตรต", "คลอเรต", "เปอร์ออกไซด์"];
      const flammablePatterns = ["formamide", "glycerol", "hexane", "methanol", "dmf", "dimethylformamide", "phenol", "propanol", "sds solid", "tetrahydrofuran", "thf", "toluene", "xylene", "ethanol", "acetone", "ethyl acetate", "acetonitrile", "butanol", "dichloromethane", "dcm", "ether", "alcohol", "solvent", "flammable", "ตัวทำละลาย", "สารไวไฟ", "เอทานอล", "เมทานอล", "โทลูอีน", "ไซลีน", "เฮกเซน"];
      const generalPatterns = ["acrylamide", "agarose", "ammonium acetate", "ammonium chloride", "boric acid", "calcium chloride", "magnesium sulfate", "sodium acetate", "sds solution", "sodium dodecyl sulfate", "ทั่วไป", "เกลือ", "โซเดียมอะซิเตต", "แคลเซียมคลอไรด์", "แมกนีเซียมซัลเฟต", "กรดบอริก"];

      let group = "G";
      let groupLabel = "กลุ่ม G - สารเคมีทั่วไปที่ไม่ว่องไว";
      let recText = "";
      let bgColor = "rgba(16, 185, 129, 0.08)";
      let textColor = "#047857";
      let borderColor = "#10b981";

      if (incompatibleAllPatterns.some(p => nameLower.includes(p))) {
        group = "X";
        groupLabel = "กลุ่ม X - สารที่ไม่เข้ากันกับสารอื่น";
        recText = `<b>⚠️ คำแนะนำการจัดเก็บ (กลุ่ม X):</b><br>` +
                  `สารกลุ่มนี้มีความไวต่อปฏิกิริยาเป็นพิเศษ และสามารถทำปฏิกิริยารุนแรงกับสารเคมีอื่นๆ แทบทุกชนิด<br>` +
                  `• <b>วิธีจัดเก็บ:</b> <b>ต้องจัดเก็บแยกเดี่ยวแยกขาดจากสารเคมีอื่นๆ ทั้งหมด (รวมถึงสารในกลุ่ม X ตัวอื่นๆ ด้วย)</b> โดยแนะนำให้เก็บในภาชนะป้องกันสองชั้น (Double Containment) หรือตู้เฉพาะตัวเดี่ยวๆ`;
        bgColor = "rgba(75, 85, 99, 0.08)";
        textColor = "#374151";
        borderColor = "#4b5563";
      } else if (explosivePatterns.some(p => nameLower.includes(p))) {
        group = "K";
        groupLabel = "กลุ่ม K - สารระเบิดได้ที่มีความคงตัว";
        recText = `<b>⚠️ คำแนะนำการจัดเก็บ (กลุ่ม K):</b><br>` +
                  `สารระเบิดได้ที่มีความคงตัวในการจัดเก็บปกติ แต่ยังคงไวต่อความร้อน แรงกระแทก ประกายไฟ หรือการเสียดสี<br>` +
                  `• <b>วิธีจัดเก็บ:</b> <b>ต้องจัดเก็บในตู้เก็บสารระเบิดเฉพาะที่มั่นคงแข็งแรง มีการควบคุมอุณหภูมิและความปลอดภัยสูง</b> แยกห่างจากกลุ่มสารเคมีอื่นๆ ทั้งหมดเด็ดขาด`;
        bgColor = "rgba(245, 158, 11, 0.08)";
        textColor = "#d97706";
        borderColor = "#f59e0b";
      } else if (waterReactivePatterns.some(p => nameLower.includes(p))) {
        group = "B";
        groupLabel = "กลุ่ม B - สารที่ทำปฏิกิริยากับน้ำ/ลุกติดไฟเอง";
        recText = `<b>⚠️ คำแนะนำการจัดเก็บ (กลุ่ม B):</b><br>` +
                  `สารกลุ่มนี้ไวต่ออากาศและความชื้นอย่างมาก สามารถลุกไหม้ได้เองในอากาศ หรือทำปฏิกิริยากับน้ำแล้วให้แก๊สไวไฟสูง<br>` +
                  `• <b>วิธีจัดเก็บ:</b> <b>ต้องจัดเก็บแยกเดี่ยวในตู้นิรภัยเฉพาะสารทำปฏิกิริยากับน้ำ/ลุกติดไฟเอง</b> ห้ามจัดเก็บร่วมกับสารกลุ่มอื่นๆ หรือจัดเก็บใกล้แหล่งน้ำหรือความชื้นเด็ดขาด`;
        bgColor = "rgba(239, 68, 68, 0.08)";
        textColor = "#dc2626";
        borderColor = "#ef4444";
      } else if (strongOxidizingAcidPatterns.some(p => nameLower.includes(p))) {
        group = "I";
        groupLabel = "กลุ่ม I - สารออกซิไดเซอร์ที่เป็นกรดแก่";
        recText = `<b>⚠️ คำแนะนำการจัดเก็บ (กลุ่ม I):</b><br>` +
                  `กรดแก่ที่มีฤทธิ์ออกซิไดซ์สูงมาก ก่อให้เกิดปฏิกิริยารุนแรงและลุกไหม้ได้เมื่อสัมผัสกับสารอินทรีย์หรือตัวทำละลาย<br>` +
                  `• <b>วิธีจัดเก็บ:</b> <b>ต้องจัดเก็บแยกจากกลุ่มอื่นๆ ทั้งหมดอย่างเด็ดขาด</b> (โดยเฉพาะห้ามเก็บรวมกับกรดอินทรีย์กลุ่ม D หรือตัวทำละลายกลุ่ม L) แนะนำให้ใช้ถาดรองสารเคมีเฉพาะกลุ่มเพื่อแยกทางกายภาพ`;
        bgColor = "rgba(220, 38, 38, 0.08)";
        textColor = "#991b1b";
        borderColor = "#dc2626";
      } else if (inorganicAcidPatterns.some(p => nameLower.includes(p))) {
        group = "F";
        groupLabel = "กลุ่ม F - กรดอนินทรีย์";
        recText = `<b>⚠️ คำแนะนำการจัดเก็บ (กลุ่ม F):</b><br>` +
                  `กรดอนินทรีย์กัดกร่อนสูง ทำปฏิกิริยารุนแรงคายความร้อนมากกับเบส และทำปฏิกิริยากับสารออกซิไดซ์<br>` +
                  `• <b>วิธีจัดเก็บ:</b> จัดเก็บในตู้เก็บสารกัดกร่อนเฉพาะสำหรับกรด (Acid Cabinet) แยกห่างจากเบส (กลุ่ม A, C) สารไวไฟ (กลุ่ม L) และสารออกซิไดเซอร์ (กลุ่ม E, I)`;
        bgColor = "rgba(249, 115, 22, 0.08)";
        textColor = "#c2410c";
        borderColor = "#f97316";
      } else if (organicAcidPatterns.some(p => nameLower.includes(p))) {
        group = "D";
        groupLabel = "กลุ่ม D - กรดอินทรีย์";
        recText = `<b>⚠️ คำแนะนำการจัดเก็บ (กลุ่ม D):</b><br>` +
                  `กรดอินทรีย์เป็นสารติดไฟได้และสามารถทำปฏิกิริยารุนแรงกับกรดออกซิไดซ์ที่เป็นกรดแก่<br>` +
                  `• <b>วิธีจัดเก็บ:</b> จัดเก็บในตู้เก็บกรดโดยแยกทางกายภาพจากกรดอนินทรีย์แก่ (กลุ่ม I) หรือจัดเก็บในตู้นิรภัยสำหรับสารไวไฟร่วมกับกลุ่ม L แยกห่างจากเบส (กลุ่ม A, C) และสารออกซิไดเซอร์ (กลุ่ม E)`;
        bgColor = "rgba(168, 85, 247, 0.08)";
        textColor = "#7e22ce";
        borderColor = "#a855f7";
      } else if (organicBasePatterns.some(p => nameLower.includes(p))) {
        group = "A";
        groupLabel = "กลุ่ม A - เบสอินทรีย์";
        recText = `<b>⚠️ คำแนะนำการจัดเก็บ (กลุ่ม A):</b><br>` +
                  `สารกลุ่มนี้ทำปฏิกิริยารุนแรงกับกรด และสามารถเข้าทำปฏิกิริยากับตัวทำละลายฮาโลเจนจนเกิดการระเบิดได้<br>` +
                  `• <b>วิธีจัดเก็บ:</b> จัดเก็บร่วมกับตัวทำละลายอินทรีย์และเบสอินทรีย์อื่นๆ ได้ (เช่น กลุ่ม L) แต่ห้ามจัดเก็บร่วมกับกรด (กลุ่ม D, F, I) และสารออกซิไดเซอร์ (กลุ่ม E) เด็ดขาด`;
        bgColor = "rgba(236, 72, 153, 0.08)";
        textColor = "#be185d";
        borderColor = "#ec4899";
      } else if (inorganicBasePatterns.some(p => nameLower.includes(p))) {
        group = "C";
        groupLabel = "กลุ่ม C - เบสอนินทรีย์";
        recText = `<b>⚠️ คำแนะนำการจัดเก็บ (กลุ่ม C):</b><br>` +
                  `สารเคมีกลุ่มเบสอนินทรีย์ ทำปฏิกิริยาคายความร้อนสูงและรุนแรงหากทำปฏิกิริยากับกรด<br>` +
                  `• <b>วิธีจัดเก็บ:</b> จัดเก็บในตู้อโลหะทนสารเคมีเฉพาะสำหรับเบส/ด่าง แยกเก็บห่างจากกรด (กลุ่ม D, F, I) และสารออกซิไดเซอร์เด็ดขาด`;
        bgColor = "rgba(59, 130, 246, 0.08)";
        textColor = "#1d4ed8";
        borderColor = "#3b82f6";
      } else if (oxidizerPatterns.some(p => nameLower.includes(p))) {
        group = "E";
        groupLabel = "กลุ่ม E - สารออกซิไดเซอร์อนินทรีย์";
        recText = `<b>⚠️ คำแนะนำการจัดเก็บ (กลุ่ม E):</b><br>` +
                  `สารออกซิไดเซอร์ช่วยเร่งการเผาไหม้อย่างรุนแรง และอาจระเบิดได้หากสัมผัสกับสารอินทรีย์ สารไวไฟ หรือกรด<br>` +
                  `• <b>วิธีจัดเก็บ:</b> จัดเก็บแยกห่างจากสารไวไฟ ตัวทำละลายอินทรีย์ (กลุ่ม L) กรดอินทรีย์ (กลุ่ม D) และสารลดเด็ดขาด เก็บในตู้ทนไฟเฉพาะสารออกซิไดซ์`;
        bgColor = "rgba(234, 179, 8, 0.08)";
        textColor = "#a16207";
        borderColor = "#eab308";
      } else if (flammablePatterns.some(p => nameLower.includes(p))) {
        group = "L";
        groupLabel = "กลุ่ม L - สารไวไฟและตัวทำละลายอินทรีย์";
        recText = `<b>⚠️ คำแนะนำการจัดเก็บ (กลุ่ม L):</b><br>` +
                  `สารไวไฟและตัวทำละลายอินทรีย์เสี่ยงต่อการติดไฟรวดเร็วและสะสมไอระเหยที่เป็นอันตราย<br>` +
                  `• <b>วิธีจัดเก็บ:</b> จัดเก็บในตู้นิรภัยสำหรับเก็บสารไวไฟ (Flammable Safety Cabinet) แยกห่างจากแหล่งความร้อน ประกายไฟ สารออกซิไดเซอร์ (กลุ่ม E, I) และกรดกัดกร่อน (กลุ่ม F)`;
        bgColor = "rgba(249, 115, 22, 0.08)";
        textColor = "#c2410c";
        borderColor = "#f97316";
      } else {
        group = "G";
        groupLabel = "กลุ่ม G - สารเคมีทั่วไปที่ไม่ว่องไว";
        recText = `<b>ℹ️ คำแนะนำการจัดเก็บ (กลุ่ม G):</b><br>` +
                  `สารเคมีทั่วไปที่มีความปลอดภัยค่อนข้างสูง ไม่ไวต่อปฏิกิริยา ไม่ลุกติดไฟเอง<br>` +
                  `• <b>วิธีจัดเก็บ:</b> สามารถจัดเก็บในชั้นวางสารเคมีทั่วไปได้ แต่ให้ปิดฝาให้สนิท หลีกเลี่ยงความร้อนและแสงแดดจัด`;
        bgColor = "rgba(16, 185, 129, 0.08)";
        textColor = "#047857";
        borderColor = "#10b981";
      }

      chemTypeSelect.value = group;
      
      window.currentStorageRecommendation = {
        text: recText,
        borderColor: borderColor
      };
      
      recBadge.innerHTML = `💡 คำแนะนำจัดเก็บ (${groupLabel}) คลิกเพื่อดู`;
      recBadge.style.backgroundColor = bgColor;
      recBadge.style.color = textColor;
      recBadge.style.borderColor = borderColor;
      recBadge.style.display = "inline-flex";
    }
  }
  
  window.applyGhsSuggestions = applyGhsSuggestions;
  window.clearCompatibilityRecommendation = function() {
    if (recBadge) {
      recBadge.style.display = "none";
      recBadge.innerHTML = "";
    }
    const wasteCard = document.getElementById("wasteClassificationCard");
    if (wasteCard) {
      wasteCard.style.display = "none";
    }
    window.currentStorageRecommendation = null;
  };
  
  if (recBadge) {
    recBadge.addEventListener("click", () => {
      if (typeof window.openCompatibilityPopup === "function") {
        window.openCompatibilityPopup();
      }
    });
  }
  
  itemNameInput.addEventListener("input", applyGhsSuggestions);
  itemCategorySelect.addEventListener("change", applyGhsSuggestions);
}


function setupWasteClassificationWizard() {
  const wizardContainer = document.getElementById("wasteClassificationWizard");
  if (!wizardContainer) return;

  function renderStep(stateKey) {
    wizardContainer.innerHTML = "";
    
    let questionText = "";
    let choices = [];
    
    if (stateKey === "waste_start") {
      questionText = "<b>คำถามที่ 1:</b> เป็นสารเคมีเสื่อมสภาพหรือหมดอายุ (Deteriorated/Expired) ที่ยังสามารถระบุชื่อและระบุความเป็นอันตรายของสารเคมีนั้นได้ชัดเจนหรือไม่?";
      choices = [
        { label: "ใช่, เป็นขวดสารเคมีหมดอายุ/เสื่อมสภาพ", next: "waste_chem_15" },
        { label: "ไม่ใช่ (เป็นสารละลายผสมหรือเศษวัสดุจากการทดลอง)", next: "waste_q2_expired_no" }
      ];
    } else if (stateKey === "waste_q2_expired_no") {
      questionText = "<b>คำถามที่ 2:</b> เป็นของเสียพิเศษ (Special Waste) เช่น ของเสียที่ไม่ทราบที่มาแน่ชัด (Unknown Waste) หรือสารก่อมะเร็ง (เช่น เอธิเดียมโบรไมด์ Ethidium Bromide) หรือไม่?";
      choices = [
        { label: "ใช่, เป็นของเสียพิเศษ/สารก่อมะเร็ง", next: "waste_chem_1" },
        { label: "ไม่ใช่ของเสียพิเศษ", next: "waste_q3_special_no" }
      ];
    } else if (stateKey === "waste_q3_special_no") {
      questionText = "<b>คำถามที่ 3:</b> มีส่วนผสมหรือปนเปื้อนสารปรอท (Mercury) หรือไม่? (เช่น สารละลายเมอร์คิวรี(II) คลอไรด์, หรือเศษแก้วเทอร์โมมิเตอร์ปนเปื้อนปรอท)<br><span style='font-size: 11px; color: var(--text-muted);'>*(หมายเหตุ: ถ้าผสมกับไซยาไนด์จะจัดเป็น Special Waste Class 1)*</span>";
      choices = [
        { label: "ใช่, มีส่วนประกอบของปรอท", next: "waste_chem_4" },
        { label: "ไม่มีสารปรอทปนเปื้อน", next: "waste_q4_mercury_no" }
      ];
    } else if (stateKey === "waste_q4_mercury_no") {
      questionText = "<b>คำถามที่ 4:</b> มีอนุมูลไซยาไนด์ (Inorganic Cyanide) เป็นองค์ประกอบ หรือเป็นสารประกอบเชิงซ้อนไซยาไนด์ หรือไม่? (เช่น สารละลายโพแทสเซียมไซยาไนด์, สารเชิงซ้อน Ni(CN)₄²⁻)<br><span style='font-size: 11px; color: var(--text-muted);'>*(หมายเหตุ: ถ้าผสมกับปรอทจะจัดเป็น Special Waste Class 1)*</span>";
      choices = [
        { label: "ใช่, มีไซยาไนด์ปนเปื้อน", next: "waste_chem_2" },
        { label: "ไม่มีไซยาไนด์", next: "waste_q5_cyanide_no" }
      ];
    } else if (stateKey === "waste_q5_cyanide_no") {
      questionText = "<b>คำถามที่ 5:</b> สถานะทางกายภาพของของเสียเป็น <b>ของแข็ง (Solid)</b> หรือไม่?";
      choices = [
        { label: "ใช่, มีสถานะเป็นของแข็ง", next: "waste_q6_solid_yes" },
        { label: "ไม่ใช่, เป็นของเหลว/สารละลาย", next: "waste_q6_solid_no" }
      ];
    } else if (stateKey === "waste_q6_solid_yes") {
      questionText = "<b>คำถามที่ 6 (ของแข็ง):</b> ของแข็งดังกล่าวเป็นของแข็งเผาไหม้ได้ (Combustible เช่น เศษซากพืชที่ได้จากการสกัด, ถุงมือยางปนเปื้อนเคมี) หรือเผาไหม้ไม่ได้ (Non-Combustible เช่น ซิลิกาเจล, เศษแก้วแตกทั่วไป)?";
      choices = [
        { label: "ของแข็งเผาไหม้ได้ (Combustible)", next: "waste_chem_13_1" },
        { label: "ของแข็งเผาไหม้ไม่ได้ (Non-Combustible)", next: "waste_chem_13_2" }
      ];
    } else if (stateKey === "waste_q6_solid_no") {
      questionText = "<b>คำถามที่ 6 (ของเหลว):</b> เป็นของเสียตัวทำละลายอินทรีย์ (Organic Solvent Waste) ใช่หรือไม่?";
      choices = [
        { label: "ใช่, เป็นตัวทำละลายอินทรีย์", next: "waste_q7_organic_yes" },
        { label: "ไม่ใช่ (เป็นน้ำเสียมีน้ำเป็นตัวทำละลาย / Inorganic Aqueous)", next: "waste_q7_organic_no" }
      ];
    } else if (stateKey === "waste_q7_organic_yes") {
      questionText = "<b>คำถามที่ 7 (สารอินทรีย์):</b> เป็นตัวทำละลายใช้แล้วที่ปนเปื้อนน้อย มีน้ำปนเปื้อนไม่เกิน 15% มีปริมาณมากพอส่งส่งเข้าโครงการ <b>Recycle</b> หรือไม่?";
      choices = [
        { label: "ใช่, ต้องการส่ง Recycle", next: "waste_q8_recycle_yes" },
        { label: "ไม่ต้องการ Recycle (หรือสารปนเปื้อนเยอะ/น้ำปนเกิน 15%)", next: "waste_q8_recycle_no" }
      ];
    } else if (stateKey === "waste_q8_recycle_yes") {
      questionText = "เลือกประเภทตัวทำละลายอินทรีย์รีไซเคิลของท่าน:";
      choices = [
        { label: "ของเสียไซลีน (Xylene)", next: "waste_chem_17_1" },
        { label: "ของเสียเอทานอล (Ethanol)", next: "waste_chem_17_2" },
        { label: "ของเสียอะซิโตน (Acetone)", next: "waste_chem_17_3" },
        { label: "สารตัวทำละลายอินทรีย์อื่นๆ ที่จะรีไซเคิล", next: "waste_chem_17_4" }
      ];
    } else if (stateKey === "waste_q8_recycle_no") {
      questionText = "<b>คำถามที่ 8 (สารอินทรีย์ไม่รีไซเคิล):</b> มีน้ำผสมปนเปื้อนอยู่ตั้งแต่ 5% ขึ้นไป (H₂O ≥ 5%) ใช่หรือไม่?";
      choices = [
        { label: "ใช่, มีน้ำผสมปนเปื้อน ≥ 5%", next: "waste_chem_16" },
        { label: "ไม่ใช่, มีน้ำผสมต่ำมาก (< 5%)", next: "waste_q9_water_low" }
      ];
    } else if (stateKey === "waste_q9_water_low") {
      questionText = "<b>คำถามที่ 9 (ตัวทำละลายอินทรีย์น้ำต่ำ):</b> ในโครงสร้างโมเลกุลมีธาตุเฮโลเจน (Halogen - เช่น F, Cl, Br, I) เป็นองค์ประกอบหลักใช่หรือไม่? (เช่น CCl₄, คลอโรฟอร์ม, ไตรคลอโรเอทิลีน)<br><span style='font-size: 11px; color: var(--text-muted);'>*(หมายเหตุ: ถ้าผสมกับ NPS Waste จะจัดเป็น Special Waste Class 1)*</span>";
      choices = [
        { label: "ใช่, มีธาตุฮาโลเจนในโครงสร้าง", next: "waste_chem_12" },
        { label: "ไม่มีธาตุฮาโลเจน", next: "waste_q10_halogen_no" }
      ];
    } else if (stateKey === "waste_q10_halogen_no") {
      questionText = "<b>คำถามที่ 10:</b> ในโครงสร้างโมเลกุลมีธาตุไนโตรเจน (N), ฟอสฟอรัส (P), หรือ ซัลเฟอร์ (S) เป็นองค์ประกอบใช่หรือไม่? (เช่น Dimethylformamide - DMF, Dimethylsulfoxide - DMSO, อะซิโตไนไตรล์)<br><span style='font-size: 11px; color: var(--text-muted);'>*(หมายเหตุ: ถ้าผสมกับ Halogenated Waste จะจัดเป็น Special Waste Class 1)*</span>";
      choices = [
        { label: "ใช่, มีธาตุ N, P, หรือ S", next: "waste_chem_11" },
        { label: "ไม่มีธาตุกลุ่ม N, P, S", next: "waste_q11_nps_no" }
      ];
    } else if (stateKey === "waste_q11_nps_no") {
      questionText = "<b>คำถามที่ 11:</b> ในโครงสร้างโมเลกุลมีธาตุออกซิเจน (O) เป็นองค์ประกอบใช่หรือไม่? (เช่น เอทิลแอซีเตต, อะซิโตน, แอลกอฮอล์, คีโตน, อีเทอร์)";
      choices = [
        { label: "ใช่, มีธาตุออกซิเจน", next: "waste_chem_10" },
        { label: "ไม่มีธาตุออกซิเจน", next: "waste_q12_oxygen_no" }
      ];
    } else if (stateKey === "waste_q12_oxygen_no") {
      questionText = "<b>คำถามที่ 12:</b> เป็นของเสียกลุ่มสารประกอบไฮโดรคาร์บอน (Hydrocarbon) ใช่หรือไม่? (เช่น น้ำมันเบนซิน, ดีเซล, น้ำมันเครื่อง, เฮกเซน, เพนเทน)";
      choices = [
        { label: "ใช่, เป็นสารไฮโดรคาร์บอน", next: "waste_chem_9" },
        { label: "ไม่ใช่กลุ่มสารไฮโดรคาร์บอน", next: "waste_chem_16" }
      ];
    } else if (stateKey === "waste_q7_organic_no") {
      questionText = "<b>คำถามที่ 7 (น้ำเสียอนินทรีย์):</b> มีส่วนประกอบหลักเป็นสารประกอบโครเมียม (Chromium) หรือไม่? (เช่น สารประกอบ Cr(VI), กรดโครมิก, น้ำเสียวิเคราะห์ COD)<br><span style='font-size: 11px; color: var(--text-muted);'>*(หมายเหตุ: ถ้าผสมกับ Mercury Waste จะจัดเป็น Mercury Waste Class 4)*</span>";
      choices = [
        { label: "ใช่, มีโครเมียมปนเปื้อน", next: "waste_chem_5" },
        { label: "ไม่มีสารโครเมียม", next: "waste_q8_chromium_no" }
      ];
    } else if (stateKey === "waste_q8_chromium_no") {
      questionText = "<b>คำถามที่ 8 (น้ำเสียอนินทรีย์):</b> มีคุณสมบัติเป็นสารออกซิไดซ์ (Oxidizing Agent) ที่อาจทำปฏิกิริยารุนแรงหรือไม่? (เช่น กรดไนตริก/ซัลฟิวริกเข้มข้น >60%, ด่างทับทิม, โซเดียมคลอเรต)<br><span style='font-size: 11px; color: var(--text-muted);'>*(หมายเหตุ: ถ้าผสมกับโครเมียมจะจัดเป็น Chromium Waste Class 5)*</span>";
      choices = [
        { label: "ใช่, มีความเป็นสารออกซิไดซ์", next: "waste_chem_3" },
        { label: "ไม่มีสมบัติออกซิไดซ์", next: "waste_q9_oxidizer_no" }
      ];
    } else if (stateKey === "waste_q9_oxidizer_no") {
      questionText = "<b>คำถามที่ 9 (น้ำเสียอนินทรีย์):</b> มีส่วนผสมของโลหะหนักอื่นเจือปนอยู่อย่างเข้มข้นมากกว่า 0.1 g/L (100 ppm) หรือไม่? (โลหะหนักอื่นๆ ที่ไม่ใช่ปรอทและโครเมียม เช่น แคดเมียม ตะกั่ว ทองแดง สังกะสี นิกเกิล เงิน)";
      choices = [
        { label: "ใช่, มีโลหะหนักเจือปนความเข้มข้นสูง", next: "waste_chem_6" },
        { label: "ไม่มีโลหะหนัก หรือมีน้อยมาก (< 0.1 g/L)", next: "waste_q10_heavy_no" }
      ];
    } else if (stateKey === "waste_q10_heavy_no") {
      questionText = "<b>คำถามที่ 10 (น้ำเสียอนินทรีย์):</b> ของเสียสารละลายนี้มีความเป็นกรดแก่หรือเบสแก่ปนเปื้อนอยู่เกิน 5% ใช่หรือไม่?";
      choices = [
        { label: "ใช่, เป็นกรดเด่น (pH < 7)", next: "waste_chem_7" },
        { label: "ใช่, เป็นเบสเด่น (pH > 8)", next: "waste_chem_8" },
        { label: "ไม่ใช่ (เป็นสารละลายน้ำทั่วไป เช่น น้ำเกลือเจือจาง)", next: "waste_chem_14" }
      ];
    }

    if (stateKey.startsWith("waste_chem_")) {
      const classKey = stateKey.substring(11).replace("_", ".");
      const c = WASTE_CLASSES[classKey];
      if (c) {
        const resultHTML = `
          <div style="background: rgba(16, 185, 129, 0.08); border-left: 4px solid var(--accent-green); padding: 16px; border-radius: var(--border-radius-sm); margin-bottom: 16px;">
            <div style="font-size: 14px; font-weight: 600; color: var(--accent-green); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <i data-lucide="check-circle" style="width: 18px; height: 18px;"></i>
              <span>ผลการจำแนกประเภทของเสียสำเร็จ!</span>
            </div>
            <div style="font-size: 14.5px; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">
              ประเภท: ${c.name}
            </div>
            <p style="font-size: 13px; color: var(--text-main); line-height: 1.5; margin-bottom: 8px;">
              <b>คำจำกัดความ:</b> ${c.desc}
            </p>
            <p style="font-size: 13px; color: var(--text-main); line-height: 1.5; margin-bottom: 8px;">
              <b>ตัวอย่างสาร:</b> ${c.examples}
            </p>
            <p style="font-size: 13.5px; color: var(--text-main); line-height: 1.5; margin-bottom: 0; background: #ffffff; padding: 10px; border-radius: 6px; border: 1px dashed var(--border-color);">
              <b>⚠️ คำแนะนำส่งกำจัด:</b> ${c.guide}
            </p>
          </div>
          <button type="button" class="btn btn-secondary" id="btnRestartWasteWizard" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; padding: 8px 12px; border-radius: var(--border-radius-sm); border: 1px solid var(--border-color); background: #ffffff; color: var(--text-main); font-weight: 600; cursor: pointer;">
            <i data-lucide="rotate-ccw" style="width: 14px; height: 14px;"></i>
            <span>เริ่มจำแนกของเสียใหม่</span>
          </button>
        `;
        wizardContainer.innerHTML = resultHTML;
        
        lucide.createIcons({
          attrs: {
            class: 'lucide'
          },
          nameAttr: 'data-lucide',
          node: wizardContainer
        });

        document.getElementById("btnRestartWasteWizard").addEventListener("click", () => {
          renderStep("waste_start");
        });
      }
    } else {
      const qHTML = `
        <div style="font-size: 14px; color: var(--text-main); line-height: 1.6; margin-bottom: 16px;">
          ${questionText}
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${choices.map((choice) => `
            <button type="button" class="waste-choice-btn" data-next="${choice.next}" style="text-align: left; background: #ffffff; border: 1px solid var(--border-color); padding: 12px 16px; border-radius: var(--border-radius-sm); font-size: 13px; font-weight: 500; color: var(--text-main); cursor: pointer; transition: all 0.2s ease; font-family: 'Prompt', sans-serif;">
              ${choice.label}
            </button>
          `).join("")}
        </div>
      `;
      wizardContainer.innerHTML = qHTML;

      wizardContainer.querySelectorAll(".waste-choice-btn").forEach(btn => {
        btn.addEventListener("mouseover", () => {
          btn.style.borderColor = "var(--primary-purple)";
          btn.style.background = "rgba(109, 40, 217, 0.04)";
        });
        btn.addEventListener("mouseout", () => {
          btn.style.borderColor = "var(--border-color)";
          btn.style.background = "#ffffff";
        });
        btn.addEventListener("click", () => {
          const nextState = btn.getAttribute("data-next");
          renderStep(nextState);
        });
      });
    }
  }

  renderStep("waste_start");
}



function setupHistoryExports() {
  const btnExportBorrowCSV = document.getElementById("btnExportBorrowCSV");
  const btnExportBorrowPDF = document.getElementById("btnExportBorrowPDF");
  const btnExportBookingCSV = document.getElementById("btnExportBookingCSV");
  const btnExportBookingPDF = document.getElementById("btnExportBookingPDF");

  if (btnExportBorrowCSV) {
    btnExportBorrowCSV.addEventListener("click", () => {
      let filtered = [...transactions];
      const filterVal = document.getElementById("exportBorrowRoomFilter") ? document.getElementById("exportBorrowRoomFilter").value : "all";
      if (filterVal !== "all") {
        filtered = filtered.filter(tx => tx.room === filterVal);
      }
      if (filtered.length === 0) {
        showToast("ไม่มีข้อมูลประวัติการทำรายการยืม-คืนสำหรับห้องปฏิบัติการที่เลือก", "error");
        return;
      }
      const headers = [
        "วันทำรายการ",
        "รหัสพัสดุ",
        "รายการพัสดุ",
        "จำนวนที่ยืม",
        "ผู้ยืม",
        "ห้องปฏิบัติการ",
        "คาบเรียน",
        "ผู้ดูแล (อาจารย์)",
        "สถานะ",
        "วันกำหนดส่งคืน",
        "วันที่คืนจริง",
        "หมายเหตุ"
      ];
      const rows = filtered.map(tx => [
        tx.date || "",
        tx.itemCode || "",
        tx.itemName || "",
        tx.qty || 0,
        tx.borrower || "",
        getRoomThaiName(tx.room) || "",
        tx.slot || "",
        tx.supervisingTeacher || "",
        tx.status === "borrowed" ? "กำลังยืม" : tx.status === "pending" ? "รออนุมัติ" : tx.status === "rejected" ? "ปฏิเสธการยืม" : "คืนแล้ว",
        tx.expectedReturnDate || "",
        tx.returnDate || "",
        tx.notes || ""
      ]);
      const roomSuffix = filterVal !== "all" ? `_${filterVal}` : "";
      exportDataToCSV(`borrow_return_history${roomSuffix}_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
      showToast("ส่งออกประวัติการยืม-คืนแบบ CSV สำเร็จ!", "success");
    });
  }

  if (btnExportBorrowPDF) {
    btnExportBorrowPDF.addEventListener("click", () => {
      let filtered = [...transactions];
      const filterVal = document.getElementById("exportBorrowRoomFilter") ? document.getElementById("exportBorrowRoomFilter").value : "all";
      if (filterVal !== "all") {
        filtered = filtered.filter(tx => tx.room === filterVal);
      }
      if (filtered.length === 0) {
        showToast("ไม่มีข้อมูลประวัติการทำรายการยืม-คืนสำหรับห้องปฏิบัติการที่เลือก", "error");
        return;
      }
      const printDate = formatThaiDate(new Date().toISOString().split('T')[0]) + " " + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      const rowsHtml = filtered.map(tx => `
        <tr>
          <td>${formatThaiDate(tx.date)}</td>
          <td>${tx.itemCode}</td>
          <td>${tx.itemName}</td>
          <td>${tx.qty}</td>
          <td>${tx.borrower}</td>
          <td>${getRoomThaiName(tx.room)}</td>
          <td>${tx.status === "borrowed" ? "<span style='color:#f97316; font-weight: 500;'>กำลังยืม</span>" : tx.status === "pending" ? "<span style='color:#f59e0b; font-weight: 500;'>รออนุมัติ</span>" : tx.status === "rejected" ? "<span style='color:#ef4444; font-weight: 500;'>ปฏิเสธการยืม</span>" : "<span style='color:#10b981; font-weight: 500;'>คืนแล้ว</span>"}</td>
        </tr>
      `).join("");

      const filterText = filterVal !== "all" ? ` (${getRoomThaiName(filterVal)})` : "";

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>รายงานประวัติการยืม-คืนพัสดุและสารเคมี${filterText}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
            body { font-family: 'Prompt', sans-serif; padding: 24px; color: #1e293b; line-height: 1.5; }
            h1 { text-align: center; font-size: 20px; margin-bottom: 8px; color: #0f172a; }
            p.meta { text-align: center; font-size: 12px; color: #64748b; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 11px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: 600; color: #334155; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .footer { margin-top: 40px; font-size: 10px; text-align: right; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1>รายงานประวัติการยืม-คืนพัสดุและสารเคมี${filterText}</h1>
          <p class="meta">ออกรายงาน ณ วันที่: ${printDate} | จำนวนธุรกรรมทั้งหมด: ${filtered.length} รายการ</p>
          <table>
            <thead>
              <tr>
                <th>วันทำรายการ</th>
                <th>รหัสพัสดุ</th>
                <th>รายการพัสดุ</th>
                <th>จำนวน</th>
                <th>ผู้ยืม</th>
                <th>ห้องปฏิบัติการ</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div class="footer">ระบบจัดการห้องปฏิบัติการเคมีและอุปกรณ์วิทยาศาสตร์</div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
        </html>
      `;
      const printWindow = window.open("", "_blank");
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    });
  }

  if (btnExportBookingCSV) {
    btnExportBookingCSV.addEventListener("click", () => {
      let filtered = [...bookings];
      const filterVal = document.getElementById("exportBookingRoomFilter") ? document.getElementById("exportBookingRoomFilter").value : "all";
      if (filterVal !== "all") {
        filtered = filtered.filter(b => b.room === filterVal);
      }
      if (filtered.length === 0) {
        showToast("ไม่มีข้อมูลประวัติการใช้ห้องปฏิบัติการสำหรับห้องปฏิบัติการที่เลือก", "error");
        return;
      }
      const headers = [
        "วันที่เข้าใช้",
        "ห้องปฏิบัติการ",
        "คาบเรียนที่ใช้",
        "ผู้จอง",
        "วัตถุประสงค์",
        "สถานะ",
        "วันที่จอง (บันทึกเข้าระบบ)"
      ];
      const rows = filtered.map(b => [
        b.date || "",
        getRoomThaiName(b.room) || "",
        b.slot || "",
        b.bookerName || "",
        b.purpose || "",
        b.status === "approved" ? "อนุมัติ" : b.status === "pending" ? "รออนุมัติ" : "ปฏิเสธ",
        b.createdAt ? b.createdAt.split('T')[0] : ""
      ]);
      const roomSuffix = filterVal !== "all" ? `_${filterVal}` : "";
      exportDataToCSV(`lab_booking_history${roomSuffix}_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
      showToast("ส่งออกประวัติการจองห้องปฏิบัติการแบบ CSV สำเร็จ!", "success");
    });
  }

  if (btnExportBookingPDF) {
    btnExportBookingPDF.addEventListener("click", () => {
      let filtered = [...bookings];
      const filterVal = document.getElementById("exportBookingRoomFilter") ? document.getElementById("exportBookingRoomFilter").value : "all";
      if (filterVal !== "all") {
        filtered = filtered.filter(b => b.room === filterVal);
      }
      if (filtered.length === 0) {
        showToast("ไม่มีข้อมูลประวัติการใช้ห้องปฏิบัติการสำหรับห้องปฏิบัติการที่เลือก", "error");
        return;
      }
      const printDate = formatThaiDate(new Date().toISOString().split('T')[0]) + " " + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      const rowsHtml = filtered.map(b => `
        <tr>
          <td>${formatThaiDate(b.date)}</td>
          <td>${getRoomThaiName(b.room)}</td>
          <td>${b.slot}</td>
          <td>${b.bookerName}</td>
          <td>${b.purpose}</td>
          <td>${b.status === "approved" ? "<span style='color:#10b981; font-weight: 500;'>อนุมัติแล้ว</span>" : b.status === "pending" ? "<span style='color:#f59e0b; font-weight: 500;'>รออนุมัติ</span>" : "<span style='color:#ef4444; font-weight: 500;'>ปฏิเสธ</span>"}</td>
        </tr>
      `).join("");

      const filterText = filterVal !== "all" ? ` (${getRoomThaiName(filterVal)})` : "";

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>รายงานประวัติการใช้ห้องปฏิบัติการ${filterText}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
            body { font-family: 'Prompt', sans-serif; padding: 24px; color: #1e293b; line-height: 1.5; }
            h1 { text-align: center; font-size: 20px; margin-bottom: 8px; color: #0f172a; }
            p.meta { text-align: center; font-size: 12px; color: #64748b; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 11px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: 600; color: #334155; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .footer { margin-top: 40px; font-size: 10px; text-align: right; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1>รายงานประวัติการใช้ห้องปฏิบัติการ${filterText}</h1>
          <p class="meta">ออกรายงาน ณ วันที่: ${printDate} | จำนวนรายการจองทั้งหมด: ${filtered.length} รายการ</p>
          <table>
            <thead>
              <tr>
                <th>วันที่เข้าใช้</th>
                <th>ห้องปฏิบัติการ</th>
                <th>คาบเรียน</th>
                <th>ผู้จอง</th>
                <th>วัตถุประสงค์</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div class="footer">ระบบจัดการห้องปฏิบัติการเคมีและอุปกรณ์วิทยาศาสตร์</div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
        </html>
      `;
      const printWindow = window.open("", "_blank");
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    });
  }

  const btnExportPoCSV = document.getElementById("btnExportPoCSV");
  const btnExportPoPDF = document.getElementById("btnExportPoPDF");

  if (btnExportPoCSV) {
    btnExportPoCSV.addEventListener("click", () => {
      if (purchaseOrders.length === 0) {
        showToast("ไม่มีข้อมูลรายการสั่งซื้อเพื่อส่งออก", "error");
        return;
      }
      const headers = [
        "รหัสสินค้า",
        "ชื่อสินค้า",
        "ราคาต่อหน่วย (บาท)",
        "จำนวน",
        "ราคารวม (บาท)",
        "ส่วนลด (%)"
      ];
      const rows = purchaseOrders.map(order => [
        order.code || "",
        order.name || "",
        order.unitPrice || 0,
        order.quantity || 0,
        order.totalPrice || 0,
        order.discount !== undefined ? `${order.discount}%` : ""
      ]);
      exportDataToCSV(`purchase_orders_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
      showToast("ส่งออกรายการสั่งซื้อแบบ CSV สำเร็จ!", "success");
    });
  }

  if (btnExportPoPDF) {
    btnExportPoPDF.addEventListener("click", () => {
      if (purchaseOrders.length === 0) {
        showToast("ไม่มีข้อมูลรายการสั่งซื้อเพื่อส่งออก", "error");
        return;
      }
      const printDate = formatThaiDate(new Date().toISOString().split('T')[0]) + " " + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      
      let grandTotal = 0;
      const rowsHtml = purchaseOrders.map(order => {
        grandTotal += order.totalPrice;
        
        let discountStr = "-";
        if (order.discount > 0) {
          discountStr = `ลด ${order.discount}%`;
        } else if (order.budgetDiscount) {
          discountStr = order.budgetDiscount;
        }
        
        return `
          <tr>
            <td style="font-family: monospace;">${order.code}</td>
            <td>${order.name}</td>
            <td style="text-align: right;">${order.unitPrice.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td style="text-align: center;">${order.quantity}</td>
            <td style="text-align: right; font-weight: bold;">${order.totalPrice.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td>${discountStr}</td>
          </tr>
        `;
      }).join("");

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>รายงานรายการสั่งซื้อสะสม</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
            body { font-family: 'Prompt', sans-serif; padding: 24px; color: #1e293b; line-height: 1.5; }
            h1 { text-align: center; font-size: 20px; margin-bottom: 8px; color: #0f172a; }
            p.meta { text-align: center; font-size: 12px; color: #64748b; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 11px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: 600; color: #334155; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .total-row { background-color: #f1f5f9; font-weight: bold; }
            .footer { margin-top: 40px; font-size: 10px; text-align: right; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1>รายงานรายการสั่งซื้อสะสม</h1>
          <p class="meta">ออกรายงาน ณ วันที่: ${printDate} | จำนวนรายการสั่งซื้อทั้งหมด: ${purchaseOrders.length} รายการ</p>
          <table>
            <thead>
              <tr>
                <th>รหัสสินค้า</th>
                <th>ชื่อสินค้า</th>
                <th style="text-align: right;">ราคาต่อหน่วย</th>
                <th style="text-align: center;">จำนวน</th>
                <th style="text-align: right;">ราคารวม</th>
                <th>ส่วนลด</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <tr class="total-row">
                <td colspan="4" style="text-align: right;">ราคารวมทั้งหมด:</td>
                <td style="text-align: right; color: #8b5cf6;">${grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>บาท</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">ระบบจัดการห้องปฏิบัติการเคมีและอุปกรณ์วิทยาศาสตร์</div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
        </html>
      `;
      const printWindow = window.open("", "_blank");
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    });
  }
}

function exportDataToCSV(filename, headers, rows) {
  let csvContent = "\ufeff"; // BOM
  csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",") + "\n";
  rows.forEach(row => {
    csvContent += row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",") + "\n";
  });
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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

// ==========================================
// CHATBOT: LOCAL SMART ASSISTANT SYSTEM
// ==========================================
function setupChatbot() {
  const fab = document.getElementById("chatbotFab");
  const panel = document.getElementById("chatbotPanel");
  const overlay = document.getElementById("chatbotOverlay");
  const closeBtn = document.getElementById("chatbotCloseBtn");
  const sendBtn = document.getElementById("chatbotSendBtn");
  const input = document.getElementById("chatbotInput");
  const body = document.getElementById("chatbotBody");
  const suggestionsContainer = document.getElementById("chatSuggestions");

  if (!fab || !panel || !closeBtn || !sendBtn || !input || !body) return;

  const openChatbot = () => {
    panel.classList.add("active");
    if (overlay) overlay.classList.add("active");
    
    // Remove pulse dot after opening once
    const pulseDot = fab.querySelector(".chatbot-pulse-dot");
    if (pulseDot) {
      pulseDot.style.display = "none";
    }
    input.focus();
  };

  const closeChatbot = () => {
    panel.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
  };

  // Toggle chatbot panel visibility
  fab.addEventListener("click", () => {
    if (panel.classList.contains("active")) {
      closeChatbot();
    } else {
      openChatbot();
    }
  });

  closeBtn.addEventListener("click", closeChatbot);
  
  if (overlay) {
    overlay.addEventListener("click", closeChatbot);
  }

  // Handle send message
  const handleSendMessage = () => {
    const text = input.value.trim();
    if (!text) return;

    // Append user message
    appendChatMessage("user", text);
    input.value = "";

    // Show bot thinking/typing indicator
    const typingIndicator = appendChatTypingIndicator();

    setTimeout(() => {
      // Remove typing indicator and append bot response
      typingIndicator.remove();
      const botResponse = generateBotResponse(text);
      appendChatMessage("bot", botResponse);
    }, 600);
  };

  sendBtn.addEventListener("click", handleSendMessage);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  });

  // Handle quick suggestion chips click
  if (suggestionsContainer) {
    suggestionsContainer.addEventListener("click", (e) => {
      const chip = e.target.closest(".chat-suggestion-chip");
      if (!chip) return;
      const query = chip.getAttribute("data-query");
      
      // Simulate user clicking / typing query
      appendChatMessage("user", query);
      const typingIndicator = appendChatTypingIndicator();

      setTimeout(() => {
        typingIndicator.remove();
        const botResponse = generateBotResponse(query);
        appendChatMessage("bot", botResponse);
      }, 500);
    });
  }

  // Handle interactive choice buttons click
  body.addEventListener("click", (e) => {
    const btn = e.target.closest(".chat-choice-btn");
    if (!btn) return;
    const choiceText = btn.innerText;
    const choiceVal = btn.getAttribute("data-choice");
    
    const container = btn.closest(".chat-choices-container");
    if (container) {
      container.style.pointerEvents = "none";
      container.style.opacity = "0.6";
    }

    // Simulate user clicking / typing query
    appendChatMessage("user", choiceText);
    const typingIndicator = appendChatTypingIndicator();

    setTimeout(() => {
      typingIndicator.remove();
      const botResponse = generateBotResponse(choiceVal);
      appendChatMessage("bot", botResponse);
    }, 500);
  });

  function appendChatMessage(sender, text) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-message ${sender}`;
    msgDiv.innerHTML = text.replace(/\n/g, "<br>");
    body.appendChild(msgDiv);
    
    // Auto-scroll to bottom of the body
    body.scrollTop = body.scrollHeight;
  }

  function appendChatTypingIndicator() {
    const typingDiv = document.createElement("div");
    typingDiv.className = "chat-message bot typing-indicator";
    typingDiv.innerHTML = `<span style="display: inline-flex; gap: 4px; align-items: center;">
      <span class="dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite alternate;"></span>
      <span class="dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite alternate; animation-delay: 0.2s;"></span>
      <span class="dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite alternate; animation-delay: 0.4s;"></span>
    </span>`;
    
    // Add CSS rule dynamically for typing bounce if not in style.css
    if (!document.getElementById("chatbot-animation-style")) {
      const style = document.createElement("style");
      style.id = "chatbot-animation-style";
      style.innerHTML = `
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-4px); }
        }
      `;
      document.head.appendChild(style);
    }

    body.appendChild(typingDiv);
    body.scrollTop = body.scrollHeight;
    return typingDiv;
  }
}

const WASTE_CLASSES = {
  "1": {
    name: "Class 1 : Special Waste (ประเภทที่ 1 ของเสียพิเศษ)",
    desc: "ของเสียที่ไม่ทราบที่มาแน่ชัด (Unknown Waste) หรือของเสียที่เป็นสารก่อมะเร็ง",
    examples: "เอธิเดียมโบรไมด์ (Ethidium Bromide)",
    guide: "บรรจุในขวดหรือภาชนะที่แข็งแรง ปิดฝาสนิท ระบุป้ายกำกับว่าเป็นของเสียพิเศษ ห้ามปะปนกับของเสียประเภทอื่น"
  },
  "2": {
    name: "Class 2 : Cyanide Waste (ประเภทที่ 2 ของเสียที่มีไซยาไนด์)",
    desc: "ของเสียที่มีอนุมูลไซยาไนด์เป็นองค์ประกอบ หรือเป็นสารประกอบเชิงซ้อนไซยาไนด์ หรือไซยาโนคอมเพล็กซ์",
    examples: "สารละลายโพแทสเซียมไซยาไนด์, สารเชิงซ้อน Ni(CN)₄²⁻",
    guide: "เก็บในภาชนะพลาสติก ห้ามทำให้เป็นกรดเด็ดขาด (เพราะจะเกิดแก๊สไซยาไนด์พิษ) ห้ามผสมปนกับ Mercury Waste (ถ้าผสมจะจัดเป็น Special Waste Class 1)"
  },
  "3": {
    name: "Class 3 : Oxidizing Waste (ประเภทที่ 3 ของเสียที่มีสารออกซิไดซ์)",
    desc: "ของเสียที่มีสมบัติรับอิเล็กตรอน ซึ่งอาจเกิดปฏิกิริยารุนแรงกับสารอื่นทำให้ระเบิดได้",
    examples: "กรดไนตริกเข้มข้น, กรดเปอร์คลอริก, กรดซัลฟิวริกเข้มข้น (>60%), โพแทสเซียมเปอร์แมงกาเนต, โซเดียมคลอเรต",
    guide: "เก็บแยกห่างจากตัวทำละลาย สารไวไฟ และสารอินทรีย์ ห้ามผสมกับ Chromium Waste (ถ้าผสมให้จัดเป็น Chromium Waste Class 5)"
  },
  "4": {
    name: "Class 4 : Mercury Waste (ประเภทที่ 4 ของเสียที่มีปรอท)",
    desc: "ของเสียที่มีปรอทหรือสารประกอบปรอทเป็นองค์ประกอบ",
    examples: "เมอร์คิวรี(II) คลอไรด์, อัลคิลเมอร์คิวรี, เศษแก้วแตกจากเทอร์โมมิเตอร์ปรอท",
    guide: "เก็บในภาชนะปิดสนิทมิดชิดเพื่อป้องกันไอระเหยของปรอท ห้ามผสมปนกับ Cyanide Waste (ถ้าผสมจะจัดเป็น Special Waste Class 1)"
  },
  "5": {
    name: "Class 5 : Chromium Waste (ประเภทที่ 5 ของเสียที่มีสารโครเมียม)",
    desc: "ของเสียที่มีโครเมียมเป็นองค์ประกอบ",
    examples: "สารประกอบโครเมียม Cr(VI), กรดโครมิก, น้ำเสียจากการวิเคราะห์ COD",
    guide: "เก็บแยกในภาชนะพลาสติกทนกรด ห้ามปะปนกับ Mercury Waste (ถ้าผสมจะจัดเป็น Mercury Waste Class 4)"
  },
  "6": {
    name: "Class 6 : Heavy Metal Waste (ประเภทที่ 6 ของเสียที่มีโลหะหนัก)",
    desc: "ของเสียที่มีไอออนของโลหะหนักอื่นที่ไม่ใช่ปรอทและโครเมียม เจือปนอยู่ความเข้มข้น > 0.1 g/L",
    examples: "สารละลายของ แบเรียม, แคดเมียม, ตะกั่ว, ทองแดง, เหล็ก, แมงกานีส, สังกะสี, โคบอลต์, เงิน, ดีบุก",
    guide: "รวบรวมใส่ในถังเก็บเฉพาะสำหรับสารละลายโลหะหนัก ปิดฝาสนิท"
  },
  "7": {
    name: "Class 7 : Acid Waste (ประเภทที่ 7 ของเสียที่เป็นกรด)",
    desc: "ของเสียที่เป็นกรดอนินทรีย์เจือปนมากกว่า 5% และมีค่า pH ต่ำกว่า 7",
    examples: "กรดซัลฟิวริกเจือจาง, กรดไฮโดรคลอริก",
    guide: "บรรจุในขวดพลาสติกทนกรด (HDPE) ปิดฝาให้สนิท ห้ามใช้ภาชนะโลหะเด็ดขาด"
  },
  "8": {
    name: "Class 8 : Alkaline Waste (ประเภทที่ 8 ของเสียอัลคาไลน์)",
    desc: "ของเสียที่เป็นด่างเจือปนมากกว่า 5% และมีค่า pH สูงกว่า 8",
    examples: "สารละลายโซเดียมไฮดรอกไซด์เจือจาง, สารละลายโซเดียมคาร์บอเนต, สารละลายแอมโมเนีย",
    guide: "บรรจุในขวดพลาสติก ปิดฝาให้สนิท ห้ามผสมกับกรดเด็ดขาดเพื่อป้องกันปฏิกิริยาสะเทินคายความร้อนสูง"
  },
  "9": {
    name: "Class 9 : Petroleum Product Waste (ประเภทที่ 9 ผลิตภัณฑ์ปิโตรเลียม)",
    desc: "น้ำมันปิโตรเลียม ผลิตภัณฑ์จากน้ำมัน และของเสียประเภทตัวทำละลายไฮโดรคาร์บอน (น้ำผสม < 5%)",
    examples: "น้ำมันเบนซิน, น้ำมันดีเซล, น้ำมันก๊าด, น้ำมันเครื่อง, น้ำมันหล่อลื่น, เฮกเซน, เพนเทน, ไซลีน",
    guide: "เก็บในภาชนะทนสารเคมี ห่างจากความร้อน ประกายไฟ และสารออกซิไดซ์"
  },
  "10": {
    name: "Class 10 : Oxygenated Waste (ประเภทที่ 10 ของเสียที่มีออกซิเจน)",
    desc: "ของเสียที่เป็นตัวทำละลายอินทรีย์ที่มีออกซิเจนในโครงสร้างหลัก และมีน้ำผสมต่ำกว่า 5%",
    examples: "เอทิลแอซีเตต, อะซิโตน, เอสเทอร์, แอลกอฮอล์, คีโตน, อีเทอร์, แอลดีไฮด์",
    guide: "เก็บในภาชนะปิดสนิท ในพื้นที่แห้งและเย็น ห่างจากแหล่งความร้อนและประกายไฟ"
  },
  "11": {
    name: "Class 11 : NPS Waste (ประเภทที่ 11 ของเสียที่มีไนโตรเจน ฟอสฟอรัส หรือซัลเฟอร์)",
    desc: "ของเสียตัวทำละลายอินทรีย์ที่มีธาตุ N, P, S อยู่ในโครงสร้างโมเลกุล และมีน้ำผสมต่ำกว่า 5%",
    examples: "Dimethylformamide (DMF), Dimethylsulfoxide (DMSO), อะซิโตไนไตรล์, เอมีน, เอไมด์",
    guide: "ห้ามผสมปนกับ Halogenated Waste (ถ้าผสมจะจัดเป็น Special Waste Class 1)"
  },
  "12": {
    name: "Class 12 : Halogenated Waste (ประเภทที่ 12 ของเสียที่มีฮาโลเจน)",
    desc: "ของเสียตัวทำละลายอินทรีย์ที่มีธาตุเฮโลเจนอยู่ในโครงสร้างโมเลกุล (เช่น F, Cl, Br, I) และมีน้ำผสมต่ำกว่า 5%",
    examples: "คาร์บอนเททระคลอไรด์ (CCl₄), คลอโรฟอร์ม (CHCl₃), ไตรคลอโรเอทิลีน",
    guide: "ห้ามผสมปนกับ NPS Waste (ถ้าผสมจะจัดเป็น Special Waste Class 1)"
  },
  "13.1": {
    name: "Class 13.1 : Combustible Solid Waste (ประเภทที่ 13.1 ของแข็งเผาไหม้ได้)",
    desc: "ของเสียเคมีสถานะของแข็งที่สามารถเผาไหม้ได้",
    examples: "เศษซากพืชที่ได้จากการสกัด, ถุงมือยาง/ถุงมือไนไตรล์ปนเปื้อนสารเคมี",
    guide: "รวบรวมใส่ในถุงขยะเคมีทึบหนา มัดปากถุงให้แน่นหนา ปิดป้ายกำกับของเสียปนเปื้อนสารเคมีเผาไหม้ได้"
  },
  "13.2": {
    name: "Class 13.2 : Non-Combustible Solid Waste (ประเภทที่ 13.2 ของแข็งเผาไหม้ไม่ได้)",
    desc: "ของเสียเคมีสถานะของแข็งที่ไม่สามารถเผาไหม้ได้",
    examples: "ซิลิกาเจล (Silica Gel), เศษแก้วแตกปนเปื้อนสารเคมี",
    guide: "รวบรวมใส่ในภาชนะบรรจุหรือกล่องพลาสติกแข็งทนทาน เพื่อป้องกันเศษแก้วแทงทะลุถุง"
  },
  "14": {
    name: "Class 14 : Miscellaneous Aqueous Waste (ประเภทที่ 14 ของเสียน้ำอนินทรีย์ทั่วไป)",
    desc: "ของเสียที่เป็นสารละลายโดยมีน้ำเป็นตัวทำละลาย และไม่มีคุณสมบัติอันตรายจากสารโลหะหนักหรือกรดเบสแก่",
    examples: "สารละลายเกลือแกง 10% NaCl, น้ำเสียทั่วไปที่ไม่ปนเปื้อนโลหะหนัก",
    guide: "บรรจุในขวดเก็บของเสียน้ำเคมีทั่วไป ปิดฝาสนิท"
  },
  "15": {
    name: "Class 15 : Deteriorated or Expired Chemicals (ประเภทที่ 15 ของเสียเคมีเสื่อมสภาพ/หมดอายุ)",
    desc: "สารเคมีดั้งเดิมที่เสื่อมสภาพหรือหมดอายุการใช้งาน แต่สามารถระบุชื่อและอันตรายของสารได้ชัดเจน",
    examples: "ขวดสารเคมีหมดอายุค้างตู้เก็บสาร",
    guide: "ส่งกำจัดในขวดบรรจุดั้งเดิม ห้ามเทผสมรวมกับของเสียอื่นๆ เพื่อป้องกันการเกิดปฏิกิริยารุนแรง"
  },
  "16": {
    name: "Class 16 : Miscellaneous Aqueous Organic Waste (ประเภทที่ 16 ของเสียน้ำปนเปื้อนสารอินทรีย์)",
    desc: "ของเสียตัวทำละลายอินทรีย์ที่มีน้ำผสมอยู่ระหว่าง 5% - 95% และไม่สามารถรีไซเคิลได้",
    examples: "ของเสียอินทรีย์ผสมน้ำจากการทดลองทั่วไป",
    guide: "บรรจุในภาชนะพลาสติกทนสารเคมี ปิดฝาให้สนิท"
  },
  "17.1": {
    name: "Class 17.1 : Recyclable Used Xylene (ประเภทที่ 17.1 ไซลีนรีไซเคิล)",
    desc: "ของเสียสารละลายไซลีนปนเปื้อนน้อย มีน้ำปนเปื้อน < 15% และมีปริมาณมากพอส่งรีไซเคิล",
    examples: "ไซลีนใช้แล้วจากการเตรียมแผ่นสไลด์เนื้อเยื่อพืช/สัตว์",
    guide: "รวบรวมใส่แกลลอนแยกเฉพาะสารเดี่ยว ห้ามเทสารอื่นปนเปื้อน"
  },
  "17.2": {
    name: "Class 17.2 : Recyclable Used Ethanol (ประเภทที่ 17.2 เอทานอลรีไซเคิล)",
    desc: "ของเสียสารละลายเอทานอลปนเปื้อนน้อย มีน้ำปนเปื้อน < 15% และมีปริมาณมากพอส่งรีไซเคิล",
    examples: "เอทานอลใช้แล้วจากการล้างเครื่องมือหรือสกัดสารละลาย",
    guide: "รวบรวมแยกแกลลอนเอทานอลโดยเฉพาะ ปิดฝาสนิทป้องกันการระเหย"
  },
  "17.3": {
    name: "Class 17.3 : Recyclable Used Acetone (ประเภทที่ 17.3 อะซิโตนรีไซเคิล)",
    desc: "ของเสียสารละลายอะซิโตนปนเปื้อนน้อย มีน้ำปนเปื้อน < 15% และมีปริมาณมากพอส่งรีไซเคิล",
    examples: "อะซิโตนใช้แล้วจากการล้างแก้วเครื่องมือวิทยาศาสตร์",
    guide: "รวบรวมแยกใส่แกลลอนพลาสติกเฉพาะสาร ปิดฝาให้แน่นสนิท"
  },
  "17.4": {
    name: "Class 17.4 : Other Recyclable Used Organic Solvent (ประเภทที่ 17.4 ตัวทำละลายอินทรีย์อื่นรีไซเคิล)",
    desc: "ของเสียตัวทำละลายอินทรีย์รีไซเคิลชนิดอื่น ๆ (เช่น เฮกเซน, โทลูอีน, เอทิลแอซีเตต)",
    examples: "เฮกเซน หรือ โทลูอีนใช้แล้วที่มีความเข้มข้นหลัก ≥ 85% และปริมาณรวมสะสม ≥ 18 ลิตร",
    guide: "เก็บรวบรวมแยกเฉพาะชนิดสารตัวทำละลาย ปิดฉลากระบุชนิดตัวทำละลายหลัก"
  }
};

function getWasteClassResponse(classKey) {
  const c = WASTE_CLASSES[classKey];
  if (!c) return `❌ ไม่พบข้อมูลการจำแนกประเภทของเสียรหัส ${classKey} ครับ`;
  
  return `✅ <b>ผลการจำแนกประเภทของเสียสำเร็จ!</b>\n\n` +
         `🏷️ <b>ประเภท:</b> <span style="color: var(--accent-red); font-weight: 600;">${c.name}</span>\n` +
         `📝 <b>คำจำกัดความ:</b> ${c.desc}\n` +
         `🧪 <b>ตัวอย่างสาร:</b> ${c.examples}\n` +
         `⚠️ <b>คำแนะนำส่งกำจัด:</b> ${c.guide}\n\n` +
         `ต้องการเริ่มจำแนกของเสียรายการอื่นใหม่หรือไม่ครับ?\n` +
         `<div class="chat-choices-container">` +
         `  <button class="chat-choice-btn" data-choice="waste_start">เริ่มจำแนกของเสียใหม่</button>` +
         `</div>`;
}

function generateBotResponse(query) {
  const q = query.toLowerCase().trim();

  // WasteTrack Classification Router
  if (q.includes("ทิ้งสารเคมี") || q.includes("จำแนกสารเคมี") || q.includes("วิธีกำจัดสารเคมี") || q.includes("wastetrack") || q.includes("ทิ้งยา") || q.includes("คลาสของเสีย") || q.includes("จำแนกของเสีย") || q === "waste_start") {
    return `🧪 <b>ระบบช่วยเหลือจำแนกประเภทของเสียสารเคมี (CU WasteTrack)</b>\n\n` +
           `อ้างอิงตามระบบการจำแนกของเสียห้องปฏิบัติการ 17 ประเภทของจุฬาลงกรณ์มหาวิทยาลัย\n\n` +
           `<b>คำถามที่ 1:</b> เป็นสารเคมีเสื่อมสภาพหรือหมดอายุ (Deteriorated/Expired) ที่ยังสามารถระบุชื่อและระบุความเป็นอันตรายของสารเคมีนั้นได้ชัดเจนหรือไม่?\n\n` +
           `<div class="chat-choices-container">` +
           `  <button class="chat-choice-btn" data-choice="waste_chem_15">ใช่, เป็นขวดสารเคมีหมดอายุ/เสื่อมสภาพ</button>` +
           `  <button class="chat-choice-btn" data-choice="waste_q2_expired_no">ไม่ใช่ (เป็นสารละลายผสมหรือเศษวัสดุจากการทดลอง)</button>` +
           `</div>`;
  }

  if (q.startsWith("waste_")) {
    if (q === "waste_q2_expired_no") {
      return `<b>คำถามที่ 2:</b> เป็นของเสียพิเศษ (Special Waste) เช่น ของเสียที่ไม่ทราบที่มาแน่ชัด (Unknown Waste) หรือสารก่อมะเร็ง (เช่น เอธิเดียมโบรไมด์ Ethidium Bromide) หรือไม่?\n\n` +
             `<div class="chat-choices-container">` +
             `  <button class="chat-choice-btn" data-choice="waste_chem_1">ใช่, เป็นของเสียพิเศษ/สารก่อมะเร็ง</button>` +
             `  <button class="chat-choice-btn" data-choice="waste_q3_special_no">ไม่ใช่ของเสียพิเศษ</button>` +
             `</div>`;
    }
    if (q === "waste_q3_special_no") {
      return `<b>คำถามที่ 3:</b> มีส่วนผสมหรือปนเปื้อนสารปรอท (Mercury) หรือไม่? (เช่น สารละลายเมอร์คิวรี(II) คลอไรด์, หรือเศษแก้วเทอร์โมมิเตอร์ปนเปื้อนปรอท)\n*(หมายเหตุ: ถ้าผสมกับไซยาไนด์จะจัดเป็น Special Waste Class 1)*\n\n` +
             `<div class="chat-choices-container">` +
             `  <button class="chat-choice-btn" data-choice="waste_chem_4">ใช่, มีส่วนประกอบของปรอท</button>` +
             `  <button class="chat-choice-btn" data-choice="waste_q4_mercury_no">ไม่มีสารปรอทปนเปื้อน</button>` +
             `</div>`;
    }
    if (q === "waste_q4_mercury_no") {
      return `<b>คำถามที่ 4:</b> มีอนุมูลไซยาไนด์ (Inorganic Cyanide) เป็นองค์ประกอบ หรือเป็นสารประกอบเชิงซ้อนไซยาไนด์ หรือไม่? (เช่น สารละลายโพแทสเซียมไซยาไนด์, สารเชิงซ้อน Ni(CN)₄²⁻)\n*(หมายเหตุ: ถ้าผสมกับปรอทจะจัดเป็น Special Waste Class 1)*\n\n` +
             `<div class="chat-choices-container">` +
             `  <button class="chat-choice-btn" data-choice="waste_chem_2">ใช่, มีไซยาไนด์ปนเปื้อน</button>` +
             `  <button class="chat-choice-btn" data-choice="waste_q5_cyanide_no">ไม่มีไซยาไนด์</button>` +
             `</div>`;
    }
    if (q === "waste_q5_cyanide_no") {
      return `<b>คำถามที่ 5:</b> สถานะทางกายภาพของของเสียเป็น **ของแข็ง (Solid)** หรือไม่?\n\n` +
             `<div class="chat-choices-container">` +
             `  <button class="chat-choice-btn" data-choice="waste_q6_solid_yes">ใช่, มีสถานะเป็นของแข็ง</button>` +
             `  <button class="chat-choice-btn" data-choice="waste_q6_solid_no">ไม่ใช่, เป็นของเหลว/สารละลาย</button>` +
             `</div>`;
    }
    if (q === "waste_q6_solid_yes") {
      return `<b>คำถามที่ 6 (ของแข็ง):</b> ของแข็งดังกล่าวเป็นของแข็งเผาไหม้ได้ (Combustible เช่น เศษซากพืชที่ได้จากการสกัด, ถุงมือยางปนเปื้อนเคมี) หรือเผาไหม้ไม่ได้ (Non-Combustible เช่น ซิลิกาเจล, เศษแก้วแตกทั่วไป)?\n\n` +
             `<div class="chat-choices-container">` +
             `  <button class="chat-choice-btn" data-choice="waste_chem_13_1">ของแข็งเผาไหม้ได้ (Combustible)</button>` +
             `  <button class="chat-choice-btn" data-choice="waste_chem_13_2">ของแข็งเผาไหม้ไม่ได้ (Non-Combustible)</button>` +
             `</div>`;
    }
    if (q === "waste_q6_solid_no") {
      return `<b>คำถามที่ 6 (ของเหลว):</b> เป็นของเสียตัวทำละลายอินทรีย์ (Organic Solvent Waste) ใช่หรือไม่?\n\n` +
             `<div class="chat-choices-container">` +
             `  <button class="chat-choice-btn" data-choice="waste_q7_organic_yes">ใช่, เป็นตัวทำละลายอินทรีย์</button>` +
             `  <button class="chat-choice-btn" data-choice="waste_q7_organic_no">ไม่ใช่ (เป็นน้ำเสียมีน้ำเป็นตัวทำละลาย / Inorganic Aqueous)</button>` +
             `</div>`;
    }
    if (q === "waste_q7_organic_yes") {
      return `<b>คำถามที่ 7 (สารอินทรีย์):</b> เป็นตัวทำละลายใช้แล้วที่ปนเปื้อนน้อย มีน้ำปนเปื้อนไม่เกิน 15% มีปริมาณมากพอส่งส่งเข้าโครงการ **Recycle** หรือไม่?\n\n` +
             `<div class="chat-choices-container">` +
             `  <button class="chat-choice-btn" data-choice="waste_q8_recycle_yes">ใช่, ต้องการส่ง Recycle</button>` +
             `  <button class="chat-choice-btn" data-choice="waste_q8_recycle_no">ไม่ต้องการ Recycle (หรือสารปนเปื้อนเยอะ/น้ำปนเกิน 15%)</button>` +
             `</div>`;
    }
    if (q === "waste_q8_recycle_yes") {
      return `เลือกประเภทตัวทำละลายอินทรีย์รีไซเคิลของท่าน:\n\n` +
             `<div class="chat-choices-container">` +
             `  <button class="chat-choice-btn" data-choice="waste_chem_17_1">ของเสียไซลีน (Xylene)</button>` +
             `  <button class="chat-choice-btn" data-choice="waste_chem_17_2">ของเสียเอทานอล (Ethanol)</button>` +
             `  <button class="chat-choice-btn" data-choice="waste_chem_17_3">ของเสียอะซิโตน (Acetone)</button>` +
             `  <button class="chat-choice-btn" data-choice="waste_chem_17_4">สารตัวทำละลายอินทรีย์อื่นๆ ที่จะรีไซเคิล</button>` +
             `</div>`;
    }
    if (q === "waste_q8_recycle_no") {
      return `<b>คำถามที่ 8 (สารอินทรีย์ไม่รีไซเคิล):</b> มีน้ำผสมปนเปื้อนอยู่ตั้งแต่ 5% ขึ้นไป (H₂O ≥ 5%) ใช่หรือไม่?\n\n` +
             `<div class="chat-choices-container">` +
             `  <button class="chat-choice-btn" data-choice="waste_chem_16">ใช่, มีน้ำผสมปนเปื้อน ≥ 5%</button>` +
             `  <button class="chat-choice-btn" data-choice="waste_q9_water_low">ไม่ใช่, มีน้ำผสมต่ำมาก (< 5%)</button>` +
             `</div>`;
    }
    if (q === "waste_q9_water_low") {
      return `<b>คำถามที่ 9 (ตัวทำละลายอินทรีย์น้ำต่ำ):</b> ในโครงสร้างโมเลกุลมีธาตุเฮโลเจน (Halogen - เช่น F, Cl, Br, I) เป็นองค์ประกอบหลักใช่หรือไม่? (เช่น CCl₄, คลอโรฟอร์ม, ไตรคลอโรเอทิลีน)\n*(หมายเหตุ: ถ้าผสมกับ NPS Waste จะจัดเป็น Special Waste Class 1)*\n\n` +
             `<div class="chat-choices-container">` +
             `  <button class="chat-choice-btn" data-choice="waste_chem_12">ใช่, มีธาตุฮาโลเจนในโครงสร้าง</button>` +
             `  <button class="chat-choice-btn" data-choice="waste_q10_halogen_no">ไม่มีธาตุฮาโลเจน</button>` +
             `</div>`;
    }
    if (q === "waste_q10_halogen_no") {
      return `<b>คำถามที่ 10:</b> ในโครงสร้างโมเลกุลมีธาตุไนโตรเจน (N), ฟอสฟอรัส (P), หรือ ซัลเฟอร์ (S) เป็นองค์ประกอบใช่หรือไม่? (เช่น Dimethylformamide - DMF, Dimethylsulfoxide - DMSO, อะซิโตไนไตรล์)\n*(หมายเหตุ: ถ้าผสมกับ Halogenated Waste จะจัดเป็น Special Waste Class 1)*\n\n` +
             `<div class="chat-choices-container">` +
             `  <button class="chat-choice-btn" data-choice="waste_chem_11">ใช่, มีธาตุ N, P, หรือ S</button>` +
             `  <button class="chat-choice-btn" data-choice="waste_q11_nps_no">ไม่มีธาตุกลุ่ม N, P, S</button>` +
             `</div>`;
    }
    if (q === "waste_q11_nps_no") {
      return `<b>คำถามที่ 11:</b> ในโครงสร้างโมเลกุลมีธาตุออกซิเจน (O) เป็นองค์ประกอบใช่หรือไม่? (เช่น เอทิลแอซีเตต, อะซิโตน, แอลกอฮอล์, คีโตน, อีเทอร์)\n\n` +
             `<div class="chat-choices-container">` +
             `  <button class="chat-choice-btn" data-choice="waste_chem_10">ใช่, มีธาตุออกซิเจน</button>` +
             `  <button class="chat-choice-btn" data-choice="waste_q12_oxygen_no">ไม่มีธาตุออกซิเจน</button>` +
             `</div>`;
    }
    if (q === "waste_q12_oxygen_no") {
      return `<b>คำถามที่ 12:</b> เป็นของเสียกลุ่มสารประกอบไฮโดรคาร์บอน (Hydrocarbon) ใช่หรือไม่? (เช่น น้ำมันเบนซิน, ดีเซล, น้ำมันเครื่อง, เฮกเซน, เพนเทน)\n\n` +
             `<div class="chat-choices-container">` +
             `  <button class="chat-choice-btn" data-choice="waste_chem_9">ใช่, เป็นสารไฮโดรคาร์บอน</button>` +
             `  <button class="chat-choice-btn" data-choice="waste_chem_16">ไม่ใช่กลุ่มสารไฮโดรคาร์บอน</button>` +
             `</div>`;
    }
    if (q === "waste_q7_organic_no") {
      return `<b>คำถามที่ 7 (น้ำเสียอนินทรีย์):</b> มีส่วนประกอบหลักเป็นสารประกอบโครเมียม (Chromium) หรือไม่? (เช่น สารประกอบ Cr(VI), กรดโครมิก, น้ำเสียวิเคราะห์ COD)\n*(หมายเหตุ: ถ้าผสมกับ Mercury Waste จะจัดเป็น Mercury Waste Class 4)*\n\n` +
             `<div class="chat-choices-container">` +
             `  <button class="chat-choice-btn" data-choice="waste_chem_5">ใช่, มีโครเมียมปนเปื้อน</button>` +
             `  <button class="chat-choice-btn" data-choice="waste_q8_chromium_no">ไม่มีสารโครเมียม</button>` +
             `</div>`;
    }
    if (q === "waste_q8_chromium_no") {
      return `<b>คำถามที่ 8 (น้ำเสียอนินทรีย์):</b> มีคุณสมบัติเป็นสารออกซิไดซ์ (Oxidizing Agent) ที่อาจทำปฏิกิริยารุนแรงหรือไม่? (เช่น กรดไนตริก/ซัลฟิวริกเข้มข้น >60%, ด่างทับทิม, โซเดียมคลอเรต)\n*(หมายเหตุ: ถ้าผสมกับโครเมียมจะจัดเป็น Chromium Waste Class 5)*\n\n` +
             `<div class="chat-choices-container">` +
             `  <button class="chat-choice-btn" data-choice="waste_chem_3">ใช่, มีความเป็นสารออกซิไดซ์</button>` +
             `  <button class="chat-choice-btn" data-choice="waste_q9_oxidizer_no">ไม่มีสมบัติออกซิไดซ์</button>` +
             `</div>`;
    }
    if (q === "waste_q9_oxidizer_no") {
      return `<b>คำถามที่ 9 (น้ำเสียอนินทรีย์):</b> มีส่วนผสมของโลหะหนักอื่นเจือปนอยู่อย่างเข้มข้นมากกว่า 0.1 g/L (100 ppm) หรือไม่? (โลหะหนักอื่นๆ ที่ไม่ใช่ปรอทและโครเมียม เช่น แคดเมียม ตะกั่ว ทองแดง สังกะสี นิกเกิล เงิน)\n\n` +
             `<div class="chat-choices-container">` +
             `  <button class="chat-choice-btn" data-choice="waste_chem_6">ใช่, มีโลหะหนักเจือปนความเข้มข้นสูง</button>` +
             `  <button class="chat-choice-btn" data-choice="waste_q10_heavy_no">ไม่มีโลหะหนัก หรือมีน้อยมาก (< 0.1 g/L)</button>` +
             `</div>`;
    }
    if (q === "waste_q10_heavy_no") {
      return `<b>คำถามที่ 10 (น้ำเสียอนินทรีย์):</b> ของเสียสารละลายนี้มีความเป็นกรดแก่หรือเบสแก่ปนเปื้อนอยู่เกิน 5% ใช่หรือไม่?\n\n` +
             `<div class="chat-choices-container">` +
             `  <button class="chat-choice-btn" data-choice="waste_chem_7">ใช่, เป็นกรดเด่น (pH < 7)</button>` +
             `  <button class="chat-choice-btn" data-choice="waste_chem_8">ใช่, เป็นเบสเด่น (pH > 8)</button>` +
             `  <button class="chat-choice-btn" data-choice="waste_chem_14">ไม่ใช่ (เป็นสารละลายน้ำทั่วไป เช่น น้ำเกลือเจือจาง)</button>` +
             `</div>`;
    }

    if (q.startsWith("waste_chem_")) {
      const classKey = q.substring(11).replace("_", ".");
      return getWasteClassResponse(classKey);
    }
  }

  // Chemical Knowledge Base for Pronunciation & Reactions
  const CHEM_DB = {
    "กรดไฮโดรคลอริก": {
      read: "กรด-ไฮ-โดร-คลอ-ริก",
      formula: "HCl",
      commonName: "กรดเกลือ",
      aliases: ["กรดไฮโดรคลอริก", "กรดเกลือ", "hcl"],
      reactions: [
        { partner: "โซเดียมไฮดรอกไซด์", product: "เกลือแกง (โซเดียมคลอไรด์) + น้ำ (เกิดปฏิกิริยาสะเทิน คลายความร้อน)", equation: "HCl + NaOH → NaCl + H₂O" },
        { partner: "โซเดียมไบคาร์บอเนต", product: "โซเดียมคลอไรด์ + น้ำ + แก๊สคาร์บอนไดออกไซด์ (เกิดฟองแก๊สฟูฟ่อง)", equation: "HCl + NaHCO₃ → NaCl + H₂O + CO₂" },
        { partner: "แคลเซียมคาร์บอเนต", product: "แคลเซียมคลอไรด์ + น้ำ + แก๊สคาร์บอนไดออกไซด์ (หินปูนสึกกร่อน เกิดฟองแก๊ส)", equation: "2HCl + CaCO₃ → CaCl₂ + H₂O + CO₂" },
        { partner: "สังกะสี", product: "ซิงค์คลอไรด์ (Zinc Chloride) + แก๊สไฮโดรเจน (เกิดแก๊สไวไฟชนิดเบา)", equation: "2HCl + Zn → ZnCl₂ + H₂" }
      ]
    },
    "โซเดียมไฮดรอกไซด์": {
      read: "โซ-เดียม-ไฮ-ดรอก-ไซด์",
      formula: "NaOH",
      commonName: "โซดาไฟ",
      aliases: ["โซเดียมไฮดรอกไซด์", "โซดาไฟ", "naoh"],
      reactions: [
        { partner: "กรดไฮโดรคลอริก", product: "เกลือแกง (โซเดียมคลอไรด์) + น้ำ (เกิดปฏิกิริยาสะเทิน คลายความร้อน)", equation: "NaOH + HCl → NaCl + H₂O" },
        { partner: "กรดแอซีติก", product: "โซเดียมแอซีเตต (Sodium Acetate) + น้ำ", equation: "NaOH + CH₃COOH → CH₃COONa + H₂O" }
      ]
    },
    "เอทานอล": {
      read: "เอ-ทา-นอล",
      formula: "C₂H₅OH",
      commonName: "แอลกอฮอล์, เอทิลแอลกอฮอล์",
      aliases: ["เอทานอล", "แอลกอฮอล์", "เอทิลแอลกอฮอล์", "c2h5oh"],
      reactions: [
        { partner: "กรดซาลิไซลิก", product: "เอทิลซาลิไซเลต (Ethyl Salicylate) ซึ่งเป็นเอสเทอร์ที่มีกลิ่นหอมคล้ายน้ำมันระกำ (โดยใช้กรดซัลฟิวริกเข้มข้นเป็นตัวเร่งปฏิกิริยาในปฏิกิริยา Esterification)", equation: "C₇H₆O₃ + C₂H₅OH → C₉H₁₀O₃ + H₂O" }
      ]
    },
    "กรดแอซีติก": {
      read: "กรด-แอ-ซี-ติก",
      formula: "CH₃COOH",
      commonName: "กรดอะซิติก, กรดน้ำส้ม",
      aliases: ["กรดแอซีติก", "กรดอะซิติก", "กรดน้ำส้ม", "ch3cooh"],
      reactions: [
        { partner: "โซเดียมไบคาร์บอเนต", product: "โซเดียมแอซีเตต + น้ำ + แก๊สคาร์บอนไดออกไซด์ (เกิดฟองฟูฟ่องอย่างรวดเร็ว)", equation: "CH₃COOH + NaHCO₃ → CH₃COONa + H₂O + CO₂" },
        { partner: "โซเดียมไฮดรอกไซด์", product: "โซเดียมแอซีเตต + น้ำ", equation: "CH₃COOH + NaOH → CH₃COONa + H₂O" }
      ]
    },
    "โซเดียมไบคาร์บอเนต": {
      read: "โซ-เดียม-ไบ-คาร์-บอ-เนต",
      formula: "NaHCO₃",
      commonName: "เบกกิ้งโซดา, ผงฟู",
      aliases: ["โซเดียมไบคาร์บอเนต", "เบกกิ้งโซดา", "ผงฟู", "nahco3"],
      reactions: [
        { partner: "กรดแอซีติก", product: "โซเดียมแอซีเตต + น้ำ + แก๊สคาร์บอนไดออกไซด์ (เกิดฟองฟูฟ่อง)", equation: "NaHCO₃ + CH₃COOH → CH₃COONa + H₂O + CO₂" },
        { partner: "กรดไฮโดมคลอริก", product: "โซเดียมคลอไรด์ + น้ำ + แก๊สคาร์บอนไดออกไซด์ (เกิดฟองแก๊ส)", equation: "NaHCO₃ + HCl → NaCl + H₂O + CO₂" }
      ]
    },
    "แคลเซียมคาร์บอเนต": {
      read: "แคล-เซียม-คา-บอ-เนต",
      formula: "CaCO₃",
      commonName: "หินปูน",
      aliases: ["แคลเซียมคาร์บอเนต", "หินปูน", "ชอล์ก", "caco3"],
      reactions: [
        { partner: "กรดไฮโดรคลอริก", product: "แคลเซียมคลอไรด์ + น้ำ + แก๊สคาร์บอนไดออกไซด์ (หินปูนสึกกร่อน เกิดฟองแก๊สคาร์บอนไดออกไซด์)", equation: "CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂" }
      ]
    },
    "น้ำ": {
      read: "น้ำ",
      formula: "H₂O",
      commonName: "-",
      aliases: ["น้ำ", "h2o"],
      reactions: [
        { partner: "โซเดียม", product: "โซเดียมไฮดรอกไซด์ + แก๊สไฮโดรเจน (เกิดปฏิกิริยารุนแรงมาก คลายความร้อนสูง มีเปลวไฟและเกิดระเบิดเล็กน้อย)", equation: "2Na + 2H₂O → 2NaOH + H₂" }
      ]
    },
    "โซเดียม": {
      read: "โซ-เดียม",
      formula: "Na",
      commonName: "-",
      aliases: ["โซเดียม", "na"],
      reactions: [
        { partner: "น้ำ", product: "โซเดียมไฮดรอกไซด์ + แก๊สไฮโดรเจน (เกิดปฏิกิริยารุนแรง คลายความร้อนสูงและเปลวไฟ)", equation: "2Na + 2H₂O → 2NaOH + H₂" }
      ]
    },
    "กรดซัลฟิวริก": {
      read: "กรด-ซัล-ฟิว-ริก",
      formula: "H₂SO₄",
      commonName: "กรดกำมะถัน",
      aliases: ["กรดซัลฟิวริก", "กรดกำมะถัน", "h2so4"],
      reactions: [
        { partner: "น้ำ", product: "กรดซัลฟิวริกเจือจาง (ข้อควรระวัง: ปฏิกิริยาคายความร้อนสูงมาก ห้ามเทน้ำลงในกรดเข้มข้น ให้ใช้วิธีค่อยๆ เทกรดเข้มข้นลงในน้ำช้าๆ)", equation: "H₂SO₄ + H₂O → H₃O⁺ + HSO₄⁻ (คายความร้อนสูง)" }
      ]
    }
  };

  // Helper to normalize subscripts to standard digits
  const normalizeSubscripts = (str) => {
    const subscriptMap = {
      '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
      '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9'
    };
    return str.replace(/[₀-₉]/g, m => subscriptMap[m]);
  };
  const qSubNormal = normalizeSubscripts(q);

  // 0A. NEW SMART CHATBOT FEATURES
  
  // 1. Equation Balancer Routing
  const isBalanceQuery = q.includes("ดุล") || q.includes("ดล") || q.includes("สมการ") || q.includes("balance");
  if (isBalanceQuery) {
    let cleanQuery = query;
    const subscriptMap = {
      '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
      '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9'
    };
    cleanQuery = cleanQuery.replace(/[₀-₉]/g, m => subscriptMap[m]);
    
    const eqMatch = cleanQuery.match(/[A-Za-z0-9()·*.\s\-+=>→➔]+/);
    if (eqMatch) {
      const candidate = eqMatch[0].trim();
      if (candidate.includes("->") || candidate.includes("=") || candidate.includes("➔") || candidate.includes("→")) {
        return balanceEquation(candidate);
      }
    }

    return `🧪 <b>ระบบดุลสมการเคมีอัตโนมัติ (Chemical Equation Balancer)</b>\n\n` +
           `กรุณาระบุสมการเคมีที่ต้องการดุล โดยใช้เครื่องหมาย <code>-&gt;</code> หรือ <code>=</code> ในการแยกสารตั้งต้นและผลิตภัณฑ์ เช่น:\n` +
           `- <i>"ดุลสมการ H2 + O2 -&gt; H2O"</i>\n` +
           `- <i>"ช่วยดุลสมการ Fe + Cl2 = FeCl3 หน่อย"</i>`;
  }

  // 2. Molar Mass Calculator Routing
  const isMolarMassQuery = q.includes("มวล") || q.includes("โมเลกุล") || q.includes("โฒเลกุล") || q.includes("molar") || q.includes("mw") || q.includes("molecular") || q.includes("weight") || q.includes("น้ำหนัก");
  if (isMolarMassQuery) {
    const ELEM_MAP = {};
    for (let k of Object.keys(ATOMIC_WEIGHTS)) {
      ELEM_MAP[k.toLowerCase()] = k;
    }

    function findElementCasing(s) {
      if (s === "") return "";
      
      // Try 2 letters first
      if (s.length >= 2) {
        const two = s.slice(0, 2).toLowerCase();
        const standardTwo = ELEM_MAP[two];
        if (standardTwo) {
          const rest = findElementCasing(s.slice(2));
          if (rest !== null) {
            return standardTwo + rest;
          }
        }
      }
      
      // Try 1 letter
      if (s.length >= 1) {
        const one = s.slice(0, 1).toLowerCase();
        const standardOne = ELEM_MAP[one];
        if (standardOne) {
          const rest = findElementCasing(s.slice(1));
          if (rest !== null) {
            return standardOne + rest;
          }
        }
      }
      
      return null;
    }

    function autoCapitalizeChemicalFormula(formulaStr) {
      return formulaStr.replace(/[A-Za-z]+/g, (match) => {
        const capitalized = findElementCasing(match);
        return capitalized !== null ? capitalized : match;
      });
    }

    const getFormulaFromText = (txt) => {
      const subscriptMap = {
        '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
        '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9'
      };
      let cleanQuery = txt.replace(/[₀-₉]/g, m => subscriptMap[m]);
      
      const words = cleanQuery.match(/[A-Za-z0-9()·*.]+/g);
      if (!words) return null;
      
      const COMMON_FORMULAS = {
        'h2o': 'H2O', 'nacl': 'NaCl', 'naoh': 'NaOH', 'hcl': 'HCl',
        'h2so4': 'H2SO4', 'ch3cooh': 'CH3COOH', 'c2h5oh': 'C2H5OH',
        'nahco3': 'NaHCO3', 'caco3': 'CaCO3', 'co2': 'CO2', 'o2': 'O2',
        'h2': 'H2', 'n2': 'N2', 'cl2': 'Cl2', 'nh3': 'NH3', 'ch4': 'CH4',
        'c6h12o6': 'C6H12O6', 'c12h22o11': 'C12H22O11', 'hno3': 'HNO3',
        'h3po4': 'H3PO4', 'cuso4': 'CuSO4', 'mgso4': 'MgSO4', 'caso4': 'CaSO4',
        'baso4': 'BaSO4', 'kno3': 'KNO3', 'nano3': 'NaNO3', 'nh4cl': 'NH4Cl',
        'nh4no3': 'NH4NO3', 'na2co3': 'Na2CO3', 'k2co3': 'K2CO3', 'khco3': 'KHCO3',
        'ki': 'KI', 'kbr': 'KBr', 'kcl': 'KCl', 'na2so4': 'Na2SO4',
        'k2so4': 'K2SO4', 'mgco3': 'MgCO3', 'ca(oh)2': 'Ca(OH)2', 'ba(oh)2': 'Ba(OH)2',
        'al(oh)3': 'Al(OH)3', 'koh': 'KOH', 'hf': 'HF', 'hbr': 'HBr',
        'hi': 'HI', 'o3': 'O3', 'f2': 'F2', 'br2': 'Br2', 'i2': 'I2',
        'co': 'CO', 'no': 'NO', 'c': 'C', 's': 'S', 'p': 'P', 'fe': 'Fe',
        'cu': 'Cu', 'zn': 'Zn', 'al': 'Al', 'mg': 'Mg', 'ca': 'Ca', 'na': 'Na',
        'k': 'K', 'li': 'Li', 'cocl2': 'CoCl2', 'h2o2': 'H2O2', 'fe2o3': 'Fe2O3',
        'fe3o4': 'Fe3O4', 'al2o3': 'Al2O3', 'sio2': 'SiO2', 'so2': 'SO2',
        'so3': 'SO3', 'no2': 'NO2', 'n2o': 'N2O', 'h2s': 'H2S', 'hcn': 'HCN',
        'licl': 'LiCl', 'pbs': 'PbS', 'cuo': 'CuO', 'zno': 'ZnO', 'mno': 'MnO',
        'feo': 'FeO', 'agno3': 'AgNO3', 'pb(no3)2': 'Pb(NO3)2'
      };
      
      for (let word of words) {
        const lowerWord = word.toLowerCase();
        
        // 1. Check direct match in COMMON_FORMULAS
        if (COMMON_FORMULAS[lowerWord]) {
          return COMMON_FORMULAS[lowerWord];
        }
        
        // 2. Check candidate filters
        const isCandidate = 
          /[0-9()·*.]/.test(word) || // contains digit or structure chars
          /^[A-Z]/.test(word) ||     // starts with uppercase
          COMMON_FORMULAS[lowerWord] !== undefined;
          
        if (isCandidate) {
          // Attempt auto-capitalization
          const capitalized = autoCapitalizeChemicalFormula(word);
          const parsed = parseFormula(capitalized);
          if (parsed && Object.keys(parsed).length > 0) {
            let allValid = true;
            for (let elem of Object.keys(parsed)) {
              if (!ATOMIC_WEIGHTS[elem]) {
                allValid = false;
                break;
              }
            }
            if (allValid) return capitalized;
          }
        }
      }
      return null;
    };

    const rawFormula = getFormulaFromText(query);
    if (rawFormula) {
      const res = getFormulaWeightBreakdown(rawFormula);
      if (res && !res.error) {
        const { totalMass, breakdown } = res;
        let html = `⚖️ <b>ผลการคำนวณมวลโมเลกุล (Molar Mass Calculator)</b>\n`;
        html += `สูตรเคมี: <b>${formatChemicalFormula(rawFormula)}</b>\n\n`;
        html += `<table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12.5px; background: #ffffff; border: 1px solid rgba(226, 232, 240, 0.8); border-radius: 6px; overflow: hidden;">`;
        html += `<thead>`;
        html += `<tr style="background-color: var(--bg-hover); border-bottom: 2px solid rgba(226, 232, 240, 0.8); text-align: left;">`;
        html += `<th style="padding: 8px; font-weight: 600;">ธาตุ</th>`;
        html += `<th style="padding: 8px; font-weight: 600; text-align: right;">มวลอะตอม</th>`;
        html += `<th style="padding: 8px; font-weight: 600; text-align: center;">จำนวน</th>`;
        html += `<th style="padding: 8px; font-weight: 600; text-align: right;">มวลรวม (g/mol)</th>`;
        html += `</tr>`;
        html += `</thead>`;
        html += `<tbody>`;
        
        breakdown.forEach((item, index) => {
          const bg = index % 2 === 0 ? '#ffffff' : 'rgba(248, 250, 252, 0.5)';
          html += `<tr style="background: ${bg}; border-bottom: 1px solid rgba(226, 232, 240, 0.5);">`;
          html += `<td style="padding: 8px; font-weight: 600; color: var(--primary-color);">${item.elem}</td>`;
          html += `<td style="padding: 8px; text-align: right; color: var(--text-muted);">${item.weight.toFixed(4)}</td>`;
          html += `<td style="padding: 8px; text-align: center;">${item.count}</td>`;
          html += `<td style="padding: 8px; text-align: right; font-weight: 500;">${item.total.toFixed(4)}</td>`;
          html += `</tr>`;
        });
        
        html += `</tbody>`;
        html += `</table>\n`;
        html += `<div style="border-top: 2.5px double var(--primary-color); margin-top: 8px; padding-top: 8px; text-align: right; font-weight: 700; font-size: 14.5px;">`;
        html += `มวลโมเลกุลรวม: <span style="color: var(--primary-color); font-family: 'Sora', monospace;">${totalMass.toFixed(4)} g/mol</span>`;
        html += `</div>`;
        
        return html;
      } else if (res && res.error) {
        return `❌ <b>ข้อผิดพลาด:</b> ${res.error}`;
      }
    }

    return `⚖️ <b>ระบบคำนวณมวลโมเลกุล (Molar Mass Calculator)</b>\n\n` +
           `กรุณาระบุสูตรเคมีที่คุณต้องการคำนวณมวลโมเลกุล (สามารถพิมพ์ตัวพิมพ์เล็กหรือตัวพิมพ์ใหญ่ได้) เช่น:\n` +
           `- <i>"มวลโมเลกุล H2O"</i> หรือ <i>"มวลโมเลกุล h2o"</i>\n` +
           `- <i>"คำนวณมวลโมเลกุลของ Ca(OH)2"</i> หรือ <i>"คำนวณมวลโฒเลกุลของ ca(oh)2"</i>\n` +
           `- <i>"mw c6h12o6"</i>`;
  }

  // 3. Solution Prep Calculator Routing
  const isPrep = q.includes("เตรียมสาร") || q.includes("เตรียมความเข้มข้น") || q.includes("เจือจาง") || q.includes("dilute") || q.includes("c1v1") || q === "วิธีเตรียมสารละลาย";
  if (isPrep) {
    return calculateSolutionPrep(query);
  }

  // 4. Safety & Emergency Advisor Routing
  const isSafety = q.includes("ความปลอดภัย") || q.includes("ปฐมพยาบาล") || q.includes("สารเคมีหก") || q.includes("กรดหก") || q.includes("ด่างหก") || q.includes("สารหก") || q.includes("โดนผิว") || q.includes("สัมผัสผิว") || q.includes("เข้าตา") || q.includes("สูดดม") || q.includes("ดมแก๊ส") || q.includes("กลืนกิน") || q.includes("กินสารเคมี") || q.includes("safety") || q.includes("first aid");
  if (isSafety) {
    let key = null;
    if (q.includes("หก") || q.includes("spill")) key = "spill";
    else if (q.includes("ผิว") || q.includes("skin")) key = "skin";
    else if (q.includes("ตา") || q.includes("eye")) key = "eye";
    else if (q.includes("สูด") || q.includes("ดม") || q.includes("inhale")) key = "inhale";
    else if (q.includes("กิน") || q.includes("กลืน") || q.includes("ingest")) key = "ingest";

    if (key && SAFETY_DB[key]) {
      const data = SAFETY_DB[key];
      return `${data.title}\n\n` +
             `<ol style="padding-left: 20px; margin: 8px 0; font-size: 13px; line-height: 1.6; display: flex; flex-direction: column; gap: 8px;">` +
             data.steps.map(step => `<li>${step}</li>`).join('') +
             `</ol>`;
    } else {
      return `🛡️ <b>ระบบแนะนำความปลอดภัยและการปฐมพยาบาลเบื้องต้น (Lab Safety):</b>\n\n` +
             `กรุณาคลิกหรือระบุอุบัติเหตุที่เกิดขึ้นเพื่อรับวิธีรับมือทันที:\n\n` +
             `1. 🚨 <b>สารเคมีหกเลอะ:</b> พิมพ์ <i>"ปฐมพยาบาลสารเคมีหก"</i> หรือ <i>"กรดหก"</i>\n` +
             `2. ⚠️ <b>สารเคมีสัมผัสผิวหนัง:</b> พิมพ์ <i>"สารเคมีโดนผิวหนัง"</i>\n` +
             `3. 👀 <b>สารเคมีเข้าตา:</b> พิมพ์ <i>"สารเคมีเข้าตา"</i>\n` +
             `4. 🫁 <b>สูดดมแก๊สพิษ/ไอระเหย:</b> พิมพ์ <i>"สูดดมไอระเหย"</i>\n` +
             `5. 👄 <b>กลืนกินสารเคมี:</b> พิมพ์ <i>"กลืนกินสารเคมี"</i>`;
    }
  }

  // Find matches in CHEM_DB
  const matchedKeys = [];
  for (const [key, chem] of Object.entries(CHEM_DB)) {
    let found = false;
    if (qSubNormal.includes(key.toLowerCase())) found = true;
    if (qSubNormal.includes(normalizeSubscripts(chem.formula).toLowerCase())) found = true;
    if (chem.aliases && chem.aliases.some(alias => qSubNormal.includes(normalizeSubscripts(alias).toLowerCase()))) {
      found = true;
    }
    if (found) {
      matchedKeys.push(key);
    }
  }

  // 1A. MULTIPLE CHEMICALS REACTION
  if (matchedKeys.length >= 2) {
    const keyA = matchedKeys[0];
    const keyB = matchedKeys[1];
    
    // Find reaction keyA + keyB
    const chemA = CHEM_DB[keyA];
    const reaction = chemA.reactions.find(r => 
      qSubNormal.includes(r.partner.toLowerCase()) || 
      CHEM_DB[r.partner].aliases.some(alias => qSubNormal.includes(normalizeSubscripts(alias).toLowerCase()))
    );

    if (reaction) {
      return `🧪 <b>ปฏิกิริยาเคมีระหว่าง ${keyA} (${chemA.formula}) กับ ${reaction.partner} (${CHEM_DB[reaction.partner].formula}):</b>\n\n` +
             `- <b>ผลผลิตที่ได้:</b> ${reaction.product}\n` +
             `- <b>สมการเคมี:</b> <code>${reaction.equation}</code>`;
    } else {
      // Try reverse check (keyB + keyA)
      const chemB = CHEM_DB[keyB];
      const revReaction = chemB.reactions.find(r => 
        qSubNormal.includes(r.partner.toLowerCase()) || 
        CHEM_DB[r.partner].aliases.some(alias => qSubNormal.includes(normalizeSubscripts(alias).toLowerCase()))
      );

      if (revReaction) {
        return `🧪 <b>ปฏิกิริยาเคมีระหว่าง ${keyB} (${chemB.formula}) กับ ${revReaction.partner} (${CHEM_DB[revReaction.partner].formula}):</b>\n\n` +
               `- <b>ผลผลิตที่ได้:</b> ${revReaction.product}\n` +
               `- <b>สมการเคมี:</b> <code>${revReaction.equation}</code>`;
      } else {
        return `🧪 ไม่พบข้อมูลปฏิกิริยาเคมีโดยตรงระหว่าง <b>${keyA}</b> และ <b>${keyB}</b> ในคลังความรู้แล็บ ณ ขณะนี้ครับ สารคู่นี้อาจไม่ทำปฏิกิริยากันภายใต้สภาวะปกติ หรือเป็นปฏิกิริยาที่ต้องใช้สภาวะเฉพาะในการเร่งปฏิกิริยาครับ`;
      }
    }
  }

  // 1B. SINGLE CHEMICAL PENDING DETAILS (Pronunciation or Single Reaction List)
  if (matchedKeys.length === 1) {
    const key = matchedKeys[0];
    const chem = CHEM_DB[key];
    
    // Check if query is about pronunciation OR if it is a direct match
    const isPronounce = qSubNormal.includes("อ่านว่า") || qSubNormal.includes("อ่านอย่างไร") || qSubNormal.includes("อ่านว่าอย่างไร") || qSubNormal.includes("อ่านว่ายังไง") || qSubNormal.includes("อ่านออกเสียง") || qSubNormal.includes("สอนอ่าน");
    const isReaction = qSubNormal.includes("ทำปฏิกิริยา") || qSubNormal.includes("ปฏิกิริยา") || qSubNormal.includes("ผสม") || qSubNormal.includes("เกิดอะไร") || qSubNormal.includes("ได้อะไร") || qSubNormal.includes("ทำปฏิกิริยากับอะไร");

    const isDirectMatch = (
      qSubNormal === normalizeSubscripts(chem.formula).toLowerCase() ||
      qSubNormal === key.toLowerCase() ||
      (chem.aliases && chem.aliases.some(alias => qSubNormal === normalizeSubscripts(alias).toLowerCase()))
    );

    if (isDirectMatch || isPronounce) {
      return `🗣️\n` +
             `- สารเคมี ${chem.formula} คือ ${key}\n` +
             `- คำอ่านภาษาไทย "${chem.read}"\n` +
             `- ชื่ออื่นๆ/ชื่อสามัญ ${chem.commonName || "-"}`;
    }

    if (isReaction) {
      let res = `🧪 <b>ข้อมูลปฏิกิริยาเคมีของ ${key} (${chem.formula}):</b>\n\n`;
      res += `สารนี้สามารถทำปฏิกิริยากับสารเคมีพื้นฐานอื่นๆ ในคลังได้ดังนี้ครับ:\n\n`;
      chem.reactions.forEach((r, idx) => {
        res += `${idx + 1}. <b>ทำปฏิกิริยากับ ${r.partner}:</b>\n`;
        res += `   - ผลผลิต: ${r.product}\n`;
        res += `   - สมการ: <code>${r.equation}</code>\n\n`;
      });
      return res.trim();
    }
  }

  // 1C. FALLBACK RECOGNITION FOR INVENTORY ITEMS
  if (q.includes("อ่านว่า") || q.includes("อ่านอย่างไร") || q.includes("อ่านว่าอย่างไร") || q.includes("อ่านว่ายังไง") || q.includes("ทำปฏิกิริยา") || q.includes("ปฏิกิริยา")) {
    // Find if any item in inventory is mentioned in the query
    const matchedItem = items.find(item => q.includes(item.name.toLowerCase()));
    if (matchedItem) {
      return `🗣️🧪 ผมพบสารเคมี/อุปกรณ์ชื่อ <b>"${matchedItem.name}"</b> ในระบบคลัง (รหัส: ${matchedItem.code}) แต่ปัจจุบันข้อมูลคำอ่านและสมการปฏิกิริยาของสารนี้ยังไม่ได้ถูกบันทึกไว้ในฐานความรู้ของผมครับ\n\n💡 แนะนำให้ลองพิมพ์ถามสารเคมีพื้นฐานอื่นๆ เช่น: <i>กรดไฮโดรคลอริก, โซเดียมไฮดรอกไซด์, เอทานอล, กรดแอซีติก, โซเดียมไบคาร์บอเนต, แคลเซียมคาร์บอเนต หรือ กรดซัลฟิวริก</i> ครับ`;
    }
  }

  // 1. GREETINGS
  if (q === "สวัสดี" || q === "สวัสดีครับ" || q === "สวัสดีค่ะ" || q === "หวัดดี" || q === "hello" || q === "hi") {
    return `สวัสดีครับ! ยินดีที่ได้พูดคุยกับคุณในวันนี้ ผมคือ <b>แคททาไลต์ (Catalyst)</b> ตัวเร่งปฏิกิริยาและผู้ช่วยห้องแล็บส่วนตัวของคุณ ผมมีฟีเจอร์อัจฉริยะช่วยอำนวยความสะดวกในแล็บดังนี้ครับ:
- 🧪 <b>ดุลสมการเคมีอัตโนมัติ:</b> พิมพ์ <i>"ดุลสมการ C3H8 + O2 -> CO2 + H2O"</i>
- ⚖️ <b>คำนวณมวลโมเลกุล:</b> พิมพ์ <i>"มวลโมเลกุล Ca(OH)2"</i> หรือสูตรเคมีอื่นๆ
- 💧 <b>เครื่องช่วยคำนวณเตรียมสารละลาย:</b> พิมพ์ <i>"เตรียมสาร"</i> หรือ <i>"เจือจางจาก 10 M เป็น 2 M ปริมาตร 250 mL"</i>
- 🚨 <b>แนะนำความปลอดภัย/ปฐมพยาบาล:</b> พิมพ์ <i>"ปฐมพยาบาลสารเคมีหก"</i> หรือ <i>"กรดเข้าตา"</i>
- 🔍 <b>ค้นหาพัสดุ/ข้อมูลสารเคมีพื้นฐาน:</b> เช่นพิมพ์ <i>"ค้นหา เอทานอล"</i> หรือเช็คสต็อกต่ำและหมดอายุ
บอกผมได้เลยครับว่าอยากให้ช่วยตรงจุดไหนครับ`;
  }

  // 2. HELP SYSTEM / SYSTEM USAGE
  if (q.includes("ยืม") || q.includes("คืน") || q.includes("การยืม") || q.includes("วิธีใช้งานระบบ") || q.includes("แนะนำการใช้งาน")) {
    return `📖 <b>วิธีการยืม-คืนพัสดุ:</b>
1. กดเลือกเมนู <b>"ยืม-คืนพัสดุ"</b> ที่แถบเมนูด้านซ้าย
2. <b>การยืม:</b> กรอกชื่อผู้ยืม ค้นหาชื่อพัสดุและระบุจำนวนที่ต้องการ แล้วกดปุ่ม <b>"ยืนยันการยืมพัสดุ"</b>
3. <b>การคืน:</b> กรอกชื่อผู้คืน ระบบจะแสดงรายการล่าสุดที่ยืมไป สามารถเลือกจำนวนพัสดุเพื่อระบุของชำรุด (ถ้ามี) แล้วกด <b>"ยืนยันการส่งคืน"</b>
4. รายการประวัติจะอัปเดตลงตารางประวัติในหน้านั้นทันทีครับ`;
  }

  if (q.includes("จอง") || q.includes("จองห้อง") || q.includes("จองแล็บ") || q.includes("ห้องปฏิบัติการ")) {
    return `🏫 <b>วิธีการจองห้องปฏิบัติการ (Lab Booking):</b>
1. ไปที่เมนู <b>"จองห้องปฏิบัติการ"</b>
2. เลือกห้องปฏิบัติการ วันที่ และคาบเรียนที่ต้องการจอง
3. กรอกรายละเอียดวิชา/ผู้จอง แล้วกด <b>"ยืนยันการจอง"</b>
4. รายการจองจะไปบันทึกอยู่ด้านล่างสุดของหน้าตารางประวัติการจองห้องแล็บครับ`;
  }

  if (q.includes("ชำรุด") || q.includes("ส่งซ่อม") || q.includes("ประแจ") || q.includes("ซ่อม")) {
    return `🔧 <b>ระบบจัดการพัสดุชำรุดและส่งซ่อม:</b>
1. หากส่งคืนพัสดุแล้วแจ้งว่าชำรุด จะมาแสดงในแถบ <b>"พัสดุชำรุดและส่งซ่อม"</b> หน้าแรก
2. เจ้าหน้าที่ (Admin) หรือครู (Teacher) สามารถคลิกปุ่ม <b>ประแจ 🔧</b> เพื่อ:
   - สั่งส่งไปที่ห้องซ่อมบำรุง
   - แจ้งซ่อมสำเร็จเพื่อนำพัสดุกลับเข้าสู่คลังสินค้าดีตามเดิม
   - แจ้งซ่อมไม่ได้และตัดทิ้ง (จำหน่ายออก) ถาวรจากสต็อก`;
  }

  // 3. CHECK EXPIRED
  if (q.includes("หมดอายุ") || q.includes("expired") || q === "เช็คสารเคมีหมดอายุ") {
    // Expiration date reference is TODAY (2026-05-28)
    const today = new Date('2026-05-28');
    const expiredList = items.filter(item => {
      if (!item.expiry) return false;
      const exp = new Date(item.expiry);
      return exp < today;
    });

    const nearExpiryList = items.filter(item => {
      if (!item.expiry) return false;
      const exp = new Date(item.expiry);
      const diffTime = exp.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 30; // within 30 days
    });

    let res = "";
    if (expiredList.length > 0) {
      res += `🚨 <b>พัสดุ/สารเคมีที่หมดอายุแล้ว:</b>\n`;
      expiredList.forEach(item => {
        res += `- ${item.name} (${item.code}) หมดเมื่อ: <i>${item.expiry}</i>\n`;
      });
    }
    if (nearExpiryList.length > 0) {
      res += `${res ? '\n' : ''}⚠️ <b>สารเคมีที่ใกล้หมดอายุใน 30 วัน:</b>\n`;
      nearExpiryList.forEach(item => {
        res += `- ${item.name} (${item.code}) หมดวันที่: <i>${item.expiry}</i>\n`;
      });
    }
    if (!res) {
      res = `✅ ยอดเยี่ยมมาก! ตรวจสอบแล้วไม่มีสารเคมีตัวใดที่หมดอายุหรือใกล้หมดอายุในคลังตอนนี้ครับ`;
    }
    return res;
  }

  // 4. CHECK LOW STOCK
  if (q.includes("สต็อกต่ำ") || q.includes("ใกล้หมด") || q.includes("ใกล้หมดคลัง") || q.includes("เช็คสินค้าสต็อกต่ำ") || q.includes("ของใกล้หมดคลัง")) {
    const lowStockList = items.filter(item => {
      const min = item.minAlert || 0;
      return (item.qty || 0) <= min;
    });

    if (lowStockList.length > 0) {
      let res = `⚠️ <b>รายการพัสดุที่สต็อกต่ำกว่าเกณฑ์แจ้งเตือน:</b>\n`;
      lowStockList.forEach(item => {
        res += `- ${item.name} เหลือ <i>${item.qty} ${item.unit}</i> (เกณฑ์เตือน: ${item.minAlert})\n`;
      });
      return res;
    } else {
      return `✅ ไม่มีพัสดุรายการใดต่ำกว่าเกณฑ์เตือนภัยครับ ทุกชิ้นมีพัสดุในจำนวนที่ปลอดภัยในคลัง`;
    }
  }

  // 5. ITEM LOCATIONS / INVENTORY QUERY
  // Check if they want to find an item
  let searchWord = query;
  const searchPrefixes = ["ค้นหา", "มี", "หา", "เช็ค", "เช็ก", "ขอดู", "ดู", "อยากได้", "ขอ"];
  for (const prefix of searchPrefixes) {
    if (q.startsWith(prefix)) {
      searchWord = query.substring(prefix.length).trim();
      break;
    }
  }
  
  // Clean suffixes
  const searchSuffixes = ["ไหม", "หรือเปล่า", "บ้าง", "ครับ", "ค่ะ", "หน่อย", "ที", "อยู่ตู้ไหน", "อยู่ไหน", "อยู่ที่ไหน", "อยู่ห้องไหน"];
  for (const suffix of searchSuffixes) {
    if (searchWord.endsWith(suffix)) {
      searchWord = searchWord.substring(0, searchWord.length - suffix.length).trim();
    }
  }

  if (searchWord.length >= 2) {
    // Search in items
    const matches = items.filter(item => 
      item.name.toLowerCase().includes(searchWord.toLowerCase()) || 
      item.code.toLowerCase().includes(searchWord.toLowerCase()) ||
      item.category.toLowerCase().includes(searchWord.toLowerCase())
    );

    if (matches.length > 0) {
      let res = `🔍 <b>ผลการค้นหาพัสดุ (${matches.length} รายการ):</b>\n`;
      matches.forEach(item => {
        res += `\n📦 <b>${item.name}</b>\n`;
        res += `- รหัสพัสดุ: <i>${item.code}</i>\n`;
        res += `- จำนวนคงเหลือ: <b>${item.qty} ${item.unit}</b>\n`;
        res += `- หมวดหมู่: ${item.category}\n`;
        res += `- ที่จัดเก็บ: ห้อง <i>${getRoomThaiName(item.room)}</i>, ${item.cabinet || "-"} / ${item.shelf || "-"}\n`;
        if (item.damagedQty > 0) {
          res += `- ⚠️ ชำรุด: ${item.damagedQty} ${item.unit}\n`;
        }
        if (item.repairQty > 0) {
          res += `- 🔧 ส่งซ่อม: ${item.repairQty} ${item.unit}\n`;
        }
      });
      return res;
    }
  }

  // 6. DEFAULT FALLBACK
  return `🤔 ขออภัยด้วยครับ ผมยังไม่เข้าใจคำถามนี้ทั้งหมด หรือไม่พบข้อมูลพัสดุที่ระบุ
  
หากคุณต้องการข้อมูลใด สามารถลองพิมพ์หัวข้อดังนี้ได้ครับ:
- พิมพ์ชื่อพัสดุเพื่อค้นหา เช่น <i>"เอทานอล"</i> หรือ <i>"บีกเกอร์"</i>
- พิมพ์เพื่อเช็คสต็อก เช่น <i>"ของใกล้หมด"</i> หรือ <i>"หมดอายุ"</i>
- พิมพ์ถามการใช้งาน เช่น <i>"วิธีจองห้อง"</i> หรือ <i>"วิธียืมคืน"</i>`;
}

// ============================================================================
// NEW HELPER FUNCTIONS & DATA BASES FOR SMART LAB ASSISTANT
// ============================================================================

// ATOMIC WEIGHTS DICTIONARY FOR MOLAR MASS CALCULATOR
const ATOMIC_WEIGHTS = {
  H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999,
  F: 18.998, Ne: 20.180, Na: 22.990, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06,
  Cl: 35.45, Ar: 39.948, K: 39.098, Ca: 40.078, Sc: 44.956, Ti: 47.867, V: 50.942, Cr: 51.996,
  Mn: 54.938, Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546, Zn: 65.38, Ga: 69.723, Ge: 72.63,
  As: 74.922, Se: 78.971, Br: 79.904, Kr: 83.798, Rb: 85.468, Sr: 87.62, Y: 88.906, Zr: 91.224,
  Nb: 92.906, Mo: 95.95, Tc: 98, Ru: 101.07, Rh: 102.91, Pd: 106.42, Ag: 107.87, Cd: 112.41,
  In: 114.82, Sn: 118.71, Sb: 121.76, Te: 127.60, I: 126.90, Xe: 131.29, Cs: 132.91, Ba: 137.33,
  La: 138.91, Ce: 140.12, Pr: 140.91, Nd: 144.24, Pm: 145, Sm: 150.36, Eu: 151.96, Gd: 157.25,
  Tb: 158.93, Dy: 162.50, Ho: 164.93, Er: 167.26, Tm: 168.93, Yb: 173.05, Lu: 174.97, Hf: 178.49,
  Ta: 180.95, W: 183.84, Re: 186.21, Os: 190.23, Ir: 192.22, Pt: 195.08, Au: 196.97, Hg: 200.59,
  Tl: 204.38, Pb: 207.2, Bi: 208.98, Po: 209, At: 210, Rn: 222, Fr: 223, Ra: 226, Ac: 227,
  Th: 232.04, Pa: 231.04, U: 238.03
};

function parseFormula(formulaStr) {
  let str = formulaStr.replace(/\s+/g, '');
  const subscriptMap = {
    '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
    '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9'
  };
  str = str.replace(/[₀-₉]/g, m => subscriptMap[m]);

  // Handle hydrates e.g., CuSO4*5H2O or CuSO4.5H2O
  const parts = str.split(/[·*.]/);
  if (parts.length > 1) {
    const result = {};
    for (let part of parts) {
      const match = part.match(/^(\d+)(.*)$/);
      if (match) {
        const coef = parseInt(match[1], 10);
        const subForm = match[2];
        const parsed = parseStandardFormula(subForm);
        for (let [elem, count] of Object.entries(parsed)) {
          result[elem] = (result[elem] || 0) + count * coef;
        }
      } else {
        const parsed = parseStandardFormula(part);
        for (let [elem, count] of Object.entries(parsed)) {
          result[elem] = (result[elem] || 0) + count;
        }
      }
    }
    return result;
  }

  const mainMatch = str.match(/^(\d+)(.*)$/);
  if (mainMatch) {
    const coef = parseInt(mainMatch[1], 10);
    const subForm = mainMatch[2];
    const parsed = parseStandardFormula(subForm);
    const result = {};
    for (let [elem, count] of Object.entries(parsed)) {
      result[elem] = count * coef;
    }
    return result;
  }

  return parseStandardFormula(str);
}

function parseStandardFormula(str) {
  const result = {};
  let i = 0;
  const n = str.length;

  function parseGroup() {
    const group = {};
    while (i < n) {
      const char = str[i];
      if (char === '(') {
        i++; // skip '('
        const subGroup = parseGroup();
        let mult = 1;
        let digits = '';
        while (i < n && /\d/.test(str[i])) {
          digits += str[i];
          i++;
        }
        if (digits) {
          mult = parseInt(digits, 10);
        }
        for (let [elem, count] of Object.entries(subGroup)) {
          group[elem] = (group[elem] || 0) + count * mult;
        }
      } else if (char === ')') {
        i++; // skip ')'
        return group;
      } else if (/[A-Z]/.test(char)) {
        let elem = char;
        i++;
        if (i < n && /[a-z]/.test(str[i])) {
          elem += str[i];
          i++;
        }
        let count = 1;
        let digits = '';
        while (i < n && /\d/.test(str[i])) {
          digits += str[i];
          i++;
        }
        if (digits) {
          count = parseInt(digits, 10);
        }
        group[elem] = (group[elem] || 0) + count;
      } else {
        i++;
      }
    }
    return group;
  }

  return parseGroup();
}

function getFormulaWeightBreakdown(formulaStr) {
  const parsed = parseFormula(formulaStr);
  if (!parsed || Object.keys(parsed).length === 0) return null;
  
  let totalMass = 0;
  const breakdown = [];
  for (let [elem, count] of Object.entries(parsed)) {
    const weight = ATOMIC_WEIGHTS[elem];
    if (!weight) return { error: `ไม่พบธาตุ <b>"${elem}"</b> ในฐานข้อมูลน้ำหนักอะตอม` };
    const elemTotal = weight * count;
    totalMass += elemTotal;
    breakdown.push({ elem, weight, count, total: elemTotal });
  }
  return { totalMass, breakdown };
}

function formatChemicalFormula(formulaStr) {
  const subMap = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
  };
  return formulaStr.replace(/[·*.]/g, '·').replace(/\d/g, m => subMap[m]);
}

function balanceEquation(equationText) {
  let cleanText = equationText.replace(/\s+/g, '');
  const subscriptMap = {
    '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
    '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9'
  };
  cleanText = cleanText.replace(/[₀-₉]/g, m => subscriptMap[m]);

  const sides = cleanText.split(/->|-->|=>|=/);
  if (sides.length !== 2) {
    return "❌ รูปแบบสมการไม่ถูกต้อง กรุณาใช้เครื่องหมาย <code>-&gt;</code> หรือ <code>=</code> ในการแยกสารตั้งต้นและผลิตภัณฑ์ (เช่น <code>C3H8 + O2 -&gt; CO2 + H2O</code>)";
  }

  const reactantStrs = sides[0].split('+').filter(Boolean);
  const productStrs = sides[1].split('+').filter(Boolean);

  if (reactantStrs.length === 0 || productStrs.length === 0) {
    return "❌ สมการต้องมีสารตั้งต้นและสารผลิตภัณฑ์อย่างน้อย 1 ชนิด";
  }

  const reactants = reactantStrs.map(str => ({ original: str, parsed: parseFormula(str) }));
  const products = productStrs.map(str => ({ original: str, parsed: parseFormula(str) }));
  const allCompounds = [...reactants, ...products];

  const elementsSet = new Set();
  for (let comp of allCompounds) {
    for (let elem of Object.keys(comp.parsed)) {
      elementsSet.add(elem);
    }
  }
  const elements = Array.from(elementsSet);

  if (elements.length === 0) {
    return "❌ ไม่พบธาตุเคมีในสมการที่ระบุ";
  }

  for (let elem of elements) {
    if (!ATOMIC_WEIGHTS[elem]) {
      return `❌ ไม่พบธาตุ <b>"${elem}"</b> ในระบบน้ำหนักอะตอม`;
    }
  }

  const numRows = elements.length;
  const numCols = allCompounds.length;

  const matrix = Array.from({ length: numRows }, () => Array(numCols).fill(0));
  for (let i = 0; i < numRows; i++) {
    const elem = elements[i];
    for (let j = 0; j < reactants.length; j++) {
      matrix[i][j] = reactants[j].parsed[elem] || 0;
    }
    for (let j = 0; j < products.length; j++) {
      matrix[i][reactants.length + j] = -(products[j].parsed[elem] || 0);
    }
  }

  rref(matrix);

  const numRowsM = matrix.length;
  const numColsM = matrix[0].length;
  
  const pivotRow = {};
  for (let r = 0; r < numRowsM; r++) {
    let leadCol = -1;
    for (let c = 0; c < numColsM; c++) {
      if (Math.abs(matrix[r][c]) > 1e-9) {
        leadCol = c;
        break;
      }
    }
    if (leadCol !== -1) {
      pivotRow[leadCol] = r;
    }
  }

  const isPivot = Array(numColsM).fill(false);
  for (let c of Object.keys(pivotRow)) {
    isPivot[Number(c)] = true;
  }

  const freeCols = [];
  for (let c = 0; c < numColsM; c++) {
    if (!isPivot[c]) {
      freeCols.push(c);
    }
  }

  if (freeCols.length === 0) {
    return "❌ ไม่สามารถดุลสมการนี้ได้ (สมการอาจไม่ถูกต้องหรือไม่สมดุลทางเคมี)";
  }

  const rawSolution = Array(numColsM).fill(0);
  for (let fc of freeCols) {
    rawSolution[fc] = 1.0;
  }

  for (let c = 0; c < numColsM; c++) {
    if (isPivot[c]) {
      const r = pivotRow[c];
      let val = 0;
      for (let fc of freeCols) {
        val -= matrix[r][fc] * rawSolution[fc];
      }
      rawSolution[c] = val;
    }
  }

  if (rawSolution.some(val => val < 1e-9)) {
    return "❌ ไม่สามารถดุลสมการนี้ได้ (สัมประสิทธิ์ที่คำนวณได้ติดลบหรือเป็นศูนย์ สมการนี้ไม่สมดุลทางเคมีหรือสารไม่มีการทำปฏิกิริยากัน)";
  }

  let scale = -1;
  for (let k = 1; k <= 1000; k++) {
    let allInt = true;
    for (let val of rawSolution) {
      const scaledVal = val * k;
      if (Math.abs(Math.round(scaledVal) - scaledVal) > 1e-5) {
        allInt = false;
        break;
      }
    }
    if (allInt) {
      scale = k;
      break;
    }
  }

  if (scale === -1) {
    return "❌ ไม่สามารถแปลงสัมประสิทธิ์เป็นจำนวนเต็มต่ำได้ (สัมประสิทธิ์มีค่าเป็นทศนิยมที่ไม่สิ้นสุดหรือมีขนาดใหญ่เกินเกณฑ์เตือนภัย)";
  }

  const coefficients = rawSolution.map(val => Math.round(val * scale));

  const formatSubscripts = (str) => {
    const subMap = {
      '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
      '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
    };
    let formulaPart = str.replace(/^\d+/, '');
    formulaPart = formulaPart.replace(/[·*.]/g, '·');
    return formulaPart.replace(/\d/g, m => subMap[m]);
  };

  const reactantParts = [];
  for (let j = 0; j < reactants.length; j++) {
    const coef = coefficients[j];
    const formatted = formatSubscripts(reactants[j].original);
    reactantParts.push(coef === 1 ? formatted : `${coef}${formatted}`);
  }

  const productParts = [];
  for (let j = 0; j < products.length; j++) {
    const coef = coefficients[reactants.length + j];
    const formatted = formatSubscripts(products[j].original);
    productParts.push(coef === 1 ? formatted : `${coef}${formatted}`);
  }

  const finalEquation = `${reactantParts.join(' + ')} ➔ ${productParts.join(' + ')}`;

  return `🧪 <b>ผลการดุลสมการเคมีสำเร็จ!</b>\n\n` +
         `<div style="font-size: 15px; font-weight: 600; padding: 12px; background-color: var(--bg-hover); border-radius: var(--border-radius-md); border-left: 4px solid var(--primary-color); margin: 8px 0; font-family: 'Sora', monospace; letter-spacing: 0.5px;">` +
         `${finalEquation}` +
         `</div>\n` +
         `📋 <b>อัตราส่วนสัมประสิทธิ์จำเพาะ:</b>\n` +
         `<ul>` +
         reactants.map((r, i) => `<li><b>${formatSubscripts(r.original)}:</b> ${coefficients[i]}</li>`).join('') +
         products.map((p, i) => `<li><b>${formatSubscripts(p.original)}:</b> ${coefficients[reactants.length + i]} (ผลิตภัณฑ์)</li>`).join('') +
         `</ul>`;
}

function calculateSolutionPrep(query) {
  const q = query.toLowerCase().trim();

  const dilutionRegex = /(?:เจือจาง|dilute).*?(\d+(?:\.\d+)?)\s*(?:m|%|โมลาร์).*?(?:เป็น|ต้องการ)\s*(\d+(?:\.\d+)?)\s*(?:m|%|โมลาร์).*?(?:ปริมาตร|ขนาด)?\s*(\d+(?:\.\d+)?)\s*(ml|l|มล|ลิตร)/i;
  const dilutionMatch = q.match(dilutionRegex) || q.match(/(\d+(?:\.\d+)?)\s*(?:m|%|โมลาร์).*?(?:เจือจางเป็น|เป็น|ต้องการ)\s*(\d+(?:\.\d+)?)\s*(?:m|%|โมลาร์).*?(\d+(?:\.\d+)?)\s*(ml|l|มล|ลิตร)/i);

  if (dilutionMatch) {
    const c1 = parseFloat(dilutionMatch[1]);
    const c2 = parseFloat(dilutionMatch[2]);
    const v2Val = parseFloat(dilutionMatch[3]);
    const v2Unit = dilutionMatch[4].toLowerCase();

    if (c1 <= c2) {
      return "⚠️ ความเข้มข้นเริ่มต้น (C₁) ต้องมากกว่าความเข้มข้นที่ต้องการ (C₂) สำหรับการเจือจางสารละลายครับ";
    }

    let v2 = v2Val;
    if (v2Unit === 'l' || v2Unit === 'ลิตร') {
      v2 = v2Val * 1000;
    }

    const v1 = (c2 * v2) / c1;
    const solvent = v2 - v1;

    return `💧 <b>ผลการคำนวณเตรียมสารละลายด้วยการเจือจาง (Dilution):</b>\n\n` +
           `- <b>สูตรที่ใช้:</b> <code>C₁V₁ = C₂V₂</code>\n` +
           `- <b>ค่าที่ระบุ:</b> ความเข้มข้นเริ่มต้น (C₁) = <b>${c1} M</b>, ความเข้มข้นที่ต้องการ (C₂) = <b>${c2} M</b>, ปริมาตรสุทธิ (V₂) = <b>${v2Val} ${v2Unit === 'l' || v2Unit === 'ลิตร' ? 'L' : 'mL'}</b>\n\n` +
           `🧪 <b>วิธีการเตรียม:</b>\n` +
           `1. ตวงสารละลายเข้มข้นเริ่มต้น (C₁) ปริมาตร <b>${v1.toFixed(2)} mL</b>\n` +
           `2. นำไปเทใส่ขวดวัดปริมาตร (Volumetric Flask) ขนาด <b>${v2.toFixed(0)} mL</b>\n` +
           `3. เติมตัวทำละลาย (เช่น น้ำกลั่น) ปริมาตร <b>${solvent.toFixed(2)} mL</b> (หรือเติมจนถึงขีดบอกปริมาตรของขวดวัดปริมาตร)\n` +
           `4. ปิดฝาแล้วกลับขวดไปมาเพื่อให้สารผสมเป็นเนื้อเดียวกัน`;
  }

  const solidMatch = q.match(/(\d+(?:\.\d+)?)\s*(?:m|โมลาร์).*?(?:ปริมาตร)?\s*(\d+(?:\.\d+)?)\s*(ml|l|มล|ลิตร).*?(?:มวลโมเลกุล|mw|g\/mol)?\s*(\d+(?:\.\d+)?)/i) ||
                     q.match(/(?:มวลโมเลกุล|mw).*?(\d+(?:\.\d+)?).*?(\d+(?:\.\d+)?)\s*(?:m|โมลาร์).*?(?:ปริมาตร)?\s*(\d+(?:\.\d+)?)\s*(ml|l|มล|ลิตร)/i);

  if (solidMatch) {
    let m, vVal, vUnit, mw;
    if (solidMatch[3] === 'ml' || solidMatch[3] === 'l' || solidMatch[3] === 'มล' || solidMatch[3] === 'ลิตร') {
      m = parseFloat(solidMatch[1]);
      vVal = parseFloat(solidMatch[2]);
      vUnit = solidMatch[3].toLowerCase();
      mw = parseFloat(solidMatch[4]);
    } else {
      mw = parseFloat(solidMatch[1]);
      m = parseFloat(solidMatch[2]);
      vVal = parseFloat(solidMatch[3]);
      vUnit = solidMatch[4].toLowerCase();
    }

    if (isNaN(m) || isNaN(vVal) || isNaN(mw)) {
      return "⚠️ รูปแบบค่าที่ระบุไม่ถูกต้อง กรุณาระบุ ความเข้มข้น (M), ปริมาตร (mL หรือ L) และ มวลโมเลกุล (g/mol) ให้ครบถ้วน";
    }

    let vL = vVal;
    if (vUnit === 'ml' || vUnit === 'มล') {
      vL = vVal / 1000;
    }

    const g = m * mw * vL;
    const vML = vUnit === 'ml' || vUnit === 'มล' ? vVal : vVal * 1000;

    return `⚖️ <b>ผลการคำนวณเตรียมสารละลายจากของแข็ง/สารบริสุทธิ์:</b>\n\n` +
           `- <b>สูตรที่ใช้:</b> <code>g = M × MW × V (ลิตร)</code>\n` +
           `- <b>ค่าที่ระบุ:</b> ความเข้มข้นที่ต้องการ (M) = <b>${m} M</b>, ปริมาตร (V) = <b>${vVal} ${vUnit === 'l' || vUnit === 'ลิตร' ? 'L' : 'mL'}</b>, มวลโมเลกุล (MW) = <b>${mw} g/mol</b>\n\n` +
           `🧪 <b>วิธีการเตรียม:</b>\n` +
           `1. ชั่งสารตั้งต้นของแข็งปริมาณ <b>${g.toFixed(4)} กรัม</b> ด้วยเครื่องชั่งสารอย่างละเอียด\n` +
           `2. เทสารลงในบีกเกอร์และเติมน้ำกลั่นเล็กน้อย คนจนละลายหมด\n` +
           `3. เทสารที่ละลายแล้วลงในขวดวัดปริมาตรขนาด <b>${vML.toFixed(0)} mL</b>\n` +
           `4. กลั้วบีกเกอร์ด้วยน้ำกลั่นและเทใส่ขวดวัดปริมาตร เพื่อนำสารที่ตกค้างออกให้หมด\n` +
           `5. เติมน้ำกลั่นลงขวดวัดปริมาตรจนถึงขีดบอกปริมาตร ปิดฝาแล้วกลับขวดไปมาให้เข้ากัน`;
  }

  return `💧 <b>วิธีการคำนวณเตรียมสารละลายด้วย Catalyst:</b>\n\n` +
         `คุณสามารถพิมพ์ถามคำนวณการเตรียมสารได้ 2 วิธีดังนี้ครับ:\n\n` +
         `1️⃣ <b>การเตรียมสารละลายจากของแข็ง (Solid)</b>\n` +
         `- <b>สูตร:</b> <code>g = M × MW × V</code>\n` +
         `- <b>วิธีถาม:</b> พิมพ์ความเข้มข้น ปริมาตร และมวลโมเลกุล เช่น:\n` +
         `  👉 <i>"เตรียมสาร 0.5 M ปริมาตร 500 mL มวลโมเลกุล 40"</i>\n\n` +
         `2️⃣ <b>การเจือจางสารละลาย (Dilution)</b>\n` +
         `- <b>สูตร:</b> <code>C₁V₁ = C₂V₂</code>\n` +
         `- <b>วิธีถาม:</b> พิมพ์ความเข้มข้นเริ่มต้น ความเข้มข้นที่ต้องการ และปริมาตร เช่น:\n` +
         `  👉 <i>"เจือจางจาก 10 M เป็น 2 M ปริมาตร 250 mL"</i>`;
}

const SAFETY_DB = {
  spill: {
    title: "🚨 <b>วิธีปฏิบัติและปฐมพยาบาลกรณีสารเคมีหกเลอะ (Chemical Spill)</b>",
    steps: [
      "<b>อพยพคน:</b> พาผู้คนที่ไม่เกี่ยวข้องออกจากพื้นที่หกทันที หากเป็นสารระเหยง่ายหรือมีกลิ่นฉุน",
      "<b>สวมเครื่องป้องกัน:</b> สวมถุงมือยาง แว่นตานิรภัย และหน้ากากกรองสารเคมีก่อนเริ่มการทำความสะอาด",
      "<b>กรณีเป็นกรดหก:</b> ค่อยๆ เติมผงโซเดียมไบคาร์บอเนต (เบกกิ้งโซดา) หรือปูนขาวลงบนบริเวณที่หกเพื่อทำปฏิกิริยาสะเทินจนฟองแก๊สหมด",
      "<b>กรณีเป็นเบส/ด่างหก:</b> ค่อยๆ เติมสารละลายกรดแอซีติกเจือจาง (น้ำส้มสายชู) เพื่อทำปฏิกิริยาสะเทิน",
      "<b>ดูดซับสาร:</b> ใช้ทรายแห้ง ดินซิลิกา หรือวัสดุดูดซับเฉื่อยเทกลบทับสารเคมีที่สะเทินแล้ว กวาดเก็บใส่ถังพลาสติกปิดฝามิดชิด ติดป้ายระบุสารเพื่อส่งกำจัดอย่างถูกต้อง"
    ]
  },
  skin: {
    title: "⚠️ <b>ปฐมพยาบาลกรณีสารเคมีสัมผัสผิวหนัง (Skin Contact)</b>",
    steps: [
      "<b>ถอดเสื้อผ้าออก:</b> รีบถอดเสื้อผ้า เครื่องประดับ หรือรองเท้าส่วนที่สัมผัสกับสารเคมีออกโดยเร็วที่สุด",
      "<b>ล้างน้ำสะอาด:</b> ชำระล้างผิวหนังส่วนนั้นด้วยน้ำสะอาดไหลผ่านปริมาณมากๆ อย่างน้อย 15 นาที",
      "<b>ข้อควรระวังสำคัญ: ห้ามใช้กรดหรือด่างมาทำปฏิกิริยาสะเทินบนผิวหนังเด็ดขาด!</b> เพราะความร้อนจากปฏิกิริยาสะเทินจะซ้ำเติมให้ผิวหนังไหม้รุนแรงยิ่งขึ้น",
      "<b>ส่งพบแพทย์:</b> หากผิวหนังเกิดผื่นแดง ไหม้พอง หรือระคายเคืองรุนแรง ให้รีบนำตัวส่งโรงพยาบาลพร้อมชื่อสารเคมี"
    ]
  },
  eye: {
    title: "👀 <b>ปฐมพยาบาลกรณีสารเคมีเข้าตา (Eye Contact)</b>",
    steps: [
      "<b>ใช้ที่ล้างตาฉุกเฉิน:</b> รีบพยุงผู้ป่วยไปยังอ่างล้างตาฉุกเฉิน (Emergency Eyewash) ทันที",
      "<b>เปิดตาและล้างน้ำ:</b> ลืมตาในน้ำสะอาดไหลผ่านเบาๆ โดยใช้นิ้วถ่างเปลือกตาให้กว้างและกลอกตาไปมาเพื่อให้ล้างสารเคมีออกได้ทั่วถึง",
      "<b>ล้างอย่างต่อเนื่อง:</b> ล้างตานานอย่างน้อย 15-20 นาที",
      "<b>ห้ามขยี้ตา:</b> ห้ามขยี้ตาหรือทายาหยอดตาใดๆ ก่อนพบแพทย์",
      "<b>พบแพทย์ด่วน:</b> รีบส่งตัวไปพบจักษุแพทย์เพื่อตรวจรักษาทันทีหลังล้างตาเสร็จ"
    ]
  },
  inhale: {
    title: "🫁 <b>ปฐมพยาบาลกรณีสูดดมไอระเหย/แก๊สพิษ (Inhalation)</b>",
    steps: [
      "<b>ย้ายไปที่อากาศถ่ายเท:</b> รีบเคลื่อนย้ายผู้ป่วยออกจากจุดเกิดเหตุไปยังที่ที่มีอากาศบริสุทธิ์และถ่ายเทสะดวกทันที",
      "<b>คลายเสื้อผ้า:</b> จัดให้ผู้ป่วยนอนราบ คลายเสื้อผ้าและเข็มขัดให้หลวมเพื่อให้หน้าอกขยายและหายใจสะดวก",
      "<b>ปฐมพยาบาลการหายใจ:</b> หากผู้ป่วยหยุดหายใจหรือหายใจติดขัด ให้ทำ CPR ทันที (ระวังอย่าสูดลมหายใจที่ปนเปื้อนแก๊สพิษจากผู้ป่วย)",
      "<b>ส่งตัวพบแพทย์:</b> รีบนำส่งแพทย์ทันทีและคอยสังเกตอาการหายใจอย่างใกล้ชิด"
    ]
  },
  ingest: {
    title: "👄 <b>ปฐมพยาบาลกรณีกลืนกินสารเคมี (Ingestion)</b>",
    steps: [
      "<b>ตรวจสอบสติ:</b> หากผู้ป่วยหมดสติ ห้ามนำสิ่งใดใส่ปากหรือพยายามทำให้อาเจียนเด็ดขาด ให้จัดท่านอนตะแคงป้องกันการอุดกั้นทางเดินหายใจ",
      "<b>ห้ามทำให้อาเจียนเด็ดขาดหากเป็นสารกัดกร่อน:</b> หากกลืนกิน <b>กรดแก่ ด่างแก่ หรือน้ำมันเชื้อเพลิง</b> ห้ามทำให้อาเจียน เพราะจะทำให้สารเคมีกัดกร่อนหลอดอาหารซ้ำอีกรอบหรือสำลักเข้าสู่ปอด ให้บ้วนปากด้วยน้ำสะอาดมากๆ",
      "<b>กลืนกินสารทั่วไป:</b> ให้ผู้ป่วยกลั้วคอบ้วนปากด้วยน้ำสะอาดหลายๆ ครั้ง",
      "<b>ส่งตัวพบแพทย์ด่วน:</b> รีบส่งโรงพยาบาลทันที พร้อมทั้งนำขวดบรรจุสารเคมีหรือฉลากสารเคมีติดตัวไปด้วยเพื่อเป็นข้อมูลให้แพทย์"
    ]
  }
};

function rref(matrix) {
  const numRows = matrix.length;
  const numCols = matrix[0].length;
  let lead = 0;
  for (let r = 0; r < numRows; r++) {
    if (lead >= numCols) return;
    let i = r;
    while (Math.abs(matrix[i][lead]) < 1e-9) {
      i++;
      if (i === numRows) {
        i = r;
        lead++;
        if (lead === numCols) return;
      }
    }
    let temp = matrix[i];
    matrix[i] = matrix[r];
    matrix[r] = temp;
    let lv = matrix[r][lead];
    for (let j = 0; j < numCols; j++) {
      matrix[r][j] /= lv;
    }
    for (let i = 0; i < numRows; i++) {
      if (i !== r) {
        let lv2 = matrix[i][lead];
        for (let j = 0; j < numCols; j++) {
          matrix[i][j] -= lv2 * matrix[r][j];
        }
      }
    }
    lead++;
  }
}

// ============================================================================
// DIAGRAM PLANNER SYSTEM (PLAN LAB) - STYLE OF CHEMIX.ORG
// ============================================================================
let plannerElements = [];
let selectedElementId = null;

function setupLabPlanner() {
  const sidebarLinks = document.querySelectorAll(".menu-item-link");
  const panels = document.querySelectorAll(".panel");

  // Toolbox Categories items click
  document.querySelectorAll('.btn-apparatus-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-type');
      addApparatus(type);
    });
  });

  // Toolbox Search
  document.getElementById("apparatusSearch").addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    document.querySelectorAll('.btn-apparatus-item').forEach(btn => {
      const title = btn.getAttribute('title').toLowerCase();
      const text = btn.innerText.toLowerCase();
      if (title.includes(q) || text.includes(q)) {
        btn.style.display = "flex";
      } else {
        btn.style.display = "none";
      }
    });
  });

  // Canvas background click to deselect
  document.getElementById("labPlanSvg").addEventListener("mousedown", (e) => {
    if (e.target === document.getElementById("labPlanSvg")) {
      selectElement(null);
    }
  });

  // Save Plan Click
  document.getElementById("btnPlanSave").addEventListener("click", () => {
    const title = document.getElementById("labPlanTitle").value.trim() || "แผนการทดลองไม่มีชื่อ";
    if (plannerElements.length === 0) {
      showToast("ไม่สามารถบันทึกแผนเปล่าได้ กรุณาเพิ่มอุปกรณ์ก่อน", "warning");
      return;
    }
    
    const savedPlans = JSON.parse(localStorage.getItem("saved_lab_plans") || "[]");
    const planIndex = savedPlans.findIndex(p => p.title === title);
    
    const domElements = Array.from(document.querySelectorAll('#labPlanSvg .apparatus'))
      .map(g => plannerElements.find(item => item.id === g.id))
      .filter(Boolean);
    
    const planData = {
      title: title,
      date: new Date().toLocaleString("th-TH"),
      elements: domElements
    };
    
    if (planIndex > -1) {
      savedPlans[planIndex] = planData;
    } else {
      savedPlans.push(planData);
    }
    
    localStorage.setItem("saved_lab_plans", JSON.stringify(savedPlans));
    showToast(`บันทึกแผน "${title}" สำเร็จ!`, "success");
  });

  // Open Plan Click
  document.getElementById("btnPlanOpen").addEventListener("click", () => {
    const savedPlans = JSON.parse(localStorage.getItem("saved_lab_plans") || "[]");
    if (savedPlans.length === 0) {
      showToast("ไม่พบแผนการทดลองที่บันทึกไว้", "info");
      return;
    }
    
    let modal = document.getElementById("planOpenModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "planOpenModal";
      modal.className = "modal-overlay";
      modal.style.zIndex = "2000";
      document.body.appendChild(modal);
    }
    
    let listHtml = savedPlans.map((p, idx) => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid var(--border-color); font-size: 13px;">
        <div>
          <div style="font-weight: 600; color: var(--text-main);">${p.title}</div>
          <div style="font-size: 11px; color: var(--text-muted);">บันทึกเมื่อ: ${p.date}</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button type="button" class="btn btn-primary btn-open-plan-item" data-idx="${idx}" style="padding: 6px 12px; font-size: 12px; background: var(--primary-purple); color: white; border: none; border-radius: var(--border-radius-sm); cursor: pointer;">เปิด</button>
          <button type="button" class="btn btn-secondary btn-delete-plan-item" data-idx="${idx}" style="padding: 6px 12px; font-size: 12px; border: 1px solid var(--accent-red); color: var(--accent-red); background: white; border-radius: var(--border-radius-sm); cursor: pointer;">ลบ</button>
        </div>
      </div>
    `).join('');
    
    modal.innerHTML = `
      <div class="modal-box" style="width: 450px; max-width: 90%; padding: 24px; border-radius: var(--border-radius-md); background: white; box-shadow: var(--shadow-lg);">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 16px;">
          <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: var(--text-main);">แผนการทดลองที่บันทึกไว้</h3>
          <button type="button" class="btn-close-plan-modal" style="background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text-muted);">&times;</button>
        </div>
        <div style="max-height: 300px; overflow-y: auto; margin-bottom: 16px;">
          ${listHtml}
        </div>
      </div>
    `;
    
    modal.classList.add("active");
    
    modal.querySelector('.btn-close-plan-modal').addEventListener('click', () => {
      modal.classList.remove("active");
    });
    
    modal.querySelectorAll('.btn-open-plan-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        loadPlan(savedPlans[idx]);
        modal.classList.remove("active");
      });
    });
    
    modal.querySelectorAll('.btn-delete-plan-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        const name = savedPlans[idx].title;
        if (confirm(`คุณต้องการลบแผน "${name}" ใช่หรือไม่?`)) {
          savedPlans.splice(idx, 1);
          localStorage.setItem("saved_lab_plans", JSON.stringify(savedPlans));
          showToast(`ลบแผน "${name}" สำเร็จ`, "info");
          modal.classList.remove("active");
          document.getElementById("btnPlanOpen").click();
        }
      });
    });
  });

  // Clear Canvas Click
  document.getElementById("btnPlanClear").addEventListener("click", () => {
    if (plannerElements.length > 0 && confirm("คุณต้องการล้างอุปกรณ์ทั้งหมดออกจากบอร์ดใช่หรือไม่?")) {
      clearCanvas();
      showToast("ล้างบอร์ดเรียบร้อย", "info");
    }
  });

  // Export SVG
  document.getElementById("btnPlanExportSvg").addEventListener("click", () => {
    const title = document.getElementById("labPlanTitle").value.trim() || "lab_plan";
    const svgElement = document.getElementById("labPlanSvg");
    
    selectElement(null); // deselect highlight
    
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgElement);
    
    if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    
    const svgBlob = new Blob([source], {type: "image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(svgBlob);
    
    const a = document.createElement("a");
    a.download = `${title}.svg`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
    showToast("ส่งออกไฟล์ SVG สำเร็จ!", "success");
  });

  // Export PNG
  document.getElementById("btnPlanExportPng").addEventListener("click", () => {
    const title = document.getElementById("labPlanTitle").value.trim() || "lab_plan";
    const svgElement = document.getElementById("labPlanSvg");
    
    selectElement(null);
    
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgElement);
    
    if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    
    const svgBlob = new Blob([source], {type: "image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement("canvas");
      canvas.width = 1600;
      canvas.height = 1000;
      const ctx = canvas.getContext("2d");
      
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const a = document.createElement("a");
      a.download = `${title}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
      URL.revokeObjectURL(url);
      showToast("ส่งออกไฟล์รูปภาพ PNG สำเร็จ!", "success");
    };
    img.onerror = function(err) {
      console.error("PNG export error:", err);
      showToast("เกิดข้อผิดพลาดในการส่งออกภาพ PNG", "error");
    };
    img.src = url;
  });

  // Properties inputs listeners
  document.getElementById("propLabelText").addEventListener("input", (e) => {
    if (!selectedElementId) return;
    const el = plannerElements.find(item => item.id === selectedElementId);
    if (el) {
      el.label = e.target.value;
      renderApparatusVisuals(selectedElementId);
    }
  });

  document.getElementById("propLiquidLevelRange").addEventListener("input", (e) => {
    if (!selectedElementId) return;
    const el = plannerElements.find(item => item.id === selectedElementId);
    if (el) {
      el.liquidLevel = parseInt(e.target.value, 10);
      document.getElementById("propLiquidLevelValue").textContent = `${el.liquidLevel}%`;
      renderApparatusVisuals(selectedElementId);
    }
  });

  document.getElementById("propTempRange").addEventListener("input", (e) => {
    if (!selectedElementId) return;
    const el = plannerElements.find(item => item.id === selectedElementId);
    if (el) {
      el.temp = parseInt(e.target.value, 10);
      document.getElementById("propTempValue").textContent = `${el.temp}°C`;
      renderApparatusVisuals(selectedElementId);
    }
  });

  document.getElementById("propWeightNum").addEventListener("input", (e) => {
    if (!selectedElementId) return;
    const el = plannerElements.find(item => item.id === selectedElementId);
    if (el) {
      el.weight = parseFloat(e.target.value) || 0.00;
      renderApparatusVisuals(selectedElementId);
    }
  });

  document.getElementById("propFlameOn").addEventListener("change", (e) => {
    if (!selectedElementId) return;
    const el = plannerElements.find(item => item.id === selectedElementId);
    if (el) {
      el.flameOn = e.target.checked;
      renderApparatusVisuals(selectedElementId);
    }
  });

  document.getElementById("propScaleRange").addEventListener("input", (e) => {
    if (!selectedElementId) return;
    const el = plannerElements.find(item => item.id === selectedElementId);
    if (el) {
      el.scale = parseInt(e.target.value, 10);
      document.getElementById("propScaleValue").textContent = `${(el.scale / 10).toFixed(1)}x`;
      renderApparatusVisuals(selectedElementId);
    }
  });

  document.getElementById("propRotateRange").addEventListener("input", (e) => {
    if (!selectedElementId) return;
    const el = plannerElements.find(item => item.id === selectedElementId);
    if (el) {
      el.rotate = parseInt(e.target.value, 10);
      document.getElementById("propRotateValue").textContent = `${el.rotate}°`;
      renderApparatusVisuals(selectedElementId);
    }
  });

  document.getElementById("btnPropDelete").addEventListener("click", () => {
    if (!selectedElementId) return;
    const g = document.getElementById(selectedElementId);
    if (g) g.remove();
    
    plannerElements = plannerElements.filter(item => item.id !== selectedElementId);
    selectElement(null);
    showToast("ลบอุปกรณ์เรียบร้อยแล้ว", "info");
  });

  document.getElementById("btnPropMoveUp").addEventListener("click", () => {
    if (!selectedElementId) return;
    const g = document.getElementById(selectedElementId);
    if (g && g.parentNode) {
      g.parentNode.appendChild(g);
    }
  });

  document.getElementById("btnPropMoveDown").addEventListener("click", () => {
    if (!selectedElementId) return;
    const g = document.getElementById(selectedElementId);
    if (g && g.parentNode) {
      g.parentNode.insertBefore(g, g.parentNode.firstChild);
    }
  });
}

function getApparatusMarkup(type, id, opt) {
  if (type === 'beaker') {
    return `
      <defs>
        <linearGradient id="glassGrad_${id}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.3)"/>
          <stop offset="20%" stop-color="rgba(255,255,255,0.05)"/>
          <stop offset="80%" stop-color="rgba(255,255,255,0.02)"/>
          <stop offset="100%" stop-color="rgba(255,255,255,0.2)"/>
        </linearGradient>
      </defs>
      <!-- Glass shading fill -->
      <path d="M 5,20 L 5,115 A 5,5 0 0 0 10,120 L 75,120 A 5,5 0 0 0 80,115 L 80,20 Z" fill="url(#glassGrad_${id})" />
      <path class="liquid" d="" fill="${opt.liquidColor}" opacity="0.65"/>
      <!-- Glass Highlights & Markings -->
      <path d="M 6,22 L 6,115 A 4,4 0 0 0 10,119 L 70,119 A 4,4 0 0 0 74,119 L 74,22" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1.2" />
      <line class="outline" x1="15" y1="40" x2="23" y2="40" stroke="#94a3b8" stroke-width="1.2"/>
      <line class="outline" x1="15" y1="60" x2="23" y2="60" stroke="#94a3b8" stroke-width="1.2"/>
      <line class="outline" x1="15" y1="80" x2="23" y2="80" stroke="#94a3b8" stroke-width="1.2"/>
      <line class="outline" x1="15" y1="100" x2="23" y2="100" stroke="#94a3b8" stroke-width="1.2"/>
      <line class="outline" x1="15" y1="30" x2="20" y2="30" stroke="#cbd5e1" stroke-width="0.8"/>
      <line class="outline" x1="15" y1="50" x2="20" y2="50" stroke="#cbd5e1" stroke-width="0.8"/>
      <line class="outline" x1="15" y1="70" x2="20" y2="70" stroke="#cbd5e1" stroke-width="0.8"/>
      <line class="outline" x1="15" y1="90" x2="20" y2="90" stroke="#cbd5e1" stroke-width="0.8"/>
      <line class="outline" x1="15" y1="110" x2="20" y2="110" stroke="#cbd5e1" stroke-width="0.8"/>
      <!-- Outer Outline -->
      <path class="outline" d="M 5,20 L 5,10 A 3,3 0 0 0 2,7 L 0,7 Q 0,3 5,3 L 75,3 Q 80,3 80,7 L 80,115 A 5,5 0 0 1 75,120 L 10,120 A 5,5 0 0 1 5,115 Z" fill="none" stroke="#1e293b" stroke-width="2.5" stroke-linejoin="round"/>
      <text class="apparatus-label" x="40" y="-10" text-anchor="middle" font-size="12" font-weight="600" font-family="'Prompt', sans-serif" fill="#64748b"></text>
    `;
  }
  if (type === 'test-tube') {
    return `
      <defs>
        <linearGradient id="tubeGlassGrad_${id}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.3)"/>
          <stop offset="25%" stop-color="rgba(255,255,255,0.05)"/>
          <stop offset="75%" stop-color="rgba(255,255,255,0.02)"/>
          <stop offset="100%" stop-color="rgba(255,255,255,0.2)"/>
        </linearGradient>
      </defs>
      <!-- Tube glass shading -->
      <path d="M 12,5 Q 10,5 10,2 L 20,2 Q 20,5 18,5 L 18,75 A 8,8 0 0 1 2,75 Z" fill="url(#tubeGlassGrad_${id})" transform="scale(1.5) translate(-2, 0)"/>
      <path class="liquid" d="" fill="${opt.liquidColor}" opacity="0.65"/>
      <!-- Glass highlight lines -->
      <path d="M 17,5 L 17,73" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" transform="scale(1.5) translate(-2, 0)"/>
      <!-- Outer Outline -->
      <path class="outline" d="M 12,5 Q 10,5 10,2 L 20,2 Q 20,5 18,5 L 18,75 A 8,8 0 0 1 2,75 Z" fill="none" stroke="#1e293b" stroke-width="2.5" stroke-linejoin="round" transform="scale(1.5) translate(-2, 0)"/>
      <text class="apparatus-label" x="15" y="-10" text-anchor="middle" font-size="12" font-weight="600" font-family="'Prompt', sans-serif" fill="#64748b"></text>
    `;
  }
  if (type === 'conical-flask') {
    return `
      <defs>
        <linearGradient id="flaskGlassGrad_${id}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.3)"/>
          <stop offset="30%" stop-color="rgba(255,255,255,0.05)"/>
          <stop offset="70%" stop-color="rgba(255,255,255,0.02)"/>
          <stop offset="100%" stop-color="rgba(255,255,255,0.2)"/>
        </linearGradient>
      </defs>
      <!-- Glass shading fill -->
      <path d="M 30,15 L 30,5 L 50,5 L 50,15 L 75,113 A 5,5 0 0 1 70,120 L 10,120 A 5,5 0 0 1 5,113 Z" fill="url(#flaskGlassGrad_${id})" />
      <path class="liquid" d="" fill="${opt.liquidColor}" opacity="0.65"/>
      <!-- Markings & Highlights -->
      <line x1="33" y1="70" x2="41" y2="70" stroke="#94a3b8" stroke-width="1.2"/>
      <line x1="28" y1="90" x2="38" y2="90" stroke="#94a3b8" stroke-width="1.2"/>
      <line x1="24" y1="110" x2="36" y2="110" stroke="#94a3b8" stroke-width="1.2"/>
      <path d="M 32,15 L 32,5" stroke="rgba(255,255,255,0.5)" stroke-width="1.2" fill="none"/>
      <path d="M 48,15 L 72,112" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" fill="none"/>
      <!-- Outer Outline -->
      <path class="outline" d="M 30,15 L 30,5 Q 26,5 26,2 L 54,2 Q 54,5 50,5 L 50,15 L 75,113 A 5,5 0 0 1 70,120 L 10,120 A 5,5 0 0 1 5,113 Z" fill="none" stroke="#1e293b" stroke-width="2.5" stroke-linejoin="round"/>
      <text class="apparatus-label" x="40" y="-10" text-anchor="middle" font-size="12" font-weight="600" font-family="'Prompt', sans-serif" fill="#64748b"></text>
    `;
  }
  if (type === 'cylinder') {
    return `
      <defs>
        <linearGradient id="cylinderGlassGrad_${id}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.35)"/>
          <stop offset="25%" stop-color="rgba(255,255,255,0.05)"/>
          <stop offset="75%" stop-color="rgba(255,255,255,0.02)"/>
          <stop offset="100%" stop-color="rgba(255,255,255,0.2)"/>
        </linearGradient>
      </defs>
      <rect x="10" y="15" width="20" height="100" fill="url(#cylinderGlassGrad_${id})"/>
      <rect class="liquid" x="10" y="40" width="20" height="75" fill="${opt.liquidColor}" opacity="0.65"/>
      <!-- Markings -->
      <line class="outline" x1="10" y1="30" x2="16" y2="30" stroke="#94a3b8" stroke-width="1"/>
      <line class="outline" x1="10" y1="50" x2="16" y2="50" stroke="#94a3b8" stroke-width="1"/>
      <line class="outline" x1="10" y1="70" x2="16" y2="70" stroke="#94a3b8" stroke-width="1"/>
      <line class="outline" x1="10" y1="90" x2="16" y2="90" stroke="#94a3b8" stroke-width="1"/>
      <line class="outline" x1="10" y1="110" x2="16" y2="110" stroke="#94a3b8" stroke-width="1"/>
      <!-- Reflection Highlight -->
      <line x1="28" y1="18" x2="28" y2="112" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
      <!-- Base & Lip -->
      <path class="outline" d="M 10,15 L 10,115 L 2,115 L 2,120 L 38,120 L 38,115 L 30,115 L 30,15" fill="none" stroke="#1e293b" stroke-width="2.5" stroke-linejoin="round"/>
      <path class="outline" d="M 10,15 Q 20,20 30,15" fill="none" stroke="#1e293b" stroke-width="2.5"/>
      <text class="apparatus-label" x="20" y="-10" text-anchor="middle" font-size="12" font-weight="600" font-family="'Prompt', sans-serif" fill="#64748b"></text>
    `;
  }
  if (type === 'thermometer') {
    return `
      <!-- Glass backing with reflections -->
      <rect x="8" y="0" width="8" height="100" rx="4" fill="rgba(255,255,255,0.3)" stroke="#1e293b" stroke-width="2.2"/>
      <line x1="9.5" y1="4" x2="9.5" y2="96" stroke="rgba(255,255,255,0.5)" stroke-width="0.8"/>
      <!-- Liquid tube inside -->
      <rect class="thermometer-liquid" x="11" y="40" width="2" height="60" fill="#ef4444"/>
      <!-- Alcohol bulb -->
      <circle class="outline" cx="12" cy="107" r="8" fill="#ef4444" stroke="#1e293b" stroke-width="2.2"/>
      <circle cx="10" cy="105" r="2.2" fill="rgba(255,255,255,0.6)"/>
      <!-- Marks -->
      <line class="outline" x1="12" y1="20" x2="15" y2="20" stroke="#1e293b" stroke-width="0.8"/>
      <line class="outline" x1="12" y1="40" x2="15" y2="40" stroke="#1e293b" stroke-width="0.8"/>
      <line class="outline" x1="12" y1="60" x2="15" y2="60" stroke="#1e293b" stroke-width="0.8"/>
      <line class="outline" x1="12" y1="80" x2="15" y2="80" stroke="#1e293b" stroke-width="0.8"/>
      <text class="apparatus-label" x="12" y="-10" text-anchor="middle" font-size="12" font-weight="600" font-family="'Prompt', sans-serif" fill="#64748b"></text>
    `;
  }
  if (type === 'scale') {
    return `
      <!-- Scale Housing (metal silver) -->
      <rect x="5" y="20" width="90" height="20" rx="3" fill="#cbd5e1" stroke="#1e293b" stroke-width="2.5"/>
      <!-- Weighing Plate (stainless steel) -->
      <path d="M 12,18 L 88,18 L 82,13 L 18,13 Z" fill="#94a3b8" stroke="#1e293b" stroke-width="2.2" stroke-linejoin="round"/>
      <!-- LCD Screen -->
      <rect x="25" y="25" width="50" height="11" rx="1" fill="#0f172a" stroke="#475569" stroke-width="1"/>
      <text class="scale-reading" x="70" y="34" fill="#10b981" font-family="monospace" font-weight="bold" font-size="9" text-anchor="end">0.00 g</text>
      <!-- Buttons -->
      <circle cx="15" cy="30" r="2" fill="#ef4444" stroke="#1e293b" stroke-width="0.8"/>
      <circle cx="85" cy="30" r="2" fill="#3b82f6" stroke="#1e293b" stroke-width="0.8"/>
      <text class="apparatus-label" x="50" y="-10" text-anchor="middle" font-size="12" font-weight="600" font-family="'Prompt', sans-serif" fill="#64748b"></text>
    `;
  }
  if (type === 'bunsen') {
    return `
      <defs>
        <linearGradient id="outerFlameGrad_${id}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ef4444" stop-opacity="0.8"/>
          <stop offset="50%" stop-color="#f59e0b" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#2563eb" stop-opacity="0.95"/>
        </linearGradient>
        <linearGradient id="innerFlameGrad_${id}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#60a5fa" stop-opacity="0.95"/>
        </linearGradient>
        <linearGradient id="metalTube_${id}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#94a3b8"/>
          <stop offset="40%" stop-color="#cbd5e1"/>
          <stop offset="100%" stop-color="#475569"/>
        </linearGradient>
      </defs>
      <!-- Outer Flame -->
      <path class="flame" d="M 20,40 Q 20,10 15,0 Q 10,10 10,40 Z" fill="url(#outerFlameGrad_${id})" />
      <!-- Inner Flame Core -->
      <path class="inner-flame" d="M 17,40 Q 17,25 15,15 Q 13,25 13,40 Z" fill="url(#innerFlameGrad_${id})" />
      <!-- Metal Burner Tube -->
      <rect class="outline" x="12" y="40" width="6" height="32" fill="url(#metalTube_${id})" stroke="#1e293b" stroke-width="2"/>
      <!-- Air Collar (brass look) -->
      <rect class="outline" x="10" y="72" width="10" height="6" fill="#f59e0b" stroke="#1e293b" stroke-width="1.8"/>
      <!-- Base (heavy iron) -->
      <path class="outline" d="M 2,85 L 28,85 L 24,78 L 6,78 Z" fill="#334155" stroke="#1e293b" stroke-width="2" stroke-linejoin="round"/>
      <!-- Gas inlet nozzle -->
      <path class="outline" d="M 20,75 L 32,75" fill="none" stroke="#1e293b" stroke-width="2" />
      <text class="apparatus-label" x="15" y="-15" text-anchor="middle" font-size="12" font-weight="600" font-family="'Prompt', sans-serif" fill="#64748b"></text>
    `;
  }
  if (type === 'retort-stand') {
    return `
      <defs>
        <linearGradient id="rodGrad_${id}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#94a3b8"/>
          <stop offset="40%" stop-color="#e2e8f0"/>
          <stop offset="100%" stop-color="#475569"/>
        </linearGradient>
      </defs>
      <!-- Base (heavy iron) -->
      <rect class="outline" x="0" y="120" width="60" height="8" rx="2" fill="#334155" stroke="#1e293b" stroke-width="2"/>
      <!-- Rod -->
      <line class="outline" x1="10" y1="10" x2="10" y2="120" stroke="url(#rodGrad_${id})" stroke-width="4.5" stroke-linecap="round"/>
      <!-- Bosshead and Clamp -->
      <rect class="outline" x="8" y="40" width="8" height="8" rx="1.5" fill="#64748b" stroke="#1e293b" stroke-width="1.8"/>
      <!-- Adjuster screw -->
      <circle cx="12" cy="38" r="1.5" fill="#1e293b"/>
      <!-- Extension arm -->
      <line class="outline" x1="16" y1="44" x2="35" y2="44" stroke="#64748b" stroke-width="3"/>
      <!-- Jaws -->
      <path class="outline" d="M 35,35 Q 42,35 42,44 Q 42,53 35,53" fill="none" stroke="#ef4444" stroke-width="3.5" stroke-linecap="round"/>
      <text class="apparatus-label" x="30" y="-10" text-anchor="middle" font-size="12" font-weight="600" font-family="'Prompt', sans-serif" fill="#64748b"></text>
    `;
  }
  if (type === 'pipette') {
    return `
      <path class="liquid" d="" fill="${opt.liquidColor}" opacity="0.65"/>
      <!-- Highlight -->
      <path d="M 8,0 L 8,40 L 5,50 L 5,90" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="0.8" transform="scale(1, 0.8) translate(0, 10)"/>
      <path class="outline" d="M 7,0 L 7,40 L 4,50 L 4,90 L 7,100 L 7,140 L 9,150 L 9,140 L 11,100 L 11,90 L 14,50 L 11,40 L 11,0 Z" fill="none" stroke="#1e293b" stroke-width="1.8" transform="scale(1, 0.8) translate(0, 10)"/>
      <text class="apparatus-label" x="9" y="-15" text-anchor="middle" font-size="12" font-weight="600" font-family="'Prompt', sans-serif" fill="#64748b"></text>
    `;
  }
  if (type === 'arrow') {
    return `
      <line class="outline" x1="0" y1="10" x2="60" y2="10" stroke="#1e293b" stroke-width="3" marker-end="url(#arrowhead)"/>
      <text class="apparatus-label" x="30" y="-10" text-anchor="middle" font-size="12" font-weight="600" font-family="'Prompt', sans-serif" fill="#64748b"></text>
    `;
  }
  if (type === 'text-box') {
    return `
      <rect class="outline" x="0" y="0" width="100" height="40" rx="3" fill="none" stroke="#1e293b" stroke-width="1.5" stroke-dasharray="3,3"/>
      <text class="text-box-content" x="50" y="24" text-anchor="middle" font-size="13" font-weight="bold" font-family="'Sora', 'Prompt', sans-serif" fill="#1e293b">TEXT</text>
    `;
  }
  if (type === 'round-flask') {
    return `
      <defs>
        <clipPath id="clip_${id}">
          <path d="M 30,5 L 30,45 A 35,35 0 1 0 50,45 L 50,5 Z"/>
        </clipPath>
        <linearGradient id="roundGlassGrad_${id}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.3)"/>
          <stop offset="25%" stop-color="rgba(255,255,255,0.05)"/>
          <stop offset="75%" stop-color="rgba(255,255,255,0.02)"/>
          <stop offset="100%" stop-color="rgba(255,255,255,0.2)"/>
        </linearGradient>
      </defs>
      <path d="M 30,5 L 30,45 A 35,35 0 1 0 50,45 L 50,5 Z" fill="url(#roundGlassGrad_${id})"/>
      <rect class="liquid" x="5" y="5" width="70" height="115" fill="${opt.liquidColor}" opacity="0.65" clip-path="url(#clip_${id})"/>
      <path d="M 15,80 A 25,25 0 0 1 65,80" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="3" stroke-linecap="round"/>
      <path class="outline" d="M 30,5 L 30,45 A 35,35 0 1 0 50,45 L 50,5 Q 50,2 52,2 L 54,2 L 54,0 L 26,0 L 26,2 L 28,2 Q 30,2 30,5 Z" fill="none" stroke="#1e293b" stroke-width="2.5" stroke-linejoin="round"/>
      <text class="apparatus-label" x="40" y="-10" text-anchor="middle" font-size="12" font-weight="600" font-family="'Prompt', sans-serif" fill="#64748b"></text>
    `;
  }
  if (type === 'crucible') {
    return `
      <defs>
        <clipPath id="clip_${id}">
          <path d="M 22,25 L 58,25 L 54,49 L 26,49 Z"/>
        </clipPath>
        <linearGradient id="porcelainGrad_${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fafaf9"/>
          <stop offset="60%" stop-color="#f5f5f4"/>
          <stop offset="100%" stop-color="#e7e5e4"/>
        </linearGradient>
      </defs>
      <!-- Ceramic body -->
      <path d="M 22,45 L 58,45 L 62,25 L 18,25 Z" fill="url(#porcelainGrad_${id})" stroke="#1e293b" stroke-width="2.5"/>
      <rect class="liquid" x="15" y="20" width="50" height="35" fill="${opt.liquidColor}" opacity="0.65" clip-path="url(#clip_${id})"/>
      <!-- Porcelain lid -->
      <path d="M 15,25 L 65,25 L 65,21 L 15,21 Z" fill="url(#porcelainGrad_${id})" stroke="#1e293b" stroke-width="2.5"/>
      <path d="M 35,21 Q 40,14 45,21" fill="none" stroke="#1e293b" stroke-width="2.5"/>
      <text class="apparatus-label" x="40" y="-10" text-anchor="middle" font-size="12" font-weight="600" font-family="'Prompt', sans-serif" fill="#64748b"></text>
    `;
  }
  if (type === 'evaporating-dish') {
    return `
      <defs>
        <clipPath id="clip_${id}">
          <path d="M 12,30 A 28,20 0 0 0 68,30 Z"/>
        </clipPath>
        <linearGradient id="porcelainDishGrad_${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fafaf9"/>
          <stop offset="50%" stop-color="#f5f5f4"/>
          <stop offset="100%" stop-color="#d6d3d1"/>
        </linearGradient>
      </defs>
      <!-- Bowl -->
      <path d="M 10,30 A 30,22 0 0 0 70,30" fill="url(#porcelainDishGrad_${id})" stroke="#1e293b" stroke-width="2.5" />
      <rect class="liquid" x="5" y="20" width="70" height="35" fill="${opt.liquidColor}" opacity="0.65" clip-path="url(#clip_${id})"/>
      <!-- Rim -->
      <path d="M 10,30 L 70,30 Q 73,31 70,30 M 10,30 Q 7,31 10,30" fill="none" stroke="#1e293b" stroke-width="2.5" stroke-linejoin="round"/>
      <text class="apparatus-label" x="40" y="-10" text-anchor="middle" font-size="12" font-weight="600" font-family="'Prompt', sans-serif" fill="#64748b"></text>
    `;
  }
  if (type === 'burette') {
    return `
      <defs>
        <clipPath id="clip_${id}">
          <rect x="36.5" y="5" width="7" height="110"/>
        </clipPath>
      </defs>
      <rect class="liquid" x="35" y="5" width="10" height="115" fill="${opt.liquidColor}" opacity="0.65" clip-path="url(#clip_${id})"/>
      <!-- Glass reflections -->
      <rect x="36" y="5" width="1.5" height="110" fill="rgba(255,255,255,0.4)"/>
      <line class="outline" x1="36" y1="20" x2="40" y2="20" stroke="#64748b" stroke-width="0.8"/>
      <line class="outline" x1="36" y1="40" x2="40" y2="40" stroke="#64748b" stroke-width="0.8"/>
      <line class="outline" x1="36" y1="60" x2="40" y2="60" stroke="#64748b" stroke-width="0.8"/>
      <line class="outline" x1="36" y1="80" x2="40" y2="80" stroke="#64748b" stroke-width="0.8"/>
      <line class="outline" x1="36" y1="100" x2="40" y2="100" stroke="#64748b" stroke-width="0.8"/>
      <path class="outline" d="M 36,0 L 36,115 L 34,120 L 34,125 L 46,125 L 46,120 L 44,115 L 44,0 Z" fill="none" stroke="#1e293b" stroke-width="2.2" stroke-linejoin="round"/>
      <!-- Blue stopcock knob -->
      <circle class="outline" cx="40" cy="122.5" r="4.5" fill="#3b82f6" stroke="#1e293b" stroke-width="1.8"/>
      <path class="outline" d="M 39,125 L 39,145 L 40,148 L 41,145 L 41,125 Z" fill="#1e293b" stroke="#1e293b" stroke-width="1"/>
      <text class="apparatus-label" x="40" y="-12" text-anchor="middle" font-size="12" font-weight="600" font-family="'Prompt', sans-serif" fill="#64748b"></text>
    `;
  }
  if (type === 'tripod') {
    return `
      <defs>
        <linearGradient id="metalLeg_${id}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#64748b"/>
          <stop offset="50%" stop-color="#94a3b8"/>
          <stop offset="100%" stop-color="#334155"/>
        </linearGradient>
      </defs>
      <!-- Platform -->
      <rect class="outline" x="15" y="25" width="50" height="5" rx="1.5" fill="#334155" stroke="#1e293b" stroke-width="2.5"/>
      <!-- Legs -->
      <line class="outline" x1="22" y1="30" x2="8" y2="80" stroke="url(#metalLeg_${id})" stroke-width="3" stroke-linecap="round"/>
      <line class="outline" x1="58" y1="30" x2="72" y2="80" stroke="url(#metalLeg_${id})" stroke-width="3" stroke-linecap="round"/>
      <line class="outline" x1="40" y1="30" x2="40" y2="83" stroke="url(#metalLeg_${id})" stroke-width="3" stroke-linecap="round"/>
      <!-- Rubber feet -->
      <circle cx="8" cy="80" r="2.5" fill="#0f172a"/>
      <circle cx="72" cy="80" r="2.5" fill="#0f172a"/>
      <circle cx="40" cy="83" r="2.5" fill="#0f172a"/>
      <text class="apparatus-label" x="40" y="-10" text-anchor="middle" font-size="12" font-weight="600" font-family="'Prompt', sans-serif" fill="#64748b"></text>
    `;
  }
  if (type === 'gauze') {
    return `
      <rect class="outline" x="5" y="25" width="70" height="6" rx="1" fill="none" stroke="#1e293b" stroke-width="1.5" stroke-dasharray="2,2"/>
      <line x1="5" y1="28" x2="75" y2="28" stroke="#475569" stroke-width="1"/>
      <circle cx="40" cy="28" r="10" fill="#e2e8f0" opacity="0.9" stroke="#1e293b" stroke-width="1"/>
      <text class="apparatus-label" x="40" y="-10" text-anchor="middle" font-size="12" font-weight="600" font-family="'Prompt', sans-serif" fill="#64748b"></text>
    `;
  }
  if (type === 'clay-triangle') {
    return `
      <polygon points="40,15 18,53 62,53" fill="none" stroke="#cbd5e1" stroke-width="8" stroke-linejoin="round"/>
      <polygon points="40,18 20,52 60,52" fill="none" stroke="#1e293b" stroke-width="2.5" stroke-linejoin="round"/>
      <line x1="40" y1="18" x2="40" y2="5" stroke="#1e293b" stroke-width="2"/>
      <line x1="20" y1="52" x2="8" y2="60" stroke="#1e293b" stroke-width="2"/>
      <line x1="60" y1="52" x2="72" y2="60" stroke="#1e293b" stroke-width="2"/>
      <text class="apparatus-label" x="40" y="-10" text-anchor="middle" font-size="12" font-weight="600" font-family="'Prompt', sans-serif" fill="#64748b"></text>
    `;
  }
  if (type === 'funnel') {
    return `
      <defs>
        <clipPath id="clip_${id}">
          <path d="M 16.5,10 L 63.5,10 L 42,43 L 42,80 L 38,80 L 38,43 Z"/>
        </clipPath>
      </defs>
      <rect class="liquid" x="10" y="5" width="60" height="80" fill="${opt.liquidColor}" opacity="0.65" clip-path="url(#clip_${id})"/>
      <!-- Glass highlight -->
      <path d="M 18,10 L 41,41 M 39,43 L 39,78" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
      <path class="outline" d="M 15,10 L 65,10 L 43,43 L 43,80 L 37,80 L 37,43 Z" fill="none" stroke="#1e293b" stroke-width="2.5" stroke-linejoin="round"/>
      <text class="apparatus-label" x="40" y="-10" text-anchor="middle" font-size="12" font-weight="600" font-family="'Prompt', sans-serif" fill="#64748b"></text>
    `;
  }
  if (type === 'dropper') {
    return `
      <defs>
        <clipPath id="clip_${id}">
          <path d="M 38,30 L 38,85 L 40,88 L 42,85 L 42,30 Z"/>
        </clipPath>
        <linearGradient id="dropperBulbGrad_${id}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ef4444"/>
          <stop offset="50%" stop-color="#f87171"/>
          <stop offset="100%" stop-color="#b91c1c"/>
        </linearGradient>
      </defs>
      <rect class="liquid" x="35" y="25" width="10" height="70" fill="${opt.liquidColor}" opacity="0.65" clip-path="url(#clip_${id})"/>
      <!-- Bulb -->
      <path class="rubber-bulb" d="M 32,5 C 26,5 26,30 35,30 L 45,30 C 54,30 54,5 48,5 Z" fill="url(#dropperBulbGrad_${id})" stroke="#1e293b" stroke-width="2.2" stroke-linejoin="round"/>
      <!-- Glass highlight -->
      <line x1="39" y1="30" x2="39" y2="83" stroke="rgba(255,255,255,0.4)" stroke-width="0.8"/>
      <!-- Stem -->
      <path class="outline" d="M 37.5,30 L 37.5,85 L 39.5,89.5 L 40.5,89.5 L 42.5,85 L 42.5,30 Z" fill="none" stroke="#1e293b" stroke-width="2" stroke-linejoin="round"/>
      <text class="apparatus-label" x="40" y="-10" text-anchor="middle" font-size="12" font-weight="600" font-family="'Prompt', sans-serif" fill="#64748b"></text>
    `;
  }
  if (type === 'condenser') {
    return `
      <!-- Outer jacket water body -->
      <rect x="26.5" y="20" width="27" height="60" fill="#93c5fd" opacity="0.4"/>
      <!-- Reflections on outer glass -->
      <rect x="28" y="20" width="2" height="60" fill="rgba(255,255,255,0.4)"/>
      <rect class="outline" x="25" y="20" width="30" height="60" rx="3" fill="none" stroke="#1e293b" stroke-width="2.5"/>
      <!-- Inner tube -->
      <path class="outline" d="M 36.5,0 L 36.5,100 M 43.5,0 L 43.5,100" fill="none" stroke="#1e293b" stroke-width="2"/>
      <!-- Water inlet/outlet ports -->
      <rect class="outline" x="18" y="25" width="8" height="6" rx="1" fill="#94a3b8" stroke="#1e293b" stroke-width="1.8"/>
      <rect class="outline" x="54" y="69" width="8" height="6" rx="1" fill="#94a3b8" stroke="#1e293b" stroke-width="1.8"/>
      <text class="apparatus-label" x="40" y="-12" text-anchor="middle" font-size="12" font-weight="600" font-family="'Prompt', sans-serif" fill="#64748b"></text>
    `;
  }
  return "";
}

function getTypeNameThai(type) {
  const map = {
    beaker: "บีกเกอร์ (Beaker)",
    "test-tube": "หลอดทดลอง (Test Tube)",
    "conical-flask": "ขวดรูปชมพู่ (Conical Flask)",
    cylinder: "กระบอกตวง (Cylinder)",
    "round-flask": "ขวดก้นกลม (Round Flask)",
    crucible: "ถ้วยกระเบื้อง (Crucible)",
    "evaporating-dish": "ถ้วยระเหยสาร (Evaporation Dish)",
    thermometer: "เทอร์โมมิเตอร์ (Thermometer)",
    scale: "เครื่องชั่ง (Scale)",
    burette: "บิวเรตต์ (Burette)",
    bunsen: "ตะเกียงบุนเซน (Bunsen Burner)",
    "retort-stand": "ขาตั้ง Retort (Retort Stand)",
    tripod: "ขาตั้งสามขา (Tripod Stand)",
    gauze: "ตะแกรงลวด (Wire Gauze)",
    "clay-triangle": "สามเหลี่ยมดินเผา (Clay Triangle)",
    pipette: "ปิเปตต์ (Pipette)",
    funnel: "กรวยกรอง (Funnel)",
    dropper: "หลอดหยดสาร (Dropper)",
    condenser: "เครื่องควบแน่น (Condenser)",
    arrow: "ลูกศรขั้นตอน (Flow Arrow)",
    "text-box": "กล่องข้อความ (Text Box)"
  };
  return map[type] || type;
}

function getDefaultLabel(type) {
  const map = {
    beaker: "Beaker 250 mL",
    "test-tube": "Test Tube",
    "conical-flask": "Conical Flask",
    cylinder: "Cylinder 25 mL",
    "round-flask": "Round Flask 250 mL",
    crucible: "Crucible",
    "evaporating-dish": "Evaporating Dish",
    thermometer: "",
    scale: "Scale",
    burette: "Burette 50 mL",
    bunsen: "",
    "retort-stand": "",
    tripod: "",
    gauze: "",
    "clay-triangle": "",
    pipette: "Pipette 25 mL",
    funnel: "Funnel",
    dropper: "Dropper",
    condenser: "Condenser",
    arrow: "",
    "text-box": "TEXT"
  };
  return map[type] || "";
}

function addApparatus(type) {
  const id = 'el_' + Date.now();
  
  const newElement = {
    id: id,
    type: type,
    x: 100 + Math.random() * 50,
    y: 100 + Math.random() * 50,
    scale: 10, // 10 matches 1.0x scale internally (scaleRange is 5 to 25)
    rotate: 0,
    label: getDefaultLabel(type),
    liquidLevel: 50,
    liquidColor: '#3b82f6',
    temp: 25,
    weight: 0.00,
    flameOn: true
  };

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.id = id;
  g.setAttribute("class", "apparatus");
  g.innerHTML = getApparatusMarkup(type, id, newElement);
  document.getElementById("labPlanSvg").appendChild(g);

  plannerElements.push(newElement);

  // Bind drag events
  let isDragging = false;
  let startX, startY;

  g.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    selectElement(id);
    
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    
    const mouseMoveHandler = (ev) => {
      if (!isDragging) return;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      
      newElement.x += dx;
      newElement.y += dy;
      
      startX = ev.clientX;
      startY = ev.clientY;
      
      renderApparatusVisuals(id);
    };
    
    const mouseUpHandler = () => {
      isDragging = false;
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", mouseUpHandler);
    };
    
    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
  });

  renderApparatusVisuals(id);
  selectElement(id);
}

function renderApparatusVisuals(id) {
  const el = plannerElements.find(item => item.id === id);
  if (!el) return;
  
  const g = document.getElementById(id);
  if (!g) return;
  
  const scaleVal = el.scale / 10;
  g.setAttribute("transform", `translate(${el.x}, ${el.y}) scale(${scaleVal}) rotate(${el.rotate})`);
  
  const labelText = g.querySelector('.apparatus-label');
  if (labelText) {
    labelText.textContent = el.label || "";
  }
  
  const liquid = g.querySelector('.liquid');
  if (liquid) {
    liquid.setAttribute("fill", el.liquidColor);
    
    let d = "";
    if (el.type === 'beaker') {
      const liquidTopY = 120 - (el.liquidLevel / 100) * 110;
      d = `M 5,${liquidTopY} Q 40,${liquidTopY + 4} 75,${liquidTopY} L 75,115 A 5,5 0 0 1 70,120 L 10,120 A 5,5 0 0 1 5,115 Z`;
    } else if (el.type === 'test-tube') {
      const liquidTopY = 112.5 - (el.liquidLevel / 100) * 97.5;
      d = `M 3,${liquidTopY} Q 15,${liquidTopY + 3} 27,${liquidTopY} L 27,105 A 12,12 0 0 1 3,105 Z`;
    } else if (el.type === 'conical-flask') {
      const liquidTopY = 120 - (el.liquidLevel / 100) * 105;
      const ratio = (120 - liquidTopY) / 105;
      const halfWidth = 10 + ratio * 19;
      const xLeft = 40 - halfWidth;
      const xRight = 40 + halfWidth;
      d = `M ${xLeft},${liquidTopY} Q 40,${liquidTopY + 4} ${xRight},${liquidTopY} L 73,113 A 5,5 0 0 1 68,120 L 12,120 A 5,5 0 0 1 7,113 Z`;
    } else if (el.type === 'pipette') {
      const liquidTopY = 90 - (el.liquidLevel / 100) * 40;
      d = `M 4,${liquidTopY} Q 9,${liquidTopY + 2} 14,${liquidTopY} L 11,90 L 11,120 L 9,130 L 9,120 L 7,90 Z`;
    }
    
    if (el.liquidLevel <= 0) {
      liquid.style.display = "none";
    } else {
      liquid.style.display = "inline";
      const isRectLiquid = ['cylinder', 'round-flask', 'crucible', 'evaporating-dish', 'burette', 'funnel', 'dropper'].includes(el.type);
      if (!isRectLiquid) {
        liquid.setAttribute("d", d);
      } else {
        let bottomY = 115, heightMax = 100;
        if (el.type === 'cylinder') { bottomY = 115; heightMax = 100; }
        else if (el.type === 'round-flask') { bottomY = 115; heightMax = 110; }
        else if (el.type === 'crucible') { bottomY = 49; heightMax = 29; }
        else if (el.type === 'evaporating-dish') { bottomY = 45; heightMax = 25; }
        else if (el.type === 'burette') { bottomY = 115; heightMax = 110; }
        else if (el.type === 'funnel') { bottomY = 80; heightMax = 75; }
        else if (el.type === 'dropper') { bottomY = 90; heightMax = 65; }
        
        const liquidTopY = bottomY - (el.liquidLevel / 100) * heightMax;
        liquid.setAttribute("y", liquidTopY);
        liquid.setAttribute("height", bottomY - liquidTopY);
      }
    }
  }
  
  if (el.type === 'thermometer') {
    const thermometerLiquid = g.querySelector('.thermometer-liquid');
    if (thermometerLiquid) {
      const ratio = Math.max(0, Math.min(1, (el.temp + 10) / 120));
      const height = ratio * 80;
      const y = 100 - height;
      thermometerLiquid.setAttribute("y", y);
      thermometerLiquid.setAttribute("height", height);
    }
  }
  
  if (el.type === 'scale') {
    const reading = g.querySelector('.scale-reading');
    if (reading) {
      reading.textContent = `${el.weight.toFixed(2)} g`;
    }
  }
  
  if (el.type === 'bunsen') {
    const flame = g.querySelector('.flame');
    const innerFlame = g.querySelector('.inner-flame');
    if (flame && innerFlame) {
      if (el.flameOn) {
        flame.style.display = "inline";
        innerFlame.style.display = "inline";
      } else {
        flame.style.display = "none";
        innerFlame.style.display = "none";
      }
    }
  }
  
  if (el.type === 'text-box') {
    const content = g.querySelector('.text-box-content');
    if (content) {
      content.textContent = el.label || "TEXT";
    }
  }
}

function selectElement(id) {
  if (selectedElementId) {
    const prev = document.getElementById(selectedElementId);
    if (prev) {
      prev.classList.remove("selected");
      const line = prev.querySelector('line');
      if (line && line.getAttribute('marker-end') === 'url(#arrowhead-selected)') {
        line.setAttribute('marker-end', 'url(#arrowhead)');
      }
    }
  }
  
  selectedElementId = id;
  
  const propertiesControls = document.getElementById("propertiesControls");
  const propertiesEmptyState = document.getElementById("propertiesEmptyState");
  
  if (!id) {
    propertiesControls.style.display = "none";
    propertiesEmptyState.style.display = "flex";
    return;
  }
  
  const el = plannerElements.find(item => item.id === id);
  if (!el) return;
  
  const g = document.getElementById(id);
  if (g) {
    g.classList.add("selected");
    const line = g.querySelector('line');
    if (line && line.getAttribute('marker-end') === 'url(#arrowhead)') {
      line.setAttribute('marker-end', 'url(#arrowhead-selected)');
    }
  }
  
  propertiesControls.style.display = "flex";
  propertiesEmptyState.style.display = "none";
  
  document.getElementById("propElementTypeName").textContent = getTypeNameThai(el.type);
  document.getElementById("propLabelText").value = el.label || "";
  
  const supportLiquid = ['beaker', 'test-tube', 'conical-flask', 'cylinder', 'pipette', 'round-flask', 'crucible', 'evaporating-dish', 'burette', 'funnel', 'dropper'].includes(el.type);
  document.getElementById("propGroupLiquidLevel").style.display = supportLiquid ? "block" : "none";
  document.getElementById("propGroupLiquidColor").style.display = supportLiquid ? "block" : "none";
  
  document.getElementById("propGroupTemp").style.display = el.type === 'thermometer' ? "block" : "none";
  document.getElementById("propGroupWeight").style.display = el.type === 'scale' ? "block" : "none";
  document.getElementById("propGroupFlame").style.display = el.type === 'bunsen' ? "block" : "none";
  
  if (supportLiquid) {
    document.getElementById("propLiquidLevelRange").value = el.liquidLevel;
    document.getElementById("propLiquidLevelValue").textContent = `${el.liquidLevel}%`;
    
    // Preset Solution Colors
    const presets = [
      { color: '#3b82f6', name: 'สารละลายสีฟ้า (Blue)' },
      { color: '#ef4444', name: 'สารละลายสีแดง (Red)' },
      { color: '#10b981', name: 'สารละลายสีเขียว (Green)' },
      { color: '#f59e0b', name: 'สารละลายสีเหลือง (Yellow)' },
      { color: '#f97316', name: 'สารละลายสีส้ม (Orange)' },
      { color: '#a855f7', name: 'สารละลายสีม่วง (Purple)' },
      { color: '#ffffff', name: 'น้ำกลั่น/ไม่มีสี (Clear)' },
      { color: '#090d16', name: 'สารละลายสีดำ (Black)' }
    ];
    
    const presetsContainer = document.getElementById("propColorPresets");
    presetsContainer.innerHTML = presets.map(p => {
      const activeClass = p.color === el.liquidColor ? "active" : "";
      return `<button type="button" class="color-preset-btn ${activeClass}" data-color="${p.color}" style="background-color: ${p.color};" title="${p.name}"></button>`;
    }).join('');

    presetsContainer.querySelectorAll('.color-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        presetsContainer.querySelectorAll('.color-preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const color = btn.getAttribute('data-color');
        el.liquidColor = color;
        renderApparatusVisuals(id);
      });
    });
  }
  
  if (el.type === 'thermometer') {
    document.getElementById("propTempRange").value = el.temp;
    document.getElementById("propTempValue").textContent = `${el.temp}°C`;
  }
  
  if (el.type === 'scale') {
    document.getElementById("propWeightNum").value = el.weight.toFixed(2);
  }
  
  if (el.type === 'bunsen') {
    document.getElementById("propFlameOn").checked = el.flameOn;
  }
  
  document.getElementById("propScaleRange").value = el.scale;
  document.getElementById("propScaleValue").textContent = `${(el.scale / 10).toFixed(1)}x`;
  
  document.getElementById("propRotateRange").value = el.rotate;
  document.getElementById("propRotateValue").textContent = `${el.rotate}°`;
  
  lucide.createIcons();
}

function clearCanvas() {
  document.querySelectorAll('#labPlanSvg .apparatus').forEach(el => el.remove());
  plannerElements = [];
  selectElement(null);
}

function loadPlan(plan) {
  clearCanvas();
  document.getElementById("labPlanTitle").value = plan.title || "แผนการทดลองไม่มีชื่อ";
  
  plan.elements.forEach(el => {
    plannerElements.push(el);
    
    const id = el.id;
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.id = id;
    g.setAttribute("class", "apparatus");
    g.innerHTML = getApparatusMarkup(el.type, id, el);
    document.getElementById("labPlanSvg").appendChild(g);
    
    renderApparatusVisuals(id);
    
    let isDragging = false;
    let startX, startY;

    g.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      selectElement(id);
      
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      
      const mouseMoveHandler = (ev) => {
        if (!isDragging) return;
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        
        el.x += dx;
        el.y += dy;
        
        startX = ev.clientX;
        startY = ev.clientY;
        
        renderApparatusVisuals(id);
      };
      
      const mouseUpHandler = () => {
        isDragging = false;
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
      };
      
      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
    });
  });
  
  showToast(`โหลดแผน "${plan.title}" สำเร็จ`, "success");
}


