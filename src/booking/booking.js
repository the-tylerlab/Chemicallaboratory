/**
 * @file booking.js
 * @description Laboratory Room Booking System, Calendar View, Conflict Detection, Experiment Checklists & Approvals
 * Module: booking/booking
 */

import { fetchWithAuth, API_BASE, syncToGoogleSheetsDirect } from '../core/api.js';
import { state } from '../core/state.js';
import { formatDate, escapeHtml } from '../core/utils.js';
import { getCurrentRoleLevel } from '../rbac/rbac.js';

// Selected calendar filter date
let activeCalendarDate = new Date().toISOString().split('T')[0];

// Fetch bookings from backend
export async function fetchBookings() {
  try {
    const res = await fetch(`${API_BASE}/bookings`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        state.bookings = data;
        saveBookingsToLocal();
        renderBookings();
        renderRoomAvailability();
        return data;
      }
    }
  } catch (err) {
    console.warn("[Booking] Server unreachable, loading from cache:", err.message);
  }

  try {
    const local = localStorage.getItem("lab_bookings");
    if (local) {
      state.bookings = JSON.parse(local);
      renderBookings();
      renderRoomAvailability();
    }
  } catch (e) {}

  return state.bookings;
}

export function saveBookingsToLocal() {
  try {
    localStorage.setItem("lab_bookings", JSON.stringify(state.bookings));
  } catch (e) {}
}

// Fetch live room availability matrix
export async function fetchRoomAvailability(date = activeCalendarDate) {
  try {
    const res = await fetch(`${API_BASE}/bookings/availability?date=${date}`);
    if (res.ok) {
      const data = await res.json();
      return data.availability || [];
    }
  } catch(err) {
    console.warn("[Booking] Availability fetch notice:", err.message);
  }
  return [];
}

// Real-time conflict checker
export async function checkBookingConflict(room, date, timeSlot, excludeId = null) {
  try {
    const res = await fetch(`${API_BASE}/bookings/check-conflict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room, date, timeSlot, excludeId })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch(e) {}

  // Local fallback check
  const conflict = (state.bookings || []).find(b => 
    b.id !== excludeId &&
    (b.room || '').toLowerCase() === (room || '').toLowerCase() &&
    b.date === date &&
    (b.timeSlot || b.slot) === timeSlot &&
    b.status !== 'cancelled' &&
    b.status !== 'rejected'
  );
  return { hasConflict: !!conflict, conflictingBooking: conflict || null };
}

// Create new room booking with Experiment Master items
export async function createBooking(bookingData) {
  const role = getCurrentRoleLevel();
  if (role === 'L0') {
    throw new Error('กรุณาเข้าสู่ระบบก่อนทำการจองห้องปฏิบัติการ');
  }

  const user = state.currentUser;
  const newBooking = {
    id: `BK-${Date.now()}`,
    room: bookingData.room || 'Lab 1',
    date: bookingData.date,
    timeSlot: bookingData.timeSlot || '08:30 - 10:20',
    purpose: bookingData.purpose || bookingData.experimentName || 'การเรียนการสอนปฏิบัติการ',
    teacherId: user ? user.teacherId : '',
    teacherName: user ? user.name : 'ครูผู้สอน',
    department: user ? user.department : 'วิทยาศาสตร์และเทคโนโลยี',
    className: bookingData.className || 'ม.5/1',
    studentCount: parseInt(bookingData.studentCount || 30),
    experimentName: bookingData.experimentName || 'การทดลองวิทยาศาสตร์',
    requiredEquipment: bookingData.requiredEquipment || [],
    requiredChemicals: bookingData.requiredChemicals || [],
    preparationChecklist: [
      { task: "จัดเตรียมสารเคมีตามสูตรและอัตราส่วน", done: false },
      { task: "ตรวจสอบและตั้งวางเครื่องมือประจำโต๊ะปฏิบัติการ", done: false },
      { task: "ตรวจสอบระบบดูดควันและอุปกรณ์ความปลอดภัย (SHECU)", done: false }
    ],
    cleanupChecklist: [
      { task: "ตรวจนับเครื่องแก้วและอุปกรณ์ส่งคืน", done: false },
      { task: "รวบรวมขยะสารเคมีและของเสียอันตรายลงถังแยก", done: false },
      { task: "ทำความสะอาดพื้นโต๊ะและปิดวาล์วแก๊ส/ระบบไฟฟ้า", done: false }
    ],
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // Check conflicts
  const conflictResult = await checkBookingConflict(newBooking.room, newBooking.date, newBooking.timeSlot);
  if (conflictResult.hasConflict) {
    throw new Error(`ห้อง ${newBooking.room} ในช่วงเวลา ${newBooking.timeSlot} ของวันที่ ${newBooking.date} มีผู้จองแล้ว`);
  }

  // Dispatch to server
  try {
    const res = await fetchWithAuth(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBooking)
    });
    if (res.ok) {
      const saved = await res.json();
      if (saved.booking) {
        state.bookings.unshift(saved.booking);
      } else {
        state.bookings.unshift(newBooking);
      }
    }
  } catch (e) {
    state.bookings.unshift(newBooking);
  }

  saveBookingsToLocal();
  syncToGoogleSheetsDirect('Bookings', 'UPSERT', newBooking, 'id');
  renderBookings();
  renderRoomAvailability();
  return newBooking;
}

// Approve or Reject Booking (L2 Staff or L3 Admin)
export async function updateBookingStatus(bookingId, status, reason = '') {
  const role = getCurrentRoleLevel();
  if (role !== 'L2' && role !== 'L3' && role !== 'L4') {
    throw new Error('เฉพาะเจ้าหน้าที่หรือผู้ดูแลระบบเท่านั้นที่สามารถอนุมัติการจองได้');
  }

  try {
    const res = await fetchWithAuth(`${API_BASE}/bookings/${encodeURIComponent(bookingId)}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: status, reason })
    });
    if (res.ok) {
      const data = await res.json();
      const idx = state.bookings.findIndex(b => b.id === bookingId);
      if (idx !== -1) {
        state.bookings[idx] = data.booking;
        saveBookingsToLocal();
        renderBookings();
        renderRoomAvailability();
      }
      return data.booking;
    }
  } catch (e) {
    console.warn("Could not review booking on server:", e);
  }

  const idx = state.bookings.findIndex(b => b.id === bookingId);
  if (idx !== -1) {
    state.bookings[idx].status = status;
    state.bookings[idx].updatedAt = new Date().toISOString();
    saveBookingsToLocal();
    renderBookings();
    renderRoomAvailability();
    return state.bookings[idx];
  }
}

