/**
 * @file login-modal.js
 * @description Login Modal Dialog & User Interface Handlers
 * Module: auth/login-modal
 */

import { login, logout, isUserLoggedIn } from './auth.js';
import { state } from '../core/state.js';
import { normalizeInput } from '../core/utils.js';

// Open Login Modal
export function openLoginModal() {
  const loginModal = document.getElementById("loginModal");
  if (loginModal) {
    loginModal.classList.add("active");
    const usernameInput = document.getElementById("loginUsername");
    const loginPasswordInput = document.getElementById("loginPassword");
    const rememberCheckbox = document.getElementById("loginRememberMe");
    const errorMsg = document.getElementById("loginErrorMsg");
    if (errorMsg) errorMsg.style.display = "none";

    let hasLoaded = false;
    try {
      const savedUser = localStorage.getItem("lab_remembered_username");
      if (savedUser) {
        if (usernameInput) usernameInput.value = savedUser;
        if (rememberCheckbox) rememberCheckbox.checked = true;
        hasLoaded = true;
      }
    } catch (e) {}

    if (!hasLoaded) {
      if (usernameInput) usernameInput.value = "";
      if (rememberCheckbox) rememberCheckbox.checked = false;
    }

    // Always clear password input on open — never persist plaintext passwords
    if (loginPasswordInput) loginPasswordInput.value = "";

    if (typeof window.applyLoginBannerUI === "function") {
      window.applyLoginBannerUI();
    }

    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      if (usernameInput) {
        if (usernameInput.value && loginPasswordInput) {
          loginPasswordInput.focus();
        } else {
          usernameInput.focus();
        }
      }
    }, 60);
  }
}

// Close Login Modal
export function closeLoginModal() {
  const loginModal = document.getElementById("loginModal");
  if (loginModal) loginModal.classList.remove("active");
}

// Forgot Password Dialog
export function handleForgotPasswordClick() {
  if (typeof Swal !== "undefined") {
    Swal.fire({
      icon: "info",
      title: "ลืมรหัสผ่าน?",
      html: `
        <div style="font-size: 13.5px; line-height: 1.6; color: #475569; text-align: left;">
          <p style="margin: 0 0 8px 0;">💡 <strong>รหัสผ่านเริ่มต้นของระบบ:</strong> ใช้รหัสประจำตัวครู (Teacher ID) เช่น <code>T101</code> หรือ <code>1001</code></p>
          <p style="margin: 0;">หากท่านเปลี่ยนรหัสผ่านแล้วลืม โปรดติดต่อผู้ดูแลระบบ (Admin) หรือแจ้งปัญหาผ่านศูนย์ข้อมูลเพื่อขอรีเซ็ตรหัสผ่านครับ</p>
        </div>
      `,
      confirmButtonText: "เข้าใจแล้ว",
      confirmButtonColor: "#0070f3"
    });
  } else {
    alert("รหัสผ่านเริ่มต้นคือ รหัสประจำตัวครู (Teacher ID) หากท่านลืมรหัสผ่านโปรดติดต่อผู้ดูแลระบบ");
  }
}

// Quick Login Alert
export function handleGoogleOrQuickLogin() {
  if (typeof Swal !== "undefined") {
    Swal.fire({
      title: "เข้าสู่ระบบด่วน",
      text: "โปรดระบุรหัสประจำตัวครู (Teacher ID) ในช่อง Login เพื่อเข้าใช้งานระบบได้ทันที",
      icon: "info",
      confirmButtonText: "เข้าใจแล้ว",
      confirmButtonColor: "#0070f3"
    });
  }
}

// Remember Me handler (stores only username)
function saveOrClearSavedUsername(uname) {
  const rememberCheckbox = document.getElementById("loginRememberMe");
  const shouldSave = rememberCheckbox ? rememberCheckbox.checked : false;
  if (shouldSave && uname) {
    try {
      localStorage.setItem("lab_remembered_username", uname);
    } catch (e) {}
  } else {
    localStorage.removeItem("lab_remembered_username");
  }
  // Ensure legacy saved credentials with passwords are never retained
  try {
    localStorage.removeItem("lab_saved_credentials");
  } catch (e) {}
}

