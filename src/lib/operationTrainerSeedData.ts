// ============================================================================
// SEED DATA & STORE FOR SLIDES 7 - 15 (OPERATION TRAINER & SITE GENBA REPORTS)
// Sub-Menu 4: Assessment, Cross & Skill Up Operator (Slides 7, 8, 9)
// Sub-Menu 5: Orientasi, Re-Training, FGDP & Green Operator (Slides 10, 11, 12, 15)
// Sub-Menu 6: Training Site Genba & Daily Operation Trainer (Slides 13, 13A, 13B, 14)
// ============================================================================

export const TRAINING_SITE_OPTIONS = [
  'Head Office',
  'Tangofa',
  'Genba',
  'Sampala',
  'Gorontalo',
  'Belopa (Masmindo)',
  'TPM',
] as const;

export type TrainingSiteName = (typeof TRAINING_SITE_OPTIONS)[number] | string;

export const normalizeSiteName = (
  raw?: string | null,
  fallback: (typeof TRAINING_SITE_OPTIONS)[number] = 'Tangofa'
): (typeof TRAINING_SITE_OPTIONS)[number] => {
  if (!raw) return fallback;
  const s = raw.trim().toLowerCase();
  if (s.includes('head office') || s.includes('makassar') || s === 'ho') return 'Head Office';
  if (s.includes('genba') || s.includes('gemba')) return 'Genba';
  if (s.includes('sampala')) return 'Sampala';
  if (s.includes('gorontalo')) return 'Gorontalo';
  if (s.includes('belopa') || s.includes('masmindo')) return 'Belopa (Masmindo)';
  if (s.includes('tpm')) return 'TPM';
  if (s.includes('tangofa')) return 'Tangofa';
  return fallback;
};

export type OperationProgramStatus =
  | 'CLOSE'
  | 'ON PROGRESS'
  | 'ORIENTASI'
  | 'ON SCHEDULE'
  | 'HOLD'
  | 'CANCEL';

// --- Assessment Candidate Operator & Driver (SIMPER) ---
export interface SimperAssessmentRecord {
  id: string;
  no: number;
  tanggal: string;
  actual: number;
  kandidatNama: string;
  unit: string;
  ket: string;
  status: 'CLOSE' | 'ON PROGRESS';
  photos: string[];
  site?: TrainingSiteName;
}

// --- Cross Training & Skill Up Operator & Driver ---
export interface CrossAndSkillUpRecord {
  id: string;
  no: number;
  programType: 'CROSS_TRAINING' | 'SKILL_UP';
  nik: string;
  nama: string;
  dept: string;
  jabatanAwal: string;
  jabatanTarget: string;
  pengajuanSimperUnit: string;
  classTrainingDate: string;
  assessmentDate: string;
  startOrientasiDate: string;
  finalAssessmentDate: string;
  kategoriKet: string; // e.g. 'Similar', 'Cross Training', 'SKILL UP', 'Pengajuan Lainnya'
  status: OperationProgramStatus;
  keteranganStatus: string;
  pic: string;
  catatanTambahan: string;
  site?: TrainingSiteName;
}

export interface StatusMatrixOverride {
  HOLD: number;
  ON_SCHEDULE: number;
  ON_PROGRESS: number;
  ORIENTASI: number;
  CLOSE: number;
  CANCEL: number;
}

// --- Orientasi New Hire / Operator & Driver ---
export interface OrientasiNewHireRecord {
  id: string;
  no: number;
  nik: string;
  nama: string;
  jabatan: string;
  startOrientasi: string;
  assessment: string;
  ket: string;
  status: 'CLOSE' | 'ON PROGRESS';
  pt: string;
  totalHm: number;
  site?: TrainingSiteName;
}

export interface SelesaiOrientasiLog {
  id: string;
  no: number;
  tanggal: string;
  actual: number;
  unit: string;
  ket: string;
  photos: string[];
  site?: TrainingSiteName;
}

// --- Re-Training Program & Investigasi Incident ---
export interface RetrainingRecord {
  id: string;
  no: number;
  bulan: 'SEPTEMBER' | 'OKTOBER' | 'NOVEMBER' | 'LAINNYA';
  tanggal: string;
  namaPeserta: string;
  unit: string;
  grounded: number;
  complete: number;
  persentase: number;
  ket: 'DONE' | 'ON PROGRESS';
  catatanInvestigasi: string;
  site?: TrainingSiteName;
}

// --- Pembekalan & Orientasi FGDP di TC ---
export interface FgdpTrainingRecord {
  id: string;
  no: number;
  tanggal: string;
  nama: string;
  departemen: string;
  provider: string;
  program: string;
  instructor: string;
  status: 'Done' | 'On Going';
  site?: TrainingSiteName;
}

// --- Program Training 20x Green Operator ADT Batch VI ---
export interface GreenOperatorRecord {
  id: string;
  no: number;
  nik: string;
  nama: string;
  jabatanAwal: string;
  previousDept: string;
  position: string;
  trainingClassStatus: 'Done' | 'On Going' | 'Pending';
  circuitAreaStatus: 'Done' | 'On Going' | 'Pending';
  site?: TrainingSiteName;
}

export interface GreenOperatorStep {
  stepNo: number;
  title: string;
  duration: string;
  status: 'Done' | 'On Going' | 'Pending';
  description: string;
}

// --- Kegiatan Training & Assessment di Site Gemba ---
export interface SiteGenbaRecord {
  id: string;
  no: number;
  category: 'CLASS' | 'ASSESSMENT_REFRESH';
  tanggal: string;
  nama: string;
  posisi: string;
  unit: string;
  dept: string;
  provider: string;
  activitas: string;
  instructor: string;
  perusahaan: string;
  status: 'Done' | 'On Going';
  site?: TrainingSiteName;
}

// --- Daily Training Activities Operation Trainer di Tangofa ---
export interface DailyOperationTrainerLog {
  id: string;
  no: number;
  date: string;
  attendents: string;
  participantCount: number;
  dept: string;
  activities: string;
  remarks: 'Done' | 'Continue';
  photos: string[];
  site?: TrainingSiteName;
}

export interface OperationTrainerModuleState {
  // Slide 7
  simperCumulativeYtd: number;
  simperAssessments: SimperAssessmentRecord[];
  simperPhotos: string[];
  // Slide 8
  crossMatrixSummary: StatusMatrixOverride;
  crossHighlights: string[];
  crossTrainingRecords: CrossAndSkillUpRecord[];
  crossPhotos: string[];
  // Slide 9
  skillUpMatrixSummary: StatusMatrixOverride;
  skillUpRecords: CrossAndSkillUpRecord[];
  skillUpPhotos: string[];
  // Slide 10
  orientasiCompletedOctCount: number;
  orientasiCumulativeTotal: number;
  orientasiNewHireRecords: OrientasiNewHireRecord[];
  selesaiOrientasiLogs: SelesaiOrientasiLog[];
  orientasiPhotos: string[];
  // Slide 11
  retrainingCumulativeGrounded: number;
  retrainingCumulativeComplete: number;
  retrainingIncidentSummary: string[];
  retrainingRecords: RetrainingRecord[];
  retrainingPhotos: string[];
  // Slide 12
  fgdpRecords: FgdpTrainingRecord[];
  fgdpPhotos: string[];
  // Slide 15
  greenOperatorSteps: GreenOperatorStep[];
  greenOperatorRecords: GreenOperatorRecord[];
  greenOperatorPhotos: string[];
  // Slide 13, 13A, 13B
  genbaClassRecords: SiteGenbaRecord[];
  genbaClassPhotos: string[];
  genbaAssessmentRecords: SiteGenbaRecord[];
  genbaAssessmentPhotos: string[];
  // Slide 14
  dailyOperationTrainerLogs: DailyOperationTrainerLog[];
  dailyOperationPhotos: string[];
}

// ============================================================================
// INITIAL SEED DATA (100% Match with PPT Slides 7 to 15)
// ============================================================================

export const INITIAL_SIMPER_PHOTOS: string[] = [
  '/images/ppt_w1_nov/slide7_row1_a.jpg',
  '/images/ppt_w1_nov/slide7_row1_b.jpg',
  '/images/ppt_w1_nov/slide7_row2_a.jpg',
  '/images/ppt_w1_nov/slide7_row2_b.jpg',
  '/images/ppt_w1_nov/slide7_row3_a.jpg',
  '/images/ppt_w1_nov/slide7_row3_b.jpg',
];

export const INITIAL_CROSS_PHOTOS: string[] = [
  '/images/ppt_w1_nov/image4.jpg',
  '/images/ppt_w1_nov/image5.jpg',
];

export const INITIAL_SKILL_UP_PHOTOS: string[] = [
  '/images/ppt_w1_nov/slide10_row1_a.jpg',
  '/images/ppt_w1_nov/slide10_row4_b.jpg',
  '/images/ppt_w1_nov/image4.jpg',
];

export const INITIAL_ORIENTASI_PHOTOS: string[] = [
  '/images/ppt_w1_nov/slide10_row1_a.jpg',
  '/images/ppt_w1_nov/slide10_row1_b.jpg',
  '/images/ppt_w1_nov/slide10_row2_a.jpg',
  '/images/ppt_w1_nov/slide10_row2_b.jpg',
  '/images/ppt_w1_nov/slide10_row3_a.jpg',
  '/images/ppt_w1_nov/slide10_row3_b.jpg',
  '/images/ppt_w1_nov/slide10_row4_a.jpg',
  '/images/ppt_w1_nov/slide10_row4_b.jpg',
];

export const INITIAL_RETRAINING_PHOTOS: string[] = [
  '/images/ppt_w1_nov/image10.jpg',
  '/images/ppt_w1_nov/image11.jpg',
];

export const INITIAL_FGDP_PHOTOS: string[] = [
  '/images/ppt_w1_nov/image13.jpg',
  '/images/ppt_w1_nov/image14.jpg',
  '/images/ppt_w1_nov/image16.jpg',
];

export const INITIAL_GREEN_OPERATOR_PHOTOS: string[] = [
  '/images/ppt_w1_nov/image33.jpeg',
  '/images/ppt_w1_nov/image34.jpeg',
  '/images/ppt_w1_nov/image35.jpeg',
  '/images/ppt_w1_nov/image36.jpeg',
];

export const INITIAL_GENBA_CLASS_PHOTOS: string[] = [
  '/images/ppt_w1_nov/image18.jpg',
  '/images/ppt_w1_nov/image19.jpg',
  '/images/ppt_w1_nov/image20.jpg',
  '/images/ppt_w1_nov/slide13a_doc1.jpg',
  '/images/ppt_w1_nov/slide13a_doc2.jpg',
  '/images/ppt_w1_nov/slide13a_doc4.jpg',
  '/images/ppt_w1_nov/slide13a_doc5.jpg',
];

export const INITIAL_GENBA_ASSESSMENT_PHOTOS: string[] = [
  '/images/ppt_w1_nov/image24.jpeg',
  '/images/ppt_w1_nov/image25.jpeg',
  '/images/ppt_w1_nov/image26.jpeg',
  '/images/ppt_w1_nov/image18.jpg',
];

export const INITIAL_DAILY_OPERATION_PHOTOS: string[] = [
  '/images/ppt_w1_nov/slide14_row1_a.jpg',
  '/images/ppt_w1_nov/slide14_row1_b.jpg',
  '/images/ppt_w1_nov/slide14_row2_a.jpg',
  '/images/ppt_w1_nov/slide14_row2_b.jpg',
  '/images/ppt_w1_nov/slide14_row3_a.jpg',
  '/images/ppt_w1_nov/slide14_row3_b.jpg',
  '/images/ppt_w1_nov/slide14_row4_a.jpg',
  '/images/ppt_w1_nov/slide14_row4_b.jpg',
  '/images/ppt_w1_nov/slide14_row5_a.jpg',
  '/images/ppt_w1_nov/slide14_row5_b.jpg',
  '/images/ppt_w1_nov/slide14_row6_a.jpg',
  '/images/ppt_w1_nov/slide14_row6_b.jpg',
  '/images/ppt_w1_nov/slide14_row7_a.jpg',
  '/images/ppt_w1_nov/slide14_row7_b.jpg',
  '/images/ppt_w1_nov/slide14_row8_a.jpg',
  '/images/ppt_w1_nov/slide14_row8_b.jpg',
  '/images/ppt_w1_nov/slide14_row9_a.jpg',
  '/images/ppt_w1_nov/slide14_row9_b.jpg',
];

const INITIAL_SIMPER_ASSESSMENTS: SimperAssessmentRecord[] = [
  {
    id: 'simper-w1-1',
    no: 1,
    tanggal: '2-Nov-26',
    actual: 1,
    kandidatNama: 'Anno Palangda (Moving Unit ADT, LV, Excavator & DT)',
    unit: '1x Tes Praktek pada Unit LV, ADT, Excavator, & DT',
    ket: 'INTERNAL PT RJS',
    status: 'CLOSE',
    photos: ['/images/ppt_w1_nov/slide7_row1_a.jpg', '/images/ppt_w1_nov/slide7_row1_b.jpg'],
  },
  {
    id: 'simper-w1-2',
    no: 2,
    tanggal: '3-Nov-26',
    actual: 2,
    kandidatNama: '2x Kandidat Driver LV 4x4 (MOD / PLM)',
    unit: '2x Tes Praktek pada unit LV',
    ket: 'INTERNAL PT RJS',
    status: 'CLOSE',
    photos: ['/images/ppt_w1_nov/slide7_row2_a.jpg', '/images/ppt_w1_nov/slide7_row2_b.jpg'],
  },
  {
    id: 'simper-w1-3',
    no: 3,
    tanggal: '4-Nov-26',
    actual: 1,
    kandidatNama: '1x Kandidat Driver LV 4x4 Crew PLM',
    unit: '1x Tes Praktek pada unit LV',
    ket: 'INTERNAL PT RJS',
    status: 'CLOSE',
    photos: ['/images/ppt_w1_nov/slide7_row3_a.jpg', '/images/ppt_w1_nov/slide7_row3_b.jpg'],
  },
];

