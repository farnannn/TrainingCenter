import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, CheckCheck, Briefcase, Award } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);

  const getRoleBadgeStyle = (roleCode: string) => {
    switch (roleCode) {
      case 'SUPER_ADMIN':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'ADMIN_HOD_TC':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ADMIN_PJO':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'DEPARTMENT_USER':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & System Title */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-sky-600 to-blue-800 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">PT RAJA</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                  THR DASHBOARD
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Training Management & Operational Certification</p>
            </div>
          </div>

          {/* User Status & Notifications */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-700 uppercase tracking-wider">
                      Workflow Notifications ({unreadCount} new)
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center space-x-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        No notifications for your account.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3 text-xs cursor-pointer transition-colors hover:bg-slate-50 ${
                            !n.is_read ? 'bg-sky-50/60 font-medium' : 'text-slate-600'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-slate-800">{n.title}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-600 leading-snug">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm ring-2 ring-slate-100">
                {currentUser.full_name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-none">
                  {currentUser.full_name}
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  <span
                    className={`inline-block text-[10px] px-1.5 py-0.5 rounded border font-semibold ${getRoleBadgeStyle(
                      currentUser.role_code
                    )}`}
                  >
                    {currentUser.role_name || currentUser.role_code}
                  </span>
                  {currentUser.department_name && (
                    <span className="text-[10px] text-slate-500 font-medium flex items-center">
                      <Briefcase className="w-2.5 h-2.5 mr-0.5" />
                      {currentUser.department_name.split(' ')[0]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
