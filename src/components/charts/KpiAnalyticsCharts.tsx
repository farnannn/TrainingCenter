import React, { useState } from 'react';
import { mockStore } from '../../lib/mockStore';
import { BarChart3, TrendingUp, PieChart, CheckCircle2 } from 'lucide-react';

export const KpiAnalyticsCharts: React.FC = () => {
  const [hoveredQuarter, setHoveredQuarter] = useState<string | null>(null);

  const records = mockStore.records;

  // 1. Quarterly Performance Data
  const quarterlyData = [
    { quarter: 'Q1 2026', planned: 200, actual: 215, completion: '107%' },
    { quarter: 'Q2 2026', planned: 240, actual: 230, completion: '96%' },
    { quarter: 'Q3 2026', planned: 260, actual: 275, completion: '106%' },
    { quarter: 'Q4 2026 (Est)', planned: 280, actual: 160, completion: '57%' },
  ];

  // 2. Department Breakdown using Industrial Slate & Safety Orange palette
  const deptBreakdown = [
    { code: 'MOD', name: 'Mining Operations', hours: 48, target: 40, barColor: 'bg-[#E88932]', pct: 120 },
    { code: 'MED', name: 'Plant & Maintenance', hours: 32, target: 35, barColor: 'bg-[#263640]', pct: 91 },
    { code: 'HSE', name: 'Safety & Environment', hours: 45, target: 40, barColor: 'bg-[#397C69]', pct: 112 },
    { code: 'HRGA', name: 'HR & General Affairs', hours: 24, target: 25, barColor: 'bg-[#527FA1]', pct: 96 },
  ];

  // 3. Pass Rate Metric
  const totalEnrolled = records.length || 6;
  const totalPassed = records.filter((r) => r.passed).length || 5;
  const passRate = Math.round((totalPassed / totalEnrolled) * 100);

  // 4. Category Distribution
  const categories = [
    { name: 'Sertifikasi POP / POM ESDM', count: 4, pct: 40, color: 'bg-[#E88932]' },
    { name: 'K3LH & Hauling Safety', count: 3, pct: 30, color: 'bg-[#263640]' },
    { name: 'Geoteknik & Kestabilan Lereng', count: 2, pct: 20, color: 'bg-[#397C69]' },
    { name: 'Sistem Manajemen SMKP Minerba', count: 1, pct: 10, color: 'bg-[#527FA1]' },
  ];

  const maxQuarterVal = 300;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#E88932]" />
            <h3 className="text-base font-heading font-semibold text-[#18232B]">
              Analitik & Visualisasi Kinerja Pelatihan
            </h3>
          </div>
          <p className="text-xs text-[#5A6B75] mt-0.5">
            Monitoring realisasi jam pelatihan kuartalan, distribusi kurikulum tambang, dan tingkat kelulusan uji kompetensi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-white text-[#397C69] text-xs font-medium border border-[#E2E8E8]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#397C69]" />
            <span>Data Real-Time Terintegrasi</span>
          </span>
        </div>
      </div>

      {/* Row 1: Target vs Realization + Certification Pass Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHART 1: Target vs Realization - 7 cols */}
        <div className="lg:col-span-7 bg-white p-6 rounded-[12px] border border-[#E2E8E8] flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
              <div>
                <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#5A6B75]">
                  TARGET REALISASI VS PERENCANAAN
                </span>
                <h4 className="text-sm font-heading font-semibold text-[#18232B] mt-0.5">
                  Jam Pelatihan Per Kuartal (Planned vs Actual)
                </h4>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-[3px] bg-[#E2E8E8]" />
                  <span className="text-[#5A6B75]">Rencana (Jam)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-[3px] bg-[#E88932]" />
                  <span className="text-[#18232B] font-medium">Realisasi</span>
                </div>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="h-56 flex items-end justify-between gap-6 pt-6 pb-2 px-2 border-b border-[#E2E8E8]">
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
                    {isHovered && (
                      <div className="absolute -top-12 z-20 bg-[#18232B] text-white text-[11px] py-1.5 px-3 rounded-[6px] shadow-md whitespace-nowrap font-mono">
                        <div className="font-semibold text-[#E88932]">{item.quarter}</div>
                        <div>
                          Actual: {item.actual}h / Plan: {item.planned}h ({item.completion})
                        </div>
                      </div>
                    )}

                    <div className="w-full flex items-end justify-center gap-2 h-full">
                      <div
                        style={{ height: `${plannedH}%` }}
                        className="w-4 sm:w-6 rounded-t-[4px] bg-[#E2E8E8] transition-all duration-200"
                        title={`Rencana: ${item.planned} jam`}
                      />
                      <div
                        style={{ height: `${actualH}%` }}
                        className="w-4 sm:w-6 rounded-t-[4px] bg-[#E88932] group-hover:bg-[#D47621] transition-all duration-200"
                        title={`Realisasi: ${item.actual} jam`}
                      />
                    </div>

                    <span className="text-xs font-medium text-[#263640] mt-3 whitespace-nowrap">
                      {item.quarter}
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-[#18232B] tabular-nums">
                      {item.completion}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 flex flex-wrap justify-between items-center text-xs text-[#5A6B75]">
            <span>
              Target Tahunan Korporat:{' '}
              <strong className="font-mono text-[#18232B] tabular-nums">1.000 Jam</strong>
            </span>
            <span className="font-medium text-[#397C69] flex items-center gap-1 tabular-nums">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Realisasi YTD: 880 Jam (88% dari target)</span>
            </span>
          </div>
        </div>

        {/* CHART 2: Certification Pass Rate Donut Gauge - 5 cols */}
        <div className="lg:col-span-5 bg-white p-6 rounded-[12px] border border-[#E2E8E8] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#5A6B75]">
                  EFEKTIVITAS UJI KOMPETENSI
                </span>
                <h4 className="text-sm font-heading font-semibold text-[#18232B] mt-0.5">
                  Rasio Kelulusan Sertifikasi POP / POM
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#F4F6F5] text-[#263640] border border-[#E2E8E8]">
                Target: 90%
              </span>
            </div>

            <div className="flex items-center justify-center py-4">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#F4F6F5"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#397C69"
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * passRate) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-heading font-bold text-[#18232B] tabular-nums tracking-tight">
                    {passRate}%
                  </span>
                  <span className="text-[10px] font-mono text-[#5A6B75] uppercase tracking-wider mt-0.5">
                    First-Attempt Pass
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-[#E2E8E8] text-xs">
            <div className="flex justify-between">
              <span className="text-[#5A6B75]">Total Peserta Terdaftar:</span>
              <span className="font-mono font-semibold text-[#18232B] tabular-nums">
                {totalEnrolled} Peserta
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5A6B75]">Tersertifikasi Kompeten (Lulus):</span>
              <span className="font-mono font-semibold text-[#397C69] tabular-nums">
                {totalPassed} Karyawan
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Department Comparison & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Horizontal Bars - 7 cols */}
        <div className="lg:col-span-7 bg-white p-6 rounded-[12px] border border-[#E2E8E8]">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-5">
            <div>
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#5A6B75]">
                PARTISIPASI PER DEPARTEMEN
              </span>
              <h4 className="text-sm font-heading font-semibold text-[#18232B] mt-0.5">
                Rata-Rata Jam Pelatihan per Karyawan
              </h4>
            </div>
            <span className="text-xs font-mono text-[#5A6B75]">
              Benchmark Site: 40 Jam / Thn
            </span>
          </div>

          <div className="space-y-4">
            {deptBreakdown.map((dept) => (
              <div key={dept.code} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[#18232B] flex items-center gap-2">
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#F4F6F5] text-[#263640] border border-[#E2E8E8]">
                      {dept.code}
                    </span>
                    <span>{dept.name}</span>
                  </span>
                  <div className="flex items-center gap-2 font-mono tabular-nums">
                    <span className="font-semibold text-[#18232B]">{dept.hours} jam</span>
                    <span className="text-[11px] text-[#5A6B75]">/ {dept.target} target</span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-[#F4F6F5] rounded-[4px] overflow-hidden flex">
                  <div
                    style={{ width: `${Math.min(dept.pct, 100)}%` }}
                    className={`h-full ${dept.barColor} transition-all duration-300`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-3 border-t border-[#E2E8E8] flex items-center justify-between text-xs text-[#5A6B75]">
            <span>Sesuai standar pemenuhan kompetensi ESDM</span>
            <span className="font-medium text-[#E88932]">MOD & HSE Melampaui Target</span>
          </div>
        </div>

        {/* Category Breakdown - 5 cols */}
        <div className="lg:col-span-5 bg-white p-6 rounded-[12px] border border-[#E2E8E8] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#5A6B75]">
                  KOMPOSISI SILABUS
                </span>
                <h4 className="text-sm font-heading font-semibold text-[#18232B] mt-0.5">
                  Distribusi Topik Pelatihan Aktif
                </h4>
              </div>
              <PieChart className="w-4 h-4 text-[#5A6B75]" />
            </div>

            <div className="space-y-2.5">
              {categories.map((cat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-[8px] bg-[#F4F6F5] border border-[#E2E8E8] text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                    <span className="font-medium text-[#18232B]">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono tabular-nums">
                    <span className="font-semibold text-[#18232B]">{cat.pct}%</span>
                    <span className="text-[11px] text-[#5A6B75]">({cat.count} modul)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E2E8E8] text-xs text-[#5A6B75] flex items-center justify-between">
            <span>Kurikulum disetujui HOD TC & PJO</span>
            <span className="font-mono text-[11px] text-[#263640]">SMKP Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
