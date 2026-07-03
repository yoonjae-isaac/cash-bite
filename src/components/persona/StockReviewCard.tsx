import { useEffect, useState } from 'react';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { fetchFinancials, fetchTechnical } from '../../infrastructure/api/marketClient';
import type { EvalPosition, HoldingReview } from '../../domain/persona/types';
import type { Financials, TechnicalResult, Trend } from '../../domain/market/types';

const fmtPct = (n: number): string => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

type Tone = 'pos' | 'neg' | 'neu' | 'warn';
interface ChipData {
  k: string;
  v: string;
  tone: Tone;
}

const toneColor = (tone: Tone): string | undefined => {
  if (tone === 'pos') return 'var(--cb-positive)';
  if (tone === 'neg') return 'var(--cb-negative)';
  if (tone === 'warn') return 'var(--cb-ma60)';
  return undefined;
};

/** 보유 종목 한 개 리뷰 — 지표 칩(기술/펀더멘탈) + 거장 코멘트 + 13F 겹침. */
const StockReviewCard = ({
  position,
  weight,
  review,
}: {
  position: EvalPosition;
  weight: number | null;
  review?: HoldingReview;
}) => {
  const t = useLanguageStore((s) => s.t);
  const tech = t.stock.tech;
  const p = t.persona;

  const [data, setData] = useState<{ fin: Financials | null; tech: TechnicalResult | null } | null>(
    null,
  );

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetchFinancials(position.ticker, 'annual').catch(() => null),
      fetchTechnical(position.ticker, '1Y').catch(() => null),
    ]).then(([fin, tr]) => {
      if (alive) setData({ fin, tech: tr });
    });
    return () => {
      alive = false;
    };
  }, [position.ticker]);

  const trendText = (tr: Trend): string =>
    tr === 'up' ? tech.trendUp : tr === 'down' ? tech.trendDown : tech.trendFlat;
  const trendTone = (tr: Trend): Tone => (tr === 'up' ? 'pos' : tr === 'down' ? 'neg' : 'neu');

  const chips: ChipData[] = [];
  if (data?.tech) {
    const s = data.tech.signals;
    chips.push({ k: p.chipTrendLong, v: trendText(s.trendLong), tone: trendTone(s.trendLong) });
    chips.push({ k: p.chipTrendShort, v: trendText(s.trendShort), tone: trendTone(s.trendShort) });
    if (s.rsi != null) {
      const tone: Tone = s.rsiState === 'overbought' ? 'neg' : s.rsiState === 'oversold' ? 'pos' : 'neu';
      chips.push({ k: 'RSI', v: String(Math.round(s.rsi)), tone });
    }
    const last = data.tech.series[data.tech.series.length - 1];
    if (last?.ma20 != null && last.ma20 !== 0) {
      chips.push({ k: p.chipDisparity, v: ((last.close / last.ma20) * 100).toFixed(0), tone: 'neu' });
    }
  }
  const per = data?.fin?.valuation.per;
  if (per != null) {
    chips.push({ k: 'PER', v: String(Math.round(per * 10) / 10), tone: per >= 30 ? 'warn' : 'neu' });
  }

  const ret =
    position.avgPrice > 0 ? ((position.currentPrice - position.avgPrice) / position.avgPrice) * 100 : 0;

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-cb-border">
        <div className="min-w-0">
          <span className="text-sm font-bold text-cb-foreground">{position.name}</span>
          <span className="ml-2 text-xs text-cb-muted tabular-nums">{position.ticker}</span>
        </div>
        <div className="text-right shrink-0">
          <span className={`text-sm font-extrabold tabular-nums ${ret >= 0 ? 'text-cb-positive' : 'text-cb-negative'}`}>
            {fmtPct(ret)}
          </span>
          {weight != null && (
            <span className="block text-[11px] text-cb-muted tabular-nums">
              {p.colWeight} {weight}%
            </span>
          )}
        </div>
      </div>

      {/* 지표 칩 */}
      <div className="px-4 pt-3">
        <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--cb-ma5)' }}>
          {p.indicatorsTitle}
        </p>
        {data == null ? (
          <div className="flex gap-2">
            {[64, 76, 52].map((w) => (
              <span key={w} className="h-6 rounded-lg bg-[var(--cb-hover)] animate-pulse" style={{ width: w }} />
            ))}
          </div>
        ) : chips.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <span
                key={c.k}
                className="inline-flex items-center gap-1.5 rounded-lg border border-cb-border bg-cb-surface px-2.5 py-1 text-xs tabular-nums"
              >
                <span className="text-cb-muted">{c.k}</span>
                <b className="text-cb-foreground" style={{ color: toneColor(c.tone) }}>
                  {c.v}
                </b>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-cb-muted">{p.noIndicators}</p>
        )}
      </div>

      {/* 거장 코멘트 */}
      {review?.note && (
        <div className="px-4 pt-3.5 pb-4">
          <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--cb-point)' }}>
            {p.guruNoteTitle}
          </p>
          <p className="text-[13px] text-cb-foreground leading-relaxed">{review.note}</p>
          {review.overlap.held && (
            <span
              className="inline-flex items-center gap-1.5 mt-2.5 rounded-lg px-2.5 py-1 text-[11px] font-bold"
              style={{ color: 'var(--cb-point)', background: 'color-mix(in srgb, var(--cb-point) 14%, transparent)' }}
            >
              {p.overlapHeld}
              {review.overlap.reportDate ? ` (${review.overlap.reportDate})` : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StockReviewCard;
