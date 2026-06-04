/**
 * PURPOSE: Patient CRUD API integration.
 * MAQSAD: Bemorlar bilan ishlash uchun API chaqiriqlari.
 */

import api from './axios';

export const getPatientsApi = async (params) => {
  const response = await api.get('/patients', { params });
  return response.data;
};

export const getPatientApi = async (id) => {
  const response = await api.get(`/patients/${id}`);
  return response.data;
};

export const createPatientApi = async (data) => {
  const response = await api.post('/patients', data);
  return response.data;
};

export const updatePatientApi = async (id, data) => {
  const response = await api.put(`/patients/${id}`, data);
  return response.data;
};

export const deletePatientApi = async (id) => {
  const response = await api.delete(`/patients/${id}`);
  return response.data;
};
