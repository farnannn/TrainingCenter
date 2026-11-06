import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import { TrainingApplication } from '../../lib/types';
import { HodPjoActionModal } from '../applications/HodPjoActionModal';
import { ApplicationDetailModal } from '../applications/ApplicationDetailModal';
import {
  UserCheck,
  FileCheck,
  ShieldCheck,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface PjoDashboardProps {
  onNavigate: (tab: string) => void;
}

export const PjoDashboard: React.FC<PjoDashboardProps> = ({ onNavigate }) => {
  const { currentUser, refreshState } = useAuth();
  const [selectedReviewApp, setSelectedReviewApp] = useState<TrainingApplication | null>(null);
  const [selectedDetailApp, setSelectedDetailApp] = useState<TrainingApplication | null>(null);

  const applications = mockStore.getVisibleApplications(currentUser.id);
  // Strict rule: PJO only processes applications that have passed HOD review!
  const pjoQueue = applications.filter((a) => a.current_status === 'PENDING_PJO');
  const fullyAuthorized = applications.filter((a) => a.current_status === 'APPROVED' || a.current_status === 'SCHEDULED' || a.current_status === 'COMPLETED');
  const totalBudgetAuthorized = fullyAuthorized.reduce((sum, a) => sum + Number(a.estimated_budget), 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 text-white p-6 rounded-2xl shadow-sm border border-amber-900/50">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <UserCheck className="w-4 h-4" />
              <span>Penanggung Jawab Operasional (PJO) • Final Authorization Authority</span>
            </div>
            <h2 className="text-xl font-extrabold mt-1">Operational Governance & Executive Approval</h2>
            <p className="text-xs text-amber-200 mt-1 max-w-2xl">
              Confirmed Rule: One centralized PJO account serves as the supreme operational authorization authority across all departments. PJO review unlocks training execution.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onNavigate('kpi')}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Company KPI Report</span>
            </button>
            <button
              onClick={() => onNavigate('applications')}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold backdrop-blur-xs transition-all"
            >
              All Applications
            </button>
          </div>
        </div>
      </div>

      {/* Business Rule Admonition */}
      <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start space-x-3 text-xs text-amber-900">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Strict Sequential Approval Policy Active:</span> PJO review is the final authorization step. Applications in DRAFT or UNDER_HOD_REVIEW cannot be acted upon by PJO until HOD Training Center completes Stage 1 verification. Revisions returned by PJO cycle back through HOD review.
        </div>
      </div>

      {/* Queue Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>PJO Final Queue</span>
          </span>
          <div className="text-2xl font-extrabold text-amber-800 mt-1">{pjoQueue.length}</div>
          <span className="text-[10px] text-slate-500">Passed HOD review • Awaiting your signature</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Authorized by PJO</span>
          </span>
          <div className="text-2xl font-extrabold text-emerald-800 mt-1">{fullyAuthorized.length}</div>
          <span className="text-[10px] text-slate-500">Approved for site delivery</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-600 uppercase">
            Authorized Investment
          </span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
            IDR {(totalBudgetAuthorized / 1000000).toFixed(1)}M
          </div>
          <span className="text-[10px] text-slate-500">Total authorized budget</span>
        </div>
      </div>

      {/* Main PJO Final Review Queue */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-amber-600" />
              <span>Incoming Applications Awaiting Final PJO Authorization ({pjoQueue.length})</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              These applications have verified curriculum and HOD TC endorsement.
            </p>
          </div>
          <button
            onClick={() => onNavigate('applications')}
            className="text-xs text-amber-700 hover:text-amber-900 font-semibold flex items-center space-x-1"
          >
            <span>View All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pjoQueue.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No applications currently in PENDING_PJO state. All applications have been reviewed or are in prior stages.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Application Number & Title</th>
                  <th className="px-6 py-3">Originating Department</th>
                  <th className="px-6 py-3">HOD Review Details</th>
                  <th className="px-6 py-3">Estimated Budget</th>
                  <th className="px-6 py-3 text-right">PJO Authorization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pjoQueue.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5">
                      <div className="font-mono text-[11px] font-bold text-amber-700">
                        {app.application_number}
                      </div>
                      <div className="text-slate-900 font-bold text-xs">{app.training_title}</div>
                      <div className="text-[11px] text-slate-400">
                        {app.participants?.length || 0} participants • {app.training_type}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-slate-800">{app.department_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">By: {app.submitter_name}</div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        HOD Approved
                      </span>
                      {app.hod_comments && (
                        <div className="text-[11px] text-slate-600 italic mt-1 line-clamp-1">
                          "{app.hod_comments}"
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-900 font-bold">
                      IDR {Number(app.estimated_budget).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedDetailApp(app)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => setSelectedReviewApp(app)}
                        className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold shadow-xs"
                      >
                        Final Authorize
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modal */}
      <HodPjoActionModal
        isOpen={Boolean(selectedReviewApp)}
        application={selectedReviewApp}
        mode="PJO"
        onClose={() => setSelectedReviewApp(null)}
        onSuccess={() => {
          refreshState();
          setSelectedReviewApp(null);
        }}
      />

      {/* Inspect Detail Modal */}
      <ApplicationDetailModal
        isOpen={Boolean(selectedDetailApp)}
        application={selectedDetailApp}
        onClose={() => setSelectedDetailApp(null)}
        onRefresh={() => {
          refreshState();
          setSelectedDetailApp(null);
        }}
      />
    </div>
  );
};
