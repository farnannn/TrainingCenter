import React from 'react';
import { X } from 'lucide-react';

// ==============================================================================
// SHARED UI HELPERS — PROGRAM TECHNICAL TRAINING MODULE
// ==============================================================================

export const inputCls =
  'w-full h-[38px] px-3 text-xs bg-[#F4F6F5] border border-[#E2E8E8] rounded-[8px] text-[#18232B] focus:bg-white focus:outline-none focus:border-[#E88932]';

export const labelCls = 'block text-[11px] font-medium text-[#5A6B75] mb-1';

export const fmtPct = (v: number, digits = 2) =>
  `${v.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: digits })}%`;

export const pctOf = (num: number, den: number) =>
  den > 0 ? Math.round((num / den) * 10000) / 100 : 0;

// ------------------------------------------------------------------------------
// Status Pill (consistent colors across module)
// ------------------------------------------------------------------------------
const STATUS_STYLE: Record<string, string> = {
  passed: 'bg-[#397C69]/12 text-[#296050] border-[#397C69]/30',
  done: 'bg-[#397C69]/12 text-[#296050] border-[#397C69]/30',
  completed: 'bg-[#397C69]/12 text-[#296050] border-[#397C69]/30',
  evaluated: 'bg-[#397C69]/12 text-[#296050] border-[#397C69]/30',
  tercapai: 'bg-[#397C69]/12 text-[#296050] border-[#397C69]/30',
  'on going': 'bg-[#E88932]/12 text-[#B86214] border-[#E88932]/35',
  on_going: 'bg-[#E88932]/12 text-[#B86214] border-[#E88932]/35',
  scheduled: 'bg-[#527FA1]/12 text-[#3D6585] border-[#527FA1]/30',
  pending: 'bg-[#D5A33D]/15 text-[#8A6A1F] border-[#D5A33D]/35',
  failed: 'bg-[#B94C45]/10 text-[#B94C45] border-[#B94C45]/30',
  'belum tercapai': 'bg-[#B94C45]/10 text-[#B94C45] border-[#B94C45]/30',
};

