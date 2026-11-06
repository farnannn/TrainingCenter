-- ==============================================================================
-- THR DASHBOARD DATABASE MIGRATION - 04: ROW LEVEL SECURITY POLICIES
-- System: Supabase PostgreSQL
-- Description: Comprehensive Row Level Security (RLS) enforcement across all 22
--              tables, adhering strictly to the 4 roles and access levels.
-- ==============================================================================

-- ==============================================================================
-- HELPER FUNCTIONS FOR RLS CONTEXT
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.current_user_role_code()
RETURNS VARCHAR
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT r.code
    FROM public.user_profiles u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND u.is_active = true AND u.deleted_at IS NULL;
$$;

CREATE OR REPLACE FUNCTION public.current_user_dept_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT department_id
    FROM public.department_user_assignments
    WHERE user_id = auth.uid() AND is_active = true
    LIMIT 1;
$$;

-- ==============================================================================
-- ENABLE RLS ON ALL SENSITIVE TABLES
-- ==============================================================================
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_user_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_application_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_approval_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 1. ROLES TABLE POLICIES
-- Read-only for authenticated users; Super Admin can manage.
-- ==============================================================================
CREATE POLICY "roles_select_authenticated"
    ON public.roles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "roles_admin_all"
    ON public.roles FOR ALL
    TO authenticated
    USING (public.current_user_role_code() = 'SUPER_ADMIN')
    WITH CHECK (public.current_user_role_code() = 'SUPER_ADMIN');

-- ==============================================================================
-- 2. USER PROFILES TABLE POLICIES
-- ==============================================================================
CREATE POLICY "user_profiles_select"
    ON public.user_profiles FOR SELECT
    TO authenticated
    USING (
        public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC', 'ADMIN_PJO')
        OR id = auth.uid()
        OR department_id = public.current_user_dept_id()
    );

CREATE POLICY "user_profiles_superadmin_manage"
    ON public.user_profiles FOR ALL
    TO authenticated
    USING (public.current_user_role_code() = 'SUPER_ADMIN')
    WITH CHECK (public.current_user_role_code() = 'SUPER_ADMIN');

-- ==============================================================================
-- 3. DEPARTMENTS TABLE POLICIES
-- All users can view active departments; Super Admin manages.
-- ==============================================================================
CREATE POLICY "departments_select_active"
    ON public.departments FOR SELECT
    TO authenticated
    USING (is_active = true OR public.current_user_role_code() = 'SUPER_ADMIN');

CREATE POLICY "departments_superadmin_all"
    ON public.departments FOR ALL
    TO authenticated
    USING (public.current_user_role_code() = 'SUPER_ADMIN')
    WITH CHECK (public.current_user_role_code() = 'SUPER_ADMIN');

-- ==============================================================================
-- 4. EMPLOYEES TABLE POLICIES
-- Test Scenario 1: Department MOD user cannot access MED employee records!
-- ==============================================================================
CREATE POLICY "employees_select_policy"
    ON public.employees FOR SELECT
    TO authenticated
    USING (
        public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC', 'ADMIN_PJO')
        OR (
            public.current_user_role_code() = 'DEPARTMENT_USER'
            AND department_id = public.current_user_dept_id()
        )
    );

