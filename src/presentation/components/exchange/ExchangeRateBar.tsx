'use client';

import { useEffect } from 'react';
import { RefreshCcw, Clock } from 'lucide-react';
import { usePortfolioStore } from '../../../store/usePortfolioStore';
import { useIndicesStore } from '../../../application/market/useIndicesStore';
import { useLanguageStore } from '../../../application/i18n/useLanguageStore';
import { trackEvent } from '../../../infrastructure/analytics/ga';

const REFRESH_LABEL: Record<string, string> = { ko: '새로고침', en: 'Refresh', ja: '更新' };

/** 지수 행에 노출할 항목 — 코드(하드코딩, FX 아이템과 동일 컨벤션). */
const INDEX_META: { symbol: string; code: string }[] = [
  { symbol: '^IXIC', code: 'NASDAQ' },
  { symbol: '^DJI', code: 'DOW' },
  { symbol: '^KS11', code: 'KOSPI' },
  { symbol: '^KQ11', code: 'KOSDAQ' },
  { symbol: '^N225', code: 'NIKKEI' },
];

function relativeTime(ts: number, lang: string): string {
  const diffMin = Math.floor((Date.now() - ts) / 60_000);
  const h = Math.floor(diffMin / 60);
  if (lang === 'en') {
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    return `${h}h ago`;
  }
  if (lang === 'ja') {
    if (diffMin < 1) return 'たった今';
    if (diffMin < 60) return `${diffMin}分前`;
    return `${h}時間前`;
  }
  if (diffMin < 1) return '방금';
  if (diffMin < 60) return `${diffMin}분 전`;
  return `${h}시간 전`;
}

const formatPrice = (n: number): string =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type Tone = 'up' | 'down' | 'neutral';

/** 방향 색 틴트 칩 — 상승/하락은 은은한 배경, 중립(환율)은 기본 입력색. */
const chipStyle = (tone: Tone): React.CSSProperties => {
  if (tone === 'up')
    return {
      background: 'color-mix(in srgb, var(--cb-positive) 12%, transparent)',
      borderColor: 'color-mix(in srgb, var(--cb-positive) 24%, transparent)',
    };
  if (tone === 'down')
    return {
      background: 'color-mix(in srgb, var(--cb-negative) 12%, transparent)',
      borderColor: 'color-mix(in srgb, var(--cb-negative) 24%, transparent)',
    };
  return { background: 'var(--cb-input-bg)', borderColor: 'var(--cb-border-subtle)' };
};

const Chip = ({ tone, children }: { tone: Tone; children: React.ReactNode }) => (
  <span
    className="inline-flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-lg border"
    style={chipStyle(tone)}
  >
    {children}
  </span>
);

const ExchangeRateBar = () => {
  const { rates, fetchExchangeRate, isLoading, ratesLastFetched } = usePortfolioStore();
  const { indices, fetchIndices, isLoading: indicesLoading } = useIndicesStore();
  const lang = useLanguageStore((s) => s.language);

  const krwRate = rates?.KRW ?? 0;
  const jpyRate = rates?.JPY ?? 0;

  // 마운트 시 1회 + 60s 폴링. 30s TTL 가드로 중복 요청은 store 가 무시.
  useEffect(() => {
    fetchIndices();
    const id = setInterval(() => fetchIndices(), 60_000);
    return () => clearInterval(id);
  }, [fetchIndices]);

  const bySymbol = Object.fromEntries(indices.map((q) => [q.symbol, q]));
  const busy = isLoading || indicesLoading;
  const loadingIndices = indicesLoading && indices.length === 0;

  const refresh = () => {
    // refresh_source — GA4 의 트래픽 소스 측정기준(session source 등)과 이름이 겹치지 않게 접두사를 둔다.
    trackEvent('exchange_rate_refresh', { refresh_source: 'bar' });
    fetchExchangeRate(true);
    fetchIndices(true);
  };

  const fxItems: { code: string; val: string }[] = [
    { code: 'USD', val: '$1.00' },
    { code: 'KRW', val: `₩${formatPrice(krwRate)}` },
    { code: 'JPY', val: `¥${formatPrice(jpyRate)}` },
  ];

  return (
    <div className="sticky top-[52px] z-40 w-full border-b border-[var(--cb-border-subtle)] bg-[color-mix(in_srgb,var(--cb-bg)_94%,transparent)] backdrop-blur-md">
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-6 h-11 flex items-center gap-3">
        <div className="flex items-center gap-2 min-w-0 overflow-x-auto scrollbar-none">
          {/* 지수 (방향 색 칩) */}
          {loadingIndices
            ? INDEX_META.map((meta) => (
                <Chip key={meta.symbol} tone="neutral">
                  <span className="text-[11px] font-bold text-cb-muted">{meta.code}</span>
                  <span className="inline-block w-12 h-3 rounded bg-cb-muted/20 animate-pulse" aria-hidden />
                </Chip>
              ))
            : INDEX_META.map((meta) => {
                const q = bySymbol[meta.symbol];
                if (!q) {
                  return (
                    <Chip key={meta.symbol} tone="neutral">
                      <span className="text-[11px] font-bold text-cb-muted">{meta.code}</span>
                      <span className="text-xs font-mono text-cb-muted/50" />
                    </Chip>
                  );
                }
                const up = q.changePercent >= 0;
                return (
                  <Chip key={meta.symbol} tone={up ? 'up' : 'down'}>
                    <span className="text-[11px] font-bold text-cb-foreground">{meta.code}</span>
                    <span className="text-xs font-bold font-mono text-cb-foreground">
                      {formatPrice(q.price)}
                    </span>
                    <span
                      className={`text-[11px] font-bold font-mono ${up ? 'text-cb-positive' : 'text-cb-negative'}`}
                    >
                      {up ? '▲' : '▼'}
                      {Math.abs(q.changePercent).toFixed(2)}%
                    </span>
                  </Chip>
                );
              })}

          {/* 지수 | 환율 구분 */}
          <div className="w-px h-5 bg-[var(--cb-border-strong)] shrink-0 mx-0.5" />

          {/* 환율 (중립 칩) */}
          {fxItems.map((fx) => (
            <Chip key={fx.code} tone="neutral">
              <span className="text-[11px] font-bold text-cb-muted">{fx.code}</span>
              <span
                className={`text-xs font-bold font-mono ${fx.code === 'USD' ? 'text-cb-accent' : 'text-cb-foreground'}`}
              >
                {fx.val}
              </span>
            </Chip>
          ))}
        </div>

        {/* 갱신 시각 + 새로고침 */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          {ratesLastFetched && (
            <span className="hidden sm:flex items-center gap-1 text-[10px] text-cb-muted/50">
              <Clock className="w-2.5 h-2.5" />
              {relativeTime(ratesLastFetched, lang)}
            </span>
          )}
          <button
            onClick={refresh}
            disabled={busy}
            className="p-1 rounded text-cb-muted hover:text-cb-accent hover:bg-[var(--cb-hover)] transition-colors disabled:opacity-40"
            title={REFRESH_LABEL[lang] ?? REFRESH_LABEL.ko}
          >
            <RefreshCcw className={`w-3 h-3 ${busy ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExchangeRateBar;
