// ==============================================================================
// RAJA ACADEMY — THR DASHBOARD DATA STORE, RBAC & ACHIEVEMENT ENGINE
// Emulates Supabase PostgreSQL Schema, RLS Policies, Constraints, and RPCs
// ==============================================================================

import {
  Role,
  Department,
  UserProfile,
  Employee,
  DepartmentUserAssignment,
  TrainingProgram,
  TrainingApplication,
  TrainingApplicationParticipant,
  TrainingApprovalHistory,
  TrainingSchedule,
  TrainingRecord,
  TrainingEvaluation,
  Certification,
  KpiDefinition,
  KpiTarget,
  KpiWeight,
  KpiResult,
  Notification,
  AuditLog,
  ApprovalDecision,
  ApplicationStatus,
  RoleCode,
  TrainingType,
  TrainingCategoryOption,
  TrainingTypeOption,
  SiteOption,
  TrainerActivityItem,
  TrainerActivitySection,
  RolePermissionMatrix,
  DEFAULT_ROLE_PERMISSIONS,
  ROLE_PERMISSIONS,
  syncRolePermissionsRegistry,
  getRolePermissions,
  SystemSettingsConfig,
  TechnicalTrainingClassProgram,
  InterviewCandidateSummaryConfig,
  CandidateMechanicPositionRow,
  CandidateMechanicAssessmentRecord,
  OjtBmcMonitoringRecord,
  SharingSessionBmcRecord,
  PlmAssessmentCategoryItem,
  PlmCompetencyGapRow,
  PlmTrainingClassMonthlyItem,
  PlmTrainingCorrectiveAction,
  TechnicalTrainerDailyActivityItem,
  TechnicalTrainingPlanBar,
  SharingSessionBmcScheduleItem,
  SkillAuditCategoryCode,
  SkillAuditOperatorRecord,
  SkillAuditHeavyEquipmentSummaryRow,
  TechnicalTrainingModuleState,
} from './types';
import {
  INITIAL_SKILL_AUDIT_OPERATOR_RECORDS,
  INITIAL_SKILL_AUDIT_SUMMARY_ROWS,
  INITIAL_SKILL_AUDIT_PHOTOS,
} from './skillAuditSeedData';
import { operationTrainerStore } from './operationTrainerSeedData';
import {
  fetchCloudDatabaseState,
  saveCloudDatabaseState,
  SUPABASE_PROJECT_REF,
} from './supabase';

const LOCAL_STORAGE_KEY = 'raja_academy_thr_state_v3';

// ==============================================================================
// 1. SIX OFFICIAL ROLES (STRICTLY ONLY THESE 6 ROLES)
// ==============================================================================

export const INITIAL_ROLES: Role[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    code: 'SUPER_ADMIN',
    name: 'Super Admin',
    description: 'Memiliki seluruh kewenangan sistem, manajemen pengguna, pengaturan sistem, data training, dan capaian training.',
    access_level: 1,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    code: 'ADMIN',
    name: 'Admin',
    description: 'Memiliki kewenangan operasional untuk mengelola, menginput, mengedit, dan menghapus data training serta capaian.',
    access_level: 2,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    code: 'PJO',
    name: 'PJO',
    description: 'Penanggung Jawab Operasional. Hanya memiliki akses View pada Dashboard, Data Training, dan Training Achievement.',
    access_level: 2,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    code: 'MANAGER_TC',
    name: 'Manager TC',
    description: 'Memiliki akses penuh untuk mengelola data Training Achievement, koreksi target & realisasi, serta monitoring seluruh departemen.',
    access_level: 2,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    code: 'ADMIN_TC',
    name: 'Admin TC',
    description: 'Bertugas mengelola data operasional Training Center, jadwal pelaksanaan, sertifikasi, dan capaian training.',
    access_level: 3,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000006',
    code: 'ADMIN_HRGA',
    name: 'Admin HRGA',
    description: 'Mengelola data training & karyawan sesuai kebutuhan HRGA serta akses View monitoring laporan Training Achievement.',
    access_level: 3,
    created_at: '2026-01-01T00:00:00Z',
  },
];

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: '20000000-0000-0000-0000-000000000003',
    code: 'HRGA-IT',
    name: 'HRGA-IT (Human Resources, General Affairs & IT)',
    description: 'People operations, general affairs, talent management, and IT infrastructure',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    code: 'MED',
    name: 'MED (Mining Engineering Department)',
    description: 'Mine planning, geology, geotechnical stability, survey and design',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000001',
    code: 'MOD',
    name: 'MOD (Mining Operations Department)',
    description: 'Pit operations, heavy haulage, excavation and earthmoving',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000006',
    code: 'PLM',
    name: 'PLM (Plant & Logistics Management)',
    description: 'Heavy equipment maintenance, workshop, spareparts & fleet logistics',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000007',
    code: 'CIVIL',
    name: 'CIVIL (Civil & Infrastructure)',
    description: 'Haul road construction, drainage, settling pond, and site infrastructure',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000004',
    code: 'TC',
    name: 'TC (Training Center)',
    description: 'Competency development, technical simulator, and operational certification',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000005',
    code: 'HSE',
    name: 'HSE (Health Safety & Environment)',
    description: 'Mine safety K3LH, environmental standards and SMKP compliance',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    role_id: '10000000-0000-0000-0000-000000000001',
    role_code: 'SUPER_ADMIN',
    role_name: 'Super Admin',
    nik: 'NIK-SA-01',
    full_name: 'Super Admin',
    email: 'superadmin@ptraja.com',
    phone_number: '+62811000001',
    department_id: null,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    role_id: '10000000-0000-0000-0000-000000000002',
    role_code: 'ADMIN',
    role_name: 'Admin',
    nik: 'NIK-ADM-01',
    full_name: 'Admin',
    email: 'admin@ptraja.com',
    phone_number: '+62811000002',
    department_id: null,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    role_id: '10000000-0000-0000-0000-000000000003',
    role_code: 'PJO',
    role_name: 'PJO',
    nik: 'NIK-PJO-01',
    full_name: 'PJO',
    email: 'pjo@ptraja.com',
    phone_number: '+62811000003',
    department_id: null,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    role_id: '10000000-0000-0000-0000-000000000004',
    role_code: 'MANAGER_TC',
    role_name: 'Manager TC',
    nik: 'NIK-MGR-TC',
    full_name: 'Manager TC',
    email: 'manager.tc@ptraja.com',
    phone_number: '+62811000004',
    department_id: null,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    role_id: '10000000-0000-0000-0000-000000000005',
    role_code: 'ADMIN_TC',
    role_name: 'Admin TC',
    nik: 'NIK-ADM-TC',
    full_name: 'Admin TC',
    email: 'admin.tc@ptraja.com',
    phone_number: '+62811000005',
    department_id: null,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    role_id: '10000000-0000-0000-0000-000000000006',
    role_code: 'ADMIN_HRGA',
    role_name: 'Admin HRGA',
    nik: 'NIK-ADM-HRGA',
    full_name: 'Admin HRGA',
    email: 'admin.hrga@ptraja.com',
    phone_number: '+62811000006',
    department_id: null,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
];

export const INITIAL_DEPARTMENT_ASSIGNMENTS: DepartmentUserAssignment[] = [];

