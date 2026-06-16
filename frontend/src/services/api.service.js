import { config } from '../core/config.js';

function getApiBase() {
  const baseUrl = config.api.baseUrl || 'http://localhost:3000';
  return `${baseUrl}/api`;
}

/* =========================
   REQUEST
========================= */

async function request(endpoint, options = {}) {
  const API_BASE = getApiBase();
  const token = localStorage.getItem(config.storage.tokenKey);

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error en API');
  }

  return data;
}

/* =========================
   GET
========================= */

export function apiGet(endpoint) {
  return request(endpoint);
}

/* =========================
   POST
========================= */

export function apiPost(endpoint, body) {
  return request(endpoint, {
    method: 'POST',
    body
  });
}

/* =========================
   PUT
========================= */

export function apiPut(endpoint, body) {
  return request(endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

/* =========================
   DELETE
========================= */

export function apiDelete(endpoint) {
  return request(endpoint, {
    method: 'DELETE'
  });
}
