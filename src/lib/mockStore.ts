// ==============================================================================
// THR DASHBOARD DATA STORE & BUSINESS ENGINE
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
  RoleCode
} from './types';

// ==============================================================================
// INITIAL SEED DATA (Matches 20261106000006_seed_data.sql)
// ==============================================================================

export const INITIAL_ROLES: Role[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    code: 'SUPER_ADMIN',
    name: 'Super Admin',
    description: 'Full administrative authorization across all enterprise modules and master controls',
    access_level: 1,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    code: 'ADMIN_HOD_TC',
    name: 'Admin HOD Training Center',
    description: 'Training Center Head. Manages first-stage application reviews, training execution, catalogue & certifications',
    access_level: 2,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    code: 'ADMIN_PJO',
    name: 'Admin PJO',
    description: 'Penanggung Jawab Operasional. Centralized final authorization authority for company-wide training',
    access_level: 2,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    code: 'DEPARTMENT_USER',
    name: 'Department User',
    description: 'Designated department training representative responsible for submitting applications for department personnel',
    access_level: 3,
    created_at: '2026-01-01T00:00:00Z',
  },
];

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    code: 'MOD',
    name: 'Mining Operations Department',
    description: 'Pit operations, heavy haulage, excavation and earthmoving',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    code: 'MED',
    name: 'Mining Engineering Department',
    description: 'Mine planning, geology, geotechnical stability, survey and design',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000003',
    code: 'HRGA',
    name: 'Human Resources & General Affairs',
    description: 'People operations, talent, and administration',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000004',
    code: 'TC',
    name: 'Training Center',
    description: 'Competency development and operational certification',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000005',
    code: 'HSE',
    name: 'Health Safety & Environment',
    description: 'Mine safety, environmental standards and compliance',
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
    nik: 'NIK-ADMIN-01',
    full_name: 'Super Administrator',
    email: 'superadmin@ptraja.com',
    phone_number: '+62811000001',
    department_id: null,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    role_id: '10000000-0000-0000-0000-000000000002',
    role_code: 'ADMIN_HOD_TC',
    role_name: 'Admin HOD Training Center',
    nik: 'NIK-HOD-01',
    full_name: 'HOD Training Center',
    email: 'hod.training@ptraja.com',
    phone_number: '+62811000002',
    department_id: '20000000-0000-0000-0000-000000000004',
    department_name: 'Training Center',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    role_id: '10000000-0000-0000-0000-000000000003',
    role_code: 'ADMIN_PJO',
    role_name: 'Admin PJO',
    nik: 'NIK-PJO-01',
    full_name: 'Bambang Sutrisno (PJO)',
    email: 'pjo@ptraja.com',
    phone_number: '+62811000003',
    department_id: null,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    role_id: '10000000-0000-0000-0000-000000000004',
    role_code: 'DEPARTMENT_USER',
    role_name: 'Department User',
    nik: 'NIK-MOD-REP',
    full_name: 'Ahmad Fauzi (MOD Rep)',
    email: 'dept.mod@ptraja.com',
    phone_number: '+62811000004',
    department_id: '20000000-0000-0000-0000-000000000001',
    department_name: 'Mining Operations Department',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    role_id: '10000000-0000-0000-0000-000000000004',
    role_code: 'DEPARTMENT_USER',
    role_name: 'Department User',
    nik: 'NIK-MED-REP',
    full_name: 'Siti Rahma (MED Rep)',
    email: 'dept.med@ptraja.com',
    phone_number: '+62811000005',
    department_id: '20000000-0000-0000-0000-000000000002',
    department_name: 'Mining Engineering Department',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    role_id: '10000000-0000-0000-0000-000000000004',
    role_code: 'DEPARTMENT_USER',
    role_name: 'Department User',
    nik: 'NIK-HRGA-REP',
    full_name: 'Farid Nafis (HRGA Rep)',
    email: 'dept.hrga@ptraja.com',
    phone_number: '+62811000006',
    department_id: '20000000-0000-0000-0000-000000000003',
    department_name: 'Human Resources & General Affairs',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
];

