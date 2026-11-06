import React from 'react';
import { Employee } from '../../lib/types';
import { User, CheckSquare, Square } from 'lucide-react';

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

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs">
        <span className="font-semibold text-slate-700">
          Select Department Employees ({selectedEmployeeIds.length} selected)
        </span>
        <div className="space-x-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-sky-600 hover:text-sky-800 font-medium"
          >
            Select All
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={clearAll}
            className="text-slate-500 hover:text-slate-700 font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      {availableEmployees.length === 0 ? (
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center text-xs text-slate-500">
          No employees found in your department scope.
        </div>
      ) : (
        <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white">
          {availableEmployees.map((emp) => {
            const isSelected = selectedEmployeeIds.includes(emp.id);
            return (
              <div
                key={emp.id}
                onClick={() => toggleEmployee(emp.id)}
                className={`p-2.5 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                  isSelected ? 'bg-sky-50/70 text-sky-900' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="text-sky-600">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 fill-sky-100" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{emp.full_name}</div>
                    <div className="text-[11px] text-slate-500 flex items-center space-x-1.5">
                      <span className="font-mono">{emp.nik}</span>
                      <span>•</span>
                      <span>{emp.position}</span>
                      <span>•</span>
                      <span className="px-1.5 py-0.2 bg-slate-100 rounded text-[10px] text-slate-600">
                        {emp.job_level}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-medium">
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
