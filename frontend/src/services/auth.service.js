import { config } from '../core/config.js';

const TOKEN_KEY = config.storage.tokenKey;
const USER_KEY = config.storage.userKey;

/* =========================
   LOGIN
========================= */

export async function login(email, password) {

  const response = await fetch(
    'http://localhost:3000/api/auth/login',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {

    throw new Error(
      data.error || 'Error de autenticación'
    );

  }

  setSession(
    data.token,
    data.user
  );

  return data;

}

/* =========================
   SESSION
========================= */

export function setSession(
  token,
  user
) {

  localStorage.setItem(
    TOKEN_KEY,
    token
  );

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );

}

/* =========================
   TOKEN
========================= */

export function getToken() {

  return localStorage.getItem(
    TOKEN_KEY
  );

}

/* =========================
   USER
========================= */

export function getUser() {

  const user =
    localStorage.getItem(
      USER_KEY
    );

  return user
    ? JSON.parse(user)
    : null;

}

/* =========================
   AUTH
========================= */

export function isAuthenticated() {

  return !!getToken();

}

/* =========================
   ROLE
========================= */

export function isAdmin() {

  const user =
    getUser();

  return user?.rol === 'admin';

}

/* =========================
   HEADERS
========================= */

export function getAuthHeaders() {

  const token =
    getToken();

  return token
    ? {
        Authorization:
          `Bearer ${token}`
      }
    : {};

}

/* =========================
   LOGOUT
========================= */

export function logout() {

  localStorage.removeItem(
    TOKEN_KEY
  );

  localStorage.removeItem(
    USER_KEY
  );

}