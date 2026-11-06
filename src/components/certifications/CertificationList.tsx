import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import { Award, ShieldCheck, CheckCircle2, FileText } from 'lucide-react';

export const CertificationList: React.FC = () => {
  const { currentUser } = useAuth();
  const certs = mockStore.certifications;
  const role = currentUser.role_code;
  const deptId = mockStore.getUserActiveDeptId(currentUser.id);

  // RLS Filter: Department User only sees their department's employee certifications
  const visibleCerts = certs.filter((c) => {
    if (role === 'DEPARTMENT_USER') {
      const emp = mockStore.employees.find((e) => e.id === c.employee_id);
      return emp && emp.department_id === deptId;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-slate-900">Competency & Professional Certifications</h3>
          <p className="text-xs text-slate-500">
            {role === 'DEPARTMENT_USER'
              ? `Displaying certifications for ${currentUser.department_name}`
              : 'Enterprise-wide operational and statutory certifications'}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xl font-extrabold text-sky-700">{visibleCerts.length}</span>
          <span className="text-xs text-slate-500 ml-1.5 font-medium">Valid Certificates</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {visibleCerts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No certification records found yet. Complete certified training sessions to issue certificates.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Certificate Details</th>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Issuing Authority</th>
                  <th className="px-6 py-3">Issue Date</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleCerts.map((cert) => {
                  const emp = mockStore.employees.find((e) => e.id === cert.employee_id);
                  const dept = emp ? mockStore.departments.find((d) => d.id === emp.department_id) : null;

                  return (
                    <tr key={cert.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3.5">
                        <div className="font-bold text-slate-900">{cert.certificate_name}</div>
                        <div className="text-[11px] text-sky-700 font-mono font-semibold">
                          {cert.certificate_number}
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="font-semibold text-slate-800">{emp?.full_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {emp?.nik} • {dept?.code}
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-slate-700 font-medium">
                        {cert.issuing_body}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {cert.issue_date}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {cert.status}
                        </span>
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
