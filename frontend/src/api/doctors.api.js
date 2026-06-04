/**
 * PURPOSE: Doctor CRUD API integration.
 * MAQSAD: Shifokorlar bilan ishlash uchun API chaqiriqlari.
 */

import api from './axios';

export const getDoctorsApi = async (params) => {
  const response = await api.get('/doctors', { params });
  return response.data;
};

export const getDoctorApi = async (id) => {
  const response = await api.get(`/doctors/${id}`);
  return response.data;
};

export const createDoctorApi = async (data) => {
  const response = await api.post('/doctors', data);
  return response.data;
};

export const updateDoctorApi = async (id, data) => {
  const response = await api.put(`/doctors/${id}`, data);
  return response.data;
};

export const deleteDoctorApi = async (id) => {
  const response = await api.delete(`/doctors/${id}`);
  return response.data;
};
