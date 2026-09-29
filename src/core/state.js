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

// Initialize session state from localStorage
try {
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    state.currentUser = JSON.parse(savedUser);
    state.userRole = state.currentUser.role || 'L1';
    state.isAdminLoggedIn = (state.userRole === 'L3' || state.userRole === 'admin');
  } else {
    state.userRole = localStorage.getItem("userRole") || 'L0';
    state.isAdminLoggedIn = (state.userRole === 'L3' || state.userRole === 'admin');
  }
} catch (e) {
  state.currentUser = null;
  state.userRole = 'L0';
  state.isAdminLoggedIn = false;
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

// State mutators
export function setCurrentUser(user) {
  state.currentUser = user;
  if (user) {
    state.userRole = user.role || 'L1';
    state.isAdminLoggedIn = (state.userRole === 'L3' || state.userRole === 'admin');
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("userRole", state.userRole);
    localStorage.setItem("isAdminLoggedIn", state.isAdminLoggedIn ? "true" : "false");
  } else {
    state.userRole = 'L0';
    state.isAdminLoggedIn = false;
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userRole");
    localStorage.removeItem("isAdminLoggedIn");
  }
  notifyStateChange('currentUser', user);
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
