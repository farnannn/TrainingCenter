import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { getRolePermissions } from './lib/types';
import { PublicCompanyLanding } from './components/public/PublicCompanyLanding';
import { RoleSwitcher } from './components/layout/RoleSwitcher';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { SuperAdminDashboard } from './components/dashboard/SuperAdminDashboard';
import { HodDashboard } from './components/dashboard/HodDashboard';
import { PjoDashboard } from './components/dashboard/PjoDashboard';
import { DepartmentUserDashboard } from './components/dashboard/DepartmentUserDashboard';
import { TrainingAchievementView } from './components/achievement/TrainingAchievementView';
import { TechnicalTrainerActivitiesView } from './components/achievement/TechnicalTrainerActivitiesView';
import { ActivityTechnicalTrainingView } from './components/achievement/technical/ActivityTechnicalTrainingSection';
import { SkillAuditRefreshOperatorView } from './components/achievement/technical/SkillAuditRefreshOperatorSection';
import { ApplicationList } from './components/applications/ApplicationList';
import { TrainingCategoryTypeManager } from './components/applications/TrainingCategoryTypeManager';
import { TrainingScheduleManager } from './components/schedules/TrainingScheduleManager';
import { CertificationList } from './components/certifications/CertificationList';
import { DepartmentAssignmentManager } from './components/assignments/DepartmentAssignmentManager';
import { SystemSettingsManager } from './components/settings/SystemSettingsManager';
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

  // After login: Clean enterprise workspace mapped to the 6 Official Roles
  const renderDashboardByRole = () => {
    switch (currentUser.role_code) {
      case 'SUPER_ADMIN':
        return <SuperAdminDashboard onNavigate={setCurrentTab} />;
      case 'MANAGER_TC':
      case 'ADMIN_TC':
        return <HodDashboard onNavigate={setCurrentTab} />;
      case 'PJO':
        return <PjoDashboard onNavigate={setCurrentTab} />;
      case 'ADMIN':
      case 'ADMIN_HRGA':
        return <DepartmentUserDashboard onNavigate={setCurrentTab} />;
      default:
        return <SuperAdminDashboard onNavigate={setCurrentTab} />;
    }
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return renderDashboardByRole();
      case 'achievement':
        return <TrainingAchievementView onNavigate={setCurrentTab} />;
      case 'trainer_activities': {
        const perms = getRolePermissions(currentUser.role_code);
        const canAccessTrainerActivities =
          perms.trainingAchievement === 'EDIT' && perms.canEditData;
        if (!canAccessTrainerActivities) {
          return <TrainingAchievementView onNavigate={setCurrentTab} />;
        }
        return <TechnicalTrainerActivitiesView />;
      }
      case 'activity_technical_training': {
        const perms = getRolePermissions(currentUser.role_code);
        const canAccessTrainerActivities =
          perms.trainingAchievement === 'EDIT' && perms.canEditData;
        if (!canAccessTrainerActivities) {
          return <TrainingAchievementView onNavigate={setCurrentTab} />;
        }
        return <ActivityTechnicalTrainingView />;
      }
      case 'skill_audit_refresh_operator': {
        const perms = getRolePermissions(currentUser.role_code);
        const canAccessTrainerActivities =
          perms.trainingAchievement === 'EDIT' && perms.canEditData;
        if (!canAccessTrainerActivities) {
          return <TrainingAchievementView onNavigate={setCurrentTab} />;
        }
        return <SkillAuditRefreshOperatorView />;
      }
      case 'applications':
        return <ApplicationList />;
      case 'training_master':
        return <TrainingCategoryTypeManager />;
      case 'approval_queue':
        return (
          <ApplicationList
            filterStatus={
              currentUser.role_code === 'PJO'
                ? 'PENDING_PJO'
                : 'UNDER_HOD_REVIEW'
            }
            title={
              currentUser.role_code === 'PJO'
                ? 'Antrean Review PJO (View Only)'
                : 'Antrean Verifikasi Training Center (Stage 1)'
            }
            subtitle={
              currentUser.role_code === 'PJO'
                ? 'Monitoring berkas pengajuan training yang menunggu verifikasi akhir'
                : 'Pengajuan pelatihan departemen yang menunggu verifikasi kurikulum & kelayakan oleh Manager TC / Admin TC'
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
      case 'system_settings':
        return <SystemSettingsManager />;
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
      {/* Top Role Switcher Bar for Quick 6-Role Testing */}
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
