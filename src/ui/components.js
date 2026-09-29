/**
 * @file components.js
 * @description UI Component Controllers, Panel Navigation, Modal Management & Responsive Layout
 * Module: ui/components
 */

import { state, setActivePanel } from '../core/state.js';
import { checkPanelAccess } from '../rbac/rbac.js';
import { openLoginModal } from '../auth/login-modal.js';
import { selectCategoryTab, renderItemsTable, renderInventoryAlertsBar } from '../inventory/inventory.js';
import { renderBookings, renderRoomAvailability } from '../booking/booking.js';
import { renderTransactions } from '../borrowing/borrowing.js';
import { renderPurchaseOrders } from '../procurement/procurement.js';
import { renderBudgetOverview } from '../budget/budget.js';
import { renderUsersTable } from '../users/users.js';
import { updateDashboardMetrics } from '../dashboard/dashboard.js';

// Central Panel Navigation Controller
export function navigateToPanel(panelName, category = null, filter = null) {
  const panelId = panelName.startsWith("panel-") ? panelName : `panel-${panelName}`;

  // Check RBAC Guard
  if (!checkPanelAccess(panelId)) {
    if (typeof window.showToast === 'function') {
      window.showToast("คุณไม่มีสิทธิ์เข้าถึงหน้านี้ หรือจำเป็นต้องเข้าสู่ระบบก่อน", "warning");
    }
    openLoginModal();
    return;
  }

  // Deactivate existing panels
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));

  // Activate target panel
  const target = document.getElementById(panelId);
  if (target) {
    target.classList.add("active");
    setActivePanel(panelId);
  }

  // Update Sidebar active state
  document.querySelectorAll(".menu-item, .nav-item").forEach(item => {
    item.classList.remove("active");
    const link = item.querySelector("a, button");
    if (link && (link.getAttribute("onclick") || '').includes(panelName)) {
      item.classList.add("active");
    }
  });

  // Apply filters if provided
  if (category) {
    selectCategoryTab(category);
  }
  if (filter) {
    state.activeStatusFilter = filter;
  }

  // Scroll to top
  const mainContent = document.getElementById("main-content") || window;
  if (mainContent.scrollTo) {
    mainContent.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Trigger sub-renderers based on panel
  if (panelName === 'dashboard') {
    updateDashboardMetrics();
    renderBudgetOverview();
  } else if (panelName === 'all-items' || panelName === 'inventory') {
    renderInventoryAlertsBar();
    renderItemsTable();
  } else if (panelName === 'booking' || panelName === 'bookings' || panelName === 'lab-booking') {
    renderBookings();
    if (typeof renderRoomAvailability === 'function') renderRoomAvailability();
  } else if (panelName === 'borrow' || panelName === 'transactions' || panelName === 'borrow-return') {
    renderTransactions();
  } else if (panelName === 'purchase-orders') {
    renderPurchaseOrders();
  } else if (panelName === 'admin') {
    renderUsersTable();
  }

  // Close mobile sidebar if open
  closeMobileSidebar();

  if (window.lucide) lucide.createIcons();
}

// Mobile sidebar controls
export function toggleMobileSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("mobile-overlay");
  if (sidebar) sidebar.classList.toggle("active");
  if (overlay) overlay.classList.toggle("active");
  document.body.classList.toggle("mobile-sidebar-open");
}

export function closeMobileSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("mobile-overlay");
  if (sidebar && sidebar.classList.contains("active")) sidebar.classList.remove("active");
  if (overlay && overlay.classList.contains("active")) overlay.classList.remove("active");
  document.body.classList.remove("mobile-sidebar-open");
}

// Modal open/close helpers
export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add("active");
}

export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("active");
}

// Notification tab switcher
export function switchNotifTab(tabType) {
  const btnInv = document.getElementById("btnTabNotifInventory");
  const btnFeed = document.getElementById("btnTabNotifFeedback");
  const listInv = document.getElementById("notifInventoryList");
  const listFeed = document.getElementById("notifFeedbackList");

  if (tabType === 'inventory') {
    if (btnInv) btnInv.classList.add("active");
    if (btnFeed) btnFeed.classList.remove("active");
    if (listInv) listInv.style.display = "block";
    if (listFeed) listFeed.style.display = "none";
  } else {
    if (btnInv) btnInv.classList.remove("active");
    if (btnFeed) btnFeed.classList.add("active");
    if (listInv) listInv.style.display = "none";
    if (listFeed) listFeed.style.display = "block";
  }
}

// Mount to window for global backwards compatibility
if (typeof window !== 'undefined') {
  window.navigateToPanel = navigateToPanel;
  window.toggleMobileSidebar = toggleMobileSidebar;
  window.closeMobileSidebar = closeMobileSidebar;
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.switchNotifTab = switchNotifTab;
}
