/**
 * @file notifications.js
 * @description Toast Engine, Announcement Ticker & Web Push Notifications
 * Module: notifications/notifications
 */

import { fetchWithAuth, API_BASE } from '../core/api.js';
import { getCurrentRoleLevel } from '../rbac/rbac.js';

// Central Toast Notification Engine
export function showToast(message, type = 'info', duration = 3500) {
  let toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toastContainer";
    toastContainer.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
      max-width: 420px;
      width: calc(100vw - 48px);
    `;
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = `custom-toast toast-${type}`;
  toast.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 18px;
    border-radius: 10px;
    background: #ffffff;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    border-left: 4px solid ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : type === 'error' ? '#ef4444' : '#6366f1'};
    pointer-events: auto;
    font-size: 13.5px;
    color: #1e293b;
    font-weight: 500;
    line-height: 1.4;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    transform: translateY(20px);
    opacity: 0;
  `;

  const iconName = type === 'success' ? 'check-circle' :
                   type === 'warning' ? 'alert-triangle' :
                   type === 'error' ? 'alert-circle' : 'info';
  const iconColor = type === 'success' ? '#10b981' :
                    type === 'warning' ? '#f59e0b' :
                    type === 'error' ? '#ef4444' : '#6366f1';

  toast.innerHTML = `
    <div style="flex-shrink: 0; color: ${iconColor}; display: flex; align-items: center;">
      <i data-lucide="${iconName}" style="width: 18px; height: 18px;"></i>
    </div>
    <div style="flex: 1; word-break: break-word;">${message}</div>
    <button type="button" style="background: none; border: none; padding: 4px; color: #94a3b8; cursor: pointer; flex-shrink: 0;" onclick="this.parentElement.remove()">
      <i data-lucide="x" style="width: 14px; height: 14px;"></i>
    </button>
  `;

  toastContainer.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  // Entrance animation
  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  });

  // Auto dismiss
  setTimeout(() => {
    toast.style.transform = 'translateY(20px)';
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 300);
  }, duration);
}

// Fetch announcements
export async function fetchAnnouncements() {
  try {
    const res = await fetch(`${API_BASE}/announcements`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.text) {
        const ticker = document.getElementById("announcementTickerText");
        if (ticker) ticker.innerText = data.text;
        return data;
      }
    }
  } catch (e) {}
}

// Update announcement text (L3 Admin only)
export async function updateAnnouncement(text) {
  const role = getCurrentRoleLevel();
  if (role !== 'L3') {
    throw new Error('เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถแก้ไขข้อความประกาศได้');
  }

  const res = await fetchWithAuth(`${API_BASE}/announcements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, updatedAt: new Date().toISOString() })
  });

  if (!res.ok) throw new Error('ไม่สามารถบันทึกข้อความประกาศได้');

  const ticker = document.getElementById("announcementTickerText");
  if (ticker) ticker.innerText = text;
  return true;
}

// Mount to window for global backwards compatibility
if (typeof window !== 'undefined') {
  window.showToast = showToast;
  window.fetchAnnouncements = fetchAnnouncements;
  window.updateAnnouncement = updateAnnouncement;
}
