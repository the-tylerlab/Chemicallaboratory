/**
 * @file equipment.js
 * @description Scientific Instruments, Equipment Master, Calibration, Maintenance Schedule, Repair Workflow & QR Tracking
 * Module: equipment/equipment
 */

import { fetchWithAuth, API_BASE } from '../core/api.js';
import { state } from '../core/state.js';
import { formatDate, escapeHtml } from '../core/utils.js';
import { getCurrentRoleLevel } from '../rbac/rbac.js';

let html5QrCodeScanner = null;

// Auto-generate code for new equipment or chemical
export function autoGenerateCurrentCode(category = 'อุปกรณ์วิทยาศาสตร์') {
  const prefix = category === 'สารเคมี' ? 'CHEM' :
                 category === 'เครื่องแก้ว' ? 'GLAS' :
                 category === 'วัสดุสิ้นเปลือง' ? 'CONS' : 'EQPT';
  const rand = Math.floor(1000 + Math.random() * 9000);
  const code = `${prefix}-${new Date().getFullYear().toString().slice(-2)}${rand}`;

  const input = document.getElementById("itemCode");
  if (input) input.value = code;
  return code;
}

// Fetch all Equipment Assets from Backend
export async function fetchEquipmentAssets() {
  try {
    const res = await fetch(`${API_BASE}/equipment/assets`);
    if (res.ok) {
      const result = await res.json();
      state.equipmentAssets = result.data || [];
      return state.equipmentAssets;
    }
  } catch (err) {
    console.warn("[Equipment] Failed to fetch assets:", err.message);
  }
  return state.equipmentAssets || [];
}

// Fetch Maintenance Logs
export async function fetchEquipmentMaintenance() {
  try {
    const res = await fetch(`${API_BASE}/equipment/maintenance`);
    if (res.ok) {
      const result = await res.json();
      state.equipmentMaintenance = result.data || [];
      return state.equipmentMaintenance;
    }
  } catch (err) {
    console.warn("[Equipment] Failed to fetch maintenance logs:", err.message);
  }
  return [];
}

// Fetch Repair Requests
export async function fetchEquipmentRepairs() {
  try {
    const res = await fetch(`${API_BASE}/equipment/repairs`);
    if (res.ok) {
      const result = await res.json();
      state.equipmentRepairs = result.data || [];
      return state.equipmentRepairs;
    }
  } catch (err) {
    console.warn("[Equipment] Failed to fetch repairs:", err.message);
  }
  return [];
}

