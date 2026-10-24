/**
 * @file inventory.js
 * @description Advanced Chemical & Equipment Inventory Management (P2 Specification)
 * Features: Chemical Master Data, Lot/Batch, Expiry/Received, Reorder Point, Safety Stock,
 * Storage Hierarchy, GHS Hazards, SDS, Compatibility Matrix, Stock Movements, Adjustments, QR Asset Tags
 * Module: inventory/inventory
 */

import { fetchWithAuth, API_BASE, getClientSupabase } from '../core/api.js';
import { state, setItems } from '../core/state.js';
import { formatDate, escapeHtml } from '../core/utils.js';
import { getCurrentRoleLevel, canUserAccessRoom } from '../rbac/rbac.js';

// Extend state for P2 inventory
if (!state.inventoryAlerts) {
  state.inventoryAlerts = null;
}

// --------------------------------------------------------------------------
// 1. DATA ACCESS & SYNCHRONIZATION
// --------------------------------------------------------------------------

// Fetch items from server API (Supabase Source of Truth) with Supabase direct & LocalStorage fallback
export async function fetchItems() {
  try {
    const res = await fetch(`${API_BASE}/items`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data);
        saveItemsToLocal();
        fetchInventoryAlerts(); // Background fetch alerts
        return data;
      }
    }
  } catch (err) {
    console.warn("[Inventory] Server unreachable, trying Supabase direct or cache:", err.message);
  }

  // Direct Supabase query fallback
  try {
    const supabase = getClientSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('items').select('*');
      if (!error && Array.isArray(data) && data.length > 0) {
        const activeItems = data.filter(it => !it.is_deleted);
        setItems(activeItems.length > 0 ? activeItems : data);
        saveItemsToLocal();
        return state.items;
      }
    }
  } catch(e) {}

  // Local storage fallback
  try {
    const local = localStorage.getItem("lab_items");
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setItems(parsed);
        return parsed;
      }
    }
  } catch (e) {}

  return state.items;
}

export function saveItemsToLocal() {
  try {
    localStorage.setItem("lab_items", JSON.stringify(state.items));
  } catch (e) {}
}

// Fetch Multi-factor Inventory Alerts from Backend
export async function fetchInventoryAlerts() {
  try {
    const res = await fetch(`${API_BASE}/inventory/alerts`);
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        state.inventoryAlerts = data;
        renderInventoryAlertsBar();
        return data;
      }
    }
  } catch(e) {
    console.warn("[Inventory] Alert fetch notice:", e.message);
  }
  return null;
}

// --------------------------------------------------------------------------
// 2. CRUD OPERATIONS (With Audit & Soft Delete)
// --------------------------------------------------------------------------

export async function createItem(itemData) {
  const role = getCurrentRoleLevel();
  if (role !== 'L2' && role !== 'L3') {
    throw new Error('เฉพาะเจ้าหน้าที่ (L2) หรือผู้ดูแลระบบ (L3) เท่านั้นที่สามารถเพิ่มพัสดุได้');
  }

  const res = await fetchWithAuth(`${API_BASE}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'ไม่สามารถบันทึกรายการได้');
  }

  const created = await res.json();
  state.items.unshift(created);
  saveItemsToLocal();
  renderItemsTable();
  fetchInventoryAlerts();
  return created;
}

export async function updateItem(code, updateFields) {
  const res = await fetchWithAuth(`${API_BASE}/items/${encodeURIComponent(code)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateFields)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'ไม่สามารถแก้ไขข้อมูลได้');
  }

  const updated = await res.json();
  const idx = state.items.findIndex(it => (it.code || '').toLowerCase() === code.toLowerCase());
  if (idx !== -1) {
    state.items[idx] = { ...state.items[idx], ...updated };
    saveItemsToLocal();
    renderItemsTable();
    fetchInventoryAlerts();
  }
  return updated;
}

export async function deleteItem(code) {
  const role = getCurrentRoleLevel();
  if (role !== 'L3') {
    throw new Error('เฉพาะผู้ดูแลระบบ (L3 Admin) เท่านั้นที่สามารถลบรายการพัสดุได้');
  }

  const res = await fetchWithAuth(`${API_BASE}/items/${encodeURIComponent(code)}`, {
    method: 'DELETE'
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'ไม่สามารถลบรายการได้');
  }

  state.items = state.items.filter(it => (it.code || '').toLowerCase() !== code.toLowerCase());
  saveItemsToLocal();
  renderItemsTable();
  fetchInventoryAlerts();
  return true;
}

// --------------------------------------------------------------------------
// 3. FILTERING & SEARCH
// --------------------------------------------------------------------------

export function getFilteredItems() {
  let list = [...state.items];
  const now = new Date();
  const future30 = new Date(now.getTime() + 30 * 86400000);

  // Category filter
  if (state.activeCategory && state.activeCategory !== 'all') {
    list = list.filter(item => item.category === state.activeCategory);
  }

  // Room filter
  if (state.activeRoomFilter && state.activeRoomFilter !== 'all') {
    list = list.filter(item => item.room === state.activeRoomFilter);
  }

  // Status Filter (Expired, Near-Expiry, Low Stock, Reorder Point)
  if (state.activeStatusFilter === 'expired') {
    list = list.filter(item => {
      const exp = item.expiry || item.expiryDate || item.expiry_date;
      return exp && new Date(exp) < now;
    });
  } else if (state.activeStatusFilter === 'near_expiry') {
    list = list.filter(item => {
      const expStr = item.expiry || item.expiryDate || item.expiry_date;
      if (!expStr) return false;
      const exp = new Date(expStr);
      return exp >= now && exp <= future30;
    });
  } else if (state.activeStatusFilter === 'low_stock') {
    list = list.filter(item => {
      const q = parseFloat(item.qty !== undefined ? item.qty : (item.quantity || 0));
      const min = parseFloat(item.minAlert !== undefined ? item.minAlert : (item.minStock || 5));
      return q <= min;
    });
  } else if (state.activeStatusFilter === 'reorder_needed') {
    list = list.filter(item => {
      const q = parseFloat(item.qty !== undefined ? item.qty : (item.quantity || 0));
      const min = parseFloat(item.minAlert !== undefined ? item.minAlert : (item.minStock || 5));
      const reorderPt = parseFloat(item.reorderPoint !== undefined ? item.reorderPoint : (min * 2));
      return q <= reorderPt;
    });
  }

  // Search query
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase().trim();
    list = list.filter(item => {
      return (item.name && item.name.toLowerCase().includes(q)) ||
             (item.code && item.code.toLowerCase().includes(q)) ||
             (item.formula && item.formula.toLowerCase().includes(q)) ||
             (item.casNumber && item.casNumber.toLowerCase().includes(q)) ||
             (item.cas_number && item.cas_number.toLowerCase().includes(q)) ||
             (item.supplier && item.supplier.toLowerCase().includes(q)) ||
             (item.room && item.room.toLowerCase().includes(q)) ||
             (item.cabinet && item.cabinet.toLowerCase().includes(q));
    });
  }

  return list;
}

