import { CreditCard, Calendar, BarChart3, TrendingUp, Wallet } from 'lucide-react';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';

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
      {/* Total Portfolio Value */}
      <div className="glass-panel p-5 border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-slate-400">{t.portfolio.totalValue}</span>
        </div>
        <div className="text-2xl font-bold text-white font-mono tracking-tight">
          ${totalPortfolioValueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-slate-500 mt-1 uppercase font-semibold">
          ≈ ₩{(totalPortfolioValueUSD * exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
      </div>

      {/* Yearly USD */}
      <div className="glass-panel p-5 border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-transparent">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-slate-400">{t.portfolio.annualDividendUSD}</span>
        </div>
        <div className="text-2xl font-bold text-white font-mono tracking-tight">
          ${totalYearlyAfterTaxUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-slate-500 mt-1 uppercase font-semibold">{t.portfolio.taxInfo}</div>
      </div>

      {/* Yearly KRW */}
      <div className="glass-panel p-5 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-slate-400">{t.portfolio.annualDividendKRW}</span>
        </div>
        <div className="text-2xl font-bold text-emerald-400 font-mono tracking-tight">
          ₩{totalYearlyAfterTaxKRW.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
        <div className="text-xs text-slate-500 mt-1 uppercase font-semibold">@ ₩{exchangeRate.toLocaleString()}</div>
      </div>

      {/* Monthly USD */}
      <div className="glass-panel p-5 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-slate-400">{t.portfolio.monthlyDividendUSD}</span>
        </div>
        <div className="text-2xl font-bold text-white font-mono tracking-tight">
          ${totalMonthlyAfterTaxUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-slate-500 mt-1 uppercase font-semibold">{t.portfolio.avgPerMonth}</div>
      </div>

      {/* Monthly KRW */}
      <div className="glass-panel p-5 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-slate-400">{t.portfolio.monthlyDividendKRW}</span>
        </div>
        <div className="text-2xl font-bold text-amber-500 font-mono tracking-tight">
          ₩{totalMonthlyAfterTaxKRW.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
        <div className="text-xs text-slate-500 mt-1 uppercase font-semibold">{t.portfolio.avgPerMonth}</div>
      </div>
    </div>
  );
};

export default Summary;
