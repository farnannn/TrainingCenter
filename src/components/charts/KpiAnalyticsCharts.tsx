import React, { useState } from 'react';
import { mockStore } from '../../lib/mockStore';
import { BarChart3, TrendingUp, Award, Clock, PieChart, Users, ArrowUpRight } from 'lucide-react';

export const KpiAnalyticsCharts: React.FC = () => {
  const [hoveredQuarter, setHoveredQuarter] = useState<string | null>(null);

  // Dynamic metrics from mockStore
  const kpiResults = mockStore.kpiResults;
  const records = mockStore.records;

  // 1. Quarterly Performance Data
  const quarterlyData = [
    { quarter: 'Q1 2026', planned: 200, actual: 215, completion: '107%' },
    { quarter: 'Q2 2026', planned: 240, actual: 230, completion: '96%' },
    { quarter: 'Q3 2026', planned: 260, actual: 275, completion: '106%' },
    { quarter: 'Q4 2026 (Est)', planned: 280, actual: 160, completion: '57%' },
  ];

  // 2. Department Breakdown
  const deptBreakdown = [
    { code: 'MOD', name: 'Mining Operations', hours: 48, target: 40, barColor: 'bg-amber-600', pct: 120 },
    { code: 'MED', name: 'Plant & Maintenance', hours: 32, target: 35, barColor: 'bg-slate-700', pct: 91 },
    { code: 'HSE', name: 'Safety & Environment', hours: 45, target: 40, barColor: 'bg-emerald-600', pct: 112 },
    { code: 'HRGA', name: 'HR & General Affairs', hours: 24, target: 25, barColor: 'bg-slate-500', pct: 96 },
  ];

  // 3. Pass Rate Metric
  const totalEnrolled = records.length || 6;
  const totalPassed = records.filter(r => r.passed).length || 5;
  const passRate = Math.round((totalPassed / totalEnrolled) * 100);

  // 4. Category Distribution
  const categories = [
    { name: 'Sertifikasi POP / POM ESDM', count: 4, pct: 40, color: 'bg-amber-600' },
    { name: 'K3LH & Hauling Safety', count: 3, pct: 30, color: 'bg-slate-700' },
    { name: 'Geoteknik & Kestabilan Lereng', count: 2, pct: 20, color: 'bg-emerald-600' },
    { name: 'Sistem Manajemen SMKP Minerba', count: 1, pct: 10, color: 'bg-slate-500' },
  ];

  const maxQuarterVal = 300;

  return (
    <div className="space-y-6">
      {/* Header section with badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-slate-800" />
            <h3 className="text-base font-bold text-slate-900">
              Analitik & Visualisasi Kinerja Pelatihan
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan realisasi jam pelatihan, distribusi kurikulum tambang, dan tingkat kelulusan sertifikasi kompetensi.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Sinkronisasi Otomatis Database</span>
          </span>
        </div>
      </div>

      {/* Grid of Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CHART 1: Target vs Realization - 7 cols */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Target Realisasi vs Perencanaan
                </span>
                <h4 className="text-sm font-bold text-slate-800">
                  Jam Pelatihan Per Kuartal (Rencana vs Realisasi)
                </h4>
              </div>
              <div className="flex items-center space-x-4 text-[11px] font-medium">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded bg-slate-200" />
                  <span className="text-slate-500">Rencana (Jam)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded bg-amber-600" />
                  <span className="text-slate-900 font-semibold">Realisasi</span>
                </div>
              </div>
            </div>

            {/* Styled Bar Chart */}
            <div className="h-56 flex items-end justify-between gap-6 pt-6 pb-2 px-2 border-b border-slate-100">
              {quarterlyData.map((item) => {
                const plannedH = Math.round((item.planned / maxQuarterVal) * 100);
                const actualH = Math.round((item.actual / maxQuarterVal) * 100);
                const isHovered = hoveredQuarter === item.quarter;

                return (
                  <div
                    key={item.quarter}
                    onMouseEnter={() => setHoveredQuarter(item.quarter)}
                    onMouseLeave={() => setHoveredQuarter(null)}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="absolute -top-12 z-20 bg-slate-900 text-white text-[10px] py-1 px-2.5 rounded shadow-lg whitespace-nowrap">
                        <div className="font-bold">{item.quarter}</div>
                        <div>Realisasi: {item.actual}h / Target: {item.planned}h ({item.completion})</div>
                      </div>
                    )}

                    <div className="w-full flex items-end justify-center gap-2 h-full">
                      {/* Planned Bar */}
                      <div
                        style={{ height: `${plannedH}%` }}
                        className="w-4 sm:w-6 rounded-t bg-slate-200 transition-all duration-200"
                        title={`Target: ${item.planned} jam`}
                      />
                      {/* Actual Bar */}
                      <div
                        style={{ height: `${actualH}%` }}
                        className="w-4 sm:w-6 rounded-t bg-amber-600 hover:bg-amber-500 transition-all duration-200"
                        title={`Realisasi: ${item.actual} jam`}
                      />
                    </div>

                    <span className="text-[11px] font-semibold text-slate-600 mt-3 whitespace-nowrap">
                      {item.quarter}
                    </span>
                    <span className="text-[10px] font-bold text-slate-800">
                      {item.completion}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 flex flex-wrap justify-between items-center text-xs text-slate-500">
            <span>Target Tahunan Korporat: <strong className="text-slate-800">1.000 Jam</strong></span>
            <span className="font-semibold text-emerald-700 flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Realisasi Berjalan: 880 Jam (88% dari target)</span>
            </span>
          </div>
        </div>

        {/* CHART 2: Certification Pass Rate Radial / Donut Gauge - 5 cols */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Efektivitas Uji Kompetensi
                </span>
                <h4 className="text-sm font-bold text-slate-800">
                  Rasio Kelulusan Sertifikasi POP / POM
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                Standar ESDM: Min 90%
              </span>
            </div>

            {/* Radial SVG Donut Gauge */}
            <div className="flex items-center justify-center py-4">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="10"
                  />
                  {/* Progress Fill */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#059669"
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * passRate) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>

                {/* Center Percentage Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {passRate}%
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                    Lulus Tahap Pertama
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Total Peserta Terdaftar:</span>
              <span className="font-bold text-slate-800">{totalEnrolled} Peserta</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Tersertifikasi Kompeten (Lulus):</span>
              <span className="font-bold text-emerald-700">{totalPassed} Karyawan</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: Department Horizontal Performance & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Department Comparison Horizontal Bars - 7 cols */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center mb-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Partisipasi per Departemen
              </span>
              <h4 className="text-sm font-bold text-slate-800">
                Rata-Rata Jam Pelatihan per Karyawan
              </h4>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              Benchmark Site: 40 Jam / Thn
            </span>
          </div>

          <div className="space-y-4">
            {deptBreakdown.map((dept) => (
              <div key={dept.code} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 flex items-center space-x-2">
                    <span className="font-mono text-slate-500">[{dept.code}]</span>
                    <span>{dept.name}</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-900">{dept.hours} jam</span>
                    <span className="text-[11px] font-normal text-slate-400">/ {dept.target} target</span>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="w-full h-3 bg-slate-100 rounded overflow-hidden flex">
                  <div
                    style={{ width: `${Math.min(dept.pct, 100)}%` }}
                    className={`h-full ${dept.barColor} transition-all duration-300`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Sesuai standar pemenuhan kompetensi ESDM</span>
            <span className="font-semibold text-amber-700">MOD & HSE Memimpin Capaian</span>
          </div>
        </div>

        {/* Category Breakdown - 5 cols */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Komposisi Silabus
                </span>
                <h4 className="text-sm font-bold text-slate-800">
                  Distribusi Topik Pelatihan Aktif
                </h4>
              </div>
              <PieChart className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-3">
              {categories.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center space-x-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                    <span className="font-medium text-slate-700">{cat.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-slate-900 font-mono">{cat.pct}%</span>
                    <span className="text-[11px] text-slate-400">({cat.count} modul)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Kurikulum disetujui HOD TC & PJO</span>
            <span className="font-semibold text-slate-700">Terdaftar di Mining Portal</span>
          </div>
        </div>

      </div>
    </div>
  );
};
