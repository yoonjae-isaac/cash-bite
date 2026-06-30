import { Fragment, useEffect } from 'react';
import { TrendingUp, BarChart3, RefreshCcw, Clock } from 'lucide-react';
import { usePortfolioStore } from '../../../store/usePortfolioStore';
import { useIndicesStore } from '../../../application/market/useIndicesStore';
import { trackEvent } from '../../../infrastructure/analytics/ga';

/** 지수 행에 노출할 항목 — 코드(통화코드처럼 하드코딩, FX 아이템과 동일 컨벤션). */
const INDEX_META: { symbol: string; code: string }[] = [
  { symbol: '^IXIC', code: 'NASDAQ' },
  { symbol: '^DJI', code: 'DOW' },
  { symbol: '^KS11', code: 'KOSPI' },
  { symbol: '^KQ11', code: 'KOSDAQ' },
  { symbol: '^N225', code: 'NIKKEI' },
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
  const loadingIndices = indicesLoading && indices.length === 0; // 최초 로딩(데이터 없음+요청중)

  const refresh = () => {
    trackEvent('exchange_rate_refresh', { source: 'bar' });
    fetchExchangeRate(true);
    fetchIndices(true);
  };

  return (
    <div className="sticky top-[52px] z-40 w-full border-b border-[var(--cb-border-subtle)] bg-[color-mix(in_srgb,var(--cb-bg)_94%,transparent)] backdrop-blur-md">
      {/* Row 1: 지수 (IDX) */}
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-6 h-10 flex items-center gap-4 border-b border-[var(--cb-border-subtle)]">
        <span className="flex items-center gap-1.5 shrink-0 text-[11px] font-bold text-cb-muted uppercase tracking-wider">
          <BarChart3 className="w-3 h-3 text-cb-accent" />
          IDX
        </span>
        <div className="w-px h-4 bg-[var(--cb-border-strong)] shrink-0" />

        <div className="flex items-center gap-4 min-w-0 overflow-x-auto scrollbar-none">
          {INDEX_META.map((meta, i) => {
            const q = bySymbol[meta.symbol];
            const up = (q?.changePercent ?? 0) >= 0;
            return (
              <Fragment key={meta.symbol}>
                {i > 0 && <div className="w-px h-4 bg-[var(--cb-border-subtle)] shrink-0" />}
                <span className="flex items-center gap-1.5 shrink-0">
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
                  ) : loadingIndices ? (
                    <span className="inline-block w-12 h-3 rounded bg-cb-muted/20 animate-pulse" aria-hidden />
                  ) : (
                    <span className="text-sm font-mono text-cb-muted/50">—</span>
                  )}
                </span>
              </Fragment>
            );
          })}
        </div>

        {/* 새로고침 (환율·지수 동시 갱신) */}
        <div className="flex items-center ml-auto shrink-0">
          <button
            onClick={refresh}
            disabled={busy}
            className="p-1 rounded text-cb-muted hover:text-cb-accent hover:bg-[var(--cb-hover)] transition-colors disabled:opacity-40"
            title="새로고침"
          >
            <RefreshCcw className={`w-3 h-3 ${busy ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Row 2: 환율 (FX) */}
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-6 h-10 flex items-center gap-4">
        <span className="flex items-center gap-1.5 shrink-0 text-[11px] font-bold text-cb-muted uppercase tracking-wider">
          <TrendingUp className="w-3 h-3 text-cb-accent" />
          FX
        </span>
        <div className="w-px h-4 bg-[var(--cb-border-strong)] shrink-0" />

        <div className="flex items-center gap-4 min-w-0 overflow-x-auto scrollbar-none">
          <span className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-semibold text-cb-muted">USD</span>
            <span className="text-sm font-bold font-mono text-cb-accent">$1.00</span>
          </span>

          <div className="w-px h-4 bg-[var(--cb-border-subtle)] shrink-0" />

          <span className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-semibold text-cb-muted">KRW</span>
            <span className="text-sm font-bold font-mono text-cb-foreground">
              ₩{krwRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </span>

          <div className="w-px h-4 bg-[var(--cb-border-subtle)] shrink-0" />

          <span className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-semibold text-cb-muted">JPY</span>
            <span className="text-sm font-bold font-mono text-cb-foreground">
              ¥{jpyRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </span>
        </div>

        {/* 갱신 시각 (환율 기준) */}
        <div className="flex items-center ml-auto shrink-0">
          {ratesLastFetched && (
            <span className="hidden sm:flex items-center gap-1 text-[10px] text-cb-muted/50">
              <Clock className="w-2.5 h-2.5" />
              {relativeTime(ratesLastFetched)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExchangeRateBar;
