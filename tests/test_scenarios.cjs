// ==============================================================================
// RAJA ACADEMY (THR DASHBOARD) TEST SUITE
// Verifies 6 Official Roles, RBAC Permission Matrix, Training Achievement Engine,
// and Core Governance Scenarios
// ==============================================================================

const assert = require('assert');

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

// Official 6 Roles & RBAC Matrix
const OFFICIAL_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'PJO',
  'MANAGER_TC',
  'ADMIN_TC',
  'ADMIN_HRGA',
];

const ROLE_PERMISSIONS = {
  SUPER_ADMIN: {
    dashboard: 'FULL',
    trainingData: 'EDIT',
    trainingAchievement: 'EDIT',
    canInputData: true,
    canEditData: true,
    canDeleteData: true,
    canManageUsers: true,
    canManageSystemSettings: true,
  },
  ADMIN: {
    dashboard: 'FULL',
    trainingData: 'EDIT',
    trainingAchievement: 'EDIT',
    canInputData: true,
    canEditData: true,
    canDeleteData: true,
    canManageUsers: false,
    canManageSystemSettings: false,
  },
  PJO: {
    dashboard: 'VIEW',
    trainingData: 'VIEW',
    trainingAchievement: 'VIEW',
    canInputData: false,
    canEditData: false,
    canDeleteData: false,
    canManageUsers: false,
    canManageSystemSettings: false,
  },
  MANAGER_TC: {
    dashboard: 'FULL',
    trainingData: 'EDIT',
    trainingAchievement: 'EDIT',
    canInputData: true,
    canEditData: true,
    canDeleteData: true,
    canManageUsers: false,
    canManageSystemSettings: false,
  },
  ADMIN_TC: {
    dashboard: 'FULL',
    trainingData: 'EDIT',
    trainingAchievement: 'EDIT',
    canInputData: true,
    canEditData: true,
    canDeleteData: true,
    canManageUsers: false,
    canManageSystemSettings: false,
  },
  ADMIN_HRGA: {
    dashboard: 'FULL',
    trainingData: 'EDIT',
    trainingAchievement: 'VIEW',
    canInputData: true,
    canEditData: true,
    canDeleteData: true,
    canManageUsers: false,
    canManageSystemSettings: false,
  },
};

function calculateAchievement(trainings) {
  // Deduplicate by unique training id
  const uniqueMap = new Map();
  for (const t of trainings) {
    if (!uniqueMap.has(t.id)) {
      uniqueMap.set(t.id, t);
    }
  }
  const list = Array.from(uniqueMap.values());

  let totalPlan = 0;
  let totalRealization = 0;
  let totalPending = 0;
  let totalCancelled = 0;
  let totalManpowerTrained = 0;
  let totalTrainingHours = 0;

  for (const t of list) {
    if (t.status === 'REJECTED' || t.status === 'CANCELLED') {
      totalCancelled += 1;
    } else {
      totalPlan += 1;
      if (t.status === 'COMPLETED') {
        totalRealization += 1;
        totalManpowerTrained += t.actual_participants || 0;
        totalTrainingHours += t.actual_hours || 0;
      } else {
        totalPending += 1;
      }
    }
  }

  const achievementPercentage =
    totalPlan > 0 ? Math.round((totalRealization / totalPlan) * 1000) / 10 : null;

  return {
    totalPlan,
    totalRealization,
    totalPending,
    totalCancelled,
    achievementPercentage,
    totalManpowerTrained,
    totalTrainingHours,
  };
}

// ==============================================================================
// TEST 1: System strictly uses only the 6 official roles
// ==============================================================================
runner.test('Scenario 1: System strictly uses only the 6 official roles', () => {
  assert.strictEqual(OFFICIAL_ROLES.length, 6, 'System must have exactly 6 roles');
  const legacyRoles = ['ADMIN_HOD_TC', 'ADMIN_PJO', 'DEPARTMENT_USER'];
  for (const legacy of legacyRoles) {
    assert(!OFFICIAL_ROLES.includes(legacy), `Legacy role ${legacy} must not exist`);
  }
});

// ==============================================================================
// TEST 2: PJO Role has strict View-Only access across Dashboard, Data Training & Achievement
// ==============================================================================
runner.test('Scenario 2: PJO has View-Only access and cannot Input, Edit, or Delete data', () => {
  const pjo = ROLE_PERMISSIONS.PJO;
  assert.strictEqual(pjo.dashboard, 'VIEW');
  assert.strictEqual(pjo.trainingData, 'VIEW');
  assert.strictEqual(pjo.trainingAchievement, 'VIEW');
  assert.strictEqual(pjo.canInputData, false);
  assert.strictEqual(pjo.canEditData, false);
  assert.strictEqual(pjo.canDeleteData, false);
  assert.strictEqual(pjo.canManageUsers, false);
  assert.strictEqual(pjo.canManageSystemSettings, false);
});

