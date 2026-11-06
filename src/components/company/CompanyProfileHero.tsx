import React, { useState } from 'react';
import { RajaLogo } from '../ui/RajaLogo';
import {
  Target,
  Compass,
  Shield,
  Truck,
  HardHat,
  Pickaxe,
  MapPin,
  Building,
  CheckCircle2,
  Award,
} from 'lucide-react';

export const CompanyProfileHero: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'visi-misi' | 'services' | 'values' | 'safety'>('visi-misi');

  const coreValues = [
    {
      code: 'R',
      title: 'Respect & Safety First',
      desc: 'Menghargai keselamatan setiap insan pekerja tambang, masyarakat lokal lingkar tambang, dan kelestarian lingkungan hidup tanpa kompromi.',
      tag: 'Zero Harm Culture',
    },
    {
      code: 'A',
      title: 'Agility & Operational Speed',
      desc: 'Ketangkasan dalam merespons target operasional hauling dan kesiapan mekanikal armada alat berat dengan presisi tinggi.',
      tag: 'Fleet Readiness',
    },
    {
      code: 'J',
      title: 'Justice & Good Mining Practice',
      desc: 'Integritas dan keadilan dalam tata kelola operasi pertambangan yang transparan, bertanggung jawab, dan patuh regulasi ESDM.',
      tag: 'ESDM 1827 K/2018',
    },
    {
      code: 'A',
      title: 'Accountability & Excellence',
      desc: 'Tanggung jawab penuh terhadap mutu hasil kerja, kelaikan operasional armada, dan pengembangan kompetensi tenaga kerja berkelanjutan.',
      tag: 'BNSP Certified',
    },
  ];

  const services = [
    {
      title: 'Nickel Ore Hauling & Logistics',
      category: 'MINING TRANSPORT',
      desc: 'Pengangkutan bijih nikel skala industri dari front penambangan menuju stockpile dan jetty dengan armada dump truck bertonase tinggi yang terawat ketat.',
      specs: 'Armada Dump Truck 6x4 & Heavy Duty • Kapasitas Jutaan WMT/Tahun',
    },
    {
      title: 'Heavy Equipment Rental & Fleet Management',
      category: 'EARTH MOVING',
      desc: 'Penyediaan dan manajemen armada alat berat kelas tambang dalam kondisi prima, didukung tim mekanik bersertifikasi dan suku cadang orisinal.',
      specs: 'Excavator 20T - 80T (CAT, Komatsu), Bulldozer D85, Wheel Loader, Motor Grader',
    },
    {
      title: 'Civil Infrastructure & Jetty Construction',
      category: 'MINE INFRASTRUCTURE',
      desc: 'Konstruksi dan pemeliharaan jalan angkut (hauling road), drainase tambang, jembatan timbang, sediment pond, serta fasilitas dermaga tongkang (jetty).',
      specs: 'Road Compaction, Cut & Fill, Water Management & Marine Loading Facilities',
    },
    {
      title: 'Land Clearing & Pit Preparation',
      category: 'MINE DEVELOPMENT',
      desc: 'Pembersihan lahan terencana, pengupasan dan penyimpanan tanah pucuk (top soil stripping) sesuai rancang bangun tambang ramah lingkungan.',
      specs: 'Erosion Control, Progressive Land Clearing & Soil Conservation',
    },
  ];

  const safetyPillars = [
    {
      title: 'Zero Harm Commitment',
      desc: 'Prioritas tertinggi pada keselamatan kerja setiap karyawan melalui analisis keselamatan kerja (JSA) berkala dan induksi K3 wajib.',
      highlight: 'Target Zero LTI & Zero Fatality',
    },
    {
      title: 'Kepatuhan Regulasi ESDM',
      desc: 'Operasional mengacu ketat pada Kepmen ESDM No. 1827 K/30/MEM/2018 tentang Kaidah Pertambangan yang Baik (Good Mining Practice).',
      highlight: 'Kepmen ESDM 1827 K/2018',
    },
    {
      title: 'Kualifikasi & SIMPER Tambang',
      desc: 'Seluruh operator alat berat dan pengawas pit wajib memiliki SIMPER aktif dan lulus uji kompetensi BNSP (POP/POM) yang terdaftar.',
      highlight: '100% Certified Operator & Supervisor',
    },
  ];

  return (
    <div className="bg-white rounded-[12px] border border-[#E2E8E8] overflow-hidden">
      {/* Structured Hero Header with Mining Photography & Topographic Overlay */}
      <div className="relative bg-[#18232B] text-white px-6 py-6 sm:px-8 border-b border-[#263640] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#18232B] via-[#18232B]/90 to-[#263640]/90 bg-topography" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <RajaLogo variant="on-dark" heightClass="h-8" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-heading font-bold text-white tracking-tight">
                  PT. RODA JAYA SAKTI
                </h2>
                <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded bg-[#263640] text-[#E88932] border border-white/10">
                  EST. AGUSTUS 2010
                </span>
              </div>
              <p className="text-xs text-slate-300 flex flex-wrap items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#E88932]" />
                  <span>Site Morowali (Sulawesi Tengah) & Head Office Makassar</span>
                </span>
                <span className="text-slate-500">•</span>
                <span className="font-mono text-[11px] text-slate-300">
                  Mining, Heavy Equipment & Civil Construction
                </span>
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center bg-[#263640] p-1 rounded-[10px] border border-white/10 text-xs">
            {[
              { id: 'visi-misi', label: 'Visi & Misi' },
              { id: 'services', label: 'Layanan Tambang' },
              { id: 'values', label: 'Tata Nilai RAJA' },
              { id: 'safety', label: 'K3LH Tambang' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3.5 py-1.5 rounded-[8px] font-medium transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#E88932] text-white font-semibold shadow-2xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area in Clean White & Off-White Cards */}
      <div className="p-6 sm:p-8 bg-white">
        {/* TAB 1: VISI & MISI */}
        {activeTab === 'visi-misi' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Visi Card */}
            <div className="lg:col-span-5 bg-[#F4F6F5] p-6 rounded-[12px] border border-[#E2E8E8]">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-[#E2E8E8] text-[11px] font-mono font-semibold text-[#E88932] uppercase tracking-wider">
                <Target className="w-3.5 h-3.5" />
                <span>Visi Perusahaan</span>
              </div>

              <h3 className="text-base sm:text-lg font-heading font-bold text-[#18232B] mt-3 leading-relaxed">
                "Menjadi Kontraktor Jasa Pertambangan yang terkemuka, terpercaya, dan berkelanjutan di Indonesia."
              </h3>

              <p className="mt-3 text-xs text-[#5A6B75] leading-relaxed">
                Berkomitmen menghadirkan keunggulan operasional alat berat dan pengangkutan nikel secara profesional, efisien, serta berdaya saing tinggi di kawasan industri pertambangan Indonesia.
              </p>

              <div className="mt-6 pt-4 border-t border-[#E2E8E8] text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#5A6B75]">Akta Pendirian:</span>
                  <span className="font-mono font-medium text-[#18232B]">No. 20 (Agustus 2010)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5A6B75]">Konsesi Operasional:</span>
                  <span className="font-medium text-[#18232B]">Site Morowali, Sulawesi Tengah</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5A6B75]">SK Menkumham:</span>
                  <span className="font-mono font-medium text-[#18232B]">AHU-42514.AH.01.01.2010</span>
                </div>
              </div>
            </div>

            {/* 5 Misi List */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-heading font-semibold uppercase tracking-wider text-[#263640]">
                  5 Misi Utama PT. Roda Jaya Sakti
                </span>
                <span className="text-[11px] font-mono text-[#5A6B75]">
                  Corporate Mandate
                </span>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    no: '01',
                    title: 'Layanan Berkualitas Tinggi & Standar HSE Terbaik',
                    desc: 'Menyediakan layanan pertambangan berkualitas tinggi dengan standar keselamatan kerja tertinggi (HSE) dan efisiensi operasional maksimal.',
                  },
                  {
                    no: '02',
                    title: 'Pengembangan SDM Profesional & Sejahtera',
                    desc: 'Mengembangkan sumber daya manusia yang kompeten, profesional, dan berorientasi pada kesejahteraan pekerja.',
                  },
                  {
                    no: '03',
                    title: 'Praktik Operasional Ramah Lingkungan',
                    desc: 'Menerapkan praktik operasional penambangan yang bertanggung jawab terhadap lingkungan dan reklamasi berkelanjutan.',
                  },
                  {
                    no: '04',
                    title: 'Kemitraan Strategis yang Saling Menguntungkan',
                    desc: 'Membangun kemitraan strategis jangka panjang yang saling menguntungkan dengan klien, pemegang konsesi, dan pemangku kepentingan.',
                  },
                  {
                    no: '05',
                    title: 'Peluang Kerja Berkualitas bagi Masyarakat Lokal',
                    desc: 'Menciptakan peluang kerja nyata dan pelatihan vokasi kejuruan bagi komunitas lokal di sekitar wilayah tambang.',
                  },
                ].map((m) => (
                  <div
                    key={m.no}
                    className="p-3.5 bg-[#F4F6F5]/70 hover:bg-[#F4F6F5] rounded-[10px] border border-[#E2E8E8] flex items-start gap-3.5 transition-colors"
                  >
                    <span className="w-7 h-7 rounded-[6px] bg-[#18232B] text-[#E88932] font-mono font-semibold text-xs flex items-center justify-center shrink-0">
                      {m.no}
                    </span>
                    <div>
                      <h4 className="text-xs font-heading font-semibold text-[#18232B]">
                        {m.title}
                      </h4>
                      <p className="text-xs text-[#5A6B75] mt-0.5 leading-relaxed">
                        {m.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LAYANAN TAMBANG */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#E88932]">
                PORTOFOLIO OPERASIONAL PERTAMBANGAN
              </span>
              <h3 className="text-base font-heading font-bold text-[#18232B] mt-0.5">
                Layanan Terintegrasi dari Front Penambangan hingga Jetty
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((srv, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-[#F4F6F5] rounded-[12px] border border-[#E2E8E8] flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[11px] font-mono font-semibold text-[#E88932]">
                      {srv.category}
                    </span>
                    <h4 className="text-sm font-heading font-bold text-[#18232B] mt-1">
                      {srv.title}
                    </h4>
                    <p className="text-xs text-[#5A6B75] mt-2 leading-relaxed">
                      {srv.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#E2E8E8] text-[11px] font-mono text-[#263640] font-medium">
                    {srv.specs}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TATA NILAI RAJA */}
        {activeTab === 'values' && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#E88932]">
                BUDAYA KERJA KORPORAT
              </span>
              <h3 className="text-base font-heading font-bold text-[#18232B] mt-0.5">
                Empat Pilar Tata Nilai "RAJA"
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {coreValues.map((val, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-[12px] bg-[#F4F6F5] border border-[#E2E8E8] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-9 h-9 rounded-[8px] bg-[#18232B] text-[#E88932] font-heading font-bold text-sm flex items-center justify-center">
                        {val.code}
                      </span>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-white text-[#263640] border border-[#E2E8E8]">
                        {val.tag}
                      </span>
                    </div>
                    <h4 className="text-xs font-heading font-bold text-[#18232B]">
                      {val.title}
                    </h4>
                    <p className="text-xs text-[#5A6B75] mt-2 leading-relaxed">
                      {val.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: K3LH & KEPATUHAN */}
        {activeTab === 'safety' && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#397C69]">
                KESELAMATAN PERTAMBANGAN & LINGKUNGAN HIDUP (K3LH)
              </span>
              <h3 className="text-base font-heading font-bold text-[#18232B] mt-0.5">
                Standar Sistem Manajemen Keselamatan Pertambangan (SMKP Minerba)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {safetyPillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-[#F4F6F5] rounded-[12px] border border-[#E2E8E8] flex flex-col justify-between"
                >
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold text-[#397C69]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{pillar.highlight}</span>
                    </span>
                    <h4 className="text-sm font-heading font-bold text-[#18232B] mt-2">
                      {pillar.title}
                    </h4>
                    <p className="text-xs text-[#5A6B75] mt-2 leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#E2E8E8] text-[11px] font-mono text-[#5A6B75]">
                    Mandatory Site Protocol • Morowali
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
