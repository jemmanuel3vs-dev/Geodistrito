/**
 * Auth Service
 * Autenticación y gestión de tokens
 */


export async function login(email, password) {
  console.log('🔐 Login:', email);
  // TODO: Implementar en FASE 3
}

export function logout() {
  console.log('🚪 Logout');
  // TODO: Implementar en FASE 3
}

export function getToken() {
  // TODO: Implementar en FASE 3
  return null;
}

export function isAuthenticated() {
  // TODO: Implementar en FASE 3
  return false;
}

export function setSession(token, user) {
  console.log('✅ Sesión establecida');
  // TODO: Implementar en FASE 3
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default {
  login,
  logout,
  getToken,
  isAuthenticated,
  setSession,
  authHeaders
};