// Toggle Checklist item
export async function toggleChecklistItem(bookingId, type, index, done) {
  try {
    await fetchWithAuth(`${API_BASE}/bookings/${encodeURIComponent(bookingId)}/checklist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, index, done })
    });
  } catch(e) {}

  const bk = state.bookings.find(b => b.id === bookingId);
  if (bk) {
    const listKey = type === 'cleanup' ? 'cleanupChecklist' : 'preparationChecklist';
    if (bk[listKey] && bk[listKey][index]) {
      bk[listKey][index].done = done;
      saveBookingsToLocal();
      renderBookings();
    }
  }
}

// Cancel Booking
export async function cancelBooking(bookingId) {
  if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองห้องปฏิบัตินี้?")) return;

  try {
    const res = await fetchWithAuth(`${API_BASE}/bookings/${encodeURIComponent(bookingId)}/cancel`, {
      method: 'POST'
    });
    if (res.ok) {
      const data = await res.json();
      const idx = state.bookings.findIndex(b => b.id === bookingId);
      if (idx !== -1) state.bookings[idx] = data.booking;
      saveBookingsToLocal();
      renderBookings();
      renderRoomAvailability();
      if (typeof window.showToast === 'function') window.showToast("ยกเลิกการจองเรียบร้อยแล้ว", "info");
    }
  } catch(e) {
    alert("ไม่สามารถยกเลิกการจองได้: " + e.message);
  }
}

// Render Room Availability Calendar Grid (Lab 1 - Lab 8)
export async function renderRoomAvailability() {
  const container = document.getElementById("roomAvailabilityMatrix");
  if (!container) return;

  const availability = await fetchRoomAvailability(activeCalendarDate);
  if (availability.length === 0) {
    container.innerHTML = `<div style="text-align: center; padding: 20px; color: #94a3b8;">กำลังโหลดสถานะห้องปฏิบัติการ...</div>`;
    return;
  }

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: #fff; padding: 12px 16px; border-radius: 10px; border: 1px solid #e2e8f0;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <label style="font-size: 13px; font-weight: 700; color: #1e293b;">📅 เลือกวันที่ตรวจสอบ:</label>
        <input type="date" id="calendarDateFilter" value="${activeCalendarDate}" onchange="window.setBookingCalendarDate(this.value)" style="padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 13px; font-weight: 600;">
      </div>
      <div style="display: flex; gap: 12px; font-size: 12px;">
        <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 10px; height: 10px; border-radius: 50%; background: #10b981;"></span> ห้องว่าง (Available)</span>
        <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 10px; height: 10px; border-radius: 50%; background: #ef4444;"></span> มีการจองแล้ว (Booked)</span>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px;">
      ${availability.map(r => `
        <div style="border: 1px solid ${r.isFullyBooked ? '#fca5a5' : '#e2e8f0'}; border-radius: 12px; background: #fff; padding: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9;">
            <span style="font-weight: 800; font-size: 14px; color: #1e1b4b;">🔬 ${escapeHtml(r.room)}</span>
            <span style="font-size: 11px; padding: 2px 8px; border-radius: 999px; background: ${r.isFullyBooked ? '#fee2e2' : '#ecfdf5'}; color: ${r.isFullyBooked ? '#b91c1c' : '#047857'}; font-weight: 700;">
              ${r.isFullyBooked ? 'เต็มทุกช่วงเวลา' : `ว่าง ${r.slots.filter(s => s.isAvailable).length} คาบ`}
            </span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${r.slots.map(s => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; border-radius: 6px; font-size: 12px; background: ${s.isAvailable ? '#f8fafc' : '#fef2f2'}; border: 1px solid ${s.isAvailable ? '#f1f5f9' : '#fecaca'};">
                <span style="font-family: monospace; color: #475569;">${s.slot}</span>
                ${s.isAvailable ? `
                  <button type="button" onclick="window.quickSelectBooking('${escapeHtml(r.room)}', '${s.slot}')" style="padding: 2px 8px; border-radius: 4px; background: #10b981; color: white; border: none; font-size: 11px; font-weight: 600; cursor: pointer;">
                    + จองคาบนี้
                  </button>
                ` : `
                  <span style="color: #b91c1c; font-weight: 600; font-size: 11px;" title="${escapeHtml(s.booking.experimentName)} (${escapeHtml(s.booking.teacherName)})">
                    จองแล้ว (${escapeHtml(s.booking.className)})
                  </span>
                `}
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

export function setBookingCalendarDate(val) {
  activeCalendarDate = val;
  renderRoomAvailability();
}

export function quickSelectBooking(room, slot) {
  const roomInput = document.getElementById("bookingRoom");
  const slotInput = document.getElementById("bookingSlot");
  const dateInput = document.getElementById("bookingDate");
  if (roomInput) roomInput.value = room;
  if (slotInput) slotInput.value = slot;
  if (dateInput) dateInput.value = activeCalendarDate;

  // Scroll to form
  const form = document.getElementById("labBookingForm");
  if (form) form.scrollIntoView({ behavior: 'smooth' });
}

// Render Bookings List
export function renderBookings() {
  const container = document.getElementById("bookingListContainer");
  if (!container) return;

  const bookings = state.bookings || [];
  if (bookings.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #94a3b8; background: #fff; border-radius: 12px; border: 1px dashed #cbd5e1;">
        <p style="margin: 0; font-size: 14px; font-weight: 600;">ยังไม่มีรายการจองห้องปฏิบัติการ</p>
      </div>
    `;
    return;
  }

  const role = getCurrentRoleLevel();
  const canApprove = (role === 'L2' || role === 'L3' || role === 'L4');

  container.innerHTML = bookings.map(b => {
    let statusBadge = `<span class="status-badge status-warning">🟡 รออนุมัติ (Pending)</span>`;
    if (b.status === 'approved') statusBadge = `<span class="status-badge status-good">🟢 อนุมัติแล้ว (Approved)</span>`;
    if (b.status === 'rejected') statusBadge = `<span class="status-badge status-danger">🔴 ปฏิเสธ (Rejected)</span>`;
    if (b.status === 'cancelled') statusBadge = `<span class="status-badge status-secondary">⚪ ยกเลิกแล้ว (Cancelled)</span>`;

    const prepChecklist = b.preparationChecklist || [];
    const cleanupChecklist = b.cleanupChecklist || [];

    return `
      <div class="booking-card" style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 14px; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
          <div>
            <span style="font-weight: 800; color: #1e1b4b; font-size: 16px;">🔬 ${escapeHtml(b.room)}</span>
            <span style="margin-left: 10px;">${statusBadge}</span>
            <div style="font-size: 13px; font-weight: 600; color: #4338ca; margin-top: 4px;">
              🧪 การทดลอง: ${escapeHtml(b.experimentName || b.purpose || '-')} | ระดับชั้น: ${escapeHtml(b.className || '-')} (${b.studentCount || 0} คน)
            </div>
          </div>
          <div style="text-align: right; font-size: 12px; color: #64748b;">
            <div style="font-weight: 700; color: #1e293b;">📅 ${formatDate(b.date)}</div>
            <div style="font-family: monospace; color: #4f46e5; margin-top: 2px;">⏰ ${escapeHtml(b.timeSlot || b.slot)}</div>
          </div>
        </div>

        <div style="font-size: 12.5px; color: #475569; margin-bottom: 12px; background: #f8fafc; padding: 10px 14px; border-radius: 8px;">
          <strong>ผู้ขอจอง:</strong> ${escapeHtml(b.teacherName || b.bookerName || '-')} (${escapeHtml(b.teacherId || '-')})
          ${b.rejectionReason ? `<div style="color: #dc2626; margin-top: 4px;"><strong>เหตุผลที่ไม่อนุมัติ:</strong> ${escapeHtml(b.rejectionReason)}</div>` : ''}
        </div>

        <!-- Interactive Checklists -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 10px; font-size: 12px;">
          <!-- Prep Checklist -->
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 12px;">
            <strong style="color: #166534; display: block; margin-bottom: 6px;">📋 เตรียมการทดลอง (Lab Preparation)</strong>
            ${prepChecklist.map((item, idx) => `
              <label style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px; cursor: pointer; color: #15803d;">
                <input type="checkbox" ${item.done ? 'checked' : ''} onchange="window.toggleChecklistItem('${b.id}', 'preparation', ${idx}, this.checked)">
                <span style="${item.done ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${escapeHtml(item.task)}</span>
              </label>
            `).join('')}
          </div>

          <!-- Cleanup Checklist -->
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 12px;">
            <strong style="color: #1e40af; display: block; margin-bottom: 6px;">🧹 ตรวจความเรียบร้อยหลังแล็บ (Cleanup)</strong>
            ${cleanupChecklist.map((item, idx) => `
              <label style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px; cursor: pointer; color: #1d4ed8;">
                <input type="checkbox" ${item.done ? 'checked' : ''} onchange="window.toggleChecklistItem('${b.id}', 'cleanup', ${idx}, this.checked)">
                <span style="${item.done ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${escapeHtml(item.task)}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <!-- Actions -->
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px;">
          ${canApprove && b.status === 'pending' ? `
            <button type="button" class="btn btn-sm btn-primary" onclick="window.updateBookingStatus('${escapeHtml(b.id)}', 'approved')" style="padding: 6px 14px; background: #10b981; border: none; color: white; border-radius: 6px; font-weight: 600; cursor: pointer;">
              ✓ อนุมัติการจอง
            </button>
            <button type="button" class="btn btn-sm" onclick="window.promptRejectBooking('${escapeHtml(b.id)}')" style="padding: 6px 14px; background: #fee2e2; border: 1px solid #fca5a5; color: #b91c1c; border-radius: 6px; font-weight: 600; cursor: pointer;">
              ✕ ไม่อนุมัติ
            </button>
          ` : ''}
          ${b.status !== 'cancelled' ? `
            <button type="button" class="btn btn-sm" onclick="window.cancelBooking('${escapeHtml(b.id)}')" style="padding: 6px 12px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; cursor: pointer;">
              ยกเลิกการจอง
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

export function promptRejectBooking(bookingId) {
  const reason = prompt("กรุณาระบุเหตุผลที่ไม่อนุมัติการจองห้องปฏิบัติการ:");
  if (reason !== null) {
    updateBookingStatus(bookingId, 'rejected', reason);
  }
}

// Mount to window for global backwards compatibility
if (typeof window !== 'undefined') {
  window.fetchBookings = fetchBookings;
  window.createBooking = createBooking;
  window.updateBookingStatus = updateBookingStatus;
  window.renderBookings = renderBookings;
  window.renderRoomAvailability = renderRoomAvailability;
  window.setBookingCalendarDate = setBookingCalendarDate;
  window.quickSelectBooking = quickSelectBooking;
  window.toggleChecklistItem = toggleChecklistItem;
  window.cancelBooking = cancelBooking;
  window.promptRejectBooking = promptRejectBooking;
}
