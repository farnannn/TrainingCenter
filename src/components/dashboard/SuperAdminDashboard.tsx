import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import { CompanyProfileHero } from '../company/CompanyProfileHero';
import { KpiAnalyticsCharts } from '../charts/KpiAnalyticsCharts';
import {
  ShieldCheck,
  Building,
  Users,
  FileCheck,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface SuperAdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const apps = mockStore.applications;
  const depts = mockStore.departments;
  const users = mockStore.users;
  const employees = mockStore.employees;
  const assignments = mockStore.departmentAssignments;

  const totalApps = apps.length;
  const underHod = apps.filter((a) => a.current_status === 'UNDER_HOD_REVIEW').length;
  const pendingPjo = apps.filter((a) => a.current_status === 'PENDING_PJO').length;
  const approved = apps.filter((a) => a.current_status === 'APPROVED').length;
  const scheduled = apps.filter((a) => a.current_status === 'SCHEDULED' || a.current_status === 'IN_PROGRESS').length;
  const completed = apps.filter((a) => a.current_status === 'COMPLETED').length;
  const rejected = apps.filter((a) => a.current_status === 'REJECTED').length;

  return (
    <div className="space-y-8">
      {/* 1. Corporate Profile Hero Banner (Visi, Misi, Tata Nilai RAJA) */}
      <CompanyProfileHero />

      {/* 2. Interactive KPI Charts & Analytics Visuals */}
      <KpiAnalyticsCharts />

      {/* 3. Executive Control Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Super Administrator Console • Access Level 1</span>
            </div>
            <h2 className="text-xl font-extrabold mt-1">Enterprise Executive Dashboard</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Complete administrative authority over user roles, single-active department assignments, centralized PJO governance, KPI targets, and terminal rejection reopening.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onNavigate('assignments')}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Building className="w-4 h-4" />
              <span>Manage Dept Users</span>
            </button>
            <button
              onClick={() => onNavigate('audit_logs')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              Audit Trail
            </button>
          </div>
        </div>
      </div>

      {/* 4. KPI Status Counter Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Apps</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalApps}</div>
          <span className="text-[10px] text-slate-500">All Departments</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-blue-600 uppercase">HOD Queue</span>
          <div className="text-2xl font-extrabold text-blue-700 mt-1">{underHod}</div>
          <span className="text-[10px] text-slate-500">Stage 1 Review</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase">PJO Queue</span>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{pendingPjo}</div>
          <span className="text-[10px] text-slate-500">Stage 2 Final Auth</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase">Approved</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{approved}</div>
          <span className="text-[10px] text-slate-500">Ready to Schedule</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-teal-600 uppercase">Scheduled</span>
          <div className="text-2xl font-extrabold text-teal-700 mt-1">{scheduled + completed}</div>
          <span className="text-[10px] text-slate-500">{completed} Completed</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-red-600 uppercase">Rejected</span>
          <div className="text-2xl font-extrabold text-red-700 mt-1">{rejected}</div>
          <span className="text-[10px] text-slate-500">Terminal State</span>
        </div>
      </div>

      {/* 5. Department Assignments & Administrative Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Building className="w-4 h-4 text-sky-600" />
                <span>Department Representative Assignments</span>
              </h3>
              <p className="text-xs text-slate-500">
                Enforcing exactly one active representative per department.
              </p>
            </div>
            <button
              onClick={() => onNavigate('assignments')}
              className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {depts.map((d) => {
              const active = assignments.find((a) => a.department_id === d.id && a.is_active);
              const user = active ? users.find((u) => u.id === active.user_id) : null;

              return (
                <div key={d.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-800">{d.code}</span>
                    <span className="text-slate-500 text-[11px] ml-2">{d.name}</span>
                  </div>
                  <div>
                    {user ? (
                      <span className="font-semibold text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                        {user.full_name}
                      </span>
                    ) : (
                      <span className="text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px]">
                        Vacant
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Administrative Override & Governance</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Authorized actions reserved strictly for the Super Admin level.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 flex justify-between items-center">
                <div>
                  <div className="font-bold text-purple-900">Reopen Rejected Applications</div>
                  <div className="text-[11px] text-purple-700">
                    Rule: Rejection is terminal unless Super Admin overrides with documented justification.
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('applications')}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold shadow-xs cursor-pointer"
                >
                  View Apps
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800">Master KPI Configurations</div>
                  <div className="text-[11px] text-slate-500">
                    Set company-wide targets and scoring weights for 2026.
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('kpi')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Configure
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Master Headcount</span>
              <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                {employees.filter((e) => e.is_active).length} Active Personnel
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Across Mining Operations (MOD), Engineering (MED), and HRGA
              </p>
            </div>
            <button
              onClick={() => onNavigate('employees')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-800 cursor-pointer"
            >
              View Roster →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
