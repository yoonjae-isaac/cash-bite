import { CreditCard, Calendar, BarChart3, TrendingUp, Wallet } from 'lucide-react';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';

const monoCard =
  'glass-panel p-5 bg-gradient-to-br from-[var(--cb-card-shine)] to-transparent shadow-[var(--cb-shadow-soft)]';

const Summary = () => {
  const { stocks, rates } = usePortfolioStore();
  const t = useLanguageStore((state) => state.t);

  const exchangeRate = rates.KRW;

  const totalPortfolioValueUSD = stocks.reduce(
    (acc, stock) => acc + stock.shares * (stock.currentPrice || 0),
    0
  );

  const totalYearlyAfterTaxUSD = stocks.reduce(
    (acc, stock) => acc + stock.shares * stock.dividendPerShare * 0.85,
    0
  );

  const totalYearlyAfterTaxKRW = totalYearlyAfterTaxUSD * exchangeRate;
  const totalMonthlyAfterTaxUSD = totalYearlyAfterTaxUSD / 12;
  const totalMonthlyAfterTaxKRW = totalYearlyAfterTaxKRW / 12;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
      {/* Total Portfolio Value — accent emphasis */}
      <div className="glass-panel p-5 border-cb-accent/40 bg-gradient-to-br from-cb-accent/10 to-transparent shadow-[var(--cb-shadow-soft)]">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-cb-accent/20 text-cb-accent">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-cb-muted">{t.portfolio.totalValue}</span>
        </div>
        <div className="text-2xl font-bold text-cb-accent font-mono tracking-tight">
          ${totalPortfolioValueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-cb-muted mt-1 uppercase font-semibold">
          ≈ ₩{(totalPortfolioValueUSD * exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
      </div>

      {/* Yearly USD */}
      <div className={monoCard}>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg theme-icon-tile text-cb-muted">
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-cb-muted">{t.portfolio.annualDividendUSD}</span>
        </div>
        <div className="text-2xl font-bold text-cb-foreground font-mono tracking-tight">
          ${totalYearlyAfterTaxUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-cb-muted mt-1 uppercase font-semibold">{t.portfolio.taxInfo}</div>
      </div>

      {/* Yearly KRW — subtle positive tint (icon only) */}
      <div className={monoCard}>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-cb-positive/15 text-cb-positive">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-cb-muted">{t.portfolio.annualDividendKRW}</span>
        </div>
        <div className="text-2xl font-bold text-cb-foreground font-mono tracking-tight">
          ₩{totalYearlyAfterTaxKRW.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
        <div className="text-xs text-cb-muted mt-1 uppercase font-semibold">@ ₩{exchangeRate.toLocaleString()}</div>
      </div>

      {/* Monthly USD */}
      <div className={monoCard}>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg theme-icon-tile text-cb-muted">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-cb-muted">{t.portfolio.monthlyDividendUSD}</span>
        </div>
        <div className="text-2xl font-bold text-cb-foreground font-mono tracking-tight">
          ${totalMonthlyAfterTaxUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-cb-muted mt-1 uppercase font-semibold">{t.portfolio.avgPerMonth}</div>
      </div>

      {/* Monthly KRW */}
      <div className={monoCard}>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg theme-icon-tile text-cb-muted">
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-cb-muted">{t.portfolio.monthlyDividendKRW}</span>
        </div>
        <div className="text-2xl font-bold text-cb-foreground font-mono tracking-tight">
          ₩{totalMonthlyAfterTaxKRW.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
        <div className="text-xs text-cb-muted mt-1 uppercase font-semibold">{t.portfolio.avgPerMonth}</div>
      </div>
    </div>
  );
};

export default Summary;
