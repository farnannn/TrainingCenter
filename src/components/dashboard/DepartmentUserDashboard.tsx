import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import { TrainingApplication } from '../../lib/types';
import { CreateApplicationModal } from '../applications/CreateApplicationModal';
import { ApplicationDetailModal } from '../applications/ApplicationDetailModal';
import { KpiAnalyticsCharts } from '../charts/KpiAnalyticsCharts';
import {
  Building2,
  PlusCircle,
  Users,
  Award,
  Clock,
  RotateCcw,
  CheckCircle2,
  Eye,
  AlertCircle
} from 'lucide-react';

interface DepartmentUserDashboardProps {
  onNavigate: (tab: string) => void;
}

export const DepartmentUserDashboard: React.FC<DepartmentUserDashboardProps> = ({ onNavigate }) => {
  const { currentUser, refreshState } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<TrainingApplication | null>(null);

  // Department-scoped applications
  const deptApps = mockStore.getVisibleApplications(currentUser.id);
  // Department-scoped employees
  const deptEmployees = mockStore.getVisibleEmployees(currentUser.id);

  // Revision alert: Applications in DRAFT that have approval history indicating return by HOD or PJO
  const returnedForRevisionApps = deptApps.filter((a) => {
    if (a.current_status !== 'DRAFT') return false;
    const history = mockStore.approvalHistory.filter((h) => h.application_id === a.id);
    return history.some((h) => h.action === 'HOD_RETURN' || h.action === 'PJO_RETURN');
  });

  const underReviewCount = deptApps.filter(
    (a) => a.current_status === 'UNDER_HOD_REVIEW' || a.current_status === 'PENDING_PJO'
  ).length;

  const approvedCount = deptApps.filter(
    (a) => a.current_status === 'APPROVED' || a.current_status === 'SCHEDULED' || a.current_status === 'COMPLETED'
  ).length;

  const deptCertsCount = mockStore.certifications.filter((c) => {
    const emp = mockStore.employees.find((e) => e.id === c.employee_id);
    return emp && emp.department_id === mockStore.getUserActiveDeptId(currentUser.id);
  }).length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>Department Representative • {currentUser.department_name}</span>
            </div>
            <h2 className="text-xl font-extrabold mt-1">Department Training Portal</h2>
            <p className="text-xs text-emerald-100 mt-1 max-w-2xl">
              Designated single active training representative for {currentUser.department_name}. Submit and manage training applications for departmental staff.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Training Application</span>
          </button>
        </div>
      </div>

      {/* Revision Alerts Banner (if any application returned) */}
      {returnedForRevisionApps.length > 0 && (
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-300 text-amber-900 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 font-bold text-xs">
            <RotateCcw className="w-4 h-4 text-amber-600 animate-spin-reverse" />
            <span>Action Required: {returnedForRevisionApps.length} Application(s) Returned for Revision</span>
          </div>
          <p className="text-xs text-amber-800">
            HOD Training Center or PJO has returned the following applications with feedback. Please inspect comments, make requested adjustments, and resubmit.
          </p>

          <div className="divide-y divide-amber-200/60 mt-2">
            {returnedForRevisionApps.map((app) => (
              <div key={app.id} className="py-2 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-900">{app.application_number}</span> - {app.training_title}
                  {app.hod_comments && (
                    <div className="text-[11px] text-amber-900 italic">"HOD: {app.hod_comments}"</div>
                  )}
                  {app.pjo_comments && (
                    <div className="text-[11px] text-amber-900 italic">"PJO: {app.pjo_comments}"</div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedApp(app)}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold shadow-2xs"
                >
                  Edit & Resubmit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center space-x-1">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>Department Personnel</span>
          </span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{deptEmployees.length}</div>
          <span className="text-[10px] text-slate-500">Active roster members</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-blue-600 uppercase flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Under Review</span>
          </span>
          <div className="text-2xl font-extrabold text-blue-800 mt-1">{underReviewCount}</div>
          <span className="text-[10px] text-slate-500">In HOD or PJO review</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved / Completed</span>
          </span>
          <div className="text-2xl font-extrabold text-emerald-800 mt-1">{approvedCount}</div>
          <span className="text-[10px] text-slate-500">Authorized programs</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase flex items-center space-x-1">
            <Award className="w-3.5 h-3.5" />
            <span>Dept Certifications</span>
          </span>
          <div className="text-2xl font-extrabold text-amber-800 mt-1">{deptCertsCount}</div>
          <span className="text-[10px] text-slate-500">Issued to team members</span>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {currentUser.department_name} Training Applications ({deptApps.length})
          </h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center space-x-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Submission</span>
          </button>
        </div>

        {deptApps.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No training applications submitted yet for your department. Click "Create Training Application" to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Application Number & Title</th>
                  <th className="px-6 py-3">Participants</th>
                  <th className="px-6 py-3">Schedule Window</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deptApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5">
                      <div className="font-mono text-[11px] font-bold text-emerald-800">
                        {app.application_number}
                      </div>
                      <div className="text-slate-900 font-bold text-xs">{app.training_title}</div>
                      <div className="text-[11px] text-slate-400">
                        {app.training_category} • {app.training_type}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-700">
                      {app.participants?.length || 0} Team Members
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {app.proposed_start_date} to {app.proposed_end_date}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-slate-100 text-slate-800">
                        {app.current_status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Progress</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* KPI Performance Insights */}
      <div className="pt-2">
        <KpiAnalyticsCharts />
      </div>

      {/* Modals */}
      <CreateApplicationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => {
          refreshState();
          setShowCreateModal(false);
        }}
      />

      <ApplicationDetailModal
        isOpen={Boolean(selectedApp)}
        application={selectedApp}
        onClose={() => setSelectedApp(null)}
        onRefresh={() => {
          refreshState();
          setSelectedApp(null);
        }}
      />
    </div>
  );
};

