import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { mockStore } from '../../../lib/mockStore';
import { uploadPhotoToCloud } from '../../../lib/supabase';
import { getRolePermissions } from '../../../lib/types';
import {
  operationTrainerStore,
  OrientasiNewHireRecord,
  RetrainingRecord,
  FgdpTrainingRecord,
  GreenOperatorRecord,
  GreenOperatorStep,
  INITIAL_ORIENTASI_PHOTOS,
  INITIAL_RETRAINING_PHOTOS,
  INITIAL_FGDP_PHOTOS,
  INITIAL_GREEN_OPERATOR_PHOTOS,
  TRAINING_SITE_OPTIONS,
  TrainingSiteName,
  normalizeSiteName,
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
  Compass,
  AlertTriangle,
  GraduationCap,
  Truck,
  RefreshCw,
  CheckCircle2,
  Clock,
  Filter,
  Sparkles,
  MapPin,
} from 'lucide-react';

type ActiveTab = 'ORIENTASI' | 'RETRAINING' | 'FGDP' | 'GREEN_OPERATOR';

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

export const OrientasiRetrainingGreenView: React.FC = () => {
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

  const [activeTab, setActiveTab] = useState<ActiveTab>('ORIENTASI');
  const [siteFilter, setSiteFilter] = useState<'ALL' | TrainingSiteName>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [subFilter, setSubFilter] = useState<string>('ALL');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Modals State
  const [showOriModal, setShowOriModal] = useState(false);
  const [editingOri, setEditingOri] = useState<OrientasiNewHireRecord | null>(null);
  const [oriForm, setOriForm] = useState<Omit<OrientasiNewHireRecord, 'id' | 'no'>>({
    site: 'Tangofa',
    nik: '',
    nama: '',
    jabatan: 'Driver DT 12 R',
    startOrientasi: '4-Nov-26',
    assessment: '-',
    ket: 'New Hire',
    status: 'ON PROGRESS',
    pt: 'RJS',
    totalHm: 0,
  });

  const [showRetModal, setShowRetModal] = useState(false);
  const [editingRet, setEditingRet] = useState<RetrainingRecord | null>(null);
  const [retForm, setRetForm] = useState<Omit<RetrainingRecord, 'id' | 'no'>>({
    site: 'Tangofa',
    bulan: 'NOVEMBER',
    tanggal: '04-Nov-2026',
    namaPeserta: '',
    unit: 'DT 12 R',
    grounded: 1,
    complete: 1,
    persentase: 100,
    ket: 'DONE',
    catatanInvestigasi: 'Refresh Class & Practical Pasca Incident',
  });

  const [showFgdpModal, setShowFgdpModal] = useState(false);
  const [editingFgdp, setEditingFgdp] = useState<FgdpTrainingRecord | null>(null);
  const [fgdpForm, setFgdpForm] = useState<Omit<FgdpTrainingRecord, 'id' | 'no'>>({
    site: 'Tangofa',
    tanggal: '31 Oct- 05 Nov 2026',
    nama: '',
    departemen: 'MOD',
    provider: 'TC',
    program: 'Class & Field',
    instructor: 'A. Rahman',
    status: 'Done',
  });

  const [showGreenModal, setShowGreenModal] = useState(false);
  const [editingGreen, setEditingGreen] = useState<GreenOperatorRecord | null>(null);
  const [greenForm, setGreenForm] = useState<Omit<GreenOperatorRecord, 'id' | 'no'>>({
    site: 'Tangofa',
    nik: '',
    nama: '',
    jabatanAwal: 'Checker',
    previousDept: 'MOD',
    position: 'Candidate Opt. ADT',
    trainingClassStatus: 'Done',
    circuitAreaStatus: 'On Going',
  });

  // Photos per tab
  const currentPhotos =
    activeTab === 'ORIENTASI'
      ? state.orientasiPhotos
      : activeTab === 'RETRAINING'
      ? state.retrainingPhotos
      : activeTab === 'FGDP'
      ? state.fgdpPhotos
      : state.greenOperatorPhotos;

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    try {
      const compressedUrls = await Promise.all(files.map((f) => compressImageFile(f)));
      const folder =
        activeTab === 'ORIENTASI'
          ? 'orientasi'
          : activeTab === 'RETRAINING'
          ? 'retraining'
          : activeTab === 'FGDP'
          ? 'fgdp'
          : 'green-operator';
      const cloudUrls = await Promise.all(compressedUrls.map((u) => uploadPhotoToCloud(u, folder)));
      operationTrainerStore.updateState((prev) => {
        if (activeTab === 'ORIENTASI')
          return { ...prev, orientasiPhotos: [...prev.orientasiPhotos, ...cloudUrls] };
        if (activeTab === 'RETRAINING')
          return { ...prev, retrainingPhotos: [...prev.retrainingPhotos, ...cloudUrls] };
        if (activeTab === 'FGDP')
          return { ...prev, fgdpPhotos: [...prev.fgdpPhotos, ...cloudUrls] };
        return { ...prev, greenOperatorPhotos: [...prev.greenOperatorPhotos, ...cloudUrls] };
      });
      bump();
    } finally {
      e.target.value = '';
    }
  };

  const handleDeletePhoto = (idx: number) => {
    operationTrainerStore.updateState((prev) => {
      if (activeTab === 'ORIENTASI')
        return { ...prev, orientasiPhotos: prev.orientasiPhotos.filter((_, i) => i !== idx) };
      if (activeTab === 'RETRAINING')
        return { ...prev, retrainingPhotos: prev.retrainingPhotos.filter((_, i) => i !== idx) };
      if (activeTab === 'FGDP')
        return { ...prev, fgdpPhotos: prev.fgdpPhotos.filter((_, i) => i !== idx) };
      return {
        ...prev,
        greenOperatorPhotos: prev.greenOperatorPhotos.filter((_, i) => i !== idx),
      };
    });
    bump();
  };

  const handleResetPhotos = () => {
    const resetPhotoKey =
      activeTab === 'ORIENTASI'
        ? 'OP_orientasiPhotos'
        : activeTab === 'RETRAINING'
        ? 'OP_retrainingPhotos'
        : activeTab === 'FGDP'
        ? 'OP_fgdpPhotos'
        : 'OP_greenOperatorPhotos';
    operationTrainerStore.updateState(
      (prev) => {
        if (activeTab === 'ORIENTASI')
          return { ...prev, orientasiPhotos: [...INITIAL_ORIENTASI_PHOTOS] };
        if (activeTab === 'RETRAINING')
          return { ...prev, retrainingPhotos: [...INITIAL_RETRAINING_PHOTOS] };
        if (activeTab === 'FGDP')
          return { ...prev, fgdpPhotos: [...INITIAL_FGDP_PHOTOS] };
        return { ...prev, greenOperatorPhotos: [...INITIAL_GREEN_OPERATOR_PHOTOS] };
      },
      { resetPhotoKey }
    );
    bump();
  };

  // Filtered Lists
  const filteredOri = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return state.orientasiNewHireRecords.filter((r) => {
      if (siteFilter !== 'ALL' && normalizeSiteName(r.site, 'Tangofa') !== siteFilter) return false;
      if (subFilter !== 'ALL' && r.status !== subFilter) return false;
      if (!q) return true;
      return (
        r.nik.toLowerCase().includes(q) ||
        r.nama.toLowerCase().includes(q) ||
        r.jabatan.toLowerCase().includes(q) ||
        r.pt.toLowerCase().includes(q)
      );
    });
  }, [state.orientasiNewHireRecords, siteFilter, searchQuery, subFilter]);

  const filteredRet = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return state.retrainingRecords.filter((r) => {
      if (siteFilter !== 'ALL' && normalizeSiteName(r.site, 'Tangofa') !== siteFilter) return false;
      if (subFilter !== 'ALL' && r.bulan !== subFilter) return false;
      if (!q) return true;
      return (
        r.bulan.toLowerCase().includes(q) ||
        r.unit.toLowerCase().includes(q) ||
        r.namaPeserta.toLowerCase().includes(q) ||
        r.catatanInvestigasi.toLowerCase().includes(q)
      );
    });
  }, [state.retrainingRecords, siteFilter, searchQuery, subFilter]);

  const filteredFgdp = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return state.fgdpRecords.filter((r) => {
      if (siteFilter !== 'ALL' && normalizeSiteName(r.site, 'Tangofa') !== siteFilter) return false;
      if (subFilter !== 'ALL' && r.departemen !== subFilter) return false;
      if (!q) return true;
      return (
        r.nama.toLowerCase().includes(q) ||
        r.departemen.toLowerCase().includes(q) ||
        r.instructor.toLowerCase().includes(q) ||
        r.tanggal.toLowerCase().includes(q)
      );
    });
  }, [state.fgdpRecords, siteFilter, searchQuery, subFilter]);

  const filteredGreen = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return state.greenOperatorRecords.filter((r) => {
      if (siteFilter !== 'ALL' && normalizeSiteName(r.site, 'Tangofa') !== siteFilter) return false;
      if (subFilter !== 'ALL' && r.previousDept !== subFilter) return false;
      if (!q) return true;
      return (
        r.nik.toLowerCase().includes(q) ||
        r.nama.toLowerCase().includes(q) ||
        r.jabatanAwal.toLowerCase().includes(q) ||
        r.previousDept.toLowerCase().includes(q)
      );
    });
  }, [state.greenOperatorRecords, siteFilter, searchQuery, subFilter]);

  // Toggle Step Status for Green Operator
  const cycleStepStatus = (stepNo: number) => {
    if (!canEdit) return;
    const order: Array<GreenOperatorStep['status']> = ['Done', 'On Going', 'Pending'];
    operationTrainerStore.updateState((prev) => ({
      ...prev,
      greenOperatorSteps: prev.greenOperatorSteps.map((s) => {
        if (s.stepNo !== stepNo) return s;
        const nextIdx = (order.indexOf(s.status) + 1) % order.length;
        return { ...s, status: order[nextIdx] };
      }),
    }));
    bump();
  };

  // Open Add Modals
  const handleOpenAdd = () => {
    const defaultSite: TrainingSiteName = siteFilter !== 'ALL' ? siteFilter : 'Tangofa';
    if (activeTab === 'ORIENTASI') {
      setEditingOri(null);
      setOriForm({
        site: defaultSite,
        nik: '',
        nama: '',
        jabatan: 'Driver DT 12 R',
        startOrientasi: '4-Nov-26',
        assessment: '-',
        ket: 'New Hire',
        status: 'ON PROGRESS',
        pt: 'RJS',
        totalHm: 0,
      });
      setShowOriModal(true);
    } else if (activeTab === 'RETRAINING') {
      setEditingRet(null);
      setRetForm({
        site: defaultSite,
        bulan: 'NOVEMBER',
        tanggal: '04-Nov-2026',
        namaPeserta: '',
        unit: 'DT 12 R',
        grounded: 1,
        complete: 1,
        persentase: 100,
        ket: 'DONE',
        catatanInvestigasi: 'Refresh Class & Practical Pasca Incident',
      });
      setShowRetModal(true);
    } else if (activeTab === 'FGDP') {
      setEditingFgdp(null);
      setFgdpForm({
        site: defaultSite,
        tanggal: '31 Oct- 05 Nov 2026',
        nama: '',
        departemen: 'MOD',
        provider: 'TC',
        program: 'Class & Field',
        instructor: 'A. Rahman',
        status: 'Done',
      });
      setShowFgdpModal(true);
    } else {
      setEditingGreen(null);
      setGreenForm({
        site: defaultSite,
        nik: '',
        nama: '',
        jabatanAwal: 'Checker',
        previousDept: 'MOD',
        position: 'Candidate Opt. ADT',
        trainingClassStatus: 'Done',
        circuitAreaStatus: 'On Going',
      });
      setShowGreenModal(true);
    }
  };

  // Export CSV / Print PDF
  const handleExportCsv = () => {
    if (activeTab === 'ORIENTASI') {
      exportCsv(
        'orientasi_new_hire_operator_driver_2026',
        ['No', 'Site', 'NIK', 'Nama', 'Jabatan', 'Start Orientasi', 'Assessment', 'Ket', 'Status', 'PT', 'Total HM'],
        filteredOri.map((r) => [
          r.no,
          r.site || 'Tangofa',
          r.nik,
          r.nama,
          r.jabatan,
          r.startOrientasi,
          r.assessment,
          r.ket,
          r.status,
          r.pt,
          r.totalHm,
        ])
      );
    } else if (activeTab === 'RETRAINING') {
      exportCsv(
        'retraining_program_tc_2026',
        ['No', 'Site', 'Bulan', 'Tanggal', 'Peserta', 'Unit', 'Grounded', 'Complete', '%', 'Ket', 'Catatan'],
        filteredRet.map((r) => [
          r.no,
          r.site || 'Tangofa',
          r.bulan,
          r.tanggal,
          r.namaPeserta,
          r.unit,
          r.grounded,
          r.complete,
          `${r.persentase}%`,
          r.ket,
          r.catatanInvestigasi,
        ])
      );
    } else if (activeTab === 'FGDP') {
      exportCsv(
        'pembekalan_orientasi_fgdp_tc_2026',
        ['No', 'Site', 'Tanggal', 'Nama', 'Departemen', 'Provider', 'Program', 'Instructor', 'Status'],
        filteredFgdp.map((r) => [
          r.no,
          r.site || 'Tangofa',
          r.tanggal,
          r.nama,
          r.departemen,
          r.provider,
          r.program,
          r.instructor,
          r.status,
        ])
      );
    } else {
      exportCsv(
        'green_operator_adt_batch_vi_2026',
        ['No', 'Site', 'NIK', 'Nama', 'Jabatan Awal', 'Previous Dept', 'Position', 'Training Class', 'Circuit Area'],
        filteredGreen.map((r) => [
          r.no,
          r.site || 'Tangofa',
          r.nik,
          r.nama,
          r.jabatanAwal,
          r.previousDept,
          r.position,
          r.trainingClassStatus,
          r.circuitAreaStatus,
        ])
      );
    }
  };

  const handlePrintPdf = () => {
    if (activeTab === 'ORIENTASI') {
      printTable(
        `REPORT ORIENTASI DRIVER NEW HIRE OPERATOR & DRIVER (Total Selesai Orientasi YTD: ${state.orientasiCumulativeTotal})`,
        ['No', 'Site', 'NIK', 'Nama', 'Jabatan', 'Start Orientasi', 'Assessment', 'Status', 'PT', 'Total HM'],
        filteredOri.map((r) => [
          r.no,
          r.site || 'Tangofa',
          r.nik,
          r.nama,
          r.jabatan,
          r.startOrientasi,
          r.assessment,
          r.status,
          r.pt,
          r.totalHm,
        ])
      );
    } else if (activeTab === 'RETRAINING') {
      printTable(
        `DATA RE-TRAINING TRAINING CENTER — Grounded YTD: ${state.retrainingCumulativeGrounded} | Complete YTD: ${state.retrainingCumulativeComplete} (100%)`,
        ['No', 'Site', 'Bulan', 'Tanggal', 'Peserta / Deskripsi', 'Unit', 'Grounded', 'Complete', '%', 'Ket'],
        filteredRet.map((r) => [
          r.no,
          r.site || 'Tangofa',
          r.bulan,
          r.tanggal,
          r.namaPeserta,
          r.unit,
          r.grounded,
          r.complete,
          `${r.persentase}%`,
          r.ket,
        ])
      );
    } else if (activeTab === 'FGDP') {
      printTable(
        'PEMBEKALAN & ORIENTASI FGDP DI TRAINING CENTER (OKTOBER - NOVEMBER 2026)',
        ['No', 'Site', 'Tanggal', 'Nama', 'Departemen', 'Provider', 'Program', 'Instructor', 'Status'],
        filteredFgdp.map((r) => [
          r.no,
          r.site || 'Tangofa',
          r.tanggal,
          r.nama,
          r.departemen,
          r.provider,
          r.program,
          r.instructor,
          r.status,
        ])
      );
    } else {
      printTable(
        'UPDATE PROGRAM GREEN TRAINING OPERATOR ADT BATCH VI 2026 (20x CANDIDATE)',
        ['No', 'Site', 'NIK', 'Nama', 'Jabatan Awal', 'Previous Dept', 'Position', 'Training Class', 'Circuit Area'],
        filteredGreen.map((r) => [
          r.no,
          r.site || 'Tangofa',
          r.nik,
          r.nama,
          r.jabatanAwal,
          r.previousDept,
          r.position,
          r.trainingClassStatus,
          r.circuitAreaStatus,
        ])
      );
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* BLOK 1: DARK SLATE HERO HEADER (#18232B) */}
      <div className="relative overflow-hidden rounded-[14px] bg-[#18232B] text-white p-6 border border-[#263640] shadow-lg">
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 20%, #E88932 0%, transparent 50%), radial-gradient(circle at 85% 80%, #397C69 0%, transparent 50%)',
          }}
        />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#E88932]/20 text-[#E88932] border border-[#E88932]/40">
                <Compass className="w-3 h-3" />
                Operation Trainer Report
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-slate-300 bg-[#263640] border border-slate-700">
                <MapPin className="w-3 h-3 text-[#E88932]" />
                {siteFilter === 'ALL'
                  ? 'Semua Site (HO • Tangofa • Genba • Sampala • Gorontalo • Belopa • TPM)'
                  : siteFilter}{' '}
                • Tahun 2026
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Orientasi New Hire, Re-Training, FGDP & Green Operator ADT
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Monitoring jam terbang (HM) Orientasi New Hire, program Re-Training & Joint Investigasi
              Incident, Pembekalan FGDP di TC, serta kurikulum 20x Green Operator ADT Batch VI.
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
                onClick={handleOpenAdd}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                + Tambah Data
              </Button>
            )}
          </div>
        </div>

        {/* Category Tabs + Site Filter Bar */}
        <div className="relative z-10 mt-5 pt-4 border-t border-[#263640] flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('ORIENTASI');
                setSubFilter('ALL');
                setSearchQuery('');
              }}
              className={`px-3.5 py-2 rounded-[9px] text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'ORIENTASI'
                  ? 'bg-[#E88932] text-white shadow-sm'
                  : 'bg-[#263640]/80 text-slate-300 hover:text-white hover:bg-[#263640]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Orientasi New Hire</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/25 text-white">
                YTD: {state.orientasiCumulativeTotal}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('RETRAINING');
                setSubFilter('ALL');
                setSearchQuery('');
              }}
              className={`px-3.5 py-2 rounded-[9px] text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'RETRAINING'
                  ? 'bg-[#E88932] text-white shadow-sm'
                  : 'bg-[#263640]/80 text-slate-300 hover:text-white hover:bg-[#263640]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Re-Training & Investigasi Incident</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/25 text-white">
                {state.retrainingCumulativeComplete}/{state.retrainingCumulativeGrounded} (100%)
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('FGDP');
                setSubFilter('ALL');
                setSearchQuery('');
              }}
              className={`px-3.5 py-2 rounded-[9px] text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'FGDP'
                  ? 'bg-[#E88932] text-white shadow-sm'
                  : 'bg-[#263640]/80 text-slate-300 hover:text-white hover:bg-[#263640]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Pembekalan & Orientasi FGDP</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/25 text-white">
                {filteredFgdp.length} Peserta
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('GREEN_OPERATOR');
                setSubFilter('ALL');
                setSearchQuery('');
              }}
              className={`px-3.5 py-2 rounded-[9px] text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'GREEN_OPERATOR'
                  ? 'bg-[#E88932] text-white shadow-sm'
                  : 'bg-[#263640]/80 text-slate-300 hover:text-white hover:bg-[#263640]'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Green Operator ADT Batch VI</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/25 text-white">
                {filteredGreen.length} Siswa
              </span>
            </button>
          </div>

          {/* Site Filter Pill Bar */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#263640]/70 p-1.5 rounded-[10px] border border-slate-700/80">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 px-2 flex items-center gap-1">
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
                    ? 'bg-[#E88932] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-[#18232B]/50'
                }`}
              >
                {s === 'ALL' ? 'Semua Site' : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Highlight Banners per Tab */}
      {activeTab === 'RETRAINING' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3.5 rounded-[10px] bg-white border border-slate-200/80 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-[#E88932]/15 text-[#E88932] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Program Re-Training Berjalan
              </div>
              <div className="text-xs font-bold text-[#18232B]">
                Refresh Class Training & Practical pada Bulan November 2026 (Grounded: 64 | Complete: 64 — 100%)
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3.5 rounded-[10px] bg-white border border-slate-200/80 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-[#527FA1]/15 text-[#527FA1] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Joint Investigasi Incident
              </div>
              <div className="text-xs font-bold text-[#18232B]">
                Joint 12x Investigasi Incident (Nov 4x, Okt 4x: 2x Unit DT, 1x Unit Excavator, 1x FT)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Special 7-Step Curriculum Flow Banner for Slide 15 Green Operator */}
      {activeTab === 'GREEN_OPERATOR' && (
        <div className="bg-white rounded-[12px] border border-slate-200/80 shadow-xs p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#18232B]">
                Alur Proses Training Green Operator ADT Batch VI (7 Tahapan Kurikulum)
              </h3>
              <p className="text-[11px] text-slate-500">
                Program Gerdas & Zig Zag serta P2H di Circuit Area bagi 20x Green Operator ADT •{' '}
                {canEdit && 'Klik kartu tahapan untuk mengubah status'}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-[#E88932]/15 text-[#B86318] border border-[#E88932]/30">
              Tahap 4 Aktif: P2H, Gerdas & Zig Zag di Circuit — On Going
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
            {state.greenOperatorSteps.map((step) => {
              const isDone = step.status === 'Done';
              const isOngoing = step.status === 'On Going';
              return (
                <div
                  key={step.stepNo}
                  onClick={() => cycleStepStatus(step.stepNo)}
                  className={`p-3 rounded-[10px] border transition-all flex flex-col justify-between ${
                    canEdit ? 'cursor-pointer hover:shadow-sm' : ''
                  } ${
                    isDone
                      ? 'bg-[#397C69]/8 border-[#397C69]/35'
                      : isOngoing
                      ? 'bg-[#E88932]/12 border-[#E88932] ring-1 ring-[#E88932]/40'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#18232B] text-white">
                        {step.duration}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isDone
                            ? 'bg-[#397C69] text-white'
                            : isOngoing
                            ? 'bg-[#E88932] text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {step.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#18232B] leading-snug">
                      {step.title}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BLOK 2: 3 KOTAK RINGKASAN SEJAJAR (EQUAL HEIGHT ITEMS-STRETCH) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* KOTAK KIRI: TABEL RINGKASAN */}
        <div className="lg:col-span-4 bg-white rounded-[12px] border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between h-full">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#18232B] mb-1">
              {activeTab === 'ORIENTASI'
                ? 'Rekap Selesai Orientasi (Okt–Nov 2026)'
                : activeTab === 'RETRAINING'
                ? 'Rekap Bulanan Re-Training (Grounded vs Complete)'
                : activeTab === 'FGDP'
                ? 'Rekap Pembekalan FGDP per Departemen'
                : 'Rekap Asal Departemen 20x Green Operator ADT'}
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">
              Klik baris untuk memfilter tabel peserta di bawah
            </p>

            {activeTab === 'ORIENTASI' && (
              <div className="overflow-hidden rounded-[9px] border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#18232B] text-white text-[10px] font-mono uppercase">
                      <th className="py-2 px-3">Tanggal</th>
                      <th className="py-2 px-3">Unit Selesai Orientasi</th>
                      <th className="py-2 px-3 text-right">Actual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {state.selesaiOrientasiLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-semibold text-[#18232B]">{log.tanggal}</td>
                        <td className="py-2 px-3 text-slate-600">{log.unit}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-[#18232B]">
                          {log.actual}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-semibold text-xs">
                      <td className="py-2 px-3 text-slate-600" colSpan={2}>
                        Completed Orientasi Field Bulan Oktober 2026
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-[#527FA1]">
                        {state.orientasiCompletedOctCount}x
                      </td>
                    </tr>
                    <tr className="bg-[#18232B] text-white font-bold text-xs">
                      <td className="py-2.5 px-3" colSpan={2}>
                        TOTAL SELESAI ORIENTASI YTD (2026)
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-sm text-[#E88932]">
                        {state.orientasiCumulativeTotal}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'RETRAINING' && (
              <div className="overflow-hidden rounded-[9px] border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#18232B] text-white text-[10px] font-mono uppercase">
                      <th className="py-2 px-3">Bulan (Klik Filter)</th>
                      <th className="py-2 px-3 text-right">Grounded</th>
                      <th className="py-2 px-3 text-right">Complete</th>
                      <th className="py-2 px-3 text-right">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {(['SEPTEMBER', 'OKTOBER', 'NOVEMBER'] as const).map((bln) => {
                      const rows = state.retrainingRecords.filter((r) => r.bulan === bln);
                      const g = rows.reduce((s, r) => s + r.grounded, 0);
                      const c = rows.reduce((s, r) => s + r.complete, 0);
                      return (
                        <tr
                          key={bln}
                          onClick={() => setSubFilter((p) => (p === bln ? 'ALL' : bln))}
                          className={`cursor-pointer ${
                            subFilter === bln ? 'bg-[#E88932]/12 font-bold' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2.5 px-3 font-semibold text-[#18232B]">{bln} 2026</td>
                          <td className="py-2.5 px-3 text-right font-mono">{g}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-[#397C69]">
                            {c}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-emerald-700">
                            100%
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-[#18232B] text-white font-bold text-xs">
                      <td className="py-2.5 px-3">JANUARI – NOVEMBER 2026</td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#E88932]">
                        {state.retrainingCumulativeGrounded}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                        {state.retrainingCumulativeComplete}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-400">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'FGDP' && (
              <div className="overflow-hidden rounded-[9px] border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#18232B] text-white text-[10px] font-mono uppercase">
                      <th className="py-2 px-3">Departemen</th>
                      <th className="py-2 px-3">Program</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {['MED / MOD', 'PLM', 'HRGA-IT', 'MOD'].map((dept) => {
                      const cnt = state.fgdpRecords.filter((r) => r.departemen === dept).length;
                      return (
                        <tr
                          key={dept}
                          onClick={() => setSubFilter((p) => (p === dept ? 'ALL' : dept))}
                          className={`cursor-pointer ${
                            subFilter === dept ? 'bg-[#E88932]/12 font-bold' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2 px-3 font-semibold text-[#18232B]">{dept}</td>
                          <td className="py-2 px-3 text-slate-500">Class & Field</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-[#18232B]">
                            {cnt}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-[#18232B] text-white font-bold text-xs">
                      <td className="py-2.5 px-3" colSpan={2}>
                        GRAND TOTAL PESERTA FGDP
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#E88932]">
                        {state.fgdpRecords.length}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'GREEN_OPERATOR' && (
              <div className="overflow-hidden rounded-[9px] border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#18232B] text-white text-[10px] font-mono uppercase">
                      <th className="py-2 px-3">Previous Dept (Klik Filter)</th>
                      <th className="py-2 px-3 text-center">Class</th>
                      <th className="py-2 px-3 text-right">Siswa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {['PLM', 'LOGISTIK', 'MOD', 'HRGA', 'HSE', 'MED'].map((dept) => {
                      const cnt = state.greenOperatorRecords.filter(
                        (r) => r.previousDept === dept
                      ).length;
                      return (
                        <tr
                          key={dept}
                          onClick={() => setSubFilter((p) => (p === dept ? 'ALL' : dept))}
                          className={`cursor-pointer ${
                            subFilter === dept ? 'bg-[#E88932]/12 font-bold' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2 px-3 font-semibold text-[#18232B]">{dept}</td>
                          <td className="py-2 px-3 text-center text-emerald-700 font-mono text-[11px]">
                            Done
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-[#18232B]">
                            {cnt}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-[#18232B] text-white font-bold text-xs">
                      <td className="py-2.5 px-3" colSpan={2}>
                        TOTAL GREEN OPERATOR ADT BATCH VI
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#E88932]">
                        {state.greenOperatorRecords.length}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Provider: Training Center (TC)</span>
            <span className="font-mono font-semibold text-[#18232B]">Site Tangofa</span>
          </div>
        </div>

        {/* KOTAK TENGAH: GRAFIK VISUAL INTERAKTIF */}
        <div className="lg:col-span-4 bg-white rounded-[12px] border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between h-full">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#18232B] text-center mb-1">
              {activeTab === 'ORIENTASI'
                ? 'Status Monitoring Orientasi New Hire'
                : activeTab === 'RETRAINING'
                ? 'Proporsi Unit Re-Training (Sept–Nov 2026)'
                : activeTab === 'FGDP'
                ? 'Proporsi Instructor Pembekalan FGDP'
                : 'Distribusi Asal Departemen Green Operator ADT'}
            </h3>
            <p className="text-[11px] text-slate-500 text-center mb-3">
              Terhubung otomatis dengan tabel aktual di bawah
            </p>
          </div>

          <div className="my-auto flex items-center justify-center">
            {activeTab === 'ORIENTASI' && (
              <DonutChart
                size={190}
                centerLabel="TOTAL Y.T.D"
                centerValue={String(state.orientasiCumulativeTotal)}
                segments={[
                  {
                    label: 'CLOSE (Selesai Orientasi)',
                    value: state.orientasiNewHireRecords.filter((r) => r.status === 'CLOSE').length,
                    color: '#397C69',
                  },
                  {
                    label: 'ON PROGRESS (Monitoring HM)',
                    value: state.orientasiNewHireRecords.filter((r) => r.status === 'ON PROGRESS')
                      .length,
                    color: '#E88932',
                  },
                ]}
              />
            )}

            {activeTab === 'RETRAINING' && (
              <DonutChart
                size={190}
                centerLabel="COMPLETE"
                centerValue={`${state.retrainingCumulativeComplete}`}
                segments={[
                  {
                    label: 'Dump Truck (DT 12R)',
                    value: state.retrainingRecords.filter((r) => r.unit.includes('DT')).length,
                    color: '#E88932',
                  },
                  {
                    label: 'Excavator',
                    value: state.retrainingRecords.filter((r) => r.unit.includes('EXC')).length,
                    color: '#527FA1',
                  },
                  {
                    label: 'Buldozer & ADT',
                    value: state.retrainingRecords.filter(
                      (r) => r.unit.includes('BULDOZER') || r.unit.includes('ADT')
                    ).length,
                    color: '#397C69',
                  },
                  {
                    label: 'Support Unit (FT, WT, LV, MH)',
                    value: state.retrainingRecords.filter(
                      (r) =>
                        !r.unit.includes('DT') &&
                        !r.unit.includes('EXC') &&
                        !r.unit.includes('BULDOZER') &&
                        !r.unit.includes('ADT')
                    ).length,
                    color: '#D5A33D',
                  },
                ]}
              />
            )}

            {activeTab === 'FGDP' && (
              <DonutChart
                size={190}
                centerLabel="FGDP"
                centerValue={String(state.fgdpRecords.length)}
                segments={[
                  {
                    label: 'Instructor: A. Rahman (25 Oct – 5 Nov)',
                    value: state.fgdpRecords.filter((r) => r.instructor.includes('Rahman')).length,
                    color: '#E88932',
                  },
                  {
                    label: 'Instructor: Andi Rizal (19–24 Oct)',
                    value: state.fgdpRecords.filter((r) => r.instructor.includes('Rizal')).length,
                    color: '#527FA1',
                  },
                ]}
              />
            )}

            {activeTab === 'GREEN_OPERATOR' && (
              <DonutChart
                size={190}
                centerLabel="SISWA ADT"
                centerValue={String(state.greenOperatorRecords.length)}
                segments={[
                  {
                    label: 'PLM (6 Siswa)',
                    value: state.greenOperatorRecords.filter((r) => r.previousDept === 'PLM')
                      .length,
                    color: '#E88932',
                  },
                  {
                    label: 'LOGISTIK (4 Siswa)',
                    value: state.greenOperatorRecords.filter((r) => r.previousDept === 'LOGISTIK')
                      .length,
                    color: '#527FA1',
                  },
                  {
                    label: 'MOD & MED (5 Siswa)',
                    value: state.greenOperatorRecords.filter(
                      (r) => r.previousDept === 'MOD' || r.previousDept === 'MED'
                    ).length,
                    color: '#397C69',
                  },
                  {
                    label: 'HRGA & HSE (5 Siswa)',
                    value: state.greenOperatorRecords.filter(
                      (r) => r.previousDept === 'HRGA' || r.previousDept === 'HSE'
                    ).length,
                    color: '#D5A33D',
                  },
                ]}
              />
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center text-[11px] text-slate-500">
            {activeTab === 'ORIENTASI'
              ? 'Rata-rata jam orientasi (Total HM) terpenuhi > 60 HM sebelum Final Assessment'
              : activeTab === 'RETRAINING'
              ? '100% Operator/Driver Grounded telah menyelesaikan Refresh Class & Practical'
              : activeTab === 'FGDP'
              ? '12 Peserta FGDP menyelesaikan materi Class & Field di Training Center'
              : '20x Siswa telah lulus Class Training & sedang OJT di Circuit Area Simper L'}
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
                    className="absolute bottom-1 right-1 p-1 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <ZoomIn className="w-3 h-3" />
                  </button>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(idx)}
                      className="absolute top-1 right-1 p-1 rounded bg-red-600/85 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Dokumentasi Aktual TC & Circuit Area</span>
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
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari NIK, nama peserta, unit, jabatan, atau instruktur..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#E88932]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {(activeTab === 'ORIENTASI'
            ? ['ALL', 'CLOSE', 'ON PROGRESS']
            : activeTab === 'RETRAINING'
            ? ['ALL', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER']
            : activeTab === 'FGDP'
            ? ['ALL', 'MED / MOD', 'PLM', 'HRGA-IT', 'MOD']
            : ['ALL', 'PLM', 'LOGISTIK', 'MOD', 'HRGA', 'HSE', 'MED']
          ).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setSubFilter(f)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                subFilter === f
                  ? 'bg-[#18232B] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'ALL' ? 'Semua' : f}
            </button>
          ))}
        </div>
      </div>

      {/* BLOK 4: TABEL DATA AKTUAL INTERAKTIF */}
      <div className="bg-white rounded-[12px] border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 bg-[#18232B] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold tracking-tight">
              {activeTab === 'ORIENTASI'
                ? 'REPORT ORIENTASI DRIVER NEW HIRE OPERATOR & DRIVER — MONITORING JAM ORIENTASI (HM)'
                : activeTab === 'RETRAINING'
                ? 'DATA RE-TRAINING TRAINING CENTER — PERIODE SEPTEMBER S/D NOVEMBER 2026'
                : activeTab === 'FGDP'
                ? 'PEMBEKALAN & ORIENTASI FGDP DI TRAINING CENTER — PERIODE OKTOBER - NOVEMBER 2026'
                : 'UPDATE PROGRAM GREEN TRAINING OPERATOR ADT BATCH VI 2026 (20 PESERTA)'}
            </h3>
            <p className="text-[11px] text-slate-300">
              Data terhubung langsung dengan ringkasan grafik dan KPI Capaian Training
            </p>
          </div>
          {canEdit && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAdd}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              + Tambah Baris
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'ORIENTASI' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-mono uppercase text-slate-600">
                  <th className="py-3 px-4 w-12">No</th>
                  <th className="py-3 px-4">Site</th>
                  <th className="py-3 px-4">NIK</th>
                  <th className="py-3 px-4">Nama</th>
                  <th className="py-3 px-4">Jabatan</th>
                  <th className="py-3 px-4">Start Orientasi</th>
                  <th className="py-3 px-4">Assessment</th>
                  <th className="py-3 px-4">Ket</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">PT</th>
                  <th className="py-3 px-4 text-right">Total HM</th>
                  {canEdit && <th className="py-3 px-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredOri.map((row) => (
                  <tr key={row.id} className="even:bg-[#FAFBFB] hover:bg-slate-50/90">
                    <td className="py-2.5 px-4 font-mono text-slate-500">{row.no}</td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#18232B]/8 text-[#18232B] border border-[#18232B]/15">
                        {row.site || 'Tangofa'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono font-semibold text-slate-700">{row.nik}</td>
                    <td className="py-2.5 px-4 font-semibold text-[#18232B]">{row.nama}</td>
                    <td className="py-2.5 px-4 text-slate-700">{row.jabatan}</td>
                    <td className="py-2.5 px-4 text-slate-600">{row.startOrientasi}</td>
                    <td className="py-2.5 px-4 text-slate-600">{row.assessment}</td>
                    <td className="py-2.5 px-4 text-slate-600">{row.ket}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                          row.status === 'CLOSE'
                            ? 'bg-[#397C69]/12 text-[#296050] border-[#397C69]/30'
                            : 'bg-[#E88932]/15 text-[#B86318] border-[#E88932]/35'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-700">
                      {row.pt}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-[#18232B]">
                      {row.totalHm} HM
                    </td>
                    {canEdit && (
                      <td className="py-2.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingOri(row);
                              setOriForm({
                                site: row.site || 'Tangofa',
                                nik: row.nik,
                                nama: row.nama,
                                jabatan: row.jabatan,
                                startOrientasi: row.startOrientasi,
                                assessment: row.assessment,
                                ket: row.ket,
                                status: row.status,
                                pt: row.pt,
                                totalHm: row.totalHm,
                              });
                              setShowOriModal(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#18232B] hover:bg-slate-100 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              operationTrainerStore.updateState((prev) => ({
                                ...prev,
                                orientasiNewHireRecords: prev.orientasiNewHireRecords
                                  .filter((r) => r.id !== row.id)
                                  .map((r, i) => ({ ...r, no: i + 1 })),
                              }));
                              bump();
                            }}
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

          {activeTab === 'RETRAINING' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-mono uppercase text-slate-600">
                  <th className="py-3 px-4 w-12">No</th>
                  <th className="py-3 px-4">Site</th>
                  <th className="py-3 px-4">Month 2026</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Nama / Deskripsi Peserta</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4 text-center">Grounded</th>
                  <th className="py-3 px-4 text-center">Complete</th>
                  <th className="py-3 px-4 text-center">%</th>
                  <th className="py-3 px-4 text-center">Ket</th>
                  <th className="py-3 px-4">Catatan Investigasi / Refresh</th>
                  {canEdit && <th className="py-3 px-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredRet.map((row) => (
                  <tr key={row.id} className="even:bg-[#FAFBFB] hover:bg-slate-50/90">
                    <td className="py-2.5 px-4 font-mono text-slate-500">{row.no}</td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#18232B]/8 text-[#18232B] border border-[#18232B]/15">
                        {row.site || 'Tangofa'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-[#18232B]">{row.bulan}</td>
                    <td className="py-2.5 px-4 text-slate-600">{row.tanggal}</td>
                    <td className="py-2.5 px-4 font-medium text-[#18232B]">{row.namaPeserta}</td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 text-slate-700">
                        {row.unit}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono">{row.grounded}</td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-[#397C69]">
                      {row.complete}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-semibold text-emerald-700">
                      {row.persentase}%
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#397C69]/12 text-[#296050] border border-[#397C69]/30">
                        {row.ket}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{row.catatanInvestigasi}</td>
                    {canEdit && (
                      <td className="py-2.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRet(row);
                              setRetForm({
                                site: row.site || 'Tangofa',
                                bulan: row.bulan,
                                tanggal: row.tanggal,
                                namaPeserta: row.namaPeserta,
                                unit: row.unit,
                                grounded: row.grounded,
                                complete: row.complete,
                                persentase: row.persentase,
                                ket: row.ket,
                                catatanInvestigasi: row.catatanInvestigasi,
                              });
                              setShowRetModal(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#18232B] hover:bg-slate-100 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              operationTrainerStore.updateState((prev) => ({
                                ...prev,
                                retrainingRecords: prev.retrainingRecords
                                  .filter((r) => r.id !== row.id)
                                  .map((r, i) => ({ ...r, no: i + 1 })),
                              }));
                              bump();
                            }}
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
                  <td className="py-3 px-4" colSpan={6}>
                    TOTAL KUMULATIF JANUARI – NOVEMBER 2026
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-[#E88932]">
                    {state.retrainingCumulativeGrounded}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-emerald-400">
                    {state.retrainingCumulativeComplete}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-emerald-400">100%</td>
                  <td className="py-3 px-4" colSpan={canEdit ? 3 : 2}>
                    On Progress: 0 • Achievement: 100%
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          {activeTab === 'FGDP' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-mono uppercase text-slate-600">
                  <th className="py-3 px-4 w-12">No</th>
                  <th className="py-3 px-4">Site</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Nama Peserta FGDP</th>
                  <th className="py-3 px-4">Departemen</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Program</th>
                  <th className="py-3 px-4">Instructor</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  {canEdit && <th className="py-3 px-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredFgdp.map((row) => (
                  <tr key={row.id} className="even:bg-[#FAFBFB] hover:bg-slate-50/90">
                    <td className="py-2.5 px-4 font-mono text-slate-500">{row.no}</td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#18232B]/8 text-[#18232B] border border-[#18232B]/15">
                        {row.site || 'Tangofa'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-700">{row.tanggal}</td>
                    <td className="py-2.5 px-4 font-semibold text-[#18232B]">{row.nama}</td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 text-slate-700">
                        {row.departemen}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{row.provider}</td>
                    <td className="py-2.5 px-4 text-slate-700">{row.program}</td>
                    <td className="py-2.5 px-4 font-medium text-[#18232B]">{row.instructor}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#397C69]/12 text-[#296050] border border-[#397C69]/30">
                        {row.status}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="py-2.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingFgdp(row);
                              setFgdpForm({
                                site: row.site || 'Tangofa',
                                tanggal: row.tanggal,
                                nama: row.nama,
                                departemen: row.departemen,
                                provider: row.provider,
                                program: row.program,
                                instructor: row.instructor,
                                status: row.status,
                              });
                              setShowFgdpModal(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#18232B] hover:bg-slate-100 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              operationTrainerStore.updateState((prev) => ({
                                ...prev,
                                fgdpRecords: prev.fgdpRecords
                                  .filter((r) => r.id !== row.id)
                                  .map((r, i) => ({ ...r, no: i + 1 })),
                              }));
                              bump();
                            }}
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

          {activeTab === 'GREEN_OPERATOR' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-mono uppercase text-slate-600">
                  <th className="py-3 px-4 w-12">No</th>
                  <th className="py-3 px-4">Site</th>
                  <th className="py-3 px-4">NIK</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Jabatan Awal</th>
                  <th className="py-3 px-4">Previous Department</th>
                  <th className="py-3 px-4">Position</th>
                  <th className="py-3 px-4 text-center">Training Class</th>
                  <th className="py-3 px-4 text-center">Circuit Area (Gerdas & Zig Zag)</th>
                  {canEdit && <th className="py-3 px-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredGreen.map((row) => (
                  <tr key={row.id} className="even:bg-[#FAFBFB] hover:bg-slate-50/90">
                    <td className="py-2.5 px-4 font-mono text-slate-500">{row.no}</td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#18232B]/8 text-[#18232B] border border-[#18232B]/15">
                        {row.site || 'Tangofa'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono font-semibold text-slate-700">{row.nik}</td>
                    <td className="py-2.5 px-4 font-semibold text-[#18232B]">{row.nama}</td>
                    <td className="py-2.5 px-4 text-slate-700">{row.jabatanAwal}</td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 text-slate-700">
                        {row.previousDept}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-medium text-[#18232B]">{row.position}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#397C69]/12 text-[#296050] border border-[#397C69]/30">
                        {row.trainingClassStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                          row.circuitAreaStatus === 'Done'
                            ? 'bg-[#397C69]/12 text-[#296050] border-[#397C69]/30'
                            : 'bg-[#E88932]/15 text-[#B86318] border-[#E88932]/35'
                        }`}
                      >
                        {row.circuitAreaStatus}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="py-2.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingGreen(row);
                              setGreenForm({
                                site: row.site || 'Tangofa',
                                nik: row.nik,
                                nama: row.nama,
                                jabatanAwal: row.jabatanAwal,
                                previousDept: row.previousDept,
                                position: row.position,
                                trainingClassStatus: row.trainingClassStatus,
                                circuitAreaStatus: row.circuitAreaStatus,
                              });
                              setShowGreenModal(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#18232B] hover:bg-slate-100 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              operationTrainerStore.updateState((prev) => ({
                                ...prev,
                                greenOperatorRecords: prev.greenOperatorRecords
                                  .filter((r) => r.id !== row.id)
                                  .map((r, i) => ({ ...r, no: i + 1 })),
                              }));
                              bump();
                            }}
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
      </div>

      {/* Modal Orientasi */}
      <Modal
        open={showOriModal}
        onClose={() => setShowOriModal(false)}
        title={editingOri ? 'Edit Peserta Orientasi New Hire' : 'Tambah Peserta Orientasi New Hire'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            operationTrainerStore.updateState((prev) => {
              if (editingOri) {
                return {
                  ...prev,
                  orientasiNewHireRecords: prev.orientasiNewHireRecords.map((r) =>
                    r.id === editingOri.id ? { ...r, ...oriForm } : r
                  ),
                };
              }
              return {
                ...prev,
                orientasiNewHireRecords: [
                  ...prev.orientasiNewHireRecords,
                  {
                    id: `ori-${Date.now()}`,
                    no: prev.orientasiNewHireRecords.length + 1,
                    ...oriForm,
                  },
                ],
              };
            });
            setShowOriModal(false);
            bump();
          }}
          className="space-y-3"
        >
          <div>
            <label className={labelCls}>Lokasi Site</label>
            <select
              value={oriForm.site || 'Tangofa'}
              onChange={(e) =>
                setOriForm({ ...oriForm, site: e.target.value as TrainingSiteName })
              }
              className={inputCls}
            >
              {TRAINING_SITE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>NIK</label>
              <input
                type="text"
                required
                value={oriForm.nik}
                onChange={(e) => setOriForm({ ...oriForm, nik: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Nama Lengkap</label>
              <input
                type="text"
                required
                value={oriForm.nama}
                onChange={(e) => setOriForm({ ...oriForm, nama: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Jabatan</label>
              <input
                type="text"
                required
                value={oriForm.jabatan}
                onChange={(e) => setOriForm({ ...oriForm, jabatan: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Perusahaan (PT)</label>
              <input
                type="text"
                required
                value={oriForm.pt}
                onChange={(e) => setOriForm({ ...oriForm, pt: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Start Orientasi</label>
              <input
                type="text"
                value={oriForm.startOrientasi}
                onChange={(e) => setOriForm({ ...oriForm, startOrientasi: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Assessment</label>
              <input
                type="text"
                value={oriForm.assessment}
                onChange={(e) => setOriForm({ ...oriForm, assessment: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Total HM</label>
              <input
                type="number"
                step="0.1"
                value={oriForm.totalHm}
                onChange={(e) => setOriForm({ ...oriForm, totalHm: Number(e.target.value) || 0 })}
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select
              value={oriForm.status}
              onChange={(e) =>
                setOriForm({ ...oriForm, status: e.target.value as 'CLOSE' | 'ON PROGRESS' })
              }
              className={inputCls}
            >
              <option value="ON PROGRESS">ON PROGRESS</option>
              <option value="CLOSE">CLOSE (Selesai Orientasi)</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setShowOriModal(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Re-Training */}
      <Modal
        open={showRetModal}
        onClose={() => setShowRetModal(false)}
        title={editingRet ? 'Edit Data Re-Training' : 'Tambah Data Re-Training'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            operationTrainerStore.updateState((prev) => {
              if (editingRet) {
                return {
                  ...prev,
                  retrainingRecords: prev.retrainingRecords.map((r) =>
                    r.id === editingRet.id ? { ...r, ...retForm } : r
                  ),
                };
              }
              return {
                ...prev,
                retrainingCumulativeGrounded: prev.retrainingCumulativeGrounded + 1,
                retrainingCumulativeComplete: prev.retrainingCumulativeComplete + 1,
                retrainingRecords: [
                  ...prev.retrainingRecords,
                  {
                    id: `rt-${Date.now()}`,
                    no: prev.retrainingRecords.length + 1,
                    ...retForm,
                  },
                ],
              };
            });
            setShowRetModal(false);
            bump();
          }}
          className="space-y-3"
        >
          <div>
            <label className={labelCls}>Lokasi Site</label>
            <select
              value={retForm.site || 'Tangofa'}
              onChange={(e) =>
                setRetForm({ ...retForm, site: e.target.value as TrainingSiteName })
              }
              className={inputCls}
            >
              {TRAINING_SITE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Bulan</label>
              <select
                value={retForm.bulan}
                onChange={(e) =>
                  setRetForm({
                    ...retForm,
                    bulan: e.target.value as RetrainingRecord['bulan'],
                  })
                }
                className={inputCls}
              >
                <option value="SEPTEMBER">SEPTEMBER</option>
                <option value="OKTOBER">OKTOBER</option>
                <option value="NOVEMBER">NOVEMBER</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Tanggal</label>
              <input
                type="text"
                value={retForm.tanggal}
                onChange={(e) => setRetForm({ ...retForm, tanggal: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Nama Peserta</label>
              <input
                type="text"
                required
                value={retForm.namaPeserta}
                onChange={(e) => setRetForm({ ...retForm, namaPeserta: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Unit</label>
              <input
                type="text"
                required
                value={retForm.unit}
                onChange={(e) => setRetForm({ ...retForm, unit: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Catatan Investigasi / Re-Training</label>
            <input
              type="text"
              value={retForm.catatanInvestigasi}
              onChange={(e) => setRetForm({ ...retForm, catatanInvestigasi: e.target.value })}
              className={inputCls}
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setShowRetModal(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal FGDP */}
      <Modal
        open={showFgdpModal}
        onClose={() => setShowFgdpModal(false)}
        title={editingFgdp ? 'Edit Peserta FGDP' : 'Tambah Peserta FGDP'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            operationTrainerStore.updateState((prev) => {
              if (editingFgdp) {
                return {
                  ...prev,
                  fgdpRecords: prev.fgdpRecords.map((r) =>
                    r.id === editingFgdp.id ? { ...r, ...fgdpForm } : r
                  ),
                };
              }
              return {
                ...prev,
                fgdpRecords: [
                  ...prev.fgdpRecords,
                  {
                    id: `fgdp-${Date.now()}`,
                    no: prev.fgdpRecords.length + 1,
                    ...fgdpForm,
                  },
                ],
              };
            });
            setShowFgdpModal(false);
            bump();
          }}
          className="space-y-3"
        >
          <div>
            <label className={labelCls}>Lokasi Site</label>
            <select
              value={fgdpForm.site || 'Tangofa'}
              onChange={(e) =>
                setFgdpForm({ ...fgdpForm, site: e.target.value as TrainingSiteName })
              }
              className={inputCls}
            >
              {TRAINING_SITE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Tanggal</label>
              <input
                type="text"
                required
                value={fgdpForm.tanggal}
                onChange={(e) => setFgdpForm({ ...fgdpForm, tanggal: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Nama Lengkap</label>
              <input
                type="text"
                required
                value={fgdpForm.nama}
                onChange={(e) => setFgdpForm({ ...fgdpForm, nama: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Departemen</label>
              <input
                type="text"
                required
                value={fgdpForm.departemen}
                onChange={(e) => setFgdpForm({ ...fgdpForm, departemen: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Instructor</label>
              <input
                type="text"
                required
                value={fgdpForm.instructor}
                onChange={(e) => setFgdpForm({ ...fgdpForm, instructor: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setShowFgdpModal(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Green Operator */}
      <Modal
        open={showGreenModal}
        onClose={() => setShowGreenModal(false)}
        title={
          editingGreen
            ? 'Edit Siswa Green Operator ADT'
            : 'Tambah Siswa Green Operator ADT Batch VI'
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            operationTrainerStore.updateState((prev) => {
              if (editingGreen) {
                return {
                  ...prev,
                  greenOperatorRecords: prev.greenOperatorRecords.map((r) =>
                    r.id === editingGreen.id ? { ...r, ...greenForm } : r
                  ),
                };
              }
              return {
                ...prev,
                greenOperatorRecords: [
                  ...prev.greenOperatorRecords,
                  {
                    id: `go-${Date.now()}`,
                    no: prev.greenOperatorRecords.length + 1,
                    ...greenForm,
                  },
                ],
              };
            });
            setShowGreenModal(false);
            bump();
          }}
          className="space-y-3"
        >
          <div>
            <label className={labelCls}>Lokasi Site</label>
            <select
              value={greenForm.site || 'Tangofa'}
              onChange={(e) =>
                setGreenForm({ ...greenForm, site: e.target.value as TrainingSiteName })
              }
              className={inputCls}
            >
              {TRAINING_SITE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>NIK</label>
              <input
                type="text"
                required
                value={greenForm.nik}
                onChange={(e) => setGreenForm({ ...greenForm, nik: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Nama Siswa</label>
              <input
                type="text"
                required
                value={greenForm.nama}
                onChange={(e) => setGreenForm({ ...greenForm, nama: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Jabatan Awal</label>
              <input
                type="text"
                required
                value={greenForm.jabatanAwal}
                onChange={(e) => setGreenForm({ ...greenForm, jabatanAwal: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Previous Department</label>
              <input
                type="text"
                required
                value={greenForm.previousDept}
                onChange={(e) => setGreenForm({ ...greenForm, previousDept: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Training Class Status</label>
              <select
                value={greenForm.trainingClassStatus}
                onChange={(e) =>
                  setGreenForm({
                    ...greenForm,
                    trainingClassStatus: e.target.value as GreenOperatorRecord['trainingClassStatus'],
                  })
                }
                className={inputCls}
              >
                <option value="Done">Done</option>
                <option value="On Going">On Going</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Circuit Area Status</label>
              <select
                value={greenForm.circuitAreaStatus}
                onChange={(e) =>
                  setGreenForm({
                    ...greenForm,
                    circuitAreaStatus: e.target.value as GreenOperatorRecord['circuitAreaStatus'],
                  })
                }
                className={inputCls}
              >
                <option value="On Going">On Going</option>
                <option value="Done">Done</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setShowGreenModal(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Lightbox */}
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
