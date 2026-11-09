import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { mockStore } from '../../../lib/mockStore';
import {
  TechnicalTrainerDailyActivityItem,
  getRolePermissions,
} from '../../../lib/types';
import { Button } from '../../ui/Button';
import {
  Plus,
  Edit3,
  Trash2,
  Download,
  Printer,
  Search,
  Save,
  Upload,
  X,
  Image as ImageIcon,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Lock,
  ZoomIn,
  RotateCcw,
} from 'lucide-react';
import {
  StatCard,
  Modal,
  exportCsv,
  inputCls,
  labelCls,
} from './shared';
import type { SectionProps } from './SectionsAB';
import { PlanTechnicalAndSharingSection } from './PlanTechnicalAndSharingSection';

const DEFAULT_ROW_PHOTOS: Record<string, string[]> = {
  'dta-1': ['/images/activity-trainer/doc-1a.jpg', '/images/activity-trainer/doc-1b.jpg'],
  'dta-2': ['/images/activity-trainer/doc-2a.jpg', '/images/activity-trainer/doc-2b.jpg'],
  'dta-3': ['/images/activity-trainer/doc-3a.jpg', '/images/activity-trainer/doc-3b.jpg'],
  'dta-4': ['/images/activity-trainer/doc-4a.jpg', '/images/activity-trainer/doc-4b.jpg'],
  'dta-5': ['/images/activity-trainer/doc-5a.jpg', '/images/activity-trainer/doc-5b.jpg'],
  'dta-6': ['/images/activity-trainer/doc-6a.jpg', '/images/activity-trainer/doc-6b.jpg'],
};

const MONTH_NAMES: Record<string, string> = {
  '01': 'JANUARY',
  '02': 'FEBRUARY',
  '03': 'MARCH',
  '04': 'APRIL',
  '05': 'MAY',
  '06': 'JUNE',
  '07': 'JULY',
  '08': 'AUGUST',
  '09': 'SEPTEMBER',
  '10': 'OCTOBER',
  '11': 'NOVEMBER',
  '12': 'DECEMBER',
};

const emptyForm = {
  date_label: '',
  attendents: '',
  dept: 'PLM',
  activities: '',
  remarks: 'Done',
  photos: [] as string[],
  week_label: 'WEEK 1 NOVEMBER 2026',
  year: '2026',
  month: '11',
  week_number: 1,
};

