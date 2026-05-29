// ==========================================================================
// STATE MANAGEMENT & INITIALIZATION
// ==========================================================================

// Global state variable
let items = [];
let currentPage = 1;
const itemsPerPage = 10;
let fileToImport = null;

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

// Initialize application on DOM ready
document.addEventListener("DOMContentLoaded", async () => {
  // First, check backend online status
  await checkBackendStatus();
  
  // Load data
  await loadAllItems();
  
  // Load borrowing transactions
  await loadAllTransactions();
  
  // Set up event listeners
  setupNavigation();
  setupFormHandlers();
  setupFilterHandlers();
  setupImportModal();
  setupDashboardCards();
  
  // Set up borrow form handlers
  setupBorrowForm();
  
  // Render views
  updateUI();
  
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
    // Skip if it's the Import link which opens modal instead of navigating
    if (link.id === "btnSidebarImport") return;

    link.addEventListener("click", (e) => {
      e.preventDefault();
      
      const targetPanelId = link.getAttribute("data-target");
      
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
  document.getElementById("quickBtnAdd").addEventListener("click", () => navigateToPanel("add-item"));
  document.getElementById("quickBtnImport").addEventListener("click", () => {
    document.getElementById("importModal").classList.add("active");
  });
  document.getElementById("quickBtnSearch").addEventListener("click", () => {
    navigateToPanel("all-items");
    document.getElementById("filterSearch").focus();
  });

  // Sidebar Import Button triggers modal
  document.getElementById("btnSidebarImport").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("importModal").classList.add("active");
  });

  // "ดูทั้งหมด ->" Link on Dashboard
  document.getElementById("linkViewAll").addEventListener("click", (e) => {
    e.preventDefault();
    navigateToPanel("all-items");
  });
}

// Function to programmatically switch panels
function navigateToPanel(panelId, catFilter = "all", statusFilter = "all") {
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
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border: 1px solid var(--border-color); border-radius: var(--border-radius-md); transition: var(--transition-fast);">
        <div class="product-cell">
          <span class="product-name" style="font-size: 13px;">${item.name}</span>
          <span style="font-size: 11px; color: var(--text-muted); display: flex; gap: 8px; align-items: center;">
            <span class="product-code" style="font-size: 10px; padding: 1px 4px;">${item.code}</span>
            <span>${item.category}</span>
          </span>
        </div>
        <div style="text-align: right; display: flex; flex-direction: column; gap: 4px; align-items: flex-end;">
          <span style="font-size: 13px; font-weight: 600;">${item.qty} ${item.unit}</span>
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
        <button class="action-icon-btn edit" onclick="editItem(${originalIndex})" title="แก้ไข/สั่งซื้อเพิ่ม" style="align-self: center; background: #fff; border: 1px solid var(--border-color); color: var(--primary); width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border-radius: var(--border-radius-sm);">
          <i data-lucide="edit-3" style="width: 14px; height: 14px;"></i>
        </button>
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
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 48px;">
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

    rowsHtml += `
      <tr>
        <td data-label="รายการ">
          <div class="product-cell">
            <span class="product-code">${item.code}</span>
            <span class="product-name">${item.name}</span>
            <span class="product-cat">${item.category}</span>
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

    const baseRowHtml = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; border-bottom: 1px solid var(--border-color); font-size: 13px;">
        <div class="product-cell">
          <span class="product-name" style="font-size: 14px;">${item.name}</span>
          <span style="font-size: 12px; color: var(--text-muted); display: flex; gap: 8px;">
            <span class="product-code">${item.code}</span>
            <span>จัดเก็บ: ${[item.room, item.cabinet, item.shelf].filter(Boolean).join(" > ") || "-"}</span>
          </span>
        </div>
    `;

    if (status === "expired") {
      expiredHtml += `
        ${baseRowHtml}
        <div style="text-align: right; display: flex; align-items: center; gap: 16px;">
          <div>
            <span style="color: var(--accent-red); font-weight: 600;">หมดอายุแล้วเมื่อ: ${formatThaiDate(item.expiry)}</span>
            <div style="font-size: 11px; color: var(--text-muted);">คงเหลือ: ${item.qty} ${item.unit}</div>
          </div>
          <button class="action-icon-btn edit" onclick="editItem(${index})" title="อัปเดตข้อมูล"><i data-lucide="edit-3" style="width: 14px; height: 14px;"></i></button>
        </div>
      </div>
      `;
    } else if (status === "near-expiry") {
      const expDate = new Date(item.expiry);
      const diffTime = expDate - TODAY;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      nearExpiryHtml += `
        ${baseRowHtml}
        <div style="text-align: right; display: flex; align-items: center; gap: 16px;">
          <div>
            <span style="color: var(--accent-yellow); font-weight: 600;">จะหมดอายุใน ${diffDays} วัน (${formatThaiDate(item.expiry)})</span>
            <div style="font-size: 11px; color: var(--text-muted);">คงเหลือ: ${item.qty} ${item.unit}</div>
          </div>
          <button class="action-icon-btn edit" onclick="editItem(${index})" title="อัปเดตข้อมูล"><i data-lucide="edit-3" style="width: 14px; height: 14px;"></i></button>
        </div>
      </div>
      `;
    } else if (status === "low-stock") {
      lowStockHtml += `
        ${baseRowHtml}
        <div style="text-align: right; display: flex; align-items: center; gap: 16px;">
          <div>
            <span style="color: var(--accent-orange); font-weight: 600;">ใกล้หมดคลัง: ${item.qty} ${item.unit}</span>
            <div style="font-size: 11px; color: var(--text-muted);">จุดสั่งซื้อขั้นต่ำคือ: ${item.minAlert} ${item.unit}</div>
          </div>
          <button class="action-icon-btn edit" onclick="editItem(${index})" title="อัปเดตสต็อก"><i data-lucide="edit-3" style="width: 14px; height: 14px;"></i></button>
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

    const editIndex = document.getElementById("editItemIndex").value;

    // Check duplicate code when creating new item
    if (editIndex === "") {
      const codeExists = items.some(item => (item.code || "").toLowerCase() === code.toLowerCase());
      if (codeExists) {
        showToast(`ไม่สามารถใช้รหัส ${code} ได้เนื่องจากมีในระบบแล้ว!`, "error");
        return;
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
    navigateToPanel("all-items");
  });
}

// Global Edit Action called from tables
window.editItem = function(index) {
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

  // UI state change
  document.getElementById("formPanelTitle").innerText = "แก้ไขข้อมูลสาร/อุปกรณ์";
  document.getElementById("formPanelSubtitle").innerText = `กำลังดำเนินการแก้ไขรายการ: [${item.code}] ${item.name}`;
  document.getElementById("btnSubmitForm").innerText = "บันทึกการแก้ไข";
  document.getElementById("btnCancelEdit").style.display = "inline-flex";
};

// Global Delete Action
window.deleteItem = async function(index) {
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
  } else {
    transactions = [];
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
  if (!dropdown) return;

  // Preserve selected value if any
  const selectedVal = dropdown.value;

  // Clear all except first default option
  dropdown.innerHTML = '<option value="" disabled selected>-- กรุณาเลือกรายการ --</option>';

  // Sort items alphabetically by name safely
  const sortedItems = [...items].sort((a, b) => (a.name || "").localeCompare(b.name || "", 'th'));

  sortedItems.forEach(item => {
    const option = document.createElement("option");
    option.value = item.code;
    option.innerText = `${item.name || "ไม่มีชื่อพัสดุ"} (${item.code || "ไม่มีรหัส"}) [คงเหลือ: ${item.qty || 0} ${item.unit || "หน่วย"}]`;
    dropdown.appendChild(option);
  });

  // Restore previous selection if it still exists
  if (selectedVal) {
    dropdown.value = selectedVal;
  }
}

// Setup Form listeners and Submit operations for Borrow/Return
function setupBorrowForm() {
  const form = document.getElementById("borrowForm");
  const btnReset = document.getElementById("btnResetBorrow");
  const borrowDateInput = document.getElementById("borrowDate");

  if (!form) return;

  // Set default date to today
  if (borrowDateInput) {
    const today = new Date().toISOString().split('T')[0];
    borrowDateInput.value = today;
  }

  // Reset handler
  btnReset.addEventListener("click", () => {
    form.reset();
    if (borrowDateInput) {
      const today = new Date().toISOString().split('T')[0];
      borrowDateInput.value = today;
    }
  });

  // Form submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const itemCode = document.getElementById("borrowItemCode").value;
    const borrowType = document.querySelector('input[name="borrowType"]:checked').value;
    const borrowQty = Number(document.getElementById("borrowQty").value);
    const borrowerName = document.getElementById("borrowerName").value.trim();
    const borrowDate = document.getElementById("borrowDate").value;
    const borrowNotes = document.getElementById("borrowNotes").value.trim();

    if (!itemCode || isNaN(borrowQty) || borrowQty <= 0 || !borrowerName || !borrowDate) {
      showToast("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน", "error");
      return;
    }

    // Find the item
    const itemIndex = items.findIndex(item => item.code === itemCode);
    if (itemIndex === -1) {
      showToast("ไม่พบข้อมูลพัสดุในระบบ", "error");
      return;
    }
    const item = items[itemIndex];

    // Business rules validation
    let newQty = item.qty;
    if (borrowType === "borrow") {
      if (borrowQty > item.qty) {
        showToast(`ไม่สามารถยืมได้! จำนวนที่ยืม (${borrowQty}) มากกว่าจำนวนคงเหลือในคลัง (${item.qty})`, "error");
        return;
      }
      newQty = item.qty - borrowQty;
    } else {
      // Return type
      newQty = item.qty + borrowQty;
    }

    // Update item stock in backend/cloud
    const updatedItem = { ...item, qty: newQty };
    const success = await updateItemBackend(item.code, updatedItem, itemIndex);

    if (success) {
      // Log the transaction
      const transactionData = {
        id: "TX-" + Date.now(),
        itemCode: item.code,
        itemName: item.name,
        qty: borrowQty,
        borrower: borrowerName,
        date: borrowDate,
        type: borrowType, // "borrow" or "return"
        status: borrowType === "borrow" ? "borrowed" : "returned",
        notes: borrowNotes,
        createdAt: new Date().toISOString()
      };

      const logged = await saveTransaction(transactionData);
      if (logged) {
        showToast(borrowType === "borrow" ? `ทำรายการยืม "${item.name}" สำเร็จ!` : `ทำรายการคืน "${item.name}" สำเร็จ!`, "success");
        form.reset();
        if (borrowDateInput) {
          const today = new Date().toISOString().split('T')[0];
          borrowDateInput.value = today;
        }
        updateUI();
      }
    }
  });
}

// Render dynamic transaction logs table
function renderTransactionsTable() {
  const tableBody = document.getElementById("transactionsTableBody");
  if (!tableBody) return;

  if (transactions.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 48px;">
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
    const isBorrowed = tx.type === "borrow";
    const statusText = tx.status === "borrowed" ? "กำลังยืม" : "คืนแล้ว";
    const statusBadge = tx.status === "borrowed" ? "badge-borrowed" : "badge-returned";
    
    // Check if it's currently borrowed to render the "Return" button
    let actionBtn = "-";
    if (tx.status === "borrowed") {
      actionBtn = `
        <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; border-color: var(--accent-green); color: var(--accent-green);" onclick="returnBorrowedItem('${tx.id}')">
          <i data-lucide="check" style="width: 12px; height: 12px;"></i>
          <span>คืนพัสดุ</span>
        </button>
      `;
    }

    html += `
      <tr>
        <td data-label="วันที่" style="font-size: 12px; color: var(--text-muted);">${formatThaiDate(tx.date)}</td>
        <td data-label="รายการ">
          <div style="font-weight: 600; color: #0f172a; font-size: 13px;">${tx.itemName}</div>
          <div style="font-family: monospace; font-size: 10px; color: var(--text-muted);">${tx.itemCode}</div>
          ${tx.notes ? `<div style="font-size: 11px; color: var(--text-muted); font-style: italic; margin-top: 2px;">* ${tx.notes}</div>` : ''}
        </td>
        <td data-label="จำนวน" style="font-weight: 600; font-size: 13px;">${tx.qty} หน่วย</td>
        <td data-label="ผู้ทำรายการ" style="font-weight: 500; font-size: 13px;">${tx.borrower}</td>
        <td data-label="ประเภท"><span class="${statusBadge}">${statusText}</span></td>
        <td data-label="จัดการ" style="text-align: center;">${actionBtn}</td>
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
