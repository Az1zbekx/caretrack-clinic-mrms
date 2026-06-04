/**
 * CareTrack Clinic - Auth & Session Manager
 */

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');

  // Verify page state
  const path = window.location.pathname;
  const isLoginPage = path.includes('login.html');
  const isIndexPage = path === '/' || path.includes('index.html');

  if (!token && !isLoginPage && !isIndexPage) {
    // Attempting to access protected page without token
    window.location.href = '/login.html';
    return;
  }

  if (token && userJson) {
    const user = JSON.parse(userJson);
    populateUserProfile(user);
    applyRbacControls(user);
  }

  // Handle Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const usernameInput = document.getElementById('username').value.trim();
      const passwordInput = document.getElementById('password').value;

      try {
        const response = await API.post('/auth/login', {
          username: usernameInput,
          password: passwordInput
        });

        if (response && response.success) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          API.showToast('Authentication successful!', 'success');
          setTimeout(() => window.location.href = '/dashboard.html', 1000);
        }
      } catch (err) {
        console.error('Login failed:', err);
      }
    });
  }

  // Handle Logout button
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login.html';
    });
  }
});

// Update profile sidebar badge
function populateUserProfile(user) {
  const nameEl = document.getElementById('nav-username');
  const roleEl = document.getElementById('nav-role');
  const avatarEl = document.getElementById('nav-avatar');

  if (nameEl) nameEl.textContent = user.username;
  if (roleEl) roleEl.textContent = user.role;
  if (avatarEl) avatarEl.textContent = user.username.charAt(0).toUpperCase();

  // Dashboard role badge
  const roleBadge = document.getElementById('user-role-badge');
  if (roleBadge) roleBadge.textContent = user.role;
}

// Client-side Role-based UI visibility restriction
function applyRbacControls(user) {
  const path = window.location.pathname;

  // 1. Hide Diagnoses module in nav for Receptionist
  if (user.role === 'Receptionist') {
    const menuDiag = document.getElementById('menu-diagnoses');
    if (menuDiag) {
      menuDiag.style.display = 'none';
    }

    // Redirect Receptionist if trying to access diagnoses.html directly
    if (path.includes('diagnoses.html')) {
      window.location.href = '/dashboard.html';
    }
  }

  // 2. Hide User stats card for non-Administrators on dashboard
  if (user.role !== 'Administrator') {
    const statUsers = document.getElementById('stat-card-users');
    if (statUsers) statUsers.style.display = 'none';
  }
}

// Expose role check utility globally
window.getUserRole = function() {
  const userJson = localStorage.getItem('user');
  if (!userJson) return null;
  return JSON.parse(userJson).role;
};

window.getCurrentUser = function() {
  const userJson = localStorage.getItem('user');
  if (!userJson) return null;
  return JSON.parse(userJson);
};
