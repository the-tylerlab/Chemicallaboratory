/**
 * @file borrowing.js
 * @description Borrowing & Returning Workflow, Active Loans, Overdue Tracking & QR Scan Integration
 * Module: borrowing/borrowing
 */

import { fetchWithAuth, API_BASE, syncToGoogleSheetsDirect } from '../core/api.js';
import { state } from '../core/state.js';
import { formatDate, escapeHtml, isUserOwnTransaction } from '../core/utils.js';
import { getCurrentRoleLevel } from '../rbac/rbac.js';

// Fetch transactions from backend
export async function fetchTransactions() {
  try {
    const res = await fetchWithAuth(`${API_BASE}/transactions`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        state.transactions = data;
        saveTransactionsToLocal();
        renderTransactions();
        return data;
      }
    }
  } catch (err) {
    console.warn("[Borrowing] Could not fetch transactions:", err.message);
  }

  try {
    const local = localStorage.getItem("lab_transactions");
    if (local) {
      state.transactions = JSON.parse(local);
      renderTransactions();
    }
  } catch (e) {}

  return state.transactions;
}

export function saveTransactionsToLocal() {
  try {
    localStorage.setItem("lab_transactions", JSON.stringify(state.transactions));
  } catch (e) {}
}

// Fetch overdue loans
export async function fetchOverdueLoans() {
  try {
    const res = await fetchWithAuth(`${API_BASE}/borrow/overdue`);
    if (res.ok) {
      const data = await res.json();
      return data.overdue || [];
    }
  } catch(e) {}
  return [];
}

// Quick QR Scan item lookup
export async function quickScanLookup(code) {
  try {
    const res = await fetchWithAuth(`${API_BASE}/borrow/quick-scan/${encodeURIComponent(code)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.activeLoan) {
        if (confirm(`พบรายการยืมของ ${data.item.name} โดย ${data.activeLoan.borrower}\nคุณต้องการทำรายการรับคืนทันทีหรือไม่?`)) {
          openReturnModal(data.activeLoan.id);
          return;
        }
      }
      // Populate borrow form
      const itemInput = document.getElementById("borrowItemCode");
      if (itemInput) itemInput.value = data.item.code;
      if (typeof window.showToast === 'function') {
        window.showToast(`สแกนพบ: ${data.item.name} (คงเหลือ: ${data.item.stock} ${data.item.unit})`, "success");
      }
    }
  } catch(e) {
    alert("เกิดข้อผิดพลาดในการสแกน: " + e.message);
  }
}

// Create a digital borrow request
export async function borrowItem({ itemCode, quantity, dueDate, responsiblePerson, notes }) {
  const role = getCurrentRoleLevel();
  if (role === 'L0') {
    throw new Error('กรุณาเข้าสู่ระบบก่อนทำการยืมพัสดุหรือเบิกสารเคมี');
  }

  const numQty = parseFloat(quantity || 1);
  if (isNaN(numQty) || numQty <= 0) {
    throw new Error('กรุณาระบุจำนวนที่ถูกต้อง');
  }

  try {
    const res = await fetchWithAuth(`${API_BASE}/borrow/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemCode, quantity: numQty, dueDate, responsiblePerson, notes })
    });
    if (res.ok) {
      const data = await res.json();
      state.transactions.unshift(data.transaction);
      saveTransactionsToLocal();
      renderTransactions();
      if (typeof window.renderItemsTable === 'function') window.renderItemsTable();
      return data.transaction;
    } else {
      const err = await res.json();
      throw new Error(err.error || 'เกิดข้อผิดพลาดในการยืม');
    }
  } catch (err) {
    console.warn("Direct API borrow notice:", err.message);
    throw err;
  }
}

