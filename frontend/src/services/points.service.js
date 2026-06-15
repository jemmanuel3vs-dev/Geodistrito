
import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete
} from './api.service.js';

function unwrapData(response) {

  return response?.data ?? response;

}

/* =========================
   GET ALL
========================= */

export async function getAllPoints() {

  const response = await apiGet(
    '/puntos'
  );

  return unwrapData(response);

}

/* =========================
   GET BY ID
========================= */

export async function getPointById(
  id
) {

  const response = await apiGet(
    `/puntos/${id}`
  );

  return unwrapData(response);

}

/* =========================
   CREATE
========================= */

export async function savePointRequest(
  formData
) {

  return await apiPost(
    '/puntos',
    formData
  );

}

/* =========================
   UPDATE
========================= */

export async function updatePoint(
  id,
  data
) {

  const response = await apiPut(
    `/puntos/${id}`,
    data
  );

  return unwrapData(response);

}

/* =========================
   DELETE
========================= */

export async function deletePoint(
  id
) {

  return await apiDelete(
    `/puntos/${id}`
  );

}
