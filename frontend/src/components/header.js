import {
  getUser,
  logout,
  isAuthenticated,
  isAdmin
} from '../services/auth.service.js';

export function initHeader() {
  if (!isAuthenticated()) {
    return;
  }

  const user = getUser();
  if (!user) return;

  const isAdminUser = isAdmin();

  const adminLink = document.getElementById('adminLink');
  if (adminLink) {
    adminLink.style.display = isAdminUser ? 'inline-flex' : 'none';
  }

  const homeLink = document.getElementById('homeLink');
  if (homeLink) {
    homeLink.style.display = 'inline-flex';
  }

  const currentUserEl = document.getElementById('currentUser');
  const btnLogout = document.getElementById('btnLogout');

  if (currentUserEl) {
    currentUserEl.textContent = '';
    const nameText = document.createElement('span');
    nameText.textContent = `👤 ${user.nombre}`;
    currentUserEl.appendChild(nameText);

    if (user.rol) {
      const roleText = document.createElement('span');
      roleText.textContent = formatRole(user.rol);
      currentUserEl.appendChild(document.createElement('br'));
      currentUserEl.appendChild(roleText);
    }
  }

  if (btnLogout) {
    btnLogout.onclick = () => {
      logout();
      window.location.href = 'login.html';
    };
  }
}

function formatRole(rol) {
  if (!rol) return '';
  const lower = rol.toLowerCase();
  if (lower === 'admin') return 'Administrador';
  if (lower === 'capturista') return 'Capturista';
  return rol;
}