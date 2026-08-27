'use client';

import { useState } from 'react';
import { Activity, ChevronDown } from 'lucide-react';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { formatShareDelta, type ArkDailyTrades, type ArkTradeRow } from '../../domain/ark/types';
import TickerLogo from '../ui/TickerLogo';

const COLLAPSED_ROWS = 8;

/** 'YYYY-MM-DD' → 'M/D (요일)'. */
function dayLabel(date: string, lang: string): string {
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d) {
    return date;
  }
  const locale = lang === 'ko' ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : 'en-US';
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
  return `${m}/${d} ${weekday}`;
}

const TradeRow = ({ trade, logos }: { trade: ArkTradeRow; logos?: Record<string, string> }) => {
  const t = useLanguageStore((s) => s.t);
  const buy = trade.direction === 'buy';

  return (
    <li className="theme-row flex items-center gap-2.5 rounded-lg px-2 py-2">
      <TickerLogo
        symbol={trade.ticker ?? trade.company}
        src={trade.ticker ? logos?.[trade.ticker] : undefined}
        size="sm"
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
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
        <span className="block truncate text-[11px] leading-tight text-cb-muted">
          {trade.ticker ? trade.company : trade.cusip}
        </span>
      </span>

      {/* 어느 펀드가 매매했는지 — ARK 는 테마별 펀드가 나뉘어 있어 조합 자체가 정보다 */}
      <span className="hidden shrink-0 gap-1 sm:flex">
        {trade.funds.map((f) => (
          <span
            key={f}
            className="rounded bg-[var(--cb-hover)] px-1.5 py-px text-[10px] font-semibold text-cb-muted"
          >
            {f}
          </span>
        ))}
      </span>

      <span className="shrink-0 text-right">
        <span
          className={`block text-sm font-bold tabular-nums ${buy ? 'text-cb-positive' : 'text-cb-negative'}`}
        >
          {buy ? '▲' : '▼'} {formatShareDelta(trade.sharesDelta)}
        </span>
        <span className="block text-[10px] leading-tight text-cb-muted">{t.ark.sharesUnit}</span>
      </span>
    </li>
  );
};

/**
 * ARK 일별 매매 — 13F(분기·최대 45일 지연)와 달리 당일 매매를 볼 수 있는 유일한 거장 데이터.
 * 거래일별로 묶고, 같은 종목을 여러 펀드가 매매하면 한 줄로 합쳐 보여준다.
 */
const ArkDailyTradesSection = ({
  days,
  logos,
  staleFunds,
}: {
  days: ArkDailyTrades[];
  logos?: Record<string, string>;
  staleFunds?: string[];
}) => {
  const t = useLanguageStore((s) => s.t);
  const lang = useLanguageStore((s) => s.language);
  const [expanded, setExpanded] = useState(false);

  if (days.length === 0) {
    return null;
  }

  const shown = expanded ? days : days.slice(0, 1);

  return (
    <section className="glass-panel rounded-xl p-5">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <Activity className="h-4 w-4 text-cb-accent" aria-hidden />
        <h3 className="text-base font-bold text-cb-foreground">{t.ark.title}</h3>
        <span className="rounded-full bg-cb-positive/15 px-2 py-0.5 text-[10px] font-bold text-cb-positive">
          {t.ark.liveBadge}
        </span>
      </div>
      <p className="mb-4 text-xs leading-relaxed text-cb-muted">{t.ark.desc}</p>

      <div className="space-y-4">
        {shown.map((day) => (
          <div key={day.tradeDate}>
            <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2 text-xs">
              <span className="font-bold text-cb-foreground tabular-nums">
                {dayLabel(day.tradeDate, lang)}
              </span>
              <span className="text-cb-muted">
                {t.ark.buyLabel} {day.buyCount} · {t.ark.sellLabel} {day.sellCount}
              </span>
            </div>
            <ul className="space-y-0.5">
              {day.trades.slice(0, COLLAPSED_ROWS).map((trade) => (
                <TradeRow key={`${day.tradeDate}-${trade.cusip}`} trade={trade} logos={logos} />
              ))}
            </ul>
            {day.trades.length > COLLAPSED_ROWS && (
              <p className="mt-1 px-2 text-[11px] text-cb-muted">
                {t.ark.moreRows.replace('{n}', String(day.trades.length - COLLAPSED_ROWS))}
              </p>
            )}
          </div>
        ))}
      </div>

      {days.length > 1 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-cb-muted transition-colors hover:text-cb-foreground"
        >
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            aria-hidden
          />
          {expanded ? t.ark.showLess : t.ark.showMore.replace('{n}', String(days.length - 1))}
        </button>
      )}

      {staleFunds && staleFunds.length > 0 && (
        <p className="mt-3 border-t border-cb-border pt-3 text-[11px] leading-relaxed text-cb-muted">
          {t.ark.staleNote.replace('{funds}', staleFunds.join(', '))}
        </p>
      )}
    </section>
  );
};

export default ArkDailyTradesSection;
