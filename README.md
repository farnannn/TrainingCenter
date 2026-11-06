# THR Dashboard – Training Management & Operational Certification System
## PT RAJA Enterprise Production Implementation

This project implements the database architecture, security permissions (Row Level Security), department representative constraints, centralized PJO governance, and strict sequential approval workflow for the **PT RAJA Training & Human Resources (THR) Dashboard**.

---

## 1. Confirmed Business Architecture

### Roles and Access Hierarchy
| Access Level | Functional Role Code | Role Name | Scope & Authority |
|---|---|---|---|
| **Level 1** | `SUPER_ADMIN` | Super Administrator | Full company-wide authority, user & role management, department representative appointment, centralized PJO appointment, KPI definition, administrative corrections, terminal rejection reopening, audit logs. |
| **Level 2** | `ADMIN_HOD_TC` | Admin HOD Training Center | First-stage approval review, training catalogue management, training batch scheduling, historical records, certification issuance, TC KPI analysis. Distinct from PJO. |
| **Level 2** | `ADMIN_PJO` | Admin Penanggung Jawab Operasional | Centralized final authorization across all departments. Processes only applications that have passed HOD review. Cannot edit department application data or participants. Distinct from HOD TC. |
| **Level 3** | `DEPARTMENT_USER` | Department Representative | Scoped exclusively to assigned department. Creates and submits applications, selects department employees, tracks approvals, revises returned applications. Cannot approve applications. |

---

## 2. Normalized Database Schema (22 PostgreSQL Tables)

All tables use UUID primary keys, foreign keys, timestamps, indexes, constraints, and audit trails.

1. **`roles`**: Master definition of the 4 roles and 3 access levels.
2. **`departments`**: Mining company business units (`MOD`, `MED`, `HRGA`, `TC`, `HSE`).
3. **`user_profiles`**: Linked to Supabase Auth (`auth.users.id`).
4. **`employees`**: Company workforce scoped to departments.
5. **`department_user_assignments`**: Active and historical department representative assignments.
   - `UNIQUE (department_id) WHERE is_active = true` (exactly one active user per department).
   - `UNIQUE (user_id) WHERE is_active = true` (one user can only represent one department).
6. **`training_programs`**: Master catalogue of certified and technical courses.
7. **`training_applications`**: Main application record containing:
   - `id`, `application_number`, `department_id`, `submitted_by`, `training_title`, `training_category`, `training_objectives`, `training_provider`, `training_location`, `proposed_start_date`, `proposed_end_date`, `estimated_budget`, `training_type`, `description`, `current_status`, `hod_approver_id`, `hod_decision`, `hod_comments`, `hod_reviewed_at`, `pjo_approver_id`, `pjo_decision`, `pjo_comments`, `pjo_reviewed_at`, `created_at`, `updated_at`.
8. **`training_application_participants`**: Multi-employee participant links.
9. **`training_application_documents`**: Syllabi, budget quotations, proposals.
10. **`training_approval_history`**: Append-only audit log of all workflow actions (tampering prevented via trigger).
11. **`training_schedules`**: Batch delivery schedules created upon PJO approval.
12. **`training_records`**: Individual participant attendance, pre/post scores, and pass status.
13. **`training_attendance`**: Session check-ins.
14. **`training_evaluations`**: Participant instructor and facility ratings.
15. **`certifications`**: Valid licenses and statutory competency certificates.
16. **`certification_documents`**: Digital certificate uploads.
17. **`kpi_definitions`**: Training KPIs (Hours per Employee, Pass Rate, Completion Rate).
18. **`kpi_targets`**: Annual company and department targets.
19. **`kpi_weights`**: Weighted scoring percentages.
20. **`kpi_results`**: Dynamically recalculated scores and realizations.
21. **`notifications`**: Real-time alerts for workflow milestones.
22. **`audit_logs`**: System forensic logs for administrative actions.

---

## 3. Strict Sequential Approval Workflow

