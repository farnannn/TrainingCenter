import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import { getRolePermissions } from '../../lib/types';
import { RajaLogo } from '../ui/RajaLogo';
import { Button } from '../ui/Button';
import {
  Award,
  CheckCircle2,
  FileText,
  Printer,
  Download,
  Camera,
  Search,
  Filter,
  ArrowLeft,
  ChevronRight,
  Plus,
  X,
  Table,
  IdCard,
  MapPin,
} from 'lucide-react';

export const CertificationList: React.FC = () => {
  const { currentUser, refreshState } = useAuth();
  const role = currentUser.role_code;

  // Visible employees respecting RLS
  const visibleEmployees = mockStore.getVisibleEmployees(currentUser.id);

  // View Mode: 'report' (List of employees -> click to open Training History Report) | 'all' (All certificates table)
  const [viewMode, setViewMode] = useState<'report' | 'all'>('report');
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [certFilter, setCertFilter] = useState<'ALL' | 'HAS_CERT' | 'NO_CERT'>('ALL');

  // Modal for adding historical certification record manually (HOD TC / Super Admin)
  const [showAddCertModal, setShowAddCertModal] = useState(false);
  const [certName, setCertName] = useState('');
  const [certNo, setCertNo] = useState('');
  const [issuingBody, setIssuingBody] = useState('PT. Roda Jaya Sakti Training Center');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [durationLabel, setDurationLabel] = useState('2 Days (16 Hours)');
  const [venue, setVenue] = useState('Training Center PT. RAJA — Site Morowali');

  const photoInputRef = useRef<HTMLInputElement | null>(null);

  // Only resolve activeEmployee when an employee is explicitly clicked/selected from the list
  const activeEmployee = selectedEmpId
    ? visibleEmployees.find((e) => e.id === selectedEmpId) || null
    : null;

  const activeDept = activeEmployee
    ? mockStore.departments.find((d) => d.id === activeEmployee.department_id)
    : null;

  // All visible certificates across allowed scope
  const visibleCerts = mockStore.certifications;

  // Combined Training & Certification History for the selected employee
  const employeeHistoryItems = React.useMemo(() => {
    if (!activeEmployee) return [];

    const empCerts = mockStore.certifications.filter(
      (c) => c.employee_id === activeEmployee.id
    );

    // Also include any completed training records that might not yet be in empCerts
    const empCompletedRecords = mockStore.records.filter(
      (r) =>
        r.employee_id === activeEmployee.id &&
        r.attendance_status === 'ATTENDED' &&
        !empCerts.some((c) => c.record_id === r.id)
    );

    const items = [
      ...empCerts.map((c) => {
        const linkedRec = c.record_id
          ? mockStore.records.find((r) => r.id === c.record_id)
          : undefined;
        const linkedSched = linkedRec
          ? mockStore.schedules.find((s) => s.id === linkedRec.schedule_id)
          : undefined;

        return {
          id: c.id,
          trainingName: c.certificate_name,
          certificateNumber: c.certificate_number,
          issuingBody: c.issuing_body,
          level: c.certification_level,
          dateRaw: c.issue_date,
          duration:
            c.duration_label ||
            (linkedSched
              ? `${Math.max(1, Math.round(linkedSched.total_hours / 8))} Days (${linkedSched.total_hours} Hours)`
              : '2 Days (16 Hours)'),
          venue:
            c.venue ||
            linkedSched?.venue ||
            'Training Center PT. RAJA — Site Morowali',
          status: c.status,
        };
      }),
      ...empCompletedRecords.map((r) => {
        const sched = mockStore.schedules.find((s) => s.id === r.schedule_id);
        const app = mockStore.applications.find((a) => a.id === r.application_id);
        const hrs = r.training_hours_completed || sched?.total_hours || 16;
        const days = Math.max(1, Math.round(hrs / 8));
        return {
          id: r.id,
          trainingName: app?.training_title || sched?.application_title || 'Completed Training',
          certificateNumber: `REC-${r.id.slice(0, 6).toUpperCase()}`,
          issuingBody: app?.training_provider || 'PT. Roda Jaya Sakti Training Center',
          level: r.passed ? 'Passed Competency' : 'Attended',
          dateRaw: r.completed_at ? r.completed_at.split('T')[0] : sched?.end_date || '2026-01-15',
          duration: `${days} ${days > 1 ? 'Days' : 'Day'} (${hrs} Hours)`,
          venue: sched?.venue || app?.training_location || 'Training Center Site Morowali',
          status: r.passed ? 'ACTIVE' : 'ATTENDED',
        };
      }),
    ];

    return items.sort((a, b) => (a.dateRaw < b.dateRaw ? 1 : -1));
  }, [activeEmployee, mockStore.certifications.length, mockStore.records.length]);

  // Format YYYY-MM-DD to DD/MM/YYYY like in the reference image (e.g., 20/01/2026)
  const formatDateDdMmYyyy = (isoDate: string) => {
    if (!isoDate) return '-';
    const parts = isoDate.split('T')[0].split('-');
    if (parts.length !== 3) return isoDate;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  // Handle Employee 3x4 Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeEmployee) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        mockStore.updateEmployeePhoto(activeEmployee.id, dataUrl);
        refreshState();
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Manual Add Certification (for HOD TC / Super Admin)
  const handleAddCertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEmployee || !certName.trim()) return;

    mockStore.certifications.unshift({
      id: crypto.randomUUID(),
      employee_id: activeEmployee.id,
      certificate_number:
        certNo.trim() || `CERT-RAJA-${Math.floor(100000 + Math.random() * 900000)}`,
      certificate_name: certName.trim(),
      issuing_body: issuingBody.trim() || 'PT. Roda Jaya Sakti Training Center',
      certification_level: 'Certified Competency',
      issue_date: issueDate,
      duration_label: durationLabel.trim() || '2 Days (16 Hours)',
      venue: venue.trim() || 'Training Center PT. RAJA — Site Morowali',
      is_lifetime: false,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    });

    mockStore.persistState();
    refreshState();
    setCertName('');
    setCertNo('');
    setShowAddCertModal(false);
  };

  // Export Employee's Training History Report to CSV
  const handleExportEmployeeReportCsv = () => {
    if (!activeEmployee) return;
    const headers = [
      'No',
      'Employee Name',
      'Employee No (NIK)',
      'Department',
      'Position',
      'Training / Certification Name',
      'Certificate Number',
      'Training Date',
      'Duration',
      'Venue',
      'Status',
    ];
    const rows = employeeHistoryItems.map((item, idx) => [
      idx + 1,
      `"${activeEmployee.full_name}"`,
      activeEmployee.nik,
      `"${activeDept?.name || ''}"`,
      `"${activeEmployee.position}"`,
      `"${item.trainingName.replace(/"/g, '""')}"`,
      item.certificateNumber,
      formatDateDdMmYyyy(item.dateRaw),
      `"${item.duration}"`,
      `"${item.venue}"`,
      item.status,
    ]);

    const csv =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute(
      'download',
      `Training_History_Report_${activeEmployee.nik}_${activeEmployee.full_name.replace(/\s+/g, '_')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const perms = getRolePermissions(role);
  const canManageCerts = perms.canEditData;

  const getEmployeeHistoryCount = (empId: string) => {
    const empCerts = mockStore.certifications.filter((c) => c.employee_id === empId);
    const empCompletedRecords = mockStore.records.filter(
      (r) =>
        r.employee_id === empId &&
        r.attendance_status === 'ATTENDED' &&
        !empCerts.some((c) => c.record_id === r.id)
    );
    return empCerts.length + empCompletedRecords.length;
  };

  const filteredEmployees = visibleEmployees.filter((e) => {
    const matchesSearch =
      e.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.nik.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.position.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (deptFilter !== 'ALL' && e.department_id !== deptFilter) {
      return false;
    }

    if (certFilter !== 'ALL') {
      const count = getEmployeeHistoryCount(e.id);
      if (certFilter === 'HAS_CERT' && count === 0) return false;
      if (certFilter === 'NO_CERT' && count > 0) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Control & View Mode Switcher Bar */}
      <div className="bg-white p-5 rounded-[12px] border border-[#E2E8E8] flex flex-wrap justify-between items-center gap-4 print:hidden">
        <div>
          <h3 className="text-base font-heading font-bold text-[#18232B] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#E88932]" />
            <span>Data Sertifikasi & Training History Report</span>
          </h3>
          <p className="text-xs text-[#5A6B75] mt-0.5">
            Rekam jejak sertifikasi kompetensi dan riwayat pelatihan seluruh personel PT. Roda Jaya Sakti
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mode Toggle Buttons */}
          <div className="inline-flex bg-[#F4F6F5] p-1 rounded-[10px] border border-[#E2E8E8]">
            <button
              type="button"
              onClick={() => {
                setViewMode('report');
                setSelectedEmpId(null);
              }}
              className={`px-3 py-1.5 rounded-[8px] text-xs font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'report'
                  ? 'bg-[#18232B] text-white font-semibold shadow-2xs'
                  : 'text-[#5A6B75] hover:text-[#18232B]'
              }`}
            >
              <IdCard className="w-3.5 h-3.5 text-[#E88932]" />
              <span>Daftar Karyawan & History Report</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-[8px] text-xs font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'all'
                  ? 'bg-[#18232B] text-white font-semibold shadow-2xs'
                  : 'text-[#5A6B75] hover:text-[#18232B]'
              }`}
            >
              <Table className="w-3.5 h-3.5 text-[#E88932]" />
              <span>Semua Sertifikat ({visibleCerts.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          MODE 1: EMPLOYEE LIST -> CLICK TO OPEN TRAINING & CERTIFICATION HISTORY REPORT
         ===================================================================== */}
      {viewMode === 'report' && !activeEmployee && (
        <div className="space-y-4">
          {/* Search & Filter Bar (Next to Search Name) */}
          <div className="bg-white p-4 rounded-[12px] border border-[#E2E8E8] flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Search Name / NIK / Position */}
              <div className="relative min-w-[240px] flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#5A6B75] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama karyawan, NIK, atau jabatan..."
                  className="w-full h-[38px] pl-9 pr-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932] text-[#18232B]"
                />
              </div>

              {/* Filter Division / Department right next to Search */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-[#E88932] shrink-0" />
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="h-[38px] px-3 text-xs font-medium bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] text-[#18232B] focus:bg-white focus:outline-none focus:border-[#E88932]"
                >
                  <option value="ALL">Semua Divisi (7 Divisi)</option>
                  {mockStore.departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} — {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Certification Status */}
              <div>
                <select
                  value={certFilter}
                  onChange={(e) =>
                    setCertFilter(e.target.value as 'ALL' | 'HAS_CERT' | 'NO_CERT')
                  }
                  className="h-[38px] px-3 text-xs font-medium bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] text-[#18232B] focus:bg-white focus:outline-none focus:border-[#E88932]"
                >
                  <option value="ALL">Semua Status Sertifikasi</option>
                  <option value="HAS_CERT">Sudah Ada Sertifikasi / History</option>
                  <option value="NO_CERT">Belum Ada Sertifikasi (0)</option>
                </select>
              </div>

              {(searchQuery || deptFilter !== 'ALL' || certFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setDeptFilter('ALL');
                    setCertFilter('ALL');
                  }}
                  className="text-xs text-[#E88932] hover:underline font-medium cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>

            <div className="text-xs font-mono text-[#5A6B75]">
              Menampilkan <strong className="text-[#18232B]">{filteredEmployees.length}</strong> dari{' '}
              <strong className="text-[#18232B]">{visibleEmployees.length}</strong> karyawan
            </div>
          </div>

          {/* Vertical Employee List Table — Click Row to Open Training & Certification History Report */}
          <div className="bg-white rounded-[12px] border border-[#E2E8E8] overflow-hidden">
            <div className="px-6 py-3.5 bg-[#F4F6F5] border-b border-[#E2E8E8] flex items-center justify-between">
              <span className="text-xs font-heading font-bold text-[#18232B] uppercase tracking-wider">
                Daftar Nama Karyawan — Klik Nama untuk Membuka Training & Certification History Report
              </span>
            </div>

            {filteredEmployees.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#5A6B75]">
                Tidak ada karyawan yang sesuai dengan pencarian atau filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F4F6F5]/60 text-[#5A6B75] font-medium border-b border-[#E2E8E8]">
                    <tr>
                      <th className="px-6 py-3 w-14 text-center">No</th>
                      <th className="px-6 py-3">Nama Karyawan & NIK</th>
                      <th className="px-6 py-3">Divisi / Departemen</th>
                      <th className="px-6 py-3">Site / Lokasi</th>
                      <th className="px-6 py-3">Jabatan / Level</th>
                      <th className="px-6 py-3 text-center">Total Riwayat / Sertifikasi</th>
                      <th className="px-6 py-3 text-right">History Report</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8E8]">
                    {filteredEmployees.map((emp, idx) => {
                      const dept = mockStore.departments.find(
                        (d) => d.id === emp.department_id
                      );
                      const historyCount = getEmployeeHistoryCount(emp.id);

                      return (
                        <tr
                          key={emp.id}
                          onClick={() => setSelectedEmpId(emp.id)}
                          className="hover:bg-[#E88932]/5 transition-colors cursor-pointer group"
                        >
                          <td className="px-6 py-3.5 text-center font-mono text-[#5A6B75] tabular-nums">
                            {idx + 1}
                          </td>
                          <td className="px-6 py-3.5">
                            <div className="font-heading font-bold text-[#18232B] group-hover:text-[#E88932] transition-colors">
                              {emp.full_name}
                            </div>
                            <div className="text-[11px] font-mono text-[#E88932] mt-0.5">
                              {emp.nik}
                            </div>
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="font-mono font-semibold text-xs px-2 py-0.5 rounded bg-[#F4F6F5] text-[#18232B] border border-[#E2E8E8]">
                              {dept?.code || 'RAJA'}
                            </span>
                            <div className="text-[11px] text-[#5A6B75] mt-0.5">
                              {dept?.name || emp.department_name}
                            </div>
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E88932]/10 text-[#C66B1A] border border-[#E88932]/30">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span>{emp.project_site || 'Site Tangofa'}</span>
                            </span>
                          </td>
                          <td className="px-6 py-3.5">
                            <div className="font-medium text-[#18232B]">{emp.position}</div>
                            <div className="text-[11px] text-[#5A6B75]">{emp.job_level}</div>
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-mono text-[11px] font-semibold border ${
                                historyCount > 0
                                  ? 'bg-[#397C69]/12 text-[#296050] border-[#397C69]/30'
                                  : 'bg-[#F4F6F5] text-[#5A6B75] border-[#E2E8E8]'
                              }`}
                            >
                              <span>{historyCount} Program</span>
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <span className="inline-flex items-center gap-1 text-xs font-heading font-semibold text-[#18232B] group-hover:text-[#E88932] px-3 py-1.5 rounded-[8px] border border-[#E2E8E8] bg-[#F4F6F5] group-hover:bg-white group-hover:border-[#E88932]/40 transition-all">
                              <FileText className="w-3.5 h-3.5 text-[#E88932]" />
                              <span>Buka History Report</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          OPENED EMPLOYEE TRAINING & CERTIFICATION HISTORY REPORT
         ===================================================================== */}
      {viewMode === 'report' && activeEmployee && (
        <div className="space-y-5">
          {/* Top Bar when Report is Opened: Back to Employee List + Actions */}
          <div className="bg-white p-4 rounded-[12px] border border-[#E2E8E8] flex flex-wrap items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => setSelectedEmpId(null)}
              >
                Kembali ke Daftar Karyawan
              </Button>
              <div className="hidden sm:block pl-3 border-l border-[#E2E8E8]">
                <div className="text-xs font-heading font-bold text-[#18232B]">
                  {activeEmployee.full_name}
                </div>
                <div className="text-[11px] font-mono text-[#5A6B75]">
                  NIK: <span className="text-[#E88932]">{activeEmployee.nik}</span> •{' '}
                  {activeDept?.code || 'RAJA'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {canManageCerts && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setShowAddCertModal(true)}
                >
                  Tambah Sertifikasi / History
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                icon={<Download className="w-3.5 h-3.5" />}
                onClick={handleExportEmployeeReportCsv}
              >
                Export CSV
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<Printer className="w-3.5 h-3.5" />}
                onClick={() => window.print()}
              >
                Cetak Report
              </Button>
            </div>
          </div>

          {/* =================================================================
              FORMAL TRAINING HISTORY REPORT SHEET (ADAPTED TO CURRENT DESIGN)
             ================================================================= */}
          <div className="bg-white rounded-[12px] border border-[#E2E8E8] shadow-xs overflow-hidden p-6 sm:p-8 space-y-6">
            {/* 1. DOCUMENT HEADER BAR: [Logo] | [Training History Report] | [No Doc] */}
            <div className="grid grid-cols-1 md:grid-cols-12 border-2 border-[#18232B] rounded-[8px] overflow-hidden">
              {/* Left: Official RAJA Logo */}
              <div className="md:col-span-3 bg-[#F4F6F5] p-4 flex items-center justify-center border-b md:border-b-0 md:border-r-2 border-[#18232B]">
                <RajaLogo variant="on-light" heightClass="h-10" />
              </div>

              {/* Center: Report Title */}
              <div className="md:col-span-6 bg-white p-4 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r-2 border-[#18232B]">
                <h2 className="text-lg sm:text-xl font-heading font-bold text-[#18232B] tracking-tight uppercase">
                  Training & Certification History Report
                </h2>
                <p className="text-[11px] font-mono text-[#5A6B75] mt-0.5">
                  PT. RODA JAYA SAKTI • TRAINING CENTER & COMPETENCY RECORD
                </p>
              </div>

              {/* Right: Document Control Number (No Doc) */}
              <div className="md:col-span-3 bg-[#18232B] text-white p-4 flex flex-col justify-center">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>NO. DOC</span>
                  <span className="text-[#E88932] font-semibold">REV-02</span>
                </div>
                <div className="text-xs font-mono font-semibold text-white mt-0.5">
                  FM-RAJA-TC-014
                </div>
                <div className="text-[10px] font-mono text-slate-300 mt-1 pt-1 border-t border-[#263640] flex justify-between">
                  <span>ID: {activeEmployee.nik}</span>
                  <span>{formatDateDdMmYyyy(new Date().toISOString())}</span>
                </div>
              </div>
            </div>

            {/* 2. PERSONAL DETAILS SECTION: Left Table + Right 3x4 Formal Photo */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-1.5 h-4 rounded-xs bg-[#E88932]" />
                <h3 className="text-sm font-heading font-bold text-[#18232B] uppercase tracking-wide">
                  Personal Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Left Key-Value Table */}
                <div className="md:col-span-9 border border-[#CBD5D5] rounded-[8px] overflow-hidden">
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-[#E2E8E8]">
                      <tr className="bg-[#F4F6F5]/70">
                        <td className="py-2.5 px-4 font-heading font-semibold text-[#263640] w-40 sm:w-48 border-r border-[#E2E8E8]">
                          Name
                        </td>
                        <td className="py-2.5 px-4 font-heading font-bold text-[#18232B]">
                          : {activeEmployee.full_name}
                        </td>
                      </tr>
                      <tr className="bg-white">
                        <td className="py-2.5 px-4 font-heading font-semibold text-[#263640] border-r border-[#E2E8E8]">
                          Employee No.
                        </td>
                        <td className="py-2.5 px-4 font-mono font-semibold text-[#E88932]">
                          : {activeEmployee.nik}
                        </td>
                      </tr>
                      <tr className="bg-[#F4F6F5]/70">
                        <td className="py-2.5 px-4 font-heading font-semibold text-[#263640] border-r border-[#E2E8E8]">
                          Position
                        </td>
                        <td className="py-2.5 px-4 font-medium text-[#18232B]">
                          : {activeEmployee.position}{' '}
                          <span className="text-[11px] font-mono text-[#5A6B75]">
                            ({activeEmployee.job_level})
                          </span>
                        </td>
                      </tr>
                      <tr className="bg-white">
                        <td className="py-2.5 px-4 font-heading font-semibold text-[#263640] border-r border-[#E2E8E8]">
                          Department
                        </td>
                        <td className="py-2.5 px-4 font-medium text-[#18232B]">
                          : {activeDept?.name || activeEmployee.department_name}{' '}
                          <span className="font-mono text-[11px] text-[#263640] font-semibold">
                            [{activeDept?.code || 'RAJA'}]
                          </span>
                        </td>
                      </tr>
                      <tr className="bg-[#F4F6F5]/70">
                        <td className="py-2.5 px-4 font-heading font-semibold text-[#263640] border-r border-[#E2E8E8]">
                          Project / Site
                        </td>
                        <td className="py-2.5 px-4 font-medium text-[#18232B]">
                          : {activeEmployee.project_site || 'Site Tangofa'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Right 3x4 Formal Photo Frame */}
                <div className="md:col-span-3 flex flex-col items-center justify-center">
                  <div
                    onClick={() => photoInputRef.current?.click()}
                    title="Klik untuk mengganti pas foto karyawan"
                    className="w-32 h-40 rounded-[6px] border-2 border-[#18232B] overflow-hidden shadow-xs relative group cursor-pointer bg-[#9E2A2B] flex flex-col items-center justify-end"
                  >
                    {activeEmployee.photo_url ? (
                      <img
                        src={activeEmployee.photo_url}
                        alt={activeEmployee.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      /* Formal Crimson Pass-Photo Avatar with Suit & Tie Silhouette */
                      <div className="w-full h-full flex flex-col items-center justify-between pt-4 bg-gradient-to-b from-[#A42426] to-[#7F191B] text-white select-none">
                        <div className="w-12 h-12 rounded-full bg-[#F2D2B6] border-2 border-white/40 flex items-center justify-center text-[#18232B] font-heading font-bold text-sm shadow-inner">
                          {activeEmployee.full_name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        {/* Formal Suit & Tie SVG */}
                        <svg
                          viewBox="0 0 120 70"
                          className="w-full h-20 fill-[#18232B]"
                          preserveAspectRatio="none"
                        >
                          <path d="M10,70 C10,25 35,15 60,15 C85,15 110,25 110,70 Z" />
                          {/* White Shirt Collar */}
                          <polygon points="45,16 60,48 75,16" fill="#FFFFFF" />
                          {/* Tie */}
                          <polygon points="57,22 63,22 65,58 60,65 55,58" fill="#E88932" />
                        </svg>
                      </div>
                    )}

                    {/* Hover Overlay for Photo Upload */}
                    <div className="absolute inset-0 bg-[#18232B]/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-medium p-2 text-center print:hidden">
                      <Camera className="w-5 h-5 text-[#E88932] mb-1" />
                      <span>Upload Pas Foto</span>
                    </div>
                  </div>

                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="mt-1.5 text-[11px] text-[#5A6B75] hover:text-[#E88932] font-medium inline-flex items-center gap-1 cursor-pointer print:hidden"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Ganti Pas Foto 3x4</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. TRAINING & CERTIFICATION HISTORY DETAILS TABLE */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-4 rounded-xs bg-[#E88932]" />
                  <h3 className="text-sm font-heading font-bold text-[#18232B] uppercase tracking-wide">
                    Training & Certification History Details
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#5A6B75]">
                  Total Completed: <strong className="text-[#18232B]">{employeeHistoryItems.length}</strong> Program
                </span>
              </div>

              <div className="border border-[#18232B] rounded-[8px] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-[#18232B] text-white font-heading font-semibold border-b-2 border-[#E88932]">
                        <th className="py-3 px-3 text-center w-12 border-r border-[#263640]">
                          No
                        </th>
                        <th className="py-3 px-4 border-r border-[#263640]">
                          Training & Certification Name
                        </th>
                        <th className="py-3 px-4 text-center w-36 border-r border-[#263640]">
                          Training Date
                        </th>
                        <th className="py-3 px-4 text-center w-36 border-r border-[#263640]">
                          Duration
                        </th>
                        <th className="py-3 px-4 border-r border-[#263640]">
                          Venue
                        </th>
                        <th className="py-3 px-4 text-center w-36">
                          Certificate Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#CBD5D5]">
                      {employeeHistoryItems.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-8 px-4 text-center text-xs text-[#5A6B75] bg-[#F4F6F5]/40"
                          >
                            Belum ada riwayat pelatihan atau sertifikasi yang diselesaikan oleh{' '}
                            <strong>{activeEmployee.full_name}</strong>. Ketika jadwal pelatihan diselesaikan (Completed), sertifikasi akan otomatis tercatat di tabel ini.
                          </td>
                        </tr>
                      ) : (
                        employeeHistoryItems.map((item, index) => (
                          <tr
                            key={item.id}
                            className={`${
                              index % 2 === 0 ? 'bg-white' : 'bg-[#F4F6F5]/60'
                            } hover:bg-[#E88932]/5 transition-colors`}
                          >
                            <td className="py-3 px-3 text-center font-mono font-semibold text-[#18232B] border-r border-[#E2E8E8] tabular-nums">
                              {index + 1}
                            </td>
                            <td className="py-3 px-4 border-r border-[#E2E8E8]">
                              <div className="font-heading font-semibold text-[#18232B]">
                                {item.trainingName}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px]">
                                <span className="font-mono text-[#E88932] font-medium">
                                  {item.certificateNumber}
                                </span>
                                <span className="text-[#CBD5D5]">•</span>
                                <span className="text-[#5A6B75]">{item.issuingBody}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-medium text-[#18232B] border-r border-[#E2E8E8] tabular-nums">
                              {formatDateDdMmYyyy(item.dateRaw)}
                            </td>
                            <td className="py-3 px-4 text-center font-mono text-[#263640] border-r border-[#E2E8E8] tabular-nums">
                              {item.duration}
                            </td>
                            <td className="py-3 px-4 text-[#18232B] border-r border-[#E2E8E8]">
                              {item.venue}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#397C69]/12 text-[#296050] border border-[#397C69]/30">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{item.status}</span>
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 4. REPORT VERIFICATION FOOTER */}
            <div className="pt-4 border-t border-[#E2E8E8] flex flex-wrap items-center justify-between gap-4 text-[11px] text-[#5A6B75]">
              <div>
                Dokumen ini diterbitkan secara elektronik oleh{' '}
                <strong className="text-[#18232B]">
                  THR — Training Historical & Reporting System PT. Roda Jaya Sakti
                </strong>
                .
              </div>
              <div className="font-mono text-[#263640]">
                Verified by HOD Training Center & Authorized by PJO
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODE 2: ALL ISSUED CERTIFICATES REGISTRY TABLE
         ===================================================================== */}
      {viewMode === 'all' && (
        <div className="bg-white rounded-[12px] border border-[#E2E8E8] overflow-hidden">
          <div className="px-6 py-4 bg-[#F4F6F5] border-b border-[#E2E8E8] flex flex-wrap justify-between items-center gap-3">
            <div>
              <h4 className="text-xs font-heading font-bold text-[#18232B] uppercase tracking-wider">
                Daftar Seluruh Sertifikat Kompetensi Terbit ({visibleCerts.length})
              </h4>
              <p className="text-xs text-[#5A6B75] mt-0.5">
                Klik tombol "Lihat History Report" pada baris karyawan untuk membuka kartu Training History Report lengkap.
              </p>
            </div>
          </div>

          {visibleCerts.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#5A6B75]">
              Belum ada sertifikat yang diterbitkan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F4F6F5]/60 text-[#5A6B75] font-medium border-b border-[#E2E8E8]">
                  <tr>
                    <th className="px-6 py-3">Nama Sertifikasi & Nomor</th>
                    <th className="px-6 py-3">Nama Karyawan</th>
                    <th className="px-6 py-3">Lembaga Penerbit & Lokasi</th>
                    <th className="px-6 py-3">Tanggal & Durasi</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Laporan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8E8]">
                  {visibleCerts.map((cert) => {
                    const emp = mockStore.employees.find((e) => e.id === cert.employee_id);
                    const dept = emp
                      ? mockStore.departments.find((d) => d.id === emp.department_id)
                      : null;

                    return (
                      <tr key={cert.id} className="hover:bg-[#F4F6F5]/50 transition-colors">
                        <td className="px-6 py-3.5">
                          <div className="font-heading font-semibold text-[#18232B]">
                            {cert.certificate_name}
                          </div>
                          <div className="text-[11px] text-[#E88932] font-mono font-semibold mt-0.5">
                            {cert.certificate_number}
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="font-heading font-semibold text-[#18232B]">
                            {emp?.full_name}
                          </div>
                          <div className="text-[11px] text-[#5A6B75] font-mono">
                            {emp?.nik} • {dept?.code}
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="text-[#18232B] font-medium">{cert.issuing_body}</div>
                          <div className="text-[11px] text-[#5A6B75]">
                            {cert.venue || 'Training Center Site Morowali'}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 font-mono tabular-nums">
                          <div className="text-[#18232B] font-medium">
                            {formatDateDdMmYyyy(cert.issue_date)}
                          </div>
                          <div className="text-[11px] text-[#5A6B75]">
                            {cert.duration_label || '2 Days'}
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#397C69]/12 text-[#296050] border border-[#397C69]/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{cert.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          {emp && (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<FileText className="w-3.5 h-3.5" />}
                              onClick={() => {
                                setSelectedEmpId(emp.id);
                                setViewMode('report');
                              }}
                            >
                              Lihat History Report
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL: Add Historical Certification / Training Record */}
      {showAddCertModal && activeEmployee && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#18232B]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] shadow-2xl border border-[#E2E8E8] max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#18232B] text-white border-b border-[#263640] flex justify-between items-center">
              <div>
                <h3 className="text-sm font-heading font-bold">
                  Tambah Riwayat Sertifikasi / Training Selesai
                </h3>
                <p className="text-xs text-[#E88932] font-mono mt-0.5">
                  {activeEmployee.full_name} ({activeEmployee.nik})
                </p>
              </div>
              <button
                onClick={() => setShowAddCertModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-[8px] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCertSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#263640] mb-1">
                  Nama Training / Sertifikasi yang Diikuti *
                </label>
                <input
                  type="text"
                  required
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  placeholder="Contoh: Pengawas Operasional Pertama (POP) / KOMTRAX"
                  className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#263640] mb-1">
                    Nomor Sertifikat / Dokumen
                  </label>
                  <input
                    type="text"
                    value={certNo}
                    onChange={(e) => setCertNo(e.target.value)}
                    placeholder="Kosongkan untuk otomatis"
                    className="w-full h-[38px] px-3 text-xs font-mono bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#263640] mb-1">
                    Tanggal Pelaksanaan *
                  </label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full h-[38px] px-3 text-xs font-mono bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#263640] mb-1">
                    Durasi Pelatihan *
                  </label>
                  <input
                    type="text"
                    required
                    value={durationLabel}
                    onChange={(e) => setDurationLabel(e.target.value)}
                    placeholder="Contoh: 3 Days (24 Hours)"
                    className="w-full h-[38px] px-3 text-xs font-mono bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#263640] mb-1">
                    Lembaga Penerbit
                  </label>
                  <input
                    type="text"
                    value={issuingBody}
                    onChange={(e) => setIssuingBody(e.target.value)}
                    className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#263640] mb-1">
                  Lokasi / Venue Pelaksanaan *
                </label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Contoh: Training Center PT. RAJA — Site Morowali"
                  className="w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932]"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E8E8] flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setShowAddCertModal(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={<Plus className="w-4 h-4" />}
                >
                  Simpan ke History Report
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
