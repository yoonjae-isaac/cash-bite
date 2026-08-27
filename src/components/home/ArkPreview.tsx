'use client';

import { Activity } from 'lucide-react';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { formatShareDelta, type ArkTradeRow } from '../../domain/ark/types';
import TickerLogo from '../ui/TickerLogo';
import SectionHeader from './SectionHeader';

/** 'YYYY-MM-DD' → 'M/D'. */
function shortDate(date: string): string {
  const [, m, d] = date.split('-').map(Number);
  return m && d ? `${m}/${d}` : date;
}

/**
 * 홈 — ARK 일별 매매 간략보기.
 *
 * 다른 거장은 13F 로만 볼 수 있어 분기에 한 번, 최대 45일 뒤에야 드러난다.
 * ARK 는 매일 공개하는 유일한 운용사라 "오늘 뭘 샀나"를 볼 수 있고, 그 점을 설명으로 밝힌다.
 */
const ArkPreview = ({
  tradeDate,
  buyCount,
  sellCount,
  trades,
  logos,
}: {
  tradeDate: string;
  buyCount: number;
  sellCount: number;
  trades: ArkTradeRow[];
  logos?: Record<string, string>;
}) => {
  const t = useLanguageStore((s) => s.t);
  if (trades.length === 0) {
    return null;
  }

  return (
    <section className="glass-panel rounded-2xl p-5">
      <SectionHeader
        icon={<Activity className="h-4 w-4" />}
        title={t.ark.homeTitle}
        desc={t.ark.homeDesc}
        meta={`${shortDate(tradeDate)} · ${t.ark.buyLabel} ${buyCount} · ${t.ark.sellLabel} ${sellCount}`}
        href="/gurus/wood"
        linkLabel={t.marketNews.viewAll}
      />

      <ul className="space-y-1">
        {trades.map((trade) => {
          const buy = trade.direction === 'buy';
          return (
            <li
              key={trade.cusip}
              className="theme-row flex items-center gap-2.5 rounded-lg px-2 py-1.5"
            >
              <TickerLogo
                symbol={trade.ticker ?? trade.company}
                src={trade.ticker ? logos?.[trade.ticker] : undefined}
                size="sm"
              />
              <span className="flex min-w-0 flex-1 items-center gap-1.5">
                <b className="truncate text-sm font-bold text-cb-foreground">
                  {trade.ticker ?? trade.company}
                </b>
                {trade.isNew && (
                  <span className="shrink-0 rounded bg-cb-positive/15 px-1.5 py-px text-[10px] font-bold text-cb-positive">
                    {t.ark.badgeNew}
                  </span>
                )}
                {trade.isExit && (
                  <span className="shrink-0 rounded bg-cb-negative/15 px-1.5 py-px text-[10px] font-bold text-cb-negative">
                    {t.ark.badgeExit}
                  </span>
                )}
              </span>
              <span className="hidden shrink-0 text-[10px] font-semibold text-cb-muted sm:block">
                {trade.funds.join('·')}
              </span>
              <span
                className={`shrink-0 text-sm font-bold tabular-nums ${buy ? 'text-cb-positive' : 'text-cb-negative'}`}
              >
                {buy ? '▲' : '▼'} {formatShareDelta(trade.sharesDelta)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default ArkPreview;
