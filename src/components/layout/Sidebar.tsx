import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getRolePermissions, RoleCode } from '../../lib/types';
import { mockStore } from '../../lib/mockStore';
import { RajaLogo } from '../ui/RajaLogo';
import {
  LayoutDashboard,
  Target,
  FileText,
  FileCheck,
  CalendarDays,
  Award,
  BarChart3,
  Users,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Tags,
  ClipboardList,
  Truck,
  Compass,
  MapPin,
  LogOut,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { currentUser, logout } = useAuth();
  const role: RoleCode = currentUser.role_code;
  const perms = getRolePermissions(role);
  const canManageTrainingMaster =
    role === 'SUPER_ADMIN' ||
    role === 'ADMIN' ||
    (perms.trainingData === 'EDIT' && perms.canEditData);
  const canApproveTraining = perms.canApproveStage1 || perms.canApproveFinalPjo;
  const hasTrainingSubMenu = canManageTrainingMaster || canApproveTraining;
  const canEditTrainerActivities =
    perms.trainingAchievement === 'EDIT' && perms.canEditData;
  const [achievementSubOpen, setAchievementSubOpen] = useState(true);
  const [trainingSubOpen, setTrainingSubOpen] = useState(true);

  const pendingApprovalCount = mockStore.applications.filter((app) => {
    if (perms.canApproveFinalPjo && app.current_status === 'PENDING_PJO') return true;
    if (perms.canApproveStage1 && app.current_status === 'UNDER_HOD_REVIEW') return true;
    return false;
  }).length;

  const allSixRoles: RoleCode[] = [
    'SUPER_ADMIN',
    'ADMIN',
    'PJO',
    'MANAGER_TC',
    'ADMIN_TC',
    'ADMIN_HRGA',
  ];

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      visible: true,
      roles: allSixRoles,
    },
    {
      id: 'achievement',
      label: 'Training Achievement',
      icon: <Target className="w-4 h-4 shrink-0" />,
      visible: true,
      roles: allSixRoles,
    },
    {
      id: 'applications',
      label: 'Data Training',
      icon: <FileText className="w-4 h-4 shrink-0" />,
      visible: true,
      roles: allSixRoles,
    },
    {
      id: 'schedules',
      label: 'Historical & Jadwal',
      icon: <CalendarDays className="w-4 h-4 shrink-0" />,
      visible: true,
      roles: allSixRoles,
    },
    {
      id: 'certifications',
      label: 'Data Sertifikasi',
      icon: <Award className="w-4 h-4 shrink-0" />,
      visible: true,
      roles: allSixRoles,
    },
    {
      id: 'kpi',
      label: 'KPI Training Center',
      icon: <BarChart3 className="w-4 h-4 shrink-0" />,
      visible: true,
      roles: allSixRoles,
    },
    {
      id: 'employees',
      label: 'Data Karyawan',
      icon: <Users className="w-4 h-4 shrink-0" />,
      visible: true,
      roles: allSixRoles,
    },
    {
      id: 'assignments',
      label: 'User Management',
      icon: <ShieldCheck className="w-4 h-4 shrink-0" />,
      visible: perms.canManageUsers,
      roles: allSixRoles,
    },
    {
      id: 'system_settings',
      label: 'System Settings',
      icon: <Settings className="w-4 h-4 shrink-0" />,
      visible: perms.canManageSystemSettings,
      roles: allSixRoles,
    },
  ];

  const visibleItems = navItems.filter(
    (item) => item.visible && item.roles.includes(role)
  );

  const initials = currentUser.full_name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  const renderSidebarContent = (isMobile = false) => {
    const isCollapsed = !isMobile && collapsed;

    return (
      <div className="flex flex-col h-full bg-[#18232B] text-white select-none">
        {/* Top Brand Section */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#263640] shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {isCollapsed ? (
              <RajaLogo variant="compact" />
            ) : (
              <div className="flex items-center gap-2.5 min-w-0">
                <RajaLogo variant="on-dark" heightClass="h-8" />
                <div className="min-w-0 leading-tight">
                  <div className="text-xs font-heading font-bold text-white tracking-tight truncate">
                    RAJA ACADEMY
                  </div>
                  <div className="text-[9px] font-mono text-[#E88932] truncate">
                    TRAINING CENTER
                  </div>
                </div>
              </div>
            )}
          </div>

          {isMobile && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-[8px] text-slate-400 hover:text-white hover:bg-[#263640] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {!isMobile && onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Perluas Sidebar' : 'Kecilkan Sidebar'}
              className="p-1.5 rounded-[8px] text-slate-400 hover:text-white hover:bg-[#263640] transition-colors cursor-pointer"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
              Menu Utama ({currentUser.role_name})
            </div>
          )}

          {visibleItems.map((item) => {
            const isAchievementGroup = item.id === 'achievement';
            const isTrainingGroup = item.id === 'applications';
            const isActive =
              currentTab === item.id ||
              (isAchievementGroup &&
                (currentTab === 'trainer_activities' ||
                  currentTab === 'activity_technical_training' ||
                  currentTab === 'skill_audit_refresh_operator' ||
                  currentTab === 'assessment_cross_skillup' ||
                  currentTab === 'orientasi_retraining_green')) ||
              (isTrainingGroup &&
                (currentTab === 'training_master' || currentTab === 'approval_queue'));

            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => {
                    if (isAchievementGroup && canEditTrainerActivities && !isCollapsed) {
                      setAchievementSubOpen((prev) => !prev);
                    }
                    if (isTrainingGroup && hasTrainingSubMenu && !isCollapsed) {
                      setTrainingSubOpen((prev) => !prev);
                    }
                    handleNavClick(item.id);
                  }}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full relative flex items-center justify-between ${
                    isCollapsed ? 'justify-center px-2' : 'px-3'
                  } h-[40px] rounded-[8px] text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#263640] text-white font-semibold'
                      : 'text-slate-300 hover:bg-[#263640]/60 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-[#E88932]" />
                  )}

                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={
                        isActive ? 'text-[#E88932]' : 'text-slate-400 group-hover:text-white'
                      }
                    >
                      {item.icon}
                    </span>

                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && isAchievementGroup && canEditTrainerActivities && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                        achievementSubOpen ? 'rotate-0' : '-rotate-90'
                      }`}
                    />
                  )}

                  {!isCollapsed && isTrainingGroup && hasTrainingSubMenu && (
                    <div className="flex items-center gap-1.5">
                      {pendingApprovalCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[#E88932] text-white text-[10px] font-mono font-bold leading-none">
                          {pendingApprovalCount}
                        </span>
                      )}
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                          trainingSubOpen ? 'rotate-0' : '-rotate-90'
                        }`}
                      />
                    </div>
                  )}
                </button>

                {/* Sub-Sidebar under Training Achievement (Hanya untuk Role yang berhak Edit Training Achievement, tidak muncul di Admin HRGA & PJO) */}
                {!isCollapsed &&
                  isAchievementGroup &&
                  canEditTrainerActivities &&
                  achievementSubOpen && (
                  <div className="ml-5 pl-3 border-l border-[#263640] space-y-1 py-0.5">
                    <button
                      type="button"
                      onClick={() => handleNavClick('achievement')}
                      className={`w-full flex items-center gap-2.5 px-2.5 h-[34px] rounded-[6px] text-[11px] font-medium transition-all cursor-pointer ${
                        currentTab === 'achievement'
                          ? 'bg-[#E88932]/15 text-[#E88932] font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-[#263640]/40'
                      }`}
                    >
                      <Target className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Capaian Training</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavClick('trainer_activities')}
                      className={`w-full flex items-center gap-2.5 px-2.5 h-[34px] rounded-[6px] text-[11px] font-medium transition-all cursor-pointer ${
                        currentTab === 'trainer_activities'
                          ? 'bg-[#E88932]/15 text-[#E88932] font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-[#263640]/40'
                      }`}
                    >
                      <ClipboardList className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Program Technical Training</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavClick('activity_technical_training')}
                      className={`w-full flex items-center gap-2.5 px-2.5 h-[34px] rounded-[6px] text-[11px] font-medium transition-all cursor-pointer ${
                        currentTab === 'activity_technical_training'
                          ? 'bg-[#E88932]/15 text-[#E88932] font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-[#263640]/40'
                      }`}
                    >
                      <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Daily Activity Trainer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavClick('skill_audit_refresh_operator')}
                      className={`w-full flex items-center gap-2.5 px-2.5 h-[34px] rounded-[6px] text-[11px] font-medium transition-all cursor-pointer ${
                        currentTab === 'skill_audit_refresh_operator'
                          ? 'bg-[#E88932]/15 text-[#E88932] font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-[#263640]/40'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Skill Audit & Refresh Operator</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavClick('assessment_cross_skillup')}
                      className={`w-full flex items-center gap-2.5 px-2.5 h-[34px] rounded-[6px] text-[11px] font-medium transition-all cursor-pointer ${
                        currentTab === 'assessment_cross_skillup'
                          ? 'bg-[#E88932]/15 text-[#E88932] font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-[#263640]/40'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Assessment, Cross & Skill Up</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavClick('orientasi_retraining_green')}
                      className={`w-full flex items-center gap-2.5 px-2.5 h-[34px] rounded-[6px] text-[11px] font-medium transition-all cursor-pointer ${
                        currentTab === 'orientasi_retraining_green'
                          ? 'bg-[#E88932]/15 text-[#E88932] font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-[#263640]/40'
                      }`}
                    >
                      <Compass className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Orientasi, Re-Training, FGDP & Green Op</span>
                    </button>
                  </div>
                )}

                {/* Sub-Sidebar under Data Training (Dynamic RBAC: Antrean Approval & Master Category/Type) */}
                {!isCollapsed &&
                  isTrainingGroup &&
                  hasTrainingSubMenu &&
                  trainingSubOpen && (
                    <div className="ml-5 pl-3 border-l border-[#263640] space-y-1 py-0.5">
                      <button
                        type="button"
                        onClick={() => handleNavClick('applications')}
                        className={`w-full flex items-center gap-2.5 px-2.5 h-[34px] rounded-[6px] text-[11px] font-medium transition-all cursor-pointer ${
                          currentTab === 'applications'
                            ? 'bg-[#E88932]/15 text-[#E88932] font-semibold'
                            : 'text-slate-400 hover:text-white hover:bg-[#263640]/40'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Daftar Data Training</span>
                      </button>

                      {canApproveTraining && (
                        <button
                          type="button"
                          onClick={() => handleNavClick('approval_queue')}
                          className={`w-full flex items-center justify-between gap-2 px-2.5 h-[34px] rounded-[6px] text-[11px] font-medium transition-all cursor-pointer ${
                            currentTab === 'approval_queue'
                              ? 'bg-[#E88932]/15 text-[#E88932] font-semibold'
                              : 'text-slate-400 hover:text-white hover:bg-[#263640]/40'
                          }`}
                        >
                          <span className="flex items-center gap-2.5 min-w-0">
                            <FileCheck className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">
                              {perms.canApproveFinalPjo && !perms.canApproveStage1
                                ? 'Approval Akhir PJO'
                                : 'Antrean Approval'}
                            </span>
                          </span>
                          {pendingApprovalCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-[#E88932] text-white text-[10px] font-mono font-bold leading-none shrink-0">
                              {pendingApprovalCount}
                            </span>
                          )}
                        </button>
                      )}

                      {canManageTrainingMaster && (
                        <button
                          type="button"
                          onClick={() => handleNavClick('training_master')}
                          className={`w-full flex items-center gap-2.5 px-2.5 h-[34px] rounded-[6px] text-[11px] font-medium transition-all cursor-pointer ${
                            currentTab === 'training_master'
                              ? 'bg-[#E88932]/15 text-[#E88932] font-semibold'
                              : 'text-slate-400 hover:text-white hover:bg-[#263640]/40'
                          }`}
                        >
                          <Tags className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Category & Training Type</span>
                        </button>
                      )}
                    </div>
                  )}
              </div>
            );
          })}
        </div>

        {/* Bottom User Profile & Logout Section */}
        <div className="p-3 border-t border-[#263640] bg-[#141E25] shrink-0">
          <div
            className={`flex items-center ${
              isCollapsed ? 'justify-center' : 'justify-between gap-2.5'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-[8px] bg-[#263640] border border-[#E88932]/40 text-[#E88932] font-heading font-bold text-xs flex items-center justify-center shrink-0">
                {initials}
              </div>

              {!isCollapsed && (
                <div className="min-w-0">
                  <div className="text-xs font-heading font-semibold text-white truncate">
                    {currentUser.role_name || currentUser.full_name}
                  </div>
                  <div className="text-[10px] font-mono text-[#E88932] truncate">
                    RAJA ACADEMY
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={logout}
                title="Keluar dari Portal"
                className="p-2 rounded-[8px] text-slate-400 hover:text-white hover:bg-[#B94C45]/20 hover:text-[#E88932] transition-colors shrink-0 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          {isCollapsed && (
            <button
              onClick={logout}
              title="Keluar dari Portal"
              className="mt-2 w-full flex items-center justify-center p-2 rounded-[8px] text-slate-400 hover:text-white hover:bg-[#263640] transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-200 border-r border-[#263640] ${
          collapsed ? 'w-[72px]' : 'w-[256px]'
        }`}
      >
        <div className="sticky top-0 h-screen">{renderSidebarContent(false)}</div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#18232B]/70 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-[268px] max-w-[85vw] h-full shadow-2xl">
            {renderSidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