```
[DRAFT]
   │
   ▼ (Dept User submits with ≥1 dept employee)
[UNDER_HOD_REVIEW] (Stage 1: HOD Training Center)
   │
   ├── [RETURN_FOR_REVISION] ───────────┐
   ├── [REJECT] ─── (Terminal State)     │
   ▼ (HOD APPROVE)                      │
[PENDING_PJO] (Stage 2: Centralized PJO) │
   │                                    │
   ├── [RETURN_FOR_REVISION] ───────────┤
   ├── [REJECT] ─── (Terminal State)     │
   ▼ (PJO APPROVE)                      ▼
[APPROVED]                      [DRAFT (Returned)]
   │                                    │
   ▼ (Schedule Batch)                   │ (Must go through HOD again)
[SCHEDULED]                             └─────────────────────────► [UNDER_HOD_REVIEW]
   │
   ▼ (Conduct & Record Attendance)
[IN_PROGRESS]
   │
   ▼ (Record Assessment & Issue Certifications)
[COMPLETED] ──► (Triggers KPI Recalculation)
```

### Revision & Rejection Rules
1. **HOD revision** returns application to the original Department User.
2. **PJO revision** returns application to the original Department User.
3. **Resubmission after PJO revision** must cycle through HOD review again.
4. **Previous approval history** is strictly preserved in `training_approval_history`.
5. **Rejection is a terminal state** unless Super Admin executes an authorized reopening action with a mandatory reason.
6. **No user may bypass** the approval sequence.

---

## 4. Supabase SQL Migrations

The migrations are located in `supabase/migrations/`:

- `20261106000001_initial_schema.sql`: 22 normalized tables, UUID PKs, indexes, constraints, soft delete.
- `20261106000002_assignment_and_constraints.sql`: Single active department representative constraint, PJO assignment logic, append-only history trigger, origin preservation trigger.
- `20261106000003_approval_workflow_rpc.sql`: Secure server-side RPC functions (`submit_training_application`, `hod_review_application`, `pjo_review_application`, `schedule_approved_training`, `superadmin_reopen_application`).
- `20261106000004_rls_policies.sql`: Row Level Security policies enforcing data isolation across all 4 roles.
- `20261106000005_kpi_and_audit_triggers.sql`: Real-time KPI recalculation engine on training completion.
- `20261106000006_seed_data.sql`: Seed data for roles, departments, test user accounts, employees, courses, and KPI targets.

### Applying to Supabase:
```bash
# Using Supabase CLI:
supabase db reset

# Or apply migrations individually:
supabase migration up
```

---

## 5. Demonstration Test Accounts

| Role | Email | Password | Scope / Responsibility |
|---|---|---|---|
| **SUPER ADMIN** | `superadmin@ptraja.com` | `Admin123!` | Executive oversight, master controls, reopens, appointments |
| **ADMIN HOD TC** | `hod.training@ptraja.com` | `Admin123!` | Stage 1 review, catalogue, schedules, certifications |
| **ADMIN PJO** | `pjo@ptraja.com` | `Admin123!` | Centralized final authorization across all departments |
| **DEPT USER (MOD)** | `dept.mod@ptraja.com` | `Admin123!` | Mining Operations Department representative |
| **DEPT USER (MED)** | `dept.med@ptraja.com` | `Admin123!` | Mining Engineering Department representative |
| **DEPT USER (HRGA)** | `dept.hrga@ptraja.com` | `Admin123!` | Human Resources & General Affairs representative |

---

## 6. Verification of the 12 Required Test Scenarios

Run the automated verification suite:
```bash
npm test
```

### Test Suite Results:
- `[PASS] Scenario 1`: Department MOD user cannot access MED employee records.
- `[PASS] Scenario 2`: One department cannot create a second active department user.
- `[PASS] Scenario 3`: Department User cannot approve their own application.
- `[PASS] Scenario 4`: HOD cannot perform final PJO approval.
- `[PASS] Scenario 5`: PJO cannot approve an application before HOD.
- `[PASS] Scenario 6`: PJO cannot modify application participants.
- `[PASS] Scenario 7`: PJO revision returns application through HOD review.
- `[PASS] Scenario 8`: Rejected applications cannot proceed to scheduling.
- `[PASS] Scenario 9`: Approved applications can proceed to training scheduling.
- `[PASS] Scenario 10`: Approval history is preserved after revisions.
- `[PASS] Scenario 11`: Super Admin can manage users and assignments.
- `[PASS] Scenario 12`: KPI values update from completed training data.

**Total: 12 Passed, 0 Failed.**

---

## 7. Running the Application Locally

```bash
# 1. Install dependencies
npm install

# 2. Run unit and business scenario tests
npm test

# 3. Start development server
npm run dev
```

Open `http://localhost:5173` to interact with the responsive dashboard, test the approval workflow, and switch between test accounts using the top switcher banner.
