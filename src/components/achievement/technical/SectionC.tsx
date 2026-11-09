import React, { useState } from 'react';
import { mockStore } from '../../../lib/mockStore';
import { CandidateMechanicAssessmentRecord, CandidateAssessmentStatus } from '../../../lib/types';
import { Button } from '../../ui/Button';
import { Plus, Edit3, Trash2, Download, Printer, Search, Save, History } from 'lucide-react';
import {
  SectionCard,
  StatusPill,
  StatCard,
  Modal,
  DonutChart,
  exportCsv,
  printTable,
  inputCls,
  labelCls,
  thCls,
  tdCls,
} from './shared';
import type { SectionProps } from './SectionsAB';

const STATUSES: CandidateAssessmentStatus[] = ['Passed', 'Failed', 'Pending', 'On Going'];

const emptyRecord = {
  candidate_name: '',
  nik: '',
  department: 'PLM (Plant & Logistics Management)',
  current_position: '',
  target_position: '',
  site_location: 'Site Tangofa',
  assessment_date: new Date().toISOString().slice(0, 10),
  assessor: '',
  assessment_result: '',
  status: 'On Going' as CandidateAssessmentStatus,
  assessor_notes: '',
};

export const AssessmentCandidateSection: React.FC<SectionProps> = ({ canEdit, userId, onDone, onError }) => {
  const list = mockStore.technicalTrainingModule.candidateAssessments;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [siteFilter, setSiteFilter] = useState('ALL');
  const [editing, setEditing] = useState<(typeof emptyRecord & { id?: string }) | null>(null);
  const [historyFor, setHistoryFor] = useState<CandidateMechanicAssessmentRecord | null>(null);

  const departments = Array.from(new Set(list.map((c) => c.department)));
  const filtered = list.filter((c) => {
    const q = search.toLowerCase();
    return (
      (statusFilter === 'ALL' || c.status === statusFilter) &&
      (deptFilter === 'ALL' || c.department === deptFilter) &&
      (siteFilter === 'ALL' || c.site_location === siteFilter) &&
      (c.candidate_name + c.nik + c.target_position + c.assessor).toLowerCase().includes(q)
    );
  });
  const count = (s: CandidateAssessmentStatus) => filtered.filter((c) => c.status === s).length;
  const toggleStatusFilter = (s: string) =>
    setStatusFilter((prev) => (prev === s ? 'ALL' : s));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      mockStore.saveCandidateAssessmentRecord(userId, editing);
      setEditing(null);
      onDone('Data assessment kandidat berhasil disimpan.');
    } catch (err: any) {
      onError(err.message);
    }
  };
  const del = (c: CandidateMechanicAssessmentRecord) => {
    if (!window.confirm(`Hapus data assessment "${c.candidate_name}"?`)) return;
    try {
      mockStore.deleteCandidateAssessmentRecord(userId, c.id);
      onDone('Data assessment kandidat berhasil dihapus.');
    } catch (err: any) {
      onError(err.message);
    }
  };

  const headers = ['No', 'Nama Kandidat', 'NIK', 'Departemen', 'Site', 'Posisi Saat Ini', 'Posisi Dituju', 'Tanggal', 'Assessor', 'Hasil', 'Status', 'Catatan'];
  const rows = filtered.map((c, i) => [
    i + 1, c.candidate_name, c.nik, c.department, c.site_location || '-', c.current_position, c.target_position,
    c.assessment_date, c.assessor, c.assessment_result, c.status, c.assessor_notes,
  ]);

  const historyLogs = historyFor
    ? mockStore.auditLogs.filter((l) => l.table_name === 'assessment_candidate_mechanic' && l.record_id === historyFor.id)
    : [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          label="Total Kandidat (Aktual)"
          value={filtered.length}
          unit="Kandidat"
          hint={filtered.length !== list.length ? `Dari ${list.length} total kandidat` : 'Klik kartu status untuk filter'}
          tone="dark"
          active={statusFilter === 'ALL'}
          onClick={() => setStatusFilter('ALL')}
        />
        <StatCard
          label="Passed"
          value={count('Passed')}
          unit="Kandidat"
          tone="green"
          active={statusFilter === 'Passed'}
          onClick={() => toggleStatusFilter('Passed')}
        />
        <StatCard
          label="On Going"
          value={count('On Going')}
          unit="Kandidat"
          tone="light"
          active={statusFilter === 'On Going'}
          onClick={() => toggleStatusFilter('On Going')}
        />
        <StatCard
          label="Pending"
          value={count('Pending')}
          unit="Kandidat"
          tone="blue"
          active={statusFilter === 'Pending'}
          onClick={() => toggleStatusFilter('Pending')}
        />
        <StatCard
          label="Failed"
          value={count('Failed')}
          unit="Kandidat"
          tone="red"
          active={statusFilter === 'Failed'}
          onClick={() => toggleStatusFilter('Failed')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <SectionCard title="Komposisi Status Assessment" subtitle="Terhubung data aktual (klik untuk filter)">
            <DonutChart
              centerValue={String(filtered.length)}
              centerLabel="Kandidat"
              selectedLabel={statusFilter}
              onSelectSegment={(lbl) => toggleStatusFilter(lbl)}
              segments={[
                { label: 'Passed', value: count('Passed'), color: '#397C69' },
                { label: 'On Going', value: count('On Going'), color: '#E88932' },
                { label: 'Pending', value: count('Pending'), color: '#D5A33D' },
                { label: 'Failed', value: count('Failed'), color: '#B94C45' },
              ]}
            />
          </SectionCard>
        </div>
        <div className="lg:col-span-2">
          <SectionCard title="Rekap Aktual per Posisi yang Dituju" subtitle="Passed vs Belum Passed dari data kandidat">
            <div className="space-y-2.5">
              {Array.from(new Set(filtered.map((c) => c.target_position))).map((pos) => {
                const items = filtered.filter((c) => c.target_position === pos);
                const passed = items.filter((c) => c.status === 'Passed').length;
                return (
                  <div key={pos} className="flex items-center gap-3 text-xs">
                    <span className="w-44 truncate font-semibold text-[#18232B]">{pos}</span>
                    <div className="flex-1 h-5 bg-[#F4F6F5] rounded-[6px] overflow-hidden flex border border-[#E2E8E8]">
                      <div className="bg-[#397C69] h-full transition-all" style={{ width: `${(passed / items.length) * 100}%` }} title={`Passed: ${passed}`} />
                      <div className="bg-[#E88932]/75 h-full transition-all" style={{ width: `${((items.length - passed) / items.length) * 100}%` }} />
                    </div>
                    <span className="font-mono font-bold w-16 text-right">{passed}/{items.length}</span>
                  </div>
                );
              })}
              {filtered.length === 0 && <p className="text-xs text-[#5A6B75]">Belum ada data yang sesuai filter.</p>}
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard
        title="Assessment Candidate Mechanic"
        subtitle="Pencatatan hasil assessment kandidat mekanik yang dipromosikan ke posisi tertentu"
        actions={
          <>
            <Button variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={() => exportCsv('Assessment_Candidate_Mechanic.csv', headers, rows)}>Excel</Button>
            <Button variant="outline" size="sm" icon={<Printer className="w-3.5 h-3.5" />} onClick={() => printTable('Assessment Candidate Mechanic', headers, rows)}>PDF</Button>
            {canEdit && <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setEditing({ ...emptyRecord })}>Tambah Kandidat</Button>}
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-3">
          <div className="relative sm:col-span-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6B75]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama / NIK / posisi..." className={`${inputCls} pl-8`} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputCls}>
            <option value="ALL">Semua Status</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className={inputCls}>
            <option value="ALL">Semua Departemen</option>
            {departments.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)} className={inputCls}>
            <option value="ALL">Semua Site</option>
            {mockStore.sites.map((s) => <option key={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto rounded-[10px] border border-[#E2E8E8]">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thCls}>Kandidat</th>
                <th className={thCls}>Dept / Site</th>
                <th className={thCls}>Posisi Saat Ini → Dituju</th>
                <th className={thCls}>Tanggal</th>
                <th className={thCls}>Assessor</th>
                <th className={thCls}>Hasil Assessment</th>
                <th className={thCls}>Status</th>
                <th className={thCls}>Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8E8]">
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="p-6 text-center text-xs text-[#5A6B75]">Tidak ada data yang cocok dengan filter.</td></tr>
              )}
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-[#F4F6F5]/60 even:bg-[#FAFBFB]">
                  <td className={tdCls}>
                    <div className="font-semibold">{c.candidate_name}</div>
                    <div className="text-[11px] font-mono text-[#E88932]">{c.nik}</div>
                  </td>
                  <td className={`${tdCls} text-[11px]`}>
                    <div>{c.department.split(' (')[0]}</div>
                    <div className="text-[#5A6B75]">{c.site_location}</div>
                  </td>
                  <td className={`${tdCls} text-[11px]`}>
                    <span className="text-[#5A6B75]">{c.current_position}</span> → <strong>{c.target_position}</strong>
                  </td>
                  <td className={`${tdCls} font-mono text-[11px] whitespace-nowrap`}>{c.assessment_date}</td>
                  <td className={`${tdCls} text-[11px]`}>{c.assessor}</td>
                  <td className={`${tdCls} text-[11px] max-w-[220px]`}>
                    <div>{c.assessment_result}</div>
                    {c.assessor_notes && <div className="text-[#5A6B75] italic mt-0.5 line-clamp-2">“{c.assessor_notes}”</div>}
                  </td>
                  <td className={tdCls}><StatusPill status={c.status} /></td>
                  <td className={tdCls}>
                    <div className="flex gap-1">
                      <button onClick={() => setHistoryFor(c)} className="p-1.5 rounded hover:bg-[#527FA1]/10 text-[#527FA1] cursor-pointer" title="Riwayat"><History className="w-3.5 h-3.5" /></button>
                      {canEdit && (
                        <>
                          <button onClick={() => setEditing({ ...emptyRecord, ...c, site_location: c.site_location || 'Site Tangofa' })} className="p-1.5 rounded hover:bg-[#E88932]/10 text-[#C66B1A] cursor-pointer" title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => del(c)} className="p-1.5 rounded hover:bg-[#B94C45]/10 text-[#B94C45] cursor-pointer" title="Hapus"><Trash2 className="w-3.5 h-3.5" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-[#5A6B75] mt-2">Menampilkan {filtered.length} dari {list.length} kandidat.</p>
      </SectionCard>

      <Modal wide open={!!editing} title={editing?.id ? 'Edit Assessment Kandidat' : 'Tambah Assessment Kandidat'} onClose={() => setEditing(null)}>
        {editing && (
          <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className={labelCls}>Nama Kandidat *</label><input required className={inputCls} value={editing.candidate_name} onChange={(e) => setEditing({ ...editing, candidate_name: e.target.value })} /></div>
            <div><label className={labelCls}>NIK *</label><input required className={inputCls} value={editing.nik} onChange={(e) => setEditing({ ...editing, nik: e.target.value })} /></div>
            <div>
              <label className={labelCls}>Departemen</label>
              <select className={inputCls} value={editing.department} onChange={(e) => setEditing({ ...editing, department: e.target.value })}>
                {mockStore.departments.map((d) => <option key={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Site</label>
              <select className={inputCls} value={editing.site_location} onChange={(e) => setEditing({ ...editing, site_location: e.target.value })}>
                {mockStore.sites.map((s) => <option key={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Posisi Saat Ini *</label><input required className={inputCls} value={editing.current_position} onChange={(e) => setEditing({ ...editing, current_position: e.target.value })} /></div>
            <div><label className={labelCls}>Posisi yang Dituju *</label><input required className={inputCls} value={editing.target_position} onChange={(e) => setEditing({ ...editing, target_position: e.target.value })} /></div>
            <div><label className={labelCls}>Tanggal Assessment</label><input type="date" className={inputCls} value={editing.assessment_date} onChange={(e) => setEditing({ ...editing, assessment_date: e.target.value })} /></div>
            <div><label className={labelCls}>Assessor *</label><input required className={inputCls} value={editing.assessor} onChange={(e) => setEditing({ ...editing, assessor: e.target.value })} /></div>
            <div><label className={labelCls}>Hasil Assessment</label><input className={inputCls} value={editing.assessment_result} onChange={(e) => setEditing({ ...editing, assessment_result: e.target.value })} /></div>
            <div>
              <label className={labelCls}>Status</label>
              <select className={inputCls} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as CandidateAssessmentStatus })}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2"><label className={labelCls}>Catatan Assessor</label><textarea rows={3} className={`${inputCls} h-auto py-2`} value={editing.assessor_notes} onChange={(e) => setEditing({ ...editing, assessor_notes: e.target.value })} /></div>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditing(null)}>Batal</Button>
              <Button type="submit" size="sm" icon={<Save className="w-3.5 h-3.5" />}>Simpan</Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={!!historyFor} title={`Riwayat Assessment — ${historyFor?.candidate_name || ''}`} onClose={() => setHistoryFor(null)}>
        {historyFor && (
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-[10px] bg-[#F4F6F5] border border-[#E2E8E8]">
              <div>Dibuat: <strong>{new Date(historyFor.created_at).toLocaleString('id-ID')}</strong></div>
              <div>Terakhir diperbarui: <strong>{new Date(historyFor.updated_at).toLocaleString('id-ID')}</strong> oleh <strong>{historyFor.updated_by || '-'}</strong></div>
            </div>
            {historyLogs.length === 0 ? (
              <p className="text-[#5A6B75]">Belum ada perubahan tercatat setelah data awal.</p>
            ) : (
              <ol className="space-y-2">
                {historyLogs.map((l) => (
                  <li key={l.id} className="p-3 rounded-[10px] border border-[#E2E8E8]">
                    <div className="flex justify-between gap-2">
                      <span className="font-mono font-bold text-[#C66B1A]">{l.action}</span>
                      <span className="text-[#5A6B75]">{new Date(l.created_at).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="text-[#5A6B75]">Oleh: {l.actor_name || l.actor_id}</div>
                    {l.old_values && l.new_values && (
                      <div className="mt-1">Status: {l.old_values.status} → <strong>{l.new_values.status}</strong></div>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

