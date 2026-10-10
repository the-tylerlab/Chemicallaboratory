/**
 * @file procurement.js
 * @description Purchase Orders (PO), Requisitions, Approval Chain, Receiving & Auto-Restock
 * Module: procurement/procurement
 */

import { fetchWithAuth, API_BASE, syncToGoogleSheetsDirect } from '../core/api.js';
import { state } from '../core/state.js';
import { formatDate, formatCurrency, escapeHtml } from '../core/utils.js';
import { getCurrentRoleLevel } from '../rbac/rbac.js';
import { renderBudgetOverview } from '../budget/budget.js';

// Fetch Purchase Orders
export async function fetchPurchaseOrders() {
  try {
    const res = await fetchWithAuth(`${API_BASE}/purchase-orders`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        state.purchaseOrders = data;
        savePurchaseOrdersToLocal();
        renderPurchaseOrders();
        return data;
      }
    }
  } catch (err) {
    console.warn("[Procurement] Could not fetch purchase orders:", err.message);
  }

  try {
    const local = localStorage.getItem("lab_purchase_orders");
    if (local) {
      state.purchaseOrders = JSON.parse(local);
      renderPurchaseOrders();
    }
  } catch (e) {}

  return state.purchaseOrders;
}

export function savePurchaseOrdersToLocal() {
  try {
    localStorage.setItem("lab_purchase_orders", JSON.stringify(state.purchaseOrders));
  } catch (e) {}
}

// Create new Purchase Order request (PR)
export async function createPurchaseOrder(poData) {
  const role = getCurrentRoleLevel();
  if (role === 'L0') {
    throw new Error('กรุณาเข้าสู่ระบบก่อนทำการขอจัดซื้อพัสดุ');
  }

  try {
    const res = await fetchWithAuth(`${API_BASE}/procurement/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(poData)
    });
    if (res.ok) {
      const data = await res.json();
      state.purchaseOrders.unshift(data.order);
      savePurchaseOrdersToLocal();
      renderPurchaseOrders();
      renderBudgetOverview();
      return data.order;
    } else {
      const err = await res.json();
      throw new Error(err.error || 'ไม่สามารถยื่นคำขอจัดซื้อได้');
    }
  } catch (err) {
    console.warn("[Procurement] Direct API notice:", err.message);
    throw err;
  }
}

// Update PO status / Review approval chain
export async function updatePOStatus(poId, status, comments = '') {
  const role = getCurrentRoleLevel();
  if (role !== 'L3' && role !== 'L4') {
    throw new Error('เฉพาะผู้บริหารหรือผู้ดูแลระบบเท่านั้นที่สามารถอนุมัติคำขอจัดซื้อได้');
  }

  try {
    const res = await fetchWithAuth(`${API_BASE}/procurement/orders/${encodeURIComponent(poId)}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: status, comments })
    });
    if (res.ok) {
      const data = await res.json();
      const idx = state.purchaseOrders.findIndex(p => p.id === poId);
      if (idx !== -1) {
        state.purchaseOrders[idx] = data.order;
        savePurchaseOrdersToLocal();
        renderPurchaseOrders();
        renderBudgetOverview();
      }
      return data.order;
    }
  } catch(e) {
    alert("ไม่สามารถพิจารณาคำขอได้: " + e.message);
  }
}