// Open Equipment Detail Modal
export async function openEquipmentModal(code) {
  const assets = state.equipmentAssets || [];
  let asset = assets.find(a => (a.code || '').toLowerCase() === (code || '').toLowerCase());
  if (!asset) {
    const item = (state.items || []).find(i => (i.code || '').toLowerCase() === (code || '').toLowerCase());
    if (item) {
      asset = {
        code: item.code,
        name: item.name,
        category: item.category,
        assetId: item.assetId || `คร.67-${item.code}`,
        serialNumber: item.serialNumber || 'SN-UNKNOWN',
        location: { room: item.room || 'Lab 1', cabinet: item.cabinet || '-', shelf: item.shelf || '-' },
        condition: item.condition || 'good',
        quantity: item.qty || 1,
        unit: item.unit || 'เครื่อง',
        warrantyExpiry: item.warrantyExpiry || '2027-01-01',
        nextMaintenanceDate: item.nextMaintenanceDate || '2026-07-01',
        nextCalibrationDate: item.nextCalibrationDate || '2026-12-01',
        calibrationCertificate: `CERT-${item.code}`
      };
    }
  }

  if (!asset) {
    alert("ไม่พบข้อมูลอุปกรณ์");
    return;
  }

  // Fetch history
  let historyLogs = [];
  try {
    const hRes = await fetch(`${API_BASE}/equipment/history/${encodeURIComponent(asset.code)}`);
    if (hRes.ok) {
      const hData = await hRes.json();
      historyLogs = hData.data || [];
    }
  } catch(e) {}

  let modal = document.getElementById("equipmentDetailModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "equipmentDetailModal";
    modal.className = "modal";
    document.body.appendChild(modal);
  }

  const conditionBadge = asset.condition === 'good' ? '<span class="status-badge status-good"><i data-lucide="check-circle-2" class="badge-icon"></i> พร้อมใช้งาน (Good)</span>' :
                         asset.condition === 'under_repair' ? '<span class="status-badge status-warning"><i data-lucide="wrench" class="badge-icon"></i> อยู่ระหว่างส่งซ่อม (Under Repair)</span>' :
                         asset.condition === 'damaged' ? '<span class="status-badge status-danger"><i data-lucide="alert-triangle" class="badge-icon"></i> ชำรุด (Damaged)</span>' :
                         '<span class="status-badge status-secondary"><i data-lucide="archive" class="badge-icon"></i> ปลดระวาง (Decommissioned)</span>';

  modal.innerHTML = `
    <div class="modal-overlay" onclick="window.closeEquipmentModal()"></div>
    <div class="modal-dialog modal-lg" style="max-width: 780px;">
      <div class="modal-content" style="border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.18);">
        <div class="modal-header" style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); color: #fff; padding: 20px 24px;">
          <div>
            <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; opacity: 0.8;">Equipment Master Card</span>
            <h3 style="margin: 4px 0 0 0; font-size: 18px; font-weight: 700; color: #fff;">${escapeHtml(asset.name)}</h3>
            <span style="font-family: monospace; font-size: 12px; color: #a5b4fc;">Code: ${escapeHtml(asset.code)} | Asset ID: ${escapeHtml(asset.assetId)}</span>
          </div>
          <button type="button" class="btn-close-modal" onclick="window.closeEquipmentModal()" aria-label="ปิดหน้าต่าง" title="ปิดหน้าต่าง"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        </div>

        <div class="modal-body" style="padding: 24px; max-height: 75vh; overflow-y: auto;">
          <!-- Key Metrics Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 20px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
              <span style="font-size: 11px; color: #64748b;">สถานะเครื่องมือ</span>
              <div style="margin-top: 4px;">${conditionBadge}</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
              <span style="font-size: 11px; color: #64748b;">Serial Number</span>
              <div style="font-family: monospace; font-weight: 600; color: #334155; margin-top: 4px;">${escapeHtml(asset.serialNumber)}</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
              <span style="font-size: 11px; color: #64748b;">ตำแหน่งจัดเก็บ</span>
              <div style="font-weight: 600; color: #334155; margin-top: 4px;">${escapeHtml(asset.location.room)} / ${escapeHtml(asset.location.cabinet)}</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
              <span style="font-size: 11px; color: #64748b;">วันหมดอายุประกัน (Warranty)</span>
              <div style="font-weight: 600; color: #059669; margin-top: 4px;"><i data-lucide="calendar" class="inline-icon"></i> ${formatDate(asset.warrantyExpiry)}</div>
            </div>
          </div>

          <!-- Calibration & Maintenance Tracking -->
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #1e3a8a; display: flex; align-items: center; gap: 6px;">
              <span><i data-lucide="wrench" class="inline-icon"></i> การสอบเทียบและการบำรุงรักษา (Calibration & Service)</span>
            </h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px; color: #1e40af;">
              <div>รอบบำรุงรักษาถัดไป: <strong>${formatDate(asset.nextMaintenanceDate)}</strong></div>
              <div>รอบสอบเทียบถัดไป: <strong>${formatDate(asset.nextCalibrationDate)}</strong></div>
              <div>ใบรับรองการสอบเทียบ: <span style="font-family: monospace; background: #fff; padding: 2px 6px; border-radius: 4px;">${escapeHtml(asset.calibrationCertificate || '-')}</span></div>
              <div>ผู้จัดจำหน่าย/ช่าง: <span>${escapeHtml(asset.supplier || '-')}</span></div>
            </div>
          </div>

          <!-- Borrow / Usage History -->
          <h4 style="margin: 20px 0 8px 0; font-size: 14px; font-weight: 700; color: #1e293b;">ประวัติการยืม-คืนและการใช้งาน (${historyLogs.length})</h4>
          <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; max-height: 180px; overflow-y: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead style="background: #f1f5f9; color: #475569; position: sticky; top: 0;">
                <tr>
                  <th style="padding: 8px; text-align: left;">วันที่ยืม</th>
                  <th style="padding: 8px; text-align: left;">ผู้ยืม</th>
                  <th style="padding: 8px; text-align: left;">วันที่คืน</th>
                  <th style="padding: 8px; text-align: left;">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                ${historyLogs.length === 0 ? `
                  <tr><td colspan="4" style="text-align: center; padding: 14px; color: #94a3b8;">ยังไม่มีประวัติการยืมอุปกรณ์นี้</td></tr>
                ` : historyLogs.map(h => `
                  <tr style="border-top: 1px solid #f1f5f9;">
                    <td style="padding: 8px;">${formatDate(h.borrowDate)}</td>
                    <td style="padding: 8px; font-weight: 500;">${escapeHtml(h.borrower || '-')}</td>
                    <td style="padding: 8px;">${h.returnDate ? formatDate(h.returnDate) : '<span style="color: #f59e0b;">ยังไม่ส่งคืน</span>'}</td>
                    <td style="padding: 8px;">${h.status === 'returned' ? '<span style="color: #10b981;"><i data-lucide="check-circle-2" class="inline-icon"></i> ส่งคืนแล้ว</span>' : '<span style="color: #f59e0b;"><i data-lucide="clock" class="inline-icon"></i> ใช้งานอยู่</span>'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="modal-footer" style="padding: 14px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
          <button type="button" class="btn" onclick="window.openEquipmentQRModal('${asset.code}')" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">
            <i data-lucide="printer" class="inline-icon"></i> พิมพ์ฉลาก QR Code
          </button>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn" onclick="window.openRepairModal('${asset.code}', '${escapeHtml(asset.name)}')" style="background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">
              <i data-lucide="alert-triangle" class="inline-icon"></i> แจ้งเครื่องมือชำรุด/ส่งซ่อม
            </button>
            <button type="button" class="btn" onclick="window.openMaintenanceModal('${asset.code}', '${escapeHtml(asset.assetId)}')" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">
              <i data-lucide="wrench" class="inline-icon"></i> บันทึกการบำรุงรักษา
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  modal.classList.add("active");
}

export function closeEquipmentModal() {
  const modal = document.getElementById("equipmentDetailModal");
  if (modal) modal.classList.remove("active");
}

// Open Repair Request Modal
export function openRepairModal(itemCode, itemName) {
  closeEquipmentModal();
  let modal = document.getElementById("equipmentRepairModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "equipmentRepairModal";
    modal.className = "modal";
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-overlay" onclick="window.closeRepairModal()"></div>
    <div class="modal-dialog" style="max-width: 520px;">
      <div class="modal-content" style="border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.18);">
        <div class="modal-header" style="background: #b91c1c; color: white; padding: 18px 24px;">
          <h3 style="margin: 0; font-size: 16px; font-weight: 700;"><i data-lucide="alert-triangle" class="inline-icon"></i> แจ้งเครื่องมือชำรุด / ส่งซ่อม (Report Repair)</h3>
          <button type="button" class="btn-close-modal" onclick="window.closeRepairModal()" aria-label="ปิดหน้าต่าง" title="ปิดหน้าต่าง"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        </div>
        <form id="formEquipmentRepair" onsubmit="window.submitEquipmentRepair(event)" style="padding: 20px;">
          <input type="hidden" name="itemCode" value="${escapeHtml(itemCode)}">
          <div style="margin-bottom: 12px;">
            <label style="display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 4px;">รายการอุปกรณ์</label>
            <input type="text" value="${escapeHtml(itemName)} (${itemCode})" readonly style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; background: #f8fafc; font-size: 13px;">
          </div>
          <div style="margin-bottom: 12px;">
            <label style="display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 4px;">ระดับความเร่งด่วน</label>
            <select name="priority" style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px;">
              <option value="medium">ปานกลาง (Medium)</option>
              <option value="high">เร่งด่วน มีคลาสเรียนสัปดาห์นี้ (High)</option>
              <option value="urgent">ฉุกเฉิน อุปกรณ์หลักเสียหาย (Urgent)</option>
              <option value="low">ไม่เร่งด่วน (Low)</option>
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 4px;">อาการที่ชำรุด หรือข้อขัดข้อง <span style="color: red;">*</span></label>
            <textarea name="issueDescription" required rows="4" placeholder="ระบุอาการชำรุด เช่น หน้าจอไม่แสดงผล, อุณหภูมิไม่คงที่, สายไฟชำรุด..." style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px;"></textarea>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 8px;">
            <button type="button" onclick="window.closeRepairModal()" style="padding: 8px 16px; border: 1px solid #cbd5e1; background: #fff; border-radius: 8px; cursor: pointer;">ยกเลิก</button>
            <button type="submit" style="padding: 8px 18px; background: #b91c1c; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">ส่งรายงานแจ้งซ่อม</button>
          </div>
        </form>
      </div>
    </div>
  `;
  modal.classList.add("active");
}

export function closeRepairModal() {
  const modal = document.getElementById("equipmentRepairModal");
  if (modal) modal.classList.remove("active");
}

export async function submitEquipmentRepair(e) {
  e.preventDefault();
  const form = e.target;
  const itemCode = form.itemCode.value;
  const priority = form.priority.value;
  const issueDescription = form.issueDescription.value;

  try {
    const res = await fetchWithAuth(`${API_BASE}/equipment/repairs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemCode, priority, issueDescription })
    });
    if (res.ok) {
      if (typeof window.showToast === 'function') {
        window.showToast("บันทึกการแจ้งซ่อมเรียบร้อยแล้ว สถานะเปลี่ยนเป็น อยู่ระหว่างส่งซ่อม", "success");
      } else {
        alert("บันทึกการแจ้งซ่อมเรียบร้อยแล้ว");
      }
      closeRepairModal();
      await fetchEquipmentAssets();
      if (window.renderItemsTable) window.renderItemsTable();
    } else {
      const err = await res.json();
      alert(`เกิดข้อผิดพลาด: ${err.error}`);
    }
  } catch(err) {
    alert(`ไม่สามารถส่งคำขอได้: ${err.message}`);
  }
}

