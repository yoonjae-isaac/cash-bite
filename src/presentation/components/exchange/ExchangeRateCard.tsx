
import { TrendingUp, Globe, RefreshCcw } from 'lucide-react';
import { usePortfolioStore } from '../../../store/usePortfolioStore';
import { useLanguageStore } from '../../../application/i18n/useLanguageStore';

const ExchangeRateCard = () => {
  const { rates, fetchExchangeRate, isLoading } = usePortfolioStore();
  const t = useLanguageStore((state) => state.t);

  const krwRate = rates?.KRW ?? 0;
  const jpyRate = rates?.JPY ?? 0;
  
  // Calculate 100 JPY to KRW
  const jpyToKrw100 = jpyRate > 0 ? (krwRate / jpyRate) * 100 : 0;

  return (
    <div className="glass-panel p-6 overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Globe className="w-24 h-24 text-indigo-500" />
      </div>

      <div className="flex items-center justify-between mb-6 relative">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          {t.common.exchangeRate}
        </h3>
        <button 
          onClick={() => fetchExchangeRate()}
          disabled={isLoading}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4 relative">
        {/* USD */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800/50">
          <div className="flex items-center gap-3">
            <span className="text-xl">🇺🇸</span>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase">USD</div>
              <div className="text-sm font-medium text-slate-300">United States</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-base font-bold text-white font-mono">$ 1.00</div>
            <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Base</div>
          </div>
        </div>

        {/* KRW */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800/50">
          <div className="flex items-center gap-3">
            <span className="text-xl">🇰🇷</span>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase">KRW</div>
              <div className="text-sm font-medium text-slate-300">South Korea</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-base font-bold text-white font-mono">
              ₩ {krwRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* JPY */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800/50">
          <div className="flex items-center gap-3">
            <span className="text-xl">🇯🇵</span>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase">JPY</div>
              <div className="text-sm font-medium text-slate-300">Japan</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-base font-bold text-white font-mono">
              ¥ {jpyRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            {jpyToKrw100 > 0 && (
              <div className="text-[10px] text-slate-500 font-medium">
                ≈ ₩{jpyToKrw100.toFixed(2)} / 100¥
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/50 text-[10px] text-slate-500 italic text-center">
        Exchange rates via Naver (KEB Hana Bank benchmark).
      </div>
    </div>
  );
};

export default ExchangeRateCard;