export const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const style =
    STATUS_STYLE[status.toLowerCase()] || 'bg-[#F4F6F5] text-[#263640] border-[#E2E8E8]';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold uppercase tracking-wide whitespace-nowrap ${style}`}
    >
      {status.replace('_', ' ')}
    </span>
  );
};

// ------------------------------------------------------------------------------
// Stat Card (Premium Modern Design with Top Accent Strip)
// ------------------------------------------------------------------------------
export const StatCard: React.FC<{
  label: string;
  value: React.ReactNode;
  unit?: string;
  hint?: string;
  icon?: React.ReactNode;
  tone?: 'dark' | 'orange' | 'green' | 'blue' | 'red' | 'light';
  onClick?: () => void;
  active?: boolean;
}> = ({ label, value, unit, hint, icon, tone = 'light', onClick, active }) => {
  const tones: Record<string, string> = {
    dark: 'bg-gradient-to-br from-[#18232B] via-[#1E2D38] to-[#263640] text-white border-[#2E424F]',
    orange: 'bg-gradient-to-br from-[#E88932] to-[#C66B1A] text-white border-[#C66B1A]',
    green: 'bg-white text-[#18232B] border-[#397C69]/35 hover:border-[#397C69]',
    blue: 'bg-white text-[#18232B] border-[#527FA1]/35 hover:border-[#527FA1]',
    red: 'bg-white text-[#18232B] border-[#B94C45]/35 hover:border-[#B94C45]',
    light: 'bg-white text-[#18232B] border-[#E2E8E8] hover:border-[#CBD5E1]',
  };
  const topBar: Record<string, string> = {
    dark: 'bg-[#E88932]',
    orange: 'bg-white/40',
    green: 'bg-[#397C69]',
    blue: 'bg-[#527FA1]',
    red: 'bg-[#B94C45]',
    light: 'bg-[#E88932]',
  };
  const accent: Record<string, string> = {
    dark: 'text-[#E88932]',
    orange: 'text-white/90',
    green: 'text-[#397C69]',
    blue: 'text-[#527FA1]',
    red: 'text-[#B94C45]',
    light: 'text-[#E88932]',
  };
  const isDark = tone === 'dark' || tone === 'orange';
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden p-4 rounded-[14px] border shadow-xs transition-all duration-200 ${tones[tone]} ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : ''
      } ${active ? 'ring-2 ring-[#E88932] shadow-md' : ''}`}
    >
      <span className={`absolute top-0 left-0 right-0 h-1 ${topBar[tone]}`} />
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
            isDark ? 'text-white/80' : 'text-[#5A6B75]'
          }`}
        >
          {label}
        </span>
        {icon && <span className={accent[tone]}>{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-2xl font-heading font-extrabold tabular-nums tracking-tight">
          {value}
        </span>
        {unit && (
          <span className={`text-xs font-semibold ${isDark ? 'text-white/85' : 'text-[#5A6B75]'}`}>
            {unit}
          </span>
        )}
      </div>
      {hint && (
        <div
          className={`mt-1.5 text-[11px] font-medium ${
            isDark ? 'text-white/75' : 'text-[#5A6B75]'
          }`}
        >
          {hint}
        </div>
      )}
    </div>
  );
};

// ------------------------------------------------------------------------------
// Section Card wrapper
// ------------------------------------------------------------------------------
export const SectionCard: React.FC<{
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, subtitle, badge, actions, children }) => (
  <div className="bg-white rounded-[14px] border border-[#E2E8E8] shadow-2xs overflow-hidden">
    <div className="px-5 py-4 bg-[#F4F6F5] border-b border-[#E2E8E8] flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {badge && (
            <span className="px-2 py-0.5 rounded bg-[#18232B] text-[#E88932] font-mono text-[10px] font-bold">
              {badge}
            </span>
          )}
          <h3 className="text-xs sm:text-sm font-heading font-bold text-[#18232B] uppercase tracking-wide">
            {title}
          </h3>
        </div>
        {subtitle && <p className="text-[11px] text-[#5A6B75] mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
    <div className="p-4 sm:p-5">{children}</div>
  </div>
);

// ------------------------------------------------------------------------------
// Modal
// ------------------------------------------------------------------------------
export const Modal: React.FC<{
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}> = ({ open, title, onClose, children, wide }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#18232B]/60 backdrop-blur-xs" onClick={onClose} />
      <div
        className={`relative z-10 w-full ${
          wide ? 'max-w-3xl' : 'max-w-xl'
        } bg-white rounded-[14px] shadow-2xl border border-[#E2E8E8] max-h-[90vh] flex flex-col`}
      >
        <div className="px-5 py-3.5 bg-[#18232B] text-white rounded-t-[14px] flex items-center justify-between">
          <h3 className="text-sm font-heading font-bold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------------------
// Table helpers
// ------------------------------------------------------------------------------
export const thCls =
  'px-3 py-2.5 text-left text-[10px] font-mono font-bold uppercase tracking-wider text-white bg-[#18232B] whitespace-nowrap';
export const tdCls = 'px-3 py-2.5 text-xs text-[#18232B] align-middle';

// ------------------------------------------------------------------------------
// Export helpers (CSV/Excel & Print/PDF)
// ------------------------------------------------------------------------------
export function exportCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v ?? '');
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const content = '\uFEFF' + [headers, ...rows].map((r) => r.map(esc).join(',')).join('\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function printTable(title: string, headers: string[], rows: (string | number)[][], footnote?: string) {
  const w = window.open('', '_blank', 'width=1100,height=800');
  if (!w) return;
  const head = headers.map((h) => `<th>${h}</th>`).join('');
  const body = rows
    .map((r) => `<tr>${r.map((c) => `<td>${String(c ?? '')}</td>`).join('')}</tr>`)
    .join('');
  w.document.write(`<!doctype html><html><head><title>${title}</title>
  <style>
    body{font-family:Arial,sans-serif;padding:24px;color:#18232B}
    h1{font-size:16px;margin:0 0 4px} p{font-size:11px;color:#5A6B75;margin:0 0 14px}
    table{border-collapse:collapse;width:100%;font-size:11px}
    th{background:#18232B;color:#fff;padding:6px;text-align:left}
    td{border:1px solid #E2E8E8;padding:6px}
    tr:nth-child(even) td{background:#F4F6F5}
  </style></head><body>
  <h1>${title}</h1><p>RAJA ACADEMY • PT. Roda Jaya Sakti • Dicetak ${new Date().toLocaleString('id-ID')}</p>
  <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
  ${footnote ? `<p style="margin-top:12px">${footnote}</p>` : ''}
  <script>window.onload=function(){window.print();}</script>
  </body></html>`);
  w.document.close();
}

