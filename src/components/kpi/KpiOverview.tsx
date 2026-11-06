import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import { BarChart3, TrendingUp, Target, Award, Clock } from 'lucide-react';

export const KpiOverview: React.FC = () => {
  const { currentUser } = useAuth();
  const kpiResults = mockStore.kpiResults;
  const kpiDefs = mockStore.kpiDefinitions;
  const kpiTargets = mockStore.kpiTargets;
  const kpiWeights = mockStore.kpiWeights;

  const totalWeightedScore = kpiResults.reduce((sum, r) => sum + (r.weighted_score || 0), 0);

  return (
    <div className="space-y-6">
      {/* Executive Summary Card */}
      <div className="bg-gradient-to-r from-sky-800 to-blue-950 text-white p-6 rounded-2xl shadow-md">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
              Training Center Performance Index
            </span>
            <h2 className="text-2xl font-extrabold mt-1">2026 Company-Wide KPI Achievement</h2>
            <p className="text-xs text-sky-200 mt-1 max-w-xl">
              Real-time calculation engine aggregating completed training records, participant attendance, competency assessments, and certification issuance.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/20 text-center">
            <span className="text-[10px] text-sky-200 uppercase font-semibold">Overall Index Score</span>
            <div className="text-3xl font-extrabold text-white mt-0.5">
              {totalWeightedScore.toFixed(1)}
              <span className="text-sm font-normal text-sky-300"> / 100</span>
            </div>
            <div className="text-[10px] text-emerald-300 font-semibold mt-1">
              Dynamic Realization
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpiDefs.map((def) => {
          const res = kpiResults.find((r) => r.kpi_id === def.id);
          const target = kpiTargets.find((t) => t.kpi_id === def.id && t.department_id === null);
          const weight = kpiWeights.find((w) => w.kpi_id === def.id);

          const actual = res ? res.actual_value : 0;
          const targetVal = target ? target.target_value : 0;
          const score = res ? res.score : 0;
          const weightedScore = res ? res.weighted_score : 0;

          return (
            <div
              key={def.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {def.code}
                  </span>
                  <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                    Weight: {weight?.weight_percentage}%
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-800">{def.name}</h4>
                <p className="text-[11px] text-slate-500 mt-1">{def.description}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Actual Realization:</span>
                  <span className="font-extrabold text-slate-900 font-mono">
                    {actual} {def.unit === 'PERCENTAGE' ? '%' : def.unit === 'HOURS' ? 'Hrs/Emp' : ''}
                  </span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Annual Target:</span>
                  <span className="font-medium text-slate-600 font-mono">
                    {targetVal} {def.unit === 'PERCENTAGE' ? '%' : def.unit === 'HOURS' ? 'Hrs/Emp' : ''}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-sky-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(score, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] pt-1 font-semibold">
                  <span className="text-slate-500">Achievement Score:</span>
                  <span className="text-sky-700 font-bold">{score}% ({weightedScore} pts)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* KPI Calculation Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Consolidated Metric Breakdown & Formula Definitions
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Metric Code & Name</th>
                <th className="px-6 py-3">Unit</th>
                <th className="px-6 py-3">Calculation Formula</th>
                <th className="px-6 py-3">Target</th>
                <th className="px-6 py-3">Actual</th>
                <th className="px-6 py-3">Weight</th>
                <th className="px-6 py-3">Weighted Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kpiDefs.map((def) => {
                const res = kpiResults.find((r) => r.kpi_id === def.id);
                const target = kpiTargets.find((t) => t.kpi_id === def.id && t.department_id === null);
                const weight = kpiWeights.find((w) => w.kpi_id === def.id);

                return (
                  <tr key={def.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-slate-900">{def.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{def.code}</div>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-600">{def.unit}</td>
                    <td className="px-6 py-3.5 text-slate-600 text-[11px]">
                      {def.calculation_formula}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-700">
                      {target?.target_value}
                    </td>
                    <td className="px-6 py-3.5 font-bold text-slate-900">
                      {res?.actual_value || 0}
                    </td>
                    <td className="px-6 py-3.5 text-slate-700 font-semibold">
                      {weight?.weight_percentage}%
                    </td>
                    <td className="px-6 py-3.5 font-extrabold text-sky-700">
                      {res?.weighted_score || 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

