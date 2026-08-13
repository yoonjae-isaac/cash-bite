'use client';

import { TrendingUp } from 'lucide-react';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import type { CalEarning } from '../../domain/calendar/types';
import SectionHeader from './SectionHeader';

const HOUR_LABEL: Record<string, 'hourBmo' | 'hourAmc' | 'hourDmh'> = {
  bmo: 'hourBmo',
  amc: 'hourAmc',
  dmh: 'hourDmh',
};

/** M/D(요일) — 캘린더와 동일한 KST 기준 표기. */
function dayLabel(date: string, lang: string): string {
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d) {
    return date;
  }
  const weekday = new Intl.DateTimeFormat(lang === 'ko' ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : 'en-US', {
    weekday: 'short',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d)));
  return `${m}/${d} ${weekday}`;
}

/** 홈 — 이번 주 실적 발표. 거장 보유 종목을 먼저 보여줘 캘린더로 유도한다. */
const EarningsPreview = ({
  items,
  total,
  guruHeldTotal,
  guruSymbols,
}: {
  items: CalEarning[];
  total: number;
  guruHeldTotal: number;
  guruSymbols?: Record<string, number>;
}) => {
  const t = useLanguageStore((s) => s.t);
  const lang = useLanguageStore((s) => s.language);
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="glass-panel rounded-2xl p-5">
      <SectionHeader
        icon={<TrendingUp className="h-4 w-4" />}
        title={t.calendar.catEarnings}
        desc={
          guruHeldTotal > 0
            ? `${t.calendar.guruOnly} ${guruHeldTotal}${t.home.updatesEventUnit}`
            : t.calendar.subtitle
        }
        meta={`${t.calendar.thisWeek} ${total}${t.home.updatesEventUnit}`}
        href="/calendar"
        linkLabel={t.marketNews.viewAll}
      />

      <ul className="space-y-1">
        {items.map((e, i) => {
          const guruCount = guruSymbols?.[e.symbol.toUpperCase()];
          const hour = e.hour && HOUR_LABEL[e.hour] ? t.calendar[HOUR_LABEL[e.hour]] : '';
          return (
            <li
              key={`${e.symbol}-${i}`}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm theme-row"
            >
              <span className="flex min-w-0 flex-1 items-center gap-1.5">
                <b className="font-semibold text-cb-foreground tabular-nums">{e.symbol}</b>
                {guruCount !== undefined && (
                  <span
                    title={`${guruCount}${t.calendar.guruHeldBadge}`}
                    className="shrink-0 rounded bg-cb-accent/15 px-1 text-[10px] font-bold text-cb-accent"
                  >
                    ★{guruCount}
                  </span>
                )}
                {e.name && (
                  <span className="truncate text-xs text-cb-muted">{e.name}</span>
                )}
              </span>
              {hour && (
                <span className="shrink-0 rounded bg-[var(--cb-hover)] px-1.5 py-px text-[10px] font-semibold text-cb-muted">
                  {hour}
                </span>
              )}
              <span className="shrink-0 text-xs text-cb-muted tabular-nums">
                {dayLabel(e.date, lang)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default EarningsPreview;
