import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { mockStore } from '../../../lib/mockStore';
import { uploadPhotoToCloud } from '../../../lib/supabase';
import { getRolePermissions } from '../../../lib/types';
import {
  operationTrainerStore,
  SimperAssessmentRecord,
  CrossAndSkillUpRecord,
  SiteGenbaRecord,
  OperationProgramStatus,
  TRAINING_SITE_OPTIONS,
  normalizeSiteName,
  INITIAL_SIMPER_PHOTOS,
  INITIAL_CROSS_PHOTOS,
  INITIAL_SKILL_UP_PHOTOS,
  INITIAL_GENBA_ASSESSMENT_PHOTOS,
} from '../../../lib/operationTrainerSeedData';
import { Button } from '../../ui/Button';
import {
  Modal,
  DonutChart,
  GroupedBarChart,
  exportCsv,
  printTable,
  inputCls,
  labelCls,
} from './shared';
import {
  Plus,
  Edit3,
  Trash2,
  Download,
  Printer,
  Search,
  Upload,
  X,
  ZoomIn,
  ShieldCheck,
  Award,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  Clock,
  Layers,
  Filter,
  Sparkles,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

type ActiveTab = 'SIMPER' | 'CROSS_TRAINING' | 'SKILL_UP';

const STATUS_BADGE_STYLE: Record<OperationProgramStatus, string> = {
  CLOSE: 'bg-[#397C69]/12 text-[#296050] border-[#397C69]/30',
  'ON PROGRESS': 'bg-[#E88932]/15 text-[#B86318] border-[#E88932]/35',
  ORIENTASI: 'bg-[#527FA1]/15 text-[#365D7A] border-[#527FA1]/35',
  'ON SCHEDULE': 'bg-sky-50 text-sky-700 border-sky-200',
  HOLD: 'bg-[#D5A33D]/15 text-[#8A6A1F] border-[#D5A33D]/35',
  CANCEL: 'bg-[#B94C45]/12 text-[#94352F] border-[#B94C45]/30',
};

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

export const AssessmentCrossSkillUpView: React.FC = () => {
  const { currentUser, refreshState } = useAuth();
  const perms = getRolePermissions(currentUser.role_code);
  const canEdit = perms.trainingAchievement === 'EDIT' && perms.canEditData;

  const [, setVersion] = useState(0);
  const bump = () => {
    setVersion((v) => v + 1);
    refreshState();
  };

  useEffect(() => {
    const unsubMock = mockStore.subscribe(() => setVersion((v) => v + 1));
    const unsubOp = operationTrainerStore.subscribe(() => setVersion((v) => v + 1));
    return () => {
      unsubMock();
      unsubOp();
    };
  }, []);

  const state = operationTrainerStore.getState();

  const [activeTab, setActiveTab] = useState<ActiveTab>('SIMPER');
  const [siteFilter, setSiteFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [assessPage, setAssessPage] = useState(1);
  const [showAllAssess, setShowAllAssess] = useState(false);
  const assessPageSize = 25;
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Modals for Unified Assessment (Tangofa SIMPER + Site Genba Assessment)
  const [editingAssessSource, setEditingAssessSource] = useState<{
    source: 'SIMPER' | 'GENBA';
    id: string;
    prevActual: number;
  } | null>(null);
  const [showSimperModal, setShowSimperModal] = useState(false);
  const [simperForm, setSimperForm] = useState({
    tanggal: '4-Nov-26',
    actual: 1,
    kandidatNama: '',
    posisi: 'Driver',
    unit: '1x Tes Praktek pada unit LV',
    ket: 'INTERNAL PT RJS',
    instructor: 'Yusran yusuf',
    status: 'CLOSE' as 'CLOSE' | 'ON PROGRESS',
    site: 'Tangofa',
  });
  const [showEditYtdModal, setShowEditYtdModal] = useState(false);
  const [ytdInput, setYtdInput] = useState(state.simperCumulativeYtd);

  // Modals for Cross Training & Skill Up
  const [editingCrossSkill, setEditingCrossSkill] = useState<CrossAndSkillUpRecord | null>(null);
  const [showCrossSkillModal, setShowCrossSkillModal] = useState(false);
  const [csForm, setCsForm] = useState<Omit<CrossAndSkillUpRecord, 'id' | 'no'>>({
    programType: 'CROSS_TRAINING',
    nik: '',
    nama: '',
    dept: 'MOD',
    jabatanAwal: 'Operator Excavator',
    jabatanTarget: 'Operator Rock Breaker',
    pengajuanSimperUnit: 'Breaker',
    classTrainingDate: '-',
    assessmentDate: '-',
    startOrientasiDate: '-',
    finalAssessmentDate: '-',
    kategoriKet: 'Similar',
    status: 'ON PROGRESS',
    keteranganStatus: 'SIMPER DONE',
    pic: 'TC',
    catatanTambahan: '',
    site: 'Tangofa',
  });

  // Current Tab Photos (Site-aware for Assessment tab!)
  const currentPhotos =
    activeTab === 'SIMPER'
      ? siteFilter === 'Genba'
        ? state.genbaAssessmentPhotos
        : siteFilter === 'Tangofa'
        ? state.simperPhotos
        : [...state.simperPhotos, ...state.genbaAssessmentPhotos]
      : activeTab === 'CROSS_TRAINING'
      ? state.crossPhotos
      : state.skillUpPhotos;

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    try {
      const compressedUrls = await Promise.all(files.map((f) => compressImageFile(f)));
      const folder =
        activeTab === 'SIMPER'
          ? siteFilter === 'Genba'
            ? 'assessment-genba'
            : 'assessment-simper'
          : activeTab === 'CROSS_TRAINING'
          ? 'cross-training'
          : 'skill-up';
      const cloudUrls = await Promise.all(compressedUrls.map((u) => uploadPhotoToCloud(u, folder)));
      operationTrainerStore.updateState((prev) => {
        if (activeTab === 'SIMPER') {
          if (siteFilter === 'Genba') {
            return {
              ...prev,
              genbaAssessmentPhotos: [...cloudUrls, ...prev.genbaAssessmentPhotos],
            };
          }
          return { ...prev, simperPhotos: [...cloudUrls, ...prev.simperPhotos] };
        }
        if (activeTab === 'CROSS_TRAINING') {
          return { ...prev, crossPhotos: [...cloudUrls, ...prev.crossPhotos] };
        }
        return { ...prev, skillUpPhotos: [...cloudUrls, ...prev.skillUpPhotos] };
      });
      bump();
    } finally {
      e.target.value = '';
    }
  };

  const handleDeletePhoto = (idx: number) => {
    const removedUrl = currentPhotos[idx];
    operationTrainerStore.updateState(
      (prev) => {
        if (activeTab === 'SIMPER') {
          if (siteFilter === 'Genba') {
            return {
              ...prev,
              genbaAssessmentPhotos: prev.genbaAssessmentPhotos.filter((_, i) => i !== idx),
            };
          }
          if (siteFilter === 'ALL' && idx >= prev.simperPhotos.length) {
            const genbaIdx = idx - prev.simperPhotos.length;
            return {
              ...prev,
              genbaAssessmentPhotos: prev.genbaAssessmentPhotos.filter((_, i) => i !== genbaIdx),
            };
          }
          return { ...prev, simperPhotos: prev.simperPhotos.filter((_, i) => i !== idx) };
        }
        if (activeTab === 'CROSS_TRAINING') {
          return { ...prev, crossPhotos: prev.crossPhotos.filter((_, i) => i !== idx) };
        }
        return { ...prev, skillUpPhotos: prev.skillUpPhotos.filter((_, i) => i !== idx) };
      },
      { deletedPhotoUrl: removedUrl }
    );
    bump();
  };

  const handleResetPhotos = () => {
    const resetPhotoKey =
      activeTab === 'SIMPER'
        ? 'OP_simperPhotos'
        : activeTab === 'CROSS_TRAINING'
        ? 'OP_crossPhotos'
        : 'OP_skillUpPhotos';
    operationTrainerStore.updateState(
      (prev) => {
        if (activeTab === 'SIMPER') {
          return {
            ...prev,
            simperPhotos: [...INITIAL_SIMPER_PHOTOS],
            genbaAssessmentPhotos: [...INITIAL_GENBA_ASSESSMENT_PHOTOS],
          };
        }
        if (activeTab === 'CROSS_TRAINING') {
          return { ...prev, crossPhotos: [...INITIAL_CROSS_PHOTOS] };
        }
        return { ...prev, skillUpPhotos: [...INITIAL_SKILL_UP_PHOTOS] };
      },
      { resetPhotoKey }
    );
    bump();
  };

  // Unified Assessment Rows (Tangofa SIMPER + Genba 157x Assessment, Orientasi & Refresh)
  const allAssessmentRows = useMemo(() => {
    const tangofaRows = state.simperAssessments.map((r) => ({
      id: r.id,
      source: 'SIMPER' as const,
      tanggal: r.tanggal,
      site: normalizeSiteName(r.site, 'Tangofa'),
      actual: Number(r.actual) || 1,
      kandidatNama: r.kandidatNama,
      posisi: 'Kandidat SIMPER',
      unit: r.unit,
      rawUnit: r.unit,
      rawActivitas: r.unit,
      ket: r.ket,
      instructor: 'Operation Trainer TC',
      status: r.status,
    }));

    const gembaRows = state.genbaAssessmentRecords.map((r: SiteGenbaRecord) => ({
      id: r.id,
      source: 'GENBA' as const,
      tanggal: r.tanggal,
      site: normalizeSiteName(r.site, 'Genba'),
      actual: 1,
      kandidatNama: r.nama,
      posisi: r.posisi,
      unit: `${r.unit} — ${r.activitas}`,
      rawUnit: r.unit,
      rawActivitas: r.activitas,
      ket: `${r.perusahaan} • Inst: ${r.instructor}`,
      instructor: r.instructor,
      status: (r.status === 'Done' ? 'CLOSE' : 'ON PROGRESS') as 'CLOSE' | 'ON PROGRESS',
    }));

    return [...tangofaRows, ...gembaRows];
  }, [state.simperAssessments, state.genbaAssessmentRecords]);

  const filteredSimper = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allAssessmentRows.filter((r) => {
      if (siteFilter !== 'ALL' && r.site !== siteFilter) return false;
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.tanggal.toLowerCase().includes(q) ||
        r.kandidatNama.toLowerCase().includes(q) ||
        r.posisi.toLowerCase().includes(q) ||
        r.unit.toLowerCase().includes(q) ||
        r.ket.toLowerCase().includes(q) ||
        r.site.toLowerCase().includes(q)
      );
    });
  }, [allAssessmentRows, siteFilter, searchQuery, statusFilter]);

  const totalAssessPages = Math.max(1, Math.ceil(filteredSimper.length / assessPageSize));
  const paginatedAssessRows = useMemo(() => {
    if (showAllAssess) return filteredSimper;
    const start = (assessPage - 1) * assessPageSize;
    return filteredSimper.slice(start, start + assessPageSize);
  }, [filteredSimper, assessPage, showAllAssess]);

  const simperWeeklySum = useMemo(
    () =>
      state.simperAssessments.reduce((s, r) => s + (Number(r.actual) || 0), 0),
    [state.simperAssessments]
  );
  const gembaAssessCount = state.genbaAssessmentRecords.length;
  const combinedAssessmentTotal =
    siteFilter === 'Genba'
      ? gembaAssessCount
      : siteFilter === 'Tangofa'
      ? state.simperCumulativeYtd
      : state.simperCumulativeYtd + gembaAssessCount;

  // Filtered Cross / Skill Up rows
  const activeCrossOrSkillUpRows =
    activeTab === 'CROSS_TRAINING' ? state.crossTrainingRecords : state.skillUpRecords;

  const siteFilteredCrossOrSkillUpRows = useMemo(
    () =>
      activeCrossOrSkillUpRows.filter(
        (r) => siteFilter === 'ALL' || normalizeSiteName(r.site, 'Tangofa') === siteFilter
      ),
    [activeCrossOrSkillUpRows, siteFilter]
  );

  const filteredCrossOrSkillUp = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return siteFilteredCrossOrSkillUpRows.filter((r) => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.nik.toLowerCase().includes(q) ||
        r.nama.toLowerCase().includes(q) ||
        r.jabatanAwal.toLowerCase().includes(q) ||
        r.jabatanTarget.toLowerCase().includes(q) ||
        r.pengajuanSimperUnit.toLowerCase().includes(q) ||
        r.catatanTambahan.toLowerCase().includes(q) ||
        (r.site || 'Tangofa').toLowerCase().includes(q)
      );
    });
  }, [siteFilteredCrossOrSkillUpRows, searchQuery, statusFilter]);

  // Matrix summary for Cross Training / Skill Up
  const matrixSummary = useMemo(() => {
    const base =
      activeTab === 'CROSS_TRAINING' ? state.crossMatrixSummary : state.skillUpMatrixSummary;
    const rows = siteFilteredCrossOrSkillUpRows;
    const isAllSites = siteFilter === 'ALL';
    const countBy = (st: OperationProgramStatus) => rows.filter((r) => r.status === st).length;
    return [
      { key: 'CLOSE', label: 'CLOSE (Selesai)', value: isAllSites ? Math.max(base.CLOSE, countBy('CLOSE')) : countBy('CLOSE'), color: '#397C69' },
      { key: 'ON PROGRESS', label: 'ON PROGRESS', value: isAllSites ? Math.max(base.ON_PROGRESS, countBy('ON PROGRESS')) : countBy('ON PROGRESS'), color: '#E88932' },
      { key: 'ORIENTASI', label: 'ORIENTASI FIELD', value: isAllSites ? Math.max(base.ORIENTASI, countBy('ORIENTASI')) : countBy('ORIENTASI'), color: '#527FA1' },
      { key: 'ON SCHEDULE', label: 'ON SCHEDULE', value: isAllSites ? Math.max(base.ON_SCHEDULE, countBy('ON SCHEDULE')) : countBy('ON SCHEDULE'), color: '#0284C7' },
      { key: 'HOLD', label: 'HOLD', value: isAllSites ? Math.max(base.HOLD, countBy('HOLD')) : countBy('HOLD'), color: '#D5A33D' },
      { key: 'CANCEL', label: 'CANCEL / RESIGN', value: isAllSites ? Math.max(base.CANCEL, countBy('CANCEL')) : countBy('CANCEL'), color: '#B94C45' },
    ];
  }, [activeTab, siteFilter, state.crossMatrixSummary, state.skillUpMatrixSummary, siteFilteredCrossOrSkillUpRows]);

  const totalMatrixCount = useMemo(
    () => matrixSummary.reduce((s, item) => s + item.value, 0),
    [matrixSummary]
  );

  // Handlers for Unified Assessment CRUD
  const openAddSimper = () => {
    setEditingAssessSource(null);
    const defaultSite = siteFilter !== 'ALL' ? siteFilter : 'Tangofa';
    setSimperForm({
      tanggal: '5-Nov-26',
      actual: 1,
      kandidatNama: '',
      posisi: defaultSite === 'Genba' ? 'Candidate' : 'Kandidat SIMPER',
      unit:
        defaultSite === 'Genba'
          ? 'DT — Assessment candidate driver DT'
          : '1x Tes Praktek pada unit LV',
      ket: defaultSite === 'Genba' ? 'RJS / Subcont' : 'INTERNAL PT RJS',
      instructor: 'Yusran yusuf',
      status: 'CLOSE',
      site: defaultSite,
    });
    setShowSimperModal(true);
  };

  const openEditSimper = (row: (typeof allAssessmentRows)[number]) => {
    setEditingAssessSource({
      source: row.source,
      id: row.id,
      prevActual: row.actual,
    });
    setSimperForm({
      tanggal: row.tanggal,
      actual: row.actual,
      kandidatNama: row.kandidatNama,
      posisi: row.posisi,
      unit: row.unit,
      ket: row.ket,
      instructor: row.instructor,
      status: row.status,
      site: row.site,
    });
    setShowSimperModal(true);
  };

  const handleSaveSimper = (e: React.FormEvent) => {
    e.preventDefault();
    const isGenbaTarget =
      editingAssessSource?.source === 'GENBA' ||
      (!editingAssessSource && simperForm.site === 'Genba');

    if (isGenbaTarget) {
      const [unitPart, ...actParts] = simperForm.unit.split('—');
      const cleanUnit = (unitPart || 'DT').trim();
      const cleanAct = actParts.join('—').trim() || simperForm.unit;
      operationTrainerStore.updateState((prev) => {
        if (editingAssessSource) {
          return {
            ...prev,
            genbaAssessmentRecords: prev.genbaAssessmentRecords.map((r) =>
              r.id === editingAssessSource.id
                ? {
                    ...r,
                    site: simperForm.site,
                    tanggal: simperForm.tanggal,
                    nama: simperForm.kandidatNama,
                    posisi: simperForm.posisi || 'Driver',
                    unit: cleanUnit,
                    activitas: cleanAct,
                    perusahaan: simperForm.ket,
                    instructor: simperForm.instructor || 'Yusran yusuf',
                    status: simperForm.status === 'CLOSE' ? 'Done' : 'On Going',
                  }
                : r
            ),
          };
        }
        return {
          ...prev,
          genbaAssessmentRecords: [
            ...prev.genbaAssessmentRecords,
            {
              id: `genba-ass-${Date.now()}`,
              no: prev.genbaAssessmentRecords.length + 1,
              site: simperForm.site,
              category: 'ASSESSMENT_REFRESH',
              tanggal: simperForm.tanggal,
              nama: simperForm.kandidatNama,
              posisi: simperForm.posisi || 'Candidate',
              unit: cleanUnit,
              dept: 'MOD',
              provider: 'TC',
              activitas: cleanAct,
              instructor: simperForm.instructor || 'Yusran yusuf',
              perusahaan: simperForm.ket || 'RJS / Subcont',
              status: simperForm.status === 'CLOSE' ? 'Done' : 'On Going',
            },
          ],
        };
      });
      setShowSimperModal(false);
      bump();
      return;
    }

    operationTrainerStore.updateState((prev) => {
      if (editingAssessSource) {
        const diff = Number(simperForm.actual) - Number(editingAssessSource.prevActual);
        return {
          ...prev,
          simperCumulativeYtd: Math.max(0, prev.simperCumulativeYtd + diff),
          simperAssessments: prev.simperAssessments.map((r) =>
            r.id === editingAssessSource.id
              ? {
                  ...r,
                  tanggal: simperForm.tanggal,
                  actual: Number(simperForm.actual) || 1,
                  kandidatNama: simperForm.kandidatNama,
                  unit: simperForm.unit,
                  ket: simperForm.ket,
                  status: simperForm.status,
                  site: simperForm.site,
                }
              : r
          ),
        };
      }
      const nextNo = prev.simperAssessments.length + 1;
      const newRec: SimperAssessmentRecord = {
        id: `simper-${Date.now()}`,
        no: nextNo,
        tanggal: simperForm.tanggal,
        actual: Number(simperForm.actual) || 1,
        kandidatNama: simperForm.kandidatNama,
        unit: simperForm.unit,
        ket: simperForm.ket,
        status: simperForm.status,
        site: simperForm.site,
        photos: [],
      };
      return {
        ...prev,
        simperCumulativeYtd: prev.simperCumulativeYtd + newRec.actual,
        simperAssessments: [...prev.simperAssessments, newRec],
      };
    });
    setShowSimperModal(false);
    bump();
  };

  const handleDeleteSimper = (row: (typeof allAssessmentRows)[number]) => {
    if (row.source === 'GENBA') {
      operationTrainerStore.updateState((prev) => ({
        ...prev,
        genbaAssessmentRecords: prev.genbaAssessmentRecords
          .filter((r) => r.id !== row.id)
          .map((r, i) => ({ ...r, no: i + 1 })),
      }));
      bump();
      return;
    }
    operationTrainerStore.updateState((prev) => {
      const target = prev.simperAssessments.find((r) => r.id === row.id);
      const next = prev.simperAssessments
        .filter((r) => r.id !== row.id)
        .map((r, i) => ({ ...r, no: i + 1 }));
      return {
        ...prev,
        simperCumulativeYtd: Math.max(0, prev.simperCumulativeYtd - (target?.actual || 0)),
        simperAssessments: next,
      };
    });
    bump();
  };

  // Handlers for Cross Training & Skill Up CRUD
  const openAddCrossSkill = () => {
    setEditingCrossSkill(null);
    const isCross = activeTab === 'CROSS_TRAINING';
    setCsForm({
      programType: isCross ? 'CROSS_TRAINING' : 'SKILL_UP',
      nik: '',
      nama: '',
      dept: 'MOD',
      jabatanAwal: isCross ? 'Operator Excavator' : 'Driver DT 10 R',
      jabatanTarget: isCross ? 'Operator Rock Breaker' : 'Driver DT 12 R',
      pengajuanSimperUnit: isCross ? 'Breaker' : 'DT 12 R',
      classTrainingDate: '4 November 2026',
      assessmentDate: '4 November 2026',
      startOrientasiDate: '-',
      finalAssessmentDate: '-',
      kategoriKet: isCross ? 'Similar' : 'SKILL UP',
      status: 'ON PROGRESS',
      keteranganStatus: 'ON PROGRESS',
      pic: 'TC',
      catatanTambahan: '',
      site: siteFilter !== 'ALL' ? siteFilter : 'Tangofa',
    });
    setShowCrossSkillModal(true);
  };

  const openEditCrossSkill = (row: CrossAndSkillUpRecord) => {
    setEditingCrossSkill(row);
    setCsForm({
      programType: row.programType,
      nik: row.nik,
      nama: row.nama,
      dept: row.dept,
      jabatanAwal: row.jabatanAwal,
      jabatanTarget: row.jabatanTarget,
      pengajuanSimperUnit: row.pengajuanSimperUnit,
      classTrainingDate: row.classTrainingDate,
      assessmentDate: row.assessmentDate,
      startOrientasiDate: row.startOrientasiDate,
      finalAssessmentDate: row.finalAssessmentDate,
      kategoriKet: row.kategoriKet,
      status: row.status,
      keteranganStatus: row.keteranganStatus,
      pic: row.pic,
      catatanTambahan: row.catatanTambahan,
      site: row.site || 'Tangofa',
    });
    setShowCrossSkillModal(true);
  };

  const handleSaveCrossSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const isCross = activeTab === 'CROSS_TRAINING';
    operationTrainerStore.updateState((prev) => {
      const listKey = isCross ? 'crossTrainingRecords' : 'skillUpRecords';
      const currentList = prev[listKey];
      if (editingCrossSkill) {
        return {
          ...prev,
          [listKey]: currentList.map((r) =>
            r.id === editingCrossSkill.id ? { ...r, ...csForm } : r
          ),
        };
      }
      const newRec: CrossAndSkillUpRecord = {
        id: `${isCross ? 'ct' : 'su'}-${Date.now()}`,
        no: currentList.length + 1,
        ...csForm,
        programType: isCross ? 'CROSS_TRAINING' : 'SKILL_UP',
      };
      return {
        ...prev,
        [listKey]: [...currentList, newRec],
      };
    });
    setShowCrossSkillModal(false);
    bump();
  };

  const handleDeleteCrossSkill = (id: string) => {
    const isCross = activeTab === 'CROSS_TRAINING';
    operationTrainerStore.updateState((prev) => {
      const listKey = isCross ? 'crossTrainingRecords' : 'skillUpRecords';
      const next = prev[listKey]
        .filter((r) => r.id !== id)
        .map((r, i) => ({ ...r, no: i + 1 }));
      return { ...prev, [listKey]: next };
    });
    bump();
  };

  // Export CSV / Print PDF
  const handleExportCsv = () => {
    if (activeTab === 'SIMPER') {
      exportCsv(
        'assessment_operator_driver_2026',
        ['No', 'Site', 'Tanggal', 'Actual', 'Kandidat / Peserta', 'Posisi', 'Unit & Aktivitas', 'Keterangan', 'Status'],
        filteredSimper.map((r, idx) => [
          idx + 1,
          r.site,
          r.tanggal,
          r.actual,
          r.kandidatNama,
          r.posisi,
          r.unit,
          r.ket,
          r.status,
        ])
      );
      return;
    }
    exportCsv(
      activeTab === 'CROSS_TRAINING' ? 'cross_training_operator_2026' : 'skill_up_operator_2026',
      [
        'No',
        'Site',
        'NIK',
        'Nama',
        'Dept',
        'Jabatan 1 (Awal)',
        'Jabatan 2 (Target)',
        'Unit SIMPER',
        'Class Training',
        'Assessment',
        'Start Orientasi',
        'Final Assessment',
        'Kategori',
        'Status',
        'Keterangan Status',
        'PIC',
        'Catatan',
      ],
      filteredCrossOrSkillUp.map((r) => [
        r.no,
        r.site || 'Tangofa',
        r.nik,
        r.nama,
        r.dept,
        r.jabatanAwal,
        r.jabatanTarget,
        r.pengajuanSimperUnit,
        r.classTrainingDate,
        r.assessmentDate,
        r.startOrientasiDate,
        r.finalAssessmentDate,
        r.kategoriKet,
        r.status,
        r.keteranganStatus,
        r.pic,
        r.catatanTambahan,
      ])
    );
  };

  const handlePrintPdf = () => {
    if (activeTab === 'SIMPER') {
      printTable(
        `ASSESSMENT OPERATOR & DRIVER (${siteFilter === 'ALL' ? 'SEMUA SITE' : siteFilter.toUpperCase()} • Total: ${combinedAssessmentTotal})`,
        ['No', 'Site', 'Tanggal', 'Actual', 'Kandidat / Peserta', 'Unit & Aktivitas', 'Keterangan', 'Status'],
        filteredSimper.map((r, idx) => [
          idx + 1,
          r.site,
          r.tanggal,
          r.actual,
          r.kandidatNama,
          r.unit,
          r.ket,
          r.status,
        ])
      );
      return;
    }
    printTable(
      activeTab === 'CROSS_TRAINING'
        ? 'CROSS SKILL & SIMILAR TRAINING REPORT (JANUARI - NOVEMBER 2026)'
        : 'SKILL UP TRAINING OPERATOR & DRIVER REPORT (JANUARI - NOVEMBER 2026)',
      [
        'No',
        'Site',
        'NIK',
        'Nama',
        'Dept',
        'Jabatan Awal',
        'Jabatan Target',
        'Unit SIMPER',
        'Class',
        'Assessment',
        'Orientasi',
        'Final',
        'Status',
        'PIC',
        'Catatan',
      ],
      filteredCrossOrSkillUp.map((r) => [
        r.no,
        r.site || 'Tangofa',
        r.nik,
        r.nama,
        r.dept,
        r.jabatanAwal,
        r.jabatanTarget,
        r.pengajuanSimperUnit,
        r.classTrainingDate,
        r.assessmentDate,
        r.startOrientasiDate,
        r.finalAssessmentDate,
        r.status,
        r.pic,
        r.catatanTambahan,
      ])
    );
  };

  return (
    <div className="space-y-6 pb-10">
      {/* BLOK 1: DARK SLATE HERO HEADER (#18232B) */}
      <div className="relative overflow-hidden rounded-[14px] bg-[#18232B] text-white p-6 border border-[#263640] shadow-lg">
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, #E88932 0%, transparent 50%), radial-gradient(circle at 80% 80%, #527FA1 0%, transparent 50%)',
          }}
        />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#E88932]/20 text-[#E88932] border border-[#E88932]/40">
                <Award className="w-3 h-3" />
                Training Achievement • Kompetensi & Lisensi Operator
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-slate-300 bg-[#263640] border border-slate-700">
                <MapPin className="w-3 h-3 text-[#E88932]" />
                {siteFilter === 'ALL'
                  ? 'Semua Lokasi Site (HO • Tangofa • Genba • Sampala • Gorontalo • Belopa • TPM)'
                  : siteFilter}{' '}
                • Periode 2026
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Assessment Operator & Driver, Cross Training & Skill Up
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Monitoring terpadu ujian praktek SIMPER & Assessment lapangan Operator/Driver (RJS & Subcont di seluruh Site), program Cross Training & Similar, serta Skill Up Operator & Driver.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[9px] text-xs font-semibold bg-[#263640] text-white border border-slate-600 hover:bg-[#324653] transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-[#E88932]" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={handlePrintPdf}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[9px] text-xs font-semibold bg-[#263640] text-white border border-slate-600 hover:bg-[#324653] transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#E88932]" />
              <span>Print / PDF</span>
            </button>
            {canEdit && (
              <Button
                variant="primary"
                size="sm"
                onClick={activeTab === 'SIMPER' ? openAddSimper : openAddCrossSkill}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                + Tambah Data
              </Button>
            )}
          </div>
        </div>

        {/* Category Tabs & Site Filter inside Hero */}
        <div className="relative z-10 mt-5 pt-4 border-t border-[#263640] flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('SIMPER');
                setStatusFilter('ALL');
                setSearchQuery('');
                setAssessPage(1);
              }}
              className={`px-3.5 py-2 rounded-[9px] text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'SIMPER'
                  ? 'bg-[#E88932] text-white shadow-sm'
                  : 'bg-[#263640]/80 text-slate-300 hover:text-white hover:bg-[#263640]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Assessment Operator & Driver</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/25 text-white">
                Total: {combinedAssessmentTotal}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('CROSS_TRAINING');
                setStatusFilter('ALL');
                setSearchQuery('');
              }}
              className={`px-3.5 py-2 rounded-[9px] text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'CROSS_TRAINING'
                  ? 'bg-[#E88932] text-white shadow-sm'
                  : 'bg-[#263640]/80 text-slate-300 hover:text-white hover:bg-[#263640]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Cross Training & Similar Operator</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/25 text-white">
                {siteFilteredCrossOrSkillUpRows.length || state.crossTrainingRecords.length} Baris
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('SKILL_UP');
                setStatusFilter('ALL');
                setSearchQuery('');
              }}
              className={`px-3.5 py-2 rounded-[9px] text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'SKILL_UP'
                  ? 'bg-[#E88932] text-white shadow-sm'
                  : 'bg-[#263640]/80 text-slate-300 hover:text-white hover:bg-[#263640]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Skill Up Training Operator & Driver</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/25 text-white">
                {activeTab === 'SKILL_UP' ? siteFilteredCrossOrSkillUpRows.length : state.skillUpRecords.length} Baris
              </span>
            </button>
          </div>

          {/* Site Location Selector */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#263640]/90 p-1.5 rounded-[10px] border border-slate-700">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 px-2 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#E88932]" /> Filter Site:
            </span>
            {(['ALL', ...TRAINING_SITE_OPTIONS] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSiteFilter(s);
                  setAssessPage(1);
                }}
                className={`px-2.5 py-1 rounded-[7px] text-[11px] font-semibold transition-all cursor-pointer ${
                  siteFilter === s
                    ? 'bg-[#E88932] text-white shadow-2xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {s === 'ALL' ? 'Semua Site' : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Highlight Banner for Cross Training */}
      {activeTab === 'CROSS_TRAINING' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3.5 rounded-[10px] bg-white border border-slate-200/80 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-[#E88932]/15 text-[#E88932] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Highlight Program Berjalan #1
              </div>
              <div className="text-xs font-bold text-[#18232B]">
                2x Operator Training ke Unit Buldozer — Status: On Going (Orientasi Field)
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3.5 rounded-[10px] bg-white border border-slate-200/80 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-[#397C69]/15 text-[#397C69] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Highlight Program Berjalan #2
              </div>
              <div className="text-xs font-bold text-[#18232B]">
                12x Operator Excavator Familiarisasi ke Rock Breaker: 9x Done, 3x Menunggu SIMPER
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BLOK 2: 3 KOTAK RINGKASAN SEJAJAR (EQUAL HEIGHT ITEMS-STRETCH) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* KOTAK KIRI: TABEL RINGKASAN STATUS / SITE */}
        <div className="lg:col-span-4 bg-white rounded-[12px] border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#18232B]">
                  {activeTab === 'SIMPER'
                    ? siteFilter === 'Genba'
                      ? 'Rekap Assessment Operator & Driver (Site Genba)'
                      : siteFilter === 'Tangofa'
                      ? 'Rekap Assessment SIMPER (Site Tangofa)'
                      : 'Rekap Assessment Operator & Driver per Site'
                    : activeTab === 'CROSS_TRAINING'
                    ? 'Rekap Status Cross Skill (Jan–Nov 2026)'
                    : 'Rekap Status Skill Up (Jan–Nov 2026)'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Klik baris untuk memfilter tabel peserta di bawah
                </p>
              </div>
              {activeTab === 'SIMPER' && siteFilter !== 'Genba' && canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setYtdInput(state.simperCumulativeYtd);
                    setShowEditYtdModal(true);
                  }}
                  className="text-[11px] font-semibold text-[#E88932] hover:underline cursor-pointer"
                >
                  Edit YTD Tangofa
                </button>
              )}
            </div>

            {activeTab === 'SIMPER' ? (
              siteFilter === 'Genba' ? (
                <div className="overflow-hidden rounded-[9px] border border-slate-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#18232B] text-white text-[10px] font-mono uppercase">
                        <th className="py-2.5 px-3">Kategori Posisi (Site Genba)</th>
                        <th className="py-2.5 px-3 text-right">Peserta</th>
                        <th className="py-2.5 px-3 text-right">%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs">
                      {(['Candidate', 'Driver', 'New Hire'] as const).map((pos) => {
                        const cnt = state.genbaAssessmentRecords.filter((r) => r.posisi === pos).length;
                        const pct = gembaAssessCount > 0 ? Math.round((cnt / gembaAssessCount) * 100) : 0;
                        return (
                          <tr
                            key={pos}
                            onClick={() => setSearchQuery((prev) => (prev === pos ? '' : pos))}
                            className="hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <td className="py-2.5 px-3 font-semibold text-[#18232B]">{pos}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-[#18232B]">
                              {cnt}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-500">{pct}%</td>
                          </tr>
                        );
                      })}
                      <tr className="bg-[#18232B] text-white font-bold text-xs">
                        <td className="py-2.5 px-3">TOTAL ASSESSMENT SITE GEMBA</td>
                        <td className="py-2.5 px-3 text-right font-mono text-sm text-[#E88932]">
                          {gembaAssessCount}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-400">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : siteFilter === 'ALL' ? (
                <div className="overflow-hidden rounded-[9px] border border-slate-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#18232B] text-white text-[10px] font-mono uppercase">
                        <th className="py-2.5 px-3">Lokasi Site (Klik Filter)</th>
                        <th className="py-2.5 px-3">Fokus Assessment</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs">
                      <tr
                        onClick={() => setSiteFilter('Tangofa')}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-3 font-semibold text-[#18232B]">Site Tangofa</td>
                        <td className="py-2.5 px-3 text-slate-600">Uji Praktek SIMPER YTD</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#18232B]">
                          {state.simperCumulativeYtd}
                        </td>
                      </tr>
                      <tr
                        onClick={() => setSiteFilter('Genba')}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-3 font-semibold text-[#18232B]">Site Genba</td>
                        <td className="py-2.5 px-3 text-slate-600">Assessment RJS & Subcont</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#18232B]">
                          {gembaAssessCount}
                        </td>
                      </tr>
                      <tr className="bg-slate-50 font-semibold text-xs">
                        <td className="py-2 px-3 text-slate-600" colSpan={2}>
                          Minggu Berjalan Tangofa (W1 Nov 2026)
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-[#527FA1]">
                          {simperWeeklySum}
                        </td>
                      </tr>
                      <tr className="bg-[#18232B] text-white font-bold text-xs">
                        <td className="py-2.5 px-3" colSpan={2}>
                          GRAND TOTAL ASSESSMENT SEMUA SITE
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-sm text-[#E88932]">
                          {combinedAssessmentTotal}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-hidden rounded-[9px] border border-slate-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#18232B] text-white text-[10px] font-mono uppercase">
                        <th className="py-2.5 px-3">Tanggal / Periode</th>
                        <th className="py-2.5 px-3">Unit Uji Praktek</th>
                        <th className="py-2.5 px-3 text-right">Actual</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs">
                      {state.simperAssessments.map((r) => (
                        <tr
                          key={r.id}
                          onClick={() => setSearchQuery(r.tanggal)}
                          className="hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <td className="py-2.5 px-3 font-semibold text-[#18232B]">{r.tanggal}</td>
                          <td className="py-2.5 px-3 text-slate-600 truncate max-w-[160px]">{r.unit}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-[#18232B]">
                            {r.actual}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-semibold text-xs">
                        <td className="py-2 px-3 text-slate-600" colSpan={2}>
                          Total Mingguan Terdaftar (W1 Nov 2026)
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-[#527FA1]">
                          {simperWeeklySum}
                        </td>
                      </tr>
                      <tr className="bg-[#18232B] text-white font-bold text-xs">
                        <td className="py-2.5 px-3" colSpan={2}>
                          TOTAL KUMULATIF YTD TANGOFA
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-sm text-[#E88932]">
                          {state.simperCumulativeYtd}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <div className="overflow-hidden rounded-[9px] border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#18232B] text-white text-[10px] font-mono uppercase">
                      <th className="py-2 px-3">Status Program (Klik Filter)</th>
                      <th className="py-2 px-3 text-right">Total</th>
                      <th className="py-2 px-3 text-right">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {matrixSummary.map((item) => {
                      const pct =
                        totalMatrixCount > 0
                          ? Math.round((item.value / totalMatrixCount) * 100)
                          : 0;
                      const isSelected = statusFilter === item.key;
                      return (
                        <tr
                          key={item.key}
                          onClick={() =>
                            setStatusFilter((prev) => (prev === item.key ? 'ALL' : item.key))
                          }
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-[#E88932]/10 font-semibold' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2 px-3 flex items-center gap-2 text-[#18232B]">
                            <span
                              className="w-2.5 h-2.5 rounded-xs shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span>{item.label}</span>
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-[#18232B]">
                            {item.value}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-500">
                            {pct}%
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-[#18232B] text-white font-bold text-xs">
                      <td className="py-2.5 px-3">TOTAL KESELURUHAN PROGRAM</td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#E88932]">
                        {totalMatrixCount}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-400">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Departemen: MOD & PLM</span>
            <span className="font-mono font-semibold text-[#18232B]">
              Provider: INTERNAL PT RJS / TC
            </span>
          </div>
        </div>

        {/* KOTAK TENGAH: GRAFIK VISUAL INTERAKTIF */}
        <div className="lg:col-span-4 bg-white rounded-[12px] border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between h-full">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#18232B] text-center mb-1">
              {activeTab === 'SIMPER'
                ? `Proporsi Assessment Operator & Driver (${combinedAssessmentTotal} Peserta)`
                : activeTab === 'CROSS_TRAINING'
                ? `Distribusi Status Cross Training (${totalMatrixCount})`
                : `Distribusi Status Skill Up (${totalMatrixCount})`}
            </h3>
            <p className="text-[11px] text-slate-500 text-center mb-3">
              Visualisasi otomatis dari data aktual sesuai filter Site
            </p>
          </div>

          <div className="my-auto flex items-center justify-center">
            {activeTab === 'SIMPER' ? (
              siteFilter === 'Genba' ? (
                <DonutChart
                  size={190}
                  centerLabel="SITE GEMBA"
                  centerValue={String(gembaAssessCount)}
                  segments={[
                    {
                      label: 'Candidate Operator / Driver',
                      value: state.genbaAssessmentRecords.filter((r) => r.posisi === 'Candidate')
                        .length,
                      color: '#E88932',
                    },
                    {
                      label: 'Driver & Operator Aktif',
                      value: state.genbaAssessmentRecords.filter((r) => r.posisi === 'Driver')
                        .length,
                      color: '#397C69',
                    },
                    {
                      label: 'New Hire Observasi',
                      value: state.genbaAssessmentRecords.filter((r) => r.posisi === 'New Hire')
                        .length,
                      color: '#527FA1',
                    },
                  ]}
                />
              ) : siteFilter === 'ALL' ? (
                <DonutChart
                  size={190}
                  centerLabel="TOTAL Y.T.D"
                  centerValue={String(combinedAssessmentTotal)}
                  segments={[
                    {
                      label: `Site Tangofa SIMPER (${state.simperCumulativeYtd})`,
                      value: state.simperCumulativeYtd,
                      color: '#397C69',
                    },
                    {
                      label: `Site Genba Assessment (${gembaAssessCount})`,
                      value: gembaAssessCount,
                      color: '#E88932',
                    },
                  ]}
                />
              ) : (
                <DonutChart
                  size={190}
                  centerLabel="TANGOFA"
                  centerValue={String(state.simperCumulativeYtd)}
                  segments={[
                    {
                      label: 'Selesai Uji SIMPER Sebelumnya (Jan–Okt)',
                      value: Math.max(0, state.simperCumulativeYtd - simperWeeklySum),
                      color: '#397C69',
                    },
                    {
                      label: 'Assessment Minggu Ke-1 Nov 2026',
                      value: simperWeeklySum,
                      color: '#E88932',
                    },
                  ]}
                />
              )
            ) : (
              <GroupedBarChart
                height={185}
                categories={matrixSummary.map((m) =>
                  m.key === 'ON SCHEDULE' ? 'SCHED' : m.key === 'ON PROGRESS' ? 'PROGR' : m.key
                )}
                series={[
                  { key: 'total', label: 'Total', color: '#CBD5E1' },
                  { key: 'actual', label: 'Jumlah', color: '#E88932' },
                ]}
                data={matrixSummary.map((m) => ({
                  total: totalMatrixCount,
                  actual: m.value,
                }))}
              />
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center text-[11px] text-slate-500">
            {activeTab === 'SIMPER'
              ? siteFilter === 'Genba'
                ? 'Mencakup Operator & Driver PT. RJS serta Subcont (PT. CAS, IGS, Armada, GKC, GPM)'
                : `Tangofa W1 Nov: ${simperWeeklySum}x Tes Praktek • Site Genba: ${gembaAssessCount}x Peserta`
              : `Klik salah satu status di tabel kiri untuk memfilter rincian`}
          </div>
        </div>

        {/* KOTAK KANAN: DOKUMENTASI KEGIATAN */}
        <div className="lg:col-span-4 bg-white rounded-[12px] border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#18232B]">
                  Dokumentasi Kegiatan ({currentPhotos.length} Foto)
                </h3>
                <p className="text-[11px] text-slate-500">Klik foto untuk memperbesar tampilan</p>
              </div>
              {canEdit && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleResetPhotos}
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
                      onChange={handleUploadPhoto}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            <div
              className={`grid gap-2 max-h-[250px] overflow-y-auto pr-1 ${
                currentPhotos.length <= 4
                  ? 'grid-cols-2'
                  : currentPhotos.length <= 6
                  ? 'grid-cols-3'
                  : 'grid-cols-4'
              }`}
            >
              {currentPhotos.map((url, idx) => (
                <div
                  key={`${url}-${idx}`}
                  className="group relative aspect-[4/3] rounded-[9px] overflow-hidden border border-slate-200 bg-slate-100"
                >
                  <img
                    src={url}
                    alt={`Dokumentasi ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => setLightboxUrl(url)}
                  />
                  <button
                    type="button"
                    onClick={() => setLightboxUrl(url)}
                    className="absolute bottom-1.5 right-1.5 p-1 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(idx)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-md bg-red-600/85 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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
                ? 'Site Tangofa & Site Genba'
                : siteFilter}
            </span>
            <span className="font-mono text-[#397C69] font-semibold">Verified TC</span>
          </div>
        </div>
      </div>

      {/* BLOK 3: FILTER & SEARCH BAR */}
      <div className="bg-white rounded-[12px] border border-slate-200/80 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setAssessPage(1);
            }}
            placeholder={
              activeTab === 'SIMPER'
                ? 'Cari tanggal, kandidat/operator, subcont (CAS, IGS, Armada, GKC), atau unit...'
                : 'Cari NIK, nama operator/driver, jabatan awal/target, atau unit SIMPER...'
            }
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#E88932]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setAssessPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {(activeTab === 'SIMPER'
            ? ['ALL', 'CLOSE', 'ON PROGRESS']
            : ['ALL', 'CLOSE', 'ON PROGRESS', 'ORIENTASI', 'ON SCHEDULE', 'HOLD', 'CANCEL']
          ).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setAssessPage(1);
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#18232B] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'Semua' : st}
            </button>
          ))}
        </div>
      </div>

      {/* BLOK 4: TABEL DATA AKTUAL INTERAKTIF */}
      <div className="bg-white rounded-[12px] border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 bg-[#18232B] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold tracking-tight">
              {activeTab === 'SIMPER'
                ? `REPORT ASSESSMENT OPERATOR & DRIVER (${siteFilter === 'ALL' ? 'SEMUA SITE' : siteFilter.toUpperCase()})`
                : activeTab === 'CROSS_TRAINING'
                ? 'CROSS SKILL & SIMILAR TRAINING REPORT — PERIODE JANUARI - NOVEMBER 2026'
                : 'SKILL UP TRAINING OPERATOR & DRIVER REPORT — PERIODE JANUARI - NOVEMBER 2026'}
            </h3>
            <p className="text-[11px] text-slate-300">
              {activeTab === 'SIMPER'
                ? `Menampilkan ${paginatedAssessRows.length} dari ${filteredSimper.length} baris jadwal/peserta • Total Keseluruhan: ${combinedAssessmentTotal} Peserta`
                : `Menampilkan ${filteredCrossOrSkillUp.length} dari ${activeCrossOrSkillUpRows.length} personel terdaftar`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'SIMPER' && filteredSimper.length > assessPageSize && (
              <button
                type="button"
                onClick={() => setShowAllAssess((p) => !p)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#263640] text-white hover:bg-[#324653] border border-slate-600 cursor-pointer"
              >
                {showAllAssess
                  ? 'Tampilkan Per Halaman (25)'
                  : `Tampilkan Semua (${filteredSimper.length})`}
              </button>
            )}
            {canEdit && (
              <Button
                variant="primary"
                size="sm"
                onClick={activeTab === 'SIMPER' ? openAddSimper : openAddCrossSkill}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                + Tambah Baris
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'SIMPER' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-mono uppercase text-slate-600">
                  <th className="py-3 px-4 w-12">No</th>
                  <th className="py-3 px-4">Site</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4 text-center">Actual</th>
                  <th className="py-3 px-4">Kandidat / Peserta</th>
                  <th className="py-3 px-4">Posisi</th>
                  <th className="py-3 px-4">Unit & Aktivitas Assessment</th>
                  <th className="py-3 px-4">Perusahaan / Instruktur</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  {canEdit && <th className="py-3 px-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {paginatedAssessRows.map((row, idx) => (
                  <tr key={`${row.source}-${row.id}`} className="even:bg-[#FAFBFB] hover:bg-slate-50/90">
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {(showAllAssess ? 0 : (assessPage - 1) * assessPageSize) + idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#18232B]/8 text-[#18232B] border border-[#18232B]/15 whitespace-nowrap">
                        <MapPin className="w-2.5 h-2.5 text-[#E88932]" />
                        {row.site}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#18232B] whitespace-nowrap">
                      {row.tanggal}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#E88932]/15 text-[#B86318]">
                        {row.actual}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#18232B]">{row.kandidatNama}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                        {row.posisi}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{row.unit}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{row.ket}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                          STATUS_BADGE_STYLE[row.status]
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditSimper(row)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#18232B] hover:bg-slate-100 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSimper(row)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                <tr className="bg-[#18232B] text-white font-bold text-xs">
                  <td className="py-3 px-4" colSpan={3}>
                    TOTAL KUMULATIF ASSESSMENT ({siteFilter === 'ALL' ? 'SEMUA SITE' : siteFilter.toUpperCase()})
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-sm text-[#E88932]">
                    {combinedAssessmentTotal}
                  </td>
                  <td className="py-3 px-4 text-slate-300" colSpan={canEdit ? 6 : 5}>
                    Site Tangofa YTD: {state.simperCumulativeYtd} Peserta • Site Genba: {gembaAssessCount} Peserta
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-mono uppercase text-slate-600">
                  <th className="py-3 px-3 w-10">No</th>
                  <th className="py-3 px-3">NIK</th>
                  <th className="py-3 px-3">Nama</th>
                  <th className="py-3 px-3">Site</th>
                  <th className="py-3 px-3">Dept</th>
                  <th className="py-3 px-3">Jabatan 1 (Awal)</th>
                  <th className="py-3 px-3">Jabatan 2 (Target)</th>
                  <th className="py-3 px-3">Unit SIMPER</th>
                  <th className="py-3 px-3">Class & Assessment</th>
                  <th className="py-3 px-3">Orientasi & Final</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3">PIC</th>
                  <th className="py-3 px-3">Keterangan / Penyesuaian</th>
                  {canEdit && <th className="py-3 px-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredCrossOrSkillUp.map((row) => (
                  <tr key={row.id} className="even:bg-[#FAFBFB] hover:bg-slate-50/90">
                    <td className="py-2.5 px-3 font-mono text-slate-500">{row.no}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-slate-700">
                      {row.nik}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#18232B]">{row.nama}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700 whitespace-nowrap">
                        {row.site || 'Tangofa'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{row.dept}</td>
                    <td className="py-2.5 px-3 text-slate-700">{row.jabatanAwal}</td>
                    <td className="py-2.5 px-3 font-medium text-[#18232B]">{row.jabatanTarget}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {row.pengajuanSimperUnit}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600">
                      <div>Class: {row.classTrainingDate}</div>
                      <div className="text-slate-400">Ass: {row.assessmentDate}</div>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600">
                      <div>Ori: {row.startOrientasiDate}</div>
                      <div className="text-slate-400">Final: {row.finalAssessmentDate}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                          STATUS_BADGE_STYLE[row.status]
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-slate-700">
                      {row.pic}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600 max-w-[210px]">
                      <div className="font-semibold text-slate-700">{row.kategoriKet}</div>
                      {row.catatanTambahan && row.catatanTambahan !== '-' && (
                        <div className="text-slate-500">{row.catatanTambahan}</div>
                      )}
                    </td>
                    {canEdit && (
                      <td className="py-2.5 px-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditCrossSkill(row)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#18232B] hover:bg-slate-100 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCrossSkill(row.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer for Assessment Table */}
        {activeTab === 'SIMPER' && !showAllAssess && totalAssessPages > 1 && (
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div>
              Halaman <span className="font-bold text-[#18232B]">{assessPage}</span> dari{' '}
              <span className="font-bold text-[#18232B]">{totalAssessPages}</span> (
              {filteredSimper.length} baris)
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={assessPage <= 1}
                onClick={() => setAssessPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>
              <button
                type="button"
                disabled={assessPage >= totalAssessPages}
                onClick={() => setAssessPage((p) => Math.min(totalAssessPages, p + 1))}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Add/Edit Unified Assessment */}
      <Modal
        open={showSimperModal}
        onClose={() => setShowSimperModal(false)}
        title={
          editingAssessSource
            ? 'Edit Data Assessment Operator & Driver'
            : 'Tambah Data Assessment Operator & Driver'
        }
      >
        <form onSubmit={handleSaveSimper} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Tanggal Pelaksanaan</label>
              <input
                type="text"
                required
                value={simperForm.tanggal}
                onChange={(e) => setSimperForm({ ...simperForm, tanggal: e.target.value })}
                className={inputCls}
                placeholder="Contoh: 4-Nov-26"
              />
            </div>
            <div>
              <label className={labelCls}>Lokasi Site</label>
              <select
                value={simperForm.site}
                onChange={(e) => setSimperForm({ ...simperForm, site: e.target.value })}
                className={inputCls}
              >
                {TRAINING_SITE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Jumlah Peserta (Actual)</label>
              <input
                type="number"
                min={1}
                required
                value={simperForm.actual}
                onChange={(e) =>
                  setSimperForm({ ...simperForm, actual: Number(e.target.value) || 1 })
                }
                className={inputCls}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nama Kandidat / Peserta</label>
              <input
                type="text"
                required
                value={simperForm.kandidatNama}
                onChange={(e) => setSimperForm({ ...simperForm, kandidatNama: e.target.value })}
                className={inputCls}
                placeholder="Contoh: Anno Palangda / Romi Mursalim"
              />
            </div>
            <div>
              <label className={labelCls}>Posisi</label>
              <input
                type="text"
                value={simperForm.posisi}
                onChange={(e) => setSimperForm({ ...simperForm, posisi: e.target.value })}
                className={inputCls}
                placeholder="Candidate / Driver / New Hire"
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Unit & Uraian Aktivitas Assessment</label>
            <input
              type="text"
              required
              value={simperForm.unit}
              onChange={(e) => setSimperForm({ ...simperForm, unit: e.target.value })}
              className={inputCls}
              placeholder="Contoh: DT — Assessment candidate driver DT PT Armada"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Perusahaan / Subcont</label>
              <input
                type="text"
                required
                value={simperForm.ket}
                onChange={(e) => setSimperForm({ ...simperForm, ket: e.target.value })}
                className={inputCls}
                placeholder="INTERNAL PT RJS / PT. Armada / PT. CAS"
              />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select
                value={simperForm.status}
                onChange={(e) =>
                  setSimperForm({
                    ...simperForm,
                    status: e.target.value as 'CLOSE' | 'ON PROGRESS',
                  })
                }
                className={inputCls}
              >
                <option value="CLOSE">CLOSE (Selesai)</option>
                <option value="ON PROGRESS">ON PROGRESS</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setShowSimperModal(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Data
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Cumulative YTD SIMPER */}
      <Modal
        open={showEditYtdModal}
        onClose={() => setShowEditYtdModal(false)}
        title="Update Total Kumulatif YTD Assessment SIMPER"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            operationTrainerStore.updateState((prev) => ({
              ...prev,
              simperCumulativeYtd: Math.max(0, Number(ytdInput) || 0),
            }));
            setShowEditYtdModal(false);
            bump();
          }}
          className="space-y-4"
        >
          <div>
            <label className={labelCls}>Total Kumulatif YTD (Januari – November 2026)</label>
            <input
              type="number"
              min={0}
              value={ytdInput}
              onChange={(e) => setYtdInput(Number(e.target.value) || 0)}
              className={inputCls}
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setShowEditYtdModal(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Total YTD
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Add/Edit Cross Training / Skill Up */}
      <Modal
        open={showCrossSkillModal}
        onClose={() => setShowCrossSkillModal(false)}
        title={
          editingCrossSkill
            ? `Edit Data ${activeTab === 'CROSS_TRAINING' ? 'Cross Training' : 'Skill Up'}`
            : `Tambah Peserta ${activeTab === 'CROSS_TRAINING' ? 'Cross Training' : 'Skill Up'}`
        }
      >
        <form onSubmit={handleSaveCrossSkill} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className={labelCls}>NIK</label>
              <input
                type="text"
                required
                value={csForm.nik}
                onChange={(e) => setCsForm({ ...csForm, nik: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Nama Lengkap</label>
              <input
                type="text"
                required
                value={csForm.nama}
                onChange={(e) => setCsForm({ ...csForm, nama: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Lokasi Site</label>
              <select
                value={csForm.site || 'Tangofa'}
                onChange={(e) => setCsForm({ ...csForm, site: e.target.value })}
                className={inputCls}
              >
                {TRAINING_SITE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Departemen</label>
              <input
                type="text"
                required
                value={csForm.dept}
                onChange={(e) => setCsForm({ ...csForm, dept: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Jabatan 1 (Awal)</label>
              <input
                type="text"
                required
                value={csForm.jabatanAwal}
                onChange={(e) => setCsForm({ ...csForm, jabatanAwal: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Jabatan 2 (Target)</label>
              <input
                type="text"
                required
                value={csForm.jabatanTarget}
                onChange={(e) => setCsForm({ ...csForm, jabatanTarget: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Pengajuan SIMPER Unit</label>
              <input
                type="text"
                required
                value={csForm.pengajuanSimperUnit}
                onChange={(e) => setCsForm({ ...csForm, pengajuanSimperUnit: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className={labelCls}>Class Training</label>
              <input
                type="text"
                value={csForm.classTrainingDate}
                onChange={(e) => setCsForm({ ...csForm, classTrainingDate: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Assessment</label>
              <input
                type="text"
                value={csForm.assessmentDate}
                onChange={(e) => setCsForm({ ...csForm, assessmentDate: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Start Orientasi</label>
              <input
                type="text"
                value={csForm.startOrientasiDate}
                onChange={(e) => setCsForm({ ...csForm, startOrientasiDate: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Final Assessment</label>
              <input
                type="text"
                value={csForm.finalAssessmentDate}
                onChange={(e) => setCsForm({ ...csForm, finalAssessmentDate: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Status Program</label>
              <select
                value={csForm.status}
                onChange={(e) =>
                  setCsForm({ ...csForm, status: e.target.value as OperationProgramStatus })
                }
                className={inputCls}
              >
                <option value="CLOSE">CLOSE</option>
                <option value="ON PROGRESS">ON PROGRESS</option>
                <option value="ORIENTASI">ORIENTASI</option>
                <option value="ON SCHEDULE">ON SCHEDULE</option>
                <option value="HOLD">HOLD</option>
                <option value="CANCEL">CANCEL</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Kategori (KET)</label>
              <input
                type="text"
                value={csForm.kategoriKet}
                onChange={(e) => setCsForm({ ...csForm, kategoriKet: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>PIC</label>
              <input
                type="text"
                value={csForm.pic}
                onChange={(e) => setCsForm({ ...csForm, pic: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Catatan / Keterangan Tambahan</label>
            <input
              type="text"
              value={csForm.catatanTambahan}
              onChange={(e) => setCsForm({ ...csForm, catatanTambahan: e.target.value })}
              className={inputCls}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setShowCrossSkillModal(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Peserta
            </Button>
          </div>
        </form>
      </Modal>

      {/* Lightbox Zoom */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              type="button"
              onClick={() => setLightboxUrl(null)}
              className="absolute -top-10 right-0 text-white hover:text-[#E88932] cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxUrl}
              alt="Zoom Dokumentasi"
              className="max-w-full max-h-[85vh] rounded-xl object-contain border border-white/20"
            />
          </div>
        </div>
      )}
    </div>
  );
};
