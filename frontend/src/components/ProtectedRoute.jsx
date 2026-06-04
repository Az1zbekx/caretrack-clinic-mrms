/**
 * PURPOSE: Route guarding for authenticated users.
 * MAQSAD: Tizimga kirmagan foydalanuvchilarni login sahifasiga yo'naltirish middleware-komponenti.
 */

import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading, initAuth } = useAuthStore();

  useEffect(() => {
    // Attempt to restore session on mount if token is missing
    initAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute w-8 h-8 border-4 border-secondary/20 border-b-secondary rounded-full animate-spin-reverse"></div>
        </div>
        <p className="mt-4 text-slate-500 font-medium text-sm animate-pulse">
          Loading CareTrack Clinic... / Yuklanmoqda...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
