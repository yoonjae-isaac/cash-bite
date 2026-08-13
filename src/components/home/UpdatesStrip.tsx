'use client';

import { CalendarDays, ChevronRight, Crown, Layers, RefreshCw } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { toQuarterLabel } from '../../domain/guru/types';
import type { HomeData } from '../../domain/home/types';

/**
 * 히어로 옆 "지금 들어와 있는 데이터" 피드.
 * 서비스가 계속 갱신되고 있다는 신호를 첫 화면에서 주고, 각 데이터의 상세 화면으로 보낸다.
 */
const UpdatesStrip = ({ data }: { data: HomeData }) => {
  const t = useLanguageStore((s) => s.t);

  const rows = [
    data.guru && {
      href: '/consensus',
      icon: <Crown className="h-4 w-4" />,
      label: t.nav.gurus,
      value: `${data.guru.investorCount}${t.gurus.peopleUnit}`,
      sub: toQuarterLabel(data.guru.asOf),
    },
    data.earnings && {
      href: '/calendar',
      icon: <CalendarDays className="h-4 w-4" />,
      label: t.calendar.catEarnings,
      value: `${data.earnings.total}${t.home.updatesEventUnit}`,
      sub: t.calendar.thisWeek,
    },
    data.earnings &&
      data.earnings.guruHeldTotal > 0 && {
        href: '/calendar',
        icon: <Layers className="h-4 w-4" />,
        label: t.calendar.guruOnly,
        value: `${data.earnings.guruHeldTotal}${t.home.updatesEventUnit}`,
        sub: t.calendar.catEarnings,
      },
  ].filter(Boolean) as {
    href: string;
    icon: React.ReactNode;
    label: string;
    value: string;
    sub: string;
  }[];

  if (rows.length === 0) {
    return null;
  }

  return (
    <aside className="glass-panel rounded-2xl p-4" aria-label={t.home.updatesTitle}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold text-cb-foreground">{t.home.updatesTitle}</p>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cb-accent">
          <RefreshCw className="h-3 w-3" />
          {t.home.updatesDaily}
        </span>
      </div>

      <ul className="space-y-1">
        {rows.map((row) => (
          <li key={`${row.href}-${row.label}`}>
            <Link
              href={row.href}
              className="theme-row group flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors theme-hover"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cb-accent/15 text-cb-accent">
                {row.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11px] text-cb-muted">{row.label}</span>
                <span className="block truncate text-sm font-bold text-cb-foreground">
                  <span className="tabular-nums">{row.value}</span>
                  <span className="ml-1.5 font-normal text-cb-muted">{row.sub}</span>
                </span>
              </span>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-cb-muted transition-colors group-hover:text-cb-accent"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default UpdatesStrip;
