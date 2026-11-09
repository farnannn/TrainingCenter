import React, { useState } from 'react';
import { mockStore } from '../../../lib/mockStore';
import { Button } from '../../ui/Button';
import { CollapsiblePanel } from '../../ui/CollapsiblePanel';
import { Edit3, ClipboardCheck, Target, GraduationCap, Calendar, ZoomIn } from 'lucide-react';
import {
  StatCard,
  StatusPill,
  Modal,
  GroupedBarChart,
  LineTrendChart,
  DonutChart,
  ProgressBar,
  thCls,
  tdCls,
  pctOf,
  fmtPct,
} from './shared';
import { monthStatusOf } from './SectionG';
import { setPendingProgramTab } from './navigation';
import { PlanTechnicalAndSharingSection } from './PlanTechnicalAndSharingSection';
import { SkillAuditRefreshOperatorSection } from './SkillAuditRefreshOperatorSection';

// ==============================================================================
// PANEL CAPAIAN PROGRAM TECHNICAL TRAINING — BERURUTAN SESUAI SLIDE REPORT:
// (Setelah Laporan Weekly):
// 1. Assessment Candidate Mechanic
// 2. RESUME ASSESSMENT CREW MECHANIC PLM 2026
// 3. RESUME TRAINING CLASS CREW MECHANIC PLM 2026
// ==============================================================================
export const TechnicalTrainingSummaryPanel: React.FC<{
  canEdit: boolean;
  onOpenEditor?: (tab?: string) => void;
}> = ({ canEdit, onOpenEditor }) => {
  const mod = mockStore.technicalTrainingModule;
  const m = mockStore.getTechnicalTrainingSummaryMetrics();
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; caption: string } | null>(null);
  const months = [...mod.plmMonthlyTrainingClasses].sort(
    (a, b) => Number(a.year || 2026) - Number(b.year || 2026) || a.month_index - b.month_index
  );
  const ongoingIdx = months.findIndex((x) => x.period_status === 'ON_GOING');
  const dailyActivities = mod.dailyTrainerActivities || [];

  const openEditor = (editTab: string) => {
    setPendingProgramTab(editTab);
    onOpenEditor?.(editTab);
  };

  return (
    <div className="space-y-4">
      {/* 1. Assessment Candidate Mechanic */}
      <CollapsiblePanel
        title="Assessment Candidate Mechanic"
        subtitle={`${mod.interviewSummary.headline_label} • ${m.totalCandidateMasuk} Peserta Masuk • ${m.totalCandidateRecommended} Recommended M3 Up`}
        icon={<ClipboardCheck className="w-4 h-4" />}
      >
        <div className="bg-white rounded-[14px] border border-[#E2E8E8] shadow-xs overflow-hidden">
          <div className="px-5 py-4 bg-[#18232B] bg-topography text-white flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-heading font-bold">Assessment Candidate Mechanic</h3>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {mod.interviewSummary.headline_label} • {mod.interviewSummary.area_scope}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="px-3 py-1 rounded-[8px] bg-white/10 border border-white/15 font-mono text-xs font-bold text-[#E88932]">
                {m.totalCandidateSudahItv}x Done
              </div>
              <StatusPill status={mod.interviewSummary.status} />
              {canEdit && onOpenEditor && (
                <Button size="sm" icon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => openEditor('C')}>
                  Edit / Kelola Assessment Candidate Mechanic
                </Button>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <StatCard label="Peserta Masuk" value={m.totalCandidateMasuk} unit="Kandidat" tone="dark" />
              <StatCard label="Sudah Interview" value={m.totalCandidateSudahItv} unit="Kandidat" tone="orange" />
              <StatCard label="Recommended M3 Up" value={m.totalCandidateRecommended} unit="Kandidat" tone="green" />
              <StatCard label="Site Tangofa" value={m.totalCandidateTangofa} unit="Kandidat" tone="blue" />
              <StatCard label="Site TPM" value={m.totalCandidateTpm} unit="Kandidat" tone="blue" />
            </div>

            <div className="overflow-x-auto rounded-[10px] border border-[#E2E8E8]">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className={thCls} rowSpan={2}>No</th>
                    <th className={thCls} rowSpan={2}>Candidate</th>
                    <th className={`${thCls} text-right`} rowSpan={2}>Jlh Peserta Masuk</th>
                    <th className={`${thCls} text-right`} rowSpan={2}>Sudah Itv</th>
                    <th className={`${thCls} text-right`} rowSpan={2}>Recommended (M3 Middle Up)</th>
                    <th className={`${thCls} text-center border-b border-white/20`} colSpan={2}>Site</th>
                    <th className={thCls} rowSpan={2}>Remark</th>
                  </tr>
                  <tr>
                    <th className={`${thCls} text-right`}>Tangofa</th>
                    <th className={`${thCls} text-right`}>TPM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8E8]">
                  {mod.candidatePositionRecap.map((r) => (
                    <tr key={r.id} className="even:bg-[#FAFBFB] hover:bg-[#F4F6F5]/60">
                      <td className={`${tdCls} font-mono`}>{r.no}</td>
                      <td className={`${tdCls} font-semibold`}>{r.candidate_position}</td>
                      <td className={`${tdCls} text-right font-mono`}>{r.total_masuk}</td>
                      <td className={`${tdCls} text-right font-mono`}>{r.sudah_itv}</td>
                      <td className={`${tdCls} text-right font-mono font-bold text-[#296050]`}>{r.recommended_m3_up}</td>
                      <td className={`${tdCls} text-right font-mono`}>{r.site_tangofa || '-'}</td>
                      <td className={`${tdCls} text-right font-mono`}>{r.site_tpm || '-'}</td>
                      <td className={`${tdCls} text-[11px] text-[#5A6B75]`}>{r.remark}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#263640] text-white font-bold">
                    <td className="px-3 py-2.5 text-xs" colSpan={2}>Total</td>
                    <td className="px-3 py-2.5 text-xs text-right font-mono">{m.totalCandidateMasuk}</td>
                    <td className="px-3 py-2.5 text-xs text-right font-mono text-[#E88932]">{m.totalCandidateSudahItv}</td>
                    <td className="px-3 py-2.5 text-xs text-right font-mono">{m.totalCandidateRecommended}</td>
                    <td className="px-3 py-2.5 text-xs text-right font-mono">{m.totalCandidateTangofa}</td>
                    <td className="px-3 py-2.5 text-xs text-right font-mono">{m.totalCandidateTpm}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rounded-[12px] border border-[#E2E8E8] p-4">
              <h4 className="text-xs font-heading font-bold text-[#18232B] mb-2">Grafik Funnel Kandidat per Posisi</h4>
              <GroupedBarChart
                categories={mod.candidatePositionRecap.map((r) => r.candidate_position)}
                series={[
                  { key: 'masuk', label: 'Peserta Masuk', color: '#527FA1' },
                  { key: 'itv', label: 'Sudah Itv', color: '#E88932' },
                  { key: 'rec', label: 'Recommended', color: '#397C69' },
                ]}
                data={mod.candidatePositionRecap.map((r) => ({
                  masuk: r.total_masuk,
                  itv: r.sudah_itv,
                  rec: r.recommended_m3_up,
                }))}
                height={250}
              />
            </div>
          </div>
        </div>
      </CollapsiblePanel>

      {/* 2. RESUME ASSESSMENT CREW MECHANIC PLM 2026 */}
      <CollapsiblePanel
        title="RESUME ASSESSMENT CREW MECHANIC PLM 2026"
        subtitle={`Total Assessment: ${m.totalPlmAssessmentClass} Class • All GAP Competences: ${m.totalFillGap}/${m.totalGapAll} (${m.overallFillGapPercent}%)`}
        icon={<Target className="w-4 h-4" />}
      >
        <div className="bg-white rounded-[14px] border border-[#E2E8E8] shadow-xs overflow-hidden">
          <div className="px-5 py-4 bg-[#18232B] bg-topography text-white flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-heading font-bold">RESUME ASSESSMENT CREW MECHANIC PLM 2026</h3>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Total Assessment: {m.totalPlmAssessmentClass} Class • Fill Gap: {m.totalFillGap} dari {m.totalGapAll} GAP ({m.overallFillGapPercent}%)
              </p>
            </div>
            {canEdit && onOpenEditor && (
              <Button size="sm" icon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => openEditor('F')}>
                Edit / Kelola Resume Assessment Crew Mechanic PLM 2026
              </Button>
            )}
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard label="Total Assessment" value={m.totalPlmAssessmentClass} unit="Class" tone="orange" />
              {mod.plmAssessmentCategories.slice(0, 2).map((c) => (
                <StatCard key={c.id} label={c.category_name} value={c.class_count} unit="Class" tone="dark" />
              ))}
              <StatCard
                label="Fill Gap Kompetensi"
                value={`${m.totalFillGap}/${m.totalGapAll}`}
                unit="GAP"
                hint={`Progress ${m.overallFillGapPercent}%`}
                tone="green"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
              <div className="xl:col-span-2 rounded-[12px] border border-[#E2E8E8] p-4 space-y-4">
                <h4 className="text-xs font-heading font-bold text-[#18232B]">Distribusi Assessment per Kategori</h4>
                <DonutChart
                  centerValue={String(m.totalPlmAssessmentClass)}
                  centerLabel="Class"
                  segments={mod.plmAssessmentCategories.map((c, i) => ({
                    label: c.category_name,
                    value: c.class_count,
                    color: ['#E88932', '#527FA1', '#397C69', '#D5A33D'][i % 4],
                  }))}
                />
                <div className="overflow-x-auto rounded-[10px] border border-[#E2E8E8]">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className={thCls}>Kategori</th>
                        <th className={`${thCls} text-right`}>Jumlah</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8E8]">
                      {mod.plmAssessmentCategories.map((c) => (
                        <tr key={c.id}>
                          <td className={`${tdCls} font-semibold`}>{c.category_name}</td>
                          <td className={`${tdCls} text-right font-mono font-bold`}>{c.class_count} class</td>
                        </tr>
                      ))}
                      <tr className="bg-[#263640] text-white font-bold">
                        <td className="px-3 py-2 text-xs">Total</td>
                        <td className="px-3 py-2 text-xs text-right font-mono text-[#E88932]">{m.totalPlmAssessmentClass} class</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="xl:col-span-3 rounded-[12px] border border-[#E2E8E8] p-4">
                <h4 className="text-xs font-heading font-bold text-[#18232B] mb-2">Progress Fill Gap Assessment</h4>
                <GroupedBarChart
                  categories={mod.plmCompetencyGapRows.map((r) => r.code)}
                  series={[
                    { key: 'gap', label: 'Gap All', color: '#527FA1' },
                    { key: 'fill', label: 'Fill Gap', color: '#E88932' },
                  ]}
                  data={mod.plmCompetencyGapRows.map((r) => ({ gap: r.gap_all, fill: r.fill_gap }))}
                  height={280}
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-[10px] border border-[#E2E8E8]">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className={thCls}>No</th>
                    <th className={thCls}>Code</th>
                    <th className={thCls}>Jenis Training</th>
                    <th className={`${thCls} text-right`}>Gap All</th>
                    <th className={`${thCls} text-right`}>Mechanic Tangofa</th>
                    <th className={`${thCls} text-right`}>Mechanic Genba</th>
                    <th className={`${thCls} text-right`}>All GL</th>
                    <th className={`${thCls} text-right`}>FGDP & GLDP</th>
                    <th className={`${thCls} text-right`}>Fill Gap</th>
                    <th className={thCls}>On Prog.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8E8]">
                  {mod.plmCompetencyGapRows.map((r) => {
                    const p = Math.round(pctOf(r.fill_gap, r.gap_all));
                    return (
                      <tr key={r.id} className="even:bg-[#FAFBFB] hover:bg-[#F4F6F5]/60">
                        <td className={`${tdCls} font-mono`}>{r.no}</td>
                        <td className={`${tdCls} font-mono font-bold text-[#C66B1A]`}>{r.code}</td>
                        <td className={`${tdCls} font-semibold`}>{r.training_name}</td>
                        <td className={`${tdCls} text-right font-mono font-bold`}>{r.gap_all}</td>
                        <td className={`${tdCls} text-right font-mono`}>{r.mechanic_tangofa}</td>
                        <td className={`${tdCls} text-right font-mono`}>{r.mechanic_genba}</td>
                        <td className={`${tdCls} text-right font-mono`}>{r.all_gl}</td>
                        <td className={`${tdCls} text-right font-mono`}>{r.fgdp_gldp}</td>
                        <td className={`${tdCls} text-right font-mono font-bold text-[#296050]`}>{r.fill_gap}</td>
                        <td className={`${tdCls} min-w-[100px]`}>
                          <div className="text-[11px] font-mono font-bold mb-1">{p}%</div>
                          <ProgressBar value={p} />
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-[#263640] text-white font-bold">
                    <td className="px-3 py-2.5 text-xs" colSpan={3}>All GAP Competences</td>
                    <td className="px-3 py-2.5 text-xs text-right font-mono">{m.totalGapAll}</td>
                    <td className="px-3 py-2.5 text-xs text-right font-mono">
                      {mod.plmCompetencyGapRows.reduce((s, r) => s + r.mechanic_tangofa, 0)}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-right font-mono">
                      {mod.plmCompetencyGapRows.reduce((s, r) => s + r.mechanic_genba, 0)}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-right font-mono">
                      {mod.plmCompetencyGapRows.reduce((s, r) => s + r.all_gl, 0)}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-right font-mono">
                      {mod.plmCompetencyGapRows.reduce((s, r) => s + r.fgdp_gldp, 0)}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-right font-mono text-[#E88932]">{m.totalFillGap}</td>
                    <td className="px-3 py-2.5 text-xs font-mono text-[#E88932]">{m.overallFillGapPercent}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CollapsiblePanel>

      {/* 3. RESUME TRAINING CLASS CREW MECHANIC PLM 2026 */}
      <CollapsiblePanel
        title="RESUME TRAINING CLASS CREW MECHANIC PLM 2026"
        subtitle={`Total Plan: ${m.totalClassPlan} • Total Actual: ${m.totalClassActual} • Selisih: ${m.classSelisih} • Achievement: ${fmtPct(m.classAchievementPercent)}`}
        icon={<GraduationCap className="w-4 h-4" />}
      >
        <div className="bg-white rounded-[14px] border border-[#E2E8E8] shadow-xs overflow-hidden">
          <div className="px-5 py-4 bg-[#18232B] bg-topography text-white flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-heading font-bold">RESUME TRAINING CLASS CREW MECHANIC PLM 2026</h3>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Owner: {mod.report_header.owner_name} ({mod.report_header.owner_role}) • Member: {mod.report_header.member_dept} • Issue: {mod.report_header.issue_date}
              </p>
            </div>
            {canEdit && onOpenEditor && (
              <Button size="sm" icon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => openEditor('G')}>
                Edit / Kelola Resume Training Class Crew Mechanic PLM 2026
              </Button>
            )}
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard label="Total Plan" value={m.totalClassPlan} unit="Peserta" tone="dark" />
              <StatCard label="Total Actual" value={m.totalClassActual} unit="Kehadiran" tone="blue" />
              <StatCard
                label="Selisih (Actual − Plan)"
                value={m.classSelisih > 0 ? `+${m.classSelisih}` : m.classSelisih}
                tone={m.classSelisih >= 0 ? 'green' : 'red'}
              />
              <StatCard
                label="Achievement Agregat"
                value={fmtPct(m.classAchievementPercent)}
                hint={`(${m.totalClassActual} / ${m.totalClassPlan}) × 100%`}
                tone="orange"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="rounded-[12px] border border-[#E2E8E8] p-4">
                <h4 className="text-xs font-heading font-bold text-[#18232B] mb-2">Plan vs Actual per Bulan — Crew Mechanic PLM</h4>
                <GroupedBarChart
                  categories={months.map((x) => x.month_name)}
                  series={[
                    { key: 'plan', label: 'Plan', color: '#263640' },
                    { key: 'actual', label: 'Actual', color: '#E88932' },
                  ]}
                  data={months.map((x) => ({ plan: x.plan, actual: x.actual }))}
                  highlightIndex={ongoingIdx >= 0 ? ongoingIdx : undefined}
                  height={250}
                />
              </div>
              <div className="rounded-[12px] border border-[#E2E8E8] p-4">
                <h4 className="text-xs font-heading font-bold text-[#18232B] mb-2">Tren Achievement Bulanan (%)</h4>
                <LineTrendChart
                  labels={months.map((x) => x.month_name.slice(0, 3))}
                  values={months.map((x) => pctOf(x.actual, x.plan))}
                  dashedFromIndex={ongoingIdx > 0 ? ongoingIdx - 1 : undefined}
                  height={250}
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-[10px] border border-[#E2E8E8]">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className={thCls}>Bulan</th>
                    <th className={`${thCls} text-right`}>Plan</th>
                    <th className={`${thCls} text-right`}>Actual</th>
                    <th className={`${thCls} text-right`}>Selisih</th>
                    <th className={`${thCls} text-right`}>Achievement</th>
                    <th className={thCls}>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8E8]">
                  {months.map((x) => {
                    const d = x.actual - x.plan;
                    return (
                      <tr key={x.id} className={x.period_status === 'ON_GOING' ? 'bg-[#E88932]/5' : 'even:bg-[#FAFBFB]'}>
                        <td className={`${tdCls} font-semibold`}>{x.month_name} {x.year}</td>
                        <td className={`${tdCls} text-right font-mono`}>{x.plan}</td>
                        <td className={`${tdCls} text-right font-mono font-bold`}>{x.actual}</td>
                        <td className={`${tdCls} text-right font-mono ${d >= 0 ? 'text-[#296050]' : 'text-[#B94C45]'}`}>
                          {d > 0 ? `+${d}` : d}
                        </td>
                        <td className={`${tdCls} text-right font-mono font-bold`}>{fmtPct(pctOf(x.actual, x.plan))}</td>
                        <td className={tdCls}><StatusPill status={monthStatusOf(x)} /></td>
                      </tr>
                    );
                  })}
                  <tr className="bg-[#263640] text-white font-bold">
                    <td className="px-3 py-2.5 text-xs">TOTAL</td>
                    <td className="px-3 py-2.5 text-xs text-right font-mono">{m.totalClassPlan}</td>
                    <td className="px-3 py-2.5 text-xs text-right font-mono">{m.totalClassActual}</td>
                    <td className="px-3 py-2.5 text-xs text-right font-mono">
                      {m.classSelisih > 0 ? `+${m.classSelisih}` : m.classSelisih}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-right font-mono text-[#E88932]">
                      {fmtPct(m.classAchievementPercent)}
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CollapsiblePanel>

      {/* 4. ACTIVITY TECHNICAL TRAINING */}
      <CollapsiblePanel
        title="ACTIVITY TECHNICAL TRAINING"
        subtitle={`OTHER DAILY ACTIVITAS TECHNICAL TRAINER • ${dailyActivities.length} Kegiatan • Dokumentasi Foto`}
        icon={<Calendar className="w-4 h-4" />}
      >
        <div className="bg-white rounded-[14px] border border-[#E2E8E8] shadow-xs overflow-hidden">
          <div className="px-5 py-4 bg-[#18232B] bg-topography text-white flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-heading font-bold">
                ACTIVITY TECHNICAL TRAINING
              </h3>
              <p className="text-[11px] text-slate-300 mt-0.5">
                OTHER DAILY ACTIVITAS TECHNICAL TRAINER - WEEK 1 NOVEMBER 2026
              </p>
            </div>
            {canEdit && onOpenEditor && (
              <Button size="sm" icon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => openEditor('activity')}>
                Edit / Kelola Activity Technical Training
              </Button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[#18232B] text-white">
                  <th
                    rowSpan={2}
                    className="bg-[#18232B] text-[#E88932] font-mono font-bold text-[10px] uppercase tracking-wider px-3 py-2.5 border-r border-b border-[#263640] text-center w-12"
                  >
                    NO.
                  </th>
                  <th
                    colSpan={6}
                    className="bg-[#18232B] text-white font-heading font-bold text-xs sm:text-sm px-4 py-2.5 border-b border-[#263640] text-center uppercase tracking-wider"
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-[#E88932] mr-2 align-middle" />
                    OTHER DAILY ACTIVITAS TECHNICAL TRAINER - WEEK 1 NOVEMBER 2026
                  </th>
                </tr>
                <tr className="bg-[#263640] text-slate-100 font-mono font-bold text-[10px] uppercase tracking-wider">
                  <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-center w-28">DATE</th>
                  <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-center w-44">ATTENDENTS</th>
                  <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-center w-24">DEPT</th>
                  <th className="px-4 py-2.5 border-r border-[#18232B]/50 text-left min-w-[260px]">
                    ACTIVITIES
                  </th>
                  <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-center w-28">REMRKS</th>
                  <th className="px-3 py-2.5 text-center w-56">
                    DOKUMENTASI
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E8]">
                {dailyActivities.map((item, idx) => {
                  const isDone = item.remarks.toLowerCase() === 'done';
                  return (
                    <tr key={item.id} className="even:bg-[#FAFBFB] odd:bg-white hover:bg-[#F4F6F5]/70 transition-colors">
                      <td className="px-3 py-3 border-r border-[#E2E8E8] text-center font-mono font-bold text-xs text-[#5A6B75]">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-3 border-r border-[#E2E8E8] text-center font-mono font-semibold text-[#18232B] whitespace-nowrap">
                        {item.date_label}
                      </td>
                      <td className="px-3 py-3 border-r border-[#E2E8E8] text-center font-semibold text-[#18232B]">
                        {item.attendents}
                      </td>
                      <td className="px-3 py-3 border-r border-[#E2E8E8] text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] bg-[#527FA1]/12 text-[#3D6585] font-mono font-bold text-[10px]">
                          {item.dept}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-r border-[#E2E8E8] text-[#18232B] leading-relaxed">
                        {item.activities}
                      </td>
                      <td className="px-3 py-3 border-r border-[#E2E8E8] text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
                            isDone
                              ? 'bg-[#397C69]/12 text-[#296050] border-[#397C69]/25'
                              : 'bg-[#E88932]/12 text-[#B86214] border-[#E88932]/25'
                          }`}
                        >
                          {item.remarks}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {(item.photos || []).map((photoUrl, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() =>
                                setPreviewPhoto({
                                  url: photoUrl,
                                  caption: `${item.date_label} — ${item.attendents}: ${item.activities}`,
                                })
                              }
                              className="group relative w-24 h-16 rounded-[6px] overflow-hidden border border-[#E2E8E8] shadow-2xs cursor-pointer bg-[#F4F6F5]"
                              title="Klik untuk memperbesar foto dokumentasi"
                            >
                              <img
                                src={photoUrl}
                                alt={`Dokumentasi ${idx + 1}-${pIdx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <span className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                                <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </span>
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 sm:p-5 border-t border-[#E2E8E8]">
            <PlanTechnicalAndSharingSection
              canEdit={false}
              userId=""
              onDone={() => {}}
              onError={() => {}}
            />
          </div>
        </div>
      </CollapsiblePanel>

      {/* 5. PROGRAM SKILL AUDIT & REFRESH OPERATOR */}
      <CollapsiblePanel
        title="PROGRAM SKILL AUDIT & REFRESH OPERATOR"
        subtitle={`Total Aktual: ${m.totalSkillAuditOperators} Peserta • ADT (${m.adtRefreshCount}x) • Excavator/Exa (${m.excRefreshCount}x) • Doser (${m.doserRefreshCount}x) • Driver DT (${m.dtRefreshCount}x)`}
        icon={<GraduationCap className="w-4 h-4" />}
      >
        <div className="space-y-3">
          {canEdit && onOpenEditor && (
            <div className="flex justify-end">
              <Button
                size="sm"
                icon={<Edit3 className="w-3.5 h-3.5" />}
                onClick={() => openEditor('skill_audit')}
              >
                Edit / Kelola Program Skill Audit & Refresh Operator
              </Button>
            </div>
          )}
          <SkillAuditRefreshOperatorSection
            canEdit={false}
            userId=""
            onDone={() => {}}
            onError={() => {}}
          />
        </div>
      </CollapsiblePanel>

      <Modal
        open={!!previewPhoto}
        title="Preview Dokumentasi Activity Technical Training"
        onClose={() => setPreviewPhoto(null)}
      >
        {previewPhoto && (
          <div className="space-y-3">
            <div className="rounded-[10px] overflow-hidden border border-[#E2E8E8] bg-[#18232B] flex items-center justify-center max-h-[65vh]">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.caption}
                className="max-w-full max-h-[62vh] object-contain"
              />
            </div>
            <p className="text-xs text-[#263640] font-medium">{previewPhoto.caption}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};
