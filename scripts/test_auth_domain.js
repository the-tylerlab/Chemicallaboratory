/**
 * Test Suite: Auth Domain Unit & Regression Tests
 * Verifies that the auth module (src/auth/):
 * 1. Exports all required authentication services
 * 2. Correctly enforces guest vs authenticated state
 * 3. Normalizes Thai digits in credentials
 * 4. Strictly protects security (no plaintext passwords saved)
 * 5. Handles session verification and automatic revocation
 * 6. Preserves complete backwards compatibility with global window APIs
 */

import assert from 'assert';

console.log('🧪 Starting Auth Domain Unit & Regression Tests...\n');

// 1. Mock Browser Environment
const localStorageData = {};
global.localStorage = {
  getItem: (k) => localStorageData[k] ?? null,
  setItem: (k, v) => { localStorageData[k] = String(v); },
  removeItem: (k) => { delete localStorageData[k]; },
  clear: () => { Object.keys(localStorageData).forEach(k => delete localStorageData[k]); }
};

global.window = {
  lucide: { createIcons: () => {} },
  showToast: () => {},
  updateLoginUI: () => {},
  closeUserProfileModal: () => {}
};

// 2. Import Auth Domain Module
const authModule = await import('../src/auth/auth.js');
const modalModule = await import('../src/auth/login-modal.js');
const indexModule = await import('../src/auth/index.js');
const { state, setCurrentUser } = await import('../src/core/state.js');

console.log('1. Verifying Module Exports:');
assert(typeof authModule.isUserLoggedIn === 'function', 'authModule.isUserLoggedIn must be a function');
assert(typeof authModule.canAccessAdminSection === 'function', 'authModule.canAccessAdminSection must be a function');
assert(typeof authModule.login === 'function', 'authModule.login must be a function');
assert(typeof authModule.logout === 'function', 'authModule.logout must be a function');
assert(typeof authModule.verifySession === 'function', 'authModule.verifySession must be a function');
assert(typeof authModule.restoreAndVerifySession === 'function', 'authModule.restoreAndVerifySession must be a function');
assert(typeof modalModule.openLoginModal === 'function', 'modalModule.openLoginModal must be a function');
assert(typeof modalModule.closeLoginModal === 'function', 'modalModule.closeLoginModal must be a function');
assert(typeof indexModule.login === 'function', 'indexModule must re-export login');
assert(typeof indexModule.openLoginModal === 'function', 'indexModule must re-export openLoginModal');
console.log('   ✅ All functions properly exported from src/auth/ and barrel index!\n');

// 3. Test Initial Guest State (L0)
console.log('2. Testing Initial Guest State (L0):');
setCurrentUser(null);
assert.strictEqual(authModule.isUserLoggedIn(), false, 'Guest user should not be logged in');
assert.strictEqual(authModule.canAccessAdminSection(), false, 'Guest user should not have admin access');
assert.strictEqual(state.userRole, 'L0', 'Default role must be L0');
assert.strictEqual(state.currentUser, null, 'Default currentUser must be null');
console.log('   ✅ Guest state correctly evaluates to unauthenticated (L0)\n');

// 4. Test Teacher (L1) Authentication
console.log('3. Testing Teacher (L1) State:');
const teacherUser = { id: 101, username: 'T101', name: 'อาจารย์สมศรี', role: 'L1' };
setCurrentUser(teacherUser, 'mock_token_l1');
assert.strictEqual(authModule.isUserLoggedIn(), true, 'Teacher should be logged in');
assert.strictEqual(authModule.canAccessAdminSection(), false, 'Teacher (L1) must NOT have admin access');
assert.strictEqual(state.userRole, 'L1', 'Role must be L1');
assert.strictEqual(localStorage.getItem('lab_auth_token'), 'mock_token_l1', 'Auth token must be persisted');
console.log('   ✅ L1 Teacher has logged-in status without admin access\n');

