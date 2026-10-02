/**
 * @file users.js
 * @description User Management, Roles Assignment, Directory & Batch Import
 * Module: users/users
 */

import { fetchWithAuth, API_BASE, syncToGoogleSheetsDirect } from '../core/api.js';
import { state } from '../core/state.js';
import { getUserInitials, escapeHtml } from '../core/utils.js';
import { getCurrentRoleLevel, getRoleColor } from '../rbac/rbac.js';

let adminUsersList = [];

// Fetch users from API (sanitized directory for non-admins, full data for L3 admin)
export async function fetchUsers() {
  try {
    const res = await fetchWithAuth(`${API_BASE}/users`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        adminUsersList = data;
        renderUsersTable();
        return data;
      }
    }
  } catch (err) {
    console.warn("[Users] Could not fetch users:", err.message);
  }

  try {
    const local = localStorage.getItem("lab_admin_users");
    if (local) {
      adminUsersList = JSON.parse(local);
    }
  } catch (e) {}

  if (!adminUsersList || adminUsersList.length === 0) {
    if (typeof window !== 'undefined' && window.SYSTEM_USERS_REGISTRY) {
      adminUsersList = [...window.SYSTEM_USERS_REGISTRY];
    }
  }

  renderUsersTable();
  return adminUsersList;
}

// Create new user (L3 Admin only, backend handles bcrypt hashing)
export async function createUser(userData) {
  const role = getCurrentRoleLevel();
  if (role !== 'L3') {
    throw new Error('เฉพาะผู้ดูแลระบบ (L3 Admin) เท่านั้นที่สามารถเพิ่มผู้ใช้ได้');
  }

  const res = await fetchWithAuth(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'ไม่สามารถเพิ่มผู้ใช้ได้');
  }

  const created = await res.json();
  adminUsersList.push(created);
  renderUsersTable();
  return created;
}

// Update user role or assigned rooms
export async function updateUser(userId, updateFields) {
  const role = getCurrentRoleLevel();
  if (role !== 'L3') {
    throw new Error('เฉพาะผู้ดูแลระบบ (L3 Admin) เท่านั้นที่สามารถแก้ไขสิทธิ์ผู้ใช้ได้');
  }

  const res = await fetchWithAuth(`${API_BASE}/users/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateFields)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'ไม่สามารถแก้ไขข้อมูลผู้ใช้ได้');
  }

  const updated = await res.json();
  const idx = adminUsersList.findIndex(u => u.id === userId || u.teacherId === userId);
  if (idx !== -1) {
    adminUsersList[idx] = { ...adminUsersList[idx], ...updated };
    renderUsersTable();
  }
  return updated;
}

// Delete user
export async function deleteUser(userId) {
  const role = getCurrentRoleLevel();
  if (role !== 'L3') {
    throw new Error('เฉพาะผู้ดูแลระบบ (L3 Admin) เท่านั้นที่สามารถลบผู้ใช้ได้');
  }

  const res = await fetchWithAuth(`${API_BASE}/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE'
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'ไม่สามารถลบผู้ใช้ได้');
  }

  adminUsersList = adminUsersList.filter(u => u.id !== userId && u.teacherId !== userId);
  renderUsersTable();
  return true;
}

// Render Admin Users Management Table
export function renderUsersTable() {
  const tableBody = document.getElementById("adminUsersTableBody");
  if (!tableBody) return;

  if (adminUsersList.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 30px; color: #94a3b8;">
          ไม่พบข้อมูลผู้ใช้งาน
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = adminUsersList.map(u => {
    const tId = escapeHtml(u.teacherId || u.id);
    const name = escapeHtml(u.name);
    const r = escapeHtml(u.role || 'L1');
    const rName = escapeHtml(u.roleName || 'Teacher');
    const color = getRoleColor(r);
    const rooms = Array.isArray(u.assignedRooms) ? u.assignedRooms.join(', ') : (u.assignedRooms || '-');

    const pass = escapeHtml(u.display_password || u.plain_password || u.teacherId || '');

    return `
      <tr>
        <td style="font-family: monospace; font-size: 13px; font-weight: 600;">${tId}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background: ${color}; color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700;">
              ${getUserInitials(u.name)}
            </div>
            <span style="font-weight: 600; color: #1e293b;">${name}</span>
          </div>
        </td>
        <td>
          <span style="display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; background: ${color}15; color: ${color};">
            ${r} - ${rName}
          </span>
        </td>
        <td><span style="font-size: 12px; color: #64748b;">${escapeHtml(rooms)}</span></td>
        <td><span style="font-size: 12px; color: #64748b;">${escapeHtml(u.department || '-')}</span></td>
        <td>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="user-pass-val" id="mod-user-pass-${tId}" data-pass="${pass}" style="font-family: monospace; font-size: 12px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 6px; border-radius: 4px; color: #475569;">••••••••</span>
            <button type="button" onclick="if(window.toggleAdminUserPassEye) toggleAdminUserPassEye('${tId}');" style="background: none; border: none; cursor: pointer; padding: 2px; color: #64748b;" title="แสดง/ซ่อนรหัสผ่าน">
              <i data-lucide="eye" style="width: 13px; height: 13px;"></i>
            </button>
            <button type="button" onclick="if(window.copyAdminUserPass) copyAdminUserPass('${pass}');" style="background: none; border: none; cursor: pointer; padding: 2px; color: #64748b;" title="คัดลอกรหัสผ่าน">
              <i data-lucide="copy" style="width: 13px; height: 13px;"></i>
            </button>
          </div>
        </td>
        <td style="text-align: right; white-space: nowrap;">
          <button class="action-btn" title="แก้ไขสิทธิ์" onclick="openEditUserModal('${tId}')">
            <i data-lucide="edit-2" style="width: 14px; height: 14px;"></i>
          </button>
          <button class="action-btn" style="color: #c2410c;" title="รีเซ็ตรหัสผ่าน" onclick="if(window.quickResetUserPassword) quickResetUserPassword('${u.id || tId}');">
            <i data-lucide="key-round" style="width: 14px; height: 14px;"></i>
          </button>
          <button class="action-btn" style="color: #ef4444;" title="ลบผู้ใช้" onclick="confirmDeleteUser('${tId}', '${name}')">
            <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

// Mount to window for global backwards compatibility
if (typeof window !== 'undefined') {
  window.fetchUsers = fetchUsers;
  window.createUser = createUser;
  window.updateUser = updateUser;
  window.deleteUser = deleteUser;
  window.renderUsersTable = renderUsersTable;
}