export const INITIAL_DEPARTMENT_ASSIGNMENTS: DepartmentUserAssignment[] = [
  {
    id: '30000000-0000-0000-0000-000000000001',
    department_id: '20000000-0000-0000-0000-000000000001',
    department_name: 'Mining Operations Department',
    user_id: '00000000-0000-0000-0000-000000000004',
    user_name: 'Ahmad Fauzi (MOD Rep)',
    assigned_by: '00000000-0000-0000-0000-000000000001',
    assigned_by_name: 'Super Administrator',
    is_active: true,
    assigned_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '30000000-0000-0000-0000-000000000002',
    department_id: '20000000-0000-0000-0000-000000000002',
    department_name: 'Mining Engineering Department',
    user_id: '00000000-0000-0000-0000-000000000005',
    user_name: 'Siti Rahma (MED Rep)',
    assigned_by: '00000000-0000-0000-0000-000000000001',
    assigned_by_name: 'Super Administrator',
    is_active: true,
    assigned_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '30000000-0000-0000-0000-000000000003',
    department_id: '20000000-0000-0000-0000-000000000003',
    department_name: 'Human Resources & General Affairs',
    user_id: '00000000-0000-0000-0000-000000000006',
    user_name: 'Farid Nafis (HRGA Rep)',
    assigned_by: '00000000-0000-0000-0000-000000000001',
    assigned_by_name: 'Super Administrator',
    is_active: true,
    assigned_at: '2026-01-01T00:00:00Z',
  },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  // MOD employees
  {
    id: '40000000-0000-0000-0000-000000000001',
    department_id: '20000000-0000-0000-0000-000000000001',
    department_name: 'Mining Operations Department',
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
    department_name: 'Mining Operations Department',
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
    department_name: 'Mining Operations Department',
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
    department_name: 'Mining Engineering Department',
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
    department_name: 'Mining Engineering Department',
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
  // HRGA employees
  {
    id: '40000000-0000-0000-0000-000000000006',
    department_id: '20000000-0000-0000-0000-000000000003',
    department_name: 'Human Resources & General Affairs',
    nik: 'EMP-HRGA-001',
    full_name: 'Sri Fidyanti',
    position: 'HR Operations Officer',
    job_level: 'Staff',
    email: 'sri.fidyanti@ptraja.com',
    hire_date: '2024-02-01',
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
    calculation_formula: '(Completed Sessions / Scheduled Sessions) * 100',
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
// PERSISTENT IN-MEMORY OR LOCALSTORAGE STORE
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

  constructor() {
    this.seedInitialSampleApplication();
    this.recalculateKpis(2026);
  }

  private seedInitialSampleApplication() {
    const appId = '90000000-0000-0000-0000-000000000001';
    const app: TrainingApplication = {
      id: appId,
      application_number: 'TR-2026-MOD-001',
      department_id: '20000000-0000-0000-0000-000000000001',
      department_name: 'Mining Operations Department',
      submitted_by: '00000000-0000-0000-0000-000000000004',
      submitter_name: 'Ahmad Fauzi (MOD Rep)',
      training_title: 'Pengawas Operasional Pertama (POP) Batch 1',
      training_category: 'Certification',
      training_objectives: 'Fulfilling mandatory ESDM competency certification for pit operational foremen',
      training_provider: 'LSP PERHAPI Mandiri',
      training_location: 'Training Center Room 1 / On-Site',
      proposed_start_date: '2026-11-20',
      proposed_end_date: '2026-11-24',
      estimated_budget: 15000000.0,
      training_type: 'CERTIFICATION',
      description: 'Compulsory competency certification for mining operations foremen.',
      current_status: 'UNDER_HOD_REVIEW',
      created_at: '2026-11-01T08:00:00Z',
      updated_at: '2026-11-01T08:30:00Z',
    };
    this.applications.push(app);

    this.participants.push(
      {
        id: '91000000-0000-0000-0000-000000000001',
        application_id: appId,
        employee_id: '40000000-0000-0000-0000-000000000003', // Rudi Hartono (Pit Foreman)
        notes: 'Priority requirement for pit supervision',
        status: 'PROPOSED',
        created_at: '2026-11-01T08:00:00Z',
      },
      {
        id: '91000000-0000-0000-0000-000000000002',
        application_id: appId,
        employee_id: '40000000-0000-0000-0000-000000000001', // Budi Santoso
        notes: 'Promoted candidate for junior foreman',
        status: 'PROPOSED',
        created_at: '2026-11-01T08:00:00Z',
      }
    );

    this.approvalHistory.push({
      id: '92000000-0000-0000-0000-000000000001',
      application_id: appId,
      actor_id: '00000000-0000-0000-0000-000000000004',
      actor_name: 'Ahmad Fauzi (MOD Rep)',
      actor_role: 'DEPARTMENT_USER',
      action: 'SUBMIT',
      previous_status: 'DRAFT',
      new_status: 'UNDER_HOD_REVIEW',
      comments: 'Submitted initial application with 2 foremen participants.',
      action_timestamp: '2026-11-01T08:30:00Z',
    });

    this.notifications.push({
      id: '93000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000002', // HOD TC
      title: 'New Training Application Submitted',
      message: 'Application TR-2026-MOD-001 (Pengawas Operasional Pertama) is waiting for your review.',
      type: 'HOD_REVIEW',
      reference_id: appId,
      is_read: false,
      created_at: '2026-11-01T08:30:00Z',
    });
  }

  // ============================================================================
  // RLS SIMULATION HELPERS
  // ============================================================================
  getUserRole(userId: string): RoleCode | null {
    const user = this.users.find((u) => u.id === userId && u.is_active);
    return user ? user.role_code : null;
  }

  getUserActiveDeptId(userId: string): string | null {
    const assignment = this.departmentAssignments.find(
      (a) => a.user_id === userId && a.is_active
    );
    return assignment ? assignment.department_id : null;
  }

  // Filter Employees based on caller (Test Scenario 1: MOD user cannot see MED employees)
  getVisibleEmployees(callerId: string): Employee[] {
    const role = this.getUserRole(callerId);
    if (role === 'SUPER_ADMIN' || role === 'ADMIN_HOD_TC' || role === 'ADMIN_PJO') {
      return this.employees.filter((e) => e.is_active);
    }
    if (role === 'DEPARTMENT_USER') {
      const deptId = this.getUserActiveDeptId(callerId);
      return this.employees.filter((e) => e.is_active && e.department_id === deptId);
    }
    return [];
  }

  // Filter Applications based on caller
  getVisibleApplications(callerId: string): TrainingApplication[] {
    const role = this.getUserRole(callerId);
    let apps = [...this.applications];

    if (role === 'DEPARTMENT_USER') {
      const deptId = this.getUserActiveDeptId(callerId);
      apps = apps.filter((a) => a.department_id === deptId);
    }

    // Attach participants & relations
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
  // RPC: ASSIGN DEPARTMENT USER (SUPER ADMIN ONLY)
  // Satisfies Test Scenario 2: One department cannot create a second active department user.
  // ============================================================================
  assignDepartmentUser(
    deptId: string,
    targetUserId: string,
    assignedBy: string,
    reason = 'Administrative re-appointment'
  ) {
    const callerRole = this.getUserRole(assignedBy);
    if (callerRole !== 'SUPER_ADMIN') {
      throw new Error('PERMISSION_DENIED: Only Super Admin can manage department assignments.');
    }

    const targetUser = this.users.find((u) => u.id === targetUserId && u.is_active);
    if (!targetUser) {
      throw new Error('USER_NOT_FOUND: Target user does not exist or is inactive.');
    }
    if (targetUser.role_code !== 'DEPARTMENT_USER') {
      throw new Error(
        `INVALID_ROLE: Assigned user must have role DEPARTMENT_USER. Current: ${targetUser.role_code}`
      );
    }

    // Check if target user is already assigned to ANOTHER department
    const existingOtherDept = this.departmentAssignments.find(
      (a) => a.user_id === targetUserId && a.is_active && a.department_id !== deptId
    );
    if (existingOtherDept) {
      throw new Error(
        'USER_ALREADY_ASSIGNED: User is already active representative for another department.'
      );
    }

    // Deactivate previous assignment for this department (ensures exactly 1 active user per dept)
    const oldAssignment = this.departmentAssignments.find(
      (a) => a.department_id === deptId && a.is_active
    );
    if (oldAssignment) {
      oldAssignment.is_active = false;
      oldAssignment.deactivated_at = new Date().toISOString();
      oldAssignment.deactivation_reason = reason;

      this.notifications.push({
        id: crypto.randomUUID(),
        user_id: oldAssignment.user_id,
        title: 'Department Representative Role Concluded',
        message: 'Your active assignment as department representative has been transitioned.',
        type: 'ASSIGNMENT_CHANGED',
        reference_id: deptId,
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }

    // Insert new assignment
    const newAssignment: DepartmentUserAssignment = {
      id: crypto.randomUUID(),
      department_id: deptId,
      user_id: targetUserId,
      assigned_by: assignedBy,
      is_active: true,
      assigned_at: new Date().toISOString(),
    };
    this.departmentAssignments.push(newAssignment);

    // Update target user profile department
    targetUser.department_id = deptId;

    // Audit log
    this.auditLogs.push({
      id: crypto.randomUUID(),
      table_name: 'department_user_assignments',
      record_id: newAssignment.id,
      action: 'INSERT',
      actor_id: assignedBy,
      old_values: oldAssignment ? { replaced_user_id: oldAssignment.user_id } : null,
      new_values: { new_user_id: targetUserId, department_id: deptId },
      created_at: new Date().toISOString(),
    });

    return newAssignment;
  }

  // ============================================================================
  // RPC: CREATE & SUBMIT TRAINING APPLICATION
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
    }
  ) {
    const callerRole = this.getUserRole(callerId);
    let deptId = this.getUserActiveDeptId(callerId);

    if (callerRole !== 'DEPARTMENT_USER' && callerRole !== 'SUPER_ADMIN') {
      throw new Error('PERMISSION_DENIED: Only active Department Users or Super Admin can create applications.');
    }

    if (!deptId) {
      if (callerRole === 'SUPER_ADMIN') {
        deptId = this.departments[0].id; // Fallback for Super Admin
      } else {
        throw new Error('NO_DEPARTMENT: User is not assigned to an active department.');
      }
    }

    if (!data.participant_employee_ids || data.participant_employee_ids.length === 0) {
      throw new Error('NO_PARTICIPANTS: Must select at least one employee participant.');
    }

    // Verify all participants belong to caller's department
    for (const empId of data.participant_employee_ids) {
      const emp = this.employees.find((e) => e.id === empId);
      if (!emp || emp.department_id !== deptId) {
        throw new Error(`DEPARTMENT_MISMATCH: Employee ${emp?.full_name || empId} does not belong to your department.`);
      }
    }

    const appId = crypto.randomUUID();
    const appNumber = `TR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newApp: TrainingApplication = {
      id: appId,
      application_number: appNumber,
      department_id: deptId,
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.applications.push(newApp);

    for (const empId of data.participant_employee_ids) {
      this.participants.push({
        id: crypto.randomUUID(),
        application_id: appId,
        employee_id: empId,
        status: 'PROPOSED',
        created_at: new Date().toISOString(),
      });
    }

    return newApp;
  }

  submitApplication(appId: string, callerId: string) {
    const app = this.applications.find((a) => a.id === appId);
    if (!app) throw new Error('APPLICATION_NOT_FOUND');

    if (app.current_status !== 'DRAFT') {
      throw new Error(`INVALID_STATUS: Application is not in DRAFT status. Current: ${app.current_status}`);
    }

    const callerRole = this.getUserRole(callerId);
    const userDeptId = this.getUserActiveDeptId(callerId);

    if (callerRole === 'DEPARTMENT_USER' && userDeptId !== app.department_id) {
      throw new Error('PERMISSION_DENIED: You cannot submit applications for other departments.');
    }

    // Check participants exist
    const parts = this.participants.filter((p) => p.application_id === appId);
    if (parts.length === 0) {
      throw new Error('NO_PARTICIPANTS: Training application must contain at least one employee participant.');
    }

    // Transition to UNDER_HOD_REVIEW
    app.current_status = 'UNDER_HOD_REVIEW';
    app.updated_at = new Date().toISOString();

    // Append to approval history
    this.approvalHistory.push({
      id: crypto.randomUUID(),
      application_id: appId,
      actor_id: callerId,
      actor_role: callerRole || 'DEPARTMENT_USER',
      action: 'SUBMIT',
      previous_status: 'DRAFT',
      new_status: 'UNDER_HOD_REVIEW',
      comments: 'Submitted for HOD Training Center review.',
      action_timestamp: new Date().toISOString(),
    });

    // Notify HOD
    const hodUsers = this.users.filter((u) => u.role_code === 'ADMIN_HOD_TC' && u.is_active);
    for (const hod of hodUsers) {
      this.notifications.push({
        id: crypto.randomUUID(),
        user_id: hod.id,
        title: 'New Training Application Submitted',
        message: `Application ${app.application_number} is waiting for your review.`,
        type: 'HOD_REVIEW',
        reference_id: appId,
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }

    return app;
  }

  // ============================================================================
  // RPC: HOD REVIEW APPLICATION
  // Satisfies Test Scenario 3 & 4:
  // - Dept user cannot approve their own application.
  // - HOD cannot perform final PJO approval.
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
      throw new Error(`INVALID_STATUS: Application is not pending HOD review. Current: ${app.current_status}`);
    }

    // Department User cannot approve applications (callerRole checked above)
    const callerRole = this.getUserRole(callerId);
    if (callerRole !== 'ADMIN_HOD_TC' && callerRole !== 'SUPER_ADMIN') {
      throw new Error('PERMISSION_DENIED: Only ADMIN HOD TRAINING CENTER or Super Admin can review this stage.');
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

    // Preserve history
    this.approvalHistory.push({
      id: crypto.randomUUID(),
      application_id: appId,
      actor_id: callerId,
      actor_role: callerRole || 'ADMIN_HOD_TC',
      action,
      previous_status: 'UNDER_HOD_REVIEW',
      new_status: newStatus,
      comments,
      action_timestamp: new Date().toISOString(),
    });

    if (decision === 'APPROVE') {
      // Notify PJO
      const pjoUsers = this.users.filter((u) => u.role_code === 'ADMIN_PJO' && u.is_active);
      for (const pjo of pjoUsers) {
        this.notifications.push({
          id: crypto.randomUUID(),
          user_id: pjo.id,
          title: 'Application Awaiting PJO Final Authorization',
          message: `Application ${app.application_number} has passed HOD review and is awaiting final authorization.`,
          type: 'PJO_REVIEW',
          reference_id: appId,
          is_read: false,
          created_at: new Date().toISOString(),
        });
      }
    } else {
      // Notify submitter
      this.notifications.push({
        id: crypto.randomUUID(),
        user_id: app.submitted_by,
        title: decision === 'RETURN_FOR_REVISION' ? 'Application Returned by HOD' : 'Application Rejected by HOD',
        message: `HOD decision: ${decision}. Note: ${comments}`,
        type: decision === 'RETURN_FOR_REVISION' ? 'REVISION_REQUESTED' : 'REJECTED',
        reference_id: appId,
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }

    return app;
  }

  // ============================================================================
  // RPC: PJO REVIEW APPLICATION (FINAL AUTHORIZATION)
  // Satisfies Test Scenario 5: PJO cannot approve an application before HOD.
  // Satisfies Test Scenario 7: PJO revision returns application through HOD review.
  // ============================================================================
  pjoReviewApplication(
    appId: string,
    callerId: string,
    decision: ApprovalDecision,
    comments: string
  ) {
    const app = this.applications.find((a) => a.id === appId);
    if (!app) throw new Error('APPLICATION_NOT_FOUND');

    // Strict Sequence Check: PJO cannot approve an application before HOD!
    if (app.current_status !== 'PENDING_PJO') {
      throw new Error(
        `APPROVAL_SEQUENCE_ERROR: Application is not in PENDING_PJO state (current: ${app.current_status}). PJO cannot act before HOD review.`
      );
    }

    const callerRole = this.getUserRole(callerId);
    if (callerRole !== 'ADMIN_PJO' && callerRole !== 'SUPER_ADMIN') {
      throw new Error('PERMISSION_DENIED: Only ADMIN PJO or Super Admin can perform final authorization.');
    }

    // Role Separation: HOD and PJO are separate roles with separate accounts
    if (callerId === app.hod_approver_id && callerRole !== 'SUPER_ADMIN') {
      throw new Error('ROLE_SEPARATION_VIOLATION: The same user cannot act as both HOD reviewer and PJO approver.');
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
      // Rule: After PJO revision, the application returns to DRAFT.
      // Resubmission will require it to go through HOD review again!
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

    // Preserve history
    this.approvalHistory.push({
      id: crypto.randomUUID(),
      application_id: appId,
      actor_id: callerId,
      actor_role: callerRole || 'ADMIN_PJO',
      action,
      previous_status: 'PENDING_PJO',
      new_status: newStatus,
      comments,
      action_timestamp: new Date().toISOString(),
    });

    if (decision === 'APPROVE') {
      this.notifications.push(
        {
          id: crypto.randomUUID(),
          user_id: app.submitted_by,
          title: 'Training Application Fully Approved',
          message: `Application ${app.application_number} has received final PJO authorization and is ready for scheduling.`,
          type: 'APPROVED',
          reference_id: appId,
          is_read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          user_id: app.hod_approver_id || '',
          title: 'Training Application Authorized by PJO',
          message: `Application ${app.application_number} authorized by PJO and can be scheduled.`,
          type: 'APPROVED',
          reference_id: appId,
          is_read: false,
          created_at: new Date().toISOString(),
        }
      );
    } else {
      this.notifications.push({
        id: crypto.randomUUID(),
        user_id: app.submitted_by,
        title: decision === 'RETURN_FOR_REVISION' ? 'Application Returned by PJO' : 'Application Rejected by PJO',
        message: `PJO decision: ${decision}. Note: ${comments}`,
        type: decision === 'RETURN_FOR_REVISION' ? 'REVISION_REQUESTED' : 'REJECTED',
        reference_id: appId,
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }

    return app;
  }

  // ============================================================================
  // RPC: PJO CANNOT MODIFY APPLICATION PARTICIPANTS (Test Scenario 6)
  // ============================================================================
  modifyApplicationParticipants(
    appId: string,
    callerId: string,
    employeeIds: string[]
  ) {
    const callerRole = this.getUserRole(callerId);
    if (callerRole === 'ADMIN_PJO') {
      throw new Error('PERMISSION_DENIED: Admin PJO is not authorized to edit application data or participants.');
    }

    const app = this.applications.find((a) => a.id === appId);
    if (!app) throw new Error('APPLICATION_NOT_FOUND');

    if (app.current_status !== 'DRAFT') {
      throw new Error('INVALID_STATUS: Participants can only be modified while application is in DRAFT.');
    }

    // Replace participants
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

    if (app.current_status !== 'REJECTED') {
      throw new Error(`INVALID_STATUS: Only REJECTED applications can be reopened. Current: ${app.current_status}`);
    }

    app.current_status = 'DRAFT';
    app.updated_at = new Date().toISOString();

    this.approvalHistory.push({
      id: crypto.randomUUID(),
      application_id: appId,
      actor_id: callerId,
      actor_role: 'SUPER_ADMIN',
      action: 'SUPERADMIN_REOPEN',
      previous_status: 'REJECTED',
      new_status: 'DRAFT',
      comments: `Authorized reopening. Reason: ${reason}`,
      action_timestamp: new Date().toISOString(),
    });

    this.auditLogs.push({
      id: crypto.randomUUID(),
      table_name: 'training_applications',
      record_id: appId,
      action: 'REOPEN',
      actor_id: callerId,
      old_values: { current_status: 'REJECTED' },
      new_values: { current_status: 'DRAFT', reopen_reason: reason },
      created_at: new Date().toISOString(),
    });

    return app;
  }

  // ============================================================================
  // RPC: SCHEDULE APPROVED TRAINING (Test Scenario 8 & 9)
  // Satisfies Test Scenario 8: Rejected applications cannot proceed to scheduling.
  // Satisfies Test Scenario 9: Approved applications can proceed to scheduling.
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
    const app = this.applications.find((a) => a.id === appId);
    if (!app) throw new Error('APPLICATION_NOT_FOUND');

    // Strict Rule: Only fully approved applications can proceed to scheduling!
    if (app.current_status !== 'APPROVED') {
      throw new Error(
        `APPLICATION_NOT_APPROVED: Only fully approved applications can proceed to scheduling. Current status: ${app.current_status}`
      );
    }

    const callerRole = this.getUserRole(callerId);
    if (callerRole !== 'ADMIN_HOD_TC' && callerRole !== 'SUPER_ADMIN') {
      throw new Error('PERMISSION_DENIED: Only Training Center administrators or Super Admin can schedule training.');
    }

    const scheduleId = crypto.randomUUID();
    const newSchedule: TrainingSchedule = {
      id: scheduleId,
      application_id: appId,
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
    app.updated_at = new Date().toISOString();

    // Create initial training records for all participants
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
      actor_role: callerRole || 'ADMIN_HOD_TC',
      action: 'HOD_APPROVE',
      previous_status: 'APPROVED',
      new_status: 'SCHEDULED',
      comments: `Training execution scheduled. Venue: ${scheduleData.venue}`,
      action_timestamp: new Date().toISOString(),
    });

    return newSchedule;
  }

  // ============================================================================
  // RPC: COMPLETE TRAINING EXECUTION & UPDATE RECORDS (Test Scenario 12)
  // Satisfies Test Scenario 12: KPI values update from completed training data.
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
    const sched = this.schedules.find((s) => s.id === scheduleId);
    if (!sched) throw new Error('SCHEDULE_NOT_FOUND');

    const app = this.applications.find((a) => a.id === sched.application_id);

    sched.status = 'COMPLETED';
    if (app) {
      app.current_status = 'COMPLETED';
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
          this.certifications.push({
            id: crypto.randomUUID(),
            employee_id: res.employee_id,
            record_id: rec.id,
            certificate_number: `CERT-RAJA-${Date.now().toString().slice(-6)}`,
            certificate_name: app ? app.training_title : 'Certified Competency',
            issuing_body: app ? app.training_provider : 'PT RAJA Training Center',
            certification_level: 'Certified',
            issue_date: new Date().toISOString().split('T')[0],
            is_lifetime: false,
            status: 'ACTIVE',
            created_at: new Date().toISOString(),
          });
        }
      }
    }

    // Recalculate KPIs dynamically!
    const year = new Date(sched.start_date).getFullYear() || 2026;
    this.recalculateKpis(year);

    return sched;
  }

  // ============================================================================
  // KPI COMPUTATION ENGINE
  // ============================================================================
  recalculateKpis(year: number) {
    // 1. Total Active Employees
    const totalEmployees = Math.max(this.employees.filter((e) => e.is_active).length, 1);

    // 2. Training Hours Completed in Year
    const completedRecords = this.records.filter((r) => r.attendance_status === 'ATTENDED');
    const totalHoursCompleted = completedRecords.reduce(
      (sum, r) => sum + (r.training_hours_completed || 0),
      0
    );
    const avgHoursPerEmp = Math.round((totalHoursCompleted / totalEmployees) * 100) / 100;

    // 3. Pass Rate
    const evaluatedRecords = this.records.filter(
      (r) => r.attendance_status === 'ATTENDED' && r.result_status !== 'PENDING'
    );
    const passedCount = evaluatedRecords.filter((r) => r.passed).length;
    const passRate =
      evaluatedRecords.length > 0
        ? Math.round((passedCount / evaluatedRecords.length) * 10000) / 100
        : 0;

    // 4. Completion Rate
    const totalSchedules = this.schedules.length;
    const completedSchedules = this.schedules.filter((s) => s.status === 'COMPLETED').length;
    const completionRate =
      totalSchedules > 0 ? Math.round((completedSchedules / totalSchedules) * 10000) / 100 : 0;

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

// Global store instance
export const mockStore = new DataStore();