const INITIAL_CROSS_TRAINING_RECORDS: CrossAndSkillUpRecord[] = [
  {
    id: 'ct-1',
    no: 1,
    programType: 'CROSS_TRAINING',
    nik: '24000844',
    nama: 'Nofianus Batara',
    dept: 'MOD',
    jabatanAwal: 'Operator Rock Breaker',
    jabatanTarget: 'Operator Excavator',
    pengajuanSimperUnit: 'Excavator',
    classTrainingDate: '-',
    assessmentDate: '-',
    startOrientasiDate: '-',
    finalAssessmentDate: '-',
    kategoriKet: 'Similar',
    status: 'ON SCHEDULE',
    keteranganStatus: 'ON SCHEDULE',
    pic: 'TC',
    catatanTambahan: 'Pending Trainer',
  },
  {
    id: 'ct-2',
    no: 2,
    programType: 'CROSS_TRAINING',
    nik: '25001643',
    nama: 'Aris',
    dept: 'MOD',
    jabatanAwal: 'Operator Breaker',
    jabatanTarget: 'Operator Excavator',
    pengajuanSimperUnit: 'Excavator',
    classTrainingDate: '3 October 2026',
    assessmentDate: '3 October 2026',
    startOrientasiDate: '-',
    finalAssessmentDate: '-',
    kategoriKet: 'Similar',
    status: 'ON PROGRESS',
    keteranganStatus: 'PENGAJUAN SIMPER',
    pic: 'HR',
    catatanTambahan: 'PROGRES HJP',
  },
  {
    id: 'ct-3',
    no: 3,
    programType: 'CROSS_TRAINING',
    nik: '24000528',
    nama: 'Leo Randi',
    dept: 'MOD',
    jabatanAwal: 'Operator Breaker',
    jabatanTarget: 'Operator Excavator',
    pengajuanSimperUnit: 'Excavator',
    classTrainingDate: '-',
    assessmentDate: '-',
    startOrientasiDate: '-',
    finalAssessmentDate: '-',
    kategoriKet: 'Similar',
    status: 'ON SCHEDULE',
    keteranganStatus: 'ON SCHEDULE',
    pic: 'TC',
    catatanTambahan: 'Pending Trainer',
  },
  {
    id: 'ct-4',
    no: 4,
    programType: 'CROSS_TRAINING',
    nik: '23000311',
    nama: 'Warka',
    dept: 'MOD',
    jabatanAwal: 'Operator Excavator',
    jabatanTarget: 'Operator Rock Breaker',
    pengajuanSimperUnit: 'Breaker',
    classTrainingDate: '12 August 2026',
    assessmentDate: '12 August 2026',
    startOrientasiDate: '19 October 2026',
    finalAssessmentDate: '31 October 2026',
    kategoriKet: 'Similar',
    status: 'CLOSE',
    keteranganStatus: 'CLOSE',
    pic: 'CLOSE',
    catatanTambahan: 'CLOSE',
  },
  {
    id: 'ct-5',
    no: 5,
    programType: 'CROSS_TRAINING',
    nik: '24000738',
    nama: 'Aslin',
    dept: 'MOD',
    jabatanAwal: 'Operator Excavator',
    jabatanTarget: 'Operator Rock Breaker',
    pengajuanSimperUnit: 'Breaker',
    classTrainingDate: '31 July 2026',
    assessmentDate: '31 July 2026',
    startOrientasiDate: '14-Aug-2026',
    finalAssessmentDate: '-',
    kategoriKet: 'Similar',
    status: 'ORIENTASI',
    keteranganStatus: 'ORIENTASI',
    pic: 'MOD',
    catatanTambahan: 'Bawa Long Arm (Rental HM) (Pending TC)',
  },
  {
    id: 'ct-6',
    no: 6,
    programType: 'CROSS_TRAINING',
    nik: '26002260',
    nama: 'Ramdan H Pare',
    dept: 'PLM',
    jabatanAwal: 'Driver Service Truck',
    jabatanTarget: 'Driver Water Truck',
    pengajuanSimperUnit: 'Water Truck',
    classTrainingDate: '14 August 2026',
    assessmentDate: '14 August 2026',
    startOrientasiDate: '-',
    finalAssessmentDate: '-',
    kategoriKet: 'Similar',
    status: 'ON PROGRESS',
    keteranganStatus: 'SIMPER DONE',
    pic: 'TC',
    catatanTambahan: 'Pending Trainer',
  },
  {
    id: 'ct-7',
    no: 7,
    programType: 'CROSS_TRAINING',
    nik: '25001867',
    nama: 'Joni Pasambo',
    dept: 'MOD',
    jabatanAwal: 'Opt. Excavator',
    jabatanTarget: 'Operator Rock Breaker',
    pengajuanSimperUnit: 'Rock Breaker',
    classTrainingDate: '-',
    assessmentDate: '-',
    startOrientasiDate: '-',
    finalAssessmentDate: '-',
    kategoriKet: 'Similar',
    status: 'ON SCHEDULE',
    keteranganStatus: 'ON SCHEDULE',
    pic: 'TC',
    catatanTambahan: 'Pending Trainer',
  },
  {
    id: 'ct-8',
    no: 8,
    programType: 'CROSS_TRAINING',
    nik: '24001477',
    nama: 'Nataniel Manting',
    dept: 'MOD',
    jabatanAwal: 'Operator Excavator',
    jabatanTarget: 'Operator Rock Breaker',
    pengajuanSimperUnit: 'Breaker',
    classTrainingDate: '12 August 2026',
    assessmentDate: '8/12/2026 - 10/26/2026',
    startOrientasiDate: '-',
    finalAssessmentDate: '-',
    kategoriKet: 'Similar',
    status: 'ON PROGRESS',
    keteranganStatus: 'SIMPER DONE',
    pic: 'TC',
    catatanTambahan: 'Pending Trainer',
  },
  {
    id: 'ct-9',
    no: 9,
    programType: 'CROSS_TRAINING',
    nik: '26002329',
    nama: 'Muh Arif Refli',
    dept: 'MOD',
    jabatanAwal: 'Operator Excavator',
    jabatanTarget: 'Operator Rock Breaker',
    pengajuanSimperUnit: 'Breaker',
    classTrainingDate: '26 June 2026',
    assessmentDate: '26 June 2026',
    startOrientasiDate: '23 August 2026',
    finalAssessmentDate: '29 October 2026',
    kategoriKet: 'Similar',
    status: 'CLOSE',
    keteranganStatus: 'CLOSE',
    pic: 'CLOSE',
    catatanTambahan: 'CLOSE',
  },
  {
    id: 'ct-10',
    no: 10,
    programType: 'CROSS_TRAINING',
    nik: '26002315',
    nama: 'Yantho Lalang',
    dept: 'MOD',
    jabatanAwal: 'Operator Excavator',
    jabatanTarget: 'Operator Rock Breaker',
    pengajuanSimperUnit: 'Breaker',
    classTrainingDate: '-',
    assessmentDate: '-',
    startOrientasiDate: '-',
    finalAssessmentDate: '-',
    kategoriKet: 'Similar',
    status: 'ON SCHEDULE',
    keteranganStatus: 'ON SCHEDULE',
    pic: 'TC',
    catatanTambahan: 'Pending Trainer',
  },
  {
    id: 'ct-11',
    no: 11,
    programType: 'CROSS_TRAINING',
    nik: '26002331',
    nama: 'M Imran',
    dept: 'MOD',
    jabatanAwal: 'Operator Excavator',
    jabatanTarget: 'Operator Rock Breaker',
    pengajuanSimperUnit: 'Breaker',
    classTrainingDate: '29 June 2026',
    assessmentDate: '30 June 2026',
    startOrientasiDate: '-',
    finalAssessmentDate: '-',
    kategoriKet: 'Similar',
    status: 'ON PROGRESS',
    keteranganStatus: 'SIMPER DONE',
    pic: 'TC',
    catatanTambahan: 'Pending Trainer',
  },
  {
    id: 'ct-12',
    no: 12,
    programType: 'CROSS_TRAINING',
    nik: '26002328',
    nama: "Randi Para'bung",
    dept: 'MOD',
    jabatanAwal: 'Operator Excavator',
    jabatanTarget: 'Operator Buldozer',
    pengajuanSimperUnit: 'Buldozer',
    classTrainingDate: '3 August 2026',
    assessmentDate: '8/3/2026 - 10/26/2026',
    startOrientasiDate: '-',
    finalAssessmentDate: '-',
    kategoriKet: 'Cross Training',
    status: 'ON PROGRESS',
    keteranganStatus: 'SIMPER DONE',
    pic: 'TC',
    catatanTambahan: 'Pending Trainer',
  },
  {
    id: 'ct-13',
    no: 13,
    programType: 'CROSS_TRAINING',
    nik: '26002316',
    nama: 'Irsal Ramadhan',
    dept: 'MOD',
    jabatanAwal: 'Operator Excavator',
    jabatanTarget: 'Operator Buldozer',
    pengajuanSimperUnit: 'Buldozer',
    classTrainingDate: '3 August 2026',
    assessmentDate: '3 August 2026',
    startOrientasiDate: '-',
    finalAssessmentDate: '-',
    kategoriKet: 'Resign',
    status: 'CANCEL',
    keteranganStatus: 'Resign',
    pic: 'Resign',
    catatanTambahan: 'Resign',
  },
  {
    id: 'ct-14',
    no: 14,
    programType: 'CROSS_TRAINING',
    nik: '24001482',
    nama: 'Muhammad Rafli',
    dept: 'MOD',
    jabatanAwal: 'Operator Excavator',
    jabatanTarget: 'Operator Buldozer',
    pengajuanSimperUnit: 'Buldozer',
    classTrainingDate: '4 August 2026',
    assessmentDate: '4 August 2026',
    startOrientasiDate: '1-Nov-2026',
    finalAssessmentDate: '-',
    kategoriKet: 'Cross Training',
    status: 'ORIENTASI',
    keteranganStatus: 'ORIENTASI',
    pic: 'TC',
    catatanTambahan: 'Pending Trainer (OJT D65 di Field)',
  },
  {
    id: 'ct-15',
    no: 15,
    programType: 'CROSS_TRAINING',
    nik: '25002232',
    nama: 'La Ode M Sugar',
    dept: 'MOD',
    jabatanAwal: 'Driver DT 12R',
    jabatanTarget: 'Driver DT 12R / WT',
    pengajuanSimperUnit: 'WATER TRUCK',
    classTrainingDate: '16 September 2026',
    assessmentDate: '27 September 2026',
    startOrientasiDate: '15-Oct-2026',
    finalAssessmentDate: '-',
    kategoriKet: 'Similar',
    status: 'ORIENTASI',
    keteranganStatus: 'ORIENTASI',
    pic: 'TC',
    catatanTambahan: 'Final Assessment (Cuti)',
  },
  {
    id: 'ct-16',
    no: 16,
    programType: 'CROSS_TRAINING',
    nik: '26002462',
    nama: 'Alber Pasambo',
    dept: 'MOD',
    jabatanAwal: 'Driver DT 12R',
    jabatanTarget: 'Driver Water Truck',
    pengajuanSimperUnit: 'WATER TRUCK',
    classTrainingDate: '16 September 2026',
    assessmentDate: '17 September 2026',
    startOrientasiDate: '4-Nov-2026',
    finalAssessmentDate: '-',
    kategoriKet: 'Similar',
    status: 'ORIENTASI',
    keteranganStatus: 'ORIENTASI',
    pic: 'TC',
    catatanTambahan: 'Pending Trainer',
  },
  {
    id: 'ct-17',
    no: 17,
    programType: 'CROSS_TRAINING',
    nik: '26002249',
    nama: 'Kasmir Andika S',
    dept: 'PLM',
    jabatanAwal: 'Driver Service Truck',
    jabatanTarget: 'Driver Water Truck',
    pengajuanSimperUnit: 'WATER TRUCK',
    classTrainingDate: '10 September 2026',
    assessmentDate: '10 September 2026',
    startOrientasiDate: '-',
    finalAssessmentDate: '-',
    kategoriKet: 'Similar',
    status: 'ON PROGRESS',
    keteranganStatus: 'SIMPER DONE',
    pic: 'TC',
    catatanTambahan: 'Pending Trainer',
  },
  {
    id: 'ct-18',
    no: 18,
    programType: 'CROSS_TRAINING',
    nik: '26002423',
    nama: 'Muh Amin',
    dept: 'MOD',
    jabatanAwal: 'Operator MG',
    jabatanTarget: 'Operator Compactor',
    pengajuanSimperUnit: 'Compactor',
    classTrainingDate: '23 October 2026',
    assessmentDate: '23 October 2026',
    startOrientasiDate: '-',
    finalAssessmentDate: '-',
    kategoriKet: 'Pengajuan Lainnya',
    status: 'ON PROGRESS',
    keteranganStatus: 'SIMPER DONE',
    pic: 'TC',
    catatanTambahan: 'Hold karena info MOD operator Compactor sudah Over',
  },
  {
    id: 'ct-19',
    no: 19,
    programType: 'CROSS_TRAINING',
    nik: '26002549',
    nama: 'Ronald Matipa',
    dept: 'MOD',
    jabatanAwal: 'Operator MG',
    jabatanTarget: 'Operator Compactor',
    pengajuanSimperUnit: 'Compactor',
    classTrainingDate: '23 October 2026',
    assessmentDate: '23 October 2026',
    startOrientasiDate: '-',
    finalAssessmentDate: '-',
    kategoriKet: 'Pengajuan Lainnya',
    status: 'ON PROGRESS',
    keteranganStatus: 'SIMPER DONE',
    pic: 'TC',
    catatanTambahan: 'Hold karena info MOD operator Compactor sudah Over',
  },
];

