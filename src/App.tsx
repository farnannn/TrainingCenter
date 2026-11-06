import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { PublicCompanyLanding } from './components/public/PublicCompanyLanding';
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
  const { isAuthenticated, currentUser } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Before login: Visitors see the public Company Profile & KPI landing page (with Visi & Misi)
  if (!isAuthenticated || !currentUser) {
    return <PublicCompanyLanding />;
  }

  // After login: Clean enterprise workspace without Visi & Misi
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
    <div className="min-h-screen flex flex-col bg-[#F4F6F5] text-[#18232B] font-sans">
      {/* Top Role Switcher Bar for Quick Multi-Role Testing */}
      <RoleSwitcher />

      {/* Main Enterprise Shell: Collapsible Sidebar + Off-White Content Area */}
      <div className="flex flex-1 min-h-0">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <Navbar
            currentTab={currentTab}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};