export const INITIAL_EMPLOYEES: Employee[] = [
  // MOD employees
  {
    id: '40000000-0000-0000-0000-000000000001',
    department_id: '20000000-0000-0000-0000-000000000001',
    department_name: 'MOD (Mining Operations Department)',
    nik: 'EMP-MOD-001',
    full_name: 'Budi Santoso',
    position: 'Excavator Operator',
    job_level: 'Operator',
    email: 'budi.santoso@ptraja.com',
    hire_date: '2024-03-15',
    employment_status: 'PERMANENT',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000002',
    department_id: '20000000-0000-0000-0000-000000000001',
    department_name: 'MOD (Mining Operations Department)',
    nik: 'EMP-MOD-002',
    full_name: 'Agus Setiawan',
    position: 'Haul Truck Driver',
    job_level: 'Operator',
    email: 'agus.setiawan@ptraja.com',
    hire_date: '2023-06-10',
    employment_status: 'PERMANENT',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000003',
    department_id: '20000000-0000-0000-0000-000000000001',
    department_name: 'MOD (Mining Operations Department)',
    nik: 'EMP-MOD-003',
    full_name: 'Rudi Hartono',
    position: 'Pit Foreman',
    job_level: 'Supervisor',
    email: 'rudi.hartono@ptraja.com',
    hire_date: '2022-01-20',
    employment_status: 'PERMANENT',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  // MED employees
  {
    id: '40000000-0000-0000-0000-000000000004',
    department_id: '20000000-0000-0000-0000-000000000002',
    department_name: 'MED (Mining Engineering Department)',
    nik: 'EMP-MED-001',
    full_name: 'Dewi Lestari',
    position: 'Short-term Mine Planner',
    job_level: 'Staff',
    email: 'dewi.lestari@ptraja.com',
    hire_date: '2023-09-01',
    employment_status: 'PERMANENT',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000005',
    department_id: '20000000-0000-0000-0000-000000000002',
    department_name: 'MED (Mining Engineering Department)',
    nik: 'EMP-MED-002',
    full_name: 'Hendra Wijaya',
    position: 'Geotechnical Specialist',
    job_level: 'Specialist',
    email: 'hendra.wijaya@ptraja.com',
    hire_date: '2021-11-15',
    employment_status: 'PERMANENT',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  // HRGA-IT employees
  {
    id: '40000000-0000-0000-0000-000000000006',
    department_id: '20000000-0000-0000-0000-000000000003',
    department_name: 'HRGA-IT (Human Resources, General Affairs & IT)',
    nik: 'EMP-HRGA-001',
    full_name: 'Sri Fidyanti',
    position: 'HRGA & IT Operations Officer',
    job_level: 'Staff',
    email: 'sri.fidyanti@ptraja.com',
    hire_date: '2024-02-01',
    employment_status: 'PERMANENT',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  // HSE & TC employees
  {
    id: '40000000-0000-0000-0000-000000000007',
    department_id: '20000000-0000-0000-0000-000000000005',
    department_name: 'HSE (Health Safety & Environment)',
    nik: 'EMP-HSE-001',
    full_name: 'Dimas Prakoso',
    position: 'Mine Safety Inspector K3LH',
    job_level: 'Supervisor',
    email: 'dimas.prakoso@ptraja.com',
    hire_date: '2022-07-12',
    employment_status: 'PERMANENT',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000008',
    department_id: '20000000-0000-0000-0000-000000000004',
    department_name: 'TC (Training Center)',
    nik: 'EMP-TC-001',
    full_name: 'Andi Risal',
    position: 'Technical Trainer Major Foreman',
    job_level: 'Supervisor',
    email: 'andi.risal@ptraja.com',
    hire_date: '2021-05-10',
    employment_status: 'PERMANENT',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  // PLM & CIVIL employees
  {
    id: '40000000-0000-0000-0000-000000000009',
    department_id: '20000000-0000-0000-0000-000000000006',
    department_name: 'PLM (Plant & Logistics Management)',
    nik: 'EMP-PLM-001',
    full_name: 'Wahyu Pratama',
    position: 'Heavy Equipment Plant Engineer',
    job_level: 'Supervisor',
    email: 'wahyu.pratama@ptraja.com',
    hire_date: '2022-08-19',
    employment_status: 'PERMANENT',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000010',
    department_id: '20000000-0000-0000-0000-000000000007',
    department_name: 'CIVIL (Civil & Infrastructure)',
    nik: 'EMP-CIVIL-001',
    full_name: 'Rizky Ramadhan',
    position: 'Mine Civil & Haul Road Supervisor',
    job_level: 'Supervisor',
    email: 'rizky.ramadhan@ptraja.com',
    hire_date: '2023-01-14',
    employment_status: 'PERMANENT',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
];

export const INITIAL_PROGRAMS: TrainingProgram[] = [
  {
    id: '50000000-0000-0000-0000-000000000001',
    program_code: 'TR-POP-01',
    title: 'Pengawas Operasional Pertama (POP) Pertambangan',
    category: 'Certification',
    description: 'Sertifikasi kompetensi pengawas operasional pertambangan berstandar BNSP / ESDM',
    target_audience: 'Foremen & Supervisors',
    default_duration_hours: 40.0,
    default_budget_per_participant: 7500000.0,
    is_mandatory: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '50000000-0000-0000-0000-000000000002',
    program_code: 'TR-DDT-01',
    title: 'Defensive Driving & Heavy Hauler Safety',
    category: 'Safety',
    description: 'Pelatihan berkendara aman di area tambang aktif',
    target_audience: 'All Heavy Vehicle Drivers',
    default_duration_hours: 16.0,
    default_budget_per_participant: 2500000.0,
    is_mandatory: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '50000000-0000-0000-0000-000000000003',
    program_code: 'TR-GEO-01',
    title: 'Slope Stability & Geotechnical Monitoring',
    category: 'Technical',
    description: 'Analisis kestabilan lereng dan instrumentasi radar tambang',
    target_audience: 'Mine Engineers & Geologists',
    default_duration_hours: 24.0,
    default_budget_per_participant: 6000000.0,
    is_mandatory: false,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
];

export const INITIAL_KPIS: KpiDefinition[] = [
  {
    id: '60000000-0000-0000-0000-000000000001',
    code: 'KPI_HOURS_PER_EMP',
    name: 'Average Training Hours per Employee',
    description: 'Total completed training hours divided by active headcount',
    unit: 'HOURS',
    calculation_formula: 'Total Completed Hours / Total Employees',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '60000000-0000-0000-0000-000000000002',
    code: 'KPI_PASS_RATE',
    name: 'Certification & Assessment Pass Rate',
    description: 'Percentage of enrolled participants who successfully passed',
    unit: 'PERCENTAGE',
    calculation_formula: '(Passed Participants / Enrolled Participants) * 100',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '60000000-0000-0000-0000-000000000003',
    code: 'KPI_COMPLETION_RATE',
    name: 'Training Plan Realization Rate',
    description: 'Percentage of approved training plans executed to completion',
    unit: 'PERCENTAGE',
    calculation_formula: '(Training Realization / Training Plan) * 100',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
];

export const INITIAL_KPI_TARGETS: KpiTarget[] = [
  {
    id: '70000000-0000-0000-0000-000000000001',
    kpi_id: '60000000-0000-0000-0000-000000000001',
    department_id: null,
    year: 2026,
    target_value: 24.0,
    target_period: 'ANNUAL',
    set_by: '00000000-0000-0000-0000-000000000001',
  },
  {
    id: '70000000-0000-0000-0000-000000000002',
    kpi_id: '60000000-0000-0000-0000-000000000002',
    department_id: null,
    year: 2026,
    target_value: 90.0,
    target_period: 'ANNUAL',
    set_by: '00000000-0000-0000-0000-000000000001',
  },
  {
    id: '70000000-0000-0000-0000-000000000003',
    kpi_id: '60000000-0000-0000-0000-000000000003',
    department_id: null,
    year: 2026,
    target_value: 95.0,
    target_period: 'ANNUAL',
    set_by: '00000000-0000-0000-0000-000000000001',
  },
];

export const INITIAL_KPI_WEIGHTS: KpiWeight[] = [
  {
    id: '80000000-0000-0000-0000-000000000001',
    kpi_id: '60000000-0000-0000-0000-000000000001',
    year: 2026,
    weight_percentage: 40.0,
    assigned_by: '00000000-0000-0000-0000-000000000001',
  },
  {
    id: '80000000-0000-0000-0000-000000000002',
    kpi_id: '60000000-0000-0000-0000-000000000002',
    year: 2026,
    weight_percentage: 35.0,
    assigned_by: '00000000-0000-0000-0000-000000000001',
  },
  {
    id: '80000000-0000-0000-0000-000000000003',
    kpi_id: '60000000-0000-0000-0000-000000000003',
    year: 2026,
    weight_percentage: 25.0,
    assigned_by: '00000000-0000-0000-0000-000000000001',
  },
];

// ==============================================================================
// ACHIEVEMENT ANALYTICS INTERFACES
// ==============================================================================
export type CompanyScopeFilter = 'ALL' | 'INTERNAL_RJS' | 'SUBCONT';

export interface AchievementFilter {
  year?: string;
  month?: string;
  departmentId?: string;
  trainingType?: string;
  statusCategory?: string; // 'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'CANCELLED'
  companyScope?: CompanyScopeFilter;
  site?: string;
}

export interface DepartmentAchievementMetric {
  departmentId: string;
  code: string;
  name: string;
  plan: number;
  realization: number;
  inProgress: number;
  pending: number;
  cancelled: number;
  achievementPct: number | null;
  manpowerPlanned: number;
  manpowerTrained: number;
  plannedHours: number;
  actualHours: number;
}

export interface MonthlyAchievementTrend {
  monthIndex: number; // 1..12
  monthLabel: string;
  plan: number;
  realization: number;
  pending: number;
  cancelled: number;
  achievementPct: number | null;
  manpowerTrained: number;
  actualHours: number;
}

export interface TrainingPerformanceItem {
  id: string;
  applicationNumber: string;
  trainingTitle: string;
  trainingCategory: string;
  trainingType: TrainingType;
  departmentId: string;
  departmentCode: string;
  departmentName: string;
  startDate: string;
  endDate: string;
  status: ApplicationStatus;
  statusCategory: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'CANCELLED';
  plannedParticipants: number;
  actualParticipants: number;
  plannedHours: number;
  actualHours: number;
  participantNames: string[];
  sourceLabel?: string;
  sourceTab?: string;
  companyScope?: 'INTERNAL_RJS' | 'SUBCONT';
  site?: string;
  cohortKey?: string;
}

export interface TrainingAchievementSummary {
  totalPlan: number;
  totalRealization: number;
  totalInProgress: number;
  totalPending: number;
  totalCancelled: number;
  achievementPercentage: number | null;
  totalManpowerPlanned: number;
  totalManpowerTrained: number;
  totalAttendanceSessions: number;
  totalPlannedSessions: number;
  totalPlannedHours: number;
  totalTrainingHours: number;
  departmentBreakdown: DepartmentAchievementMetric[];
  monthlyTrend: MonthlyAchievementTrend[];
  typeBreakdown: Array<{
    type: TrainingType;
    label: string;
    plan: number;
    realization: number;
    achievementPct: number | null;
    manpowerTrained: number;
    actualHours: number;
  }>;
  trainingItems: TrainingPerformanceItem[];
}

// ==============================================================================
// PERSISTENT IN-MEMORY DATA STORE
// ==============================================================================

export const INITIAL_TRAINING_CATEGORIES: TrainingCategoryOption[] = [
  {
    id: 'cat-1',
    code: 'Safety',
    name: 'Safety / HSE',
    description: 'Pelatihan keselamatan kerja dan K3 pertambangan',
  },
  {
    id: 'cat-2',
    code: 'Technical',
    name: 'Technical & Operations',
    description: 'Kompetensi teknis alat berat, pit operasi, dan engineering',
  },
  {
    id: 'cat-3',
    code: 'Certification',
    name: 'National Certification / POP',
    description: 'Sertifikasi kompetensi nasional BNSP / ESDM (POP, POM, POU)',
  },
  {
    id: 'cat-4',
    code: 'Compliance',
    name: 'Regulatory Compliance',
    description: 'Kepatuhan regulasi pertambangan dan SMKP Minerba',
  },
  {
    id: 'cat-5',
    code: 'Leadership',
    name: 'Supervisory & Leadership',
    description: 'Kepemimpinan pengawas, manajemen, dan pengembangan SDM',
  },
];

export const INITIAL_TRAINING_TYPES: TrainingTypeOption[] = [
  {
    id: 'type-1',
    code: 'INTERNAL',
    name: 'Internal Training Center',
    description: 'Pelatihan internal oleh instruktur Training Center PT. RAJA',
  },
  {
    id: 'type-2',
    code: 'EXTERNAL',
    name: 'External Training Institution',
    description: 'Pelatihan oleh lembaga eksternal / vendor pelatihan resmi',
  },
  {
    id: 'type-3',
    code: 'CERTIFICATION',
    name: 'Professional Certification Body (BNSP/ESDM)',
    description: 'Uji kompetensi dan sertifikasi profesi resmi',
  },
  {
    id: 'type-4',
    code: 'IN_HOUSE',
    name: 'In-House Certified Workshop',
    description: 'Workshop in-house kolaborasi departemen atau narasumber',
  },
];

export const INITIAL_SITES: SiteOption[] = [
  {
    id: 'site-1',
    code: 'TANGOFA',
    name: 'Site Tangofa',
    description: 'Area operasional pertambangan Site Tangofa',
  },
  {
    id: 'site-2',
    code: 'TPM',
    name: 'Site TPM',
    description: 'Area operasional pertambangan Site TPM',
  },
  {
    id: 'site-3',
    code: 'GORONTALO',
    name: 'Site Gorontalo',
    description: 'Area operasional pertambangan Site Gorontalo',
  },
  {
    id: 'site-4',
    code: 'SAMPALA',
    name: 'Site Sampala',
    description: 'Area operasional pertambangan Site Sampala',
  },
  {
    id: 'site-5',
    code: 'HO_MAKASSAR',
    name: 'Site Head Office (Makassar)',
    description: 'Kantor Pusat PT. Roda Jaya Sakti — Makassar',
  },
  {
    id: 'site-6',
    code: 'BELOPA',
    name: 'Site Belopa',
    description: 'Area operasional pertambangan Site Belopa',
  },
  {
    id: 'site-7',
    code: 'GENBA',
    name: 'Site Genba',
    description: 'Area operasional lapangan Site Genba',
  },
];

export const INITIAL_TRAINER_ACTIVITIES: TrainerActivitySection[] = [
  {
    id: 'trainer-sec-1',
    year: '2026',
    month: '11',
    week_number: 1,
    period_label: 'Minggu Ke-1 • November 2026',
    badge_label: 'TRAINING',
    title: '1. Program Technical Training',
    items: [
      {
        id: 'act-item-1',
        content:
          'Melakukan Training Class dalam pemenuhan competency pada GAP sesuai data TNA bagi Crew PLM Tangofa & Genba.',
      },
      {
        id: 'act-item-2',
        content:
          'Melakukan interview bagi candidate mekanik baik di Tangofa juga di Genba.',
      },
      {
        id: 'act-item-3',
        content:
          'Melakukan Assessment bagi candidate mekanik yang di promosikan ke Posisi tertentu.',
      },
      {
        id: 'act-item-4',
        content:
          'Memonitor & mengontrol 31x Siswa BMC yang mengikuti OJT di dept PLM. Tangofa & 7x di TPM.',
      },
      {
        id: 'act-item-5',
        content: 'Melakukan Sharing Session bagi 17x Siswa BMC Batch VII',
      },
    ],
    updated_at: '2026-11-09T07:00:00Z',
    updated_by: 'Super Admin',
  },
];

// ==============================================================================
// INITIAL REAL DATA — PROGRAM TECHNICAL TRAINING (WEEKLY REPORT WEEK 01 NOV 2026)
// ==============================================================================
export const INITIAL_TECHNICAL_TRAINING_MODULE_DATA: TechnicalTrainingModuleState = {
  report_header: {
    issue_date: '05-Nov-26',
    owner_name: 'Abdul Rachman',
    owner_role: 'HOS Technical Trainer',
    member_dept: 'PLM (Plant & Logistics Management)',
    period_label: 'Week 01 • November 2026',
  },
  // A. Training Class & Competency GAP (Crew PLM Tangofa & Genba)
  trainingClassPrograms: [
    {
      id: 'ttc-prog-1',
      program_name: 'Training Class Pemenuhan Competency GAP TNA — Basic Engine (BEG)',
      department_area: 'PLM • Site Tangofa & Site Genba',
      target_participants: 67,
      actual_participants: 12,
      execution_period: 'Mei – November 2026',
      status: 'On Going',
      remarks: 'Pemenuhan GAP sesuai data TNA bagi Crew PLM Tangofa (57) & Genba (10)',
      created_at: '2026-11-05T08:00:00Z',
      updated_at: '2026-11-05T08:00:00Z',
      updated_by: 'Abdul Rachman (HOS Technical Trainer)',
    },
    {
      id: 'ttc-prog-2',
      program_name: 'Training Class Pemenuhan Competency GAP TNA — Torqflow & T/M (TQ)',
      department_area: 'PLM • Site Tangofa & Site Genba',
      target_participants: 65,
      actual_participants: 19,
      execution_period: 'Mei – November 2026',
      status: 'On Going',
      remarks: 'Fill Gap tertinggi (25% dari 76 Total Gap All)',
      created_at: '2026-11-05T08:00:00Z',
      updated_at: '2026-11-05T08:00:00Z',
      updated_by: 'Abdul Rachman (HOS Technical Trainer)',
    },
    {
      id: 'ttc-prog-3',
      program_name: 'Training Class Pemenuhan Competency GAP TNA — Maintenance Management Concept (MMC)',
      department_area: 'PLM • Site Tangofa & All GL',
      target_participants: 24,
      actual_participants: 16,
      execution_period: 'Mei – Oktober 2026',
      status: 'On Going',
      remarks: 'Capaian Fill Gap 67% (16 dari 24 personel)',
      created_at: '2026-11-05T08:00:00Z',
      updated_at: '2026-11-05T08:00:00Z',
      updated_by: 'Abdul Rachman (HOS Technical Trainer)',
    },
    {
      id: 'ttc-prog-4',
      program_name: 'Training Class Pemenuhan Competency GAP TNA — Hydraulic (HYD) & Maintenance (MTN)',
      department_area: 'PLM • Site Tangofa & Site Genba',
      target_participants: 81,
      actual_participants: 12,
      execution_period: 'Juni – November 2026',
      status: 'On Going',
      remarks: 'Fokus mekanik Tangofa (60) & Genba (10) serta All GL (11)',
      created_at: '2026-11-05T08:00:00Z',
      updated_at: '2026-11-05T08:00:00Z',
      updated_by: 'Abdul Rachman (HOS Technical Trainer)',
    },
    {
      id: 'ttc-prog-5',
      program_name: 'Training Class Pemenuhan Competency GAP TNA — Differential & F/D (DFD) & Steering Brake (SB)',
      department_area: 'PLM • Site Tangofa & Site Genba',
      target_participants: 48,
      actual_participants: 12,
      execution_period: 'Agustus – November 2026',
      status: 'On Going',
      remarks: 'Progress Fill Gap masing-masing mencapai 25%',
      created_at: '2026-11-05T08:00:00Z',
      updated_at: '2026-11-05T08:00:00Z',
      updated_by: 'Abdul Rachman (HOS Technical Trainer)',
    },
  ],
  // B. Interview Candidate Mechanic & Tabel 2. Data Assessment Candidate Mechanic (Slide 2)
  interviewSummary: {
    headline_label: 'Update interview candidate crew PLM al : 94x Done',
    done_count: 94,
    status: 'On Going',
    area_scope: 'Site Tangofa, Site Genba & Site TPM',
    notes:
      'Kegiatan interview kandidat mekanik untuk area Tangofa, Genba, dan TPM. Total peserta masuk 120 kandidat, sudah interview 94x Done (Status: On Going), dengan 79 kandidat Recommended (M3 Middle Up).',
    updated_at: '2026-11-05T08:00:00Z',
    updated_by: 'Abdul Rachman (HOS Technical Trainer)',
  },
  candidatePositionRecap: [
    {
      id: 'cand-pos-1',
      no: 1,
      candidate_position: 'Trainer Maintenance',
      total_masuk: 2,
      sudah_itv: 2,
      recommended_m3_up: 2,
      site_tangofa: 2,
      site_tpm: 0,
      remark: 'TC',
      created_at: '2026-11-05T08:00:00Z',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'cand-pos-2',
      no: 2,
      candidate_position: 'GL PLM',
      total_masuk: 18,
      sudah_itv: 14,
      recommended_m3_up: 13,
      site_tangofa: 11,
      site_tpm: 3,
      remark: '1 POP BNSP Mati',
      created_at: '2026-11-05T08:00:00Z',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'cand-pos-3',
      no: 3,
      candidate_position: 'Planner',
      total_masuk: 4,
      sudah_itv: 3,
      recommended_m3_up: 3,
      site_tangofa: 2,
      site_tpm: 2,
      remark: '',
      created_at: '2026-11-05T08:00:00Z',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'cand-pos-4',
      no: 4,
      candidate_position: 'Plant Engineer',
      total_masuk: 1,
      sudah_itv: 1,
      recommended_m3_up: 1,
      site_tangofa: 1,
      site_tpm: 0,
      remark: '',
      created_at: '2026-11-05T08:00:00Z',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'cand-pos-5',
      no: 5,
      candidate_position: 'Autolub',
      total_masuk: 2,
      sudah_itv: 2,
      recommended_m3_up: 1,
      site_tangofa: 2,
      site_tpm: 0,
      remark: '',
      created_at: '2026-11-05T08:00:00Z',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'cand-pos-6',
      no: 6,
      candidate_position: 'DT medium & Support',
      total_masuk: 26,
      sudah_itv: 25,
      recommended_m3_up: 21,
      site_tangofa: 25,
      site_tpm: 2,
      remark: '2 Mundur',
      created_at: '2026-11-05T08:00:00Z',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'cand-pos-7',
      no: 7,
      candidate_position: 'A2B Track',
      total_masuk: 18,
      sudah_itv: 14,
      recommended_m3_up: 13,
      site_tangofa: 15,
      site_tpm: 3,
      remark: '2 mundur, 2 no respon',
      created_at: '2026-11-05T08:00:00Z',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'cand-pos-8',
      no: 8,
      candidate_position: 'A2B Wheel',
      total_masuk: 21,
      sudah_itv: 11,
      recommended_m3_up: 6,
      site_tangofa: 15,
      site_tpm: 5,
      remark: '1 no respon',
      created_at: '2026-11-05T08:00:00Z',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'cand-pos-9',
      no: 9,
      candidate_position: 'Electrican',
      total_masuk: 10,
      sudah_itv: 9,
      recommended_m3_up: 8,
      site_tangofa: 6,
      site_tpm: 3,
      remark: '1 no respon',
      created_at: '2026-11-05T08:00:00Z',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'cand-pos-10',
      no: 10,
      candidate_position: 'Tyreman',
      total_masuk: 14,
      sudah_itv: 10,
      recommended_m3_up: 9,
      site_tangofa: 11,
      site_tpm: 3,
      remark: '1 no respon',
      created_at: '2026-11-05T08:00:00Z',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'cand-pos-11',
      no: 11,
      candidate_position: 'Welder',
      total_masuk: 4,
      sudah_itv: 3,
      recommended_m3_up: 2,
      site_tangofa: 4,
      site_tpm: 0,
      remark: '1 mundur',
      created_at: '2026-11-05T08:00:00Z',
      updated_at: '2026-11-05T08:00:00Z',
    },
  ],
  // C. Assessment Candidate Mechanic — dikosongkan: diisi admin dengan data kandidat asli (tidak ada data individu di laporan)
  candidateAssessments: [],
  // D. Monitoring OJT BMC (31 Siswa di PLM Tangofa & 7 Siswa di TPM)
  ojtBmcRecords: [
    {
      id: 'ojt-bmc-1',
      student_name: 'Kelompok Siswa BMC OJT — Departemen PLM Tangofa (31 Siswa)',
      batch: 'BMC Reguler 2026',
      department_placement: 'PLM (Plant & Logistics Management)',
      location: 'Site Tangofa',
      student_count: 31,
      ojt_period: 'Mei – November 2026',
      mentor_name: 'Abdul Rachman, Edison & Idris (Tim Technical Trainer PLM)',
      ojt_status: 'On Going',
      ojt_evaluation:
        'Memonitor & mengontrol 31x Siswa BMC yang mengikuti OJT di Dept PLM Tangofa. Koordinasi dengan Pengawas PLM untuk menyesuaikan Time Frame (TF) OJT.',
      created_at: '2026-11-05T08:00:00Z',
      updated_at: '2026-11-05T08:00:00Z',
      updated_by: 'Abdul Rachman (HOS Technical Trainer)',
    },
    {
      id: 'ojt-bmc-2',
      student_name: 'Kelompok Siswa BMC OJT — Departemen PLM Site TPM (7 Siswa)',
      batch: 'BMC Reguler 2026',
      department_placement: 'PLM (Plant & Logistics Management)',
      location: 'Site TPM',
      student_count: 7,
      ojt_period: 'Juni – November 2026',
      mentor_name: 'Tim Technical Trainer & Pengawas PLM Site TPM',
      ojt_status: 'On Going',
      ojt_evaluation:
        'Memonitor & mengontrol 7x Siswa BMC yang mengikuti OJT di Site TPM. Section dan pembagian Job Pengawas dibuat Fix.',
      created_at: '2026-11-05T08:00:00Z',
      updated_at: '2026-11-05T08:00:00Z',
      updated_by: 'Abdul Rachman (HOS Technical Trainer)',
    },
  ],
  // E. Sharing Session BMC Batch VII (17 Siswa BMC Batch VII)
  sharingSessionRecords: [
    {
      id: 'share-bmc-1',
      session_title: 'Sharing Session Siswa BMC Batch VII — Safety, Basic Maintenance & Workshop Culture',
      batch: 'BMC Batch VII',
      schedule_date: '2026-11-05',
      location: 'Training Center PT. RAJA — Site Tangofa',
      instructor_name: 'Abdul Rachman, Edison & Idris (Technical Trainer)',
      target_participants: 17,
      actual_attendance: 17,
      execution_status: 'Done',
      documentation_notes:
        'Melakukan Sharing Session bagi 17x Siswa BMC Batch VII (Kehadiran 100%: 17 dari 17 siswa). Penambahan materi Safety dan Refresh Materi.',
      created_at: '2026-11-05T08:00:00Z',
      updated_at: '2026-11-05T08:00:00Z',
      updated_by: 'Abdul Rachman (HOS Technical Trainer)',
    },
  ],
  // 3. Resume Assessment Crew Mechanic PLM 2026 (Slide 3)
  plmAssessmentCategories: [
    {
      id: 'plm-cat-1',
      category_name: 'M1, M2, M3',
      class_count: 122,
      period_year: '2026',
      description: 'Kategori Mechanic Tangofa & Mechanic Genba (M1, M2, M3) sesuai Resume Assessment Crew Mechanic PLM 2026',
      updated_at: '2026-11-05T08:00:00Z',
      updated_by: 'Abdul Rachman (HOS Technical Trainer)',
    },
    {
      id: 'plm-cat-2',
      category_name: '2GL, 2 FGDP/GLDP',
      class_count: 113,
      period_year: '2026',
      description: 'Kategori Group Leader (All GL) & FGDP/GLDP sesuai Resume Assessment Crew Mechanic PLM 2026',
      updated_at: '2026-11-05T08:00:00Z',
      updated_by: 'Abdul Rachman (HOS Technical Trainer)',
    },
  ],
  plmCompetencyGapRows: [
    {
      id: 'gap-row-1',
      no: 1,
      code: 'PK',
      training_name: 'Product Knowledge',
      gap_all: 14,
      mechanic_tangofa: 7,
      mechanic_genba: 0,
      all_gl: 7,
      fgdp_gldp: 6,
      fill_gap: 2,
      period_year: '2026',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'gap-row-2',
      no: 2,
      code: 'BEG',
      training_name: 'Basic Engine',
      gap_all: 77,
      mechanic_tangofa: 57,
      mechanic_genba: 10,
      all_gl: 10,
      fgdp_gldp: 6,
      fill_gap: 12,
      period_year: '2026',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'gap-row-3',
      no: 3,
      code: 'BEL',
      training_name: 'Basic Electric',
      gap_all: 78,
      mechanic_tangofa: 59,
      mechanic_genba: 10,
      all_gl: 9,
      fgdp_gldp: 6,
      fill_gap: 10,
      period_year: '2026',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'gap-row-4',
      no: 4,
      code: 'TM',
      training_name: 'Tool & Measurement',
      gap_all: 66,
      mechanic_tangofa: 56,
      mechanic_genba: 10,
      all_gl: 0,
      fgdp_gldp: 6,
      fill_gap: 7,
      period_year: '2026',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'gap-row-5',
      no: 5,
      code: 'TQ',
      training_name: 'Torqflow & T/M',
      gap_all: 76,
      mechanic_tangofa: 55,
      mechanic_genba: 10,
      all_gl: 11,
      fgdp_gldp: 6,
      fill_gap: 19,
      period_year: '2026',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'gap-row-6',
      no: 6,
      code: 'HYD',
      training_name: 'Hydraulic',
      gap_all: 81,
      mechanic_tangofa: 60,
      mechanic_genba: 10,
      all_gl: 11,
      fgdp_gldp: 6,
      fill_gap: 12,
      period_year: '2026',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'gap-row-7',
      no: 7,
      code: 'UC',
      training_name: 'Under Carriage',
      gap_all: 25,
      mechanic_tangofa: 24,
      mechanic_genba: 1,
      all_gl: 0,
      fgdp_gldp: 6,
      fill_gap: 8,
      period_year: '2026',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'gap-row-8',
      no: 8,
      code: 'MTN',
      training_name: 'Maintenance',
      gap_all: 81,
      mechanic_tangofa: 60,
      mechanic_genba: 10,
      all_gl: 11,
      fgdp_gldp: 6,
      fill_gap: 12,
      period_year: '2026',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'gap-row-9',
      no: 9,
      code: 'BMT',
      training_name: 'Basic Material',
      gap_all: 79,
      mechanic_tangofa: 58,
      mechanic_genba: 10,
      all_gl: 11,
      fgdp_gldp: 6,
      fill_gap: 9,
      period_year: '2026',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'gap-row-10',
      no: 10,
      code: 'MMC',
      training_name: 'Maintenance Management Concept',
      gap_all: 24,
      mechanic_tangofa: 10,
      mechanic_genba: 0,
      all_gl: 14,
      fgdp_gldp: 9,
      fill_gap: 16,
      period_year: '2026',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'gap-row-11',
      no: 11,
      code: 'AC',
      training_name: 'AC System',
      gap_all: 65,
      mechanic_tangofa: 56,
      mechanic_genba: 0,
      all_gl: 9,
      fgdp_gldp: 6,
      fill_gap: 5,
      period_year: '2026',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'gap-row-12',
      no: 12,
      code: 'SB',
      training_name: 'Steering & Brake',
      gap_all: 44,
      mechanic_tangofa: 25,
      mechanic_genba: 10,
      all_gl: 9,
      fgdp_gldp: 6,
      fill_gap: 11,
      period_year: '2026',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'gap-row-13',
      no: 13,
      code: 'ATF',
      training_name: 'Auto Lube & Fire Suppression',
      gap_all: 9,
      mechanic_tangofa: 0,
      mechanic_genba: 0,
      all_gl: 9,
      fgdp_gldp: 6,
      fill_gap: 0,
      period_year: '2026',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'gap-row-14',
      no: 14,
      code: 'BFA',
      training_name: 'Basic First Aid',
      gap_all: 0,
      mechanic_tangofa: 0,
      mechanic_genba: 0,
      all_gl: 0,
      fgdp_gldp: 6,
      fill_gap: 0,
      period_year: '2026',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'gap-row-15',
      no: 15,
      code: 'LTO',
      training_name: 'Log out & Tag Out',
      gap_all: 51,
      mechanic_tangofa: 51,
      mechanic_genba: 0,
      all_gl: 0,
      fgdp_gldp: 6,
      fill_gap: 0,
      period_year: '2026',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'gap-row-16',
      no: 16,
      code: 'DFD',
      training_name: 'Differential and F/D',
      gap_all: 48,
      mechanic_tangofa: 40,
      mechanic_genba: 0,
      all_gl: 8,
      fgdp_gldp: 6,
      fill_gap: 12,
      period_year: '2026',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'gap-row-17',
      no: 17,
      code: 'SL',
      training_name: 'Slinging & Lifting',
      gap_all: 35,
      mechanic_tangofa: 26,
      mechanic_genba: 9,
      all_gl: 0,
      fgdp_gldp: 6,
      fill_gap: 0,
      period_year: '2026',
      updated_at: '2026-11-05T08:00:00Z',
    },
  ],
  // 4. Resume Training Class Crew Mechanic PLM 2026 (Slide 4)
  plmMonthlyTrainingClasses: [
    {
      id: 'plm-month-5',
      month_index: 5,
      month_name: 'Mei',
      year: '2026',
      plan: 10,
      actual: 30,
      frequency_plan: 3,
      frequency_actual: 3,
      period_status: 'FINAL',
      notes: 'Melampaui target (+20 kehadiran peserta)',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'plm-month-6',
      month_index: 6,
      month_name: 'Juni',
      year: '2026',
      plan: 42,
      actual: 39,
      frequency_plan: 5,
      frequency_actual: 5,
      period_status: 'FINAL',
      notes: 'Achiev. Peserta bln Juni/26 < 95% (92,86%)',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'plm-month-7',
      month_index: 7,
      month_name: 'Juli',
      year: '2026',
      plan: 36,
      actual: 26,
      frequency_plan: 6,
      frequency_actual: 7,
      period_status: 'FINAL',
      notes: 'Frekuensi in-class 7 sesi (Plan 6 sesi)',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'plm-month-8',
      month_index: 8,
      month_name: 'Agustus',
      year: '2026',
      plan: 44,
      actual: 63,
      frequency_plan: 6,
      frequency_actual: 8,
      period_status: 'FINAL',
      notes: 'Melampaui target (+19 kehadiran peserta)',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'plm-month-9',
      month_index: 9,
      month_name: 'September',
      year: '2026',
      plan: 44,
      actual: 67,
      frequency_plan: 6,
      frequency_actual: 8,
      period_status: 'FINAL',
      notes: 'Melampaui target (+23 kehadiran peserta)',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'plm-month-10',
      month_index: 10,
      month_name: 'Oktober',
      year: '2026',
      plan: 44,
      actual: 23,
      frequency_plan: 6,
      frequency_actual: 7,
      period_status: 'FINAL',
      notes: 'Frekuensi sesi tercapai 117% (7/6), kehadiran peserta 23x',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'plm-month-11',
      month_index: 11,
      month_name: 'November',
      year: '2026',
      plan: 36,
      actual: 3,
      frequency_plan: 6,
      frequency_actual: 1,
      period_status: 'ON_GOING',
      notes: 'Periode berjalan (Week 01 November 2026 — On Going)',
      updated_at: '2026-11-05T08:00:00Z',
    },
  ],
  plmCorrectiveActions: [
    {
      id: 'pca-prob-1',
      section_type: 'PROBLEM',
      no: 1,
      description: 'Cutway untuk Praktek di TC Sangat kurang',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'pca-prob-2',
      section_type: 'PROBLEM',
      no: 2,
      description: "Achiev. Peserta bln Juni'26 < 95%",
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'pca-prob-3',
      section_type: 'PROBLEM',
      no: 3,
      description: 'Pemenuhan Target time Frame OJT Tidak sesuai',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'pca-cause-1',
      section_type: 'CAUSE',
      no: 1,
      description: 'Pengadaan Cutway Praktek Terbatas',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'pca-cause-2',
      section_type: 'CAUSE',
      no: 2,
      description: 'Peserta Training sering Tidak hadir',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'pca-cause-3',
      section_type: 'CAUSE',
      no: 3,
      description: 'Section dan pembagian Job Pengawas di buat Fix',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'pca-act-1',
      section_type: 'CORRECTIVE_ACTION',
      no: 1,
      description:
        'Koordinasi dengan PIC area Metal scrab Pak anwar, Pelaksanaan Praktek Training sementara ke Metal Scrab',
      pic: 'Abdul R',
      due_date: '17 Mei 2026',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'pca-act-2',
      section_type: 'CORRECTIVE_ACTION',
      no: 2,
      description:
        'Informasi saat meeting koordinasi dan weekly ke rekan PLM untuk menjaga konsistensi peserta training dan membuat schedule dengan benar',
      pic: 'Edison + Idris + Abdul R',
      due_date: 'Continue',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'pca-act-3',
      section_type: 'CORRECTIVE_ACTION',
      no: 3,
      description: 'Support Interview Kandidat Pemenuhan MPP PLM',
      pic: 'Edison + Idris + Abdul R',
      due_date: 'Continue',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'pca-act-4',
      section_type: 'CORRECTIVE_ACTION',
      no: 4,
      description: 'Koordinasi dengan Pengawas PLM untuk Menyesuaikan TF OJT',
      pic: 'HRGA',
      due_date: "W4 Sept' 2026",
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'pca-act-5',
      section_type: 'CORRECTIVE_ACTION',
      no: 5,
      description: 'Penambahan Materi safety dan Refresh Materi',
      pic: 'Abdul R',
      due_date: 'Continue',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'pca-fup-1',
      section_type: 'FOLLOW_UP',
      no: 1,
      description: 'Ada 2 komponen 1 Eg dan 1 TM → Continue dgn Praktek',
      pic: 'Abdul R',
      due_date: 'Continue',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'pca-fup-2',
      section_type: 'FOLLOW_UP',
      no: 2,
      description: 'Achievement Training menjadi KPI HOD PLM',
      pic: 'Edison + Idris + Abdul R',
      due_date: 'Continue',
      updated_at: '2026-11-05T08:00:00Z',
    },
  ],
  dailyTrainerActivities: [
    {
      id: 'dta-1',
      no: 1,
      date_label: '29 Oct. 2026',
      attendents: '3x Siswa OJT',
      dept: 'PLM',
      activities:
        'Diskusi dengan HOS PLM tentang 3x mekanik yang pindah ke Metal Scrab & pencapain Assessmnet BMC batch VI',
      remarks: 'Done',
      photos: ['/images/activity-trainer/doc-1a.jpg', '/images/activity-trainer/doc-1b.jpg'],
      week_label: 'WEEK 1 NOVEMBER 2026',
      year: '2026',
      month: '11',
      week_number: 1,
      updated_at: '2026-11-09T08:00:00Z',
    },
    {
      id: 'dta-2',
      no: 2,
      date_label: '31 Oct. 2026',
      attendents: 'Gunawan P & Suwandi',
      dept: 'PLM',
      activities: 'Interview 1x GLM & Tyre Man crew PLM dari TPM',
      remarks: 'Done',
      photos: ['/images/activity-trainer/doc-2a.jpg', '/images/activity-trainer/doc-2b.jpg'],
      week_label: 'WEEK 1 NOVEMBER 2026',
      year: '2026',
      month: '11',
      week_number: 1,
      updated_at: '2026-11-09T08:00:00Z',
    },
    {
      id: 'dta-3',
      no: 3,
      date_label: '31 Oct. 2026',
      attendents: '4x FGDP',
      dept: 'All dept',
      activities: 'Pengenalan serta Support TC dalam Busines proses di RJS kepada 4x FGDP',
      remarks: 'Continue',
      photos: ['/images/activity-trainer/doc-3a.jpg', '/images/activity-trainer/doc-3b.jpg'],
      week_label: 'WEEK 1 NOVEMBER 2026',
      year: '2026',
      month: '11',
      week_number: 1,
      updated_at: '2026-11-09T08:00:00Z',
    },
    {
      id: 'dta-4',
      no: 4,
      date_label: '01-2 Nov. 2026',
      attendents: '8x Siswa BMC batch VI & VII',
      dept: 'PLM',
      activities:
        'Sharing session bagi 4x Siswa BMC Batch VII tentang kendala serta performa serta jobdesk mereka selama OJT di dept. PLM',
      remarks: 'Continue',
      photos: ['/images/activity-trainer/doc-4a.jpg', '/images/activity-trainer/doc-4b.jpg'],
      week_label: 'WEEK 1 NOVEMBER 2026',
      year: '2026',
      month: '11',
      week_number: 1,
      updated_at: '2026-11-09T08:00:00Z',
    },
    {
      id: 'dta-5',
      no: 5,
      date_label: '02-Nov-26',
      attendents: '3x Siswa BMC batch VI',
      dept: 'PLM',
      activities: 'Inclass tentang Clutch & Transmission bagi 3x Siswa BMC',
      remarks: 'Continue',
      photos: ['/images/activity-trainer/doc-5a.jpg', '/images/activity-trainer/doc-5b.jpg'],
      week_label: 'WEEK 1 NOVEMBER 2026',
      year: '2026',
      month: '11',
      week_number: 1,
      updated_at: '2026-11-09T08:00:00Z',
    },
    {
      id: 'dta-6',
      no: 6,
      date_label: '03-04 Nov. 2026',
      attendents: '8x Siswa BMC batch VI & VII',
      dept: 'PLM',
      activities:
        'Sharing session bagi 4x Siswa BMC Batch VII tentang kendala serta performa serta jobdesk mereka selama OJT di dept. PLM',
      remarks: 'Continue',
      photos: ['/images/activity-trainer/doc-6a.jpg', '/images/activity-trainer/doc-6b.jpg'],
      week_label: 'WEEK 1 NOVEMBER 2026',
      year: '2026',
      month: '11',
      week_number: 1,
      updated_at: '2026-11-09T08:00:00Z',
    },
  ],
  monthlyPlanBars: [
    // Existing | Mech/GL
    { id: 'mpb-1', month_label: 'Nov-26', row_key: 'EXISTING_MECH_GL', start_day: 3, end_day: 6, title: 'Clutch& Transmission', bg_color: '#E6DEC8', text_color: '#18232B', updated_at: '2026-11-09T08:00:00Z' },
    { id: 'mpb-2', month_label: 'Nov-26', row_key: 'EXISTING_MECH_GL', start_day: 9, end_day: 12, title: 'Steering & Brake', bg_color: '#BFBFBF', text_color: '#18232B', updated_at: '2026-11-09T08:00:00Z' },
    { id: 'mpb-3', month_label: 'Nov-26', row_key: 'EXISTING_MECH_GL', start_day: 15, end_day: 16, title: 'Tools', bg_color: '#312B4B', text_color: '#FFFFFF', updated_at: '2026-11-09T08:00:00Z' },
    { id: 'mpb-4', month_label: 'Nov-26', row_key: 'EXISTING_MECH_GL', start_day: 19, end_day: 20, title: 'Material', bg_color: '#C4BD97', text_color: '#18232B', updated_at: '2026-11-09T08:00:00Z' },
    { id: 'mpb-5', month_label: 'Nov-26', row_key: 'EXISTING_MECH_GL', start_day: 23, end_day: 24, title: 'MMC', bg_color: '#C6D9F1', text_color: '#18232B', updated_at: '2026-11-09T08:00:00Z' },
    { id: 'mpb-6', month_label: 'Nov-26', row_key: 'EXISTING_MECH_GL', start_day: 27, end_day: 29, title: 'F/D & Undercarriage', bg_color: '#95B3D7', text_color: '#18232B', updated_at: '2026-11-09T08:00:00Z' },
    // Fresh | Ojt/FGDP
    { id: 'mpb-7', month_label: 'Nov-26', row_key: 'FRESH_OJT_FGDP', start_day: 2, end_day: 2, title: 'Obs.OJT', bg_color: '#E46C0A', text_color: '#FFFFFF', updated_at: '2026-11-09T08:00:00Z' },
    { id: 'mpb-8', month_label: 'Nov-26', row_key: 'FRESH_OJT_FGDP', start_day: 6, end_day: 6, title: 'Obs.OJT', bg_color: '#E46C0A', text_color: '#FFFFFF', updated_at: '2026-11-09T08:00:00Z' },
    { id: 'mpb-9', month_label: 'Nov-26', row_key: 'FRESH_OJT_FGDP', start_day: 10, end_day: 10, title: 'Obs.OJT', bg_color: '#E46C0A', text_color: '#FFFFFF', updated_at: '2026-11-09T08:00:00Z' },
    { id: 'mpb-10', month_label: 'Nov-26', row_key: 'FRESH_OJT_FGDP', start_day: 14, end_day: 14, title: 'Obs.OJT', bg_color: '#E46C0A', text_color: '#FFFFFF', updated_at: '2026-11-09T08:00:00Z' },
    { id: 'mpb-11', month_label: 'Nov-26', row_key: 'FRESH_OJT_FGDP', start_day: 18, end_day: 18, title: 'Obs.OJT', bg_color: '#E46C0A', text_color: '#FFFFFF', updated_at: '2026-11-09T08:00:00Z' },
    { id: 'mpb-12', month_label: 'Nov-26', row_key: 'FRESH_OJT_FGDP', start_day: 22, end_day: 22, title: 'Obs.OJT', bg_color: '#E46C0A', text_color: '#FFFFFF', updated_at: '2026-11-09T08:00:00Z' },
    { id: 'mpb-13', month_label: 'Nov-26', row_key: 'FRESH_OJT_FGDP', start_day: 25, end_day: 25, title: 'Obs.OJT', bg_color: '#E46C0A', text_color: '#FFFFFF', updated_at: '2026-11-09T08:00:00Z' },
    { id: 'mpb-14', month_label: 'Nov-26', row_key: 'FRESH_OJT_FGDP', start_day: 29, end_day: 29, title: 'Obs.OJT', bg_color: '#E46C0A', text_color: '#FFFFFF', updated_at: '2026-11-09T08:00:00Z' },
    // Andi Rizal -> Site Genba
    { id: 'mpb-15', month_label: 'Nov-26', row_key: 'ANDI_RIZAL', start_day: 3, end_day: 7, title: 'Site Genba', bg_color: '#FFFF00', text_color: '#18232B', updated_at: '2026-11-09T08:00:00Z' },
  ],
  sharingSessionScheduleRows: [
    { id: 'sss-1', no: 1, tanggal: '29 OKT 2026', hari: 'KAMIS', waktu: '08.00-17.00', nama: 'Riyan Ardianto', jabatan: 'OJT Mekanik DT', instruktur: 'Bpk. Andi Risal', year: '2026', month: '11', month_label: 'November 2026', week_number: 1, week_label: 'Minggu 1 - November 2026', batch_label: 'BMC BATCH VII', status: 'Done', updated_at: '2026-11-09T08:00:00Z' },
    { id: 'sss-2', no: 2, tanggal: '29 OKT 2026', hari: 'KAMIS', waktu: '08.00-17.00', nama: 'Indra Putra Ardiansyah', jabatan: 'OJT Mekanik DT', instruktur: 'Bpk. Andi Risal', year: '2026', month: '11', month_label: 'November 2026', week_number: 1, week_label: 'Minggu 1 - November 2026', batch_label: 'BMC BATCH VII', status: 'Done', updated_at: '2026-11-09T08:00:00Z' },
    { id: 'sss-3', no: 3, tanggal: '29 OKT 2026', hari: 'KAMIS', waktu: '08.00-17.00', nama: 'Muhammad Farrel Damario', jabatan: 'OJT Mekanik DT', instruktur: 'Bpk. Andi Risal', year: '2026', month: '11', month_label: 'November 2026', week_number: 1, week_label: 'Minggu 1 - November 2026', batch_label: 'BMC BATCH VII', status: 'Done', updated_at: '2026-11-09T08:00:00Z' },
    { id: 'sss-4', no: 4, tanggal: '29 OKT 2026', hari: 'KAMIS', waktu: '08.00-17.00', nama: 'Mulia Adi Hariono', jabatan: 'OJT Mekanik DT', instruktur: 'Bpk. Andi Risal', year: '2026', month: '11', month_label: 'November 2026', week_number: 1, week_label: 'Minggu 1 - November 2026', batch_label: 'BMC BATCH VII', status: 'Done', updated_at: '2026-11-09T08:00:00Z' },
    { id: 'sss-5', no: 5, tanggal: '29 OKT 2026', hari: 'KAMIS', waktu: '08.00-17.00', nama: 'Sandya Aryananda', jabatan: 'OJT Elektrik', instruktur: 'Bpk. Andi Risal', year: '2026', month: '11', month_label: 'November 2026', week_number: 1, week_label: 'Minggu 1 - November 2026', batch_label: 'BMC BATCH VII', status: 'Done', updated_at: '2026-11-09T08:00:00Z' },
    { id: 'sss-6', no: 6, tanggal: '30 OKT 2026', hari: 'JUMAT', waktu: '08.00-17.00', nama: 'Muhammad Anwar Syaifudin', jabatan: 'OJT Mekanik DT', instruktur: 'Bpk. Andi Risal', year: '2026', month: '11', month_label: 'November 2026', week_number: 1, week_label: 'Minggu 1 - November 2026', batch_label: 'BMC BATCH VII', status: 'Done', updated_at: '2026-11-09T08:00:00Z' },
    { id: 'sss-7', no: 7, tanggal: '30 OKT 2026', hari: 'JUMAT', waktu: '08.00-17.00', nama: 'Andi Pangestu', jabatan: 'OJT Mekanik DT', instruktur: 'Bpk. Andi Risal', year: '2026', month: '11', month_label: 'November 2026', week_number: 1, week_label: 'Minggu 1 - November 2026', batch_label: 'BMC BATCH VII', status: 'Done', updated_at: '2026-11-09T08:00:00Z' },
    { id: 'sss-8', no: 8, tanggal: '30 OKT 2026', hari: 'JUMAT', waktu: '08.00-17.00', nama: 'Muhammad Hamed Ramadhani', jabatan: 'OJT Mekanik DT', instruktur: 'Bpk. Andi Risal', year: '2026', month: '11', month_label: 'November 2026', week_number: 1, week_label: 'Minggu 1 - November 2026', batch_label: 'BMC BATCH VII', status: 'Done', updated_at: '2026-11-09T08:00:00Z' },
    { id: 'sss-9', no: 9, tanggal: '30 OKT 2026', hari: 'JUMAT', waktu: '08.00-17.00', nama: 'Erwin Fihadi Pradana', jabatan: 'OJT Tyreman', instruktur: 'Bpk. Andi Risal', year: '2026', month: '11', month_label: 'November 2026', week_number: 1, week_label: 'Minggu 1 - November 2026', batch_label: 'BMC BATCH VII', status: 'Done', updated_at: '2026-11-09T08:00:00Z' },
    { id: 'sss-10', no: 10, tanggal: '31 OKT 2026', hari: 'SABTU', waktu: '08.00-17.00', nama: 'Syahval Finanda Fitradhani', jabatan: 'OJT Mekanik DT', instruktur: 'Bpk. Andi Risal', year: '2026', month: '11', month_label: 'November 2026', week_number: 1, week_label: 'Minggu 1 - November 2026', batch_label: 'BMC BATCH VII', status: 'Done', updated_at: '2026-11-09T08:00:00Z' },
    { id: 'sss-11', no: 11, tanggal: '31 OKT 2026', hari: 'SABTU', waktu: '08.00-17.00', nama: 'Dito Apriliana Afarisqi', jabatan: 'OJT Mekanik DT', instruktur: 'Bpk. Andi Risal', year: '2026', month: '11', month_label: 'November 2026', week_number: 1, week_label: 'Minggu 1 - November 2026', batch_label: 'BMC BATCH VII', status: 'Done', updated_at: '2026-11-09T08:00:00Z' },
    { id: 'sss-12', no: 12, tanggal: '31 OKT 2026', hari: 'SABTU', waktu: '08.00-17.00', nama: 'Alip Alfitrah', jabatan: 'OJT Mekanik DT', instruktur: 'Bpk. Andi Risal', year: '2026', month: '11', month_label: 'November 2026', week_number: 1, week_label: 'Minggu 1 - November 2026', batch_label: 'BMC BATCH VII', status: 'Done', updated_at: '2026-11-09T08:00:00Z' },
    { id: 'sss-13', no: 13, tanggal: '31 OKT 2026', hari: 'SABTU', waktu: '08.00-17.00', nama: 'Faisal Yuli Prasetyo', jabatan: 'OJT Mekanik DT', instruktur: 'Bpk. Andi Risal', year: '2026', month: '11', month_label: 'November 2026', week_number: 1, week_label: 'Minggu 1 - November 2026', batch_label: 'BMC BATCH VII', status: 'Done', updated_at: '2026-11-09T08:00:00Z' },
    { id: 'sss-14', no: 14, tanggal: '01 NOV 2026', hari: 'MINGGU', waktu: '08.00-17.00', nama: 'Alfan Fauzi Ananta', jabatan: 'OJT Mekanik DT', instruktur: 'Bpk. Andi Risal', year: '2026', month: '11', month_label: 'November 2026', week_number: 1, week_label: 'Minggu 1 - November 2026', batch_label: 'BMC BATCH VII', status: 'Done', updated_at: '2026-11-09T08:00:00Z' },
    { id: 'sss-15', no: 15, tanggal: '01 NOV 2026', hari: 'MINGGU', waktu: '08.00-17.00', nama: 'Yusuf Waloyo', jabatan: 'OJT Mekanik DT', instruktur: 'Bpk. Andi Risal', year: '2026', month: '11', month_label: 'November 2026', week_number: 1, week_label: 'Minggu 1 - November 2026', batch_label: 'BMC BATCH VII', status: 'Done', updated_at: '2026-11-09T08:00:00Z' },
    { id: 'sss-16', no: 16, tanggal: '01 NOV 2026', hari: 'MINGGU', waktu: '08.00-17.00', nama: 'Fahad Santoso', jabatan: 'OJT Mekanik DT', instruktur: 'Bpk. Andi Risal', year: '2026', month: '11', month_label: 'November 2026', week_number: 1, week_label: 'Minggu 1 - November 2026', batch_label: 'BMC BATCH VII', status: 'Done', updated_at: '2026-11-09T08:00:00Z' },
    { id: 'sss-17', no: 17, tanggal: '01 NOV 2026', hari: 'MINGGU', waktu: '08.00-17.00', nama: 'Muhammad Rizky Ramadhan', jabatan: 'OJT Mekanik DT', instruktur: 'Bpk. Andi Risal', year: '2026', month: '11', month_label: 'November 2026', week_number: 1, week_label: 'Minggu 1 - November 2026', batch_label: 'BMC BATCH VII', status: 'Done', updated_at: '2026-11-09T08:00:00Z' },
  ],
  skillAuditOperatorRecords: JSON.parse(JSON.stringify(INITIAL_SKILL_AUDIT_OPERATOR_RECORDS)),
  skillAuditSummaryRows: JSON.parse(JSON.stringify(INITIAL_SKILL_AUDIT_SUMMARY_ROWS)),
  skillAuditPhotos: JSON.parse(JSON.stringify(INITIAL_SKILL_AUDIT_PHOTOS)),
  updated_at: '2026-11-09T08:00:00Z',
  updated_by: 'Super Admin',
};

class DataStore {
  roles: Role[] = [...INITIAL_ROLES];
  departments: Department[] = [...INITIAL_DEPARTMENTS];
  users: UserProfile[] = [...INITIAL_USERS];
  departmentAssignments: DepartmentUserAssignment[] = [...INITIAL_DEPARTMENT_ASSIGNMENTS];
  employees: Employee[] = [...INITIAL_EMPLOYEES];
  programs: TrainingProgram[] = [...INITIAL_PROGRAMS];
  trainingCategories: TrainingCategoryOption[] = [...INITIAL_TRAINING_CATEGORIES];
  trainingTypes: TrainingTypeOption[] = [...INITIAL_TRAINING_TYPES];
  sites: SiteOption[] = [...INITIAL_SITES];
  trainerActivities: TrainerActivitySection[] = [...INITIAL_TRAINER_ACTIVITIES];
  technicalTrainingModule: TechnicalTrainingModuleState = JSON.parse(
    JSON.stringify(INITIAL_TECHNICAL_TRAINING_MODULE_DATA)
  );
  rolePermissions: Record<RoleCode, RolePermissionMatrix> = JSON.parse(
    JSON.stringify(DEFAULT_ROLE_PERMISSIONS)
  );
  applications: TrainingApplication[] = [];
  participants: TrainingApplicationParticipant[] = [];
  approvalHistory: TrainingApprovalHistory[] = [];
  schedules: TrainingSchedule[] = [];
  records: TrainingRecord[] = [];
  evaluations: TrainingEvaluation[] = [];
  certifications: Certification[] = [];
  kpiDefinitions: KpiDefinition[] = [...INITIAL_KPIS];
  kpiTargets: KpiTarget[] = [...INITIAL_KPI_TARGETS];
  kpiWeights: KpiWeight[] = [...INITIAL_KPI_WEIGHTS];
  kpiResults: KpiResult[] = [];
  notifications: Notification[] = [];
  auditLogs: AuditLog[] = [];

  systemSettings: SystemSettingsConfig = {
    companyName: 'PT. Roda Jaya Sakti (RAJA)',
    portalName: 'RAJA ACADEMY',
    operationalSite: 'Site Morowali (Sulawesi Tengah)',
    headOffice: 'Head Office Makassar (Sulawesi Selatan)',
    annualTrainingHoursTargetPerEmployee: 24,
    minimumPassScore: 70,
    mandatoryAchievementTargetPercent: 90,
    strictRlsEnabled: true,
    autoIssueCertificateOnPass: true,
    updatedAt: '2026-11-01T08:00:00Z',
    updatedBy: 'Super Administrator',
  };

  cloudStatus: 'ONLINE_SYNCED' | 'SYNCING' | 'LOCAL_CACHE' = 'SYNCING';
  lastCloudSyncAt: string | null = null;
  supabaseProjectRef: string = SUPABASE_PROJECT_REF;
  private onChangeListeners: Array<() => void> = [];

  constructor() {
    this.seedInitialDataset();
    this.loadFromLocalStorage();
    this.recalculateKpis(2026);
  }

  subscribe(listener: () => void) {
    this.onChangeListeners.push(listener);
    return () => {
      this.onChangeListeners = this.onChangeListeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    for (const listener of this.onChangeListeners) {
      try {
        listener();
      } catch {
        // Ignore listener errors
      }
    }
  }

  serializeState() {
    return {
      roles: this.roles,
      departments: this.departments,
      users: this.users,
      departmentAssignments: this.departmentAssignments,
      employees: this.employees,
      programs: this.programs,
      trainingCategories: this.trainingCategories,
      trainingTypes: this.trainingTypes,
      sites: this.sites,
      trainerActivities: this.trainerActivities,
      technicalTrainingModule: this.technicalTrainingModule,
      rolePermissions: this.rolePermissions,
      applications: this.applications,
      participants: this.participants,
      approvalHistory: this.approvalHistory,
      schedules: this.schedules,
      records: this.records,
      evaluations: this.evaluations,
      certifications: this.certifications,
      kpiDefinitions: this.kpiDefinitions,
      kpiTargets: this.kpiTargets,
      kpiWeights: this.kpiWeights,
      systemSettings: this.systemSettings,
      notifications: this.notifications,
      auditLogs: this.auditLogs,
    };
  }

  hydrateState(snapshot: any) {
    if (!snapshot || typeof snapshot !== 'object') return false;
    // Only hydrate if snapshot has valid 6-role and 7-division schema
    const hasSevenDivisions =
      Array.isArray(snapshot.departments) &&
      snapshot.departments.length === 7 &&
      snapshot.departments.some((d: any) => d.code === 'HRGA-IT') &&
      snapshot.departments.some((d: any) => d.code === 'PLM') &&
      snapshot.departments.some((d: any) => d.code === 'CIVIL');

    if (!hasSevenDivisions) {
      return false;
    }

    if (Array.isArray(snapshot.roles) && snapshot.roles.length === 6) {
      this.roles = snapshot.roles;
    }
    if (Array.isArray(snapshot.departments) && snapshot.departments.length === 7) {
      this.departments = snapshot.departments;
    }
    if (Array.isArray(snapshot.users) && snapshot.users.length > 0) {
      const defaultRoleIdSet = new Set(INITIAL_USERS.map((u) => u.id));
      this.users = snapshot.users.map((u: UserProfile) => {
        if (defaultRoleIdSet.has(u.id)) {
          const cleanDefault = INITIAL_USERS.find((iu) => iu.id === u.id)!;
          return {
            ...u,
            full_name: cleanDefault.full_name,
            role_name: cleanDefault.role_name,
            department_id: null,
            department_name: undefined,
          };
        }
        return u;
      });
    }
    if (Array.isArray(snapshot.departmentAssignments)) {
      this.departmentAssignments = snapshot.departmentAssignments.filter(
        (a: DepartmentUserAssignment) => a.user_id !== '00000000-0000-0000-0000-000000000002'
      );
    }
    if (Array.isArray(snapshot.employees)) {
      this.employees = snapshot.employees;
    }
    if (Array.isArray(snapshot.programs)) {
      this.programs = snapshot.programs;
    }
    if (Array.isArray(snapshot.trainingCategories) && snapshot.trainingCategories.length > 0) {
      this.trainingCategories = snapshot.trainingCategories;
    }
    if (Array.isArray(snapshot.trainingTypes) && snapshot.trainingTypes.length > 0) {
      this.trainingTypes = snapshot.trainingTypes;
    }
    if (Array.isArray(snapshot.sites) && snapshot.sites.length > 0) {
      this.sites = snapshot.sites;
    }
    if (Array.isArray(snapshot.trainerActivities) && snapshot.trainerActivities.length > 0) {
      this.trainerActivities = snapshot.trainerActivities.map(
        (sec: TrainerActivitySection, idx: number) => ({
          ...sec,
          title:
            sec.title === '1. Activitas Technical Trainer'
              ? '1. Program Technical Training'
              : sec.title,
          year: sec.year || '2026',
          month: sec.month || '11',
          week_number: sec.week_number || idx + 1,
          period_label:
            sec.period_label || `Minggu Ke-${sec.week_number || idx + 1} • November 2026`,
        })
      );
    }
    if (
      snapshot.technicalTrainingModule &&
      typeof snapshot.technicalTrainingModule === 'object'
    ) {
      this.technicalTrainingModule = {
        ...JSON.parse(JSON.stringify(INITIAL_TECHNICAL_TRAINING_MODULE_DATA)),
        ...snapshot.technicalTrainingModule,
      };
      // Bersihkan data kandidat contoh (cma-1 s/d cma-7) yang sempat tersimpan — bukan data produksi
      const sampleIds = new Set(['cma-1', 'cma-2', 'cma-3', 'cma-4', 'cma-5', 'cma-6', 'cma-7']);
      this.technicalTrainingModule.candidateAssessments = (
        this.technicalTrainingModule.candidateAssessments || []
      ).filter((c) => !sampleIds.has(c.id));
      if (
        !Array.isArray(this.technicalTrainingModule.dailyTrainerActivities) ||
        this.technicalTrainingModule.dailyTrainerActivities.length === 0
      ) {
        this.technicalTrainingModule.dailyTrainerActivities = JSON.parse(
          JSON.stringify(INITIAL_TECHNICAL_TRAINING_MODULE_DATA.dailyTrainerActivities)
        );
      } else {
        // Pulihkan foto default jika ada baris awal (dta-1 s/d dta-6) yang fotonya terhapus
        const defaultPhotoMap = new Map(
          INITIAL_TECHNICAL_TRAINING_MODULE_DATA.dailyTrainerActivities.map((d) => [d.id, d.photos])
        );
        this.technicalTrainingModule.dailyTrainerActivities =
          this.technicalTrainingModule.dailyTrainerActivities.map((item) => {
            const defPhotos = defaultPhotoMap.get(item.id);
            if (defPhotos && (!Array.isArray(item.photos) || item.photos.length === 0)) {
              return { ...item, photos: [...defPhotos] };
            }
            return item;
          });
      }
      if (
        !Array.isArray(this.technicalTrainingModule.monthlyPlanBars) ||
        this.technicalTrainingModule.monthlyPlanBars.length === 0
      ) {
        this.technicalTrainingModule.monthlyPlanBars = JSON.parse(
          JSON.stringify(INITIAL_TECHNICAL_TRAINING_MODULE_DATA.monthlyPlanBars)
        );
      }
      if (
        !Array.isArray(this.technicalTrainingModule.sharingSessionScheduleRows) ||
        this.technicalTrainingModule.sharingSessionScheduleRows.length === 0
      ) {
        this.technicalTrainingModule.sharingSessionScheduleRows = JSON.parse(
          JSON.stringify(INITIAL_TECHNICAL_TRAINING_MODULE_DATA.sharingSessionScheduleRows)
        );
      } else {
        this.technicalTrainingModule.sharingSessionScheduleRows =
          this.technicalTrainingModule.sharingSessionScheduleRows.map((row) => ({
            ...row,
            year: row.year || '2026',
            month: row.month || '11',
            month_label: row.month_label || 'November 2026',
            week_number: row.week_number || 1,
            week_label: row.week_label || 'Minggu 1 - November 2026',
            batch_label: row.batch_label || 'BMC BATCH VII',
            status: row.status || 'Done',
          }));
        this.repairSharingSessionScheduleIfNeeded();
      }
      if (
        !Array.isArray(this.technicalTrainingModule.skillAuditOperatorRecords) ||
        this.technicalTrainingModule.skillAuditOperatorRecords.length === 0
      ) {
        this.technicalTrainingModule.skillAuditOperatorRecords = JSON.parse(
          JSON.stringify(INITIAL_SKILL_AUDIT_OPERATOR_RECORDS)
        );
      }
      if (
        !Array.isArray(this.technicalTrainingModule.skillAuditSummaryRows) ||
        this.technicalTrainingModule.skillAuditSummaryRows.length === 0
      ) {
        this.technicalTrainingModule.skillAuditSummaryRows = JSON.parse(
          JSON.stringify(INITIAL_SKILL_AUDIT_SUMMARY_ROWS)
        );
      }
      if (
        !this.technicalTrainingModule.skillAuditPhotos ||
        typeof this.technicalTrainingModule.skillAuditPhotos !== 'object'
      ) {
        this.technicalTrainingModule.skillAuditPhotos = JSON.parse(
          JSON.stringify(INITIAL_SKILL_AUDIT_PHOTOS)
        );
      } else {
        // Pastikan foto default tetap ada jika kategori belum punya foto atau foto default DRIVER_DT terhapus
        Object.keys(INITIAL_SKILL_AUDIT_PHOTOS).forEach((k) => {
          const currentArr = Array.isArray(this.technicalTrainingModule.skillAuditPhotos[k])
            ? this.technicalTrainingModule.skillAuditPhotos[k]
            : [];
          const defaultArr = INITIAL_SKILL_AUDIT_PHOTOS[k] || [];
          const missingDefaults = defaultArr.filter((defUrl) => !currentArr.includes(defUrl));
          if (currentArr.length === 0 || (k === 'DRIVER_DT' && missingDefaults.length > 0)) {
            this.technicalTrainingModule.skillAuditPhotos[k] = [
              ...defaultArr,
              ...currentArr.filter((u) => !defaultArr.includes(u)),
            ];
          }
        });
      }
    }
    if (snapshot.rolePermissions && typeof snapshot.rolePermissions === 'object') {
      syncRolePermissionsRegistry(snapshot.rolePermissions);
      this.rolePermissions = JSON.parse(JSON.stringify(ROLE_PERMISSIONS));
    }
    if (Array.isArray(snapshot.applications)) {
      this.applications = snapshot.applications;
    }
    if (Array.isArray(snapshot.participants)) {
      this.participants = snapshot.participants;
    }
    if (Array.isArray(snapshot.approvalHistory)) {
      this.approvalHistory = snapshot.approvalHistory;
    }
    if (Array.isArray(snapshot.schedules)) {
      this.schedules = snapshot.schedules;
    }
    if (Array.isArray(snapshot.records)) {
      this.records = snapshot.records;
    }
    if (Array.isArray(snapshot.certifications)) {
      this.certifications = snapshot.certifications;
    }
    if (Array.isArray(snapshot.kpiTargets)) {
      this.kpiTargets = snapshot.kpiTargets;
    }
    if (Array.isArray(snapshot.kpiWeights)) {
      this.kpiWeights = snapshot.kpiWeights;
    }
    if (snapshot.systemSettings && typeof snapshot.systemSettings === 'object') {
      this.systemSettings = { ...this.systemSettings, ...snapshot.systemSettings };
    }
    if (Array.isArray(snapshot.notifications)) {
      this.notifications = snapshot.notifications;
    }
    if (Array.isArray(snapshot.auditLogs)) {
      this.auditLogs = snapshot.auditLogs;
    }
    this.recalculateKpis(2026);
    return true;
  }

  private loadFromLocalStorage() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.hydrateState(parsed);
      }
    } catch {
      // Ignore corrupt localStorage
    }
  }

  persistState() {
    const snapshot = this.serializeState();
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(snapshot));
      } catch {
        // Ignore quota errors
      }
    }

    this.cloudStatus = 'SYNCING';
    this.notifyListeners();

    saveCloudDatabaseState(snapshot)
      .then((res) => {
        if (res.ok) {
          this.cloudStatus = 'ONLINE_SYNCED';
          this.lastCloudSyncAt = res.syncedAt || new Date().toISOString();
        } else {
          this.cloudStatus = 'LOCAL_CACHE';
        }
        this.notifyListeners();
      })
      .catch(() => {
        this.cloudStatus = 'LOCAL_CACHE';
        this.notifyListeners();
      });
  }

  async initCloudSync() {
    this.cloudStatus = 'SYNCING';
    this.notifyListeners();

    const res = await fetchCloudDatabaseState();
    const isCurrentSevenDivSchema =
      res.ok &&
      res.data &&
      Array.isArray(res.data.departments) &&
      res.data.departments.length === 7 &&
      res.data.departments.some((d: any) => d.code === 'HRGA-IT') &&
      res.data.departments.some((d: any) => d.code === 'PLM') &&
      res.data.departments.some((d: any) => d.code === 'CIVIL') &&
      Array.isArray(res.data.applications);

    if (isCurrentSevenDivSchema) {
      const hadLegacyNames =
        Array.isArray(res.data.users) &&
        res.data.users.some(
          (u: any) =>
            typeof u.full_name === 'string' &&
            (u.full_name.includes('Ahmad Fauzi') ||
              u.full_name.includes('Bambang Sutrisno') ||
              u.full_name.includes('Hendra Kusuma') ||
              u.full_name.includes('Siti Rahma') ||
              u.full_name.includes('Farid Nafis'))
        );

      this.hydrateState(res.data);
      const serialized = this.serializeState();
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serialized));
        } catch {
          // Ignore
        }
      }
      if (hadLegacyNames) {
        await saveCloudDatabaseState(serialized);
      }
      this.cloudStatus = 'ONLINE_SYNCED';
      this.lastCloudSyncAt = res.updatedAt || new Date().toISOString();
      this.notifyListeners();
      return;
    }

    // If Supabase Cloud is empty or uses older department schema, sync 7-division dataset to Supabase Online
    const seedRes = await saveCloudDatabaseState(this.serializeState());
    if (seedRes.ok) {
      this.cloudStatus = 'ONLINE_SYNCED';
      this.lastCloudSyncAt = seedRes.syncedAt || new Date().toISOString();
    } else {
      this.cloudStatus = 'LOCAL_CACHE';
    }
    this.notifyListeners();
  }

  private seedInitialDataset() {
    // Seed comprehensive real training data across departments, months, and statuses
    const seedTrainings: Array<{
      id: string;
      appNo: string;
      deptId: string;
      deptName: string;
      submittedBy: string;
      submitterName: string;
      title: string;
      category: string;
      type: TrainingType;
      provider: string;
      location: string;
      startDate: string;
      endDate: string;
      budget: number;
      status: ApplicationStatus;
      plannedHours: number;
      actualHours: number;
      empIds: string[];
      plannedPartCount: number;
      actualPartCount: number;
    }> = [
      {
        id: '90000000-0000-0000-0000-000000000001',
        appNo: 'TR-2026-MOD-001',
        deptId: '20000000-0000-0000-0000-000000000001',
        deptName: 'Mining Operations Department',
        submittedBy: '00000000-0000-0000-0000-000000000002',
        submitterName: 'Admin',
        title: 'Pengawas Operasional Pertama (POP) Pertambangan Minerba',
        category: 'Certification',
        type: 'CERTIFICATION',
        provider: 'BNSP / LSP PERHAPI',
        location: 'Training Center PT. RAJA — Site Morowali',
        startDate: '2026-02-05',
        endDate: '2026-02-09',
        budget: 22500000,
        status: 'COMPLETED',
        plannedHours: 40,
        actualHours: 40,
        empIds: [
          '40000000-0000-0000-0000-000000000003',
          '40000000-0000-0000-0000-000000000001',
          '40000000-0000-0000-0000-000000000002',
        ],
        plannedPartCount: 12,
        actualPartCount: 12,
      },
      {
        id: '90000000-0000-0000-0000-000000000002',
        appNo: 'TR-2026-MOD-002',
        deptId: '20000000-0000-0000-0000-000000000001',
        deptName: 'Mining Operations Department',
        submittedBy: '00000000-0000-0000-0000-000000000002',
        submitterName: 'Admin',
        title: 'Applied Failure Analysis (AFA) & Heavy Fleet Supervision',
        category: 'Technical',
        type: 'INTERNAL',
        provider: 'PT. Roda Jaya Sakti Training Center',
        location: 'Workshop Heavy Equipment — Site Morowali',
        startDate: '2026-01-18',
        endDate: '2026-01-20',
        budget: 12000000,
        status: 'COMPLETED',
        plannedHours: 24,
        actualHours: 24,
        empIds: [
          '40000000-0000-0000-0000-000000000003',
          '40000000-0000-0000-0000-000000000001',
        ],
        plannedPartCount: 15,
        actualPartCount: 15,
      },
      {
        id: '90000000-0000-0000-0000-000000000003',
        appNo: 'TR-2026-MED-001',
        deptId: '20000000-0000-0000-0000-000000000002',
        deptName: 'Mining Engineering Department',
        submittedBy: '00000000-0000-0000-0000-000000000004',
        submitterName: 'Manager TC',
        title: 'Slope Stability & Geotechnical Radar Monitoring',
        category: 'Technical',
        type: 'EXTERNAL',
        provider: 'LSP PERHAPI / Geotechnical Institute',
        location: 'Training Room HO Makassar — Platinum',
        startDate: '2026-03-10',
        endDate: '2026-03-12',
        budget: 18000000,
        status: 'COMPLETED',
        plannedHours: 24,
        actualHours: 24,
        empIds: [
          '40000000-0000-0000-0000-000000000004',
          '40000000-0000-0000-0000-000000000005',
        ],
        plannedPartCount: 10,
        actualPartCount: 10,
      },
      {
        id: '90000000-0000-0000-0000-000000000004',
        appNo: 'TR-2026-HSE-001',
        deptId: '20000000-0000-0000-0000-000000000005',
        deptName: 'Health Safety & Environment',
        submittedBy: '00000000-0000-0000-0000-000000000005',
        submitterName: 'Admin TC',
        title: 'Defensive Driving Training (DDT) & Heavy Hauler Safety 6x4',
        category: 'Safety',
        type: 'IN_HOUSE',
        provider: 'HSE & Training Center PT. RAJA',
        location: 'Hauling Road Sector B — Site Morowali',
        startDate: '2026-04-14',
        endDate: '2026-04-15',
        budget: 14500000,
        status: 'COMPLETED',
        plannedHours: 16,
        actualHours: 16,
        empIds: [
          '40000000-0000-0000-0000-000000000002',
          '40000000-0000-0000-0000-000000000007',
        ],
        plannedPartCount: 24,
        actualPartCount: 24,
      },
      {
        id: '90000000-0000-0000-0000-000000000005',
        appNo: 'TR-2026-MOD-003',
        deptId: '20000000-0000-0000-0000-000000000001',
        deptName: 'Mining Operations Department',
        submittedBy: '00000000-0000-0000-0000-000000000002',
        submitterName: 'Admin',
        title: 'Product Knowledge, Maintenance & Pengoperasian Excavator Komatsu PC400',
        category: 'Technical',
        type: 'INTERNAL',
        provider: 'PT. Roda Jaya Sakti Training Center',
        location: 'Pit Simulation & Workshop APS Morowali',
        startDate: '2026-05-19',
        endDate: '2026-05-21',
        budget: 16000000,
        status: 'COMPLETED',
        plannedHours: 24,
        actualHours: 24,
        empIds: [
          '40000000-0000-0000-0000-000000000001',
          '40000000-0000-0000-0000-000000000003',
        ],
        plannedPartCount: 18,
        actualPartCount: 18,
      },
      {
        id: '90000000-0000-0000-0000-000000000006',
        appNo: 'TR-2026-HRGA-001',
        deptId: '20000000-0000-0000-0000-000000000003',
        deptName: 'HRGA-IT (Human Resources, General Affairs & IT)',
        submittedBy: '00000000-0000-0000-0000-000000000006',
        submitterName: 'Admin HRGA',
        title: 'Supervisory Leadership, Industrial Relations & Enterprise IT Security',
        category: 'Leadership',
        type: 'IN_HOUSE',
        provider: 'HRGA-IT & Corporate Academy PT. RAJA',
        location: 'Training Room HO Makassar — Platinum',
        startDate: '2026-06-11',
        endDate: '2026-06-12',
        budget: 9500000,
        status: 'COMPLETED',
        plannedHours: 16,
        actualHours: 16,
        empIds: ['40000000-0000-0000-0000-000000000006'],
        plannedPartCount: 14,
        actualPartCount: 14,
      },
      {
        id: '90000000-0000-0000-0000-000000000007',
        appNo: 'TR-2026-TC-001',
        deptId: '20000000-0000-0000-0000-000000000004',
        deptName: 'Training Center',
        submittedBy: '00000000-0000-0000-0000-000000000004',
        submitterName: 'Manager TC',
        title: 'Training of Trainer (TOT) BNSP Level 4 Metodologi Pelatihan',
        category: 'Certification',
        type: 'CERTIFICATION',
        provider: 'BNSP / LSP Instruktur Kompeten',
        location: 'Training Center PT. RAJA — Site Morowali',
        startDate: '2026-07-20',
        endDate: '2026-07-23',
        budget: 21000000,
        status: 'COMPLETED',
        plannedHours: 32,
        actualHours: 32,
        empIds: ['40000000-0000-0000-0000-000000000008'],
        plannedPartCount: 8,
        actualPartCount: 8,
      },
      {
        id: '90000000-0000-0000-0000-000000000008',
        appNo: 'TR-2026-HSE-002',
        deptId: '20000000-0000-0000-0000-000000000005',
        deptName: 'Health Safety & Environment',
        submittedBy: '00000000-0000-0000-0000-000000000005',
        submitterName: 'Admin TC',
        title: 'Sistem Manajemen Keselamatan Pertambangan (SMKP) Kepmen 1827 K/2018',
        category: 'Compliance',
        type: 'CERTIFICATION',
        provider: 'Dirjen Minerba / HSE PT. RAJA',
        location: 'Main Hall Morowali Operations',
        startDate: '2026-08-15',
        endDate: '2026-08-17',
        budget: 19500000,
        status: 'COMPLETED',
        plannedHours: 24,
        actualHours: 24,
        empIds: [
          '40000000-0000-0000-0000-000000000007',
          '40000000-0000-0000-0000-000000000003',
        ],
        plannedPartCount: 20,
        actualPartCount: 19,
      },
      {
        id: '90000000-0000-0000-0000-000000000009',
        appNo: 'TR-2026-MED-002',
        deptId: '20000000-0000-0000-0000-000000000002',
        deptName: 'Mining Engineering Department',
        submittedBy: '00000000-0000-0000-0000-000000000004',
        submitterName: 'Manager TC',
        title: 'Short-Term Nickel Pit Fleet Dispatch & Mine Planning Optimization',
        category: 'Technical',
        type: 'INTERNAL',
        provider: 'PT. Roda Jaya Sakti Engineering Academy',
        location: 'Engineering Office Site Morowali',
        startDate: '2026-09-09',
        endDate: '2026-09-11',
        budget: 13500000,
        status: 'COMPLETED',
        plannedHours: 24,
        actualHours: 24,
        empIds: [
          '40000000-0000-0000-0000-000000000004',
          '40000000-0000-0000-0000-000000000005',
        ],
        plannedPartCount: 12,
        actualPartCount: 12,
      },
      {
        id: '90000000-0000-0000-0000-000000000010',
        appNo: 'TR-2026-MOD-004',
        deptId: '20000000-0000-0000-0000-000000000001',
        deptName: 'Mining Operations Department',
        submittedBy: '00000000-0000-0000-0000-000000000002',
        submitterName: 'Admin',
        title: 'KOMTRAX & VHMS Heavy Equipment Telemetry Diagnostics',
        category: 'Technical',
        type: 'IN_HOUSE',
        provider: 'Plant & Training Center PT. RAJA',
        location: 'Training Room Site Morowali',
        startDate: '2026-10-12',
        endDate: '2026-10-13',
        budget: 11000000,
        status: 'COMPLETED',
        plannedHours: 16,
        actualHours: 16,
        empIds: ['40000000-0000-0000-0000-000000000001'],
        plannedPartCount: 16,
        actualPartCount: 16,
      },
      {
        id: '90000000-0000-0000-0000-000000000011',
        appNo: 'TR-2026-TC-002',
        deptId: '20000000-0000-0000-0000-000000000004',
        deptName: 'Training Center',
        submittedBy: '00000000-0000-0000-0000-000000000005',
        submitterName: 'Admin TC',
        title: 'Simulator Heavy Hauler & Emergency Braking Procedure Batch 2',
        category: 'Safety',
        type: 'INTERNAL',
        provider: 'PT. Roda Jaya Sakti Training Center',
        location: 'Simulator Room — Site Morowali',
        startDate: '2026-11-05',
        endDate: '2026-11-09',
        budget: 14000000,
        status: 'IN_PROGRESS',
        plannedHours: 24,
        actualHours: 12,
        empIds: [
          '40000000-0000-0000-0000-000000000002',
          '40000000-0000-0000-0000-000000000008',
        ],
        plannedPartCount: 15,
        actualPartCount: 0,
      },
      {
        id: '90000000-0000-0000-0000-000000000012',
        appNo: 'TR-2026-MOD-005',
        deptId: '20000000-0000-0000-0000-000000000001',
        deptName: 'Mining Operations Department',
        submittedBy: '00000000-0000-0000-0000-000000000002',
        submitterName: 'Admin',
        title: 'Pengawas Operasional Madya (POM) Pertambangan Batch 2',
        category: 'Certification',
        type: 'CERTIFICATION',
        provider: 'LSP PERHAPI Mandiri',
        location: 'Training Center Room 1 / On-Site',
        startDate: '2026-11-20',
        endDate: '2026-11-24',
        budget: 25000000,
        status: 'UNDER_HOD_REVIEW',
        plannedHours: 40,
        actualHours: 0,
        empIds: [
          '40000000-0000-0000-0000-000000000003',
          '40000000-0000-0000-0000-000000000001',
        ],
        plannedPartCount: 10,
        actualPartCount: 0,
      },
      {
        id: '90000000-0000-0000-0000-000000000013',
        appNo: 'TR-2026-HRGA-002',
        deptId: '20000000-0000-0000-0000-000000000003',
        deptName: 'HRGA-IT (Human Resources, General Affairs & IT)',
        submittedBy: '00000000-0000-0000-0000-000000000006',
        submitterName: 'Admin HRGA',
        title: 'Competency Based Interview & HRIS Digital Transformation',
        category: 'Leadership',
        type: 'EXTERNAL',
        provider: 'PPM Manajemen / HRGA-IT PT. RAJA',
        location: 'Training Room HO Makassar',
        startDate: '2026-11-25',
        endDate: '2026-11-26',
        budget: 11500000,
        status: 'PENDING_PJO',
        plannedHours: 16,
        actualHours: 0,
        empIds: ['40000000-0000-0000-0000-000000000006'],
        plannedPartCount: 10,
        actualPartCount: 0,
      },
      {
        id: '90000000-0000-0000-0000-000000000018',
        appNo: 'TR-2026-PLM-001',
        deptId: '20000000-0000-0000-0000-000000000006',
        deptName: 'PLM (Plant & Logistics Management)',
        submittedBy: '00000000-0000-0000-0000-000000000002',
        submitterName: 'Admin',
        title: 'Preventive Maintenance Hydraulic System & Fleet Logistics Optimization',
        category: 'Technical',
        type: 'IN_HOUSE',
        provider: 'Plant & Training Center PT. RAJA',
        location: 'Main Workshop PLM — Site Morowali',
        startDate: '2026-06-22',
        endDate: '2026-06-24',
        budget: 16500000,
        status: 'COMPLETED',
        plannedHours: 24,
        actualHours: 24,
        empIds: ['40000000-0000-0000-0000-000000000009'],
        plannedPartCount: 14,
        actualPartCount: 14,
      },
      {
        id: '90000000-0000-0000-0000-000000000019',
        appNo: 'TR-2026-CIVIL-001',
        deptId: '20000000-0000-0000-0000-000000000007',
        deptName: 'CIVIL (Civil & Infrastructure)',
        submittedBy: '00000000-0000-0000-0000-000000000002',
        submitterName: 'Admin',
        title: 'Haul Road Construction Standard, Drainage & Settling Pond Engineering',
        category: 'Technical',
        type: 'INTERNAL',
        provider: 'Civil & Engineering Academy PT. RAJA',
        location: 'Civil Project Office — Site Morowali',
        startDate: '2026-08-24',
        endDate: '2026-08-26',
        budget: 15000000,
        status: 'COMPLETED',
        plannedHours: 24,
        actualHours: 24,
        empIds: ['40000000-0000-0000-0000-000000000010'],
        plannedPartCount: 12,
        actualPartCount: 12,
      },
      {
        id: '90000000-0000-0000-0000-000000000014',
        appNo: 'TR-2026-HSE-003',
        deptId: '20000000-0000-0000-0000-000000000005',
        deptName: 'Health Safety & Environment',
        submittedBy: '00000000-0000-0000-0000-000000000005',
        submitterName: 'Admin TC',
        title: 'Emergency Pit Rescue & High Angle Evacuation Drill',
        category: 'Safety',
        type: 'IN_HOUSE',
        provider: 'BASARNAS & Emergency Response Team RAJA',
        location: 'Pit Highwall Sector C — Site Morowali',
        startDate: '2026-12-05',
        endDate: '2026-12-07',
        budget: 17500000,
        status: 'SCHEDULED',
        plannedHours: 24,
        actualHours: 0,
        empIds: ['40000000-0000-0000-0000-000000000007'],
        plannedPartCount: 16,
        actualPartCount: 0,
      },
      {
        id: '90000000-0000-0000-0000-000000000015',
        appNo: 'TR-2026-MED-003',
        deptId: '20000000-0000-0000-0000-000000000002',
        deptName: 'Mining Engineering Department',
        submittedBy: '00000000-0000-0000-0000-000000000004',
        submitterName: 'Manager TC',
        title: 'Overseas Autonomous Drilling Seminar (Ditunda / Cancelled)',
        category: 'Technical',
        type: 'EXTERNAL',
        provider: 'Global Mining Expo',
        location: 'External Venue',
        startDate: '2026-10-22',
        endDate: '2026-10-24',
        budget: 45000000,
        status: 'CANCELLED',
        plannedHours: 24,
        actualHours: 0,
        empIds: ['40000000-0000-0000-0000-000000000005'],
        plannedPartCount: 4,
        actualPartCount: 0,
      },
      // 2025 Historical Completed Trainings
      {
        id: '90000000-0000-0000-0000-000000000016',
        appNo: 'TR-2025-MOD-019',
        deptId: '20000000-0000-0000-0000-000000000001',
        deptName: 'Mining Operations Department',
        submittedBy: '00000000-0000-0000-0000-000000000002',
        submitterName: 'Admin',
        title: 'Pedoman Teknis Operasional Tambang (PTOT) & Good Mining Practice',
        category: 'Compliance',
        type: 'CERTIFICATION',
        provider: 'Dirjen Minerba / Internal TC',
        location: 'Meeting Room HO Makassar — Platinum',
        startDate: '2025-09-13',
        endDate: '2025-09-14',
        budget: 14000000,
        status: 'COMPLETED',
        plannedHours: 16,
        actualHours: 16,
        empIds: [
          '40000000-0000-0000-0000-000000000003',
          '40000000-0000-0000-0000-000000000001',
        ],
        plannedPartCount: 20,
        actualPartCount: 20,
      },
      {
        id: '90000000-0000-0000-0000-000000000017',
        appNo: 'TR-2025-MED-011',
        deptId: '20000000-0000-0000-0000-000000000002',
        deptName: 'Mining Engineering Department',
        submittedBy: '00000000-0000-0000-0000-000000000004',
        submitterName: 'Manager TC',
        title: 'Geotechnical Pit Slope Instrumentation & Water Drainage',
        category: 'Technical',
        type: 'INTERNAL',
        provider: 'PT. Roda Jaya Sakti Engineering Academy',
        location: 'Engineering Office Site Morowali',
        startDate: '2025-11-20',
        endDate: '2025-11-22',
        budget: 12000000,
        status: 'COMPLETED',
        plannedHours: 24,
        actualHours: 24,
        empIds: ['40000000-0000-0000-0000-000000000004'],
        plannedPartCount: 10,
        actualPartCount: 10,
      },
    ];

    seedTrainings.forEach((st, idx) => {
      const app: TrainingApplication = {
        id: st.id,
        application_number: st.appNo,
        department_id: st.deptId,
        department_name: st.deptName,
        submitted_by: st.submittedBy,
        submitter_name: st.submitterName,
        training_title: st.title,
        training_category: st.category,
        training_objectives: `Peningkatan kompetensi operasional dan pemenuhan standar keselamatan pertambangan (${st.title}).`,
        training_provider: st.provider,
        training_location: st.location,
        proposed_start_date: st.startDate,
        proposed_end_date: st.endDate,
        estimated_budget: st.budget,
        training_type: st.type,
        description: st.title,
        current_status: st.status,
        planned_hours: st.plannedHours,
        actual_hours: st.actualHours,
        planned_participants: st.plannedPartCount,
        actual_participants: st.actualPartCount,
        hod_approver_id:
          st.status === 'PENDING_PJO' ||
          st.status === 'SCHEDULED' ||
          st.status === 'IN_PROGRESS' ||
          st.status === 'COMPLETED'
            ? '00000000-0000-0000-0000-000000000004'
            : null,
        hod_decision:
          st.status === 'PENDING_PJO' ||
          st.status === 'SCHEDULED' ||
          st.status === 'IN_PROGRESS' ||
          st.status === 'COMPLETED'
            ? 'APPROVE'
            : null,
        hod_comments: 'Kurikulum dan jadwal sesuai rencana kompetensi tahunan.',
        pjo_approver_id:
          st.status === 'SCHEDULED' ||
          st.status === 'IN_PROGRESS' ||
          st.status === 'COMPLETED'
            ? '00000000-0000-0000-0000-000000000003'
            : null,
        pjo_decision:
          st.status === 'SCHEDULED' ||
          st.status === 'IN_PROGRESS' ||
          st.status === 'COMPLETED'
            ? 'APPROVE'
            : null,
        pjo_comments: 'Disetujui untuk pelaksanaan operasional.',
        created_at: `${st.startDate}T08:00:00Z`,
        updated_at: `${st.startDate}T10:00:00Z`,
      };
      this.applications.push(app);

      st.empIds.forEach((empId, pIdx) => {
        this.participants.push({
          id: `91000000-0000-0000-0000-0000000${idx + 1}0${pIdx + 1}`,
          application_id: st.id,
          employee_id: empId,
          notes: 'Peserta terdaftar',
          status: st.status === 'COMPLETED' ? 'COMPLETED' : 'CONFIRMED',
          created_at: `${st.startDate}T08:00:00Z`,
        });
      });

      if (
        st.status === 'COMPLETED' ||
        st.status === 'IN_PROGRESS' ||
        st.status === 'SCHEDULED'
      ) {
        const schedId = `94000000-0000-0000-0000-0000000000${String(idx + 1).padStart(2, '0')}`;
        this.schedules.push({
          id: schedId,
          application_id: st.id,
          application_title: st.title,
          batch_number: `BATCH-${st.appNo}`,
          trainer_name: 'Ir. Hendra Kusuma & Tim Instruktur RAJA',
          venue: st.location,
          start_date: st.startDate,
          end_date: st.endDate,
          daily_start_time: '08:00:00',
          daily_end_time: '17:00:00',
          total_hours: st.plannedHours,
          status: st.status,
          scheduled_by: '00000000-0000-0000-0000-000000000004',
          created_at: `${st.startDate}T08:00:00Z`,
        });

        st.empIds.forEach((empId, rIdx) => {
          this.records.push({
            id: `96000000-0000-0000-0000-0000000${idx + 1}0${rIdx + 1}`,
            schedule_id: schedId,
            application_id: st.id,
            employee_id: empId,
            attendance_status: st.status === 'COMPLETED' ? 'ATTENDED' : 'ENROLLED',
            final_score: st.status === 'COMPLETED' ? 88 : undefined,
            result_status: st.status === 'COMPLETED' ? 'PASSED' : 'PENDING',
            passed: st.status === 'COMPLETED',
            training_hours_completed: st.status === 'COMPLETED' ? st.actualHours : 0,
            certificate_issued: st.status === 'COMPLETED',
            completed_at: st.status === 'COMPLETED' ? `${st.endDate}T17:00:00Z` : undefined,
            created_at: `${st.startDate}T08:00:00Z`,
          });
        });
      }
    });

    this.approvalHistory.push({
      id: '92000000-0000-0000-0000-000000000001',
      application_id: '90000000-0000-0000-0000-000000000012',
      actor_id: '00000000-0000-0000-0000-000000000002',
      actor_name: 'Admin',
      actor_role: 'ADMIN',
      action: 'SUBMIT',
      previous_status: 'DRAFT',
      new_status: 'UNDER_HOD_REVIEW',
      comments: 'Submitted initial application with foremen participants.',
      action_timestamp: '2026-11-01T08:30:00Z',
    });

    this.notifications.push({
      id: '93000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000004', // Manager TC
      title: 'Pengajuan Training Baru Menunggu Review',
      message: 'Berkas TR-2026-MOD-005 (Pengawas Operasional Madya) menunggu evaluasi Manager TC.',
      type: 'HOD_REVIEW',
      reference_id: '90000000-0000-0000-0000-000000000012',
      is_read: false,
      created_at: '2026-11-01T08:30:00Z',
    });

    // Seed initial completed Certifications & Historical Training Records
    this.certifications.push(
      {
        id: '95000000-0000-0000-0000-000000000001',
        employee_id: '40000000-0000-0000-0000-000000000003',
        certificate_number: 'CERT-RAJA-POP-202601',
        certificate_name: 'Pengawas Operasional Pertama (POP) Pertambangan Minerba',
        issuing_body: 'BNSP / LSP PERHAPI',
        certification_level: 'POP Certified',
        issue_date: '2026-02-09',
        duration_label: '5 Days (40 Hours)',
        venue: 'Training Center PT. RAJA — Site Morowali',
        is_lifetime: false,
        status: 'ACTIVE',
        created_at: '2026-02-09T16:00:00Z',
      },
      {
        id: '95000000-0000-0000-0000-000000000002',
        employee_id: '40000000-0000-0000-0000-000000000003',
        certificate_number: 'CERT-RAJA-AFA-202602',
        certificate_name: 'Applied Failure Analysis (AFA) & Heavy Fleet Supervision',
        issuing_body: 'PT. Roda Jaya Sakti Training Center',
        certification_level: 'Advanced Supervisor',
        issue_date: '2026-01-20',
        duration_label: '3 Days (24 Hours)',
        venue: 'Workshop Heavy Equipment — Site Morowali',
        is_lifetime: true,
        status: 'ACTIVE',
        created_at: '2026-01-20T16:00:00Z',
      },
      {
        id: '95000000-0000-0000-0000-000000000003',
        employee_id: '40000000-0000-0000-0000-000000000003',
        certificate_number: 'CERT-RAJA-PTOT-202509',
        certificate_name: 'Pedoman Teknis Operasional Tambang (PTOT) & Good Mining Practice',
        issuing_body: 'Dirjen Minerba / Internal TC',
        certification_level: 'Certified Foreman',
        issue_date: '2025-09-14',
        duration_label: '2 Days (16 Hours)',
        venue: 'Meeting Room HO Makassar — Platinum',
        is_lifetime: true,
        status: 'ACTIVE',
        created_at: '2025-09-14T16:00:00Z',
      },
      {
        id: '95000000-0000-0000-0000-000000000004',
        employee_id: '40000000-0000-0000-0000-000000000003',
        certificate_number: 'CERT-RAJA-SMKP-202506',
        certificate_name: 'Sistem Manajemen Keselamatan Pertambangan (SMKP) Kepmen 1827 K/2018',
        issuing_body: 'HSE & Training Center PT. RAJA',
        certification_level: 'Safety Auditor Level 1',
        issue_date: '2025-06-10',
        duration_label: '2 Days (16 Hours)',
        venue: 'Main Hall Morowali Operations',
        is_lifetime: false,
        status: 'ACTIVE',
        created_at: '2025-06-10T16:00:00Z',
      },
      {
        id: '95000000-0000-0000-0000-000000000005',
        employee_id: '40000000-0000-0000-0000-000000000001',
        certificate_number: 'CERT-RAJA-EXC-202601',
        certificate_name: 'Product Knowledge, Maintenance & Pengoperasian Excavator Komatsu PC400 / CAT 349D',
        issuing_body: 'PT. Roda Jaya Sakti Training Center',
        certification_level: 'Senior Operator Class A',
        issue_date: '2026-01-28',
        duration_label: '3 Days (24 Hours)',
        venue: 'Pit Simulation & Workshop APS Morowali',
        is_lifetime: false,
        status: 'ACTIVE',
        created_at: '2026-01-28T16:00:00Z',
      },
      {
        id: '95000000-0000-0000-0000-000000000006',
        employee_id: '40000000-0000-0000-0000-000000000001',
        certificate_number: 'CERT-RAJA-KMX-202510',
        certificate_name: 'KOMTRAX & VHMS Heavy Equipment Telemetry Diagnostics',
        issuing_body: 'Plant & Training Center PT. RAJA',
        certification_level: 'Certified Operator',
        issue_date: '2025-10-07',
        duration_label: '2 Days (16 Hours)',
        venue: 'Training Room Site Morowali',
        is_lifetime: true,
        status: 'ACTIVE',
        created_at: '2025-10-07T16:00:00Z',
      },
      {
        id: '95000000-0000-0000-0000-000000000007',
        employee_id: '40000000-0000-0000-0000-000000000002',
        certificate_number: 'CERT-RAJA-DDT-202602',
        certificate_name: 'Defensive Driving Training (DDT) & Heavy Hauler Safety 6x4',
        issuing_body: 'HSE & Training Center PT. RAJA',
        certification_level: 'SIMPER HD Full Active',
        issue_date: '2026-02-14',
        duration_label: '2 Days (16 Hours)',
        venue: 'Hauling Road Sector B — Site Morowali',
        is_lifetime: false,
        status: 'ACTIVE',
        created_at: '2026-02-14T16:00:00Z',
      },
      {
        id: '95000000-0000-0000-0000-000000000008',
        employee_id: '40000000-0000-0000-0000-000000000005',
        certificate_number: 'CERT-RAJA-GEO-202601',
        certificate_name: 'Slope Stability & Geotechnical Radar Monitoring',
        issuing_body: 'LSP PERHAPI / Geotechnical Institute',
        certification_level: 'Geotech Specialist',
        issue_date: '2026-01-18',
        duration_label: '3 Days (24 Hours)',
        venue: 'Training Room HO Makassar — Platinum',
        is_lifetime: true,
        status: 'ACTIVE',
        created_at: '2026-01-18T16:00:00Z',
      },
      {
        id: '95000000-0000-0000-0000-000000000009',
        employee_id: '40000000-0000-0000-0000-000000000004',
        certificate_number: 'CERT-RAJA-MNP-202511',
        certificate_name: 'Short-Term Nickel Pit Fleet Dispatch & Mine Planning Optimization',
        issuing_body: 'PT. Roda Jaya Sakti Engineering Academy',
        certification_level: 'Certified Mine Planner',
        issue_date: '2025-11-22',
        duration_label: '3 Days (24 Hours)',
        venue: 'Engineering Office Site Morowali',
        is_lifetime: true,
        status: 'ACTIVE',
        created_at: '2025-11-22T16:00:00Z',
      }
    );
  }

  // ============================================================================
  // RBAC & RLS SIMULATION HELPERS
  // ============================================================================
  getUserRole(userId: string): RoleCode | null {
    const user = this.users.find((u) => u.id === userId && u.is_active);
    return user ? user.role_code : null;
  }

  getUserPermissions(userId: string) {
    const role = this.getUserRole(userId);
    if (!role) {
      throw new Error('UNAUTHORIZED: Akun pengguna tidak aktif atau tidak ditemukan.');
    }
    return getRolePermissions(role);
  }

  getUserActiveDeptId(userId: string): string | null {
    const user = this.users.find((u) => u.id === userId && u.is_active);
    const assignment = this.departmentAssignments.find(
      (a) => a.user_id === userId && a.is_active
    );
    if (assignment) return assignment.department_id;
    return user?.department_id || null;
  }

  // Filter Employees based on caller
  getVisibleEmployees(callerId: string): Employee[] {
    const role = this.getUserRole(callerId);
    if (!role) return [];
    return this.employees.filter((e) => e.is_active);
  }

  // Filter Applications based on caller
  getVisibleApplications(callerId: string): TrainingApplication[] {
    const role = this.getUserRole(callerId);
    if (!role) return [];
    const apps = [...this.applications];

    return apps.map((app) => {
      const dept = this.departments.find((d) => d.id === app.department_id);
      const submitter = this.users.find((u) => u.id === app.submitted_by);
      const hod = this.users.find((u) => u.id === app.hod_approver_id);
      const pjo = this.users.find((u) => u.id === app.pjo_approver_id);

      const parts = this.participants
        .filter((p) => p.application_id === app.id)
        .map((p) => {
          const emp = this.employees.find((e) => e.id === p.employee_id);
          return {
            ...p,
            employee_name: emp?.full_name,
            employee_nik: emp?.nik,
            employee_position: emp?.position,
          };
        });

      return {
        ...app,
        department_name: dept?.name || app.department_name,
        submitter_name: submitter?.full_name || app.submitter_name,
        hod_approver_name: hod?.full_name,
        pjo_approver_name: pjo?.full_name,
        participants: parts,
      };
    });
  }

  // ============================================================================
  // AUTOMATIC TRAINING ACHIEVEMENT CALCULATION ENGINE (REAL DATA SOURCE)
  // Aggregates both formal Training Applications AND live Sub-Menu Training Achievement
  // (Program Technical Training, Activity Technical Training, Skill Audit & Refresh Operator)
  // ============================================================================
  private parseParticipantsFromAttendentsLabel(label: string): number {
    if (!label) return 1;
    const matchX = label.match(/(\d+)\s*x/i);
    if (matchX) {
      return Math.max(1, Number(matchX[1]));
    }
    const matchNum = label.match(/(\d+)/);
    if (matchNum) {
      return Math.max(1, Number(matchNum[1]));
    }
    const parts = label.split(/[,&+/]/).map((s) => s.trim()).filter(Boolean);
    return Math.max(1, parts.length);
  }

  private getSubMenuAchievementItems(): TrainingPerformanceItem[] {
    const mod = this.technicalTrainingModule;
    if (!mod) return [];

    const deletedSet = new Set(mod.deletedAchievementItemIds || []);
    const overrides = mod.achievementItemOverrides || {};

    const plmDept =
      this.departments.find((d) => d.code === 'PLM') ||
      this.departments.find((d) => d.id === '20000000-0000-0000-0000-000000000006') ||
      this.departments[0];
    const modDept =
      this.departments.find((d) => d.code === 'MOD') ||
      this.departments.find((d) => d.id === '20000000-0000-0000-0000-000000000001') ||
      this.departments[0];
    const tcDept =
      this.departments.find((d) => d.code === 'TC') ||
      this.departments.find((d) => d.id === '20000000-0000-0000-0000-000000000004') ||
      this.departments[0];

    const categorizeStatus = (
      st: ApplicationStatus
    ): 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'CANCELLED' => {
      if (st === 'COMPLETED') return 'COMPLETED';
      if (st === 'IN_PROGRESS') return 'IN_PROGRESS';
      if (st === 'CANCELLED' || st === 'REJECTED') return 'CANCELLED';
      return 'PENDING';
    };

    const rawSubItems: TrainingPerformanceItem[] = [];

    // 1. Sub-Menu 1: Resume Training Class Crew Mechanic PLM 2026 (Mei - Nov 2026)
    (mod.plmMonthlyTrainingClasses || []).forEach((m) => {
      const yr = m.year || '2026';
      const monStr = String(m.month_index || 11).padStart(2, '0');
      const lastDay = new Date(Number(yr), Number(monStr), 0).getDate();
      const status: ApplicationStatus =
        m.period_status === 'FINAL' ? 'COMPLETED' : 'IN_PROGRESS';
      const plannedHours = Math.max(8, (Number(m.frequency_plan) || 1) * 8);
      const actualHours = Math.max(0, (Number(m.frequency_actual) || 0) * 8);

      rawSubItems.push({
        id: `sub-plm-class-${m.id}`,
        applicationNumber: `TTC-PLM-${yr}-${monStr}`,
        trainingTitle: `Training Class Crew Mechanic PLM — Periode ${m.month_name} ${yr} (${m.frequency_actual}/${m.frequency_plan} Sesi In-Class)`,
        trainingCategory: 'Technical',
        trainingType: 'INTERNAL',
        departmentId: plmDept.id,
        departmentCode: plmDept.code,
        departmentName: plmDept.name,
        startDate: `${yr}-${monStr}-01`,
        endDate: `${yr}-${monStr}-${String(lastDay).padStart(2, '0')}`,
        status,
        statusCategory: categorizeStatus(status),
        plannedParticipants: Math.max(0, Number(m.plan) || 0),
        actualParticipants: Math.max(0, Number(m.actual) || 0),
        plannedHours,
        actualHours,
        participantNames: [],
        sourceLabel: 'Program Technical Training',
        sourceTab: 'trainer_activities',
        companyScope: 'INTERNAL_RJS',
        site: 'Site Tangofa',
        cohortKey: 'PLM_MECHANIC_TANGOFA',
      });
    });

    // 2. Sub-Menu 1: Monitoring OJT Siswa BMC (31 Siswa PLM Tangofa & 7 Siswa Site TPM)
    (mod.ojtBmcRecords || []).forEach((r, idx) => {
      const status: ApplicationStatus =
        r.ojt_status === 'Completed' || r.ojt_status === 'Evaluated'
          ? 'COMPLETED'
          : 'IN_PROGRESS';
      const count = Math.max(0, Number(r.student_count) || 0);
      const isTpm = (r.location || '').toUpperCase().includes('TPM');
      rawSubItems.push({
        id: `sub-ojt-${r.id}`,
        applicationNumber: `TTC-OJT-2026-${String(idx + 1).padStart(2, '0')}`,
        trainingTitle: `${r.student_name} (${r.batch} • ${r.location})`,
        trainingCategory: 'Technical',
        trainingType: 'INTERNAL',
        departmentId: plmDept.id,
        departmentCode: plmDept.code,
        departmentName: plmDept.name,
        startDate: '2026-11-01',
        endDate: '2026-11-30',
        status,
        statusCategory: categorizeStatus(status),
        plannedParticipants: count,
        actualParticipants: count,
        plannedHours: 40,
        actualHours: status === 'COMPLETED' ? 40 : 32,
        participantNames: [],
        sourceLabel: 'Program Technical Training',
        sourceTab: 'trainer_activities',
        companyScope: 'INTERNAL_RJS',
        site: isTpm ? 'Site TPM' : 'Site Tangofa',
        cohortKey: isTpm ? 'PLM_MECHANIC_TPM' : 'PLM_MECHANIC_TANGOFA',
      });
    });

    // Catatan Akurasi Data:
    // Jadwal Sharing Session BMC & Daily Activity Trainer adalah log aktivitas harian/sharing
    // dari peserta yang sudah dihitung di program utama (OJT BMC, FGDP, Green Operator, Driver DT),
    // sehingga TIDAK dijumlahkan ulang sebagai program/peserta baru agar bebas double-counting.

    // 5. Sub-Menu 3: Program Skill Audit & Refresh Operator (ADT, Excavator, Doser, Driver DT, dan Heavy Equipment)
    const skillOps = mod.skillAuditOperatorRecords || [];
    const skillCategories: Array<{
      code: SkillAuditCategoryCode;
      appNo: string;
      title: string;
      startDate: string;
      endDate: string;
      hours: number;
    }> = [
      {
        code: 'ADT',
        appNo: 'SKA-MOD-2026-ADT',
        title:
          'Program Refresh Training Operator ADT Setelah Skill Audit (Komatsu HM400 & Volvo A40G)',
        startDate: '2026-09-25',
        endDate: '2026-11-04',
        hours: 40,
      },
      {
        code: 'EXCAVATOR',
        appNo: 'SKA-MOD-2026-EXC',
        title:
          'Program Refresh Digger / Excavator Operator Setelah Skill Audit (Excavator 50T & 30T/320T)',
        startDate: '2026-10-01',
        endDate: '2026-11-04',
        hours: 32,
      },
      {
        code: 'DOSER',
        appNo: 'SKA-MOD-2026-DOS',
        title:
          'Program Refresh Operator Doser Setelah Skill Audit (Doser D85SS & D65)',
        startDate: '2026-10-27',
        endDate: '2026-11-04',
        hours: 16,
      },
      {
        code: 'DRIVER_DT',
        appNo: 'SKA-MOD-2026-DT',
        title:
          'Observasi Skill Drive & Refresh Procedure Emergency Driver DT Hauling (Domfeng & Hongyan)',
        startDate: '2026-09-26',
        endDate: '2026-11-04',
        hours: 24,
      },
    ];

    const normalizePersonKey = (raw: string): string => {
      if (!raw) return '';
      const cleaned = raw
        .toLowerCase()
        .replace(/\(batch.*?\)|\(lv\)/gi, '')
        .replace(/^\d+\s*x\s*/i, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (!cleaned || cleaned.length < 3) return '';
      if (
        /^(tes praktek|grounded|peserta|siswa|kandidat|operator|driver|mekanik|refresh|orientasi|observasi|assessment)\b/i.test(
          cleaned
        )
      ) {
        return '';
      }
      return cleaned;
    };

    const isSubconGenba = (r: { activitas?: string; perusahaan?: string }): boolean => {
      const act = (r.activitas || '').toLowerCase();
      const per = (r.perusahaan || '').toLowerCase();
      if (/\b(subcon|subcont|igs|cas|armada|gkc|gpm)\b/i.test(act)) return true;
      if (
        per !== 'rjs / subcont' &&
        per !== 'rjs & subcont' &&
        /\b(subcon|subcont|igs|cas|armada|gkc|gpm)\b/i.test(per)
      ) {
        return true;
      }
      return false;
    };

    skillCategories.forEach((cat) => {
      const catRecords = skillOps.filter((r) => r.category === cat.code);
      if (catRecords.length > 0) {
        rawSubItems.push({
          id: `sub-ska-${cat.code.toLowerCase()}`,
          applicationNumber: cat.appNo,
          trainingTitle: cat.title,
          trainingCategory: 'Technical',
          trainingType: 'INTERNAL',
          departmentId: modDept.id,
          departmentCode: modDept.code,
          departmentName: modDept.name,
          startDate: cat.startDate,
          endDate: cat.endDate,
          status: 'COMPLETED',
          statusCategory: 'COMPLETED',
          plannedParticipants: catRecords.length,
          actualParticipants: catRecords.length,
          plannedHours: cat.hours,
          actualHours: cat.hours,
          participantNames: catRecords.map((r) => r.nama),
          sourceLabel: 'Skill Audit & Refresh Operator',
          sourceTab: 'skill_audit_refresh_operator',
          companyScope: 'INTERNAL_RJS',
          site: 'Site Tangofa',
        });
      }
    });

    // Tambahkan juga unit Heavy Equipment lain dari Summary Skill Audit (mis. Wheel Loader & Grader)
    (mod.skillAuditSummaryRows || []).forEach((row) => {
      const j = row.jabatan.toLowerCase();
      const isCoveredByFourTabs =
        j.includes('adt') ||
        j.includes('excavator') ||
        j.includes('exa') ||
        j.includes('buldozer') ||
        j.includes('dozer') ||
        j.includes('doser') ||
        j.includes('driver dt');
      if (isCoveredByFourTabs || row.total_karyawan <= 0) return;

      const isCompleted = row.open_count === 0 && row.close_count > 0;
      const status: ApplicationStatus = isCompleted
        ? 'COMPLETED'
        : row.close_count > 0
        ? 'IN_PROGRESS'
        : 'SCHEDULED';

      rawSubItems.push({
        id: `sub-ska-sum-${row.id}`,
        applicationNumber: `SKA-MOD-2026-${String(row.no).padStart(2, '0')}`,
        trainingTitle: `Program Skill Audit & Refresh ${row.jabatan} — Heavy Equipment`,
        trainingCategory: 'Technical',
        trainingType: 'INTERNAL',
        departmentId: modDept.id,
        departmentCode: modDept.code,
        departmentName: modDept.name,
        startDate: isCompleted ? '2026-10-15' : '2026-11-01',
        endDate: '2026-11-30',
        status,
        statusCategory: categorizeStatus(status),
        plannedParticipants: row.total_karyawan,
        actualParticipants: row.close_count,
        plannedHours: 16,
        actualHours: isCompleted ? 16 : row.close_count > 0 ? 8 : 0,
        participantNames: [],
        sourceLabel: 'Skill Audit & Refresh Operator',
        sourceTab: 'skill_audit_refresh_operator',
        companyScope: 'INTERNAL_RJS',
        site: 'Site Tangofa',
      });
    });

    // 6. Sub-Menu 4: Assessment, Cross & Skill Up Operator
    const opState = operationTrainerStore.getState();
    const simperWeeklyCount = (opState.simperAssessments || []).reduce(
      (sum, r) => sum + (Number(r.actual) || 0),
      0
    );
    const simperTotalActual = Math.max(opState.simperCumulativeYtd || 66, simperWeeklyCount);
    rawSubItems.push({
      id: 'sub-op-simper-2026',
      applicationNumber: 'OP-SIMPER-2026-01',
      trainingTitle: `Assessment Candidate Operator & Driver (Internal & External) — Mendapatkan SIMPER (${simperTotalActual}x Kandidat)`,
      trainingCategory: 'Technical',
      trainingType: 'INTERNAL',
      departmentId: modDept.id,
      departmentCode: modDept.code,
      departmentName: modDept.name,
      startDate: '2026-11-02',
      endDate: '2026-11-04',
      status: 'COMPLETED',
      statusCategory: 'COMPLETED',
      plannedParticipants: simperTotalActual,
      actualParticipants: simperTotalActual,
      plannedHours: 24,
      actualHours: 24,
      participantNames: (opState.simperAssessments || []).map((r) => r.kandidatNama),
      sourceLabel: 'Assessment, Cross & Skill Up Operator',
      sourceTab: 'assessment_cross_skillup',
      companyScope: 'INTERNAL_RJS',
      site: 'Site Tangofa',
      cohortKey: 'MOD_NEWHIRE_SIMPER_COHORT',
    });

    const crossRecs = opState.crossTrainingRecords || [];
    const crossClosedRecs = crossRecs.filter((r) => r.status === 'CLOSE');
    const crossOtherRecs = crossRecs.filter((r) => r.status !== 'CLOSE');
    const crossClosed = Math.max(
      opState.crossMatrixSummary?.CLOSE || 24,
      crossClosedRecs.length
    );
    const crossActive =
      (opState.crossMatrixSummary?.ON_PROGRESS || 8) +
      (opState.crossMatrixSummary?.ORIENTASI || 4) +
      (opState.crossMatrixSummary?.ON_SCHEDULE || 4);
    const crossTotalPlan = Math.max(crossClosed + crossActive, crossRecs.length);
    rawSubItems.push({
      id: 'sub-op-cross-2026',
      applicationNumber: 'OP-CROSS-2026-02',
      trainingTitle: `Program Cross Training & Similar Operator & Driver (Dozer, Rock Breaker & Water Truck — ${crossClosed} Close, ${crossActive} On Going)`,
      trainingCategory: 'Technical',
      trainingType: 'INTERNAL',
      departmentId: modDept.id,
      departmentCode: modDept.code,
      departmentName: modDept.name,
      startDate: '2026-06-26',
      endDate: '2026-11-04',
      status: 'IN_PROGRESS',
      statusCategory: 'IN_PROGRESS',
      plannedParticipants: crossTotalPlan,
      actualParticipants: crossClosed,
      plannedHours: 40,
      actualHours: 32,
      participantNames: [...crossClosedRecs, ...crossOtherRecs].map((r) => r.nama),
      sourceLabel: 'Assessment, Cross & Skill Up Operator',
      sourceTab: 'assessment_cross_skillup',
      companyScope: 'INTERNAL_RJS',
      site: 'Site Tangofa',
    });

    const skillUpRecs = opState.skillUpRecords || [];
    const skillUpClosedRecs = skillUpRecs.filter((r) => r.status === 'CLOSE');
    const skillUpActiveRecs = skillUpRecs.filter(
      (r) => r.status !== 'CLOSE' && r.status !== 'CANCEL'
    );
    const skillUpClosed = Math.max(
      opState.skillUpMatrixSummary?.CLOSE || 27,
      skillUpClosedRecs.length
    );
    const skillUpTotalPlan = Math.max(
      skillUpClosed +
        (opState.skillUpMatrixSummary?.HOLD || 7) +
        (opState.skillUpMatrixSummary?.ON_SCHEDULE || 4),
      skillUpClosedRecs.length + skillUpActiveRecs.length
    );
    rawSubItems.push({
      id: 'sub-op-skillup-2026',
      applicationNumber: 'OP-SKILLUP-2026-03',
      trainingTitle: `Skill Up Training Operator & Driver (DT 12R, Motor Grader, Compactor, Buldozer & CT — ${skillUpClosed} Close)`,
      trainingCategory: 'Technical',
      trainingType: 'INTERNAL',
      departmentId: modDept.id,
      departmentCode: modDept.code,
      departmentName: modDept.name,
      startDate: '2026-07-01',
      endDate: '2026-11-04',
      status: 'IN_PROGRESS',
      statusCategory: 'IN_PROGRESS',
      plannedParticipants: skillUpTotalPlan,
      actualParticipants: skillUpClosed,
      plannedHours: 40,
      actualHours: 32,
      participantNames: [...skillUpClosedRecs, ...skillUpActiveRecs].map((r) => r.nama),
      sourceLabel: 'Assessment, Cross & Skill Up Operator',
      sourceTab: 'assessment_cross_skillup',
      companyScope: 'INTERNAL_RJS',
      site: 'Site Tangofa',
    });

    // 7. Sub-Menu 5: Orientasi, Re-Training, FGDP & Green Operator
    const oriTotal = Math.max(
      opState.orientasiCumulativeTotal || 62,
      (opState.orientasiNewHireRecords || []).length
    );
    rawSubItems.push({
      id: 'sub-op-orientasi-2026',
      applicationNumber: 'OP-ORI-2026-01',
      trainingTitle: `Orientasi New Hire Operator & Driver di Field (Completed ${opState.orientasiCompletedOctCount || 18}x Oktober • Kumulatif ${oriTotal}x Selesai Orientasi)`,
      trainingCategory: 'Technical',
      trainingType: 'INTERNAL',
      departmentId: modDept.id,
      departmentCode: modDept.code,
      departmentName: modDept.name,
      startDate: '2026-08-16',
      endDate: '2026-11-04',
      status: 'COMPLETED',
      statusCategory: 'COMPLETED',
      plannedParticipants: oriTotal,
      actualParticipants: oriTotal,
      plannedHours: 48,
      actualHours: 48,
      participantNames: (opState.orientasiNewHireRecords || []).map((r) => r.nama),
      sourceLabel: 'Orientasi, Re-Training, FGDP & Green Operator',
      sourceTab: 'orientasi_retraining_green',
      companyScope: 'INTERNAL_RJS',
      site: 'Site Tangofa',
      cohortKey: 'MOD_NEWHIRE_SIMPER_COHORT',
    });

    const rtRecs = opState.retrainingRecords || [];
    const rtDoneRecs = rtRecs.filter((r) => r.ket === 'DONE');
    const rtOtherRecs = rtRecs.filter((r) => r.ket !== 'DONE');
    const rtGrounded = Math.max(
      opState.retrainingCumulativeGrounded || 64,
      rtRecs.length
    );
    const rtComplete = Math.max(
      opState.retrainingCumulativeComplete || 64,
      rtDoneRecs.length
    );
    rawSubItems.push({
      id: 'sub-op-retraining-2026',
      applicationNumber: 'OP-RET-2026-02',
      trainingTitle: `Re-Training Program (Refresh Class & Practical Pasca Incident + 12x Joint Investigasi — ${rtComplete}/${rtGrounded} Complete)`,
      trainingCategory: 'Safety / K3',
      trainingType: 'INTERNAL',
      departmentId: modDept.id,
      departmentCode: modDept.code,
      departmentName: modDept.name,
      startDate: '2026-09-04',
      endDate: '2026-11-03',
      status: 'COMPLETED',
      statusCategory: 'COMPLETED',
      plannedParticipants: rtGrounded,
      actualParticipants: rtComplete,
      plannedHours: 24,
      actualHours: 24,
      participantNames: [...rtDoneRecs, ...rtOtherRecs].map((r) => r.namaPeserta),
      sourceLabel: 'Orientasi, Re-Training, FGDP & Green Operator',
      sourceTab: 'orientasi_retraining_green',
      companyScope: 'INTERNAL_RJS',
      site: 'Site Tangofa',
    });

    const fgdpCount = (opState.fgdpRecords || []).length;
    if (fgdpCount > 0) {
      rawSubItems.push({
        id: 'sub-op-fgdp-2026',
        applicationNumber: 'OP-FGDP-2026-03',
        trainingTitle: `Pembekalan & Orientasi FGDP di Training Center (${fgdpCount} Peserta Class & Field)`,
        trainingCategory: 'Leadership',
        trainingType: 'INTERNAL',
        departmentId: tcDept.id,
        departmentCode: tcDept.code,
        departmentName: tcDept.name,
        startDate: '2026-10-19',
        endDate: '2026-11-05',
        status: 'COMPLETED',
        statusCategory: 'COMPLETED',
        plannedParticipants: fgdpCount,
        actualParticipants: fgdpCount,
        plannedHours: 40,
        actualHours: 40,
        participantNames: (opState.fgdpRecords || []).map((r) => r.nama),
        sourceLabel: 'Orientasi, Re-Training, FGDP & Green Operator',
        sourceTab: 'orientasi_retraining_green',
        companyScope: 'INTERNAL_RJS',
        site: 'Site Tangofa',
      });
    }

    const greenCount = (opState.greenOperatorRecords || []).length;
    if (greenCount > 0) {
      rawSubItems.push({
        id: 'sub-op-green-adt-2026',
        applicationNumber: 'OP-GREEN-2026-04',
        trainingTitle: `Program Training ${greenCount}x Green Operator ADT Batch VI 2026 (Class Done • OJT Circuit Area Gerdas & Zig Zag On Going)`,
        trainingCategory: 'Technical',
        trainingType: 'INTERNAL',
        departmentId: modDept.id,
        departmentCode: modDept.code,
        departmentName: modDept.name,
        startDate: '2026-10-29',
        endDate: '2026-11-30',
        status: 'IN_PROGRESS',
        statusCategory: 'IN_PROGRESS',
        plannedParticipants: greenCount,
        actualParticipants: greenCount,
        plannedHours: 80,
        actualHours: 48,
        participantNames: (opState.greenOperatorRecords || []).map((r) => r.nama),
        sourceLabel: 'Orientasi, Re-Training, FGDP & Green Operator',
        sourceTab: 'orientasi_retraining_green',
        companyScope: 'INTERNAL_RJS',
        site: 'Site Tangofa',
      });
    }

    // 8. Site Gemba Refresh Class & Assessment — Dipisahkan Internal PT. RJS vs Mitra Subcont
    const allGenbaAssess = opState.genbaAssessmentRecords || [];
    const genbaAssessSubcon = allGenbaAssess.filter((r) => isSubconGenba(r));
    const genbaAssessRjs = allGenbaAssess.filter((r) => !isSubconGenba(r));

    const subconKnownNames = new Set(
      genbaAssessSubcon.map((r) => normalizePersonKey(r.nama)).filter(Boolean)
    );

    const allGenbaClass = opState.genbaClassRecords || [];
    const genbaClassSubcon = allGenbaClass.filter(
      (r) => isSubconGenba(r) || subconKnownNames.has(normalizePersonKey(r.nama))
    );
    const genbaClassRjs = allGenbaClass.filter(
      (r) => !isSubconGenba(r) && !subconKnownNames.has(normalizePersonKey(r.nama))
    );

    if (genbaClassRjs.length > 0) {
      rawSubItems.push({
        id: 'sub-op-genba-class-rjs-2026',
        applicationNumber: 'GENBA-CLS-RJS-01',
        trainingTitle: `Refresh Training Class Driver & Operator Internal PT. RJS di Site Gemba (${genbaClassRjs.length}x Peserta)`,
        trainingCategory: 'Technical',
        trainingType: 'INTERNAL',
        departmentId: modDept.id,
        departmentCode: modDept.code,
        departmentName: modDept.name,
        startDate: '2026-07-05',
        endDate: '2026-10-29',
        status: 'COMPLETED',
        statusCategory: 'COMPLETED',
        plannedParticipants: genbaClassRjs.length,
        actualParticipants: genbaClassRjs.length,
        plannedHours: 16,
        actualHours: 16,
        participantNames: genbaClassRjs.map((r) => r.nama),
        sourceLabel: 'Skill Audit & Refresh Operator',
        sourceTab: 'skill_audit_refresh_operator',
        companyScope: 'INTERNAL_RJS',
        site: 'Site Gemba',
      });
    }

    if (genbaClassSubcon.length > 0) {
      rawSubItems.push({
        id: 'sub-op-genba-class-subcon-2026',
        applicationNumber: 'GENBA-CLS-SUB-01',
        trainingTitle: `Refresh Training Class Driver & Operator Mitra Subcont di Site Gemba (${genbaClassSubcon.length}x Sesi)`,
        trainingCategory: 'Technical',
        trainingType: 'INTERNAL',
        departmentId: modDept.id,
        departmentCode: modDept.code,
        departmentName: modDept.name,
        startDate: '2026-07-05',
        endDate: '2026-10-29',
        status: 'COMPLETED',
        statusCategory: 'COMPLETED',
        plannedParticipants: genbaClassSubcon.length,
        actualParticipants: genbaClassSubcon.length,
        plannedHours: 16,
        actualHours: 16,
        participantNames: genbaClassSubcon.map((r) => r.nama),
        sourceLabel: 'Skill Audit & Refresh Operator',
        sourceTab: 'skill_audit_refresh_operator',
        companyScope: 'SUBCONT',
        site: 'Site Gemba',
      });
    }

    if (genbaAssessRjs.length > 0) {
      rawSubItems.push({
        id: 'sub-op-genba-assess-rjs-2026',
        applicationNumber: 'GENBA-ASS-RJS-02',
        trainingTitle: `Assessment, Orientasi & Refresh Operator/Driver Internal PT. RJS di Site Gemba (${genbaAssessRjs.length}x Sesi)`,
        trainingCategory: 'Technical',
        trainingType: 'INTERNAL',
        departmentId: modDept.id,
        departmentCode: modDept.code,
        departmentName: modDept.name,
        startDate: '2026-07-01',
        endDate: '2026-10-27',
        status: 'COMPLETED',
        statusCategory: 'COMPLETED',
        plannedParticipants: genbaAssessRjs.length,
        actualParticipants: genbaAssessRjs.length,
        plannedHours: 24,
        actualHours: 24,
        participantNames: genbaAssessRjs.map((r) => r.nama),
        sourceLabel: 'Assessment, Cross & Skill Up',
        sourceTab: 'assessment_cross_skillup',
        companyScope: 'INTERNAL_RJS',
        site: 'Site Gemba',
      });
    }

    if (genbaAssessSubcon.length > 0) {
      rawSubItems.push({
        id: 'sub-op-genba-assess-subcon-2026',
        applicationNumber: 'GENBA-ASS-SUB-02',
        trainingTitle: `Assessment, Orientasi & Refresh Driver Mitra Subcont (CAS, IGS, Armada, GKC, GPM) di Site Gemba (${genbaAssessSubcon.length}x Sesi)`,
        trainingCategory: 'Technical',
        trainingType: 'INTERNAL',
        departmentId: modDept.id,
        departmentCode: modDept.code,
        departmentName: modDept.name,
        startDate: '2026-07-04',
        endDate: '2026-11-03',
        status: 'COMPLETED',
        statusCategory: 'COMPLETED',
        plannedParticipants: genbaAssessSubcon.length,
        actualParticipants: genbaAssessSubcon.length,
        plannedHours: 24,
        actualHours: 24,
        participantNames: genbaAssessSubcon.map((r) => r.nama),
        sourceLabel: 'Assessment, Cross & Skill Up',
        sourceTab: 'assessment_cross_skillup',
        companyScope: 'SUBCONT',
        site: 'Site Gemba',
      });
    }

    // Catatan Akurasi Data:
    // Daily Activity Operation Trainer (dailyOperationTrainerLogs) adalah log harian instruktur
    // untuk peserta yang sudah tercatat di program utama (Green Operator, Orientasi, Re-Training),
    // sehingga TIDAK ditambahkan ulang ke total program/manpower agar tidak double-counting.

    // Terapkan filter penghapusan & override koreksi manual (jika Admin mengedit item sub-menu dari tabel Capaian Training)
    return rawSubItems
      .filter((item) => !deletedSet.has(item.id))
      .map((item) => {
        const ov = overrides[item.id];
        if (!ov) return item;
        const nextDept = ov.department_id
          ? this.departments.find((d) => d.id === ov.department_id)
          : undefined;
        const nextStatus = ov.current_status ?? item.status;
        const nextStatusCategory = categorizeStatus(nextStatus);
        return {
          ...item,
          trainingTitle: ov.training_title ?? item.trainingTitle,
          departmentId: nextDept ? nextDept.id : item.departmentId,
          departmentCode: nextDept ? nextDept.code : item.departmentCode,
          departmentName: nextDept ? nextDept.name : item.departmentName,
          trainingType: ov.training_type ?? item.trainingType,
          startDate: ov.proposed_start_date ?? item.startDate,
          endDate: ov.proposed_end_date ?? item.endDate,
          status: nextStatus,
          statusCategory: nextStatusCategory,
          plannedParticipants:
            ov.planned_participants !== undefined
              ? ov.planned_participants
              : item.plannedParticipants,
          actualParticipants:
            ov.actual_participants !== undefined
              ? ov.actual_participants
              : item.actualParticipants,
          plannedHours:
            ov.planned_hours !== undefined ? ov.planned_hours : item.plannedHours,
          actualHours:
            ov.actual_hours !== undefined ? ov.actual_hours : item.actualHours,
        };
      });
  }

  calculateTrainingAchievement(filters: AchievementFilter = {}): TrainingAchievementSummary {
    const allApps = this.getVisibleApplications(this.users[0].id);

    // Deduplicate by application id to ensure no training is ever counted twice
    const uniqueAppsMap = new Map<string, TrainingApplication>();
    for (const app of allApps) {
      if (!uniqueAppsMap.has(app.id)) {
        uniqueAppsMap.set(app.id, app);
      }
    }

    const categorizeStatus = (
      st: ApplicationStatus
    ): 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'CANCELLED' => {
      if (st === 'COMPLETED') return 'COMPLETED';
      if (st === 'IN_PROGRESS') return 'IN_PROGRESS';
      if (st === 'CANCELLED' || st === 'REJECTED') return 'CANCELLED';
      return 'PENDING';
    };

    const candidateItems: TrainingPerformanceItem[] = [];

    uniqueAppsMap.forEach((app) => {
      const startDate = app.proposed_start_date || app.created_at.slice(0, 10);
      const statusCategory = categorizeStatus(app.current_status);

      const dept = this.departments.find((d) => d.id === app.department_id);
      const sched = this.schedules.find((s) => s.application_id === app.id);
      const appRecords = this.records.filter(
        (r) => r.application_id === app.id && r.attendance_status === 'ATTENDED'
      );

      const participantNames = (app.participants || [])
        .map((p) => p.employee_name || '')
        .filter(Boolean);

      const plannedParticipants =
        app.planned_participants !== undefined
          ? app.planned_participants
          : Math.max((app.participants || []).length, 1);

      const actualParticipants =
        statusCategory === 'COMPLETED' || statusCategory === 'IN_PROGRESS'
          ? app.actual_participants !== undefined && app.actual_participants > 0
            ? app.actual_participants
            : statusCategory === 'COMPLETED'
            ? Math.max(appRecords.length, (app.participants || []).length)
            : 0
          : 0;

      const plannedHours =
        app.planned_hours !== undefined
          ? app.planned_hours
          : sched?.total_hours || 16;

      const actualHours =
        statusCategory === 'COMPLETED'
          ? app.actual_hours !== undefined && app.actual_hours > 0
            ? app.actual_hours
            : sched?.total_hours || plannedHours
          : statusCategory === 'IN_PROGRESS'
          ? app.actual_hours || 0
          : 0;

      const locLower = (app.training_location || '').toLowerCase();
      const inferredSite = locLower.includes('gemba') || locLower.includes('genba')
        ? 'Site Gemba'
        : locLower.includes('tpm')
        ? 'Site TPM'
        : 'Site Tangofa';

      candidateItems.push({
        id: app.id,
        applicationNumber: app.application_number,
        trainingTitle: app.training_title,
        trainingCategory: app.training_category,
        trainingType: app.training_type,
        departmentId: app.department_id,
        departmentCode: dept?.code || 'RAJA',
        departmentName: dept?.name || app.department_name || '-',
        startDate,
        endDate: app.proposed_end_date || startDate,
        status: app.current_status,
        statusCategory,
        plannedParticipants,
        actualParticipants,
        plannedHours,
        actualHours,
        participantNames,
        sourceLabel: 'Pengajuan Training',
        sourceTab: 'applications',
        companyScope: 'INTERNAL_RJS',
        site: inferredSite,
      });
    });

    // Gabungkan otomatis seluruh program yang berjalan di Sub-Menu Training Achievement
    const subMenuItems = this.getSubMenuAchievementItems();
    candidateItems.push(...subMenuItems);

    // Filter seluruh item berdasarkan Tahun, Bulan, Departemen, Jenis Training, Status, Lingkup Perusahaan, dan Site
    const items = candidateItems.filter((item) => {
      const [itemYear, itemMonth] = (item.startDate || '2026-11-01').split('-');
      const itemScope = item.companyScope || 'INTERNAL_RJS';
      const itemSite = item.site || 'Site Tangofa';

      if (filters.year && filters.year !== 'ALL' && itemYear !== filters.year) {
        return false;
      }
      if (filters.month && filters.month !== 'ALL' && itemMonth !== filters.month) {
        return false;
      }
      if (
        filters.departmentId &&
        filters.departmentId !== 'ALL' &&
        item.departmentId !== filters.departmentId
      ) {
        return false;
      }
      if (
        filters.trainingType &&
        filters.trainingType !== 'ALL' &&
        item.trainingType !== filters.trainingType
      ) {
        return false;
      }
      if (
        filters.statusCategory &&
        filters.statusCategory !== 'ALL' &&
        item.statusCategory !== filters.statusCategory
      ) {
        return false;
      }
      if (
        filters.companyScope &&
        filters.companyScope !== 'ALL' &&
        itemScope !== filters.companyScope
      ) {
        return false;
      }
      if (filters.site && filters.site !== 'ALL' && itemSite !== filters.site) {
        return false;
      }
      return true;
    });

    // Deduplikasi Personel Unik lintas program & lintas tahap/bulan (tanpa double-counting)
    const normalizePersonKey = (raw: string): string => {
      if (!raw) return '';
      const cleaned = raw
        .toLowerCase()
        .replace(/\(batch.*?\)|\(lv\)/gi, '')
        .replace(/^\d+\s*x\s*/i, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (!cleaned || cleaned.length < 3) return '';
      if (
        /^(tes praktek|grounded|peserta|siswa|kandidat|operator|driver|mekanik|refresh|orientasi|observasi|assessment)\b/i.test(
          cleaned
        )
      ) {
        return '';
      }
      return cleaned;
    };

    const computeDeduplicatedManpower = (list: TrainingPerformanceItem[]) => {
      const uniquePlannedNames = new Set<string>();
      const uniqueTrainedNames = new Set<string>();

      let standaloneUnnamedPlanned = 0;
      let standaloneUnnamedTrained = 0;

      const cohortGroups = new Map<string, TrainingPerformanceItem[]>();

      for (const it of list) {
        if (it.cohortKey) {
          const arr = cohortGroups.get(it.cohortKey) || [];
          arr.push(it);
          cohortGroups.set(it.cohortKey, arr);
          continue;
        }

        const cleanedNames = (it.participantNames || [])
          .map(normalizePersonKey)
          .filter(Boolean);

        const itemPlannedSet = new Set<string>();
        for (const n of cleanedNames) {
          if (itemPlannedSet.size >= it.plannedParticipants) break;
          itemPlannedSet.add(n);
          uniquePlannedNames.add(n);
        }

        const itemTrainedSet = new Set<string>();
        for (const n of cleanedNames) {
          if (itemTrainedSet.size >= it.actualParticipants) break;
          itemTrainedSet.add(n);
          uniqueTrainedNames.add(n);
          uniquePlannedNames.add(n);
        }

        standaloneUnnamedPlanned += Math.max(0, it.plannedParticipants - itemPlannedSet.size);
        standaloneUnnamedTrained += Math.max(0, it.actualParticipants - itemTrainedSet.size);
      }

      let cohortUnnamedPlanned = 0;
      let cohortUnnamedTrained = 0;

      cohortGroups.forEach((groupItems) => {
        const groupPlannedSet = new Set<string>();
        const groupTrainedSet = new Set<string>();
        let peakPlanned = 0;
        let peakTrained = 0;

        for (const it of groupItems) {
          peakPlanned = Math.max(peakPlanned, it.plannedParticipants);
          peakTrained = Math.max(peakTrained, it.actualParticipants);

          const cleanedNames = (it.participantNames || [])
            .map(normalizePersonKey)
            .filter(Boolean);

          let pCount = 0;
          for (const n of cleanedNames) {
            if (pCount >= it.plannedParticipants) break;
            pCount++;
            groupPlannedSet.add(n);
            uniquePlannedNames.add(n);
          }

          let tCount = 0;
          for (const n of cleanedNames) {
            if (tCount >= it.actualParticipants) break;
            tCount++;
            groupTrainedSet.add(n);
            uniqueTrainedNames.add(n);
            uniquePlannedNames.add(n);
          }
        }

        cohortUnnamedPlanned += Math.max(0, peakPlanned - groupPlannedSet.size);
        cohortUnnamedTrained += Math.max(0, peakTrained - groupTrainedSet.size);
      });

      const uniqueTrained =
        uniqueTrainedNames.size + standaloneUnnamedTrained + cohortUnnamedTrained;
      const uniquePlanned = Math.max(
        uniqueTrained,
        uniquePlannedNames.size + standaloneUnnamedPlanned + cohortUnnamedPlanned
      );

      return {
        uniquePlanned,
        uniqueTrained,
        rawPlannedSessions: list.reduce((s, i) => s + i.plannedParticipants, 0),
        rawTrainedSessions: list.reduce((s, i) => s + i.actualParticipants, 0),
      };
    };

    const totalPlan = items.length;
    const totalRealization = items.filter((i) => i.statusCategory === 'COMPLETED').length;
    const totalInProgress = items.filter((i) => i.statusCategory === 'IN_PROGRESS').length;
    const totalPending = items.filter(
      (i) => i.statusCategory === 'PENDING' || i.statusCategory === 'IN_PROGRESS'
    ).length;
    const totalCancelled = items.filter((i) => i.statusCategory === 'CANCELLED').length;

    // Formula: Achievement (%) = (Training Realization / Training Plan) * 100%
    const achievementPercentage =
      totalPlan > 0 ? Math.round((totalRealization / totalPlan) * 1000) / 10 : null;

    const overallMp = computeDeduplicatedManpower(items);
    const totalManpowerPlanned = overallMp.uniquePlanned;
    const totalManpowerTrained = overallMp.uniqueTrained;
    const totalPlannedSessions = overallMp.rawPlannedSessions;
    const totalAttendanceSessions = overallMp.rawTrainedSessions;
    const totalPlannedHours = items.reduce((s, i) => s + i.plannedHours, 0);
    const totalTrainingHours = items.reduce((s, i) => s + i.actualHours, 0);

    // Department Breakdown
    const departmentBreakdown: DepartmentAchievementMetric[] = this.departments.map((dept) => {
      const deptItems = items.filter((i) => i.departmentId === dept.id);
      const plan = deptItems.length;
      const realization = deptItems.filter((i) => i.statusCategory === 'COMPLETED').length;
      const inProgress = deptItems.filter((i) => i.statusCategory === 'IN_PROGRESS').length;
      const pending = deptItems.filter(
        (i) => i.statusCategory === 'PENDING' || i.statusCategory === 'IN_PROGRESS'
      ).length;
      const cancelled = deptItems.filter((i) => i.statusCategory === 'CANCELLED').length;
      const achievementPct =
        plan > 0 ? Math.round((realization / plan) * 1000) / 10 : null;
      const deptMp = computeDeduplicatedManpower(deptItems);

      return {
        departmentId: dept.id,
        code: dept.code,
        name: dept.name,
        plan,
        realization,
        inProgress,
        pending,
        cancelled,
        achievementPct,
        manpowerPlanned: deptMp.uniquePlanned,
        manpowerTrained: deptMp.uniqueTrained,
        plannedHours: deptItems.reduce((s, i) => s + i.plannedHours, 0),
        actualHours: deptItems.reduce((s, i) => s + i.actualHours, 0),
      };
    });

    // Monthly Trend (Jan..Dec)
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
      'Okt',
      'Nov',
      'Des',
    ];
    const monthlyTrend: MonthlyAchievementTrend[] = monthNames.map((label, idx) => {
      const monthStr = String(idx + 1).padStart(2, '0');
      const mItems = items.filter((i) => i.startDate.split('-')[1] === monthStr);
      const plan = mItems.length;
      const realization = mItems.filter((i) => i.statusCategory === 'COMPLETED').length;
      const pending = mItems.filter(
        (i) => i.statusCategory === 'PENDING' || i.statusCategory === 'IN_PROGRESS'
      ).length;
      const cancelled = mItems.filter((i) => i.statusCategory === 'CANCELLED').length;
      const achievementPct =
        plan > 0 ? Math.round((realization / plan) * 1000) / 10 : null;
      const mMp = computeDeduplicatedManpower(mItems);

      return {
        monthIndex: idx + 1,
        monthLabel: label,
        plan,
        realization,
        pending,
        cancelled,
        achievementPct,
        manpowerTrained: mMp.uniqueTrained,
        actualHours: mItems.reduce((s, i) => s + i.actualHours, 0),
      };
    });

    // Training Type Breakdown (100% Dynamic from Master Training Types)
    const typeConfigs: Array<{ type: TrainingType; label: string }> = this.trainingTypes.map(
      (tt) => ({
        type: tt.code,
        label: tt.name,
      })
    );
    // Also include any custom training types used on items that aren't in trainingTypes
    items.forEach((it) => {
      if (it.trainingType && !typeConfigs.some((tc) => tc.type === it.trainingType)) {
        typeConfigs.push({ type: it.trainingType, label: it.trainingType });
      }
    });

    const typeBreakdown = typeConfigs.map((tc) => {
      const tItems = items.filter((i) => i.trainingType === tc.type);
      const plan = tItems.length;
      const realization = tItems.filter((i) => i.statusCategory === 'COMPLETED').length;
      const achievementPct =
        plan > 0 ? Math.round((realization / plan) * 1000) / 10 : null;
      const tMp = computeDeduplicatedManpower(tItems);
      return {
        type: tc.type,
        label: tc.label,
        plan,
        realization,
        achievementPct,
        manpowerTrained: tMp.uniqueTrained,
        actualHours: tItems.reduce((s, i) => s + i.actualHours, 0),
      };
    });

    return {
      totalPlan,
      totalRealization,
      totalInProgress,
      totalPending,
      totalCancelled,
      achievementPercentage,
      totalManpowerPlanned,
      totalManpowerTrained,
      totalAttendanceSessions,
      totalPlannedSessions,
      totalPlannedHours,
      totalTrainingHours,
      departmentBreakdown,
      monthlyTrend,
      typeBreakdown,
      trainingItems: items.sort((a, b) => (a.startDate < b.startDate ? 1 : -1)),
    };
  }

  // ============================================================================
  // RPC: UPDATE TRAINING ACHIEVEMENT / TARGET & REALIZATION CORRECTION
  // Enforces RBAC: Only roles with trainingAchievement === 'EDIT'
  // (SUPER_ADMIN, ADMIN, MANAGER_TC, ADMIN_TC) can edit Achievement data!
  // PJO & ADMIN_HRGA are strictly blocked (View Only on Training Achievement).
  // ============================================================================
  updateTrainingAchievementRecord(
    callerId: string,
    appId: string,
    updates: {
      training_title?: string;
      department_id?: string;
      training_type?: TrainingType;
      proposed_start_date?: string;
      proposed_end_date?: string;
      current_status?: ApplicationStatus;
      planned_participants?: number;
      actual_participants?: number;
      planned_hours?: number;
      actual_hours?: number;
    }
  ) {
    const perms = this.getUserPermissions(callerId);
    if (perms.trainingAchievement !== 'EDIT' || !perms.canEditData) {
      throw new Error(
        'PERMISSION_DENIED: Role Anda hanya memiliki akses View pada fitur Training Achievement.'
      );
    }

    // Handle Sub-Menu Training Achievement items (id starting with "sub-")
    if (appId.startsWith('sub-')) {
      if (!this.technicalTrainingModule.achievementItemOverrides) {
        this.technicalTrainingModule.achievementItemOverrides = {};
      }
      const prevOv = this.technicalTrainingModule.achievementItemOverrides[appId] || {};
      this.technicalTrainingModule.achievementItemOverrides[appId] = {
        ...prevOv,
        ...updates,
        training_title:
          updates.training_title !== undefined
            ? updates.training_title.trim()
            : prevOv.training_title,
        planned_participants:
          updates.planned_participants !== undefined
            ? Math.max(0, Number(updates.planned_participants))
            : prevOv.planned_participants,
        actual_participants:
          updates.actual_participants !== undefined
            ? Math.max(0, Number(updates.actual_participants))
            : prevOv.actual_participants,
        planned_hours:
          updates.planned_hours !== undefined
            ? Math.max(0, Number(updates.planned_hours))
            : prevOv.planned_hours,
        actual_hours:
          updates.actual_hours !== undefined
            ? Math.max(0, Number(updates.actual_hours))
            : prevOv.actual_hours,
      };

      // Two-way sync back to underlying Sub-Menu records where applicable
      if (appId.startsWith('sub-plm-class-')) {
        const rawId = appId.replace('sub-plm-class-', '');
        const plmRow = (this.technicalTrainingModule.plmMonthlyTrainingClasses || []).find(
          (m) => m.id === rawId
        );
        if (plmRow) {
          if (updates.planned_participants !== undefined)
            plmRow.plan = Math.max(0, Number(updates.planned_participants));
          if (updates.actual_participants !== undefined)
            plmRow.actual = Math.max(0, Number(updates.actual_participants));
          if (updates.current_status !== undefined) {
            plmRow.period_status =
              updates.current_status === 'COMPLETED' ? 'FINAL' : 'ON_GOING';
          }
        }
      } else if (appId.startsWith('sub-ojt-')) {
        const rawId = appId.replace('sub-ojt-', '');
        const ojtRow = (this.technicalTrainingModule.ojtBmcRecords || []).find(
          (r) => r.id === rawId
        );
        if (ojtRow) {
          if (updates.actual_participants !== undefined)
            ojtRow.student_count = Math.max(0, Number(updates.actual_participants));
          else if (updates.planned_participants !== undefined)
            ojtRow.student_count = Math.max(0, Number(updates.planned_participants));
          if (updates.current_status !== undefined) {
            ojtRow.ojt_status =
              updates.current_status === 'COMPLETED' ? 'Completed' : 'On Going';
          }
        }
      } else if (appId.startsWith('sub-dta-')) {
        const rawId = appId.replace('sub-dta-', '');
        const dtaRow = (this.technicalTrainingModule.dailyTrainerActivities || []).find(
          (a) => a.id === rawId
        );
        if (dtaRow && updates.current_status !== undefined) {
          dtaRow.remarks = updates.current_status === 'COMPLETED' ? 'Done' : 'Continue';
        }
      }

      this.recalculateKpis(2026);
      this.persistState();
      return null;
    }

    const app = this.applications.find((a) => a.id === appId);
    if (!app) {
      throw new Error('TRAINING_NOT_FOUND: Data training tidak ditemukan.');
    }

    const oldSnapshot = {
      status: app.current_status,
      planned_participants: app.planned_participants,
      actual_participants: app.actual_participants,
      planned_hours: app.planned_hours,
      actual_hours: app.actual_hours,
    };

    if (updates.training_title !== undefined) app.training_title = updates.training_title.trim();
    if (updates.department_id !== undefined) {
      const dept = this.departments.find((d) => d.id === updates.department_id);
      if (dept) {
        app.department_id = dept.id;
        app.department_name = dept.name;
      }
    }
    if (updates.training_type !== undefined) app.training_type = updates.training_type;
    if (updates.proposed_start_date !== undefined)
      app.proposed_start_date = updates.proposed_start_date;
    if (updates.proposed_end_date !== undefined)
      app.proposed_end_date = updates.proposed_end_date;
    if (updates.current_status !== undefined) app.current_status = updates.current_status;
    if (updates.planned_participants !== undefined)
      app.planned_participants = Math.max(0, Number(updates.planned_participants));
    if (updates.actual_participants !== undefined)
      app.actual_participants = Math.max(0, Number(updates.actual_participants));
    if (updates.planned_hours !== undefined)
      app.planned_hours = Math.max(0, Number(updates.planned_hours));
    if (updates.actual_hours !== undefined)
      app.actual_hours = Math.max(0, Number(updates.actual_hours));

    app.updated_at = new Date().toISOString();

    // Synchronize schedule status if schedule exists
    const sched = this.schedules.find((s) => s.application_id === app.id);
    if (sched) {
      if (app.current_status === 'COMPLETED') sched.status = 'COMPLETED';
      else if (app.current_status === 'IN_PROGRESS') sched.status = 'IN_PROGRESS';
      else if (app.current_status === 'CANCELLED' || app.current_status === 'REJECTED')
        sched.status = 'CANCELLED';
      if (updates.planned_hours !== undefined) sched.total_hours = app.planned_hours || 16;
    }

    this.auditLogs.unshift({
      id: crypto.randomUUID(),
      table_name: 'training_applications',
      record_id: app.id,
      action: 'UPDATE_ACHIEVEMENT',
      actor_id: callerId,
      old_values: oldSnapshot,
      new_values: updates,
      created_at: new Date().toISOString(),
    });

    this.recalculateKpis(2026);
    this.persistState();
    return app;
  }

  // ============================================================================
  // RPC: DELETE TRAINING RECORD & DELETE ALL TRAININGS (SUPER ADMIN EXCLUSIVE)
  // ============================================================================
  deleteTrainingApplication(callerId: string, appId: string) {
    const perms = this.getUserPermissions(callerId);
    if (!perms.canDeleteData) {
      throw new Error('PERMISSION_DENIED: Role Anda tidak memiliki izin Delete Data pada matriks RBAC.');
    }

    if (appId.startsWith('sub-')) {
      if (!Array.isArray(this.technicalTrainingModule.deletedAchievementItemIds)) {
        this.technicalTrainingModule.deletedAchievementItemIds = [];
      }
      if (!this.technicalTrainingModule.deletedAchievementItemIds.includes(appId)) {
        this.technicalTrainingModule.deletedAchievementItemIds.push(appId);
      }
      this.recalculateKpis(2026);
      this.persistState();
      return true;
    }

    const index = this.applications.findIndex((a) => a.id === appId);
    if (index === -1) {
      throw new Error('APPLICATION_NOT_FOUND: Data training tidak ditemukan.');
    }

    const removed = this.applications[index];
    this.applications.splice(index, 1);
    this.participants = this.participants.filter((p) => p.application_id !== appId);
    this.schedules = this.schedules.filter((s) => s.application_id !== appId);
    this.records = this.records.filter((r) => r.application_id !== appId);

    this.auditLogs.unshift({
      id: crypto.randomUUID(),
      table_name: 'training_applications',
      record_id: appId,
      action: 'DELETE',
      actor_id: callerId,
      old_values: {
        application_number: removed.application_number,
        training_title: removed.training_title,
      },
      new_values: null,
      created_at: new Date().toISOString(),
    });

    this.recalculateKpis(2026);
    this.persistState();
    return true;
  }

  deleteAllTrainingApplications(callerId: string) {
    const perms = this.getUserPermissions(callerId);
    if (!perms.canDeleteData) {
      throw new Error('PERMISSION_DENIED: Role Anda tidak memiliki izin Delete Data pada matriks RBAC.');
    }

    const removedCount = this.applications.length;
    this.applications = [];
    this.participants = [];
    this.schedules = [];
    this.records = [];
    this.approvalHistory = [];

    this.auditLogs.unshift({
      id: crypto.randomUUID(),
      table_name: 'training_applications',
      record_id: 'ALL_TRAINING_DATA',
      action: 'DELETE_ALL_TRAININGS',
      actor_id: callerId,
      old_values: { total_deleted: removedCount },
      new_values: null,
      created_at: new Date().toISOString(),
    });

    this.recalculateKpis(2026);
    this.persistState();
    return removedCount;
  }

  // ============================================================================
  // RPC: MASTER TRAINING CATEGORY & TRAINING TYPE (ADMIN & SUPER ADMIN EXCLUSIVE)
  // ============================================================================
  private assertAdminOrSuperAdmin(callerId: string) {
    const callerRole = this.getUserRole(callerId);
    if (callerRole !== 'SUPER_ADMIN' && callerRole !== 'ADMIN') {
      throw new Error(
        'PERMISSION_DENIED: Hanya Admin dan Super Admin yang memiliki akses untuk mengelola Master Category & Training Type.'
      );
    }
  }

  addTrainingCategory(
    callerId: string,
    payload: { code: string; name: string; description?: string }
  ): TrainingCategoryOption {
    this.assertAdminOrSuperAdmin(callerId);
    const code = payload.code.trim();
    const name = payload.name.trim();
    if (!code || !name) {
      throw new Error('Kode Category dan Nama Category wajib diisi.');
    }
    if (
      this.trainingCategories.some((c) => c.code.toLowerCase() === code.toLowerCase())
    ) {
      throw new Error(`Category dengan kode "${code}" sudah terdaftar.`);
    }
    const newCat: TrainingCategoryOption = {
      id: `cat-${crypto.randomUUID().slice(0, 8)}`,
      code,
      name,
      description: payload.description?.trim() || '',
    };
    this.trainingCategories.push(newCat);
    this.persistState();
    return newCat;
  }

  updateTrainingCategory(
    callerId: string,
    id: string,
    payload: { code: string; name: string; description?: string }
  ): TrainingCategoryOption {
    this.assertAdminOrSuperAdmin(callerId);
    const cat = this.trainingCategories.find((c) => c.id === id);
    if (!cat) throw new Error('Category tidak ditemukan.');
    const code = payload.code.trim();
    const name = payload.name.trim();
    if (!code || !name) {
      throw new Error('Kode Category dan Nama Category wajib diisi.');
    }
    if (
      this.trainingCategories.some(
        (c) => c.id !== id && c.code.toLowerCase() === code.toLowerCase()
      )
    ) {
      throw new Error(`Kode Category "${code}" sudah digunakan.`);
    }
    const oldCode = cat.code;
    cat.code = code;
    cat.name = name;
    cat.description = payload.description?.trim() || '';

    // Update any applications using the old category code
    if (oldCode !== code) {
      this.applications.forEach((app) => {
        if (app.training_category === oldCode) {
          app.training_category = code;
        }
      });
    }
    this.persistState();
    return cat;
  }

  deleteTrainingCategory(callerId: string, id: string) {
    this.assertAdminOrSuperAdmin(callerId);
    const idx = this.trainingCategories.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Category tidak ditemukan.');
    this.trainingCategories.splice(idx, 1);
    this.persistState();
    return true;
  }

  addTrainingType(
    callerId: string,
    payload: { code: string; name: string; description?: string }
  ): TrainingTypeOption {
    this.assertAdminOrSuperAdmin(callerId);
    const code = payload.code.trim().toUpperCase().replace(/\s+/g, '_');
    const name = payload.name.trim();
    if (!code || !name) {
      throw new Error('Kode Training Type dan Nama Training Type wajib diisi.');
    }
    if (this.trainingTypes.some((t) => t.code.toUpperCase() === code)) {
      throw new Error(`Training Type dengan kode "${code}" sudah terdaftar.`);
    }
    const newType: TrainingTypeOption = {
      id: `type-${crypto.randomUUID().slice(0, 8)}`,
      code,
      name,
      description: payload.description?.trim() || '',
    };
    this.trainingTypes.push(newType);
    this.recalculateKpis(2026);
    this.persistState();
    return newType;
  }

  updateTrainingType(
    callerId: string,
    id: string,
    payload: { code: string; name: string; description?: string }
  ): TrainingTypeOption {
    this.assertAdminOrSuperAdmin(callerId);
    const tObj = this.trainingTypes.find((t) => t.id === id);
    if (!tObj) throw new Error('Training Type tidak ditemukan.');
    const code = payload.code.trim().toUpperCase().replace(/\s+/g, '_');
    const name = payload.name.trim();
    if (!code || !name) {
      throw new Error('Kode Training Type dan Nama Training Type wajib diisi.');
    }
    if (
      this.trainingTypes.some((t) => t.id !== id && t.code.toUpperCase() === code)
    ) {
      throw new Error(`Kode Training Type "${code}" sudah digunakan.`);
    }
    const oldCode = tObj.code;
    tObj.code = code;
    tObj.name = name;
    tObj.description = payload.description?.trim() || '';

    // Update any applications using the old training type code
    if (oldCode !== code) {
      this.applications.forEach((app) => {
        if (app.training_type === oldCode) {
          app.training_type = code;
        }
      });
    }
    this.recalculateKpis(2026);
    this.persistState();
    return tObj;
  }

  deleteTrainingType(callerId: string, id: string) {
    this.assertAdminOrSuperAdmin(callerId);
    const idx = this.trainingTypes.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Training Type tidak ditemukan.');
    this.trainingTypes.splice(idx, 1);
    this.recalculateKpis(2026);
    this.persistState();
    return true;
  }

  // ============================================================================
  // RPC: MANAGE SITES (ADD, EDIT, DELETE)
  // ============================================================================
  private assertCanManageSites(callerId: string) {
    const role = this.getUserRole(callerId);
    const perms = this.getUserPermissions(callerId);
    if (
      !perms.canEditData ||
      perms.employeeData === 'VIEW' ||
      role === 'MANAGER_TC' ||
      role === 'PJO'
    ) {
      throw new Error(
        'PERMISSION_DENIED: Hanya Super Admin, Admin, Admin TC, dan Admin HRGA yang dapat mengelola Master Site.'
      );
    }
  }

  addSite(
    callerId: string,
    payload: { code?: string; name: string; description?: string }
  ): SiteOption {
    this.assertCanManageSites(callerId);
    const name = payload.name.trim();
    if (!name) {
      throw new Error('Nama Site wajib diisi.');
    }
    const rawCode = (payload.code || name.replace(/^site\s+/i, '')).trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_');
    const code = rawCode || `SITE_${this.sites.length + 1}`;

    if (
      this.sites.some(
        (s) => s.name.toLowerCase() === name.toLowerCase() || s.code.toUpperCase() === code
      )
    ) {
      throw new Error(`Site "${name}" atau kode "${code}" sudah terdaftar.`);
    }

    const newSite: SiteOption = {
      id: `site-${crypto.randomUUID().slice(0, 8)}`,
      code,
      name,
      description: payload.description?.trim() || `Area operasional ${name}`,
    };
    this.sites.push(newSite);
    this.persistState();
    return newSite;
  }

  updateSite(
    callerId: string,
    id: string,
    payload: { code?: string; name: string; description?: string }
  ): SiteOption {
    this.assertCanManageSites(callerId);
    const siteObj = this.sites.find((s) => s.id === id);
    if (!siteObj) throw new Error('Site tidak ditemukan.');

    const name = payload.name.trim();
    if (!name) {
      throw new Error('Nama Site wajib diisi.');
    }
    const rawCode = (payload.code || siteObj.code || name.replace(/^site\s+/i, ''))
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_');
    const code = rawCode || siteObj.code;

    if (
      this.sites.some(
        (s) =>
          s.id !== id &&
          (s.name.toLowerCase() === name.toLowerCase() || s.code.toUpperCase() === code)
      )
    ) {
      throw new Error(`Site "${name}" atau kode "${code}" sudah digunakan.`);
    }

    const oldName = siteObj.name;
    siteObj.code = code;
    siteObj.name = name;
    if (payload.description !== undefined) {
      siteObj.description = payload.description.trim();
    }

    // Sinkronisasi nama site pada data karyawan yang menggunakan site lama
    if (oldName !== name) {
      this.employees.forEach((emp) => {
        if (emp.project_site === oldName) {
          emp.project_site = name;
        }
      });
    }

    this.persistState();
    return siteObj;
  }

  deleteSite(callerId: string, id: string) {
    this.assertCanManageSites(callerId);
    const idx = this.sites.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Site tidak ditemukan.');
    this.sites.splice(idx, 1);
    this.persistState();
    return true;
  }

  // ============================================================================
  // RPC: MANAGE PROGRAM TECHNICAL TRAINING (TRAINING ACHIEVEMENT SUB-SIDEBAR)
  // ============================================================================
  private assertCanEditTrainerActivities(callerId: string) {
    const perms = this.getUserPermissions(callerId);
    if (perms.trainingAchievement !== 'EDIT' || !perms.canEditData) {
      throw new Error(
        'PERMISSION_DENIED: Role Anda hanya memiliki akses Lihat (View Only) pada Training Achievement dan tidak dapat mengubah Program Technical Training.'
      );
    }
  }

  addTrainerActivitySection(
    callerId: string,
    payload: {
      year?: string;
      month?: string;
      week_number?: number;
      period_label?: string;
      badge_label?: string;
      title: string;
      items?: string[];
    }
  ): TrainerActivitySection {
    this.assertCanEditTrainerActivities(callerId);
    const title = payload.title.trim();
    if (!title) throw new Error('Judul bagian aktivitas wajib diisi.');
    const actor = this.users.find((u) => u.id === callerId);

    const year = payload.year || '2026';
    const month = payload.month || '11';
    const weekNumber = payload.week_number || 1;

    const sectionItems: TrainerActivityItem[] = (payload.items || [])
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => ({
        id: `act-item-${crypto.randomUUID().slice(0, 8)}`,
        content: c,
        updated_at: new Date().toISOString(),
      }));

    const newSection: TrainerActivitySection = {
      id: `trainer-sec-${crypto.randomUUID().slice(0, 8)}`,
      year,
      month,
      week_number: weekNumber,
      period_label: payload.period_label || `Minggu Ke-${weekNumber}`,
      badge_label: (payload.badge_label || 'TRAINING').trim().toUpperCase(),
      title,
      items: sectionItems,
      updated_at: new Date().toISOString(),
      updated_by: actor?.role_name || actor?.full_name || 'Admin',
    };

    this.trainerActivities.push(newSection);
    this.persistState();
    return newSection;
  }

  saveWeeklyTrainerReport(
    callerId: string,
    payload: {
      year: string;
      month: string;
      week_number: number;
      period_label?: string;
      badge_label: string;
      title: string;
      items: string[];
    }
  ): TrainerActivitySection {
    this.assertCanEditTrainerActivities(callerId);
    const actor = this.users.find((u) => u.id === callerId);
    const cleanItems: TrainerActivityItem[] = payload.items
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => ({
        id: `act-item-${crypto.randomUUID().slice(0, 8)}`,
        content: c,
        updated_at: new Date().toISOString(),
      }));

    const existing = this.trainerActivities.find(
      (s) =>
        (s.year || '2026') === payload.year &&
        (s.month || '11') === payload.month &&
        (s.week_number || 1) === payload.week_number
    );

    if (existing) {
      existing.badge_label = (payload.badge_label || 'TRAINING').trim().toUpperCase();
      existing.title = payload.title.trim() || '1. Program Technical Training';
      existing.period_label =
        payload.period_label || `Minggu Ke-${payload.week_number}`;
      existing.items = cleanItems;
      existing.updated_at = new Date().toISOString();
      existing.updated_by = actor?.role_name || actor?.full_name || 'Admin';
      this.persistState();
      return existing;
    }

    const created: TrainerActivitySection = {
      id: `trainer-sec-${crypto.randomUUID().slice(0, 8)}`,
      year: payload.year,
      month: payload.month,
      week_number: payload.week_number,
      period_label: payload.period_label || `Minggu Ke-${payload.week_number}`,
      badge_label: (payload.badge_label || 'TRAINING').trim().toUpperCase(),
      title: payload.title.trim() || '1. Program Technical Training',
      items: cleanItems,
      updated_at: new Date().toISOString(),
      updated_by: actor?.role_name || actor?.full_name || 'Admin',
    };
    this.trainerActivities.push(created);
    this.persistState();
    return created;
  }

  updateTrainerActivitySection(
    callerId: string,
    sectionId: string,
    payload: {
      badge_label?: string;
      title: string;
      year?: string;
      month?: string;
      week_number?: number;
      period_label?: string;
    }
  ): TrainerActivitySection {
    this.assertCanEditTrainerActivities(callerId);
    const sec = this.trainerActivities.find((s) => s.id === sectionId);
    if (!sec) throw new Error('Bagian aktivitas tidak ditemukan.');

    const title = payload.title.trim();
    if (!title) throw new Error('Judul bagian aktivitas wajib diisi.');
    const actor = this.users.find((u) => u.id === callerId);

    if (payload.badge_label !== undefined) {
      sec.badge_label = payload.badge_label.trim().toUpperCase() || 'TRAINING';
    }
    if (payload.year !== undefined) sec.year = payload.year;
    if (payload.month !== undefined) sec.month = payload.month;
    if (payload.week_number !== undefined) sec.week_number = payload.week_number;
    if (payload.period_label !== undefined) sec.period_label = payload.period_label;
    sec.title = title;
    sec.updated_at = new Date().toISOString();
    sec.updated_by = actor?.role_name || actor?.full_name || 'Admin';

    this.persistState();
    return sec;
  }

  deleteTrainerActivitySection(callerId: string, sectionId: string) {
    this.assertCanEditTrainerActivities(callerId);
    const idx = this.trainerActivities.findIndex((s) => s.id === sectionId);
    if (idx === -1) throw new Error('Bagian aktivitas tidak ditemukan.');
    this.trainerActivities.splice(idx, 1);
    this.persistState();
    return true;
  }

  addTrainerActivityItem(
    callerId: string,
    sectionId: string,
    content: string
  ): TrainerActivityItem {
    this.assertCanEditTrainerActivities(callerId);
    const sec = this.trainerActivities.find((s) => s.id === sectionId);
    if (!sec) throw new Error('Bagian aktivitas tidak ditemukan.');

    const cleanContent = content.trim();
    if (!cleanContent) throw new Error('Isi poin aktivitas wajib diisi.');
    const actor = this.users.find((u) => u.id === callerId);

    const newItem: TrainerActivityItem = {
      id: `act-item-${crypto.randomUUID().slice(0, 8)}`,
      content: cleanContent,
      updated_at: new Date().toISOString(),
    };

    sec.items.push(newItem);
    sec.updated_at = new Date().toISOString();
    sec.updated_by = actor?.role_name || actor?.full_name || 'Admin';
    this.persistState();
    return newItem;
  }

  updateTrainerActivityItem(
    callerId: string,
    sectionId: string,
    itemId: string,
    content: string
  ): TrainerActivityItem {
    this.assertCanEditTrainerActivities(callerId);
    const sec = this.trainerActivities.find((s) => s.id === sectionId);
    if (!sec) throw new Error('Bagian aktivitas tidak ditemukan.');

    const item = sec.items.find((i) => i.id === itemId);
    if (!item) throw new Error('Poin aktivitas tidak ditemukan.');

    const cleanContent = content.trim();
    if (!cleanContent) throw new Error('Isi poin aktivitas tidak boleh kosong.');
    const actor = this.users.find((u) => u.id === callerId);

    item.content = cleanContent;
    item.updated_at = new Date().toISOString();
    sec.updated_at = new Date().toISOString();
    sec.updated_by = actor?.role_name || actor?.full_name || 'Admin';
    this.persistState();
    return item;
  }

  deleteTrainerActivityItem(callerId: string, sectionId: string, itemId: string) {
    this.assertCanEditTrainerActivities(callerId);
    const sec = this.trainerActivities.find((s) => s.id === sectionId);
    if (!sec) throw new Error('Bagian aktivitas tidak ditemukan.');

    const idx = sec.items.findIndex((i) => i.id === itemId);
    if (idx === -1) throw new Error('Poin aktivitas tidak ditemukan.');
    const actor = this.users.find((u) => u.id === callerId);

    sec.items.splice(idx, 1);
    sec.updated_at = new Date().toISOString();
    sec.updated_by = actor?.role_name || actor?.full_name || 'Admin';
    this.persistState();
    return true;
  }

  // ============================================================================
  // RPC: PROGRAM TECHNICAL TRAINING — FULL MODULE CRUD & REAL-TIME METRICS
  // ============================================================================
  private recordTechnicalModuleAudit(
    callerId: string,
    tableName: string,
    recordId: string,
    action: string,
    oldValues: any,
    newValues: any
  ) {
    const actor = this.users.find((u) => u.id === callerId);
    const now = new Date().toISOString();
    this.technicalTrainingModule.updated_at = now;
    this.technicalTrainingModule.updated_by =
      actor?.role_name || actor?.full_name || 'Admin';

    this.auditLogs.unshift({
      id: crypto.randomUUID(),
      table_name: tableName,
      record_id: recordId,
      action,
      actor_id: callerId,
      actor_name: actor?.role_name || actor?.full_name || 'Admin',
      old_values: oldValues,
      new_values: newValues,
      created_at: now,
    });
  }

  // A. Training Class & Competency GAP Programs
  saveTechnicalTrainingClassProgram(
    callerId: string,
    payload: Omit<TechnicalTrainingClassProgram, 'id' | 'created_at' | 'updated_at'> & {
      id?: string;
    }
  ): TechnicalTrainingClassProgram {
    this.assertCanEditTrainerActivities(callerId);
    const actor = this.users.find((u) => u.id === callerId);
    const now = new Date().toISOString();
    const list = this.technicalTrainingModule.trainingClassPrograms;

    if (payload.id) {
      const existing = list.find((p) => p.id === payload.id);
      if (existing) {
        const oldSnap = { ...existing };
        existing.program_name = payload.program_name.trim();
        existing.department_area = payload.department_area.trim();
        existing.target_participants = Math.max(0, Number(payload.target_participants));
        existing.actual_participants = Math.max(0, Number(payload.actual_participants));
        existing.execution_period = payload.execution_period.trim();
        existing.status = payload.status;
        existing.remarks = payload.remarks.trim();
        existing.updated_at = now;
        existing.updated_by = actor?.role_name || actor?.full_name || 'Admin';

        this.recordTechnicalModuleAudit(
          callerId,
          'technical_training_programs',
          existing.id,
          'UPDATE',
          oldSnap,
          existing
        );
        this.persistState();
        return existing;
      }
    }

    const created: TechnicalTrainingClassProgram = {
      id: `ttc-prog-${crypto.randomUUID().slice(0, 8)}`,
      program_name: payload.program_name.trim(),
      department_area: payload.department_area.trim(),
      target_participants: Math.max(0, Number(payload.target_participants)),
      actual_participants: Math.max(0, Number(payload.actual_participants)),
      execution_period: payload.execution_period.trim(),
      status: payload.status,
      remarks: payload.remarks.trim(),
      created_at: now,
      updated_at: now,
      updated_by: actor?.role_name || actor?.full_name || 'Admin',
    };
    list.push(created);
    this.recordTechnicalModuleAudit(
      callerId,
      'technical_training_programs',
      created.id,
      'INSERT',
      null,
      created
    );
    this.persistState();
    return created;
  }

  deleteTechnicalTrainingClassProgram(callerId: string, id: string) {
    this.assertCanEditTrainerActivities(callerId);
    const list = this.technicalTrainingModule.trainingClassPrograms;
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Data program tidak ditemukan.');
    const removed = list[idx];
    list.splice(idx, 1);
    this.recordTechnicalModuleAudit(
      callerId,
      'technical_training_programs',
      id,
      'DELETE',
      removed,
      null
    );
    this.persistState();
    return true;
  }

  // B. Interview Candidate Mechanic Summary & Recap Table (Slide 2)
  updateInterviewCandidateSummary(
    callerId: string,
    payload: Partial<InterviewCandidateSummaryConfig>
  ): InterviewCandidateSummaryConfig {
    this.assertCanEditTrainerActivities(callerId);
    const actor = this.users.find((u) => u.id === callerId);
    const now = new Date().toISOString();
    const oldSnap = { ...this.technicalTrainingModule.interviewSummary };

    this.technicalTrainingModule.interviewSummary = {
      ...this.technicalTrainingModule.interviewSummary,
      ...payload,
      updated_at: now,
      updated_by: actor?.role_name || actor?.full_name || 'Admin',
    };

    this.recordTechnicalModuleAudit(
      callerId,
      'interview_candidate_summary',
      'SUMMARY_CONFIG',
      'UPDATE',
      oldSnap,
      this.technicalTrainingModule.interviewSummary
    );
    this.persistState();
    return this.technicalTrainingModule.interviewSummary;
  }

  saveCandidatePositionRecapRow(
    callerId: string,
    payload: Omit<CandidateMechanicPositionRow, 'id' | 'no' | 'created_at' | 'updated_at'> & {
      id?: string;
    }
  ): CandidateMechanicPositionRow {
    this.assertCanEditTrainerActivities(callerId);
    const actor = this.users.find((u) => u.id === callerId);
    const now = new Date().toISOString();
    const list = this.technicalTrainingModule.candidatePositionRecap;

    if (payload.id) {
      const existing = list.find((r) => r.id === payload.id);
      if (existing) {
        const oldSnap = { ...existing };
        existing.candidate_position = payload.candidate_position.trim();
        existing.total_masuk = Math.max(0, Number(payload.total_masuk));
        existing.sudah_itv = Math.max(0, Number(payload.sudah_itv));
        existing.recommended_m3_up = Math.max(0, Number(payload.recommended_m3_up));
        existing.site_tangofa = Math.max(0, Number(payload.site_tangofa));
        existing.site_tpm = Math.max(0, Number(payload.site_tpm));
        existing.remark = (payload.remark || '').trim();
        existing.updated_at = now;
        existing.updated_by = actor?.role_name || actor?.full_name || 'Admin';

        // Sync headline done_count automatically from sum of sudah_itv
        const totalItv = list.reduce((s, r) => s + r.sudah_itv, 0);
        this.technicalTrainingModule.interviewSummary.done_count = totalItv;
        this.technicalTrainingModule.interviewSummary.headline_label = `Update interview candidate crew PLM al : ${totalItv}x Done`;

        this.recordTechnicalModuleAudit(
          callerId,
          'candidate_position_recap',
          existing.id,
          'UPDATE',
          oldSnap,
          existing
        );
        this.persistState();
        return existing;
      }
    }

    const created: CandidateMechanicPositionRow = {
      id: `cand-pos-${crypto.randomUUID().slice(0, 8)}`,
      no: list.length + 1,
      candidate_position: payload.candidate_position.trim(),
      total_masuk: Math.max(0, Number(payload.total_masuk)),
      sudah_itv: Math.max(0, Number(payload.sudah_itv)),
      recommended_m3_up: Math.max(0, Number(payload.recommended_m3_up)),
      site_tangofa: Math.max(0, Number(payload.site_tangofa)),
      site_tpm: Math.max(0, Number(payload.site_tpm)),
      remark: (payload.remark || '').trim(),
      created_at: now,
      updated_at: now,
      updated_by: actor?.role_name || actor?.full_name || 'Admin',
    };
    list.push(created);

    const totalItv = list.reduce((s, r) => s + r.sudah_itv, 0);
    this.technicalTrainingModule.interviewSummary.done_count = totalItv;
    this.technicalTrainingModule.interviewSummary.headline_label = `Update interview candidate crew PLM al : ${totalItv}x Done`;

    this.recordTechnicalModuleAudit(
      callerId,
      'candidate_position_recap',
      created.id,
      'INSERT',
      null,
      created
    );
    this.persistState();
    return created;
  }

  deleteCandidatePositionRecapRow(callerId: string, id: string) {
    this.assertCanEditTrainerActivities(callerId);
    const list = this.technicalTrainingModule.candidatePositionRecap;
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Baris posisi kandidat tidak ditemukan.');
    const removed = list[idx];
    list.splice(idx, 1);
    list.forEach((r, i) => {
      r.no = i + 1;
    });
    const totalItv = list.reduce((s, r) => s + r.sudah_itv, 0);
    this.technicalTrainingModule.interviewSummary.done_count = totalItv;
    this.technicalTrainingModule.interviewSummary.headline_label = `Update interview candidate crew PLM al : ${totalItv}x Done`;

    this.recordTechnicalModuleAudit(
      callerId,
      'candidate_position_recap',
      id,
      'DELETE',
      removed,
      null
    );
    this.persistState();
    return true;
  }

  // C. Assessment Candidate Mechanic (Individual Candidate Records)
  saveCandidateAssessmentRecord(
    callerId: string,
    payload: Omit<CandidateMechanicAssessmentRecord, 'id' | 'created_at' | 'updated_at'> & {
      id?: string;
    }
  ): CandidateMechanicAssessmentRecord {
    this.assertCanEditTrainerActivities(callerId);
    const actor = this.users.find((u) => u.id === callerId);
    const now = new Date().toISOString();
    const list = this.technicalTrainingModule.candidateAssessments;

    if (payload.id) {
      const existing = list.find((c) => c.id === payload.id);
      if (existing) {
        const oldSnap = { ...existing };
        existing.candidate_name = payload.candidate_name.trim();
        existing.nik = payload.nik.trim();
        existing.department = payload.department.trim();
        existing.current_position = payload.current_position.trim();
        existing.target_position = payload.target_position.trim();
        existing.site_location = payload.site_location || 'Site Tangofa';
        existing.assessment_date = payload.assessment_date;
        existing.assessor = payload.assessor.trim();
        existing.assessment_result = payload.assessment_result.trim();
        existing.status = payload.status;
        existing.assessor_notes = (payload.assessor_notes || '').trim();
        existing.updated_at = now;
        existing.updated_by = actor?.role_name || actor?.full_name || 'Admin';

        this.recordTechnicalModuleAudit(
          callerId,
          'assessment_candidate_mechanic',
          existing.id,
          'UPDATE',
          oldSnap,
          existing
        );
        this.persistState();
        return existing;
      }
    }

    const created: CandidateMechanicAssessmentRecord = {
      id: `cma-${crypto.randomUUID().slice(0, 8)}`,
      candidate_name: payload.candidate_name.trim(),
      nik: payload.nik.trim(),
      department: payload.department.trim(),
      current_position: payload.current_position.trim(),
      target_position: payload.target_position.trim(),
      site_location: payload.site_location || 'Site Tangofa',
      assessment_date: payload.assessment_date,
      assessor: payload.assessor.trim(),
      assessment_result: payload.assessment_result.trim(),
      status: payload.status,
      assessor_notes: (payload.assessor_notes || '').trim(),
      created_at: now,
      updated_at: now,
      updated_by: actor?.role_name || actor?.full_name || 'Admin',
    };
    list.unshift(created);
    this.recordTechnicalModuleAudit(
      callerId,
      'assessment_candidate_mechanic',
      created.id,
      'INSERT',
      null,
      created
    );
    this.persistState();
    return created;
  }

  deleteCandidateAssessmentRecord(callerId: string, id: string) {
    this.assertCanEditTrainerActivities(callerId);
    const list = this.technicalTrainingModule.candidateAssessments;
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Data kandidat assessment tidak ditemukan.');
    const removed = list[idx];
    list.splice(idx, 1);
    this.recordTechnicalModuleAudit(
      callerId,
      'assessment_candidate_mechanic',
      id,
      'DELETE',
      removed,
      null
    );
    this.persistState();
    return true;
  }

  // D. Monitoring OJT BMC
  saveOjtBmcRecord(
    callerId: string,
    payload: Omit<OjtBmcMonitoringRecord, 'id' | 'created_at' | 'updated_at'> & {
      id?: string;
    }
  ): OjtBmcMonitoringRecord {
    this.assertCanEditTrainerActivities(callerId);
    const actor = this.users.find((u) => u.id === callerId);
    const now = new Date().toISOString();
    const list = this.technicalTrainingModule.ojtBmcRecords;

    if (payload.id) {
      const existing = list.find((o) => o.id === payload.id);
      if (existing) {
        const oldSnap = { ...existing };
        existing.student_name = payload.student_name.trim();
        existing.batch = payload.batch.trim();
        existing.department_placement = payload.department_placement.trim();
        existing.location = payload.location.trim();
        existing.student_count = Math.max(1, Number(payload.student_count));
        existing.ojt_period = payload.ojt_period.trim();
        existing.mentor_name = payload.mentor_name.trim();
        existing.ojt_status = payload.ojt_status;
        existing.ojt_evaluation = (payload.ojt_evaluation || '').trim();
        existing.updated_at = now;
        existing.updated_by = actor?.role_name || actor?.full_name || 'Admin';

        this.recordTechnicalModuleAudit(
          callerId,
          'ojt_bmc_monitoring',
          existing.id,
          'UPDATE',
          oldSnap,
          existing
        );
        this.persistState();
        return existing;
      }
    }

    const created: OjtBmcMonitoringRecord = {
      id: `ojt-bmc-${crypto.randomUUID().slice(0, 8)}`,
      student_name: payload.student_name.trim(),
      batch: payload.batch.trim(),
      department_placement: payload.department_placement.trim(),
      location: payload.location.trim(),
      student_count: Math.max(1, Number(payload.student_count)),
      ojt_period: payload.ojt_period.trim(),
      mentor_name: payload.mentor_name.trim(),
      ojt_status: payload.ojt_status,
      ojt_evaluation: (payload.ojt_evaluation || '').trim(),
      created_at: now,
      updated_at: now,
      updated_by: actor?.role_name || actor?.full_name || 'Admin',
    };
    list.push(created);
    this.recordTechnicalModuleAudit(
      callerId,
      'ojt_bmc_monitoring',
      created.id,
      'INSERT',
      null,
      created
    );
    this.persistState();
    return created;
  }

  deleteOjtBmcRecord(callerId: string, id: string) {
    this.assertCanEditTrainerActivities(callerId);
    const list = this.technicalTrainingModule.ojtBmcRecords;
    const idx = list.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error('Data Monitoring OJT BMC tidak ditemukan.');
    const removed = list[idx];
    list.splice(idx, 1);
    this.recordTechnicalModuleAudit(
      callerId,
      'ojt_bmc_monitoring',
      id,
      'DELETE',
      removed,
      null
    );
    this.persistState();
    return true;
  }

  // E. Sharing Session BMC Batch VII
  saveSharingSessionBmcRecord(
    callerId: string,
    payload: Omit<SharingSessionBmcRecord, 'id' | 'created_at' | 'updated_at'> & {
      id?: string;
    }
  ): SharingSessionBmcRecord {
    this.assertCanEditTrainerActivities(callerId);
    const actor = this.users.find((u) => u.id === callerId);
    const now = new Date().toISOString();
    const list = this.technicalTrainingModule.sharingSessionRecords;

    if (payload.id) {
      const existing = list.find((s) => s.id === payload.id);
      if (existing) {
        const oldSnap = { ...existing };
        existing.session_title = payload.session_title.trim();
        existing.batch = payload.batch.trim();
        existing.schedule_date = payload.schedule_date;
        existing.location = payload.location.trim();
        existing.instructor_name = payload.instructor_name.trim();
        existing.target_participants = Math.max(0, Number(payload.target_participants));
        existing.actual_attendance = Math.max(0, Number(payload.actual_attendance));
        existing.execution_status = payload.execution_status;
        existing.documentation_notes = (payload.documentation_notes || '').trim();
        existing.updated_at = now;
        existing.updated_by = actor?.role_name || actor?.full_name || 'Admin';

        this.recordTechnicalModuleAudit(
          callerId,
          'sharing_session_bmc',
          existing.id,
          'UPDATE',
          oldSnap,
          existing
        );
        this.persistState();
        return existing;
      }
    }

    const created: SharingSessionBmcRecord = {
      id: `share-bmc-${crypto.randomUUID().slice(0, 8)}`,
      session_title: payload.session_title.trim(),
      batch: payload.batch.trim(),
      schedule_date: payload.schedule_date,
      location: payload.location.trim(),
      instructor_name: payload.instructor_name.trim(),
      target_participants: Math.max(0, Number(payload.target_participants)),
      actual_attendance: Math.max(0, Number(payload.actual_attendance)),
      execution_status: payload.execution_status,
      documentation_notes: (payload.documentation_notes || '').trim(),
      created_at: now,
      updated_at: now,
      updated_by: actor?.role_name || actor?.full_name || 'Admin',
    };
    list.push(created);
    this.recordTechnicalModuleAudit(
      callerId,
      'sharing_session_bmc',
      created.id,
      'INSERT',
      null,
      created
    );
    this.persistState();
    return created;
  }

  deleteSharingSessionBmcRecord(callerId: string, id: string) {
    this.assertCanEditTrainerActivities(callerId);
    const list = this.technicalTrainingModule.sharingSessionRecords;
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Data Sharing Session BMC tidak ditemukan.');
    const removed = list[idx];
    list.splice(idx, 1);
    this.recordTechnicalModuleAudit(
      callerId,
      'sharing_session_bmc',
      id,
      'DELETE',
      removed,
      null
    );
    this.persistState();
    return true;
  }

  // 3. Resume Assessment Crew Mechanic PLM 2026 (Categories & 17 Competency GAP Rows)
  savePlmAssessmentCategory(
    callerId: string,
    payload: Omit<PlmAssessmentCategoryItem, 'id' | 'updated_at'> & { id?: string }
  ): PlmAssessmentCategoryItem {
    this.assertCanEditTrainerActivities(callerId);
    const actor = this.users.find((u) => u.id === callerId);
    const now = new Date().toISOString();
    const list = this.technicalTrainingModule.plmAssessmentCategories;

    if (payload.id) {
      const existing = list.find((c) => c.id === payload.id);
      if (existing) {
        const oldSnap = { ...existing };
        existing.category_name = payload.category_name.trim();
        existing.class_count = Math.max(0, Number(payload.class_count));
        existing.period_year = payload.period_year || '2026';
        existing.description = (payload.description || '').trim();
        existing.updated_at = now;
        existing.updated_by = actor?.role_name || actor?.full_name || 'Admin';

        this.recordTechnicalModuleAudit(
          callerId,
          'plm_assessment_categories',
          existing.id,
          'UPDATE',
          oldSnap,
          existing
        );
        this.persistState();
        return existing;
      }
    }

    const created: PlmAssessmentCategoryItem = {
      id: `plm-cat-${crypto.randomUUID().slice(0, 8)}`,
      category_name: payload.category_name.trim(),
      class_count: Math.max(0, Number(payload.class_count)),
      period_year: payload.period_year || '2026',
      description: (payload.description || '').trim(),
      updated_at: now,
      updated_by: actor?.role_name || actor?.full_name || 'Admin',
    };
    list.push(created);
    this.recordTechnicalModuleAudit(
      callerId,
      'plm_assessment_categories',
      created.id,
      'INSERT',
      null,
      created
    );
    this.persistState();
    return created;
  }

  deletePlmAssessmentCategory(callerId: string, id: string) {
    this.assertCanEditTrainerActivities(callerId);
    const list = this.technicalTrainingModule.plmAssessmentCategories;
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Kategori assessment tidak ditemukan.');
    const removed = list[idx];
    list.splice(idx, 1);
    this.recordTechnicalModuleAudit(
      callerId,
      'plm_assessment_categories',
      id,
      'DELETE',
      removed,
      null
    );
    this.persistState();
    return true;
  }

  savePlmCompetencyGapRow(
    callerId: string,
    payload: Omit<PlmCompetencyGapRow, 'id' | 'no' | 'updated_at'> & { id?: string }
  ): PlmCompetencyGapRow {
    this.assertCanEditTrainerActivities(callerId);
    const actor = this.users.find((u) => u.id === callerId);
    const now = new Date().toISOString();
    const list = this.technicalTrainingModule.plmCompetencyGapRows;

    if (payload.id) {
      const existing = list.find((r) => r.id === payload.id);
      if (existing) {
        const oldSnap = { ...existing };
        existing.code = payload.code.trim().toUpperCase();
        existing.training_name = payload.training_name.trim();
        existing.gap_all = Math.max(0, Number(payload.gap_all));
        existing.mechanic_tangofa = Math.max(0, Number(payload.mechanic_tangofa));
        existing.mechanic_genba = Math.max(0, Number(payload.mechanic_genba));
        existing.all_gl = Math.max(0, Number(payload.all_gl));
        existing.fgdp_gldp = Math.max(0, Number(payload.fgdp_gldp));
        existing.fill_gap = Math.max(0, Number(payload.fill_gap));
        existing.period_year = payload.period_year || '2026';
        existing.updated_at = now;
        existing.updated_by = actor?.role_name || actor?.full_name || 'Admin';

        this.recordTechnicalModuleAudit(
          callerId,
          'plm_competency_gap_rows',
          existing.id,
          'UPDATE',
          oldSnap,
          existing
        );
        this.persistState();
        return existing;
      }
    }

    const created: PlmCompetencyGapRow = {
      id: `gap-row-${crypto.randomUUID().slice(0, 8)}`,
      no: list.length + 1,
      code: payload.code.trim().toUpperCase(),
      training_name: payload.training_name.trim(),
      gap_all: Math.max(0, Number(payload.gap_all)),
      mechanic_tangofa: Math.max(0, Number(payload.mechanic_tangofa)),
      mechanic_genba: Math.max(0, Number(payload.mechanic_genba)),
      all_gl: Math.max(0, Number(payload.all_gl)),
      fgdp_gldp: Math.max(0, Number(payload.fgdp_gldp)),
      fill_gap: Math.max(0, Number(payload.fill_gap)),
      period_year: payload.period_year || '2026',
      updated_at: now,
      updated_by: actor?.role_name || actor?.full_name || 'Admin',
    };
    list.push(created);
    this.recordTechnicalModuleAudit(
      callerId,
      'plm_competency_gap_rows',
      created.id,
      'INSERT',
      null,
      created
    );
    this.persistState();
    return created;
  }

  deletePlmCompetencyGapRow(callerId: string, id: string) {
    this.assertCanEditTrainerActivities(callerId);
    const list = this.technicalTrainingModule.plmCompetencyGapRows;
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Baris jenis training GAP tidak ditemukan.');
    const removed = list[idx];
    list.splice(idx, 1);
    list.forEach((r, i) => {
      r.no = i + 1;
    });
    this.recordTechnicalModuleAudit(
      callerId,
      'plm_competency_gap_rows',
      id,
      'DELETE',
      removed,
      null
    );
    this.persistState();
    return true;
  }

  // 4. Resume Training Class Crew Mechanic PLM 2026 (Monthly Plan vs Actual & Corrective Actions)
  savePlmMonthlyTrainingClass(
    callerId: string,
    payload: Omit<PlmTrainingClassMonthlyItem, 'id' | 'updated_at'> & {
      id?: string;
      finalizePreviousOngoing?: boolean;
    }
  ): PlmTrainingClassMonthlyItem {
    this.assertCanEditTrainerActivities(callerId);
    const actor = this.users.find((u) => u.id === callerId);
    const now = new Date().toISOString();
    const list = this.technicalTrainingModule.plmMonthlyTrainingClasses;

    const targetId =
      payload.id ||
      list.find(
        (m) =>
          m.month_index === Number(payload.month_index) &&
          (m.year || '2026') === (payload.year || '2026')
      )?.id;

    if (payload.finalizePreviousOngoing && payload.period_status === 'ON_GOING') {
      list.forEach((m) => {
        if (m.id !== targetId && m.period_status === 'ON_GOING') {
          m.period_status = 'FINAL';
          m.updated_at = now;
          m.updated_by = actor?.role_name || actor?.full_name || 'Admin';
        }
      });
    }

    if (targetId) {
      const existing = list.find((m) => m.id === targetId);
      if (existing) {
        const oldSnap = { ...existing };
        existing.month_index = Number(payload.month_index);
        existing.month_name = payload.month_name.trim();
        existing.year = payload.year || '2026';
        existing.plan = Math.max(0, Number(payload.plan));
        existing.actual = Math.max(0, Number(payload.actual));
        existing.frequency_plan = Math.max(0, Number(payload.frequency_plan));
        existing.frequency_actual = Math.max(0, Number(payload.frequency_actual));
        existing.period_status = payload.period_status;
        existing.notes = (payload.notes || '').trim();
        existing.updated_at = now;
        existing.updated_by = actor?.role_name || actor?.full_name || 'Admin';

        list.sort(
          (a, b) =>
            Number(a.year || 2026) - Number(b.year || 2026) ||
            a.month_index - b.month_index
        );

        this.recordTechnicalModuleAudit(
          callerId,
          'plm_monthly_training_classes',
          existing.id,
          'UPDATE',
          oldSnap,
          existing
        );
        this.persistState();
        return existing;
      }
    }

    const created: PlmTrainingClassMonthlyItem = {
      id: `plm-month-${crypto.randomUUID().slice(0, 8)}`,
      month_index: Number(payload.month_index),
      month_name: payload.month_name.trim(),
      year: payload.year || '2026',
      plan: Math.max(0, Number(payload.plan)),
      actual: Math.max(0, Number(payload.actual)),
      frequency_plan: Math.max(0, Number(payload.frequency_plan)),
      frequency_actual: Math.max(0, Number(payload.frequency_actual)),
      period_status: payload.period_status,
      notes: (payload.notes || '').trim(),
      updated_at: now,
      updated_by: actor?.role_name || actor?.full_name || 'Admin',
    };
    list.push(created);
    list.sort(
      (a, b) =>
        Number(a.year || 2026) - Number(b.year || 2026) ||
        a.month_index - b.month_index
    );
    this.recordTechnicalModuleAudit(
      callerId,
      'plm_monthly_training_classes',
      created.id,
      'INSERT',
      null,
      created
    );
    this.persistState();
    return created;
  }

  deletePlmMonthlyTrainingClass(callerId: string, id: string) {
    this.assertCanEditTrainerActivities(callerId);
    const list = this.technicalTrainingModule.plmMonthlyTrainingClasses;
    const idx = list.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error('Data bulanan Training Class tidak ditemukan.');
    const removed = list[idx];
    list.splice(idx, 1);
    this.recordTechnicalModuleAudit(
      callerId,
      'plm_monthly_training_classes',
      id,
      'DELETE',
      removed,
      null
    );
    this.persistState();
    return true;
  }

  savePlmCorrectiveAction(
    callerId: string,
    payload: Omit<PlmTrainingCorrectiveAction, 'id' | 'no' | 'updated_at'> & { id?: string }
  ): PlmTrainingCorrectiveAction {
    this.assertCanEditTrainerActivities(callerId);
    const actor = this.users.find((u) => u.id === callerId);
    const now = new Date().toISOString();
    const list = this.technicalTrainingModule.plmCorrectiveActions;

    if (payload.id) {
      const existing = list.find((c) => c.id === payload.id);
      if (existing) {
        const oldSnap = { ...existing };
        existing.section_type = payload.section_type;
        existing.description = payload.description.trim();
        existing.pic = (payload.pic || '').trim();
        existing.due_date = (payload.due_date || '').trim();
        existing.updated_at = now;
        existing.updated_by = actor?.role_name || actor?.full_name || 'Admin';

        this.recordTechnicalModuleAudit(
          callerId,
          'plm_corrective_actions',
          existing.id,
          'UPDATE',
          oldSnap,
          existing
        );
        this.persistState();
        return existing;
      }
    }

    const sameTypeCount = list.filter((c) => c.section_type === payload.section_type).length;
    const created: PlmTrainingCorrectiveAction = {
      id: `pca-${crypto.randomUUID().slice(0, 8)}`,
      section_type: payload.section_type,
      no: sameTypeCount + 1,
      description: payload.description.trim(),
      pic: (payload.pic || '').trim(),
      due_date: (payload.due_date || '').trim(),
      updated_at: now,
      updated_by: actor?.role_name || actor?.full_name || 'Admin',
    };
    list.push(created);
    this.recordTechnicalModuleAudit(
      callerId,
      'plm_corrective_actions',
      created.id,
      'INSERT',
      null,
      created
    );
    this.persistState();
    return created;
  }

  deletePlmCorrectiveAction(callerId: string, id: string) {
    this.assertCanEditTrainerActivities(callerId);
    const list = this.technicalTrainingModule.plmCorrectiveActions;
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Item evaluasi/corrective action tidak ditemukan.');
    const removed = list[idx];
    list.splice(idx, 1);
    this.recordTechnicalModuleAudit(
      callerId,
      'plm_corrective_actions',
      id,
      'DELETE',
      removed,
      null
    );
    this.persistState();
    return true;
  }

  // 5. Activity Technical Training — OTHER DAILY ACTIVITAS TECHNICAL TRAINER
  saveDailyTrainerActivity(
    callerId: string,
    payload: Omit<TechnicalTrainerDailyActivityItem, 'id' | 'no' | 'updated_at'> & {
      id?: string;
    }
  ): TechnicalTrainerDailyActivityItem {
    this.assertCanEditTrainerActivities(callerId);
    const actor = this.users.find((u) => u.id === callerId);
    const now = new Date().toISOString();
    if (!Array.isArray(this.technicalTrainingModule.dailyTrainerActivities)) {
      this.technicalTrainingModule.dailyTrainerActivities = [];
    }
    const list = this.technicalTrainingModule.dailyTrainerActivities;

    if (payload.id) {
      const existing = list.find((a) => a.id === payload.id);
      if (existing) {
        const oldSnap = { ...existing };
        existing.date_label = payload.date_label.trim();
        existing.attendents = payload.attendents.trim();
        existing.dept = payload.dept.trim();
        existing.activities = payload.activities.trim();
        existing.remarks = payload.remarks.trim();
        existing.photos = Array.isArray(payload.photos) ? payload.photos : [];
        existing.week_label = (payload.week_label || 'WEEK 1 NOVEMBER 2026').trim();
        existing.year = payload.year || '2026';
        existing.month = payload.month || '11';
        existing.week_number = Number(payload.week_number || 1);
        existing.updated_at = now;
        existing.updated_by = actor?.role_name || actor?.full_name || 'Admin';

        this.recordTechnicalModuleAudit(
          callerId,
          'daily_trainer_activities',
          existing.id,
          'UPDATE',
          oldSnap,
          existing
        );
        this.persistState();
        return existing;
      }
    }

    const created: TechnicalTrainerDailyActivityItem = {
      id: `dta-${crypto.randomUUID().slice(0, 8)}`,
      no: list.length + 1,
      date_label: payload.date_label.trim(),
      attendents: payload.attendents.trim(),
      dept: payload.dept.trim(),
      activities: payload.activities.trim(),
      remarks: payload.remarks.trim(),
      photos: Array.isArray(payload.photos) ? payload.photos : [],
      week_label: (payload.week_label || 'WEEK 1 NOVEMBER 2026').trim(),
      year: payload.year || '2026',
      month: payload.month || '11',
      week_number: Number(payload.week_number || 1),
      updated_at: now,
      updated_by: actor?.role_name || actor?.full_name || 'Admin',
    };
    list.push(created);
    this.recordTechnicalModuleAudit(
      callerId,
      'daily_trainer_activities',
      created.id,
      'INSERT',
      null,
      created
    );
    this.persistState();
    return created;
  }

  deleteDailyTrainerActivity(callerId: string, id: string) {
    this.assertCanEditTrainerActivities(callerId);
    const list = this.technicalTrainingModule.dailyTrainerActivities || [];
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Data aktivitas harian tidak ditemukan.');
    const removed = list[idx];
    list.splice(idx, 1);
    list.forEach((item, i) => {
      item.no = i + 1;
    });
    this.recordTechnicalModuleAudit(
      callerId,
      'daily_trainer_activities',
      id,
      'DELETE',
      removed,
      null
    );
    this.persistState();
    return true;
  }

  restoreDefaultDailyTrainerPhotos(callerId: string) {
    this.assertCanEditTrainerActivities(callerId);
    const defaultMap = new Map(
      INITIAL_TECHNICAL_TRAINING_MODULE_DATA.dailyTrainerActivities.map((d) => [d.id, d])
    );
    const current = this.technicalTrainingModule.dailyTrainerActivities || [];
    const existingIds = new Set(current.map((c) => c.id));
    // Restore photos on existing default items
    current.forEach((item, idx) => {
      const def = defaultMap.get(item.id) || INITIAL_TECHNICAL_TRAINING_MODULE_DATA.dailyTrainerActivities[idx];
      if (def) {
        item.photos = [...def.photos];
      }
    });
    // Also re-add any deleted default rows
    INITIAL_TECHNICAL_TRAINING_MODULE_DATA.dailyTrainerActivities.forEach((def) => {
      if (!existingIds.has(def.id) && current.length < 6) {
        current.push(JSON.parse(JSON.stringify(def)));
      }
    });
    current.forEach((item, i) => {
      item.no = i + 1;
    });
    this.persistState();
    return current;
  }

  // 6. Plan Training Technical Bulanan (Gantt / Matrix Tanggal 1..30)
  saveMonthlyPlanBar(
    callerId: string,
    payload: Omit<TechnicalTrainingPlanBar, 'id' | 'updated_at'> & { id?: string }
  ): TechnicalTrainingPlanBar {
    this.assertCanEditTrainerActivities(callerId);
    const actor = this.users.find((u) => u.id === callerId);
    const now = new Date().toISOString();
    if (!Array.isArray(this.technicalTrainingModule.monthlyPlanBars)) {
      this.technicalTrainingModule.monthlyPlanBars = [];
    }
    const list = this.technicalTrainingModule.monthlyPlanBars;

    if (payload.id) {
      const existing = list.find((b) => b.id === payload.id);
      if (existing) {
        const oldSnap = { ...existing };
        existing.month_label = (payload.month_label || 'Nov-26').trim();
        existing.row_key = payload.row_key;
        existing.start_day = Math.max(1, Math.min(31, Number(payload.start_day)));
        existing.end_day = Math.max(existing.start_day, Math.min(31, Number(payload.end_day)));
        existing.title = payload.title.trim();
        existing.bg_color = payload.bg_color || '#E6DEC8';
        existing.text_color = payload.text_color || '#18232B';
        existing.plan_participants = payload.plan_participants;
        existing.actual_participants = payload.actual_participants;
        existing.updated_at = now;
        existing.updated_by = actor?.role_name || actor?.full_name || 'Admin';

        this.recordTechnicalModuleAudit(
          callerId,
          'monthly_plan_bars',
          existing.id,
          'UPDATE',
          oldSnap,
          existing
        );
        this.persistState();
        return existing;
      }
    }

    const startDay = Math.max(1, Math.min(31, Number(payload.start_day)));
    const endDay = Math.max(startDay, Math.min(31, Number(payload.end_day)));
    const created: TechnicalTrainingPlanBar = {
      id: `mpb-${crypto.randomUUID().slice(0, 8)}`,
      month_label: (payload.month_label || 'Nov-26').trim(),
      row_key: payload.row_key,
      start_day: startDay,
      end_day: endDay,
      title: payload.title.trim(),
      bg_color: payload.bg_color || '#E6DEC8',
      text_color: payload.text_color || '#18232B',
      plan_participants: payload.plan_participants,
      actual_participants: payload.actual_participants,
      updated_at: now,
      updated_by: actor?.role_name || actor?.full_name || 'Admin',
    };
    list.push(created);
    this.recordTechnicalModuleAudit(
      callerId,
      'monthly_plan_bars',
      created.id,
      'INSERT',
      null,
      created
    );
    this.persistState();
    return created;
  }

  deleteMonthlyPlanBar(callerId: string, id: string) {
    this.assertCanEditTrainerActivities(callerId);
    const list = this.technicalTrainingModule.monthlyPlanBars || [];
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Item jadwal plan bulanan tidak ditemukan.');
    const removed = list[idx];
    list.splice(idx, 1);
    this.recordTechnicalModuleAudit(
      callerId,
      'monthly_plan_bars',
      id,
      'DELETE',
      removed,
      null
    );
    this.persistState();
    return true;
  }

  // 7. Jadwal Sharing Session 17x Siswa BMC Batch VII
  saveSharingSessionScheduleRow(
    callerId: string,
    payload: Omit<SharingSessionBmcScheduleItem, 'id' | 'no' | 'updated_at'> & { id?: string }
  ): SharingSessionBmcScheduleItem {
    this.assertCanEditTrainerActivities(callerId);
    const actor = this.users.find((u) => u.id === callerId);
    const now = new Date().toISOString();
    if (!Array.isArray(this.technicalTrainingModule.sharingSessionScheduleRows)) {
      this.technicalTrainingModule.sharingSessionScheduleRows = [];
    }
    const list = this.technicalTrainingModule.sharingSessionScheduleRows;

    if (payload.id) {
      const existing = list.find((r) => r.id === payload.id);
      if (existing) {
        const oldSnap = { ...existing };
        existing.tanggal = payload.tanggal.trim();
        existing.hari = payload.hari.trim();
        existing.waktu = payload.waktu.trim();
        existing.nama = payload.nama.trim();
        existing.jabatan = payload.jabatan.trim();
        existing.instruktur = payload.instruktur.trim();
        existing.year = payload.year || existing.year || '2026';
        existing.month = payload.month || existing.month || '11';
        existing.month_label = payload.month_label || existing.month_label || 'November 2026';
        existing.week_number = Number(payload.week_number) || existing.week_number || 1;
        existing.week_label =
          payload.week_label ||
          existing.week_label ||
          `Minggu ${existing.week_number} - ${existing.month_label}`;
        existing.batch_label = payload.batch_label || existing.batch_label || 'BMC BATCH VII';
        existing.status = payload.status || existing.status || 'Done';
        existing.updated_at = now;
        existing.updated_by = actor?.role_name || actor?.full_name || 'Admin';

        this.recordTechnicalModuleAudit(
          callerId,
          'sharing_session_schedule_rows',
          existing.id,
          'UPDATE',
          oldSnap,
          existing
        );
        this.persistState();
        return existing;
      }
    }

    const weekNum = Number(payload.week_number) || 1;
    const monthLabel = payload.month_label || 'November 2026';
    const created: SharingSessionBmcScheduleItem = {
      id: `sss-${crypto.randomUUID().slice(0, 8)}`,
      no: list.length + 1,
      tanggal: payload.tanggal.trim(),
      hari: payload.hari.trim(),
      waktu: payload.waktu.trim(),
      nama: payload.nama.trim(),
      jabatan: payload.jabatan.trim(),
      instruktur: payload.instruktur.trim(),
      year: payload.year || '2026',
      month: payload.month || '11',
      month_label: monthLabel,
      week_number: weekNum,
      week_label: payload.week_label || `Minggu ${weekNum} - ${monthLabel}`,
      batch_label: payload.batch_label || 'BMC BATCH VII',
      status: payload.status || 'On Going',
      updated_at: now,
      updated_by: actor?.role_name || actor?.full_name || 'Admin',
    };
    list.push(created);
    this.recordTechnicalModuleAudit(
      callerId,
      'sharing_session_schedule_rows',
      created.id,
      'INSERT',
      null,
      created
    );
    this.persistState();
    return created;
  }

  /**
   * Auto-repair jika Minggu 2 November 2026 sebelumnya lompat ke 05 NOV 2026 (melewati tgl 2, 3, 4) atau terduplikasi >17 baris
   */
  repairSharingSessionScheduleIfNeeded(): boolean {
    const list = this.technicalTrainingModule.sharingSessionScheduleRows || [];
    const w2Nov = list.filter(
      (r) => (r.month_label || 'November 2026') === 'November 2026' && (r.week_number || 1) === 2
    );
    if (w2Nov.length === 0) return false;

    const skippedTwoThreeFour = !w2Nov.some((r) => r.tanggal.startsWith('02 NOV'));
    const hasDuplicates = w2Nov.length > 17;

    if (!skippedTwoThreeFour && !hasDuplicates) return false;

    // Bangun ulang Minggu 2 November 2026 mulai 02 NOV 2026 (02 NOV, 03 NOV, 04 NOV, 05 NOV) untuk 17 siswa
    const otherRows = list.filter(
      (r) => !((r.month_label || 'November 2026') === 'November 2026' && (r.week_number || 1) === 2)
    );
    const w2Dates = [
      { tanggal: '02 NOV 2026', hari: 'SENIN' },
      { tanggal: '03 NOV 2026', hari: 'SELASA' },
      { tanggal: '04 NOV 2026', hari: 'RABU' },
      { tanggal: '05 NOV 2026', hari: 'KAMIS' },
    ];
    const cleanW2: SharingSessionBmcScheduleItem[] =
      INITIAL_TECHNICAL_TRAINING_MODULE_DATA.sharingSessionScheduleRows.map((src, idx) => {
        const dayGroupIdx = idx < 5 ? 0 : idx < 9 ? 1 : idx < 13 ? 2 : 3;
        const dInfo = w2Dates[dayGroupIdx];
        return {
          ...src,
          id: `sss-w2-${idx + 1}`,
          no: otherRows.length + idx + 1,
          tanggal: dInfo.tanggal,
          hari: dInfo.hari,
          year: '2026',
          month: '11',
          month_label: 'November 2026',
          week_number: 2,
          week_label: 'Minggu 2 - November 2026',
          batch_label: 'BMC BATCH VII',
          status: 'On Going',
          updated_at: new Date().toISOString(),
        };
      });

    this.technicalTrainingModule.sharingSessionScheduleRows = [...otherRows, ...cleanW2];
    return true;
  }

  /**
   * Parse tanggal format "29 OKT 2026" / "01 NOV 2026" ke objek Date
   */
  parseIndoDateLabel(raw: string): Date | null {
    const MONTH_PARSE: Record<string, number> = {
      JAN: 0,
      FEB: 1,
      MAR: 2,
      APR: 3,
      MEI: 4,
      MAY: 4,
      JUN: 5,
      JUL: 6,
      AGU: 7,
      AUG: 7,
      SEP: 8,
      OKT: 9,
      OCT: 9,
      NOV: 10,
      DES: 11,
      DEC: 11,
    };
    const m = raw.trim().match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
    if (!m) return null;
    const day = Number(m[1]);
    const monIdx = MONTH_PARSE[m[2].toUpperCase().slice(0, 3)];
    const yr = Number(m[3]);
    if (monIdx === undefined) return null;
    return new Date(yr, monIdx, day);
  }

  formatIndoDateLabel(dt: Date): { tanggal: string; hari: string } {
    const MONTHS_SHORT_ID = [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MEI',
      'JUN',
      'JUL',
      'AGU',
      'SEP',
      'OKT',
      'NOV',
      'DES',
    ];
    const DAYS_ID = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
    const dd = String(dt.getDate()).padStart(2, '0');
    const monStr = MONTHS_SHORT_ID[dt.getMonth()];
    const yyyy = dt.getFullYear();
    return {
      tanggal: `${dd} ${monStr} ${yyyy}`,
      hari: DAYS_ID[dt.getDay()],
    };
  }

  /**
   * Generate / Duplikasi Jadwal Sharing Session BMC ke Minggu / Bulan Selanjutnya
   * Otomatis melanjutkan H+1 dari tanggal terakhir periode sebelumnya agar tidak ada tanggal yang terlewat!
   */
  generateSharingSessionPeriod(
    callerId: string,
    params: {
      sourceMonthLabel: string;
      sourceWeekNumber: number;
      targetYear: string;
      targetMonth: string;
      targetMonthLabel: string;
      targetWeekNumber: number;
      startDateIso?: string; // e.g., "2026-11-02"
      daysPattern?: 4 | 7; // 4 hari berurutan (5+4+4+4) atau 7 hari penuh (3+3+3+2+2+2+2)
      batchLabel?: string;
    }
  ): SharingSessionBmcScheduleItem[] {
    this.assertCanEditTrainerActivities(callerId);
    const actor = this.users.find((u) => u.id === callerId);
    const now = new Date().toISOString();
    if (!Array.isArray(this.technicalTrainingModule.sharingSessionScheduleRows)) {
      this.technicalTrainingModule.sharingSessionScheduleRows = [];
    }

    // Gunakan 17 siswa standar dari template
    const baseStudents = INITIAL_TECHNICAL_TRAINING_MODULE_DATA.sharingSessionScheduleRows;

    // Tentukan Tanggal Mulai (Start Date):
    // Jika startDateIso dikirim, gunakan itu. Jika tidak, cari tanggal paling akhir dari periode sebelumnya + 1 hari!
    let startDt: Date | null = null;
    if (params.startDateIso) {
      const [y, m, d] = params.startDateIso.split('-').map(Number);
      if (y && m && d) {
        startDt = new Date(y, m - 1, d);
      }
    }

    if (!startDt) {
      const allExisting = this.technicalTrainingModule.sharingSessionScheduleRows.filter(
        (r) =>
          !(
            (r.month_label || 'November 2026') === params.targetMonthLabel &&
            (r.week_number || 1) === params.targetWeekNumber
          )
      );
      let maxTime = 0;
      allExisting.forEach((r) => {
        const parsed = this.parseIndoDateLabel(r.tanggal);
        if (parsed && parsed.getTime() > maxTime) {
          maxTime = parsed.getTime();
        }
      });
      if (maxTime > 0) {
        const nextDay = new Date(maxTime);
        nextDay.setDate(nextDay.getDate() + 1);
        startDt = nextDay;
      } else {
        startDt = new Date(Number(params.targetYear), Number(params.targetMonth) - 1, 2);
      }
    }

    const daysPattern = params.daysPattern || 4;
    const targetWeekLabel = `Minggu ${params.targetWeekNumber} - ${params.targetMonthLabel}`;

    const createdRows: SharingSessionBmcScheduleItem[] = baseStudents.map((src, idx) => {
      let dayOffset = 0;
      if (daysPattern === 7) {
        // Bagi 17 siswa ke 7 hari berurutan (3, 3, 3, 2, 2, 2, 2)
        if (idx < 3) dayOffset = 0;
        else if (idx < 6) dayOffset = 1;
        else if (idx < 9) dayOffset = 2;
        else if (idx < 11) dayOffset = 3;
        else if (idx < 13) dayOffset = 4;
        else if (idx < 15) dayOffset = 5;
        else dayOffset = 6;
      } else {
        // 4 hari berurutan seperti pola asli (5, 4, 4, 4)
        if (idx < 5) dayOffset = 0;
        else if (idx < 9) dayOffset = 1;
        else if (idx < 13) dayOffset = 2;
        else dayOffset = 3;
      }

      const rowDate = new Date(
        startDt!.getFullYear(),
        startDt!.getMonth(),
        startDt!.getDate() + dayOffset
      );
      const formatted = this.formatIndoDateLabel(rowDate);

      return {
        id: `sss-${crypto.randomUUID().slice(0, 8)}`,
        no: idx + 1,
        tanggal: formatted.tanggal,
        hari: formatted.hari,
        waktu: src.waktu,
        nama: src.nama,
        jabatan: src.jabatan,
        instruktur: src.instruktur,
        year: params.targetYear,
        month: params.targetMonth,
        month_label: params.targetMonthLabel,
        week_number: params.targetWeekNumber,
        week_label: targetWeekLabel,
        batch_label: params.batchLabel || src.batch_label || 'BMC BATCH VII',
        status: 'On Going',
        updated_at: now,
        updated_by: actor?.role_name || actor?.full_name || 'Admin',
      };
    });

    // Hapus baris lama pada periode (targetMonthLabel, targetWeekNumber) yang sama agar tidak pernah dobel (34x)
    const remaining = this.technicalTrainingModule.sharingSessionScheduleRows.filter(
      (r) =>
        !(
          (r.month_label || 'November 2026') === params.targetMonthLabel &&
          (r.week_number || 1) === params.targetWeekNumber
        )
    );
    this.technicalTrainingModule.sharingSessionScheduleRows = [...remaining, ...createdRows].map(
      (item, i) => ({
        ...item,
        no: i + 1,
      })
    );

    this.recordTechnicalModuleAudit(
      callerId,
      'sharing_session_schedule_rows',
      targetWeekLabel,
      'INSERT',
      null,
      { count: createdRows.length, targetWeekLabel }
    );
    this.persistState();
    return createdRows;
  }

  deleteSharingSessionPeriod(callerId: string, monthLabel: string, weekNumber: number) {
    this.assertCanEditTrainerActivities(callerId);
    const list = this.technicalTrainingModule.sharingSessionScheduleRows || [];
    const remaining = list.filter(
      (r) => !((r.month_label || 'November 2026') === monthLabel && (r.week_number || 1) === weekNumber)
    );
    this.technicalTrainingModule.sharingSessionScheduleRows = remaining.map((item, i) => ({
      ...item,
      no: i + 1,
    }));
    this.recordTechnicalModuleAudit(
      callerId,
      'sharing_session_schedule_rows',
      `Minggu ${weekNumber} - ${monthLabel}`,
      'DELETE',
      { monthLabel, weekNumber },
      null
    );
    this.persistState();
    return true;
  }

  /**
   * Duplikasi Plan Training Technical Bulanan ke Bulan Selanjutnya
   */
  generateMonthlyPlanForNextMonth(
    callerId: string,
    sourceMonthLabel: string,
    targetMonthLabel: string
  ): TechnicalTrainingPlanBar[] {
    this.assertCanEditTrainerActivities(callerId);
    const actor = this.users.find((u) => u.id === callerId);
    const now = new Date().toISOString();
    if (!Array.isArray(this.technicalTrainingModule.monthlyPlanBars)) {
      this.technicalTrainingModule.monthlyPlanBars = [];
    }
    const list = this.technicalTrainingModule.monthlyPlanBars;
    const existingTarget = list.filter((b) => b.month_label === targetMonthLabel);
    if (existingTarget.length > 0) return existingTarget;

    const sourceBars = list.filter((b) => b.month_label === sourceMonthLabel);
    const templateBars =
      sourceBars.length > 0
        ? sourceBars
        : INITIAL_TECHNICAL_TRAINING_MODULE_DATA.monthlyPlanBars;

    const created = templateBars.map((b) => ({
      ...b,
      id: `mpb-${crypto.randomUUID().slice(0, 8)}`,
      month_label: targetMonthLabel,
      updated_at: now,
      updated_by: actor?.role_name || actor?.full_name || 'Admin',
    }));

    list.push(...created);
    this.recordTechnicalModuleAudit(
      callerId,
      'monthly_plan_bars',
      targetMonthLabel,
      'INSERT',
      null,
      { count: created.length, targetMonthLabel }
    );
    this.persistState();
    return created;
  }

  // ============================================================================
  // 8. PROGRAM SKILL AUDIT & REFRESH OPERATOR (ADT, EXCAVATOR, DOSER, DRIVER DT)
  // ============================================================================
  private adjustSkillAuditSummaryCount(category: SkillAuditCategoryCode, delta: number) {
    if (!delta) return;
    const rows = this.technicalTrainingModule.skillAuditSummaryRows || [];
    const matchRow = rows.find((r) => {
      const j = r.jabatan.toLowerCase();
      if (category === 'ADT') return j.includes('adt');
      if (category === 'EXCAVATOR') return j.includes('excavator') || j.includes('exa');
      if (category === 'DOSER') return j.includes('buldozer') || j.includes('dozer') || j.includes('doser');
      if (category === 'DRIVER_DT') return j.includes('driver dt') || j.includes('dt');
      return false;
    });
    if (!matchRow) return;
    const prevTotal = Math.max(matchRow.total_karyawan, matchRow.close_count + matchRow.open_count);
    const nextClose = Math.max(0, matchRow.close_count + delta);
    const nextTotal = Math.max(prevTotal, nextClose);
    const nextOpen = Math.max(0, nextTotal - nextClose);
    matchRow.close_count = nextClose;
    matchRow.open_count = nextOpen;
    matchRow.total_karyawan = nextTotal;
    matchRow.percentage = nextTotal > 0 ? Math.round((nextClose / nextTotal) * 100) : 0;
    matchRow.updated_at = new Date().toISOString();
  }

  syncSkillAuditSummaryFromActualRecords(callerId: string) {
    this.assertCanEditTrainerActivities(callerId);
    const records = this.technicalTrainingModule.skillAuditOperatorRecords || [];
    const rows = this.technicalTrainingModule.skillAuditSummaryRows || [];
    const counts: Record<SkillAuditCategoryCode, number> = {
      ADT: records.filter((r) => r.category === 'ADT').length,
      EXCAVATOR: records.filter((r) => r.category === 'EXCAVATOR').length,
      DOSER: records.filter((r) => r.category === 'DOSER').length,
      DRIVER_DT: records.filter((r) => r.category === 'DRIVER_DT').length,
    };

    rows.forEach((row) => {
      const j = row.jabatan.toLowerCase();
      let actualClose: number | null = null;
      if (j.includes('adt')) actualClose = counts.ADT;
      else if (j.includes('excavator') || j.includes('exa')) actualClose = counts.EXCAVATOR;
      else if (j.includes('buldozer') || j.includes('dozer') || j.includes('doser'))
        actualClose = counts.DOSER;
      else if (j.includes('driver dt')) actualClose = counts.DRIVER_DT;

      if (actualClose !== null) {
        const baseTotal = Math.max(row.total_karyawan, actualClose);
        row.close_count = actualClose;
        row.total_karyawan = baseTotal;
        row.open_count = Math.max(0, baseTotal - actualClose);
        row.percentage = baseTotal > 0 ? Math.round((actualClose / baseTotal) * 100) : 0;
        row.updated_at = new Date().toISOString();
      }
    });

    this.persistState();
    return rows;
  }

  saveSkillAuditOperatorRecord(
    callerId: string,
    payload: Omit<SkillAuditOperatorRecord, 'id' | 'no' | 'updated_at'> & { id?: string }
  ): SkillAuditOperatorRecord {
    this.assertCanEditTrainerActivities(callerId);
    const actor = this.users.find((u) => u.id === callerId);
    const now = new Date().toISOString();
    if (!Array.isArray(this.technicalTrainingModule.skillAuditOperatorRecords)) {
      this.technicalTrainingModule.skillAuditOperatorRecords = [];
    }
    const list = this.technicalTrainingModule.skillAuditOperatorRecords;

    if (payload.id) {
      const existing = list.find((r) => r.id === payload.id);
      if (existing) {
        const oldSnap = { ...existing };
        const oldCat = existing.category;
        existing.category = payload.category;
        existing.tanggal = payload.tanggal.trim();
        existing.nama = payload.nama.trim();
        existing.posisi = payload.posisi.trim();
        existing.jenis_unit = payload.jenis_unit.trim();
        existing.keterangan = payload.keterangan.trim() || 'INTERNAL';
        existing.provider = payload.provider.trim() || 'TC';
        existing.program = payload.program.trim() || 'Refresh';
        existing.instructor = payload.instructor.trim();
        existing.period_label = payload.period_label || existing.period_label;
        existing.updated_at = now;
        existing.updated_by = actor?.role_name || actor?.full_name || 'Admin';

        if (oldCat !== payload.category) {
          this.adjustSkillAuditSummaryCount(oldCat, -1);
          this.adjustSkillAuditSummaryCount(payload.category, 1);
        }

        this.recordTechnicalModuleAudit(
          callerId,
          'skill_audit_operator_records',
          existing.id,
          'UPDATE',
          oldSnap,
          existing
        );
        this.persistState();
        return existing;
      }
    }

    const catCount = list.filter((r) => r.category === payload.category).length;
    const created: SkillAuditOperatorRecord = {
      id: `sao-${crypto.randomUUID().slice(0, 8)}`,
      no: catCount + 1,
      category: payload.category,
      tanggal: payload.tanggal.trim(),
      nama: payload.nama.trim(),
      posisi: payload.posisi.trim(),
      jenis_unit: payload.jenis_unit.trim(),
      keterangan: payload.keterangan.trim() || 'INTERNAL',
      provider: payload.provider.trim() || 'TC',
      program: payload.program.trim() || 'Refresh',
      instructor: payload.instructor.trim(),
      period_label: payload.period_label || 'October - November 2026',
      updated_at: now,
      updated_by: actor?.role_name || actor?.full_name || 'Admin',
    };
    list.push(created);
    this.adjustSkillAuditSummaryCount(payload.category, 1);
    this.recordTechnicalModuleAudit(
      callerId,
      'skill_audit_operator_records',
      created.id,
      'INSERT',
      null,
      created
    );
    this.persistState();
    return created;
  }

  deleteSkillAuditOperatorRecord(callerId: string, id: string) {
    this.assertCanEditTrainerActivities(callerId);
    const list = this.technicalTrainingModule.skillAuditOperatorRecords || [];
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Data operator tidak ditemukan.');
    const removed = list[idx];
    list.splice(idx, 1);
    this.adjustSkillAuditSummaryCount(removed.category, -1);
    this.recordTechnicalModuleAudit(
      callerId,
      'skill_audit_operator_records',
      id,
      'DELETE',
      removed,
      null
    );
    this.persistState();
    return true;
  }

  saveSkillAuditSummaryRow(
    callerId: string,
    payload: Omit<SkillAuditHeavyEquipmentSummaryRow, 'id' | 'no' | 'updated_at'> & { id?: string }
  ): SkillAuditHeavyEquipmentSummaryRow {
    this.assertCanEditTrainerActivities(callerId);
    const actor = this.users.find((u) => u.id === callerId);
    const now = new Date().toISOString();
    if (!Array.isArray(this.technicalTrainingModule.skillAuditSummaryRows)) {
      this.technicalTrainingModule.skillAuditSummaryRows = [];
    }
    const list = this.technicalTrainingModule.skillAuditSummaryRows;
    const closeVal = Math.max(0, Number(payload.close_count) || 0);
    const openVal = Math.max(0, Number(payload.open_count) || 0);
    const totalVal = closeVal + openVal;
    const pctVal = totalVal > 0 ? Math.round((closeVal / totalVal) * 100) : 0;

    if (payload.id) {
      const existing = list.find((r) => r.id === payload.id);
      if (existing) {
        const oldSnap = { ...existing };
        existing.jabatan = payload.jabatan.trim();
        existing.close_count = closeVal;
        existing.open_count = openVal;
        existing.total_karyawan = totalVal;
        existing.percentage = pctVal;
        existing.updated_at = now;
        existing.updated_by = actor?.role_name || actor?.full_name || 'Admin';

        this.recordTechnicalModuleAudit(
          callerId,
          'skill_audit_summary_rows',
          existing.id,
          'UPDATE',
          oldSnap,
          existing
        );
        this.persistState();
        return existing;
      }
    }

    const created: SkillAuditHeavyEquipmentSummaryRow = {
      id: `sas-${crypto.randomUUID().slice(0, 8)}`,
      no: list.length + 1,
      jabatan: payload.jabatan.trim(),
      close_count: closeVal,
      open_count: openVal,
      total_karyawan: totalVal,
      percentage: pctVal,
      updated_at: now,
      updated_by: actor?.role_name || actor?.full_name || 'Admin',
    };
    list.push(created);
    this.recordTechnicalModuleAudit(
      callerId,
      'skill_audit_summary_rows',
      created.id,
      'INSERT',
      null,
      created
    );
    this.persistState();
    return created;
  }

  deleteSkillAuditSummaryRow(callerId: string, id: string) {
    this.assertCanEditTrainerActivities(callerId);
    const list = this.technicalTrainingModule.skillAuditSummaryRows || [];
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Baris summary tidak ditemukan.');
    const removed = list[idx];
    list.splice(idx, 1);
    this.recordTechnicalModuleAudit(
      callerId,
      'skill_audit_summary_rows',
      id,
      'DELETE',
      removed,
      null
    );
    this.persistState();
    return true;
  }

  saveSkillAuditPhotos(callerId: string, categoryKey: string, photos: string[]) {
    this.assertCanEditTrainerActivities(callerId);
    if (!this.technicalTrainingModule.skillAuditPhotos) {
      this.technicalTrainingModule.skillAuditPhotos = { ...INITIAL_SKILL_AUDIT_PHOTOS };
    }
    this.technicalTrainingModule.skillAuditPhotos[categoryKey] = photos;
    this.persistState();
    return photos;
  }

  restoreDefaultSkillAuditPhotos(callerId: string, categoryKey?: string) {
    if (callerId) {
      this.assertCanEditTrainerActivities(callerId);
    }
    if (!this.technicalTrainingModule.skillAuditPhotos) {
      this.technicalTrainingModule.skillAuditPhotos = JSON.parse(
        JSON.stringify(INITIAL_SKILL_AUDIT_PHOTOS)
      );
    }
    if (categoryKey && INITIAL_SKILL_AUDIT_PHOTOS[categoryKey]) {
      const defaults = INITIAL_SKILL_AUDIT_PHOTOS[categoryKey];
      const existing = this.technicalTrainingModule.skillAuditPhotos[categoryKey] || [];
      const customExtras = existing.filter((u) => !defaults.includes(u));
      this.technicalTrainingModule.skillAuditPhotos[categoryKey] = [...defaults, ...customExtras];
    } else {
      Object.keys(INITIAL_SKILL_AUDIT_PHOTOS).forEach((k) => {
        const defaults = INITIAL_SKILL_AUDIT_PHOTOS[k];
        const existing = this.technicalTrainingModule.skillAuditPhotos[k] || [];
        const customExtras = existing.filter((u) => !defaults.includes(u));
        this.technicalTrainingModule.skillAuditPhotos[k] = [...defaults, ...customExtras];
      });
    }
    this.persistState();
    return this.technicalTrainingModule.skillAuditPhotos;
  }

  deleteSharingSessionScheduleRow(callerId: string, id: string) {
    this.assertCanEditTrainerActivities(callerId);
    const list = this.technicalTrainingModule.sharingSessionScheduleRows || [];
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Baris jadwal Sharing Session tidak ditemukan.');
    const removed = list[idx];
    list.splice(idx, 1);
    list.forEach((item, i) => {
      item.no = i + 1;
    });
    this.recordTechnicalModuleAudit(
      callerId,
      'sharing_session_schedule_rows',
      id,
      'DELETE',
      removed,
      null
    );
    this.persistState();
    return true;
  }

  /**
   * Real-time calculated summary metrics for Program Technical Training
   * (Strictly separates different units: Programs, Candidates, Assessment Classes, and Attendance/Plan vs Actual)
   */
  getTechnicalTrainingSummaryMetrics() {
    const mod = this.technicalTrainingModule;

    // 1. Total Program Technical Training (Section A + 17 Modul TNA)
    const totalPrograms = mod.trainingClassPrograms.length;
    const totalTnaModules = mod.plmCompetencyGapRows.length;

    // 2. Interview & Assessment Candidate Mechanic (Section B & C — Unit: Kandidat)
    const totalCandidateMasuk = mod.candidatePositionRecap.reduce(
      (s, r) => s + r.total_masuk,
      0
    );
    const totalCandidateSudahItv = mod.candidatePositionRecap.reduce(
      (s, r) => s + r.sudah_itv,
      0
    );
    const totalCandidateRecommended = mod.candidatePositionRecap.reduce(
      (s, r) => s + r.recommended_m3_up,
      0
    );
    const totalCandidateTangofa = mod.candidatePositionRecap.reduce(
      (s, r) => s + r.site_tangofa,
      0
    );
    const totalCandidateTpm = mod.candidatePositionRecap.reduce(
      (s, r) => s + r.site_tpm,
      0
    );
    const totalIndividualAssessments = mod.candidateAssessments.length;

    // 3. Monitoring OJT BMC & Sharing Session BMC Batch VII (Section D & E — Unit: Siswa)
    const totalOjtStudents = mod.ojtBmcRecords.reduce((s, r) => s + r.student_count, 0);
    const ojtTangofaStudents = mod.ojtBmcRecords
      .filter((r) => r.location.toLowerCase().includes('tangofa'))
      .reduce((s, r) => s + r.student_count, 0);
    const ojtTpmStudents = mod.ojtBmcRecords
      .filter((r) => r.location.toLowerCase().includes('tpm'))
      .reduce((s, r) => s + r.student_count, 0);
    const totalSharingSessionTarget = mod.sharingSessionRecords.reduce(
      (s, r) => s + r.target_participants,
      0
    );
    const totalSharingSessionActual = mod.sharingSessionRecords.reduce(
      (s, r) => s + r.actual_attendance,
      0
    );

    // 4. Resume Assessment Crew Mechanic PLM 2026 (Slide 3 — Unit: Class & GAP)
    const totalPlmAssessmentClass = mod.plmAssessmentCategories.reduce(
      (s, c) => s + c.class_count,
      0
    );
    const totalGapAll = mod.plmCompetencyGapRows.reduce((s, r) => s + r.gap_all, 0);
    const totalMechanicTangofaGap = mod.plmCompetencyGapRows.reduce(
      (s, r) => s + r.mechanic_tangofa,
      0
    );
    const totalMechanicGenbaGap = mod.plmCompetencyGapRows.reduce(
      (s, r) => s + r.mechanic_genba,
      0
    );
    const totalAllGlGap = mod.plmCompetencyGapRows.reduce((s, r) => s + r.all_gl, 0);
    const totalFgdpGldpGap = mod.plmCompetencyGapRows.reduce(
      (s, r) => s + r.fgdp_gldp,
      0
    );
    const totalFillGap = mod.plmCompetencyGapRows.reduce((s, r) => s + r.fill_gap, 0);
    const overallFillGapPercent =
      totalGapAll > 0 ? Math.round((totalFillGap / totalGapAll) * 100) : 0;

    // 5. Resume Training Class Crew Mechanic PLM 2026 (Slide 4 — Unit: Kehadiran Plan vs Actual)
    const totalClassPlan = mod.plmMonthlyTrainingClasses.reduce((s, m) => s + m.plan, 0);
    const totalClassActual = mod.plmMonthlyTrainingClasses.reduce(
      (s, m) => s + m.actual,
      0
    );
    const classSelisih = totalClassActual - totalClassPlan;
    const classAchievementPercent =
      totalClassPlan > 0
        ? Math.round((totalClassActual / totalClassPlan) * 10000) / 100
        : 0;
    const totalFrequencyPlan = mod.plmMonthlyTrainingClasses.reduce(
      (s, m) => s + m.frequency_plan,
      0
    );
    const totalFrequencyActual = mod.plmMonthlyTrainingClasses.reduce(
      (s, m) => s + m.frequency_actual,
      0
    );

    // 6. Program Skill Audit & Refresh Operator (Live Aktual dari Tabel Peserta & Summary)
    const skillOps = mod.skillAuditOperatorRecords || [];
    const adtRefreshCount = skillOps.filter((r) => r.category === 'ADT').length;
    const excRefreshCount = skillOps.filter((r) => r.category === 'EXCAVATOR').length;
    const doserRefreshCount = skillOps.filter((r) => r.category === 'DOSER').length;
    const dtRefreshCount = skillOps.filter((r) => r.category === 'DRIVER_DT').length;
    const totalSkillAuditOperators = skillOps.length;
    const summaryRows = mod.skillAuditSummaryRows || [];
    const skillSummaryClose = summaryRows.reduce((s, r) => s + r.close_count, 0);
    const skillSummaryOpen = summaryRows.reduce((s, r) => s + r.open_count, 0);
    const skillSummaryTotalKaryawan = summaryRows.reduce((s, r) => s + r.total_karyawan, 0);
    const skillSummaryPct =
      skillSummaryTotalKaryawan > 0
        ? Math.round((skillSummaryClose / skillSummaryTotalKaryawan) * 100)
        : 0;

    return {
      totalPrograms,
      totalTnaModules,
      totalCandidateMasuk,
      totalCandidateSudahItv,
      totalCandidateRecommended,
      totalCandidateTangofa,
      totalCandidateTpm,
      totalIndividualAssessments,
      totalOjtStudents,
      ojtTangofaStudents,
      ojtTpmStudents,
      totalSharingSessionTarget,
      totalSharingSessionActual,
      totalPlmAssessmentClass,
      totalGapAll,
      totalMechanicTangofaGap,
      totalMechanicGenbaGap,
      totalAllGlGap,
      totalFgdpGldpGap,
      totalFillGap,
      overallFillGapPercent,
      totalClassPlan,
      totalClassActual,
      classSelisih,
      classAchievementPercent,
      totalFrequencyPlan,
      totalFrequencyActual,
      adtRefreshCount,
      excRefreshCount,
      doserRefreshCount,
      dtRefreshCount,
      totalSkillAuditOperators,
      skillSummaryClose,
      skillSummaryOpen,
      skillSummaryTotalKaryawan,
      skillSummaryPct,
    };
  }

  // ============================================================================
  // RPC: EDIT TRAINING DATA
  // Enforces RBAC: Only roles with trainingData === 'EDIT' & canEditData === true
  // ============================================================================
  updateTrainingApplicationData(
    callerId: string,
    appId: string,
    updates: {
      training_title?: string;
      training_category?: string;
      training_type?: TrainingType;
      training_provider?: string;
      training_location?: string;
      proposed_start_date?: string;
      proposed_end_date?: string;
      estimated_budget?: number;
      department_id?: string;
      current_status?: ApplicationStatus;
      planned_hours?: number;
      actual_hours?: number;
      planned_participants?: number;
      actual_participants?: number;
    }
  ) {
    const perms = this.getUserPermissions(callerId);
    if (perms.trainingData !== 'EDIT' || !perms.canEditData) {
      throw new Error('PERMISSION_DENIED: Role Anda tidak memiliki hak akses untuk mengedit Data Training.');
    }

    const app = this.applications.find((a) => a.id === appId);
    if (!app) throw new Error('APPLICATION_NOT_FOUND');

    const oldTitle = app.training_title;

    if (updates.training_title !== undefined) app.training_title = updates.training_title.trim();
    if (updates.training_category !== undefined) app.training_category = updates.training_category;
    if (updates.training_type !== undefined) app.training_type = updates.training_type;
    if (updates.training_provider !== undefined) app.training_provider = updates.training_provider;
    if (updates.training_location !== undefined) app.training_location = updates.training_location;
    if (updates.proposed_start_date !== undefined)
      app.proposed_start_date = updates.proposed_start_date;
    if (updates.proposed_end_date !== undefined)
      app.proposed_end_date = updates.proposed_end_date;
    if (updates.estimated_budget !== undefined)
      app.estimated_budget = Number(updates.estimated_budget);
    if (updates.current_status !== undefined) app.current_status = updates.current_status;
    if (updates.planned_hours !== undefined) app.planned_hours = Number(updates.planned_hours);
    if (updates.actual_hours !== undefined) app.actual_hours = Number(updates.actual_hours);
    if (updates.planned_participants !== undefined)
      app.planned_participants = Number(updates.planned_participants);
    if (updates.actual_participants !== undefined)
      app.actual_participants = Number(updates.actual_participants);

    // Auto-sync actuals when status changes to COMPLETED
    if (app.current_status === 'COMPLETED') {
      if (!app.actual_hours || app.actual_hours === 0) {
        app.actual_hours = app.planned_hours || 16;
      }
      if (!app.actual_participants || app.actual_participants === 0) {
        const partCount = this.participants.filter((p) => p.application_id === app.id).length;
        app.actual_participants = app.planned_participants || Math.max(partCount, 1);
      }
    } else if (app.current_status !== 'IN_PROGRESS') {
      if (updates.actual_hours === undefined) app.actual_hours = 0;
      if (updates.actual_participants === undefined) app.actual_participants = 0;
    }

    if (updates.department_id !== undefined) {
      const dept = this.departments.find((d) => d.id === updates.department_id);
      if (dept) {
        app.department_id = dept.id;
        app.department_name = dept.name;
      }
    }

    app.updated_at = new Date().toISOString();

    this.auditLogs.unshift({
      id: crypto.randomUUID(),
      table_name: 'training_applications',
      record_id: app.id,
      action: 'UPDATE_DATA',
      actor_id: callerId,
      old_values: { training_title: oldTitle },
      new_values: updates,
      created_at: new Date().toISOString(),
    });

    this.recalculateKpis(2026);
    this.persistState();
    return app;
  }

  // ============================================================================
  // RPC: USER MANAGEMENT (SUPER ADMIN EXCLUSIVE)
  // ============================================================================
  createUserAccount(
    callerId: string,
    payload: {
      full_name: string;
      email: string;
      nik: string;
      role_code: RoleCode;
      department_id?: string | null;
      phone_number?: string;
    }
  ): UserProfile {
    const perms = this.getUserPermissions(callerId);
    if (!perms.canManageUsers) {
      throw new Error('PERMISSION_DENIED: Hanya Super Admin yang dapat mengelola akun pengguna.');
    }

    const roleObj = this.roles.find((r) => r.code === payload.role_code);
    if (!roleObj) {
      throw new Error('INVALID_ROLE: Role tidak termasuk dalam 6 role resmi sistem.');
    }

    const exists = this.users.some(
      (u) => u.email.toLowerCase() === payload.email.trim().toLowerCase()
    );
    if (exists) {
      throw new Error('EMAIL_EXISTS: Email sudah terdaftar pada sistem.');
    }

    const dept = payload.department_id
      ? this.departments.find((d) => d.id === payload.department_id)
      : undefined;

    const newUser: UserProfile = {
      id: crypto.randomUUID(),
      role_id: roleObj.id,
      role_code: roleObj.code,
      role_name: roleObj.name,
      nik: payload.nik.trim().toUpperCase(),
      full_name: payload.full_name.trim(),
      email: payload.email.trim().toLowerCase(),
      phone_number: payload.phone_number || '+62811000000',
      department_id: dept ? dept.id : null,
      department_name: dept ? dept.name : undefined,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    this.users.push(newUser);

    this.auditLogs.unshift({
      id: crypto.randomUUID(),
      table_name: 'users',
      record_id: newUser.id,
      action: 'CREATE_USER',
      actor_id: callerId,
      old_values: null,
      new_values: { full_name: newUser.full_name, role_code: newUser.role_code, email: newUser.email },
      created_at: new Date().toISOString(),
    });

    this.persistState();
    return newUser;
  }

  updateUserAccount(
    callerId: string,
    targetUserId: string,
    updates: {
      full_name?: string;
      email?: string;
      nik?: string;
      role_code?: RoleCode;
      department_id?: string | null;
      is_active?: boolean;
    }
  ): UserProfile {
    const perms = this.getUserPermissions(callerId);
    if (!perms.canManageUsers) {
      throw new Error('PERMISSION_DENIED: Hanya Super Admin yang dapat mengubah data pengguna.');
    }

    const user = this.users.find((u) => u.id === targetUserId);
    if (!user) throw new Error('USER_NOT_FOUND');

    const oldRole = user.role_code;

    if (updates.full_name !== undefined) user.full_name = updates.full_name.trim();
    if (updates.email !== undefined) user.email = updates.email.trim().toLowerCase();
    if (updates.nik !== undefined) user.nik = updates.nik.trim().toUpperCase();
    if (updates.role_code !== undefined) {
      const roleObj = this.roles.find((r) => r.code === updates.role_code);
      if (!roleObj) throw new Error('INVALID_ROLE');
      user.role_id = roleObj.id;
      user.role_code = roleObj.code;
      user.role_name = roleObj.name;
    }
    if (updates.department_id !== undefined) {
      const dept = updates.department_id
        ? this.departments.find((d) => d.id === updates.department_id)
        : undefined;
      user.department_id = dept ? dept.id : null;
      user.department_name = dept ? dept.name : undefined;
    }
    if (updates.is_active !== undefined) {
      user.is_active = updates.is_active;
    }

    this.auditLogs.unshift({
      id: crypto.randomUUID(),
      table_name: 'users',
      record_id: user.id,
      action: 'UPDATE_USER',
      actor_id: callerId,
      old_values: { role_code: oldRole },
      new_values: updates,
      created_at: new Date().toISOString(),
    });

    this.persistState();
    return user;
  }

  deleteUserAccount(callerId: string, targetUserId: string) {
    const perms = this.getUserPermissions(callerId);
    if (!perms.canManageUsers) {
      throw new Error('PERMISSION_DENIED: Hanya Super Admin yang dapat menghapus akun pengguna.');
    }
    if (callerId === targetUserId) {
      throw new Error('INVALID_OPERATION: Tidak dapat menghapus akun Super Admin yang sedang digunakan.');
    }
    const idx = this.users.findIndex((u) => u.id === targetUserId);
    if (idx === -1) throw new Error('USER_NOT_FOUND');
    const removed = this.users[idx];
    this.users.splice(idx, 1);

    this.auditLogs.unshift({
      id: crypto.randomUUID(),
      table_name: 'users',
      record_id: targetUserId,
      action: 'DELETE_USER',
      actor_id: callerId,
      old_values: { full_name: removed.full_name, role_code: removed.role_code },
      new_values: null,
      created_at: new Date().toISOString(),
    });
    this.persistState();
  }

  // ============================================================================
  // RPC: SYSTEM SETTINGS (SUPER ADMIN EXCLUSIVE)
  // ============================================================================
  updateSystemSettings(callerId: string, updates: Partial<SystemSettingsConfig>) {
    const perms = this.getUserPermissions(callerId);
    if (!perms.canManageSystemSettings) {
      throw new Error('PERMISSION_DENIED: Hanya Super Admin yang dapat mengubah Pengaturan Sistem.');
    }

    const actor = this.users.find((u) => u.id === callerId);
    const oldSettings = { ...this.systemSettings };

    this.systemSettings = {
      ...this.systemSettings,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: actor?.full_name || 'Super Admin',
    };

    if (updates.annualTrainingHoursTargetPerEmployee !== undefined) {
      const target = this.kpiTargets.find(
        (t) => t.kpi_id === '60000000-0000-0000-0000-000000000001'
      );
      if (target) target.target_value = Number(updates.annualTrainingHoursTargetPerEmployee);
    }

    this.auditLogs.unshift({
      id: crypto.randomUUID(),
      table_name: 'system_settings',
      record_id: 'GLOBAL_CONFIG',
      action: 'UPDATE_SETTINGS',
      actor_id: callerId,
      old_values: oldSettings,
      new_values: updates,
      created_at: new Date().toISOString(),
    });

    this.recalculateKpis(2026);
    this.persistState();
    return this.systemSettings;
  }

  // ============================================================================
  // RPC: UPDATE RBAC PERMISSION MATRIX (SUPER ADMIN EXCLUSIVE)
  // ============================================================================
  updateRolePermission(
    callerId: string,
    targetRole: RoleCode,
    updates: Partial<RolePermissionMatrix>
  ): Record<RoleCode, RolePermissionMatrix> {
    const callerRole = this.getUserRole(callerId);
    const perms = this.getUserPermissions(callerId);
    if (callerRole !== 'SUPER_ADMIN' && !perms.canManageSystemSettings) {
      throw new Error(
        'PERMISSION_DENIED: Hanya Super Admin yang dapat mengatur Matriks Hak Akses (RBAC).'
      );
    }

    const prevValue = { ...ROLE_PERMISSIONS[targetRole] };
    syncRolePermissionsRegistry({
      [targetRole]: {
        ...ROLE_PERMISSIONS[targetRole],
        ...updates,
      },
    });
    this.rolePermissions = JSON.parse(JSON.stringify(ROLE_PERMISSIONS));

    this.auditLogs.unshift({
      id: crypto.randomUUID(),
      table_name: 'role_permissions',
      record_id: targetRole,
      action: 'UPDATE_RBAC_MATRIX',
      actor_id: callerId,
      old_values: prevValue,
      new_values: this.rolePermissions[targetRole],
      created_at: new Date().toISOString(),
    });

    this.persistState();
    return this.rolePermissions;
  }

  resetRolePermissionsToDefault(callerId: string): Record<RoleCode, RolePermissionMatrix> {
    const callerRole = this.getUserRole(callerId);
    const perms = this.getUserPermissions(callerId);
    if (callerRole !== 'SUPER_ADMIN' && !perms.canManageSystemSettings) {
      throw new Error(
        'PERMISSION_DENIED: Hanya Super Admin yang dapat mereset Matriks Hak Akses (RBAC).'
      );
    }

    syncRolePermissionsRegistry(DEFAULT_ROLE_PERMISSIONS);
    this.rolePermissions = JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS));

    this.auditLogs.unshift({
      id: crypto.randomUUID(),
      table_name: 'role_permissions',
      record_id: 'ALL_ROLES',
      action: 'RESET_RBAC_MATRIX',
      actor_id: callerId,
      old_values: null,
      new_values: this.rolePermissions,
      created_at: new Date().toISOString(),
    });

    this.persistState();
    return this.rolePermissions;
  }

  // ============================================================================
  // RPC: ASSIGN DEPARTMENT USER (SUPER ADMIN ONLY)
  // ============================================================================
  assignDepartmentUser(
    deptId: string,
    targetUserId: string,
    assignedBy: string,
    reason = 'Administrative re-appointment'
  ) {
    const perms = this.getUserPermissions(assignedBy);
    if (!perms.canManageUsers) {
      throw new Error('PERMISSION_DENIED: Only Super Admin can manage department assignments.');
    }

    const targetUser = this.users.find((u) => u.id === targetUserId && u.is_active);
    if (!targetUser) {
      throw new Error('USER_NOT_FOUND: Target user does not exist or is inactive.');
    }

    // Deactivate previous assignment for this department
    const oldAssignment = this.departmentAssignments.find(
      (a) => a.department_id === deptId && a.is_active
    );
    if (oldAssignment) {
      oldAssignment.is_active = false;
      oldAssignment.deactivated_at = new Date().toISOString();
      oldAssignment.deactivation_reason = reason;
    }

    const newAssignment: DepartmentUserAssignment = {
      id: crypto.randomUUID(),
      department_id: deptId,
      user_id: targetUserId,
      assigned_by: assignedBy,
      is_active: true,
      assigned_at: new Date().toISOString(),
    };
    this.departmentAssignments.push(newAssignment);
    targetUser.department_id = deptId;

    this.auditLogs.unshift({
      id: crypto.randomUUID(),
      table_name: 'department_user_assignments',
      record_id: newAssignment.id,
      action: 'INSERT',
      actor_id: assignedBy,
      old_values: oldAssignment ? { replaced_user_id: oldAssignment.user_id } : null,
      new_values: { new_user_id: targetUserId, department_id: deptId },
      created_at: new Date().toISOString(),
    });

    this.persistState();
    return newAssignment;
  }

  // ============================================================================
  // RPC: CREATE & SUBMIT TRAINING APPLICATION
  // Enforces RBAC: canInputData === true (Blocks PJO)
  // ============================================================================
  createDraftApplication(
    callerId: string,
    data: {
      training_title: string;
      training_category: string;
      training_objectives: string;
      training_provider: string;
      training_location: string;
      proposed_start_date: string;
      proposed_end_date: string;
      estimated_budget: number;
      training_type: TrainingType;
      description: string;
      participant_employee_ids: string[];
      department_id?: string;
      planned_hours?: number;
    }
  ) {
    const perms = this.getUserPermissions(callerId);
    if (!perms.canInputData || perms.trainingData !== 'EDIT') {
      throw new Error('PERMISSION_DENIED: Role Anda tidak memiliki akses untuk menginput data training.');
    }

    const deptId =
      data.department_id ||
      this.getUserActiveDeptId(callerId) ||
      this.departments[0].id;

    if (!data.participant_employee_ids || data.participant_employee_ids.length === 0) {
      throw new Error('NO_PARTICIPANTS: Wajib memilih minimal satu karyawan peserta.');
    }

    const appId = crypto.randomUUID();
    const deptObj = this.departments.find((d) => d.id === deptId);
    const appNumber = `TR-${new Date().getFullYear()}-${deptObj?.code || 'RAJA'}-${Math.floor(100 + Math.random() * 900)}`;

    const newApp: TrainingApplication = {
      id: appId,
      application_number: appNumber,
      department_id: deptId,
      department_name: deptObj?.name,
      submitted_by: callerId,
      training_title: data.training_title,
      training_category: data.training_category,
      training_objectives: data.training_objectives,
      training_provider: data.training_provider,
      training_location: data.training_location,
      proposed_start_date: data.proposed_start_date,
      proposed_end_date: data.proposed_end_date,
      estimated_budget: data.estimated_budget,
      training_type: data.training_type,
      description: data.description,
      current_status: 'DRAFT',
      planned_hours: data.planned_hours || 16,
      actual_hours: 0,
      planned_participants: data.participant_employee_ids.length,
      actual_participants: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.applications.unshift(newApp);

    for (const empId of data.participant_employee_ids) {
      this.participants.push({
        id: crypto.randomUUID(),
        application_id: appId,
        employee_id: empId,
        status: 'PROPOSED',
        created_at: new Date().toISOString(),
      });
    }

    this.persistState();
    return newApp;
  }

  submitApplication(appId: string, callerId: string) {
    const perms = this.getUserPermissions(callerId);
    if (!perms.canInputData && !perms.canEditData) {
      throw new Error('PERMISSION_DENIED: Role Anda tidak memiliki izin untuk mengirim data training.');
    }

    const app = this.applications.find((a) => a.id === appId);
    if (!app) throw new Error('APPLICATION_NOT_FOUND');

    if (app.current_status !== 'DRAFT') {
      throw new Error(`INVALID_STATUS: Application is not in DRAFT status. Current: ${app.current_status}`);
    }

    const callerRole = this.getUserRole(callerId);
    const parts = this.participants.filter((p) => p.application_id === appId);
    if (parts.length === 0) {
      throw new Error('NO_PARTICIPANTS: Training application must contain at least one employee participant.');
    }

    app.current_status = 'UNDER_HOD_REVIEW';
    app.updated_at = new Date().toISOString();

    this.approvalHistory.push({
      id: crypto.randomUUID(),
      application_id: appId,
      actor_id: callerId,
      actor_role: callerRole || 'ADMIN',
      action: 'SUBMIT',
      previous_status: 'DRAFT',
      new_status: 'UNDER_HOD_REVIEW',
      comments: 'Submitted for Manager TC review.',
      action_timestamp: new Date().toISOString(),
    });

    const tcManagers = this.users.filter(
      (u) => (u.role_code === 'MANAGER_TC' || u.role_code === 'ADMIN_TC') && u.is_active
    );
    for (const mgr of tcManagers) {
      this.notifications.push({
        id: crypto.randomUUID(),
        user_id: mgr.id,
        title: 'Pengajuan Training Baru',
        message: `Pengajuan ${app.application_number} menunggu review Training Center.`,
        type: 'HOD_REVIEW',
        reference_id: appId,
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }

    this.persistState();
    return app;
  }

  // ============================================================================
  // RPC: MANAGER TC / STAGE 1 REVIEW APPLICATION
  // ============================================================================
  hodReviewApplication(
    appId: string,
    callerId: string,
    decision: ApprovalDecision,
    comments: string
  ) {
    const app = this.applications.find((a) => a.id === appId);
    if (!app) throw new Error('APPLICATION_NOT_FOUND');

    if (app.current_status !== 'UNDER_HOD_REVIEW') {
      throw new Error(`INVALID_STATUS: Application is not pending review. Current: ${app.current_status}`);
    }

    const callerRole = this.getUserRole(callerId);
    if (
      callerRole !== 'MANAGER_TC' &&
      callerRole !== 'ADMIN_TC' &&
      callerRole !== 'SUPER_ADMIN'
    ) {
      throw new Error('PERMISSION_DENIED: Hanya Manager TC, Admin TC, atau Super Admin yang dapat melakukan review tahap ini.');
    }

    if ((decision === 'RETURN_FOR_REVISION' || decision === 'REJECT') && (!comments || comments.trim() === '')) {
      throw new Error('COMMENT_REQUIRED: A detailed comment/reason is mandatory when returning or rejecting.');
    }

    let newStatus: ApplicationStatus;
    let action: 'HOD_APPROVE' | 'HOD_RETURN' | 'HOD_REJECT';

    if (decision === 'APPROVE') {
      newStatus = 'PENDING_PJO';
      action = 'HOD_APPROVE';
    } else if (decision === 'RETURN_FOR_REVISION') {
      newStatus = 'DRAFT';
      action = 'HOD_RETURN';
    } else {
      newStatus = 'REJECTED';
      action = 'HOD_REJECT';
    }

    app.current_status = newStatus;
    app.hod_approver_id = callerId;
    app.hod_decision = decision;
    app.hod_comments = comments;
    app.hod_reviewed_at = new Date().toISOString();
    app.updated_at = new Date().toISOString();

    this.approvalHistory.push({
      id: crypto.randomUUID(),
      application_id: appId,
      actor_id: callerId,
      actor_role: callerRole || 'MANAGER_TC',
      action,
      previous_status: 'UNDER_HOD_REVIEW',
      new_status: newStatus,
      comments,
      action_timestamp: new Date().toISOString(),
    });

    this.persistState();
    return app;
  }

  // ============================================================================
  // RPC: PJO / FINAL AUTHORIZATION REVIEW
  // ============================================================================
  pjoReviewApplication(
    appId: string,
    callerId: string,
    decision: ApprovalDecision,
    comments: string
  ) {
    const app = this.applications.find((a) => a.id === appId);
    if (!app) throw new Error('APPLICATION_NOT_FOUND');

    if (app.current_status !== 'PENDING_PJO') {
      throw new Error(
        `APPROVAL_SEQUENCE_ERROR: Application is not in PENDING_PJO state (current: ${app.current_status}).`
      );
    }

    const callerRole = this.getUserRole(callerId);
    if (
      callerRole !== 'PJO' &&
      callerRole !== 'MANAGER_TC' &&
      callerRole !== 'SUPER_ADMIN'
    ) {
      throw new Error('PERMISSION_DENIED: Hanya PJO, Manager TC, atau Super Admin yang dapat melakukan otorisasi ini.');
    }

    if ((decision === 'RETURN_FOR_REVISION' || decision === 'REJECT') && (!comments || comments.trim() === '')) {
      throw new Error('COMMENT_REQUIRED: A detailed reason is required when returning or rejecting.');
    }

    let newStatus: ApplicationStatus;
    let action: 'PJO_APPROVE' | 'PJO_RETURN' | 'PJO_REJECT';

    if (decision === 'APPROVE') {
      newStatus = 'APPROVED';
      action = 'PJO_APPROVE';
    } else if (decision === 'RETURN_FOR_REVISION') {
      newStatus = 'DRAFT';
      action = 'PJO_RETURN';
    } else {
      newStatus = 'REJECTED';
      action = 'PJO_REJECT';
    }

    app.current_status = newStatus;
    app.pjo_approver_id = callerId;
    app.pjo_decision = decision;
    app.pjo_comments = comments;
    app.pjo_reviewed_at = new Date().toISOString();
    app.updated_at = new Date().toISOString();

    this.approvalHistory.push({
      id: crypto.randomUUID(),
      application_id: appId,
      actor_id: callerId,
      actor_role: callerRole || 'PJO',
      action,
      previous_status: 'PENDING_PJO',
      new_status: newStatus,
      comments,
      action_timestamp: new Date().toISOString(),
    });

    this.persistState();
    return app;
  }

  // ============================================================================
  // RPC: PJO CANNOT MODIFY APPLICATION PARTICIPANTS
  // ============================================================================
  modifyApplicationParticipants(
    appId: string,
    callerId: string,
    employeeIds: string[]
  ) {
    const perms = this.getUserPermissions(callerId);
    if (!perms.canEditData || perms.trainingData !== 'EDIT') {
      throw new Error('PERMISSION_DENIED: PJO is not authorized to edit application data or participants.');
    }

    const app = this.applications.find((a) => a.id === appId);
    if (!app) throw new Error('APPLICATION_NOT_FOUND');

    this.participants = this.participants.filter((p) => p.application_id !== appId);
    for (const empId of employeeIds) {
      this.participants.push({
        id: crypto.randomUUID(),
        application_id: appId,
        employee_id: empId,
        status: 'PROPOSED',
        created_at: new Date().toISOString(),
      });
    }
    app.planned_participants = employeeIds.length;
  }

  // ============================================================================
  // RPC: SUPER ADMIN REOPEN REJECTED APPLICATION
  // ============================================================================
  superAdminReopenApplication(appId: string, callerId: string, reason: string) {
    const callerRole = this.getUserRole(callerId);
    if (callerRole !== 'SUPER_ADMIN') {
      throw new Error('PERMISSION_DENIED: Only Super Admin can reopen a rejected application.');
    }

    if (!reason || reason.trim() === '') {
      throw new Error('MANDATORY_REASON: A documented justification reason is required to reopen.');
    }

    const app = this.applications.find((a) => a.id === appId);
    if (!app) throw new Error('APPLICATION_NOT_FOUND');

    if (app.current_status !== 'REJECTED' && app.current_status !== 'CANCELLED') {
      throw new Error(`INVALID_STATUS: Only REJECTED/CANCELLED applications can be reopened. Current: ${app.current_status}`);
    }

    const prev = app.current_status;
    app.current_status = 'DRAFT';
    app.updated_at = new Date().toISOString();

    this.approvalHistory.push({
      id: crypto.randomUUID(),
      application_id: appId,
      actor_id: callerId,
      actor_role: 'SUPER_ADMIN',
      action: 'SUPERADMIN_REOPEN',
      previous_status: prev,
      new_status: 'DRAFT',
      comments: `Authorized reopening. Reason: ${reason}`,
      action_timestamp: new Date().toISOString(),
    });

    this.persistState();
    return app;
  }

  // ============================================================================
  // RPC: SCHEDULE APPROVED TRAINING
  // ============================================================================
  scheduleApprovedTraining(
    appId: string,
    callerId: string,
    scheduleData: {
      batch_number: string;
      trainer_name: string;
      venue: string;
      start_date: string;
      end_date: string;
      total_hours: number;
    }
  ) {
    const perms = this.getUserPermissions(callerId);
    if (!perms.canEditData) {
      throw new Error('PERMISSION_DENIED: Role Anda tidak memiliki kewenangan menjadwalkan training.');
    }

    const app = this.applications.find((a) => a.id === appId);
    if (!app) throw new Error('APPLICATION_NOT_FOUND');

    if (app.current_status !== 'APPROVED') {
      throw new Error(
        `APPLICATION_NOT_APPROVED: Only fully approved applications can proceed to scheduling. Current status: ${app.current_status}`
      );
    }

    const callerRole = this.getUserRole(callerId);
    const scheduleId = crypto.randomUUID();
    const newSchedule: TrainingSchedule = {
      id: scheduleId,
      application_id: appId,
      application_title: app.training_title,
      batch_number: scheduleData.batch_number || 'BATCH-1',
      trainer_name: scheduleData.trainer_name,
      venue: scheduleData.venue,
      start_date: scheduleData.start_date,
      end_date: scheduleData.end_date,
      daily_start_time: '08:00:00',
      daily_end_time: '17:00:00',
      total_hours: scheduleData.total_hours || 8.0,
      status: 'SCHEDULED',
      scheduled_by: callerId,
      created_at: new Date().toISOString(),
    };
    this.schedules.push(newSchedule);

    app.current_status = 'SCHEDULED';
    app.planned_hours = scheduleData.total_hours || app.planned_hours || 16;
    app.updated_at = new Date().toISOString();

    const appParts = this.participants.filter((p) => p.application_id === appId);
    for (const part of appParts) {
      this.records.push({
        id: crypto.randomUUID(),
        schedule_id: scheduleId,
        application_id: appId,
        employee_id: part.employee_id,
        attendance_status: 'ENROLLED',
        result_status: 'PENDING',
        passed: false,
        training_hours_completed: 0,
        certificate_issued: false,
        created_at: new Date().toISOString(),
      });
    }

    this.approvalHistory.push({
      id: crypto.randomUUID(),
      application_id: appId,
      actor_id: callerId,
      actor_role: callerRole || 'MANAGER_TC',
      action: 'HOD_APPROVE',
      previous_status: 'APPROVED',
      new_status: 'SCHEDULED',
      comments: `Training execution scheduled. Venue: ${scheduleData.venue}`,
      action_timestamp: new Date().toISOString(),
    });

    this.persistState();
    return newSchedule;
  }

  // ============================================================================
  // RPC: COMPLETE TRAINING EXECUTION & UPDATE RECORDS
  // ============================================================================
  completeTrainingExecution(
    scheduleId: string,
    callerId: string,
    results: {
      employee_id: string;
      attended: boolean;
      score: number;
      passed: boolean;
      hours: number;
      issue_certificate?: boolean;
    }[]
  ) {
    const perms = this.getUserPermissions(callerId);
    if (!perms.canEditData) {
      throw new Error('PERMISSION_DENIED: Role Anda tidak memiliki izin mencatat realisasi training.');
    }

    const sched = this.schedules.find((s) => s.id === scheduleId);
    if (!sched) throw new Error('SCHEDULE_NOT_FOUND');

    const app = this.applications.find((a) => a.id === sched.application_id);

    sched.status = 'COMPLETED';
    const attendedCount = results.filter((r) => r.attended).length;
    const maxHours = results.reduce((max, r) => Math.max(max, r.hours || 0), sched.total_hours);

    if (app) {
      app.current_status = 'COMPLETED';
      app.actual_participants = Math.max(attendedCount, app.actual_participants || 0);
      app.actual_hours = maxHours;
      app.updated_at = new Date().toISOString();
    }

    for (const res of results) {
      const rec = this.records.find(
        (r) => r.schedule_id === scheduleId && r.employee_id === res.employee_id
      );
      if (rec) {
        rec.attendance_status = res.attended ? 'ATTENDED' : 'ABSENT';
        rec.final_score = res.score;
        rec.passed = res.passed;
        rec.result_status = res.passed ? 'PASSED' : 'FAILED';
        rec.training_hours_completed = res.hours;
        rec.completed_at = new Date().toISOString();

        if (res.issue_certificate && res.passed) {
          rec.certificate_issued = true;
          const daysCount = Math.max(1, Math.round((res.hours || sched.total_hours || 8) / 8));
          this.certifications.unshift({
            id: crypto.randomUUID(),
            employee_id: res.employee_id,
            record_id: rec.id,
            certificate_number: `CERT-RAJA-${Date.now().toString().slice(-6)}`,
            certificate_name: app ? app.training_title : 'Certified Competency',
            issuing_body: app ? app.training_provider : 'PT RAJA Training Center',
            certification_level: 'Certified',
            issue_date: sched.end_date || new Date().toISOString().split('T')[0],
            duration_label: `${daysCount} ${daysCount > 1 ? 'Days' : 'Day'} (${res.hours || sched.total_hours} Hours)`,
            venue: sched.venue || (app ? app.training_location : 'Training Center Morowali'),
            is_lifetime: false,
            status: 'ACTIVE',
            created_at: new Date().toISOString(),
          });
        }
      }
    }

    const year = new Date(sched.start_date).getFullYear() || 2026;
    this.recalculateKpis(year);
    this.persistState();

    return sched;
  }

  updateEmployeePhoto(employeeId: string, photoUrl: string) {
    const emp = this.employees.find((e) => e.id === employeeId);
    if (emp) {
      emp.photo_url = photoUrl;
      this.persistState();
    }
  }

  // ============================================================================
  // EMPLOYEE MANAGEMENT & BULK CSV UPLOAD ENGINE
  // ============================================================================
  addEmployee(
    actorId: string,
    payload: {
      nik: string;
      full_name: string;
      department_id: string;
      position: string;
      job_level: string;
      employment_status?: 'PERMANENT' | 'CONTRACT' | 'INTERN';
      project_site?: string;
      email?: string;
    }
  ): Employee {
    const perms = this.getUserPermissions(actorId);
    if (!perms.canInputData || perms.employeeData === 'VIEW') {
      throw new Error('Forbidden: Role Anda hanya memiliki akses Lihat (View Only) pada Data Karyawan dan tidak dapat menambah data karyawan.');
    }

    const actor = this.users.find((u) => u.id === actorId);
    if (!actor || !actor.is_active) {
      throw new Error('Unauthorized: User not active.');
    }

    const cleanNik = payload.nik.trim().toUpperCase();
    if (!cleanNik || !payload.full_name.trim()) {
      throw new Error('NIK dan Nama Lengkap wajib diisi.');
    }

    const exists = this.employees.find((e) => e.nik.toUpperCase() === cleanNik);
    if (exists) {
      throw new Error(`Karyawan dengan NIK ${cleanNik} sudah terdaftar (${exists.full_name}).`);
    }

    const dept = this.departments.find((d) => d.id === payload.department_id);
    if (!dept) {
      throw new Error('Departemen tidak valid.');
    }

    const selectedSite =
      payload.project_site?.trim() || this.sites[0]?.name || 'Site Tangofa';

    const newEmp: Employee = {
      id: crypto.randomUUID(),
      nik: cleanNik,
      full_name: payload.full_name.trim(),
      email: payload.email || `${cleanNik.toLowerCase().replace(/[^a-z0-9]/g, '')}@ptraja.com`,
      phone_number: '+62811000999',
      department_id: dept.id,
      department_name: dept.name,
      position: payload.position.trim() || 'Operator Tambang',
      job_level: payload.job_level.trim() || 'Staff / Operator',
      project_site: selectedSite,
      hire_date: new Date().toISOString().split('T')[0],
      employment_status: payload.employment_status || 'PERMANENT',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    this.employees.push(newEmp);

    this.auditLogs.unshift({
      id: crypto.randomUUID(),
      actor_id: actor.id,
      actor_name: actor.full_name,
      table_name: 'employees',
      record_id: newEmp.id,
      action: 'INSERT',
      new_values: {
        nik: newEmp.nik,
        full_name: newEmp.full_name,
        department: dept.code,
        project_site: newEmp.project_site,
      },
      created_at: new Date().toISOString(),
    });

    this.persistState();
    return newEmp;
  }

  updateEmployee(
    actorId: string,
    employeeId: string,
    updates: {
      nik: string;
      full_name: string;
      department_id: string;
      position: string;
      job_level: string;
      employment_status: 'PERMANENT' | 'CONTRACT' | 'INTERN';
      project_site?: string;
    }
  ): Employee {
    const perms = this.getUserPermissions(actorId);
    if (!perms.canEditData || perms.employeeData === 'VIEW') {
      throw new Error(
        'PERMISSION_DENIED: Role Anda tidak memiliki akses Edit pada Data Karyawan.'
      );
    }

    const emp = this.employees.find((e) => e.id === employeeId);
    if (!emp) {
      throw new Error('Karyawan tidak ditemukan.');
    }

    const cleanNik = updates.nik.trim().toUpperCase();
    const cleanName = updates.full_name.trim();
    if (!cleanNik || !cleanName) {
      throw new Error('NIK dan Nama Lengkap wajib diisi.');
    }

    const duplicate = this.employees.find(
      (e) => e.id !== employeeId && e.nik.toUpperCase() === cleanNik
    );
    if (duplicate) {
      throw new Error(`NIK ${cleanNik} sudah digunakan oleh karyawan lain (${duplicate.full_name}).`);
    }

    const dept = this.departments.find((d) => d.id === updates.department_id);
    if (!dept) {
      throw new Error('Departemen tidak valid.');
    }

    const oldSnapshot = {
      nik: emp.nik,
      full_name: emp.full_name,
      department_name: emp.department_name,
      position: emp.position,
      job_level: emp.job_level,
      employment_status: emp.employment_status,
      project_site: emp.project_site,
    };

    emp.nik = cleanNik;
    emp.full_name = cleanName;
    emp.department_id = dept.id;
    emp.department_name = dept.name;
    emp.position = updates.position.trim() || 'Operator Tambang';
    emp.job_level = updates.job_level.trim() || 'Staff / Operator';
    emp.employment_status = updates.employment_status || 'PERMANENT';
    if (updates.project_site !== undefined) {
      emp.project_site = updates.project_site.trim() || this.sites[0]?.name || 'Site Tangofa';
    }

    this.auditLogs.unshift({
      id: crypto.randomUUID(),
      actor_id: actorId,
      table_name: 'employees',
      record_id: emp.id,
      action: 'UPDATE_EMPLOYEE',
      old_values: oldSnapshot,
      new_values: {
        nik: emp.nik,
        full_name: emp.full_name,
        department: dept.code,
        position: emp.position,
        job_level: emp.job_level,
        employment_status: emp.employment_status,
        project_site: emp.project_site,
      },
      created_at: new Date().toISOString(),
    });

    this.recalculateKpis(2026);
    this.persistState();
    return emp;
  }

  deleteEmployee(actorId: string, employeeId: string) {
    const perms = this.getUserPermissions(actorId);
    if (!perms.canDeleteData) {
      throw new Error('PERMISSION_DENIED: Role Anda tidak memiliki hak akses Delete Data.');
    }
    const index = this.employees.findIndex((e) => e.id === employeeId);
    if (index === -1) throw new Error('Karyawan tidak ditemukan.');
    const emp = this.employees[index];

    this.employees.splice(index, 1);
    this.participants = this.participants.filter((p) => p.employee_id !== employeeId);
    this.records = this.records.filter((r) => r.employee_id !== employeeId);
    this.certifications = this.certifications.filter((c) => c.employee_id !== employeeId);

    this.auditLogs.unshift({
      id: crypto.randomUUID(),
      actor_id: actorId,
      table_name: 'employees',
      record_id: employeeId,
      action: 'DELETE_EMPLOYEE',
      old_values: { nik: emp.nik, full_name: emp.full_name, department: emp.department_name },
      new_values: null,
      created_at: new Date().toISOString(),
    });
    this.recalculateKpis(2026);
    this.persistState();
    return true;
  }

  deleteAllEmployees(actorId: string) {
    const perms = this.getUserPermissions(actorId);
    if (!perms.canDeleteData) {
      throw new Error('PERMISSION_DENIED: Role Anda tidak memiliki hak akses Delete Data.');
    }

    const removedCount = this.employees.length;
    this.employees = [];
    this.participants = [];
    this.records = [];
    this.certifications = [];

    this.auditLogs.unshift({
      id: crypto.randomUUID(),
      actor_id: actorId,
      table_name: 'employees',
      record_id: 'ALL_EMPLOYEES',
      action: 'DELETE_ALL_EMPLOYEES',
      old_values: { total_deleted: removedCount },
      new_values: null,
      created_at: new Date().toISOString(),
    });
    this.recalculateKpis(2026);
    this.persistState();
    return removedCount;
  }

  bulkUploadEmployees(
    actorId: string,
    rows: Array<{
      nik?: string;
      full_name: string;
      department_code?: string;
      department_id?: string;
      position?: string;
      job_level?: string;
      employment_status?: string;
      project_site?: string;
    }>
  ): { added: Employee[]; skipped: string[] } {
    const perms = this.getUserPermissions(actorId);
    if (!perms.canInputData || perms.employeeData === 'VIEW') {
      throw new Error('Forbidden: Role Anda hanya memiliki akses Lihat (View Only) pada Data Karyawan dan tidak dapat mengunggah data karyawan.');
    }

    const added: Employee[] = [];
    const skipped: string[] = [];

    rows.forEach((row, idx) => {
      const name = (row.full_name || '').trim();
      if (!name) return;

      let targetDeptId = row.department_id || '';
      if (!targetDeptId && row.department_code) {
        const foundDept = this.departments.find(
          (d) => d.code.toUpperCase() === row.department_code!.trim().toUpperCase()
        );
        if (foundDept) targetDeptId = foundDept.id;
      }

      if (!targetDeptId) {
        targetDeptId = this.departments[0].id;
      }

      const dept = this.departments.find((d) => d.id === targetDeptId);
      if (!dept) {
        skipped.push(`Baris ${idx + 1} (${name}): Departemen tidak ditemukan`);
        return;
      }

      const generatedNik =
        row.nik && row.nik.trim()
          ? row.nik.trim().toUpperCase()
          : `RAJA-${dept.code}-${Math.floor(100 + Math.random() * 900)}`;

      if (this.employees.some((e) => e.nik.toUpperCase() === generatedNik)) {
        skipped.push(`${generatedNik} (${name}): NIK sudah terdaftar`);
        return;
      }

      const statusRaw = (row.employment_status || 'PERMANENT').trim().toUpperCase();
      const empStatus: 'PERMANENT' | 'CONTRACT' | 'INTERN' =
        statusRaw === 'CONTRACT' || statusRaw === 'INTERN' ? statusRaw : 'PERMANENT';

      try {
        const emp = this.addEmployee(actorId, {
          nik: generatedNik,
          full_name: name,
          department_id: dept.id,
          position: row.position || 'Specialist / Operator',
          job_level: row.job_level || 'Operator',
          employment_status: empStatus,
          project_site: row.project_site || this.sites[0]?.name || 'Site Tangofa',
        });
        added.push(emp);
      } catch (err: any) {
        skipped.push(`${name}: ${err.message}`);
      }
    });

    return { added, skipped };
  }

  // ============================================================================
  // KPI COMPUTATION ENGINE
  // ============================================================================
  recalculateKpis(year: number) {
    const totalEmployees = Math.max(this.employees.filter((e) => e.is_active).length, 1);

    const summary = this.calculateTrainingAchievement({ year: String(year) });
    const totalHoursCompleted = summary.totalTrainingHours;
    const avgHoursPerEmp = Math.round((totalHoursCompleted / totalEmployees) * 100) / 100;

    const evaluatedRecords = this.records.filter(
      (r) => r.attendance_status === 'ATTENDED' && r.result_status !== 'PENDING'
    );
    const passedCount = evaluatedRecords.filter((r) => r.passed).length;
    const passRate =
      evaluatedRecords.length > 0
        ? Math.round((passedCount / evaluatedRecords.length) * 10000) / 100
        : 0;

    const completionRate = summary.achievementPercentage ?? 0;

    const results: KpiResult[] = [];

    for (const def of this.kpiDefinitions) {
      let actualVal = 0;
      if (def.code === 'KPI_HOURS_PER_EMP') actualVal = avgHoursPerEmp;
      else if (def.code === 'KPI_PASS_RATE') actualVal = passRate;
      else if (def.code === 'KPI_COMPLETION_RATE') actualVal = completionRate;

      const target = this.kpiTargets.find(
        (t) => t.kpi_id === def.id && t.year === year && t.department_id === null
      );
      const targetVal = target ? target.target_value : 1;

      const score = Math.min(Math.round((actualVal / targetVal) * 10000) / 100, 120);

      const weight = this.kpiWeights.find((w) => w.kpi_id === def.id && w.year === year);
      const weightPct = weight ? weight.weight_percentage : 0;

      const weightedScore = Math.round(((score * weightPct) / 100) * 100) / 100;

      results.push({
        id: crypto.randomUUID(),
        kpi_id: def.id,
        kpi_code: def.code,
        kpi_name: def.name,
        unit: def.unit,
        department_id: null,
        year,
        period: 'ANNUAL',
        actual_value: actualVal,
        target_value: targetVal,
        score,
        weight_percentage: weightPct,
        weighted_score: weightedScore,
        last_calculated_at: new Date().toISOString(),
      });
    }

    this.kpiResults = results;
  }
}

export const mockStore = new DataStore();
