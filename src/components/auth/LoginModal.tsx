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
  AlertCircle,
  MapPin,
  CheckCircle2
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
      setError('Kredensial tidak cocok. Silakan pilih akun demo cepat di bawah ini untuk pengujian peran.');
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
          label: 'Super Admin',
          tag: 'Akses Penuh',
          style: 'bg-red-50 text-red-800 border-red-200'
        };
      case 'ADMIN_HOD_TC':
        return {
          label: 'HOD Training Center',
          tag: 'Reviewer Tahap 1',
          style: 'bg-blue-50 text-blue-800 border-blue-200'
        };
      case 'ADMIN_PJO':
        return {
          label: 'PJO Operasional',
          tag: 'Otorisasi Final',
          style: 'bg-amber-50 text-amber-900 border-amber-200'
        };
      case 'DEPARTMENT_USER':
        return {
          label: 'Department User',
          tag: 'Pengaju Departemen',
          style: 'bg-emerald-50 text-emerald-800 border-emerald-200'
        };
      default:
        return {
          label: 'Staff',
          tag: 'General Access',
          style: 'bg-slate-50 text-slate-800 border-slate-200'
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-xl w-full overflow-hidden text-slate-900">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 border-b border-slate-800 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
              RAJA
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                PT. RODA JAYA SAKTI
              </span>
              <h3 className="text-base font-bold text-white">
                Portal Pelatihan & Sertifikasi Kerja
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Akses internal resmi bagi Super Admin, HOD Training Center, PJO, dan Perwakilan Departemen Aktif.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Quick Demo Role Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Pilih Akun Demo (1-Click Login)
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                4 Peran Fungsional Terkonfirmasi
              </span>
            </div>

            <div className="space-y-2">
              {availableUsers.map((user) => {
                const badge = getRoleBadge(user.role_code);
                const initials = user.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('');

                return (
                  <button
                    key={user.id}
                    onClick={() => handleDemoSelect(user.id)}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                        {initials}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-slate-950">
                            {user.full_name}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge.style}`}>
                            {badge.tag}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {user.email} {user.department_name ? `• ${user.department_name}` : ''}
                        </div>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              atau gunakan email terdaftar
            </span>
          </div>

          {/* Manual Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Email Perusahaan
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@rodajayasakti.id"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer mt-1"
            >
              Masuk dengan Kredensial
            </button>
          </form>

          {/* Security Footnote */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Row Level Security (RLS) Aktif</span>
            </span>
            <span>Site Morowali & Makassar</span>
          </div>

        </div>
      </div>
    </div>
  );
};
