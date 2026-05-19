document.addEventListener('DOMContentLoaded', () => {
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
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        showLoginMessage(data.error || 'Error en el inicio de sesión', 'error');
        return;
      }

      setAuthData({ token: data.token, user: data.user });
      window.location.href = 'admin.html';
    } catch (error) {
      console.error(error);
      showLoginMessage('Error de conexión', 'error');
    }
  });

  function showLoginMessage(text, type = 'error') {
    if (message) {
      message.textContent = text;
      message.className = `login-message ${type}`;
    }
  }
});
