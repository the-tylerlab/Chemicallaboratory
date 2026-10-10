/**
 * @file main.js
 * @description Central Application Entry Point & Module Orchestrator
 * Module: main
 */

// 1. Core Modules
import { state } from './core/state.js';
import * as utils from './core/utils.js';
import * as api from './core/api.js';

// 2. Auth & RBAC Modules
import * as auth from './auth/auth.js';
import * as loginModal from './auth/login-modal.js';
import * as rbac from './rbac/rbac.js';

// 3. Domain Modules
import * as inventory from './inventory/inventory.js';
import * as equipment from './equipment/equipment.js';
import * as booking from './booking/booking.js';
import * as borrowing from './borrowing/borrowing.js';
import * as procurement from './procurement/procurement.js';
import * as budget from './budget/budget.js';
import * as users from './users/users.js';
import * as dashboard from './dashboard/dashboard.js';
import * as notifications from './notifications/notifications.js';
import * as chatbot from './chatbot/chatbot.js';
import * as ui from './ui/components.js';

// Export namespace
export {
  state,
  utils,
  api,
  auth,
  loginModal,
  rbac,
  inventory,
  equipment,
  booking,
  borrowing,
  procurement,
  budget,
  users,
  dashboard,
  notifications,
  chatbot,
  ui
};

// Application Initialization
export async function initApp() {
  console.log("[SciPortal] Laboratory Management System initializing (Modular Architecture)...");

  // 1. Setup UI & Event Handlers
  loginModal.setupLoginHandlers();
  loginModal.updateLoginUI();

  // 2. Verify Active User Session
  try {
    await auth.verifySession();
  } catch (err) {
    console.warn("Session verification completed with notice:", err);
  }

  // 3. Parallel Data Bootstrapping
  try {
    await Promise.allSettled([
      inventory.fetchItems(),
      equipment.fetchEquipmentAssets(),
      equipment.fetchEquipmentRepairs(),
      budget.fetchBudget(),
      booking.fetchBookings(),
      borrowing.fetchTransactions(),
      procurement.fetchPurchaseOrders(),
      notifications.fetchAnnouncements()
    ]);
  } catch (err) {
    console.warn("Data bootstrapping encountered notice:", err);
  }

  // 4. Update Dashboard KPIs
  dashboard.updateDashboardMetrics();
  budget.renderBudgetOverview();

  // 5. Initialize Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 6. Dismiss Loading Skeleton
  const sk = document.getElementById("app-skeleton-loader");
  if (sk) {
    sk.classList.add("fade-out");
    setTimeout(() => { if (sk && sk.parentNode) sk.remove(); }, 350);
  }

  console.log("[SciPortal] SciPortal initialized successfully in Modular Mode.");
}

// Auto-boot on DOM ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
}

// Global exposure
if (typeof window !== 'undefined') {
  window.SciPortal = {
    state,
    utils,
    api,
    auth,
    loginModal,
    rbac,
    inventory,
    equipment,
    booking,
    borrowing,
    procurement,
    budget,
    users,
    dashboard,
    notifications,
    chatbot,
    ui,
    initApp
  };
}