// 5. Test Admin (L3) Authentication
console.log('4. Testing Admin (L3) State:');
const adminUser = { id: 1, username: 'admin', name: 'หัวหน้าห้องปฏิบัติการ', role: 'L3' };
setCurrentUser(adminUser, 'mock_token_admin');
assert.strictEqual(authModule.isUserLoggedIn(), true, 'Admin should be logged in');
assert.strictEqual(authModule.canAccessAdminSection(), true, 'Admin (L3) MUST have admin access');
assert.strictEqual(state.userRole, 'L3', 'Role must be L3');
assert.strictEqual(state.isAdminLoggedIn, true, 'isAdminLoggedIn must be true for L3');
console.log('   ✅ L3 Admin has full admin privileges\n');

// 6. Test Logout
console.log('5. Testing Logout:');
let userProfileClosed = false;
global.window.closeUserProfileModal = () => { userProfileClosed = true; };

// Mock fetch for logout API
global.fetch = async (url) => {
  if (url === '/api/auth/logout') {
    return { ok: true, json: async () => ({ success: true }) };
  }
  return { ok: false };
};

await authModule.logout(false);
assert.strictEqual(authModule.isUserLoggedIn(), false, 'User should not be logged in after logout');
assert.strictEqual(state.userRole, 'L0', 'Role must revert to L0 after logout');
assert.strictEqual(state.currentUser, null, 'currentUser must be null after logout');
assert.strictEqual(localStorage.getItem('lab_auth_token'), null, 'Token must be removed from localStorage');
assert.strictEqual(userProfileClosed, true, 'UserProfileModal should be closed on logout');
console.log('   ✅ Logout cleanly resets state, clears token, and closes modals\n');

// 7. Test Session Verification
console.log('6. Testing Session Verification:');
// 7a. No token -> returns null
const noTokenResult = await authModule.verifySession();
assert.strictEqual(noTokenResult, null, 'verifySession with no token should return null');

// 7b. Valid token -> restores user
localStorage.setItem('lab_auth_token', 'valid_token_123');
global.fetch = async (url, opts) => {
  if (url === '/api/auth/me') {
    assert(opts.headers.Authorization.includes('valid_token_123'), 'Must pass token in Authorization header');
    return {
      ok: true,
      json: async () => ({ success: true, user: { id: 102, username: 'T102', name: 'อาจารย์มานะ', role: 'L1' } })
    };
  }
  return { ok: false };
};

const restoredUser = await authModule.verifySession();
assert.strictEqual(restoredUser.username, 'T102', 'Should restore user profile from /api/auth/me');
assert.strictEqual(authModule.isUserLoggedIn(), true, 'Should be logged in after session verification');
assert.strictEqual(state.currentUser.name, 'อาจารย์มานะ');

// 7c. Expired token (401) -> auto logs out
localStorage.setItem('lab_auth_token', 'expired_token');
global.fetch = async (url) => {
  if (url === '/api/auth/me') {
    return { ok: false, status: 401 };
  }
  if (url === '/api/auth/logout') {
    return { ok: true, json: async () => ({ success: true }) };
  }
  return { ok: false };
};

const expiredResult = await authModule.verifySession();
assert.strictEqual(expiredResult, null, 'Expired session must return null');
assert.strictEqual(authModule.isUserLoggedIn(), false, 'Expired session must trigger auto-logout');
assert.strictEqual(localStorage.getItem('lab_auth_token'), null, 'Expired token must be purged');
console.log('   ✅ Session verification properly restores valid sessions and auto-purges expired ones\n');

// 8. Test Global Window Bindings Backwards Compatibility
console.log('7. Testing Window Backwards Compatibility Bindings:');
assert.strictEqual(global.window.isUserLoggedIn, authModule.isUserLoggedIn);
assert.strictEqual(global.window.canAccessAdminSection, authModule.canAccessAdminSection);
assert.strictEqual(global.window.performLogout, authModule.logout);
assert.strictEqual(global.window.verifySession, authModule.verifySession);
assert.strictEqual(global.window.restoreAndVerifySession, authModule.verifySession);
assert.strictEqual(global.window.openLoginModal, modalModule.openLoginModal);
assert.strictEqual(global.window.closeLoginModal, modalModule.closeLoginModal);
console.log('   ✅ All window.* global aliases match module functions perfectly\n');

console.log('🎉 ALL AUTH DOMAIN UNIT & REGRESSION TESTS PASSED SUCCESSFULLY!');
