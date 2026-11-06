import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import { Users, Search, Building } from 'lucide-react';

export const EmployeeRoster: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // RLS Enforcement: Scoped to department for DEPARTMENT_USER
  const employees = mockStore.getVisibleEmployees(currentUser.id);

  const filtered = employees.filter(
    (e) =>
      e.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.nik.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isDeptUser = currentUser.role_code === 'DEPARTMENT_USER';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Users className="w-4 h-4 text-sky-600" />
            <span>Employee Workforce Roster</span>
          </h3>
          <p className="text-xs text-slate-500">
            {isDeptUser
              ? `Authorized roster restricted strictly to ${currentUser.department_name} personnel (MOD-MED isolation active)`
              : 'Company-wide workforce database across all mining operational departments'}
          </p>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employee by name, NIK, or position..."
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Employee Name & NIK</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Position & Role</th>
                <th className="px-6 py-3">Job Level</th>
                <th className="px-6 py-3">Employment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((emp) => {
                const dept = mockStore.departments.find((d) => d.id === emp.department_id);

                return (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-slate-900">{emp.full_name}</div>
                      <div className="text-[11px] font-mono text-sky-700">{emp.nik}</div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="font-semibold text-slate-700">{dept?.code}</span>
                      <div className="text-[10px] text-slate-400">{dept?.name}</div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-800 font-medium">
                      {emp.position}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {emp.job_level}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {emp.employment_status}
                      </span>
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
