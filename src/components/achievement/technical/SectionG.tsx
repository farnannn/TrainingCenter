import React, { useState } from 'react';
import { mockStore } from '../../../lib/mockStore';
import { PlmTrainingClassMonthlyItem, PlmTrainingCorrectiveAction } from '../../../lib/types';
import { Button } from '../../ui/Button';
import { Plus, Edit3, Trash2, Download, Printer, Save, CheckCircle2, XCircle, Clock } from 'lucide-react';
import {
  SectionCard,
  StatCard,
  StatusPill,
  Modal,
  GroupedBarChart,
  LineTrendChart,
  exportCsv,
  printTable,
  inputCls,
  labelCls,
  thCls,
  tdCls,
  pctOf,
  fmtPct,
} from './shared';
import type { SectionProps } from './SectionsAB';

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const emptyMonth = {
  month_index: 12,
  month_name: 'Desember',
  year: '2026',
  plan: 0,
  actual: 0,
  frequency_plan: 0,
  frequency_actual: 0,
  period_status: 'ON_GOING' as PlmTrainingClassMonthlyItem['period_status'],
  notes: '',
};

const SECTION_LABEL: Record<PlmTrainingCorrectiveAction['section_type'], string> = {
  PROBLEM: 'Problem',
  CAUSE: 'Cause',
  CORRECTIVE_ACTION: 'Corrective Action',
  FOLLOW_UP: 'Follow Up of Previous Corrective Action',
};

export const monthStatusOf = (m: PlmTrainingClassMonthlyItem) =>
  m.period_status === 'ON_GOING' ? 'On Going' : m.actual >= m.plan ? 'Tercapai' : 'Belum Tercapai';