// Open Return Modal with condition inspection
export function openReturnModal(txId) {
  const role = getCurrentRoleLevel();
  if (role === 'L0') {
    alert("ผู้ใช้ทั่วไป (L0): ไม่สามารถทำรายการคืนพัสดุได้ กรุณาเข้าสู่ระบบ");
    return;
  }

  const tx = state.transactions.find(t => t.id === txId);
  if (!tx) {
    alert("ไม่พบข้อมูลรายการยืม");
    return;
  }

  const currentUser = state.currentUser || (typeof window !== "undefined" && window.currentUser);
  if (role === 'L1') {
    if (!isUserOwnTransaction(tx, currentUser)) {
      alert("ครูผู้สอน (L1): สามารถคืนพัสดุได้เฉพาะรายการของตนเองเท่านั้น");
      return;
    }
  } else if (role === 'L2') {
    const assigned = (currentUser && Array.isArray(currentUser.assignedRooms)) ? currentUser.assignedRooms : [];
    const roomMatches = assigned.length > 0 && tx.room && assigned.some(ar => String(tx.room).toLowerCase().includes(String(ar).toLowerCase()));
    if (!roomMatches && assigned.length > 0) {
      alert(`คุณไม่มีสิทธิ์ตรวจรับคืนพัสดุของห้อง "${tx.room || 'อื่นๆ'}" (เฉพาะห้องที่ได้รับมอบหมายเท่านั้น)`);
      return;
    }
  }

  let modal = document.getElementById("returnItemModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "returnItemModal";
    modal.className = "modal";
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-overlay" onclick="window.closeReturnModal()"></div>
    <div class="modal-dialog" style="max-width: 520px;">
      <div class="modal-content" style="border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.18);">
        <div class="modal-header" style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 18px 24px;">
          <h3 style="margin: 0; font-size: 16px; font-weight: 700;">📦 ตรวจรับคืนพัสดุ / สารเคมี (Return Inspection)</h3>
          <button type="button" class="btn-close-modal" onclick="window.closeReturnModal()" aria-label="ปิดหน้าต่าง" title="ปิดหน้าต่าง"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        </div>
        <form id="formReturnItem" onsubmit="window.submitItemReturn(event)" style="padding: 20px;">
          <input type="hidden" name="txId" value="${escapeHtml(tx.id)}">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; margin-bottom: 16px;">
            <div style="font-weight: 700; color: #1e293b; font-size: 14px;">${escapeHtml(tx.itemName)}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
              รหัส: ${escapeHtml(tx.itemCode)} | จำนวน: <strong>${tx.quantity} ${escapeHtml(tx.unit || 'ชิ้น')}</strong> | ผู้ยืม: <strong>${escapeHtml(tx.borrower)}</strong>
            </div>
          </div>

          <div style="margin-bottom: 14px;">
            <label style="display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 4px;">สภาพของพัสดุขณะรับคืน <span style="color: red;">*</span></label>
            <select name="condition" id="returnConditionSelect" onchange="window.handleReturnConditionChange(this.value)" style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px;">
              <option value="สมบูรณ์">🟢 สมบูรณ์ เรียบร้อย (Good Condition)</option>
              <option value="ชำรุดเล็กน้อย">🟡 ชำรุดเล็กน้อย ยังใช้งานได้ (Minor Damage)</option>
              <option value="ชำรุดหนัก">🔴 ชำรุดหนัก ต้องส่งซ่อม (Severe Damage)</option>
              <option value="สูญหาย">🚨 สูญหาย ไม่สามารถส่งคืนได้ (Missing Item)</option>
              <option value="ใช้หมดไป">🧪 สารเคมีใช้หมดไปตามกิจกรรม (Consumed)</option>
            </select>
          </div>

          <div id="damageFineSection" style="display: none; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; margin-bottom: 14px;">
            <label style="display: block; font-size: 12px; font-weight: 600; color: #991b1b; margin-bottom: 4px;">ค่าปรับหรือค่าชดเชยความเสียหาย (บาท)</label>
            <input type="number" name="damageFine" value="0" min="0" step="any" style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #fca5a5; font-size: 13px;">
          </div>

          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 4px;">หมายเหตุการรับคืน</label>
            <textarea name="damageNotes" rows="3" placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)" style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px;"></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px;">
            <button type="button" onclick="window.closeReturnModal()" style="padding: 8px 16px; border: 1px solid #cbd5e1; background: #fff; border-radius: 8px; cursor: pointer;">ยกเลิก</button>
            <button type="submit" style="padding: 8px 18px; background: #059669; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">ยืนยันการรับคืน</button>
          </div>
        </form>
      </div>
    </div>
  `;
  modal.classList.add("active");
}

export function closeReturnModal() {
  const modal = document.getElementById("returnItemModal");
  if (modal) modal.classList.remove("active");
}

export function handleReturnConditionChange(val) {
  const sec = document.getElementById("damageFineSection");
  if (sec) {
    sec.style.display = (val === 'ชำรุดหนัก' || val === 'สูญหาย') ? 'block' : 'none';
  }
}

export async function submitItemReturn(e) {
  e.preventDefault();
  const form = e.target;
  const txId = form.txId.value;
  const condition = form.condition.value;
  const damageNotes = form.damageNotes.value;
  const damageFine = form.damageFine ? parseFloat(form.damageFine.value || 0) : 0;

  const damagedStatus = condition === 'สูญหาย' ? 'missing' :
                        condition === 'ชำรุดหนัก' ? 'severe_damage' :
                        condition === 'ชำรุดเล็กน้อย' ? 'minor_damage' : 'none';

  try {
    const res = await fetchWithAuth(`${API_BASE}/borrow/${encodeURIComponent(txId)}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ condition, damagedStatus, damageFine, damageNotes })
    });
    if (res.ok) {
      if (typeof window.showToast === 'function') {
        window.showToast("บันทึกรับคืนพัสดุและปรับยอดสต็อกเรียบร้อยแล้ว", "success");
      } else {
        alert("บันทึกรับคืนพัสดุเรียบร้อยแล้ว");
      }
      closeReturnModal();
      await fetchTransactions();
      if (typeof window.renderItemsTable === 'function') window.renderItemsTable();
    } else {
      const err = await res.json();
      alert(`เกิดข้อผิดพลาด: ${err.error}`);
    }
  } catch(err) {
    alert("ไม่สามารถบันทึกรับคืนได้: " + err.message);
  }
}

