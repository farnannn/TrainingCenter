import React, { useState } from 'react';
import { mockStore } from '../../../lib/mockStore';
import { PlmAssessmentCategoryItem, PlmCompetencyGapRow } from '../../../lib/types';
import { Button } from '../../ui/Button';
import { Plus, Edit3, Trash2, Download, Printer, Save, Info } from 'lucide-react';
import {
  SectionCard,
  StatCard,
  Modal,
  DonutChart,
  GroupedBarChart,
  ProgressBar,
  exportCsv,
  printTable,
  inputCls,
  labelCls,
  thCls,
  tdCls,
  pctOf,
} from './shared';
import type { SectionProps } from './SectionsAB';

const emptyCat = { category_name: '', class_count: 0, period_year: '2026', description: '' };
const emptyGap = {
  code: '',
  training_name: '',
  gap_all: 0,
  mechanic_tangofa: 0,
  mechanic_genba: 0,
  all_gl: 0,
  fgdp_gldp: 0,
  fill_gap: 0,
  period_year: '2026',
};

export const PlmAssessmentResumeSection: React.FC<SectionProps> = ({ canEdit, userId, onDone, onError }) => {
  const mod = mockStore.technicalTrainingModule;
  const years = Array.from(
    new Set([...mod.plmAssessmentCategories.map((c) => c.period_year), ...mod.plmCompetencyGapRows.map((r) => r.period_year), '2026'])
  ).sort();
  const [year, setYear] = useState('2026');
  const [editCat, setEditCat] = useState<(typeof emptyCat & { id?: string }) | null>(null);
  const [editGap, setEditGap] = useState<(typeof emptyGap & { id?: string }) | null>(null);

  const cats = mod.plmAssessmentCategories.filter((c) => year === 'ALL' || c.period_year === year);
  const gaps = mod.plmCompetencyGapRows.filter((r) => year === 'ALL' || r.period_year === year);
  const totalClass = cats.reduce((s, c) => s + c.class_count, 0);
  const sum = (k: keyof PlmCompetencyGapRow) => gaps.reduce((s, r) => s + (Number(r[k]) || 0), 0);
  const totGap = sum('gap_all');
  const totFill = sum('fill_gap');
  const palette = ['#E88932', '#527FA1', '#397C69', '#D5A33D', '#B94C45'];

  const run = (fn: () => void, msg: string) => {
    try {
      fn();
      onDone(msg);
    } catch (err: any) {
      onError(err.message);
    }
  };

  const catHeaders = ['No', 'Kategori', 'Jumlah Class', 'Periode', 'Keterangan'];
  const catRows: (string | number)[][] = [
    ...cats.map((c, i) => [i + 1, c.category_name, c.class_count, c.period_year, c.description]),
    ['', 'TOTAL', totalClass, year, 'Dihitung otomatis dari data kategori'],
  ];
  const gapHeaders = ['No', 'Code', 'Jenis Training', 'Gap All', 'Mechanic Tangofa', 'Mechanic Genba', 'All GL', 'FGDP & GLDP', 'Fill Gap', 'On Prog. %'];
  const gapRows: (string | number)[][] = [
    ...gaps.map((r) => [r.no, r.code, r.training_name, r.gap_all, r.mechanic_tangofa, r.mechanic_genba, r.all_gl, r.fgdp_gldp, r.fill_gap, `${Math.round(pctOf(r.fill_gap, r.gap_all))}%`]),
    ['', '', 'All GAP Competences', totGap, sum('mechanic_tangofa'), sum('mechanic_genba'), sum('all_gl'), sum('fgdp_gldp'), totFill, `${Math.round(pctOf(totFill, totGap))}%`],
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-[12px] border border-[#E2E8E8]">
        <div>
          <h3 className="text-base font-heading font-extrabold text-[#18232B]">RESUME ASSESSMENT CREW MECHANIC PLM {year === 'ALL' ? '' : year}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#5A6B75]">Filter Periode:</span>
          <select value={year} onChange={(e) => setYear(e.target.value)} className={`${inputCls} w-auto`}>
            <option value="ALL">Semua Periode</option>
            {years.map((y) => <option key={y} value={y}>Tahun {y}</option>)}
          </select>
          <Button variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={() => exportCsv(`Resume_Assessment_Crew_Mechanic_PLM_${year}.csv`, gapHeaders, [...gapRows, [], catHeaders, ...catRows])}>Excel</Button>
          <Button variant="outline" size="sm" icon={<Printer className="w-3.5 h-3.5" />} onClick={() => printTable(`Resume Assessment Crew Mechanic PLM ${year}`, gapHeaders, gapRows, `Total Assessment: ${totalClass} class (${cats.map((c) => `${c.category_name} = ${c.class_count} class`).join('; ')})`)}>PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Assessment" value={totalClass} unit="Class" hint="Otomatis dari jumlah kategori" tone="orange" />
        {cats.slice(0, 2).map((c) => (
          <StatCard key={c.id} label={c.category_name} value={c.class_count} unit="Class" tone="dark" />
        ))}
        <StatCard label="Fill Gap Kompetensi" value={`${totFill}/${totGap}`} unit="GAP" hint={`Progress ${Math.round(pctOf(totFill, totGap))}% dari All GAP Competences`} tone="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <SectionCard
            title="Assessment per Kategori"
            subtitle="Total dihitung otomatis"
            actions={canEdit ? <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setEditCat({ ...emptyCat, period_year: year === 'ALL' ? '2026' : year })}>Kategori</Button> : undefined}
          >
            <DonutChart
              centerValue={String(totalClass)}
              centerLabel="Class"
              segments={cats.map((c, i) => ({ label: c.category_name, value: c.class_count, color: palette[i % palette.length] }))}
            />
            <div className="overflow-x-auto rounded-[10px] border border-[#E2E8E8] mt-4">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className={thCls}>Kategori</th>
                    <th className={`${thCls} text-right`}>Jumlah</th>
                    {canEdit && <th className={thCls}>Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8E8]">
                  {cats.map((c: PlmAssessmentCategoryItem) => (
                    <tr key={c.id}>
                      <td className={tdCls}>
                        <div className="font-semibold">{c.category_name}</div>
                        <div className="text-[10px] text-[#5A6B75]">{c.description}</div>
                      </td>
                      <td className={`${tdCls} text-right font-mono font-bold whitespace-nowrap`}>{c.class_count} class</td>
                      {canEdit && (
                        <td className={tdCls}>
                          <div className="flex gap-1">
                            <button onClick={() => setEditCat({ ...c })} className="p-1.5 rounded hover:bg-[#E88932]/10 text-[#C66B1A] cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => window.confirm('Hapus kategori ini?') && run(() => mockStore.deletePlmAssessmentCategory(userId, c.id), 'Kategori dihapus.')} className="p-1.5 rounded hover:bg-[#B94C45]/10 text-[#B94C45] cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  <tr className="bg-[#263640] text-white font-bold">
                    <td className="px-3 py-2.5 text-xs">TOTAL</td>
                    <td className="px-3 py-2.5 text-xs text-right font-mono text-[#E88932]">{totalClass} class</td>
                    {canEdit && <td />}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex gap-2 p-2.5 rounded-[8px] bg-[#527FA1]/8 border border-[#527FA1]/25 text-[11px] text-[#3D6585]">
              <Info className="w-4 h-4 shrink-0" />
              <span>Angka pengali pada slide (min. 6 / 4) belum dikonfirmasi artinya, sehingga tidak digunakan dalam perhitungan. Total = penjumlahan langsung jumlah class tiap kategori.</span>
            </div>
          </SectionCard>
        </div>
        <div className="lg:col-span-3">
          <SectionCard title="Progress Fill Gap Assessment" subtitle="Gap All vs Fill Gap per jenis training">
            <GroupedBarChart
              categories={gaps.map((r) => r.code)}
              series={[
                { key: 'gap', label: 'Gap All', color: '#527FA1' },
                { key: 'fill', label: 'Fill Gap', color: '#E88932' },
              ]}
              data={gaps.map((r) => ({ gap: r.gap_all, fill: r.fill_gap }))}
              height={300}
            />
          </SectionCard>
        </div>
      </div>

      <SectionCard
        title="Detail Competency GAP per Jenis Training"
        subtitle="Mechanic Tangofa, Mechanic Genba, All GL, FGDP & GLDP"
        actions={canEdit ? <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setEditGap({ ...emptyGap, period_year: year === 'ALL' ? '2026' : year })}>Tambah Jenis Training</Button> : undefined}
      >
        <div className="overflow-x-auto rounded-[10px] border border-[#E2E8E8]">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thCls}>No</th>
                <th className={thCls}>Code</th>
                <th className={thCls}>Jenis Training</th>
                <th className={`${thCls} text-right`}>Gap All</th>
                <th className={`${thCls} text-right`}>Mech. Tangofa</th>
                <th className={`${thCls} text-right`}>Mech. Genba</th>
                <th className={`${thCls} text-right`}>All GL</th>
                <th className={`${thCls} text-right`}>FGDP & GLDP</th>
                <th className={`${thCls} text-right`}>Fill Gap</th>
                <th className={thCls}>On Prog.</th>
                {canEdit && <th className={thCls}>Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8E8]">
              {gaps.map((r) => {
                const p = Math.round(pctOf(r.fill_gap, r.gap_all));
                return (
                  <tr key={r.id} className="hover:bg-[#F4F6F5]/60 even:bg-[#FAFBFB]">
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
                    {canEdit && (
                      <td className={tdCls}>
                        <div className="flex gap-1">
                          <button onClick={() => setEditGap({ ...r })} className="p-1.5 rounded hover:bg-[#E88932]/10 text-[#C66B1A] cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => window.confirm(`Hapus ${r.code}?`) && run(() => mockStore.deletePlmCompetencyGapRow(userId, r.id), 'Jenis training dihapus.')} className="p-1.5 rounded hover:bg-[#B94C45]/10 text-[#B94C45] cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              <tr className="bg-[#263640] text-white font-bold">
                <td className="px-3 py-2.5 text-xs" colSpan={3}>All GAP Competences</td>
                <td className="px-3 py-2.5 text-xs text-right font-mono">{totGap}</td>
                <td className="px-3 py-2.5 text-xs text-right font-mono">{sum('mechanic_tangofa')}</td>
                <td className="px-3 py-2.5 text-xs text-right font-mono">{sum('mechanic_genba')}</td>
                <td className="px-3 py-2.5 text-xs text-right font-mono">{sum('all_gl')}</td>
                <td className="px-3 py-2.5 text-xs text-right font-mono">{sum('fgdp_gldp')}</td>
                <td className="px-3 py-2.5 text-xs text-right font-mono text-[#E88932]">{totFill}</td>
                <td className="px-3 py-2.5 text-xs font-mono text-[#E88932]">{Math.round(pctOf(totFill, totGap))}%</td>
                {canEdit && <td />}
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>

      <Modal open={!!editCat} title={editCat?.id ? 'Edit Kategori Assessment' : 'Tambah Kategori Assessment'} onClose={() => setEditCat(null)}>
        {editCat && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(() => {
                mockStore.savePlmAssessmentCategory(userId, editCat);
                setEditCat(null);
              }, 'Kategori assessment disimpan. Total dihitung ulang otomatis.');
            }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="col-span-2"><label className={labelCls}>Nama Kategori *</label><input required className={inputCls} value={editCat.category_name} onChange={(e) => setEditCat({ ...editCat, category_name: e.target.value })} /></div>
            <div><label className={labelCls}>Jumlah Class</label><input type="number" min={0} className={inputCls} value={editCat.class_count} onChange={(e) => setEditCat({ ...editCat, class_count: Number(e.target.value) })} /></div>
            <div><label className={labelCls}>Periode (Tahun)</label><input className={inputCls} value={editCat.period_year} onChange={(e) => setEditCat({ ...editCat, period_year: e.target.value })} /></div>
            <div className="col-span-2"><label className={labelCls}>Keterangan</label><textarea rows={2} className={`${inputCls} h-auto py-2`} value={editCat.description} onChange={(e) => setEditCat({ ...editCat, description: e.target.value })} /></div>
            <div className="col-span-2 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditCat(null)}>Batal</Button>
              <Button type="submit" size="sm" icon={<Save className="w-3.5 h-3.5" />}>Simpan</Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal wide open={!!editGap} title={editGap?.id ? 'Edit Jenis Training GAP' : 'Tambah Jenis Training GAP'} onClose={() => setEditGap(null)}>
        {editGap && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(() => {
                mockStore.savePlmCompetencyGapRow(userId, editGap);
                setEditGap(null);
              }, 'Data competency GAP disimpan. Grafik & total diperbarui.');
            }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            <div><label className={labelCls}>Code *</label><input required className={inputCls} value={editGap.code} onChange={(e) => setEditGap({ ...editGap, code: e.target.value })} /></div>
            <div className="col-span-2"><label className={labelCls}>Jenis Training *</label><input required className={inputCls} value={editGap.training_name} onChange={(e) => setEditGap({ ...editGap, training_name: e.target.value })} /></div>
            <div><label className={labelCls}>Periode</label><input className={inputCls} value={editGap.period_year} onChange={(e) => setEditGap({ ...editGap, period_year: e.target.value })} /></div>
            {(
              [
                ['gap_all', 'Gap All'],
                ['mechanic_tangofa', 'Mechanic Tangofa'],
                ['mechanic_genba', 'Mechanic Genba'],
                ['all_gl', 'All GL'],
                ['fgdp_gldp', 'FGDP & GLDP'],
                ['fill_gap', 'Fill Gap'],
              ] as const
            ).map(([k, l]) => (
              <div key={k}>
                <label className={labelCls}>{l}</label>
                <input type="number" min={0} className={inputCls} value={editGap[k]} onChange={(e) => setEditGap({ ...editGap, [k]: Number(e.target.value) })} />
              </div>
            ))}
            <div className="col-span-2 sm:col-span-4 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditGap(null)}>Batal</Button>
              <Button type="submit" size="sm" icon={<Save className="w-3.5 h-3.5" />}>Simpan</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

