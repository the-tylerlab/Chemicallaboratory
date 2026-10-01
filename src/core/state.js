/**
 * @file state.js
 * @description Central Application State Management
 * Module: core/state
 */

// Global State Store
export const state = {
  // Authentication & Session
  currentUser: null,
  userRole: 'L0',
  isAdminLoggedIn: false,

  // Inventory & Catalogs
  items: [],
  categories: ["สารเคมี", "อุปกรณ์วิทยาศาสตร์", "เครื่องแก้ว", "วัสดุสิ้นเปลือง"],
  units: ["ขวด", "หลอด", "ชิ้น", "อัน", "เครื่อง", "กล่อง"],
  activeCategory: 'all',
  activeStatusFilter: 'all',
  activeRoomFilter: 'all',
  searchQuery: '',
  currentPage: 1,
  itemsPerPage: 10,
  selectedBatchItems: new Set(),

  // Room Layouts & Locations
  labLayouts: {},
  activeRoom: 'Lab 1',

  // Activities & Logs
  activityLogs: [],

  // Bookings & Transactions
  bookings: [],
  transactions: [],

  // Procurement & Budget
  purchaseOrders: [],
  budget: {
    total: 250000,
    allocated: 180000,
    spent: 0,
    remaining: 250000,
    fiscalYear: '2569'
  },

  // Network & Sync status
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isBackendOnline: false,
  isSupabaseOnline: false,

  // UI state
  activePanel: 'dashboard',
  sidebarOpen: false
};

// SECURITY POLICY:
// LocalStorage is strictly for UI preferences and sanitized offline caches.
// NEVER persist passwords, password hashes, admin credentials, authorization decisions,
// or permanent privileged roles in LocalStorage. Actual user permissions MUST originate from the server.
if (typeof localStorage !== "undefined") {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("userRole");
  localStorage.removeItem("isAdminLoggedIn");
  localStorage.removeItem("userRoleLevel");
  localStorage.removeItem("lab_saved_credentials");
}

// Global subscribers for reactive state changes
const subscribers = new Set();

export function subscribeState(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

export function notifyStateChange(property, value) {
  subscribers.forEach(fn => {
    try { fn(property, value, state); } catch (e) { console.error('State subscriber error:', e); }
  });
}

// State mutators (Pure in-memory session management)
export function setCurrentUser(user, token) {
  state.currentUser = user || null;
  if (user && user.role) {
    state.userRole = user.role;
    state.isAdminLoggedIn = (user.role === 'L3' || user.role === 'admin');
    if (token) {
      localStorage.setItem("lab_auth_token", token);
    }
  } else {
    state.userRole = 'L0';
    state.isAdminLoggedIn = false;
    state.currentUser = null;
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("lab_auth_token");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("userRole");
      localStorage.removeItem("isAdminLoggedIn");
      localStorage.removeItem("userRoleLevel");
      localStorage.removeItem("lab_saved_credentials");
    }
  }
  notifyStateChange('currentUser', state.currentUser);
  notifyStateChange('userRole', state.userRole);
  notifyStateChange('isAdminLoggedIn', state.isAdminLoggedIn);
}

export function setItems(newItems) {
  state.items = Array.isArray(newItems) ? newItems : [];
  notifyStateChange('items', state.items);
}

export function setLabLayouts(layouts) {
  state.labLayouts = layouts || {};
  notifyStateChange('labLayouts', state.labLayouts);
}

export function setActivePanel(panelId) {
  state.activePanel = panelId;
  notifyStateChange('activePanel', panelId);
}

// Mount to window for global backwards compatibility
if (typeof window !== 'undefined') {
  window.__APP_STATE__ = state;
}
