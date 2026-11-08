import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, UserCheck, Layers, Building2, Globe, Settings } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { currentUser, availableUsers, switchUser, logout } = useAuth();

  const getRoleIcon = (roleCode: string) => {
    switch (roleCode) {
      case 'SUPER_ADMIN':
        return <ShieldCheck className="w-3.5 h-3.5 text-[#E88932]" />;
      case 'ADMIN':
        return <Settings className="w-3.5 h-3.5 text-[#397C69]" />;
      case 'PJO':
        return <UserCheck className="w-3.5 h-3.5 text-[#D5A33D]" />;
      case 'MANAGER_TC':
        return <Layers className="w-3.5 h-3.5 text-[#527FA1]" />;
      case 'ADMIN_TC':
        return <Layers className="w-3.5 h-3.5 text-[#397C69]" />;
      case 'ADMIN_HRGA':
        return <Building2 className="w-3.5 h-3.5 text-[#527FA1]" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#18232B] border-b border-[#263640] text-slate-200 px-4 py-1.5 flex flex-wrap items-center justify-between text-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#263640] hover:bg-[#314552] text-white font-medium transition-colors cursor-pointer border border-white/10"
          title="Kembali ke Halaman Awal Company Profile"
        >
          <Globe className="w-3.5 h-3.5 text-[#E88932]" />
          <span>Halaman Awal (Public)</span>
        </button>
        <span className="text-slate-600 hidden md:inline">|</span>
        <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider hidden sm:inline">
          Simulasi 6 Role Resmi:
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
        {availableUsers.map((user) => {
          const isSelected = user.id === currentUser?.id;
          return (
            <button
              key={user.id}
              onClick={() => switchUser(user.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] transition-all font-medium cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-[#E88932] text-white font-semibold shadow-2xs'
                  : 'bg-[#263640] hover:bg-[#314552] text-slate-300 border border-white/5'
              }`}
            >
              {!isSelected && getRoleIcon(user.role_code)}
              <span>{user.role_name || user.role_code}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
