import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Lock,
  Mail,
  ShieldCheck,
  UserCheck,
  Layers,
  Building2,
  X,
  ArrowRight,
  Sparkles,
  AlertCircle,
  MapPin
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, loginAsUser, availableUsers } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = login(email, password);
    if (success) {
      onClose();
    } else {
      setError('Akun tidak ditemukan atau tidak aktif. Silakan pilih dari Akun Demo Cepat di bawah.');
    }
  };

  const handleDemoSelect = (userId: string) => {
    loginAsUser(userId);
    onClose();
  };

  const getRoleBadge = (roleCode: string) => {
    switch (roleCode) {
      case 'SUPER_ADMIN':
        return {
          icon: <ShieldCheck className="w-4 h-4 text-red-500" />,
          label: 'Akses Penuh Level 1',
          bg: 'bg-red-50 border-red-200 text-red-800'
        };
      case 'ADMIN_HOD_TC':
        return {
          icon: <Layers className="w-4 h-4 text-blue-500" />,
          label: 'Stage 1 Reviewer',
          bg: 'bg-blue-50 border-blue-200 text-blue-800'
        };
      case 'ADMIN_PJO':
        return {
          icon: <UserCheck className="w-4 h-4 text-amber-500" />,
          label: 'Stage 2 Final Auth',
          bg: 'bg-amber-50 border-amber-200 text-amber-800'
        };
      case 'DEPARTMENT_USER':
        return {
          icon: <Building2 className="w-4 h-4 text-emerald-500" />,
          label: 'Pengaju Departemen',
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800'
        };
      default:
        return {
          icon: null,
          label: 'Staff',
          bg: 'bg-slate-50 border-slate-200 text-slate-800'
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-100">
        
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-slate-950 via-zinc-900 to-amber-950/50 p-6 border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
              RAJA
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                PT. RODA JAYA SAKTI
              </span>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-amber-400" />
                <span>Site Morowali & Head Office Makassar</span>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white mt-1">
            Masuk Portal Internal THR & Sertifikasi Tambang
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Pilih salah satu peran demo untuk menguji alur otorisasi berurutan (*Strict Sequential Approval*).
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick 1-Click Demo Logins */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pilih Cepat Akun Demo (1-Click Login):</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Siap Langsung Masuk</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {availableUsers.map((user) => {
                const badge = getRoleBadge(user.role_code);

                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleDemoSelect(user.id)}
                    className="p-3 text-left rounded-xl border border-slate-800 bg-slate-950/60 hover:border-amber-500/60 hover:bg-slate-800/60 transition-all group flex items-start space-x-2.5 cursor-pointer"
                  >
                    <div className="mt-0.5">{badge.icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        {user.full_name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {user.role_name || user.role_code.replace(/_/g, ' ')}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">
                        {user.email}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all self-center" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <span className="absolute inset-x-0 h-px bg-slate-800" />
            <span className="relative bg-slate-900 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              atau login dengan kredensial
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Alamat Email Kerja (@rodajayasakti.id atau @ptraja.com)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh: hod.training@ptraja.com"
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-700 bg-slate-950 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-700 bg-slate-950 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-white font-semibold cursor-pointer"
              >
                Batal / Kembali ke Profil
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
