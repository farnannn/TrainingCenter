import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import { TrainingApplication, ApplicationStatus } from '../../lib/types';
import { ApplicationDetailModal } from './ApplicationDetailModal';
import { CreateApplicationModal } from './CreateApplicationModal';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { Plus, Search, Filter, Eye, Download } from 'lucide-react';

interface ApplicationListProps {
  filterStatus?: ApplicationStatus;
  title?: string;
  subtitle?: string;
}

export const ApplicationList: React.FC<ApplicationListProps> = ({
  filterStatus,
  title = 'Daftar Pengajuan Training',
  subtitle,
}) => {
  const { currentUser } = useAuth();
  const [selectedApp, setSelectedApp] = useState<TrainingApplication | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(filterStatus || 'ALL');

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

  const isDeptUser = currentUser.role_code === 'DEPARTMENT_USER';

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-[12px] border border-[#E2E8E8]">
        <div>
          <h3 className="text-base font-heading font-bold text-[#18232B]">{title}</h3>
          <p className="text-xs text-[#5A6B75] mt-0.5">
            {subtitle ||
              (isDeptUser
                ? `Pengajuan pelatihan resmi untuk departemen ${currentUser.department_name}`
                : 'Monitoring seluruh pengajuan pelatihan departemen dan urutan persetujuan sekuensial')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportCsv}
          >
            Export CSV
          </Button>

          {isDeptUser && (
            <Button
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowCreateModal(true)}
            >
              Ajukan Training Baru
            </Button>
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
            <option value="DRAFT">DRAFT</option>
            <option value="UNDER_HOD_REVIEW">UNDER HOD REVIEW</option>
            <option value="PENDING_PJO">PENDING PJO</option>
            <option value="APPROVED">APPROVED</option>
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="REJECTED">REJECTED</option>
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
                  <th className="px-6 py-3">Tanggal Usulan</th>
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

      {/* Modals */}
      <ApplicationDetailModal
        isOpen={Boolean(selectedApp)}
        application={selectedApp}
        onClose={() => setSelectedApp(null)}
        onRefresh={() => setSelectedApp(null)}
      />

      <CreateApplicationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => setShowCreateModal(false)}
      />
    </div>
  );
};
