-- ==============================================================================
-- THR DASHBOARD DATABASE MIGRATION - 06: SEED DATA
-- System: Supabase PostgreSQL
-- Description: Seeds roles, master departments, demonstration user accounts,
--              initial assignments, employees, training catalogue, and KPI benchmarks.
-- ==============================================================================

-- ==============================================================================
-- 1. SEED ROLES (3 Access Levels, 4 Functional Roles)
-- ==============================================================================
INSERT INTO public.roles (id, code, name, description, access_level)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'SUPER_ADMIN', 'Super Admin', 'Full administrative authorization across all enterprise modules and master controls', 1),
    ('10000000-0000-0000-0000-000000000002', 'ADMIN_HOD_TC', 'Admin HOD Training Center', 'Training Center Head. Manages first-stage application reviews, training execution, catalogue & certifications', 2),
    ('10000000-0000-0000-0000-000000000003', 'ADMIN_PJO', 'Admin PJO', 'Penanggung Jawab Operasional. Centralized final authorization authority for company-wide training', 2),
    ('10000000-0000-0000-0000-000000000004', 'DEPARTMENT_USER', 'Department User', 'Designated department training representative responsible for submitting applications for department personnel', 3)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    access_level = EXCLUDED.access_level;

-- ==============================================================================
-- 2. SEED DEPARTMENTS
-- ==============================================================================
INSERT INTO public.departments (id, code, name, description)
VALUES
    ('20000000-0000-0000-0000-000000000001', 'MOD', 'Mining Operations Department', 'Manages pit operations, excavation, and haulage'),
    ('20000000-0000-0000-0000-000000000002', 'MED', 'Mining Engineering Department', 'Mine planning, geology, survey, and geotechnical engineering'),
    ('20000000-0000-0000-0000-000000000003', 'HRGA', 'Human Resources & General Affairs', 'People operations, industrial relations, and facilities'),
    ('20000000-0000-0000-0000-000000000004', 'TC', 'Training Center', 'Competency development, technical training, and certifications'),
    ('20000000-0000-0000-0000-000000000005', 'HSE', 'Health Safety & Environment', 'Occupational safety, mine health, and environmental compliance')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- ==============================================================================
