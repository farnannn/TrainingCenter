import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import { TrainingApplication } from '../../lib/types';
import { HodPjoActionModal } from '../applications/HodPjoActionModal';
import { ApplicationDetailModal } from '../applications/ApplicationDetailModal';
import { KpiAnalyticsCharts } from '../charts/KpiAnalyticsCharts';
import { Button } from '../ui/Button';
import { KpiCard } from '../ui/KpiCard';
import {
  Layers,
  FileCheck,
  CalendarDays,
  Award,
  Clock,
  ArrowRight,
  CheckCircle2,
  Eye,
} from 'lucide-react';

interface HodDashboardProps {
  onNavigate: (tab: string) => void;
}

export const HodDashboard: React.FC<HodDashboardProps> = ({ onNavigate }) => {
  const { currentUser, refreshState } = useAuth();
  const [selectedReviewApp, setSelectedReviewApp] = useState<TrainingApplication | null>(null);
  const [selectedDetailApp, setSelectedDetailApp] = useState<TrainingApplication | null>(null);

  const applications = mockStore.getVisibleApplications(currentUser.id);
  const incomingQueue = applications.filter((a) => a.current_status === 'UNDER_HOD_REVIEW');
  const readyToSchedule = applications.filter((a) => a.current_status === 'APPROVED');
  const activeSchedules = mockStore.schedules.filter((s) => s.status !== 'COMPLETED');
  const totalCerts = mockStore.certifications.length;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner with Topographic Pattern */}
      <div className="bg-[#18232B] bg-topography text-white p-6 rounded-[12px] border border-[#263640]">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#E88932] text-xs font-mono font-semibold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>HOD Training Center • Stage 1 Reviewer</span>
            </div>
            <h2 className="text-xl font-heading font-bold mt-1">
              Training Center Operations & Review Queue
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Bertanggung jawab atas evaluasi pengajuan training seluruh departemen, verifikasi kurikulum, penjadwalan kelas yang telah diotorisasi PJO, dan penerbitan sertifikat.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Button
              variant="primary"
              size="md"
              icon={<CalendarDays className="w-4 h-4" />}
              onClick={() => onNavigate('schedules')}
            >
              Jadwal & Historical
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={<Award className="w-4 h-4" />}
              onClick={() => onNavigate('certifications')}
            >
              Sertifikasi ({totalCerts})
            </Button>
          </div>
        </div>
      </div>

      {/* 2. KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Antrean Review HOD (Stage 1)"
          value={incomingQueue.length}
          comparison="Menunggu Evaluasi"
          trend="neutral"
          subtitle="Dari Seluruh Departemen"
          icon={<Clock className="w-4 h-4" />}
          tone="orange"
        />
        <KpiCard
          title="Disetujui PJO (Siap Jadwal)"
          value={readyToSchedule.length}
          comparison="Otorisasi Penuh"
          trend="up"
          trendIsGood={true}
          subtitle="Siap Penjadwalan Batch"
          icon={<CheckCircle2 className="w-4 h-4" />}
          tone="success"
        />
        <KpiCard
          title="Batch Pelatihan Aktif"
          value={activeSchedules.length}
          comparison="On-Site Delivery"
          trend="neutral"
          subtitle="Training Center Morowali"
          icon={<CalendarDays className="w-4 h-4" />}
          tone="info"
        />
        <KpiCard
          title="Total Sertifikat Diterbitkan"
          value={totalCerts}
          comparison="100% Valid"
          trend="up"
          trendIsGood={true}
          subtitle="Personel Tersertifikasi"
          icon={<Award className="w-4 h-4" />}
          tone="default"
        />
      </div>

      {/* 3. Incoming Stage 1 Approval Queue Table */}
      <div className="bg-white rounded-[12px] border border-[#E2E8E8] overflow-hidden">
        <div className="px-6 py-4 bg-[#F4F6F5] border-b border-[#E2E8E8] flex flex-wrap justify-between items-center gap-3">
          <div>
            <h3 className="text-xs font-heading font-bold text-[#18232B] uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#E88932]" />
              <span>Antrean Pengajuan Menunggu Review HOD Stage 1 ({incomingQueue.length})</span>
            </h3>
            <p className="text-xs text-[#5A6B75] mt-0.5">
              Persetujuan HOD meneruskan berkas ke antrean PJO untuk otorisasi final.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            iconPosition="right"
            onClick={() => onNavigate('applications')}
          >
            Semua Pengajuan
          </Button>
        </div>

        {incomingQueue.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#5A6B75]">
            Tidak ada pengajuan dalam antrean UNDER_HOD_REVIEW. Seluruh berkas telah diproses.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F4F6F5]/60 text-[#5A6B75] font-medium border-b border-[#E2E8E8]">
                <tr>
                  <th className="px-6 py-3">Nomor & Judul Pelatihan</th>
                  <th className="px-6 py-3">Departemen Pengaju</th>
                  <th className="px-6 py-3">Peserta</th>
                  <th className="px-6 py-3">Estimasi Anggaran</th>
                  <th className="px-6 py-3 text-right">Tindakan Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E8]">
                {incomingQueue.map((app) => (
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
                      {app.participants?.length || 0} Peserta
                    </td>
                    <td className="px-6 py-3.5 font-mono font-semibold text-[#18232B] tabular-nums">
                      IDR {Number(app.estimated_budget).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Eye className="w-3.5 h-3.5" />}
                          onClick={() => setSelectedDetailApp(app)}
                        >
                          Detail
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setSelectedReviewApp(app)}
                        >
                          Review Stage 1
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

      {/* 4. KPI Visual Analytics */}
      <KpiAnalyticsCharts />

      {/* Review Modal */}
      <HodPjoActionModal
        isOpen={Boolean(selectedReviewApp)}
        application={selectedReviewApp}
        mode="HOD"
        onClose={() => setSelectedReviewApp(null)}
        onSuccess={() => {
          refreshState();
          setSelectedReviewApp(null);
        }}
      />

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
