import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockStore } from '../../lib/mockStore';
import { ParticipantSelector } from './ParticipantSelector';
import { X, PlusCircle, AlertCircle } from 'lucide-react';

interface CreateApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateApplicationModal: React.FC<CreateApplicationModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { currentUser, departments } = useAuth();
  const [departmentId, setDepartmentId] = useState(
    currentUser.department_id || departments[0]?.id || '20000000-0000-0000-0000-000000000001'
  );
  const [trainingTitle, setTrainingTitle] = useState('');
  const [trainingCategory, setTrainingCategory] = useState('Safety');
  const [trainingObjectives, setTrainingObjectives] = useState('');
  const [trainingProvider, setTrainingProvider] = useState('');
  const [trainingLocation, setTrainingLocation] = useState('Training Center Site Pit 1');
  const [proposedStartDate, setProposedStartDate] = useState('2026-11-25');
  const [proposedEndDate, setProposedEndDate] = useState('2026-11-27');
  const [estimatedBudget, setEstimatedBudget] = useState<number>(5000000);
  const [trainingType, setTrainingType] = useState<'INTERNAL' | 'EXTERNAL' | 'CERTIFICATION' | 'IN_HOUSE'>('INTERNAL');
  const [description, setDescription] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [autoSubmit, setAutoSubmit] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Department-scoped employees (MOD user only gets MOD employees)
  const availableEmployees = mockStore.getVisibleEmployees(currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!trainingTitle.trim()) throw new Error('Please enter a training title.');
      if (!trainingObjectives.trim()) throw new Error('Please describe the training objectives.');
      if (!trainingProvider.trim()) throw new Error('Please specify the training provider / trainer.');
      if (selectedEmployees.length === 0) throw new Error('Please select at least one employee participant.');

      const newApp = mockStore.createDraftApplication(currentUser.id, {
        training_title: trainingTitle,
        training_category: trainingCategory,
        training_objectives: trainingObjectives,
        training_provider: trainingProvider,
        training_location: trainingLocation,
        proposed_start_date: proposedStartDate,
        proposed_end_date: proposedEndDate,
        estimated_budget: Number(estimatedBudget),
        training_type: trainingType,
        description,
        participant_employee_ids: selectedEmployees,
        department_id: departmentId,
      });

      if (autoSubmit) {
        mockStore.submitApplication(newApp.id, currentUser.id);
      }

      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Input Data Training Baru
            </h3>
            <p className="text-xs text-slate-500">
              Role Akses:{' '}
              <span className="font-semibold text-slate-700">
                {currentUser.role_name || 'Admin'}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Divisi / Departemen (7 Divisi Resmi) *
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} — {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Training Title *
              </label>
              <input
                type="text"
                required
                value={trainingTitle}
                onChange={(e) => setTrainingTitle(e.target.value)}
                placeholder="e.g. Defensive Driving & Hauler Safety Awareness"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={trainingCategory}
                onChange={(e) => setTrainingCategory(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="Safety">Safety / HSE</option>
                <option value="Technical">Technical & Operations</option>
                <option value="Certification">National Certification / POP</option>
                <option value="Compliance">Regulatory Compliance</option>
                <option value="Leadership">Supervisory & Leadership</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Training Type *
              </label>
              <select
                value={trainingType}
                onChange={(e) => setTrainingType(e.target.value as any)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="INTERNAL">Internal Training Center</option>
                <option value="EXTERNAL">External Training Institution</option>
                <option value="CERTIFICATION">Professional Certification Body (BNSP/ESDM)</option>
                <option value="IN_HOUSE">In-House Certified Workshop</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Training Provider *
              </label>
              <input
                type="text"
                required
                value={trainingProvider}
                onChange={(e) => setTrainingProvider(e.target.value)}
                placeholder="e.g. PT RAJA TC / LSP Mandiri"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Training Location *
              </label>
              <input
                type="text"
                required
                value={trainingLocation}
                onChange={(e) => setTrainingLocation(e.target.value)}
                placeholder="e.g. TC Main Building Room B"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Proposed Start Date *
              </label>
              <input
                type="date"
                required
                value={proposedStartDate}
                onChange={(e) => setProposedStartDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Proposed End Date *
              </label>
              <input
                type="date"
                required
                value={proposedEndDate}
                onChange={(e) => setProposedEndDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Budget (IDR) *
              </label>
              <input
                type="number"
                min="0"
                step="500000"
                required
                value={estimatedBudget}
                onChange={(e) => setEstimatedBudget(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Training Objectives & Justification *
            </label>
            <textarea
              required
              rows={2}
              value={trainingObjectives}
              onChange={(e) => setTrainingObjectives(e.target.value)}
              placeholder="State the technical competencies and business requirements addressed..."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Department Participant Multi-Picker */}
          <ParticipantSelector
            availableEmployees={availableEmployees}
            selectedEmployeeIds={selectedEmployees}
            onChange={setSelectedEmployees}
          />

          <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
            <input
              type="checkbox"
              id="autoSubmit"
              checked={autoSubmit}
              onChange={(e) => setAutoSubmit(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
            />
            <label htmlFor="autoSubmit" className="text-xs text-slate-700 font-medium cursor-pointer">
              Submit directly to HOD Training Center review queue (recommended)
            </label>
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{autoSubmit ? 'Submit Application' : 'Save as Draft'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

