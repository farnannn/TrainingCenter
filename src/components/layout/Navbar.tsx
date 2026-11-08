import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import {
  Bell,
  CheckCheck,
  Briefcase,
  LogOut,
  Menu,
  ShieldCheck,
  Layers,
  UserCheck,
  Building2,
  Settings,
} from 'lucide-react';

interface NavbarProps {
  onOpenMobileMenu?: () => void;
  currentTab?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu, currentTab }) => {
  const {
    currentUser,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    logout,
  } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);

  if (!currentUser) return null;

  const getPageTitle = (tab?: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Executive & Operational Dashboard';
      case 'achievement':
        return 'Training Achievement / Capaian Pelaksanaan Training';
      case 'applications':
        return 'Manajemen Data Training & Pengajuan';
      case 'schedules':
        return 'Historical & Jadwal Pelaksanaan Training';
      case 'certifications':
        return 'Registri Data Sertifikasi & Training History Report';
      case 'kpi':
        return 'KPI Training Center & Realisasi Target';
      case 'employees':
        return 'Direktori Personel & Riwayat Kompetensi';
      case 'assignments':
        return 'User Management & Role Access Control';
      case 'system_settings':
        return 'System Settings & Audit Trail';
      default:
        return 'RAJA ACADEMY — Training Historical & Reporting';
    }
  };

  const getRoleBadge = (roleCode: string) => {
    switch (roleCode) {
      case 'SUPER_ADMIN':
        return {
          icon: <ShieldCheck className="w-3.5 h-3.5 text-[#B94C45]" />,
          style: 'bg-[#B94C45]/10 text-[#B94C45] border-[#B94C45]/25',
        };
      case 'ADMIN':
        return {
          icon: <Settings className="w-3.5 h-3.5 text-[#397C69]" />,
          style: 'bg-[#397C69]/10 text-[#397C69] border-[#397C69]/25',
        };
      case 'PJO':
        return {
          icon: <UserCheck className="w-3.5 h-3.5 text-[#E88932]" />,
          style: 'bg-[#E88932]/12 text-[#B86214] border-[#E88932]/30',
        };
      case 'MANAGER_TC':
        return {
          icon: <Layers className="w-3.5 h-3.5 text-[#527FA1]" />,
          style: 'bg-[#527FA1]/10 text-[#527FA1] border-[#527FA1]/25',
        };
      case 'ADMIN_TC':
        return {
          icon: <Layers className="w-3.5 h-3.5 text-[#397C69]" />,
          style: 'bg-[#397C69]/10 text-[#397C69] border-[#397C69]/25',
        };
      case 'ADMIN_HRGA':
        return {
          icon: <Building2 className="w-3.5 h-3.5 text-[#527FA1]" />,
          style: 'bg-[#527FA1]/10 text-[#527FA1] border-[#527FA1]/25',
        };
      default:
        return {
          icon: null,
          style: 'bg-[#F4F6F5] text-[#263640] border-[#E2E8E8]',
        };
    }
  };

  const badge = getRoleBadge(currentUser.role_code);

  return (
    <header className="bg-white border-b border-[#E2E8E8] sticky top-0 z-30 h-16 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Drawer Trigger + Active View Title */}
      <div className="flex items-center gap-3 min-w-0">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-[8px] text-[#263640] hover:bg-[#F4F6F5] border border-[#E2E8E8] cursor-pointer"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-heading font-bold text-[#18232B] truncate">
            {getPageTitle(currentTab)}
          </h1>
          <p className="text-[11px] text-[#5A6B75] truncate hidden sm:block">
            RAJA ACADEMY • PT. Roda Jaya Sakti • Site Morowali & Head Office Makassar
          </p>
        </div>
      </div>

      {/* Right: Notifications, Role Pill & Logout */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 text-[#263640] hover:bg-[#F4F6F5] rounded-[8px] border border-[#E2E8E8] transition-colors cursor-pointer"
            title="Notifikasi Sistem"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E88932] text-white text-[10px] font-mono font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-[12px] shadow-xl border border-[#E2E8E8] z-50 overflow-hidden">
              <div className="px-4 py-3 bg-[#F4F6F5] border-b border-[#E2E8E8] flex items-center justify-between">
                <span className="font-heading font-semibold text-xs text-[#18232B]">
                  Notifikasi Alur Kerja ({unreadCount} baru)
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-[#E88932] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Tandai dibaca</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#E2E8E8]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-[#5A6B75] text-xs">
                    Belum ada notifikasi untuk akun Anda.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3.5 text-xs cursor-pointer transition-colors hover:bg-[#F4F6F5] ${
                        !n.is_read ? 'bg-[#E88932]/5' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span className="font-heading font-semibold text-[#18232B]">
                          {n.title}
                        </span>
                        <span className="text-[10px] font-mono text-[#5A6B75] shrink-0">
                          {new Date(n.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[#5A6B75] leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Active Role & Department Badge */}
        <div className="hidden md:flex items-center gap-2.5 pl-3 border-l border-[#E2E8E8]">
          <div className="text-right">
            <div className="text-xs font-heading font-semibold text-[#18232B]">
              {currentUser.full_name}
            </div>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded border ${badge.style}`}
              >
                {badge.icon}
                <span>{currentUser.role_name}</span>
              </span>
              {currentUser.department_name && (
                <span className="text-[10px] font-mono text-[#5A6B75] flex items-center gap-0.5">
                  <Briefcase className="w-3 h-3" />
                  <span>{currentUser.department_name}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          size="sm"
          icon={<LogOut className="w-3.5 h-3.5 text-[#B94C45]" />}
          onClick={logout}
          title="Keluar dan kembali ke halaman awal"
        >
          Keluar
        </Button>
      </div>
    </header>
  );
};
