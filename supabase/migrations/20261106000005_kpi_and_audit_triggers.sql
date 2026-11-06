-- ==============================================================================
-- THR DASHBOARD DATABASE MIGRATION - 05: KPI CALCULATION & AUDIT TRIGGERS
-- System: Supabase PostgreSQL
-- Description: Dynamic KPI computation engine and automated audit logging
--              fulfilling Test Scenario 12 (KPI values update from completed training).
-- ==============================================================================

-- ==============================================================================
-- FUNCTION: CALCULATE TRAINING KPIS
-- Computes real-time KPI metrics for a given year & department (or company-wide)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.calculate_training_kpis(
    p_year INTEGER,
    p_dept_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_employees INTEGER;
    v_total_hours NUMERIC(14,2);
    v_avg_hours_per_emp NUMERIC(14,2);

    v_total_enrolled INTEGER;
    v_total_passed INTEGER;
    v_pass_rate NUMERIC(14,2);

    v_total_completed_sessions INTEGER;
    v_total_scheduled_sessions INTEGER;
    v_completion_rate NUMERIC(14,2);

    v_kpi RECORD;
    v_target_val NUMERIC(14,2);
    v_actual_val NUMERIC(14,2);
    v_score NUMERIC(6,2);
    v_weight NUMERIC(5,2);
    v_weighted_score NUMERIC(6,2);
BEGIN
    -- 1. Calculate Total Active Employees
    SELECT COUNT(*) INTO v_total_employees
    FROM public.employees
    WHERE is_active = true 
      AND (p_dept_id IS NULL OR department_id = p_dept_id);

    IF v_total_employees = 0 THEN
        v_total_employees := 1; -- avoid division by zero
    END IF;

    -- 2. Calculate Total Training Hours Completed in Target Year
    SELECT COALESCE(SUM(tr.training_hours_completed), 0) INTO v_total_hours
    FROM public.training_records tr
    JOIN public.training_schedules ts ON tr.schedule_id = ts.id
    JOIN public.employees e ON tr.employee_id = e.id
    WHERE EXTRACT(YEAR FROM ts.start_date) = p_year
      AND tr.attendance_status = 'ATTENDED'
      AND (p_dept_id IS NULL OR e.department_id = p_dept_id);

    v_avg_hours_per_emp := ROUND((v_total_hours / v_total_employees)::numeric, 2);

    -- 3. Calculate Pass Rate (for Certifications and Assessed Trainings)
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE tr.passed = true OR tr.result_status = 'PASSED')
    INTO v_total_enrolled, v_total_passed
    FROM public.training_records tr
    JOIN public.training_schedules ts ON tr.schedule_id = ts.id
    JOIN public.employees e ON tr.employee_id = e.id
    WHERE EXTRACT(YEAR FROM ts.start_date) = p_year
      AND tr.attendance_status = 'ATTENDED'
      AND (p_dept_id IS NULL OR e.department_id = p_dept_id);

    IF v_total_enrolled > 0 THEN
        v_pass_rate := ROUND(((v_total_passed::numeric / v_total_enrolled::numeric) * 100.00), 2);
    ELSE
        v_pass_rate := 0.00;
    END IF;

    -- 4. Calculate Training Plan Completion Rate
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE ts.status = 'COMPLETED')
    INTO v_total_scheduled_sessions, v_total_completed_sessions
    FROM public.training_schedules ts
    JOIN public.training_applications ta ON ts.application_id = ta.id
    WHERE EXTRACT(YEAR FROM ts.start_date) = p_year
      AND (p_dept_id IS NULL OR ta.department_id = p_dept_id);

    IF v_total_scheduled_sessions > 0 THEN
        v_completion_rate := ROUND(((v_total_completed_sessions::numeric / v_total_scheduled_sessions::numeric) * 100.00), 2);
    ELSE
        v_completion_rate := 0.00;
    END IF;

    -- 5. Iterate through defined KPIs and update kpi_results
    FOR v_kpi IN SELECT * FROM public.kpi_definitions WHERE is_active = true LOOP
        -- Select actual value according to KPI Code
        IF v_kpi.code = 'KPI_HOURS_PER_EMP' THEN
            v_actual_val := v_avg_hours_per_emp;
        ELSIF v_kpi.code = 'KPI_PASS_RATE' THEN
            v_actual_val := v_pass_rate;
        ELSIF v_kpi.code = 'KPI_COMPLETION_RATE' THEN
            v_actual_val := v_completion_rate;
        ELSE
            v_actual_val := 0.00;
        END IF;

        -- Fetch Target
        SELECT target_value INTO v_target_val
        FROM public.kpi_targets
        WHERE kpi_id = v_kpi.id 
          AND year = p_year
          AND (
              (p_dept_id IS NULL AND department_id IS NULL)
              OR department_id = p_dept_id
          )
        LIMIT 1;

        IF v_target_val IS NULL OR v_target_val = 0 THEN
            v_target_val := 1.00;
            v_score := 0.00;
        ELSE
            v_score := LEAST(ROUND(((v_actual_val / v_target_val) * 100.00)::numeric, 2), 120.00); -- capped at 120%
        END IF;

        -- Fetch Weight
        SELECT weight_percentage INTO v_weight
        FROM public.kpi_weights
        WHERE kpi_id = v_kpi.id AND year = p_year;

        IF v_weight IS NULL THEN
            v_weight := 0.00;
        END IF;

        v_weighted_score := ROUND(((v_score * v_weight) / 100.00)::numeric, 2);

        -- Upsert into kpi_results
        INSERT INTO public.kpi_results (
            kpi_id,
            department_id,
            year,
            period,
            actual_value,
            score,
            weighted_score,
            last_calculated_at
        )
        VALUES (
            v_kpi.id,
            p_dept_id,
            p_year,
            'ANNUAL',
            v_actual_val,
            v_score,
            v_weighted_score,
            now()
        )
        ON CONFLICT (kpi_id, department_id, year, period)
        DO UPDATE SET
            actual_value = EXCLUDED.actual_value,
            score = EXCLUDED.score,
            weighted_score = EXCLUDED.weighted_score,
            last_calculated_at = now(),
            updated_at = now();
    END LOOP;
END;
$$;

-- ==============================================================================
-- TRIGGER: RECALCULATE KPI ON TRAINING RECORD UPDATE OR COMPLETION
-- Whenever training records are marked as ATTENDED / PASSED, KPI recalculates!
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.trg_auto_recalculate_kpi()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_year INTEGER;
    v_dept_id UUID;
BEGIN
    SELECT EXTRACT(YEAR FROM ts.start_date), e.department_id
    INTO v_year, v_dept_id
    FROM public.training_schedules ts
    JOIN public.employees e ON NEW.employee_id = e.id
    WHERE ts.id = NEW.schedule_id;

    IF v_year IS NOT NULL THEN
        -- Recalculate Department-specific KPI
        PERFORM public.calculate_training_kpis(v_year, v_dept_id);
        -- Recalculate Company-wide KPI
        PERFORM public.calculate_training_kpis(v_year, NULL);
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_training_record_kpi_update ON public.training_records;
CREATE TRIGGER trg_training_record_kpi_update
AFTER INSERT OR UPDATE ON public.training_records
FOR EACH ROW EXECUTE FUNCTION public.trg_auto_recalculate_kpi();
