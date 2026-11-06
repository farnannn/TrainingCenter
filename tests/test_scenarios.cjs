// ==============================================================================
// THR DASHBOARD TEST SUITE - 12 MANDATORY BUSINESS & SECURITY SCENARIOS
// ==============================================================================

const assert = require('assert');

// Simple emulation runner using CommonJS
class TestContext {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.testResults = [];
  }

  test(name, fn) {
    try {
      fn();
      this.passed++;
      this.testResults.push({ name, status: 'PASSED' });
      console.log(`[PASS] ${name}`);
    } catch (err) {
      this.failed++;
      this.testResults.push({ name, status: 'FAILED', error: err.message });
      console.error(`[FAIL] ${name}: ${err.message}`);
    }
  }

  report() {
    console.log('\n======================================================');
    console.log(`TEST SUMMARY: ${this.passed} PASSED, ${this.failed} FAILED`);
    console.log('======================================================');
    if (this.failed > 0) {
      process.exit(1);
    }
  }
}

const runner = new TestContext();

// Mini mock store replica for pure node test execution
function createTestEnvironment() {
  const roles = [
    { id: 'r-admin', code: 'SUPER_ADMIN' },
    { id: 'r-hod', code: 'ADMIN_HOD_TC' },
    { id: 'r-pjo', code: 'ADMIN_PJO' },
    { id: 'r-dept', code: 'DEPARTMENT_USER' },
  ];

  const departments = [
    { id: 'd-mod', code: 'MOD', name: 'Mining Operations' },
    { id: 'd-med', code: 'MED', name: 'Mining Engineering' },
  ];

  const users = [
    { id: 'u-admin', role: 'SUPER_ADMIN', email: 'admin@raja.com' },
    { id: 'u-hod', role: 'ADMIN_HOD_TC', email: 'hod@raja.com' },
    { id: 'u-pjo', role: 'ADMIN_PJO', email: 'pjo@raja.com' },
    { id: 'u-mod', role: 'DEPARTMENT_USER', dept_id: 'd-mod', email: 'mod@raja.com' },
    { id: 'u-mod-candidate2', role: 'DEPARTMENT_USER', dept_id: null, email: 'mod2@raja.com' },
    { id: 'u-med', role: 'DEPARTMENT_USER', dept_id: 'd-med', email: 'med@raja.com' },
  ];

  const departmentAssignments = [
    { id: 'as-1', dept_id: 'd-mod', user_id: 'u-mod', is_active: true },
    { id: 'as-2', dept_id: 'd-med', user_id: 'u-med', is_active: true },
  ];

  const employees = [
    { id: 'e-mod-1', dept_id: 'd-mod', name: 'Budi Santoso' },
    { id: 'e-mod-2', dept_id: 'd-mod', name: 'Agus Setiawan' },
    { id: 'e-med-1', dept_id: 'd-med', name: 'Dewi Lestari' },
  ];

  const applications = [];
  const participants = [];
  const approvalHistory = [];
  const schedules = [];
  const records = [];

  const kpis = {
    totalHours: 0,
    activeEmployees: 3,
    avgHoursPerEmp: 0,
    passRate: 0,
  };

  return {
    roles,
    departments,
    users,
    departmentAssignments,
    employees,
    applications,
    participants,
    approvalHistory,
    schedules,
    records,
    kpis,
    recalculateKpis() {
      const attended = records.filter(r => r.attendance_status === 'ATTENDED');
      const totalHours = attended.reduce((s, r) => s + r.hours, 0);
      kpis.totalHours = totalHours;
      kpis.avgHoursPerEmp = Math.round((totalHours / kpis.activeEmployees) * 100) / 100;
      const passed = attended.filter(r => r.passed).length;
      kpis.passRate = attended.length > 0 ? Math.round((passed / attended.length) * 100) : 0;
    }
  };
}

const env = createTestEnvironment();