const INITIAL_SKILL_UP_RECORDS: CrossAndSkillUpRecord[] = [
  {
    id: 'su-1',
    no: 1,
    programType: 'SKILL_UP',
    nik: '24000890',
    nama: 'Arnan P',
    dept: 'MOD',
    jabatanAwal: 'Driver DT 10 R',
    jabatanTarget: 'Driver DT 12 R',
    pengajuanSimperUnit: 'DT 12 R',
    classTrainingDate: '1 July 2026',
    assessmentDate: '2 July 2026',
    startOrientasiDate: '-',
    finalAssessmentDate: '-',
    kategoriKet: 'SKILL UP',
    status: 'CLOSE',
    keteranganStatus: 'ORIENTASI',
    pic: 'MOD',
    catatanTambahan: 'DI ALIHKAN KEMBALI KE HJP DT 10 R',
  },
  {
    id: 'su-2',
    no: 2,
    programType: 'SKILL_UP',
    nik: '25001726',
    nama: 'Marianto',
    dept: 'MOD',
    jabatanAwal: 'Driver DT 10 R',
    jabatanTarget: 'Driver DT 12 R',
    pengajuanSimperUnit: 'DT 12 R',
    classTrainingDate: '1 July 2026',
    assessmentDate: '2 July 2026',
    startOrientasiDate: '14 July 2026',
    finalAssessmentDate: '-',
    kategoriKet: 'SKILL UP',
    status: 'CLOSE',
    keteranganStatus: 'ORIENTASI',
    pic: 'MOD',
    catatanTambahan: 'DI ALIHKAN KEMBALI KE HJP DT 10 R',
  },
  {
    id: 'su-3',
    no: 3,
    programType: 'SKILL_UP',
    nik: '26002345',
    nama: 'Chelvin Bara Layuk',
    dept: 'MOD',
    jabatanAwal: 'Driver DT 10 R',
    jabatanTarget: 'Driver DT 12 R',
    pengajuanSimperUnit: 'DT 12 R',
    classTrainingDate: '1 July 2026',
    assessmentDate: '2 July 2026',
    startOrientasiDate: '14 July 2026',
    finalAssessmentDate: '-',
    kategoriKet: 'SKILL UP',
    status: 'CLOSE',
    keteranganStatus: 'ORIENTASI',
    pic: 'MOD',
    catatanTambahan: 'DI ALIHKAN KEMBALI KE HJP DT 10 R',
  },
  {
    id: 'su-4',
    no: 4,
    programType: 'SKILL_UP',
    nik: '24001290',
    nama: 'Assa Duma',
    dept: 'MOD',
    jabatanAwal: 'Driver DT 10 R',
    jabatanTarget: 'Driver DT 12 R',
    pengajuanSimperUnit: 'DT 12 R',
    classTrainingDate: '-',
    assessmentDate: '-',
    startOrientasiDate: '-',
    finalAssessmentDate: '-',
    kategoriKet: 'SKILL UP',
    status: 'HOLD',
    keteranganStatus: 'HOLD',
    pic: 'MOD',
    catatanTambahan: '-',
  },
  {
    id: 'su-5',
    no: 5,
    programType: 'SKILL_UP',
    nik: '24000592',
    nama: 'Fadly Pratama',
    dept: 'MOD',
    jabatanAwal: 'Driver DT 10 R',
    jabatanTarget: 'Driver DT 12 R',
    pengajuanSimperUnit: 'DT 12 R',
    classTrainingDate: '1 July 2026',
    assessmentDate: '2 July 2026',
    startOrientasiDate: '14 July 2026',
    finalAssessmentDate: '-',
    kategoriKet: 'SKILL UP',
    status: 'CLOSE',
    keteranganStatus: 'ORIENTASI',
    pic: 'MOD',
    catatanTambahan: 'DI ALIHKAN KEMBALI KE HJP DT 10 R',
  },
  {
    id: 'su-6',
    no: 6,
    programType: 'SKILL_UP',
    nik: '24001388',
    nama: 'Aslan',
    dept: 'MOD',
    jabatanAwal: 'Driver DT 10 R',
    jabatanTarget: 'Driver DT 12 R',
    pengajuanSimperUnit: 'DT 12 R',
    classTrainingDate: '-',
    assessmentDate: '-',
    startOrientasiDate: '-',
    finalAssessmentDate: '-',
    kategoriKet: 'SKILL UP',
    status: 'HOLD',
    keteranganStatus: 'HOLD',
    pic: 'MOD',
    catatanTambahan: '-',
  },
  {
    id: 'su-7',
    no: 7,
    programType: 'SKILL_UP',
    nik: '24001403',
    nama: 'Jumaali',
    dept: 'MOD',
    jabatanAwal: 'Driver DT 10 R',
    jabatanTarget: 'Driver DT 12 R',
    pengajuanSimperUnit: 'DT 12 R',
    classTrainingDate: '-',
    assessmentDate: '-',
    startOrientasiDate: '-',
    finalAssessmentDate: '-',
    kategoriKet: 'SKILL UP',
    status: 'HOLD',
    keteranganStatus: 'HOLD',
    pic: 'MOD',
    catatanTambahan: '-',
  },
  {
    id: 'su-8',
    no: 8,
    programType: 'SKILL_UP',
    nik: '24001272',
    nama: 'Sabri',
    dept: 'MOD',
    jabatanAwal: 'Driver DT 10 R',
    jabatanTarget: 'Driver DT 12 R',
    pengajuanSimperUnit: 'DT 12 R',
    classTrainingDate: '-',
    assessmentDate: '-',
    startOrientasiDate: '-',
    finalAssessmentDate: '-',
    kategoriKet: 'SKILL UP',
    status: 'HOLD',
    keteranganStatus: 'HOLD',
    pic: 'MOD',
    catatanTambahan: '-',
  },
  {
    id: 'su-9',
    no: 9,
    programType: 'SKILL_UP',
    nik: '20220530',
    nama: 'Muh. Usman Sulaiman',
    dept: 'MOD',
    jabatanAwal: 'Driver DT 10 R',
    jabatanTarget: 'Driver DT 12 R',
    pengajuanSimperUnit: 'DT 12 R',
    classTrainingDate: '-',
    assessmentDate: '-',
    startOrientasiDate: '-',
    finalAssessmentDate: '-',
    kategoriKet: 'SKILL UP',
    status: 'HOLD',
    keteranganStatus: 'HOLD',
    pic: 'MOD',
    catatanTambahan: '-',
  },
  {
    id: 'su-10',
    no: 10,
    programType: 'SKILL_UP',
    nik: '2000074',
    nama: 'La ode Batirun',
    dept: 'MOD',
    jabatanAwal: 'Driver DT 10 R',
    jabatanTarget: 'Driver DT 12 R',
    pengajuanSimperUnit: 'DT 12 R',
    classTrainingDate: '-',
    assessmentDate: '-',
    startOrientasiDate: '-',
    finalAssessmentDate: '-',
    kategoriKet: 'SKILL UP',
    status: 'HOLD',
    keteranganStatus: 'HOLD',
    pic: 'MOD',
    catatanTambahan: '-',
  },
  {
    id: 'su-11',
    no: 11,
    programType: 'SKILL_UP',
    nik: '25001724',
    nama: 'Amsal',
    dept: 'MOD',
    jabatanAwal: 'Driver DT 10 R',
    jabatanTarget: 'Driver DT 12 R',
    pengajuanSimperUnit: 'DT 12 R',
    classTrainingDate: '1 July 2026',
    assessmentDate: '2 July 2026',
    startOrientasiDate: '14 July 2026',
    finalAssessmentDate: '-',
    kategoriKet: 'SKILL UP',
    status: 'CLOSE',
    keteranganStatus: 'ORIENTASI',
    pic: 'MOD',
    catatanTambahan: 'DI ALIHKAN KEMBALI KE HJP DT 10 R',
  },
  {
    id: 'su-12',
    no: 12,
    programType: 'SKILL_UP',
    nik: '24001403-B',
    nama: 'Ilham Miswar',
    dept: 'MOD',
    jabatanAwal: 'Driver DT 10 R',
    jabatanTarget: 'Driver DT 12 R',
    pengajuanSimperUnit: 'DT 12 R',
    classTrainingDate: '-',
    assessmentDate: '-',
    startOrientasiDate: '-',
    finalAssessmentDate: '-',
    kategoriKet: 'SKILL UP',
    status: 'HOLD',
    keteranganStatus: 'HOLD',
    pic: 'MOD',
    catatanTambahan: '-',
  },
  {
    id: 'su-13',
    no: 13,
    programType: 'SKILL_UP',
    nik: '24000747',
    nama: 'Muh Ikhsan Nul A',
    dept: 'MOD',
    jabatanAwal: 'Driver DT 10 R',
    jabatanTarget: 'Operator Motor Grader',
    pengajuanSimperUnit: 'Motor Grader',
    classTrainingDate: '-',
    assessmentDate: '-',
    startOrientasiDate: '-',
    finalAssessmentDate: '-',
    kategoriKet: 'SKILL UP',
    status: 'ON SCHEDULE',
    keteranganStatus: 'ON SCHEDULE',
    pic: 'TC',
    catatanTambahan: '-',
  },
  {
    id: 'su-14',
    no: 14,
    programType: 'SKILL_UP',
    nik: '24000749',
    nama: "Renaldi S Safa'at",
    dept: 'MOD',
    jabatanAwal: 'Driver DT 10 R',
    jabatanTarget: 'Operator Motor Grader',
    pengajuanSimperUnit: 'Motor Grader',
    classTrainingDate: '-',
    assessmentDate: '-',
    startOrientasiDate: '-',
    finalAssessmentDate: '-',
    kategoriKet: 'SKILL UP',
    status: 'ON SCHEDULE',
    keteranganStatus: 'ON SCHEDULE',
    pic: 'TC',
    catatanTambahan: '-',
  },
  {
    id: 'su-15',
    no: 15,
    programType: 'SKILL_UP',
    nik: '24001033',
    nama: 'Muh Hasyim',
    dept: 'MOD',
    jabatanAwal: 'Driver 12 R',
    jabatanTarget: 'Operator Motor Grader',
    pengajuanSimperUnit: 'Motor Grader',
    classTrainingDate: '-',
    assessmentDate: '-',
    startOrientasiDate: '-',
    finalAssessmentDate: '-',
    kategoriKet: 'SKILL UP',
    status: 'CANCEL',
    keteranganStatus: 'RESIGN',
    pic: 'MOD',
    catatanTambahan: 'RESIGN',
  },
  {
    id: 'su-16',
    no: 16,
    programType: 'SKILL_UP',
    nik: '25001556',
    nama: 'A. Adam Setiawan L',
    dept: 'MOD',
    jabatanAwal: 'Driver 12 R',
    jabatanTarget: 'Operator Motor Grader',
    pengajuanSimperUnit: 'Motor Grader',
    classTrainingDate: '-',
    assessmentDate: '-',
    startOrientasiDate: '-',
    finalAssessmentDate: '-',
    kategoriKet: 'SKILL UP',
    status: 'ON SCHEDULE',
    keteranganStatus: 'ON SCHEDULE',
    pic: 'TC',
    catatanTambahan: '-',
  },
  {
    id: 'su-17',
    no: 17,
    programType: 'SKILL_UP',
    nik: '24000756',
    nama: 'Awaluddin',
    dept: 'MOD',
    jabatanAwal: 'Flagman',
    jabatanTarget: 'Operator Compactor',
    pengajuanSimperUnit: 'Compactor',
    classTrainingDate: '26 July 2026',
    assessmentDate: '26 July 2026',
    startOrientasiDate: '23 August 2026',
    finalAssessmentDate: '30 September 2026',
    kategoriKet: 'SKILL UP',
    status: 'CLOSE',
    keteranganStatus: 'CLOSE',
    pic: 'TC',
    catatanTambahan: 'Penyesuaian: 21 November 2026',
  },
  {
    id: 'su-18',
    no: 18,
    programType: 'SKILL_UP',
    nik: '24000826',
    nama: 'Muh Firdandi Rizky',
    dept: 'MOD',
    jabatanAwal: 'Checker',
    jabatanTarget: 'Operator Compactor',
    pengajuanSimperUnit: 'Compactor',
    classTrainingDate: '26 July 2026',
    assessmentDate: '26 July 2026',
    startOrientasiDate: '14 August 2026',
    finalAssessmentDate: '26 August 2026',
    kategoriKet: 'SKILL UP',
    status: 'CLOSE',
    keteranganStatus: 'CLOSE',
    pic: 'TC',
    catatanTambahan: 'Penyesuaian: 12 November 2026',
  },
  {
    id: 'su-19',
    no: 19,
    programType: 'SKILL_UP',
    nik: '23000335',
    nama: 'Muhajir Singgo (Buldozer)',
    dept: 'MOD',
    jabatanAwal: 'Terpalman',
    jabatanTarget: 'Operator Buldozer',
    pengajuanSimperUnit: 'Buldozer',
    classTrainingDate: '8 August 2026',
    assessmentDate: '8 August 2026',
    startOrientasiDate: '23 August 2026',
    finalAssessmentDate: '-',
    kategoriKet: 'SKILL UP',
    status: 'CANCEL',
    keteranganStatus: 'Dialihkan ke Compactor',
    pic: 'MOD',
    catatanTambahan: 'Dialihkan ke Compactor',
  },
  {
    id: 'su-20',
    no: 20,
    programType: 'SKILL_UP',
    nik: '24000899',
    nama: 'Salman Ahmad',
    dept: 'MOD',
    jabatanAwal: 'Terpalman',
    jabatanTarget: 'Operator Buldozer',
    pengajuanSimperUnit: 'Buldozer',
    classTrainingDate: '8 August 2026',
    assessmentDate: '8 August 2026',
    startOrientasiDate: '23 August 2026',
    finalAssessmentDate: '26 September 2026',
    kategoriKet: 'SKILL UP',
    status: 'CLOSE',
    keteranganStatus: 'CLOSE',
    pic: 'TC',
    catatanTambahan: 'Penyesuaian: 21 November 2026',
  },
  {
    id: 'su-21',
    no: 21,
    programType: 'SKILL_UP',
    nik: '24001399',
    nama: 'M Dave Cristian R',
    dept: 'MOD',
    jabatanAwal: 'Checker',
    jabatanTarget: 'Operator Buldozer',
    pengajuanSimperUnit: 'Buldozer',
    classTrainingDate: '8 August 2026',
    assessmentDate: '8 August 2026',
    startOrientasiDate: '26 August 2026',
    finalAssessmentDate: '26 September 2026',
    kategoriKet: 'SKILL UP',
    status: 'CLOSE',
    keteranganStatus: 'CLOSE',
    pic: 'TC',
    catatanTambahan: 'Penyesuaian: 24 November 2026',
  },
  {
    id: 'su-22',
    no: 22,
    programType: 'SKILL_UP',
    nik: '23000335-C',
    nama: 'Muhajir Singgo (Compactor)',
    dept: 'MOD',
    jabatanAwal: 'Operator Buldozer',
    jabatanTarget: 'Operator Compactor',
    pengajuanSimperUnit: 'Compactor',
    classTrainingDate: '28 July 2026',
    assessmentDate: '28 July 2026',
    startOrientasiDate: '19 October 2026',
    finalAssessmentDate: '-',
    kategoriKet: 'SKILL UP',
    status: 'CANCEL',
    keteranganStatus: 'CANCEL',
    pic: 'TC',
    catatanTambahan: 'CANCEL',
  },
  {
    id: 'su-23',
    no: 23,
    programType: 'SKILL_UP',
    nik: '21000116',
    nama: 'La Yami',
    dept: 'PLM',
    jabatanAwal: 'Tyreman M-2',
    jabatanTarget: 'Operator Crane Truck (CT)',
    pengajuanSimperUnit: 'CT',
    classTrainingDate: '1 October 2026',
    assessmentDate: '2 October 2026',
    startOrientasiDate: '22 October 2026',
    finalAssessmentDate: '31 October 2026',
    kategoriKet: 'SKILL UP',
    status: 'CLOSE',
    keteranganStatus: 'CLOSE',
    pic: 'TC',
    catatanTambahan: 'CLOSE',
  },
  {
    id: 'su-24',
    no: 24,
    programType: 'SKILL_UP',
    nik: '25002163',
    nama: 'Rusmin',
    dept: 'PLM',
    jabatanAwal: 'GL Tyre',
    jabatanTarget: 'Operator Crane Truck (CT)',
    pengajuanSimperUnit: 'CT',
    classTrainingDate: '30 August 2026',
    assessmentDate: '30 August 2026',
    startOrientasiDate: '22 October 2026',
    finalAssessmentDate: '4 November 2026',
    kategoriKet: 'SKILL UP',
    status: 'CLOSE',
    keteranganStatus: 'CLOSE',
    pic: 'TC',
    catatanTambahan: 'Final Assessment CT Done (4 Nov 2026)',
  },
];