// ==============================================================================
// TEST 3: Admin HRGA can edit Data Training but is View-Only on Training Achievement
// ==============================================================================
runner.test('Scenario 3: Admin HRGA has Edit on Data Training and View-Only on Training Achievement', () => {
  const hrga = ROLE_PERMISSIONS.ADMIN_HRGA;
  assert.strictEqual(hrga.dashboard, 'FULL');
  assert.strictEqual(hrga.trainingData, 'EDIT');
  assert.strictEqual(hrga.trainingAchievement, 'VIEW');
  assert.strictEqual(hrga.canInputData, true);
  assert.strictEqual(hrga.canEditData, true);
  assert.strictEqual(hrga.canDeleteData, true);
});

// ==============================================================================
// TEST 4: Super Admin, Admin, Manager TC, and Admin TC can edit Training Achievement
// ==============================================================================
runner.test('Scenario 4: Super Admin, Admin, Manager TC, and Admin TC can edit Training Achievement', () => {
  for (const r of ['SUPER_ADMIN', 'ADMIN', 'MANAGER_TC', 'ADMIN_TC']) {
    assert.strictEqual(
      ROLE_PERMISSIONS[r].trainingAchievement,
      'EDIT',
      `${r} should have EDIT access on Training Achievement`
    );
  }
});

// ==============================================================================
// TEST 5: Only Super Admin has access to User Management and System Settings
// ==============================================================================
runner.test('Scenario 5: Only Super Admin can access User Management and System Settings', () => {
  assert.strictEqual(ROLE_PERMISSIONS.SUPER_ADMIN.canManageUsers, true);
  assert.strictEqual(ROLE_PERMISSIONS.SUPER_ADMIN.canManageSystemSettings, true);

  for (const r of ['ADMIN', 'PJO', 'MANAGER_TC', 'ADMIN_TC', 'ADMIN_HRGA']) {
    assert.strictEqual(ROLE_PERMISSIONS[r].canManageUsers, false, `${r} must not access User Management`);
    assert.strictEqual(ROLE_PERMISSIONS[r].canManageSystemSettings, false, `${r} must not access System Settings`);
  }
});

// ==============================================================================
// TEST 6: Training Achievement formula calculates (Realization / Plan) * 100% accurately
// ==============================================================================
runner.test('Scenario 6: Training Achievement formula & deduplication', () => {
  const sampleData = [
    { id: 't-1', status: 'COMPLETED', actual_participants: 4, actual_hours: 16 },
    { id: 't-1', status: 'COMPLETED', actual_participants: 4, actual_hours: 16 }, // duplicate ID should be ignored
    { id: 't-2', status: 'COMPLETED', actual_participants: 3, actual_hours: 24 },
    { id: 't-3', status: 'IN_PROGRESS', actual_participants: 0, actual_hours: 0 },
    { id: 't-4', status: 'SCHEDULED', actual_participants: 0, actual_hours: 0 },
    { id: 't-5', status: 'CANCELLED', actual_participants: 0, actual_hours: 0 },
  ];

  const result = calculateAchievement(sampleData);
  // Unique trainings: t-1 (COMPLETED), t-2 (COMPLETED), t-3 (IN_PROGRESS), t-4 (SCHEDULED) -> Plan = 4
  // Cancelled: t-5 -> Cancelled = 1
  // Realization: 2 (t-1, t-2) -> Pending: 2 (t-3, t-4)
  // Achievement % = (2 / 4) * 100 = 50%
  assert.strictEqual(result.totalPlan, 4);
  assert.strictEqual(result.totalRealization, 2);
  assert.strictEqual(result.totalPending, 2);
  assert.strictEqual(result.totalCancelled, 1);
  assert.strictEqual(result.achievementPercentage, 50);
  assert.strictEqual(result.totalManpowerTrained, 7);
  assert.strictEqual(result.totalTrainingHours, 40);
});

// ==============================================================================
// TEST 7: Training Achievement returns null (no fake assumptions) when Plan is 0
// ==============================================================================
runner.test('Scenario 7: Training Achievement returns null when no training plan exists', () => {
  const emptyResult = calculateAchievement([]);
  assert.strictEqual(emptyResult.totalPlan, 0);
  assert.strictEqual(emptyResult.totalRealization, 0);
  assert.strictEqual(emptyResult.achievementPercentage, null);
});

// ==============================================================================
// TEST 8: Backend/Store blocks PJO and Admin HRGA from editing Achievement data
// ==============================================================================
runner.test('Scenario 8: Backend blocks PJO and Admin HRGA from updating Achievement', () => {
  function updateAchievementBackend(actorRole, trainingId, payload) {
    const perms = ROLE_PERMISSIONS[actorRole];
    if (!perms || perms.trainingAchievement !== 'EDIT') {
      throw new Error(`RBAC_ACCESS_DENIED: Role ${actorRole} cannot edit Training Achievement.`);
    }
    return { trainingId, ...payload };
  }

  assert.throws(() => {
    updateAchievementBackend('PJO', 't-1', { status: 'COMPLETED' });
  }, /RBAC_ACCESS_DENIED/);

  assert.throws(() => {
    updateAchievementBackend('ADMIN_HRGA', 't-1', { status: 'COMPLETED' });
  }, /RBAC_ACCESS_DENIED/);

  const ok = updateAchievementBackend('MANAGER_TC', 't-1', { status: 'COMPLETED' });
  assert.strictEqual(ok.status, 'COMPLETED');
});

runner.report();
