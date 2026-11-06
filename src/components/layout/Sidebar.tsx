import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  CalendarDays,
  Award,
  BarChart3,
  Users,
  ShieldCheck,
  Building,
  CheckCircle,
  FileCheck,
  History
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { currentUser } = useAuth();
  const role = currentUser.role_code;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'ADMIN_HOD_TC', 'ADMIN_PJO', 'DEPARTMENT_USER'],
    },
    {
      id: 'applications',
      label:
        role === 'DEPARTMENT_USER'
          ? 'Dept Applications'
          : role === 'ADMIN_PJO'
          ? 'Applications (Company)'
          : 'All Applications',
      icon: <FileText className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'ADMIN_HOD_TC', 'ADMIN_PJO', 'DEPARTMENT_USER'],
    },
    {
      id: 'approval_queue',
      label: role === 'ADMIN_PJO' ? 'PJO Final Review Queue' : 'HOD Review Queue',
      icon: <FileCheck className="w-4 h-4" />,
      roles: ['ADMIN_HOD_TC', 'ADMIN_PJO'],
    },
    {
      id: 'schedules',
      label: 'Training Schedules',
      icon: <CalendarDays className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'ADMIN_HOD_TC', 'DEPARTMENT_USER'],
    },
    {
      id: 'certifications',
      label: 'Certifications',
      icon: <Award className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'ADMIN_HOD_TC', 'ADMIN_PJO', 'DEPARTMENT_USER'],
    },
    {
      id: 'kpi',
      label: 'KPI & Performance',
      icon: <BarChart3 className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'ADMIN_HOD_TC', 'ADMIN_PJO'],
    },
    {
      id: 'assignments',
      label: 'Dept Representatives',
      icon: <Building className="w-4 h-4" />,
      roles: ['SUPER_ADMIN'],
    },
    {
      id: 'employees',
      label: role === 'DEPARTMENT_USER' ? 'Dept Employees' : 'All Employees',
      icon: <Users className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'ADMIN_HOD_TC', 'DEPARTMENT_USER'],
    },
    {
      id: 'audit_logs',
      label: 'Security & Audit Logs',
      icon: <ShieldCheck className="w-4 h-4" />,
      roles: ['SUPER_ADMIN'],
    },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-6rem)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Navigation Menu
          </div>
          <nav className="space-y-1">
            {visibleItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 font-bold border border-sky-100 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className={isActive ? 'text-sky-600' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Workflow Quick Status Helper */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-2">
          <div className="font-bold text-slate-800 flex items-center space-x-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-sky-600" />
            <span>Workflow Sequence</span>
          </div>
          <div className="space-y-1 text-[10px] text-slate-500 font-medium">
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              <span>1. Draft & Submit (Dept User)</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span>2. Review Stage 1 (HOD TC)</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>3. Final Auth Stage 2 (PJO)</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>4. Schedule & Execution</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-3">
        PT RAJA Enterprise v1.0 • Supabase PG
      </div>
    </aside>
  );
};
