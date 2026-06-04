import { useEffect, useState, useCallback } from 'react';
import { FileText, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { getDiagnosesApi, createDiagnosisApi, updateDiagnosisApi, deleteDiagnosisApi } from '../api/diagnoses.api';
import { getPatientsApi } from '../api/patients.api';
import { getDoctorsApi } from '../api/doctors.api';
import { useAuthStore } from '../store/authStore';
import { LoadingSpinner, EmptyState, ConfirmModal, Modal, Badge } from '../components/UI';
import { useDebounce } from '../hooks/useDebounce';
import { formatDate } from '../utils/formatters';
import { SEVERITY_LEVELS } from '../utils/constants';

function DiagnosisForm({ initial = {}, patients = [], doctors = [], onSubmit, loading }) {
  const [form, setForm] = useState({ patient_id: '', icd_code: '', description: '', severity: 'mild', diagnosed_by: '', notes: '', diagnosis_date: new Date().toISOString().split('T')[0], ...initial });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div><label className="label">Bemor / Patient</label>
        <select className="input" value={form.patient_id} onChange={e => set('patient_id', e.target.value)} required>
          <option value="">Tanlang...</option>
          {patients.map(p => <option key={p.id} value={p.id}>{p.full_name || `${p.first_name} ${p.last_name}`}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">ICD Kodi</label><input className="input" value={form.icd_code} onChange={e => set('icd_code', e.target.value)} required placeholder="I10, E11.9..." /></div>
        <div><label className="label">Sana</label><input className="input" type="date" value={form.diagnosis_date} onChange={e => set('diagnosis_date', e.target.value)} /></div>
      </div>
      <div><label className="label">Tavsif / Description</label><textarea className="input h-20 resize-none" value={form.description} onChange={e => set('description', e.target.value)} required /></div>
      <div><label className="label">Og'irlik darajasi / Severity</label>
        <select className="input" value={form.severity} onChange={e => set('severity', e.target.value)}>
          {SEVERITY_LEVELS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      <div><label className="label">Shifokor / Doctor</label>
        <select className="input" value={form.diagnosed_by} onChange={e => set('diagnosed_by', e.target.value)}>
          <option value="">Tanlang...</option>
          {doctors.map(d => <option key={d.id} value={d.id}>{d.full_name || `${d.first_name} ${d.last_name}`}</option>)}
        </select>
      </div>
      <div><label className="label">Izohlar / Notes</label><textarea className="input h-16 resize-none" value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Saqlanmoqda...' : 'Saqlash'}</button>
    </form>
  );
}

export default function DiagnosesPage() {
  const { user } = useAuthStore();
  const canDelete = user?.role === 'admin';

  const [diagnoses, setDiagnoses] = useState([]);
  const [pagination, setPagination] = useState({});
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const dSearch = useDebounce(search, 400);

  const fetch = useCallback(() => {
    setLoading(true);
    getDiagnosesApi({ search: dSearch, severity: severity || undefined, page, limit: 10 })
      .then(d => { setDiagnoses(d.data); setPagination(d.pagination); })
      .finally(() => setLoading(false));
  }, [dSearch, severity, page]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => {
    getPatientsApi({ limit: 200 }).then(d => setPatients(d.data));
    getDoctorsApi({ limit: 100 }).then(d => setDoctors(d.data));
  }, []);

  const handleCreate = async (data) => { setSaving(true); try { await createDiagnosisApi(data); setModal(null); fetch(); } finally { setSaving(false); } };
  const handleUpdate = async (data) => { setSaving(true); try { await updateDiagnosisApi(modal.dx.id, data); setModal(null); fetch(); } finally { setSaving(false); } };
  const handleDelete = async () => { setSaving(true); try { await deleteDiagnosisApi(deleteTarget.id); setDeleteTarget(null); fetch(); } finally { setSaving(false); } };

  const getSev = (val) => SEVERITY_LEVELS.find(s => s.value === val) || { label: val, color: 'bg-slate-100 text-slate-600' };

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tashxislar / Diagnoses</h1>
          <p className="text-sm text-slate-500 mt-0.5">{pagination.totalItems ?? 0} ta tashxis qayd etilgan</p>
        </div>
        <button onClick={() => setModal('create')} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Yangi tashxis</button>
      </div>

      <div className="glass-card p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="input pl-10" placeholder="ICD kodi yoki tavsif..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="input w-48" value={severity} onChange={e => { setSeverity(e.target.value); setPage(1); }}>
          <option value="">Barcha darajalar</option>
          {SEVERITY_LEVELS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : diagnoses.length === 0 ? (
        <div className="glass-card p-8"><EmptyState title="Tashxislar topilmadi" subtitle="Hali tashxis kiritilmagan." icon={FileText} action={<button onClick={() => setModal('create')} className="btn-primary">Tashxis qo'shish</button>} /></div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bemor</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">ICD / Tavsif</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Darajasi</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sana</th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {diagnoses.map(dx => {
                const sev = getSev(dx.severity);
                return (
                  <tr key={dx.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">{dx.patient ? `${dx.patient.first_name} ${dx.patient.last_name}` : `#${dx.patient_id}`}</p>
                      {dx.diagnosingDoctor && <p className="text-xs text-slate-400 mt-0.5">Dr. {dx.diagnosingDoctor.first_name} {dx.diagnosingDoctor.last_name}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg">{dx.icd_code}</span>
                      <p className="text-slate-600 mt-1 text-xs leading-snug max-w-xs truncate">{dx.description}</p>
                    </td>
                    <td className="px-5 py-4"><Badge value={sev.label} colorClass={sev.color} /></td>
                    <td className="px-5 py-4 text-slate-500 text-xs">{formatDate(dx.diagnosis_date)}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setModal({ mode: 'edit', dx })} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        {canDelete && <button onClick={() => setDeleteTarget(dx)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pg => (
            <button key={pg} onClick={() => setPage(pg)} className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${pg === page ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}>{pg}</button>
          ))}
        </div>
      )}

      <Modal open={modal === 'create' || modal?.mode === 'edit'} title={modal?.mode === 'edit' ? 'Tashxisni tahrirlash' : 'Yangi tashxis qo\'shish'} onClose={() => setModal(null)}>
        <DiagnosisForm initial={modal?.dx ? { ...modal.dx, patient_id: modal.dx.patient_id, diagnosed_by: modal.dx.diagnosed_by } : {}} patients={patients} doctors={doctors} onSubmit={modal?.mode === 'edit' ? handleUpdate : handleCreate} loading={saving} />
      </Modal>
      <ConfirmModal open={!!deleteTarget} title="Tashxisni o'chirish" message={`"${deleteTarget?.icd_code}" tashxisini o'chirmoqchimisiz?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={saving} />
    </div>
  );
}
