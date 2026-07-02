import { useEffect } from 'react';
import { Users, TrendingUp, ArrowDownRight, Layers, RotateCcw, Crown } from 'lucide-react';
import { useGuruStore } from '../../application/guru/useGuruStore';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { toQuarterLabel } from '../../domain/guru/types';
import StatRankCard from './StatRankCard';

const StatsSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-pulse" aria-hidden>
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="glass-panel rounded-xl h-80" />
    ))}
  </div>
);

const GuruStats = () => {
  const t = useLanguageStore((s) => s.t);
  const { stats, isLoadingStats, statsError, loadStats } = useGuruStore();

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (statsError) {
    return (
      <div className="glass-panel rounded-xl p-8 text-center">
        <p className="text-cb-negative mb-4">{t.gurus.statsError}</p>
        <button
          onClick={() => loadStats()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cb-accent text-cb-on-accent text-sm font-semibold hover:bg-cb-accent-hover transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          {t.gurus.retry}
        </button>
      </div>
    );
  }

  if (isLoadingStats && !stats) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-cb-muted text-center py-2">{t.gurus.statsLoading}</p>
        <StatsSkeleton />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-cb-muted px-1">
        <Crown className="w-4 h-4 text-cb-accent" />
        {t.gurus.statsSummary}{' '}
        <span className="font-bold text-cb-foreground">
          {stats.investorCount}
          {t.gurus.statsInvestorsUnit}
        </span>
        {', '}
        {toQuarterLabel(stats.asOf)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatRankCard
          title={t.gurus.mostHeldTitle}
          desc={t.gurus.mostHeldDesc}
          icon={<Users className="w-4 h-4" />}
          accent="text-cb-accent"
          stocks={stats.mostHeld}
          metric="holders"
          unit={t.gurus.holdersUnit}
        />
        <StatRankCard
          title={t.gurus.grandTitle}
          desc={t.gurus.grandDesc}
          icon={<Layers className="w-4 h-4" />}
          accent="text-violet-500"
          stocks={stats.grandPortfolio}
          metric="value"
          unit=""
        />
        <StatRankCard
          title={t.gurus.mostBoughtTitle}
          desc={t.gurus.mostBoughtDesc}
          icon={<TrendingUp className="w-4 h-4" />}
          accent="text-cb-positive"
          stocks={stats.mostBought}
          metric="buyers"
          unit={t.gurus.buyersUnit}
        />
        <StatRankCard
          title={t.gurus.mostSoldTitle}
          desc={t.gurus.mostSoldDesc}
          icon={<ArrowDownRight className="w-4 h-4" />}
          accent="text-cb-negative"
          stocks={stats.mostSold}
          metric="sellers"
          unit={t.gurus.sellersUnit}
        />
      </div>
    </div>
  );
};

export default GuruStats;
