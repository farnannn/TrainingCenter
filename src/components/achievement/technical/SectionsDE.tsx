import React, { useState } from 'react';
import { mockStore } from '../../../lib/mockStore';
import { OjtBmcMonitoringRecord, SharingSessionBmcRecord } from '../../../lib/types';
import { Button } from '../../ui/Button';
import { Plus, Edit3, Trash2, Download, Printer, Save, MapPin, Calendar, Users } from 'lucide-react';
import {
  SectionCard,
  StatusPill,
  StatCard,
  Modal,
  DonutChart,
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
import type { SectionProps } from './SectionsAB';

// ==============================================================================
// D. MONITORING OJT BMC
// ==============================================================================
const emptyOjt = {
  student_name: '',
  batch: 'BMC Reguler 2026',
  department_placement: 'PLM (Plant & Logistics Management)',
  location: 'Site Tangofa',
  student_count: 1,
  ojt_period: '',
  mentor_name: '',
  ojt_status: 'On Going' as OjtBmcMonitoringRecord['ojt_status'],
  ojt_evaluation: '',
};

export const OjtBmcSection: React.FC<SectionProps> = ({ canEdit, userId, onDone, onError }) => {
  const list = mockStore.technicalTrainingModule.ojtBmcRecords;
  const [locFilter, setLocFilter] = useState('ALL');
  const [editing, setEditing] = useState<(typeof emptyOjt & { id?: string }) | null>(null);
  const filtered = list.filter((o) => locFilter === 'ALL' || o.location === locFilter);
  const total = list.reduce((s, o) => s + o.student_count, 0);
  const byLoc = Array.from(new Set(list.map((o) => o.location))).map((loc) => ({
    loc,
    count: list.filter((o) => o.location === loc).reduce((s, o) => s + o.student_count, 0),
  }));
  const palette = ['#E88932', '#527FA1', '#397C69', '#D5A33D', '#B94C45', '#263640'];

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      mockStore.saveOjtBmcRecord(userId, editing);
      setEditing(null);
      onDone('Data Monitoring OJT BMC berhasil disimpan.');
    } catch (err: any) {
      onError(err.message);
    }
  };
  const del = (o: OjtBmcMonitoringRecord) => {
    if (!window.confirm(`Hapus data "${o.student_name}"?`)) return;
    try {
      mockStore.deleteOjtBmcRecord(userId, o.id);
      onDone('Data Monitoring OJT BMC dihapus.');
    } catch (err: any) {
      onError(err.message);
    }
  };
  const headers = ['No', 'Nama Siswa / Kelompok', 'Batch', 'Departemen', 'Lokasi', 'Jumlah Siswa', 'Periode OJT', 'Mentor', 'Status', 'Evaluasi'];
  const rows = filtered.map((o, i) => [i + 1, o.student_name, o.batch, o.department_placement, o.location, o.student_count, o.ojt_period, o.mentor_name, o.ojt_status, o.ojt_evaluation]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
          <StatCard label="Total Siswa BMC OJT" value={total} unit="Siswa" tone="dark" icon={<Users className="w-4 h-4" />} />
          {byLoc.map((b) => (
            <StatCard key={b.loc} label={b.loc} value={b.count} unit="Siswa" tone="light" icon={<MapPin className="w-4 h-4" />} />
          ))}
        </div>
        <div className="lg:col-span-2">
          <SectionCard title="Distribusi Siswa OJT BMC per Lokasi">
            <DonutChart
              centerValue={String(total)}
              centerLabel="Siswa OJT"
              segments={byLoc.map((b, i) => ({ label: b.loc, value: b.count, color: palette[i % palette.length] }))}
              size={190}
            />
          </SectionCard>
        </div>
      </div>

      <SectionCard
        title="Monitoring OJT BMC"
        subtitle="Monitor & kontrol siswa BMC yang mengikuti OJT di Dept PLM Tangofa & TPM"
        actions={
          <>
            <select value={locFilter} onChange={(e) => setLocFilter(e.target.value)} className={`${inputCls} w-auto h-[32px]`}>
              <option value="ALL">Semua Lokasi</option>
              {mockStore.sites.map((s) => <option key={s.id}>{s.name}</option>)}
            </select>
            <Button variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={() => exportCsv('Monitoring_OJT_BMC.csv', headers, rows)}>Excel</Button>
            <Button variant="outline" size="sm" icon={<Printer className="w-3.5 h-3.5" />} onClick={() => printTable('Monitoring OJT BMC', headers, rows)}>PDF</Button>
            {canEdit && <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setEditing({ ...emptyOjt })}>Tambah Data</Button>}
          </>
        }
      >
        <div className="overflow-x-auto rounded-[10px] border border-[#E2E8E8]">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thCls}>Nama Siswa / Kelompok</th>
                <th className={thCls}>Batch</th>
                <th className={thCls}>Penempatan</th>
                <th className={`${thCls} text-right`}>Jml Siswa</th>
                <th className={thCls}>Periode</th>
                <th className={thCls}>Mentor</th>
                <th className={thCls}>Status</th>
                {canEdit && <th className={thCls}>Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8E8]">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-[#F4F6F5]/60 even:bg-[#FAFBFB]">
                  <td className={tdCls}>
                    <div className="font-semibold">{o.student_name}</div>
                    {o.ojt_evaluation && <div className="text-[11px] text-[#5A6B75] mt-0.5 max-w-sm">{o.ojt_evaluation}</div>}
                  </td>
                  <td className={`${tdCls} text-[11px]`}>{o.batch}</td>
                  <td className={`${tdCls} text-[11px]`}>
                    <div>{o.department_placement.split(' (')[0]}</div>
                    <div className="text-[#C66B1A] font-semibold">{o.location}</div>
                  </td>
                  <td className={`${tdCls} text-right font-mono font-bold text-base`}>{o.student_count}</td>
                  <td className={`${tdCls} text-[11px] whitespace-nowrap`}>{o.ojt_period}</td>
                  <td className={`${tdCls} text-[11px]`}>{o.mentor_name}</td>
                  <td className={tdCls}><StatusPill status={o.ojt_status} /></td>
                  {canEdit && (
                    <td className={tdCls}>
                      <div className="flex gap-1">
                        <button onClick={() => setEditing({ ...o })} className="p-1.5 rounded hover:bg-[#E88932]/10 text-[#C66B1A] cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => del(o)} className="p-1.5 rounded hover:bg-[#B94C45]/10 text-[#B94C45] cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              <tr className="bg-[#263640] text-white font-bold">
                <td className="px-3 py-2.5 text-xs" colSpan={3}>TOTAL SISWA OJT BMC</td>
                <td className="px-3 py-2.5 text-xs text-right font-mono text-[#E88932]">{filtered.reduce((s, o) => s + o.student_count, 0)}</td>
                <td colSpan={canEdit ? 4 : 3} />
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>

      <Modal wide open={!!editing} title={editing?.id ? 'Edit Monitoring OJT BMC' : 'Tambah Monitoring OJT BMC'} onClose={() => setEditing(null)}>
        {editing && (
          <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2"><label className={labelCls}>Nama Siswa / Kelompok *</label><input required className={inputCls} value={editing.student_name} onChange={(e) => setEditing({ ...editing, student_name: e.target.value })} /></div>
            <div><label className={labelCls}>Batch</label><input className={inputCls} value={editing.batch} onChange={(e) => setEditing({ ...editing, batch: e.target.value })} /></div>
            <div><label className={labelCls}>Jumlah Siswa</label><input type="number" min={1} className={inputCls} value={editing.student_count} onChange={(e) => setEditing({ ...editing, student_count: Number(e.target.value) })} /></div>
            <div>
              <label className={labelCls}>Departemen Penempatan</label>
              <select className={inputCls} value={editing.department_placement} onChange={(e) => setEditing({ ...editing, department_placement: e.target.value })}>
                {mockStore.departments.map((d) => <option key={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Lokasi</label>
              <select className={inputCls} value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })}>
                {mockStore.sites.map((s) => <option key={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Periode OJT</label><input className={inputCls} value={editing.ojt_period} onChange={(e) => setEditing({ ...editing, ojt_period: e.target.value })} /></div>
            <div>
              <label className={labelCls}>Status OJT</label>
              <select className={inputCls} value={editing.ojt_status} onChange={(e) => setEditing({ ...editing, ojt_status: e.target.value as any })}>
                <option>On Going</option><option>Completed</option><option>Evaluated</option><option>Pending</option>
              </select>
            </div>
            <div className="sm:col-span-2"><label className={labelCls}>Mentor / Pembimbing</label><input className={inputCls} value={editing.mentor_name} onChange={(e) => setEditing({ ...editing, mentor_name: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className={labelCls}>Evaluasi OJT</label><textarea rows={3} className={`${inputCls} h-auto py-2`} value={editing.ojt_evaluation} onChange={(e) => setEditing({ ...editing, ojt_evaluation: e.target.value })} /></div>
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
// E. SHARING SESSION BMC BATCH VII
// ==============================================================================
const emptySession = {
  session_title: '',
  batch: 'BMC Batch VII',
  schedule_date: new Date().toISOString().slice(0, 10),
  location: 'Training Center PT. RAJA — Site Tangofa',
  instructor_name: '',
  target_participants: 17,
  actual_attendance: 0,
  execution_status: 'Scheduled' as SharingSessionBmcRecord['execution_status'],
  documentation_notes: '',
};

export const SharingSessionSection: React.FC<SectionProps> = ({ canEdit, userId, onDone, onError }) => {
  const list = mockStore.technicalTrainingModule.sharingSessionRecords;
  const [editing, setEditing] = useState<(typeof emptySession & { id?: string }) | null>(null);
  const totTarget = list.reduce((s, r) => s + r.target_participants, 0);
  const totActual = list.reduce((s, r) => s + r.actual_attendance, 0);
  const doneCount = list.filter((r) => r.execution_status === 'Done').length;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      mockStore.saveSharingSessionBmcRecord(userId, editing);
      setEditing(null);
      onDone('Jadwal Sharing Session BMC berhasil disimpan.');
    } catch (err: any) {
      onError(err.message);
    }
  };
  const del = (r: SharingSessionBmcRecord) => {
    if (!window.confirm(`Hapus sesi "${r.session_title}"?`)) return;
    try {
      mockStore.deleteSharingSessionBmcRecord(userId, r.id);
      onDone('Sesi berhasil dihapus.');
    } catch (err: any) {
      onError(err.message);
    }
  };
  const headers = ['No', 'Judul Sesi', 'Batch', 'Jadwal', 'Lokasi', 'Instruktur', 'Target Peserta', 'Aktual Hadir', 'Kehadiran %', 'Status', 'Dokumentasi'];
  const rows = list.map((r, i) => [i + 1, r.session_title, r.batch, r.schedule_date, r.location, r.instructor_name, r.target_participants, r.actual_attendance, fmtPct(pctOf(r.actual_attendance, r.target_participants)), r.execution_status, r.documentation_notes]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Sesi" value={list.length} unit="Sesi" hint={`${doneCount} sesi selesai (Done)`} tone="dark" />
        <StatCard label="Target Peserta" value={totTarget} unit="Siswa" tone="blue" />
        <StatCard label="Aktual Kehadiran" value={totActual} unit="Siswa" tone="green" />
        <StatCard label="Tingkat Kehadiran" value={fmtPct(pctOf(totActual, totTarget))} hint="Aktual / Target × 100%" tone="orange" />
      </div>

      <SectionCard
        title="Sharing Session BMC Batch VII"
        subtitle="Jadwal, jumlah peserta, aktual kehadiran, status pelaksanaan & dokumentasi kegiatan"
        actions={
          <>
            <Button variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={() => exportCsv('Sharing_Session_BMC.csv', headers, rows)}>Excel</Button>
            <Button variant="outline" size="sm" icon={<Printer className="w-3.5 h-3.5" />} onClick={() => printTable('Sharing Session BMC Batch VII', headers, rows)}>PDF</Button>
            {canEdit && <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setEditing({ ...emptySession })}>Tambah Sesi</Button>}
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {list.length === 0 && <p className="text-xs text-[#5A6B75]">Belum ada sesi.</p>}
          {list.map((r) => {
            const pct = pctOf(r.actual_attendance, r.target_participants);
            return (
              <div key={r.id} className="rounded-[12px] border border-[#E2E8E8] p-4 hover:shadow-sm transition-shadow bg-gradient-to-br from-white to-[#FAF3DD]/40">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-[#18232B] text-[#E88932] font-mono text-[10px] font-bold">{r.batch}</span>
                    <h4 className="text-sm font-heading font-bold text-[#18232B] mt-1.5">{r.session_title}</h4>
                  </div>
                  <StatusPill status={r.execution_status} />
                </div>
                <div className="mt-2 space-y-1 text-[11px] text-[#5A6B75]">
                  <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#E88932]" />{new Date(r.schedule_date).toLocaleDateString('id-ID', { dateStyle: 'long' })}</div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#E88932]" />{r.location}</div>
                  <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[#E88932]" />{r.instructor_name}</div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Kehadiran</span>
                    <span className="font-mono font-bold">{r.actual_attendance}/{r.target_participants} Siswa ({fmtPct(pct)})</span>
                  </div>
                  <ProgressBar value={pct} />
                </div>
                {r.documentation_notes && <p className="mt-2 text-[11px] text-[#263640] bg-white/80 rounded-[8px] p-2 border border-[#E2E8E8]">{r.documentation_notes}</p>}
                {canEdit && (
                  <div className="mt-3 flex justify-end gap-1.5">
                    <Button variant="outline" size="sm" icon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => setEditing({ ...r })}>Edit</Button>
                    <Button variant="danger" size="sm" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => del(r)}>Hapus</Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {list.length > 0 && (
          <div className="overflow-x-auto rounded-[10px] border border-[#E2E8E8] mt-4">
            <table className="w-full">
              <thead>
                <tr>
                  <th className={thCls}>Jadwal</th>
                  <th className={thCls}>Sesi</th>
                  <th className={`${thCls} text-right`}>Target</th>
                  <th className={`${thCls} text-right`}>Aktual</th>
                  <th className={thCls}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E8]">
                {list.map((r) => (
                  <tr key={r.id} className="even:bg-[#FAFBFB]">
                    <td className={`${tdCls} font-mono text-[11px]`}>{r.schedule_date}</td>
                    <td className={tdCls}>{r.session_title}</td>
                    <td className={`${tdCls} text-right font-mono`}>{r.target_participants}</td>
                    <td className={`${tdCls} text-right font-mono font-bold`}>{r.actual_attendance}</td>
                    <td className={tdCls}><StatusPill status={r.execution_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <Modal wide open={!!editing} title={editing?.id ? 'Edit Sharing Session' : 'Tambah Sharing Session'} onClose={() => setEditing(null)}>
        {editing && (
          <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2"><label className={labelCls}>Judul Sesi *</label><input required className={inputCls} value={editing.session_title} onChange={(e) => setEditing({ ...editing, session_title: e.target.value })} /></div>
            <div><label className={labelCls}>Batch</label><input className={inputCls} value={editing.batch} onChange={(e) => setEditing({ ...editing, batch: e.target.value })} /></div>
            <div><label className={labelCls}>Jadwal</label><input type="date" className={inputCls} value={editing.schedule_date} onChange={(e) => setEditing({ ...editing, schedule_date: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className={labelCls}>Lokasi</label><input className={inputCls} value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className={labelCls}>Instruktur</label><input className={inputCls} value={editing.instructor_name} onChange={(e) => setEditing({ ...editing, instructor_name: e.target.value })} /></div>
            <div><label className={labelCls}>Jumlah Peserta (Target)</label><input type="number" min={0} className={inputCls} value={editing.target_participants} onChange={(e) => setEditing({ ...editing, target_participants: Number(e.target.value) })} /></div>
            <div><label className={labelCls}>Aktual Kehadiran</label><input type="number" min={0} className={inputCls} value={editing.actual_attendance} onChange={(e) => setEditing({ ...editing, actual_attendance: Number(e.target.value) })} /></div>
            <div>
              <label className={labelCls}>Status Pelaksanaan</label>
              <select className={inputCls} value={editing.execution_status} onChange={(e) => setEditing({ ...editing, execution_status: e.target.value as any })}>
                <option>Done</option><option>On Going</option><option>Scheduled</option><option>Pending</option>
              </select>
            </div>
            <div className="sm:col-span-2"><label className={labelCls}>Dokumentasi / Keterangan Kegiatan</label><textarea rows={3} className={`${inputCls} h-auto py-2`} value={editing.documentation_notes} onChange={(e) => setEditing({ ...editing, documentation_notes: e.target.value })} /></div>
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

