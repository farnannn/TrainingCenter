// ==============================================================================
// RAJA ACADEMY — THR DASHBOARD DATA TYPES & RBAC PERMISSION MATRIX
// ==============================================================================

export type RoleCode =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'PJO'
  | 'MANAGER_TC'
  | 'ADMIN_TC'
  | 'ADMIN_HRGA';

export interface RolePermissionMatrix {
  dashboard: 'FULL' | 'VIEW';
  trainingData: 'EDIT' | 'VIEW';
  trainingAchievement: 'EDIT' | 'VIEW';
  employeeData: 'EDIT' | 'VIEW';
  canInputData: boolean;
  canEditData: boolean;
  canDeleteData: boolean;
  canManageUsers: boolean;
  canManageSystemSettings: boolean;
}

export const DEFAULT_ROLE_PERMISSIONS: Record<RoleCode, RolePermissionMatrix> = {
  SUPER_ADMIN: {
    dashboard: 'FULL',
    trainingData: 'EDIT',
    trainingAchievement: 'EDIT',
    employeeData: 'EDIT',
    canInputData: true,
    canEditData: true,
    canDeleteData: true,
    canManageUsers: true,
    canManageSystemSettings: true,
  },
  ADMIN: {
    dashboard: 'FULL',
    trainingData: 'EDIT',
    trainingAchievement: 'EDIT',
    employeeData: 'EDIT',
    canInputData: true,
    canEditData: true,
    canDeleteData: false,
    canManageUsers: false,
    canManageSystemSettings: false,
  },
  PJO: {
    dashboard: 'VIEW',
    trainingData: 'VIEW',
    trainingAchievement: 'VIEW',
    employeeData: 'VIEW',
    canInputData: false,
    canEditData: false,
    canDeleteData: false,
    canManageUsers: false,
    canManageSystemSettings: false,
  },
  MANAGER_TC: {
    dashboard: 'FULL',
    trainingData: 'EDIT',
    trainingAchievement: 'EDIT',
    employeeData: 'VIEW',
    canInputData: true,
    canEditData: true,
    canDeleteData: false,
    canManageUsers: false,
    canManageSystemSettings: false,
  },
  ADMIN_TC: {
    dashboard: 'FULL',
    trainingData: 'EDIT',
    trainingAchievement: 'EDIT',
    employeeData: 'EDIT',
    canInputData: true,
    canEditData: true,
    canDeleteData: false,
    canManageUsers: false,
    canManageSystemSettings: false,
  },
  ADMIN_HRGA: {
    dashboard: 'FULL',
    trainingData: 'EDIT',
    trainingAchievement: 'VIEW',
    employeeData: 'EDIT',
    canInputData: true,
    canEditData: true,
    canDeleteData: false,
    canManageUsers: false,
    canManageSystemSettings: false,
  },
};

export const ROLE_PERMISSIONS: Record<RoleCode, RolePermissionMatrix> = JSON.parse(
  JSON.stringify(DEFAULT_ROLE_PERMISSIONS)
);

export function syncRolePermissionsRegistry(
  nextMap: Partial<Record<RoleCode, Partial<RolePermissionMatrix>>>
) {
  (Object.keys(DEFAULT_ROLE_PERMISSIONS) as RoleCode[]).forEach((code) => {
    const incoming = nextMap?.[code];
    if (incoming) {
      ROLE_PERMISSIONS[code] = {
        ...DEFAULT_ROLE_PERMISSIONS[code],
        ...ROLE_PERMISSIONS[code],
        ...incoming,
      };
    }
  });
  // Ensure SUPER_ADMIN always keeps System Settings & User Management so they cannot lock themselves out
  ROLE_PERMISSIONS.SUPER_ADMIN.canManageSystemSettings = true;
  ROLE_PERMISSIONS.SUPER_ADMIN.canManageUsers = true;
}

export function getRolePermissions(roleCode: RoleCode): RolePermissionMatrix {
  return ROLE_PERMISSIONS[roleCode] || ROLE_PERMISSIONS.PJO;
}

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_HOD_REVIEW'
  | 'PENDING_PJO'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export type ApprovalDecision = 'APPROVE' | 'RETURN_FOR_REVISION' | 'REJECT';

export type ApprovalAction =
  | 'SUBMIT'
  | 'HOD_APPROVE'
  | 'HOD_RETURN'
  | 'HOD_REJECT'
  | 'PJO_APPROVE'
  | 'PJO_RETURN'
  | 'PJO_REJECT'
  | 'SUPERADMIN_REOPEN';