// Open Receiving Modal (Full / Partial)
export function openReceivingModal(poId) {
  const po = state.purchaseOrders.find(p => p.id === poId);
  if (!po) {
    alert("ไม่พบคำขอจัดซื้อ");
    return;
  }

  let modal = document.getElementById("procurementReceivingModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "procurementReceivingModal";
    modal.className = "modal";
    document.body.appendChild(modal);
  }

  const items = po.items || [];

  modal.innerHTML = `
    <div class="modal-overlay" onclick="window.closeReceivingModal()"></div>
    <div class="modal-dialog" style="max-width: 600px;">
      <div class="modal-content" style="border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.18);">
        <div class="modal-header" style="background: linear-gradient(135deg, #4338ca 0%, #312e81 100%); color: white; padding: 18px 24px;">
          <h3 style="margin: 0; font-size: 16px; font-weight: 700;"><i data-lucide="package-plus" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 6px;"></i>ตรวจรับพัสดุเข้าคลัง (Goods Receiving & Stock In)</h3>
          <button type="button" class="btn-close-modal" onclick="window.closeReceivingModal()" aria-label="ปิดหน้าต่าง" title="ปิดหน้าต่าง"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        </div>
        <form id="formReceiveGoods" onsubmit="window.submitReceiveGoods(event)" style="padding: 20px;">
          <input type="hidden" name="poId" value="${escapeHtml(po.id)}">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; margin-bottom: 16px;">
            <div style="font-weight: 700; color: #1e293b; font-size: 14px;">${escapeHtml(po.title)}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
              เลขที่ใบสั่งซื้อ: <strong>${escapeHtml(po.id)}</strong> | ผู้จัดจำหน่าย: <strong>${escapeHtml(po.supplierName || '-')}</strong>
            </div>
          </div>

          <div style="margin-bottom: 14px;">
            <label style="display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 4px;">เลขที่ใบแจ้งหนี้ / ใบเสร็จรับเงิน (Invoice Ref)</label>
            <input type="text" name="invoiceRef" placeholder="เช่น INV-2026-0887" required style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px;">
          </div>

          <label style="display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 8px;">รายการพัสดุและจำนวนที่รับจริง</label>
          <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 16px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead style="background: #f1f5f9; color: #475569;">
                <tr>
                  <th style="padding: 8px; text-align: left;">รหัส / รายการ</th>
                  <th style="padding: 8px; text-align: center; width: 80px;">สั่งซื้อ</th>
                  <th style="padding: 8px; text-align: center; width: 100px;">รับจริง</th>
                </tr>
              </thead>
              <tbody>
                ${items.length === 0 ? `
                  <tr><td colspan="3" style="text-align: center; padding: 12px; color: #94a3b8;">ไม่มีรายการแยกย่อย (รับเหมาจ่าย)</td></tr>
                ` : items.map((it, idx) => `
                  <tr style="border-top: 1px solid #f1f5f9;">
                    <td style="padding: 8px;">
                      <strong>${escapeHtml(it.name || it.code)}</strong>
                      <input type="hidden" name="itemCode_${idx}" value="${escapeHtml(it.code || '')}">
                    </td>
                    <td style="padding: 8px; text-align: center;">${it.qty || 1}</td>
                    <td style="padding: 8px; text-align: center;">
                      <input type="number" name="receivedQty_${idx}" value="${it.qty || 1}" min="0" style="width: 70px; padding: 4px 6px; text-align: center; border-radius: 6px; border: 1px solid #cbd5e1;">
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-size: 13px; color: #1e293b; cursor: pointer;">
            <input type="checkbox" name="isFullReceiving" checked style="width: 16px; height: 16px;">
            <span>เป็นการตรวจรับครบถ้วนสมบูรณ์ (Full Receiving)</span>
          </label>

          <div style="display: flex; justify-content: flex-end; gap: 8px;">
            <button type="button" onclick="window.closeReceivingModal()" style="padding: 8px 16px; border: 1px solid #cbd5e1; background: #fff; border-radius: 8px; cursor: pointer;">ยกเลิก</button>
            <button type="submit" style="padding: 8px 18px; background: #4338ca; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">ยืนยันรับเข้าคลัง</button>
          </div>
        </form>
      </div>
    </div>
  `;
  modal.classList.add("active");
}

export function closeReceivingModal() {
  const modal = document.getElementById("procurementReceivingModal");
  if (modal) modal.classList.remove("active");
}

export async function submitReceiveGoods(e) {
  e.preventDefault();
  const form = e.target;
  const poId = form.poId.value;
  const invoiceRef = form.invoiceRef.value;
  const isFullReceiving = form.isFullReceiving.checked;

  const po = state.purchaseOrders.find(p => p.id === poId);
  const items = po ? (po.items || []) : [];
  const receivedItems = items.map((it, idx) => {
    const input = form[`receivedQty_${idx}`];
    return {
      code: it.code,
      receivedQty: input ? parseFloat(input.value || 0) : (it.qty || 1)
    };
  });

  try {
    const res = await fetchWithAuth(`${API_BASE}/procurement/orders/${encodeURIComponent(poId)}/receive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceRef, isFullReceiving, receivedItems })
    });
    if (res.ok) {
      if (typeof window.showToast === 'function') {
        window.showToast("ตรวจรับพัสดุเรียบร้อย ยอดคงคลังได้รับการเพิ่มโดยอัตโนมัติ", "success");
      } else {
        alert("ตรวจรับพัสดุเรียบร้อย ยอดคงคลังได้รับการเพิ่มโดยอัตโนมัติ");
      }
      closeReceivingModal();
      await fetchPurchaseOrders();
      if (typeof window.renderItemsTable === 'function') window.renderItemsTable();
      renderBudgetOverview();
    } else {
      const err = await res.json();
      alert(`เกิดข้อผิดพลาด: ${err.error}`);
    }
  } catch(err) {
    alert("ไม่สามารถบันทึกตรวจรับได้: " + err.message);
  }
}

