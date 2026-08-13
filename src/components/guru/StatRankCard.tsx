'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { GuruStatStock, GuruStatHolder } from '../../domain/guru/types';
import { formatIssuerName, formatUsd13F } from '../../domain/guru/format';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import TickerLogo from '../ui/TickerLogo';

type Metric = 'holders' | 'value' | 'buyers' | 'sellers';

interface Props {
  title: string;
  desc: string;
  icon: React.ReactNode;
  accent: string; // tailwind text color class for the metric
  stocks: GuruStatStock[];
  metric: Metric;
  unit: string; // 'holders' 등 단위 라벨
  logos?: Record<string, string>; // 티커 → 로고 URL (없으면 이니셜 배지)
}

interface Coords {
  top: number;
  left: number;
  place: 'above' | 'below';
  tail: number; // 꼬리 x 오프셋(px, 말풍선 좌측 기준)
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
  return stocks.reduce((max, s) => Math.max(max, rawMetric(s, metric)), 0);
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

/** 카드 metric 에 맞는 거장 상세 부분집합 (value 내림차순은 백엔드 보장). */
function holdersFor(stock: GuruStatStock, metric: Metric): GuruStatHolder[] {
  const hs = stock.holders ?? [];
  if (metric === 'buyers') return hs.filter((h) => h.change === 'new' || h.change === 'increased');
  if (metric === 'sellers') return hs.filter((h) => h.change === 'decreased' || h.change === 'exit');
  return hs.filter((h) => h.change !== 'exit'); // holders · value
}

const StatRankCard = ({ title, desc, icon, accent, stocks, metric, unit, logos }: Props) => {
  const t = useLanguageStore((s) => s.t);
  const max = metricMax(stocks, metric);
  const rows = stocks.slice(0, 12);

  const [tip, setTip] = useState<{ stock: GuruStatStock; rect: DOMRect } | null>(null);
  const [coords, setCoords] = useState<Coords | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  // 말풍선 렌더 후 실제 높이를 측정해 위/아래 배치·좌우 클램프 계산.
  useEffect(() => {
    if (!tip || !tipRef.current) {
      setCoords(null);
      return;
    }
    const r = tip.rect;
    const tr = tipRef.current.getBoundingClientRect();
    const gap = 10;
    let top: number;
    let place: 'above' | 'below';
    if (r.bottom + gap + tr.height <= window.innerHeight) {
      top = r.bottom + gap;
      place = 'below';
    } else if (r.top - gap - tr.height >= 0) {
      top = r.top - gap - tr.height;
      place = 'above';
    } else {
      top = r.bottom + gap;
      place = 'below';
    }
    let left = r.left + r.width / 2 - tr.width / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - tr.width - 8));
    setCoords({ top, left, place, tail: r.left + r.width / 2 - left });
  }, [tip]);

  const open = (el: HTMLElement, stock: GuruStatStock) =>
    setTip({ stock, rect: el.getBoundingClientRect() });
  const close = () => setTip(null);

  // 말풍선이 열린 동안 스크롤/리사이즈되면 앵커와 어긋나므로 닫는다(모바일 페이지 스크롤 포함).
  // capture=true 로 중첩 스크롤 컨테이너도 감지.
  useEffect(() => {
    if (!tip) return;
    const dismiss = () => setTip(null);
    window.addEventListener('scroll', dismiss, true);
    window.addEventListener('resize', dismiss);
    return () => {
      window.removeEventListener('scroll', dismiss, true);
      window.removeEventListener('resize', dismiss);
    };
  }, [tip]);

  const badgeFor = (change: GuruStatHolder['change']): { label: string; cls: string } | null => {
    switch (change) {
      case 'new':
        return { label: t.gurus.changeNew, cls: 'text-cb-positive bg-cb-positive/15' };
      case 'increased':
        return { label: t.gurus.changeIncreased, cls: 'text-cb-positive bg-cb-positive/15' };
      case 'decreased':
        return { label: t.gurus.changeDecreased, cls: 'text-cb-negative bg-cb-negative/15' };
      case 'exit':
        return { label: t.gurus.changesExited, cls: 'text-cb-negative bg-cb-negative/15' };
      default:
        return null;
    }
  };

  const renderTip = (stock: GuruStatStock) => {
    const list = holdersFor(stock, metric);
    const headTitle =
      metric === 'value'
        ? t.gurus.tipWeight
        : metric === 'buyers'
          ? t.gurus.tipBuyers
          : metric === 'sellers'
            ? t.gurus.tipSellers
            : t.gurus.tipHolders;
    const headMeta =
      metric === 'value'
        ? `${stock.ticker ?? ''} ${formatUsd13F(stock.totalValue)}`.trim()
        : String(list.length);

    return (
      <>
        <div className="flex items-center gap-2 pb-2.5 mb-2.5 border-b border-cb-border text-xs font-bold">
          <span className={`w-2 h-2 rounded-full shrink-0 ${accent}`} style={{ backgroundColor: 'currentColor' }} />
          <span>{headTitle}</span>
          <span className="text-cb-muted font-medium truncate">· {headMeta}</span>
        </div>
        {list.length === 0 ? (
          <p className="text-xs text-cb-muted py-1">{t.gurus.tipEmpty}</p>
        ) : (
          <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto">
            {metric === 'value'
              ? list.map((g, i) => {
                  const pct = stock.totalValue > 0 ? (g.value / stock.totalValue) * 100 : 0;
                  return (
                    <div key={`${g.name}-${i}`} className="flex flex-col gap-0.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[13px] truncate">{g.name}</span>
                        <span className="text-xs font-bold tabular-nums shrink-0">{pct.toFixed(1)}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-cb-border overflow-hidden">
                        <div
                          className={accent}
                          style={{ width: `${pct}%`, height: '100%', backgroundColor: 'currentColor' }}
                        />
                      </div>
                      <span className="text-[11px] text-cb-muted tabular-nums">{formatUsd13F(g.value)}</span>
                    </div>
                  );
                })
              : list.map((g, i) => {
                  const badge = badgeFor(g.change);
                  return (
                    <div key={`${g.name}-${i}`} className="flex items-center gap-2">
                      <span className="flex-1 min-w-0 text-[13px] truncate">{g.name}</span>
                      {badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-px rounded shrink-0 ${badge.cls}`}>
                          {badge.label}
                        </span>
                      )}
                      {g.value > 0 && (
                        <span className="text-xs text-cb-muted tabular-nums shrink-0">{formatUsd13F(g.value)}</span>
                      )}
                    </div>
                  );
                })}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="glass-panel rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className={accent}>{icon}</span>
        <h3 className="text-base font-bold text-cb-foreground">{title}</h3>
      </div>
      <p className="text-xs text-cb-muted mb-4">{desc}</p>

      <ol className="space-y-1.5">
        {rows.map((s, i) => (
          <li key={s.cusip} className="flex items-center gap-2.5">
            <span className="w-4 text-right text-xs text-cb-muted tabular-nums shrink-0">{i + 1}</span>
            <TickerLogo symbol={s.ticker ?? s.nameOfIssuer} src={s.ticker ? logos?.[s.ticker] : undefined} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm text-cb-foreground truncate">
                  {s.ticker ?? formatIssuerName(s.nameOfIssuer)}
                </span>
                <span className="flex items-baseline gap-1 shrink-0">
                  <button
                    type="button"
                    className={`text-sm font-bold tabular-nums rounded px-1.5 -mx-1.5 cursor-help underline decoration-dotted decoration-cb-border underline-offset-4 transition-colors hover:bg-cb-border/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cb-accent ${accent}`}
                    onMouseEnter={(e) => open(e.currentTarget, s)}
                    onMouseLeave={close}
                    onFocus={(e) => open(e.currentTarget, s)}
                    onBlur={close}
                    aria-label={`${s.ticker ?? formatIssuerName(s.nameOfIssuer)} ${title}`}
                  >
                    {metricValue(s, metric)}
                    {metric !== 'value' && <span className="text-cb-muted font-normal text-xs"> {unit}</span>}
                  </button>
                  {/* 보유 거장 수 카드에서만 직전 분기 대비 증감을 노출 (매수·매도 카드는 이미 변화량 자체) */}
                  {metric === 'holders' && s.holderDelta !== undefined && (
                    <span
                      title={t.gurus.deltaHint}
                      className={`text-[11px] font-bold tabular-nums ${
                        s.holderDelta > 0 ? 'text-cb-positive' : 'text-cb-negative'
                      }`}
                    >
                      {s.holderDelta > 0 ? `↑${s.holderDelta}` : `↓${Math.abs(s.holderDelta)}`}
                    </span>
                  )}
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

      {tip &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={tipRef}
            role="tooltip"
            className="fixed z-[100] w-[272px] rounded-2xl border border-cb-border bg-cb-surface p-3.5 shadow-2xl pointer-events-none"
            style={{
              top: coords?.top ?? -9999,
              left: coords?.left ?? -9999,
              visibility: coords ? 'visible' : 'hidden',
            }}
          >
            {renderTip(tip.stock)}
            {coords && (
              <span
                className="absolute w-3 h-3 rotate-45 bg-cb-surface border-cb-border"
                style={{
                  left: coords.tail - 6,
                  ...(coords.place === 'below'
                    ? { top: -7, borderLeftWidth: 1, borderTopWidth: 1 }
                    : { bottom: -7, borderRightWidth: 1, borderBottomWidth: 1 }),
                }}
              />
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default StatRankCard;
