/**
 * @file rbac.js
 * @description Role-Based Access Control (RBAC) & Permission Guards
 * Module: rbac/rbac
 */

import { state } from '../core/state.js';
import { isRoomMatching } from '../core/utils.js';

// Available Role Definitions
export const ROLES = {
  L0: { id: 'L0', name: 'Guest / Public', label: 'ผู้เข้าชมทั่วไป', level: 0 },
  L1: { id: 'L1', name: 'Teacher / User', label: 'ครูผู้สอน', level: 1 },
  L2: { id: 'L2', name: 'Staff / Operator', label: 'เจ้าหน้าที่ห้องแล็บ', level: 2 },
  L3: { id: 'L3', name: 'Manager / System Manager', label: 'ผู้ดูแลระบบ', level: 3 },
  L4: { id: 'L4', name: 'Executive / Head of Dept', label: 'หัวหน้ากลุ่มสาระฯ / ผู้บริหาร', level: 4 }
};

// Normalize role string into canonical level (L0, L1, L2, L3, L4)
export function normalizeRole(role) {
  if (!role) return 'L0';
  const r = String(role).trim().toUpperCase();
  if (r.startsWith('L') && ['L0', 'L1', 'L2', 'L3', 'L4'].includes(r)) return r;
  if (r === 'ADMIN' || r === 'MANAGER' || r.includes('ผู้ดูแล')) return 'L3';
  if (r === 'STAFF' || r === 'OPERATOR' || r.includes('เจ้าหน้าที่')) return 'L2';
  if (r === 'TEACHER' || r === 'USER' || r.includes('ครู')) return 'L1';
  if (r === 'EXECUTIVE' || r.includes('ผู้บริหาร') || r.includes('หัวหน้า')) return 'L4';
  return 'L0';
}

// Get current logged-in role
export function getCurrentRoleLevel() {
  if (state.currentUser && state.currentUser.role) {
    return normalizeRole(state.currentUser.role);
  }
  return normalizeRole(state.userRole || 'L0');
}

// Check if user has permission to manage a specific laboratory room
export function canUserAccessRoom(user, room) {
  if (!user) return false;
  const role = normalizeRole(user.role || user.roleLevel);

  // L3 Admin and L4 Executive have unrestricted access to all rooms
  if (role === 'L3' || role === 'L4') return true;

  // L2 Staff can access ONLY explicitly assigned rooms. Empty or missing assignedRooms = NO PERMISSION.
  if (role === 'L2') {
    if (!room || String(room).trim() === '') return false;
    let assigned = user.assignedRooms;
    if (typeof assigned === 'string' && assigned.trim()) {
      assigned = assigned.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
    }
    if (!Array.isArray(assigned) || assigned.length === 0) return false;
    return assigned.some(r => isRoomMatching(r, room));
  }

  // L0 Guest and L1 Teacher do not have item management rights
  return false;
}

// Role Badge UI metadata helper
export function getRoleBadgeInfo(role) {
  const norm = normalizeRole(role);
  switch (norm) {
    case 'L4':
      return { level: 'L4', name: 'Executive', full: 'ผู้บริหาร / หัวหน้ากลุ่มสาระฯ (L4)', bg: '#e5e4ff', text: '#5758e8', border: '#c2c0f7' };
    case 'L3':
      return { level: 'L3', name: 'Manager / Admin', full: 'อาจารย์ผู้ดูแลระบบ (L3)', bg: '#f1f0ff', text: '#716de3', border: '#d8d6fb' };
    case 'L2':
      return { level: 'L2', name: 'Staff', full: 'เจ้าหน้าที่ห้องแล็บ (L2)', bg: '#fff3f1', text: '#b85e50', border: '#f6c5bc' };
    case 'L1':
      return { level: 'L1', name: 'Teacher', full: 'ครูผู้สอน (L1)', bg: '#f0fbfd', text: '#438fa9', border: '#b8e8f5' };
    default:
      return { level: 'L0', name: 'Guest', full: 'ผู้เข้าชมทั่วไป (L0)', bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
  }
}

// Role Color helper
export function getRoleColor(role) {
  const norm = normalizeRole(role);
  switch (norm) {
    case 'L4': return '#5758e8';
    case 'L3': return '#9996f2';
    case 'L2': return '#f39b8d';
    case 'L1': return '#68c8e5';
    default:   return '#64748b';
  }
}

// Panel Access Guard (Client-side routing guard)
export function checkPanelAccess(panelId) {
  const currentRole = getCurrentRoleLevel();
  const isLoggedIn = currentRole !== 'L0';

  // L3 Admin strictly required
  if (panelId === 'panel-admin') {
    return currentRole === 'L3';
  }

  // Logged-in user strictly required (Teacher, Staff, Admin, Executive)
  if (['panel-add-item', 'panel-borrow', 'panel-purchase-orders'].includes(panelId)) {
    return isLoggedIn;
  }

  // Public panels (accessible by L0 Guest)
  return true;
}

// Mount to window for global backwards compatibility
if (typeof window !== 'undefined') {
  window.normalizeRole = normalizeRole;
  window.getCurrentRoleLevel = getCurrentRoleLevel;
  window.canUserAccessRoom = canUserAccessRoom;
  window.getRoleBadgeInfo = getRoleBadgeInfo;
  window.getRoleColor = getRoleColor;
  window.checkPanelAccess = checkPanelAccess;
}
