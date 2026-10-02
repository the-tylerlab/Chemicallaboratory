/**
 * @file auth.js
 * @description Authentication Services (Login, Logout, Session Verification)
 * Module: auth/auth
 */

import { getAuthToken, setAuthToken, fetchWithAuth } from '../core/api.js';
import { state, setCurrentUser } from '../core/state.js';
import { normalizeInput } from '../core/utils.js';

// Check if user is currently logged in
export function isUserLoggedIn() {
  return state.userRole !== 'L0' && state.currentUser !== null;
}

// Check if user has administrator access
export function canAccessAdminSection() {
  const token = getAuthToken();
  const r = state.userRole;
  const isL3 = r === 'L3' || r === 'admin' || (state.currentUser && (state.currentUser.role === 'L3' || state.currentUser.role === 'admin'));
  return Boolean(isL3 && token);
}

export const SYSTEM_USERS_REGISTRY = [
  {
    id: "u_admin",
    teacherId: "admin",
    name: "อาจารย์ผู้ดูแลระบบ (Admin)",
    role: "L3",
    roleName: "Manager / System Manager",
    department: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
    assignedRooms: [],
    initials: "AD",
    color: "#7c3aed"
  },
  {
    id: "u_10823",
    teacherId: "10823",
    name: "ม.วงศกร ด้วงเกลี้ยง",
    role: "L3",
    roleName: "Manager / System Manager",
    department: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
    assignedRooms: [],
    initials: "วด",
    color: "#7c3aed"
  },
  {
    id: "u_10572",
    teacherId: "10572",
    name: "มิสพิชชาพร ประยูรอนุเทพ",
    role: "L3",
    roleName: "Manager / System Manager",
    department: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
    assignedRooms: [],
    initials: "พป",
    color: "#7c3aed"
  },
  {
    id: "u_4001",
    teacherId: "4001",
    name: "ผอ.เกียรติศักดิ์ วิสัยทัศน์กว้าง (ผู้บริหาร)",
    role: "L4",
    roleName: "Executive / Head of Department",
    department: "คณะกรรมการบริหารสถานศึกษา",
    assignedRooms: [],
    initials: "กว",
    color: "#be185d"
  },
  {
    id: "u_10568",
    teacherId: "10568",
    name: "ม.วสุรัตน์ สิริจำลองวงศ์",
    role: "L4",
    roleName: "Executive / Head of Department",
    department: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
    assignedRooms: [],
    initials: "วส",
    color: "#be185d"
  },
  {
    id: "u_2001",
    teacherId: "2001",
    name: "ม.ธนันกรกานต์ พิจารณา",
    role: "L2",
    roleName: "Staff / Operator",
    department: "งานบริการห้องปฏิบัติการวิทยาศาสตร์",
    assignedRooms: ["Lab 1", "Lab 6"],
    initials: "ธพ",
    color: "#ea580c"
  },
  {
    id: "u_2002",
    teacherId: "2002",
    name: "เจ้าหน้าที่นฤมล ดูแลแล็บฟิสิกส์-ชีวะ",
    role: "L2",
    roleName: "Staff / Operator",
    department: "งานบริการห้องปฏิบัติการวิทยาศาสตร์",
    assignedRooms: ["Lab 2", "Lab 3"],
    initials: "นด",
    color: "#ea580c"
  },
  {
    id: "u_10785",
    teacherId: "10785",
    name: "ม.เศรษฐกาญจน์ โศภลกัญจน์",
    role: "L2",
    roleName: "Staff / Operator",
    department: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
    assignedRooms: ["Lab 3"],
    initials: "ศก",
    color: "#ea580c"
  },
  {
    id: "u_10824",
    teacherId: "10824",
    name: "ม.พชร รัชประภาพงษ์",
    role: "L2",
    roleName: "Staff / Operator",
    department: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
    assignedRooms: ["Lab 2"],
    initials: "พร",
    color: "#ea580c"
  },
  {
    id: "u_1001",
    teacherId: "1001",
    name: "ครูสมชาย รักการสอน",
    role: "L1",
    roleName: "Teacher / User",
    department: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี (สาขาเคมี)",
    assignedRooms: [],
    initials: "สร",
    color: "#0284c7"
  },
  {
    id: "u_1002",
    teacherId: "1002",
    name: "ครูวิภาดา ใฝ่รู้",
    role: "L1",
    roleName: "Teacher / User",
    department: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี (สาขาฟิสิกส์)",
    assignedRooms: [],
    initials: "วฝ",
    color: "#0284c7"
  },
  {
    id: "u_10746",
    teacherId: "10746",
    name: "ม.สุวรรณ ชิดประสงค์",
    role: "L1",
    roleName: "Teacher / User",
    department: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
    assignedRooms: [],
    initials: "สช",
    color: "#0284c7"
  },
  {
    id: "u_10797",
    teacherId: "10797",
    name: "ม.ธนันกรกานต์ พิจารณา",
    role: "L1",
    roleName: "Teacher / User",
    department: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
    assignedRooms: [],
    initials: "ธพ",
    color: "#0284c7"
  }
];

