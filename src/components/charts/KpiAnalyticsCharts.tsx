import React, { useState } from 'react';
import { mockStore } from '../../lib/mockStore';
import { BarChart3, TrendingUp, Award, Clock, PieChart, Users, ArrowUpRight } from 'lucide-react';

export const KpiAnalyticsCharts: React.FC = () => {
  const [hoveredQuarter, setHoveredQuarter] = useState<string | null>(null);

  // Dynamic metrics from mockStore
  const kpiResults = mockStore.kpiResults;
  const kpiDefs = mockStore.kpiDefinitions;
  const records = mockStore.records;
  const employees = mockStore.employees;
  const schedules = mockStore.schedules;

  // 1. Quarterly Performance Data
  const quarterlyData = [
    { quarter: 'Q1 2026', planned: 200, actual: 215, completion: '107%' },
    { quarter: 'Q2 2026', planned: 240, actual: 230, completion: '96%' },
    { quarter: 'Q3 2026', planned: 260, actual: 275, completion: '106%' },
    { quarter: 'Q4 2026 (Est)', planned: 280, actual: 160, completion: '57%' },
  ];

  // 2. Department Breakdown
  const deptBreakdown = [
    { code: 'MOD', name: 'Mining Operations', hours: 48, target: 40, color: 'from-amber-500 to-amber-600', pct: 120 },
    { code: 'MED', name: 'Mining Engineering', hours: 32, target: 35, color: 'from-sky-500 to-blue-600', pct: 91 },
    { code: 'HSE', name: 'Health & Safety', hours: 45, target: 40, color: 'from-emerald-500 to-teal-600', pct: 112 },
    { code: 'HRGA', name: 'HR & Affairs', hours: 24, target: 25, color: 'from-purple-500 to-indigo-600', pct: 96 },
  ];

  // 3. Pass Rate Metric
  const totalEnrolled = records.length || 6;
  const totalPassed = records.filter(r => r.passed).length || 5;
  const passRate = Math.round((totalPassed / totalEnrolled) * 100);

  // 4. Category Distribution
  const categories = [
    { name: 'POP / POM Certification', count: 4, pct: 40, color: 'bg-amber-500' },
    { name: 'Safety & Heavy Hauler', count: 3, pct: 30, color: 'bg-sky-500' },
    { name: 'Geotech & Mine Planning', count: 2, pct: 20, color: 'bg-emerald-500' },
    { name: 'Compliance & AMDAL', count: 1, pct: 10, color: 'bg-purple-500' },
  ];

  // Max value for bar scaling
  const maxQuarterVal = 300;

  return (
    <div className="space-y-6 mb-8">
      {/* Header section with badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-extrabold text-slate-900">
              Interactive KPI Visualizations & Performance Analytics
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time visual monitoring of corporate training targets, departmental realization, and certification passing yield.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Data Sync</span>
          </span>
        </div>
      </div>

      {/* Grid of Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CHART 1: Target vs Realization (Bar & Trend Chart) - 7 cols */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Target Realization vs Planning
                </span>
                <h4 className="text-sm font-bold text-slate-800">
                  Quarterly Training Hours (Planned vs Actual)
                </h4>
              </div>
              <div className="flex items-center space-x-4 text-[11px] font-medium">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-xs bg-slate-200" />
                  <span className="text-slate-500">Planned Hours</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-xs bg-sky-600" />
                  <span className="text-sky-700 font-bold">Realization</span>
                </div>
              </div>
            </div>

            {/* SVG / Styled Bar Chart */}
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
                      <div className="absolute -top-12 z-20 bg-slate-900 text-white text-[10px] py-1 px-2.5 rounded-lg shadow-xl whitespace-nowrap">
                        <div className="font-bold">{item.quarter}</div>
                        <div>Actual: {item.actual}h / Plan: {item.planned}h ({item.completion})</div>
                      </div>
                    )}

                    <div className="w-full flex items-end justify-center gap-2 h-full">
                      {/* Planned Bar */}
                      <div
                        style={{ height: `${plannedH}%` }}
                        className="w-4 sm:w-6 rounded-t-md bg-slate-200 transition-all duration-300"
                        title={`Planned: ${item.planned} hrs`}
                      />
                      {/* Actual Bar */}
                      <div
                        style={{ height: `${actualH}%` }}
                        className={`w-4 sm:w-6 rounded-t-md transition-all duration-300 shadow-xs ${
                          actualH >= plannedH
                            ? 'bg-gradient-to-t from-sky-600 to-sky-400 group-hover:from-sky-500 group-hover:to-sky-300'
                            : 'bg-gradient-to-t from-amber-600 to-amber-400 group-hover:from-amber-500 group-hover:to-amber-300'
                        }`}
                        title={`Actual: ${item.actual} hrs`}
                      />
                    </div>

                    <span className="text-[11px] font-semibold text-slate-600 mt-3 whitespace-nowrap">
                      {item.quarter}
                    </span>
                    <span className={`text-[10px] font-bold ${actualH >= plannedH ? 'text-sky-700' : 'text-amber-700'}`}>
                      {item.completion}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 flex flex-wrap justify-between items-center text-xs text-slate-500">
            <span>Annual Enterprise Target: <strong className="text-slate-800">1,000 Hours</strong></span>
            <span className="font-semibold text-emerald-700 flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>YTD Realization: 880 Hours (88% of target)</span>
            </span>
          </div>
        </div>

        {/* CHART 2: Certification Pass Rate Radial / Donut Gauge - 5 cols */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Competency Yield Metric
                </span>
                <h4 className="text-sm font-bold text-slate-800">
                  Certification & POP Pass Rate
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                ESDM Target: 90%
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
                    strokeWidth="11"
                  />
                  {/* Progress Fill with stroke-dasharray */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="url(#passRateGrad)"
                    strokeWidth="11"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * passRate) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="passRateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0284c7" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Center Percentage Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {passRate}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    Passed First Try
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Total Enrolled Participants:</span>
              <span className="font-bold text-slate-800">{totalEnrolled} Candidates</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Certified & Competent (Passed):</span>
              <span className="font-bold text-emerald-700">{totalPassed} Employees</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: Department Horizontal Performance & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Department Comparison Horizontal Bars - 7 cols */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex justify-between items-center mb-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Departmental Participation
              </span>
              <h4 className="text-sm font-bold text-slate-800">
                Average Training Hours per Employee by Department
              </h4>
            </div>
            <span className="text-xs text-sky-700 font-bold bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
              Benchmark: 24h / Emp
            </span>
          </div>

          <div className="space-y-4">
            {deptBreakdown.map((dept) => (
              <div key={dept.code} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 font-mono">{dept.code}</span>
                    <span className="text-slate-500 text-[11px]">- {dept.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="font-bold text-slate-900">{dept.hours} hrs</span>
                    <span className="text-slate-400 text-[10px]">/ target {dept.target}h</span>
                    <span className={`text-[11px] font-bold ${dept.pct >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      ({dept.pct}%)
                    </span>
                  </div>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden relative">
                  <div
                    style={{ width: `${Math.min(dept.pct, 100)}%` }}
                    className={`h-full rounded-full bg-gradient-to-r ${dept.color} transition-all duration-700`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Training Category Doughnut Breakdown - 5 cols */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Curriculum Mix
                </span>
                <h4 className="text-sm font-bold text-slate-800">
                  Training Distribution by Program Category
                </h4>
              </div>
              <PieChart className="w-4 h-4 text-slate-400" />
            </div>

            {/* Visual Multi-segment bar */}
            <div className="w-full h-4 rounded-full overflow-hidden flex my-3">
              {categories.map((cat, idx) => (
                <div
                  key={idx}
                  style={{ width: `${cat.pct}%` }}
                  className={`${cat.color} h-full`}
                  title={`${cat.name}: ${cat.pct}%`}
                />
              ))}
            </div>

            {/* Category breakdown legend */}
            <div className="space-y-2.5 mt-4">
              {categories.map((cat, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                    <span className="text-slate-700 font-medium">{cat.name}</span>
                  </div>
                  <div className="font-mono font-bold text-slate-800">
                    {cat.pct}% <span className="text-slate-400 font-normal text-[11px]">({cat.count} batches)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Mandatory Mining Reg: <strong className="text-slate-800">70% Minimum</strong></span>
            <span className="text-emerald-700 font-bold">Compliant (70%)</span>
          </div>
        </div>

      </div>
    </div>
  );
};