// Setup Event Listeners for Login UI
export function setupLoginHandlers() {
  if (typeof document === 'undefined') return;
  const btnSidebarLogin = document.getElementById("btnSidebarLogin");
  const btnSidebarLogoutQuick = document.getElementById("btnSidebarLogoutQuick");
  const loginModalClose = document.getElementById("loginModalClose");
  const btnCancelLogin = document.getElementById("btnCancelLogin");
  const adminLoginForm = document.getElementById("adminLoginForm");
  const btnTogglePassword = document.getElementById("btnTogglePassword");
  const loginPasswordInput = document.getElementById("loginPassword");
  const eyeIcon = document.getElementById("eyeIcon");
  const usernameInput = document.getElementById("loginUsername");
  const errorMsg = document.getElementById("loginErrorMsg");
  const errorText = document.getElementById("loginErrorText");

  if (btnSidebarLogoutQuick) {
    btnSidebarLogoutQuick.addEventListener("click", (e) => {
      e.preventDefault();
      logout(true);
    });
  }

  if (btnSidebarLogin) {
    btnSidebarLogin.addEventListener("click", (e) => {
      e.preventDefault();
      const sidebar = document.getElementById("sidebar");
      const mobileOverlay = document.getElementById("mobile-overlay");
      if (sidebar && sidebar.classList.contains("active")) sidebar.classList.remove("active");
      if (mobileOverlay && mobileOverlay.classList.contains("active")) mobileOverlay.classList.remove("active");
      document.body.classList.remove("mobile-sidebar-open");

      if (isUserLoggedIn()) {
        logout(true);
      } else {
        openLoginModal();
      }
    });
  }

  if (loginModalClose) {
    loginModalClose.addEventListener("click", (e) => {
      e.preventDefault();
      closeLoginModal();
    });
  }

  if (btnCancelLogin) {
    btnCancelLogin.addEventListener("click", (e) => {
      e.preventDefault();
      closeLoginModal();
    });
  }

  // Backdrop click dismiss
  const loginModalEl = document.getElementById("loginModal");
  if (loginModalEl) {
    loginModalEl.addEventListener("click", (e) => {
      if (e.target === loginModalEl) {
        closeLoginModal();
      }
    });
  }

  // Escape key dismiss
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const modal = document.getElementById("loginModal");
      if (modal && modal.classList.contains("active")) {
        closeLoginModal();
      }
    }
  });

  const linkForgotPassword = document.getElementById("linkForgotPassword");
  if (linkForgotPassword) {
    linkForgotPassword.addEventListener("click", (e) => {
      e.preventDefault();
      handleForgotPasswordClick();
    });
  }

  // Toggle Password Visibility
  if (btnTogglePassword && loginPasswordInput && eyeIcon) {
    btnTogglePassword.addEventListener("click", (e) => {
      e.preventDefault();
      if (loginPasswordInput.type === "password") {
        loginPasswordInput.type = "text";
        eyeIcon.setAttribute("data-lucide", "eye-off");
      } else {
        loginPasswordInput.type = "password";
        eyeIcon.setAttribute("data-lucide", "eye");
      }
      if (window.lucide) window.lucide.createIcons();
    });
  }

  // Clear errors on typing
  if (usernameInput && errorMsg) {
    usernameInput.addEventListener("input", () => {
      errorMsg.style.display = "none";
    });
  }
  if (loginPasswordInput && errorMsg) {
    loginPasswordInput.addEventListener("input", () => {
      errorMsg.style.display = "none";
    });
  }

  // Form Submit Handler
  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const rawUser = usernameInput ? usernameInput.value : '';
      const rawPass = loginPasswordInput ? loginPasswordInput.value : '';
      const u = normalizeInput(rawUser);
      const p = normalizeInput(rawPass);

      if (!u) {
        if (errorMsg) errorMsg.style.display = "flex";
        if (errorText) errorText.innerText = "กรุณาระบุรหัสประจำตัวครู (Teacher ID) หรือชื่อผู้ใช้งาน";
        return;
      }
      if (!p) {
        if (errorMsg) errorMsg.style.display = "flex";
        if (errorText) errorText.innerText = "กรุณากรอกรหัสผ่าน";
        return;
      }

      const submitBtn = adminLoginForm.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add("loading");
      }

      try {
        const data = await login(u, p);
        saveOrClearSavedUsername(u);
        closeLoginModal();

        const roleText = (data.user.role === 'L3' || data.user.role === 'admin') ? 'ผู้ดูแลระบบ (L3)' : `ครู/เจ้าหน้าที่ (${data.user.role || 'L1'})`;
        if (typeof window.showToast === 'function') {
          window.showToast(`เข้าสู่ระบบสำเร็จในฐานะ ${data.user.name} (${roleText})`, "success");
        }
      } catch (err) {
        if (errorMsg) errorMsg.style.display = "flex";
        if (errorText) errorText.innerText = err.message || "รหัสประจำตัวครูหรือรหัสผ่านไม่ถูกต้อง";
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove("loading");
        }
      }
    });
  }
}

