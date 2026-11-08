import React, { useState } from 'react';
import { CompanyProfileHero } from '../company/CompanyProfileHero';
import { KpiAnalyticsCharts } from '../charts/KpiAnalyticsCharts';
import { LoginModal } from '../auth/LoginModal';
import { Button } from '../ui/Button';
import { KpiCard } from '../ui/KpiCard';
import { RajaLogo } from '../ui/RajaLogo';
import {
  Award,
  Shield,
  ArrowRight,
  LogIn,
  MapPin,
  ExternalLink,
  Clock,
  Users,
  CheckCircle2,
  HardHat,
} from 'lucide-react';

export const PublicCompanyLanding: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  const featuredPrograms = [
    {
      code: 'TR-POP-01',
      title: 'Pengawas Operasional Pertama (POP) Pertambangan',
      category: 'Sertifikasi Nasional BNSP / ESDM',
      hours: '40 Jam',
      target: 'Foremen Pit, Supervisor Hauling & Maintenance',
      desc: 'Sertifikasi wajib penanggung jawab operasional lapangan sesuai Kepmen ESDM No. 1827 K/30/MEM/2018.',
    },
    {
      code: 'TR-DDT-01',
      title: 'Defensive Driving & Heavy Hauler Safety (Site Morowali)',
      category: 'K3LH & Mine Safety',
      hours: '16 Jam',
      target: 'Driver Dump Truck 6x4 & Operator Hauling Nikel',
      desc: 'Pelatihan keselamatan berkendara di area pit aktif dan jalan angkut tambang ekstrem bertonase tinggi.',
    },
    {
      code: 'TR-MNT-01',
      title: 'Preventive Maintenance & Hydraulic Diagnostics (CAT & Komatsu)',
      category: 'Teknik Alat Berat',
      hours: '32 Jam',
      target: 'Mekanik & Teknisi Plant Maintenance',
      desc: 'Pemecahan masalah sistem hidrolik, powertrain, dan kalibrasi sensor elektronik unit excavator 40T-80T.',
    },
    {
      code: 'TR-GEO-01',
      title: 'Slope Stability & Geotechnical Radar Monitoring',
      category: 'Teknik Pertambangan',
      hours: '24 Jam',
      target: 'Mine Engineers, Survey & Geologists',
      desc: 'Analisis kestabilan lereng pit tambang nikel laterit terbuka menggunakan instrumentasi radar dan prisma.',
    },
  ];

  const workflowSteps = [
    { step: '01', title: 'DRAFT', role: 'Dept User', desc: 'Penginputan rencana pelatihan & peserta oleh perwakilan departemen aktif.' },
    { step: '02', title: 'SUBMITTED', role: 'System', desc: 'Validasi kelengkapan berkas dan penguncian daftar peserta.' },
    { step: '03', title: 'HOD REVIEW', role: 'HOD TC', desc: 'Verifikasi kurikulum, anggaran, dan kelaikan instruktur oleh HOD Training Center.' },
    { step: '04', title: 'PENDING PJO', role: 'PJO', desc: 'Otorisasi akhir keselamatan operasional oleh satu akun PJO terpusat.' },
    { step: '05', title: 'APPROVED', role: 'Authorized', desc: 'Persetujuan resmi penuh tercapai. Berkas siap dijadwalkan.' },
    { step: '06', title: 'SCHEDULED', role: 'Training Center', desc: 'Penetapan jadwal kelas, ruang training Morowali, dan instruktur.' },
    { step: '07', title: 'IN PROGRESS', role: 'Trainer / Assessor', desc: 'Pelaksanaan kelas teori, praktik simulator/lapangan, dan presensi.' },
    { step: '08', title: 'COMPLETED', role: 'Evaluator', desc: 'Penerbitan sertifikasi, penilaian hasil, dan rekalkulasi otomatis KPI.' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F5] text-[#18232B] font-sans">
      {/* Top Corporate Strip */}
      <div className="bg-[#18232B] text-slate-300 text-[11px] border-b border-[#263640]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="font-heading font-bold text-white tracking-wide">
              PT. RODA JAYA SAKTI (RAJA)
            </span>
            <span className="text-slate-600">•</span>
            <span className="hidden sm:inline text-slate-300">
              Mining Services Contractor, Heavy Equipment Rental & Civil Infrastructure
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#E88932]" />
              <span>Site Morowali (Sulteng) & HO Makassar</span>
            </span>
            <span className="text-slate-600">|</span>
            <a
              href="https://rodajayasakti.id"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E88932] hover:underline font-medium flex items-center gap-1"
            >
              <span>rodajayasakti.id</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3.5">
              <RajaLogo variant="on-light" heightClass="h-9" />
              <div className="hidden sm:block pl-3.5 border-l border-[#E2E8E8]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-heading font-bold tracking-tight text-[#18232B]">
                    RAJA ACADEMY
                  </span>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#F4F6F5] text-[#263640] border border-[#E2E8E8]">
                    CORPORATE EDITION
                  </span>
                </div>
                <p className="text-[11px] text-[#5A6B75]">
                  Training Historical & Reporting System
                </p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#263640]">
              <a href="#profil" className="hover:text-[#E88932] transition-colors">
                Visi, Misi & Profil
              </a>
              <a href="#kpi" className="hover:text-[#E88932] transition-colors">
                Kinerja KPI
              </a>
              <a href="#silabus" className="hover:text-[#E88932] transition-colors">
                Silabus Pelatihan
              </a>
              <a href="#tata-kelola" className="hover:text-[#E88932] transition-colors">
                Alur Persetujuan
              </a>
            </nav>

            <Button
              variant="primary"
              size="md"
              icon={<LogIn className="w-4 h-4" />}
              onClick={() => setShowLoginModal(true)}
            >
              Masuk Portal Internal
            </Button>
          </div>
        </div>
      </header>

      {/* Mining-Inspired Hero Banner with Topographic Pattern */}
      <section className="relative bg-[#18232B] text-white border-b border-[#263640] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1600&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#18232B] via-[#18232B]/90 to-[#263640]/85 bg-topography" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[6px] bg-[#263640] border border-white/10 text-xs font-mono text-[#E88932] mb-4">
              <HardHat className="w-3.5 h-3.5" />
              <span>RAJA ACADEMY • TRAINING HISTORICAL & REPORTING SYSTEM</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-heading font-bold text-white tracking-tight leading-tight">
              Tata Kelola Pelatihan & Sertifikasi Operasional Pertambangan Terpadu
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
              Portal resmi PT. Roda Jaya Sakti untuk perencanaan kompetensi departemen, evaluasi kurikulum HOD Training Center, serta otorisasi akhir oleh Penanggung Jawab Operasional (PJO) sesuai standar keselamatan pertambangan ESDM & BNSP.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
                onClick={() => setShowLoginModal(true)}
              >
                Akses Dashboard Internal
              </Button>

              <a
                href="#profil"
                className="inline-flex items-center justify-center h-[46px] px-5 rounded-[10px] bg-[#263640] hover:bg-[#314552] text-white text-sm font-medium border border-white/10 transition-colors"
              >
                Lihat Visi, Misi & Profil
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Executive KPI Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Realisasi Jam Pelatihan (YTD)"
            value="880 Jam"
            comparison="+12.4% vs Q2"
            trend="up"
            trendIsGood={true}
            subtitle="Target 1.000 Jam / Thn"
            icon={<Clock className="w-4 h-4" />}
            tone="orange"
          />
          <KpiCard
            title="Training Completion Rate"
            value="94.2%"
            comparison="+4.2% di atas target"
            trend="up"
            trendIsGood={true}
            subtitle="Standar BNSP & ESDM"
            icon={<Award className="w-4 h-4" />}
            tone="success"
          />
          <KpiCard
            title="Validitas Sertifikasi & SIMPER"
            value="100%"
            comparison="Aktif & Terverifikasi"
            trend="neutral"
            subtitle="Operator Site Morowali"
            icon={<Shield className="w-4 h-4" />}
            tone="info"
          />
          <KpiCard
            title="Partisipasi Personel Tambang"
            value="7 Divisi"
            comparison="HRGA-IT, MED, MOD, PLM, CIVIL, TC, HSE"
            trend="up"
            trendIsGood={true}
            subtitle="Terintegrasi Seluruh Divisi"
            icon={<Users className="w-4 h-4" />}
            tone="default"
          />
        </section>

        {/* SECTION 1: Company Profile (Visi, Misi, Layanan, Tata Nilai, K3LH) */}
        <section id="profil" className="scroll-mt-20">
          <div className="mb-4">
            <span className="text-[11px] font-mono font-semibold text-[#E88932] uppercase tracking-wider">
              PROFIL KORPORAT & VISI MISI
            </span>
            <h2 className="text-xl font-heading font-bold text-[#18232B] mt-0.5">
              Identitas & Landasan Operasional PT. Roda Jaya Sakti
            </h2>
          </div>

          <CompanyProfileHero />
        </section>

        {/* SECTION 2: KPI Analytics Charts */}
        <section id="kpi" className="scroll-mt-20">
          <KpiAnalyticsCharts />
        </section>

        {/* SECTION 3: Mining Training Curricula */}
        <section id="silabus" className="scroll-mt-20">
          <div className="mb-4">
            <span className="text-[11px] font-mono font-semibold text-[#E88932] uppercase tracking-wider">
              KATALOG SILABUS KOMPETENSI
            </span>
            <h2 className="text-xl font-heading font-bold text-[#18232B] mt-0.5">
              Program Pelatihan & Sertifikasi Utama
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredPrograms.map((prog) => (
              <div
                key={prog.code}
                className="bg-white p-5 rounded-[12px] border border-[#E2E8E8] flex flex-col justify-between hover:border-[#CBD5D5] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <span className="font-mono font-semibold text-[#E88932] bg-[#E88932]/10 px-2.5 py-0.5 rounded border border-[#E88932]/25">
                      {prog.code}
                    </span>
                    <span className="font-mono text-[#5A6B75] font-medium tabular-nums">
                      {prog.hours}
                    </span>
                  </div>

                  <h3 className="text-sm font-heading font-bold text-[#18232B] leading-snug">
                    {prog.title}
                  </h3>

                  <p className="text-xs text-[#5A6B75] mt-2 leading-relaxed">
                    {prog.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E2E8E8] flex items-center justify-between text-xs">
                  <span className="text-[#5A6B75]">Sasaran Peserta:</span>
                  <span className="font-medium text-[#18232B]">{prog.target}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: Sequential Approval Governance */}
        <section id="tata-kelola" className="scroll-mt-20">
          <div className="mb-4">
            <span className="text-[11px] font-mono font-semibold text-[#E88932] uppercase tracking-wider">
              ARSITEKTUR PERSETUJUAN
            </span>
            <h2 className="text-xl font-heading font-bold text-[#18232B] mt-0.5">
              Alur Persetujuan Bertingkat (Sequential Approval Workflow)
            </h2>
          </div>

          <div className="bg-white p-6 rounded-[12px] border border-[#E2E8E8]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {workflowSteps.map((ws) => (
                <div
                  key={ws.step}
                  className="p-4 bg-[#F4F6F5] rounded-[10px] border border-[#E2E8E8]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-semibold text-[#E88932]">
                      STAGE {ws.step}
                    </span>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-white text-[#263640] border border-[#E2E8E8]">
                      {ws.role}
                    </span>
                  </div>
                  <h4 className="text-xs font-heading font-bold text-[#18232B]">
                    {ws.title}
                  </h4>
                  <p className="text-xs text-[#5A6B75] mt-1 leading-relaxed">
                    {ws.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 p-4 bg-[#F4F6F5] rounded-[10px] border border-[#E2E8E8] flex items-start gap-3 text-xs text-[#263640]">
              <CheckCircle2 className="w-4 h-4 text-[#397C69] shrink-0 mt-0.5" />
              <div>
                <span className="font-heading font-bold text-[#18232B]">
                  Validasi Keamanan Server-Side:
                </span>{' '}
                Setiap perpindahan status divalidasi melalui PostgreSQL Row Level Security (RLS) dan fungsi RPC transaksi. Riwayat persetujuan bersifat append-only dan tidak dapat dimodifikasi oleh pengaju departemen.
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Corporate Footer */}
      <footer className="bg-[#18232B] text-slate-400 border-t border-[#263640] py-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-[#263640]">
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-3">
                <RajaLogo variant="on-dark" heightClass="h-8" />
              </div>
              <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
                Perusahaan kontraktor jasa pertambangan nikel, penyewaan alat berat tambang, dan pekerjaan konstruksi sipil di Indonesia sejak Agustus 2010.
              </p>
              <div className="text-[11px] font-mono text-slate-500 pt-1">
                Kepmen ESDM No. 1827 K/30/MEM/2018 • SMKP Minerba
              </div>
            </div>

            <div className="md:col-span-4 space-y-2">
              <span className="font-heading font-bold text-white uppercase tracking-wider text-[11px]">
                Kantor & Lokasi Operasional
              </span>
              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#E88932] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-slate-200">Head Office Makassar:</span>
                    <p className="text-slate-400 text-[11px]">
                      Jl. Tupai No 71 A, Mamajang Luar, Kec. Mamajang, Kota Makassar, Sulawesi Selatan 90132
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#E88932] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-slate-200">Operational Site:</span>
                    <p className="text-slate-400 text-[11px]">
                      Site Morowali (Area Konsesi PT Hengjaya Mineralindo), Kabupaten Morowali, Sulawesi Tengah
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-3 space-y-2">
              <span className="font-heading font-bold text-white uppercase tracking-wider text-[11px]">
                Akses Cepat Sistem
              </span>
              <ul className="space-y-2 pt-1 text-xs">
                <li>
                  <a
                    href="https://rodajayasakti.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-1"
                  >
                    <span>Website Resmi rodajayasakti.id</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="text-[#E88932] hover:underline text-left cursor-pointer font-medium"
                  >
                    Masuk Portal RAJA ACADEMY
                  </button>
                </li>
                <li>
                  <a href="#profil" className="hover:text-white transition-colors">
                    Visi, Misi & Tata Nilai RAJA
                  </a>
                </li>
                <li>
                  <a href="#kpi" className="hover:text-white transition-colors">
                    Laporan KPI Training Center
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              &copy; 2026 PT. Roda Jaya Sakti (RAJA). Hak Cipta Dilindungi Undang-Undang.
            </div>
            <div className="font-mono">
              RAJA ACADEMY — Training Historical & Reporting Dashboard
            </div>
          </div>
        </div>
      </footer>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};
