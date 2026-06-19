import { isAuthenticated, login, getUser } from '../services/auth.service.js';

function showLoginMessage(element, text, type = 'error') {
  if (!element) return;
  element.textContent = text;
  element.className = `login-message ${type}`;
}

export function initLogin() {
  if (isAuthenticated()) {
    const user = getUser();
    if (user?.rol === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'index.html';
    }
    return;
  }

  const form = document.getElementById('loginForm');
  const message = document.getElementById('loginMessage');

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value.trim();

    if (!email || !password) {
      showLoginMessage(message, 'Completa email y contraseña', 'error');
      return;
    }

    try {
      await login(email, password);
      const user = getUser();
      if (user?.rol === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'index.html';
      }
    } catch (error) {
      console.error(error);
      showLoginMessage(message, error.message || 'Error de conexión', 'error');
    }
  });
}

// Auto-init when loaded directly (login.html loads this file standalone)
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => initLogin());
}
