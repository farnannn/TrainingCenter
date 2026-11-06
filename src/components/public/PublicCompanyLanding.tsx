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
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Truck,
  Pickaxe,
  HardHat,
  ExternalLink
} from 'lucide-react';

export const PublicCompanyLanding: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  const stats = [
    { label: 'Jam Pelatihan YTD', value: '880+ Jam', sub: 'Target 1.000 Jam Operasional 2026' },
    { label: 'Kelulusan Sertifikasi POP', value: '92%', sub: 'Standar BNSP & Dirjen Minerba' },
    { label: 'Keselamatan Kerja (HSE)', value: 'Zero Harm', sub: 'Budaya K3 Tambang Nikel 24/7' },
    { label: 'Armada & Operator', value: '100% Certified', sub: 'SIMPER & Induksi Tambang Aktif' },
  ];

  const featuredPrograms = [
    {
      code: 'TR-POP-01',
      title: 'Pengawas Operasional Pertama (POP) Pertambangan',
      category: 'Sertifikasi Nasional BNSP/ESDM',
      hours: '40 Jam',
      target: 'Foremen Pit, Supervisor Hauling & Maintenance',
      desc: 'Sertifikasi wajib penanggung jawab operasional lapangan sesuai Kepmen ESDM 1827 K/2018.',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
    },
    {
      code: 'TR-DDT-01',
      title: 'Defensive Driving & Heavy Hauler Safety (Site Morowali)',
      category: 'K3LH & Mine Safety',
      hours: '16 Jam',
      target: 'Driver Dump Truck & Operator Hauling Nikel',
      desc: 'Pelatihan manuver keselamatan berkendara di area pit aktif dan jalan angkut tambang ekstrem bertonase tinggi.',
      badgeColor: 'bg-sky-100 text-sky-900 border-sky-300'
    },
    {
      code: 'TR-GEO-01',
      title: 'Slope Stability & Geotechnical Radar Monitoring',
      category: 'Teknik Pertambangan',
      hours: '24 Jam',
      target: 'Mine Engineers, Survey & Geologists',
      desc: 'Analisis kestabilan lereng pit tambang nikel laterit terbuka menggunakan teknologi radar dan instrumentasi prisma.',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Corporate Strip */}
      <div className="bg-amber-500 text-slate-950 text-[11px] font-extrabold px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-amber-600">
        <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-2 px-2">
          <div className="flex items-center space-x-3">
            <span className="tracking-wide uppercase">PT. RODA JAYA SAKTI (RAJA)</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline font-medium">Mining Services Contractor, Heavy Equipment Rental & Infrastructure</span>
          </div>
          <div className="flex items-center space-x-3 text-[10px]">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-900" />
              Site Morowali (Sulawesi Tengah) & Head Office Makassar
            </span>
            <span>|</span>
            <a
              href="https://rodajayasakti.id"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-bold hover:text-white flex items-center gap-0.5"
            >
              <span>rodajayasakti.id</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Public Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-[2px] shadow-lg shadow-amber-500/25">
                <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                  <span className="font-black text-amber-400 text-base tracking-tighter">RAJA</span>
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-black tracking-tight text-white">PT. RODA JAYA SAKTI</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-wider">
                    THR SYSTEM
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Training Center & Operational Certification Governance</p>
              </div>
            </div>

            {/* Nav Links & Login Trigger */}
            <div className="flex items-center space-x-6">
              <nav className="hidden md:flex items-center space-x-6 text-xs font-bold text-slate-300">
                <a href="#profil" className="hover:text-amber-400 transition-colors">Visi & Misi</a>
                <a href="#kpi" className="hover:text-amber-400 transition-colors">Kinerja KPI</a>
                <a href="#programs" className="hover:text-amber-400 transition-colors">Program Pelatihan</a>
                <a href="#workflow" className="hover:text-amber-400 transition-colors">Alur Otorisasi</a>
              </nav>

              <button
                onClick={() => setShowLoginModal(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-slate-950" />
                <span>Masuk Portal Internal</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Public Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Banner Hero */}
        <section className="text-center py-8 sm:py-12 max-w-4xl mx-auto space-y-5">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Pusat Keunggulan Pelatihan & Sertifikasi Operasi Tambang Nikel</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Kontraktor Jasa Pertambangan Terkemuka & Berkelanjutan di <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">Indonesia</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Portal resmi tata kelola Training & Human Resources (THR) PT. Roda Jaya Sakti. Mengawal kepatuhan K3 pertambangan, akreditasi sertifikasi POP/POM ESDM, serta alur persetujuan pelatihan bertingkat dengan integritas tinggi.
          </p>

          {/* Quick Action CTA */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <span>Login Pegawai / Uji Coba Demo Akun</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
            <a
              href="#kpi"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs transition-all"
            >
              Lihat Capaian KPI 2026
            </a>
          </div>
        </section>

        {/* Quick Numbers Bar */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, idx) => (
            <div key={idx} className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xs text-center backdrop-blur-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">{s.value}</div>
              <span className="text-[11px] text-slate-300 font-semibold mt-1 inline-block">{s.sub}</span>
            </div>
          ))}
        </section>

        {/* Company Profile Section: Visi, Misi, Layanan & Tata Nilai RAJA */}
        <section id="profil" className="scroll-mt-24">
          <CompanyProfileHero />
        </section>

        {/* KPI Performance Section with Industrial Dark Styling */}
        <section id="kpi" className="scroll-mt-24 bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-slate-800 backdrop-blur-sm">
          <KpiAnalyticsCharts />
        </section>

        {/* Featured Training Programs Section */}
        <section id="programs" className="scroll-mt-24 bg-slate-900/90 p-8 rounded-3xl border border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-wrap justify-between items-end gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                Silabus Unggulan PT. Roda Jaya Sakti
              </span>
              <h2 className="text-xl font-extrabold text-white mt-1">
                Katalog Program Pelatihan & Uji Kompetensi Tambang
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Kurikulum terstandarisasi yang diselenggarakan Training Center RAJA bersama LSP ESDM dan Kemnaker RI.
              </p>
            </div>
            <button
              onClick={() => setShowLoginModal(true)}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1 cursor-pointer"
            >
              <span>Ajukan Pelatihan Lewat Portal Internal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredPrograms.map((prog, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-950/80 hover:border-amber-500/40 transition-all flex flex-col justify-between group shadow-2xs"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${prog.badgeColor}`}>
                      {prog.category}
                    </span>
                    <span className="text-[11px] font-bold text-amber-400 font-mono">
                      {prog.hours}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    {prog.title}
                  </h3>

                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {prog.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between items-center">
                  <span>Target: <strong className="text-slate-200">{prog.target}</strong></span>
                  <span className="font-mono text-amber-400/80 font-bold">{prog.code}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sequential Workflow Explanation Section */}
        <section id="workflow" className="scroll-mt-24 bg-gradient-to-br from-slate-900 to-zinc-950 text-white p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
          <div className="max-w-2xl">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
              Tata Kelola Otorisasi Bertingkat
            </span>
            <h2 className="text-xl font-extrabold text-white mt-1">
              Alur Persetujuan Pelatihan Resmi (Strict Sequential Approval)
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Sistem menjamin kepatuhan otorisasi mutlak. Setiap pengajuan dari perwakilan departemen wajib melalui tinjauan kurikulum HOD Training Center sebelum disahkan secara final oleh PJO terpusat.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
                01
              </div>
              <h4 className="text-xs font-bold text-white">Pengajuan Departemen</h4>
              <p className="text-[11px] text-slate-400 leading-snug">
                1 Perwakilan aktif departemen (MOD, MED, HRGA) memilih daftar personil dan menyusun rencana pelatihan.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs border border-sky-500/30">
                02
              </div>
              <h4 className="text-xs font-bold text-white">Review HOD TC (Stage 1)</h4>
              <p className="text-[11px] text-slate-400 leading-snug">
                Verifikasi kelayakan materi, instruktur, dan anggaran. Keputusan: Setujui, Minta Revisi, atau Tolak.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/20 text-yellow-300 flex items-center justify-center font-bold text-xs border border-yellow-500/30">
                03
              </div>
              <h4 className="text-xs font-bold text-white">Otorisasi Final PJO (Stage 2)</h4>
              <p className="text-[11px] text-slate-400 leading-snug">
                PJO terpusat memberikan persetujuan operasional final. PJO hanya dapat memproses aplikasi yang telah lolos HOD.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                04
              </div>
              <h4 className="text-xs font-bold text-white">Penjadwalan & Sertifikat</h4>
              <p className="text-[11px] text-slate-400 leading-snug">
                Aplikasi yang approved dieksekusi di Training Center, diterbitkan sertifikasi, dan otomatis memperbarui nilai KPI.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action Bar */}
        <section className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 rounded-3xl p-8 sm:p-10 text-slate-950 flex flex-wrap items-center justify-between gap-6 shadow-2xl">
          <div className="max-w-xl space-y-2">
            <h2 className="text-2xl font-black">
              Akses Portal Internal THR PT. Roda Jaya Sakti
            </h2>
            <p className="text-xs text-slate-900 font-medium leading-relaxed">
              Masuk menggunakan akun demo Super Admin, HOD Training Center, PJO, atau Department User untuk mencoba alur persetujuan dan pelacakan sertifikasi.
            </p>
          </div>

          <button
            onClick={() => setShowLoginModal(true)}
            className="px-6 py-3.5 rounded-xl bg-slate-950 text-white font-extrabold text-xs shadow-xl hover:bg-slate-900 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-amber-400" />
            <span>Buka Dialog Login Pegawai</span>
          </button>
        </section>

      </main>

      {/* Corporate Footer (Official rodajayasakti.id details) */}
      <footer className="mt-16 bg-slate-950 text-slate-400 border-t border-slate-800 text-xs py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 text-white font-bold text-base mb-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                RAJA
              </span>
              <span>PT. RODA JAYA SAKTI</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Kontraktor Jasa Pertambangan, Rental Alat Berat & Konstruksi Infrastruktur terpercaya di Indonesia Timur. Berdiri sejak Agustus 2010.
            </p>
            <div className="mt-3">
              <a
                href="https://rodajayasakti.id"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 font-bold inline-flex items-center gap-1"
              >
                <span>Kunjungi Website Resmi: rodajayasakti.id</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <span className="font-bold text-white uppercase tracking-wider block mb-1">Kantor Pusat & Operasional Site</span>
            <p className="flex items-start space-x-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span><strong>Head Office:</strong> Jl. Tupai No 71 A, Makassar, Sulawesi Selatan, Indonesia</span>
            </p>
            <p className="flex items-start space-x-2">
              <Pickaxe className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span><strong>Operational Site:</strong> Site Morowali (Tangofa & Bahodopi), Sulawesi Tengah</span>
            </p>
            <p className="flex items-center space-x-2">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>hrd@rodajayasakti.id / training@rodajayasakti.id</span>
            </p>
          </div>

          <div className="text-right md:text-right space-y-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-mono">
              STANDAR KEPATUHAN PENAMBANGAN
            </span>
            <p className="text-[11px] text-slate-400">
              Permen ESDM No. 26/2018 • Kepmen ESDM 1827 K/30/MEM/2018 • SKKNI K3 Pertambangan Minerba
            </p>
            <p className="text-[10px] text-slate-500 pt-2">
              © 2010 - 2026 PT. Roda Jaya Sakti (RAJA). All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};
