'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Link } from '@/i18n/navigation';
import { useLanguageStore } from '../application/i18n/useLanguageStore';
import {
  bioOf,
  GURU_STYLE_LABEL,
  initialsOf,
  personOf,
  styleOf,
} from '../domain/guru/investors';
import {
  splitInvestorName,
  toQuarterLabel,
  type GuruAnalysis,
  type GuruPortfolio,
} from '../domain/guru/types';
import GuruSummary from '../components/guru/GuruSummary';
// 도넛 차트(recharts)는 클라 전용 — SSR 스킵(보유 테이블은 서버 렌더 유지).
const AllocationDonut = dynamic(() => import('../components/guru/AllocationDonut'), { ssr: false });
import PortfolioChanges from '../components/guru/PortfolioChanges';
import HoldingsTable from '../components/guru/HoldingsTable';
import GuruExits from '../components/guru/GuruExits';
import GuruAiReport from '../components/guru/GuruAiReport';
import ArkDailyTradesSection from '../components/ark/ArkDailyTrades';
import type { ArkDailyTrades } from '../domain/ark/types';
import EmptyState from '../components/ui/EmptyState';
import ExplainToggle from '../components/ui/ExplainToggle';
import FilterChips, { type FilterChipOption } from '../components/ui/FilterChips';

type HoldingFilter = 'all' | 'new' | 'up' | 'down' | 'exit';

const secFilingUrl = (portfolio: GuruPortfolio): string =>
  `https://www.sec.gov/Archives/edgar/data/${Number(portfolio.cik)}/${portfolio.accessionNumber.replace(/-/g, '')}`;

const GuruDetailPage = ({
  portfolio,
  analysis,
  logos,
  arkTrades,
  arkStaleFunds,
}: {
  portfolio: GuruPortfolio;
  analysis: GuruAnalysis | null;
  logos?: Record<string, string>;
  /** 캐시 우드에만 있는 ARK 일별 매매 — 다른 거장은 undefined. */
  arkTrades?: ArkDailyTrades[];
  arkStaleFunds?: string[];
}) => {
  const t = useLanguageStore((s) => s.t);
  const lang = useLanguageStore((s) => s.language);
  const [filter, setFilter] = useState<HoldingFilter>('all');

  const { firm, person: rawPerson } = splitInvestorName(portfolio.investorName);
  const person = personOf(portfolio.investorKey, lang, rawPerson);
  const bio = bioOf(portfolio.investorKey, lang);
  const style = styleOf(portfolio.investorKey);

  const counts = useMemo(() => {
    let neu = 0;
    let up = 0;
    let down = 0;
    for (const h of portfolio.holdings) {
      if (h.change?.type === 'new') neu += 1;
      else if (h.change?.type === 'increased') up += 1;
      else if (h.change?.type === 'decreased') down += 1;
    }
    return { neu, up, down, exit: portfolio.exits?.length ?? 0 };
  }, [portfolio]);

  const chips: FilterChipOption<HoldingFilter>[] = [
    { id: 'all', label: t.gurus.holdingsFilterAll, count: portfolio.holdings.length },
    { id: 'new', label: t.gurus.holdingsFilterNew, count: counts.neu },
    { id: 'up', label: t.gurus.holdingsFilterUp, count: counts.up },
    { id: 'down', label: t.gurus.holdingsFilterDown, count: counts.down },
    { id: 'exit', label: t.gurus.holdingsFilterExit, count: counts.exit },
  ];

  const filtered = useMemo(() => {
    switch (filter) {
      case 'new':
        return portfolio.holdings.filter((h) => h.change?.type === 'new');
      case 'up':
        return portfolio.holdings.filter((h) => h.change?.type === 'increased');
      case 'down':
        return portfolio.holdings.filter((h) => h.change?.type === 'decreased');
      default:
        return portfolio.holdings;
    }
  }, [portfolio.holdings, filter]);

  return (
    <div className="space-y-5">
      <Link
        href="/gurus"
        className="inline-flex items-center gap-1.5 text-sm text-cb-muted transition-colors hover:text-cb-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.gurus.detailBack}
      </Link>

      <header className="flex items-start gap-4">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cb-accent/15 text-lg font-bold text-cb-accent"
          aria-hidden
        >
          {initialsOf(rawPerson)}
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-cb-foreground md:text-3xl">{person}</h1>
          <p className="mt-0.5 text-sm text-cb-muted">
            {firm !== person && <span>{firm} · </span>}
            <span className="rounded bg-cb-border/60 px-1.5 py-px text-xs font-semibold text-cb-foreground">
              {GURU_STYLE_LABEL[style][lang]}
            </span>
          </p>
          {bio && <p className="mt-2 text-sm leading-relaxed text-cb-muted">{bio}</p>}
        </div>
      </header>

      <GuruSummary portfolio={portfolio} />

      {/* 일별 매매는 13F 보다 최신이라 분기 포트폴리오보다 위에 둔다 */}
      {arkTrades && arkTrades.length > 0 && (
        <ArkDailyTradesSection days={arkTrades} logos={logos} staleFunds={arkStaleFunds} />
      )}

      {analysis && (
        <GuruAiReport
          analysis={analysis}
          title={t.gurus.aiReportTitle}
          note={t.gurus.aiReportNote}
        />
      )}

      {portfolio.holdings.length === 0 ? (
        <EmptyState message={t.gurus.noData} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <AllocationDonut portfolio={portfolio} />
            <PortfolioChanges portfolio={portfolio} />
          </div>

          <FilterChips
            options={chips}
            value={filter}
            onChange={setFilter}
            ariaLabel={t.gurus.holdingsTitle}
          />

          {filter === 'exit' ? (
            portfolio.exits && portfolio.exits.length > 0 ? (
              <GuruExits exits={portfolio.exits} />
            ) : (
              <EmptyState message={t.gurus.changesEmpty} />
            )
          ) : filtered.length === 0 ? (
            <EmptyState message={t.gurus.changesEmpty} />
          ) : (
            <HoldingsTable holdings={filtered} logos={logos} />
          )}
        </>
      )}

      <ExplainToggle label={t.gurus.howToRead}>{t.gurus.howToReadBody}</ExplainToggle>

      <footer className="flex flex-col justify-between gap-2 px-1 text-xs text-cb-muted sm:flex-row sm:items-center">
        <p className="max-w-2xl">
          {t.gurus.disclaimer} · {t.gurus.asOfLabel} {toQuarterLabel(portfolio.reportDate)}
        </p>
        <a
          href={secFilingUrl(portfolio)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 transition-colors hover:text-cb-accent"
        >
          {t.gurus.viewOnSec}
          <ExternalLink className="h-3 w-3" />
        </a>
      </footer>
    </div>
  );
};

export default GuruDetailPage;
