-- ==============================================================================
-- THR DASHBOARD DATABASE MIGRATION - 01: INITIAL SCHEMA
-- System: Supabase PostgreSQL
-- Description: Creates the 22 normalized tables with UUID PKs, FKs, constraints,
--              indexes, and audit fields.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. ROLES TABLE
-- Defines the 4 functional roles across 3 access levels
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    access_level INTEGER NOT NULL CHECK (access_level IN (1, 2, 3)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 2. DEPARTMENTS TABLE
-- Master company departments (MOD, MED, HRGA, TC, HSE, etc.)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- ==============================================================================
-- 3. USER PROFILES TABLE
-- Connected to auth.users in Supabase
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id),
    nik VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone_number VARCHAR(50),
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_dept ON public.user_profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- ==============================================================================
-- 4. EMPLOYEES TABLE
-- Master company workforce under respective departments
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES public.departments(id),
    nik VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    position VARCHAR(100) NOT NULL,
    job_level VARCHAR(50) NOT NULL,
    email VARCHAR(150),
    phone_number VARCHAR(50),
    hire_date DATE,
    employment_status VARCHAR(50) NOT NULL DEFAULT 'PERMANENT' CHECK (employment_status IN ('PERMANENT', 'CONTRACT', 'INTERN')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_nik ON public.employees(nik);
CREATE INDEX IF NOT EXISTS idx_employees_active ON public.employees(is_active);

-- ==============================================================================
-- 5. DEPARTMENT USER ASSIGNMENTS TABLE
-- Enforces:
-- 1) Exactly one active department user per department
-- 2) One department user can only be assigned to one department
-- 3) Assigned by Super Admin
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.department_user_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES public.departments(id),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id),
    assigned_by UUID NOT NULL REFERENCES public.user_profiles(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deactivated_at TIMESTAMPTZ,
    deactivation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraints for active assignments:
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_dept_assignment 
    ON public.department_user_assignments (department_id) 
    WHERE is_active = true;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_user_assignment 
    ON public.department_user_assignments (user_id) 
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_dept_assignments_user ON public.department_user_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_dept_assignments_dept ON public.department_user_assignments(department_id);

-- ==============================================================================
-- 6. TRAINING PROGRAMS TABLE
-- Master catalogue of training courses / programs
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.training_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    target_audience TEXT,
    default_duration_hours NUMERIC(6,2) NOT NULL DEFAULT 8.00,
    default_budget_per_participant NUMERIC(14,2) DEFAULT 0.00,
    is_mandatory BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_training_programs_category ON public.training_programs(category);

-- ==============================================================================
-- 7. TRAINING APPLICATIONS TABLE
-- Main transaction table matching exact required fields
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.training_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_number VARCHAR(50) UNIQUE NOT NULL,
    department_id UUID NOT NULL REFERENCES public.departments(id),
    submitted_by UUID NOT NULL REFERENCES public.user_profiles(id),
    training_title VARCHAR(255) NOT NULL,
    training_category VARCHAR(100) NOT NULL,
    training_objectives TEXT NOT NULL,
    training_provider VARCHAR(200) NOT NULL,
    training_location VARCHAR(255) NOT NULL,
    proposed_start_date DATE NOT NULL,
    proposed_end_date DATE NOT NULL,
    estimated_budget NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    training_type VARCHAR(50) NOT NULL CHECK (training_type IN ('INTERNAL', 'EXTERNAL', 'CERTIFICATION', 'IN_HOUSE')),
    description TEXT,
    current_status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (
        current_status IN (
            'DRAFT',
            'SUBMITTED',
            'UNDER_HOD_REVIEW',
            'PENDING_PJO',
            'APPROVED',
            'SCHEDULED',
            'IN_PROGRESS',
            'COMPLETED',
            'REJECTED'
        )
    ),
    hod_approver_id UUID REFERENCES public.user_profiles(id),
    hod_decision VARCHAR(50) CHECK (hod_decision IN ('APPROVE', 'RETURN_FOR_REVISION', 'REJECT')),
    hod_comments TEXT,
    hod_reviewed_at TIMESTAMPTZ,
    pjo_approver_id UUID REFERENCES public.user_profiles(id),
    pjo_decision VARCHAR(50) CHECK (pjo_decision IN ('APPROVE', 'RETURN_FOR_REVISION', 'REJECT')),
    pjo_comments TEXT,
    pjo_reviewed_at TIMESTAMPTZ,
    program_id UUID REFERENCES public.training_programs(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_training_apps_dept ON public.training_applications(department_id);
CREATE INDEX IF NOT EXISTS idx_training_apps_submitter ON public.training_applications(submitted_by);
CREATE INDEX IF NOT EXISTS idx_training_apps_status ON public.training_applications(current_status);
CREATE INDEX IF NOT EXISTS idx_training_apps_dates ON public.training_applications(proposed_start_date, proposed_end_date);

-- ==============================================================================
-- 8. TRAINING APPLICATION PARTICIPANTS TABLE
-- Supports multi-employee training applications
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.training_application_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.training_applications(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id),
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PROPOSED' CHECK (status IN ('PROPOSED', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_app_employee UNIQUE (application_id, employee_id)
);

CREATE INDEX IF NOT EXISTS idx_app_participants_app ON public.training_application_participants(application_id);
CREATE INDEX IF NOT EXISTS idx_app_participants_emp ON public.training_application_participants(employee_id);

-- ==============================================================================
-- 9. TRAINING APPLICATION DOCUMENTS TABLE
-- File attachments (Syllabus, Proposal, Quotation)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.training_application_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.training_applications(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL DEFAULT 'PROPOSAL' CHECK (document_type IN ('PROPOSAL', 'SYLLABUS', 'BUDGET_QUOTATION', 'OTHER')),
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    uploaded_by UUID NOT NULL REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_docs_app ON public.training_application_documents(application_id);

-- ==============================================================================
-- 10. TRAINING APPROVAL HISTORY TABLE
-- Append-only audit trail of all review/approval actions
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.training_approval_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.training_applications(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES public.user_profiles(id),
    actor_role VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (
        action IN (
            'SUBMIT',
            'HOD_APPROVE',
            'HOD_RETURN',
            'HOD_REJECT',
            'PJO_APPROVE',
            'PJO_RETURN',
            'PJO_REJECT',
            'SUPERADMIN_REOPEN'
        )
    ),
    previous_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    comments TEXT,
    action_timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_approval_history_app ON public.training_approval_history(application_id);
CREATE INDEX IF NOT EXISTS idx_approval_history_actor ON public.training_approval_history(actor_id);
CREATE INDEX IF NOT EXISTS idx_approval_history_timestamp ON public.training_approval_history(action_timestamp DESC);

-- ==============================================================================
-- 11. TRAINING SCHEDULES TABLE
-- Scheduling approved training applications for execution
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.training_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.training_applications(id),
    batch_number VARCHAR(50) NOT NULL DEFAULT 'BATCH-1',
    trainer_name VARCHAR(150) NOT NULL,
    venue VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    daily_start_time TIME WITHOUT TIME ZONE DEFAULT '08:00:00',
    daily_end_time TIME WITHOUT TIME ZONE DEFAULT '17:00:00',
    total_hours NUMERIC(6,2) NOT NULL DEFAULT 8.00,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    scheduled_by UUID NOT NULL REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_training_schedules_app ON public.training_schedules(application_id);
CREATE INDEX IF NOT EXISTS idx_training_schedules_dates ON public.training_schedules(start_date, end_date);

-- ==============================================================================
-- 12. TRAINING RECORDS TABLE
-- Historical training outcomes per participant
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.training_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES public.training_schedules(id),
    application_id UUID NOT NULL REFERENCES public.training_applications(id),
    employee_id UUID NOT NULL REFERENCES public.employees(id),
    attendance_status VARCHAR(50) NOT NULL DEFAULT 'ENROLLED' CHECK (attendance_status IN ('ENROLLED', 'ATTENDED', 'ABSENT', 'PARTIAL')),
    pre_test_score NUMERIC(5,2),
    post_test_score NUMERIC(5,2),
    final_score NUMERIC(5,2),
    result_status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (result_status IN ('PENDING', 'PASSED', 'FAILED')),
    passed BOOLEAN NOT NULL DEFAULT false,
    training_hours_completed NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    certificate_issued BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_record_schedule_emp UNIQUE (schedule_id, employee_id)
);

CREATE INDEX IF NOT EXISTS idx_training_records_emp ON public.training_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_training_records_app ON public.training_records(application_id);
CREATE INDEX IF NOT EXISTS idx_training_records_schedule ON public.training_records(schedule_id);

-- ==============================================================================
-- 13. TRAINING ATTENDANCE TABLE
-- Daily / session attendance logs
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.training_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES public.training_schedules(id),
    record_id UUID NOT NULL REFERENCES public.training_records(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    session_name VARCHAR(100) DEFAULT 'Day Session',
    is_present BOOLEAN NOT NULL DEFAULT true,
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    notes TEXT,
    recorded_by UUID NOT NULL REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attendance_record ON public.training_attendance(record_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.training_attendance(attendance_date);

-- ==============================================================================
-- 14. TRAINING EVALUATIONS TABLE
-- Participant course feedback & ratings
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.training_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES public.training_schedules(id),
    employee_id UUID NOT NULL REFERENCES public.employees(id),
    instructor_rating NUMERIC(3,2) CHECK (instructor_rating BETWEEN 1.0 AND 5.0),
    material_rating NUMERIC(3,2) CHECK (material_rating BETWEEN 1.0 AND 5.0),
    facility_rating NUMERIC(3,2) CHECK (facility_rating BETWEEN 1.0 AND 5.0),
    overall_rating NUMERIC(3,2) CHECK (overall_rating BETWEEN 1.0 AND 5.0),
    feedback_comments TEXT,
    action_plan TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_eval_schedule_emp UNIQUE (schedule_id, employee_id)
);

CREATE INDEX IF NOT EXISTS idx_evaluations_schedule ON public.training_evaluations(schedule_id);

-- ==============================================================================
-- 15. CERTIFICATIONS TABLE
-- Valid professional and competency certifications
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id),
    record_id UUID REFERENCES public.training_records(id),
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    certificate_name VARCHAR(200) NOT NULL,
    issuing_body VARCHAR(150) NOT NULL,
    certification_level VARCHAR(50),
    issue_date DATE NOT NULL,
    expiry_date DATE,
    is_lifetime BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'REVOKED')),
    verified_by UUID REFERENCES public.user_profiles(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_certifications_emp ON public.certifications(employee_id);
CREATE INDEX IF NOT EXISTS idx_certifications_status ON public.certifications(status);
CREATE INDEX IF NOT EXISTS idx_certifications_expiry ON public.certifications(expiry_date);

-- ==============================================================================
-- 16. CERTIFICATION DOCUMENTS TABLE
-- Scanned certificate files
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.certification_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certification_id UUID NOT NULL REFERENCES public.certifications(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    mime_type VARCHAR(100),
    uploaded_by UUID NOT NULL REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cert_docs_cert ON public.certification_documents(certification_id);

-- ==============================================================================
-- 17. KPI DEFINITIONS TABLE
-- Master definitions for Training KPIs
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.kpi_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    unit VARCHAR(50) NOT NULL CHECK (unit IN ('HOURS', 'PERCENTAGE', 'COUNT', 'IDR')),
    calculation_formula TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 18. KPI TARGETS TABLE
-- Target goals set per year and per department (or company-wide)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.kpi_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kpi_id UUID NOT NULL REFERENCES public.kpi_definitions(id),
    department_id UUID REFERENCES public.departments(id), -- NULL = company-wide
    year INTEGER NOT NULL,
    target_value NUMERIC(14,2) NOT NULL,
    target_period VARCHAR(50) NOT NULL DEFAULT 'ANNUAL' CHECK (target_period IN ('ANNUAL', 'Q1', 'Q2', 'Q3', 'Q4')),
    set_by UUID NOT NULL REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_kpi_target UNIQUE (kpi_id, department_id, year, target_period)
);

CREATE INDEX IF NOT EXISTS idx_kpi_targets_year ON public.kpi_targets(year, department_id);

-- ==============================================================================
-- 19. KPI WEIGHTS TABLE
-- Weight percentages per KPI for overall scoring
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.kpi_weights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kpi_id UUID NOT NULL REFERENCES public.kpi_definitions(id),
    year INTEGER NOT NULL,
    weight_percentage NUMERIC(5,2) NOT NULL CHECK (weight_percentage >= 0 AND weight_percentage <= 100),
    assigned_by UUID NOT NULL REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_kpi_weight_year UNIQUE (kpi_id, year)
);

