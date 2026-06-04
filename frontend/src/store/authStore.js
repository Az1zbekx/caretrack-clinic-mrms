/**
 * PURPOSE: Zustand Authentication Store.
 * MAQSAD: Tizim foydalanuvchisi holatini boshqarish va rollarni tekshirish do'koni.
 */

import { create } from 'zustand';
import { loginApi, logoutApi, getMeApi } from '../api/auth.api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setToken: (token) => set({ token, isAuthenticated: !!token }),

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const data = await loginApi(credentials);
      const token = data.accessToken || data.token;
      const user = data.user;
      set({ token, user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed / Kirishda xatolik';
      set({ error: errMsg, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await logoutApi();
    } catch (e) {}
    set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: null });
  },

  initAuth: async () => {
    set({ isLoading: true });
    try {
      // Triggers interceptor auto-refresh if token is null but HttpOnly refresh cookie is valid
      const data = await getMeApi();
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  isAdmin: () => get().user?.role === 'admin',
  isClinician: () => get().user?.role === 'clinician',
  isReceptionist: () => get().user?.role === 'receptionist',
}));
