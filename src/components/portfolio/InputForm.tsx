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
      <h2 className="text-xl font-semibold text-cb-foreground mb-6 flex items-center gap-2">
        <Plus className="w-5 h-5 text-cb-accent" />
        {t.portfolio.inputTitle}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="ticker" className="block text-sm font-medium text-cb-muted mb-1.5 ml-1">
            {t.portfolio.ticker}
          </label>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cb-muted group-focus-within:text-cb-accent transition-colors" />
            <input
              id="ticker"
              type="text"
              value={ticker}
              onChange={(e) => {
                setTicker(e.target.value.toUpperCase());
                if (error) clearError();
              }}
              placeholder="e.g. AAPL, O, TSLA"
              className="w-full theme-field border rounded-lg py-3 pl-10 pr-4 placeholder:text-cb-muted/45 focus:outline-none focus:ring-2 focus:ring-cb-accent/45 focus:border-cb-accent/60 transition-all font-mono"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="shares" className="block text-sm font-medium text-cb-muted mb-1.5 ml-1">
            {t.portfolio.quantity}
          </label>
          <input
            id="shares"
            type="number"
            step="0.01"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            placeholder="0.00"
            className="w-full theme-field border rounded-lg py-3 px-4 placeholder:text-cb-muted/45 focus:outline-none focus:ring-2 focus:ring-cb-accent/45 focus:border-cb-accent/60 transition-all font-mono"
            required
            disabled={isLoading}
          />
        </div>

        {error && error !== INVALID_TICKER_ERROR && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-cb-negative/10 border border-cb-negative/25 text-cb-negative text-xs animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-cb-accent text-cb-on-accent font-bold py-3.5 px-6 rounded-lg shadow-lg shadow-amber-500/30 transition-all hover:bg-cb-accent-hover hover:shadow-amber-400/45 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 mt-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
          {isLoading ? '...' : t.portfolio.addStock}
        </button>
      </form>
      <p className="mt-auto text-xs text-cb-muted/80 text-center italic mt-6">
        * No data persistence outside localStorage.
      </p>
    </div>
  );
};

export default InputForm;