// Compress uploaded image file into lightweight JPEG data URL
const compressImageFile = (file: File, maxWidth = 640, quality = 0.78): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(ev.target?.result || ''));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = String(ev.target?.result || '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const ActivityTechnicalTrainingSection: React.FC<SectionProps> = ({
  canEdit,
  userId,
  onDone,
  onError,
}) => {
  const list = mockStore.technicalTrainingModule.dailyTrainerActivities || [];
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [remarkFilter, setRemarkFilter] = useState('ALL');
  const [weekFilter, setWeekFilter] = useState('ALL');
  const [editing, setEditing] = useState<(typeof emptyForm & { id?: string }) | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; caption: string } | null>(null);
  const [, setForceTick] = useState(0);

  // Auto-restore default documentation photos if any default row (dta-1..dta-6) has empty photos
  useEffect(() => {
    const activities = mockStore.technicalTrainingModule.dailyTrainerActivities || [];
    let restoredAny = false;
    activities.forEach((item) => {
      if (DEFAULT_ROW_PHOTOS[item.id] && (!item.photos || item.photos.length === 0)) {
        item.photos = [...DEFAULT_ROW_PHOTOS[item.id]];
        restoredAny = true;
      }
    });
    if (restoredAny) {
      mockStore.persistState();
      setForceTick((t) => t + 1);
    }
  }, [list.length]);

  const weekOptions = Array.from(
    new Set(['WEEK 1 NOVEMBER 2026', ...list.map((a) => a.week_label || 'WEEK 1 NOVEMBER 2026')])
  );
  const deptOptions = Array.from(new Set(['PLM', 'All dept', ...list.map((a) => a.dept)]));

  const filtered = list.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (item.date_label + item.attendents + item.dept + item.activities + item.remarks)
        .toLowerCase()
        .includes(q);
    const matchDept = deptFilter === 'ALL' || item.dept === deptFilter;
    const matchRemark = remarkFilter === 'ALL' || item.remarks === remarkFilter;
    const matchWeek =
      weekFilter === 'ALL' || (item.week_label || 'WEEK 1 NOVEMBER 2026') === weekFilter;
    return matchSearch && matchDept && matchRemark && matchWeek;
  });

  const doneCount = list.filter((a) => a.remarks.toLowerCase() === 'done').length;
  const continueCount = list.filter((a) => a.remarks.toLowerCase() === 'continue').length;
  const totalPhotos = list.reduce((s, a) => s + (a.photos?.length || 0), 0);

  const activeBannerTitle =
    weekFilter === 'ALL'
      ? 'OTHER DAILY ACTIVITAS TECHNICAL TRAINER - WEEK 1 NOVEMBER 2026'
      : `OTHER DAILY ACTIVITAS TECHNICAL TRAINER - ${weekFilter.toUpperCase()}`;

  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editing || !e.target.files) return;
    const files = Array.from(e.target.files);
    try {
      const dataUrls = await Promise.all(files.map((f) => compressImageFile(f)));
      setEditing({
        ...editing,
        photos: [...editing.photos, ...dataUrls],
      });
    } catch {
      onError('Gagal memuat file gambar.');
    }
    e.target.value = '';
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      const monthName = MONTH_NAMES[editing.month] || 'NOVEMBER';
      const computedWeekLabel =
        editing.week_label.trim() || `WEEK ${editing.week_number} ${monthName} ${editing.year}`;
      mockStore.saveDailyTrainerActivity(userId, {
        ...editing,
        week_label: computedWeekLabel,
      });
      setEditing(null);
      onDone('Data Activity Technical Training berhasil disimpan.');
    } catch (err: any) {
      onError(err.message || 'Gagal menyimpan data aktivitas.');
    }
  };

  const handleDelete = (item: TechnicalTrainerDailyActivityItem) => {
    if (!window.confirm(`Hapus aktivitas tanggal "${item.date_label}" (${item.attendents})?`)) return;
    try {
      mockStore.deleteDailyTrainerActivity(userId, item.id);
      onDone('Data aktivitas berhasil dihapus.');
    } catch (err: any) {
      onError(err.message);
    }
  };

  const csvHeaders = ['NO', 'DATE', 'ATTENDENTS', 'DEPT', 'ACTIVITIES', 'REMRKS', 'JUMLAH FOTO'];
  const csvRows = filtered.map((item, idx) => [
    idx + 1,
    item.date_label,
    item.attendents,
    item.dept,
    item.activities,
    item.remarks,
    item.photos?.length || 0,
  ]);

  const handlePrintWithPhotos = () => {
    const win = window.open('', '_blank', 'width=1100,height=780');
    if (!win) return;
    const rowsHtml = filtered
      .map(
        (item, idx) => `
        <tr>
          <td style="text-align:center;font-weight:700;">${idx + 1}</td>
          <td style="text-align:center;white-space:nowrap;">${item.date_label}</td>
          <td style="text-align:center;font-weight:600;">${item.attendents}</td>
          <td style="text-align:center;">${item.dept}</td>
          <td>${item.activities}</td>
          <td style="text-align:center;font-weight:600;">${item.remarks}</td>
          <td style="text-align:center;">
            <div style="display:flex;gap:4px;justify-content:center;">
              ${(item.photos || [])
                .map(
                  (p) =>
                    `<img src="${p}" style="width:95px;height:64px;object-fit:cover;border:1px solid #ccc;border-radius:3px;" />`
                )
                .join('')}
            </div>
          </td>
        </tr>`
      )
      .join('');

    win.document.write(`<!doctype html><html><head><title>${activeBannerTitle}</title>
      <style>
        body{font-family:'Plus Jakarta Sans','Segoe UI',Arial,sans-serif;padding:20px;color:#18232B}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th,td{border:1px solid #CBD5E1;padding:6px 8px;vertical-align:middle}
        .dark-hdr{background:#18232B;color:#FFFFFF;font-weight:800;text-align:center;font-size:13px;letter-spacing:0.04em}
        .sub-hdr{background:#263640;color:#E88932;font-weight:700;text-align:center;font-size:10px;letter-spacing:0.06em}
      </style></head><body>
      <table>
        <thead>
          <tr>
            <th class="dark-hdr" rowspan="2" style="width:42px;">NO.</th>
            <th class="dark-hdr" colspan="6">${activeBannerTitle}</th>
          </tr>
          <tr>
            <th class="sub-hdr" style="width:105px;">DATE</th>
            <th class="sub-hdr" style="width:165px;">ATTENDENTS</th>
            <th class="sub-hdr" style="width:75px;">DEPT</th>
            <th class="sub-hdr">ACTIVITIES</th>
            <th class="sub-hdr" style="width:85px;">REMRKS</th>
            <th class="sub-hdr" style="width:210px;">DOKUMENTASI</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <script>window.onload=()=>window.print();</script>
      </body></html>`);
    win.document.close();
  };

  return (
    <div className="space-y-4">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Aktivitas Harian" value={list.length} unit="Kegiatan" tone="dark" />
        <StatCard label="Status Done" value={doneCount} unit="Kegiatan" tone="green" />
        <StatCard label="Status Continue" value={continueCount} unit="Kegiatan" tone="orange" />
        <StatCard label="Total Foto Dokumentasi" value={totalPhotos} unit="Foto" tone="blue" />
      </div>

      {/* Filter & Action Toolbar */}
      <div className="bg-white rounded-[14px] border border-[#E2E8E8] shadow-xs p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-heading font-extrabold text-[#18232B]">
              ACTIVITY TECHNICAL TRAINING
            </h3>
            <p className="text-xs text-[#5A6B75]">
              Rekap aktivitas harian Technical Trainer beserta dokumentasi kegiatan
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={() => exportCsv('Activity_Technical_Training.csv', csvHeaders, csvRows)}
            >
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Printer className="w-3.5 h-3.5" />}
              onClick={handlePrintWithPhotos}
            >
              PDF
            </Button>
            {canEdit && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                  onClick={() => {
                    try {
                      mockStore.restoreDefaultDailyTrainerPhotos(userId);
                      onDone('Seluruh foto dokumentasi default berhasil dikembalikan.');
                    } catch (err: any) {
                      onError(err.message);
                    }
                  }}
                >
                  Kembalikan Foto Default
                </Button>
                <Button
                  size="sm"
                  icon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() =>
                    setEditing({
                      ...emptyForm,
                      week_label: weekFilter === 'ALL' ? 'WEEK 1 NOVEMBER 2026' : weekFilter,
                    })
                  }
                >
                  Tambah Aktivitas
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-[#E2E8E8]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6B75]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari tanggal / peserta / aktivitas..."
              className={`${inputCls} pl-8`}
            />
          </div>
          <select value={weekFilter} onChange={(e) => setWeekFilter(e.target.value)} className={inputCls}>
            <option value="ALL">Semua Minggu / Periode</option>
            {weekOptions.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className={inputCls}>
            <option value="ALL">Semua Dept</option>
            {deptOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select value={remarkFilter} onChange={(e) => setRemarkFilter(e.target.value)} className={inputCls}>
            <option value="ALL">Semua Status (Remarks)</option>
            <option value="Done">Done</option>
            <option value="Continue">Continue</option>
            <option value="On Going">On Going</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Main Unified Enterprise Table */}
      <div className="bg-white rounded-[14px] border border-[#E2E8E8] shadow-xs overflow-hidden">
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
                  colSpan={canEdit ? 7 : 6}
                  className="bg-[#18232B] text-white font-heading font-bold text-xs sm:text-sm px-4 py-2.5 border-b border-[#263640] text-center uppercase tracking-wider"
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-[#E88932] mr-2 align-middle" />
                  {activeBannerTitle}
                </th>
              </tr>
              <tr className="bg-[#263640] text-slate-100 font-mono font-bold text-[10px] uppercase tracking-wider">
                <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-center w-28">DATE</th>
                <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-center w-44">ATTENDENTS</th>
                <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-center w-24">DEPT</th>
                <th className="px-4 py-2.5 border-r border-[#18232B]/50 text-left min-w-[280px]">
                  ACTIVITIES
                </th>
                <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-center w-28">REMRKS</th>
                <th className="px-3 py-2.5 border-r border-[#18232B]/50 text-center w-56">DOKUMENTASI</th>
                {canEdit && (
                  <th className="px-3 py-2.5 text-center w-20">AKSI</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8E8]">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={canEdit ? 8 : 7}
                    className="p-8 text-center text-xs text-[#5A6B75]"
                  >
                    Belum ada data aktivitas harian untuk filter ini.
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => {
                  const isDone = item.remarks.toLowerCase() === 'done';
                  return (
                    <tr
                      key={item.id}
                      className="even:bg-[#FAFBFB] odd:bg-white hover:bg-[#F4F6F5]/70 transition-colors"
                    >
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
                      <td className="p-2 border-r border-[#E2E8E8]">
                        {item.photos && item.photos.length > 0 ? (
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {item.photos.map((photoUrl, pIdx) => (
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
                        ) : (
                          <div className="text-center text-[11px] text-[#5A6B75] italic py-2">
                            Belum ada foto
                          </div>
                        )}
                      </td>
                      {canEdit && (
                        <td className="px-2 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setEditing({
                                  id: item.id,
                                  date_label: item.date_label,
                                  attendents: item.attendents,
                                  dept: item.dept,
                                  activities: item.activities,
                                  remarks: item.remarks,
                                  photos: [...(item.photos || [])],
                                  week_label: item.week_label || 'WEEK 1 NOVEMBER 2026',
                                  year: item.year || '2026',
                                  month: item.month || '11',
                                  week_number: item.week_number || 1,
                                })
                              }
                              className="p-1.5 rounded hover:bg-[#E88932]/15 text-[#C66B1A] cursor-pointer"
                              title="Edit Baris"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item)}
                              className="p-1.5 rounded hover:bg-[#B94C45]/15 text-[#B94C45] cursor-pointer"
                              title="Hapus Baris"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Unified Footer Bar + Quick Add Button */}
        <div className="bg-[#F4F6F5] border-t border-[#E2E8E8] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-mono text-[#5A6B75]">
            Menampilkan <strong className="text-[#18232B]">{filtered.length}</strong> aktivitas harian Technical Trainer
          </span>
          {canEdit && (
            <Button
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() =>
                setEditing({
                  ...emptyForm,
                  week_label: weekFilter === 'ALL' ? 'WEEK 1 NOVEMBER 2026' : weekFilter,
                })
              }
            >
              + Tambah Aktivitas Harian Baru
            </Button>
          )}
        </div>
      </div>

      {/* Plan Training Technical di Bulan Nov 2026 & Plan Sharing Session 17x Siswa BMC Batch VII */}
      <PlanTechnicalAndSharingSection
        canEdit={canEdit}
        userId={userId}
        onDone={onDone}
        onError={onError}
      />

      {/* Modal Tambah / Edit Aktivitas */}
      <Modal
        wide
        open={!!editing}
        title={
          editing?.id
            ? 'Edit Activity Technical Training'
            : 'Tambah Activity Technical Training'
        }
        onClose={() => setEditing(null)}
      >
        {editing && (
          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Tanggal (DATE) *</label>
              <input
                required
                placeholder="Contoh: 29 Oct. 2026 / 01-2 Nov. 2026"
                className={inputCls}
                value={editing.date_label}
                onChange={(e) => setEditing({ ...editing, date_label: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Peserta (ATTENDENTS) *</label>
              <input
                required
                placeholder="Contoh: 3x Siswa OJT / 4x FGDP"
                className={inputCls}
                value={editing.attendents}
                onChange={(e) => setEditing({ ...editing, attendents: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Departemen (DEPT) *</label>
              <input
                required
                placeholder="Contoh: PLM / All dept"
                className={inputCls}
                value={editing.dept}
                onChange={(e) => setEditing({ ...editing, dept: e.target.value })}
              />
            </div>

            <div className="sm:col-span-3">
              <label className={labelCls}>Uraian Aktivitas (ACTIVITIES) *</label>
              <textarea
                required
                rows={3}
                placeholder="Tuliskan rincian aktivitas harian Technical Trainer..."
                className={`${inputCls} h-auto py-2`}
                value={editing.activities}
                onChange={(e) => setEditing({ ...editing, activities: e.target.value })}
              />
            </div>

            <div>
              <label className={labelCls}>Status (REMRKS)</label>
              <select
                className={inputCls}
                value={editing.remarks}
                onChange={(e) => setEditing({ ...editing, remarks: e.target.value })}
              >
                <option value="Done">Done</option>
                <option value="Continue">Continue</option>
                <option value="On Going">On Going</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Periode Bulan & Tahun</label>
              <div className="grid grid-cols-2 gap-1.5">
                <select
                  className={inputCls}
                  value={editing.month}
                  onChange={(e) => {
                    const m = e.target.value;
                    const mName = MONTH_NAMES[m] || 'NOVEMBER';
                    setEditing({
                      ...editing,
                      month: m,
                      week_label: `WEEK ${editing.week_number} ${mName} ${editing.year}`,
                    });
                  }}
                >
                  {Object.entries(MONTH_NAMES).map(([code, name]) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
                <select
                  className={inputCls}
                  value={editing.year}
                  onChange={(e) => {
                    const y = e.target.value;
                    const mName = MONTH_NAMES[editing.month] || 'NOVEMBER';
                    setEditing({
                      ...editing,
                      year: y,
                      week_label: `WEEK ${editing.week_number} ${mName} ${y}`,
                    });
                  }}
                >
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Minggu Ke- (Week)</label>
              <select
                className={inputCls}
                value={editing.week_number}
                onChange={(e) => {
                  const w = Number(e.target.value);
                  const mName = MONTH_NAMES[editing.month] || 'NOVEMBER';
                  setEditing({
                    ...editing,
                    week_number: w,
                    week_label: `WEEK ${w} ${mName} ${editing.year}`,
                  });
                }}
              >
                <option value={1}>Week 1 (Minggu 1)</option>
                <option value={2}>Week 2 (Minggu 2)</option>
                <option value={3}>Week 3 (Minggu 3)</option>
                <option value={4}>Week 4 (Minggu 4)</option>
                <option value={5}>Week 5 (Minggu 5)</option>
              </select>
            </div>

            {/* Dokumentasi Foto Upload */}
            <div className="sm:col-span-3 space-y-2 pt-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className={labelCls}>
                  Foto Dokumentasi Kegiatan ({editing.photos.length} Foto)
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {editing.id && DEFAULT_ROW_PHOTOS[editing.id] && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditing({
                          ...editing,
                          photos: [...DEFAULT_ROW_PHOTOS[editing.id!]],
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-[#E2E8E8] bg-[#F4F6F5] text-[#18232B] text-xs font-semibold hover:bg-[#E2E8E8] cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#E88932]" />
                      <span>Kembalikan Foto Default</span>
                    </button>
                  )}
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#18232B] text-white text-xs font-semibold hover:bg-[#263640] cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#E88932]" />
                    <span>Upload Foto Dokumentasi</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleUploadFiles}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {editing.photos.length === 0 ? (
                <div className="p-4 rounded-[10px] border border-dashed border-[#CBD5E1] bg-[#F4F6F5] text-center text-xs text-[#5A6B75] flex flex-col items-center gap-1">
                  <ImageIcon className="w-5 h-5 text-[#5A6B75]" />
                  <span>Belum ada foto dipilih. Klik tombol "Upload Foto Dokumentasi" untuk menambahkan 1 atau 2 foto kegiatan.</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5 p-3 rounded-[10px] bg-[#F4F6F5] border border-[#E2E8E8]">
                  {editing.photos.map((photo, i) => (
                    <div
                      key={i}
                      className="relative w-32 h-22 rounded-[8px] overflow-hidden border border-[#CBD5E1] bg-white group"
                    >
                      <img src={photo} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setEditing({
                            ...editing,
                            photos: editing.photos.filter((_, idx) => idx !== i),
                          })
                        }
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-[#B94C45] cursor-pointer"
                        title="Hapus Foto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="sm:col-span-3 flex justify-end gap-2 pt-2 border-t border-[#E2E8E8]">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditing(null)}>
                Batal
              </Button>
              <Button type="submit" size="sm" icon={<Save className="w-3.5 h-3.5" />}>
                Simpan Aktivitas
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Lightbox Preview Foto Dokumentasi */}
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

// Standalone View when accessed directly from Sidebar -> Training Achievement -> Activity Technical Training
export const ActivityTechnicalTrainingView: React.FC = () => {
  const { currentUser, refreshState } = useAuth();
  const perms = getRolePermissions(currentUser.role_code);
  const canEdit = perms.trainingAchievement === 'EDIT' && perms.canEditData;
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  return (
    <div className="space-y-5">
      <div className="bg-[#18232B] bg-topography text-white p-5 rounded-[14px] border border-[#263640] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#E88932] text-xs font-mono font-semibold uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>TRAINING ACHIEVEMENT • ACTIVITY TECHNICAL TRAINING</span>
          </div>
          <h2 className="text-lg sm:text-xl font-heading font-bold mt-1">
            OTHER DAILY ACTIVITAS TECHNICAL TRAINER
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Monitoring aktivitas harian Technical Trainer, peserta, departemen, status pelaksanaan, dan dokumentasi kegiatan.
          </p>
        </div>

        <div>
          {canEdit ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#397C69]/25 border border-[#397C69]/50 text-[#6CD4B4] text-xs font-mono font-semibold">
              Mode Akses: EDIT ({currentUser.role_name})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#263640] border border-slate-700 text-slate-300 text-xs font-mono font-semibold">
              <Lock className="w-3.5 h-3.5 text-[#E88932]" />
              <span>VIEW ONLY ({currentUser.role_name})</span>
            </span>
          )}
        </div>
      </div>

      {toast && (
        <div
          className={`p-3.5 rounded-[10px] text-xs flex items-center justify-between gap-2 border ${
            toast.type === 'ok'
              ? 'bg-[#397C69]/12 border-[#397C69]/30 text-[#296050]'
              : 'bg-[#B94C45]/10 border-[#B94C45]/30 text-[#B94C45]'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {toast.type === 'ok' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{toast.msg}</span>
          </div>
          <button onClick={() => setToast(null)} className="cursor-pointer opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <ActivityTechnicalTrainingSection
        canEdit={canEdit}
        userId={currentUser.id}
        onDone={(msg) => {
          refreshState();
          setToast({ type: 'ok', msg: `${msg} Otomatis terintegrasi ke Capaian Training.` });
        }}
        onError={(msg) => setToast({ type: 'err', msg })}
      />
    </div>
  );
};

