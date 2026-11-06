import React, { useState } from 'react';
import { TrainingApplication } from '../../lib/types';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import { ShieldAlert, AlertCircle, X } from 'lucide-react';

interface SuperAdminReopenModalProps {
  isOpen: boolean;
  application: TrainingApplication | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const SuperAdminReopenModal: React.FC<SuperAdminReopenModalProps> = ({
  isOpen,
  application,
  onClose,
  onSuccess,
}) => {
  const { currentUser, refreshState } = useAuth();
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !application) return null;

  const handleReopen = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!reason.trim()) {
        throw new Error('Mandatory justification reason is required to reopen a rejected application.');
      }

      mockStore.superAdminReopenApplication(application.id, currentUser.id, reason);
      refreshState();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to reopen application.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in duration-200">
        <div className="px-6 py-4 bg-purple-50 border-b border-purple-100 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-bold text-purple-950">
              Authorized Administrative Reopening
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleReopen} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-800">
              Reopening: {application.application_number}
            </p>
            <p className="text-slate-500 mt-1">
              This action will reset the terminal <span className="font-bold text-red-600">REJECTED</span> status back to <span className="font-bold text-blue-600">DRAFT</span> for the original department submitter, allowing modifications and re-submission through the complete approval chain.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Documented Justification Reason * (Mandatory)
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the formal business or executive rationale for overriding the rejection..."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              Confirm Reopen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
