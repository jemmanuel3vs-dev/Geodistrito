/* =========================
   API URL
========================= */

const API_URL =
'http://localhost:3000';
function getAuthToken() {
  return localStorage.getItem('geodistrito_token');
}

function authHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function loginRequest(email, password) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error autenticando');
  }

  return data;
}

async function registerRequest(nombre, email, password, rol) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nombre, email, password, rol })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error registrando usuario');
  }

  return data;
}
/* =========================
   OBTENER PUNTOS
========================= */

async function fetchPoints(){

  try{

    const response =
    await fetch(`${API_URL}/api/puntos`);

    if(!response.ok){

      throw new Error(
        'Error obteniendo puntos'
      );

    }

    const data =
    await response.json();

    console.log(
      'PUNTOS:',
      data
    );

    /* =========================
       ASEGURAR ARRAY
    ========================= */

    state.points =

      Array.isArray(data)

      ?

      data

      :

      [];

    /* =========================
       RENDER
    ========================= */

    renderPoints();

    renderAllMarkers();

  }catch(error){

    console.error(error);

    state.points = [];

    renderPoints();

    showError(
      'No se pudieron cargar los puntos'
    );

  }

}

/* =========================
   GUARDAR PUNTO
========================= */

async function savePointRequest(
  formData
){

  try{

    const response =
    await fetch(

      `${API_URL}/api/puntos`,

      {

        method: 'POST',

        headers: authHeaders(),

        body: formData

      }

    );

    if(!response.ok){

      throw new Error(
        'Error guardando punto'
      );

    }

    return await response.json();

  } catch(error){

    console.error(error);

    throw error;

  }

}

async function getAllPoints(){

  try{

    const response =
    await fetch(`${API_URL}/api/puntos`);

    if(!response.ok){

      throw new Error(
        'Error obteniendo puntos'
      );

    }

    const data =
    await response.json();

    return Array.isArray(data)
      ? data
      : [];

  } catch(error){

    console.error(error);

    throw error;

  }

}

function buildQueryString(params = {}) {
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return query ? `?${query}` : '';
}

async function fetchDashboardStats(filters = {}) {
  const query = buildQueryString(filters);
  try {
    const response = await fetch(`${API_URL}/api/puntos/stats/overview${query}`);
    if (!response.ok) {
      throw new Error('Error obteniendo estadísticas generales');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function fetchStatsByDistrict(filters = {}) {
  const query = buildQueryString(filters);
  try {
    const response = await fetch(`${API_URL}/api/puntos/stats/by-district${query}`);
    if (!response.ok) {
      throw new Error('Error obteniendo puntos por distrito');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function fetchStatsByType(filters = {}) {
  const query = buildQueryString(filters);
  try {
    const response = await fetch(`${API_URL}/api/puntos/stats/by-type${query}`);
    if (!response.ok) {
      throw new Error('Error obteniendo puntos por tipo');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function fetchStatsByMunicipality(filters = {}) {
  const query = buildQueryString(filters);
  try {
    const response = await fetch(`${API_URL}/api/puntos/stats/by-municipality${query}`);
    if (!response.ok) {
      throw new Error('Error obteniendo puntos por municipio');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function fetchActivityByDate(days = 30, filters = {}) {
  const query = buildQueryString({ days, ...filters });
  try {
    const response = await fetch(`${API_URL}/api/puntos/stats/activity-by-date${query}`);
    if (!response.ok) {
      throw new Error('Error obteniendo actividad por fecha');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function fetchLatestObservation(pointId) {
  try {
    const response = await fetch(`${API_URL}/api/puntos/${pointId}/observations`);
    if (!response.ok) {
      throw new Error('Error obteniendo observación');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function fetchAuditHistory(pointId) {
  try {
    const response = await fetch(`${API_URL}/api/puntos/${pointId}/audit`, {
      headers: authHeaders()
    });
    if (!response.ok) {
      throw new Error('Error obteniendo historial de auditoría');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function createObservationRequest(pointId, comentario, prioridad = 'MEDIUM') {
  try {
    const response = await fetch(`${API_URL}/api/puntos/${pointId}/observations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify({ comentario, prioridad })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error creando observación');
    }
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function updatePuntoStateRequest(pointId, estado, comentario = '') {
  try {
    const response = await fetch(`${API_URL}/api/puntos/${pointId}/state`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify({ estado, comentario })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error actualizando estado');
    }
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function updatePuntoRequest(id, payload) {
  try {
    const response = await fetch(`${API_URL}/api/puntos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Error actualizando punto');
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function deletePuntoRequest(id) {
  try {
    const response = await fetch(`${API_URL}/api/puntos/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Error eliminando punto');
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}