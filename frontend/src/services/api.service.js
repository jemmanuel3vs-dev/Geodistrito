import { config } from '../core/config.js';

/* Construir API_BASE dinámicamente desde config */
function getApiBase() {
  const baseUrl = config.api.baseUrl || 'http://localhost:3000';
  return `${baseUrl}/api`;
}

/* =========================
   REQUEST
========================= */

async function request(
  endpoint,
  options = {}
) {

  const API_BASE = getApiBase();
  console.log('🌐 API Request:', `${API_BASE}${endpoint}`);

  const response =
    await fetch(
      `${API_BASE}${endpoint}`,
      {
        ...options
      }
    );

  const data =
    await response.json();

  if (!response.ok) {

    throw new Error(
      data.error ||
      'Error en API'
    );

  }

  return data;

}

/* =========================
   GET
========================= */

export function apiGet(
  endpoint
) {

  return request(endpoint);

}

/* =========================
   POST
========================= */

export function apiPost(
  endpoint,
  body
) {

  return request(
    endpoint,
    {
      method: 'POST',
      body
    }
  );

}

/* =========================
   PUT
========================= */

export function apiPut(
  endpoint,
  body
) {

  return request(
    endpoint,
    {
      method: 'PUT',
      headers: {
        'Content-Type':
          'application/json'
      },
      body:
        JSON.stringify(body)
    }
  );

}

/* =========================
   DELETE
========================= */

export function apiDelete(
  endpoint
) {

  return request(
    endpoint,
    {
      method: 'DELETE'
    }
  );

}
