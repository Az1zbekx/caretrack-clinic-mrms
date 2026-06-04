/**
 * PURPOSE: Dashboard statistics API integration.
 * MAQSAD: Dashboard tahlili va so'nggi harakatlar uchun API chaqiriqlari.
 */

import api from './axios';

export const getDashboardStatsApi = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

export const getRecentActivityApi = async () => {
  const response = await api.get('/dashboard/recent');
  return response.data;
};
