import React, { useState } from 'react';
import { TrainingApplication, ApprovalDecision } from '../../lib/types';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import { Button } from '../ui/Button';
import { CheckCircle2, RotateCcw, XCircle, AlertCircle, X } from 'lucide-react';

interface HodPjoActionModalProps {
  isOpen: boolean;
  application: TrainingApplication | null;
  mode: 'HOD' | 'PJO';
  onClose: () => void;
  onSuccess: () => void;
}

export const HodPjoActionModal: React.FC<HodPjoActionModalProps> = ({
  isOpen,
  application,
  mode,
  onClose,
  onSuccess,
}) => {
  const { currentUser, refreshState } = useAuth();
  const [decision, setDecision] = useState<ApprovalDecision>('APPROVE');
  const [comments, setComments] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !application) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (mode === 'HOD') {
        mockStore.hodReviewApplication(application.id, currentUser.id, decision, comments);
      } else {
        mockStore.pjoReviewApplication(application.id, currentUser.id, decision, comments);
      }
      refreshState();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Action failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#18232B]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[14px] shadow-2xl border border-[#E2E8E8] max-w-lg w-full overflow-hidden">
        <div className="px-6 py-4 bg-[#18232B] text-white border-b border-[#263640] flex justify-between items-center">
          <div>
            <h3 className="text-sm font-heading font-bold">
              {mode === 'HOD'
                ? 'HOD Training Center Review (Stage 1)'
                : 'PJO Final Authorization (Stage 2)'}
            </h3>
            <p className="text-xs text-[#E88932] font-mono mt-0.5">
              {application.application_number} • {application.department_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-[8px] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#B94C45]/10 border border-[#B94C45]/30 rounded-[8px] text-xs text-[#B94C45] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-[#F4F6F5] p-3.5 rounded-[10px] border border-[#E2E8E8] text-xs space-y-1">
            <div className="font-heading font-semibold text-[#18232B]">
              {application.training_title}
            </div>
            <div className="text-[#5A6B75] font-mono text-[11px]">
              Tipe: {application.training_type} | Anggaran: IDR{' '}
              {application.estimated_budget.toLocaleString('id-ID')}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#263640] mb-2">
              Pilih Keputusan *
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setDecision('APPROVE')}
                className={`py-2.5 px-3 rounded-[10px] border text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  decision === 'APPROVE'
                    ? 'bg-[#397C69]/12 border-[#397C69] text-[#296050] font-semibold'
                    : 'border-[#E2E8E8] text-[#5A6B75] hover:bg-[#F4F6F5]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-[#397C69]" />
                <span>Approve</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('RETURN_FOR_REVISION')}
                className={`py-2.5 px-3 rounded-[10px] border text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  decision === 'RETURN_FOR_REVISION'
                    ? 'bg-[#D5A33D]/15 border-[#D5A33D] text-[#8C6412] font-semibold'
                    : 'border-[#E2E8E8] text-[#5A6B75] hover:bg-[#F4F6F5]'
                }`}
              >
                <RotateCcw className="w-4 h-4 text-[#D5A33D]" />
                <span>Revision</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('REJECT')}
                className={`py-2.5 px-3 rounded-[10px] border text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  decision === 'REJECT'
                    ? 'bg-[#B94C45]/12 border-[#B94C45] text-[#93332D] font-semibold'
                    : 'border-[#E2E8E8] text-[#5A6B75] hover:bg-[#F4F6F5]'
                }`}
              >
                <XCircle className="w-4 h-4 text-[#B94C45]" />
                <span>Reject</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#263640] mb-1">
              Catatan Evaluasi / Alasan{' '}
              {decision !== 'APPROVE' && (
                <span className="text-[#B94C45] font-semibold">* (Wajib Diisi)</span>
              )}
            </label>
            <textarea
              rows={3}
              required={decision !== 'APPROVE'}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={
                decision === 'APPROVE'
                  ? 'Catatan persetujuan opsional...'
                  : 'Tuliskan alasan revisi atau penolakan secara spesifik...'
              }
              className="w-full text-xs px-3 py-2 bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] focus:bg-white focus:outline-none focus:border-[#E88932] text-[#18232B]"
            />
          </div>

          <div className="pt-3 border-t border-[#E2E8E8] flex justify-end gap-2.5">
            <Button type="button" variant="outline" size="md" onClick={onClose}>
              Batal
            </Button>
            <Button
              type="submit"
              variant={
                decision === 'APPROVE'
                  ? 'approve'
                  : decision === 'RETURN_FOR_REVISION'
                  ? 'revision'
                  : 'reject'
              }
              size="md"
            >
              Konfirmasi Keputusan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