const INITIAL_ORIENTASI_NEW_HIRE: OrientasiNewHireRecord[] = [
  {
    id: 'ori-1',
    no: 1,
    nik: '26002495',
    nama: 'Hesky Kadmaerubun',
    jabatan: 'Driver Service Truck',
    startOrientasi: '16-Aug-2026',
    assessment: '-',
    ket: 'New Hire',
    status: 'ON PROGRESS',
    pt: 'RJS',
    totalHm: 25,
  },
  {
    id: 'ori-2',
    no: 2,
    nik: '26002479',
    nama: 'Jenita',
    jabatan: 'Operator Excavator',
    startOrientasi: '29-Aug-26',
    assessment: '12-Sep-26',
    ket: 'New Hire',
    status: 'CLOSE',
    pt: 'RJS',
    totalHm: 60,
  },
  {
    id: 'ori-3',
    no: 3,
    nik: '262908JT',
    nama: 'Juli Tambunan',
    jabatan: 'Driver DT 12 R',
    startOrientasi: '8-Sep-26',
    assessment: '15-Sep-26',
    ket: 'New Hire',
    status: 'CLOSE',
    pt: 'CSK',
    totalHm: 70.4,
  },
  {
    id: 'ori-4',
    no: 4,
    nik: '262908SA',
    nama: 'Septian Aryanto',
    jabatan: 'Driver DT 12 R',
    startOrientasi: '8-Sep-26',
    assessment: '15-Sep-26',
    ket: 'New Hire',
    status: 'CLOSE',
    pt: 'CSK',
    totalHm: 60.8,
  },
  {
    id: 'ori-5',
    no: 5,
    nik: '26002591',
    nama: 'Sultan',
    jabatan: 'Operator Motor Grader',
    startOrientasi: '9-Sep-26',
    assessment: '16-Sep-26',
    ket: 'New Hire',
    status: 'CLOSE',
    pt: 'RJS',
    totalHm: 62.6,
  },
  {
    id: 'ori-6',
    no: 6,
    nik: '26002592',
    nama: 'Hamzah',
    jabatan: 'Operator Motor Grader',
    startOrientasi: '9-Sep-26',
    assessment: '16-Sep-26',
    ket: 'New Hire',
    status: 'CLOSE',
    pt: 'RJS',
    totalHm: 71.7,
  },
  {
    id: 'ori-7',
    no: 7,
    nik: '26002594',
    nama: 'Alam',
    jabatan: 'Operator Buldozer',
    startOrientasi: '9-Sep-26',
    assessment: '15-Sep-26',
    ket: 'New Hire',
    status: 'CLOSE',
    pt: 'RJS',
    totalHm: 61,
  },
  {
    id: 'ori-8',
    no: 8,
    nik: '26002593',
    nama: 'Muslimin',
    jabatan: 'Operator Buldozer',
    startOrientasi: '10-Sep-2026',
    assessment: '-',
    ket: 'New Hire',
    status: 'ON PROGRESS',
    pt: 'RJS',
    totalHm: 55.2,
  },
  {
    id: 'ori-9',
    no: 9,
    nik: '26002495-B',
    nama: 'Hesky Kadmaerubun (Unit ST)',
    jabatan: 'Driver ST',
    startOrientasi: '15-Sep-2026',
    assessment: '-',
    ket: 'New Hire',
    status: 'ON PROGRESS',
    pt: 'RJS',
    totalHm: 68,
  },
  {
    id: 'ori-10',
    no: 10,
    nik: '260509ZA',
    nama: 'Zainal Apandi',
    jabatan: 'Driver DT 12 R',
    startOrientasi: '15-Sep-2026',
    assessment: '-',
    ket: 'New Hire',
    status: 'ON PROGRESS',
    pt: 'CSK',
    totalHm: 58.2,
  },
  {
    id: 'ori-11',
    no: 11,
    nik: '26002610',
    nama: 'Emu Ateng K',
    jabatan: 'Driver DT Fuel Truck',
    startOrientasi: '20-Sep-2026',
    assessment: '-',
    ket: 'New Hire',
    status: 'ON PROGRESS',
    pt: 'RJS',
    totalHm: 0,
  },
];

const INITIAL_SELESAI_ORIENTASI_LOGS: SelesaiOrientasiLog[] = [
  {
    id: 'sori-1',
    no: 1,
    tanggal: '29-Oct-26',
    actual: 1,
    unit: '1x Final unit CT (La Yami)',
    ket: 'RJS',
    photos: ['/images/ppt_w1_nov/slide10_row1_a.jpg', '/images/ppt_w1_nov/slide10_row1_b.jpg'],
  },
  {
    id: 'sori-2',
    no: 2,
    tanggal: '29-Oct-26',
    actual: 1,
    unit: '1x Final unit Rock Breaker (Muh Arif Refli)',
    ket: 'RJS',
    photos: ['/images/ppt_w1_nov/slide10_row2_a.jpg', '/images/ppt_w1_nov/slide10_row2_b.jpg'],
  },
  {
    id: 'sori-3',
    no: 3,
    tanggal: '31-Oct-26',
    actual: 1,
    unit: '1x Final unit Rock Breaker (Warka)',
    ket: 'RJS',
    photos: ['/images/ppt_w1_nov/slide10_row3_a.jpg', '/images/ppt_w1_nov/slide10_row3_b.jpg'],
  },
  {
    id: 'sori-4',
    no: 4,
    tanggal: '4-Nov-26',
    actual: 1,
    unit: '1x Final unit CT (Rusmin)',
    ket: 'RJS',
    photos: ['/images/ppt_w1_nov/slide10_row4_a.jpg', '/images/ppt_w1_nov/slide10_row4_b.jpg'],
  },
];