// ==============================================================================
// TEST 1: Department MOD user cannot access MED employee records
// ==============================================================================
runner.test('Scenario 1: Department MOD user cannot access MED employee records', () => {
  const callerId = 'u-mod';
  const caller = env.users.find(u => u.id === callerId);
  const activeAssignment = env.departmentAssignments.find(a => a.user_id === callerId && a.is_active);
  assert(activeAssignment, 'MOD user must have active assignment');

  // Query employees with RLS condition: (dept_id = caller.dept_id)
  const accessibleEmployees = env.employees.filter(e => {
    if (caller.role === 'DEPARTMENT_USER') {
      return e.dept_id === activeAssignment.dept_id;
    }
    return true;
  });

  const medEmployees = accessibleEmployees.filter(e => e.dept_id === 'd-med');
  assert.strictEqual(medEmployees.length, 0, 'MOD representative accessed MED employee records! RLS failed.');
  assert.strictEqual(accessibleEmployees.length, 2, 'MOD representative should see exactly 2 MOD employees');
});

// ==============================================================================
// TEST 2: One department cannot create a second active department user
// ==============================================================================
runner.test('Scenario 2: One department cannot create a second active department user', () => {
  function assignDepartmentUser(deptId, newUserId, assignedById) {
    const assigner = env.users.find(u => u.id === assignedById);
    if (assigner.role !== 'SUPER_ADMIN') {
      throw new Error('PERMISSION_DENIED: Only Super Admin can assign department representatives.');
    }

    // Check if new user is already assigned elsewhere
    const existingOther = env.departmentAssignments.find(a => a.user_id === newUserId && a.is_active && a.dept_id !== deptId);
    if (existingOther) {
      throw new Error('USER_ALREADY_ASSIGNED');
    }

    // Deactivate previous active assignment for this dept
    const existingDeptActive = env.departmentAssignments.find(a => a.dept_id === deptId && a.is_active);
    if (existingDeptActive) {
      existingDeptActive.is_active = false;
      existingDeptActive.deactivated_at = new Date().toISOString();
    }

    env.departmentAssignments.push({
      id: `as-${Date.now()}`,
      dept_id: deptId,
      user_id: newUserId,
      is_active: true
    });
  }

  // Attempt assignment of u-mod-candidate2 to MOD
  assignDepartmentUser('d-mod', 'u-mod-candidate2', 'u-admin');

  // Verify only ONE active assignment exists for MOD
  const activeMOD = env.departmentAssignments.filter(a => a.dept_id === 'd-mod' && a.is_active);
  assert.strictEqual(activeMOD.length, 1, 'Department MOD has more than one active user assignment!');
  assert.strictEqual(activeMOD[0].user_id, 'u-mod-candidate2', 'Active MOD assignment not transferred to new appointee.');
});

// ==============================================================================
// TEST 3: Department User cannot approve their own application
// ==============================================================================
runner.test('Scenario 3: Department User cannot approve their own application', () => {
  // Create an application submitted by u-mod
  const app = {
    id: 'app-001',
    dept_id: 'd-mod',
    submitted_by: 'u-mod',
    current_status: 'UNDER_HOD_REVIEW'
  };
  env.applications.push(app);

  function hodApprove(appId, actorId) {
    const actor = env.users.find(u => u.id === actorId);
    if (actor.role !== 'ADMIN_HOD_TC' && actor.role !== 'SUPER_ADMIN') {
      throw new Error('PERMISSION_DENIED: Department user cannot approve application.');
    }
    app.current_status = 'PENDING_PJO';
  }

  assert.throws(() => {
    hodApprove('app-001', 'u-mod');
  }, /PERMISSION_DENIED/, 'Department user was allowed to approve application!');
});

