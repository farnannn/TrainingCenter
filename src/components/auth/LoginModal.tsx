import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { RajaLogo } from '../ui/RajaLogo';
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
  CheckCircle2,
  HardHat,
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
      setError(
        'Akun tidak ditemukan atau tidak aktif. Silakan gunakan pilihan Akun Demo Cepat di bawah.'
      );
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
          icon: <ShieldCheck className="w-3.5 h-3.5 text-[#B94C45]" />,
          tag: 'Super Admin',
          style: 'bg-[#B94C45]/10 text-[#B94C45] border-[#B94C45]/25',
        };
      case 'ADMIN_HOD_TC':
        return {
          icon: <Layers className="w-3.5 h-3.5 text-[#527FA1]" />,
          tag: 'HOD TC (Stage 1)',
          style: 'bg-[#527FA1]/10 text-[#527FA1] border-[#527FA1]/25',
        };
      case 'ADMIN_PJO':
        return {
          icon: <UserCheck className="w-3.5 h-3.5 text-[#E88932]" />,
          tag: 'PJO (Final Auth)',
          style: 'bg-[#E88932]/12 text-[#C26A1B] border-[#E88932]/30',
        };
      case 'DEPARTMENT_USER':
        return {
          icon: <Building2 className="w-3.5 h-3.5 text-[#397C69]" />,
          tag: 'Dept Rep',
          style: 'bg-[#397C69]/10 text-[#397C69] border-[#397C69]/25',
        };
      default:
        return {
          icon: null,
          tag: 'Staff',
          style: 'bg-[#F4F6F5] text-[#263640] border-[#E2E8E8]',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#18232B]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-[16px] shadow-2xl border border-[#E2E8E8] max-w-4xl w-full overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* LEFT SIDE: Open-Pit Mining Photograph + Dark Charcoal Overlay + Topographic Pattern */}
        <div className="lg:col-span-5 relative bg-[#18232B] text-white p-7 sm:p-8 flex flex-col justify-between overflow-hidden">
          {/* Mining Landscape Photography Layer */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-luminosity"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1000&q=80')`,
            }}
          />
          {/* Deep Charcoal Gradient Overlay + Topographic Contour Pattern */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#18232B]/90 via-[#18232B]/85 to-[#18232B]/95 bg-topography" />

          {/* Top Branding */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <RajaLogo variant="on-dark" heightClass="h-8" />
            </div>

            <div className="mt-8">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#263640] border border-white/10 text-[11px] text-[#E88932] font-medium">
                <HardHat className="w-3.5 h-3.5" />
                <span>Training Historical & Reporting</span>
              </span>
              <h2 className="mt-3 text-xl font-heading font-bold text-white leading-snug">
                Sistem Informasi Pelatihan & Sertifikasi Operasional Tambang
              </h2>
              <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                Platform terpadu pengelolaan pengajuan training departemen, evaluasi kurikulum HOD Training Center, dan otorisasi operasional terpusat oleh PJO sesuai kaidah Kepmen ESDM 1827 K/2018.
              </p>
            </div>
          </div>

          {/* Bottom Governance Metadata */}
          <div className="relative z-10 mt-8 pt-5 border-t border-white/10 space-y-2.5 text-[11px] text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#E88932] shrink-0" />
              <span>Persetujuan Bertingkat (HOD TC → PJO Final)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#E88932] shrink-0" />
              <span>Isolasi Data Departemen via Supabase RLS</span>
            </div>
            <div className="flex items-center gap-2 pt-1 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-[#E88932] shrink-0" />
              <span>Site Morowali (Sulteng) & HO Makassar</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Clean White / Off-White Login Form & Quick Role Switcher */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 flex flex-col justify-between relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-[#5A6B75] hover:text-[#18232B] p-1.5 rounded-[8px] hover:bg-[#F4F6F5] transition-colors cursor-pointer"
            aria-label="Tutup Login"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <div className="pr-8">
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#E88932]">
                OTENTIKASI PORTAL INTERNAL
              </span>
              <h3 className="text-lg font-heading font-bold text-[#18232B] mt-0.5">
                Masuk ke THR Dashboard
              </h3>
              <p className="text-xs text-[#5A6B75] mt-1">
                Pilih akun demonstrasi sesuai peran fungsional atau masuk dengan email korporat.
              </p>
            </div>

            {/* 1-Click Role Demo Accounts */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-[#263640] uppercase tracking-wider">
                  Akses Cepat Akun Peran (1-Click Demo)
                </span>
                <span className="text-[11px] font-mono text-[#5A6B75]">
                  4 Role Fungsional
                </span>
              </div>

              <div className="space-y-2 max-h-[230px] overflow-y-auto pr-1">
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
                      type="button"
                      onClick={() => handleDemoSelect(user.id)}
                      className="w-full text-left p-2.5 rounded-[10px] border border-[#E2E8E8] bg-[#F4F6F5]/50 hover:bg-[#F4F6F5] hover:border-[#E88932]/60 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-[8px] bg-[#263640] text-white font-heading font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-[#E88932] transition-colors">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-heading font-bold text-[#18232B] truncate">
                              {user.full_name}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded border ${badge.style}`}
                            >
                              {badge.icon}
                              <span>{badge.tag}</span>
                            </span>
                          </div>
                          <div className="text-[11px] text-[#5A6B75] font-mono truncate mt-0.5">
                            {user.email}{' '}
                            {user.department_name ? `• ${user.department_name}` : ''}
                          </div>
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-[#5A6B75] group-hover:text-[#E88932] shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-5">
              <div className="border-t border-[#E2E8E8] w-full" />
              <span className="bg-white px-3 text-[10px] font-mono uppercase tracking-wider text-[#5A6B75] shrink-0">
                Atau Kredensial Manual
              </span>
            </div>

            {/* Manual Login Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <div className="p-3 bg-[#B94C45]/10 border border-[#B94C45]/30 text-[#B94C45] text-xs rounded-[8px] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#263640] mb-1">
                    Email Korporat
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-[#5A6B75]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@rodajayasakti.id"
                      className="w-full h-[38px] pl-9 pr-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] text-[#18232B] focus:bg-white focus:outline-none focus:border-[#E88932]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#263640] mb-1">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-[#5A6B75]" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-[38px] pl-9 pr-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] text-[#18232B] focus:bg-white focus:outline-none focus:border-[#E88932]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <Button type="submit" variant="primary" fullWidth icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                  Masuk ke Portal Internal
                </Button>
              </div>
            </form>
          </div>

          <div className="mt-5 pt-3 border-t border-[#E2E8E8] flex items-center justify-between text-[11px] text-[#5A6B75]">
            <span>Keamanan Terverifikasi • Supabase Auth & RLS</span>
            <span className="font-mono">v2.6 Enterprise</span>
          </div>
        </div>
      </div>
    </div>
  );
};
