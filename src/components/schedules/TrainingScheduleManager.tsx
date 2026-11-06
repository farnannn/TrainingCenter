import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import { TrainingApplication, TrainingSchedule } from '../../lib/types';
import { Calendar, Plus, CheckCircle, Award, Users, AlertCircle, X } from 'lucide-react';

interface TrainingScheduleManagerProps {
  initialApprovedApp?: TrainingApplication | null;
}

export const TrainingScheduleManager: React.FC<TrainingScheduleManagerProps> = ({
  initialApprovedApp,
}) => {
  const { currentUser, refreshState } = useAuth();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(initialApprovedApp?.id || '');
  const [batchNumber, setBatchNumber] = useState('BATCH-2026-01');
  const [trainerName, setTrainerName] = useState('Ir. Hendra Kusuma (Master Trainer)');
  const [venue, setVenue] = useState('Training Center Hall 1 & Simulator Pit');
  const [startDate, setStartDate] = useState('2026-11-28');
  const [endDate, setEndDate] = useState('2026-11-30');
  const [totalHours, setTotalHours] = useState(16);
  const [error, setError] = useState<string | null>(null);

  // Execution modal state
  const [executingSchedule, setExecutingSchedule] = useState<TrainingSchedule | null>(null);
  const [participantScores, setParticipantScores] = useState<Record<string, { attended: boolean; score: number; passed: boolean; hours: number; cert: boolean }>>({});

  const schedules = mockStore.schedules;
  const approvedApps = mockStore.applications.filter((a) => a.current_status === 'APPROVED');

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!selectedAppId) throw new Error('Please select an approved training application.');

      mockStore.scheduleApprovedTraining(selectedAppId, currentUser.id, {
        batch_number: batchNumber,
        trainer_name: trainerName,
        venue,
        start_date: startDate,
        end_date: endDate,
        total_hours: Number(totalHours),
      });

      refreshState();
      setShowScheduleModal(false);
    } catch (err: any) {
      setError(err.message || 'Scheduling failed');
    }
  };

  const openExecutionModal = (sched: TrainingSchedule) => {
    setExecutingSchedule(sched);
    const recs = mockStore.records.filter((r) => r.schedule_id === sched.id);
    const initial: Record<string, { attended: boolean; score: number; passed: boolean; hours: number; cert: boolean }> = {};

    for (const r of recs) {
      initial[r.employee_id] = {
        attended: true,
        score: 85,
        passed: true,
        hours: sched.total_hours,
        cert: true,
      };
    }
    setParticipantScores(initial);
  };

  const handleCompleteExecution = () => {
    if (!executingSchedule) return;

    try {
      const results = Object.entries(participantScores).map(([empId, val]) => ({
        employee_id: empId,
        attended: val.attended,
        score: val.score,
        passed: val.passed,
        hours: val.hours,
        issue_certificate: val.cert,
      }));

      mockStore.completeTrainingExecution(executingSchedule.id, currentUser.id, results);
      refreshState();
      setExecutingSchedule(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const canManageSchedule =
    currentUser.role_code === 'ADMIN_HOD_TC' || currentUser.role_code === 'SUPER_ADMIN';

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Schedule Button */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900">Training Schedules & Execution</h3>
          <p className="text-xs text-slate-500">
            Rule Enforcement: Only applications authorized by PJO (APPROVED status) can be scheduled for operational delivery.
          </p>
        </div>

        {canManageSchedule && (
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Approved Application ({approvedApps.length} Ready)</span>
          </button>
        )}
      </div>

      {/* Schedules Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Active & Completed Training Sessions ({schedules.length})
          </h4>
        </div>

        {schedules.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No training schedules yet. Approve an application to schedule a session.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Batch & Application</th>
                  <th className="px-6 py-3">Trainer & Venue</th>
                  <th className="px-6 py-3">Execution Dates</th>
                  <th className="px-6 py-3">Duration</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedules.map((sched) => {
                  const app = mockStore.applications.find((a) => a.id === sched.application_id);
                  const enrolledCount = mockStore.records.filter((r) => r.schedule_id === sched.id).length;

                  return (
                    <tr key={sched.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3.5">
                        <div className="font-bold text-slate-900 font-mono text-[11px] text-sky-700">
                          {sched.batch_number}
                        </div>
                        <div className="text-slate-800 font-semibold">{app?.training_title}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{app?.application_number}</div>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="font-medium text-slate-800">{sched.trainer_name}</div>
                        <div className="text-[11px] text-slate-500">{sched.venue}</div>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="text-slate-800">
                          {sched.start_date} to {sched.end_date}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {sched.daily_start_time} - {sched.daily_end_time}
                        </div>
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-slate-700">
                        {sched.total_hours} Hours
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            sched.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-teal-100 text-teal-800 border-teal-300'
                          }`}
                        >
                          {sched.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        {sched.status !== 'COMPLETED' && canManageSchedule ? (
                          <button
                            onClick={() => openExecutionModal(sched)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-xs"
                          >
                            Record Completion
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 flex items-center justify-end space-x-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Done ({enrolledCount} trained)</span>
                          </span>
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

      {/* Schedule Creation Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">
                Schedule Approved Training Session
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Authorized Application (APPROVED only) *
                </label>
                {approvedApps.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                    No approved applications waiting for scheduling. PJO approval is required first.
                  </div>
                ) : (
                  <select
                    required
                    value={selectedAppId}
                    onChange={(e) => setSelectedAppId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="">-- Choose Approved Application --</option>
                    {approvedApps.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.application_number} - {a.training_title} ({a.department_name})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Batch Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Hours *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalHours}
                    onChange={(e) => setTotalHours(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instructor / Trainer *
                </label>
                <input
                  type="text"
                  required
                  value={trainerName}
                  onChange={(e) => setTrainerName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Venue / Classroom *
                </label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={approvedApps.length === 0}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Create Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Execution Recording Modal */}
      {executingSchedule && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Record Completion & Results
                </h3>
                <p className="text-xs text-slate-500">
                  {executingSchedule.batch_number} • Automatically recalculates KPI scores
                </p>
              </div>
              <button
                onClick={() => setExecutingSchedule(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-xs text-slate-600">
                Mark attendance and scores for participants. Successful completion will award certification records and update KPI Hours/Emp & Pass Rate metrics.
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto divide-y divide-slate-100">
                {mockStore.records
                  .filter((r) => r.schedule_id === executingSchedule.id)
                  .map((rec) => {
                    const emp = mockStore.employees.find((e) => e.id === rec.employee_id);
                    const current = participantScores[rec.employee_id] || {
                      attended: true,
                      score: 85,
                      passed: true,
                      hours: executingSchedule.total_hours,
                      cert: true,
                    };

                    return (
                      <div key={rec.id} className="pt-3 first:pt-0 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800">
                            {emp?.full_name} ({emp?.nik})
                          </span>
                          <label className="flex items-center space-x-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={current.attended}
                              onChange={(e) =>
                                setParticipantScores({
                                  ...participantScores,
                                  [rec.employee_id]: { ...current, attended: e.target.checked },
                                })
                              }
                              className="rounded text-emerald-600"
                            />
                            <span className="font-semibold text-slate-700">Attended</span>
                          </label>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <span className="text-[10px] text-slate-500">Completed Hours</span>
                            <input
                              type="number"
                              min="0"
                              value={current.hours}
                              onChange={(e) =>
                                setParticipantScores({
                                  ...participantScores,
                                  [rec.employee_id]: { ...current, hours: Number(e.target.value) },
                                })
                              }
                              className="w-full text-xs px-2 py-1 border rounded"
                            />
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-500">Score (0-100)</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={current.score}
                              onChange={(e) =>
                                setParticipantScores({
                                  ...participantScores,
                                  [rec.employee_id]: {
                                    ...current,
                                    score: Number(e.target.value),
                                    passed: Number(e.target.value) >= 70,
                                  },
                                })
                              }
                              className="w-full text-xs px-2 py-1 border rounded"
                            />
                          </div>

                          <div className="flex items-center pt-3">
                            <label className="flex items-center space-x-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={current.cert}
                                onChange={(e) =>
                                  setParticipantScores({
                                    ...participantScores,
                                    [rec.employee_id]: { ...current, cert: e.target.checked },
                                  })
                                }
                                className="rounded text-sky-600"
                              />
                              <span className="text-[11px] font-semibold text-sky-800">Issue Cert</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setExecutingSchedule(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteExecution}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Confirm Completion & Recalculate KPI
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