-- 3. SEED DEMO AUTH USERS & PROFILES
-- Matches auth.users to user_profiles
-- ==============================================================================
-- Note: If running on live Supabase, auth.users inserts occur via Auth API or SQL:
DO $$
BEGIN
    -- Insert auth.users placeholder if schema exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES
            ('00000000-0000-0000-0000-000000000001', 'superadmin@ptraja.com', crypt('Admin123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Super Administrator"}', now(), now()),
            ('00000000-0000-0000-0000-000000000002', 'hod.training@ptraja.com', crypt('Admin123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"HOD Training Center"}', now(), now()),
            ('00000000-0000-0000-0000-000000000003', 'pjo@ptraja.com', crypt('Admin123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Bambang Sutrisno (PJO)"}', now(), now()),
            ('00000000-0000-0000-0000-000000000004', 'dept.mod@ptraja.com', crypt('Admin123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ahmad Fauzi (MOD Representative)"}', now(), now()),
            ('00000000-0000-0000-0000-000000000005', 'dept.med@ptraja.com', crypt('Admin123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Siti Rahma (MED Representative)"}', now(), now()),
            ('00000000-0000-0000-0000-000000000006', 'dept.hrga@ptraja.com', crypt('Admin123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Farid Nafis (HRGA Representative)"}', now(), now())
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

INSERT INTO public.user_profiles (id, role_id, nik, full_name, email, phone_number, department_id, is_active)
VALUES
    ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'NIK-ADMIN-01', 'Super Administrator', 'superadmin@ptraja.com', '+62811000001', NULL, true),
    ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'NIK-HOD-01', 'HOD Training Center', 'hod.training@ptraja.com', '+62811000002', '20000000-0000-0000-0000-000000000004', true),
    ('00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'NIK-PJO-01', 'Bambang Sutrisno (PJO)', 'pjo@ptraja.com', '+62811000003', NULL, true),
    ('00000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'NIK-MOD-REP', 'Ahmad Fauzi (MOD Representative)', 'dept.mod@ptraja.com', '+62811000004', '20000000-0000-0000-0000-000000000001', true),
    ('00000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000004', 'NIK-MED-REP', 'Siti Rahma (MED Representative)', 'dept.med@ptraja.com', '+62811000005', '20000000-0000-0000-0000-000000000002', true),
    ('00000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000004', 'NIK-HRGA-REP', 'Farid Nafis (HRGA Representative)', 'dept.hrga@ptraja.com', '+62811000006', '20000000-0000-0000-0000-000000000003', true)
ON CONFLICT (id) DO UPDATE SET
    role_id = EXCLUDED.role_id,
    nik = EXCLUDED.nik,
    full_name = EXCLUDED.full_name,
    department_id = EXCLUDED.department_id,
    is_active = EXCLUDED.is_active;

-- ==============================================================================
-- 4. SEED ACTIVE DEPARTMENT REPRESENTATIVE ASSIGNMENTS
-- Exactly one active user per department
-- ==============================================================================
INSERT INTO public.department_user_assignments (id, department_id, user_id, assigned_by, is_active, assigned_at)
VALUES
    ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', true, now()),
    ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', true, now()),
    ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', true, now())
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 5. SEED EMPLOYEES
-- ==============================================================================
INSERT INTO public.employees (id, department_id, nik, full_name, position, job_level, email, employment_status, is_active)
VALUES
    -- Mining Operations Department (MOD)
    ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'EMP-MOD-001', 'Budi Santoso', 'Excavator Operator', 'Operator', 'budi.santoso@ptraja.com', 'PERMANENT', true),
    ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'EMP-MOD-002', 'Agus Setiawan', 'Haul Truck Driver', 'Operator', 'agus.setiawan@ptraja.com', 'PERMANENT', true),
    ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'EMP-MOD-003', 'Rudi Hartono', 'Pit Foreman', 'Supervisor', 'rudi.hartono@ptraja.com', 'PERMANENT', true),

    -- Mining Engineering Department (MED)
    ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 'EMP-MED-001', 'Dewi Lestari', 'Short-term Mine Planner', 'Staff', 'dewi.lestari@ptraja.com', 'PERMANENT', true),
    ('40000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', 'EMP-MED-002', 'Hendra Wijaya', 'Geotechnical Specialist', 'Specialist', 'hendra.wijaya@ptraja.com', 'PERMANENT', true),

    -- Human Resources & General Affairs (HRGA)
    ('40000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000003', 'EMP-HRGA-001', 'Sri Fidyanti', 'HR Operations Officer', 'Staff', 'sri.fidyanti@ptraja.com', 'PERMANENT', true)
ON CONFLICT (nik) DO NOTHING;

-- ==============================================================================
-- 6. SEED TRAINING CATALOGUE
-- ==============================================================================
INSERT INTO public.training_programs (id, program_code, title, category, description, target_audience, default_duration_hours, default_budget_per_participant, is_mandatory)
VALUES
    ('50000000-0000-0000-0000-000000000001', 'TR-POP-01', 'Pengawas Operasional Pertama (POP) Pertambangan', 'Certification', 'Sertifikasi kompetensi pengawas operasional pertambangan berstandar BNSP / ESDM', 'Foremen & Supervisors', 40.00, 7500000.00, true),
    ('50000000-0000-0000-0000-000000000002', 'TR-DDT-01', 'Defensive Driving & Heavy Hauler Safety', 'Safety', 'Pelatihan berkendara aman di area tambang aktif', 'All Heavy Vehicle Drivers', 16.00, 2500000.00, true),
    ('50000000-0000-0000-0000-000000000003', 'TR-GEO-01', 'Slope Stability & Geotechnical Monitoring', 'Technical', 'Analisis kestabilan lereng dan instrumentasi radar tambang', 'Mine Engineers & Geologists', 24.00, 6000000.00, false)
ON CONFLICT (program_code) DO NOTHING;

-- ==============================================================================
-- 7. SEED KPI DEFINITIONS, TARGETS & WEIGHTS
-- ==============================================================================
INSERT INTO public.kpi_definitions (id, code, name, description, unit, calculation_formula)
VALUES
    ('60000000-0000-0000-0000-000000000001', 'KPI_HOURS_PER_EMP', 'Average Training Hours per Employee', 'Total training hours completed divided by active headcount', 'HOURS', 'Total Completed Hours / Total Employees'),
    ('60000000-0000-0000-0000-000000000002', 'KPI_PASS_RATE', 'Certification & Assessment Pass Rate', 'Percentage of enrolled participants who successfully passed', 'PERCENTAGE', '(Passed Participants / Enrolled Participants) * 100'),
    ('60000000-0000-0000-0000-000000000003', 'KPI_COMPLETION_RATE', 'Training Plan Realization Rate', 'Percentage of approved training plans executed to completion', 'PERCENTAGE', '(Completed Sessions / Scheduled Sessions) * 100')
ON CONFLICT (code) DO NOTHING;

-- Targets for 2026 (Company-Wide)
INSERT INTO public.kpi_targets (id, kpi_id, department_id, year, target_value, target_period, set_by)
VALUES
    ('70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', NULL, 2026, 24.00, 'ANNUAL', '00000000-0000-0000-0000-000000000001'),
    ('70000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000002', NULL, 2026, 90.00, 'ANNUAL', '00000000-0000-0000-0000-000000000001'),
    ('70000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000003', NULL, 2026, 95.00, 'ANNUAL', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (kpi_id, department_id, year, target_period) DO NOTHING;

-- Targets for 2026 (MOD Department Specific)
INSERT INTO public.kpi_targets (id, kpi_id, department_id, year, target_value, target_period, set_by)
VALUES
    ('70000000-0000-0000-0000-000000000004', '60000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 2026, 20.00, 'ANNUAL', '00000000-0000-0000-0000-000000000001'),
    ('70000000-0000-0000-0000-000000000005', '60000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 2026, 85.00, 'ANNUAL', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (kpi_id, department_id, year, target_period) DO NOTHING;

-- KPI Weights for 2026 (Total 100%)
INSERT INTO public.kpi_weights (id, kpi_id, year, weight_percentage, assigned_by)
VALUES
    ('80000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 2026, 40.00, '00000000-0000-0000-0000-000000000001'),
    ('80000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000002', 2026, 35.00, '00000000-0000-0000-0000-000000000001'),
    ('80000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000003', 2026, 25.00, '00000000-0000-0000-0000-000000000001')
ON CONFLICT (kpi_id, year) DO UPDATE SET
    weight_percentage = EXCLUDED.weight_percentage;
