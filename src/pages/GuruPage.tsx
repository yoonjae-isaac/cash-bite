import { useEffect, useState } from 'react';
import { Crown, ExternalLink, RotateCcw, User, BarChart3 } from 'lucide-react';
import { useGuruStore } from '../application/guru/useGuruStore';
import { useLanguageStore } from '../application/i18n/useLanguageStore';
import type { GuruPortfolio } from '../domain/guru/types';
import InvestorPicker from '../components/guru/InvestorPicker';
import GuruSummary from '../components/guru/GuruSummary';
import AllocationDonut from '../components/guru/AllocationDonut';
import HoldingsTable from '../components/guru/HoldingsTable';
import GuruExits from '../components/guru/GuruExits';
import GuruStats from '../components/guru/GuruStats';

type Tab = 'portfolio' | 'stats';

const secFilingUrl = (portfolio: GuruPortfolio): string =>
  `https://www.sec.gov/Archives/edgar/data/${Number(portfolio.cik)}/${portfolio.accessionNumber.replace(/-/g, '')}`;

const LoadingSkeleton = () => (
  <div className="space-y-4 animate-pulse" aria-hidden>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="glass-panel rounded-xl h-24" />
      ))}
    </div>
    <div className="glass-panel rounded-xl h-64" />
    <div className="glass-panel rounded-xl h-96" />
  </div>
);

const PortfolioView = () => {
  const t = useLanguageStore((s) => s.t);
  const { selectedKey, portfolios, isLoadingInvestors, isLoadingPortfolio, error, init } =
    useGuruStore();

  const portfolio = portfolios[selectedKey];
  const isLoading = isLoadingInvestors || isLoadingPortfolio;

  return (
    <div className="space-y-4">
      <InvestorPicker />

      {error && (
        <div className="glass-panel rounded-xl p-8 text-center">
          <p className="text-cb-negative mb-4">{t.gurus.error}</p>
          <button
            onClick={() => init()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cb-accent text-cb-on-accent text-sm font-semibold hover:bg-cb-accent-hover transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            {t.gurus.retry}
          </button>
        </div>
      )}

      {!error && isLoading && !portfolio && <LoadingSkeleton />}

      {!error && portfolio && (
        <div className={isLoading ? 'opacity-60 transition-opacity' : ''}>
          <div className="space-y-4">
            <GuruSummary portfolio={portfolio} />
            {portfolio.holdings.length === 0 ? (
              <div className="glass-panel rounded-xl p-8 text-center text-cb-muted">
                {t.gurus.noData}
              </div>
            ) : (
              <>
                <AllocationDonut portfolio={portfolio} />
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

const GuruPage = () => {
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
        <h2 className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-cb-foreground">
          <Crown className="w-7 h-7 text-cb-accent" />
          {t.gurus.title}
        </h2>
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

      {tab === 'portfolio' ? <PortfolioView /> : <GuruStats />}
    </div>
  );
};

export default GuruPage;
