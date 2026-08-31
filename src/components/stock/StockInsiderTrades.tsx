'use client';

import { useEffect, useState } from 'react';
import { UserRound } from 'lucide-react';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { fetchInsiderBySymbol } from '../../infrastructure/api/insiderClient';
import type { InsiderSymbolSummary } from '../../domain/insider/types';
import Skeleton from '../ui/Skeleton';

const VISIBLE_ROWS = 6;

/** 큰 금액은 $1.2M, 작은 금액은 $340K 로 — 자릿수를 눈으로 바로 비교하기 위해. */
function formatUsd(v: number): string {
  if (v >= 1_000_000) {
    return `$${(v / 1_000_000).toFixed(1)}M`;
  }
  if (v >= 1_000) {
    return `$${Math.round(v / 1_000)}K`;
  }
  return `$${Math.round(v)}`;
}

/**
 * 종목 페이지의 내부자 거래 섹션 (SEC Form 4).
 *
 * 장내 매수는 내부자가 자기 돈을 쓴 것이라 드물고 신호가 크지만, 매도는 스톡옵션 보상 성격이
 * 섞여 일상적이다. 그 차이를 화면에서 밝혀 매도가 많다고 오해하지 않게 한다.
 */
const StockInsiderTrades = ({ ticker }: { ticker: string }) => {
  const t = useLanguageStore((s) => s.t);
  const [data, setData] = useState<InsiderSymbolSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ticker) {
      setData(null);
      return;
    }
    let alive = true;
    setLoading(true);
    fetchInsiderBySymbol(ticker)
      .then((res) => {
        if (alive) setData(res);
      })
      .catch(() => {
        if (alive) setData(null); // 부가 섹션 — 실패 시 조용히 감춘다
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [ticker]);

  if (loading && !data) {
    return <Skeleton className="h-28 rounded-xl" />;
  }
  // 거래가 아예 없으면 섹션을 감춘다 — 국내 종목·신규 상장은 Form 4 자체가 없다.
  if (!data || data.trades.length === 0) {
    return null;
  }

  return (
    <section className="glass-panel rounded-xl p-5">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <UserRound className="h-4 w-4 text-cb-accent" aria-hidden />
        <h3 className="text-base font-bold text-cb-foreground">{t.insider.title}</h3>
        {data.buyCount > 0 && (
          <span className="rounded-full bg-cb-positive/15 px-2 py-0.5 text-[11px] font-bold text-cb-positive">
            {t.insider.buyLabel} {data.buyCount}
          </span>
        )}
        {data.sellCount > 0 && (
          <span className="rounded-full bg-cb-negative/15 px-2 py-0.5 text-[11px] font-bold text-cb-negative">
            {t.insider.sellLabel} {data.sellCount}
          </span>
        )}
      </div>
      <p className="mb-4 text-xs leading-relaxed text-cb-muted">{t.insider.desc}</p>

      <ul className="space-y-1">
        {data.trades.slice(0, VISIBLE_ROWS).map((tr, i) => {
          const buy = tr.code === 'P';
          return (
            <li
              key={`${tr.transactionDate}-${tr.ownerName}-${i}`}
              className="theme-row flex items-center gap-2.5 rounded-lg px-2 py-2"
            >
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  buy
                    ? 'bg-cb-positive/15 text-cb-positive'
                    : 'bg-cb-negative/15 text-cb-negative'
                }`}
              >
                {buy ? t.insider.buyLabel : t.insider.sellLabel}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-cb-foreground">
                  {tr.ownerName}
                </span>
                <span className="block truncate text-[11px] leading-tight text-cb-muted">
                  {tr.role}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-sm font-bold text-cb-foreground tabular-nums">
                  {tr.value !== undefined ? formatUsd(tr.value) : `${tr.shares.toLocaleString()}`}
                </span>
                <span className="block text-[10px] leading-tight text-cb-muted tabular-nums">
                  {tr.transactionDate.slice(5)}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      {data.trades.length > VISIBLE_ROWS && (
        <p className="mt-2 px-2 text-[11px] text-cb-muted">
          {t.insider.moreRows.replace('{n}', String(data.trades.length - VISIBLE_ROWS))}
        </p>
      )}

      <p className="mt-3 border-t border-cb-border pt-3 text-[11px] text-cb-muted">
        {t.insider.source}
      </p>
    </section>
  );
};

export default StockInsiderTrades;