// Perform login strictly with backend API (Strict Zero Trust & Cryptographic Enforcement)
export async function login(username, password) {
  const normUser = normalizeInput(username);
  const normPass = normalizeInput(password);

  if (!normUser || !normPass) {
    throw new Error('กรุณากรอกรหัสประจำตัวครูและรหัสผ่าน');
  }

  // 1. Authenticate exclusively with backend API
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: normUser, password: normPass })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.user && data.token) {
        setAuthToken(data.token);
        setCurrentUser(data.user, data.token);
        if (typeof window.updateLoginUI === 'function') {
          window.updateLoginUI();
        }
        return data;
      }
    } else {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'รหัสประจำตัวครูหรือรหัสผ่านไม่ถูกต้อง');
    }
  } catch (err) {
    if (err.message && (err.message.includes('fetch') || err.message.includes('Failed') || err.message.includes('NetworkError'))) {
      throw new Error('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อยืนยันตัวตนได้ กรุณาตรวจสอบการเชื่อมต่อเครือข่าย');
    }
    throw err;
  }

  throw new Error('รหัสประจำตัวครูหรือรหัสผ่านไม่ถูกต้อง');
}

// Perform logout
export async function logout(notify = true) {
  const token = getAuthToken();
  if (token) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (e) {}
  }

  setAuthToken(null);
  setCurrentUser(null);

  if (typeof window !== 'undefined' && typeof window.closeUserProfileModal === 'function') {
    window.closeUserProfileModal();
  }

  // Clear sensitive local storage and purge legacy auth keys
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("lab_saved_credentials");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userRole");
    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("userRoleLevel");
  }

  if (notify && typeof window !== 'undefined' && typeof window.showToast === 'function') {
    window.showToast("ออกจากระบบเรียบร้อยแล้ว", "info");
  }

  if (typeof window !== 'undefined' && typeof window.updateLoginUI === 'function') {
    window.updateLoginUI();
  }

  if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
}

// Verify active session with backend /api/auth/me
export async function verifySession() {
  const token = getAuthToken();
  if (!token) {
    if (state.currentUser) {
      logout(false);
    }
    return null;
  }

  try {
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.user) {
        setCurrentUser(data.user, token);
        if (typeof window !== 'undefined' && typeof window.updateLoginUI === 'function') {
          window.updateLoginUI();
        }
        return data.user;
      }
    } else if (res.status === 401) {
      console.warn("Session token expired or revoked, logging out");
      logout(false);
    }
  } catch (err) {
    console.warn("Could not verify session with backend:", err.message);
  }
  return null;
}

// Change Password Function
export async function changePassword(currentPassword, newPassword, confirmPassword) {
  const token = getAuthToken();
  if (!token) throw new Error('กรุณาเข้าสู่ระบบก่อนเปลี่ยนรหัสผ่าน');

  const res = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
  }

  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
}

// Backward-compatible alias
export const restoreAndVerifySession = verifySession;

// Mount to window for global backwards compatibility
if (typeof window !== 'undefined') {
  window.isUserLoggedIn = isUserLoggedIn;
  window.canAccessAdminSection = canAccessAdminSection;
  window.performLogout = logout;
  window.verifySession = verifySession;
  window.restoreAndVerifySession = restoreAndVerifySession;
  window.labLogin = login;
  window.changePassword = changePassword;
}
