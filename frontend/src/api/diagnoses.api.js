/**
 * PURPOSE: Diagnosis CRUD API integration.
 * MAQSAD: Tashxislar bilan ishlash uchun API chaqiriqlari.
 */

import api from './axios';

export const getDiagnosesApi = async (params) => {
  const response = await api.get('/diagnoses', { params });
  return response.data;
};

export const getDiagnosisApi = async (id) => {
  const response = await api.get(`/diagnoses/${id}`);
  return response.data;
};

export const createDiagnosisApi = async (data) => {
  const response = await api.post('/diagnoses', data);
  return response.data;
};

export const updateDiagnosisApi = async (id, data) => {
  const response = await api.put(`/diagnoses/${id}`, data);
  return response.data;
};

export const deleteDiagnosisApi = async (id) => {
  const response = await api.delete(`/diagnoses/${id}`);
  return response.data;
};
