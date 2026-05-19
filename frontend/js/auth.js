function getAuthToken() {
  return localStorage.getItem('geodistrito_token');
}

function setAuthData({ token, user }) {
  localStorage.setItem('geodistrito_token', token);
  localStorage.setItem('geodistrito_user', JSON.stringify(user));
}

function getAuthUser() {
  const stored = localStorage.getItem('geodistrito_user');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function clearAuthData() {
  localStorage.removeItem('geodistrito_token');
  localStorage.removeItem('geodistrito_user');
}

function isAuthenticated() {
  return Boolean(getAuthToken());
}

function authHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function renderAuthHeader() {
  const user = getAuthUser();
  const userName = document.getElementById('userName');
  const userRole = document.getElementById('userRole');
  const logoutBtn = document.getElementById('logoutBtn');
  const exportBtn = document.getElementById('btnExport');

  if (userName) {
    userName.textContent = user?.nombre || 'Invitado';
  }

  if (userRole) {
    userRole.textContent = user?.rol || 'sin rol';
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearAuthData();
      window.location.href = 'login.html';
    });
  }

  if (exportBtn && user?.rol !== 'admin') {
    exportBtn.style.display = 'none';
  }
}

function redirectToLoginIfUnauthorized() {
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
  }
}
