import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import { TrainingApplication, getRolePermissions } from '../../lib/types';
import { CreateApplicationModal } from '../applications/CreateApplicationModal';
import { ApplicationDetailModal } from '../applications/ApplicationDetailModal';
import { KpiAnalyticsCharts } from '../charts/KpiAnalyticsCharts';
import { Button } from '../ui/Button';
import { KpiCard } from '../ui/KpiCard';
import { StatusBadge } from '../ui/StatusBadge';
import {
  Building2,
  Plus,
  Users,
  Award,
  Clock,
  RotateCcw,
  CheckCircle2,
  Eye,
  Target,
} from 'lucide-react';

interface DepartmentUserDashboardProps {
  onNavigate: (tab: string) => void;
}

export const DepartmentUserDashboard: React.FC<DepartmentUserDashboardProps> = ({
  onNavigate,
}) => {
  const { currentUser, refreshState } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<TrainingApplication | null>(null);

  const perms = getRolePermissions(currentUser.role_code);
  const isHrga = currentUser.role_code === 'ADMIN_HRGA';

  const deptApps = mockStore.getVisibleApplications(currentUser.id);
  const deptEmployees = mockStore.getVisibleEmployees(currentUser.id);
  const achievement = mockStore.calculateTrainingAchievement({ year: '2026' });

  // Revision alert: Applications in DRAFT that have approval history indicating return by HOD or PJO
  const returnedForRevisionApps = deptApps.filter((a) => {
    if (a.current_status !== 'DRAFT') return false;
    const history = mockStore.approvalHistory.filter((h) => h.application_id === a.id);
    return history.some((h) => h.action === 'HOD_RETURN' || h.action === 'PJO_RETURN');
  });

  const underReviewCount = deptApps.filter(
    (a) => a.current_status === 'UNDER_HOD_REVIEW' || a.current_status === 'PENDING_PJO'
  ).length;

  const approvedCount = deptApps.filter(
    (a) =>
      a.current_status === 'APPROVED' ||
      a.current_status === 'SCHEDULED' ||
      a.current_status === 'COMPLETED'
  ).length;

  const deptCertsCount = mockStore.certifications.length;

  return (
    <div className="space-y-6">
      {/* 1. Admin / Admin HRGA Header Banner */}
      <div className="bg-[#18232B] bg-topography text-white p-6 rounded-[12px] border border-[#263640]">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#E88932] text-xs font-mono font-semibold uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>
                {isHrga
                  ? 'Admin HRGA • HRGA Data Management & Achievement Monitoring'
                  : 'Admin • Operational Training Data & Achievement Management'}
              </span>
            </div>
            <h2 className="text-xl font-heading font-bold mt-1">
              {isHrga
                ? 'HRGA Training & Personnel Competency Portal'
                : 'Operational Training & Achievement Management Portal'}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {isHrga
                ? 'Mengelola data training dan direktori personel HRGA (Input, Edit, Delete) serta memantau laporan Training Achievement korporat (View).'
                : 'Kewenangan operasional penuh untuk menginput, mengedit, dan menghapus data training serta mengelola capaian realisasi pada fitur Training Achievement.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Button
              variant="secondary"
              size="md"
              icon={<Target className="w-4 h-4" />}
              onClick={() => onNavigate('achievement')}
            >
              {perms.trainingAchievement === 'EDIT'
                ? 'Kelola Training Achievement'
                : 'Lihat Training Achievement'}
            </Button>
            {perms.canInputData && (
              <Button
                variant="primary"
                size="md"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setShowCreateModal(true)}
              >
                Input Data Training Baru
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Revision Alerts Banner (if any application returned) */}
      {returnedForRevisionApps.length > 0 && (
        <div className="p-4 bg-[#D5A33D]/12 rounded-[12px] border border-[#D5A33D]/40 text-[#18232B] space-y-2">
          <div className="flex items-center gap-2 font-heading font-bold text-xs text-[#8C6412]">
            <RotateCcw className="w-4 h-4 text-[#D5A33D]" />
            <span>
              Tindak Lanjut Diperlukan: {returnedForRevisionApps.length} Pengajuan Dikembalikan untuk Revisi
            </span>
          </div>
          <p className="text-xs text-[#263640]">
            Silakan periksa catatan evaluasi, perbarui data, dan kirim ulang.
          </p>

          <div className="divide-y divide-[#D5A33D]/25 mt-2">
            {returnedForRevisionApps.map((app) => (
              <div
                key={app.id}
                className="py-2.5 flex flex-wrap justify-between items-center gap-2 text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-[#18232B]">
                    {app.application_number}
                  </span>{' '}
                  — <span className="font-medium">{app.training_title}</span>
                </div>
                <Button
                  variant="revision"
                  size="sm"
                  onClick={() => setSelectedApp(app)}
                >
                  Edit & Kirim Ulang
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Capaian Training (2026)"
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
          title="Total Personel Terdaftar"
          value={deptEmployees.length}
          comparison="Karyawan Aktif"
          trend="neutral"
          subtitle="Database Karyawan"
          icon={<Users className="w-4 h-4" />}
          tone="default"
        />
        <KpiCard
          title="Dalam Proses Review"
          value={underReviewCount}
          comparison="Menunggu Verifikasi"
          trend="neutral"
          subtitle={`${approvedCount} Disetujui / Selesai`}
          icon={<Clock className="w-4 h-4" />}
          tone="info"
        />
        <KpiCard
          title="Sertifikasi Terbit"
          value={deptCertsCount}
          comparison="Terbit & Aktif"
          trend="up"
          trendIsGood={true}
          subtitle="Kompetensi Personel"
          icon={<Award className="w-4 h-4" />}
          tone="orange"
        />
      </div>

      {/* 4. Applications Table */}
      <div className="bg-white rounded-[12px] border border-[#E2E8E8] overflow-hidden">
        <div className="px-6 py-4 bg-[#F4F6F5] border-b border-[#E2E8E8] flex flex-wrap justify-between items-center gap-3">
          <h3 className="text-xs font-heading font-bold text-[#18232B] uppercase tracking-wider">
            Daftar Data Training & Pengajuan ({deptApps.length})
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('applications')}
            >
              Kelola Semua Data Training
            </Button>
            {perms.canInputData && (
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setShowCreateModal(true)}
              >
                Input Data Training
              </Button>
            )}
          </div>
        </div>

        {deptApps.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#5A6B75]">
            Belum ada data pelatihan. Klik "Input Data Training" untuk menambahkan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F4F6F5]/60 text-[#5A6B75] font-medium border-b border-[#E2E8E8]">
                <tr>
                  <th className="px-6 py-3">Nomor & Judul Pelatihan</th>
                  <th className="px-6 py-3">Departemen</th>
                  <th className="px-6 py-3">Peserta</th>
                  <th className="px-6 py-3">Rentang Jadwal</th>
                  <th className="px-6 py-3">Status Saat Ini</th>
                  <th className="px-6 py-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E8]">
                {deptApps.slice(0, 8).map((app) => (
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
                    <td className="px-6 py-3.5 font-medium text-[#18232B]">
                      {app.department_name}
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
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => setSelectedApp(app)}
                      >
                        Lihat Detail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. KPI Performance Insights */}
      <KpiAnalyticsCharts />

      {/* Modals */}
      <CreateApplicationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => {
          refreshState();
          setShowCreateModal(false);
        }}
      />

      <ApplicationDetailModal
        isOpen={Boolean(selectedApp)}
        application={selectedApp}
        onClose={() => setSelectedApp(null)}
        onRefresh={() => {
          refreshState();
          setSelectedApp(null);
        }}
      />
    </div>
  );
};