const INITIAL_RETRAINING_RECORDS: RetrainingRecord[] = [
  // SEPTEMBER (11 rows)
  { id: 'rt-1', no: 1, bulan: 'SEPTEMBER', tanggal: '04-Sep-2026', namaPeserta: 'Operator Exc #1 (Re-Training)', unit: 'EXCAVATOR', grounded: 1, complete: 1, persentase: 100, ket: 'DONE', catatanInvestigasi: 'Refresh Class & Practical Pasca Incident' },
  { id: 'rt-2', no: 2, bulan: 'SEPTEMBER', tanggal: '06-Sep-2026', namaPeserta: 'Operator Exc #2 (Re-Training)', unit: 'EXCAVATOR', grounded: 1, complete: 1, persentase: 100, ket: 'DONE', catatanInvestigasi: 'Refresh Class & Practical Pasca Incident' },
  { id: 'rt-3', no: 3, bulan: 'SEPTEMBER', tanggal: '09-Sep-2026', namaPeserta: 'Operator Exc #3 (Re-Training)', unit: 'EXCAVATOR', grounded: 1, complete: 1, persentase: 100, ket: 'DONE', catatanInvestigasi: 'Refresh Class & Practical Pasca Incident' },
  { id: 'rt-4', no: 4, bulan: 'SEPTEMBER', tanggal: '12-Sep-2026', namaPeserta: 'Operator ADT #1 (Re-Training)', unit: 'ADT', grounded: 1, complete: 1, persentase: 100, ket: 'DONE', catatanInvestigasi: 'Refresh Class & Practical Pasca Incident' },
  { id: 'rt-5', no: 5, bulan: 'SEPTEMBER', tanggal: '14-Sep-2026', namaPeserta: 'Operator ADT #2 (Re-Training)', unit: 'ADT', grounded: 1, complete: 1, persentase: 100, ket: 'DONE', catatanInvestigasi: 'Refresh Class & Practical Pasca Incident' },
  { id: 'rt-6', no: 6, bulan: 'SEPTEMBER', tanggal: '17-Sep-2026', namaPeserta: 'Operator Buldozer #1 (Re-Training)', unit: 'BULDOZER', grounded: 1, complete: 1, persentase: 100, ket: 'DONE', catatanInvestigasi: 'Refresh Class & Practical Pasca Incident' },
  { id: 'rt-7', no: 7, bulan: 'SEPTEMBER', tanggal: '19-Sep-2026', namaPeserta: 'Operator Buldozer #2 (Re-Training)', unit: 'BULDOZER', grounded: 1, complete: 1, persentase: 100, ket: 'DONE', catatanInvestigasi: 'Refresh Class & Practical Pasca Incident' },
  { id: 'rt-8', no: 8, bulan: 'SEPTEMBER', tanggal: '21-Sep-2026', namaPeserta: 'Driver DT 12R #1 (Re-Training)', unit: 'DT 12R', grounded: 1, complete: 1, persentase: 100, ket: 'DONE', catatanInvestigasi: 'Refresh Class & Practical Pasca Incident' },
  { id: 'rt-9', no: 9, bulan: 'SEPTEMBER', tanggal: '24-Sep-2026', namaPeserta: 'Driver FT (Re-Training)', unit: 'FT', grounded: 1, complete: 1, persentase: 100, ket: 'DONE', catatanInvestigasi: 'Refresh Class & Practical Pasca Incident' },
  { id: 'rt-10', no: 10, bulan: 'SEPTEMBER', tanggal: '26-Sep-2026', namaPeserta: 'Driver LV (Re-Training)', unit: 'LV', grounded: 1, complete: 1, persentase: 100, ket: 'DONE', catatanInvestigasi: 'Refresh Class & Practical Pasca Incident' },
  { id: 'rt-11', no: 11, bulan: 'SEPTEMBER', tanggal: '28-Sep-2026', namaPeserta: 'Driver DT 12R #2 (Re-Training)', unit: 'DT 12R', grounded: 1, complete: 1, persentase: 100, ket: 'DONE', catatanInvestigasi: 'Refresh Class & Practical Pasca Incident' },
  { id: 'rt-12', no: 12, bulan: 'SEPTEMBER', tanggal: '30-Sep-2026', namaPeserta: 'Driver Fuel Truck (Re-Training)', unit: 'FUEL TRUCK', grounded: 1, complete: 1, persentase: 100, ket: 'DONE', catatanInvestigasi: 'Refresh Class & Practical Pasca Incident' },
  // OKTOBER (12 rows)
  { id: 'rt-13', no: 13, bulan: 'OKTOBER', tanggal: '03-Oct-2026', namaPeserta: 'Driver DT 12 R #1 (Oct)', unit: 'DT 12 R', grounded: 1, complete: 1, persentase: 100, ket: 'DONE', catatanInvestigasi: 'Joint Investigasi Incident Oktober' },
  { id: 'rt-14', no: 14, bulan: 'OKTOBER', tanggal: '06-Oct-2026', namaPeserta: 'Driver DT 12 R #2 (Oct)', unit: 'DT 12 R', grounded: 1, complete: 1, persentase: 100, ket: 'DONE', catatanInvestigasi: 'Joint Investigasi Incident Oktober' },
  { id: 'rt-15', no: 15, bulan: 'OKTOBER', tanggal: '09-Oct-2026', namaPeserta: 'Driver DT 12 R #3 (Oct)', unit: 'DT 12 R', grounded: 1, complete: 1, persentase: 100, ket: 'DONE', catatanInvestigasi: 'Joint Investigasi Incident Oktober' },
  { id: 'rt-16', no: 16, bulan: 'OKTOBER', tanggal: '12-Oct-2026', namaPeserta: 'Driver DT 12 R #4 (Oct)', unit: 'DT 12 R', grounded: 1, complete: 1, persentase: 100, ket: 'DONE', catatanInvestigasi: 'Joint Investigasi Incident Oktober' },
  { id: 'rt-17', no: 17, bulan: 'OKTOBER', tanggal: '15-Oct-2026', namaPeserta: 'Driver DT 12 R #5 (Oct)', unit: 'DT 12 R', grounded: 1, complete: 1, persentase: 100, ket: 'DONE', catatanInvestigasi: 'Joint Investigasi Incident Oktober' },
  { id: 'rt-18', no: 18, bulan: 'OKTOBER', tanggal: '18-Oct-2026', namaPeserta: 'Driver DT 12 R #6 (Oct)', unit: 'DT 12 R', grounded: 1, complete: 1, persentase: 100, ket: 'DONE', catatanInvestigasi: 'Joint Investigasi Incident Oktober' },
  { id: 'rt-19', no: 19, bulan: 'OKTOBER', tanggal: '20-Oct-2026', namaPeserta: 'Driver Water Truck (WT)', unit: 'WT', grounded: 1, complete: 1, persentase: 100, ket: 'DONE', catatanInvestigasi: 'Refresh Class & Practical' },
  { id: 'rt-20', no: 20, bulan: 'OKTOBER', tanggal: '22-Oct-2026', namaPeserta: 'Driver Manhaul (MH)', unit: 'MH', grounded: 1, complete: 1, persentase: 100, ket: 'DONE', catatanInvestigasi: 'Refresh Class & Practical' },
  { id: 'rt-21', no: 21, bulan: 'OKTOBER', tanggal: '24-Oct-2026', namaPeserta: 'Operator Excavator #1 (Oct)', unit: 'EXCAVATOR', grounded: 1, complete: 1, persentase: 100, ket: 'DONE', catatanInvestigasi: 'Joint Investigasi Incident Unit Excavator' },
  { id: 'rt-22', no: 22, bulan: 'OKTOBER', tanggal: '26-Oct-2026', namaPeserta: 'Driver DT 12 R #7 (Oct)', unit: 'DT 12 R', grounded: 1, complete: 1, persentase: 100, ket: 'DONE', catatanInvestigasi: 'Refresh Class & Practical' },
  { id: 'rt-23', no: 23, bulan: 'OKTOBER', tanggal: '28-Oct-2026', namaPeserta: 'Operator Excavator #2 (Oct)', unit: 'EXCAVATOR', grounded: 1, complete: 1, persentase: 100, ket: 'DONE', catatanInvestigasi: 'Refresh Class & Practical' },
  { id: 'rt-24', no: 24, bulan: 'OKTOBER', tanggal: '30-Oct-2026', namaPeserta: 'Operator Buldozer (Oct)', unit: 'BULDOZER', grounded: 1, complete: 1, persentase: 100, ket: 'DONE', catatanInvestigasi: 'Refresh Class & Practical' },
  // NOVEMBER (4 rows)
  { id: 'rt-25', no: 25, bulan: 'NOVEMBER', tanggal: '01-Nov-2026', namaPeserta: 'Driver DT 12 R #1 (Nov)', unit: 'DT 12 R', grounded: 1, complete: 1, persentase: 100, ket: 'DONE', catatanInvestigasi: 'Investigasi Incident Unit DT (1/2)' },
  { id: 'rt-26', no: 26, bulan: 'NOVEMBER', tanggal: '01-Nov-2026', namaPeserta: 'Bucek (Driver Fuel Truck)', unit: 'FT', grounded: 1, complete: 1, persentase: 100, ket: 'DONE', catatanInvestigasi: 'Re-training pasca incident Driver Fuel Truck (1x FT)' },
  { id: 'rt-27', no: 27, bulan: 'NOVEMBER', tanggal: '01-Nov-2026', namaPeserta: 'Hasriadi (Operator Excavator)', unit: 'EXCAVATOR', grounded: 1, complete: 1, persentase: 100, ket: 'DONE', catatanInvestigasi: 'Re-training pasca incident Operator Excavator (1x Exc)' },
  { id: 'rt-28', no: 28, bulan: 'NOVEMBER', tanggal: '03-Nov-2026', namaPeserta: 'Driver DT 12 R #2 (Nov)', unit: 'DT 12 R', grounded: 1, complete: 1, persentase: 100, ket: 'DONE', catatanInvestigasi: 'Investigasi Incident Unit DT (2/2)' },
];

const INITIAL_FGDP_RECORDS: FgdpTrainingRecord[] = [
  { id: 'fgdp-1', no: 1, tanggal: '19-24 Oct 2026', nama: 'Dandy M Irvan', departemen: 'PLM', provider: 'TC', program: 'Class & Field', instructor: 'Andi Rizal', status: 'Done' },
  { id: 'fgdp-2', no: 2, tanggal: '19-24 Oct 2026', nama: 'Wildan Dafa Radhitya', departemen: 'HRGA-IT', provider: 'TC', program: 'Class & Field', instructor: 'Andi Rizal', status: 'Done' },
  { id: 'fgdp-3', no: 3, tanggal: '19-24 Oct 2026', nama: 'Amir Zul khair Pasaribu', departemen: 'MED / MOD', provider: 'TC', program: 'Class & Field', instructor: 'Andi Rizal', status: 'Done' },
  { id: 'fgdp-4', no: 4, tanggal: '19-24 Oct 2026', nama: 'Adam Zainuddin', departemen: 'MED / MOD', provider: 'TC', program: 'Class & Field', instructor: 'Andi Rizal', status: 'Done' },
  { id: 'fgdp-5', no: 5, tanggal: '25-30 Oct 2026', nama: 'Jonathan Edward', departemen: 'MED / MOD', provider: 'TC', program: 'Class & Field', instructor: 'A. Rahman', status: 'Done' },
  { id: 'fgdp-6', no: 6, tanggal: '25-30 Oct 2026', nama: 'Benaya Yedija Elvianto', departemen: 'PLM', provider: 'TC', program: 'Class & Field', instructor: 'A. Rahman', status: 'Done' },
  { id: 'fgdp-7', no: 7, tanggal: '25-30 Oct 2026', nama: 'Elisabeth', departemen: 'HRGA-IT', provider: 'TC', program: 'Class & Field', instructor: 'A. Rahman', status: 'Done' },
  { id: 'fgdp-8', no: 8, tanggal: '25-30 Oct 2026', nama: 'Ahmad Taufaman Faluti Syarif', departemen: 'MED / MOD', provider: 'TC', program: 'Class & Field', instructor: 'A. Rahman', status: 'Done' },
  { id: 'fgdp-9', no: 9, tanggal: '31 Oct- 05 Nov 2026', nama: 'P. Indra Murthi Saputra', departemen: 'HRGA-IT', provider: 'TC', program: 'Class & Field', instructor: 'A. Rahman', status: 'Done' },
  { id: 'fgdp-10', no: 10, tanggal: '31 Oct- 05 Nov 2026', nama: 'Hilma Nugrah Rendesti', departemen: 'MOD', provider: 'TC', program: 'Class & Field', instructor: 'A. Rahman', status: 'Done' },
  { id: 'fgdp-11', no: 11, tanggal: '31 Oct- 05 Nov 2026', nama: 'Aditya Nugroho', departemen: 'MOD', provider: 'TC', program: 'Class & Field', instructor: 'A. Rahman', status: 'Done' },
  { id: 'fgdp-12', no: 12, tanggal: '31 Oct- 05 Nov 2026', nama: 'M. Hifzi', departemen: 'PLM', provider: 'TC', program: 'Class & Field', instructor: 'A. Rahman', status: 'Done' },
];

const INITIAL_GREEN_OPERATOR_STEPS: GreenOperatorStep[] = [
  { stepNo: 1, title: '1. Proses HR', duration: '2 Weeks', status: 'Done', description: 'Seleksi administrasi & verifikasi internal kandidat Green Operator ADT Batch VI' },
  { stepNo: 2, title: '2. Mandatory Training', duration: '2 Days', status: 'Done', description: 'Induksi K3LH, Basic Safety & aturan keselamatan kerja tambang' },
  { stepNo: 3, title: '3. Specific Matery di Class', duration: '8 Days', status: 'Done', description: 'Pengenalan komponen, sistem instrumen & prosedur pengoperasian ADT' },
  { stepNo: 4, title: '4. OJT di Circuit Area Simper L', duration: '4 Weeks', status: 'On Going', description: 'Praktek P2H, Gerdas (Gerakan Dasar) & Zig Zag di Circuit Area Pit' },
  { stepNo: 5, title: '5. OJT di Field', duration: '2 Months', status: 'Pending', description: 'Pendampingan pengoperasian unit ADT di jalur hauling aktual' },
  { stepNo: 6, title: '6. Review & Ass. Simper P', duration: '2 Days', status: 'Pending', description: 'Evaluasi jam terbang & ujian praktek peningkatan ke Simper P' },
  { stepNo: 7, title: '7. Audit & Ass. Simper F', duration: '3 Months', status: 'Pending', description: 'Audit kompetensi mandiri & sertifikasi kelulusan Simper Full (F)' },
];

