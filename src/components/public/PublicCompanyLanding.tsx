import React, { useState } from 'react';
import { CompanyProfileHero } from '../company/CompanyProfileHero';
import { KpiAnalyticsCharts } from '../charts/KpiAnalyticsCharts';
import { LoginModal } from '../auth/LoginModal';
import { Button } from '../ui/Button';
import { KpiCard } from '../ui/KpiCard';
import { RajaLogo } from '../ui/RajaLogo';
import { mockStore } from '../../lib/mockStore';
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
  Target,
  ZoomIn,
  X,
  Building2,
} from 'lucide-react';

export const PublicCompanyLanding: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFacilityZoom, setShowFacilityZoom] = useState(false);

  // Live real-time metrics from main database (Internal PT. RJS — Deduplicated Unique Personel)
  const liveSummary = mockStore.calculateTrainingAchievement({
    year: '2026',
    companyScope: 'INTERNAL_RJS',
  });

  const featuredPrograms = [
    {
      code: 'TR-POP-01',
      title: 'Pengawas Operasional Pertama (POP) & Sertifikasi BNSP',
      category: 'Sertifikasi Nasional BNSP / ESDM',
      hours: '40 Jam',
      target: 'Foreman Pit, Supervisor Hauling & Maintenance',
      desc: 'Sertifikasi wajib penanggung jawab operasional lapangan sesuai Kepmen ESDM No. 1827 K/30/MEM/2018.',
    },
    {
      code: 'TR-PLM-02',
      title: 'Program Technical Training Mechanic & OJT Siswa BMC',
      category: 'Plant Maintenance (PLM)',
      hours: '80 Jam',
      target: 'Crew Mekanik PLM & Siswa Basic Mechanic Course',
      desc: 'Pembekalan teori sistem hidrolik, kelistrikan, powertrain, troubleshooting unit alat berat, serta OJT terukur di workshop.',
    },
    {
      code: 'TR-SKA-03',
      title: 'Skill Audit & Refresh Operator Heavy Equipment',
      category: 'Mine Operation (MOD)',
      hours: '40 Jam',
      target: 'Operator ADT, Excavator, Bulldozer & Driver DT',
      desc: 'Evaluasi berkala pasca skill audit dan penyegaran prosedur darurat operasional unit tambang di Site Tangofa & Site Gemba.',
    },
    {
      code: 'TR-SIM-04',
      title: 'Assessment SIMPER, Cross Training & Skill Up Operator',
      category: 'MOD & K3LH Tambang',
      hours: '32 Jam',
      target: 'Kandidat Operator Baru & Operator Multi-Unit',
      desc: 'Uji praktik kelayakan SIMPER, program familiarisasi lintas unit (Excavator ke Rock Breaker / Dozer), dan peningkatan grade.',
    },
    {
      code: 'TR-ORI-05',
      title: 'Orientasi New Hire Field, Re-Training & Joint Investigasi',
      category: 'Safety & Field Operation',
      hours: '48 Jam',
      target: 'Operator / Driver Baru & Personel Pasca Insiden',
      desc: 'Monitoring jam terbang lapangan minimal 60 HM sebelum pelepasan mandiri serta pembinaan intensif Refresh Class & Practical.',
    },
    {
      code: 'TR-GRN-06',
      title: 'Pembekalan FGDP & Green Operator ADT Batch VI',
      category: 'RAJA Academy Talent Center',
      hours: '80 Jam',
      target: 'Fresh Graduate Development & Siswa Green Operator',
      desc: 'Kurikulum terstruktur dari kelas teori dasar, pengenalan komponen P2H, hingga manuver sirkuit khusus Simper L.',
    },
  ];

  const workflowSteps = [
    { step: '01', title: 'DRAFT', role: 'Dept User', desc: 'Penginputan rencana pelatihan & peserta oleh perwakilan departemen aktif.' },
    { step: '02', title: 'SUBMITTED', role: 'System', desc: 'Validasi kelengkapan berkas dan penguncian daftar peserta.' },
    { step: '03', title: 'HOD REVIEW', role: 'HOD TC', desc: 'Verifikasi kurikulum, anggaran, dan kelaikan instruktur oleh HOD Training Center.' },
    { step: '04', title: 'PENDING PJO', role: 'PJO', desc: 'Otorisasi akhir keselamatan operasional oleh Penanggung Jawab Operasional.' },
    { step: '05', title: 'APPROVED', role: 'Authorized', desc: 'Persetujuan resmi penuh tercapai dan siap dijadwalkan di lokasi site.' },
    { step: '06', title: 'SCHEDULED', role: 'Training Center', desc: 'Penetapan jadwal kelas, sirkuit praktik (Tangofa / Gemba / TPM), dan instruktur.' },
    { step: '07', title: 'IN PROGRESS', role: 'Trainer / Assessor', desc: 'Pelaksanaan kelas teori, praktik lapangan, skill audit, dan monitoring HM.' },
    { step: '08', title: 'COMPLETED', role: 'Evaluator', desc: 'Penerbitan sertifikasi/SIMPER, evaluasi hasil, dan rekalkulasi otomatis Capaian KPI.' },
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
              <span>Site Tangofa • Gemba • TPM (Morowali) & HO Makassar</span>
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <a
              href="https://rodajayasakti.id"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E88932] hover:underline font-medium hidden sm:flex items-center gap-1"
            >
              <span>rodajayasakti.id</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8E8] shadow-2xs">
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
                    CORPORATE PORTAL
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
                Analitik KPI
              </a>
              <a href="#silabus" className="hover:text-[#E88932] transition-colors">
                Program Utama
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

      {/* Architectural Hero Section — Showcasing Official RAJA ACADEMY Training Center */}
      <section className="relative bg-[#18232B] text-white border-b border-[#263640] overflow-hidden">
        {/* Subtle ambient glow & topographic texture (no distracting background clutter) */}
        <div
          className="absolute inset-0 opacity-[0.12] bg-cover bg-right blur-md scale-105 pointer-events-none"
          style={{
            backgroundImage: `url('/images/raja-academy-hero.jpg')`,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 12% 25%, rgba(232, 137, 50, 0.16) 0%, transparent 45%), radial-gradient(circle at 88% 75%, rgba(57, 124, 105, 0.16) 0%, transparent 45%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#18232B]/95 via-[#18232B]/90 to-[#18232B]/80 bg-topography pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column (5 Cols): Executive Headline, Compliance Standards & CTAs */}
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E88932]/15 border border-[#E88932]/35 text-[11px] font-mono font-semibold text-[#E88932]">
                <HardHat className="w-3.5 h-3.5 shrink-0" />
                <span>RAJA ACADEMY • TRAINING CENTER</span>
              </div>

              <h1 className="text-2xl sm:text-3xl xl:text-[34px] font-heading font-bold text-white tracking-tight leading-[1.2]">
                Tata Kelola Pelatihan & Sertifikasi Operasional Pertambangan Terpadu
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Portal resmi <strong className="text-white">PT. Roda Jaya Sakti</strong> untuk perencanaan kompetensi 7 divisi, monitoring aktual <strong className="text-white">Technical & Operation Trainer</strong> lintas site (Tangofa, Gemba, TPM), evaluasi HOD Training Center, serta otorisasi akhir PJO sesuai standar keselamatan ESDM & BNSP.
              </p>

              {/* Compliance & Site Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] font-mono">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#263640]/90 border border-white/10 text-slate-200">
                  <Shield className="w-3 h-3 text-[#6CD4B4]" />
                  <span>Kepmen ESDM 1827 K/2018</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#263640]/90 border border-white/10 text-slate-200">
                  <Award className="w-3 h-3 text-[#E88932]" />
                  <span>BNSP & SMKP Minerba</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
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
                  className="inline-flex items-center justify-center h-[46px] px-5 rounded-[10px] bg-[#263640] hover:bg-[#314552] text-white text-sm font-medium border border-white/15 transition-colors"
                >
                  Lihat Visi, Misi & Profil
                </a>
              </div>
            </div>

            {/* Right Column (7 Cols): Uncropped Full-Color RAJA ACADEMY Facility Panorama */}
            <div className="lg:col-span-7">
              <div className="relative rounded-[16px] overflow-hidden border border-white/15 bg-[#121B22] shadow-2xl group">
                <div
                  onClick={() => setShowFacilityZoom(true)}
                  className="relative aspect-[1024/434] w-full overflow-hidden cursor-pointer bg-[#18232B]"
                >
                  <img
                    src="/images/raja-academy-hero.jpg"
                    alt="RAJA ACADEMY — Training Center for Mining & Heavy Equipment"
                    className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121B22]/55 via-transparent to-transparent opacity-70 group-hover:opacity-40 transition-opacity" />

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFacilityZoom(true);
                    }}
                    className="absolute top-3 right-3 px-2.5 py-1.5 rounded-[8px] bg-[#18232B]/80 hover:bg-[#18232B] text-white text-[11px] font-mono flex items-center gap-1.5 border border-white/15 backdrop-blur-xs transition-all cursor-pointer shadow-md"
                    title="Perbesar Foto Fasilitas RAJA ACADEMY"
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-[#E88932]" />
                    <span className="hidden sm:inline">Perbesar</span>
                  </button>
                </div>

                {/* Bottom Caption Bar inside Showcase Card */}
                <div className="px-4 py-3 bg-[#121B22]/95 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-[#397C69] shrink-0 animate-pulse" />
                    <span className="font-heading font-semibold text-white truncate">
                      RAJA ACADEMY — Training Center for Mining & Heavy Equipment
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#E88932] shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Site Tangofa • Gemba • TPM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Executive KPI Summary Cards — 100% Connected to Live Database */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Realisasi Program Training"
            value={`${liveSummary.totalRealization} / ${liveSummary.totalPlan}`}
            comparison={
              liveSummary.achievementPercentage !== null
                ? `${liveSummary.achievementPercentage}% Capaian Selesai`
                : 'Tahun Berjalan 2026'
            }
            trend="up"
            trendIsGood={true}
            subtitle={`${liveSummary.totalInProgress} Program Sedang Berjalan`}
            icon={<Target className="w-4 h-4" />}
            tone="success"
          />
          <KpiCard
            title="Personel Internal Dilatih"
            value={`${liveSummary.totalManpowerTrained} Personel`}
            comparison={`Target: ${liveSummary.totalManpowerPlanned} Personel Unik`}
            trend="up"
            trendIsGood={true}
            subtitle={`Personel Unik • ${liveSummary.totalAttendanceSessions} Sesi Kehadiran`}
            icon={<Users className="w-4 h-4" />}
            tone="info"
          />
          <KpiCard
            title="Realisasi Jam Pelatihan (YTD)"
            value={`${liveSummary.totalTrainingHours} Jam`}
            comparison={`Rencana: ${liveSummary.totalPlannedHours} Jam`}
            trend="up"
            trendIsGood={true}
            subtitle="Akumulasi Jam Pelatihan Aktual"
            icon={<Clock className="w-4 h-4" />}
            tone="orange"
          />
          <KpiCard
            title="Cakupan Site & Divisi"
            value="3 Site • 7 Divisi"
            comparison="Tangofa, Gemba & TPM"
            trend="neutral"
            subtitle="HRGA-IT, MED, MOD, PLM, CIVIL, TC, HSE"
            icon={<Building2 className="w-4 h-4" />}
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

        {/* SECTION 3: Mining Training Curricula (6 Core Pillars of RAJA ACADEMY) */}
        <section id="silabus" className="scroll-mt-20">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <span className="text-[11px] font-mono font-semibold text-[#E88932] uppercase tracking-wider">
                KATALOG SILABUS & PROGRAM KOMPETENSI
              </span>
              <h2 className="text-xl font-heading font-bold text-[#18232B] mt-0.5">
                6 Pilar Program Pelatihan & Sertifikasi Utama RAJA ACADEMY
              </h2>
            </div>
            <span className="text-xs font-mono text-[#5A6B75]">
              Standar Kurikulum Internal TC, BNSP & Kepmen ESDM
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredPrograms.map((prog) => (
              <div
                key={prog.code}
                className="bg-white p-5 rounded-[12px] border border-[#E2E8E8] flex flex-col justify-between hover:border-[#E88932]/60 hover:shadow-xs transition-all"
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

                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#397C69] font-semibold mb-1">
                    {prog.category}
                  </div>

                  <h3 className="text-sm font-heading font-bold text-[#18232B] leading-snug">
                    {prog.title}
                  </h3>

                  <p className="text-xs text-[#5A6B75] mt-2 leading-relaxed">
                    {prog.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E2E8E8] flex items-center justify-between gap-2 text-xs">
                  <span className="text-[#5A6B75] shrink-0">Sasaran:</span>
                  <span className="font-medium text-[#18232B] text-right truncate">
                    {prog.target}
                  </span>
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
                  className="p-4 bg-[#F4F6F5] rounded-[10px] border border-[#E2E8E8] hover:border-[#CBD5E1] transition-colors"
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
                  Validasi Keamanan & Integritas Data:
                </span>{' '}
                Setiap perpindahan status divalidasi melalui Role-Based Access Control (RBAC), audit trail yang tercatat otomatis, serta deduplikasi personel unik agar laporan capaian manajemen selalu akurat.
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
                <RajaLogo variant="on-dark" heightClass="h-9" />
                <div className="leading-tight">
                  <div className="text-sm font-heading font-bold text-white tracking-tight">
                    PT. RODA JAYA SAKTI
                  </div>
                  <div className="text-[10px] font-mono text-[#E88932]">
                    RAJA ACADEMY • TRAINING CENTER
                  </div>
                </div>
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
                    <span className="font-medium text-slate-200">Operational & Training Sites:</span>
                    <p className="text-slate-400 text-[11px]">
                      Site Tangofa, Site Gemba & Site TPM — Kabupaten Morowali, Sulawesi Tengah
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

      {/* Full-Screen Lightbox Preview for RAJA ACADEMY Facility Panorama */}
      {showFacilityZoom && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setShowFacilityZoom(false)}
        >
          <div className="relative max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setShowFacilityZoom(false)}
              className="absolute -top-10 right-0 text-white hover:text-[#E88932] cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src="/images/raja-academy-hero.jpg"
              alt="RAJA ACADEMY — Training Center for Mining & Heavy Equipment"
              className="w-full max-h-[84vh] rounded-xl object-contain border border-white/20 shadow-2xl"
            />
            <p className="text-xs text-slate-200 font-medium text-center mt-3">
              Fasilitas RAJA ACADEMY — Gedung Training Center & Heavy Equipment Practice Yard (PT. Roda Jaya Sakti)
            </p>
          </div>
        </div>
      )}

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};