// ------------------------------------------------------------------------------
// Charts (pure SVG — no external dependency)
// ------------------------------------------------------------------------------
export interface BarSeries {
  key: string;
  label: string;
  color: string;
}

export const GroupedBarChart: React.FC<{
  categories: string[];
  series: BarSeries[];
  data: Record<string, number>[];
  height?: number;
  highlightIndex?: number;
  onSelectCategory?: (category: string, index: number) => void;
}> = ({ categories, series, data, height = 250, highlightIndex, onSelectCategory }) => {
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);
  const width = Math.max(580, categories.length * (series.length * 20 + 32) + 64);
  const padL = 40;
  const padR = 16;
  const padT = 26;
  const padB = 48;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const maxVal = Math.max(
    1,
    ...data.flatMap((d) => series.map((s) => Number(d[s.key]) || 0))
  );
  const niceMax = Math.ceil(maxVal / 10) * 10 || 10;
  const groupW = plotW / Math.max(categories.length, 1);
  const barW = Math.min(24, (groupW - 12) / series.length);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(niceMax * t));

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[520px] select-none" style={{ height }}>
        {ticks.map((t) => {
          const y = padT + plotH - (t / niceMax) * plotH;
          return (
            <g key={t}>
              <line x1={padL} x2={width - padR} y1={y} y2={y} stroke="#E2E8E8" strokeDasharray="3 3" />
              <text x={padL - 7} y={y + 3} fontSize="9.5" textAnchor="end" fill="#5A6B75" fontFamily="monospace">
                {t}
              </text>
            </g>
          );
        })}
        {categories.map((cat, ci) => {
          const gx = padL + ci * groupW + (groupW - barW * series.length) / 2;
          const isHl = highlightIndex === ci || hoverIdx === ci;
          return (
            <g
              key={cat}
              onMouseEnter={() => setHoverIdx(ci)}
              onMouseLeave={() => setHoverIdx(null)}
              onClick={() => onSelectCategory?.(cat, ci)}
              className={onSelectCategory ? 'cursor-pointer' : ''}
            >
              <rect
                x={padL + ci * groupW + 2}
                y={padT}
                width={groupW - 4}
                height={plotH}
                fill={isHl ? '#E88932' : 'transparent'}
                opacity={isHl ? 0.08 : 0}
                rx={6}
              />
              {series.map((s, si) => {
                const v = Number(data[ci]?.[s.key]) || 0;
                const h = Math.max(v > 0 ? 3 : 0, (v / niceMax) * plotH);
                const x = gx + si * barW;
                const y = padT + plotH - h;
                return (
                  <g key={s.key}>
                    <rect
                      x={x + 1}
                      y={y}
                      width={barW - 2}
                      height={h}
                      rx={4}
                      fill={s.color}
                      opacity={hoverIdx !== null && hoverIdx !== ci ? 0.72 : 1}
                    >
                      <title>{`${cat} • ${s.label}: ${v}`}</title>
                    </rect>
                    {v > 0 && (
                      <text
                        x={x + barW / 2}
                        y={y - 4}
                        fontSize="9"
                        textAnchor="middle"
                        fill="#18232B"
                        fontWeight={700}
                        fontFamily="monospace"
                      >
                        {v}
                      </text>
                    )}
                  </g>
                );
              })}
              <text
                x={padL + ci * groupW + groupW / 2}
                y={height - padB + 15}
                fontSize="9.5"
                textAnchor="middle"
                fill={isHl ? '#C66B1A' : '#18232B'}
                fontWeight={700}
              >
                {cat.length > 13 ? cat.slice(0, 12) + '…' : cat}
              </text>
            </g>
          );
        })}
        <g transform={`translate(${padL}, ${height - 14})`}>
          {series.map((s, i) => (
            <g key={s.key} transform={`translate(${i * 135}, 0)`}>
              <rect width="10" height="10" y={-8} rx={2.5} fill={s.color} />
              <text x="14" y="0" fontSize="10" fill="#263640" fontWeight={600}>
                {s.label}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export const LineTrendChart: React.FC<{
  labels: string[];
  values: number[];
  target?: number;
  height?: number;
  dashedFromIndex?: number;
  suffix?: string;
}> = ({ labels, values, target = 100, height = 230, dashedFromIndex, suffix = '%' }) => {
  const width = 620;
  const padL = 44;
  const padR = 20;
  const padT = 26;
  const padB = 34;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const maxVal = Math.max(target * 1.2, ...values, 10);
  const niceMax = Math.ceil(maxVal / 50) * 50;
  const pts = values.map((v, i) => ({
    x: padL + (labels.length > 1 ? (i / (labels.length - 1)) * plotW : plotW / 2),
    y: padT + plotH - (v / niceMax) * plotH,
    v,
  }));
  const solidPts = dashedFromIndex !== undefined ? pts.slice(0, dashedFromIndex + 1) : pts;
  const dashPts = dashedFromIndex !== undefined ? pts.slice(dashedFromIndex) : [];
  const targetY = padT + plotH - (target / niceMax) * plotH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(niceMax * t));
  const areaPts =
    pts.length > 0
      ? `${pts[0].x},${padT + plotH} ${pts.map((p) => `${p.x},${p.y}`).join(' ')} ${
          pts[pts.length - 1].x
        },${padT + plotH}`
      : '';

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full select-none" style={{ height }}>
      <defs>
        <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#E88932" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#E88932" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {ticks.map((t) => {
        const y = padT + plotH - (t / niceMax) * plotH;
        return (
          <g key={t}>
            <line x1={padL} x2={width - padR} y1={y} y2={y} stroke="#E2E8E8" strokeDasharray="3 3" />
            <text x={padL - 7} y={y + 3} fontSize="9.5" textAnchor="end" fill="#5A6B75" fontFamily="monospace">
              {t}
              {suffix}
            </text>
          </g>
        );
      })}
      <line x1={padL} x2={width - padR} y1={targetY} y2={targetY} stroke="#397C69" strokeWidth={1.6} strokeDasharray="6 4" />
      <text x={width - padR} y={targetY - 5} fontSize="9.5" textAnchor="end" fill="#397C69" fontWeight={700}>
        Target {target}
        {suffix}
      </text>
      {areaPts && <polygon points={areaPts} fill="url(#trendFill)" />}
      <polyline points={solidPts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#E88932" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      {dashPts.length > 1 && (
        <polyline points={dashPts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#E88932" strokeWidth={2.5} strokeDasharray="5 4" />
      )}
      {pts.map((p, i) => {
        const ok = p.v >= target;
        const isOngoing = dashedFromIndex !== undefined && i > dashedFromIndex;
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={5.5} fill={isOngoing ? '#fff' : ok ? '#397C69' : '#B94C45'} stroke={isOngoing ? '#E88932' : '#fff'} strokeWidth={2.2}>
              <title>{`${labels[i]}: ${Math.round(p.v * 100) / 100}${suffix}`}</title>
            </circle>
            <rect
              x={p.x - 19}
              y={p.y - 22}
              width={38}
              height={14}
              rx={4}
              fill="#18232B"
              opacity={0.9}
            />
            <text x={p.x} y={p.y - 12} fontSize="8.5" textAnchor="middle" fill="#FFFFFF" fontWeight={700} fontFamily="monospace">
              {Math.round(p.v)}
              {suffix}
            </text>
            <text x={p.x} y={height - padB + 16} fontSize="10" textAnchor="middle" fill="#18232B" fontWeight={700}>
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export const DonutChart: React.FC<{
  segments: { label: string; value: number; color: string }[];
  centerLabel: string;
  centerValue: string;
  size?: number;
  selectedLabel?: string;
  onSelectSegment?: (label: string) => void;
}> = ({ segments, centerLabel, centerValue, size = 176, selectedLabel, onSelectSegment }) => {
  const r = size / 2 - 18;
  const c = 2 * Math.PI * r;
  const total = Math.max(1, segments.reduce((s, x) => s + x.value, 0));
  let offset = 0;
  return (
    <div className="flex items-center gap-5 flex-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 select-none">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F4F6F5" strokeWidth={20} />
        {segments.map((s) => {
          const len = (s.value / total) * c;
          const isSelected = selectedLabel && selectedLabel !== 'ALL' && selectedLabel === s.label;
          const el = (
            <circle
              key={s.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={isSelected ? 23 : 19}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              onClick={() => onSelectSegment?.(s.label)}
              className={onSelectSegment ? 'cursor-pointer transition-all hover:opacity-85' : ''}
            >
              <title>{`${s.label}: ${s.value} (${Math.round((s.value / total) * 1000) / 10}%)`}</title>
            </circle>
          );
          offset += len;
          return el;
        })}
        <text x="50%" y="47%" textAnchor="middle" fontSize="22" fontWeight={800} fill="#18232B" fontFamily="monospace">
          {centerValue}
        </text>
        <text x="50%" y="61%" textAnchor="middle" fontSize="9.5" fontWeight={600} fill="#5A6B75">
          {centerLabel}
        </text>
      </svg>
      <div className="space-y-1.5 flex-1 min-w-[160px]">
        {segments.map((s) => {
          const pct = Math.round((s.value / total) * 1000) / 10;
          const isSelected = selectedLabel && selectedLabel !== 'ALL' && selectedLabel === s.label;
          return (
            <div
              key={s.label}
              onClick={() => onSelectSegment?.(s.label)}
              className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-[8px] border text-xs transition-all ${
                onSelectSegment ? 'cursor-pointer hover:bg-[#F4F6F5]' : ''
              } ${
                isSelected
                  ? 'bg-[#18232B] text-white border-[#E88932]'
                  : 'bg-[#FAFBFB] text-[#18232B] border-[#E2E8E8]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-3 h-3 rounded-xs shrink-0" style={{ background: s.color }} />
                <span className="truncate font-semibold">{s.label}</span>
              </div>
              <span className="font-mono font-bold whitespace-nowrap">
                {s.value} <span className="opacity-75">({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ProgressBar: React.FC<{ value: number; max?: number; color?: string }> = ({
  value,
  max = 100,
  color,
}) => {
  const pct = Math.max(0, Math.min(100, (value / Math.max(max, 1)) * 100));
  const c = color || (pct >= 75 ? '#397C69' : pct >= 40 ? '#E88932' : '#B94C45');
  return (
    <div className="w-full h-2.5 bg-[#F4F6F5] rounded-full overflow-hidden border border-[#E2E8E8]">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${pct}%`, background: c }}
      />
    </div>
  );
};

