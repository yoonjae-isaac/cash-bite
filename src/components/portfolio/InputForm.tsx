import {
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { toast } from 'sonner';
import { Plus, Search, Loader2, AlertCircle } from 'lucide-react';
import { usePortfolioStore, INVALID_TICKER_ERROR } from '../../store/usePortfolioStore';
import { useLanguageStore } from '../../application/i18n/useLanguageStore';
import { useSymbolCatalog } from '../../application/symbols/useSymbolCatalog';
import { useSymbolSearch } from '../../application/symbols/useSymbolSearch';
import { useDebouncedValue } from '../../application/symbols/useDebouncedValue';
import type { SymbolTuple } from '../../domain/symbols/types';

const SUGGEST_DEBOUNCE_MS = 130;
const TICKER_LISTBOX_ID = 'ticker-symbol-listbox';

type SymbolSuggestNavHandle = {
  navDown: () => void;
  navUp: () => void;
  pickActive: () => void;
};

type SymbolSuggestDropdownProps = {
  suggestions: SymbolTuple[];
  listboxId: string;
  onPick: (symbol: string) => void;
};

const SymbolSuggestDropdown = forwardRef<SymbolSuggestNavHandle, SymbolSuggestDropdownProps>(
  function SymbolSuggestDropdown({ suggestions, listboxId, onPick }, ref) {
    const [hi, setHi] = useState(0);
    const hiRef = useRef(0);
    useLayoutEffect(() => {
      hiRef.current = hi;
    }, [hi]);
    const max = Math.max(0, suggestions.length - 1);
    const active = Math.min(hi, max);

    useImperativeHandle(
      ref,
      () => ({
        navDown: () =>
          setHi((h) => {
            const m = Math.max(0, suggestions.length - 1);
            const c = Math.min(h, m);
            return Math.min(c + 1, m);
          }),
        navUp: () =>
          setHi((h) => {
            const m = Math.max(0, suggestions.length - 1);
            const c = Math.min(h, m);
            return Math.max(c - 1, 0);
          }),
        pickActive: () => {
          const m = Math.max(0, suggestions.length - 1);
          const row = suggestions[Math.min(hiRef.current, m)];
          if (row) onPick(row[0]);
        },
      }),
      [suggestions, onPick]
    );

    return (
      <ul
        id={listboxId}
        role="listbox"
        className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-auto rounded-lg border border-cb-border bg-cb-surface shadow-lg shadow-[var(--cb-shadow-soft)] py-1"
        onMouseDown={(ev) => ev.preventDefault()}
      >
        {suggestions.map((row, i) => (
          <li
            key={`${row[0]}-${i}`}
            id={`ticker-opt-${i}`}
            role="option"
            aria-selected={i === active}
            className={`px-3 py-2 cursor-pointer text-sm font-mono flex flex-col gap-0.5 border-l-2 border-transparent ${
              i === active
                ? 'bg-cb-accent/15 border-cb-accent text-cb-foreground'
                : 'text-cb-foreground hover:bg-cb-muted/10'
            }`}
            onMouseEnter={() => setHi(i)}
            onClick={() => onPick(row[0])}
          >
            <span className="font-semibold">{row[0]}</span>
            <span className="text-xs text-cb-muted font-sans">{row[1]}</span>
          </li>
        ))}
      </ul>
    );
  }
);

const InputForm = () => {
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState<string>('');
  const [listOpen, setListOpen] = useState(false);
  const { addStock, isLoading, error, clearError } = usePortfolioStore();
  const t = useLanguageStore((state) => state.t);

  const { catalog, status, ensureLoaded, suggestEnabled } = useSymbolCatalog();
  const search = useSymbolSearch(catalog);
  const debouncedTicker = useDebouncedValue(ticker, SUGGEST_DEBOUNCE_MS);

  const wrapRef = useRef<HTMLDivElement>(null);
  const suggestNavRef = useRef<SymbolSuggestNavHandle>(null);

  const suggestions = useMemo(() => {
    if (!suggestEnabled || debouncedTicker.trim().length === 0) return [];
    return search(debouncedTicker);
  }, [suggestEnabled, debouncedTicker, search]);

  const showSuggest =
    listOpen && suggestEnabled && debouncedTicker.trim().length > 0 && suggestions.length > 0;

  const selectSuggestion = useCallback((symbol: string) => {
    setTicker(symbol.toUpperCase());
    setListOpen(false);
    if (error) clearError();
  }, [error, clearError]);

  useEffect(() => {
    if (!listOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setListOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [listOpen]);

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
          <div ref={wrapRef} className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cb-muted group-focus-within:text-cb-accent transition-colors" />
            {status === 'loading' && (
              <Loader2
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cb-muted animate-spin pointer-events-none"
                aria-hidden
              />
            )}
            <input
              id="ticker"
              type="text"
              role="combobox"
              aria-expanded={showSuggest}
              aria-controls={TICKER_LISTBOX_ID}
              aria-autocomplete="list"
              value={ticker}
              onFocus={() => {
                ensureLoaded();
                setListOpen(true);
              }}
              onChange={(e) => {
                const v = e.target.value.toUpperCase();
                setTicker(v);
                if (v.length >= 1) ensureLoaded();
                setListOpen(true);
                if (error) clearError();
              }}
              onKeyDown={(e) => {
                if (!showSuggest) {
                  if (e.key === 'Escape') setListOpen(false);
                  return;
                }
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  suggestNavRef.current?.navDown();
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  suggestNavRef.current?.navUp();
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  suggestNavRef.current?.pickActive();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  setListOpen(false);
                }
              }}
              placeholder="e.g. AAPL, O, TSLA"
              className={`w-full theme-field border rounded-lg py-3 pl-10 placeholder:text-cb-muted/45 focus:outline-none focus:ring-2 focus:ring-cb-accent/45 focus:border-cb-accent/60 transition-all font-mono ${
                status === 'loading' ? 'pr-10' : 'pr-4'
              }`}
              required
              disabled={isLoading}
            />
            {showSuggest && (
              <SymbolSuggestDropdown
                key={debouncedTicker}
                ref={suggestNavRef}
                suggestions={suggestions}
                listboxId={TICKER_LISTBOX_ID}
                onPick={selectSuggestion}
              />
            )}
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
