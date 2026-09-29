/**
 * @file utils.js
 * @description General Utility Helpers (Thai typography, formatters, strings)
 * Module: core/utils
 */

// Thai digits to Arabic digits converter
export function normalizeInput(str) {
  if (!str) return '';
  const thai = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  return String(str).trim().replace(/[๐-๙]/g, ch => {
    const idx = thai.indexOf(ch);
    return idx !== -1 ? idx : ch;
  });
}

// Currency formatting (THB)
export function formatCurrency(val) {
  const num = parseFloat(val);
  if (isNaN(num)) return "0.00";
  return num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Date formatting
export function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch (e) {
    return dateStr;
  }
}

export function formatDateTime(dateStr) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (e) {
    return dateStr;
  }
}

// User initials generator with comprehensive Thai consonant title-stripping
export function getUserInitials(name, fallback = "U") {
  if (!name || typeof name !== 'string') return fallback || 'U';

  let cleanName = name.trim();
  const titlePrefixes = [
    /^อาจารย์ผู้ดูแลระบบ/i,
    /^ผู้ดูแลระบบ/i,
    /^แอดมิน/i,
    /^Admin/i,
    /^ผอ\.\s*/i,
    /^เจ้าหน้าที่\s*/i,
    /^จนท\.\s*/i,
    /^ผศ\.ดร\.\s*/i,
    /^ผศ\.\s*/i,
    /^รศ\.ดร\.\s*/i,
    /^รศ\.\s*/i,
    /^ศ\.ดร\.\s*/i,
    /^ศ\.\s*/i,
    /^ดร\.\s*/i,
    /^อาจารย์\s*/i,
    /^อ\.\s*/i,
    /^ภราดา\s*/i,
    /^บราเดอร์\s*/i,
    /^ซิสเตอร์\s*/i,
    /^เซอร์\s*/i,
    /^มาสเตอร์\s*/i,
    /^มัสเตอร์\s*/i,
    /^มิส(?:\.|\s+|$)/i,
    /^มิส/i,
    /^ม\.(?:\s+|$)?/i,
    /^ม\s+/i,
    /^ครู\s*/i,
    /^นางสาว\s*/i,
    /^น\.ส\.\s*/i,
    /^นส\.\s*/i,
    /^นาง\s*/i,
    /^นาย\s*/i,
    /^คุณ\s*/i,
    /^Mr\.\s*/i,
    /^Mrs\.\s*/i,
    /^Ms\.\s*/i,
    /^Miss\s*/i,
    /^Master\s*/i,
    /^Dr\.\s*/i,
    /^Prof\.\s*/i
  ];

  let matched = true;
  while (matched) {
    matched = false;
    for (const prefix of titlePrefixes) {
      if (prefix.test(cleanName)) {
        cleanName = cleanName.replace(prefix, '').trim();
        matched = true;
        break;
      }
    }
  }

  if (cleanName.includes("ผู้ดูแลระบบ") || cleanName.toLowerCase().includes("admin")) {
    return "AD";
  }

  const parts = cleanName.split(/\s+/).filter(Boolean);
  const leadingVowels = ['เ', 'แ', 'โ', 'ใ', 'ไ'];
  const thaiMarks = /[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/g;

  const getInitialConsonant = (word) => {
    if (!word) return '';
    const rawChars = Array.from(word);
    if (leadingVowels.includes(rawChars[0]) && rawChars.length > 1) {
      const base = rawChars[1].replace(thaiMarks, '');
      return base || rawChars[1];
    }
    const base = rawChars[0].replace(thaiMarks, '');
    return base || rawChars[0];
  };

  if (parts.length >= 2) {
    const firstChar = getInitialConsonant(parts[0]);
    const lastChar = getInitialConsonant(parts[parts.length - 1]);
    return (firstChar + lastChar).toUpperCase();
  } else if (parts.length === 1) {
    const word = parts[0];
    const pureLetters = Array.from(word.replace(thaiMarks, '')).filter(c => !leadingVowels.includes(c));
    if (pureLetters.length >= 2) {
      return (pureLetters[0] + pureLetters[1]).toUpperCase();
    }
    return word.substring(0, 2).toUpperCase();
  }

  return fallback || 'U';
}

export const calculateUserInitials = getUserInitials;

// Room Identifier Normalization
export function normalizeRoomIdentifier(room) {
  if (!room) return "";
  const str = String(room).toLowerCase().trim();
  const m = str.match(/(?:lab|ห้องปฏิบัติการ|ห้องแล็บ|ห้องแลป|ห้องทดลอง|ห้อง)\s*([0-9]+|[a-z]+)/i);
  if (m) {
    return `lab_${m[1]}`;
  }
  return str.replace(/\s+/g, '_');
}

export function isRoomMatching(roomA, roomB) {
  if (!roomA || !roomB) return false;
  if (roomA === roomB) return true;
  const normA = normalizeRoomIdentifier(roomA);
  const normB = normalizeRoomIdentifier(roomB);
  if (normA && normB && normA === normB) return true;
  const strA = String(roomA).toLowerCase().trim();
  const strB = String(roomB).toLowerCase().trim();
  return strA.includes(strB) || strB.includes(strA);
}

// HTML escape helper
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Debounce helper
export function debounce(fn, waitMs) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), waitMs);
  };
}
// Role color helper
export function getRoleColor(role) {
  const map = {
    'Student': '#3b82f6',
    'Teacher': '#10b981',
    'Staff': '#f59e0b',
    'Admin': '#ef4444',
    'Executive': '#8b5cf6'
  };
  return map[role] || '#64748b';
}

// Mount to window for global backwards compatibility
if (typeof window !== 'undefined') {
  window.formatCurrency = formatCurrency;
  window.formatDate = formatDate;
  window.formatDateTime = formatDateTime;
  window.getUserInitials = getUserInitials;
  window.calculateUserInitials = calculateUserInitials;
  window.normalizeRoomIdentifier = normalizeRoomIdentifier;
  window.isRoomMatching = isRoomMatching;
}
