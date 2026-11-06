import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import { TrainingApplication } from '../../lib/types';
import { HodPjoActionModal } from '../applications/HodPjoActionModal';
import { ApplicationDetailModal } from '../applications/ApplicationDetailModal';
import { KpiAnalyticsCharts } from '../charts/KpiAnalyticsCharts';
import {
  Layers,
  FileCheck,
  CalendarDays,
  Award,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface HodDashboardProps {
  onNavigate: (tab: string) => void;
}

export const HodDashboard: React.FC<HodDashboardProps> = ({ onNavigate }) => {
  const { currentUser, refreshState } = useAuth();
  const [selectedReviewApp, setSelectedReviewApp] = useState<TrainingApplication | null>(null);
  const [selectedDetailApp, setSelectedDetailApp] = useState<TrainingApplication | null>(null);

  const applications = mockStore.getVisibleApplications(currentUser.id);
  const incomingQueue = applications.filter((a) => a.current_status === 'UNDER_HOD_REVIEW');
  const readyToSchedule = applications.filter((a) => a.current_status === 'APPROVED');
  const activeSchedules = mockStore.schedules.filter((s) => s.status !== 'COMPLETED');
  const totalCerts = mockStore.certifications.length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-sky-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-sky-300 text-xs font-bold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Training Center Department Head • Stage 1 Reviewer</span>
            </div>
            <h2 className="text-xl font-extrabold mt-1">Training Center Operations & Review Queue</h2>
            <p className="text-xs text-sky-100 mt-1 max-w-2xl">
              Responsible for reviewing incoming training applications from all departments, curriculum alignment, scheduling approved training, and issuing certifications.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onNavigate('schedules')}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Schedules & Batches</span>
            </button>
            <button
              onClick={() => onNavigate('certifications')}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold backdrop-blur-xs transition-all flex items-center space-x-1.5"
            >
              <Award className="w-4 h-4" />
              <span>Certificates ({totalCerts})</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Visual Analytics */}
      <KpiAnalyticsCharts />

      {/* Highlights / Queue Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs">
          <span className="text-[10px] font-bold text-blue-600 uppercase flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>HOD Review Queue</span>
          </span>
          <div className="text-2xl font-extrabold text-blue-800 mt-1">{incomingQueue.length}</div>
          <span className="text-[10px] text-slate-500">Awaiting your approval</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Authorized by PJO</span>
          </span>
          <div className="text-2xl font-extrabold text-emerald-800 mt-1">{readyToSchedule.length}</div>
          <span className="text-[10px] text-slate-500">Ready for scheduling</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-teal-600 uppercase flex items-center space-x-1">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Active Schedules</span>
          </span>
          <div className="text-2xl font-extrabold text-teal-800 mt-1">{activeSchedules.length}</div>
          <span className="text-[10px] text-slate-500">Ongoing batch delivery</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase flex items-center space-x-1">
            <Award className="w-3.5 h-3.5" />
            <span>Issued Certifications</span>
          </span>
          <div className="text-2xl font-extrabold text-amber-800 mt-1">{totalCerts}</div>
          <span className="text-[10px] text-slate-500">Certified personnel</span>
        </div>
      </div>

      {/* Main Section: Incoming Approval Queue */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <span>Incoming Applications Awaiting Stage 1 HOD Review ({incomingQueue.length})</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Applications submitted by Department Users. HOD approval forwards to PJO for final authorization.
            </p>
          </div>
          <button
            onClick={() => onNavigate('applications')}
            className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center space-x-1"
          >
            <span>View All Applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {incomingQueue.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No incoming applications awaiting HOD review. All current requests have been processed.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Application Number & Title</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Participants</th>
                  <th className="px-6 py-3">Budget (IDR)</th>
                  <th className="px-6 py-3 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incomingQueue.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5">
                      <div className="font-mono text-[11px] font-bold text-sky-700">
                        {app.application_number}
                      </div>
                      <div className="text-slate-900 font-bold text-xs">{app.training_title}</div>
                      <div className="text-[11px] text-slate-400">
                        {app.training_category} • {app.training_type}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-slate-800">{app.department_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">By: {app.submitter_name}</div>
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-700">
                      {app.participants?.length || 0} Employees
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-800 font-semibold">
                      IDR {Number(app.estimated_budget).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedDetailApp(app)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => setSelectedReviewApp(app)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-xs transition-colors"
                      >
                        Review Stage 1
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <HodPjoActionModal
        isOpen={Boolean(selectedReviewApp)}
        application={selectedReviewApp}
        mode="HOD"
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

