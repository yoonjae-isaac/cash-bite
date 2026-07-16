'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, User, BarChart3 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useGuruStore } from '../application/guru/useGuruStore';
import { useLanguageStore } from '../application/i18n/useLanguageStore';
import type { GuruPortfolio } from '../domain/guru/types';
import InvestorPicker from '../components/guru/InvestorPicker';
import GuruSummary from '../components/guru/GuruSummary';
// 도넛 차트(recharts)는 클라 전용 — SSR 스킵(보유 테이블은 서버 렌더 유지).
const AllocationDonut = dynamic(() => import('../components/guru/AllocationDonut'), { ssr: false });
import PortfolioChanges from '../components/guru/PortfolioChanges';
import HoldingsTable from '../components/guru/HoldingsTable';
import GuruExits from '../components/guru/GuruExits';
import GuruStats from '../components/guru/GuruStats';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorRetry from '../components/ui/ErrorRetry';

type Tab = 'portfolio' | 'stats';

const secFilingUrl = (portfolio: GuruPortfolio): string =>
  `https://www.sec.gov/Archives/edgar/data/${Number(portfolio.cik)}/${portfolio.accessionNumber.replace(/-/g, '')}`;

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="glass-panel rounded-xl p-4 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-24" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
    <Skeleton className="h-96 rounded-xl" />
  </div>
);

const PortfolioView = ({
  initialPortfolio,
  initialKey,
}: {
  initialPortfolio?: GuruPortfolio;
  initialKey?: string;
}) => {
  const t = useLanguageStore((s) => s.t);
  const { selectedKey, portfolios, isLoadingInvestors, isLoadingPortfolio, error, init } =
    useGuruStore();

  // 서버 초기 포트폴리오(기본 거장)로 폴백 → SSR/첫 렌더에서 보유 종목 표시.
  const portfolio =
    portfolios[selectedKey] ??
    (initialKey && selectedKey === initialKey ? initialPortfolio : undefined);
  const isLoading = isLoadingInvestors || isLoadingPortfolio;

  return (
    <div className="space-y-4">
      <InvestorPicker />

      {error && (
        <ErrorRetry message={t.gurus.error} retryLabel={t.gurus.retry} onRetry={() => init()} />
      )}

      {!error && isLoading && !portfolio && <LoadingSkeleton />}

      {!error && portfolio && (
        <div className={isLoading ? 'opacity-60 transition-opacity' : ''}>
          <div className="space-y-4">
            <GuruSummary portfolio={portfolio} />
            {portfolio.holdings.length === 0 ? (
              <EmptyState message={t.gurus.noData} />
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <AllocationDonut portfolio={portfolio} />
                  <PortfolioChanges portfolio={portfolio} />
                </div>
                <HoldingsTable holdings={portfolio.holdings} />
                {portfolio.exits && <GuruExits exits={portfolio.exits} />}
              </>
            )}
            <footer className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between text-xs text-cb-muted px-1">
              <p className="max-w-2xl">{t.gurus.disclaimer}</p>
              <a
                href={secFilingUrl(portfolio)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 shrink-0 hover:text-cb-accent transition-colors"
              >
                {t.gurus.viewOnSec}
                <ExternalLink className="w-3 h-3" />
              </a>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

const GuruPage = ({
  initialPortfolio,
  initialKey,
}: {
  initialPortfolio?: GuruPortfolio;
  initialKey?: string;
}) => {
  const t = useLanguageStore((s) => s.t);
  const init = useGuruStore((s) => s.init);
  const [tab, setTab] = useState<Tab>('portfolio');

  useEffect(() => {
    init();
  }, [init]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'portfolio', label: t.gurus.tabPortfolio, icon: <User className="w-4 h-4" /> },
    { id: 'stats', label: t.gurus.tabStats, icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-cb-foreground">
          {t.gurus.title}
        </h1>
        <p className="mt-1.5 text-cb-muted">{t.gurus.subtitle}</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-cb-border">
        {tabs.map((tb) => {
          const active = tab === tb.id;
          return (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              aria-current={active ? 'page' : undefined}
              className={[
                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors',
                active
                  ? 'border-cb-accent text-cb-accent'
                  : 'border-transparent text-cb-muted hover:text-cb-foreground',
              ].join(' ')}
            >
              {tb.icon}
              {tb.label}
            </button>
          );
        })}
      </div>

      {tab === 'portfolio' ? (
        <PortfolioView initialPortfolio={initialPortfolio} initialKey={initialKey} />
      ) : (
        <GuruStats />
      )}
    </div>
  );
};

export default GuruPage;
