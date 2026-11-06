import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { RoleSwitcher } from './components/layout/RoleSwitcher';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { SuperAdminDashboard } from './components/dashboard/SuperAdminDashboard';
import { HodDashboard } from './components/dashboard/HodDashboard';
import { PjoDashboard } from './components/dashboard/PjoDashboard';
import { DepartmentUserDashboard } from './components/dashboard/DepartmentUserDashboard';
import { ApplicationList } from './components/applications/ApplicationList';
import { TrainingScheduleManager } from './components/schedules/TrainingScheduleManager';
import { CertificationList } from './components/certifications/CertificationList';
import { DepartmentAssignmentManager } from './components/assignments/DepartmentAssignmentManager';
import { EmployeeRoster } from './components/employees/EmployeeRoster';
import { KpiOverview } from './components/kpi/KpiOverview';
import { AuditLogViewer } from './components/audit/AuditLogViewer';

export const App: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  const renderDashboardByRole = () => {
    switch (currentUser.role_code) {
      case 'SUPER_ADMIN':
        return <SuperAdminDashboard onNavigate={setCurrentTab} />;
      case 'ADMIN_HOD_TC':
        return <HodDashboard onNavigate={setCurrentTab} />;
      case 'ADMIN_PJO':
        return <PjoDashboard onNavigate={setCurrentTab} />;
      case 'DEPARTMENT_USER':
        return <DepartmentUserDashboard onNavigate={setCurrentTab} />;
      default:
        return <div>Unknown Role</div>;
    }
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return renderDashboardByRole();
      case 'applications':
        return <ApplicationList />;
      case 'approval_queue':
        return (
          <ApplicationList
            filterStatus={
              currentUser.role_code === 'ADMIN_PJO'
                ? 'PENDING_PJO'
                : 'UNDER_HOD_REVIEW'
            }
            title={
              currentUser.role_code === 'ADMIN_PJO'
                ? 'PJO Final Review Queue (Stage 2)'
                : 'Incoming HOD Review Queue (Stage 1)'
            }
            subtitle={
              currentUser.role_code === 'ADMIN_PJO'
                ? 'Applications verified by HOD TC awaiting final executive authorization'
                : 'Applications submitted by Department Users awaiting curriculum & feasibility approval'
            }
          />
        );
      case 'schedules':
        return <TrainingScheduleManager />;
      case 'certifications':
        return <CertificationList />;
      case 'kpi':
        return <KpiOverview />;
      case 'assignments':
        return <DepartmentAssignmentManager />;
      case 'employees':
        return <EmployeeRoster />;
      case 'audit_logs':
        return <AuditLogViewer />;
      default:
        return renderDashboardByRole();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Banner Role Switcher for seamless test demo switching */}
      <RoleSwitcher />

      {/* Main App Navbar */}
      <Navbar />

      {/* Main Body with Sidebar & Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};