// Open Maintenance / Calibration Log Modal
export function openMaintenanceModal(itemCode, assetId) {
  closeEquipmentModal();
  let modal = document.getElementById("equipmentMaintenanceModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "equipmentMaintenanceModal";
    modal.className = "modal";
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-overlay" onclick="window.closeMaintenanceModal()"></div>
    <div class="modal-dialog" style="max-width: 520px;">
      <div class="modal-content" style="border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.18);">
        <div class="modal-header" style="background: #2563eb; color: white; padding: 18px 24px;">
          <h3 style="margin: 0; font-size: 16px; font-weight: 700;"><i data-lucide="wrench" class="inline-icon"></i> บันทึกการบำรุงรักษา / สอบเทียบ (Maintenance & Calibration)</h3>
          <button type="button" class="btn-close-modal" onclick="window.closeMaintenanceModal()" aria-label="ปิดหน้าต่าง" title="ปิดหน้าต่าง"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        </div>
        <form id="formEquipmentMaint" onsubmit="window.submitEquipmentMaintenance(event)" style="padding: 20px;">
          <input type="hidden" name="itemCode" value="${escapeHtml(itemCode)}">
          <input type="hidden" name="assetId" value="${escapeHtml(assetId || '')}">
          <div style="margin-bottom: 12px;">
            <label style="display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 4px;">ประเภทการดำเนินการ</label>
            <select name="type" style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px;">
              <option value="maintenance">บำรุงรักษาตามรอบ (Preventive Maintenance)</option>
              <option value="calibration">สอบเทียบความเที่ยงตรง (Calibration)</option>
              <option value="repair">ซ่อมแซมและเปลี่ยนอะไหล่ (Repair)</option>
              <option value="inspection">ตรวจสภาพความปลอดภัย (Safety Inspection)</option>
            </select>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div>
              <label style="display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 4px;">ช่างผู้ดำเนินการ / บริษัท</label>
              <input type="text" name="technician" placeholder="เช่น บจก. สอบเทียบสากล" required style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px;">
            </div>
            <div>
              <label style="display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 4px;">ค่าใช้จ่าย (บาท)</label>
              <input type="number" name="cost" value="0" min="0" step="any" style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px;">
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div>
              <label style="display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 4px;">เลขที่ใบรับรอง (Certificate No.)</label>
              <input type="text" name="certificateUrl" placeholder="เช่น CERT-2026-CAL-102" style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px;">
            </div>
            <div>
              <label style="display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 4px;">วันครบกำหนดรอบถัดไป</label>
              <input type="date" name="nextDueDate" style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px;">
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 4px;">บันทึกผลการทดสอบ / หมายเหตุ</label>
            <textarea name="notes" rows="3" placeholder="เช่น ผลการทดสอบผ่านเกณฑ์ ISO/IEC 17025..." style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px;"></textarea>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 8px;">
            <button type="button" onclick="window.closeMaintenanceModal()" style="padding: 8px 16px; border: 1px solid #cbd5e1; background: #fff; border-radius: 8px; cursor: pointer;">ยกเลิก</button>
            <button type="submit" style="padding: 8px 18px; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">บันทึกการบำรุงรักษา</button>
          </div>
        </form>
      </div>
    </div>
  `;
  modal.classList.add("active");
}

export function closeMaintenanceModal() {
  const modal = document.getElementById("equipmentMaintenanceModal");
  if (modal) modal.classList.remove("active");
}

export async function submitEquipmentMaintenance(e) {
  e.preventDefault();
  const form = e.target;
  const payload = {
    itemCode: form.itemCode.value,
    assetId: form.assetId.value,
    type: form.type.value,
    technician: form.technician.value,
    cost: parseFloat(form.cost.value || 0),
    certificateUrl: form.certificateUrl.value,
    nextDueDate: form.nextDueDate.value || null,
    notes: form.notes.value
  };

  try {
    const res = await fetchWithAuth(`${API_BASE}/equipment/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      if (typeof window.showToast === 'function') {
        window.showToast("บันทึกการบำรุงรักษา/สอบเทียบเรียบร้อยแล้ว", "success");
      } else {
        alert("บันทึกการบำรุงรักษาเรียบร้อยแล้ว");
      }
      closeMaintenanceModal();
      await fetchEquipmentAssets();
    } else {
      const err = await res.json();
      alert(`เกิดข้อผิดพลาด: ${err.error}`);
    }
  } catch(err) {
    alert(`ไม่สามารถบันทึกได้: ${err.message}`);
  }
}

