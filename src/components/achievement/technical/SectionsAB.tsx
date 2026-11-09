import React, { useMemo, useState } from 'react';
import { mockStore } from '../../../lib/mockStore';
import {
  TechnicalTrainingClassProgram,
  CandidateMechanicPositionRow,
} from '../../../lib/types';
import { Button } from '../../ui/Button';
import { Plus, Edit3, Trash2, Download, Printer, Search, Save } from 'lucide-react';
import {
  SectionCard,
  StatusPill,
  StatCard,
  Modal,
  GroupedBarChart,
  ProgressBar,
  exportCsv,
  printTable,
  inputCls,
  labelCls,
  thCls,
  tdCls,
  pctOf,
  fmtPct,
} from './shared';

export interface SectionProps {
  canEdit: boolean;
  userId: string;
  onDone: (msg: string) => void;
  onError: (msg: string) => void;
}

// ==============================================================================
// A. TRAINING CLASS & COMPETENCY GAP
// ==============================================================================
const emptyProgram = {
  program_name: '',
  department_area: 'PLM • Site Tangofa & Site Genba',
  target_participants: 0,
  actual_participants: 0,
  execution_period: '',
  status: 'On Going' as TechnicalTrainingClassProgram['status'],
  remarks: '',
};

export const TrainingClassGapSection: React.FC<SectionProps> = ({ canEdit, userId, onDone, onError }) => {
  const list = mockStore.technicalTrainingModule.trainingClassPrograms;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editing, setEditing] = useState<(typeof emptyProgram & { id?: string }) | null>(null);

  const filtered = list.filter(
    (p) =>
      (statusFilter === 'ALL' || p.status === statusFilter) &&
      (p.program_name + p.department_area + p.remarks).toLowerCase().includes(search.toLowerCase())
  );
  const totTarget = list.reduce((s, p) => s + p.target_participants, 0);
  const totActual = list.reduce((s, p) => s + p.actual_participants, 0);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      mockStore.saveTechnicalTrainingClassProgram(userId, editing);
      setEditing(null);
      onDone('Program Training Class & Competency GAP berhasil disimpan.');
    } catch (err: any) {
      onError(err.message);
    }
  };
  const del = (id: string) => {
    if (!window.confirm('Hapus program training ini?')) return;
    try {
      mockStore.deleteTechnicalTrainingClassProgram(userId, id);
      onDone('Program berhasil dihapus.');
    } catch (err: any) {
      onError(err.message);
    }
  };
  const headers = ['No', 'Nama Program', 'Departemen/Area', 'Target Peserta', 'Aktual Peserta', 'Capaian %', 'Periode', 'Status', 'Keterangan'];
  const rows = filtered.map((p, i) => [
    i + 1,
    p.program_name,
    p.department_area,
    p.target_participants,
    p.actual_participants,
    fmtPct(pctOf(p.actual_participants, p.target_participants)),
    p.execution_period,
    p.status,
    p.remarks,
  ]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Program" value={list.length} unit="Program" tone="dark" />
        <StatCard label="Target Peserta" value={totTarget} unit="Peserta" tone="blue" />
        <StatCard label="Aktual Peserta" value={totActual} unit="Peserta" tone="green" />
        <StatCard label="Capaian Peserta" value={fmtPct(pctOf(totActual, totTarget))} hint="Aktual / Target × 100%" tone="orange" />
      </div>

      <SectionCard
        title="Training Class & Competency GAP"
        subtitle="Aktivitas training class pemenuhan competency berdasarkan GAP TNA Crew PLM Tangofa & Genba"
        actions={
          <>
            <Button variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={() => exportCsv('Training_Class_Competency_GAP.csv', headers, rows)}>
              Excel
            </Button>
            <Button variant="outline" size="sm" icon={<Printer className="w-3.5 h-3.5" />} onClick={() => printTable('Training Class & Competency GAP', headers, rows)}>
              PDF
            </Button>
            {canEdit && (
              <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setEditing({ ...emptyProgram })}>
                Tambah Program
              </Button>
            )}
          </>
        }
      >
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6B75]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari program / area..." className={`${inputCls} pl-8`} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${inputCls} w-auto`}>
            <option value="ALL">Semua Status</option>
            <option>On Going</option>
            <option>Completed</option>
            <option>Scheduled</option>
            <option>Pending</option>
          </select>
        </div>
        <div className="overflow-x-auto rounded-[10px] border border-[#E2E8E8]">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thCls}>No</th>
                <th className={thCls}>Nama Program Training</th>
                <th className={thCls}>Dept / Area</th>
                <th className={`${thCls} text-right`}>Target</th>
                <th className={`${thCls} text-right`}>Aktual</th>
                <th className={thCls}>Capaian</th>
                <th className={thCls}>Periode</th>
                <th className={thCls}>Status</th>
                {canEdit && <th className={thCls}>Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8E8]">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-xs text-[#5A6B75]">Tidak ada data.</td>
                </tr>
              )}
              {filtered.map((p, i) => {
                const pct = pctOf(p.actual_participants, p.target_participants);
                return (
                  <tr key={p.id} className="hover:bg-[#F4F6F5]/60 even:bg-[#FAFBFB]">
                    <td className={`${tdCls} font-mono`}>{i + 1}</td>
                    <td className={tdCls}>
                      <div className="font-semibold">{p.program_name}</div>
                      {p.remarks && <div className="text-[11px] text-[#5A6B75] mt-0.5">{p.remarks}</div>}
                    </td>
                    <td className={`${tdCls} text-[11px]`}>{p.department_area}</td>
                    <td className={`${tdCls} text-right font-mono`}>{p.target_participants}</td>
                    <td className={`${tdCls} text-right font-mono font-bold`}>{p.actual_participants}</td>
                    <td className={`${tdCls} min-w-[110px]`}>
                      <div className="text-[11px] font-mono font-bold mb-1">{fmtPct(pct)}</div>
                      <ProgressBar value={pct} />
                    </td>
                    <td className={`${tdCls} text-[11px] whitespace-nowrap`}>{p.execution_period}</td>
                    <td className={tdCls}><StatusPill status={p.status} /></td>
                    {canEdit && (
                      <td className={tdCls}>
                        <div className="flex gap-1">
                          <button onClick={() => setEditing({ ...p })} className="p-1.5 rounded hover:bg-[#E88932]/10 text-[#C66B1A] cursor-pointer" title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => del(p.id)} className="p-1.5 rounded hover:bg-[#B94C45]/10 text-[#B94C45] cursor-pointer" title="Hapus"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <Modal open={!!editing} title={editing?.id ? 'Edit Program Training Class' : 'Tambah Program Training Class'} onClose={() => setEditing(null)}>
        {editing && (
          <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className={labelCls}>Nama Program Training *</label>
              <input required className={inputCls} value={editing.program_name} onChange={(e) => setEditing({ ...editing, program_name: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Departemen / Area</label>
              <input className={inputCls} value={editing.department_area} onChange={(e) => setEditing({ ...editing, department_area: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Target Peserta</label>
              <input type="number" min={0} className={inputCls} value={editing.target_participants} onChange={(e) => setEditing({ ...editing, target_participants: Number(e.target.value) })} />
            </div>
            <div>
              <label className={labelCls}>Aktual Peserta</label>
              <input type="number" min={0} className={inputCls} value={editing.actual_participants} onChange={(e) => setEditing({ ...editing, actual_participants: Number(e.target.value) })} />
            </div>
            <div>
              <label className={labelCls}>Periode Pelaksanaan</label>
              <input className={inputCls} placeholder="Mei – November 2026" value={editing.execution_period} onChange={(e) => setEditing({ ...editing, execution_period: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Status Program</label>
              <select className={inputCls} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as any })}>
                <option>On Going</option>
                <option>Completed</option>
                <option>Scheduled</option>
                <option>Pending</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Keterangan</label>
              <textarea rows={2} className={`${inputCls} h-auto py-2`} value={editing.remarks} onChange={(e) => setEditing({ ...editing, remarks: e.target.value })} />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditing(null)}>Batal</Button>
              <Button type="submit" size="sm" icon={<Save className="w-3.5 h-3.5" />}>Simpan</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

// ==============================================================================
// B. INTERVIEW CANDIDATE MECHANIC + TABEL 2. DATA ASSESSMENT CANDIDATE MECHANIC
// ==============================================================================
const emptyPosRow = {
  candidate_position: '',
  total_masuk: 0,
  sudah_itv: 0,
  recommended_m3_up: 0,
  site_tangofa: 0,
  site_tpm: 0,
  remark: '',
};

export const InterviewCandidateSection: React.FC<SectionProps> = ({ canEdit, userId, onDone, onError }) => {
  const mod = mockStore.technicalTrainingModule;
  const rows = mod.candidatePositionRecap;
  const summary = mod.interviewSummary;
  const [editing, setEditing] = useState<(typeof emptyPosRow & { id?: string }) | null>(null);
  const [editSummary, setEditSummary] = useState<typeof summary | null>(null);

  const totals = useMemo(
    () => ({
      masuk: rows.reduce((s, r) => s + r.total_masuk, 0),
      itv: rows.reduce((s, r) => s + r.sudah_itv, 0),
      rec: rows.reduce((s, r) => s + r.recommended_m3_up, 0),
      tangofa: rows.reduce((s, r) => s + r.site_tangofa, 0),
      tpm: rows.reduce((s, r) => s + r.site_tpm, 0),
    }),
    [rows, mod.updated_at]
  );

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      mockStore.saveCandidatePositionRecapRow(userId, editing);
      setEditing(null);
      onDone('Data posisi kandidat berhasil disimpan. Total interview otomatis diperbarui.');
    } catch (err: any) {
      onError(err.message);
    }
  };
  const del = (r: CandidateMechanicPositionRow) => {
    if (!window.confirm(`Hapus baris "${r.candidate_position}"?`)) return;
    try {
      mockStore.deleteCandidatePositionRecapRow(userId, r.id);
      onDone('Baris berhasil dihapus.');
    } catch (err: any) {
      onError(err.message);
    }
  };
  const saveSummary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSummary) return;
    try {
      mockStore.updateInterviewCandidateSummary(userId, editSummary);
      setEditSummary(null);
      onDone('Ringkasan interview berhasil diperbarui.');
    } catch (err: any) {
      onError(err.message);
    }
  };

  const headers = ['No', 'Candidate', 'Jlh Peserta Masuk', 'Sudah Itv', 'Recommended (M3 Middle Up)', 'Site Tangofa', 'Site TPM', 'Remark'];
  const exportRows: (string | number)[][] = [
    ...rows.map((r) => [r.no, r.candidate_position, r.total_masuk, r.sudah_itv, r.recommended_m3_up, r.site_tangofa, r.site_tpm, r.remark]),
    ['', 'TOTAL', totals.masuk, totals.itv, totals.rec, totals.tangofa, totals.tpm, ''],
  ];

  return (
    <div className="space-y-4">
      {/* Headline banner */}
      <div className="bg-[#18232B] bg-topography text-white rounded-[14px] p-5 border border-[#263640] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono text-[#E88932] uppercase tracking-wider font-bold">Interview Candidate Mechanic • {summary.area_scope}</div>
          <div className="text-lg font-heading font-bold mt-1">{summary.headline_label}</div>
          <p className="text-[11px] text-slate-300 mt-1 max-w-2xl">{summary.notes}</p>
          {summary.updated_by && (
            <p className="text-[10px] text-slate-400 mt-1 font-mono">Diperbarui: {summary.updated_by} • {new Date(summary.updated_at).toLocaleString('id-ID')}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center px-4 py-2 rounded-[10px] bg-white/5 border border-white/10">
            <div className="text-3xl font-heading font-extrabold text-[#E88932]">{totals.itv}x</div>
            <div className="text-[10px] font-mono text-slate-300">DONE</div>
          </div>
          <StatusPill status={summary.status} />
          {canEdit && (
            <Button size="sm" variant="secondary" icon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => setEditSummary({ ...summary })}>
              Edit Ringkasan
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="Peserta Masuk" value={totals.masuk} unit="Kandidat" tone="dark" />
        <StatCard label="Sudah Interview" value={totals.itv} unit="Kandidat" hint={`${fmtPct(pctOf(totals.itv, totals.masuk))} dari peserta masuk`} tone="orange" />
        <StatCard label="Recommended M3 Up" value={totals.rec} unit="Kandidat" hint={`${fmtPct(pctOf(totals.rec, totals.itv))} dari yang di-interview`} tone="green" />
        <StatCard label="Site Tangofa" value={totals.tangofa} unit="Kandidat" tone="blue" />
        <StatCard label="Site TPM" value={totals.tpm} unit="Kandidat" tone="blue" />
      </div>

      <SectionCard
        title="Assessment Candidate Mechanic"
        subtitle="Rekap per posisi kandidat — total dihitung otomatis"
        actions={
          <>
            <Button variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={() => exportCsv('Data_Assessment_Candidate_Mechanic.csv', headers, exportRows)}>Excel</Button>
            <Button variant="outline" size="sm" icon={<Printer className="w-3.5 h-3.5" />} onClick={() => printTable('Data Assessment Candidate Mechanic', headers, exportRows, summary.headline_label)}>PDF</Button>
            {canEdit && <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setEditing({ ...emptyPosRow })}>Tambah Posisi</Button>}
          </>
        }
      >
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
                {canEdit && <th className={thCls} rowSpan={2}>Aksi</th>}
              </tr>
              <tr>
                <th className={`${thCls} text-right`}>Tangofa</th>
                <th className={`${thCls} text-right`}>TPM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8E8]">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-[#F4F6F5]/60 even:bg-[#FAFBFB]">
                  <td className={`${tdCls} font-mono`}>{r.no}</td>
                  <td className={`${tdCls} font-semibold`}>{r.candidate_position}</td>
                  <td className={`${tdCls} text-right font-mono`}>{r.total_masuk}</td>
                  <td className={`${tdCls} text-right font-mono`}>{r.sudah_itv}</td>
                  <td className={`${tdCls} text-right font-mono font-bold text-[#296050]`}>{r.recommended_m3_up}</td>
                  <td className={`${tdCls} text-right font-mono`}>{r.site_tangofa || '-'}</td>
                  <td className={`${tdCls} text-right font-mono`}>{r.site_tpm || '-'}</td>
                  <td className={`${tdCls} text-[11px] text-[#5A6B75]`}>{r.remark}</td>
                  {canEdit && (
                    <td className={tdCls}>
                      <div className="flex gap-1">
                        <button onClick={() => setEditing({ ...r })} className="p-1.5 rounded hover:bg-[#E88932]/10 text-[#C66B1A] cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => del(r)} className="p-1.5 rounded hover:bg-[#B94C45]/10 text-[#B94C45] cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              <tr className="bg-[#263640] text-white font-bold">
                <td className="px-3 py-2.5 text-xs" colSpan={2}>TOTAL</td>
                <td className="px-3 py-2.5 text-xs text-right font-mono">{totals.masuk}</td>
                <td className="px-3 py-2.5 text-xs text-right font-mono text-[#E88932]">{totals.itv}</td>
                <td className="px-3 py-2.5 text-xs text-right font-mono">{totals.rec}</td>
                <td className="px-3 py-2.5 text-xs text-right font-mono">{totals.tangofa}</td>
                <td className="px-3 py-2.5 text-xs text-right font-mono">{totals.tpm}</td>
                <td colSpan={canEdit ? 2 : 1} />
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Grafik Funnel Kandidat per Posisi" subtitle="Peserta Masuk vs Sudah Interview vs Recommended (M3 Middle Up)">
        <GroupedBarChart
          categories={rows.map((r) => r.candidate_position)}
          series={[
            { key: 'masuk', label: 'Peserta Masuk', color: '#527FA1' },
            { key: 'itv', label: 'Sudah Itv', color: '#E88932' },
            { key: 'rec', label: 'Recommended', color: '#397C69' },
          ]}
          data={rows.map((r) => ({ masuk: r.total_masuk, itv: r.sudah_itv, rec: r.recommended_m3_up }))}
          height={260}
        />
      </SectionCard>

      <Modal open={!!editing} title={editing?.id ? 'Edit Posisi Kandidat' : 'Tambah Posisi Kandidat'} onClose={() => setEditing(null)}>
        {editing && (
          <form onSubmit={save} className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Candidate / Posisi *</label>
              <input required className={inputCls} value={editing.candidate_position} onChange={(e) => setEditing({ ...editing, candidate_position: e.target.value })} />
            </div>
            {(
              [
                ['total_masuk', 'Jlh Peserta Masuk'],
                ['sudah_itv', 'Sudah Itv'],
                ['recommended_m3_up', 'Recommended (M3 Middle Up)'],
                ['site_tangofa', 'Site Tangofa'],
                ['site_tpm', 'Site TPM'],
              ] as const
            ).map(([k, l]) => (
              <div key={k}>
                <label className={labelCls}>{l}</label>
                <input type="number" min={0} className={inputCls} value={editing[k]} onChange={(e) => setEditing({ ...editing, [k]: Number(e.target.value) })} />
              </div>
            ))}
            <div className="col-span-2">
              <label className={labelCls}>Remark</label>
              <input className={inputCls} value={editing.remark} onChange={(e) => setEditing({ ...editing, remark: e.target.value })} />
            </div>
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditing(null)}>Batal</Button>
              <Button type="submit" size="sm" icon={<Save className="w-3.5 h-3.5" />}>Simpan</Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={!!editSummary} title="Edit Ringkasan Interview Candidate" onClose={() => setEditSummary(null)}>
        {editSummary && (
          <form onSubmit={saveSummary} className="grid grid-cols-1 gap-3">
            <div>
              <label className={labelCls}>Judul / Headline</label>
              <input className={inputCls} value={editSummary.headline_label} onChange={(e) => setEditSummary({ ...editSummary, headline_label: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Status</label>
                <select className={inputCls} value={editSummary.status} onChange={(e) => setEditSummary({ ...editSummary, status: e.target.value as any })}>
                  <option>On Going</option>
                  <option>Completed</option>
                  <option>Pending</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Area / Cakupan</label>
                <input className={inputCls} value={editSummary.area_scope} onChange={(e) => setEditSummary({ ...editSummary, area_scope: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Catatan</label>
              <textarea rows={3} className={`${inputCls} h-auto py-2`} value={editSummary.notes} onChange={(e) => setEditSummary({ ...editSummary, notes: e.target.value })} />
            </div>
            <p className="text-[11px] text-[#5A6B75]">Jumlah "Done" dihitung otomatis dari total kolom <strong>Sudah Itv</strong> pada tabel.</p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditSummary(null)}>Batal</Button>
              <Button type="submit" size="sm" icon={<Save className="w-3.5 h-3.5" />}>Simpan</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

