import {
  apiGet
} from './api.service.js';

export async function getDashboardStats() {
  return apiGet('/dashboard');
}
