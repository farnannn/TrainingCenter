import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, ChevronRight } from 'lucide-react';

export type KpiTone = 'default' | 'orange' | 'success' | 'warning' | 'danger' | 'info';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  comparison?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendIsGood?: boolean;
  icon?: React.ReactNode;
  tone?: KpiTone;
  onClick?: () => void;
  active?: boolean;
  actionHint?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  comparison,
  trend,
  trendIsGood = true,
  icon,
  tone = 'default',
  onClick,
  active = false,
  actionHint,
}) => {
  const iconToneMap: Record<KpiTone, string> = {
    default: 'bg-[#F4F6F5] text-[#263640] border-[#E2E8E8]',
    orange: 'bg-[#E88932]/10 text-[#E88932] border-[#E88932]/25',
    success: 'bg-[#397C69]/10 text-[#397C69] border-[#397C69]/25',
    warning: 'bg-[#D5A33D]/15 text-[#9D7019] border-[#D5A33D]/30',
    danger: 'bg-[#B94C45]/10 text-[#B94C45] border-[#B94C45]/25',
    info: 'bg-[#527FA1]/10 text-[#527FA1] border-[#527FA1]/25',
  };

  const getTrendColor = () => {
    if (!trend || trend === 'neutral') return 'text-[#263640] bg-[#F4F6F5]';
    if (trend === 'up') {
      return trendIsGood
        ? 'text-[#397C69] bg-[#397C69]/10'
        : 'text-[#B94C45] bg-[#B94C45]/10';
    }
    return trendIsGood
      ? 'text-[#B94C45] bg-[#B94C45]/10'
      : 'text-[#397C69] bg-[#397C69]/10';
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`bg-white p-5 rounded-[12px] border flex flex-col justify-between transition-all ${
        onClick
          ? active
            ? 'cursor-pointer border-[#E88932] ring-2 ring-[#E88932]/25 shadow-md -translate-y-0.5 bg-[#FAFBFB]'
            : 'cursor-pointer border-[#E2E8E8] hover:border-[#E88932] hover:shadow-md hover:-translate-y-0.5 group'
          : 'border-[#E2E8E8] hover:border-[#CBD5D5]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium text-[#5A6B75] leading-snug group-hover:text-[#18232B] transition-colors">
          {title}
        </span>
        {icon && (
          <div
            className={`w-8 h-8 rounded-[8px] border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${iconToneMap[tone]}`}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl font-heading font-bold text-[#18232B] tabular-nums tracking-tight">
          {value}
        </div>

        {(subtitle || comparison) && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
            {comparison && (
              <span
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-medium tabular-nums ${getTrendColor()}`}
              >
                {trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
                {trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
                {trend === 'neutral' && <Minus className="w-3 h-3" />}
                <span>{comparison}</span>
              </span>
            )}
            {subtitle && (
              <span className="text-[#5A6B75] leading-tight">{subtitle}</span>
            )}
          </div>
        )}

        {onClick && (
          <div
            className={`mt-2.5 pt-2 border-t border-[#E2E8E8]/80 flex items-center justify-between text-[10px] font-mono font-semibold transition-colors ${
              active
                ? 'text-[#E88932]'
                : 'text-[#5A6B75] group-hover:text-[#E88932]'
            }`}
          >
            <span>{actionHint || 'Klik untuk lihat rincian terkait'}</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        )}
      </div>
    </div>
  );
};