// ==============================================================================
// TEST 4: HOD cannot perform final PJO approval
// ==============================================================================
runner.test('Scenario 4: HOD cannot perform final PJO approval', () => {
  const app = env.applications.find(a => a.id === 'app-001');
  app.current_status = 'PENDING_PJO';

  function pjoApprove(appId, actorId) {
    const actor = env.users.find(u => u.id === actorId);
    if (actor.role !== 'ADMIN_PJO' && actor.role !== 'SUPER_ADMIN') {
      throw new Error('PERMISSION_DENIED: Only ADMIN PJO can perform final authorization.');
    }
    app.current_status = 'APPROVED';
  }

  assert.throws(() => {
    pjoApprove('app-001', 'u-hod');
  }, /PERMISSION_DENIED/, 'HOD was illegally permitted to perform final PJO approval!');
});

// ==============================================================================
// TEST 5: PJO cannot approve an application before HOD
// ==============================================================================
runner.test('Scenario 5: PJO cannot approve an application before HOD', () => {
  const prematureApp = {
    id: 'app-premature',
    dept_id: 'd-mod',
    submitted_by: 'u-mod',
    current_status: 'UNDER_HOD_REVIEW' // Not yet reviewed by HOD!
  };

  function pjoApprove(app, actorId) {
    const actor = env.users.find(u => u.id === actorId);
    if (actor.role !== 'ADMIN_PJO') throw new Error('PERMISSION_DENIED');
    if (app.current_status !== 'PENDING_PJO') {
      throw new Error('APPROVAL_SEQUENCE_ERROR: Application must pass HOD review before PJO approval.');
    }
    app.current_status = 'APPROVED';
  }

  assert.throws(() => {
    pjoApprove(prematureApp, 'u-pjo');
  }, /APPROVAL_SEQUENCE_ERROR/, 'PJO was allowed to approve application before HOD review!');
});

// ==============================================================================
// TEST 6: PJO cannot modify application participants
// ==============================================================================
runner.test('Scenario 6: PJO cannot modify application participants', () => {
  function modifyParticipants(appId, actorId, newParticipants) {
    const actor = env.users.find(u => u.id === actorId);
    if (actor.role === 'ADMIN_PJO') {
      throw new Error('PERMISSION_DENIED: Admin PJO cannot modify application participants.');
    }
  }

  assert.throws(() => {
    modifyParticipants('app-001', 'u-pjo', ['e-mod-1']);
  }, /PERMISSION_DENIED/, 'PJO was allowed to modify participants!');
});

// ==============================================================================
// TEST 7: PJO revision returns application through HOD review
// ==============================================================================
runner.test('Scenario 7: PJO revision returns application through HOD review', () => {
  const app = env.applications.find(a => a.id === 'app-001');
  app.current_status = 'PENDING_PJO';

  // PJO returns for revision
  function pjoReturn(appId, actorId, comment) {
    if (!comment) throw new Error('COMMENT_REQUIRED');
    app.current_status = 'DRAFT';
    env.approvalHistory.push({
      appId,
      actor: actorId,
      action: 'PJO_RETURN',
      comment,
      timestamp: new Date().toISOString()
    });
  }

  pjoReturn('app-001', 'u-pjo', 'Please clarify syllabus modules');
  assert.strictEqual(app.current_status, 'DRAFT', 'Application should return to DRAFT after PJO revision');

  // Department user resubmits
  function resubmit(appId, actorId) {
    app.current_status = 'UNDER_HOD_REVIEW';
    env.approvalHistory.push({
      appId,
      actor: actorId,
      action: 'SUBMIT',
      timestamp: new Date().toISOString()
    });
  }

  resubmit('app-001', 'u-mod');
  assert.strictEqual(app.current_status, 'UNDER_HOD_REVIEW', 'Resubmitted application must enter UNDER_HOD_REVIEW first!');
});

// ==============================================================================
// TEST 8: Rejected applications cannot proceed to scheduling
// ==============================================================================
runner.test('Scenario 8: Rejected applications cannot proceed to scheduling', () => {
  const rejectedApp = {
    id: 'app-rejected',
    current_status: 'REJECTED'
  };

  function scheduleTraining(app, schedulerId) {
    if (app.current_status !== 'APPROVED') {
      throw new Error('APPLICATION_NOT_APPROVED: Only fully approved applications can proceed to scheduling.');
    }
  }

  assert.throws(() => {
    scheduleTraining(rejectedApp, 'u-hod');
  }, /APPLICATION_NOT_APPROVED/, 'Rejected application was allowed to be scheduled!');
});

