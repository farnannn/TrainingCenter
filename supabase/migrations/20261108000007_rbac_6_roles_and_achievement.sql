-- ============================================================================
-- MIGRATION 007: 6 OFFICIAL ROLES (RBAC) & TRAINING ACHIEVEMENT VIEW
-- Non-destructive update preserving all historical training & employee data
-- ============================================================================

-- 1. Update roles constraint to strictly the 6 official roles:
--    SUPER_ADMIN, ADMIN, PJO, MANAGER_TC, ADMIN_TC, ADMIN_HRGA
ALTER TABLE public.roles DROP CONSTRAINT IF EXISTS roles_code_check;

-- Migrate existing role codes safely before adding new constraint
UPDATE public.roles SET code = 'MANAGER_TC', name = 'Manager TC' WHERE code = 'ADMIN_HOD_TC';
UPDATE public.roles SET code = 'PJO', name = 'PJO' WHERE code = 'ADMIN_PJO';
UPDATE public.roles SET code = 'ADMIN', name = 'Admin' WHERE code = 'DEPARTMENT_USER';

-- Insert the 6 official roles if not present
INSERT INTO public.roles (code, name, description)
VALUES
  ('SUPER_ADMIN', 'Super Admin', 'Memiliki seluruh kewenangan sistem, User Management, System Settings, dan kontrol penuh atas data.'),
  ('ADMIN', 'Admin', 'Memiliki kewenangan operasional penuh untuk mengelola, menginput, mengedit, dan menghapus data training serta capaian.'),
  ('PJO', 'PJO', 'Penanggung Jawab Operasional — Akses View-Only pada Dashboard, Data Training, dan laporan visualisasi Training Achievement.'),
  ('MANAGER_TC', 'Manager TC', 'Memiliki akses penuh untuk mengelola data Training Achievement, koreksi target/realisasi, dan verifikasi training.'),
  ('ADMIN_TC', 'Admin TC', 'Bertugas mengelola data operasional Training Center, jadwal pelaksanaan, evaluasi, dan capaian training.'),
  ('ADMIN_HRGA', 'Admin HRGA', 'Mengelola data training sesuai kebutuhan departemen HRGA dan akses View laporan capaian Training Achievement.')
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Remove any role not in the 6 official roles
DELETE FROM public.roles
WHERE code NOT IN ('SUPER_ADMIN', 'ADMIN', 'PJO', 'MANAGER_TC', 'ADMIN_TC', 'ADMIN_HRGA');

ALTER TABLE public.roles
  ADD CONSTRAINT roles_code_check
  CHECK (code IN ('SUPER_ADMIN', 'ADMIN', 'PJO', 'MANAGER_TC', 'ADMIN_TC', 'ADMIN_HRGA'));

-- 2. Add Achievement tracking columns to training_applications (non-destructive)
ALTER TABLE public.training_applications
  ADD COLUMN IF NOT EXISTS planned_hours NUMERIC(6,2) DEFAULT 16,
  ADD COLUMN IF NOT EXISTS actual_hours NUMERIC(6,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS planned_participants INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS actual_participants INT DEFAULT 0;

-- Allow CANCELLED status in training_applications
ALTER TABLE public.training_applications
  DROP CONSTRAINT IF EXISTS training_applications_current_status_check;

ALTER TABLE public.training_applications
  ADD CONSTRAINT training_applications_current_status_check
  CHECK (current_status IN (
    'DRAFT',
    'SUBMITTED',
    'UNDER_HOD_REVIEW',
    'PENDING_PJO',
    'APPROVED',
    'REJECTED',
    'CANCELLED',
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED'
  ));

-- 3. Create Unified Training Achievement View (sourced directly from main training tables)
CREATE OR REPLACE VIEW public.v_training_achievement AS
SELECT
  ta.id AS training_id,
  ta.application_number,
  ta.training_title,
  ta.training_category,
  ta.training_type,
  ta.department_id,
  d.code AS department_code,
  d.name AS department_name,
  EXTRACT(YEAR FROM ta.proposed_start_date)::INT AS training_year,
  EXTRACT(MONTH FROM ta.proposed_start_date)::INT AS training_month,
  ta.proposed_start_date,
  ta.proposed_end_date,
  ta.current_status,
  CASE
    WHEN ta.current_status = 'COMPLETED' THEN 'REALIZED'
    WHEN ta.current_status IN ('REJECTED', 'CANCELLED') THEN 'CANCELLED'
    WHEN ta.current_status = 'IN_PROGRESS' THEN 'IN_PROGRESS'
    ELSE 'PENDING'
  END AS achievement_bucket,
  COALESCE(NULLIF(ta.planned_participants, 0), (
    SELECT COUNT(*)::INT FROM public.training_application_participants tap WHERE tap.application_id = ta.id
  )) AS planned_participants,
  CASE
    WHEN ta.current_status = 'COMPLETED' THEN
      COALESCE(NULLIF(ta.actual_participants, 0), (
        SELECT COUNT(*)::INT FROM public.training_records tr
        WHERE tr.application_id = ta.id AND tr.attendance_status = 'ATTENDED'
      ))
    ELSE 0
  END AS actual_participants,
  COALESCE(ta.planned_hours, 16) AS planned_hours,
  CASE
    WHEN ta.current_status = 'COMPLETED' THEN COALESCE(NULLIF(ta.actual_hours, 0), ta.planned_hours, 16)
    ELSE 0
  END AS actual_hours
FROM public.training_applications ta
JOIN public.departments d ON d.id = ta.department_id;

