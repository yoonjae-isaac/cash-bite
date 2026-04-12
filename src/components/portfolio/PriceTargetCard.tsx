
import type { PriceTarget } from '../../domain/portfolio/detailTypes';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';

interface Props {
  priceTarget: PriceTarget | null;
  currentPrice: number;
}

const PriceTargetCard = ({ priceTarget, currentPrice }: Props) => {
  const t = useLanguageStore((s) => s.t);

  if (!priceTarget || priceTarget.targetMean === 0) {
    return <p className="text-xs text-cb-muted">{t.portfolio.detail.noData}</p>;
  }

  const upside = currentPrice > 0
    ? ((priceTarget.targetMean - currentPrice) / currentPrice) * 100
    : 0;
  const isPositive = upside >= 0;

  return (
    <div>
      <p className="text-xs font-semibold text-cb-muted uppercase tracking-wider mb-2">
        {t.portfolio.detail.priceTarget}
      </p>
      <p className="text-2xl font-bold font-mono text-cb-foreground">
        ${priceTarget.targetMean.toFixed(2)}
      </p>
      <p className={`text-sm font-semibold mt-1 ${isPositive ? 'text-cb-positive' : 'text-cb-negative'}`}>
        {isPositive ? '+' : ''}{upside.toFixed(1)}% {t.portfolio.detail.upside}
      </p>
      <div className="mt-2 text-[10px] text-cb-muted space-y-0.5">
        <div className="flex justify-between">
          <span>{t.portfolio.detail.currentPrice}</span>
          <span className="font-mono">${currentPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Low — High</span>
          <span className="font-mono">${priceTarget.targetLow.toFixed(0)} — ${priceTarget.targetHigh.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
};

export default PriceTargetCard;