CREATE POLICY "employees_manage_admin"
    ON public.employees FOR ALL
    TO authenticated
    USING (public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC'))
    WITH CHECK (public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC'));

-- ==============================================================================
-- 5. DEPARTMENT USER ASSIGNMENTS POLICIES
-- Only Super Admin can create or change department assignments.
-- ==============================================================================
CREATE POLICY "dept_assignments_select"
    ON public.department_user_assignments FOR SELECT
    TO authenticated
    USING (
        public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC', 'ADMIN_PJO')
        OR user_id = auth.uid()
        OR department_id = public.current_user_dept_id()
    );

CREATE POLICY "dept_assignments_superadmin_manage"
    ON public.department_user_assignments FOR ALL
    TO authenticated
    USING (public.current_user_role_code() = 'SUPER_ADMIN')
    WITH CHECK (public.current_user_role_code() = 'SUPER_ADMIN');

-- ==============================================================================
-- 6. TRAINING PROGRAMS POLICIES
-- Managed by HOD TC & Super Admin; viewable by all.
-- ==============================================================================
CREATE POLICY "training_programs_select"
    ON public.training_programs FOR SELECT
    TO authenticated
    USING (is_active = true OR public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC'));

CREATE POLICY "training_programs_manage"
    ON public.training_programs FOR ALL
    TO authenticated
    USING (public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC'))
    WITH CHECK (public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC'));

-- ==============================================================================
-- 7. TRAINING APPLICATIONS POLICIES
-- Department User: view only their department; edit only DRAFT.
-- ADMIN PJO: view company-wide; CANNOT edit department application data!
-- ==============================================================================
CREATE POLICY "training_apps_select"
    ON public.training_applications FOR SELECT
    TO authenticated
    USING (
        public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC', 'ADMIN_PJO')
        OR (
            public.current_user_role_code() = 'DEPARTMENT_USER'
            AND department_id = public.current_user_dept_id()
        )
    );

CREATE POLICY "training_apps_insert_dept_user"
    ON public.training_applications FOR INSERT
    TO authenticated
    WITH CHECK (
        public.current_user_role_code() = 'SUPER_ADMIN'
        OR (
            public.current_user_role_code() = 'DEPARTMENT_USER'
            AND department_id = public.current_user_dept_id()
            AND submitted_by = auth.uid()
            AND current_status = 'DRAFT'
        )
    );

CREATE POLICY "training_apps_update_dept_user"
    ON public.training_applications FOR UPDATE
    TO authenticated
    USING (
        public.current_user_role_code() = 'SUPER_ADMIN'
        OR (
            public.current_user_role_code() = 'DEPARTMENT_USER'
            AND department_id = public.current_user_dept_id()
            AND current_status = 'DRAFT'
        )
    )
    WITH CHECK (
        public.current_user_role_code() = 'SUPER_ADMIN'
        OR (
            public.current_user_role_code() = 'DEPARTMENT_USER'
            AND department_id = public.current_user_dept_id()
            AND current_status = 'DRAFT'
        )
    );

-- ==============================================================================
-- 8. TRAINING APPLICATION PARTICIPANTS POLICIES
-- PJO cannot modify application participants!
-- ==============================================================================
CREATE POLICY "participants_select"
    ON public.training_application_participants FOR SELECT
    TO authenticated
    USING (
        public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC', 'ADMIN_PJO')
        OR EXISTS (
            SELECT 1 FROM public.training_applications ta
            WHERE ta.id = training_application_participants.application_id
              AND ta.department_id = public.current_user_dept_id()
        )
    );

CREATE POLICY "participants_manage_dept_user"
    ON public.training_application_participants FOR ALL
    TO authenticated
    USING (
        public.current_user_role_code() = 'SUPER_ADMIN'
        OR (
            public.current_user_role_code() = 'DEPARTMENT_USER'
            AND EXISTS (
                SELECT 1 FROM public.training_applications ta
                WHERE ta.id = training_application_participants.application_id
                  AND ta.department_id = public.current_user_dept_id()
                  AND ta.current_status = 'DRAFT'
            )
        )
    )
    WITH CHECK (
        public.current_user_role_code() = 'SUPER_ADMIN'
        OR (
            public.current_user_role_code() = 'DEPARTMENT_USER'
            AND EXISTS (
                SELECT 1 FROM public.training_applications ta
                WHERE ta.id = training_application_participants.application_id
                  AND ta.department_id = public.current_user_dept_id()
                  AND ta.current_status = 'DRAFT'
            )
            AND EXISTS (
                SELECT 1 FROM public.employees e
                WHERE e.id = training_application_participants.employee_id
                  AND e.department_id = public.current_user_dept_id()
            )
        )
    );

-- ==============================================================================
-- 9. TRAINING APPLICATION DOCUMENTS POLICIES
-- ==============================================================================
CREATE POLICY "app_docs_select"
    ON public.training_application_documents FOR SELECT
    TO authenticated
    USING (
        public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC', 'ADMIN_PJO')
        OR EXISTS (
            SELECT 1 FROM public.training_applications ta
            WHERE ta.id = training_application_documents.application_id
              AND ta.department_id = public.current_user_dept_id()
        )
    );

CREATE POLICY "app_docs_insert"
    ON public.training_application_documents FOR INSERT
    TO authenticated
    WITH CHECK (
        public.current_user_role_code() = 'SUPER_ADMIN'
        OR (
            public.current_user_role_code() = 'DEPARTMENT_USER'
            AND EXISTS (
                SELECT 1 FROM public.training_applications ta
                WHERE ta.id = training_application_documents.application_id
                  AND ta.department_id = public.current_user_dept_id()
                  AND ta.current_status = 'DRAFT'
            )
        )
    );

-- ==============================================================================
-- 10. TRAINING APPROVAL HISTORY POLICIES
-- Readable by all involved; INSERT via RPC/definer functions only; NO direct UPDATE/DELETE!
-- ==============================================================================
CREATE POLICY "approval_history_select"
    ON public.training_approval_history FOR SELECT
    TO authenticated
    USING (
        public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC', 'ADMIN_PJO')
        OR EXISTS (
            SELECT 1 FROM public.training_applications ta
            WHERE ta.id = training_approval_history.application_id
              AND ta.department_id = public.current_user_dept_id()
        )
    );

-- ==============================================================================
-- 11. TRAINING SCHEDULES POLICIES
-- ==============================================================================
CREATE POLICY "schedules_select"
    ON public.training_schedules FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "schedules_manage"
    ON public.training_schedules FOR ALL
    TO authenticated
    USING (public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC'))
    WITH CHECK (public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC'));

-- ==============================================================================
-- 12. TRAINING RECORDS POLICIES
-- ==============================================================================
CREATE POLICY "records_select"
    ON public.training_records FOR SELECT
    TO authenticated
    USING (
        public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC', 'ADMIN_PJO')
        OR EXISTS (
            SELECT 1 FROM public.employees e
            WHERE e.id = training_records.employee_id
              AND e.department_id = public.current_user_dept_id()
        )
    );

CREATE POLICY "records_manage"
    ON public.training_records FOR ALL
    TO authenticated
    USING (public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC'))
    WITH CHECK (public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC'));

-- ==============================================================================
-- 13 & 14. ATTENDANCE & EVALUATIONS POLICIES
-- ==============================================================================
CREATE POLICY "attendance_select"
    ON public.training_attendance FOR SELECT
    TO authenticated
    USING (
        public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC', 'ADMIN_PJO')
        OR EXISTS (
            SELECT 1 FROM public.training_records tr
            JOIN public.employees e ON tr.employee_id = e.id
            WHERE tr.id = training_attendance.record_id
              AND e.department_id = public.current_user_dept_id()
        )
    );

CREATE POLICY "attendance_manage"
    ON public.training_attendance FOR ALL
    TO authenticated
    USING (public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC'))
    WITH CHECK (public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC'));

CREATE POLICY "evaluations_select"
    ON public.training_evaluations FOR SELECT
    TO authenticated
    USING (
        public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC', 'ADMIN_PJO')
        OR EXISTS (
            SELECT 1 FROM public.employees e
            WHERE e.id = training_evaluations.employee_id
              AND e.department_id = public.current_user_dept_id()
        )
    );

CREATE POLICY "evaluations_manage"
    ON public.training_evaluations FOR ALL
    TO authenticated
    USING (public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC'))
    WITH CHECK (public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC'));

-- ==============================================================================
-- 15 & 16. CERTIFICATIONS & DOCS POLICIES
-- ==============================================================================
CREATE POLICY "certifications_select"
    ON public.certifications FOR SELECT
    TO authenticated
    USING (
        public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC', 'ADMIN_PJO')
        OR EXISTS (
            SELECT 1 FROM public.employees e
            WHERE e.id = certifications.employee_id
              AND e.department_id = public.current_user_dept_id()
        )
    );

CREATE POLICY "certifications_manage"
    ON public.certifications FOR ALL
    TO authenticated
    USING (public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC'))
    WITH CHECK (public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC'));

CREATE POLICY "cert_docs_select"
    ON public.certification_documents FOR SELECT
    TO authenticated
    USING (
        public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC', 'ADMIN_PJO')
        OR EXISTS (
            SELECT 1 FROM public.certifications c
            JOIN public.employees e ON c.employee_id = e.id
            WHERE c.id = certification_documents.certification_id
              AND e.department_id = public.current_user_dept_id()
        )
    );

-- ==============================================================================
-- 17, 18, 19, 20. KPI POLICIES
-- All users can view company and department KPIs; Super Admin configures.
-- ==============================================================================
CREATE POLICY "kpi_def_select" ON public.kpi_definitions FOR SELECT TO authenticated USING (true);
CREATE POLICY "kpi_def_manage" ON public.kpi_definitions FOR ALL TO authenticated 
    USING (public.current_user_role_code() = 'SUPER_ADMIN')
    WITH CHECK (public.current_user_role_code() = 'SUPER_ADMIN');

CREATE POLICY "kpi_targets_select" ON public.kpi_targets FOR SELECT TO authenticated 
    USING (
        public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC', 'ADMIN_PJO')
        OR department_id IS NULL
        OR department_id = public.current_user_dept_id()
    );
CREATE POLICY "kpi_targets_manage" ON public.kpi_targets FOR ALL TO authenticated 
    USING (public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC'))
    WITH CHECK (public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC'));

CREATE POLICY "kpi_weights_select" ON public.kpi_weights FOR SELECT TO authenticated USING (true);
CREATE POLICY "kpi_weights_manage" ON public.kpi_weights FOR ALL TO authenticated 
    USING (public.current_user_role_code() = 'SUPER_ADMIN')
    WITH CHECK (public.current_user_role_code() = 'SUPER_ADMIN');

CREATE POLICY "kpi_results_select" ON public.kpi_results FOR SELECT TO authenticated 
    USING (
        public.current_user_role_code() IN ('SUPER_ADMIN', 'ADMIN_HOD_TC', 'ADMIN_PJO')
        OR department_id IS NULL
        OR department_id = public.current_user_dept_id()
    );

-- ==============================================================================
-- 21. NOTIFICATIONS POLICIES
-- Users can only view and update their own notifications
-- ==============================================================================
CREATE POLICY "notifications_user_own"
    ON public.notifications FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ==============================================================================
-- 22. AUDIT LOGS POLICIES
-- Super Admin only!
-- ==============================================================================
CREATE POLICY "audit_logs_superadmin_select"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (public.current_user_role_code() = 'SUPER_ADMIN');