-- ==============================================================================
-- 20. KPI RESULTS TABLE
-- Calculated achievements and weighted scores
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.kpi_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kpi_id UUID NOT NULL REFERENCES public.kpi_definitions(id),
    department_id UUID REFERENCES public.departments(id), -- NULL = company-wide
    year INTEGER NOT NULL,
    period VARCHAR(50) NOT NULL DEFAULT 'ANNUAL',
    actual_value NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    score NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    weighted_score NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_kpi_result UNIQUE (kpi_id, department_id, year, period)
);

CREATE INDEX IF NOT EXISTS idx_kpi_results_year ON public.kpi_results(year, department_id);

-- ==============================================================================
-- 21. NOTIFICATIONS TABLE
-- Real-time notifications for approval milestones and scheduling
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (
        type IN (
            'APPLICATION_SUBMITTED',
            'HOD_REVIEW',
            'PJO_REVIEW',
            'APPROVED',
            'REVISION_REQUESTED',
            'REJECTED',
            'SCHEDULED',
            'IN_PROGRESS',
            'COMPLETED',
            'ASSIGNMENT_CHANGED'
        )
    ),
    reference_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- ==============================================================================
-- 22. AUDIT LOGS TABLE
-- System-wide audit log for compliance and security forensics
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SECURITY_CHECK_FAILED', 'REOPEN', 'LOGIN')),
    actor_id UUID REFERENCES public.user_profiles(id),
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
