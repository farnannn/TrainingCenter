import React from 'react';
import { TrainingApprovalHistory } from '../../lib/types';
import { Clock, CheckCircle2, RotateCcw, XCircle, ArrowRight, UserCheck, ShieldAlert } from 'lucide-react';

interface ApprovalHistoryTimelineProps {
  history: TrainingApprovalHistory[];
}

export const ApprovalHistoryTimeline: React.FC<ApprovalHistoryTimelineProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return <div className="text-xs text-slate-400 py-4 text-center">No approval history recorded yet.</div>;
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'SUBMIT':
        return {
          icon: <Clock className="w-3.5 h-3.5 text-blue-500" />,
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          label: 'Submitted for Review',
        };
      case 'HOD_APPROVE':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />,
          color: 'bg-sky-50 text-sky-700 border-sky-200',
          label: 'HOD TC Approved',
        };
      case 'HOD_RETURN':
        return {
          icon: <RotateCcw className="w-3.5 h-3.5 text-amber-500" />,
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          label: 'Returned by HOD for Revision',
        };
      case 'HOD_REJECT':
        return {
          icon: <XCircle className="w-3.5 h-3.5 text-red-500" />,
          color: 'bg-red-50 text-red-700 border-red-200',
          label: 'Rejected by HOD',
        };
      case 'PJO_APPROVE':
        return {
          icon: <UserCheck className="w-3.5 h-3.5 text-emerald-500" />,
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: 'PJO Authorized (Final)',
        };
      case 'PJO_RETURN':
        return {
          icon: <RotateCcw className="w-3.5 h-3.5 text-amber-500" />,
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          label: 'Returned by PJO for Revision',
        };
      case 'PJO_REJECT':
        return {
          icon: <XCircle className="w-3.5 h-3.5 text-red-500" />,
          color: 'bg-red-50 text-red-700 border-red-200',
          label: 'Rejected by PJO',
        };
      case 'SUPERADMIN_REOPEN':
        return {
          icon: <ShieldAlert className="w-3.5 h-3.5 text-purple-500" />,
          color: 'bg-purple-50 text-purple-700 border-purple-200',
          label: 'Super Admin Reopened',
        };
      default:
        return {
          icon: <Clock className="w-3.5 h-3.5 text-slate-500" />,
          color: 'bg-slate-50 text-slate-700 border-slate-200',
          label: action,
        };
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((event, idx) => {
          const isLast = idx === history.length - 1;
          const badge = getActionBadge(event.action);

          return (
            <li key={event.id || idx}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3 items-start">
                  <div className="h-8 w-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-xs">
                    {badge.icon}
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          by <span className="text-slate-800 font-bold">{event.actor_name || event.actor_role}</span>
                        </span>
                      </div>

                      <div className="mt-1 flex items-center space-x-1.5 text-[11px] text-slate-500">
                        <span className="px-1.5 py-0.2 bg-slate-100 rounded text-slate-600 font-mono">
                          {event.previous_status}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="px-1.5 py-0.2 bg-slate-100 rounded text-slate-800 font-semibold font-mono">
                          {event.new_status}
                        </span>
                      </div>

                      {event.comments && (
                        <div className="mt-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 italic">
                          "{event.comments}"
                        </div>
                      )}
                    </div>

                    <div className="text-right text-[10px] whitespace-nowrap text-slate-400 font-medium">
                      {new Date(event.action_timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