export function selectCategoryTab(category) {
  state.activeCategory = category;
  state.currentPage = 1;

  document.querySelectorAll(".category-pill-btn").forEach(btn => {
    if (btn.getAttribute("data-category") === category) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  renderItemsTable();
}

// --------------------------------------------------------------------------
// 4. RENDERING: ALERTS BAR & ITEMS TABLE
// --------------------------------------------------------------------------

// Render Interactive Inventory Alerts Ribbon
export function renderInventoryAlertsBar() {
  let container = document.getElementById("inventoryAlertsBar");
  if (!container) {
    const tableHeader = document.querySelector("#panel-all-items .card-header, #panel-all-items .panel-header");
    if (!tableHeader) return;
    container = document.createElement("div");
    container.id = "inventoryAlertsBar";
    container.style.cssText = "margin: 12px 0 16px 0; display: flex; flex-wrap: wrap; gap: 8px;";
    tableHeader.parentNode.insertBefore(container, tableHeader.nextSibling);
  }

  const counts = state.inventoryAlerts?.counts || { expired: 0, nearExpiry: 0, lowStock: 0, reorderNeeded: 0, compatibilityAlerts: 0 };

  container.innerHTML = `
    <button class="alert-chip ${state.activeStatusFilter === 'expired' ? 'active' : ''}" onclick="filterByInventoryStatus('${state.activeStatusFilter === 'expired' ? 'all' : 'expired'}')" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid ${counts.expired > 0 ? '#fca5a5' : '#e2e8f0'}; background: ${counts.expired > 0 ? '#fee2e2' : '#f8fafc'}; color: ${counts.expired > 0 ? '#b91c1c' : '#64748b'};">
      <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #ef4444;"></span>
      หมดอายุแล้ว: ${counts.expired} รายการ
    </button>
    <button class="alert-chip ${state.activeStatusFilter === 'near_expiry' ? 'active' : ''}" onclick="filterByInventoryStatus('${state.activeStatusFilter === 'near_expiry' ? 'all' : 'near_expiry'}')" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid ${counts.nearExpiry > 0 ? '#fed7aa' : '#e2e8f0'}; background: ${counts.nearExpiry > 0 ? '#ffedd5' : '#f8fafc'}; color: ${counts.nearExpiry > 0 ? '#c2410c' : '#64748b'};">
      <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #f97316;"></span>
      ใกล้หมดอายุ (30 วัน): ${counts.nearExpiry} รายการ
    </button>
    <button class="alert-chip ${state.activeStatusFilter === 'low_stock' ? 'active' : ''}" onclick="filterByInventoryStatus('${state.activeStatusFilter === 'low_stock' ? 'all' : 'low_stock'}')" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid ${counts.lowStock > 0 ? '#fde68a' : '#e2e8f0'}; background: ${counts.lowStock > 0 ? '#fef3c7' : '#f8fafc'}; color: ${counts.lowStock > 0 ? '#b45309' : '#64748b'};">
      <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #eab308;"></span>
      สต็อกต่ำกว่าเกณฑ์: ${counts.lowStock} รายการ
    </button>
    <button class="alert-chip ${state.activeStatusFilter === 'reorder_needed' ? 'active' : ''}" onclick="filterByInventoryStatus('${state.activeStatusFilter === 'reorder_needed' ? 'all' : 'reorder_needed'}')" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid #bae6fd; background: #e0f2fe; color: #0369a1;">
      <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #0284c7;"></span>
      ถึงจุดสั่งซื้อใหม่ (Reorder): ${counts.reorderNeeded} รายการ
    </button>
    <button class="alert-chip" onclick="openCompatibilityCheckerModal()" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid #c7d2fe; background: #e0e7ff; color: #4338ca;">
      <i data-lucide="shield-alert" style="width: 13px; height: 13px;"></i>
      ตรวจสอบความเข้ากันได้ของสารเคมี (Safety Matrix)
    </button>
  `;
  if (window.lucide) lucide.createIcons();
}

export function filterByInventoryStatus(status) {
  state.activeStatusFilter = status;
  state.currentPage = 1;
  renderInventoryAlertsBar();
  renderItemsTable();
}

// Render Master Items Table
export function renderItemsTable() {
  const tableBody = document.getElementById("itemsTableBody");
  if (!tableBody) return;

  const filtered = getFilteredItems();
  const total = filtered.length;
  const start = (state.currentPage - 1) * state.itemsPerPage;
  const pageItems = filtered.slice(start, start + state.itemsPerPage);

  const countBadge = document.getElementById("totalItemsCountBadge");
  if (countBadge) countBadge.innerText = `${total} รายการ`;

  if (pageItems.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 48px 16px; color: #94a3b8;">
          <i data-lucide="package-x" style="width: 40px; height: 40px; stroke-width: 1.5; margin-bottom: 8px; opacity: 0.7;"></i>
          <p style="margin: 0; font-size: 14px; font-weight: 500;">ไม่พบข้อมูลสารเคมีหรือพัสดุตามเงื่อนไขที่เลือก</p>
        </td>
      </tr>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  const role = getCurrentRoleLevel();
  const isL2Plus = (role === 'L2' || role === 'L3' || role === 'L4');
  const canEdit = (role === 'L2' || role === 'L3');
  const now = new Date();

  tableBody.innerHTML = pageItems.map(item => {
    const q = parseFloat(item.qty !== undefined ? item.qty : (item.quantity || 0));
    const min = parseFloat(item.minAlert !== undefined ? item.minAlert : (item.minStock || 5));
    const reorderPt = parseFloat(item.reorderPoint !== undefined ? item.reorderPoint : (min * 2));
    
    const isOut = q <= 0;
    const isLow = q > 0 && q <= min;
    const isReorder = q > min && q <= reorderPt;

    let stockBadge = `<span class="badge badge-success" style="font-weight: 600;">${q} ${escapeHtml(item.unit || 'ชิ้น')}</span>`;
    if (isOut) {
      stockBadge = `<span class="badge badge-danger" style="font-weight: 600;">หมดสต็อก</span>`;
    } else if (isLow) {
      stockBadge = `<span class="badge badge-warning" style="font-weight: 600;">${q} ${escapeHtml(item.unit || 'ชิ้น')} (ใกล้หมด)</span>`;
    } else if (isReorder) {
      stockBadge = `<span class="badge" style="background: #e0f2fe; color: #0284c7; font-weight: 600;">${q} ${escapeHtml(item.unit || 'ชิ้น')} (จุดสั่งซื้อ)</span>`;
    }

    // Expiry check
    let expiryHtml = '-';
    const expStr = item.expiry || item.expiryDate || item.expiry_date;
    if (expStr) {
      const expDate = new Date(expStr);
      const isExpired = expDate < now;
      const isNear = !isExpired && expDate <= new Date(now.getTime() + 30 * 86400000);
      const formatted = formatDate(expStr);

      if (isExpired) {
        expiryHtml = `<span style="color: #ef4444; font-weight: 600;" title="หมดอายุแล้ว"><i data-lucide="alert-triangle" style="width: 12px; height: 12px; display: inline-block; vertical-align: middle;"></i> ${formatted}</span>`;
      } else if (isNear) {
        expiryHtml = `<span style="color: #f97316; font-weight: 600;" title="ใกล้หมดอายุใน 30 วัน">${formatted}</span>`;
      } else {
        expiryHtml = `<span style="color: #64748b;">${formatted}</span>`;
      }
    }

    return `
      <tr data-code="${escapeHtml(item.code)}">
        <td style="text-align: center;">
          <input type="checkbox" class="item-batch-checkbox" value="${escapeHtml(item.code)}" ${state.selectedBatchItems.has(item.code) ? 'checked' : ''} onchange="toggleBatchItem('${escapeHtml(item.code)}', this)">
        </td>
        <td style="font-family: monospace; font-size: 12px; font-weight: 600; color: #6366f1;">
          ${escapeHtml(item.code)}
          ${item.lotNumber || item.lot_number ? `<div style="font-size: 10px; color: #94a3b8;">Lot: ${escapeHtml(item.lotNumber || item.lot_number)}</div>` : ''}
        </td>
        <td>
          <div style="font-weight: 600; color: #1e293b;">${escapeHtml(item.name)}</div>
          <div style="display: flex; gap: 6px; font-size: 11px; color: #64748b; margin-top: 2px;">
            ${item.formula ? `<span style="font-family: monospace; background: #f1f5f9; padding: 1px 4px; border-radius: 4px;">${escapeHtml(item.formula)}</span>` : ''}
            ${item.casNumber || item.cas_number ? `<span>CAS: ${escapeHtml(item.casNumber || item.cas_number)}</span>` : ''}
          </div>
        </td>
        <td><span class="category-badge">${escapeHtml(item.category || '-')}</span></td>
        <td>
          <div style="font-size: 13px; color: #334155;">${escapeHtml(item.room || '-')}</div>
          <div style="font-size: 11px; color: #64748b;">${escapeHtml(item.cabinet || '-')} > ${escapeHtml(item.shelf || '-')} ${item.position ? `(${escapeHtml(item.position)})` : ''}</div>
        </td>
        <td>${stockBadge}</td>
        <td style="font-size: 12px;">${expiryHtml}</td>
        <td style="text-align: right; white-space: nowrap;">
          <button class="action-btn" title="ดูรายละเอียด Master Data" onclick="viewItemDetails('${escapeHtml(item.code)}')">
            <i data-lucide="eye" style="width: 14px; height: 14px;"></i>
          </button>
          <button class="action-btn" title="ประวัติการเคลื่อนไหวสต็อก (Movement History)" onclick="openStockMovementsModal('${escapeHtml(item.code)}')">
            <i data-lucide="history" style="width: 14px; height: 14px;"></i>
          </button>
          ${isL2Plus ? `
          <button class="action-btn" title="พิมพ์ป้าย QR Code / Barcode (Sticker Label)" onclick="openQRCodeModal('${escapeHtml(item.code)}')">
            <i data-lucide="qr-code" style="width: 14px; height: 14px;"></i>
          </button>
          ` : ''}
          ${canEdit ? `
            <button class="action-btn" title="ขอปรับยอดสต็อก (Adjustment)" onclick="openStockAdjustmentModal('${escapeHtml(item.code)}')">
              <i data-lucide="scale" style="width: 14px; height: 14px;"></i>
            </button>
            <button class="action-btn" title="แก้ไขพัสดุ" onclick="openEditItemModal('${escapeHtml(item.code)}')">
              <i data-lucide="edit" style="width: 14px; height: 14px;"></i>
            </button>
          ` : ''}
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

// --------------------------------------------------------------------------
// 5. MASTER DATA DETAIL MODAL (P2 Chemical Master View)
// --------------------------------------------------------------------------

export function viewItemDetails(code) {
  const role = typeof getCurrentRoleLevel === 'function' ? getCurrentRoleLevel() : 'L0';
  const isL3Plus = (role === 'L3' || role === 'L4' || role === 'admin' || role === 'executive' || (typeof userRole !== 'undefined' && (userRole === 'admin' || userRole === 'executive' || userRole === 'L3' || userRole === 'L4')));

  if (!isL3Plus) {
    if (typeof showToast === 'function') {
      showToast('เฉพาะผู้ดูแลระบบระดับ L3-L4 เท่านั้นที่ได้รับสิทธิ์เข้าถึง Master Data', 'error');
    }
    return;
  }

  const item = state.items.find(i => (i.code || '').toLowerCase() === code.toLowerCase());
  if (!item) {
    if (typeof window.showToast === 'function') window.showToast('ไม่พบข้อมูลพัสดุ', 'error');
    return;
  }

  // Remove existing modal if present
  const existing = document.getElementById("masterDetailModal");
  if (existing) existing.remove();

  const q = parseFloat(item.qty !== undefined ? item.qty : (item.quantity || 0));
  const minStock = parseFloat(item.minAlert !== undefined ? item.minAlert : (item.minStock || 3));
  const reorderPt = parseFloat(item.reorderPoint !== undefined ? item.reorderPoint : (minStock * 2));
  const safetyStock = parseFloat(item.safetyStock !== undefined ? item.safetyStock : minStock);

  const sdsSearchUrl = item.sdsUrl || item.sds_url || `https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(item.casNumber || item.name)}`;

  const modal = document.createElement("div");
  modal.id = "masterDetailModal";
  modal.className = "modal-overlay active";
  modal.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 16px;";

  modal.innerHTML = `
    <div class="modal-content">
      <!-- Modal Header -->
      <div style="padding: 20px 24px; border-bottom: 1px solid #edf2f7; display: flex; justify-content: space-between; align-items: flex-start; background: #ffffff;">
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span style="background: #4f46e5; color: #ffffff; padding: 3px 9px; border-radius: 6px; font-weight: 700; font-size: 11px; display: inline-flex; align-items: center; gap: 5px; letter-spacing: 0.5px;">
              <i data-lucide="shield-check" style="width: 12px; height: 12px;"></i> MASTER RECORD (L3-L4)
            </span>
            <span style="font-family: monospace; background: #e0e7ff; color: #4338ca; padding: 3px 8px; border-radius: 6px; font-weight: 700; font-size: 13px;">${escapeHtml(item.code)}</span>
            <span class="category-badge" style="font-size: 12px; color: #475569; background: #f1f5f9; padding: 3px 9px; border-radius: 999px; font-weight: 600;">${escapeHtml(item.category || '-')}</span>
          </div>
          <div>
            <h2 style="margin: 0; font-size: 19px; color: #0f172a; font-weight: 700; line-height: 1.35;">
              ${escapeHtml(item.name)}
              ${item.formula ? `<span style="font-family: monospace; font-size: 14px; color: #6366f1; font-weight: 600; margin-left: 6px;">(${escapeHtml(item.formula)})</span>` : ''}
            </h2>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
              ศูนย์ควบคุมข้อมูลสต็อกขั้นสูง การจัดซื้อ ล็อตสินค้า และพิกัดความปลอดภัยห้องปฏิบัติการ
            </div>
          </div>
        </div>
        <button type="button" class="modal-close-btn" onclick="document.getElementById('masterDetailModal').remove()" aria-label="ปิดหน้าต่าง" title="ปิดหน้าต่าง">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <div style="padding: 24px; background: #f8fafc; display: flex; flex-direction: column; gap: 20px; overflow-y: auto; max-height: calc(90vh - 145px);">
        <!-- 4 KPI Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px;">
          <div class="master-kpi-card highlight">
            <div style="font-size: 11.5px; color: #0369a1; font-weight: 600;">คงเหลือปัจจุบัน (Stock)</div>
            <div style="font-size: 20px; font-weight: 800; color: #0284c7; margin-top: 4px;">
              ${q} <span style="font-size: 13px; font-weight: 600; color: #0369a1;">${escapeHtml(item.unit || 'ชิ้น')}</span>
            </div>
            <div style="font-size: 10.5px; color: #0284c7; margin-top: 2px;">อัปเดตเรียลไทม์ในระบบ</div>
          </div>
          <div class="master-kpi-card">
            <div style="font-size: 11.5px; color: #64748b; font-weight: 600;">เกณฑ์เตือนขั้นต่ำ (Min)</div>
            <div style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 4px;">
              ${minStock} <span style="font-size: 12px; font-weight: 500; color: #64748b;">${escapeHtml(item.unit || 'ชิ้น')}</span>
            </div>
            <div style="font-size: 10.5px; color: #94a3b8; margin-top: 2px;">จุดแจ้งเตือนห้องแล็บ</div>
          </div>
          <div class="master-kpi-card">
            <div style="font-size: 11.5px; color: #64748b; font-weight: 600;">จุดสั่งซื้อใหม่ (Reorder)</div>
            <div style="font-size: 18px; font-weight: 700; color: #4338ca; margin-top: 4px;">
              ${reorderPt} <span style="font-size: 12px; font-weight: 500; color: #64748b;">${escapeHtml(item.unit || 'ชิ้น')}</span>
            </div>
            <div style="font-size: 10.5px; color: #94a3b8; margin-top: 2px;">เกณฑ์เปิดใบขอซื้อ (PR)</div>
          </div>
          <div class="master-kpi-card">
            <div style="font-size: 11.5px; color: #64748b; font-weight: 600;">สต็อกสำรอง (Safety)</div>
            <div style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 4px;">
              ${safetyStock} <span style="font-size: 12px; font-weight: 500; color: #64748b;">${escapeHtml(item.unit || 'ชิ้น')}</span>
            </div>
            <div style="font-size: 10.5px; color: #94a3b8; margin-top: 2px;">สำรองภาวะฉุกเฉิน</div>
          </div>
        </div>

        <!-- 2 Detailed Master Bento Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px;">
          <!-- Left Column: Procurement & Batch Traceability -->
          <div class="master-info-card">
            <h4 style="margin: 0; font-size: 13.5px; color: #4338ca; display: flex; align-items: center; gap: 7px; font-weight: 700; border-bottom: 1.5px solid #eef2f6; padding-bottom: 10px;">
              <i data-lucide="package-check" style="width: 16px; height: 16px; color: #6366f1;"></i>
              <span>การจัดซื้อและล็อตสินค้า (Procurement & Lot)</span>
            </h4>
            <div class="master-info-row">
              <span class="master-info-label">Lot / Batch Number:</span>
              <span class="master-info-value" style="font-family: monospace; color: #4338ca;">${escapeHtml(item.lotNumber || item.lot_number || '-')}</span>
            </div>
            <div class="master-info-row">
              <span class="master-info-label">วันที่รับเข้าคลัง:</span>
              <span class="master-info-value">${formatDate(item.receivedDate || item.received_date || item.createdAt)}</span>
            </div>
            <div class="master-info-row">
              <span class="master-info-label">วันหมดอายุพัสดุ:</span>
              <span class="master-info-value" style="color: ${item.expiry || item.expiryDate ? '#b91c1c' : '#0f172a'};">${formatDate(item.expiry || item.expiryDate || item.expiry_date)}</span>
            </div>
            <div class="master-info-row">
              <span class="master-info-label">ผู้จัดจำหน่าย (Vendor):</span>
              <span class="master-info-value">${escapeHtml(item.supplier || '-')}</span>
            </div>
            <div class="master-info-row">
              <span class="master-info-label">หน่วยนับในระบบ:</span>
              <span class="master-info-value">${escapeHtml(item.unit || 'ชิ้น')}</span>
            </div>
          </div>

          <!-- Right Column: Location & Safety Matrix -->
          <div class="master-info-card">
            <h4 style="margin: 0; font-size: 13.5px; color: #4338ca; display: flex; align-items: center; gap: 7px; font-weight: 700; border-bottom: 1.5px solid #eef2f6; padding-bottom: 10px;">
              <i data-lucide="shield-alert" style="width: 16px; height: 16px; color: #ef4444;"></i>
              <span>ตำแหน่งและความปลอดภัย (Location & Safety)</span>
            </h4>
            <div class="master-info-row">
              <span class="master-info-label">ห้องปฏิบัติการ:</span>
              <span class="master-info-value">${escapeHtml(item.room || '-')}</span>
            </div>
            <div class="master-info-row">
              <span class="master-info-label">ตู้จัดเก็บสาร:</span>
              <span class="master-info-value">${escapeHtml(item.cabinet || '-')}</span>
            </div>
            <div class="master-info-row">
              <span class="master-info-label">ชั้นวาง / ตำแหน่ง:</span>
              <span class="master-info-value">${escapeHtml(item.shelf || '-')} ${item.position ? `(ช่อง ${escapeHtml(item.position)})` : ''}</span>
            </div>
            <div class="master-info-row">
              <span class="master-info-label">CAS Registry No.:</span>
              <span class="master-info-value" style="font-family: monospace;">${escapeHtml(item.casNumber || item.cas_number || '-')}</span>
            </div>
            <div class="master-info-row">
              <span class="master-info-label">กลุ่มสารเคมี SHECU:</span>
              <span class="master-info-value">
                <span style="background: #e0e7ff; color: #4338ca; padding: 2px 7px; border-radius: 4px; font-size: 11.5px; font-weight: 700;">
                  ${escapeHtml(item.storageGroup || item.chemicalType || 'General')}
                </span>
              </span>
            </div>
            <div class="master-info-row">
              <span class="master-info-label">ระดับเตือนอันตราย:</span>
              <span class="master-info-value" style="color: ${item.signalWord === 'Danger' ? '#dc2626' : '#d97706'};">
                ${escapeHtml(item.signalWord || 'Warning')}
              </span>
            </div>
            <div style="margin-top: 6px; padding-top: 8px; border-top: 1px dashed #e2e8f0;">
              <a href="${escapeHtml(sdsSearchUrl)}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; background: #0284c7; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 12px; font-weight: 600; box-shadow: 0 2px 4px rgba(2, 132, 199, 0.25);">
                <i data-lucide="file-text" style="width: 14px; height: 14px;"></i> ดูเอกสารความปลอดภัย (SDS Sheet)
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Action Toolbar (L3/L4 Operational Actions) -->
      <div style="padding: 14px 24px; border-top: 1px solid #edf2f7; background: #ffffff; display: flex; justify-content: flex-end; align-items: center; gap: 8px; flex-wrap: wrap;">
        <button type="button" class="btn btn-secondary modal-footer-btn" onclick="document.getElementById('masterDetailModal').remove(); openStockMovementsModal('${escapeHtml(item.code)}');" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 10px; font-size: 12.5px;">
          <i data-lucide="history" style="width: 14px; height: 14px;"></i>
          <span>บันทึกเบิก/ใช้ (Movement)</span>
        </button>
        ${(getCurrentRoleLevel() === 'L2' || getCurrentRoleLevel() === 'L3' || getCurrentRoleLevel() === 'L4') ? `
        <button type="button" class="btn btn-secondary modal-footer-btn" onclick="document.getElementById('masterDetailModal').remove(); openQRCodeModal('${escapeHtml(item.code)}');" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 10px; font-size: 12.5px;">
          <i data-lucide="qr-code" style="width: 14px; height: 14px;"></i>
          <span>ป้าย QR Code</span>
        </button>
        ` : ''}
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  if (window.lucide) lucide.createIcons();
}

// --------------------------------------------------------------------------
// 6. STOCK MOVEMENTS MODAL (Audit Trail & Logging)
// --------------------------------------------------------------------------

export async function openStockMovementsModal(code) {
  const item = state.items.find(i => (i.code || '').toLowerCase() === code.toLowerCase());
  if (!item) return;

  const existing = document.getElementById("stockMovementsModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "stockMovementsModal";
  modal.className = "modal-overlay active";
  modal.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px;";

  modal.innerHTML = `
    <div class="modal-content" style="background: #ffffff; border-radius: 16px; width: 100%; max-width: 680px; max-height: 90vh; overflow-y: auto; padding: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div>
          <h3 style="margin: 0; font-size: 17px; font-weight: 700; color: #0f172a;"><i data-lucide="history" class="inline-icon"></i> ประวัติการเคลื่อนไหวสต็อก (Stock Movement History)</h3>
          <div style="font-size: 13px; color: #64748b; margin-top: 2px;">${escapeHtml(item.name)} (${escapeHtml(item.code)})</div>
        </div>
        <button onclick="document.getElementById('stockMovementsModal').remove()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #94a3b8;">&times;</button>
      </div>

      <!-- Quick Action Form -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; color: #334155;">บันทึกการเคลื่อนไหวสต็อกใหม่</h4>
        <form id="recordMovementForm" onsubmit="handleRecordMovementSubmit(event, '${escapeHtml(item.code)}')" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
          <div>
            <label style="font-size: 11px; font-weight: 600; color: #64748b;">ประเภทการเคลื่อนไหว</label>
            <select name="type" required style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 13px;">
              <option value="OUT">เบิกใช้ในแล็บ (OUT)</option>
              <option value="IN">รับเข้าสต็อก (IN)</option>
              <option value="DISPOSE">จำหน่าย/ทิ้งสารเสื่อม (DISPOSE)</option>
            </select>
          </div>
          <div>
            <label style="font-size: 11px; font-weight: 600; color: #64748b;">จำนวน (${escapeHtml(item.unit || 'ชิ้น')})</label>
            <input type="number" step="any" min="0.01" name="quantity" required placeholder="เช่น 1 หรือ 0.5" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 13px;">
          </div>
          <div>
            <label style="font-size: 11px; font-weight: 600; color: #64748b;">เหตุผล / วัตถุประสงค์</label>
            <input type="text" name="reason" required placeholder="เช่น การทดลอง ม.5/1" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 13px;">
          </div>
          <div style="grid-column: span 3; text-align: right; margin-top: 4px;">
            <button type="submit" class="btn btn-primary" style="padding: 6px 16px; background: #0284c7; color: white; border: none; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer;">
              บันทึกการเคลื่อนไหว
            </button>
          </div>
        </form>
      </div>

      <!-- History Table Container -->
      <div id="movementsTableContainer">
        <div style="text-align: center; padding: 20px; color: #94a3b8;">กำลังโหลดประวัติการเคลื่อนไหว...</div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  if (window.lucide) lucide.createIcons();

  // Load history from backend
  try {
    const res = await fetch(`${API_BASE}/inventory/movements?itemCode=${encodeURIComponent(item.code)}`);
    const data = await res.json();
    const container = document.getElementById("movementsTableContainer");
    if (!container) return;

    if (!data.success || !data.movements || data.movements.length === 0) {
      container.innerHTML = `<div style="text-align: center; padding: 24px; color: #94a3b8; font-size: 13px;">ยังไม่มีประวัติการเคลื่อนไหวสต็อกสำหรับรายการนี้</div>`;
      return;
    }

    container.innerHTML = `
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <thead>
          <tr style="border-bottom: 2px solid #e2e8f0; text-align: left; color: #64748b;">
            <th style="padding: 8px;">วัน-เวลา</th>
            <th style="padding: 8px;">ประเภท</th>
            <th style="padding: 8px;">จำนวน</th>
            <th style="padding: 8px;">ยอดเดิม -> ใหม่</th>
            <th style="padding: 8px;">ผู้บันทึก</th>
            <th style="padding: 8px;">เหตุผล</th>
          </tr>
        </thead>
        <tbody>
          ${data.movements.map(m => `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 8px; color: #64748b; font-size: 12px;">${formatDate(m.created_at || m.createdAt)}</td>
              <td style="padding: 8px;">
                <span style="font-weight: 600; padding: 2px 6px; border-radius: 4px; font-size: 11px; background: ${m.type === 'IN' ? '#dcfce7; color: #15803d;' : (m.type === 'OUT' ? '#fee2e2; color: #b91c1c;' : '#e0e7ff; color: #4338ca;')}">${escapeHtml(m.type)}</span>
              </td>
              <td style="padding: 8px; font-weight: 600;">${m.quantity} ${escapeHtml(m.unit || '')}</td>
              <td style="padding: 8px; color: #64748b; font-size: 12px;">${m.previous_quantity || m.previousQuantity || 0} -> ${m.new_quantity || m.newQuantity || 0}</td>
              <td style="padding: 8px; font-size: 12px;">${escapeHtml(m.created_by || m.createdBy || '-')}</td>
              <td style="padding: 8px; font-size: 12px;">${escapeHtml(m.reason || '-')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch(e) {
    const container = document.getElementById("movementsTableContainer");
    if (container) container.innerHTML = `<div style="text-align: center; color: #ef4444; padding: 12px;">ไม่สามารถดึงข้อมูลประวัติได้</div>`;
  }
}

export async function handleRecordMovementSubmit(event, itemCode) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const payload = {
    itemCode,
    type: formData.get("type"),
    quantity: parseFloat(formData.get("quantity")),
    reason: formData.get("reason")
  };

  try {
    const res = await fetchWithAuth(`${API_BASE}/inventory/movements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'บันทึกการเคลื่อนไหวไม่สำเร็จ');
    }

    if (typeof window.showToast === 'function') window.showToast('บันทึกการเคลื่อนไหวสต็อกสำเร็จ', 'success');
    
    // Refresh item quantity in state
    const idx = state.items.findIndex(i => i.code === itemCode);
    if (idx !== -1) {
      state.items[idx].qty = data.currentStock;
      state.items[idx].quantity = data.currentStock;
      saveItemsToLocal();
      renderItemsTable();
    }

    // Refresh movement modal
    openStockMovementsModal(itemCode);
  } catch(err) {
    if (typeof window.showToast === 'function') window.showToast(err.message, 'error');
    else alert(err.message);
  }
}

// --------------------------------------------------------------------------
// 7. STOCK ADJUSTMENT WORKFLOW (Request & Approval)
// --------------------------------------------------------------------------

export function openStockAdjustmentModal(code) {
  const item = state.items.find(i => (i.code || '').toLowerCase() === code.toLowerCase());
  if (!item) return;

  const existing = document.getElementById("stockAdjustmentModal");
  if (existing) existing.remove();

  const role = getCurrentRoleLevel();
  const canApprove = (role === 'L3' || role === 'L4');
  const currentQty = parseFloat(item.qty !== undefined ? item.qty : (item.quantity || 0));

  const modal = document.createElement("div");
  modal.id = "stockAdjustmentModal";
  modal.className = "modal-overlay active";
  modal.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px;";

  modal.innerHTML = `
    <div class="modal-content" style="background: #ffffff; border-radius: 16px; width: 100%; max-width: 540px; padding: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="margin: 0; font-size: 17px; font-weight: 700; color: #0f172a;"><i data-lucide="scale" class="inline-icon"></i> ขอปรับปรุงยอดคงคลัง (Stock Adjustment)</h3>
        <button onclick="document.getElementById('stockAdjustmentModal').remove()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #94a3b8;">&times;</button>
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 16px; font-size: 13px;">
        <div><strong>พัสดุ:</strong> ${escapeHtml(item.name)} (${escapeHtml(item.code)})</div>
        <div><strong>ยอดในระบบปัจจุบัน:</strong> <span style="font-weight: 700; color: #0284c7;">${currentQty} ${escapeHtml(item.unit || 'ชิ้น')}</span></div>
      </div>

      <form id="stockAdjustmentForm" onsubmit="handleAdjustmentSubmit(event, '${escapeHtml(item.code)}')">
        <div style="margin-bottom: 12px;">
          <label style="display: block; font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 4px;">ยอดนับจริงที่ต้องการปรับเป็น (${escapeHtml(item.unit || 'ชิ้น')}):</label>
          <input type="number" step="any" min="0" name="adjustedQuantity" required placeholder="ระบุจำนวนจริงที่นับได้" style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 14px;">
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 4px;">เหตุผลในการปรับยอด (Audit Reason):</label>
          <textarea name="reason" required rows="3" placeholder="ระบุสาเหตุ เช่น ขวดแตกเสียหาย, สารระเหยตกค้าง, ตรวจนับสต็อกประจำภาคเรียน" style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px; font-family: inherit;"></textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" onclick="document.getElementById('stockAdjustmentModal').remove()" style="padding: 8px 16px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; cursor: pointer; font-size: 13px;">ยกเลิก</button>
          <button type="submit" class="btn btn-primary" style="padding: 8px 20px; background: #0f172a; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 13px;">
            ${canApprove ? 'ส่งคำขอปรับยอด' : 'ส่งคำขออนุมัติปรับยอด'}
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
}

export async function handleAdjustmentSubmit(event, itemCode) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const payload = {
    itemCode,
    adjustedQuantity: parseFloat(formData.get("adjustedQuantity")),
    reason: formData.get("reason")
  };

  try {
    const res = await fetchWithAuth(`${API_BASE}/inventory/adjustments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'ส่งคำขอไม่สำเร็จ');
    }

    if (typeof window.showToast === 'function') window.showToast('ส่งคำขอปรับปรุงยอดสต็อกเรียบร้อยแล้ว รอผู้ดูแลระบบอนุมัติ', 'success');
    document.getElementById('stockAdjustmentModal')?.remove();
  } catch(err) {
    if (typeof window.showToast === 'function') window.showToast(err.message, 'error');
    else alert(err.message);
  }
}

// --------------------------------------------------------------------------
// 8. PRINTABLE QR CODE / BARCODE ASSET LABEL (P2 Labeling)
// --------------------------------------------------------------------------

export function renderAssetLabelCard(item) {
  if (!item) return '';

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(JSON.stringify({
    system: "SCIPORTAL-LAB",
    code: item.code,
    name: item.name,
    room: item.room || '',
    cabinet: item.cabinet || '',
    shelf: item.shelf || ''
  }))}`;

  // 1. Cabinet name formatting
  let cabinetName = (item.cabinet || 'CABINET 1').trim();
  if (cabinetName.startsWith('ตู้')) {
    cabinetName = cabinetName.replace(/^ตู้\s*/, 'CABINET ');
  } else if (!cabinetName.toLowerCase().startsWith('cabinet')) {
    cabinetName = `CABINET ${cabinetName}`;
  }
  cabinetName = cabinetName.toUpperCase();

  // 2. Badge styling & text
  let badgeBg = '#2563eb';
  let badgeText = 'GENERAL';

  if (item.category === 'สารเคมี' || (item.chemicalType && item.chemicalType !== 'general')) {
    badgeBg = '#dc2626';
    const ghsCode = (item.ghs && item.ghs.length > 0 && item.ghs[0]) ? item.ghs[0].toUpperCase() : 'GHS05';
    let hazardType = 'CORROSIVE';
    if (item.chemicalType) {
      hazardType = item.chemicalType.toUpperCase();
    } else if (item.ghs && item.ghs.includes('flammable')) {
      hazardType = 'FLAMMABLE';
    } else if (item.ghs && item.ghs.includes('toxic')) {
      hazardType = 'TOXIC';
    } else if (item.ghs && item.ghs.includes('oxidizing')) {
      hazardType = 'OXIDIZING';
    }
    badgeText = `${hazardType} · ${ghsCode}`;
  } else if (item.category === 'เครื่องแก้ว' || (item.category || '').toLowerCase().includes('glass')) {
    badgeBg = '#2563eb';
    badgeText = 'GLASSWARE';
  } else if (item.category === 'อุปกรณ์' || item.category === 'เครื่องมือวิทยาศาสตร์' || (item.category || '').toLowerCase().includes('apparatus') || (item.category || '').toLowerCase().includes('equipment')) {
    badgeBg = '#0d9488';
    badgeText = 'APPARATUS';
  } else if (item.category === 'วัสดุสิ้นเปลือง' || (item.category || '').toLowerCase().includes('consumable')) {
    badgeBg = '#d97706';
    badgeText = 'CONSUMABLE';
  } else {
    badgeBg = '#475569';
    badgeText = (item.category || 'LAB ASSET').toUpperCase();
  }

  // 3. Shelf value formatting
  const shelfMatch = (item.shelf || '').match(/\d+/);
  const shelfVal = shelfMatch ? `S${shelfMatch[0]}` : (item.shelf ? item.shelf.toUpperCase().replace(/\s+/g, '') : 'S1');

  // 4. Row/Bin value formatting
  let binVal = item.position || item.bin || '';
  if (!binVal) {
    const letter = item.category === 'เครื่องแก้ว' ? 'G' : (item.category === 'สารเคมี' ? 'B' : 'E');
    const num = shelfMatch ? (parseInt(shelfMatch[0]) * 2) : 4;
    binVal = `${letter}-${num < 10 ? '0' + num : num}`;
  }

  // 5. Pos or Unit label & value
  const isApparatus = (item.category === 'อุปกรณ์' || item.category === 'เครื่องมือวิทยาศาสตร์' || badgeText === 'APPARATUS');
  const unitOrPosLabel = isApparatus ? 'UNIT' : 'POS';
  let unitOrPosVal = item.slot || (isApparatus ? '1' : (item.category === 'เครื่องแก้ว' ? 'A' : '3'));

  // 6. Subtitle / Specification
  let subInfo = '';
  if (item.category === 'สารเคมี') {
    const grade = item.grade || item.spec || 'AR Grade';
    const cas = item.casNo || item.casNumber ? `CAS ${item.casNo || item.casNumber}` : (item.formula ? `Formula: ${item.formula}` : '');
    subInfo = [grade, cas].filter(Boolean).join(' · ');
  } else if (item.category === 'เครื่องแก้ว') {
    const vol = item.capacity || item.volume ? `Volume: ${item.capacity || item.volume}` : (item.spec || 'Volume: 250 mL');
    const brand = item.brand || item.manufacturer || 'Pyrex';
    subInfo = [vol, brand].filter(Boolean).join(' · ');
  } else {
    const model = item.model || item.brand || item.spec || 'LabTech MS-300';
    const volt = item.voltage || item.rating || '220V';
    subInfo = [model, volt].filter(Boolean).join(' · ');
  }

  // 7. Quantity and Unit formatting
  let unitText = item.unit || 'ชิ้น';
  const unitMap = {
    'ขวด': 'Btl',
    'ชิ้น': 'Pcs',
    'เครื่อง': 'Units',
    'อัน': 'Pcs',
    'ชุด': 'Sets',
    'กล่อง': 'Boxes',
    'หลอด': 'Tubes',
    'แผ่น': 'Pcs'
  };
  if (unitMap[unitText]) {
    unitText = unitMap[unitText];
  } else if (unitText === 'Unit' || unitText === 'unit') {
    unitText = 'Units';
  }

  return `
    <div class="asset-label-card">
      <!-- Left QR Box -->
      <div class="asset-label-qr-box">
        <div class="asset-label-qr-tag">QR</div>
        <img class="asset-label-qr-img" src="${qrImageUrl}" alt="QR Code">
      </div>

      <!-- Vertical Divider -->
      <div class="asset-label-divider"></div>

      <!-- Middle Location & Coordinates -->
      <div class="asset-label-mid">
        <div>
          <div class="asset-label-cabinet">${escapeHtml(cabinetName)}</div>
          <span class="asset-label-pill" style="background-color: ${badgeBg};">${escapeHtml(badgeText)}</span>
        </div>
        <div class="asset-label-coords">
          <div class="asset-label-coord-item">
            <span class="asset-label-coord-label">SHELF</span>
            <span class="asset-label-coord-value">${escapeHtml(shelfVal)}</span>
          </div>
          <div class="asset-label-coord-item">
            <span class="asset-label-coord-label">ROW/BIN</span>
            <span class="asset-label-coord-value">${escapeHtml(binVal)}</span>
          </div>
          <div class="asset-label-coord-item">
            <span class="asset-label-coord-label">${escapeHtml(unitOrPosLabel)}</span>
            <span class="asset-label-coord-value">${escapeHtml(unitOrPosVal)}</span>
          </div>
        </div>
      </div>

      <!-- Right Item Info & Quantity -->
      <div class="asset-label-right">
        <div style="width: 100%;">
          <h4 class="asset-label-item-name">${escapeHtml(item.name)}</h4>
          <div class="asset-label-item-sub">${escapeHtml(subInfo)}</div>
        </div>
        <div>
          <div class="asset-label-item-qty">Qty: ${item.qty || item.quantity || 0} ${escapeHtml(unitText)}</div>
          <div class="asset-label-item-id">ID: ${escapeHtml(item.code)} · chemicallab</div>
        </div>
      </div>
    </div>
  `;
}

export async function openQRCodeModal(code) {
  const role = getCurrentRoleLevel();
  const isL2Plus = (role === 'L2' || role === 'L3' || role === 'L4');
  if (!isL2Plus) {
    if (typeof showToast === 'function') {
      showToast("การพิมพ์ป้าย Sticker Label อนุญาตเฉพาะเจ้าหน้าที่แล็บ (L2) ขึ้นไปเท่านั้น", "warning");
    } else {
      alert("การพิมพ์ป้าย Sticker Label อนุญาตเฉพาะเจ้าหน้าที่แล็บ (L2) ขึ้นไปเท่านั้น");
    }
    return;
  }

  const item = state.items.find(i => (i.code || '').toLowerCase() === code.toLowerCase());
  if (!item) return;

  const existing = document.getElementById("qrAssetModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "qrAssetModal";
  modal.className = "modal-overlay active";
  modal.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px;";

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 9px;">
          <span style="background: #e0e7ff; color: #4338ca; padding: 6px; border-radius: 8px; display: inline-flex;">
            <i data-lucide="tag" style="width: 17px; height: 17px;"></i>
          </span>
          <div>
            <h3 style="margin: 0; font-size: 15.5px; font-weight: 700; color: #0f172a; line-height: 1.2;">พิมพ์ป้ายรหัสพัสดุ (Asset QR Label)</h3>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">รูปแบบมาตรฐานห้องปฏิบัติการเคมีและเครื่องมือวิทยาศาสตร์</div>
          </div>
        </div>
        <button type="button" class="modal-close-btn" onclick="document.getElementById('qrAssetModal').remove()" aria-label="ปิดหน้าต่าง" title="ปิดหน้าต่าง">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div style="font-size: 12px; font-weight: 600; color: #475569; display: flex; align-items: center; justify-content: space-between;">
          <span style="display: flex; align-items: center; gap: 5px;">
            <i data-lucide="eye" style="width: 14px; height: 14px; color: #6366f1;"></i>
            <span>ตัวอย่างป้ายพัสดุ (Print Preview)</span>
          </span>
          <span style="font-size: 11px; color: #64748b;">สเกลมาตรฐาน 100 × 50 mm / Sticker Label</span>
        </div>

        <div id="printableAssetTag">
          ${renderAssetLabelCard(item)}
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary modal-footer-btn" onclick="document.getElementById('qrAssetModal').remove()" style="padding: 7px 14px; border-radius: 8px; font-size: 12.5px; font-weight: 500;">
          ปิด
        </button>
        <button type="button" class="btn btn-primary modal-footer-btn modal-btn-primary" onclick="printAssetLabel()" style="display: inline-flex; align-items: center; gap: 6px; padding: 7px 18px; border-radius: 8px; font-size: 12.5px; font-weight: 600; background: #0f172a; color: #ffffff;">
          <i data-lucide="printer" style="width: 14px; height: 14px;"></i>
          <span>สั่งพิมพ์ป้ายนี้ (Print Label)</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  if (window.lucide) lucide.createIcons();
}

export function printAssetLabel() {
  const role = getCurrentRoleLevel();
  const isL2Plus = (role === 'L2' || role === 'L3' || role === 'L4');
  if (!isL2Plus) {
    if (typeof showToast === 'function') {
      showToast("การพิมพ์ป้าย Sticker Label อนุญาตเฉพาะเจ้าหน้าที่แล็บ (L2) ขึ้นไปเท่านั้น", "warning");
    } else {
      alert("การพิมพ์ป้าย Sticker Label อนุญาตเฉพาะเจ้าหน้าที่แล็บ (L2) ขึ้นไปเท่านั้น");
    }
    return;
  }

  const printContent = document.getElementById("printableAssetTag");
  if (!printContent) return;
  const win = window.open('', '', 'width=750,height=500');
  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Asset QR Label Print - SciPortal</title>
        <meta charset="utf-8">
        <style>
          @page {
            size: auto;
            margin: 10mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .asset-label-card {
            background: #ffffff !important;
            border: 1.2px solid #0f172a !important;
            border-radius: 10px !important;
            padding: 10px 14px !important;
            display: flex !important;
            align-items: stretch !important;
            gap: 12px !important;
            box-sizing: border-box !important;
            width: 480px !important;
            text-align: left !important;
            page-break-inside: avoid;
          }
          .asset-label-qr-box {
            width: 76px !important;
            height: 76px !important;
            border: 1.2px solid #0f172a !important;
            border-radius: 6px !important;
            padding: 4px !important;
            position: relative !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            flex-shrink: 0 !important;
          }
          .asset-label-qr-tag {
            position: absolute !important;
            top: 4px !important;
            left: 5px !important;
            font-size: 11px !important;
            font-weight: 800 !important;
            color: #0f172a !important;
            line-height: 1 !important;
          }
          .asset-label-qr-img {
            width: 54px !important;
            height: 54px !important;
            display: block !important;
            margin-top: 8px !important;
          }
          .asset-label-divider {
            width: 1px !important;
            background: #cbd5e1 !important;
            margin: 2px 0 !important;
            flex-shrink: 0 !important;
          }
          .asset-label-mid {
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            min-width: 130px !important;
          }
          .asset-label-cabinet {
            font-size: 16px !important;
            font-weight: 900 !important;
            color: #0f172a !important;
            line-height: 1.1 !important;
            margin: 0 0 3px 0 !important;
            text-transform: uppercase !important;
          }
          .asset-label-pill {
            display: inline-block !important;
            padding: 2px 7px !important;
            border-radius: 999px !important;
            font-size: 9px !important;
            font-weight: 800 !important;
            color: #ffffff !important;
            text-transform: uppercase !important;
            letter-spacing: 0.03em !important;
            margin-bottom: 5px !important;
            width: fit-content !important;
          }
          .asset-label-coords {
            display: flex !important;
            align-items: center !important;
            gap: 14px !important;
          }
          .asset-label-coord-item {
            display: flex !important;
            flex-direction: column !important;
          }
          .asset-label-coord-label {
            font-size: 8px !important;
            font-weight: 700 !important;
            color: #64748b !important;
            text-transform: uppercase !important;
            line-height: 1 !important;
          }
          .asset-label-coord-value {
            font-size: 15px !important;
            font-weight: 900 !important;
            color: #0f172a !important;
            line-height: 1.15 !important;
            margin-top: 2px !important;
          }
          .asset-label-right {
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            align-items: flex-end !important;
            text-align: right !important;
            flex: 1 !important;
            min-width: 135px !important;
            padding-left: 8px !important;
          }
          .asset-label-item-name {
            font-size: 13px !important;
            font-weight: 800 !important;
            color: #0f172a !important;
            line-height: 1.2 !important;
            margin: 0 !important;
          }
          .asset-label-item-sub {
            font-size: 10px !important;
            font-weight: 500 !important;
            color: #64748b !important;
            margin-top: 2px !important;
          }
          .asset-label-item-qty {
            font-size: 15px !important;
            font-weight: 900 !important;
            color: #0f172a !important;
            line-height: 1.1 !important;
            margin: 0 !important;
          }
          .asset-label-item-id {
            font-size: 9px !important;
            font-family: monospace !important;
            font-weight: 600 !important;
            color: #64748b !important;
            margin-top: 2px !important;
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 250);
          };
        </script>
      </body>
    </html>
  `);
  win.document.close();
}

