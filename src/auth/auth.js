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

// Perform login with backend API
export async function login(username, password) {
  const normUser = normalizeInput(username);
  const normPass = normalizeInput(password);

  if (!normUser || !normPass) {
    throw new Error('กรุณากรอกรหัสประจำตัวครูและรหัสผ่าน');
  }

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: normUser, password: normPass })
  });

  const data = await res.json();
  if (res.ok && data.success && data.user && data.token) {
    setAuthToken(data.token);
    setCurrentUser(data.user, data.token);
    if (typeof window.updateLoginUI === 'function') {
      window.updateLoginUI();
    }
    return data;
  } else {
    throw new Error(data.message || 'รหัสประจำตัวครูหรือรหัสผ่านไม่ถูกต้อง');
  }
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
