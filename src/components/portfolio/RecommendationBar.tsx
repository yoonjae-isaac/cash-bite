
import type { RecommendationTrend } from '../../domain/portfolio/detailTypes';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';

interface Props {
  recommendation: RecommendationTrend | null;
}

const RecommendationBar = ({ recommendation }: Props) => {
  const t = useLanguageStore((s) => s.t);

  if (!recommendation) {
    return <p className="text-xs text-cb-muted">{t.portfolio.detail.noData}</p>;
  }

  const { strongBuy, buy, hold, sell, strongSell } = recommendation;
  const total = strongBuy + buy + hold + sell + strongSell;

  if (total === 0) {
    return <p className="text-xs text-cb-muted">{t.portfolio.detail.noData}</p>;
  }

  const pct = (n: number) => Math.round((n / total) * 100);

  const bullish = pct(strongBuy + buy);
  const neutral = pct(hold);
  const bearish = pct(sell + strongSell);

  const dominant =
    strongBuy + buy > sell + strongSell + hold
      ? { label: t.portfolio.detail.buy, color: 'text-cb-positive' }
      : sell + strongSell > strongBuy + buy + hold
      ? { label: t.portfolio.detail.sell, color: 'text-cb-negative' }
      : { label: t.portfolio.detail.hold, color: 'text-amber-400' };

  return (
    <div>
      <p className="text-xs font-semibold text-cb-muted uppercase tracking-wider mb-2">
        {t.portfolio.detail.recommendation}
      </p>
      <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-3">
        {bullish > 0 && (
          <div
            className="bg-cb-positive/80 rounded-l-full"
            style={{ width: `${bullish}%` }}
            title={`${t.portfolio.detail.buy} ${bullish}%`}
          />
        )}
        {neutral > 0 && (
          <div
            className="bg-amber-400/70"
            style={{ width: `${neutral}%` }}
            title={`${t.portfolio.detail.hold} ${neutral}%`}
          />
        )}
        {bearish > 0 && (
          <div
            className="bg-cb-negative/70 rounded-r-full"
            style={{ width: `${bearish}%` }}
            title={`${t.portfolio.detail.sell} ${bearish}%`}
          />
        )}
      </div>
      <div className="flex gap-3 text-[10px] text-cb-muted flex-wrap">
        <span className="text-cb-positive font-medium">{t.portfolio.detail.strongBuy} {strongBuy}</span>
        <span className="text-cb-positive/70">{t.portfolio.detail.buy} {buy}</span>
        <span className="text-amber-400">{t.portfolio.detail.hold} {hold}</span>
        <span className="text-cb-negative/70">{t.portfolio.detail.sell} {sell}</span>
        <span className="text-cb-negative font-medium">{t.portfolio.detail.strongSell} {strongSell}</span>
      </div>
      <p className={`text-sm font-bold mt-2 ${dominant.color}`}>{dominant.label}</p>
    </div>
  );
};

export default RecommendationBar;
