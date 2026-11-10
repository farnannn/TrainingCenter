import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { mockStore } from '../../../lib/mockStore';
import { uploadPhotoToCloud } from '../../../lib/supabase';
import { INITIAL_SKILL_AUDIT_PHOTOS } from '../../../lib/skillAuditSeedData';
import {
  SkillAuditCategoryCode,
  SkillAuditOperatorRecord,
  SkillAuditHeavyEquipmentSummaryRow,
  getRolePermissions,
} from '../../../lib/types';
import { Button } from '../../ui/Button';
import {
  Plus,
  Edit3,
  Trash2,
  Download,
  Printer,
  Search,
  Save,
  Upload,
  X,
  ZoomIn,
  ShieldCheck,
  Truck,
  HardHat,
  Layers,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Lock,
  RefreshCw,
  RotateCcw,
  BarChart3,
  PieChart as PieChartIcon,
  Users,
  Filter,
  ArrowUpRight,
  MapPin,
} from 'lucide-react';
import {
  operationTrainerStore,
  createInitialOperationTrainerState,
  TRAINING_SITE_OPTIONS,
  TrainingSiteName,
  normalizeSiteName,
} from '../../../lib/operationTrainerSeedData';
import {
  Modal,
  DonutChart,
  GroupedBarChart,
  exportCsv,
  printTable,
  inputCls,
  labelCls,
} from './shared';
import type { SectionProps } from './SectionsAB';

type ActiveSubTab = 'ADT' | 'EXCAVATOR' | 'DOSER' | 'DRIVER_DT' | 'SUMMARY' | 'ALL_UNITS';

const CATEGORY_META: Record<
  SkillAuditCategoryCode,
  {
    code: SkillAuditCategoryCode;
    shortTitle: string;
    slideTitle: string;
    reportTitle: string;
    chartBoxTitle: string;
    periodLabel: string;
    defaultPosisi: string;
    defaultInstructor: string;
    unitOptions: string[];
    badgeBg: string;
    badgeText: string;
    accentColor: string;
    gradientCard: string;
  }
> = {
  ADT: {
    code: 'ADT',
    shortTitle: 'Operator ADT',
    slideTitle: 'Data Refresh Operator ADT Setelah Skill Audit Program',
    reportTitle: 'Report Refresh Training Operator ADT Setelah Skill Audit',
    chartBoxTitle: 'Refresh ADT Operator Setelah Skill Audit',
    periodLabel: 'September - October 2026',
    defaultPosisi: 'Operator',
    defaultInstructor: 'Ekiopas Awang',
    unitOptions: ['Komatsu HM400', 'Volvo A40G'],
    badgeBg: 'bg-[#E88932]/12 border-[#E88932]/30',
    badgeText: 'text-[#C66B1A]',
    accentColor: '#E88932',
    gradientCard: 'from-[#E88932]/10 via-white to-white',
  },
  EXCAVATOR: {
    code: 'EXCAVATOR',
    shortTitle: 'Operator Excavator',
    slideTitle: 'Data Refresh Operator Excavator Setelah Skill Audit Program',
    reportTitle: 'Report Refresh Digger Operator Tangofa',
    chartBoxTitle: 'Program Refresh Digger Operator',
    periodLabel: 'October - November 2026',
    defaultPosisi: 'Operator',
    defaultInstructor: 'Catur Ani',
    unitOptions: ['Excavator 50T', 'Excavator 30T', 'Excavator 320T'],
    badgeBg: 'bg-[#527FA1]/12 border-[#527FA1]/30',
    badgeText: 'text-[#3D6585]',
    accentColor: '#527FA1',
    gradientCard: 'from-[#527FA1]/10 via-white to-white',
  },
  DOSER: {
    code: 'DOSER',
    shortTitle: 'Operator Doser',
    slideTitle: 'Data Refresh Operator Doser Setelah Skill Audit Program',
    reportTitle: 'Report Refresh Doser Operator Tangofa',
    chartBoxTitle: 'Program Refresh Doser Operator',
    periodLabel: 'October - November 2026',
    defaultPosisi: 'Operator',
    defaultInstructor: 'Catur Ani',
    unitOptions: ['Doser D85SS', 'Doser D65'],
    badgeBg: 'bg-[#397C69]/12 border-[#397C69]/30',
    badgeText: 'text-[#296050]',
    accentColor: '#397C69',
    gradientCard: 'from-[#397C69]/10 via-white to-white',
  },
  DRIVER_DT: {
    code: 'DRIVER_DT',
    shortTitle: 'Driver DT Hauling',
    slideTitle: 'Refresh Procedure Emergency Crew Driver DT Hauling di Tangofa',
    reportTitle: 'Report Observasi Skill Drive & Procedure Emergency Driver DT',
    chartBoxTitle: 'Observasi Skill & Procedure Emergency Driver DT',
    periodLabel: 'September - November 2026',
    defaultPosisi: 'Driver',
    defaultInstructor: 'Fiktor',
    unitOptions: ['Domfeng', 'Hongyan'],
    badgeBg: 'bg-[#D5A33D]/15 border-[#D5A33D]/35',
    badgeText: 'text-[#8A6A1F]',
    accentColor: '#D5A33D',
    gradientCard: 'from-[#D5A33D]/12 via-white to-white',
  },
};

