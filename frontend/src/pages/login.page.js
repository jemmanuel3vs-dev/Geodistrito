import { isAuthenticated, login } from '../core/auth.js';

function initLoginPage() {
  if (isAuthenticated()) {
    window.location.href = 'admin.html';
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
      showLoginMessage('Completa email y contraseña', 'error');
      return;
    }

    try {
      await login(email, password);
      window.location.href = 'admin.html';
    } catch (error) {
      console.error(error);
      showLoginMessage(error.message || 'Error de conexión', 'error');
    }
  });

  function showLoginMessage(text, type = 'error') {
    if (message) {
      message.textContent = text;
      message.className = `login-message ${type}`;
    }
  }
}

document.addEventListener('DOMContentLoaded', initLoginPage);
