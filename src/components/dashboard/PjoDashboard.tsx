import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import { TrainingApplication } from '../../lib/types';
import { ApplicationDetailModal } from '../applications/ApplicationDetailModal';
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
  Users,
} from 'lucide-react';

interface PjoDashboardProps {
  onNavigate: (tab: string) => void;
}

export const PjoDashboard: React.FC<PjoDashboardProps> = ({ onNavigate }) => {
  const { currentUser, refreshState } = useAuth();
  const [selectedDetailApp, setSelectedDetailApp] = useState<TrainingApplication | null>(null);

  const applications = mockStore.getVisibleApplications(currentUser.id);
  const achievement = mockStore.calculateTrainingAchievement({ year: '2026' });

  return (
    <div className="space-y-6">
      {/* 1. PJO Header Banner with Topographic Pattern */}
      <div className="bg-[#18232B] bg-topography text-white p-6 rounded-[12px] border border-[#263640]">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#E88932] text-xs font-mono font-semibold uppercase tracking-wider">
              <UserCheck className="w-4 h-4" />
              <span>Penanggung Jawab Operasional (PJO) • Executive Monitoring (View Only)</span>
            </div>
            <h2 className="text-xl font-heading font-bold mt-1">
              Executive Training Achievement & Operational Monitoring
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Sesuai matriks hak akses RBAC, role PJO memiliki akses <strong>View-Only</strong> untuk memantau Dashboard, Data Training, dan laporan visualisasi <strong>Training Achievement</strong> seluruh departemen tanpa tombol tambah/edit/hapus.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
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

      {/* 2. View-Only Policy Notice */}
      <div className="p-4 bg-white rounded-[12px] border border-[#E2E8E8] flex items-start gap-3 text-xs text-[#263640]">
        <Lock className="w-5 h-5 text-[#E88932] shrink-0 mt-0.5" />
        <div>
          <span className="font-heading font-bold text-[#18232B]">
            Mode Akses Eksekutif PJO (Read-Only):
          </span>{' '}
          Anda dapat memantau seluruh indikator KPI, grafik capaian bulanan, realisasi per departemen, dan riwayat pelaksanaan training. Perubahan data target/realisasi dikelola oleh Manager TC, Admin TC, Admin, atau Super Admin.
        </div>
      </div>

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
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Eye className="w-3.5 h-3.5" />}
                      onClick={() => setSelectedDetailApp(app)}
                    >
                      Detail
                    </Button>
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
    </div>
  );
};
