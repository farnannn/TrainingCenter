import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

// ==============================================================================
// CollapsiblePanel — bagian halaman yang tertutup secara default, dibuka dengan klik
// ==============================================================================
interface CollapsiblePanelProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  title,
  subtitle,
  icon,
  badge,
  defaultOpen = false,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 rounded-[12px] border text-left transition-all cursor-pointer ${
          open
            ? 'bg-[#18232B] border-[#263640] text-white shadow-sm'
            : 'bg-white border-[#E2E8E8] text-[#18232B] hover:border-[#E88932]/50 hover:shadow-2xs'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <span
              className={`w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 ${
                open ? 'bg-[#E88932]/20 text-[#E88932]' : 'bg-[#E88932]/10 text-[#C66B1A]'
              }`}
            >
              {icon}
            </span>
          )}
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-heading font-bold truncate">{title}</div>
            {subtitle && (
              <div className={`text-[11px] truncate ${open ? 'text-slate-300' : 'text-[#5A6B75]'}`}>
                {subtitle}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          {badge}
          <span
            className={`hidden sm:inline text-[11px] font-semibold ${
              open ? 'text-[#E88932]' : 'text-[#C66B1A]'
            }`}
          >
            {open ? 'Tutup' : 'Lihat'}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              open ? 'rotate-180 text-[#E88932]' : 'text-[#5A6B75]'
            }`}
          />
        </div>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
};

