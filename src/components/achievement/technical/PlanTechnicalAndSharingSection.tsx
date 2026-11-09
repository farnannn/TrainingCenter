import React, { useState, useEffect } from 'react';
import { mockStore } from '../../../lib/mockStore';
import {
  TechnicalTrainingPlanBar,
  SharingSessionBmcScheduleItem,
} from '../../../lib/types';
import { Button } from '../../ui/Button';
import {
  Plus,
  Edit3,
  Trash2,
  Download,
  Printer,
  Save,
  Calendar,
  Copy,
  ChevronRight,
  Layers,
} from 'lucide-react';
import {
  Modal,
  exportCsv,
  printTable,
  inputCls,
  labelCls,
} from './shared';
import type { SectionProps } from './SectionsAB';

const ROW_CONFIG: {
  key: TechnicalTrainingPlanBar['row_key'];
  group?: string;
  subLabel: string;
  label: string;
}[] = [
  { key: 'EXISTING_MECH_GL', group: 'Materi', label: 'Existing', subLabel: 'Mech/GL' },
  { key: 'FRESH_OJT_FGDP', group: 'Materi', label: 'Fresh', subLabel: 'Ojt/FGDP' },
  { key: 'ABDUL_RACHMAN', label: 'Abdul Rachman(H)', subLabel: '' },
  { key: 'ANDI_RIZAL', label: 'Andi Rizal', subLabel: '' },
  { key: 'AGUS_ARIFIN', label: 'Agus Arifin', subLabel: '' },
];

const COLOR_PRESETS = [
  { label: 'Warm Sand (Clutch & Transmission)', bg: '#EDE6D6', text: '#18232B' },
  { label: 'Slate Silver (Steering & Brake)', bg: '#DCE3E8', text: '#18232B' },
  { label: 'Obsidian Slate (Tools)', bg: '#18232B', text: '#FFFFFF' },
  { label: 'Ochre Mist (Material)', bg: '#E6DEC8', text: '#18232B' },
  { label: 'Ice Blue (MMC)', bg: '#DCE8F2', text: '#18232B' },
  { label: 'Steel Blue (F/D & Undercarriage)', bg: '#527FA1', text: '#FFFFFF' },
  { label: 'RAJA Amber (Obs.OJT)', bg: '#E88932', text: '#FFFFFF' },
  { label: 'Warm Gold (Site Genba)', bg: '#FDE68A', text: '#18232B' },
];

const harmonizeBarColors = (bgColor: string, textColor: string) => {
  const upper = (bgColor || '').toUpperCase();
  if (upper === '#FFFF00') return { bg: '#FDE68A', text: '#18232B' };
  if (upper === '#E46C0A') return { bg: '#E88932', text: '#FFFFFF' };
  if (upper === '#312B4B') return { bg: '#18232B', text: '#FFFFFF' };
  if (upper === '#95B3D7') return { bg: '#527FA1', text: '#FFFFFF' };
  if (upper === '#C6D9F1') return { bg: '#DCE8F2', text: '#18232B' };
  if (upper === '#BFBFBF') return { bg: '#DCE3E8', text: '#18232B' };
  return { bg: bgColor, text: textColor };
};

const PLAN_MONTH_SEQUENCE = [
  { code: 'Nov-26', full: 'November 2026', year: '2026', month: '11', days: 30, sundays: [1, 8, 15, 22, 29] },
  { code: 'Des-26', full: 'Desember 2026', year: '2026', month: '12', days: 31, sundays: [6, 13, 20, 27] },
  { code: 'Jan-27', full: 'Januari 2027', year: '2027', month: '01', days: 31, sundays: [3, 10, 17, 24, 31] },
  { code: 'Feb-27', full: 'Februari 2027', year: '2027', month: '02', days: 28, sundays: [7, 14, 21, 28] },
  { code: 'Mar-27', full: 'Maret 2027', year: '2027', month: '03', days: 31, sundays: [7, 14, 21, 28] },
  { code: 'Apr-27', full: 'April 2027', year: '2027', month: '04', days: 30, sundays: [4, 11, 18, 25] },
  { code: 'Mei-27', full: 'Mei 2027', year: '2027', month: '05', days: 31, sundays: [2, 9, 16, 23, 30] },
  { code: 'Jun-27', full: 'Juni 2027', year: '2027', month: '06', days: 30, sundays: [6, 13, 20, 27] },
  { code: 'Jul-27', full: 'Juli 2027', year: '2027', month: '07', days: 31, sundays: [4, 11, 18, 25] },
  { code: 'Agu-27', full: 'Agustus 2027', year: '2027', month: '08', days: 31, sundays: [1, 8, 15, 22, 29] },
  { code: 'Sep-27', full: 'September 2027', year: '2027', month: '09', days: 30, sundays: [5, 12, 19, 26] },
  { code: 'Okt-27', full: 'Oktober 2027', year: '2027', month: '10', days: 31, sundays: [3, 10, 17, 24, 31] },
  { code: 'Nov-27', full: 'November 2027', year: '2027', month: '11', days: 30, sundays: [7, 14, 21, 28] },
  { code: 'Des-27', full: 'Desember 2027', year: '2027', month: '12', days: 31, sundays: [5, 12, 19, 26] },
];

const SHARING_MONTH_OPTIONS = PLAN_MONTH_SEQUENCE.map((m) => ({
  label: m.full,
  year: m.year,
  month: m.month,
  shortCode: m.code,
}));

const emptyBarForm = {
  month_label: 'Nov-26',
  row_key: 'EXISTING_MECH_GL' as TechnicalTrainingPlanBar['row_key'],
  start_day: 1,
  end_day: 2,
  title: '',
  bg_color: '#E6DEC8',
  text_color: '#18232B',
};

const emptySharingRow = {
  tanggal: '29 OKT 2026',
  hari: 'KAMIS',
  waktu: '08.00-17.00',
  nama: '',
  jabatan: 'OJT Mekanik DT',
  instruktur: 'Bpk. Andi Risal',
  year: '2026',
  month: '11',
  month_label: 'November 2026',
  week_number: 1,
  week_label: 'Minggu 1 - November 2026',
  batch_label: 'BMC BATCH VII',
  status: 'Done' as 'Done' | 'On Going' | 'Planned',
};