// Compress uploaded image into lightweight JPEG data URL
const compressImageFile = (file: File, maxWidth = 720, quality = 0.8): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(ev.target?.result || ''));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = String(ev.target?.result || '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// Interactive Gold/Ochre Pie Chart matching the RAJA Slide style + Click-to-Filter
const SlidePieChart: React.FC<{
  segments: { label: string; filterKey: string; value: number; color: string }[];
  selectedFilter: string;
  onSelectFilter: (filterKey: string) => void;
}> = ({ segments, selectedFilter, onSelectFilter }) => {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let accAngle = -Math.PI / 2;

  const paths = segments.map((seg, idx) => {
    const frac = seg.value / total;
    const startAngle = accAngle;
    const endAngle = accAngle + frac * Math.PI * 2;
    accAngle = endAngle;

    const isSelected = selectedFilter !== 'ALL' && selectedFilter === seg.filterKey;
    const r = isSelected ? 87 : 82;
    const cx = 110;
    const cy = 102;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = frac > 0.5 ? 1 : 0;

    const midAngle = (startAngle + endAngle) / 2;
    const labelR = r * 0.56;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);
    const pct = Math.round(frac * 100);

    const d =
      frac >= 0.999
        ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
        : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return { d, seg, lx, ly, pct, idx, isSelected };
  });

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <svg viewBox="0 0 220 204" className="w-full max-w-[215px] mx-auto select-none drop-shadow-xs">
        {paths.map(({ d, seg, lx, ly, pct, idx, isSelected }) => (
          <g
            key={idx}
            onClick={() =>
              onSelectFilter(selectedFilter === seg.filterKey ? 'ALL' : seg.filterKey)
            }
            className="cursor-pointer transition-transform hover:opacity-90"
          >
            <path
              d={d}
              fill={seg.color}
              stroke={isSelected ? '#18232B' : '#FFFFFF'}
              strokeWidth={isSelected ? 2.5 : 1.5}
            >
              <title>{`${seg.label}: ${seg.value} peserta (${pct}%) — Klik untuk filter tabel`}</title>
            </path>
            {pct > 6 && (
              <text
                x={lx}
                y={ly - 4}
                textAnchor="middle"
                className="fill-[#18232B] font-heading font-extrabold text-[9.5px] pointer-events-none"
              >
                {seg.label}
              </text>
            )}
            {pct > 6 && (
              <text
                x={lx}
                y={ly + 10}
                textAnchor="middle"
                className="fill-[#18232B] font-mono font-extrabold text-[11px] pointer-events-none"
              >
                {seg.value} ({pct}%)
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

export const SkillAuditRefreshOperatorSection: React.FC<SectionProps> = ({
  canEdit,
  userId,
  onDone,
  onError,
}) => {
  const [genbaTick, setGenbaTick] = useState(0);
  const mod = mockStore.technicalTrainingModule;
  const rawOperators = mod.skillAuditOperatorRecords || [];
  const opTrainerState = operationTrainerStore.getState();
  const summaryRows = mod.skillAuditSummaryRows || [];
  const photoMap = mod.skillAuditPhotos || {};

  useEffect(() => {
    const unsubMock = mockStore.subscribe(() => setGenbaTick((t) => t + 1));
    const unsubOp = operationTrainerStore.subscribe(() => setGenbaTick((t) => t + 1));
    return () => {
      unsubMock();
      unsubOp();
    };
  }, []);

  const [activeTab, setActiveTab] = useState<ActiveSubTab>('ADT');
  const [siteFilter, setSiteFilter] = useState<'ALL' | TrainingSiteName>('ALL');

  const combinedRawOperators = useMemo(() => {
    const tangofaMapped = rawOperators.map((r) => ({
      ...r,
      site: normalizeSiteName(
        (r as SkillAuditOperatorRecord & { site?: TrainingSiteName }).site,
        'Tangofa'
      ) as TrainingSiteName,
      _fromGenbaClass: false,
    }));
    const gembaMapped = (opTrainerState.genbaClassRecords || []).map((g, idx) => ({
      id: g.id,
      no: idx + 1,
      category: 'DRIVER_DT' as SkillAuditCategoryCode,
      tanggal: g.tanggal,
      nama: g.nama,
      posisi: g.posisi,
      jenis_unit: g.unit === 'MH' ? 'Manhaul (Genba)' : 'DT (Genba)',
      keterangan: g.activitas,
      provider: g.provider || 'TC',
      program: 'Refresh Class',
      instructor: g.instructor || 'Yusran yusuf',
      period_label: 'Juli - Oktober 2026',
      updated_at: '2026-11-04T00:00:00Z',
      site: normalizeSiteName(g.site, 'Genba') as TrainingSiteName,
      _fromGenbaClass: true,
    }));
    return [...tangofaMapped, ...gembaMapped];
  }, [rawOperators, opTrainerState.genbaClassRecords]);

  const allOperators = useMemo(
    () =>
      combinedRawOperators.filter((r) => siteFilter === 'ALL' || r.site === siteFilter),
    [combinedRawOperators, siteFilter]
  );

  // Auto-switch to DRIVER_DT when selecting Site Genba if current category has 0 records
  useEffect(() => {
    if (
      siteFilter === 'Genba' &&
      (activeTab === 'ADT' || activeTab === 'EXCAVATOR' || activeTab === 'DOSER')
    ) {
      setActiveTab('DRIVER_DT');
      setUnitFilter('ALL');
      setInstructorFilter('ALL');
    }
  }, [siteFilter, activeTab]);

  const [search, setSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState('ALL');
  const [instructorFilter, setInstructorFilter] = useState('ALL');
  const [categoryFilterInAll, setCategoryFilterInAll] = useState<SkillAuditCategoryCode | 'ALL'>('ALL');
  // Toggle whether Summary Heavy Equipment uses live actual counts from operator tables
  const [liveSyncSummary, setLiveSyncSummary] = useState<boolean>(true);
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; caption: string } | null>(null);
  const [, setForcePhotoTick] = useState(0);

  // Auto-restore Driver DT Hauling default photos if accidentally deleted
  useEffect(() => {
    if (!mockStore.technicalTrainingModule.skillAuditPhotos) {
      mockStore.technicalTrainingModule.skillAuditPhotos = JSON.parse(
        JSON.stringify(INITIAL_SKILL_AUDIT_PHOTOS)
      );
      mockStore.persistState();
      setForcePhotoTick((t) => t + 1);
      return;
    }

    let restored = false;
    Object.keys(INITIAL_SKILL_AUDIT_PHOTOS).forEach((catKey) => {
      const defaults = INITIAL_SKILL_AUDIT_PHOTOS[catKey] || [];
      const current = mockStore.technicalTrainingModule.skillAuditPhotos[catKey] || [];
      const missingDefaults = defaults.filter((d) => !current.includes(d));
      if (current.length === 0 || (catKey === 'DRIVER_DT' && missingDefaults.length > 0)) {
        mockStore.technicalTrainingModule.skillAuditPhotos[catKey] = [
          ...defaults,
          ...current.filter((u) => !defaults.includes(u)),
        ];
        restored = true;
      }
    });

    if (restored) {
      mockStore.persistState();
      setForcePhotoTick((t) => t + 1);
    }
  }, []);

  const [editOp, setEditOp] = useState<{
    id?: string;
    site?: TrainingSiteName;
    _fromGenbaClass?: boolean;
    category: SkillAuditCategoryCode;
    tanggal: string;
    nama: string;
    posisi: string;
    jenis_unit: string;
    keterangan: string;
    provider: string;
    program: string;
    instructor: string;
    period_label: string;
  } | null>(null);

  const [editSummary, setEditSummary] = useState<{
    id?: string;
    jabatan: string;
    close_count: number;
    open_count: number;
  } | null>(null);

  // Live actual counts per category directly from `skillAuditOperatorRecords`
  const adtList = useMemo(() => allOperators.filter((r) => r.category === 'ADT'), [allOperators]);
  const excList = useMemo(() => allOperators.filter((r) => r.category === 'EXCAVATOR'), [allOperators]);
  const doserList = useMemo(() => allOperators.filter((r) => r.category === 'DOSER'), [allOperators]);
  const dtList = useMemo(() => allOperators.filter((r) => r.category === 'DRIVER_DT'), [allOperators]);

  // Dynamic Unit Breakdown calculated 100% from actual records (supports both slide grouping + custom units)
  const getCategoryUnitBreakdown = (
    cat: SkillAuditCategoryCode,
    sourceList?: SkillAuditOperatorRecord[]
  ): { label: string; filterKey: string; value: number; color: string }[] => {
    const items = (sourceList || allOperators).filter((r) => r.category === cat);
    const palette = ['#E88932', '#F3C77E', '#527FA1', '#397C69', '#D5A33D', '#94A3B8'];

    if (cat === 'ADT') {
      const hm400 = items.filter((r) => r.jenis_unit.toLowerCase().includes('hm400')).length;
      const a40g = items.filter((r) => r.jenis_unit.toLowerCase().includes('a40g')).length;
      const others = items.filter(
        (r) =>
          !r.jenis_unit.toLowerCase().includes('hm400') &&
          !r.jenis_unit.toLowerCase().includes('a40g')
      );
      const rows = [
        { label: 'Komatsu HM400', filterKey: 'Komatsu HM400', value: hm400, color: '#E88932' },
        { label: 'Volvo A40G', filterKey: 'Volvo A40G', value: a40g, color: '#F3C77E' },
      ];
      const otherUnits = Array.from(new Set(others.map((o) => o.jenis_unit)));
      otherUnits.forEach((u, idx) => {
        rows.push({
          label: u,
          filterKey: u,
          value: others.filter((o) => o.jenis_unit === u).length,
          color: palette[(idx + 2) % palette.length],
        });
      });
      return rows;
    }

    if (cat === 'EXCAVATOR') {
      const exc50 = items.filter((r) => r.jenis_unit.includes('50T')).length;
      const exc30And320 = items.filter(
        (r) => r.jenis_unit.includes('30T') || r.jenis_unit.includes('320T')
      ).length;
      const others = items.filter(
        (r) =>
          !r.jenis_unit.includes('50T') &&
          !r.jenis_unit.includes('30T') &&
          !r.jenis_unit.includes('320T')
      );
      const rows = [
        { label: 'Excavator 50T', filterKey: 'Excavator 50T', value: exc50, color: '#E88932' },
        {
          label: 'Excavator 30T / 320T',
          filterKey: 'GROUP_EXC_30_320',
          value: exc30And320,
          color: '#F3C77E',
        },
      ];
      const otherUnits = Array.from(new Set(others.map((o) => o.jenis_unit)));
      otherUnits.forEach((u, idx) => {
        rows.push({
          label: u,
          filterKey: u,
          value: others.filter((o) => o.jenis_unit === u).length,
          color: palette[(idx + 2) % palette.length],
        });
      });
      return rows;
    }

    if (cat === 'DOSER') {
      const d85 = items.filter((r) => r.jenis_unit.includes('D85')).length;
      const d65 = items.filter((r) => r.jenis_unit.includes('D65')).length;
      const others = items.filter(
        (r) => !r.jenis_unit.includes('D85') && !r.jenis_unit.includes('D65')
      );
      const rows = [
        { label: 'Doser D85SS', filterKey: 'Doser D85SS', value: d85, color: '#E88932' },
        { label: 'Doser D65', filterKey: 'Doser D65', value: d65, color: '#F3C77E' },
      ];
      const otherUnits = Array.from(new Set(others.map((o) => o.jenis_unit)));
      otherUnits.forEach((u, idx) => {
        rows.push({
          label: u,
          filterKey: u,
          value: others.filter((o) => o.jenis_unit === u).length,
          color: palette[(idx + 2) % palette.length],
        });
      });
      return rows;
    }

    const domfeng = items.filter((r) => r.jenis_unit.toLowerCase().includes('domfeng')).length;
    const hongyan = items.filter((r) => r.jenis_unit.toLowerCase().includes('hongyan')).length;
    const others = items.filter(
      (r) =>
        !r.jenis_unit.toLowerCase().includes('domfeng') &&
        !r.jenis_unit.toLowerCase().includes('hongyan')
    );
    const rows: { label: string; filterKey: string; value: number; color: string }[] = [];
    if (domfeng > 0 || siteFilter === 'ALL' || siteFilter === 'Tangofa') {
      rows.push({ label: 'Domfeng', filterKey: 'Domfeng', value: domfeng, color: '#E88932' });
    }
    if (hongyan > 0 || siteFilter === 'ALL' || siteFilter === 'Tangofa') {
      rows.push({ label: 'Hongyan', filterKey: 'Hongyan', value: hongyan, color: '#F3C77E' });
    }
    const otherUnits = Array.from(new Set(others.map((o) => o.jenis_unit)));
    otherUnits.forEach((u, idx) => {
      rows.push({
        label: u,
        filterKey: u,
        value: others.filter((o) => o.jenis_unit === u).length,
        color: palette[(idx + (rows.length > 0 ? 2 : 0)) % palette.length],
      });
    });
    return rows;
  };

  // Upload photo for active category (supports Site Genba on DRIVER_DT)
  const handleUploadCategoryPhoto = async (
    catKey: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    try {
      const compressedUrls = await Promise.all(files.map((f) => compressImageFile(f)));
      const cloudUrls = await Promise.all(
        compressedUrls.map((u) =>
          uploadPhotoToCloud(
            u,
            catKey === 'DRIVER_DT' && siteFilter === 'Genba'
              ? 'skill-audit-genba'
              : `skill-audit-${catKey.toLowerCase()}`
          )
        )
      );
      if (catKey === 'DRIVER_DT' && siteFilter === 'Genba') {
        operationTrainerStore.updateState((prev) => ({
          ...prev,
          genbaClassPhotos: [...cloudUrls, ...(prev.genbaClassPhotos || [])],
        }));
        setForcePhotoTick((t) => t + 1);
      } else {
        const current = photoMap[catKey] || [];
        mockStore.saveSkillAuditPhotos(userId, catKey, [...cloudUrls, ...current]);
        setForcePhotoTick((t) => t + 1);
      }
      onDone('Foto dokumentasi berhasil diunggah dan disinkronkan secara real-time.');
    } catch {
      onError('Gagal mengunggah foto dokumentasi.');
    }
    e.target.value = '';
  };

  const handleRemoveCategoryPhoto = (catKey: string, idx: number) => {
    if (catKey === 'DRIVER_DT' && siteFilter === 'Genba') {
      const removedUrl = (opTrainerState.genbaClassPhotos || [])[idx];
      operationTrainerStore.updateState(
        (prev) => ({
          ...prev,
          genbaClassPhotos: (prev.genbaClassPhotos || []).filter((_, i) => i !== idx),
        }),
        { deletedPhotoUrl: removedUrl }
      );
      setForcePhotoTick((t) => t + 1);
      onDone('Foto dokumentasi berhasil dihapus.');
      return;
    }

    const current = photoMap[catKey] || [];
    if (catKey === 'DRIVER_DT' && siteFilter === 'ALL' && idx >= current.length) {
      const gembaIdx = idx - current.length;
      const removedUrl = (opTrainerState.genbaClassPhotos || [])[gembaIdx];
      operationTrainerStore.updateState(
        (prev) => ({
          ...prev,
          genbaClassPhotos: (prev.genbaClassPhotos || []).filter((_, i) => i !== gembaIdx),
        }),
        { deletedPhotoUrl: removedUrl }
      );
      setForcePhotoTick((t) => t + 1);
      onDone('Foto dokumentasi berhasil dihapus.');
      return;
    }

    const removedUrl = current[idx];
    mockStore.saveSkillAuditPhotos(
      userId,
      catKey,
      current.filter((_, i) => i !== idx),
      removedUrl
    );
    setForcePhotoTick((t) => t + 1);
    onDone('Foto dokumentasi berhasil dihapus.');
  };

  const handleResetCategoryPhotos = (catKey: string, label: string) => {
    if (catKey === 'DRIVER_DT' && siteFilter === 'Genba') {
      const defaults = createInitialOperationTrainerState();
      operationTrainerStore.updateState(
        (prev) => ({
          ...prev,
          genbaClassPhotos: defaults.genbaClassPhotos,
        }),
        { resetPhotoKey: 'OP_genbaClassPhotos' }
      );
    } else if (catKey === 'DRIVER_DT' && siteFilter === 'ALL') {
      mockStore.restoreDefaultSkillAuditPhotos(userId, catKey);
      const defaults = createInitialOperationTrainerState();
      operationTrainerStore.updateState(
        (prev) => ({
          ...prev,
          genbaClassPhotos: defaults.genbaClassPhotos,
        }),
        { resetPhotoKey: 'OP_genbaClassPhotos' }
      );
    } else {
      mockStore.restoreDefaultSkillAuditPhotos(userId, catKey);
    }
    setForcePhotoTick((t) => t + 1);
    onDone(`Foto dokumentasi default ${label} berhasil dikembalikan.`);
  };

  // Switch tab and reset unit/instructor filters
  const switchCategoryTab = (tab: ActiveSubTab) => {
    setActiveTab(tab);
    setUnitFilter('ALL');
    setInstructorFilter('ALL');
    setCategoryFilterInAll('ALL');
    setSearch('');
  };

  // Filtered operator records for current tab
  const currentCategoryRecords = useMemo(() => {
    if (
      activeTab === 'ADT' ||
      activeTab === 'EXCAVATOR' ||
      activeTab === 'DOSER' ||
      activeTab === 'DRIVER_DT'
    ) {
      return allOperators.filter((r) => r.category === activeTab);
    }
    if (activeTab === 'ALL_UNITS' && categoryFilterInAll !== 'ALL') {
      return allOperators.filter((r) => r.category === categoryFilterInAll);
    }
    return allOperators;
  }, [activeTab, allOperators, categoryFilterInAll]);

  const availableUnitsInTab = useMemo(
    () => Array.from(new Set(currentCategoryRecords.map((r) => r.jenis_unit))),
    [currentCategoryRecords]
  );
  const availableInstructorsInTab = useMemo(
    () => Array.from(new Set(currentCategoryRecords.map((r) => r.instructor))),
    [currentCategoryRecords]
  );

  // Records filtered by Search + Instructor (used to dynamically update Unit Chart when searching/filtering by instructor)
  const recordsMatchingSearchAndInst = useMemo(() => {
    const q = search.toLowerCase();
    return currentCategoryRecords.filter((r) => {
      const matchQ =
        !q ||
        (r.nama + r.tanggal + r.jenis_unit + r.instructor + r.posisi).toLowerCase().includes(q);
      const matchInst = instructorFilter === 'ALL' || r.instructor === instructorFilter;
      return matchQ && matchInst;
    });
  }, [currentCategoryRecords, search, instructorFilter]);

  const filteredRecords = useMemo(() => {
    return recordsMatchingSearchAndInst.filter((r) => {
      if (unitFilter === 'ALL') return true;
      if (unitFilter === 'GROUP_EXC_30_320') {
        return r.jenis_unit.includes('30T') || r.jenis_unit.includes('320T');
      }
      return r.jenis_unit === unitFilter;
    });
  }, [recordsMatchingSearchAndInst, unitFilter]);

  // Map Summary Heavy Equipment rows with live actual counts from operator tables
  const computedSummaryRows = useMemo(() => {
    return summaryRows.map((row) => {
      const j = row.jabatan.toLowerCase();
      let linkedCategory: SkillAuditCategoryCode | null = null;
      let actualTableCount: number | null = null;

      if (j.includes('adt')) {
        linkedCategory = 'ADT';
        actualTableCount = adtList.length;
      } else if (j.includes('excavator') || j.includes('exa')) {
        linkedCategory = 'EXCAVATOR';
        actualTableCount = excList.length;
      } else if (j.includes('buldozer') || j.includes('dozer') || j.includes('doser')) {
        linkedCategory = 'DOSER';
        actualTableCount = doserList.length;
      } else if (j.includes('driver dt')) {
        linkedCategory = 'DRIVER_DT';
        actualTableCount = dtList.length;
      }

      const effectiveClose =
        liveSyncSummary && actualTableCount !== null ? actualTableCount : row.close_count;
      const effectiveTotal = Math.max(
        row.total_karyawan,
        effectiveClose + (liveSyncSummary ? 0 : row.open_count)
      );
      const effectiveOpen = Math.max(0, effectiveTotal - effectiveClose);
      const effectivePct =
        effectiveTotal > 0 ? Math.round((effectiveClose / effectiveTotal) * 100) : 0;

      return {
        ...row,
        linkedCategory,
        actualTableCount,
        effectiveClose,
        effectiveOpen,
        effectiveTotal,
        effectivePct,
      };
    });
  }, [summaryRows, adtList.length, excList.length, doserList.length, dtList.length, liveSyncSummary]);

  const totalSummaryClose = computedSummaryRows.reduce((s, r) => s + r.effectiveClose, 0);
  const totalSummaryOpen = computedSummaryRows.reduce((s, r) => s + r.effectiveOpen, 0);
  const totalSummaryKaryawan = computedSummaryRows.reduce((s, r) => s + r.effectiveTotal, 0);
  const totalSummaryPct =
    totalSummaryKaryawan > 0 ? Math.round((totalSummaryClose / totalSummaryKaryawan) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* ====================================================================
          TOP INTERACTIVE UNIT CATEGORY CARDS (JELAS MANA ADT, EXA, DOSER, DT)
         ==================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3.5">
        {/* Card 1: ADT */}
        {(() => {
          const hmCount = adtList.filter((r) => r.jenis_unit.toLowerCase().includes('hm400')).length;
          const volvoCount = adtList.filter((r) => r.jenis_unit.toLowerCase().includes('a40g')).length;
          const hmPct = adtList.length > 0 ? Math.round((hmCount / adtList.length) * 100) : 0;
          const active = activeTab === 'ADT';
          return (
            <button
              type="button"
              onClick={() => switchCategoryTab('ADT')}
              className={`text-left p-4 rounded-[14px] border transition-all duration-200 cursor-pointer relative overflow-hidden ${
                active
                  ? 'bg-[#18232B] text-white border-[#E88932] ring-2 ring-[#E88932]/40 shadow-md -translate-y-0.5'
                  : 'bg-white text-[#18232B] border-[#E2E8E8] hover:border-[#E88932] hover:shadow-xs'
              }`}
            >
              <span className="absolute top-0 left-0 right-0 h-1 bg-[#E88932]" />
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#E88932]/15 text-[#E88932]">
                  1. UNIT ADT
                </span>
                <Truck className="w-4 h-4 text-[#E88932]" />
              </div>
              <div className="text-2xl font-heading font-extrabold mt-2 flex items-baseline gap-1.5">
                <span className="font-mono">{adtList.length}x</span>
                <span className="text-xs font-semibold opacity-80">Operator Done</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-black/10 overflow-hidden my-2 flex">
                <div className="bg-[#E88932] h-full" style={{ width: `${hmPct}%` }} />
                <div className="bg-[#D5A33D] h-full" style={{ width: `${100 - hmPct}%` }} />
              </div>
              <div
                className={`text-[11px] font-medium flex items-center justify-between ${
                  active ? 'text-slate-300' : 'text-[#5A6B75]'
                }`}
              >
                <span>
                  HM400: <strong className={`font-mono ${active ? 'text-white' : 'text-[#18232B]'}`}>{hmCount}</strong>
                </span>
                <span>
                  Volvo A40G:{' '}
                  <strong className={`font-mono ${active ? 'text-white' : 'text-[#18232B]'}`}>{volvoCount}</strong>
                </span>
              </div>
            </button>
          );
        })()}

        {/* Card 2: EXCAVATOR */}
        {(() => {
          const exc50 = excList.filter((r) => r.jenis_unit.includes('50T')).length;
          const exc30 = excList.length - exc50;
          const exc50Pct = excList.length > 0 ? Math.round((exc50 / excList.length) * 100) : 0;
          const active = activeTab === 'EXCAVATOR';
          return (
            <button
              type="button"
              onClick={() => switchCategoryTab('EXCAVATOR')}
              className={`text-left p-4 rounded-[14px] border transition-all duration-200 cursor-pointer relative overflow-hidden ${
                active
                  ? 'bg-[#18232B] text-white border-[#527FA1] ring-2 ring-[#527FA1]/40 shadow-md -translate-y-0.5'
                  : 'bg-white text-[#18232B] border-[#E2E8E8] hover:border-[#527FA1] hover:shadow-xs'
              }`}
            >
              <span className="absolute top-0 left-0 right-0 h-1 bg-[#527FA1]" />
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#527FA1]/15 text-[#527FA1]">
                  2. UNIT EXCAVATOR (EXA)
                </span>
                <HardHat className="w-4 h-4 text-[#527FA1]" />
              </div>
              <div className="text-2xl font-heading font-extrabold mt-2 flex items-baseline gap-1.5">
                <span className="font-mono">{excList.length}x</span>
                <span className="text-xs font-semibold opacity-80">Operator Done</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-black/10 overflow-hidden my-2 flex">
                <div className="bg-[#527FA1] h-full" style={{ width: `${exc50Pct}%` }} />
                <div className="bg-[#7FA6C4] h-full" style={{ width: `${100 - exc50Pct}%` }} />
              </div>
              <div
                className={`text-[11px] font-medium flex items-center justify-between ${
                  active ? 'text-slate-300' : 'text-[#5A6B75]'
                }`}
              >
                <span>
                  Exc 50T: <strong className={`font-mono ${active ? 'text-white' : 'text-[#18232B]'}`}>{exc50}</strong>
                </span>
                <span>
                  30T/320T:{' '}
                  <strong className={`font-mono ${active ? 'text-white' : 'text-[#18232B]'}`}>{exc30}</strong>
                </span>
              </div>
            </button>
          );
        })()}

        {/* Card 3: DOSER */}
        {(() => {
          const d85 = doserList.filter((r) => r.jenis_unit.includes('D85')).length;
          const d65 = doserList.filter((r) => r.jenis_unit.includes('D65')).length;
          const d85Pct = doserList.length > 0 ? Math.round((d85 / doserList.length) * 100) : 0;
          const active = activeTab === 'DOSER';
          return (
            <button
              type="button"
              onClick={() => switchCategoryTab('DOSER')}
              className={`text-left p-4 rounded-[14px] border transition-all duration-200 cursor-pointer relative overflow-hidden ${
                active
                  ? 'bg-[#18232B] text-white border-[#397C69] ring-2 ring-[#397C69]/40 shadow-md -translate-y-0.5'
                  : 'bg-white text-[#18232B] border-[#E2E8E8] hover:border-[#397C69] hover:shadow-xs'
              }`}
            >
              <span className="absolute top-0 left-0 right-0 h-1 bg-[#397C69]" />
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#397C69]/15 text-[#397C69]">
                  3. UNIT DOSER / DOZER
                </span>
                <ShieldCheck className="w-4 h-4 text-[#397C69]" />
              </div>
              <div className="text-2xl font-heading font-extrabold mt-2 flex items-baseline gap-1.5">
                <span className="font-mono">{doserList.length}x</span>
                <span className="text-xs font-semibold opacity-80">Operator Done</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-black/10 overflow-hidden my-2 flex">
                <div className="bg-[#397C69] h-full" style={{ width: `${d85Pct}%` }} />
                <div className="bg-[#6CD4B4] h-full" style={{ width: `${100 - d85Pct}%` }} />
              </div>
              <div
                className={`text-[11px] font-medium flex items-center justify-between ${
                  active ? 'text-slate-300' : 'text-[#5A6B75]'
                }`}
              >
                <span>
                  D85SS: <strong className={`font-mono ${active ? 'text-white' : 'text-[#18232B]'}`}>{d85}</strong>
                </span>
                <span>
                  Doser D65:{' '}
                  <strong className={`font-mono ${active ? 'text-white' : 'text-[#18232B]'}`}>{d65}</strong>
                </span>
              </div>
            </button>
          );
        })()}

        {/* Card 4: DRIVER DT */}
        {(() => {
          const domfeng = dtList.filter((r) => r.jenis_unit.toLowerCase().includes('domfeng')).length;
          const hongyan = dtList.filter((r) => r.jenis_unit.toLowerCase().includes('hongyan')).length;
          const domPct = dtList.length > 0 ? Math.round((domfeng / dtList.length) * 100) : 0;
          const active = activeTab === 'DRIVER_DT';
          return (
            <button
              type="button"
              onClick={() => switchCategoryTab('DRIVER_DT')}
              className={`text-left p-4 rounded-[14px] border transition-all duration-200 cursor-pointer relative overflow-hidden ${
                active
                  ? 'bg-[#18232B] text-white border-[#D5A33D] ring-2 ring-[#D5A33D]/40 shadow-md -translate-y-0.5'
                  : 'bg-white text-[#18232B] border-[#E2E8E8] hover:border-[#D5A33D] hover:shadow-xs'
              }`}
            >
              <span className="absolute top-0 left-0 right-0 h-1 bg-[#D5A33D]" />
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#D5A33D]/18 text-[#D5A33D]">
                  4. DRIVER DT HAULING
                </span>
                <Truck className="w-4 h-4 text-[#D5A33D]" />
              </div>
              <div className="text-2xl font-heading font-extrabold mt-2 flex items-baseline gap-1.5">
                <span className="font-mono">{dtList.length}x</span>
                <span className="text-xs font-semibold opacity-80">Driver Done</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-black/10 overflow-hidden my-2 flex">
                <div className="bg-[#D5A33D] h-full" style={{ width: `${domPct}%` }} />
                <div className="bg-[#F3C77E] h-full" style={{ width: `${100 - domPct}%` }} />
              </div>
              <div
                className={`text-[11px] font-medium flex items-center justify-between ${
                  active ? 'text-slate-300' : 'text-[#5A6B75]'
                }`}
              >
                <span>
                  Domfeng:{' '}
                  <strong className={`font-mono ${active ? 'text-white' : 'text-[#18232B]'}`}>{domfeng}</strong>
                </span>
                <span>
                  Hongyan:{' '}
                  <strong className={`font-mono ${active ? 'text-white' : 'text-[#18232B]'}`}>{hongyan}</strong>
                </span>
              </div>
            </button>
          );
        })()}

        {/* Card 5: SUMMARY HEAVY EQUIPMENT */}
        {(() => {
          const active = activeTab === 'SUMMARY';
          return (
            <button
              type="button"
              onClick={() => switchCategoryTab('SUMMARY')}
              className={`text-left p-4 rounded-[14px] border transition-all duration-200 cursor-pointer relative overflow-hidden ${
                active
                  ? 'bg-[#18232B] text-white border-[#E88932] ring-2 ring-[#E88932]/40 shadow-md -translate-y-0.5'
                  : 'bg-white text-[#18232B] border-[#E2E8E8] hover:border-[#E88932] hover:shadow-xs'
              }`}
            >
              <span className="absolute top-0 left-0 right-0 h-1 bg-[#18232B]" />
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#E88932]/15 text-[#E88932]">
                  5. SUMMARY ALL UNIT
                </span>
                <Layers className="w-4 h-4 text-[#E88932]" />
              </div>
              <div className="text-2xl font-heading font-extrabold mt-2 flex items-baseline gap-1.5">
                <span className="font-mono">
                  {totalSummaryClose}/{totalSummaryKaryawan}
                </span>
                <span className="text-xs font-mono font-bold text-[#E88932]">
                  ({totalSummaryPct}%)
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-black/10 overflow-hidden my-2 flex">
                <div
                  className="bg-[#397C69] h-full"
                  style={{ width: `${Math.min(100, totalSummaryPct)}%` }}
                />
              </div>
              <div
                className={`text-[11px] font-medium flex items-center justify-between ${
                  active ? 'text-slate-300' : 'text-[#5A6B75]'
                }`}
              >
                <span>
                  Close:{' '}
                  <strong className={`font-mono ${active ? 'text-[#6CD4B4]' : 'text-[#296050]'}`}>
                    {totalSummaryClose}
                  </strong>
                </span>
                <span>
                  Open:{' '}
                  <strong className={`font-mono ${active ? 'text-[#E88932]' : 'text-[#C66B1A]'}`}>
                    {totalSummaryOpen}
                  </strong>
                </span>
              </div>
            </button>
          );
        })()}
      </div>

      {/* ====================================================================
          SUB-NAVIGATION PILLS (PILIH KATEGORI UNIT DENGAN CEPAT)
         ==================================================================== */}
      <div className="bg-white rounded-[14px] border border-[#E2E8E8] p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ADT' as const, label: `Operator ADT (${adtList.length}x)` },
            { id: 'EXCAVATOR' as const, label: `Operator Excavator / Exa (${excList.length}x)` },
            { id: 'DOSER' as const, label: `Operator Doser (${doserList.length}x)` },
            { id: 'DRIVER_DT' as const, label: `Driver DT Hauling (${dtList.length}x)` },
            { id: 'SUMMARY' as const, label: `Summary Heavy Equipment (${totalSummaryPct}%)` },
            {
              id: 'ALL_UNITS' as const,
              label: `Tabel & Grafik Gabungan Semua Unit (${allOperators.length}x)`,
            },
          ].map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => switchCategoryTab(t.id)}
                className={`px-3.5 py-2 rounded-[10px] text-xs font-heading font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-[#18232B] text-white shadow-xs'
                    : 'bg-[#F4F6F5] text-[#263640] hover:bg-[#E2E8E8]'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Site Filter Pill Bar */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#F4F6F5] p-1 rounded-[10px] border border-[#E2E8E8]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#5A6B75] px-2 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#E88932]" />
            Filter Site:
          </span>
          {(['ALL', ...TRAINING_SITE_OPTIONS] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSiteFilter(s)}
              className={`px-2.5 py-1 rounded-[7px] text-[11px] font-semibold transition-all cursor-pointer ${
                siteFilter === s
                  ? 'bg-[#18232B] text-white shadow-xs'
                  : 'text-[#263640] hover:bg-[#E2E8E8]'
              }`}
            >
              {s === 'ALL' ? 'Semua Site' : s}
            </button>
          ))}
        </div>
      </div>

      {/* ====================================================================
          VIEW A: SUMMARY REFRESH HEAVY EQUIPMENT (LIVE SYNC)
         ==================================================================== */}
      {activeTab === 'SUMMARY' && (
        <div className="space-y-5">
          <div className="bg-white rounded-[14px] border border-[#E2E8E8] shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-[#18232B] bg-topography text-white flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-heading font-extrabold uppercase">
                  REFRESH OPERATOR & DRIVER DT — UPDATE PROGRAM REFRESH OPERATOR & DRIVER
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Summary Refresh Heavy Equipment berdasarkan Jabatan — Grafik & Tabel terhubung langsung dengan Data Aktual Peserta
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {/* Toggle Live Data Aktual vs Target Baseline */}
                <div className="inline-flex rounded-[8px] bg-[#263640] p-1 border border-slate-700 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setLiveSyncSummary(true)}
                    className={`px-2.5 py-1 rounded-[6px] font-semibold transition-colors cursor-pointer ${
                      liveSyncSummary
                        ? 'bg-[#397C69] text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Live Data Aktual Peserta
                  </button>
                  <button
                    type="button"
                    onClick={() => setLiveSyncSummary(false)}
                    className={`px-2.5 py-1 rounded-[6px] font-semibold transition-colors cursor-pointer ${
                      !liveSyncSummary
                        ? 'bg-[#E88932] text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Target Baseline
                  </button>
                </div>

                {canEdit && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<RefreshCw className="w-3.5 h-3.5" />}
                      onClick={() => {
                        mockStore.syncSkillAuditSummaryFromActualRecords(userId);
                        onDone(
                          'Data CLOSE pada Summary Heavy Equipment berhasil disinkronkan permanen dengan jumlah aktual tabel peserta!'
                        );
                      }}
                    >
                      Sinkronkan Permanen
                    </Button>
                    <Button
                      size="sm"
                      icon={<Plus className="w-3.5 h-3.5" />}
                      onClick={() =>
                        setEditSummary({
                          jabatan: '',
                          close_count: 0,
                          open_count: 0,
                        })
                      }
                    >
                      + Tambah Jabatan
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="p-5 grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
              {/* Left 9 Cols: Summary Table + Dark Horizontal Bar Chart */}
              <div className="xl:col-span-9 space-y-5">
                {/* Summary Refresh Heavy Equipment Table */}
                <div className="overflow-x-auto rounded-[12px] border border-[#E2E8E8] shadow-xs">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#18232B] text-white">
                        <th
                          colSpan={canEdit ? 7 : 6}
                          className="bg-[#18232B] text-white font-heading font-bold text-xs sm:text-sm py-2.5 px-4 border-b border-[#263640] text-center uppercase tracking-wider"
                        >
                          <span className="inline-block w-2 h-2 rounded-full bg-[#E88932] mr-2 align-middle" />
                          Summary Refresh Heavy Equipment
                          {liveSyncSummary && (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-[#397C69]/25 border border-[#397C69]/40 text-[#6CD4B4] text-[10px] font-mono uppercase tracking-wider">
                              Live Terhubung Tabel Peserta
                            </span>
                          )}
                        </th>
                      </tr>
                      <tr className="bg-[#263640] text-slate-100 font-mono font-bold text-[10px] uppercase tracking-wider">
                        <th className="px-4 py-2.5 border-r border-[#18232B]/50 text-left">JABATAN</th>
                        <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-center w-24">
                          CLOSE (DONE)
                        </th>
                        <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-center w-24">
                          OPEN (BELUM)
                        </th>
                        <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-center w-32">
                          TOTAL KARYAWAN
                        </th>
                        <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-center w-40">
                          CAPAIAN (%)
                        </th>
                        <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-center w-36">
                          DETAIL PESERTA
                        </th>
                        {canEdit && (
                          <th className="px-3 py-2.5 text-center w-20">
                            AKSI
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8E8]">
                      {computedSummaryRows.map((row) => (
                        <tr
                          key={row.id}
                          className="even:bg-[#FAFBFB] odd:bg-white hover:bg-[#F4F6F5]/70 transition-colors"
                        >
                          <td className="px-4 py-3 border-r border-[#E2E8E8] font-heading font-bold text-xs sm:text-sm text-[#18232B]">
                            {row.jabatan}
                          </td>
                          <td className="px-3 py-3 border-r border-[#E2E8E8] text-center font-mono font-bold text-sm text-[#296050] bg-[#397C69]/6">
                            {row.effectiveClose}
                          </td>
                          <td className="px-3 py-3 border-r border-[#E2E8E8] text-center font-mono font-bold text-sm text-[#C66B1A] bg-[#E88932]/6">
                            {row.effectiveOpen}
                          </td>
                          <td className="px-3 py-3 border-r border-[#E2E8E8] text-center font-mono font-bold text-sm text-[#18232B]">
                            {row.effectiveTotal}
                          </td>
                          <td className="px-3 py-3 border-r border-[#E2E8E8]">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-[#E2E8E8] rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${Math.min(100, row.effectivePct)}%`,
                                    backgroundColor:
                                      row.effectivePct >= 75
                                        ? '#397C69'
                                        : row.effectivePct >= 35
                                        ? '#E88932'
                                        : '#527FA1',
                                  }}
                                />
                              </div>
                              <span className="font-mono font-bold text-xs text-[#18232B] w-10 text-right">
                                {row.effectivePct}%
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 border-r border-[#E2E8E8] text-center">
                            {row.linkedCategory ? (
                              <button
                                type="button"
                                onClick={() => switchCategoryTab(row.linkedCategory!)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-[#18232B] text-white hover:bg-[#E88932] text-[10px] font-mono font-bold transition-colors cursor-pointer"
                              >
                                <span>Lihat {row.actualTableCount} Nama</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </button>
                            ) : (
                              <span className="text-[10px] font-mono text-[#5A6B75]">
                                Rekap Summary
                              </span>
                            )}
                          </td>
                          {canEdit && (
                            <td className="px-2 py-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditSummary({
                                      id: row.id,
                                      jabatan: row.jabatan,
                                      close_count: row.effectiveClose,
                                      open_count: row.effectiveOpen,
                                    })
                                  }
                                  className="p-1 rounded hover:bg-[#E88932]/15 text-[#C66B1A] cursor-pointer"
                                  title="Edit Baris"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!window.confirm(`Hapus baris "${row.jabatan}"?`)) return;
                                    mockStore.deleteSkillAuditSummaryRow(userId, row.id);
                                    onDone('Baris summary berhasil dihapus.');
                                  }}
                                  className="p-1 rounded hover:bg-[#B94C45]/15 text-[#B94C45] cursor-pointer"
                                  title="Hapus Baris"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                      <tr className="bg-[#263640] text-white font-bold">
                        <td className="px-4 py-3 text-left font-heading">TOTAL KESELURUHAN</td>
                        <td className="px-3 py-3 text-center font-mono text-sm text-[#6CD4B4]">
                          {totalSummaryClose}
                        </td>
                        <td className="px-3 py-3 text-center font-mono text-sm text-[#E88932]">
                          {totalSummaryOpen}
                        </td>
                        <td className="px-3 py-3 text-center font-mono text-sm">
                          {totalSummaryKaryawan}
                        </td>
                        <td className="px-3 py-3 text-center font-mono text-sm text-[#E88932]">
                          {totalSummaryPct}%
                        </td>
                        <td />
                        {canEdit && <td />}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Unified Dark Slate Horizontal Bar Chart + Interactive Click */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-7 rounded-[14px] bg-[#18232B] bg-topography border border-[#263640] p-5 text-white shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-2.5 py-1 rounded bg-[#263640] text-[10px] font-mono text-[#E88932] border border-slate-700 uppercase tracking-wider">
                        Sum of %
                      </span>
                      <h4 className="text-sm sm:text-base font-heading font-bold tracking-wider uppercase">
                        TOTAL CAPAIAN (%)
                      </h4>
                      <span className="text-xs font-mono text-[#E88932] flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-xs bg-[#E88932] inline-block" />
                        Total
                      </span>
                    </div>

                    <div className="space-y-3.5">
                      {[...computedSummaryRows]
                        .sort((a, b) => {
                          const order = [
                            'Operator Rock Breaker',
                            'Operator Excavator',
                            'Operator Buldozer',
                            'Operator ADT',
                            'Driver DT 12 R',
                          ];
                          return order.indexOf(a.jabatan) - order.indexOf(b.jabatan);
                        })
                        .map((row) => (
                          <div
                            key={row.id}
                            onClick={() =>
                              row.linkedCategory && switchCategoryTab(row.linkedCategory)
                            }
                            className={`grid grid-cols-12 items-center gap-3 group ${
                              row.linkedCategory ? 'cursor-pointer' : ''
                            }`}
                            title={
                              row.linkedCategory
                                ? `Klik untuk membuka daftar peserta ${row.jabatan}`
                                : row.jabatan
                            }
                          >
                            <div className="col-span-4 text-right text-xs text-slate-200 font-semibold truncate group-hover:text-[#E88932] transition-colors">
                              {row.jabatan}
                            </div>
                            <div className="col-span-8 flex items-center gap-2.5">
                              <div className="flex-1 bg-[#263640] h-6 rounded-[6px] overflow-hidden relative border border-white/10">
                                <div
                                  className="h-full bg-gradient-to-r from-[#C66B1A] to-[#E88932] transition-all duration-500 flex items-center justify-end pr-2"
                                  style={{
                                    width: `${Math.min(100, Math.max(6, row.effectivePct))}%`,
                                  }}
                                >
                                  <span className="text-[10px] font-mono text-white font-bold">
                                    {row.effectiveClose}/{row.effectiveTotal}
                                  </span>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded-[6px] border border-slate-600 bg-[#263640] text-xs font-mono font-bold text-[#E88932] min-w-[46px] text-center">
                                {row.effectivePct}%
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Close vs Open Grouped Bar Chart */}
                  <div className="lg:col-span-5 rounded-[14px] bg-white border border-[#E2E8E8] p-4 shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-heading font-extrabold text-[#18232B] uppercase">
                          Grafik Close vs Open per Jabatan
                        </h4>
                        <BarChart3 className="w-4 h-4 text-[#E88932]" />
                      </div>
                      <GroupedBarChart
                        categories={computedSummaryRows.map((r) =>
                          r.jabatan.replace('Operator ', '')
                        )}
                        series={[
                          { key: 'close', label: 'Close (Done)', color: '#397C69' },
                          { key: 'open', label: 'Open (Belum)', color: '#E88932' },
                        ]}
                        data={computedSummaryRows.map((r) => ({
                          close: r.effectiveClose,
                          open: r.effectiveOpen,
                        }))}
                        height={215}
                        onSelectCategory={(_, idx) => {
                          const target = computedSummaryRows[idx];
                          if (target?.linkedCategory) {
                            switchCategoryTab(target.linkedCategory);
                          }
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-[#5A6B75] text-center">
                      Klik batang grafik untuk melihat tabel nama peserta unit terkait
                    </p>
                  </div>
                </div>
              </div>

              {/* Right 3 Cols: Dokumentasi Kegiatan (Selaras dengan Assessment & Orientasi) */}
              <div className="xl:col-span-3 bg-white rounded-[12px] border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#18232B]">
                        Dokumentasi Kegiatan ({(photoMap.SUMMARY || []).length} Foto)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Klik foto untuk memperbesar tampilan
                      </p>
                    </div>
                    {canEdit && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleResetCategoryPhotos('SUMMARY', 'Summary Refresh')}
                          title="Kembalikan foto default"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-[#18232B] hover:bg-slate-50 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#18232B] text-white text-[11px] font-semibold hover:bg-[#263640] cursor-pointer">
                          <Upload className="w-3 h-3" />
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleUploadCategoryPhoto('SUMMARY', e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
                    {(photoMap.SUMMARY || []).map((url, idx) => (
                      <div
                        key={`${url}-${idx}`}
                        className="group relative aspect-[4/3] rounded-[9px] overflow-hidden border border-slate-200 bg-slate-100"
                      >
                        <img
                          src={url}
                          alt={`Dokumentasi ${idx + 1}`}
                          onClick={() =>
                            setPreviewPhoto({
                              url,
                              caption: `Dokumentasi Refresh Operator & Driver DT #${idx + 1}`,
                            })
                          }
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewPhoto({
                              url,
                              caption: `Dokumentasi Refresh Operator & Driver DT #${idx + 1}`,
                            })
                          }
                          className="absolute bottom-1.5 right-1.5 p-1 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Perbesar Foto"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCategoryPhoto('SUMMARY', idx)}
                            className="absolute top-1.5 right-1.5 p-1 rounded-md bg-red-600/85 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Hapus Foto"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Lokasi: {siteFilter === 'ALL' ? 'Semua Site' : siteFilter}
                  </span>
                  <span className="font-mono text-[#397C69] font-semibold">Verified TC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Perbandingan Cepat: Mana ADT, Mana Excavator, Mana Doser, Mana Driver DT */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {(['ADT', 'EXCAVATOR', 'DOSER', 'DRIVER_DT'] as SkillAuditCategoryCode[]).map(
              (catKey) => {
                const meta = CATEGORY_META[catKey];
                const breakdown = getCategoryUnitBreakdown(catKey);
                const totalCat = breakdown.reduce((s, x) => s + x.value, 0);
                return (
                  <div
                    key={catKey}
                    className="bg-white rounded-[14px] border border-[#E2E8E8] p-4 shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${meta.badgeBg} ${meta.badgeText}`}
                        >
                          {meta.shortTitle}
                        </span>
                        <span className="font-mono font-extrabold text-sm text-[#18232B]">
                          {totalCat}x Done
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5A6B75] mt-1">{meta.periodLabel}</p>

                      <div className="mt-3 space-y-1.5">
                        {breakdown.map((b) => {
                          const pct = totalCat > 0 ? Math.round((b.value / totalCat) * 100) : 0;
                          return (
                            <div
                              key={b.label}
                              onClick={() => {
                                switchCategoryTab(catKey);
                                setUnitFilter(b.filterKey);
                              }}
                              className="px-2.5 py-2 rounded-[8px] bg-[#FAFBFB] hover:bg-[#F4F6F5] border border-[#E2E8E8] text-xs cursor-pointer transition-colors"
                              title={`Klik untuk lihat daftar ${b.label}`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-[#18232B]">{b.label}</span>
                                <span className="font-mono font-bold text-[#18232B]">
                                  {b.value} ({pct}%)
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-[#E2E8E8] rounded-full overflow-hidden mt-1">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${pct}%`,
                                    backgroundColor: meta.accentColor,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => switchCategoryTab(catKey)}
                    >
                      Buka Detail {meta.shortTitle} ({totalCat})
                    </Button>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          VIEW B: INDIVIDUAL CATEGORY (ADT / EXCAVATOR / DOSER / DRIVER_DT)
          OR ALL_UNITS COMBINED TABLE & ANALYTICS
         ==================================================================== */}
      {activeTab !== 'SUMMARY' && (
        <div className="space-y-5">
          {/* Emergency Procedure Banner specifically for DRIVER_DT (Slide 4) */}
          {activeTab === 'DRIVER_DT' && (
            <div className="bg-[#FAFBFB] border border-[#E2E8E8] border-l-4 border-l-[#E88932] rounded-[14px] p-4 flex items-start gap-3 shadow-2xs">
              <AlertTriangle className="w-5 h-5 text-[#E88932] shrink-0 mt-0.5" />
              <div className="text-xs text-[#18232B] space-y-1">
                <div className="font-heading font-bold text-sm">
                  Observasi & Refresh kepada Driver DT Hauling tentang Procedure jika Emergency saat
                  mengemudi seperti:
                </div>
                <ul className="list-disc list-inside space-y-0.5 font-medium text-[#263640]">
                  <li>Engine mati mendadak di jalan turunan / tanjakan.</li>
                  <li>Rem Blong (Abnormal).</li>
                  <li>Dan Steering Tidak berfungsi.</li>
                </ul>
              </div>
            </div>
          )}

          {/* ALL_UNITS Executive Analytics Dashboard (Connected to Actual Table) */}
          {activeTab === 'ALL_UNITS' && (
            <div className="bg-white rounded-[14px] border border-[#E2E8E8] p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8E8] pb-3">
                <div>
                  <h3 className="text-sm sm:text-base font-heading font-extrabold text-[#18232B]">
                    ANALITIK GABUNGAN SELURUH UNIT ALAT BERAT & DT HAULING (DATA AKTUAL)
                  </h3>
                  <p className="text-xs text-[#5A6B75]">
                    Klik pada segmen Donut Chart atau batang grafik untuk memfilter langsung tabel di bawah
                  </p>
                </div>
                {categoryFilterInAll !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setCategoryFilterInAll('ALL')}
                    className="px-3 py-1 rounded-full bg-[#E88932]/15 text-[#C66B1A] text-xs font-mono font-bold cursor-pointer"
                  >
                    Filter Aktif: {CATEGORY_META[categoryFilterInAll].shortTitle} ✕ Reset
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                <div className="lg:col-span-5 bg-[#FAFBFB] rounded-[12px] p-4 border border-[#E2E8E8] flex flex-col justify-between h-full">
                  <div className="text-xs font-heading font-bold text-[#18232B] mb-3 flex items-center gap-1.5">
                    <PieChartIcon className="w-4 h-4 text-[#E88932]" />
                    <span>Proporsi Peserta per Kategori Unit</span>
                  </div>
                  <div className="my-auto">
                    <DonutChart
                      centerValue={String(allOperators.length)}
                      centerLabel="Total Peserta"
                      selectedLabel={
                        categoryFilterInAll === 'ALL'
                          ? 'ALL'
                          : CATEGORY_META[categoryFilterInAll].shortTitle
                      }
                      onSelectSegment={(label) => {
                        const found = (
                          Object.values(CATEGORY_META) as (typeof CATEGORY_META)['ADT'][]
                        ).find((m) => m.shortTitle === label);
                        if (found) {
                          setCategoryFilterInAll((prev) =>
                            prev === found.code ? 'ALL' : found.code
                          );
                        }
                      }}
                      segments={[
                        { label: 'Operator ADT', value: adtList.length, color: '#E88932' },
                        { label: 'Operator Excavator', value: excList.length, color: '#527FA1' },
                        { label: 'Operator Doser', value: doserList.length, color: '#397C69' },
                        { label: 'Driver DT Hauling', value: dtList.length, color: '#D5A33D' },
                      ]}
                    />
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#FAFBFB] rounded-[12px] p-4 border border-[#E2E8E8] flex flex-col justify-between h-full">
                  <div className="text-xs font-heading font-bold text-[#18232B] mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-[#527FA1]" />
                      <span>Distribusi Aktual Peserta per Jenis Unit Spesifik</span>
                    </span>
                    {unitFilter !== 'ALL' && (
                      <button
                        type="button"
                        onClick={() => setUnitFilter('ALL')}
                        className="text-[11px] font-mono text-[#E88932] hover:underline cursor-pointer"
                      >
                        Reset Unit ({unitFilter})
                      </button>
                    )}
                  </div>
                  <div className="my-auto">
                    {(() => {
                      const unitCounts = availableUnitsInTab.map((u) => ({
                        unit: u,
                        count: currentCategoryRecords.filter((r) => r.jenis_unit === u).length,
                      }));
                      return (
                        <GroupedBarChart
                          categories={unitCounts.map((x) => x.unit)}
                          series={[{ key: 'count', label: 'Jumlah Peserta (Aktual)', color: '#527FA1' }]}
                          data={unitCounts.map((x) => ({ count: x.count }))}
                          height={210}
                          onSelectCategory={(u) =>
                            setUnitFilter((prev) => (prev === u ? 'ALL' : u))
                          }
                        />
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Category Slide Summary Box (3 Equal-Height Uniform Boxes: Table + Pie Chart + Photos) */}
          {activeTab !== 'ALL_UNITS' &&
            (() => {
              const meta = CATEGORY_META[activeTab];
              // Dynamically compute breakdown from records matching active search/instructor filter!
              const breakdown = getCategoryUnitBreakdown(activeTab, recordsMatchingSearchAndInst);
              const totalCat = breakdown.reduce((s, x) => s + x.value, 0);
              const photos =
                activeTab === 'DRIVER_DT' && siteFilter === 'Genba'
                  ? opTrainerState.genbaClassPhotos || []
                  : activeTab === 'DRIVER_DT' && siteFilter === 'ALL'
                  ? [...(photoMap[activeTab] || []), ...(opTrainerState.genbaClassPhotos || []).slice(0, 4)]
                  : photoMap[activeTab] || [];

              // Instructor distribution for this category
              const instructorStats = availableInstructorsInTab.map((inst) => ({
                instructor: inst,
                count: currentCategoryRecords.filter((r) => r.instructor === inst).length,
              }));

              return (
                <div className="space-y-4">
                  {/* Context Banner Header */}
                  <div className="px-5 py-3.5 rounded-[12px] bg-[#18232B] text-white border border-[#263640] flex flex-wrap items-center justify-between gap-2 shadow-xs">
                    <div>
                      <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#E88932]">
                        PT. RODA JAYA SAKTI — {siteFilter === 'ALL' ? 'SEMUA SITE' : siteFilter.toUpperCase()}
                      </div>
                      <h3 className="text-sm sm:text-base font-heading font-bold">
                        {siteFilter === 'Genba' && activeTab === 'DRIVER_DT'
                          ? 'Refresh Training Class Driver DT & Manhaul • PERIOD : Juli - Oktober 2026'
                          : `${meta.chartBoxTitle} • PERIOD : ${meta.periodLabel}`}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {unitFilter !== 'ALL' && (
                        <button
                          type="button"
                          onClick={() => setUnitFilter('ALL')}
                          className="px-2.5 py-1 rounded-full bg-[#E88932] text-white font-mono font-bold text-[11px] cursor-pointer shadow-2xs"
                        >
                          Filter Unit Aktif ✕ Reset
                        </button>
                      )}
                      <span className="px-3.5 py-1 rounded-full bg-[#263640] border border-[#E88932]/40 text-[#E88932] font-mono font-bold text-xs shadow-2xs">
                        Ada {totalCat}x {meta.shortTitle} - Done Refresh
                      </span>
                    </div>
                  </div>

                  {/* BLOK 2: 3 KOTAK RINGKASAN SEJAJAR (SELARAS 100% DENGAN ASSESSMENT & ORIENTASI) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                    {/* KOTAK KIRI (4 Cols): Rincian Unit & Rekap Instructor */}
                    <div className="lg:col-span-4 bg-white rounded-[12px] border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between h-full">
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[#18232B]">
                            Rincian Unit ({totalCat} Peserta)
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Klik baris untuk memfilter tabel peserta di bawah
                          </p>
                        </div>

                        <div className="overflow-hidden rounded-[9px] border border-slate-200">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-[#18232B] text-white text-[10px] font-mono uppercase">
                                <th className="py-2.5 px-3">Jenis Unit</th>
                                <th className="py-2.5 px-3 text-right">Total</th>
                                <th className="py-2.5 px-3 text-right">%</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-xs">
                              {breakdown.map((b) => {
                                const pct = totalCat > 0 ? Math.round((b.value / totalCat) * 100) : 0;
                                const isSelected = unitFilter === b.filterKey;
                                return (
                                  <tr
                                    key={b.label}
                                    onClick={() =>
                                      setUnitFilter((prev) =>
                                        prev === b.filterKey ? 'ALL' : b.filterKey
                                      )
                                    }
                                    className={`cursor-pointer transition-colors ${
                                      isSelected
                                        ? 'bg-[#E88932]/12 font-bold'
                                        : 'hover:bg-slate-50 font-semibold'
                                    }`}
                                    title={`Klik untuk memfilter tabel hanya unit ${b.label}`}
                                  >
                                    <td className="py-2.5 px-3 flex items-center justify-between gap-2 text-[#18232B]">
                                      <span className="flex items-center gap-2">
                                        <span
                                          className="w-2.5 h-2.5 rounded-xs shrink-0"
                                          style={{ backgroundColor: b.color }}
                                        />
                                        <span>{b.label}</span>
                                      </span>
                                      {isSelected && (
                                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#E88932] text-white">
                                          AKTIF
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#18232B]">
                                      {b.value}
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                                      {pct}%
                                    </td>
                                  </tr>
                                );
                              })}
                              <tr
                                onClick={() => setUnitFilter('ALL')}
                                className="bg-[#18232B] text-white font-bold text-xs cursor-pointer"
                              >
                                <td className="py-2.5 px-3">GRAND TOTAL UNIT</td>
                                <td className="py-2.5 px-3 text-right font-mono text-sm text-[#E88932]">
                                  {totalCat}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                                  100%
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Live Instructor Breakdown */}
                        {instructorStats.length > 0 && (
                          <div className="pt-2 border-t border-slate-100 space-y-1.5">
                            <div className="text-[10px] font-mono font-bold uppercase text-slate-500 flex items-center justify-between">
                              <span>Rekap Aktual per Instructor</span>
                              {instructorFilter !== 'ALL' && (
                                <button
                                  type="button"
                                  onClick={() => setInstructorFilter('ALL')}
                                  className="text-[#E88932] hover:underline cursor-pointer"
                                >
                                  Reset
                                </button>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {instructorStats.map((st) => {
                                const activeInst = instructorFilter === st.instructor;
                                return (
                                  <button
                                    key={st.instructor}
                                    type="button"
                                    onClick={() =>
                                      setInstructorFilter((prev) =>
                                        prev === st.instructor ? 'ALL' : st.instructor
                                      )
                                    }
                                    className={`px-2.5 py-1 rounded-[6px] text-xs font-semibold border transition-all cursor-pointer ${
                                      activeInst
                                        ? 'bg-[#18232B] text-white border-[#E88932]'
                                        : 'bg-slate-50 text-[#18232B] border-slate-200 hover:border-[#18232B]'
                                    }`}
                                  >
                                    {st.instructor}:{' '}
                                    <strong className="font-mono text-[#C66B1A]">{st.count}x</strong>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Departemen: MOD</span>
                        <span className="font-mono font-semibold text-[#18232B]">
                          Provider: INTERNAL PT RJS / TC
                        </span>
                      </div>
                    </div>

                    {/* KOTAK TENGAH (4 Cols): Grafik Visual Interaktif */}
                    <div className="lg:col-span-4 bg-white rounded-[12px] border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between h-full">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#18232B] text-center mb-1">
                          Proporsi Unit {meta.shortTitle} ({totalCat} Peserta)
                        </h3>
                        <p className="text-[11px] text-slate-500 text-center mb-3">
                          Visualisasi otomatis dari data aktual sesuai filter Site
                        </p>
                      </div>

                      <div className="my-auto flex items-center justify-center">
                        <SlidePieChart
                          segments={breakdown}
                          selectedFilter={unitFilter}
                          onSelectFilter={(fk) => setUnitFilter(fk)}
                        />
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 text-center text-[11px] text-slate-500">
                        Klik potongan grafik untuk memfilter tabel peserta di bawah
                      </div>
                    </div>

                    {/* KOTAK KANAN (4 Cols): Dokumentasi Kegiatan (Identik 100% dengan Assessment & Orientasi) */}
                    <div className="lg:col-span-4 bg-white rounded-[12px] border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#18232B]">
                              Dokumentasi Kegiatan ({photos.length} Foto)
                            </h3>
                            <p className="text-[11px] text-slate-500">
                              Klik foto untuk memperbesar tampilan
                            </p>
                          </div>
                          {canEdit && (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  handleResetCategoryPhotos(activeTab, meta.shortTitle)
                                }
                                title="Kembalikan foto default"
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-[#18232B] hover:bg-slate-50 cursor-pointer"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                              <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#18232B] text-white text-[11px] font-semibold hover:bg-[#263640] cursor-pointer">
                                <Upload className="w-3 h-3" />
                                <span>Upload Foto</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) => handleUploadCategoryPhoto(activeTab, e)}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          )}
                        </div>

                        <div
                          className={`grid gap-2 max-h-[250px] overflow-y-auto pr-1 ${
                            photos.length <= 4
                              ? 'grid-cols-2'
                              : photos.length <= 6
                              ? 'grid-cols-3'
                              : 'grid-cols-4'
                          }`}
                        >
                          {photos.map((url, idx) => (
                            <div
                              key={`${url}-${idx}`}
                              className="group relative aspect-[4/3] rounded-[9px] overflow-hidden border border-slate-200 bg-slate-100"
                            >
                              <img
                                src={url}
                                alt={`Dokumentasi ${idx + 1}`}
                                onClick={() =>
                                  setPreviewPhoto({
                                    url,
                                    caption: `${meta.slideTitle} — Dokumentasi #${idx + 1}`,
                                  })
                                }
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewPhoto({
                                    url,
                                    caption: `${meta.slideTitle} — Dokumentasi #${idx + 1}`,
                                  })
                                }
                                className="absolute bottom-1.5 right-1.5 p-1 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                title="Perbesar Foto"
                              >
                                <ZoomIn className="w-3.5 h-3.5" />
                              </button>
                              {canEdit && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCategoryPhoto(activeTab, idx)}
                                  className="absolute top-1.5 right-1.5 p-1 rounded-md bg-red-600/85 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  title="Hapus Foto"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>
                          Lokasi:{' '}
                          {siteFilter === 'ALL'
                            ? activeTab === 'DRIVER_DT'
                              ? 'Site Tangofa & Site Genba'
                              : 'Tangofa'
                            : siteFilter}
                        </span>
                        <span className="font-mono text-[#397C69] font-semibold">
                          Verified TC
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

          {/* Detailed Operator / Driver Table with Filters & Actions */}
          <div className="bg-white rounded-[14px] border border-[#E2E8E8] shadow-xs overflow-hidden">
            <div className="p-4 bg-[#F4F6F5] border-b border-[#E2E8E8] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm sm:text-base font-heading font-extrabold text-[#18232B]">
                    {activeTab === 'ALL_UNITS'
                      ? 'Tabel Gabungan Seluruh Operator & Driver (ADT • Excavator • Doser • Driver DT)'
                      : CATEGORY_META[activeTab].reportTitle}
                  </h4>
                  <p className="text-[11px] text-[#5A6B75]">
                    Menampilkan <strong className="text-[#18232B]">{filteredRecords.length}</strong> data aktual dari total{' '}
                    <strong className="text-[#18232B]">{currentCategoryRecords.length}</strong> peserta
                    {unitFilter !== 'ALL' && (
                      <span className="ml-1.5 text-[#C66B1A] font-semibold">
                        (Filter Unit:{' '}
                        {unitFilter === 'GROUP_EXC_30_320'
                          ? 'Excavator 30T / 320T'
                          : unitFilter}
                        )
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Download className="w-3.5 h-3.5" />}
                    onClick={() =>
                      exportCsv(
                        `Skill_Audit_Refresh_${activeTab}.csv`,
                        [
                          'No',
                          'Kategori Unit',
                          'Tanggal',
                          'Nama',
                          'Posisi',
                          'Jenis Unit',
                          'Keterangan',
                          'Provider',
                          'Program',
                          'Instructor',
                        ],
                        filteredRecords.map((r, i) => [
                          i + 1,
                          CATEGORY_META[r.category].shortTitle,
                          r.tanggal,
                          r.nama,
                          r.posisi,
                          r.jenis_unit,
                          r.keterangan,
                          r.provider,
                          r.program,
                          r.instructor,
                        ])
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
                      printTable(
                        activeTab === 'ALL_UNITS'
                          ? 'REPORT SKILL AUDIT & REFRESH OPERATOR (ALL UNITS)'
                          : CATEGORY_META[activeTab].reportTitle,
                        [
                          'No',
                          'Kategori',
                          'Tanggal',
                          'Nama',
                          'Posisi',
                          'Jenis Unit',
                          'Keterangan',
                          'Provider',
                          'Program',
                          'Instructor',
                        ],
                        filteredRecords.map((r, i) => [
                          i + 1,
                          CATEGORY_META[r.category].shortTitle,
                          r.tanggal,
                          r.nama,
                          r.posisi,
                          r.jenis_unit,
                          r.keterangan,
                          r.provider,
                          r.program,
                          r.instructor,
                        ])
                      )
                    }
                  >
                    PDF
                  </Button>
                  {canEdit && (
                    <Button
                      size="sm"
                      icon={<Plus className="w-3.5 h-3.5" />}
                      onClick={() => {
                        const targetCat: SkillAuditCategoryCode =
                          activeTab === 'ALL_UNITS' ? 'ADT' : activeTab;
                        const m = CATEGORY_META[targetCat];
                        setEditOp({
                          category: targetCat,
                          tanggal: '4 Nov 2026',
                          nama: '',
                          posisi: m.defaultPosisi,
                          jenis_unit: m.unitOptions[0],
                          keterangan: 'INTERNAL',
                          provider: 'TC',
                          program: 'Refresh',
                          instructor: m.defaultInstructor,
                          period_label: m.periodLabel,
                        });
                      }}
                    >
                      + Tambah Data Peserta
                    </Button>
                  )}
                </div>
              </div>

              {/* Quick Unit Filter Pills + Search */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#E2E8E8]">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6B75]" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama operator / jenis unit / tanggal..."
                    className={`${inputCls} pl-8`}
                  />
                </div>
                <select
                  value={unitFilter}
                  onChange={(e) => setUnitFilter(e.target.value)}
                  className={inputCls}
                >
                  <option value="ALL">Semua Jenis Unit ({currentCategoryRecords.length})</option>
                  {activeTab === 'EXCAVATOR' && (
                    <option value="GROUP_EXC_30_320">
                      Gabungan Excavator 30T / 320T (
                      {
                        currentCategoryRecords.filter(
                          (r) => r.jenis_unit.includes('30T') || r.jenis_unit.includes('320T')
                        ).length
                      }{' '}
                      orang)
                    </option>
                  )}
                  {availableUnitsInTab.map((u) => {
                    const cnt = currentCategoryRecords.filter((r) => r.jenis_unit === u).length;
                    return (
                      <option key={u} value={u}>
                        {u} ({cnt} orang)
                      </option>
                    );
                  })}
                </select>
                <select
                  value={instructorFilter}
                  onChange={(e) => setInstructorFilter(e.target.value)}
                  className={inputCls}
                >
                  <option value="ALL">Semua Instructor</option>
                  {availableInstructorsInTab.map((inst) => (
                    <option key={inst} value={inst}>
                      Instructor: {inst} (
                      {currentCategoryRecords.filter((r) => r.instructor === inst).length}x)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[540px]">
              <table className="w-full border-collapse text-xs">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#18232B] text-white font-heading font-bold text-xs uppercase">
                    <th
                      colSpan={canEdit ? 12 : 11}
                      className="py-2.5 px-4 text-center border-b border-[#263640] tracking-wider"
                    >
                      <span className="inline-block w-2 h-2 rounded-full bg-[#E88932] mr-2 align-middle" />
                      PT. RODA JAYA SAKTI — {siteFilter === 'ALL' ? 'SEMUA SITE' : siteFilter.toUpperCase()} •{' '}
                      {activeTab === 'ALL_UNITS'
                        ? 'REPORT SKILL AUDIT & REFRESH OPERATOR (ADT, EXCAVATOR, DOSER, DRIVER DT)'
                        : `${CATEGORY_META[activeTab].reportTitle} (${CATEGORY_META[activeTab].periodLabel})`}
                    </th>
                  </tr>
                  <tr className="bg-[#263640] text-slate-100 font-mono font-bold text-[10px] uppercase tracking-wider">
                    <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-center w-12">No</th>
                    <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-center w-28">Site</th>
                    <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-center w-28">Tanggal</th>
                    <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-left">Nama</th>
                    <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-center w-24">Posisi</th>
                    <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-center w-36">
                      Kategori Unit
                    </th>
                    <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-center w-40">
                      Jenis Unit
                    </th>
                    <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-center w-28">
                      Keterangan
                    </th>
                    <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-center w-20">Provider</th>
                    <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-center w-24">Program</th>
                    <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-center w-36">
                      Instructor
                    </th>
                    {canEdit && (
                      <th className="px-3 py-2.5 text-center w-20">Aksi</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8E8]">
                  {filteredRecords.map((row, idx) => {
                    const catMeta = CATEGORY_META[row.category];
                    const rowSite =
                      (row as typeof combinedRawOperators[number]).site || 'Tangofa';
                    const isGenbaRow = Boolean(
                      (row as typeof combinedRawOperators[number])._fromGenbaClass
                    );
                    return (
                      <tr
                        key={row.id}
                        className="even:bg-[#FAFBFB] odd:bg-white hover:bg-[#F4F6F5]/70 transition-colors"
                      >
                        <td className="px-2.5 py-2.5 border-r border-[#E2E8E8] text-center font-mono font-bold text-[#5A6B75]">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8E8] text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#18232B]/8 text-[#18232B] border border-[#18232B]/15">
                            {rowSite}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8E8] text-center font-mono text-[#18232B] whitespace-nowrap">
                          {row.tanggal}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8E8] font-semibold text-[#18232B]">
                          {row.nama}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8E8] text-center text-[#263640]">
                          {row.posisi}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8E8] text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${catMeta.badgeBg} ${catMeta.badgeText}`}
                          >
                            {catMeta.shortTitle}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8E8] text-center font-mono font-bold text-[#18232B]">
                          <button
                            type="button"
                            onClick={() =>
                              setUnitFilter((prev) =>
                                prev === row.jenis_unit ? 'ALL' : row.jenis_unit
                              )
                            }
                            className="hover:text-[#E88932] hover:underline cursor-pointer transition-colors"
                            title="Klik untuk memfilter jenis unit ini"
                          >
                            {row.jenis_unit}
                          </button>
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8E8] text-center font-mono text-[11px] text-[#263640]">
                          {row.keterangan}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8E8] text-center font-mono text-[11px] text-[#263640]">
                          {row.provider}
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8E8] text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#397C69]/12 text-[#296050] border border-[#397C69]/25 font-mono font-semibold text-[10px]">
                            {row.program}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 border-r border-[#E2E8E8] text-center font-medium text-[#18232B]">
                          {row.instructor}
                        </td>
                        {canEdit && (
                          <td className="px-2 py-1.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setEditOp({
                                    id: row.id,
                                    site: rowSite,
                                    _fromGenbaClass: isGenbaRow,
                                    category: row.category,
                                    tanggal: row.tanggal,
                                    nama: row.nama,
                                    posisi: row.posisi,
                                    jenis_unit: row.jenis_unit,
                                    keterangan: row.keterangan,
                                    provider: row.provider,
                                    program: row.program,
                                    instructor: row.instructor,
                                    period_label:
                                      row.period_label || CATEGORY_META[row.category].periodLabel,
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
                                  if (!window.confirm(`Hapus data "${row.nama}"?`)) return;
                                  if (isGenbaRow) {
                                    operationTrainerStore.updateState((prev) => ({
                                      ...prev,
                                      genbaClassRecords: prev.genbaClassRecords
                                        .filter((g) => g.id !== row.id)
                                        .map((g, i) => ({ ...g, no: i + 1 })),
                                    }));
                                    setGenbaTick((t) => t + 1);
                                  } else {
                                    mockStore.deleteSkillAuditOperatorRecord(userId, row.id);
                                  }
                                  onDone('Data peserta berhasil dihapus & grafik otomatis diperbarui.');
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
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Operator atau Driver */}
      <Modal
        open={!!editOp}
        title={
          editOp?.id
            ? 'Edit Data Peserta Skill Audit & Refresh'
            : 'Tambah Data Peserta Skill Audit & Refresh'
        }
        onClose={() => setEditOp(null)}
      >
        {editOp && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              try {
                if (editOp._fromGenbaClass) {
                  operationTrainerStore.updateState((prev) => ({
                    ...prev,
                    genbaClassRecords: prev.genbaClassRecords.map((g) =>
                      g.id === editOp.id
                        ? {
                            ...g,
                            site: editOp.site || 'Genba',
                            tanggal: editOp.tanggal,
                            nama: editOp.nama,
                            posisi: editOp.posisi,
                            unit: editOp.jenis_unit.toLowerCase().includes('manhaul')
                              ? 'MH'
                              : 'DT',
                            activitas: editOp.keterangan,
                            provider: editOp.provider,
                            instructor: editOp.instructor,
                          }
                        : g
                    ),
                  }));
                  setGenbaTick((t) => t + 1);
                  setEditOp(null);
                  onDone('Data peserta Training Class berhasil diperbarui.');
                  return;
                }
                mockStore.saveSkillAuditOperatorRecord(userId, editOp as any);
                setEditOp(null);
                onDone(
                  'Data peserta Skill Audit & Refresh berhasil disimpan. Seluruh grafik & tabel otomatis terupdate!'
                );
              } catch (err: any) {
                onError(err.message);
              }
            }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="col-span-2">
              <label className={labelCls}>Lokasi Site *</label>
              <select
                className={inputCls}
                value={editOp.site || (siteFilter !== 'ALL' ? siteFilter : 'Tangofa')}
                onChange={(e) =>
                  setEditOp({ ...editOp, site: e.target.value as TrainingSiteName })
                }
              >
                {TRAINING_SITE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Kategori Alat Berat / Unit *</label>
              <select
                className={inputCls}
                value={editOp.category}
                onChange={(e) => {
                  const newCat = e.target.value as SkillAuditCategoryCode;
                  const m = CATEGORY_META[newCat];
                  setEditOp({
                    ...editOp,
                    category: newCat,
                    posisi: m.defaultPosisi,
                    jenis_unit: m.unitOptions[0],
                    instructor: m.defaultInstructor,
                    period_label: m.periodLabel,
                  });
                }}
              >
                <option value="ADT">Operator ADT (HM400 / Volvo A40G)</option>
                <option value="EXCAVATOR">Operator Excavator (50T / 30T / 320T)</option>
                <option value="DOSER">Operator Doser (D85SS / D65)</option>
                <option value="DRIVER_DT">Driver DT Hauling (Domfeng / Hongyan)</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Jenis Unit *</label>
              <input
                required
                list="skill-audit-unit-list"
                className={inputCls}
                value={editOp.jenis_unit}
                onChange={(e) => setEditOp({ ...editOp, jenis_unit: e.target.value })}
              />
              <datalist id="skill-audit-unit-list">
                {CATEGORY_META[editOp.category].unitOptions.map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
            </div>

            <div>
              <label className={labelCls}>Tanggal Pelaksanaan *</label>
              <input
                required
                placeholder="Contoh: 4 Nov 2026 / 28 Oct 2026"
                className={inputCls}
                value={editOp.tanggal}
                onChange={(e) => setEditOp({ ...editOp, tanggal: e.target.value })}
              />
            </div>

            <div>
              <label className={labelCls}>Nama Operator / Driver *</label>
              <input
                required
                placeholder="Nama lengkap"
                className={inputCls}
                value={editOp.nama}
                onChange={(e) => setEditOp({ ...editOp, nama: e.target.value })}
              />
            </div>

            <div>
              <label className={labelCls}>Posisi *</label>
              <select
                className={inputCls}
                value={editOp.posisi}
                onChange={(e) => setEditOp({ ...editOp, posisi: e.target.value })}
              >
                <option value="Operator">Operator</option>
                <option value="Driver">Driver</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Instructor / Trainer *</label>
              <input
                required
                placeholder="Ekiopas Awang / Joni Sampe / Catur Ani / Fiktor"
                className={inputCls}
                value={editOp.instructor}
                onChange={(e) => setEditOp({ ...editOp, instructor: e.target.value })}
              />
            </div>

            <div>
              <label className={labelCls}>Keterangan</label>
              <input
                className={inputCls}
                value={editOp.keterangan}
                onChange={(e) => setEditOp({ ...editOp, keterangan: e.target.value })}
              />
            </div>

            <div>
              <label className={labelCls}>Program</label>
              <input
                className={inputCls}
                value={editOp.program}
                onChange={(e) => setEditOp({ ...editOp, program: e.target.value })}
              />
            </div>

            <div className="col-span-2 flex justify-end gap-2 pt-2 border-t border-[#E2E8E8]">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditOp(null)}>
                Batal
              </Button>
              <Button type="submit" size="sm" icon={<Save className="w-3.5 h-3.5" />}>
                Simpan
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal Tambah / Edit Baris Summary Heavy Equipment */}
      <Modal
        open={!!editSummary}
        title={
          editSummary?.id
            ? 'Edit Summary Refresh Heavy Equipment'
            : 'Tambah Jabatan Summary Refresh Heavy Equipment'
        }
        onClose={() => setEditSummary(null)}
      >
        {editSummary && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              try {
                const total = Number(editSummary.close_count) + Number(editSummary.open_count);
                const pct = total > 0 ? Math.round((Number(editSummary.close_count) / total) * 100) : 0;
                mockStore.saveSkillAuditSummaryRow(userId, {
                  id: editSummary.id,
                  jabatan: editSummary.jabatan,
                  close_count: Number(editSummary.close_count),
                  open_count: Number(editSummary.open_count),
                  total_karyawan: total,
                  percentage: pct,
                });
                setEditSummary(null);
                onDone('Summary Refresh Heavy Equipment berhasil diperbarui.');
              } catch (err: any) {
                onError(err.message);
              }
            }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="col-span-2">
              <label className={labelCls}>Jabatan *</label>
              <input
                required
                placeholder="Contoh: Operator ADT / Operator Excavator / Operator Buldozer"
                className={inputCls}
                value={editSummary.jabatan}
                onChange={(e) => setEditSummary({ ...editSummary, jabatan: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Jumlah CLOSE (Sudah Refresh) *</label>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={editSummary.close_count}
                onChange={(e) =>
                  setEditSummary({ ...editSummary, close_count: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className={labelCls}>Jumlah OPEN (Belum Refresh) *</label>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={editSummary.open_count}
                onChange={(e) =>
                  setEditSummary({ ...editSummary, open_count: Number(e.target.value) })
                }
              />
            </div>
            <div className="col-span-2 p-3 rounded-[8px] bg-[#F4F6F5] text-xs flex items-center justify-between">
              <span>Perhitungan Otomatis:</span>
              <span className="font-mono font-bold text-[#18232B]">
                Total Karyawan: {editSummary.close_count + editSummary.open_count} • Capaian:{' '}
                {editSummary.close_count + editSummary.open_count > 0
                  ? Math.round(
                      (editSummary.close_count /
                        (editSummary.close_count + editSummary.open_count)) *
                        100
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="col-span-2 flex justify-end gap-2 pt-2 border-t border-[#E2E8E8]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditSummary(null)}
              >
                Batal
              </Button>
              <Button type="submit" size="sm" icon={<Save className="w-3.5 h-3.5" />}>
                Simpan
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Lightbox Zoom (Selaras 100% dengan Assessment & Orientasi) */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewPhoto(null)}
              className="absolute -top-10 right-0 text-white hover:text-[#E88932] cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewPhoto.url}
              alt={previewPhoto.caption}
              className="max-w-full max-h-[82vh] rounded-xl object-contain border border-white/20"
            />
            {previewPhoto.caption && (
              <p className="text-xs text-slate-200 font-medium text-center mt-2.5">
                {previewPhoto.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Standalone View when accessed from Sidebar -> Training Achievement -> Program Skill Audit & Refresh Operator
export const SkillAuditRefreshOperatorView: React.FC = () => {
  const { currentUser, refreshState } = useAuth();
  const perms = getRolePermissions(currentUser.role_code);
  const canEdit = perms.trainingAchievement === 'EDIT' && perms.canEditData;
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  return (
    <div className="space-y-6 pb-10">
      {/* BLOK 1: DARK SLATE HERO HEADER (#18232B — Selaras dengan Assessment & Orientasi) */}
      <div className="relative overflow-hidden rounded-[14px] bg-[#18232B] text-white p-6 border border-[#263640] shadow-lg">
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 20%, #E88932 0%, transparent 50%), radial-gradient(circle at 85% 80%, #397C69 0%, transparent 50%)',
          }}
        />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#E88932]/20 text-[#E88932] border border-[#E88932]/40">
                <ShieldCheck className="w-3 h-3" />
                Operation Trainer Report
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-slate-300 bg-[#263640] border border-slate-700">
                <MapPin className="w-3 h-3 text-[#E88932]" />
                Semua Site (HO • Tangofa • Genba • Sampala • Gorontalo • Belopa • TPM) • Tahun 2026
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Program Skill Audit & Refresh Operator / Driver
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Monitoring & rekapitulasi aktual Refresh Operator ADT, Operator Excavator (Exa), Operator Doser, Driver DT Hauling & Refresh Class Site Genba, serta Summary Refresh Heavy Equipment.
            </p>
          </div>

          <div>
            {canEdit ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#397C69]/25 border border-[#397C69]/50 text-[#6CD4B4] text-xs font-mono font-semibold">
                Mode Akses: EDIT ({currentUser.role_name})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#263640] border border-slate-700 text-slate-300 text-xs font-mono font-semibold">
                <Lock className="w-3.5 h-3.5 text-[#E88932]" />
                <span>VIEW ONLY ({currentUser.role_name})</span>
              </span>
            )}
          </div>
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
            {toast.type === 'ok' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{toast.msg}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="cursor-pointer opacity-70 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <SkillAuditRefreshOperatorSection
        canEdit={canEdit}
        userId={currentUser.id}
        onDone={(msg) => {
          refreshState();
          setToast({ type: 'ok', msg: `${msg} Otomatis terintegrasi ke Capaian Training.` });
        }}
        onError={(msg) => setToast({ type: 'err', msg })}
      />
    </div>
  );
};
