import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Search, Loader2, AlertCircle } from 'lucide-react';
import { usePortfolioStore, INVALID_TICKER_ERROR } from '../../store/usePortfolioStore';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';

const InputForm = () => {
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState<string>('');
  const { addStock, isLoading, error, clearError } = usePortfolioStore();
  const t = useLanguageStore((state) => state.t);

  useEffect(() => {
    if (error !== INVALID_TICKER_ERROR) return;
    toast.error(t.portfolio.invalidTicker);
    clearError();
  }, [error, t.portfolio.invalidTicker, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker || !shares || isLoading) return;
    
    await addStock(ticker.trim(), Number(shares));
    if (!usePortfolioStore.getState().error) {
      setTicker('');
      setShares('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <Plus className="w-5 h-5 text-indigo-400" />
        {t.portfolio.inputTitle}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="ticker" className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">
            {t.portfolio.ticker}
          </label>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              id="ticker"
              type="text"
              value={ticker}
              onChange={(e) => {
                setTicker(e.target.value.toUpperCase());
                if (error) clearError();
              }}
              placeholder="e.g. AAPL, O, TSLA"
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-mono"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="shares" className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">
            {t.portfolio.quantity}
          </label>
          <input
            id="shares"
            type="number"
            step="0.01"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            placeholder="0.00"
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-mono"
            required
            disabled={isLoading}
          />
        </div>

        {error && error !== INVALID_TICKER_ERROR && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 mt-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
          {isLoading ? '...' : t.portfolio.addStock}
        </button>
      </form>
      <p className="mt-auto text-xs text-slate-500 text-center italic mt-6">
        * No data persistence outside localStorage.
      </p>
    </div>
  );
};

export default InputForm;
