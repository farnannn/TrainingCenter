import React, { useState } from 'react';
import { Target, Compass, Award, Shield, Truck, HardHat, Pickaxe, MapPin, Building, CheckCircle2, ChevronRight, Users, Scale, FileText } from 'lucide-react';

export const CompanyProfileHero: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'visi-misi' | 'services' | 'values' | 'safety'>('visi-misi');

  const coreValues = [
    {
      code: 'R',
      title: 'Respect & Safety First',
      desc: 'Menghargai keselamatan setiap insan pekerja tambang, masyarakat lokal lingkar tambang, dan kelestarian lingkungan hidup tanpa kompromi.',
      accent: 'border-l-4 border-amber-500 bg-slate-800/60'
    },
    {
      code: 'A',
      title: 'Agility & Operational Speed',
      desc: 'Ketangkasan dalam merespons target operasional hauling dan kesiapan mekanikal armada alat berat dengan presisi tinggi.',
      accent: 'border-l-4 border-slate-400 bg-slate-800/60'
    },
    {
      code: 'J',
      title: 'Justice & Good Mining Practice',
      desc: 'Integritas dan keadilan dalam tata kelola operasi pertambangan yang transparan, bertanggung jawab, dan patuh regulasi ESDM.',
      accent: 'border-l-4 border-emerald-500 bg-slate-800/60'
    },
    {
      code: 'A',
      title: 'Accountability & Excellence',
      desc: 'Tanggung jawab penuh terhadap mutu hasil kerja, kelaikan operasional armada, dan pengembangan kompetensi tenaga kerja berkelanjutan.',
      accent: 'border-l-4 border-sky-500 bg-slate-800/60'
    }
  ];

  const services = [
    {
      title: 'Nickel Ore Hauling & Logistics',
      category: 'Mining Transport',
      desc: 'Pengangkutan bijih nikel skala industri dari front penambangan menuju stockpile dan jetty dengan armada dump truck bertonase tinggi yang terawat ketat.',
      specs: 'Armada Dump Truck 6x4 & Heavy Duty • Kapasitas Jutaan WMT/Tahun'
    },
    {
      title: 'Heavy Equipment Rental & Fleet Management',
      category: 'Earth Moving',
      desc: 'Penyediaan dan manajemen armada alat berat kelas tambang dalam kondisi prima, didukung tim mekanik bersertifikasi dan suku cadang orisinal.',
      specs: 'Excavator 20T - 80T (CAT, Komatsu), Bulldozer D85, Wheel Loader, Motor Grader'
    },
    {
      title: 'Civil Infrastructure & Jetty Construction',
      category: 'Mine Infrastructure',
      desc: 'Konstruksi dan pemeliharaan jalan angkut (hauling road), drainase tambang, jembatan timbang, sediment pond, serta fasilitas dermaga tongkang (jetty).',
      specs: 'Road Compaction, Cut & Fill, Water Management & Marine Loading Facilities'
    },
    {
      title: 'Land Clearing & Pit Preparation',
      category: 'Mine Development',
      desc: 'Pembersihan lahan terencana, pengupasan dan penyimpanan tanah pucuk (top soil stripping) sesuai rancang bangun tambang ramah lingkungan.',
      specs: 'Erosion Control, Progressive Land Clearing & Soil Conservation'
    }
  ];

  const safetyPillars = [
    {
      title: 'Zero Harm Commitment',
      desc: 'Prioritas tertinggi pada keselamatan kerja setiap karyawan melalui analisis keselamatan kerja (JSA) berkala dan induksi K3 wajib.',
      highlight: 'Target Zero LTI & Zero Fatality'
    },
    {
      title: 'Kepatuhan Regulasi ESDM',
      desc: 'Operasional mengacu ketat pada Kepmen ESDM No. 1827 K/30/MEM/2018 tentang Kaidah Pertambangan yang Baik (Good Mining Practice).',
      highlight: 'Kepmen ESDM 1827 K/2018'
    },
    {
      title: 'Kualifikasi & SIMPER Tambang',
      desc: 'Seluruh operator alat berat dan pengawas pit wajib memiliki SIMPER aktif dan lulus uji kompetensi BNSP (POP/POM) yang terdaftar.',
      highlight: '100% Certified Operator & Supervisor'
    }
  ];

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-sm overflow-hidden mb-8">
      {/* Top Corporate Strip */}
      <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center tracking-tight shadow-sm">
            RAJA
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-sm tracking-tight">PT. RODA JAYA SAKTI</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                Didirikan Agustus 2010
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>Site Morowali (Sulawesi Tengah)</span>
              <span>•</span>
              <span>Head Office Makassar</span>
              <span>•</span>
              <span className="text-slate-300">Training & Competency Center</span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('visi-misi')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'visi-misi'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Visi & Misi
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'services'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Layanan Tambang
          </button>
          <button
            onClick={() => setActiveTab('values')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'values'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tata Nilai RAJA
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'safety'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            K3LH Tambang
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-6 lg:p-8">
        {/* TAB 1: VISI & MISI */}
        {activeTab === 'visi-misi' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Visi Statement */}
            <div className="lg:col-span-5 bg-slate-950/70 p-6 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Visi Korporat
              </span>
              <h3 className="text-base font-bold text-white mt-2 leading-relaxed">
                "Menjadi Kontraktor Jasa Pertambangan yang terkemuka, terpercaya, dan berkelanjutan di Indonesia."
              </h3>
              <p className="mt-4 text-xs text-slate-400 leading-relaxed">
                Berkomitmen menghadirkan keunggulan operasional alat berat dan pengangkutan nikel secara profesional, efisien, serta berdaya saing tinggi di kawasan industri pertambangan Indonesia.
              </p>

              <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
                <div className="flex items-center justify-between">
                  <span>Akta Pendirian:</span>
                  <span className="font-semibold text-slate-200">No. 20 (Agustus 2010)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Konsesi Operasional:</span>
                  <span className="font-semibold text-slate-200">Site Morowali, Sulawesi Tengah</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pengesahan Menkumham:</span>
                  <span className="font-semibold text-slate-200">AHU-42514.AH.01.01.Tahun 2010</span>
                </div>
              </div>
            </div>

            {/* 5 Misi */}
            <div className="lg:col-span-7 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                5 Misi Utama PT. Roda Jaya Sakti
              </span>

              <div className="space-y-2.5">
                {[
                  {
                    no: '01',
                    title: 'Layanan Berkualitas Tinggi & Standar HSE Terbaik',
                    desc: 'Menyediakan layanan pertambangan berkualitas tinggi dengan standar keselamatan kerja tertinggi (HSE) dan efisiensi operasional maksimal.'
                  },
                  {
                    no: '02',
                    title: 'Pengembangan SDM Profesional & Sejahtera',
                    desc: 'Mengembangkan sumber daya manusia yang kompeten, profesional, dan berorientasi pada kesejahteraan pekerja.'
                  },
                  {
                    no: '03',
                    title: 'Praktik Operasional Ramah Lingkungan',
                    desc: 'Menerapkan praktik operasional penambangan yang bertanggung jawab terhadap lingkungan dan reklamasi berkelanjutan.'
                  },
                  {
                    no: '04',
                    title: 'Kemitraan Strategis yang Saling Menguntungkan',
                    desc: 'Membangun kemitraan strategis jangka panjang yang saling menguntungkan dengan klien, pemegang konsesi, dan pemangku kepentingan.'
                  },
                  {
                    no: '05',
                    title: 'Peluang Kerja Berkualitas bagi Masyarakat Lokal',
                    desc: 'Menciptakan peluang kerja nyata dan pelatihan vokasi kejuruan bagi komunitas lokal di sekitar wilayah tambang.'
                  }
                ].map((m) => (
                  <div key={m.no} className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/80 flex items-start space-x-3.5">
                    <span className="text-xs font-mono font-bold text-amber-400 pt-0.5">
                      {m.no}
                    </span>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">{m.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LAYANAN TAMBANG */}
        {activeTab === 'services' && (
          <div>
            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Portofolio Jasa Pertambangan Terintegrasi
              </span>
              <p className="text-xs text-slate-400 mt-1">
                Layanan komprehensif dari front penambangan hingga fasilitas pemuatan kapal tongkang (jetty).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((srv, idx) => (
                <div key={idx} className="p-5 bg-slate-950/50 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">
                      {srv.category}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">{srv.title}</h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{srv.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-amber-400/90">
                    {srv.specs}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TATA NILAI RAJA */}
        {activeTab === 'values' && (
          <div>
            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Budaya Korporasi (Corporate Values)
              </span>
              <p className="text-xs text-slate-400 mt-1">
                Pedoman etika kerja dan kepemimpinan operasional di seluruh wilayah kerja PT. Roda Jaya Sakti.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {coreValues.map((val, idx) => (
                <div key={idx} className={`p-4 rounded-xl border border-slate-800 ${val.accent}`}>
                  <span className="text-lg font-black text-amber-400 font-mono">
                    {val.code}
                  </span>
                  <h4 className="text-xs font-bold text-white mt-1">{val.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: K3LH & KEPATUHAN */}
        {activeTab === 'safety' && (
          <div>
            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Keselamatan, Kesehatan Kerja & Lingkungan Hidup (K3LH)
              </span>
              <p className="text-xs text-slate-400 mt-1">
                Menerapkan sistem manajemen keselamatan pertambangan (SMKP Minerba) secara disiplin dan terukur.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {safetyPillars.map((pillar, idx) => (
                <div key={idx} className="p-5 bg-slate-950/50 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                      {pillar.highlight}
                    </span>
                    <h4 className="text-xs font-bold text-white mt-1.5">{pillar.title}</h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{pillar.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 font-semibold">
                    Standardized Site Protocol
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
