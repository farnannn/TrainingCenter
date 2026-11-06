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
  UserCheck,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Eye,
  Wallet,
} from 'lucide-react';

interface PjoDashboardProps {
  onNavigate: (tab: string) => void;
}

export const PjoDashboard: React.FC<PjoDashboardProps> = ({ onNavigate }) => {
  const { currentUser, refreshState } = useAuth();
  const [selectedReviewApp, setSelectedReviewApp] = useState<TrainingApplication | null>(null);
  const [selectedDetailApp, setSelectedDetailApp] = useState<TrainingApplication | null>(null);

  const applications = mockStore.getVisibleApplications(currentUser.id);
  // Strict rule: PJO only processes applications that have passed HOD review!
  const pjoQueue = applications.filter((a) => a.current_status === 'PENDING_PJO');
  const fullyAuthorized = applications.filter(
    (a) =>
      a.current_status === 'APPROVED' ||
      a.current_status === 'SCHEDULED' ||
      a.current_status === 'COMPLETED'
  );
  const totalBudgetAuthorized = fullyAuthorized.reduce(
    (sum, a) => sum + Number(a.estimated_budget),
    0
  );

  return (
    <div className="space-y-6">
      {/* 1. PJO Header Banner with Topographic Pattern */}
      <div className="bg-[#18232B] bg-topography text-white p-6 rounded-[12px] border border-[#263640]">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#E88932] text-xs font-mono font-semibold uppercase tracking-wider">
              <UserCheck className="w-4 h-4" />
              <span>Penanggung Jawab Operasional (PJO) • Final Authorization Authority</span>
            </div>
            <h2 className="text-xl font-heading font-bold mt-1">
              Operational Governance & Executive Approval
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Aturan Terkonfirmasi: Satu akun PJO terpusat memegang otorisasi akhir bagi seluruh departemen. Persetujuan PJO membuka kunci penjadwalan dan pelaksanaan training.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Button
              variant="primary"
              size="md"
              icon={<TrendingUp className="w-4 h-4" />}
              onClick={() => onNavigate('kpi')}
            >
              Laporan KPI Korporat
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => onNavigate('applications')}
            >
              Semua Pengajuan
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Sequential Approval Policy Notice */}
      <div className="p-4 bg-white rounded-[12px] border border-[#E2E8E8] flex items-start gap-3 text-xs text-[#263640]">
        <ShieldCheck className="w-5 h-5 text-[#E88932] shrink-0 mt-0.5" />
        <div>
          <span className="font-heading font-bold text-[#18232B]">
            Kebijakan Persetujuan Sekuensial Ketat:
          </span>{' '}
          PJO hanya memproses berkas yang telah lulus verifikasi Tahap 1 oleh HOD Training Center (<code className="font-mono text-[#E88932]">PENDING_PJO</code>). Pengajuan yang dikembalikan untuk revisi oleh PJO wajib melewati evaluasi ulang HOD Training Center.
        </div>
      </div>

      {/* 3. Queue Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Antrean Otorisasi Final PJO"
          value={pjoQueue.length}
          comparison="Lulus Review HOD"
          trend="neutral"
          subtitle="Menunggu Tanda Tangan PJO"
          icon={<Clock className="w-4 h-4" />}
          tone="orange"
        />
        <KpiCard
          title="Telah Diotorisasi PJO"
          value={fullyAuthorized.length}
          comparison="Approved for Execution"
          trend="up"
          trendIsGood={true}
          subtitle="Siap / Selesai Pelaksanaan"
          icon={<CheckCircle2 className="w-4 h-4" />}
          tone="success"
        />
        <KpiCard
          title="Total Anggaran Diotorisasi"
          value={`IDR ${(totalBudgetAuthorized / 1000000).toFixed(1)}M`}
          comparison="Investasi Kompetensi"
          trend="neutral"
          subtitle="Akumulasi Program Disetujui"
          icon={<Wallet className="w-4 h-4" />}
          tone="info"
        />
      </div>

      {/* 4. Main PJO Final Review Queue */}
      <div className="bg-white rounded-[12px] border border-[#E2E8E8] overflow-hidden">
        <div className="px-6 py-4 bg-[#F4F6F5] border-b border-[#E2E8E8] flex flex-wrap justify-between items-center gap-3">
          <div>
            <h3 className="text-xs font-heading font-bold text-[#18232B] uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#E88932]" />
              <span>Antrean Pengajuan Menunggu Otorisasi Final PJO ({pjoQueue.length})</span>
            </h3>
            <p className="text-xs text-[#5A6B75] mt-0.5">
              Seluruh pengajuan di bawah ini telah diverifikasi oleh HOD Training Center.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            iconPosition="right"
            onClick={() => onNavigate('applications')}
          >
            Semua Riwayat
          </Button>
        </div>

        {pjoQueue.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#5A6B75]">
            Tidak ada pengajuan dengan status PENDING_PJO saat ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F4F6F5]/60 text-[#5A6B75] font-medium border-b border-[#E2E8E8]">
                <tr>
                  <th className="px-6 py-3">Nomor & Judul Pelatihan</th>
                  <th className="px-6 py-3">Departemen Pengaju</th>
                  <th className="px-6 py-3">Catatan Review HOD</th>
                  <th className="px-6 py-3">Estimasi Anggaran</th>
                  <th className="px-6 py-3 text-right">Keputusan PJO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E8]">
                {pjoQueue.map((app) => (
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
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#397C69]/12 text-[#296050] border border-[#397C69]/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>HOD Approved</span>
                      </span>
                      {app.hod_comments && (
                        <div className="text-[11px] text-[#5A6B75] italic mt-1 line-clamp-1">
                          "{app.hod_comments}"
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-[#18232B] font-semibold tabular-nums">
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
                          Otorisasi Final
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

      {/* 5. Real-time KPI Analytics Charts */}
      <KpiAnalyticsCharts />

      {/* Action Modal */}
      <HodPjoActionModal
        isOpen={Boolean(selectedReviewApp)}
        application={selectedReviewApp}
        mode="PJO"
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
