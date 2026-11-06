import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, UserCheck, Layers, Building2, Globe } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { currentUser, availableUsers, switchUser, logout } = useAuth();

  const getRoleIcon = (roleCode: string) => {
    switch (roleCode) {
      case 'SUPER_ADMIN':
        return <ShieldCheck className="w-3.5 h-3.5 text-red-500" />;
      case 'ADMIN_HOD_TC':
        return <Layers className="w-3.5 h-3.5 text-blue-500" />;
      case 'ADMIN_PJO':
        return <UserCheck className="w-3.5 h-3.5 text-amber-500" />;
      case 'DEPARTMENT_USER':
        return <Building2 className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-950 border-b border-slate-800 text-slate-200 px-4 py-2 flex flex-wrap items-center justify-between text-xs">
      <div className="flex items-center space-x-3">
        <button
          onClick={logout}
          className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-sky-300 font-semibold transition-colors cursor-pointer"
          title="Lihat Dashboard Profil Publik"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Lihat Profil Publik</span>
        </button>
        <span className="text-slate-600 hidden md:inline">|</span>
        <span className="font-semibold text-sky-400 uppercase tracking-wider hidden sm:inline">
          Ganti Akun Demo:
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
        {availableUsers.map((user) => {
          const isSelected = user.id === currentUser?.id;
          return (
            <button
              key={user.id}
              onClick={() => switchUser(user.id)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-all font-medium cursor-pointer ${
                isSelected
                  ? 'bg-sky-600 text-white shadow-sm ring-1 ring-sky-300 font-bold'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {getRoleIcon(user.role_code)}
              <span>{user.full_name.split(' ')[0]}</span>
              <span className="opacity-75 text-[10px]">({user.role_code.replace('ADMIN_', '')})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