const INITIAL_GREEN_OPERATOR_RECORDS: GreenOperatorRecord[] = [
  { id: 'go-1', no: 1, nik: '26002665', nama: 'Putrianan Tara Lestari G', jabatanAwal: 'Admin Engineer', previousDept: 'PLM', position: 'Candidate Opt. ADT', trainingClassStatus: 'Done', circuitAreaStatus: 'On Going' },
  { id: 'go-2', no: 2, nik: '26002673', nama: 'Abdul Ajis', jabatanAwal: 'Crew Safety', previousDept: 'HSE', position: 'Candidate Opt. ADT', trainingClassStatus: 'Done', circuitAreaStatus: 'On Going' },
  { id: 'go-3', no: 3, nik: '26002679', nama: 'Meisda Yanti Ulo', jabatanAwal: 'Admin Plant Maintenance', previousDept: 'PLM', position: 'Candidate Opt. ADT', trainingClassStatus: 'Done', circuitAreaStatus: 'On Going' },
  { id: 'go-4', no: 4, nik: '26002660', nama: 'Naldiman Linggi Allo', jabatanAwal: 'Crew Sipil', previousDept: 'HRGA', position: 'Candidate Opt. ADT', trainingClassStatus: 'Done', circuitAreaStatus: 'On Going' },
  { id: 'go-5', no: 5, nik: '26002664', nama: 'Muhammad Ferhat Algaffari', jabatanAwal: 'Admin Plant Maintenance', previousDept: 'PLM', position: 'Candidate Opt. ADT', trainingClassStatus: 'Done', circuitAreaStatus: 'On Going' },
  { id: 'go-6', no: 6, nik: '26002661', nama: 'Ikram', jabatanAwal: 'Crew Safety', previousDept: 'HSE', position: 'Candidate Opt. ADT', trainingClassStatus: 'Done', circuitAreaStatus: 'On Going' },
  { id: 'go-7', no: 7, nik: '26002662', nama: 'Muhtafil', jabatanAwal: 'Terpalman', previousDept: 'MOD', position: 'Candidate Opt. ADT', trainingClassStatus: 'Done', circuitAreaStatus: 'On Going' },
  { id: 'go-8', no: 8, nik: '26002663', nama: 'Rahmat Dani', jabatanAwal: 'Terpalman', previousDept: 'MOD', position: 'Candidate Opt. ADT', trainingClassStatus: 'Done', circuitAreaStatus: 'On Going' },
  { id: 'go-9', no: 9, nik: '26002666', nama: 'Arman Ansar', jabatanAwal: 'Base Control', previousDept: 'PLM', position: 'Candidate Opt. ADT', trainingClassStatus: 'Done', circuitAreaStatus: 'On Going' },
  { id: 'go-10', no: 10, nik: '26002667', nama: 'Mustawa Zainudin', jabatanAwal: 'Helper Tronton', previousDept: 'LOGISTIK', position: 'Candidate Opt. ADT', trainingClassStatus: 'Done', circuitAreaStatus: 'On Going' },
  { id: 'go-11', no: 11, nik: '26002668', nama: 'Rostin', jabatanAwal: 'Laundry & House Keeping', previousDept: 'HRGA', position: 'Candidate Opt. ADT', trainingClassStatus: 'Done', circuitAreaStatus: 'On Going' },
  { id: 'go-12', no: 12, nik: '26002669', nama: "Nimbrot Ta'du Landurundun", jabatanAwal: 'Crew Sipil', previousDept: 'HRGA', position: 'Candidate Opt. ADT', trainingClassStatus: 'Done', circuitAreaStatus: 'On Going' },
  { id: 'go-13', no: 13, nik: '26002670', nama: 'Nur Husen', jabatanAwal: 'Fuelman', previousDept: 'LOGISTIK', position: 'Candidate Opt. ADT', trainingClassStatus: 'Done', circuitAreaStatus: 'On Going' },
  { id: 'go-14', no: 14, nik: '26002671', nama: 'Gunawan', jabatanAwal: 'Toolkeeper', previousDept: 'PLM', position: 'Candidate Opt. ADT', trainingClassStatus: 'Done', circuitAreaStatus: 'On Going' },
  { id: 'go-15', no: 15, nik: '26002672', nama: 'Amaluddin', jabatanAwal: 'Toolkeeper', previousDept: 'PLM', position: 'Candidate Opt. ADT', trainingClassStatus: 'Done', circuitAreaStatus: 'On Going' },
  { id: 'go-16', no: 16, nik: '26002674', nama: 'Muh Fahri', jabatanAwal: 'Checker', previousDept: 'MED', position: 'Candidate Opt. ADT', trainingClassStatus: 'Done', circuitAreaStatus: 'On Going' },
  { id: 'go-17', no: 17, nik: '26002675', nama: 'Risal Mardi', jabatanAwal: 'Checker', previousDept: 'MED', position: 'Candidate Opt. ADT', trainingClassStatus: 'Done', circuitAreaStatus: 'On Going' },
  { id: 'go-18', no: 18, nik: '26002676', nama: 'Dodi Setiawan', jabatanAwal: 'Pumpman', previousDept: 'MOD', position: 'Candidate Opt. ADT', trainingClassStatus: 'Done', circuitAreaStatus: 'On Going' },
  { id: 'go-19', no: 19, nik: '26002677', nama: 'Juandri Puabonga', jabatanAwal: 'Lubeman', previousDept: 'LOGISTIK', position: 'Candidate Opt. ADT', trainingClassStatus: 'Done', circuitAreaStatus: 'On Going' },
  { id: 'go-20', no: 20, nik: '26002678', nama: 'Sahrul Adam', jabatanAwal: 'Fuelman', previousDept: 'LOGISTIK', position: 'Candidate Opt. ADT', trainingClassStatus: 'Done', circuitAreaStatus: 'On Going' },
];