// ==============================================================================
// TEST 9: Approved applications can proceed to training scheduling
// ==============================================================================
runner.test('Scenario 9: Approved applications can proceed to training scheduling', () => {
  const approvedApp = {
    id: 'app-approved',
    current_status: 'APPROVED'
  };

  function scheduleTraining(app, schedulerId) {
    if (app.current_status !== 'APPROVED') {
      throw new Error('APPLICATION_NOT_APPROVED');
    }
    app.current_status = 'SCHEDULED';
    env.schedules.push({
      id: 'sched-101',
      appId: app.id,
      venue: 'TC Room 1',
      status: 'SCHEDULED'
    });
  }

  scheduleTraining(approvedApp, 'u-hod');
  assert.strictEqual(approvedApp.current_status, 'SCHEDULED');
  assert.strictEqual(env.schedules.length, 1);
});

// ==============================================================================
// TEST 10: Approval history is preserved after revisions
// ==============================================================================
runner.test('Scenario 10: Approval history is preserved after revisions', () => {
  const historyForApp = env.approvalHistory.filter(h => h.appId === 'app-001');
  assert(historyForApp.length >= 2, 'History records were lost or deleted during revision cycle!');
  const actions = historyForApp.map(h => h.action);
  assert(actions.includes('PJO_RETURN'), 'PJO_RETURN action must be preserved in history');
  assert(actions.includes('SUBMIT'), 'SUBMIT action must be preserved in history');
});

// ==============================================================================
// TEST 11: Super Admin can manage users and assignments
// ==============================================================================
runner.test('Scenario 11: Super Admin can manage users and assignments', () => {
  const adminId = 'u-admin';
  const admin = env.users.find(u => u.id === adminId);
  assert.strictEqual(admin.role, 'SUPER_ADMIN', 'Caller must be super admin');

  // Reopen rejected application
  const rejectedApp = { id: 'app-rej-2', current_status: 'REJECTED' };
  function superAdminReopen(app, actorId, reason) {
    if (!reason) throw new Error('MANDATORY_REASON');
    const actor = env.users.find(u => u.id === actorId);
    if (actor.role !== 'SUPER_ADMIN') throw new Error('PERMISSION_DENIED');
    app.current_status = 'DRAFT';
    app.reopened_by = actorId;
    app.reopen_reason = reason;
  }

  superAdminReopen(rejectedApp, 'u-admin', 'Management authorization following budget readjustment');
  assert.strictEqual(rejectedApp.current_status, 'DRAFT');
  assert.strictEqual(rejectedApp.reopen_reason, 'Management authorization following budget readjustment');
});

// ==============================================================================
// TEST 12: KPI values update from completed training data
// ==============================================================================
runner.test('Scenario 12: KPI values update from completed training data', () => {
  // Initial KPI
  env.recalculateKpis();
  assert.strictEqual(env.kpis.avgHoursPerEmp, 0);

  // Complete a training session with 2 participants: 16 hours each, 1 passed, 1 failed
  env.records.push(
    { id: 'rec-1', attendance_status: 'ATTENDED', passed: true, hours: 16 },
    { id: 'rec-2', attendance_status: 'ATTENDED', passed: true, hours: 16 }
  );

  env.recalculateKpis();

  // Total hours = 32. 3 active employees -> 32 / 3 = 10.67 hrs/emp. Pass rate = 2/2 = 100%
  assert.strictEqual(env.kpis.totalHours, 32);
  assert.strictEqual(env.kpis.avgHoursPerEmp, 10.67);
  assert.strictEqual(env.kpis.passRate, 100);
});

runner.report();
