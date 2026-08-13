'use client';

import { ArrowDownRight, ArrowLeft, Crown, Layers, TrendingUp, Users } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useLanguageStore } from '../application/i18n/useLanguageStore';
import { toQuarterLabel, type GuruAnalysis, type GuruStats } from '../domain/guru/types';
import StatRankCard from '../components/guru/StatRankCard';
import GuruAiReport from '../components/guru/GuruAiReport';
import ExplainToggle from '../components/ui/ExplainToggle';

const ConsensusPage = ({
  stats,
  analysis,
  logos,
}: {
  stats: GuruStats;
  analysis: GuruAnalysis | null;
  logos?: Record<string, string>;
}) => {
  const t = useLanguageStore((s) => s.t);

  return (
    <div className="space-y-5">
      <Link
        href="/gurus"
        className="inline-flex items-center gap-1.5 text-sm text-cb-muted transition-colors hover:text-cb-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.gurus.detailBack}
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-cb-foreground md:text-3xl">
          {t.gurus.consensusTitle}
        </h1>
        <p className="mt-1.5 text-cb-muted">{t.gurus.consensusSubtitle}</p>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-cb-muted">
          <Crown className="h-3.5 w-3.5 text-cb-accent" />
          {t.gurus.statsSummary}{' '}
          <span className="font-bold text-cb-foreground">
            {stats.investorCount}
            {t.gurus.statsInvestorsUnit}
          </span>
          {' · '}
          {t.gurus.asOfLabel} {toQuarterLabel(stats.asOf)}
        </p>
      </header>

      {analysis && (
        <GuruAiReport
          analysis={analysis}
          title={t.gurus.marketAiTitle}
          note={t.gurus.marketAiNote}
        />
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StatRankCard
          title={t.gurus.mostHeldTitle}
          desc={t.gurus.mostHeldDesc}
          icon={<Users className="h-4 w-4" />}
          accent="text-cb-accent"
          stocks={stats.mostHeld}
          metric="holders"
          unit={t.gurus.holdersUnit}
          logos={logos}
        />
        <StatRankCard
          title={t.gurus.grandTitle}
          desc={t.gurus.grandDesc}
          icon={<Layers className="h-4 w-4" />}
          accent="text-violet-500"
          stocks={stats.grandPortfolio}
          metric="value"
          unit=""
          logos={logos}
        />
        <StatRankCard
          title={t.gurus.mostBoughtTitle}
          desc={t.gurus.mostBoughtDesc}
          icon={<TrendingUp className="h-4 w-4" />}
          accent="text-cb-positive"
          stocks={stats.mostBought}
          metric="buyers"
          unit={t.gurus.buyersUnit}
          logos={logos}
        />
        <StatRankCard
          title={t.gurus.mostSoldTitle}
          desc={t.gurus.mostSoldDesc}
          icon={<ArrowDownRight className="h-4 w-4" />}
          accent="text-cb-negative"
          stocks={stats.mostSold}
          metric="sellers"
          unit={t.gurus.sellersUnit}
          logos={logos}
        />
      </div>

      <ExplainToggle label={t.gurus.howToRead}>{t.gurus.howToReadBody}</ExplainToggle>

      <p className="px-1 text-xs text-cb-muted">{t.gurus.disclaimer}</p>
    </div>
  );
};

export default ConsensusPage;