// Render Transactions UI
export function renderTransactions() {
  const container = document.getElementById("transactionsTableBody");
  if (!container) return;

  let txs = state.transactions || [];
  const role = getCurrentRoleLevel();
  const currentUser = state.currentUser || (typeof window !== "undefined" && window.currentUser);

  // L1 (Teacher): Can only see their own transactions
  if (role === 'L1' && currentUser) {
    txs = txs.filter(t => isUserOwnTransaction(t, currentUser));
  }

  if (txs.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: #94a3b8;">
          ${role === 'L1' ? 'ยังไม่มีประวัติการทำรายการยืม-คืนของคุณ' : 'ยังไม่มีประวัติการยืม-คืนพัสดุหรือเบิกสารเคมี'}
        </td>
      </tr>
    `;
    return;
  }

  const isL3L4 = (role === 'L3' || role === 'L4');
  const now = new Date();

  container.innerHTML = txs.map(t => {
    const isReturned = (t.status === 'returned');
    const due = t.dueDate || t.expectedReturnDate;
    const isOverdue = !isReturned && due && (new Date(due) < now);

    // Permission check for return action:
    // L0: Cannot return (overview only)
    // L1: Can return own borrowed items
    // L2: Can return if item room matches assigned rooms
    // L3 & L4: Can return all
    let canManageReturns = false;
    if (role === 'L3' || role === 'L4') {
      canManageReturns = true;
    } else if (role === 'L2') {
      const assigned = (currentUser && Array.isArray(currentUser.assignedRooms)) ? currentUser.assignedRooms : [];
      canManageReturns = assigned.length > 0 && (!t.room || assigned.some(ar => String(t.room).toLowerCase().includes(String(ar).toLowerCase())));
    } else if (role === 'L1') {
      canManageReturns = isUserOwnTransaction(t, currentUser);
    }

    let statusBadge = `<span class="status-badge status-warning">🟡 กำลังยืม</span>`;
    if (isReturned) {
      statusBadge = `<span class="status-badge status-good">🟢 คืนแล้ว</span>`;
    } else if (isOverdue) {
      const days = Math.max(1, Math.floor((now.getTime() - new Date(due).getTime()) / 86400000));
      statusBadge = `<span class="status-badge status-danger">🔴 เกินกำหนด (${days} วัน)</span>`;
    }

    return `
      <tr>
        <td style="font-family: monospace; font-size: 12px; color: #6366f1; font-weight: 700;">${isL3L4 ? escapeHtml(t.id) : '-'}</td>
        <td style="font-weight: 600; color: #1e293b;">
          ${escapeHtml(t.itemName)}
          <span style="display: block; font-size: 11px; color: #64748b; font-family: monospace;">${escapeHtml(t.itemCode)}</span>
        </td>
        <td style="font-weight: 600;">${t.quantity} ${escapeHtml(t.unit || 'ชิ้น')}</td>
        <td>
          <div style="font-weight: 600; color: #334155;">${escapeHtml(t.borrower)}</div>
          <span style="font-size: 11px; color: #64748b;">${escapeHtml(t.teacherId || '-')}</span>
        </td>
        <td>
          <span style="font-size: 12px; color: #475569;">${formatDate(t.borrowDate)}</span>
          ${due ? `<span style="display: block; font-size: 11px; color: ${isOverdue ? '#dc2626' : '#64748b'}; font-weight: ${isOverdue ? '700' : 'normal'};">ครบกำหนด: ${formatDate(due)}</span>` : ''}
        </td>
        <td>${statusBadge}</td>
        <td>
          ${!isReturned && canManageReturns ? `
            <button class="btn btn-sm" onclick="window.openReturnModal('${escapeHtml(t.id)}')" style="padding: 5px 12px; background: #059669; color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">
              คืนพัสดุ
            </button>
          ` : (isReturned ? `<span style="font-size: 11px; color: #64748b;">${formatDate(t.returnDate)}</span>` : '-')}
        </td>
      </tr>
    `;
  }).join('');
}

// Mount to window for global backwards compatibility
if (typeof window !== 'undefined') {
  window.fetchTransactions = fetchTransactions;
  window.borrowItem = borrowItem;
  window.renderTransactions = renderTransactions;
  window.openReturnModal = openReturnModal;
  window.closeReturnModal = closeReturnModal;
  window.handleReturnConditionChange = handleReturnConditionChange;
  window.submitItemReturn = submitItemReturn;
  window.quickScanLookup = quickScanLookup;
}
