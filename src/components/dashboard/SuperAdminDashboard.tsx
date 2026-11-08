import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import { KpiAnalyticsCharts } from '../charts/KpiAnalyticsCharts';
import { Button } from '../ui/Button';
import { KpiCard } from '../ui/KpiCard';
import {
  ShieldCheck,
  Building,
  Users,
  FileCheck,
  Target,
  Clock,
  ArrowRight,
  History,
  CheckCircle2,
  XCircle,
  Settings,
} from 'lucide-react';

interface SuperAdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onNavigate }) => {
  useAuth();
  const apps = mockStore.applications;
  const depts = mockStore.departments;
  const users = mockStore.users;
  const employees = mockStore.employees;
  const assignments = mockStore.departmentAssignments;
  const achievement = mockStore.calculateTrainingAchievement({ year: '2026' });

  const totalApps = apps.length;
  const underHod = apps.filter((a) => a.current_status === 'UNDER_HOD_REVIEW').length;
  const pendingPjo = apps.filter((a) => a.current_status === 'PENDING_PJO').length;
  const completed = apps.filter((a) => a.current_status === 'COMPLETED').length;
  const rejected = apps.filter((a) => a.current_status === 'REJECTED').length;

  return (
    <div className="space-y-6">
      {/* 1. Executive Control Banner with Subtle Topographic Pattern */}
      <div className="bg-[#18232B] bg-topography text-white p-6 rounded-[12px] border border-[#263640]">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#E88932] text-xs font-mono font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Super Admin • Full System & RBAC Authority</span>
            </div>
            <h2 className="text-xl font-heading font-bold mt-1">
              Enterprise Training Governance & Control
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Otoritas penuh atas ke-6 role sistem (Super Admin, Admin, PJO, Manager TC, Admin TC, Admin HRGA), Training Achievement, User Management, System Settings, dan Audit Trail.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Button
              variant="primary"
              size="md"
              icon={<Target className="w-4 h-4" />}
              onClick={() => onNavigate('achievement')}
            >
              Training Achievement ({achievement.achievementPercentage ?? 0}%)
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={<Users className="w-4 h-4" />}
              onClick={() => onNavigate('assignments')}
            >
              User Management
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={<Settings className="w-4 h-4" />}
              onClick={() => onNavigate('system_settings')}
            >
              System Settings
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Executive KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Program Training"
          value={totalApps}
          comparison={`${completed} Realisasi Selesai`}
          trend="up"
          trendIsGood={true}
          subtitle="Database Utama THR"
          icon={<FileCheck className="w-4 h-4" />}
          tone="default"
        />
        <KpiCard
          title="Capaian Training 2026"
          value={
            achievement.achievementPercentage !== null
              ? `${achievement.achievementPercentage}%`
              : 'N/A'
          }
          comparison={`${achievement.totalRealization}/${achievement.totalPlan} Terlaksana`}
          trend="up"
          trendIsGood={true}
          subtitle={`${achievement.totalManpowerTrained} Manpower Trained`}
          icon={<Target className="w-4 h-4" />}
          tone="success"
        />
        <KpiCard
          title="Antrean Verifikasi Aktif"
          value={underHod + pendingPjo}
          comparison={`${underHod} TC • ${pendingPjo} PJO`}
          trend="neutral"
          subtitle="Menunggu Keputusan"
          icon={<Clock className="w-4 h-4" />}
          tone="orange"
        />
        <KpiCard
          title="Pengajuan Ditolak (Terminal)"
          value={rejected}
          comparison="Terkunci"
          trend="neutral"
          subtitle="Butuh Override Super Admin"
          icon={<XCircle className="w-4 h-4" />}
          tone="danger"
        />
      </div>

      {/* 3. Interactive KPI Performance Analytics */}
      <KpiAnalyticsCharts />

      {/* 4. Department Assignments & Administrative Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[12px] border border-[#E2E8E8] space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-heading font-semibold text-[#18232B] flex items-center gap-2">
                <Building className="w-4 h-4 text-[#E88932]" />
                <span>Penugasan Admin & PIC Departemen</span>
              </h3>
              <p className="text-xs text-[#5A6B75] mt-0.5">
                Daftar 6 Role Resmi & Penugasan Departemen Aktif.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              iconPosition="right"
              onClick={() => onNavigate('assignments')}
            >
              User Management
            </Button>
          </div>

          <div className="divide-y divide-[#E2E8E8] text-xs">
            {depts.map((d) => {
              const active = assignments.find((a) => a.department_id === d.id && a.is_active);
              const user = active ? users.find((u) => u.id === active.user_id) : null;

              return (
                <div key={d.id} className="py-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-xs px-2 py-0.5 rounded bg-[#F4F6F5] text-[#18232B] border border-[#E2E8E8]">
                      {d.code}
                    </span>
                    <span className="text-[#263640] font-medium">{d.name}</span>
                  </div>
                  <div>
                    {user ? (
                      <span className="font-medium text-[#397C69] bg-[#397C69]/10 px-2.5 py-1 rounded-[6px] border border-[#397C69]/25">
                        {user.full_name} ({user.role_name})
                      </span>
                    ) : (
                      <span className="text-[#9D7019] font-medium bg-[#D5A33D]/15 px-2.5 py-1 rounded-[6px] border border-[#D5A33D]/30 text-[11px]">
                        Belum Ditugaskan
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-[12px] border border-[#E2E8E8]">
            <h3 className="text-sm font-heading font-semibold text-[#18232B] mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#E88932]" />
              <span>Kontrol Otorisasi Khusus Super Admin</span>
            </h3>
            <p className="text-xs text-[#5A6B75] mb-4">
              Tindakan korektif dan konfigurasi yang hanya diizinkan bagi level Super Admin.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-[#F4F6F5] rounded-[10px] border border-[#E2E8E8] flex justify-between items-center gap-3">
                <div>
                  <div className="font-heading font-semibold text-[#18232B]">
                    Kelola Capaian & Realisasi Training
                  </div>
                  <div className="text-[11px] text-[#5A6B75] mt-0.5">
                    Pantau dan koreksi target serta realisasi capaian training seluruh departemen.
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNavigate('achievement')}
                >
                  Buka Achievement
                </Button>
              </div>

              <div className="p-3.5 bg-[#F4F6F5] rounded-[10px] border border-[#E2E8E8] flex justify-between items-center gap-3">
                <div>
                  <div className="font-heading font-semibold text-[#18232B]">
                    System Settings & Matriks RBAC
                  </div>
                  <div className="text-[11px] text-[#5A6B75] mt-0.5">
                    Konfigurasi parameter sistem, tahun periode, dan verifikasi matriks 6 role.
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onNavigate('system_settings')}
                >
                  Pengaturan
                </Button>
              </div>

              <div className="p-3.5 bg-[#F4F6F5] rounded-[10px] border border-[#E2E8E8] flex justify-between items-center gap-3">
                <div>
                  <div className="font-heading font-semibold text-[#18232B]">
                    Audit Trail & Buka Kembali Berkas
                  </div>
                  <div className="text-[11px] text-[#5A6B75] mt-0.5">
                    Inspeksi jejak audit perubahan data atau buka kembali berkas REJECTED.
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<History className="w-3.5 h-3.5" />}
                  onClick={() => onNavigate('audit_logs')}
                >
                  Audit Log
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-[12px] border border-[#E2E8E8] flex justify-between items-center">
            <div>
              <span className="text-[11px] font-mono text-[#5A6B75] uppercase font-medium">
                Total Personel Aktif
              </span>
              <div className="text-xl font-heading font-bold text-[#18232B] mt-0.5 tabular-nums">
                {employees.filter((e) => e.is_active).length} Karyawan Tambang
              </div>
              <p className="text-xs text-[#5A6B75] mt-0.5">
                Tersebar di 7 Divisi: HRGA-IT, MED, MOD, PLM, CIVIL, TC & HSE
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<Users className="w-3.5 h-3.5" />}
              onClick={() => onNavigate('employees')}
            >
              Direktori
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
