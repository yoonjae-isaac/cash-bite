'use client';

import { UserRound } from 'lucide-react';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import type { InsiderBuyRow } from '../../domain/insider/types';
import TickerLogo from '../ui/TickerLogo';
import SectionHeader from './SectionHeader';

function formatUsd(v: number): string {
  if (v >= 1_000_000) {
    return `$${(v / 1_000_000).toFixed(1)}M`;
  }
  return `$${Math.round(v / 1_000)}K`;
}

/**
 * 홈 — 최근 장내 매수 상위.
 *
 * 매도는 스톡옵션 보상이 섞여 신호가 약하므로 매수만 보여준다.
 * 거장(13F)이 함께 보유한 종목이면 ★N 을 붙여, 두 신호가 겹치는 지점을 눈에 띄게 한다.
 */
const InsiderBuysPreview = ({
  rows,
  logos,
  guruSymbols,
}: {
  rows: InsiderBuyRow[];
  logos?: Record<string, string>;
  guruSymbols?: Record<string, number>;
}) => {
  const t = useLanguageStore((s) => s.t);
  if (rows.length === 0) {
    return null;
  }

  return (
    <section className="glass-panel rounded-2xl p-5">
      <SectionHeader
        icon={<UserRound className="h-4 w-4" />}
        title={t.insider.homeTitle}
        desc={t.insider.homeDesc}
        href="/stock"
        linkLabel={t.marketNews.viewAll}
      />

      <ul className="space-y-1">
        {rows.map((r) => {
          const guruCount = guruSymbols?.[r.ticker];
          return (
            <li
              key={r.ticker}
              className="theme-row flex items-center gap-2.5 rounded-lg px-2 py-1.5"
            >
              <TickerLogo symbol={r.ticker} src={logos?.[r.ticker]} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <b className="truncate text-sm font-bold text-cb-foreground">{r.ticker}</b>
                  {guruCount !== undefined && (
                    <span
                      title={`${guruCount}${t.calendar.guruHeldBadge}`}
                      className="shrink-0 rounded bg-cb-accent/15 px-1 text-[10px] font-bold text-cb-accent"
                    >
                      ★{guruCount}
                    </span>
                  )}
                </span>
                <span className="block truncate text-[11px] leading-tight text-cb-muted">
                  {r.buyerCount}
                  {t.insider.buyersUnit} · {r.owners[0]}
                </span>
              </span>
              <span className="shrink-0 text-sm font-bold text-cb-positive tabular-nums">
                {formatUsd(r.totalValue)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default InsiderBuysPreview;
