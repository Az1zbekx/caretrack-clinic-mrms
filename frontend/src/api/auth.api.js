/**
 * PURPOSE: Authentication API integration.
 * MAQSAD: Tizimga kirish/chiqish API chaqiriqlari.
 */

import api from './axios';

export const loginApi = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const logoutApi = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getMeApi = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
