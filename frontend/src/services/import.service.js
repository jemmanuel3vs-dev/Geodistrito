import {
  apiPost
} from './api.service.js';

export async function uploadExcel(formData) {
  return apiPost(
    '/import',
    formData
  );
}