export const PlanTechnicalAndSharingSection: React.FC<SectionProps> = ({
  canEdit,
  userId,
  onDone,
  onError,
}) => {
  const mod = mockStore.technicalTrainingModule;
  const allBars = mod.monthlyPlanBars || [];
  const allSharingRows = mod.sharingSessionScheduleRows || [];

  // ============================================================================
  // STATE BAGIAN 1: PLAN TRAINING TECHNICAL BULANAN & MINGGUAN
  // ============================================================================
  const recordedPlanMonths = Array.from(new Set(['Nov-26', ...allBars.map((b) => b.month_label)]));
  const [selectedPlanMonth, setSelectedPlanMonth] = useState<string>('Nov-26');
  const [planWeekFilter, setPlanWeekFilter] = useState<'ALL' | 1 | 2 | 3 | 4>('ALL');
  const [editBar, setEditBar] = useState<(typeof emptyBarForm & { id?: string }) | null>(null);

  const monthMeta =
    PLAN_MONTH_SEQUENCE.find((m) => m.code === selectedPlanMonth) || PLAN_MONTH_SEQUENCE[0];
  const totalDaysInMonth = monthMeta.days;
  const sundays = new Set(monthMeta.sundays);

  // Filter days based on selected week filter
  const visibleDays = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1).filter((d) => {
    if (planWeekFilter === 'ALL') return true;
    if (planWeekFilter === 1) return d >= 1 && d <= 7;
    if (planWeekFilter === 2) return d >= 8 && d <= 14;
    if (planWeekFilter === 3) return d >= 15 && d <= 21;
    return d >= 22;
  });

  const minVisibleDay = visibleDays[0] || 1;
  const maxVisibleDay = visibleDays[visibleDays.length - 1] || totalDaysInMonth;

  const barsForMonth = allBars.filter((b) => b.month_label === selectedPlanMonth);

  // Next unrecorded month for Plan Training Technical
  const getNextPlanMonthMeta = () => {
    for (const m of PLAN_MONTH_SEQUENCE) {
      if (!recordedPlanMonths.includes(m.code)) {
        return m;
      }
    }
    return PLAN_MONTH_SEQUENCE[1];
  };
  const nextPlanMonthMeta = getNextPlanMonthMeta();

  const handleAddNextPlanMonth = () => {
    try {
      mockStore.generateMonthlyPlanForNextMonth(userId, selectedPlanMonth, nextPlanMonthMeta.code);
      setSelectedPlanMonth(nextPlanMonthMeta.code);
      onDone(
        `Jadwal Plan Training Technical bulan ${nextPlanMonthMeta.full} (${nextPlanMonthMeta.code}) berhasil ditambahkan.`
      );
    } catch (err: any) {
      onError(err.message);
    }
  };

  // Build cells for a row across visibleDays using colSpan for bars
  const buildRowCells = (rowKey: TechnicalTrainingPlanBar['row_key']) => {
    const rowBars = barsForMonth
      .filter(
        (b) =>
          b.row_key === rowKey &&
          b.end_day >= minVisibleDay &&
          b.start_day <= maxVisibleDay
      )
      .sort((a, b) => a.start_day - b.start_day);

    const cells: React.ReactNode[] = [];
    let d = minVisibleDay;
    while (d <= maxVisibleDay) {
      const bar = rowBars.find((b) => Math.max(minVisibleDay, b.start_day) === d);
      if (bar) {
        const effStart = Math.max(minVisibleDay, bar.start_day);
        const effEnd = Math.min(maxVisibleDay, bar.end_day);
        const span = Math.max(1, effEnd - effStart + 1);
        const harmonized = harmonizeBarColors(bar.bg_color, bar.text_color);
        cells.push(
          <td
            key={`bar-${bar.id}-${d}`}
            colSpan={span}
            style={{ backgroundColor: harmonized.bg, color: harmonized.text }}
            onClick={() => canEdit && setEditBar({ ...bar })}
            title={
              canEdit
                ? `${bar.title} (Tgl ${bar.start_day}${bar.end_day > bar.start_day ? `-${bar.end_day}` : ''}) — Klik untuk edit`
                : bar.title
            }
            className={`border border-[#CBD5E1] px-1.5 py-1.5 text-center font-heading font-bold text-[10px] sm:text-[11px] leading-tight select-none shadow-2xs ${
              canEdit ? 'cursor-pointer hover:opacity-90' : ''
            }`}
          >
            <div className="truncate">{bar.title}</div>
          </td>
        );
        d += span;
      } else {
        const dayNum = d;
        cells.push(
          <td
            key={`empty-${rowKey}-${dayNum}`}
            onClick={() =>
              canEdit &&
              setEditBar({
                ...emptyBarForm,
                month_label: selectedPlanMonth,
                row_key: rowKey,
                start_day: dayNum,
                end_day: dayNum,
                bg_color:
                  rowKey === 'FRESH_OJT_FGDP'
                    ? '#E88932'
                    : rowKey === 'ANDI_RIZAL'
                    ? '#FDE68A'
                    : '#EDE6D6',
                text_color: rowKey === 'FRESH_OJT_FGDP' ? '#FFFFFF' : '#18232B',
                title: rowKey === 'FRESH_OJT_FGDP' ? 'Obs.OJT' : '',
              })
            }
            title={canEdit ? `Klik untuk tambah jadwal pada Tgl ${dayNum}` : undefined}
            className={`border border-[#E2E8E8] h-8 min-w-[26px] ${
              canEdit ? 'hover:bg-[#E88932]/12 cursor-pointer' : ''
            }`}
          />
        );
        d += 1;
      }
    }
    return cells;
  };

  // ============================================================================
  // STATE BAGIAN 2: PLAN SHARING SESSION SISWA BMC (PER MINGGU & PER BULAN)
  // ============================================================================
  const [selectedSharingMonth, setSelectedSharingMonth] = useState<string>('November 2026');
  const [selectedSharingWeek, setSelectedSharingWeek] = useState<number | 'ALL'>(1);
  const [editSharing, setEditSharing] = useState<(typeof emptySharingRow & { id?: string }) | null>(
    null
  );
  const [, setForceTick] = useState(0);
  const [generateModal, setGenerateModal] = useState<{
    mode: 'NEXT_WEEK' | 'NEXT_MONTH';
    targetMonthLabel: string;
    targetYear: string;
    targetMonth: string;
    targetWeekNumber: number;
    startDateIso: string;
    daysPattern: 4 | 7;
    batchLabel: string;
  } | null>(null);

  // Auto-repair Minggu 2 November 2026 jika sebelumnya lompat ke 05 NOV 2026 (melewati tgl 2, 3, 4) atau terduplikasi 34x
  useEffect(() => {
    const repaired = mockStore.repairSharingSessionScheduleIfNeeded();
    if (repaired) {
      mockStore.persistState();
      setForceTick((t) => t + 1);
    }
  }, [allSharingRows.length]);

  // Compute all recorded (month_label, week_number) periods for Sharing Session
  const sharingPeriodsMap = new Map<
    string,
    {
      key: string;
      month_label: string;
      year: string;
      month: string;
      week_number: number;
      count: number;
      dateRange: string;
      instruktur: string;
    }
  >();

  allSharingRows.forEach((r) => {
    const mLabel = r.month_label || 'November 2026';
    const wNum = r.week_number || 1;
    const key = `${mLabel}__W${wNum}`;
    const existing = sharingPeriodsMap.get(key);
    if (!existing) {
      sharingPeriodsMap.set(key, {
        key,
        month_label: mLabel,
        year: r.year || '2026',
        month: r.month || '11',
        week_number: wNum,
        count: 1,
        dateRange: r.tanggal,
        instruktur: r.instruktur,
      });
    } else {
      existing.count += 1;
      if (!existing.dateRange.includes(r.tanggal)) {
        const firstDate = existing.dateRange.split(' s/d ')[0];
        existing.dateRange = `${firstDate} s/d ${r.tanggal}`;
      }
    }
  });

  const recordedSharingPeriods = Array.from(sharingPeriodsMap.values()).sort((a, b) => {
    if (a.year !== b.year) return Number(a.year) - Number(b.year);
    if (a.month !== b.month) return Number(a.month) - Number(b.month);
    return a.week_number - b.week_number;
  });

  const availableSharingMonths = Array.from(
    new Set([
      'November 2026',
      ...SHARING_MONTH_OPTIONS.map((m) => m.label),
      ...allSharingRows.map((r) => r.month_label || 'November 2026'),
    ])
  );

  // Filter rows for active Month & Week
  const sharingRows = allSharingRows.filter((r) => {
    const mLabel = r.month_label || 'November 2026';
    const wNum = r.week_number || 1;
    const matchMonth = selectedSharingMonth === 'ALL' || mLabel === selectedSharingMonth;
    const matchWeek = selectedSharingWeek === 'ALL' || wNum === selectedSharingWeek;
    return matchMonth && matchWeek;
  });

  // Helper: Cari tanggal paling akhir yang sudah tercatat lalu tambah +1 hari (format YYYY-MM-DD)
  const getNextConsecutiveDateIso = (fallbackYear = '2026', fallbackMonth = '11'): string => {
    let maxTime = 0;
    allSharingRows.forEach((r) => {
      const dt = mockStore.parseIndoDateLabel(r.tanggal);
      if (dt && dt.getTime() > maxTime) {
        maxTime = dt.getTime();
      }
    });
    if (maxTime > 0) {
      const next = new Date(maxTime);
      next.setDate(next.getDate() + 1);
      const y = next.getFullYear();
      const m = String(next.getMonth() + 1).padStart(2, '0');
      const d = String(next.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return `${fallbackYear}-${fallbackMonth.padStart(2, '0')}-02`;
  };

  // Compute Next Week and Next Month defaults for Sharing Session
  const openGenerateNextWeekModal = () => {
    const currentMonthLabel =
      selectedSharingMonth === 'ALL' ? 'November 2026' : selectedSharingMonth;
    const weeksInCurrentMonth = recordedSharingPeriods
      .filter((p) => p.month_label === currentMonthLabel)
      .map((p) => p.week_number);
    const maxWeekInMonth = weeksInCurrentMonth.length > 0 ? Math.max(...weeksInCurrentMonth) : 1;
    const nextDateIso = getNextConsecutiveDateIso();

    if (maxWeekInMonth < 4) {
      const mMeta =
        SHARING_MONTH_OPTIONS.find((m) => m.label === currentMonthLabel) ||
        SHARING_MONTH_OPTIONS[0];
      setGenerateModal({
        mode: 'NEXT_WEEK',
        targetMonthLabel: mMeta.label,
        targetYear: mMeta.year,
        targetMonth: mMeta.month,
        targetWeekNumber: maxWeekInMonth + 1,
        startDateIso: nextDateIso,
        daysPattern: 4,
        batchLabel: 'BMC BATCH VII',
      });
    } else {
      // Advance to Week 1 of next month
      const curIdx = SHARING_MONTH_OPTIONS.findIndex((m) => m.label === currentMonthLabel);
      const nextMeta =
        SHARING_MONTH_OPTIONS[(curIdx + 1) % SHARING_MONTH_OPTIONS.length] ||
        SHARING_MONTH_OPTIONS[1];
      setGenerateModal({
        mode: 'NEXT_WEEK',
        targetMonthLabel: nextMeta.label,
        targetYear: nextMeta.year,
        targetMonth: nextMeta.month,
        targetWeekNumber: 1,
        startDateIso: nextDateIso,
        daysPattern: 4,
        batchLabel: 'BMC BATCH VII',
      });
    }
  };

  const openGenerateNextMonthModal = () => {
    const recordedMonthSet = new Set(recordedSharingPeriods.map((p) => p.month_label));
    let nextMeta = SHARING_MONTH_OPTIONS[1];
    for (const m of SHARING_MONTH_OPTIONS) {
      if (!recordedMonthSet.has(m.label)) {
        nextMeta = m;
        break;
      }
    }
    setGenerateModal({
      mode: 'NEXT_MONTH',
      targetMonthLabel: nextMeta.label,
      targetYear: nextMeta.year,
      targetMonth: nextMeta.month,
      targetWeekNumber: 1,
      startDateIso: `${nextMeta.year}-${nextMeta.month}-01`,
      daysPattern: 4,
      batchLabel: 'BMC BATCH VII',
    });
  };

  // Group sharing session rows by (tanggal + hari + waktu + instruktur) for rowSpan rendering
  const groupCounts = new Map<number, number>();
  const skipIndices = new Set<number>();
  let idx = 0;
  while (idx < sharingRows.length) {
    let span = 1;
    while (
      idx + span < sharingRows.length &&
      sharingRows[idx + span].tanggal === sharingRows[idx].tanggal &&
      sharingRows[idx + span].hari === sharingRows[idx].hari &&
      (sharingRows[idx + span].week_number || 1) === (sharingRows[idx].week_number || 1)
    ) {
      skipIndices.add(idx + span);
      span++;
    }
    groupCounts.set(idx, span);
    idx += span;
  }

  const sharingHeaders = [
    'NO',
    'PERIODE BULAN',
    'MINGGU KE',
    'TANGGAL',
    'HARI',
    'WAKTU',
    'NAMA',
    'JABATAN',
    'INSTRUKTUR',
  ];
  const sharingExportRows = sharingRows.map((r, i) => [
    i + 1,
    r.month_label || 'November 2026',
    `Minggu ${r.week_number || 1}`,
    r.tanggal,
    r.hari,
    r.waktu,
    r.nama,
    r.jabatan,
    r.instruktur,
  ]);

  const activeSharingBannerTitle =
    selectedSharingMonth === 'ALL'
      ? 'JADWAL SHARING SESSION BMC BATCH VII — SEMUA PERIODE'
      : selectedSharingWeek === 'ALL'
      ? `JADWAL SHARING SESSION BMC BATCH VII — ${selectedSharingMonth.toUpperCase()} (SEMUA MINGGU)`
      : `JADWAL SHARING SESSION BMC BATCH VII — MINGGU ${selectedSharingWeek} • ${selectedSharingMonth.toUpperCase()}`;

  return (
    <div className="space-y-6">
      {/* ====================================================================
          BAGIAN 1: PLAN TRAINING TECHNICAL BULANAN & MINGGUAN (GANTT MATRIX)
         ==================================================================== */}
      <div className="bg-white rounded-[14px] border border-[#E2E8E8] shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-[#F4F6F5] border-b border-[#E2E8E8] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-heading font-extrabold text-[#18232B]">
                Plan Training Technical di Bulan {monthMeta.full}
              </h3>
              <p className="text-[11px] text-[#5A6B75]">
                {canEdit
                  ? 'Klik pada blok materi atau kotak tanggal kosong untuk mengupdate jadwal per minggu & terdata di setiap bulan selanjutnya'
                  : 'Jadwal pelaksanaan materi in-class, observasi OJT/FGDP, dan penugasan Technical Trainer per minggu & bulan'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedPlanMonth}
                onChange={(e) => setSelectedPlanMonth(e.target.value)}
                className={`${inputCls} w-auto font-semibold`}
              >
                {PLAN_MONTH_SEQUENCE.map((m) => (
                  <option key={m.code} value={m.code}>
                    Bulan: {m.full} ({m.code})
                  </option>
                ))}
              </select>

              <select
                value={String(planWeekFilter)}
                onChange={(e) =>
                  setPlanWeekFilter(
                    e.target.value === 'ALL' ? 'ALL' : (Number(e.target.value) as 1 | 2 | 3 | 4)
                  )
                }
                className={`${inputCls} w-auto`}
              >
                <option value="ALL">Semua Minggu (Tgl 1–{totalDaysInMonth})</option>
                <option value="1">Minggu 1 (Tgl 1–7)</option>
                <option value="2">Minggu 2 (Tgl 8–14)</option>
                <option value="3">Minggu 3 (Tgl 15–21)</option>
                <option value="4">Minggu 4 (Tgl 22–{totalDaysInMonth})</option>
              </select>

              {canEdit && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Calendar className="w-3.5 h-3.5" />}
                    onClick={handleAddNextPlanMonth}
                  >
                    + Tambah Bulan Selanjutnya ({nextPlanMonthMeta.full})
                  </Button>
                  <Button
                    size="sm"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => setEditBar({ ...emptyBarForm, month_label: selectedPlanMonth })}
                  >
                    Tambah Blok Jadwal
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Pills Bulan Plan Training yang Sudah Terdata */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-mono font-semibold text-[#5A6B75] mr-1">
              Bulan Terdata:
            </span>
            {recordedPlanMonths.map((mCode) => {
              const count = allBars.filter((b) => b.month_label === mCode).length;
              const active = selectedPlanMonth === mCode;
              return (
                <button
                  key={mCode}
                  type="button"
                  onClick={() => setSelectedPlanMonth(mCode)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#18232B] text-white'
                      : 'bg-white border border-[#CBD5E1] text-[#263640] hover:bg-[#E2E8E8]'
                  }`}
                >
                  {mCode} ({count} blok)
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 overflow-x-auto">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-[#18232B] text-white">
                <th
                  colSpan={2}
                  className="bg-[#18232B] text-[#E88932] font-mono font-bold text-[10px] uppercase tracking-wider px-3 py-2.5 border border-[#263640] text-left w-44"
                >
                  Bulan / Periode
                </th>
                <th
                  colSpan={visibleDays.length}
                  className="bg-[#18232B] text-white font-heading font-bold px-3 py-2.5 border border-[#263640] text-center text-xs uppercase tracking-wider"
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-[#E88932] mr-2 align-middle" />
                  {selectedPlanMonth} ({monthMeta.full})
                </th>
              </tr>
              {/* Baris Pembagian Minggu (Week 1 - Week 4) */}
              {planWeekFilter === 'ALL' && (
                <tr className="bg-[#263640] text-slate-200 font-mono text-[10px] font-bold uppercase tracking-wider">
                  <th colSpan={2} className="px-3 py-1.5 border border-[#18232B]/50 text-left">
                    Minggu (Week)
                  </th>
                  <th colSpan={7} className="px-1 py-1.5 border border-[#18232B]/50 text-center">
                    MINGGU 1 (Tgl 1–7)
                  </th>
                  <th colSpan={7} className="px-1 py-1.5 border border-[#18232B]/50 text-center">
                    MINGGU 2 (Tgl 8–14)
                  </th>
                  <th colSpan={7} className="px-1 py-1.5 border border-[#18232B]/50 text-center">
                    MINGGU 3 (Tgl 15–21)
                  </th>
                  <th
                    colSpan={totalDaysInMonth - 21}
                    className="px-1 py-1.5 border border-[#18232B]/50 text-center"
                  >
                    MINGGU 4 (Tgl 22–{totalDaysInMonth})
                  </th>
                </tr>
              )}
              <tr className="bg-[#F4F6F5]">
                <th
                  colSpan={2}
                  className="px-3 py-1.5 border border-[#CBD5E1] text-left font-mono text-[10px] uppercase tracking-wider font-bold text-[#18232B]"
                >
                  Tanggal
                </th>
                {visibleDays.map((d) => (
                  <th
                    key={d}
                    className={`px-1 py-1.5 border border-[#CBD5E1] text-center font-mono font-bold min-w-[26px] ${
                      sundays.has(d) ? 'text-[#B94C45] bg-[#B94C45]/8' : 'text-[#18232B]'
                    }`}
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Row 1: Materi - Existing | Mech/GL */}
              <tr>
                <td
                  rowSpan={2}
                  className="px-2.5 py-2 border border-[#CBD5E1] font-heading font-bold text-[#18232B] bg-[#FAFBFB] align-middle"
                >
                  Materi
                </td>
                <td className="p-0 border border-[#CBD5E1] bg-white">
                  <div className="grid grid-cols-2 divide-x divide-[#CBD5E1] text-[10px] font-semibold text-[#18232B]">
                    <span className="px-1.5 py-2">Existing</span>
                    <span className="px-1.5 py-2 text-[#5A6B75]">Mech/GL</span>
                  </div>
                </td>
                {buildRowCells('EXISTING_MECH_GL')}
              </tr>

              {/* Row 2: Materi - Fresh | Ojt/FGDP */}
              <tr>
                <td className="p-0 border border-[#CBD5E1] bg-white">
                  <div className="grid grid-cols-2 divide-x divide-[#CBD5E1] text-[10px] font-semibold text-[#18232B]">
                    <span className="px-1.5 py-2">Fresh</span>
                    <span className="px-1.5 py-2 text-[#5A6B75]">Ojt/FGDP</span>
                  </div>
                </td>
                {buildRowCells('FRESH_OJT_FGDP')}
              </tr>

              {/* Row 3: Abdul Rachman(H) */}
              <tr>
                <td
                  colSpan={2}
                  className="px-2.5 py-2 border border-[#CBD5E1] font-heading font-bold text-[#18232B] bg-[#FAFBFB] whitespace-nowrap"
                >
                  Abdul Rachman(H)
                </td>
                {buildRowCells('ABDUL_RACHMAN')}
              </tr>

              {/* Row 4: Andi Rizal */}
              <tr>
                <td
                  colSpan={2}
                  className="px-2.5 py-2 border border-[#CBD5E1] font-heading font-bold text-[#18232B] bg-[#FAFBFB] whitespace-nowrap"
                >
                  Andi Rizal
                </td>
                {buildRowCells('ANDI_RIZAL')}
              </tr>

              {/* Row 5: Agus Arifin */}
              <tr>
                <td
                  colSpan={2}
                  className="px-2.5 py-2 border border-[#CBD5E1] font-heading font-bold text-[#18232B] bg-[#FAFBFB] whitespace-nowrap"
                >
                  Agus Arifin
                </td>
                {buildRowCells('AGUS_ARIFIN')}
              </tr>

              {/* Row 6 & 7: Participant PLAN / ACTUAL (Terhubung Data Aktual Bulan Terkait) */}
              {(() => {
                const matchedMonthItem = mod.plmMonthlyTrainingClasses.find(
                  (m) =>
                    m.year === monthMeta.year &&
                    m.month_index === Number(monthMeta.month)
                );
                const monthlyPlanTotal = matchedMonthItem?.plan ?? 36;
                const monthlyActualTotal = matchedMonthItem?.actual ?? 3;
                return (
                  <>
                    <tr>
                      <td
                        rowSpan={2}
                        className="px-2.5 py-2 border border-[#CBD5E1] font-heading font-bold text-[#18232B] bg-[#FAFBFB] align-middle"
                      >
                        Participant
                      </td>
                      <td className="px-2 py-1.5 border border-[#CBD5E1] font-mono font-bold text-[10px] text-[#C66B1A] bg-[#E88932]/10">
                        PLAN ({monthlyPlanTotal})
                      </td>
                      {visibleDays.map((d) => {
                        const hasMateri = barsForMonth.some(
                          (b) =>
                            (b.row_key === 'EXISTING_MECH_GL' || b.row_key === 'FRESH_OJT_FGDP') &&
                            d >= b.start_day &&
                            d <= b.end_day
                        );
                        return (
                          <td
                            key={`plan-day-${d}`}
                            className={`border border-[#E2E8E8] h-6 text-center font-mono text-[10px] font-bold ${
                              hasMateri ? 'bg-[#E88932]/12 text-[#C66B1A]' : 'bg-white text-slate-300'
                            }`}
                          >
                            {hasMateri ? '6' : ''}
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="px-2 py-1.5 border border-[#CBD5E1] font-mono font-bold text-[10px] text-[#296050] bg-[#397C69]/12">
                        ACTUAL ({monthlyActualTotal})
                      </td>
                      {visibleDays.map((d) => {
                        const hasInclass = barsForMonth.some(
                          (b) =>
                            b.row_key === 'EXISTING_MECH_GL' &&
                            d >= b.start_day &&
                            d <= b.end_day
                        );
                        const isRecordedActual = d === 2 && selectedPlanMonth === 'Nov-26';
                        return (
                          <td
                            key={`actual-day-${d}`}
                            className={`border border-[#E2E8E8] h-6 text-center font-mono text-[10px] font-bold ${
                              isRecordedActual
                                ? 'bg-[#397C69]/20 text-[#296050]'
                                : hasInclass
                                ? 'bg-[#527FA1]/12 text-[#3D6585]'
                                : 'bg-white text-slate-300'
                            }`}
                          >
                            {isRecordedActual ? monthlyActualTotal : ''}
                          </td>
                        );
                      })}
                    </tr>
                  </>
                );
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====================================================================
          BAGIAN 2: PLAN SHARING SESSION SISWA BMC BATCH VII
          (BISA DI-UPDATE PER MINGGU & TERDATA DI SETIAP BULAN SELANJUTNYA)
         ==================================================================== */}
      <div className="bg-white rounded-[14px] border border-[#E2E8E8] shadow-xs overflow-hidden">
        <div className="px-5 py-4 bg-[#F4F6F5] border-b border-[#E2E8E8] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-heading font-extrabold text-[#18232B]">
                Plan Sharing session {sharingRows.length}x Siswa BMC Batch VII
                {selectedSharingMonth !== 'ALL' && (
                  <span className="ml-2 text-xs font-mono font-bold text-[#C66B1A]">
                    ({selectedSharingWeek === 'ALL' ? 'Semua Minggu' : `Minggu ${selectedSharingWeek}`} •{' '}
                    {selectedSharingMonth})
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-[#5A6B75]">
                Jadwal pelaksanaan Sharing Session siswa OJT BMC Batch VII — dapat diupdate per minggu dan terdata otomatis di setiap bulan selanjutnya
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Download className="w-3.5 h-3.5" />}
                onClick={() =>
                  exportCsv(
                    'Jadwal_Sharing_Session_BMC_Batch_VII.csv',
                    sharingHeaders,
                    sharingExportRows
                  )
                }
              >
                Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Printer className="w-3.5 h-3.5" />}
                onClick={() =>
                  printTable(activeSharingBannerTitle, sharingHeaders, sharingExportRows)
                }
              >
                PDF
              </Button>
              {canEdit && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Copy className="w-3.5 h-3.5" />}
                    onClick={openGenerateNextWeekModal}
                  >
                    + Update Minggu Selanjutnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Calendar className="w-3.5 h-3.5" />}
                    onClick={openGenerateNextMonthModal}
                  >
                    + Tambah Bulan Selanjutnya
                  </Button>
                  <Button
                    size="sm"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => {
                      const activeMonth =
                        selectedSharingMonth === 'ALL' ? 'November 2026' : selectedSharingMonth;
                      const activeWeek =
                        selectedSharingWeek === 'ALL' ? 1 : selectedSharingWeek;
                      const mMeta =
                        SHARING_MONTH_OPTIONS.find((m) => m.label === activeMonth) ||
                        SHARING_MONTH_OPTIONS[0];
                      setEditSharing({
                        ...emptySharingRow,
                        year: mMeta.year,
                        month: mMeta.month,
                        month_label: activeMonth,
                        week_number: activeWeek,
                        week_label: `Minggu ${activeWeek} - ${activeMonth}`,
                      });
                    }}
                  >
                    Tambah Siswa / Jadwal
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Filter Bar: Pilih Bulan & Pilih Minggu */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#E2E8E8]">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#5A6B75] mb-1">
                Filter Periode Bulan
              </label>
              <select
                value={selectedSharingMonth}
                onChange={(e) => setSelectedSharingMonth(e.target.value)}
                className={inputCls}
              >
                <option value="ALL">Semua Bulan Terdata</option>
                {availableSharingMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#5A6B75] mb-1">
                Filter Minggu (Week)
              </label>
              <select
                value={String(selectedSharingWeek)}
                onChange={(e) =>
                  setSelectedSharingWeek(
                    e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
                  )
                }
                className={inputCls}
              >
                <option value="ALL">Semua Minggu (Week 1 – 5)</option>
                <option value="1">Minggu Ke-1 (Week 1)</option>
                <option value="2">Minggu Ke-2 (Week 2)</option>
                <option value="3">Minggu Ke-3 (Week 3)</option>
                <option value="4">Minggu Ke-4 (Week 4)</option>
                <option value="5">Minggu Ke-5 (Week 5)</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <div className="px-3 py-2 rounded-[8px] bg-white border border-[#E2E8E8] text-xs flex items-center justify-between">
                <span className="text-[#5A6B75]">Total Terdata:</span>
                <span className="font-mono font-bold text-[#18232B]">
                  {recordedSharingPeriods.length} Periode Minggu • {allSharingRows.length} Baris Siswa
                </span>
              </div>
            </div>
          </div>

          {/* Riwayat Periode Mingguan & Bulanan yang Sudah Terdata (Klik untuk berpindah) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-mono font-semibold text-[#5A6B75] flex items-center gap-1 mr-1">
              <Layers className="w-3.5 h-3.5 text-[#E88932]" />
              <span>Periode Terdata:</span>
            </span>
            {recordedSharingPeriods.map((p) => {
              const isSelected =
                selectedSharingMonth === p.month_label && selectedSharingWeek === p.week_number;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => {
                    setSelectedSharingMonth(p.month_label);
                    setSelectedSharingWeek(p.week_number);
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#18232B] text-white shadow-2xs ring-1 ring-[#E88932]'
                      : 'bg-white border border-[#CBD5E1] text-[#18232B] hover:bg-[#F4F6F5]'
                  }`}
                >
                  <span>
                    {p.month_label} • Minggu {p.week_number}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected ? 'bg-[#E88932] text-[#18232B]' : 'bg-[#F4F6F5] text-[#5A6B75]'
                    }`}
                  >
                    {p.count}x
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setSelectedSharingMonth('ALL');
                setSelectedSharingWeek('ALL');
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold cursor-pointer ${
                selectedSharingMonth === 'ALL' && selectedSharingWeek === 'ALL'
                  ? 'bg-[#18232B] text-white'
                  : 'bg-white border border-[#CBD5E1] text-[#5A6B75] hover:bg-[#E2E8E8]'
              }`}
            >
              Lihat Semua ({allSharingRows.length})
            </button>
          </div>
        </div>

        <div className="p-4 overflow-x-auto space-y-4">
          <div className="rounded-[10px] border border-[#E2E8E8] overflow-hidden">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[#18232B] text-white">
                  <th
                    colSpan={canEdit ? 8 : 7}
                    className="bg-[#18232B] text-white font-heading font-bold text-xs sm:text-sm px-4 py-2.5 border-b border-[#263640] text-center uppercase tracking-wider"
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-[#E88932] mr-2 align-middle" />
                    {activeSharingBannerTitle}
                  </th>
                </tr>
                <tr className="bg-[#263640] text-slate-100 font-mono font-bold text-[10px] uppercase tracking-wider">
                  <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-center w-12">NO</th>
                  <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-center w-32">TANGGAL</th>
                  <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-center w-24">HARI</th>
                  <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-center w-28">WAKTU</th>
                  <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-left">NAMA</th>
                  <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-left w-44">JABATAN</th>
                  <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-center w-40">INSTRUKTUR</th>
                  {canEdit && (
                    <th className="px-3 py-2.5 text-center w-20">AKSI</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E8]">
                {sharingRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={canEdit ? 8 : 7}
                      className="p-8 text-center text-xs text-[#5A6B75]"
                    >
                      <div className="space-y-2">
                        <p>
                          Belum ada data jadwal Sharing Session untuk periode{' '}
                          <strong>
                            {selectedSharingWeek === 'ALL'
                              ? 'Semua Minggu'
                              : `Minggu ${selectedSharingWeek}`}{' '}
                            — {selectedSharingMonth}
                          </strong>
                          .
                        </p>
                        {canEdit && (
                          <div className="flex items-center justify-center gap-2 pt-1">
                            <Button
                              size="sm"
                              icon={<Copy className="w-3.5 h-3.5" />}
                              onClick={() => {
                                const targetMonth =
                                  selectedSharingMonth === 'ALL'
                                    ? 'Desember 2026'
                                    : selectedSharingMonth;
                                const targetWeek =
                                  selectedSharingWeek === 'ALL' ? 1 : selectedSharingWeek;
                                const mMeta =
                                  SHARING_MONTH_OPTIONS.find((m) => m.label === targetMonth) ||
                                  SHARING_MONTH_OPTIONS[0];
                                setGenerateModal({
                                  mode: 'NEXT_WEEK',
                                  targetMonthLabel: targetMonth,
                                  targetYear: mMeta.year,
                                  targetMonth: mMeta.month,
                                  targetWeekNumber: targetWeek,
                                  startDateIso: getNextConsecutiveDateIso(mMeta.year, mMeta.month),
                                  daysPattern: 4,
                                  batchLabel: 'BMC BATCH VII',
                                });
                              }}
                            >
                              Salin 17 Siswa dari Minggu Sebelumnya ke Periode Ini
                            </Button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  sharingRows.map((row, i) => {
                    const isGroupHead = !skipIndices.has(i);
                    const rowSpan = groupCounts.get(i) || 1;
                    return (
                      <tr key={row.id} className="even:bg-[#FAFBFB] odd:bg-white hover:bg-[#F4F6F5]/70 transition-colors">
                        <td className="px-2.5 py-2 border-r border-[#E2E8E8] text-center font-mono font-bold text-[#5A6B75]">
                          {i + 1}
                        </td>
                        {isGroupHead && (
                          <td
                            rowSpan={rowSpan}
                            className="px-3 py-2 border-r border-b border-[#E2E8E8] text-center font-mono font-bold text-[#18232B] align-middle bg-white"
                          >
                            <div>{row.tanggal}</div>
                            {(selectedSharingMonth === 'ALL' || selectedSharingWeek === 'ALL') && (
                              <div className="text-[10px] font-semibold text-[#C66B1A] mt-0.5">
                                Minggu {row.week_number || 1} • {row.month_label || 'November 2026'}
                              </div>
                            )}
                          </td>
                        )}
                        {isGroupHead && (
                          <td
                            rowSpan={rowSpan}
                            className="px-3 py-2 border-r border-b border-[#E2E8E8] text-center font-heading font-bold text-[#18232B] align-middle bg-white"
                          >
                            {row.hari}
                          </td>
                        )}
                        {isGroupHead && (
                          <td
                            rowSpan={rowSpan}
                            className="px-3 py-2 border-r border-b border-[#E2E8E8] text-center font-mono font-semibold text-[#263640] align-middle bg-white"
                          >
                            {row.waktu}
                          </td>
                        )}
                        <td className="px-3 py-2 border-r border-[#E2E8E8] font-semibold text-[#18232B]">
                          {row.nama}
                        </td>
                        <td className="px-3 py-2 border-r border-[#E2E8E8] text-[#263640]">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] bg-[#527FA1]/10 text-[#3D6585] font-mono font-semibold text-[11px]">
                            {row.jabatan}
                          </span>
                        </td>
                        {isGroupHead && (
                          <td
                            rowSpan={rowSpan}
                            className="px-3 py-2 border-r border-b border-[#E2E8E8] text-center font-semibold text-[#18232B] align-middle bg-white"
                          >
                            {row.instruktur}
                          </td>
                        )}
                        {canEdit && (
                          <td className="px-2 py-1.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setEditSharing({
                                    id: row.id,
                                    tanggal: row.tanggal,
                                    hari: row.hari,
                                    waktu: row.waktu,
                                    nama: row.nama,
                                    jabatan: row.jabatan,
                                    instruktur: row.instruktur,
                                    year: row.year || '2026',
                                    month: row.month || '11',
                                    month_label: row.month_label || 'November 2026',
                                    week_number: row.week_number || 1,
                                    week_label: row.week_label || 'Minggu 1 - November 2026',
                                    batch_label: row.batch_label || 'BMC BATCH VII',
                                    status: row.status || 'Done',
                                  })
                                }
                                className="p-1 rounded hover:bg-[#E88932]/15 text-[#C66B1A] cursor-pointer"
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!window.confirm(`Hapus jadwal "${row.nama}"?`)) return;
                                  try {
                                    mockStore.deleteSharingSessionScheduleRow(userId, row.id);
                                    onDone('Baris jadwal Sharing Session berhasil dihapus.');
                                  } catch (err: any) {
                                    onError(err.message);
                                  }
                                }}
                                className="p-1 rounded hover:bg-[#B94C45]/15 text-[#B94C45] cursor-pointer"
                                title="Hapus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Tabel Rekapitulasi Historis Sharing Session Per Bulan & Per Minggu */}
          <div className="rounded-[12px] border border-[#E2E8E8] bg-[#FAFBFB] p-3.5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-heading font-extrabold text-[#18232B] uppercase tracking-wide">
                  Rekapitulasi Data Sharing Session BMC Per Minggu & Bulan
                </h4>
                <p className="text-[11px] text-[#5A6B75]">
                  Setiap update mingguan dan bulan selanjutnya tercatat otomatis pada tabel riwayat di bawah ini
                </p>
              </div>
              {canEdit && (
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<Copy className="w-3.5 h-3.5" />}
                    onClick={openGenerateNextWeekModal}
                  >
                    + Update Minggu Selanjutnya
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<Calendar className="w-3.5 h-3.5" />}
                    onClick={openGenerateNextMonthModal}
                  >
                    + Tambah Bulan Selanjutnya
                  </Button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto rounded-[8px] border border-[#E2E8E8] bg-white">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#263640] text-white font-heading text-[11px] uppercase">
                    <th className="px-3 py-2 text-left">Bulan & Tahun</th>
                    <th className="px-3 py-2 text-left">Minggu Ke-</th>
                    <th className="px-3 py-2 text-left">Rentang Tanggal Pelaksanaan</th>
                    <th className="px-3 py-2 text-right">Jumlah Siswa</th>
                    <th className="px-3 py-2 text-left">Instruktur</th>
                    <th className="px-3 py-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8E8]">
                  {recordedSharingPeriods.map((p) => {
                    const isCurrent =
                      selectedSharingMonth === p.month_label &&
                      selectedSharingWeek === p.week_number;
                    return (
                      <tr
                        key={p.key}
                        className={isCurrent ? 'bg-[#E88932]/10 font-semibold' : 'hover:bg-[#F4F6F5]'}
                      >
                        <td className="px-3 py-2 font-semibold text-[#18232B]">{p.month_label}</td>
                        <td className="px-3 py-2 font-mono text-[#C66B1A] font-bold">
                          Minggu Ke-{p.week_number}
                        </td>
                        <td className="px-3 py-2 font-mono text-[#263640]">{p.dateRange}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-[#296050]">
                          {p.count} Siswa
                        </td>
                        <td className="px-3 py-2 text-[#263640]">{p.instruktur}</td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSharingMonth(p.month_label);
                                setSelectedSharingWeek(p.week_number);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-[#18232B] text-white text-[11px] font-semibold hover:bg-[#263640] cursor-pointer"
                            >
                              <span>Lihat Jadwal</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                            {canEdit &&
                              !(p.month_label === 'November 2026' && p.week_number === 1) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (
                                      !window.confirm(
                                        `Hapus seluruh jadwal Sharing Session untuk Minggu Ke-${p.week_number} (${p.month_label})?`
                                      )
                                    )
                                      return;
                                    try {
                                      mockStore.deleteSharingSessionPeriod(
                                        userId,
                                        p.month_label,
                                        p.week_number
                                      );
                                      setSelectedSharingMonth('November 2026');
                                      setSelectedSharingWeek(1);
                                      onDone(
                                        `Periode Minggu Ke-${p.week_number} (${p.month_label}) berhasil dihapus.`
                                      );
                                    } catch (err: any) {
                                      onError(err.message);
                                    }
                                  }}
                                  className="p-1.5 rounded-[6px] border border-[#B94C45]/30 text-[#B94C45] hover:bg-[#B94C45]/10 cursor-pointer"
                                  title="Hapus Periode Minggu Ini"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Generate / Update Minggu Selanjutnya atau Bulan Selanjutnya */}
      <Modal
        open={!!generateModal}
        title={
          generateModal?.mode === 'NEXT_MONTH'
            ? 'Tambah Jadwal Sharing Session untuk Bulan Selanjutnya'
            : 'Update Jadwal Sharing Session untuk Minggu Selanjutnya'
        }
        onClose={() => setGenerateModal(null)}
      >
        {generateModal && (() => {
          // Hitung preview rentang tanggal yang akan dibuat
          const [y, m, d] = generateModal.startDateIso.split('-').map(Number);
          const startDt = y && m && d ? new Date(y, m - 1, d) : new Date(2026, 10, 2);
          const previewDates = Array.from({ length: generateModal.daysPattern }, (_, idx) => {
            const dt = new Date(startDt.getFullYear(), startDt.getMonth(), startDt.getDate() + idx);
            return mockStore.formatIndoDateLabel(dt);
          });
          return (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                try {
                  const srcMonth =
                    selectedSharingMonth === 'ALL' ? 'November 2026' : selectedSharingMonth;
                  const srcWeek = selectedSharingWeek === 'ALL' ? 1 : selectedSharingWeek;
                  mockStore.generateSharingSessionPeriod(userId, {
                    sourceMonthLabel: srcMonth,
                    sourceWeekNumber: srcWeek,
                    targetYear: generateModal.targetYear,
                    targetMonth: generateModal.targetMonth,
                    targetMonthLabel: generateModal.targetMonthLabel,
                    targetWeekNumber: generateModal.targetWeekNumber,
                    startDateIso: generateModal.startDateIso,
                    daysPattern: generateModal.daysPattern,
                    batchLabel: generateModal.batchLabel,
                  });
                  setSelectedSharingMonth(generateModal.targetMonthLabel);
                  setSelectedSharingWeek(generateModal.targetWeekNumber);
                  setGenerateModal(null);
                  onDone(
                    `Jadwal Sharing Session untuk Minggu ${generateModal.targetWeekNumber} — ${generateModal.targetMonthLabel} berhasil dibuat dan terdata.`
                  );
                } catch (err: any) {
                  onError(err.message);
                }
              }}
              className="grid grid-cols-2 gap-3"
            >
              <div className="col-span-2 p-3 rounded-[10px] bg-[#FAF3DD] border border-[#EAB308]/40 text-xs text-[#18232B] space-y-1.5">
                <div>
                  Fitur ini menyalin <strong>17 Siswa BMC Batch VII</strong> ke{' '}
                  <strong>
                    Minggu Ke-{generateModal.targetWeekNumber} • {generateModal.targetMonthLabel}
                  </strong>{' '}
                  secara berurutan tanpa melompati tanggal:
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {previewDates.map((pd, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-white border border-[#CBD5E1] font-mono font-bold text-[11px] text-[#833C0C]"
                    >
                      {pd.tanggal} ({pd.hari})
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Pilih Bulan Tujuan *</label>
                <select
                  className={inputCls}
                  value={generateModal.targetMonthLabel}
                  onChange={(e) => {
                    const found =
                      SHARING_MONTH_OPTIONS.find((m) => m.label === e.target.value) ||
                      SHARING_MONTH_OPTIONS[0];
                    setGenerateModal({
                      ...generateModal,
                      targetMonthLabel: found.label,
                      targetYear: found.year,
                      targetMonth: found.month,
                    });
                  }}
                >
                  {SHARING_MONTH_OPTIONS.map((m) => (
                    <option key={m.label} value={m.label}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Minggu Ke- (Week) *</label>
                <select
                  className={inputCls}
                  value={generateModal.targetWeekNumber}
                  onChange={(e) =>
                    setGenerateModal({
                      ...generateModal,
                      targetWeekNumber: Number(e.target.value),
                    })
                  }
                >
                  <option value={1}>Minggu Ke-1 (Week 1)</option>
                  <option value={2}>Minggu Ke-2 (Week 2)</option>
                  <option value={3}>Minggu Ke-3 (Week 3)</option>
                  <option value={4}>Minggu Ke-4 (Week 4)</option>
                  <option value={5}>Minggu Ke-5 (Week 5)</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Tanggal Mulai Minggu Baru *</label>
                <input
                  type="date"
                  required
                  className={inputCls}
                  value={generateModal.startDateIso}
                  onChange={(e) =>
                    setGenerateModal({ ...generateModal, startDateIso: e.target.value })
                  }
                />
                <span className="text-[10px] text-[#5A6B75]">
                  Otomatis melanjutkan H+1 setelah tanggal terakhir periode sebelumnya (misal: 02 NOV 2026)
                </span>
              </div>

              <div>
                <label className={labelCls}>Jumlah Hari Pelaksanaan</label>
                <select
                  className={inputCls}
                  value={generateModal.daysPattern}
                  onChange={(e) =>
                    setGenerateModal({
                      ...generateModal,
                      daysPattern: Number(e.target.value) as 4 | 7,
                    })
                  }
                >
                  <option value={4}>4 Hari Berurutan (5 + 4 + 4 + 4 Siswa)</option>
                  <option value={7}>7 Hari Penuh Seminggu (Senin s/d Minggu)</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className={labelCls}>Batch BMC</label>
                <input
                  className={inputCls}
                  value={generateModal.batchLabel}
                  onChange={(e) =>
                    setGenerateModal({ ...generateModal, batchLabel: e.target.value })
                  }
                />
              </div>

              <div className="col-span-2 flex justify-end gap-2 pt-2 border-t border-[#E2E8E8]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setGenerateModal(null)}
                >
                  Batal
                </Button>
                <Button type="submit" size="sm" icon={<Save className="w-3.5 h-3.5" />}>
                  Simpan & Buat Periode Baru
                </Button>
              </div>
            </form>
          );
        })()}
      </Modal>

      {/* Modal Tambah / Edit Blok Jadwal Plan Bulanan */}
      <Modal
        open={!!editBar}
        title={editBar?.id ? 'Edit Blok Jadwal Plan Training' : 'Tambah Blok Jadwal Plan Training'}
        onClose={() => setEditBar(null)}
      >
        {editBar && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              try {
                mockStore.saveMonthlyPlanBar(userId, editBar);
                setEditBar(null);
                onDone('Jadwal Plan Training Technical berhasil disimpan.');
              } catch (err: any) {
                onError(err.message);
              }
            }}
            className="grid grid-cols-2 gap-3"
          >
            <div>
              <label className={labelCls}>Bulan</label>
              <select
                className={inputCls}
                value={editBar.month_label}
                onChange={(e) => setEditBar({ ...editBar, month_label: e.target.value })}
              >
                {PLAN_MONTH_SEQUENCE.map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.full} ({m.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Baris (Kategori / Trainer)</label>
              <select
                className={inputCls}
                value={editBar.row_key}
                onChange={(e) =>
                  setEditBar({
                    ...editBar,
                    row_key: e.target.value as TechnicalTrainingPlanBar['row_key'],
                  })
                }
              >
                {ROW_CONFIG.map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.label} {r.subLabel ? `(${r.subLabel})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Dari Tanggal (1–31)</label>
              <input
                type="number"
                min={1}
                max={31}
                className={inputCls}
                value={editBar.start_day}
                onChange={(e) => setEditBar({ ...editBar, start_day: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className={labelCls}>Sampai Tanggal (1–31)</label>
              <input
                type="number"
                min={editBar.start_day}
                max={31}
                className={inputCls}
                value={editBar.end_day}
                onChange={(e) => setEditBar({ ...editBar, end_day: Number(e.target.value) })}
              />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Nama Materi / Kegiatan *</label>
              <input
                required
                placeholder="Contoh: Clutch& Transmission / Obs.OJT / Site Genba"
                className={inputCls}
                value={editBar.title}
                onChange={(e) => setEditBar({ ...editBar, title: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Pilihan Warna Blok</label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() =>
                      setEditBar({ ...editBar, bg_color: p.bg, text_color: p.text })
                    }
                    style={{ backgroundColor: p.bg, color: p.text }}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold border cursor-pointer ${
                      editBar.bg_color === p.bg ? 'ring-2 ring-[#E88932] border-black' : 'border-slate-400'
                    }`}
                  >
                    {p.label.split(' (')[0]}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-2 flex items-center justify-between pt-2 border-t border-[#E2E8E8]">
              {editBar.id ? (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                  onClick={() => {
                    if (!window.confirm(`Hapus blok "${editBar.title}"?`)) return;
                    mockStore.deleteMonthlyPlanBar(userId, editBar.id!);
                    setEditBar(null);
                    onDone('Blok jadwal berhasil dihapus.');
                  }}
                >
                  Hapus Blok
                </Button>
              ) : (
                <div />
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditBar(null)}>
                  Batal
                </Button>
                <Button type="submit" size="sm" icon={<Save className="w-3.5 h-3.5" />}>
                  Simpan
                </Button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal Tambah / Edit Baris Jadwal Sharing Session BMC Batch VII */}
      <Modal
        open={!!editSharing}
        title={
          editSharing?.id
            ? 'Edit Jadwal Sharing Session BMC Batch VII'
            : 'Tambah Jadwal Sharing Session BMC Batch VII'
        }
        onClose={() => setEditSharing(null)}
      >
        {editSharing && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              try {
                mockStore.saveSharingSessionScheduleRow(userId, editSharing);
                setEditSharing(null);
                onDone('Jadwal Sharing Session BMC Batch VII berhasil disimpan.');
              } catch (err: any) {
                onError(err.message);
              }
            }}
            className="grid grid-cols-2 gap-3"
          >
            <div>
              <label className={labelCls}>Periode Bulan *</label>
              <select
                className={inputCls}
                value={editSharing.month_label}
                onChange={(e) => {
                  const found =
                    SHARING_MONTH_OPTIONS.find((m) => m.label === e.target.value) ||
                    SHARING_MONTH_OPTIONS[0];
                  setEditSharing({
                    ...editSharing,
                    month_label: found.label,
                    year: found.year,
                    month: found.month,
                    week_label: `Minggu ${editSharing.week_number} - ${found.label}`,
                  });
                }}
              >
                {SHARING_MONTH_OPTIONS.map((m) => (
                  <option key={m.label} value={m.label}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Minggu Ke- (Week) *</label>
              <select
                className={inputCls}
                value={editSharing.week_number}
                onChange={(e) => {
                  const w = Number(e.target.value);
                  setEditSharing({
                    ...editSharing,
                    week_number: w,
                    week_label: `Minggu ${w} - ${editSharing.month_label}`,
                  });
                }}
              >
                <option value={1}>Minggu Ke-1 (Week 1)</option>
                <option value={2}>Minggu Ke-2 (Week 2)</option>
                <option value={3}>Minggu Ke-3 (Week 3)</option>
                <option value={4}>Minggu Ke-4 (Week 4)</option>
                <option value={5}>Minggu Ke-5 (Week 5)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Tanggal *</label>
              <input
                required
                placeholder="29 OKT 2026"
                className={inputCls}
                value={editSharing.tanggal}
                onChange={(e) => setEditSharing({ ...editSharing, tanggal: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Hari *</label>
              <input
                required
                placeholder="KAMIS"
                className={inputCls}
                value={editSharing.hari}
                onChange={(e) => setEditSharing({ ...editSharing, hari: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Waktu *</label>
              <input
                required
                placeholder="08.00-17.00"
                className={inputCls}
                value={editSharing.waktu}
                onChange={(e) => setEditSharing({ ...editSharing, waktu: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Instruktur *</label>
              <input
                required
                placeholder="Bpk. Andi Risal"
                className={inputCls}
                value={editSharing.instruktur}
                onChange={(e) => setEditSharing({ ...editSharing, instruktur: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Nama Siswa *</label>
              <input
                required
                placeholder="Nama lengkap siswa BMC"
                className={inputCls}
                value={editSharing.nama}
                onChange={(e) => setEditSharing({ ...editSharing, nama: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Jabatan *</label>
              <input
                required
                placeholder="OJT Mekanik DT / OJT Elektrik / OJT Tyreman"
                className={inputCls}
                value={editSharing.jabatan}
                onChange={(e) => setEditSharing({ ...editSharing, jabatan: e.target.value })}
              />
            </div>
            <div className="col-span-2 flex justify-end gap-2 pt-2 border-t border-[#E2E8E8]">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditSharing(null)}>
                Batal
              </Button>
              <Button type="submit" size="sm" icon={<Save className="w-3.5 h-3.5" />}>
                Simpan
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
