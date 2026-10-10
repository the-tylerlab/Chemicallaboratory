/**
 * @file dashboard.js
 * @description Role-Based Dynamic Dashboard (Teacher, Staff, Admin, Executive), Live KPIs & Operational Widgets
 * Module: dashboard/dashboard
 */

import { fetchWithAuth, API_BASE } from '../core/api.js';
import { state } from '../core/state.js';
import { formatDate, formatCurrency, escapeHtml } from '../core/utils.js';
import { getCurrentRoleLevel } from '../rbac/rbac.js';

let activeRolePreview = null;

// Fetch Role-Specific Dashboard Data from Server
export async function fetchRoleDashboardData(roleOverride = null) {
  try {
    const roleParam = roleOverride || activeRolePreview || getCurrentRoleLevel();
    const res = await fetchWithAuth(`${API_BASE}/dashboard/role-view?role=${roleParam}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("[Dashboard] Could not fetch live role view:", err.message);
  }
  return null;
}

// Switch Role View Preview
export async function switchDashboardRole(roleLevel) {
  activeRolePreview = roleLevel;
  if (typeof window !== 'undefined') {
    window.activeRolePreview = roleLevel;
    if (typeof window.navigateToPanel === 'function') {
      window.navigateToPanel('dashboard');
    }
    // Sync sidebar active role buttons
    ['L1', 'L2', 'L3', 'L4'].forEach(r => {
      const btn = document.getElementById(`roleBtn-${r}`);
      if (btn) {
        if (r === roleLevel) btn.classList.add('active');
        else btn.classList.remove('active');
      }
    });
    if (typeof window.applyDashboardRoleLayout === 'function') {
      window.applyDashboardRoleLayout();
    }
    if (typeof window.updateLoginUI === 'function') {
      window.updateLoginUI();
    }
    // On mobile, close sidebar on selection
    if (window.innerWidth <= 1024) {
      const sidebar = document.getElementById("sidebar");
      const mobileOverlay = document.getElementById("mobile-overlay");
      if (sidebar) sidebar.classList.remove("active");
      if (mobileOverlay) mobileOverlay.classList.remove("active");
      document.body.classList.remove("mobile-sidebar-open");
    }
  }
  await updateDashboardMetrics();
}

// Calculate and render all Dashboard KPI metric cards and Role Panels
export async function updateDashboardMetrics() {
  const currentRole = activeRolePreview || (['L1', 'L2', 'L3', 'L4'].includes(getCurrentRoleLevel()) ? getCurrentRoleLevel() : 'L3');
  const roleDataResponse = await fetchRoleDashboardData(currentRole);
  const data = roleDataResponse?.data || {};

  const items = state.items || [];
  const bookings = state.bookings || [];
  const txs = state.transactions || [];
  const today = new Date();
  const future30 = new Date(today.getTime() + 30 * 86400000);

  // 1. Metric Calculations
  const total = items.length;
  const expired = items.filter(it => it.expiry && new Date(it.expiry) < today).length;
  const lowStock = items.filter(it => {
    const q = parseFloat(it.quantity || it.qty || 0);
    const min = parseFloat(it.minAlert || it.minStock || 5);
    return q <= min;
  }).length;
  const nearExpiry = items.filter(it => {
    if (!it.expiry) return false;
    const exp = new Date(it.expiry);
    return exp >= today && exp <= future30;
  }).length;

  // 2. Populate Standard Stat Cards in DOM
  const elTotal = document.getElementById("dashboardValTotal") || document.getElementById("statTotalItems");
  const elExpired = document.getElementById("dashboardValExpired") || document.getElementById("statExpiredItems");
  const elLowStock = document.getElementById("dashboardValLowStock") || document.getElementById("statLowStockItems");
  const elNearExpiry = document.getElementById("dashboardValNearExpiry") || document.getElementById("statNearExpiryItems");

  if (elTotal) elTotal.innerText = total.toLocaleString();
  if (elExpired) elExpired.innerText = expired.toLocaleString();
  if (elLowStock) elLowStock.innerText = lowStock.toLocaleString();
  if (elNearExpiry) elNearExpiry.innerText = nearExpiry.toLocaleString();

  // Quick stat cards counters if legacy class exists
  const statCardTotalCount = document.querySelector("#statCardTotal .stat-number");
  const statCardExpiredCount = document.querySelector("#statCardExpired .stat-number");
  const statCardLowStockCount = document.querySelector("#statCardLowStock .stat-number");
  const statCardNearExpiryCount = document.querySelector("#statCardNearExpiry .stat-number");

  if (statCardTotalCount) statCardTotalCount.innerText = total.toLocaleString();
  if (statCardExpiredCount) statCardExpiredCount.innerText = expired.toLocaleString();
  if (statCardLowStockCount) statCardLowStockCount.innerText = lowStock.toLocaleString();
  if (statCardNearExpiryCount) statCardNearExpiryCount.innerText = nearExpiry.toLocaleString();

  // 3. Bottom Summary Cards
  const calStatPending = document.getElementById("calStatPending");
  const calStatRooms = document.getElementById("calStatRooms");
  const calStatUsers = document.getElementById("calStatUsers");

  if (calStatPending) {
    const pendingCount = bookings.filter(b => b.status === 'pending').length;
    calStatPending.innerText = pendingCount.toString();
  }
  if (calStatRooms) {
    calStatRooms.innerText = "8";
  }
  if (calStatUsers) {
    const usersCount = (state.users && state.users.length) ? state.users.length : 14;
    calStatUsers.innerText = usersCount.toString();
  }

  // 4. Category Breakdown Panel
  const catCountEl = document.getElementById("categoryBreakdownCount");
  if (catCountEl) catCountEl.innerText = `${total.toLocaleString()} รายการ`;

  const catContainer = document.getElementById("categoryBreakdownContainer");
  if (catContainer) {
    const categories = ["สารเคมี", "อุปกรณ์วิทยาศาสตร์", "เครื่องแก้ว", "วัสดุสิ้นเปลือง"];
    const catColors = {
      "สารเคมี": "#ef4444",
      "อุปกรณ์วิทยาศาสตร์": "#3b82f6",
      "เครื่องแก้ว": "#8b5cf6",
      "วัสดุสิ้นเปลือง": "#10b981"
    };

    const catCounts = categories.map(cat => ({
      cat,
      count: items.filter(it => it.category === cat).length
    }));

    catContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px; padding: 12px 0;">
        ${catCounts.map(({ cat, count }) => {
          const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
          const color = catColors[cat] || '#6366f1';
          return `
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 4px;">
                <span style="color: #334155;">${cat}</span>
                <span style="color: #64748b;">${count} รายการ (${pct}%)</span>
              </div>
              <div style="height: 8px; width: 100%; background: #f1f5f9; border-radius: 999px; overflow: hidden;">
                <div style="height: 100%; width: ${pct}%; background: ${color}; border-radius: 999px; transition: width 0.4s ease;"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // 5. Urgent Alerts Container
  const urgentContainer = document.getElementById("dashboardUrgentContainer");
  const urgentCount = document.getElementById("dashboardUrgentCount");
  const urgentItems = items.filter(it => {
    const q = parseFloat(it.quantity || it.qty || 0);
    const min = parseFloat(it.minAlert || it.minStock || 5);
    const isLow = q <= min;
    const isExp = it.expiry && new Date(it.expiry) < today;
    return isLow || isExp;
  });

  if (urgentCount) {
    urgentCount.innerText = urgentItems.length.toString();
    urgentCount.style.display = urgentItems.length > 0 ? 'inline-block' : 'none';
  }

  if (urgentContainer) {
    if (urgentItems.length === 0) {
      urgentContainer.innerHTML = `<div style="text-align: center; padding: 16px; color: #10b981; font-size: 13px;"><i data-lucide="check-circle-2" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 6px;"></i>สต็อกพัสดุและสารเคมีทุกรายการอยู่ในระดับปลอดภัย</div>`;
    } else {
      urgentContainer.innerHTML = urgentItems.slice(0, 5).map(it => {
        const isExp = it.expiry && new Date(it.expiry) < today;
        return `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: ${isExp ? '#fef2f2' : '#fffbeb'}; border: 1px solid ${isExp ? '#fecaca' : '#fde68a'}; border-radius: 8px; font-size: 12.5px;">
            <div>
              <strong style="color: #1e293b;">${escapeHtml(it.name)}</strong>
              <div style="font-size: 11px; color: #64748b;">รหัส: ${escapeHtml(it.code)} | ${escapeHtml(it.room || '-')}</div>
            </div>
            <span class="status-badge ${isExp ? 'status-danger' : 'status-warning'}">${isExp ? 'หมดอายุ' : 'สต็อกต่ำ'}</span>
          </div>
        `;
      }).join('');
    }
  }

  // 6. Overdue Loans Container
  const overdueContainer = document.getElementById("dashboardOverdueContainer");
  const overdueCount = document.getElementById("dashboardOverdueCount");
  const overdueItems = txs.filter(t => {
    if (t.status === 'returned') return false;
    const due = t.dueDate || t.expectedReturnDate;
    return due && new Date(due) < today;
  });

  if (overdueCount) {
    overdueCount.innerText = overdueItems.length.toString();
    overdueCount.style.display = overdueItems.length > 0 ? 'inline-block' : 'none';
  }

  if (overdueContainer) {
    if (overdueItems.length === 0) {
      overdueContainer.innerHTML = `<div style="text-align: center; padding: 16px; color: #64748b; font-size: 13px;">ไม่มีรายการพัสดุค้างส่งคืน</div>`;
    } else {
      overdueContainer.innerHTML = overdueItems.slice(0, 5).map(t => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; font-size: 12.5px;">
          <div>
            <strong style="color: #991b1b;">${escapeHtml(t.itemName)}</strong>
            <div style="font-size: 11px; color: #64748b;">ผู้ยืม: ${escapeHtml(t.borrower)}</div>
          </div>
          <span class="status-badge status-danger">เกินกำหนด</span>
        </div>
      `).join('');
    }
  }

  // 7. Damaged / Under Repair Container
  const damagedContainer = document.getElementById("dashboardDamagedContainer");
  const damagedItems = items.filter(it => it.condition === 'under_repair' || it.condition === 'damaged' || Number(it.damagedQty || 0) > 0);
  if (damagedContainer) {
    if (damagedItems.length === 0) {
      damagedContainer.innerHTML = `<div style="text-align: center; padding: 16px; color: #64748b; font-size: 13px;">ไม่มีเครื่องมือที่อยู่ระหว่างส่งซ่อม</div>`;
    } else {
      damagedContainer.innerHTML = damagedItems.slice(0, 5).map(it => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #fffaf0; border: 1px solid #feebc8; border-radius: 8px; font-size: 12.5px;">
          <div>
            <strong style="color: #744210;">${escapeHtml(it.name)}</strong>
            <div style="font-size: 11px; color: #64748b;">รหัส: ${escapeHtml(it.code)} | ${escapeHtml(it.room || '-')}</div>
          </div>
          <span class="status-badge status-warning">${it.condition || 'ชำรุด'}</span>
        </div>
      `).join('');
    }
  }

  // Remove any legacy in-page role bar from main dashboard
  const legacyRoleBar = document.getElementById("dashboardRoleSelectorBar");
  if (legacyRoleBar) legacyRoleBar.remove();

  // Sync sidebar active button state
  ['L1', 'L2', 'L3', 'L4'].forEach(r => {
    const btn = document.getElementById(`roleBtn-${r}`);
    if (btn) {
      if (r === currentRole) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });
  if (typeof window !== 'undefined' && typeof window.syncSidebarRoleVisibility === 'function') {
    window.syncSidebarRoleVisibility();
  }

  // Ensure roleContainer exists for dynamic content
  let roleContainer = document.getElementById("dashboardRoleDynamicContent");
  if (!roleContainer) {
    const dashPanel = document.getElementById("dashboardPanel") || document.getElementById("dashboard-panel") || document.querySelector(".dashboard-grid")?.parentElement;
    if (dashPanel) {
      roleContainer = document.createElement("div");
      roleContainer.id = "dashboardRoleDynamicContent";
      dashPanel.appendChild(roleContainer);
    }
  }
  if (!roleContainer) return;

  // Apply responsive role layout (order, grid-mode, visibility)
  if (typeof window !== 'undefined' && typeof window.applyDashboardRoleLayout === 'function') {
    window.applyDashboardRoleLayout();
  }

  // 1. TEACHER VIEW (L1)
  if (currentRole === 'L1') {
    const myBookings = data.myActiveBookings || bookings.filter(b => b.status !== 'cancelled');
    const myLoans = data.myActiveLoans || txs.filter(t => t.status === 'borrowed');
    const upcomingClasses = data.upcomingClasses || myBookings.filter(b => b.status === 'approved');

    roleContainer.innerHTML = `
      <div style="margin-top: 24px; padding-top: 20px; border-top: 2px dashed #e2e8f0;">
        <h2 style="font-size: 18px; font-weight: 800; color: #1e1b4b; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">
          <span><i data-lucide="graduation-cap" class="inline-icon"></i> แดชบอร์ดเฉพาะครูผู้สอน (Teacher View)</span>
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 24px;">
          <div style="background: white; border-radius: 12px; padding: 18px; border: 1px solid #e2e8f0; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
            <span style="font-size: 12px; color: #64748b; font-weight: 600;">ห้องแล็บที่ฉันจองไว้</span>
            <div style="font-size: 28px; font-weight: 800; color: #4f46e5; margin-top: 4px;">${myBookings.length}</div>
            <span style="font-size: 11px; color: #10b981;">ใช้งานจริง & รออนุมัติ</span>
          </div>
          <div style="background: white; border-radius: 12px; padding: 18px; border: 1px solid #e2e8f0; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
            <span style="font-size: 12px; color: #64748b; font-weight: 600;">พัสดุ/สารเคมีที่ฉันยืม</span>
            <div style="font-size: 28px; font-weight: 800; color: #d97706; margin-top: 4px;">${myLoans.length}</div>
            <span style="font-size: 11px; color: #64748b;">รอส่งคืนห้องปฏิบัติการ</span>
          </div>
          <div style="background: white; border-radius: 12px; padding: 18px; border: 1px solid #e2e8f0; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
            <span style="font-size: 12px; color: #64748b; font-weight: 600;">คาบสอนปฏิบัติการที่จะมาถึง</span>
            <div style="font-size: 28px; font-weight: 800; color: #059669; margin-top: 4px;">${upcomingClasses.length}</div>
            <span style="font-size: 11px; color: #10b981;">ชั้นเรียนที่พร้อมทดลอง</span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0;">
            <h3 style="margin: 0 0 14px 0; font-size: 15px; font-weight: 700; color: #1e1b4b;"><i data-lucide="calendar" class="inline-icon"></i> ห้องปฏิบัติการของฉัน (${myBookings.length})</h3>
            ${myBookings.length === 0 ? `
              <div style="text-align: center; padding: 24px; color: #94a3b8; font-size: 13px;">ยังไม่มีรายการจองห้องปฏิบัติการ</div>
            ` : myBookings.slice(0, 5).map(b => `
              <div style="border-bottom: 1px solid #f1f5f9; padding: 10px 0;">
                <div style="display: flex; justify-content: space-between;">
                  <strong>${escapeHtml(b.room)}</strong>
                  <span class="status-badge ${b.status === 'approved' ? 'status-good' : 'status-warning'}">${b.status}</span>
                </div>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
                  วันที่: ${formatDate(b.date)} (${b.timeSlot || b.slot}) | ${escapeHtml(b.experimentName || b.purpose)}
                </div>
              </div>
            `).join('')}
          </div>

          <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0;">
            <h3 style="margin: 0 0 14px 0; font-size: 15px; font-weight: 700; color: #1e1b4b;"><i data-lucide="package" class="inline-icon"></i> พัสดุและสารเคมีที่ฉันยืม (${myLoans.length})</h3>
            ${myLoans.length === 0 ? `
              <div style="text-align: center; padding: 24px; color: #94a3b8; font-size: 13px;">ไม่มีพัสดุค้างส่งคืน</div>
            ` : myLoans.slice(0, 5).map(t => `
              <div style="border-bottom: 1px solid #f1f5f9; padding: 10px 0;">
                <div style="display: flex; justify-content: space-between;">
                  <strong>${escapeHtml(t.itemName)}</strong>
                  <span style="font-size: 12px; color: #4338ca;">${t.quantity} ${escapeHtml(t.unit || 'ชิ้น')}</span>
                </div>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
                  กำหนดคืน: ${formatDate(t.dueDate || t.expectedReturnDate)}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    return;
  }

  // 2. STAFF VIEW (L2)
  if (currentRole === 'L2') {
    const todayPreps = bookings.filter(b => b.date === today.toISOString().split('T')[0] && b.status === 'approved');

    roleContainer.innerHTML = `
      <div style="margin-top: 24px; padding-top: 20px; border-top: 2px dashed #e2e8f0;">
        <h2 style="font-size: 18px; font-weight: 800; color: #065f46; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">
          <span><i data-lucide="flask-conical" class="inline-icon"></i> แดชบอร์ดเจ้าหน้าที่แล็บ (Staff Operations)</span>
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 24px;">
          <div style="background: white; border-radius: 12px; padding: 18px; border: 1px solid #fca5a5; background: #fff5f5;">
            <span style="font-size: 12px; color: #991b1b; font-weight: 600;">สารเคมีหมดอายุ / สต็อกต่ำ</span>
            <div style="font-size: 28px; font-weight: 800; color: #dc2626; margin-top: 4px;">${expired + lowStock}</div>
            <span style="font-size: 11px; color: #b91c1c;">หมดอายุ: ${expired} | ต่ำกว่าเกณฑ์: ${lowStock}</span>
          </div>
          <div style="background: white; border-radius: 12px; padding: 18px; border: 1px solid #cbd5e1;">
            <span style="font-size: 12px; color: #475569; font-weight: 600;">เตรียมการทดลองวันนี้</span>
            <div style="font-size: 28px; font-weight: 800; color: #0284c7; margin-top: 4px;">${todayPreps.length}</div>
            <span style="font-size: 11px; color: #0284c7;">แล็บที่เปิดใช้งานวันนี้</span>
          </div>
          <div style="background: white; border-radius: 12px; padding: 18px; border: 1px solid #cbd5e1;">
            <span style="font-size: 12px; color: #475569; font-weight: 600;">คำขอจองห้องรออนุมัติ</span>
            <div style="font-size: 28px; font-weight: 800; color: #7c3aed; margin-top: 4px;">${bookings.filter(b => b.status === 'pending').length}</div>
            <span style="font-size: 11px; color: #7c3aed;">รอการตรวจสอบคลาสเรียน</span>
          </div>
        </div>

        <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0;">
          <h3 style="margin: 0 0 14px 0; font-size: 15px; font-weight: 700; color: #0f172a;"><i data-lucide="clipboard-list" class="inline-icon"></i> งานจัดเตรียมแล็บวันนี้ (Today's Preparation)</h3>
          ${todayPreps.length === 0 ? `
            <div style="text-align: center; padding: 24px; color: #94a3b8; font-size: 13px;">ไม่มีคลาสแล็บวันนี้</div>
          ` : todayPreps.map(p => `
            <div style="border-bottom: 1px solid #f1f5f9; padding: 10px 0;">
              <div style="font-weight: 700; color: #1e1b4b;"><i data-lucide="microscope" class="inline-icon"></i> ${escapeHtml(p.room)} (${p.timeSlot || p.slot})</div>
              <div style="font-size: 12px; color: #475569; margin-top: 2px;">
                การทดลอง: <strong>${escapeHtml(p.experimentName || p.purpose)}</strong> | ครู: ${escapeHtml(p.teacherName)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    return;
  }

  // 3. ADMIN VIEW (L3)
  if (currentRole === 'L3') {
    const totalInventoryValue = items.reduce((sum, it) => sum + (parseFloat(it.qty || 0) * (parseFloat(it.unitPrice || 120))), 0);

    roleContainer.innerHTML = `
      <div style="margin-top: 24px; padding-top: 20px; border-top: 2px dashed #e2e8f0;">
        <h2 style="font-size: 18px; font-weight: 800; color: #92400e; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">
          <span><i data-lucide="shield" class="inline-icon"></i> แดชบอร์ดผู้ดูแลระบบ (Admin Console)</span>
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 24px;">
          <div style="background: white; border-radius: 12px; padding: 18px; border: 1px solid #e2e8f0;">
            <span style="font-size: 12px; color: #64748b; font-weight: 600;">มูลค่าพัสดุในคลังรวม</span>
            <div style="font-size: 26px; font-weight: 800; color: #047857; margin-top: 4px;">฿${Math.round(totalInventoryValue).toLocaleString()}</div>
            <span style="font-size: 11px; color: #047857;">พัสดุทั้งหมด ${total} รายการ</span>
          </div>
          <div style="background: white; border-radius: 12px; padding: 18px; border: 1px solid #e2e8f0;">
            <span style="font-size: 12px; color: #64748b; font-weight: 600;">ผู้ใช้งานในระบบ</span>
            <div style="font-size: 26px; font-weight: 800; color: #3b82f6; margin-top: 4px;">14 คน</div>
            <span style="font-size: 11px; color: #3b82f6;">ครู, จนท. และแอดมิน</span>
          </div>
          <div style="background: white; border-radius: 12px; padding: 18px; border: 1px solid #e2e8f0;">
            <span style="font-size: 12px; color: #64748b; font-weight: 600;">คำขอจองห้องปฏิบัติการ</span>
            <div style="font-size: 26px; font-weight: 800; color: #d97706; margin-top: 4px;">${bookings.filter(b => b.status === 'approved').length} รายการ</div>
            <span style="font-size: 11px; color: #d97706;">อนุมัติแล้ว</span>
          </div>
        </div>
      </div>
    `;
    return;
  }

  // 4. EXECUTIVE VIEW (L4)
  const totalInventoryValue = items.reduce((sum, it) => sum + (parseFloat(it.qty || 0) * (parseFloat(it.unitPrice || 120))), 0);
  roleContainer.innerHTML = `
    <div style="margin-top: 24px; padding-top: 20px; border-top: 2px dashed #e2e8f0;">
      <h2 style="font-size: 18px; font-weight: 800; color: #581c87; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">
        <span><i data-lucide="briefcase" class="inline-icon"></i> แดชบอร์ดผู้บริหาร (Executive Insights)</span>
      </h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 24px;">
        <div style="background: white; border-radius: 12px; padding: 18px; border: 1px solid #e2e8f0;">
          <span style="font-size: 12px; color: #64748b; font-weight: 600;">อัตราการใช้ห้องปฏิบัติการ (Lab Utilization)</span>
          <div style="font-size: 28px; font-weight: 800; color: #4338ca; margin-top: 4px;">78%</div>
          <span style="font-size: 11px; color: #4338ca;">จากห้องปฏิบัติการทั้งหมด 8 ห้อง</span>
        </div>
        <div style="background: white; border-radius: 12px; padding: 18px; border: 1px solid #e2e8f0;">
          <span style="font-size: 12px; color: #64748b; font-weight: 600;">มูลค่าสินทรัพย์และเคมีภัณฑ์</span>
          <div style="font-size: 28px; font-weight: 800; color: #047857; margin-top: 4px;">฿${Math.round(totalInventoryValue).toLocaleString()}</div>
          <span style="font-size: 11px; color: #047857;">พร้อมใช้งานในการเรียนการสอน</span>
        </div>
        <div style="background: white; border-radius: 12px; padding: 18px; border: 1px solid #e2e8f0;">
          <span style="font-size: 12px; color: #64748b; font-weight: 600;">ประเด็นความปลอดภัย / อุบัติเหตุ</span>
          <div style="font-size: 28px; font-weight: 800; color: #10b981; margin-top: 4px;">0</div>
          <span style="font-size: 11px; color: #10b981;">ไม่มีอุบัติเหตุสารเคมีในรอบเดือน</span>
        </div>
      </div>
    </div>
  `;
}

// Tab switcher for dashboard alerts (urgent, overdue, damaged)
export function switchDashboardAlertTab(tabName) {
  const tabs = ['urgent', 'overdue', 'damaged'];
  tabs.forEach(t => {
    const tabEl = document.getElementById(`tab-${t}`);
    const btn = document.querySelector(`.alert-tab-btn[data-tab="${t}"]`);
    if (tabEl) {
      if (t === tabName) {
        tabEl.style.display = 'flex';
        tabEl.classList.add('active');
      } else {
        tabEl.style.display = 'none';
        tabEl.classList.remove('active');
      }
    }
    if (btn) {
      if (t === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  });
}

// Toggle User Role Menu Popover
export function toggleUserRoleMenu(event) {
  if (event) {
    if (event.target && event.target.closest('#btnSidebarLogoutQuick')) return;
    event.stopPropagation();
  }
  const popover = document.getElementById("userRolePopover");
  if (!popover) return;
  const isShown = popover.style.display === "flex";
  popover.style.display = isShown ? "none" : "flex";

  // Sync Popover user details
  const popoverName = document.getElementById("popoverUserName");
  const popoverRole = document.getElementById("popoverUserRole");
  const sidebarUserName = document.getElementById("sidebarUserName");
  const sidebarUserRoleBadge = document.getElementById("sidebarUserRoleBadge");
  if (popoverName && sidebarUserName) popoverName.innerText = sidebarUserName.innerText;
  if (popoverRole && sidebarUserRoleBadge) popoverRole.innerText = sidebarUserRoleBadge.innerText;
}

// Open Dedicated Role Dashboard from User Menu
export async function openRoleDashboard(roleLevel) {
  const popover = document.getElementById("userRolePopover");
  if (popover) popover.style.display = "none";
  if (typeof window !== 'undefined') {
    if (typeof window.navigateToPanel === 'function') {
      window.navigateToPanel('dashboard');
    }
  }
  await switchDashboardRole(roleLevel);
}

// Mount to window for global backwards compatibility
if (typeof window !== 'undefined') {
  window.updateDashboardMetrics = updateDashboardMetrics;
  window.switchDashboardRole = switchDashboardRole;
  window.switchDashboardAlertTab = switchDashboardAlertTab;
  window.toggleUserRoleMenu = toggleUserRoleMenu;
  window.openRoleDashboard = openRoleDashboard;
}

if (typeof document !== 'undefined') {
  document.addEventListener("click", (e) => {
    const popover = document.getElementById("userRolePopover");
    if (popover && popover.style.display === "flex") {
      if (!popover.contains(e.target) && !e.target.closest("#userSessionCard")) {
        popover.style.display = "none";
      }
    }
  });
}

