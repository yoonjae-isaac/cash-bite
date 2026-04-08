
import { TrendingUp, Globe, RefreshCcw } from 'lucide-react';
import { usePortfolioStore } from '../../../store/usePortfolioStore';
import { useLanguageStore } from '../../../application/i18n/useLanguageStore';

const rateRowClass =
  'flex items-center justify-between p-3 rounded-lg theme-row';

const ExchangeRateCard = () => {
  const { rates, fetchExchangeRate, isLoading } = usePortfolioStore();
  const t = useLanguageStore((state) => state.t);

  const krwRate = rates?.KRW ?? 0;
  const jpyRate = rates?.JPY ?? 0;

  const jpyToKrw100 = jpyRate > 0 ? (krwRate / jpyRate) * 100 : 0;

  return (
    <div className="glass-panel p-6 overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-4 transition-opacity pointer-events-none">
        <Globe
          className="w-24 h-24 text-cb-accent opacity-[var(--cb-globe)] group-hover:opacity-[var(--cb-globe-hover)] transition-opacity"
        />
      </div>

      <div className="flex items-center justify-between mb-6 relative">
        <h3 className="text-lg font-bold text-cb-foreground flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cb-accent" />
          {t.common.exchangeRate}
        </h3>
        <button
          onClick={() => fetchExchangeRate()}
          disabled={isLoading}
          className="p-2 rounded-lg text-cb-muted hover:text-cb-accent hover:bg-[var(--cb-hover)] transition-all disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3 relative">
        <div className={rateRowClass}>
          <div className="flex items-center gap-3">
            <span className="text-xl">🇺🇸</span>
            <div>
              <div className="text-xs font-bold text-cb-muted uppercase">USD</div>
              <div className="text-sm font-medium text-cb-muted">United States</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-base font-bold text-cb-foreground font-mono">$ 1.00</div>
            <div className="text-[10px] text-cb-accent font-bold uppercase tracking-wider">Base</div>
          </div>
        </div>

        <div className={rateRowClass}>
          <div className="flex items-center gap-3">
            <span className="text-xl">🇰🇷</span>
            <div>
              <div className="text-xs font-bold text-cb-muted uppercase">KRW</div>
              <div className="text-sm font-medium text-cb-muted">South Korea</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-base font-bold text-cb-foreground font-mono">
              ₩ {krwRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className={rateRowClass}>
          <div className="flex items-center gap-3">
            <span className="text-xl">🇯🇵</span>
            <div>
              <div className="text-xs font-bold text-cb-muted uppercase">JPY</div>
              <div className="text-sm font-medium text-cb-muted">Japan</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-base font-bold text-cb-foreground font-mono">
              ¥ {jpyRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            {jpyToKrw100 > 0 && (
              <div className="text-[10px] text-cb-muted font-medium">
                ≈ ₩{jpyToKrw100.toFixed(2)} / 100¥
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-cb-border text-[10px] text-cb-muted/90 italic text-center">
        Exchange rates via Naver (KEB Hana Bank benchmark).
      </div>
    </div>
  );
};

export default ExchangeRateCard;
