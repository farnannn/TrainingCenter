import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import {
  TrainerActivitySection,
  getRolePermissions,
} from '../../lib/types';
import { Button } from '../ui/Button';
import { TrainingClassGapSection, InterviewCandidateSection } from './technical/SectionsAB';
import { AssessmentCandidateSection } from './technical/SectionC';
import { OjtBmcSection, SharingSessionSection } from './technical/SectionsDE';
import { PlmAssessmentResumeSection } from './technical/SectionF';
import { PlmTrainingClassResumeSection } from './technical/SectionG';
import { ActivityTechnicalTrainingSection } from './technical/ActivityTechnicalTrainingSection';
import { SkillAuditRefreshOperatorSection } from './technical/SkillAuditRefreshOperatorSection';
import { consumePendingProgramTab } from './technical/navigation';
import { CollapsiblePanel } from '../ui/CollapsiblePanel';
import {
  ClipboardList,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Lock,
  Calendar,
  Copy,
} from 'lucide-react';

const MONTH_OPTIONS = [
  { value: '01', label: 'Januari' },
  { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mei' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
];

const WEEK_NUMBERS = [1, 2, 3, 4, 5];

const WeeklyReportPanel: React.FC = () => {
  const { currentUser, refreshState } = useAuth();
  const perms = getRolePermissions(currentUser.role_code);
  const canEdit =
    perms.trainingAchievement === 'EDIT' && perms.canEditData;

  // Selected Period State (Year, Month, Week Number)
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('11');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  const monthLabel =
    MONTH_OPTIONS.find((m) => m.value === selectedMonth)?.label || 'November';

  // Find saved report for (selectedYear, selectedMonth, selectedWeek)
  const savedReportForWeek: TrainerActivitySection | undefined =
    mockStore.trainerActivities.find(
      (s) =>
        (s.year || '2026') === selectedYear &&
        (s.month || '11') === selectedMonth &&
        (s.week_number || 1) === selectedWeek
    );

  // Editable Draft State for the Selected Week
  const [badgeLabel, setBadgeLabel] = useState<string>('TRAINING');
  const [sectionTitle, setSectionTitle] = useState<string>(
    '1. Program Technical Training'
  );
  const [isEditingHeader, setIsEditingHeader] = useState<boolean>(false);
  const [draftItems, setDraftItems] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [newPointText, setNewPointText] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Feedback Banner
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync draft when user switches Year / Month / Week
  useEffect(() => {
    const found = mockStore.trainerActivities.find(
      (s) =>
        (s.year || '2026') === selectedYear &&
        (s.month || '11') === selectedMonth &&
        (s.week_number || 1) === selectedWeek
    );
    if (found) {
      setBadgeLabel(found.badge_label || 'TRAINING');
      setSectionTitle(found.title || '1. Program Technical Training');
      setDraftItems(found.items.map((it) => it.content));
    } else {
      setBadgeLabel('TRAINING');
      setSectionTitle('1. Program Technical Training');
      setDraftItems([]);
    }
    setEditingIndex(null);
    setIsEditingHeader(false);
    setHasUnsavedChanges(false);
  }, [selectedYear, selectedMonth, selectedWeek, mockStore.trainerActivities.length]);

  // Save the Weekly Report to mockStore (and immediately persist so it appears in Capaian Training)
  const handleSaveWeeklyReport = (itemsOverride?: string[], titleOverride?: string, badgeOverride?: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const itemsToSave = itemsOverride !== undefined ? itemsOverride : draftItems;
    const titleToSave = titleOverride !== undefined ? titleOverride : sectionTitle;
    const badgeToSave = badgeOverride !== undefined ? badgeOverride : badgeLabel;

    try {
      mockStore.saveWeeklyTrainerReport(currentUser.id, {
        year: selectedYear,
        month: selectedMonth,
        week_number: selectedWeek,
        period_label: `Minggu Ke-${selectedWeek} • ${monthLabel} ${selectedYear}`,
        badge_label: badgeToSave,
        title: titleToSave,
        items: itemsToSave,
      });
      setHasUnsavedChanges(false);
      setSuccessMsg(
        `Laporan Mingguan (Minggu Ke-${selectedWeek} • ${monthLabel} ${selectedYear}) berhasil disimpan dan otomatis tampil di halaman Capaian Training!`
      );
      refreshState();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan laporan mingguan.');
    }
  };

  // Add a new activity point and auto-save
  const handleAddPoint = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newPointText.trim();
    if (!clean) return;
    const updated = [...draftItems, clean];
    setDraftItems(updated);
    setNewPointText('');
    handleSaveWeeklyReport(updated);
  };

  // Start editing a specific point
  const handleStartEditPoint = (idx: number) => {
    setEditingIndex(idx);
    setEditingText(draftItems[idx]);
  };

  // Save edited point and auto-save report
  const handleSaveEditedPoint = (e: React.FormEvent, idx: number) => {
    e.preventDefault();
    const clean = editingText.trim();
    if (!clean) return;
    const updated = draftItems.map((item, i) => (i === idx ? clean : item));
    setDraftItems(updated);
    setEditingIndex(null);
    handleSaveWeeklyReport(updated);
  };

  // Delete a point and auto-save report
  const handleDeletePoint = (idx: number) => {
    const updated = draftItems.filter((_, i) => i !== idx);
    setDraftItems(updated);
    handleSaveWeeklyReport(updated);
  };

  // Copy points from Minggu Ke-1 (or latest saved week) as template
  const handleCopyFromPreviousWeek = () => {
    const sourceReport =
      mockStore.trainerActivities.find(
        (s) =>
          (s.year || '2026') === selectedYear &&
          (s.month || '11') === selectedMonth &&
          (s.week_number || 1) === Math.max(1, selectedWeek - 1)
      ) || mockStore.trainerActivities[0];

    if (!sourceReport) return;
    const copied = sourceReport.items.map((it) => it.content);
    setDraftItems(copied);
    setHasUnsavedChanges(true);
    setSuccessMsg(
      `Berhasil menyalin ${copied.length} poin aktivitas dari ${sourceReport.period_label || 'Minggu sebelumnya'}. Silakan sesuaikan lalu klik "Simpan Laporan Minggu Ke-${selectedWeek}".`
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HERO BANNER */}
      <div className="bg-[#18232B] bg-topography text-white p-6 rounded-[12px] border border-[#263640] flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#E88932] text-xs font-mono font-semibold uppercase tracking-wider">
            <ClipboardList className="w-4 h-4" />
            <span>RAJA ACADEMY • WEEKLY PROGRAM TECHNICAL TRAINING REPORT</span>
          </div>
          <h2 className="text-xl font-heading font-bold mt-1">
            Laporan Mingguan (Weekly) — Program Technical Training
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Pilih periode <strong>Bulan & Minggu Keberapa</strong>, edit atau tambahkan rincian aktivitas Technical Trainer, lalu klik <strong>Simpan Laporan Mingguan</strong> agar otomatis tampil di halaman <strong>Capaian Training</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {canEdit ? (
            <>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#397C69]/25 border border-[#397C69]/50 text-[#6CD4B4] text-xs font-mono font-semibold">
                <span>Mode Akses: EDIT ({currentUser.role_name})</span>
              </span>
              <Button
                variant="primary"
                size="md"
                icon={<Save className="w-4 h-4" />}
                onClick={() => handleSaveWeeklyReport()}
              >
                Simpan Laporan Minggu Ke-{selectedWeek}
              </Button>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#263640] border border-slate-700 text-slate-300 text-xs font-mono font-semibold">
              <Lock className="w-3.5 h-3.5 text-[#E88932]" />
              <span>Mode Akses: LIHAT SAJA ({currentUser.role_name})</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. WEEKLY PERIOD SELECTOR BAR (TAHUN, BULAN, MINGGU KE-1 s/d KE-5) */}
      <div className="bg-white p-5 rounded-[12px] border border-[#E2E8E8] shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-heading font-bold text-[#18232B] uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-[#E88932]" />
            <span>Pilih Periode Laporan Mingguan (Weekly Report)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Pilih Tahun */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-[#5A6B75]">Tahun:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="h-[36px] px-3 text-xs font-semibold bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] text-[#18232B] focus:bg-white focus:outline-none focus:border-[#E88932]"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>

            {/* Pilih Bulan */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-[#5A6B75]">Bulan:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="h-[36px] px-3 text-xs font-semibold bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] text-[#18232B] focus:bg-white focus:outline-none focus:border-[#E88932]"
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.value} — {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Pilih Minggu Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-[#5A6B75]">Minggu:</span>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                className="h-[36px] px-3 text-xs font-bold bg-[#E88932]/12 border border-[#E88932]/40 rounded-[8px] text-[#C66B1A] focus:outline-none"
              >
                {WEEK_NUMBERS.map((w) => (
                  <option key={w} value={w}>
                    Minggu Ke-{w}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Interactive Week Pills (Minggu Ke-1 s/d Minggu Ke-5) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-[#E2E8E8]">
          {WEEK_NUMBERS.map((weekNum) => {
            const isSelected = selectedWeek === weekNum;
            const savedForThisWeek = mockStore.trainerActivities.find(
              (s) =>
                (s.year || '2026') === selectedYear &&
                (s.month || '11') === selectedMonth &&
                (s.week_number || 1) === weekNum
            );
            const itemCount = savedForThisWeek ? savedForThisWeek.items.length : 0;

            return (
              <button
                key={weekNum}
                type="button"
                onClick={() => setSelectedWeek(weekNum)}
                className={`p-3 rounded-[10px] border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                  isSelected
                    ? 'bg-[#18232B] text-white border-[#E88932] shadow-sm'
                    : 'bg-[#F4F6F5] hover:bg-white text-[#18232B] border-[#E2E8E8]'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-heading font-bold">
                    Minggu Ke-{weekNum}
                  </span>
                  {savedForThisWeek ? (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                        isSelected
                          ? 'bg-[#397C69] text-white'
                          : 'bg-[#397C69]/15 text-[#296050]'
                      }`}
                    >
                      Tersimpan
                    </span>
                  ) : (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-white/10 text-slate-300'
                          : 'bg-[#E2E8E8] text-[#5A6B75]'
                      }`}
                    >
                      Kosong
                    </span>
                  )}
                </div>
                <div
                  className={`text-[11px] font-mono ${
                    isSelected ? 'text-[#E88932]' : 'text-[#5A6B75]'
                  }`}
                >
                  {monthLabel} {selectedYear} • {itemCount} Aktivitas
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback Alerts */}
      {errorMsg && (
        <div className="p-3.5 bg-[#B94C45]/10 border border-[#B94C45]/30 rounded-[10px] text-xs text-[#B94C45] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-[#B94C45] hover:opacity-80 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-[#397C69]/12 border border-[#397C69]/30 rounded-[10px] text-xs text-[#296050] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#397C69] shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-[#5A6B75] hover:text-[#18232B] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. ACTIVE WEEKLY REPORT CARD (UNIFIED RAJA ACADEMY DESIGN SYSTEM) */}
      <div className="bg-white rounded-[14px] border border-[#E2E8E8] shadow-xs overflow-hidden">
        {/* Header Bar: Minggu Terpilih + Tombol Aksi */}
        <div className="bg-[#18232B] bg-topography border-b border-[#263640] px-5 py-3.5 flex flex-wrap items-center justify-between gap-2 text-white">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#E88932]/20 border border-[#E88932]/40 text-[#E88932] font-mono text-xs font-bold">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Minggu Ke-{selectedWeek} • {monthLabel} {selectedYear}
              </span>
            </span>
            <span className="text-xs text-slate-300 font-medium hidden sm:inline">
              ({draftItems.length} Poin Aktivitas Tercatat)
            </span>
          </div>

          {canEdit && (
            <div className="flex flex-wrap items-center gap-2">
              {draftItems.length === 0 && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={<Copy className="w-3.5 h-3.5 text-[#E88932]" />}
                  onClick={handleCopyFromPreviousWeek}
                >
                  Salin dari Minggu Sebelumnya
                </Button>
              )}
              <Button
                type="button"
                variant="primary"
                size="sm"
                icon={<Save className="w-3.5 h-3.5" />}
                onClick={() => handleSaveWeeklyReport()}
              >
                Simpan Laporan Minggu Ke-{selectedWeek}
              </Button>
            </div>
          )}
        </div>

        {/* Body Area with Clean Enterprise Surface */}
        <div className="p-5 sm:p-6 bg-[#FAFBFB]">
          <div className="bg-white border border-[#E2E8E8] rounded-[12px] p-4 sm:p-5 shadow-2xs space-y-3">
            {draftItems.length === 0 ? (
              <div className="text-center py-6 space-y-3">
                <p className="text-xs text-[#5A6B75]">
                  Belum ada poin aktivitas yang disimpan untuk{' '}
                  <strong className="text-[#18232B]">
                    Minggu Ke-{selectedWeek} ({monthLabel} {selectedYear})
                  </strong>
                  .
                </p>
                {canEdit && (
                  <div className="flex justify-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      icon={<Copy className="w-3.5 h-3.5" />}
                      onClick={handleCopyFromPreviousWeek}
                    >
                      Salin Template dari Minggu Sebelumnya
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <ol className="space-y-2.5">
                {draftItems.map((itemText, idx) => {
                  const isEditingThis = editingIndex === idx;

                  return (
                    <li
                      key={idx}
                      className="bg-[#FAFBFB] hover:bg-[#F4F6F5]/80 transition-colors rounded-[10px] px-4 py-3 border border-[#E2E8E8] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {isEditingThis ? (
                        <form
                          onSubmit={(e) => handleSaveEditedPoint(e, idx)}
                          className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
                        >
                          <span className="w-6 h-6 rounded-[6px] bg-[#18232B] text-[#E88932] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            required
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="flex-1 h-[38px] px-3 text-xs bg-white border border-[#E88932] rounded-[8px] focus:outline-none text-[#18232B]"
                          />
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              type="submit"
                              variant="primary"
                              size="sm"
                              icon={<Save className="w-3.5 h-3.5" />}
                            >
                              Simpan Poin
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingIndex(null)}
                            >
                              Batal
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="flex items-start gap-3 text-xs text-[#18232B] leading-relaxed">
                            <span className="w-6 h-6 rounded-[6px] bg-[#18232B] text-[#E88932] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-medium pt-0.5">{itemText}</span>
                          </div>

                          {canEdit && (
                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                icon={<Edit3 className="w-3.5 h-3.5" />}
                                onClick={() => handleStartEditPoint(idx)}
                              >
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                icon={<Trash2 className="w-3.5 h-3.5" />}
                                onClick={() => handleDeletePoint(idx)}
                              >
                                Hapus
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}

            {/* Add New Point Input Form */}
            {canEdit && (
              <form
                onSubmit={handleAddPoint}
                className="mt-4 pt-3 border-t border-[#E2E8E8] flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
              >
                <span className="w-6 h-6 rounded-[6px] bg-[#E88932]/15 text-[#C66B1A] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  {draftItems.length + 1}
                </span>
                <input
                  type="text"
                  value={newPointText}
                  onChange={(e) => setNewPointText(e.target.value)}
                  placeholder={`Tambah poin aktivitas baru untuk Minggu Ke-${selectedWeek} (${monthLabel} ${selectedYear})...`}
                  className="flex-1 h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] focus:bg-white focus:border-[#E88932] rounded-[8px] focus:outline-none text-[#18232B]"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Tambah & Simpan Poin
                </Button>
              </form>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#5A6B75] px-1">
            <span>
              Status Minggu Ke-{selectedWeek} ({monthLabel} {selectedYear}):{' '}
              <strong className="text-[#18232B]">
                {savedReportForWeek
                  ? `Tersimpan (${draftItems.length} Poin Aktivitas)`
                  : hasUnsavedChanges
                  ? 'Draft Belum Disimpan'
                  : 'Belum Ada Data'}
              </strong>
            </span>
            {savedReportForWeek && (
              <span>
                Terakhir disimpan oleh: {savedReportForWeek.updated_by || 'Admin'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. DAFTAR RIWAYAT LAPORAN WEEKLY YANG SUDAH TERSIMPAN */}
      <div className="bg-white rounded-[12px] border border-[#E2E8E8] overflow-hidden">
        <div className="px-6 py-4 bg-[#F4F6F5] border-b border-[#E2E8E8] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-heading font-bold text-[#18232B] uppercase tracking-wider">
              Arsip Laporan Mingguan (Weekly) yang Sudah Tersimpan ({mockStore.trainerActivities.length} Minggu)
            </h3>
            <p className="text-[11px] text-[#5A6B75] mt-0.5">
              Klik pada salah satu minggu di bawah untuk membuka atau mengedit laporan minggu tersebut.
            </p>
          </div>
        </div>

        <div className="divide-y divide-[#E2E8E8]">
          {mockStore.trainerActivities.map((rep) => {
            const repMonthName =
              MONTH_OPTIONS.find((m) => m.value === (rep.month || '11'))?.label ||
              'November';
            const isCurrent =
              (rep.year || '2026') === selectedYear &&
              (rep.month || '11') === selectedMonth &&
              (rep.week_number || 1) === selectedWeek;

            return (
              <div
                key={rep.id}
                onClick={() => {
                  setSelectedYear(rep.year || '2026');
                  setSelectedMonth(rep.month || '11');
                  setSelectedWeek(rep.week_number || 1);
                }}
                className={`px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 cursor-pointer transition-colors ${
                  isCurrent ? 'bg-[#E88932]/10' : 'hover:bg-[#F4F6F5]/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-[6px] bg-[#18232B] text-[#E88932] font-mono text-xs font-bold">
                    Minggu Ke-{rep.week_number || 1}
                  </span>
                  <div>
                    <div className="text-xs font-heading font-bold text-[#18232B]">
                      Laporan Weekly — {repMonthName} {rep.year || '2026'}
                    </div>
                    <div className="text-[11px] text-[#5A6B75]">
                      {rep.items.length} Poin Aktivitas • Diperbarui oleh {rep.updated_by || 'Admin'}
                    </div>
                  </div>
                </div>

                <span className="text-xs font-heading font-semibold text-[#E88932]">
                  {isCurrent ? 'Sedang Dibuka' : 'Buka & Edit →'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


// ==============================================================================
// PROGRAM TECHNICAL TRAINING — MAIN MODULE WITH SUB-MENU TABS
// ==============================================================================
type ProgramTab = 'weekly' | 'C' | 'F' | 'G' | 'activity' | 'skill_audit';
type WeeklySupportSubTab = 'A' | 'D' | 'E';

const PROGRAM_TABS: { id: ProgramTab; label: string }[] = [
  { id: 'weekly', label: 'Laporan Weekly' },
  { id: 'C', label: 'Assessment Candidate Mechanic' },
  { id: 'F', label: 'RESUME ASSESSMENT CREW MECHANIC PLM 2026' },
  { id: 'G', label: 'RESUME TRAINING CLASS CREW MECHANIC PLM 2026' },
  { id: 'activity', label: 'ACTIVITY TECHNICAL TRAINING' },
  { id: 'skill_audit', label: 'PROGRAM SKILL AUDIT & REFRESH OPERATOR' },
];

export const TechnicalTrainerActivitiesView: React.FC = () => {
  const { currentUser, refreshState } = useAuth();
  const perms = getRolePermissions(currentUser.role_code);
  const canEdit = perms.trainingAchievement === 'EDIT' && perms.canEditData;
  const [supportSubTab, setSupportSubTab] = useState<WeeklySupportSubTab>('A');
  const [openSupportPanel, setOpenSupportPanel] = useState<boolean>(false);
  const [tab, setTab] = useState<ProgramTab>(() => {
    const pending = consumePendingProgramTab();
    if (pending === 'B' || pending === 'C') return 'C';
    if (pending === 'F') return 'F';
    if (pending === 'G') return 'G';
    if (pending === 'activity') return 'activity';
    if (pending === 'skill_audit') return 'skill_audit';
    if (pending === 'A' || pending === 'D' || pending === 'E') {
      setTimeout(() => {
        setSupportSubTab(pending as WeeklySupportSubTab);
        setOpenSupportPanel(true);
      }, 0);
      return 'weekly';
    }
    return 'weekly';
  });
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const sectionProps = {
    canEdit,
    userId: currentUser.id,
    onDone: (msg: string) => {
      refreshState();
      setToast({ type: 'ok', msg: `${msg} Perubahan otomatis tampil di Capaian Training.` });
    },
    onError: (msg: string) => setToast({ type: 'err', msg }),
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-[14px] border border-[#E2E8E8] shadow-2xs p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-2.5 mb-2.5 border-b border-[#E2E8E8]">
          <div>
            <div className="text-[10px] font-mono text-[#E88932] font-bold uppercase tracking-wider">Training Achievement</div>
            <h2 className="text-base font-heading font-extrabold text-[#18232B]">PROGRAM TECHNICAL TRAINING</h2>
          </div>
          {canEdit ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#397C69]/12 border border-[#397C69]/30 text-[#296050] text-[11px] font-mono font-semibold">
              Mode Akses: EDIT ({currentUser.role_name})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#D5A33D]/15 border border-[#D5A33D]/35 text-[#8A6A1F] text-[11px] font-mono font-semibold">
              <Lock className="w-3.5 h-3.5" /> VIEW ONLY ({currentUser.role_name})
            </span>
          )}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {PROGRAM_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`shrink-0 flex items-center px-3.5 py-2 rounded-[10px] text-[11px] font-semibold transition-all cursor-pointer border ${
                tab === t.id
                  ? 'bg-[#18232B] text-white border-[#E88932] shadow-sm'
                  : 'bg-[#F4F6F5] text-[#263640] border-[#E2E8E8] hover:bg-white'
              }`}
            >
              <span className="whitespace-nowrap">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {toast && (
        <div
          className={`p-3.5 rounded-[10px] text-xs flex items-center justify-between gap-2 border ${
            toast.type === 'ok'
              ? 'bg-[#397C69]/12 border-[#397C69]/30 text-[#296050]'
              : 'bg-[#B94C45]/10 border-[#B94C45]/30 text-[#B94C45]'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {toast.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{toast.msg}</span>
          </div>
          <button onClick={() => setToast(null)} className="cursor-pointer opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {tab === 'weekly' && (
        <div className="space-y-4">
          <WeeklyReportPanel />
          <CollapsiblePanel
            title="Data Pendukung Laporan Weekly (Training Class, Monitoring OJT BMC & Sharing Session BMC)"
            subtitle="Kelola detail program training class, siswa OJT BMC (31 PLM Tangofa & 7 TPM), dan Sharing Session BMC Batch VII (17 siswa)"
            defaultOpen={openSupportPanel}
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5 bg-white p-2 rounded-[10px] border border-[#E2E8E8]">
                {(
                  [
                    { id: 'A', label: 'Training Class & Competency GAP' },
                    { id: 'D', label: 'Monitoring OJT BMC' },
                    { id: 'E', label: 'Sharing Session BMC Batch VII' },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSupportSubTab(st.id)}
                    className={`px-3 py-1.5 rounded-[8px] text-[11px] font-semibold transition-all cursor-pointer ${
                      supportSubTab === st.id
                        ? 'bg-[#18232B] text-white'
                        : 'bg-[#F4F6F5] text-[#263640] hover:bg-[#E2E8E8]/50'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
              {supportSubTab === 'A' && <TrainingClassGapSection {...sectionProps} />}
              {supportSubTab === 'D' && <OjtBmcSection {...sectionProps} />}
              {supportSubTab === 'E' && <SharingSessionSection {...sectionProps} />}
            </div>
          </CollapsiblePanel>
        </div>
      )}
      {tab === 'C' && (
        <div className="space-y-4">
          <InterviewCandidateSection {...sectionProps} />
          <CollapsiblePanel
            title="Detail Kandidat Assessment Mechanic (Per Individu)"
            subtitle="Kelola data individu kandidat, NIK, hasil assessment, status (Passed / Failed / Pending / On Going) & riwayat"
            defaultOpen={false}
          >
            <AssessmentCandidateSection {...sectionProps} />
          </CollapsiblePanel>
        </div>
      )}
      {tab === 'F' && <PlmAssessmentResumeSection {...sectionProps} />}
      {tab === 'G' && <PlmTrainingClassResumeSection {...sectionProps} />}
      {tab === 'activity' && <ActivityTechnicalTrainingSection {...sectionProps} />}
      {tab === 'skill_audit' && <SkillAuditRefreshOperatorSection {...sectionProps} />}
    </div>
  );
};