// --------------------------------------------------------------------------
// 9. CHEMICAL COMPATIBILITY CHECKER (Safety Tool)
// --------------------------------------------------------------------------

export function openCompatibilityCheckerModal() {
  const existing = document.getElementById("compatibilityModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "compatibilityModal";
  modal.className = "modal-overlay active";
  modal.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px;";

  const chemicals = state.items.filter(i => i.category === 'สารเคมี');

  modal.innerHTML = `
    <div class="modal-content" style="background: #ffffff; border-radius: 16px; width: 100%; max-width: 580px; padding: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="margin: 0; font-size: 17px; font-weight: 700; color: #0f172a;"><i data-lucide="shield-check" class="inline-icon"></i> ตรวจสอบความเข้ากันได้ของสารเคมี (Safety Matrix)</h3>
        <button onclick="document.getElementById('compatibilityModal').remove()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #94a3b8;">&times;</button>
      </div>

      <p style="font-size: 13px; color: #64748b; margin-top: 0; margin-bottom: 16px;">
        เลือกกลุ่มสารเคมีหรือสาร 2 รายการเพื่อประเมินความเสี่ยงในการจัดเก็บร่วมตู้เดียวกันตามมาตรฐานความปลอดภัยห้องปฏิบัติการ
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
        <div>
          <label style="font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 4px; display: block;">สารเคมี A หรือ กลุ่ม:</label>
          <select id="compatGroupA" onchange="runLiveCompatibilityCheck()" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px;">
            <option value="Acids">Acids (กรด)</option>
            <option value="Bases">Bases (เบส)</option>
            <option value="Flammable Liquids">Flammable Liquids (สารไวไฟ)</option>
            <option value="Oxidizers">Oxidizers (สารออกซิไดซ์)</option>
            <option value="Water-Reactive">Water-Reactive (สารทำปฏิกิริยากับน้ำ)</option>
            <option value="General">General / Salts (สารทั่วไป)</option>
          </select>
        </div>
        <div>
          <label style="font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 4px; display: block;">สารเคมี B หรือ กลุ่ม:</label>
          <select id="compatGroupB" onchange="runLiveCompatibilityCheck()" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px;">
            <option value="Bases">Bases (เบส)</option>
            <option value="Acids">Acids (กรด)</option>
            <option value="Flammable Liquids">Flammable Liquids (สารไวไฟ)</option>
            <option value="Oxidizers">Oxidizers (สารออกซิไดซ์)</option>
            <option value="Water-Reactive">Water-Reactive (สารทำปฏิกิริยากับน้ำ)</option>
            <option value="General">General / Salts (สารทั่วไป)</option>
          </select>
        </div>
      </div>

      <!-- Result Container -->
      <div id="compatibilityResultContainer" style="padding: 16px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; margin-bottom: 16px;">
        <!-- Dynamic Result -->
      </div>

      <div style="text-align: right;">
        <button class="btn btn-primary" onclick="document.getElementById('compatibilityModal').remove()" style="padding: 8px 20px; background: #0f172a; color: #ffffff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">
          ปิด
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  runLiveCompatibilityCheck();
}

export async function runLiveCompatibilityCheck() {
  const gA = document.getElementById("compatGroupA")?.value;
  const gB = document.getElementById("compatGroupB")?.value;
  const container = document.getElementById("compatibilityResultContainer");
  if (!gA || !gB || !container) return;

  try {
    const res = await fetch(`${API_BASE}/inventory/compatibility?groupA=${encodeURIComponent(gA)}&groupB=${encodeURIComponent(gB)}`);
    const data = await res.json();

    const isSafe = data.compatible;
    const isExtreme = data.severity === 'extreme';

    container.style.background = isSafe ? '#f0fdf4' : (isExtreme ? '#fef2f2' : '#fffbeb');
    container.style.borderColor = isSafe ? '#bbf7d0' : (isExtreme ? '#fecaca' : '#fde68a');

    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
        <span style="font-size: 18px;">${isSafe ? '<i data-lucide="check-circle-2" style="width: 20px; height: 20px; color: #166534;"></i>' : (isExtreme ? '<i data-lucide="alert-octagon" style="width: 20px; height: 20px; color: #991b1b;"></i>' : '<i data-lucide="alert-triangle" style="width: 20px; height: 20px; color: #92400e;"></i>')}</span>
        <strong style="font-size: 14px; color: ${isSafe ? '#166534' : (isExtreme ? '#991b1b' : '#92400e')};">
          ${isSafe ? 'เข้ากันได้ (Compatible)' : 'เข้ากันไม่ได้ - เสี่ยงอันตราย (Incompatible)'}
        </strong>
      </div>
      <div style="font-size: 13px; color: #334155; margin-bottom: 6px;">${escapeHtml(data.message)}</div>
      <div style="font-size: 12px; color: #64748b;"><strong>คำแนะนำ:</strong> ${escapeHtml(data.recommendation)}</div>
    `;
  } catch(e) {}
}

