import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Stethoscope, Users, FileText,
  LogOut, ChevronRight, Heart, Shield
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', labelUz: 'Boshqaruv paneli', icon: LayoutDashboard, roles: ['admin', 'clinician'] },
  { to: '/doctors', label: 'Doctors', labelUz: 'Shifokorlar', icon: Stethoscope, roles: ['admin', 'clinician', 'receptionist'] },
  { to: '/patients', label: 'Patients', labelUz: 'Bemorlar', icon: Users, roles: ['admin', 'clinician', 'receptionist'] },
  { to: '/diagnoses', label: 'Diagnoses', labelUz: 'Tashxislar', icon: FileText, roles: ['admin', 'clinician'] },
];

const roleColors = {
  admin: 'bg-purple-100 text-purple-700',
  clinician: 'bg-blue-100 text-blue-700',
  receptionist: 'bg-emerald-100 text-emerald-700',
};

export default function Sidebar({ mobile = false, onClose }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const visible = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className={`flex flex-col h-full bg-white border-r border-slate-100 ${mobile ? '' : 'w-64'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
          <Heart className="w-5 h-5 text-white" fill="white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 leading-tight">CareTrack</p>
          <p className="text-xs text-slate-400">Clinic MRMS</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visible.map(({ to, label, labelUz, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600 transition-colors'}`} />
                <div className="flex-1 min-w-0">
                  <p className="truncate">{label}</p>
                  <p className={`text-xs truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>{labelUz}</p>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 flex-shrink-0 text-white/70" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="px-3 pb-4 border-t border-slate-100 pt-3">
        <div className="px-3 py-2.5 rounded-xl bg-slate-50 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 truncate">{user?.username}</p>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${roleColors[user?.role] || 'bg-slate-100 text-slate-500'}`}>
                {user?.role}
              </span>
            </div>
            <Shield className="w-4 h-4 text-slate-300 flex-shrink-0" />
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 group"
        >
          <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>Logout / Chiqish</span>
        </button>
      </div>
    </div>
  );
}
