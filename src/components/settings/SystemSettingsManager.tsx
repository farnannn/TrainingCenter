import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import {
  getRolePermissions,
  ROLE_PERMISSIONS,
  RoleCode,
  RolePermissionMatrix,
} from '../../lib/types';
import { Button } from '../ui/Button';
import { AuditLogViewer } from '../audit/AuditLogViewer';
import {
  Settings,
  ShieldCheck,
  Save,
  CheckCircle2,
  Lock,
  Sliders,
  RotateCcw,
} from 'lucide-react';

export const SystemSettingsManager: React.FC = () => {
  const { currentUser, refreshState } = useAuth();
  const perms = getRolePermissions(currentUser.role_code);
  const isSuperAdmin =
    currentUser.role_code === 'SUPER_ADMIN' || perms.canManageSystemSettings;

  const [companyName, setCompanyName] = useState(mockStore.systemSettings.companyName);
  const [portalName, setPortalName] = useState(mockStore.systemSettings.portalName);
  const [operationalSite, setOperationalSite] = useState(
    mockStore.systemSettings.operationalSite
  );
  const [headOffice, setHeadOffice] = useState(mockStore.systemSettings.headOffice);
  const [annualHoursTarget, setAnnualHoursTarget] = useState(
    mockStore.systemSettings.annualTrainingHoursTargetPerEmployee
  );
  const [minPassScore, setMinPassScore] = useState(
    mockStore.systemSettings.minimumPassScore
  );
  const [achievementTargetPct, setAchievementTargetPct] = useState(
    mockStore.systemSettings.mandatoryAchievementTargetPercent
  );
  const [savedNotice, setSavedNotice] = useState(false);
  const [rbacSavedMsg, setRbacSavedMsg] = useState<string | null>(null);

  if (!isSuperAdmin) {
    return (
      <div className="p-8 bg-white rounded-[12px] border border-[#B94C45]/30 text-center space-y-2">
        <Lock className="w-8 h-8 text-[#B94C45] mx-auto" />
        <h3 className="text-sm font-heading font-bold text-[#18232B]">
          Akses Ditolak (Super Admin Exclusive)
        </h3>
        <p className="text-xs text-[#5A6B75]">
          Hanya role <strong>Super Admin</strong> yang memiliki hak akses ke menu System Settings & Pengaturan Matriks RBAC.
        </p>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    mockStore.updateSystemSettings(currentUser.id, {
      companyName,
      portalName,
      operationalSite,
      headOffice,
      annualTrainingHoursTargetPerEmployee: Number(annualHoursTarget),
      minimumPassScore: Number(minPassScore),
      mandatoryAchievementTargetPercent: Number(achievementTargetPct),
    });
    refreshState();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const rolesList: Array<{ code: RoleCode; label: string }> = [
    { code: 'SUPER_ADMIN', label: 'Super Admin' },
    { code: 'ADMIN', label: 'Admin' },
    { code: 'PJO', label: 'PJO' },
    { code: 'MANAGER_TC', label: 'Manager TC' },
    { code: 'ADMIN_TC', label: 'Admin TC' },
    { code: 'ADMIN_HRGA', label: 'Admin HRGA' },
  ];

  const handlePermissionChange = <K extends keyof RolePermissionMatrix>(
    roleCode: RoleCode,
    roleLabel: string,
    field: K,
    nextVal: RolePermissionMatrix[K]
  ) => {
    // Protect SUPER_ADMIN from accidentally disabling its own System Settings or User Management access
    if (
      roleCode === 'SUPER_ADMIN' &&
      (field === 'canManageSystemSettings' || field === 'canManageUsers')
    ) {
      return;
    }

    mockStore.updateRolePermission(currentUser.id, roleCode, {
      [field]: nextVal,
    });
    refreshState();
    setRbacSavedMsg(
      `Hak akses role "${roleLabel}" berhasil diperbarui dan langsung aktif di seluruh sistem!`
    );
  };

  const handleResetRbac = () => {
    mockStore.resetRolePermissionsToDefault(currentUser.id);
    refreshState();
    setRbacSavedMsg('Matriks Hak Akses (RBAC) berhasil dikembalikan ke pengaturan default.');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#18232B] bg-topography text-white p-6 rounded-[12px] border border-[#263640]">
        <div className="flex items-center gap-2 text-[#E88932] text-xs font-mono font-semibold uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          <span>System Settings & Governance Configuration • Super Admin Only</span>
        </div>
        <h2 className="text-xl font-heading font-bold mt-1">
          Pengaturan Sistem & Matriks Hak Akses (RBAC)
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl">
          Kelola parameter operasional RAJA ACADEMY, standar kelulusan, target capaian tahunan, serta atur / edit langsung matriks kewenangan RBAC untuk ke-6 Role resmi.
        </p>
      </div>

      {/* Interactive & Editable RBAC Matrix Table (Super Admin Exclusive) */}
      <div className="bg-white rounded-[12px] border border-[#E2E8E8] overflow-hidden shadow-xs">
        <div className="px-6 py-4 bg-[#F4F6F5] border-b border-[#E2E8E8] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-heading font-bold text-[#18232B] uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#E88932]" />
              <span>Matriks Role-Based Access Control (RBAC — 6 Role Resmi)</span>
            </h3>
            <p className="text-xs text-[#5A6B75] mt-0.5">
              Diterapkan secara penuh pada tingkat DataStore/Backend API dan antarmuka Frontend. <strong>Klik pada opsi di setiap kolom untuk mengubah hak akses role.</strong>
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={handleResetRbac}
          >
            Reset Hak Akses Default
          </Button>
        </div>

        {rbacSavedMsg && (
          <div className="mx-6 mt-4 p-3 bg-[#397C69]/12 border border-[#397C69]/30 rounded-[8px] text-xs text-[#296050] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-[#397C69] shrink-0" />
              <span>{rbacSavedMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setRbacSavedMsg(null)}
              className="text-xs text-[#5A6B75] hover:text-[#18232B] cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#18232B] text-white font-heading">
              <tr>
                <th className="px-5 py-3.5">Fitur / Kewenangan</th>
                {rolesList.map((r) => (
                  <th key={r.code} className="px-4 py-3.5 text-center">
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8E8]">
              {/* 1. Dashboard: Full Access / View */}
              <tr>
                <td className="px-5 py-3 font-semibold text-[#18232B]">Dashboard</td>
                {rolesList.map((r) => {
                  const val = ROLE_PERMISSIONS[r.code].dashboard;
                  return (
                    <td key={r.code} className="px-3 py-2.5 text-center">
                      <select
                        value={val}
                        onChange={(e) =>
                          handlePermissionChange(
                            r.code,
                            r.label,
                            'dashboard',
                            e.target.value as 'FULL' | 'VIEW'
                          )
                        }
                        className={`font-mono text-xs font-semibold px-2.5 py-1 rounded-[6px] border cursor-pointer focus:outline-none ${
                          val === 'FULL'
                            ? 'bg-[#397C69]/12 text-[#296050] border-[#397C69]/30'
                            : 'bg-[#F4F6F5] text-[#5A6B75] border-[#E2E8E8]'
                        }`}
                      >
                        <option value="FULL">Full Access</option>
                        <option value="VIEW">View</option>
                      </select>
                    </td>
                  );
                })}
              </tr>

              {/* 2. Data Training: Edit / View */}
              <tr className="bg-[#F4F6F5]/50">
                <td className="px-5 py-3 font-semibold text-[#18232B]">Data Training</td>
                {rolesList.map((r) => {
                  const val = ROLE_PERMISSIONS[r.code].trainingData;
                  return (
                    <td key={r.code} className="px-3 py-2.5 text-center">
                      <select
                        value={val}
                        onChange={(e) =>
                          handlePermissionChange(
                            r.code,
                            r.label,
                            'trainingData',
                            e.target.value as 'EDIT' | 'VIEW'
                          )
                        }
                        className={`font-mono text-xs font-semibold px-2.5 py-1 rounded-[6px] border cursor-pointer focus:outline-none ${
                          val === 'EDIT'
                            ? 'bg-[#397C69]/12 text-[#296050] border-[#397C69]/30'
                            : 'bg-[#D5A33D]/15 text-[#8C6412] border-[#D5A33D]/30'
                        }`}
                      >
                        <option value="EDIT">Edit</option>
                        <option value="VIEW">View</option>
                      </select>
                    </td>
                  );
                })}
              </tr>

              {/* 3. Training Achievement: Edit / View */}
              <tr>
                <td className="px-5 py-3 font-semibold text-[#18232B]">
                  Training Achievement
                </td>
                {rolesList.map((r) => {
                  const val = ROLE_PERMISSIONS[r.code].trainingAchievement;
                  return (
                    <td key={r.code} className="px-3 py-2.5 text-center">
                      <select
                        value={val}
                        onChange={(e) =>
                          handlePermissionChange(
                            r.code,
                            r.label,
                            'trainingAchievement',
                            e.target.value as 'EDIT' | 'VIEW'
                          )
                        }
                        className={`font-mono text-xs font-bold px-2.5 py-1 rounded-[6px] border cursor-pointer focus:outline-none ${
                          val === 'EDIT'
                            ? 'bg-[#397C69]/12 text-[#296050] border-[#397C69]/30'
                            : 'bg-[#D5A33D]/15 text-[#8C6412] border-[#D5A33D]/30'
                        }`}
                      >
                        <option value="EDIT">Edit</option>
                        <option value="VIEW">View</option>
                      </select>
                    </td>
                  );
                })}
              </tr>

              {/* 4. Data Karyawan: Edit / View */}
              <tr className="bg-[#F4F6F5]/50">
                <td className="px-5 py-3 font-semibold text-[#18232B]">Data Karyawan</td>
                {rolesList.map((r) => {
                  const val = ROLE_PERMISSIONS[r.code].employeeData;
                  return (
                    <td key={r.code} className="px-3 py-2.5 text-center">
                      <select
                        value={val}
                        onChange={(e) =>
                          handlePermissionChange(
                            r.code,
                            r.label,
                            'employeeData',
                            e.target.value as 'EDIT' | 'VIEW'
                          )
                        }
                        className={`font-mono text-xs font-semibold px-2.5 py-1 rounded-[6px] border cursor-pointer focus:outline-none ${
                          val === 'EDIT'
                            ? 'bg-[#397C69]/12 text-[#296050] border-[#397C69]/30'
                            : 'bg-[#D5A33D]/15 text-[#8C6412] border-[#D5A33D]/30'
                        }`}
                      >
                        <option value="EDIT">Edit</option>
                        <option value="VIEW">View</option>
                      </select>
                    </td>
                  );
                })}
              </tr>

              {/* 5. Input Data: Ya / Tidak */}
              <tr>
                <td className="px-5 py-3 font-semibold text-[#18232B]">Input Data</td>
                {rolesList.map((r) => {
                  const val = ROLE_PERMISSIONS[r.code].canInputData;
                  return (
                    <td key={r.code} className="px-3 py-2.5 text-center">
                      <select
                        value={val ? 'YA' : 'TIDAK'}
                        onChange={(e) =>
                          handlePermissionChange(
                            r.code,
                            r.label,
                            'canInputData',
                            e.target.value === 'YA'
                          )
                        }
                        className={`font-mono text-xs font-semibold px-2.5 py-1 rounded-[6px] border cursor-pointer focus:outline-none ${
                          val
                            ? 'bg-[#397C69]/12 text-[#296050] border-[#397C69]/30'
                            : 'bg-[#F4F6F5] text-[#5A6B75] border-[#E2E8E8]'
                        }`}
                      >
                        <option value="YA">Ya</option>
                        <option value="TIDAK">Tidak</option>
                      </select>
                    </td>
                  );
                })}
              </tr>

              {/* 6. Edit Data: Ya / Tidak */}
              <tr className="bg-[#F4F6F5]/50">
                <td className="px-5 py-3 font-semibold text-[#18232B]">Edit Data</td>
                {rolesList.map((r) => {
                  const val = ROLE_PERMISSIONS[r.code].canEditData;
                  return (
                    <td key={r.code} className="px-3 py-2.5 text-center">
                      <select
                        value={val ? 'YA' : 'TIDAK'}
                        onChange={(e) =>
                          handlePermissionChange(
                            r.code,
                            r.label,
                            'canEditData',
                            e.target.value === 'YA'
                          )
                        }
                        className={`font-mono text-xs font-semibold px-2.5 py-1 rounded-[6px] border cursor-pointer focus:outline-none ${
                          val
                            ? 'bg-[#397C69]/12 text-[#296050] border-[#397C69]/30'
                            : 'bg-[#F4F6F5] text-[#5A6B75] border-[#E2E8E8]'
                        }`}
                      >
                        <option value="YA">Ya</option>
                        <option value="TIDAK">Tidak</option>
                      </select>
                    </td>
                  );
                })}
              </tr>

              {/* 7. Delete Data: Ya / Tidak */}
              <tr>
                <td className="px-5 py-3 font-semibold text-[#18232B]">Delete Data</td>
                {rolesList.map((r) => {
                  const val = ROLE_PERMISSIONS[r.code].canDeleteData;
                  return (
                    <td key={r.code} className="px-3 py-2.5 text-center">
                      <select
                        value={val ? 'YA' : 'TIDAK'}
                        onChange={(e) =>
                          handlePermissionChange(
                            r.code,
                            r.label,
                            'canDeleteData',
                            e.target.value === 'YA'
                          )
                        }
                        className={`font-mono text-xs font-semibold px-2.5 py-1 rounded-[6px] border cursor-pointer focus:outline-none ${
                          val
                            ? 'bg-[#B94C45]/12 text-[#B94C45] border-[#B94C45]/30'
                            : 'bg-[#F4F6F5] text-[#5A6B75] border-[#E2E8E8]'
                        }`}
                      >
                        <option value="YA">Ya</option>
                        <option value="TIDAK">Tidak</option>
                      </select>
                    </td>
                  );
                })}
              </tr>

              {/* 8. Approval Tahap 1 (Verifikasi TC): Ya / Tidak */}
              <tr className="bg-[#F4F6F5]/50">
                <td className="px-5 py-3 font-semibold text-[#18232B]">
                  <div>Approval Tahap 1 (Verifikasi TC)</div>
                  <div className="text-[10px] font-normal text-[#5A6B75]">
                    Review awal pengajuan training (UNDER HOD REVIEW)
                  </div>
                </td>
                {rolesList.map((r) => {
                  const val = ROLE_PERMISSIONS[r.code].canApproveStage1;
                  return (
                    <td key={r.code} className="px-3 py-2.5 text-center">
                      <select
                        value={val ? 'YA' : 'TIDAK'}
                        onChange={(e) =>
                          handlePermissionChange(
                            r.code,
                            r.label,
                            'canApproveStage1',
                            e.target.value === 'YA'
                          )
                        }
                        className={`font-mono text-xs font-semibold px-2.5 py-1 rounded-[6px] border cursor-pointer focus:outline-none ${
                          val
                            ? 'bg-[#397C69]/12 text-[#296050] border-[#397C69]/30'
                            : 'bg-[#F4F6F5] text-[#5A6B75] border-[#E2E8E8]'
                        }`}
                      >
                        <option value="YA">Ya</option>
                        <option value="TIDAK">Tidak</option>
                      </select>
                    </td>
                  );
                })}
              </tr>

              {/* 9. Approval Terakhir PJO (Final Stage 2): Ya / Tidak */}
              <tr>
                <td className="px-5 py-3 font-semibold text-[#18232B]">
                  <div>Approval Terakhir PJO (Stage 2 Final)</div>
                  <div className="text-[10px] font-normal text-[#5A6B75]">
                    Otorisasi akhir pengajuan training (PENDING PJO → APPROVED)
                  </div>
                </td>
                {rolesList.map((r) => {
                  const val = ROLE_PERMISSIONS[r.code].canApproveFinalPjo;
                  return (
                    <td key={r.code} className="px-3 py-2.5 text-center">
                      <select
                        value={val ? 'YA' : 'TIDAK'}
                        onChange={(e) =>
                          handlePermissionChange(
                            r.code,
                            r.label,
                            'canApproveFinalPjo',
                            e.target.value === 'YA'
                          )
                        }
                        className={`font-mono text-xs font-semibold px-2.5 py-1 rounded-[6px] border cursor-pointer focus:outline-none ${
                          val
                            ? 'bg-[#E88932]/15 text-[#B85E12] border-[#E88932]/40'
                            : 'bg-[#F4F6F5] text-[#5A6B75] border-[#E2E8E8]'
                        }`}
                      >
                        <option value="YA">Ya</option>
                        <option value="TIDAK">Tidak</option>
                      </select>
                    </td>
                  );
                })}
              </tr>

              {/* 10. User Management: Ya / Tidak */}
              <tr className="bg-[#F4F6F5]/50">
                <td className="px-5 py-3 font-semibold text-[#18232B]">User Management</td>
                {rolesList.map((r) => {
                  const val = ROLE_PERMISSIONS[r.code].canManageUsers;
                  const isLockedSuper = r.code === 'SUPER_ADMIN';
                  return (
                    <td key={r.code} className="px-3 py-2.5 text-center">
                      <select
                        value={val ? 'YA' : 'TIDAK'}
                        disabled={isLockedSuper}
                        onChange={(e) =>
                          handlePermissionChange(
                            r.code,
                            r.label,
                            'canManageUsers',
                            e.target.value === 'YA'
                          )
                        }
                        className={`font-mono text-xs font-semibold px-2.5 py-1 rounded-[6px] border cursor-pointer focus:outline-none disabled:opacity-80 disabled:cursor-not-allowed ${
                          val
                            ? 'bg-[#397C69]/12 text-[#296050] border-[#397C69]/30'
                            : 'bg-[#F4F6F5] text-[#5A6B75] border-[#E2E8E8]'
                        }`}
                      >
                        <option value="YA">Ya</option>
                        <option value="TIDAK">Tidak</option>
                      </select>
                    </td>
                  );
                })}
              </tr>

              {/* 9. System Settings: Ya / Tidak */}
              <tr>
                <td className="px-5 py-3 font-semibold text-[#18232B]">System Settings</td>
                {rolesList.map((r) => {
                  const val = ROLE_PERMISSIONS[r.code].canManageSystemSettings;
                  const isLockedSuper = r.code === 'SUPER_ADMIN';
                  return (
                    <td key={r.code} className="px-3 py-2.5 text-center">
                      <select
                        value={val ? 'YA' : 'TIDAK'}
                        disabled={isLockedSuper}
                        onChange={(e) =>
                          handlePermissionChange(
                            r.code,
                            r.label,
                            'canManageSystemSettings',
                            e.target.value === 'YA'
                          )
                        }
                        className={`font-mono text-xs font-semibold px-2.5 py-1 rounded-[6px] border cursor-pointer focus:outline-none disabled:opacity-80 disabled:cursor-not-allowed ${
                          val
                            ? 'bg-[#397C69]/12 text-[#296050] border-[#397C69]/30'
                            : 'bg-[#F4F6F5] text-[#5A6B75] border-[#E2E8E8]'
                        }`}
                      >
                        <option value="YA">Ya</option>
                        <option value="TIDAK">Tidak</option>
                      </select>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* System Parameters Form */}
      <form
        onSubmit={handleSave}
        className="bg-white p-6 rounded-[12px] border border-[#E2E8E8] space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8E8] pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#E88932]" />
            <h3 className="text-sm font-heading font-bold text-[#18232B]">
              Parameter Konfigurasi Sistem & Target Capaian
            </h3>
          </div>
          {savedNotice && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#397C69] bg-[#397C69]/10 px-3 py-1 rounded-[6px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Pengaturan berhasil disimpan!</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#263640] mb-1">
              Nama Portal Sistem
            </label>
            <input
              type="text"
              value={portalName}
              onChange={(e) => setPortalName(e.target.value)}
              className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#263640] mb-1">
              Entitas Perusahaan
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#263640] mb-1">
              Lokasi Site Operasional Utama
            </label>
            <input
              type="text"
              value={operationalSite}
              onChange={(e) => setOperationalSite(e.target.value)}
              className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#263640] mb-1">
              Lokasi Head Office
            </label>
            <input
              type="text"
              value={headOffice}
              onChange={(e) => setHeadOffice(e.target.value)}
              className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-[#263640] mb-1">
              Target Jam Training / Karyawan / Tahun
            </label>
            <input
              type="number"
              min="1"
              value={annualHoursTarget}
              onChange={(e) => setAnnualHoursTarget(Number(e.target.value))}
              className="w-full h-[38px] px-3 text-xs font-mono bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#263640] mb-1">
              Target Capaian Training Achievement (%)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={achievementTargetPct}
              onChange={(e) => setAchievementTargetPct(Number(e.target.value))}
              className="w-full h-[38px] px-3 text-xs font-mono bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#263640] mb-1">
              Batas Nilai Kelulusan Minimum (Post-Test)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={minPassScore}
              onChange={(e) => setMinPassScore(Number(e.target.value))}
              className="w-full h-[38px] px-3 text-xs font-mono bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px]"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-[#E2E8E8] flex justify-end">
          <Button type="submit" variant="primary" size="md" icon={<Save className="w-4 h-4" />}>
            Simpan Pengaturan Sistem
          </Button>
        </div>
      </form>

      {/* Embedded Audit Log Viewer */}
      <AuditLogViewer />
    </div>
  );
};
