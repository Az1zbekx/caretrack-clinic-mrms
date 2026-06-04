/**
 * PURPOSE: RBAC Route protection in the frontend.
 * MAQSAD: Foydalanuvchi roli ruxsat etilgan ro'yxatda borligini tekshiruvchi komponent.
 */

import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ShieldAlert } from 'lucide-react';

export default function RoleGuard({ children, allowedRoles }) {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white/60 backdrop-blur-md rounded-2xl border border-slate-100 shadow-sm max-w-lg mx-auto mt-16 animate-slide-up">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          Ruxsat etilmagan faoliyat / Access Denied
        </h2>
        <p className="text-slate-500 text-center text-sm mb-6">
          Ushbu sahifani ko'rish uchun sizda yetarli ruxsat yo'q. Iltimos, administratorga murojaat qiling.
          <br />
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return children;
}
