// ==============================================================================
// THR DASHBOARD DATA TYPES (22 TABLES & WORKFLOW ENUMS)
// ==============================================================================

export type RoleCode = 'SUPER_ADMIN' | 'ADMIN_HOD_TC' | 'ADMIN_PJO' | 'DEPARTMENT_USER';

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_HOD_REVIEW'
  | 'PENDING_PJO'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED';

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

export type TrainingType = 'INTERNAL' | 'EXTERNAL' | 'CERTIFICATION' | 'IN_HOUSE';

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
