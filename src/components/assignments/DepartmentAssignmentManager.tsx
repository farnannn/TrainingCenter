import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import { Building, ShieldCheck, UserCheck, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export const DepartmentAssignmentManager: React.FC = () => {
  const { currentUser, refreshState } = useAuth();
  const [selectedDept, setSelectedDept] = useState(mockStore.departments[0]?.id || '');
  const [selectedUser, setSelectedUser] = useState('');
  const [reason, setReason] = useState('Official annual representative appointment');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const departments = mockStore.departments;
  const assignments = mockStore.departmentAssignments;
  const deptUsers = mockStore.users.filter((u) => u.role_code === 'DEPARTMENT_USER' && u.is_active);
  const activePjo = mockStore.users.find((u) => u.role_code === 'ADMIN_PJO' && u.is_active);
  const hodUser = mockStore.users.find((u) => u.role_code === 'ADMIN_HOD_TC' && u.is_active);

  const handleAssignDeptUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (!selectedDept || !selectedUser) {
        throw new Error('Please select both a department and a department user.');
      }

      mockStore.assignDepartmentUser(selectedDept, selectedUser, currentUser.id, reason);
      refreshState();
      setSuccess('Department user assignment updated successfully. Prior active assignment deactivated.');
    } catch (err: any) {
      setError(err.message || 'Assignment failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Centralized PJO Account Information */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 text-amber-700 font-bold text-sm mb-2">
            <UserCheck className="w-4 h-4" />
            <span>Centralized PJO Final Authority (Company-Wide)</span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Confirmed Rule: There must be exactly one active centralized PJO account distinct from HOD TC across all departments.
          </p>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-800">{activePjo?.full_name}</div>
              <div className="text-[11px] text-slate-500 font-mono">{activePjo?.email} • {activePjo?.nik}</div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
              ACTIVE PJO
            </span>
          </div>

          <div className="mt-3 text-[11px] text-slate-400">
            HOD TC Account:{' '}
            <span className="font-semibold text-slate-700">{hodUser?.full_name}</span> (Distinct Role)
          </div>
        </div>

        {/* Assignment Rules Summary */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 text-sky-700 font-bold text-sm mb-2">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>Enforced Database Constraints</span>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
            <li>
              <span className="font-semibold text-slate-800">Exactly one active</span> department user per department.
            </li>
            <li>
              One department user can only represent <span className="font-semibold text-slate-800">one department</span> at a time.
            </li>
            <li>
              <span className="font-semibold text-slate-800">Super Admin exclusive</span>: Only Super Admin can appoint or transition assignments.
            </li>
            <li>
              Previous active appointments are <span className="font-semibold text-slate-800">deactivated automatically</span> with audit logs.
            </li>
          </ul>
        </div>
      </div>

      {/* Appointment Form (Super Admin Only) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center space-x-2">
          <RefreshCw className="w-4 h-4 text-sky-600" />
          <span>Appoint or Replace Department Representative</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Appointing a new representative deactivates the existing active assignment and transfers submission authorization.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleAssignDeptUser} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Department *
              </label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Designated Representative User *
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="">-- Choose Department User --</option>
                {deptUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Transition Reason / Appointment Mandate
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Official appointment Q4 2026"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              Confirm Appointment
            </button>
          </div>
        </form>
      </div>

      {/* Active & Historical Assignments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Current Department Active Assignments
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Active Representative</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Assigned At</th>
                <th className="px-6 py-3">Assigned By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departments.map((dept) => {
                const active = assignments.find((a) => a.department_id === dept.id && a.is_active);
                const user = active ? mockStore.users.find((u) => u.id === active.user_id) : null;
                const assigner = active ? mockStore.users.find((u) => u.id === active.assigned_by) : null;

                return (
                  <tr key={dept.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-semibold text-slate-800">
                      {dept.code} - {dept.name}
                    </td>
                    <td className="px-6 py-3">
                      {user ? (
                        <div>
                          <div className="font-semibold text-slate-800">{user.full_name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No active representative</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {active ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Active (1/1)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Vacant
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-slate-500">
                      {active ? new Date(active.assigned_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-3 text-slate-500">
                      {assigner ? assigner.full_name : 'System Initial'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