export const PlmTrainingClassResumeSection: React.FC<SectionProps> = ({ canEdit, userId, onDone, onError }) => {
  const mod = mockStore.technicalTrainingModule;
  const years = Array.from(new Set([...mod.plmMonthlyTrainingClasses.map((m) => m.year), '2026', '2027'])).sort();
  const [year, setYear] = useState('ALL');
  const [finalizePrev, setFinalizePrev] = useState(true);
  const [editMonth, setEditMonth] = useState<(typeof emptyMonth & { id?: string }) | null>(null);
  const [editAction, setEditAction] = useState<
    { id?: string; section_type: PlmTrainingCorrectiveAction['section_type']; description: string; pic: string; due_date: string } | null
  >(null);

  const allSortedMonths = [...mod.plmMonthlyTrainingClasses].sort(
    (a, b) => Number(a.year || 2026) - Number(b.year || 2026) || a.month_index - b.month_index
  );
  const lastMonth = allSortedMonths[allSortedMonths.length - 1];
  const nextMonthIndex = lastMonth ? (lastMonth.month_index % 12) + 1 : 12;
  const nextMonthYear = lastMonth
    ? String(Number(lastMonth.year || 2026) + (lastMonth.month_index === 12 ? 1 : 0))
    : '2026';
  const nextMonthName = MONTHS[nextMonthIndex - 1];

  const openAddNextMonth = () => {
    setFinalizePrev(true);
    setEditMonth({
      month_index: nextMonthIndex,
      month_name: nextMonthName,
      year: nextMonthYear,
      plan: lastMonth?.plan || 36,
      actual: 0,
      frequency_plan: lastMonth?.frequency_plan || 6,
      frequency_actual: 0,
      period_status: 'ON_GOING',
      notes: `Periode berjalan (${nextMonthName} ${nextMonthYear} — On Going)`,
    });
  };

  const months = allSortedMonths.filter((m) => year === 'ALL' || m.year === year);
  const totPlan = months.reduce((s, m) => s + m.plan, 0);
  const totActual = months.reduce((s, m) => s + m.actual, 0);
  const selisih = totActual - totPlan;
  const achievement = pctOf(totActual, totPlan);
  const totFreqPlan = months.reduce((s, m) => s + m.frequency_plan, 0);
  const totFreqActual = months.reduce((s, m) => s + m.frequency_actual, 0);
  const finalMonths = months.filter((m) => m.period_status === 'FINAL');
  const reached = finalMonths.filter((m) => m.actual >= m.plan).length;
  const ongoingIdx = months.findIndex((m) => m.period_status === 'ON_GOING');

  const run = (fn: () => void, msg: string) => {
    try {
      fn();
      onDone(msg);
    } catch (err: any) {
      onError(err.message);
    }
  };

  const headers = ['Bulan', 'Plan', 'Actual', 'Selisih', 'Achievement %', 'Freq. Plan', 'Freq. Actual', 'Status'];
  const rows: (string | number)[][] = [
    ...months.map((m) => [
      `${m.month_name} ${m.year}`, m.plan, m.actual, m.actual - m.plan, fmtPct(pctOf(m.actual, m.plan)), m.frequency_plan, m.frequency_actual, monthStatusOf(m),
    ]),
    ['TOTAL', totPlan, totActual, selisih, fmtPct(achievement), totFreqPlan, totFreqActual, ''],
  ];

  const header = mod.report_header;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-[12px] border border-[#E2E8E8]">
        <div>
          <h3 className="text-base font-heading font-extrabold text-[#18232B]">RESUME TRAINING CLASS CREW MECHANIC PLM {year === 'ALL' ? '' : year}</h3>
          <p className="text-[11px] text-[#5A6B75]">Owner: <strong>{header.owner_name}</strong> — {header.owner_role} • Member: {header.member_dept} • Issue: {header.issue_date}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={year} onChange={(e) => setYear(e.target.value)} className={`${inputCls} w-auto`}>
            <option value="ALL">Semua Periode</option>
            {years.map((y) => <option key={y} value={y}>Tahun {y}</option>)}
          </select>
          <Button variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={() => exportCsv(`Resume_Training_Class_PLM_${year}.csv`, headers, rows)}>Excel</Button>
          <Button variant="outline" size="sm" icon={<Printer className="w-3.5 h-3.5" />} onClick={() => printTable(`Resume Training Class Crew Mechanic PLM ${year}`, headers, rows, `Achievement = (Total Actual / Total Plan) × 100% = (${totActual}/${totPlan}) × 100% = ${fmtPct(achievement)}`)}>PDF</Button>
          {canEdit && (
            <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={openAddNextMonth}>
              Tambah Bulan Selanjutnya ({nextMonthName} {nextMonthYear})
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="Total Plan" value={totPlan} unit="Peserta" tone="dark" />
        <StatCard label="Total Actual" value={totActual} unit="Kehadiran" tone="blue" />
        <StatCard label="Selisih (Actual − Plan)" value={selisih > 0 ? `+${selisih}` : selisih} tone={selisih >= 0 ? 'green' : 'red'} />
        <StatCard label="Achievement Agregat" value={fmtPct(achievement)} hint={`(${totActual} / ${totPlan}) × 100%`} tone="orange" />
        <StatCard label="Bulan Tercapai" value={`${reached}/${finalMonths.length}`} unit="Bulan" hint={ongoingIdx >= 0 ? `${months[ongoingIdx].month_name}: periode berjalan` : undefined} tone="light" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SectionCard title="Plan vs Actual per Bulan" subtitle="Jumlah kehadiran peserta training class">
          <GroupedBarChart
            categories={months.map((m) => m.month_name)}
            series={[
              { key: 'plan', label: 'Plan', color: '#263640' },
              { key: 'actual', label: 'Actual', color: '#E88932' },
            ]}
            data={months.map((m) => ({ plan: m.plan, actual: m.actual }))}
            highlightIndex={ongoingIdx >= 0 ? ongoingIdx : undefined}
            height={270}
          />
        </SectionCard>
        <SectionCard title="Tren Achievement Bulanan (%)" subtitle="Garis putus-putus = periode berjalan (On Going)">
          <LineTrendChart
            labels={months.map((m) => m.month_name.slice(0, 3))}
            values={months.map((m) => pctOf(m.actual, m.plan))}
            target={100}
            dashedFromIndex={ongoingIdx > 0 ? ongoingIdx - 1 : undefined}
            height={270}
          />
        </SectionCard>
      </div>

      <SectionCard
        title="Tabel Rekapitulasi Bulanan"
        subtitle="Selisih = Actual − Plan • Achievement = Actual / Plan × 100%"
        actions={
          canEdit ? (
            <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={openAddNextMonth}>
              Tambah Bulan Selanjutnya ({nextMonthName} {nextMonthYear})
            </Button>
          ) : undefined
        }
      >
        <div className="overflow-x-auto rounded-[10px] border border-[#E2E8E8]">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thCls}>Bulan</th>
                <th className={`${thCls} text-right`}>Plan</th>
                <th className={`${thCls} text-right`}>Actual</th>
                <th className={`${thCls} text-right`}>Selisih</th>
                <th className={`${thCls} text-right`}>Achievement</th>
                <th className={`${thCls} text-right`}>Frekuensi (P/A)</th>
                <th className={thCls}>Indikator</th>
                <th className={thCls}>Catatan</th>
                {canEdit && <th className={thCls}>Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8E8]">
              {months.map((m) => {
                const d = m.actual - m.plan;
                const st = monthStatusOf(m);
                return (
                  <tr key={m.id} className={`hover:bg-[#F4F6F5]/60 ${m.period_status === 'ON_GOING' ? 'bg-[#E88932]/5' : 'even:bg-[#FAFBFB]'}`}>
                    <td className={`${tdCls} font-semibold`}>{m.month_name} {m.year}</td>
                    <td className={`${tdCls} text-right font-mono`}>{m.plan}</td>
                    <td className={`${tdCls} text-right font-mono font-bold`}>{m.actual}</td>
                    <td className={`${tdCls} text-right font-mono font-bold ${d >= 0 ? 'text-[#296050]' : 'text-[#B94C45]'}`}>{d > 0 ? `+${d}` : d}</td>
                    <td className={`${tdCls} text-right font-mono font-bold`}>{fmtPct(pctOf(m.actual, m.plan))}</td>
                    <td className={`${tdCls} text-right font-mono text-[11px]`}>{m.frequency_plan} / {m.frequency_actual}</td>
                    <td className={tdCls}>
                      <span className="inline-flex items-center gap-1">
                        {st === 'Tercapai' ? <CheckCircle2 className="w-3.5 h-3.5 text-[#397C69]" /> : st === 'On Going' ? <Clock className="w-3.5 h-3.5 text-[#E88932]" /> : <XCircle className="w-3.5 h-3.5 text-[#B94C45]" />}
                        <StatusPill status={st} />
                      </span>
                    </td>
                    <td className={`${tdCls} text-[11px] text-[#5A6B75] max-w-[220px]`}>{m.notes}</td>
                    {canEdit && (
                      <td className={tdCls}>
                        <div className="flex gap-1">
                          <button onClick={() => setEditMonth({ ...m, notes: m.notes || '' })} className="p-1.5 rounded hover:bg-[#E88932]/10 text-[#C66B1A] cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => window.confirm(`Hapus data ${m.month_name}?`) && run(() => mockStore.deletePlmMonthlyTrainingClass(userId, m.id), 'Data bulan dihapus.')} className="p-1.5 rounded hover:bg-[#B94C45]/10 text-[#B94C45] cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              <tr className="bg-[#263640] text-white font-bold">
                <td className="px-3 py-2.5 text-xs">TOTAL</td>
                <td className="px-3 py-2.5 text-xs text-right font-mono">{totPlan}</td>
                <td className="px-3 py-2.5 text-xs text-right font-mono">{totActual}</td>
                <td className="px-3 py-2.5 text-xs text-right font-mono">{selisih > 0 ? `+${selisih}` : selisih}</td>
                <td className="px-3 py-2.5 text-xs text-right font-mono text-[#E88932]">{fmtPct(achievement)}</td>
                <td className="px-3 py-2.5 text-xs text-right font-mono">{totFreqPlan} / {totFreqActual}</td>
                <td colSpan={canEdit ? 3 : 2} />
              </tr>
            </tbody>
          </table>
        </div>
        {canEdit && (
          <div className="mt-3 p-3 rounded-[10px] bg-[#F4F6F5] border border-dashed border-[#E88932]/50 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-[#263640]">
              Ingin menambahkan periode bulan berikutnya? Bulan selanjutnya otomatis terdeteksi: <strong>{nextMonthName} {nextMonthYear}</strong>
            </div>
            <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={openAddNextMonth}>
              + Tambah Bulan Selanjutnya ({nextMonthName} {nextMonthYear})
            </Button>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Problem • Cause • Corrective Action • Follow Up"
        subtitle="Evaluasi pelaksanaan training class (dapat diedit admin)"
        actions={canEdit ? <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setEditAction({ section_type: 'PROBLEM', description: '', pic: '', due_date: '' })}>Tambah Item</Button> : undefined}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {(Object.keys(SECTION_LABEL) as PlmTrainingCorrectiveAction['section_type'][]).map((type) => {
            const items = mod.plmCorrectiveActions.filter((c) => c.section_type === type);
            const withPic = type === 'CORRECTIVE_ACTION' || type === 'FOLLOW_UP';
            return (
              <div key={type} className="rounded-[10px] border border-[#E2E8E8] overflow-hidden">
                <div className={`px-3 py-2 text-[11px] font-heading font-bold uppercase tracking-wide text-white ${type === 'PROBLEM' ? 'bg-[#B94C45]' : type === 'CAUSE' ? 'bg-[#D5A33D]' : type === 'CORRECTIVE_ACTION' ? 'bg-[#397C69]' : 'bg-[#527FA1]'}`}>
                  {SECTION_LABEL[type]}
                </div>
                <table className="w-full">
                  <tbody className="divide-y divide-[#E2E8E8]">
                    {items.length === 0 && <tr><td className="p-3 text-xs text-[#5A6B75]">Belum ada item.</td></tr>}
                    {items.map((c, i) => (
                      <tr key={c.id} className="even:bg-[#FAFBFB]">
                        <td className={`${tdCls} font-mono w-8`}>{i + 1}</td>
                        <td className={`${tdCls} text-[11px]`}>{c.description}</td>
                        {withPic && <td className={`${tdCls} text-[11px] whitespace-nowrap`}>{c.pic}</td>}
                        {withPic && <td className={`${tdCls} text-[11px] whitespace-nowrap text-[#C66B1A] font-semibold`}>{c.due_date}</td>}
                        {canEdit && (
                          <td className={`${tdCls} w-16`}>
                            <div className="flex gap-1">
                              <button onClick={() => setEditAction({ id: c.id, section_type: c.section_type, description: c.description, pic: c.pic || '', due_date: c.due_date || '' })} className="p-1 rounded hover:bg-[#E88932]/10 text-[#C66B1A] cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => window.confirm('Hapus item ini?') && run(() => mockStore.deletePlmCorrectiveAction(userId, c.id), 'Item dihapus.')} className="p-1 rounded hover:bg-[#B94C45]/10 text-[#B94C45] cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <Modal wide open={!!editMonth} title={editMonth?.id ? `Edit Data ${editMonth.month_name} ${editMonth.year}` : `Tambah Bulan Selanjutnya (${editMonth?.month_name || ''} ${editMonth?.year || ''})`} onClose={() => setEditMonth(null)}>
        {editMonth && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(() => {
                mockStore.savePlmMonthlyTrainingClass(userId, {
                  ...editMonth,
                  finalizePreviousOngoing: !editMonth.id && finalizePrev,
                });
                if (year !== 'ALL' && year !== editMonth.year) {
                  setYear('ALL');
                }
                setEditMonth(null);
              }, `Data bulan ${editMonth.month_name} ${editMonth.year} berhasil disimpan. Total, selisih, achievement & grafik dihitung ulang.`);
            }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            <div>
              <label className={labelCls}>Bulan</label>
              <select className={inputCls} value={editMonth.month_index} onChange={(e) => { const idx = Number(e.target.value); setEditMonth({ ...editMonth, month_index: idx, month_name: MONTHS[idx - 1] }); }}>
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Tahun</label><input className={inputCls} value={editMonth.year} onChange={(e) => setEditMonth({ ...editMonth, year: e.target.value })} /></div>
            <div><label className={labelCls}>Plan (Peserta)</label><input type="number" min={0} className={inputCls} value={editMonth.plan} onChange={(e) => setEditMonth({ ...editMonth, plan: Number(e.target.value) })} /></div>
            <div><label className={labelCls}>Actual (Kehadiran)</label><input type="number" min={0} className={inputCls} value={editMonth.actual} onChange={(e) => setEditMonth({ ...editMonth, actual: Number(e.target.value) })} /></div>
            <div><label className={labelCls}>Frekuensi Plan</label><input type="number" min={0} className={inputCls} value={editMonth.frequency_plan} onChange={(e) => setEditMonth({ ...editMonth, frequency_plan: Number(e.target.value) })} /></div>
            <div><label className={labelCls}>Frekuensi Actual</label><input type="number" min={0} className={inputCls} value={editMonth.frequency_actual} onChange={(e) => setEditMonth({ ...editMonth, frequency_actual: Number(e.target.value) })} /></div>
            <div className="col-span-2">
              <label className={labelCls}>Status Periode</label>
              <select className={inputCls} value={editMonth.period_status} onChange={(e) => setEditMonth({ ...editMonth, period_status: e.target.value as any })}>
                <option value="FINAL">Final (Periode Selesai)</option>
                <option value="ON_GOING">On Going (Periode Berjalan)</option>
              </select>
            </div>
            <div className="col-span-2 sm:col-span-4"><label className={labelCls}>Catatan</label><input className={inputCls} value={editMonth.notes} onChange={(e) => setEditMonth({ ...editMonth, notes: e.target.value })} /></div>
            {!editMonth.id && editMonth.period_status === 'ON_GOING' && (
              <label className="col-span-2 sm:col-span-4 flex items-center gap-2 text-xs text-[#263640] bg-[#E88932]/10 border border-[#E88932]/30 p-2.5 rounded-[8px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={finalizePrev}
                  onChange={(e) => setFinalizePrev(e.target.checked)}
                  className="rounded border-[#E88932]"
                />
                <span>Otomatis ubah status bulan sebelumnya yang masih <strong>On Going</strong> menjadi <strong>Final (Selesai)</strong></span>
              </label>
            )}
            <div className="col-span-2 sm:col-span-4 p-2.5 rounded-[8px] bg-[#F4F6F5] text-[11px] font-mono">
              Preview: Selisih = {editMonth.actual - editMonth.plan} • Achievement = {fmtPct(pctOf(editMonth.actual, editMonth.plan))}
            </div>
            <div className="col-span-2 sm:col-span-4 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditMonth(null)}>Batal</Button>
              <Button type="submit" size="sm" icon={<Save className="w-3.5 h-3.5" />}>Simpan</Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={!!editAction} title={editAction?.id ? 'Edit Item Evaluasi' : 'Tambah Item Evaluasi'} onClose={() => setEditAction(null)}>
        {editAction && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(() => {
                mockStore.savePlmCorrectiveAction(userId, editAction);
                setEditAction(null);
              }, 'Item evaluasi disimpan.');
            }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="col-span-2">
              <label className={labelCls}>Jenis</label>
              <select className={inputCls} value={editAction.section_type} onChange={(e) => setEditAction({ ...editAction, section_type: e.target.value as any })}>
                {Object.entries(SECTION_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="col-span-2"><label className={labelCls}>Deskripsi *</label><textarea required rows={3} className={`${inputCls} h-auto py-2`} value={editAction.description} onChange={(e) => setEditAction({ ...editAction, description: e.target.value })} /></div>
            <div><label className={labelCls}>PIC</label><input className={inputCls} value={editAction.pic} onChange={(e) => setEditAction({ ...editAction, pic: e.target.value })} /></div>
            <div><label className={labelCls}>Due Date</label><input className={inputCls} value={editAction.due_date} onChange={(e) => setEditAction({ ...editAction, due_date: e.target.value })} /></div>
            <div className="col-span-2 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditAction(null)}>Batal</Button>
              <Button type="submit" size="sm" icon={<Save className="w-3.5 h-3.5" />}>Simpan</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

