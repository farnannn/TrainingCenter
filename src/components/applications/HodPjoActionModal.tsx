import React, { useState } from 'react';
import { TrainingApplication, ApprovalDecision } from '../../lib/types';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in duration-200">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {mode === 'HOD' ? 'HOD Training Center Review' : 'PJO Final Authorization'}
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              {application.application_number} • {application.department_name}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
            <div className="font-semibold text-slate-800">{application.training_title}</div>
            <div className="text-slate-500 text-[11px]">
              Type: {application.training_type} | Budget: IDR {application.estimated_budget.toLocaleString('id-ID')}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Decision *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDecision('APPROVE')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                  decision === 'APPROVE'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-400'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Approve</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('RETURN_FOR_REVISION')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                  decision === 'RETURN_FOR_REVISION'
                    ? 'bg-amber-50 border-amber-500 text-amber-800 ring-1 ring-amber-400'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>Revision</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('REJECT')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                  decision === 'REJECT'
                    ? 'bg-red-50 border-red-500 text-red-800 ring-1 ring-red-400'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <XCircle className="w-4 h-4 text-red-600" />
                <span>Reject</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Comments / Justification {decision !== 'APPROVE' && <span className="text-red-500">* (Mandatory)</span>}
            </label>
            <textarea
              rows={3}
              required={decision !== 'APPROVE'}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={
                decision === 'APPROVE'
                  ? 'Optional feedback or endorsement notes...'
                  : 'Mandatory reason for return or rejection...'
              }
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-white rounded-lg text-xs font-semibold shadow-sm transition-all ${
                decision === 'APPROVE'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : decision === 'RETURN_FOR_REVISION'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              Confirm Decision
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
