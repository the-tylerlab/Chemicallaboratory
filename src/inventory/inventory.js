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
          <button class="action-btn" title="พิมพ์ป้าย QR Code / Barcode" onclick="openQRCodeModal('${escapeHtml(item.code)}')">
            <i data-lucide="qr-code" style="width: 14px; height: 14px;"></i>
          </button>
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
  const item = state.items.find(i => (i.code || '').toLowerCase() === code.toLowerCase());
  if (!item) {
    if (typeof window.showToast === 'function') window.showToast('ไม่พบข้อมูลพัสดุ', 'error');
    return;
  }

  // Remove existing modal if present
  const existing = document.getElementById("masterDetailModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "masterDetailModal";
  modal.className = "modal-overlay active";
  modal.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px;";

  const q = parseFloat(item.qty !== undefined ? item.qty : (item.quantity || 0));
  const minStock = parseFloat(item.minAlert !== undefined ? item.minAlert : (item.minStock || 5));
  const reorderPt = parseFloat(item.reorderPoint !== undefined ? item.reorderPoint : (minStock * 2));
  const safetyStock = parseFloat(item.safetyStock !== undefined ? item.safetyStock : minStock);

  const sdsSearchUrl = item.sdsUrl || item.sds_url || `https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(item.casNumber || item.name)}`;

  modal.innerHTML = `
    <div class="modal-content" style="background: #ffffff; border-radius: 16px; width: 100%; max-width: 720px; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid #e2e8f0;">
      <!-- Modal Header -->
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-family: monospace; background: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 13px;">${escapeHtml(item.code)}</span>
            <span class="category-badge">${escapeHtml(item.category || '-')}</span>
          </div>
          <h2 style="margin: 8px 0 2px 0; font-size: 18px; color: #0f172a; font-weight: 700;">${escapeHtml(item.name)}</h2>
          ${item.formula ? `<div style="font-family: monospace; font-size: 14px; color: #64748b;">สูตรเคมี: ${escapeHtml(item.formula)}</div>` : ''}
        </div>
        <button onclick="document.getElementById('masterDetailModal').remove()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #94a3b8; padding: 4px;">&times;</button>
      </div>

      <!-- Modal Body -->
      <div style="padding: 24px;">
        <!-- Grid Sections -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <!-- Left Column: Master & Stock -->
          <div style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
            <h4 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">📦 สต็อกและการจัดซื้อ</h4>
            <div style="font-size: 13px; line-height: 1.8;">
              <div><strong>คงเหลือปัจจุบัน:</strong> <span style="font-size: 16px; font-weight: 700; color: #0284c7;">${q} ${escapeHtml(item.unit || 'ชิ้น')}</span></div>
              <div><strong>เกณฑ์เตือนขั้นต่ำ (Min Stock):</strong> ${minStock} ${escapeHtml(item.unit || 'ชิ้น')}</div>
              <div><strong>จุดสั่งซื้อใหม่ (Reorder Point):</strong> ${reorderPt} ${escapeHtml(item.unit || 'ชิ้น')}</div>
              <div><strong>สต็อกเพื่อความปลอดภัย (Safety Stock):</strong> ${safetyStock} ${escapeHtml(item.unit || 'ชิ้น')}</div>
              <div><strong>Lot / Batch Number:</strong> ${escapeHtml(item.lotNumber || item.lot_number || '-')}</div>
              <div><strong>วันที่รับเข้า:</strong> ${formatDate(item.receivedDate || item.received_date || item.createdAt)}</div>
              <div><strong>วันหมดอายุ:</strong> ${formatDate(item.expiry || item.expiryDate || item.expiry_date)}</div>
              <div><strong>ผู้จัดจำหน่าย (Supplier):</strong> ${escapeHtml(item.supplier || '-')}</div>
            </div>
          </div>

          <!-- Right Column: Location & Safety -->
          <div style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
            <h4 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">📍 ตำแหน่งและความปลอดภัย</h4>
            <div style="font-size: 13px; line-height: 1.8;">
              <div><strong>ห้องปฏิบัติการ:</strong> ${escapeHtml(item.room || '-')}</div>
              <div><strong>ตู้จัดเก็บ:</strong> ${escapeHtml(item.cabinet || '-')}</div>
              <div><strong>ชั้นวาง / ตำแหน่ง:</strong> ${escapeHtml(item.shelf || '-')} ${item.position ? `(ช่อง ${escapeHtml(item.position)})` : ''}</div>
              <div><strong>CAS Number:</strong> ${escapeHtml(item.casNumber || item.cas_number || '-')}</div>
              <div><strong>กลุ่มจัดเก็บทางเคมี:</strong> <span style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${escapeHtml(item.storageGroup || item.chemicalType || 'General')}</span></div>
              <div><strong>ระดับเตือนอันตราย:</strong> ${escapeHtml(item.signalWord || 'Warning')}</div>
            </div>

            <!-- SDS Link Button -->
            <div style="margin-top: 14px;">
              <a href="${escapeHtml(sdsSearchUrl)}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; background: #0284c7; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 12px; font-weight: 600;">
                <i data-lucide="file-text" style="width: 14px; height: 14px;"></i> ดูเอกสารความปลอดภัย (SDS Link)
              </a>
            </div>
          </div>
        </div>

        <!-- Quick Action Toolbar -->
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary" onclick="document.getElementById('masterDetailModal').remove(); openStockMovementsModal('${escapeHtml(item.code)}');" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; cursor: pointer; font-size: 13px;">
              <i data-lucide="history" style="width: 14px; height: 14px;"></i> บันทึกการเบิก/ใช้ (Movement)
            </button>
            <button class="btn btn-secondary" onclick="document.getElementById('masterDetailModal').remove(); openQRCodeModal('${escapeHtml(item.code)}');" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; cursor: pointer; font-size: 13px;">
              <i data-lucide="qr-code" style="width: 14px; height: 14px;"></i> ป้าย QR Code
            </button>
          </div>
          <button class="btn btn-primary" onclick="document.getElementById('masterDetailModal').remove()" style="padding: 8px 20px; background: #0f172a; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 13px;">
            ปิด
          </button>
        </div>
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
          <h3 style="margin: 0; font-size: 17px; font-weight: 700; color: #0f172a;">📦 ประวัติการเคลื่อนไหวสต็อก (Stock Movement History)</h3>
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
        <h3 style="margin: 0; font-size: 17px; font-weight: 700; color: #0f172a;">⚖️ ขอปรับปรุงยอดคงคลัง (Stock Adjustment)</h3>
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

export async function openQRCodeModal(code) {
  const item = state.items.find(i => (i.code || '').toLowerCase() === code.toLowerCase());
  if (!item) return;

  const existing = document.getElementById("qrAssetModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "qrAssetModal";
  modal.className = "modal-overlay active";
  modal.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px;";

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(JSON.stringify({
    system: "SCIPORTAL-LAB",
    code: item.code,
    name: item.name,
    room: item.room,
    cabinet: item.cabinet
  }))}`;

  modal.innerHTML = `
    <div class="modal-content" style="background: #ffffff; border-radius: 16px; width: 100%; max-width: 440px; padding: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); text-align: center;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #0f172a;">🏷️ ป้ายรหัสประจำสารเคมี / ครุภัณฑ์</h3>
        <button onclick="document.getElementById('qrAssetModal').remove()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #94a3b8;">&times;</button>
      </div>

      <!-- Printable Card -->
      <div id="printableAssetTag" style="border: 2px dashed #cbd5e1; border-radius: 12px; padding: 16px; background: #ffffff; text-align: center; margin-bottom: 16px;">
        <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">ห้องปฏิบัติการวิทยาศาสตร์ - SCIPORTAL</div>
        <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 2px;">${escapeHtml(item.name)}</div>
        ${item.formula ? `<div style="font-family: monospace; font-size: 13px; color: #0284c7; font-weight: 600; margin-bottom: 8px;">${escapeHtml(item.formula)}</div>` : ''}
        
        <div style="display: flex; justify-content: center; margin: 12px 0;">
          <img src="${qrImageUrl}" alt="Asset QR Code" style="width: 140px; height: 140px; border-radius: 8px; border: 1px solid #e2e8f0;">
        </div>

        <div style="font-family: monospace; font-size: 14px; font-weight: 700; color: #334155; margin-bottom: 4px;">${escapeHtml(item.code)}</div>
        <div style="font-size: 11px; color: #64748b;">
          พิกัด: ${escapeHtml(item.room || '-')} | ${escapeHtml(item.cabinet || '-')} | ${escapeHtml(item.shelf || '-')}
        </div>
        ${item.expiry || item.expiryDate ? `<div style="font-size: 11px; color: #e11d48; font-weight: 600; margin-top: 2px;">EXP: ${formatDate(item.expiry || item.expiryDate)}</div>` : ''}
      </div>

      <!-- Actions -->
      <div style="display: flex; justify-content: center; gap: 8px;">
        <button class="btn btn-secondary" onclick="printAssetLabel()" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; cursor: pointer; font-size: 13px;">
          <i data-lucide="printer" style="width: 14px; height: 14px;"></i> สั่งพิมพ์ป้าย (Print Label)
        </button>
        <button class="btn btn-primary" onclick="document.getElementById('qrAssetModal').remove()" style="padding: 8px 16px; background: #0f172a; color: #ffffff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">
          ปิด
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  if (window.lucide) lucide.createIcons();
}

export function printAssetLabel() {
  const printContent = document.getElementById("printableAssetTag");
  if (!printContent) return;
  const win = window.open('', '', 'width=600,height=600');
  win.document.write(`
    <html>
      <head>
        <title>Print Asset Label</title>
        <style>
          body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .tag { border: 2px solid #000; padding: 20px; border-radius: 8px; text-align: center; max-width: 320px; }
        </style>
      </head>
      <body>
        <div class="tag">${printContent.innerHTML}</div>
        <script>
          window.onload = function() { window.print(); window.close(); }
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
        <h3 style="margin: 0; font-size: 17px; font-weight: 700; color: #0f172a;">🛡️ ตรวจสอบความเข้ากันได้ของสารเคมี (Safety Matrix)</h3>
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
        <span style="font-size: 18px;">${isSafe ? '✅' : (isExtreme ? '🚨' : '⚠️')}</span>
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
