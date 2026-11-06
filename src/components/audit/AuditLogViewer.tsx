import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import { ShieldCheck, History, ArrowRight } from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const { currentUser } = useAuth();
  const logs = mockStore.auditLogs;

  if (currentUser.role_code !== 'SUPER_ADMIN') {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-red-200 text-xs text-red-600">
        Access Denied: Only Super Admin is authorized to view security & compliance audit logs.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-sky-600" />
            <span>Security & Compliance Audit Trail</span>
          </h3>
          <p className="text-xs text-slate-500">
            Immutable system logs capturing administrative corrections, reopen operations, and role appointments.
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Total Logs: {logs.length}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No audit records created yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Target Table</th>
                  <th className="px-6 py-3">Actor</th>
                  <th className="px-6 py-3">State Transition (Old → New)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const actor = mockStore.users.find((u) => u.id === log.actor_id);

                  return (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3.5 whitespace-nowrap text-slate-500 font-mono">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-mono text-slate-700">
                        {log.table_name}
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-slate-800">
                        {actor ? actor.full_name : log.actor_id || 'System'}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="text-[11px] font-mono bg-slate-50 p-2 rounded border border-slate-200 max-w-md overflow-x-auto">
                          {log.old_values && (
                            <span className="text-red-700">
                              OLD: {JSON.stringify(log.old_values)}
                            </span>
                          )}
                          {log.old_values && log.new_values && <br />}
                          {log.new_values && (
                            <span className="text-emerald-700">
                              NEW: {JSON.stringify(log.new_values)}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
