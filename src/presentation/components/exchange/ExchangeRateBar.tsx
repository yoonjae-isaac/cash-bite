import { Fragment, useEffect } from 'react';
import { TrendingUp, BarChart3, RefreshCcw, Clock } from 'lucide-react';
import { usePortfolioStore } from '../../../store/usePortfolioStore';
import { useIndicesStore } from '../../../application/market/useIndicesStore';
import { trackEvent } from '../../../infrastructure/analytics/ga';

/** 환율 바에 노출할 지수 — 표시 순서 + 국기/코드(통화코드처럼 하드코딩, FX 아이템과 동일 컨벤션). */
const INDEX_META: { symbol: string; flag: string; code: string }[] = [
  { symbol: '^IXIC', flag: '🇺🇸', code: 'NASDAQ' },
  { symbol: '^DJI', flag: '🇺🇸', code: 'DOW' },
  { symbol: '^KS11', flag: '🇰🇷', code: 'KOSPI' },
  { symbol: '^KQ11', flag: '🇰🇷', code: 'KOSDAQ' },
  { symbol: '^N225', flag: '🇯🇵', code: 'NIKKEI' },
];

function relativeTime(ts: number): string {
  const diffMs = Date.now() - ts;
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return '방금';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  return `${diffHour}시간 전`;
}

const formatPrice = (n: number): string =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ExchangeRateBar = () => {
  const { rates, fetchExchangeRate, isLoading, ratesLastFetched } = usePortfolioStore();
  const { indices, fetchIndices, isLoading: indicesLoading } = useIndicesStore();

  const krwRate = rates?.KRW ?? 0;
  const jpyRate = rates?.JPY ?? 0;

  // 마운트 시 1회 + 60s 폴링 (장중 시세 갱신). 30s TTL 가드로 중복 요청은 store 가 무시.
  useEffect(() => {
    fetchIndices();
    const id = setInterval(() => fetchIndices(), 60_000);
    return () => clearInterval(id);
  }, [fetchIndices]);

  const bySymbol = Object.fromEntries(indices.map((q) => [q.symbol, q]));
  const busy = isLoading || indicesLoading;

  return (
    <div className="sticky top-[52px] z-40 w-full border-b border-[var(--cb-border-subtle)] bg-[color-mix(in_srgb,var(--cb-bg)_94%,transparent)] backdrop-blur-md">
      <div className="w-full px-4 md:px-6 h-10 flex items-center gap-4">

        {/* Label */}
        <span className="flex items-center gap-1.5 shrink-0 text-[11px] font-bold text-cb-muted uppercase tracking-wider">
          <TrendingUp className="w-3 h-3 text-cb-accent" />
          FX
        </span>

        <div className="w-px h-4 bg-[var(--cb-border-strong)] shrink-0" />

        {/* Rate + index items (한 줄, 모바일 가로 스크롤) */}
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

          {/* Indices */}
          <div className="w-px h-4 bg-[var(--cb-border-strong)] shrink-0" />
          <span className="flex items-center gap-1.5 shrink-0 text-[11px] font-bold text-cb-muted uppercase tracking-wider">
            <BarChart3 className="w-3 h-3 text-cb-accent" />
            IDX
          </span>

          {INDEX_META.map((meta) => {
            const q = bySymbol[meta.symbol];
            const up = (q?.changePercent ?? 0) >= 0;
            return (
              <Fragment key={meta.symbol}>
                <div className="w-px h-4 bg-[var(--cb-border-subtle)] shrink-0" />
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="text-sm">{meta.flag}</span>
                  <span className="text-xs font-semibold text-cb-muted">{meta.code}</span>
                  {q ? (
                    <>
                      <span className="text-sm font-bold font-mono text-cb-foreground">
                        {formatPrice(q.price)}
                      </span>
                      <span
                        className={`text-xs font-semibold font-mono ${up ? 'text-cb-positive' : 'text-cb-negative'}`}
                      >
                        {up ? '+' : ''}
                        {q.changePercent.toFixed(2)}%
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-mono text-cb-muted/50">—</span>
                  )}
                </span>
              </Fragment>
            );
          })}
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
            onClick={() => {
              trackEvent('exchange_rate_refresh', { source: 'bar' });
              fetchExchangeRate(true);
              fetchIndices(true);
            }}
            disabled={busy}
            className="p-1 rounded text-cb-muted hover:text-cb-accent hover:bg-[var(--cb-hover)] transition-colors disabled:opacity-40"
            title="새로고침"
          >
            <RefreshCcw className={`w-3 h-3 ${busy ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExchangeRateBar;
