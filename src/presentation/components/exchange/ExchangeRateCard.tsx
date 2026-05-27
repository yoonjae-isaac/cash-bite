import { TrendingUp, RefreshCcw, Clock } from 'lucide-react';
import { usePortfolioStore } from '../../../store/usePortfolioStore';
import CurrencySelector from '../../../shared/components/CurrencySelector';
import { trackEvent } from '../../../infrastructure/analytics/ga';

const rateRowClass =
  'flex items-center justify-between p-2.5 rounded-lg theme-row';

function relativeTime(ts: number): string {
  const diffMs = Date.now() - ts;
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return '방금';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  return `${diffHour}시간 전`;
}

const ExchangeRateCard = () => {
  const { rates, fetchExchangeRate, isLoading, ratesLastFetched } = usePortfolioStore();

  const krwRate = rates?.KRW ?? 0;
  const jpyRate = rates?.JPY ?? 0;
  const jpyToKrw100 = jpyRate > 0 ? (krwRate / jpyRate) * 100 : 0;

  return (
    <div className="glass-panel p-5 flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-cb-foreground flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-cb-accent" />
          실시간 환율
        </h3>
        <button
          onClick={() => {
            trackEvent('exchange_rate_refresh', { source: 'card' });
            fetchExchangeRate(true);
          }}
          disabled={isLoading}
          className="p-1.5 rounded-lg text-cb-muted hover:text-cb-accent hover:bg-[var(--cb-hover)] transition-all disabled:opacity-50"
          title="새로고침"
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Currency selector */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-cb-muted mb-2">
          기준 통화
        </p>
        <CurrencySelector />
      </div>

      {/* Rate rows */}
      <div className="flex flex-col gap-1.5">
        <div className={rateRowClass}>
          <div className="flex items-center gap-2">
            <span className="text-base">🇺🇸</span>
            <span className="text-xs font-bold text-cb-muted uppercase">USD</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-cb-foreground font-mono">$ 1.00</div>
            <div className="text-[10px] text-cb-accent font-bold uppercase">Base</div>
          </div>
        </div>

        <div className={rateRowClass}>
          <div className="flex items-center gap-2">
            <span className="text-base">🇰🇷</span>
            <span className="text-xs font-bold text-cb-muted uppercase">KRW</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-cb-foreground font-mono">
              ₩{' '}
              {krwRate.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>

        <div className={rateRowClass}>
          <div className="flex items-center gap-2">
            <span className="text-base">🇯🇵</span>
            <span className="text-xs font-bold text-cb-muted uppercase">JPY</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-cb-foreground font-mono">
              ¥{' '}
              {jpyRate.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            {jpyToKrw100 > 0 && (
              <div className="text-[10px] text-cb-muted font-medium">
                ≈ ₩{jpyToKrw100.toFixed(2)} / 100¥
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Last fetched time */}
      {ratesLastFetched ? (
        <div className="flex items-center gap-1.5 text-[10px] text-cb-muted/70 pt-1 border-t border-cb-border">
          <Clock className="w-3 h-3 shrink-0" />
          <span>{relativeTime(ratesLastFetched)} 갱신 · 하나은행 기준</span>
        </div>
      ) : (
        <div className="text-[10px] text-cb-muted/50 pt-1 border-t border-cb-border italic">
          하나은행 기준 환율
        </div>
      )}
    </div>
  );
};

export default ExchangeRateCard;
