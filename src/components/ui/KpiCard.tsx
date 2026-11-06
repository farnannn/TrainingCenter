import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

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
    <div className="bg-white p-5 rounded-[12px] border border-[#E2E8E8] flex flex-col justify-between transition-colors hover:border-[#CBD5D5]">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium text-[#5A6B75] leading-snug">
          {title}
        </span>
        {icon && (
          <div
            className={`w-8 h-8 rounded-[8px] border flex items-center justify-center shrink-0 ${iconToneMap[tone]}`}
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
      </div>
    </div>
  );
};

