import type { GuruStatStock } from '../../domain/guru/types';
import { formatIssuerName, formatUsd13F } from '../../domain/guru/format';

type Metric = 'holders' | 'value' | 'buyers' | 'sellers';

interface Props {
  title: string;
  desc: string;
  icon: React.ReactNode;
  accent: string; // tailwind text color class for the metric
  stocks: GuruStatStock[];
  metric: Metric;
  unit: string; // 'holders' 등 단위 라벨
}

function metricValue(stock: GuruStatStock, metric: Metric): string {
  switch (metric) {
    case 'holders':
      return String(stock.holderCount);
    case 'buyers':
      return String(stock.buyerCount);
    case 'sellers':
      return String(stock.sellerCount);
    case 'value':
      return formatUsd13F(stock.totalValue);
  }
}

/** metric 기준 막대 길이용 최댓값 */
function metricMax(stocks: GuruStatStock[], metric: Metric): number {
  return stocks.reduce((max, s) => {
    const v =
      metric === 'holders'
        ? s.holderCount
        : metric === 'buyers'
          ? s.buyerCount
          : metric === 'sellers'
            ? s.sellerCount
            : s.totalValue;
    return Math.max(max, v);
  }, 0);
}

function rawMetric(stock: GuruStatStock, metric: Metric): number {
  return metric === 'holders'
    ? stock.holderCount
    : metric === 'buyers'
      ? stock.buyerCount
      : metric === 'sellers'
        ? stock.sellerCount
        : stock.totalValue;
}

const StatRankCard = ({ title, desc, icon, accent, stocks, metric, unit }: Props) => {
  const max = metricMax(stocks, metric);
  const rows = stocks.slice(0, 12);

  return (
    <div className="glass-panel rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className={accent}>{icon}</span>
        <h3 className="text-base font-bold text-cb-foreground">{title}</h3>
      </div>
      <p className="text-xs text-cb-muted mb-4">{desc}</p>

      <ol className="space-y-1.5">
        {rows.map((s, i) => (
          <li key={s.cusip} className="flex items-center gap-3">
            <span className="w-5 text-right text-xs text-cb-muted tabular-nums shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm text-cb-foreground truncate">
                  {s.ticker ?? formatIssuerName(s.nameOfIssuer)}
                </span>
                <span className={`text-sm font-bold tabular-nums shrink-0 ${accent}`}>
                  {metricValue(s, metric)}
                  {metric !== 'value' && <span className="text-cb-muted font-normal text-xs"> {unit}</span>}
                </span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-cb-border/60 overflow-hidden">
                <div
                  className={`h-full rounded-full ${accent}`}
                  style={{
                    width: `${max > 0 ? (rawMetric(s, metric) / max) * 100 : 0}%`,
                    backgroundColor: 'currentColor',
                  }}
                />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default StatRankCard;
