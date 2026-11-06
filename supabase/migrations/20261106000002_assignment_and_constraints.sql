-- ==============================================================================
-- THR DASHBOARD DATABASE MIGRATION - 02: ASSIGNMENT & STRUCTURAL CONSTRAINTS
-- System: Supabase PostgreSQL
-- Description: Enforces Department User single-active constraints, PJO centralized
--              assignment, historical preservation, and append-only audit rules.
-- ==============================================================================

-- ==============================================================================
-- FUNCTION: CHECK IF USER IS SUPER ADMIN
-- Helper security function returning boolean
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_super_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role_code VARCHAR;
BEGIN
    SELECT r.code INTO user_role_code
    FROM public.user_profiles u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = check_user_id AND u.is_active = true AND u.deleted_at IS NULL;

    RETURN user_role_code = 'SUPER_ADMIN';
END;
$$;

-- ==============================================================================
-- FUNCTION: GET USER ROLE CODE
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_user_role_code(check_user_id UUID)
RETURNS VARCHAR
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    role_code VARCHAR;
BEGIN
    SELECT r.code INTO role_code
    FROM public.user_profiles u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = check_user_id AND u.is_active = true AND u.deleted_at IS NULL;

    RETURN role_code;
END;
$$;

-- ==============================================================================
-- FUNCTION: GET USER ASSIGNED DEPARTMENT ID
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_user_active_dept_id(check_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    assigned_dept_id UUID;
BEGIN
    SELECT department_id INTO assigned_dept_id
    FROM public.department_user_assignments
    WHERE user_id = check_user_id AND is_active = true
    LIMIT 1;

    RETURN assigned_dept_id;
END;
$$;

-- ==============================================================================
-- RPC: ASSIGN DEPARTMENT USER (SUPER ADMIN ONLY)
-- Enforces:
-- 1. Caller must be Super Admin.
-- 2. Target user must have role DEPARTMENT_USER.
-- 3. Deactivates previous active assignment for the department.
-- 4. Target user cannot have another active assignment in another department.
-- 5. Preserves complete historical assignments.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.assign_department_user(
    p_department_id UUID,
    p_user_id UUID,
    p_assigned_by UUID,
    p_reason TEXT DEFAULT 'Standard Appointment'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_is_sa BOOLEAN;
    v_target_role VARCHAR;
    v_existing_active_assignment_dept UUID;
    v_old_assignment_id UUID;
    v_old_user_id UUID;
    v_new_assignment_id UUID;
BEGIN
    -- 1. Security Check: Caller must be Super Admin
    v_is_sa := public.is_super_admin(p_assigned_by);
    IF NOT v_is_sa THEN
        RAISE EXCEPTION 'PERMISSION_DENIED: Only Super Admin can manage department assignments.';
    END IF;

    -- 2. Check Department exists and is active
    IF NOT EXISTS (SELECT 1 FROM public.departments WHERE id = p_department_id AND is_active = true) THEN
        RAISE EXCEPTION 'DEPARTMENT_NOT_FOUND: Department is either inactive or does not exist.';
    END IF;

    -- 3. Check Target User exists, is active and has role DEPARTMENT_USER
    v_target_role := public.get_user_role_code(p_user_id);
    IF v_target_role IS NULL THEN
        RAISE EXCEPTION 'USER_NOT_FOUND: Target user does not exist or is inactive.';
    END IF;
    IF v_target_role <> 'DEPARTMENT_USER' THEN
        RAISE EXCEPTION 'INVALID_ROLE: Assigned user must have role DEPARTMENT_USER. Current role: %', v_target_role;
    END IF;

    -- 4. Check if target user is already actively assigned to ANOTHER department
    SELECT department_id INTO v_existing_active_assignment_dept
    FROM public.department_user_assignments
    WHERE user_id = p_user_id AND is_active = true;

    IF v_existing_active_assignment_dept IS NOT NULL AND v_existing_active_assignment_dept <> p_department_id THEN
        RAISE EXCEPTION 'USER_ALREADY_ASSIGNED: User % is already assigned as active representative for another department.', p_user_id;
    END IF;

    -- 5. Deactivate previous active assignment for this department (if any)
    SELECT id, user_id INTO v_old_assignment_id, v_old_user_id
    FROM public.department_user_assignments
    WHERE department_id = p_department_id AND is_active = true;

    IF v_old_assignment_id IS NOT NULL THEN
        UPDATE public.department_user_assignments
        SET is_active = false,
            deactivated_at = now(),
            deactivation_reason = COALESCE(p_reason, 'Replaced by new appointee')
        WHERE id = v_old_assignment_id;

        -- Notify replaced user
        INSERT INTO public.notifications (user_id, title, message, type, reference_id)
        VALUES (
            v_old_user_id,
            'Department Representative Assignment Concluded',
            'Your role as active department representative has been transitioned.',
            'ASSIGNMENT_CHANGED',
            p_department_id
        );
    END IF;

    -- 6. Insert new active assignment
    INSERT INTO public.department_user_assignments (
        department_id,
        user_id,
        assigned_by,
        is_active,
        assigned_at
    )
    VALUES (
        p_department_id,
        p_user_id,
        p_assigned_by,
        true,
        now()
    )
    RETURNING id INTO v_new_assignment_id;

    -- 7. Update user profile department link
    UPDATE public.user_profiles
    SET department_id = p_department_id,
        updated_at = now()
    WHERE id = p_user_id;

    -- 8. Record audit log
    INSERT INTO public.audit_logs (table_name, record_id, action, actor_id, old_values, new_values)
    VALUES (
        'department_user_assignments',
        v_new_assignment_id,
        'INSERT',
        p_assigned_by,
        jsonb_build_object('replaced_user_id', v_old_user_id, 'previous_assignment_id', v_old_assignment_id),
        jsonb_build_object('new_user_id', p_user_id, 'department_id', p_department_id)
    );

    -- 9. Notify newly assigned user
    INSERT INTO public.notifications (user_id, title, message, type, reference_id)
    VALUES (
        p_user_id,
        'Appointed as Active Department Representative',
        'You have been appointed as the official training representative for your department.',
        'ASSIGNMENT_CHANGED',
        p_department_id
    );

    RETURN jsonb_build_object(
        'success', true,
        'assignment_id', v_new_assignment_id,
        'department_id', p_department_id,
        'user_id', p_user_id,
        'replaced_user_id', v_old_user_id
    );
END;
$$;

-- ==============================================================================
-- RPC: ASSIGN PJO ACCOUNT (SUPER ADMIN ONLY)
-- Enforces:
-- 1. There must be exactly one active PJO account.
-- 2. The PJO account must be distinct from the HOD Training Center account.
-- 3. Only Super Admin can assign or replace the PJO account.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.assign_pjo_account(
    p_new_pjo_user_id UUID,
    p_assigned_by UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_is_sa BOOLEAN;
    v_pjo_role_id UUID;
    v_hod_role_id UUID;
    v_current_role_id UUID;
    v_existing_pjo_id UUID;
BEGIN
    -- 1. Security Check: Caller must be Super Admin
    v_is_sa := public.is_super_admin(p_assigned_by);
    IF NOT v_is_sa THEN
        RAISE EXCEPTION 'PERMISSION_DENIED: Only Super Admin can assign or replace the PJO account.';
    END IF;

    -- Get Role UUIDs
    SELECT id INTO v_pjo_role_id FROM public.roles WHERE code = 'ADMIN_PJO';
    SELECT id INTO v_hod_role_id FROM public.roles WHERE code = 'ADMIN_HOD_TC';

    -- Check candidate user
    SELECT role_id INTO v_current_role_id
    FROM public.user_profiles
    WHERE id = p_new_pjo_user_id AND is_active = true AND deleted_at IS NULL;

    IF v_current_role_id IS NULL THEN
        RAISE EXCEPTION 'USER_NOT_FOUND: Target user does not exist or is inactive.';
    END IF;

    -- Strict Rule: PJO must be distinct from HOD TC account!
    IF v_current_role_id = v_hod_role_id THEN
        RAISE EXCEPTION 'ROLE_CONFLICT: HOD Training Center account cannot be assigned as PJO. They must be separate accounts.';
    END IF;

    -- Find existing active PJO
    SELECT id INTO v_existing_pjo_id
    FROM public.user_profiles
    WHERE role_id = v_pjo_role_id AND is_active = true AND deleted_at IS NULL AND id <> p_new_pjo_user_id
    LIMIT 1;

    -- If another active PJO exists, revoke their PJO role (assign to standard staff or deactivate)
    IF v_existing_pjo_id IS NOT NULL THEN
        -- We deactivate or adjust the old PJO's role so only one active PJO exists
        UPDATE public.user_profiles
        SET is_active = false,
            updated_at = now()
        WHERE id = v_existing_pjo_id;

        INSERT INTO public.audit_logs (table_name, record_id, action, actor_id, old_values, new_values)
        VALUES (
            'user_profiles',
            v_existing_pjo_id,
            'UPDATE',
            p_assigned_by,
            jsonb_build_object('role', 'ADMIN_PJO', 'is_active', true),
            jsonb_build_object('is_active', false, 'reason', 'Replaced by new PJO appointee')
        );
    END IF;

    -- Assign target user to ADMIN_PJO
    UPDATE public.user_profiles
    SET role_id = v_pjo_role_id,
        is_active = true,
        updated_at = now()
    WHERE id = p_new_pjo_user_id;

    -- Audit log
    INSERT INTO public.audit_logs (table_name, record_id, action, actor_id, old_values, new_values)
    VALUES (
        'user_profiles',
        p_new_pjo_user_id,
        'UPDATE',
        p_assigned_by,
        jsonb_build_object('previous_role_id', v_current_role_id),
        jsonb_build_object('new_role', 'ADMIN_PJO', 'is_active', true)
    );

    RETURN jsonb_build_object(
        'success', true,
        'new_pjo_user_id', p_new_pjo_user_id,
        'deactivated_pjo_user_id', v_existing_pjo_id
    );
END;
$$;

-- ==============================================================================
-- TRIGGER: PREVENT TAMPERING WITH APPROVAL HISTORY
-- Enforces: training_approval_history is strictly append-only!
-- No UPDATE or DELETE allowed.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.trg_prevent_approval_history_tampering()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        RAISE EXCEPTION 'SECURITY_VIOLATION: training_approval_history is an append-only audit trail and cannot be updated.';
    ELSIF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'SECURITY_VIOLATION: training_approval_history records cannot be deleted.';
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_approval_history_tamper ON public.training_approval_history;
CREATE TRIGGER trg_approval_history_tamper
BEFORE UPDATE OR DELETE ON public.training_approval_history
FOR EACH ROW EXECUTE FUNCTION public.trg_prevent_approval_history_tampering();

-- ==============================================================================
-- TRIGGER: PRESERVE APPLICATION ORIGIN & PREVENT SUBMITTER/DEPT OVERRIDE
-- Historical application records must preserve the original submitter and department.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.trg_preserve_application_origin()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.submitted_by <> NEW.submitted_by THEN
        RAISE EXCEPTION 'IMMUTABLE_FIELD: The original submitter (submitted_by) of a training application cannot be altered.';
    END IF;
    IF OLD.department_id <> NEW.department_id THEN
        RAISE EXCEPTION 'IMMUTABLE_FIELD: The originating department (department_id) of a training application cannot be altered.';
    END IF;
    IF OLD.application_number <> NEW.application_number THEN
        RAISE EXCEPTION 'IMMUTABLE_FIELD: The application_number is permanent and cannot be altered.';
    END IF;

    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_app_origin_preserve ON public.training_applications;
CREATE TRIGGER trg_app_origin_preserve
BEFORE UPDATE ON public.training_applications
FOR EACH ROW EXECUTE FUNCTION public.trg_preserve_application_origin();
