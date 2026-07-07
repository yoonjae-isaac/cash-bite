import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import type { RateBucket, RateLean, RateOutlook, RateOutlookFactor } from '../../domain/macro/types';
import Skeleton from '../ui/Skeleton';

const signed = (n: number): string => `${n >= 0 ? '+' : ''}${n}`;

/** 금리 방향별로 통상 유리한 자산(favoredBy). 반대 방향에선 통상 불리. */
const ASSETS: { key: string; favoredBy: 'cut' | 'hike' }[] = [
  { key: 'assetGrowth', favoredBy: 'cut' },
  { key: 'assetGold', favoredBy: 'cut' },
  { key: 'assetBonds', favoredBy: 'cut' },
  { key: 'assetReits', favoredBy: 'cut' },
  { key: 'assetEm', favoredBy: 'cut' },
  { key: 'assetSmall', favoredBy: 'cut' },
  { key: 'assetCrypto', favoredBy: 'cut' },
  { key: 'assetDividend', favoredBy: 'cut' },
  { key: 'assetDollar', favoredBy: 'hike' },
  { key: 'assetBanks', favoredBy: 'hike' },
];

/** cut=파랑(완화) / hold=중립 / hike=빨강(긴축) — accent 와 구분되는 방향 색. */
const leanColor = (lean: RateLean): string =>
  lean === 'cut' ? 'var(--cb-point)' : lean === 'hike' ? 'var(--cb-negative)' : 'var(--cb-muted)';

const FACTOR_ORDER: RateOutlookFactor['key'][] = ['inflation', 'employment', 'market', 'curve'];

