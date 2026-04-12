import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ExchangeRates } from '../domain/exchange/types';
import type { StockItem } from '../domain/portfolio/types';
import { FALLBACK_RATES } from '../domain/exchange/constants';
import * as finnhub from '../infrastructure/api/finnhubClient';
import { fetchNaverExchangeRates } from '../infrastructure/api/naverExchangeClient';

const EXCHANGE_CACHE_TTL = 60 * 60 * 1000; // 1 hour

/** Set on store `error` when symbol has no Finnhub profile; show toast in UI. */
export const INVALID_TICKER_ERROR = 'INVALID_TICKER' as const;

interface PortfolioState {
  stocks: StockItem[];
  rates: ExchangeRates;
  ratesLastFetched: number | null;
  isLoading: boolean;
  error: string | null;
}

interface PortfolioActions {
  addStock: (ticker: string, shares: number) => Promise<void>;
  removeStock: (id: string) => void;
  setShares: (id: string, shares: number) => void;
  fetchExchangeRate: (force?: boolean) => Promise<void>;
  clearError: () => void;
}

export type PortfolioStore = PortfolioState & PortfolioActions;

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set, get) => ({
      stocks: [],
      rates: FALLBACK_RATES,
      ratesLastFetched: null,
      isLoading: false,
      error: null,

      addStock: async (ticker, shares) => {
        set({ isLoading: true, error: null });
        const uppercaseTicker = ticker.toUpperCase().trim();
        const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;

        try {
          if (!apiKey) {
             throw new Error("API Key is missing. Please check your .env file.");
          }

          const [profile, quote, financials, exDividendDate] = await Promise.all([
            finnhub.fetchSymbolProfile(uppercaseTicker, apiKey),
            finnhub.fetchQuote(uppercaseTicker, apiKey),
            finnhub.fetchFinancials(uppercaseTicker, apiKey),
            finnhub.fetchDividendHistory(uppercaseTicker, apiKey),
          ]);

          const newStock: StockItem = {
            id: crypto.randomUUID(),
            ticker: uppercaseTicker,
            shares,
            currentPrice: quote.currentPrice,
            dividendPerShare: financials.dividendPerShareAnnual,
            dividendYield: financials.dividendYieldIndicatedAnnual,
            exDividendDate,
            name: profile.name,
          };

          set((state) => ({
            stocks: [...state.stocks, newStock],
            isLoading: false,
          }));
        } catch (err: unknown) {
          console.error("Failed to add stock:", err);
          if (err instanceof finnhub.InvalidTickerError) {
            set({ error: INVALID_TICKER_ERROR, isLoading: false });
            return;
          }
          const message =
            err instanceof Error
              ? err.message
              : "Failed to fetch stock data. Please check the ticker.";
          set({ error: message || "Failed to fetch stock data. Please check the ticker.", isLoading: false });
        }
      },

      removeStock: (id) =>
        set((state) => ({
          stocks: state.stocks.filter((stock) => stock.id !== id),
        })),

      setShares: (id, shares) =>
        set((state) => ({
          stocks: state.stocks.map((stock) =>
            stock.id === id ? { ...stock, shares } : stock
          ),
        })),

      fetchExchangeRate: async (force = false) => {
        const state = get();
        const now = Date.now();

        // Use cached rates if still fresh
        if (
          !force &&
          state.ratesLastFetched !== null &&
          now - state.ratesLastFetched < EXCHANGE_CACHE_TTL
        ) {
          return;
        }

        set({ isLoading: true });
        try {
          const quotes = await fetchNaverExchangeRates();
          if (quotes.KRW != null || quotes.JPY != null) {
            set({
              rates: {
                USD: 1,
                KRW: quotes.KRW ?? get().rates.KRW,
                JPY: quotes.JPY ?? get().rates.JPY,
              },
              ratesLastFetched: Date.now(),
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Failed to fetch exchange rates:', error);
          set({ isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'portfolio-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
