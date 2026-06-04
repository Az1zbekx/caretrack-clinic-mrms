import { useEffect, useState } from 'react';
import { LayoutDashboard, Stethoscope, Users, FileText, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getDashboardStatsApi } from '../api/dashboard.api';
import { StatCard, LoadingSpinner } from '../components/UI';
import { formatDateTime } from '../utils/formatters';

const SEVERITY_COLORS = {
  mild: '#10b981',
  moderate: '#f59e0b',
  severe: '#f97316',
  critical: '#ef4444',
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStatsApi()
      .then(d => setStats(d.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Dashboard yuklanmoqda..." />;

  const severityData = stats ? Object.entries(stats.bySeverity).map(([name, value]) => ({ name, value })) : [];
  const deptData = stats ? Object.entries(stats.byDepartment).map(([name, value]) => ({ name: name.split(' ')[0], value })) : [];

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">CareTrack Clinic — umumiy ko'rinish</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Jami Shifokorlar / Doctors" value={stats?.totalDoctors} icon={Stethoscope} color="blue" subtitle="Faol shifokorlar soni" />
        <StatCard title="Jami Bemorlar / Patients" value={stats?.totalPatients} icon={Users} color="green" subtitle="Ro'yxatdan o'tgan bemorlar" />
        <StatCard title="Jami Tashxislar / Diagnoses" value={stats?.totalDiagnoses} icon={FileText} color="purple" subtitle="Barcha tibbiy tashxislar" />
        <StatCard title="Kritik Holatlar" value={stats?.bySeverity?.critical ?? 0} icon={Activity} color="amber" subtitle="Zudlik bilan davolash kerak" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" /> Tashxislar — og'irlik darajasi
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={severityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {severityData.map((entry) => (
                  <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-500" /> Bemorlar — bo'lim bo'yicha
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-500" /> So'nggi faoliyat / Recent Activity
        </h2>
        <div className="space-y-3">
          {stats?.recentActivity?.length > 0 ? stats.recentActivity.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.type === 'PATIENT_REGISTRATION' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                {item.type === 'PATIENT_REGISTRATION' ? <Users className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 leading-snug">{item.message_en || item.message}</p>
                <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(item.timestamp)}</p>
              </div>
            </div>
          )) : (
            <p className="text-sm text-slate-400 text-center py-8">Hali faoliyat yo'q</p>
          )}
        </div>
      </div>
    </div>
  );
}
