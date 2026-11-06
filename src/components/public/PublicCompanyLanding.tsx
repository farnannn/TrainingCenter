import React, { useState } from 'react';
import { CompanyProfileHero } from '../company/CompanyProfileHero';
import { KpiAnalyticsCharts } from '../charts/KpiAnalyticsCharts';
import { LoginModal } from '../auth/LoginModal';
import {
  Award,
  Shield,
  Target,
  ArrowRight,
  LogIn,
  CheckCircle2,
  CalendarDays,
  FileCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  Truck,
  Pickaxe,
  HardHat,
  ExternalLink,
  ChevronRight,
  Lock,
  Clock,
  Layers,
  FileText
} from 'lucide-react';

export const PublicCompanyLanding: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  const stats = [
    { label: 'Jam Pelatihan YTD', value: '880 Jam', sub: 'Realisasi Program Kerja 2026' },
    { label: 'Tingkat Kelulusan POP', value: '94.2%', sub: 'Sertifikasi BNSP & Kemenaker' },
    { label: 'Rekor Keselamatan (HSE)', value: 'Zero Harm', sub: 'Budaya K3 Tambang 24/7' },
    { label: 'Kelaikan Operator', value: '100% SIMPER', sub: 'Lisensi Internal Site Morowali' },
  ];

  const featuredPrograms = [
    {
      code: 'TR-POP-01',
      title: 'Pengawas Operasional Pertama (POP) Pertambangan',
      category: 'Sertifikasi Nasional BNSP / ESDM',
      hours: '40 Jam',
      target: 'Foremen Pit, Supervisor Hauling & Maintenance',
      desc: 'Sertifikasi wajib penanggung jawab operasional lapangan sesuai Kepmen ESDM No. 1827 K/30/MEM/2018.'
    },
    {
      code: 'TR-DDT-01',
      title: 'Defensive Driving & Heavy Hauler Safety (Site Morowali)',
      category: 'K3LH & Mine Safety',
      hours: '16 Jam',
      target: 'Driver Dump Truck 6x4 & Operator Hauling Nikel',
      desc: 'Pelatihan keselamatan berkendara di area pit aktif dan jalan angkut tambang ekstrem bertonase tinggi.'
    },
    {
      code: 'TR-MNT-01',
      title: 'Preventive Maintenance & Hydraulic Diagnostics (CAT & Komatsu)',
      category: 'Teknik Alat Berat',
      hours: '32 Jam',
      target: 'Mekanik & Teknisi Plant Maintenance',
      desc: 'Pemecahan masalah sistem hidrolik, powertrain, dan kalibrasi sensor elektronik unit excavator 40T-80T.'
    },
    {
      code: 'TR-GEO-01',
      title: 'Slope Stability & Geotechnical Radar Monitoring',
      category: 'Teknik Pertambangan',
      hours: '24 Jam',
      target: 'Mine Engineers, Survey & Geologists',
      desc: 'Analisis kestabilan lereng pit tambang nikel laterit terbuka menggunakan instrumentasi radar dan prisma.'
    }
  ];

  const workflowSteps = [
    { step: '01', title: 'DRAFT', role: 'Dept User', desc: 'Penginputan rencana pelatihan & peserta oleh perwakilan departemen aktif.' },
    { step: '02', title: 'SUBMITTED', role: 'System', desc: 'Validasi kelengkapan berkas dan penguncian data peserta.' },
    { step: '03', title: 'HOD REVIEW', role: 'HOD TC', desc: 'Verifikasi kurikulum, anggaran, dan kelaikan instruktur oleh HOD Training Center.' },
    { step: '04', title: 'PENDING PJO', role: 'PJO', desc: 'Otorisasi akhir keselamatan operasional oleh satu akun PJO terpusat.' },
    { step: '05', title: 'APPROVED', role: 'Authorized', desc: 'Persetujuan resmi penuh tercapai. Berkas siap dijadwalkan.' },
    { step: '06', title: 'SCHEDULED', role: 'Training Center', desc: 'Penetapan jadwal kelas, ruang training Morowali, dan instruktur.' },
    { step: '07', title: 'IN PROGRESS', role: 'Trainer / Assessor', desc: 'Pelaksanaan kelas teori, praktik simulator/lapangan, dan presensi.' },
    { step: '08', title: 'COMPLETED', role: 'Evaluator', desc: 'Penerbitan sertifikasi, penilaian hasil, dan rekalkulasi otomatis KPI.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Corporate Strip */}
      <div className="bg-slate-900 text-slate-300 text-[11px] font-medium border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-white tracking-wide">PT. RODA JAYA SAKTI</span>
            <span className="text-slate-600">•</span>
            <span className="hidden sm:inline text-slate-400">Jasa Pertambangan, Rental Alat Berat & Infrastruktur Tambang</span>
          </div>

          <div className="flex items-center space-x-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>Morowali, Sulawesi Tengah & Makassar</span>
            </span>
            <span className="text-slate-700">|</span>
            <a
              href="https://rodajayasakti.id"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <span>rodajayasakti.id</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 font-black text-xs flex items-center justify-center border border-slate-800 shadow-xs">
                RAJA
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-base font-bold tracking-tight text-slate-900">PT. RODA JAYA SAKTI</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    THR PORTAL
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Training Center & Operational Governance</p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-600">
              <a href="#profil" className="hover:text-slate-900 transition-colors">Visi & Misi</a>
              <a href="#kpi" className="hover:text-slate-900 transition-colors">Kinerja KPI</a>
              <a href="#silabus" className="hover:text-slate-900 transition-colors">Silabus Pelatihan</a>
              <a href="#tata-kelola" className="hover:text-slate-900 transition-colors">Alur Persetujuan</a>
            </nav>

            {/* Login CTA */}
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span>Masuk Portal Internal</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 mb-4">
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span>Sistem Manajemen Pelatihan & Kompetensi Operasional</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Membangun Kompetensi SDM Tambang yang Profesional, Andal, & Berkelanjutan.
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
              Portal terintegrasi PT. Roda Jaya Sakti untuk pengajuan pelatihan departemen, verifikasi kurikulum HOD Training Center, dan otorisasi operasional terpusat oleh Penanggung Jawab Operasional (PJO) sesuai standar ESDM & BNSP.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <span>Akses Dashboard Internal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#profil"
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
              >
                Jelajahi Profil Perusahaan
              </a>
            </div>
          </div>

          {/* Operational Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-100">
            {stats.map((st, idx) => (
              <div key={idx} className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  {st.label}
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                  {st.value}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {st.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* SECTION 1: Company Profile (Visi, Misi, Services, Values, Safety) */}
        <section id="profil" className="scroll-mt-24">
          <div className="mb-4">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Profil & Landasan Korporat
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Tentang PT. Roda Jaya Sakti
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Komitmen integritas operasional dan pengembangan kompetensi SDM di wilayah tambang nikel Indonesia.
            </p>
          </div>

          <CompanyProfileHero />
        </section>

        {/* SECTION 2: Real-time KPI Analytics Charts */}
        <section id="kpi" className="scroll-mt-24">
          <div className="mb-4">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Monitoring Realisasi 2026
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Indikator Kinerja Utama (KPI) Pelatihan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pencatatan realisasi jam pelatihan, distribusi kurikulum, dan rasio kelulusan sertifikasi operasional.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs">
            <KpiAnalyticsCharts />
          </div>
        </section>

        {/* SECTION 3: Mining Training Curricula */}
        <section id="silabus" className="scroll-mt-24">
          <div className="mb-4">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Katalog Silabus Kompetensi
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Program Pelatihan Unggulan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Disusun mengacu pada standar kompetensi kerja nasional pertambangan minerba.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredPrograms.map((prog) => (
              <div
                key={prog.code}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {prog.code}
                    </span>
                    <span className="text-slate-500 font-medium">{prog.hours}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {prog.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {prog.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Target Peserta:</span>
                  <span className="font-medium text-slate-800">{prog.target}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: 8-Stage Sequential Approval Workflow */}
        <section id="tata-kelola" className="scroll-mt-24">
          <div className="mb-4">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Tata Kelola Pengajuan
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Alur Persetujuan Bertingkat (Sequential Governance)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Menegakkan kepatuhan prosedur melalui verifikasi bertahap tanpa bypass sistem.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {workflowSteps.map((ws) => (
                <div key={ws.step} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-amber-700">
                      Tahap {ws.step}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                      {ws.role}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{ws.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{ws.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-3 text-xs text-slate-600">
              <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">Prinsip Validasi Server-Side:</span> Setiap tahap diverifikasi melalui PostgreSQL Row Level Security (RLS) dan stored functions. Keputusan penolakan bersifat final, riwayat persetujuan bersifat append-only, dan pembukaan kembali hanya dapat dilakukan oleh Super Admin dengan alasan tertulis resmi.
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Corporate Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-800">
            {/* Column 1: Company Profile */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                  RAJA
                </div>
                <span className="font-bold text-white text-sm">PT. RODA JAYA SAKTI</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
                Perusahaan kontraktor jasa pertambangan nikel, penyewaan alat berat tambang, dan pekerjaan konstruksi sipil terkemuka di Indonesia Timur sejak Agustus 2010.
              </p>
              <div className="text-[11px] text-slate-500 pt-1">
                Kepatuhan Kepmen ESDM No. 1827 K/30/MEM/2018 • SMKP Minerba
              </div>
            </div>

            {/* Column 2: Head Office & Site Office */}
            <div className="md:col-span-4 space-y-2">
              <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                Kantor & Lokasi Operasional
              </span>
              <div className="space-y-3 pt-1">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-300">Head Office Makassar:</span>
                    <p className="text-slate-400 text-[11px]">Jl. Tupai No 71 A, Mamajang Luar, Kec. Mamajang, Kota Makassar, Sulawesi Selatan 90132</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-300">Operational Site:</span>
                    <p className="text-slate-400 text-[11px]">Site Morowali (Area Konsesi PT Hengjaya Mineralindo), Kabupaten Morowali, Sulawesi Tengah</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Quick Links & Portal Access */}
            <div className="md:col-span-3 space-y-2">
              <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                Tautan Korporat
              </span>
              <ul className="space-y-2 pt-1 text-[11px]">
                <li>
                  <a href="https://rodajayasakti.id" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                    <span>Website Resmi rodajayasakti.id</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
                <li>
                  <button onClick={() => setShowLoginModal(true)} className="hover:text-amber-400 transition-colors text-left cursor-pointer">
                    Portal Login Internal
                  </button>
                </li>
                <li>
                  <a href="#profil" className="hover:text-white transition-colors">Visi, Misi & Tata Nilai</a>
                </li>
                <li>
                  <a href="#kpi" className="hover:text-white transition-colors">Laporan KPI Terintegrasi</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              &copy; 2026 PT. Roda Jaya Sakti (RAJA). Hak Cipta Dilindungi Undang-Undang.
            </div>
            <div>
              Sistem Pelatihan & Sertifikasi Kerja Internal • Confidential
            </div>
          </div>
        </div>
      </footer>

      {/* Login Dialog Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};
