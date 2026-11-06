import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import { TrainingApplication, ApplicationStatus } from '../../lib/types';
import { ApplicationDetailModal } from './ApplicationDetailModal';
import { CreateApplicationModal } from './CreateApplicationModal';
import { FileText, Plus, Search, Filter, Building, Calendar, Users, Eye } from 'lucide-react';

interface ApplicationListProps {
  filterStatus?: ApplicationStatus;
  title?: string;
  subtitle?: string;
}

export const ApplicationList: React.FC<ApplicationListProps> = ({
  filterStatus,
  title = 'Training Applications',
  subtitle,
}) => {
  const { currentUser } = useAuth();
  const [selectedApp, setSelectedApp] = useState<TrainingApplication | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(filterStatus || 'ALL');

  const visibleApps = mockStore.getVisibleApplications(currentUser.id);

  const filtered = visibleApps.filter((app) => {
    const matchesSearch =
      app.training_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.application_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.department_name && app.department_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' || app.current_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'SUBMITTED':
      case 'UNDER_HOD_REVIEW':
        return 'bg-blue-100 text-blue-800 border-blue-300 font-bold';
      case 'PENDING_PJO':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
      case 'SCHEDULED':
        return 'bg-teal-100 text-teal-800 border-teal-300 font-bold';
      case 'IN_PROGRESS':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300 font-bold';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-300 font-bold';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const isDeptUser = currentUser.role_code === 'DEPARTMENT_USER';

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">
            {subtitle || (isDeptUser
              ? `Authorized application submissions for ${currentUser.department_name}`
              : 'Reviewing company-wide training applications and approval sequences')}
          </p>
        </div>

        {isDeptUser && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Training Application</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, number, or department..."
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
          >
            <option value="ALL">All Statuses ({visibleApps.length})</option>
            <option value="DRAFT">DRAFT</option>
            <option value="UNDER_HOD_REVIEW">UNDER HOD REVIEW</option>
            <option value="PENDING_PJO">PENDING PJO</option>
            <option value="APPROVED">APPROVED</option>
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No training applications found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Application Number & Title</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Participants</th>
                  <th className="px-6 py-3">Proposed Dates</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5">
                      <div className="font-mono text-[11px] font-bold text-sky-700">
                        {app.application_number}
                      </div>
                      <div className="text-slate-900 font-bold text-xs">{app.training_title}</div>
                      <div className="text-[11px] text-slate-400">
                        {app.training_category} • {app.training_type}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-slate-800">{app.department_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">By: {app.submitter_name}</div>
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-700">
                      {app.participants?.length || 0} Employees
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {app.proposed_start_date} to {app.proposed_end_date}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                          app.current_status
                        )}`}
                      >
                        {app.current_status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 rounded-lg text-xs font-semibold transition-colors inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <ApplicationDetailModal
        isOpen={Boolean(selectedApp)}
        application={selectedApp}
        onClose={() => setSelectedApp(null)}
        onRefresh={() => setSelectedApp(null)}
      />

      <CreateApplicationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => setShowCreateModal(false)}
      />
    </div>
  );
};

