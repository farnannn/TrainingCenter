import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { RajaLogo } from '../ui/RajaLogo';
import {
  LayoutDashboard,
  FileText,
  CalendarDays,
  Award,
  BarChart3,
  Users,
  Building,
  FileCheck,
  History,
  ChevronLeft,
  ChevronRight,
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
  const role = currentUser.role_code;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      roles: ['SUPER_ADMIN', 'ADMIN_HOD_TC', 'ADMIN_PJO', 'DEPARTMENT_USER'],
    },
    {
      id: 'applications',
      label: 'Pengajuan Training',
      icon: <FileText className="w-4 h-4 shrink-0" />,
      roles: ['SUPER_ADMIN', 'ADMIN_HOD_TC', 'ADMIN_PJO', 'DEPARTMENT_USER'],
    },
    {
      id: 'approval_queue',
      label: role === 'ADMIN_PJO' ? 'Otorisasi PJO (Queue)' : 'Review HOD (Queue)',
      icon: <FileCheck className="w-4 h-4 shrink-0" />,
      roles: ['ADMIN_HOD_TC', 'ADMIN_PJO'],
    },
    {
      id: 'schedules',
      label: 'Historical & Jadwal',
      icon: <CalendarDays className="w-4 h-4 shrink-0" />,
      roles: ['SUPER_ADMIN', 'ADMIN_HOD_TC', 'DEPARTMENT_USER'],
    },
    {
      id: 'certifications',
      label: 'Data Sertifikasi',
      icon: <Award className="w-4 h-4 shrink-0" />,
      roles: ['SUPER_ADMIN', 'ADMIN_HOD_TC', 'ADMIN_PJO', 'DEPARTMENT_USER'],
    },
    {
      id: 'kpi',
      label: 'KPI Training Center',
      icon: <BarChart3 className="w-4 h-4 shrink-0" />,
      roles: ['SUPER_ADMIN', 'ADMIN_HOD_TC', 'ADMIN_PJO'],
    },
    {
      id: 'assignments',
      label: 'Penugasan Departemen',
      icon: <Building className="w-4 h-4 shrink-0" />,
      roles: ['SUPER_ADMIN'],
    },
    {
      id: 'employees',
      label: role === 'DEPARTMENT_USER' ? 'Personel Departemen' : 'Data Karyawan',
      icon: <Users className="w-4 h-4 shrink-0" />,
      roles: ['SUPER_ADMIN', 'ADMIN_HOD_TC', 'DEPARTMENT_USER'],
    },
    {
      id: 'audit_logs',
      label: 'Audit Trail',
      icon: <History className="w-4 h-4 shrink-0" />,
      roles: ['SUPER_ADMIN'],
    },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

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
              <RajaLogo variant="on-dark" heightClass="h-7" />
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
              Menu Utama
            </div>
          )}

          {visibleItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full relative flex items-center ${
                  isCollapsed ? 'justify-center px-2' : 'px-3 gap-3'
                } h-[40px] rounded-[8px] text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#263640] text-white font-semibold'
                    : 'text-slate-300 hover:bg-[#263640]/60 hover:text-white'
                }`}
              >
                {/* Safety Orange Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-[#E88932]" />
                )}

                <span
                  className={
                    isActive ? 'text-[#E88932]' : 'text-slate-400 group-hover:text-white'
                  }
                >
                  {item.icon}
                </span>

                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
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
                    {currentUser.full_name}
                  </div>
                  <div className="text-[10px] font-mono text-[#E88932] truncate">
                    {currentUser.role_name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {currentUser.department_name || 'All Departments (Central)'}
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
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-200 border-r border-[#263640] ${
          collapsed ? 'w-[72px]' : 'w-[256px]'
        }`}
      >
        <div className="sticky top-0 h-screen">{renderSidebarContent(false)}</div>
      </aside>

      {/* Mobile Drawer Overlay */}
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