// Open Equipment QR Modal
export async function openEquipmentQRModal(code) {
  try {
    const res = await fetch(`${API_BASE}/equipment/qr/${encodeURIComponent(code)}`);
    const data = await res.json();
    if (!data.success) {
      alert("ไม่สามารถสร้าง QR Code ได้");
      return;
    }

    let modal = document.getElementById("equipmentQrModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "equipmentQrModal";
      modal.className = "modal";
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-overlay" onclick="window.closeEquipmentQRModal()"></div>
      <div class="modal-dialog" style="max-width: 400px; text-align: center;">
        <div class="modal-content" style="border-radius: 16px; padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.18);">
          <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700;">ฉลากครุภัณฑ์และอุปกรณ์</h3>
          <p style="font-size: 12px; color: #64748b; margin: 0 0 16px 0;">SCIPORTAL-EQ-V2 Standard</p>
          <div id="equipmentQrContainer" style="display: flex; justify-content: center; margin: 16px 0; padding: 16px; background: #fff; border: 2px dashed #cbd5e1; border-radius: 12px;"></div>
          <div style="font-family: monospace; font-size: 14px; font-weight: 700; color: #312e81;">${escapeHtml(data.summary.assetId)}</div>
          <div style="font-size: 13px; font-weight: 600; color: #1e293b; margin-top: 4px;">${escapeHtml(data.summary.name)}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">ตำแหน่ง: ${escapeHtml(data.summary.location)}</div>
          <div style="display: flex; gap: 8px; justify-content: center; margin-top: 20px;">
            <button type="button" onclick="window.print()" style="padding: 8px 16px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;"><i data-lucide="printer" class="inline-icon"></i> สั่งพิมพ์ฉลาก</button>
            <button type="button" onclick="window.closeEquipmentQRModal()" style="padding: 8px 16px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; cursor: pointer;">ปิด</button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add("active");
    generateQRCode("equipmentQrContainer", data.qrString, 160, 160);
  } catch(err) {
    alert("เกิดข้อผิดพลาดในการโหลด QR Code");
  }
}

export function closeEquipmentQRModal() {
  const modal = document.getElementById("equipmentQrModal");
  if (modal) modal.classList.remove("active");
}

// Generate QR Code into DOM element
export function generateQRCode(elementId, text, width = 128, height = 128) {
  const target = document.getElementById(elementId);
  if (!target) return;
  target.innerHTML = "";

  if (typeof QRCode !== 'undefined') {
    new QRCode(target, {
      text: text,
      width: width,
      height: height,
      colorDark: "#1e1b4b",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
  } else {
    target.innerHTML = `<div style="font-size: 11px; color: #ef4444;">QRCode library not loaded</div>`;
  }
}

// Batch Print QR Code labels for selected items
export function batchPrintQR() {
  const selectedCodes = Array.from(state.selectedBatchItems || []);
  if (selectedCodes.length === 0) {
    if (typeof window.showToast === 'function') {
      window.showToast("กรุณาเลือกรายการที่ต้องการพิมพ์ QR Code อย่างน้อย 1 รายการ", "warning");
    } else {
      alert("กรุณาเลือกรายการที่ต้องการพิมพ์ QR Code");
    }
    return;
  }

  const itemsToPrint = state.items.filter(it => selectedCodes.includes(it.code));
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>พิมพ์ฉลาก QR Code พัสดุและอุปกรณ์</title>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
      <style>
        body { font-family: 'IBM Plex Sans Thai', sans-serif; margin: 20px; color: #1e293b; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
        .label-card { border: 1px dashed #cbd5e1; padding: 12px; border-radius: 8px; text-align: center; page-break-inside: avoid; }
        .code { font-family: monospace; font-size: 13px; font-weight: bold; margin-top: 6px; color: #4338ca; }
        .name { font-size: 12px; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .loc { font-size: 10px; color: #64748b; margin-top: 2px; }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px;">
        <button onclick="window.print()" style="padding: 8px 16px; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer;">พิมพ์ฉลาก</button>
      </div>
      <div class="grid">
        ${itemsToPrint.map((it, idx) => `
          <div class="label-card">
            <div id="qr_${idx}" style="display: flex; justify-content: center;"></div>
            <div class="code">${it.code}</div>
            <div class="name">${it.name}</div>
            <div class="loc">${it.room || ''} - ${it.cabinet || ''}</div>
          </div>
        `).join('')}
      </div>
      <script>
        window.onload = function() {
          const items = ${JSON.stringify(itemsToPrint)};
          items.forEach((it, idx) => {
            new QRCode(document.getElementById('qr_' + idx), {
              text: it.code,
              width: 80,
              height: 80
            });
          });
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

// Start Camera QR / Barcode Scanner
export function startQrScanner(onSuccessCallback) {
  const qrReaderElem = document.getElementById("qr-reader");
  if (!qrReaderElem) return;

  if (typeof Html5Qrcode !== "undefined") {
    html5QrCodeScanner = new Html5Qrcode("qr-reader");
    html5QrCodeScanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        stopQrScanner();
        if (typeof onSuccessCallback === 'function') {
          onSuccessCallback(decodedText);
        }
      },
      (error) => {}
    ).catch(err => {
      console.warn("Unable to start camera scanner:", err);
    });
  }
}

// Stop Camera Scanner
export function stopQrScanner() {
  if (html5QrCodeScanner) {
    html5QrCodeScanner.stop().then(() => {
      html5QrCodeScanner.clear();
      html5QrCodeScanner = null;
    }).catch(() => {});
  }
}

// Mount to window for global backwards compatibility
if (typeof window !== 'undefined') {
  window.autoGenerateCurrentCode = autoGenerateCurrentCode;
  window.generateQRCode = generateQRCode;
  window.batchPrintQR = batchPrintQR;
  window.startQrScanner = startQrScanner;
  window.stopQrScanner = stopQrScanner;
  window.openEquipmentModal = openEquipmentModal;
  window.closeEquipmentModal = closeEquipmentModal;
  window.openRepairModal = openRepairModal;
  window.closeRepairModal = closeRepairModal;
  window.submitEquipmentRepair = submitEquipmentRepair;
  window.openMaintenanceModal = openMaintenanceModal;
  window.closeMaintenanceModal = closeMaintenanceModal;
  window.submitEquipmentMaintenance = submitEquipmentMaintenance;
  window.openEquipmentQRModal = openEquipmentQRModal;
  window.closeEquipmentQRModal = closeEquipmentQRModal;
}
