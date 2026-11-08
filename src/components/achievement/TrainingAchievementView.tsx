import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore, TrainingPerformanceItem } from '../../lib/mockStore';
import {
  getRolePermissions,
  ApplicationStatus,
  TrainingType,
} from '../../lib/types';
import { KpiCard } from '../ui/KpiCard';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { CreateApplicationModal } from '../applications/CreateApplicationModal';
import {
  Target,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Users,
  Award,
  Filter,
  RotateCcw,
  Download,
  Edit3,
  Trash2,
  Plus,
  BarChart3,
  PieChart,
  Activity,
  Building2,
  Lock,
  ShieldCheck,
  X,
  AlertCircle,
} from 'lucide-react';

export const TrainingAchievementView: React.FC = () => {
  const { currentUser, refreshState } = useAuth();
  const perms = getRolePermissions(currentUser.role_code);
  const isSuperAdmin = currentUser.role_code === 'SUPER_ADMIN';
  const canEditAchievement = perms.trainingAchievement === 'EDIT' && perms.canEditData;
  const canDelete = isSuperAdmin;
  const canInput = perms.trainingAchievement === 'EDIT' && perms.canInputData;

  const [confirmDeleteItem, setConfirmDeleteItem] = useState<TrainingPerformanceItem | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  // Filters State
  const [yearFilter, setYearFilter] = useState<string>('2026');
  const [monthFilter, setMonthFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TrainingPerformanceItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDeptId, setEditDeptId] = useState('');
  const [editType, setEditType] = useState<TrainingType>('INTERNAL');
  const [editStatus, setEditStatus] = useState<ApplicationStatus>('COMPLETED');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editPlannedParticipants, setEditPlannedParticipants] = useState(0);
  const [editActualParticipants, setEditActualParticipants] = useState(0);
  const [editPlannedHours, setEditPlannedHours] = useState(0);
  const [editActualHours, setEditActualHours] = useState(0);
  const [editError, setEditError] = useState<string | null>(null);

  // Compute Achievement Summary dynamically on every render from Main Database
  const summary = mockStore.calculateTrainingAchievement({
    year: yearFilter,
    month: monthFilter,
    departmentId: deptFilter,
    trainingType: typeFilter,
    statusCategory: statusFilter,
  });

  // Also compute annual monthly trend dynamically so the 12-month Line Chart updates on any filter/data change
  const annualTrendSummary = mockStore.calculateTrainingAchievement({
    year: yearFilter === 'ALL' ? '2026' : yearFilter,
    month: monthFilter,
    departmentId: deptFilter,
    trainingType: typeFilter,
    statusCategory: statusFilter,
  });

  const handleResetFilters = () => {
    setYearFilter('2026');
    setMonthFilter('ALL');
    setDeptFilter('ALL');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
  };

  const openEditModal = (item: TrainingPerformanceItem) => {
    if (!canEditAchievement) return;
    setEditingItem(item);
    setEditTitle(item.trainingTitle);
    setEditDeptId(item.departmentId);
    setEditType(item.trainingType);
    setEditStatus(item.status);
    setEditStartDate(item.startDate);
    setEditEndDate(item.endDate);
    setEditPlannedParticipants(item.plannedParticipants);
    setEditActualParticipants(item.actualParticipants);
    setEditPlannedHours(item.plannedHours);
    setEditActualHours(item.actualHours);
    setEditError(null);
  };

  const handleSaveAchievementEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setEditError(null);

    try {
      mockStore.updateTrainingAchievementRecord(currentUser.id, editingItem.id, {
        training_title: editTitle,
        department_id: editDeptId,
        training_type: editType,
        current_status: editStatus,
        proposed_start_date: editStartDate,
        proposed_end_date: editEndDate,
        planned_participants: Number(editPlannedParticipants),
        actual_participants:
          editStatus === 'COMPLETED' ? Number(editActualParticipants) : 0,
        planned_hours: Number(editPlannedHours),
        actual_hours:
          editStatus === 'COMPLETED' || editStatus === 'IN_PROGRESS'
            ? Number(editActualHours)
            : 0,
      });
      refreshState();
      setEditingItem(null);
    } catch (err: any) {
      setEditError(err.message || 'Gagal menyimpan perubahan capaian.');
    }
  };

  const handleDeleteTraining = (item: TrainingPerformanceItem) => {
    if (!canDelete) return;
    setConfirmDeleteItem(item);
  };

  const executeSingleTrainingDelete = () => {
    if (!confirmDeleteItem || !canDelete) return;
    try {
      mockStore.deleteTrainingApplication(currentUser.id, confirmDeleteItem.id);
      setConfirmDeleteItem(null);
      refreshState();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const executeDeleteAllTrainings = () => {
    if (!canDelete) return;
    try {
      mockStore.deleteAllTrainingApplications(currentUser.id);
      setShowDeleteAllConfirm(false);
      refreshState();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'No',
      'Kode Training',
      'Nama Training',
      'Departemen',
      'Jenis Training',
      'Jadwal Mulai',
      'Jadwal Selesai',
      'Status Pelaksanaan',
      'Target Peserta (Plan)',
      'Realisasi Peserta (Trained)',
      'Target Jam',
      'Realisasi Jam',
    ];
    const rows = summary.trainingItems.map((it, idx) => [
      idx + 1,
      it.applicationNumber,
      `"${it.trainingTitle.replace(/"/g, '""')}"`,
      `"${it.departmentName}"`,
      it.trainingType,
      it.startDate,
      it.endDate,
      it.status,
      it.plannedParticipants,
      it.actualParticipants,
      it.plannedHours,
      it.actualHours,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute(
      'download',
      `RAJA_ACADEMY_Training_Achievement_${yearFilter}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Top performing trainings sorted by actualParticipants & actualHours
  const topCompletedTrainings = useMemo(
    () =>
      [...summary.trainingItems]
        .filter((i) => i.statusCategory === 'COMPLETED')
        .sort(
          (a, b) =>
            b.actualParticipants - a.actualParticipants || b.actualHours - a.actualHours
        )
        .slice(0, 5),
    [summary.trainingItems]
  );

  // Donut Chart Calculations
  const totalForDonut = Math.max(summary.totalPlan, 1);
  const completedCount = summary.totalRealization;
  const inProgressCount = summary.totalInProgress;
  const scheduledOnlyCount = Math.max(0, summary.totalPending - summary.totalInProgress);
  const cancelledCount = summary.totalCancelled;

  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const completedLen = (completedCount / totalForDonut) * circumference;
  const inProgressLen = (inProgressCount / totalForDonut) * circumference;
  const scheduledLen = (scheduledOnlyCount / totalForDonut) * circumference;
  const cancelledLen = (cancelledCount / totalForDonut) * circumference;

  // Line Chart SVG Points for Monthly Achievement Trend
  const trendPoints = annualTrendSummary.monthlyTrend;
  const svgWidth = 640;
  const svgHeight = 190;
  const padLeft = 36;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;
  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;

  const lineCoords = trendPoints.map((pt, idx) => {
    const x = padLeft + (idx / Math.max(trendPoints.length - 1, 1)) * plotW;
    const pct = pt.achievementPct ?? 0;
    const y = padTop + plotH - (Math.min(pct, 100) / 100) * plotH;
    return { x, y, ...pt, pct };
  });

  const polylinePoints = lineCoords.map((c) => `${c.x},${c.y}`).join(' ');
  const areaPoints = `${lineCoords[0].x},${padTop + plotH} ${polylinePoints} ${
    lineCoords[lineCoords.length - 1].x
  },${padTop + plotH}`;

  return (
    <div className="space-y-6">
      {/* 1. HERO HEADER & RBAC ACCESS INDICATOR */}
      <div className="bg-[#18232B] bg-topography text-white p-6 rounded-[12px] border border-[#263640]">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#E88932] text-xs font-mono font-semibold uppercase tracking-wider">
              <Target className="w-4 h-4" />
              <span>
                RAJA ACADEMY • Training Achievement & Realization Analytics
              </span>
            </div>
            <h2 className="text-xl font-heading font-bold mt-1">
              Capaian Pelaksanaan Training (Training Achievement)
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Perhitungan otomatis real-time berdasarkan data aktual database utama: perbandingan{' '}
              <strong className="text-white">Training Plan vs Training Realization</strong>, tren bulanan, komposisi status, serta capaian per departemen.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* RBAC Mode Badge */}
            {canEditAchievement ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#397C69]/20 border border-[#397C69]/40 text-[#6EE7B7] text-xs font-mono font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Mode Akses: EDIT ({currentUser.role_name})</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#D5A33D]/20 border border-[#D5A33D]/40 text-[#FCD34D] text-xs font-mono font-semibold">
                <Lock className="w-3.5 h-3.5" />
                <span>Mode Akses: VIEW ONLY ({currentUser.role_name})</span>
              </span>
            )}

            <Button
              variant="secondary"
              size="md"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExportCsv}
              className="border border-white/20"
            >
              Export CSV
            </Button>

            {canInput && (
              <Button
                variant="primary"
                size="md"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setShowCreateModal(true)}
              >
                Input Data Training
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 2. MULTI-DIMENSION FILTER BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-[12px] border border-[#E2E8E8] shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 text-xs font-heading font-bold text-[#18232B] uppercase tracking-wider">
            <Filter className="w-4 h-4 text-[#E88932]" />
            <span>Filter Analitik Capaian Training</span>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#E88932] hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filter</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Filter Tahun */}
          <div>
            <label className="block text-[11px] font-medium text-[#5A6B75] mb-1">
              Tahun Pelaksanaan
            </label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full h-[38px] px-3 text-xs font-medium bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] text-[#18232B] focus:bg-white focus:outline-none focus:border-[#E88932]"
            >
              <option value="ALL">Semua Tahun</option>
              <option value="2026">Tahun 2026</option>
              <option value="2025">Tahun 2025 (Historis)</option>
            </select>
          </div>

          {/* Filter Bulan */}
          <div>
            <label className="block text-[11px] font-medium text-[#5A6B75] mb-1">
              Bulan
            </label>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full h-[38px] px-3 text-xs font-medium bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] text-[#18232B] focus:bg-white focus:outline-none focus:border-[#E88932]"
            >
              <option value="ALL">Semua Bulan (Jan - Des)</option>
              <option value="01">01 — Januari</option>
              <option value="02">02 — Februari</option>
              <option value="03">03 — Maret</option>
              <option value="04">04 — April</option>
              <option value="05">05 — Mei</option>
              <option value="06">06 — Juni</option>
              <option value="07">07 — Juli</option>
              <option value="08">08 — Agustus</option>
              <option value="09">09 — September</option>
              <option value="10">10 — Oktober</option>
              <option value="11">11 — November</option>
              <option value="12">12 — Desember</option>
            </select>
          </div>

          {/* Filter Departemen */}
          <div>
            <label className="block text-[11px] font-medium text-[#5A6B75] mb-1">
              Departemen
            </label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full h-[38px] px-3 text-xs font-medium bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] text-[#18232B] focus:bg-white focus:outline-none focus:border-[#E88932]"
            >
              <option value="ALL">Semua Departemen</option>
              {mockStore.departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} — {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Jenis Training */}
          <div>
            <label className="block text-[11px] font-medium text-[#5A6B75] mb-1">
              Jenis Training
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full h-[38px] px-3 text-xs font-medium bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] text-[#18232B] focus:bg-white focus:outline-none focus:border-[#E88932]"
            >
              <option value="ALL">Semua Jenis Training</option>
              {mockStore.trainingTypes.map((tt) => (
                <option key={tt.id} value={tt.code}>
                  {tt.code} ({tt.name})
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status Training */}
          <div>
            <label className="block text-[11px] font-medium text-[#5A6B75] mb-1">
              Status Pelaksanaan
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-[38px] px-3 text-xs font-medium bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] text-[#18232B] focus:bg-white focus:outline-none focus:border-[#E88932]"
            >
              <option value="ALL">Semua Status</option>
              <option value="COMPLETED">COMPLETED (Sudah Terlaksana)</option>
              <option value="IN_PROGRESS">IN PROGRESS (Sedang Berjalan)</option>
              <option value="PENDING">PENDING (Belum Terlaksana)</option>
              <option value="CANCELLED">CANCELLED (Dibatalkan / Ditolak)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. SEVEN CORE ACHIEVEMENT KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Training Plan"
          value={`${summary.totalPlan} Program`}
          comparison={`${summary.totalManpowerPlanned} Target Peserta`}
          trend="neutral"
          subtitle="Rencana Pelatihan Terdaftar"
          icon={<Target className="w-4 h-4" />}
          tone="default"
        />
        <KpiCard
          title="Total Training Realization"
          value={`${summary.totalRealization} Selesai`}
          comparison={`Dari ${summary.totalPlan} Rencana`}
          trend="up"
          trendIsGood={true}
          subtitle="Training Sudah Terlaksana"
          icon={<CheckCircle2 className="w-4 h-4" />}
          tone="success"
        />
        <KpiCard
          title="Total Training Pending"
          value={`${summary.totalPending} Program`}
          comparison={`${summary.totalInProgress} Sedang Berjalan`}
          trend="neutral"
          subtitle="Terjadwal / Menunggu Eksekusi"
          icon={<Clock className="w-4 h-4" />}
          tone="orange"
        />
        <KpiCard
          title="Achievement Percentage"
          value={
            summary.achievementPercentage !== null
              ? `${summary.achievementPercentage}%`
              : 'Belum Tersedia'
          }
          comparison={
            summary.achievementPercentage !== null
              ? `(${summary.totalRealization} / ${summary.totalPlan}) × 100%`
              : 'Tidak ada data plan pada filter'
          }
          trend={
            summary.achievementPercentage !== null && summary.achievementPercentage >= 75
              ? 'up'
              : 'neutral'
          }
          trendIsGood={true}
          subtitle="Rumus: Realization / Plan"
          icon={<TrendingUp className="w-4 h-4" />}
          tone="info"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Total Manpower Trained"
          value={`${summary.totalManpowerTrained} Personel`}
          comparison={`Target: ${summary.totalManpowerPlanned} Peserta`}
          trend="up"
          trendIsGood={true}
          subtitle="Karyawan Telah Dilatih"
          icon={<Users className="w-4 h-4" />}
          tone="success"
        />
        <KpiCard
          title="Actual Training Hours"
          value={`${summary.totalTrainingHours} Jam`}
          comparison={`Rencana: ${summary.totalPlannedHours} Jam`}
          trend="up"
          trendIsGood={true}
          subtitle="Akumulasi Jam Pelatihan Aktual"
          icon={<Award className="w-4 h-4" />}
          tone="orange"
        />
        <KpiCard
          title="Total Training Cancelled"
          value={`${summary.totalCancelled} Program`}
          comparison="Dibatalkan / Ditolak"
          trend="neutral"
          subtitle="Status Cancelled / Rejected"
          icon={<XCircle className="w-4 h-4" />}
          tone="danger"
        />
      </div>

      {/* 4. OVERALL ACHIEVEMENT PROGRESS BAR BANNER */}
      <div className="bg-white p-6 rounded-[12px] border border-[#E2E8E8]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div>
            <span className="text-[11px] font-mono font-semibold text-[#E88932] uppercase tracking-wider">
              INDIKATOR REALISASI UTAMA
            </span>
            <h3 className="text-base font-heading font-bold text-[#18232B]">
              Persentase Capaian Pelaksanaan Training (Achievement Progress)
            </h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-heading font-bold text-[#18232B] tabular-nums">
              {summary.achievementPercentage !== null
                ? `${summary.achievementPercentage}%`
                : 'Belum Tersedia'}
            </div>
            <div className="text-[11px] font-mono text-[#5A6B75]">
              Formula: ({summary.totalRealization} Realization / {summary.totalPlan} Plan) × 100%
            </div>
          </div>
        </div>

        <div className="w-full h-4 bg-[#F4F6F5] rounded-full overflow-hidden border border-[#E2E8E8] flex">
          {summary.totalPlan > 0 && (
            <>
              <div
                style={{
                  width: `${(summary.totalRealization / summary.totalPlan) * 100}%`,
                }}
                className="bg-[#397C69] h-full transition-all duration-500"
                title={`Terlaksana: ${summary.totalRealization}`}
              />
              <div
                style={{
                  width: `${(summary.totalInProgress / summary.totalPlan) * 100}%`,
                }}
                className="bg-[#E88932] h-full transition-all duration-500"
                title={`Sedang Berjalan: ${summary.totalInProgress}`}
              />
              <div
                style={{
                  width: `${
                    (Math.max(0, summary.totalPending - summary.totalInProgress) /
                      summary.totalPlan) *
                    100
                  }%`,
                }}
                className="bg-[#527FA1] h-full transition-all duration-500"
                title={`Pending / Terjadwal: ${Math.max(
                  0,
                  summary.totalPending - summary.totalInProgress
                )}`}
              />
              <div
                style={{
                  width: `${(summary.totalCancelled / summary.totalPlan) * 100}%`,
                }}
                className="bg-[#B94C45] h-full transition-all duration-500"
                title={`Cancelled: ${summary.totalCancelled}`}
              />
            </>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-4 text-xs text-[#5A6B75]">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#397C69]" />
              <span>Realization / Completed ({summary.totalRealization})</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#E88932]" />
              <span>In Progress ({summary.totalInProgress})</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#527FA1]" />
              <span>
                Pending / Scheduled ({Math.max(0, summary.totalPending - summary.totalInProgress)})
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#B94C45]" />
              <span>Cancelled ({summary.totalCancelled})</span>
            </span>
          </div>
          <div className="font-mono text-[11px]">
            Target Korporat: {mockStore.systemSettings.mandatoryAchievementTargetPercent}%
          </div>
        </div>
      </div>

      {/* 5. CHARTS GRID: BAR CHART (PLAN VS REALIZATION) & DONUT CHART (STATUS COMPOSITION) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* BAR CHART: Perbandingan Plan vs Realization per Departemen */}
        <div className="lg:col-span-7 bg-white p-6 rounded-[12px] border border-[#E2E8E8] flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <span className="text-[11px] font-mono font-semibold text-[#E88932] uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>PERBANDINGAN PLAN VS REALIZATION</span>
                </span>
                <h3 className="text-sm font-heading font-bold text-[#18232B] mt-0.5">
                  Grafik Batang Rencana vs Realisasi Pelatihan per Departemen
                </h3>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <span className="inline-flex items-center gap-1.5 text-[#263640]">
                  <span className="w-3 h-3 rounded-xs bg-[#263640]" />
                  <span>Plan</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-[#397C69]">
                  <span className="w-3 h-3 rounded-xs bg-[#397C69]" />
                  <span>Realization</span>
                </span>
              </div>
            </div>

            {/* Grouped Vertical Bar Chart */}
            <div className="pt-4 pb-2">
              <div className="grid grid-cols-7 gap-2 items-end h-48 pt-6 px-2 border-b border-[#E2E8E8]">
                {summary.departmentBreakdown.map((d) => {
                  const maxDeptPlan = Math.max(
                    ...summary.departmentBreakdown.map((x) => x.plan),
                    4
                  );
                  const planHeightPct = Math.round((d.plan / maxDeptPlan) * 100);
                  const realHeightPct = Math.round((d.realization / maxDeptPlan) * 100);

                  return (
                    <div
                      key={d.departmentId}
                      className="flex flex-col items-center justify-end h-full group"
                    >
                      <div className="text-[10px] font-mono font-semibold text-[#18232B] mb-1.5 tabular-nums">
                        {d.achievementPct !== null ? `${d.achievementPct}%` : '0%'}
                      </div>
                      <div className="w-full flex items-end justify-center gap-1.5 h-36">
                        {/* Plan Bar */}
                        <div className="w-5 sm:w-6 bg-[#F4F6F5] rounded-t-[4px] h-full flex items-end overflow-hidden">
                          <div
                            style={{ height: `${ Math.max(planHeightPct, d.plan > 0 ? 12 : 2)}%` }}
                            className="w-full bg-[#263640] rounded-t-[4px] transition-all duration-500 flex items-start justify-center pt-1"
                            title={`${d.code} Plan: ${d.plan}`}
                          >
                            <span className="text-[9px] font-mono text-white font-bold">
                              {d.plan}
                            </span>
                          </div>
                        </div>

                        {/* Realization Bar */}
                        <div className="w-5 sm:w-6 bg-[#F4F6F5] rounded-t-[4px] h-full flex items-end overflow-hidden">
                          <div
                            style={{
                              height: `${Math.max(realHeightPct, d.realization > 0 ? 12 : 2)}%`,
                            }}
                            className="w-full bg-[#397C69] rounded-t-[4px] transition-all duration-500 flex items-start justify-center pt-1"
                            title={`${d.code} Realization: ${d.realization}`}
                          >
                            <span className="text-[9px] font-mono text-white font-bold">
                              {d.realization}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* X-Axis Labels */}
              <div className="grid grid-cols-7 gap-2 pt-2.5 text-center">
                {summary.departmentBreakdown.map((d) => (
                  <div key={d.departmentId}>
                    <div className="text-xs font-mono font-bold text-[#18232B]">{d.code}</div>
                    <div className="text-[10px] text-[#5A6B75] truncate">{d.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E2E8E8] flex items-center justify-between text-[11px] text-[#5A6B75]">
            <span>Sumber Data: Tabel Utama Training & Jadwal</span>
            <span className="font-mono">
              Total Plan: {summary.totalPlan} | Realisasi: {summary.totalRealization}
            </span>
          </div>
        </div>

        {/* DONUT CHART: Komposisi Status Training */}
        <div className="lg:col-span-5 bg-white p-6 rounded-[12px] border border-[#E2E8E8] flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-mono font-semibold text-[#E88932] uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5" />
              <span>KOMPOSISI STATUS TRAINING</span>
            </span>
            <h3 className="text-sm font-heading font-bold text-[#18232B] mt-0.5">
              Proporsi Pelaksanaan Training Aktual
            </h3>

            <div className="my-5 flex flex-col sm:flex-row items-center justify-center gap-6">
              {/* SVG Donut */}
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg className="w-36 h-36 -rotate-90" viewBox="0 0 140 140">
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="transparent"
                    stroke="#F4F6F5"
                    strokeWidth="16"
                  />
                  {summary.totalPlan > 0 && (
                    <>
                      {/* Completed Segment */}
                      <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        fill="transparent"
                        stroke="#397C69"
                        strokeWidth="16"
                        strokeDasharray={`${completedLen} ${circumference}`}
                        strokeDashoffset={0}
                      />
                      {/* In Progress Segment */}
                      <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        fill="transparent"
                        stroke="#E88932"
                        strokeWidth="16"
                        strokeDasharray={`${inProgressLen} ${circumference}`}
                        strokeDashoffset={-completedLen}
                      />
                      {/* Scheduled/Pending Segment */}
                      <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        fill="transparent"
                        stroke="#527FA1"
                        strokeWidth="16"
                        strokeDasharray={`${scheduledLen} ${circumference}`}
                        strokeDashoffset={-(completedLen + inProgressLen)}
                      />
                      {/* Cancelled Segment */}
                      <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        fill="transparent"
                        stroke="#B94C45"
                        strokeWidth="16"
                        strokeDasharray={`${cancelledLen} ${circumference}`}
                        strokeDashoffset={-(completedLen + inProgressLen + scheduledLen)}
                      />
                    </>
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-heading font-bold text-[#18232B] tabular-nums">
                    {summary.achievementPercentage !== null
                      ? `${summary.achievementPercentage}%`
                      : '0%'}
                  </span>
                  <span className="text-[10px] font-mono text-[#5A6B75]">CAPAIAN</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-2.5 text-xs w-full">
                <div className="flex items-center justify-between p-2 rounded-[8px] bg-[#F4F6F5]">
                  <span className="flex items-center gap-2 font-medium text-[#18232B]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#397C69]" />
                    <span>Terlaksana (Completed)</span>
                  </span>
                  <span className="font-mono font-bold text-[#397C69] tabular-nums">
                    {completedCount}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-[8px] bg-[#F4F6F5]">
                  <span className="flex items-center gap-2 font-medium text-[#18232B]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E88932]" />
                    <span>Sedang Berjalan</span>
                  </span>
                  <span className="font-mono font-bold text-[#E88932] tabular-nums">
                    {inProgressCount}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-[8px] bg-[#F4F6F5]">
                  <span className="flex items-center gap-2 font-medium text-[#18232B]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#527FA1]" />
                    <span>Belum Terlaksana (Pending)</span>
                  </span>
                  <span className="font-mono font-bold text-[#527FA1] tabular-nums">
                    {scheduledOnlyCount}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-[8px] bg-[#F4F6F5]">
                  <span className="flex items-center gap-2 font-medium text-[#18232B]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#B94C45]" />
                    <span>Dibatalkan (Cancelled)</span>
                  </span>
                  <span className="font-mono font-bold text-[#B94C45] tabular-nums">
                    {cancelledCount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E2E8E8] text-[11px] text-[#5A6B75] flex justify-between">
            <span>Status Aktual Non-Duplikasi</span>
            <span className="font-mono">{summary.totalPlan} Total Program</span>
          </div>
        </div>
      </div>

      {/* 6. LINE CHART: TREN CAPAIAN TRAINING BULANAN (JAN - DES) */}
      <div className="bg-white p-6 rounded-[12px] border border-[#E2E8E8]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[11px] font-mono font-semibold text-[#E88932] uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>TREN CAPAIAN TRAINING BULANAN ({yearFilter === 'ALL' ? '2026' : yearFilter})</span>
            </span>
            <h3 className="text-sm font-heading font-bold text-[#18232B] mt-0.5">
              Grafik Garis (Line Chart) Persentase Realisasi & Volume Pelatihan Bulanan
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 text-[#E88932] font-medium">
              <span className="w-3 h-1 bg-[#E88932] rounded-full" />
              <span>Achievement (%) Bulanan</span>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-48 overflow-visible">
              <defs>
                <linearGradient id="achievementAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E88932" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#E88932" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines (0%, 50%, 100%) */}
              {[0, 50, 100].map((val) => {
                const y = padTop + plotH - (val / 100) * plotH;
                return (
                  <g key={val}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={svgWidth - padRight}
                      y2={y}
                      stroke="#E2E8E8"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[9px] fill-[#5A6B75] font-mono"
                    >
                      {val}%
                    </text>
                  </g>
                );
              })}

              {/* Area Fill */}
              <polygon points={areaPoints} fill="url(#achievementAreaGrad)" />

              {/* Trend Line */}
              <polyline
                fill="none"
                stroke="#E88932"
                strokeWidth="2.5"
                points={polylinePoints}
              />

              {/* Data Points & Month Labels */}
              {lineCoords.map((pt) => (
                <g key={pt.monthIndex}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4.5"
                    fill={pt.plan > 0 ? '#E88932' : '#CBD5D5'}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                  {pt.plan > 0 && (
                    <text
                      x={pt.x}
                      y={pt.y - 9}
                      textAnchor="middle"
                      className="text-[9px] font-mono font-bold fill-[#18232B]"
                    >
                      {pt.pct}% ({pt.realization}/{pt.plan})
                    </text>
                  )}
                  <text
                    x={pt.x}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    className="text-[10px] font-mono font-medium fill-[#263640]"
                  >
                    {pt.monthLabel}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* 7. DEPARTMENT ACHIEVEMENT & TRAINING PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Achievement Breakdown */}
        <div className="lg:col-span-7 bg-white p-6 rounded-[12px] border border-[#E2E8E8]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-mono font-semibold text-[#E88932] uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>DEPARTMENT ACHIEVEMENT</span>
              </span>
              <h3 className="text-sm font-heading font-bold text-[#18232B] mt-0.5">
                Capaian Pelaksanaan Training Setiap Departemen
              </h3>
            </div>
          </div>

          <div className="space-y-3.5">
            {summary.departmentBreakdown.map((d) => {
              const pct = d.achievementPct ?? 0;
              return (
                <div
                  key={d.departmentId}
                  className="p-3.5 rounded-[10px] bg-[#F4F6F5]/70 border border-[#E2E8E8] space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#18232B] text-[#E88932]">
                        {d.code}
                      </span>
                      <span className="text-xs font-heading font-bold text-[#18232B]">
                        {d.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-[#5A6B75]">
                        Plan: <strong className="text-[#18232B]">{d.plan}</strong>
                      </span>
                      <span className="text-[#397C69]">
                        Realisasi: <strong>{d.realization}</strong>
                      </span>
                      <span className="text-[#D5A33D]">
                        Pending: <strong>{d.pending}</strong>
                      </span>
                      <span className="font-bold text-[#18232B] bg-white px-2 py-0.5 rounded border border-[#E2E8E8]">
                        {d.achievementPct !== null ? `${d.achievementPct}%` : 'Belum Tersedia'}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-[#E2E8E8]">
                    <div
                      style={{ width: `${Math.min(pct, 100)}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 80
                          ? 'bg-[#397C69]'
                          : pct >= 50
                          ? 'bg-[#E88932]'
                          : 'bg-[#527FA1]'
                      }`}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-[#5A6B75] font-mono">
                    <span>Manpower Trained: {d.manpowerTrained} Peserta</span>
                    <span>Total Jam: {d.actualHours} Jam Pelatihan</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Training Performance (By Type & Highest Realization) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-[12px] border border-[#E2E8E8] flex flex-col justify-between space-y-5">
          <div>
            <span className="text-[11px] font-mono font-semibold text-[#E88932] uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>TRAINING PERFORMANCE</span>
            </span>
            <h3 className="text-sm font-heading font-bold text-[#18232B] mt-0.5">
              Jenis & Program Training Realisasi Tertinggi
            </h3>

            {/* Performance by Training Type */}
            <div className="mt-4 space-y-2.5">
              {summary.typeBreakdown.map((tb) => (
                <div
                  key={tb.type}
                  className="p-3 rounded-[8px] border border-[#E2E8E8] bg-[#F4F6F5]/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-heading font-semibold text-[#18232B]">
                      {tb.label}
                    </div>
                    <div className="text-[11px] text-[#5A6B75] font-mono">
                      {tb.realization} dari {tb.plan} Terlaksana • {tb.manpowerTrained} Peserta •{' '}
                      {tb.actualHours} Jam
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-[#18232B] text-white tabular-nums">
                    {tb.achievementPct !== null ? `${tb.achievementPct}%` : '-'}
                  </span>
                </div>
              ))}
            </div>

            {/* Top Realized Programs */}
            <div className="mt-5">
              <h4 className="text-xs font-heading font-bold text-[#263640] uppercase tracking-wider mb-2.5">
                Top 5 Program Training Terlaksana (By Manpower & Jam)
              </h4>
              {topCompletedTrainings.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#5A6B75] bg-[#F4F6F5] rounded-[8px]">
                  Belum ada training berstatus COMPLETED pada filter ini.
                </div>
              ) : (
                <div className="divide-y divide-[#E2E8E8] border border-[#E2E8E8] rounded-[8px] overflow-hidden">
                  {topCompletedTrainings.map((tr, i) => (
                    <div
                      key={tr.id}
                      className="p-2.5 bg-white hover:bg-[#F4F6F5]/60 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-heading font-semibold text-[#18232B] truncate">
                          {i + 1}. {tr.trainingTitle}
                        </div>
                        <div className="text-[10px] font-mono text-[#5A6B75]">
                          {tr.departmentCode} • {tr.trainingType} • {tr.startDate}
                        </div>
                      </div>
                      <div className="text-right shrink-0 font-mono">
                        <div className="font-bold text-[#397C69] text-xs">
                          {tr.actualParticipants} Peserta
                        </div>
                        <div className="text-[10px] text-[#5A6B75]">{tr.actualHours} Jam</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 8. TABEL DETAIL DATA CAPAIAN TRAINING & MANAJEMEN TARGET/REALISASI */}
      <div className="bg-white rounded-[12px] border border-[#E2E8E8] overflow-hidden">
        <div className="px-6 py-4 bg-[#F4F6F5] border-b border-[#E2E8E8] flex flex-wrap justify-between items-center gap-3">
          <div>
            <h3 className="text-xs font-heading font-bold text-[#18232B] uppercase tracking-wider">
              Daftar Rincian Capaian Pelaksanaan Training ({summary.trainingItems.length} Program)
            </h3>
            <p className="text-xs text-[#5A6B75] mt-0.5">
              {canEditAchievement
                ? 'Anda memiliki akses EDIT untuk mengoreksi data target, realisasi peserta/jam, dan status pelaksanaan training.'
                : 'Anda berada dalam mode VIEW ONLY. Hanya Super Admin, Admin, Manager TC, dan Admin TC yang dapat mengedit capaian.'}
            </p>
          </div>
          {isSuperAdmin && mockStore.applications.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => setShowDeleteAllConfirm(true)}
            >
              Hapus Semua Data Training
            </Button>
          )}
        </div>

        {summary.trainingItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#5A6B75]">
            Tidak ada data training yang sesuai dengan filter yang dipilih.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F4F6F5]/70 text-[#5A6B75] font-medium border-b border-[#E2E8E8]">
                <tr>
                  <th className="px-5 py-3">Kode & Nama Training</th>
                  <th className="px-4 py-3">Departemen</th>
                  <th className="px-4 py-3">Jadwal</th>
                  <th className="px-4 py-3 text-center">Peserta (Realisasi/Plan)</th>
                  <th className="px-4 py-3 text-center">Jam (Aktual/Plan)</th>
                  <th className="px-4 py-3">Status Aktual</th>
                  {canEditAchievement && (
                    <th className="px-5 py-3 text-right">Koreksi / Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E8]">
                {summary.trainingItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F4F6F5]/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-mono text-[11px] font-semibold text-[#E88932]">
                        {item.applicationNumber}
                      </div>
                      <div className="font-heading font-semibold text-[#18232B] mt-0.5">
                        {item.trainingTitle}
                      </div>
                      <div className="text-[11px] text-[#5A6B75]">
                        {item.trainingCategory} • {item.trainingType}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-semibold text-[11px] px-2 py-0.5 rounded bg-[#F4F6F5] text-[#18232B] border border-[#E2E8E8]">
                        {item.departmentCode}
                      </span>
                      <div className="text-[11px] text-[#5A6B75] mt-0.5">
                        {item.departmentName}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-[#263640] tabular-nums">
                      <div>{item.startDate}</div>
                      <div className="text-[#5A6B75]">s/d {item.endDate}</div>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono tabular-nums">
                      <span className="font-bold text-[#18232B]">
                        {item.actualParticipants}
                      </span>{' '}
                      <span className="text-[#5A6B75]">/ {item.plannedParticipants}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono tabular-nums">
                      <span className="font-bold text-[#18232B]">{item.actualHours}</span>{' '}
                      <span className="text-[#5A6B75]">/ {item.plannedHours} Jam</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={item.status} />
                    </td>
                    {canEditAchievement && (
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Edit3 className="w-3.5 h-3.5" />}
                            onClick={() => openEditModal(item)}
                          >
                            Edit Capaian
                          </Button>
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Trash2 className="w-3.5 h-3.5 text-[#B94C45]" />}
                              onClick={() => handleDeleteTraining(item)}
                              title="Hapus Data Training"
                            />
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: EDIT TRAINING ACHIEVEMENT (TARGET, REALIZATION & STATUS) */}
      {editingItem && canEditAchievement && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#18232B]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] shadow-2xl border border-[#E2E8E8] max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#18232B] text-white border-b border-[#263640] flex justify-between items-center">
              <div>
                <h3 className="text-sm font-heading font-bold">
                  Koreksi Data Capaian, Target & Realisasi Training
                </h3>
                <p className="text-xs text-[#E88932] font-mono mt-0.5">
                  {editingItem.applicationNumber}
                </p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-white p-1 rounded-[8px] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAchievementEdit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 bg-[#B94C45]/10 border border-[#B94C45]/30 rounded-[8px] text-xs text-[#B94C45] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#263640] mb-1">
                  Nama Program Training *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#263640] mb-1">
                    Departemen *
                  </label>
                  <select
                    value={editDeptId}
                    onChange={(e) => setEditDeptId(e.target.value)}
                    className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                  >
                    {mockStore.departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} — {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#263640] mb-1">
                    Status Pelaksanaan Aktual *
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as ApplicationStatus)}
                    className="w-full h-[38px] px-3 text-xs font-semibold bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                  >
                    <option value="COMPLETED">COMPLETED (Sudah Terlaksana)</option>
                    <option value="IN_PROGRESS">IN_PROGRESS (Sedang Berjalan)</option>
                    <option value="SCHEDULED">SCHEDULED (Belum Terlaksana)</option>
                    <option value="APPROVED">APPROVED (Menunggu Jadwal)</option>
                    <option value="PENDING_PJO">PENDING_PJO (Menunggu PJO)</option>
                    <option value="UNDER_HOD_REVIEW">UNDER_HOD_REVIEW (Review TC)</option>
                    <option value="CANCELLED">CANCELLED (Dibatalkan)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#263640] mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    required
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#263640] mb-1">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    required
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#F4F6F5] rounded-[10px] border border-[#E2E8E8]">
                <div>
                  <label className="block text-[11px] font-medium text-[#5A6B75] mb-1">
                    Target Peserta (Plan)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editPlannedParticipants}
                    onChange={(e) => setEditPlannedParticipants(Number(e.target.value))}
                    className="w-full h-[36px] px-3 text-xs font-mono bg-white border border-[#E2E8E8] rounded-[8px]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#5A6B75] mb-1">
                    Realisasi Peserta Dilatih
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editActualParticipants}
                    onChange={(e) => setEditActualParticipants(Number(e.target.value))}
                    className="w-full h-[36px] px-3 text-xs font-mono bg-white border border-[#E2E8E8] rounded-[8px]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#5A6B75] mb-1">
                    Rencana Durasi (Jam)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editPlannedHours}
                    onChange={(e) => setEditPlannedHours(Number(e.target.value))}
                    className="w-full h-[36px] px-3 text-xs font-mono bg-white border border-[#E2E8E8] rounded-[8px]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#5A6B75] mb-1">
                    Realisasi Durasi (Jam)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editActualHours}
                    onChange={(e) => setEditActualHours(Number(e.target.value))}
                    className="w-full h-[36px] px-3 text-xs font-mono bg-white border border-[#E2E8E8] rounded-[8px]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8E8] flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setEditingItem(null)}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="md">
                  Simpan Koreksi Capaian
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS 1 TRAINING (SUPER ADMIN ONLY) */}
      {confirmDeleteItem && canDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#18232B]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] shadow-2xl border border-[#E2E8E8] max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#B94C45] text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                <h3 className="text-sm font-heading font-bold">Konfirmasi Hapus Data Training</h3>
              </div>
              <button
                onClick={() => setConfirmDeleteItem(null)}
                className="text-white/80 hover:text-white p-1 rounded-[8px] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-[#263640] leading-relaxed">
                Hapus data training <strong className="text-[#18232B]">{confirmDeleteItem.trainingTitle}</strong> ({confirmDeleteItem.applicationNumber}) dari sistem?
              </p>
              <div className="pt-3 border-t border-[#E2E8E8] flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setConfirmDeleteItem(null)}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="md"
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={executeSingleTrainingDelete}
                >
                  Ya, Hapus Data
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS SEMUA TRAINING (SUPER ADMIN ONLY) */}
      {showDeleteAllConfirm && canDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#18232B]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] shadow-2xl border border-[#E2E8E8] max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#B94C45] text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                <h3 className="text-sm font-heading font-bold">
                  Hapus Seluruh Data Training ({mockStore.applications.length} Program)
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
              <p className="text-xs text-[#263640] leading-relaxed">
                Apakah Anda yakin ingin menghapus seluruh <strong>{mockStore.applications.length} program training</strong> dari database utama?
              </p>
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
                  onClick={executeDeleteAllTrainings}
                >
                  Ya, Hapus Semua Training
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INPUT DATA TRAINING BARU */}
      <CreateApplicationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => {
          refreshState();
          setShowCreateModal(false);
        }}
      />
    </div>
  );
};

