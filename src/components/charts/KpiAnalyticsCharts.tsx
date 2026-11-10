import React, { useState } from 'react';
import { mockStore } from '../../lib/mockStore';
import { BarChart3, TrendingUp, PieChart, CheckCircle2 } from 'lucide-react';

export const KpiAnalyticsCharts: React.FC = () => {
  const [hoveredQuarter, setHoveredQuarter] = useState<string | null>(null);

  const summary = mockStore.calculateTrainingAchievement({
    year: '2026',
    companyScope: 'INTERNAL_RJS',
  });
  const activeEmployees = mockStore.employees.filter((e) => e.is_active);

  // 1. Dynamic Quarterly Performance Data (Q1..Q4 from actual training items)
  const quartersConfig = [
    { label: 'Q1 (Jan-Mar)', months: ['01', '02', '03'] },
    { label: 'Q2 (Apr-Jun)', months: ['04', '05', '06'] },
    { label: 'Q3 (Jul-Sep)', months: ['07', '08', '09'] },
    { label: 'Q4 (Okt-Des)', months: ['10', '11', '12'] },
  ];

  const quarterlyData = quartersConfig.map((q) => {
    const qItems = summary.trainingItems.filter((item) => {
      const month = (item.startDate || '').split('-')[1];
      return q.months.includes(month);
    });
    const planned = qItems.reduce((sum, i) => sum + i.plannedHours, 0);
    const actual = qItems.reduce((sum, i) => sum + i.actualHours, 0);
    const pct = planned > 0 ? Math.round((actual / planned) * 100) : 0;
    return {
      quarter: q.label,
      planned,
      actual,
      pct,
      completion: `${pct}%`,
    };
  });

  const maxQuarterVal = Math.max(
    ...quarterlyData.map((q) => Math.max(q.planned, q.actual)),
    40
  );

  const totalPlannedHours = summary.totalPlannedHours;
  const totalActualHours = summary.totalTrainingHours;
  const hoursAchievementPct =
    totalPlannedHours > 0 ? Math.round((totalActualHours / totalPlannedHours) * 100) : 0;

  // 2. Dynamic 7-Division Breakdown (HRGA-IT, MED, MOD, PLM, CIVIL, TC, HSE)
  const barColors = [
    'bg-[#527FA1]',
    'bg-[#263640]',
    'bg-[#E88932]',
    'bg-[#C27820]',
    'bg-[#397C69]',
    'bg-[#18232B]',
    'bg-[#2C6B58]',
  ];

  const deptBreakdown = summary.departmentBreakdown.map((d, idx) => {
    const empCount = activeEmployees.filter((e) => e.department_id === d.departmentId).length;
    const pct = d.achievementPct !== null ? Math.round(d.achievementPct) : 0;
    return {
      code: d.code,
      name: d.name,
      empCount,
      plan: d.plan,
      realization: d.realization,
      hours: d.actualHours,
      target: d.plannedHours,
      barColor: barColors[idx % barColors.length],
      pct,
    };
  });

  // 3. Dynamic Achievement & Competency Pass Rate Donut Gauge
  const overallAchievementPct =
    summary.achievementPercentage !== null ? Math.round(summary.achievementPercentage) : 0;

  // 4. Dynamic Category Distribution from actual training items
  const categoryDefs = [
    { key: 'certification', name: 'Sertifikasi POP / POM & BNSP', color: 'bg-[#E88932]' },
    { key: 'safety', name: 'K3LH & Hauling Safety', color: 'bg-[#263640]' },
    { key: 'technical', name: 'Technical, Plant & Operations', color: 'bg-[#397C69]' },
    { key: 'compliance', name: 'Regulasi & SMKP Minerba', color: 'bg-[#527FA1]' },
    { key: 'leadership', name: 'Supervisory & Leadership', color: 'bg-[#C27820]' },
  ];

  const totalItemsCount = summary.trainingItems.length;
  const categories = categoryDefs.map((cat) => {
    const count = summary.trainingItems.filter((i) =>
      i.trainingCategory.toLowerCase().includes(cat.key)
    ).length;
    const pct = totalItemsCount > 0 ? Math.round((count / totalItemsCount) * 100) : 0;
    return {
      name: cat.name,
      count,
      pct,
      color: cat.color,
    };
  });

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#E88932]" />
            <h3 className="text-base font-heading font-semibold text-[#18232B]">
              Analitik & Visualisasi Kinerja Pelatihan (Real-Time)
            </h3>
          </div>
          <p className="text-xs text-[#5A6B75] mt-0.5">
            Seluruh persentase, jam pelatihan, komposisi silabus, dan capaian 7 divisi dihitung otomatis dari data aktual.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-white text-[#397C69] text-xs font-medium border border-[#E2E8E8]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#397C69]" />
            <span>Data Real-Time Terintegrasi ({summary.totalPlan} Program • {activeEmployees.length} Karyawan)</span>
          </span>
        </div>
      </div>

      {/* Row 1: Target vs Realization + Overall Achievement Gauge */}
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
                const plannedH =
                  item.planned > 0 ? Math.max(Math.round((item.planned / maxQuarterVal) * 100), 8) : 2;
                const actualH =
                  item.actual > 0 ? Math.max(Math.round((item.actual / maxQuarterVal) * 100), 8) : 2;
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
                        className="w-4 sm:w-6 rounded-t-[4px] bg-[#E2E8E8] transition-all duration-300"
                        title={`Rencana: ${item.planned} jam`}
                      />
                      <div
                        style={{ height: `${actualH}%` }}
                        className="w-4 sm:w-6 rounded-t-[4px] bg-[#E88932] group-hover:bg-[#D47621] transition-all duration-300"
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
              Total Rencana Jam:{' '}
              <strong className="font-mono text-[#18232B] tabular-nums">
                {totalPlannedHours} Jam
              </strong>
            </span>
            <span className="font-medium text-[#397C69] flex items-center gap-1 tabular-nums">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>
                Realisasi Aktual: {totalActualHours} Jam ({hoursAchievementPct}% dari rencana)
              </span>
            </span>
          </div>
        </div>

        {/* CHART 2: Real-Time Training Achievement & Manpower Donut Gauge - 5 cols */}
        <div className="lg:col-span-5 bg-white p-6 rounded-[12px] border border-[#E2E8E8] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#5A6B75]">
                  CAPAIAN REALISASI AKTUAL
                </span>
                <h4 className="text-sm font-heading font-semibold text-[#18232B] mt-0.5">
                  Persentase Realisasi Program & Peserta
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#F4F6F5] text-[#263640] border border-[#E2E8E8]">
                Target: {mockStore.systemSettings.mandatoryAchievementTargetPercent}%
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
                    strokeDashoffset={251.2 - (251.2 * Math.min(overallAchievementPct, 100)) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-heading font-bold text-[#18232B] tabular-nums tracking-tight">
                    {overallAchievementPct}%
                  </span>
                  <span className="text-[10px] font-mono text-[#5A6B75] uppercase tracking-wider mt-0.5">
                    Realisasi ({summary.totalRealization}/{summary.totalPlan})
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-[#E2E8E8] text-xs">
            <div className="flex justify-between">
              <span className="text-[#5A6B75]">Total Karyawan Aktif:</span>
              <span className="font-mono font-semibold text-[#18232B] tabular-nums">
                {activeEmployees.length} Personel
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5A6B75]">Personel Internal Dilatih (Unik):</span>
              <span className="font-mono font-semibold text-[#397C69] tabular-nums">
                {summary.totalManpowerTrained} / {summary.totalManpowerPlanned} Personel
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: 7-Division Comparison & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Horizontal Bars - 7 cols */}
        <div className="lg:col-span-7 bg-white p-6 rounded-[12px] border border-[#E2E8E8]">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-5">
            <div>
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#5A6B75]">
                CAPAIAN & PARTISIPASI 7 DIVISI
              </span>
              <h4 className="text-sm font-heading font-semibold text-[#18232B] mt-0.5">
                Realisasi Program, Jam Pelatihan & Personel per Divisi
              </h4>
            </div>
            <span className="text-xs font-mono text-[#5A6B75]">
              7 Divisi Resmi PT. RAJA
            </span>
          </div>

          <div className="space-y-3.5">
            {deptBreakdown.map((dept) => (
              <div key={dept.code} className="space-y-1.5">
                <div className="flex flex-wrap justify-between gap-2 text-xs">
                  <span className="font-medium text-[#18232B] flex items-center gap-2">
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#F4F6F5] text-[#263640] border border-[#E2E8E8] font-bold">
                      {dept.code}
                    </span>
                    <span className="truncate max-w-[200px] sm:max-w-xs">{dept.name}</span>
                    <span className="text-[10px] font-mono text-[#5A6B75]">
                      ({dept.empCount} Karyawan)
                    </span>
                  </span>
                  <div className="flex items-center gap-2 font-mono tabular-nums">
                    <span className="font-bold text-[#18232B]">{dept.pct}%</span>
                    <span className="text-[11px] text-[#5A6B75]">
                      ({dept.realization}/{dept.plan} prog • {dept.hours}/{dept.target} jam)
                    </span>
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
            <span>Otomatis berubah saat data training atau karyawan ditambah/diedit/dihapus</span>
            <span className="font-mono font-semibold text-[#E88932]">
              Total: {summary.totalRealization}/{summary.totalPlan} Terlaksana
            </span>
          </div>
        </div>

        {/* Category Breakdown - 5 cols */}
        <div className="lg:col-span-5 bg-white p-6 rounded-[12px] border border-[#E2E8E8] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#5A6B75]">
                  KOMPOSISI SILABUS AKTUAL
                </span>
                <h4 className="text-sm font-heading font-semibold text-[#18232B] mt-0.5">
                  Distribusi Kategori Pelatihan ({totalItemsCount} Program)
                </h4>
              </div>
              <PieChart className="w-4 h-4 text-[#5A6B75]" />
            </div>

            <div className="space-y-2.5">
              {categories.map((cat, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-[8px] bg-[#F4F6F5] border border-[#E2E8E8] text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                      <span className="font-medium text-[#18232B]">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono tabular-nums">
                      <span className="font-semibold text-[#18232B]">{cat.pct}%</span>
                      <span className="text-[11px] text-[#5A6B75]">({cat.count} modul)</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(cat.pct, 100)}%` }}
                      className={`h-full ${cat.color} transition-all duration-300`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E2E8E8] text-xs text-[#5A6B75] flex items-center justify-between">
            <span>Dihitung langsung dari daftar Data Training aktif</span>
            <span className="font-mono text-[11px] text-[#263640]">SMKP Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
