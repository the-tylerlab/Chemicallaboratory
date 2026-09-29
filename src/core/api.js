/**
 * @file api.js
 * @description Centralized API Client, Token Management, and Sync Services
 * Module: core/api
 */

// Base API URL Resolver (Supports port 3000 Express server, port 5500 Live Server, Vite, and production)
export function resolveApiBase() {
  if (typeof window !== "undefined" && window.location) {
    const { hostname, port, protocol } = window.location;
    if (port && port !== '3000') {
      return `${protocol}//${hostname}:3000/api`;
    }
    if (protocol === 'file:') {
      return 'http://localhost:3000/api';
    }
    return `${window.location.origin}/api`;
  }
  return "http://localhost:3000/api";
}

export const API_BASE = resolveApiBase();

// Direct Supabase Client (For instant frontend fallback if backend server is offline)
export const SUPABASE_URL = "https://avzneyaalenbyawfvykp.supabase.co";
export const SUPABASE_KEY = "sb_publishable_iqpHDJXb983_PwFSoSDV9w_kd2pvKoj";
let _supabaseClient = null;

export function getClientSupabase() {
  if (_supabaseClient) return _supabaseClient;
  if (typeof window !== "undefined" && window.supabase && typeof window.supabase.createClient === "function") {
    try {
      _supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      return _supabaseClient;
    } catch(e) {
      console.warn("Failed to init client Supabase:", e);
    }
  }
  return null;
}

// Google Sheets Webhook URL
export const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxMA_8zdAdniensdoPQx9XkhTVya4c-afMx2qz7adS3eHs5OlBpsEkbZGLXMac1taN8xw/exec";

// Token Management
export function getAuthToken() {
  if (typeof localStorage === 'undefined') return '';
  return localStorage.getItem("lab_auth_token") || '';
}

export function setAuthToken(token) {
  if (typeof localStorage === 'undefined') return;
  if (token) {
    localStorage.setItem("lab_auth_token", token);
  } else {
    localStorage.removeItem("lab_auth_token");
  }
}

// Authenticated Fetch Wrapper
export async function fetchWithAuth(url, options = {}) {
  const token = getAuthToken();
  const headers = { ...(options.headers || {}) };
  if (token && !headers['Authorization'] && !headers['authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    try {
      const data = await res.clone().json();
      if (token && data && (data.code === 'TOKEN_EXPIRED' || data.code === 'TOKEN_REVOKED')) {
        if (typeof window.performLogout === 'function') {
          window.performLogout(false);
          if (typeof window.showToast === 'function') {
            window.showToast('เซสชันการใช้งานหมดอายุ กรุณาเข้าสู่ระบบใหม่', 'warning');
          }
        }
      }
    } catch(e) {}
  }

  return res;
}

// Global fetch interceptor to automatically attach JWT token to all /api/ requests
if (typeof window !== "undefined" && window.fetch && !window.__FETCH_INTERCEPTOR_INSTALLED__) {
  window.__FETCH_INTERCEPTOR_INSTALLED__ = true;
  const _origFetch = window.fetch;
  window.fetch = function(resource, init) {
    let urlStr = typeof resource === 'string' ? resource : (resource && resource.url) ? resource.url : '';
    
    // Rewrite relative /api/ to API_BASE when accessed from port other than 3000 (e.g. Live Server 5500)
    if (urlStr.startsWith('/api') && API_BASE.startsWith('http') && !API_BASE.includes(window.location.host)) {
      urlStr = urlStr.replace(/^\/api/, API_BASE);
      if (typeof resource === 'string') {
        resource = urlStr;
      }
    }

    const token = getAuthToken();
    if (token && (urlStr.startsWith('/api') || urlStr.includes('/api/'))) {
      init = init || {};
      if (init.headers instanceof Headers) {
        if (!init.headers.has('Authorization')) {
          init.headers.set('Authorization', `Bearer ${token}`);
        }
      } else if (Array.isArray(init.headers)) {
        if (!init.headers.some(([k]) => k.toLowerCase() === 'authorization')) {
          init.headers.push(['Authorization', `Bearer ${token}`]);
        }
      } else {
        init.headers = { ...init.headers };
        if (!init.headers['Authorization'] && !init.headers['authorization']) {
          init.headers['Authorization'] = `Bearer ${token}`;
        }
      }
    }
    return _origFetch.call(this, resource, init);
  };
}

// Direct Google Sheets Synchronization Helper
export async function syncToGoogleSheetsDirect(sheetName, action, payload, keyField = 'code') {
  if (!GOOGLE_SCRIPT_URL) return;
  try {
    const body = {
      sheetName,
      action,
      data: payload,
      keyField,
      timestamp: new Date().toISOString()
    };
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (err) {
    console.warn(`[Sync Sheets Direct] Error syncing ${sheetName}:`, err.message);
  }
}

// Mount to window for global backwards compatibility
if (typeof window !== 'undefined') {
  window.API_BASE = API_BASE;
  window.getAuthToken = getAuthToken;
  window.setAuthToken = setAuthToken;
  window.fetchWithAuth = fetchWithAuth;
  window.syncToGoogleSheetsDirect = syncToGoogleSheetsDirect;
}
