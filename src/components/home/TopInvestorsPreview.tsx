'use client';

import { ChevronRight, Crown } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { formatUsd13F } from '../../domain/guru/format';
import { initialsOf, personOf } from '../../domain/guru/investors';
import { splitInvestorName, type GuruOverviewItem } from '../../domain/guru/types';
import SectionHeader from './SectionHeader';

/** 홈 — 운용자산 상위 거장. 각 행이 개별 포트폴리오 페이지로 들어가는 입구. */
const TopInvestorsPreview = ({
  investors,
  investorCount,
}: {
  investors: GuruOverviewItem[];
  investorCount: number;
}) => {
  const t = useLanguageStore((s) => s.t);
  const lang = useLanguageStore((s) => s.language);
  if (investors.length === 0) {
    return null;
  }

  return (
    <section className="glass-panel rounded-2xl p-5">
      <SectionHeader
        icon={<Crown className="h-4 w-4" />}
        title={t.gurus.title}
        desc={t.home.gurusDesc}
        meta={`${investorCount}${t.gurus.peopleUnit}`}
        href="/gurus"
        linkLabel={t.marketNews.viewAll}
      />

      <ul className="space-y-1">
        {investors.map((inv) => {
          const { person: rawPerson } = splitInvestorName(inv.name);
          const person = personOf(inv.key, lang, rawPerson);
          const row = (
            <>
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cb-accent/15 text-[11px] font-bold text-cb-accent"
                aria-hidden
              >
                {initialsOf(rawPerson)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-cb-foreground">
                  {person}
                </span>
                {inv.topHolding && (
                  <span className="block truncate text-[11px] text-cb-muted">
                    {t.gurus.cardTop} · {inv.topHolding.ticker ?? inv.topHolding.nameOfIssuer}{' '}
                    {inv.topHolding.weight}%
                  </span>
                )}
              </span>
              <span className="shrink-0 text-sm font-bold text-cb-accent tabular-nums">
                {formatUsd13F(inv.totalValue)}
              </span>
            </>
          );

          return (
            <li key={inv.cik}>
              {inv.key ? (
                <Link
                  href={`/gurus/${inv.key}`}
                  className="theme-row group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors theme-hover"
                >
                  {row}
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-cb-muted transition-colors group-hover:text-cb-accent"
                    aria-hidden
                  />
                </Link>
              ) : (
                <div className="flex items-center gap-3 px-2 py-2">{row}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default TopInvestorsPreview;
