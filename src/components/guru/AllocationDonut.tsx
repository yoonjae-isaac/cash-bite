import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import type { GuruPortfolio } from '../../domain/guru/types';
import {
  formatIssuerName,
  formatUsd13F,
  GURU_CHART_COLORS,
  GURU_OTHERS_COLOR,
} from '../../domain/guru/format';

const TOP_N = GURU_CHART_COLORS.length; // 상위 8 + 기타

type Segment = { label: string; weight: number; color: string };

interface TipProps {
  active?: boolean;
  payload?: Array<{ payload: Segment }>;
}

const DonutTooltip = ({ active, payload }: TipProps) => {
  if (!active || !payload?.length) {
    return null;
  }
  const seg = payload[0].payload;
  return (
    <div className="px-2.5 py-1.5 rounded-lg bg-cb-surface border border-cb-border text-xs shadow-lg">
      <span className="font-bold text-cb-foreground">{seg.label}</span>
      <span className="ml-2 text-cb-muted tabular-nums">{seg.weight.toFixed(1)}%</span>
    </div>
  );
};

function buildSegments(portfolio: GuruPortfolio, othersLabel: string): Segment[] {
  const top: Segment[] = portfolio.holdings.slice(0, TOP_N).map((h, i) => ({
    label: h.ticker ?? formatIssuerName(h.nameOfIssuer),
    weight: h.weight,
    color: GURU_CHART_COLORS[i],
  }));
  const topSum = top.reduce((sum, s) => sum + s.weight, 0);
  const rest = Math.max(0, 100 - topSum);
  if (rest > 0.01 && portfolio.holdings.length > TOP_N) {
    top.push({ label: othersLabel, weight: rest, color: GURU_OTHERS_COLOR });
  }
  return top;
}

const AllocationDonut = ({ portfolio }: { portfolio: GuruPortfolio }) => {
  const t = useLanguageStore((s) => s.t);

  const segments = useMemo(
    () => buildSegments(portfolio, t.gurus.others),
    [portfolio, t.gurus.others]
  );

  return (
    <div className="glass-panel rounded-xl p-5">
      <h3 className="text-base font-bold text-cb-foreground mb-4">{t.gurus.allocationTitle}</h3>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-48 h-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={segments}
                dataKey="weight"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={1.5}
                startAngle={90}
                endAngle={-270}
                stroke="none"
                isAnimationActive={false}
              >
                {segments.map((seg) => (
                  <Cell key={seg.label} fill={seg.color} />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* 중앙 라벨 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-bold text-cb-foreground tabular-nums">
              {formatUsd13F(portfolio.totalValue)}
            </span>
            <span className="text-[10px] text-cb-muted">{t.gurus.totalValue}</span>
          </div>
        </div>

        <ul className="flex-1 w-full space-y-1.5">
          {segments.map((seg) => (
            <li key={seg.label} className="flex items-center gap-2 text-sm">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-cb-foreground truncate flex-1">{seg.label}</span>
              <span className="text-cb-muted font-medium tabular-nums">
                {seg.weight.toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AllocationDonut;
