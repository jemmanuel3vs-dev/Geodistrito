
import {
  apiGet,
  apiPost,
  apiDelete
} from './api.service.js';

/* =========================
   GET ALL
========================= */

export async function getAllPoints() {

  return await apiGet(
    '/puntos'
  );

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
   DELETE
========================= */

export async function deletePoint(
  id
) {

  return await apiDelete(
    `/puntos/${id}`
  );

}
