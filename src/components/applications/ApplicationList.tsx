import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import { TrainingApplication, ApplicationStatus, getRolePermissions } from '../../lib/types';
import { ApplicationDetailModal } from './ApplicationDetailModal';
import { CreateApplicationModal } from './CreateApplicationModal';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Download,
  Edit3,
  Trash2,
  X,
  Save,
  AlertCircle,
  Lock,
} from 'lucide-react';

interface ApplicationListProps {
  filterStatus?: ApplicationStatus;
  title?: string;
  subtitle?: string;
}

export const ApplicationList: React.FC<ApplicationListProps> = ({
  filterStatus,
  title = 'Data Training & Pengajuan Pelatihan',
  subtitle,
}) => {
  const { currentUser, refreshState } = useAuth();
  const perms = getRolePermissions(currentUser.role_code);
  const isSuperAdmin = currentUser.role_code === 'SUPER_ADMIN';

  const [selectedApp, setSelectedApp] = useState<TrainingApplication | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(filterStatus || 'ALL');
  const [confirmDeleteApp, setConfirmDeleteApp] = useState<TrainingApplication | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Edit Training Data Modal State
  const [editingApp, setEditingApp] = useState<TrainingApplication | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDeptId, setEditDeptId] = useState('');
  const [editCategory, setEditCategory] = useState('Safety');
  const [editType, setEditType] = useState<string>('INTERNAL');
  const [editProvider, setEditProvider] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editBudget, setEditBudget] = useState(0);
  const [editStatus, setEditStatus] = useState<ApplicationStatus>('DRAFT');
  const [editPlannedParticipants, setEditPlannedParticipants] = useState(1);
  const [editActualParticipants, setEditActualParticipants] = useState(0);
  const [editPlannedHours, setEditPlannedHours] = useState(16);
  const [editActualHours, setEditActualHours] = useState(0);
  const [editError, setEditError] = useState<string | null>(null);

  const visibleApps = mockStore.getVisibleApplications(currentUser.id);

  const filtered = visibleApps.filter((app) => {
    const matchesSearch =
      app.training_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.application_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.department_name &&
        app.department_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || app.current_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenEdit = (app: TrainingApplication) => {
    if (!perms.canEditData) return;
    setEditingApp(app);
    setEditTitle(app.training_title);
    setEditDeptId(app.department_id);
    setEditCategory(app.training_category);
    setEditType(app.training_type);
    setEditProvider(app.training_provider);
    setEditLocation(app.training_location);
    setEditStartDate(app.proposed_start_date);
    setEditEndDate(app.proposed_end_date);
    setEditBudget(app.estimated_budget);
    setEditStatus(app.current_status);
    setEditPlannedParticipants(app.planned_participants ?? Math.max(app.participants?.length || 1, 1));
    setEditActualParticipants(app.actual_participants ?? (app.current_status === 'COMPLETED' ? Math.max(app.participants?.length || 1, 1) : 0));
    setEditPlannedHours(app.planned_hours ?? 16);
    setEditActualHours(app.actual_hours ?? (app.current_status === 'COMPLETED' ? (app.planned_hours ?? 16) : 0));
    setEditError(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;
    setEditError(null);
    try {
      mockStore.updateTrainingApplicationData(currentUser.id, editingApp.id, {
        training_title: editTitle,
        department_id: editDeptId,
        training_category: editCategory,
        training_type: editType,
        training_provider: editProvider,
        training_location: editLocation,
        proposed_start_date: editStartDate,
        proposed_end_date: editEndDate,
        estimated_budget: Number(editBudget),
        current_status: editStatus,
        planned_participants: Number(editPlannedParticipants),
        actual_participants: Number(editActualParticipants),
        planned_hours: Number(editPlannedHours),
        actual_hours: Number(editActualHours),
      });
      refreshState();
      setEditingApp(null);
    } catch (err: any) {
      setEditError(err.message || 'Gagal memperbarui data training.');
    }
  };

  const handleDeleteApp = (app: TrainingApplication) => {
    if (!isSuperAdmin) return;
    setDeleteError(null);
    setConfirmDeleteApp(app);
  };

  const executeSingleDelete = () => {
    if (!confirmDeleteApp || !isSuperAdmin) return;
    setDeleteError(null);
    try {
      mockStore.deleteTrainingApplication(currentUser.id, confirmDeleteApp.id);
      setConfirmDeleteApp(null);
      refreshState();
    } catch (err: any) {
      setDeleteError(err.message || 'Gagal menghapus data training.');
    }
  };

  const executeDeleteAllTrainings = () => {
    if (!isSuperAdmin) return;
    setDeleteError(null);
    try {
      mockStore.deleteAllTrainingApplications(currentUser.id);
      setShowDeleteAllConfirm(false);
      refreshState();
    } catch (err: any) {
      setDeleteError(err.message || 'Gagal menghapus seluruh data training.');
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Application Number',
      'Training Title',
      'Department',
      'Submitter',
      'Participants',
      'Start Date',
      'End Date',
      'Budget (IDR)',
      'Status',
    ];
    const rows = filtered.map((a) => [
      a.application_number,
      `"${a.training_title.replace(/"/g, '""')}"`,
      a.department_name || '',
      a.submitter_name || '',
      a.participants?.length || 0,
      a.proposed_start_date,
      a.proposed_end_date,
      a.estimated_budget,
      a.current_status,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `THR_Applications_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-[12px] border border-[#E2E8E8]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-heading font-bold text-[#18232B]">{title}</h3>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                perms.trainingData === 'EDIT'
                  ? 'bg-[#397C69]/12 text-[#296050] border-[#397C69]/30'
                  : 'bg-[#D5A33D]/15 text-[#8C6412] border-[#D5A33D]/30'
              }`}
            >
              {perms.trainingData === 'EDIT' ? 'MODE: EDIT (Input/Edit/Delete)' : 'MODE: VIEW ONLY'}
            </span>
          </div>
          <p className="text-xs text-[#5A6B75] mt-0.5">
            {subtitle ||
              'Database utama program pelatihan yang terintegrasi langsung dengan perhitungan Training Achievement.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isSuperAdmin && visibleApps.length > 0 && (
            <Button
              variant="danger"
              size="md"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => {
                setDeleteError(null);
                setShowDeleteAllConfirm(true);
              }}
            >
              Hapus Semua Data Training
            </Button>
          )}

          <Button
            variant="outline"
            size="md"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportCsv}
          >
            Export CSV
          </Button>

          {perms.canInputData ? (
            <Button
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowCreateModal(true)}
            >
              Input Data Training Baru
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[8px] bg-[#F4F6F5] border border-[#E2E8E8] text-[11px] font-mono text-[#5A6B75]">
              <Lock className="w-3.5 h-3.5 text-[#D5A33D]" />
              <span>View-Only ({currentUser.role_name})</span>
            </span>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-[#5A6B75] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul training, kode pengajuan, atau departemen..."
            className="w-full h-[38px] text-xs pl-9 pr-3 border border-[#E2E8E8] rounded-[8px] focus:outline-none focus:border-[#E88932] bg-white text-[#18232B]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-[#5A6B75]" />
          <span className="text-[#5A6B75] font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-[38px] text-xs px-3 border border-[#E2E8E8] rounded-[8px] bg-white text-[#18232B] focus:outline-none focus:border-[#E88932] font-medium"
          >
            <option value="ALL">Semua Status ({visibleApps.length})</option>
            <option value="COMPLETED">COMPLETED (Terlaksana)</option>
            <option value="IN_PROGRESS">IN PROGRESS (Sedang Berjalan)</option>
            <option value="SCHEDULED">SCHEDULED (Terjadwal)</option>
            <option value="APPROVED">APPROVED (Disetujui)</option>
            <option value="PENDING_PJO">PENDING PJO</option>
            <option value="UNDER_HOD_REVIEW">UNDER HOD REVIEW</option>
            <option value="DRAFT">DRAFT</option>
            <option value="CANCELLED">CANCELLED (Dibatalkan)</option>
            <option value="REJECTED">REJECTED (Ditolak)</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-[12px] border border-[#E2E8E8] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#5A6B75]">
            Tidak ditemukan berkas pengajuan yang sesuai dengan kriteria pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F4F6F5] text-[#5A6B75] font-medium border-b border-[#E2E8E8]">
                <tr>
                  <th className="px-6 py-3">Kode & Judul Pelatihan</th>
                  <th className="px-6 py-3">Departemen</th>
                  <th className="px-6 py-3">Peserta</th>
                  <th className="px-6 py-3">Tanggal Pelaksanaan</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E8]">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-[#F4F6F5]/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="font-mono text-[11px] font-semibold text-[#E88932]">
                        {app.application_number}
                      </div>
                      <div className="text-[#18232B] font-heading font-semibold text-xs mt-0.5">
                        {app.training_title}
                      </div>
                      <div className="text-[11px] text-[#5A6B75]">
                        {app.training_category} • {app.training_type}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="font-medium text-[#18232B]">{app.department_name}</div>
                      <div className="text-[11px] text-[#5A6B75] font-mono">
                        Oleh: {app.submitter_name}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-mono font-medium text-[#263640] tabular-nums">
                      {app.participants?.length || 0} Personel
                    </td>
                    <td className="px-6 py-3.5 font-mono text-[#5A6B75] tabular-nums">
                      {app.proposed_start_date} s/d {app.proposed_end_date}
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={app.current_status} />
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Eye className="w-3.5 h-3.5" />}
                          onClick={() => setSelectedApp(app)}
                        >
                          Detail
                        </Button>
                        {perms.canEditData && (
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<Edit3 className="w-3.5 h-3.5" />}
                            onClick={() => handleOpenEdit(app)}
                          >
                            Edit
                          </Button>
                        )}
                        {isSuperAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteApp(app)}
                            title="Hapus Data Training (Khusus Super Admin)"
                            className="p-1.5 rounded-[8px] border border-[#B94C45]/30 text-[#B94C45] hover:bg-[#B94C45]/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Hapus 1 Data Training (Super Admin Only) */}
      {confirmDeleteApp && isSuperAdmin && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#18232B]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] shadow-2xl border border-[#E2E8E8] max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#B94C45] text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                <h3 className="text-sm font-heading font-bold">Konfirmasi Hapus Data Training</h3>
              </div>
              <button
                onClick={() => setConfirmDeleteApp(null)}
                className="text-white/80 hover:text-white p-1 rounded-[8px] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {deleteError && (
                <div className="p-3 bg-[#B94C45]/10 border border-[#B94C45]/30 rounded-[8px] text-xs text-[#B94C45]">
                  {deleteError}
                </div>
              )}
              <p className="text-xs text-[#263640] leading-relaxed">
                Apakah Anda yakin ingin menghapus data training{' '}
                <strong className="text-[#18232B]">{confirmDeleteApp.training_title}</strong> (
                <span className="font-mono text-[#E88932]">{confirmDeleteApp.application_number}</span>
                )? Data yang dihapus akan otomatis diperbarui pada perhitungan Training Achievement.
              </p>
              <div className="pt-3 border-t border-[#E2E8E8] flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setConfirmDeleteApp(null)}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="md"
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={executeSingleDelete}
                >
                  Ya, Hapus Data
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus SEMUA Data Training (Super Admin Only) */}
      {showDeleteAllConfirm && isSuperAdmin && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#18232B]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] shadow-2xl border border-[#E2E8E8] max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#B94C45] text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                <h3 className="text-sm font-heading font-bold">
                  Hapus Seluruh Data Training ({visibleApps.length} Program)
                </h3>
              </div>
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                className="text-white/80 hover:text-white p-1 rounded-[8px] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {deleteError && (
                <div className="p-3 bg-[#B94C45]/10 border border-[#B94C45]/30 rounded-[8px] text-xs text-[#B94C45]">
                  {deleteError}
                </div>
              )}
              <div className="p-3.5 bg-[#B94C45]/10 border border-[#B94C45]/30 rounded-[10px] text-xs text-[#B94C45] space-y-1">
                <div className="font-heading font-bold">Peringatan Otoritas Super Admin</div>
                <p className="text-[#263640]">
                  Tindakan ini akan menghapus seluruh <strong>{visibleApps.length} program training</strong> beserta jadwal dan riwayat pelaksanaannya dari database.
                </p>
              </div>
              <div className="pt-3 border-t border-[#E2E8E8] flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setShowDeleteAllConfirm(false)}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="md"
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={executeDeleteAllTrainings}
                >
                  Ya, Hapus Semua Training
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Training Data Modal */}
      {editingApp && perms.canEditData && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#18232B]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] shadow-2xl border border-[#E2E8E8] max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#18232B] text-white border-b border-[#263640] flex justify-between items-center">
              <div>
                <h3 className="text-sm font-heading font-bold">
                  Edit Data Training ({editingApp.application_number})
                </h3>
                <p className="text-[11px] text-slate-300">
                  Perubahan otomatis tersinkronisasi dengan perhitungan Training Achievement
                </p>
              </div>
              <button
                onClick={() => setEditingApp(null)}
                className="text-slate-400 hover:text-white p-1 rounded-[8px] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 bg-[#B94C45]/10 border border-[#B94C45]/30 rounded-[8px] text-xs text-[#B94C45] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#263640] mb-1">
                  Nama / Judul Pelatihan *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#263640] mb-1">
                    Kategori *
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                  >
                    {mockStore.trainingCategories.map((c) => (
                      <option key={c.id} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#263640] mb-1">
                    Jenis Training *
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                  >
                    {mockStore.trainingTypes.map((tt) => (
                      <option key={tt.id} value={tt.code}>
                        {tt.code} — {tt.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#263640] mb-1">
                    Provider / Instruktur *
                  </label>
                  <input
                    type="text"
                    required
                    value={editProvider}
                    onChange={(e) => setEditProvider(e.target.value)}
                    className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#263640] mb-1">
                    Lokasi Pelaksanaan *
                  </label>
                  <input
                    type="text"
                    required
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#263640] mb-1">
                    Tanggal Mulai *
                  </label>
                  <input
                    type="date"
                    required
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full h-[38px] px-2.5 text-xs font-mono bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#263640] mb-1">
                    Tanggal Selesai *
                  </label>
                  <input
                    type="date"
                    required
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full h-[38px] px-2.5 text-xs font-mono bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#263640] mb-1">
                    Anggaran (IDR) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editBudget}
                    onChange={(e) => setEditBudget(Number(e.target.value))}
                    className="w-full h-[38px] px-2.5 text-xs font-mono bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#263640] mb-1">
                  Divisi / Departemen *
                </label>
                <select
                  value={editDeptId}
                  onChange={(e) => setEditDeptId(e.target.value)}
                  className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                >
                  {mockStore.departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} — {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-[#F4F6F5] rounded-[8px] border border-[#E2E8E8]">
                <div>
                  <label className="block text-[11px] font-medium text-[#5A6B75] mb-1">
                    Target Peserta
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editPlannedParticipants}
                    onChange={(e) => setEditPlannedParticipants(Number(e.target.value))}
                    className="w-full h-[34px] px-2.5 text-xs font-mono bg-white border border-[#E2E8E8] rounded-[6px]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#5A6B75] mb-1">
                    Realisasi Peserta
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editActualParticipants}
                    onChange={(e) => setEditActualParticipants(Number(e.target.value))}
                    className="w-full h-[34px] px-2.5 text-xs font-mono bg-white border border-[#E2E8E8] rounded-[6px]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#5A6B75] mb-1">
                    Rencana Jam
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editPlannedHours}
                    onChange={(e) => setEditPlannedHours(Number(e.target.value))}
                    className="w-full h-[34px] px-2.5 text-xs font-mono bg-white border border-[#E2E8E8] rounded-[6px]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#5A6B75] mb-1">
                    Realisasi Jam
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editActualHours}
                    onChange={(e) => setEditActualHours(Number(e.target.value))}
                    className="w-full h-[34px] px-2.5 text-xs font-mono bg-white border border-[#E2E8E8] rounded-[6px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#263640] mb-1">
                  Status Pelaksanaan Training *
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as ApplicationStatus)}
                  className="w-full h-[38px] px-3 text-xs font-semibold bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                >
                  <option value="COMPLETED">COMPLETED (Sudah Terlaksana)</option>
                  <option value="IN_PROGRESS">IN_PROGRESS (Sedang Berjalan)</option>
                  <option value="SCHEDULED">SCHEDULED (Terjadwal)</option>
                  <option value="APPROVED">APPROVED (Disetujui)</option>
                  <option value="PENDING_PJO">PENDING_PJO</option>
                  <option value="UNDER_HOD_REVIEW">UNDER_HOD_REVIEW</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="CANCELLED">CANCELLED (Dibatalkan)</option>
                  <option value="REJECTED">REJECTED (Ditolak)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#E2E8E8] flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setEditingApp(null)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={<Save className="w-4 h-4" />}
                >
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail & Create Modals */}
      <ApplicationDetailModal
        isOpen={Boolean(selectedApp)}
        application={selectedApp}
        onClose={() => setSelectedApp(null)}
        onRefresh={() => {
          refreshState();
          setSelectedApp(null);
        }}
      />

      <CreateApplicationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => {
          refreshState();
          setShowCreateModal(false);
        }}
      />
    </div>
  );
};