// --------------------------------------------------------------------------
// 10. BATCH & CSV EXPORT
// --------------------------------------------------------------------------

export function toggleSelectAllBatch(masterCheckbox) {
  const isChecked = masterCheckbox.checked;
  const filtered = getFilteredItems();
  if (isChecked) {
    filtered.forEach(it => state.selectedBatchItems.add(it.code));
  } else {
    state.selectedBatchItems.clear();
  }
  document.querySelectorAll(".item-batch-checkbox").forEach(cb => {
    cb.checked = isChecked;
  });
}

export function toggleBatchItem(code, checkbox) {
  if (checkbox.checked) {
    state.selectedBatchItems.add(code);
  } else {
    state.selectedBatchItems.delete(code);
  }
}

export function exportAssetsAuditCSV() {
  const items = getFilteredItems();
  if (items.length === 0) {
    if (typeof window.showToast === 'function') window.showToast('ไม่มีข้อมูลพัสดุสำหรับส่งออก', 'info');
    return;
  }

  const headers = ["รหัสพัสดุ", "ชื่อพัสดุ/สารเคมี", "สูตรเคมี", "CAS", "หมวดหมู่", "ห้อง", "ตู้จัดเก็บ", "ชั้น", "จำนวน", "หน่วย", "เกณฑ์เตือน", "จุดสั่งซื้อ", "Lot Number", "วันหมดอายุ"];
  const rows = items.map(it => [
    `"${it.code || ''}"`,
    `"${(it.name || '').replace(/"/g, '""')}"`,
    `"${it.formula || ''}"`,
    `"${it.casNumber || it.cas_number || ''}"`,
    `"${it.category || ''}"`,
    `"${it.room || ''}"`,
    `"${it.cabinet || ''}"`,
    `"${it.shelf || ''}"`,
    it.qty !== undefined ? it.qty : (it.quantity || 0),
    `"${it.unit || ''}"`,
    it.minAlert || it.minStock || 5,
    it.reorderPoint || 10,
    `"${it.lotNumber || it.lot_number || ''}"`,
    `"${it.expiry || it.expiryDate || ''}"`
  ]);

  const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inventory_master_export_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// --------------------------------------------------------------------------
// 11. GLOBAL MOUNT FOR BACKWARDS COMPATIBILITY
// --------------------------------------------------------------------------

if (typeof window !== 'undefined') {
  window.fetchItems = fetchItems;
  window.saveItemsToLocal = saveItemsToLocal;
  window.fetchInventoryAlerts = fetchInventoryAlerts;
  window.renderInventoryAlertsBar = renderInventoryAlertsBar;
  window.filterByInventoryStatus = filterByInventoryStatus;
  window.selectCategoryTab = selectCategoryTab;
  window.renderItemsTable = renderItemsTable;
  window.viewItemDetails = viewItemDetails;
  window.openStockMovementsModal = openStockMovementsModal;
  window.handleRecordMovementSubmit = handleRecordMovementSubmit;
  window.openStockAdjustmentModal = openStockAdjustmentModal;
  window.handleAdjustmentSubmit = handleAdjustmentSubmit;
  window.openQRCodeModal = openQRCodeModal;
  window.printAssetLabel = printAssetLabel;
  window.openCompatibilityCheckerModal = openCompatibilityCheckerModal;
  window.runLiveCompatibilityCheck = runLiveCompatibilityCheck;
  window.toggleSelectAllBatch = toggleSelectAllBatch;
  window.toggleBatchItem = toggleBatchItem;
  window.exportAssetsAuditCSV = exportAssetsAuditCSV;
}