// Render Purchase Orders List
export function renderPurchaseOrders() {
  const container = document.getElementById("purchaseOrdersList");
  if (!container) return;

  const orders = state.purchaseOrders || [];
  if (orders.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #94a3b8; background: #fff; border-radius: 12px; border: 1px dashed #cbd5e1;">
        <p style="margin: 0; font-size: 14px; font-weight: 600;">ยังไม่มีรายการขอจัดซื้อพัสดุ</p>
      </div>
    `;
    return;
  }

  const role = getCurrentRoleLevel();
  const canApprove = (role === 'L3' || role === 'L4');
  const canReceive = (role === 'L2' || role === 'L3' || role === 'L4');

  container.innerHTML = orders.map(po => {
    let statusBadge = `<span class="status-badge status-warning"><i data-lucide="clock" class="badge-icon"></i> รอการอนุมัติ</span>`;
    if (po.status === 'approved') statusBadge = `<span class="status-badge status-good"><i data-lucide="check-circle-2" class="badge-icon"></i> อนุมัติแล้ว</span>`;
    if (po.status === 'ordered') statusBadge = `<span class="status-badge status-info"><i data-lucide="shopping-cart" class="badge-icon"></i> สั่งซื้อแล้ว</span>`;
    if (po.status === 'received') statusBadge = `<span class="status-badge status-good"><i data-lucide="package-check" class="badge-icon"></i> ตรวจรับเข้าคลังแล้ว</span>`;
    if (po.status === 'rejected') statusBadge = `<span class="status-badge status-danger"><i data-lucide="x-circle" class="badge-icon"></i> ไม่อนุมัติ</span>`;

    return `
      <div class="po-card" style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
          <div>
            <span style="font-family: monospace; font-size: 12px; color: #4338ca; font-weight: 700;">${escapeHtml(po.id)}</span>
            <h4 style="margin: 4px 0; font-size: 16px; font-weight: 700; color: #1e293b;">${escapeHtml(po.title)}</h4>
            <div style="font-size: 12px; color: #64748b;">ผู้จัดจำหน่าย: <strong>${escapeHtml(po.supplierName || 'N/A')}</strong></div>
          </div>
          <div>${statusBadge}</div>
        </div>

        <div style="font-size: 13px; color: #475569; margin-bottom: 12px; background: #f8fafc; padding: 10px 14px; border-radius: 8px;">
          <strong>ผู้ขอจัดซื้อ:</strong> ${escapeHtml(po.requester)} | <strong>ยอดรวม:</strong> <span style="font-weight: 700; color: #047857;">${formatCurrency(po.estimatedCost || po.totalPrice)} บาท</span>
          <br><span style="font-size: 11.5px; color: #64748b;">วันที่ขอ: ${formatDate(po.createdAt)} | เหตุผล: ${escapeHtml(po.reason || '-')}</span>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          ${canApprove && po.status === 'pending' ? `
            <button class="btn btn-sm btn-primary" onclick="window.updatePOStatus('${escapeHtml(po.id)}', 'approved')" style="padding: 6px 14px; background: #10b981; border: none; color: white; border-radius: 6px; font-weight: 600; cursor: pointer;">
              <i data-lucide="check" class="inline-icon"></i> อนุมัติคำขอจัดซื้อ
            </button>
            <button class="btn btn-sm" onclick="window.updatePOStatus('${escapeHtml(po.id)}', 'rejected')" style="padding: 6px 14px; background: #fee2e2; border: 1px solid #fca5a5; color: #b91c1c; border-radius: 6px; font-weight: 600; cursor: pointer;">
              <i data-lucide="x" class="inline-icon"></i> ไม่อนุมัติ
            </button>
          ` : ''}

          ${canReceive && (po.status === 'approved' || po.status === 'ordered') ? `
            <button class="btn btn-sm" onclick="window.openReceivingModal('${escapeHtml(po.id)}')" style="padding: 6px 14px; background: #4338ca; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
              <i data-lucide="package-plus" class="inline-icon"></i> ตรวจรับพัสดุเข้าคลัง
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Mount to window for global backwards compatibility
if (typeof window !== 'undefined') {
  window.fetchPurchaseOrders = fetchPurchaseOrders;
  window.createPurchaseOrder = createPurchaseOrder;
  window.updatePOStatus = updatePOStatus;
  window.renderPurchaseOrders = renderPurchaseOrders;
  window.openReceivingModal = openReceivingModal;
  window.closeReceivingModal = closeReceivingModal;
  window.submitReceiveGoods = submitReceiveGoods;
}
