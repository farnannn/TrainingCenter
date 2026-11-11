import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import { TrainingApplication, getRolePermissions } from '../../lib/types';
import { ApplicationDetailModal } from '../applications/ApplicationDetailModal';
import { HodPjoActionModal } from '../applications/HodPjoActionModal';
import { KpiAnalyticsCharts } from '../charts/KpiAnalyticsCharts';
import { Button } from '../ui/Button';
import { KpiCard } from '../ui/KpiCard';
import { StatusBadge } from '../ui/StatusBadge';
import {
  UserCheck,
  FileCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Target,
  Eye,
  Lock,
  ShieldCheck,
  Users,
} from 'lucide-react';

interface PjoDashboardProps {
  onNavigate: (tab: string) => void;
}

export const PjoDashboard: React.FC<PjoDashboardProps> = ({ onNavigate }) => {
  const { currentUser, refreshState } = useAuth();
  const perms = getRolePermissions(currentUser.role_code);
  const [selectedDetailApp, setSelectedDetailApp] = useState<TrainingApplication | null>(null);
  const [selectedApproveApp, setSelectedApproveApp] = useState<TrainingApplication | null>(null);

  const applications = mockStore.getVisibleApplications(currentUser.id);
  const pendingPjoApps = applications.filter((a) => a.current_status === 'PENDING_PJO');
  const achievement = mockStore.calculateTrainingAchievement({ year: '2026' });

  return (
    <div className="space-y-6">
      {/* 1. PJO Header Banner with Dynamic RBAC Status */}
      <div className="bg-[#18232B] bg-topography text-white p-6 rounded-[12px] border border-[#263640]">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#E88932] text-xs font-mono font-semibold uppercase tracking-wider">
              <UserCheck className="w-4 h-4" />
              <span>
                Penanggung Jawab Operasional (PJO) •{' '}
                {perms.canApproveFinalPjo
                  ? 'Final Approval Authority & Executive Monitoring'
                  : perms.dashboard === 'FULL' || perms.canEditData
                  ? 'Executive Operational Access'
                  : 'Executive Monitoring (View Only)'}
              </span>
            </div>
            <h2 className="text-xl font-heading font-bold mt-1">
              Executive Training Achievement & Final Authorization
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {perms.canApproveFinalPjo ? (
                <>
                  Role PJO memiliki kewenangan penuh untuk melakukan{' '}
                  <strong className="text-white">Approval Terakhir (Stage 2 Final Authorization)</strong>{' '}
                  atas pengajuan training seluruh departemen serta memantau laporan{' '}
                  <strong>Training Achievement</strong> secara real-time.
                </>
              ) : (
                <>
                  Memantau Dashboard, Data Training, dan laporan visualisasi{' '}
                  <strong>Training Achievement</strong> seluruh departemen sesuai matriks RBAC aktif pada System Settings.
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {perms.canApproveFinalPjo && (
              <Button
                variant="approve"
                size="md"
                icon={<CheckCircle2 className="w-4 h-4" />}
                onClick={() => onNavigate('approval_queue')}
              >
                Antrean Approval PJO ({pendingPjoApps.length})
              </Button>
            )}
            <Button
              variant="primary"
              size="md"
              icon={<Target className="w-4 h-4" />}
              onClick={() => onNavigate('achievement')}
            >
              Lihat Training Achievement
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => onNavigate('applications')}
            >
              Lihat Data Training
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Dynamic RBAC Policy & Live Permissions Notice */}
      <div className="p-4 bg-white rounded-[12px] border border-[#E2E8E8] flex items-start gap-3 text-xs text-[#263640]">
        {perms.canApproveFinalPjo || perms.canEditData ? (
          <ShieldCheck className="w-5 h-5 text-[#397C69] shrink-0 mt-0.5" />
        ) : (
          <Lock className="w-5 h-5 text-[#E88932] shrink-0 mt-0.5" />
        )}
        <div>
          <span className="font-heading font-bold text-[#18232B]">
            Status Hak Akses PJO (Tersinkronisasi Otomatis dari System Settings):
          </span>{' '}
          Approval Terakhir PJO:{' '}
          <strong className={perms.canApproveFinalPjo ? 'text-[#296050]' : 'text-[#B94C45]'}>
            {perms.canApproveFinalPjo ? 'AKTIF (Dapat Approve/Revisi/Reject)' : 'NONAKTIF'}
          </strong>{' '}
          • Mode Data Training:{' '}
          <strong>{perms.trainingData === 'EDIT' && perms.canEditData ? 'EDIT' : 'VIEW'}</strong>{' '}
          • Mode Training Achievement:{' '}
          <strong>{perms.trainingAchievement === 'EDIT' && perms.canEditData ? 'EDIT' : 'VIEW'}</strong>.
        </div>
      </div>

      {/* 2B. Antrean Otorisasi Akhir PJO (PENDING_PJO) */}
      {perms.canApproveFinalPjo && (
        <div className="bg-white rounded-[12px] border-2 border-[#E88932]/40 overflow-hidden shadow-xs">
          <div className="px-6 py-4 bg-[#E88932]/10 border-b border-[#E88932]/25 flex flex-wrap justify-between items-center gap-3">
            <div>
              <h3 className="text-xs font-heading font-bold text-[#18232B] uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#E88932]" />
                <span>
                  Antrean Menunggu Approval Terakhir PJO ({pendingPjoApps.length} Pengajuan)
                </span>
              </h3>
              <p className="text-xs text-[#5A6B75] mt-0.5">
                Pengajuan pelatihan yang telah lolos verifikasi Training Center (Stage 1) dan menunggu keputusan akhir PJO.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('approval_queue')}
            >
              Buka Halaman Antrean Penuh
            </Button>
          </div>

          {pendingPjoApps.length === 0 ? (
            <div className="p-5 text-xs text-[#5A6B75] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#397C69] shrink-0" />
              <span>
                Tidak ada pengajuan training yang tertunda pada tahap <strong>PENDING PJO</strong> saat ini.
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F4F6F5] text-[#5A6B75] font-medium border-b border-[#E2E8E8]">
                  <tr>
                    <th className="px-6 py-3">Kode & Judul Pelatihan</th>
                    <th className="px-6 py-3">Departemen</th>
                    <th className="px-6 py-3">Jadwal & Anggaran</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Keputusan PJO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8E8]">
                  {pendingPjoApps.map((app) => (
                    <tr key={app.id} className="hover:bg-[#F4F6F5]/60 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="font-mono text-[11px] font-semibold text-[#E88932]">
                          {app.application_number}
                        </div>
                        <div className="text-[#18232B] font-heading font-semibold text-xs mt-0.5">
                          {app.training_title}
                        </div>
                        <div className="text-[11px] text-[#5A6B75]">
                          {app.participants?.length || app.planned_participants || 0} peserta •{' '}
                          {app.training_type}
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="font-medium text-[#18232B]">{app.department_name}</div>
                        <div className="text-[11px] text-[#5A6B75] font-mono">
                          Pengaju: {app.submitter_name}
                        </div>
                      </td>
                      <td className="px-6 py-3.5 font-mono text-[#5A6B75] tabular-nums">
                        <div>
                          {app.proposed_start_date} s/d {app.proposed_end_date}
                        </div>
                        <div className="text-[11px] text-[#18232B] font-semibold">
                          IDR {(app.estimated_budget || 0).toLocaleString('id-ID')}
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={app.current_status} />
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            variant="approve"
                            size="sm"
                            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                            onClick={() => setSelectedApproveApp(app)}
                          >
                            Approve / Otorisasi PJO
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Eye className="w-3.5 h-3.5" />}
                            onClick={() => setSelectedDetailApp(app)}
                          >
                            Detail
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. Executive Achievement Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Training Plan (2026)"
          value={achievement.totalPlan}
          comparison={`${achievement.totalRealization} Terlaksana`}
          trend="up"
          trendIsGood={true}
          subtitle="Rencana Pelatihan Tahunan"
          icon={<FileCheck className="w-4 h-4" />}
          tone="default"
          onClick={() => onNavigate('achievement')}
          actionHint="Lihat Daftar Training Plan →"
        />
        <KpiCard
          title="Achievement Percentage"
          value={
            achievement.achievementPercentage !== null
              ? `${achievement.achievementPercentage}%`
              : 'N/A'
          }
          comparison="Realization / Plan"
          trend="up"
          trendIsGood={true}
          subtitle="Capaian Aktual Korporat"
          icon={<Target className="w-4 h-4" />}
          tone="success"
          onClick={() => onNavigate('achievement')}
          actionHint="Buka Capaian Training →"
        />
        <KpiCard
          title="Training Pending / Berjalan"
          value={achievement.totalPending}
          comparison={`${achievement.totalInProgress} In Progress`}
          trend="neutral"
          subtitle="Menunggu Penyelesaian"
          icon={<Clock className="w-4 h-4" />}
          tone="orange"
          onClick={() => onNavigate('achievement')}
          actionHint="Lihat Program On Going →"
        />
        <KpiCard
          title="Total Manpower Trained"
          value={achievement.totalManpowerTrained}
          comparison={`${achievement.totalTrainingHours} Jam Pelatihan`}
          trend="up"
          trendIsGood={true}
          subtitle="Personel Tersertifikasi / Lulus"
          icon={<Users className="w-4 h-4" />}
          tone="info"
          onClick={() => onNavigate('achievement')}
          actionHint="Lihat Rincian Personel →"
        />
      </div>

      {/* 4. Recent Training Programs Overview (View Only) */}
      <div className="bg-white rounded-[12px] border border-[#E2E8E8] overflow-hidden">
        <div className="px-6 py-4 bg-[#F4F6F5] border-b border-[#E2E8E8] flex flex-wrap justify-between items-center gap-3">
          <div>
            <h3 className="text-xs font-heading font-bold text-[#18232B] uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#E88932]" />
              <span>Ringkasan Program Pelatihan Seluruh Departemen ({applications.length})</span>
            </h3>
            <p className="text-xs text-[#5A6B75] mt-0.5">
              Klik "Detail" untuk menginspeksi daftar peserta dan riwayat pelaksanaan.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={<Target className="w-3.5 h-3.5" />}
              onClick={() => onNavigate('achievement')}
            >
              Dashboard Capaian Lengkap
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              iconPosition="right"
              onClick={() => onNavigate('applications')}
            >
              Semua Data Training
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F4F6F5]/60 text-[#5A6B75] font-medium border-b border-[#E2E8E8]">
              <tr>
                <th className="px-6 py-3">Nomor & Judul Pelatihan</th>
                <th className="px-6 py-3">Departemen</th>
                <th className="px-6 py-3">Jadwal Pelaksanaan</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Inspeksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8E8]">
              {applications.slice(0, 8).map((app) => (
                <tr key={app.id} className="hover:bg-[#F4F6F5]/50 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="font-mono text-[11px] font-semibold text-[#E88932]">
                      {app.application_number}
                    </div>
                    <div className="text-[#18232B] font-heading font-semibold text-xs mt-0.5">
                      {app.training_title}
                    </div>
                    <div className="text-[11px] text-[#5A6B75]">
                      {app.participants?.length || 0} peserta • {app.training_type}
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="font-medium text-[#18232B]">{app.department_name}</div>
                    <div className="text-[11px] text-[#5A6B75] font-mono">
                      Oleh: {app.submitter_name}
                    </div>
                  </td>
                  <td className="px-6 py-3.5 font-mono text-[#5A6B75] tabular-nums">
                    {app.proposed_start_date} s/d {app.proposed_end_date}
                  </td>
                  <td className="px-6 py-3.5">
                    <StatusBadge status={app.current_status} />
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {app.current_status === 'PENDING_PJO' && perms.canApproveFinalPjo && (
                        <Button
                          variant="approve"
                          size="sm"
                          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          onClick={() => setSelectedApproveApp(app)}
                        >
                          Approve PJO
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => setSelectedDetailApp(app)}
                      >
                        Detail
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Real-time KPI Analytics Charts */}
      <KpiAnalyticsCharts />

      {/* Inspect Detail Modal */}
      <ApplicationDetailModal
        isOpen={Boolean(selectedDetailApp)}
        application={selectedDetailApp}
        onClose={() => setSelectedDetailApp(null)}
        onRefresh={() => {
          refreshState();
          setSelectedDetailApp(null);
        }}
      />

      {/* Direct Final Authorization Modal for PJO */}
      <HodPjoActionModal
        isOpen={Boolean(selectedApproveApp)}
        application={selectedApproveApp}
        mode="PJO"
        onClose={() => setSelectedApproveApp(null)}
        onSuccess={() => {
          refreshState();
          setSelectedApproveApp(null);
        }}
      />
    </div>
  );
};
