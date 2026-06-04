import { useEffect, useState, useCallback } from 'react';
import { Stethoscope, Plus, Search, Edit2, Trash2, Phone, Mail, Building2 } from 'lucide-react';
import { getDoctorsApi, createDoctorApi, updateDoctorApi, deleteDoctorApi } from '../api/doctors.api';
import { useAuthStore } from '../store/authStore';
import { LoadingSpinner, EmptyState, ConfirmModal, Modal, Badge } from '../components/UI';
import { useDebounce } from '../hooks/useDebounce';
import { DEPARTMENTS, SPECIALIZATIONS } from '../utils/constants';

const severityDept = { Cardiology: 'bg-red-100 text-red-700', Neurology: 'bg-purple-100 text-purple-700', Pediatrics: 'bg-pink-100 text-pink-700', 'General Medicine': 'bg-blue-100 text-blue-700', Orthopedics: 'bg-amber-100 text-amber-700', Diagnostics: 'bg-slate-100 text-slate-700' };

function DoctorForm({ initial = {}, onSubmit, loading }) {
  const [form, setForm] = useState({ first_name: '', last_name: '', specialization: '', department: '', phone: '', email: '', license_number: '', ...initial });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Ism</label><input className="input" value={form.first_name} onChange={e => set('first_name', e.target.value)} required /></div>
        <div><label className="label">Familiya</label><input className="input" value={form.last_name} onChange={e => set('last_name', e.target.value)} required /></div>
      </div>
      <div><label className="label">Bo'lim / Department</label>
        <select className="input" value={form.department} onChange={e => set('department', e.target.value)} required>
          <option value="">Tanlang...</option>
          {DEPARTMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
      </div>
      <div><label className="label">Mutaxassislik / Specialization</label>
        <select className="input" value={form.specialization} onChange={e => set('specialization', e.target.value)} required>
          <option value="">Tanlang...</option>
          {SPECIALIZATIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Telefon</label><input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+998..." /></div>
        <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} /></div>
      </div>
      <div><label className="label">Litsenziya raqami</label><input className="input" value={form.license_number} onChange={e => set('license_number', e.target.value)} /></div>
      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Saqlanmoqda...' : 'Saqlash'}</button>
    </form>
  );
}

export default function DoctorsPage() {
  const { isAdmin } = useAuthStore();
  const [doctors, setDoctors] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | 'create' | { mode: 'edit', doctor }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const dSearch = useDebounce(search, 400);

  const fetch = useCallback(() => {
    setLoading(true);
    getDoctorsApi({ search: dSearch, page, limit: 10 })
      .then(d => { setDoctors(d.data); setPagination(d.pagination); })
      .finally(() => setLoading(false));
  }, [dSearch, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleCreate = async (data) => {
    setSaving(true);
    try { await createDoctorApi(data); setModal(null); fetch(); } finally { setSaving(false); }
  };
  const handleUpdate = async (data) => {
    setSaving(true);
    try { await updateDoctorApi(modal.doctor.id, data); setModal(null); fetch(); } finally { setSaving(false); }
  };
  const handleDelete = async () => {
    setSaving(true);
    try { await deleteDoctorApi(deleteTarget.id); setDeleteTarget(null); fetch(); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Shifokorlar / Doctors</h1>
          <p className="text-sm text-slate-500 mt-0.5">{pagination.totalItems ?? 0} ta shifokor ro'yxatda</p>
        </div>
        {isAdmin() && (
          <button onClick={() => setModal('create')} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Yangi shifokor
          </button>
        )}
      </div>

      <div className="glass-card p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="input pl-10" placeholder="Qidirish..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      {loading ? <LoadingSpinner /> : doctors.length === 0 ? (
        <div className="glass-card p-8"><EmptyState title="Shifokorlar topilmadi" subtitle="Hali shifokor qo'shilmagan yoki qidiruv natijasi yo'q." icon={Stethoscope} action={isAdmin() && <button onClick={() => setModal('create')} className="btn-primary">Shifokor qo'shish</button>} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {doctors.map(doc => (
            <div key={doc.id} className="glass-card p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-100">
                    {doc.first_name?.[0]}{doc.last_name?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{doc.full_name || `${doc.first_name} ${doc.last_name}`}</p>
                    <p className="text-xs text-slate-400">{doc.specialty || doc.specialization}</p>
                  </div>
                </div>
                {isAdmin() && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setModal({ mode: 'edit', doctor: doc })} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteTarget(doc)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
              <Badge value={doc.department} colorClass={severityDept[doc.department] || 'bg-slate-100 text-slate-600'} />
              <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                {doc.phone && <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{doc.phone}</p>}
                {doc.email && <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 flex-shrink-0" /><span className="truncate">{doc.email}</span></p>}
                {doc.license_number && <p className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{doc.license_number}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${p === page ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}>{p}</button>
          ))}
        </div>
      )}

      <Modal open={modal === 'create' || modal?.mode === 'edit'} title={modal?.mode === 'edit' ? 'Shifokorni tahrirlash' : 'Yangi shifokor qo\'shish'} onClose={() => setModal(null)}>
        <DoctorForm initial={modal?.doctor || {}} onSubmit={modal?.mode === 'edit' ? handleUpdate : handleCreate} loading={saving} />
      </Modal>

      <ConfirmModal open={!!deleteTarget} title="Shifokorni o'chirish" message={`"${deleteTarget?.full_name || deleteTarget?.first_name + ' ' + deleteTarget?.last_name}" profilini o'chirmoqchimisiz?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={saving} />
    </div>
  );
}