const RateOutlookCard = ({
  outlook,
  loading,
}: {
  outlook: RateOutlook | null;
  loading: boolean;
}) => {
  const t = useLanguageStore((s) => s.t);
  const m = t.macro;
  const [assetsOpen, setAssetsOpen] = useState(false);

  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    );
  }
  if (!outlook) {
    return (
      <div className="glass-panel rounded-2xl p-5 text-sm text-cb-muted">{m.rateUnavailable}</div>
    );
  }

  const bucketLabel: Record<RateBucket, string> = {
    'cut-strong': m.bucketCutStrong,
    cut: m.bucketCut,
    hold: m.bucketHold,
    hike: m.bucketHike,
    'hike-strong': m.bucketHikeStrong,
  };
  const leanLabel: Record<RateLean, string> = { cut: m.leanCut, hold: m.leanHold, hike: m.leanHike };
  const verdictColor =
    outlook.bucket === 'hold' ? 'var(--cb-foreground)' : leanColor(outlook.bucket.startsWith('cut') ? 'cut' : 'hike');
  const markerPct = Math.max(2, Math.min(98, (outlook.score + 100) / 2));

  const factorMeta: Record<RateOutlookFactor['key'], { label: string; sub: string }> = {
    inflation: { label: m.factorInflation, sub: m.factorInflationSub },
    employment: { label: m.factorEmployment, sub: m.factorEmploymentSub },
    market: { label: m.factorMarket, sub: m.factorMarketSub },
    curve: { label: m.factorCurve, sub: m.factorCurveSub },
  };
  const factorValue = (f: RateOutlookFactor): string => {
    const parts: string[] = [];
    if (f.value != null) {
      parts.push(f.key === 'curve' ? signed(f.value) : `${f.value}%`);
    }
    if (f.trend != null) {
      parts.push(`${m.trendLabel} ${signed(f.trend)}`);
    }
    return parts.join(', ') || '–';
  };

  const ordered = FACTOR_ORDER.map((k) => outlook.factors.find((f) => f.key === k)).filter(
    (f): f is RateOutlookFactor => Boolean(f),
  );
  const counts = { cut: 0, hold: 0, hike: 0 };
  ordered.forEach((f) => (counts[f.lean] += 1));
  const resultNote = m.rateResultTemplate
    .replace('{cut}', String(counts.cut))
    .replace('{hold}', String(counts.hold))
    .replace('{hike}', String(counts.hike))
    .replace('{verdict}', bucketLabel[outlook.bucket]);

  // 금리와 자산 — 종합 방향(bucket)이 인하/인상 쪽이면 그 방향 유리 자산을 강세로.
  const assetLean: 'cut' | 'hold' | 'hike' =
    outlook.bucket === 'hold' ? 'hold' : outlook.bucket.startsWith('cut') ? 'cut' : 'hike';
  const favoredAssets = assetLean === 'hold' ? [] : ASSETS.filter((a) => a.favoredBy === assetLean);
  const pressuredAssets = assetLean === 'hold' ? [] : ASSETS.filter((a) => a.favoredBy !== assetLean);
  const assetName: Record<string, string> = {
    assetGrowth: m.assetGrowth,
    assetBanks: m.assetBanks,
    assetDollar: m.assetDollar,
    assetGold: m.assetGold,
    assetBonds: m.assetBonds,
    assetReits: m.assetReits,
    assetEm: m.assetEm,
    assetSmall: m.assetSmall,
    assetCrypto: m.assetCrypto,
    assetDividend: m.assetDividend,
  };

  return (
    <div className="glass-panel rounded-2xl p-5">
      {/* verdict + context */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="text-[22px] md:text-2xl font-extrabold" style={{ color: verdictColor }}>
            {bucketLabel[outlook.bucket]}
          </span>
          <span
            className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
            style={{
              color: 'var(--cb-ma60)',
              background: 'color-mix(in srgb, var(--cb-ma60) 13%, transparent)',
            }}
          >
            {m.rateChipNotPredict}
          </span>
        </div>
        <div className="flex gap-5">
          <div className="text-right">
            <span className="block text-[11px] text-cb-muted">{m.rateCurrentRate}</span>
            <span className="text-sm font-bold text-cb-foreground tabular-nums">
              {outlook.currentRate != null ? `${outlook.currentRate}%` : '–'}
            </span>
          </div>
          <div className="text-right">
            <span className="block text-[11px] text-cb-muted">{m.rateNextFomc}</span>
            <span className="text-sm font-bold text-cb-foreground tabular-nums">
              {outlook.nextFomc ?? '–'}
            </span>
          </div>
        </div>
      </div>

      {/* gauge */}
      <div className="relative mt-6 mb-1">
        <div
          className="h-3 rounded-full"
          style={{
            background:
              'linear-gradient(90deg, var(--cb-point) 0%, #3a4a6b 32%, var(--cb-muted) 50%, #6b3a44 68%, var(--cb-negative) 100%)',
          }}
        />
        <div
          className="absolute -top-1.5 w-1 h-6 rounded-sm"
          style={{
            left: `${markerPct}%`,
            background: 'var(--cb-foreground)',
            boxShadow: '0 0 0 3px var(--cb-bg)',
          }}
        />
        <div className="flex justify-between mt-2.5 text-[11px]">
          <b style={{ color: 'var(--cb-point)' }}>{m.scaleCut}</b>
          <b className="text-cb-muted">{m.scaleHold}</b>
          <b style={{ color: 'var(--cb-negative)' }}>{m.scaleHike}</b>
        </div>
      </div>

      {/* 산출 원리 */}
      <div className="mt-5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-cb-muted mb-2.5">
          {m.ratePrincipleTitle}
        </p>
        <div className="flex flex-col gap-2">
          {ordered.map((f) => (
            <div
              key={f.key}
              className="flex items-center justify-between gap-3 py-2 border-t border-cb-border/60 first:border-t-0"
            >
              <div className="min-w-0">
                <span className="text-[13px] font-bold text-cb-foreground">
                  {factorMeta[f.key].label}
                </span>
                <span className="ml-1.5 text-[11px] text-cb-muted">{factorMeta[f.key].sub}</span>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-xs text-cb-muted tabular-nums">{factorValue(f)}</span>
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                  style={{
                    color: leanColor(f.lean),
                    background: `color-mix(in srgb, ${leanColor(f.lean)} 14%, transparent)`,
                  }}
                >
                  {leanLabel[f.lean]}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3.5 rounded-xl bg-[var(--cb-input-bg)] border border-cb-border p-3.5 space-y-2">
          <p className="text-[13px] text-cb-foreground font-semibold">{resultNote}</p>
          <p className="text-xs text-cb-muted leading-relaxed">{m.ratePrinciple}</p>
        </div>
      </div>

      {/* 금리와 자산 — 현재 방향에서 통상 강세/약세 자산 */}
      <div className="mt-4 pt-4 border-t border-cb-border">
        <button
          type="button"
          onClick={() => setAssetsOpen((o) => !o)}
          aria-expanded={assetsOpen}
          className="flex w-full items-center gap-2 text-left"
        >
          <span className="text-[11px] font-bold uppercase tracking-wide text-cb-muted">
            {m.assetTitle}
          </span>
          <span className="text-[11px] text-cb-faint">{m.assetToggle}</span>
          <ChevronDown
            className={`w-4 h-4 text-cb-muted ml-auto transition-transform ${assetsOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {assetsOpen &&
          (assetLean === 'hold' ? (
            <p className="mt-3 text-xs text-cb-muted leading-relaxed">{m.assetHoldNote}</p>
          ) : (
            <div className="mt-3 space-y-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold mr-1" style={{ color: 'var(--cb-positive)' }}>
                  {m.assetFavored} ↑
                </span>
                {favoredAssets.map((a) => (
                  <span
                    key={a.key}
                    className="text-[11.5px] font-semibold px-2 py-0.5 rounded-md"
                    style={{
                      color: 'var(--cb-positive)',
                      background: 'color-mix(in srgb, var(--cb-positive) 12%, transparent)',
                    }}
                  >
                    {assetName[a.key]}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold mr-1" style={{ color: 'var(--cb-negative)' }}>
                  {m.assetPressured} ↓
                </span>
                {pressuredAssets.map((a) => (
                  <span
                    key={a.key}
                    className="text-[11.5px] font-semibold px-2 py-0.5 rounded-md"
                    style={{
                      color: 'var(--cb-negative)',
                      background: 'color-mix(in srgb, var(--cb-negative) 12%, transparent)',
                    }}
                  >
                    {assetName[a.key]}
                  </span>
                ))}
              </div>
            </div>
          ))}
        {assetsOpen && <p className="mt-3 text-[11px] text-cb-faint leading-relaxed">{m.assetCaveat}</p>}
      </div>
    </div>
  );
};

export default RateOutlookCard;