// Update Topbar / Sidebar Login UI
export function updateLoginUI() {
  if (typeof document === 'undefined') return;
  const loggedIn = isUserLoggedIn();
  const user = state.currentUser;
  const isL3 = state.isAdminLoggedIn;

  // Sidebar controls
  const btnSidebarLogin = document.getElementById("btnSidebarLogin");
  const btnSidebarLogoutQuick = document.getElementById("btnSidebarLogoutQuick");
  const sidebarUserStatus = document.getElementById("sidebarUserStatus");
  const sidebarUserName = document.getElementById("sidebarUserName");
  const sidebarUserRole = document.getElementById("sidebarUserRole");
  const sidebarUserAvatar = document.getElementById("sidebarUserAvatar");

  if (loggedIn && user) {
    if (btnSidebarLogin) btnSidebarLogin.style.display = "none";
    if (btnSidebarLogoutQuick) btnSidebarLogoutQuick.style.display = "inline-flex";
    if (sidebarUserStatus) sidebarUserStatus.innerText = "เข้าสู่ระบบแล้ว";
    if (sidebarUserName) sidebarUserName.innerText = user.name;
    if (sidebarUserRole) sidebarUserRole.innerText = user.roleName || user.role || 'Teacher';
    if (sidebarUserAvatar) {
      sidebarUserAvatar.innerText = user.initials || "U";
      sidebarUserAvatar.style.backgroundColor = user.color || "#0284c7";
    }
  } else {
    if (btnSidebarLogin) btnSidebarLogin.style.display = "inline-flex";
    if (btnSidebarLogoutQuick) btnSidebarLogoutQuick.style.display = "none";
    if (sidebarUserStatus) sidebarUserStatus.innerText = "ผู้เข้าชมทั่วไป (Guest)";
    if (sidebarUserName) sidebarUserName.innerText = "ไม่ได้เข้าสู่ระบบ";
    if (sidebarUserRole) sidebarUserRole.innerText = "Guest (L0)";
    if (sidebarUserAvatar) {
      sidebarUserAvatar.innerText = "G";
      sidebarUserAvatar.style.backgroundColor = "#94a3b8";
    }
  }

  // Admin and executive only buttons
  const quickBtnAdmin = document.getElementById("quickBtnAdmin");
  const btnSidebarAdmin = document.getElementById("btnSidebarAdmin");
  const btnTickerAdminEdit = document.getElementById("btnTickerAdminEdit");

  if (quickBtnAdmin) quickBtnAdmin.style.display = isL3 ? "inline-flex" : "none";
  if (btnSidebarAdmin) btnSidebarAdmin.style.display = isL3 ? "flex" : "none";
  if (btnTickerAdminEdit) btnTickerAdminEdit.style.display = isL3 ? "inline-flex" : "none";

  if (typeof window !== 'undefined' && typeof window.applyDashboardRoleLayout === 'function') {
    window.applyDashboardRoleLayout();
  }
  if (window.lucide) window.lucide.createIcons();
}

// Quick Fill Role for Demo Role Buttons
export function quickFillRole(username, password) {
  const usernameInput = document.getElementById("loginUsername");
  const loginPasswordInput = document.getElementById("loginPassword");
  const adminLoginForm = document.getElementById("adminLoginForm");
  if (usernameInput) usernameInput.value = username;
  if (loginPasswordInput) loginPasswordInput.value = password;
  if (adminLoginForm) {
    if (typeof adminLoginForm.requestSubmit === "function") {
      adminLoginForm.requestSubmit();
    } else {
      adminLoginForm.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    }
  }
}

// Mount to window for global backwards compatibility
if (typeof window !== 'undefined') {
  window.openLoginModal = openLoginModal;
  window.closeLoginModal = closeLoginModal;
  window.handleForgotPasswordClick = handleForgotPasswordClick;
  window.handleGoogleOrQuickLogin = handleGoogleOrQuickLogin;
  window.setupLoginHandlers = setupLoginHandlers;
  window.updateLoginUI = updateLoginUI;
  window.quickFillRole = quickFillRole;
}
