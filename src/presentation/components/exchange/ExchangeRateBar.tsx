import { TrendingUp, RefreshCcw, Clock } from 'lucide-react';
import { usePortfolioStore } from '../../../store/usePortfolioStore';

function relativeTime(ts: number): string {
  const diffMs = Date.now() - ts;
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return '방금';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  return `${diffHour}시간 전`;
}

const ExchangeRateBar = () => {
  const { rates, fetchExchangeRate, isLoading, ratesLastFetched } = usePortfolioStore();

  const krwRate = rates?.KRW ?? 0;
  const jpyRate = rates?.JPY ?? 0;

  return (
    <div className="sticky top-[52px] z-40 w-full border-b border-[var(--cb-border-subtle)] bg-[color-mix(in_srgb,var(--cb-bg)_94%,transparent)] backdrop-blur-md">
      <div className="container mx-auto max-w-7xl px-4 h-10 flex items-center gap-4">

        {/* Label */}
        <span className="flex items-center gap-1.5 shrink-0 text-[11px] font-bold text-cb-muted uppercase tracking-wider">
          <TrendingUp className="w-3 h-3 text-cb-accent" />
          FX
        </span>

        <div className="w-px h-4 bg-[var(--cb-border-strong)] shrink-0" />

        {/* Rate items */}
        <div className="flex items-center gap-4 min-w-0 overflow-x-auto scrollbar-none">
          <span className="flex items-center gap-1.5 shrink-0">
            <span className="text-sm">🇺🇸</span>
            <span className="text-xs font-semibold text-cb-muted">USD</span>
            <span className="text-sm font-bold font-mono text-cb-accent">$1.00</span>
          </span>

          <div className="w-px h-4 bg-[var(--cb-border-subtle)] shrink-0" />

          <span className="flex items-center gap-1.5 shrink-0">
            <span className="text-sm">🇰🇷</span>
            <span className="text-xs font-semibold text-cb-muted">KRW</span>
            <span className="text-sm font-bold font-mono text-cb-foreground">
              ₩{krwRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </span>

          <div className="w-px h-4 bg-[var(--cb-border-subtle)] shrink-0" />

          <span className="flex items-center gap-1.5 shrink-0">
            <span className="text-sm">🇯🇵</span>
            <span className="text-xs font-semibold text-cb-muted">JPY</span>
            <span className="text-sm font-bold font-mono text-cb-foreground">
              ¥{jpyRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </span>
        </div>

        {/* Right: time + refresh */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          {ratesLastFetched && (
            <span className="hidden sm:flex items-center gap-1 text-[10px] text-cb-muted/50">
              <Clock className="w-2.5 h-2.5" />
              {relativeTime(ratesLastFetched)}
            </span>
          )}
          <button
            onClick={() => fetchExchangeRate(true)}
            disabled={isLoading}
            className="p-1 rounded text-cb-muted hover:text-cb-accent hover:bg-[var(--cb-hover)] transition-colors disabled:opacity-40"
            title="새로고침"
          >
            <RefreshCcw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExchangeRateBar;
