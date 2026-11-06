-- ==============================================================================
-- THR DASHBOARD DATABASE MIGRATION - 03: APPROVAL WORKFLOW RPC FUNCTIONS
-- System: Supabase PostgreSQL
-- Description: Server-side secure functions for the strict sequential approval
--              workflow, transactions, history recording, and access validation.
-- ==============================================================================

-- ==============================================================================
-- RPC: SUBMIT TRAINING APPLICATION
-- Flow: DRAFT -> UNDER_HOD_REVIEW
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.submit_training_application(
    p_application_id UUID,
    p_submitted_by UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_app RECORD;
    v_actor_role VARCHAR;
    v_assigned_dept_id UUID;
    v_participant_count INTEGER;
    v_foreign_emp_count INTEGER;
    v_history_id UUID;
BEGIN
    -- 1. Fetch application with row lock (prevent concurrent race conditions)
    SELECT * INTO v_app
    FROM public.training_applications
    WHERE id = p_application_id
    FOR UPDATE;

    IF v_app.id IS NULL THEN
        RAISE EXCEPTION 'APPLICATION_NOT_FOUND: Application % does not exist.', p_application_id;
    END IF;

    -- 2. Status check
    IF v_app.current_status <> 'DRAFT' THEN
        RAISE EXCEPTION 'INVALID_STATUS: Only applications in DRAFT status can be submitted. Current status: %', v_app.current_status;
    END IF;

    -- 3. Actor check & department validation
    v_actor_role := public.get_user_role_code(p_submitted_by);
    IF v_actor_role = 'DEPARTMENT_USER' THEN
        v_assigned_dept_id := public.get_user_active_dept_id(p_submitted_by);
        IF v_assigned_dept_id IS NULL OR v_assigned_dept_id <> v_app.department_id THEN
            RAISE EXCEPTION 'PERMISSION_DENIED: You are not authorized to submit applications for this department.';
        END IF;
    ELSIF v_actor_role <> 'SUPER_ADMIN' THEN
        RAISE EXCEPTION 'PERMISSION_DENIED: Only active Department Users or Super Admin can submit applications.';
    END IF;

    -- 4. Participant validation: Single application can contain multiple employees, minimum 1
    SELECT COUNT(*) INTO v_participant_count
    FROM public.training_application_participants
    WHERE application_id = p_application_id;

    IF v_participant_count = 0 THEN
        RAISE EXCEPTION 'NO_PARTICIPANTS: Training application must contain at least one employee participant.';
    END IF;

    -- 5. Scope validation: All participants must belong to the application's department
    SELECT COUNT(*) INTO v_foreign_emp_count
    FROM public.training_application_participants tap
    JOIN public.employees e ON tap.employee_id = e.id
    WHERE tap.application_id = p_application_id
      AND e.department_id <> v_app.department_id;

    IF v_foreign_emp_count > 0 THEN
        RAISE EXCEPTION 'DEPARTMENT_MISMATCH: All participants in the application must belong to the department (%). Found % foreign employee(s).', v_app.department_id, v_foreign_emp_count;
    END IF;

    -- 6. Transition status
    UPDATE public.training_applications
    SET current_status = 'UNDER_HOD_REVIEW',
        updated_at = now()
    WHERE id = p_application_id;

    -- 7. Record approval history (append-only)
    INSERT INTO public.training_approval_history (
        application_id,
        actor_id,
        actor_role,
        action,
        previous_status,
        new_status,
        comments,
        action_timestamp
    )
    VALUES (
        p_application_id,
        p_submitted_by,
        v_actor_role,
        'SUBMIT',
        'DRAFT',
        'UNDER_HOD_REVIEW',
        'Submitted for HOD Training Center review.',
        now()
    )
    RETURNING id INTO v_history_id;

    -- 8. Notify HOD Training Center users
    INSERT INTO public.notifications (user_id, title, message, type, reference_id)
    SELECT u.id,
           'New Training Application Submitted',
           'Application ' || v_app.application_number || ' (' || v_app.training_title || ') is waiting for your review.',
           'HOD_REVIEW',
           p_application_id
    FROM public.user_profiles u
    JOIN public.roles r ON u.role_id = r.id
    WHERE r.code = 'ADMIN_HOD_TC' AND u.is_active = true;

    RETURN jsonb_build_object(
        'success', true,
        'application_id', p_application_id,
        'new_status', 'UNDER_HOD_REVIEW',
        'history_id', v_history_id
    );
END;
$$;

-- ==============================================================================
-- RPC: HOD REVIEW APPLICATION
-- Flow: UNDER_HOD_REVIEW -> PENDING_PJO (Approve) | DRAFT (Revision) | REJECTED (Reject)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.hod_review_application(
    p_application_id UUID,
    p_hod_user_id UUID,
    p_decision VARCHAR,
    p_comments TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_app RECORD;
    v_actor_role VARCHAR;
    v_new_status VARCHAR;
    v_action VARCHAR;
    v_history_id UUID;
BEGIN
    -- 1. Fetch application with row lock
    SELECT * INTO v_app
    FROM public.training_applications
    WHERE id = p_application_id
    FOR UPDATE;

    IF v_app.id IS NULL THEN
        RAISE EXCEPTION 'APPLICATION_NOT_FOUND: Application % does not exist.', p_application_id;
    END IF;

    -- 2. Verify current status is UNDER_HOD_REVIEW
    IF v_app.current_status <> 'UNDER_HOD_REVIEW' THEN
        RAISE EXCEPTION 'INVALID_STATUS: Application is not pending HOD review. Current status: %', v_app.current_status;
    END IF;

    -- 3. Verify actor role
    v_actor_role := public.get_user_role_code(p_hod_user_id);
    IF v_actor_role NOT IN ('ADMIN_HOD_TC', 'SUPER_ADMIN') THEN
        RAISE EXCEPTION 'PERMISSION_DENIED: Only ADMIN HOD TRAINING CENTER or Super Admin can perform HOD review.';
    END IF;

    -- 4. Validate decision
    IF p_decision NOT IN ('APPROVE', 'RETURN_FOR_REVISION', 'REJECT') THEN
        RAISE EXCEPTION 'INVALID_DECISION: Decision must be APPROVE, RETURN_FOR_REVISION, or REJECT.';
    END IF;

    -- Enforce mandatory comment on revision or rejection
    IF p_decision IN ('RETURN_FOR_REVISION', 'REJECT') AND (p_comments IS NULL OR trim(p_comments) = '') THEN
        RAISE EXCEPTION 'COMMENT_REQUIRED: A detailed reason/comment is required when returning or rejecting an application.';
    END IF;

    -- 5. Determine new status
    IF p_decision = 'APPROVE' THEN
        v_new_status := 'PENDING_PJO';
        v_action := 'HOD_APPROVE';
    ELSIF p_decision = 'RETURN_FOR_REVISION' THEN
        v_new_status := 'DRAFT';
        v_action := 'HOD_RETURN';
    ELSE
        v_new_status := 'REJECTED';
        v_action := 'HOD_REJECT';
    END IF;

    -- 6. Update application
    UPDATE public.training_applications
    SET current_status = v_new_status,
        hod_approver_id = p_hod_user_id,
        hod_decision = p_decision,
        hod_comments = p_comments,
        hod_reviewed_at = now(),
        updated_at = now()
    WHERE id = p_application_id;

    -- 7. Append approval history
    INSERT INTO public.training_approval_history (
        application_id,
        actor_id,
        actor_role,
        action,
        previous_status,
        new_status,
        comments,
        action_timestamp
    )
    VALUES (
        p_application_id,
        p_hod_user_id,
        v_actor_role,
        v_action,
        'UNDER_HOD_REVIEW',
        v_new_status,
        p_comments,
        now()
    )
    RETURNING id INTO v_history_id;

    -- 8. Notifications
    IF p_decision = 'APPROVE' THEN
        -- Notify centralized PJO
        INSERT INTO public.notifications (user_id, title, message, type, reference_id)
        SELECT u.id,
               'Application Awaiting PJO Final Authorization',
               'Application ' || v_app.application_number || ' has passed HOD review and is awaiting your final authorization.',
               'PJO_REVIEW',
               p_application_id
        FROM public.user_profiles u
        JOIN public.roles r ON u.role_id = r.id
        WHERE r.code = 'ADMIN_PJO' AND u.is_active = true;
    ELSIF p_decision = 'RETURN_FOR_REVISION' THEN
        -- Return to original submitter
        INSERT INTO public.notifications (user_id, title, message, type, reference_id)
        VALUES (
            v_app.submitted_by,
            'Application Returned for Revision by HOD',
            'HOD TC requested revisions for application ' || v_app.application_number || '. Note: ' || COALESCE(p_comments, ''),
            'REVISION_REQUESTED',
            p_application_id
        );
    ELSE
        -- Rejected notification to submitter
        INSERT INTO public.notifications (user_id, title, message, type, reference_id)
        VALUES (
            v_app.submitted_by,
            'Application Rejected by HOD',
            'Application ' || v_app.application_number || ' was rejected by HOD TC. Reason: ' || COALESCE(p_comments, ''),
            'REJECTED',
            p_application_id
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'application_id', p_application_id,
        'decision', p_decision,
        'new_status', v_new_status,
        'history_id', v_history_id
    );
END;
$$;

-- ==============================================================================
-- RPC: PJO REVIEW APPLICATION (FINAL AUTHORIZATION)
-- Flow: PENDING_PJO -> APPROVED (Approve) | DRAFT (Revision) | REJECTED (Reject)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.pjo_review_application(
    p_application_id UUID,
    p_pjo_user_id UUID,
    p_decision VARCHAR,
    p_comments TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_app RECORD;
    v_actor_role VARCHAR;
    v_new_status VARCHAR;
    v_action VARCHAR;
    v_history_id UUID;
BEGIN
    -- 1. Fetch application with row lock
    SELECT * INTO v_app
    FROM public.training_applications
    WHERE id = p_application_id
    FOR UPDATE;

    IF v_app.id IS NULL THEN
        RAISE EXCEPTION 'APPLICATION_NOT_FOUND: Application % does not exist.', p_application_id;
    END IF;

    -- 2. Strict Check: HOD TC approval must happen BEFORE PJO approval!
    -- PJO cannot approve an application before HOD!
    IF v_app.current_status <> 'PENDING_PJO' THEN
        RAISE EXCEPTION 'APPROVAL_SEQUENCE_ERROR: Application is not in PENDING_PJO state. Current status: %. PJO cannot act before HOD approval.', v_app.current_status;
    END IF;

    -- 3. Strict Check: Actor role must be ADMIN_PJO (or Super Admin)
    v_actor_role := public.get_user_role_code(p_pjo_user_id);
    IF v_actor_role NOT IN ('ADMIN_PJO', 'SUPER_ADMIN') THEN
        RAISE EXCEPTION 'PERMISSION_DENIED: Only ADMIN PJO or Super Admin can perform final authorization.';
    END IF;

    -- Strict Rule: PJO account must be distinct from HOD TC account
    IF v_app.hod_approver_id = p_pjo_user_id AND v_actor_role <> 'SUPER_ADMIN' THEN
        RAISE EXCEPTION 'ROLE_SEPARATION_VIOLATION: The same user cannot act as both HOD reviewer and PJO final approver.';
    END IF;

    -- 4. Validate decision
    IF p_decision NOT IN ('APPROVE', 'RETURN_FOR_REVISION', 'REJECT') THEN
        RAISE EXCEPTION 'INVALID_DECISION: Decision must be APPROVE, RETURN_FOR_REVISION, or REJECT.';
    END IF;

    IF p_decision IN ('RETURN_FOR_REVISION', 'REJECT') AND (p_comments IS NULL OR trim(p_comments) = '') THEN
        RAISE EXCEPTION 'COMMENT_REQUIRED: A detailed reason/comment is required when returning or rejecting an application.';
    END IF;

    -- 5. Determine new status
    IF p_decision = 'APPROVE' THEN
        v_new_status := 'APPROVED';
        v_action := 'PJO_APPROVE';
    ELSIF p_decision = 'RETURN_FOR_REVISION' THEN
        -- PJO revision returns the application to the original department user.
        -- After PJO revision, the application must go through HOD review again upon resubmission.
        v_new_status := 'DRAFT';
        v_action := 'PJO_RETURN';
    ELSE
        -- Rejection is terminal state unless Super Admin reopens
        v_new_status := 'REJECTED';
        v_action := 'PJO_REJECT';
    END IF;

    -- 6. Update application
    UPDATE public.training_applications
    SET current_status = v_new_status,
        pjo_approver_id = p_pjo_user_id,
        pjo_decision = p_decision,
        pjo_comments = p_comments,
        pjo_reviewed_at = now(),
        updated_at = now()
    WHERE id = p_application_id;

    -- 7. Append approval history
    INSERT INTO public.training_approval_history (
        application_id,
        actor_id,
        actor_role,
        action,
        previous_status,
        new_status,
        comments,
        action_timestamp
    )
    VALUES (
        p_application_id,
        p_pjo_user_id,
        v_actor_role,
        v_action,
        'PENDING_PJO',
        v_new_status,
        p_comments,
        now()
    )
    RETURNING id INTO v_history_id;

    -- 8. Notifications
    IF p_decision = 'APPROVE' THEN
        -- Notify submitter and HOD
        INSERT INTO public.notifications (user_id, title, message, type, reference_id)
        VALUES 
        (
            v_app.submitted_by,
            'Training Application Fully Approved',
            'Application ' || v_app.application_number || ' has received final approval from PJO and is ready for scheduling.',
            'APPROVED',
            p_application_id
        ),
        (
            v_app.hod_approver_id,
            'Training Application Authorized by PJO',
            'Application ' || v_app.application_number || ' has received final approval and can be scheduled.',
            'APPROVED',
            p_application_id
        );
    ELSIF p_decision = 'RETURN_FOR_REVISION' THEN
        INSERT INTO public.notifications (user_id, title, message, type, reference_id)
        VALUES (
            v_app.submitted_by,
            'Application Returned for Revision by PJO',
            'PJO requested revisions for application ' || v_app.application_number || '. Note: ' || COALESCE(p_comments, ''),
            'REVISION_REQUESTED',
            p_application_id
        );
    ELSE
        INSERT INTO public.notifications (user_id, title, message, type, reference_id)
        VALUES (
            v_app.submitted_by,
            'Application Rejected by PJO',
            'Application ' || v_app.application_number || ' was rejected by PJO. Reason: ' || COALESCE(p_comments, ''),
            'REJECTED',
            p_application_id
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'application_id', p_application_id,
        'decision', p_decision,
        'new_status', v_new_status,
        'history_id', v_history_id
    );
END;
$$;

-- ==============================================================================
-- RPC: SUPER ADMIN REOPEN REJECTED APPLICATION
-- Rule: Rejection is terminal state unless Super Admin performs an authorized
--       reopening action with a mandatory reason.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.superadmin_reopen_application(
    p_application_id UUID,
    p_actor_id UUID,
    p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_app RECORD;
    v_is_sa BOOLEAN;
    v_history_id UUID;
BEGIN
    -- 1. Security Check: Must be Super Admin
    v_is_sa := public.is_super_admin(p_actor_id);
    IF NOT v_is_sa THEN
        RAISE EXCEPTION 'PERMISSION_DENIED: Only Super Admin can reopen a rejected application.';
    END IF;

    -- 2. Mandatory reason check
    IF p_reason IS NULL OR trim(p_reason) = '' THEN
        RAISE EXCEPTION 'MANDATORY_REASON: A documented justification reason is required to reopen a rejected application.';
    END IF;

    -- 3. Fetch application
    SELECT * INTO v_app
    FROM public.training_applications
    WHERE id = p_application_id
    FOR UPDATE;

    IF v_app.id IS NULL THEN
        RAISE EXCEPTION 'APPLICATION_NOT_FOUND: Application % does not exist.', p_application_id;
    END IF;

    IF v_app.current_status <> 'REJECTED' THEN
        RAISE EXCEPTION 'INVALID_OPERATION: Only REJECTED applications can be reopened. Current status: %', v_app.current_status;
    END IF;

    -- 4. Reopen to DRAFT so department user can adjust and re-submit through full flow
    UPDATE public.training_applications
    SET current_status = 'DRAFT',
        hod_decision = NULL,
        hod_comments = NULL,
        hod_reviewed_at = NULL,
        pjo_decision = NULL,
        pjo_comments = NULL,
        pjo_reviewed_at = NULL,
        updated_at = now()
    WHERE id = p_application_id;

    -- 5. Append to approval history
    INSERT INTO public.training_approval_history (
        application_id,
        actor_id,
        actor_role,
        action,
        previous_status,
        new_status,
        comments,
        action_timestamp
    )
    VALUES (
        p_application_id,
        p_actor_id,
        'SUPER_ADMIN',
        'SUPERADMIN_REOPEN',
        'REJECTED',
        'DRAFT',
        'Authorized administrative reopening. Reason: ' || p_reason,
        now()
    )
    RETURNING id INTO v_history_id;

    -- 6. Audit log
    INSERT INTO public.audit_logs (table_name, record_id, action, actor_id, old_values, new_values)
    VALUES (
        'training_applications',
        p_application_id,
        'REOPEN',
        p_actor_id,
        jsonb_build_object('status', 'REJECTED'),
        jsonb_build_object('status', 'DRAFT', 'reopen_reason', p_reason)
    );

    -- 7. Notify submitter
    INSERT INTO public.notifications (user_id, title, message, type, reference_id)
    VALUES (
        v_app.submitted_by,
        'Application Reopened by Super Admin',
        'Application ' || v_app.application_number || ' was reopened by Super Admin. Reason: ' || p_reason,
        'ASSIGNMENT_CHANGED',
        p_application_id
    );

    RETURN jsonb_build_object(
        'success', true,
        'application_id', p_application_id,
        'new_status', 'DRAFT',
        'history_id', v_history_id
    );
END;
$$;

-- ==============================================================================
-- RPC: SCHEDULE APPROVED TRAINING
-- Rule: Only fully approved applications can proceed to scheduling and training execution.
-- Rejected or unapproved applications cannot proceed to scheduling!
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.schedule_approved_training(
    p_application_id UUID,
    p_scheduler_id UUID,
    p_batch_number VARCHAR,
    p_trainer_name VARCHAR,
    p_venue VARCHAR,
    p_start_date DATE,
    p_end_date DATE,
    p_daily_start TIME,
    p_daily_end TIME,
    p_total_hours NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_app RECORD;
    v_actor_role VARCHAR;
    v_schedule_id UUID;
    v_part RECORD;
BEGIN
    -- 1. Fetch application
    SELECT * INTO v_app
    FROM public.training_applications
    WHERE id = p_application_id
    FOR UPDATE;

    IF v_app.id IS NULL THEN
        RAISE EXCEPTION 'APPLICATION_NOT_FOUND: Application % does not exist.', p_application_id;
    END IF;

    -- 2. Strict Check: Only fully APPROVED applications can proceed to scheduling!
    IF v_app.current_status <> 'APPROVED' THEN
        RAISE EXCEPTION 'APPLICATION_NOT_APPROVED: Only fully approved applications can proceed to scheduling. Current status: %', v_app.current_status;
    END IF;

    -- 3. Actor check: Super Admin or HOD Training Center
    v_actor_role := public.get_user_role_code(p_scheduler_id);
    IF v_actor_role NOT IN ('ADMIN_HOD_TC', 'SUPER_ADMIN') THEN
        RAISE EXCEPTION 'PERMISSION_DENIED: Only Training Center administrators or Super Admin can schedule training execution.';
    END IF;

    -- 4. Create Schedule
    INSERT INTO public.training_schedules (
        application_id,
        batch_number,
        trainer_name,
        venue,
        start_date,
        end_date,
        daily_start_time,
        daily_end_time,
        total_hours,
        status,
        scheduled_by
    )
    VALUES (
        p_application_id,
        COALESCE(p_batch_number, 'BATCH-1'),
        p_trainer_name,
        p_venue,
        p_start_date,
        p_end_date,
        COALESCE(p_daily_start, '08:00:00'),
        COALESCE(p_daily_end, '17:00:00'),
        COALESCE(p_total_hours, 8.00),
        'SCHEDULED',
        p_scheduler_id
    )
    RETURNING id INTO v_schedule_id;

    -- 5. Transition application status to SCHEDULED
    UPDATE public.training_applications
    SET current_status = 'SCHEDULED',
        updated_at = now()
    WHERE id = p_application_id;

    -- 6. Generate initial training records for all participants
    FOR v_part IN
        SELECT employee_id
        FROM public.training_application_participants
        WHERE application_id = p_application_id
    LOOP
        INSERT INTO public.training_records (
            schedule_id,
            application_id,
            employee_id,
            attendance_status,
            result_status,
            passed,
            training_hours_completed
        )
        VALUES (
            v_schedule_id,
            p_application_id,
            v_part.employee_id,
            'ENROLLED',
            'PENDING',
            false,
            0.00
        )
        ON CONFLICT (schedule_id, employee_id) DO NOTHING;
    END LOOP;

    -- 7. Append approval history
    INSERT INTO public.training_approval_history (
        application_id,
        actor_id,
        actor_role,
        action,
        previous_status,
        new_status,
        comments,
        action_timestamp
    )
    VALUES (
        p_application_id,
        p_scheduler_id,
        v_actor_role,
        'HOD_APPROVE', -- workflow progression milestone
        'APPROVED',
        'SCHEDULED',
        'Training execution scheduled. Batch: ' || p_batch_number || ', Venue: ' || p_venue,
        now()
    );

    -- 8. Notify Department Submitter
    INSERT INTO public.notifications (user_id, title, message, type, reference_id)
    VALUES (
        v_app.submitted_by,
        'Training Scheduled for Execution',
        'Application ' || v_app.application_number || ' has been scheduled at ' || p_venue || ' starting ' || p_start_date || '.',
        'SCHEDULED',
        p_application_id
    );

    RETURN jsonb_build_object(
        'success', true,
        'application_id', p_application_id,
        'schedule_id', v_schedule_id,
        'new_status', 'SCHEDULED'
    );
END;
$$;
