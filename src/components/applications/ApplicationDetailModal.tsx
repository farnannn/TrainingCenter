import React, { useState } from 'react';
import { TrainingApplication, getRolePermissions } from '../../lib/types';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import { ApprovalHistoryTimeline } from './ApprovalHistoryTimeline';
import { HodPjoActionModal } from './HodPjoActionModal';
import { SuperAdminReopenModal } from './SuperAdminReopenModal';
import {
  X,
  Users,
  Building,
  FileCheck,
  Send,
  CalendarPlus,
  ShieldAlert,
} from 'lucide-react';

interface ApplicationDetailModalProps {
  isOpen: boolean;
  application: TrainingApplication | null;
  onClose: () => void;
  onRefresh: () => void;
  onOpenScheduleModal?: (app: TrainingApplication) => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  isOpen,
  application,
  onClose,
  onRefresh,
  onOpenScheduleModal,
}) => {
  const { currentUser, refreshState } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
  const [showHodModal, setShowHodModal] = useState(false);
  const [showPjoModal, setShowPjoModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);

  if (!isOpen || !application) return null;

  const role = currentUser.role_code;
  const perms = getRolePermissions(role);
  const history = mockStore.approvalHistory.filter((h) => h.application_id === application.id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'SUBMITTED':
      case 'UNDER_HOD_REVIEW':
        return 'bg-blue-100 text-blue-800 border-blue-300 animate-pulse';
      case 'PENDING_PJO':
        return 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse';
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'SCHEDULED':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'IN_PROGRESS':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const handleDeptSubmit = () => {
    try {
      mockStore.submitApplication(application.id, currentUser.id);
      refreshState();
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
          {/* Header */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  {application.application_number}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                    application.current_status
                  )}`}
                >
                  {application.current_status.replace(/_/g, ' ')}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                {application.training_title}
              </h2>
              <div className="text-xs text-slate-500 flex items-center space-x-3 mt-0.5">
                <span className="flex items-center">
                  <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {application.department_name}
                </span>
                <span>•</span>
                <span>Submitted by: {application.submitter_name}</span>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs inside modal */}
          <div className="px-6 border-b border-slate-200 flex space-x-4 bg-white text-xs">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-sky-600 text-sky-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Application Details & Participants
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 font-semibold border-b-2 transition-colors flex items-center space-x-1.5 ${
                activeTab === 'history'
                  ? 'border-sky-600 text-sky-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Approval Audit History</span>
              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full text-[10px]">
                {history.length}
              </span>
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-6 text-xs space-y-5">
            {activeTab === 'details' ? (
              <>
                {/* Meta details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Category</span>
                    <div className="font-semibold text-slate-800 mt-0.5">{application.training_category}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Training Type</span>
                    <div className="font-semibold text-slate-800 mt-0.5">{application.training_type}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Estimated Budget</span>
                    <div className="font-semibold text-slate-800 mt-0.5 font-mono">
                      IDR {Number(application.estimated_budget).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Target Dates</span>
                    <div className="font-semibold text-slate-800 mt-0.5">
                      {application.proposed_start_date} to {application.proposed_end_date}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Provider & Trainer
                    </label>
                    <p className="mt-1 text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200">
                      {application.training_provider}
                    </p>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Location / Venue
                    </label>
                    <p className="mt-1 text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200">
                      {application.training_location}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Objectives & Justification
                  </label>
                  <p className="mt-1 text-slate-700 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                    {application.training_objectives}
                  </p>
                </div>

                {/* Multi-employee Participants */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>Employee Participants ({application.participants?.length || 0})</span>
                    </label>
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
                    {application.participants?.map((p, idx) => (
                      <div key={p.id || idx} className="p-2.5 bg-white flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-slate-800">{p.employee_name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {p.employee_nik} • {p.employee_position}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Approver decisions preview if available */}
                {(application.hod_decision || application.pjo_decision) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {application.hod_decision && (
                      <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200">
                        <span className="text-[10px] font-bold text-blue-700 uppercase">Manager TC Decision</span>
                        <div className="font-semibold text-slate-800 mt-0.5">
                          {application.hod_decision}
                        </div>
                        {application.hod_comments && (
                          <p className="text-[11px] text-slate-600 italic mt-1">"{application.hod_comments}"</p>
                        )}
                      </div>
                    )}
                    {application.pjo_decision && (
                      <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                        <span className="text-[10px] font-bold text-amber-700 uppercase">Final Authorization</span>
                        <div className="font-semibold text-slate-800 mt-0.5">
                          {application.pjo_decision}
                        </div>
                        {application.pjo_comments && (
                          <p className="text-[11px] text-slate-600 italic mt-1">"{application.pjo_comments}"</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <ApprovalHistoryTimeline history={history} />
            )}
          </div>

          {/* Action Bar Footer */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">
              RBAC Mode: {currentUser.role_name} ({perms.canEditData ? 'Edit Access' : 'View Only'})
            </span>

            <div className="flex items-center space-x-2">
              {/* Submit draft button for roles with canEditData */}
              {perms.canEditData && application.current_status === 'DRAFT' && (
                <button
                  onClick={handleDeptSubmit}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold text-xs flex items-center space-x-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit to TC Review</span>
                </button>
              )}

              {/* Stage 1 Review action for Manager TC / Admin TC / Admin / Super Admin */}
              {(role === 'MANAGER_TC' || role === 'ADMIN_TC' || role === 'ADMIN' || role === 'SUPER_ADMIN') &&
                application.current_status === 'UNDER_HOD_REVIEW' && (
                  <button
                    onClick={() => setShowHodModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs flex items-center space-x-1.5 shadow-sm"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Review Application (Stage 1)</span>
                  </button>
                )}

              {/* Stage 2 Authorization for Manager TC / Admin / Super Admin */}
              {(role === 'MANAGER_TC' || role === 'ADMIN' || role === 'SUPER_ADMIN') &&
                application.current_status === 'PENDING_PJO' && (
                  <button
                    onClick={() => setShowPjoModal(true)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs flex items-center space-x-1.5 shadow-sm"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Final Authorization (Stage 2)</span>
                  </button>
                )}

              {/* Schedule Training action for approved */}
              {(role === 'MANAGER_TC' || role === 'ADMIN_TC' || role === 'ADMIN' || role === 'SUPER_ADMIN') &&
                application.current_status === 'APPROVED' && (
                  <button
                    onClick={() => {
                      if (onOpenScheduleModal) onOpenScheduleModal(application);
                      onClose();
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs flex items-center space-x-1.5 shadow-sm"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    <span>Schedule Training Execution</span>
                  </button>
                )}

              {/* Super Admin Reopen action for rejected applications */}
              {role === 'SUPER_ADMIN' && application.current_status === 'REJECTED' && (
                <button
                  onClick={() => setShowReopenModal(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-xs flex items-center space-x-1.5 shadow-sm"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Super Admin Reopen</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="px-3 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals for actions */}
      <HodPjoActionModal
        isOpen={showHodModal}
        application={application}
        mode="HOD"
        onClose={() => setShowHodModal(false)}
        onSuccess={() => {
          onRefresh();
          onClose();
        }}
      />

      <HodPjoActionModal
        isOpen={showPjoModal}
        application={application}
        mode="PJO"
        onClose={() => setShowPjoModal(false)}
        onSuccess={() => {
          onRefresh();
          onClose();
        }}
      />

      <SuperAdminReopenModal
        isOpen={showReopenModal}
        application={application}
        onClose={() => setShowReopenModal(false)}
        onSuccess={() => {
          onRefresh();
          onClose();
        }}
      />
    </>
  );
};
