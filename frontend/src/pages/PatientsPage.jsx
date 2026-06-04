import { useEffect, useState, useCallback } from 'react';
import { Users, Plus, Search, Edit2, Trash2, Phone, Calendar, Droplets } from 'lucide-react';
import { getPatientsApi, createPatientApi, updatePatientApi, deletePatientApi } from '../api/patients.api';
import { getDoctorsApi } from '../api/doctors.api';
import { useAuthStore } from '../store/authStore';
import { LoadingSpinner, EmptyState, ConfirmModal, Modal, Badge } from '../components/UI';
import { useDebounce } from '../hooks/useDebounce';
import { formatDate } from '../utils/formatters';
import { BLOOD_TYPES } from '../utils/constants';

const genderColor = { Male: 'bg-blue-100 text-blue-700', Female: 'bg-pink-100 text-pink-700' };

function PatientForm({ initial = {}, doctors = [], onSubmit, loading }) {
  const [form, setForm] = useState({ first_name: '', last_name: '', date_of_birth: '', gender: '', phone: '', email: '', address: '', blood_type: '', assigned_doctor_id: '', ...initial });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Ism</label><input className="input" value={form.first_name} onChange={e => set('first_name', e.target.value)} required /></div>
        <div><label className="label">Familiya</label><input className="input" value={form.last_name} onChange={e => set('last_name', e.target.value)} required /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Tug'ilgan sana</label><input className="input" type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} /></div>
        <div><label className="label">Jinsi</label>
          <select className="input" value={form.gender} onChange={e => set('gender', e.target.value)} required>
            <option value="">Tanlang...</option>
            <option value="Male">Erkak / Male</option>
            <option value="Female">Ayol / Female</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Telefon</label><input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} required placeholder="+998..." /></div>
        <div><label className="label">Qon guruhi</label>
          <select className="input" value={form.blood_type} onChange={e => set('blood_type', e.target.value)}>
            <option value="">Tanlang...</option>
            {BLOOD_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>
      <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} /></div>
      <div><label className="label">Manzil</label><input className="input" value={form.address} onChange={e => set('address', e.target.value)} /></div>
      <div><label className="label">Shifokor</label>
        <select className="input" value={form.assigned_doctor_id} onChange={e => set('assigned_doctor_id', e.target.value)}>
          <option value="">Tanlang...</option>
          {doctors.map(d => <option key={d.id} value={d.id}>{d.full_name || `${d.first_name} ${d.last_name}`} — {d.department}</option>)}
        </select>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Saqlanmoqda...' : 'Saqlash'}</button>
    </form>
  );
}

export default function PatientsPage() {
  const { user } = useAuthStore();
  const canEdit = ['admin', 'clinician'].includes(user?.role);
  const canCreate = ['admin', 'receptionist'].includes(user?.role);
  const canDelete = user?.role === 'admin';

  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const dSearch = useDebounce(search, 400);

  const fetch = useCallback(() => {
    setLoading(true);
    getPatientsApi({ search: dSearch, page, limit: 12 })
      .then(d => { setPatients(d.data); setPagination(d.pagination); })
      .finally(() => setLoading(false));
  }, [dSearch, page]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { getDoctorsApi({ limit: 100 }).then(d => setDoctors(d.data)); }, []);

  const handleCreate = async (data) => { setSaving(true); try { await createPatientApi(data); setModal(null); fetch(); } finally { setSaving(false); } };
  const handleUpdate = async (data) => { setSaving(true); try { await updatePatientApi(modal.patient.id, data); setModal(null); fetch(); } finally { setSaving(false); } };
  const handleDelete = async () => { setSaving(true); try { await deletePatientApi(deleteTarget.id); setDeleteTarget(null); fetch(); } finally { setSaving(false); } };

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bemorlar / Patients</h1>
          <p className="text-sm text-slate-500 mt-0.5">{pagination.totalItems ?? 0} ta bemor ro'yxatda</p>
        </div>
        {canCreate && <button onClick={() => setModal('create')} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Yangi bemor</button>}
      </div>

      <div className="glass-card p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="input pl-10" placeholder="Ism yoki telefon..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      {loading ? <LoadingSpinner /> : patients.length === 0 ? (
        <div className="glass-card p-8"><EmptyState title="Bemorlar topilmadi" subtitle="Hali bemor ro'yxatdan o'tkazilmagan." icon={Users} action={canCreate && <button onClick={() => setModal('create')} className="btn-primary">Bemor qo'shish</button>} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {patients.map(p => (
            <div key={p.id} className="glass-card p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shadow-md ${p.gender === 'Female' ? 'bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-pink-100' : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-100'}`}>
                    {p.first_name?.[0]}{p.last_name?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{p.full_name || `${p.first_name} ${p.last_name}`}</p>
                    <p className="text-xs text-slate-400">ID: #{p.id}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {canEdit && <button onClick={() => setModal({ mode: 'edit', patient: p })} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>}
                  {canDelete && <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {p.gender && <Badge value={p.gender} colorClass={genderColor[p.gender] || 'bg-slate-100 text-slate-600'} />}
                {p.blood_type && <Badge value={p.blood_type} colorClass="bg-red-50 text-red-600" />}
              </div>
              <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                {p.date_of_birth && <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatDate(p.date_of_birth)} ({p.age} yosh)</p>}
                {p.phone && <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{p.phone}</p>}
                {p.doctor && <p className="flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5" />Dr. {p.doctor.first_name} {p.doctor.last_name}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pg => (
            <button key={pg} onClick={() => setPage(pg)} className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${pg === page ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}>{pg}</button>
          ))}
        </div>
      )}

      <Modal open={modal === 'create' || modal?.mode === 'edit'} title={modal?.mode === 'edit' ? 'Bemorni tahrirlash' : 'Yangi bemor qo\'shish'} onClose={() => setModal(null)}>
        <PatientForm initial={modal?.patient || {}} doctors={doctors} onSubmit={modal?.mode === 'edit' ? handleUpdate : handleCreate} loading={saving} />
      </Modal>
      <ConfirmModal open={!!deleteTarget} title="Bemorni o'chirish" message={`"${deleteTarget?.full_name || deleteTarget?.first_name + ' ' + deleteTarget?.last_name}" profilini o'chirmoqchimisiz?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={saving} />
    </div>
  );
}