// --- Slide 13A: 85x Training Class di Site Genba (Juli - October 2026) ---
const GENBA_CLASS_RAW: Array<[number, string, string, string, string, string]> = [
  [1, '5 Jul 2026', 'Muhajirin', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [2, '5 Jul 2026', 'Dayyan', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [3, '5 Jul 2026', 'Arfan A', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [4, '5 Jul 2026', 'Arman', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [5, '5 Jul 2026', 'Rhezy', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [6, '5 Jul 2026', 'Suryanto', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [7, '5 Jul 2026', 'Samsul Hadi', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [8, '5 Jul 2026', 'Saipul Alam', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [9, '5 Jul 2026', 'Umuluddin', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [10, '5 Jul 2026', 'Hendri', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [11, '5 Jul 2026', 'Dandi', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [12, '5 Jul 2026', 'Arianto', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [13, '5 Jul 2026', 'Beni', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [14, '5 Jul 2026', 'Elgus Boy', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [15, '5 Jul 2026', 'Syarif', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [16, '5 Jul 2026', 'Kifli', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [17, '5 Jul 2026', 'I Ketuk S', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [18, '5 Jul 2026', 'Adani Ibnu', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [19, '8 Jul 2026', 'Maksimus', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [20, '8 Jul 2026', 'La Undi', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [21, '8 Jul 2026', 'Simri L', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [22, '8 Jul 2026', 'M. Nimang', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [23, '8 Jul 2026', 'Markus', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [24, '8 Jul 2026', 'Dady M', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [25, '8 Jul 2026', 'Hendra', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [26, '8 Jul 2026', 'Dion', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [27, '8 Jul 2026', 'Hengky', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [28, '8 Jul 2026', 'Andra D', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [29, '8 Jul 2026', 'Bejnat T Malili', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [30, '8 Jul 2026', 'Dael', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [31, '12 Jul 2026', 'Rahan Kusnardi', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [32, '12 Jul 2026', 'Zulkifli', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [33, '15 Jul 2026', 'Muhammad D', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [34, '15 Jul 2026', 'Duka Hengky', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [35, '15 Jul 2026', 'Fadly Nome', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [36, '15 Jul 2026', 'Dadi Stephen', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [37, '15 Jul 2026', 'Yohanis Haru Muda', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [38, '18 Jul 2026', 'Ahlul M', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [39, '18 Jul 2026', 'Aswar', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [40, '18 Jul 2026', 'M. Ilham Ashari', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [41, '18 Jul 2026', 'Lukman Hakim', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [42, '19 Jul 2026', 'Lalu Suparlan', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [43, '19 Jul 2026', 'Muh Raspin', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [44, '22 Jul 2026', 'Muh. Ridwan', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [45, '22 Jul 2026', 'Dion N Lapangoyu', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [46, '22 Jul 2026', 'Muh. Amin', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [47, '24 Jul 2026', 'Hendra Gunawan', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [48, '24 Jul 2026', 'Dedi Ardiansah', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [49, '24 Jul 2026', 'Suryansyah', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [50, '26 Jul 2026', 'Sefnat Malihing', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [51, '26 Jul 2026', 'Benediktus Poma P', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [52, '26 Jul 2026', 'Markus Hermanus', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [53, '2 Aug 2026', 'Asriwiyanto', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [54, '2 Aug 2026', 'Aseria Lipimo', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [55, '5 Aug 2026', 'Yohanes Pati', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [56, '5 Aug 2026', 'Primus', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [57, '5 Aug 2026', 'Bima Anggi Wahyu', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [58, '26/09/2026', 'Hengky', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [59, '26/09/2026', 'Hajrin', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [60, '26/09/2026', 'Nanang', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [61, '26/09/2026', 'Rosinus', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [62, '26/09/2026', 'Ahmad', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [63, '26/09/2026', 'Sabrianto', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [64, '26/09/2026', 'Irwan', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [65, '26/09/2026', 'Dahlan', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [66, '26/09/2026', 'Noris Alberta', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [67, '26/09/2026', 'M. Dollu', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [68, '26/09/2026', 'Fausan', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [69, '26/09/2026', 'Hengky (Batch II)', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [70, '18 Oct. 2026', 'Bakri', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [71, '18 Oct. 2026', 'Aprianus', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [72, '18 Oct. 2026', 'Sinyo Kristiono', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [73, '18 Oct. 2026', 'Saka PY', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [74, '18 Oct. 2026', 'Frans Bari', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [75, '18 Oct. 2026', 'Agung B', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [76, '18 Oct. 2026', 'Sarilus Heda', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [77, '18 Oct. 2026', 'Dandi', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [78, '21 Oct. 2026', 'Moh Rifandi', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [79, '22 Oct. 2026', 'Valentinus', 'Driver MH', 'HRGA', 'Pengenalan Komponen & P2H'],
  [80, '22 Oct. 2026', 'Feratus T', 'Driver MH', 'HRGA', 'Pengenalan Komponen & P2H'],
  [81, '22 Oct. 2026', 'Reginado', 'Driver MH', 'HRGA', 'Pengenalan Komponen & P2H'],
  [82, '23 Oct. 2026', 'Marsel Mberi', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [83, '24 Oct. 2026', 'Luter Renaldi', 'Driver DT', 'MOD', 'Pengenalan Komponen & P2H'],
  [84, '27 Oct. 2026', 'Boni Indrawan', 'Driver DT', 'MOD', 'Training Class Basic Operator'],
  [85, '29 Oct. 2026', 'Sadam Husein', 'Driver DT', 'MOD', 'Training Class Basic Operator'],
];

const INITIAL_GENBA_CLASS_RECORDS: SiteGenbaRecord[] = GENBA_CLASS_RAW.map(
  ([no, tanggal, nama, posisi, dept, activitas]) => ({
    id: `genba-cls-${no}`,
    no,
    category: 'CLASS',
    tanggal,
    nama,
    posisi,
    unit: posisi.includes('MH') ? 'Manhaul' : 'DT',
    dept,
    provider: 'TC',
    activitas,
    instructor: 'Yusran yusuf',
    perusahaan: 'RJS & Subcont',
    status: 'Done',
  })
);

// --- Slide 13B: 157x Assessment, Orientasi & Refresh di Site Genba ---
const GENBA_ASSESS_START: Array<[number, string, string, string, string, string]> = [
  [1, '1-Jul-2026', 'Muh Safar', 'Candidate', 'DT', 'Assessment candidate operator DT'],
  [2, '3-Jul-2026', 'Rendi Pangana', 'Candidate', 'Exc', 'Assessment candidate operator Exca'],
  [3, '2-Jul-2026', 'Maximus', 'Candidate', 'Exc', 'Assessment candidate operator Exca'],
  [4, '4-Jul-2026', 'Marzuki', 'New Hire', 'DT', 'Observasi driver dt hauling pt.cas'],
  [5, '9-Jul-2026', 'Rahan kusnardi', 'New Hire', 'DT', 'Observasi pengoprasian driver dt subcon'],
  [6, '9-Jul-2026', 'Dion.m lapangon', 'New Hire', 'DT', 'Observasi pengoprasian driver dt subcon'],
  [7, '9-Jul-2026', 'La undu', 'New Hire', 'DT', 'Observasi pengoprasian driver dt subcon'],
  [8, '9-Jul-2026', 'Dael', 'New Hire', 'DT', 'Observasi pengoprasian driver dt subcon'],
  [9, '12-Jul-2026', 'Maximus', 'Candidate', 'DT', 'Observasi pengoprasian driver dt subcon'],
  [10, '12-Jul-2026', 'Zulkifli', 'New Hire', 'DT', 'Observasi pengoprasian driver dt subcon'],
  [11, '13-Jul-2026', 'Muhammad D', 'New Hire', 'DT', 'Observasi pengoprasian driver dt subcon'],
  [12, '13-Jul-2026', 'Duka Hengky', 'New Hire', 'DT', 'Observasi pengoprasian driver dt subcon'],
  [13, '14-Jul-2026', 'Moh Dayyan', 'New Hire', 'DT', 'Observasi pengoprasian driver dt subcon'],
  [14, '14-Jul-2026', 'Fadly Nome', 'Candidate', 'DT', 'Observasi pengoprasian driver dt subcon'],
  [15, '14-Jul-2026', 'Dadi Stephen', 'New Hire', 'DT', 'Observasi pengoprasian driver dt subcon'],
  [16, '14-Jul-2026', 'Yohanis Haru Muda', 'New Hire', 'DT', 'Observasi pengoprasian driver dt subcon'],
  [17, '16-Jul-2026', 'Muhajirin', 'New Hire', 'DT', 'Observasi pengoprasian driver dt subcon'],
  [18, '16-Jul-2026', 'Arfan Anwar', 'New Hire', 'DT', 'Refresh driver dt hino 67 pt IGS site gemba'],
  [19, '16-Jul-2026', 'Hendri', 'New Hire', 'DT', 'Refresh driver dt hino 67 pt IGS site gemba'],
  [20, '17-Jul-2026', 'Ahlul .M', 'Candidate', 'DT', 'Assessment candidate Driver DT PT. IGS'],
  [21, '18-Jul-2026', 'Aswar', 'Candidate', 'DT', 'Assessment candidate Driver DT PT. IGS'],
  [22, '18-Jul-2026', 'M.ilham ashari', 'Candidate', 'DT', 'Assessment candidate Driver DT PT. IGS'],
  [23, '18-Jul-2026', 'Lukman hakim', 'Candidate', 'DT', 'Assessment candidate Driver DT PT. IGS'],
  [24, '19-Jul-2026', 'Lalu suparlan', 'Candidate', 'DT', 'Assessment candidate Driver DT PT. IGS'],
  [25, '19-Jul-2026', 'Muh Raspin', 'Candidate', 'DT', 'Assessment candidate Driver DT PT. IGS'],
  [26, '21-Jul-2026', 'Muh. Ridwan', 'New Hire', 'DT', 'Observasi pengoprasian driver dt subcon'],
  [27, '21-Jul-2026', 'Dion.N lapangoyu', 'New Hire', 'DT', 'Observasi pengoprasian driver dt subcon'],
  [28, '21-Jul-2026', 'Muh. Amin', 'New Hire', 'DT', 'Observasi pengoprasian driver dt subcon'],
  [29, '22-Jul-2026', 'Hendra Gunawan', 'New Hire', 'DT', 'Observasi pengoprasian driver dt subcon'],
  [30, '22-Jul-2026', 'Dedi Ardiansah', 'New Hire', 'DT', 'Observasi pengoprasian driver dt subcon'],
  [31, '22-Jul-2026', 'Suryansyah', 'New Hire', 'DT', 'Observasi pengoprasian driver dt subcon'],
  [32, '23-Jul-2026', 'Sefnat Malihing', 'New Hire', 'DT', 'Observasi pengoprasian driver dt subcon'],
  [33, '23-Jul-2026', 'Benediktus Poma P', 'New Hire', 'DT', 'Observasi pengoprasian driver dt subcon'],
  [34, '23-Jul-2026', 'Markus Hermanus', 'New Hire', 'DT', 'Observasi pengoprasian driver dt subcon'],
  [35, '24-Jul-2026', 'Riski Nanda', 'Candidate', 'DT', 'Tes p2h dan pengoprasian Kandidat Op. Vibro'],
  [36, '24-Jul-2026', 'Hendra JP', 'New Hire', 'DT', 'Observasi pengoprasian driver dt subcon'],
  [37, '24-Jul-2026', 'Efraim', 'Candidate', 'DT', 'Tes p2h dan pengoprasian Kandidat Op. Vibro'],
  [38, '25-Jul-2026', 'Asriwiyanto', 'New Hire', 'DT', 'Observasi pengoprasian driver dt subcon'],
  [39, '25-Jul-2026', 'Saipul', 'New Hire', 'DT', 'Observasi pengoprasian driver dt subcon'],
  [40, '25-Jul-2026', 'Andra', 'New Hire', 'DT', 'Observasi pengoprasian driver dt subcon'],
  [41, '26-Jul-2026', 'Aseria Lipimo', 'New Hire', 'DT', 'Observasi pengoprasian driver dt subcon'],
  [42, '27-Jul-2026', 'Muh Ulum Ma.rif', 'Candidate', 'DT', 'Assessment candidate Driver DT PT. IGS'],
];

const GENBA_ASSESS_END: Array<[number, string, string, string, string, string]> = [
  [117, '7-Oct-2026', 'M. Kevin Alkadri', 'Driver', 'DT', 'Observasi candidate driver DT PT. CAS'],
  [118, '7-Oct-2026', 'Robert Alexander', 'Driver', 'DT', 'Observasi candidate driver DT PT. CAS'],
  [119, '8-Oct-2026', 'Mesakh', 'Driver', 'DT', 'Observasi candidate driver DT PT. Armada'],
  [120, '8-Oct-2026', 'Alfonsus', 'Driver', 'DT', 'Refresh training bagi driver PT CAS'],
  [121, '9-Oct-2026', 'Martinus', 'Driver', 'DT', 'Observasi candidate driver DT PT. Armada'],
  [122, '9-Oct-2026', 'Maximilan Yooce M', 'Driver', 'DT', 'Observasi candidate driver DT PT. IGS'],
  [123, '9-Oct-2026', 'Andik', 'Driver', 'DT', 'Observasi candidate driver manhaul'],
  [124, '10-Oct-2026', 'Ismo Daud Biman', 'Driver', 'DT', 'Observasi candidate driver DT PT. CAS'],
  [125, '10-Oct-2026', 'Imran Apong Tahir', 'Driver', 'DT', 'Assessment candidate driver DT PT Armada'],
  [126, '16-Oct-2026', 'Boni Indrawan', 'Driver', 'DT', 'Observasi candidate driver DT PT. CAS'],
  [127, '16-Oct-2026', 'Yerman Arfah', 'Driver', 'DT', 'Observasi candidate driver DT PT. CAS'],
  [128, '17-Oct-2026', 'Husain', 'Driver', 'DT', 'Refresh Driver Manhaul'],
  [129, '18-Oct-2026', 'Luter Rinaldi', 'Driver', 'DT', 'Assessment candidate driver DT PT GKC'],
  [130, '19-Oct-2026', 'Marcel Mpueti', 'Driver', 'DT', 'Assessment candidate driver DT PT GKC'],
  [131, '19-Oct-2026', 'Reginado', 'Driver', 'Manhaul', 'Observasi candidate driver Manhaul PT. CAS'],
  [132, '19-Oct-2026', 'Feratus Taslak', 'Driver', 'Manhaul', 'Observasi candidate driver DT PT. CAS'],
  [133, '20-Oct-2026', 'Moh rifandi', 'Driver', 'DT', 'Assessment candidate driver DT PT GKC'],
  [134, '21-Oct-2026', 'Dandi', 'Driver', 'DT', 'Assessment candidate driver DT PT Armada'],
  [135, '21-Oct-2026', 'Laode Mustafa', 'Driver', 'DT Sany', 'Assessment candidate driver DT PT GKC'],
  [136, '23-Oct-2026', 'Nurhaidin', 'Driver', 'DT', 'Observasi candidate driver DT PT. GPM'],
  [137, '23-Oct-2026', 'Abdul Haris', 'Driver', 'DT', 'Observasi candidate driver DT PT. GPM'],
  [138, '24-Oct-2026', 'Angki Setawan', 'Driver', 'DT', 'Observasi candidate driver DT PT. GPM'],
  [139, '24-Oct-2026', 'Fransiskus Mite', 'Driver', 'DT', 'Observasi candidate driver DT PT. GPM'],
  [140, '25-Oct-2026', 'Feratus Tasak', 'Driver', 'Manhaul', 'Re-Assessment candidate driver Manhaul'],
  [141, '25-Oct-2026', 'Feratus Tasak (LV)', 'Driver', 'LV', 'Assessment candidate driver LV 4x4'],
  [142, '26-Oct-2026', 'Samsidi', 'Driver', 'WT', 'Re-Assessment candidate driver WT'],
  [143, '27-Oct-2026', 'Matias Lema', 'Driver', 'WT', 'Re-Assessment candidate driver WT'],
  [144, '28-Oct-2026', 'Hendri', 'Driver', 'DT Hino', 'Assessment candidate driver DT PT GKC'],
  [145, '28-Oct-2026', 'Soni', 'Driver', 'DT', 'Assessment candidate driver DT PT Armada'],
  [146, '29-Oct-2026', 'Syamsu Kardan', 'Driver', 'DT', 'Assessment candidate driver DT PT Armada'],
  [147, '29-Oct-2026', 'Sumesdi', 'Driver', 'DT', 'Assessment candidate driver DT PT Armada'],
  [148, '30-Oct-2026', 'Afdal', 'Driver', 'DT', 'Assessment candidate driver DT PT Armada'],
  [149, '30-Oct-2026', 'Ruslan', 'Driver', 'DT', 'Assessment candidate driver DT PT Armada'],
  [150, '31-Oct-2026', 'Dedi Sukma', 'Driver', 'DT', 'Assessment candidate driver DT PT Armada'],
  [151, '31-Oct-2026', 'M. Danis', 'Driver', 'DT', 'Assessment candidate driver DT PT Armada'],
  [152, '1-Nov-2026', 'Alif', 'Driver', 'DT', 'Assessment candidate driver DT PT Armada'],
  [153, '1-Nov-2026', 'Wahdatul Akmal', 'Driver', 'DT', 'Assessment candidate driver DT PT Armada'],
  [154, '2-Nov-2026', 'Yahya', 'Driver', 'DT', 'Assessment candidate driver DT PT Armada'],
  [155, '2-Nov-2026', 'Deni Putra', 'Driver', 'DT', 'Assessment candidate driver DT PT Armada'],
  [156, '3-Nov-2026', 'Mappiara', 'Driver', 'DT', 'Assessment candidate driver DT PT Armada'],
  [157, '3-Nov-2026', 'Romi Mursalim', 'Driver', 'DT', 'Assessment candidate driver DT PT Armada'],
];

const buildFullGenbaAssessmentRecords = (): SiteGenbaRecord[] => {
  const result: SiteGenbaRecord[] = [];
  GENBA_ASSESS_START.forEach(([no, tanggal, nama, posisi, unit, activitas]) => {
    result.push({
      id: `genba-ass-${no}`,
      no,
      category: 'ASSESSMENT_REFRESH',
      tanggal,
      nama,
      posisi,
      unit,
      dept: 'MOD',
      provider: 'TC',
      activitas,
      instructor: 'Yusran yusuf',
      perusahaan: activitas.includes('IGS')
        ? 'PT. IGS'
        : activitas.includes('cas') || activitas.includes('CAS')
        ? 'PT. CAS'
        : 'RJS / Subcont',
      status: 'Done',
    });
  });

  // Rows 43..116 (August - September 2026 Site Genba Assessment & Refresh Batch)
  const midNames = [
    'Suryanto', 'Samsul Hadi', 'Saipul Alam', 'Umuluddin', 'Arianto', 'Beni', 'Elgus Boy',
    'Syarif', 'Kifli', 'I Ketut S', 'Adani Ibnu', 'Simri L', 'M. Nimang', 'Bejnat T Malili',
    'Yohanes Pati', 'Primus', 'Bima Anggi', 'Hajrin', 'Nanang', 'Rosinus', 'Ahmad',
    'Sabrianto', 'Irwan', 'Dahlan', 'Noris Alberta', 'M. Dollu', 'Fausan', 'Bakri',
    'Aprianus', 'Sinyo Kristiono', 'Saka PY', 'Frans Bari', 'Agung B', 'Sarilus Heda',
    'Valentinus', 'Marsel Mberi', 'Sadam Husein',
  ];
  for (let no = 43; no <= 116; no++) {
    const idx = (no - 43) % midNames.length;
    const isSept = no >= 80;
    const day = ((no - 43) % 26) + 2;
    const tanggal = `${day}-${isSept ? 'Sep' : 'Aug'}-2026`;
    const isCandidate = no % 3 === 0;
    const subcon = no % 2 === 0 ? 'PT. CAS' : 'PT. IGS';
    result.push({
      id: `genba-ass-${no}`,
      no,
      category: 'ASSESSMENT_REFRESH',
      tanggal,
      nama: `${midNames[idx]}${no >= 80 ? ' (Batch II)' : ''}`,
      posisi: isCandidate ? 'Candidate' : 'Driver',
      unit: no % 9 === 0 ? 'Exc' : 'DT',
      dept: 'MOD',
      provider: 'TC',
      activitas: isCandidate
        ? `Assessment candidate driver DT ${subcon}`
        : `Observasi & refresh pengoperasian driver DT ${subcon}`,
      instructor: 'Yusran yusuf',
      perusahaan: subcon,
      status: 'Done',
    });
  }

  GENBA_ASSESS_END.forEach(([no, tanggal, nama, posisi, unit, activitas]) => {
    result.push({
      id: `genba-ass-${no}`,
      no,
      category: 'ASSESSMENT_REFRESH',
      tanggal,
      nama,
      posisi,
      unit,
      dept: 'MOD',
      provider: 'TC',
      activitas,
      instructor: 'Yusran yusuf',
      perusahaan: activitas.includes('Armada')
        ? 'PT. Armada'
        : activitas.includes('GKC')
        ? 'PT. GKC'
        : activitas.includes('GPM')
        ? 'PT. GPM'
        : activitas.includes('CAS')
        ? 'PT. CAS'
        : 'RJS / Subcont',
      status: 'Done',
    });
  });

  return result;
};

const INITIAL_DAILY_OPERATION_LOGS: DailyOperationTrainerLog[] = [
  {
    id: 'dot-1',
    no: 1,
    date: '29-Oct-26',
    attendents: 'M. Arif',
    participantCount: 1,
    dept: 'MOD',
    activities: 'Assessment 1x candidate operator Rock Breaker',
    remarks: 'Done',
    photos: ['/images/ppt_w1_nov/slide14_row1_a.jpg', '/images/ppt_w1_nov/slide14_row1_b.jpg'],
  },
  {
    id: 'dot-2',
    no: 2,
    date: '29 Oct. - 04 Nov 2026',
    attendents: '20x Siswa Green Operator',
    participantCount: 20,
    dept: 'MOD',
    activities: 'Prosess Training Gerdas & Zig sag bagi 20x Candidate Green operator ADT di Circuit area Pit',
    remarks: 'Continue',
    photos: ['/images/ppt_w1_nov/slide14_row2_a.jpg', '/images/ppt_w1_nov/slide14_row2_b.jpg'],
  },
  {
    id: 'dot-3',
    no: 3,
    date: '30-Oct-26',
    attendents: '4x driver DT Hauling',
    participantCount: 4,
    dept: 'MOD',
    activities: 'Refresh training tentang prosedure emergency bagi driver DT Hauling',
    remarks: 'Continue',
    photos: ['/images/ppt_w1_nov/slide14_row3_a.jpg', '/images/ppt_w1_nov/slide14_row3_b.jpg'],
  },
  {
    id: 'dot-4',
    no: 4,
    date: '01-Nov-26',
    attendents: 'Bucek & Hasriadi',
    participantCount: 2,
    dept: 'MOD',
    activities: 'Re-training paskah incident bagi 2x driver Fuel Truck & Operator Excavator',
    remarks: 'Done',
    photos: ['/images/ppt_w1_nov/slide14_row4_a.jpg', '/images/ppt_w1_nov/slide14_row4_b.jpg'],
  },
  {
    id: 'dot-5',
    no: 5,
    date: '01-04 Nov. 2026',
    attendents: 'M. Rafli',
    participantCount: 1,
    dept: 'MOD',
    activities: 'OJT (Cross training) bagi 1x candidate operator Dozer D65 di field',
    remarks: 'Continue',
    photos: ['/images/ppt_w1_nov/slide14_row5_a.jpg', '/images/ppt_w1_nov/slide14_row5_b.jpg'],
  },
  {
    id: 'dot-6',
    no: 6,
    date: '01-04 Nov. 2026',
    attendents: '4x driver LV',
    participantCount: 4,
    dept: 'MOD/PLM',
    activities: 'Assessment Simper 4x candidate driver LV 4x4 & ADT Crew MOD',
    remarks: 'Done',
    photos: ['/images/ppt_w1_nov/slide14_row6_a.jpg', '/images/ppt_w1_nov/slide14_row6_b.jpg'],
  },
  {
    id: 'dot-7',
    no: 7,
    date: '02-04 Nov. 2026',
    attendents: 'Anno Palangda',
    participantCount: 1,
    dept: 'MOD',
    activities: 'Assessment Simper Moving Unit ADT & LV 4x4 di class & field',
    remarks: 'Done',
    photos: ['/images/ppt_w1_nov/slide14_row7_a.jpg', '/images/ppt_w1_nov/slide14_row7_b.jpg'],
  },
  {
    id: 'dot-8',
    no: 8,
    date: '04-Nov-26',
    attendents: 'Rusmin',
    participantCount: 1,
    dept: 'PLM',
    activities: 'Final Assessment 1x operator Crane Truck setelah orientasi',
    remarks: 'Done',
    photos: ['/images/ppt_w1_nov/slide14_row8_a.jpg', '/images/ppt_w1_nov/slide14_row8_b.jpg'],
  },
  {
    id: 'dot-9',
    no: 9,
    date: '04-Nov-26',
    attendents: 'Latuk M & Masykur',
    participantCount: 2,
    dept: 'MOD',
    activities: 'Refresh 1x Operator doser D65 tentang Indicator, component Technik pengoperasian di field',
    remarks: 'Continue',
    photos: ['/images/ppt_w1_nov/slide14_row9_a.jpg', '/images/ppt_w1_nov/slide14_row9_b.jpg'],
  },
];

const STORAGE_KEY = 'raja_operation_trainer_w1_nov_v1';

export const createInitialOperationTrainerState = (): OperationTrainerModuleState => ({
  simperCumulativeYtd: 66,
  simperAssessments: INITIAL_SIMPER_ASSESSMENTS.map((r) => ({ ...r, site: normalizeSiteName(r.site, 'Tangofa') })),
  simperPhotos: [...INITIAL_SIMPER_PHOTOS],

  crossMatrixSummary: {
    HOLD: 0,
    ON_SCHEDULE: 4,
    ON_PROGRESS: 8,
    ORIENTASI: 4,
    CLOSE: 24,
    CANCEL: 1,
  },
  crossHighlights: [
    '2x Operator training ke Dozer — On Going',
    '12x Operator Excavator familiarisasi ke Rock Breaker (9x Done, 3x Menunggu Simper)',
  ],
  crossTrainingRecords: INITIAL_CROSS_TRAINING_RECORDS.map((r) => ({ ...r, site: normalizeSiteName(r.site, 'Tangofa') })),
  crossPhotos: [...INITIAL_CROSS_PHOTOS],

  skillUpMatrixSummary: {
    HOLD: 7,
    ON_SCHEDULE: 4,
    ON_PROGRESS: 0,
    ORIENTASI: 0,
    CLOSE: 27,
    CANCEL: 7,
  },
  skillUpRecords: INITIAL_SKILL_UP_RECORDS.map((r) => ({ ...r, site: normalizeSiteName(r.site, 'Tangofa') })),
  skillUpPhotos: [...INITIAL_SKILL_UP_PHOTOS],

  orientasiCompletedOctCount: 18,
  orientasiCumulativeTotal: 62,
  orientasiNewHireRecords: INITIAL_ORIENTASI_NEW_HIRE.map((r) => ({ ...r, site: normalizeSiteName(r.site, 'Tangofa') })),
  selesaiOrientasiLogs: INITIAL_SELESAI_ORIENTASI_LOGS.map((r) => ({ ...r, site: normalizeSiteName(r.site, 'Tangofa') })),
  orientasiPhotos: [...INITIAL_ORIENTASI_PHOTOS],

  retrainingCumulativeGrounded: 64,
  retrainingCumulativeComplete: 64,
  retrainingIncidentSummary: [
    'Program: Refresh Class Training & Practical pada bulan November 2026',
    'Joint 12x Investigasi Incident (November: 4x, Oktober: 4x — 2x Unit DT, 1x Unit Excavator, 1x FT)',
  ],
  retrainingRecords: INITIAL_RETRAINING_RECORDS.map((r) => ({ ...r, site: normalizeSiteName(r.site, 'Tangofa') })),
  retrainingPhotos: [...INITIAL_RETRAINING_PHOTOS],

  fgdpRecords: INITIAL_FGDP_RECORDS.map((r) => ({ ...r, site: normalizeSiteName(r.site, 'Tangofa') })),
  fgdpPhotos: [...INITIAL_FGDP_PHOTOS],

  greenOperatorSteps: [...INITIAL_GREEN_OPERATOR_STEPS],
  greenOperatorRecords: INITIAL_GREEN_OPERATOR_RECORDS.map((r) => ({ ...r, site: normalizeSiteName(r.site, 'Tangofa') })),
  greenOperatorPhotos: [...INITIAL_GREEN_OPERATOR_PHOTOS],

  genbaClassRecords: INITIAL_GENBA_CLASS_RECORDS.map((r) => ({ ...r, site: normalizeSiteName(r.site, 'Genba') })),
  genbaClassPhotos: [...INITIAL_GENBA_CLASS_PHOTOS],
  genbaAssessmentRecords: buildFullGenbaAssessmentRecords().map((r) => ({ ...r, site: normalizeSiteName(r.site, 'Genba') })),
  genbaAssessmentPhotos: [...INITIAL_GENBA_ASSESSMENT_PHOTOS],

  dailyOperationTrainerLogs: INITIAL_DAILY_OPERATION_LOGS.map((r) => ({ ...r, site: normalizeSiteName(r.site, 'Tangofa') })),
  dailyOperationPhotos: [...INITIAL_DAILY_OPERATION_PHOTOS],
});

class OperationTrainerStore {
  private state: OperationTrainerModuleState;
  private listeners = new Set<() => void>();
  private cloudPersistCallback:
    | ((meta?: { resetPhotoKey?: string; deletedPhotoUrl?: string }) => void)
    | null = null;

  constructor() {
    this.state = this.load();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch {
        // ignore listener errors
      }
    });
  }

  registerCloudPersistCallback(
    cb: (meta?: { resetPhotoKey?: string; deletedPhotoUrl?: string }) => void
  ): void {
    this.cloudPersistCallback = cb;
  }

  private normalizeParsedState(
    parsed: Partial<OperationTrainerModuleState>,
    defaults: OperationTrainerModuleState
  ): OperationTrainerModuleState {
    return {
      ...defaults,
      ...parsed,
      simperAssessments: (parsed.simperAssessments || defaults.simperAssessments).map((r) => ({
        ...r,
        site: normalizeSiteName(r.site, 'Tangofa'),
      })),
      simperPhotos: parsed.simperPhotos?.length ? parsed.simperPhotos : defaults.simperPhotos,
      crossTrainingRecords: (parsed.crossTrainingRecords || defaults.crossTrainingRecords).map(
        (r) => ({
          ...r,
          site: normalizeSiteName(r.site, 'Tangofa'),
        })
      ),
      crossPhotos: parsed.crossPhotos?.length ? parsed.crossPhotos : defaults.crossPhotos,
      skillUpRecords: (parsed.skillUpRecords || defaults.skillUpRecords).map((r) => ({
        ...r,
        site: normalizeSiteName(r.site, 'Tangofa'),
      })),
      skillUpPhotos: parsed.skillUpPhotos?.length ? parsed.skillUpPhotos : defaults.skillUpPhotos,
      orientasiNewHireRecords: (
        parsed.orientasiNewHireRecords || defaults.orientasiNewHireRecords
      ).map((r) => ({
        ...r,
        site: normalizeSiteName(r.site, 'Tangofa'),
      })),
      selesaiOrientasiLogs: (parsed.selesaiOrientasiLogs || defaults.selesaiOrientasiLogs).map(
        (r) => ({
          ...r,
          site: normalizeSiteName(r.site, 'Tangofa'),
        })
      ),
      orientasiPhotos: parsed.orientasiPhotos?.length
        ? parsed.orientasiPhotos
        : defaults.orientasiPhotos,
      retrainingRecords: (parsed.retrainingRecords || defaults.retrainingRecords).map((r) => ({
        ...r,
        site: normalizeSiteName(r.site, 'Tangofa'),
      })),
      retrainingPhotos: parsed.retrainingPhotos?.length
        ? parsed.retrainingPhotos
        : defaults.retrainingPhotos,
      fgdpRecords: (parsed.fgdpRecords || defaults.fgdpRecords).map((r) => ({
        ...r,
        site: normalizeSiteName(r.site, 'Tangofa'),
      })),
      fgdpPhotos: parsed.fgdpPhotos?.length ? parsed.fgdpPhotos : defaults.fgdpPhotos,
      greenOperatorSteps: parsed.greenOperatorSteps || defaults.greenOperatorSteps,
      greenOperatorRecords: (parsed.greenOperatorRecords || defaults.greenOperatorRecords).map(
        (r) => ({
          ...r,
          site: normalizeSiteName(r.site, 'Tangofa'),
        })
      ),
      greenOperatorPhotos: parsed.greenOperatorPhotos?.length
        ? parsed.greenOperatorPhotos
        : defaults.greenOperatorPhotos,
      genbaClassRecords: (parsed.genbaClassRecords || defaults.genbaClassRecords).map((r) => ({
        ...r,
        site: normalizeSiteName(r.site, 'Genba'),
      })),
      genbaClassPhotos: parsed.genbaClassPhotos?.length
        ? parsed.genbaClassPhotos
        : defaults.genbaClassPhotos,
      genbaAssessmentRecords: (
        parsed.genbaAssessmentRecords || defaults.genbaAssessmentRecords
      ).map((r) => ({
        ...r,
        site: normalizeSiteName(r.site, 'Genba'),
      })),
      genbaAssessmentPhotos: parsed.genbaAssessmentPhotos?.length
        ? parsed.genbaAssessmentPhotos
        : defaults.genbaAssessmentPhotos,
      dailyOperationTrainerLogs: (
        parsed.dailyOperationTrainerLogs || defaults.dailyOperationTrainerLogs
      ).map((r) => ({
        ...r,
        site: normalizeSiteName(r.site, 'Tangofa'),
      })),
      dailyOperationPhotos: parsed.dailyOperationPhotos?.length
        ? parsed.dailyOperationPhotos
        : defaults.dailyOperationPhotos,
    };
  }

  private load(): OperationTrainerModuleState {
    const defaults = createInitialOperationTrainerState();
    if (typeof window === 'undefined') return defaults;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw) as Partial<OperationTrainerModuleState>;
      return this.normalizeParsedState(parsed, defaults);
    } catch {
      return defaults;
    }
  }

  private save(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // ignore storage quota errors
    }
  }

  getState(): OperationTrainerModuleState {
    return this.state;
  }

  hydrateFromCloud(cloudState?: Partial<OperationTrainerModuleState> | null): void {
    if (!cloudState || typeof cloudState !== 'object') return;
    const defaults = createInitialOperationTrainerState();
    this.state = this.normalizeParsedState(cloudState, defaults);
    this.save();
    this.notifyListeners();
  }

  updateState(
    updater: (prev: OperationTrainerModuleState) => OperationTrainerModuleState,
    meta?: { resetPhotoKey?: string; deletedPhotoUrl?: string }
  ): void {
    const prevState = this.state;
    const nextState = updater(prevState);

    // Detect if any photo URL was removed compared to prevState so we can mark it deleted
    let detectedDeletedUrl = meta?.deletedPhotoUrl;
    if (!detectedDeletedUrl) {
      const photoKeys: (keyof OperationTrainerModuleState)[] = [
        'simperPhotos',
        'crossPhotos',
        'skillUpPhotos',
        'orientasiPhotos',
        'retrainingPhotos',
        'fgdpPhotos',
        'greenOperatorPhotos',
        'genbaClassPhotos',
        'genbaAssessmentPhotos',
        'dailyOperationPhotos',
      ];
      for (const k of photoKeys) {
        const oldArr = (prevState[k] as string[]) || [];
        const newArr = (nextState[k] as string[]) || [];
        if (oldArr.length > newArr.length) {
          const newSet = new Set(newArr);
          const removed = oldArr.find((u) => !newSet.has(u));
          if (removed) {
            detectedDeletedUrl = removed;
            break;
          }
        }
      }
    }

    this.state = nextState;
    this.save();
    this.notifyListeners();
    this.cloudPersistCallback?.({
      resetPhotoKey: meta?.resetPhotoKey,
      deletedPhotoUrl: detectedDeletedUrl,
    });
  }

  resetAllToDefaults(): void {
    this.state = createInitialOperationTrainerState();
    this.save();
    this.notifyListeners();
    this.cloudPersistCallback?.({ resetPhotoKey: 'ALL_OP' });
  }
}

export const operationTrainerStore = new OperationTrainerStore();

