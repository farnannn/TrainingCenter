import React, { useState, useRef } from 'react';
import { Employee } from '../../lib/types';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import { CheckSquare, Square, Upload, Plus, CheckCircle2 } from 'lucide-react';

interface ParticipantSelectorProps {
  availableEmployees: Employee[];
  selectedEmployeeIds: string[];
  onChange: (selectedIds: string[]) => void;
}

export const ParticipantSelector: React.FC<ParticipantSelectorProps> = ({
  availableEmployees,
  selectedEmployeeIds,
  onChange,
}) => {
  const { currentUser, refreshState } = useAuth();
  const [showQuickUpload, setShowQuickUpload] = useState(false);
  const [quickNamesText, setQuickNamesText] = useState('');
  const [quickMessage, setQuickMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const toggleEmployee = (empId: string) => {
    if (selectedEmployeeIds.includes(empId)) {
      onChange(selectedEmployeeIds.filter((id) => id !== empId));
    } else {
      onChange([...selectedEmployeeIds, empId]);
    }
  };

  const selectAll = () => {
    onChange(availableEmployees.map((e) => e.id));
  };

  const clearAll = () => {
    onChange([]);
  };

  const handleQuickFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (text) setQuickNamesText(text);
    };
    reader.readAsText(file);
  };

  const handleImportParticipants = () => {
    if (!quickNamesText.trim()) return;

    const lines = quickNamesText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const rows = lines
      .filter(
        (l, idx) =>
          !(
            idx === 0 &&
            (l.toLowerCase().includes('nama') || l.toLowerCase().startsWith('nik,'))
          )
      )
      .map((line) => {
        const parts = line.split(/[,\t;]/).map((p) => p.trim().replace(/^"|"$/g, ''));
        if (parts.length === 1) {
          return { full_name: parts[0] };
        }
        return {
          nik: parts[0],
          full_name: parts[1] || parts[0],
          position: parts[2] || 'Operator Tambang',
        };
      });

    try {
      const res = mockStore.bulkUploadEmployees(currentUser.id, rows);
      refreshState();
      if (res.added.length > 0) {
        const newIds = res.added.map((e) => e.id);
        onChange(Array.from(new Set([...selectedEmployeeIds, ...newIds])));
        setQuickMessage(
          `${res.added.length} nama karyawan berhasil ditambahkan & dipilih sebagai peserta.`
        );
        setQuickNamesText('');
      } else if (res.skipped.length > 0) {
        setQuickMessage(`Info: ${res.skipped.join('; ')}`);
      }
    } catch (err: any) {
      setQuickMessage(err.message);
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap justify-between items-center gap-2 text-xs">
        <span className="font-heading font-semibold text-[#18232B]">
          Pilih Peserta Departemen ({selectedEmployeeIds.length} dipilih)
        </span>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowQuickUpload(!showQuickUpload)}
            className="inline-flex items-center gap-1 text-[#E88932] hover:underline font-medium cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{showQuickUpload ? 'Tutup Upload Nama' : 'Upload CSV / Nama Baru'}</span>
          </button>
          <span className="text-[#E2E8E8]">|</span>
          <button
            type="button"
            onClick={selectAll}
            className="text-[#263640] hover:text-[#18232B] font-medium cursor-pointer"
          >
            Pilih Semua
          </button>
          <span className="text-[#E2E8E8]">|</span>
          <button
            type="button"
            onClick={clearAll}
            className="text-[#5A6B75] hover:text-[#18232B] font-medium cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Inline Quick Upload / Paste Box for Adding New Employee Names on the fly */}
      {showQuickUpload && (
        <div className="p-3.5 bg-[#F4F6F5] rounded-[10px] border border-[#E2E8E8] space-y-2.5 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium text-[#18232B]">
              Upload File .CSV atau Ketik Daftar Nama Peserta Baru:
            </span>
            <div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleQuickFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="px-2.5 py-1 rounded bg-white border border-[#E2E8E8] text-[#263640] hover:border-[#E88932] font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3 h-3 text-[#E88932]" />
                <span>Pilih File CSV</span>
              </button>
            </div>
          </div>

          <textarea
            rows={3}
            value={quickNamesText}
            onChange={(e) => setQuickNamesText(e.target.value)}
            placeholder={`Ketik 1 nama per baris atau format: NIK, Nama Lengkap, Jabatan\nContoh:\nRAJA-MOD-301, Hendra Saputra, Operator Dump Truck\nAgus Setiawan`}
            className="w-full p-2.5 text-xs font-mono bg-white border border-[#E2E8E8] rounded-[8px] focus:outline-none focus:border-[#E88932]"
          />

          {quickMessage && (
            <div className="text-[11px] text-[#397C69] flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{quickMessage}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleImportParticipants}
              className="px-3 py-1.5 rounded-[8px] bg-[#E88932] hover:bg-[#D47621] text-white font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambahkan & Pilih Peserta</span>
            </button>
          </div>
        </div>
      )}

      {availableEmployees.length === 0 ? (
        <div className="p-4 bg-[#F4F6F5] rounded-[8px] border border-[#E2E8E8] text-center text-xs text-[#5A6B75]">
          Belum ada karyawan di departemen ini. Gunakan tombol "Upload CSV / Nama Baru" di atas.
        </div>
      ) : (
        <div className="max-h-48 overflow-y-auto border border-[#E2E8E8] rounded-[10px] divide-y divide-[#E2E8E8] bg-white">
          {availableEmployees.map((emp) => {
            const isSelected = selectedEmployeeIds.includes(emp.id);
            return (
              <div
                key={emp.id}
                onClick={() => toggleEmployee(emp.id)}
                className={`p-2.5 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#E88932]/10 text-[#18232B]'
                    : 'hover:bg-[#F4F6F5] text-[#263640]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="text-[#E88932]">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4 text-[#CBD5D5]" />
                    )}
                  </div>
                  <div>
                    <div className="font-heading font-semibold text-[#18232B]">
                      {emp.full_name}
                    </div>
                    <div className="text-[11px] text-[#5A6B75] flex items-center gap-1.5">
                      <span className="font-mono text-[#E88932]">{emp.nik}</span>
                      <span>•</span>
                      <span>{emp.position}</span>
                      <span>•</span>
                      <span className="px-1.5 py-0.5 bg-[#F4F6F5] rounded text-[10px] text-[#263640] border border-[#E2E8E8]">
                        {emp.job_level}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-[#5A6B75] font-medium">
                  {emp.employment_status}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
