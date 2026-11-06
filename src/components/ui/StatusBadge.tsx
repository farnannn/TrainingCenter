import React from 'react';
import {
  FileEdit,
  Send,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  PlayCircle,
  Award,
  XCircle,
} from 'lucide-react';
import { ApplicationStatus } from '../../lib/types';

interface StatusBadgeProps {
  status: ApplicationStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getConfig = (st: string) => {
    switch (st) {
      case 'DRAFT':
        return {
          label: 'Draft / Revisi',
          icon: <FileEdit className="w-3 h-3" />,
          classes: 'bg-[#F4F6F5] text-[#263640] border-[#E2E8E8]',
        };
      case 'SUBMITTED':
        return {
          label: 'Submitted',
          icon: <Send className="w-3 h-3" />,
          classes: 'bg-[#527FA1]/10 text-[#527FA1] border-[#527FA1]/30',
        };
      case 'UNDER_HOD_REVIEW':
        return {
          label: 'HOD Review',
          icon: <Clock className="w-3 h-3" />,
          classes: 'bg-[#527FA1]/15 text-[#2F5B7C] border-[#527FA1]/35',
        };
      case 'PENDING_PJO':
        return {
          label: 'Pending PJO',
          icon: <ShieldAlert className="w-3 h-3" />,
          classes: 'bg-[#D5A33D]/15 text-[#8C6412] border-[#D5A33D]/40',
        };
      case 'APPROVED':
        return {
          label: 'Approved',
          icon: <CheckCircle2 className="w-3 h-3" />,
          classes: 'bg-[#397C69]/12 text-[#296050] border-[#397C69]/35',
        };
      case 'SCHEDULED':
        return {
          label: 'Scheduled',
          icon: <Calendar className="w-3 h-3" />,
          classes: 'bg-[#E88932]/12 text-[#B86214] border-[#E88932]/35',
        };
      case 'IN_PROGRESS':
        return {
          label: 'In Progress',
          icon: <PlayCircle className="w-3 h-3" />,
          classes: 'bg-[#E88932]/15 text-[#A8560C] border-[#E88932]/40',
        };
      case 'COMPLETED':
        return {
          label: 'Completed',
          icon: <Award className="w-3 h-3" />,
          classes: 'bg-[#397C69]/15 text-[#235345] border-[#397C69]/40',
        };
      case 'REJECTED':
        return {
          label: 'Rejected',
          icon: <XCircle className="w-3 h-3" />,
          classes: 'bg-[#B94C45]/12 text-[#93332D] border-[#B94C45]/35',
        };
      default:
        return {
          label: st.replace(/_/g, ' '),
          icon: <Clock className="w-3 h-3" />,
          classes: 'bg-[#F4F6F5] text-[#263640] border-[#E2E8E8]',
        };
    }
  };

  const cfg = getConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[11px] font-medium border ${cfg.classes}`}
    >
      {cfg.icon}
      <span>{cfg.label}</span>
    </span>
  );
};

