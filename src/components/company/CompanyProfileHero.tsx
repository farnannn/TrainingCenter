import React, { useState } from 'react';
import { Target, Compass, Award, Shield, Sparkles, Truck, HardHat, Pickaxe, MapPin, Building, CheckCircle2, Zap } from 'lucide-react';

export const CompanyProfileHero: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'visi-misi' | 'services' | 'values' | 'safety'>('visi-misi');

  const coreValues = [
    {
      code: 'R',
      title: 'Reliability & Safety First',
      desc: 'Keandalan armada alat berat dan komitmen zero harm tanpa kompromi di seluruh pit tambang nikel.',
      color: 'from-amber-500 to-yellow-500',
      tag: 'Zero Accident'
    },
    {
      code: 'A',
      title: 'Agility & Operational Speed',
      desc: 'Daya tanggap tinggi dalam pemenuhan target hauling, pemeliharaan alat, dan kesiapan operasional.',
      color: 'from-orange-500 to-amber-600',
      tag: 'High Productivity'
    },
    {
      code: 'J',
      title: 'Just & Good Mining Practice',
      desc: 'Penerapan standar tata kelola penambangan yang bertanggung jawab, transparan, dan patuh regulasi ESDM.',
      color: 'from-emerald-500 to-teal-600',
      tag: 'ESDM Compliance'
    },
    {
      code: 'A',
      title: 'Action for People & Excellence',
      desc: 'Pemberdayaan tenaga kerja lokal dan pengembangan kompetensi bersertifikasi BNSP secara berkelanjutan.',
      color: 'from-sky-500 to-blue-600',
      tag: 'Local Empowerment'
    }
  ];

  const services = [
    {
      title: 'Nickel Ore Hauling',
      desc: 'Pengangkutan bijih nikel skala besar dari front tambang menuju stockpile/jetty secara efisien dan terjadwal.',
      icon: <Truck className="w-5 h-5 text-amber-400" />,
      tag: 'Armada Dump Truck DT/HD'
    },
    {
      title: 'Heavy Equipment Rental',
      desc: 'Penyewaan unit alat berat terawat prima: Excavator (20-80T), Bulldozer, Wheel Loader, Motor Grader, dan Compactor.',
      icon: <Pickaxe className="w-5 h-5 text-amber-400" />,
      tag: 'Fleet Performa Tinggi'
    },
    {
      title: 'Infrastructure & Jetty Construction',
      desc: 'Pembangunan jalan angkut (*hauling road*), jembatan tambang, dan dermaga tongkang (*jetty*) untuk pemuatan ore.',
      icon: <Building className="w-5 h-5 text-amber-400" />,
      tag: 'Civil & Marine Works'
    },
    {
      title: 'Land Clearing & Pit Preparation',
      desc: 'Pembersihan lahan, pengupasan tanah pucuk (*top soil stripping*), dan persiapan pit penambangan secara aman.',
      icon: <HardHat className="w-5 h-5 text-amber-400" />,
      tag: 'Mine Development'
    }
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 text-white shadow-2xl border border-slate-800/80 mb-8">
      {/* Mining gold & ambient light glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Industrial Dot Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px]"
      />

      <div className="relative p-6 sm:p-8 lg:p-10">
        {/* Header Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="flex items-center space-x-3.5">
            {/* Custom RAJA Mining Shield Logo */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-[2px] shadow-lg shadow-amber-500/25">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                <span className="font-black text-amber-400 tracking-tighter text-sm">RAJA</span>
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white">
                  PT. RODA JAYA SAKTI
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  MINING • HEAVY EQUIPMENT • CONSTRUCTION
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  Head Office: Makassar • Operational Site: Morowali
                </span>
                <span>•</span>
                <span className="text-amber-400/90 font-semibold">Training Center of Excellence</span>
              </p>
            </div>
          </div>

          {/* Navigation Pill Controls */}
          <div className="flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('visi-misi')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'visi-misi'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Visi & Misi</span>
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Layanan Tambang</span>
            </button>
            <button
              onClick={() => setActiveTab('values')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'values'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Tata Nilai RAJA</span>
            </button>
            <button
              onClick={() => setActiveTab('safety')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'safety'
                  ? 'bg-emerald-600 text-white shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>K3LH Tambang</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Visi & Misi Resmi (rodajayasakti.id) */}
        {activeTab === 'visi-misi' && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visi Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900/90 to-zinc-950 p-6 rounded-2xl border border-amber-500/20 backdrop-blur-md relative group hover:border-amber-500/40 transition-all shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/30">
                <Target className="w-5 h-5" />
              </div>
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400 mb-1">
                Visi Perusahaan (Official Vision)
              </div>
              <h3 className="text-lg font-bold text-white leading-snug">
                "Menjadi Kontraktor Jasa Pertambangan yang Terkemuka, Terpercaya, dan Berkelanjutan di Indonesia."
              </h3>
              <p className="mt-3 text-xs text-slate-400 leading-relaxed italic">
                "Delivering operational excellence that creates lasting value for our partners, employees, and communities."
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Didirikan sejak Agustus 2010 • Berkembang pesat di Indonesia Timur</span>
              </div>
            </div>

            {/* Misi List (5 Misi Resmi) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400 flex items-center space-x-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>5 Misi Utama PT. Roda Jaya Sakti</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
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
                  <div key={m.no} className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/30 transition-all flex items-start space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-extrabold text-xs flex items-center justify-center shrink-0 border border-amber-500/30">
                      {m.no}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{m.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Core Mining Services */}
        {activeTab === 'services' && (
          <div className="mt-8 space-y-4">
            <div className="text-center max-w-xl mx-auto mb-6">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400">
                Portofolio Bisnis Tambang
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                Layanan Terpadu PT. Roda Jaya Sakti
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Didukung oleh ratusan unit alat berat dan ribuan operator profesional yang tersertifikasi secara berkesinambungan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {services.map((srv, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-zinc-950 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-amber-500/20 transition-colors">
                      {srv.icon}
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 inline-block mb-2">
                      {srv.tag}
                    </span>
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                      {srv.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      {srv.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Tata Nilai RAJA */}
        {activeTab === 'values' && (
          <div className="mt-8">
            <div className="text-center max-w-xl mx-auto mb-6">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400">
                Budaya & Prinsip Kerja
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                Tata Nilai Korporasi "RAJA"
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Fondasi profesionalisme yang diintegrasikan ke dalam kurikulum pelatihan dan standar pengawasan lapangan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {coreValues.map((val, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-zinc-950 border border-slate-800/90 hover:border-amber-500/40 transition-all relative group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${val.color} text-slate-950 font-black text-sm flex items-center justify-center shadow-md`}>
                      {val.code}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {val.tag}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                    {val.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    {val.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: K3LH & PJO Governance */}
        {activeTab === 'safety' && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/70 to-slate-900 border border-emerald-900/50">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero Accident & Safety Culture</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Setiap operator alat berat dan pengawas pit wajib menyelesaikan induksi keselamatan tambang dan memiliki SIMPER (*Surat Izin Mengemudi Perusahaan*) aktif.
              </p>
              <div className="mt-4 pt-3 border-t border-emerald-900/40 text-[10px] text-emerald-400 font-semibold font-mono">
                Mandatory Safety Induction & SIMPER
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/70 to-slate-900 border border-amber-900/50">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>PJO Supreme Operational Mandate</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Penanggung Jawab Operasional (PJO) memegang otorisasi penuh atas standar kompetensi teknis dan kepatuhan K3 penambangan sesuai Kepmen ESDM No. 1827 K/30/MEM/2018.
              </p>
              <div className="mt-4 pt-3 border-t border-amber-900/40 text-[10px] text-amber-400 font-semibold font-mono">
                Kepmen ESDM 1827 K/30/MEM/2018
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-950/70 to-slate-900 border border-sky-900/50">
              <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Good Mining Practice & ESG</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pelatihan berkelanjutan dalam pengelolaan lereng pit tambang nikel, sediment pond, drainase air asam tambang, dan rehabilitasi lingkungan operasional.
              </p>
              <div className="mt-4 pt-3 border-t border-sky-900/40 text-[10px] text-sky-400 font-semibold font-mono">
                ESG Sustainable Mining Compliance
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
