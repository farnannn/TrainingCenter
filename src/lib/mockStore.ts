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
  getRolePermissions,
  SystemSettingsConfig,
} from './types';
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
export interface AchievementFilter {
  year?: string;
  month?: string;
  departmentId?: string;
  trainingType?: string;
  statusCategory?: string; // 'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'CANCELLED'
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

class DataStore {
  roles: Role[] = [...INITIAL_ROLES];
  departments: Department[] = [...INITIAL_DEPARTMENTS];
  users: UserProfile[] = [...INITIAL_USERS];
  departmentAssignments: DepartmentUserAssignment[] = [...INITIAL_DEPARTMENT_ASSIGNMENTS];
  employees: Employee[] = [...INITIAL_EMPLOYEES];
  programs: TrainingProgram[] = [...INITIAL_PROGRAMS];
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
  // ============================================================================
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

    const items: TrainingPerformanceItem[] = [];

    uniqueAppsMap.forEach((app) => {
      const startDate = app.proposed_start_date || app.created_at.slice(0, 10);
      const [appYear, appMonth] = startDate.split('-');

      // Filter by Year
      if (filters.year && filters.year !== 'ALL' && appYear !== filters.year) {
        return;
      }

      // Filter by Month ('01'..'12')
      if (filters.month && filters.month !== 'ALL' && appMonth !== filters.month) {
        return;
      }

      // Filter by Department
      if (
        filters.departmentId &&
        filters.departmentId !== 'ALL' &&
        app.department_id !== filters.departmentId
      ) {
        return;
      }

      // Filter by Training Type
      if (
        filters.trainingType &&
        filters.trainingType !== 'ALL' &&
        app.training_type !== filters.trainingType
      ) {
        return;
      }

      const statusCategory = categorizeStatus(app.current_status);

      // Filter by Status Category
      if (
        filters.statusCategory &&
        filters.statusCategory !== 'ALL' &&
        statusCategory !== filters.statusCategory
      ) {
        return;
      }

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
        statusCategory === 'COMPLETED'
          ? app.actual_participants !== undefined && app.actual_participants > 0
            ? app.actual_participants
            : Math.max(appRecords.length, (app.participants || []).length)
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

      items.push({
        id: app.id,
        applicationNumber: app.application_number,
        trainingTitle: app.training_title,
        trainingCategory: app.training_category,
        trainingType: app.training_type,
        departmentId: app.department_id,
        departmentCode: dept?.code || 'RAJA',
        departmentName: dept?.name || app.department_name || '-',
        startDate: app.proposed_start_date,
        endDate: app.proposed_end_date,
        status: app.current_status,
        statusCategory,
        plannedParticipants,
        actualParticipants,
        plannedHours,
        actualHours,
        participantNames,
      });
    });

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

    const totalManpowerPlanned = items.reduce((s, i) => s + i.plannedParticipants, 0);
    const totalManpowerTrained = items.reduce((s, i) => s + i.actualParticipants, 0);
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
        manpowerPlanned: deptItems.reduce((s, i) => s + i.plannedParticipants, 0),
        manpowerTrained: deptItems.reduce((s, i) => s + i.actualParticipants, 0),
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

      return {
        monthIndex: idx + 1,
        monthLabel: label,
        plan,
        realization,
        pending,
        cancelled,
        achievementPct,
        manpowerTrained: mItems.reduce((s, i) => s + i.actualParticipants, 0),
        actualHours: mItems.reduce((s, i) => s + i.actualHours, 0),
      };
    });

    // Training Type Breakdown
    const typeConfigs: Array<{ type: TrainingType; label: string }> = [
      { type: 'CERTIFICATION', label: 'Sertifikasi BNSP / ESDM' },
      { type: 'INTERNAL', label: 'Internal Training Center' },
      { type: 'IN_HOUSE', label: 'In-House Workshop' },
      { type: 'EXTERNAL', label: 'External Training' },
    ];

    const typeBreakdown = typeConfigs.map((tc) => {
      const tItems = items.filter((i) => i.trainingType === tc.type);
      const plan = tItems.length;
      const realization = tItems.filter((i) => i.statusCategory === 'COMPLETED').length;
      const achievementPct =
        plan > 0 ? Math.round((realization / plan) * 1000) / 10 : null;
      return {
        type: tc.type,
        label: tc.label,
        plan,
        realization,
        achievementPct,
        manpowerTrained: tItems.reduce((s, i) => s + i.actualParticipants, 0),
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
    const callerRole = this.getUserRole(callerId);
    const perms = this.getUserPermissions(callerId);
    if (callerRole !== 'SUPER_ADMIN' || !perms.canDeleteData) {
      throw new Error('PERMISSION_DENIED: Hanya Super Admin yang memiliki izin untuk menghapus data training.');
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
    const callerRole = this.getUserRole(callerId);
    if (callerRole !== 'SUPER_ADMIN') {
      throw new Error('PERMISSION_DENIED: Hanya Super Admin yang dapat menghapus seluruh data training.');
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
      training_type: 'INTERNAL' | 'EXTERNAL' | 'CERTIFICATION' | 'IN_HOUSE';
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
      email?: string;
    }
  ): Employee {
    const perms = this.getUserPermissions(actorId);
    if (!perms.canInputData) {
      throw new Error('Forbidden: Role Anda (View Only) tidak memiliki akses menambah data karyawan.');
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
      new_values: { nik: newEmp.nik, full_name: newEmp.full_name, department: dept.code },
      created_at: new Date().toISOString(),
    });

    this.persistState();
    return newEmp;
  }

  deleteEmployee(actorId: string, employeeId: string) {
    const callerRole = this.getUserRole(actorId);
    if (callerRole !== 'SUPER_ADMIN') {
      throw new Error('PERMISSION_DENIED: Hanya Super Admin yang dapat menghapus data karyawan.');
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
    const callerRole = this.getUserRole(actorId);
    if (callerRole !== 'SUPER_ADMIN') {
      throw new Error('PERMISSION_DENIED: Hanya Super Admin yang dapat menghapus seluruh data karyawan.');
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
    }>
  ): { added: Employee[]; skipped: string[] } {
    const perms = this.getUserPermissions(actorId);
    if (!perms.canInputData) {
      throw new Error('Forbidden: Role Anda tidak memiliki hak akses mengunggah data karyawan.');
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
