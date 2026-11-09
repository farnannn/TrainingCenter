import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import { Employee, SiteOption, getRolePermissions } from '../../lib/types';
import { Button } from '../ui/Button';
import {
  Users,
  Search,
  Upload,
  Plus,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2,
  MapPin,
  Save,
  X,
} from 'lucide-react';

export const EmployeeRoster: React.FC = () => {
  const { currentUser, refreshState } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [siteFilter, setSiteFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSiteManagerModal, setShowSiteManagerModal] = useState(false);

  // Add Individual Employee State
  const userDeptId = mockStore.getUserActiveDeptId(currentUser.id);
  const [nik, setNik] = useState('');
  const [fullName, setFullName] = useState('');
  const [deptId, setDeptId] = useState(userDeptId || mockStore.departments[0].id);
  const [position, setPosition] = useState('');
  const [jobLevel, setJobLevel] = useState('Operator / Teknisi');
  const [empStatus, setEmpStatus] = useState<'PERMANENT' | 'CONTRACT' | 'INTERN'>('PERMANENT');
  const [projectSite, setProjectSite] = useState(
    mockStore.sites[0]?.name || 'Site Tangofa'
  );
  const [formError, setFormError] = useState<string | null>(null);

  // Master Site Management State
  const [editingSite, setEditingSite] = useState<SiteOption | null>(null);
  const [siteNameInput, setSiteNameInput] = useState('');
  const [siteCodeInput, setSiteCodeInput] = useState('');
  const [siteDescInput, setSiteDescInput] = useState('');
  const [siteFormError, setSiteFormError] = useState<string | null>(null);
  const [siteFormSuccess, setSiteFormSuccess] = useState<string | null>(null);

  // Bulk Upload / Paste State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [bulkText, setBulkText] = useState('');
  const [uploadResult, setUploadResult] = useState<{
    addedCount: number;
    skipped: string[];
  } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const employees = mockStore.getVisibleEmployees(currentUser.id);
  const perms = getRolePermissions(currentUser.role_code);
  const isSuperAdmin = currentUser.role_code === 'SUPER_ADMIN';
  const isDeptUser = false;
  const canModify =
    (perms.canInputData || perms.canEditData) &&
    perms.employeeData !== 'VIEW' &&
    currentUser.role_code !== 'MANAGER_TC' &&
    currentUser.role_code !== 'PJO';

  const [confirmDeleteEmp, setConfirmDeleteEmp] = useState<Employee | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const executeSingleEmpDelete = () => {
    if (!confirmDeleteEmp || !isSuperAdmin) return;
    setDeleteError(null);
    try {
      mockStore.deleteEmployee(currentUser.id, confirmDeleteEmp.id);
      setConfirmDeleteEmp(null);
      refreshState();
    } catch (err: any) {
      setDeleteError(err.message || 'Gagal menghapus data karyawan.');
    }
  };

  const executeDeleteAllEmployees = () => {
    if (!isSuperAdmin) return;
    setDeleteError(null);
    try {
      mockStore.deleteAllEmployees(currentUser.id);
      setShowDeleteAllConfirm(false);
      refreshState();
    } catch (err: any) {
      setDeleteError(err.message || 'Gagal menghapus seluruh data karyawan.');
    }
  };

  const filtered = employees.filter((e) => {
    const empSite = e.project_site || 'Site Tangofa';
    const matchesSearch =
      e.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.nik.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      empSite.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSite = siteFilter === 'ALL' || empSite === siteFilter;
    return matchesSearch && matchesSite;
  });

  // Download CSV Template
  const handleDownloadTemplate = () => {
    const defaultDeptCode = isDeptUser
      ? mockStore.departments.find((d) => d.id === userDeptId)?.code || 'MOD'
      : 'MOD';
    const sampleCsv = [
      'NIK,Nama Lengkap,Kode Departemen,Jabatan,Job Level,Status Kerja,Site',
      `RAJA-${defaultDeptCode}-201,Andi Pratama Putra,${defaultDeptCode},Operator Excavator PC400,Senior Operator,PERMANENT,Site Tangofa`,
      `RAJA-${defaultDeptCode}-202,Rahmat Hidayatullah,${defaultDeptCode},Driver Dump Truck HD,Operator,CONTRACT,Site TPM`,
      `RAJA-${defaultDeptCode}-203,Surya Darmawan,${defaultDeptCode},Foreman Pit Hauling,Supervisor,PERMANENT,Site Gorontalo`,
    ].join('\n');

    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Template_Upload_Karyawan_PT_RAJA.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Parse CSV lines into structured objects
  const parseCsvLines = (raw: string) => {
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const parsedRows: Array<{
      nik?: string;
      full_name: string;
      department_code?: string;
      position?: string;
      job_level?: string;
      employment_status?: string;
      project_site?: string;
    }> = [];

    lines.forEach((line, index) => {
      // Skip header line if detected
      if (
        index === 0 &&
        (line.toLowerCase().includes('nama lengkap') ||
          line.toLowerCase().includes('full_name') ||
          line.toLowerCase().startsWith('nik,'))
      ) {
        return;
      }

      const cols = line.split(/[,\t;]/).map((c) => c.trim().replace(/^"|"$/g, ''));

      // Support either just "Nama Lengkap" (1 column) or "NIK, Nama Lengkap, Kode Dept, Jabatan, Level, Status, Site"
      if (cols.length === 1) {
        parsedRows.push({
          full_name: cols[0],
        });
      } else {
        parsedRows.push({
          nik: cols[0],
          full_name: cols[1] || cols[0],
          department_code: cols[2],
          position: cols[3],
          job_level: cols[4],
          employment_status: cols[5],
          project_site: cols[6],
        });
      }
    });

    return parsedRows;
  };

  // Handle CSV File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setBulkText(content);
        setUploadError(null);
      }
    };
    reader.readAsText(file);
  };

  // Process Bulk Upload
  const handleProcessUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setUploadResult(null);

    if (!bulkText.trim()) {
      setUploadError('Silakan pilih file CSV atau tempel (paste) daftar nama karyawan terlebih dahulu.');
      return;
    }

    try {
      const rows = parseCsvLines(bulkText);
      if (rows.length === 0) {
        setUploadError('Tidak ada baris data karyawan yang valid untuk diunggah.');
        return;
      }

      const res = mockStore.bulkUploadEmployees(currentUser.id, rows);
      refreshState();
      setUploadResult({
        addedCount: res.added.length,
        skipped: res.skipped,
      });
      if (res.added.length > 0) {
        setBulkText('');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Gagal mengunggah data karyawan.');
    }
  };

  const openCreateModal = () => {
    setEditingEmp(null);
    setNik('');
    setFullName('');
    setDeptId(userDeptId || mockStore.departments[0].id);
    setPosition('');
    setJobLevel('Operator / Teknisi');
    setEmpStatus('PERMANENT');
    setProjectSite(mockStore.sites[0]?.name || 'Site Tangofa');
    setFormError(null);
    setShowAddModal(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmp(emp);
    setNik(emp.nik);
    setFullName(emp.full_name);
    setDeptId(emp.department_id);
    setPosition(emp.position);
    setJobLevel(emp.job_level);
    setEmpStatus(emp.employment_status);
    setProjectSite(emp.project_site || mockStore.sites[0]?.name || 'Site Tangofa');
    setFormError(null);
    setShowAddModal(true);
  };

  const openSiteManager = () => {
    setEditingSite(null);
    setSiteNameInput('');
    setSiteCodeInput('');
    setSiteDescInput('');
    setSiteFormError(null);
    setSiteFormSuccess(null);
    setShowSiteManagerModal(true);
  };

  const handleSaveSite = (e: React.FormEvent) => {
    e.preventDefault();
    setSiteFormError(null);
    setSiteFormSuccess(null);
    try {
      if (editingSite) {
        mockStore.updateSite(currentUser.id, editingSite.id, {
          name: siteNameInput,
          code: siteCodeInput,
          description: siteDescInput,
        });
        setSiteFormSuccess(`Site "${siteNameInput}" berhasil diperbarui.`);
      } else {
        const added = mockStore.addSite(currentUser.id, {
          name: siteNameInput,
          code: siteCodeInput,
          description: siteDescInput,
        });
        setProjectSite(added.name);
        setSiteFormSuccess(`Site "${added.name}" berhasil ditambahkan.`);
      }
      setEditingSite(null);
      setSiteNameInput('');
      setSiteCodeInput('');
      setSiteDescInput('');
      refreshState();
    } catch (err: any) {
      setSiteFormError(err.message || 'Gagal menyimpan opsi Site.');
    }
  };

  const handleStartEditSite = (s: SiteOption) => {
    setEditingSite(s);
    setSiteNameInput(s.name);
    setSiteCodeInput(s.code);
    setSiteDescInput(s.description || '');
    setSiteFormError(null);
    setSiteFormSuccess(null);
  };

  const handleDeleteSite = (s: SiteOption) => {
    setSiteFormError(null);
    setSiteFormSuccess(null);
    try {
      mockStore.deleteSite(currentUser.id, s.id);
      setSiteFormSuccess(`Site "${s.name}" berhasil dihapus.`);
      refreshState();
    } catch (err: any) {
      setSiteFormError(err.message || 'Gagal menghapus opsi Site.');
    }
  };

  // Handle Single Employee Add or Edit
  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      if (editingEmp) {
        mockStore.updateEmployee(currentUser.id, editingEmp.id, {
          nik,
          full_name: fullName,
          department_id: isDeptUser && userDeptId ? userDeptId : deptId,
          position,
          job_level: jobLevel,
          employment_status: empStatus,
          project_site: projectSite,
        });
      } else {
        mockStore.addEmployee(currentUser.id, {
          nik,
          full_name: fullName,
          department_id: isDeptUser && userDeptId ? userDeptId : deptId,
          position,
          job_level: jobLevel,
          employment_status: empStatus,
          project_site: projectSite,
        });
      }
      refreshState();
      setEditingEmp(null);
      setNik('');
      setFullName('');
      setPosition('');
      setShowAddModal(false);
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan data karyawan.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-[12px] border border-[#E2E8E8]">
        <div>
          <h3 className="text-base font-heading font-bold text-[#18232B] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#E88932]" />
            <span>Direktori & Upload Data Karyawan</span>
          </h3>
          <p className="text-xs text-[#5A6B75] mt-0.5">
            {isDeptUser
              ? `Data personel khusus departemen ${currentUser.department_name} (Isolasi RLS MOD-MED aktif)`
              : 'Database seluruh personel operasional tambang PT. Roda Jaya Sakti'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isSuperAdmin && employees.length > 0 && (
            <Button
              variant="danger"
              size="md"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => {
                setDeleteError(null);
                setShowDeleteAllConfirm(true);
              }}
            >
              Hapus Semua Karyawan
            </Button>
          )}
          {canModify ? (
            <>
              <Button
                variant="outline"
                size="md"
                icon={<MapPin className="w-4 h-4 text-[#E88932]" />}
                onClick={openSiteManager}
              >
                Kelola Opsi Site ({mockStore.sites.length})
              </Button>
              <Button
                variant="outline"
                size="md"
                icon={<Download className="w-4 h-4" />}
                onClick={handleDownloadTemplate}
              >
                Template CSV
              </Button>
              <Button
                variant="secondary"
                size="md"
                icon={<Upload className="w-4 h-4" />}
                onClick={() => {
                  setUploadResult(null);
                  setUploadError(null);
                  setShowUploadModal(true);
                }}
              >
                Upload CSV / Nama Karyawan
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={<Plus className="w-4 h-4" />}
                onClick={openCreateModal}
              >
                Tambah Karyawan
              </Button>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#F4F6F5] border border-[#E2E8E8] text-xs font-mono font-semibold text-[#5A6B75]">
              <span>Mode Akses: LIHAT SAJA ({currentUser.role_name})</span>
            </span>
          )}
        </div>
      </div>

      {/* Search Bar, Site Filter & Total Count */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[260px] flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#5A6B75] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama karyawan, NIK, jabatan, atau site..."
              className="w-full h-[38px] text-xs pl-9 pr-3 border border-[#E2E8E8] rounded-[8px] focus:outline-none focus:border-[#E88932] bg-white text-[#18232B]"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-white px-3 h-[38px] rounded-[8px] border border-[#E2E8E8]">
            <MapPin className="w-3.5 h-3.5 text-[#E88932] shrink-0" />
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className="text-xs font-medium text-[#18232B] bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Site ({mockStore.sites.length} Site)</option>
              {mockStore.sites.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs font-mono text-[#5A6B75] tabular-nums">
          Menampilkan <strong className="text-[#18232B]">{filtered.length}</strong> dari{' '}
          <strong className="text-[#18232B]">{employees.length}</strong> personel aktif
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-[12px] border border-[#E2E8E8] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#5A6B75]">
            Tidak ada data karyawan yang ditemukan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F4F6F5] text-[#5A6B75] font-medium border-b border-[#E2E8E8]">
                <tr>
                  <th className="px-6 py-3">Nama Karyawan & NIK</th>
                  <th className="px-6 py-3">Divisi / Departemen</th>
                  <th className="px-6 py-3">Site / Lokasi Kerja</th>
                  <th className="px-6 py-3">Jabatan / Posisi</th>
                  <th className="px-6 py-3">Level Jabatan</th>
                  <th className="px-6 py-3">Status Kepegawaian</th>
                  {(canModify || isSuperAdmin) && (
                    <th className="px-6 py-3 text-right">Tindakan</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E8]">
                {filtered.map((emp) => {
                  const dept = mockStore.departments.find((d) => d.id === emp.department_id);
                  const empSiteName = emp.project_site || 'Site Tangofa';

                  return (
                    <tr key={emp.id} className="hover:bg-[#F4F6F5]/50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="font-heading font-semibold text-[#18232B]">
                          {emp.full_name}
                        </div>
                        <div className="text-[11px] font-mono text-[#E88932] mt-0.5">
                          {emp.nik}
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="font-mono font-semibold text-xs px-2 py-0.5 rounded bg-[#F4F6F5] text-[#18232B] border border-[#E2E8E8]">
                          {dept?.code}
                        </span>
                        <div className="text-[11px] text-[#5A6B75] mt-0.5">{dept?.name}</div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[11px] font-semibold bg-[#E88932]/10 text-[#C66B1A] border border-[#E88932]/30">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>{empSiteName}</span>
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-[#18232B] font-medium">{emp.position}</td>
                      <td className="px-6 py-3.5">
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-[#F4F6F5] text-[#263640] border border-[#E2E8E8]">
                          {emp.job_level}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium bg-[#397C69]/12 text-[#296050] border border-[#397C69]/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{emp.employment_status}</span>
                        </span>
                      </td>
                      {(canModify || isSuperAdmin) && (
                        <td className="px-6 py-3.5 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            {canModify && (
                              <Button
                                variant="outline"
                                size="sm"
                                icon={<Edit3 className="w-3.5 h-3.5" />}
                                onClick={() => openEditModal(emp)}
                              >
                                Edit
                              </Button>
                            )}
                            {isSuperAdmin && (
                              <Button
                                variant="danger"
                                size="sm"
                                icon={<Trash2 className="w-3.5 h-3.5" />}
                                onClick={() => {
                                  setDeleteError(null);
                                  setConfirmDeleteEmp(emp);
                                }}
                              >
                                Hapus
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Hapus 1 Karyawan (Super Admin Only) */}
      {confirmDeleteEmp && isSuperAdmin && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#18232B]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] shadow-2xl border border-[#E2E8E8] max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#B94C45] text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                <h3 className="text-sm font-heading font-bold">Konfirmasi Hapus Data Karyawan</h3>
              </div>
              <button
                onClick={() => setConfirmDeleteEmp(null)}
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
                Apakah Anda yakin ingin menghapus data karyawan{' '}
                <strong className="text-[#18232B]">{confirmDeleteEmp.full_name}</strong> (NIK:{' '}
                <span className="font-mono text-[#E88932]">{confirmDeleteEmp.nik}</span>) dari sistem?
              </p>
              <div className="pt-3 border-t border-[#E2E8E8] flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setConfirmDeleteEmp(null)}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="md"
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={executeSingleEmpDelete}
                >
                  Ya, Hapus Karyawan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus SEMUA Karyawan (Super Admin Only) */}
      {showDeleteAllConfirm && isSuperAdmin && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#18232B]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] shadow-2xl border border-[#E2E8E8] max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#B94C45] text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                <h3 className="text-sm font-heading font-bold">
                  Hapus Seluruh Data Karyawan ({employees.length} Personel)
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
                  Tindakan ini akan menghapus seluruh <strong>{employees.length} data karyawan</strong> dari direktori personel PT. Roda Jaya Sakti.
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
                  onClick={executeDeleteAllEmployees}
                >
                  Ya, Hapus Semua Karyawan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Bulk Upload CSV / Paste Employee Names */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#18232B]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] shadow-2xl border border-[#E2E8E8] max-w-xl w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#18232B] text-white border-b border-[#263640] flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-[#E88932]" />
                <div>
                  <h3 className="text-sm font-heading font-bold">
                    Upload File CSV / Daftar Nama Karyawan
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Impor banyak karyawan sekaligus dari Excel/CSV atau tempel daftar nama langsung
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-[8px] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessUpload} className="p-6 space-y-4">
              {uploadError && (
                <div className="p-3 bg-[#B94C45]/10 border border-[#B94C45]/30 rounded-[8px] text-xs text-[#B94C45] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadResult && (
                <div className="p-4 bg-[#397C69]/10 border border-[#397C69]/30 rounded-[10px] text-xs space-y-1.5">
                  <div className="font-heading font-bold text-[#296050] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#397C69]" />
                    <span>Berhasil Mengimpor {uploadResult.addedCount} Karyawan Baru!</span>
                  </div>
                  {uploadResult.skipped.length > 0 && (
                    <div className="text-[11px] text-[#8C6412] mt-1">
                      Dilewati ({uploadResult.skipped.length}): {uploadResult.skipped.join('; ')}
                    </div>
                  )}
                </div>
              )}

              {/* File Picker Box */}
              <div className="p-4 bg-[#F4F6F5] rounded-[10px] border border-dashed border-[#CBD5D5] flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs">
                  <div className="font-heading font-semibold text-[#18232B]">
                    Pilih File CSV dari Komputer
                  </div>
                  <div className="text-[11px] text-[#5A6B75]">
                    Format kolom: <code className="font-mono">NIK, Nama Lengkap, Kode Dept, Jabatan</code>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={<Upload className="w-3.5 h-3.5" />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Pilih File .CSV
                  </Button>
                </div>
              </div>

              {/* Direct Paste Textarea */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-[#263640]">
                    Atau Tempel (Copy-Paste) Daftar Nama Karyawan / Baris CSV:
                  </label>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="text-[11px] text-[#E88932] hover:underline font-medium cursor-pointer"
                  >
                    Unduh Contoh CSV
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={`Contoh 1 (Lengkap dengan NIK & Jabatan):\nRAJA-MOD-201, Andi Pratama, MOD, Operator Excavator PC400, Senior Operator, PERMANENT\nRAJA-MOD-202, Rahmat Hidayat, MOD, Driver Dump Truck, Operator, CONTRACT\n\nContoh 2 (Cukup ketik 1 nama per baris, NIK dibuat otomatis):\nBudi Santoso\nHendra Wijaya`}
                  className="w-full text-xs font-mono p-3 bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932] text-[#18232B]"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E8E8] flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setShowUploadModal(false)}
                >
                  Tutup
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={<Upload className="w-4 h-4" />}
                >
                  Proses & Simpan Karyawan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Single Employee */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#18232B]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] shadow-2xl border border-[#E2E8E8] max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#18232B] text-white border-b border-[#263640] flex justify-between items-center">
              <div>
                <h3 className="text-sm font-heading font-bold">
                  {editingEmp ? 'Edit Data Karyawan' : 'Tambah Personel Karyawan Baru'}
                </h3>
                <p className="text-[11px] text-slate-300">
                  {editingEmp
                    ? 'Perbarui identitas, NIK, departemen, atau jabatan karyawan'
                    : 'Masukkan identitas karyawan untuk didaftarkan ke dalam sistem THR'}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingEmp(null);
                  setShowAddModal(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-[8px] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSingle} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-[#B94C45]/10 border border-[#B94C45]/30 rounded-[8px] text-xs text-[#B94C45] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#263640] mb-1">
                    Nomor Induk Karyawan (NIK) *
                  </label>
                  <input
                    type="text"
                    required
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    placeholder="Contoh: RAJA-MOD-109"
                    className="w-full h-[38px] px-3 text-xs font-mono bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#263640] mb-1">
                    Departemen *
                  </label>
                  <select
                    value={isDeptUser && userDeptId ? userDeptId : deptId}
                    disabled={isDeptUser}
                    onChange={(e) => setDeptId(e.target.value)}
                    className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932] disabled:opacity-60"
                  >
                    {mockStore.departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} — {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#263640] mb-1">
                  Nama Lengkap Karyawan *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masukkan nama lengkap sesuai KTP / ID Card..."
                  className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#263640] mb-1">
                    Jabatan / Posisi *
                  </label>
                  <input
                    type="text"
                    required
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Contoh: Operator Excavator"
                    className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#263640] mb-1">
                    Level Jabatan
                  </label>
                  <input
                    type="text"
                    value={jobLevel}
                    onChange={(e) => setJobLevel(e.target.value)}
                    placeholder="Operator / Supervisor / Engineer"
                    className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-[#263640]">
                      Site / Lokasi Kerja *
                    </label>
                    <button
                      type="button"
                      onClick={openSiteManager}
                      className="text-[11px] font-semibold text-[#E88932] hover:underline cursor-pointer"
                    >
                      + Tambah / Edit Site
                    </button>
                  </div>
                  <select
                    value={projectSite}
                    onChange={(e) => setProjectSite(e.target.value)}
                    className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                  >
                    {mockStore.sites.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#263640] mb-1">
                    Status Kepegawaian
                  </label>
                  <select
                    value={empStatus}
                    onChange={(e) =>
                      setEmpStatus(e.target.value as 'PERMANENT' | 'CONTRACT' | 'INTERN')
                    }
                    className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                  >
                    <option value="PERMANENT">PERMANENT (Karyawan Tetap)</option>
                    <option value="CONTRACT">CONTRACT (PKWT)</option>
                    <option value="INTERN">INTERN (Magang / Trainee)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8E8] flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setEditingEmp(null);
                    setShowAddModal(false);
                  }}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={editingEmp ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                >
                  {editingEmp ? 'Simpan Perubahan' : 'Simpan Karyawan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Kelola Master Opsi Site (Tambah, Edit, Hapus Site) */}
      {showSiteManagerModal && canModify && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#18232B]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] shadow-2xl border border-[#E2E8E8] max-w-2xl w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#18232B] text-white border-b border-[#263640] flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-[#E88932]" />
                <div>
                  <h3 className="text-sm font-heading font-bold">
                    Kelola Master Opsi Site Operasional
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Tambah, edit, atau hapus daftar Site lokasi kerja karyawan PT. Roda Jaya Sakti
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSiteManagerModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-[8px] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {siteFormError && (
                <div className="p-3 bg-[#B94C45]/10 border border-[#B94C45]/30 rounded-[8px] text-xs text-[#B94C45] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{siteFormError}</span>
                </div>
              )}

              {siteFormSuccess && (
                <div className="p-3 bg-[#397C69]/10 border border-[#397C69]/30 rounded-[8px] text-xs text-[#296050] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#397C69] shrink-0" />
                  <span>{siteFormSuccess}</span>
                </div>
              )}

              {/* Form Tambah / Edit Site */}
              <form
                onSubmit={handleSaveSite}
                className="p-4 bg-[#F4F6F5] rounded-[10px] border border-[#E2E8E8] space-y-3"
              >
                <div className="text-xs font-heading font-bold text-[#18232B]">
                  {editingSite ? `Edit Site: ${editingSite.name}` : 'Tambah Opsi Site Baru'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-[#5A6B75] mb-1">
                      Nama Site *
                    </label>
                    <input
                      type="text"
                      required
                      value={siteNameInput}
                      onChange={(e) => setSiteNameInput(e.target.value)}
                      placeholder="Contoh: Site Tangofa / Site Baru"
                      className="w-full h-[36px] px-3 text-xs bg-white border border-[#E2E8E8] rounded-[8px] focus:outline-none focus:border-[#E88932] text-[#18232B]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#5A6B75] mb-1">
                      Kode Site (Opsional)
                    </label>
                    <input
                      type="text"
                      value={siteCodeInput}
                      onChange={(e) => setSiteCodeInput(e.target.value)}
                      placeholder="Contoh: TANGOFA"
                      className="w-full h-[36px] px-3 text-xs font-mono uppercase bg-white border border-[#E2E8E8] rounded-[8px] focus:outline-none focus:border-[#E88932] text-[#18232B]"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <input
                    type="text"
                    value={siteDescInput}
                    onChange={(e) => setSiteDescInput(e.target.value)}
                    placeholder="Keterangan lokasi operasional (opsional)..."
                    className="flex-1 min-w-[200px] h-[36px] px-3 text-xs bg-white border border-[#E2E8E8] rounded-[8px] focus:outline-none focus:border-[#E88932] text-[#18232B]"
                  />
                  <div className="flex items-center gap-2">
                    {editingSite && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingSite(null);
                          setSiteNameInput('');
                          setSiteCodeInput('');
                          setSiteDescInput('');
                        }}
                      >
                        Batal Edit
                      </Button>
                    )}
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      icon={editingSite ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    >
                      {editingSite ? 'Simpan Perubahan Site' : 'Tambah Site'}
                    </Button>
                  </div>
                </div>
              </form>

              {/* Tabel Daftar Site */}
              <div className="border border-[#E2E8E8] rounded-[10px] overflow-hidden max-h-[320px] overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F4F6F5] text-[#5A6B75] font-medium border-b border-[#E2E8E8] sticky top-0">
                    <tr>
                      <th className="px-4 py-2.5">Nama Site</th>
                      <th className="px-4 py-2.5">Kode</th>
                      <th className="px-4 py-2.5">Jumlah Karyawan</th>
                      <th className="px-4 py-2.5 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8E8]">
                    {mockStore.sites.map((site) => {
                      const empCount = employees.filter(
                        (e) => (e.project_site || 'Site Tangofa') === site.name
                      ).length;
                      return (
                        <tr key={site.id} className="hover:bg-[#F4F6F5]/60">
                          <td className="px-4 py-2.5">
                            <div className="font-heading font-semibold text-[#18232B] flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-[#E88932] shrink-0" />
                              <span>{site.name}</span>
                            </div>
                            {site.description && (
                              <div className="text-[11px] text-[#5A6B75] pl-5">
                                {site.description}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-[#F4F6F5] text-[#18232B] border border-[#E2E8E8]">
                              {site.code}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-[#5A6B75]">
                            {empCount} Personel
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                icon={<Edit3 className="w-3 h-3" />}
                                onClick={() => handleStartEditSite(site)}
                              >
                                Edit
                              </Button>
                              {isSuperAdmin && (
                                <Button
                                  type="button"
                                  variant="danger"
                                  size="sm"
                                  icon={<Trash2 className="w-3 h-3" />}
                                  onClick={() => handleDeleteSite(site)}
                                >
                                  Hapus
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setShowSiteManagerModal(false)}
                >
                  Selesai
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
