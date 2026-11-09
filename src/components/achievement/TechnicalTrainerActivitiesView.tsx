import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import {
  TrainerActivitySection,
  getRolePermissions,
} from '../../lib/types';
import { Button } from '../ui/Button';
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

export const TechnicalTrainerActivitiesView: React.FC = () => {
  const { currentUser, refreshState } = useAuth();
  const perms = getRolePermissions(currentUser.role_code);
  const canEdit = perms.canEditData || perms.canInputData;

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
    '1. Activitas Technical Trainer'
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
      setSectionTitle(found.title || '1. Activitas Technical Trainer');
      setDraftItems(found.items.map((it) => it.content));
    } else {
      setBadgeLabel('TRAINING');
      setSectionTitle('1. Activitas Technical Trainer');
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
            <span>RAJA ACADEMY • WEEKLY TECHNICAL TRAINER REPORT</span>
          </div>
          <h2 className="text-xl font-heading font-bold mt-1">
            Laporan Mingguan (Weekly) — Activitas Technical Trainer
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

      {/* 3. ACTIVE WEEKLY REPORT CARD (MATCHING SCREENSHOT DESIGN + EDITABLE) */}
      <div className="bg-white rounded-[14px] border border-[#E2E8E8] shadow-xs overflow-hidden">
        {/* Top Ribbon Header: [TRAINING] | [1. Activitas Technical Trainer — Minggu Ke-X] */}
        <div className="bg-[#F9E6DE] border-b border-[#E5C7B8] flex flex-wrap items-stretch justify-between">
          {isEditingHeader ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsEditingHeader(false);
                handleSaveWeeklyReport(draftItems, sectionTitle, badgeLabel);
              }}
              className="w-full p-3 flex flex-wrap items-center gap-2.5 bg-[#FFF8F5]"
            >
              <input
                type="text"
                value={badgeLabel}
                onChange={(e) => setBadgeLabel(e.target.value)}
                placeholder="TRAINING"
                className="w-32 h-[36px] px-3 text-xs font-heading font-bold uppercase bg-white border border-[#E2E8E8] rounded-[8px] focus:outline-none focus:border-[#E88932] text-[#18232B]"
              />
              <input
                type="text"
                required
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                placeholder="Contoh: 1. Activitas Technical Trainer"
                className="flex-1 min-w-[220px] h-[36px] px-3 text-xs font-heading font-bold bg-white border border-[#E2E8E8] rounded-[8px] focus:outline-none focus:border-[#E88932] text-[#18232B]"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={<Save className="w-3.5 h-3.5" />}
              >
                Simpan Judul
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditingHeader(false)}
              >
                Batal
              </Button>
            </form>
          ) : (
            <>
              <div className="flex items-stretch flex-1 min-w-[260px]">
                {/* Left angled TRAINING badge */}
                <div
                  className="bg-[#F5E8C7] text-[#18232B] px-5 py-3 font-heading font-extrabold text-xs sm:text-sm tracking-wide uppercase flex items-center border-r border-[#DEC99A] shadow-2xs"
                  style={{
                    clipPath: 'polygon(0 0, 100% 0, 92% 100%, 0% 100%)',
                    paddingRight: '1.75rem',
                  }}
                >
                  {badgeLabel || 'TRAINING'}
                </div>

                {/* Center Title + Selected Week Badge */}
                <div className="flex-1 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm sm:text-base font-heading font-extrabold text-[#18232B]">
                    {sectionTitle}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18232B] text-[#E88932] font-mono text-xs font-bold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      Minggu Ke-{selectedWeek} • {monthLabel} {selectedYear}
                    </span>
                  </span>
                </div>
              </div>

              {/* Action Buttons on Header */}
              {canEdit && (
                <div className="px-4 py-2.5 flex flex-wrap items-center gap-2">
                  {draftItems.length === 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={<Copy className="w-3.5 h-3.5 text-[#E88932]" />}
                      onClick={handleCopyFromPreviousWeek}
                    >
                      Salin dari Minggu Sebelumnya
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={<Edit3 className="w-3.5 h-3.5" />}
                    onClick={() => setIsEditingHeader(true)}
                  >
                    Edit Judul
                  </Button>
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
            </>
          )}
        </div>

        {/* Body Area with Warm Rounded Container like the reference image */}
        <div className="p-5 sm:p-6 bg-gradient-to-b from-[#FAF3DD]/60 to-[#EBF0F2]/60">
          <div className="bg-[#F6B092]/35 border-2 border-[#E08A66]/60 rounded-[20px] p-5 sm:p-6 shadow-xs space-y-3">
            {draftItems.length === 0 ? (
              <div className="text-center py-6 space-y-3">
                <p className="text-xs text-[#263640]">
                  Belum ada poin aktivitas yang disimpan untuk{' '}
                  <strong>
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
                      className="bg-white/90 hover:bg-white transition-colors rounded-[12px] px-4 py-3 border border-[#E08A66]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {isEditingThis ? (
                        <form
                          onSubmit={(e) => handleSaveEditedPoint(e, idx)}
                          className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
                        >
                          <span className="font-mono font-bold text-xs text-[#C66B1A] shrink-0">
                            {idx + 1}.
                          </span>
                          <input
                            type="text"
                            required
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="flex-1 h-[38px] px-3 text-xs sm:text-sm bg-white border border-[#E88932] rounded-[8px] focus:outline-none text-[#18232B]"
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
                          <div className="flex items-start gap-3 text-xs sm:text-sm text-[#18232B] leading-relaxed">
                            <span className="font-mono font-bold text-[#18232B] shrink-0 mt-0.5">
                              {idx + 1}.
                            </span>
                            <span className="font-medium">{itemText}</span>
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
                className="mt-4 pt-3 border-t border-[#E08A66]/40 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
              >
                <span className="font-mono font-bold text-xs text-[#18232B] shrink-0">
                  {draftItems.length + 1}.
                </span>
                <input
                  type="text"
                  value={newPointText}
                  onChange={(e) => setNewPointText(e.target.value)}
                  placeholder={`Tambah poin aktivitas baru untuk Minggu Ke-${selectedWeek} (${monthLabel} ${selectedYear})...`}
                  className="flex-1 h-[38px] px-3 text-xs sm:text-sm bg-white border border-[#E2E8E8] focus:border-[#E88932] rounded-[8px] focus:outline-none text-[#18232B]"
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
                      {rep.title} — {repMonthName} {rep.year || '2026'}
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
