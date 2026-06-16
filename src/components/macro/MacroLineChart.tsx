import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MacroObservation } from '../../domain/macro/types';
import { formatMacroValue, formatObsDate } from '../../domain/macro/format';

interface Props {
  observations: MacroObservation[];
  frequency: string;
}

const ACCENT = 'var(--cb-accent)';

interface TipProps {
  active?: boolean;
  label?: string | number;
  payload?: Array<{ value?: number }>;
  frequency?: string;
}

/** Recharts 가 active/payload/label 을 주입, frequency 는 element prop 으로 전달 */
const ChartTooltip = ({ active, payload, label, frequency }: TipProps) => {
  if (!active || !payload?.length) {
    return null;
  }
  return (
    <div className="px-2.5 py-1.5 rounded-lg bg-cb-surface border border-cb-border text-xs shadow-lg">
      <span className="block text-cb-muted">{formatObsDate(String(label), frequency ?? '')}</span>
      <span className="block font-bold text-cb-foreground tabular-nums">
        {formatMacroValue(Number(payload[0].value))}
      </span>
    </div>
  );
};

/** Recharts AreaChart — 모노 테마 토큰 적용, 단일 시계열 라인 */
const MacroLineChart = ({ observations, frequency }: Props) => {
  const data = observations.filter((o) => o.value !== null);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="macroArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity={0.18} />
            <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--cb-border-subtle)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(d: string) => formatObsDate(d, frequency)}
          tick={{ fontSize: 11, fill: 'var(--cb-muted)' }}
          axisLine={false}
          tickLine={false}
          minTickGap={56}
        />
        <YAxis
          tickFormatter={(v: number) => formatMacroValue(v)}
          tick={{ fontSize: 11, fill: 'var(--cb-muted)' }}
          axisLine={false}
          tickLine={false}
          width={56}
          domain={[(min: number) => min * 0.98, (max: number) => max * 1.02]}
        />
        <Tooltip
          content={<ChartTooltip frequency={frequency} />}
          cursor={{ stroke: 'var(--cb-muted)', strokeDasharray: '3 3' }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={ACCENT}
          strokeWidth={2}
          fill="url(#macroArea)"
          baseValue="dataMin"
          isAnimationActive={false}
          dot={false}
          activeDot={{ r: 3.5, fill: ACCENT, stroke: 'none' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default MacroLineChart;