export type TrainingType = string;

export interface TrainingCategoryOption {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface TrainingTypeOption {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface SiteOption {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface TrainerActivityItem {
  id: string;
  content: string;
  site?: string;
  department?: string;
  updated_at?: string;
}

export interface TrainerActivitySection {
  id: string;
  year?: string;
  month?: string;
  week_number?: number;
  period_label?: string;
  badge_label: string;
  title: string;
  items: TrainerActivityItem[];
  updated_at: string;
  updated_by?: string;
}

export interface Role {
  id: string;
  code: RoleCode;
  name: string;
  description: string;
  access_level: number;
  created_at: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  role_id: string;
  role_code: RoleCode;
  role_name?: string;
  nik: string;
  full_name: string;
  email: string;
  phone_number?: string;
  department_id?: string | null;
  department_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface Employee {
  id: string;
  department_id: string;
  department_name?: string;
  nik: string;
  full_name: string;
  position: string;
  job_level: string;
  email?: string;
  phone_number?: string;
  hire_date?: string;
  project_site?: string;
  photo_url?: string;
  employment_status: 'PERMANENT' | 'CONTRACT' | 'INTERN';
  is_active: boolean;
  created_at: string;
}

export interface DepartmentUserAssignment {
  id: string;
  department_id: string;
  department_name?: string;
  user_id: string;
  user_name?: string;
  assigned_by: string;
  assigned_by_name?: string;
  is_active: boolean;
  assigned_at: string;
  deactivated_at?: string | null;
  deactivation_reason?: string | null;
}

export interface TrainingProgram {
  id: string;
  program_code: string;
  title: string;
  category: string;
  description: string;
  target_audience: string;
  default_duration_hours: number;
  default_budget_per_participant: number;
  is_mandatory: boolean;
  is_active: boolean;
  created_at: string;
}

export interface TrainingApplication {
  id: string;
  application_number: string;
  department_id: string;
  department_name?: string;
  submitted_by: string;
  submitter_name?: string;
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
  current_status: ApplicationStatus;
  planned_hours?: number;
  actual_hours?: number;
  planned_participants?: number;
  actual_participants?: number;
  hod_approver_id?: string | null;
  hod_approver_name?: string | null;
  hod_decision?: ApprovalDecision | null;
  hod_comments?: string | null;
  hod_reviewed_at?: string | null;
  pjo_approver_id?: string | null;
  pjo_approver_name?: string | null;
  pjo_decision?: ApprovalDecision | null;
  pjo_comments?: string | null;
  pjo_reviewed_at?: string | null;
  program_id?: string | null;
  created_at: string;
  updated_at: string;
  participants?: TrainingApplicationParticipant[];
}

export interface TrainingApplicationParticipant {
  id: string;
  application_id: string;
  employee_id: string;
  employee_nik?: string;
  employee_name?: string;
  employee_position?: string;
  notes?: string;
  status: 'PROPOSED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  created_at: string;
}

export interface TrainingApplicationDocument {
  id: string;
  application_id: string;
  document_name: string;
  document_type: 'PROPOSAL' | 'SYLLABUS' | 'BUDGET_QUOTATION' | 'OTHER';
  file_url: string;
  file_size_bytes?: number;
  mime_type?: string;
  uploaded_by: string;
  created_at: string;
}

export interface TrainingApprovalHistory {
  id: string;
  application_id: string;
  actor_id: string;
  actor_name?: string;
  actor_role: string;
  action: ApprovalAction;
  previous_status: ApplicationStatus;
  new_status: ApplicationStatus;
  comments?: string | null;
  action_timestamp: string;
}

export interface TrainingSchedule {
  id: string;
  application_id: string;
  application_title?: string;
  batch_number: string;
  trainer_name: string;
  venue: string;
  start_date: string;
  end_date: string;
  daily_start_time: string;
  daily_end_time: string;
  total_hours: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduled_by: string;
  scheduled_by_name?: string;
  created_at: string;
}

export interface TrainingRecord {
  id: string;
  schedule_id: string;
  application_id: string;
  employee_id: string;
  employee_name?: string;
  employee_nik?: string;
  department_name?: string;
  attendance_status: 'ENROLLED' | 'ATTENDED' | 'ABSENT' | 'PARTIAL';
  pre_test_score?: number;
  post_test_score?: number;
  final_score?: number;
  result_status: 'PENDING' | 'PASSED' | 'FAILED';
  passed: boolean;
  training_hours_completed: number;
  certificate_issued: boolean;
  completed_at?: string;
  created_at: string;
}

export interface TrainingAttendance {
  id: string;
  schedule_id: string;
  record_id: string;
  attendance_date: string;
  session_name: string;
  is_present: boolean;
  check_in_time?: string;
  check_out_time?: string;
  notes?: string;
  recorded_by: string;
  created_at: string;
}

export interface TrainingEvaluation {
  id: string;
  schedule_id: string;
  employee_id: string;
  employee_name?: string;
  instructor_rating: number;
  material_rating: number;
  facility_rating: number;
  overall_rating: number;
  feedback_comments?: string;
  action_plan?: string;
  created_at: string;
}

export interface Certification {
  id: string;
  employee_id: string;
  employee_name?: string;
  employee_nik?: string;
  department_name?: string;
  record_id?: string;
  certificate_number: string;
  certificate_name: string;
  issuing_body: string;
  certification_level: string;
  issue_date: string;
  expiry_date?: string;
  duration_label?: string;
  venue?: string;
  is_lifetime: boolean;
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'REVOKED';
  verified_by?: string;
  verified_at?: string;
  created_at: string;
}

export interface CertificationDocument {
  id: string;
  certification_id: string;
  document_name: string;
  file_url: string;
  uploaded_by: string;
  created_at: string;
}

export interface KpiDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  unit: 'HOURS' | 'PERCENTAGE' | 'COUNT' | 'IDR';
  calculation_formula: string;
  is_active: boolean;
  created_at: string;
}

export interface KpiTarget {
  id: string;
  kpi_id: string;
  kpi_name?: string;
  department_id?: string | null;
  department_name?: string;
  year: number;
  target_value: number;
  target_period: string;
  set_by: string;
}

export interface KpiWeight {
  id: string;
  kpi_id: string;
  kpi_name?: string;
  year: number;
  weight_percentage: number;
  assigned_by: string;
}

export interface KpiResult {
  id: string;
  kpi_id: string;
  kpi_code?: string;
  kpi_name?: string;
  unit?: string;
  department_id?: string | null;
  department_name?: string;
  year: number;
  period: string;
  actual_value: number;
  target_value?: number;
  score: number;
  weight_percentage?: number;
  weighted_score: number;
  last_calculated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  reference_id?: string;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  actor_id?: string;
  actor_name?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  created_at: string;
}

export interface SystemSettingsConfig {
  companyName: string;
  portalName: string;
  operationalSite: string;
  headOffice: string;
  annualTrainingHoursTargetPerEmployee: number;
  minimumPassScore: number;
  mandatoryAchievementTargetPercent: number;
  strictRlsEnabled: boolean;
  autoIssueCertificateOnPass: boolean;
  updatedAt: string;
  updatedBy?: string;
}

// ==============================================================================
// PROGRAM TECHNICAL TRAINING — INTEGRATED THR MODULE TYPES (SLIDES 2, 3, 4)
// ==============================================================================

/**
 * A. Training Class & Competency GAP (Crew PLM Tangofa & Genba)
 */
export interface TechnicalTrainingClassProgram {
  id: string;
  program_name: string;
  department_area: string;
  target_participants: number;
  actual_participants: number;
  execution_period: string;
  status: 'Completed' | 'On Going' | 'Scheduled' | 'Pending';
  remarks: string;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

/**
 * B. Interview Candidate Mechanic & Tabel "2. Data Assessment Candidate Mechanic" (Slide 2)
 */
export interface InterviewCandidateSummaryConfig {
  headline_label: string; // e.g., "Update interview candidate crew PLM al : 94x Done"
  done_count: number; // 94
  status: 'On Going' | 'Completed' | 'Pending';
  area_scope: string; // "Tangofa, Genba & TPM"
  notes: string;
  updated_at: string;
  updated_by?: string;
}

export interface CandidateMechanicPositionRow {
  id: string;
  no: number;
  candidate_position: string; // e.g., "Trainer Maintenance", "GL PLM", "DT medium & Support"
  total_masuk: number; // Jlh Peserta Masuk
  sudah_itv: number; // Sudah Itv
  recommended_m3_up: number; // Recommended (M3 Middle Up)
  site_tangofa: number; // Site Tangofa
  site_tpm: number; // Site TPM
  remark: string; // e.g., "TC", "1 POP BNSP Mati", "2 Mundur"
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

/**
 * C. Assessment Candidate Mechanic (Individual Candidate Assessment Management)
 */
export type CandidateAssessmentStatus = 'Passed' | 'Failed' | 'Pending' | 'On Going';

export interface CandidateMechanicAssessmentRecord {
  id: string;
  candidate_name: string;
  nik: string;
  department: string;
  current_position: string;
  target_position: string;
  site_location?: string;
  assessment_date: string;
  assessor: string;
  assessment_result: string; // e.g. "Recommended M3 Middle Up (Score: 86)"
  status: CandidateAssessmentStatus;
  assessor_notes: string;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

/**
 * D. Monitoring OJT BMC (31 Siswa PLM Tangofa & 7 Siswa TPM)
 */
export interface OjtBmcMonitoringRecord {
  id: string;
  student_name: string;
  batch: string;
  department_placement: string;
  location: string; // e.g., "Site Tangofa", "Site TPM"
  student_count: number; // Allows tracking individual (1) or cohort group (31 / 7)
  ojt_period: string;
  mentor_name: string;
  ojt_status: 'On Going' | 'Completed' | 'Evaluated' | 'Pending';
  ojt_evaluation: string;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

/**
 * E. Sharing Session BMC Batch VII (17 Siswa BMC Batch VII)
 */
export interface SharingSessionBmcRecord {
  id: string;
  session_title: string;
  batch: string; // "BMC Batch VII"
  schedule_date: string;
  location: string;
  instructor_name: string;
  target_participants: number; // 17
  actual_attendance: number; // 17
  execution_status: 'Done' | 'On Going' | 'Scheduled' | 'Pending';
  documentation_notes: string;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

/**
 * 3. Resume Assessment Crew Mechanic PLM 2026 (Slide 3)
 */
export interface PlmAssessmentCategoryItem {
  id: string;
  category_name: string; // e.g., "M1, M2, M3" | "2GL, 2 FGDP/GLDP"
  class_count: number; // 122 | 113
  period_year: string; // "2026"
  description: string;
  updated_at: string;
  updated_by?: string;
}

export interface PlmCompetencyGapRow {
  id: string;
  no: number;
  code: string; // PK, BEG, BEL, TM, TQ, HYD, UC, MTN, BMT, MMC, AC, SB, ATF, BFA, LTO, DFD, SL
  training_name: string;
  gap_all: number;
  mechanic_tangofa: number;
  mechanic_genba: number;
  all_gl: number;
  fgdp_gldp: number;
  fill_gap: number;
  period_year: string;
  updated_at: string;
  updated_by?: string;
}

/**
 * 4. Resume Training Class Crew Mechanic PLM 2026 (Slide 4)
 */
export interface PlmTrainingClassMonthlyItem {
  id: string;
  month_index: number; // 5..11 (Mei..November) or 1..12
  month_name: string; // "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November"
  year: string; // "2026"
  plan: number; // Participant Plan: 10, 42, 36, 44, 44, 44, 36
  actual: number; // Participant Actual: 30, 39, 26, 63, 67, 23, 3
  frequency_plan: number; // Frequency Plan from Slide 4: 3, 5, 6, 6, 6, 6, 6
  frequency_actual: number; // Frequency Actual from Slide 4: 3, 5, 7, 8, 8, 7, 1
  period_status: 'FINAL' | 'ON_GOING'; // November = 'ON_GOING'
  notes?: string;
  updated_at: string;
  updated_by?: string;
}

export interface PlmTrainingCorrectiveAction {
  id: string;
  section_type: 'PROBLEM' | 'CAUSE' | 'CORRECTIVE_ACTION' | 'FOLLOW_UP';
  no: number;
  description: string;
  pic?: string;
  due_date?: string;
  updated_at: string;
  updated_by?: string;
}

/**
 * 5. Activity Technical Training — OTHER DAILY ACTIVITAS TECHNICAL TRAINER
 */
export interface TechnicalTrainerDailyActivityItem {
  id: string;
  no: number;
  date_label: string;
  attendents: string;
  dept: string;
  activities: string;
  remarks: string; // 'Done' | 'Continue' | 'On Going' | 'Pending'
  photos: string[]; // URLs or base64 data URLs of documentation images
  week_label: string; // e.g., "WEEK 1 NOVEMBER 2026"
  year: string;
  month: string;
  week_number: number;
  updated_at: string;
  updated_by?: string;
}

/**
 * 6. Plan Training Technical Bulanan (Gantt / Matrix Tanggal 1..30)
 */
export interface TechnicalTrainingPlanBar {
  id: string;
  month_label: string; // e.g., "Nov-26"
  year?: string; // e.g., "2026"
  month?: string; // e.g., "11"
  week_number?: number; // 1..5
  row_key: 'EXISTING_MECH_GL' | 'FRESH_OJT_FGDP' | 'ABDUL_RACHMAN' | 'ANDI_RIZAL' | 'AGUS_ARIFIN';
  start_day: number; // 1..31
  end_day: number; // 1..31
  title: string;
  bg_color: string;
  text_color: string;
  plan_participants?: number;
  actual_participants?: number;
  updated_at: string;
  updated_by?: string;
}

/**
 * 7. Jadwal Sharing Session 17x Siswa BMC Batch VII (Terdata per Minggu & per Bulan)
 */
export interface SharingSessionBmcScheduleItem {
  id: string;
  no: number;
  tanggal: string; // e.g., "29 OKT 2026"
  hari: string; // e.g., "KAMIS"
  waktu: string; // e.g., "08.00-17.00"
  nama: string; // e.g., "Riyan Ardianto"
  jabatan: string; // e.g., "OJT Mekanik DT"
  instruktur: string; // e.g., "Bpk. Andi Risal"
  year?: string; // e.g., "2026"
  month?: string; // e.g., "11"
  month_label?: string; // e.g., "November 2026"
  week_number?: number; // 1..5
  week_label?: string; // e.g., "Minggu 1 - November 2026"
  batch_label?: string; // e.g., "BMC BATCH VII"
  status?: 'Done' | 'On Going' | 'Planned';
  updated_at: string;
  updated_by?: string;
}

/**
 * 8. Program Skill Audit & Refresh Operator (ADT, Excavator, Doser, Driver DT, dan Summary Heavy Equipment)
 */
export type SkillAuditCategoryCode = 'ADT' | 'EXCAVATOR' | 'DOSER' | 'DRIVER_DT';

export interface SkillAuditOperatorRecord {
  id: string;
  no: number;
  category: SkillAuditCategoryCode;
  tanggal: string;
  nama: string;
  posisi: string; // 'Operator' | 'Driver'
  jenis_unit: string; // 'Komatsu HM400' | 'Volvo A40G' | 'Excavator 50T' | 'Excavator 30T' | 'Excavator 320T' | 'Doser D85SS' | 'Doser D65' | 'Domfeng' | 'Hongyan'
  keterangan: string; // 'INTERNAL'
  provider: string; // 'TC'
  program: string; // 'Refresh'
  instructor: string; // 'Ekiopas Awang' | 'Joni Sampe' | 'Catur Ani' | 'Fiktor'
  period_label?: string; // e.g., 'September - October 2026'
  updated_at: string;
  updated_by?: string;
}

export interface SkillAuditHeavyEquipmentSummaryRow {
  id: string;
  no: number;
  jabatan: string; // 'Operator ADT' | 'Operator Excavator' | 'Operator Buldozer' | 'Operator Rock Breaker' | 'Driver DT 12 R'
  close_count: number;
  open_count: number;
  total_karyawan: number;
  percentage: number;
  updated_at: string;
  updated_by?: string;
}

export interface TechnicalTrainingModuleState {
  report_header: {
    issue_date: string;
    owner_name: string;
    owner_role: string;
    member_dept: string;
    period_label: string;
  };
  trainingClassPrograms: TechnicalTrainingClassProgram[];
  interviewSummary: InterviewCandidateSummaryConfig;
  candidatePositionRecap: CandidateMechanicPositionRow[];
  candidateAssessments: CandidateMechanicAssessmentRecord[];
  ojtBmcRecords: OjtBmcMonitoringRecord[];
  sharingSessionRecords: SharingSessionBmcRecord[];
  plmAssessmentCategories: PlmAssessmentCategoryItem[];
  plmCompetencyGapRows: PlmCompetencyGapRow[];
  plmMonthlyTrainingClasses: PlmTrainingClassMonthlyItem[];
  plmCorrectiveActions: PlmTrainingCorrectiveAction[];
  dailyTrainerActivities: TechnicalTrainerDailyActivityItem[];
  monthlyPlanBars: TechnicalTrainingPlanBar[];
  sharingSessionScheduleRows: SharingSessionBmcScheduleItem[];
  skillAuditOperatorRecords: SkillAuditOperatorRecord[];
  skillAuditSummaryRows: SkillAuditHeavyEquipmentSummaryRow[];
  skillAuditPhotos: Record<string, string[]>;
  updated_at: string;
  updated_by?: string;
}
