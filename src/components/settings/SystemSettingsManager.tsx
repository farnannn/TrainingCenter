import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import { getRolePermissions, ROLE_PERMISSIONS, RoleCode } from '../../lib/types';
import { Button } from '../ui/Button';
import { AuditLogViewer } from '../audit/AuditLogViewer';
import {
  Settings,
  ShieldCheck,
  Save,
  CheckCircle2,
  Lock,
  Sliders,
} from 'lucide-react';

export const SystemSettingsManager: React.FC = () => {
  const { currentUser, refreshState } = useAuth();
  const perms = getRolePermissions(currentUser.role_code);

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

  if (!perms.canManageSystemSettings) {
    return (
      <div className="p-8 bg-white rounded-[12px] border border-[#B94C45]/30 text-center space-y-2">
        <Lock className="w-8 h-8 text-[#B94C45] mx-auto" />
        <h3 className="text-sm font-heading font-bold text-[#18232B]">
          Akses Ditolak (Super Admin Exclusive)
        </h3>
        <p className="text-xs text-[#5A6B75]">
          Hanya role <strong>Super Admin</strong> yang memiliki hak akses ke menu System Settings.
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
          Kelola parameter operasional RAJA ACADEMY, standar kelulusan, target capaian tahunan, serta verifikasi matriks RBAC 6 Role.
        </p>
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

      {/* Active RBAC Matrix Verification Table */}
      <div className="bg-white rounded-[12px] border border-[#E2E8E8] overflow-hidden">
        <div className="px-6 py-4 bg-[#F4F6F5] border-b border-[#E2E8E8]">
          <h3 className="text-xs font-heading font-bold text-[#18232B] uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#E88932]" />
            <span>Matriks Role-Based Access Control (RBAC — 6 Role Resmi)</span>
          </h3>
          <p className="text-xs text-[#5A6B75] mt-0.5">
            Diterapkan secara penuh pada tingkat DataStore/Backend API dan antarmuka Frontend.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#18232B] text-white font-heading">
              <tr>
                <th className="px-5 py-3">Fitur / Kewenangan</th>
                {rolesList.map((r) => (
                  <th key={r.code} className="px-4 py-3 text-center">
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8E8]">
              <tr>
                <td className="px-5 py-3 font-semibold text-[#18232B]">Dashboard</td>
                {rolesList.map((r) => (
                  <td key={r.code} className="px-4 py-3 text-center font-mono">
                    {ROLE_PERMISSIONS[r.code].dashboard === 'FULL' ? 'Full Access' : 'View'}
                  </td>
                ))}
              </tr>
              <tr className="bg-[#F4F6F5]/50">
                <td className="px-5 py-3 font-semibold text-[#18232B]">Data Training</td>
                {rolesList.map((r) => (
                  <td key={r.code} className="px-4 py-3 text-center font-mono">
                    {ROLE_PERMISSIONS[r.code].trainingData === 'EDIT' ? 'Edit' : 'View'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-5 py-3 font-semibold text-[#18232B]">Training Achievement</td>
                {rolesList.map((r) => (
                  <td key={r.code} className="px-4 py-3 text-center font-mono font-bold">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        ROLE_PERMISSIONS[r.code].trainingAchievement === 'EDIT'
                          ? 'bg-[#397C69]/12 text-[#296050]'
                          : 'bg-[#D5A33D]/15 text-[#8C6412]'
                      }`}
                    >
                      {ROLE_PERMISSIONS[r.code].trainingAchievement === 'EDIT' ? 'Edit' : 'View'}
                    </span>
                  </td>
                ))}
              </tr>
              <tr className="bg-[#F4F6F5]/50">
                <td className="px-5 py-3 font-semibold text-[#18232B]">Input Data</td>
                {rolesList.map((r) => (
                  <td key={r.code} className="px-4 py-3 text-center font-mono">
                    {ROLE_PERMISSIONS[r.code].canInputData ? 'Ya' : 'Tidak'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-5 py-3 font-semibold text-[#18232B]">Edit Data</td>
                {rolesList.map((r) => (
                  <td key={r.code} className="px-4 py-3 text-center font-mono">
                    {ROLE_PERMISSIONS[r.code].canEditData ? 'Ya' : 'Tidak'}
                  </td>
                ))}
              </tr>
              <tr className="bg-[#F4F6F5]/50">
                <td className="px-5 py-3 font-semibold text-[#18232B]">Delete Data</td>
                {rolesList.map((r) => (
                  <td key={r.code} className="px-4 py-3 text-center font-mono">
                    {ROLE_PERMISSIONS[r.code].canDeleteData ? 'Ya' : 'Tidak'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-5 py-3 font-semibold text-[#18232B]">User Management</td>
                {rolesList.map((r) => (
                  <td key={r.code} className="px-4 py-3 text-center font-mono">
                    {ROLE_PERMISSIONS[r.code].canManageUsers ? 'Ya' : 'Tidak'}
                  </td>
                ))}
              </tr>
              <tr className="bg-[#F4F6F5]/50">
                <td className="px-5 py-3 font-semibold text-[#18232B]">System Settings</td>
                {rolesList.map((r) => (
                  <td key={r.code} className="px-4 py-3 text-center font-mono">
                    {ROLE_PERMISSIONS[r.code].canManageSystemSettings ? 'Ya' : 'Tidak'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Embedded Audit Log Viewer */}
      <AuditLogViewer />
    </div>
  );
};

